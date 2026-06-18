import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client normal — vérifie la session et le mot de passe actuel
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Client admin — seul habilité à changer un mot de passe
const sbAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { token, currentPassword, newPassword } = await req.json();
  if (!token || !currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères' }, { status: 400 });
  }

  // 1. Identifier l'utilisateur à partir de sa session (le token ne peut pas être falsifié)
  const { data: userData, error: userError } = await sb.auth.getUser(token);
  if (userError || !userData?.user?.email) {
    return NextResponse.json({ error: 'Session expirée, reconnecte-toi' }, { status: 401 });
  }
  const email = userData.user.email;

  // 2. Vérifier que le mot de passe actuel est correct avant de changer quoi que ce soit
  const { error: signInError } = await sb.auth.signInWithPassword({ email, password: currentPassword });
  if (signInError) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 });
  }

  // 3. Changer le mot de passe
  const { error: updateError } = await sbAdmin.auth.admin.updateUserById(userData.user.id, { password: newPassword });
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}