import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function askClaude(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const { data: sequences } = await sb.from('relance_sequences')
    .select('*, relance_etapes(count)').eq('tenant_id', tenantId).eq('actif', true).order('created_at', { ascending: false });

  const { data: contacts } = await sb.from('relance_contacts').select('emails_envoyes,emails_ouverts,statut').eq('tenant_id', tenantId);
  const sent = (contacts || []).reduce((a, c) => a + (c.emails_envoyes || 0), 0);
  const opened = (contacts || []).reduce((a, c) => a + (c.emails_ouverts || 0), 0);
  const replies = (contacts || []).filter((c) => c.statut === 'repondu').length;

  return NextResponse.json({
    sequences: (sequences || []).map((s: any) => ({ id: s.id, name: s.nom, secteur: s.secteur })),
    stats: { sent, open_rate: sent > 0 ? Math.round((opened / sent) * 100) + '%' : '—', replies },
  });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // Lea genere une nouvelle sequence adaptee au secteur
  if (action === 'generer_sequence') {
    const { secteur, company_id } = body;
    if (!secteur?.trim()) return NextResponse.json({ error: 'Secteur requis' }, { status: 400 });

    const prompt = `Tu es Lea, l'assistante commerciale d'une entreprise du secteur "${secteur}". Cree une sequence de 4 emails de relance commerciale pour convaincre un prospect de devenir client, espaces dans le temps (jour 0, jour 3, jour 7, jour 14). Reponds UNIQUEMENT en JSON, sans texte autour, sous cette forme exacte :
{"nom":"Sequence ${secteur}","etapes":[{"jour":0,"objet":"...","contenu_html":"..."},{"jour":3,"objet":"...","contenu_html":"..."},{"jour":7,"objet":"...","contenu_html":"..."},{"jour":14,"objet":"...","contenu_html":"..."}]}
Le contenu_html doit etre un email court, professionnel, en francais, avec des balises <p> simples. Utilise {prenom} et {societe} comme variables a remplacer.`;

    let genere;
    try {
      const texte = await askClaude(prompt);
      const nettoye = texte.replace(/```json|```/g, '').trim();
      genere = JSON.parse(nettoye);
    } catch (e: any) {
      return NextResponse.json({ error: 'Lea n\'a pas pu generer la sequence, reessayez' }, { status: 500 });
    }

    const { data: seq, error } = await sb.from('relance_sequences').insert({
      tenant_id: tenantId, company_id: company_id || null, secteur: secteur.trim(), nom: genere.nom || `Séquence ${secteur}`,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const etapes = (genere.etapes || []).map((e: any, i: number) => ({
      sequence_id: seq.id, ordre: i, jour_envoi: e.jour, objet: e.objet, contenu_html: e.contenu_html,
    }));
    if (etapes.length) await sb.from('relance_etapes').insert(etapes);

    return NextResponse.json({ success: true, sequence: seq });
  }

  // Inscrire un contact dans une sequence
  if (action === 'relance_sequence') {
    const { email, prenom, nom, societe, tel, sequenceId } = body;
    if (!email || !sequenceId) return NextResponse.json({ error: 'Email et sequence necessaires' }, { status: 400 });

    const { data: seq } = await sb.from('relance_sequences').select('id').eq('id', sequenceId).eq('tenant_id', tenantId).maybeSingle();
    if (!seq) return NextResponse.json({ error: 'Sequence introuvable' }, { status: 404 });

    const { data: premiereEtape } = await sb.from('relance_etapes')
      .select('jour_envoi').eq('sequence_id', sequenceId).order('ordre').limit(1).maybeSingle();

    const aujourdhui = new Date();
    const prochainEnvoi = new Date(aujourdhui.getTime() + (premiereEtape?.jour_envoi || 0) * 86400000);

    const { data, error } = await sb.from('relance_contacts').insert({
      tenant_id: tenantId, sequence_id: sequenceId, email, prenom: prenom || null, nom: nom || null,
      societe: societe || null, tel: tel || null, etape_actuelle: 0,
      prochain_envoi: prochainEnvoi.toISOString().slice(0, 10), statut: 'active',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, contact: data });
  }

  // Declencheur : envoie les emails dus aujourd'hui (a appeler par une tache planifiee)
  if (action === 'traiter_envois_dus') {
    const aujourdhui = new Date().toISOString().slice(0, 10);
    const { data: dus } = await sb.from('relance_contacts')
      .select('*, relance_sequences(nom)').eq('statut', 'active').lte('prochain_envoi', aujourdhui);

    let envoyes = 0;
    for (const contact of (dus || [])) {
      try {
        const { data: etapes } = await sb.from('relance_etapes')
          .select('*').eq('sequence_id', contact.sequence_id).order('ordre');
        const etape = (etapes || [])[contact.etape_actuelle];
        if (!etape) {
          await sb.from('relance_contacts').update({ statut: 'terminee' }).eq('id', contact.id);
          continue;
        }

        const html = (etape.contenu_html || '')
          .replace(/{prenom}/g, contact.prenom || '')
          .replace(/{societe}/g, contact.societe || '');

        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra <notifications@xyraio.fr>', to: contact.email, subject: etape.objet, html,
        });

        const prochaine = (etapes || [])[contact.etape_actuelle + 1];
        const prochainEnvoi = prochaine
          ? new Date(Date.now() + (prochaine.jour_envoi - etape.jour_envoi) * 86400000).toISOString().slice(0, 10)
          : null;

        await sb.from('relance_contacts').update({
          etape_actuelle: contact.etape_actuelle + 1,
          emails_envoyes: (contact.emails_envoyes || 0) + 1,
          prochain_envoi: prochainEnvoi,
          statut: prochaine ? 'active' : 'terminee',
        }).eq('id', contact.id);

        envoyes++;
      } catch (e: any) {
        console.error('Relance envoi:', e.message);
      }
    }

    return NextResponse.json({ success: true, envoyes });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
