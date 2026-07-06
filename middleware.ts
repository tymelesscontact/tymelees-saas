import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (req.nextUrl.pathname.startsWith('/mon-espace')) {
    return NextResponse.next()
  }

  // Seul le compte owner (toi) peut accéder au dashboard, même si
  // d'autres comptes (clients, partenaires) existent maintenant.
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail || data.user.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/mon-espace/:path*']
}