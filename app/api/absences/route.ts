import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest, verifierAccesModule } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TYPES_VALIDES = [
  'conge_paye', 'conge_sans_solde', 'arret_maladie', 'accident_travail',
  'evenement_familial', 'enfant_malade', 'absence_injustifiee', 'retard',
  'maternite_paternite', 'adoption', 'conge_parental', 'proche_aidant',
  'conge_sabbatique', 'creation_entreprise', 'conge_formation', 'conge_examen',
  'reserve_militaire', 'mandat_politique',
];

export async function GET(req: NextRequest) {
  const acces = await verifierAccesModule(req, "planning");
  if (!acces.ok) return acces.reponse;
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  // vue "dispatch" : masque le motif detaille, ne montre que "absent"
  const vueSimple = searchParams.get('vue') === 'dispatch';

  // vue "responsable" : les demandes de mon equipe directe qui attendent ma pre-validation
  if (searchParams.get('vue') === 'mes_validations') {
    const tokenMoi = req.cookies.get('sb-access-token')?.value;
    if (!tokenMoi) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { data: authMoi } = await sb.auth.getUser(tokenMoi);
    if (!authMoi?.user) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { data: moi } = await sb.from('equipe').select('id').eq('user_id', authMoi.user.id).eq('tenant_id', tenantId).maybeSingle();
    if (!moi) return NextResponse.json({ absences: [] });
    const { data: mesReports } = await sb.from('equipe').select('id,nom,prenom').eq('responsable_id', moi.id).eq('tenant_id', tenantId);
    const idsReports = (mesReports || []).map((r: any) => r.id);
    if (idsReports.length === 0) return NextResponse.json({ absences: [] });
    const { data: demandes } = await sb.from('absences').select('*')
      .eq('tenant_id', tenantId).in('employe_id', idsReports).eq('statut', 'en_attente')
      .is('valide_par_responsable_le', null).order('debut', { ascending: true });
    return NextResponse.json({ absences: demandes || [] });
  }

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
  const acces = await verifierAccesModule(req, "planning");
  if (!acces.ok) return acces.reponse;
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
    const { data: cibleValidation } = await sb.from('absences').select('employe_id').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!cibleValidation) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });

    const autoriseRH = await estAutoriseGererEquipe(req, tenantId);
    let autoriseResponsable = false;
    // Un responsable designe peut refuser directement la demande de son
    // equipe -- seule l'approbation finale reste reservee au RH/proprietaire.
    if (!autoriseRH && statut === 'refusee') {
      const tokenMoi = req.cookies.get('sb-access-token')?.value;
      if (tokenMoi) {
        const { data: authMoi } = await sb.auth.getUser(tokenMoi);
        if (authMoi?.user) {
          const { data: moi } = await sb.from('equipe').select('id').eq('user_id', authMoi.user.id).eq('tenant_id', tenantId).maybeSingle();
          if (moi) {
            const { data: employeCible } = await sb.from('equipe').select('responsable_id').eq('id', cibleValidation.employe_id).eq('tenant_id', tenantId).maybeSingle();
            autoriseResponsable = employeCible?.responsable_id === moi.id;
          }
        }
      }
    }
    if (!autoriseRH && !autoriseResponsable) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

    const { data: absValidee, error } = await sb.from('absences')
      .update({ statut, motif_refus: motif_refus || null, valide_le: new Date().toISOString() })
      .eq('id', id).eq('tenant_id', tenantId).select('type,jours,employe_id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Congé payé validé : decompte reel du solde de l'employe.
    if (statut === 'validee' && absValidee?.type === 'conge_paye') {
      const { data: empSolde } = await sb.from('equipe').select('conges_solde').eq('id', absValidee.employe_id).eq('tenant_id', tenantId).maybeSingle();
      if (empSolde) {
        await sb.from('equipe').update({ conges_solde: Math.max(0, Number(empSolde.conges_solde || 0) - Number(absValidee.jours || 1)) }).eq('id', absValidee.employe_id).eq('tenant_id', tenantId);
      }
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'valider_responsable') {
    // Pre-validation par le responsable designe : ne tranche pas la
    // demande, informe juste le RH qu'elle a l'aval du responsable direct.
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const tokenMoi = req.cookies.get('sb-access-token')?.value;
    if (!tokenMoi) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { data: authMoi } = await sb.auth.getUser(tokenMoi);
    if (!authMoi?.user) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { data: moi } = await sb.from('equipe').select('id').eq('user_id', authMoi.user.id).eq('tenant_id', tenantId).maybeSingle();
    if (!moi) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    const { data: cible } = await sb.from('absences').select('employe_id').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!cible) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    const { data: employeCible } = await sb.from('equipe').select('responsable_id').eq('id', cible.employe_id).eq('tenant_id', tenantId).maybeSingle();
    if (employeCible?.responsable_id !== moi.id) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    const { error } = await sb.from('absences').update({ valide_par_responsable_le: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenantId);
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
