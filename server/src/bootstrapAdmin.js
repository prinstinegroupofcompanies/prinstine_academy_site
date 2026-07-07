import bcrypt from 'bcryptjs'
import { User } from '../db/orm.js'

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
  const existing = await User.findByEmail(normalizedEmail)

  if (existing) {
    await User.updatePasswordAndRole(existing.id, passwordHash, role)
    return { created: false, updated: true, email: normalizedEmail, role }
  }

  const created = await User.create({
    email: normalizedEmail,
    password: passwordHash,
    role,
  })

  return { created: true, updated: false, email: normalizedEmail, role, user: created }
}
