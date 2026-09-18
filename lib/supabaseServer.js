import { createClient } from '@supabase/supabase-js'

// Server-only Supabase client for privileged API routes.
// Never import this module from browser/client components.
const SUPABASE_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side order operations')
}

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

export default supabaseServer
