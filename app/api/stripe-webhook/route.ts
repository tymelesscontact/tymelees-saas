import { NextRequest, NextResponse } from 'next/server';
import { PLAN_PRIX, PLAN_LABELS, MODULE_PRICES } from '../../lib/plans';
import { allouerObjectifs } from '../../lib/walletObjectifs';
import { finaliserAdhesionClub } from '../../lib/clubAdhesion';

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

      // ── Achat d'un module a la carte ──
      if (session.metadata?.type === 'module') {
        const moduleKey = session.metadata.module;
        const tenantId = session.metadata.tenant_id;
        if (tenantId && moduleKey) {
          const prix = MODULE_PRICES[moduleKey] ?? null;
          const { data: existant } = await sb.from('modules_actifs')
            .select('id').eq('tenant_id', tenantId).eq('type_module', moduleKey).maybeSingle();
          const champs = {
            statut: 'actif', prix, date_activation: new Date().toISOString(), date_fin: null,
            stripe_subscription_id: session.subscription || null,
          };
          if (existant) {
            await sb.from('modules_actifs').update(champs).eq('id', existant.id);
          } else {
            await sb.from('modules_actifs').insert({ tenant_id: tenantId, type_module: moduleKey, ...champs });
          }
          try {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'Xyra Alerts <notifications@xyraio.fr>',
              to: 'xyra.solution@gmail.com',
              subject: `Module a la carte souscrit — ${moduleKey} (${(session.amount_total / 100).toFixed(2)}€)`,
              html: `<div style="font-family:sans-serif;padding:24px;"><h2>Module a la carte</h2><p>Module : <strong>${moduleKey}</strong></p><p>Tenant : ${session.metadata.email || tenantId}</p><p>Montant : <strong>${(session.amount_total / 100).toFixed(2)}€/mois</strong></p></div>`,
            });
          } catch (e) { console.error('Email module:', e); }
        }
        return NextResponse.json({ received: true });
      }

      if (session.metadata?.type === 'wallet_payment') {
        const { data: transactionConfirmee } = await sb.from('wallet_transactions')
          .update({ statut: 'confirmé' })
          .eq('id', session.metadata.transaction_id)
          .select()
          .single();
        if (transactionConfirmee?.tenant_id) {
          try {
            const net = Number(transactionConfirmee.montant) - Number(transactionConfirmee.commission || 0);
            await allouerObjectifs(sb, transactionConfirmee.tenant_id, transactionConfirmee.id, net);
          } catch (e) { console.error('Objectifs (wallet payment) error:', e); }
        }
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

        // Rend l'encaissement visible dans le Wallet/Tresorerie -- avant ce correctif, payer une
        // facture ne faisait que changer son statut, sans jamais apparaitre comme une vraie entree
        // d'argent. Pas de commission Xyra ici : contrairement au Wallet ("Encaisser"), une facture
        // n'est pas un encaissement pour compte de tiers, c'est le propre CA du tenant.
        if (facture?.tenant_id) {
          try {
            const { data: dejaEnregistre } = await sb.from('wallet_transactions')
              .select('id').eq('stripe_session_id', session.id).maybeSingle();
            if (!dejaEnregistre) {
              const { data: txFacture } = await sb.from('wallet_transactions').insert({
                type: 'entree',
                libelle: `Facture ${facture.numero || ''}${facture.client_nom ? ' — ' + facture.client_nom : ''}`.trim(),
                montant: facture.montant_ttc,
                devise: 'EUR',
                methode: 'stripe',
                statut: 'confirmé',
                ref: facture.numero || session.id,
                tenant_id: facture.tenant_id,
                company_id: facture.company_id || null,
                stripe_session_id: session.id,
              }).select().single();
              if (txFacture) {
                try { await allouerObjectifs(sb, facture.tenant_id, txFacture.id, Number(facture.montant_ttc)); }
                catch (e) { console.error('Objectifs (facture payee) error:', e); }
              }
            }
          } catch (e) { console.error('Wallet (facture payee) error:', e); }
        }

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
        const { data: deal } = await sb.from('club_deals')
          .update({ statut: 'paye', paye_le: new Date().toISOString(), reference_paiement: session.id })
          .eq('id', session.metadata.deal_id)
          .select()
          .single();

        // Visibilite dans le Wallet, en plus (pas a la place) du paiement direct Stripe Connect deja
        // recu par le prestataire (voir app/api/club-deals/route.ts, action "payer") : l'argent est
        // deja chez lui, statut "confirme" -- rien a virer manuellement. Uniquement si son compte Club
        // est relie a un compte Xyra (best-effort, jamais bloquant pour le paiement lui-meme).
        if (deal?.membre_prestataire) {
          try {
            const { data: prest } = await sb.from('club_membres').select('id,tenant_id,user_id').eq('id', deal.membre_prestataire).maybeSingle();
            let tenantId = prest?.tenant_id || null;
            if (!tenantId && prest?.user_id) {
              const { data: tm } = await sb.from('tenant_membres').select('tenant_id').eq('user_id', prest.user_id).limit(1).maybeSingle();
              if (tm?.tenant_id) {
                tenantId = tm.tenant_id;
                await sb.from('club_membres').update({ tenant_id: tenantId }).eq('id', prest.id);
              }
            }
            if (tenantId) {
              const { data: dejaEnregistre } = await sb.from('wallet_transactions')
                .select('id').eq('stripe_session_id', session.id).maybeSingle();
              if (!dejaEnregistre) {
                const montantNetDeal = Number(deal.montant) - Number(deal.commission_xyra_montant || 0);
                const { data: txDeal } = await sb.from('wallet_transactions').insert({
                  type: 'entree',
                  libelle: `Club Deal ${deal.reference || ''} — ${deal.titre || ''}`.trim(),
                  montant: montantNetDeal,
                  devise: (deal.devise || 'EUR').toUpperCase(),
                  methode: 'stripe',
                  statut: 'confirmé',
                  ref: deal.reference || session.id,
                  tenant_id: tenantId,
                  stripe_session_id: session.id,
                }).select().single();
                if (txDeal) {
                  try { await allouerObjectifs(sb, tenantId, txDeal.id, montantNetDeal); }
                  catch (e) { console.error('Objectifs (club deal paye) error:', e); }
                }
              }
            }
          } catch (e) { console.error('Wallet (club deal paye) error:', e); }
        }
        return NextResponse.json({ received: true });
      }
      if (session.metadata?.type === 'club_adhesion') {
        await finaliserAdhesionClub(sb, session.metadata.membre_id, session.metadata.etape || 'cotisation', session.id, session.amount_total, req.nextUrl.origin);
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

    // ── Abonnement annule : reverrouille le module a la carte correspondant ──
    // (ne touche jamais les forfaits : ceux-la ne sont pas dans modules_actifs)
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await sb.from('modules_actifs')
        .update({ statut: 'annulé', date_fin: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id)
        .eq('statut', 'actif');
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
