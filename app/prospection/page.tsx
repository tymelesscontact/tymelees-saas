import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RELEVANCE_BASE = `https://api-${process.env.RELEVANCE_AI_REGION}.stack.tryrelevance.com/latest`;
const RELEVANCE_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `${process.env.RELEVANCE_AI_PROJECT}:${process.env.RELEVANCE_AI_API_KEY}`,
};

export async function POST(req: NextRequest) {
  try {
    const { action, ...params } = await req.json();

    // ─── VAPI ────────────────────────────────────────────────
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
      });
      const data = await response.json();
      return NextResponse.json({ success: true, call: data });
    }

    if (action === 'calls') {
      const response = await fetch('https://api.vapi.ai/call?limit=50', {
        headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` },
      });
      const data = await response.json();
      return NextResponse.json({ success: true, calls: data });
    }

    if (action === 'assistants') {
      const response = await fetch('https://api.vapi.ai/assistant', {
        headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` },
      });
      const data = await response.json();
      return NextResponse.json({ success: true, assistants: data });
    }

    // ─── RELEVANCE AI — Déclencher l'agent mailing ───────────
    if (action === 'relevance_trigger') {
      const agentId = process.env.RELEVANCE_AI_AGENT_ID;

      // Message personnalisé selon le secteur et la société du client
      const message = `
Tu es un agent commercial travaillant pour ${params.nom_commercial || params.societe_owner || 'notre société'}.
Envoie un email de prospection commercial personnalisé à :
- Nom : ${params.nom}
- Société : ${params.societe}
- Email : ${params.email}
- Secteur : ${params.secteur}
- Service proposé : ${params.service}
- Pays : ${params.pays || 'France'}

Présente-toi comme l'assistant de ${params.nom_commercial || params.societe_owner}, adapte le message au secteur ${params.secteur}, sois professionnel et personnalisé.
      `.trim();

      const response = await fetch(`${RELEVANCE_BASE}/agents/trigger`, {
        method: 'POST',
        headers: RELEVANCE_HEADERS,
        body: JSON.stringify({
          message: { role: 'user', content: message },
          agent_id: agentId,
        }),
      });
      const data = await response.json();
      return NextResponse.json({ success: true, task: data });
    }

    if (action === 'relevance_conversations') {
      const agentId = process.env.RELEVANCE_AI_AGENT_ID;
      const response = await fetch(`${RELEVANCE_BASE}/knowledge/sets/list`, {
        method: 'POST',
        headers: RELEVANCE_HEADERS,
        body: JSON.stringify({
          filters: [
            { filter_type: 'exact_match', field: 'type', condition_value: 'conversation' },
            { filter_type: 'exact_match', field: 'conversation.agent_id', condition_value: agentId },
          ],
          include_hidden: true,
        }),
      });
      const data = await response.json();
      return NextResponse.json({ success: true, conversations: data?.results || [] });
    }

    if (action === 'relevance_campagne') {
      // Lancer une campagne sur plusieurs leads
      const agentId = process.env.RELEVANCE_AI_AGENT_ID;
      const leads = params.leads || [];
      const results = [];

      for (const lead of leads.slice(0, 10)) {
        const message = `
Tu es un agent commercial travaillant pour ${params.nom_commercial || 'notre société'}.
Prospecte ce contact :
- Nom : ${lead.nom}
- Société : ${lead.societe || lead.nom}
- Email : ${lead.email}
- Secteur : ${lead.secteur || params.secteur}
- Service : ${params.service}
        `.trim();

        try {
          const res = await fetch(`${RELEVANCE_BASE}/agents/trigger`, {
            method: 'POST',
            headers: RELEVANCE_HEADERS,
            body: JSON.stringify({
              message: { role: 'user', content: message },
              agent_id: agentId,
            }),
          });
          const data = await res.json();
          results.push({ lead: lead.nom, task_id: data.job_id, success: true });
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          results.push({ lead: lead.nom, success: false });
        }
      }

      return NextResponse.json({ success: true, results, total: results.length });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });

  } catch (error: any) {
    console.error('Prospection API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    if (action === 'calls') {
      const response = await fetch('https://api.vapi.ai/call?limit=50', {
        headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` },
      });
      const data = await response.json();
      return NextResponse.json({ success: true, calls: data });
    }

    if (action === 'assistants') {
      const response = await fetch('https://api.vapi.ai/assistant', {
        headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` },
      });
      const data = await response.json();
      return NextResponse.json({ success: true, assistants: data });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}