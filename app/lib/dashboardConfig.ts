// Configuration partagée entre les deux dashboards (app/mon-espace/xyra.jsx
// et app/dashboard/tymeless.jsx) : plans, accès par page, structure de la
// sidebar, profils sectoriels. Réunifiée le 14/09/2026 (T7) — avant cette
// extraction, ce bloc était dupliqué à l'identique dans les deux fichiers.
//
// Réconciliation faite lors de l'extraction (les deux copies divergeaient
// légèrement, toujours par ajout jamais par retrait de capacité) :
// - PAGE_ACCESS.multi_societes : liste la plus large des deux conservée.
// - PROFILS_SECTEURS[*].termes.devis : présent partout (manquait côté
//   TymelessOS, qui ne traduisait donc jamais le libellé "Devis" selon le
//   secteur métier — corrigé ici).

export const PLANS = {
  starter:        {id:"starter",        nom:"Starter",            prix:"59€/mois",    color:"#4B7BFF", icon:"◎", acces:["wallet","cartes","crm","devis","facturation"], description:"Wallet · Paiements · Cartes · CRM · Devis · Facturation"},
  business:       {id:"business",       nom:"Business Pro",       prix:"129€/mois",   color:"#C9A84C", icon:"✦", acces:["tout"], description:"Tout Starter + Suite complète métier · Équipe · Analytique · Prospection"},
  enterprise:     {id:"enterprise",     nom:"Enterprise",         prix:"249€/mois",   color:"#9B5FFF", icon:"◈", acces:["tout"], description:"Tout Business Pro + Bot WhatsApp · API · Déploiement SaaS · Support 24h"},
  multi_societes: {id:"multi_societes", nom:"Multi-Sociétés",     prix:"499€/mois",   color:"#4B7BFF", icon:"🏢", acces:["multi"], description:"3 à 5 sociétés · Tout dashboard sauf Club & Prospection · Multi-devises · Connexion bancaire"},
  multi_pro:      {id:"multi_pro",      nom:"Multi-Sociétés Pro", prix:"799€/mois",   color:"#FF8C3A", icon:"🏗", acces:["multi"], description:"5 à 10 sociétés · Rapports consolidés · API dédiée · Onboarding personnalisé"},
  holding:        {id:"holding",        nom:"Holding",            prix:"1200€/mois",  color:"#C9A84C", icon:"🏛", acces:["multi"], description:"Sociétés illimitées · Vue holding complète · Intercompany · Support 24h"},
  club_affaires:  {id:"club_affaires",  nom:"Club d'affaires",    prix:"2000€/an",    color:"#C9A84C", icon:"🤝", acces:["club"], description:"Réseau privé · Deals -10% · IA Match · Événements VIP"},
  owner:          {id:"owner",          nom:"Owner",              prix:"—",           color:"#C9A84C", icon:"★", acces:["tout"], description:"Accès total — Curtiss"},
};

const MULTI = ["multi_societes","multi_pro","holding"];
export const PAGE_ACCESS: Record<string, string[]> = {
  // Starter (59€) — base
  wallet:         ["starter","business","enterprise",...MULTI,"owner"],
  cartes:         ["starter","business","enterprise",...MULTI,"owner"],
  crm:            ["starter","business","enterprise",...MULTI,"owner"],
  devis:          ["starter","business","enterprise",...MULTI,"owner"],
  facturation:    ["starter","business","enterprise",...MULTI,"owner"],
  settings:       ["starter","business","enterprise",...MULTI,"club_affaires","owner"],
  // Business Pro (129€) + Multi-Sociétés (tout sauf club & prospection)
  notefrais:      ["business","enterprise",...MULTI,"owner"],
  overview:       ["business","enterprise",...MULTI,"owner"],
  investissement: ["business","enterprise",...MULTI,"owner"],
  compta:         ["business","enterprise",...MULTI,"owner"],
  tresorerie:     ["business","enterprise",...MULTI,"owner"],
  analytique:     ["business","enterprise",...MULTI,"owner"],
  clients:        ["business","enterprise",...MULTI,"owner"],
  partenaires:    ["business","enterprise",...MULTI,"owner"],
  annuaire:       ["business","enterprise",...MULTI,"owner"],
  wallet_membres: ["business","enterprise",...MULTI,"owner"],
  evenements:     ["business","enterprise",...MULTI,"owner"],
  scoring:        ["starter","business","enterprise",...MULTI,"owner"],
  equipe:         ["business","enterprise",...MULTI,"owner"],
  planning:       ["business","enterprise",...MULTI,"owner"],
  deals:          ["business","enterprise",...MULTI,"owner"],
  stock:          ["business","enterprise",...MULTI,"owner"],
  services:       ["business","enterprise",...MULTI,"owner"],
  notifications:  ["starter","business","enterprise",...MULTI,"club_affaires","owner"],
  // Enterprise uniquement
  prospection:    ["enterprise","owner"],
  // Club d'affaires — option séparée ou inclus Enterprise
  club_affaires:  ["enterprise","club_affaires","owner"],
  // Multi-Sociétés — plans multi uniquement
  multi_societes: ["multi_societes","multi_pro","multi_societes_pro","holding","enterprise","white_label_starter","white_label_business","white_label_enterprise","owner"],
  fournisseurs:   ["business","enterprise","multi_societes","multi_societes_pro","holding","white_label_starter","white_label_business","white_label_enterprise","owner"],
  signature:      ["business","enterprise","owner"],
  formation:      ["business","enterprise","owner"],
  // Enterprise (249€)
  revendeur:      ["white_label_starter","white_label_business","white_label_enterprise","owner"],
  deploiement:    ["enterprise","owner"],
  api:            ["enterprise","owner"],
};

export const NAV = [
  { group:"ACCUEIL", items:[
    { id:"accueil",       icon:"🏠", label:"Accueil",             badge:"notifs" },
  ]},
  { group:"MON ESPACE", items:[
    { id:"wallet",        icon:"💳", label:"Wallet & Paiements"   },
    { id:"cartes",        icon:"◈",  label:"Cartes Virtuelles"    },
  ]},
  { group:"BUSINESS", items:[
    { id:"overview",      icon:"◈",  label:"Vue d'ensemble",      badge:"devis"  },
    { id:"crm",           icon:"◎",  label:"CRM",                 badge:"crm"    },
    { id:"devis",         icon:"◧",  label:"Devis"                },
    { id:"investissement",icon:"◐",  label:"Investissement IA"    },
    { id:"compta",        icon:"◉",  label:"Comptabilité"         },
    { id:"notefrais",     icon:"🧾", label:"Notes de Frais"        },
    { id:"tresorerie",    icon:"◑",  label:"Trésorerie 90 jours"  },
    { id:"analytique",    icon:"◒",  label:"Analytique & CA"      },
  ]},
  { group:"RÉSEAU", items:[
    { id:"clients",       icon:"◬",  label:"Clients"              },
    { id:"fournisseurs",  icon:"⊞",  label:"Fournisseurs"         },
    { id:"revendeur",     icon:"◈",  label:"Espace revendeur"     },
    { id:"partenaires",   icon:"⬡",  label:"Partenaires & AA",    badge:"comm"   },
    { id:"club_affaires", icon:"◈",  label:"Club d'affaires"      },
    { id:"multi_societes",icon:"🏢", label:"Multi-Sociétés"       },
    { id:"annuaire",      icon:"◱",  label:"Réseau & Annuaire"    },
    { id:"evenements",    icon:"◆",  label:"Événements"           },
    { id:"scoring",       icon:"★",  label:"Réputation & NPS"     },
  ]},
  { group:"OPÉRATIONS", items:[
    { id:"equipe",        icon:"⊞",  label:"Équipe",              badge:"chat_eq"},
    { id:"planning",      icon:"⊡",  label:"Planning & Agenda"    },
    { id:"prospection",   icon:"⊕",  label:"Prospection Auto"     },
    { id:"deals",         icon:"📋", label:"Deals & Opportunités"  },
    { id:"stock",         icon:"⊟",  label:"Stock",               badge:"stock"  },
    { id:"services",      icon:"⊛",  label:"Produits & Services"  },
  ]},
  { group:"DÉVELOPPEMENT", items:[
    { id:"chat",          icon:"💬", label:"Chat",                badge:"chat_eq"},
    { id:"conversations_whatsapp", icon:"💬", label:"WhatsApp — Lea" },
    { id:"notifications", icon:"🔔", label:"Notifications",       badge:"notifs" },
    { id:"signature",     icon:"✦",  label:"Contrats & Signatures" },
    { id:"facturation",   icon:"🧾", label:"Facturation Électronique"},
    { id:"formation",     icon:"⊿",  label:"Formation équipe"     },
    { id:"api",           icon:"◇",  label:"API Xyra"             },
    { id:"settings",      icon:"⚙",  label:"Paramètres"           },
  ]},
  { group:"BIENTÔT DISPONIBLE", items:[
    { id:"gestion_projet",  icon:"📊", label:"Gestion de projet",   soon:true },
    { id:"marketing",       icon:"📣", label:"Marketing & Campagnes",soon:true },
    { id:"organisation",    icon:"📝", label:"Organisation & Wiki",  soon:true },
    { id:"booking",         icon:"🗓", label:"Booking public",       soon:true },
    { id:"app_mobile",      icon:"📱", label:"Application mobile",   soon:true },
    { id:"iban_bancaire",   icon:"🏦", label:"IBAN bancaire réel",   soon:true },
    { id:"avance_factures", icon:"💰", label:"Avance sur factures",  soon:true },
    { id:"academie",        icon:"🎓", label:"Académie Xyra",        soon:true },
    { id:"traduction",      icon:"🌍", label:"Traduction auto",      soon:true },
    { id:"centre_appels",   icon:"📞", label:"Centre d'appels IA",   soon:true },
  ]},
];

export const MAPPING_PLANS: Record<string,string> = {"starter":"starter","démarreur":"starter","demarreur":"starter","business pro":"business","business_pro":"business","business":"business","enterprise":"enterprise","multi-sociétés":"multi_societes","multisociétés":"multi_societes","multi_societes":"multi_societes","multi-sociétés pro":"multi_societes_pro","multi_societes_pro":"multi_societes_pro","holding":"holding","club d'affaires":"club_affaires","club_affaires":"club_affaires","owner":"owner","propriétaire":"owner","proprietaire":"owner"};
export function normaliserPlan(planBrut?: string | null){
  if(!planBrut)return "starter";
  const cle=planBrut.toLowerCase().trim();
  return MAPPING_PLANS[cle]||cle.replace(/[^a-z]+/g,"_").replace(/^_|_$/g,"")||"starter";
}

export const PROFILS_SECTEURS: Record<string, any> = {
  conciergerie:{label:"🏠 Conciergerie / Services",termes:{mission:"Mission",missions:"Missions",client:"Client",clients:"Clients",service:"Service",services:"Services",collaborateur:"Collaborateur",stock:"Fournitures",commande:"Commande",rdv:"RDV",produit:"Produit",devis:"Devis"},services:["Airbnb","Résidentiel","Bureaux","Jet Privé","Yacht","Rapatriement"],stockCategories:["Nettoyage","Protection","Maritime","Aviation","Textile","Consommables"],kpiMission:"Missions",couleur:"#C9A84C"},
  restaurant:{label:"🍽️ Restaurant / Restauration",termes:{mission:"Service",missions:"Services",client:"Client",clients:"Clients",service:"Prestation",services:"Prestations",collaborateur:"Employé",stock:"Ingrédients",commande:"Commande",rdv:"Réservation",produit:"Plat",devis:"Devis"},services:["Déjeuner","Dîner","Brunch","Livraison","Traiteur","Banquet","Room Service"],stockCategories:["Viandes","Poissons","Légumes","Laitiers","Épices","Boissons","Emballages","Hygiène"],kpiMission:"Couverts",couleur:"#FF8C3A",normes:["HACCP","Chaîne du froid","Températures","DLC/DLUO","Plan de nettoyage","Traçabilité alimentaire"]},
  hotel:{label:"🏨 Hôtellerie",termes:{mission:"Séjour",missions:"Séjours",client:"Client",clients:"Clients",service:"Service",services:"Services",collaborateur:"Employé",stock:"Fournitures",commande:"Réservation",rdv:"Check-in",produit:"Prestation",devis:"Devis"},services:["Chambre Standard","Chambre Deluxe","Suite","Petit-déjeuner","Spa","Conciergerie","Room Service","Événement"],stockCategories:["Linge","Produits accueil","Minibar","Entretien","Restauration","Fleurs","Papeterie"],kpiMission:"Nuitées",couleur:"#9B5FFF",normes:["ISO 9001","Standards luxe","Protocole VIP","Rotation linge","Maintenance préventive","Guest experience"]},
  btp:{label:"🔨 BTP / Construction",termes:{mission:"Chantier",missions:"Chantiers",client:"Maître d'ouvrage",clients:"Clients",service:"Prestation",services:"Prestations",collaborateur:"Ouvrier",stock:"Matériaux",commande:"Bon de commande",rdv:"Réunion chantier",produit:"Matériau",devis:"Devis"},services:["Maçonnerie","Plomberie","Électricité","Menuiserie","Peinture","Rénovation","Démolition","Gros oeuvre"],stockCategories:["Gros oeuvre","Plomberie","Électricité","Menuiserie","Peinture","Outillage","EPI","Béton"],kpiMission:"Chantiers",couleur:"#FF5252",normes:["Plan de prévention","EPI obligatoire","PPSPS","RGIE","DTU","Bilan carbone"]},
  medical:{label:"🏥 Médical / Santé",termes:{mission:"Consultation",missions:"Consultations",client:"Patient",clients:"Patients",service:"Acte médical",services:"Actes",collaborateur:"Soignant",stock:"Matériel médical",commande:"Approvisionnement",rdv:"Rendez-vous",produit:"Médicament",devis:"Devis"},services:["Consultation","Acte médical","Chirurgie","Radiologie","Biologie","Kinésithérapie","Urgences","Téléconsultation"],stockCategories:["Médicaments","Consommables","Stérilisation","Imagerie","Prothèses","EPI","Formulaires"],kpiMission:"Consultations",couleur:"#2EC9B0",normes:["ISO 13485","HACCP médical","Pharmacovigilance","Traçabilité","RGPD santé","Stérilisation"]},
  beaute:{label:"💅 Beauté / Esthétique",termes:{mission:"Prestation",missions:"Prestations",client:"Cliente",clients:"Clientes",service:"Soin",services:"Soins",collaborateur:"Praticien",stock:"Produits",commande:"Commande",rdv:"Rendez-vous",produit:"Produit beauté",devis:"Devis"},services:["Coiffure","Coloration","Soin visage","Épilation","Massage","Manucure","Maquillage","Conseil beauté"],stockCategories:["Capillaires","Colorations","Soins visage","Maquillage","Épilation","Hygiène","Emballages"],kpiMission:"Prestations",couleur:"#FF5F9E"},
  transport:{label:"🚗 Transport / VTC",termes:{mission:"Course",missions:"Courses",client:"Passager",clients:"Passagers",service:"Trajet",services:"Trajets",collaborateur:"Chauffeur",stock:"Consommables",commande:"Réservation",rdv:"Prise en charge",produit:"Service",devis:"Devis"},services:["VTC Standard","VTC Premium","Navette aéroport","Transfert gare","Mise à disposition","Longue distance","Navette entreprise"],stockCategories:["Carburant","Entretien","Accessoires","Boissons","Presse","Chargeurs","Désinfectants"],kpiMission:"Courses",couleur:"#4B7BFF"},
  immobilier:{label:"🏢 Immobilier",termes:{mission:"Visite",missions:"Visites",client:"Acquéreur",clients:"Clients",service:"Mandat",services:"Mandats",collaborateur:"Agent",stock:"Fournitures",commande:"Offre",rdv:"Visite",produit:"Bien immobilier",devis:"Offre"},services:["Location","Vente","Gestion locative","Syndic","Estimation","Investissement","Neuf","Commerce"],stockCategories:["Panneaux","Imprimés","Fournitures","Clés","Matériel photo","Objets déco"],kpiMission:"Visites",couleur:"#2ECDC4"},
  formation:{label:"🎓 Formation / Coaching",termes:{mission:"Session",missions:"Sessions",client:"Apprenant",clients:"Apprenants",service:"Formation",services:"Formations",collaborateur:"Formateur",stock:"Matériel pédagogique",commande:"Inscription",rdv:"Session",produit:"Module",devis:"Devis"},services:["Formation présentielle","Formation en ligne","Coaching individuel","Atelier","Séminaire","Certification","E-learning","MOOC"],stockCategories:["Supports cours","Matériel bureau","Informatique","Livres","Badges","Repas","Vidéo"],kpiMission:"Sessions",couleur:"#C9A84C"},
  autre:{label:"⚙️ Autre / Personnalisé",termes:{mission:"Mission",missions:"Missions",client:"Client",clients:"Clients",service:"Service",services:"Services",collaborateur:"Collaborateur",stock:"Stock",commande:"Commande",rdv:"Rendez-vous",produit:"Produit",devis:"Devis"},services:["Service 1","Service 2","Service 3","Service 4"],stockCategories:["Catégorie 1","Catégorie 2","Catégorie 3"],kpiMission:"Missions",couleur:"#5A5A7A"},
};

export const PROFIL_DEFAUT=PROFILS_SECTEURS.conciergerie;

export const MODULES_PAR_SECTEUR: Record<string, string[]> = {
  conciergerie:["accueil","wallet","cartes","overview","crm","devis","compta","tresorerie","analytique","clients","partenaires","club_affaires","annuaire","wallet_membres","evenements","scoring","equipe","planning","prospection","deals","stock","services","chat","notifications","signature","facturation","formation","deploiement","api","settings","admin"],
  restaurant:["accueil","wallet","cartes","overview","crm","devis","compta","tresorerie","analytique","clients","scoring","equipe","planning","stock","services","chat","notifications","signature","facturation","settings"],
  hotel:["accueil","wallet","cartes","overview","crm","devis","compta","tresorerie","analytique","clients","partenaires","scoring","equipe","planning","stock","services","chat","notifications","signature","facturation","settings"],
  btp:["accueil","wallet","cartes","overview","crm","devis","compta","tresorerie","analytique","clients","partenaires","scoring","equipe","planning","prospection","deals","stock","services","chat","notifications","signature","facturation","settings"],
  medical:["accueil","wallet","cartes","overview","crm","devis","compta","tresorerie","analytique","clients","scoring","equipe","planning","stock","services","chat","notifications","signature","facturation","settings"],
  beaute:["accueil","wallet","cartes","overview","crm","devis","compta","tresorerie","analytique","clients","scoring","equipe","planning","stock","services","chat","notifications","signature","facturation","settings"],
  transport:["accueil","wallet","cartes","overview","crm","devis","compta","tresorerie","analytique","clients","partenaires","scoring","equipe","planning","prospection","deals","chat","notifications","signature","facturation","settings"],
  immobilier:["accueil","wallet","cartes","overview","crm","devis","compta","tresorerie","analytique","clients","partenaires","annuaire","scoring","equipe","planning","prospection","deals","services","chat","notifications","signature","facturation","settings"],
  formation:["accueil","wallet","cartes","overview","crm","devis","compta","tresorerie","analytique","clients","partenaires","scoring","equipe","planning","prospection","deals","services","chat","notifications","signature","facturation","formation","settings"],
  autre:["accueil","wallet","cartes","overview","crm","devis","compta","tresorerie","analytique","clients","partenaires","scoring","equipe","planning","prospection","deals","stock","services","chat","notifications","signature","facturation","settings"],
};

export const getModulesBySecteur=(secteurLabel?: string | null, isPlanOwner=false)=>{
  if(isPlanOwner)return null; // owner voit tout
  const key=Object.keys(PROFILS_SECTEURS).find(k=>PROFILS_SECTEURS[k].label===secteurLabel);
  return key?MODULES_PAR_SECTEUR[key]:null;
};

export const hasAccess=(plan: string, page: string)=>{const allowed=PAGE_ACCESS[page];if(!allowed)return true;return allowed.includes(plan);};
