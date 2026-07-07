"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!password || password.length < 8) return setError("Minimum 8 caractères");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas");
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => window.location.href = "/login", 2000);
    } catch (e: any) {
      setError(e.message || "Erreur");
    }
    setLoading(false);
  };

  if (success) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif", color:"#f0ead6", textAlign:"center" }}>
      <div>
        <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
        <div style={{ fontSize:22, color:"#c9a96e" }}>Mot de passe mis à jour !</div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(240,234,214,0.5)", marginTop:8 }}>Redirection vers le dashboard...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif", color:"#f0ead6", padding:24 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:24, fontWeight:300, letterSpacing:"0.15em", color:"#c9a96e" }}>XYRA</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(240,234,214,0.4)", marginTop:6 }}>NOUVEAU MOT DE PASSE</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(201,169,110,0.15)", padding:"36px 32px" }}>
          <h1 style={{ fontSize:26, fontWeight:300, marginBottom:24 }}>Choisissez votre <em style={{ color:"#c9a96e" }}>mot de passe</em></h1>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(240,234,214,0.45)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Nouveau mot de passe</label>
              <input type="password" placeholder="Minimum 8 caractères" value={password} onChange={e => setPassword(e.target.value)}
                style={{ width:"100%", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(201,169,110,0.2)", color:"#f0ead6", padding:"14px 16px", fontFamily:"'DM Sans',sans-serif", fontSize:15, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div>
              <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(240,234,214,0.45)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Confirmer</label>
              <input type="password" placeholder="Répétez le mot de passe" value={confirm} onChange={e => setConfirm(e.target.value)}
                style={{ width:"100%", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(201,169,110,0.2)", color:"#f0ead6", padding:"14px 16px", fontFamily:"'DM Sans',sans-serif", fontSize:15, outline:"none", boxSizing:"border-box" }} />
            </div>
            {error && <div style={{ background:"rgba(255,82,82,0.1)", border:"1px solid rgba(255,82,82,0.3)", padding:"10px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#FF5252" }}>⚠️ {error}</div>}
            <button onClick={handleReset} disabled={loading}
              style={{ background:"linear-gradient(135deg,#c9a96e,#a07c45)", color:"#0a0a0a", border:"none", padding:15, fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600, cursor:"pointer", marginTop:6, opacity:loading?0.5:1 }}>
              {loading ? "Enregistrement..." : "Enregistrer le mot de passe →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}