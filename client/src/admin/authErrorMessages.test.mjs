import test from 'node:test'
import assert from 'node:assert/strict'
import { getAdminAuthErrorMessage } from './authErrorMessages.js'

test('uses a local-development guidance message for network errors in dev', () => {
  const message = getAdminAuthErrorMessage({ message: 'Network Error' }, { isDev: true })
  assert.match(message, /local backend/i)
  assert.match(message, /localhost:3000/i)
})

test('uses deployment-focused guidance for network errors in production', () => {
  const message = getAdminAuthErrorMessage({ message: 'Network Error' }, { isDev: false })
  assert.match(message, /deployed API/i)
  assert.match(message, /\/api/i)
})
