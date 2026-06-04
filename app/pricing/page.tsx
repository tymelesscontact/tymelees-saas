"use client";
import { useState } from "react";

const C = {
  dark: "#0a0a0a", card: "#0f0f0f", card2: "#141414",
  border: "#1a1a1a", gold: "#c9a96e", text: "#f0ead6",
  muted: "rgba(240,234,214,0.4)", green: "#2EC9B0",
};

const PLANS = [
  {
    name: "Starter",
    emoji: "🌱",
    price: { month: 59, year: 49 },
    desc: "Idéal pour démarrer",
    color: C.green,
    modules: ["Wallet & paiements", "CRM clients", "Devis & facturation", "Cartes virtuelles", "Support WhatsApp"],
    locked: ["Analytics avancés", "Bot WhatsApp IA", "Agent vocal Vapi", "Prospection IA"],
  },
  {
    name: "Business Pro",
    emoji: "🚀",
    price: { month: 129, year: 99 },
    desc: "Pour les équipes en croissance",
    color: C.gold,
    highlight: true,
    modules: ["Tout Starter", "Planning & missions", "Gestion équipe", "Partenaires & commissions", "Stock & services", "Club d'affaires", "Analytics complets", "Signature électronique"],
    locked: ["Bot WhatsApp IA", "Agent vocal Vapi", "Prospection IA"],
  },
  {
    name: "Enterprise",
    emoji: "💎",
    price: { month: 249, year: 199 },
    desc: "Grandes structures & agences",
    color: "#9B5FFF",
    modules: ["Tout Business Pro", "Bot WhatsApp IA", "Agent vocal Vapi IA", "Prospection automatique", "Déploiement SaaS", "API complète", "Utilisateurs illimités", "Support dédié 7j/7"],
    locked: [],
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
  { q: "L'agent IA parle en mon nom ?", r: "Oui ! L'agent vocal Vapi et l'agent mailing Relevance AI sont entièrement personnalisés à votre nom, secteur et services." },
  { q: "Puis-je ajouter des modules individuellement ?", r: "Oui, sur les plans Starter et Business Pro vous pouvez ajouter des modules à la carte à partir de 9€/mois." },
  { q: "Quels moyens de paiement acceptez-vous ?", r: "Carte bancaire internationale, virement SEPA, Wave, Orange Money, MTN Mobile Money — pour toute l'Afrique et l'Europe." },
];

export default function Pricing() {
  const [billing, setBilling] = useState<"month" | "year">("month");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Segoe UI', Georgia, sans-serif", background: C.dark, color: C.text, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade { animation: fadeUp 0.6s ease forwards; }
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
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: C.muted, marginBottom: 36, maxWidth: 520, margin: "0 auto 36px" }}>
          Gérez votre activité, automatisez votre prospection et encaissez partout dans le monde.
        </p>

        {/* Toggle */}
        <div style={{ display: "inline-flex", background: C.card, border: `1px solid ${C.border}`, borderRadius: 100, padding: 4, gap: 4 }}>
          {(["month", "year"] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ background: billing === b ? C.gold : "transparent", color: billing === b ? "#000" : C.muted, border: "none", borderRadius: 100, padding: "8px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>
              {b === "month" ? "Mensuel" : "Annuel"}{b === "year" && <span style={{ marginLeft: 6, fontSize: 10, background: "#2EC9B022", color: C.green, padding: "2px 6px", borderRadius: 100 }}>-20%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* PLANS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {PLANS.map((plan, i) => (
          <div key={i} className="fade" style={{ background: plan.highlight ? `linear-gradient(135deg, ${C.card}, #0a1a0f)` : C.card, border: `1px solid ${plan.highlight ? C.gold + "44" : C.border}`, borderRadius: 16, padding: 28, position: "relative", animationDelay: `${i * 0.1}s` }}>
            {plan.highlight && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.gold, color: "#000", fontSize: 10, fontWeight: 700, padding: "4px 16px", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                ⭐ Recommandé
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>{plan.emoji} {plan.name}</div>
              <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 52, fontWeight: 300, color: plan.highlight ? C.gold : C.text, lineHeight: 1 }}>
                {plan.price[billing]}€
                <span style={{ fontSize: 14, fontWeight: 300, color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>/mois</span>
              </div>
              {billing === "year" && (
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.green, marginTop: 4 }}>
                  ✓ Économisez {(plan.price.month - plan.price.year) * 12}€/an
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

      {/* AGENTS IA */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Exclusif Enterprise</div>
          <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 300 }}>
            Agents IA <em style={{ color: C.gold }}>personnalisés</em>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.muted, marginTop: 12, maxWidth: 520, margin: "12px auto 0" }}>
            Vos agents IA parlent en votre nom, s'adaptent à votre secteur et prospectent 24h/24 à votre place.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { icon: "🎙", name: "Agent Vocal IA", sub: "Vapi", desc: "Appelle vos prospects automatiquement, se présente en votre nom, qualifie les besoins et prend des RDV.", color: "#9B5FFF" },
            { icon: "📧", name: "Agent Mailing IA", sub: "Relevance AI", desc: "Envoie des séquences email ultra-personnalisées à votre secteur. Taux d'ouverture 3x supérieur.", color: C.gold },
          ].map((a, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${a.color}33`, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{a.icon}</div>
              <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 22, fontWeight: 400, color: a.color, marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: C.muted, marginBottom: 12 }}>Propulsé par {a.sub}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{a.desc}</div>
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