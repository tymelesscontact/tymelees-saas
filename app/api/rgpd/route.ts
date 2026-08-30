import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLES_TENANT = [
  'absences','api_keys','api_logs','api_webhooks','avis','budgets_frais',
  'cartes_budgets_projet','cartes_transactions','cartes_virtuelles','charges',
  'clients','club_membres','club_observateurs','commandes','companies','conduit',
  'conges','contrats','contrats_modeles','conversations','crm_leads','csat_reponses',
  'deals','devis','emplacements','equipe','evenements','factures','fournisseurs',
  'invitations','liste_attente_planning','lots','missions','missions_planning',
  'modules_actifs','mouvements_stock','notes_frais','notif_preferences','notifications',
  'notifications_signalement','nps_reponses','paiements','partenaires','pointages',
  'positions_collaborateurs','produits_catalogue','relance_contacts','relance_sequences',
  'revendeurs','services_catalogue','services_packages','sessions_actives',
  'signalements_mission','stock','stock_niveaux','tenant_membres','tickets_support',
  'tresorerie_parametres','vapi_calls','vapi_relances','wallet_transactions',
];

export async function GET(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  if (searchParams.get('action') === 'historique') {
    const { data } = await sb.from('rgpd_demandes')
      .select('id, type, statut, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(20);
    return NextResponse.json({ historique: data || [] });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  if (action === 'exporter') {
    const { data: tenantInfo } = await sb.from('tenants').select('*').eq('id', tenantId).single();

    const resultat: Record<string, any> = {
      export_genere_le: new Date().toISOString(),
      societe: tenantInfo || null,
    };

    for (const table of TABLES_TENANT) {
      try {
        const { data, error } = await sb.from(table).select('*').eq('tenant_id', tenantId);
        if (error) {
          resultat[table] = { erreur: error.message };
        } else {
          resultat[table] = data || [];
        }
      } catch (e: any) {
        resultat[table] = { erreur: e.message };
      }
    }

    await sb.from('rgpd_demandes').insert({
      tenant_id: tenantId,
      type: 'export',
      statut: 'traitee',
      details: { nb_tables: TABLES_TENANT.length },
    });

    return NextResponse.json({ success: true, export: resultat });
  }

  if (action === 'supprimer_compte') {
    const { confirmation } = body;
    const { data: tenantInfo } = await sb.from('tenants').select('societe, email').eq('id', tenantId).single();
    if (!tenantInfo) return NextResponse.json({ success: false, error: 'Societe introuvable' }, { status: 404 });
    if (!confirmation || confirmation.trim() !== tenantInfo.societe) {
      return NextResponse.json({ success: false, error: 'Confirmation incorrecte -- tapez exactement le nom de votre societe' }, { status: 400 });
    }

    const emailConfirmation = tenantInfo.email;

    const { data: membres } = await sb.from('tenant_membres').select('user_id').eq('tenant_id', tenantId);
    const userIds = (membres || []).map((m: any) => m.user_id).filter(Boolean);

    if (emailConfirmation) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra <notifications@xyraio.fr>',
          to: emailConfirmation,
          subject: 'Confirmation de suppression de votre compte Xyra',
          html: `<div style="font-family:sans-serif;padding:24px;background:#06060E;color:#EAE6DE;"><h2 style="color:#C9A84C">Compte supprime</h2><p>Votre compte Xyra et toutes les donnees associees ont ete supprimes definitivement, a l'exception des documents comptables (factures, devis, paiements) conserves pour la duree legale obligatoire.</p></div>`,
        });
      } catch (e) { /* non bloquant */ }
    }

    const TABLES_A_CONSERVER = ['factures', 'devis', 'paiements'];
    const resultatSuppression: Record<string, string> = {};
    for (const table of TABLES_TENANT) {
      if (TABLES_A_CONSERVER.includes(table)) continue;
      try {
        const { error } = await sb.from(table).delete().eq('tenant_id', tenantId);
        resultatSuppression[table] = error ? 'erreur' : 'supprime';
      } catch (e) {
        resultatSuppression[table] = 'erreur';
      }
    }

    for (const uid of userIds) {
      try { await sb.auth.admin.deleteUser(uid); } catch (e) { /* non bloquant */ }
    }

    await sb.from('tenants').update({
      compte_supprime_le: new Date().toISOString(),
      civilite: null, prenom: null, nom: null, email: null,
      telephone_contact: null, telephone_entreprise: null,
      adresse: null, photo_url: null,
    }).eq('id', tenantId);

    await sb.from('rgpd_demandes').insert({
      tenant_id: tenantId,
      type: 'suppression_compte',
      statut: 'traitee',
      details: { tables_supprimees: Object.keys(resultatSuppression).length, tables_conservees: TABLES_A_CONSERVER },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
}
