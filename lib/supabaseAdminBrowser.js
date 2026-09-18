import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

// Admin auth browser client. Unlike the general storefront client, this client
// stores the Supabase session in cookies so Next.js middleware can validate the
// same session before allowing /admin routes.
const url = 'https://nwrqdcrknipnfvhogjyg.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

let client

export function getAdminSupabase() {
  if (typeof window === 'undefined') return null
  if (!client) {
    if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum dikonfigurasi.')
    client = createBrowserSupabaseClient({ supabaseUrl: url, supabaseKey: key })
  }
  return client
}
