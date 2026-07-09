/**
 * Injects the live Render API URL into vercel.json before `vite build`.
 * Set in Vercel → Environment Variables (Production + Preview):
 *   RENDER_API_URL=https://your-service.onrender.com
 * or reuse:
 *   VITE_API_URL=https://your-service.onrender.com
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const vercelPaths = [
  join(__dirname, '..', 'vercel.json'),
  join(__dirname, '..', '..', 'vercel.json'),
]

function normalizeApiOrigin(value) {
  const trimmed = String(value || '').trim().replace(/\/+$/, '')
  if (!trimmed) return ''

  const supabaseDashboardMatch = trimmed.match(
    /^https?:\/\/supabase\.com\/dashboard\/(?:project|projects)\/([^/?#]+)(?:[/?#].*)?$/i
  )
  if (supabaseDashboardMatch) {
    return `https://${supabaseDashboardMatch[1]}.supabase.co`
  }

  const supabaseProjectMatch = trimmed.match(/^https?:\/\/([^.]+)\.supabase\.co(?:[/?#].*)?$/i)
  if (supabaseProjectMatch) {
    return `https://${supabaseProjectMatch[1]}.supabase.co`
  }

  return trimmed.replace(/\/api$/i, '')
}

const raw =
  (process.env.RENDER_API_URL || process.env.VITE_API_URL || process.env.VERCEL_API_URL || '').trim()
const apiOrigin = normalizeApiOrigin(raw)

for (const vercelPath of vercelPaths) {
  if (!existsSync(vercelPath)) {
    continue
  }

  const config = JSON.parse(readFileSync(vercelPath, 'utf8'))
  const rewrites = Array.isArray(config.rewrites) ? [...config.rewrites] : []

  const apiRewrite = apiOrigin
    ? {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      }
    : null

  const withoutApi = rewrites.filter((r) => r?.source !== '/api/:path*')
  const spaFallback = withoutApi.find((r) => r?.source === '/(.*)') || {
    source: '/(.*)',
    destination: '/index.html',
  }
  const other = withoutApi.filter((r) => r?.source !== '/(.*)')

  config.rewrites = [
    ...(apiRewrite ? [apiRewrite] : []),
    ...other,
    spaFallback,
  ]
  writeFileSync(vercelPath, `${JSON.stringify(config, null, 2)}\n`)
  console.log(
    `[vercel] wrote ${vercelPath} → ${apiOrigin ? `${apiOrigin}/api/:path*` : 'no API rewrite'}`
  )
}
