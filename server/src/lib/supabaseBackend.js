import { createSupabaseServerClient, getSupabaseConfig } from './supabaseClient.js'
import { signAccessToken } from './jwt.js'
import { User, Subscriber, Registration } from '../../db/orm.js'

/**
 * Developer note:
 * This adapter is the bridge between the existing Express routes and a Supabase-hosted backend.
 *
 * Current behavior:
 * - If Supabase is configured, the auth, registration, and subscriber flows try Supabase first.
 * - If Supabase is unavailable or the tables are not present, the code falls back to the existing
 *   SQLite/Postgres ORM layer so local development and older deployments keep working.
 *
 * This keeps the public API stable while the team gradually moves the data layer to Supabase.
 */

function isAdminEmail(email) {
  const adminEmail = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
  return Boolean(adminEmail) && email === adminEmail
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function mapSupabaseRegistration(row) {
  if (!row) return null
  return {
    id: row.id,
    fullName: row.full_name ?? row.fullName ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    courseId: row.course_id ?? row.courseId ?? null,
    courseTitle: row.course_title ?? row.courseTitle ?? null,
    learningMode: row.learning_mode ?? row.learningMode ?? 'in-person',
    highestEducation: row.highest_education ?? row.highestEducation ?? null,
    address: row.address ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at ?? row.createdAt ?? null,
  }
}

function mapSupabaseSubscriber(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name ?? null,
    email: row.email ?? null,
    createdAt: row.created_at ?? row.createdAt ?? null,
  }
}

function createSupabaseClientOrNull() {
  const { url, anonKey, serviceRoleKey } = getSupabaseConfig()
  const key = anonKey || serviceRoleKey
  if (!url || !key) {
    return null
  }
  return createSupabaseServerClient()
}

async function ensureSupabaseAuthUser(email, password, role = 'user') {
  const client = createSupabaseClientOrNull()
  if (!client) {
    return { ok: false, reason: 'supabase-not-configured' }
  }

  try {
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, is_admin: role === 'admin' },
    })

    if (error) {
      const message = String(error.message || '').toLowerCase()
      if (message.includes('already') || message.includes('registered')) {
        return { ok: false, reason: 'already-registered' }
      }
      return { ok: false, reason: error.message }
    }

    return { ok: true, user: data?.user ?? null }
  } catch (error) {
    return { ok: false, reason: String(error?.message || error) }
  }
}

async function insertIntoSupabase(table, payload) {
  const client = createSupabaseClientOrNull()
  if (!client) {
    return { ok: false, reason: 'supabase-not-configured' }
  }

  try {
    const { data, error } = await client.from(table).insert(payload).select().single()
    if (error) {
      return { ok: false, reason: error.message }
    }
    return { ok: true, data }
  } catch (error) {
    return { ok: false, reason: String(error?.message || error) }
  }
}

async function selectFromSupabase(table) {
  const client = createSupabaseClientOrNull()
  if (!client) {
    return { ok: false, reason: 'supabase-not-configured' }
  }

  try {
    const { data, error } = await client.from(table).select('*').order('id', { ascending: false })
    if (error) {
      return { ok: false, reason: error.message }
    }
    return { ok: true, data: data ?? [] }
  } catch (error) {
    return { ok: false, reason: String(error?.message || error) }
  }
}

export async function authenticateUser(email, password) {
  const normalizedEmail = normalizeEmail(email)
  const client = createSupabaseClientOrNull()

  if (client) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (!error && data?.user && data?.session) {
        const role = isAdminEmail(normalizedEmail) ? 'admin' : 'user'
        const token = signAccessToken({
          sub: data.user.id,
          email: normalizedEmail,
          role,
        })

        return {
          token,
          user: {
            id: data.user.id,
            email: normalizedEmail,
            role,
          },
        }
      }

      if (error) {
        const reason = error.message || 'Invalid email or password'
        const adminEmail = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
        const adminPassword = String(process.env.ADMIN_PASSWORD ?? '').trim()

        if (
          normalizedEmail === adminEmail &&
          adminPassword &&
          /invalid login credentials|user not found|not found/i.test(reason)
        ) {
          const created = await ensureSupabaseAuthUser(normalizedEmail, adminPassword, 'admin')
          if (created.ok) {
            const retry = await client.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            })
            if (!retry.error && retry.data?.user && retry.data?.session) {
              const role = 'admin'
              const token = signAccessToken({
                sub: retry.data.user.id,
                email: normalizedEmail,
                role,
              })

              return {
                token,
                user: {
                  id: retry.data.user.id,
                  email: normalizedEmail,
                  role,
                },
              }
            }
          }
        }

        if (reason.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        }
        throw new Error(reason)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      if (message === 'Invalid email or password') {
        throw error
      }
      throw new Error(message)
    }
  }

  // Fallback path: keep the current app working even when Supabase is not configured.
  const user = await User.findByEmail(normalizedEmail)
  if (!user || typeof user.password !== 'string') {
    throw new Error('Invalid email or password')
  }

  const bcrypt = await import('bcryptjs')
  const ok = await bcrypt.default.compare(password, user.password)
  if (!ok) {
    throw new Error('Invalid email or password')
  }

  const role = String(user.role || 'user')
  const token = signAccessToken({
    sub: String(user.id),
    email: normalizedEmail,
    role,
  })

  return {
    token,
    user: {
      id: user.id,
      email: normalizedEmail,
      role,
    },
  }
}

export async function createSubscriber(payload) {
  const row = {
    name: payload.name,
    email: normalizeEmail(payload.email),
  }

  const supabaseResult = await insertIntoSupabase('subscribers', row)
  if (supabaseResult.ok) {
    return mapSupabaseSubscriber(supabaseResult.data)
  }

  // Fallback: preserve existing SQLite/Postgres behavior when Supabase is unavailable.
  return Subscriber.create({ name: row.name, email: row.email })
}

export async function listSubscribers() {
  const supabaseResult = await selectFromSupabase('subscribers')
  if (supabaseResult.ok) {
    return (supabaseResult.data || []).map(mapSupabaseSubscriber)
  }

  return Subscriber.list()
}

export async function createRegistration(payload) {
  const row = {
    full_name: payload.fullName,
    email: normalizeEmail(payload.email),
    phone: payload.phone,
    course_id: payload.courseId,
    course_title: payload.courseTitle,
    learning_mode: payload.learningMode,
    highest_education: payload.highestEducation ?? null,
    address: payload.address ?? null,
    notes: payload.notes ?? null,
  }

  const supabaseResult = await insertIntoSupabase('registrations', row)
  if (supabaseResult.ok) {
    return mapSupabaseRegistration(supabaseResult.data)
  }

  return Registration.create({
    fullName: payload.fullName,
    email: normalizeEmail(payload.email),
    phone: payload.phone,
    courseId: payload.courseId,
    courseTitle: payload.courseTitle,
    learningMode: payload.learningMode,
    highestEducation: payload.highestEducation ?? null,
    address: payload.address ?? null,
    notes: payload.notes ?? null,
  })
}

export async function listRegistrations() {
  const supabaseResult = await selectFromSupabase('registrations')
  if (supabaseResult.ok) {
    return (supabaseResult.data || []).map(mapSupabaseRegistration)
  }

  return Registration.list()
}
