import { createClient } from '@supabase/supabase-js'
import { ADMIN_UUID } from './constants'

// Keep the admin verification target identical to the browser login client.
// This prevents a stale/mismatched NEXT_PUBLIC_* value in Vercel server
// runtime from authenticating against a different Supabase project.
const PRODUCTION_SUPABASE_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co'
const PRODUCTION_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mqJp3tqSL1gCjz1xdcgWGQ_mtDFRTmg'

export function getBearerToken(req) {
  const value = req.headers.authorization || ''
  return value.startsWith('Bearer ') ? value.slice(7).trim() : ''
}

export function createAuthClient() {
  return createClient(PRODUCTION_SUPABASE_URL, PRODUCTION_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function verifyAdminToken(token) {
  if (!token) return null
  const { data: { user }, error } = await createAuthClient().auth.getUser(token)
  if (error || !user || user.id !== ADMIN_UUID) return null
  return user
}

\nexport function createAdminDataClient(token) {\n  if (!token) throw new Error('Missing admin access token')\n  return createClient(PRODUCTION_SUPABASE_URL, PRODUCTION_SUPABASE_PUBLISHABLE_KEY, {\n    auth: { persistSession: false, autoRefreshToken: false },\n    global: { headers: { Authorization: 'Bearer ' + token } },\n  })\n}\nexport async function requireAdmin(req) {
  return verifyAdminToken(getBearerToken(req))
}
