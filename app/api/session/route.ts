import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Pose le jeton Supabase en cookie HttpOnly (illisible en JavaScript, donc
// pas volable par une faille XSS) au lieu du document.cookie/localStorage
// cote client utilise auparavant.
export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Jeton manquant' }, { status: 400 });

  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const reponse = NextResponse.json({ success: true });
  reponse.cookies.set('sb-access-token', token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    httpOnly: true,
    secure: true,
  });
  return reponse;
}

export async function DELETE() {
  const reponse = NextResponse.json({ success: true });
  reponse.cookies.set('sb-access-token', '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    httpOnly: true,
    secure: true,
  });
  return reponse;
}
