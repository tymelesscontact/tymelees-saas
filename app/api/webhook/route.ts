import { NextRequest, NextResponse } from 'next/server'

const VERIFY_TOKEN = process.env.VERIFY_TOKEN
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

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
  if (!message || message.type !== 'text') {
    return NextResponse.json({ status: 'ok' })
  }
  const userMessage = message.text.body
  const userPhone = message.from
  console.log('📩 Message de:', userPhone, '→', userMessage)

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Tu es l'assistant IA de Tymeless, une entreprise de conciergerie premium. Tu es professionnel, chaleureux et efficace. Tu réponds toujours en français.`,
        messages: [{ role: 'user', content: userMessage }]
      })
    })
    const claudeData = await claudeRes.json()
    console.log('🤖 Claude:', JSON.stringify(claudeData))
    const reply = claudeData.content?.[0]?.text || "Désolé, je n'ai pas pu traiter votre message."

    const waRes = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: userPhone,
        text: { body: reply }
      })
    })
    const waData = await waRes.json()
    console.log('📤 WhatsApp:', JSON.stringify(waData))
  } catch (err) {
    console.error('❌ Erreur:', err)
  }

  return NextResponse.json({ status: 'ok' })
}