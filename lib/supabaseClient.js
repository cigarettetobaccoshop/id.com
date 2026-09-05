import { createClient } from '@supabase/supabase-js'

// R2 NUSANTARA production catalog source of truth.
// This client intentionally uses only the public Supabase URL and publishable
// key. Never place a service-role key in this module or any NEXT_PUBLIC_* var.
const SUPABASE_URL = 'https://zgsbtexngystdmakqjyi.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_7wqbX7wUVFJZqinPyy8XLQ_SimByBEo'

if (!/^https:\/\/[^\s/]+\.supabase\.co(?:\/.*)?$/.test(SUPABASE_URL)) {
  throw new Error('Invalid Supabase URL')
}

if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.toLowerCase().includes('service_role')) {
  throw new Error('Supabase publishable key must not contain a service_role key')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export default supabase
