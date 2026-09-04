import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || typeof supabaseUrl !== 'string') {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string') {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

if (!/^https:\/\/[^\s/]+\.supabase\.co(?:\/.*)?$/.test(supabaseUrl)) {
  throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL')
}

if (supabaseAnonKey.toLowerCase().includes('service_role')) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY must not contain a service_role key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export default supabase
