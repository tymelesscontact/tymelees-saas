import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { envoyerWhatsApp } from '../../lib/whatsapp';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function askClaude(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 350, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}


// Compte les inscrits reels dans evenements_inscrits
async function compterInscrits(evenementId: string) {
  const { count } = await sb.from('evenements_inscrits')
    .select('id', { count: 'exact', head: true }).eq('evenement_id', evenementId);
  return count || 0;
}

// Un fondateur du Club peut creer des evenements de portee club
async function estFondateurClub(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return false;
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return false;
  const { data: m } = await sb.from('club_membres')
    .select('statut').eq('user_id', auth.user.id).maybeSingle();
  return m?.statut === 'fondateur';
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'list';
  const eventId = searchParams.get('event_id');
  const companyId = searchParams.get('company_id');

  if (action === 'list') {
    const portee = searchParams.get('portee');
    let q = sb.from('evenements').select('*').order('date_evenement', { ascending: true });
    if (portee) q = q.eq('portee', portee);
    else if (tenantId) q = q.eq('tenant_id', tenantId).eq('portee', 'societe');
    if (companyId && UUID_RE.test(companyId)) q = q.eq('company_id', companyId);
    const { data } = await q;

    const enrichis = await Promise.all((data || []).map(async (e: any) => ({
      ...e, inscrits: await compterInscrits(e.id),
    })));
    return NextResponse.json({ evenements: enrichis });
  }

  if (action === 'inscrits' && eventId) {
    // L'evenement doit appartenir a l'appelant, ou etre un evenement du club
    const { data: evt } = await sb.from('evenements')
      .select('tenant_id,portee').eq('id', eventId).maybeSingle();
    if (!evt) return NextResponse.json({ error: 'Evenement introuvable' }, { status: 404 });
    if (evt.portee !== 'club' && tenantId && evt.tenant_id !== tenantId) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    const { data } = await sb.from('evenements_inscrits').select('*').eq('evenement_id', eventId);
    return NextResponse.json({ inscrits: data || [] });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  const body = await req.json();
  const { action } = body;

  if (action === 'create') {
    const { titre, description, date_evenement, lieu, prix, max_inscrits, portee, lien_inscription, company_id } = body;
    if (!titre || !date_evenement) {
      return NextResponse.json({ error: 'Titre et date necessaires' }, { status: 400 });
    }

    let porteeFinale = 'societe';
    if (portee === 'club') {
      if (!(await estFondateurClub(req))) {
        return NextResponse.json({ error: 'Seuls les fondateurs du Club peuvent creer un evenement du Club' }, { status: 403 });
      }
      porteeFinale = 'club';
    } else if (portee === 'public') {
      porteeFinale = 'public';
    }

    const { data, error } = await sb.from('evenements').insert({
      titre, description: description || null,
      date_evenement, lieu: lieu || null,
      prix: Number(prix || 0),
      max_inscrits: Number(max_inscrits || 50),
      statut: 'ouvert',
      portee: porteeFinale,
      lien_inscription: lien_inscription || null,
      tenant_id: tenantId,
      company_id: company_id && UUID_RE.test(company_id) ? company_id : null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, evenement: data });
  }

  if (action === 'inscrire') {
    const { evenement_id, nom, email, tel } = body;

    const { data: resultat, error: erreurRpc } = await sb.rpc('inscrire_evenement_atomique', {
      p_evenement_id: evenement_id, p_nom: nom, p_email: email, p_tel: tel,
    });
    if (erreurRpc) return NextResponse.json({ error: erreurRpc.message }, { status: 500 });
    if (resultat?.error) {
      const statut = resultat.error === 'Evenement introuvable' ? 404 : 400;
      return NextResponse.json({ error: resultat.error }, { status: statut });
    }

    const { data: evt } = await sb.from('evenements')
      .select('titre,max_inscrits,date_evenement,lieu').eq('id', evenement_id).single();
    if (!evt) return NextResponse.json({ error: 'Evenement introuvable' }, { status: 404 });
    if (tel && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      await envoyerWhatsApp(tel, `Xyra Events : Inscription confirmee pour ${evt.titre} le ${new Date(evt.date_evenement).toLocaleDateString('fr')} a ${evt.lieu || ''}. A bientot !`, tenantId);
    }
    return NextResponse.json({ success: true, inscrits: resultat.inscrits });
  }

  if (action === 'inviter_reseau') {
    const { titre, date_evenement, lieu } = body;
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });
    const dateTexte = date_evenement ? new Date(date_evenement).toLocaleDateString('fr') : '';
    await envoyerWhatsApp(ownerTel, `Xyra Events : Invitation reseau envoyee pour ${titre} le ${dateTexte} a ${lieu || ''}.`, tenantId);
    return NextResponse.json({ success: true });
  }

  if (action === 'rappels') {
    const ownerTel = process.env.OWNER_WHATSAPP;
    if (!ownerTel) return NextResponse.json({ error: 'OWNER_WHATSAPP manquant' }, { status: 400 });

    let q = sb.from('evenements').select('*').eq('statut', 'ouvert');
    if (tenantId) q = q.eq('tenant_id', tenantId);
    const { data: evts } = await q;

    const now = new Date();
    let rappelsEnvoyes = 0;
    for (const evt of (evts || [])) {
      const dateEvt = new Date(evt.date_evenement);
      const jours = Math.ceil((dateEvt.getTime() - now.getTime()) / 86400000);
      if (jours === 7 || jours === 1) {
        const nb = await compterInscrits(evt.id);
        await envoyerWhatsApp(ownerTel, `Xyra Events rappel J-${jours} : ${evt.titre} le ${dateEvt.toLocaleDateString('fr')}. ${nb}/${evt.max_inscrits || 0} inscrits.`, tenantId);
        rappelsEnvoyes++;
      }
    }
    return NextResponse.json({ success: true, rappels: rappelsEnvoyes });
  }

  if (action === 'analyse_roi') {
    const { evenements } = body;
    try {
      const resume = (evenements || []).map((e: any) =>
        `${e.titre}: ${e.inscrits ?? 0}/${e.max_inscrits || 0} inscrits, ${e.prix || 0}€`
      ).join(' | ');
      const analyse = await askClaude(`Tu es expert en événementiel B2B. Analyse le ROI de ces événements et donne 3 recommandations concrètes (4 phrases max, français) : ${resume}`);
      return NextResponse.json({ success: true, analyse });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'checkin') {
    const { inscrit_id } = body;
    // L'inscrit doit appartenir a un evenement de l'appelant, ou du club
    const { data: insc } = await sb.from('evenements_inscrits')
      .select('evenement_id').eq('id', inscrit_id).maybeSingle();
    if (!insc) return NextResponse.json({ error: 'Inscrit introuvable' }, { status: 404 });
    const { data: evt } = await sb.from('evenements')
      .select('tenant_id,portee').eq('id', insc.evenement_id).maybeSingle();
    if (!evt) return NextResponse.json({ error: 'Evenement introuvable' }, { status: 404 });
    if (evt.portee !== 'club' && tenantId && evt.tenant_id !== tenantId) {
      return NextResponse.json({ error: 'non_autorise' }, { status: 403 });
    }
    await sb.from('evenements_inscrits')
      .update({ statut: 'présent', checked_in_at: new Date().toISOString() })
      .eq('id', inscrit_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
