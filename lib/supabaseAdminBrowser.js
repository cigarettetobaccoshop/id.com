import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

const PRODUCTION_SUPABASE_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co'
const PRODUCTION_SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

// Admin auth browser client is pinned to the R2 NUSANTARA production Supabase
// project and uses the active public publishable key configured in Vercel.
// Service-role credentials must never be used by this browser client.
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
