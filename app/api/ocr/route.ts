import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) return NextResponse.json({ error: 'Pas d\'image' }, { status: 400 });

    // Convertir en base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mediaType = file.type || 'image/jpeg';

    // Envoyer à Claude Vision
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
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `Analyse ce ticket de caisse ou facture et extrais les informations suivantes. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
{
  "marchand": "nom du commerce ou fournisseur",
  "date": "date au format YYYY-MM-DD",
  "montant_ttc": nombre en euros,
  "tva": montant TVA en euros,
  "categorie": "Transport" ou "Repas" ou "Hébergement" ou "Fournitures" ou "Télécom" ou "Formation" ou "Autre",
  "confiance": nombre entre 0 et 100 représentant la qualité de lecture du ticket
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
      return NextResponse.json({ success: false, error: msg }, { status: 502 });
    }
    const text = data.content?.[0]?.text;
    if (!text) {
      console.error('OCR: reponse sans texte', JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ success: false, error: 'Lecture impossible, reponse vide' }, { status: 502 });
    }
    
    // Parser le JSON retourné par Claude
    const clean = text.replace(/```json|```/g, '').trim();
    let result;
    try { result = JSON.parse(clean); }
    catch (e) {
      console.error('OCR: JSON invalide:', clean.slice(0, 300));
      return NextResponse.json({ success: false, error: 'Ticket illisible' }, { status: 502 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('OCR error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}