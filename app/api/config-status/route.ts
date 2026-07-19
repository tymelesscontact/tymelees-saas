import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
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
