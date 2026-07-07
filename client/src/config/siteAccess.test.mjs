import test from 'node:test'
import assert from 'node:assert/strict'
import { canBypassMaintenance, isSiteLive } from './siteAccess.js'

test('maintenance is locked by default', () => {
  assert.equal(isSiteLive({}), false)
  assert.equal(canBypassMaintenance({}), false)
})

test('site goes live when the public flag is enabled', () => {
  assert.equal(isSiteLive({ VITE_SITE_LIVE: 'true' }), true)
  assert.equal(canBypassMaintenance({ VITE_SITE_LIVE: 'true' }), true)
})

test('local development can bypass maintenance with primary developer authorization', () => {
  assert.equal(canBypassMaintenance({ DEV: true, PRINSTINE_PRIMARY_DEV_KEY: '1234567890123456' }), true)
  assert.equal(canBypassMaintenance({ DEV: true, PRINSTINE_PRIMARY_DEV_KEY: 'short' }), false)
})
