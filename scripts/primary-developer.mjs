/** Primary developer contact — required before running or modifying this project. */
export const PRIMARY_DEVELOPER = {
  name: 'Developer',
  role: 'Primary Developer',
  email: 'itconsultantbryant@gmail.com',
}

export function isSiteLiveEnv() {
  const live =
    process.env.SITE_LIVE === 'true' ||
    process.env.VITE_SITE_LIVE === 'true' ||
    process.env.PRINSTINE_SITE_LIVE === 'true'
  return live
}

export function isPrimaryDeveloperAuthorized() {
  if (isSiteLiveEnv()) return true
  const key = String(process.env.PRINSTINE_PRIMARY_DEV_KEY ?? '').trim()
  return key.length >= 16
}

export function printUnauthorizedMessage(stream = console.error) {
  stream(`

================================================================================
  STOP — UNAUTHORIZED ACCESS

  This project is restricted. Do not install, run, build, or modify it without
  written approval from the Primary Developer.

  Primary Developer: ${PRIMARY_DEVELOPER.name} (${PRIMARY_DEVELOPER.role})
  Contact: ${PRIMARY_DEVELOPER.email}

  Request authorization before proceeding. Without approval, the public site
  must remain offline (extended loading, then unavailable).
================================================================================

`)
}
