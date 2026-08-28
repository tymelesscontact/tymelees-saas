import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value
  if (!token) {
    return NextResponse.json({ isOwner: false, email: null })
  }

  const sb = getAdminClient()
  const { data: userData, error } = await sb.auth.getUser(token)
  if (error || !userData?.user) {
    return NextResponse.json({ isOwner: false, email: null })
  }

  const ownerEmail = process.env.OWNER_EMAIL
  const isOwner = !!ownerEmail && userData.user.email?.toLowerCase() === ownerEmail.toLowerCase()

  let isCollaborateur = false
  let employeId: string | null = null
  if (!isOwner) {
    const { data: membre } = await sb.from("equipe").select("id").eq("user_id", userData.user.id).maybeSingle()
    isCollaborateur = !!membre
    employeId = membre?.id || null
  }

  let profilCollaborateur = null
  if (isCollaborateur && employeId) {
    const { data: monProfil } = await sb.from('equipe')
      .select('nom,prenom,role,tel,adresse,contrat,date_embauche')
      .eq('id', employeId).maybeSingle()
    profilCollaborateur = monProfil
  }

  let deuxFaActif = false
  if (!isCollaborateur) {
    const { data: membre } = await sb.from('tenant_membres').select('tenant_id').eq('user_id', userData.user.id).maybeSingle()
    if (membre?.tenant_id) {
      const { data: t } = await sb.from('tenants').select('deux_fa_actif').eq('id', membre.tenant_id).maybeSingle()
      deuxFaActif = !!t?.deux_fa_actif
    }
  }

  return NextResponse.json({ isOwner, isCollaborateur, employeId, email: userData.user.email, profil: profilCollaborateur, deuxFaActif })
}
