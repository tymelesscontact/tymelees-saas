"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError("Remplissez tous les champs");
    setLoading(true);
    setError("");
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      if (data.user) {
        window.location.href = "/dashboard";
      }
    } catch (e: any) {
      setError("Email ou mot de passe incorrect");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      color: "#f0ead6",
      padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .inp { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.2); color:#f0ead6; padding:14px 16px; font-family:'DM Sans',sans-serif; font-size:15px; outline:none; transition:border-color 0.2s; }
        .inp:focus { border-color:rgba(201,169,110,0.6); }
        .inp::placeholder { color:rgba(240,234,214,0.3); }
        .btn { background:linear-gradient(135deg,#c9a96e,#a07c45); color:#0a0a0a; border:none; padding:15px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer; width:100%; transition:all 0.3s; letter-spacing:0.04em; }
        .btn:hover { box-shadow:0 8px 28px rgba(201,169,110,0.35); transform:translateY(-1px); }
        .btn:disabled { opacity:0.3; cursor:not-allowed; transform:none; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <a href="/" style={{ fontSize: 28, fontWeight: 300, letterSpacing: "0.15em", color: "#c9a96e", textDecoration: "none" }}>XYRA</a>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(240,234,214,0.4)", letterSpacing: "0.1em", marginTop: 6 }}>CONNEXION À VOTRE ESPACE</div>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.15)", padding: "40px 36px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 300, marginBottom: 8 }}>
            Bon retour <em style={{ color: "#c9a96e", fontStyle: "italic" }}>!</em>
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "rgba(240,234,214,0.4)", marginBottom: 28 }}>
            Connectez-vous à votre dashboard Xyra
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Email */}
            <div>
              <label style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(240,234,214,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Email
              </label>
              <input
                className="inp"
                type="email"
                placeholder="contact@votresociete.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(240,234,214,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="inp"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  style={{ paddingRight: 44 }}
                />
                <button
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(240,234,214,0.4)", fontSize: 16 }}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{ background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.3)", padding: "10px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#FF5252" }}>
                ⚠️ {error}
              </div>
            )}

            {/* Bouton */}
            <button className="btn" onClick={handleLogin} disabled={loading} style={{ marginTop: 6 }}>
              {loading ? "Connexion en cours..." : "Se connecter →"}
            </button>

            {/* Mot de passe oublié */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={async () => {
                  if (!email) return setError("Entrez votre email d'abord");
                  await supabase.auth.resetPasswordForEmail(email);
                  setError("");
                  alert("Email de réinitialisation envoyé !");
                }}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(240,234,214,0.4)", textDecoration: "underline" }}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>
        </div>

        {/* Pas encore inscrit */}
        <div style={{ textAlign: "center", marginTop: 24, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(240,234,214,0.4)" }}>
          Pas encore de compte ?{" "}
          <a href="/inscription" style={{ color: "#c9a96e", textDecoration: "none", fontWeight: 500 }}>
            Essai gratuit 14 jours →
          </a>
        </div>

        {/* Séparateur */}
        <div style={{ textAlign: "center", marginTop: 32, fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(240,234,214,0.2)" }}>
          🔒 Connexion sécurisée · Données chiffrées
        </div>
      </div>
    </div>
  );
}