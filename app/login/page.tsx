"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attente2FA, setAttente2FA] = useState(false);
  const [destination2FA, setDestination2FA] = useState("");
  const [code2FA, setCode2FA] = useState("");
  const [utiliserCodeSecours, setUtiliserCodeSecours] = useState(false);
  const [verif2FAEnCours, setVerif2FAEnCours] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const handleResetPassword = async () => {
    if (!email) { setError("Entrez votre email d'abord"); return; }
    setResetLoading(true);
    setError("");
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setResetSent(true);
    } catch (e: any) {
      setError("Erreur lors de l'envoi de l'email");
    }
    setResetLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) return setError("Remplissez tous les champs");
    setLoading(true);
    setError("");
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (authError) {
        setError("Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }
      if (data.session) {
        // Sauvegarder dans cookie ET localStorage
        const token = data.session.access_token;
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `sb-access-token=${token}; path=/; expires=${expires}; SameSite=Lax`;
        document.cookie = `sb-jigwcrybfhvlmzoclbih-auth-token=${token}; path=/; expires=${expires}; SameSite=Lax`;
        localStorage.setItem("sb-access-token", token);

        const res = await fetch("/api/whoami");
        const who = await res.json();
        const cible = who.isOwner ? "/dashboard" : who.isCollaborateur ? "/espace-equipe" : "/mon-espace";
        if (who.deuxFaActif) {
          setDestination2FA(cible);
          setAttente2FA(true);
          await fetch('/api/2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'envoyer_code' }) });
        } else {
          window.location.replace(cible);
        }
      }
    } catch (e: any) {
      setError("Erreur de connexion");
    }
    setLoading(false);
  };

  const verifier2FA = async () => {
    setVerif2FAEnCours(true);
    setError("");
    try {
      const action = utiliserCodeSecours ? 'verifier_code_secours' : 'verifier_code';
      const res = await fetch('/api/2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, code: code2FA }) });
      const data = await res.json();
      if (data.success) {
        window.location.replace(destination2FA);
      } else {
        setError(data.error || "Code incorrect");
      }
    } catch (e: any) {
      setError("Erreur de connexion");
    }
    setVerif2FAEnCours(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif", color:"#f0ead6", padding:24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        .inp { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.2); color:#f0ead6; padding:14px 16px; font-family:'DM Sans',sans-serif; font-size:15px; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
        .inp:focus { border-color:rgba(201,169,110,0.6); }
        .inp::placeholder { color:rgba(240,234,214,0.3); }
        .btn { background:linear-gradient(135deg,#c9a96e,#a07c45); color:#0a0a0a; border:none; padding:15px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer; width:100%; transition:all 0.3s; letter-spacing:0.04em; }
        .btn:hover { box-shadow:0 8px 28px rgba(201,169,110,0.35); }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }
      `}</style>

      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:28, fontWeight:300, letterSpacing:"0.15em", color:"#c9a96e" }}>XYRA</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(240,234,214,0.4)", letterSpacing:"0.1em", marginTop:6 }}>CONNEXION À VOTRE ESPACE</div>
        </div>

        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(201,169,110,0.15)", padding:"40px 36px" }}>
          {attente2FA ? (<>
          <h1 style={{ fontSize:28, fontWeight:300, marginBottom:8 }}>Verification <em style={{ color:"#c9a96e" }}>en 2 etapes</em></h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(240,234,214,0.4)", marginBottom:28 }}>Entrez le code recu par SMS, ou utilisez un code de secours</p>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(240,234,214,0.45)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>{utiliserCodeSecours ? "Code de secours" : "Code recu par SMS"}</label>
              <input className="inp" placeholder={utiliserCodeSecours ? "XXXX-XXXX" : "123456"} value={code2FA} onChange={e => setCode2FA(e.target.value)} onKeyDown={e => e.key==="Enter"&&verifier2FA()} />
            </div>
            {error && <div style={{ background:"rgba(255,82,82,0.1)", border:"1px solid rgba(255,82,82,0.3)", padding:"10px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#FF5252" }}>⚠️ {error}</div>}
            <button className="btn" onClick={verifier2FA} disabled={verif2FAEnCours} style={{ marginTop:6 }}>
              {verif2FAEnCours ? "Verification..." : "Verifier →"}
            </button>
            <div style={{ textAlign:"center", marginTop:4 }}>
              <button onClick={() => { setUtiliserCodeSecours(v => !v); setCode2FA(""); setError(""); }} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(240,234,214,0.4)", textDecoration:"underline" }}>
                {utiliserCodeSecours ? "Utiliser le code SMS" : "Utiliser un code de secours a la place"}
              </button>
            </div>
          </div>
          </>) : (<>
          <h1 style={{ fontSize:28, fontWeight:300, marginBottom:8 }}>Bon retour <em style={{ color:"#c9a96e" }}>!</em></h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(240,234,214,0.4)", marginBottom:28 }}>Connectez-vous à votre dashboard Xyra</p>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(240,234,214,0.45)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Email</label>
              <input className="inp" type="email" placeholder="contact@votresociete.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter"&&handleLogin()} />
            </div>

            <div>
              <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(240,234,214,0.45)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Mot de passe</label>
              <div style={{ position:"relative" }}>
                <input className="inp" type={showPassword?"text":"password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter"&&handleLogin()} style={{ paddingRight:44 }} />
                <button onClick={() => setShowPassword(v=>!v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(240,234,214,0.4)", fontSize:16 }}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error && <div style={{ background:"rgba(255,82,82,0.1)", border:"1px solid rgba(255,82,82,0.3)", padding:"10px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#FF5252" }}>⚠️ {error}</div>}

            <button className="btn" onClick={handleLogin} disabled={loading} style={{ marginTop:6 }}>
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
            <div style={{ textAlign:"center", marginTop:4 }}>
              {resetSent ? (
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#2EC9B0" }}>Email envoye ! Verifiez votre boite mail.</span>
              ) : (
                <button onClick={handleResetPassword} disabled={resetLoading} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(240,234,214,0.4)", textDecoration:"underline" }}>
                  {resetLoading ? "Envoi..." : "Mot de passe oublie ?"}
                </button>
              )}
            </div>
          </div>
          </>)}
        </div>
        <div style={{ textAlign:"center", marginTop:24, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(240,234,214,0.4)" }}>
          Pas encore de compte ? <a href="/inscription" style={{ color:"#c9a96e", textDecoration:"none" }}>Essai gratuit 14 jours →</a>
        </div>
        <div style={{ textAlign:"center", marginTop:12, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(240,234,214,0.2)" }}>
          🔒 Connexion sécurisée · Données chiffrées
        </div>
      </div>
    </div>
  );
}