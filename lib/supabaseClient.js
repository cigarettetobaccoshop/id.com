import { createClient } from '@supabase/supabase-js'

// Production catalog source of truth: Supabase project zgsbtexngystdmakqjyi.
// Prefer Vercel environment variables, with a safe public fallback so a stale
// or missing environment variable cannot silently switch the catalog database.
const PRODUCTION_SUPABASE_URL = 'https://zgsbtexngystdmakqjyi.supabase.co'
const PRODUCTION_SUPABASE_KEY = 'sb_publishable_7wqbX7wUVFJZqinPyy8XLQ_SimByBEo'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PRODUCTION_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PRODUCTION_SUPABASE_KEY

if (!/^https:\/\/[^\s/]+\.supabase\.co(?:\/.*)?$/.test(supabaseUrl)) {
  throw new Error('Invalid Supabase URL')
}

if (!supabaseAnonKey || supabaseAnonKey.toLowerCase().includes('service_role')) {
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
