"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "starter";
  const email = searchParams.get("email") || "";
  const societe = searchParams.get("societe") || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PLANS: Record<string, { nom: string; prix: string; couleur: string; features: string[] }> = {
    starter:   { nom: "Starter",      prix: "59€/mois",  couleur: "#4B7BFF", features: ["Wallet & Paiements","Cartes virtuelles","CRM","Devis","Facturation électronique"] },
    business:  { nom: "Business Pro", prix: "129€/mois", couleur: "#C9A84C", features: ["Tout Starter +","Suite complète métier","Équipe & RH","Prospection Auto","Analytique & Trésorerie"] },
    enterprise:{ nom: "Enterprise",   prix: "249€/mois", couleur: "#9B5FFF", features: ["Tout Business Pro +","Bot WhatsApp IA","API complète","Déploiement SaaS","Support 24h dédié"] },
  };

  const planData = PLANS[plan] || PLANS.starter;

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email, societe }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Erreur lors de la création du paiement");
      }
    } catch (e) {
      setError("Erreur de connexion");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", color: "#f0ead6", padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        .btn-pay { background: linear-gradient(135deg, ${planData.couleur}, ${planData.couleur}CC); color: #000; border: none; padding: 16px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; width: 100%; border-radius: 8px; letter-spacing: 0.04em; transition: all 0.3s; }
        .btn-pay:hover { box-shadow: 0 8px 28px ${planData.couleur}55; transform: translateY(-1px); }
        .btn-pay:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: "0.15em", color: "#C9A84C" }}>XYRA</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.4)", letterSpacing: "0.1em", marginTop: 6 }}>ACTIVATION DE VOTRE ABONNEMENT</div>
        </div>

        {/* Plan card */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: `2px solid ${planData.couleur}44`, borderRadius: 16, padding: "32px", marginBottom: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "rgba(240,234,214,0.5)", marginBottom: 8 }}>Plan sélectionné</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: planData.couleur, marginBottom: 4 }}>{planData.nom}</div>
            <div style={{ fontSize: 36, fontWeight: 300, color: "#f0ead6" }}>{planData.prix}</div>
          </div>

          {/* Features */}
          <div style={{ marginBottom: 24 }}>
            {planData.features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.7)" }}>
                <span style={{ color: planData.couleur, fontSize: 16 }}>✓</span>
                {f}
              </div>
            ))}
          </div>

          {/* Client info */}
          {societe && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ fontSize: 11, color: "rgba(240,234,214,0.4)", marginBottom: 4 }}>COMPTE</div>
              <div style={{ fontSize: 14, color: "#f0ead6" }}>{decodeURIComponent(societe)}</div>
              <div style={{ fontSize: 12, color: "rgba(240,234,214,0.5)" }}>{email}</div>
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#FF5252" }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn-pay" onClick={handlePay} disabled={loading}>
            {loading ? "Redirection vers le paiement..." : `💳 Payer ${planData.prix} — Stripe sécurisé`}
          </button>

          <div style={{ textAlign: "center", marginTop: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(240,234,214,0.3)" }}>
            🔒 Paiement sécurisé · Sans engagement · Résiliation à tout moment
          </div>
        </div>

        {/* Support */}
        <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.4)" }}>
          Des questions ? <a href="https://wa.me/33765189527" style={{ color: "#C9A84C", textDecoration: "none" }}>💬 WhatsApp Xyra</a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C", fontFamily: "Georgia, serif", fontSize: 24 }}>XYRA</div>}>
      <PaymentContent />
    </Suspense>
  );
}