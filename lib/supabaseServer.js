import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client for guest checkout.
 *
 * Checkout does not depend on a Vercel service-role secret. It uses the
 * public anon key for catalog reads and invokes the tightly-scoped
 * SECURITY DEFINER order RPC, which is explicitly granted to anon/authenticated
 * in the production Supabase project.
 */
const SUPABASE_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cnFkY3JrbmlwbmZ2aG9nanlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDI0ODgsImV4cCI6MjEwMjIxODQ4OH0.jKJpIeVsOtE2VnA1cuHtFpWwqrPT9FUq9JK4T5smWSU'

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

export default supabaseServer
