import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
export const getTenant = async () => {
  const user = await getUser()
  if (!user) return null
  const { data } = await supabase.from('tenants').select('*').eq('user_id', user.id).single()
  return data
}
export const getTenantId = async () => {
  const tenant = await getTenant()
  return tenant?.id || null
}
export const getClients = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('clients').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false })
  return data || []
}
export const addClient = async (client: any) => {
  const tenantId = await getTenantId()
  const { data } = await supabase.from('clients').insert([{ ...client, tenant_id: tenantId }]).select()
  return data?.[0]
}
export const getDevis = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('devis').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false })
  return data || []
}
export const addDevis = async (devis: any) => {
  const tenantId = await getTenantId()
  const { data } = await supabase.from('devis').insert([{ ...devis, tenant_id: tenantId }]).select()
  return data?.[0]
}
export const getPaiements = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('paiements').select('*').eq('tenant_id', tenantId)
  return data || []
}
export const addPaiement = async (paiement: any) => {
  const tenantId = await getTenantId()
  const { data } = await supabase.from('paiements').insert([{ ...paiement, tenant_id: tenantId }]).select()
  return data?.[0]
}
export const getPartenaires = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('partenaires').select('*').eq('tenant_id', tenantId)
  return data || []
}
export const getEquipe = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('equipe').select('*').eq('tenant_id', tenantId)
  return data || []
}
export const getMissions = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('missions').select('*').eq('tenant_id', tenantId)
  return data || []
}
export const getStock = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('stock').select('*').eq('tenant_id', tenantId)
  return data || []
}
export const getDeals = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('deals').select('*').eq('tenant_id', tenantId)
  return data || []
}
export const getNotifications = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('notifications').select('*').eq('tenant_id', tenantId).limit(50)
  return data || []
}
export const getAllTenants = async () => {
  const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })
  return data || []
}
export const subscribeNotifications = (callback: (notif: any) => void) => {
  return supabase.channel('notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => callback(payload.new)).subscribe()
}
export const getContrats = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('contrats').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false })
  return data || []
}
export const getAvis = async () => {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const { data } = await supabase.from('avis').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false })
  return data || []
}
export const addNotification = async (notification: any) => {
  const tenantId = await getTenantId()
  const { data } = await supabase.from('notifications').insert([{ ...notification, tenant_id: tenantId }]).select()
  return data?.[0]
}
