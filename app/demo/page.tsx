"use client";
import { useState, useEffect } from "react";

const STEPS = [
  {
    id: "accueil",
    titre: "🏠 Tableau de bord",
    desc: "Vue d'ensemble de toute votre activité en temps réel. Score business, CA du mois, priorités du jour générées par l'IA.",
    duree: 6,
  },
  {
    id: "wallet",
    titre: "💳 Wallet & Paiements",
    desc: "Encaissez partout dans le monde — Wave, Orange Money, MTN, Visa, SEPA. Toutes vos transactions en un seul endroit.",
    duree: 5,
  },
  {
    id: "devis",
    titre: "◧ Devis",
    desc: "Créez un devis professionnel en 30 secondes. Envoyez par WhatsApp, obtenez une signature électronique, encaissez en 1 clic.",
    duree: 5,
  },
  {
    id: "clients",
    titre: "◬ Clients",
    desc: "Fiches clients complètes avec score de solvabilité, historique, tunnel de vente et upsell automatique par l'IA.",
    duree: 5,
  },
  {
    id: "crm",
    titre: "📋 Deals & Pipeline",
    desc: "Pipeline Kanban visuel. L'IA calcule la probabilité de closing et vous recommande les meilleures actions.",
    duree: 5,
  },
  {
    id: "planning",
    titre: "⊡ Planning",
    desc: "Planifiez vos missions, gérez votre équipe, suivez les interventions en temps réel avec géolocalisation.",
    duree: 5,
  },
  {
    id: "partenaires",
    titre: "⬡ Partenaires & AA",
    desc: "Gérez vos apporteurs d'affaires, suivez leurs commissions, analysez leurs performances avec l'IA.",
    duree: 5,
  },
  {
    id: "analytique",
    titre: "◒ Analytique & CA",
    desc: "Prévisions IA mois par mois, analyse des tendances, objectifs et rapports automatiques par email.",
    duree: 5,
  },
  {
    id: "prospection",
    titre: "⊕ Prospection IA",
    desc: "59 fonctionnalités de prospection automatique. Base SIRENE, bot WhatsApp, séquences multi-canal.",
    duree: 5,
  },
  {
    id: "notifications",
    titre: "🔔 Notifications",
    desc: "Alertes temps réel, notifications WhatsApp automatiques, popups configurables par type d'événement.",
    duree: 4,
  },
];

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = STEPS[step];
  const dashboardUrl = "/dashboard";

  useEffect(() => {
    if (!playing || finished) return;
    const duree = current.duree * 1000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min((elapsed / duree) * 100, 100));

      if (elapsed >= duree) {
        clearInterval(timer);
        if (step < STEPS.length - 1) {
          setStep(s => s + 1);
          setProgress(0);
        } else {
          setFinished(true);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [step, playing, finished]);

  const goTo = (i: number) => {
    setStep(i);
    setProgress(0);
    setFinished(false);
    setPlaying(true);
  };

  const iframeUrl = `${dashboardUrl}?demo=true&page=${current.id}`;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06060E",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#EAE6DE",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        background: "#0C0C1A",
        borderBottom: "1px solid #1E1E36",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/" style={{ color: "#C9A84C", textDecoration: "none", fontSize: 18, fontWeight: 700, letterSpacing: "0.1em" }}>XYRA</a>
          <span style={{ color: "#5A5A7A", fontSize: 12 }}>· Démonstration interactive</span>
        </div>
        <a href="/inscription" style={{
          background: "#C9A84C",
          color: "#000",
          padding: "8px 20px",
          borderRadius: 6,
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 700,
        }}>🚀 Commencer gratuitement — 14j</a>
      </div>

      {/* Barre de progression globale */}
      <div style={{ height: 3, background: "#1E1E36", flexShrink: 0 }}>
        <div style={{
          height: "100%",
          width: `${((step + progress / 100) / STEPS.length) * 100}%`,
          background: "linear-gradient(90deg, #C9A84C, #E8D5A3)",
          transition: "width 0.1s linear",
        }} />
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Sidebar étapes */}
        <div style={{
          width: 260,
          background: "#0C0C1A",
          borderRight: "1px solid #1E1E36",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflowY: "auto",
        }}>
          <div style={{ padding: "16px 14px 8px", fontSize: 10, color: "#5A5A7A", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Modules — {step + 1}/{STEPS.length}
          </div>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: i === step ? `rgba(201,168,76,0.12)` : "transparent",
              borderLeft: `3px solid ${i === step ? "#C9A84C" : i < step ? "#2EC9B0" : "transparent"}`,
              border: "none",
              borderBottom: "1px solid #1E1E3622",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              fontFamily: "inherit",
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: i < step ? "#2EC9B0" : i === step ? "#C9A84C" : "#1E1E36",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: i <= step ? "#000" : "#5A5A7A",
                flexShrink: 0,
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: i === step ? 700 : 400,
                color: i === step ? "#C9A84C" : i < step ? "#2EC9B0" : "#8080A0",
              }}>{s.titre}</span>
            </button>
          ))}
          <div style={{ padding: 14, marginTop: "auto", borderTop: "1px solid #1E1E36" }}>
            <a href="/inscription" style={{
              display: "block",
              background: "#C9A84C",
              color: "#000",
              textAlign: "center",
              padding: "10px",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 700,
            }}>Commencer gratuitement →</a>
          </div>
        </div>

        {/* Zone principale */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Bulle explicative */}
          <div style={{
            background: "#0C0C1A",
            borderBottom: "1px solid #1E1E36",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexShrink: 0,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#C9A84C", marginBottom: 4 }}>{current.titre}</div>
              <div style={{ fontSize: 13, color: "#A0A0C0", lineHeight: 1.6 }}>{current.desc}</div>
              {/* Barre progression étape */}
              <div style={{ height: 3, background: "#1E1E36", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "#C9A84C", borderRadius: 2, transition: "width 0.1s linear" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => goTo(Math.max(0, step - 1))} style={{ background: "#1E1E36", color: "#EAE6DE", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← Préc.</button>
              <button onClick={() => setPlaying(p => !p)} style={{ background: playing ? "#C9A84C22" : "#2EC9B022", color: playing ? "#C9A84C" : "#2EC9B0", border: `1px solid ${playing ? "#C9A84C44" : "#2EC9B044"}`, borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                {playing ? "⏸ Pause" : "▶ Play"}
              </button>
              <button onClick={() => goTo(Math.min(STEPS.length - 1, step + 1))} style={{ background: "#1E1E36", color: "#EAE6DE", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Suiv. →</button>
            </div>
          </div>

          {/* Iframe du vrai dashboard */}
          {!finished ? (
            <iframe
              src="/dashboard"
              style={{ flex: 1, border: "none", width: "100%", pointerEvents: "none" }}
              title="Xyra Dashboard Demo"
            />
          ) : (
            /* Écran de fin */
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#C9A84C", fontFamily: "Georgia, serif" }}>Vous avez vu tout Xyra !</div>
              <div style={{ fontSize: 15, color: "#A0A0C0", maxWidth: 500, lineHeight: 1.7 }}>
                {STEPS.length} modules puissants pour gérer toute votre entreprise. Rejoignez les entrepreneurs qui font confiance à Xyra.
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 16 }}>
                <a href="/inscription" style={{ background: "#C9A84C", color: "#000", padding: "14px 32px", borderRadius: 8, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>🚀 Commencer gratuitement — 14 jours</a>
                <button onClick={() => goTo(0)} style={{ background: "transparent", color: "#C9A84C", border: "1px solid #C9A84C44", padding: "14px 32px", borderRadius: 8, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>🔄 Revoir la démo</button>
              </div>
              <div style={{ fontSize: 12, color: "#5A5A7A", marginTop: 8 }}>Sans carte bancaire · Sans engagement · Accès immédiat</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}