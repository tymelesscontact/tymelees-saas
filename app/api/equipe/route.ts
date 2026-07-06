import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
    if (error || !data?.user) return { userId: null, inviteLink: null };
    return { userId: data.user.id, inviteLink: (data as any)?.properties?.action_link || null };
  } catch { return { userId: null, inviteLink: null }; }
}

// Calcul charges sociales simplifié (approximation France)
function calculerPaie(salaireBrut: number) {
  const chargesSalariales = Math.round(salaireBrut * 0.22);
  const chargesPatronales = Math.round(salaireBrut * 0.42);
  const salaireNet = salaireBrut - chargesSalariales;
  const coutTotal = salaireBrut + chargesPatronales;
  return { salaireBrut, chargesSalariales, chargesPatronales, salaireNet, coutTotal };
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  let membresQuery = sb.from('equipe').select('*').order('created_at', { ascending: false });
  if (tenantId) membresQuery = membresQuery.eq('tenant_id', tenantId);
  const { data: membres, error } = await membresQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pointages } = await sb.from('pointages').select('*').order('date', { ascending: false });
  const { data: conges } = await sb.from('conges').select('*').order('created_at', { ascending: false });
  const { data: absences } = await sb.from('absences').select('*').order('debut', { ascending: false });
  const { data: acomptes } = await sb.from('acomptes').select('*').order('created_at', { ascending: false });
  const { data: evaluations } = await sb.from('evaluations').select('*').order('created_at', { ascending: false });
  const { data: formations } = await sb.from('formations_equipe').select('*').order('created_at', { ascending: false });
  const { data: missions } = await sb.from('missions').select('*').order('date_mission', { ascending: false });

  const enriched = (membres || []).map((m: any) => {
    const mId = m.user_id || m.id;
    const mPointages = (pointages || []).filter((p: any) => p.employe_id === m.id || p.user_id === mId);
    const mConges = (conges || []).filter((c: any) => c.employe_id === m.id || c.user_id === mId);
    const mAbsences = (absences || []).filter((a: any) => a.employe_id === m.id || a.user_id === mId);
    const mAcomptes = (acomptes || []).filter((a: any) => a.employe_id === m.id);
    const mEvals = (evaluations || []).filter((e: any) => e.employe_id === m.id);
    const mFormations = (formations || []).filter((f: any) => f.employe_id === m.id);
    const mMissions = (missions || []).filter((ms: any) => ms.employe_id === m.id || ms.collaborateur_id === m.id);

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
      missions: mMissions.slice(0, 20),
      heuresCeMois: Math.round(heuresCeMois * 10) / 10,
      paie,
      accesEspace: !!m.user_id,
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

  return NextResponse.json({ membres: enriched, alertes });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { nom, prenom, role, email, tel, adresse, date_naissance, nss, rib, contrat, salaire_brut, couleur, date_embauche } = body;
    if (!nom || !email) return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });

    const { userId, inviteLink } = await inviterCompte(email);
    const salaireNet = Math.round(Number(salaire_brut || 0) * 0.78);

    const { data, error } = await sb.from('equipe').insert({
      nom, prenom, role, email, tel, adresse, date_naissance, nss, rib,
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

    return NextResponse.json({ success: true, membre: data, accesCree: !!userId });
  }

  if (action === 'inviter_espace') {
    const { id } = body;
    const { data: m } = await sb.from('equipe').select('*').eq('id', id).single();
    if (!m?.email) return NextResponse.json({ error: 'Email manquant' }, { status: 400 });
    if (m.user_id) return NextResponse.json({ error: 'Cet employé a déjà un accès' }, { status: 400 });

    const { userId, inviteLink } = await inviterCompte(m.email);
    if (!userId) return NextResponse.json({ error: 'Échec création compte' }, { status: 500 });

    await sb.from('equipe').update({ user_id: userId }).eq('id', id);
    try {
      const lien = inviteLink ? `<p><a href="${inviteLink}">Cliquez ici pour activer votre accès</a></p>` : '';
      await sendEmail(m.email, 'Votre espace équipe Xyra est prêt',
        `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${m.prenom || m.nom},</p><p>Votre espace équipe est maintenant disponible.</p>${lien}</div>`
      );
    } catch { /* non bloquant */ }

    return NextResponse.json({ success: true });
  }

  if (action === 'modifier') {
    const { id, ...fields } = body;
    const { error } = await sb.from('equipe').update(fields).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { data: m } = await sb.from('equipe').select('user_id').eq('id', id).single();
    if (m?.user_id) {
      try { await sbAdmin.auth.admin.deleteUser(m.user_id); } catch { /* non bloquant */ }
    }
    const { error } = await sb.from('equipe').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'valider_conge') {
    const { id, employe_id, jours } = body;
    await sb.from('conges').update({ statut: 'validé' }).eq('id', id);

    // Décrémenter le solde
    const { data: emp } = await sb.from('equipe').select('conges_solde').eq('id', employe_id).single();
    if (emp) await sb.from('equipe').update({ conges_solde: Math.max(0, (emp.conges_solde || 0) - (jours || 1)) }).eq('id', employe_id);
    return NextResponse.json({ success: true });
  }

  if (action === 'refuser_conge') {
    const { id } = body;
    await sb.from('conges').update({ statut: 'refusé' }).eq('id', id);
    return NextResponse.json({ success: true });
  }

  if (action === 'valider_acompte') {
    const { id, employe_id, montant, nom_employe } = body;
    await sb.from('acomptes').update({ statut: 'validé' }).eq('id', id);
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
    });
    return NextResponse.json({ success: true });
  }

  if (action === 'refuser_acompte') {
    const { id } = body;
    await sb.from('acomptes').update({ statut: 'refusé' }).eq('id', id);
    return NextResponse.json({ success: true });
  }

  if (action === 'ajouter_evaluation') {
    const { employe_id, note, points_forts, axes_amelioration } = body;
    const { data, error } = await sb.from('evaluations').insert({ employe_id, note, points_forts, axes_amelioration, evaluateur: 'Curtiss' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await sb.from('equipe').update({ performance: note }).eq('id', employe_id);
    return NextResponse.json({ success: true, evaluation: data });
  }

  if (action === 'ajouter_formation') {
    const { employe_id, titre, statut } = body;
    const { data, error } = await sb.from('formations_equipe').insert({ employe_id, titre, statut: statut || 'a_faire' }).select().single();
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
    const { id } = body;
    const { data: m } = await sb.from('equipe').select('*').eq('id', id).single();
    if (!m) return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
    const paie = calculerPaie(Number(m.salaire_brut || m.salaire || 0));
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

    if (m.email) {
      try {
        await sendEmail(m.email, `Votre fiche de paie — ${mois}`, html);
      } catch { /* non bloquant */ }
    }

    return NextResponse.json({ success: true, html, paie, mois });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}