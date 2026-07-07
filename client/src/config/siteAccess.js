/** Minimum loading time before showing unavailable (must exceed 10 minutes). */
export const MAINTENANCE_LOAD_MS = 11 * 60 * 1000

export const PRIMARY_DEVELOPER = {
  name: 'Developer',
  role: 'Primary Developer',
  email: 'itconsultantbryant@gmail.com',
}

function readEnvValue(env, key) {
  if (!env || typeof env !== 'object') return ''
  const raw = env[key]
  return typeof raw === 'string' ? raw : ''
}

export function isSiteLive(env = import.meta.env ?? {}) {
  return ['VITE_SITE_LIVE', 'SITE_LIVE', 'PRINSTINE_SITE_LIVE'].some(
    (key) => readEnvValue(env, key) === 'true',
  )
}

export function canBypassMaintenance(env = import.meta.env ?? {}) {
  if (isSiteLive(env)) return true
  if (env?.DEV !== true) return false

  const key = [
    readEnvValue(env, 'VITE_PRINSTINE_PRIMARY_DEV_KEY'),
    readEnvValue(env, 'PRINSTINE_PRIMARY_DEV_KEY'),
    readEnvValue(env, 'VITE_PRIMARY_DEV_KEY'),
  ].find(Boolean) ?? ''

  return key.trim().length >= 16
}
