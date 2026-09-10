"use client";
import { useState, useEffect } from "react";
import { C } from "../lib/ui";
import { MODULE_PRICES, PLAN_LABELS, PLAN_PRIX } from "../lib/plans";

// Ecran d'upsell affiche quand un module est verrouille pour le plan du
// tenant. Partage entre les deux dashboards (mon-espace/xyra.jsx et
// dashboard/tymeless.jsx). Trois options possibles selon le plan :
//   - Module seul (a la carte, Starter/Business uniquement)
//   - Passer a Business Pro
//   - Passer a Enterprise
// Chaque bouton lance un vrai paiement Stripe via /api/create-checkout.

const MODULE_PREVIEWS: Record<string, { icon: string; desc: string; features: string[] }> = {
  overview:{icon:"◈",desc:"Vue d'ensemble business",features:["8 KPIs en temps réel","Score santé business","Alertes critiques","Actions rapides IA"]},
  crm:{icon:"◎",desc:"CRM & Pipeline",features:["Pipeline Kanban visuel","Score IA par lead","Relances automatiques","Analytics conversion"]},
  devis:{icon:"◧",desc:"Devis & Facturation",features:["Devis PDF en 1 clic","Signature électronique","Envoi WhatsApp auto","Score solvabilité client"]},
  investissement:{icon:"◐",desc:"Investissement IA",features:["Recommandations Claude","ROI par investissement","Plan d'action personnalisé","Scénarios prévisionnels"]},
  compta:{icon:"◉",desc:"Comptabilité complète",features:["Journal + Bilan","Déclaration TVA","Export expert-comptable","Conseils IA fiscaux"]},
  tresorerie:{icon:"◑",desc:"Trésorerie 90 jours",features:["Cash-flow prévisionnel","Alertes seuil critique","Multi-devises","Prévisions IA 3 mois"]},
  analytique:{icon:"◒",desc:"Analytique & CA",features:["CA par service & pays","Prédictions IA mensuelles","Objectifs & suivi","Rapports automatiques"]},
  clients:{icon:"◬",desc:"Gestion clients",features:["Fiches clients complètes","Score solvabilité","Upsell automatique","Historique missions"]},
  partenaires:{icon:"⬡",desc:"Partenaires & AA",features:["Suivi commissions","Chat partenaires","Contrats automatiques","Score performance"]},
  annuaire:{icon:"◱",desc:"Réseau & Annuaire mondial",features:["18+ pays","Deals membres","Messagerie","IA Match business"]},
  wallet_membres:{icon:"◈",desc:"Wallets membres",features:["Soldes en temps réel","Cartes virtuelles","Multi-devises","Renouvellements auto"]},
  evenements:{icon:"◆",desc:"Événements & Networking",features:["Créer des événements","QR Code inscription","Visio Jitsi intégrée","Gestion invités"]},
  scoring:{icon:"★",desc:"Réputation & NPS",features:["Avis Google centralisés","Réponses IA automatiques","Rapport NPS mensuel","Widget site web"]},
  equipe:{icon:"⊞",desc:"RH & Équipe",features:["16 modules RH complets","Pointage GPS","Paie automatique","IA RH + Juridique"]},
  planning:{icon:"⊡",desc:"Planning & Agenda",features:["5 vues calendrier","IA auto-planification","Booking client","Règles horaires"]},
  prospection:{icon:"⊕",desc:"Prospection Auto",features:["Base SIRENE 12M+","Bot WhatsApp IA","Bot d'appel vocal","Séquences automatiques"]},
  stock:{icon:"⊟",desc:"Stock & Fournitures",features:["Alertes stock critique","IA prédictive","Commandes auto","QR terrain"]},
  services:{icon:"⊛",desc:"Produits & Services",features:["Catalogue services","Tarification IA","Tunnel upsell","CGV/CGU auto"]},
  deploiement:{icon:"🌍",desc:"Déploiement SaaS",features:["Clients white-label","Revenus MRR/ARR","Onboarding auto","Dashboard revendeurs"]},
  api:{icon:"◇",desc:"API Xyra",features:["Clés API sécurisées","Webhooks temps réel","Documentation complète","Logs & monitoring"]},
  notifications:{icon:"🔔",desc:"Notifications avancées",features:["Push temps réel","WhatsApp auto","Email auto","Configuration complète"]},
  signature:{icon:"✦",desc:"Contrats & Signatures",features:["E-signature légale","10+ modèles","Archivage sécurisé","Avenants auto"]},
  formation:{icon:"⊿",desc:"Formation équipe",features:["Modules vidéo","Certifications","Protocoles métier","Quiz & scores"]},
  facturation:{icon:"🧾",desc:"Facturation électronique",features:["Factur-X conforme","Chorus Pro","E-reporting TVA","DGFiP automatique"]},
  club_affaires:{icon:"◈",desc:"Club d'affaires privé",features:["Réseau VIP","Deals -10%","Événements exclusifs","IA Match"]},
  fournisseurs:{icon:"⊞",desc:"Fournisseurs",features:["Carnet fournisseurs","IBAN & délais","Chat fournisseur","Commandes"]},
  cartes:{icon:"◈",desc:"Cartes Virtuelles",features:["Cartes par collaborateur","Budgets projet","Approbations","Analyse IA dépenses"]},
  notefrais:{icon:"🧾",desc:"Notes de Frais",features:["Scan ticket (OCR)","Workflow validation","Écriture Wallet auto","Export FEC"]},
};

const PLAN_FEATURES: Record<string, string[]> = {
  business: ["CRM · Devis · Facturation", "Équipe & RH · Planning", "Analytique · Trésorerie", "Prospection · Clients", "Stock · Services · Deals"],
  enterprise: ["Tout Business Pro", "Bot WhatsApp IA", "API complète", "Déploiement SaaS", "Support 24h dédié"],
};

type Props = { page: string; plan?: string };

export default function UpgradeWall({ page, plan }: Props) {
  const [vraiPlan, setVraiPlan] = useState<string | null>(null);
  const [infoTenant, setInfoTenant] = useState<{ email?: string; societe?: string }>({});
  const [chargement, setChargement] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tenant-info").then(r => r.json()).then(d => {
      if (d.plan) setVraiPlan(d.plan);
      setInfoTenant({ email: d.email, societe: d.societe });
    }).catch(() => {});
  }, []);

  const preview = MODULE_PREVIEWS[page] || { icon: "📦", desc: page, features: ["Fonctionnalités avancées", "Analyses IA", "Automatisations", "Rapports détaillés"] };
  const modulePrice = MODULE_PRICES[page];
  const planEffectif = String(vraiPlan || plan || "starter").toLowerCase();
  const planLabel = PLAN_LABELS[planEffectif] || planEffectif;
  const planPrix = PLAN_PRIX[planEffectif] ? `${PLAN_PRIX[planEffectif]}€/mois` : "";

  const montrerAlaCarte = !!modulePrice && (planEffectif === "starter" || planEffectif === "business");
  const montrerBusiness = planEffectif === "starter";
  const montrerEnterprise = planEffectif === "starter" || planEffectif === "business";

  const lancerPaiement = async (corps: Record<string, string>, cle: string) => {
    setChargement(cle);
    try {
      const res = await fetch("/api/create-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setChargement(null);
      alert(data.error || "Erreur lors de la création du paiement");
    } catch { setChargement(null); alert("Erreur de connexion"); }
  };

  const nbCartes = (montrerAlaCarte ? 1 : 0) + (montrerBusiness ? 1 : 0) + (montrerEnterprise ? 1 : 0);
  const btnStyle = (color: string, texte: string): React.CSSProperties => ({
    background: `linear-gradient(135deg,${color},#a07c45)`, color: color === C.purple ? "#fff" : "#000",
    border: "none", borderRadius: 8, padding: "10px 0", cursor: "pointer", fontWeight: 700, fontSize: 13,
    fontFamily: "inherit", width: "100%", opacity: 1,
  });

  return <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>{preview.icon || "🔒"}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "Georgia,serif", marginBottom: 4 }}>{preview.desc}</div>
      {modulePrice && <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.gold}15`, border: `1px solid ${C.gold}44`, borderRadius: 20, padding: "6px 16px", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: C.muted }}>Module à la carte :</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{modulePrice}€/mois</span>
      </div>}
      {planPrix && <div style={{ fontSize: 12, color: C.muted }}>Votre plan actuel : <b style={{ color: C.gold }}>{planLabel} — {planPrix}</b></div>}
    </div>

    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Ce que vous débloquez</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
        {preview.features.map((f, i) => <div key={i} style={{ background: C.card2, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.text, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}` }}>
          <span style={{ color: C.gold, fontSize: 14 }}>✦</span>{f}
        </div>)}
      </div>
    </div>

    {nbCartes > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${nbCartes},1fr)`, gap: 12, marginBottom: 16 }}>
      {montrerAlaCarte && <div style={{ background: C.card, border: `2px solid ${C.gold}66`, borderRadius: 16, padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>MODULE SEUL</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: C.gold, marginBottom: 2 }}>{modulePrice}€</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>/mois · Sans engagement</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>Ajoutez uniquement ce module à votre plan actuel</div>
        <button onClick={() => lancerPaiement({ module: page }, "module")} disabled={!!chargement} style={btnStyle(C.gold, "")}>
          {chargement === "module" ? "Redirection…" : "+ Ajouter ce module"}
        </button>
      </div>}

      {montrerBusiness && <div style={{ background: C.card, border: `2px solid ${C.gold}44`, borderRadius: 16, padding: 20, textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: C.gold, color: "#000", borderRadius: 20, padding: "3px 12px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>⭐ RECOMMANDÉ</div>
        <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>BUSINESS PRO</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: C.gold, marginBottom: 2 }}>129€</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>/mois · Tous les modules inclus</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12, textAlign: "left" }}>
          {PLAN_FEATURES.business.map((f, i) => <div key={i} style={{ fontSize: 11, color: C.muted }}><span style={{ color: C.gold }}>✓</span> {f}</div>)}
        </div>
        <button onClick={() => lancerPaiement({ plan: "business", email: infoTenant.email || "", societe: infoTenant.societe || "" }, "business")} disabled={!!chargement} style={btnStyle(C.gold, "")}>
          {chargement === "business" ? "Redirection…" : "⚡ Passer à Business Pro"}
        </button>
      </div>}

      {montrerEnterprise && <div style={{ background: C.card, border: `2px solid ${C.purple}44`, borderRadius: 16, padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.purple, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>ENTERPRISE</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: C.purple, marginBottom: 2 }}>249€</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>/mois · Tout inclus</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12, textAlign: "left" }}>
          {PLAN_FEATURES.enterprise.map((f, i) => <div key={i} style={{ fontSize: 11, color: C.muted }}><span style={{ color: C.purple }}>✓</span> {f}</div>)}
        </div>
        <button onClick={() => lancerPaiement({ plan: "enterprise", email: infoTenant.email || "", societe: infoTenant.societe || "" }, "enterprise")} disabled={!!chargement} style={btnStyle(C.purple, "")}>
          {chargement === "enterprise" ? "Redirection…" : "◈ Passer à Enterprise"}
        </button>
      </div>}
    </div>}

    <div style={{ textAlign: "center", fontSize: 12, color: C.muted }}>
      💬 Des questions ? <span style={{ color: C.gold, cursor: "pointer" }} onClick={() => window.open("https://wa.me/33765189527")}>Contactez-nous sur WhatsApp →</span>
    </div>
  </div>;
}
