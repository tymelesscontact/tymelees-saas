import { NextResponse } from 'next/server';

// Ancienne route publique d'envoi d'email : n'importe qui pouvait faire envoyer un email
// "Bienvenue sur Xyra" a n'importe quelle adresse (spam, reputation du domaine).
// Les emails de bienvenue partent maintenant de /api/finaliser-inscription (app/lib/emailBienvenue.ts).
export async function POST() {
  return NextResponse.json({ error: 'Route desactivee' }, { status: 410 });
}
