import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

// Adresses que le serveur Xyra ne doit jamais appeler pour le compte d'un
// utilisateur (test de webhook, etc.) : reseau interne, bouclage, metadonnees
// cloud (169.254.169.254), plages reservees.
const interdites = new BlockList();
for (const [reseau, prefixe] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
  ['224.0.0.0', 4], ['240.0.0.0', 4],
] as const) interdites.addSubnet(reseau, prefixe, 'ipv4');
for (const [reseau, prefixe] of [
  ['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8], ['2001:db8::', 32],
] as const) interdites.addSubnet(reseau, prefixe, 'ipv6');

function adresseInterdite(adresse: string): boolean {
  const mappee = adresse.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappee) return interdites.check(mappee[1], 'ipv4');
  const famille = isIP(adresse);
  if (famille === 4) return interdites.check(adresse, 'ipv4');
  if (famille === 6) return interdites.check(adresse, 'ipv6');
  return true;
}

export async function verifierUrlExterne(url: unknown): Promise<{ ok: true } | { ok: false; raison: string }> {
  if (typeof url !== 'string' || !url) return { ok: false, raison: 'Adresse manquante' };
  let cible: URL;
  try { cible = new URL(url); } catch { return { ok: false, raison: 'Adresse invalide' }; }
  if (cible.protocol !== 'https:' && cible.protocol !== 'http:') return { ok: false, raison: 'Seules les adresses http(s) sont acceptées' };
  const hote = cible.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!hote || hote === 'localhost' || hote.endsWith('.localhost') || hote.endsWith('.internal')) {
    return { ok: false, raison: 'Adresse interne refusée' };
  }
  let adresses: string[];
  try {
    adresses = isIP(hote) ? [hote] : (await lookup(hote, { all: true })).map(a => a.address);
  } catch {
    return { ok: false, raison: 'Adresse introuvable' };
  }
  if (adresses.length === 0 || adresses.some(adresseInterdite)) return { ok: false, raison: 'Adresse interne refusée' };
  return { ok: true };
}
