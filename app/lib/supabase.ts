import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getClients = async () => {
  const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
  return data || []
}

export const addClient = async (client: any) => {
  const user = await getUser()
  const { data } = await supabase.from('clients').insert([{ ...client, tenant_id: user?.id }]).select()
  return data?.[0]
}

export const getDevis = async () => {
  const { data } = await supabase.from('devis').select('*').order('created_at', { ascending: false })
  return data || []
}

export const addDevis = async (devis: any) => {
  const user = await getUser()
  const { data } = await supabase.from('devis').insert([{ ...devis, tenant_id: user?.id }]).select()
  return data?.[0]
}

export const getPaiements = async () => {
  const { data } = await supabase.from('paiements').select('*')
  return data || []
}

export const addPaiement = async (paiement: any) => {
  const user = await getUser()
  const { data } = await supabase.from('paiements').insert([{ ...paiement, tenant_id: user?.id }]).select()
  return data?.[0]
}

export const getPartenaires = async () => {
  const { data } = await supabase.from('partenaires').select('*')
  return data || []
}

export const getEquipe = async () => {
  const { data } = await supabase.from('equipe').select('*')
  return data || []
}

export const getMissions = async () => {
  const { data } = await supabase.from('missions').select('*')
  return data || []
}

export const getStock = async () => {
  const { data } = await supabase.from('stock').select('*')
  return data || []
}

export const getDeals = async () => {
  const { data } = await supabase.from('deals').select('*')
  return data || []
}

export const getNotifications = async () => {
  const { data } = await supabase.from('notifications').select('*').limit(50)
  return data || []
}

export const getTenant = async () => {
  const user = await getUser()
  if (!user) return null
  const { data } = await supabase.from('tenants').select('*').eq('user_id', user.id).single()
  return data
}

export const getAllTenants = async () => {
  const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })
  return data || []
}

export const subscribeNotifications = (callback: (notif: any) => void) => {
  return supabase.channel('notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => callback(payload.new)).subscribe()
}