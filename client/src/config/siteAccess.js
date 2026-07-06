/** Minimum loading time before showing unavailable (must exceed 10 minutes). */
export const MAINTENANCE_LOAD_MS = 11 * 60 * 1000

export function isSiteLive() {
  return import.meta.env.VITE_SITE_LIVE === 'true'
}

export const PRIMARY_DEVELOPER = {
  name: 'Developer',
  role: 'Primary Developer',
  email: 'itconsultantbryant@gmail.com',
}
