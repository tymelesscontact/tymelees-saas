"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const C = {
  dark: "#06060E", card: "#0C0C1A", card2: "#121222",
  border: "#1E1E36", gold: "#C9A84C", text: "#EAE6DE",
  muted: "#5A5A7A",
};

export default function MarketplacePage() {
  const [commercants, setCommercants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");

  useEffect(() => {
    fetch("/api/boutique?action=liste")
      .then((r) => r.json())
      .then((data) => {
        setCommercants(data.commercants || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtres = commercants.filter((c) =>
    !recherche || c.nom.toLowerCase().includes(recherche.toLowerCase()) || (c.metier || "").toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.text, fontFamily: "sans-serif" }}>
      <div style={{ padding: "40px 24px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Xyra Marketplace</div>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 300, marginBottom: 20 }}>
          Tous les commerçants <em style={{ color: C.gold }}>près de chez vous</em>
        </h1>
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="🔍 Rechercher un commerçant, un métier..."
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", color: C.text, width: "100%", maxWidth: 420, fontSize: 14 }}
        />
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: C.muted, padding: 40 }}>Chargement...</div>
        ) : filtres.length === 0 ? (
          <div style={{ textAlign: "center", color: C.muted, padding: 40, fontSize: 13 }}>
            Aucun commerçant disponible pour le moment. Revenez bientôt !
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
            {filtres.map((c) => (
              <Link key={c.id} href={`/boutique/${c.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: "pointer", transition: "border-color 0.2s" }}>
                  {c.logo_url ? (
                    <img src={c.logo_url} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", marginBottom: 12 }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 10, background: C.card2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 12 }}>🏪</div>
                  )}
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{c.nom}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{c.metier || "Commerçant"} {c.pays ? `· ${c.pays}` : ""}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
