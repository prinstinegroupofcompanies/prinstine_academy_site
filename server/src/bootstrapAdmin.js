import bcrypt from 'bcryptjs'
import { User } from '../db/orm.js'
import { createSupabaseServerClient } from './lib/supabaseClient.js'
import { supabaseDataService } from './lib/supabaseDataService.js'

function getLocalUserStore() {
  const hasSupabaseConfig = Boolean(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
  return hasSupabaseConfig ? null : User
}

async function ensureSupabaseAuthAdmin(email, password, role = 'admin') {
  const client = createSupabaseServerClient()
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

export async function bootstrapAdmin({
  email,
  password,
  role = 'admin',
} = {}) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()
  const normalizedPassword = String(password ?? '').trim()

  if (!normalizedEmail || !normalizedPassword) {
    return { created: false, reason: 'missing-credentials' }
  }

  const passwordHash = await bcrypt.hash(normalizedPassword, 10)
  const userStore = getLocalUserStore()

  const supabaseAuthResult = await ensureSupabaseAuthAdmin(
    normalizedEmail,
    normalizedPassword,
    role,
  )
  if (supabaseAuthResult.ok) {
    return {
      created: true,
      updated: false,
      email: normalizedEmail,
      role,
      user: supabaseAuthResult.user,
    }
  }
  if (supabaseAuthResult.reason === 'already-registered') {
    return { created: false, updated: true, email: normalizedEmail, role }
  }

  if (userStore) {
    const existing = await userStore.findByEmail(normalizedEmail)
    if (existing) {
      await userStore.updatePasswordAndRole(existing.id, passwordHash, role)
      return { created: false, updated: true, email: normalizedEmail, role }
    }

    await userStore.create({ email: normalizedEmail, password: passwordHash, role })
    return {
      created: true,
      updated: false,
      email: normalizedEmail,
      role,
    }
  }

  const existingResult = await supabaseDataService.selectFrom('users', { filters: { email: normalizedEmail } })
  const existing = existingResult.data?.[0]

  if (existing) {
    await supabaseDataService.updateById('users', existing.id, {
      password: passwordHash,
      role,
    })
    return { created: false, updated: true, email: normalizedEmail, role }
  }

  const createdResult = await supabaseDataService.insertInto('users', {
    email: normalizedEmail,
    password: passwordHash,
    role,
  })

  return {
    created: true,
    updated: false,
    email: normalizedEmail,
    role,
    user: createdResult.data,
  }
}
