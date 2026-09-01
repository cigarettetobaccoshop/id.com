import { useEffect, useState } from 'react'
import {
  signInWithGoogle,
  signInWithGitHub,
  signOut,
  onAuthStateChange,
  getUserProfile,
} from '../lib/supabaseOAuth'

export default function AuthDemo() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChange(async (event, authUser) => {
      setUser(authUser)
      if (authUser) {
        try {
          const userProfile = await getUserProfile()
          setProfile(userProfile)
          setMessage(`Welcome, ${userProfile?.name || userProfile?.email}!`)
        } catch (err) {
          setMessage(`Error loading profile: ${err.message}`)
        }
      } else {
        setProfile(null)
        setMessage('')
      }
    })

    return unsubscribe
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      setMessage('Redirecting to Google...')
    } catch (err) {
      setMessage(`Error: ${err.message}`)
      setLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGitHub()
      setMessage('Redirecting to GitHub...')
    } catch (err) {
      setMessage(`Error: ${err.message}`)
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      setUser(null)
      setProfile(null)
      setMessage('Signed out successfully!')
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>🔐 OAuth Authentication Demo</h1>

      {message && (
        <p style={{ color: '#666', marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          {message}
        </p>
      )}

      {!user ? (
        <div style={{ marginBottom: '20px' }}>
          <h2>Sign In</h2>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: '#4285F4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {loading ? 'Signing in...' : '🔵 Sign in with Google'}
          </button>
          <button
            onClick={handleGitHubSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {loading ? 'Signing in...' : '⬛ Sign in with GitHub'}
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <h2>User Profile</h2>
          {profile && (
            <div
              style={{
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                marginBottom: '15px',
              }}
            >
              {profile.avatar && (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    marginBottom: '10px',
                  }}
                />
              )}
              <p>
                <strong>Name:</strong> {profile.name || 'N/A'}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Provider:</strong> {profile.provider}
              </p>
              <p>
                <strong>ID:</strong>{' '}
                <code style={{ fontSize: '12px' }}>{profile.id}</code>
              </p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )}

      <hr style={{ marginTop: '30px' }} />
      <div style={{ fontSize: '12px', color: '#999' }}>
        <h3>Setup Instructions:</h3>
        <ol>
          <li>Configure Google OAuth in Supabase Dashboard</li>
          <li>Configure GitHub OAuth in Supabase Dashboard</li>
          <li>Add environment variables to Vercel</li>
          <li>Redeploy application</li>
        </ol>
        <p>See docs/OAUTH.md for detailed setup guide</p>
      </div>
    </div>
  )
}
