/**
 * Centralized environment. Load `import 'dotenv/config'` in `index.js` before other local imports.
 */
function normalizeOrigin(rawValue) {
  const value = String(rawValue ?? '').trim()
  if (!value) return ''
  return value.replace(/\/+$/, '')
}

function uniqueOrigins(origins) {
  return [...new Set(origins.map((s) => normalizeOrigin(s)).filter(Boolean))]
}

export function parseCorsOrigin(rawValue = process.env.CORS_ORIGIN) {
  const productionDefaults = [
    'https://prinstineacademy.org',
    'https://www.prinstineacademy.org',
    'https://prinstineacademy.vercel.app',
    'https://prinstine-academy-site.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]

  if (rawValue == null || rawValue === '') {
    return productionDefaults
  }

  const envList = String(rawValue).split(',')
  const list = uniqueOrigins([...envList, ...productionDefaults])
  if (list.length === 0) {
    return productionDefaults
  }
  if (list.length === 1) {
    return list[0]
  }
  return list
}

const port = Number.parseInt(process.env.PORT ?? '3000', 10)
const nodeEnv = process.env.NODE_ENV ?? 'development'

export const env = {
  /**
   * Developer note:
   * The existing Express backend can run with either the local SQLite/Postgres stack
   * or a Supabase-hosted Postgres database. The app now recognizes Supabase env vars.
   */
  port: Number.isFinite(port) ? port : 3000,
  nodeEnv,
  isDev: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  /** `true` = reflect request origin, `string` or `string[]` = allowed origins (cors) */
  corsOrigin: parseCorsOrigin(),
  databaseUrl: process.env.DATABASE_URL || null,
  sqlitePath: process.env.SQLITE_PATH || null,
  jwtSecret: process.env.JWT_SECRET || '',
  /** e.g. `7d`, `24h` — see jsonwebtoken `expiresIn` */
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
}
