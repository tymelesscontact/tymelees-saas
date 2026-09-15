import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { dechiffrer } from '../../lib/anthropicKey';

export const maxDuration = 30

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const { action, ...params } = await req.json()

    if (action === 'enrichir_lead') {
      const tenantId = await getTenantIdFromRequest(req)
      if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 })
      const sb = getAdminClient()

      const { data: lead } = await sb.from('crm_leads').select('*').eq('id', params.lead_id).eq('tenant_id', tenantId).maybeSingle()
      if (!lead) return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 })

      const contact = (lead.contact || '').trim()
      const [prenom, ...resteNom] = contact.split(' ')
      const nomFamille = resteNom.join(' ')

      let emailTrouve: string | null = null
      let source = ''

      // 1) Hunter.io d'abord, si le tenant l'a connecte (BYOK, garde tel quel
      // a sa demande) -- rapide et peu couteux en credits quand ca marche.
      const { data: hunterIntg } = await sb.from('integrations_personnalisees').select('cle_api').eq('tenant_id', tenantId).eq('nom', 'Hunter.io').maybeSingle()
      if (hunterIntg?.cle_api && prenom && nomFamille) {
        try {
          const hunterKey = dechiffrer(hunterIntg.cle_api)
          let domaine = (params.domaine || '').trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').replace(/\s+/g, '')
          if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domaine)) domaine = ''

          const hUrl = new URL('https://api.hunter.io/v2/email-finder')
          hUrl.searchParams.set('api_key', hunterKey)
          if (domaine) hUrl.searchParams.set('domain', domaine)
          else hUrl.searchParams.set('company', lead.nom || '')
          hUrl.searchParams.set('first_name', prenom)
          hUrl.searchParams.set('last_name', nomFamille)

          const hRes = await fetch(hUrl.toString(), { signal: AbortSignal.timeout(12000) })
          const hText = await hRes.text()
          const hData = JSON.parse(hText)
          if (hRes.ok && hData.data?.email) { emailTrouve = hData.data.email; source = 'Hunter.io' }
        } catch { /* on retombe sur la recherche web ci-dessous */ }
      }

      // 2) Si Hunter n'a rien trouve (ou n'est pas connecte), recherche web
      // automatique via Claude (outil web_search natif de l'API Anthropic,
      // disponible depuis avril 2026) -- reutilise la cle deja configuree
      // pour l'app (tenant ou plateforme), aucun nouveau compte a creer.
      if (!emailTrouve) {
        const cleAnthropic = await getAnthropicKey(tenantId)
        const prompt = `Tu dois trouver une information de contact professionnelle reelle en cherchant sur le web. N'invente jamais un email.

Entreprise : ${lead.nom || 'inconnue'}
Contact recherche : ${contact || '(nom du dirigeant inconnu, cherche un contact general de l\'entreprise : email de type contact@ ou info@)'}
${lead.notes ? `Infos complementaires : ${lead.notes}` : ''}

Cherche le site web officiel de cette entreprise, puis son email de contact professionnel reel (page "Contact", mentions legales, ou email du dirigeant s'il est publie). Reponds STRICTEMENT dans un de ces deux formats, rien d'autre :
EMAIL_TROUVE: adresse@exemple.fr
ou
INTROUVABLE`

        try {
          const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': cleAnthropic, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 500,
              tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
              messages: [{ role: 'user', content: prompt }],
            }),
            signal: AbortSignal.timeout(28000),
          })
          const claudeData = await claudeRes.json()
          if (claudeRes.ok) {
            const texteFinal = (claudeData.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join(' ').trim()
            const matchEmail = texteFinal.match(/EMAIL_TROUVE:\s*([^\s]+@[^\s]+\.[^\s]+)/i)
            if (matchEmail) { emailTrouve = matchEmail[1].replace(/[.,;]+$/, ''); source = 'Recherche web (Claude)' }
          }
        } catch { /* rien trouve, on repond trouve:false plus bas */ }
      }

      if (!emailTrouve) {
        return NextResponse.json({ success: true, trouve: false })
      }

      await sb.from('crm_leads').update({
        email: emailTrouve,
        source: lead.source || source,
        updated_at: new Date().toISOString(),
      }).eq('id', lead.id).eq('tenant_id', tenantId)

      // Envoi automatique du premier message de prospection, comme demande --
      // meme mecanique/expediteur que le bouton email existant (api/crm
      // action envoyer_email), pour rester coherent avec ce qui est deja reel.
      let emailEnvoye = false
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Xyra <notifications@xyraio.fr>',
          to: emailTrouve,
          subject: `Prise de contact — ${lead.nom || ''}`,
          html: `<div style="font-family:sans-serif;padding:24px;white-space:pre-line;">Bonjour, je me permets de vous contacter au sujet de nos services.</div>`,
        })
        emailEnvoye = true
      } catch (e: any) {
        console.error('Envoi auto prospection:', e.message)
      }

      return NextResponse.json({
        success: true,
        trouve: true,
        email: emailTrouve,
        source,
        email_envoye: emailEnvoye,
        linkedin_url: null,
      })
    }

    if (action === 'signal_ajouter_crm') {
      const tenantId = await getTenantIdFromRequest(req)
      if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 })
      const sb = getAdminClient()
      const { data: signal } = await sb.from('signaux_prospection').select('*').eq('id', params.signal_id).eq('tenant_id', tenantId).maybeSingle()
      if (!signal) return NextResponse.json({ error: 'Signal introuvable' }, { status: 404 })
      const { error } = await sb.from('crm_leads').insert({
        nom: signal.nom_entreprise, contact: signal.dirigeant || '', source: 'Signal quotidien Xyra',
        notes: signal.raison, etape: 'Nouveau', score: 60, tenant_id: tenantId,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      await sb.from('signaux_prospection').update({ vu: true }).eq('id', signal.id).eq('tenant_id', tenantId)
      return NextResponse.json({ success: true })
    }

    if (action === 'signal_ignorer') {
      const tenantId = await getTenantIdFromRequest(req)
      if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 })
      const sb = getAdminClient()
      const { error } = await sb.from('signaux_prospection').update({ vu: true }).eq('id', params.signal_id).eq('tenant_id', tenantId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'call') {
      const response = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumberId: params.phoneNumberId,
          customer: {
            number: params.tel,
            name: params.nom,
          },
          assistantId: params.assistantId,
          assistantOverrides: {
            variableValues: {
              nom_prospect: params.nom,
              societe: params.societe,
              secteur: params.secteur,
              service: params.service || '',
              nom_commercial: params.nom_commercial || 'Xyra',
            }
          }
        }),
      })
      const data = await response.json()
      return NextResponse.json({ success: true, call: data })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  } catch (error: any) {
    console.error('Prospection API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'signaux') {
    const tenantId = await getTenantIdFromRequest(req)
    if (!tenantId) return NextResponse.json({ error: 'non_autorise' }, { status: 401 })
    const sb = getAdminClient()
    const { data } = await sb.from('signaux_prospection').select('*').eq('tenant_id', tenantId).eq('vu', false).order('cree_le', { ascending: false })
    return NextResponse.json({ success: true, signaux: data || [] })
  }

  if (action === 'calls' || action === 'assistants') {
    try {
      const response = await fetch(`https://api.vapi.ai/${action === 'calls' ? 'call?limit=50' : 'assistant'}`, {
        headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` },
      })
      const data = await response.json()
      return NextResponse.json({ success: true, [action]: data })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  const sb = getAdminClient()

  const statutConnexion = !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)

  const tenantId = await getTenantIdFromRequest(req)
  let conversations: any[] = []
  let devisGeneres: any[] = []
  if (tenantId) {
    const { data: conv } = await sb.from("conduit").select("*").eq("tenant_id", tenantId)
    const { data: dev } = await sb.from("devis").select("*").eq("tenant_id", tenantId)
    conversations = conv || []
    devisGeneres = dev || []
  }

  const totalConversations = conversations?.length || 0

  let totalMessagesClient = 0
  let totalMessagesLea = 0
  conversations?.forEach((c: any) => {
    try {
      const hist = c.historique ? JSON.parse(c.historique) : []
      hist.forEach((m: any) => {
        if (m.role === "user") totalMessagesClient++
        if (m.role === "assistant") totalMessagesLea++
      })
    } catch {}
  })

  const tauxReponse = totalMessagesClient > 0 ? Math.round((totalMessagesLea / totalMessagesClient) * 100) : 0

  const devisViaWhatsapp = (devisGeneres || []).filter((d: any) => d.client_tel)
  const devisAcceptes = devisViaWhatsapp.filter((d: any) => d.statut === "envoyé" || d.statut === "accepté")
  const montantTotal = devisViaWhatsapp.reduce((sum: number, d: any) => sum + (d.montant || 0), 0)

  const maintenant = Date.now()
  const conversationsEnAttente = (conversations || []).filter((c: any) => {
    try {
      const hist = c.historique ? JSON.parse(c.historique) : []
      const dernier = hist[hist.length - 1]
      return dernier?.role === "user" && !c.ia_pausee
    } catch {
      return false
    }
  })

  return NextResponse.json({
    statutConnexion,
    totalConversations,
    conversationsEnAttente: conversationsEnAttente.length,
    tauxReponse,
    devisGeneres: devisViaWhatsapp.length,
    devisAcceptes: devisAcceptes.length,
    montantTotal,
  })
}
