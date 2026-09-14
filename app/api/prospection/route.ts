import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { dechiffrer } from '../../lib/anthropicKey';

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

      const { data: integ } = await sb.from('integrations_personnalisees').select('cle_api').eq('tenant_id', tenantId).eq('nom', 'Apollo.io').maybeSingle()
      if (!integ?.cle_api) {
        return NextResponse.json({ error: 'apollo_non_connecte' }, { status: 400 })
      }

      let apolloKey = ''
      try { apolloKey = dechiffrer(integ.cle_api) } catch { return NextResponse.json({ error: 'Cle Apollo illisible, reconnecte-la dans Parametres' }, { status: 500 }) }

      const contact = (lead.contact || '').trim()
      const [prenom, ...resteNom] = contact.split(' ')
      const nomFamille = resteNom.join(' ')

      const apolloRes = await fetch('https://api.apollo.io/api/v1/people/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apolloKey },
        body: JSON.stringify({
          first_name: prenom || undefined,
          last_name: nomFamille || undefined,
          organization_name: lead.nom || undefined,
        }),
      })
      if (!apolloRes.ok) {
        return NextResponse.json({ error: `Erreur Apollo (${apolloRes.status})` }, { status: 502 })
      }
      const apolloData = await apolloRes.json()
      const person = apolloData.person

      if (!person) {
        return NextResponse.json({ success: true, trouve: false })
      }

      const updates: any = { updated_at: new Date().toISOString() }
      if (person.email) updates.email = person.email
      const notesLinkedIn = person.linkedin_url ? `LinkedIn : ${person.linkedin_url}` : ''
      if (notesLinkedIn && !(lead.notes || '').includes(notesLinkedIn)) {
        updates.notes = [lead.notes, notesLinkedIn].filter(Boolean).join(' · ')
      }
      await sb.from('crm_leads').update(updates).eq('id', lead.id).eq('tenant_id', tenantId)

      return NextResponse.json({
        success: true,
        trouve: true,
        email: person.email || null,
        email_status: person.email_status || null,
        linkedin_url: person.linkedin_url || null,
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
