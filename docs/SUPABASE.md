# Supabase integration — recommended setup for Next.js + Vercel

This document explains the changes in the `supabase/integration` branch and how to configure environment variables and deployment in Vercel.

## Files added

- `lib/supabaseClient.js` — initializes the Supabase client using environment variables.
- `pages/api/supatest.js` — simple API route for testing server-side access to Supabase.
- `.env.example` — shows the environment variables you must set (do NOT commit real keys).
- `.gitignore` — ensure local .env files are ignored.

## Environment variables

Recommended variable names (used by the code in this PR):

- NEXT_PUBLIC_SUPABASE_URL — e.g. `https://<project-ref>.supabase.co`
- NEXT_PUBLIC_SUPABASE_ANON_KEY — `sb_publishable_...` (anon/public key for client-side usage)
- SUPABASE_SERVICE_ROLE_KEY — `service_role_...` (server-only; **do not** expose to the client)

## Add variables to Vercel

1. Go to Vercel → Projects → [your project] → Settings → Environment Variables.
2. Add the following (Target: Preview & Production for public keys):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://<project-ref>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_...`
3. If you need server-only privileged operations, add `SUPABASE_SERVICE_ROLE_KEY` and mark it for Production only.
4. After adding, trigger a redeploy (Vercel will re-run the build and the env vars will be available to the app).

## Local testing

1. Create a local `.env.local` file (do NOT commit):

   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

2. Install dependencies:

   npm install @supabase/supabase-js

3. Run dev server:

   npm run dev

4. Test server-side API route:

   http://localhost:3000/api/supatest

   - The route uses `lib/supabaseClient.js` and will return up to 10 rows from the `todos` table.
   - Replace `todos` with a table present in your database for meaningful results.

## Row Level Security (RLS) & Auth

- If you enable RLS on tables, create policies to allow authenticated users to read/write the rows they should access.
- For client-side requests, use the anon key plus user JWTs managed by Supabase Auth.
- For background or privileged tasks (backups, imports), call Supabase from server code using the `SUPABASE_SERVICE_ROLE_KEY` stored in Vercel secrets.

## Rotating keys

- Rotate keys in the Supabase Dashboard → Settings → API.
- Update the values in Vercel environment variables and redeploy immediately.
- Revoke old keys if they were exposed.

## Security notes

- `sb_publishable_*` keys are intended for client-side use. They are not a secret but avoid publishing them publicly where not intended.
- `service_role_*` keys are highly privileged and MUST remain secret; never commit them or expose to client bundles.

## After merge

1. Add the recommended env vars to Vercel as described above.
2. Verify Preview deployment (Vercel) and open `/api/supatest` to ensure server-side queries work.
3. Merge to main to trigger Production deploy once env vars are added for Production.

If you want, I can also add a GitHub Actions workflow to run tests or deploy, but for Next.js + Vercel the easiest path is to let Vercel handle builds and deploys.
