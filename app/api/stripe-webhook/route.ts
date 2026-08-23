import { NextRequest, NextResponse } from 'next/server';
import { PLAN_PRIX, PLAN_LABELS } from '../../lib/plans';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      if (session.metadata?.type === 'wallet_payment') {
        await sb.from('wallet_transactions')
          .update({ statut: 'confirmé' })
          .eq('id', session.metadata.transaction_id);
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Xyra Alerts <notifications@xyraio.fr>',
            to: 'xyra.solution@gmail.com',
            subject: `💰 Paiement Wallet reçu — ${(session.amount_total / 100).toFixed(2)}€`,
            html: `<div style="font-family:sans-serif;padding:24px;"><h2>Paiement confirmé !</h2><p>Montant : <strong>${(session.amount_total / 100).toFixed(2)}€</strong></p></div>`,
          });
        } catch (e) { console.error('Email error:', e); }
        return NextResponse.json({ received: true });
      }

      if (session.metadata?.type === 'facture_payment') {
        const { data: facture } = await sb.from('factures')
          .update({ statut: 'payée' })
          .eq('id', session.metadata.facture_id)
          .select()
          .single();
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Xyra Alerts <notifications@xyraio.fr>',
            to: 'xyra.solution@gmail.com',
            subject: `💰 Facture ${facture?.numero || ''} payée — ${(session.amount_total / 100).toFixed(2)}€`,
            html: `<div style="font-family:sans-serif;padding:24px;"><h2>Facture payée !</h2><p>Numéro : <strong>${facture?.numero || ''}</strong></p><p>Montant : <strong>${(session.amount_total / 100).toFixed(2)}€</strong></p></div>`,
          });
        } catch (e) { console.error('Email error:', e); }
        if (facture?.client_email) {
          try {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'Xyra <notifications@xyraio.fr>',
              to: facture.client_email,
              subject: `✅ Paiement confirmé — Facture ${facture.numero}`,
              html: `<div style="font-family:sans-serif;padding:24px;"><h2>Merci ! Paiement reçu ✅</h2><p>Bonjour ${facture.client_nom},</p><p>Nous confirmons la réception de votre paiement de <strong>${(session.amount_total / 100).toFixed(2)}€</strong> pour la facture <strong>${facture.numero}</strong>.</p><p>Cette facture est maintenant soldée. Merci pour votre confiance.</p></div>`,
            });
          } catch (e) { console.error('Email client error:', e); }
        }
        return NextResponse.json({ received: true });
      }

      if (session.metadata?.type === 'club_deal') {
        await sb.from('club_deals')
          .update({ statut: 'paye', paye_le: new Date().toISOString(), reference_paiement: session.id })
          .eq('id', session.metadata.deal_id);
        return NextResponse.json({ received: true });
      }
      if (session.metadata?.type === 'club_adhesion') {
        const membreId = session.metadata.membre_id;
        const etape = session.metadata.etape || 'cotisation';
        const debut = new Date();
        const fin = new Date(debut);
        fin.setFullYear(fin.getFullYear() + 1);

        // Etape 1 : droit d'entree regle. Le membre reste sans acces au club.
        // Etape 2 : cotisation reglee. Le membre devient actif.
        const champs = etape === 'droit_entree'
          ? {
              droit_entree_paye: true,
              statut: 'attente_cotisation',
              reference_paiement: session.id,
            }
          : {
              statut: 'actif',
              date_adhesion: debut.toISOString().slice(0, 10),
              date_fin_adhesion: fin.toISOString().slice(0, 10),
              cotisation_payee_le: debut.toISOString().slice(0, 10),
              montant_cotisation: 2000,
              reference_paiement: session.id,
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
            });
            if (invite?.user) {
              lienActivation = (invite as any)?.properties?.action_link || null;
              await sb.from('club_membres').update({ user_id: invite.user.id }).eq('id', membreId);
            }
          } catch (e) { console.error('Compte club:', e); }
        }

        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Xyra Club <notifications@xyraio.fr>',
            to: 'xyra.solution@gmail.com',
            subject: `Nouveau membre du Club — ${membre?.nom || ''}`,
            html: `<div style="font-family:sans-serif;padding:24px;"><h2>Adhesion reglee</h2><p><strong>${membre?.nom || ''}</strong> — ${membre?.metier || ''}, ${membre?.zone || ''}</p><p>Montant : <strong>${(session.amount_total / 100).toFixed(2)}&euro;</strong></p><p>Adhesion valable jusqu'au ${fin.toISOString().slice(0, 10)}</p></div>`,
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
        return NextResponse.json({ received: true });
      }
      if (session.metadata?.type === 'commande_payment') {
        const { data: commande } = await sb.from('commandes')
          .update({ statut: 'payée', stripe_session_id: session.id })
          .eq('id', session.metadata.commande_id)
          .select()
          .single();

        // ── Sortie de stock : la commande est payee, la marchandise part ──
        for (const it of (commande?.items || [])) {
          try {
            if (it.suivi_stock === 'stock' && it.article_stock_id) {
              // Le produit est relie a un article : vrai mouvement de sortie
              const { data: art } = await sb.from('stock')
                .select('qte,quantite,tenant_id,company_id').eq('id', it.article_stock_id).maybeSingle();
              if (art) {
                const avant = Number(art.qte ?? art.quantite ?? 0);
                const apres = Math.max(0, avant - Number(it.quantite || 0));
                await sb.from('stock').update({ qte: apres, quantite: apres }).eq('id', it.article_stock_id);
                await sb.from('mouvements_stock').insert({
                  article_id: it.article_stock_id,
                  type: 'sortie',
                  quantite: Number(it.quantite || 0),
                  quantite_avant: avant,
                  quantite_apres: apres,
                  note: `Vente en ligne — ${commande.reference}`,
                  tenant_id: art.tenant_id || commande.tenant_id,
                  date_mouvement: new Date().toISOString(),
                });
              }
            } else if (it.suivi_stock !== 'aucun' && it.produit_id) {
              // Produit suivi dans le catalogue seulement
              const { data: pr } = await sb.from('produits_catalogue')
                .select('quantite_stock').eq('id', it.produit_id).maybeSingle();
              if (pr) {
                const reste = Math.max(0, Number(pr.quantite_stock || 0) - Number(it.quantite || 0));
                await sb.from('produits_catalogue')
                  .update({ quantite_stock: reste, vente_active: reste > 0 })
                  .eq('id', it.produit_id);
              }
            }
          } catch (e: any) {
            console.error('Sortie stock commande:', e.message);
          }
        }
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Xyra Alerts <notifications@xyraio.fr>',
            to: 'xyra.solution@gmail.com',
            subject: `🛍️ Commande boutique payée — ${(session.amount_total / 100).toFixed(2)}€`,
            html: `<div style="font-family:sans-serif;padding:24px;"><h2>Nouvelle commande payée !</h2><p>Référence : <strong>${commande?.reference || ''}</strong></p><p>Montant : <strong>${(session.amount_total / 100).toFixed(2)}€</strong></p></div>`,
          });
        } catch (e) { console.error('Email error:', e); }
        if (commande?.client_email) {
          try {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'Xyra <notifications@xyraio.fr>',
              to: commande.client_email,
              subject: `✅ Commande confirmée — ${commande.reference}`,
              html: `<div style="font-family:sans-serif;padding:24px;"><h2>Merci pour votre commande !</h2><p>Référence : <strong>${commande.reference}</strong></p><p>Montant : <strong>${Number(commande.montant_total).toFixed(2)}€</strong></p><p>Elle est en cours de préparation.</p></div>`,
            });
          } catch (e) { console.error('Email commande error:', e); }
        }
        return NextResponse.json({ received: true });
      }

      const { email, societe, plan } = session.metadata || {};

      const planNorm = plan === 'multi_pro' ? 'multi_societes_pro' : (plan || 'starter');
      await sb.from('tenants').update({
        statut: 'actif',
        plan: planNorm,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
      }).eq('email', email);

      // Notifier Bene si un client devient revendeur white-label
      if (planNorm.startsWith('white_label_')) {
        try {
          await sb.from('notifications').insert({
            type: 'info', icon: '◈', urgence: 'haute',
            titre: `Nouveau revendeur : ${societe}`,
            message: `${societe} (${email}) vient de souscrire au plan ${planNorm}`,
            action_type: 'revendeur', lu: false,
            tenant_id: '264153ba-2e0f-404a-9bf9-f3d129a0d56e',
          });
        } catch (e) { console.error('Notification revendeur:', e); }
      }
      const montantNum = PLAN_PRIX[planNorm] ?? 0;
      await sb.from('abonnements_paiements').insert({
        tenant_email: email, societe, plan, montant: montantNum, devise: 'EUR',
        provider: 'stripe', reference: session.id,
      });

      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const planPrix = `${PLAN_PRIX[planNorm] ?? 0}€`;
      const planNom = PLAN_LABELS[planNorm] || planNorm;

      await resend.emails.send({
        from: 'Xyra <notifications@xyraio.fr>',
        to: email,
        subject: `✅ Paiement confirmé — Bienvenue sur Xyra ${planNom} !`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:40px;max-width:600px;margin:0 auto;">
            <h1 style="color:#C9A84C;font-family:Georgia,serif;text-align:center;">XYRA</h1>
            <div style="background:#0C0C1A;border:1px solid #2EC9B033;padding:28px;border-radius:12px;margin:20px 0;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">✅</div>
              <h2 style="font-size:22px;font-weight:300;color:#2EC9B0;">Paiement confirmé !</h2>
              <p style="color:#A0A0C0;font-size:14px;">Votre abonnement <strong style="color:#C9A84C;">${planNom} — ${planPrix}/mois</strong> est actif.</p>
            </div>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://xyraio.fr/mon-espace" style="background:linear-gradient(135deg,#C9A84C,#a07c45);color:#000;padding:14px 32px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;border-radius:8px;">
                Accéder à mon dashboard →
              </a>
            </div>
            <p style="text-align:center;font-size:12px;color:#5A5A7A;">
              Support : <a href="https://wa.me/33765189527" style="color:#C9A84C;">WhatsApp Xyra</a>
            </p>
          </div>
        `
      });

      await resend.emails.send({
        from: 'Xyra Alerts <notifications@xyraio.fr>',
        to: 'xyra.solution@gmail.com',
        subject: `💳 Paiement reçu — ${societe} — ${planPrix}/mois`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:28px;max-width:480px;margin:0 auto;">
            <h1 style="color:#C9A84C;font-family:Georgia,serif;">XYRA · PAIEMENT REÇU 💳</h1>
            <div style="background:#2EC9B011;border:1px solid #2EC9B033;padding:16px;border-radius:8px;margin:12px 0;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#2EC9B0;">${planPrix}/mois</div>
            </div>
            <div style="font-size:14px;line-height:2;">
              <div><span style="color:#5A5A7A;">Société :</span> <strong>${societe}</strong></div>
              <div><span style="color:#5A5A7A;">Email :</span> ${email}</div>
              <div><span style="color:#5A5A7A;">Plan :</span> <strong style="color:#C9A84C;">${planNom}</strong></div>
            </div>
            <div style="text-align:center;margin-top:16px;">
              <a href="https://xyraio.fr/mon-espace" style="background:#C9A84C;color:#000;padding:10px 20px;text-decoration:none;font-weight:700;border-radius:6px;display:inline-block;">
                Voir dans le dashboard →
              </a>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
