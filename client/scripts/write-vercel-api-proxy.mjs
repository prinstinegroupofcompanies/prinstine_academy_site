/**
 * Injects the live Render API URL into vercel.json before `vite build`.
 * Set in Vercel → Environment Variables (Production + Preview):
 *   RENDER_API_URL=https://your-service.onrender.com
 * or reuse:
 *   VITE_API_URL=https://your-service.onrender.com
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const vercelPath = join(__dirname, '..', 'vercel.json')

const raw =
  (process.env.RENDER_API_URL || process.env.VITE_API_URL || '').trim() ||
  'https://prinstine-academy-api.onrender.com'
const apiOrigin = raw.replace(/\/+$/, '').replace(/\/api$/i, '')

const config = JSON.parse(readFileSync(vercelPath, 'utf8'))
const rewrites = Array.isArray(config.rewrites) ? [...config.rewrites] : []

const apiRewrite = {
  source: '/api/:path*',
  destination: `${apiOrigin}/api/:path*`,
}

const withoutApi = rewrites.filter((r) => r?.source !== '/api/:path*')
const spaFallback = withoutApi.find((r) => r?.source === '/(.*)') || {
  source: '/(.*)',
  destination: '/index.html',
}
const other = withoutApi.filter((r) => r?.source !== '/(.*)')

config.rewrites = [apiRewrite, ...other, spaFallback]

writeFileSync(vercelPath, `${JSON.stringify(config, null, 2)}\n`)
console.log(`[vercel] API proxy → ${apiOrigin}/api/:path*`)
