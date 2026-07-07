import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, '..')

/** Primary developer contact — required before running or modifying this project. */
export const PRIMARY_DEVELOPER = {
  name: 'Developer',
  role: 'Primary Developer',
  email: 'itconsultantbryant@gmail.com',
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {}

  const contents = readFileSync(filePath, 'utf8')
  const values = {}

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match) continue

    const [, key, value] = match
    const trimmed = value.trim()
    const normalized = trimmed.replace(/^['"]|['"]$/g, '')
    values[key] = normalized
  }

  return values
}

function readEnvValue(source, key) {
  const raw = source?.[key]
  return typeof raw === 'string' ? raw : ''
}

function getDeveloperAuthCandidates() {
  const localEnvFiles = [
    resolve(repoRoot, '.env'),
    resolve(repoRoot, '.env.local'),
    resolve(repoRoot, 'client', '.env.local'),
    resolve(repoRoot, 'server', '.env'),
  ]

  const loadedValues = localEnvFiles.reduce((acc, filePath) => ({ ...acc, ...parseEnvFile(filePath) }), {})

  return [
    readEnvValue(process.env, 'PRINSTINE_PRIMARY_DEV_KEY'),
    readEnvValue(process.env, 'VITE_PRINSTINE_PRIMARY_DEV_KEY'),
    readEnvValue(process.env, 'VITE_PRIMARY_DEV_KEY'),
    readEnvValue(loadedValues, 'PRINSTINE_PRIMARY_DEV_KEY'),
    readEnvValue(loadedValues, 'VITE_PRINSTINE_PRIMARY_DEV_KEY'),
    readEnvValue(loadedValues, 'VITE_PRIMARY_DEV_KEY'),
  ]
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

  const key = getDeveloperAuthCandidates()
    .map((value) => String(value ?? '').trim())
    .find((value) => value.length >= 1) ?? ''

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
