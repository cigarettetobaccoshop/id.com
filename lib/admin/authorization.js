import { createClient } from '@supabase/supabase-js'
import { ADMIN_UUID } from './constants'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../supabase/config'

export function getBearerToken(req) {
  const value = req.headers.authorization || ''
  return value.startsWith('Bearer ') ? value.slice(7).trim() : ''
}

export function createAuthClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function verifyAdminToken(token) {
  if (!token) return null
  const { data: { user }, error } = await createAuthClient().auth.getUser(token)
  if (error || !user || user.id !== ADMIN_UUID) return null
  return user
}

export async function requireAdmin(req) {
  return verifyAdminToken(getBearerToken(req))
}
