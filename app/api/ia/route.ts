import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, max_tokens } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'prompt manquant' }, { status: 400 });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: max_tokens || 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || '';

    return NextResponse.json({ text, raw: data });
  } catch (e: any) {
    console.error('IA route error:', e);
    return NextResponse.json({ error: 'Erreur serveur IA' }, { status: 500 });
  }
}
