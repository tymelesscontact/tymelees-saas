import { urlRetourInvitation } from './invitation';

// Active un membre du Club apres reglement de son adhesion -- extrait du bloc "club_adhesion" de
// app/api/stripe-webhook/route.ts pour etre reutilisable depuis un paiement Stripe (webhook) OU un
// virement IBAN constate manuellement (app/api/club-paiement/route.ts, action
// "confirmer_virement_iban"). Meme logique dans les deux cas, un seul endroit a maintenir.
export async function finaliserAdhesionClub(
  sb: any,
  membreId: string,
  etape: string,
  referencePaiement: string,
  montantCentimes?: number,
  requestOrigin?: string
): Promise<void> {
  const debut = new Date();
  const fin = new Date(debut);
  fin.setFullYear(fin.getFullYear() + 1);

  // Etape 1 : droit d'entree regle. Le membre reste sans acces au club.
  // Etape 2 : cotisation reglee. Le membre devient actif.
  const champs = etape === 'droit_entree'
    ? {
        droit_entree_paye: true,
        statut: 'attente_cotisation',
        reference_paiement: referencePaiement,
      }
    : {
        statut: 'actif',
        date_adhesion: debut.toISOString().slice(0, 10),
        date_fin_adhesion: fin.toISOString().slice(0, 10),
        cotisation_payee_le: debut.toISOString().slice(0, 10),
        montant_cotisation: 2000,
        reference_paiement: referencePaiement,
      };

  const { data: membre } = await sb.from('club_membres')
    .update(champs)
    .eq('id', membreId)
    .select()
    .single();

  // Cotisation reglee : creation du compte d'acces a l'espace membre.
  // Le membre choisit son mot de passe via le lien d'activation.
  let lienActivation: string | null = null;
  if (etape !== 'droit_entree' && membre?.email && !membre?.user_id) {
    try {
      const { data: invite } = await sb.auth.admin.generateLink({
        type: 'invite', email: membre.email,
        options: { redirectTo: urlRetourInvitation(requestOrigin) },
      });
      if (invite?.user) {
        lienActivation = (invite as any)?.properties?.action_link || null;
        await sb.from('club_membres').update({ user_id: invite.user.id }).eq('id', membreId);
      }
    } catch (e) { console.error('Compte club:', e); }
  }

  const montantAffiche = montantCentimes != null
    ? (montantCentimes / 100).toFixed(2)
    : (etape === 'droit_entree' ? '500.00' : '2000.00');

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Xyra Club <notifications@xyraio.fr>',
      to: 'xyra.solution@gmail.com',
      subject: `Nouveau membre du Club — ${membre?.nom || ''}`,
      html: `<div style="font-family:sans-serif;padding:24px;"><h2>Adhesion reglee</h2><p><strong>${membre?.nom || ''}</strong> — ${membre?.metier || ''}, ${membre?.zone || ''}</p><p>Montant : <strong>${montantAffiche}&euro;</strong></p><p>Adhesion valable jusqu'au ${fin.toISOString().slice(0, 10)}</p></div>`,
    });
  } catch (e) { console.error('Email club:', e); }

  if (membre?.email && etape !== 'droit_entree') {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Xyra Club <notifications@xyraio.fr>',
        to: membre.email,
        subject: 'Bienvenue au Xyra Club',
        html: `<div style="font-family:sans-serif;padding:24px;background:#0a0a0a;color:#f0ead6;"><h2 style="color:#c9a96e;font-family:Georgia,serif;font-style:italic;">Bienvenue au Club</h2><p>Votre adhesion est enregistree jusqu'au <strong>${fin.toISOString().slice(0, 10)}</strong>.</p><p>L'annuaire, les mises en relation et les evenements vous sont desormais ouverts.</p><p style="margin-top:24px;"><a href="${lienActivation || 'https://xyraio.fr/club'}" style="display:inline-block;background:#c9a96e;color:#0a0a0a;padding:14px 30px;text-decoration:none;font-family:sans-serif;font-size:13px;">${lienActivation ? 'Choisir mon mot de passe' : 'Acceder au club'}</a></p></div>`,
      });
    } catch (e) { console.error('Email membre:', e); }
  }
}
