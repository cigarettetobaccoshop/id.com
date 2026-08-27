import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Retrieve session if you need to make route decisions
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    // Example: redirect unauthenticated user away from /dashboard
    // if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    //   return NextResponse.redirect(new URL('/login', req.url))
    // }
  } catch (err) {
    // non-fatal in middleware; log if needed
    console.error('Supabase middleware session error', err)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
