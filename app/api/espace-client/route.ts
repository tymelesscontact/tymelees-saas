import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { genererPdfFacture } from '../../lib/pdfFacture';
import { echapHtml } from '../../lib/walletValidation';

export const dynamic = 'force-dynamic';

// Espace client : le client d'une entreprise Xyra (invite depuis sa fiche client) voit ici
// SES devis, factures, missions et contrats, toutes entreprises confondues.
// Tout est lu cote serveur (cle service) et filtre sur l'email VERIFIE du compte connecte :
// on ne depend pas des regles RLS, et on ne renvoie que les champs utiles.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Devis montres au client avec leur lien de signature (un brouillon n'est jamais signable)
const STATUTS_DEVIS_VISIBLES = ['envoyé', 'vu', 'en_attente', 'signé', 'payé', 'refusé'];
const STATUTS_DEVIS_SIGNABLES = ['envoyé', 'vu', 'en_attente'];

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Echappe % et _ : dans un ilike, "_" vaut "n'importe quel caractere" et ferait
// correspondre l'email d'une autre personne.
function motifEmail(email: string) {
  return email.replace(/[\\%_]/g, (c) => '\\' + c);
}

async function clientConnecte(req: NextRequest): Promise<{ email: string; userId: string } | null> {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const { data, error } = await sb.auth.getUser(token);
  const user = data?.user;
  if (error || !user?.email) return null;
  // Email non confirme : n'importe qui pourrait creer un compte avec l'adresse d'un client
  // et lire ses documents. L'invitation envoyee par l'entreprise confirme l'adresse.
  if (!user.email_confirmed_at) return null;
  return { email: user.email.trim().toLowerCase(), userId: user.id };
}

export async function GET(req: NextRequest) {
  const moi = await clientConnecte(req);
  if (!moi) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  const motif = motifEmail(moi.email);
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'donnees';

  if (action === 'donnees') {
    const [cl, dv, fa, mi, co] = await Promise.all([
      sb.from('clients').select('tenant_id,nom').ilike('email', motif),
      sb.from('devis').select('id,tenant_id,reference,token_public,service,description,montant,statut,created_at,expire_le')
        .ilike('client_email', motif).in('statut', STATUTS_DEVIS_VISIBLES).order('created_at', { ascending: false }),
      sb.from('factures').select('id,tenant_id,numero,type_document,description,montant_ttc,statut,date_emission,date_echeance,created_at')
        .ilike('client_email', motif).order('created_at', { ascending: false }),
      sb.from('missions').select('id,tenant_id,service,date_mission,heure,adresse,statut')
        .ilike('client_email', motif).order('date_mission', { ascending: false }),
      sb.from('contrats').select('id,tenant_id,reference,titre,statut,lien_token,lien_expire_le,created_at')
        .ilike('signataire_email', motif).neq('statut', 'brouillon').order('created_at', { ascending: false }),
    ]);

    const tenantIds = new Set<string>();
    for (const r of [...(cl.data || []), ...(dv.data || []), ...(fa.data || []), ...(mi.data || []), ...(co.data || [])]) {
      if (r.tenant_id) tenantIds.add(r.tenant_id);
    }
    const { data: tenants } = tenantIds.size
      ? await sb.from('tenants').select('id,societe,email,telephone_entreprise,logo_url').in('id', [...tenantIds])
      : { data: [] as any[] };

    const maintenant = Date.now();
    return NextResponse.json({
      email: moi.email,
      nom: cl.data?.[0]?.nom || null,
      entreprises: (tenants || []).map((t: any) => ({
        id: t.id, societe: t.societe, email: t.email, telephone: t.telephone_entreprise, logo_url: t.logo_url,
        // Seules les entreprises ou il figure deja comme client peuvent recevoir une demande de devis
        peut_demander: (cl.data || []).some((c: any) => c.tenant_id === t.id),
      })),
      devis: (dv.data || []).map((d: any) => {
        const expire = !!d.expire_le && new Date(d.expire_le).getTime() < maintenant;
        const signable = STATUTS_DEVIS_SIGNABLES.includes(d.statut) && !expire;
        const { token_public, ...reste } = d;
        return { ...reste, expire, lien: token_public ? `/devis/${encodeURIComponent(d.reference)}?t=${encodeURIComponent(token_public)}` : null, signable };
      }),
      factures: fa.data || [],
      missions: mi.data || [],
      contrats: (co.data || []).map((c: any) => {
        const lienValide = c.statut === 'envoye' && !!c.lien_token && (!c.lien_expire_le || new Date(c.lien_expire_le).getTime() > maintenant);
        return {
          id: c.id, tenant_id: c.tenant_id, reference: c.reference, titre: c.titre, statut: c.statut, created_at: c.created_at,
          lien_signature: lienValide ? `/signature/${c.lien_token}` : null,
          pdf_disponible: c.statut === 'signe',
        };
      }),
    });
  }

  if (action === 'facture_pdf') {
    const id = searchParams.get('id') || '';
    if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    const { data: facture } = await sb.from('factures').select('*').eq('id', id).ilike('client_email', motif).maybeSingle();
    if (!facture) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    const pdf = await genererPdfFacture(facture);
    return new NextResponse(new Uint8Array(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${facture.numero}.pdf"` } });
  }

  if (action === 'contrat_pdf') {
    const id = searchParams.get('id') || '';
    if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
    const { data } = await sb.from('contrats').select('reference,document_pdf_base64').eq('id', id).ilike('signataire_email', motif).maybeSingle();
    if (!data?.document_pdf_base64) return NextResponse.json({ error: 'Document non disponible' }, { status: 404 });
    return new NextResponse(new Uint8Array(Buffer.from(data.document_pdf_base64, 'base64')), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="Document-signe-${data.reference}.pdf"` },
    });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const moi = await clientConnecte(req);
  if (!moi) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  // Demande de devis : transmise a l'entreprise (notification + email). L'entreprise
  // etablit ensuite le vrai devis depuis son ecran Devis.
  if (body.action === 'demande_devis') {
    const tenantId = String(body.tenant_id || '');
    const service = String(body.service || '').trim().slice(0, 200);
    const description = String(body.description || '').trim().slice(0, 2000);
    const budget = String(body.budget || '').trim().slice(0, 30);
    const date = String(body.date || '').trim().slice(0, 10);
    if (!UUID_RE.test(tenantId) || !service) return NextResponse.json({ error: 'Entreprise et service requis' }, { status: 400 });

    const { data: fiche } = await sb.from('clients').select('id,nom').eq('tenant_id', tenantId).ilike('email', motifEmail(moi.email)).limit(1).maybeSingle();
    if (!fiche) return NextResponse.json({ error: "Vous n'êtes pas client de cette entreprise" }, { status: 403 });
    const { data: tenant } = await sb.from('tenants').select('email,societe').eq('id', tenantId).maybeSingle();

    const nomClient = fiche.nom || moi.email;
    const details = [description, budget ? `Budget souhaité : ${budget} €` : '', date ? `Date souhaitée : ${date}` : ''].filter(Boolean).join(' — ');
    const { error } = await sb.from('notifications').insert({
      tenant_id: tenantId, type: 'devis', icon: '📝', urgence: 'normale',
      titre: `Demande de devis de ${nomClient}`,
      message: `${service}${details ? ' — ' + details : ''} (${moi.email})`,
      action_type: 'devis', lu: false,
    });
    if (error) return NextResponse.json({ error: "La demande n'a pas pu être transmise" }, { status: 500 });

    if (tenant?.email) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra <notifications@xyraio.fr>', to: tenant.email, replyTo: moi.email,
          subject: `Demande de devis — ${nomClient}`.replace(/[\r\n]+/g, ' '),
          html: `<div style="font-family:sans-serif;padding:24px;"><p>Nouvelle demande de devis depuis l'espace client.</p><p><strong>Client :</strong> ${echapHtml(nomClient)} (${echapHtml(moi.email)})</p><p><strong>Service :</strong> ${echapHtml(service)}</p>${details ? `<p>${echapHtml(details)}</p>` : ''}<p>Répondez directement à cet email ou établissez le devis depuis Xyra.</p></div>`,
        });
      } catch { /* la notification suffit si l'email echoue */ }
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
