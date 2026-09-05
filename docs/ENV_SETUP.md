# Environment Variables Setup Guide

## 1. Production Setup (Vercel)

Di Supabase Dashboard → Settings > API → Copy credentials:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

Di Vercel Dashboard → Settings > Environment Variables → Add:
- NEXT_PUBLIC_SUPABASE_URL (Production, Preview, Development)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (Production, Preview, Development)
- SUPABASE_SERVICE_ROLE_KEY (Production only)

## 2. OAuth Setup

Google OAuth: console.cloud.google.com → Credentials → OAuth 2.0
GitHub OAuth: github.com → Settings > Developer settings > OAuth Apps

Redirect URLs:
- Development: http://localhost:3000/auth/callback
- Production: https://id.com/auth/callback

Then configure in Supabase Dashboard > Authentication > Providers

## 3. Verify Setup

Development: npm run dev → http://localhost:3000/supabase-demo
Production: Vercel auto-deploys on push to main
