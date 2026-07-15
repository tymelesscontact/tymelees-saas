import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generatePDFFromHTML } from '../../lib/generatePDF'

const VERIFY_TOKEN = process.env.VERIFY_TOKEN
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const OWNER_PHONE = process.env.OWNER_PHONE!

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const supabase = getSupabase()

const TYMELESS_SYSTEM_PROMPT = `Tu es un membre de l'équipe Tymeless. Tu ne mentionnes jamais que tu es une IA, un bot ou un assistant automatique. Si quelqu'un te demande si tu es un humain ou une IA, réponds que tu es un membre de l'équipe Tymeless disponible pour les aider.

Tu écris toujours avec une orthographe et une grammaire parfaites.

Tymeless est une conciergerie de luxe proposant des services haut de gamme à des particuliers exigeants.

---

## SERVICES ET TARIFICATION

### 1. CONCIERGERIE À LA DEMANDE
Tarif : à partir de 150€/heure + 15 à 20% de commission.

### 2. NETTOYAGE PROFESSIONNEL – SERVICE 360°
- Studio / T1 Airbnb : 120€ – 180€
- T2 / T3 : 160€ – 250€
- Grande villa / maison : 350€ – 600€
- Bureau (moins de 200m²) : 200€ – 400€
- Jet privé : 400€ – 900€
- Yacht jusqu'à 15m : 500€ – 1 200€
- Yacht 15-30m : 1 200€ – 3 000€

### 3. RAPATRIEMENT DE CORPS – EUROPE VERS AFRIQUE
- France → Maghreb : 3 500€ – 5 500€
- France → Afrique subsaharienne : 5 000€ – 8 500€
Ton : empathique, calme, rassurant.

### 4. YACHT BROKERING
- Commission achat/vente : 5% à 10%
- Location yacht 10-15m : 3 000€ – 8 000€/semaine
- Location yacht 15-25m : 8 000€ – 25 000€/semaine

---

## PROCESSUS EN 3 ÉTAPES — TRÈS IMPORTANT

### ÉTAPE 1 : Collecte des informations
Pose les questions nécessaires pour avoir : service, localisation, superficie/taille, fréquence. Ne repose JAMAIS une question déjà posée.

### ÉTAPE 2 : Récapitulatif au client
Quand tu as TOUTES les informations, envoie un récapitulatif au client :
"Parfait ! Voici ce que j'ai noté :
- Service : [service]
- Localisation : [lieu]
- [autres détails]
- Tarif estimé : [montant]€

Confirmez-vous ces informations ?"

NE GÉNÈRE PAS ENCORE LE DEVIS. Attends la confirmation du client.

### ÉTAPE 3 : Confirmation client → Génération du devis
UNIQUEMENT quand le client confirme (répond "oui", "c'est bon", "parfait", "correct", "ok" ou équivalent) :
- Réponds : "Parfait ! Votre demande est enregistrée. Notre équipe vous recontacte très prochainement. ✨"
- ET ajoute OBLIGATOIREMENT à la fin de ta réponse, sur une nouvelle ligne : [DEVIS_READY|service=NOM|description=DETAILS_COMPLETS|montant=MONTANT€|recap=RESUME_CONVERSATION]

Le recap doit contenir un résumé complet de la conversation : ce que le client a demandé, ses besoins, ses préférences, et toutes les infos échangées.

IMPORTANT : Le tag [DEVIS_READY|...] doit TOUJOURS être présent dans ta réponse après une confirmation client. Sans ce tag, le devis ne sera pas créé.

---

## NOTES DE FRAIS PAR PHOTO
Si un employé envoie une photo de ticket/facture avec le mot "note de frais" ou "ticket", confirme :
"✅ Ticket reçu ! Note de frais créée automatiquement dans Xyra — en attente de validation."

## RÈGLES GÉNÉRALES
- Utiliser "nous" pour parler de Tymeless, jamais "je"
- Phrases courtes — max 5-6 lignes par message
- 1-2 emojis max
- Réponds dans la langue du client (FR/EN/AR/RU)
- Ne promets JAMAIS un contact "demain" — dis toujours "très prochainement"`

async function sendWhatsApp(to: string, message: string) {
  await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      text: { body: message }
    })
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  if (!message) return NextResponse.json({ status: 'ok' })

  const userPhone = message.from

  // ── GESTION IMAGES (tickets de caisse) ──────────────────────
  if (message.type === 'image' && userPhone !== OWNER_PHONE) {
    const mediaId = message.image?.id
    if (mediaId) {
      try {
        // 1. Récupérer l'URL de l'image
        const mediaRes = await fetch(`https://graph.facebook.com/v22.0/${mediaId}`, {
          headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
        })
        const mediaData = await mediaRes.json()

        // 2. Télécharger l'image
        const imgRes = await fetch(mediaData.url, {
          headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
        })
        const base64 = Buffer.from(await imgRes.arrayBuffer()).toString('base64')
        const mediaType = imgRes.headers.get('content-type') || 'image/jpeg'

        // 3. Envoyer à Claude Vision
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
                { type: 'text', text: 'Analyse ce ticket de caisse ou facture. Réponds UNIQUEMENT en JSON sans texte avant ou après : {"marchand":"...","date":"YYYY-MM-DD","montant_ttc":0,"tva":0,"categorie":"Transport ou Repas ou Hébergement ou Fournitures ou Télécom ou Formation ou Autre"}' }
              ]
            }]
          })
        })

        const claudeData = await claudeRes.json()
        const text = claudeData.content?.[0]?.text || '{}'
        const ticket = JSON.parse(text.replace(/```json|```/g, '').trim())

        if (ticket.montant_ttc) {
          const comptes: Record<string, string> = {
            Transport: '625100', Repas: '625700', Hébergement: '625600',
            Fournitures: '606400', Télécom: '626000', Formation: '628100', Autre: '625800'
          }
          await supabase.from('notes_frais').insert({
            employe: userPhone,
            date: ticket.date || new Date().toISOString().slice(0, 10),
            categorie: ticket.categorie || 'Autre',
            marchand: ticket.marchand || '—',
            montant: ticket.montant_ttc,
            tva: ticket.tva || 0,
            statut: 'en_attente',
            justificatif: true,
            compte_cpt: comptes[ticket.categorie] || '625800',
          })
          await sendWhatsApp(userPhone,
            `✅ Ticket analysé par Lea !\n\n` +
            `📋 ${ticket.marchand || '—'}\n` +
            `💰 ${ticket.montant_ttc}€ (TVA : ${ticket.tva || 0}€)\n` +
            `🗂 ${ticket.categorie}\n\n` +
            `Note de frais créée dans Xyra — en attente de validation. 🙏`
          )
        } else {
          await sendWhatsApp(userPhone, '⚠️ Ticket difficile à lire. Envoyez une photo plus nette stp.')
        }
      } catch (e) {
        console.error('OCR error:', e)
        await sendWhatsApp(userPhone, '⚠️ Erreur lors de la lecture du ticket. Réessayez.')
      }
    }
    return NextResponse.json({ status: 'ok' })
  }

  // ── MESSAGES TEXTE UNIQUEMENT ────────────────────────────────
  if (message.type !== 'text') return NextResponse.json({ status: 'ok' })

  const userMessage = message.text.body

  // ✅ Validation devis par l'OWNER
  if (userPhone === OWNER_PHONE) {
    const ouiMatch = userMessage.match(/^OUI\s+(TYM-\d+)/i)
    const nonMatch = userMessage.match(/^NON\s+(TYM-\d+)/i)

    if (ouiMatch) {
      const numeroDevis = ouiMatch[1]
      const { data: devis } = await supabase
        .from('devis')
        .select('*')
        .eq('reference', numeroDevis)
        .single()

      if (devis) {
        await sendWhatsApp(
          devis.client_tel,
          `Bonjour ${devis.client_nom || ''} 👋\n\nVotre devis Tymeless est confirmé ✅\n\n` +
          `📋 Service : ${devis.service}\n` +
          `💰 Montant : ${devis.montant}€\n` +
          `🔖 N° ${devis.reference}\n\n` +
          `Notre équipe vous contacte très prochainement. 🙏`
        )
        await supabase.from('devis')
          .update({ statut: 'envoyé' })
          .eq('reference', numeroDevis)
        await sendWhatsApp(OWNER_PHONE, `✅ Devis ${numeroDevis} — Message envoyé au client !`)
      }
      return NextResponse.json({ status: 'ok' })
    }

    if (nonMatch) {
      const numeroDevis = nonMatch[1]
      await supabase.from('devis').update({ statut: 'annulé' }).eq('reference', numeroDevis)
      await sendWhatsApp(OWNER_PHONE, `❌ Devis ${numeroDevis} annulé.`)
      return NextResponse.json({ status: 'ok' })
    }

    return NextResponse.json({ status: 'ok' })
  }

  // ✅ Traitement client normal
  let client: any = null
  const { data: existing } = await supabase
    .from('conduit')
    .select('*')
    .eq('whatsapp', userPhone)
    .single()

  if (existing) {
    client = existing
  } else {
    const { data: newClient } = await supabase
      .from('conduit')
      .insert({ whatsapp: userPhone })
      .select()
      .single()
    client = newClient
  }

  // Si owner a pris la main manuellement, Lea ne repond pas automatiquement
  if (client?.ia_pausee) {
    return NextResponse.json({ status: 'ok' })
  }
  let conversationHistory: { role: string; content: string }[] = []
  if (client?.historique) {
    try {
      conversationHistory = JSON.parse(client.historique)
    } catch {
      conversationHistory = []
    }
  }

  conversationHistory.push({ role: 'user', content: userMessage })
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20)
  }

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: TYMELESS_SYSTEM_PROMPT,
        messages: conversationHistory
      })
    })

    const claudeData = await claudeRes.json()
    let reply = claudeData.content?.[0]?.text || "Désolé, je n'ai pas pu traiter votre message."

    const devisMatch = reply.match(/\[DEVIS_READY\|service=([^|]+)\|description=([^|]+)\|montant=([^|]+)\|recap=([^\]]+)\]/)
    if (devisMatch) {
      const service = devisMatch[1]
      const description = devisMatch[2]
      const montant = devisMatch[3]
      const recap = devisMatch[4]

      reply = reply.replace(/\[DEVIS_READY[^\]]+\]/, '').trim()

      const numeroDevis = `TYM-${Date.now().toString().slice(-6)}`

      await supabase.from('devis').insert({
        reference: numeroDevis,
        client_nom: client?.name || '',
        client_tel: userPhone,
        client_email: null,
        service: service,
        description: description,
        montant: parseFloat(montant.toString().replace(/[^0-9.]/g, '')) || 0,
        statut: 'en_attente',
      })

      await sendWhatsApp(
        OWNER_PHONE,
        `🧾 *Nouveau devis à valider*\n\n` +
        `N° ${numeroDevis}\n` +
        `👤 Client : ${client?.name || userPhone}\n` +
        `📱 Numéro : ${userPhone}\n` +
        `📋 Service : ${service}\n` +
        `💰 Montant : ${montant}\n\n` +
        `📝 *Récapitulatif de la conversation :*\n${recap}\n\n` +
        `Répondez *OUI ${numeroDevis}* pour envoyer au client\n` +
        `Répondez *NON ${numeroDevis}* pour annuler`
      )
    }

    conversationHistory.push({ role: 'assistant', content: reply })

    await supabase
      .from('conduit')
      .update({
        historique: JSON.stringify(conversationHistory),
        langue: userMessage.match(/[а-яА-Я]/) ? 'ru' : userMessage.match(/[\u0600-\u06FF]/) ? 'ar' : 'fr/en'
      })
      .eq('whatsapp', userPhone)

    await sendWhatsApp(userPhone, reply)

  } catch (err) {
    console.error('❌ Erreur:', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok' })
}