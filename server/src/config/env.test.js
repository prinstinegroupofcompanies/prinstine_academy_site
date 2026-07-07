import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCorsOrigin } from './env.js'

test('falls back to built-in origins when CORS_ORIGIN is not set', () => {
  const origins = parseCorsOrigin('')
  assert.ok(Array.isArray(origins), 'expected a list of origins')
  assert.ok(origins.includes('https://prinstineacademy.org'))
  assert.ok(origins.includes('https://www.prinstineacademy.org'))
  assert.ok(origins.includes('http://localhost:5173'))
})
