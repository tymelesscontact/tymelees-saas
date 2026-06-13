"use client";

import { useState, useEffect, useRef } from "react";

const WA_NUMBER = "33765189527";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;

const LANGS = [
  { code: "fr", flag: "🇫🇷", label: "Français", dir: "ltr" },
  { code: "en", flag: "🇺🇸", label: "English", dir: "ltr" },
  { code: "ar", flag: "🇸🇦", label: "العربية", dir: "rtl" },
  { code: "pt", flag: "🇧🇷", label: "Português", dir: "ltr" },
];

const PRICES = {
  fr: { symbol: "€", pos: "after", starter: "59", business: "129", enterprise: "249", per: "/mois" },
  en: { symbol: "$", pos: "before", starter: "65", business: "140", enterprise: "270", per: "/month" },
  ar: { symbol: "ر.س", pos: "after", starter: "245", business: "525", enterprise: "1010", per: "/شهر" },
  pt: { symbol: "R$", pos: "before", starter: "325", business: "700", enterprise: "1350", per: "/mês" },
};

const T = {
  fr: {
    trial: "🎁 Essai gratuit 14 jours — Accès complet · Sans carte bancaire · Sans engagement",
    nav: ["Fonctionnalités", "Secteurs", "Tarifs", "FAQ"],
    navCta: "Essai gratuit 14j →",
    badge: "Disponible en France · Afrique · Monde entier",
    h1a: "Le système de gestion",
    h1b: "pour toute entreprise,",
    h1c: "partout dans le monde",
    sub: "Wallet, Devis, CRM, Planning, Prospection IA, Cartes virtuelles — tout en un seul dashboard. Que vous soyez jardinier, restaurateur, conciergerie ou BTP.",
    payLabel: "Paiements :",
    trialBox1: "🎁 14 jours gratuits",
    trialBox2: "Accès complet · Sans carte bancaire · Annulation à tout moment",
    cta1: "🚀 Commencer gratuitement — 14 jours",
    cta2: "▶ Voir la démo",
    statsLabels: ["Entreprises actives", "Satisfaction client", "Pays couverts", "À partir de / mois"],
    featTitle: "Fonctionnalités",
    featH2a: "12 modules. Un seul",
    featH2b: "écosystème intégré.",
    sectTitle: "Pour qui",
    sectH2a: "Peu importe votre secteur,",
    sectH2b: "Xyra s'adapte.",
    sectSub: "À l'inscription vous choisissez votre secteur — le dashboard s'adapte automatiquement à vos besoins.",
    pricingTitle: "Tarifs",
    pricingH2a: "Commencez avec ce dont",
    pricingH2b: "vous avez besoin.",
    monthly: "Mensuel",
    annual: "Annuel",
    annualSave: "−20% · 2 mois offerts",
    billedAnnual: "· facturé annuellement",
    trialBadge: "🎁 14 jours gratuits · Sans carte",
    guarantees: ["🆓 14 jours d'essai gratuit", "✅ Satisfait ou remboursé 30 jours", "🔄 Changez de plan à tout moment", "💳 Sans engagement"],
    faqTitle: "FAQ",
    faqH2a: "Questions",
    faqH2b: "fréquentes.",
    ctaTitle: "Prêt à commencer ?",
    ctaH2a: "Rejoignez les 47+ entreprises",
    ctaH2b: "qui gèrent tout avec Xyra.",
    ctaSub: "14 jours gratuits · Aucune carte bancaire requise · Accès immédiat",
    ctaBtn1: "🚀 Commencer gratuitement — 14j",
    ctaBtn2: "💬 Demander une démo",
    footerDesc: "Le système de gestion tout-en-un pour toute entreprise. Conçu pour la France, l'Afrique et le monde entier.",
    footerCols: [
      { title: "Produit", links: [["Fonctionnalités", "#features"], ["Secteurs", "#sectors"], ["Tarifs", "#pricing"], ["FAQ", "#faq"]] },
      { title: "Support", links: [["Documentation", "#"], ["Tutoriels vidéo", "/demo"], ["WhatsApp Support", WA_BASE], ["Contact", "#"]] },
      { title: "Légal", links: [["CGV", "#"], ["Confidentialité", "#"], ["Mentions légales", "#"], ["RGPD", "#"]] },
    ],
    footerCopy: "© 2026 Xyra — Tous droits réservés",
    footerPay: "Paiements via",
    waTooltip: "On répond en moins de 5 min !",
    waMsg: "Bonjour%2C%20je%20voudrais%20en%20savoir%20plus%20sur%20Xyra",
    waDemo: "Bonjour%2C%20je%20voudrais%20une%20d%C3%A9mo%20de%20Xyra",
    recommended: "Recommandé",
    planDesc: ["Pour démarrer votre activité avec les outils essentiels.", "Le plan complet pour les entreprises en croissance.", "Pour les grandes structures et franchises multi-sites."],
    planCta: ["Commencer gratuitement", "Démarrer l'essai", "Nous contacter"],
    planFeatures: [
      ["3 modules au choix", "Wallet & Flutterwave inclus", "1 utilisateur", "Support WhatsApp"],
      ["8 modules au choix", "Wallet + Cartes virtuelles", "Jusqu'à 5 utilisateurs", "IA & Analytics inclus", "Support prioritaire"],
      ["Tous les modules", "Cartes VIP illimitées", "Utilisateurs illimités", "Prospection IA complète", "Support dédié 7j/7", "Configuration sur mesure"],
    ],
    planNo: [["IA & Analytics", "Prospection automatique"], ["Prospection automatique"], []],
    modules: [
      { icon: "📊", label: "Vue d'ensemble", desc: "KPIs, score santé, missions du jour" },
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
    ],
    testimonials: [
      { name: "Aminata D.", role: "Conciergerie — Dakar, Sénégal", text: "Avant je gérais tout sur Excel et WhatsApp. Maintenant mes devis sont envoyés en 30 secondes, mes clients paient par Wave et tout est tracé. Je gagne 2h par jour." },
      { name: "Marc T.", role: "Paysagiste — Lyon, France", text: "Je pensais que ces outils n'étaient pas pour moi. Xyra m'a surpris — en 10 minutes j'avais mon planning, mes devis et mon wallet configurés." },
      { name: "Sofia R.", role: "Agence événementielle — Paris & Casablanca", text: "On accepte Orange Money et Visa en même temps. Le bot de prospection nous a apporté 8 nouveaux clients en 1 mois." },
    ],
    faqs: [
      { q: "Xyra est-il adapté à mon secteur ?", a: "Oui ! Xyra est universel — jardinier, plombier, conciergerie, restaurant, avocat, BTP, coach... À l'inscription vous choisissez votre secteur et le dashboard s'adapte automatiquement." },
      { q: "Quels moyens de paiement sont acceptés ?", a: "Via Flutterwave : Wave, Orange Money, MTN Mobile Money, Airtel Money, Visa, Mastercard, virement SEPA, PayPal. Toute l'Afrique, l'Europe et le monde entier sont couverts." },
      { q: "Mes données sont-elles sécurisées ?", a: "Absolument. Chaque entreprise a ses données 100% isolées. Infrastructure Supabase sécurisée, conforme RGPD, chiffrement de bout en bout." },
      { q: "Puis-je louer un seul module ?", a: "Oui ! Vous pouvez louer uniquement le module dont vous avez besoin — par exemple juste le Wallet & Paiements à 29€/mois. Ajoutez d'autres modules à tout moment." },
      { q: "Y a-t-il un support disponible ?", a: "Support WhatsApp disponible 7j/7. Documentation complète en français. Vidéos tutoriels. Le plan Enterprise inclut un support dédié avec accompagnement personnalisé." },
      { q: "Xyra fonctionne-t-il en Afrique ?", a: "C'est l'un de nos points forts ! Conçu pour la France ET l'Afrique — Sénégal, Côte d'Ivoire, Maroc, Cameroun, Dubaï. Wave et Orange Money sont intégrés nativement." },
      { q: "Puis-je annuler à tout moment ?", a: "Oui, sans frais, sans engagement. Vous pouvez annuler, changer de plan ou ajouter des modules depuis votre tableau de bord à tout moment." },
    ],
  },
  en: {
    trial: "🎁 Free trial 14 days — Full access · No credit card · No commitment",
    nav: ["Features", "Sectors", "Pricing", "FAQ"],
    navCta: "Free 14-day trial →",
    badge: "Available in USA · Europe · Africa · Worldwide",
    h1a: "The business management system",
    h1b: "for every company,",
    h1c: "anywhere in the world",
    sub: "Wallet, Quotes, CRM, Planning, AI Prospecting, Virtual Cards — all in one dashboard. Whether you are a landscaper, restaurateur, concierge or contractor.",
    payLabel: "Payments:",
    trialBox1: "🎁 14 days free",
    trialBox2: "Full access · No credit card · Cancel anytime",
    cta1: "🚀 Start for free — 14 days",
    cta2: "▶ Watch the demo",
    statsLabels: ["Active businesses", "Client satisfaction", "Countries covered", "Starting from / month"],
    featTitle: "Features",
    featH2a: "12 modules. One single",
    featH2b: "integrated ecosystem.",
    sectTitle: "Who is it for",
    sectH2a: "Whatever your sector,",
    sectH2b: "Xyra adapts.",
    sectSub: "At sign-up you choose your sector — the dashboard adapts automatically to your needs.",
    pricingTitle: "Pricing",
    pricingH2a: "Start with what",
    pricingH2b: "you need.",
    monthly: "Monthly",
    annual: "Annual",
    annualSave: "−20% · 2 months free",
    billedAnnual: "· billed annually",
    trialBadge: "🎁 14 days free · No card required",
    guarantees: ["🆓 14-day free trial", "✅ 30-day money back guarantee", "🔄 Change plan anytime", "💳 No commitment"],
    faqTitle: "FAQ",
    faqH2a: "Frequently asked",
    faqH2b: "questions.",
    ctaTitle: "Ready to start?",
    ctaH2a: "Join 47+ businesses",
    ctaH2b: "that manage everything with Xyra.",
    ctaSub: "14 days free · No credit card required · Instant access",
    ctaBtn1: "🚀 Start for free — 14 days",
    ctaBtn2: "💬 Request a demo",
    footerDesc: "The all-in-one management system for every business. Designed for the USA, Europe, Africa and the world.",
    footerCols: [
      { title: "Product", links: [["Features", "#features"], ["Sectors", "#sectors"], ["Pricing", "#pricing"], ["FAQ", "#faq"]] },
      { title: "Support", links: [["Documentation", "#"], ["Video tutorials", "/demo"], ["WhatsApp Support", WA_BASE], ["Contact", "#"]] },
      { title: "Legal", links: [["Terms", "#"], ["Privacy", "#"], ["Legal notice", "#"], ["GDPR", "#"]] },
    ],
    footerCopy: "© 2026 Xyra — All rights reserved",
    footerPay: "Payments via",
    waTooltip: "We reply in under 5 min!",
    waMsg: "Hello%2C%20I%20would%20like%20to%20know%20more%20about%20Xyra",
    waDemo: "Hello%2C%20I%20would%20like%20a%20demo%20of%20Xyra",
    recommended: "Most Popular",
    planDesc: ["To start your business with essential tools.", "The complete plan for growing businesses.", "For large organizations and multi-location franchises."],
    planCta: ["Start for free", "Start trial", "Contact us"],
    planFeatures: [
      ["3 modules of your choice", "Wallet & Flutterwave included", "1 user", "WhatsApp Support"],
      ["8 modules of your choice", "Wallet + Virtual Cards", "Up to 5 users", "AI & Analytics included", "Priority support"],
      ["All modules", "Unlimited VIP cards", "Unlimited users", "Full AI Prospecting", "Dedicated support 7/7", "Custom configuration"],
    ],
    planNo: [["AI & Analytics", "Automated Prospecting"], ["Automated Prospecting"], []],
    modules: [
      { icon: "📊", label: "Overview", desc: "KPIs, health score, daily missions" },
      { icon: "📋", label: "Validated Quotes", desc: "Owner approval workflow" },
      { icon: "💳", label: "Wallet & Payments", desc: "Wave, Orange Money, Visa, SEPA" },
      { icon: "👥", label: "Client CRM", desc: "VIP, multilingual, history" },
      { icon: "🤝", label: "Partners", desc: "Commissions, referral revenue" },
      { icon: "📅", label: "Planning", desc: "Weekly missions per collaborator" },
      { icon: "🔍", label: "AI Prospecting", desc: "Multi-channel, 59 features" },
      { icon: "📈", label: "Analytics", desc: "Revenue prediction, trends, growth" },
      { icon: "💎", label: "Virtual Cards", desc: "Virtual Visa for your team" },
      { icon: "⭐", label: "NPS & Reviews", desc: "Google, client satisfaction" },
      { icon: "💬", label: "Team Chat", desc: "WhatsApp-style, real-time" },
      { icon: "🚀", label: "SaaS Deployment", desc: "White label, your clients" },
    ],
    testimonials: [
      { name: "Aminata D.", role: "Concierge — Dakar, Senegal", text: "Before I managed everything on Excel and WhatsApp. Now my quotes are sent in 30 seconds, my clients pay by Wave and everything is tracked. I save 2 hours a day." },
      { name: "Marc T.", role: "Landscaper — Lyon, France", text: "I thought these tools weren't for me. Xyra surprised me — in 10 minutes I had my schedule, quotes and wallet configured." },
      { name: "Sofia R.", role: "Events Agency — Paris & Casablanca", text: "We accept Orange Money and Visa at the same time. The prospecting bot brought us 8 new clients in 1 month." },
    ],
    faqs: [
      { q: "Is Xyra adapted to my sector?", a: "Yes! Xyra is universal — gardener, plumber, concierge, restaurant, lawyer, construction, coach... At sign-up you choose your sector and the dashboard adapts automatically." },
      { q: "What payment methods are accepted?", a: "Via Flutterwave: Wave, Orange Money, MTN Mobile Money, Airtel Money, Visa, Mastercard, SEPA transfer, PayPal. All of Africa, Europe and the world are covered." },
      { q: "Is my data secure?", a: "Absolutely. Each company has its data 100% isolated. Secure Supabase infrastructure, GDPR compliant, end-to-end encryption." },
      { q: "Can I rent just one module?", a: "Yes! You can rent only the module you need — for example just the Wallet & Payments at $32/month. Add other modules anytime." },
      { q: "Is there support available?", a: "WhatsApp support available 7/7. Complete documentation in English. Tutorial videos. Enterprise plan includes dedicated support with personalized coaching." },
      { q: "Does Xyra work in Africa?", a: "That's one of our strengths! Designed for Europe AND Africa — Senegal, Côte d'Ivoire, Morocco, Cameroon, Dubai. Wave and Orange Money are natively integrated." },
      { q: "Can I cancel anytime?", a: "Yes, free of charge, no commitment. You can cancel, change plans or add modules from your dashboard at any time." },
    ],
  },
  ar: {
    trial: "🎁 تجربة مجانية 14 يوم — وصول كامل · بدون بطاقة · بدون التزام",
    nav: ["المميزات", "القطاعات", "الأسعار", "الأسئلة"],
    navCta: "ابدأ مجاناً ←",
    badge: "متاح في أوروبا · أفريقيا · العالم كله",
    h1a: "نظام إدارة الأعمال",
    h1b: "لكل شركة،",
    h1c: "في كل مكان في العالم",
    sub: "المحفظة، العروض، CRM، التخطيط، الاستطلاع بالذكاء الاصطناعي، البطاقات الافتراضية — كل شيء في لوحة تحكم واحدة.",
    payLabel: "طرق الدفع:",
    trialBox1: "🎁 14 يوماً مجاناً",
    trialBox2: "وصول كامل · بدون بطاقة بنكية · إلغاء في أي وقت",
    cta1: "🚀 ابدأ مجاناً — 14 يوم",
    cta2: "▶ شاهد العرض",
    statsLabels: ["شركة نشطة", "رضا العملاء", "دولة مدعومة", "ابتداءً من / شهر"],
    featTitle: "المميزات",
    featH2a: "12 وحدة. نظام بيئي",
    featH2b: "متكامل واحد.",
    sectTitle: "لمن هو",
    sectH2a: "مهما كان قطاعك،",
    sectH2b: "Xyra يتكيف.",
    sectSub: "عند التسجيل تختار قطاعك — تتكيف لوحة التحكم تلقائياً مع احتياجاتك.",
    pricingTitle: "الأسعار",
    pricingH2a: "ابدأ بما",
    pricingH2b: "تحتاجه.",
    monthly: "شهري",
    annual: "سنوي",
    annualSave: "−20% · شهران مجاناً",
    billedAnnual: "· يُفوتر سنوياً",
    trialBadge: "🎁 14 يوماً مجاناً · بدون بطاقة",
    guarantees: ["🆓 تجربة مجانية 14 يوم", "✅ ضمان استرداد 30 يوم", "🔄 غيّر خطتك في أي وقت", "💳 بدون التزام"],
    faqTitle: "الأسئلة الشائعة",
    faqH2a: "أسئلة",
    faqH2b: "متكررة.",
    ctaTitle: "مستعد للبدء؟",
    ctaH2a: "انضم إلى 47+ شركة",
    ctaH2b: "تدير كل شيء مع Xyra.",
    ctaSub: "14 يوماً مجاناً · لا يلزم بطاقة بنكية · وصول فوري",
    ctaBtn1: "🚀 ابدأ مجاناً — 14 يوم",
    ctaBtn2: "💬 طلب عرض توضيحي",
    footerDesc: "نظام الإدارة الشامل لكل شركة. مصمم لأوروبا وأفريقيا والعالم.",
    footerCols: [
      { title: "المنتج", links: [["المميزات", "#features"], ["القطاعات", "#sectors"], ["الأسعار", "#pricing"], ["الأسئلة", "#faq"]] },
      { title: "الدعم", links: [["التوثيق", "#"], ["فيديوهات تعليمية", "/demo"], ["دعم واتساب", WA_BASE], ["اتصل بنا", "#"]] },
      { title: "قانوني", links: [["الشروط", "#"], ["الخصوصية", "#"], ["الإشعار القانوني", "#"], ["GDPR", "#"]] },
    ],
    footerCopy: "© 2026 Xyra — جميع الحقوق محفوظة",
    footerPay: "الدفع عبر",
    waTooltip: "نرد خلال 5 دقائق!",
    waMsg: "مرحباً%2C%20أريد%20معرفة%20المزيد%20عن%20Xyra",
    waDemo: "مرحباً%2C%20أريد%20عرضاً%20توضيحياً%20لـ%20Xyra",
    recommended: "الأكثر شعبية",
    planDesc: ["لبدء نشاطك التجاري بالأدوات الأساسية.", "الخطة الكاملة للشركات المتنامية.", "للمؤسسات الكبيرة والامتيازات متعددة المواقع."],
    planCta: ["ابدأ مجاناً", "ابدأ التجربة", "تواصل معنا"],
    planFeatures: [
      ["3 وحدات من اختيارك", "محفظة Flutterwave مدرجة", "مستخدم واحد", "دعم واتساب"],
      ["8 وحدات من اختيارك", "محفظة + بطاقات افتراضية", "حتى 5 مستخدمين", "الذكاء الاصطناعي والتحليلات", "دعم ذو أولوية"],
      ["جميع الوحدات", "بطاقات VIP غير محدودة", "مستخدمون غير محدودون", "الاستطلاع الكامل بالذكاء الاصطناعي", "دعم مخصص 7/7", "تكوين مخصص"],
    ],
    planNo: [["الذكاء الاصطناعي والتحليلات", "الاستطلاع التلقائي"], ["الاستطلاع التلقائي"], []],
    modules: [
      { icon: "📊", label: "نظرة عامة", desc: "مؤشرات الأداء، درجة الصحة، مهام اليوم" },
      { icon: "📋", label: "عروض الأسعار", desc: "سير عمل موافقة المالك" },
      { icon: "💳", label: "المحفظة والمدفوعات", desc: "Wave، Orange Money، Visa، SEPA" },
      { icon: "👥", label: "إدارة العملاء", desc: "VIP، متعدد اللغات، السجل" },
      { icon: "🤝", label: "الشركاء", desc: "العمولات، إيرادات الإحالة" },
      { icon: "📅", label: "التخطيط", desc: "المهام الأسبوعية لكل متعاون" },
      { icon: "🔍", label: "الاستطلاع بالذكاء الاصطناعي", desc: "متعدد القنوات، 59 ميزة" },
      { icon: "📈", label: "التحليلات", desc: "توقع الإيرادات، الاتجاهات، النمو" },
      { icon: "💎", label: "البطاقات الافتراضية", desc: "Visa افتراضي لفريقك" },
      { icon: "⭐", label: "NPS والمراجعات", desc: "Google، رضا العملاء" },
      { icon: "💬", label: "دردشة الفريق", desc: "نمط واتساب، في الوقت الفعلي" },
      { icon: "🚀", label: "نشر SaaS", desc: "علامة بيضاء، عملاؤك" },
    ],
    testimonials: [
      { name: "أميناتا د.", role: "خدمات كونسيرج — داكار، السنغال", text: "كنت أدير كل شيء على Excel وواتساب. الآن يتم إرسال عروض أسعاري في 30 ثانية، ويدفع عملائي عبر Wave وكل شيء مسجل. أوفر ساعتين يومياً." },
      { name: "مارك ت.", role: "مشجر — ليون، فرنسا", text: "كنت أعتقد أن هذه الأدوات ليست لي. فاجأني Xyra — في 10 دقائق كان لدي جدولي الزمني وعروض أسعاري ومحفظتي جاهزة." },
      { name: "صوفيا ر.", role: "وكالة فعاليات — باريس والدار البيضاء", text: "نقبل Orange Money وVisa في نفس الوقت. جلب لنا روبوت الاستطلاع 8 عملاء جدد في شهر واحد." },
    ],
    faqs: [
      { q: "هل Xyra مناسب لقطاعي؟", a: "نعم! Xyra عالمي — بستاني، سباك، كونسيرج، مطعم، محامي، بناء، مدرب... عند التسجيل تختار قطاعك وتتكيف لوحة التحكم تلقائياً." },
      { q: "ما طرق الدفع المقبولة؟", a: "عبر Flutterwave: Wave، Orange Money، MTN Mobile Money، Airtel Money، Visa، Mastercard، تحويل SEPA، PayPal. تغطية كاملة لأفريقيا وأوروبا والعالم." },
      { q: "هل بياناتي آمنة؟", a: "تماماً. بيانات كل شركة معزولة 100%. بنية تحتية Supabase آمنة، متوافقة مع GDPR، تشفير من طرف إلى طرف." },
      { q: "هل يمكنني استئجار وحدة واحدة فقط؟", a: "نعم! يمكنك استئجار الوحدة التي تحتاجها فقط — مثلاً المحفظة والمدفوعات فقط. أضف وحدات أخرى في أي وقت." },
      { q: "هل يوجد دعم متاح؟", a: "دعم واتساب متاح 7/7. توثيق كامل. مقاطع فيديو تعليمية. تشمل خطة Enterprise دعماً مخصصاً مع رافقة شخصية." },
      { q: "هل يعمل Xyra في أفريقيا؟", a: "هذه إحدى نقاط قوتنا! مصمم لأوروبا وأفريقيا — السنغال، كوت ديفوار، المغرب، الكاميرون، دبي. Wave وOrange Money مدمجان أصلاً." },
      { q: "هل يمكنني الإلغاء في أي وقت؟", a: "نعم، بدون رسوم، بدون التزام. يمكنك الإلغاء أو تغيير الخطة أو إضافة وحدات من لوحة التحكم في أي وقت." },
    ],
  },
  pt: {
    trial: "🎁 Teste grátis 14 dias — Acesso completo · Sem cartão · Sem compromisso",
    nav: ["Funcionalidades", "Setores", "Preços", "FAQ"],
    navCta: "Teste grátis 14d →",
    badge: "Disponível no Brasil · Europa · África · Mundo",
    h1a: "O sistema de gestão",
    h1b: "para toda empresa,",
    h1c: "em qualquer lugar do mundo",
    sub: "Carteira, Orçamentos, CRM, Planejamento, Prospecção IA, Cartões virtuais — tudo em um único painel. Seja você jardineiro, restaurateur, concierge ou construtor.",
    payLabel: "Pagamentos:",
    trialBox1: "🎁 14 dias grátis",
    trialBox2: "Acesso completo · Sem cartão · Cancele a qualquer momento",
    cta1: "🚀 Começar grátis — 14 dias",
    cta2: "▶ Ver a demonstração",
    statsLabels: ["Empresas ativas", "Satisfação do cliente", "Países cobertos", "A partir de / mês"],
    featTitle: "Funcionalidades",
    featH2a: "12 módulos. Um único",
    featH2b: "ecossistema integrado.",
    sectTitle: "Para quem",
    sectH2a: "Independente do seu setor,",
    sectH2b: "Xyra se adapta.",
    sectSub: "No cadastro você escolhe seu setor — o painel se adapta automaticamente às suas necessidades.",
    pricingTitle: "Preços",
    pricingH2a: "Comece com o que",
    pricingH2b: "você precisa.",
    monthly: "Mensal",
    annual: "Anual",
    annualSave: "−20% · 2 meses grátis",
    billedAnnual: "· cobrado anualmente",
    trialBadge: "🎁 14 dias grátis · Sem cartão",
    guarantees: ["🆓 Teste grátis 14 dias", "✅ Garantia 30 dias", "🔄 Mude de plano quando quiser", "💳 Sem compromisso"],
    faqTitle: "FAQ",
    faqH2a: "Perguntas",
    faqH2b: "frequentes.",
    ctaTitle: "Pronto para começar?",
    ctaH2a: "Junte-se a 47+ empresas",
    ctaH2b: "que gerenciam tudo com Xyra.",
    ctaSub: "14 dias grátis · Sem cartão necessário · Acesso imediato",
    ctaBtn1: "🚀 Começar grátis — 14 dias",
    ctaBtn2: "💬 Solicitar demonstração",
    footerDesc: "O sistema de gestão tudo-em-um para toda empresa. Projetado para o Brasil, Europa, África e o mundo.",
    footerCols: [
      { title: "Produto", links: [["Funcionalidades", "#features"], ["Setores", "#sectors"], ["Preços", "#pricing"], ["FAQ", "#faq"]] },
      { title: "Suporte", links: [["Documentação", "#"], ["Vídeos tutoriais", "/demo"], ["Suporte WhatsApp", WA_BASE], ["Contato", "#"]] },
      { title: "Legal", links: [["Termos", "#"], ["Privacidade", "#"], ["Aviso legal", "#"], ["LGPD", "#"]] },
    ],
    footerCopy: "© 2026 Xyra — Todos os direitos reservados",
    footerPay: "Pagamentos via",
    waTooltip: "Respondemos em menos de 5 min!",
    waMsg: "Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20Xyra",
    waDemo: "Ol%C3%A1%2C%20gostaria%20de%20uma%20demonstra%C3%A7%C3%A3o%20do%20Xyra",
    recommended: "Mais Popular",
    planDesc: ["Para iniciar seu negócio com ferramentas essenciais.", "O plano completo para empresas em crescimento.", "Para grandes organizações e franquias multi-unidades."],
    planCta: ["Começar grátis", "Iniciar teste", "Fale conosco"],
    planFeatures: [
      ["3 módulos à sua escolha", "Carteira & Flutterwave incluído", "1 usuário", "Suporte WhatsApp"],
      ["8 módulos à sua escolha", "Carteira + Cartões virtuais", "Até 5 usuários", "IA & Analytics incluído", "Suporte prioritário"],
      ["Todos os módulos", "Cartões VIP ilimitados", "Usuários ilimitados", "Prospecção IA completa", "Suporte dedicado 7/7", "Configuração personalizada"],
    ],
    planNo: [["IA & Analytics", "Prospecção automática"], ["Prospecção automática"], []],
    modules: [
      { icon: "📊", label: "Visão geral", desc: "KPIs, score de saúde, missões do dia" },
      { icon: "📋", label: "Orçamentos validados", desc: "Fluxo de aprovação do proprietário" },
      { icon: "💳", label: "Carteira & Pagamentos", desc: "Wave, Orange Money, Visa, SEPA" },
      { icon: "👥", label: "CRM Clientes", desc: "VIP, multilíngue, histórico" },
      { icon: "🤝", label: "Parceiros", desc: "Comissões, receita de indicação" },
      { icon: "📅", label: "Planejamento", desc: "Missões semanais por colaborador" },
      { icon: "🔍", label: "Prospecção IA", desc: "Multi-canal, 59 funcionalidades" },
      { icon: "📈", label: "Analytics", desc: "Previsão de receita, tendências, crescimento" },
      { icon: "💎", label: "Cartões Virtuais", desc: "Visa virtual para sua equipe" },
      { icon: "⭐", label: "NPS & Avaliações", desc: "Google, satisfação do cliente" },
      { icon: "💬", label: "Chat da Equipe", desc: "Estilo WhatsApp, tempo real" },
      { icon: "🚀", label: "Deploy SaaS", desc: "Marca branca, seus clientes" },
    ],
    testimonials: [
      { name: "Aminata D.", role: "Concierge — Dakar, Senegal", text: "Antes eu gerenciava tudo no Excel e WhatsApp. Agora meus orçamentos são enviados em 30 segundos, meus clientes pagam por Wave e tudo está registrado. Ganho 2h por dia." },
      { name: "Marc T.", role: "Paisagista — Lyon, França", text: "Achei que essas ferramentas não eram para mim. Xyra me surpreendeu — em 10 minutos tinha meu planejamento, orçamentos e carteira configurados." },
      { name: "Sofia R.", role: "Agência de Eventos — Paris & Casablanca", text: "Aceitamos Orange Money e Visa ao mesmo tempo. O bot de prospecção nos trouxe 8 novos clientes em 1 mês." },
    ],
    faqs: [
      { q: "O Xyra é adaptado ao meu setor?", a: "Sim! O Xyra é universal — jardineiro, encanador, concierge, restaurante, advogado, construção, coach... No cadastro você escolhe seu setor e o painel se adapta automaticamente." },
      { q: "Quais métodos de pagamento são aceitos?", a: "Via Flutterwave: Wave, Orange Money, MTN Mobile Money, Airtel Money, Visa, Mastercard, transferência SEPA, PayPal. Toda a África, Europa e o mundo estão cobertos." },
      { q: "Meus dados estão seguros?", a: "Absolutamente. Cada empresa tem seus dados 100% isolados. Infraestrutura Supabase segura, conforme LGPD/GDPR, criptografia de ponta a ponta." },
      { q: "Posso contratar apenas um módulo?", a: "Sim! Você pode contratar apenas o módulo que precisa — por exemplo só a Carteira & Pagamentos. Adicione outros módulos a qualquer momento." },
      { q: "Há suporte disponível?", a: "Suporte WhatsApp disponível 7/7. Documentação completa em português. Vídeos tutoriais. O plano Enterprise inclui suporte dedicado com acompanhamento personalizado." },
      { q: "O Xyra funciona na África?", a: "É um dos nossos pontos fortes! Projetado para Europa E África — Senegal, Costa do Marfim, Marrocos, Camarões, Dubai. Wave e Orange Money estão integrados nativamente." },
      { q: "Posso cancelar a qualquer momento?", a: "Sim, sem taxas, sem compromisso. Você pode cancelar, mudar de plano ou adicionar módulos pelo painel a qualquer momento." },
    ],
  },
};

const SECTORS = [
  { icon: "🌿", fr: "Jardinage", en: "Landscaping", ar: "البستنة", pt: "Jardinage", subFr: "Paysagiste, entretien", subEn: "Gardener, maintenance", subAr: "بستاني، صيانة", subPt: "Paisagista, manutenção" },
  { icon: "🧹", fr: "Nettoyage", en: "Cleaning", ar: "التنظيف", pt: "Limpeza", subFr: "Ménage, pressing", subEn: "Housekeeping, laundry", subAr: "تنظيف منازل", subPt: "Doméstico, lavanderia" },
  { icon: "🏗️", fr: "BTP", en: "Construction", ar: "البناء", pt: "Construção", subFr: "Construction, rénovation", subEn: "Building, renovation", subAr: "بناء، تجديد", subPt: "Construção, renovação" },
  { icon: "🔧", fr: "Plomberie", en: "Plumbing", ar: "السباكة", pt: "Hidráulica", subFr: "Dépannage, installation", subEn: "Repair, installation", subAr: "إصلاح، تركيب", subPt: "Reparo, instalação" },
  { icon: "⚡", fr: "Électricité", en: "Electrical", ar: "الكهرباء", pt: "Elétrica", subFr: "Electricien, installation", subEn: "Electrician, installation", subAr: "كهربائي، تركيب", subPt: "Eletricista, instalação" },
  { icon: "🎨", fr: "Peinture", en: "Painting", ar: "الطلاء", pt: "Pintura", subFr: "Décoration, rénovation", subEn: "Decoration, renovation", subAr: "ديكور، تجديد", subPt: "Decoração, renovação" },
  { icon: "🚛", fr: "Déménagement", en: "Moving", ar: "النقل", pt: "Mudanças", subFr: "Transport, logistique", subEn: "Transport, logistics", subAr: "نقل، لوجستيات", subPt: "Transporte, logística" },
  { icon: "🍳", fr: "Chef à domicile", en: "Private Chef", ar: "طاهٍ خاص", pt: "Chef em casa", subFr: "Traiteur, événementiel", subEn: "Catering, events", subAr: "تموين، فعاليات", subPt: "Catering, eventos" },
  { icon: "🏨", fr: "Hôtellerie", en: "Hospitality", ar: "الضيافة", pt: "Hotelaria", subFr: "Hôtel, gîte, Airbnb", subEn: "Hotel, B&B, Airbnb", subAr: "فندق، شقة مفروشة", subPt: "Hotel, pousada, Airbnb" },
  { icon: "🏠", fr: "Conciergerie", en: "Concierge", ar: "كونسيرج", pt: "Concierge", subFr: "Services premium", subEn: "Premium services", subAr: "خدمات فاخرة", subPt: "Serviços premium" },
  { icon: "✈️", fr: "Aviation", en: "Aviation", ar: "الطيران", pt: "Aviação", subFr: "Jet privé, charter", subEn: "Private jet, charter", subAr: "طائرة خاصة، تشارتر", subPt: "Jato privado, charter" },
  { icon: "🛥️", fr: "Yachting", en: "Yachting", ar: "اليخوت", pt: "Iatismo", subFr: "Location, entretien", subEn: "Rental, maintenance", subAr: "إيجار، صيانة", subPt: "Aluguel, manutenção" },
  { icon: "🚗", fr: "Transport VIP", en: "VIP Transport", ar: "نقل VIP", pt: "Transporte VIP", subFr: "Chauffeur, limousine", subEn: "Chauffeur, limousine", subAr: "سائق، ليموزين", subPt: "Motorista, limusine" },
  { icon: "🔐", fr: "Sécurité", en: "Security", ar: "الأمن", pt: "Segurança", subFr: "Garde du corps, surveillance", subEn: "Bodyguard, surveillance", subAr: "حراسة، مراقبة", subPt: "Guarda-costas, vigilância" },
  { icon: "💅", fr: "Beauté", en: "Beauty", ar: "الجمال", pt: "Beleza", subFr: "Coiffeur, esthétique", subEn: "Hair, aesthetics", subAr: "تجميل، حلاقة", subPt: "Cabelo, estética" },
  { icon: "🍽️", fr: "Restaurant", en: "Restaurant", ar: "مطعم", pt: "Restaurante", subFr: "Café, fast-food, gastronomie", subEn: "Café, fast-food, fine dining", subAr: "كافيه، مطعم راقٍ", subPt: "Café, fast-food, gastronomia" },
  { icon: "🛍️", fr: "Commerce", en: "Retail", ar: "التجارة", pt: "Comércio", subFr: "Boutique, e-commerce", subEn: "Store, e-commerce", subAr: "متجر، تجارة إلكترونية", subPt: "Loja, e-commerce" },
  { icon: "🏘️", fr: "Immobilier", en: "Real Estate", ar: "العقارات", pt: "Imobiliário", subFr: "Agence, gestion locative", subEn: "Agency, property management", subAr: "وكالة، إدارة عقارات", subPt: "Agência, gestão de imóveis" },
  { icon: "📸", fr: "Événementiel", en: "Events", ar: "الفعاليات", pt: "Eventos", subFr: "Photographe, organisateur", subEn: "Photographer, organizer", subAr: "مصور، منظم فعاليات", subPt: "Fotógrafo, organizador" },
  { icon: "💻", fr: "Freelance", en: "Freelance", ar: "فريلانس", pt: "Freelance", subFr: "Dev, designer, consultant", subEn: "Dev, designer, consultant", subAr: "مطور، مصمم، مستشار", subPt: "Dev, designer, consultor" },
  { icon: "⚖️", fr: "Juridique", en: "Legal", ar: "قانوني", pt: "Jurídico", subFr: "Avocat, notaire, RH", subEn: "Lawyer, notary, HR", subAr: "محامي، كاتب عدل", subPt: "Advogado, cartório, RH" },
  { icon: "🩺", fr: "Santé", en: "Healthcare", ar: "الصحة", pt: "Saúde", subFr: "Cabinet médical, kiné", subEn: "Medical practice, physio", subAr: "عيادة طبية، علاج طبيعي", subPt: "Consultório médico, fisio" },
  { icon: "📚", fr: "Formation", en: "Training", ar: "التدريب", pt: "Formação", subFr: "Coach, formateur, école", subEn: "Coach, trainer, school", subAr: "مدرب، مدرسة", subPt: "Coach, formador, escola" },
  { icon: "📦", fr: "Import / Export", en: "Import / Export", ar: "استيراد / تصدير", pt: "Importação / Exportação", subFr: "Commerce international", subEn: "International trade", subAr: "تجارة دولية", subPt: "Comércio internacional" },
  { icon: "🌍", fr: "Diaspora Afrique", en: "African Diaspora", ar: "الديaspora الأفريقي", pt: "Diáspora Africana", subFr: "Sénégal, CI, Maroc...", subEn: "Senegal, CI, Morocco...", subAr: "السنغال، ساحل العاج، المغرب", subPt: "Senegal, CI, Marrocos..." },
  { icon: "🕊️", fr: "Rapatriement", en: "Repatriation", ar: "الترحيل", pt: "Repatriação", subFr: "Corps, dossiers consulaires", subEn: "Body, consular files", subAr: "جثمان، ملفات قنصلية", subPt: "Corpo, arquivos consulares" },
  { icon: "🧴", fr: "Cosmétiques", en: "Cosmetics", ar: "مستحضرات التجميل", pt: "Cosméticos", subFr: "Vente, fabrication", subEn: "Sales, manufacturing", subAr: "بيع، تصنيع", subPt: "Venda, fabricação" },
  { icon: "🐾", fr: "Animalerie", en: "Pet Services", ar: "خدمات الحيوانات", pt: "Pet Shop", subFr: "Vétérinaire, pet-sitting", subEn: "Vet, pet-sitting", subAr: "طبيب بيطري، رعاية حيوانات", subPt: "Veterinário, pet-sitting" },
  { icon: "🎵", fr: "Artiste / Music", en: "Artist / Music", ar: "فنان / موسيقى", pt: "Artista / Música", subFr: "Booking, management", subEn: "Booking, management", subAr: "حجز، إدارة", subPt: "Booking, management" },
  { icon: "➕", fr: "Et bien plus...", en: "And much more...", ar: "والمزيد...", pt: "E muito mais...", subFr: "Tout secteur accepté", subEn: "All sectors welcome", subAr: "جميع القطاعات مقبولة", subPt: "Todos os setores aceitos" },
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

function fmtPrice(price, lang) {
  const p = PRICES[lang];
  return p.pos === "before" ? `${p.symbol}${price}` : `${price} ${p.symbol}`;
}

export default function XyraLanding() {
  const [lang, setLang] = useState("fr");
  const [langOpen, setLangOpen] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [trialDays] = useState(14);
  const statsRef = useRef(null);

  const t = T[lang];
  const p = PRICES[lang];
  const dir = LANGS.find(l => l.code === lang)?.dir || "ltr";

  const stat1 = useCountUp(47, 1800, statsVisible);
  const stat2 = useCountUp(98, 1600, statsVisible);
  const stat3 = useCountUp(12, 1400, statsVisible);
  const stat4 = useCountUp(parseInt(p.starter), 1200, statsVisible);

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
      setActiveTestimonial((prev) => (prev + 1) % t.testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [lang]);

  const annualPrice = (price) => Math.round(parseInt(price) * 0.8);
  const planPrices = [p.starter, p.business, p.enterprise];

  return (
    <div dir={dir} style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", background: "#0a0a0a", color: "#f0ead6", minHeight: "100vh", overflowX: "hidden" }}>
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
        .faq-item { border-bottom: 1px solid rgba(201,169,110,0.1); }
        .faq-q { padding: 20px 0; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; background: none; border: none; color: #f0ead6; width: 100%; text-align: left; }
        .faq-a { font-family: 'DM Sans', sans-serif; font-size: 14px; color: rgba(240,234,214,0.6); line-height: 1.75; overflow: hidden; transition: max-height 0.35s ease, padding 0.35s ease; }
        .wa-float { position: fixed; bottom: 28px; right: 28px; z-index: 999; background: #25D366; color: #fff; width: 58px; height: 58px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; text-decoration: none; box-shadow: 0 4px 24px rgba(37,211,102,0.5); transition: all 0.2s; }
        .wa-float:hover { transform: scale(1.1); }
        .wa-tooltip { position: absolute; right: 72px; background: #25D366; color: #fff; padding: 7px 14px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; white-space: nowrap; opacity: 0; transition: opacity 0.2s; pointer-events: none; }
        .wa-float:hover .wa-tooltip { opacity: 1; }
        .lang-switcher { position: relative; }
        .lang-btn { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,169,110,0.25); padding: 6px 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #c9a96e; border-radius: 4px; transition: all 0.2s; }
        .lang-btn:hover { border-color: #c9a96e; background: rgba(201,169,110,0.08); }
        .lang-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #111; border: 1px solid rgba(201,169,110,0.25); border-radius: 6px; overflow: hidden; z-index: 200; min-width: 140px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); }
        .lang-option { display: flex; align-items: center; gap: 8px; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: rgba(240,234,214,0.7); cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; }
        .lang-option:hover { background: rgba(201,169,110,0.1); color: #c9a96e; }
        .lang-option.active { color: #c9a96e; background: rgba(201,169,110,0.08); }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .modules-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .sectors-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="grain" />

      {/* TRIAL BANNER */}
      <div className="trial-banner">{t.trial}</div>

      {/* NAVBAR */}
      <nav style={{ position: "sticky", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(201,169,110,0.1)", padding: "0 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          <span style={{ fontSize: 22, fontWeight: 300, letterSpacing: "0.12em" }}>XYRA</span>
          <div className="desktop-only" style={{ display: "flex", gap: 36 }}>
            {t.nav.map((l, i) => (
              <a key={i} className="nav-link" href={["#features","#sectors","#pricing","#faq"][i]}>{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* LANG SWITCHER */}
            <div className="lang-switcher">
              <button className="lang-btn" onClick={() => setLangOpen(o => !o)}>
                {LANGS.find(l => l.code === lang)?.flag} {LANGS.find(l => l.code === lang)?.label} <span style={{ fontSize: 10 }}>▾</span>
              </button>
              {langOpen && (
                <div className="lang-dropdown">
                  {LANGS.map(l => (
                    <button key={l.code} className={`lang-option${lang === l.code ? " active" : ""}`}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <a className="btn-primary" href="/inscription" style={{ padding: "10px 24px", fontSize: 13 }}>
              {t.navCta}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "95vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 24px 80px", overflow: "hidden" }}>
        <div className="hero-glow" />
        <div style={{ position: "absolute", top: 0, left: "20%", width: 1, height: "40%", background: "linear-gradient(180deg, transparent, rgba(201,169,110,0.15), transparent)" }} />
        <div style={{ position: "absolute", top: 0, right: "20%", width: 1, height: "40%", background: "linear-gradient(180deg, transparent, rgba(201,169,110,0.15), transparent)" }} />
        <div className="fade-in" style={{ maxWidth: 900, position: "relative", zIndex: 1 }}>
          <div className="badge" style={{ marginBottom: 28 }}>
            <span className="pulse" style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#2EC99A", marginRight: 8, verticalAlign: "middle" }} />
            {t.badge}
          </div>
          <h1 style={{ fontSize: "clamp(46px, 8vw, 90px)", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 28 }}>
            {t.h1a}<br />
            <span className="gold-gradient" style={{ fontStyle: "italic" }}>{t.h1b}</span><br />
            <span style={{ fontWeight: 300, fontSize: "0.85em", color: "rgba(240,234,214,0.8)" }}>{t.h1c}</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 300, color: "rgba(240,234,214,0.65)", lineHeight: 1.7, maxWidth: 620, margin: "0 auto 24px", letterSpacing: "0.01em" }}>
            {t.sub}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.4)" }}>{t.payLabel}</span>
            {["🌊 Wave", "📱 Orange Money", "📲 MTN", "💳 Visa/MC", "🏦 SEPA"].map(pay => (
              <span key={pay} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,110,0.15)", padding: "4px 10px", color: "rgba(240,234,214,0.6)" }}>{pay}</span>
            ))}
          </div>
          <div style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: 8, padding: "16px 24px", maxWidth: 500, margin: "0 auto 32px", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#c9a96e", marginBottom: 4 }}>{t.trialBox1}</div>
            <div style={{ fontSize: 13, color: "rgba(240,234,214,0.6)" }}>{t.trialBox2}</div>
          </div>
          <div className="hero-btns" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn-primary" href="/inscription" style={{ fontSize: 16, padding: "16px 40px" }}>{t.cta1}</a>
            <a className="btn-outline" href="/demo" style={{ fontSize: 16, padding: "16px 40px" }}>{t.cta2}</a>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)" }}>
          <div className="scroll-line" />
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ padding: "80px 24px", borderTop: "1px solid rgba(201,169,110,0.08)", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>
        <div className="stats-grid" style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40, textAlign: "center" }}>
          {[[stat1+"+", t.statsLabels[0]], [stat2+"%", t.statsLabels[1]], [stat3, t.statsLabels[2]], [fmtPrice(stat4, lang), t.statsLabels[3]]].map(([v, l], i) => (
            <div key={i}>
              <div className="stat-number gold-gradient">{v}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.5)", marginTop: 12, letterSpacing: "0.04em" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section id="features" style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p className="section-label">{t.featTitle}</p>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {t.featH2a}<br />
              <span className="gold-gradient" style={{ fontStyle: "italic" }}>{t.featH2b}</span>
            </h2>
            <div className="divider" style={{ marginTop: 32 }} />
          </div>
          <div className="modules-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
            {t.modules.map((m, i) => (
              <div key={i} className="module-card">
                <div style={{ fontSize: 28, marginBottom: 12 }}>{m.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.5)", lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section id="sectors" style={{ padding: "80px 24px 120px", background: "rgba(201,169,110,0.02)", borderTop: "1px solid rgba(201,169,110,0.08)", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="section-label">{t.sectTitle}</p>
            <h2 style={{ fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {t.sectH2a}<br />
              <span className="gold-gradient" style={{ fontStyle: "italic" }}>{t.sectH2b}</span>
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(240,234,214,0.5)", maxWidth: 540, margin: "20px auto 0", lineHeight: 1.7 }}>{t.sectSub}</p>
            <div className="divider" style={{ marginTop: 32 }} />
          </div>
          <div className="sectors-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 8 }}>
            {SECTORS.map(s => (
              <div key={s.fr} className="sector-card">
                <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{s[lang] || s.fr}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(240,234,214,0.4)" }}>{s["sub"+lang.charAt(0).toUpperCase()+lang.slice(1)] || s.subFr}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="section-label">{t.pricingTitle}</p>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 300, letterSpacing: "-0.02em", marginBottom: 32 }}>
              {t.pricingH2a}<br />
              <span className="gold-gradient" style={{ fontStyle: "italic" }}>{t.pricingH2b}</span>
            </h2>
            <div className="toggle-pill">
              <button className={`toggle-option${!billingAnnual ? " active" : ""}`} onClick={() => setBillingAnnual(false)}>{t.monthly}</button>
              <button className={`toggle-option${billingAnnual ? " active" : ""}`} onClick={() => setBillingAnnual(true)}>{t.annual}</button>
            </div>
            {billingAnnual && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#c9a96e", marginLeft: 12 }}>{t.annualSave}</span>}
          </div>
          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, marginBottom: 40 }}>
            {["Starter","Business Pro","Enterprise"].map((name, i) => (
              <div key={name} className={`plan-card${i===1 ? " featured" : ""}`}>
                {i===1 && (
                  <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "#c9a96e", color: "#0a0a0a", fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 20px" }}>
                    {t.recommended}
                  </div>
                )}
                <div style={{ paddingTop: i===1 ? 16 : 0 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: ["#c9a96e","#d4af6a","#e8d5a3"][i], marginBottom: 12 }}>{name}</div>
                  <div style={{ fontSize: "clamp(40px, 5vw, 56px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {billingAnnual ? fmtPrice(annualPrice(parseInt(planPrices[i])), lang) : fmtPrice(planPrices[i], lang)}
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.4)", marginBottom: 8 }}>{p.per}{billingAnnual ? " "+t.billedAnnual : ""}</div>
                  <div style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: 4, padding: "6px 10px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#c9a96e", marginBottom: 16 }}>{t.trialBadge}</div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(240,234,214,0.55)", lineHeight: 1.6, marginBottom: 24 }}>{t.planDesc[i]}</p>
                  <div style={{ width: "100%", height: 1, background: "rgba(201,169,110,0.12)", marginBottom: 24 }} />
                  {t.planFeatures[i].map(f => (
                    <div key={f} className="check-item"><span className="check-icon">◆</span><span>{f}</span></div>
                  ))}
                  {t.planNo[i].map(f => (
                    <div key={f} className="cross-item"><span style={{ color: "rgba(240,234,214,0.25)", fontSize: 12 }}>✗</span><span>{f}</span></div>
                  ))}
                  <a href="/inscription" className={i===1 ? "btn-primary" : "btn-outline"} style={{ display: "block", textAlign: "center", marginTop: 24, padding: "14px" }}>
                    {t.planCta[i]}
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
            {t.guarantees.map(g => (
              <span key={g} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,234,214,0.4)" }}>{g}</span>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 24px", background: "rgba(201,169,110,0.02)", borderTop: "1px solid rgba(201,169,110,0.08)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.15)", padding: "40px 48px", position: "relative" }}>
            <div style={{ color: "#c9a96e", fontSize: 20, marginBottom: 20 }}>{"★".repeat(5)}</div>
            <div style={{ fontSize: "clamp(16px,2.5vw,20px)", fontStyle: "italic", lineHeight: 1.7, color: "rgba(240,234,214,0.85)", marginBottom: 24 }}>
              "{t.testimonials[activeTestimonial].text}"
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>{t.testimonials[activeTestimonial].name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(240,234,214,0.4)", marginTop: 4 }}>{t.testimonials[activeTestimonial].role}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
              {t.testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} style={{ width: i===activeTestimonial?24:8, height: 8, borderRadius: 4, background: i===activeTestimonial?"#c9a96e":"rgba(201,169,110,0.25)", border: "none", cursor: "pointer", transition: "all 0.3s" }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: "80px 24px 120px", borderTop: "1px solid rgba(201,169,110,0.08)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="section-label">{t.faqTitle}</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 50px)", fontWeight: 300, letterSpacing: "-0.02em" }}>
              {t.faqH2a} <span className="gold-gradient" style={{ fontStyle: "italic" }}>{t.faqH2b}</span>
            </h2>
            <div className="divider" style={{ marginTop: 28 }} />
          </div>
          {t.faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-q" onClick={() => setOpenFaq(openFaq===i ? null : i)}>
                {f.q}
                <span style={{ color: "#c9a96e", fontSize: 22, flexShrink: 0, transition: "transform 0.25s", transform: openFaq===i?"rotate(45deg)":"rotate(0deg)", display: "inline-block" }}>+</span>
              </button>
              <div className="faq-a" style={{ maxHeight: openFaq===i?220:0, paddingBottom: openFaq===i?20:0 }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="signup" style={{ padding: "140px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(ellipse, rgba(201,169,110,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p className="section-label">{t.ctaTitle}</p>
          <h2 style={{ fontSize: "clamp(38px, 6vw, 72px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 24 }}>
            {t.ctaH2a}<br />
            <span className="gold-gradient" style={{ fontStyle: "italic" }}>{t.ctaH2b}</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(240,234,214,0.55)", marginBottom: 48, maxWidth: 500, margin: "0 auto 48px" }}>{t.ctaSub}</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn-primary" href="/inscription" style={{ fontSize: 16, padding: "18px 48px" }}>{t.ctaBtn1}</a>
            <a className="btn-outline" href={`${WA_BASE}?text=${t.waDemo}`} target="_blank" rel="noreferrer" style={{ fontSize: 16, padding: "18px 48px" }}>{t.ctaBtn2}</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(201,169,110,0.1)", paddiing: "48px 40px", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="footer-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: "0.12em", marginBottom: 12 }}>XYRA</div>
            <p style={{ fontSize: 13, color: "rgba(240,234,214,0.4)", lineHeight: 1.7, maxWidth: 280 }}>{t.footerDesc}</p>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <a href={WA_BASE} style={{ fontSize: 20, textDecoration: "none" }}>💬</a>
              <a href="#" style={{ fontSize: 20, textDecoration: "none" }}>📸</a>
              <a href="#" style={{ fontSize: 20, textDecoration: "none" }}>💼</a>
            </div>
          </div>
          {t.footerCols.map(col => (
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
          <span>{t.footerCopy}</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, marginRight: 4 }}>{t.footerPay}</span>
            {["🌊 Wave","📱 Orange Money","💳 Visa","🏦 SEPA","Flutterwave"].map(pay => (
              <span key={pay} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,110,0.1)", padding: "3px 8px", fontSize: 10 }}>{pay}</span>
            ))}
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOTTANT */}
      <a className="wa-float" href={`${WA_BASE}?text=${t.waMsg}`} target="_blank" rel="noreferrer" title="WhatsApp">
        <div className="wa-tooltip">{t.waTooltip}</div>
        💬
      </a>
    </div>
  );
}