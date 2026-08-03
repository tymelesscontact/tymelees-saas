import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Genere un lien temporaire vers le justificatif d'une note de frais.
// Le bucket est prive : aucune adresse permanente n'est jamais exposee.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get('note_id');
  if (!noteId) {
    return NextResponse.json({ error: 'note_id requis' }, { status: 400 });
  }

  const tenantId = await getTenantIdFromRequest(req);
  const sb = getAdminClient();

  let q = sb.from('notes_frais')
    .select('id, tenant_id, justificatif_chemin, justificatif_nom, justificatif_type, justificatif_taille, justificatif_empreinte, justificatif_depose_le')
    .eq('id', noteId);
  if (tenantId) q = q.eq('tenant_id', tenantId);

  const { data: note, error } = await q.single();
  if (error || !note) {
    return NextResponse.json({ error: 'Note introuvable' }, { status: 404 });
  }
  if (!note.justificatif_chemin) {
    return NextResponse.json({ error: 'Aucun justificatif joint a cette note' }, { status: 404 });
  }

  const { data: lien, error: errLien } = await sb.storage
    .from('justificatifs')
    .createSignedUrl(note.justificatif_chemin, 300);

  if (errLien || !lien?.signedUrl) {
    console.error('Lien justificatif:', errLien?.message);
    return NextResponse.json({ error: 'Justificatif inaccessible' }, { status: 500 });
  }

  return NextResponse.json({
    url: lien.signedUrl,
    expire_dans_secondes: 300,
    nom: note.justificatif_nom,
    type: note.justificatif_type,
    taille: note.justificatif_taille,
    empreinte: note.justificatif_empreinte,
    depose_le: note.justificatif_depose_le,
  });
}
