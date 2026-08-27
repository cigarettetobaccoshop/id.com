# Supabase integration (upgraded)

This branch includes upgrades for a safer and more complete Supabase integration for Next.js + Vercel.

Changes in this update
- Environment validation and dual clients (public + admin) in `lib/supabaseClient.js`.
- Improved server-side test route with input validation and clearer error codes: `pages/api/supatest.js`.
- Client-side demo page: `pages/supabase-demo.js` — quick auth demo (magic link) and data fetch example.
- Documentation expanded below for Vercel env scoping and recommended steps.

Important: No keys are committed in this branch. Use `.env.local` for local testing and set environment variables in Vercel for Preview & Production.

## What changed — details

1) lib/supabaseClient.js
- Validates `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at startup and throws if missing (prevents silent build/runtime failures).
- Exports two clients:
  - `supabase` — public client using anon key for client-side usage.
  - `supabaseAdmin` — admin client using `SUPABASE_SERVICE_ROLE_KEY` when available (server-only). This client is only created when the service role key is present in environment variables.

2) pages/api/supatest.js
- Accepts query params: `table` (defaults to `todos`) and `limit` (defaults to 10).
- Returns 400 for invalid input, 401/403 for auth/RLS issues, 500 for server errors.
- Prefers admin client for server-side queries (when `SUPABASE_SERVICE_ROLE_KEY` is set), otherwise uses public client.

3) pages/supabase-demo.js
- Demo page to test signInWithOtp (magic link) and to fetch `todos` from the client.
- Useful to verify client-side auth and RLS behavior.

## New helpers (App Router / Server Components)

This repo now includes a server helper that makes it easy to access Supabase from Next.js App Router server components using the official auth-helpers.

- `utils/supabase-server.ts`
  - Exports `createServerSupabase()` which internally calls `createServerComponentClient({ cookies })` from `@supabase/auth-helpers-nextjs`.
  - Use this in server components (e.g., `app/page.tsx`) to read session-aware data on the server.

Example usage in `app/page.tsx`:

```tsx
import { createServerSupabase } from '@/utils/supabase-server'

export default async function Page() {
  const supabase = createServerSupabase()
  const { data: todos, error } = await supabase.from('todos').select()

  if (error) return <p>Error loading todos</p>

  return (
    <ul>
      {todos?.map((t) => <li key={t.id}>{t.name}</li>)}
    </ul>
  )
}
```

## Middleware (auth sync)

`middleware.ts` was updated to use `createMiddlewareClient` from `@supabase/auth-helpers-nextjs` which is Edge-runtime safe and handles cookie sync properly. The middleware included in this branch is a minimal example that fetches the session; customize it to add redirects or route protection as needed.

## Environment variables and Vercel scoping (recommended)

- NEXT_PUBLIC_SUPABASE_URL — `https://<project-ref>.supabase.co` (Preview & Production)
- NEXT_PUBLIC_SUPABASE_ANON_KEY — `sb_publishable_...` (Preview & Production)
- SUPABASE_SERVICE_ROLE_KEY — `service_role_...` (Production only) **server-only privileged key**

Why scope service role to Production only?
- Preview deployments are accessible publicly via preview URLs and should avoid exposing privileged keys. Only Production (the final deploy) should have the service role key to perform admin tasks.

Add variables in Vercel:
1. Go to Vercel → Projects → [your project] → Settings → Environment Variables.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Preview & Production.
3. Add `SUPABASE_SERVICE_ROLE_KEY` for Production only (mark it as a Secret).

Vercel checklist (quick):
- Set the following Environment Variables in Vercel for the correct scopes:
  - `NEXT_PUBLIC_SUPABASE_URL` (Preview & Production)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Preview & Production)
  - `SUPABASE_SERVICE_ROLE_KEY` (Production only, as a Secret)
- Do NOT add `SUPABASE_SERVICE_ROLE_KEY` to Preview or to the client-side (it should NOT be exposed).
- If you need server-side auth helpers (recommended for App Router): install `@supabase/auth-helpers-nextjs` and follow their middleware docs to sync cookies and session in Preview/Production.

## Local testing

1. Create `.env.local` (do NOT commit) with:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
# SUPABASE_SERVICE_ROLE_KEY=service_role_...  // only if testing privileged server ops locally
```

2. Install client library and helpers if not present:

```
npm install
```

3. Run dev server:

```
npm run dev
```

4. Test endpoints and pages:
- http://localhost:3000/api/supatest?table=todos
- http://localhost:3000/supabase-demo

## Row Level Security (RLS) recommendations
- If you enable RLS on tables, add explicit policies to permit the access expected by your client and server flows.
- Example: allow public read for a public `todos` table:

```sql
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON todos FOR SELECT USING (true);
```

- For authenticated per-user access, use `auth.uid()` in policies.

## Checklist before merging
- [ ] Add Vercel env vars (Preview & Production for public keys; Production only for service_role)
- [ ] Verify Preview deployment and test `/api/supatest` and `/supabase-demo`
- [ ] Update `pages/api/supatest.js` or demo to use your actual table names (if not `todos`)
- [ ] If using RLS, add policies and verify behavior

## Security notes
- Do NOT commit service role keys.
- Rotate keys immediately if exposed: Supabase Dashboard → Settings → API → Rotate keys; then update Vercel envs and redeploy.

If you want, I can also add CI to run `npm run build` on PRs to prevent merge regressions. Let me know and I will add a minimal GitHub Actions workflow.
