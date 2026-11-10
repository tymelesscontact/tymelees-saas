import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { estAutoriseGererEquipe } from '../../lib/permissions';
import { calculerFeuilleHeures, hhmm, type FeuilleHeures } from '../../lib/feuilleHeures';

export const dynamic = 'force-dynamic';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MOIS_RE = /^\d{4}-\d{2}$/;
const moisCourant = () => new Date().toISOString().slice(0, 7);

const LIBELLES_ABSENCE: Record<string, string> = {
  conge_paye: 'Congé payé', conge_sans_solde: 'Congé sans solde', arret_maladie: 'Arrêt maladie',
  accident_travail: 'Accident du travail', evenement_familial: 'Événement familial', enfant_malade: 'Enfant malade',
  absence_injustifiee: 'Absence injustifiée', maternite_paternite: 'Maternité / paternité',
};

// Fiche "equipe" de la personne connectee (salarie)
async function moi(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return null;
  const { data } = await sb.from('equipe').select('id,tenant_id').eq('user_id', auth.user.id).maybeSingle();
  return data ? { ...data, user_id: auth.user.id } : null;
}

const csvCellule = (v: any) => { const t = String(v ?? ''); return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };

// Export "variables de paie" pour le cabinet : une ligne par salarie (format CSV ; separateur ;)
function csvVariables(feuilles: { f: FeuilleHeures; statut: any }[], mois: string) {
  const entete = ['Mois', 'Salarié', 'Contrat', 'Heures/semaine contrat', 'Heures contrat du mois', 'Heures réalisées', 'Heures au-delà du contrat', 'Type heures au-delà', 'Jours congés payés', 'Jours arrêt maladie', 'Jours autres absences', 'Détail absences', 'Acomptes versés (€)', 'Frais remboursés (€)', 'Signée par le salarié le', 'Validée le'];
  const lignes = feuilles.map(({ f, statut }) => {
    const jours = (t: (x: string) => boolean) => f.absences.filter((a) => t(a.type)).reduce((s, a) => s + a.jours, 0);
    return [
      mois, f.employe.nom, f.employe.contrat || '', f.employe.heures_semaine, f.heures_contrat_mois,
      (f.total_minutes / 60).toFixed(2).replace('.', ','), (f.minutes_au_dela / 60).toFixed(2).replace('.', ','), f.libelle_au_dela,
      jours((t) => t === 'conge_paye'), jours((t) => t === 'arret_maladie'), jours((t) => t !== 'conge_paye' && t !== 'arret_maladie'),
      f.absences.map((a) => `${LIBELLES_ABSENCE[a.type] || a.type} ${a.debut}→${a.fin}`).join(' | '),
      String(f.acomptes_total).replace('.', ','), String(f.frais_total).replace('.', ','),
      statut?.signee_le ? new Date(statut.signee_le).toLocaleDateString('fr-FR') : 'non signée',
      statut?.validee_le ? new Date(statut.validee_le).toLocaleDateString('fr-FR') : '',
    ].map(csvCellule).join(';');
  });
  return '﻿' + [entete.join(';'), ...lignes].join('\r\n');
}

async function feuillesDuTenant(tenantId: string, mois: string) {
  const { data: membres } = await sb.from('equipe').select('id').eq('tenant_id', tenantId).order('nom');
  const { data: statuts } = await sb.from('feuilles_heures').select('employe_id,signee_le,validee_le,envoyee_cabinet_le,detail').eq('tenant_id', tenantId).eq('mois', mois);
  const res: { f: FeuilleHeures; statut: any }[] = [];
  for (const m of (membres || [])) {
    const statut = (statuts || []).find((s: any) => s.employe_id === m.id) || null;
    // Feuille signee : on utilise la version figee au moment de la signature
    const f = statut?.signee_le && statut.detail?.employe ? statut.detail as FeuilleHeures : await calculerFeuilleHeures(sb, tenantId, m.id, mois);
    if (f) res.push({ f, statut });
  }
  return res;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mois = searchParams.get('mois') || moisCourant();
  if (!MOIS_RE.test(mois)) return NextResponse.json({ error: 'Mois invalide' }, { status: 400 });

  // Le salarie : sa propre feuille
  if (searchParams.get('vue') === 'moi') {
    const m = await moi(req);
    if (!m) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const feuille = await calculerFeuilleHeures(sb, m.tenant_id, m.id, mois);
    const { data: statut } = await sb.from('feuilles_heures').select('signee_le,validee_le,detail,total_minutes').eq('tenant_id', m.tenant_id).eq('employe_id', m.id).eq('mois', mois).maybeSingle();
    // Une fois signee, on montre la version signee (figee)
    return NextResponse.json({ feuille: statut?.signee_le ? statut.detail : feuille, statut: statut ? { signee_le: statut.signee_le, validee_le: statut.validee_le } : null });
  }

  // Le RH / proprietaire : toute l'equipe
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });
  if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
  const feuilles = await feuillesDuTenant(tenantId, mois);

  if (searchParams.get('format') === 'csv') {
    return new NextResponse(csvVariables(feuilles, mois), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="variables-paie-${mois}.csv"` },
    });
  }
  const { data: t } = await sb.from('tenants').select('email_comptable').eq('id', tenantId).maybeSingle();
  return NextResponse.json({
    mois, email_comptable: t?.email_comptable || '',
    feuilles: feuilles.map(({ f, statut }) => ({
      employe: f.employe, total_minutes: f.total_minutes, minutes_au_dela: f.minutes_au_dela, libelle_au_dela: f.libelle_au_dela,
      heures_contrat_mois: f.heures_contrat_mois, absences: f.absences, acomptes_total: f.acomptes_total, frais_total: f.frais_total,
      jours: f.jours, signee_le: statut?.signee_le || null, validee_le: statut?.validee_le || null, envoyee_cabinet_le: statut?.envoyee_cabinet_le || null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action } = body;
  const mois = String(body.mois || '');

  // Le salarie certifie et signe sa feuille du mois (version figee + empreinte)
  if (action === 'signer') {
    const m = await moi(req);
    if (!m) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    if (!MOIS_RE.test(mois) || mois > moisCourant()) return NextResponse.json({ error: 'Mois invalide' }, { status: 400 });
    const { data: existante } = await sb.from('feuilles_heures').select('signee_le').eq('tenant_id', m.tenant_id).eq('employe_id', m.id).eq('mois', mois).maybeSingle();
    if (existante?.signee_le) return NextResponse.json({ error: 'Feuille déjà signée' }, { status: 409 });
    const feuille = await calculerFeuilleHeures(sb, m.tenant_id, m.id, mois);
    if (!feuille) return NextResponse.json({ error: 'Feuille introuvable' }, { status: 404 });
    const signeeLe = new Date().toISOString();
    const empreinte = createHash('sha256').update(JSON.stringify(feuille) + '|' + m.user_id + '|' + signeeLe).digest('hex');
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null;
    const { error } = await sb.from('feuilles_heures').upsert({
      tenant_id: m.tenant_id, employe_id: m.id, mois, total_minutes: feuille.total_minutes, minutes_au_dela: feuille.minutes_au_dela,
      detail: feuille, empreinte, signee_le: signeeLe, signee_ip: ip,
    }, { onConflict: 'tenant_id,employe_id,mois' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, signee_le: signeeLe, empreinte });
  }

  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'non_connecte' }, { status: 401 });
  if (!(await estAutoriseGererEquipe(req, tenantId))) return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });

  if (action === 'email_comptable') {
    const email = String(body.email || '').trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    const { error } = await sb.from('tenants').update({ email_comptable: email || null }).eq('id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'valider') {
    if (!MOIS_RE.test(mois) || !body.employe_id) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    const { data: f } = await sb.from('feuilles_heures').select('id,signee_le').eq('tenant_id', tenantId).eq('employe_id', body.employe_id).eq('mois', mois).maybeSingle();
    if (!f?.signee_le) return NextResponse.json({ error: "Le salarié n'a pas encore signé sa feuille" }, { status: 409 });
    const token = req.cookies.get('sb-access-token')?.value;
    const { data: auth } = token ? await sb.auth.getUser(token) : { data: null as any };
    const { error } = await sb.from('feuilles_heures').update({ validee_le: new Date().toISOString(), validee_par: auth?.user?.id || null }).eq('id', f.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Envoi des variables de paie du mois a l'expert-comptable (email + CSV joint)
  if (action === 'envoyer_cabinet') {
    if (!MOIS_RE.test(mois)) return NextResponse.json({ error: 'Mois invalide' }, { status: 400 });
    const { data: t } = await sb.from('tenants').select('email_comptable,societe').eq('id', tenantId).maybeSingle();
    if (!t?.email_comptable) return NextResponse.json({ error: "Renseignez d'abord l'email de votre expert-comptable" }, { status: 400 });
    const feuilles = await feuillesDuTenant(tenantId, mois);
    if (feuilles.length === 0) return NextResponse.json({ error: 'Aucun salarié' }, { status: 400 });
    const nonSignees = feuilles.filter((x) => !x.statut?.signee_le).map((x) => x.f.employe.nom);
    const csv = csvVariables(feuilles, mois);
    const libelleMois = new Date(mois + '-15').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const echap = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]);
    const lignesHtml = feuilles.map(({ f, statut }) => `<tr><td style="padding:6px;border-bottom:1px solid #eee">${echap(f.employe.nom)}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right">${hhmm(f.total_minutes)}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right">${hhmm(f.minutes_au_dela)}</td><td style="padding:6px;border-bottom:1px solid #eee">${statut?.signee_le ? '✔ signée' : '⚠ non signée'}</td></tr>`).join('');
    const html = `<div style="font-family:sans-serif;max-width:640px"><p>Bonjour,</p><p>Veuillez trouver ci-joint les variables de paie de <strong>${echap(t.societe || 'notre entreprise')}</strong> pour <strong>${libelleMois}</strong> (heures réalisées, heures au-delà du contrat, absences, acomptes, frais).</p><table style="border-collapse:collapse;width:100%;font-size:13px"><tr style="background:#f5f5f5"><th style="padding:6px;text-align:left">Salarié</th><th style="padding:6px;text-align:right">Heures</th><th style="padding:6px;text-align:right">Au-delà du contrat</th><th style="padding:6px;text-align:left">Feuille</th></tr>${lignesHtml}</table>${nonSignees.length ? `<p style="color:#b45309">Feuilles non encore signées : ${echap(nonSignees.join(', '))}.</p>` : ''}<p style="color:#888;font-size:12px">Envoyé depuis Xyra — les heures proviennent des pointages réels des salariés.</p></div>`;
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: errEnvoi } = await resend.emails.send({
        from: 'Xyra <notifications@xyraio.fr>', to: t.email_comptable,
        subject: `Variables de paie — ${t.societe || 'Xyra'} — ${libelleMois}`, html,
        attachments: [{ filename: `variables-paie-${mois}.csv`, content: Buffer.from(csv, 'utf-8').toString('base64') }],
      });
      if (errEnvoi) return NextResponse.json({ error: 'Envoi refusé : ' + errEnvoi.message }, { status: 502 });
    } catch (e: any) {
      return NextResponse.json({ error: 'Envoi impossible : ' + e.message }, { status: 502 });
    }
    const maintenant = new Date().toISOString();
    // Date d'envoi notee ; une feuille deja signee garde sa version figee (on ne touche qu'a envoyee_cabinet_le)
    for (const { f, statut } of feuilles) {
      if (statut) await sb.from('feuilles_heures').update({ envoyee_cabinet_le: maintenant }).eq('tenant_id', tenantId).eq('employe_id', f.employe.id).eq('mois', mois);
      else await sb.from('feuilles_heures').insert({ tenant_id: tenantId, employe_id: f.employe.id, mois, envoyee_cabinet_le: maintenant, total_minutes: f.total_minutes, minutes_au_dela: f.minutes_au_dela });
    }
    return NextResponse.json({ success: true, envoye_a: t.email_comptable, non_signees: nonSignees });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
