import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe, estProprietaireDuTenant } from '../../lib/permissions';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NB_MIN_TENANTS_BENCHMARK = 3;

async function moiConnecte(req: NextRequest, tenantId: string) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return null;
  const { data: moi } = await sb.from('equipe').select('id').eq('user_id', auth.user.id).eq('tenant_id', tenantId).maybeSingle();
  return moi?.id || null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  const moisCourant = new Date().toISOString().slice(0, 7);

  if (action === 'moi') {
    const moiId = await moiConnecte(req, tenantId);
    if (!moiId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { data: entree } = await sb.from('pulse_bienetre').select('*').eq('employe_id', moiId).eq('mois', moisCourant).maybeSingle();
    return NextResponse.json({ dejaRepondu: !!entree, entree: entree || null });
  }

  if (action === 'aggregate') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const estProprietaire = await estProprietaireDuTenant(req, tenantId);

    const { data: sixDerniersMois } = await sb.from('pulse_bienetre').select('mois,score').eq('tenant_id', tenantId);
    const parMois: Record<string, number[]> = {};
    for (const r of sixDerniersMois || []) { (parMois[r.mois] ||= []).push(r.score); }
    const moyenne = (arr: number[]) => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;
    const moisTries = Object.keys(parMois).sort();
    const historique = moisTries.slice(-6).map((mois) => ({ mois, moyenne: moyenne(parMois[mois]) }));
    const moyenneMois = moyenne(parMois[moisCourant] || []);
    const moisPrecedent = new Date(moisCourant + '-01'); moisPrecedent.setMonth(moisPrecedent.getMonth() - 1);
    const clePrecedent = moisPrecedent.toISOString().slice(0, 7);
    const moyennePrecedente = moyenne(parMois[clePrecedent] || []);

    const { count: effectif } = await sb.from('equipe').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId);
    const participation = effectif ? Math.round(((parMois[moisCourant] || []).length / effectif) * 100) : 0;

    // Benchmark anonymise entre clients Xyra : jamais de score individuel
    // d'un autre tenant, uniquement une moyenne, et seulement si assez de
    // tenants distincts contribuent ce mois-ci.
    const { data: rowsGlobal } = await sb.from('pulse_bienetre').select('score,tenant_id').eq('mois', moisCourant);
    const autresTenants = new Set((rowsGlobal || []).filter((r: any) => r.tenant_id !== tenantId).map((r: any) => r.tenant_id));
    let benchmarkXyra = null;
    if (autresTenants.size >= NB_MIN_TENANTS_BENCHMARK) {
      const scoresAutres = (rowsGlobal || []).filter((r: any) => r.tenant_id !== tenantId).map((r: any) => r.score);
      benchmarkXyra = { moyenne: moyenne(scoresAutres), nbEntreprises: autresTenants.size };
    }

    let detail = null;
    if (estProprietaire) {
      const { data: entrees } = await sb.from('pulse_bienetre').select('*').eq('tenant_id', tenantId).eq('mois', moisCourant).order('created_at', { ascending: false });
      const { data: membres } = await sb.from('equipe').select('id,nom,prenom').eq('tenant_id', tenantId);
      detail = (entrees || []).map((e: any) => {
        const m = (membres || []).find((mm: any) => mm.id === e.employe_id);
        return { ...e, nom_employe: m ? `${m.prenom || ''} ${m.nom}`.trim() : 'Inconnu' };
      });
    }

    return NextResponse.json({
      moyenneMois, moyennePrecedente, participation, historique, benchmarkXyra,
      estProprietaire, detail,
    });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  const body = await req.json();
  const { action } = body;
  const moisCourant = new Date().toISOString().slice(0, 7);

  if (action === 'repondre') {
    const moiId = await moiConnecte(req, tenantId);
    if (!moiId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { score, commentaire } = body;
    if (!score || score < 1 || score > 5) return NextResponse.json({ error: 'Score invalide' }, { status: 400 });
    const { error } = await sb.from('pulse_bienetre').upsert({
      tenant_id: tenantId, employe_id: moiId, mois: moisCourant, score: Number(score), commentaire: commentaire || null,
    }, { onConflict: 'employe_id,mois' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'repondre_rh') {
    if (!(await estProprietaireDuTenant(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire' }, { status: 403 });
    const { id, reponse } = body;
    if (!id || !reponse) return NextResponse.json({ error: 'id et reponse requis' }, { status: 400 });
    const { error } = await sb.from('pulse_bienetre').update({ reponse_rh: reponse, reponse_rh_le: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
