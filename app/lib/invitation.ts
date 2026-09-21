// Adresse ou renvoyer une personne invitee (equipe, partenaire, client revendeur, abonne, membre du club)
// une fois qu'elle a clique sur le lien recu par email : la page /reset-password, qui ouvre la session
// et lui fait choisir son mot de passe.
//
// Sans `redirectTo`, Supabase renvoie vers l'adresse par defaut du projet (la page d'accueil publique),
// qui ne sait pas traiter une invitation : la personne n'avait aucun moyen de choisir son mot de passe.
//
// On prend d'abord le site de la requete en cours (xyratest1 renvoie vers xyratest1, la production vers
// xyraio.fr : un lien de test ne tombe jamais sur la production), puis NEXT_PUBLIC_SITE_URL, puis la
// production par defaut. Cette adresse doit figurer dans la liste des URL de redirection autorisees
// du projet Supabase (Authentication > URL Configuration) -- comme pour le "mot de passe oublie".
export function urlRetourInvitation(origine?: string | null): string {
  const base = (origine || process.env.NEXT_PUBLIC_SITE_URL || 'https://xyraio.fr').replace(/\/+$/, '');
  return `${base}/reset-password`;
}
