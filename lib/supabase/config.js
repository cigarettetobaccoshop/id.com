// Shared public Supabase configuration for browser, middleware, and server clients.
// Service-role credentials are intentionally excluded from this module.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nwrqdcrknipnfvhogjyg.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_mqJp3tqSL1gCjz1xdcgWGQ_mtDFRTmg'

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Supabase public configuration is missing')
}
