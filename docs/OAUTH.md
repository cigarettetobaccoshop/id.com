# OAuth Integration Guide

## Overview

OAuth memungkinkan users untuk login menggunakan akun Google atau GitHub mereka tanpa perlu membuat password baru.

## Setup

### 1. Google OAuth

**Di Google Cloud Console:**
1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project atau select existing
3. Enable "Google+ API"
4. Go to Credentials > Create OAuth 2.0 credentials
5. Select "Web Application"
6. Add Authorized redirect URIs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://id.com/auth/callback`
7. Copy Client ID dan Client Secret

**Di Supabase Dashboard:**
1. Login ke [supabase.com](https://supabase.com)
2. Select project
3. Authentication > Providers > Google
4. Enable provider
5. Paste Client ID dan Client Secret
6. Save

### 2. GitHub OAuth

**Di GitHub Settings:**
1. Login ke github.com
2. Settings > Developer settings > OAuth Apps > New OAuth App
3. Fill form:
   - Application name: `R2 Nusantara`
   - Homepage URL: `https://id.com`
   - Authorization callback URL: `https://id.com/auth/callback`
4. Copy Client ID dan Client Secret

**Di Supabase Dashboard:**
1. Authentication > Providers > GitHub
2. Enable provider
3. Paste Client ID dan Client Secret
4. Save

## Usage

### Sign In with Google
```javascript
import { signInWithGoogle } from '@/lib/supabaseOAuth'

await signInWithGoogle()
```

### Sign In with GitHub
```javascript
import { signInWithGitHub } from '@/lib/supabaseOAuth'

await signInWithGitHub()
```

### Callback Handler
Automatically handled by `/auth/callback` page

### Sign Out
```javascript
import { supabase } from '@/lib/supabaseRealtimeClient'

await supabase.auth.signOut()
```

## Testing

Development:
```bash
npm run dev
# Go to http://localhost:3000/auth
# Click "Sign in with Google" atau "Sign in with GitHub"
```

Production:
```bash
# Already deployed with OAuth support
# Vercel auto-deploys
```

## Security

✅ Do's:
- Never expose Client Secret in frontend code
- Always validate redirect URLs
- Use PKCE flow (handled by Supabase)
- Store tokens securely (handled by Supabase)

❌ Don'ts:
- Don't hardcode credentials
- Don't expose Client Secret in git
- Don't allow arbitrary redirect URLs

## Troubleshooting

### "Redirect URI mismatch"
- Ensure redirect URL matches exactly in OAuth provider settings

### "Invalid Client ID"
- Check Client ID is correct
- Verify it's copied from the right provider

### Session not persisting
- Check browser cookies are enabled
- Check Supabase session storage

## Next Steps
- ✅ Step 2: Real-time Integration
- ✅ Step 3: OAuth Integration
- 📁 Step 4: Storage Setup
- 📊 Step 5: Analytics & Optimization
