import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { logAuditEvent } from '../lib/audit'

export function useAuthMonitor({ enabled = true } = {}) {
  const lastUserIdRef = useRef(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null
      if (user?.id) lastUserIdRef.current = user.id

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        void logAuditEvent(event.toLowerCase(), {
          auth_event: event,
          is_anonymous: Boolean(user?.is_anonymous),
          provider: user?.app_metadata?.provider || null,
        }, user?.id || null)
      }

      if (event === 'SIGNED_OUT') {
        // Supabase invalidates the authenticated session during SIGNED_OUT.
        // We intentionally do not force a new auth flow or use service-role credentials here.
        lastUserIdRef.current = null
      }
    })

    return () => listener?.subscription?.unsubscribe?.()
  }, [enabled])
}
