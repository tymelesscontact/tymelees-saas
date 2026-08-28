import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  const sb = getAdminClient();

  const { data: userData, error: userErr } = await sb.auth.admin.getUserById(userId);
  if (userErr || !userData?.user) return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 });
  if (userData.user.email?.toLowerCase() !== String(email).toLowerCase()) {
    return NextResponse.json({ success: false, error: 'Email ne correspond pas' }, { status: 403 });
  }

  const { data: existant } = await sb.from('tenants').select('id').eq('user_id', userId).maybeSingle();
  if (existant) return NextResponse.json({ success: true, tenantId: existant.id, dejaExistant: true });

  const {
    societe, pays, metier, categorie, taille, plan, planPrice, secteur,
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

  return NextResponse.json({ success: true, tenantId: tenantRow.id });
}
