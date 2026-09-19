import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

import { ADMIN_UUID } from './lib/admin/constants'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './lib/supabase/config'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_PUBLISHABLE_KEY,
    },
  )
  const path = req.nextUrl.pathname

  if (path.startsWith('/admin')) {
    try {
      // Validate the cookie-backed session against Supabase Auth. Do not trust
      // the user object from getSession() for authorization decisions.
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
