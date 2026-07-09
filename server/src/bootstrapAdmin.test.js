import test from 'node:test'
import assert from 'node:assert/strict'
import { connectDatabase, closeDatabase } from '../db/connection.js'
import { User } from '../db/orm.js'
import { bootstrapAdmin } from './bootstrapAdmin.js'

test('bootstrapAdmin creates a local admin user when Supabase is not configured', async () => {
  process.env.SUPABASE_URL = ''
  process.env.SUPABASE_SERVICE_ROLE_KEY = ''
  process.env.NEXT_PUBLIC_SUPABASE_URL = ''

  await connectDatabase()
  const email = `bootstrap-test-${Date.now()}@example.com`
  const password = 'TestPassword123!'

  const result = await bootstrapAdmin({ email, password, role: 'admin' })
  assert.equal(result.created, true)

  const user = await User.findByEmail(email)
  assert.ok(user)
  assert.equal(user.email, email)
  assert.equal(user.role, 'admin')

  await closeDatabase()
})
