import { createClient } from '@supabase/supabase-js';
import { normaliserPlan } from './plans';

// Lea (Vapi + Twilio) : tous les appels de tous les clients passent par les comptes Xyra.
// Ce fichier regroupe les regles qui protegent ce cout : quota de minutes par client,
// plafond global mensuel, duree maximale d'un appel.

// Minutes d'appel incluses par mois. Forfait "owner" (Xyra) : illimite.
export const QUOTA_MINUTES_ENTERPRISE = 750;
export const QUOTA_MINUTES_MODULE_PROSPECTION = 100;

// Un appel ne depasse jamais 15 min (coupe par Vapi lui-meme via maxDurationSeconds).
export const DUREE_MAX_APPEL_SECONDES = 15 * 60;

// Estimations de cout (a ajuster avec les factures reelles) :
// Twilio vers un mobile francais ~0,04 $/min ; appel sans cout Vapi connu ~0,16 $/min tout compris.
export const TWILIO_USD_PAR_MINUTE = 0.04;
export const COUT_ESTIME_USD_PAR_MINUTE = 0.16;
export const EUR_PAR_USD = 0.93;
export const BUDGET_MENSUEL_EUR_PAR_DEFAUT = 100;

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export function budgetMensuelEur(): number {
  const valeur = Number(process.env.LEA_BUDGET_MENSUEL_EUR);
  return Number.isFinite(valeur) && valeur > 0 ? valeur : BUDGET_MENSUEL_EUR_PAR_DEFAUT;
}

export function debutDuMoisIso(maintenant = new Date()): string {
  return new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), 1)).toISOString();
}

// null = illimite (forfait owner). 0 = pas d'acces a Lea.
export function quotaMinutes(plan: string, modulesActifs: string[]): number | null {
  if (plan === 'owner') return null;
  if (plan === 'enterprise') return QUOTA_MINUTES_ENTERPRISE;
  if (modulesActifs.includes('prospection')) return QUOTA_MINUTES_MODULE_PROSPECTION;
  return 0;
}

export async function modulesActifsDuTenant(tenantId: string): Promise<string[]> {
  const { data } = await sb().from('modules_actifs').select('type_module').eq('tenant_id', tenantId).eq('statut', 'actif');
  return (data || []).map((m: { type_module: string | null }) => m.type_module || '').filter(Boolean);
}

export async function minutesUtiliseesCeMois(tenantId: string): Promise<number> {
  const { data } = await sb().from('vapi_calls').select('duration').eq('tenant_id', tenantId).gte('started_at', debutDuMoisIso());
  const secondes = (data || []).reduce((total: number, a: { duration: number | null }) => total + (Number(a.duration) || 0), 0);
  return Math.round((secondes / 60) * 10) / 10;
}

// Cout d'un appel en euros : cout Vapi reel s'il est connu + Twilio estime ; sinon estimation globale.
export function coutAppelEur(dureeSecondes: number, coutVapiUsd: number | null): number {
  const minutes = (Number(dureeSecondes) || 0) / 60;
  const usd = coutVapiUsd != null && Number.isFinite(Number(coutVapiUsd))
    ? Number(coutVapiUsd) + minutes * TWILIO_USD_PAR_MINUTE
    : minutes * COUT_ESTIME_USD_PAR_MINUTE;
  return usd * EUR_PAR_USD;
}

export async function coutPlateformeCeMoisEur(): Promise<number> {
  const { data } = await sb().from('vapi_calls').select('duration,cout_usd').gte('started_at', debutDuMoisIso());
  const total = (data || []).reduce(
    (somme: number, a: { duration: number | null; cout_usd: number | null }) => somme + coutAppelEur(Number(a.duration) || 0, a.cout_usd),
    0,
  );
  return Math.round(total * 100) / 100;
}

// Duree maximale autorisee pour le prochain appel (secondes), ou un motif de refus.
export function dureeAutorisee(params: {
  quota: number | null; minutesUtilisees: number; coutPlateformeEur: number; budgetEur: number; estOwner: boolean;
}): { secondes: number } | { refus: 'quota' | 'budget' | 'sans_acces' } {
  const { quota, minutesUtilisees, coutPlateformeEur, budgetEur, estOwner } = params;
  let secondes = DUREE_MAX_APPEL_SECONDES;
  if (!estOwner) {
    if (quota === 0) return { refus: 'sans_acces' };
    if (quota !== null) {
      const restantesClient = (quota - minutesUtilisees) * 60;
      if (restantesClient < 60) return { refus: 'quota' };
      secondes = Math.min(secondes, restantesClient);
    }
    const eurParSeconde = (COUT_ESTIME_USD_PAR_MINUTE * EUR_PAR_USD) / 60;
    const restantesBudget = (budgetEur - coutPlateformeEur) / eurParSeconde;
    if (restantesBudget < 60) return { refus: 'budget' };
    secondes = Math.min(secondes, restantesBudget);
  }
  return { secondes: Math.floor(secondes) };
}

// Apres chaque appel termine : alerte le client a 80 % de ses minutes, et le proprietaire de
// Xyra (OWNER_EMAIL) a 80 % puis 100 % du budget global. Chaque alerte part une fois par mois.
export async function verifierSeuilsApresAppel(tenantId: string | null): Promise<void> {
  const client = sb();
  const mois = debutDuMoisIso().slice(0, 7);

  if (tenantId) {
    const { data: tenant } = await client.from('tenants').select('plan').eq('id', tenantId).maybeSingle();
    const quota = quotaMinutes(normaliserPlan(tenant?.plan), await modulesActifsDuTenant(tenantId));
    if (quota) {
      const utilisees = await minutesUtiliseesCeMois(tenantId);
      if (utilisees >= quota * 0.8) {
        const titre = `Lea : 80 % de vos minutes du mois utilisées (${mois})`;
        const { data: deja } = await client.from('notifications').select('id').eq('tenant_id', tenantId).eq('titre', titre).limit(1).maybeSingle();
        if (!deja) {
          await client.from('notifications').insert({
            type: 'warning', icon: '📞', titre, urgence: 'haute', lu: false, tenant_id: tenantId,
            message: `${Math.round(utilisees)} minutes utilisées sur ${quota} ce mois-ci. Au-delà, Lea ne pourra plus appeler jusqu'au mois prochain.`,
          });
        }
      }
    }
  }

  const budget = budgetMensuelEur();
  const cout = await coutPlateformeCeMoisEur();
  for (const seuil of [100, 80]) {
    if (cout < budget * seuil / 100) continue;
    const repere = `Budget Lea ${seuil} % atteint (${mois})`;
    const { data: deja } = await client.from('erreurs_systeme').select('id').eq('route', 'lea-budget').eq('message', repere).limit(1).maybeSingle();
    if (deja) break;
    await client.from('erreurs_systeme').insert({ route: 'lea-budget', message: repere, gravite: seuil === 100 ? 'critique' : 'moyenne', resolu: false });
    const ownerEmail = process.env.OWNER_EMAIL;
    if (ownerEmail) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra Alerts <notifications@xyraio.fr>',
          to: ownerEmail,
          subject: seuil === 100 ? 'Lea arrêtée : budget mensuel atteint' : 'Lea : 80 % du budget mensuel atteint',
          html: `<p>Coût estimé des appels de Lea ce mois-ci : <strong>${cout.toFixed(2)} €</strong> sur un budget de <strong>${budget} €</strong>.</p>`
            + (seuil === 100
              ? '<p>Les appels de Lea sont suspendus pour les clients jusqu\'au mois prochain. Pour les réactiver, augmentez la variable LEA_BUDGET_MENSUEL_EUR sur Vercel.</p>'
              : '<p>Au-delà du budget, Lea s\'arrêtera automatiquement pour les clients.</p>'),
        });
      } catch (e) {
        console.error('Alerte budget Lea non envoyee', e);
      }
    }
    break;
  }
}
