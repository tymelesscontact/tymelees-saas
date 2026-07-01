"use client";
import { useState } from "react";

const C = {
  dark: "#0a0a0a", card: "#0f0f0f", card2: "#141414",
  border: "#1a1a1a", gold: "#c9a96e", text: "#f0ead6",
  muted: "rgba(240,234,214,0.4)", green: "#2EC9B0",
  blue: "#4B7BFF", purple: "#9B5FFF", orange: "#FF8C3A",
};

const PLANS_SOLO = [
  {
    name: "Starter",
    emoji: "🌱",
    price: 59,
    desc: "Idéal pour démarrer votre activité",
    color: C.green,
    modules: [
      "Wallet & paiements multi-devises",
      "CRM clients & pipeline",
      "Devis & facturation",
      "Cartes virtuelles",
      "Notifications",
      "Chat interne",
      "Support WhatsApp",
    ],
    locked: ["Analytics avancés", "Bot WhatsApp IA", "Agent vocal Vapi", "Prospection IA", "Club d'affaires"],
  },
  {
    name: "Business Pro",
    emoji: "🚀",
    price: 129,
    desc: "Pour les équipes en croissance",
    color: C.gold,
    highlight: true,
    modules: [
      "Tout Starter",
      "Planning & missions",
      "Gestion équipe & RH complète",
      "Partenaires & commissions automatiques",
      "Stock & services",
      "Deals & opportunités",
      "Trésorerie 90 jours + IA",
      "Analytique & CA",
      "Annuaire & réseau mondial",
      "Événements & networking",
      "Signature électronique",
      "Formation équipe",
      "Support prioritaire",
    ],
    locked: ["Bot WhatsApp IA", "Agent vocal Vapi", "Prospection IA", "Club d'affaires"],
  },
  {
    name: "Enterprise",
    emoji: "💎",
    price: 249,
    desc: "Grandes structures & agences",
    color: C.purple,
    modules: [
      "Tout Business Pro",
      "Bot WhatsApp IA (Claude)",
      "Agent vocal Vapi IA",
      "Prospection automatique SIRENE",
      "Club d'affaires privé",
      "Déploiement SaaS clients",
      "API complète & webhooks",
      "Utilisateurs illimités",
      "Support dédié 7j/7 24h/24",
    ],
    locked: [],
  },
];

const PLANS_MULTI = [
  {
    name: "Multi-Sociétés",
    emoji: "🏢",
    price: 499,
    societes: "3 à 5 sociétés",
    desc: "Pour les entrepreneurs multi-entités",
    color: C.blue,
    modules: [
      "Accès complet dashboard (sauf Club & Prospection)",
      "3 à 5 sociétés distinctes",
      "Vue consolidée Owner",
      "Multi-devises natif (EUR/XOF/AED/USD...)",
      "Connexion bancaire directe (Open Banking)",
      "Équipes séparées par société",
      "Comptabilité & facturation par entité",
      "Trésorerie consolidée",
      "Support prioritaire",
    ],
  },
  {
    name: "Multi-Sociétés Pro",
    emoji: "🏗",
    price: 799,
    societes: "5 à 10 sociétés",
    desc: "Pour les groupes en expansion",
    color: C.orange,
    highlight: true,
    modules: [
      "Tout Multi-Sociétés",
      "5 à 10 sociétés",
      "Rapports consolidés avancés",
      "API dédiée par entité",
      "Analytique multi-entités",
      "Onboarding personnalisé",
      "Support dédié",
    ],
  },
  {
    name: "Holding",
    emoji: "🏛",
    price: 1200,
    societes: "Sociétés illimitées",
    desc: "Pour les holdings et grands groupes",
    color: C.gold,
    modules: [
      "Tout Multi-Sociétés Pro",
      "Sociétés illimitées",
      "Vue holding complète",
      "Consolidation multi-devises automatique",
      "Intercompany transactions",
      "Tableaux de bord par filiale",
      "Support dédié 24h/24",
      "Gestionnaire de compte dédié",
    ],
  },
];

const PLANS_SAAS = [
  {
    name: "White-label Starter",
    emoji: "⚡",
    setup: 5000,
    mensuel: 500,
    desc: "Revendez Xyra sous votre marque",
    color: C.green,
    modules: [
      "Dashboard à votre marque & logo",
      "Jusqu'à 10 clients revendeurs",
      "Domaine personnalisé inclus",
      "Panneau d'administration revendeur",
      "Onboarding clients automatisé",
      "Support technique inclus",
    ],
  },
  {
    name: "White-label Business",
    emoji: "🚀",
    setup: 12000,
    mensuel: 1000,
    desc: "Pour les agences & intégrateurs",
    color: C.gold,
    highlight: true,
    modules: [
      "Tout White-label Starter",
      "Clients illimités",
      "API partenaire complète",
      "Rapports de revenus revendeur",
      "Formation & certification revendeur",
      "Support dédié prioritaire",
      "Co-marketing inclus",
    ],
  },
  {
    name: "White-label Enterprise",
    emoji: "🏆",
    setup: null,
    mensuel: null,
    desc: "Solution sur mesure",
    color: C.purple,
    modules: [
      "Tout White-label Business",
      "Infrastructure dédiée",
      "SLA garanti 99.9%",
      "Développements spécifiques",
      "Intégrations sur mesure",
      "Account manager dédié",
      "Contrat personnalisé",
    ],
  },
];

const MODULES = [
  { icon: "📊", name: "Analytics", price: 19 },
  { icon: "💰", name: "Trésorerie", price: 19 },
  { icon: "🤝", name: "Partenaires", price: 19 },
  { icon: "👥", name: "Équipe", price: 19 },
  { icon: "🎯", name: "Prospection IA", price: 29 },
  { icon: "✒", name: "Signature", price: 19 },
  { icon: "🏢", name: "Club d'affaires", price: 19 },
  { icon: "📦", name: "Stock", price: 14 },
  { icon: "📅", name: "Planning", price: 14 },
  { icon: "🔔", name: "Notifications", price: 9 },
];

const FAQ = [
  { q: "Est-ce que je peux changer de plan ?", r: "Oui, vous pouvez upgrader ou downgrader à tout moment. Le changement prend effet immédiatement." },
  { q: "Y a-t-il un engagement ?", r: "Non, Xyra est sans engagement. Vous pouvez annuler à tout moment depuis votre dashboard." },
  { q: "Les 14 jours d'essai sont vraiment gratuits ?", r: "Oui, aucune carte bancaire requise pour démarrer. Vous activez le paiement uniquement si vous souhaitez continuer." },
  { q: "L'agent IA parle en mon nom ?", r: "Oui ! L'agent vocal Vapi et le bot WhatsApp sont entièrement personnalisés à votre nom, secteur et services." },
  { q: "Puis-je ajouter des modules individuellement ?", r: "Oui, sur les plans Starter et Business Pro vous pouvez ajouter des modules à la carte à partir de 9€/mois." },
  { q: "Quels moyens de paiement acceptez-vous ?", r: "Carte bancaire internationale, virement SEPA, Wave, Orange Money, MTN Mobile Money — pour toute l'Afrique et l'Europe." },
  { q: "Le plan Multi-Sociétés inclut-il le Bot WhatsApp ?", r: "Non, le bot WhatsApp et la prospection IA sont exclusifs aux plans Enterprise et au-dessus. Le Multi-Sociétés inclut tout le reste du dashboard." },
  { q: "Comment fonctionne le déploiement SaaS ?", r: "Vous revendez Xyra sous votre propre marque avec votre logo et domaine. Vos clients accèdent à leur dashboard personnalisé, vous gérez tout depuis votre panneau revendeur." },
];

const ss = (obj: object) => obj as React.CSSProperties;

export default function Pricing() {
  const [billing, setBilling] = useState<"month" | "year">("month");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [section, setSection] = useState<"solo" | "multi" | "saas">("solo");

  return (
    <div style={{ fontFamily: "'Segoe UI', Georgia, sans-serif", background: C.dark, color: C.text, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade { animation: fadeUp 0.6s ease forwards; }
        a:hover { opacity: 0.85; }
      `}</style>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(10px)", zIndex: 100 }}>
        <a href="/" style={{ fontSize: 22, fontWeight: 300, color: C.gold, textDecoration: "none", fontFamily: "Cormorant Garamond, Georgia, serif", letterSpacing: "0.1em" }}>XYRA</a>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="/inscription" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, textDecoration: "none" }}>Connexion</a>
          <a href="/inscription" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, background: C.gold, color: "#000", padding: "8px 20px", textDecoration: "none", fontWeight: 600 }}>Essai gratuit →</a>
        </div>
      </nav>

      {/* HERO */}
      <div className="fade" style={{ textAlign: "center", padding: "80px 24px 48px" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>Tarifs transparents · Sans engagement</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 16 }}>
          Un plan pour <em style={{ color: C.gold, fontStyle: "italic" }}>chaque ambition</em>
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: C.muted, marginBottom: 40, maxWidth: 520, margin: "0 auto 40px" }}>
          Solo, multi-sociétés ou revendeur — Xyra s'adapte à votre structure.
        </p>

        {/* Toggle mensuel/annuel */}
        <div style={{ display: "inline-flex", background: C.card, border: `1px solid ${C.border}`, borderRadius: 100, padding: 4, gap: 4, marginBottom: 40 }}>
          {(["month", "year"] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ background: billing === b ? C.gold : "transparent", color: billing === b ? "#000" : C.muted, border: "none", borderRadius: 100, padding: "8px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>
              {b === "month" ? "Mensuel" : "Annuel"}
            </button>
          ))}
        </div>

        {/* Section switcher */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "solo", label: "🏠 1 Société", desc: "Starter · Business · Enterprise" },
            { key: "multi", label: "🏢 Multi-Sociétés", desc: "499€ · 799€ · 1 200€" },
            { key: "saas", label: "🚀 Déploiement SaaS", desc: "White-label revendeur" },
          ].map(s => (
            <button key={s.key} onClick={() => setSection(s.key as any)} style={{ background: section === s.key ? `${C.gold}15` : "transparent", border: `1px solid ${section === s.key ? C.gold : C.border}`, borderRadius: 10, padding: "12px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left", transition: "all 0.2s" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: section === s.key ? C.gold : C.text }}>{s.label}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION 1 SOCIÉTÉ ── */}
      {section === "solo" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {PLANS_SOLO.map((plan, i) => (
            <div key={i} className="fade" style={{ background: plan.highlight ? `linear-gradient(135deg, ${C.card}, #0a1a0f)` : C.card, border: `1px solid ${plan.highlight ? C.gold + "44" : C.border}`, borderRadius: 16, padding: 28, position: "relative", animationDelay: `${i * 0.1}s` }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.gold, color: "#000", fontSize: 10, fontWeight: 700, padding: "4px 16px", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                  ⭐ Recommandé
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>{plan.emoji} {plan.name}</div>
                <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 52, fontWeight: 300, color: plan.highlight ? C.gold : C.text, lineHeight: 1 }}>
                  {plan.price}€
                  <span style={{ fontSize: 14, fontWeight: 300, color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>/mois</span>
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, marginTop: 8 }}>{plan.desc}</div>
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 20 }}>
                {plan.modules.map((m, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.text, marginBottom: 10 }}>
                    <span style={{ color: plan.color, flexShrink: 0 }}>◆</span>{m}
                  </div>
                ))}
                {plan.locked.map((m, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, marginBottom: 10 }}>
                    <span style={{ flexShrink: 0 }}>🔒</span>{m}
                  </div>
                ))}
              </div>
              <a href="/inscription" style={{ display: "block", textAlign: "center", background: plan.highlight ? C.gold : "transparent", color: plan.highlight ? "#000" : C.gold, border: `1px solid ${plan.highlight ? C.gold : C.gold + "44"}`, padding: "14px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "all 0.2s" }}>
                {plan.highlight ? "Commencer gratuitement →" : "Démarrer →"}
              </a>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted, textAlign: "center", marginTop: 10 }}>
                14 jours gratuits · Sans carte bancaire
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SECTION MULTI-SOCIÉTÉS ── */}
      {section === "multi" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Unique sur le marché</div>
            <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 300, marginBottom: 12 }}>
              Gérez <em style={{ color: C.gold }}>plusieurs sociétés</em> depuis un seul outil
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.muted, maxWidth: 600, margin: "0 auto" }}>
              Une seule connexion, toutes vos entités séparées et une vue consolidée — ce qu'aucun outil PME ne proposait jusqu'ici à ce tarif.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {PLANS_MULTI.map((plan, i) => (
              <div key={i} className="fade" style={{ background: plan.highlight ? `linear-gradient(135deg, ${C.card}, #0a0f1a)` : C.card, border: `1px solid ${plan.highlight ? plan.color + "66" : C.border}`, borderRadius: 16, padding: 28, position: "relative", animationDelay: `${i * 0.1}s` }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#000", fontSize: 10, fontWeight: 700, padding: "4px 16px", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                    ⭐ Recommandé
                  </div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{plan.emoji} {plan.name}</div>
                  <div style={{ fontSize: 11, color: plan.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 8 }}>{plan.societes}</div>
                  <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 52, fontWeight: 300, color: plan.color, lineHeight: 1 }}>
                    {plan.price}€
                    <span style={{ fontSize: 14, fontWeight: 300, color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>/mois</span>
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, marginTop: 8 }}>{plan.desc}</div>
                </div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 20 }}>
                  {plan.modules.map((m, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.text, marginBottom: 10 }}>
                      <span style={{ color: plan.color, flexShrink: 0 }}>◆</span>{m}
                    </div>
                  ))}
                </div>
                <a href="/inscription" style={{ display: "block", textAlign: "center", background: plan.highlight ? plan.color : "transparent", color: plan.highlight ? "#000" : plan.color, border: `1px solid ${plan.highlight ? plan.color : plan.color + "44"}`, padding: "14px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                  Démarrer →
                </a>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted, textAlign: "center", marginTop: 10 }}>
                  14 jours gratuits · Sans carte bancaire
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION DÉPLOIEMENT SAAS ── */}
      {section === "saas" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Devenez revendeur Xyra</div>
            <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 300, marginBottom: 12 }}>
              Revendez Xyra sous <em style={{ color: C.gold }}>votre propre marque</em>
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.muted, maxWidth: 600, margin: "0 auto" }}>
              Votre logo, votre domaine, vos clients — Xyra devient votre outil SaaS en marque blanche. Générez des revenus récurrents en proposant Xyra à vos clients.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {PLANS_SAAS.map((plan, i) => (
              <div key={i} className="fade" style={{ background: plan.highlight ? `linear-gradient(135deg, ${C.card}, #0a1a0a)` : C.card, border: `1px solid ${plan.highlight ? plan.color + "66" : C.border}`, borderRadius: 16, padding: 28, position: "relative", animationDelay: `${i * 0.1}s` }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#000", fontSize: 10, fontWeight: 700, padding: "4px 16px", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                    ⭐ Le plus populaire
                  </div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>{plan.emoji} {plan.name}</div>
                  {plan.setup !== null ? (
                    <>
                      <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 36, fontWeight: 300, color: plan.color, lineHeight: 1, marginBottom: 4 }}>
                        {plan.setup?.toLocaleString("fr")}€
                        <span style={{ fontSize: 14, fontWeight: 300, color: C.muted, fontFamily: "'DM Sans', sans-serif" }}> setup</span>
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: C.text, fontWeight: 600 }}>
                        + {plan.mensuel?.toLocaleString("fr")}€
                        <span style={{ fontSize: 13, color: C.muted, fontWeight: 300 }}>/mois</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 36, fontWeight: 300, color: plan.color, lineHeight: 1 }}>
                      Sur devis
                    </div>
                  )}
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, marginTop: 8 }}>{plan.desc}</div>
                </div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 20 }}>
                  {plan.modules.map((m, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.text, marginBottom: 10 }}>
                      <span style={{ color: plan.color, flexShrink: 0 }}>◆</span>{m}
                    </div>
                  ))}
                </div>
                <a href={plan.setup === null ? "https://wa.me/33765189527" : "/inscription"} style={{ display: "block", textAlign: "center", background: plan.highlight ? plan.color : "transparent", color: plan.highlight ? "#000" : plan.color, border: `1px solid ${plan.highlight ? plan.color : plan.color + "44"}`, padding: "14px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                  {plan.setup === null ? "Nous contacter →" : "Démarrer →"}
                </a>
              </div>
            ))}
          </div>

          {/* Avantages revendeur */}
          <div style={{ marginTop: 40, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 24, fontWeight: 300, marginBottom: 8 }}>Pourquoi devenir revendeur Xyra ?</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[
                { icon: "💰", titre: "Revenus récurrents", desc: "Facturez vos clients mensuellement et générez un MRR stable" },
                { icon: "🎨", titre: "Votre marque", desc: "Logo, couleurs, domaine — 100% à votre image" },
                { icon: "🌍", titre: "Multi-devises natif", desc: "Encaissez en EUR, XOF, AED, USD sans friction" },
                { icon: "🤖", titre: "IA incluse", desc: "Claude IA, bot WhatsApp, agent vocal — tout inclus" },
              ].map((a, i) => (
                <div key={i} style={{ textAlign: "center", padding: "16px 12px" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: C.gold, marginBottom: 6 }}>{a.titre}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULES À LA CARTE */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Flexibilité totale</div>
            <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 300 }}>
              Modules <em style={{ color: C.gold }}>à la carte</em>
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.muted, marginTop: 12 }}>
              Ajoutez uniquement les modules dont vous avez besoin sur les plans Starter et Business Pro.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {MODULES.map((m, i) => (
              <div key={i} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span>{m.icon}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{m.name}</span>
                </div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: C.gold }}>{m.price}€</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPARATIF RAPIDE */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 300 }}>
            Quelle offre <em style={{ color: C.gold }}>vous correspond ?</em>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {[
            { profil: "🧑‍💼 Entrepreneur solo", plan: "Starter ou Business Pro", prix: "59€ – 129€/mois", desc: "Vous avez une société et voulez automatiser votre gestion" },
            { profil: "🏢 Entrepreneur multi-sociétés", plan: "Multi-Sociétés", prix: "À partir de 499€/mois", desc: "Vous gérez 2 sociétés ou plus et voulez tout centraliser" },
            { profil: "🏛 Holding / Grand groupe", plan: "Holding", prix: "1 200€/mois", desc: "Vous avez une structure holding et voulez la vue consolidée complète" },
            { profil: "🚀 Agence / Revendeur", plan: "White-label", prix: "À partir de 5 000€ + 500€/mois", desc: "Vous voulez revendre Xyra sous votre marque à vos clients" },
          ].map((p, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{p.profil}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.gold, fontWeight: 600, marginBottom: 4 }}>{p.plan}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>{p.prix}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "64px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 300, textAlign: "center", marginBottom: 40 }}>
            Questions <em style={{ color: C.gold }}>fréquentes</em>
          </h2>
          {FAQ.map((f, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${C.border}`, overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", background: "transparent", border: "none", color: C.text, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, textAlign: "left", gap: 12 }}>
                <span>{f.q}</span>
                <span style={{ color: C.gold, fontSize: 18, flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, paddingBottom: 18, lineHeight: 1.7 }}>{f.r}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(32px,5vw,58px)", fontWeight: 300, marginBottom: 16 }}>
          Prêt à <em style={{ color: C.gold }}>démarrer ?</em>
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: C.muted, marginBottom: 32 }}>
          14 jours gratuits · Sans carte bancaire · Annulez à tout moment
        </p>
        <a href="/inscription" style={{ display: "inline-block", background: C.gold, color: "#000", padding: "16px 48px", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em" }}>
          Créer mon compte gratuitement →
        </a>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 18, color: C.gold }}>XYRA</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted }}>© 2025 Xyra · Tous droits réservés</div>
        <div style={{ display: "flex", gap: 20 }}>
          {["CGV", "Confidentialité", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </div>
    </div>
  );
}