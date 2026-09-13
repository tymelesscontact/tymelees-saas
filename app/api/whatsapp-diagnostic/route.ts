import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

// Diagnostic WhatsApp Cloud API -- reserve au proprietaire. Interroge
// directement Meta avec le jeton configure pour dire ce qui cloche :
// jeton valide/expire, numero enregistre, mode test ou live.
// Le jeton lui-meme n'est jamais renvoye au client.

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GRAPH = 'https://graph.facebook.com/v22.0';

export async function GET(req: NextRequest) {
  // --- Controle proprietaire ---
  const authToken = req.cookies.get('sb-access-token')?.value;
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  if (!authToken || !ownerEmail) return NextResponse.json({ error: 'Interdit' }, { status: 403 });
  const { data: authData } = await sb.auth.getUser(authToken);
  if (!authData?.user?.email || authData.user.email.toLowerCase() !== ownerEmail) {
    return NextResponse.json({ error: 'Interdit' }, { status: 403 });
  }

  // --- Resolution des identifiants (meme logique que envoyerWhatsApp) ---
  const tenantId = await getTenantIdFromRequest(req);
  let phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || null;
  let token = process.env.WHATSAPP_TOKEN || null;
  let source = 'plateforme (variables Vercel)';

  if (tenantId) {
    const { data: t } = await sb.from('tenants')
      .select('whatsapp_phone_number_id,whatsapp_token,whatsapp_actif')
      .eq('id', tenantId).maybeSingle();
    if (t?.whatsapp_actif && t.whatsapp_phone_number_id && t.whatsapp_token) {
      phoneId = t.whatsapp_phone_number_id;
      token = t.whatsapp_token;
      source = 'compte propre du tenant';
    }
  }

  const diag: any = { source, checks: [] };

  if (!phoneId || !token) {
    diag.verdict = '❌ Aucune configuration WhatsApp trouvee — ni cote tenant, ni cote plateforme (variables WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID absentes sur Vercel).';
    return NextResponse.json(diag);
  }
  diag.phone_number_id = phoneId;

  // --- 1. Validite du jeton ---
  try {
    const r = await fetch(`${GRAPH}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`);
    const d = await r.json();
    const info = d?.data;
    if (!r.ok || d?.error) {
      diag.checks.push({ nom: 'Jeton', ok: false, detail: `Meta refuse le jeton : ${d?.error?.message || r.status}` });
    } else if (info?.is_valid === false) {
      const exp = info?.expires_at ? new Date(info.expires_at * 1000).toLocaleString('fr-FR') : 'inconnue';
      diag.checks.push({ nom: 'Jeton', ok: false, detail: `Jeton invalide ou expire (expiration : ${exp}). Genere un nouveau jeton — idealement permanent via un "Utilisateur systeme" dans Meta Business Settings.` });
    } else {
      const exp = info?.expires_at ? new Date(info.expires_at * 1000).toLocaleString('fr-FR') : null;
      const permanent = !info?.expires_at || info.expires_at === 0;
      diag.checks.push({
        nom: 'Jeton',
        ok: true,
        detail: permanent
          ? "Jeton valide et permanent (pas d'expiration). Parfait."
          : `Jeton valide mais il expire le ${exp} — pense a le remplacer par un jeton permanent (Utilisateur systeme) pour ne pas etre coupe.`,
        scopes: info?.scopes,
      });
    }
  } catch (e: any) {
    diag.checks.push({ nom: 'Jeton', ok: false, detail: `Impossible de joindre Meta : ${e.message}` });
  }

  // --- 2. Etat du numero ---
  try {
    const champs = 'verified_name,code_verification_status,quality_rating,messaging_limit_tier,platform_type,name_status,throughput';
    const r = await fetch(`${GRAPH}/${phoneId}?fields=${champs}&access_token=${encodeURIComponent(token)}`);
    const d = await r.json();
    if (!r.ok || d?.error) {
      diag.checks.push({ nom: 'Numero', ok: false, detail: `Meta ne reconnait pas cet identifiant de numero (${phoneId}) : ${d?.error?.message || r.status}. Verifie WHATSAPP_PHONE_NUMBER_ID.` });
    } else {
      const tier = d?.messaging_limit_tier || 'inconnu';
      const modeTest = tier === 'TIER_50' || tier === 'TIER_250';
      diag.checks.push({
        nom: 'Numero',
        ok: d?.code_verification_status === 'VERIFIED' || d?.name_status === 'APPROVED' || !!d?.verified_name,
        detail: [
          d?.verified_name ? `Nom verifie : "${d.verified_name}"` : 'Aucun nom verifie',
          `Verification : ${d?.code_verification_status || 'inconnue'}`,
          `Qualite : ${d?.quality_rating || 'inconnue'}`,
          `Palier d'envoi : ${tier}${modeTest ? " — palier bas, l'app Meta est probablement en mode Developpement (envoi limite a des numeros de test declares). Passe l'app en \"Live\" apres verification business." : ''}`,
        ].join(' · '),
      });
    }
  } catch (e: any) {
    diag.checks.push({ nom: 'Numero', ok: false, detail: `Impossible de joindre Meta : ${e.message}` });
  }

  const tousOk = diag.checks.every((c: any) => c.ok);
  diag.verdict = tousOk
    ? "✅ Jeton et numero OK cote Meta. Si l'envoi echoue encore, c'est la fenetre des 24h : Meta interdit d'ecrire a un client qui ne t'a pas contacte dans les dernieres 24h sans passer par un \"modele\" pre-approuve."
    : '❌ Un ou plusieurs problemes detectes — voir le detail de chaque verification ci-dessus.';

  diag.rappel_fenetre_24h = "Meta autorise les messages libres seulement dans les 24h apres le dernier message du client. Hors de cette fenetre : uniquement des modeles pre-approuves.";

  return NextResponse.json(diag);
}
