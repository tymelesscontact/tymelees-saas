import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendEmail(to: string, subject: string, html: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: 'Xyra <notifications@xyraio.fr>', to, subject, html });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');
  const tenantId = await getTenantIdFromRequest(req);
  let articlesQuery = sb.from('stock').select('*').order('art', { ascending: true });
  if (tenantId) articlesQuery = articlesQuery.eq('tenant_id', tenantId);
  if (companyId && UUID_RE.test(companyId)) articlesQuery = articlesQuery.eq('company_id', companyId);
  const { data: articles, error } = await articlesQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let mvtQuery = sb.from('mouvements_stock').select('*').order('date_mouvement', { ascending: false }).limit(100);
  if (tenantId) mvtQuery = mvtQuery.eq('tenant_id', tenantId);
  const { data: mouvements } = await mvtQuery;
  let empQuery = sb.from('emplacements').select('*').eq('actif', true).order('nom');
  if (tenantId) empQuery = empQuery.eq('tenant_id', tenantId);
  const { data: emplacements } = await empQuery;
  let fourQuery = sb.from('fournisseurs').select('*').order('nom');
  if (tenantId) fourQuery = fourQuery.eq('tenant_id', tenantId);
  const { data: fournisseurs } = await fourQuery;

  // Enrichir chaque article
  const enriched = (articles || []).map((a: any) => {
    const mvts = (mouvements || []).filter((m: any) => m.article_id === a.id);
    
    // Consommation moyenne 30 derniers jours
    const il30j = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sortiesRecentes = mvts.filter((m: any) => m.type === 'sortie' && new Date(m.date_mouvement) >= il30j);
    const consommation30j = sortiesRecentes.reduce((acc: number, m: any) => acc + m.quantite, 0);
    const consommationJour = consommation30j / 30;
    const joursAvantRupture = consommationJour > 0 ? Math.floor((a.qte || a.quantite || 0) / consommationJour) : null;
    
    // Valeur du stock
    const qte = a.qte || a.quantite || 0;
    const valeur = qte * Number(a.prixU || a.prix_unitaire || 0);
    
    // Statut
    const statut = qte <= 0 ? 'rupture' : qte <= (a.min || a.quantite_min || 5) ? 'critique' : qte >= (a.max || a.quantite_max || 50) ? 'surstock' : 'ok';

    return {
      ...a,
      qte,
      mouvements: mvts.slice(0, 20),
      consommation30j,
      joursAvantRupture,
      valeur,
      statut,
    };
  });

  // KPIs globaux
  const valeurTotale = enriched.reduce((a: number, art: any) => a + (art.valeur || 0), 0);
  const articlesCritiques = enriched.filter((a: any) => a.statut === 'critique' || a.statut === 'rupture');
  const scoreStock = Math.max(0, 100 - articlesCritiques.length * 15);

  return NextResponse.json({ articles: enriched, mouvements: mouvements || [], fournisseurs: fournisseurs || [], emplacements: emplacements || [], valeurTotale, articlesCritiques, scoreStock });
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantIdFromRequest(req);
  const body = await req.json();
  const { action } = body;

  if (action === 'creer') {
    const { art, cat, qte, min, max, prixU, four, localisation, note } = body;
    if (!art) return NextResponse.json({ error: 'Nom de l\'article requis' }, { status: 400 });
    const { data, error } = await sb.from('stock').insert({
      art, cat, qte: Number(qte) || 0, min: Number(min) || 5, max: Number(max) || 50,
      prixU: Number(prixU) || 0, four, localisation: localisation || 'Entrepôt A', note,
      updated_at: new Date().toISOString(),
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, article: data });
  }

  if (action === 'modifier') {
    const { id, ...fields } = body;
    fields.updated_at = new Date().toISOString();
    const { error } = await sb.from('stock').update(fields).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'supprimer') {
    const { id } = body;
    const { error } = await sb.from('stock').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── MOUVEMENT DE STOCK : 6 operations ──────────────────────
  // reception | sortie | transfert | retrait | inventaire | correction
  if (action === 'mouvement' || action === 'transfert') {
    const {
      article_id, quantite, note, cause, client_id,
      emplacement_id, emplacement_destination_id, lot_id,
      numero_lot, date_peremption, prix_achat, fournisseur_id, reference_reception,
    } = body;
    let type = action === 'transfert' ? 'transfert' : body.type;
    if (type === 'entree' || type === 'entrée') type = 'reception';
    const TYPES = ['reception', 'sortie', 'transfert', 'retrait', 'inventaire', 'correction'];
    if (!article_id || !type || quantite === undefined || quantite === null) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }
    if (!TYPES.includes(type)) {
      return NextResponse.json({ error: 'Type inconnu : ' + type }, { status: 400 });
    }
    const qte = Number(quantite);
    if (isNaN(qte) || qte < 0) {
      return NextResponse.json({ error: 'Quantite invalide' }, { status: 400 });
    }
    let empId = emplacement_id;
    if (!empId) {
      const { data: def } = await sb.from('emplacements')
        .select('id').eq('tenant_id', tenantId).eq('par_defaut', true).limit(1).maybeSingle();
      empId = def?.id || null;
    }
    if (!empId) {
      return NextResponse.json({ error: 'Aucun emplacement disponible' }, { status: 400 });
    }
    let lotId = lot_id || null;
    if (!lotId && type === 'reception' && (numero_lot || date_peremption)) {
      const { data: nouveauLot } = await sb.from('lots').insert({
        tenant_id: tenantId, article_id, numero_lot: numero_lot || null,
        date_peremption: date_peremption || null, prix_achat: prix_achat || null,
        fournisseur_id: fournisseur_id || null, reference_reception: reference_reception || null,
      }).select('id').single();
      lotId = nouveauLot?.id || null;
    }
    let q = sb.from('stock_niveaux').select('*')
      .eq('article_id', article_id).eq('emplacement_id', empId);
    q = lotId ? q.eq('lot_id', lotId) : q.is('lot_id', null);
    const { data: niveau } = await q.maybeSingle();
    const avant = Number(niveau?.quantite || 0);
    let apres = avant;
    if (type === 'reception') apres = avant + qte;
    else if (type === 'sortie' || type === 'retrait' || type === 'transfert') apres = avant - qte;
    else if (type === 'inventaire' || type === 'correction') apres = qte;
    if (apres < 0) {
      return NextResponse.json({ error: 'Stock insuffisant : ' + avant + ' disponible, ' + qte + ' demande' }, { status: 400 });
    }
    if (niveau) {
      await sb.from('stock_niveaux')
        .update({ quantite: apres, updated_at: new Date().toISOString() })
        .eq('id', niveau.id);
    } else {
      await sb.from('stock_niveaux').insert({
        tenant_id: tenantId, article_id, emplacement_id: empId,
        lot_id: lotId, quantite: apres,
      });
    }
    if (type === 'transfert') {
      if (!emplacement_destination_id) {
        return NextResponse.json({ error: 'Emplacement de destination requis' }, { status: 400 });
      }
      let qd = sb.from('stock_niveaux').select('*')
        .eq('article_id', article_id).eq('emplacement_id', emplacement_destination_id);
      qd = lotId ? qd.eq('lot_id', lotId) : qd.is('lot_id', null);
      const { data: dest } = await qd.maybeSingle();
      if (dest) {
        await sb.from('stock_niveaux')
          .update({ quantite: Number(dest.quantite) + qte, updated_at: new Date().toISOString() })
          .eq('id', dest.id);
      } else {
        await sb.from('stock_niveaux').insert({
          tenant_id: tenantId, article_id, emplacement_id: emplacement_destination_id,
          lot_id: lotId, quantite: qte,
        });
      }
    }
    let valeurPerdue = null;
    if (type === 'retrait') {
      const { data: art0 } = await sb.from('stock').select('prixu,prix_unitaire').eq('id', article_id).single();
      const pu = Number(art0?.prixu || art0?.prix_unitaire || 0);
      valeurPerdue = Math.round(pu * qte * 100) / 100;
    }
    const { error: mvtError } = await sb.from('mouvements_stock').insert({
      tenant_id: tenantId, article_id, type,
      quantite: (type === 'inventaire' || type === 'correction') ? Math.abs(apres - avant) : qte,
      note: note || null, cause: cause || null, client_id: client_id || null,
      emplacement_id: empId, emplacement_destination_id: emplacement_destination_id || null,
      lot_id: lotId, quantite_avant: avant, quantite_apres: apres,
      valeur_perdue: valeurPerdue, operateur: body.operateur || null,
    });
    if (mvtError) return NextResponse.json({ error: mvtError.message }, { status: 500 });
    const { data: niveaux } = await sb.from('stock_niveaux')
      .select('quantite').eq('article_id', article_id);
    const total = (niveaux || []).reduce((a: number, n: any) => a + Number(n.quantite || 0), 0);
    await sb.from('stock')
      .update({ qte: total, quantite: total, updated_at: new Date().toISOString() })
      .eq('id', article_id);
    const { data: art } = await sb.from('stock').select('min,seuil_min,art').eq('id', article_id).single();
    const minSeuil = Number(art?.min || art?.seuil_min || 0);
    if (minSeuil > 0 && total <= minSeuil && (type === 'sortie' || type === 'retrait')) {
      await sb.from('notifications').insert({
        type: 'stock', icon: '📦', urgence: 'haute',
        titre: 'Stock critique : ' + art?.art,
        message: 'Il ne reste que ' + total + ' unite(s) - seuil minimum : ' + minSeuil,
        lu: false, tenant_id: tenantId || null,
      });
    }
    return NextResponse.json({
      success: true, type, quantite_avant: avant, quantite_apres: apres,
      nouvelleQte: total, valeur_perdue: valeurPerdue,
    });
  }

  if (action === 'analyse_ia') {
    const { articles } = body;
    if (!articles?.length) return NextResponse.json({ error: 'Aucun article' }, { status: 400 });
    try {
      const critiques = articles.filter((a: any) => a.statut === 'critique' || a.statut === 'rupture');
      const prompt = `Tu es responsable logistique chez Xyra. Analyse ces données de stock réelles :
Total articles : ${articles.length}
Articles critiques : ${critiques.map((a: any) => `${a.art} (${a.qte} unités restantes, rupture dans ${a.joursAvantRupture || '?'} jours)`).join(', ')}
Valeur totale du stock : ${articles.reduce((a: number, art: any) => a + (art.valeur || 0), 0)}€

Donne 3 recommandations concrètes et prioritaires pour éviter les ruptures. Sois précis, chiffré, actionnable. Français, 4-5 phrases max.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      return NextResponse.json({ success: true, analyse: data.content?.[0]?.text || 'Analyse indisponible.' });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'rapport_mensuel') {
    const email = process.env.OWNER_EMAIL || 'xyra.solution@gmail.com';
    const { articles } = body;
    const critiques = (articles || []).filter((a: any) => a.statut === 'critique' || a.statut === 'rupture');
    const valeur = (articles || []).reduce((a: number, art: any) => a + (art.valeur || 0), 0);
    const mois = new Date().toLocaleDateString('fr', { month: 'long', year: 'numeric' });
    try {
      await sendEmail(email, `Rapport stock mensuel — ${mois}`,
        `<div style="font-family:sans-serif;padding:24px;"><h2 style="color:#C9A84C">Rapport Stock — ${mois}</h2>
        <p><strong>${articles?.length || 0}</strong> articles · Valeur totale : <strong>${Math.round(valeur)}€</strong></p>
        ${critiques.length > 0 ? `<h3 style="color:#FF5252">⚠️ Articles critiques (${critiques.length})</h3><ul>${critiques.map((a: any) => `<li>${a.art} : ${a.qte} unités restantes</li>`).join('')}</ul>` : '<p style="color:#2EC9B0">✅ Aucun article en rupture ce mois</p>'}
        </div>`
      );
    } catch { /* non bloquant */ }
    return NextResponse.json({ success: true });
  }

  if (action === 'generer_commande_pdf') {
    const { fournisseur, articles_a_commander } = body;
    // Génération simple — retourne les données pour affichage/export
    return NextResponse.json({ success: true, commande: { fournisseur, articles: articles_a_commander, date: new Date().toLocaleDateString('fr'), ref: `CMD-${Date.now()}` } });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}