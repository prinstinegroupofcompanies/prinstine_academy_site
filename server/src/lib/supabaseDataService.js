import { createSupabaseServerClient, getSupabaseConfig } from './supabaseClient.js'

/**
 * Developer note:
 * This service is the broader Supabase data layer for the app.
 * It keeps the current controller API surface intact while moving the data access logic to Supabase.
 */

function getClient() {
  const { url, serviceRoleKey } = getSupabaseConfig()
  if (!url || !serviceRoleKey) {
    return null
  }

  return createSupabaseServerClient()
}

async function selectFrom(table, options = {}) {
  const client = getClient()
  if (!client) {
    return { ok: false, reason: 'supabase-not-configured' }
  }

  const { orderBy, ascending = false, filters = {} } = options
  let query = client.from(table).select('*')

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue
    query = query.eq(key, value)
  }

  if (orderBy) {
    query = query.order(orderBy, { ascending })
  }

  const { data, error } = await query
  if (error) {
    return { ok: false, reason: error.message }
  }
  return { ok: true, data: data ?? [] }
}

async function upsertInto(table, payload, matchKey) {
  const client = getClient()
  if (!client) {
    return { ok: false, reason: 'supabase-not-configured' }
  }

  const { data, error } = await client.from(table).upsert(payload, { onConflict: matchKey }).select().single()
  if (error) {
    return { ok: false, reason: error.message }
  }
  return { ok: true, data }
}

async function insertInto(table, payload) {
  const client = getClient()
  if (!client) {
    return { ok: false, reason: 'supabase-not-configured' }
  }

  const { data, error } = await client.from(table).insert(payload).select().single()
  if (error) {
    return { ok: false, reason: error.message }
  }
  return { ok: true, data }
}

async function updateById(table, id, payload) {
  const client = getClient()
  if (!client) {
    return { ok: false, reason: 'supabase-not-configured' }
  }

  const { data, error } = await client.from(table).update(payload).eq('id', id).select().single()
  if (error) {
    return { ok: false, reason: error.message }
  }
  return { ok: true, data }
}

async function deleteById(table, id) {
  const client = getClient()
  if (!client) {
    return { ok: false, reason: 'supabase-not-configured' }
  }

  const { error } = await client.from(table).delete().eq('id', id)
  if (error) {
    return { ok: false, reason: error.message }
  }
  return { ok: true }
}

export const supabaseDataService = {
  selectFrom,
  insertInto,
  upsertInto,
  updateById,
  deleteById,
}
