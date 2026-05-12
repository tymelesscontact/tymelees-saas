"use client";

import { useState } from "react";

// ─── PAYS DU MONDE PAR RÉGION ────────────────────────────────────────────────
const PAYS_REGIONS = [
  {
    region: "🌍 Afrique",
    pays: [
      "Algérie", "Angola", "Bénin", "Botswana", "Burkina Faso", "Burundi",
      "Cameroun", "Cap-Vert", "Centrafrique", "Comores", "Congo", "Côte d'Ivoire",
      "Djibouti", "Égypte", "Érythrée", "Éthiopie", "Gabon", "Gambie",
      "Ghana", "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Kenya",
      "Lesotho", "Liberia", "Libye", "Madagascar", "Malawi", "Mali",
      "Maroc", "Maurice", "Mauritanie", "Mozambique", "Namibie", "Niger",
      "Nigeria", "Ouganda", "RD Congo", "Rwanda", "São Tomé-et-Príncipe",
      "Sénégal", "Sierra Leone", "Somalie", "Soudan", "Soudan du Sud",
      "Tanzanie", "Tchad", "Togo", "Tunisie", "Zambie", "Zimbabwe",
    ],
  },
  {
    region: "🇪🇺 Europe",
    pays: [
      "Albanie", "Allemagne", "Andorre", "Autriche", "Belgique", "Biélorussie",
      "Bosnie-Herzégovine", "Bulgarie", "Chypre", "Croatie", "Danemark",
      "Espagne", "Estonie", "Finlande", "France", "Grèce", "Hongrie",
      "Irlande", "Islande", "Italie", "Kosovo", "Lettonie", "Liechtenstein",
      "Lituanie", "Luxembourg", "Macédoine du Nord", "Malte", "Moldavie",
      "Monaco", "Monténégro", "Norvège", "Pays-Bas", "Pologne", "Portugal",
      "République tchèque", "Roumanie", "Royaume-Uni", "Russie", "Saint-Marin",
      "Serbie", "Slovaquie", "Slovénie", "Suède", "Suisse", "Ukraine",
      "Vatican",
    ],
  },
  {
    region: "🌎 Amériques",
    pays: [
      "Antigua-et-Barbuda", "Argentine", "Bahamas", "Barbade", "Belize",
      "Bolivie", "Brésil", "Canada", "Chili", "Colombie", "Costa Rica",
      "Cuba", "Dominique", "Équateur", "États-Unis", "Grenade", "Guatemala",
      "Guyana", "Haïti", "Honduras", "Jamaïque", "Mexique", "Nicaragua",
      "Panama", "Paraguay", "Pérou", "République dominicaine", "Saint-Kitts-et-Nevis",
      "Saint-Vincent-et-les-Grenadines", "Sainte-Lucie", "Salvador",
      "Suriname", "Trinité-et-Tobago", "Uruguay", "Venezuela",
    ],
  },
  {
    region: "🌏 Asie",
    pays: [
      "Afghanistan", "Bangladesh", "Bhoutan", "Birmanie (Myanmar)", "Brunei",
      "Cambodge", "Chine", "Corée du Nord", "Corée du Sud", "Inde",
      "Indonésie", "Japon", "Kazakhstan", "Kirghizistan", "Laos",
      "Maldives", "Malaisie", "Mongolie", "Népal", "Ouzbékistan",
      "Pakistan", "Philippines", "Singapour", "Sri Lanka", "Tadjikistan",
      "Taïwan", "Thaïlande", "Timor oriental", "Turkménistan", "Vietnam",
    ],
  },
  {
    region: "🇦🇪 Moyen-Orient",
    pays: [
      "Arabie saoudite", "Bahreïn", "Émirats arabes unis (Dubaï)", "Irak",
      "Iran", "Israël", "Jordanie", "Koweït", "Liban", "Oman",
      "Palestine", "Qatar", "Syrie", "Turquie", "Yémen",
    ],
  },
  {
    region: "🌊 Océanie",
    pays: [
      "Australie", "Fidji", "Kiribati", "Marshall", "Micronésie",
      "Nauru", "Nouvelle-Zélande", "Palaos", "Papouasie-Nouvelle-Guinée",
      "Samoa", "Salomon", "Tonga", "Tuvalu", "Vanuatu",
    ],
  },
];

// ─── MÉTIERS PAR CATÉGORIE ────────────────────────────────────────────────────
const METIERS_CATEGORIES = [
  {
    cat: "🏠 Services à domicile",
    metiers: [
      "Nettoyage / Ménage", "Jardinage / Paysagisme", "Plomberie",
      "Électricité", "Peinture / Décoration", "Déménagement", "Chauffagiste",
      "Serrurier", "Vitrier", "Menuisier", "Carreleur", "Maçon",
      "Chef à domicile / Cuisinier", "Aide à domicile / Auxiliaire de vie",
      "Garde d'enfants / Baby-sitter", "Repassage / Pressing",
    ],
  },
  {
    cat: "🏗️ BTP & Artisanat",
    metiers: [
      "Construction / Gros œuvre", "Rénovation", "Architecture",
      "Bureaux d'études", "Terrassement / VRD", "Couverture / Toiture",
      "Isolation / Étanchéité", "Façadier", "Charpentier", "Ferronnerie",
      "Pisciniste", "Ascensoriste", "Climatisation / Ventilation",
      "Soudure / Métallurgie", "Electricité industrielle",
    ],
  },
  {
    cat: "🍽️ Restauration & Food",
    metiers: [
      "Restaurant gastronomique", "Bistrot / Brasserie", "Fast-food / Snack",
      "Café / Salon de thé", "Boulangerie / Pâtisserie", "Traiteur",
      "Food truck", "Dark kitchen / Livraison", "Bar / Lounge",
      "Pizzeria", "Sushi / Japonais", "Africain / Antillais", "Halal",
      "Vegan / Bio", "Charcuterie / Épicerie fine",
    ],
  },
  {
    cat: "🛍️ Commerce & Retail",
    metiers: [
      "Boutique physique", "E-commerce", "Dropshipping", "Marketplace",
      "Épicerie / Supermarché", "Pharmacie / Parapharmacie",
      "Librairie / Papeterie", "Bijouterie / Horlogerie",
      "Prêt-à-porter / Mode", "Chaussures / Maroquinerie",
      "Électronique / Informatique", "Mobilier / Décoration",
      "Fleuriste", "Animalerie", "Jeux / Jouets",
    ],
  },
  {
    cat: "🚗 Transport & Logistique",
    metiers: [
      "Chauffeur VIP / Limousine", "VTC / Taxi", "Transport de marchandises",
      "Livraison / Coursier", "Déménagement professionnel",
      "Transport scolaire", "Ambulance / Transport médical",
      "Aviation / Jet privé", "Yachting / Nautisme", "Hélicoptère",
      "Agence maritime / Fret", "Logistique / Entrepôt", "Import / Export",
      "Douane / Transit", "Chaîne froide / Alimentaire",
    ],
  },
  {
    cat: "🩺 Santé & Bien-être",
    metiers: [
      "Médecin généraliste", "Spécialiste médical", "Dentiste",
      "Kinésithérapeute", "Ostéopathe", "Infirmier / Soins à domicile",
      "Psychologue / Psychiatre", "Nutritionniste / Diététicien",
      "Opticien", "Podologue", "Orthophoniste", "Pharmacien",
      "Laboratoire / Analyses", "Clinique / Centre médical",
      "Médecine douce / Naturopathie", "Coach bien-être / Yoga",
    ],
  },
  {
    cat: "💅 Beauté & Esthétique",
    metiers: [
      "Coiffeur / Salon de coiffure", "Coiffure afro / Tresses",
      "Esthéticienne / Institut", "Onglerie / Nail art",
      "Maquillage professionnel", "Tatouage / Piercing",
      "Spa / Hammam", "Massage / Relaxation",
      "Microblading / Sourcils", "Extension de cils",
      "Barbier", "Cosmétiques / Produits beauté",
    ],
  },
  {
    cat: "🏨 Hôtellerie & Tourisme",
    metiers: [
      "Hôtel", "Gîte / Chambre d'hôtes", "Airbnb / Location courte durée",
      "Resort / Club", "Agence de voyage", "Guide touristique",
      "Conciergerie hôtelière", "Camping / Glamping",
      "Croisière", "Tour operator", "Location de voitures",
      "Activités touristiques / Excursions",
    ],
  },
  {
    cat: "🏠 Conciergerie & Services Premium",
    metiers: [
      "Conciergerie privée", "Conciergerie d'entreprise",
      "Conciergerie Airbnb / Location", "Personal shopper",
      "Assistant personnel / VA", "Majordome",
      "Organisation d'événements privés", "Gestion de propriétés de luxe",
      "Rapatriement de corps", "Services funéraires",
      "Garde du corps / Sécurité VIP", "Yacht management",
    ],
  },
  {
    cat: "🔐 Sécurité",
    metiers: [
      "Agent de sécurité", "Garde du corps", "Société de surveillance",
      "Télésurveillance / Alarmes", "Sécurité événementielle",
      "Sécurité privée d'entreprise", "Cybersécurité",
      "Installation caméras / Vidéosurveillance",
    ],
  },
  {
    cat: "🏘️ Immobilier",
    metiers: [
      "Agence immobilière", "Agent immobilier indépendant",
      "Promoteur immobilier", "Gestion locative", "Syndic de copropriété",
      "Home staging", "Expertise immobilière / Estimation",
      "Notaire", "Marchand de biens", "Investissement locatif",
    ],
  },
  {
    cat: "⚖️ Juridique & Finance",
    metiers: [
      "Avocat", "Notaire", "Huissier de justice", "Comptable / Expert-comptable",
      "Conseiller financier / Patrimoine", "Courtier en assurance",
      "Courtier en crédit / Prêt", "Fiscaliste", "Auditeur",
      "Consultant RH", "Cabinet de recrutement", "Commissaire aux comptes",
    ],
  },
  {
    cat: "💻 Tech & Digital",
    metiers: [
      "Développeur web / mobile", "Designer UI/UX", "Graphiste",
      "Agence digitale / Web agency", "SEO / Marketing digital",
      "Community manager", "Créateur de contenu / Influenceur",
      "Photographe / Vidéaste", "Motion designer", "Data analyst",
      "Intelligence artificielle / IA", "Cybersécurité",
      "Consultant informatique", "Formation digitale",
    ],
  },
  {
    cat: "📚 Éducation & Formation",
    metiers: [
      "École / Établissement scolaire", "Centre de formation professionnelle",
      "Autoécole", "Soutien scolaire / Cours particuliers",
      "Formation en ligne / E-learning", "Coach / Mentor",
      "Formateur entreprise", "Université / Grande école",
      "Crèche / Garderie", "Centre de langues",
      "Formation en développement personnel",
    ],
  },
  {
    cat: "📸 Événementiel & Divertissement",
    metiers: [
      "Organisation de mariages", "Organisation d'événements corporate",
      "Photographe événementiel", "Vidéaste / Filming",
      "DJ / Animateur", "Traiteur événementiel", "Location de salle",
      "Décoration événementielle", "Artiste / Musicien",
      "Agence de booking artistique", "Stand-up / Humour",
      "Escape game / Loisirs", "Casino / Jeux",
    ],
  },
  {
    cat: "🌿 Agriculture & Nature",
    metiers: [
      "Agriculture / Maraîchage", "Élevage", "Pêche / Aquaculture",
      "Viticulture / Vignoble", "Arboriculture / Verger",
      "Fleuriste / Horticulture", "Apiculture / Miel",
      "Foresterie / Bois", "Paysagisme professionnel",
      "Produits bio / Circuit court", "Agro-industrie",
    ],
  },
  {
    cat: "🎨 Artisanat & Création",
    metiers: [
      "Couture / Stylisme", "Bijouterie artisanale", "Poterie / Céramique",
      "Menuiserie artisanale / Ébénisterie", "Forgeron / Coutelier",
      "Broderie / Tissage", "Cosmétiques artisanaux", "Bougie / Parfum",
      "Maroquinerie / Cuir", "Art / Peinture / Sculpture",
      "Impression / Sérigraphie", "Créations made in Afrique",
    ],
  },
  {
    cat: "📦 Import / Export & Commerce international",
    metiers: [
      "Import / Export général", "Commerce de véhicules d'occasion",
      "Friperie / Vêtements import", "Produits alimentaires internationaux",
      "Matériaux de construction import", "Électronique / High-tech import",
      "Cosmétiques import/export", "Médicaments / Pharma international",
      "Transfert d'argent / Remittance", "Diaspora / Envoi de colis",
    ],
  },
  {
    cat: "🎵 Sport & Loisirs",
    metiers: [
      "Salle de sport / Fitness", "Coach sportif personnel",
      "Club de foot / Sport collectif", "Arts martiaux / Boxe",
      "Natation / Piscine", "Tennis / Padel", "Golf",
      "Yoga / Pilates", "Danse / École de danse",
      "Équitation / Centre équestre", "Sport nautique",
    ],
  },
  {
    cat: "➕ Autre secteur",
    metiers: [
      "Mon secteur n'est pas listé — Je le préciserai plus tard",
    ],
  },
];

// ─── PLANS ───────────────────────────────────────────────────────────────────
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
  { label: "1 personne", sub: "Solo / Auto-entrepreneur" },
  { label: "2 à 5", sub: "Petite équipe" },
  { label: "6 à 20", sub: "PME" },
  { label: "20+", sub: "Grande structure" },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Inscription() {
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState("");
  const [form, setForm] = useState({
    societe: "", email: "", password: "", pays: "", region: "",
    categorie: "", metier: "", taille: "", plan: "",
  });

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const canNext = () => {
    if (step === 1) return form.societe && form.email && form.password && form.pays && form.taille;
    if (step === 2) return form.metier;
    if (step === 3) return form.plan;
    return true;
  };

  const stepTitles = ["Votre entreprise", "Votre métier", "Votre plan", "Paiement"];

  const currentMetiers = METIERS_CATEGORIES.find(c => c.cat === selectedCat)?.metiers || [];

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", background: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .inp {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,169,110,0.2);
          color: #f0ead6;
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .inp:focus { border-color: rgba(201,169,110,0.6); }
        .inp::placeholder { color: rgba(240,234,214,0.3); }
        select.inp option { background: #1a1a1a; color: #f0ead6; }

        .cat-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,169,110,0.1);
          padding: 14px 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cat-btn:hover { border-color: rgba(201,169,110,0.3); background: rgba(201,169,110,0.04); }
        .cat-btn.active { border-color: #c9a96e; background: rgba(201,169,110,0.08); }

        .metier-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,169,110,0.1);
          padding: 11px 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: rgba(240,234,214,0.75);
          width: 100%;
        }
        .metier-btn:hover { border-color: rgba(201,169,110,0.3); color: #f0ead6; }
        .metier-btn.selected { border-color: #c9a96e; background: rgba(201,169,110,0.08); color: #c9a96e; }

        .taille-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,169,110,0.12);
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .taille-btn:hover { border-color: rgba(201,169,110,0.35); }
        .taille-btn.selected { border-color: #c9a96e; background: rgba(201,169,110,0.08); }

        .plan-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,169,110,0.15);
          padding: 28px 22px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          text-align: left;
          width: 100%;
        }
        .plan-btn:hover { border-color: rgba(201,169,110,0.4); transform: translateY(-3px); }
        .plan-btn.selected { border-color: #c9a96e; background: rgba(201,169,110,0.08); }

        .btn-primary {
          background: linear-gradient(135deg, #c9a96e, #a07c45);
          color: #0a0a0a; border: none;
          padding: 15px 36px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.3s;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          width: 100%; letter-spacing: 0.04em;
        }
        .btn-primary:hover { box-shadow: 0 8px 28px rgba(201,169,110,0.35); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }

        .btn-back {
          background: transparent; color: rgba(240,234,214,0.5);
          border: 1px solid rgba(201,169,110,0.15);
          padding: 14px 24px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          cursor: pointer; transition: all 0.2s;
          flex-shrink: 0;
        }
        .btn-back:hover { border-color: rgba(201,169,110,0.4); color: #c9a96e; }

        .pay-method {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,169,110,0.12);
          padding: 18px 20px;
          display: flex; align-items: center; gap: 14px;
          cursor: pointer; transition: all 0.2s;
        }
        .pay-method:hover { border-color: rgba(201,169,110,0.35); background: rgba(201,169,110,0.04); }

        .lbl {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: rgba(240,234,214,0.45);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .fade { animation: fadeUp 0.45s ease forwards; }

        @media (max-width: 640px) {
          .taille-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .step2-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid rgba(201,169,110,0.1)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontSize: 20, fontWeight: 300, letterSpacing: "0.08em", color: "#c9a96e", textDecoration: "none" }}>
          TYMELESS <em>OS</em>
        </a>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.4)" }}>
          Déjà inscrit ?{" "}
          <a href="/dashboard" style={{ color: "#c9a96e", textDecoration: "none" }}>Connexion →</a>
        </span>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "52px 24px 80px" }}>

        {/* PROGRESS BAR */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
            {stepTitles.map((title, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: done ? "#c9a96e" : active ? "rgba(201,169,110,0.12)" : "transparent",
                      border: `1px solid ${done || active ? "#c9a96e" : "rgba(201,169,110,0.2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                      color: done ? "#0a0a0a" : active ? "#c9a96e" : "rgba(240,234,214,0.25)",
                      flexShrink: 0, transition: "all 0.3s",
                    }}>{done ? "✓" : num}</div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: active ? "#c9a96e" : "rgba(240,234,214,0.3)", letterSpacing: "0.04em", textAlign: "center", lineHeight: 1.3 }}>{title}</span>
                  </div>
                  {i < stepTitles.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: step > num ? "#c9a96e" : "rgba(201,169,110,0.12)", margin: "0 6px", marginBottom: 22, transition: "background 0.3s" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ÉTAPE 1 — INFOS ── */}
        {step === 1 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 1 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 8 }}>
              Votre <em style={{ fontStyle: "italic", color: "#c9a96e" }}>entreprise</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(240,234,214,0.45)", marginBottom: 36, lineHeight: 1.6 }}>
              Créez votre compte en 2 minutes.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="lbl">Nom de la société *</label>
                <input className="inp" placeholder="Ex: Ndiaye BTP, Conciergerie Élite, Restaurant Soleil..." value={form.societe} onChange={e => update("societe", e.target.value)} />
              </div>
              <div>
                <label className="lbl">Email professionnel *</label>
                <input className="inp" type="email" placeholder="contact@votre-societe.com" value={form.email} onChange={e => update("email", e.target.value)} />
              </div>
              <div>
                <label className="lbl">Mot de passe *</label>
                <input className="inp" type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={e => update("password", e.target.value)} />
              </div>

              {/* Pays — par région */}
              <div>
                <label className="lbl">Pays *</label>
                <select className="inp" value={form.pays} onChange={e => update("pays", e.target.value)}>
                  <option value="">Sélectionnez votre pays...</option>
                  {PAYS_REGIONS.map(r => (
                    <optgroup key={r.region} label={r.region}>
                      {r.pays.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Taille */}
              <div>
                <label className="lbl">Taille de l'entreprise *</label>
                <div className="taille-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {TAILLES.map(t => (
                    <button key={t.label} className={`taille-btn${form.taille === t.label ? " selected" : ""}`} onClick={() => update("taille", t.label)}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ead6", marginBottom: 4 }}>{t.label}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(240,234,214,0.4)" }}>{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 — MÉTIER ── */}
        {step === 2 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 2 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 8 }}>
              Votre <em style={{ fontStyle: "italic", color: "#c9a96e" }}>métier</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(240,234,214,0.45)", marginBottom: 32, lineHeight: 1.6 }}>
              Le dashboard s'adapte automatiquement à votre activité.
            </p>

            <div className="step2-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Catégories */}
              <div>
                <label className="lbl">1. Choisissez une catégorie</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
                  {METIERS_CATEGORIES.map(c => (
                    <button
                      key={c.cat}
                      className={`cat-btn${selectedCat === c.cat ? " active" : ""}`}
                      onClick={() => { setSelectedCat(c.cat); update("categorie", c.cat); update("metier", ""); }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{c.cat.split(" ")[0]}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: selectedCat === c.cat ? "#c9a96e" : "rgba(240,234,214,0.7)" }}>
                        {c.cat.split(" ").slice(1).join(" ")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Métiers */}
              <div>
                <label className="lbl">2. Choisissez votre métier précis</label>
                {!selectedCat ? (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.25)", padding: "20px 16px", border: "1px solid rgba(201,169,110,0.08)", textAlign: "center", lineHeight: 1.6 }}>
                    ← Sélectionnez d'abord une catégorie
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
                    {currentMetiers.map(m => (
                      <button
                        key={m}
                        className={`metier-btn${form.metier === m ? " selected" : ""}`}
                        onClick={() => update("metier", m)}
                      >
                        {form.metier === m ? "◆ " : "· "}{m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {form.metier && (
              <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.25)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#c9a96e" }}>✓</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  Métier sélectionné : <strong style={{ color: "#c9a96e" }}>{form.metier}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── ÉTAPE 3 — PLAN ── */}
        {step === 3 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 3 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 8 }}>
              Votre <em style={{ fontStyle: "italic", color: "#c9a96e" }}>plan</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(240,234,214,0.45)", marginBottom: 36, lineHeight: 1.6 }}>
              14 jours d'essai gratuit inclus. Annulez à tout moment.
            </p>
            <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {PLANS.map(plan => (
                <button key={plan.name} className={`plan-btn${form.plan === plan.name ? " selected" : ""}`} onClick={() => update("plan", plan.name)}>
                  {plan.highlight && (
                    <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#c9a96e", color: "#0a0a0a", fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, padding: "3px 14px", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      Recommandé
                    </div>
                  )}
                  <div style={{ paddingTop: plan.highlight ? 8 : 0 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.5)", marginBottom: 8 }}>{plan.emoji} {plan.name}</div>
                    <div style={{ fontSize: 38, fontWeight: 300, color: plan.highlight ? "#c9a96e" : "#f0ead6", lineHeight: 1, marginBottom: 4 }}>
                      {plan.price}<span style={{ fontSize: 14, fontWeight: 300, color: "rgba(240,234,214,0.35)", fontFamily: "'DM Sans', sans-serif" }}>€/mois</span>
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.4)", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(201,169,110,0.1)" }}>{plan.desc}</div>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.65)", marginBottom: 8, alignItems: "flex-start" }}>
                        <span style={{ color: "#c9a96e", flexShrink: 0 }}>◆</span>{f}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 4 — PAIEMENT ── */}
        {step === 4 && (
          <div className="fade">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 10 }}>Étape 4 sur 4</p>
            <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 8 }}>
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Paiement</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(240,234,214,0.45)", marginBottom: 32, lineHeight: 1.6 }}>
              Choisissez votre moyen de paiement. 100% sécurisé via Flutterwave.
            </p>

            {/* Récap */}
            <div style={{ background: "rgba(201,169,110,0.05)", border: "1px solid rgba(201,169,110,0.18)", padding: "20px 24px", marginBottom: 28 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(240,234,214,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Récapitulatif de votre inscription</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 500 }}>{form.societe}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.45)" }}>{form.metier} · {form.pays}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.45)" }}>{form.taille} · Plan {form.plan}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 32, fontWeight: 300, color: "#c9a96e" }}>
                    {PLANS.find(p => p.name === form.plan)?.price}€
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.35)", fontWeight: 300 }}>/mois</span>
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(240,234,214,0.35)" }}>14 jours gratuits d'abord</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {[
                { icon: "🌊", name: "Wave", sub: "Sénégal, Mali, Côte d'Ivoire, Burkina..." },
                { icon: "📱", name: "Orange Money", sub: "Afrique de l'Ouest & Centrale" },
                { icon: "📲", name: "MTN Mobile Money", sub: "Ghana, Cameroun, Côte d'Ivoire..." },
                { icon: "💳", name: "Visa / Mastercard", sub: "Paiement par carte bancaire internationale" },
                { icon: "🏦", name: "Virement SEPA", sub: "Europe — France, Belgique, Suisse, etc." },
                { icon: "💰", name: "PayPal", sub: "Disponible dans le monde entier" },
              ].map(m => (
                <div key={m.name} className="pay-method">
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.4)" }}>{m.sub}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#c9a96e", flexShrink: 0 }}>Sélectionner →</div>
                </div>
              ))}
            </div>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.25)", textAlign: "center", lineHeight: 1.7 }}>
              🔒 Paiement sécurisé SSL · Aucun débit pendant 14 jours · Annulez à tout moment
            </p>
          </div>
        )}

        {/* NAVIGATION */}
        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          {step > 1 && (
            <button className="btn-back" onClick={() => setStep(s => s - 1)}>← Retour</button>
          )}
          <button
            className="btn-primary"
            disabled={!canNext()}
            onClick={() => {
              if (step < 4) setStep(s => s + 1);
              // Step 4 : intégration Flutterwave à connecter
            }}
          >
            {step === 4
              ? "🚀 Finaliser et accéder au dashboard"
              : step === 3
              ? "Continuer vers le paiement →"
              : "Continuer →"}
          </button>
        </div>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.2)", textAlign: "center", marginTop: 20 }}>
          En vous inscrivant vous acceptez nos{" "}
          <a href="#" style={{ color: "rgba(201,169,110,0.4)" }}>CGV</a> et notre{" "}
          <a href="#" style={{ color: "rgba(201,169,110,0.4)" }}>politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
}