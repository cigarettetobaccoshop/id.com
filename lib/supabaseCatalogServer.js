import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_mqJp3tqSL1gCjz1xdcgWGQ_mtDFRTmg'

export const supabaseCatalogServer = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

export default supabaseCatalogServer
