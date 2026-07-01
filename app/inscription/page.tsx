"use client";

import { useState } from "react";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { supabase } from "../lib/supabase";

const PAYS_REGIONS = [
  { region: "🌍 Afrique", pays: ["Algérie","Angola","Bénin","Burkina Faso","Cameroun","Côte d'Ivoire","Gabon","Ghana","Guinée","Kenya","Madagascar","Mali","Maroc","Maurice","Mozambique","Niger","Nigeria","Ouganda","RD Congo","Rwanda","Sénégal","Tanzanie","Tchad","Togo","Tunisie","Zambie","Zimbabwe"] },
  { region: "🇪🇺 Europe", pays: ["Allemagne","Belgique","Espagne","France","Italie","Luxembourg","Pays-Bas","Portugal","Royaume-Uni","Suisse"] },
  { region: "🌎 Amériques", pays: ["Brésil","Canada","États-Unis","Mexique"] },
  { region: "🇦🇪 Moyen-Orient", pays: ["Arabie saoudite","Émirats arabes unis (Dubaï)","Qatar"] },
];

const METIERS_CATEGORIES = [
  { cat: "🏠 Services à domicile", metiers: ["Nettoyage / Ménage","Jardinage","Plomberie","Électricité","Chef à domicile","Déménagement"] },
  { cat: "🏗️ BTP & Artisanat", metiers: ["Construction","Rénovation","Architecture","Menuisier","Maçon"] },
  { cat: "🍽️ Restauration & Food", metiers: ["Restaurant","Fast-food","Café","Boulangerie","Traiteur","Food truck"] },
  { cat: "🚗 Transport & Logistique", metiers: ["Chauffeur VIP","VTC / Taxi","Aviation / Jet privé","Yachting","Import / Export"] },
  { cat: "🏠 Conciergerie Premium", metiers: ["Conciergerie privée","Conciergerie Airbnb","Rapatriement de corps","Yacht management"] },
  { cat: "💅 Beauté & Esthétique", metiers: ["Coiffeur / Salon","Esthéticienne","Spa / Hammam","Barbier"] },
  { cat: "🏨 Hôtellerie & Tourisme", metiers: ["Hôtel","Airbnb / Location courte durée","Agence de voyage","Resort"] },
  { cat: "🏘️ Immobilier", metiers: ["Agence immobilière","Gestion locative","Syndic","Promotion immobilière"] },
  { cat: "⚖️ Juridique & Finance", metiers: ["Avocat","Comptable","Conseiller financier","Courtier"] },
  { cat: "💻 Tech & Digital", metiers: ["Développeur web","Agence digitale","Marketing digital","Community manager"] },
  { cat: "📚 Formation & Coaching", metiers: ["Centre de formation","Coach / Mentor","Soutien scolaire","Auto-école"] },
  { cat: "➕ Autre secteur", metiers: ["Mon secteur n'est pas listé"] },
];

// ─── PLANS MIS À JOUR ───────────────────────────────────────────────────────
const PLANS = [
  // ── 1 Société ──
  { name: "Starter", emoji: "🌱", price: 59, prixLabel: "59€/mois", desc: "1 société · Idéal pour démarrer", features: ["3 modules au choix","Wallet & Flutterwave","1 utilisateur","Support WhatsApp"], highlight: false, groupe: "1 Société" },
  { name: "Business Pro", emoji: "🚀", price: 129, prixLabel: "129€/mois", desc: "1 société · Pour les équipes", features: ["8 modules au choix","Wallet + Cartes virtuelles","5 utilisateurs","IA & Analytics","Support prioritaire"], highlight: true, groupe: "1 Société" },
  { name: "Enterprise", emoji: "💎", price: 249, prixLabel: "249€/mois", desc: "1 société · Tout inclus", features: ["Tous les modules","Bot WhatsApp IA","Utilisateurs illimités","Club d'affaires inclus","Support dédié 7j/7"], highlight: false, groupe: "1 Société" },
  // ── Multi-Sociétés ──
  { name: "Multi-Sociétés", emoji: "🏢", price: 499, prixLabel: "499€/mois", desc: "3 à 5 sociétés · Multi-entités", features: ["Tout dashboard (sauf Club & Prospection)","3 à 5 sociétés distinctes","Vue consolidée Owner","Multi-devises natif","Connexion bancaire directe","Support prioritaire"], highlight: false, groupe: "Multi-Sociétés" },
  { name: "Multi-Sociétés Pro", emoji: "🏗", price: 799, prixLabel: "799€/mois", desc: "5 à 10 sociétés · Groupes", features: ["Tout Multi-Sociétés","5 à 10 sociétés","Rapports consolidés avancés","API dédiée par entité","Onboarding personnalisé"], highlight: false, groupe: "Multi-Sociétés" },
  { name: "Holding", emoji: "🏛", price: 1200, prixLabel: "1 200€/mois", desc: "Sociétés illimitées · Holdings", features: ["Tout Multi-Sociétés Pro","Sociétés illimitées","Vue holding complète","Intercompany transactions","Support dédié 24h/24","Gestionnaire de compte dédié"], highlight: false, groupe: "Multi-Sociétés" },
  // ── Club d'affaires ──
  { name: "Club d'affaires", emoji: "🤝", price: 2000, prixLabel: "2 000€/an", desc: "Option annuelle · Réseau privé", features: ["Réseau privé membres Xyra","Deals exclusifs -10% entre membres","IA Match business (Claude)","Événements VIP networking","Annuaire mondial 18+ pays","Messagerie inter-membres"], highlight: false, groupe: "Option", annuel: true },
];

const GROUPES = ["1 Société", "Multi-Sociétés", "Option"];

const TAILLES = [
  { label: "1 personne", sub: "Solo" },
  { label: "2 à 5", sub: "Petite équipe" },
  { label: "6 à 20", sub: "PME" },
  { label: "20+", sub: "Grande structure" },
];

const PAYMENT_METHODS = [
  { id: "wave", icon: "🌊", name: "Wave", sub: "Sénégal, Mali, CI...", type: "flutterwave" },
  { id: "orange", icon: "📱", name: "Orange Money", sub: "Afrique de l'Ouest", type: "flutterwave" },
  { id: "mtn", icon: "📲", name: "MTN Mobile Money", sub: "Ghana, Cameroun, CI...", type: "flutterwave" },
  { id: "card", icon: "💳", name: "Visa / Mastercard", sub: "Carte bancaire internationale", type: "stripe" },
  { id: "sepa", icon: "🏦", name: "Virement SEPA", sub: "Europe — France, Belgique...", type: "stripe" },
];

export default function Inscription() {
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedGroupe, setSelectedGroupe] = useState("1 Société");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    societe: "", gerant: "", email: "", password: "", pays: "",
    categorie: "", metier: "", taille: "", plan: "", planPrice: 0,
  });

  const update = (key: string, val: string | number) => setForm(f => ({ ...f, [key]: val }));

  const flwConfig = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY!,
    tx_ref: `XYRA-${Date.now()}`,
    amount: form.planPrice || 59,
    currency: "EUR",
    payment_options: "mobilemoney,card",
    customer: {
      email: form.email || "client@xyra.io",
      name: form.societe || "Client",
      phone_number: "0000000000",
    },
    customizations: {
      title: "Xyra",
      description: `Abonnement ${form.plan} — ${form.metier}`,
      logo: "https://tymelees-saas-yzel.vercel.app/favicon.ico",
    },
  };

  const handleFlutterPayment = useFlutterwave(flwConfig as any);

  const createAccount = async (txRef: string, txId: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            societe: form.societe,
            plan: form.plan,
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      await supabase.from("tenants").insert([{
        user_id: userId,
        societe: form.societe,
        email: form.email,
        pays: form.pays,
        metier: form.metier,
        categorie: form.categorie,
        taille: form.taille,
        plan: form.plan.toLowerCase().replace(" ", "_"),
        plan_price: form.planPrice,
        statut: "essai",
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      }]);

      await supabase.from("inscriptions").insert([{
        societe: form.societe,
        email: form.email,
        pays: form.pays,
        categorie: form.categorie,
        metier: form.metier,
        taille: form.taille,
        plan: form.plan,
        plan_price: form.planPrice,
        flw_tx_ref: txRef,
        flw_transaction_id: txId,
        statut: "actif",
        created_at: new Date().toISOString(),
      }]);

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          email: form.email,
          societe: form.societe,
          prenom: form.gerant,
          plan: form.plan,
          planPrice: form.planPrice,
          metier: form.metier,
          pays: form.pays,
        }),
      });

      return { success: true, userId };
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur lors de la création du compte");
      return { success: false };
    }
  };

  const handleFlw = () => {
    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal();
        if (response.status === "successful") {
          setLoading(true);
          const result = await createAccount(response.tx_ref, String(response.transaction_id));
          setLoading(false);
          if (result.success) setSuccess(true);
        }
      },
      onClose: () => {},
    });
  };

  const handleStripe = async () => {
    setLoading(true);
    try {
      const result = await createAccount(`STRIPE-${Date.now()}`, "pending");
      if (!result.success) { setLoading(false); return; }

      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: form.planPrice, plan: form.plan,
          societe: form.societe, email: form.email,
          metier: form.metier, pays: form.pays,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handlePay = () => {
    setError("");
    const method = PAYMENT_METHODS.find(m => m.id === selectedPayment);
    if (!method) return;
    if (method.type === "stripe") handleStripe();
    else handleFlw();
  };

  const canNext = () => {
    if (step === 1) return form.societe && form.email && form.password && form.pays && form.taille;
    if (step === 2) return !!form.metier;
    if (step === 3) return !!form.plan;
    if (step === 4) return selectedPayment !== "";
    return true;
  };

  const stepTitles = ["Entreprise", "Métier", "Plan", "Paiement"];
  const currentMetiers = METIERS_CATEGORIES.find(c => c.cat === selectedCat)?.metiers || [];
  const plansAffiches = PLANS.filter(p => p.groupe === selectedGroupe);

  if (success) {
    return (
      <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", background: "#0a0a0a", color: "#f0ead6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
        <div>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 300, marginBottom: 16 }}>
            Bienvenue sur <em style={{ color: "#c9a96e" }}>Xyra !</em>
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, color: "rgba(240,234,214,0.6)", marginBottom: 8, lineHeight: 1.7 }}>
            Paiement confirmé · Compte créé avec succès
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "rgba(240,234,214,0.4)", marginBottom: 32 }}>
            📧 Vérifiez votre email pour confirmer votre compte
          </p>
          <div style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", padding: "20px 32px", marginBottom: 36, display: "inline-block", textAlign: "left" }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(240,234,214,0.5)", marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Votre compte</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, marginBottom: 6 }}>{form.societe}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(240,234,214,0.5)", marginBottom: 4 }}>{form.metier} · {form.pays}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#c9a96e" }}>Plan {form.plan} · {form.planPrice}€ · 14 jours gratuits</div>
          </div>
          <br />
          <a href="/dashboard" style={{ background: "linear-gradient(135deg,#c9a96e,#a07c45)", color: "#0a0a0a", padding: "16px 40px", fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
            Accéder à mon dashboard →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", background: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .inp { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.2); color:#f0ead6; padding:14px 16px; font-family:'DM Sans',sans-serif; font-size:15px; outline:none; transition:border-color 0.2s; }
        .inp:focus { border-color:rgba(201,169,110,0.6); }
        .inp::placeholder { color:rgba(240,234,214,0.3); }
        select.inp option { background:#1a1a1a; color:#f0ead6; }
        .cat-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(201,169,110,0.1); padding:12px; text-align:left; cursor:pointer; transition:all 0.2s; width:100%; display:flex; align-items:center; gap:8px; font-family:'DM Sans',sans-serif; color:#f0ead6; }
        .cat-btn:hover,.cat-btn.active { border-color:#c9a96e; background:rgba(201,169,110,0.06); }
        .metier-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(201,169,110,0.1); padding:11px 14px; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; font-size:13px; color:rgba(240,234,214,0.75); width:100%; text-align:left; }
        .metier-btn:hover { border-color:rgba(201,169,110,0.3); color:#f0ead6; }
        .metier-btn.sel { border-color:#c9a96e; background:rgba(201,169,110,0.08); color:#c9a96e; }
        .taille-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(201,169,110,0.12); padding:16px; cursor:pointer; transition:all 0.2s; text-align:center; font-family:'DM Sans',sans-serif; color:#f0ead6; }
        .taille-btn:hover,.taille-btn.sel { border-color:#c9a96e; background:rgba(201,169,110,0.08); }
        .plan-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(201,169,110,0.15); padding:26px 22px; cursor:pointer; transition:all 0.2s; position:relative; text-align:left; width:100%; font-family:'DM Sans',sans-serif; color:#f0ead6; }
        .plan-btn:hover,.plan-btn.sel { border-color:#c9a96e; background:rgba(201,169,110,0.08); }
        .pay-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(201,169,110,0.12); padding:16px 20px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:14px; width:100%; font-family:'DM Sans',sans-serif; color:#f0ead6; }
        .pay-btn:hover,.pay-btn.sel { border-color:#c9a96e; background:rgba(201,169,110,0.06); }
        .btn-primary { background:linear-gradient(135deg,#c9a96e,#a07c45); color:#0a0a0a; border:none; padding:15px 36px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer; transition:all 0.3s; width:100%; letter-spacing:0.04em; }
        .btn-primary:hover { box-shadow:0 8px 28px rgba(201,169,110,0.35); transform:translateY(-1px); }
        .btn-primary:disabled { opacity:0.3; cursor:not-allowed; transform:none; }
        .btn-back { background:transparent; color:rgba(240,234,214,0.5); border:1px solid rgba(201,169,110,0.15); padding:14px 24px; font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; flex-shrink:0; }
        .lbl { font-family:'DM Sans',sans-serif; font-size:12px; color:rgba(240,234,214,0.45); letter-spacing:0.08em; text-transform:uppercase; display:block; margin-bottom:8px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .fade { animation:fadeUp 0.45s ease forwards; }
        @media(max-width:640px) { .taille-grid{grid-template-columns:repeat(2,1fr)!important;} .plans-grid{grid-template-columns:1fr!important;} .step2-grid{grid-template-columns:1fr!important;} }
      `}</style>

      <div style={{ borderBottom: "1px solid rgba(201,169,110,0.1)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontSize: 20, fontWeight: 300, letterSpacing: "0.12em", color: "#c9a96e", textDecoration: "none", fontFamily: "Georgia,serif" }}>XYRA</a>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(240,234,214,0.4)" }}>
          Déjà inscrit ? <a href="/login" style={{ color: "#c9a96e", textDecoration: "none" }}>Connexion →</a>
        </span>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "52px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 48 }}>
          {stepTitles.map((title, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? "#c9a96e" : active ? "rgba(201,169,110,0.12)" : "transparent", border: `1px solid ${done || active ? "#c9a96e" : "rgba(201,169,110,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: done ? "#0a0a0a" : active ? "#c9a96e" : "rgba(240,234,214,0.25)" }}>
                    {done ? "✓" : n}
                  </div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: active ? "#c9a96e" : "rgba(240,234,214,0.3)", whiteSpace: "nowrap" }}>{title}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 1, background: step > n ? "#c9a96e" : "rgba(201,169,110,0.12)", margin: "0 6px", marginBottom: 20 }} />}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 1 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px,5vw,46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 32 }}>Votre <em style={{ fontStyle: "italic", color: "#c9a96e" }}>entreprise</em></h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label className="lbl">Nom de la société *</label><input className="inp" placeholder="Ex: Ndiaye BTP, Restaurant Soleil..." value={form.societe} onChange={e => update("societe", e.target.value)} /></div>
              <div><label className="lbl">Nom du gérant *</label><input className="inp" placeholder="Ex: Marie Dupont" value={form.gerant} onChange={e => update("gerant", e.target.value)} /></div>
              <div><label className="lbl">Email professionnel *</label><input className="inp" type="email" placeholder="contact@societe.com" value={form.email} onChange={e => update("email", e.target.value)} /></div>
              <div><label className="lbl">Mot de passe *</label><input className="inp" type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={e => update("password", e.target.value)} /></div>
              <div>
                <label className="lbl">Pays *</label>
                <select className="inp" value={form.pays} onChange={e => update("pays", e.target.value)}>
                  <option value="">Sélectionnez votre pays...</option>
                  {PAYS_REGIONS.map(r => (
                    <optgroup key={r.region} label={r.region}>
                      {r.pays.map(p => <option key={p} value={p}>{p}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="lbl">Taille *</label>
                <div className="taille-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {TAILLES.map(t => (
                    <button key={t.label} className={`taille-btn${form.taille === t.label ? " sel" : ""}`} onClick={() => update("taille", t.label)}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(240,234,214,0.4)" }}>{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 2 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px,5vw,46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 28 }}>Votre <em style={{ fontStyle: "italic", color: "#c9a96e" }}>métier</em></h1>
            <div className="step2-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="lbl">1. Catégorie</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 380, overflowY: "auto" }}>
                  {METIERS_CATEGORIES.map(c => (
                    <button key={c.cat} className={`cat-btn${selectedCat === c.cat ? " active" : ""}`} onClick={() => { setSelectedCat(c.cat); update("categorie", c.cat); update("metier", ""); }}>
                      <span style={{ fontSize: 16 }}>{c.cat.split(" ")[0]}</span>
                      <span style={{ fontSize: 12, color: selectedCat === c.cat ? "#c9a96e" : "rgba(240,234,214,0.6)" }}>{c.cat.split(" ").slice(1).join(" ")}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="lbl">2. Métier précis</label>
                {!selectedCat ? (
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(240,234,214,0.25)", padding: "20px 16px", border: "1px solid rgba(201,169,110,0.08)", textAlign: "center" }}>← Sélectionnez une catégorie</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 380, overflowY: "auto" }}>
                    {currentMetiers.map(m => (
                      <button key={m} className={`metier-btn${form.metier === m ? " sel" : ""}`} onClick={() => update("metier", m)}>
                        {form.metier === m ? "◆ " : "· "}{m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {form.metier && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.25)", display: "flex", alignItems: "center", gap: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>
                <span style={{ color: "#c9a96e" }}>✓</span>
                Métier sélectionné : <strong style={{ color: "#c9a96e" }}>{form.metier}</strong>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 3 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px,5vw,46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 12 }}>Votre <em style={{ fontStyle: "italic", color: "#c9a96e" }}>plan</em></h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(240,234,214,0.45)", marginBottom: 20 }}>14 jours d'essai gratuit · Annulez à tout moment.</p>

            {/* Sélecteur de groupe */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {GROUPES.map(g => (
                <button key={g} onClick={() => { setSelectedGroupe(g); update("plan", ""); update("planPrice", 0); }} style={{ background: selectedGroupe === g ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${selectedGroupe === g ? "#c9a96e" : "rgba(201,169,110,0.15)"}`, color: selectedGroupe === g ? "#c9a96e" : "rgba(240,234,214,0.5)", padding: "8px 18px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
                  {g === "1 Société" ? "🏠 1 Société" : g === "Multi-Sociétés" ? "🏢 Multi-Sociétés" : "🤝 Options"}
                </button>
              ))}
            </div>

            <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {plansAffiches.map(plan => (
                <button key={plan.name} className={`plan-btn${form.plan === plan.name ? " sel" : ""}`} onClick={() => { update("plan", plan.name); update("planPrice", plan.price); }}>
                  {plan.highlight && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#c9a96e", color: "#0a0a0a", fontSize: 10, fontWeight: 700, padding: "3px 14px", textTransform: "uppercase", whiteSpace: "nowrap" }}>Recommandé</div>}
                  <div style={{ paddingTop: plan.highlight ? 8 : 0 }}>
                    <div style={{ fontSize: 12, color: "rgba(240,234,214,0.5)", marginBottom: 8 }}>{plan.emoji} {plan.name}</div>
                    <div style={{ fontSize: plan.price >= 1000 ? 28 : 38, fontWeight: 300, color: plan.highlight ? "#c9a96e" : "#f0ead6", lineHeight: 1, marginBottom: 4 }}>
                      {plan.prixLabel}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(240,234,214,0.4)", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(201,169,110,0.1)" }}>{plan.desc}</div>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", gap: 8, fontSize: 12, color: "rgba(240,234,214,0.65)", marginBottom: 8 }}>
                        <span style={{ color: "#c9a96e", flexShrink: 0 }}>◆</span>{f}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 4 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px,5vw,46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 12 }}>
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Paiement</em>
            </h1>
            <div style={{ background: "rgba(201,169,110,0.05)", border: "1px solid rgba(201,169,110,0.18)", padding: "18px 22px", marginBottom: 24 }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(240,234,214,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Récapitulatif</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{form.societe}</div>
                  <div style={{ fontSize: 13, color: "rgba(240,234,214,0.5)" }}>{form.metier} · {form.pays}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 300, color: "#c9a96e" }}>
                    {form.planPrice}€<span style={{ fontSize: 12, color: "rgba(240,234,214,0.35)" }}>{PLANS.find(p => p.name === form.plan)?.annuel ? "/an" : "/mois"}</span>
                  </div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(240,234,214,0.3)" }}>Plan {form.plan} · 14 jours gratuits</div>
                </div>
              </div>
            </div>
            <label className="lbl">Moyen de paiement *</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} className={`pay-btn${selectedPayment === m.id ? " sel" : ""}`} onClick={() => setSelectedPayment(m.id)}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(240,234,214,0.4)" }}>{m.sub}</div>
                  </div>
                  {selectedPayment === m.id && <span style={{ color: "#c9a96e" }}>✓</span>}
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(240,234,214,0.3)" }}>
                    {m.type === "stripe" ? "via Stripe" : "via Flutterwave"}
                  </span>
                </button>
              ))}
            </div>
            {error && <div style={{ background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.3)", padding: "12px 16px", marginBottom: 16, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#FF5252" }}>⚠️ {error}</div>}
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(240,234,214,0.25)", textAlign: "center", marginBottom: 16 }}>
              🔒 SSL · Aucun débit pendant 14 jours · Annulez à tout moment
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
          {step > 1 && <button className="btn-back" onClick={() => setStep(s => s - 1)}>← Retour</button>}
          {step < 4 ? (
            <button className="btn-primary" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>
              {step === 3 ? "Continuer vers le paiement →" : "Continuer →"}
            </button>
          ) : (
            <button className="btn-primary" disabled={!canNext() || loading} onClick={handlePay}>
              {loading ? "Création du compte en cours..." : `🚀 Payer ${form.planPrice}€ et accéder au dashboard`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}