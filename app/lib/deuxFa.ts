// Jeton signe prouvant qu'UN utilisateur precis a passe la double authentification (2FA).
//
// Avant : le cookie `deux_fa_verified` valait toujours "1" -- n'importe qui possedant le mot de
// passe pouvait l'ecrire lui-meme et contourner la 2FA. Maintenant le cookie contient
// `expiration.signature` : la signature (HMAC-SHA256) porte sur `identifiant_utilisateur.expiration`
// et utilise un secret que seul le serveur connait. Le jeton ne peut donc ni etre fabrique, ni etre
// prete a un autre compte, ni etre prolonge.
//
// Le secret est derive de la cle serveur Supabase deja presente dans tous les environnements :
// aucune variable supplementaire a configurer. Si cette cle change, les jetons existants deviennent
// invalides (les utilisateurs repassent simplement la 2FA).

const DUREE_SECONDES = 24 * 60 * 60;

async function cleSignature(): Promise<CryptoKey> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('2FA : cle serveur absente');
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('xyra-2fa-v1:' + secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function signer(message: string): Promise<string> {
  const signature = await crypto.subtle.sign('HMAC', await cleSignature(), new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature)).map((o) => o.toString(16).padStart(2, '0')).join('');
}

// Comparaison en temps constant (evite de deviner la signature octet par octet).
function egaux(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let ecart = 0;
  for (let i = 0; i < a.length; i++) ecart |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return ecart === 0;
}

export async function signerJeton2FA(userId: string): Promise<string> {
  const expiration = Math.floor(Date.now() / 1000) + DUREE_SECONDES;
  return `${expiration}.${await signer(`${userId}.${expiration}`)}`;
}

export async function verifierJeton2FA(jeton: string | undefined | null, userId: string): Promise<boolean> {
  if (!jeton || !userId) return false;
  const [expiration, signature, reste] = jeton.split('.');
  if (reste !== undefined || !expiration || !signature) return false;
  if (!/^\d+$/.test(expiration) || Number(expiration) < Math.floor(Date.now() / 1000)) return false;
  try {
    return egaux(await signer(`${userId}.${expiration}`), signature);
  } catch {
    return false;
  }
}

export const DUREE_JETON_2FA_SECONDES = DUREE_SECONDES;
