import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const token = req.cookies.get('sb-access-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }
    const { data: auth, error: authError } = await sb.auth.getUser(token);
    const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
    if (authError || !auth?.user?.email || !ownerEmail || auth.user.email.toLowerCase() !== ownerEmail) {
      return NextResponse.json({ error: 'Interdit' }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const { data, error } = await sb.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: 'https://xyraio.fr/mon-espace' },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ url: data.properties.action_link });
  } catch (error: any) {
    console.error('Impersonate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
