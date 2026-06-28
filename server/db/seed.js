import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDatabase, closeDatabase } from './connection.js'
import { User } from './orm.js'

const emailRaw = process.env.ADMIN_EMAIL || 'admin@prinstineacademy.org'
const password = process.env.ADMIN_PASSWORD || 'Admin@PrinstineAcademy2026'
const email = emailRaw.trim().toLowerCase()

async function main() {
  await connectDatabase()
  const hash = await bcrypt.hash(password, 10)
  const existing = await User.findByEmail(email)
  if (existing) {
    await User.updatePasswordAndRole(existing.id, hash, 'admin')
    console.log('Admin credentials updated for:', email)
    await closeDatabase()
    return
  }
  await User.create({ email, password: hash, role: 'admin' })
  console.log('Seeded admin user:', email)
  await closeDatabase()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
