"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function BoutiquePublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [company, setCompany] = useState<any>(null);
  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [panier, setPanier] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    fetch(`/api/boutique?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setErreur(data.error);
        } else {
          setCompany(data.company);
          setProduits(data.produits);
        }
        setLoading(false);
      })
      .catch(() => {
        setErreur("Erreur de chargement");
        setLoading(false);
      });
  }, [slug]);

  const ajouterAuPanier = (id: string) => {
    setPanier((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));
  };
  const retirerDuPanier = (id: string) => {
    setPanier((p) => {
      const copie = { ...p };
      if (copie[id] > 1) copie[id]--;
      else delete copie[id];
      return copie;
    });
  };
  const totalArticles = Object.values(panier).reduce((a, n) => a + n, 0);
  const totalPrix = produits.reduce((a, p) => a + (panier[p.id] || 0) * Number(p.prix_vente), 0);

  const C = {
    dark: "#06060E", card: "#0C0C1A", card2: "#121222",
    border: "#1E1E36", gold: "#C9A84C", text: "#EAE6DE",
    muted: "#5A5A7A", green: "#2EC9B0", red: "#FF5252",
  };

  if (loading) return <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: "sans-serif" }}>Chargement...</div>;
  if (erreur || !company) return <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: C.red, fontFamily: "sans-serif" }}>{erreur || "Boutique introuvable"}</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.text, fontFamily: "sans-serif", paddingBottom: totalArticles > 0 ? 90 : 20 }}>
      <div style={{ padding: "32px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
        {company.logo_url && <img src={company.logo_url} alt="" style={{ height: 48, borderRadius: 8 }} />}
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{company.nom}</div>
          <div style={{ fontSize: 12, color: C.muted }}>Boutique en ligne</div>
        </div>
      </div>

      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14, maxWidth: 1100, margin: "0 auto" }}>
        {produits.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Aucun produit disponible pour le moment.</div>}
        {produits.map((p) => (
          <div key={p.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            {p.photo_url ? <img src={p.photo_url} alt="" style={{ width: "100%", height: 140, objectFit: "cover" }} /> : <div style={{ width: "100%", height: 140, background: C.card2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📦</div>}
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{p.nom}</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{p.marque}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 10 }}>{Number(p.prix_vente).toFixed(2)} €</div>
              {panier[p.id] ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                  <button onClick={() => retirerDuPanier(p.id)} style={{ background: C.card2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, width: 30, height: 30, cursor: "pointer" }}>−</button>
                  <span>{panier[p.id]}</span>
                  <button onClick={() => ajouterAuPanier(p.id)} style={{ background: C.gold, border: "none", color: "#000", borderRadius: 6, width: 30, height: 30, cursor: "pointer" }}>+</button>
                </div>
              ) : (
                <button onClick={() => ajouterAuPanier(p.id)} style={{ width: "100%", background: C.gold, border: "none", color: "#000", borderRadius: 6, padding: "8px", fontWeight: 700, cursor: "pointer" }}>Ajouter au panier</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalArticles > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.card, borderTop: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13 }}>{totalArticles} article(s) — <strong style={{ color: C.gold }}>{totalPrix.toFixed(2)} €</strong></div>
          <button style={{ background: C.gold, border: "none", color: "#000", borderRadius: 6, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>Commander →</button>
        </div>
      )}
    </div>
  );
}
