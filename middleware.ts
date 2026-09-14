import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

const ADMIN_UUID = '76a6d92e-6de1-45e3-a5d0-90d7905c0d52'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const path = req.nextUrl.pathname

  if (path.startsWith('/admin')) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return NextResponse.redirect(new URL('/login?next=/admin/dashboard', req.url))
      if (session.user?.id !== ADMIN_UUID) return NextResponse.redirect(new URL('/', req.url))
    } catch (err) {
      console.error('Supabase admin middleware error', err)
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
