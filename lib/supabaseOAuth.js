import { supabase } from './supabaseRealtimeClient'

/**
 * Sign in with Google OAuth
 * @returns {Promise<{user, session}>}
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(`Google signin failed: ${error.message}`)
  }

  return data
}

/**
 * Sign in with GitHub OAuth
 * @returns {Promise<{user, session}>}
 */
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(`GitHub signin failed: ${error.message}`)
  }

  return data
}

/**
 * Get current user session
 * @returns {Promise<{user, session}>}
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(`Failed to get session: ${error.message}`)
  }

  return data.session?.user || null
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(`Sign out failed: ${error.message}`)
  }
}

/**
 * Listen to auth state changes
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export function onAuthStateChange(callback) {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session?.user || null, session)
    }
  )

  return () => {
    listener?.subscription?.unsubscribe?.()
  }
}

/**
 * Get user profile with additional data
 * @returns {Promise<Object>}
 */
export async function getUserProfile() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.full_name,
    avatar: user.user_metadata?.avatar_url,
    provider: user.app_metadata?.provider,
    createdAt: user.created_at,
  }
}
