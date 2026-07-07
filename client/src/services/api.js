import axios from 'axios'

function normalizeApiOrigin(value) {
  const trimmed = String(value || '').trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/api$/i, '')
  }
  return trimmed
}

const configuredBase = normalizeApiOrigin(import.meta.env.VITE_API_URL)

/**
 * API base URL:
 * - Leave `VITE_API_URL` unset in production to call `/api` on the same origin (Vercel proxy → Render).
 * - Set `VITE_API_URL` to your Render origin (no trailing slash, no `/api` suffix) for direct calls.
 */
const baseURL =
  configuredBase ||
  (import.meta.env.DEV ? normalizeApiOrigin('http://localhost:3000') : '')

// Short default for read-heavy calls; mutations (registration, subscribe) use per-request timeouts.
const configuredTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS)
const requestTimeoutMs =
  Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : 10000

const authenticatedTimeoutConfigured = Number(
  import.meta.env.VITE_AUTHENTICATED_API_TIMEOUT_MS
)
const authenticatedTimeoutMs =
  Number.isFinite(authenticatedTimeoutConfigured) && authenticatedTimeoutConfigured > 0
    ? authenticatedTimeoutConfigured
    : 30000

export const api = axios.create({
  baseURL,
  timeout: requestTimeoutMs,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

function minAuthTimeoutMs(config) {
  const path = String(config.url || '').split('?')[0]
  if (!/\/api\/auth\//.test(path)) return null
  const n = Number(import.meta.env.VITE_AUTH_API_TIMEOUT_MS)
  return Number.isFinite(n) && n > 0 ? n : 30000
}

function minPublicMutationTimeoutMs(config) {
  const method = (config.method || 'get').toLowerCase()
  if (method !== 'post') return null
  const path = String(config.url || '').split('?')[0]
  if (/\/api\/registrations\/?$/.test(path)) {
    const n = Number(import.meta.env.VITE_REGISTRATION_API_TIMEOUT_MS)
    return Number.isFinite(n) && n > 0 ? n : 120000
  }
  if (/\/api\/subscribers\/?$/.test(path)) {
    const n = Number(import.meta.env.VITE_SUBSCRIBE_API_TIMEOUT_MS)
    return Number.isFinite(n) && n > 0 ? n : 90000
  }
  return null
}

api.interceptors.request.use((config) => {
  const authMin = minAuthTimeoutMs(config)
  if (authMin != null) {
    const cur = Number(config.timeout)
    config.timeout = Math.max(Number.isFinite(cur) ? cur : 0, authMin)
  }

  const pubMin = minPublicMutationTimeoutMs(config)
  if (pubMin != null) {
    const cur = Number(config.timeout)
    config.timeout = Math.max(Number.isFinite(cur) ? cur : 0, pubMin)
  }

  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // Admin dashboard loads many parallel reads; keep short default for anonymous traffic only.
    const explicit = config.timeout
    const effective = Number.isFinite(explicit) ? explicit : requestTimeoutMs
    config.timeout = Math.max(effective, authenticatedTimeoutMs)
  }
  return config
})

export const setAuthToken = (token) => {
  if (!token) {
    localStorage.removeItem('auth_token')
    return
  }
  localStorage.setItem('auth_token', token)
}

export default api
