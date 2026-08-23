import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TYPES_VALIDES = [
  'conge_paye', 'conge_sans_solde', 'arret_maladie', 'accident_travail',
  'evenement_familial', 'enfant_malade', 'absence_injustifiee', 'retard',
];

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  // vue "dispatch" : masque le motif detaille, ne montre que "absent"
  const vueSimple = searchParams.get('vue') === 'dispatch';

  const { data, error } = await sb.from('absences')
    .select('*').eq('tenant_id', tenantId).order('debut', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (vueSimple) {
    // Les collegues voient seulement qu'un collaborateur est absent, jamais pourquoi.
    const simplifiees = (data || []).map((a: any) => ({
      id: a.id, employe_id: a.employe_id, nom_employe: a.nom_employe,
      debut: a.debut, fin: a.fin, statut: a.statut,
    }));
    return NextResponse.json({ absences: simplifiees });
  }

  // Vue complete : reservee a Bene et au RH (l'appelant doit deja etre authentifie proprietaire du tenant)
  return NextResponse.json({ absences: data || [] });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'declarer') {
    const {
      employe_id, nom_employe, type, debut, fin, heure_debut, heure_fin,
      motif, justificatif_chemin, declaree_par, type_propose_par_lea,
    } = body;

    if (!employe_id || !type || !debut) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }
    if (!TYPES_VALIDES.includes(type) && !type_propose_par_lea) {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }

    // Verifie que le collaborateur appartient bien au tenant
    const { data: emp } = await sb.from('equipe').select('id,nom,prenom')
      .eq('id', employe_id).eq('tenant_id', tenantId).maybeSingle();
    if (!emp) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

    const jours = fin
      ? Math.max(1, Math.round((new Date(fin).getTime() - new Date(debut).getTime()) / 86400000) + 1)
      : 1;

    const { data, error } = await sb.from('absences').insert({
      tenant_id: tenantId, employe_id,
      nom_employe: nom_employe || `${emp.prenom || ''} ${emp.nom}`.trim(),
      type, debut, fin: fin || debut, jours,
      heure_debut: heure_debut || null, heure_fin: heure_fin || null,
      motif: motif || null, justif: !!justificatif_chemin,
      justificatif_chemin: justificatif_chemin || null,
      justificatif_depose_le: justificatif_chemin ? new Date().toISOString() : null,
      declaree_par: declaree_par || 'collaborateur',
      type_propose_par_lea: type_propose_par_lea || null,
      statut: 'en_attente',
      // Accident du travail : le salarie vient de prevenir -> depart du delai des 24h/48h pour Bene
      employeur_alerte_le: type === 'accident_travail' ? new Date().toISOString() : null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, absence: data });
  }

  if (action === 'valider') {
    const { id, statut, motif_refus } = body;
    if (!['validee', 'refusee'].includes(statut)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    const { error } = await sb.from('absences')
      .update({ statut, motif_refus: motif_refus || null, valide_le: new Date().toISOString() })
      .eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'confirmer_declaration_employeur') {
    // Bene confirme avoir fait sa declaration a l'organisme (CPAM/CNPS/CSS/assureur)
    const { id } = body;
    const { error } = await sb.from('absences')
      .update({ employeur_declare_le: new Date().toISOString() })
      .eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
