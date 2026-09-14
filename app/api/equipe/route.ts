import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { estProprietaireDuTenant } from '../../lib/permissions';
import { envoyerWhatsApp } from '../../lib/whatsapp';
import { createClient } from '@supabase/supabase-js';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const sbAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendEmail(to: string, subject: string, html: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: 'Xyra <notifications@xyraio.fr>', to, subject, html });
}

async function inviterCompte(email: string) {
  try {
    const { data, error } = await sbAdmin.auth.admin.generateLink({ type: 'invite', email });
    if (error) { return { userId: null, inviteLink: null, erreurDiagnostic: error.message }; }
    if (!data?.user) { return { userId: null, inviteLink: null, erreurDiagnostic: 'pas d utilisateur retourne' }; }
    return { userId: data.user.id, inviteLink: (data as any)?.properties?.action_link || null, erreurDiagnostic: null };
  } catch (e: any) { return { userId: null, inviteLink: null, erreurDiagnostic: 'exception: ' + e.message }; }
}

// Calcul charges sociales simplifié (approximation France)
function calculerPaie(salaireBrut: number) {
  const chargesSalariales = Math.round(salaireBrut * 0.22);
  const chargesPatronales = Math.round(salaireBrut * 0.42);
  const salaireNet = salaireBrut - chargesSalariales;
  const coutTotal = salaireBrut + chargesPatronales;
  return { salaireBrut, chargesSalariales, chargesPatronales, salaireNet, coutTotal };
}

async function estAutoriseGererEquipe(req: NextRequest, tenantId: string): Promise<boolean> {
  const tokenVerif = req.cookies.get('sb-access-token')?.value;
  if (!tokenVerif) return false;
  const { data: authVerif } = await sbAdmin.auth.getUser(tokenVerif);
  if (!authVerif?.user) return false;
  const { data: membreVerif } = await sbAdmin.from('tenant_membres').select('role').eq('user_id', authVerif.user.id).eq('tenant_id', tenantId).maybeSingle();
  if (membreVerif?.role === 'owner') return true;
  const { data: monEquipe } = await sbAdmin.from('equipe').select('role').eq('user_id', authVerif.user.id).eq('tenant_id', tenantId).maybeSingle();
  return monEquipe?.role === 'Admin';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  // Route dediee self-service : l'employe connecte voit UNIQUEMENT ses
  // propres formations + le catalogue (pas les donnees RH sensibles des
  // collegues, contrairement au reste de cette route reserve au RH).
  if (action === 'mes_formations') {
    const tokenMoi = req.cookies.get('sb-access-token')?.value;
    if (!tokenMoi) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { data: authMoi } = await sb.auth.getUser(tokenMoi);
    if (!authMoi?.user) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { data: moi } = await sb.from('equipe').select('id, tenant_id').eq('user_id', authMoi.user.id).maybeSingle();
    if (!moi) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const [{ data: mesFormations }, { data: catalogueMoi }] = await Promise.all([
      sb.from('formations_equipe').select('*').eq('tenant_id', moi.tenant_id).eq('employe_id', moi.id).order('created_at', { ascending: false }),
      sb.from('formations_catalogue').select('*').eq('tenant_id', moi.tenant_id),
    ]);
    return NextResponse.json({ formations: mesFormations || [], catalogue: catalogueMoi || [] });
  }

  const companyId = searchParams.get('company_id');
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ membres: [], alertes: [] });

  // Lien temporaire vers un document employe (bucket prive) -- reserve RH/owner.
  if (action === 'info_entreprise') {
    const { data: tenantInfo } = await sb.from('tenants').select('societe,forme_juridique,siret,adresse,ville,code_postal').eq('id', tenantId).maybeSingle();
    return NextResponse.json({ entreprise: tenantInfo || null });
  }

  if (action === 'document_url') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const idDoc = searchParams.get('id');
    if (!idDoc) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const { data: doc } = await sb.from('documents_equipe').select('chemin,nom').eq('id', idDoc).eq('tenant_id', tenantId).maybeSingle();
    if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
    const { data: signee, error: errSignee } = await sb.storage.from('documents-equipe').createSignedUrl(doc.chemin, 300);
    if (errSignee || !signee) return NextResponse.json({ error: errSignee?.message || 'Lien indisponible' }, { status: 500 });
    return NextResponse.json({ url: signee.signedUrl, nom: doc.nom });
  }

  // Export mensuel "pret pour DSN" : donnees reelles structurees pour un
  // expert-comptable ou un futur branchement API Silae/PayFit -- ce n'est
  // PAS une DSN officielle (norme NEODES), juste les donnees source.
  if (action === 'export_paie') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const moisExport = searchParams.get('mois') || new Date().toISOString().slice(0, 7);
    const { data: membresExport } = await sb.from('equipe').select('*').eq('tenant_id', tenantId).order('nom', { ascending: true });
    const { data: pointagesExport } = await sb.from('pointages').select('*').eq('tenant_id', tenantId);
    const { data: absencesExport } = await sb.from('absences').select('*').eq('tenant_id', tenantId).eq('statut', 'validee');

    const lignes = (membresExport || []).map((m: any) => {
      const heures = (pointagesExport || [])
        .filter((p: any) => (p.employe_id === m.id || p.user_id === m.user_id) && String(p.date || '').slice(0, 7) === moisExport)
        .reduce((a: number, p: any) => a + Number(p.heures_travaillees || 0), 0);
      const absMois = (absencesExport || []).filter((a: any) => a.employe_id === m.id && String(a.debut || '').slice(0, 7) === moisExport);
      const joursMaladie = absMois.filter((a: any) => a.type === 'arret_maladie' || a.type === 'accident_travail').reduce((s: number, a: any) => s + Number(a.jours || 0), 0);
      const joursConges = absMois.filter((a: any) => a.type === 'conge_paye').reduce((s: number, a: any) => s + Number(a.jours || 0), 0);
      const joursAutres = absMois.filter((a: any) => !['arret_maladie', 'accident_travail', 'conge_paye'].includes(a.type)).reduce((s: number, a: any) => s + Number(a.jours || 0), 0);
      return [
        m.nom || '', m.prenom || '', m.nss || '', m.date_embauche || '', m.date_fin_contrat || '',
        m.contrat || '', Number(m.salaire_brut || m.salaire || 0), m.heures_semaine || 35,
        Math.round(heures * 10) / 10, joursMaladie, joursConges, joursAutres, m.rib || '',
      ];
    });
    const entetes = ['Nom', 'Prenom', 'NSS', 'Date embauche', 'Date fin contrat', 'Type contrat', 'Salaire brut', 'Heures/semaine contractuelles', 'Heures travaillees (mois)', 'Jours arret maladie/AT (mois)', 'Jours conges payes (mois)', 'Jours autres absences (mois)', 'RIB'];
    const echapper = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = '﻿' + [entetes.map(echapper).join(';'), ...lignes.map((l) => l.map(echapper).join(';'))].join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="export-paie-${moisExport}.csv"`,
      },
    });
  }

  // Rentabilite reelle par employe : CA encaisse (factures reellement payees,
  // reliees via le devis de la mission) vs cout reel (Paie). Le CA "missions"
  // (montant attribue, pas forcement facture/paye) reste affiche a cote pour
  // la transparence -- jamais fusionne silencieusement avec l'argent reel.
  if (action === 'rentabilite') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const moisR = searchParams.get('mois') || new Date().toISOString().slice(0, 7);
    const { data: membresR } = await sb.from('equipe').select('id,nom,prenom,salaire,salaire_brut').eq('tenant_id', tenantId);
    const { data: missionsR } = await sb.from('missions').select('id,employe_id,montant,statut,date_mission,service,devis_id').eq('tenant_id', tenantId).eq('statut', 'termine');
    const { data: devisR } = await sb.from('devis').select('id,montant').eq('tenant_id', tenantId);
    const { data: facturesR } = await sb.from('factures').select('devis_id,montant_ttc,statut').eq('tenant_id', tenantId).not('devis_id', 'is', null);

    const alertesDevis: any[] = [];
    const lignes = (membresR || []).map((m: any) => {
      const mesMissions = (missionsR || []).filter((ms: any) => ms.employe_id === m.id && String(ms.date_mission || '').slice(0, 7) === moisR);
      const caMissions = mesMissions.reduce((a: number, ms: any) => a + Number(ms.montant || 0), 0);

      let caEncaisse = 0;
      let missionsFacturees = 0;
      for (const ms of mesMissions) {
        if (!ms.devis_id) continue;
        const devis = (devisR || []).find((d: any) => d.id === ms.devis_id);
        if (devis && Math.abs(Number(devis.montant || 0) - Number(ms.montant || 0)) > 1) {
          alertesDevis.push({ mission_id: ms.id, employe: `${m.prenom || ''} ${m.nom}`.trim(), montantMission: Number(ms.montant || 0), montantDevis: Number(devis.montant || 0) });
        }
        const facturesLiees = (facturesR || []).filter((f: any) => f.devis_id === ms.devis_id && f.statut === 'payée');
        if (facturesLiees.length > 0) { caEncaisse += facturesLiees.reduce((a: number, f: any) => a + Number(f.montant_ttc || 0), 0); missionsFacturees++; }
      }

      const paie = calculerPaie(Number(m.salaire_brut || m.salaire || 0));
      const marge = caEncaisse - paie.coutTotal;
      return {
        employe_id: m.id, nom: `${m.prenom || ''} ${m.nom}`.trim(),
        nbMissions: mesMissions.length, missionsFacturees, caMissions, caEncaisse,
        coutTotal: paie.coutTotal, marge,
        margePct: paie.coutTotal > 0 ? Math.round((marge / paie.coutTotal) * 1000) / 10 : null,
      };
    });
    return NextResponse.json({ mois: moisR, lignes, alertesDevis });
  }

  let membresQuery = sb.from('equipe').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (companyId && UUID_RE.test(companyId)) membresQuery = membresQuery.eq('company_id', companyId);
  const { data: membres, error } = await membresQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pointages } = await sb.from('pointages').select('*').eq('tenant_id', tenantId).order('date', { ascending: false });
  const { data: conges } = await sb.from('conges').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  const { data: absences } = await sb.from('absences').select('*').eq('tenant_id', tenantId).order('debut', { ascending: false });
  const { data: acomptes } = await sb.from('acomptes').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  const { data: evaluations } = await sb.from('evaluations').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  const { data: formations } = await sb.from('formations_equipe').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  const { data: catalogue } = await sb.from('formations_catalogue').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  const { data: missions } = await sb.from('missions').select('*').eq('tenant_id', tenantId).order('date_mission', { ascending: false });
  const { data: positions } = await sb.from('positions_collaborateurs').select('*').eq('tenant_id', tenantId);
  const moisIsoCourant = new Date().toISOString().slice(0, 7);
  const { data: fichesPaie } = await sb.from('fiches_paie').select('*').eq('tenant_id', tenantId).eq('mois', moisIsoCourant);
  const { data: documents } = await sb.from('documents_equipe').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  const { data: objectifs } = await sb.from('objectifs_equipe').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  const { data: carriere } = await sb.from('carriere_equipe').select('*').eq('tenant_id', tenantId).order('date', { ascending: true });
  const { data: onboarding } = await sb.from('onboarding_equipe').select('*').eq('tenant_id', tenantId);

  const enriched = (membres || []).map((m: any) => {
    const mId = m.user_id || m.id;
    const mPointages = (pointages || []).filter((p: any) => p.employe_id === m.id || p.user_id === mId);
    const mConges = (conges || []).filter((c: any) => c.employe_id === m.id || c.user_id === mId);
    const mAbsences = (absences || []).filter((a: any) => a.employe_id === m.id || a.user_id === mId);
    const mAcomptes = (acomptes || []).filter((a: any) => a.employe_id === m.id);
    const mEvals = (evaluations || []).filter((e: any) => e.employe_id === m.id);
    const mFormations = (formations || []).filter((f: any) => f.employe_id === m.id);
    const mMissions = (missions || []).filter((ms: any) => ms.employe_id === m.id || ms.collaborateur_id === m.id);
    const mPosition = (positions || []).find((p: any) => p.collaborateur_id === m.id) || null;
    const mFichePaie = (fichesPaie || []).find((f: any) => f.employe_id === m.id) || null;
    const mDocuments = (documents || []).filter((d: any) => d.employe_id === m.id);
    const mObjectifs = (objectifs || []).filter((o: any) => o.employe_id === m.id).map((o: any) => ({
      id: o.id, obj: o.titre, actuel: Number(o.actuel), cible: Number(o.cible), color: o.couleur, unite: o.unite,
    }));
    const mCarriere = (carriere || []).filter((c: any) => c.employe_id === m.id).map((c: any) => ({
      id: c.id, poste: c.poste, salaire: Number(c.salaire), date: c.date,
    }));
    const mOnboardingManuel = (onboarding || []).filter((o: any) => o.employe_id === m.id);
    const etapeManuelle = (cle: string) => !!mOnboardingManuel.find((o: any) => o.etape === cle)?.fait;
    const mOnboarding = [
      { cle: 'dpae', etape: 'Déclaration préalable à l\'embauche (DPAE)', fait: etapeManuelle('dpae'), auto: false },
      { cle: 'contrat_signe', etape: 'Contrat de travail signé', fait: mDocuments.some((d: any) => d.type === 'Contrat signé'), auto: true },
      { cle: 'piece_identite', etape: 'Pièce d\'identité reçue', fait: mDocuments.some((d: any) => d.type === 'Carte d\'identité'), auto: true },
      { cle: 'rib', etape: 'RIB renseigné', fait: !!m.rib, auto: true },
      { cle: 'visite_medicale', etape: 'Visite médicale planifiée', fait: !!m.visite_medicale_echeance, auto: true },
      { cle: 'acces_espace', etape: 'Accès espace collaborateur créé', fait: !!m.user_id, auto: true },
      { cle: 'materiel', etape: 'Matériel et accès terrain remis', fait: etapeManuelle('materiel'), auto: false },
      { cle: 'briefing', etape: 'Briefing équipe effectué', fait: etapeManuelle('briefing'), auto: false },
    ];
    const mOffboarding = [
      { cle: 'entretien_depart', etape: 'Entretien de départ effectué', fait: etapeManuelle('entretien_depart'), auto: false },
      { cle: 'materiel_restitue', etape: 'Matériel et accès terrain restitués', fait: etapeManuelle('materiel_restitue'), auto: false },
      { cle: 'documents_finaux', etape: 'Documents finaux transmis (solde de tout compte, attestations)', fait: etapeManuelle('documents_finaux'), auto: false },
      { cle: 'acces_revoque', etape: 'Accès espace collaborateur révoqué', fait: !m.user_id, auto: true },
    ];

    const heuresCeMois = mPointages
      .filter((p: any) => new Date(p.date).getMonth() === new Date().getMonth())
      .reduce((a: number, p: any) => a + Number(p.heures_travaillees || 0), 0);

    const paie = calculerPaie(Number(m.salaire_brut || m.salaire || 0));

    return {
      ...m,
      pointages: mPointages.slice(0, 30),
      conges: mConges,
      absences: mAbsences,
      acomptes: mAcomptes,
      evaluations: mEvals,
      formations: mFormations,
      documents: mDocuments,
      objectifs: mObjectifs,
      carriere: mCarriere,
      onboarding: mOnboarding,
      offboarding: mOffboarding,
      missions: mMissions.slice(0, 20),
      heuresCeMois: Math.round(heuresCeMois * 10) / 10,
      paie,
      accesEspace: !!m.user_id,
      position: mPosition,
      fichePaieEnvoyee: !!mFichePaie?.envoyee_le,
      fichePaieEnvoyeeLe: mFichePaie?.envoyee_le || null,
    };
  });

  // Alertes globales
  const alertes = [];
  for (const m of enriched) {
    if (m.contrat === 'CDD' && m.date_fin_contrat) {
      const jours = Math.floor((new Date(m.date_fin_contrat).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (jours <= 30) alertes.push({ type: 'contrat', nom: `${m.prenom || ''} ${m.nom}`, detail: `CDD expire dans ${jours} jours`, couleur: '#FF8C3A' });
    }
    const congesEnAttente = m.conges?.filter((c: any) => c.statut === 'en_attente') || [];
    if (congesEnAttente.length > 0) alertes.push({ type: 'conge', nom: `${m.prenom || ''} ${m.nom}`, detail: `${congesEnAttente.length} demande(s) de congé en attente`, couleur: '#C9A84C' });
    const acomptesEnAttente = m.acomptes?.filter((a: any) => a.statut === 'en_attente') || [];
    if (acomptesEnAttente.length > 0) alertes.push({ type: 'acompte', nom: `${m.prenom || ''} ${m.nom}`, detail: `Demande d'acompte de ${acomptesEnAttente[0].montant}€`, couleur: '#FF5252' });
    if (m.conges_solde > 20) alertes.push({ type: 'conges_eleves', nom: `${m.prenom || ''} ${m.nom}`, detail: `${m.conges_solde} jours de congés accumulés`, couleur: '#5A5A7A' });
  }

  const { data: obligationsLegales } = await sb.from('obligations_legales').select('*').eq('tenant_id', tenantId).order('echeance', { ascending: true, nullsFirst: false });

  return NextResponse.json({ membres: enriched, alertes, catalogue: catalogue || [], obligationsLegales: obligationsLegales || [] });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });

  // Upload d'une vidéo dans la bibliothèque de formations, ou d'un document
  // employé (bucket privé) — formulaire multipart, traité à part avant le
  // parsing JSON du reste des actions.
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();

    if (formData.get('cible') === 'document_employe') {
      if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
      const employeId = String(formData.get('employe_id') || '');
      const type = String(formData.get('type') || 'Autre');
      const expireLe = String(formData.get('expire_le') || '') || null;
      const fichierDoc = formData.get('fichier') as File | null;
      if (!employeId || !fichierDoc) return NextResponse.json({ error: 'Employé et fichier requis' }, { status: 400 });
      const { data: empDoc } = await sb.from('equipe').select('id').eq('id', employeId).eq('tenant_id', tenantId).maybeSingle();
      if (!empDoc) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
      const extensionDoc = (fichierDoc.name.split('.').pop() || 'pdf').toLowerCase();
      const cheminDoc = `${tenantId}/${employeId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionDoc}`;
      const bytesDoc = await fichierDoc.arrayBuffer();
      const { error: errUploadDoc } = await sb.storage.from('documents-equipe').upload(cheminDoc, Buffer.from(bytesDoc), {
        contentType: fichierDoc.type || 'application/octet-stream',
        upsert: false,
      });
      if (errUploadDoc) return NextResponse.json({ error: errUploadDoc.message }, { status: 500 });
      const { data: docInsere, error: errDocInsert } = await sb.from('documents_equipe').insert({
        tenant_id: tenantId, employe_id: employeId, nom: fichierDoc.name, type,
        chemin: cheminDoc, taille: fichierDoc.size, expire_le: expireLe,
      }).select().single();
      if (errDocInsert) return NextResponse.json({ error: errDocInsert.message }, { status: 500 });
      return NextResponse.json({ success: true, document: docInsere });
    }

    const titre = String(formData.get('titre') || '').trim();
    const description = String(formData.get('description') || '');
    const fichier = formData.get('video') as File | null;
    if (!titre) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
    if (!fichier) return NextResponse.json({ error: 'Fichier vidéo requis' }, { status: 400 });
    const extension = (fichier.name.split('.').pop() || 'mp4').toLowerCase();
    const chemin = `${tenantId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const bytes = await fichier.arrayBuffer();
    const { error: errUpload } = await sb.storage.from('formations-videos').upload(chemin, Buffer.from(bytes), {
      contentType: fichier.type || 'video/mp4',
      upsert: false,
    });
    if (errUpload) return NextResponse.json({ error: errUpload.message }, { status: 500 });
    const { data: urlData } = sb.storage.from('formations-videos').getPublicUrl(chemin);
    const { data, error } = await sb.from('formations_catalogue').insert({
      tenant_id: tenantId, titre, description, video_url: urlData.publicUrl,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, modele: data });
  }

  const body = await req.json();
  const { action } = body;
  if (action === 'message_groupe') {
    const { message, company_id } = body;
    if (!message) return NextResponse.json({ success: false, error: 'Message requis' }, { status: 400 });
    let mq = sb.from('equipe').select('*').eq('tenant_id', tenantId);
    if (company_id) mq = mq.eq('company_id', company_id);
    const { data: membres } = await mq;
    let envoyes = 0;

    for (const m of (membres || [])) {
      const { data: convExistante } = await sb.from('conversations').select('id').eq('espace', 'equipe').eq('contact_email', m.email).eq('tenant_id', tenantId).maybeSingle();
      let convId = convExistante?.id;
      if (!convId) {
        const { data: newConv } = await sb.from('conversations').insert({
          espace: 'equipe', contact_nom: m.nom, contact_email: m.email, contact_tel: m.tel,
          jitsi_room: `xyra-${Date.now().toString(36)}-${envoyes}`,
          tenant_id: tenantId,
        }).select('id').single();
        convId = newConv?.id;
      }
      if (convId) {
        await sb.from('chat_messages').insert({ conversation_id: convId, auteur: 'Curtiss', contenu: message, moi: true, type: 'texte' });
        await sb.from('conversations').update({ derniere_activite: new Date().toISOString() }).eq('id', convId);
        envoyes++;
      }
    }
    return NextResponse.json({ success: true, envoyes });
  }
  if (action === 'corriger_pointage') {
    if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { employe_id, date, heure_arrivee, heure_depart } = body;
    if (!employe_id || !date) return NextResponse.json({ error: 'employe_id et date requis' }, { status: 400 });
    let heures_travaillees = null;
    if (heure_arrivee && heure_depart) {
      const [ha, ma] = heure_arrivee.split(':').map(Number);
      const [hd, md] = heure_depart.split(':').map(Number);
      heures_travaillees = Math.round(((hd * 60 + md) - (ha * 60 + ma)) / 6) / 10;
    }
    const { data: existant } = await sb.from('pointages').select('id').eq('employe_id', employe_id).eq('date', date).eq('tenant_id', tenantId).maybeSingle();
    const champsPointage = { heure_arrivee: heure_arrivee || null, heure_depart: heure_depart || null, heures_travaillees };
    if (existant) {
      const { error } = await sb.from('pointages').update(champsPointage).eq('id', existant.id).eq('tenant_id', tenantId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await sb.from('pointages').insert({ employe_id, tenant_id: tenantId, date, ...champsPointage });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer_document') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const { data: docSuppr } = await sb.from('documents_equipe').select('chemin').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!docSuppr) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
    await sb.storage.from('documents-equipe').remove([docSuppr.chemin]);
    const { error } = await sb.from('documents_equipe').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'envoyer_document') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const { data: docEnvoi } = await sb.from('documents_equipe').select('*, equipe:employe_id(nom,prenom,email)').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!docEnvoi) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
    const emailDest = (docEnvoi as any).equipe?.email;
    if (!emailDest) return NextResponse.json({ error: 'Aucun email pour cet employé' }, { status: 400 });
    const { data: fichierTelecharge, error: errTelecharge } = await sb.storage.from('documents-equipe').download(docEnvoi.chemin);
    if (errTelecharge || !fichierTelecharge) return NextResponse.json({ error: errTelecharge?.message || 'Fichier introuvable' }, { status: 500 });
    const octetsDoc = Buffer.from(await fichierTelecharge.arrayBuffer());
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Xyra <notifications@xyraio.fr>',
        to: emailDest,
        subject: `Document — ${docEnvoi.nom}`,
        html: `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${(docEnvoi as any).equipe?.prenom || ''},</p><p>Vous trouverez en pièce jointe le document <strong>${docEnvoi.nom}</strong> (${docEnvoi.type || 'document'}).</p></div>`,
        attachments: [{ filename: docEnvoi.nom, content: octetsDoc.toString('base64') }],
      });
    } catch (e: any) {
      return NextResponse.json({ error: 'Envoi email échoué : ' + e.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, email: emailDest });
  }

  if (action === 'ajouter_obligation') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { libelle, echeance, statut } = body;
    if (!libelle) return NextResponse.json({ error: 'Libellé requis' }, { status: 400 });
    const { data, error } = await sb.from('obligations_legales').insert({
      tenant_id: tenantId, libelle, echeance: echeance || null, statut: statut || 'a_faire',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, obligation: data });
  }

  if (action === 'maj_obligation') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id, statut, echeance } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const champs: any = {};
    if (statut !== undefined) champs.statut = statut;
    if (echeance !== undefined) champs.echeance = echeance || null;
    const { error } = await sb.from('obligations_legales').update(champs).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer_obligation') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const { error } = await sb.from('obligations_legales').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'generer_obligations_ia') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { data: tenantObl } = await sb.from('tenants').select('societe,metier,secteur').eq('id', tenantId).maybeSingle();
    const { count: effectif } = await sb.from('equipe').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId);
    try {
      const prompt = `Pour une entreprise française du secteur "${tenantObl?.secteur || tenantObl?.metier || 'services'}" avec ${effectif || 0} salarié(s), liste 5 à 8 obligations légales RH concrètes et actuellement d'actualité (affichage obligatoire, registre du personnel, DUER, mutuelle/prévoyance, visites médicales, formations sécurité, etc.), adaptées à cette taille d'effectif. Réponds UNIQUEMENT en JSON strict : un tableau d'objets {"libelle": string}. Pas de texte autour.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 600, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const texte = (data.content?.[0]?.text || '[]').trim();
      const jsonMatch = texte.match(/\[[\s\S]*\]/);
      const items = JSON.parse(jsonMatch ? jsonMatch[0] : texte);
      if (!Array.isArray(items)) throw new Error('Réponse IA invalide');
      const lignes = items.filter((it: any) => it?.libelle).map((it: any) => ({ tenant_id: tenantId, libelle: String(it.libelle), statut: 'a_faire' }));
      if (lignes.length === 0) return NextResponse.json({ error: 'Aucune obligation générée' }, { status: 500 });
      const { data: inserees, error } = await sb.from('obligations_legales').insert(lignes).select();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, obligations: inserees });
    } catch (e: any) {
      return NextResponse.json({ error: 'Génération IA échouée : ' + e.message }, { status: 500 });
    }
  }

  if (action === 'apercu_registre_personnel') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { data: membresReg } = await sb.from('equipe').select('nom,prenom,role,contrat,date_embauche,date_fin_contrat').eq('tenant_id', tenantId).order('date_embauche', { ascending: true });
    const { data: tenantReg } = await sb.from('tenants').select('societe,siret,adresse,ville,code_postal').eq('id', tenantId).maybeSingle();
    const lignes = (membresReg || []).map((m: any) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${m.prenom || ''} ${m.nom}</td><td style="padding:8px;border-bottom:1px solid #eee;">${m.role || '—'}</td><td style="padding:8px;border-bottom:1px solid #eee;">${m.contrat}</td><td style="padding:8px;border-bottom:1px solid #eee;">${m.date_embauche ? new Date(m.date_embauche).toLocaleDateString('fr-FR') : '—'}</td><td style="padding:8px;border-bottom:1px solid #eee;">${m.date_fin_contrat ? new Date(m.date_fin_contrat).toLocaleDateString('fr-FR') : '—'}</td></tr>`).join('');
    const html = `<div style="font-family:sans-serif;padding:32px;color:#222;">
      <h2 style="color:#C9A84C">Registre unique du personnel</h2>
      <p><strong>${tenantReg?.societe || 'Xyra'}</strong>${tenantReg?.siret ? ' · SIRET ' + tenantReg.siret : ''}${tenantReg?.adresse ? '<br/>' + tenantReg.adresse + (tenantReg.code_postal ? ', ' + tenantReg.code_postal : '') + (tenantReg.ville ? ' ' + tenantReg.ville : '') : ''}</p>
      <p style="color:#888;font-size:12px;">Édité le ${new Date().toLocaleDateString('fr-FR')} — ${(membresReg || []).length} salarié(s) inscrit(s)</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #C9A84C;">Nom</th><th style="text-align:left;padding:8px;border-bottom:2px solid #C9A84C;">Poste</th><th style="text-align:left;padding:8px;border-bottom:2px solid #C9A84C;">Contrat</th><th style="text-align:left;padding:8px;border-bottom:2px solid #C9A84C;">Embauche</th><th style="text-align:left;padding:8px;border-bottom:2px solid #C9A84C;">Fin (si CDD)</th></tr></thead>
        <tbody>${lignes}</tbody>
      </table>
    </div>`;
    return NextResponse.json({ success: true, html });
  }

  if (action === 'generer_duer') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { data: tenantDuer } = await sb.from('tenants').select('societe,metier,secteur').eq('id', tenantId).maybeSingle();
    const { count: effectifDuer } = await sb.from('equipe').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId);
    let corpsDuer = '';
    try {
      const prompt = `Rédige un brouillon de Document Unique d'Évaluation des Risques (DUER) pour une entreprise française du secteur "${tenantDuer?.secteur || tenantDuer?.metier || 'services'}" avec ${effectifDuer || 0} salarié(s). Liste 5 à 7 risques professionnels plausibles pour ce secteur, chacun avec : nature du risque, niveau (faible/modéré/élevé), mesures de prévention. Format concis, professionnel. Réponds en HTML simple (juste des <h4>, <p>, <ul><li>), sans <html>/<body>.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1200, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      corpsDuer = data.content?.[0]?.text || '';
    } catch (e: any) {
      return NextResponse.json({ error: 'Génération IA échouée : ' + e.message }, { status: 500 });
    }
    const html = `<div style="font-family:sans-serif;padding:32px;color:#222;max-width:750px;">
      <h2 style="color:#C9A84C">Document Unique d'Évaluation des Risques — Brouillon</h2>
      <p><strong>${tenantDuer?.societe || 'Xyra'}</strong> · ${effectifDuer || 0} salarié(s) · Édité le ${new Date().toLocaleDateString('fr-FR')}</p>
      <p style="background:#fff3cd;border:1px solid #ffe69c;padding:10px;border-radius:6px;font-size:12px;">⚠️ Brouillon généré automatiquement, à faire valider et compléter par l'employeur avant tenue officielle du DUER.</p>
      ${corpsDuer}
    </div>`;
    return NextResponse.json({ success: true, html });
  }

  if (action === 'toggle_onboarding') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { employe_id, etape, fait } = body;
    if (!employe_id || !etape) return NextResponse.json({ error: 'employe_id et etape requis' }, { status: 400 });
    const { error } = await sb.from('onboarding_equipe').upsert({
      tenant_id: tenantId, employe_id, etape, fait: !!fait, fait_le: fait ? new Date().toISOString() : null,
    }, { onConflict: 'employe_id,etape' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'ajouter_promotion') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { employe_id, poste, salaire, date } = body;
    if (!employe_id || !poste || !salaire) return NextResponse.json({ error: 'Poste, salaire et employé requis' }, { status: 400 });
    const { data: empCar } = await sb.from('equipe').select('id, salaire_brut').eq('id', employe_id).eq('tenant_id', tenantId).maybeSingle();
    if (!empCar) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    const { data, error } = await sb.from('carriere_equipe').insert({
      tenant_id: tenantId, employe_id, poste, salaire: Number(salaire), date: date || new Date().toISOString().slice(0, 10),
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const majEquipe: any = { role: poste, salaire: Number(salaire) };
    if (empCar.salaire_brut) majEquipe.salaire_brut = Number(salaire);
    await sb.from('equipe').update(majEquipe).eq('id', employe_id).eq('tenant_id', tenantId);
    return NextResponse.json({ success: true, promotion: data });
  }

  if (action === 'ajouter_objectif') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { employe_id, titre, cible, actuel, unite, couleur } = body;
    if (!employe_id || !titre || !cible) return NextResponse.json({ error: 'Employé, titre et cible requis' }, { status: 400 });
    const { data: empObj } = await sb.from('equipe').select('id').eq('id', employe_id).eq('tenant_id', tenantId).maybeSingle();
    if (!empObj) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    const { data, error } = await sb.from('objectifs_equipe').insert({
      tenant_id: tenantId, employe_id, titre, cible: Number(cible), actuel: Number(actuel) || 0,
      unite: unite || null, couleur: couleur || '#4B7BFF',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, objectif: data });
  }

  if (action === 'maj_objectif') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id, actuel } = body;
    if (!id || actuel === undefined) return NextResponse.json({ error: 'id et actuel requis' }, { status: 400 });
    const { error } = await sb.from('objectifs_equipe').update({ actuel: Number(actuel) }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer_objectif') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const { error } = await sb.from('objectifs_equipe').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'generer_contrat') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id, avecIa, envoyer } = body;
    const { data: m } = await sb.from('equipe').select('*').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!m) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    const { data: tenant } = await sb.from('tenants').select('societe,siret,adresse,ville,code_postal,forme_juridique,nom_contact').eq('id', tenantId).maybeSingle();
    const salaireBrut = Number(m.salaire_brut || m.salaire || 0);
    const dateEmbauche = m.date_embauche ? new Date(m.date_embauche).toLocaleDateString('fr-FR') : '—';
    const dateFin = m.date_fin_contrat ? new Date(m.date_fin_contrat).toLocaleDateString('fr-FR') : null;

    let corpsIa = '';
    if (avecIa) {
      try {
        const prompt = `Rédige les clauses principales (objet du contrat, période d'essai, durée du travail, confidentialité, non-concurrence légère) d'un contrat de travail ${m.contrat} français, de façon concise et professionnelle (6-8 lignes), pour :
Employeur : ${tenant?.societe || 'Xyra'}
Salarié : ${m.prenom || ''} ${m.nom}, poste : ${m.role}
Rémunération brute : ${salaireBrut}€/mois
Durée hebdomadaire : ${m.heures_semaine || 35}h
${dateFin ? `Terme prévu : ${dateFin}` : ''}
Ne rédige que les clauses, sans en-tête ni signature.`;
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 500, messages: [{ role: 'user', content: prompt }] }),
        });
        const data = await res.json();
        corpsIa = (data.content?.[0]?.text || '').replace(/\n/g, '<br/>');
      } catch (e: any) {
        return NextResponse.json({ error: 'Génération IA échouée : ' + e.message }, { status: 500 });
      }
    }

    const html = `<div style="font-family:sans-serif;padding:32px;max-width:700px;color:#222;">
      <h2 style="color:#C9A84C">Contrat de travail — ${m.contrat}</h2>
      <p><strong>${tenant?.societe || 'Xyra'}</strong>${tenant?.siret ? ' · SIRET ' + tenant.siret : ''}${tenant?.adresse ? '<br/>' + tenant.adresse + (tenant.code_postal ? ', ' + tenant.code_postal : '') + (tenant.ville ? ' ' + tenant.ville : '') : ''}</p>
      <p>Entre l'employeur ci-dessus et <strong>${m.prenom || ''} ${m.nom}</strong>, il est convenu ce qui suit :</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="background:#f5f5f5"><td style="padding:8px">Poste</td><td style="padding:8px;text-align:right">${m.role || '—'}</td></tr>
        <tr><td style="padding:8px">Type de contrat</td><td style="padding:8px;text-align:right">${m.contrat}</td></tr>
        <tr style="background:#f5f5f5"><td style="padding:8px">Date d'embauche</td><td style="padding:8px;text-align:right">${dateEmbauche}</td></tr>
        ${dateFin ? `<tr><td style="padding:8px">Terme prévu</td><td style="padding:8px;text-align:right">${dateFin}</td></tr>` : ''}
        <tr style="background:#f5f5f5"><td style="padding:8px">Durée hebdomadaire</td><td style="padding:8px;text-align:right">${m.heures_semaine || 35}h</td></tr>
        <tr><td style="padding:8px"><strong>Rémunération brute mensuelle</strong></td><td style="padding:8px;text-align:right"><strong>${salaireBrut}€</strong></td></tr>
      </table>
      ${corpsIa ? `<div style="margin-top:16px;"><h3 style="font-size:14px;color:#555;">Clauses</h3><p style="line-height:1.6;">${corpsIa}</p></div>` : ''}
      <p style="color:#888;font-size:12px;margin-top:24px;">Document généré le ${new Date().toLocaleDateString('fr-FR')} — à faire relire et signer avant application. ${tenant?.societe || 'Xyra'} — Document généré automatiquement, ne vaut pas contrat définitif tant que non signé.</p>
    </div>`;
    if (envoyer) {
      if (!m.email) return NextResponse.json({ error: 'Aucun email pour cet employé' }, { status: 400 });
      try {
        await sendEmail(m.email, `Votre contrat de travail (${m.contrat})`, html);
      } catch (e: any) {
        return NextResponse.json({ error: 'Envoi email échoué : ' + e.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, html });
  }

  if (action === 'envoyer_contrat_whatsapp') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id } = body;
    const { data: m } = await sb.from('equipe').select('nom,prenom,tel,contrat').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!m) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    if (!m.tel) return NextResponse.json({ error: 'Aucun numéro de téléphone pour cet employé' }, { status: 400 });
    const resultat = await envoyerWhatsApp(m.tel, `Bonjour ${m.prenom || m.nom}, votre contrat de travail (${m.contrat}) est prêt. Votre RH vous le transmettra pour signature. À bientôt !`, tenantId);
    if (!resultat.ok) return NextResponse.json({ error: resultat.raison || 'Envoi échoué' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'creer') {
    if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });

    const { nom, prenom, role, email, tel, adresse, date_naissance, nss, rib, contrat, salaire_brut, couleur, date_embauche, zones_intervention, competences, company_id } = body;
    if (!nom || !email) return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });

    if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const tenantIdCreation = tenantId;
    const { userId, inviteLink, erreurDiagnostic } = await inviterCompte(email);
    const salaireNet = Math.round(Number(salaire_brut || 0) * 0.78);

    const { data, error } = await sb.from('equipe').insert({
      nom, prenom, role, email, tel, adresse, date_naissance, nss, rib,
      tenant_id: tenantIdCreation, company_id: company_id || null,
      zones_intervention: zones_intervention || null, competences: competences || null,
      contrat: contrat || 'CDI',
      salaire: salaireNet,
      salaire_brut: Number(salaire_brut || 0),
      couleur: couleur || '#4B7BFF',
      date_embauche: date_embauche || new Date().toISOString().split('T')[0],
      statut: 'Disponible',
      conges_solde: 25,
      user_id: userId,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (userId && tenantIdCreation) {
      try {
        await sb.from("tenant_membres").insert({ user_id: userId, tenant_id: tenantIdCreation, role: "collaborateur" });
      } catch (e) {}
    }

    try {
      const lien = inviteLink ? `<p><a href="${inviteLink}" style="color:#C9A84C">Cliquez ici pour créer votre mot de passe et accéder à votre espace équipe</a></p>` : '';
      await sendEmail(email, 'Bienvenue dans l\'équipe Xyra !',
        `<div style="font-family:sans-serif;padding:24px;background:#06060E;color:#EAE6DE;">
          <h2 style="color:#C9A84C">Bienvenue ${prenom || nom} !</h2>
          <p>Vous rejoignez l'équipe Xyra en tant que <strong>${role || 'Collaborateur'}</strong>.</p>
          <p>Votre espace personnel vous permet de consulter vos missions, pointer vos heures, poser des congés et voir vos fiches de paie.</p>
          ${lien}
        </div>`
      );
    } catch { /* non bloquant */ }

    return NextResponse.json({ success: true, membre: data, accesCree: !!userId, erreurDiagnostic });
  }

  if (action === 'inviter_espace') {
    const { id } = body;
    const { data: m } = await sb.from('equipe').select('*').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!m) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    if (!m.email) return NextResponse.json({ error: 'Email manquant' }, { status: 400 });
    if (m.user_id) return NextResponse.json({ error: 'Cet employé a déjà un accès' }, { status: 400 });

    const { userId, inviteLink } = await inviterCompte(m.email);
    if (!userId) return NextResponse.json({ error: 'Échec création compte' }, { status: 500 });

    await sb.from('equipe').update({ user_id: userId }).eq('id', id).eq('tenant_id', tenantId);
    try {
      const lien = inviteLink ? `<p><a href="${inviteLink}">Cliquez ici pour activer votre accès</a></p>` : '';
      await sendEmail(m.email, 'Votre espace équipe Xyra est prêt',
        `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${m.prenom || m.nom},</p><p>Votre espace équipe est maintenant disponible.</p>${lien}</div>`
      );
    } catch { /* non bloquant */ }

    return NextResponse.json({ success: true });
  }

  if (action === 'modifier') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id, ...fields } = body;
    if ('peut_signer_devis' in fields && !(await estProprietaireDuTenant(req, tenantId))) {
      return NextResponse.json({ error: 'reserve_au_proprietaire' }, { status: 403 });
    }
    const { error } = await sb.from('equipe').update(fields).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id } = body;
    const { data: m } = await sb.from('equipe').select('user_id').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!m) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    if (m.user_id) {
      try { await sbAdmin.auth.admin.deleteUser(m.user_id); } catch { /* non bloquant */ }
    }
    const { error } = await sb.from('equipe').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'revoquer_acces') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const { id } = body;
    const { data: m } = await sb.from('equipe').select('user_id').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!m) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    if (m.user_id) {
      try { await sbAdmin.auth.admin.deleteUser(m.user_id); } catch { /* non bloquant */ }
    }
    const { error } = await sb.from('equipe').update({ user_id: null }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'valider_conge') {
    const { id, employe_id, jours } = body;
    await sb.from('conges').update({ statut: 'validé' }).eq('id', id).eq('tenant_id', tenantId);

    // Décrémenter le solde
    const { data: emp } = await sb.from('equipe').select('conges_solde').eq('id', employe_id).eq('tenant_id', tenantId).maybeSingle();
    if (emp) await sb.from('equipe').update({ conges_solde: Math.max(0, (emp.conges_solde || 0) - (jours || 1)) }).eq('id', employe_id).eq('tenant_id', tenantId);
    return NextResponse.json({ success: true });
  }

  if (action === 'refuser_conge') {
    const { id } = body;
    await sb.from('conges').update({ statut: 'refusé' }).eq('id', id).eq('tenant_id', tenantId);
    return NextResponse.json({ success: true });
  }

  if (action === 'valider_acompte') {
    const { id, employe_id, montant, nom_employe, company_id } = body;
    await sb.from('acomptes').update({ statut: 'validé' }).eq('id', id).eq('tenant_id', tenantId);
    // Crée une vraie transaction dans le wallet
    await sb.from('wallet_transactions').insert({
      type: 'acompte',
      libelle: `Acompte ${nom_employe}`,
      montant: Number(montant),
      devise: 'EUR',
      methode: 'sepa',
      statut: 'à_virer',
      ref: `ACOMP-${Date.now()}`,
      destinataire_nom: nom_employe,
      tenant_id: tenantId,
      company_id: company_id || null,
    });
    return NextResponse.json({ success: true });
  }

  if (action === 'refuser_acompte') {
    const { id } = body;
    await sb.from('acomptes').update({ statut: 'refusé' }).eq('id', id).eq('tenant_id', tenantId);
    return NextResponse.json({ success: true });
  }

  if (action === 'ajouter_evaluation') {
    const { employe_id, note, points_forts, axes_amelioration } = body;
    const { data: empVerifEval } = await sb.from('equipe').select('id').eq('id', employe_id).eq('tenant_id', tenantId).maybeSingle();
    if (!empVerifEval) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    const { data, error } = await sb.from('evaluations').insert({ employe_id, note, points_forts, axes_amelioration, evaluateur: 'Curtiss', tenant_id: tenantId }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await sb.from('equipe').update({ performance: note }).eq('id', employe_id).eq('tenant_id', tenantId);
    return NextResponse.json({ success: true, evaluation: data });
  }

  if (action === 'ajouter_formation') {
    let { employe_id, titre, statut, catalogue_id } = body;
    const { data: empVerifForm } = await sb.from('equipe').select('id').eq('id', employe_id).eq('tenant_id', tenantId).maybeSingle();
    if (!empVerifForm) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    if (catalogue_id) {
      const { data: modele } = await sb.from('formations_catalogue').select('titre').eq('id', catalogue_id).eq('tenant_id', tenantId).maybeSingle();
      if (!modele) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 });
      titre = modele.titre;
    }
    const { data, error } = await sb.from('formations_equipe').insert({ employe_id, titre, statut: statut || 'a_faire', tenant_id: tenantId, catalogue_id: catalogue_id || null }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, formation: data });
  }

  if (action === 'maj_formation') {
    const { id, statut, score } = body;
    const { data: formVerif } = await sb.from('formations_equipe').select('id').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!formVerif) return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 });
    const champs: any = { statut };
    if (score !== undefined && score !== null) champs.score = score;
    if (statut === 'complété') champs.date_completion = new Date().toISOString().split('T')[0];
    const { data, error } = await sb.from('formations_equipe').update(champs).eq('id', id).eq('tenant_id', tenantId).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, formation: data });
  }

  if (action === 'analyse_ia') {
    const { membre } = body;
    if (!membre) return NextResponse.json({ error: 'Données membre manquantes' }, { status: 400 });
    try {
      const prompt = `Tu es DRH chez Xyra. Voici les données réelles d'un employé :
Nom : ${membre.prenom || ''} ${membre.nom}
Rôle : ${membre.role}
Contrat : ${membre.contrat}
Salaire brut : ${membre.salaire_brut}€
Performance : ${membre.performance}/100
Heures ce mois : ${membre.heuresCeMois}h
Missions réalisées : ${membre.missions?.length || 0}
Congés restants : ${membre.conges_solde} jours
Évaluations : ${membre.evaluations?.length || 0}

Rédige une analyse RH courte (4-5 phrases) avec une recommandation concrète sur l'évolution, la formation ou la rémunération de cet employé. Base-toi uniquement sur les données fournies.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const analyse = data.content?.[0]?.text || 'Analyse indisponible.';
      return NextResponse.json({ success: true, analyse });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'generer_fiche_paie') {
    const { id, envoyer } = body;
    const { data: m } = await sb.from('equipe').select('*').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!m) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const paie = calculerPaie(Number(m.salaire_brut || m.salaire || 0));
    const moisIso = new Date().toISOString().slice(0, 7);
    const mois = new Date().toLocaleDateString('fr', { month: 'long', year: 'numeric' });
    const html = `<div style="font-family:sans-serif;padding:24px;max-width:600px;">
      <h2 style="color:#C9A84C">Fiche de paie — ${mois}</h2>
      <p><strong>${m.prenom || ''} ${m.nom}</strong> · ${m.role}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr style="background:#f5f5f5"><td style="padding:8px">Salaire brut</td><td style="padding:8px;text-align:right"><strong>${paie.salaireBrut}€</strong></td></tr>
        <tr><td style="padding:8px">Charges salariales (22%)</td><td style="padding:8px;text-align:right">-${paie.chargesSalariales}€</td></tr>
        <tr style="background:#f5f5f5"><td style="padding:8px"><strong>Salaire net à payer</strong></td><td style="padding:8px;text-align:right"><strong style="color:#2EC9B0">${paie.salaireNet}€</strong></td></tr>
        <tr><td style="padding:8px;color:#888">Charges patronales (42%)</td><td style="padding:8px;text-align:right;color:#888">${paie.chargesPatronales}€</td></tr>
        <tr style="background:#f5f5f5"><td style="padding:8px;color:#888">Coût total employeur</td><td style="padding:8px;text-align:right;color:#888">${paie.coutTotal}€</td></tr>
      </table>
      <p style="color:#888;font-size:12px;margin-top:16px;">Xyra Services · Signé Curtiss — Fondateur</p>
    </div>`;

    let envoyee = false;
    if (envoyer !== false) {
      if (!m.email) return NextResponse.json({ error: 'Aucun email pour cet employé' }, { status: 400 });
      try {
        await sendEmail(m.email, `Votre fiche de paie — ${mois}`, html);
        envoyee = true;
      } catch (e: any) {
        return NextResponse.json({ error: 'Envoi email échoué : ' + e.message }, { status: 500 });
      }
      await sb.from('fiches_paie').upsert({
        tenant_id: tenantId, employe_id: id, mois: moisIso, envoyee_le: new Date().toISOString(),
      }, { onConflict: 'employe_id,mois' });
    }

    return NextResponse.json({ success: true, html, paie, mois, envoyee });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}