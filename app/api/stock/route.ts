import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendEmail(to: string, subject: string, html: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: 'Xyra <notifications@xyraio.fr>', to, subject, html });
}

export async function GET() {
  const { data: articles, error } = await sb.from('stock').select('*').order('art', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: mouvements } = await sb.from('mouvements_stock').select('*').order('date_mouvement', { ascending: false }).limit(100);
  const { data: fournisseurs } = await sb.from('fournisseurs').select('*').order('nom');

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

  return NextResponse.json({ articles: enriched, mouvements: mouvements || [], fournisseurs: fournisseurs || [], valeurTotale, articlesCritiques, scoreStock });
}

export async function POST(req: NextRequest) {
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

  if (action === 'mouvement') {
    const { article_id, type, quantite, note, operateur, localisation_origine, localisation_destination } = body;
    if (!article_id || !type || !quantite) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

    // Enregistrer le mouvement
    const { error: mvtError } = await sb.from('mouvements_stock').insert({
      article_id, type, quantite: Number(quantite), note, operateur: operateur || 'Curtiss',
      localisation_origine, localisation_destination,
    });
    if (mvtError) return NextResponse.json({ error: mvtError.message }, { status: 500 });

    // Mettre à jour la quantité
    const { data: art } = await sb.from('stock').select('qte,quantite,min,art').eq('id', article_id).single();
    const qteActuelle = Number(art?.qte || art?.quantite || 0);
    const nouvelleQte = type === 'entrée' ? qteActuelle + Number(quantite) : Math.max(0, qteActuelle - Number(quantite));
    await sb.from('stock').update({ qte: nouvelleQte, updated_at: new Date().toISOString() }).eq('id', article_id);

    // Alerte si stock critique après sortie
    const minSeuil = art?.min || 5;
    if (type === 'sortie' && nouvelleQte <= minSeuil) {
      await sb.from('notifications').insert({
        type: 'stock', icon: '📦', urgence: 'haute',
        titre: `Stock critique : ${art?.art}`,
        message: `Il ne reste que ${nouvelleQte} unité(s) — seuil minimum : ${minSeuil}`,
        lu: false,
      });
    }

    return NextResponse.json({ success: true, nouvelleQte });
  }

  if (action === 'transfert') {
    const { article_id, quantite, de, vers } = body;
    await sb.from('mouvements_stock').insert({
      article_id, type: 'transfert', quantite: Number(quantite),
      localisation_origine: de, localisation_destination: vers,
      note: `Transfert ${de} → ${vers}`, operateur: 'Curtiss',
    });
    return NextResponse.json({ success: true });
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