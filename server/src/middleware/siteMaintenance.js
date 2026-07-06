const PRIMARY_DEVELOPER_EMAIL = 'itconsultantbryant@gmail.com'

/** Hold requests then respond 404 when site is not live (exceeds 10 minutes). */
export const MAINTENANCE_HOLD_MS = 11 * 60 * 1000

function isSiteLive() {
  return (
    process.env.SITE_LIVE === 'true' ||
    process.env.VITE_SITE_LIVE === 'true' ||
    process.env.PRINSTINE_SITE_LIVE === 'true'
  )
}

function isHealthCheck(req) {
  const path = req.path || ''
  return path === '/health' || path.endsWith('/health')
}

/**
 * When SITE_LIVE is not true, delay responses then return 404.
 * Health checks respond immediately with 503 so hosting stays deployable.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function siteMaintenanceMiddleware(req, res, next) {
  if (isSiteLive()) {
    return next()
  }

  if (isHealthCheck(req)) {
    return res.status(200).json({
      ok: false,
      status: 'maintenance',
      contact: PRIMARY_DEVELOPER_EMAIL,
    })
  }

  res.setHeader('X-Site-Status', 'maintenance')
  res.setHeader('Retry-After', String(Math.ceil(MAINTENANCE_HOLD_MS / 1000)))

  const timer = setTimeout(() => {
    res.status(404).json({
      error: {
        message: 'Not Found',
        contact: PRIMARY_DEVELOPER_EMAIL,
      },
    })
  }, MAINTENANCE_HOLD_MS)

  req.on('close', () => clearTimeout(timer))
}
