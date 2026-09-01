import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Public client — safe for client-side usage (anon/public key)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Admin client — server-only, created only when service role key is present
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null

// Real-time utilities
export const setupRealtimeSubscription = (table, callback, options = {}) => {
  const channel = supabase
    .channel(`${table}-changes`, {
      config: {
        broadcast: { self: true },
        presence: { key: 'user' },
      },
    })
    .on(
      'postgres_changes',
      {
        event: options.event || '*',
        schema: options.schema || 'public',
        table: table,
        filter: options.filter,
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return channel
}

export const setupBroadcast = (channel, event, callback) => {
  supabase
    .channel(channel)
    .on('broadcast', { event: event }, (payload) => {
      callback(payload.payload)
    })
    .subscribe()
}

export const broadcastMessage = (channel, event, data) => {
  supabase.channel(channel).send({
    type: 'broadcast',
    event: event,
    payload: data,
  })
}

export default supabase
