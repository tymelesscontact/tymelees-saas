import { createClient } from '@supabase/supabase-js';

// Le serveur (Vercel) tourne en heure universelle (UTC) : toute heure ecrite cote serveur
// doit etre calculee dans le fuseau du pays de l'entreprise, sinon elle est decalee.
// Pays = ceux proposes a l'inscription (app/inscription/page.tsx, PAYS_REGIONS).
// Pays a plusieurs fuseaux (Etats-Unis, Canada, Bresil, Mexique, RD Congo) : fuseau de la
// capitale economique -- a affiner plus tard par un reglage de fuseau par entreprise.
export const FUSEAU_PAR_PAYS: Record<string, string> = {
  // Afrique
  'Algérie': 'Africa/Algiers',
  'Angola': 'Africa/Luanda',
  'Bénin': 'Africa/Porto-Novo',
  'Burkina Faso': 'Africa/Ouagadougou',
  'Cameroun': 'Africa/Douala',
  "Côte d'Ivoire": 'Africa/Abidjan',
  'Gabon': 'Africa/Libreville',
  'Ghana': 'Africa/Accra',
  'Guinée': 'Africa/Conakry',
  'Kenya': 'Africa/Nairobi',
  'Madagascar': 'Indian/Antananarivo',
  'Mali': 'Africa/Bamako',
  'Maroc': 'Africa/Casablanca',
  'Maurice': 'Indian/Mauritius',
  'Mozambique': 'Africa/Maputo',
  'Niger': 'Africa/Niamey',
  'Nigeria': 'Africa/Lagos',
  'Ouganda': 'Africa/Kampala',
  'RD Congo': 'Africa/Kinshasa',
  'Rwanda': 'Africa/Kigali',
  'Sénégal': 'Africa/Dakar',
  'Tanzanie': 'Africa/Dar_es_Salaam',
  'Tchad': 'Africa/Ndjamena',
  'Togo': 'Africa/Lome',
  'Tunisie': 'Africa/Tunis',
  'Zambie': 'Africa/Lusaka',
  'Zimbabwe': 'Africa/Harare',
  // Europe
  'Allemagne': 'Europe/Berlin',
  'Belgique': 'Europe/Brussels',
  'Espagne': 'Europe/Madrid',
  'France': 'Europe/Paris',
  'Italie': 'Europe/Rome',
  'Luxembourg': 'Europe/Luxembourg',
  'Pays-Bas': 'Europe/Amsterdam',
  'Portugal': 'Europe/Lisbon',
  'Royaume-Uni': 'Europe/London',
  'Suisse': 'Europe/Zurich',
  // Ameriques
  'Brésil': 'America/Sao_Paulo',
  'Canada': 'America/Toronto',
  'États-Unis': 'America/New_York',
  'Mexique': 'America/Mexico_City',
  // Moyen-Orient
  'Arabie saoudite': 'Asia/Riyadh',
  'Émirats arabes unis (Dubaï)': 'Asia/Dubai',
  'Qatar': 'Asia/Qatar',
};

export const FUSEAU_PAR_DEFAUT = 'Europe/Paris';

// Comparaison sans accents / majuscules / ponctuation, pour tolerer "Senegal", "cote d ivoire"...
function cle(valeur: string): string {
  return valeur.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
}
const FUSEAU_PAR_CLE: Record<string, string> = Object.fromEntries(
  Object.entries(FUSEAU_PAR_PAYS).map(([pays, fuseau]) => [cle(pays), fuseau])
);
FUSEAU_PAR_CLE[cle('Dubaï')] = 'Asia/Dubai';
FUSEAU_PAR_CLE[cle('Émirats arabes unis')] = 'Asia/Dubai';

export function fuseauDuPays(pays: string | null | undefined): string {
  if (!pays) return FUSEAU_PAR_DEFAUT;
  return FUSEAU_PAR_CLE[cle(pays)] || FUSEAU_PAR_DEFAUT;
}

export async function fuseauDuTenant(tenantId: string | null | undefined): Promise<string> {
  if (!tenantId) return FUSEAU_PAR_DEFAUT;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await sb.from('tenants').select('pays').eq('id', tenantId).maybeSingle();
  return fuseauDuPays(data?.pays);
}

// "09:05"
export function heureLocale(date: Date, fuseau: string): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: fuseau }).format(date);
}

// "2026-09-30" (jour calendaire dans le pays, pas en UTC)
export function jourLocal(date: Date, fuseau: string): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: fuseau }).format(date);
}

// "30/09/2026 20:25:54 UTC+2" -- pour les preuves (certificat de signature) : fuseau affiche.
export function dateHeureAvecFuseau(date: Date, fuseau: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    timeZone: fuseau, timeZoneName: 'shortOffset',
  }).format(date).replace(' GMT', ' UTC');
}
