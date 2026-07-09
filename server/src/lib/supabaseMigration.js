import { getSupabaseStatus } from './supabaseClient.js'

/**
 * Developer note:
 * This module is an adapter layer that makes Supabase migration explicit.
 * It does not replace the Express routes yet; instead it exposes a small compatibility layer
 * so the codebase can gradually move from the local/Render SQL model to Supabase.
 */
export function getSupabaseMigrationNotes() {
  const status = getSupabaseStatus()
  return {
    backendMode: status.configured ? 'supabase' : 'local-express',
    status,
    notes: [
      'Supabase can host the Postgres database and auth services for this app.',
      'The current Express server remains compatible and can use Supabase env vars when present.',
      'Next step: move the ORM-backed CRUD helpers to Supabase client calls or Edge Functions.',
    ],
  }
}
