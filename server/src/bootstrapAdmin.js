import bcrypt from 'bcryptjs'
import { User } from '../db/orm.js'
import { supabaseDataService } from './lib/supabaseDataService.js'

function getLocalUserStore() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    ? null
    : User
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
