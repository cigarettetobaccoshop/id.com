import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

import { ADMIN_UUID } from './lib/admin/constants'

// Keep middleware on the exact same production Supabase project as the
// browser client and server bearer-token verifier. This prevents an
// environment mismatch from causing an authenticated dashboard request
// to bounce back to /login.
const PRODUCTION_SUPABASE_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co'
const PRODUCTION_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mqJp3tqSL1gCjz1xdcgWGQ_mtDFRTmg'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: PRODUCTION_SUPABASE_URL,
      supabaseKey: PRODUCTION_SUPABASE_PUBLISHABLE_KEY,
    },
  )
  const path = req.nextUrl.pathname

  if (path.startsWith('/admin')) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return NextResponse.redirect(new URL('/login?next=/admin/dashboard', req.url))
      if (user.id !== ADMIN_UUID) return NextResponse.redirect(new URL('/', req.url))
      res.headers.set('Cache-Control', 'private, no-store')
    } catch (err) {
      console.error('Supabase admin middleware error', err)
      return NextResponse.redirect(new URL('/login?next=/admin/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
