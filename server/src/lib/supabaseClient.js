import { createClient } from '@supabase/supabase-js'

/**
 * Developer note:
 * Supabase can power this service in two ways:
 * 1. The database layer can use a Supabase-hosted Postgres connection string.
 * 2. The server can also initialize a Supabase SDK client for future auth/storage features.
 *
 * The current API routes stay unchanged, but they now understand Supabase-backed environment variables.
 */
function readEnv(name) {
  return String(process.env[name] ?? '').trim()
}

export function getSupabaseConfig() {
  const url = readEnv('SUPABASE_URL') || readEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey =
    readEnv('SUPABASE_SERVICE_ROLE_KEY') || readEnv('SUPABASE_SERVICE_KEY')
  const databaseUrl =
    readEnv('SUPABASE_DATABASE_URL') || readEnv('DATABASE_URL')

  return {
    url,
    serviceRoleKey,
    databaseUrl,
    isConfigured: Boolean(url && serviceRoleKey),
    hasDatabaseUrl: Boolean(databaseUrl),
  }
}

export function createSupabaseServerClient() {
  const { url, serviceRoleKey, isConfigured } = getSupabaseConfig()
  if (!isConfigured) {
    return null
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export function getSupabaseStatus() {
  const { isConfigured, hasDatabaseUrl, url } = getSupabaseConfig()

  return {
    configured: isConfigured,
    databaseConfigured: hasDatabaseUrl,
    url: url || null,
  }
}
