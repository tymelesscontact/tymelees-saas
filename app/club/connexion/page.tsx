"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const OR = "#c9a96e";
const IVOIRE = "#f0ead6";
const NOIR = "#0a0a0a";
const GRIS = "#78716a";
const TRAIT = "#1f1c16";

export default function ConnexionClub() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const connecter = async () => {
    if (chargement) return;
    setChargement(true); setErreur("");
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: motDePasse.trim(),
      });
      if (error || !data.session) {
        setErreur("Email ou mot de passe incorrect");
        setChargement(false);
        return;
      }
      const token = data.session.access_token;
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `sb-access-token=${token}; path=/; expires=${expires}; SameSite=Lax`;
      localStorage.setItem("sb-access-token", token);
      window.location.replace("/club/espace");
    } catch {
      setErreur("Erreur de connexion");
      setChargement(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: NOIR, color: IVOIRE, fontFamily: "system-ui,-apple-system,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <style>{`
        input { background: transparent; border: 0.5px solid ${TRAIT}; border-radius: 2px; padding: 13px 16px; color: ${IVOIRE}; font-size: 14px; font-family: inherit; outline: none; width: 100%; }
        input::placeholder { color: #4f4a43; }
      `}</style>

      <div style={{ fontFamily: "Georgia,serif", fontSize: 26, fontStyle: "italic", color: OR, marginBottom: 8 }}>Xyra Club</div>
      <div style={{ fontSize: 13, color: GRIS, marginBottom: 40 }}>Espace reserve aux membres</div>

      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 11, color: GRIS, display: "block", marginBottom: 7 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && connecter()} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: GRIS, display: "block", marginBottom: 7 }}>Mot de passe</label>
          <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && connecter()} />
        </div>
        {erreur && <div style={{ fontSize: 12, color: "#c96e6e" }}>{erreur}</div>}
        <div onClick={connecter} style={{ marginTop: 8, padding: "14px", background: OR, color: NOIR, fontSize: 13, textAlign: "center", cursor: chargement ? "default" : "pointer", opacity: chargement ? 0.5 : 1 }}>
          {chargement ? "Connexion..." : "Entrer"}
        </div>
      </div>

      <div style={{ marginTop: 36, textAlign: "center" }}>
        <a href="/club/rejoindre" style={{ fontSize: 12, color: GRIS, textDecoration: "underline" }}>Pas encore membre ? Deposer une candidature</a>
        <div style={{ marginTop: 14 }}>
          <a href="/club" style={{ fontSize: 12, color: "#4f4a43", textDecoration: "none" }}>Retour au club</a>
        </div>
      </div>
    </div>
  );
}
