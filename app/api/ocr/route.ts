import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import sharp from 'sharp';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

const TAILLE_MAX = 10 * 1024 * 1024;
const TYPES_OK = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "Aucun fichier recu" }, { status: 400 });
    }
    if (file.size > TAILLE_MAX) {
      return NextResponse.json({ success: false, error: 'Fichier trop lourd (10 Mo maximum)' }, { status: 400 });
    }

    const mediaType = file.type || 'image/jpeg';
    if (mediaType === 'application/pdf') {
      return NextResponse.json({ success: false, error: 'PDF pas encore supporte - prenez une photo du ticket' }, { status: 400 });
    }
    if (!TYPES_OK.includes(mediaType)) {
      return NextResponse.json({ success: false, error: 'Format non accepte : ' + mediaType }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Claude Vision n'accepte pas le HEIC des photos iPhone : on convertit en JPEG
    // pour la LECTURE seulement. Le fichier d'origine reste celui qui est stocke,
    // et l'empreinte est calculee sur lui.
    let bufferLecture: Buffer = buffer;
    let typeLecture = mediaType;
    if (mediaType === 'image/heic' || mediaType === 'image/heif') {
      try {
        bufferLecture = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
        typeLecture = 'image/jpeg';
      } catch (e: any) {
        console.error('Conversion HEIC echouee:', e.message);
        return NextResponse.json({ success: false, error: 'Photo HEIC illisible - reessayez en JPEG' }, { status: 400 });
      }
    }
    const base64 = bufferLecture.toString('base64');

    const empreinte = createHash('sha256').update(buffer).digest('hex');

    const tenantId = await getTenantIdFromRequest(req);
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let doublon = null;
    if (tenantId) {
      const { data: dej } = await sb
        .from('notes_frais')
        .select('id, date, marchand, montant')
        .eq('tenant_id', tenantId)
        .eq('justificatif_empreinte', empreinte)
        .limit(1);
      if (dej && dej.length > 0) doublon = dej[0];
    }

    const annee = new Date().getFullYear();
    const nomPropre = (file.name || 'justificatif').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
    const chemin = (tenantId || 'sans-tenant') + '/' + annee + '/' + Date.now() + '_' + nomPropre;

    const { error: errUp } = await sb.storage.from('justificatifs').upload(chemin, buffer, {
      contentType: mediaType,
      upsert: false,
    });
    if (errUp) console.error('Justificatif non stocke:', errUp.message);

    const justificatif = errUp ? null : {
      chemin,
      nom: file.name || nomPropre,
      type: mediaType,
      taille: file.size,
      empreinte,
      depose_le: new Date().toISOString(),
    };

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: typeLecture, data: base64 } },
            {
              type: 'text',
              text: `Analyse ce ticket de caisse ou facture et extrais les informations suivantes. Reponds UNIQUEMENT en JSON valide, sans texte avant ou apres :
{
  "marchand": "nom du commerce ou fournisseur",
  "date": "date au format YYYY-MM-DD",
  "montant_ttc": nombre en euros,
  "tva": montant TVA en euros,
  "categorie": "Transport" ou "Repas" ou "Hebergement" ou "Fournitures" ou "Telecom" ou "Formation" ou "Autre",
  "confiance": nombre entre 0 et 100 representant la qualite de lecture du ticket
}
Si une info est illisible, mets null pour ce champ.`,
            },
          ],
        }],
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const msg = data.error?.message || ('Erreur Claude Vision HTTP ' + res.status);
      console.error('OCR Claude:', msg);
      return NextResponse.json({ success: false, error: msg, justificatif }, { status: 502 });
    }

    const text = data.content?.[0]?.text;
    if (!text) {
      console.error('OCR: reponse sans texte', JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ success: false, error: 'Lecture impossible, reponse vide', justificatif }, { status: 502 });
    }

    const clean = text.replace(/```json|```/g, '').trim();
    let result;
    try { result = JSON.parse(clean); }
    catch (e) {
      console.error('OCR: JSON invalide:', clean.slice(0, 300));
      return NextResponse.json({ success: false, error: 'Ticket illisible', justificatif }, { status: 502 });
    }

    return NextResponse.json({ success: true, data: result, justificatif, doublon });
  } catch (error: any) {
    console.error('OCR error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
