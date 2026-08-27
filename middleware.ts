import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Routes /api ouvertes sans session.
// Retirer une ligne = fermer la route. Ajouter une ligne = l'ouvrir.
const API_OUVERTES = [
  '/api/profil-entreprise',
  '/api/finaliser-inscription',
  '/api/reservation-publique',
  '/api/boutique',
  '/api/commandes',
  '/api/contrats',
  '/api/create-checkout',
  '/api/create-checkout-flutterwave',
  '/api/devis',
  '/api/generer-secteur',
  '/api/send-email',
  '/api/whoami',
  '/api/club',
  '/api/club-espace',
  '/api/club-deals',
  '/api/club-messages',
  '/api/club-document',
  '/api/club-observateur',
  '/api/club-paiement',
  '/api/stripe-webhook',
  '/api/flutterwave-webhook',
  '/api/webhook',
]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isApi = path.startsWith('/api')

  if (isApi && API_OUVERTES.some(p => path === p || path.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const token = req.cookies.get('sb-access-token')?.value
  const isAdminRoute = path.startsWith('/admin')
  const loginUrl = isAdminRoute ? '/admin/login' : '/login'

  const refus = (url: string) =>
    isApi
      ? NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
      : NextResponse.redirect(new URL(url, req.url))

  if (!token) {
    return refus(loginUrl)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    return refus(loginUrl)
  }

  // Session valide : tout client identifie peut appeler l'API.
  if (isApi) {
    return NextResponse.next()
  }

  if (path.startsWith('/mon-espace')) {
    return NextResponse.next()
  }

  // Seul le compte owner accede au dashboard et a l'admin.
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail || data.user.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/mon-espace/:path*', '/admin/:path*', '/api/:path*']
}
