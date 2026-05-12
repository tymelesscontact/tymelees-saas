"use client";

import { useState } from "react";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { supabase } from "../lib/supabase";

// ─── DONNÉES ─────────────────────────────────────────────────────────────────

const PAYS_REGIONS = [
  {
    region: "🌍 Afrique",
    pays: [
      "Algérie","Angola","Bénin","Botswana","Burkina Faso","Burundi",
      "Cameroun","Cap-Vert","Centrafrique","Comores","Congo","Côte d'Ivoire",
      "Djibouti","Égypte","Érythrée","Éthiopie","Gabon","Gambie",
      "Ghana","Guinée","Guinée-Bissau","Guinée équatoriale","Kenya",
      "Lesotho","Liberia","Libye","Madagascar","Malawi","Mali",
      "Maroc","Maurice","Mauritanie","Mozambique","Namibie","Niger",
      "Nigeria","Ouganda","RD Congo","Rwanda","São Tomé-et-Príncipe",
      "Sénégal","Sierra Leone","Somalie","Soudan","Soudan du Sud",
      "Tanzanie","Tchad","Togo","Tunisie","Zambie","Zimbabwe",
    ],
  },
  {
    region: "🇪🇺 Europe",
    pays: [
      "Albanie","Allemagne","Andorre","Autriche","Belgique","Biélorussie",
      "Bosnie-Herzégovine","Bulgarie","Chypre","Croatie","Danemark",
      "Espagne","Estonie","Finlande","France","Grèce","Hongrie",
      "Irlande","Islande","Italie","Kosovo","Lettonie","Liechtenstein",
      "Lituanie","Luxembourg","Macédoine du Nord","Malte","Moldavie",
      "Monaco","Monténégro","Norvège","Pays-Bas","Pologne","Portugal",
      "République tchèque","Roumanie","Royaume-Uni","Russie","Saint-Marin",
      "Serbie","Slovaquie","Slovénie","Suède","Suisse","Ukraine","Vatican",
    ],
  },
  {
    region: "🌎 Amériques",
    pays: [
      "Antigua-et-Barbuda","Argentine","Bahamas","Barbade","Belize",
      "Bolivie","Brésil","Canada","Chili","Colombie","Costa Rica",
      "Cuba","Dominique","Équateur","États-Unis","Grenade","Guatemala",
      "Guyana","Haïti","Honduras","Jamaïque","Mexique","Nicaragua",
      "Panama","Paraguay","Pérou","République dominicaine","Salvador",
      "Suriname","Trinité-et-Tobago","Uruguay","Venezuela",
    ],
  },
  {
    region: "🌏 Asie",
    pays: [
      "Afghanistan","Bangladesh","Bhoutan","Birmanie","Brunei",
      "Cambodge","Chine","Corée du Nord","Corée du Sud","Inde",
      "Indonésie","Japon","Kazakhstan","Kirghizistan","Laos",
      "Maldives","Malaisie","Mongolie","Népal","Ouzbékistan",
      "Pakistan","Philippines","Singapour","Sri Lanka","Tadjikistan",
      "Taïwan","Thaïlande","Timor oriental","Turkménistan","Vietnam",
    ],
  },
  {
    region: "🇦🇪 Moyen-Orient",
    pays: [
      "Arabie saoudite","Bahreïn","Émirats arabes unis (Dubaï)","Irak",
      "Iran","Israël","Jordanie","Koweït","Liban","Oman",
      "Palestine","Qatar","Syrie","Turquie","Yémen",
    ],
  },
  {
    region: "🌊 Océanie",
    pays: [
      "Australie","Fidji","Kiribati","Marshall","Micronésie",
      "Nauru","Nouvelle-Zélande","Palaos","Papouasie-Nouvelle-Guinée",
      "Samoa","Salomon","Tonga","Tuvalu","Vanuatu",
    ],
  },
];

const METIERS_CATEGORIES = [
  { cat: "🏠 Services à domicile", metiers: ["Nettoyage / Ménage","Jardinage / Paysagisme","Plomberie","Électricité","Peinture / Décoration","Chef à domicile","Aide à domicile","Déménagement","Serrurier","Chauffagiste"] },
  { cat: "🏗️ BTP & Artisanat", metiers: ["Construction / Gros œuvre","Rénovation","Architecture","Terrassement","Couverture / Toiture","Charpentier","Menuisier","Carreleur","Maçon","Électricité industrielle"] },
  { cat: "🍽️ Restauration & Food", metiers: ["Restaurant gastronomique","Bistrot / Brasserie","Fast-food / Snack","Café / Salon de thé","Boulangerie / Pâtisserie","Traiteur","Food truck","Bar / Lounge","Africain / Antillais","Halal / Vegan"] },
  { cat: "🛍️ Commerce & Retail", metiers: ["Boutique physique","E-commerce","Dropshipping","Épicerie / Supermarché","Pharmacie","Bijouterie","Prêt-à-porter","Électronique","Mobilier / Décoration","Fleuriste"] },
  { cat: "🚗 Transport & Logistique", metiers: ["Chauffeur VIP / Limousine","VTC / Taxi","Transport de marchandises","Livraison / Coursier","Aviation / Jet privé","Yachting","Logistique / Entrepôt","Import / Export","Transport médical"] },
  { cat: "🩺 Santé & Bien-être", metiers: ["Médecin généraliste","Dentiste","Kinésithérapeute","Infirmier","Psychologue","Nutritionniste","Pharmacien","Clinique / Centre médical","Coach bien-être"] },
  { cat: "💅 Beauté & Esthétique", metiers: ["Coiffeur / Salon","Coiffure afro / Tresses","Esthéticienne","Onglerie / Nail art","Maquillage pro","Spa / Hammam","Massage","Barbier","Cosmétiques"] },
  { cat: "🏨 Hôtellerie & Tourisme", metiers: ["Hôtel","Gîte / Chambre d'hôtes","Airbnb / Location courte durée","Agence de voyage","Guide touristique","Conciergerie hôtelière","Resort / Club"] },
  { cat: "🏠 Conciergerie Premium", metiers: ["Conciergerie privée","Conciergerie Airbnb","Personal shopper","Assistant personnel","Gestion propriétés luxe","Rapatriement de corps","Yacht management","Organisation événements privés"] },
  { cat: "💻 Tech & Digital", metiers: ["Développeur web / mobile","Designer UI/UX","Agence digitale","SEO / Marketing digital","Community manager","Photographe / Vidéaste","Intelligence artificielle","Consultant informatique"] },
  { cat: "📚 Formation & Coaching", metiers: ["Centre de formation","Soutien scolaire","Coach / Mentor","Formation en ligne","Auto-école","Crèche / Garderie","Centre de langues"] },
  { cat: "⚖️ Juridique & Finance", metiers: ["Avocat","Notaire","Comptable / Expert-comptable","Conseiller financier","Courtier assurance","Consultant RH","Cabinet de recrutement"] },
  { cat: "🏘️ Immobilier", metiers: ["Agence immobilière","Agent immobilier","Promoteur","Gestion locative","Syndic","Home staging","Expertise / Estimation"] },
  { cat: "🔐 Sécurité", metiers: ["Agent de sécurité","Garde du corps","Surveillance","Télésurveillance / Alarmes","Sécurité événementielle","Installation caméras"] },
  { cat: "📸 Événementiel", metiers: ["Organisation de mariages","Événements corporate","Photographe événementiel","DJ / Animateur","Décoration événementielle","Location de salle"] },
  { cat: "📦 Import / Export", metiers: ["Commerce international","Véhicules d'occasion","Friperie / Mode import","Produits alimentaires","Matériaux import","Diaspora / Envoi de colis"] },
  { cat: "🌿 Agriculture & Nature", metiers: ["Agriculture / Maraîchage","Élevage","Pêche / Aquaculture","Viticulture","Fleuriste / Horticulture","Produits bio"] },
  { cat: "🎵 Sport & Loisirs", metiers: ["Salle de sport / Fitness","Coach sportif","Club sportif","Arts martiaux","Yoga / Pilates","Danse","Équitation"] },
  { cat: "➕ Autre secteur", metiers: ["Mon secteur n'est pas listé"] },
];

const PLANS = [
  {
    name: "Starter", emoji: "🌱", price: 49,
    desc: "3 modules au choix · Idéal pour démarrer",
    features: ["3 modules au choix", "Wallet & Flutterwave", "1 utilisateur", "Support WhatsApp"],
    highlight: false,
  },
  {
    name: "Business Pro", emoji: "🚀", price: 99,
    desc: "8 modules inclus · Pour les équipes",
    features: ["8 modules au choix", "Wallet + Cartes virtuelles", "5 utilisateurs", "IA & Analytics", "Support prioritaire"],
    highlight: true,
  },
  {
    name: "Enterprise", emoji: "💎", price: 150,
    desc: "Tout inclus · Grandes structures",
    features: ["Tous les modules", "Utilisateurs illimités", "Prospection IA complète", "Support dédié 7j/7"],
    highlight: false,
  },
];

const TAILLES = [
  { label: "1 personne", sub: "Solo" },
  { label: "2 à 5", sub: "Petite équipe" },
  { label: "6 à 20", sub: "PME" },
  { label: "20+", sub: "Grande structure" },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function Inscription() {
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    societe: "", email: "", password: "", pays: "",
    categorie: "", metier: "", taille: "", plan: "", planPrice: 0,
  });

  const update = (key: string, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val }));

  // ── FLUTTERWAVE CONFIG ──
  const flwConfig = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY!,
    tx_ref: `TYM-${Date.now()}`,
    amount: form.planPrice || 49,
    currency: "EUR",
    payment_options: "card,mobilemoney,ussd,banktransfer",
    customer: {
      email: form.email || "client@tymeless.com",
      name: form.societe || "Client",
    },
    customizations: {
      title: "Tymeless OS",
      description: `Abonnement ${form.plan} — ${form.metier}`,
      logo: "https://tymelees-saas-yzel.vercel.app/favicon.ico",
    },
  };

  const handleFlutterPayment = useFlutterwave(flwConfig);

  // ── PAIEMENT ──
  const handlePay = () => {
    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal();
        if (response.status === "successful") {
          setLoading(true);
          try {
            
            await supabase.from("inscriptions").insert([
              {
                societe: form.societe,
                email: form.email,
                pays: form.pays,
                categorie: form.categorie,
                metier: form.metier,
                taille: form.taille,
                plan: form.plan,
                plan_price: form.planPrice,
                flw_tx_ref: response.tx_ref,
                flw_transaction_id: response.transaction_id,
                statut: "actif",
                created_at: new Date().toISOString(),
              },
            ]);
          } catch (e) {
            console.error(e);
          }
          setLoading(false);
          setSuccess(true);
        }
      },
      onClose: () => {},
    });
  };

  const canNext = () => {
    if (step === 1) return form.societe && form.email && form.password && form.pays && form.taille;
    if (step === 2) return form.metier;
    if (step === 3) return form.plan;
    return true;
  };

  const stepTitles = ["Entreprise", "Métier", "Plan", "Paiement"];
  const currentMetiers = METIERS_CATEGORIES.find((c) => c.cat === selectedCat)?.metiers || [];

  // ── SUCCÈS ──
  if (success) {
    return (
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", background: "#0a0a0a", color: "#f0ead6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
        <div>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 300, marginBottom: 16 }}>
            Bienvenue sur <em style={{ color: "#c9a96e", fontStyle: "italic" }}>Tymeless OS !</em>
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, color: "rgba(240,234,214,0.6)", marginBottom: 40, lineHeight: 1.7 }}>
            Votre compte a été créé avec succès.<br />
            Votre dashboard est prêt.
          </p>
          <a href="/dashboard" style={{ background: "linear-gradient(135deg,#c9a96e,#a07c45)", color: "#0a0a0a", padding: "16px 40px", fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600, textDecoration: "none", clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)" }}>
            Accéder à mon dashboard →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", background: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .inp { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.2); color:#f0ead6; padding:14px 16px; font-family:'DM Sans',sans-serif; font-size:15px; outline:none; transition:border-color 0.2s; }
        .inp:focus { border-color:rgba(201,169,110,0.6); }
        .inp::placeholder { color:rgba(240,234,214,0.3); }
        select.inp option { background:#1a1a1a; color:#f0ead6; }
        .cat-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(201,169,110,0.1); padding:12px; text-align:left; cursor:pointer; transition:all 0.2s; width:100%; display:flex; align-items:center; gap:8px; font-family:'DM Sans',sans-serif; }
        .cat-btn:hover { border-color:rgba(201,169,110,0.3); background:rgba(201,169,110,0.04); }
        .cat-btn.active { border-color:#c9a96e; background:rgba(201,169,110,0.08); }
        .metier-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(201,169,110,0.1); padding:11px 14px; text-align:left; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; font-size:13px; color:rgba(240,234,214,0.75); width:100%; }
        .metier-btn:hover { border-color:rgba(201,169,110,0.3); color:#f0ead6; }
        .metier-btn.sel { border-color:#c9a96e; background:rgba(201,169,110,0.08); color:#c9a96e; }
        .taille-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(201,169,110,0.12); padding:16px; cursor:pointer; transition:all 0.2s; text-align:center; font-family:'DM Sans',sans-serif; }
        .taille-btn:hover { border-color:rgba(201,169,110,0.35); }
        .taille-btn.sel { border-color:#c9a96e; background:rgba(201,169,110,0.08); }
        .plan-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(201,169,110,0.15); padding:26px 22px; cursor:pointer; transition:all 0.2s; position:relative; text-align:left; width:100%; font-family:'DM Sans',sans-serif; }
        .plan-btn:hover { border-color:rgba(201,169,110,0.4); transform:translateY(-2px); }
        .plan-btn.sel { border-color:#c9a96e; background:rgba(201,169,110,0.08); }
        .btn-primary { background:linear-gradient(135deg,#c9a96e,#a07c45); color:#0a0a0a; border:none; padding:15px 36px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer; transition:all 0.3s; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); width:100%; letter-spacing:0.04em; }
        .btn-primary:hover { box-shadow:0 8px 28px rgba(201,169,110,0.35); transform:translateY(-1px); }
        .btn-primary:disabled { opacity:0.3; cursor:not-allowed; transform:none; box-shadow:none; }
        .btn-back { background:transparent; color:rgba(240,234,214,0.5); border:1px solid rgba(201,169,110,0.15); padding:14px 24px; font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; transition:all 0.2s; flex-shrink:0; }
        .btn-back:hover { border-color:rgba(201,169,110,0.4); color:#c9a96e; }
        .lbl { font-family:'DM Sans',sans-serif; font-size:12px; color:rgba(240,234,214,0.45); letter-spacing:0.08em; text-transform:uppercase; display:block; margin-bottom:8px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .fade { animation:fadeUp 0.45s ease forwards; }
        @media(max-width:640px) { .taille-grid { grid-template-columns:repeat(2,1fr)!important; } .plans-grid { grid-template-columns:1fr!important; } .step2-grid { grid-template-columns:1fr!important; } }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid rgba(201,169,110,0.1)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontSize: 20, fontWeight: 300, letterSpacing: "0.08em", color: "#c9a96e", textDecoration: "none" }}>
          TYMELESS <em>OS</em>
        </a>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(240,234,214,0.4)" }}>
          Déjà inscrit ?{" "}
          <a href="/dashboard" style={{ color: "#c9a96e", textDecoration: "none" }}>Connexion →</a>
        </span>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "52px 24px 80px" }}>

        {/* PROGRESS */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 48 }}>
          {stepTitles.map((title, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? "#c9a96e" : active ? "rgba(201,169,110,0.12)" : "transparent", border: `1px solid ${done || active ? "#c9a96e" : "rgba(201,169,110,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: done ? "#0a0a0a" : active ? "#c9a96e" : "rgba(240,234,214,0.25)", transition: "all 0.3s" }}>
                    {done ? "✓" : n}
                  </div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: active ? "#c9a96e" : "rgba(240,234,214,0.3)", whiteSpace: "nowrap" }}>{title}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 1, background: step > n ? "#c9a96e" : "rgba(201,169,110,0.12)", margin: "0 6px", marginBottom: 20, transition: "background 0.3s" }} />}
              </div>
            );
          })}
        </div>

        {/* ÉTAPE 1 */}
        {step === 1 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 1 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px,5vw,46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 32 }}>
              Votre <em style={{ fontStyle: "italic", color: "#c9a96e" }}>entreprise</em>
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label className="lbl">Nom de la société *</label><input className="inp" placeholder="Ex: Ndiaye BTP, Restaurant Soleil..." value={form.societe} onChange={e => update("societe", e.target.value)} /></div>
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
                <label className="lbl">Taille de l'entreprise *</label>
                <div className="taille-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {TAILLES.map(t => (
                    <button key={t.label} className={`taille-btn${form.taille === t.label ? " sel" : ""}`} onClick={() => update("taille", t.label)}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ead6", marginBottom: 4 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(240,234,214,0.4)" }}>{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 */}
        {step === 2 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 2 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px,5vw,46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 28 }}>
              Votre <em style={{ fontStyle: "italic", color: "#c9a96e" }}>métier</em>
            </h1>
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
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(240,234,214,0.25)", padding: "20px 16px", border: "1px solid rgba(201,169,110,0.08)", textAlign: "center" }}>
                    ← Sélectionnez une catégorie
                  </div>
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

        {/* ÉTAPE 3 */}
        {step === 3 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 3 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px,5vw,46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 12 }}>
              Votre <em style={{ fontStyle: "italic", color: "#c9a96e" }}>plan</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(240,234,214,0.45)", marginBottom: 28 }}>14 jours d'essai gratuit. Annulez à tout moment.</p>
            <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {PLANS.map(plan => (
                <button key={plan.name} className={`plan-btn${form.plan === plan.name ? " sel" : ""}`} onClick={() => { update("plan", plan.name); update("planPrice", plan.price); }}>
                  {plan.highlight && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#c9a96e", color: "#0a0a0a", fontSize: 10, fontWeight: 700, padding: "3px 14px", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Recommandé</div>}
                  <div style={{ paddingTop: plan.highlight ? 8 : 0 }}>
                    <div style={{ fontSize: 12, color: "rgba(240,234,214,0.5)", marginBottom: 8 }}>{plan.emoji} {plan.name}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 300, color: plan.highlight ? "#c9a96e" : "#f0ead6", lineHeight: 1, marginBottom: 4 }}>
                      {plan.price}<span style={{ fontSize: 14, fontWeight: 300, color: "rgba(240,234,214,0.35)" }}>€/mois</span>
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

        {/* ÉTAPE 4 — PAIEMENT */}
        {step === 4 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 4 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px,5vw,46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 12 }}>
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Paiement</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(240,234,214,0.45)", marginBottom: 24 }}>100% sécurisé via Flutterwave.</p>

            {/* Récap */}
            <div style={{ background: "rgba(201,169,110,0.05)", border: "1px solid rgba(201,169,110,0.18)", padding: "20px 24px", marginBottom: 28 }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(240,234,214,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Récapitulatif</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>{form.societe}</div>
                  <div style={{ fontSize: 13, color: "rgba(240,234,214,0.5)" }}>{form.metier} · {form.pays}</div>
                  <div style={{ fontSize: 13, color: "rgba(240,234,214,0.5)" }}>{form.taille} · Plan {form.plan}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 300, color: "#c9a96e" }}>
                    {form.planPrice}€<span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(240,234,214,0.35)", fontWeight: 300 }}>/mois</span>
                  </div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(240,234,214,0.3)" }}>14 jours gratuits d'abord</div>
                </div>
              </div>
            </div>

            {/* Méthodes info */}
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(240,234,214,0.5)", marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["🌊 Wave", "📱 Orange Money", "📲 MTN", "💳 Visa/Mastercard", "🏦 SEPA", "💰 PayPal"].map(m => (
                <span key={m} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,110,0.1)", padding: "6px 12px", fontSize: 12 }}>{m}</span>
              ))}
            </div>

            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(240,234,214,0.25)", textAlign: "center", marginBottom: 20 }}>
              🔒 SSL · Aucun débit pendant 14 jours · Annulez à tout moment
            </p>
          </div>
        )}

        {/* NAVIGATION */}
        <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
          {step > 1 && (
            <button className="btn-back" onClick={() => setStep(s => s - 1)}>← Retour</button>
          )}
          {step < 4 ? (
            <button className="btn-primary" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>
              {step === 3 ? "Continuer vers le paiement →" : "Continuer →"}
            </button>
          ) : (
            <button className="btn-primary" disabled={loading} onClick={handlePay}>
              {loading ? "Traitement en cours..." : `🚀 Payer ${form.planPrice}€ et accéder au dashboard`}
            </button>
          )}
        </div>

        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(240,234,214,0.2)", textAlign: "center", marginTop: 20 }}>
          En vous inscrivant vous acceptez nos{" "}
          <a href="#" style={{ color: "rgba(201,169,110,0.4)" }}>CGV</a> et notre{" "}
          <a href="#" style={{ color: "rgba(201,169,110,0.4)" }}>politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
}