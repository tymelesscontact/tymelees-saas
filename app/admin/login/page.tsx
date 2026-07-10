"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
export default function AdminLoginPage() {
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
        const token = data.session.access_token;
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `sb-access-token=${token}; path=/; expires=${expires}; SameSite=Lax`;
        document.cookie = `sb-jigwcrybfhvlmzoclbih-auth-token=${token}; path=/; expires=${expires}; SameSite=Lax`;
        localStorage.setItem("sb-access-token", token);
        const res = await fetch("/api/whoami");
        const who = await res.json();
        if (who.isOwner) {
          window.location.replace("/admin");
        } else {
          setError("Acces reserve aux administrateurs Xyra");
          setLoading(false);
        }
      }
    } catch (e: any) {
      setError("Erreur de connexion");
    }
    setLoading(false);
  };
  return (
    <div style={{ minHeight:"100vh", background:"#05050a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif", color:"#f0ead6", padding:24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        .inp { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(155,95,255,0.25); color:#f0ead6; padding:14px 16px; font-family:'DM Sans',sans-serif; font-size:15px; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
        .inp:focus { border-color:rgba(155,95,255,0.6); }
        .inp::placeholder { color:rgba(240,234,214,0.3); }
        .btn { background:linear-gradient(135deg,#9B5FFF,#6B3FCC); color:#fff; border:none; padding:15px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer; width:100%; transition:all 0.3s; letter-spacing:0.04em; }
        .btn:hover { box-shadow:0 8px 28px rgba(155,95,255,0.35); }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }
      `}</style>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:28, fontWeight:300, letterSpacing:"0.15em", color:"#9B5FFF" }}>XYRA</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(240,234,214,0.4)", letterSpacing:"0.1em", marginTop:6 }}>OPERATING CENTER · ACCES ADMIN</div>
        </div>
        <div style={{ background:"rgba(155,95,255,0.03)", border:"1px solid rgba(155,95,255,0.2)", padding:"40px 36px" }}>
          <h1 style={{ fontSize:26, fontWeight:300, marginBottom:8 }}>Acces <em style={{ color:"#9B5FFF" }}>restreint</em></h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(240,234,214,0.4)", marginBottom:28 }}>Reserve aux administrateurs Xyra</p>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(240,234,214,0.45)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Email</label>
              <input className="inp" type="email" placeholder="admin@xyraio.fr" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter"&&handleLogin()} />
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
              {loading ? "Verification..." : "Acceder au Operating Center →"}
            </button>
          </div>
        </div>
        <div style={{ textAlign:"center", marginTop:12, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(240,234,214,0.2)" }}>
          🔒 Acces restreint · Toutes les connexions sont journalisees
        </div>
      </div>
    </div>
  );
}
