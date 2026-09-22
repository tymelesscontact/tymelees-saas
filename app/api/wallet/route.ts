import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { envoyerWhatsApp } from '../../lib/whatsapp';
import { estAutoriseGererEquipe } from '../../lib/permissions';
import {
  DEVISES_AUTORISEES, TYPES_SORTIE_AUTORISES, MAX_ENCAISSEMENTS_PAR_HEURE, EMAIL_RE, TEL_RE,
  echapHtml, montantValide, sommeSolde, bicValide,
} from '../../lib/walletValidation';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Regles de validation (devises, types de paiement sortant, montant, email, telephone) : voir walletValidation.ts.

// Solde reel : somme de TOUTES les transactions confirmees ou virees (par pages de 1000),
// et non des 100 dernieres affichees dans la liste.
async function calculerSolde(sbClient: any, tenantId: string, companyId: string | null): Promise<number> {
  const TAILLE = 1000;
  let solde = 0;
  for (let page = 0; page < 200; page++) {
    let q = sbClient.from('wallet_transactions').select('type,montant,commission')
      .eq('tenant_id', tenantId).in('statut', ['confirmé', 'viré'])
      .order('created_at', { ascending: true }).order('id', { ascending: true })
      .range(page * TAILLE, page * TAILLE + TAILLE - 1);
    if (companyId) q = q.eq('company_id', companyId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    solde += sommeSolde(data || []);
    if (!data || data.length < TAILLE) break;
  }
  return solde;
}

// Service role : le tenant_id est deja verifie et impose dans chaque requete
// (.eq('tenant_id', tenantId)) -- la clé anonyme ne marchait pas ici car ce
// client n'attache jamais le JWT de l'utilisateur, donc RLS le voit comme
// anon (auth.uid() toujours nul), ce qui bloquait silencieusement l'acces
// meme aux donnees du bon tenant.
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'list') {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) return NextResponse.json({ transactions: [], solde: 0 });
    const companyId = searchParams.get('company_id');
    // Parametre optionnel `depuis` (AAAA-MM-JJ) : sert aux chiffres du tableau de bord (CA du mois),
    // qui ne doivent pas etre limites aux 100 dernieres transactions. Sans lui, comportement inchange.
    const depuis = searchParams.get('depuis');
    const depuisValide = depuis && /^\d{4}-\d{2}-\d{2}$/.test(depuis) ? depuis : null;
    let query = sb.from('wallet_transactions').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(depuisValide ? 1000 : 100);
    if (depuisValide) query = query.gte('created_at', depuisValide);
    if (companyId && UUID_RE.test(companyId)) query = query.eq('company_id', companyId);
    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Le solde porte sur toutes les transactions (pas seulement les lignes renvoyees ci-dessus).
    let solde = 0;
    try {
      solde = await calculerSolde(sb, tenantId, companyId && UUID_RE.test(companyId) ? companyId : null);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }

    return NextResponse.json({ transactions: data, solde });
  }

  if (action === 'parametres') {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) return NextResponse.json({ seuil_alerte: 500 });
    const { data } = await sb.from('wallet_parametres').select('seuil_alerte').eq('tenant_id', tenantId).maybeSingle();
    return NextResponse.json({ seuil_alerte: data ? Number(data.seuil_alerte) : 500 });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const tenantIdPost = await getTenantIdFromRequest(req);
  const body = await req.json();
  const { action } = body;

  // ── DEFINIR LE SEUIL D'ALERTE : reserve au proprietaire ou a un Admin (reglage de l'entreprise) ─────
  if (action === 'definir_seuil') {
    if (!tenantIdPost) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    if (!(await estAutoriseGererEquipe(req, tenantIdPost))) {
      return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    }
    const seuil = montantValide(body.seuil);
    if (seuil === null) return NextResponse.json({ error: 'Seuil invalide' }, { status: 400 });
    const { error } = await sb.from('wallet_parametres')
      .upsert({ tenant_id: tenantIdPost, seuil_alerte: seuil, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, seuil_alerte: seuil });
  }

  // ── ENCAISSER : génère un vrai lien de paiement Stripe ─────
  if (action === 'encaisser') {
    if (!tenantIdPost) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    const { nom: nomBrut, montant: montantBrut, devise: deviseBrute, methode: methodeBrute, email: emailBrut, tel: telBrut, ref: refBrut } = body;

    // Validation : ce bouton envoie un email et un WhatsApp AU NOM de Xyra a l'adresse saisie.
    const montant = montantValide(montantBrut);
    if (montant === null) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    const nom = typeof nomBrut === 'string' ? nomBrut.trim() : '';
    if (!nom || nom.length > 100) return NextResponse.json({ error: 'Nom invalide' }, { status: 400 });
    const devise = String(deviseBrute || 'EUR').toUpperCase();
    if (!DEVISES_AUTORISEES.includes(devise)) return NextResponse.json({ error: 'Devise non prise en charge' }, { status: 400 });
    const email = emailBrut ? String(emailBrut).trim() : '';
    if (email && (email.length > 254 || !EMAIL_RE.test(email))) return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    const tel = telBrut ? String(telBrut).trim() : '';
    if (tel && !TEL_RE.test(tel)) return NextResponse.json({ error: 'Telephone invalide' }, { status: 400 });
    const methode = methodeBrute ? String(methodeBrute).trim().slice(0, 30) : 'carte';
    const ref = refBrut ? String(refBrut).trim().slice(0, 60) : '';

    // Anti-abus : au plus 30 demandes de paiement par heure et par entreprise.
    const depuisUneHeure = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentes } = await sb.from('wallet_transactions').select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantIdPost).eq('type', 'entree').gte('created_at', depuisUneHeure);
    if ((recentes || 0) >= MAX_ENCAISSEMENTS_PAR_HEURE) {
      return NextResponse.json({ error: 'Trop de demandes de paiement en une heure, reessayez plus tard' }, { status: 429 });
    }

    const commission = montant * 0.05;

    const { data: row, error: insertErr } = await sb
      .from('wallet_transactions')
      .insert({
        type: 'entree',
        libelle: `Paiement ${nom}`,
        montant,
        devise,
        methode,
        statut: 'en_attente',
        ref: ref || `TYM-${Date.now()}`,
        commission,
        destinataire_nom: nom,
        destinataire_email: email || null,
        destinataire_tel: tel || null,
        tenant_id: tenantIdPost,
      })
      .select()
      .single();

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    let paymentUrl: string | null = null;
    let erreurStripe: string | null = null;

    try {
      if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY absente de cet environnement');
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-05-27.dahlia' });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: email || undefined,
        metadata: { type: 'wallet_payment', transaction_id: row.id },
        line_items: [{
          price_data: {
            currency: (devise || 'EUR').toLowerCase(),
            product_data: { name: `Paiement ${nom}`, description: ref || '' },
            unit_amount: Math.round(montant * 100),
          },
          quantity: 1,
        }],
        // Retour vers le site en cours (xyratest1 -> xyratest1, production -> xyraio.fr), pas toujours la production.
        success_url: `${req.nextUrl.origin}/dashboard?wallet=success`,
        cancel_url: `${req.nextUrl.origin}/dashboard?wallet=cancelled`,
      });

      paymentUrl = session.url;

      await sb.from('wallet_transactions').update({
        stripe_session_id: session.id,
        stripe_payment_url: session.url,
      }).eq('id', row.id);
    } catch (e: any) {
      // Avant, cette erreur etait avalee : l'ecran affichait toujours "lien Stripe indisponible"
      // sans jamais dire pourquoi (cle absente, cle invalide, devise refusee...).
      erreurStripe = `${e?.type || e?.name || 'Erreur'} : ${e?.message || 'raison inconnue'}`;
      console.error('Stripe error:', erreurStripe);
      try {
        const message = `Creation du lien de paiement impossible : ${erreurStripe}`.slice(0, 500);
        const { data: deja } = await sb.from('erreurs_systeme').select('id')
          .eq('route', '/api/wallet').eq('resolu', false).eq('message', message).limit(1);
        if (!deja || deja.length === 0) {
          const { data: tenant } = await sb.from('tenants').select('email').eq('id', tenantIdPost).maybeSingle();
          await sb.from('erreurs_systeme').insert({ route: '/api/wallet', message, tenant_email: tenant?.email || null, gravite: 'erreur' });
        }
      } catch (e2: any) { console.error('wallet : impossible de signaler la panne Stripe', e2?.message); }
    }

    // Envoi du lien au client
    if (paymentUrl && email) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Xyra <notifications@xyraio.fr>',
          to: email,
          subject: `Lien de paiement — ${montant}${devise === 'USD' ? '$' : '€'}`,
          html: `<div style="font-family:sans-serif;padding:24px;"><p>Bonjour ${echapHtml(nom)},</p><p>Voici votre lien de paiement sécurisé :</p><p><a href="${paymentUrl}" style="background:#C9A84C;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Payer ${montant}${devise === 'USD' ? '$' : '€'}</a></p></div>`,
        });
      } catch (e) { console.error('Email error:', e); }
    }
    if (paymentUrl && tel) {
      try {
        await envoyerWhatsApp(tel, `Bonjour ${nom.replace(/[\r\n]+/g, ' ')},\n\nVoici votre lien de paiement sécurisé pour ${montant}${devise === 'USD' ? '$' : '€'} :\n${paymentUrl}\n\nMerci 🙏`, tenantIdPost);
      } catch (e) { console.error('WhatsApp error:', e); }
    }

    return NextResponse.json({ success: true, transaction: row, paymentUrl, erreurStripe });
  }

  // ── PAYER : enregistre un virement à exécuter manuellement ──
  if (action === 'payer') {
    if (!tenantIdPost) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    // Enregistrer un paiement sortant engage l'argent de l'entreprise : reserve au proprietaire ou a un Admin.
    if (!(await estAutoriseGererEquipe(req, tenantIdPost))) {
      return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    }
    const { nom: nomBrut, montant: montantBrut, devise: deviseBrute, methode: methodeBrute, ref: refBrut, type: typeBrut, destinataire_iban, destinataire_bic, destinataire_email, destinataire_tel, company_id } = body;

    const montant = montantValide(montantBrut);
    if (montant === null) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    const nom = typeof nomBrut === 'string' ? nomBrut.trim() : '';
    if (!nom || nom.length > 100) return NextResponse.json({ error: 'Nom invalide' }, { status: 400 });
    // Jamais de type "entree" ici : un paiement sortant ne peut pas crediter le solde.
    const type = typeBrut ? String(typeBrut) : 'sortie';
    if (!TYPES_SORTIE_AUTORISES.includes(type)) return NextResponse.json({ error: 'Type de paiement non autorise' }, { status: 400 });
    const devise = String(deviseBrute || 'EUR').toUpperCase();
    if (!DEVISES_AUTORISEES.includes(devise)) return NextResponse.json({ error: 'Devise non prise en charge' }, { status: 400 });
    const iban = destinataire_iban ? String(destinataire_iban).trim() : '';
    if (iban.length > 60 || /[<>]/.test(iban)) return NextResponse.json({ error: 'IBAN invalide' }, { status: 400 });
    // Le BIC est facultatif (un IBAN suffit pour un virement SEPA), mais s'il est saisi il doit etre valide.
    let bic: string | null = null;
    if (destinataire_bic && String(destinataire_bic).trim()) {
      bic = bicValide(destinataire_bic);
      if (!bic) return NextResponse.json({ error: 'BIC invalide (8 ou 11 caracteres)' }, { status: 400 });
    }
    const emailDest = destinataire_email ? String(destinataire_email).trim() : '';
    if (emailDest && (emailDest.length > 254 || !EMAIL_RE.test(emailDest))) return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    const telDest = destinataire_tel ? String(destinataire_tel).trim() : '';
    if (telDest && !TEL_RE.test(telDest)) return NextResponse.json({ error: 'Telephone invalide' }, { status: 400 });
    const methode = methodeBrute ? String(methodeBrute).trim().slice(0, 30) : 'Virement SEPA';
    const ref = refBrut ? String(refBrut).trim().slice(0, 60) : '';
    // La societe indiquee doit appartenir a l'entreprise (sinon on rattacherait un paiement a celle d'un autre).
    if (company_id) {
      if (!UUID_RE.test(String(company_id))) return NextResponse.json({ error: 'Societe invalide' }, { status: 400 });
      const { data: societe } = await sb.from('companies').select('id').eq('id', company_id).eq('tenant_id', tenantIdPost).maybeSingle();
      if (!societe) return NextResponse.json({ error: 'Societe invalide' }, { status: 400 });
    }

    // Garde-fou : un paiement sortant ne peut jamais depasser le solde reellement disponible
    // (qui exclut deja la commission Xyra). Sans ce controle, rien n'empechait de virer par erreur
    // une somme qui incluait la part de Xyra.
    let soldeDisponible: number;
    try {
      soldeDisponible = await calculerSolde(sb, tenantIdPost, company_id && UUID_RE.test(String(company_id)) ? company_id : null);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    if (montant > soldeDisponible) {
      return NextResponse.json({ error: `Solde insuffisant : ${soldeDisponible.toFixed(2)} disponible(s), commission Xyra deja exclue` }, { status: 400 });
    }

    const { data: row, error } = await sb
      .from('wallet_transactions')
      .insert({
        type,
        libelle: nom,
        montant,
        devise,
        methode,
        statut: 'à_virer',
        ref: ref || `PAY-${Date.now()}`,
        destinataire_nom: nom,
        destinataire_iban: iban || null,
        destinataire_bic: bic,
        destinataire_email: emailDest || null,
        destinataire_tel: telDest || null,
        tenant_id: tenantIdPost,
        company_id: company_id || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, transaction: row });
  }

  // ── MARQUER COMME VIRÉ : après exécution manuelle du virement ─
  if (action === 'marquer_vire') {
    if (!tenantIdPost) return NextResponse.json({ error: 'non_autorise' }, { status: 401 });
    // Confirmer qu'un virement a bien ete execute modifie le solde : reserve au proprietaire ou a un Admin.
    if (!(await estAutoriseGererEquipe(req, tenantIdPost))) {
      return NextResponse.json({ error: 'reserve_au_proprietaire_ou_admin' }, { status: 403 });
    }
    const { id } = body;
    if (!id || !UUID_RE.test(String(id))) return NextResponse.json({ error: 'Transaction invalide' }, { status: 400 });
    // Seul un paiement sortant encore "a virer" peut passer a "vire" (jamais une entree, jamais un autre statut).
    const { data: maj, error } = await sb.from('wallet_transactions').update({ statut: 'viré' })
      .eq('id', id).eq('tenant_id', tenantIdPost).eq('statut', 'à_virer').neq('type', 'entree').select('id');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!maj || maj.length === 0) return NextResponse.json({ error: 'Transaction introuvable ou deja traitee' }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}