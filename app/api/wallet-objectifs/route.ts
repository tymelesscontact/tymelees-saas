import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';

// Epargne automatique par objectif (Wallets Projets) : voir app/lib/walletObjectifs.ts pour la
// logique d'allocation, declenchee depuis app/api/stripe-webhook/route.ts a chaque vraie entree
// confirmee. Cette route ne gere que la creation/modification des objectifs eux-memes.

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const NOM_MAX = 80;
const COULEURS_AUTORISEES = ['gold', 'teal', 'blue', 'purple', 'green', 'orange', 'red', 'pink'];

function pourcentageValide(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
}
function cibleValide(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n <= 1_000_000_000 ? n : null;
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ objectifs: [] });

  const { data: objectifs, error } = await sb.from('wallet_objectifs')
    .select('*').eq('tenant_id', tenantId).order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: mouvements } = await sb.from('wallet_objectifs_mouvements')
    .select('objectif_id,montant').eq('tenant_id', tenantId);

  const enriched = (objectifs || []).map((o: any) => ({
    ...o,
    solde: (mouvements || []).filter((m: any) => m.objectif_id === o.id).reduce((a: number, m: any) => a + Number(m.montant), 0),
  }));

  return NextResponse.json({ objectifs: enriched });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === 'creer' || action === 'modifier') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) {
      return NextResponse.json({ error: 'Reserve au proprietaire ou a un Admin' }, { status: 403 });
    }
    const nom = String(body.nom || '').trim().slice(0, NOM_MAX);
    const cible = cibleValide(body.cible);
    const pourcentage = pourcentageValide(body.pourcentage_allocation);
    const couleur = COULEURS_AUTORISEES.includes(body.couleur) ? body.couleur : 'gold';
    if (!nom) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    if (cible === null) return NextResponse.json({ error: 'Objectif (cible) invalide' }, { status: 400 });
    if (pourcentage === null) return NextResponse.json({ error: "Pourcentage d'allocation invalide (0 a 100)" }, { status: 400 });

    // La somme des % de tous les objectifs actifs ne peut jamais depasser 100 -- sinon chaque euro
    // recu serait "flechable" plus d'une fois, et la progression affichee mentirait.
    const { data: autres } = await sb.from('wallet_objectifs')
      .select('id,pourcentage_allocation').eq('tenant_id', tenantId).eq('actif', true);
    const idExclu = action === 'modifier' ? body.id : null;
    const sommeAutres = (autres || []).filter((o: any) => o.id !== idExclu).reduce((a: number, o: any) => a + Number(o.pourcentage_allocation || 0), 0);
    if (sommeAutres + pourcentage > 100) {
      return NextResponse.json({ error: `Somme des allocations trop haute : ${sommeAutres}% deja utilise sur vos objectifs actifs, il reste ${Math.max(0, 100 - sommeAutres)}% disponible` }, { status: 400 });
    }

    if (action === 'creer') {
      const { data, error } = await sb.from('wallet_objectifs').insert({
        tenant_id: tenantId, nom, cible, pourcentage_allocation: pourcentage, couleur,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, objectif: { ...data, solde: 0 } });
    }

    // modifier
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const { data, error } = await sb.from('wallet_objectifs')
      .update({ nom, cible, pourcentage_allocation: pourcentage, couleur })
      .eq('id', id).eq('tenant_id', tenantId).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, objectif: data });
  }

  // Archive plutot que supprimer : l'historique reel (wallet_objectifs_mouvements) n'est jamais perdu.
  if (action === 'archiver') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) {
      return NextResponse.json({ error: 'Reserve au proprietaire ou a un Admin' }, { status: 403 });
    }
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const { error } = await sb.from('wallet_objectifs').update({ actif: false }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
