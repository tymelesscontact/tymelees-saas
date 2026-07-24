import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
async function sendEmail(to: string, subject: string, html: string) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Xyra <contrats@xyraio.fr>', to, subject, html }),
    });
  } catch (e) { console.error('Email:', e); }
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'contrats';
  const tenantId = await getTenantIdFromRequest(req);
  const companyId = searchParams.get('company_id');
  function scoped(q: any) {
    if (tenantId) q = q.eq('tenant_id', tenantId);
    if (companyId) q = q.eq('company_id', companyId);
    return q;
  }
  if (action === 'modeles') {
    const { data } = await scoped(sb.from('contrats_modeles').select('*').eq('actif', true).order('nom'));
    return NextResponse.json({ modeles: data || [] });
  }
  if (action === 'contrats') {
    const { data } = await scoped(sb.from('contrats').select('*').order('created_at', { ascending: false }));
    return NextResponse.json({ contrats: data || [] });
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;
  const tenantId = await getTenantIdFromRequest(req);
  if (action === 'generer') {
    const { modele_id, titre, source_type, source_id, variables, company_id, signataire_nom, signataire_email, signataire_role } = body;
    const { data: modele } = await sb.from('contrats_modeles').select('*').eq('id', modele_id).single();
    if (!modele) return NextResponse.json({ success: false, error: 'Modele introuvable' }, { status: 404 });
    let contenu = modele.contenu;
    for (const [cle, valeur] of Object.entries(variables || {})) {
      contenu = contenu.split(`{{${cle}}}`).join(String(valeur));
    }
    const { data, error } = await sb.from('contrats').insert({
      tenant_id: tenantId, company_id, modele_id, titre: titre || modele.nom, type: modele.type,
      source_type, source_id, contenu_final: contenu, variables,
      signataire_nom, signataire_email, signataire_role,
      statut: 'brouillon',
    }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, contrat: data });
  }
  if (action === 'envoyer') {
    const { id } = body;
    const { data: contrat } = await sb.from('contrats').select('*').eq('id', id).single();
    if (!contrat) return NextResponse.json({ success: false, error: 'Contrat introuvable' }, { status: 404 });
    const lien_token = crypto.randomBytes(24).toString('hex');
    const code_verification = String(Math.floor(100000 + Math.random() * 900000));
    await sb.from('contrats').update({ lien_token, code_verification, statut: 'envoye' }).eq('id', id);
    const lien = `https://xyraio.fr/signature/${lien_token}`;
    await sendEmail(contrat.signataire_email, `Document a signer - ${contrat.titre}`,
      `<p>Bonjour ${contrat.signataire_nom},</p><p>Un document est pret pour votre signature electronique.</p><p><a href="${lien}">Consulter et signer le document</a></p><p>Votre code de verification vous sera demande sur la page de signature.</p>`);
    await sendEmail(contrat.signataire_email, `Votre code de verification - ${contrat.titre}`,
      `<p>Votre code de verification pour signer le document : <strong>${code_verification}</strong></p>`);
    return NextResponse.json({ success: true, lien });
  }
  if (action === 'verifier_code') {
    const { lien_token, code } = body;
    const { data: contrat } = await sb.from('contrats').select('*').eq('lien_token', lien_token).single();
    if (!contrat) return NextResponse.json({ success: false, error: 'Document introuvable' }, { status: 404 });
    if (contrat.code_verification !== code) return NextResponse.json({ success: false, error: 'Code incorrect' }, { status: 400 });
    await sb.from('contrats').update({ code_verifie_a: new Date().toISOString() }).eq('id', contrat.id);
    return NextResponse.json({ success: true, contrat: { titre: contrat.titre, contenu_final: contrat.contenu_final, signataire_nom: contrat.signataire_nom, statut: contrat.statut } });
  }
  if (action === 'signer') {
    const { lien_token, nom_tape } = body;
    const { data: contrat } = await sb.from('contrats').select('*').eq('lien_token', lien_token).single();
    if (!contrat) return NextResponse.json({ success: false, error: 'Document introuvable' }, { status: 404 });
    if (!contrat.code_verifie_a) return NextResponse.json({ success: false, error: 'Verification requise avant signature' }, { status: 403 });
    if (contrat.statut === 'signe') return NextResponse.json({ success: false, error: 'Document deja signe' }, { status: 400 });
    const ip = req.headers.get('x-forwarded-for') || 'inconnue';
    const hash = crypto.createHash('sha256').update(contrat.contenu_final + nom_tape + new Date().toISOString()).digest('hex');
    await sb.from('contrats').update({
      statut: 'signe', signe_a: new Date().toISOString(), signature_ip: ip,
      signature_nom_tape: nom_tape, document_hash: hash,
    }).eq('id', contrat.id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'action inconnue' }, { status: 400 });
}
