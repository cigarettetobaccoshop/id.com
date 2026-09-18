import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

const PRODUCTION_SUPABASE_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co'
const PRODUCTION_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mqJp3tqSL1gCjz1xdcgWGQ_mtDFRTmg'

// Admin auth browser client is pinned to the R2 NUSANTARA production Supabase
// project so a stale/wrong Vercel NEXT_PUBLIC_* value cannot break admin login.
let client

export function getAdminSupabase() {
  if (typeof window === 'undefined') return null
  if (!client) {
    client = createBrowserSupabaseClient({
      supabaseUrl: PRODUCTION_SUPABASE_URL,
      supabaseKey: PRODUCTION_SUPABASE_PUBLISHABLE_KEY,
    })
  }
  return client
}
