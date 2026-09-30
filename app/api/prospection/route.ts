import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifierAccesModule } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';
import {
  quotaMinutes, modulesActifsDuTenant, minutesUtiliseesCeMois, coutPlateformeCeMoisEur,
  budgetMensuelEur, dureeAutorisee,
} from '../../lib/leaUsage';
import { dechiffrer, getAnthropicKey } from '../../lib/anthropicKey';

export const maxDuration = 30

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const acces = await verifierAccesModule(req, 'prospection');
    if (!acces.ok) return acces.reponse;
    const tenantId = acces.tenantId;
    const { action, ...params } = await req.json()

    if (action === 'enrichir_lead') {
      const sb = getAdminClient()

      const { data: lead } = await sb.from('crm_leads').select('*').eq('id', params.lead_id).eq('tenant_id', tenantId).maybeSingle()
      if (!lead) return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 })

      const contact = (lead.contact || '').trim()
      const [prenom, ...resteNom] = contact.split(' ')
      const nomFamille = resteNom.join(' ')

      let emailTrouve: string | null = null
      let source = ''

      // 1) Recherche web automatique via Claude d'abord (outil web_search
      // natif de l'API Anthropic, disponible depuis avril 2026) -- reutilise
      // la cle deja configuree pour l'app (tenant ou plateforme), aucun
      // nouveau compte a creer. Priorite demandee : Hunter n'a pas ete fiable
      // en test ce soir (comptes/domaines), Claude passe devant.
      {
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
        } catch { /* rien trouve, on tente Hunter ci-dessous */ }
      }

      // 2) Si Claude n'a rien trouve, Hunter.io en repli si le tenant l'a
      // connecte (BYOK, garde a sa demande).
      if (!emailTrouve && prenom && nomFamille) {
        const { data: hunterIntg } = await sb.from('integrations_personnalisees').select('cle_api').eq('tenant_id', tenantId).eq('nom', 'Hunter.io').maybeSingle()
        if (hunterIntg?.cle_api) {
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
          } catch { /* rien trouve, on repond trouve:false plus bas */ }
        }
      }

      if (!emailTrouve) {
        return NextResponse.json({ success: true, trouve: false })
      }

      await sb.from('crm_leads').update({
        email: emailTrouve,
        source: lead.source || source,
        updated_at: new Date().toISOString(),
      }).eq('id', lead.id).eq('tenant_id', tenantId)

      return NextResponse.json({
        success: true,
        trouve: true,
        email: emailTrouve,
        source,
        email_envoye: false,
        linkedin_url: null,
      })
    }

    if (action === 'signal_ajouter_crm') {
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
      const sb = getAdminClient()
      const { error } = await sb.from('signaux_prospection').update({ vu: true }).eq('id', params.signal_id).eq('tenant_id', tenantId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'call') {
      // Appel Vapi payant, passe au nom de l'entreprise : proprietaire et Admin uniquement.
      if (!(await estAutoriseGererEquipe(req, tenantId))) {
        return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
      }
      const telephone = typeof params.tel === 'string' ? params.tel.trim() : '';
      const nom = typeof params.nom === 'string' ? params.nom.trim() : '';
      if (!/^\+[1-9]\d{7,14}$/.test(telephone) || !nom) {
        return NextResponse.json({ error: 'Numero international et nom requis' }, { status: 400 });
      }

      // Cout des appels (comptes Vapi/Twilio de Xyra) : quota de minutes du client, plafond
      // global mensuel, et duree maximale imposee a Vapi (c'est Vapi qui coupe l'appel).
      const estOwner = acces.plan === 'owner';
      const quota = quotaMinutes(acces.plan, await modulesActifsDuTenant(tenantId));
      const minutesUtilisees = await minutesUtiliseesCeMois(tenantId);
      const autorisation = dureeAutorisee({
        quota, minutesUtilisees, estOwner,
        coutPlateformeEur: estOwner ? 0 : await coutPlateformeCeMoisEur(),
        budgetEur: budgetMensuelEur(),
      });
      if ('refus' in autorisation) {
        const messages = {
          quota: `Vous avez utilisé vos ${quota} minutes Lea de ce mois.`,
          budget: 'Lea est momentanément indisponible. Réessayez plus tard ou contactez le support.',
          sans_acces: 'Lea n\'est pas incluse dans votre forfait.',
        };
        return NextResponse.json({ error: messages[autorisation.refus], motif: autorisation.refus }, { status: 403 });
      }

      // Lea parle au nom de l'entreprise du client : ces informations viennent de la base,
      // pas du navigateur. Elle annonce etre une IA (AI Act, art. 50).
      const tenant = acces.tenant;
      const societeClient = String(tenant?.societe || tenant?.nom || 'notre entreprise');
      const secteurClient = String(tenant?.secteur || tenant?.metier || '');
      const service = typeof params.service === 'string' && params.service.trim() ? params.service.trim() : secteurClient;

      const response = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Les identifiants Vapi ne viennent jamais du navigateur : un
          // utilisateur ne peut donc pas appeler un numero ou un assistant
          // d'un autre tenant/compte Vapi.
          phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID || '+12526754837',
          customer: {
            number: telephone,
            name: nom,
          },
          assistantId: process.env.VAPI_ASSISTANT_ID || '715e757d-93e7-423a-a6f1-18a77bb19e94',
          metadata: { tenant_id: tenantId },
          assistantOverrides: {
            maxDurationSeconds: autorisation.secondes,
            firstMessage: `Bonjour, je suis Léa, l'assistante virtuelle IA de ${societeClient}. Est-ce que je parle bien à ${nom} ?`,
            variableValues: {
              company_name: societeClient,
              sector: secteurClient,
              service,
              prospect_name: nom,
              prospect_country: String(tenant?.pays || ''),
              prospect_company: typeof params.societe === 'string' ? params.societe : '',
            }
          }
        }),
      })
      // Vapi peut repondre en texte brut ("unauthorized") : on verifie avant de lire du JSON.
      const texteVapi = await response.text()
      let data: unknown = null
      try { data = JSON.parse(texteVapi) } catch { data = null }
      if (!response.ok) {
        console.error('Vapi a refuse l\'appel:', response.status, texteVapi.slice(0, 300))
        const message = response.status === 401 || response.status === 403
          ? 'Vapi a refusé l\'accès (clé Vapi invalide).'
          : 'Vapi n\'a pas pu lancer l\'appel.'
        return NextResponse.json({ error: message }, { status: 502 })
      }
      return NextResponse.json({ success: true, call: data })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  } catch (error: any) {
    console.error('Prospection API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const acces = await verifierAccesModule(req, 'prospection');
  if (!acces.ok) return acces.reponse;
  const tenantId = acces.tenantId;
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'signaux') {
    const sb = getAdminClient()
    const { data } = await sb.from('signaux_prospection').select('*').eq('tenant_id', tenantId).eq('vu', false).order('cree_le', { ascending: false })
    return NextResponse.json({ success: true, signaux: data || [] })
  }

  if (action === 'calls') {
    const { data, error } = await getAdminClient()
      .from('vapi_calls')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('started_at', { ascending: false })
      .limit(50);
    if (error) return NextResponse.json({ error: 'Impossible de lire les appels' }, { status: 500 });
    return NextResponse.json({ success: true, calls: data || [] });
  }

  if (action === 'quota_lea') {
    const quota = quotaMinutes(acces.plan, await modulesActifsDuTenant(tenantId));
    const utilisees = await minutesUtiliseesCeMois(tenantId);
    return NextResponse.json({ success: true, minutes_utilisees: utilisees, minutes_incluses: quota, illimite: quota === null });
  }

  if (action === 'assistants') {
    return NextResponse.json({ error: 'Action non disponible' }, { status: 403 });
  }

  const sb = getAdminClient()

  const statutConnexion = !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)

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
