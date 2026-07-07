import { env } from './env.js'

const MIN_JWT_SECRET_LEN = 32

/**
 * Fail fast on misconfiguration when NODE_ENV=production.
 * Call after env is loaded and before listening.
 */
export function validateProductionBoot() {
  if (!env.isProduction) {
    return
  }
  const jwt = (process.env.JWT_SECRET ?? '').trim()
  if (jwt.length < MIN_JWT_SECRET_LEN) {
    throw new Error(
      `Production requires JWT_SECRET of at least ${MIN_JWT_SECRET_LEN} characters (set in your host's environment)`,
    )
  }
  const cors = (process.env.CORS_ORIGIN ?? '').trim()
  if (!cors) {
    console.warn(
      '[boot] CORS_ORIGIN not set; using default-safe CORS origins for the frontend.',
    )
  }
}
