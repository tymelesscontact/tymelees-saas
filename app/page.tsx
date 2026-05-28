"use client";

import { useState, useEffect, useRef } from "react";

const WA_NUMBER = "33765189527";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;

const PLANS = [
  {
    name: "Starter", price: "49",
    desc: "Pour démarrer votre activité avec les outils essentiels.",
    color: "#c9a96e", highlight: false,
    features: ["3 modules au choix", "Wallet & Flutterwave inclus", "1 utilisateur", "Support WhatsApp"],
    no: ["IA & Analytics", "Prospection automatique"],
    cta: "Commencer gratuitement",
  },
  {
    name: "Business Pro", price: "99",
    desc: "Le plan complet pour les entreprises en croissance.",
    color: "#d4af6a", highlight: true,
    features: ["8 modules au choix", "Wallet + Cartes virtuelles", "Jusqu\u0027à 5 utilisateurs", "IA & Analytics inclus", "Support prioritaire"],
    no: ["Prospection automatique"],
    cta: "Démarrer l\u0027essai",
  },
  {
    name: "Enterprise", price: "150",
    desc: "Pour les grandes structures et franchises multi-sites.",
    color: "#e8d5a3", highlight: false,
    features: ["Tous les modules", "Cartes VIP illimitées", "Utilisateurs illimités", "Prospection IA complète", "Support dédié 7j/7", "Configuration sur mesure"],
    no: [],
    cta: "Nous contacter",
  },
];

const MODULES = [
  { icon: "📊", label: "Vue d\u0027ensemble", desc: "KPIs, score santé, missions du jour" },
  { icon: "📋", label: "Devis validés", desc: "Workflow approbation propriétaire" },
  { icon: "💳", label: "Wallet & Paiements", desc: "Wave, Orange Money, Visa, SEPA" },
  { icon: "👥", label: "CRM Clients", desc: "VIP, multilingual, historique" },
  { icon: "🤝", label: "Partenaires", desc: "Commissions, CA apporteurs" },
  { icon: "📅", label: "Planning", desc: "Missions hebdo par collaborateur" },
  { icon: "🔍", label: "Prospection IA", desc: "Multi-canal, 59 fonctionnalités" },
  { icon: "📈", label: "Analytique", desc: "Prédiction CA, tendances, growth" },
  { icon: "💎", label: "Cartes Virtuelles", desc: "Visa virtuelles pour votre équipe" },
  { icon: "⭐", label: "NPS & Avis", desc: "Google, satisfaction client" },
  { icon: "💬", label: "Chat Équipe", desc: "WhatsApp-style, temps réel" },
  { icon: "🚀", label: "Déploiement SaaS", desc: "Marque blanche, vos clients" },
];

const SECTORS = [
  { icon: "🌿", name: "Jardinage", sub: "Paysagiste, entretien" },
  { icon: "🧹", name: "Nettoyage", sub: "Ménage, pressing" },
  { icon: "🏗️", name: "BTP", sub: "Construction, rénovation" },
  { icon: "🔧", name: "Plomberie", sub: "Dépannage, installation" },
  { icon: "⚡", name: "Électricité", sub: "Electricien, installation" },
  { icon: "🎨", name: "Peinture", sub: "Décoration, rénovation" },
  { icon: "🚛", name: "Déménagement", sub: "Transport, logistique" },
  { icon: "🍳", name: "Chef à domicile", sub: "Traiteur, événementiel" },
  { icon: "🏨", name: "Hôtellerie", sub: "Hôtel, gîte, Airbnb" },
  { icon: "🏠", name: "Conciergerie", sub: "Services premium" },
  { icon: "✈️", name: "Aviation", sub: "Jet privé, charter" },
  { icon: "🛥️", name: "Yachting", sub: "Location, entretien" },
  { icon: "🚗", name: "Transport VIP", sub: "Chauffeur, limousine" },
  { icon: "🔐", name: "Sécurité", sub: "Garde du corps, surveillance" },
  { icon: "💅", name: "Beauté", sub: "Coiffeur, esthétique" },
  { icon: "🍽️", name: "Restaurant", sub: "Café, fast-food, gastronomie" },
  { icon: "🛍️", name: "Commerce", sub: "Boutique, e-commerce" },
  { icon: "🏘️", name: "Immobilier", sub: "Agence, gestion locative" },
  { icon: "📸", name: "Événementiel", sub: "Photographe, organisateur" },
  { icon: "💻", name: "Freelance", sub: "Dev, designer, consultant" },
  { icon: "⚖️", name: "Juridique", sub: "Avocat, notaire, RH" },
  { icon: "🩺", name: "Santé", sub: "Cabinet médical, kiné" },
  { icon: "📚", name: "Formation", sub: "Coach, formateur, école" },
  { icon: "📦", name: "Import / Export", sub: "Commerce international" },
  { icon: "🌍", name: "Diaspora Afrique", sub: "Sénégal, CI, Maroc..." },
  { icon: "🕊️", name: "Rapatriement", sub: "Corps, dossiers consulaires" },
  { icon: "🧴", name: "Cosmétiques", sub: "Vente, fabrication" },
  { icon: "🐾", name: "Animalerie", sub: "Vétérinaire, pet-sitting" },
  { icon: "🎵", name: "Artiste / Music", sub: "Booking, management" },
  { icon: "➕", name: "Et bien plus...", sub: "Tout secteur accepté" },
];

const COMPARE = [
  { feature: "Wave / Orange Money / MTN", us: "✓ Tous", b: "✓", c: "✗", d: "✗" },
  { feature: "Visa / Mastercard / SEPA", us: "✓", b: "✗", c: "✓", d: "✗" },
  { feature: "Tous secteurs métiers", us: "✓ Universel", b: "Limité", c: "✓", d: "✓" },
  { feature: "Devis → Paiement en 1 clic", us: "✓", b: "✗", c: "✗", d: "✗" },
  { feature: "Prospection IA automatique", us: "✓ Claude AI", b: "✗", c: "Limité", d: "✗" },
  { feature: "Cartes virtuelles équipe", us: "✓", b: "✗", c: "✗", d: "✗" },
  { feature: "Rapport WhatsApp auto", us: "✓", b: "✗", c: "✗", d: "✗" },
  { feature: "Prix d\u0027entrée", us: "49 €/mois", b: "~15 €", c: "+800 €/mois", d: "Gratuit" },
];

const FAQS = [
  { q: "Xyra est-il adapté à mon secteur ?", a: "Oui ! Xyra est universel — jardinier, plombier, conciergerie, restaurant, avocat, BTP, coach... À l\u0027inscription vous choisissez votre secteur et le dashboard s\u0027adapte automatiquement." },
  { q: "Quels moyens de paiement sont acceptés ?", a: "Via Flutterwave : Wave, Orange Money, MTN Mobile Money, Airtel Money, Visa, Mastercard, virement SEPA, PayPal. Toute l\u0027Afrique, l\u0027Europe et le monde entier sont couverts." },
  { q: "Mes données sont-elles sécurisées ?", a: "Absolument. Chaque entreprise a ses données 100% isolées. Infrastructure Supabase sécurisée, conforme RGPD, chiffrement de bout en bout." },
  { q: "Puis-je louer un seul module ?", a: "Oui ! Vous pouvez louer uniquement le module dont vous avez besoin — par exemple juste le Wallet & Paiements à 29€/mois. Ajoutez d\u0027autres modules à tout moment." },
  { q: "Y a-t-il un support disponible ?", a: "Support WhatsApp disponible 7j/7. Documentation complète en français. Vidéos tutoriels. Le plan Enterprise inclut un support dédié avec accompagnement personnalisé." },
  { q: "Xyra fonctionne-t-il en Afrique ?", a: "C\u0027est l\u0027un de nos points forts ! Conçu pour la France ET l\u0027Afrique — Sénégal, Côte d\u0027Ivoire, Maroc, Cameroun, Dubaï. Wave et Orange Money sont intégrés nativement." },
  { q: "Puis-je annuler à tout moment ?", a: "Oui, sans frais, sans engagement. Vous pouvez annuler, changer de plan ou ajouter des modules depuis votre tableau de bord à tout moment." },
];

const TESTIMONIALS = [
  { name: "Aminata D.", role: "Conciergerie — Dakar, Sénégal", text: "Avant je gérais tout sur Excel et WhatsApp. Maintenant mes devis sont envoyés en 30 secondes, mes clients paient par Wave et tout est tracé. Je gagne 2h par jour." },
  { name: "Marc T.", role: "Paysagiste — Lyon, France", text: "Je pensais que ces outils n\u0027étaient pas pour moi. Xyra m\u0027a surpris — en 10 minutes j\u0027avais mon planning, mes devis et mon wallet configurés." },
  { name: "Sofia R.", role: "Agence événementielle — Paris & Casablanca", text: "On accepte Orange Money et Visa en même temps. Le bot de prospection nous a apporté 8 nouveaux clients en 1 mois." },
];

function useCountUp(target, duration = 1800, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return val;
}

export default function XyraLanding() {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [trialDays] = useState(14);
  const statsRef = useRef(null);

  const stat1 = useCountUp(47, 1800, statsVisible);
  const stat2 = useCountUp(98, 1600, statsVisible);
  const stat3 = useCountUp(12, 1400, statsVisible);
  const stat4 = useCountUp(49, 1200, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const annualPrice = (price) => Math.round(price * 0.8);
  const isGood = (v) => v.startsWith("✓") || v === "Gratuit";

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", background: "#0a0a0a", color: "#f0ead6", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .gold { color: #c9a96e; }
        .gold-gradient { background: linear-gradient(135deg, #c9a96e, #e8d5a3, #c9a96e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .btn-primary { background: linear-gradient(135deg, #c9a96e, #a07c45); color: #0a0a0a; border: none; padding: 14px 32px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; letter-spacing: 0.05em; cursor: pointer; transition: all 0.3s ease; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,169,110,0.4); }
        .btn-outline { background: transparent; color: #c9a96e; border: 1px solid rgba(201,169,110,0.4); padding: 13px 32px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 400; letter-spacing: 0.05em; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-outline:hover { border-color: #c9a96e; background: rgba(201,169,110,0.05); }
        .nav-link { font-family: 'DM Sans', sans-serif; font-size: 14px; color: rgba(240,234,214,0.7); text-decoration: none; letter-spacing: 0.06em; transition: color 0.2s; cursor: pointer; background: none; border: none; }
        .nav-link:hover { color: #c9a96e; }
        .module-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(201,169,110,0.12); padding: 24px 20px; transition: all 0.3s ease; }
        .module-card:hover { background: rgba(201,169,110,0.06); border-color: rgba(201,169,110,0.3); transform: translateY(-4px); }
        .sector-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(201,169,110,0.1); padding: 18px; text-align: center; transition: all 0.3s ease; border-radius: 2px; }
        .sector-card:hover { background: rgba(201,169,110,0.06); border-color: rgba(201,169,110,0.3); transform: translateY(-3px); }
        .plan-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(201,169,110,0.15); padding: 40px 32px; transition: all 0.3s ease; position: relative; }
        .plan-card.featured { background: rgba(201,169,110,0.06); border-color: rgba(201,169,110,0.5); }
        .plan-card:hover { transform: translateY(-6px); }
        .divider { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #c9a96e, transparent); margin: 0 auto; }
        .grain { position: fixed; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 0; opacity: 0.025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 256px; }
        .hero-glow { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(ellipse, rgba(201,169,110,0.08) 0%, transparent 70%); pointer-events: none; }
        .fade-in { animation: fadeIn 0.8s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .scroll-line { width: 1px; height: 60px; background: linear-gradient(180deg, rgba(201,169,110,0.6), transparent); margin: 0 auto; animation: scrollPulse 2s ease infinite; }
        @keyframes scrollPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .stat-number { font-size: clamp(48px, 7vw, 80px); font-weight: 300; letter-spacing: -0.02em; line-height: 1; }
        .toggle-pill { display: inline-flex; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,169,110,0.2); border-radius: 999px; padding: 4px; gap: 4px; }
        .toggle-option { padding: 8px 20px; border-radius: 999px; font-family: 'DM Sans', sans-serif; font-size: 13px; letter-spacing: 0.04em; transition: all 0.2s; cursor: pointer; border: none; background: transparent; color: rgba(240,234,214,0.5); }
        .toggle-option.active { background: rgba(201,169,110,0.2); color: #c9a96e; }
        .check-item { display: flex; align-items: flex-start; gap: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: rgba(240,234,214,0.75); margin-bottom: 12px; }
        .check-icon { color: #c9a96e; font-size: 12px; margin-top: 2px; flex-shrink: 0; }
        .cross-item { display: flex; align-items: flex-start; gap: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: rgba(240,234,214,0.3); margin-bottom: 12px; }
        .badge { display: inline-block; background: rgba(201,169,110,0.15); border: 1px solid rgba(201,169,110,0.3); color: #c9a96e; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 14px; }
        .section-label { font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #c9a96e; margin-bottom: 16px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .pulse { animation: pulse 2s infinite; }
        .trial-banner { background: linear-gradient(90deg, rgba(201,169,110,0.15), rgba(201,169,110,0.08), rgba(201,169,110,0.15)); border-top: 1px solid rgba(201,169,110,0.3); border-bottom: 1px solid rgba(201,169,110,0.3); padding: 12px 24px; text-align: center; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #c9a96e; letter-spacing: 0.05em; }
        .cmp-table { width: 100%; border-collapse: collapse; }
        .cmp-table th { padding: 13px 16px; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; color: rgba(240,234,214,0.4); letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid rgba(201,169,110,0.12); text-align: left; }
        .cmp-table td { padding: 13px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); font-family: 'DM Sans', sans-serif; font-size: 13px; }
        .cmp-table td:first-child { color: rgba(240,234,214,0.5); }
        .cmp-table .td-us { color: #c9a96e; font-weight: 600; background: rgba(201,169,110,0.04); }
        .cmp-table .td-y { color: #2EC99A; font-weight: 600; }
        .cmp-table .td-n { color: rgba(240,234,214,0.25); }
        .faq-item { border-bottom: 1px solid rgba(201,169,110,0.1); }
        .faq-q { padding: 20px 0; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; background: none; border: none; color: #f0ead6; width: 100%; text-align: left; }
        .faq-a { font-family: 'DM Sans', sans-serif; font-size: 14px; color: rgba(240,234,214,0.6); line-height: 1.75; overflow: hidden; transition: max-height 0.35s ease, padding 0.35s ease; }
        .wa-float { position: fixed; bottom: 28px; right: 28px; z-index: 999; background: #25D366; color: #fff; width: 58px; height: 58px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; text-decoration: none; box-shadow: 0 4px 24px rgba(37,211,102,0.5); transition: all 0.2s; }
        .wa-float:hover { transform: scale(1.1); }
        .wa-tooltip { position: absolute; right: 72px; background: #25D366; color: #fff; padding: 7px 14px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; white-space: nowrap; opacity: 0; transition: opacity 0.2s; pointer-events: none; }
        .wa-float:hover .wa-tooltip { opacity: 1; }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .modules-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .sectors-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .compare-wrap { overflow-x: auto; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .prospect-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="grain" />

      {/* ── BANDEAU ESSAI GRATUIT ── */}
      <div className="trial-banner">
        🎁 Essai gratuit <strong>{trialDays} jours</strong> — Accès complet · Sans carte bancaire · Sans engagement
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(201,169,110,0.1)", padding: "0 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          <span style={{ fontSize: 22, fontWeight: 300, letterSpacing: "0.12em" }}>
            XYRA
          </span>
          <div className="desktop-only" style={{ display: "flex", gap: 36 }}>
            {[["Fonctionnalités", "#features"], ["Secteurs", "#sectors"], ["Tarifs", "#pricing"], ["FAQ", "#faq"]].map(([l, h]) => (
              <a key={l} className="nav-link" href={h}>{l}</a>
            ))}
          </div>
          <a className="btn-primary" href="/inscription" style={{ padding: "10px 24px", fontSize: 13 }}>
            Essai gratuit 14j →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "95vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 24px 80px", overflow: "hidden" }}>
        <div className="hero-glow" />
        <div style={{ position: "absolute", top: 0, left: "20%", width: 1, height: "40%", background: "linear-gradient(180deg, transparent, rgba(201,169,110,0.15), transparent)" }} />
        <div style={{ position: "absolute", top: 0, right: "20%", width: 1, height: "40%", background: "linear-gradient(180deg, transparent, rgba(201,169,110,0.15), transparent)" }} />

        <div className="fade-in" style={{ maxWidth: 900, position: "relative", zIndex: 1 }}>
          <div className="badge" style={{ marginBottom: 28 }}>
            <span className="pulse" style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#2EC99A", marginRight: 8, verticalAlign: "middle" }} />
            Disponible en France · Afrique · Monde entier
          </div>

          <h1 style={{ fontSize: "clamp(46px, 8vw, 90px)", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 28 }}>
            Le système de gestion<br />
            <span className="gold-gradient" style={{ fontStyle: "italic" }}>pour toute entreprise,</span><br />
            <span style={{ fontWeight: 300, fontSize: "0.85em", color: "rgba(240,234,214,0.8)" }}>partout dans le monde</span>
          </h1>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 300, color: "rgba(240,234,214,0.65)", lineHeight: 1.7, maxWidth: 620, margin: "0 auto 24px", letterSpacing: "0.01em" }}>
            Wallet, Devis, CRM, Planning, Prospection IA, Cartes virtuelles — tout en un seul dashboard. Que vous soyez jardinier, restaurateur, conciergerie ou BTP.
          </p>

          {/* Paiements */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.4)" }}>Paiements :</span>
            {["🌊 Wave", "📱 Orange Money", "📲 MTN", "💳 Visa/Mastercard", "🏦 SEPA"].map(p => (
              <span key={p} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,110,0.15)", padding: "4px 10px", color: "rgba(240,234,214,0.6)" }}>{p}</span>
            ))}
          </div>

          {/* Bandeau essai */}
          <div style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: 8, padding: "16px 24px", maxWidth: 500, margin: "0 auto 32px", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#c9a96e", marginBottom: 4 }}>🎁 {trialDays} jours gratuits</div>
            <div style={{ fontSize: 13, color: "rgba(240,234,214,0.6)" }}>Accès complet · Sans carte bancaire · Annulation à tout moment</div>
          </div>

          <div className="hero-btns" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <a className="btn-primary" href="/inscription" style={{ fontSize: 16, padding: "16px 40px" }}>🚀 Commencer gratuitement — {trialDays} jours</a>
            <a className="btn-outline" href="/demo" style={{ fontSize: 16, padding: "16px 40px" }}>▶ Voir la démo</a>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)" }}>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ padding: "80px 24px", borderTop: "1px solid rgba(201,169,110,0.08)", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40, textAlign: "center" }} className="stats-grid">
          {[[stat1, "+", "Entreprises actives"], [stat2, "%", "Satisfaction client"], [stat3, "", "Pays couverts"], [stat4, "€", "À partir de / mois"]].map(([v, s, l], i) => (
            <div key={i}>
              <div className="stat-number gold-gradient">{v}{s}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.5)", marginTop: 12, letterSpacing: "0.04em" }}>{String(l)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 12 MODULES ── */}
      <section id="features" style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p className="section-label">Fonctionnalités</p>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              12 modules. Un seul<br />
              <span className="gold-gradient" style={{ fontStyle: "italic" }}>écosystème intégré.</span>
            </h2>
            <div className="divider" style={{ marginTop: 32 }} />
          </div>
          <div className="modules-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
            {MODULES.map((m, i) => (
              <div key={i} className="module-card">
                <div style={{ fontSize: 28, marginBottom: 12 }}>{m.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.5)", lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTEURS ── */}
      <section id="sectors" style={{ padding: "80px 24px 120px", background: "rgba(201,169,110,0.02)", borderTop: "1px solid rgba(201,169,110,0.08)", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="section-label">Pour qui</p>
            <h2 style={{ fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Peu importe votre secteur,<br />
              <span className="gold-gradient" style={{ fontStyle: "italic" }}>Xyra s&#39;adapte.</span>
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(240,234,214,0.5)", maxWidth: 540, margin: "20px auto 0", lineHeight: 1.7 }}>
              À l&#39;inscription vous choisissez votre secteur — le dashboard s&#39;adapte automatiquement à vos besoins.
            </p>
            <div className="divider" style={{ marginTop: 32 }} />
          </div>
          <div className="sectors-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 8 }}>
            {SECTORS.map(s => (
              <div key={s.name} className="sector-card">
                <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{s.name}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(240,234,214,0.4)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="section-label">Tarifs</p>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 300, letterSpacing: "-0.02em", marginBottom: 32 }}>
              Commencez avec ce dont<br />
              <span className="gold-gradient" style={{ fontStyle: "italic" }}>vous avez besoin.</span>
            </h2>
            <div className="toggle-pill">
              <button className={`toggle-option${!billingAnnual ? " active" : ""}`} onClick={() => setBillingAnnual(false)}>Mensuel</button>
              <button className={`toggle-option${billingAnnual ? " active" : ""}`} onClick={() => setBillingAnnual(true)}>Annuel</button>
            </div>
            {billingAnnual && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#c9a96e", marginLeft: 12 }}>−20% · 2 mois offerts</span>}
          </div>
          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, marginBottom: 40 }}>
            {PLANS.map(plan => (
              <div key={plan.name} className={`plan-card${plan.highlight ? " featured" : ""}`}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "#c9a96e", color: "#0a0a0a", fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 20px" }}>
                    Recommandé
                  </div>
                )}
                <div style={{ paddingTop: plan.highlight ? 16 : 0 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: plan.color, marginBottom: 12 }}>{plan.name}</div>
                  <div style={{ fontSize: "clamp(40px, 5vw, 56px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {billingAnnual ? annualPrice(parseInt(plan.price)) : plan.price}
                    <span style={{ fontSize: 20, fontWeight: 300, color: "rgba(240,234,214,0.5)" }}>€</span>
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.4)", marginBottom: 8, letterSpacing: "0.04em" }}>/mois{billingAnnual ? " · facturé annuellement" : ""}</div>
                  <div style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: 4, padding: "6px 10px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#c9a96e", marginBottom: 16 }}>🎁 {trialDays} jours gratuits · Sans carte</div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(240,234,214,0.55)", lineHeight: 1.6, marginBottom: 24 }}>{plan.desc}</p>
                  <div style={{ width: "100%", height: 1, background: "rgba(201,169,110,0.12)", marginBottom: 24 }} />
                  {plan.features.map(f => (
                    <div key={f} className="check-item"><span className="check-icon">◆</span><span>{f}</span></div>
                  ))}
                  {plan.no.map(f => (
                    <div key={f} className="cross-item"><span style={{ color: "rgba(240,234,214,0.25)", fontSize: 12 }}>✗</span><span>{f}</span></div>
                  ))}
                  <a href="/inscription" className={plan.highlight ? "btn-primary" : "btn-outline"} style={{ display: "block", textAlign: "center", marginTop: 24, padding: "14px" }}>
                    {plan.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
            {["🆓 " + trialDays + " jours d'essai gratuit", "✅ Satisfait ou remboursé 30 jours", "🔄 Changez de plan à tout moment", "💳 Sans engagement"].map(g => (
              <span key={g} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.4)" }}>{g}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "80px 24px 120px", background: "rgba(201,169,110,0.02)", borderTop: "1px solid rgba(201,169,110,0.08)", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="section-label">FAQ</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 50px)", fontWeight: 300, letterSpacing: "-0.02em" }}>
              Questions <span className="gold-gradient" style={{ fontStyle: "italic" }}>fréquentes.</span>
            </h2>
            <div className="divider" style={{ marginTop: 28 }} />
          </div>
          {FAQS.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <span style={{ color: "#c9a96e", fontSize: 22, flexShrink: 0, transition: "transform 0.25s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)", display: "inline-block" }}>+</span>
              </button>
              <div className="faq-a" style={{ maxHeight: openFaq === i ? 220 : 0, paddingBottom: openFaq === i ? 20 : 0 }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section id="signup" style={{ padding: "140px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, background: "radial-gradient(ellipse, rgba(201,169,110,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p className="section-label">Prêt à commencer ?</p>
          <h2 style={{ fontSize: "clamp(38px, 6vw, 72px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 24 }}>
            Rejoignez les 47+ entreprises<br />
            <span className="gold-gradient" style={{ fontStyle: "italic" }}>qui gèrent tout avec Xyra.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(240,234,214,0.55)", marginBottom: 48, maxWidth: 500, margin: "0 auto 48px" }}>
            {trialDays} jours gratuits · Aucune carte bancaire requise · Accès immédiat
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn-primary" href="/inscription" style={{ fontSize: 16, padding: "18px 48px" }}>🚀 Commencer gratuitement — {trialDays}j</a>
            <a className="btn-outline" href={`${WA_BASE}?text=Bonjour%2C%20je%20voudrais%20une%20d%C3%A9mo%20de%20Xyra`} target="_blank" rel="noreferrer" style={{ fontSize: 16, padding: "18px 48px" }}>💬 Demander une démo</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(201,169,110,0.1)", padding: "48px 40px", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="footer-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: "0.12em", marginBottom: 12 }}>XYRA</div>
            <p style={{ fontSize: 13, color: "rgba(240,234,214,0.4)", lineHeight: 1.7, maxWidth: 280 }}>Le système de gestion tout-en-un pour toute entreprise. Conçu pour la France, l&#39;Afrique et le monde entier.</p>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <a href={WA_BASE} style={{ fontSize: 20, textDecoration: "none" }}>💬</a>
              <a href="#" style={{ fontSize: 20, textDecoration: "none" }}>📸</a>
              <a href="#" style={{ fontSize: 20, textDecoration: "none" }}>💼</a>
            </div>
          </div>
          {[
            { title: "Produit", links: [["Fonctionnalités", "#features"], ["Secteurs", "#sectors"], ["Tarifs", "#pricing"], ["FAQ", "#faq"]] },
            { title: "Support", links: [["Documentation", "#"], ["Tutoriels vidéo", "#demo"], ["WhatsApp Support", WA_BASE], ["Contact", "#"]] },
            { title: "Légal", links: [["CGV", "#"], ["Confidentialité", "#"], ["Mentions légales", "#"], ["RGPD", "#"]] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#f0ead6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>{col.title}</h4>
              {col.links.map(([label, href]) => (
                <a key={label} href={href} style={{ display: "block", fontSize: 13, color: "rgba(240,234,214,0.4)", textDecoration: "none", marginBottom: 10, transition: "color 0.2s" }}
                  onMouseOver={e => (e.currentTarget.style.color = "#c9a96e")}
                  onMouseOut={e => (e.currentTarget.style.color = "rgba(240,234,214,0.4)")}>{label}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: "1px solid rgba(201,169,110,0.1)", flexWrap: "wrap", gap: 12, fontSize: 12, color: "rgba(240,234,214,0.3)" }}>
          <span>© 2026 Xyra — Tous droits réservés</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, marginRight: 4 }}>Paiements via</span>
            {["🌊 Wave", "📱 Orange Money", "💳 Visa", "🏦 SEPA", "Flutterwave"].map(p => (
              <span key={p} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,110,0.1)", padding: "3px 8px", fontSize: 10 }}>{p}</span>
            ))}
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLOTTANT ── */}
      <a className="wa-float" href={`${WA_BASE}?text=Bonjour%2C%20je%20voudrais%20en%20savoir%20plus%20sur%20Xyra`} target="_blank" rel="noreferrer" title="WhatsApp">
        <div className="wa-tooltip">On répond en moins de 5 min !</div>
        💬
      </a>
    </div>
  );
}