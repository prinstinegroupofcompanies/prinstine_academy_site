import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { validateProductionBoot } from './config/validateProduction.js'
import { connectDatabase, getDialect } from '../db/connection.js'
import { User } from '../db/orm.js'

async function ensureAdminAccess() {
  const defaultEmail = 'admin@prinstineacademy.org'
  const defaultPassword = 'Admin@PrinstineAcademy2026'
  const emailFromEnv = (process.env.ADMIN_EMAIL ?? '').trim()
  const passwordFromEnv = process.env.ADMIN_PASSWORD ?? ''
  const explicitCredentials =
    Boolean(emailFromEnv) && Boolean(String(passwordFromEnv).trim())

  const email = (emailFromEnv || defaultEmail).trim().toLowerCase()
  const password = explicitCredentials
    ? String(passwordFromEnv)
    : passwordFromEnv || defaultPassword

  if (env.isProduction && !explicitCredentials) {
    console.warn(
      '[boot] Set ADMIN_EMAIL and ADMIN_PASSWORD on Render so the admin account matches your login credentials.',
    )
  }

  const hash = await bcrypt.hash(password, 10)
  const existing = await User.findByEmail(email)

  if (existing) {
    // Keep production logins in sync when Render env credentials are set.
    if (explicitCredentials || !env.isProduction) {
      await User.updatePasswordAndRole(existing.id, hash, 'admin')
      console.log(`[boot] Admin credentials synced for ${email}`)
    }
    return
  }

  await User.create({ email, password: hash, role: 'admin' })
  console.log(`[boot] Admin user created for ${email}`)
}

validateProductionBoot()
const app = createApp()
await connectDatabase()
await ensureAdminAccess()
const corsOrigins =
  env.corsOrigin === true
    ? ['* (reflect request origin)']
    : Array.isArray(env.corsOrigin)
      ? env.corsOrigin
      : [env.corsOrigin]
console.log(
  `[boot] env=${env.nodeEnv} db=${getDialect()} cors=${corsOrigins.join(', ')}`,
)
app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`)
})
