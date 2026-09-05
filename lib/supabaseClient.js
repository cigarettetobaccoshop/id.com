import { createClient } from '@supabase/supabase-js'

// Production catalog source of truth: Supabase project zgsbtexngystdmakqjyi.
// The Vercel environment was pointing at a different Supabase project whose
// schema does not contain the `R2 NUSANTARA` catalog table. Keep the public
// publishable key here as a safe fallback so the catalog cannot silently switch
// databases because of a stale/mismatched deployment variable.
const PRODUCTION_SUPABASE_URL = 'https://zgsbtexngystdmakqjyi.supabase.co'
const PRODUCTION_SUPABASE_KEY = 'sb_publishable_7wqbX7wUVFJZqinPyy8XLQ_SimByBEo'

const supabaseUrl = PRODUCTION_SUPABASE_URL
const supabaseAnonKey = PRODUCTION_SUPABASE_KEY

if (!/^https:\/\/[^\s/]+\.supabase\.co(?:\/.*)?$/.test(supabaseUrl)) {
  throw new Error('Invalid Supabase URL')
}

if (supabaseAnonKey.toLowerCase().includes('service_role')) {
  throw new Error('Supabase publishable key must not contain a service_role key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export default supabase
