import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { env } from './config/env.js'
import { notFoundHandler } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiRouter } from './routes/index.js'
import { siteMaintenanceMiddleware } from './middleware/siteMaintenance.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const serverRoot = join(__dirname, '..')

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  if (env.isProduction) {
    app.set('trust proxy', 1)
  }
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  )
  app.use(express.json({ limit: '1mb' }))

  app.get('/', (req, res, next) => {
    if (
      process.env.SITE_LIVE !== 'true' &&
      process.env.VITE_SITE_LIVE !== 'true' &&
      process.env.PRINSTINE_SITE_LIVE !== 'true'
    ) {
      return siteMaintenanceMiddleware(req, res, next)
    }
    return res.json({ ok: true, service: 'prinstine-academy-api' })
  })

  app.use('/uploads', express.static(join(serverRoot, 'uploads')))

  app.use('/api', siteMaintenanceMiddleware, apiRouter)
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
