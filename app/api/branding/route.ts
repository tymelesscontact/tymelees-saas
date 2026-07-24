import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Vibrant } from 'node-vibrant/node';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenant_id');
  if (!tenantId) return NextResponse.json({ error: 'tenant_id requis' }, { status: 400 });
  const { data } = await sb.from('tenants').select('societe,logo_url,couleur_primaire,couleur_secondaire,couleur_accent').eq('id', tenantId).single();
  if (!data) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 404 });
  return NextResponse.json({ branding: data });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, logo_url } = body;
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
  if (action === 'upload_logo') {
    if (!logo_url) return NextResponse.json({ success: false, error: 'logo_url requis' }, { status: 400 });
    let couleurs = { couleur_primaire: '#C9A84C', couleur_secondaire: '#0A0A16', couleur_accent: '#2EC9B0' };
    try {
      const palette = await Vibrant.from(logo_url).getPalette();
      const primaire = palette.Vibrant?.hex || palette.DarkVibrant?.hex;
      const secondaire = palette.DarkMuted?.hex || palette.Muted?.hex;
      const accent = palette.LightVibrant?.hex || palette.Vibrant?.hex;
      if (primaire) couleurs.couleur_primaire = primaire;
      if (secondaire) couleurs.couleur_secondaire = secondaire;
      if (accent) couleurs.couleur_accent = accent;
    } catch (e) {
      console.error('Extraction couleurs:', e);
    }
    const { error } = await sb.from('tenants').update({ logo_url, ...couleurs }).eq('id', tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, ...couleurs });
  }
  if (action === 'maj_couleurs') {
    const { couleur_primaire, couleur_secondaire, couleur_accent } = body;
    const { error } = await sb.from('tenants').update({ couleur_primaire, couleur_secondaire, couleur_accent }).eq('id', tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'action inconnue' }, { status: 400 });
}
