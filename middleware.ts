import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    const role = token.role as string
    const { pathname } = req.nextUrl

    if (pathname.startsWith('/admin') && role !== 'admin')
      return NextResponse.redirect(new URL('/dashboard', req.url))

    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/entry') || pathname.startsWith('/history'))
      && role !== 'telecaller')
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))

    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = {
  matcher: ['/dashboard/:path*', '/entry/:path*', '/history/:path*', '/admin/:path*'],
}
