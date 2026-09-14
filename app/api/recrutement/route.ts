import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function slugifier(texte: string) {
  return texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function assurerSlug(tenantId: string): Promise<string> {
  const { data: t } = await sb.from('tenants').select('slug,societe').eq('id', tenantId).maybeSingle();
  if (t?.slug) return t.slug;
  const base = slugifier(t?.societe || 'entreprise') || 'entreprise';
  let candidat = base;
  let i = 1;
  while (true) {
    const { data: existant } = await sb.from('tenants').select('id').eq('slug', candidat).maybeSingle();
    if (!existant) break;
    i++; candidat = `${base}-${i}`;
  }
  await sb.from('tenants').update({ slug: candidat }).eq('id', tenantId);
  return candidat;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  // ── Page carrieres publique : aucune authentification ──────
  if (action === 'public_offres') {
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'slug requis' }, { status: 400 });
    const { data: tenant } = await sb.from('tenants').select('id,societe,logo_url,couleur_primaire,ville').eq('slug', slug).maybeSingle();
    if (!tenant) return NextResponse.json({ error: 'Page introuvable' }, { status: 404 });
    const { data: offres } = await sb.from('offres_emploi').select('id,titre,description,type_contrat,lieu,salaire_min,salaire_max,created_at').eq('tenant_id', tenant.id).eq('statut', 'ouverte').order('created_at', { ascending: false });
    return NextResponse.json({ entreprise: { societe: tenant.societe, logo_url: tenant.logo_url, couleur_primaire: tenant.couleur_primaire, ville: tenant.ville }, offres: offres || [] });
  }

  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ offres: [], candidatures: [] });

  if (action === 'cv_url') {
    if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const { data: c } = await sb.from('candidatures').select('cv_chemin,nom').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
    if (!c?.cv_chemin) return NextResponse.json({ error: 'Aucun CV' }, { status: 404 });
    const { data: signee, error } = await sb.storage.from('candidatures-cv').createSignedUrl(c.cv_chemin, 300);
    if (error || !signee) return NextResponse.json({ error: error?.message || 'Lien indisponible' }, { status: 500 });
    return NextResponse.json({ url: signee.signedUrl });
  }

  if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });

  if (action === 'slug') {
    const slug = await assurerSlug(tenantId);
    return NextResponse.json({ slug });
  }

  const { data: offres } = await sb.from('offres_emploi').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  const { data: candidatures } = await sb.from('candidatures').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  const enrichies = (offres || []).map((o: any) => ({ ...o, candidatures: (candidatures || []).filter((c: any) => c.offre_id === o.id) }));
  return NextResponse.json({ offres: enrichies, slug: (await sb.from('tenants').select('slug').eq('id', tenantId).maybeSingle()).data?.slug || null });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  // ── Candidature publique : formulaire multipart, aucune authentification ──
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const offreId = String(form.get('offre_id') || '');
    const nom = String(form.get('nom') || '').trim();
    const email = String(form.get('email') || '').trim();
    const tel = String(form.get('tel') || '').trim();
    const message = String(form.get('message') || '').trim();
    const fichier = form.get('cv') as File | null;
    if (!offreId || !nom) return NextResponse.json({ error: 'Offre et nom requis' }, { status: 400 });
    const { data: offre } = await sb.from('offres_emploi').select('id,tenant_id,statut').eq('id', offreId).maybeSingle();
    if (!offre || offre.statut !== 'ouverte') return NextResponse.json({ error: 'Cette offre n\'est plus disponible' }, { status: 404 });

    let cvChemin: string | null = null;
    if (fichier && fichier.size > 0) {
      const extension = (fichier.name.split('.').pop() || 'pdf').toLowerCase();
      cvChemin = `${offre.tenant_id}/${offreId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
      const bytes = await fichier.arrayBuffer();
      const { error: errUpload } = await sb.storage.from('candidatures-cv').upload(cvChemin, Buffer.from(bytes), { contentType: fichier.type || 'application/pdf' });
      if (errUpload) return NextResponse.json({ error: errUpload.message }, { status: 500 });
    }
    const { data, error } = await sb.from('candidatures').insert({
      tenant_id: offre.tenant_id, offre_id: offreId, nom, email: email || null, tel: tel || null,
      message: message || null, cv_chemin: cvChemin, source: 'page_publique',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, candidature: data });
  }

  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
  if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
  const body = await req.json();
  const { action } = body;

  if (action === 'creer_offre') {
    const { titre, description, type_contrat, lieu, salaire_min, salaire_max } = body;
    if (!titre) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
    await assurerSlug(tenantId);
    const { data, error } = await sb.from('offres_emploi').insert({
      tenant_id: tenantId, titre, description: description || null, type_contrat: type_contrat || 'CDI',
      lieu: lieu || null, salaire_min: salaire_min ? Number(salaire_min) : null, salaire_max: salaire_max ? Number(salaire_max) : null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, offre: data });
  }

  if (action === 'fermer_offre' || action === 'rouvrir_offre') {
    const { id } = body;
    const { error } = await sb.from('offres_emploi').update({ statut: action === 'fermer_offre' ? 'fermee' : 'ouverte' }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'deplacer_etape') {
    const { id, etape } = body;
    if (!['recu', 'preselection', 'entretien', 'offre', 'embauche', 'refuse'].includes(etape)) return NextResponse.json({ error: 'Étape invalide' }, { status: 400 });
    const { error } = await sb.from('candidatures').update({ etape }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'lier_employe') {
    const { candidature_id, employe_id } = body;
    if (!candidature_id || !employe_id) return NextResponse.json({ error: 'candidature_id et employe_id requis' }, { status: 400 });
    const { error } = await sb.from('candidatures').update({ etape: 'embauche', employe_cree_id: employe_id }).eq('id', candidature_id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'noter_candidature') {
    const { id, notes } = body;
    const { error } = await sb.from('candidatures').update({ notes: notes || null }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
