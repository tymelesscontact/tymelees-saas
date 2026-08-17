import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { WHITE_LABEL_PAR_CLIENT, WHITE_LABEL_MAX_CLIENTS, PLAN_PRIX } from '../../lib/plans';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Retrouve le revendeur a partir du tenant connecte
async function revendeurConnecte(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return null;
  const { data } = await sb.from('revendeurs')
    .select('*').eq('tenant_id', tenantId).eq('statut', 'actif').maybeSingle();
  return data || null;
}

export async function GET(req: NextRequest) {
  const rev = await revendeurConnecte(req);
  if (!rev) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'dashboard';

  if (action === 'dashboard') {
    // Ses clients, et seulement les siens
    const { data: clients } = await sb.from('tenants')
      .select('id,societe,email,plan,plan_price,statut,pays,metier,created_at,trial_ends_at')
      .eq('revendeur_id', rev.id)
      .order('created_at', { ascending: false });

    const liste = clients || [];
    const actifs = liste.filter((c: any) => c.statut === 'actif');
    const essais = liste.filter((c: any) => c.statut === 'essai');

    const debutMois = new Date(); debutMois.setDate(1); debutMois.setHours(0, 0, 0, 0);
    const nouveauxCeMois = liste.filter((c: any) => new Date(c.created_at) >= debutMois).length;

    const forfait = PLAN_PRIX[rev.plan] || 500;
    const plafond = WHITE_LABEL_MAX_CLIENTS[rev.plan];
    const aFacturer = forfait + actifs.length * WHITE_LABEL_PAR_CLIENT;

    return NextResponse.json({
      success: true,
      revendeur: {
        societe: rev.societe, plan: rev.plan, pays: rev.pays,
        marque_nom: rev.marque_nom, marque_logo_url: rev.marque_logo_url,
        marque_couleur: rev.marque_couleur, domaine: rev.domaine,
        date_debut: rev.date_debut,
      },
      clients: liste,
      chiffres: {
        total: liste.length,
        actifs: actifs.length,
        essais: essais.length,
        nouveaux_ce_mois: nouveauxCeMois,
        plafond,
        places_restantes: plafond ? Math.max(0, plafond - actifs.length) : null,
        forfait,
        par_client: WHITE_LABEL_PAR_CLIENT,
        a_facturer: aFacturer,
      },
    });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const rev = await revendeurConnecte(req);
  if (!rev) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

  const body = await req.json();
  const { action } = body;

  // ── Creer un client ────────────────────────────────────
  if (action === 'creer_client') {
    const { societe, email, pays, plan, metier } = body;
    if (!societe?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Societe et email necessaires' }, { status: 400 });
    }

    // Le plafond du forfait
    const plafond = WHITE_LABEL_MAX_CLIENTS[rev.plan];
    if (plafond) {
      const { count } = await sb.from('tenants')
        .select('id', { count: 'exact', head: true })
        .eq('revendeur_id', rev.id).eq('statut', 'actif');
      if ((count || 0) >= plafond) {
        return NextResponse.json({
          error: `Votre forfait est limite a ${plafond} clients actifs. Passez au forfait superieur pour en ajouter.`,
        }, { status: 400 });
      }
    }

    // Le compte d'acces du client
    let userId = null;
    try {
      const { data: invite } = await sb.auth.admin.generateLink({ type: 'invite', email: email.trim() });
      userId = invite?.user?.id || null;
    } catch (e: any) {
      console.error('Compte client revendeur:', e.message);
    }

    const { data, error } = await sb.from('tenants').insert({
      societe: societe.trim(),
      email: email.trim(),
      pays: pays || rev.pays || null,
      metier: metier || null,
      plan: plan || 'starter',
      plan_price: PLAN_PRIX[plan || 'starter'] || 59,
      statut: 'essai',
      revendeur_id: rev.id,
      user_id: userId,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, client: data });
  }

  // ── Modifier sa marque ─────────────────────────────────
  if (action === 'maj_marque') {
    const champs: any = {};
    for (const c of ['marque_nom', 'marque_logo_url', 'marque_couleur', 'domaine']) {
      if (body[c] !== undefined) champs[c] = body[c] || null;
    }
    if (!Object.keys(champs).length) {
      return NextResponse.json({ error: 'Rien a enregistrer' }, { status: 400 });
    }
    const { error } = await sb.from('revendeurs').update(champs).eq('id', rev.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Suspendre ou reactiver un de ses clients ───────────
  if (action === 'statut_client') {
    const { client_id, statut } = body;
    if (!['actif', 'suspendu', 'essai'].includes(statut)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    const { error } = await sb.from('tenants')
      .update({ statut }).eq('id', client_id).eq('revendeur_id', rev.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
