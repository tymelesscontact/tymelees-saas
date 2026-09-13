import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sbAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function estAutoriseGererEquipe(req: NextRequest, tenantId: string): Promise<boolean> {
  const tokenVerif = req.cookies.get('sb-access-token')?.value;
  if (!tokenVerif) return false;
  const { data: authVerif } = await sbAdmin.auth.getUser(tokenVerif);
  if (!authVerif?.user) return false;
  const { data: membreVerif } = await sbAdmin.from('tenant_membres').select('role').eq('user_id', authVerif.user.id).eq('tenant_id', tenantId).maybeSingle();
  if (membreVerif?.role === 'owner') return true;
  const { data: monEquipe } = await sbAdmin.from('equipe').select('role').eq('user_id', authVerif.user.id).eq('tenant_id', tenantId).maybeSingle();
  return monEquipe?.role === 'Admin';
}

export async function estProprietaireDuTenant(req: NextRequest, tenantId: string): Promise<boolean> {
  const tokenVerif = req.cookies.get('sb-access-token')?.value;
  if (!tokenVerif) return false;
  const { data: authVerif } = await sbAdmin.auth.getUser(tokenVerif);
  if (!authVerif?.user) return false;
  const { data: membreVerif } = await sbAdmin.from('tenant_membres').select('role').eq('user_id', authVerif.user.id).eq('tenant_id', tenantId).maybeSingle();
  return membreVerif?.role === 'owner';
}

export async function estAutoriseSignerDevisManuel(req: NextRequest, tenantId: string): Promise<boolean> {
  if (await estProprietaireDuTenant(req, tenantId)) return true;
  const tokenVerif = req.cookies.get('sb-access-token')?.value;
  if (!tokenVerif) return false;
  const { data: authVerif } = await sbAdmin.auth.getUser(tokenVerif);
  if (!authVerif?.user) return false;
  const { data: monEquipe } = await sbAdmin.from('equipe').select('peut_signer_devis').eq('user_id', authVerif.user.id).eq('tenant_id', tenantId).maybeSingle();
  return monEquipe?.peut_signer_devis === true;
}
