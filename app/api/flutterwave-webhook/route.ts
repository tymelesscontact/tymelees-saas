import { NextRequest, NextResponse } from 'next/server';
import { PLAN_PRIX } from '../../lib/plans';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('verif-hash');
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    if (!secretHash || signature !== secretHash) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }
    const payload = await req.json();
    if (payload.data?.status !== 'successful') {
      return NextResponse.json({ received: true });
    }
    const meta = payload.data.meta || {};

    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // ── PAIEMENT COMMANDE BOUTIQUE ───────────────────────────
    if (meta.type === 'commande_payment') {
      const { data: commande } = await sb.from('commandes')
        .update({ statut: 'payée', flutterwave_ref: payload.data.tx_ref })
        .eq('id', meta.commande_id)
        .select()
        .single();

      // ── Sortie de stock : la commande est payee, la marchandise part ──
      for (const it of (commande?.items || [])) {
        try {
          if (it.suivi_stock === 'stock' && it.article_stock_id) {
            const { data: art } = await sb.from('stock')
              .select('qte,quantite,tenant_id').eq('id', it.article_stock_id).maybeSingle();
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
          subject: `🛍️ Commande boutique payée (Flutterwave) — ${payload.data.amount} ${payload.data.currency}`,
          html: `<div style="font-family:sans-serif;padding:24px;"><h2>Nouvelle commande payée !</h2><p>Référence : <strong>${commande?.reference || ''}</strong></p><p>Montant : <strong>${payload.data.amount} ${payload.data.currency}</strong></p></div>`,
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
        } catch (e) { console.error('Email client error:', e); }
      }

      return NextResponse.json({ received: true });
    }

    // ── ABONNEMENT XYRA ───────────────────────────────────────
    const { societe, plan } = meta;
    const customer = payload.data.customer || {};
    const email = customer.email;
    const planNorm = plan === 'multi_pro' ? 'multi_societes_pro' : (plan || 'starter');

    // Paiement Flutterwave = paiement unique, pas de prelevement automatique cote Flutterwave.
    // On pose donc une vraie date d'expiration : le robot quotidien coupera l'acces
    // si la personne n'a pas repaye a temps, plutot que de laisser un acces illimite
    // apres un seul paiement.
    const dureeAnnuelle = planNorm === 'club_affaires';
    const dateExpiration = new Date();
    if (dureeAnnuelle) dateExpiration.setFullYear(dateExpiration.getFullYear() + 1);
    else dateExpiration.setMonth(dateExpiration.getMonth() + 1);

    await sb.from('tenants').update({
      statut: 'actif',
      plan: planNorm,
      flutterwave_tx_ref: payload.data.tx_ref,
      abonnement_expire_le: dateExpiration.toISOString(),
      rappel_expiration_envoye: false,
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
      provider: 'flutterwave', reference: payload.data.tx_ref,
    });

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const planPrix = plan === 'starter' ? '59€' : plan === 'business' ? '129€' : '249€';
    const planNom = plan === 'starter' ? 'Starter' : plan === 'business' ? 'Business Pro' : 'Enterprise';

    if (email) {
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
    }
    await resend.emails.send({
      from: 'Xyra Alerts <notifications@xyraio.fr>',
      to: 'xyra.solution@gmail.com',
      subject: `💳 Paiement Flutterwave reçu — ${societe} — ${planPrix}/mois`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;background:#06060E;color:#EAE6DE;padding:28px;max-width:480px;margin:0 auto;">
          <h1 style="color:#C9A84C;font-family:Georgia,serif;">XYRA · PAIEMENT FLUTTERWAVE 💳</h1>
          <div style="background:#2EC9B011;border:1px solid #2EC9B033;padding:16px;border-radius:8px;margin:12px 0;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#2EC9B0;">${planPrix}/mois</div>
          </div>
          <div style="font-size:14px;line-height:2;">
            <div><span style="color:#5A5A7A;">Société :</span> <strong>${societe}</strong></div>
            <div><span style="color:#5A5A7A;">Email :</span> ${email}</div>
            <div><span style="color:#5A5A7A;">Plan :</span> <strong style="color:#C9A84C;">${planNom}</strong></div>
          </div>
        </div>
      `
    });
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
