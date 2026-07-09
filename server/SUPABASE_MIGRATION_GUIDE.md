# Supabase migration guide

## What changed

This repository now recognizes Supabase-related environment variables and exposes an adapter layer for future migration.

## Why this helps

The existing backend is built around Express and a SQL-style ORM layer. That is still useful for local development and for gradual migration. Supabase can take over the database and auth layer while the public API stays compatible.

## Environment variables to set

In your deployment environment, add:

- `SUPABASE_URL=https://<project-ref>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=<service-role-key>`
- `SUPABASE_DATABASE_URL=postgresql://...`

Optional aliases also work:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

## Migration strategy

1. Keep the Express API routes as-is for now.
2. Point the database layer to Supabase Postgres.
3. Replace the custom auth/session logic with Supabase Auth.
4. Replace the ORM helpers with Supabase client queries or Edge Functions.
5. Remove the old Render-specific assumptions once the Supabase version is stable.

## Developer notes

- The current Express routes remain the public-facing API contract.
- Supabase is introduced as a compatibility layer, not a hard replacement yet.
- This approach lets the team migrate incrementally instead of rewriting the whole application at once.
