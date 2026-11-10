import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest, verifierAccesModule } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe, estProprietaireDuTenant } from '../../lib/permissions';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fiche "equipe" de la personne connectee dans ce tenant (null si pas salariee ici)
async function maFicheEquipe(req: NextRequest, tenantId: string): Promise<string | null> {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return null;
  const { data: moi } = await sb.from('equipe').select('id').eq('user_id', auth.user.id).eq('tenant_id', tenantId).maybeSingle();
  return moi?.id || null;
}

// Jours feries francais (fixes + Paques, Ascension, Pentecote) pour une annee
function joursFeries(annee: number): Set<string> {
  const a = annee % 19, b = Math.floor(annee / 100), c = annee % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mois = Math.floor((h + l - 7 * m + 114) / 31), jour = ((h + l - 7 * m + 114) % 31) + 1;
  const paques = Date.UTC(annee, mois - 1, jour);
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
  const j = 86400000;
  return new Set([
    `${annee}-01-01`, `${annee}-05-01`, `${annee}-05-08`, `${annee}-07-14`,
    `${annee}-08-15`, `${annee}-11-01`, `${annee}-11-11`, `${annee}-12-25`,
    iso(paques + j), iso(paques + 39 * j), iso(paques + 50 * j),
  ]);
}

// Conges payes : decompte en jours ouvrables (lundi-samedi, hors jours feries).
// Autres absences : jours calendaires.
function compterJours(type: string, debut: string, fin?: string | null): number {
  const d0 = Date.parse(debut + 'T00:00:00Z'), d1 = Date.parse((fin || debut) + 'T00:00:00Z');
  if (isNaN(d0) || isNaN(d1) || d1 < d0) return 1;
  if (type !== 'conge_paye') return Math.round((d1 - d0) / 86400000) + 1;
  let n = 0;
  const feries: Record<number, Set<string>> = {};
  for (let t = d0; t <= d1; t += 86400000) {
    const dt = new Date(t);
    if (dt.getUTCDay() === 0) continue;
    const an = dt.getUTCFullYear();
    feries[an] = feries[an] || joursFeries(an);
    if (feries[an].has(dt.toISOString().slice(0, 10))) continue;
    n++;
  }
  return Math.max(1, n);
}

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

  // vue "moi" : l'espace equipe d'un salarie ne recoit que ses propres absences
  if (searchParams.get('vue') === 'moi') {
    const tokenMoi = req.cookies.get('sb-access-token')?.value;
    if (!tokenMoi) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { data: authMoi } = await sb.auth.getUser(tokenMoi);
    if (!authMoi?.user) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { data: moi } = await sb.from('equipe').select('id').eq('user_id', authMoi.user.id).eq('tenant_id', tenantId).maybeSingle();
    if (!moi) return NextResponse.json({ absences: [] });
    const { data: miennes, error: errMiennes } = await sb.from('absences').select('*')
      .eq('tenant_id', tenantId).eq('employe_id', moi.id).order('debut', { ascending: false });
    if (errMiennes) return NextResponse.json({ error: errMiennes.message }, { status: 500 });
    return NextResponse.json({ absences: miennes || [] });
  }

  const { data, error } = await sb.from('absences')
    .select('*').eq('tenant_id', tenantId).order('debut', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Type et motif (donnees de sante) : reserves au proprietaire et a l'Admin.
  // Repli tenants.user_id pour les comptes proprietaires crees avant l'entree
  // automatique 'owner' dans tenant_membres.
  let voitMotifs = await estAutoriseGererEquipe(req, tenantId);
  if (!voitMotifs) {
    const tokenVerif = req.cookies.get('sb-access-token')?.value;
    if (tokenVerif) {
      const { data: authVerif } = await sb.auth.getUser(tokenVerif);
      if (authVerif?.user) {
        const { data: tenantProprio } = await sb.from('tenants').select('id').eq('id', tenantId).eq('user_id', authVerif.user.id).maybeSingle();
        voitMotifs = !!tenantProprio;
      }
    }
  }

  if (vueSimple || !voitMotifs) {
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
    // Un salarie ne declare une absence que pour lui-meme ; le RH/proprietaire pour n'importe qui
    if (!(await estAutoriseGererEquipe(req, tenantId))) {
      const moiId = await maFicheEquipe(req, tenantId);
      if (moiId !== employe_id) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }

    const jours = compterJours(type, debut, fin);

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
    const { data: cibleValidation } = await sb.from('absences').select('employe_id,statut').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!cibleValidation) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    // Deja tranchee dans ce sens : rien a faire (evite de decompter deux fois)
    if (cibleValidation.statut === statut) return NextResponse.json({ error: 'Demande deja traitee' }, { status: 409 });
    // Seule une demande en attente peut etre validee ; une demande validee peut encore etre annulee (refusee)
    if (statut === 'validee' && cibleValidation.statut !== 'en_attente') return NextResponse.json({ error: 'Demande deja traitee' }, { status: 409 });
    // Personne ne valide sa propre demande, sauf le proprietaire de l'entreprise
    const moiValideur = await maFicheEquipe(req, tenantId);
    if (moiValideur && moiValideur === cibleValidation.employe_id && !(await estProprietaireDuTenant(req, tenantId))) {
      return NextResponse.json({ error: 'Vous ne pouvez pas valider votre propre demande' }, { status: 403 });
    }

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
      // Transition atomique depuis le statut lu : deux clics ne decomptent pas deux fois
      .eq('id', id).eq('tenant_id', tenantId).eq('statut', cibleValidation.statut).select('type,jours,employe_id').maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!absValidee) return NextResponse.json({ error: 'Demande deja traitee' }, { status: 409 });

    // Congé payé : validé -> on retire les jours ; validé puis annulé -> on les rend.
    const ancienStatut = cibleValidation.statut;
    if (absValidee.type === 'conge_paye' && (statut === 'validee' || ancienStatut === 'validee')) {
      const { data: empSolde } = await sb.from('equipe').select('conges_solde').eq('id', absValidee.employe_id).eq('tenant_id', tenantId).maybeSingle();
      if (empSolde) {
        const delta = statut === 'validee' ? -Number(absValidee.jours || 1) : Number(absValidee.jours || 1);
        await sb.from('equipe').update({ conges_solde: Math.max(0, Number(empSolde.conges_solde || 0) + delta) }).eq('id', absValidee.employe_id).eq('tenant_id', tenantId);
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
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
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
