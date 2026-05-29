import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value
    || req.cookies.get('supabase-auth-token')?.value
    || req.cookies.get('sb-jigwcrybfhvlmzoclbih-auth-token')?.value

  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
