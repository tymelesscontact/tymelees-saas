import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { envoyerPartout } from '../../lib/rappels';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GRAVITE_ORDRE: Record<string, number> = { mineur: 1, moyen: 2, grave: 3, urgent: 4 };

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const missionId = searchParams.get('mission_id');
  // vue "equipe" : les collaborateurs voient le contenu, jamais l'auteur (donnee sensible pour Bene)
  const vueEquipe = searchParams.get('vue') === 'equipe';

  let q = sb.from('signalements_mission').select('*, signalement_photos(id,chemin)').eq('tenant_id', tenantId);
  if (missionId) q = q.eq('mission_id', missionId);

  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (vueEquipe) {
    const simplifies = (data || []).map((s: any) => ({
      id: s.id, mission_id: s.mission_id, type: s.type, gravite: s.gravite,
      contenu: s.contenu, statut: s.statut, created_at: s.created_at,
      photos: s.signalement_photos || [],
    }));
    return NextResponse.json({ signalements: simplifies });
  }

  return NextResponse.json({ signalements: data || [] });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { mission_id, collaborateur_id, type, gravite, contenu, photos_chemins } = body;
    if (!mission_id || !collaborateur_id || !type || !contenu?.trim()) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    const { data: emp } = await sb.from('equipe').select('id').eq('id', collaborateur_id).eq('tenant_id', tenantId).maybeSingle();
    if (!emp) return NextResponse.json({ error: 'non_autorise' }, { status: 403 });

    const { data: signalement, error } = await sb.from('signalements_mission').insert({
      tenant_id: tenantId, mission_id, collaborateur_id, type,
      gravite: gravite || 'moyen', contenu: contenu.trim(), statut: 'nouveau',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (Array.isArray(photos_chemins) && photos_chemins.length) {
      const lignes = photos_chemins.map((chemin: string) => ({ signalement_id: signalement.id, chemin }));
      await sb.from('signalement_photos').insert(lignes);
    }

    // Notifier Bene et les delegues dont le seuil de gravite est atteint
    try {
      const { data: destinataires } = await sb.from('notifications_signalement')
        .select('destinataire_id, gravite_min').eq('tenant_id', tenantId).eq('actif', true);

      const seuilSignalement = GRAVITE_ORDRE[signalement.gravite] || 2;
      const aNotifier = (destinataires || []).filter(
        (d: any) => seuilSignalement >= (GRAVITE_ORDRE[d.gravite_min] || 1)
      );

      if (aNotifier.length) {
        const ids = aNotifier.map((d: any) => d.destinataire_id);
        const { data: personnes } = await sb.from('equipe').select('id,tel,email').in('id', ids);
        const texte = `Signalement (${signalement.gravite}) sur une mission : ${contenu.trim().slice(0, 140)}`;
        for (const p of (personnes || [])) {
          await envoyerPartout(p.tel, p.email, texte, tenantId);
        }
      }
    } catch (e: any) {
      console.error('Notification signalement:', e.message);
    }

    return NextResponse.json({ success: true, signalement });
  }

  if (action === 'resoudre') {
    const { id, resolution, resolu_par } = body;
    if (!resolution?.trim()) return NextResponse.json({ error: 'Resolution requise' }, { status: 400 });
    const { error } = await sb.from('signalements_mission').update({
      statut: 'resolu', resolution: resolution.trim(), resolu_par: resolu_par || null,
      resolu_le: new Date().toISOString(),
    }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'marquer_vu') {
    const { id } = body;
    const { error } = await sb.from('signalements_mission').update({ statut: 'vu' }).eq('id', id).eq('tenant_id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'ajouter_destinataire') {
    const { destinataire_id, gravite_min } = body;
    const { data, error } = await sb.from('notifications_signalement').insert({
      tenant_id: tenantId, destinataire_id, gravite_min: gravite_min || 'mineur', actif: true,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, destinataire: data });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
