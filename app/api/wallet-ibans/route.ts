import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';
import { ibanValide, bicValide } from '../../lib/walletValidation';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Service role : le tenant_id est verifie et impose dans chaque requete
// (.eq('tenant_id', tenantId)) -- meme pattern que le reste de l'app.
// Avant cette route, le composant IbanMondial parlait directement a
// Supabase depuis le navigateur (cle anon), sans jamais filtrer par
// tenant : n'importe quel utilisateur connecte voyait les IBAN de tous
// les tenants (faille corrigee).
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ ibans: [] });

  const { data, error } = await sb.from('wallet_ibans').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ibans: data || [] });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // Les IBAN enregistres ici sont les comptes ou l'entreprise recoit de l'argent : les modifier est reserve au
  // proprietaire ou a un Admin. Sans cela, un collaborateur pourrait mettre SON compte a la place.
  if (action === 'ajouter' || action === 'supprimer') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) {
      return NextResponse.json({ error: 'Reserve au proprietaire du compte ou a un administrateur' }, { status: 403 });
    }
  }

  if (action === 'ajouter') {
    const { pays, iban: ibanBrut, banque, bic: bicBrut, pour } = body;
    if (!pays || !ibanBrut) return NextResponse.json({ error: 'Pays et IBAN requis' }, { status: 400 });
    // Format reel de l'IBAN (cle de controle) : une faute de frappe ferait payer au mauvais endroit.
    const iban = ibanValide(ibanBrut);
    if (!iban) return NextResponse.json({ error: 'IBAN invalide : verifiez les chiffres et les lettres' }, { status: 400 });
    let bic: string | null = null;
    if (bicBrut && String(bicBrut).trim()) {
      bic = bicValide(bicBrut);
      if (!bic) return NextResponse.json({ error: 'BIC invalide (8 ou 11 caracteres)' }, { status: 400 });
    }
    const court = (v: unknown, max: number) => (v ? String(v).trim().slice(0, max).replace(/[<>]/g, '') : null) || null;

    const { data, error } = await sb.from('wallet_ibans').insert({
      pays: court(pays, 60), iban, banque: court(banque, 80), bic, pour: court(pour, 80),
      tenant_id: tenantId,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, iban: data });
  }

  if (action === 'supprimer') {
    const { id } = body;
    if (!id || !UUID_RE.test(String(id))) return NextResponse.json({ error: 'IBAN invalide' }, { status: 400 });
    const { error } = await sb.from('wallet_ibans').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
