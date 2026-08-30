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
