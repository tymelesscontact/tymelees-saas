import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifierJeton2FA } from './app/lib/deuxFa'

const API_OUVERTES = [
  '/api/profil-entreprise',
  '/api/registration-intent',
  '/api/finaliser-inscription',
  '/api/2fa',
  '/api/reservation-publique',
  '/api/boutique',
  '/api/commandes',
  '/api/create-checkout',
  '/api/create-checkout-flutterwave',
  '/api/generer-secteur',
  '/api/whoami',
  '/api/session',
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
  '/api/email-entrant',
  '/api/sms-entrant',
]
