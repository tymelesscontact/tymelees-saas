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
  const [showCheckout, setShowCheckout] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [adresse, setAdresse] = useState("");
  const [commandeEnCours, setCommandeEnCours] = useState(false);
  const [erreurCommande, setErreurCommande] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authNom, setAuthNom] = useState("");
  const [authErreur, setAuthErreur] = useState("");
  const [authEnCours, setAuthEnCours] = useState(false);
  const [showCommandes, setShowCommandes] = useState(false);
  const [mesCommandes, setMesCommandes] = useState<any[]>([]);

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

  const getSb = async () => {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
  };

  useEffect(() => {
    (async () => {
      const sbc = await getSb();
      const { data } = await sbc.auth.getSession();
      if (data.session?.user) setUser(data.session.user);
    })();
  }, []);

  const signup = async () => {
    if (!authNom || !authEmail || !authPassword) { setAuthErreur("Tous les champs sont requis"); return; }
    setAuthEnCours(true);
    setAuthErreur("");
    try {
      const sbc = await getSb();
      const { data, error } = await sbc.auth.signUp({ email: authEmail, password: authPassword, options: { data: { nom: authNom } } });
      if (error) { setAuthErreur(error.message); setAuthEnCours(false); return; }
      if (data.user) setUser(data.user);
      setShowAuth(false);
      setNom(authNom);
      setEmail(authEmail);
    } catch (e) {
      setAuthErreur("Erreur de connexion");
    }
    setAuthEnCours(false);
  };

  const login = async () => {
    if (!authEmail || !authPassword) { setAuthErreur("Email et mot de passe requis"); return; }
    setAuthEnCours(true);
    setAuthErreur("");
    try {
      const sbc = await getSb();
      const { data, error } = await sbc.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) { setAuthErreur(error.message); setAuthEnCours(false); return; }
      if (data.user) {
        setUser(data.user);
        setEmail(data.user.email || "");
        setNom(data.user.user_metadata?.nom || "");
      }
      setShowAuth(false);
    } catch (e) {
      setAuthErreur("Erreur de connexion");
    }
    setAuthEnCours(false);
  };

  const loginGoogle = async () => {
    const sbc = await getSb();
    await sbc.auth.signInWithOAuth({ provider: "google", options: { redirectTo: typeof window !== "undefined" ? window.location.href : undefined } });
  };

  const logout = async () => {
    const sbc = await getSb();
    await sbc.auth.signOut();
    setUser(null);
  };

  const ouvrirMesCommandes = async () => {
    if (!user) return;
    setShowCommandes(true);
    try {
      const sbc = await getSb();
      const { data } = await sbc.from("commandes").select("*").eq("client_user_id", user.id).order("created_at", { ascending: false });
      setMesCommandes(data || []);
    } catch (e) { console.error(e); }
  };

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

  const passerCommande = async () => {
    if (!nom || !email) { setErreurCommande("Nom et email requis"); return; }
    setCommandeEnCours(true);
    setErreurCommande("");
    try {
      const items = produits
        .filter((p) => panier[p.id])
        .map((p) => ({ produit_id: p.id, nom: p.nom, prix: Number(p.prix_vente), quantite: panier[p.id] }));
      const res = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, client_nom: nom, client_email: email, client_tel: tel, client_adresse: adresse, items }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErreurCommande(data.error || "Erreur lors de la commande");
        setCommandeEnCours(false);
      }
    } catch (e) {
      setErreurCommande("Erreur de connexion");
      setCommandeEnCours(false);
    }
  };

  const C = {
    dark: "#06060E", card: "#0C0C1A", card2: "#121222",
    border: "#1E1E36", gold: "#C9A84C", text: "#EAE6DE",
    muted: "#5A5A7A", green: "#2EC9B0", red: "#FF5252",
  };

  if (loading) return <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: "sans-serif" }}>Chargement...</div>;
  if (erreur || !company) return <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: C.red, fontFamily: "sans-serif" }}>{erreur || "Boutique introuvable"}</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.text, fontFamily: "sans-serif", paddingBottom: totalArticles > 0 ? 90 : 20 }}>
      <div style={{ padding: "32px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {company.logo_url && <img src={company.logo_url} alt="" style={{ height: 48, borderRadius: 8 }} />}
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{company.nom}</div>
            <div style={{ fontSize: 12, color: C.muted }}>Boutique en ligne</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {user ? (
            <>
              <button onClick={ouvrirMesCommandes} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Mes commandes</button>
              <button onClick={logout} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 6, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Déconnexion</button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, borderRadius: 6, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Se connecter</button>
          )}
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
          <button onClick={() => setShowCheckout(true)} style={{ background: C.gold, border: "none", color: "#000", borderRadius: 6, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>Commander →</button>
        </div>
      )}

      {showCheckout && (
        <div onClick={() => !commandeEnCours && setShowCheckout(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, maxWidth: 420, width: "100%" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Finaliser la commande</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom complet" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.text }} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.text }} />
              <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Téléphone (optionnel)" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.text }} />
              <input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Adresse de livraison (optionnel)" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.text }} />
            </div>
            {erreurCommande && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{erreurCommande}</div>}
            <div style={{ fontSize: 13, marginBottom: 14 }}>Total : <strong style={{ color: C.gold }}>{totalPrix.toFixed(2)} €</strong></div>
            <button onClick={passerCommande} disabled={commandeEnCours} style={{ width: "100%", background: C.gold, border: "none", color: "#000", borderRadius: 6, padding: "12px", fontWeight: 700, cursor: "pointer" }}>
              {commandeEnCours ? "Redirection..." : "Payer par carte →"}
            </button>
          </div>
        </div>
      )}

      {showAuth && (
        <div onClick={() => !authEnCours && setShowAuth(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, maxWidth: 380, width: "100%" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{authMode === "login" ? "Se connecter" : "Créer un compte"}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
              {authMode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <span onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthErreur(""); }} style={{ color: C.gold, cursor: "pointer" }}>
                {authMode === "login" ? "Créer un compte" : "Se connecter"}
              </span>
            </div>

            <button onClick={loginGoogle} style={{ width: "100%", background: "#fff", border: "none", color: "#000", borderRadius: 6, padding: "10px 12px", fontWeight: 600, cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Continuer avec Google
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <div style={{ fontSize: 11, color: C.muted }}>ou</div>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {authMode === "signup" && (
                <input value={authNom} onChange={(e) => setAuthNom(e.target.value)} placeholder="Nom complet" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.text }} />
              )}
              <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Email" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.text }} />
              <input value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} type="password" placeholder="Mot de passe" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.text }} />
            </div>
            {authErreur && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{authErreur}</div>}
            <button onClick={authMode === "login" ? login : signup} disabled={authEnCours} style={{ width: "100%", background: C.gold, border: "none", color: "#000", borderRadius: 6, padding: "12px", fontWeight: 700, cursor: "pointer" }}>
              {authEnCours ? "..." : authMode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </div>
        </div>
      )}

      {showCommandes && (
        <div onClick={() => setShowCommandes(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, maxWidth: 480, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Mes commandes</div>
              <button onClick={() => setShowCommandes(false)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            {mesCommandes.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 20 }}>Aucune commande pour l'instant.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mesCommandes.map((c) => (
                  <div key={c.id} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.reference}</div>
                      <div style={{ fontSize: 11, color: c.statut === "payée" ? C.green : C.muted }}>{c.statut}</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>{Number(c.montant_total).toFixed(2)} € · {new Date(c.created_at).toLocaleDateString("fr")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
