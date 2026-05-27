import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── CLIENTS ──────────────────────────────────────────────────
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('Erreur clients:', error)
  return data || []
}

export const addClient = async (client: any) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
  if (error) console.error('Erreur ajout client:', error)
  return data?.[0]
}

export const updateClient = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) console.error('Erreur update client:', error)
  return data?.[0]
}

// ─── DEVIS ────────────────────────────────────────────────────
export const getDevis = async () => {
  const { data, error } = await supabase
    .from('devis')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('Erreur devis:', error)
  return data || []
}

export const addDevis = async (devis: any) => {
  const { data, error } = await supabase
    .from('devis')
    .insert([devis])
    .select()
  if (error) console.error('Erreur ajout devis:', error)
  return data?.[0]
}

export const updateDevis = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('devis')
    .update(updates)
    .eq('id', id)
  if (error) console.error('Erreur update devis:', error)
}

// ─── PAIEMENTS ────────────────────────────────────────────────
export const getPaiements = async () => {
  const { data, error } = await supabase
    .from('paiements')
    .select('*')
    .order('date_transaction', { ascending: false })
  if (error) console.error('Erreur paiements:', error)
  return data || []
}

export const addPaiement = async (paiement: any) => {
  const { data, error } = await supabase
    .from('paiements')
    .insert([paiement])
    .select()
  if (error) console.error('Erreur ajout paiement:', error)
  return data?.[0]
}

// ─── PARTENAIRES ──────────────────────────────────────────────
export const getPartenaires = async () => {
  const { data, error } = await supabase
    .from('partenaires')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('Erreur partenaires:', error)
  return data || []
}

export const addPartenaire = async (partenaire: any) => {
  const { data, error } = await supabase
    .from('partenaires')
    .insert([partenaire])
    .select()
  if (error) console.error('Erreur ajout partenaire:', error)
  return data?.[0]
}

// ─── ÉQUIPE ───────────────────────────────────────────────────
export const getEquipe = async () => {
  const { data, error } = await supabase
    .from('equipe')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('Erreur équipe:', error)
  return data || []
}

export const addCollaborateur = async (collab: any) => {
  const { data, error } = await supabase
    .from('equipe')
    .insert([collab])
    .select()
  if (error) console.error('Erreur ajout collaborateur:', error)
  return data?.[0]
}

// ─── MISSIONS / PLANNING ──────────────────────────────────────
export const getMissions = async () => {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('date_mission', { ascending: true })
  if (error) console.error('Erreur missions:', error)
  return data || []
}

export const addMission = async (mission: any) => {
  const { data, error } = await supabase
    .from('missions')
    .insert([mission])
    .select()
  if (error) console.error('Erreur ajout mission:', error)
  return data?.[0]
}

// ─── STOCK ────────────────────────────────────────────────────
export const getStock = async () => {
  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .order('article', { ascending: true })
  if (error) console.error('Erreur stock:', error)
  return data || []
}

export const updateStock = async (id: string, quantite: number) => {
  const { error } = await supabase
    .from('stock')
    .update({ quantite, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) console.error('Erreur update stock:', error)
}

// ─── CONTRATS ─────────────────────────────────────────────────
export const getContrats = async () => {
  const { data, error } = await supabase
    .from('contrats')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('Erreur contrats:', error)
  return data || []
}

export const addContrat = async (contrat: any) => {
  const { data, error } = await supabase
    .from('contrats')
    .insert([contrat])
    .select()
  if (error) console.error('Erreur ajout contrat:', error)
  return data?.[0]
}

// ─── DEALS ────────────────────────────────────────────────────
export const getDeals = async () => {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('Erreur deals:', error)
  return data || []
}

export const addDeal = async (deal: any) => {
  const { data, error } = await supabase
    .from('deals')
    .insert([deal])
    .select()
  if (error) console.error('Erreur ajout deal:', error)
  return data?.[0]
}

export const updateDeal = async (id: string, updates: any) => {
  const { error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', id)
  if (error) console.error('Erreur update deal:', error)
}

// ─── NOTIFICATIONS ────────────────────────────────────────────
export const getNotifications = async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) console.error('Erreur notifications:', error)
  return data || []
}

export const marquerNotifLue = async (id: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ lu: true })
    .eq('id', id)
  if (error) console.error('Erreur notif:', error)
}

export const addNotification = async (notif: any) => {
  const { error } = await supabase
    .from('notifications')
    .insert([notif])
  if (error) console.error('Erreur ajout notif:', error)
}

// ─── AVIS ─────────────────────────────────────────────────────
export const getAvis = async () => {
  const { data, error } = await supabase
    .from('avis')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('Erreur avis:', error)
  return data || []
}

// ─── TEMPS RÉEL (Realtime) ────────────────────────────────────
export const subscribeNotifications = (callback: (notif: any) => void) => {
  return supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications'
    }, (payload) => callback(payload.new))
    .subscribe()
}

export const subscribeDevis = (callback: (devis: any) => void) => {
  return supabase
    .channel('devis')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'devis'
    }, (payload) => callback(payload.new))
    .subscribe()
}