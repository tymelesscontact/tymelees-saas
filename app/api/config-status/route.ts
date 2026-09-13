import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  if (!token || !ownerEmail) {
    return NextResponse.json({ error: 'Interdit' }, { status: 403 });
  }
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await sb.auth.getUser(token);
  if (!data?.user?.email || data.user.email.toLowerCase() !== ownerEmail) {
    return NextResponse.json({ error: 'Interdit' }, { status: 403 });
  }

  const status = {
    stripe: !!process.env.STRIPE_SECRET_KEY,
    flutterwave: !!process.env.FLUTTERWAVE_SECRET_KEY,
    whatsapp: !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    ownerWhatsapp: !!process.env.OWNER_WHATSAPP,
    resend: !!process.env.RESEND_API_KEY,
    supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  };
  return NextResponse.json({ status });
}
