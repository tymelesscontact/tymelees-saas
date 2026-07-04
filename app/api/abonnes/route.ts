import { NextRequest, NextResponse } from 'next/server';
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

async function inviterCompte(email: string): Promise<{ userId: string | null; inviteLink: string | null }> {
  try {
    const { data, error } = await sbAdmin.auth.admin.generateLink({ type: 'invite', email });
    if (error || !data?.user) return { userId: null, inviteLink: null };
    return { userId: data.user.id, inviteLink: (data as any)?.properties?.action_link || null };
  } catch { return { userId: null, inviteLink: null }; }
}

export async function GET() {
  const { data: tenants, error } = await sb.from('tenants').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrichir avec les données calculées
  const enriched = await Promise.all((tenants || []).map(async (t: any) => {
    // Dernière connexion via auth.users (si accessible)
    let derniere_connexion = null;
    let inactif_jours = 0;
    try {
      const { data: authUser } = await sbAdmin.auth.admin.getUserById(t.user_id);
      derniere_connexion = authUser?.user?.last_sign_in_at || null;
      if (derniere_connexion) {
        inactif_jours = Math.floor((Date.now() - new Date(derniere_connexion).getTime()) / (1000 * 60 * 60 * 24));
      }
    } catch { /* non bloquant */ }

    // Jours restants trial
    let jours_restants = 0;
    if (t.statut === 'trial' && t.trial_ends_at) {
      jours_restants = Math.max(0, Math.floor((new Date(t.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    }

    return {
      ...t,
      inactif_jours,
      jours_restants,
      paiement_echoue: t.paiement_echoue || false,
      score_solvabilite: t.score_solvabilite || null,
    };
  }));

  // Statut des services (ping simple)
  const services = [
    { nom: 'Supabase', ok: true, detail: 'Base de données connectée' },
    { nom: 'Stripe', ok: !!process.env.STRIPE_SECRET_KEY, detail: process.env.STRIPE_SECRET_KEY ? 'Clé configurée' : 'Clé manquante' },
    { nom: 'Resend', ok: !!process.env.RESEND_API_KEY, detail: process.env.RESEND_API_KEY ? 'Emails actifs' : 'Clé manquante' },
    { nom: 'WhatsApp API', ok: !!process.env.WHATSAPP_TOKEN, detail: process.env.WHATSAPP_TOKEN ? 'Token configuré' : 'Token manquant' },
    { nom: 'Vapi', ok: !!process.env.VAPI_API_KEY, detail: process.env.VAPI_API_KEY ? 'Agent Lea actif' : 'Clé manquante' },
    { nom: 'Anthropic', ok: !!process.env.ANTHROPIC_API_KEY, detail: process.env.ANTHROPIC_API_KEY ? 'Claude Sonnet 4.6' : 'Clé manquante' },
  ];

  return NextResponse.json({ abonnes: enriched, services });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { societe, email, nom, plan, siren } = body;
    if (!societe || !email) return NextResponse.json({ error: 'Société et email requis' }, { status: 400 });

    const { userId, inviteLink } = await inviterCompte(email);

    const { data, error } = await sb.from('tenants').insert({
      societe, email, nom_contact: nom, plan: plan || 'starter', statut: 'trial',
      siren: siren || null, user_id: userId,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    try {
      const lien = inviteLink ? `<p><a href="${inviteLink}" style="color:#C9A84C">Cliquez ici pour créer votre mot de passe et accéder à votre dashboard</a></p>` : '';
      await sendEmail(email, 'Bienvenue sur Xyra — Votre accès est prêt',
        `<div style="font-family:sans-serif;padding:24px;background:#06060E;color:#EAE6DE;">
          <h2 style="color:#C9A84C">Bienvenue sur Xyra, ${societe} !</h2>
          <p>Votre compte a été créé avec le plan <strong>${plan || 'Starter'}</strong>. Vous bénéficiez de 14 jours d'essai gratuit.</p>
          ${lien}
          <p style="color:#5A5A7A;font-size:12px;">L'équipe Xyra</p>
        </div>`
      );
    } catch { /* non bloquant */ }

    return NextResponse.json({ success: true, abonne: data });
  }

  if (action === 'changer_plan') {
    const { id, plan } = body;
    const { error } = await sb.from('tenants').update({ plan }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'suspendre') {
    const { id } = body;
    const { error } = await sb.from('tenants').update({ statut: 'suspendu' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'reactiver') {
    const { id } = body;
    const { error } = await sb.from('tenants').update({ statut: 'actif' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { data: tenant } = await sb.from('tenants').select('user_id').eq('id', id).single();
    if (tenant?.user_id) {
      try { await sbAdmin.auth.admin.deleteUser(tenant.user_id); } catch { /* non bloquant */ }
    }
    const { error } = await sb.from('tenants').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'envoyer_email') {
    const { email, sujet, corps } = body;
    if (!email || !sujet || !corps) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    try {
      await sendEmail(email, sujet, `<div style="font-family:sans-serif;padding:24px;white-space:pre-line;">${corps}</div>`);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'envoyer_groupe') {
    const { planCible, sujet, corps } = body;
    if (!sujet || !corps) return NextResponse.json({ error: 'Sujet et message requis' }, { status: 400 });
    const { data: all } = await sb.from('tenants').select('email,plan,statut');
    const cibles = (all || []).filter((t: any) =>
      planCible === 'tous' ? true : t.plan === planCible || t.statut === planCible
    ).filter((t: any) => t.email);
    let envoyes = 0;
    for (const t of cibles) {
      try { await sendEmail(t.email, sujet, `<div style="font-family:sans-serif;padding:24px;white-space:pre-line;">${corps}</div>`); envoyes++; }
      catch { /* continuer même si un envoi échoue */ }
    }
    return NextResponse.json({ success: true, nb: envoyes });
  }

  if (action === 'verifier_solvabilite') {
    const { id, siren } = body;
    if (!siren) return NextResponse.json({ error: 'SIREN requis' }, { status: 400 });
    try {
      const res = await fetch(`https://api.insee.fr/entreprises/sirene/V3.11/siren/${siren}`, {
        headers: { 'Authorization': `Bearer ${process.env.INSEE_API_KEY}` }
      });
      if (!res.ok) return NextResponse.json({ error: 'Entreprise introuvable dans SIRENE' }, { status: 404 });
      const data = await res.json();
      const uniteLegale = data.uniteLegale;
      const etat = uniteLegale?.etatAdministratifUniteLegale;
      const dateCreation = uniteLegale?.dateCreationUniteLegale;
      const anciennete = dateCreation ? Math.floor((Date.now() - new Date(dateCreation).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0;

      // Score : 50 base + 20 si active + 30 si ancienneté > 3 ans
      let score = 50;
      if (etat === 'A') score += 20; else score -= 30; // A = Active
      if (anciennete >= 3) score += 20;
      if (anciennete >= 10) score += 10;
      score = Math.max(0, Math.min(100, score));

      await sb.from('tenants').update({ score_solvabilite: score, siren_statut: etat }).eq('id', id);
      return NextResponse.json({ success: true, score, etat, anciennete });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'relance_ia') {
    const { abonne } = body;
    if (!abonne) return NextResponse.json({ error: 'Données abonné manquantes' }, { status: 400 });
    try {
      const prompt = `Tu es le responsable commercial de Xyra, une plateforme SaaS B2B. Rédige un email de relance court et personnalisé (3-4 phrases max) en français pour cette entreprise abonnée :
Société : ${abonne.societe}
Plan actuel : ${abonne.plan}
Statut : ${abonne.statut}
Inactif depuis : ${abonne.inactif_jours} jours
L'objectif est de les re-engager ou de les convaincre de passer à un plan supérieur. Ton naturel, pas de formules génériques.`;
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
      });
      const claudeData = await claudeRes.json();
      const message = claudeData.content?.[0]?.text || "Bonjour, nous pensons à vous chez Xyra. Comment pouvons-nous vous aider ?";
      return NextResponse.json({ success: true, message });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}