import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function makeSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function useOnlineGuests({ enabled = true, channelName = 'r2-online-guests' } = {}) {
  const [onlineGuests, setOnlineGuests] = useState([])
  const sessionId = useMemo(() => makeSessionId(), [])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined

    const channel = supabase.channel(channelName, {
      config: { presence: { key: sessionId } },
    })

    const sync = () => {
      const state = channel.presenceState()
      const guests = Object.entries(state).flatMap(([key, values]) => {
        const first = Array.isArray(values) ? values[0] : values
        return [{
          key,
          online_at: first?.online_at || null,
          page: first?.page || '/',
        }]
      })
      setOnlineGuests(guests)
    }

    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe(async status => {
        if (status !== 'SUBSCRIBED') return
        await channel.track({
          session_id: sessionId,
          online_at: new Date().toISOString(),
          page: window.location.pathname,
        })
      })

    return () => {
      void channel.untrack()
      void supabase.removeChannel(channel)
    }
  }, [channelName, enabled, sessionId])

  return { onlineGuests, onlineCount: onlineGuests.length }
}
