import test from 'node:test'
import assert from 'node:assert/strict'
import { siteMaintenanceMiddleware } from './siteMaintenance.js'

test('allows local development requests through maintenance middleware', () => {
  process.env.NODE_ENV = 'development'
  delete process.env.SITE_LIVE
  delete process.env.VITE_SITE_LIVE
  delete process.env.PRINSTINE_SITE_LIVE

  let nextCalled = false
  const req = {
    path: '/api/auth/login',
    on() {},
  }
  const res = {
    setHeader() {},
    status() { return this },
    json() { return this },
  }

  siteMaintenanceMiddleware(req, res, () => {
    nextCalled = true
  })

  assert.equal(nextCalled, true)
})
