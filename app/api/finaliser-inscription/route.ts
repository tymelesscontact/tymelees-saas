import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifierIntentionInscription } from '../registration-intent/route';
import { normaliserPlan, PLAN_PRIX } from '../../lib/plans';
import { envoyerEmailsBienvenue } from '../../lib/emailBienvenue';

// Forfaits proposes sur la page d'inscription (jamais "owner"), avec le prix affiche.
// Le prix n'est plus pris dans la requete : il est recalcule ici.
const PLANS_INSCRIPTION = [
  'starter', 'business', 'enterprise', 'multi_societes', 'multi_societes_pro', 'holding',
  'club_affaires', 'white_label_starter', 'white_label_business', 'white_label_enterprise',
];

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, email } = body;
  if (!userId || !email) return NextResponse.json({ success: false, error: 'userId et email requis' }, { status: 400 });
  if (!verifierIntentionInscription(req.cookies.get('registration_intent')?.value, String(email))) {
    return NextResponse.json({ success: false, error: 'Inscription invalide ou expiree' }, { status: 403 });
  }

  const sb = getAdminClient();

  const { data: userData, error: userErr } = await sb.auth.admin.getUserById(userId);
  if (userErr || !userData?.user) return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 });
  if (userData.user.email?.toLowerCase() !== String(email).toLowerCase()) {
    return NextResponse.json({ success: false, error: 'Email ne correspond pas' }, { status: 403 });
  }
  if (!userData.user.created_at || new Date(userData.user.created_at).getTime() < Date.now() - 20 * 60 * 1000) {
    return NextResponse.json({ success: false, error: 'Utilisateur non eligible a cette inscription' }, { status: 403 });
  }

  const { data: existant } = await sb.from('tenants').select('id').eq('user_id', userId).maybeSingle();
  if (existant) return NextResponse.json({ success: true, tenantId: existant.id, dejaExistant: true });

  const plan = normaliserPlan(body.plan);
  if (!PLANS_INSCRIPTION.includes(plan)) {
    return NextResponse.json({ success: false, error: 'Forfait invalide' }, { status: 400 });
  }
  const planPrice = plan === 'white_label_enterprise' ? 0 : PLAN_PRIX[plan];

  const {
    societe, pays, metier, categorie, taille, secteur,
    civilite, prenom, nom, fonction, telephoneContact,
    formeJuridique, siren, siret, tva, codeApe, rcsVille, capitalSocial, dateCreation,
    adresse, ville, cp,
  } = body;

  const { data: tenantRow, error: tenantErr } = await sb.from('tenants').insert([{
    user_id: userId,
    societe, email, pays, metier, categorie, taille,
    plan, plan_price: planPrice,
    statut: 'essai',
    secteur,
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    civilite, prenom, nom, fonction, telephone_contact: telephoneContact,
    forme_juridique: formeJuridique, siren, siret, tva_intracommunautaire: tva,
    code_ape: codeApe, rcs_ville: rcsVille, capital_social: capitalSocial,
    date_creation_entreprise: dateCreation || null,
    adresse, ville, code_postal: cp,
  }]).select().single();

  if (tenantErr || !tenantRow) {
    return NextResponse.json({ success: false, error: 'Erreur creation tenant : ' + (tenantErr?.message || '') }, { status: 500 });
  }

  await sb.from('tenant_membres').insert([{ user_id: userId, tenant_id: tenantRow.id, role: 'owner' }]);
  await sb.from('inscriptions').insert([{
    societe, email, pays, categorie, metier, taille, plan, plan_price: planPrice,
    statut: 'actif', created_at: new Date().toISOString(),
  }]);

  try {
    await envoyerEmailsBienvenue({ email: String(email), societe, prenom, plan, planPrice, metier, pays });
  } catch (error) {
    console.error('Email de bienvenue non envoye', error);
  }

  const response = NextResponse.json({ success: true, tenantId: tenantRow.id });
  response.cookies.delete('registration_intent');
  return response;
}
