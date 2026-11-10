import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest, verifierAccesModule } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';
import { montantValide } from '../../lib/walletValidation';
import { calculerSolde } from '../../lib/walletSolde';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function GET(req: NextRequest) {
  const acces = await verifierAccesModule(req, "fournisseurs");
  if (!acces.ok) return acces.reponse;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ fournisseurs: [] });
  let query = sb.from('fournisseurs').select('*').eq('tenant_id', tenantId).order('nom');
  if (companyId && UUID_RE.test(companyId)) query = query.eq('company_id', companyId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fournisseurs: data || [] });
}
export async function POST(req: NextRequest) {
  const acces = await verifierAccesModule(req, "fournisseurs");
  if (!acces.ok) return acces.reponse;
  const body = await req.json();
  const { action } = body;
  const tenantId = await getTenantIdFromRequest(req);
  if (action === 'creer') {
    const { nom, categorie, contact, email, tel, iban, delai_livraison, company_id } = body;
    if (!nom) return NextResponse.json({ success: false, error: 'Nom requis' }, { status: 400 });
    const { data, error } = await sb.from('fournisseurs').insert({
      nom, categorie, contact, email: email || null, tel: tel || null, iban, delai_livraison,
      tenant_id: tenantId,
      company_id: company_id || null,
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, fournisseur: data });
  }
  if (action === 'modifier') {
    const { id, nom, categorie, contact, email, tel, iban, delai_livraison } = body;
    if (!id) return NextResponse.json({ success: false, error: 'id requis' }, { status: 400 });
    const champs: any = {};
    if (nom !== undefined) champs.nom = nom;
    if (categorie !== undefined) champs.categorie = categorie;
    if (contact !== undefined) champs.contact = contact;
    if (email !== undefined) champs.email = email || null;
    if (tel !== undefined) champs.tel = tel || null;
    if (iban !== undefined) champs.iban = iban;
    if (delai_livraison !== undefined) champs.delai_livraison = delai_livraison;
    if (!tenantId) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    const { error } = await sb.from('fournisseurs').update(champs).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { id } = body;
    if (!tenantId) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    const { error } = await sb.from('fournisseurs').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  if (action === 'commander') {
    if (!tenantId) return NextResponse.json({ success: false, error: 'non_autorise' }, { status: 401 });
    // Sortie d'argent : proprietaire/Admin, vers l'IBAN de la fiche fournisseur, dans la limite du solde.
    if (!(await estAutoriseGererEquipe(req, tenantId))) {
      return NextResponse.json({ success: false, error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    }
    const { fournisseur_id, montant, company_id } = body;
    const { data: fournisseur } = fournisseur_id
      ? await sb.from('fournisseurs').select('nom,iban').eq('id', fournisseur_id).eq('tenant_id', tenantId).maybeSingle()
      : { data: null };
    if (!fournisseur) return NextResponse.json({ success: false, error: 'Fournisseur introuvable' }, { status: 404 });
    const montantCommande = montantValide(montant);
    if (montantCommande === null) return NextResponse.json({ success: false, error: 'Montant invalide' }, { status: 400 });
    const soldeDisponible = await calculerSolde(sb, tenantId, null);
    if (montantCommande > soldeDisponible) {
      return NextResponse.json({ success: false, error: `Solde insuffisant : ${soldeDisponible.toFixed(2)} disponible(s)` }, { status: 400 });
    }
    const nom = fournisseur.nom;
    const iban = fournisseur.iban;
    const { data, error } = await sb.from('wallet_transactions').insert({
      type: 'sortie',
      libelle: `Commande — ${nom}`,
      montant: montantCommande,
      devise: 'EUR',
      methode: 'Virement SEPA',
      statut: 'à_virer',
      ref: `CMD-${Date.now()}`,
      destinataire_nom: nom,
      destinataire_iban: iban || null,
      tenant_id: tenantId,
      company_id: company_id || null,
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, transaction: data });
  }
  return NextResponse.json({ success: false, error: 'action inconnue' }, { status: 400 });
}
