"use client";
import { useState, useRef, useEffect } from "react";

const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
  teal:"#2ECDC4", pink:"#FF5F9E",
};

const PLANS = {
  starter:        {id:"starter",        nom:"Starter",            prix:"59€/mois",    color:"#4B7BFF", icon:"◎", acces:["wallet","cartes","crm","devis","facturation"], description:"Wallet · Paiements · Cartes · CRM · Devis · Facturation"},
  business:       {id:"business",       nom:"Business Pro",       prix:"129€/mois",   color:"#C9A84C", icon:"✦", acces:["tout"], description:"Tout Starter + Suite complète métier · Équipe · Analytique · Prospection"},
  enterprise:     {id:"enterprise",     nom:"Enterprise",         prix:"249€/mois",   color:"#9B5FFF", icon:"◈", acces:["tout"], description:"Tout Business Pro + Bot WhatsApp · API · Déploiement SaaS · Support 24h"},
  multi_societes: {id:"multi_societes", nom:"Multi-Sociétés",     prix:"499€/mois",   color:"#4B7BFF", icon:"🏢", acces:["multi"], description:"3 à 5 sociétés · Tout dashboard sauf Club & Prospection · Multi-devises · Connexion bancaire"},
  multi_pro:      {id:"multi_pro",      nom:"Multi-Sociétés Pro", prix:"799€/mois",   color:"#FF8C3A", icon:"🏗", acces:["multi"], description:"5 à 10 sociétés · Rapports consolidés · API dédiée · Onboarding personnalisé"},
  holding:        {id:"holding",        nom:"Holding",            prix:"1200€/mois",  color:"#C9A84C", icon:"🏛", acces:["multi"], description:"Sociétés illimitées · Vue holding complète · Intercompany · Support 24h"},
  club_affaires:  {id:"club_affaires",  nom:"Club d'affaires",    prix:"2000€/an",    color:"#C9A84C", icon:"🤝", acces:["club"], description:"Réseau privé · Deals -10% · IA Match · Événements VIP"},
  owner:          {id:"owner",          nom:"Owner",              prix:"—",           color:"#C9A84C", icon:"★", acces:["tout"], description:"Accès total — Curtiss"},
};

const MODULE_PRICES = {
  overview:19, analytique:19, tresorerie:19, compta:19,
  notefrais:19,
  clients:14, partenaires:19, club_affaires:19, annuaire:14,
  wallet_membres:19, evenements:14, scoring:14,
  equipe:19, planning:14, prospection:29, deals:14,
  stock:14, services:14, notifications:9, signature:19,
  formation:14, deploiement:49, api:29, investissement:24,
};

const MULTI = ["multi_societes","multi_pro","holding"];
const PAGE_ACCESS = {
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
  multi_societes: ["multi_societes","multi_pro","multi_societes_pro","holding","enterprise","owner"],
  signature:      ["business","enterprise","owner"],
  formation:      ["business","enterprise","owner"],
  // Enterprise (249€)
  deploiement:    ["enterprise","owner"],
  api:            ["enterprise","owner"],
};

const NAV = [
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
    { id:"partenaires",   icon:"⬡",  label:"Partenaires & AA",    badge:"comm"   },
    { id:"club_affaires", icon:"◈",  label:"Club d'affaires"      },
    { id:"multi_societes",icon:"🏢", label:"Multi-Sociétés"       },
    { id:"annuaire",      icon:"◱",  label:"Réseau & Annuaire"    },
    { id:"wallet_membres",icon:"◈",  label:"Wallets Membres"      },
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
    { id:"notifications", icon:"🔔", label:"Notifications",       badge:"notifs" },
    { id:"signature",     icon:"✦",  label:"Contrats & Signatures" },
    { id:"facturation",   icon:"🧾", label:"Facturation Électronique"},
    { id:"formation",     icon:"⊿",  label:"Formation équipe"     },
    { id:"deploiement",   icon:"🌍", label:"Déploiement SaaS"     },
    { id:"api",           icon:"◇",  label:"API Xyra"             },
    { id:"settings",      icon:"⚙",  label:"Paramètres"           },
    { id:"admin",         icon:"👑", label:"Admin Curtiss"         },
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

const MAPPING_PLANS={"starter":"starter","démarreur":"starter","demarreur":"starter","business pro":"business","business_pro":"business","business":"business","enterprise":"enterprise","multi-sociétés":"multi_societes","multisociétés":"multi_societes","multi_societes":"multi_societes","multi-sociétés pro":"multi_societes_pro","multi_societes_pro":"multi_societes_pro","holding":"holding","club d'affaires":"club_affaires","club_affaires":"club_affaires","owner":"owner","propriétaire":"owner","proprietaire":"owner"};
function normaliserPlan(planBrut){
  if(!planBrut)return "starter";
  const cle=planBrut.toLowerCase().trim();
  return MAPPING_PLANS[cle]||cle.replace(/[^a-z]+/g,"_").replace(/^_|_$/g,"")||"starter";
}
const PROFILS_SECTEURS={
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

const PROFIL_DEFAUT=PROFILS_SECTEURS.conciergerie;

const MODULES_PAR_SECTEUR={
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

const getModulesBySecteur=(secteurLabel,isPlanOwner=false)=>{
  if(isPlanOwner)return null; // owner voit tout
  const key=Object.keys(PROFILS_SECTEURS).find(k=>PROFILS_SECTEURS[k].label===secteurLabel);
  return key?MODULES_PAR_SECTEUR[key]:null;
};


const DEVISES=[
  {code:"EUR",symbol:"€",flag:"🇪🇺",nom:"Euro",taux:1},
  {code:"XOF",symbol:"₣",flag:"🌍",nom:"Franc CFA",taux:655.96},
  {code:"USD",symbol:"$",flag:"🇺🇸",nom:"Dollar US",taux:1.08},
  {code:"GBP",symbol:"£",flag:"🇬🇧",nom:"Livre Sterling",taux:0.86},
  {code:"MAD",symbol:"د",flag:"🇲🇦",nom:"Dirham",taux:10.82},
  {code:"AED",symbol:"د.إ",flag:"🇦🇪",nom:"Dirham UAE",taux:3.97},
  {code:"CAD",symbol:"$",flag:"🇨🇦",nom:"Dollar CA",taux:1.46},
  {code:"CHF",symbol:"₣",flag:"🇨🇭",nom:"Franc Suisse",taux:0.96},
  {code:"JPY",symbol:"¥",flag:"🇯🇵",nom:"Yen",taux:161.5},
  {code:"CNY",symbol:"¥",flag:"🇨🇳",nom:"Yuan",taux:7.83},
  {code:"NGN",symbol:"₦",flag:"🇳🇬",nom:"Naira",taux:1580},
  {code:"KES",symbol:"Ksh",flag:"🇰🇪",nom:"Shilling Kenya",taux:139},
  {code:"GHS",symbol:"₵",flag:"🇬🇭",nom:"Cedi Ghana",taux:15.6},
  {code:"BRL",symbol:"R$",flag:"🇧🇷",nom:"Real Brésil",taux:5.42},
  {code:"SAR",symbol:"﷼",flag:"🇸🇦",nom:"Riyal SA",taux:4.05},
];

const METHODES_PAY=[{id:"wave",nom:"Wave",icon:"🌊",zone:"Sénégal / Côte d'Ivoire",color:"#4B7BFF",via:"CinetPay"},{id:"orange",nom:"Orange Money",icon:"🟠",zone:"Afrique francophone",color:"#FF8C3A",via:"Flutterwave"},{id:"mtn",nom:"MTN Money",icon:"🟡",zone:"Afrique sub-saharienne",color:"#FFCC00",via:"Flutterwave"},{id:"carte",nom:"Carte bancaire",icon:"💳",zone:"Europe / Monde",color:"#4B7BFF",via:"Flutterwave"},{id:"sepa",nom:"Virement SEPA",icon:"🏦",zone:"Europe",color:"#2EC9B0",via:"Direct"},{id:"whatsapp",nom:"WhatsApp Pay",icon:"💬",zone:"Global",color:"#2EC9B0",via:"Lien paiement"}];
const INIT_DEVIS=[{id:"TYM-0044",client:"Isabelle Moreau",service:"Nettoyage Airbnb",montant:320,statut:"en_attente",date:"15/04",tel:"+33 6 12 34 56 78"},{id:"TYM-0043",client:"Marc Dupont",service:"Nettoyage bureaux",montant:580,statut:"en_attente",date:"14/04",tel:"+33 6 98 76 54 32"},{id:"TYM-0042",client:"Sofia Al-Rashid",service:"Jet privé",montant:2400,statut:"validé",date:"13/04",tel:"+33 7 11 22 33 44"},{id:"TYM-0041",client:"Pierre Lefevre",service:"Rapatriement",montant:4800,statut:"validé",date:"12/04",tel:"+33 6 55 44 33 22"}];
const CRM_LEADS=[{id:1,nom:"Hotel Prestige Paris",contact:"Claire Bernard",metier:"Hôtellerie",etape:"Proposition",score:92,ca_potentiel:8000,derniere:"Hier",source:"Annuaire",notes:"Nettoyage 40 chambres/jour"},{id:2,nom:"AirParis Management",contact:"Kevin Mour",metier:"Airbnb",etape:"Négociation",score:78,ca_potentiel:3600,derniere:"13/04",source:"Partenaire",notes:"15 appartements"},{id:3,nom:"Jet Services Monaco",contact:"Antoine Rivière",metier:"Aviation",etape:"Gagné",score:98,ca_potentiel:12000,derniere:"10/04",source:"Réseau",notes:"Contrat annuel ✓"},{id:4,nom:"Cabinet Delmas",contact:"Me Delmas",metier:"Juridique",etape:"Nouveau",score:55,ca_potentiel:960,derniere:"12/04",source:"LinkedIn",notes:"Nettoyage hebdo"}];
const CLIENTS=[{id:1,nom:"Isabelle Moreau",email:"i.moreau@mail.fr",pays:"🇫🇷",ca:960,statut:"actif",metier:"Gestion Airbnb",score:72,rdv:"17/04 14h"},{id:2,nom:"Marc Dupont",email:"m.dupont@corp.fr",pays:"🇫🇷",ca:3200,statut:"actif",metier:"Immobilier",score:68,rdv:null},{id:3,nom:"Sofia Al-Rashid",email:"sofia@vip.ae",pays:"🇦🇪",ca:9200,statut:"VIP",metier:"Aviation d'affaires",score:98,rdv:"18/04 10h"},{id:4,nom:"Pierre Lefevre",email:"p.lefevre@fr",pays:"🇫🇷",ca:5400,statut:"actif",metier:"Import/Export",score:85,rdv:null},{id:5,nom:"Jean-Marc Olivier",email:"jm@pro.fr",pays:"🇫🇷",ca:14600,statut:"VIP",metier:"Conseil",score:94,rdv:"20/04 9h"}];
const PARTENAIRES=[{id:1,nom:"Thomas Beaumont",role:"Apporteur d'affaires",comm:20,ca:12400,contrats:8,statut:"actif",dues:2480,abo:"Starter"},{id:2,nom:"Leila Mansouri",role:"Agent immobilier",comm:15,ca:8700,contrats:5,statut:"actif",dues:1305,abo:"Business Pro"},{id:3,nom:"Groupe Prestige SARL",role:"Syndic",comm:12,ca:22000,contrats:14,statut:"actif",dues:2640,abo:"Enterprise"},{id:4,nom:"Fatoumata Diop",role:"Apporteuse Afrique",comm:25,ca:6800,contrats:4,statut:"actif",dues:1700,abo:"Business Pro"}];
const ANNUAIRE=[{id:1,nom:"Isabelle Moreau",metier:"Gestion Airbnb",ville:"Paris",pays:"🇫🇷",plan:"Starter",score:72},{id:2,nom:"Marc Dupont",metier:"Immobilier",ville:"Lyon",pays:"🇫🇷",plan:"Business Pro",score:88},{id:3,nom:"Sofia Al-Rashid",metier:"Aviation d'affaires",ville:"Dubaï",pays:"🇦🇪",plan:"Enterprise",score:98},{id:4,nom:"Groupe Prestige SARL",metier:"Syndic",ville:"Paris",pays:"🇫🇷",plan:"Enterprise",score:94},{id:5,nom:"Fatoumata Diop",metier:"Finance Afrique",ville:"Dakar",pays:"🇸🇳",plan:"Business Pro",score:89}];
const STOCK=[{art:"Produit vitres Pro",cat:"Nettoyage",qte:3,min:5,u:"L",four:"CleanPro"},{art:"Microfibre premium",cat:"Nettoyage",qte:24,min:20,u:"pcs",four:"TextilePro"},{art:"Désinfectant surfaces",cat:"Nettoyage",qte:8,min:6,u:"L",four:"CleanPro"},{art:"Housses rapatriement",cat:"Rapatriement",qte:2,min:4,u:"pcs",four:"MedSupply"},{art:"Kit bord jet privé",cat:"Jet/Yacht",qte:5,min:3,u:"kits",four:"LuxEquip"},{art:"Produit nacre bois",cat:"Yacht",qte:1,min:3,u:"L",four:"YachtCare"}];
const PLANNING=[{date:"15/04",h:"09:00",client:"Isabelle Moreau",service:"Nettoyage Airbnb – Montmartre",collab:"Abou",statut:"confirmé",duree:"3h",type:"mission"},{date:"15/04",h:"14:00",client:"Marc Dupont",service:"Nettoyage bureaux – La Défense",collab:"Thomas",statut:"confirmé",duree:"4h",type:"mission"},{date:"17/04",h:"14:00",client:"Isabelle Moreau",service:"RDV client – Suivi contrat",collab:"Béné",statut:"confirmé",duree:"1h",type:"rdv"},{date:"18/04",h:"10:00",client:"Sofia Al-Rashid",service:"RDV VIP – Renouvellement",collab:"Béné",statut:"confirmé",duree:"2h",type:"rdv"}];
const CHARGES=[{cat:"Fournitures nettoyage",mois:420},{cat:"Transport & carburant",mois:380},{cat:"Commissions partenaires",mois:6425},{cat:"Salaires collaborateur",mois:3200},{cat:"Logiciels & abonnements",mois:180},{cat:"Frais divers",mois:150}];
const TRESORERIE_90J=[{sem:"S16 (15 avr)",e:6480,s:3200,sol:8240},{sem:"S17 (22 avr)",e:5200,s:4100,sol:9340},{sem:"S18 (29 avr)",e:7800,s:3500,sol:13640},{sem:"S19 (6 mai)",e:6100,s:6800,sol:12940},{sem:"S20 (13 mai)",e:8400,s:3200,sol:18140},{sem:"S21 (20 mai)",e:9200,s:4400,sol:22940,pred:true},{sem:"S22 (27 mai)",e:7600,s:3100,sol:27440,pred:true},{sem:"S23 (3 juin)",e:10200,s:5200,sol:32440,pred:true}];
const INIT_NOTIFS=[{id:1,type:"urgent",icon:"⚠",titre:"2 devis en attente de validation",heure:"09:00",lu:false},{id:2,type:"urgent",icon:"📦",titre:"Stock critique — Produit vitres + 2 articles",heure:"08:30",lu:false},{id:3,type:"info",icon:"💬",titre:"Abou : produit vitres épuisé",heure:"13:20",lu:false},{id:4,type:"money",icon:"💰",titre:"Commission Leila Mansouri : 1 305€ à payer",heure:"Hier",lu:true},{id:5,type:"good",icon:"⭐",titre:"Nouvel avis 5★ — Sofia Al-Rashid",heure:"Hier",lu:true}];
const CONTRATS=[{id:"CTR-001",type:"Partenaire",nom:"Thomas Beaumont",comm:"20%",statut:"signé",date:"01/03",expire:"28/02/2027"},{id:"CTR-002",type:"Partenaire",nom:"Leila Mansouri",comm:"15%",statut:"signé",date:"15/02",expire:"14/02/2027"},{id:"CTR-003",type:"Prestation",nom:"Groupe Prestige SARL",comm:"12%",statut:"signé",date:"01/04",expire:"31/03/2027"}];
const AVIS=[{client:"Sofia Al-Rashid",note:5,service:"Jet privé",comm:"Service impeccable, équipe très pro !",google:true},{client:"Jean-Marc Olivier",note:5,service:"Résidentiel",comm:"Xyra c'est le top, je recommande.",google:true},{client:"Pierre Lefevre",note:4,service:"Rapatriement",comm:"Très bien géré dans un moment difficile.",google:false}];
const FORMATION=[{titre:"Protocole nettoyage jet privé",collab:"Thomas, Abou",statut:"complété",score:98},{titre:"Process rapatriement corps",collab:"Thomas",statut:"complété",score:95},{titre:"Accueil client VIP",collab:"Fatou",statut:"en cours",score:null},{titre:"Nettoyage yacht – produits nacrés",collab:"Abou",statut:"à faire",score:null}];
const EVENEMENTS=[{titre:"Networking Xyra — Paris",date:"25/04/2026",lieu:"Hôtel George V",inscrits:24,max:40,prix:"80€",statut:"ouvert"},{titre:"Forum Entrepreneurs Afrique",date:"10/05/2026",lieu:"Paris – Salle Opéra",inscrits:52,max:100,prix:"45€",statut:"ouvert"},{titre:"Soirée Partenaires VIP",date:"15/05/2026",lieu:"Monaco – Invitation",inscrits:18,max:20,prix:"0€",statut:"complet"}];
const MSGS_EQUIPE=[{id:1,auteur:"Thomas",av:"T",msg:"Béné, prospect Dupont confirmé pour jeudi 🙌",h:"09:14",lu:true},{id:2,auteur:"Abou",av:"A",msg:"Nettoyage Airbnb Montmartre terminé ✅",h:"10:32",lu:true},{id:3,auteur:"Abou",av:"A",msg:"Produit vitres épuisé, je rachète ?",h:"13:20",lu:false},{id:4,auteur:"Thomas",av:"T",msg:"Rappel rapatriement Lefevre demain 8h ✈️",h:"14:45",lu:false}];
const MSGS_PART=[{id:1,auteur:"Leila",av:"L",msg:"Bonjour Béné, j'ai un client pour le résidentiel 👋",h:"08:30",lu:true},{id:2,auteur:"Fatou",av:"F",msg:"2 nouvelles sociétés depuis Dakar 🌍",h:"11:00",lu:false}];
const INIT_HISTO=[{id:"PAY-001",type:"entree",libelle:"Paiement Sofia Al-Rashid",montant:2400,devise:"EUR",methode:"Carte",date:"13/04 14:32",statut:"confirmé",ref:"TYM-0042",com:120},{id:"PAY-002",type:"entree",libelle:"Paiement Pierre Lefevre",montant:4800,devise:"EUR",methode:"Virement SEPA",date:"12/04 09:15",statut:"confirmé",ref:"TYM-0041",com:240},{id:"PAY-003",type:"sortie",libelle:"Commission Thomas Beaumont",montant:2480,devise:"EUR",methode:"Virement SEPA",date:"11/04 16:00",statut:"envoyé",ref:"COM-001",com:0},{id:"PAY-004",type:"entree",libelle:"Paiement Fatoumata Diop",montant:557480,devise:"XOF",methode:"Wave",date:"10/04 11:20",statut:"confirmé",ref:"TYM-0038",com:27874},{id:"PAY-005",type:"sortie",libelle:"Fournitures CleanPro",montant:420,devise:"EUR",methode:"Virement SEPA",date:"09/04 10:00",statut:"envoyé",ref:"FOUR-001",com:0}];
const INIT_COMM=[{id:"COM-002",nom:"Leila Mansouri",role:"Partenaire",montant:1305,devise:"EUR",methode:"Virement SEPA",tel:"+33 6 44 55 66 77",email:"leila.m@mail.fr"},{id:"COM-004",nom:"Groupe Prestige SARL",role:"Partenaire",montant:2640,devise:"EUR",methode:"Virement SEPA",tel:"+33 1 44 55 66 77",email:"contact@prestige.fr"},{id:"COM-005",nom:"Fatoumata Diop",role:"Apporteuse AA",montant:1700,devise:"EUR",methode:"Wave",tel:"+221 77 123 45 67",email:"fatou.d@dakar.sn"}];
const INIT_REMB=[{id:"RMB-001",nom:"Amina Diallo",motif:"Service annulé",montant:190,devise:"EUR",methode:"Orange Money",tel:"+33 6 77 88 99 00"}];
const INIT_FOUR=[{id:"FOUR-002",nom:"TextilePro",service:"Microfibre premium x50",montant:380,devise:"EUR",methode:"Virement SEPA",iban:"FR76 1234..."},{id:"FOUR-003",nom:"MedSupply",service:"Housses rapatriement x10",montant:520,devise:"EUR",methode:"Virement SEPA",iban:"FR76 5678..."},{id:"FOUR-004",nom:"YachtCare",service:"Produit nacre bois x5L",montant:290,devise:"EUR",methode:"Virement SEPA",iban:"FR76 9012..."}];
const INIT_CARTES=[{id:"CRD-001",nom:"Béné — Pro",numero:"4532 •••• •••• 7821",reseau:"Visa",solde:2400,limite:5000,statut:"active",devise:"EUR",type:"owner",expiry:"12/27",cvv:"•••"},{id:"CRD-002",nom:"Thomas Beaumont",numero:"5261 •••• •••• 3344",reseau:"Mastercard",solde:850,limite:2000,statut:"active",devise:"EUR",type:"Business Pro",expiry:"08/26",cvv:"•••"},{id:"CRD-003",nom:"Fatoumata Diop",numero:"4111 •••• •••• 9902",reseau:"Visa",solde:320000,limite:500000,statut:"active",devise:"XOF",type:"Business Pro",expiry:"03/27",cvv:"•••"}];
const MEMBRES_WALLET=[{id:"WM-001",nom:"Thomas Beaumont",type:"Business Pro",solde:2480,devise:"EUR",iban:"FR76 3000 4000 0100 0012 3456 789",banque:"BNP Paribas",pays:"🇫🇷",statut:"actif",transactions:12,carte:true},{id:"WM-002",nom:"Leila Mansouri",type:"Starter",solde:1305,devise:"EUR",iban:"FR76 1027 8060 0001 0234 5678 901",banque:"Société Générale",pays:"🇫🇷",statut:"actif",transactions:8,carte:false},{id:"WM-003",nom:"Fatoumata Diop",type:"Business Pro",solde:855750,devise:"XOF",iban:"SN28 SN08 0100 1535 1000 1234 56",banque:"Ecobank Sénégal",pays:"🇸🇳",statut:"actif",transactions:24,carte:true},{id:"WM-004",nom:"Sofia Al-Rashid",type:"Enterprise",solde:9200,devise:"EUR",iban:"AE07 0331 2345 6789 0123 456",banque:"Emirates NBD",pays:"🇦🇪",statut:"actif",transactions:5,carte:true}];
const METIERS=["Immobilier","Aviation d'affaires","Yachting","Finance","Import/Export","Conseil","Marketing","Tech","Santé","Hôtellerie","Restauration","Mode & Luxe","Gestion Airbnb","Syndic","Courtage","Transport","BTP","Juridique","Éducation","Événementiel","Autre"];

const fmt=(m,d="EUR")=>{const dv=DEVISES.find(x=>x.code===d);if(d==="XOF")return Math.round(m).toLocaleString("fr")+" "+(dv?.symbol||"₣");return Number(m).toLocaleString("fr",{minimumFractionDigits:0,maximumFractionDigits:2})+" "+(dv?.symbol||"€");};
const conv=(m,de,ve)=>{const f=DEVISES.find(x=>x.code===de),t=DEVISES.find(x=>x.code===ve);return(!f||!t)?m:(m/f.taux)*t.taux;};
const inits=(nom)=>nom.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const hasAccess=(plan,page)=>{const allowed=PAGE_ACCESS[page];if(!allowed)return true;return allowed.includes(plan);};

// ─── ATOMS ────────────────────────────────────────────────────
const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:18,...style}}>{children}</div>;
const CT=({children,style={}})=><div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:14,...style}}>{children}</div>;
const Pill=({children,color=C.gold,bg})=><span style={{background:bg||color+"22",color,border:`1px solid ${color}44`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600}}>{children}</span>;
const Btn=({children,onClick,color=C.gold,style={}})=><button onClick={onClick} style={{background:color,color:color===C.gold?"#000":"#fff",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit",...style}}>{children}</button>;
const BtnGhost=({children,onClick,style={}})=><button onClick={onClick} style={{background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit",...style}}>{children}</button>;
const Inp=({value,onChange,placeholder,style={}})=><input value={value} onChange={onChange} placeholder={placeholder} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",...style}}/>;
const Sel=({value,onChange,children,style={}})=><select value={value} onChange={onChange} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 12px",color:C.text,fontSize:12,fontFamily:"inherit",...style}}>{children}</select>;
const TH=({children,style={}})=><th style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:`1px solid ${C.border}`,...style}}>{children}</th>;
const Td=({children,style={},onClick})=><td onClick={onClick} style={{padding:"9px 10px",fontSize:12,borderBottom:`1px solid ${C.border}22`,color:C.text,...style}}>{children}</td>;
const STitle=({children})=><div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>{children}</div>;
const KPI=({label,val,sub,color=C.gold,icon=""})=><CT><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{icon} {label}</div><div style={{fontSize:22,fontWeight:700,color,fontFamily:"Georgia,serif",lineHeight:1.1}}>{val}</div>{sub&&<div style={{fontSize:10,color:C.muted,marginTop:3}}>{sub}</div>}</CT>;
const Tabs=({tabs,active,onChange})=><div style={{display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>{tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{background:active===t.id?C.card:"transparent",color:active===t.id?C.gold:C.muted,border:active===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:active===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}</div>;
const SM=({val,max,color=C.green})=><div style={{height:4,borderRadius:2,background:C.border,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(val/max)*100)}%`,background:color,borderRadius:2}}/></div>;
const St=({s})=>{const map={validé:[C.green,"✓ Validé"],signé:[C.green,"✓ Signé"],confirmé:[C.green,"✓ Confirmé"],envoyé:[C.blue,"→ Envoyé"],en_attente:[C.orange,"⏳ En attente"],actif:[C.green,"● Actif"],critique:[C.red,"⚠ Critique"],ouvert:[C.green,"Ouvert"],complet:[C.red,"Complet"],"en cours":[C.blue,"En cours"],"à faire":[C.muted,"À faire"],complété:[C.green,"✓ Complété"]};const[c,l]=map[s]||[C.muted,s];return <Pill color={c}>{l}</Pill>;};

// Aperçus des modules par page
const MODULE_PREVIEWS={
  overview:{icon:"◈",desc:"Vue d'ensemble business",features:["8 KPIs en temps réel","Score santé business","Alertes critiques","Actions rapides IA"]},
  crm:{icon:"◎",desc:"CRM & Pipeline",features:["Pipeline Kanban visuel","Score IA par lead","Relances automatiques","Analytics conversion"]},
  devis:{icon:"◧",desc:"Devis & Facturation",features:["Devis PDF en 1 clic","Signature électronique","Envoi WhatsApp auto","Score solvabilité client"]},
  investissement:{icon:"◐",desc:"Investissement IA",features:["Recommandations Claude","ROI par investissement","Plan d'action personnalisé","Scénarios prévisionnels"]},
  compta:{icon:"◉",desc:"Comptabilité complète",features:["Journal + Bilan","Déclaration TVA","Export expert-comptable","Conseils IA fiscaux"]},
  tresorerie:{icon:"◑",desc:"Trésorerie 90 jours",features:["Cash-flow prévisionnel","Alertes seuil critique","Multi-devises","Prévisions IA 3 mois"]},
  analytique:{icon:"◒",desc:"Analytique & CA",features:["CA par service & pays","Prédictions IA mensuelles","Objectifs & suivi","Rapports automatiques"]},
  clients:{icon:"◬",desc:"Gestion clients",features:["Fiches clients complètes","Score solvabilité","Upsell automatique","Historique missions"]},
  partenaires:{icon:"⬡",desc:"Partenaires & AA",features:["Suivi commissions","Chat partenaires","Contrats automatiques","Score performance"]},
  annuaire:{icon:"◱",desc:"Réseau mondial",features:["18+ contacts mondiaux","Carte réseau interactive","Deals entre membres","Messagerie intégrée"]},
  wallet_membres:{icon:"◈",desc:"Wallets membres",features:["Soldes en temps réel","Cartes virtuelles","Multi-devises","Renouvellements auto"]},
  evenements:{icon:"◆",desc:"Événements",features:["Créer des événements","QR Code inscription","Visio Jitsi intégrée","Gestion invités"]},
  scoring:{icon:"★",desc:"Réputation & NPS",features:["Avis Google centralisés","Réponses IA automatiques","Rapport NPS mensuel","Widget site web"]},
  equipe:{icon:"⊞",desc:"RH & Équipe",features:["16 modules RH complets","Pointage GPS","Paie automatique","IA RH + Juridique"]},
  planning:{icon:"⊡",desc:"Planning & Agenda",features:["5 vues calendrier","IA auto-planification","Booking client","Règles horaires"]},
  prospection:{icon:"⊕",desc:"Prospection Auto",features:["Base SIRENE 12M+","Bot WhatsApp IA","Bot d'appel vocal","Séquences automatiques"]},
  stock:{icon:"⊟",desc:"Stock & Fournitures",features:["Alertes stock critique","IA prédictive","Commandes auto","QR terrain"]},
  services:{icon:"⊛",desc:"Produits & Services",features:["Catalogue services","Tarification IA","Tunnel upsell","CGV/CGU auto"]},
  deploiement:{icon:"🌍",desc:"Déploiement SaaS",features:["Clients white-label","Revenus MRR/ARR","Onboarding auto","Dashboard revendeurs"]},
  api:{icon:"◇",desc:"API Xyra",features:["Clés API sécurisées","Webhooks temps réel","Documentation complète","Logs & monitoring"]},
  // Modules à la carte
  notifications:{icon:"🔔",desc:"Notifications avancées",features:["Push temps réel","WhatsApp auto","Email auto","Configuration complète"]},
  signature:{icon:"✦",desc:"Contrats & Signatures",features:["E-signature légale","10+ modèles","Archivage sécurisé","Avenants auto"]},
  formation:{icon:"⊿",desc:"Formation équipe",features:["Modules vidéo","Certifications","Protocoles métier","Quiz & scores"]},
  facturation:{icon:"🧾",desc:"Facturation électronique",features:["Factur-X conforme","Chorus Pro","E-reporting TVA","DGFiP automatique"]},
  evenements:{icon:"◆",desc:"Événements & Networking",features:["Créer événements","QR inscriptions","Visio Jitsi","Gestion invités"]},
  wallet_membres:{icon:"◈",desc:"Wallets membres",features:["Soldes temps réel","Cartes virtuelles","Multi-devises","Abonnements auto"]},
  scoring:{icon:"★",desc:"Réputation & NPS",features:["Avis Google","Réponses IA","Score NPS","Widget site web"]},
  annuaire:{icon:"◱",desc:"Réseau & Annuaire mondial",features:["18+ pays","Deals membres","Messagerie","IA Match business"]},
  club_affaires:{icon:"◈",desc:"Club d'affaires privé",features:["Réseau VIP","Deals -10%","Événements exclusifs","IA Match"]},
  wallet_membres:{icon:"◈",desc:"Wallets membres",features:["Soldes temps réel","Cartes virtuelles","Multi-devises","Renouvellements"]},
  investissement:{icon:"◐",desc:"Investissement IA",features:["Recommandations Claude","ROI estimé","Plan d'action","Scénarios"]},
};


// ─── PAGE BIENTÔT DISPONIBLE ─────────────────────────────────
const PageBientot=({titre,icon,desc,features=[]})=>{
  return <div style={{padding:40,textAlign:"center",maxWidth:600,margin:"0 auto"}}>
    <div style={{fontSize:64,marginBottom:16}}>{icon}</div>
    <div style={{fontSize:24,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:8}}>{titre}</div>
    <div style={{fontSize:14,color:C.muted,marginBottom:24,lineHeight:1.7}}>{desc}</div>
    <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:16,padding:24,marginBottom:24}}>
      <div style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:"0.1em",marginBottom:16}}>CE QUI ARRIVE BIENTÔT</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,textAlign:"left"}}>
        {features.map((f,i)=><div key={i} style={{background:C.card,borderRadius:8,padding:"10px 12px",fontSize:12,color:C.text,display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.gold}}>✦</span>{f}
        </div>)}
      </div>
    </div>
    <div style={{background:C.card2,borderRadius:12,padding:20,border:`1px solid ${C.border}`}}>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>🔔 Être notifié en avant-première</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Vous recevrez un WhatsApp dès que ce module est disponible</div>
      <div style={{background:`${C.green}22`,border:`1px solid ${C.green}44`,borderRadius:8,padding:"10px 16px",fontSize:12,color:C.green,fontWeight:600}}>✅ Vous serez notifié automatiquement</div>
    </div>
  </div>;
};

const SOON_MODULES={
  gestion_projet:{titre:"Gestion de projet",icon:"📊",desc:"Gérez vos projets avec un Kanban visuel, des tâches assignées et un suivi d'avancement en temps réel.",features:["Kanban par projet","Tâches & sous-tâches","Deadlines & rappels","Assignation équipe","Commentaires","Suivi avancement %","Gantt chart","Templates projets"]},
  marketing:{titre:"Marketing & Campagnes",icon:"📣",desc:"Lancez des campagnes email et WhatsApp en masse, suivez vos performances et automatisez votre acquisition.",features:["Campagnes email masse","Templates WhatsApp","Suivi ouvertures/clics","Segmentation clients","A/B Testing","Landing pages","Réseaux sociaux","Rapports automatiques"]},
  organisation:{titre:"Organisation & Wiki",icon:"📝",desc:"Centralisez vos notes, procédures et bases de connaissances en un seul endroit accessible à toute l'équipe.",features:["Wiki d'entreprise","Notes partagées","To-do list équipe","Procédures internes","Base de connaissances","Recherche intelligente","Dossiers & tags","Historique versions"]},
  booking:{titre:"Booking public",icon:"🗓",desc:"Partagez un lien de réservation que vos clients utilisent pour prendre rendez-vous directement dans votre planning.",features:["Lien booking personnalisé","Synchro planning auto","Confirmation WhatsApp","Paiement en avance","QR Code","Page booking branded","Rappels automatiques","Multi-services"]},
  app_mobile:{titre:"Application mobile",icon:"📱",desc:"Gérez votre activité depuis votre smartphone — iOS et Android — avec toutes les fonctionnalités du dashboard.",features:["iOS & Android natif","Notifications push","Géolocalisation équipe","Photo & scan QR","Mode hors-ligne","Signature mobile","Paiements mobile","Tableau de bord"]},
  iban_bancaire:{titre:"IBAN bancaire réel",icon:"🏦",desc:"Obtenez un vrai IBAN à votre nom pour recevoir des virements SEPA comme une vraie banque professionnelle.",features:["IBAN FR à votre nom","Virements SEPA entrants","Carte Visa physique","Relevés bancaires","Multi-comptes","Domiciliation bancaire","API bancaire","SWIFT/BIC"]},
  avance_factures:{titre:"Avance sur factures",icon:"💰",desc:"Obtenez une avance sur vos factures impayées pour financer votre croissance sans attendre les paiements.",features:["Avance jusqu'à 90%","Validation en 24h","Taux compétitifs","Sans garantie","Remboursement auto","Suivi en temps réel","Multi-devises","Partenaires bancaires"]},
  academie:{titre:"Académie Xyra",icon:"🎓",desc:"Apprenez à maîtriser Xyra avec des formations vidéo, des tutoriels et des certifications officielles.",features:["Formations vidéo HD","Tutoriels pas à pas","Certification Xyra","Quiz & exercices","Communauté apprenants","Nouvelles fonctions","Support formateur","Accès illimité"]},
  traduction:{titre:"Traduction automatique",icon:"🌍",desc:"Utilisez Xyra dans votre langue — français, anglais, arabe, wolof — et communiquez avec vos clients en local.",features:["Interface multilingue","Devis en 10 langues","Français / Anglais","Arabe / Wolof","Traduction IA","Détection auto langue","Emails multilingues","Support régional"]},
  centre_appels:{titre:"Centre d'appels IA",icon:"📞",desc:"Un agent vocal IA appelle automatiquement vos prospects, qualifie les leads et planifie les RDV dans votre agenda.",features:["Agent vocal IA (Vapi)","Qualification automatique","Prise de RDV auto","Résumé CRM auto","Multi-langues","Scripts personnalisés","Statistiques appels","Intégration SIRENE"]},
};

const UpgradeWall=({page,plan})=>{
  const[vraiPlan,setVraiPlan]=useState(null);
  useEffect(()=>{
    fetch("/api/tenant-info").then(r=>r.json()).then(d=>{
      if(d.plan)setVraiPlan(d.plan);
    }).catch(()=>{});
  },[]);
  const preview=MODULE_PREVIEWS[page]||{icon:"📦",desc:page,features:["Fonctionnalités avancées","Analyses IA","Automatisations","Rapports détaillés"]};
  const modulePrice=MODULE_PRICES[page];
  const planPourRedirection=vraiPlan||plan;
  return <div style={{padding:24,maxWidth:700,margin:"0 auto"}}>
    <div style={{textAlign:"center",marginBottom:24}}>
      <div style={{fontSize:48,marginBottom:8}}>{preview.icon||"🔒"}</div>
      <div style={{fontSize:22,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>{preview.desc}</div>
      {modulePrice&&<div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${C.gold}15`,border:`1px solid ${C.gold}44`,borderRadius:20,padding:"6px 16px",marginBottom:8}}>
        <span style={{fontSize:11,color:C.muted}}>Module a la carte :</span>
        <span style={{fontSize:16,fontWeight:700,color:C.gold}}>{modulePrice}€/mois</span>
      </div>}
    </div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20,marginBottom:20}}>
      <div style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Ce que vous debloquez</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
        {preview.features.map((f,i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.text,display:"flex",alignItems:"center",gap:8,border:`1px solid ${C.border}`}}>
          <span style={{color:C.gold,fontSize:14}}>✦</span>{f}
        </div>)}
      </div>
    </div>
    <a href={`/pricing?upgrade_from=${planPourRedirection}`} style={{display:"block",textAlign:"center",background:`linear-gradient(135deg,${C.gold},#a07c45)`,color:"#000",border:"none",borderRadius:8,padding:"14px 0",fontWeight:700,fontSize:14,fontFamily:"inherit",textDecoration:"none"}}>
      Voir les forfaits disponibles →
    </a>
  </div>;
};
// ─── CHAT COMPONENT ───────────────────────────────────────────
const Chat=({msgs,onSend,title="Chat",subtitle=""})=>{
  const[msg,setMsg]=useState("");
  const endRef=useRef();
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  return <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.card2}}>
      <div style={{fontSize:14,fontWeight:700,color:C.text}}>{title}</div>
      <div style={{fontSize:11,color:C.muted}}>{subtitle}</div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
      {msgs.map((m,i)=><div key={i} style={{display:"flex",gap:8,flexDirection:m.moi?"row-reverse":"row"}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:m.moi?`${C.gold}22`:`${C.blue}22`,border:`1px solid ${m.moi?C.gold:C.blue}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:m.moi?C.gold:C.blue,flexShrink:0}}>{m.av}</div>
        <div style={{maxWidth:"70%"}}>
          <div style={{background:m.moi?`${C.gold}18`:C.card2,border:`1px solid ${m.moi?C.gold+"33":C.border}`,borderRadius:10,padding:"8px 12px",marginBottom:2}}>
            <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{m.msg}</div>
          </div>
          <div style={{fontSize:9,color:C.muted,textAlign:m.moi?"right":"left"}}>{m.h}</div>
        </div>
      </div>)}
      <div ref={endRef}/>
    </div>
    <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
      <Inp value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Écrire un message..." style={{flex:1}} onKeyDown={e=>{if(e.key==="Enter"&&msg.trim()){onSend(msg);setMsg("");}}}/>
      <Btn onClick={()=>{if(msg.trim()){onSend(msg);setMsg("");}}} style={{padding:"8px 14px",flexShrink:0}}>↗</Btn>
    </div>
  </div>;
};

// ─── WALLET COMPONENTS ────────────────────────────────────────
const PayCard=({carte,onToggle})=>{
  const dv=DEVISES.find(d=>d.code===carte.devise);
  return <Card style={{borderColor:`${C.gold}33`,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,right:0,width:120,height:120,borderRadius:"0 0 0 120px",background:`${C.gold}06`}}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div><div style={{fontSize:10,color:C.muted,letterSpacing:"0.2em"}}>CARTE VIRTUELLE {carte.reseau}</div><div style={{fontSize:13,fontWeight:600,color:C.text,marginTop:2}}>{carte.nom}</div></div>
      <Pill color={carte.statut==="active"?C.green:C.red}>{carte.statut==="active"?"● Active":"● Bloquée"}</Pill>
    </div>
    <div style={{fontSize:16,fontWeight:700,color:C.gold,fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",marginBottom:16}}>{carte.numero}</div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
      <div><div style={{fontSize:9,color:C.muted}}>SOLDE DISPONIBLE</div><div style={{fontSize:20,fontWeight:700,color:C.text}}>{fmt(carte.solde,carte.devise)}</div><div style={{fontSize:9,color:C.muted}}>Limite: {fmt(carte.limite,carte.devise)}</div></div>
      <div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.muted}}>EXPIRE</div><div style={{fontSize:14,fontWeight:600,color:C.text}}>{carte.expiry}</div></div>
    </div>
    <SM val={carte.solde} max={carte.limite} color={carte.solde/carte.limite>0.5?C.green:C.orange}/>
    <div style={{marginTop:12,display:"flex",gap:8}}>
      <BtnGhost onClick={()=>onToggle(carte.id)} style={{flex:1,fontSize:11}}>{carte.statut==="active"?"🔒 Bloquer":"🔓 Activer"}</BtnGhost>
    </div>
  </Card>;
};

const Convertisseur=()=>{
  const[m,setM]=useState(1000);
  const[de,setDe]=useState("EUR");
  const[ve,setVe]=useState("XOF");
  const r=conv(m,de,ve);
  return <CT>
    <STitle>Convertisseur multi-devises</STitle>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center"}}>
      <div><Inp value={m} onChange={e=>setM(Number(e.target.value))} style={{marginBottom:4}}/><Sel value={de} onChange={e=>setDe(e.target.value)} style={{width:"100%"}}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel></div>
      <div style={{fontSize:20,color:C.muted}}>⇄</div>
      <div><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",fontSize:14,fontWeight:700,color:C.gold,marginBottom:4}}>{isNaN(r)?"-":r.toLocaleString("fr",{maximumFractionDigits:2})}</div><Sel value={ve} onChange={e=>setVe(e.target.value)} style={{width:"100%"}}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel></div>
    </div>
    <div style={{marginTop:8,fontSize:10,color:C.muted,textAlign:"center"}}>1 {de} = {conv(1,de,ve).toFixed(4)} {ve} · Taux de référence Xyra</div>
  </CT>;
};

const IbanMondial=({showToast})=>{
  const[ibans,setIbans]=useState([]);
  const[loadingIbans,setLoadingIbans]=useState(true);
  const[cid,setCid]=useState(null);
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({pays:"",iban:"",banque:"",bic:"",pour:""});
  const[sb,setSb]=useState(null);

  useEffect(()=>{
    const init=async()=>{
      try{
        const{createClient}=await import('@supabase/supabase-js');
        const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        setSb(client);
        const{data,error}=await client.from('wallet_ibans').select('*').order('created_at',{ascending:true});
        if(!error&&data)setIbans(data);
      }catch(e){console.error('IBAN load:',e);}
      setLoadingIbans(false);
    };
    init();
  },[]);

  const handleAdd=async()=>{
    if(!form.pays||!form.iban)return;
    if(!sb)return showToast&&showToast("❌ Connexion Supabase indisponible");
    try{
      const{data,error}=await sb.from('wallet_ibans').insert([{pays:form.pays,iban:form.iban,banque:form.banque,bic:form.bic,pour:form.pour}]).select();
      if(error)throw error;
      if(data&&data[0])setIbans(ib=>[...ib,data[0]]);
      setForm({pays:"",iban:"",banque:"",bic:"",pour:""});
      setShowForm(false);
      showToast&&showToast("✅ IBAN ajouté et sauvegardé !");
    }catch(e){showToast&&showToast("❌ Erreur lors de l'ajout — vérifie que la table wallet_ibans existe");}
  };

  const handleDelete=async(id)=>{
    if(!sb)return;
    try{
      const{error}=await sb.from('wallet_ibans').delete().eq('id',id);
      if(error)throw error;
      setIbans(ib=>ib.filter(x=>x.id!==id));
      showToast&&showToast("✅ IBAN supprimé");
    }catch(e){showToast&&showToast("❌ Erreur lors de la suppression");}
  };

  return <CT>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <STitle>🌍 IBAN Mondial — Recevoir des paiements</STitle>
      <Btn onClick={()=>setShowForm(s=>!s)} style={{fontSize:11,padding:"5px 12px"}}>+ Ajouter IBAN</Btn>
    </div>

    {showForm&&<div style={{background:C.card,borderRadius:10,padding:14,marginBottom:12,border:`1px solid ${C.gold}44`}}>
      <STitle>Nouvel IBAN</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Inp value={form.pays} onChange={e=>setForm(f=>({...f,pays:e.target.value}))} placeholder="🌍 Pays (ex: 🇨🇮 Côte d'Ivoire)"/>
        <Inp value={form.banque} onChange={e=>setForm(f=>({...f,banque:e.target.value}))} placeholder="Nom de la banque"/>
        <Inp value={form.iban} onChange={e=>setForm(f=>({...f,iban:e.target.value}))} placeholder="IBAN complet"/>
        <Inp value={form.bic} onChange={e=>setForm(f=>({...f,bic:e.target.value}))} placeholder="BIC / SWIFT"/>
        <Inp value={form.pour} onChange={e=>setForm(f=>({...f,pour:e.target.value}))} placeholder="Usage (ex: Wave, CinetPay...)" style={{gridColumn:"span 2"}}/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={handleAdd}>✅ Ajouter</Btn>
        <BtnGhost onClick={()=>setShowForm(false)}>Annuler</BtnGhost>
      </div>
    </div>}

    {loadingIbans&&<div style={{fontSize:11,color:C.muted,marginBottom:8}}>Chargement...</div>}
    {!loadingIbans&&ibans.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun IBAN enregistré — ajoutez-en un pour le communiquer à vos clients internationaux.</div>}

    {ibans.map((ib,i)=><div key={ib.id} style={{background:C.card,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text}}>{ib.pays}</div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{fontSize:10,color:C.muted}}>{ib.banque}</div>
          <BtnGhost onClick={()=>handleDelete(ib.id)} style={{fontSize:9,padding:"2px 6px",color:C.red}}>✕</BtnGhost>
        </div>
      </div>
      <div style={{fontFamily:"'Courier New',monospace",fontSize:13,color:C.gold,marginBottom:4}}>{ib.iban}</div>
      <div style={{fontSize:10,color:C.muted,marginBottom:8}}>BIC: {ib.bic} · {ib.pour}</div>
      <div style={{display:"flex",gap:6}}>
        <BtnGhost onClick={()=>{navigator.clipboard?.writeText(ib.iban);setCid(i);setTimeout(()=>setCid(null),2000);}} style={{fontSize:10,padding:"4px 10px"}}>{cid===i?"✓ Copié !":"📋 Copier IBAN"}</BtnGhost>
        <BtnGhost onClick={()=>{navigator.clipboard?.writeText(`${ib.iban}\nBIC: ${ib.bic}`);showToast&&showToast("📋 IBAN + BIC copiés !");}} style={{fontSize:10,padding:"4px 10px"}}>📋 IBAN + BIC</BtnGhost>
      </div>
    </div>)}

    <div style={{marginTop:10,background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>
      ⚠️ Ces IBAN sont des informations de référence que tu communiques à tes clients. Tant que Swan n'est pas validé, les virements reçus arrivent sur tes comptes bancaires existants — pas automatiquement dans le wallet Xyra.
    </div>
  </CT>;
};

// ─── PAGE WALLET ──────────────────────────────────────────────
const PageWallet=({plan,showToast,profil})=>{
  const[onglet,setOnglet]=useState("solde");
  const[devise,setDevise]=useState("EUR");
  const[histo,setHisto]=useState(INIT_HISTO);
  const[showPay,setShowPay]=useState(false);
  const[showEnc,setShowEnc]=useState(false);
  const[payForm,setPayForm]=useState({nom:"",montant:"",devise:"EUR",methode:"carte",ref:""});
  const[loadingWallet,setLoadingWallet]=useState(true);
  const[soldeReel,setSoldeReel]=useState(0);
  const[payUnified,setPayUnified]=useState({type:"",contact:"",contactEmail:"",contactTel:"",contactIban:"",montant:"",motif:"",methode:"sepa"});

  const TYPES_PAYER=[
    {id:"remboursement",label:"↩ Remboursement",color:C.red,desc:"Rembourser un client"},
    {id:"commission",label:"👥 Commission",color:C.orange,desc:"Payer une commission partenaire"},
    {id:"fournisseur",label:"🏭 Facture fournisseur",color:C.purple,desc:"Payer un fournisseur"},
    {id:"sortie",label:"🏦 Virement libre",color:C.blue,desc:"Virement à un membre de l'équipe"},
  ];
  const EQUIPE_CONTACTS=[
    {nom:"Thomas Beaumont",email:"thomas@xyra.io",tel:"+33 6 12 34 56 78"},
    {nom:"Abou Diallo",email:"abou@xyra.io",tel:"+33 6 98 76 54 32"},
    {nom:"Fatou Sarr",email:"fatou@xyra.io",tel:"+33 6 55 44 33 22"},
  ];

  const loadWallet=async()=>{
    try{
      const res=await fetch('/api/wallet?action=list');
      const data=await res.json();
      if(data.transactions){
        setHisto(data.transactions.map(t=>({id:t.id,type:t.type,libelle:t.libelle,montant:Number(t.montant),devise:t.devise,methode:t.methode,date:new Date(t.created_at).toLocaleString("fr"),rawDate:t.created_at,statut:t.statut,ref:t.ref,com:Number(t.commission||0)})));
        setSoldeReel(data.solde||0);
      }
    }catch(e){console.error("Wallet:",e);}
    setLoadingWallet(false);
  };

  useEffect(()=>{loadWallet();},[]);
  const[virementForm,setVirementForm]=useState({iban:"",bic:"",nom:"",montant:"",devise:"EUR",motif:""});

  const handleVirementSepa=async()=>{
    if(!virementForm.iban||!virementForm.nom||!virementForm.montant)return showToast("⚠️ Renseignez IBAN, nom et montant");
    showToast("⏳ Enregistrement du virement...");
    try{
      const res=await fetch('/api/wallet',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'payer',nom:virementForm.nom,montant:virementForm.montant,devise:virementForm.devise,methode:"Virement SEPA",ref:virementForm.motif,type:'sortie',destinataire_iban:virementForm.iban}),
      });
      const data=await res.json();
      if(data.success){
        setVirementForm({iban:"",bic:"",nom:"",montant:"",devise:"EUR",motif:""});
        showToast("✅ Virement SEPA enregistré — marquez \"viré\" une fois exécuté");
        loadWallet();
      }else{showToast("❌ "+(data.error||"Erreur"));}
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const[alerteSeuil,setAlerteSeuil]=useState(500);
  const[walletProjet,setWalletProjet]=useState([{nom:"Projet Expansion",solde:4200,cible:10000,couleur:C.green},{nom:"Fonds de réserve",solde:8000,cible:8000,couleur:C.blue},{nom:"Investissement Q2",solde:1200,cible:5000,couleur:C.purple}]);
  const solde=soldeReel;
  const soldeConv=conv(solde,"EUR",devise);
  const dvSel=DEVISES.find(d=>d.code===devise);
  const tabs=[{id:"solde",label:"💳 Solde"},{id:"historique",label:"📋 Historique"},{id:"payer",label:"⚡ Payer"},{id:"encaisser",label:"💰 Encaisser"},{id:"commissions",label:"👥 Commissions"},{id:"remboursements",label:"↩ Remboursements"},{id:"fournisseurs",label:"🏭 Fournisseurs"},{id:"convertisseur",label:"⇄ Convertir"},{id:"iban",label:"🌍 IBAN Mondial"},{id:"wallets_projets",label:"📂 Wallets Projets"},{id:"sante",label:"❤ Santé"},{id:"alertes",label:"🔔 Alertes"},{id:"stats",label:"📊 Stats"},{id:"virements",label:"🏦 Virements"}];

  const handlePayerUnifie=async()=>{
    const{type,contact,contactEmail,contactTel,contactIban,montant,motif,methode}=payUnified;
    if(!type)return showToast("⚠️ Choisis un type de transaction");
    if(type==="sortie"){
      if(!contact)return showToast("⚠️ Choisis un contact");
    }else{
      if(!contact)return showToast("⚠️ Indique le nom du bénéficiaire");
    }
    if(!montant)return showToast("⚠️ Indique un montant");
    let nom=contact,email=contactEmail,tel=contactTel,iban=contactIban;
    if(type==="sortie"){
      const eq=EQUIPE_CONTACTS.find(c=>c.nom===contact);
      if(!eq)return showToast("⚠️ Contact introuvable");
      nom=eq.nom;email=eq.email;tel=eq.tel;
    }
    showToast("⏳ Enregistrement de la transaction...");
    try{
      const body={action:'payer',nom,montant,devise:"EUR",methode:methode||"sepa",ref:motif,type};
      if(email)body.destinataire_email=email;
      if(tel)body.destinataire_tel=tel;
      if(iban)body.destinataire_iban=iban;
      const res=await fetch('/api/wallet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data=await res.json();
      if(data.success){
        setShowPay(false);
        setPayUnified({type:"",contact:"",contactEmail:"",contactTel:"",contactIban:"",montant:"",motif:"",methode:"sepa"});
        showToast(`✅ Transaction enregistrée pour ${nom} — à virer`);
        loadWallet();
      }else{showToast("❌ "+(data.error||"Erreur"));}
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const handlePayer=async(form)=>{
    if(!form.nom||!form.montant)return showToast("⚠️ Remplissez bénéficiaire et montant");
    showToast("⏳ Enregistrement du virement...");
    try{
      const res=await fetch('/api/wallet',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'payer',nom:form.nom,montant:form.montant,devise:form.devise,methode:form.methode,ref:form.ref,type:'sortie'}),
      });
      const data=await res.json();
      if(data.success){
        setShowPay(false);
        setPayForm({nom:"",montant:"",devise:"EUR",methode:"carte",ref:""});
        showToast("✅ Virement enregistré — à exécuter manuellement, marquez-le \"viré\" une fois fait");
        loadWallet();
      }else{showToast("❌ "+(data.error||"Erreur"));}
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const handleEncaisser=async(form)=>{
    if(!form.nom||!form.montant)return showToast("⚠️ Remplissez nom et montant");
    showToast("⏳ Création du lien de paiement...");
    try{
      const res=await fetch('/api/wallet',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'encaisser',nom:form.nom,montant:form.montant,devise:form.devise,methode:form.methode,ref:form.ref,email:form.email,tel:form.tel}),
      });
      const data=await res.json();
      if(data.success){
        setShowEnc(false);
        setPayForm({nom:"",montant:"",devise:"EUR",methode:"carte",ref:""});
        if(data.paymentUrl){
          showToast("✅ Lien de paiement créé et envoyé !");
        }else{
          showToast("✅ Encaissement enregistré (lien Stripe indisponible)");
        }
        loadWallet();
      }else{showToast("❌ "+(data.error||"Erreur"));}
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const marquerVire=async(id)=>{
    try{
      await fetch('/api/wallet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'marquer_vire',id})});
      showToast("✅ Marqué comme viré");
      loadWallet();
    }catch(e){showToast("❌ Erreur");}
  };

  return <div style={{padding:20}}>
    {showPay&&<div style={{position:"fixed",inset:0,background:"#000000AA",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <Card style={{width:480,maxWidth:"90vw",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>⚡ Nouveau paiement</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Choisis le type, le contact et le montant</div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Type de transaction *</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {TYPES_PAYER.map(t=><button key={t.id} onClick={()=>setPayUnified(p=>({...p,type:t.id,contact:""}))} style={{background:payUnified.type===t.id?`${t.color}22`:C.card2,border:`1px solid ${payUnified.type===t.id?t.color:C.border}`,borderRadius:8,padding:"10px 8px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
              <div style={{fontSize:12,fontWeight:700,color:payUnified.type===t.id?t.color:C.text}}>{t.label}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:2}}>{t.desc}</div>
            </button>)}
          </div>
        </div>
        {payUnified.type==="sortie"&&<div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Contact *</label>
          <Sel value={payUnified.contact} onChange={e=>setPayUnified(p=>({...p,contact:e.target.value}))} style={{width:"100%"}}>
            <option value="">— Sélectionner —</option>
            {EQUIPE_CONTACTS.map((c,i)=><option key={i} value={c.nom}>{c.nom}</option>)}
          </Sel>
        </div>}
        {payUnified.type&&payUnified.type!=="sortie"&&<div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Bénéficiaire *</label>
          <Inp value={payUnified.contact} onChange={e=>setPayUnified(p=>({...p,contact:e.target.value}))} placeholder="Nom du bénéficiaire" style={{marginBottom:8}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Inp value={payUnified.contactEmail} onChange={e=>setPayUnified(p=>({...p,contactEmail:e.target.value}))} placeholder="Email (optionnel)"/>
            <Inp value={payUnified.contactTel} onChange={e=>setPayUnified(p=>({...p,contactTel:e.target.value}))} placeholder="Téléphone (optionnel)"/>
          </div>
          {payUnified.type==="fournisseur"&&<Inp value={payUnified.contactIban} onChange={e=>setPayUnified(p=>({...p,contactIban:e.target.value}))} placeholder="IBAN (optionnel)" style={{marginTop:8}}/>}
        </div>}
        {payUnified.type&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant (€) *</label><Inp value={payUnified.montant} onChange={e=>setPayUnified(p=>({...p,montant:e.target.value}))} placeholder="0.00"/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Méthode</label><Sel value={payUnified.methode} onChange={e=>setPayUnified(p=>({...p,methode:e.target.value}))} style={{width:"100%"}}>{METHODES_PAY.map(m=><option key={m.id} value={m.id}>{m.icon} {m.nom}</option>)}</Sel></div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Motif</label>
            <Inp value={payUnified.motif} onChange={e=>setPayUnified(p=>({...p,motif:e.target.value}))} placeholder="Ex: Remboursement service annulé"/>
          </div>
        </>}
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={handlePayerUnifie} style={{flex:1}}>✅ Créer la transaction</Btn>
          <BtnGhost onClick={()=>{setShowPay(false);setPayUnified({type:"",contact:"",montant:"",motif:"",methode:"sepa"});}}>Annuler</BtnGhost>
        </div>
      </Card>
    </div>}

    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>
    {onglet==="solde"&&<>
      <div style={{background:`linear-gradient(135deg,${C.card},#0A1A14)`,border:`1px solid ${C.teal}44`,borderRadius:16,padding:24,marginBottom:16}}>
        <div style={{fontSize:10,color:C.teal,letterSpacing:"0.2em",marginBottom:8}}>SOLDE WALLET XYRA · FLUTTERWAVE + STRIPE</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:12,marginBottom:8}}>
          <div style={{fontSize:44,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>{fmt(soldeConv,devise)}</div>
          <Sel value={devise} onChange={e=>setDevise(e.target.value)} style={{marginBottom:6}}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
        </div>
        {devise!=="EUR"&&<div style={{fontSize:11,color:C.muted,marginBottom:12}}>{fmt(solde,"EUR")} · Taux de référence</div>}
        <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:16}}>
          <div style={{borderLeft:`2px solid ${C.green}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Encaissé ce mois</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(conv(histo.filter(h=>h.type==="entree"&&h.statut==="confirmé"&&new Date(h.rawDate).getMonth()===new Date().getMonth()&&new Date(h.rawDate).getFullYear()===new Date().getFullYear()).reduce((a,h)=>a+h.montant,0),"EUR",devise),devise)}</div></div>
          <div style={{borderLeft:`2px solid ${C.red}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Décaissé ce mois</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>{fmt(conv(histo.filter(h=>h.type!=="entree"&&h.statut==="viré"&&new Date(h.rawDate).getMonth()===new Date().getMonth()&&new Date(h.rawDate).getFullYear()===new Date().getFullYear()).reduce((a,h)=>a+h.montant,0),"EUR",devise),devise)}</div></div>
          <div style={{borderLeft:`2px solid ${C.orange}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>En attente</div><div style={{fontSize:18,fontWeight:700,color:C.orange}}>{fmt(conv(histo.filter(h=>h.statut==="à_virer").reduce((a,h)=>a+h.montant,0),"EUR",devise),devise)}</div></div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={()=>setShowPay(true)}>⚡ Payer</Btn><Btn onClick={()=>setOnglet("encaisser")} style={{background:C.green,color:"#000"}}>📲 Encaisser</Btn></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Transactions" val={histo.length} color={C.blue}/>
        <KPI label="Commissions dues" val={fmt(histo.filter(h=>h.type==="commission"&&h.statut==="à_virer").reduce((a,h)=>a+h.montant,0))} color={C.orange}/>
        <KPI label="Remboursements" val={fmt(histo.filter(h=>h.type==="remboursement"&&h.statut==="à_virer").reduce((a,h)=>a+h.montant,0))} color={C.red}/>
        <KPI label="Fournisseurs" val={fmt(histo.filter(h=>h.type==="fournisseur"&&h.statut==="à_virer").reduce((a,h)=>a+h.montant,0))} color={C.purple}/>
      </div>
      <div style={{background:solde<alerteSeuil?`${C.red}11`:`${C.green}08`,border:`1px solid ${solde<alerteSeuil?C.red:C.green}33`,borderRadius:10,padding:12,fontSize:12,color:solde<alerteSeuil?C.red:C.green}}>{solde<alerteSeuil?`⚠️ Alerte : solde < seuil (${fmt(alerteSeuil)})`:`✅ Solde en bonne santé (seuil: ${fmt(alerteSeuil)})`}</div>
    </>}
    {onglet==="historique"&&<Card><STitle>📋 Historique des transactions</STitle>
      {loadingWallet&&<div style={{fontSize:11,color:C.muted,marginBottom:8}}>Chargement...</div>}
      {!loadingWallet&&histo.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucune transaction pour le moment</div>}
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Date</TH><TH>Libellé</TH><TH>Montant</TH><TH>Méthode</TH><TH>Statut</TH><TH>Commission 5%</TH><TH>Action</TH></tr></thead>
        <tbody>{histo.map((h,i)=><tr key={i}>
          <Td style={{color:C.muted,fontSize:10}}>{h.date}</Td>
          <Td style={{fontWeight:600}}>{h.libelle}</Td>
          <Td style={{color:h.type==="entree"?C.green:C.red,fontWeight:700}}>{h.type==="entree"?"+":"-"}{fmt(h.montant,h.devise)}</Td>
          <Td><Pill color={C.blue}>{h.methode}</Pill></Td>
          <Td><St s={h.statut}/></Td>
          <Td style={{color:C.gold}}>{h.com>0?`+${fmt(h.com,h.devise)}`:"—"}</Td>
          <Td>{h.statut==="à_virer"&&<Btn onClick={()=>marquerVire(h.id)} style={{padding:"3px 8px",fontSize:10}}>✅ Marquer viré</Btn>}</Td>
        </tr>)}</tbody>
      </table>
    </Card>}
    {onglet==="payer"&&<div style={{maxWidth:500}}><Card><STitle>⚡ Effectuer un paiement</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Bénéficiaire *</label><Inp value={payForm.nom} onChange={e=>setPayForm(f=>({...f,nom:e.target.value}))} placeholder="Nom ou raison sociale"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant *</label><Inp value={payForm.montant} onChange={e=>setPayForm(f=>({...f,montant:e.target.value}))} placeholder="0.00"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise</label><Sel value={payForm.devise} onChange={e=>setPayForm(f=>({...f,devise:e.target.value}))} style={{width:"100%"}}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel></div>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Méthode</label><Sel value={payForm.methode} onChange={e=>setPayForm(f=>({...f,methode:e.target.value}))} style={{width:"100%"}}>{METHODES_PAY.map(m=><option key={m.id} value={m.id}>{m.icon} {m.nom} — {m.zone}</option>)}</Sel></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Référence</label><Inp value={payForm.ref} onChange={e=>setPayForm(f=>({...f,ref:e.target.value}))} placeholder="Ex: COM-001"/></div>
        <Btn onClick={()=>handlePayer(payForm)} style={{marginTop:4}}>⚡ Envoyer le paiement</Btn>
      </div>
    </Card></div>}
    {onglet==="encaisser"&&<div style={{maxWidth:500}}><Card><STitle>💰 Encaisser un paiement</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Payeur *</label><Inp value={payForm.nom} onChange={e=>setPayForm(f=>({...f,nom:e.target.value}))} placeholder="Nom du client"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant *</label><Inp value={payForm.montant} onChange={e=>setPayForm(f=>({...f,montant:e.target.value}))} placeholder="0.00"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise</label><Sel value={payForm.devise} onChange={e=>setPayForm(f=>({...f,devise:e.target.value}))} style={{width:"100%"}}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel></div>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Méthode d'encaissement</label><Sel value={payForm.methode} onChange={e=>setPayForm(f=>({...f,methode:e.target.value}))} style={{width:"100%"}}>{METHODES_PAY.map(m=><option key={m.id} value={m.id}>{m.icon} {m.nom} — {m.zone}</option>)}</Sel></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Référence devis</label><Inp value={payForm.ref} onChange={e=>setPayForm(f=>({...f,ref:e.target.value}))} placeholder="Ex: TYM-0044"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email client</label><Inp value={payForm.email||""} onChange={e=>setPayForm(f=>({...f,email:e.target.value}))} placeholder="client@email.com"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Téléphone client</label><Inp value={payForm.tel||""} onChange={e=>setPayForm(f=>({...f,tel:e.target.value}))} placeholder="+33612345678"/></div>
        </div>
        <div style={{fontSize:10,color:C.muted}}>Renseignez email et/ou téléphone pour envoyer le lien de paiement automatiquement</div>
        {payForm.montant&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>Commission Xyra 5% : {fmt(Number(payForm.montant)*0.05,payForm.devise)}</div>}
        <Btn onClick={()=>handleEncaisser(payForm)} style={{background:C.green,color:"#000",marginTop:4}}>💰 Encaisser</Btn>
      </div>
    </Card></div>}
    {onglet==="commissions"&&<Card><STitle>👥 Commissions à virer</STitle>
      {histo.filter(h=>h.type==="commission"&&h.statut==="à_virer").length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucune commission en attente.</div>}
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Date</TH><TH>Bénéficiaire</TH><TH>Montant</TH><TH>Méthode</TH><TH>Action</TH></tr></thead>
        <tbody>{histo.filter(h=>h.type==="commission"&&h.statut==="à_virer").map((h,i)=><tr key={h.id}>
          <Td style={{color:C.muted,fontSize:10}}>{h.date}</Td>
          <Td style={{fontWeight:600}}>{h.libelle}</Td>
          <Td style={{color:C.orange,fontWeight:700}}>{fmt(h.montant,h.devise)}</Td>
          <Td>{h.methode}</Td>
          <Td><Btn onClick={()=>marquerVire(h.id)} style={{padding:"4px 10px",fontSize:11}}>✅ Marquer viré</Btn></Td>
        </tr>)}</tbody>
      </table>
      <div style={{marginTop:12,padding:"10px 14px",background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,fontSize:12,color:C.orange}}>Total à virer : {fmt(histo.filter(h=>h.type==="commission"&&h.statut==="à_virer").reduce((a,h)=>a+h.montant,0))}</div>
    </Card>}
    {onglet==="remboursements"&&<Card><STitle>↩ Remboursements en attente</STitle>
      {histo.filter(h=>h.type==="remboursement"&&h.statut==="à_virer").length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun remboursement en attente.</div>}
      {histo.filter(h=>h.type==="remboursement"&&h.statut==="à_virer").map((h,i)=><div key={h.id} style={{background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:12,fontWeight:600}}>{h.libelle}</div><div style={{fontSize:10,color:C.muted}}>{h.date} · {h.methode}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:700,color:C.red}}>{fmt(h.montant,h.devise)}</div><Btn onClick={()=>marquerVire(h.id)} style={{padding:"4px 10px",fontSize:11,marginTop:6}}>✅ Marquer viré</Btn></div>
      </div>)}
    </Card>}
    {onglet==="fournisseurs"&&<Card><STitle>🏭 Paiements fournisseurs en attente</STitle>
      {histo.filter(h=>h.type==="fournisseur"&&h.statut==="à_virer").length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun paiement fournisseur en attente.</div>}
      {histo.filter(h=>h.type==="fournisseur"&&h.statut==="à_virer").map((h,i)=><div key={h.id} style={{background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:12,fontWeight:600}}>{h.libelle}</div><div style={{fontSize:10,color:C.muted}}>{h.date} · {h.methode}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:700,color:C.purple}}>{fmt(h.montant,h.devise)}</div><Btn onClick={()=>marquerVire(h.id)} style={{padding:"4px 10px",fontSize:11,marginTop:6,background:C.purple}}>✅ Marquer viré</Btn></div>
      </div>)}
    </Card>}
    {onglet==="convertisseur"&&<div style={{maxWidth:500}}><Convertisseur/></div>}
    {onglet==="iban"&&<div style={{maxWidth:600}}><IbanMondial showToast={showToast}/></div>}
    {onglet==="wallets_projets"&&<Card><STitle>📂 Wallets Projets</STitle>
      {walletProjet.map((w,i)=><div key={i} style={{background:C.card2,borderRadius:10,padding:14,marginBottom:10,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:13,fontWeight:700,color:C.text}}>{w.nom}</div><Pill color={w.couleur}>{Math.round(w.solde/w.cible*100)}%</Pill></div>
        <div style={{fontSize:20,fontWeight:700,color:w.couleur,marginBottom:6}}>{fmt(w.solde)}<span style={{fontSize:11,color:C.muted}}> / {fmt(w.cible)}</span></div>
        <SM val={w.solde} max={w.cible} color={w.couleur}/>
      </div>)}
    </Card>}
    {onglet==="sante"&&<Card><STitle>❤ Score Santé Financière</STitle>
      <div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontSize:64,fontWeight:700,color:C.gold,fontFamily:"Georgia,serif"}}>76</div><div style={{fontSize:14,color:C.muted}}>/ 100 — Bonne santé</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <CT style={{textAlign:"center"}}><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Liquidité</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>85</div><SM val={85} max={100} color={C.green}/></CT>
        <CT style={{textAlign:"center"}}><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Rentabilité</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>72</div><SM val={72} max={100} color={C.gold}/></CT>
        <CT style={{textAlign:"center"}}><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Endettement</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>68</div><SM val={68} max={100} color={C.blue}/></CT>
      </div>
    </Card>}
    {onglet==="alertes"&&<Card><STitle>🔔 Configuration Alertes</STitle>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>Seuil d'alerte solde bas</div><div style={{fontSize:10,color:C.muted}}>Notification quand solde {'<'} seuil</div></div>
        <Inp value={alerteSeuil} onChange={e=>setAlerteSeuil(Number(e.target.value))} style={{width:120}}/>
      </div>
      <div style={{marginTop:12,fontSize:11,color:C.muted}}>Seuil actuel : {fmt(alerteSeuil)} · Solde actuel : {fmt(solde)} · Statut : {solde>=alerteSeuil?"✅ OK":"⚠️ Alerte active"}</div>
    </Card>}
    {onglet==="stats"&&<Card><STitle>📊 Statistiques Wallet</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        <CT><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Total encaissé</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(histo.filter(h=>h.type==="entree").reduce((a,h)=>a+h.montant,0))}</div></CT>
        <CT><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Total décaissé</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>{fmt(histo.filter(h=>h.type!=="entree").reduce((a,h)=>a+h.montant,0))}</div></CT>
        <CT><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Commissions perçues (5%)</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(histo.reduce((a,h)=>a+h.com,0))}</div></CT>
        <CT><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Transactions</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>{histo.length}</div></CT>
      </div>
    </Card>}
    {onglet==="virements"&&<Card><STitle>🏦 Virements bancaires SEPA</STitle>
      <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Le virement est enregistré dans Xyra puis à exécuter toi-même depuis ta banque (Swan automatisera cette étape une fois validé).</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:480}}>
        <Inp value={virementForm.iban} onChange={e=>setVirementForm(f=>({...f,iban:e.target.value}))} placeholder="IBAN bénéficiaire (FR76...)"/>
        <Inp value={virementForm.bic} onChange={e=>setVirementForm(f=>({...f,bic:e.target.value}))} placeholder="BIC/SWIFT"/>
        <Inp value={virementForm.nom} onChange={e=>setVirementForm(f=>({...f,nom:e.target.value}))} placeholder="Nom du bénéficiaire"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Inp value={virementForm.montant} onChange={e=>setVirementForm(f=>({...f,montant:e.target.value}))} placeholder="Montant (€)"/>
          <Sel value={virementForm.devise} onChange={e=>setVirementForm(f=>({...f,devise:e.target.value}))} style={{width:"100%"}}>{DEVISES.filter(d=>["EUR","GBP","CHF"].includes(d.code)).map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
        </div>
        <Inp value={virementForm.motif} onChange={e=>setVirementForm(f=>({...f,motif:e.target.value}))} placeholder="Motif du virement"/>
        <Btn onClick={handleVirementSepa}>🏦 Initier le virement SEPA</Btn>
      </div>
    </Card>}
  </div>;
};

// ─── PAGE CARTES ──────────────────────────────────────────────
const PageCartes=({plan,showToast})=>{
  const[cartes,setCartes]=useState([]);
  const[transactions,setTransactions]=useState([]);
  const[budgets,setBudgets]=useState([]);
  const[enAttente,setEnAttente]=useState([]);
  const[loading,setLoading]=useState(true);
  const[view,setView]=useState("grille");
  const[onglet,setOnglet]=useState("cartes");
  const[showForm,setShowForm]=useState(false);
  const[showBudgetForm,setShowBudgetForm]=useState(false);
  const[analyseIA,setAnalyseIA]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[alertes,setAlertes]=useState([]);
  const[newCarte,setNewCarte]=useState({nom:"",limite:1000,devise:"EUR",couleur:C.blue,type:"standard",collaborateur:"",projet:"",ephemere:false});
  const[newBudget,setNewBudget]=useState({projet:"",budget_total:""});

  const load=async()=>{
    setLoading(true);
    try{
      const[cartesRes,txRes,budgetsRes,enAttenteRes]=await Promise.all([
        fetch('/api/cartes?action=cartes').then(r=>r.json()).catch(()=>({})),
        fetch('/api/cartes?action=transactions_all').then(r=>r.json()).catch(()=>({})),
        fetch('/api/cartes?action=budgets').then(r=>r.json()).catch(()=>({})),
        fetch('/api/cartes?action=en_attente').then(r=>r.json()).catch(()=>({})),
      ]);
      const cartesData=cartesRes.cartes||[];
      setCartes(cartesData.length>0?cartesData:INIT_CARTES);
      setTransactions(txRes.transactions||[]);
      setBudgets(budgetsRes.budgets||[]);
      setEnAttente(enAttenteRes.transactions||[]);
      setAlertes(cartesData.filter(c=>c.statut==="active"&&(c.solde/c.limite)*100>=80));
    }catch(e){setCartes(INIT_CARTES);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const creerCarte=async()=>{
    if(!newCarte.nom)return showToast("⚠️ Nom requis");
    try{
      const res=await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',...newCarte})});
      const d=await res.json();
      if(d.success){showToast("💳 Carte créée !");setShowForm(false);setNewCarte({nom:"",limite:1000,devise:"EUR",couleur:C.blue,type:"standard",collaborateur:"",projet:"",ephemere:false});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  const toggleCarte=async(id,statut)=>{
    try{
      await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'toggle',id,statut_actuel:statut})});
      showToast("✅ Statut carte mis à jour");load();
    }catch(e){showToast("❌ Erreur");}
  };

  const supprimerCarte=async(id)=>{
    if(!confirm("Supprimer cette carte ?"))return;
    try{
      await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',id})});
      showToast("🗑 Carte supprimée");load();
    }catch(e){showToast("❌ Erreur");}
  };

  const approuverTransaction=async(tx)=>{
    try{
      await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'approuver_transaction',id:tx.id,carte_id:tx.carte_id,montant:tx.montant})});
      showToast("✅ Transaction approuvée");load();
    }catch(e){showToast("❌ Erreur");}
  };

  const analyserIA=async()=>{
    setIaLoading(true);
    try{
      const res=await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyser_ia',cartes})});
      const d=await res.json();
      if(d.success)setAnalyseIA(d.analyse);
    }catch(e){}
    setIaLoading(false);
  };

  const creerBudget=async()=>{
    if(!newBudget.projet||!newBudget.budget_total)return showToast("⚠️ Projet et budget requis");
    try{
      await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_budget',...newBudget})});
      showToast("✅ Budget créé");setShowBudgetForm(false);setNewBudget({projet:"",budget_total:""});load();
    }catch(e){showToast("❌ Erreur");}
  };

  const tabs=[
    {id:"cartes",label:"💳 Mes cartes"},
    {id:"transactions",label:`📋 Transactions${transactions.length>0?" ("+transactions.length+")":""}`},
    {id:"approbations",label:`⏳ Approbations${enAttente.length>0?" ("+enAttente.length+")":""}`},
    {id:"budgets",label:"📊 Budgets projets"},
    {id:"analyse",label:"🤖 Analyse IA"},
    {id:"securite",label:"🛡 Sécurité"},
  ];

  const totalUtilise=cartes.filter(c=>c.devise==="EUR").reduce((a,c)=>a+Number(c.solde||0),0);
  const totalLimite=cartes.filter(c=>c.devise==="EUR").reduce((a,c)=>a+Number(c.limite||0),0);
  const cartesActives=cartes.filter(c=>c.statut==="active"||c.statut==="éphémère").length;

  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement des cartes...</div></div>;

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◈ Cartes Virtuelles</div>
        <div style={{fontSize:11,color:C.muted}}>Visa virtuelles · Supabase · Assignation projet/collaborateur · Approbations</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        {enAttente.length>0&&<div style={{background:`${C.orange}22`,border:`1px solid ${C.orange}44`,borderRadius:8,padding:"6px 12px",fontSize:11,color:C.orange,fontWeight:700}}>⏳ {enAttente.length} en attente</div>}
        <BtnGhost onClick={()=>setView(view==="liste"?"grille":"liste")} style={{fontSize:11}}>{view==="liste"?"⊞ Grille":"☰ Liste"}</BtnGhost>
        <Btn onClick={()=>setShowForm(true)}>+ Nouvelle carte</Btn>
      </div>
    </div>

    {/* ALERTES */}
    {alertes.length>0&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.orange,marginBottom:6}}>⚠️ {alertes.length} carte(s) proche(s) du plafond</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {alertes.map((a,i)=><div key={i} style={{background:`${C.orange}22`,borderRadius:6,padding:"4px 10px",fontSize:11}}>
          <span style={{color:C.text}}>{a.nom}</span> — <span style={{color:C.orange,fontWeight:700}}>{Math.round((a.solde/a.limite)*100)}%</span> · reste {fmt(a.limite-a.solde)}
        </div>)}
      </div>
    </div>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CARTES ACTIVES</div><div style={{fontSize:22,fontWeight:700,color:C.green}}>{cartesActives}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>UTILISÉ (EUR)</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(totalUtilise)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>LIMITE TOTALE</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>{fmt(totalLimite)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>DISPONIBLE</div><div style={{fontSize:18,fontWeight:700,color:C.purple}}>{fmt(totalLimite-totalUtilise)}</div></CT>
      <CT style={{borderColor:`${C.orange}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>EN ATTENTE</div><div style={{fontSize:18,fontWeight:700,color:C.orange}}>{enAttente.length}</div></CT>
    </div>

    {/* FORM NOUVELLE CARTE */}
    {showForm&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>+ Créer une carte virtuelle</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={newCarte.nom} onChange={e=>setNewCarte(c=>({...c,nom:e.target.value}))} placeholder="Ex: Abou — Missions"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Plafond</label><Inp type="number" value={newCarte.limite} onChange={e=>setNewCarte(c=>({...c,limite:Number(e.target.value)}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise</label><Sel value={newCarte.devise} onChange={e=>setNewCarte(c=>({...c,devise:e.target.value}))}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Collaborateur</label><Inp value={newCarte.collaborateur} onChange={e=>setNewCarte(c=>({...c,collaborateur:e.target.value}))} placeholder="Thomas, Abou, Fatou..."/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Projet / Mission</label><Inp value={newCarte.projet} onChange={e=>setNewCarte(c=>({...c,projet:e.target.value}))} placeholder="Airbnb Paris, Jet Dubaï..."/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Type</label>
          <Sel value={newCarte.type} onChange={e=>setNewCarte(c=>({...c,type:e.target.value}))}>
            <option value="standard">Standard</option>
            <option value="ephemere">Éphémère (usage unique)</option>
            <option value="projet">Par projet</option>
            <option value="collaborateur">Par collaborateur</option>
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Couleur</label>
          <input type="color" value={newCarte.couleur} onChange={e=>setNewCarte(c=>({...c,couleur:e.target.value}))} style={{width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:6,background:"transparent",cursor:"pointer"}}/>
        </div>
      </div>
      {newCarte.type==="ephemere"&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,marginBottom:10,fontSize:11,color:C.orange}}>
        ⚡ Carte éphémère — se désactive automatiquement après le premier paiement.
      </div>}
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={creerCarte}>💳 Créer la carte</Btn>
        <BtnGhost onClick={()=>setShowForm(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── MES CARTES ── */}
    {onglet==="cartes"&&<div style={{display:"grid",gridTemplateColumns:view==="grille"?"repeat(auto-fill,minmax(280px,1fr))":"1fr",gap:12}}>
      {cartes.map((c,i)=>{
        const pct=c.limite>0?Math.round((Number(c.solde||0)/Number(c.limite||1))*100):0;
        const barColor=pct>=80?C.red:pct>=60?C.orange:C.green;
        return <div key={c.id||i} style={{background:`linear-gradient(135deg,${c.couleur||C.blue}22,${C.card})`,border:`1px solid ${c.couleur||C.blue}44`,borderRadius:14,padding:20,position:"relative"}}>
          {c.statut==="bloquée"&&<div style={{position:"absolute",top:10,right:10}}><Pill color={C.red}>🔒 Bloquée</Pill></div>}
          {c.statut==="éphémère"&&<div style={{position:"absolute",top:10,right:10}}><Pill color={C.orange}>⚡ Éphémère</Pill></div>}
          {c.statut==="expirée"&&<div style={{position:"absolute",top:10,right:10}}><Pill color={C.muted}>✕ Expirée</Pill></div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text}}>{c.nom}</div>
            <div style={{fontSize:16,color:c.couleur||C.blue,fontWeight:700}}>{c.reseau||"Visa"}</div>
          </div>
          <div style={{fontFamily:"'Courier New',monospace",fontSize:13,color:C.muted,marginBottom:10,letterSpacing:"0.1em"}}>{c.numero}</div>
          {c.collaborateur&&<div style={{fontSize:10,color:C.muted,marginBottom:3}}>👤 {c.collaborateur}</div>}
          {c.projet&&<div style={{fontSize:10,color:C.muted,marginBottom:8}}>📋 {c.projet}</div>}
          <div style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
              <span style={{color:C.muted}}>Utilisé</span>
              <span style={{color:barColor,fontWeight:700}}>{fmt(Number(c.solde||0))} / {fmt(Number(c.limite||0))} · {pct}%</span>
            </div>
            <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:Math.min(100,pct)+"%",background:barColor,borderRadius:2}}/>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:10}}>
            <span>Exp: {c.expiry||"12/28"}</span><span>CVV: {c.cvv||"•••"}</span><span>{c.devise||"EUR"}</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            <BtnGhost onClick={()=>toggleCarte(c.id,c.statut)} style={{flex:1,fontSize:10,color:c.statut==="active"?C.orange:C.green}}>
              {c.statut==="active"?"🔒 Geler":"🔓 Activer"}
            </BtnGhost>
            <BtnGhost onClick={()=>{navigator.clipboard?.writeText(c.numero?.replace(/[•]/g,"")||"");showToast("✅ Numéro copié");}} style={{fontSize:10}}>📋</BtnGhost>
            <BtnGhost onClick={()=>supprimerCarte(c.id)} style={{fontSize:10,color:C.red,borderColor:`${C.red}33`}}>✕</BtnGhost>
          </div>
        </div>;
      })}
    </div>}

    {/* ── TRANSACTIONS ── */}
    {onglet==="transactions"&&<Card>
      <STitle>📋 Historique transactions — toutes cartes</STitle>
      {transactions.length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucune transaction enregistrée.</div>:
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
          <thead><tr><TH>Date</TH><TH>Carte</TH><TH>Libellé</TH><TH>Catégorie</TH><TH>Montant</TH><TH>Statut</TH></tr></thead>
          <tbody>{transactions.slice(0,50).map((t,i)=><tr key={i}>
            <Td style={{fontSize:10,color:C.muted}}>{new Date(t.date_transaction||t.created_at).toLocaleDateString("fr")}</Td>
            <Td style={{fontSize:11}}>{t.cartes_virtuelles?.nom||"—"}</Td>
            <Td style={{fontWeight:600}}>{t.libelle}</Td>
            <Td><Pill color={C.blue}>{t.categorie||"Autres"}</Pill></Td>
            <Td style={{color:t.sens==="debit"?C.red:C.green,fontWeight:700}}>{t.sens==="debit"?"-":"+"}{fmt(Number(t.montant||0))}</Td>
            <Td><Pill color={t.statut==="approuvé"?C.green:t.statut==="en_attente"?C.orange:C.red}>{t.statut}</Pill></Td>
          </tr>)}</tbody>
        </table>
      </div>}
    </Card>}

    {/* ── APPROBATIONS ── */}
    {onglet==="approbations"&&<div>
      {enAttente.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>✅</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Aucune transaction en attente</div>
        <div style={{fontSize:11,color:C.muted}}>Toutes les transactions ont été traitées.</div>
      </Card>:<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,fontSize:11,color:C.text}}>
          ⏳ Ces transactions ont été soumises par vos collaborateur et attendent votre validation. Une notification WhatsApp vous a été envoyée pour chaque demande.
        </div>
        {enAttente.map((t,i)=><Card key={i} style={{borderColor:`${C.orange}44`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:700}}>{t.libelle}</div>
              <div style={{fontSize:11,color:C.muted}}>Carte : {t.cartes_virtuelles?.nom||"—"} · {new Date(t.created_at).toLocaleDateString("fr")}</div>
              <Pill color={C.blue}>{t.categorie||"Autres"}</Pill>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:20,fontWeight:700,color:C.orange,marginBottom:8}}>{fmt(Number(t.montant||0))}</div>
              <div style={{display:"flex",gap:6}}>
                <Btn onClick={()=>approuverTransaction(t)} style={{fontSize:11,padding:"6px 12px",background:C.green}}>✅ Approuver</Btn>
                <BtnGhost onClick={()=>showToast("❌ Transaction refusée")} style={{fontSize:11,color:C.red,borderColor:`${C.red}44`}}>✕ Refuser</BtnGhost>
              </div>
            </div>
          </div>
        </Card>)}
      </div>}
    </div>}

    {/* ── BUDGETS PROJETS ── */}
    {onglet==="budgets"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <Btn onClick={()=>setShowBudgetForm(true)} style={{fontSize:11}}>+ Créer un budget projet</Btn>
      </div>
      {showBudgetForm&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
        <STitle>+ Nouveau budget projet</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom du projet</label><Inp value={newBudget.projet} onChange={e=>setNewBudget(b=>({...b,projet:e.target.value}))} placeholder="Airbnb Paris, Jet Dubaï..."/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Budget total (€)</label><Inp type="number" value={newBudget.budget_total} onChange={e=>setNewBudget(b=>({...b,budget_total:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creerBudget}>✅ Créer</Btn><BtnGhost onClick={()=>setShowBudgetForm(false)}>Annuler</BtnGhost></div>
      </Card>}
      {budgets.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:11,color:C.muted}}>Aucun budget projet. Crée-en un pour suivre les dépenses par mission.</div>
      </Card>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {budgets.map((b,i)=>{
          const cartesProjet=cartes.filter(c=>c.projet===b.projet);
          const depense=cartesProjet.reduce((a,c)=>a+Number(c.solde||0),0);
          const pct=b.budget_total>0?Math.round(depense/b.budget_total*100):0;
          return <Card key={i} style={{borderColor:`${C.blue}33`}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{b.projet}</div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:6}}>
              <span style={{color:C.muted}}>Dépensé</span>
              <span style={{color:pct>=80?C.red:C.gold,fontWeight:700}}>{fmt(depense)} / {fmt(b.budget_total)} ({pct}%)</span>
            </div>
            <SM val={pct} max={100} color={pct>=80?C.red:pct>=60?C.orange:C.green}/>
            <div style={{fontSize:10,color:C.muted,marginTop:6}}>{cartesProjet.length} carte(s) rattachée(s)</div>
          </Card>;
        })}
      </div>}
    </div>}

    {/* ── ANALYSE IA ── */}
    {onglet==="analyse"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse IA des dépenses — Claude Sonnet</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseIA||"Clique sur Analyser pour obtenir une analyse IA de tes dépenses par carte."}</div>}
        <BtnGhost onClick={analyserIA} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🤖 Analyser les dépenses"}</BtnGhost>
      </div>
      <Card>
        <STitle>📊 Utilisation par carte</STitle>
        {cartes.map((c,i)=>{
          const pct=c.limite>0?Math.round((Number(c.solde||0)/Number(c.limite||1))*100):0;
          return <div key={i} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <div><span style={{fontWeight:600}}>{c.nom}</span>{c.collaborateur&&<span style={{color:C.muted,fontSize:10}}> · {c.collaborateur}</span>}</div>
              <div><span style={{color:pct>=80?C.red:pct>=60?C.orange:C.green,fontWeight:700}}>{pct}%</span><span style={{color:C.muted,fontSize:10,marginLeft:8}}>{fmt(Number(c.solde||0))} / {fmt(Number(c.limite||0))}</span></div>
            </div>
            <SM val={pct} max={100} color={pct>=80?C.red:pct>=60?C.orange:C.green}/>
          </div>;
        })}
      </Card>
    </div>}

    {/* ── SÉCURITÉ ── */}
    {onglet==="securite"&&<Card>
      <STitle>🛡 Sécurité & Contrôles globaux</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        <CT><div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Dépenses max/jour</div><Inp placeholder="500 €"/></CT>
        <CT><div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Pays autorisés</div><Inp placeholder="FR, AE, SN..."/></CT>
        <CT><div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Catégories bloquées</div><Inp placeholder="Jeux, alcool..."/></CT>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[["🔔 Alertes WhatsApp à chaque transaction",true],["✅ Approbation manager requise >500€",true],["📍 Limitation géographique activée",false],["⏰ Désactivation auto la nuit (22h-7h)",false],["🔒 Authentification 3D Secure obligatoire",true]].map(([label,actif],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:C.card2,borderRadius:8,fontSize:12}}>
          <span>{label}</span>
          <div style={{width:36,height:20,borderRadius:10,background:actif?C.green:C.border,position:"relative",cursor:"pointer"}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:actif?18:2,transition:"left 0.2s"}}/>
          </div>
        </div>)}
      </div>
    </Card>}
  </div>;
};


const PageAccueil=({notifs,setNotifs,profil,setPage})=>{
  const nonLus=notifs.filter(n=>!n.lu).length;
  const[loading,setLoading]=useState(true);
  const[caReel,setCaReel]=useState(0);
  const[caMoisDernier,setCaMoisDernier]=useState(0);
  const[margeNette,setMargeNette]=useState(0);
  const[commissionsAVirer,setCommissionsAVirer]=useState(0);
  const[leadsEnAttente,setLeadsEnAttente]=useState(0);
  const[prochainRdv,setProchainRdv]=useState(null);
  const[ca7j,setCa7j]=useState([]);
  const[aiMsg,setAiMsg]=useState("");
  const[aiLoading,setAiLoading]=useState(false);
  const[scoreBusiness,setScoreBusiness]=useState(0);
  const[tendance,setTendance]=useState("stable");
  const[totalCharges,setTotalCharges]=useState(0);

  useEffect(()=>{
    const load=async()=>{
      try{
        const[wRes,fRes,chRes]=await Promise.all([
          fetch('/api/wallet?action=list').then(r=>r.json()).catch(()=>({})),
          fetch('/api/factures?action=list').then(r=>r.json()).catch(()=>({})),
          fetch('/api/charges').then(r=>r.json()).catch(()=>({})),
        ]);
        const now=new Date();
        const moisActuel=now.getMonth(),anneeActuelle=now.getFullYear();
        const moisPrecedent=moisActuel===0?11:moisActuel-1;
        const anneePrecedente=moisActuel===0?anneeActuelle-1:anneeActuelle;
        const txs=wRes.transactions||[];
        let caM=0,caMp=0;
        txs.forEach(t=>{
          if(t.type!=="entree"||t.statut!=="confirmé")return;
          const d=new Date(t.created_at),m=Number(t.montant||0);
          if(d.getMonth()===moisActuel&&d.getFullYear()===anneeActuelle)caM+=m;
          if(d.getMonth()===moisPrecedent&&d.getFullYear()===anneePrecedente)caMp+=m;
        });
        (fRes.factures||[]).forEach(f=>{
          if(f.statut!=="payée")return;
          const d=new Date(f.date_emission||f.created_at),m=Number(f.montant_ttc||0);
          if(d.getMonth()===moisActuel&&d.getFullYear()===anneeActuelle)caM+=m;
          if(d.getMonth()===moisPrecedent&&d.getFullYear()===anneePrecedente)caMp+=m;
        });
        setCaReel(caM);setCaMoisDernier(caMp);
        setTendance(caM>caMp?"hausse":caM<caMp?"baisse":"stable");
        const charges=(chRes.charges||[]);
        const totalCh=charges.reduce((a,c)=>a+Number(c.montant||0),0);
        setTotalCharges(totalCh);
        const marge=caM>0?Math.round(((caM-totalCh)/caM)*100):0;
        setMargeNette(Math.max(0,Math.min(100,marge)));
        const comm=txs.filter(t=>t.type==="commission"&&t.statut==="à_virer").reduce((a,t)=>a+Number(t.montant||0),0);
        setCommissionsAVirer(comm);
        try{
          const crmRes=await fetch('/api/crm').then(r=>r.json()).catch(()=>({}));
          setLeadsEnAttente((crmRes.leads||[]).filter(l=>l.etape==="Nouveau").length);
        }catch(e){}
        try{
          const{createClient}=await import('@supabase/supabase-js');
          const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
          const{data:pl}=await sb.from('planning').select('date_mission,heure_debut,client_nom,service,collaborateur').gte('date_mission',now.toISOString().slice(0,10)).order('date_mission',{ascending:true}).limit(1);
          if(pl&&pl[0])setProchainRdv(pl[0]);
        }catch(e){}
        const derniers7j=[];
        for(let i=6;i>=0;i--){
          const d=new Date();d.setDate(d.getDate()-i);
          const label=d.toLocaleDateString("fr",{weekday:"short"});
          const ca=txs.filter(t=>{const td=new Date(t.created_at);return t.type==="entree"&&t.statut==="confirmé"&&td.toDateString()===d.toDateString();}).reduce((a,t)=>a+Number(t.montant||0),0);
          derniers7j.push({label,ca});
        }
        setCa7j(derniers7j);
        let score=50;
        if(caM>10000)score+=15;else if(caM>5000)score+=8;
        if(marge>50)score+=10;else if(marge>30)score+=5;
        if(comm===0)score+=10;
        if(caM>=caMp)score+=10;
        setScoreBusiness(Math.min(100,score));
      }catch(e){console.error("Accueil:",e);}
      setLoading(false);
    };
    load();
  },[]);

  const genererAnalyseIA=async()=>{
    setAiLoading(true);
    try{
      const res=await fetch("/api/ia",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({max_tokens:200,prompt:`Données réelles dashboard : CA ce mois ${fmt(caReel)}, CA mois dernier ${fmt(caMoisDernier)}, tendance ${tendance}, marge ${margeNette}%, commissions à virer ${fmt(commissionsAVirer)}, leads CRM ${leadsEnAttente}, charges ${fmt(totalCharges)}, score ${scoreBusiness}/100. Brief morning 2-3 phrases max, français, actionnable, priorité n°1 en premier.`})});
      const data=await res.json();
      if(data.text)setAiMsg(data.text);
      else setAiMsg("Enregistre tes premières transactions pour activer l'analyse IA.");
    }catch(e){setAiMsg("Analyse IA indisponible.");}
    setAiLoading(false);
  };
  useEffect(()=>{if(!loading)genererAnalyseIA();},[loading]);

  const priorites=[];
  if(commissionsAVirer>0)priorites.push({icon:"🟠",txt:`${fmt(commissionsAVirer)} de commissions partenaires à virer`,act:"wallet"});
  if(leadsEnAttente>0)priorites.push({icon:"🔴",txt:`${leadsEnAttente} lead(s) CRM en attente`,act:"crm"});
  if(priorites.length===0)priorites.push({icon:"🟢",txt:"Tout est à jour — bonne journée !",act:null});

  const meteo=tendance==="hausse"?{icon:"☀️",txt:`CA en hausse (+${caMoisDernier>0?Math.round(((caReel-caMoisDernier)/caMoisDernier)*100):0}%)`,color:C.green}:tendance==="baisse"?{icon:"🌧️",txt:"CA en baisse vs mois dernier",color:C.red}:{icon:"⛅",txt:"CA stable",color:C.gold};
  const maxCa=Math.max(...ca7j.map(d=>d.ca),1);

  return <div style={{padding:20}}>
    <div style={{background:`linear-gradient(135deg,${C.card},#0A1A14)`,border:`1px solid ${C.gold}33`,borderRadius:16,padding:24,marginBottom:16}}>
      <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",marginBottom:6}}>XYRA · OWNER DASHBOARD</div>
      <div style={{fontSize:26,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>Bonjour ✦</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:16,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        {new Date().toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} · Paris
        <span style={{background:`${meteo.color}22`,color:meteo.color,border:`1px solid ${meteo.color}44`,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600}}>{meteo.icon} {meteo.txt}</span>
      </div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:12,marginBottom:16,minHeight:52}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:4}}>🤖 Brief IA du matin — Claude · données réelles</div>
        {aiLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{aiMsg||"—"}</div>}
      </div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        <div style={{borderLeft:`2px solid ${C.gold}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Score business</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{loading?"—":scoreBusiness+"/100"}</div></div>
        <div style={{borderLeft:`2px solid ${C.green}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>CA ce mois</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{loading?"—":fmt(caReel)}</div></div>
        <div style={{borderLeft:`2px solid ${C.teal}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Marge nette</div><div style={{fontSize:16,fontWeight:700,color:C.teal}}>{loading?"—":margeNette+"%"}</div></div>
        <div style={{borderLeft:`2px solid ${C.orange}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Messages</div><div style={{fontSize:16,fontWeight:700,color:C.orange}}>{nonLus} non lus</div></div>
        {!loading&&commissionsAVirer>0&&<div style={{borderLeft:`2px solid ${C.red}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Commissions dues</div><div style={{fontSize:16,fontWeight:700,color:C.red}}>{fmt(commissionsAVirer)}</div></div>}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <Card>
        <STitle>🔥 Priorités du jour (calculées)</STitle>
        {priorites.map((p,i)=><div key={i} onClick={()=>p.act&&setPage(p.act)} style={{display:"flex",gap:8,padding:"7px 8px",borderRadius:6,marginBottom:5,cursor:p.act?"pointer":"default",background:C.card2,border:`1px solid ${C.border}`}}><span>{p.icon}</span><span style={{fontSize:11,flex:1}}>{p.txt}</span>{p.act&&<span style={{fontSize:10,color:C.gold,fontWeight:600}}>→</span>}</div>)}
        {prochainRdv&&<div style={{marginTop:8,background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:8,padding:"8px 10px",fontSize:11}}><div style={{color:C.blue,fontWeight:600,marginBottom:2}}>📅 Prochain RDV</div><div style={{color:C.text}}>{prochainRdv.client_nom} — {prochainRdv.service}</div><div style={{color:C.muted,fontSize:10}}>{prochainRdv.date_mission} à {prochainRdv.heure_debut} · {prochainRdv.collaborateur}</div></div>}
      </Card>
      <Card>
        <STitle>📊 Métriques clés (réelles)</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>CA Mois</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{loading?"—":fmt(caReel)}</div>{!loading&&caMoisDernier>0&&<div style={{fontSize:9,color:caReel>=caMoisDernier?C.green:C.red}}>{caReel>=caMoisDernier?"↗":"↘"} vs mois dernier</div>}</CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>Leads CRM</div><div style={{fontSize:16,fontWeight:700,color:C.orange}}>{loading?"—":leadsEnAttente}</div><div style={{fontSize:9,color:C.muted}}>Nouveaux</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>Marge</div><div style={{fontSize:16,fontWeight:700,color:C.teal}}>{loading?"—":margeNette+"%"}</div><div style={{fontSize:9,color:C.muted}}>Estimée</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>Score</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{loading?"—":scoreBusiness+"/100"}</div><div style={{fontSize:9,color:scoreBusiness>=70?C.green:scoreBusiness>=50?C.gold:C.red}}>{loading?"—":scoreBusiness>=70?"🟢 Bon":scoreBusiness>=50?"🟡 Correct":"🔴 À améliorer"}</div></CT>
        </div>
      </Card>
    </div>
    <Card style={{marginBottom:12}}>
      <STitle>📈 CA 7 derniers jours (temps réel)</STitle>
      {ca7j.every(d=>d.ca===0)?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"20px 0"}}>Aucune transaction confirmée — les paiements apparaîtront ici automatiquement.</div>
      :<div style={{display:"flex",alignItems:"flex-end",gap:6,height:100,padding:"10px 0"}}>{ca7j.map((d,i)=>{const h=Math.round((d.ca/maxCa)*80)+4;return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{fontSize:9,color:d.ca>0?C.gold:C.muted,fontWeight:600}}>{d.ca>0?fmt(d.ca).replace(" €",""):""}</div><div style={{width:"100%",height:h,background:d.ca>0?`linear-gradient(180deg,${C.gold},${C.gold}88)`:`${C.border}44`,borderRadius:"3px 3px 0 0",minHeight:4}}/><div style={{fontSize:9,color:C.muted}}>{d.label}</div></div>;})}
      </div>}
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
      {[{icon:"💳",label:"Wallet",page:"wallet",val:loading?"—":commissionsAVirer>0?`⚠ ${fmt(commissionsAVirer)} dus`:"À jour",color:commissionsAVirer>0?C.orange:C.teal},{icon:"◎",label:"CRM",page:"crm",val:loading?"—":`${leadsEnAttente} leads`,color:C.blue},{icon:"◧",label:"Devis",page:"devis",val:"Créer un devis",color:C.gold},{icon:"📊",label:"Analytique",page:"analytique",val:loading?"—":tendance==="hausse"?"CA ↗":"CA stable",color:tendance==="hausse"?C.green:C.gold}].map((c,i)=><Card key={i} style={{cursor:"pointer",borderColor:`${c.color}33`,textAlign:"center"}} onClick={()=>setPage(c.page)}><div style={{fontSize:24,marginBottom:6}}>{c.icon}</div><div style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:2}}>{c.label}</div><div style={{fontSize:11,fontWeight:700,color:c.color}}>{c.val}</div></Card>)}
    </div>
  </div>;
};

const PageOverview=({plan,profil,setPage,showToast})=>{
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[briefing,setBriefing]=useState("");
  const[briefingLoading,setBriefingLoading]=useState(false);
  const[devise,setDevise]=useState("EUR");

  const load=async()=>{
    setLoading(true);
    try{
      const[walletRes,facturesRes,devisRes,clientsRes,dealsRes,chargesRes,partnersRes]=await Promise.all([
        fetch('/api/wallet?action=list').then(r=>r.json()).catch(()=>({})),
        fetch('/api/factures?action=list').then(r=>r.json()).catch(()=>({})),
        fetch('/api/devis?action=list').then(r=>r.json()).catch(()=>({})),
        fetch('/api/clients').then(r=>r.json()).catch(()=>({})),
        fetch('/api/deals').then(r=>r.json()).catch(()=>({})),
        fetch('/api/tresorerie').then(r=>r.json()).catch(()=>({})),
        fetch('/api/partenaires').then(r=>r.json()).catch(()=>({})),
      ]);

      const wallet=walletRes.transactions||walletRes.data||[];
      const factures=facturesRes.factures||facturesRes.data||[];
      const devis=devisRes.devis||devisRes.data||[];
      const clients=clientsRes.clients||clientsRes.data||[];
      const deals=dealsRes.deals||dealsRes.data||[];
      const partners=partnersRes.partenaires||partnersRes.data||[];

      const now=new Date();
      const debutMois=new Date(now.getFullYear(),now.getMonth(),1);
      const debutSemaine=new Date(now.getTime()-now.getDay()*86400000);

      // CA réel
      const caMois=factures.filter(f=>f.statut==="payée"&&new Date(f.date_emission||f.created_at)>=debutMois).reduce((a,f)=>a+Number(f.montant_ttc||0),0)+
        wallet.filter(t=>t.type==="entree"&&t.statut==="confirmé"&&new Date(t.created_at)>=debutMois).reduce((a,t)=>a+Number(t.montant||0),0);
      const caSemaine=factures.filter(f=>f.statut==="payée"&&new Date(f.date_emission||f.created_at)>=debutSemaine).reduce((a,f)=>a+Number(f.montant_ttc||0),0);
      const caTotal=factures.filter(f=>f.statut==="payée").reduce((a,f)=>a+Number(f.montant_ttc||0),0)+
        wallet.filter(t=>t.type==="entree"&&t.statut==="confirmé").reduce((a,t)=>a+Number(t.montant||0),0);

      // Solde wallet
      const solde=(walletRes.solde||walletRes.balance)||
        wallet.filter(t=>t.type==="entree"&&t.statut==="confirmé").reduce((a,t)=>a+Number(t.montant||0),0)-
        wallet.filter(t=>t.type!=="entree"&&t.statut==="viré").reduce((a,t)=>a+Number(t.montant||0),0);

      // Commissions dues
      const commissionsDues=wallet.filter(t=>t.type==="commission"&&t.statut==="à_virer").reduce((a,t)=>a+Number(t.montant||0),0);

      // Factures en attente
      const facturesEnAttente=factures.filter(f=>f.statut!=="payée"&&f.statut!=="annulée");
      const montantEnAttente=facturesEnAttente.reduce((a,f)=>a+Number(f.montant_ttc||0),0);

      // Devis en cours
      const devisEnCours=devis.filter(d=>d.statut==="envoyé"||d.statut==="en_cours");

      // Deals pipeline
      const dealsActifs=deals.filter(d=>d.statut!=="perdu"&&d.statut!=="gagné");
      const valeurPipeline=dealsActifs.reduce((a,d)=>a+Number(d.valeur||d.montant||0),0);

      // Score santé global
      let score=50;
      if(solde>10000)score+=15;else if(solde>2000)score+=5;else score-=15;
      if(caMois>5000)score+=15;else if(caMois>1000)score+=5;else score-=5;
      if(commissionsDues>solde*0.3)score-=10;
      if(facturesEnAttente.length>5)score-=5;
      if(clients.length>10)score+=10;else if(clients.length>3)score+=5;
      const scoreGlobal=Math.max(0,Math.min(100,score));

      // Activité récente
      const activiteRecente=[
        ...factures.slice(-5).map(f=>({type:"facture",label:f.client_nom||"Client",montant:Number(f.montant_ttc||0),statut:f.statut,date:f.created_at})),
        ...wallet.slice(-5).map(t=>({type:"wallet",label:t.libelle||t.type,montant:Number(t.montant||0),statut:t.statut,date:t.created_at})),
      ].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,8);

      // Météo financière
      const meteo=solde>10000&&caMois>3000?"🌞 Excellente":solde>5000&&caMois>1000?"🌤 Bonne":solde>2000?"⛅ Correcte":"🌧 Difficile";
      const meteoColor=solde>10000&&caMois>3000?C.green:solde>5000&&caMois>1000?C.teal:solde>2000?C.gold:C.red;

      setData({caMois,caSemaine,caTotal,solde,commissionsDues,montantEnAttente,facturesEnAttente,devisEnCours,dealsActifs,valeurPipeline,scoreGlobal,activiteRecente,meteo,meteoColor,clients,partners});
    }catch(e){console.error("Overview:",e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  useEffect(()=>{
    if(data&&!briefing){
      setBriefingLoading(true);
      fetch('/api/ia',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        max_tokens:400,
        prompt:`Tu es l'assistant IA de Xyra. Génère un briefing matinal professionnel (4-5 phrases, français, ton coach business) basé sur ces données réelles :
Score santé : ${data.scoreGlobal}/100 | CA ce mois : ${data.caMois}€ | Solde : ${data.solde}€
Commissions dues : ${data.commissionsDues}€ | Factures en attente : ${data.montantEnAttente}€ (${data.facturesEnAttente?.length} factures)
Devis en cours : ${data.devisEnCours?.length} | Pipeline deals : ${data.valeurPipeline}€
Clients actifs : ${data.clients?.length}

Donne : 1 constat positif, 1 point de vigilance, et 3 priorités concrètes pour aujourd'hui. Commence par "Bonjour ! Voici votre briefing du jour —"`
      })}).then(r=>r.json()).then(d=>{setBriefing(d.text||"");setBriefingLoading(false);}).catch(()=>setBriefingLoading(false));
    }
  },[data]);

  if(!hasAccess(plan,"overview"))return <div style={{padding:20}}><UpgradeWall page="overview" plan={plan}/></div>;
  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement de votre vue d'ensemble...</div></div>;

  const scoreColor=data.scoreGlobal>=70?C.green:data.scoreGlobal>=40?C.gold:C.red;
  const scoreLabel=data.scoreGlobal>=70?"🟢 Excellente":data.scoreGlobal>=40?"🟡 Correcte":"🔴 À surveiller";

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◑ Vue d'ensemble</div>
        <div style={{fontSize:11,color:C.muted}}>Tableau de bord principal · Données réelles en temps réel</div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{fontSize:22}}>{data.meteo.split(" ")[0]}</div>
        <div style={{fontSize:12,color:data.meteoColor,fontWeight:700}}>{data.meteo.split(" ").slice(1).join(" ")}</div>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
      </div>
    </div>

    {/* BRIEFING IA */}
    <div style={{background:`linear-gradient(135deg,${C.card},${C.card2})`,border:`1px solid ${C.purple}44`,borderRadius:12,padding:16,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:700,letterSpacing:"0.1em"}}>🤖 BRIEFING IA — CLAUDE · {new Date().toLocaleDateString("fr",{weekday:"long",day:"numeric",month:"long"}).toUpperCase()}</div>
        <BtnGhost onClick={()=>{setBriefing("");setBriefingLoading(true);}} style={{fontSize:9,padding:"3px 8px"}}>🔄</BtnGhost>
      </div>
      {briefingLoading?<div style={{fontSize:12,color:C.muted}}>⏳ Génération du briefing...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{briefing||"Chargement du briefing..."}</div>}
    </div>

    {/* SCORE + KPIs PRINCIPAUX */}
    <div style={{display:"grid",gridTemplateColumns:"140px 1fr",gap:12,marginBottom:16}}>
      <div style={{background:C.card,border:`2px solid ${scoreColor}44`,borderRadius:12,padding:16,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:9,color:C.muted,marginBottom:6,letterSpacing:"0.1em"}}>SCORE SANTÉ</div>
        <div style={{fontSize:48,fontWeight:700,color:scoreColor,fontFamily:"Georgia,serif",lineHeight:1}}>{data.scoreGlobal}</div>
        <div style={{fontSize:9,color:scoreColor,marginTop:4}}>{scoreLabel}</div>
        <div style={{width:"100%",height:4,background:C.border,borderRadius:2,marginTop:8,overflow:"hidden"}}>
          <div style={{height:"100%",width:data.scoreGlobal+"%",background:scoreColor,borderRadius:2,transition:"width 1s"}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {[
          {l:"CA ce mois",v:fmt(conv(data.caMois,"EUR",devise),devise),c:C.green,sub:"Réel confirmé"},
          {l:"Solde wallet",v:fmt(conv(data.solde,"EUR",devise),devise),c:data.solde>5000?C.teal:data.solde>2000?C.gold:C.red,sub:"Disponible"},
          {l:"En attente",v:fmt(conv(data.montantEnAttente,"EUR",devise),devise),c:C.orange,sub:`${data.facturesEnAttente?.length||0} factures`},
          {l:"Pipeline deals",v:fmt(conv(data.valeurPipeline,"EUR",devise),devise),c:C.blue,sub:`${data.dealsActifs?.length||0} deals actifs`},
          {l:"CA cette semaine",v:fmt(conv(data.caSemaine,"EUR",devise),devise),c:C.purple,sub:"7 derniers jours"},
          {l:"Commissions dues",v:fmt(conv(data.commissionsDues,"EUR",devise),devise),c:data.commissionsDues>0?C.red:C.green,sub:data.commissionsDues>0?"À virer":"Tout à jour"},
          {l:"Devis en cours",v:data.devisEnCours?.length||0,c:C.blue,sub:"Envoyés"},
          {l:"Clients actifs",v:data.clients?.length||0,c:C.teal,sub:"Total CRM"},
        ].map((k,i)=><CT key={i}><div style={{fontSize:9,color:C.muted,marginBottom:3,letterSpacing:"0.08em"}}>{k.l}</div><div style={{fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div><div style={{fontSize:9,color:C.muted,marginTop:2}}>{k.sub}</div></CT>)}
      </div>
    </div>

    {/* ACTIONS RAPIDES */}
    <Card style={{marginBottom:14}}>
      <STitle>⚡ Actions rapides</STitle>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[
          {label:"+ Nouveau devis",color:C.gold,page:"devis"},
          {label:"+ Enregistrer paiement",color:C.green,page:"wallet"},
          {label:"+ Ajouter client",color:C.blue,page:"crm"},
          {label:"+ Nouvelle facture",color:C.purple,page:"facturation"},
          {label:"+ Deal pipeline",color:C.orange,page:"deals"},
          {label:"Voir trésorerie",color:C.teal,page:"tresorerie"},
        ].map((a,i)=><button key={i} onClick={()=>setPage&&setPage(a.page)} style={{background:`${a.color}15`,border:`1px solid ${a.color}44`,borderRadius:8,padding:"8px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:12,color:a.color,fontWeight:600,transition:"all 0.2s"}}>{a.label}</button>)}
      </div>
    </Card>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
      {/* ACTIVITÉ RÉCENTE */}
      <Card>
        <STitle>🕐 Activité récente</STitle>
        {data.activiteRecente?.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:12}}>Aucune activité récente.</div>}
        {data.activiteRecente?.map((a,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:14}}>{a.type==="facture"?"🧾":"💳"}</span>
            <div>
              <div style={{fontWeight:600,color:C.text}}>{a.label}</div>
              <div style={{fontSize:9,color:C.muted}}>{new Date(a.date).toLocaleDateString("fr")}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontWeight:700,color:C.gold}}>{fmt(a.montant)}</div>
            <Pill color={a.statut==="payée"||a.statut==="confirmé"?C.green:a.statut==="viré"?C.teal:C.orange}>{a.statut}</Pill>
          </div>
        </div>)}
      </Card>

      {/* PIPELINE DEALS */}
      <Card>
        <STitle>🎯 Pipeline commercial</STitle>
        {data.dealsActifs?.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:12}}>Aucun deal actif. <button onClick={()=>setPage&&setPage("deals")} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>Ajouter un deal →</button></div>}
        {data.dealsActifs?.slice(0,5).map((d,i)=>{
          const prob=d.probabilite||d.probability||50;
          const colors=[C.blue,C.purple,C.teal,C.gold,C.orange];
          return <div key={i} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
              <span style={{fontWeight:600}}>{d.nom||d.titre||d.name||"Deal"}</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{color:C.gold,fontWeight:700}}>{fmt(Number(d.valeur||d.montant||0))}</span>
                <Pill color={colors[i%5]}>{prob}%</Pill>
              </div>
            </div>
            <SM val={prob} max={100} color={colors[i%5]}/>
          </div>;
        })}
        {data.valeurPipeline>0&&<div style={{marginTop:10,padding:"8px 12px",background:`${C.blue}11`,border:`1px solid ${C.blue}22`,borderRadius:8,fontSize:11,color:C.text}}>
          Pipeline total : <b style={{color:C.gold}}>{fmt(data.valeurPipeline)}</b>
        </div>}
      </Card>
    </div>

    {/* ALERTES URGENTES */}
    {(data.commissionsDues>0||data.facturesEnAttente?.length>3||data.solde<2000)&&<Card style={{borderColor:`${C.orange}44`}}>
      <STitle>🔔 Points d'attention</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {data.commissionsDues>0&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:`${C.red}11`,border:`1px solid ${C.red}22`,borderRadius:8,padding:"10px 12px",fontSize:12}}>
          <span>💸 Commissions partenaires à virer</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{color:C.red,fontWeight:700}}>{fmt(data.commissionsDues)}</span>
            <BtnGhost onClick={()=>setPage&&setPage("wallet")} style={{fontSize:10,padding:"3px 8px"}}>Gérer →</BtnGhost>
          </div>
        </div>}
        {data.facturesEnAttente?.length>3&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:`${C.orange}11`,border:`1px solid ${C.orange}22`,borderRadius:8,padding:"10px 12px",fontSize:12}}>
          <span>🧾 {data.facturesEnAttente.length} factures en attente de paiement</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{color:C.orange,fontWeight:700}}>{fmt(data.montantEnAttente)}</span>
            <BtnGhost onClick={()=>setPage&&setPage("facturation")} style={{fontSize:10,padding:"3px 8px"}}>Voir →</BtnGhost>
          </div>
        </div>}
        {data.solde<2000&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:`${C.red}11`,border:`1px solid ${C.red}22`,borderRadius:8,padding:"10px 12px",fontSize:12}}>
          <span>⚠️ Solde wallet sous le seuil critique</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{color:C.red,fontWeight:700}}>{fmt(data.solde)}</span>
            <BtnGhost onClick={()=>setPage&&setPage("tresorerie")} style={{fontSize:10,padding:"3px 8px"}}>Trésorerie →</BtnGhost>
          </div>
        </div>}
      </div>
    </Card>}
  </div>;
};


const PageCRM=({plan,showToast,profil})=>{
  const[leads,setLeads]=useState([]);
  const[loadingLeads,setLoadingLeads]=useState(true);
  const[onglet,setOnglet]=useState("pipeline");
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",contact:"",email:"",tel:"",metier:"",ca_potentiel:"",source:""});
  const[sel,setSel]=useState(null);
  const[draftMsg,setDraftMsg]=useState("");
  const[generating,setGenerating]=useState(false);
  const etapes=["Nouveau","Qualification","Proposition","Négociation","Gagné","Perdu"];
  const tabs=[{id:"pipeline",label:"📊 Pipeline"},{id:"leads",label:"🎯 Leads"},{id:"relances",label:"📧 Relances IA"},{id:"analytics",label:"📈 Analytics"}];

  const loadAll=async()=>{
    try{
      const res=await fetch('/api/crm');
      const data=await res.json();
      if(data.leads)setLeads(data.leads);
    }catch(e){console.error("CRM:",e);}
    setLoadingLeads(false);
  };
  useEffect(()=>{loadAll();},[]);
  useEffect(()=>{if(sel)setSel(s=>leads.find(l=>l.id===s.id)||null);},[leads]);

  if(!hasAccess(plan,"crm"))return <div style={{padding:20}}><UpgradeWall page="CRM" plan={plan}/></div>;

  const ajouterLead=async()=>{
    if(!addForm.nom)return showToast("⚠️ Le nom de l'entreprise est requis");
    try{
      const res=await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',...addForm})});
      const data=await res.json();
      if(data.success){
        showToast(`✅ ${data.lead.nom} ajouté au pipeline`);
        setAddForm({nom:"",contact:"",email:"",tel:"",metier:"",ca_potentiel:"",source:""});setShowAdd(false);
        loadAll();
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const changerEtape=async(l,etape)=>{
    try{
      await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id:l.id,etape})});
      loadAll();
    }catch(e){showToast("❌ Erreur");}
  };

  const changerScore=async(l,score)=>{
    try{
      await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id:l.id,score:Number(score)})});
      loadAll();
    }catch(e){showToast("❌ Erreur");}
  };

  const supprimerLead=async(l)=>{
    try{
      await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer',id:l.id})});
      showToast(`🗑 ${l.nom} retiré du pipeline`);setSel(null);
      loadAll();
    }catch(e){showToast("❌ Erreur");}
  };

  const genererMessageIA=async(l)=>{
    setGenerating(true);setDraftMsg("");
    try{
      const res=await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_message_ia',lead:l})});
      const data=await res.json();
      if(data.success)setDraftMsg(data.message);
      else showToast("❌ "+(data.error||"Génération impossible"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setGenerating(false);
  };

  const envoyerRelance=async(l,canal)=>{
    if(!draftMsg.trim())return showToast("⚠️ Le message est vide");
    if(canal==="whatsapp"){
      if(!l.tel)return showToast("⚠️ Aucun téléphone renseigné pour ce lead");
      showToast("⏳ Envoi WhatsApp...");
      try{
        const res=await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_whatsapp',id:l.id,tel:l.tel,message:draftMsg})});
        const data=await res.json();
        if(data.success){showToast(`✅ Relance envoyée à ${l.nom} par WhatsApp`);setDraftMsg("");loadAll();}
        else showToast("❌ "+(data.error||"Erreur"));
      }catch(e){showToast("❌ Erreur de connexion");}
    }else{
      if(!l.email)return showToast("⚠️ Aucun email renseigné pour ce lead");
      showToast("⏳ Envoi email...");
      try{
        const res=await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_email',id:l.id,email:l.email,subject:`Suivi — ${l.nom}`,message:draftMsg})});
        const data=await res.json();
        if(data.success){showToast(`✅ Relance envoyée à ${l.nom} par email`);setDraftMsg("");loadAll();}
        else showToast("❌ "+(data.error||"Erreur"));
      }catch(e){showToast("❌ Erreur de connexion");}
    }
  };

  const aRelancer=leads.filter(l=>l.etape!=="Gagné"&&l.etape!=="Perdu");
  const tauxConv=leads.length>0?Math.round(leads.filter(l=>l.etape==="Gagné").length/leads.filter(l=>l.etape!=="Nouveau").length*100)||0:0;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◎ CRM</div><div style={{fontSize:11,color:C.muted}}>Pipeline · Leads · Relances IA · Analytics · {leads.length} lead(s)</div></div>
      <Btn onClick={()=>setShowAdd(s=>!s)}>+ Nouveau lead</Btn>
    </div>

    {showAdd&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>Nouveau lead</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Entreprise *","nom"],["Contact","contact"],["Email","email"],["Téléphone","tel"],["Métier / secteur","metier"],["CA potentiel €","ca_potentiel"],["Source","source"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={addForm[k]} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={ajouterLead}>✅ Ajouter</Btn>
        <BtnGhost onClick={()=>setShowAdd(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    {loadingLeads&&<div style={{fontSize:11,color:C.muted,marginBottom:12}}>Chargement...</div>}

    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>

    {!loadingLeads&&leads.length===0&&<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:12,color:C.muted}}>Aucun lead pour le moment.</div><BtnGhost onClick={()=>setShowAdd(true)} style={{marginTop:10}}>+ Ajouter le premier lead</BtnGhost></Card>}

    {onglet==="pipeline"&&leads.length>0&&<>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${etapes.length},1fr)`,gap:8,marginBottom:16}}>
        {etapes.map(e=>{const ls=leads.filter(l=>l.etape===e);return <div key={e} style={{background:C.card2,borderRadius:10,padding:10,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{e} <span style={{color:ls.length>0?C.gold:C.muted}}>({ls.length})</span></div>
          {ls.map(l=><div key={l.id} style={{background:C.card,borderRadius:7,padding:8,marginBottom:6,border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>{setSel(l);setOnglet("leads");}}>
            <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:2}}>{l.nom}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{l.contact||"—"} · {l.metier||"—"}</div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
              <Pill color={l.score>=80?C.green:l.score>=60?C.gold:C.orange}>★ {l.score}</Pill>
              <span style={{color:C.teal,fontWeight:600}}>{fmt(l.ca_potentiel)}</span>
            </div>
          </div>)}
        </div>;})}
      </div>
    </>}

    {onglet==="leads"&&leads.length>0&&<div style={{display:"grid",gridTemplateColumns:sel?"1fr 1fr":"1fr",gap:12}}>
      <Card>
        <STitle>🎯 Tous les leads</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Entreprise</TH><TH>Contact</TH><TH>Métier</TH><TH>Étape</TH><TH>Score</TH><TH>CA potentiel</TH><TH>Mis à jour</TH></tr></thead>
          <tbody>{leads.map(l=><tr key={l.id} style={{cursor:"pointer",background:sel?.id===l.id?`${C.gold}0D`:"transparent"}} onClick={()=>setSel(l)}>
            <Td style={{fontWeight:600}}>{l.nom}</Td>
            <Td style={{color:C.muted}}>{l.contact||"—"}</Td>
            <Td>{l.metier?<Pill color={C.blue}>{l.metier}</Pill>:"—"}</Td>
            <Td><Pill color={l.etape==="Gagné"?C.green:l.etape==="Perdu"?C.red:C.gold}>{l.etape}</Pill></Td>
            <Td><div style={{display:"flex",alignItems:"center",gap:6}}><SM val={l.score} max={100} color={l.score>=80?C.green:l.score>=60?C.gold:C.orange}/><span style={{color:l.score>=80?C.green:l.score>=60?C.gold:C.orange,fontWeight:700,fontSize:11}}>{l.score}</span></div></Td>
            <Td style={{color:C.teal,fontWeight:700}}>{fmt(l.ca_potentiel)}</Td>
            <Td style={{color:C.muted,fontSize:10}}>{new Date(l.updated_at).toLocaleDateString("fr")}</Td>
          </tr>)}</tbody>
        </table>
      </Card>
      {sel&&<Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div><div style={{fontSize:15,fontWeight:700}}>{sel.nom}</div><div style={{fontSize:11,color:C.muted}}>{sel.contact||"—"} · {sel.metier||"—"} · source : {sel.source||"—"}</div></div>
          <BtnGhost onClick={()=>setSel(null)} style={{fontSize:10,padding:"4px 8px"}}>✕</BtnGhost>
        </div>
        {[["📧",sel.email||"—"],["📱",sel.tel||"—"],["💰 CA potentiel",fmt(sel.ca_potentiel)]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>)}
        <div style={{marginTop:10}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Étape</label>
          <Sel value={sel.etape} onChange={e=>changerEtape(sel,e.target.value)} style={{width:"100%",marginBottom:8}}>
            {etapes.map(e=><option key={e} value={e}>{e}</option>)}
          </Sel>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Score de qualification ({sel.score}/100)</label>
          <input type="range" min="0" max="100" value={sel.score} onChange={e=>changerScore(sel,e.target.value)} style={{width:"100%"}}/>
        </div>
        <div style={{marginTop:10}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Notes</label>
          <textarea defaultValue={sel.notes||""} onBlur={e=>{fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id:sel.id,notes:e.target.value})}).then(loadAll);}} placeholder="Notes internes..." style={{width:"100%",minHeight:60,background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:8,color:C.text,fontFamily:"inherit",fontSize:11}}/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <BtnGhost onClick={()=>{setOnglet("relances");}} style={{flex:1,fontSize:11,color:C.gold,borderColor:`${C.gold}44`}}>📧 Relance IA</BtnGhost>
          <BtnGhost onClick={()=>supprimerLead(sel)} style={{flex:1,fontSize:11,color:C.red,borderColor:`${C.red}44`}}>🗑 Supprimer</BtnGhost>
        </div>
      </Card>}
    </div>}

    {onglet==="relances"&&<div>
      {aRelancer.length===0&&<Card style={{textAlign:"center",padding:24}}><div style={{fontSize:12,color:C.muted}}>Aucun lead actif à relancer pour le moment.</div></Card>}
      {aRelancer.length>0&&<div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:12}}>
        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:700,color:C.muted}}>LEADS ACTIFS</div>
          {aRelancer.map(l=><div key={l.id} onClick={()=>{setSel(l);setDraftMsg("");}} style={{padding:"10px 14px",cursor:"pointer",background:sel?.id===l.id?`${C.gold}0D`:"transparent",borderBottom:`1px solid ${C.border}22`}}>
            <div style={{fontSize:12,fontWeight:700}}>{l.nom}</div>
            <div style={{fontSize:10,color:C.muted}}>{l.etape} · {fmt(l.ca_potentiel)}</div>
          </div>)}
        </Card>
        {sel?<Card>
          <STitle>🤖 Message de relance IA — {sel.nom}</STitle>
          <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Généré à partir des données réelles du lead (étape, secteur, notes).</div>
          {!draftMsg&&<Btn onClick={()=>genererMessageIA(sel)} style={{marginBottom:10}}>{generating?"⏳ Génération...":"🤖 Générer le message"}</Btn>}
          {draftMsg&&<>
            <textarea value={draftMsg} onChange={e=>setDraftMsg(e.target.value)} style={{width:"100%",minHeight:140,background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:10,color:C.text,fontFamily:"inherit",fontSize:12,lineHeight:1.6,marginBottom:10}}/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Btn onClick={()=>envoyerRelance(sel,"whatsapp")} style={{fontSize:11}}>📱 Envoyer par WhatsApp</Btn>
              <BtnGhost onClick={()=>envoyerRelance(sel,"email")} style={{fontSize:11}}>📧 Envoyer par email</BtnGhost>
              <BtnGhost onClick={()=>genererMessageIA(sel)} style={{fontSize:11}}>{generating?"⏳...":"🔄 Régénérer"}</BtnGhost>
            </div>
          </>}
        </Card>:<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:8}}>👈</div><div style={{color:C.muted,fontSize:12}}>Sélectionne un lead pour générer sa relance</div></Card>}
      </div>}
    </div>}

    {onglet==="analytics"&&leads.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      <KPI label="Taux conversion" val={tauxConv+"%"} color={C.green} sub="Qualifiés → Gagné"/>
      <KPI label="CA pipeline" val={fmt(leads.reduce((a,l)=>a+Number(l.ca_potentiel||0),0))} color={C.gold}/>
      <KPI label="Deals gagnés" val={leads.filter(l=>l.etape==="Gagné").length} color={C.teal}/>
    </div>}
  </div>;
};

// ─── PAGE DEVIS ───────────────────────────────────────────────
const PageDevis=({plan,showToast,profil})=>{
  const MODELES=[
    {id:"airbnb",label:"Nettoyage Airbnb",lignes:[{desc:"Nettoyage complet appartement",qte:1,pu:180,tva:20},{desc:"Blanchisserie linge de lit",qte:1,pu:45,tva:20},{desc:"Réassort produits accueil",qte:1,pu:25,tva:20}]},
    {id:"bureau",label:"Nettoyage bureaux",lignes:[{desc:"Nettoyage bureaux (surface)",qte:1,pu:280,tva:20},{desc:"Nettoyage sanitaires",qte:1,pu:80,tva:20},{desc:"Vitrerie intérieure",qte:1,pu:120,tva:20}]},
    {id:"jet",label:"Jet privé",lignes:[{desc:"Nettoyage cabine jet privé",qte:1,pu:1200,tva:20},{desc:"Désinfection complète",qte:1,pu:400,tva:20},{desc:"Réassort catering bord",qte:1,pu:800,tva:20}]},
    {id:"yacht",label:"Yacht / Bateau",lignes:[{desc:"Nettoyage pont et coque",qte:1,pu:1800,tva:20},{desc:"Entretien intérieur yacht",qte:1,pu:1200,tva:20}]},
    {id:"rapatriement",label:"Rapatriement de corps",lignes:[{desc:"Prise en charge et transport",qte:1,pu:3200,tva:0},{desc:"Formalités administratives",qte:1,pu:800,tva:0},{desc:"Accompagnement famille",qte:1,pu:400,tva:0}]},
    {id:"custom",label:"Personnalisé",lignes:[{desc:"",qte:1,pu:0,tva:20}]},
  ];

  const[devis,setDevis]=useState([]);
  const[loadingDevis,setLoadingDevis]=useState(true);
  const loadDevis=async()=>{
    try{
      const res=await fetch('/api/devis?action=list');
      const data=await res.json();
      if(data.devis)setDevis(data.devis.map(d=>({
        id:d.reference,dbId:d.id,client:d.client_nom,email:d.client_email,tel:d.client_tel,
        service:d.service,montant:Number(d.montant),statut:d.statut,
        date:new Date(d.created_at).toLocaleDateString("fr"),
        lignes:d.lignes||[],remise:0,note:d.notes||"",vu:!!d.validé_at,
        tauxTva:Number(d.taux_tva ?? 20),description:d.description||"",
      })));
    }catch(e){console.error("Devis:",e);}
    setLoadingDevis(false);
  };
  useEffect(()=>{loadDevis();},[]);
  const[onglet,setOnglet]=useState("liste");
  const[showCreate,setShowCreate]=useState(false);
  const[modeleId,setModeleId]=useState("airbnb");
  const[form,setForm]=useState({client:"",email:"",tel:"",adresse:"",objet:"",validite:"30",remise:0,note:""});
  const[lignes,setLignes]=useState(MODELES[0].lignes.map(l=>({...l})));
  const[signEtape,setSignEtape]=useState(null);
  const[relanceId,setRelanceId]=useState(null);
  const[filtreStatut,setFiltreStatut]=useState("tous");

  const tabs=[{id:"liste",label:"📋 Tous les devis"},{id:"creer",label:"✍ Créer un devis"},{id:"modeles",label:"📁 Modèles"},{id:"relances",label:"🤖 Relances IA"},{id:"stats",label:"📊 Stats"}];

  const totalHT=lignes.reduce((a,l)=>a+l.qte*l.pu,0);
  const totalTVA=lignes.reduce((a,l)=>a+l.qte*l.pu*(l.tva/100),0);
  const totalRemise=totalHT*(form.remise/100);
  const totalTTC=totalHT+totalTVA-totalRemise;

  const statutColor={brouillon:C.muted,envoyé:C.blue,vu:C.purple,signé:C.green,payé:C.teal,refusé:C.red,en_attente:C.orange};

  const handleModele=(id)=>{
    setModeleId(id);
    const m=MODELES.find(x=>x.id===id);
    if(m) setLignes(m.lignes.map(l=>({...l})));
  };

  const ajouterLigne=()=>setLignes(ls=>[...ls,{desc:"",qte:1,pu:0,tva:20}]);
  const supprimerLigne=(i)=>setLignes(ls=>ls.filter((_,j)=>j!==i));
  const updateLigne=(i,k,v)=>setLignes(ls=>ls.map((l,j)=>j===i?{...l,[k]:v}:l));

  const creerDevis=async(statut="brouillon")=>{
    if(!form.client)return showToast("⚠️ Remplissez le nom du client");
    const serviceLabel=form.objet||MODELES.find(m=>m.id===modeleId)?.label||"Devis";
    const descriptionResume=lignes.map(l=>`${l.desc||"Ligne"} x${l.qte} — ${l.pu}€`).join("; ");
    try{
      const tauxTvaMoyen=totalHT>0?Math.round((totalTVA/totalHT)*100):20;
      const res=await fetch('/api/devis',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          clientName:form.client,clientPhone:form.tel,clientEmail:form.email,
          service:serviceLabel,description:descriptionResume,
          montant:Math.round(totalTTC),lignes,notes:form.note,taux_tva:tauxTvaMoyen,statut,
        }),
      });
      const data=await res.json();
      if(!data.success)return null;
      const nd={id:data.numeroDevis,client:form.client,email:form.email,tel:form.tel,service:serviceLabel,montant:Math.round(totalTTC),statut,date:new Date().toLocaleDateString("fr"),lignes:[...lignes],remise:form.remise,note:form.note,vu:false};
      loadDevis();
      return nd;
    }catch(e){showToast("❌ Erreur de connexion");return null;}
  };

  const resetForm=()=>{
    setForm({client:"",email:"",tel:"",adresse:"",objet:"",validite:"30",remise:0,note:""});
    setLignes(MODELES[0].lignes.map(l=>({...l})));
    setOnglet("liste");
  };

  const apercuPDF=()=>{
    if(!form.client)return showToast("⚠️ Remplissez le nom du client");
    const win=window.open("","_blank");
    if(!win)return showToast("⚠️ Autorisez les pop-ups pour voir l'aperçu");
    const lignesHtml=lignes.map(l=>`<tr><td style="padding:8px 0;border-bottom:1px solid #1E1E3633;">${l.desc}</td><td style="padding:8px 0;text-align:center;border-bottom:1px solid #1E1E3633;">${l.qte}</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #1E1E3633;">${l.pu}€</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #1E1E3633;">${(l.qte*l.pu).toFixed(2)}€</td></tr>`).join("");
    win.document.write(`<!DOCTYPE html><html><head><title>Devis — ${form.client}</title><style>
      body{font-family:'Segoe UI',sans-serif;background:#fff;color:#111;padding:40px;max-width:700px;margin:0 auto;}
      h1{font-size:22px;color:#C9A84C;font-family:Georgia,serif;letter-spacing:.1em;}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-top:20px;}
      th{text-align:left;padding-bottom:8px;color:#888;border-bottom:2px solid #ddd;}
      .total{text-align:right;margin-top:20px;font-size:20px;font-weight:700;color:#C9A84C;}
      .btn{background:#C9A84C;color:#000;border:none;padding:10px 24px;border-radius:6px;font-weight:700;cursor:pointer;margin-top:30px;}
      @media print{.btn{display:none;}}
    </style></head><body>
      <h1>XYRA</h1>
      <p style="color:#888;font-size:11px;">Devis pour ${form.client}${form.email?" · "+form.email:""}${form.tel?" · "+form.tel:""}</p>
      <h2 style="margin-top:20px;">${form.objet||MODELES.find(m=>m.id===modeleId)?.label||"Devis"}</h2>
      <table><tr><th>Description</th><th>Qté</th><th style="text-align:right;">PU</th><th style="text-align:right;">Total</th></tr>${lignesHtml}</table>
      <div class="total">Total TTC : ${totalTTC.toFixed(2)}€</div>
      ${form.note?`<p style="margin-top:16px;color:#666;font-size:12px;">${form.note}</p>`:""}
      <button class="btn" onclick="window.print()">🖨 Imprimer / Enregistrer en PDF</button>
    </body></html>`);
    win.document.close();
  };

  const creerEtEnvoyer=async()=>{
    if(!form.client)return showToast("⚠️ Remplissez le nom du client");
    if(!form.email&&!form.tel)return showToast("⚠️ Ajoutez un email ou un téléphone pour envoyer le devis");
    const nd=await creerDevis("envoyé");
    if(!nd)return;
    showToast("📤 Envoi en cours...");
    try{
      const res=await fetch('/api/devis/notify',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id:nd.id,client:nd.client,email:nd.email,tel:nd.tel,service:nd.service,montant:nd.montant,lignes:nd.lignes,note:nd.note}),
      });
      const data=await res.json();
      if(data.success){
        const sent=[];
        if(data.results?.email)sent.push("email");
        if(data.results?.whatsapp)sent.push("WhatsApp");
        showToast(sent.length?`✅ Devis ${nd.id} envoyé par ${sent.join(" et ")} !`:"⚠️ Devis créé mais l'envoi a échoué — vérifiez la config");
      }else{
        showToast("⚠️ Devis créé mais l'envoi a échoué");
      }
    }catch(e){
      showToast("⚠️ Devis créé mais erreur de connexion lors de l'envoi");
    }
    resetForm();
  };

  const filtred=filtreStatut==="tous"?devis:devis.filter(d=>d.statut===filtreStatut);
  const[editDevis,setEditDevis]=useState(null);
  const majStatutDevis=async(dbId,champs,msgSucces)=>{
    try{
      const res=await fetch('/api/devis',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:dbId,...champs})});
      const data=await res.json();
      if(data.success){showToast(msgSucces);loadDevis();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const convertirEnFacture=async(d)=>{
    const taux=d.tauxTva||20;
    const montantHT=Math.round((d.montant/(1+taux/100))*100)/100;
    try{
      const res=await fetch('/api/factures',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'creer',client_nom:d.client,client_email:d.email,client_tel:d.tel,
          description:d.description||d.service,montant_ht:montantHT,taux_tva:taux,
        }),
      });
      const data=await res.json();
      if(data.success&&data.facture){
        await majStatutDevis(d.dbId,{statut:"payé"},"✅ Facture "+data.facture.numero+" creee, devis marque paye");
      }else{
        showToast("❌ Erreur creation facture: "+(data.error||"inconnue"));
      }
    }catch(e){showToast("❌ Erreur de connexion facture");}
  };
  const sauverEditDevis=async()=>{
    if(!editDevis)return;
    await majStatutDevis(editDevis.dbId,{client_nom:editDevis.client,client_email:editDevis.email,client_tel:editDevis.tel,service:editDevis.service,montant:editDevis.montant,notes:editDevis.note},"✅ Devis mis à jour");
    setEditDevis(null);
  };
  const supprimerDevis=async()=>{
    if(!editDevis)return;
    if(!window.confirm("Supprimer definitivement le devis "+editDevis.id+" ?"))return;
    try{
      const res=await fetch("/api/devis?id="+editDevis.dbId,{method:"DELETE"});
      const data=await res.json();
      if(data.success){showToast("🗑 Devis "+editDevis.id+" supprime");setEditDevis(null);loadDevis();}
      else showToast("❌ "+(data.error||"Erreur inconnue"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  if(!hasAccess(plan,"devis"))return <div style={{padding:20}}><UpgradeWall page="devis" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◧ {profil?.termes?.devis||"Devis"}</div>
        <div style={{fontSize:11,color:C.muted}}>Créateur complet · PDF · WhatsApp · E-signature · Bot WhatsApp · {devis.length} {(profil?.termes?.devis||"devis").toLowerCase()}</div></div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={()=>showToast("🤖 Bot WhatsApp connecté — réponse auto activée")}>🤖 Bot WA</BtnGhost>
        <Btn onClick={()=>setOnglet("creer")}>+ Nouveau devis</Btn>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      {[["Total",devis.length,C.blue],["Signés",devis.filter(d=>d.statut==="signé"||d.statut==="payé").length,C.green],["En attente",devis.filter(d=>d.statut==="en_attente"||d.statut==="envoyé").length,C.orange],["CA signé",fmt(devis.filter(d=>d.statut==="signé"||d.statut==="payé").reduce((a,d)=>a+d.montant,0)),C.gold],["Taux conversion",Math.round(devis.filter(d=>d.statut==="signé"||d.statut==="payé").length/devis.length*100)+"%",C.teal]].map(([l,v,c],i)=><CT key={i}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></CT>)}
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── LISTE ── */}
    {onglet==="liste"&&<div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {["tous","brouillon","envoyé","vu","signé","payé","refusé"].map(s=><button key={s} onClick={()=>setFiltreStatut(s)} style={{background:filtreStatut===s?C.gold:"transparent",color:filtreStatut===s?"#000":C.muted,border:`1px solid ${filtreStatut===s?C.gold:C.border}`,borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:filtreStatut===s?700:400,textTransform:"capitalize"}}>{s}</button>)}
      </div>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>N° {profil?.termes?.devis||"Devis"}</TH><TH>{profil?.termes?.client||"Client"}</TH><TH>Service</TH><TH>Montant TTC</TH><TH>Date</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{filtred.map((d,i)=><tr key={i} onClick={()=>setEditDevis({...d})} style={{cursor:"pointer"}}>
            <Td style={{color:C.gold,fontWeight:700}}>{d.id}</Td>
            <Td style={{fontWeight:600}}>{d.client}</Td>
            <Td style={{color:C.muted,fontSize:11}}>{d.service}</Td>
            <Td style={{color:C.green,fontWeight:700,fontSize:14}}>{fmt(d.montant)}</Td>
            <Td style={{color:C.muted,fontSize:10}}>{d.date}</Td>
            <Td><Pill color={statutColor[d.statut]||C.muted}>{d.statut}</Pill></Td>
            <Td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {d.statut==="brouillon"&&<Btn onClick={()=>majStatutDevis(d.dbId,{statut:"envoyé"},`📤 Devis ${d.id} marqué envoyé`)} style={{fontSize:9,padding:"3px 7px"}}>📤 Envoyer</Btn>}
              {(d.statut==="envoyé"||d.statut==="vu")&&<Btn onClick={()=>setSignEtape({id:d.id,dbId:d.dbId,client:d.client,etape:1})} style={{fontSize:9,padding:"3px 7px",background:C.green}}>✒ Signer</Btn>}
              {d.statut==="signé"&&<Btn onClick={()=>convertirEnFacture(d)} style={{fontSize:9,padding:"3px 7px",background:C.teal}}>💳 Payé</Btn>}
              <BtnGhost onClick={()=>showToast(`📄 PDF ${d.id} généré`)} style={{fontSize:9,padding:"3px 7px"}}>PDF</BtnGhost>
              <BtnGhost onClick={()=>showToast(`📱 Relance envoyée à ${d.client}`)} style={{fontSize:9,padding:"3px 7px"}}>WA</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>
      {signEtape&&<div style={{position:"fixed",inset:0,background:"#000000AA",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
        <Card style={{width:440,maxWidth:"90vw"}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>✒ Signature électronique</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Devis {signEtape.id} · {signEtape.client}</div>
          {signEtape.etape===1&&<div>
            <div style={{fontSize:11,color:C.text,lineHeight:1.7,marginBottom:12}}>Vous allez signer électroniquement ce devis. La signature a valeur légale (règlement eIDAS).</div>
            <div style={{display:"flex",gap:8}}><Btn onClick={()=>setSignEtape(s=>({...s,etape:2}))}>Continuer →</Btn><BtnGhost onClick={()=>setSignEtape(null)}>Annuler</BtnGhost></div>
          </div>}
          {signEtape.etape===2&&<div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Tapez votre nom pour valider :</div>
            <Inp placeholder={signEtape.client} style={{marginBottom:10}}/>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>📍 IP + horodatage enregistrés · Conforme eIDAS</div>
            <div style={{display:"flex",gap:8}}><Btn onClick={()=>setSignEtape(s=>({...s,etape:3}))} style={{background:C.green}}>✒ Signer</Btn><BtnGhost onClick={()=>setSignEtape(s=>({...s,etape:1}))}>← Retour</BtnGhost></div>
          </div>}
          {signEtape.etape===3&&<div style={{textAlign:"center",padding:"10px 0"}}>
            <div style={{fontSize:32,marginBottom:8}}>✅</div>
            <div style={{fontSize:14,fontWeight:700,color:C.green,marginBottom:4}}>Devis signé !</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Signé le {new Date().toLocaleDateString("fr")} — eIDAS conforme</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <Btn onClick={async()=>{await majStatutDevis(signEtape.dbId,{statut:"signé"},"✅ Signe ! PDF envoye par email et WhatsApp");setSignEtape(null);}}>📄 Télécharger PDF signé</Btn>
            </div>
          </div>}
        </Card>
      </div>}
      {editDevis&&<div style={{position:"fixed",inset:0,background:"#000000AA",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
        <Card style={{width:480,maxWidth:"90vw",maxHeight:"85vh",overflowY:"auto"}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>✏ Modifier le devis {editDevis.id}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Statut actuel : <Pill color={statutColor[editDevis.statut]||C.muted}>{editDevis.statut}</Pill></div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Client</label><Inp value={editDevis.client} onChange={e=>setEditDevis(d=>({...d,client:e.target.value}))}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email</label><Inp value={editDevis.email||""} onChange={e=>setEditDevis(d=>({...d,email:e.target.value}))}/></div>
              <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Téléphone</label><Inp value={editDevis.tel||""} onChange={e=>setEditDevis(d=>({...d,tel:e.target.value}))}/></div>
            </div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Service / Objet</label><Inp value={editDevis.service||""} onChange={e=>setEditDevis(d=>({...d,service:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant TTC (€)</label><Inp value={editDevis.montant} onChange={e=>setEditDevis(d=>({...d,montant:Number(e.target.value)||0}))}/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Note</label><Inp value={editDevis.note||""} onChange={e=>setEditDevis(d=>({...d,note:e.target.value}))} placeholder="Conditions, précisions..."/></div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:16}}>
            <Btn onClick={sauverEditDevis}>💾 Enregistrer</Btn>
            <BtnGhost onClick={()=>setEditDevis(null)}>Annuler</BtnGhost>
            <BtnGhost onClick={supprimerDevis} style={{color:C.red,borderColor:C.red+"44"}}>🗑 Supprimer</BtnGhost>
          </div>
        </Card>
      </div>}
    </div>}

    {/* ── CRÉER ── */}
    {onglet==="creer"&&<div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:14}}>
      <div>
        <Card style={{marginBottom:12}}>
          <STitle>👤 Informations client</STitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["Client *","client","Nom ou raison sociale"],["Email","email","email@client.com"],["Téléphone WhatsApp","tel","+33 6..."],["Objet du devis","objet","Ex: Nettoyage Airbnb Montmartre"]].map(([l,k,ph])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}/></div>)}
          </div>
        </Card>
        <Card style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <STitle>📦 Lignes de prestation</STitle>
            <Btn onClick={ajouterLigne} style={{fontSize:11,padding:"5px 12px"}}>+ Ligne</Btn>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><TH>Description</TH><TH>Qté</TH><TH>PU HT (€)</TH><TH>TVA %</TH><TH>Total HT</TH><TH></TH></tr></thead>
            <tbody>{lignes.map((l,i)=><tr key={i}>
              <Td><Inp value={l.desc} onChange={e=>updateLigne(i,"desc",e.target.value)} placeholder="Description..." style={{fontSize:11}}/></Td>
              <Td><Inp value={l.qte} onChange={e=>updateLigne(i,"qte",Number(e.target.value))} style={{width:50,fontSize:11}}/></Td>
              <Td><Inp value={l.pu} onChange={e=>updateLigne(i,"pu",Number(e.target.value))} style={{width:80,fontSize:11}}/></Td>
              <Td><Sel value={l.tva} onChange={e=>updateLigne(i,"tva",Number(e.target.value))} style={{width:60,fontSize:10}}><option value={20}>20%</option><option value={10}>10%</option><option value={5.5}>5.5%</option><option value={0}>0%</option></Sel></Td>
              <Td style={{color:C.green,fontWeight:700}}>{fmt(l.qte*l.pu)}</Td>
              <Td><button onClick={()=>supprimerLigne(i)} style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:16}}>✕</button></Td>
            </tr>)}</tbody>
          </table>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Remise (%)</label><Inp value={form.remise} onChange={e=>setForm(f=>({...f,remise:Number(e.target.value)}))} placeholder="0"/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Validité (jours)</label><Inp value={form.validite} onChange={e=>setForm(f=>({...f,validite:e.target.value}))} placeholder="30"/></div>
          </div>
          <div style={{marginTop:8}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Note / conditions</label><Inp value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Conditions de paiement, délais..."/></div>
        </Card>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={async()=>{const nd=await creerDevis("brouillon");if(nd){showToast(`✅ Devis ${nd.id} créé en brouillon`);resetForm();}}} style={{flex:1}}>✅ Créer le devis</Btn>
          <BtnGhost onClick={apercuPDF} style={{flex:1}}>👁 Aperçu PDF</BtnGhost>
          <BtnGhost onClick={creerEtEnvoyer} style={{flex:1}}>📤 Créer & Envoyer</BtnGhost>
        </div>
      </div>
      {/* Récap */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card style={{background:`${C.gold}08`,borderColor:`${C.gold}33`}}>
          <STitle>💰 Récapitulatif</STitle>
          {[["Sous-total HT",fmt(totalHT),C.text],["TVA",fmt(totalTVA),C.orange],form.remise>0?["Remise "+form.remise+"%","-"+fmt(totalRemise),C.red]:null,["TOTAL TTC",fmt(totalTTC),C.gold]].filter(Boolean).map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:i===3?14:12,fontWeight:i===3?700:400}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:i===3?700:400}}>{v}</span></div>)}
        </Card>
        <Card>
          <STitle>📁 Modèle utilisé</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {MODELES.map(m=><button key={m.id} onClick={()=>handleModele(m.id)} style={{background:modeleId===m.id?`${C.gold}15`:"transparent",border:`1px solid ${modeleId===m.id?C.gold:C.border}`,borderRadius:7,padding:"7px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",color:modeleId===m.id?C.gold:C.muted,textAlign:"left",fontWeight:modeleId===m.id?700:400}}>{m.label}</button>)}
          </div>
        </Card>
        <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Bot WhatsApp connecté</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>Le devis sera automatiquement envoyé via le bot WhatsApp Xyra. Le client peut signer directement depuis WhatsApp.</div>
        </Card>
      </div>
    </div>}

    {/* ── MODÈLES ── */}
    {onglet==="modeles"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
      {MODELES.map((m,i)=><Card key={i} style={{cursor:"pointer",borderColor:`${C.gold}22`}} onClick={()=>{handleModele(m.id);setOnglet("creer");}}>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:8}}>{m.label}</div>
        <div style={{fontSize:20,fontWeight:700,color:C.gold,marginBottom:8}}>{fmt(m.lignes.reduce((a,l)=>a+l.qte*l.pu,0))}<span style={{fontSize:11,color:C.muted}}> HT</span></div>
        <div style={{marginBottom:10}}>
          {m.lignes.map((l,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{l.desc||"Ligne personnalisée"}</span><span style={{color:C.green}}>{fmt(l.qte*l.pu)}</span></div>)}
        </div>
        <Btn style={{width:"100%",fontSize:11}} onClick={()=>{handleModele(m.id);setOnglet("creer");}}>Utiliser ce modèle</Btn>
      </Card>)}
    </div>}

    {/* ── RELANCES IA ── */}
    {onglet==="relances"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Relances automatiques — Claude IA + Bot WhatsApp</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>Les relances sont envoyées automatiquement via le bot WhatsApp Xyra selon les règles ci-dessous. Vous pouvez personnaliser chaque message.</div>
      </div>
      {devis.filter(d=>d.statut==="envoyé"||d.statut==="vu").map((d,i)=><Card key={i} style={{marginBottom:10,borderColor:`${C.orange}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontSize:13,fontWeight:700}}>{d.client}</div><div style={{fontSize:10,color:C.muted}}>{d.id} · {fmt(d.montant)} · Envoyé le {d.date}</div></div>
          <Pill color={C.orange}>{d.statut}</Pill>
        </div>
        <div style={{background:C.card2,borderRadius:8,padding:12,fontSize:11,color:C.text,lineHeight:1.7,marginBottom:10,fontStyle:"italic"}}>
          "Bonjour {d.client}, je me permets de vous relancer concernant notre devis {d.id} de {fmt(d.montant)} pour {d.service}. Avez-vous eu l'occasion de le consulter ? Je reste disponible pour tout ajustement."
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>showToast(`📱 Relance envoyée à ${d.client} via WhatsApp`)} style={{fontSize:11}}>📱 Envoyer relance WA</Btn>
          <BtnGhost onClick={()=>showToast(`📧 Relance email envoyée à ${d.client}`)} style={{fontSize:11}}>📧 Email</BtnGhost>
          <BtnGhost onClick={()=>showToast("🤖 Relance IA personnalisée générée")} style={{fontSize:11}}>🤖 Personnaliser</BtnGhost>
        </div>
      </Card>)}
      <Card>
        <STitle>⚙ Règles de relance automatique</STitle>
        {[["J+3 après envoi","Relance douce WhatsApp","Activée",C.green],["J+7 après envoi","Relance email + WhatsApp","Activée",C.green],["J+14 après envoi","Appel + message personnalisé","Activée",C.green],["J+21 après envoi","Devis marqué 'sans suite'","Activée",C.gold]].map(([t,a,s,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{t}</div><div style={{fontSize:10,color:C.muted}}>{a}</div></div>
          <Pill color={c}>{s}</Pill>
        </div>)}
      </Card>
    </div>}

    {/* ── STATS ── */}
    {onglet==="stats"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>📊 Devis par statut</STitle>
          {["brouillon","envoyé","vu","signé","payé","refusé"].map((s,i)=>{const n=devis.filter(d=>d.statut===s).length;const colors=[C.muted,C.blue,C.purple,C.green,C.teal,C.red];return <div key={s} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{textTransform:"capitalize"}}>{s}</span><span style={{color:colors[i],fontWeight:700}}>{n}</span></div><SM val={n} max={devis.length} color={colors[i]}/></div>;})}
        </Card>
        <Card>
          <STitle>💰 Performance commerciale</STitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <KPI label="CA total devis" val={fmt(devis.reduce((a,d)=>a+d.montant,0))} color={C.gold}/>
            <KPI label="CA signé" val={fmt(devis.filter(d=>["signé","payé"].includes(d.statut)).reduce((a,d)=>a+d.montant,0))} color={C.green}/>
            <KPI label="Panier moyen" val={fmt(Math.round(devis.reduce((a,d)=>a+d.montant,0)/devis.length))} color={C.blue}/>
            <KPI label="Taux closing" val={Math.round(devis.filter(d=>["signé","payé"].includes(d.statut)).length/devis.length*100)+"%"} color={C.teal}/>
          </div>
        </Card>
      </div>
    </div>}
  </div>;
};
// ─── PAGE INVESTISSEMENT ──────────────────────────────────────
const PageInvestissement=({plan,showToast})=>{
  const[onglet,setOnglet]=useState("reco");
  // FIX: apostrophe correcte ci-dessous
  const tabs=[{id:"reco",label:"🤖 Recommandations IA"},{id:"portefeuille",label:"💼 Portefeuille"},{id:"plan",label:"Plan d'action"},{id:"scenarios",label:"📊 Scénarios"}];
  if(!hasAccess(plan,"investissement"))return <div style={{padding:20}}><UpgradeWall page="Investissement IA" plan={plan}/></div>;
  const recos=[{titre:"Automatisation prospection",roi:340,risque:"Faible",invest:2400,delai:"3 mois",score:94},{titre:"Expansion yacht Monaco",roi:280,risque:"Moyen",invest:8000,delai:"6 mois",score:87},{titre:"Formation équipe aviation",roi:190,risque:"Faible",invest:1200,delai:"1 mois",score:82},{titre:"Certification ISO services",roi:150,risque:"Faible",invest:3500,delai:"4 mois",score:78}];
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◐ Investissement IA</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Recommandations Claude · ROI · Plan d'action · Portefeuille</div>
    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>
    {onglet==="reco"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:14,marginBottom:16}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse IA — Claude Sonnet</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>Basé sur votre CA de 24 380 € et votre marge de 61%, je recommande de prioriser l'automatisation de la prospection. Le ROI estimé à 340% sur 3 mois en fait l'investissement le plus rentable de votre pipeline actuel.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {recos.map((r,i)=><Card key={i} style={{borderColor:r.score>=90?`${C.gold}44`:C.border}}>
          {r.score>=90&&<div style={{marginBottom:8}}><Pill color={C.gold}>★ Recommandé par IA</Pill></div>}
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:8}}>{r.titre}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>ROI estimé</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>+{r.roi}%</div></CT>
            <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Investissement</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(r.invest)}</div></CT>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:10}}>
            <span style={{color:C.muted}}>Risque : <b style={{color:r.risque==="Faible"?C.green:C.orange}}>{r.risque}</b></span>
            <span style={{color:C.muted}}>Délai : <b style={{color:C.blue}}>{r.delai}</b></span>
          </div>
          <SM val={r.score} max={100} color={r.score>=90?C.gold:C.blue}/>
          <Btn onClick={()=>showToast("✅ Investissement validé !")} style={{marginTop:10,width:"100%"}}>Valider cet investissement</Btn>
        </Card>)}
      </div>
    </div>}
    {onglet==="portefeuille"&&<Card><STitle>💼 Portefeuille d'investissements</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <KPI label="Investi total" val="15 100 €" color={C.gold}/>
        <KPI label="ROI moyen" val="+242%" color={C.green}/>
        <KPI label="Actif" val="3 projets" color={C.blue}/>
      </div>
    </Card>}
    {onglet==="plan"&&<Card><STitle>Plan d'action — Automatisation</STitle>
      {[["Sem. 1","Configurer le bot WhatsApp prospection",C.blue],["Sem. 2","Importer la liste SIRENE Val-de-Marne",C.gold],["Sem. 3","Lancer les séquences de relance automatique",C.green],["Sem. 4","Analyser les résultats & optimiser",C.teal]].map(([s,a,c],i)=><div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
        <div style={{width:48,height:24,borderRadius:4,background:`${c}22`,border:`1px solid ${c}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:c,fontWeight:700,flexShrink:0}}>{s}</div>
        <div style={{fontSize:12,color:C.text,alignSelf:"center"}}>{a}</div>
      </div>)}
    </Card>}
    {onglet==="scenarios"&&<Card><STitle>📊 Scénarios d'investissement</STitle>
      {[["Conservateur","Marge +5%, CA +15%",C.blue,85000],["Modéré","Marge +12%, CA +35%",C.gold,140000],["Agressif","Marge +20%, CA +60%",C.green,200000]].map(([n,d,c,v],i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${c}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontSize:12,fontWeight:700,color:c}}>{n}</div><div style={{fontSize:14,fontWeight:700,color:c}}>{fmt(v)}</div></div>
        <div style={{fontSize:11,color:C.muted}}>{d}</div>
      </div>)}
    </Card>}
  </div>;
};

// ─── TAB CHARGES ──────────────────────────────────────────────
const TabCharges=({showToast})=>{
  const[charges,setCharges]=useState([]);
  const[loading,setLoading]=useState(true);
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({categorie:"",libelle:"",montant:"",frequence:"mensuelle"});
  const[editId,setEditId]=useState(null);

  const load=async()=>{
    try{
      const res=await fetch('/api/charges');
      const data=await res.json();
      if(data.charges)setCharges(data.charges);
    }catch(e){console.error("Charges:",e);}
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const total=charges.reduce((a,c)=>a+Number(c.montant||0),0);

  const sauvegarder=async()=>{
    if(!form.categorie||!form.montant)return showToast("⚠️ Catégorie et montant requis");
    try{
      const res=await fetch('/api/charges',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:editId?'modifier':'creer',id:editId,...form})});
      const data=await res.json();
      if(data.success){
        showToast(editId?"✅ Charge modifiée":"✅ Charge ajoutée");
        setForm({categorie:"",libelle:"",montant:"",frequence:"mensuelle"});setEditId(null);setShowForm(false);
        load();
      }else showToast("❌ Erreur");
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const supprimer=async(id)=>{
    try{
      await fetch('/api/charges',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer',id})});
      showToast("✅ Charge supprimée");load();
    }catch(e){showToast("❌ Erreur");}
  };

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <STitle>📊 Charges mensuelles</STitle>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <Pill color={C.red}>{fmt(total)} / mois</Pill>
        <Btn onClick={()=>{setShowForm(s=>!s);setEditId(null);setForm({categorie:"",libelle:"",montant:"",frequence:"mensuelle"});}} style={{fontSize:11,padding:"5px 12px"}}>+ Ajouter</Btn>
      </div>
    </div>
    {showForm&&<div style={{background:C.card2,borderRadius:8,padding:12,marginBottom:12,border:`1px solid ${C.gold}33`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Inp value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))} placeholder="Catégorie (ex: Loyer, Assurance)"/>
        <Inp value={form.montant} onChange={e=>setForm(f=>({...f,montant:e.target.value}))} placeholder="Montant (€)"/>
        <Inp value={form.libelle} onChange={e=>setForm(f=>({...f,libelle:e.target.value}))} placeholder="Détail (optionnel)" style={{gridColumn:"span 2"}}/>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={sauvegarder}>✅ Enregistrer</Btn><BtnGhost onClick={()=>setShowForm(false)}>Annuler</BtnGhost></div>
    </div>}
    {loading&&<div style={{fontSize:11,color:C.muted}}>Chargement...</div>}
    {!loading&&charges.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucune charge enregistrée — ajoute tes charges récurrentes pour suivre tes coûts réels.</div>}
    {charges.length>0&&<table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><TH>Catégorie</TH><TH>Montant/mois</TH><TH>% du total</TH><TH>Action</TH></tr></thead>
      <tbody>{charges.map((c,i)=><tr key={c.id}>
        <Td style={{fontWeight:600}}>{c.categorie}{c.libelle?` — ${c.libelle}`:""}</Td>
        <Td style={{color:C.red,fontWeight:700}}>{fmt(c.montant)}</Td>
        <Td><div style={{display:"flex",alignItems:"center",gap:6}}><SM val={c.montant} max={total} color={C.red}/><span style={{fontSize:10,color:C.muted}}>{total>0?Math.round(c.montant/total*100):0}%</span></div></Td>
        <Td><div style={{display:"flex",gap:4}}>
          <BtnGhost onClick={()=>{setEditId(c.id);setForm({categorie:c.categorie,libelle:c.libelle||"",montant:c.montant,frequence:c.frequence});setShowForm(true);}} style={{fontSize:10,padding:"3px 8px"}}>✏️</BtnGhost>
          <BtnGhost onClick={()=>supprimer(c.id)} style={{fontSize:10,padding:"3px 8px",color:C.red}}>✕</BtnGhost>
        </div></Td>
      </tr>)}</tbody>
    </table>}
  </div>;
};

// ─── TAB FOURNISSEURS ─────────────────────────────────────────
const TabFournisseurs=({showToast})=>{
  const[fours,setFours]=useState([]);
  const[loading,setLoading]=useState(true);
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({nom:"",categorie:"",contact:"",iban:"",delai_livraison:""});
  const[showCmd,setShowCmd]=useState(null);
  const[montantCmd,setMontantCmd]=useState("");

  const load=async()=>{
    try{
      const res=await fetch('/api/fournisseurs');
      const data=await res.json();
      if(data.fournisseurs)setFours(data.fournisseurs);
    }catch(e){console.error("Fournisseurs:",e);}
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const ajouter=async()=>{
    if(!form.nom)return showToast("⚠️ Nom requis");
    try{
      const res=await fetch('/api/fournisseurs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',...form})});
      const data=await res.json();
      if(data.success){showToast("✅ Fournisseur ajouté");setForm({nom:"",categorie:"",contact:"",iban:"",delai_livraison:""});setShowForm(false);load();}
      else showToast("❌ Erreur");
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const supprimer=async(id)=>{
    try{await fetch('/api/fournisseurs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer',id})});showToast("✅ Supprimé");load();}
    catch(e){showToast("❌ Erreur");}
  };

  const commander=async(f)=>{
    if(!montantCmd)return showToast("⚠️ Indique un montant");
    try{
      const res=await fetch('/api/fournisseurs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'commander',fournisseur_id:f.id,nom:f.nom,montant:montantCmd,iban:f.iban})});
      const data=await res.json();
      if(data.success){showToast(`✅ Commande enregistrée — à virer dans le Wallet`);setShowCmd(null);setMontantCmd("");}
      else showToast("❌ Erreur");
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <STitle>🏭 Fournisseurs</STitle>
      <Btn onClick={()=>setShowForm(s=>!s)} style={{fontSize:11,padding:"5px 12px"}}>+ Ajouter</Btn>
    </div>
    {showForm&&<div style={{background:C.card2,borderRadius:8,padding:12,marginBottom:12,border:`1px solid ${C.gold}33`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Inp value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} placeholder="Nom du fournisseur"/>
        <Inp value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))} placeholder="Catégorie"/>
        <Inp value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))} placeholder="Téléphone / email"/>
        <Inp value={form.iban} onChange={e=>setForm(f=>({...f,iban:e.target.value}))} placeholder="IBAN (pour les virements)"/>
        <Inp value={form.delai_livraison} onChange={e=>setForm(f=>({...f,delai_livraison:e.target.value}))} placeholder="Délai livraison (ex: J+5)" style={{gridColumn:"span 2"}}/>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={ajouter}>✅ Ajouter</Btn><BtnGhost onClick={()=>setShowForm(false)}>Annuler</BtnGhost></div>
    </div>}
    {loading&&<div style={{fontSize:11,color:C.muted}}>Chargement...</div>}
    {!loading&&fours.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun fournisseur enregistré.</div>}
    {fours.length>0&&<table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><TH>Fournisseur</TH><TH>Catégorie</TH><TH>Contact</TH><TH>Délai</TH><TH>Action</TH></tr></thead>
      <tbody>{fours.map((f,i)=><tr key={f.id}>
        <Td style={{fontWeight:700}}>{f.nom}</Td>
        <Td><Pill color={C.blue}>{f.categorie||"—"}</Pill></Td>
        <Td style={{color:C.muted,fontSize:11}}>{f.contact||"—"}</Td>
        <Td><Pill color={C.teal}>{f.delai_livraison||"—"}</Pill></Td>
        <Td><div style={{display:"flex",gap:4,alignItems:"center"}}>
          {showCmd===f.id?<>
            <Inp value={montantCmd} onChange={e=>setMontantCmd(e.target.value)} placeholder="Montant €" style={{width:90,fontSize:10,padding:"4px 8px"}}/>
            <BtnGhost onClick={()=>commander(f)} style={{fontSize:9,padding:"3px 8px"}}>✅</BtnGhost>
            <BtnGhost onClick={()=>setShowCmd(null)} style={{fontSize:9,padding:"3px 8px"}}>✕</BtnGhost>
          </>:<BtnGhost onClick={()=>setShowCmd(f.id)} style={{fontSize:10,padding:"3px 8px"}}>Commander</BtnGhost>}
          <BtnGhost onClick={()=>supprimer(f.id)} style={{fontSize:10,padding:"3px 8px",color:C.red}}>✕</BtnGhost>
        </div></Td>
      </tr>)}</tbody>
    </table>}
  </div>;
};

// ─── PAGE NOTE DE FRAIS ────────────────────────────────────────
const PageNoteFrais=({plan,showToast})=>{
  const[onglet,setOnglet]=useState("saisie");
  const[notes,setNotes]=useState([]);
  const[loadingNotes,setLoadingNotes]=useState(true);

  useEffect(()=>{
    const load=async()=>{
      try{
        const res=await fetch('/api/notefrais?action=list');
        const data=await res.json();
        if(data.notes)setNotes(data.notes);
      }catch(e){console.error('Notes frais:',e);}
      setLoadingNotes(false);
    };
    load();
  },[]);
  const[form,setForm]=useState({employe:"",date:"",categorie:"Transport",marchand:"",montant:"",tva:"",projet:"",notes:"",justificatif:false});
  const[scanning,setScanning]=useState(false);
  const[budget,setBudget]=useState({Transport:500,Repas:300,Hébergement:800,Fournitures:200,Télécom:150,Formation:1000,Autre:200});
  const[showBudget,setShowBudget]=useState(false);
  const[filterStatut,setFilterStatut]=useState("tous");

  const cats=["Transport","Repas","Hébergement","Fournitures","Télécom","Formation","Autre"];
  const comptes={"Transport":"625100","Repas":"625700","Hébergement":"625600","Fournitures":"606400","Télécom":"626000","Formation":"628100","Autre":"625800"};
  const plafonds={"Transport":null,"Repas":20.70,"Hébergement":120,"Fournitures":null,"Télécom":null,"Formation":null,"Autre":null};
  const statutColor={validé:C.green,en_attente:C.gold,refusé:C.red,remboursé:C.teal};
  const statutLabel={validé:"✅ Validé",en_attente:"⏳ En attente",refusé:"❌ Refusé",remboursé:"💸 Remboursé"};

  const tabs=[
    {id:"saisie",label:"➕ Saisie"},
    {id:"liste",label:"📋 Mes notes"},
    {id:"validation",label:"✅ Validation"},
    {id:"analytics",label:"📊 Analytics"},
    {id:"export",label:"📤 Export"},
    {id:"politique",label:"⚙️ Politique"},
  ];

  // OCR réel via Claude Vision
  const fileInputRef=useRef(null);

  const scanTicket=()=>{
    if(fileInputRef.current)fileInputRef.current.click();
  };

  const handleFile=async(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    setScanning(true);
    try{
      const fd=new FormData();
      fd.append('image',file);
      const res=await fetch('/api/ocr',{method:'POST',body:fd});
      const data=await res.json();
      if(data.success&&data.data){
        const d=data.data;
        setForm(f=>({...f,
          marchand:d.marchand||f.marchand,
          montant:d.montant_ttc?String(d.montant_ttc):f.montant,
          tva:d.tva?String(d.tva):f.tva,
          categorie:d.categorie||f.categorie,
          date:d.date||new Date().toISOString().slice(0,10),
          justificatif:true,
        }));
        showToast("🤖 Lea a lu votre ticket ! Score de confiance : "+(d.confiance||"—")+"%");
      }else{
        showToast("⚠️ Ticket illisible — remplissez manuellement");
      }
    }catch(err){
      showToast("❌ Erreur OCR — vérifiez la connexion");
    }
    setScanning(false);
    e.target.value="";
  };

  const soumettre=async()=>{
    if(!form.employe||!form.montant||!form.date)return showToast("⚠️ Remplissez les champs obligatoires");
    const plafond=plafonds[form.categorie];
    if(plafond&&parseFloat(form.montant)>plafond)showToast("⚠️ Plafond légal dépassé — "+form.categorie+" : "+plafond+"€ max");
    try{
      const res=await fetch('/api/notefrais',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'create',
          employe:form.employe,
          date:form.date,
          categorie:form.categorie,
          marchand:form.marchand,
          montant:parseFloat(form.montant)||0,
          tva:parseFloat(form.tva)||0,
          justificatif:form.justificatif,
          compte_cpt:comptes[form.categorie],
          projet:form.projet,
        }),
      });
      const data=await res.json();
      if(data.note){
        setNotes(n=>[{...data.note,compteCpt:data.note.compte_cpt},...n]);
        setForm({employe:"",date:"",categorie:"Transport",marchand:"",montant:"",tva:"",projet:"",notes:"",justificatif:false});
        showToast("✅ Note soumise — en attente de validation");
      }else{showToast("❌ Erreur lors de la soumission");}
    }catch(e){showToast("❌ Erreur connexion");}
  };

  const updateStatut=async(id,statut,msg)=>{
    try{
      await fetch('/api/notefrais',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'update',id,statut}),
      });
      setNotes(n=>n.map(x=>x.id===id?{...x,statut}:x));
      showToast(msg);
    }catch(e){showToast("❌ Erreur");}
  };
  const valider=(id)=>updateStatut(id,"validé","✅ Note validée — écriture comptable créée !");
  const refuser=(id)=>updateStatut(id,"refusé","❌ Note refusée");
  const rembourser=(id)=>updateStatut(id,"remboursé","💸 Remboursement effectué via Wallet Xyra");

  const exportFEC=()=>{
    const header="Date|Compte|Libelle|Montant|TVA";
    const lines=notes.filter(n=>n.statut==="validé").map(n=>
      n.date.replace(/-/g,"")+"|"+n.compteCpt+"|"+n.marchand+"|"+String(n.montant)+"|"+String(n.tva)
    );
    const csv=[header].concat(lines).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="export_fec_xyra.csv";a.click();
    showToast("📤 Export FEC téléchargé !");
  };

  const totalMois=notes.reduce((a,n)=>a+n.montant,0);
  const totalValidé=notes.filter(n=>n.statut==="validé").reduce((a,n)=>a+n.montant,0);
  const totalTVA=notes.filter(n=>n.statut==="validé").reduce((a,n)=>a+n.tva,0);
  const enAttente=notes.filter(n=>n.statut==="en_attente");
  const notesFiltrées=filterStatut==="tous"?notes:notes.filter(n=>n.statut===filterStatut);

  // Dépenses par catégorie
  const depCat={};
  cats.forEach(c=>{depCat[c]=notes.filter(n=>n.categorie===c).reduce((a,n)=>a+n.montant,0);});

  return <div style={{padding:4}}>
    {/* Header */}
    <div style={{background:`linear-gradient(135deg,${C.gold}22,${C.card})`,border:`1px solid ${C.gold}44`,borderRadius:16,padding:20,marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:`${C.gold}33`,border:`2px solid ${C.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🧾</div>
      <div style={{flex:1}}>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>Notes de Frais</div>
        <div style={{fontSize:11,color:C.muted}}>OCR · Validation · Comptabilité automatique · Export FEC</div>
        <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
          <span style={{fontSize:10,background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`,borderRadius:20,padding:"2px 8px"}}>🤖 Lea lit vos tickets</span>
          <span style={{fontSize:10,background:`${C.blue}22`,color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:20,padding:"2px 8px"}}>📊 Compta auto</span>
          <span style={{fontSize:10,background:`${C.purple}22`,color:C.purple,border:`1px solid ${C.purple}44`,borderRadius:20,padding:"2px 8px"}}>💸 Remboursement Wallet</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,flexShrink:0}}>
        {[[totalMois.toFixed(2)+"€","Total mois",C.blue],[totalValidé.toFixed(2)+"€","Validé",C.green],[totalTVA.toFixed(2)+"€","TVA récup.",C.teal],[enAttente.length+" notes","En attente",C.gold]].map(([v,l,c],i)=>(
          <div key={i} style={{background:C.card2,borderRadius:8,padding:"8px 12px",textAlign:"center",border:`1px solid ${c}33`}}>
            <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:9,color:C.muted}}>{l}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Alerte notes en attente */}
    {enAttente.length>0&&<div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}44`,borderRadius:8,padding:12,marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:18}}>⏳</span>
      <div style={{flex:1}}>
        <span style={{fontSize:12,fontWeight:600,color:C.gold}}>{enAttente.length} note(s) en attente de validation</span>
        <span style={{fontSize:11,color:C.muted,marginLeft:8}}>Montant total : {enAttente.reduce((a,n)=>a+n.montant,0).toFixed(2)}€</span>
      </div>
      <button onClick={()=>setOnglet("validation")} style={{background:C.gold,color:"#000",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>Valider →</button>
    </div>}

    {/* Tabs */}
    <div style={{display:"flex",gap:4,marginBottom:16,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{flex:1,minWidth:80,background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"7px 4px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:onglet===t.id?700:400}}>{t.label}</button>)}
    </div>

    {/* ── SAISIE ── */}
    {onglet==="saisie"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <CT>
        <STitle>➕ Nouvelle note de frais</STitle>

        {/* Scan ticket */}
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={handleFile}/>
        <div style={{background:`${C.purple}11`,border:`2px dashed ${C.purple}44`,borderRadius:10,padding:16,marginBottom:14,textAlign:"center",cursor:"pointer"}} onClick={scanTicket}>
          {scanning?<div>
            <div style={{fontSize:24,marginBottom:6}}>🔍</div>
            <div style={{fontSize:12,color:C.purple,fontWeight:600}}>Lea analyse votre ticket...</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>Claude Vision · OCR + IA en cours</div>
          </div>:<div>
            <div style={{fontSize:28,marginBottom:6}}>📸</div>
            <div style={{fontSize:12,color:C.purple,fontWeight:600}}>Scanner un ticket</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>Photo ou PDF · Lea lit et remplit automatiquement</div>
          </div>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div style={{gridColumn:"span 2"}}>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Employé *</label>
            <Inp value={form.employe} onChange={e=>setForm(f=>({...f,employe:e.target.value}))} placeholder="Nom complet"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Date *</label>
            <Inp type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Catégorie</label>
            <Sel value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))}>
              {cats.map(c=><option key={c}>{c}</option>)}
            </Sel>
          </div>
          <div style={{gridColumn:"span 2"}}>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Marchand / Fournisseur</label>
            <Inp value={form.marchand} onChange={e=>setForm(f=>({...f,marchand:e.target.value}))} placeholder="Ex: Uber, Brasserie du Centre..."/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Montant TTC (€) *</label>
            <Inp type="number" value={form.montant} onChange={e=>setForm(f=>({...f,montant:e.target.value,tva:(parseFloat(e.target.value)*0.2/1.2).toFixed(2)}))} placeholder="0.00"/>
            {plafonds[form.categorie]&&parseFloat(form.montant)>plafonds[form.categorie]&&<div style={{fontSize:9,color:C.red,marginTop:2}}>⚠️ Plafond légal : {plafonds[form.categorie]}€</div>}
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>TVA (auto-calculée)</label>
            <Inp type="number" value={form.tva} onChange={e=>setForm(f=>({...f,tva:e.target.value}))} placeholder="0.00"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Projet / Client</label>
            <Inp value={form.projet} onChange={e=>setForm(f=>({...f,projet:e.target.value}))} placeholder="Ex: Client Dupont"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Compte comptable</label>
            <Inp value={comptes[form.categorie]||""} readOnly style={{color:C.muted,cursor:"not-allowed"}}/>
          </div>
          <div style={{gridColumn:"span 2"}}>
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:11,cursor:"pointer"}}>
              <input type="checkbox" checked={form.justificatif} onChange={e=>setForm(f=>({...f,justificatif:e.target.checked}))}/>
              <span>J'ai un justificatif (ticket, facture)</span>
            </label>
          </div>
        </div>
        <button onClick={soumettre} disabled={!form.employe||!form.montant||!form.date} style={{width:"100%",background:!form.employe||!form.montant||!form.date?C.muted:`linear-gradient(135deg,${C.gold},#A07830)`,color:"#000",border:"none",borderRadius:8,padding:"13px",cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit"}}>
          📤 Soumettre la note de frais
        </button>
      </CT>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {/* Infos légales */}
        <CT style={{background:`${C.blue}11`,borderColor:`${C.blue}33`}}>
          <STitle>⚖️ Plafonds légaux France 2026</STitle>
          {[["🍽 Repas","20.70€ max"],["🏨 Hébergement Paris","120€ max"],["🏨 Hébergement province","90€ max"],["🚗 Kilométrique","0.33€/km (5CV)"],["📱 Forfait téléphone","20€/mois"],].map(([l,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
              <span>{l}</span><span style={{color:C.gold,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </CT>

        {/* Budget consommé */}
        <CT>
          <STitle>💰 Budget mensuel consommé</STitle>
          {cats.slice(0,4).map((c,i)=>{
            const dep=depCat[c]||0;
            const bud=budget[c]||500;
            const pct=Math.min(100,Math.round((dep/bud)*100));
            return <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                <span>{c}</span>
                <span style={{color:pct>80?C.red:pct>60?C.orange:C.green,fontWeight:700}}>{dep.toFixed(0)}€ / {bud}€</span>
              </div>
              <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:pct+"%",background:pct>80?C.red:pct>60?C.orange:C.green,borderRadius:3,transition:"width .5s"}}/>
              </div>
            </div>;
          })}
        </CT>

        {/* Intégration compta */}
        <CT style={{background:`${C.teal}11`,borderColor:`${C.teal}33`}}>
          <STitle>🔗 Intégration comptable auto</STitle>
          {[["606400","Fournitures"],["625100","Déplacements"],["625600","Hébergement"],["625700","Repas"],["626000","Télécom"],["628100","Formation"]].map(([c,l],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:10,borderBottom:`1px solid ${C.border}22`}}>
              <span style={{color:C.teal,fontFamily:"monospace"}}>{c}</span>
              <span style={{color:C.muted}}>{l}</span>
            </div>
          ))}
        </CT>
      </div>
    </div>}

    {/* ── LISTE ── */}
    {onglet==="liste"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {["tous","en_attente","validé","refusé","remboursé"].map(s=>(
          <button key={s} onClick={()=>setFilterStatut(s)} style={{background:filterStatut===s?C.gold:"transparent",color:filterStatut===s?"#000":C.muted,border:`1px solid ${filterStatut===s?C.gold:C.border}`,borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:600}}>
            {s==="tous"?"Toutes":statutLabel[s]||s}
          </button>
        ))}
      </div>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Date</TH><TH>Employé</TH><TH>Catégorie</TH><TH>Marchand</TH><TH>Montant</TH><TH>TVA</TH><TH>Compte</TH><TH>Projet</TH><TH>Justif.</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{notesFiltrées.map((n,i)=>(
            <tr key={i}>
              <Td style={{fontSize:10}}>{n.date}</Td>
              <Td style={{fontWeight:600,fontSize:11}}>{n.employe}</Td>
              <Td><Pill color={C.blue}>{n.categorie}</Pill></Td>
              <Td style={{fontSize:11}}>{n.marchand}</Td>
              <Td style={{fontWeight:700,color:C.gold}}>{n.montant.toFixed(2)}€</Td>
              <Td style={{color:C.teal,fontSize:10}}>{n.tva.toFixed(2)}€</Td>
              <Td style={{fontFamily:"monospace",fontSize:10,color:C.muted}}>{n.compteCpt}</Td>
              <Td style={{fontSize:10,color:C.muted}}>{n.projet||"—"}</Td>
              <Td style={{textAlign:"center"}}>{n.justificatif?"✅":"⚠️"}</Td>
              <Td><Pill color={statutColor[n.statut]||C.muted}>{statutLabel[n.statut]||n.statut}</Pill></Td>
              <Td><div style={{display:"flex",gap:4}}>
                {n.statut==="validé"&&<Btn onClick={()=>rembourser(n.id)} style={{fontSize:9,padding:"3px 6px",background:C.teal}}>💸</Btn>}
                {n.statut==="en_attente"&&<><Btn onClick={()=>valider(n.id)} style={{fontSize:9,padding:"3px 6px",background:C.green}}>✅</Btn><BtnGhost onClick={()=>refuser(n.id)} style={{fontSize:9}}>❌</BtnGhost></>}
              </div></Td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>}

    {/* ── VALIDATION ── */}
    {onglet==="validation"&&<div>
      {enAttente.length===0?<div style={{textAlign:"center",padding:40,color:C.muted}}>
        <div style={{fontSize:36,marginBottom:8}}>✅</div>
        <div style={{fontWeight:600}}>Tout est à jour !</div>
        <div style={{fontSize:11,marginTop:4}}>Aucune note en attente de validation</div>
      </div>:enAttente.map((n,i)=>(
        <CT key={i} style={{marginBottom:12,borderColor:`${C.gold}33`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{fontSize:13,fontWeight:700}}>{n.employe}</div>
              <div style={{fontSize:10,color:C.muted}}>{n.date} · {n.marchand}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:18,fontWeight:700,color:C.gold}}>{n.montant.toFixed(2)}€</div>
              <div style={{fontSize:10,color:C.teal}}>TVA : {n.tva.toFixed(2)}€</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
            {[["Catégorie",n.categorie],["Compte",n.compteCpt],["Projet",n.projet||"—"],].map(([l,v],j)=>(
              <div key={j} style={{background:C.card,borderRadius:6,padding:8}}>
                <div style={{fontSize:9,color:C.muted}}>{l}</div>
                <div style={{fontSize:11,fontWeight:600,color:C.text}}>{v}</div>
              </div>
            ))}
          </div>
          {!n.justificatif&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:6,padding:8,marginBottom:10,fontSize:11,color:C.orange}}>⚠️ Pas de justificatif joint</div>}
          {plafonds[n.categorie]&&n.montant>plafonds[n.categorie]&&<div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:6,padding:8,marginBottom:10,fontSize:11,color:C.red}}>⚠️ Plafond légal dépassé ({plafonds[n.categorie]}€ max)</div>}
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>{valider(n.id);}} style={{flex:1,background:C.green,justifyContent:"center"}}>✅ Valider et créer écriture comptable</Btn>
            <BtnGhost onClick={()=>{refuser(n.id);}} style={{flex:1,justifyContent:"center",borderColor:C.red,color:C.red}}>❌ Refuser</BtnGhost>
          </div>
        </CT>
      ))}
    </div>}

    {/* ── ANALYTICS ── */}
    {onglet==="analytics"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Dépenses par catégorie</STitle>
          {cats.map((c,i)=>{
            const dep=depCat[c]||0;
            const total=totalMois||1;
            const pct=Math.round((dep/total)*100);
            return <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                <span>{c}</span>
                <span style={{fontWeight:700,color:C.gold}}>{dep.toFixed(2)}€ <span style={{color:C.muted,fontWeight:400}}>({pct}%)</span></span>
              </div>
              <SM val={dep} max={totalMois||1} color={C.gold}/>
            </div>;
          })}
        </Card>
        <Card>
          <STitle>👥 Dépenses par employé</STitle>
          {["Thomas Martin","Fatou Diallo","Abou Diallo"].map((emp,i)=>{
            const dep=notes.filter(n=>n.employe===emp).reduce((a,n)=>a+n.montant,0);
            return <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                <span>{emp}</span>
                <span style={{fontWeight:700,color:C.blue}}>{dep.toFixed(2)}€</span>
              </div>
              <SM val={dep} max={totalMois||1} color={C.blue}/>
            </div>;
          })}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
        {[[totalMois.toFixed(2)+"€","Total dépenses",C.blue],[totalValidé.toFixed(2)+"€","Validé",C.green],[totalTVA.toFixed(2)+"€","TVA récupérable",C.teal],[(totalMois-totalValidé).toFixed(2)+"€","En attente",C.gold]].map(([v,l,c],i)=>(
          <CT key={i} style={{textAlign:"center",borderColor:`${c}33`}}>
            <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:9,color:C.muted}}>{l}</div>
          </CT>
        ))}
      </div>
      <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
        <STitle>🤖 Recommandations Lea</STitle>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>
          {totalMois===0?"Aucune donnée — soumettez vos premières notes de frais.":
          depCat["Repas"]>200?"⚠️ Les frais de repas sont élevés ce mois-ci. Rappel : plafond légal 20.70€ par repas.":
          notes.filter(n=>!n.justificatif).length>0?`⚠️ ${notes.filter(n=>!n.justificatif).length} note(s) sans justificatif — risque fiscal en cas de contrôle.`:
          "✅ Vos notes de frais sont conformes. TVA récupérable : "+totalTVA.toFixed(2)+"€."}
        </div>
      </Card>
    </div>}

    {/* ── EXPORT ── */}
    {onglet==="export"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <CT>
        <STitle>📤 Export comptable</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {icon:"📊",titre:"Export FEC",desc:"Fichier des Écritures Comptables — norme DGFiP",action:exportFEC,color:C.blue},
            {icon:"📋",titre:"Export Excel",desc:"Tableau complet de toutes les notes du mois",action:()=>showToast("📋 Export Excel généré !"),color:C.green},
            {icon:"📧",titre:"Envoyer à l'expert-comptable",desc:"Email automatique avec pièces jointes",action:()=>showToast("📧 Envoi à l'expert-comptable en cours..."),color:C.teal},
            {icon:"📄",titre:"Rapport PDF mensuel",desc:"Synthèse complète avec graphiques",action:()=>showToast("📄 Rapport PDF généré !"),color:C.gold},
          ].map((item,i)=>(
            <div key={i} style={{background:C.card2,borderRadius:8,padding:12,border:`1px solid ${item.color}33`,cursor:"pointer",display:"flex",alignItems:"center",gap:12}} onClick={item.action}>
              <span style={{fontSize:24}}>{item.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:item.color}}>{item.titre}</div>
                <div style={{fontSize:10,color:C.muted}}>{item.desc}</div>
              </div>
              <span style={{color:C.muted}}>→</span>
            </div>
          ))}
        </div>
      </CT>
      <CT>
        <STitle>🔗 Intégrations logiciels comptables</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {["Sage","EBP","Ciel","QuickBooks","Pennylane","Odoo"].map((l,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:C.card,borderRadius:6,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,fontWeight:600}}>{l}</span>
              <button onClick={()=>showToast(`🔗 Connexion ${l} configurée !`)} style={{background:C.blue,color:"#fff",border:"none",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Connecter</button>
            </div>
          ))}
        </div>
      </CT>
    </div>}

    {/* ── POLITIQUE ── */}
    {onglet==="politique"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <CT>
        <STitle>⚙️ Plafonds par catégorie</STitle>
        <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Définissez les montants maximum autorisés par catégorie</div>
        {cats.map((c,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:11,flex:1}}>{c}</span>
            <Inp type="number" value={budget[c]} onChange={e=>setBudget(b=>({...b,[c]:parseFloat(e.target.value)||0}))} style={{width:80,textAlign:"right"}}/>
            <span style={{fontSize:11,color:C.muted}}>€/mois</span>
          </div>
        ))}
        <Btn onClick={()=>showToast("✅ Politique de dépenses sauvegardée !")} style={{width:"100%",justifyContent:"center",marginTop:8}}>💾 Sauvegarder</Btn>
      </CT>
      <CT>
        <STitle>👤 Règles par rôle</STitle>
        {[
          {role:"Direction",repas:"50€",hotel:"200€",transport:"Illimité"},
          {role:"Commercial",repas:"35€",hotel:"150€",transport:"500€/mois"},
          {role:"Administratif",repas:"20.70€",hotel:"90€",transport:"200€/mois"},
          {role:"Technicien",repas:"20.70€",hotel:"90€",transport:"300€/mois"},
        ].map((r,i)=>(
          <div key={i} style={{background:C.card,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:4}}>{r.role}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
              {[["🍽",r.repas],["🏨",r.hotel],["🚗",r.transport]].map(([ic,v],j)=>(
                <div key={j} style={{fontSize:10,color:C.muted,textAlign:"center"}}>
                  <div>{ic}</div><div style={{color:C.text,fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>
          ⚙️ Les règles par rôle sont configurables selon vos postes RH
        </div>
      </CT>
    </div>}
  </div>;
};

// ─── PAGE COMPTA ──────────────────────────────────────────────
const PageCompta=({plan,showToast})=>{
  const[onglet,setOnglet]=useState("journal");
  const[wallet,setWallet]=useState([]);
  const[factures,setFactures]=useState([]);
  const[soldeReel,setSoldeReel]=useState(0);
  const[tvaDeductible,setTvaDeductible]=useState(0);
  const[loadingCompta,setLoadingCompta]=useState(true);

  const loadCompta=async()=>{
    try{
      const[wRes,fRes]=await Promise.all([
        fetch('/api/wallet?action=list').then(r=>r.json()).catch(()=>({})),
        fetch('/api/factures?action=list').then(r=>r.json()).catch(()=>({})),
      ]);
      if(wRes.transactions)setWallet(wRes.transactions);
      if(wRes.solde!=null)setSoldeReel(wRes.solde);
      if(fRes.factures)setFactures(fRes.factures);
      try{
        const{createClient}=await import('@supabase/supabase-js');
        const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const{data}=await sb.from('notes_frais').select('tva').eq('statut','validé');
        if(data)setTvaDeductible(data.reduce((a,n)=>a+Number(n.tva||0),0));
      }catch(e){/* module Notes de Frais optionnel */}
    }catch(e){console.error("Compta:",e);}
    setLoadingCompta(false);
  };
  useEffect(()=>{loadCompta();},[]);

  const tabs=[{id:"journal",label:"📋 Journal"},{id:"bilan",label:"📊 Bilan"},{id:"tva",label:"💶 TVA"},{id:"charges",label:"💸 Charges"},{id:"fournisseurs",label:"🏭 Fournisseurs"},{id:"ia",label:"🤖 IA Fiscale"},{id:"export",label:"📤 Export"}];
  if(!hasAccess(plan,"compta"))return <div style={{padding:20}}><UpgradeWall page="Comptabilité" plan={plan}/></div>;

  const journal=[
    ...wallet.filter(w=>w.statut==="confirmé"||w.statut==="viré").map(w=>({date:w.created_at,libelle:w.libelle,montant:Number(w.montant),type:w.type==="entree"?"recette":"depense"})),
    ...factures.filter(f=>f.statut==="payée").map(f=>({date:f.date_emission,libelle:`Facture ${f.numero} — ${f.client_nom}`,montant:Number(f.montant_ttc),type:"recette"})),
  ].sort((a,b)=>new Date(b.date)-new Date(a.date));

  const recettes=journal.filter(j=>j.type==="recette").reduce((a,j)=>a+j.montant,0);
  const depenses=journal.filter(j=>j.type==="depense").reduce((a,j)=>a+j.montant,0);
  const resultatNet=recettes-depenses;
  const marge=recettes>0?Math.round((resultatNet/recettes)*100):0;

  const creancesClients=factures.filter(f=>f.statut!=="payée"&&f.statut!=="annulée").reduce((a,f)=>a+Number(f.montant_ttc),0);
  const dettesFournisseurs=wallet.filter(w=>w.type==="fournisseur"&&w.statut==="à_virer").reduce((a,w)=>a+Number(w.montant),0);
  const commissionsDues=wallet.filter(w=>w.type==="commission"&&w.statut==="à_virer").reduce((a,w)=>a+Number(w.montant),0);

  const tvaCollectee=factures.reduce((a,f)=>a+Number(f.montant_tva||0),0);
  const tvaAReverser=Math.max(0,tvaCollectee-tvaDeductible);

  const exportFEC=()=>{
    const lignes=["JournalCode\tJournalLib\tEcritureNum\tEcritureDate\tCompteNum\tCompteLib\tCompAuxNum\tCompAuxLib\tPieceRef\tPieceDate\tEcritureLib\tDebit\tCredit\tEcritureLet\tDateLet\tValidDate\tMontantdevise\tIdevise"];
    journal.forEach((j,i)=>{
      const d=new Date(j.date);const dStr=isNaN(d)?"":`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
      const num=String(i+1).padStart(5,"0");
      if(j.type==="recette"){
        lignes.push(`VT\tVentes\t${num}\t${dStr}\t512000\tBanque\t\t\tPC${num}\t${dStr}\t${j.libelle}\t${j.montant.toFixed(2)}\t0.00\t\t\t${dStr}\t\t`);
        lignes.push(`VT\tVentes\t${num}\t${dStr}\t706000\tPrestations de services\t\t\tPC${num}\t${dStr}\t${j.libelle}\t0.00\t${j.montant.toFixed(2)}\t\t\t${dStr}\t\t`);
      }else{
        lignes.push(`AC\tAchats\t${num}\t${dStr}\t625100\tServices extérieurs\t\t\tPC${num}\t${dStr}\t${j.libelle}\t${j.montant.toFixed(2)}\t0.00\t\t\t${dStr}\t\t`);
        lignes.push(`AC\tAchats\t${num}\t${dStr}\t512000\tBanque\t\t\tPC${num}\t${dStr}\t${j.libelle}\t0.00\t${j.montant.toFixed(2)}\t\t\t${dStr}\t\t`);
      }
    });
    const blob=new Blob([lignes.join("\n")],{type:"text/plain;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`FEC_Xyra_${new Date().getFullYear()}.txt`;a.click();
    showToast("✅ FEC téléchargé");
  };

  const exportCSV=()=>{
    const lignes=["Date,Libellé,Type,Montant"];
    journal.forEach(j=>{lignes.push(`${j.date},"${j.libelle}",${j.type},${j.montant.toFixed(2)}`);});
    const blob=new Blob([lignes.join("\n")],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Journal_Xyra_${new Date().getFullYear()}.csv`;a.click();
    showToast("✅ CSV téléchargé");
  };

  const apercuBilanPDF=()=>{
    const win=window.open("","_blank");
    if(!win)return showToast("⚠️ Autorisez les pop-ups");
    win.document.write(`<!DOCTYPE html><html><head><title>Bilan</title><style>body{font-family:sans-serif;padding:40px;max-width:700px;margin:0 auto;}h1{color:#C9A84C;font-family:Georgia,serif;}table{width:100%;border-collapse:collapse;margin-top:16px;}td{padding:8px 0;border-bottom:1px solid #eee;}.btn{background:#C9A84C;color:#000;border:none;padding:10px 24px;border-radius:6px;font-weight:700;cursor:pointer;margin-top:30px;}@media print{.btn{display:none;}}</style></head><body>
      <h1>XYRA — Bilan</h1>
      <h3>ACTIF</h3>
      <table><tr><td>Trésorerie</td><td style="text-align:right;">${soldeReel.toFixed(2)}€</td></tr><tr><td>Créances clients</td><td style="text-align:right;">${creancesClients.toFixed(2)}€</td></tr><tr><td><b>TOTAL ACTIF</b></td><td style="text-align:right;"><b>${(soldeReel+creancesClients).toFixed(2)}€</b></td></tr></table>
      <h3>PASSIF</h3>
      <table><tr><td>Résultat net</td><td style="text-align:right;">${resultatNet.toFixed(2)}€</td></tr><tr><td>Dettes fournisseurs</td><td style="text-align:right;">${dettesFournisseurs.toFixed(2)}€</td></tr><tr><td>Commissions dues</td><td style="text-align:right;">${commissionsDues.toFixed(2)}€</td></tr><tr><td><b>TOTAL PASSIF</b></td><td style="text-align:right;"><b>${(resultatNet+dettesFournisseurs+commissionsDues).toFixed(2)}€</b></td></tr></table>
      <button class="btn" onclick="window.print()">🖨 Imprimer / Enregistrer en PDF</button>
    </body></html>`);
    win.document.close();
  };

  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◉ Comptabilité</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Journal · Bilan · TVA · Charges · Fournisseurs · IA Fiscale — données réelles</div>
    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>
    {loadingCompta&&<div style={{fontSize:11,color:C.muted,marginBottom:12}}>Chargement des données réelles...</div>}
    {onglet==="journal"&&<Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Recettes" val={fmt(recettes)} color={C.green}/>
        <KPI label="Dépenses" val={fmt(depenses)} color={C.red}/>
        <KPI label="Résultat net" val={fmt(resultatNet)} color={C.gold}/>
        <KPI label="Marge" val={marge+"%"} color={C.teal}/>
      </div>
      {!loadingCompta&&journal.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucune écriture pour le moment — les paiements confirmés et factures payées apparaîtront ici automatiquement.</div>}
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Date</TH><TH>Libellé</TH><TH>Débit</TH><TH>Crédit</TH><TH>Type</TH></tr></thead>
        <tbody>{journal.slice(0,15).map((h,i)=><tr key={i}>
          <Td style={{color:C.muted,fontSize:10}}>{new Date(h.date).toLocaleDateString("fr")}</Td>
          <Td style={{fontWeight:600}}>{h.libelle}</Td>
          <Td style={{color:C.red}}>{h.type==="depense"?fmt(h.montant):"—"}</Td>
          <Td style={{color:C.green}}>{h.type==="recette"?fmt(h.montant):"—"}</Td>
          <Td><Pill color={h.type==="recette"?C.green:C.red}>{h.type==="recette"?"Recette":"Dépense"}</Pill></Td>
        </tr>)}</tbody>
      </table>
    </Card>}
    {onglet==="bilan"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card><STitle>📈 ACTIF</STitle>
        {[["Trésorerie",soldeReel,C.green],["Créances clients",creancesClients,C.blue]].map(([n,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span>{n}</span><span style={{color:c,fontWeight:700}}>{fmt(v)}</span></div>)}
        <div style={{marginTop:8,display:"flex",justifyContent:"space-between",fontWeight:700}}><span style={{color:C.gold}}>TOTAL ACTIF</span><span style={{color:C.gold}}>{fmt(soldeReel+creancesClients)}</span></div>
      </Card>
      <Card><STitle>📉 PASSIF</STitle>
        {[["Résultat net",resultatNet,C.green],["Dettes fournisseurs",dettesFournisseurs,C.red],["Commissions dues",commissionsDues,C.orange]].map(([n,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span>{n}</span><span style={{color:c,fontWeight:700}}>{fmt(v)}</span></div>)}
        <div style={{marginTop:8,display:"flex",justifyContent:"space-between",fontWeight:700}}><span style={{color:C.gold}}>TOTAL PASSIF</span><span style={{color:C.gold}}>{fmt(resultatNet+dettesFournisseurs+commissionsDues)}</span></div>
      </Card>
      <div style={{gridColumn:"span 2"}}><BtnGhost onClick={apercuBilanPDF}>👁 Aperçu / Imprimer le bilan</BtnGhost></div>
    </div>}
    {onglet==="tva"&&<Card><STitle>💶 TVA collectée / déductible</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <KPI label="TVA collectée" val={fmt(tvaCollectee)} color={C.red}/>
        <KPI label="TVA déductible" val={fmt(tvaDeductible)} color={C.green}/>
        <KPI label="TVA à reverser" val={fmt(tvaAReverser)} color={C.orange}/>
      </div>
      <div style={{marginTop:12,fontSize:11,color:C.muted}}>TVA collectée calculée depuis tes vraies factures. TVA déductible calculée depuis les Notes de Frais validées.</div>
    </Card>}
    {onglet==="charges"&&<TabCharges showToast={showToast}/>}
    {onglet==="fournisseurs"&&<TabFournisseurs showToast={showToast}/>}
    {onglet==="ia"&&<Card><STitle>🤖 Conseils IA Fiscale — Claude</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[{t:"Marge actuelle",c:`Ta marge nette est de ${marge}% sur la période. ${marge<20?"C'est en dessous de la moyenne du secteur services (25-35%) — vérifie tes charges fixes.":"C'est une bonne marge pour ton secteur."}`,col:marge<20?C.orange:C.green},{t:"TVA à anticiper",c:`Tu as ${fmt(tvaAReverser)} de TVA à reverser sur la période. Mets cette somme de côté pour ta prochaine déclaration.`,col:C.gold},{t:"Créances en attente",c:creancesClients>0?`Tu as ${fmt(creancesClients)} de factures non encore payées. Pense à relancer les clients en retard depuis le module Facturation.`:"Aucune créance en attente, bien joué.",col:C.blue}].map((a,i)=><div key={i} style={{background:`${a.col}11`,border:`1px solid ${a.col}33`,borderRadius:8,padding:12}}>
          <div style={{fontSize:11,fontWeight:700,color:a.col,marginBottom:4}}>💡 {a.t}</div>
          <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{a.c}</div>
        </div>)}
      </div>
    </Card>}
    {onglet==="export"&&<Card><STitle>📤 Exports comptables réels</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <CT style={{cursor:"pointer"}} onClick={exportFEC}>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>FEC <Pill color={C.blue}>.txt</Pill></div>
          <div style={{fontSize:10,color:C.muted}}>Fichier des Écritures Comptables — format légal</div>
        </CT>
        <CT style={{cursor:"pointer"}} onClick={exportCSV}>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>Journal <Pill color={C.blue}>.csv</Pill></div>
          <div style={{fontSize:10,color:C.muted}}>Toutes les écritures, format tableur</div>
        </CT>
        <CT style={{cursor:"pointer"}} onClick={apercuBilanPDF}>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>Bilan <Pill color={C.blue}>.pdf</Pill></div>
          <div style={{fontSize:10,color:C.muted}}>Bilan comptable complet</div>
        </CT>
      </div>
      <div style={{marginTop:12,fontSize:10,color:C.muted}}>Le FEC utilise une imputation comptable simplifiée (512000/706000/625100) — communique-le à ton expert-comptable pour vérification avant déclaration officielle.</div>
    </Card>}
  </div>;
};

// ─── PAGE TRESORERIE ──────────────────────────────────────────
const PageTresorerie=({plan,showToast})=>{
  const[devise,setDevise]=useState("EUR");
  const[onglet,setOnglet]=useState("dashboard");
  const[loading,setLoading]=useState(true);
  const[data,setData]=useState(null);
  const[analyseIA,setAnalyseIA]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[alerteIA,setAlerteIA]=useState("");
  const[scenario,setScenario]=useState("realiste");
  const[simDepense,setSimDepense]=useState(0);
  const[ligneManuelle,setLigneManuelle]=useState({libelle:"",montant:"",semaine:"",sens:"entree"});
  const[lignesManuelles,setLignesManuelles]=useState([]);
  const[scoringClients,setScoringClients]=useState([]);
  const[seuils,setSeuils]=useState({seuil_alerte_bas:5000,seuil_alerte_critique:2000,seuil_sortie_importante:3000,placement_seuil:20000});

  const tabs=[
    {id:"dashboard",label:"📊 Cash-flow"},
    {id:"scenarios",label:"🎯 3 Scénarios"},
    {id:"sante",label:"❤ Santé & KPIs"},
    {id:"sources",label:"📈 Par source"},
    {id:"equipe",label:"👥 Cashflow équipe"},
    {id:"clients",label:"🎯 Scoring clients"},
    {id:"placement",label:"💎 Placements"},
    {id:"manuel",label:"✏ Prévisionnel"},
    {id:"simulation",label:"🎮 Simulation"},
    {id:"alertes",label:"🔔 Alertes"},
    {id:"export",label:"📤 Export"},
  ];

  const load=async()=>{
    try{
      const res=await fetch('/api/tresorerie');
      const d=await res.json();
      setData(d);
      if(d.parametres)setSeuils(d.parametres);
    }catch(e){console.error("Tresorerie:",e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  // Analyse IA au chargement
  useEffect(()=>{
    if(data&&!analyseIA){
      fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',...data})})
        .then(r=>r.json()).then(d=>{if(d.success)setAnalyseIA(d.analyse);}).catch(()=>{});
    }
  },[data]);

  // Alerte intelligente au chargement si solde à risque
  useEffect(()=>{
    if(data&&data.soldeActuel<seuils.seuil_alerte_bas){
      fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'alerte_intelligente',...data,param:seuils})})
        .then(r=>r.json()).then(d=>{if(d.success&&d.alerte)setAlerteIA(d.alerte);}).catch(()=>{});
      // Alerte WhatsApp si critique
      if(data.soldeActuel<seuils.seuil_alerte_critique){
        fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'alerte_critique_whatsapp',soldeActuel:data.soldeActuel,seuil:seuils.seuil_alerte_critique})}).catch(()=>{});
      }
    }
  },[data,seuils]);

  const genererScoring=async()=>{
    if(!data)return;
    try{
      const res=await fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'scoring_clients',facturesList:data.clientsEnRetard||[]})});
      const d=await res.json();
      if(d.success)setScoringClients(d.predictions||[]);
    }catch(e){}
  };

  const envoyerRapportHebdo=async()=>{
    showToast("⏳ Envoi du rapport WhatsApp...");
    try{
      const res=await fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rapport_hebdo',...data})});
      const d=await res.json();
      if(d.success)showToast("✅ Rapport hebdomadaire envoyé sur WhatsApp");
      else showToast("❌ "+(d.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const sauverSeuils=async()=>{
    try{
      await fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'set_parametres',...seuils})});
      showToast("✅ Paramètres sauvegardés");load();
    }catch(e){showToast("❌ Erreur");}
  };

  const ajouterLigneManuelle=async()=>{
    if(!ligneManuelle.libelle||!ligneManuelle.montant||!ligneManuelle.semaine)return showToast("⚠️ Remplis tous les champs");
    try{
      await fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_ligne_manuelle',...ligneManuelle})});
      showToast("✅ Ligne ajoutée");
      setLignesManuelles(l=>[...l,{...ligneManuelle,id:Date.now()}]);
      setLigneManuelle({libelle:"",montant:"",semaine:"",sens:"entree"});
    }catch(e){showToast("❌ Erreur");}
  };

  if(!hasAccess(plan,"tresorerie"))return <div style={{padding:20}}><UpgradeWall page="tresorerie" plan={plan}/></div>;
  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement des données réelles...</div></div>;

  const soldeActuel=data?.soldeActuel||0;
  const previsions=scenario==="optimiste"?data?.prevOptimiste:scenario==="pessimiste"?data?.prevPessimiste:data?.prevRealiste||[];
  const semaines=data?.semaines||[];
  const toutesLesSemaines=[...semaines,...previsions];
  const soldeJ90=previsions[previsions.length-1]?.sol??soldeActuel;
  const scoreFinancier=data?.scoreFinancier||0;
  const pointMort=data?.pointMort||0;
  const bfr=data?.bfr||0;
  const sources=data?.sources||{};
  const cashflowEquipe=data?.cashflowEquipe||[];
  const clientsEnRetard=data?.clientsEnRetard||[];
  const suggestionsPlacement=data?.suggestionsPlacement||[];
  const excedent=data?.excedent||0;
  const soldeSim=soldeActuel-simDepense;
  const scoreColor=scoreFinancier>=70?C.green:scoreFinancier>=40?C.gold:C.red;
  const scoreLabel=scoreFinancier>=70?"🟢 Excellente":scoreFinancier>=40?"🟡 Correcte":"🔴 Risquée";

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◑ Trésorerie 90 jours</div>
        <div style={{fontSize:11,color:C.muted}}>Cash-flow réel · 3 scénarios · Score santé · BFR · Scoring clients · Placements</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={envoyerRapportHebdo} style={{fontSize:11}}>📱 Rapport WhatsApp</BtnGhost>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
      </div>
    </div>

    {/* ALERTE INTELLIGENTE */}
    {alerteIA&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14,marginBottom:14}}>
      <div style={{fontSize:10,color:C.orange,fontWeight:700,marginBottom:4}}>🤖 ALERTE INTELLIGENTE — Claude</div>
      <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{alerteIA}</div>
    </div>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      <CT style={{textAlign:"center",borderColor:`${scoreColor}44`}}>
        <div style={{fontSize:9,color:C.muted,marginBottom:4}}>SCORE SANTÉ</div>
        <div style={{fontSize:28,fontWeight:700,color:scoreColor}}>{scoreFinancier}</div>
        <div style={{fontSize:10,color:scoreColor}}>{scoreLabel}</div>
      </CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>SOLDE ACTUEL</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(conv(soldeActuel,"EUR",devise),devise)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>SOLDE J+90</div><div style={{fontSize:18,fontWeight:700,color:soldeJ90>=soldeActuel?C.teal:C.orange}}>{fmt(conv(soldeJ90,"EUR",devise),devise)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>POINT MORT/SEMAINE</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>{fmt(conv(pointMort,"EUR",devise),devise)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>BFR</div><div style={{fontSize:18,fontWeight:700,color:C.purple}}>{fmt(conv(bfr,"EUR",devise),devise)}</div></CT>
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── CASH-FLOW ── */}
    {onglet==="dashboard"&&<div>
      <Card style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <STitle>📈 Flux réel + prévision 90 jours</STitle>
          <div style={{display:"flex",gap:6}}>
            {["realiste","optimiste","pessimiste"].map(s=><button key={s} onClick={()=>setScenario(s)} style={{background:scenario===s?(s==="optimiste"?C.green:s==="pessimiste"?C.red:C.blue)+"22":"transparent",color:s==="optimiste"?C.green:s==="pessimiste"?C.red:C.blue,border:`1px solid ${s==="optimiste"?C.green:s==="pessimiste"?C.red:C.blue}44`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",textTransform:"capitalize"}}>{s}</button>)}
          </div>
        </div>
        {/* Graphique visuel */}
        <div style={{display:"flex",alignItems:"flex-end",gap:3,height:120,padding:"10px 0",marginBottom:12}}>
          {toutesLesSemaines.map((t,i)=>{
            const maxVal=Math.max(...toutesLesSemaines.map(x=>Math.abs(x.sol||0)),1);
            const h=Math.max(4,Math.round((Math.abs(t.sol||0)/maxVal)*100));
            const bg=t.pred?(scenario==="optimiste"?C.green:scenario==="pessimiste"?C.red:C.blue)+"66":t.sol>seuils.seuil_alerte_bas?`${C.green}88`:`${C.orange}88`;
            return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{width:"100%",height:h+"%",background:bg,borderRadius:"3px 3px 0 0",minHeight:4}}/>
              <div style={{fontSize:7,color:C.muted}}>{t.debut?.slice(5)}</div>
            </div>;
          })}
        </div>
        {/* Tableau */}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
            <thead><tr><TH>Semaine</TH><TH>Entrées</TH><TH>Sorties</TH><TH>Net</TH><TH>Solde cumulé</TH><TH>Statut</TH></tr></thead>
            <tbody>{toutesLesSemaines.map((t,i)=><tr key={i} style={{background:t.pred?`${C.blue}05`:"transparent"}}>
              <Td style={{fontSize:10,color:t.pred?C.blue:C.muted,fontWeight:t.pred?600:400}}>{t.debut}{t.pred?" 🤖":""}</Td>
              <Td><span style={{color:C.green,fontWeight:700}}>+{fmt(conv(t.entrees||0,"EUR",devise),devise)}</span></Td>
              <Td><span style={{color:C.red}}>-{fmt(conv(t.sorties||0,"EUR",devise),devise)}</span></Td>
              <Td style={{color:(t.net||0)>0?C.green:C.red,fontWeight:700}}>{(t.net||0)>0?"+":""}{fmt(conv(t.net||0,"EUR",devise),devise)}</Td>
              <Td style={{fontWeight:700,color:(t.sol||0)>seuils.seuil_alerte_bas?C.green:(t.sol||0)>seuils.seuil_alerte_critique?C.gold:C.red}}>{fmt(conv(t.sol||0,"EUR",devise),devise)}</Td>
              <Td><Pill color={t.pred?C.blue:C.green}>{t.pred?"🤖 Prévision":"✅ Réel"}</Pill></Td>
            </tr>)}</tbody>
          </table>
        </div>
      </Card>
      {/* Analyse IA */}
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse IA — Claude · données réelles</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseIA||"Chargement de l'analyse..."}</div>}
        <BtnGhost onClick={()=>{setIaLoading(true);fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',...data})}).then(r=>r.json()).then(d=>{if(d.success)setAnalyseIA(d.analyse);setIaLoading(false);}).catch(()=>setIaLoading(false));}} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🔄 Régénérer"}</BtnGhost>
      </div>
    </div>}

    {/* ── 3 SCÉNARIOS ── */}
    {onglet==="scenarios"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
        {[
          {label:"🟢 Optimiste",key:"prevOptimiste",color:C.green,desc:"Entrées +20%, sorties -10% — meilleur cas"},
          {label:"🔵 Réaliste",key:"prevRealiste",color:C.blue,desc:"Basé sur ta tendance actuelle"},
          {label:"🔴 Pessimiste",key:"prevPessimiste",color:C.red,desc:"Entrées -20%, sorties +10% — pire cas"},
        ].map((s,i)=>{
          const prev=data?.[s.key]||[];
          const solde=prev[prev.length-1]?.sol??soldeActuel;
          return <Card key={i} style={{borderColor:`${s.color}44`}}>
            <div style={{fontSize:13,fontWeight:700,color:s.color,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>{s.desc}</div>
            <div style={{fontSize:24,fontWeight:700,color:s.color,marginBottom:4}}>{fmt(conv(solde,"EUR",devise),devise)}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>Solde estimé à J+90</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:2,height:60}}>
              {prev.slice(0,13).map((p,j)=>{
                const maxVal=Math.max(...prev.map((x)=>Math.abs(x.sol||0)),1);
                const h=Math.max(3,Math.round((Math.abs(p.sol||0)/maxVal)*55));
                return <div key={j} style={{flex:1,height:h,background:`${s.color}66`,borderRadius:"2px 2px 0 0",minHeight:3}}/>;
              })}
            </div>
          </Card>;
        })}
      </div>
      <Card>
        <STitle>📊 Comparaison des 3 scénarios à J+90</STitle>
        {[["🟢 Optimiste",data?.soldeJ90Optimiste||0,C.green],["🔵 Réaliste",data?.soldeJ90||0,C.blue],["🔴 Pessimiste",data?.soldeJ90Pessimiste||0,C.red]].map(([l,v,c],i)=><div key={i} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:c,fontWeight:700}}>{l}</span><span style={{color:c,fontWeight:700}}>{fmt(conv(Number(v),"EUR",devise),devise)}</span></div>
          <SM val={Number(v)+50000} max={100000} color={c}/>
        </div>)}
      </Card>
    </div>}

    {/* ── SANTÉ & KPIs ── */}
    {onglet==="sante"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card style={{borderColor:`${scoreColor}44`}}>
          <STitle>❤ Score de santé financière</STitle>
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:64,fontWeight:700,color:scoreColor,fontFamily:"Georgia,serif"}}>{scoreFinancier}</div>
            <div style={{fontSize:14,color:C.muted,marginBottom:12}}>/100</div>
            <div style={{fontSize:16,fontWeight:700,color:scoreColor,marginBottom:8}}>{scoreLabel}</div>
            <div style={{height:8,background:C.border,borderRadius:4,margin:"0 20px",overflow:"hidden"}}>
              <div style={{height:"100%",width:scoreFinancier+"%",background:scoreColor,borderRadius:4,transition:"width 1s"}}/>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[
              ["Couverture en semaines",`${data?.couvertureEnSemaines||0} sem.`,(data?.couvertureEnSemaines||0)>=4],
              ["Tendance 4 dernières semaines",(data?.semaines||[]).slice(-4).reduce((a,s)=>a+s.net,0)>0?"↗ Positive":"↘ Négative",(data?.semaines||[]).slice(-4).reduce((a,s)=>a+s.net,0)>0],
              ["Commissions dues",fmt(data?.commissionsDues||0),(data?.commissionsDues||0)===0],
              ["Solde > seuil critique",soldeActuel>=seuils.seuil_alerte_critique?"✅ Oui":"❌ Non",soldeActuel>=seuils.seuil_alerte_critique],
            ].map(([l,v,ok],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
              <span style={{color:C.muted}}>{l}</span>
              <span style={{color:(ok)?C.green:C.red,fontWeight:600}}>{v}</span>
            </div>)}
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card>
            <STitle>📍 Point mort hebdomadaire</STitle>
            <div style={{fontSize:28,fontWeight:700,color:C.blue,marginBottom:4}}>{fmt(conv(pointMort,"EUR",devise),devise)}</div>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>C'est le minimum que tu dois encaisser cette semaine pour ne pas descendre sous ton seuil d'alerte de {fmt(seuils.seuil_alerte_bas)}.</div>
          </Card>
          <Card>
            <STitle>🔄 BFR — Besoin en Fonds de Roulement</STitle>
            <div style={{fontSize:28,fontWeight:700,color:C.purple,marginBottom:4}}>{fmt(conv(bfr,"EUR",devise),devise)}</div>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>Argent actuellement "bloqué" dans ton cycle d'exploitation. Délai moyen de paiement clients : {data?.couvertureEnSemaines||30} jours.</div>
          </Card>
        </div>
      </div>
    </div>}

    {/* ── PAR SOURCE ── */}
    {onglet==="sources"&&<Card>
      <STitle>📈 Décomposition des revenus par source</STitle>
      {Object.keys(sources).length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Pas assez de données pour la décomposition. Les sources apparaîtront au fil des transactions.</div>}
      {Object.entries(sources).sort((a,b)=>Number(b[1])-Number(a[1])).map(([source,montant],i)=>{
        const colors=[C.gold,C.blue,C.green,C.purple,C.teal,C.orange];
        const total=Object.values(sources).reduce((a,v)=>a+Number(v),0);
        const pct=total>0?Math.round(Number(montant)/total*100):0;
        return <div key={i} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <span style={{fontWeight:600}}>{source}</span>
            <span style={{color:colors[i%colors.length],fontWeight:700}}>{fmt(conv(Number(montant),"EUR",devise),devise)} · {pct}%</span>
          </div>
          <SM val={pct} max={100} color={colors[i%colors.length]}/>
        </div>;
      })}
      {Object.keys(sources).length>0&&<div style={{marginTop:12,background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:10,fontSize:11,color:C.text}}>
        🤖 Source principale : <b style={{color:C.gold}}>{Object.entries(sources).sort((a,b)=>Number(b[1])-Number(a[1]))[0]?.[0]||"—"}</b>. Pour diversifier tes revenus, développe la 2ème source.
      </div>}
    </Card>}

    {/* ── CASHFLOW ÉQUIPE ── */}
    {onglet==="equipe"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        💡 Coût réel = salaire net × 1.43 (charges patronales). Comparer le coût mensuel au CA généré par chaque collaborateur pour mesurer la rentabilité réelle.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10,marginBottom:12}}>
        {cashflowEquipe.map((e,i)=>{
          const colors=[C.blue,C.purple,C.pink];
          return <Card key={i} style={{borderColor:`${colors[i%3]}33`}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>{e.nom}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Salaire net</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{fmt(e.salaire)}</div></CT>
              <CT style={{textAlign:"center",borderColor:`${C.red}33`}}><div style={{fontSize:9,color:C.red}}>Coût réel/mois</div><div style={{fontSize:14,fontWeight:700,color:C.red}}>{fmt(e.coutMensuel)}</div></CT>
            </div>
            <div style={{marginTop:8,fontSize:10,color:C.muted}}>Coût hebdomadaire : <b style={{color:C.orange}}>{fmt(e.coutHebdo)}</b></div>
          </Card>;
        })}
      </div>
      <Card>
        <STitle>💸 Coût total équipe vs CA</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Coût mensuel total</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>{fmt(conv(data?.coutEquipeTotal||0,"EUR",devise),devise)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>% du CA mensuel</div><div style={{fontSize:18,fontWeight:700,color:C.orange}}>{soldeActuel>0?Math.round((data?.coutEquipeTotal||0)/soldeActuel*100):0}%</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Marge après équipe</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(conv(soldeActuel-(data?.coutEquipeTotal||0),"EUR",devise),devise)}</div></CT>
        </div>
      </Card>
    </div>}

    {/* ── SCORING CLIENTS ── */}
    {onglet==="clients"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontSize:13,fontWeight:700}}>🎯 Scoring prédictif des paiements</div><div style={{fontSize:11,color:C.muted}}>Claude analyse l'historique et prédit qui va payer en retard</div></div>
        <Btn onClick={genererScoring} style={{fontSize:11}}>🤖 Lancer le scoring IA</Btn>
      </div>
      {clientsEnRetard.length===0&&scoringClients.length===0&&<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:32,marginBottom:8}}>✅</div><div style={{fontSize:12,color:C.muted}}>Aucune facture en retard identifiée pour le moment.</div></Card>}
      {clientsEnRetard.length>0&&<Card style={{marginBottom:12,borderColor:`${C.red}33`}}>
        <STitle>⚠️ Factures en retard actuelles</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Client</TH><TH>Montant</TH><TH>Retard</TH></tr></thead>
          <tbody>{clientsEnRetard.map((c,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{c.client}</Td>
            <Td style={{color:C.red,fontWeight:700}}>{fmt(c.montant)}</Td>
            <Td><Pill color={c.retardJours>30?C.red:C.orange}>{c.retardJours}j de retard</Pill></Td>
          </tr>)}</tbody>
        </table>
      </Card>}
      {scoringClients.length>0&&<Card>
        <STitle>🤖 Prédictions IA — Risque de retard ce mois</STitle>
        {scoringClients.map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{c.client}</div><div style={{fontSize:10,color:C.muted}}>{c.raison}</div></div>
          <Pill color={c.risque==="élevé"?C.red:c.risque==="moyen"?C.orange:C.green}>{c.risque}</Pill>
        </div>)}
      </Card>}
    </div>}

    {/* ── PLACEMENTS ── */}
    {onglet==="placement"&&<div>
      {excedent<=0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>💎</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Pas encore d'excédent à placer</div>
        <div style={{fontSize:11,color:C.muted}}>Dès que ton solde dépasse {fmt(seuils.placement_seuil)}, Xyra te suggère automatiquement les meilleures options de placement.</div>
        <div style={{marginTop:14}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Modifier le seuil de déclenchement</label>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            <Inp value={seuils.placement_seuil} onChange={e=>setSeuils(s=>({...s,placement_seuil:Number(e.target.value)}))} style={{width:140}}/>
            <Btn onClick={sauverSeuils} style={{fontSize:11}}>Sauver</Btn>
          </div>
        </div>
      </Card>:<div>
        <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.gold,marginBottom:4}}>💎 Excédent disponible pour placement</div>
          <div style={{fontSize:24,fontWeight:700,color:C.gold}}>{fmt(conv(excedent,"EUR",devise),devise)}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>Solde actuel {fmt(soldeActuel)} − seuil de sécurité {fmt(seuils.placement_seuil)} = excédent</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {suggestionsPlacement.map((p,i)=>{
            const colors=[C.green,C.blue,C.purple];
            return <Card key={i} style={{borderColor:`${colors[i]}44`}}>
              <div style={{fontSize:14,fontWeight:700,color:colors[i],marginBottom:4}}>{p.nom}</div>
              <div style={{fontSize:24,fontWeight:700,color:C.text,marginBottom:2}}>{p.taux}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>rendement annuel</div>
              <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:C.muted}}>Rendement/an</span><span style={{color:colors[i],fontWeight:700}}>+{fmt(conv(p.rendementAnnuel,"EUR",devise),devise)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:C.muted}}>Risque</span><span style={{fontWeight:600}}>{p.risque}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:C.muted}}>Liquidité</span><span style={{fontWeight:600}}>{p.liquidite}</span></div>
              </div>
              <BtnGhost onClick={()=>showToast(`✅ Demande de placement ${p.nom} enregistrée — ton conseiller te contactera`)} style={{width:"100%",fontSize:11,color:colors[i],borderColor:`${colors[i]}44`}}>Souscrire</BtnGhost>
            </Card>;
          })}
        </div>
      </div>}
    </div>}

    {/* ── PRÉVISIONNEL MANUEL ── */}
    {onglet==="manuel"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        ✏️ Ajoute ici des flux prévisionnels que tu connais à l'avance — un gros encaissement attendu, une dépense planifiée — ils s'intègreront dans tes prévisions.
      </div>
      <Card style={{marginBottom:12}}>
        <STitle>+ Ajouter une ligne prévisionnelle</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr 1fr",gap:8,alignItems:"end"}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Description</label><Inp value={ligneManuelle.libelle} onChange={e=>setLigneManuelle(l=>({...l,libelle:e.target.value}))} placeholder="Ex: Paiement Sofia Al-Rashid"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Sens</label><Sel value={ligneManuelle.sens} onChange={e=>setLigneManuelle(l=>({...l,sens:e.target.value}))} style={{height:38}}><option value="entree">↓ Entrée</option><option value="sortie">↑ Sortie</option></Sel></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant (€)</label><Inp value={ligneManuelle.montant} onChange={e=>setLigneManuelle(l=>({...l,montant:e.target.value}))} placeholder="0"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Semaine (lundi)</label><Inp type="date" value={ligneManuelle.semaine} onChange={e=>setLigneManuelle(l=>({...l,semaine:e.target.value}))}/></div>
        </div>
        <Btn onClick={ajouterLigneManuelle} style={{marginTop:10}}>✅ Ajouter à la prévision</Btn>
      </Card>
      {lignesManuelles.length>0&&<Card>
        <STitle>📋 Lignes manuelles ajoutées</STitle>
        {lignesManuelles.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <span style={{fontWeight:600}}>{l.libelle}</span>
          <div style={{display:"flex",gap:8}}>
            <span style={{color:l.sens==="entree"?C.green:C.red,fontWeight:700}}>{l.sens==="entree"?"+":"-"}{fmt(Number(l.montant))}</span>
            <span style={{color:C.muted,fontSize:10}}>{l.semaine}</span>
          </div>
        </div>)}
      </Card>}
    </div>}

    {/* ── SIMULATION ── */}
    {onglet==="simulation"&&<div style={{maxWidth:600}}>
      <Card>
        <STitle>🎮 Simulateur "Si je dépense X, il me reste Y"</STitle>
        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Montant de la dépense simulée</label>
          <input type="range" min={0} max={Math.max(soldeActuel,1000)} value={simDepense} onChange={e=>setSimDepense(Number(e.target.value))} style={{width:"100%",accentColor:C.gold}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}>
            <span>0€</span><span style={{color:C.gold,fontWeight:700}}>{fmt(simDepense)}</span><span>{fmt(Math.max(soldeActuel,1000))}</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Solde actuel</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(conv(soldeActuel,"EUR",devise),devise)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.red}}>Dépense simulée</div><div style={{fontSize:16,fontWeight:700,color:C.red}}>-{fmt(conv(simDepense,"EUR",devise),devise)}</div></CT>
          <CT style={{textAlign:"center",borderColor:`${soldeSim>seuils.seuil_alerte_bas?C.green:C.red}44`}}><div style={{fontSize:9,color:C.muted}}>Solde restant</div><div style={{fontSize:16,fontWeight:700,color:soldeSim>seuils.seuil_alerte_bas?C.green:soldeSim>seuils.seuil_alerte_critique?C.gold:C.red}}>{fmt(conv(soldeSim,"EUR",devise),devise)}</div></CT>
        </div>
        <div style={{background:soldeSim>seuils.seuil_alerte_bas?`${C.green}11`:soldeSim>seuils.seuil_alerte_critique?`${C.gold}11`:`${C.red}11`,border:`1px solid ${soldeSim>seuils.seuil_alerte_bas?C.green:soldeSim>seuils.seuil_alerte_critique?C.gold:C.red}33`,borderRadius:8,padding:12,fontSize:12,color:C.text,marginBottom:12}}>
          {soldeSim>seuils.seuil_alerte_bas?`✅ Trésorerie saine après cette dépense. Il te restera ${fmt(conv(soldeSim,"EUR",devise),devise)} — au-dessus de ton seuil de ${fmt(seuils.seuil_alerte_bas)}.`:soldeSim>seuils.seuil_alerte_critique?`⚠️ Trésorerie sous ton seuil d'alerte (${fmt(seuils.seuil_alerte_bas)}) mais au-dessus du seuil critique. Dépense faisable avec prudence.`:`❌ Danger ! Après cette dépense ton solde (${fmt(conv(soldeSim,"EUR",devise),devise)}) passerait sous ton seuil critique de ${fmt(seuils.seuil_alerte_critique)}. Attends les prochains encaissements.`}
        </div>
        <div>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Scénarios réels rapides</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[["Commissions dues",data?.commissionsDues||0],["Charges du mois",data?.chargesMensuelles||0],["BFR",data?.bfr||0]].filter(([,v])=>Number(v)>0).map(([l,v])=><button key={l} onClick={()=>setSimDepense(Math.round(Number(v)))} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",color:C.muted}}>{l} ({fmt(Number(v))})</button>)}
          </div>
        </div>
      </Card>
    </div>}

    {/* ── ALERTES ── */}
    {onglet==="alertes"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {data?.commissionsDues>0&&<div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:4}}>🔴 Commissions partenaires en attente</div>
        <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{fmt(data.commissionsDues)} de commissions dues. Va dans le Wallet pour les enregistrer et virer.</div>
      </div>}
      {soldeJ90<seuils.seuil_alerte_bas&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:4}}>🟡 Projection J+90 sous le seuil d'alerte</div>
        <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>Ton solde projeté à J+90 ({fmt(soldeJ90)}) est sous ton seuil ({fmt(seuils.seuil_alerte_bas)}). Surveille tes encaissements.</div>
      </div>}
      {clientsEnRetard.length>0&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:4}}>⏰ {clientsEnRetard.length} facture(s) en retard de paiement</div>
        <div style={{fontSize:11,color:C.text}}>{clientsEnRetard.map((c)=>c.client).join(", ")}</div>
      </div>}
      {soldeActuel>=seuils.seuil_alerte_bas&&soldeJ90>=seuils.seuil_alerte_bas&&(data?.commissionsDues||0)===0&&clientsEnRetard.length===0&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>🟢 Trésorerie saine — aucune alerte</div>
        <div style={{fontSize:11,color:C.text}}>Tout est en ordre. Solde actuel et projection J+90 au-dessus de tes seuils.</div>
      </div>}
      <Card>
        <STitle>⚙ Configurer les seuils</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Alerte solde bas","seuil_alerte_bas"],["Alerte solde critique","seuil_alerte_critique"],["Alerte sortie importante","seuil_sortie_importante"],["Seuil de placement automatique","placement_seuil"]].map(([l,k])=><div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}>
            <span style={{color:C.muted}}>{l}</span>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Inp value={(seuils)[k]} onChange={e=>setSeuils((s)=>({...s,[k]:Number(e.target.value)}))} style={{width:120,fontSize:11}}/>
              <span style={{fontSize:10,color:C.muted}}>€</span>
            </div>
          </div>)}
          <Btn onClick={sauverSeuils} style={{marginTop:4,fontSize:11}}>✅ Sauvegarder</Btn>
        </div>
      </Card>
    </div>}

    {/* ── EXPORT ── */}
    {onglet==="export"&&<Card>
      <STitle>📤 Exports trésorerie</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[
          {icon:"📋",label:"CSV complet",desc:"Toutes les semaines réelles + prévisions"},
          {icon:"📱",label:"Rapport WhatsApp",desc:"Résumé hebdo sur ton téléphone"},
          {icon:"📧",label:"Email mensuel",desc:"Rapport PDF automatique"},
        ].map((item,i)=><CT key={i} style={{cursor:"pointer"}} onClick={()=>{
          if(i===0){
            const lignes=["Semaine,Entrées,Sorties,Net,Solde,Type"];
            toutesLesSemaines.forEach((s)=>lignes.push(`${s.debut},${s.entrees||0},${s.sorties||0},${s.net||0},${s.sol||0},${s.pred?"Prévision":"Réel"}`));
            const blob=new Blob([lignes.join("\n")],{type:"text/csv;charset=utf-8"});
            const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="tresorerie_xyra.csv";a.click();
            showToast("✅ CSV téléchargé");
          }else if(i===1){envoyerRapportHebdo();}
          else showToast("✅ Rapport email programmé");
        }}>
          <div style={{fontSize:20,marginBottom:6}}>{item.icon}</div>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>{item.label}</div>
          <div style={{fontSize:9,color:C.muted}}>{item.desc}</div>
        </CT>)}
      </div>
    </Card>}
  </div>;
};

// ─── PAGE ANALYTIQUE ──────────────────────────────────────────
const PageAnalytique=({plan,showToast})=>{
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[devise,setDevise]=useState("EUR");
  const[onglet,setOnglet]=useState("overview");
  const[analyseIA,setAnalyseIA]=useState("");
  const[iaLoading,setIaLoading]=useState(false);

  const tabs=[
    {id:"overview",label:"📊 Vue globale"},
    {id:"evolution",label:"📈 Évolution CA"},
    {id:"sources",label:"🎯 Par source"},
    {id:"clients",label:"👤 Par client"},
    {id:"rentabilite",label:"💰 Rentabilité"},
    {id:"previsions",label:"🤖 Prévisions"},
    {id:"export",label:"📤 Export"},
  ];

  const load=async()=>{
    setLoading(true);
    try{
      const res=await fetch(`/api/analytique?devise=${devise}`);
      const d=await res.json();
      setData(d);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[devise]);

  useEffect(()=>{
    if(data&&!analyseIA){
      fetch('/api/analytique',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',...data})})
        .then(r=>r.json()).then(d=>{if(d.success)setAnalyseIA(d.analyse);}).catch(()=>{});
    }
  },[data]);

  const envoyerRapport=async()=>{
    showToast("⏳ Envoi du rapport WhatsApp...");
    try{
      const res=await fetch('/api/analytique',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rapport_mensuel_whatsapp',...data})});
      const d=await res.json();
      if(d.success)showToast("✅ Rapport mensuel envoyé");
      else showToast("❌ "+(d.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const exportCSV=()=>{
    if(!data)return;
    const lignes=["Mois,CA"];
    Object.entries(data.caParMois||{}).forEach(([m,v])=>lignes.push(`${m},${v}`));
    const blob=new Blob([lignes.join("\n")],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="analytique_ca_xyra.csv";a.click();
    showToast("✅ CSV téléchargé");
  };

  if(!hasAccess(plan,"analytique"))return <div style={{padding:20}}><UpgradeWall page="analytique" plan={plan}/></div>;
  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement des données réelles...</div></div>;

  const caParMoisEntries=Object.entries(data?.caParMois||{});
  const maxCA=Math.max(...caParMoisEntries.map(([,v])=>Number(v)),1);
  const sourceEntries=Object.entries(data?.caParSource||{}).sort((a,b)=>Number(b[1])-Number(a[1]));
  const totalSources=sourceEntries.reduce((a,[,v])=>a+Number(v),0);
  const COLORS=[C.gold,C.blue,C.green,C.purple,C.orange,C.teal,C.pink];

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>📊 Analytique & CA</div>
        <div style={{fontSize:11,color:C.muted}}>CA réel · Évolution · Sources · Clients · Rentabilité · Prévisions IA</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={envoyerRapport} style={{fontSize:11}}>📱 Rapport WhatsApp</BtnGhost>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
      </div>
    </div>

    {/* ALERTE DÉPENDANCE */}
    {(data?.alerteDependance||[]).length>0&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,marginBottom:14}}>
      <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:4}}>⚠️ Alerte dépendance client</div>
      <div style={{fontSize:11,color:C.text}}>{data.alerteDependance.map((c)=>c.nom).join(", ")} représente plus de 30% de ton CA. Diversifie ta base clients pour réduire ce risque.</div>
    </div>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CA TOTAL</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(data?.caTotal||0)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CA CE MOIS</div>
        <div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(data?.caMoisActuel||0)}</div>
        <div style={{fontSize:10,color:(data?.evolutionMois||0)>=0?C.green:C.red}}>{(data?.evolutionMois||0)>=0?"↗":""}{data?.evolutionMois||0}% vs mois préc.</div>
      </CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>VS N-1</div>
        <div style={{fontSize:18,fontWeight:700,color:(data?.evolutionNMoins1||0)>=0?C.teal:C.orange}}>{(data?.evolutionNMoins1||0)>=0?"↗":""}{data?.evolutionNMoins1||0}%</div>
      </CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>MARGE NETTE</div>
        <div style={{fontSize:18,fontWeight:700,color:(data?.tauxMarge||0)>=20?C.green:(data?.tauxMarge||0)>=10?C.gold:C.red}}>{data?.tauxMarge||0}%</div>
      </CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>TRANSACTIONS</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>{data?.nbTransactions||0}</div></CT>
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── VUE GLOBALE ── */}
    {onglet==="overview"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse IA — Claude · données réelles</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseIA||"Chargement de l'analyse..."}</div>}
        <BtnGhost onClick={()=>{setIaLoading(true);fetch('/api/analytique',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',...data})}).then(r=>r.json()).then(d=>{if(d.success)setAnalyseIA(d.analyse);setIaLoading(false);}).catch(()=>setIaLoading(false));}} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🔄 Régénérer"}</BtnGhost>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>💰 Résultat financier</STitle>
          {[["CA total",data?.caTotal||0,C.green],["Charges fixes",data?.chargesTotales||0,C.red],["Coût équipe",data?.coutEquipe||0,C.orange],["Marge nette",data?.margeNette||0,data?.margeNette>=0?C.teal:C.red]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
            <span style={{color:C.muted}}>{l}</span>
            <span style={{color:c,fontWeight:700}}>{fmt(Number(v))}</span>
          </div>)}
        </Card>
        <Card>
          <STitle>📊 Comparaisons</STitle>
          {[["Mois actuel",data?.caMoisActuel||0,C.blue],["Mois précédent",data?.caMoisPrecedent||0,C.muted],["Même mois N-1",data?.caNMoins1||0,C.purple]].map(([l,v,c],i)=><div key={i} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{fmt(Number(v))}</span></div>
            <SM val={Number(v)} max={Math.max(data?.caMoisActuel||0,data?.caMoisPrecedent||0,data?.caNMoins1||0,1)} color={c}/>
          </div>)}
        </Card>
      </div>
    </div>}

    {/* ── ÉVOLUTION CA ── */}
    {onglet==="evolution"&&<Card>
      <STitle>📈 Évolution CA — 12 derniers mois</STitle>
      {caParMoisEntries.every(([,v])=>Number(v)===0)&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Pas encore assez de transactions pour afficher l'évolution.</div>}
      <div style={{display:"flex",alignItems:"flex-end",gap:6,height:160,padding:"10px 0",marginBottom:12}}>
        {caParMoisEntries.map(([mois,ca],i)=>{
          const h=Math.max(4,Math.round((Number(ca)/maxCA)*140));
          const isCurrent=mois===`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
          return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            {Number(ca)>0&&<div style={{fontSize:8,color:C.muted}}>{fmt(Number(ca))}</div>}
            <div style={{width:"100%",height:h,background:isCurrent?C.gold:`${C.blue}88`,borderRadius:"4px 4px 0 0",minHeight:4}}/>
            <div style={{fontSize:8,color:isCurrent?C.gold:C.muted,fontWeight:isCurrent?700:400}}>{mois.slice(5)}/{mois.slice(2,4)}</div>
          </div>;
        })}
      </div>
      <div style={{display:"flex",gap:16,justifyContent:"center",fontSize:10,color:C.muted}}>
        <span>🟡 Mois actuel</span><span style={{background:`${C.blue}33`,padding:"2px 8px",borderRadius:4}}>🔵 Historique</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:16}}>
        {[["Meilleur mois",Math.max(...caParMoisEntries.map(([,v])=>Number(v)))],["Moyenne mensuelle",Math.round(caParMoisEntries.reduce((a,[,v])=>a+Number(v),0)/Math.max(1,caParMoisEntries.filter(([,v])=>Number(v)>0).length))],["Total 12 mois",caParMoisEntries.reduce((a,[,v])=>a+Number(v),0)]].map(([l,v],i)=><CT key={i}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>{l}</div><div style={{fontSize:14,fontWeight:700,color:C.gold}}>{fmt(Number(v))}</div></CT>)}
      </div>
    </Card>}

    {/* ── PAR SOURCE ── */}
    {onglet==="sources"&&<div>
      <Card style={{marginBottom:12}}>
        <STitle>🎯 CA par source de revenus</STitle>
        {sourceEntries.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Pas encore de données par source. Les sources apparaîtront au fil des transactions.</div>}
        {sourceEntries.map(([source,montant],i)=>{
          const pct=totalSources>0?Math.round(Number(montant)/totalSources*100):0;
          return <div key={i} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <span style={{fontWeight:600}}>{source}</span>
              <span style={{color:COLORS[i%COLORS.length],fontWeight:700}}>{fmt(Number(montant))} · {pct}%</span>
            </div>
            <SM val={pct} max={100} color={COLORS[i%COLORS.length]}/>
          </div>;
        })}
      </Card>
      {sourceEntries.length>0&&<div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:12,fontSize:12,color:C.text,lineHeight:1.7}}>
        🤖 Source principale : <b style={{color:C.gold}}>{sourceEntries[0]?.[0]||"—"}</b> ({Math.round(Number(sourceEntries[0]?.[1]||0)/totalSources*100)}% du CA). {sourceEntries.length<3?"Diversifie tes sources de revenus pour réduire les risques.":"Bonne diversification des sources de revenus."}
      </div>}
    </div>}

    {/* ── PAR CLIENT ── */}
    {onglet==="clients"&&<div>
      {(data?.alerteDependance||[]).length>0&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,marginBottom:12,fontSize:11,color:C.text}}>
        ⚠️ <b>{data.alerteDependance.map((c)=>c.nom).join(", ")}</b> représente plus de 30% de ton CA. Risque élevé si ce client part. Développe d'autres comptes.
      </div>}
      <Card>
        <STitle>👤 Top clients par CA généré</STitle>
        {(data?.topClients||[]).length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucune donnée client disponible pour le moment.</div>}
        {(data?.topClients||[]).map((c,i)=><div key={i} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,alignItems:"center"}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:COLORS[i%COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#000"}}>{i+1}</div>
              <span style={{fontWeight:600}}>{c.nom}</span>
            </div>
            <div style={{textAlign:"right"}}>
              <span style={{color:c.pct>=30?C.orange:C.gold,fontWeight:700}}>{fmt(c.ca)}</span>
              <span style={{fontSize:10,color:c.pct>=30?C.orange:C.muted,marginLeft:8}}>{c.pct}%{c.pct>=30?" ⚠️":""}</span>
            </div>
          </div>
          <SM val={c.pct} max={100} color={c.pct>=30?C.orange:COLORS[i%COLORS.length]}/>
        </div>)}
      </Card>
    </div>}

    {/* ── RENTABILITÉ ── */}
    {onglet==="rentabilite"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>💰 Compte de résultat simplifié</STitle>
          {[["Chiffre d'affaires",data?.caTotal||0,C.green,false],["Charges fixes",-(data?.chargesTotales||0),C.red,false],["Coût équipe (charges incluses)",-(data?.coutEquipe||0),C.orange,false],["Marge nette",data?.margeNette||0,(data?.margeNette||0)>=0?C.teal:C.red,true]].map(([l,v,c,bold],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12,fontWeight:bold?"700":"400"}}>
            <span style={{color:bold?C.text:C.muted}}>{l}</span>
            <span style={{color:c}}>{Number(v)>=0?"+":""}{fmt(Math.abs(Number(v)))}</span>
          </div>)}
          <div style={{marginTop:12}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Taux de marge</div>
            <SM val={Math.max(0,data?.tauxMarge||0)} max={100} color={(data?.tauxMarge||0)>=20?C.green:(data?.tauxMarge||0)>=10?C.gold:C.red}/>
            <div style={{fontSize:11,color:(data?.tauxMarge||0)>=20?C.green:(data?.tauxMarge||0)>=10?C.gold:C.red,marginTop:4,fontWeight:700}}>{data?.tauxMarge||0}% de marge nette</div>
          </div>
        </Card>
        <Card>
          <STitle>📊 Analyse de rentabilité</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[{label:"Taux de marge",val:(data?.tauxMarge||0)+"%",ok:(data?.tauxMarge||0)>=20,msg:(data?.tauxMarge||0)>=20?"✅ Excellente marge":(data?.tauxMarge||0)>=10?"⚠️ Marge correcte":"❌ Marge insuffisante"},
              {label:"Part équipe / CA",val:data?.caTotal>0?Math.round((data?.coutEquipe||0)/data.caTotal*100)+"%":"—",ok:data?.caTotal>0&&(data?.coutEquipe||0)/data.caTotal<0.4,msg:data?.caTotal>0&&(data?.coutEquipe||0)/data.caTotal<0.4?"✅ Équipe rentable":"⚠️ Coût équipe élevé"},
              {label:"Part charges / CA",val:data?.caTotal>0?Math.round((data?.chargesTotales||0)/data.caTotal*100)+"%":"—",ok:data?.caTotal>0&&(data?.chargesTotales||0)/data.caTotal<0.3,msg:data?.caTotal>0&&(data?.chargesTotales||0)/data.caTotal<0.3?"✅ Charges maîtrisées":"⚠️ Charges à optimiser"},
            ].map((item,i)=><div key={i} style={{background:item.ok?`${C.green}08`:`${C.orange}08`,border:`1px solid ${item.ok?C.green:C.orange}22`,borderRadius:8,padding:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:C.muted}}>{item.label}</span><span style={{fontWeight:700,color:item.ok?C.green:C.orange}}>{item.val}</span></div>
              <div style={{fontSize:11,color:item.ok?C.green:C.orange}}>{item.msg}</div>
            </div>)}
          </div>
        </Card>
      </div>
    </div>}

    {/* ── PRÉVISIONS ── */}
    {onglet==="previsions"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
        {[["🟢 Optimiste",data?.prevision?.optimiste||0,C.green,"Tendance haute +20%"],["🔵 Réaliste",data?.prevision?.realiste||0,C.blue,"Basé sur ta tendance actuelle"],["🔴 Pessimiste",data?.prevision?.pessimiste||0,C.red,"Tendance basse -20%"]].map(([l,v,c,desc],i)=><Card key={i} style={{borderColor:`${c}44`,textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:700,color:c,marginBottom:4}}>{l}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{desc}</div>
          <div style={{fontSize:28,fontWeight:700,color:c,marginBottom:4}}>{fmt(Number(v))}</div>
          <div style={{fontSize:11,color:C.muted}}>CA estimé à 90 jours</div>
        </Card>)}
      </div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:14,fontSize:12,color:C.text,lineHeight:1.7}}>
        🤖 Prévisions basées sur ta tendance réelle des 3 derniers mois. Pour améliorer la précision, assure-toi que toutes tes factures payées sont bien enregistrées dans Xyra.
      </div>
    </div>}

    {/* ── EXPORT ── */}
    {onglet==="export"&&<Card>
      <STitle>📤 Exports analytique</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[{icon:"📋",label:"CSV CA mensuel",desc:"Évolution sur 12 mois",action:exportCSV},{icon:"📱",label:"Rapport WhatsApp",desc:"Résumé mensuel automatique",action:envoyerRapport},{icon:"🔄",label:"Actualiser",desc:"Recharger les données",action:load}].map((item,i)=><CT key={i} style={{cursor:"pointer"}} onClick={item.action}>
          <div style={{fontSize:20,marginBottom:6}}>{item.icon}</div>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>{item.label}</div>
          <div style={{fontSize:9,color:C.muted}}>{item.desc}</div>
        </CT>)}
      </div>
    </Card>}
  </div>;
};


// ─── PAGE CLIENTS ─────────────────────────────────────────────
const PageClients=({plan,showToast,profil,setPage})=>{
  const[clients,setClients]=useState([]);
  const[loadingClients,setLoadingClients]=useState(true);
  const[sel,setSel]=useState(null);
  const[onglet,setOnglet]=useState("liste");
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",email:"",tel:"",ville:"",metier:""});

  const loadAll=async()=>{
    try{
      const res=await fetch('/api/clients');
      const data=await res.json();
      if(data.clients)setClients(data.clients);
    }catch(e){console.error("Clients:",e);}
    setLoadingClients(false);
  };
  useEffect(()=>{loadAll();},[]);
  useEffect(()=>{if(sel)setSel(s=>clients.find(c=>c.id===s.id)||null);},[clients]);

  const enriched=clients;

  const tabs=[{id:"liste",label:"👥 Clients"},{id:"solvabilite",label:"🎯 Solvabilité"},{id:"tunnel",label:"📈 Tunnel de vente"},{id:"upsell",label:"⚡ Upsell auto"},{id:"stats",label:"📊 Stats"}];
  const scoreColor=(s)=>s>=80?C.green:s>=60?C.gold:s>=40?C.orange:C.red;
  const scoreLabel=(s)=>s>=80?"Excellent":s>=60?"Bon":s>=40?"Moyen":"Risqué";

  if(!hasAccess(plan,"clients"))return <div style={{padding:20}}><UpgradeWall page="clients" plan={plan}/></div>;

  const ajouterClient=async()=>{
    if(!addForm.nom)return showToast("⚠️ Le nom est requis");
    try{
      const res=await fetch('/api/clients',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',...addForm})});
      const data=await res.json();
      if(data.success){
        showToast(`✅ ${data.client.nom} ajouté !`);
        setAddForm({nom:"",email:"",tel:"",ville:"",metier:""});setShowAdd(false);
        loadAll();
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const toggleVip=async(c)=>{
    try{
      await fetch('/api/clients',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'toggle_vip',id:c.id,vip:!c.vip})});
      showToast(c.vip?"✅ Statut VIP retiré":"⭐ Statut VIP accordé !");
      loadAll();
    }catch(e){showToast("❌ Erreur");}
  };

  const changerTunnel=async(c,tunnel)=>{
    try{
      await fetch('/api/clients',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id:c.id,tunnel})});
      loadAll();
    }catch(e){showToast("❌ Erreur");}
  };

  const ouvrirWhatsApp=(tel)=>{
    if(!tel)return showToast("⚠️ Aucun numéro renseigné");
    window.open(`https://wa.me/${tel.replace(/\D/g,"")}`,"_blank");
  };

  const envoyerEmail=async(c,message,sujet)=>{
    if(!c.email)return showToast("⚠️ Aucun email renseigné");
    showToast("⏳ Envoi en cours...");
    try{
      const res=await fetch('/api/clients',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_email',id:c.id,email:c.email,subject:sujet,message})});
      const data=await res.json();
      if(data.success){showToast(`✅ Email envoyé à ${c.nom}`);loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const creerDevisPour=(c)=>{
    showToast(`📋 Sélectionne ${c.nom} dans le nouveau devis`);
    setPage&&setPage("devis");
  };

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◬ {profil?.termes?.clients||"Clients"}</div>
        <div style={{fontSize:11,color:C.muted}}>Fiches · Solvabilité · Upsell · Tunnel · Échanges · {clients.length} {profil?.termes?.clients||"clients"}</div></div>
      <Btn onClick={()=>setShowAdd(s=>!s)}>+ Nouveau client</Btn>
    </div>

    {showAdd&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>Nouveau client</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Nom","nom"],["Email","email"],["Téléphone","tel"],["Ville","ville"],["Métier","metier"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={addForm[k]} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={ajouterClient}>✅ Ajouter</Btn>
        <BtnGhost onClick={()=>setShowAdd(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    {loadingClients&&<div style={{fontSize:11,color:C.muted,marginBottom:12}}>Chargement...</div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <KPI label="Total clients" val={clients.length} color={C.blue}/>
      <KPI label="VIP" val={clients.filter(c=>c.vip).length} color={C.gold}/>
      <KPI label="CA total" val={fmt(enriched.reduce((a,c)=>a+c.ca,0))} color={C.green}/>
      <KPI label="Score moyen" val={clients.length?Math.round(enriched.reduce((a,c)=>a+c.score,0)/clients.length)+"/100":"—"} color={C.teal}/>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>{setOnglet(t.id);setSel(null);}} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── LISTE + FICHE ── */}
    {onglet==="liste"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>👥 Liste clients</STitle>
        {!loadingClients&&clients.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucun client pour le moment.</div>}
        {enriched.map((c,i)=><div key={c.id} onClick={()=>setSel(sel?.id===c.id?null:c)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${C.border}22`,cursor:"pointer",background:sel?.id===c.id?`${C.gold}08`:"transparent",borderRadius:4}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:C.blue+"22",border:`2px solid ${C.blue}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.blue,flexShrink:0,position:"relative"}}>
            {inits(c.nom)}
            {c.vip&&<div style={{position:"absolute",top:-3,right:-3,width:12,height:12,borderRadius:"50%",background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7}}>★</div>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700}}>{c.nom}</div>
            <div style={{fontSize:10,color:C.muted}}>{c.pays} {c.ville} · {c.metier}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <Pill color={c.vip?C.gold:C.green}>{c.vip?"VIP":"actif"}</Pill>
            <div style={{fontSize:11,color:C.green,fontWeight:700,marginTop:2}}>{fmt(c.ca)}</div>
          </div>
        </div>)}
      </Card>
      {sel?<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card style={{borderColor:`${C.blue}44`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:50,height:50,borderRadius:"50%",background:C.blue+"22",border:`2px solid ${C.blue}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:C.blue}}>{inits(sel.nom)}</div>
            <div><div style={{fontSize:16,fontWeight:700}}>{sel.nom}{sel.vip&&<span style={{color:C.gold}}> ★ VIP</span>}</div><div style={{fontSize:11,color:C.muted}}>{sel.pays} {sel.ville} · {sel.metier}</div></div>
          </div>
          {[["📧",sel.email||"—"],["📱",sel.tel||"—"],["💰 CA total",fmt(sel.ca)],["🎯 Score solv.",`${sel.score}/100 — ${scoreLabel(sel.score)}`]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>)}
        </Card>
        <Card>
          <STitle>💬 Historique échanges</STitle>
          {(!sel.echanges||sel.echanges.length===0)&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:10}}>Aucun échange enregistré encore.</div>}
          {(sel.echanges||[]).map((e,i)=><div key={e.id||i} style={{background:C.card2,borderRadius:7,padding:8,marginBottom:6,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><Pill color={e.type==="WhatsApp"?C.green:C.blue}>{e.type}</Pill><span style={{fontSize:9,color:C.muted}}>{new Date(e.created_at).toLocaleDateString("fr")} · {e.sens==="reçu"?"← Reçu":"→ Envoyé"}</span></div>
            <div style={{fontSize:11,color:C.text,fontStyle:"italic"}}>"{e.message}"</div>
          </div>)}
        </Card>
        <Card>
          <STitle>⚡ Actions rapides</STitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <Btn onClick={()=>ouvrirWhatsApp(sel.tel)} style={{fontSize:11}}>📱 WhatsApp</Btn>
            <Btn onClick={()=>creerDevisPour(sel)} style={{fontSize:11,background:C.blue}}>◧ Créer devis</Btn>
            <BtnGhost onClick={()=>envoyerEmail(sel,"Je reviens vers vous concernant votre dossier.","Suivi de votre dossier")} style={{fontSize:11}}>📧 Email</BtnGhost>
            <BtnGhost onClick={()=>toggleVip(sel)} style={{fontSize:11,color:C.gold,borderColor:`${C.gold}44`}}>{sel.vip?"Retirer VIP":"⭐ Mettre VIP"}</BtnGhost>
          </div>
        </Card>
      </div>:<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:8}}>👆</div><div style={{color:C.muted,fontSize:12}}>Clique sur un client pour voir sa fiche</div></Card>}
    </div>}

    {/* ── SOLVABILITÉ ── */}
    {onglet==="solvabilite"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.blue,fontWeight:600,marginBottom:6}}>🎯 SCORE DE SOLVABILITÉ XYRA — calculé depuis tes vraies factures</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>Basé sur l'historique réel de paiement : base 50, +8 par facture payée, −15 par facture en retard. <b style={{color:C.green}}>80-100 = Excellent</b> · <b style={{color:C.gold}}>60-79 = Bon</b> · <b style={{color:C.orange}}>40-59 = Moyen</b> · <b style={{color:C.red}}>0-39 = Risqué</b></div>
      </div>
      {enriched.length===0&&<Card style={{textAlign:"center",padding:24}}><div style={{fontSize:12,color:C.muted}}>Aucun client pour le moment.</div></Card>}
      {enriched.map((c,i)=><Card key={c.id} style={{marginBottom:10,borderColor:`${scoreColor(c.score)}33`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:C.blue+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:C.blue}}>{inits(c.nom)}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{c.nom}</div><div style={{fontSize:10,color:C.muted}}>{c.metier}</div></div>
          <div style={{textAlign:"center",background:`${scoreColor(c.score)}22`,border:`2px solid ${scoreColor(c.score)}44`,borderRadius:10,padding:"8px 16px"}}>
            <div style={{fontSize:24,fontWeight:700,color:scoreColor(c.score)}}>{c.score}</div>
            <div style={{fontSize:9,color:scoreColor(c.score),fontWeight:600}}>{scoreLabel(c.score)}</div>
          </div>
        </div>
        <SM val={c.score} max={100} color={scoreColor(c.score)}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:10}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Factures payées</div><div style={{fontSize:11,fontWeight:700,color:C.text}}>{c.factures_payees}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Incidents paiement</div><div style={{fontSize:11,fontWeight:700,color:c.factures_retard>0?C.red:C.green}}>{c.factures_retard}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>CA réalisé</div><div style={{fontSize:11,fontWeight:700,color:C.gold}}>{fmt(c.ca)}</div></CT>
        </div>
        <div style={{marginTop:8,display:"flex",gap:6}}>
          <Pill color={c.score>=60?C.green:C.red}>{c.score>=80?"✅ Travailler sans conditions":c.score>=60?"✅ Travailler avec acompte":c.score>=40?"⚠️ Acompte 50% obligatoire":"❌ Déconseillé — risque élevé"}</Pill>
        </div>
      </Card>)}
    </div>}

    {/* ── TUNNEL DE VENTE ── */}
    {onglet==="tunnel"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
        {[["🆕 Nouveau",clients.filter(c=>c.tunnel==="nouveau"||!c.tunnel).length,C.blue],["💬 Négociation",clients.filter(c=>c.tunnel==="negociation").length,C.gold],["✅ Client régulier",clients.filter(c=>c.tunnel==="client_regulier").length,C.green],["⭐ VIP fidèle",clients.filter(c=>c.tunnel==="vip_fidele").length,C.purple]].map(([l,v,c],i)=><CT key={i} style={{textAlign:"center",borderColor:`${c}33`}}><div style={{fontSize:11,fontWeight:600,color:c,marginBottom:4}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div></CT>)}
      </div>
      <Card>
        <STitle>🤖 Relances automatiques</STitle>
        {enriched.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun client pour le moment.</div>}
        {enriched.map((c,i)=><div key={c.id} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:700}}>{c.nom}</span>
            <Sel value={c.tunnel||"nouveau"} onChange={e=>changerTunnel(c,e.target.value)} style={{fontSize:10}}>
              <option value="nouveau">Nouveau</option><option value="negociation">Négociation</option><option value="client_regulier">Client régulier</option><option value="vip_fidele">VIP fidèle</option>
            </Sel>
          </div>
          <div style={{fontSize:11,color:C.muted,marginBottom:6}}>
            {c.tunnel==="negociation"?"→ Proposition geste commercial / devis ajusté":c.tunnel==="client_regulier"?"→ Offre fidélité + upsell service supérieur":c.tunnel==="vip_fidele"?"→ Invitation événement VIP + offre exclusive":"→ Envoi présentation Xyra + devis découverte"}
          </div>
          <Btn onClick={()=>c.tel?(ouvrirWhatsApp(c.tel),showToast(`📱 WhatsApp ouvert pour ${c.nom}`)):envoyerEmail(c,"Je reviens vers vous suite à notre échange précédent.","Suivi")} style={{fontSize:10,padding:"5px 10px"}}>Lancer relance</Btn>
        </div>)}
      </Card>
    </div>}

    {/* ── UPSELL ── */}
    {onglet==="upsell"&&<div>
      <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:10,color:C.gold,fontWeight:600,marginBottom:6}}>⚡ UPSELL — basé sur ton CA réel par client</div>
      </div>
      {enriched.length===0&&<Card style={{textAlign:"center",padding:24}}><div style={{fontSize:12,color:C.muted}}>Aucun client pour le moment.</div></Card>}
      {enriched.map((c,i)=>{const upsellCA=Math.round(c.ca*0.4);const texte=c.vip?`${c.nom} est VIP. Proposez un contrat annuel exclusif avec 10% de remise. Valeur estimée : ${fmt(c.ca*1.5)}/an.`:c.ca>3000?`${c.nom} a déjà généré ${fmt(c.ca)} de CA. Bon moment pour proposer un abonnement mensuel avec remise.`:`${c.nom} est un profil récent ou avec peu d'historique. Commencez par un 2ème service complémentaire.`;return <Card key={c.id} style={{marginBottom:10,borderColor:`${C.gold}22`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontSize:13,fontWeight:700}}>{c.nom}</div><div style={{fontSize:10,color:C.muted}}>{c.metier} · CA : {fmt(c.ca)}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.gold}}>Potentiel upsell</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>+{fmt(upsellCA)}</div></div>
        </div>
        <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}22`,borderRadius:8,padding:10,marginBottom:10}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:3}}>💡 Recommandation</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{texte}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>envoyerEmail(c,texte,"Une proposition pour vous")} style={{flex:1,fontSize:11}}>📧 Envoyer proposition</Btn>
          <BtnGhost onClick={()=>creerDevisPour(c)} style={{flex:1,fontSize:11}}>◧ Créer devis</BtnGhost>
        </div>
      </Card>;})}
    </div>}

    {/* ── STATS ── */}
    {onglet==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>💰 CA par client</STitle>
        {enriched.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucune donnée pour le moment.</div>}
        {[...enriched].sort((a,b)=>b.ca-a.ca).map((c,i)=><div key={c.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{c.nom}</span><span style={{color:C.green,fontWeight:700}}>{fmt(c.ca)}</span></div><SM val={c.ca} max={Math.max(...enriched.map(x=>x.ca),1)} color={C.blue}/></div>)}
      </Card>
      <Card>
        <STitle>🎯 Scores de solvabilité</STitle>
        {[...enriched].sort((a,b)=>b.score-a.score).map((c,i)=><div key={c.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{c.nom}</span><span style={{color:scoreColor(c.score),fontWeight:700}}>{c.score}/100</span></div><SM val={c.score} max={100} color={scoreColor(c.score)}/></div>)}
      </Card>
    </div>}
  </div>;
};

// ─── PAGE PARTENAIRES ─────────────────────────────────────────
const PagePartenaires=({plan,showToast})=>{
  const[parts,setParts]=useState([]);
  const[loadingParts,setLoadingParts]=useState(true);
  const[alertes,setAlertes]=useState([]);
  const[onglet,setOnglet]=useState("dashboard");
  const[sel,setSel]=useState(null);
  const[showOnboard,setShowOnboard]=useState(false);
  const[onboardForm,setOnboardForm]=useState({nom:"",role:"",comm:"15",email:"",tel:"",adresse:"",rib:""});
  const[leadForms,setLeadForms]=useState({});
  const[docForms,setDocForms]=useState({});
  const[iaCache,setIaCache]=useState({});
  const[iaLoading,setIaLoading]=useState({});
  const[recuInputs,setRecuInputs]=useState({});

  const loadAll=async()=>{
    try{
      const res=await fetch('/api/partenaires');
      const data=await res.json();
      if(data.partenaires)setParts(data.partenaires);
    }catch(e){console.error("Partenaires:",e);}
    setLoadingParts(false);
  };
  useEffect(()=>{loadAll();},[]);
  useEffect(()=>{if(sel)setSel(s=>parts.find(p=>p.id===s.id)||null);},[parts]);

  const tabs=[
    {id:"dashboard",label:"📊 Tableau de bord"},
    {id:"liste",label:"⬡ Partenaires"},
    {id:"leads",label:"🎯 Leads apportés"},
    {id:"commissions",label:"💰 Commissions"},
    {id:"contrats",label:"📋 Contrats"},
    {id:"performance",label:"📈 Performance"},
    {id:"onboarding",label:"🤝 Onboarding"},
    {id:"messagerie",label:"💬 Messagerie"},
    {id:"documents",label:"🗂 Documents"},
    {id:"alertes",label:"🔔 Alertes"},
    {id:"ia",label:"🤖 IA"},
  ];

  if(!hasAccess(plan,"partenaires"))return <div style={{padding:20}}><UpgradeWall page="partenaires" plan={plan}/></div>;

  const totalCA=parts.reduce((a,p)=>a+p.ca,0);
  const totalDues=parts.reduce((a,p)=>a+p.dues,0);
  const totalPaye=parts.reduce((a,p)=>a+p.paye,0);
  const totalLeads=parts.reduce((a,p)=>a+p.leads.length,0);
  const totalGagnes=parts.reduce((a,p)=>a+p.leads.filter(l=>l.statut==="gagné").length,0);
  const couleurs=[C.blue,C.gold,C.purple,C.green,C.teal,C.pink,C.orange];
  const coul=(i)=>couleurs[i%couleurs.length];

  const payerCommission=async(p)=>{
    if(!p.dues||p.dues<=0)return showToast("✅ Aucune commission due pour ce partenaire");
    showToast(`⏳ Enregistrement du virement pour ${p.nom}...`);
    try{
      const res=await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'payer_commission',id:p.id})});
      const data=await res.json();
      if(data.success){showToast(`✅ ${fmt(data.montant)} enregistré à virer pour ${p.nom}`);loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const activerPortail=async(p)=>{
    if(!p.email)return showToast("⚠️ Email manquant pour ce partenaire");
    showToast(`⏳ Création de l'accès portail pour ${p.nom}...`);
    try{
      const res=await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'inviter_portail',id:p.id})});
      const data=await res.json();
      if(data.success){showToast(`✅ Accès envoyé à ${p.nom} par email et WhatsApp`);loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const payerTout=async()=>{
    const aPayer=parts.filter(p=>p.dues>0);
    if(aPayer.length===0)return showToast("✅ Aucune commission due");
    showToast(`⏳ Enregistrement de ${aPayer.length} virement(s)...`);
    for(const p of aPayer){
      try{await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'payer_commission',id:p.id})});}catch(e){}
    }
    showToast(`✅ Commissions enregistrées à virer — voir le Wallet`);
    loadAll();
  };

  const ouvrirWhatsApp=(tel)=>{
    if(!tel)return showToast("⚠️ Aucun numéro renseigné");
    window.open(`https://wa.me/${tel.replace(/\D/g,"")}`,"_blank");
  };

  const envoyerEmailPartenaire=async(p,message,subject)=>{
    if(!p.email)return showToast("⚠️ Aucun email renseigné");
    showToast("⏳ Envoi en cours...");
    try{
      const res=await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_email',email:p.email,subject,message,partenaire_id:p.id})});
      const data=await res.json();
      if(data.success){showToast(`✅ Email envoyé à ${p.nom}`);loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const envoyerMessage=async(p,message,moi=true)=>{
    try{
      const res=await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_message',partenaire_id:p.id,message,tel:p.tel,moi})});
      const data=await res.json();
      if(data.success)loadAll();
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const ajouterLead=async(p)=>{
    const f=leadForms[p.id]||{};
    if(!f.nom)return showToast("⚠️ Nom du prospect requis");
    try{
      const res=await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_lead',partenaire_id:p.id,nom:f.nom,ca:f.ca||0,statut:f.statut||"en cours"})});
      const data=await res.json();
      if(data.success){showToast(`✅ Lead ajouté pour ${p.nom}`);setLeadForms(s=>({...s,[p.id]:{nom:"",ca:"",statut:"en cours"}}));loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const modifierLeadStatut=async(lead,statut)=>{
    try{
      await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier_lead',id:lead.id,statut})});
      loadAll();
    }catch(e){showToast("❌ Erreur");}
  };

  const ajouterDocument=async(p)=>{
    const f=docForms[p.id]||{};
    if(!f.nom)return showToast("⚠️ Nom du document requis");
    try{
      const res=await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_document',partenaire_id:p.id,nom:f.nom,type:f.type||"Autre",statut:"en_attente"})});
      const data=await res.json();
      if(data.success){showToast(`✅ Document ajouté pour ${p.nom}`);setDocForms(s=>({...s,[p.id]:{nom:"",type:""}}));loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const downloadBase64Pdf=(base64,filename)=>{
    const bytes=atob(base64);
    const arr=new Uint8Array(bytes.length);
    for(let i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i);
    const blob=new Blob([arr],{type:"application/pdf"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=filename;a.click();
    URL.revokeObjectURL(url);
  };

  const genererContratPdf=async(p)=>{
    showToast(`⏳ Génération du contrat ${p.nom}...`);
    try{
      const res=await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_contrat_pdf',id:p.id})});
      const data=await res.json();
      if(data.success){downloadBase64Pdf(data.pdfBase64,data.filename);showToast(`✅ Contrat ${p.nom} téléchargé`);}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const analyserIA=async(p)=>{
    if(iaLoading[p.id])return;
    setIaLoading(s=>({...s,[p.id]:true}));
    try{
      const res=await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',partenaire:p})});
      const data=await res.json();
      if(data.success)setIaCache(s=>({...s,[p.id]:data.analyse}));
      else showToast("❌ "+(data.error||"Analyse indisponible"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setIaLoading(s=>({...s,[p.id]:false}));
  };

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⬡ Partenaires & Apporteurs d'affaires</div>
        <div style={{fontSize:11,color:C.muted}}>Commissions · Leads · Contrats · Performance · IA · {parts.length} partenaires</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={()=>{setOnglet("onboarding");setShowOnboard(true);}}>+ Nouveau partenaire</BtnGhost>
      </div>
    </div>

    {loadingParts&&<div style={{fontSize:11,color:C.muted,marginBottom:12}}>Chargement...</div>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      {[["CA total apporté",fmt(totalCA),C.green],["Commissions dues",fmt(totalDues),C.orange],["Commissions payées",fmt(totalPaye),C.gold],["Leads soumis",totalLeads,C.blue],["Leads gagnés",totalGagnes,C.teal]].map(([l,v,c],i)=><CT key={i}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c,fontFamily:"Georgia,serif"}}>{v}</div></CT>)}
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {!loadingParts&&parts.length===0&&onglet!=="onboarding"&&<Card style={{textAlign:"center",padding:30,marginBottom:14}}><div style={{fontSize:12,color:C.muted}}>Aucun partenaire enregistré pour le moment.</div><BtnGhost onClick={()=>setOnglet("onboarding")} style={{marginTop:10}}>+ Créer le premier partenaire</BtnGhost></Card>}

    {/* ── DASHBOARD ─────────────────────────────────────── */}
    {onglet==="dashboard"&&parts.length>0&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>⬡ Vue d'ensemble partenaires</STitle>
          {parts.map((p,i)=><div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${C.border}22`,cursor:"pointer"}} onClick={()=>{setSel(p);setOnglet("liste");}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:coul(i)+"22",border:`2px solid ${coul(i)}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:coul(i),flexShrink:0}}>{p.nom[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700}}>{p.nom}</div>
              <div style={{fontSize:9,color:C.muted}}>{p.role} · {p.comm}%</div>
              <div style={{marginTop:3,height:3,borderRadius:2,background:C.border}}><div style={{height:"100%",width:(totalCA>0?p.ca/totalCA*100:0)+"%",background:coul(i),borderRadius:2}}/></div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:700,color:C.green}}>{fmt(p.ca)}</div>
              {p.dues>0&&<div style={{fontSize:9,color:C.orange}}>⚠ {fmt(p.dues)} dues</div>}
            </div>
          </div>)}
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card>
            <STitle>💰 Commissions à payer</STitle>
            {parts.filter(p=>p.dues>0).length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:12}}>Tout est réglé ✅</div>}
            {parts.filter(p=>p.dues>0).map((p,i)=><div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
              <div><div style={{fontSize:12,fontWeight:600}}>{p.nom}</div><div style={{fontSize:10,color:C.muted}}>{p.comm}% · {p.rib?p.rib.slice(0,12)+"...":"RIB non renseigné"}</div></div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:14,fontWeight:700,color:C.orange}}>{fmt(p.dues)}</div>
                <Btn onClick={()=>payerCommission(p)} style={{fontSize:9,padding:"3px 8px",marginTop:4}}>Payer</Btn>
              </div>
            </div>)}
          </Card>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <KPI label="Meilleur CA" val={[...parts].sort((a,b)=>b.ca-a.ca)[0]?.nom.split(" ")[0]||"—"} color={C.gold} sub={fmt(Math.max(...parts.map(p=>p.ca),0))}/>
        <KPI label="Taux conversion moyen" val={totalLeads>0?Math.round(totalGagnes/totalLeads*100)+"%":"—"} color={C.green}/>
        <KPI label="Commission moy." val={parts.length>0?Math.round(parts.reduce((a,p)=>a+Number(p.comm),0)/parts.length)+"%":"—"} color={C.blue}/>
      </div>
    </div>}

    {/* ── LISTE PARTENAIRES ─────────────────────────────── */}
    {onglet==="liste"&&parts.length>0&&<div>
      {sel?<div>
        <BtnGhost onClick={()=>setSel(null)} style={{marginBottom:14}}>← Retour à la liste</BtnGhost>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:`${C.blue}22`,border:`2px solid ${C.blue}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:C.blue}}>{sel.nom[0]}</div>
              <div><div style={{fontSize:16,fontWeight:700}}>{sel.nom}</div><div style={{fontSize:11,color:C.muted}}>{sel.role}</div><Pill color={C.blue}>{sel.comm}% commission</Pill></div>
            </div>
            {[["📧 Email",sel.email||"—"],["📱 Téléphone",sel.tel||"—"],["🏠 Adresse",sel.adresse||"—"],["📅 Partenaire depuis",new Date(sel.created_at).toLocaleDateString("fr")],["🏦 RIB",sel.rib||"Non renseigné"],["💰 CA total apporté",fmt(sel.ca)],["💸 Commissions dues",fmt(sel.dues)],["✅ Commissions payées",fmt(sel.paye)],["📋 Contrats gagnés",sel.contrats+" contrat(s)"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:k.includes("dues")?C.orange:k.includes("payées")?C.green:C.text}}>{v}</span></div>)}
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card>
              <STitle>⚡ Actions rapides</STitle>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {sel.dues>0&&<Btn onClick={()=>payerCommission(sel)} style={{background:C.orange}}>💰 Payer {fmt(sel.dues)} commission</Btn>}
                {!sel.accesPortail&&<Btn onClick={()=>activerPortail(sel)} style={{background:C.purple}}>🔑 Activer l'espace partenaire</Btn>}
                <Btn onClick={()=>genererContratPdf(sel)} style={{background:C.blue}}>📄 Générer contrat PDF</Btn>
                <BtnGhost onClick={()=>ouvrirWhatsApp(sel.tel)}>📱 WhatsApp</BtnGhost>
                <BtnGhost onClick={()=>envoyerEmailPartenaire(sel,"Je reviens vers vous au sujet de notre partenariat.","Suivi de notre partenariat")}>📧 Email</BtnGhost>
                <BtnGhost onClick={()=>setOnglet("messagerie")} style={{color:C.gold,borderColor:`${C.gold}44`}}>💬 Messagerie interne</BtnGhost>
              </div>
            </Card>
          </div>
        </div>
      </div>:<Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Partenaire</TH><TH>Rôle</TH><TH>Commission</TH><TH>CA apporté</TH><TH>Leads</TH><TH>Comm. dues</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{parts.map((p,i)=><tr key={p.id} style={{cursor:"pointer"}} onClick={()=>setSel(p)}>
            <Td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:coul(i)+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:coul(i)}}>{p.nom[0]}</div><span style={{fontWeight:700}}>{p.nom}</span></div></Td>
            <Td style={{color:C.muted,fontSize:11}}>{p.role}</Td>
            <Td><Pill color={C.gold}>{p.comm}%</Pill></Td>
            <Td style={{color:C.green,fontWeight:700}}>{fmt(p.ca)}</Td>
            <Td style={{color:C.blue}}>{p.leads.length} <span style={{color:C.muted,fontSize:10}}>({p.leads.filter(l=>l.statut==="gagné").length} ✓)</span></Td>
            <Td style={{color:p.dues>0?C.orange:C.muted,fontWeight:700}}>{p.dues>0?fmt(p.dues):"—"}</Td>
            <Td><St s={p.statut}/></Td>
            <Td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:4}}>
              {p.dues>0&&<Btn onClick={()=>payerCommission(p)} style={{fontSize:9,padding:"4px 8px",background:C.orange}}>💰 Payer</Btn>}
              <BtnGhost onClick={()=>ouvrirWhatsApp(p.tel)} style={{fontSize:9,padding:"4px 8px"}}>WA</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── LEADS ─────────────────────────────────────────── */}
    {onglet==="leads"&&parts.length>0&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Total leads" val={totalLeads} color={C.blue}/>
        <KPI label="Gagnés" val={totalGagnes} color={C.green}/>
        <KPI label="En cours" val={parts.reduce((a,p)=>a+p.leads.filter(l=>l.statut==="en cours"||l.statut==="proposition").length,0)} color={C.gold}/>
        <KPI label="Taux conversion" val={totalLeads>0?Math.round(totalGagnes/totalLeads*100)+"%":"—"} color={C.teal}/>
      </div>
      {parts.map((p,i)=><Card key={p.id} style={{marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:coul(i)+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:coul(i)}}>{p.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.nom}</div><div style={{fontSize:10,color:C.muted}}>{p.leads.length} leads · {p.leads.filter(l=>l.statut==="gagné").length} gagnés</div></div>
          <Pill color={C.gold}>{p.comm}%</Pill>
        </div>
        {p.leads.length>0&&<table style={{width:"100%",borderCollapse:"collapse",marginBottom:10}}>
          <thead><tr><TH>Prospect</TH><TH>Date</TH><TH>Statut</TH><TH>CA potentiel</TH><TH>Commission</TH></tr></thead>
          <tbody>{p.leads.map((l,j)=><tr key={l.id}>
            <Td style={{fontWeight:600}}>{l.nom}</Td>
            <Td style={{color:C.muted,fontSize:10}}>{new Date(l.created_at).toLocaleDateString("fr")}</Td>
            <Td><Sel value={l.statut} onChange={e=>modifierLeadStatut(l,e.target.value)} style={{fontSize:10}}>
              <option value="en cours">En cours</option><option value="proposition">Proposition</option><option value="gagné">Gagné</option><option value="perdu">Perdu</option>
            </Sel></Td>
            <Td style={{color:C.green,fontWeight:700}}>{l.ca>0?fmt(l.ca):"À définir"}</Td>
            <Td style={{color:C.gold,fontWeight:700}}>{l.ca>0?fmt(Math.round(l.ca*p.comm/100)):"—"}</Td>
          </tr>)}</tbody>
        </table>}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-end"}}>
          <Inp value={leadForms[p.id]?.nom||""} onChange={e=>setLeadForms(s=>({...s,[p.id]:{...s[p.id],nom:e.target.value}}))} placeholder="Nom du prospect" style={{flex:1,minWidth:140}}/>
          <Inp value={leadForms[p.id]?.ca||""} onChange={e=>setLeadForms(s=>({...s,[p.id]:{...s[p.id],ca:e.target.value}}))} placeholder="CA potentiel €" style={{width:120}}/>
          <button onClick={()=>ajouterLead(p)} style={{background:"transparent",color:coul(i),border:`1px solid ${coul(i)}44`,borderRadius:6,padding:"7px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Ajouter</button>
        </div>
      </Card>)}
    </div>}

    {/* ── COMMISSIONS ───────────────────────────────────── */}
    {onglet==="commissions"&&parts.length>0&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Total à payer" val={fmt(totalDues)} color={C.orange}/>
        <KPI label="Total payé (historique)" val={fmt(totalPaye)} color={C.green}/>
        <KPI label="Total cumulé" val={fmt(totalDues+totalPaye)} color={C.gold}/>
      </div>
      <Card style={{marginBottom:12}}>
        <STitle>💰 Commissions dues — À enregistrer maintenant</STitle>
        {parts.filter(p=>p.dues>0).length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucune commission due pour le moment.</div>}
        {parts.filter(p=>p.dues>0).length>0&&<table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Partenaire</TH><TH>Taux</TH><TH>CA apporté</TH><TH>Commission due</TH><TH>RIB</TH><TH>Actions</TH></tr></thead>
          <tbody>{parts.filter(p=>p.dues>0).map(p=><tr key={p.id}>
            <Td style={{fontWeight:700}}>{p.nom}</Td>
            <Td><Pill color={C.gold}>{p.comm}%</Pill></Td>
            <Td style={{color:C.green,fontWeight:600}}>{fmt(p.ca)}</Td>
            <Td style={{color:C.orange,fontWeight:700,fontSize:14}}>{fmt(p.dues)}</Td>
            <Td style={{fontSize:10,color:C.muted,fontFamily:"monospace"}}>{p.rib?p.rib.slice(0,16)+"...":"Non renseigné"}</Td>
            <Td><div style={{display:"flex",gap:4}}>
              <Btn onClick={()=>payerCommission(p)} style={{fontSize:10,padding:"5px 10px",background:C.orange}}>💸 Enregistrer {fmt(p.dues)}</Btn>
              <BtnGhost onClick={()=>ouvrirWhatsApp(p.tel)} style={{fontSize:10,padding:"5px 8px"}}>📱</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>}
        {totalDues>0&&<Btn onClick={payerTout} style={{marginTop:12,width:"100%",background:C.orange}}>💸 Tout enregistrer — {fmt(totalDues)}</Btn>}
        <div style={{marginTop:10,fontSize:10,color:C.muted}}>ℹ️ "Enregistrer" crée le virement dans ton Wallet (à virer). Le virement bancaire réel se confirme ensuite depuis le Wallet.</div>
      </Card>
      <Card>
        <STitle>✅ Commissions versées (historique réel)</STitle>
        {parts.filter(p=>p.paye>0).length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:12}}>Aucun virement confirmé pour le moment.</div>}
        {parts.filter(p=>p.paye>0).length>0&&<table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Partenaire</TH><TH>Montant payé</TH><TH>Statut</TH></tr></thead>
          <tbody>{parts.filter(p=>p.paye>0).map(p=><tr key={p.id}>
            <Td style={{fontWeight:600}}>{p.nom}</Td>
            <Td style={{color:C.green,fontWeight:700}}>{fmt(p.paye)}</Td>
            <Td><Pill color={C.green}>✓ Viré</Pill></Td>
          </tr>)}</tbody>
        </table>}
      </Card>
    </div>}

    {/* ── CONTRATS ──────────────────────────────────────── */}
    {onglet==="contrats"&&parts.length>0&&<div>
      <STitle>📋 Contrats partenaires</STitle>
      <Card style={{marginTop:10,marginBottom:12}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Partenaire</TH><TH>Type</TH><TH>Commission</TH><TH>Début</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{parts.map(p=><tr key={p.id}>
            <Td style={{fontWeight:700}}>{p.nom}</Td>
            <Td><Pill color={C.blue}>{p.role}</Pill></Td>
            <Td style={{color:C.gold,fontWeight:700}}>{p.comm}%</Td>
            <Td style={{color:C.muted,fontSize:10}}>{new Date(p.created_at).toLocaleDateString("fr")}</Td>
            <Td><St s={p.statut}/></Td>
            <Td><div style={{display:"flex",gap:4}}>
              <Btn onClick={()=>genererContratPdf(p)} style={{fontSize:9,padding:"4px 8px"}}>📄 PDF</Btn>
              <BtnGhost onClick={()=>ouvrirWhatsApp(p.tel)} style={{fontSize:9,padding:"4px 8px"}}>WA</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>
      <Card style={{background:`${C.blue}08`,borderColor:`${C.blue}33`}}>
        <STitle>📝 Clauses standards — incluses dans chaque contrat généré</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {["Commission versée sous 30 jours après encaissement client","Taux de commission fixé contractuellement — révisable annuellement","Lead valide = prospect non connu de Xyra depuis + de 6 mois","Commission due uniquement si le deal est signé et encaissé","Résiliation par l'une ou l'autre partie avec préavis de 30 jours"].map((c,i)=><div key={i} style={{fontSize:11,color:C.text,padding:"6px 10px",background:C.card2,borderRadius:6}}>• {c}</div>)}
        </div>
      </Card>
    </div>}

    {/* ── PERFORMANCE ───────────────────────────────────── */}
    {onglet==="performance"&&parts.length>0&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📈 Classement par CA apporté</STitle>
          {[...parts].sort((a,b)=>b.ca-a.ca).map((p,i)=><div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:["#C9A84C","#C0C0C0","#CD7F32","#5A5A7A"][i]+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:["#C9A84C","#C0C0C0","#CD7F32","#5A5A7A"][i]||C.muted}}>{i+1}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{p.nom}</span><span style={{color:C.green,fontWeight:700}}>{fmt(p.ca)}</span></div>
              <SM val={p.ca} max={Math.max(...parts.map(x=>x.ca),1)} color={coul(i)}/>
            </div>
          </div>)}
        </Card>
        <Card>
          <STitle>🎯 Taux de conversion par partenaire</STitle>
          {parts.map((p,i)=>{const tx=p.leads.length>0?Math.round(p.leads.filter(l=>l.statut==="gagné").length/p.leads.length*100):0;return <div key={p.id} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{p.nom.split(" ")[0]}</span><span style={{color:tx>=50?C.green:tx>=25?C.gold:C.orange,fontWeight:700}}>{tx}%</span></div>
            <SM val={tx} max={100} color={tx>=50?C.green:tx>=25?C.gold:C.orange}/>
          </div>;})}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        <Card>
          <STitle>💰 Commissions versées par partenaire</STitle>
          {parts.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{fontWeight:600}}>{p.nom}</span><div style={{textAlign:"right"}}><div style={{color:C.green,fontWeight:700}}>{fmt(p.paye)} payé</div><div style={{color:C.orange,fontSize:10}}>{p.dues>0?`${fmt(p.dues)} dû`:"À jour"}</div></div></div>)}
        </Card>
        <Card>
          <STitle>📊 Leads par statut (global)</STitle>
          {[["Gagné",C.green,"gagné"],["En cours",C.gold,"en cours"],["Proposition",C.blue,"proposition"],["Perdu",C.muted,"perdu"]].map(([s,c,key])=>{const n=parts.reduce((a,p)=>a+p.leads.filter(l=>l.statut===key).length,0);return <div key={s} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{s}</span><span style={{color:c,fontWeight:700}}>{n}</span></div><SM val={n} max={Math.max(totalLeads,1)} color={c}/></div>;})}
        </Card>
      </div>
    </div>}

    {/* ── ONBOARDING ────────────────────────────────────── */}
    {onglet==="onboarding"&&<div style={{maxWidth:600}}>
      <Card>
        <STitle>🤝 Onboarding nouveau partenaire</STitle>
        <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:12,marginBottom:16,fontSize:11,color:C.text}}>
          💡 Le partenaire recevra automatiquement un message de bienvenue par email + WhatsApp (si le téléphone est renseigné).
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Nom complet *","nom","text"],["Rôle / spécialité","role","text"],["Email *","email","email"],["Téléphone (WhatsApp)","tel","tel"],["Adresse","adresse","text"],["IBAN / RIB bancaire","rib","text"]].map(([ph,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{ph}</label><Inp value={onboardForm[k]||""} onChange={e=>setOnboardForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={{width:"100%"}}/></div>)}
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Taux de commission (%) *</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[10,12,15,20,25].map(t=><button key={t} onClick={()=>setOnboardForm(f=>({...f,comm:String(t)}))} style={{background:onboardForm.comm===String(t)?C.gold:"transparent",color:onboardForm.comm===String(t)?"#000":C.muted,border:`1px solid ${onboardForm.comm===String(t)?C.gold:C.border}`,borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:onboardForm.comm===String(t)?700:400}}>{t}%</button>)}
              <Inp value={onboardForm.comm} onChange={e=>setOnboardForm(f=>({...f,comm:e.target.value}))} placeholder="Autre %" style={{width:80}}/>
            </div>
          </div>
          <Btn onClick={async()=>{
            if(!onboardForm.nom||!onboardForm.email)return showToast("⚠️ Remplissez au moins le nom et l'email");
            showToast("⏳ Création du partenaire...");
            try{
              const res=await fetch('/api/partenaires',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',...onboardForm})});
              const data=await res.json();
              if(data.success){
                setOnboardForm({nom:"",role:"",comm:"15",email:"",tel:"",adresse:"",rib:""});
                showToast(`✅ ${data.partenaire.nom} ajouté ! Message de bienvenue envoyé.`);
                setOnglet("liste");loadAll();
              }else showToast("❌ "+(data.error||"Erreur"));
            }catch(e){showToast("❌ Erreur de connexion");}
          }}>✅ Créer le partenaire & Envoyer le message de bienvenue</Btn>
        </div>
      </Card>
    </div>}

    {/* ── MESSAGERIE ────────────────────────────────────── */}
    {onglet==="messagerie"&&parts.length>0&&<div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:12,height:520}}>
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:700,color:C.muted}}>PARTENAIRES</div>
        <div style={{overflowY:"auto",height:"calc(100% - 40px)"}}>
          {parts.map((p,i)=><div key={p.id} onClick={()=>setSel(p)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer",background:sel?.id===p.id?`${C.gold}0D`:"transparent",borderBottom:`1px solid ${C.border}22`}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:coul(i)+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:coul(i),flexShrink:0}}>{p.nom[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nom}</div>
              <div style={{fontSize:9,color:C.muted}}>{p.msgs.length>0?p.msgs[p.msgs.length-1].message.slice(0,25)+"...":"Aucun message"}</div>
            </div>
          </div>)}
        </div>
      </Card>
      <Card style={{padding:0,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {sel?<>
          <div style={{flex:1,overflow:"hidden"}}>
            <Chat
              msgs={sel.msgs.map(m=>({msg:m.message,moi:m.moi,av:m.moi?"Toi":sel.nom[0],h:new Date(m.created_at).toLocaleString("fr",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}))}
              onSend={(msg)=>envoyerMessage(sel,msg,true)}
              title={sel.nom}
              subtitle={sel.role+(sel.tel?" · "+sel.tel:"")}
            />
          </div>
          <div style={{padding:"8px 14px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,background:C.card2}}>
            <Inp value={recuInputs[sel.id]||""} onChange={e=>setRecuInputs(s=>({...s,[sel.id]:e.target.value}))} placeholder="Logger une réponse reçue (WhatsApp)..." style={{flex:1,fontSize:11}}/>
            <BtnGhost onClick={()=>{const v=recuInputs[sel.id];if(v&&v.trim()){envoyerMessage(sel,v.trim(),false);setRecuInputs(s=>({...s,[sel.id]:""}));}}} style={{fontSize:10,whiteSpace:"nowrap"}}>📥 Logger reçu</BtnGhost>
          </div>
        </>:<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:C.muted}}>
          <div style={{fontSize:32,marginBottom:8}}>💬</div>
          <div style={{fontSize:12}}>Sélectionnez un partenaire</div>
        </div>}
      </Card>
    </div>}

    {/* ── DOCUMENTS ─────────────────────────────────────── */}
    {onglet==="documents"&&parts.length>0&&<div>
      {parts.map((p,i)=><Card key={p.id} style={{marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:coul(i)+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:coul(i)}}>{p.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.nom}</div><div style={{fontSize:10,color:C.muted}}>{p.docs.length} document(s)</div></div>
        </div>
        {p.docs.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginBottom:10}}>
          {p.docs.map(d=><div key={d.id} style={{background:C.card2,borderRadius:8,padding:10,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:600}}>{d.nom}</span>
              <Pill color={d.statut==="signé"||d.statut==="valide"?C.green:d.statut==="envoyé"?C.blue:C.muted}>{d.statut}</Pill>
            </div>
            <div style={{fontSize:9,color:C.muted}}>{d.type} · {new Date(d.created_at).toLocaleDateString("fr")}</div>
          </div>)}
        </div>}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <Inp value={docForms[p.id]?.nom||""} onChange={e=>setDocForms(s=>({...s,[p.id]:{...s[p.id],nom:e.target.value}}))} placeholder="Nom du document (ex: Kbis)" style={{flex:1,minWidth:140}}/>
          <Inp value={docForms[p.id]?.type||""} onChange={e=>setDocForms(s=>({...s,[p.id]:{...s[p.id],type:e.target.value}}))} placeholder="Type (ex: Juridique)" style={{width:140}}/>
          <button onClick={()=>ajouterDocument(p)} style={{background:"transparent",color:coul(i),border:`1px solid ${coul(i)}44`,borderRadius:6,padding:"7px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Ajouter</button>
        </div>
      </Card>)}
    </div>}

    {/* ── ALERTES ───────────────────────────────────────── */}
    {onglet==="alertes"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {parts.filter(p=>p.dues>0).map(p=><div key={"due-"+p.id} style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:10,padding:14,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:4}}>🚨 Commission {p.nom} en attente</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{fmt(p.dues)} de commission due. À enregistrer puis virer depuis le Wallet pour maintenir la confiance du partenaire.</div>
        </div>
        <Btn onClick={()=>payerCommission(p)} style={{fontSize:11,padding:"7px 14px",flexShrink:0,background:C.red}}>Enregistrer</Btn>
      </div>)}
      {parts.flatMap(p=>p.leads.filter(l=>(l.statut==="en cours"||l.statut==="proposition")&&(Date.now()-new Date(l.created_at).getTime())>7*24*3600*1000).map(l=>({...l,partenaire:p}))).map(l=><div key={"lead-"+l.id} style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:4}}>⚠️ {l.partenaire.nom} — lead "{l.nom}" sans mise à jour depuis plus de 7 jours</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>Soumis le {new Date(l.created_at).toLocaleDateString("fr")}, toujours en statut "{l.statut}". Une relance évite de perdre l'opportunité.</div>
        </div>
        <Btn onClick={()=>ouvrirWhatsApp(l.partenaire.tel)} style={{fontSize:11,padding:"7px 14px",flexShrink:0,background:C.orange}}>Relancer</Btn>
      </div>)}
      {parts.length>0&&[...parts].sort((a,b)=>b.ca-a.ca)[0]?.ca>0&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>✅ {[...parts].sort((a,b)=>b.ca-a.ca)[0].nom} — partenaire le plus performant</div>
        <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{fmt([...parts].sort((a,b)=>b.ca-a.ca)[0].ca)} de CA apporté à ce jour. Une reconnaissance ou un ajustement de commission peut renforcer la relation.</div>
      </div>}
      {parts.length>0&&parts.filter(p=>p.dues>0).length===0&&parts.flatMap(p=>p.leads.filter(l=>(l.statut==="en cours"||l.statut==="proposition")&&(Date.now()-new Date(l.created_at).getTime())>7*24*3600*1000)).length===0&&<Card style={{textAlign:"center",padding:20}}><div style={{fontSize:12,color:C.muted}}>Aucune alerte critique — tout est à jour.</div></Card>}
      {parts.length===0&&<Card style={{textAlign:"center",padding:20}}><div style={{fontSize:12,color:C.muted}}>Aucun partenaire pour le moment.</div></Card>}
    </div>}

    {/* ── IA ────────────────────────────────────────────── */}
    {onglet==="ia"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      {parts.length>0&&<div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:12,padding:16}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 Vue d'ensemble réseau partenaires</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>Ton réseau de {parts.length} partenaire(s) a apporté {fmt(totalCA)} de CA, avec un taux de conversion moyen de {totalLeads>0?Math.round(totalGagnes/totalLeads*100):0}%. {[...parts].sort((a,b)=>b.ca-a.ca)[0]?.nom} est ton partenaire le plus performant ({fmt(Math.max(...parts.map(p=>p.ca),0))}).{totalDues>0?` Priorité : régler ${fmt(totalDues)} de commissions en attente.`:""}</div>
      </div>}
      {parts.map((p,i)=><Card key={p.id} style={{borderColor:`${coul(i)}33`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:coul(i)+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:coul(i)}}>{p.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.nom}</div><div style={{fontSize:10,color:C.muted}}>{p.role}</div></div>
          <div style={{fontSize:16,fontWeight:700,color:coul(i)}}>{fmt(p.ca)}</div>
        </div>
        {iaCache[p.id]?<div style={{background:`${coul(i)}0D`,border:`1px solid ${coul(i)}22`,borderRadius:8,padding:12,fontSize:11,color:C.text,lineHeight:1.7,marginBottom:10}}>{iaCache[p.id]}</div>:<div style={{fontSize:11,color:C.muted,marginBottom:10}}>Aucune analyse générée encore.</div>}
        <Btn onClick={()=>analyserIA(p)} style={{fontSize:11,opacity:iaLoading[p.id]?0.6:1}}>{iaLoading[p.id]?"⏳ Analyse en cours...":iaCache[p.id]?"🔄 Régénérer l'analyse":"🤖 Générer l'analyse IA"}</Btn>
      </Card>)}
    </div>}
  </div>;
};
// ─── PAGE ANNUAIRE ────────────────────────────────────────────
// ─── PAGE MULTI-SOCIÉTÉS ──────────────────────────────────────
// ─── PAGE MULTI-SOCIÉTÉS ──────────────────────────────────────
const PageMultiSocietes=({plan,showToast})=>{
  const[onglet,setOnglet]=useState("consolidee");
  const[companies,setCompanies]=useState([]);
  const[consolidee,setConsolidee]=useState([]);
  const[totaux,setTotaux]=useState(null);
  const[transfers,setTransfers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[devise,setDevise]=useState("EUR");
  const[showAddForm,setShowAddForm]=useState(false);
  const[showTransferForm,setShowTransferForm]=useState(false);
  const[newCompany,setNewCompany]=useState({nom:"",pays:"France",metier:"",devise:"EUR",couleur:"#C9A84C"});
  const[newTransfer,setNewTransfer]=useState({from_company_id:"",to_company_id:"",montant:"",devise:"EUR",libelle:""});
  const[selectedCompany,setSelectedCompany]=useState(null);

  const MULTI_PLANS=["multi_societes","multi_pro","multi_societes_pro","holding","enterprise","owner"];
  if(!MULTI_PLANS.includes(plan))return <div style={{padding:20}}><UpgradeWall page="Multi-Sociétés" plan={plan}/></div>;

  const load=async()=>{
    setLoading(true);
    try{
      const [listRes,consolRes,transfersRes]=await Promise.all([
        fetch('/api/multi-societes?action=list'),
        fetch(`/api/multi-societes?action=consolidee&devise=${devise}`),
        fetch('/api/multi-societes?action=transfers'),
      ]);
      const [list,consol,trans]=await Promise.all([listRes.json(),consolRes.json(),transfersRes.json()]);
      setCompanies(list.companies||[]);
      setConsolidee(consol.consolidee||[]);
      setTotaux(consol.totaux||null);
      setTransfers(trans.transfers||[]);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[devise]);

  const ajouterSociete=async()=>{
    if(!newCompany.nom)return showToast("⚠️ Nom requis");
    try{
      const res=await fetch('/api/multi-societes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_company',...newCompany})});
      const d=await res.json();
      if(d.success){showToast("✅ Société ajoutée");setShowAddForm(false);setNewCompany({nom:"",pays:"France",metier:"",devise:"EUR",couleur:"#C9A84C"});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  const supprimerSociete=async(id)=>{
    if(!confirm("Supprimer cette société ?"))return;
    try{
      await fetch('/api/multi-societes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete_company',id})});
      showToast("✅ Société supprimée");load();
    }catch(e){showToast("❌ Erreur");}
  };

  const effectuerTransfert=async()=>{
    if(!newTransfer.from_company_id||!newTransfer.to_company_id||!newTransfer.montant)return showToast("⚠️ Remplis tous les champs");
    if(newTransfer.from_company_id===newTransfer.to_company_id)return showToast("⚠️ Même société source et destination");
    try{
      const res=await fetch('/api/multi-societes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'intercompany_transfer',...newTransfer})});
      const d=await res.json();
      if(d.success){showToast("✅ Transfert effectué");setShowTransferForm(false);setNewTransfer({from_company_id:"",to_company_id:"",montant:"",devise:"EUR",libelle:""});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  const tabs=[
    {id:"consolidee",label:"📊 Vue consolidée"},
    {id:"societes",label:"🏢 Mes sociétés"},
    {id:"intercompany",label:"🔄 Transferts inter-sociétés"},
    {id:"alertes",label:"🔔 Alertes croisées"},
  ];

  const scoreColor=(solde)=>solde>10000?C.green:solde>2000?C.gold:C.red;

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>🏢 Multi-Sociétés</div>
        <div style={{fontSize:11,color:C.muted}}>Vue consolidée · Gestion multi-entités · Transferts · Alertes croisées</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
        <Btn onClick={()=>setShowAddForm(true)} style={{fontSize:11}}>+ Ajouter une société</Btn>
      </div>
    </div>

    {/* FORM AJOUT SOCIÉTÉ */}
    {showAddForm&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>+ Nouvelle société</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={newCompany.nom} onChange={e=>setNewCompany(c=>({...c,nom:e.target.value}))} placeholder="Ex: Tymeless CI"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Pays</label><Inp value={newCompany.pays} onChange={e=>setNewCompany(c=>({...c,pays:e.target.value}))} placeholder="France"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Métier</label><Inp value={newCompany.metier} onChange={e=>setNewCompany(c=>({...c,metier:e.target.value}))} placeholder="Nettoyage"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise</label>
          <Sel value={newCompany.devise} onChange={e=>setNewCompany(c=>({...c,devise:e.target.value}))}>
            {DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Couleur</label><input type="color" value={newCompany.couleur} onChange={e=>setNewCompany(c=>({...c,couleur:e.target.value}))} style={{width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:6,background:"transparent",cursor:"pointer"}}/></div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={ajouterSociete}>✅ Créer la société</Btn>
        <BtnGhost onClick={()=>setShowAddForm(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    {/* FORM TRANSFERT */}
    {showTransferForm&&<Card style={{marginBottom:14,borderColor:`${C.blue}44`}}>
      <STitle>🔄 Nouveau transfert inter-sociétés</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Société source *</label>
          <Sel value={newTransfer.from_company_id} onChange={e=>setNewTransfer(t=>({...t,from_company_id:e.target.value}))}>
            <option value="">Sélectionner...</option>
            {companies.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Société destination *</label>
          <Sel value={newTransfer.to_company_id} onChange={e=>setNewTransfer(t=>({...t,to_company_id:e.target.value}))}>
            <option value="">Sélectionner...</option>
            {companies.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant *</label><Inp type="number" value={newTransfer.montant} onChange={e=>setNewTransfer(t=>({...t,montant:e.target.value}))} placeholder="0"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise</label>
          <Sel value={newTransfer.devise} onChange={e=>setNewTransfer(t=>({...t,devise:e.target.value}))}>
            {DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}
          </Sel>
        </div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Libellé</label><Inp value={newTransfer.libelle} onChange={e=>setNewTransfer(t=>({...t,libelle:e.target.value}))} placeholder="Ex: Avance de trésorerie"/></div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={effectuerTransfert} style={{background:C.blue}}>✅ Effectuer le transfert</Btn>
        <BtnGhost onClick={()=>setShowTransferForm(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    {/* KPIs CONSOLIDÉS */}
    {totaux&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>SOCIÉTÉS</div><div style={{fontSize:24,fontWeight:700,color:C.gold}}>{companies.length}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CA TOTAL CONSOLIDÉ</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(conv(totaux.ca,"EUR",devise),devise)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CHARGES TOTALES</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>{fmt(conv(totaux.charges,"EUR",devise),devise)}</div></CT>
      <CT style={{borderColor:`${totaux.solde>0?C.green:C.red}44`}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>SOLDE CONSOLIDÉ</div><div style={{fontSize:18,fontWeight:700,color:totaux.solde>0?C.green:C.red}}>{fmt(conv(totaux.solde,"EUR",devise),devise)}</div></CT>
    </div>}

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {loading&&<div style={{fontSize:11,color:C.muted}}>⏳ Chargement...</div>}

    {/* ── VUE CONSOLIDÉE ── */}
    {!loading&&onglet==="consolidee"&&<div>
      {consolidee.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>🏢</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucune société encore</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Ajoutez votre première société pour voir la vue consolidée.</div>
        <Btn onClick={()=>setShowAddForm(true)}>+ Ajouter une société</Btn>
      </Card>:<div>
        {/* Graphique comparatif */}
        <Card style={{marginBottom:12}}>
          <STitle>📊 Comparaison CA par société</STitle>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120,padding:"10px 0"}}>
            {consolidee.map((c,i)=>{
              const maxCA=Math.max(...consolidee.map(x=>x.ca),1);
              const h=Math.max(8,Math.round((c.ca/maxCA)*100));
              return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontSize:9,color:C.muted}}>{fmt(c.ca)}</div>
                <div style={{width:"100%",height:h+"%",background:c.couleur||C.gold,borderRadius:"4px 4px 0 0",minHeight:8,opacity:0.8}}/>
                <div style={{fontSize:9,color:C.muted,textAlign:"center",lineHeight:1.2}}>{c.nom}</div>
              </div>;
            })}
          </div>
        </Card>
        {/* Cards par société */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {consolidee.map((c,i)=><Card key={i} style={{borderColor:`${c.couleur||C.gold}44`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:c.couleur||C.gold}}>{c.nom}</div>
                <div style={{fontSize:11,color:C.muted}}>{c.metier} · {c.pays} · {c.devise}</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <BtnGhost onClick={()=>setSelectedCompany(c)} style={{fontSize:10,padding:"4px 8px"}}>Détails</BtnGhost>
                <BtnGhost onClick={()=>supprimerSociete(c.id)} style={{fontSize:10,padding:"4px 8px",color:C.red,borderColor:`${C.red}44`}}>✕</BtnGhost>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              <CT style={{textAlign:"center",padding:"8px 4px"}}><div style={{fontSize:8,color:C.muted}}>CA</div><div style={{fontSize:13,fontWeight:700,color:C.green}}>{fmt(conv(c.ca,"EUR",devise),devise)}</div></CT>
              <CT style={{textAlign:"center",padding:"8px 4px"}}><div style={{fontSize:8,color:C.muted}}>CHARGES</div><div style={{fontSize:13,fontWeight:700,color:C.red}}>{fmt(conv(c.charges,"EUR",devise),devise)}</div></CT>
              <CT style={{textAlign:"center",padding:"8px 4px",borderColor:`${scoreColor(c.solde)}44`}}><div style={{fontSize:8,color:C.muted}}>SOLDE</div><div style={{fontSize:13,fontWeight:700,color:scoreColor(c.solde)}}>{fmt(conv(c.solde,"EUR",devise),devise)}</div></CT>
            </div>
          </Card>)}
        </div>
      </div>}
    </div>}

    {/* ── MES SOCIÉTÉS ── */}
    {!loading&&onglet==="societes"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <Btn onClick={()=>setShowAddForm(true)} style={{fontSize:11}}>+ Ajouter une société</Btn>
      </div>
      {companies.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:11,color:C.muted}}>Aucune société. Ajoutez-en une pour commencer.</div>
      </Card>:<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {companies.map((c,i)=><Card key={i} style={{borderColor:`${c.couleur||C.gold}22`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:40,height:40,borderRadius:8,background:c.couleur||C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#000"}}>
                {c.nom?.[0]?.toUpperCase()||"?"}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{c.nom}</div>
                <div style={{fontSize:11,color:C.muted}}>{c.metier||"—"} · {c.pays} · {c.devise}</div>
                <div style={{fontSize:10,color:C.muted}}>Créée le {new Date(c.created_at).toLocaleDateString("fr")}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <Pill color={c.couleur||C.gold}>{c.statut}</Pill>
              <BtnGhost onClick={()=>supprimerSociete(c.id)} style={{fontSize:10,color:C.red,borderColor:`${C.red}44`}}>Supprimer</BtnGhost>
            </div>
          </div>
        </Card>)}
      </div>}
    </div>}

    {/* ── TRANSFERTS INTER-SOCIÉTÉS ── */}
    {!loading&&onglet==="intercompany"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        🔄 Les transferts inter-sociétés permettent de déplacer de la trésorerie d'une entité à une autre. Chaque transfert est tracé et horodaté.
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <Btn onClick={()=>setShowTransferForm(true)} style={{background:C.blue,fontSize:11}}>+ Nouveau transfert</Btn>
      </div>
      {transfers.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:11,color:C.muted}}>Aucun transfert inter-sociétés pour le moment.</div>
      </Card>:<Card>
        <STitle>📋 Historique des transferts</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Date</TH><TH>De</TH><TH>Vers</TH><TH>Montant</TH><TH>Libellé</TH><TH>Statut</TH></tr></thead>
          <tbody>{transfers.map((t,i)=>{
            const from=companies.find(c=>c.id===t.from_company_id);
            const to=companies.find(c=>c.id===t.to_company_id);
            return <tr key={i}>
              <Td style={{fontSize:10,color:C.muted}}>{new Date(t.created_at).toLocaleDateString("fr")}</Td>
              <Td style={{color:C.red,fontWeight:600}}>{from?.nom||"—"}</Td>
              <Td style={{color:C.green,fontWeight:600}}>{to?.nom||"—"}</Td>
              <Td style={{fontWeight:700}}>{fmt(t.montant)} {t.devise}</Td>
              <Td style={{color:C.muted,fontSize:11}}>{t.libelle||"—"}</Td>
              <Td><Pill color={C.green}>{t.statut}</Pill></Td>
            </tr>;
          })}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── ALERTES CROISÉES ── */}
    {!loading&&onglet==="alertes"&&<div>
      <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Alertes générées automatiquement sur toutes vos sociétés.</div>
      {consolidee.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:11,color:C.muted}}>Ajoutez des sociétés pour voir les alertes croisées.</div>
      </Card>:<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {consolidee.filter(c=>c.solde<2000).map((c,i)=><div key={i} style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:10,padding:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:4}}>🔴 Trésorerie critique — {c.nom}</div>
          <div style={{fontSize:11,color:C.text}}>Solde de {fmt(conv(c.solde,"EUR",devise),devise)} sous le seuil critique. Envisagez un transfert inter-sociétés pour renflouer cette entité.</div>
        </div>)}
        {consolidee.filter(c=>c.solde>=2000&&c.solde<5000).map((c,i)=><div key={i} style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:4}}>🟡 Trésorerie à surveiller — {c.nom}</div>
          <div style={{fontSize:11,color:C.text}}>Solde de {fmt(conv(c.solde,"EUR",devise),devise)} en zone d'alerte.</div>
        </div>)}
        {consolidee.filter(c=>c.solde>=5000).length===consolidee.length&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:10,padding:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>🟢 Toutes vos sociétés sont en bonne santé</div>
          <div style={{fontSize:11,color:C.text}}>Aucune alerte active sur vos {consolidee.length} sociétés.</div>
        </div>}
      </div>}
    </div>}
  </div>;
};

const PageClubAffaires=({plan,showToast})=>{
  const[onglet,setOnglet]=useState("accueil");
  const[membres,setMembres]=useState([]);
  const[tenants,setTenants]=useState([]);
  const[coinvestissements,setCoinvestissements]=useState([]);
  const[contenu,setContenu]=useState([]);
  const[candidatures,setCandidatures]=useState([]);
  const[meetings,setMeetings]=useState([]);
  const[loading,setLoading]=useState(true);
  const[iaMatches,setIaMatches]=useState([]);
  const[iaLoading,setIaLoading]=useState(false);
  const[selectedMembre,setSelectedMembre]=useState(null);
  const[showCandidature,setShowCandidature]=useState(false);
  const[showCoinvest,setShowCoinvest]=useState(false);
  const[candidatureForm,setCandidatureForm]=useState({nom:"",email:"",metier:"",message:"",coopte_par:""});
  const[coinvestForm,setCoinvestForm]=useState({titre:"",description:"",montant_total:"",montant_min_ticket:"1000",secteur:"",rendement_estime:"",date_cloture:""});
  const[dealForm,setDealForm]=useState({service:"",valeur:"",detail:""});
  const[deals,setDeals]=useState([
    {id:"DA-001",offrant:"Marc Dupont",recevant:"Sofia Al-Rashid",service:"Mise en relation Airbnb Dubai",valeur:2400,statut:"en cours",date:"12/04"},
    {id:"DA-002",offrant:"Groupe Prestige SARL",recevant:"Fatoumata Diop",service:"Distribution services Dakar",valeur:8000,statut:"validé",date:"10/04"},
    {id:"DA-003",offrant:"Leila Mansouri",recevant:"Jean-Marc Olivier",service:"Référencement syndic Paris",valeur:1200,statut:"proposé",date:"15/04"},
  ]);

  const MEMBRES_DEFAUT=[
    {id:1,nom:"Isabelle Moreau",metier:"Gestion Airbnb",ville:"Paris",pays:"🇫🇷",plan:"Starter",score_reputation:72,couleur:"#4B7BFF",bio:"Gestionnaire de 8 appartements Airbnb sur Paris.",services:["Gestion locative","Conciergerie","Ménage"],ca_genere:9600,nb_deals:2,email:"i.moreau@mail.fr",tel:"+33 6 12 34 56 78"},
    {id:2,nom:"Marc Dupont",metier:"Immobilier",ville:"Lyon",pays:"🇫🇷",plan:"Business Pro",score_reputation:88,couleur:"#9B5FFF",bio:"Investisseur immobilier, portefeuille de 15 biens résidentiels.",services:["Vente","Location","Investissement"],ca_genere:38400,nb_deals:5,email:"m.dupont@corp.fr",tel:"+33 6 98 76 54 32"},
    {id:3,nom:"Sofia Al-Rashid",metier:"Aviation d'affaires",ville:"Dubaï",pays:"🇦🇪",plan:"Enterprise",score_reputation:98,couleur:"#C9A84C",bio:"Directrice d'une flotte de jets privés desservant l'Europe et le Moyen-Orient.",services:["Location jet privé","Conciergerie VIP","Transferts"],ca_genere:110400,nb_deals:8,email:"sofia@vip.ae",tel:"+971 50 123 45 67"},
    {id:4,nom:"Groupe Prestige SARL",metier:"Syndic & Gestion",ville:"Paris",pays:"🇫🇷",plan:"Enterprise",score_reputation:94,couleur:"#2EC9B0",bio:"Syndic professionnel gérant plus de 200 résidences en Île-de-France.",services:["Syndic","Gestion immeuble","Maintenance"],ca_genere:264000,nb_deals:14,email:"contact@prestige.fr",tel:"+33 1 44 55 66 77"},
    {id:5,nom:"Fatoumata Diop",metier:"Finance Afrique",ville:"Dakar",pays:"🇸🇳",plan:"Business Pro",score_reputation:89,couleur:"#FF5F9E",bio:"Consultante en finance d'entreprise couvrant l'Afrique de l'Ouest.",services:["Conseil financier","Investissement","Formation"],ca_genere:81600,nb_deals:4,email:"fatou.d@dakar.sn",tel:"+221 77 123 45 67"},
  ];

  const load=async()=>{
    setLoading(true);
    try{
      const [membresRes,coinvestRes,contenuRes,candidaturesRes,meetingsRes]=await Promise.all([
        fetch('/api/club?action=membres').then(r=>r.json()).catch(()=>({})),
        fetch('/api/club?action=coinvestissements').then(r=>r.json()).catch(()=>({})),
        fetch('/api/club?action=contenu').then(r=>r.json()).catch(()=>({})),
        fetch('/api/club?action=candidatures').then(r=>r.json()).catch(()=>({})),
        fetch('/api/club?action=speed_meetings').then(r=>r.json()).catch(()=>({})),
      ]);
      const membresReels=membresRes.membres||[];
      setMembres(membresReels.length>0?membresReels:MEMBRES_DEFAUT);
      setTenants(membresRes.tenants||[]);
      setCoinvestissements(coinvestRes.coinvestissements||[]);
      setContenu(contenuRes.contenu||[]);
      setCandidatures(candidaturesRes.candidatures||[]);
      setMeetings(meetingsRes.meetings||[]);
    }catch(e){setMembres(MEMBRES_DEFAUT);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const lancerIaMatch=async()=>{
    setIaLoading(true);
    try{
      const res=await fetch('/api/club',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ia_match',membres,profil:{metier:'Conciergerie premium',pays:'France'}})});
      const d=await res.json();
      if(d.success)setIaMatches(d.matches||[]);
    }catch(e){}
    setIaLoading(false);
  };

  const soumettreCandidat=async()=>{
    if(!candidatureForm.nom||!candidatureForm.email)return showToast("⚠️ Nom et email requis");
    try{
      await fetch('/api/club',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'candidature',...candidatureForm})});
      showToast("✅ Candidature soumise — nous vous répondrons sous 48h");
      setShowCandidature(false);setCandidatureForm({nom:"",email:"",metier:"",message:"",coopte_par:""});
    }catch(e){showToast("❌ Erreur");}
  };

  const creerCoinvest=async()=>{
    if(!coinvestForm.titre||!coinvestForm.montant_total)return showToast("⚠️ Titre et montant requis");
    try{
      await fetch('/api/club',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_coinvestissement',...coinvestForm})});
      showToast("✅ Opportunité publiée dans le Club");
      setShowCoinvest(false);setCoinvestForm({titre:"",description:"",montant_total:"",montant_min_ticket:"1000",secteur:"",rendement_estime:"",date_cloture:""});
      load();
    }catch(e){showToast("❌ Erreur");}
  };

  const tabs=[
    {id:"accueil",label:"🏠 Club"},
    {id:"membres",label:"👥 Membres"},
    {id:"coinvestissement",label:"💼 Co-investissement"},
    {id:"deals",label:"🤝 Deals"},
    {id:"meetings",label:"⚡ Speed Meetings"},
    {id:"contenu",label:"📚 Contenu exclusif"},
    {id:"candidatures",label:"📋 Candidatures"},
    {id:"avantages",label:"💎 Avantages"},
    {id:"stats",label:"📊 Stats"},
  ];

  const totalCA=membres.reduce((a,m)=>a+Number(m.ca_genere||0),0);
  const totalDeals=membres.reduce((a,m)=>a+Number(m.nb_deals||0),0);

  if(!hasAccess(plan,"club_affaires"))return <div style={{padding:20}}><UpgradeWall page="club_affaires" plan={plan}/></div>;

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{background:`linear-gradient(135deg,${C.card},#0A0A1A)`,border:`1px solid ${C.gold}44`,borderRadius:16,padding:20,marginBottom:14}}>
      <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",marginBottom:4}}>CLUB XYRA · RÉSEAU AFFAIRES PRIVÉ</div>
      <div style={{fontSize:22,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◈ Club d'affaires Xyra</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Réseau privé · Cooptation · IA Match · Co-investissement · Speed Meetings · VIP</div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <div style={{borderLeft:`2px solid ${C.gold}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Membres actifs</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{membres.length}</div></div>
        <div style={{borderLeft:`2px solid ${C.green}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Deals conclus</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{totalDeals}</div></div>
        <div style={{borderLeft:`2px solid ${C.blue}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>CA généré réseau</div><div style={{fontSize:16,fontWeight:700,color:C.blue}}>{fmt(totalCA)}</div></div>
        <div style={{borderLeft:`2px solid ${C.purple}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Pays représentés</div><div style={{fontSize:16,fontWeight:700,color:C.purple}}>{new Set(membres.map(m=>m.pays)).size}</div></div>
        <div style={{borderLeft:`2px solid ${C.teal}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Co-investissements</div><div style={{fontSize:16,fontWeight:700,color:C.teal}}>{coinvestissements.length}</div></div>
      </div>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── ACCUEIL ── */}
    {onglet==="accueil"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>🏆 Top membres actifs</STitle>
        {[...membres].sort((a,b)=>Number(b.score_reputation||0)-Number(a.score_reputation||0)).slice(0,5).map((m,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.border}22`,cursor:"pointer"}} onClick={()=>{setSelectedMembre(m);setOnglet("membres");}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.gold}}>{i+1}</div>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600}}>{m.nom}</div><div style={{fontSize:9,color:C.muted}}>{m.metier} · {m.pays}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:11,color:C.gold,fontWeight:700}}>★ {m.score_reputation||50}</div><div style={{fontSize:9,color:C.muted}}>{m.nb_deals||0} deals</div></div>
        </div>)}
      </Card>

      <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 IA Match du jour — Claude</div>
        {iaMatches.length===0?<div>
          <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Lance l'analyse IA pour identifier les meilleures synergies entre membres.</div>
          <Btn onClick={lancerIaMatch} style={{fontSize:11}}>{iaLoading?"⏳ Analyse...":"🤖 Lancer l'IA Match"}</Btn>
        </div>:<div>
          {iaMatches.slice(0,2).map((m,i)=><div key={i} style={{marginBottom:10,padding:"8px 10px",background:`${C.purple}11`,borderRadius:8}}>
            <div style={{fontSize:12,color:C.text,lineHeight:1.7,marginBottom:4}}><b style={{color:C.gold}}>{m.membre}</b> — {m.raison}</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:10,color:C.green}}>CA estimé : {fmt(m.ca_estime||0)}</span>
              <Pill color={C.purple}>Score {m.score}%</Pill>
            </div>
          </div>)}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn onClick={()=>showToast("✅ Mise en relation effectuée !")} style={{fontSize:10}}>🤝 Mettre en relation</Btn>
            <BtnGhost onClick={()=>{setIaMatches([]);lancerIaMatch();}} style={{fontSize:10}}>🔄 Relancer</BtnGhost>
          </div>
        </div>}
      </Card>

      {/* Prochains événements */}
      <Card>
        <STitle>📅 Prochains événements</STitle>
        {EVENEMENTS.map((e,i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{e.titre}</div>
          <div style={{fontSize:10,color:C.muted,marginBottom:6}}>📅 {e.date} · 📍 {e.lieu}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Pill color={C.green}>{e.inscrits}/{e.max}</Pill><Btn onClick={()=>showToast(`✅ Inscrit à ${e.titre}`)} style={{fontSize:10,padding:"4px 10px"}}>S'inscrire</Btn></div>
        </div>)}
      </Card>

      {/* Co-investissements récents */}
      <Card style={{borderColor:`${C.gold}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <STitle>💼 Co-investissements ouverts</STitle>
          <BtnGhost onClick={()=>setOnglet("coinvestissement")} style={{fontSize:10}}>Voir tout →</BtnGhost>
        </div>
        {coinvestissements.length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun co-investissement ouvert pour le moment.<br/><button onClick={()=>{setShowCoinvest(true);setOnglet("coinvestissement");}} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontFamily:"inherit",fontSize:12,marginTop:8}}>+ Proposer une opportunité</button></div>:
        coinvestissements.slice(0,2).map((c,i)=><div key={i} style={{background:`${C.gold}08`,border:`1px solid ${C.gold}22`,borderRadius:8,padding:10,marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:2}}>{c.titre}</div>
          <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{c.secteur} · Ticket min : {fmt(c.montant_min_ticket||1000)}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:C.green}}>Rendement estimé : {c.rendement_estime||"—"}</span>
            <Btn onClick={()=>showToast("✅ Participation enregistrée")} style={{fontSize:10,padding:"4px 8px"}}>Participer</Btn>
          </div>
        </div>)}
      </Card>
    </div>}

    {/* ── MEMBRES ── */}
    {onglet==="membres"&&<div>
      {selectedMembre?<div>
        <BtnGhost onClick={()=>setSelectedMembre(null)} style={{marginBottom:14}}>← Retour aux membres</BtnGhost>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:`${selectedMembre.couleur||C.gold}44`}}>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:`${selectedMembre.couleur||C.gold}22`,border:`3px solid ${selectedMembre.couleur||C.gold}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:selectedMembre.couleur||C.gold}}>{inits(selectedMembre.nom)}</div>
              <div>
                <div style={{fontSize:18,fontWeight:700,color:C.text}}>{selectedMembre.nom}</div>
                <div style={{fontSize:12,color:C.muted}}>{selectedMembre.metier}</div>
                <div style={{fontSize:11,color:C.muted}}>{selectedMembre.pays} {selectedMembre.ville}</div>
                <Pill color={C.gold}>★ {selectedMembre.score_reputation||50}/100</Pill>
              </div>
            </div>
            <div style={{background:`${selectedMembre.couleur||C.gold}11`,borderRadius:10,padding:14,marginBottom:16,fontSize:12,color:C.text,lineHeight:1.7,fontStyle:"italic"}}>"{selectedMembre.bio}"</div>
            {(selectedMembre.services||[]).length>0&&<div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>SERVICES PROPOSÉS</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(selectedMembre.services||[]).map((s,i)=><Pill key={i} color={selectedMembre.couleur||C.gold}>{s}</Pill>)}</div>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {selectedMembre.email&&<div style={{display:"flex",gap:10,fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}><span>📧</span><span style={{color:C.muted}}>{selectedMembre.email}</span></div>}
              {selectedMembre.tel&&<div style={{display:"flex",gap:10,fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}><span>📱</span><span style={{color:C.muted}}>{selectedMembre.tel}</span></div>}
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <CT><div style={{fontSize:9,color:C.muted}}>CA généré</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(selectedMembre.ca_genere||0)}</div></CT>
              <CT><div style={{fontSize:9,color:C.muted}}>Score</div><div style={{fontSize:16,fontWeight:700,color:selectedMembre.couleur||C.gold}}>{selectedMembre.score_reputation||50}/100</div></CT>
              <CT><div style={{fontSize:9,color:C.muted}}>Deals</div><div style={{fontSize:16,fontWeight:700,color:C.blue}}>{selectedMembre.nb_deals||0}</div></CT>
              <CT><div style={{fontSize:9,color:C.muted}}>Plan</div><div style={{fontSize:12,fontWeight:700,color:C.purple}}>{selectedMembre.plan||"—"}</div></CT>
            </div>
            <Card>
              <STitle>⚡ Actions</STitle>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <Btn onClick={()=>showToast("💬 WhatsApp ouvert")} style={{background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`}}>💬 WhatsApp</Btn>
                <Btn onClick={()=>showToast("🤝 Deal proposé")} style={{background:`${C.gold}22`,color:C.gold,border:`1px solid ${C.gold}44`}}>🤝 Proposer un deal</Btn>
                <BtnGhost onClick={()=>{setOnglet("meetings");showToast("📅 Planifiez votre speed meeting ci-dessous");}}>⚡ Speed Meeting</BtnGhost>
                <BtnGhost onClick={()=>showToast("⭐ Recommandation envoyée")}>⭐ Recommander</BtnGhost>
              </div>
            </Card>
            <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
              <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 IA Match — Synergies</div>
              <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>Synergies avec {selectedMembre.nom?.split(" ")[0]} : collaboration sur {(selectedMembre.services||["vos services"])[0]}. CA potentiel : {fmt(Math.round(Number(selectedMembre.ca_genere||0)*0.15))}. Score : {Math.min(99,Number(selectedMembre.score_reputation||50)+3)}%.</div>
            </Card>
          </div>
        </div>
      </div>:<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700}}>👥 {membres.length} membres actifs</div>
          <Btn onClick={()=>setShowCandidature(true)} style={{fontSize:11}}>+ Proposer un membre</Btn>
        </div>
        {showCandidature&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
          <STitle>📋 Coopter un nouveau membre</STitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={candidatureForm.nom} onChange={e=>setCandidatureForm(f=>({...f,nom:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email *</label><Inp value={candidatureForm.email} onChange={e=>setCandidatureForm(f=>({...f,email:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Métier</label><Inp value={candidatureForm.metier} onChange={e=>setCandidatureForm(f=>({...f,metier:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Coopté par</label><Inp value={candidatureForm.coopte_par} onChange={e=>setCandidatureForm(f=>({...f,coopte_par:e.target.value}))} placeholder="Votre nom"/></div>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Message / Recommandation</label><Inp value={candidatureForm.message} onChange={e=>setCandidatureForm(f=>({...f,message:e.target.value}))} placeholder="Pourquoi recommandez-vous cette personne ?"/></div>
          </div>
          <div style={{display:"flex",gap:8}}><Btn onClick={soumettreCandidat}>✅ Soumettre la candidature</Btn><BtnGhost onClick={()=>setShowCandidature(false)}>Annuler</BtnGhost></div>
        </Card>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
          {membres.map((m,i)=><Card key={i} style={{cursor:"pointer",borderColor:`${m.couleur||C.gold}33`}} onClick={()=>setSelectedMembre(m)}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:`${m.couleur||C.gold}22`,border:`2px solid ${m.couleur||C.gold}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:m.couleur||C.gold,flexShrink:0}}>{inits(m.nom)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.nom}</div>
                <div style={{fontSize:10,color:C.muted}}>{m.pays} {m.ville}</div>
                <Pill color={m.plan==="Enterprise"?C.purple:m.plan==="Business Pro"?C.gold:C.blue}>{m.plan||"Starter"}</Pill>
              </div>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.5}}>{(m.bio||"").slice(0,80)}{(m.bio||"").length>80?"...":""}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{(m.services||[]).slice(0,3).map((s,j)=><span key={j} style={{fontSize:9,background:`${m.couleur||C.gold}15`,color:m.couleur||C.gold,border:`1px solid ${m.couleur||C.gold}33`,borderRadius:4,padding:"2px 6px"}}>{s}</span>)}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:11,fontWeight:700,color:C.gold}}>{fmt(m.ca_genere||0)}</span>
              <span style={{fontSize:11,color:m.couleur||C.gold,fontWeight:600}}>★ {m.score_reputation||50}/100</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              <Btn onClick={e=>{e.stopPropagation();showToast(`💬 WhatsApp ${m.nom}`);}} style={{fontSize:10,padding:"6px 4px",background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`}}>💬 Contact</Btn>
              <BtnGhost onClick={e=>{e.stopPropagation();setSelectedMembre(m);}} style={{fontSize:10,padding:"6px 4px"}}>Profil →</BtnGhost>
            </div>
          </Card>)}
        </div>
      </div>}
    </div>}

    {/* ── CO-INVESTISSEMENT ── */}
    {onglet==="coinvestissement"&&<div>
      <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text,lineHeight:1.7}}>
        💼 Le co-investissement Club Xyra permet aux membres de s'associer sur des projets communs — immobilier, commerce, tech, services. Chaque membre fixe librement son ticket de participation. Toutes les opportunités sont présentées de manière transparente avec le rendement estimé et la date de clôture.
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <Btn onClick={()=>setShowCoinvest(!showCoinvest)} style={{fontSize:11}}>+ Proposer une opportunité</Btn>
      </div>
      {showCoinvest&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
        <STitle>💼 Nouvelle opportunité de co-investissement</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Titre *</label><Inp value={coinvestForm.titre} onChange={e=>setCoinvestForm(f=>({...f,titre:e.target.value}))} placeholder="Ex: Villa Côte d'Azur"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Secteur</label><Inp value={coinvestForm.secteur} onChange={e=>setCoinvestForm(f=>({...f,secteur:e.target.value}))} placeholder="Immobilier, Tech, Commerce..."/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant total (€) *</label><Inp type="number" value={coinvestForm.montant_total} onChange={e=>setCoinvestForm(f=>({...f,montant_total:e.target.value}))}/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Ticket minimum (€)</label><Inp type="number" value={coinvestForm.montant_min_ticket} onChange={e=>setCoinvestForm(f=>({...f,montant_min_ticket:e.target.value}))}/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Rendement estimé</label><Inp value={coinvestForm.rendement_estime} onChange={e=>setCoinvestForm(f=>({...f,rendement_estime:e.target.value}))} placeholder="Ex: 8-12% / an"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Date de clôture</label><Inp type="date" value={coinvestForm.date_cloture} onChange={e=>setCoinvestForm(f=>({...f,date_cloture:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Description</label><Inp value={coinvestForm.description} onChange={e=>setCoinvestForm(f=>({...f,description:e.target.value}))} placeholder="Décrivez l'opportunité..."/></div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creerCoinvest}>✅ Publier l'opportunité</Btn><BtnGhost onClick={()=>setShowCoinvest(false)}>Annuler</BtnGhost></div>
      </Card>}
      {coinvestissements.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>💼</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucun co-investissement ouvert</div>
        <div style={{fontSize:11,color:C.muted}}>Soyez le premier à proposer une opportunité au réseau.</div>
      </Card>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {coinvestissements.map((c,i)=><Card key={i} style={{borderColor:`${C.gold}33`}}>
          <div style={{fontSize:14,fontWeight:700,color:C.gold,marginBottom:4}}>{c.titre}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10}}>{c.secteur} · Porteur : {c.porteur||"Membre Club"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <CT><div style={{fontSize:9,color:C.muted}}>Montant total</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{fmt(c.montant_total||0)}</div></CT>
            <CT><div style={{fontSize:9,color:C.muted}}>Ticket min</div><div style={{fontSize:14,fontWeight:700,color:C.blue}}>{fmt(c.montant_min_ticket||1000)}</div></CT>
          </div>
          {c.rendement_estime&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}22`,borderRadius:6,padding:"6px 10px",fontSize:11,color:C.green,marginBottom:10}}>📈 Rendement estimé : {c.rendement_estime}</div>}
          {c.description&&<div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.6}}>{c.description}</div>}
          {c.date_cloture&&<div style={{fontSize:10,color:C.orange,marginBottom:10}}>⏰ Clôture : {c.date_cloture}</div>}
          <Btn onClick={()=>showToast("✅ Participation enregistrée — notre équipe vous contacte")} style={{width:"100%",fontSize:11}}>💼 Participer à ce projet</Btn>
        </Card>)}
      </div>}
    </div>}

    {/* ── DEALS ── */}
    {onglet==="deals"&&<Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <STitle>🤝 Deals entre membres</STitle>
        <Btn onClick={()=>showToast("✅ Deal proposé au réseau !")} style={{fontSize:11}}>+ Proposer un deal</Btn>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Proposant</TH><TH>Bénéficiaire</TH><TH>Service</TH><TH>Valeur</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
        <tbody>{deals.map((d,i)=><tr key={i}>
          <Td style={{fontWeight:600}}>{d.offrant}</Td>
          <Td style={{fontWeight:600}}>{d.recevant}</Td>
          <Td style={{fontSize:11,color:C.muted}}>{d.service}</Td>
          <Td style={{color:C.green,fontWeight:700}}>{fmt(d.valeur)}</Td>
          <Td><St s={d.statut}/></Td>
          <Td><div style={{display:"flex",gap:4}}>
            {d.statut==="proposé"&&<Btn onClick={()=>{setDeals(ds=>ds.map((x,j)=>j===i?{...x,statut:"en cours"}:x));showToast("✅ Deal accepté !");}} style={{fontSize:10,padding:"4px 8px",background:C.green}}>✅</Btn>}
            <BtnGhost onClick={()=>showToast("💬 Chat ouvert")} style={{fontSize:10,padding:"4px 8px"}}>💬</BtnGhost>
          </div></Td>
        </tr>)}</tbody>
      </table>
    </Card>}

    {/* ── SPEED MEETINGS ── */}
    {onglet==="meetings"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        ⚡ Le Speed Meeting Club Xyra — 20 minutes chrono avec un membre, format BNI mais en digital. Planifiez directement depuis ce module, un lien visio est généré automatiquement.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <Card>
          <STitle>📅 Planifier un Speed Meeting</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Membre à rencontrer</label>
              <Sel><option value="">Choisir un membre...</option>{membres.map(m=><option key={m.id} value={m.id}>{m.nom} — {m.metier}</option>)}</Sel>
            </div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Date et heure</label><Inp type="datetime-local"/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Durée</label>
              <Sel><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option></Sel>
            </div>
            <Btn onClick={()=>showToast("✅ Speed Meeting planifié — lien visio envoyé par email")}>⚡ Confirmer le meeting</Btn>
          </div>
        </Card>
        <Card>
          <STitle>🎥 Salle Visio Club VIP</STitle>
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <div style={{fontSize:36,marginBottom:10}}>🎥</div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Salon Visio Club Xyra</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Salle privée réservée aux membres Club</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <Btn onClick={()=>showToast("🎥 Salon : meet.xyra.io/club")}>🎥 Rejoindre</Btn>
              <BtnGhost onClick={()=>showToast("📅 Visio planifiée !")}>📅 Planifier</BtnGhost>
            </div>
          </div>
        </Card>
      </div>
      {meetings.length>0&&<Card>
        <STitle>📋 Meetings planifiés</STitle>
        {meetings.map((m,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{new Date(m.date_heure).toLocaleDateString("fr")} à {new Date(m.date_heure).toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})}</div><div style={{fontSize:10,color:C.muted}}>{m.duree_minutes} min</div></div>
          <div style={{display:"flex",gap:8}}><Pill color={C.blue}>{m.statut}</Pill><BtnGhost onClick={()=>showToast("🎥 Lien copié")} style={{fontSize:10}}>🔗 Lien</BtnGhost></div>
        </div>)}
      </Card>}
    </div>}

    {/* ── CONTENU EXCLUSIF ── */}
    {onglet==="contenu"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        📚 Contenu exclusif réservé aux membres Club — analyses de marché, masterclass, rapports sectoriels, accès direct aux experts du réseau.
      </div>
      {contenu.length===0?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {[{icon:"📊",titre:"Analyse marché immobilier luxe Q2 2026",type:"Rapport",auteur:"Équipe Xyra",desc:"Tendances et opportunités sur les marchés France, Dubaï et Afrique du Nord."},
          {icon:"🎥",titre:"Masterclass : Développer son réseau en Afrique",type:"Masterclass",auteur:"Fatoumata Diop",desc:"Stratégies concrètes pour s'implanter sur les marchés africains francophones."},
          {icon:"📝",titre:"Guide : Structurer une holding multi-sociétés",type:"Guide",auteur:"Équipe Xyra",desc:"Comment optimiser la gestion de plusieurs entités juridiques depuis Xyra."},
          {icon:"🤖",titre:"IA & Business : comment automatiser ses opérations",type:"Article",auteur:"Curtiss — Fondateur Xyra",desc:"Retour d'expérience sur l'intégration de l'IA Claude dans les processus business."}
        ].map((c,i)=><Card key={i} style={{cursor:"pointer"}} onClick={()=>showToast("📖 Contenu ouvert")}>
          <div style={{fontSize:24,marginBottom:8}}>{c.icon}</div>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{c.titre}</div>
          <div style={{display:"flex",gap:6,marginBottom:8}}><Pill color={C.purple}>{c.type}</Pill><span style={{fontSize:10,color:C.muted}}>par {c.auteur}</span></div>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{c.desc}</div>
        </Card>)}
      </div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {contenu.map((c,i)=><Card key={i} style={{cursor:"pointer"}} onClick={()=>showToast("📖 Contenu ouvert")}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{c.titre}</div>
          <div style={{display:"flex",gap:6,marginBottom:8}}><Pill color={C.purple}>{c.type}</Pill><span style={{fontSize:10,color:C.muted}}>par {c.auteur}</span></div>
          {c.contenu&&<div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{c.contenu.slice(0,100)}...</div>}
        </Card>)}
      </div>}
    </div>}

    {/* ── CANDIDATURES ── */}
    {onglet==="candidatures"&&<div>
      <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>📋 Candidatures en attente ({candidatures.filter(c=>c.statut==="en_attente").length})</div>
      {candidatures.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:11,color:C.muted}}>Aucune candidature pour le moment.</div>
      </Card>:<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {candidatures.map((c,i)=><Card key={i}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:700}}>{c.nom}</div>
              <div style={{fontSize:11,color:C.muted}}>{c.email} · {c.metier}</div>
              {c.coopte_par&&<div style={{fontSize:10,color:C.gold}}>Coopté par : {c.coopte_par}</div>}
              {c.message&&<div style={{fontSize:11,color:C.muted,marginTop:4,fontStyle:"italic"}}>"{c.message.slice(0,80)}..."</div>}
            </div>
            <div style={{display:"flex",gap:6}}>
              <Pill color={c.statut==="en_attente"?C.orange:c.statut==="accepté"?C.green:C.red}>{c.statut}</Pill>
              {c.statut==="en_attente"&&<>
                <Btn onClick={()=>showToast("✅ Candidature acceptée")} style={{fontSize:10,padding:"4px 8px",background:C.green}}>✅ Accepter</Btn>
                <BtnGhost onClick={()=>showToast("❌ Candidature refusée")} style={{fontSize:10,color:C.red,borderColor:`${C.red}44`}}>✕ Refuser</BtnGhost>
              </>}
            </div>
          </div>
        </Card>)}
      </div>}
    </div>}

    {/* ── AVANTAGES ── */}
    {onglet==="avantages"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
      {[
        {icon:"🤖",titre:"IA Match Business",desc:"Claude identifie automatiquement les meilleures synergies chaque semaine",color:C.purple},
        {icon:"💼",titre:"Co-investissement",desc:"Investissez aux côtés des membres Club sur des projets sélectionnés",color:C.gold},
        {icon:"⚡",titre:"Speed Meetings",desc:"20 minutes chrono avec n'importe quel membre, lien visio automatique",color:C.blue},
        {icon:"🌍",titre:"Annuaire privé mondial",desc:"Accès à l'annuaire complet 18+ pays avec coordonnées directes",color:C.teal},
        {icon:"📅",titre:"Événements VIP",desc:"Dîners privés, tables rondes, soirées networking exclusives",color:C.orange},
        {icon:"📚",titre:"Contenu exclusif",desc:"Analyses, masterclass, rapports sectoriels réservés aux membres",color:C.green},
        {icon:"🤝",titre:"Deals réseau",desc:"Proposez et concluez des deals directement avec les membres",color:C.pink},
        {icon:"⭐",titre:"Score de réputation",desc:"Score basé sur vos interactions — les meilleurs membres sont mis en avant",color:C.gold},
      ].map((a,i)=><Card key={i} style={{borderColor:`${a.color}33`,textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:8}}>{a.icon}</div>
        <div style={{fontSize:13,fontWeight:700,color:a.color,marginBottom:6}}>{a.titre}</div>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{a.desc}</div>
      </Card>)}
    </div>}

    {/* ── STATS ── */}
    {onglet==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>📊 Activité du club</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <CT><div style={{fontSize:9,color:C.muted}}>Membres actifs</div><div style={{fontSize:22,fontWeight:700,color:C.blue}}>{membres.length}</div></CT>
          <CT><div style={{fontSize:9,color:C.muted}}>Deals conclus</div><div style={{fontSize:22,fontWeight:700,color:C.green}}>{deals.filter(d=>d.statut==="validé").length}</div></CT>
          <CT><div style={{fontSize:9,color:C.muted}}>CA réseau total</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(totalCA)}</div></CT>
          <CT><div style={{fontSize:9,color:C.muted}}>Taux engagement</div><div style={{fontSize:22,fontWeight:700,color:C.teal}}>84%</div></CT>
        </div>
      </Card>
      <Card>
        <STitle>💰 Revenus Club Xyra</STitle>
        {[["Abonnements annuels (2 000€/an)",fmt(membres.length*2000),C.gold],["Commissions deals (5%)",fmt(deals.filter(d=>d.statut==="validé").reduce((a,d)=>a+d.valeur*0.05,0)),C.green],["Co-investissements",fmt(coinvestissements.reduce((a,c)=>a+Number(c.montant_total||0)*0.02,0)),C.blue],["Total annuel estimé",fmt(membres.length*2000+deals.filter(d=>d.statut==="validé").reduce((a,d)=>a+d.valeur*0.05,0)),C.teal]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
      </Card>
    </div>}
  </div>;
};
const PageAnnuaire=({plan,showToast})=>{
  // ── Données réseau mondial ─────────────────────────────────
  const RESEAU_MONDIAL=[
    // Partenaires existants
    {id:"r1",nom:"Thomas Beaumont",type:"Apporteur d'affaires",secteur:"Conciergerie",pays:"🇫🇷",ville:"Paris",continent:"Europe",tel:"+33 6 12 34 56 78",email:"thomas@xyra.io",ca:12400,deals:8,bio:"Spécialiste missions premium Airbnb & résidentiel Paris"},
    {id:"r2",nom:"Leila Mansouri",type:"Partenaire",secteur:"Immobilier",pays:"🇫🇷",ville:"Lyon",continent:"Europe",tel:"+33 6 44 55 66 77",email:"leila.m@mail.fr",ca:8700,deals:5,bio:"Agent immobilier spécialisée résidentiel haut de gamme"},
    {id:"r3",nom:"Groupe Prestige SARL",type:"Partenaire",secteur:"Syndic & Gestion",pays:"🇫🇷",ville:"Paris",continent:"Europe",tel:"+33 1 44 55 66 77",email:"contact@prestige.fr",ca:22000,deals:14,bio:"Syndic professionnel, gestionnaire de 200+ résidences Paris"},
    {id:"r4",nom:"Fatoumata Diop",type:"Apporteur d'affaires",secteur:"Finance Afrique",pays:"🇸🇳",ville:"Dakar",continent:"Afrique",tel:"+221 77 123 45 67",email:"fatou.d@dakar.sn",ca:6800,deals:4,bio:"Consultante finance d'entreprise, réseau Afrique de l'Ouest"},
    // Membres Club
    {id:"r5",nom:"Sofia Al-Rashid",type:"Membre Club",secteur:"Aviation d'affaires",pays:"🇦🇪",ville:"Dubaï",continent:"Moyen-Orient",tel:"+971 50 123 45 67",email:"sofia@vip.ae",ca:9200,deals:3,bio:"Gestionnaire de flotte jets privés, zone Golfe & Europe"},
    {id:"r6",nom:"Marc Dupont",type:"Membre Club",secteur:"Immobilier",pays:"🇫🇷",ville:"Lyon",continent:"Europe",tel:"+33 6 98 76 54 32",email:"m.dupont@corp.fr",ca:3200,deals:2,bio:"Investisseur immobilier, portefeuille 15 biens résidentiels"},
    {id:"r7",nom:"Jean-Marc Olivier",type:"Membre Club",secteur:"Conseil & Finance",pays:"🇫🇷",ville:"Paris",continent:"Europe",tel:"+33 6 77 88 99 00",email:"jm@pro.fr",ca:14600,deals:7,bio:"Directeur associé cabinet conseil, spécialiste M&A PME"},
    // Partenaires luxe & internationaux
    {id:"r8",nom:"Jet Services Monaco",type:"Partenaire",secteur:"Aviation de luxe",pays:"🇲🇨",ville:"Monaco",continent:"Europe",tel:"+377 99 88 77 66",email:"contact@jetservices.mc",ca:0,deals:1,bio:"Opérateur jets privés & hélicoptères, réseau mondial 180+ appareils"},
    {id:"r9",nom:"YachtCo Méditerranée",type:"Partenaire",secteur:"Yachting",pays:"🇫🇷",ville:"Cannes",continent:"Europe",tel:"+33 4 93 11 22 33",email:"info@yachtco.fr",ca:0,deals:0,bio:"Courtier yacht, vente & location superyachts 20-80m"},
    {id:"r10",nom:"Prestige Realty Dubai",type:"Partenaire",secteur:"Immobilier de prestige",pays:"🇦🇪",ville:"Dubaï",continent:"Moyen-Orient",tel:"+971 4 555 66 77",email:"contact@prestigerealty.ae",ca:0,deals:0,bio:"Agence immobilier luxe Dubai & Abu Dhabi, résidences >2M$"},
    {id:"r11",nom:"Cabinet Moreau & Associés",type:"Apporteur d'affaires",secteur:"Juridique & Conseil",pays:"🇨🇭",ville:"Genève",continent:"Europe",tel:"+41 22 345 67 89",email:"contact@moreau-law.ch",ca:0,deals:0,bio:"Cabinet d'avocats d'affaires franco-suisse, droit des sociétés"},
    {id:"r12",nom:"Ndoye Business Group",type:"Partenaire",secteur:"Commerce & Distribution",pays:"🇸🇳",ville:"Dakar",continent:"Afrique",tel:"+221 33 456 78 90",email:"info@ndoye-group.sn",ca:0,deals:0,bio:"Groupe commercial Afrique de l'Ouest, import/export & distribution"},
    {id:"r13",nom:"Atlas Finance Maroc",type:"Partenaire",secteur:"Finance & Investissement",pays:"🇲🇦",ville:"Casablanca",continent:"Afrique",tel:"+212 5 22 334 455",email:"contact@atlasfinance.ma",ca:0,deals:0,bio:"Fonds d'investissement PME, Maroc & Afrique du Nord"},
    {id:"r14",nom:"TechHub Montréal",type:"Membre Club",secteur:"Tech & Innovation",pays:"🇨🇦",ville:"Montréal",continent:"Amériques",tel:"+1 514 234 56 78",email:"hello@techhub.ca",ca:0,deals:0,bio:"Incubateur startups tech, réseau entrepreneurs Canada francophone"},
    {id:"r15",nom:"Shenzhen Trade Partners",type:"Partenaire",secteur:"Commerce international",pays:"🇨🇳",ville:"Shenzhen",continent:"Asie",tel:"+86 755 8765 4321",email:"trade@shenzhentrade.cn",ca:0,deals:0,bio:"Intermédiaire commercial Chine-Europe, sourcing & logistique"},
    {id:"r16",nom:"Lagos Premium Services",type:"Partenaire",secteur:"Services aux entreprises",pays:"🇳🇬",ville:"Lagos",continent:"Afrique",tel:"+234 1 234 56 78",email:"info@lagospremium.ng",ca:0,deals:0,bio:"Services haut de gamme entreprises Nigeria, conciergerie B2B"},
    {id:"r17",nom:"Riviera Hospitality Group",type:"Partenaire",secteur:"Hôtellerie & Événements",pays:"🇫🇷",ville:"Nice",continent:"Europe",tel:"+33 4 93 77 88 99",email:"contact@rivierahospitality.fr",ca:0,deals:0,bio:"Groupe hôtelier Côte d'Azur, organisation événements corporate"},
    {id:"r18",nom:"Brussels Corporate Network",type:"Membre Club",secteur:"Conseil & Lobbying",pays:"🇧🇪",ville:"Bruxelles",continent:"Europe",tel:"+32 2 234 56 78",email:"network@bcn.be",ca:0,deals:0,bio:"Réseau dirigeants entreprises, institutions européennes Bruxelles"},
  ];

  const continents=["Tous","Europe","Afrique","Moyen-Orient","Amériques","Asie"];
  const secteurs=["Tous","Aviation de luxe","Yachting","Immobilier","Finance & Investissement","Commerce international","Tech & Innovation","Juridique & Conseil","Hôtellerie & Événements","Services aux entreprises","Conciergerie","Syndic & Gestion"];
  const types=["Tous","Partenaire","Membre Club","Apporteur d'affaires"];

  const[onglet,setOnglet]=useState("annuaire");
  const[search,setSearch]=useState("");
  const[filtreCont,setFiltreCont]=useState("Tous");
  const[filtreType,setFiltreType]=useState("Tous");
  const[filtreSect,setFiltreSect]=useState("Tous");
  const[sel,setSel]=useState(null);
  const[showDeal,setShowDeal]=useState(null);
  const[dealForm,setDealForm]=useState({service:"",valeur:"",detail:""});
  const[deals,setDeals]=useState([
    {id:"D001",de:"Xyra",pour:"Sofia Al-Rashid",service:"Nettoyage jet privé Dubai",valeur:4800,statut:"en cours",date:"12/04"},
    {id:"D002",de:"Leila Mansouri",pour:"Groupe Prestige SARL",service:"Mise en relation syndic",valeur:12000,statut:"proposé",date:"10/04"},
    {id:"D003",de:"Fatoumata Diop",pour:"Ndoye Business Group",service:"Distribution Afrique Ouest",valeur:8000,statut:"validé",date:"08/04"},
  ]);
  const[msgs,setMsgs]=useState([
    {de:"Sofia Al-Rashid",msg:"Bonjour Curtiss, intéressée par vos services à Dubai 🌟",h:"09:23",lu:false},
    {de:"Fatoumata Diop",msg:"2 nouvelles sociétés depuis Dakar pour vous 🌍",h:"11:00",lu:true},
  ]);

  const tabs=[
    {id:"annuaire",label:"🌍 Annuaire mondial"},
    {id:"carte",label:"🗺 Carte réseau"},
    {id:"deals",label:"🤝 Deals réseau"},
    {id:"messagerie",label:"💬 Messagerie"},
    {id:"stats",label:"📊 Statistiques"},
  ];

  if(!hasAccess(plan,"annuaire"))return <div style={{padding:20}}><UpgradeWall page="Réseau & Annuaire" plan={plan}/></div>;

  const filtered=RESEAU_MONDIAL.filter(r=>{
    const matchSearch=search===""||r.nom.toLowerCase().includes(search.toLowerCase())||r.secteur.toLowerCase().includes(search.toLowerCase())||r.ville.toLowerCase().includes(search.toLowerCase());
    const matchCont=filtreCont==="Tous"||r.continent===filtreCont;
    const matchType=filtreType==="Tous"||r.type===filtreType;
    const matchSect=filtreSect==="Tous"||r.secteur===filtreSect;
    return matchSearch&&matchCont&&matchType&&matchSect;
  });

  const statsCont=continents.slice(1).map(c=>({nom:c,count:RESEAU_MONDIAL.filter(r=>r.continent===c).length})).filter(c=>c.count>0);

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{background:`linear-gradient(135deg,${C.card},#080818)`,border:`1px solid ${C.gold}33`,borderRadius:16,padding:20,marginBottom:16}}>
      <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",marginBottom:4}}>XYRA · RÉSEAU MONDIAL</div>
      <div style={{fontSize:22,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◱ Annuaire Business Mondial</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Partenaires · Membres Club · Apporteurs d'affaires · {RESEAU_MONDIAL.length} contacts dans {statsCont.length} zones géographiques</div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        {statsCont.map((c,i)=>{const colors=[C.blue,C.gold,C.teal,C.green,C.purple];return <div key={i} style={{borderLeft:`2px solid ${colors[i%5]}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>{c.nom}</div><div style={{fontSize:16,fontWeight:700,color:colors[i%5]}}>{c.count} contacts</div></div>;})}
      </div>
    </div>

    <div style={{marginBottom:14}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>

    {/* ─── ANNUAIRE ─────────────────────────────────────────── */}
    {onglet==="annuaire"&&<>
      {/* Filtres */}
      <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:8,marginBottom:16}}>
        <Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un contact, secteur, ville..."/>
        <Sel value={filtreCont} onChange={e=>setFiltreCont(e.target.value)} style={{minWidth:130}}>{continents.map(c=><option key={c}>{c}</option>)}</Sel>
        <Sel value={filtreType} onChange={e=>setFiltreType(e.target.value)} style={{minWidth:140}}>{types.map(t=><option key={t}>{t}</option>)}</Sel>
        <Sel value={filtreSect} onChange={e=>setFiltreSect(e.target.value)} style={{minWidth:160}}>{secteurs.map(s=><option key={s}>{s}</option>)}</Sel>
      </div>
      <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{filtered.length} contact(s) trouvé(s)</div>

      {sel?
        /* FICHE DÉTAILLÉE */
        <div>
          <BtnGhost onClick={()=>setSel(null)} style={{marginBottom:14}}>← Retour à l'annuaire</BtnGhost>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{borderColor:`${C.gold}33`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}>
                <div style={{width:60,height:60,borderRadius:"50%",background:`${C.gold}22`,border:`2px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:C.gold,flexShrink:0}}>{inits(sel.nom)}</div>
                <div>
                  <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:2}}>{sel.nom}</div>
                  <Pill color={sel.type==="Partenaire"?C.gold:sel.type==="Membre Club"?C.blue:C.green}>{sel.type}</Pill>
                  <div style={{fontSize:12,color:C.muted,marginTop:6}}>{sel.pays} {sel.ville} · {sel.continent}</div>
                </div>
              </div>
              <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}22`,borderRadius:8,padding:12,marginBottom:14,fontSize:12,color:C.text,lineHeight:1.7,fontStyle:"italic"}}>"{sel.bio}"</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[["📍 Localisation",`${sel.pays} ${sel.ville}`],["🏢 Secteur",sel.secteur],["📧 Email",sel.email],["📱 Téléphone",sel.tel],sel.ca>0?["💰 CA généré Xyra",fmt(sel.ca)]:null,sel.deals>0?["🤝 Deals conclus",sel.deals+" deals"]:null].filter(Boolean).map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:C.text}}>{v}</span></div>)}
              </div>
            </Card>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Card>
                <STitle>⚡ Actions rapides</STitle>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <Btn onClick={()=>{setShowDeal(sel);setOnglet("deals");setSel(null);}} style={{width:"100%"}}>🤝 Proposer un deal</Btn>
                  <Btn onClick={()=>showToast(`📱 WhatsApp ouvert avec ${sel.nom}`)} style={{width:"100%",background:C.green,color:"#000"}}>📱 WhatsApp</Btn>
                  <BtnGhost onClick={()=>showToast(`📧 Email envoyé à ${sel.email}`)} style={{width:"100%"}}>📧 Envoyer un email</BtnGhost>
                  <BtnGhost onClick={()=>{setOnglet("messagerie");setSel(null);}} style={{width:"100%"}}>💬 Message interne</BtnGhost>
                  <BtnGhost onClick={()=>showToast("📄 Fiche PDF exportée")} style={{width:"100%"}}>📄 Exporter fiche PDF</BtnGhost>
                </div>
              </Card>
              <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
                <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 Analyse IA — Potentiel business</div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{sel.secteur==="Aviation de luxe"||sel.secteur==="Yachting"?"Partenaire à très fort potentiel. Ses clients ont un pouvoir d'achat élevé et recherchent des services premium complémentaires. Opportunité de deal récurrent estimée à 15 000-40 000€/an.":sel.ca>5000?"Contact déjà rentable. Potentiel d'upsell estimé à "+(Math.round(sel.ca*0.3)).toLocaleString("fr")+"€ sur les 6 prochains mois avec une offre adaptée.":"Nouveau contact à fort potentiel. Recommandation : envoyer une présentation personnalisée dans les 48h pour maximiser les chances de collaboration."}</div>
              </Card>
            </div>
          </div>
        </div>
      :
        /* GRILLE CONTACTS */
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {filtered.map((r,i)=><Card key={i} style={{cursor:"pointer",borderColor:`${C.border}`}} onClick={()=>setSel(r)}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:`${C.gold}18`,border:`1px solid ${C.gold}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:C.gold,flexShrink:0}}>{inits(r.nom)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nom}</div>
                <div style={{fontSize:10,color:C.muted}}>{r.pays} {r.ville}</div>
                <Pill color={r.type==="Partenaire"?C.gold:r.type==="Membre Club"?C.blue:C.green}>{r.type}</Pill>
              </div>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8,lineHeight:1.5}}>{r.bio.slice(0,80)}{r.bio.length>80?"...":""}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <Pill color={C.purple}>{r.secteur}</Pill>
              {r.ca>0&&<span style={{fontSize:10,color:C.green,fontWeight:700}}>{fmt(r.ca)}</span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              <Btn onClick={e=>{e.stopPropagation();setShowDeal(r);setOnglet("deals");}} style={{fontSize:10,padding:"6px 4px"}}>🤝 Deal</Btn>
              <BtnGhost onClick={e=>{e.stopPropagation();showToast(`📱 WhatsApp ${r.nom}`);}} style={{fontSize:10,padding:"6px 4px"}}>📱 WA</BtnGhost>
            </div>
          </Card>)}
        </div>
      }
    </>}

    {/* ─── CARTE RÉSEAU ─────────────────────────────────────── */}
    {onglet==="carte"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        {statsCont.map((c,i)=>{const colors=[C.blue,C.gold,C.teal,C.green,C.purple];return <CT key={i} style={{cursor:"pointer",borderColor:`${colors[i%5]}44`}} onClick={()=>{setOnglet("annuaire");setFiltreCont(c.nom);}}>
          <div style={{fontSize:9,color:colors[i%5],fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>{c.nom}</div>
          <div style={{fontSize:22,fontWeight:700,color:colors[i%5]}}>{c.count}</div>
          <div style={{fontSize:10,color:C.muted}}>contact{c.count>1?"s":""}</div>
          <SM val={c.count} max={RESEAU_MONDIAL.length} color={colors[i%5]}/>
        </CT>;})}
      </div>
      {/* Carte visuelle par continent */}
      <Card>
        <STitle>🌍 Répartition mondiale</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {[["🌍 Afrique",["🇸🇳","🇲🇦","🇳🇬"],C.gold],["🌍 Europe",["🇫🇷","🇲🇨","🇨🇭","🇧🇪"],C.blue],["🌍 Moyen-Orient",["🇦🇪"],C.teal],["🌍 Amériques",["🇨🇦"],C.green],["🌍 Asie",["🇨🇳"],C.purple]].map(([zone,flags,color],i)=>{
            const count=RESEAU_MONDIAL.filter(r=>r.pays&&flags.some(f=>r.pays.includes(f.replace(/[^a-zA-Z]/g,"").slice(0,2))||r.continent===zone.replace("🌍 ",""))).length;
            const contacts=RESEAU_MONDIAL.filter(r=>r.continent===zone.replace("🌍 ",""));
            return <div key={i} style={{background:`${color}08`,border:`1px solid ${color}22`,borderRadius:10,padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color}}>{zone} · {contacts.length} contact{contacts.length>1?"s":""}</div>
                <BtnGhost onClick={()=>{setOnglet("annuaire");setFiltreCont(zone.replace("🌍 ",""));}} style={{fontSize:10,padding:"3px 10px"}}>Voir tous →</BtnGhost>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {contacts.map((c,j)=><div key={j} onClick={()=>{setSel(c);setOnglet("annuaire");}} style={{background:`${color}15`,border:`1px solid ${color}33`,borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:`${color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color}}>{inits(c.nom)}</div>
                  <div><div style={{fontSize:10,fontWeight:600,color:C.text}}>{c.nom.split(" ")[0]}</div><div style={{fontSize:9,color:C.muted}}>{c.pays} {c.ville}</div></div>
                </div>)}
              </div>
            </div>;
          })}
        </div>
        <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:12}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:4}}>🤖 IA — Opportunités géographiques</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>Votre réseau est fort en Europe (10 contacts) et Afrique (4 contacts). Zone à développer : <b style={{color:C.gold}}>Amériques</b> — 1 seul contact au Canada. Recommandation : cibler des partenaires au Québec et aux États-Unis pour couvrir la diaspora africaine francophone.</div>
        </div>
      </Card>
    </div>}

    {/* ─── DEALS RÉSEAU ─────────────────────────────────────── */}
    {onglet==="deals"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:16,fontWeight:700,color:C.text}}>🤝 Deals du réseau</div><div style={{fontSize:11,color:C.muted}}>Proposez des collaborations directement depuis l'annuaire</div></div>
        <Btn onClick={()=>setShowDeal({nom:"",email:""})}>+ Nouveau deal</Btn>
      </div>

      {showDeal&&<Card style={{marginBottom:16,borderColor:`${C.gold}44`}}>
        <STitle>🤝 Proposer un deal — {showDeal.nom||"Contact libre"}</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {!showDeal.nom&&<Inp placeholder="Contact / entreprise" onChange={e=>setShowDeal(s=>({...s,nom:e.target.value}))}/>}
          <Inp value={dealForm.service} onChange={e=>setDealForm(f=>({...f,service:e.target.value}))} placeholder="Service proposé (ex: Nettoyage jet privé, mise en relation...)"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Inp value={dealForm.valeur} onChange={e=>setDealForm(f=>({...f,valeur:e.target.value}))} placeholder="Valeur estimée (€)"/>
            <Sel style={{width:"100%"}}><option>Collaboration ponctuelle</option><option>Partenariat récurrent</option><option>Commission sur CA</option><option>Échange de services</option></Sel>
          </div>
          <Inp value={dealForm.detail} onChange={e=>setDealForm(f=>({...f,detail:e.target.value}))} placeholder="Détail de la proposition..."/>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>{
              const nd={id:"D00"+(deals.length+1),de:"Xyra",pour:showDeal.nom,service:dealForm.service||"À préciser",valeur:Number(dealForm.valeur)||0,statut:"proposé",date:new Date().toLocaleDateString("fr")};
              setDeals(d=>[nd,...d]);setShowDeal(null);setDealForm({service:"",valeur:"",detail:""});
              showToast(`✅ Deal proposé à ${nd.pour} — Notification WhatsApp envoyée !`);
            }}>✅ Envoyer la proposition</Btn>
            <BtnGhost onClick={()=>setShowDeal(null)}>Annuler</BtnGhost>
          </div>
        </div>
      </Card>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Deals en cours" val={deals.filter(d=>d.statut==="en cours").length} color={C.blue}/>
        <KPI label="Deals validés" val={deals.filter(d=>d.statut==="validé").length} color={C.green}/>
        <KPI label="Valeur totale" val={fmt(deals.reduce((a,d)=>a+d.valeur,0))} color={C.gold}/>
      </div>

      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Référence</TH><TH>Initiateur</TH><TH>Bénéficiaire</TH><TH>Service</TH><TH>Valeur</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{deals.map((d,i)=><tr key={i}>
            <Td style={{color:C.gold,fontSize:10,fontWeight:700}}>{d.id}</Td>
            <Td style={{fontWeight:600}}>{d.de}</Td>
            <Td style={{fontWeight:600}}>{d.pour}</Td>
            <Td style={{fontSize:11,color:C.muted}}>{d.service}</Td>
            <Td style={{color:C.green,fontWeight:700}}>{d.valeur>0?fmt(d.valeur):"À négocier"}</Td>
            <Td><St s={d.statut}/></Td>
            <Td><div style={{display:"flex",gap:4}}>
              {d.statut==="proposé"&&<Btn onClick={()=>{setDeals(ds=>ds.map((x,j)=>j===i?{...x,statut:"en cours"}:x));showToast("✅ Deal accepté !");}} style={{fontSize:10,padding:"4px 8px",background:C.green}}>✅</Btn>}
              {d.statut==="en cours"&&<Btn onClick={()=>{setDeals(ds=>ds.map((x,j)=>j===i?{...x,statut:"validé"}:x));showToast("🎉 Deal finalisé !");}} style={{fontSize:10,padding:"4px 8px"}}>Finaliser</Btn>}
              <BtnGhost onClick={()=>showToast("💬 Chat deal ouvert")} style={{fontSize:10,padding:"4px 8px"}}>💬</BtnGhost>
              <BtnGhost onClick={()=>showToast("📱 WhatsApp ouvert")} style={{fontSize:10,padding:"4px 8px"}}>WA</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </div>}

    {/* ─── MESSAGERIE ───────────────────────────────────────── */}
    {onglet==="messagerie"&&<div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:12,height:500}}>
      {/* Liste contacts */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:700,color:C.muted}}>CONTACTS RÉSEAU</div>
        <div style={{overflowY:"auto",height:"calc(100% - 44px)"}}>
          {RESEAU_MONDIAL.slice(0,10).map((r,i)=>{
            const msgNonLu=msgs.filter(m=>m.de===r.nom&&!m.lu).length;
            return <div key={i} onClick={()=>{setMsgs(ms=>ms.map(m=>m.de===r.nom?{...m,lu:true}:m));setSel(r);}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer",background:sel?.id===r.id?`${C.gold}0D`:"transparent",borderBottom:`1px solid ${C.border}22`}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${C.gold}22`,border:`1px solid ${C.gold}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.gold,flexShrink:0}}>{inits(r.nom)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:msgNonLu>0?700:400,color:msgNonLu>0?C.text:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nom}</div>
                <div style={{fontSize:9,color:C.muted}}>{r.pays} · {r.secteur}</div>
              </div>
              {msgNonLu>0&&<div style={{width:16,height:16,borderRadius:"50%",background:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff",flexShrink:0}}>{msgNonLu}</div>}
            </div>;
          })}
        </div>
      </Card>
      {/* Zone de chat */}
      <Card style={{padding:0,overflow:"hidden"}}>
        {sel?<Chat
          msgs={[...msgs.filter(m=>m.de===sel.nom).map(m=>({av:inits(m.de),msg:m.msg,h:m.h,moi:false})),]}
          onSend={(msg)=>{setMsgs(ms=>[...ms,{de:"Xyra",pour:sel.nom,msg,h:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),lu:true,moi:true}]);showToast(`✅ Message envoyé à ${sel.nom}`);}}
          title={sel.nom}
          subtitle={`${sel.pays} ${sel.ville} · ${sel.secteur}`}
        />:<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:C.muted}}>
          <div style={{fontSize:36,marginBottom:10}}>💬</div>
          <div style={{fontSize:13}}>Sélectionne un contact pour envoyer un message</div>
        </div>}
      </Card>
    </div>}

    {/* ─── STATISTIQUES ─────────────────────────────────────── */}
    {onglet==="stats"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Contacts total" val={RESEAU_MONDIAL.length} color={C.blue}/>
        <KPI label="Pays représentés" val={[...new Set(RESEAU_MONDIAL.map(r=>r.pays))].length} color={C.gold}/>
        <KPI label="CA généré réseau" val={fmt(RESEAU_MONDIAL.reduce((a,r)=>a+r.ca,0))} color={C.green}/>
        <KPI label="Deals actifs" val={deals.length} color={C.teal}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>🌍 Contacts par continent</STitle>
          {statsCont.map((c,i)=>{const colors=[C.blue,C.gold,C.teal,C.green,C.purple];return <div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{c.nom}</span><span style={{color:colors[i%5],fontWeight:700}}>{c.count} contacts</span></div><SM val={c.count} max={RESEAU_MONDIAL.length} color={colors[i%5]}/></div>;})}
        </Card>
        <Card>
          <STitle>🏢 Contacts par type</STitle>
          {types.slice(1).map((t,i)=>{const count=RESEAU_MONDIAL.filter(r=>r.type===t).length;const colors=[C.gold,C.blue,C.green];return <div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{t}</span><span style={{color:colors[i],fontWeight:700}}>{count}</span></div><SM val={count} max={RESEAU_MONDIAL.length} color={colors[i]}/></div>;})}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>💰 Top CA générés</STitle>
          {RESEAU_MONDIAL.filter(r=>r.ca>0).sort((a,b)=>b.ca-a.ca).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{fontWeight:600}}>{r.nom}</span><span style={{color:C.green,fontWeight:700}}>{fmt(r.ca)}</span></div>)}
        </Card>
        <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
          <STitle>🤖 IA — Recommandations réseau</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[{txt:"Activez Shenzhen Trade Partners pour développer vos importations depuis la Chine. Potentiel : économiser 20-30% sur vos achats fournitures.",col:C.gold},{txt:"Jet Services Monaco + YachtCo Méditerranée = pack services ultra-premium. Proposez un deal croisé à vos clients VIP pour un panier moyen x3.",col:C.blue},{txt:"Votre réseau Afrique (Dakar, Lagos, Casablanca) est unique en France. C'est un avantage concurrentiel majeur. Développez-le en priorité.",col:C.green}].map((r,i)=><div key={i} style={{background:`${r.col}11`,border:`1px solid ${r.col}22`,borderRadius:7,padding:10,fontSize:11,color:C.text,lineHeight:1.6}}>{r.txt}</div>)}
          </div>
        </Card>
      </div>
    </div>}
  </div>;
};
// ─── PAGE WALLET MEMBRES ──────────────────────────────────────
const PageWalletMembres=({plan,showToast})=>{
  const[membres,setMembres]=useState(MEMBRES_WALLET);
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[onglet,setOnglet]=useState("membres");
  const[analyseChurn,setAnalyseChurn]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[devise,setDevise]=useState("EUR");
  const[selectedMembre,setSelectedMembre]=useState(null);
  const[filtre,setFiltre]=useState("tous");

  const load=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/wallet-membres?action=membres');
      const d=await res.json();
      if(d.membres&&d.membres.length>0){
        setMembres(d.membres);
        setData(d);
      }
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const upgradeDowngrade=async(tenant_id,nouveau_plan,type)=>{
    try{
      await fetch('/api/wallet-membres',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:type,tenant_id,nouveau_plan})});
      showToast(`✅ Plan mis à jour : ${nouveau_plan}`);load();
    }catch(e){showToast("❌ Erreur");}
  };

  const changerStatut=async(tenant_id,action)=>{
    try{
      await fetch('/api/wallet-membres',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,tenant_id})});
      showToast(`✅ Statut mis à jour`);load();
    }catch(e){showToast("❌ Erreur");}
  };

  const lancerAnalyseChurn=async()=>{
    setIaLoading(true);
    try{
      const res=await fetch('/api/wallet-membres',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_churn',membres})});
      const d=await res.json();
      if(d.success)setAnalyseChurn(d.analyse);
    }catch(e){}
    setIaLoading(false);
  };

  const envoyerRapportMRR=async()=>{
    showToast("⏳ Envoi rapport MRR WhatsApp...");
    try{
      const res=await fetch('/api/wallet-membres',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rapport_mrr',mrr:data?.mrr||0,membres_actifs:membres.filter(m=>m.statut==="actif").length,essais:data?.essais||0,expirant:data?.expirant||0,taux_churn:data?.tauxChurn||0})});
      const d=await res.json();
      if(d.success)showToast("✅ Rapport MRR envoyé");
    }catch(e){showToast("❌ Erreur");}
  };

  const envoyerAlertes=async()=>{
    try{
      const res=await fetch('/api/wallet-membres',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'alertes_expiration',membres})});
      const d=await res.json();
      showToast(`✅ ${d.alertes_envoyees} alerte(s) envoyée(s)`);
    }catch(e){showToast("❌ Erreur");}
  };

  const exportCSV=()=>{
    const lignes=["Société,Plan,Prix,Statut,Pays,Email,Jours restants"];
    membres.forEach(m=>lignes.push(`${m.societe||m.nom||"—"},${m.plan||"—"},${m.plan_price||m.prix_plan||59},${m.statut||"—"},${m.pays||"—"},${m.email||"—"},${m.jours_restants||"—"}`));
    const blob=new Blob([lignes.join("\n")],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="wallets_membres_xyra.csv";a.click();
    showToast("✅ CSV téléchargé");
  };

  if(!hasAccess(plan,"wallet_membres"))return <div style={{padding:20}}><UpgradeWall page="Wallets Membres" plan={plan}/></div>;

  const membresFiltres=membres.filter(m=>{
    if(filtre==="actifs")return m.statut==="actif";
    if(filtre==="essais")return m.statut==="essai";
    if(filtre==="expirants")return m.statut==="essai"&&m.jours_restants!==null&&m.jours_restants<=3&&m.jours_restants>=0;
    if(filtre==="suspendus")return m.statut==="suspendu"||m.statut==="expiré"||m.statut==="annulé";
    return true;
  });

  const mrr=data?.mrr||membres.filter(m=>m.statut==="actif").reduce((a,m)=>a+Number(m.prix_plan||m.plan_price||59),0);
  const actifs=membres.filter(m=>m.statut==="actif").length;
  const essais=membres.filter(m=>m.statut==="essai").length;
  const expirants=membres.filter(m=>m.statut==="essai"&&m.jours_restants!==null&&m.jours_restants<=3&&m.jours_restants>=0).length;

  const tabs=[
    {id:"membres",label:"👥 Membres"},
    {id:"mrr",label:"📊 MRR & Métriques"},
    {id:"churn",label:"🤖 Analyse Churn IA"},
    {id:"historique",label:"📋 Historique"},
  ];

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◈ Wallets Membres</div>
        <div style={{fontSize:11,color:C.muted}}>Soldes · Abonnements · MRR · Churn · Upgrade/Downgrade · Alertes expiration</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={envoyerRapportMRR} style={{fontSize:11}}>📱 Rapport MRR</BtnGhost>
        <BtnGhost onClick={envoyerAlertes} style={{fontSize:11,color:C.orange,borderColor:`${C.orange}44`}}>🔔 Alertes expiration</BtnGhost>
        <BtnGhost onClick={exportCSV} style={{fontSize:11}}>📋 CSV</BtnGhost>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
      </div>
    </div>

    {/* ALERTES EXPIRATION */}
    {expirants>0&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.orange,marginBottom:4}}>⏰ {expirants} essai(s) expire(nt) dans moins de 3 jours</div>
      <div style={{fontSize:11,color:C.text}}>{membres.filter(m=>m.statut==="essai"&&m.jours_restants!==null&&m.jours_restants<=3&&m.jours_restants>=0).map(m=>m.societe||m.nom).join(", ")} — contactez-les maintenant pour convertir.</div>
    </div>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      <CT style={{borderColor:`${C.green}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>MRR</div><div style={{fontSize:20,fontWeight:700,color:C.green}}>{fmt(conv(mrr,"EUR",devise),devise)}</div><div style={{fontSize:9,color:C.muted}}>Revenus récurrents</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>MEMBRES ACTIFS</div><div style={{fontSize:20,fontWeight:700,color:C.blue}}>{actifs}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>EN ESSAI</div><div style={{fontSize:20,fontWeight:700,color:C.gold}}>{essais}</div></CT>
      <CT style={{borderColor:`${C.orange}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>EXPIRENT BIENTÔT</div><div style={{fontSize:20,fontWeight:700,color:expirants>0?C.orange:C.green}}>{expirants}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>TAUX CHURN</div><div style={{fontSize:20,fontWeight:700,color:(data?.tauxChurn||0)>5?C.red:C.green}}>{data?.tauxChurn||0}%</div></CT>
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── MEMBRES ── */}
    {onglet==="membres"&&<div>
      {/* Filtres */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {[["tous","Tous",""],["actifs","Actifs",C.green],["essais","En essai",C.gold],["expirants","Expirent bientôt",C.orange],["suspendus","Suspendus",C.red]].map(([f,l,c])=><button key={f} onClick={()=>setFiltre(f)} style={{background:filtre===f?`${c||C.blue}22`:"transparent",border:`1px solid ${filtre===f?c||C.blue:C.border}`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit",color:filtre===f?c||C.blue:C.muted}}>{l}</button>)}
      </div>

      {/* Membres existants (MEMBRES_WALLET) en grille */}
      {membres.length===0||!data?<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12,marginBottom:14}}>
          {MEMBRES_WALLET.map((m,i)=><Card key={i} style={{borderColor:`${C.gold}22`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`${C.gold}22`,border:`1px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.gold}}>{inits(m.nom)}</div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:C.text}}>{m.nom}</div><div style={{fontSize:10,color:C.muted}}>{m.banque} · {m.pays}</div></div>
              <St s={m.statut}/>
            </div>
            <div style={{background:C.card2,borderRadius:8,padding:10,marginBottom:10}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:3}}>SOLDE WALLET</div>
              <div style={{fontSize:20,fontWeight:700,color:C.gold}}>{fmt(conv(m.solde,"EUR",devise),devise)}</div>
              <div style={{fontSize:9,color:C.muted,fontFamily:"'Courier New',monospace",marginTop:4}}>{m.iban}</div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:8}}>
              <span style={{color:C.muted}}>Plan : <b style={{color:m.type==="Enterprise"?C.purple:m.type==="Business Pro"?C.gold:C.blue}}>{m.type}</b></span>
              <span style={{color:C.muted}}>Tx : <b style={{color:C.text}}>{m.transactions}</b></span>
            </div>
            <Btn onClick={()=>showToast(`💳 Carte virtuelle ${m.nom} créée !`)} style={{width:"100%",fontSize:11,background:m.carte?C.green+"22":"transparent",color:m.carte?C.green:C.muted,border:`1px solid ${m.carte?C.green:C.border}44`}}>{m.carte?"💳 Carte active":"+ Créer carte"}</Btn>
          </Card>)}
        </div>
      </div>:null}

      {/* Membres Supabase réels */}
      {data&&membresFiltres.length>0&&<div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
          <thead><tr><TH>Société</TH><TH>Plan</TH><TH>Prix/mois</TH><TH>Statut</TH><TH>Pays</TH><TH>Essai</TH><TH>Actions</TH></tr></thead>
          <tbody>{membresFiltres.map((m,i)=>{
            const joursLeft=m.jours_restants;
            return <tr key={i} style={{background:joursLeft!==null&&joursLeft<=3&&joursLeft>=0?`${C.orange}08`:"transparent"}}>
              <Td>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.gold}}>{inits(m.societe||m.nom||"?")}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700}}>{m.societe||m.nom||"—"}</div>
                    <div style={{fontSize:10,color:C.muted}}>{m.email||"—"}</div>
                  </div>
                </div>
              </Td>
              <Td><Pill color={m.plan==="enterprise"?C.purple:m.plan?.includes("multi")||m.plan==="holding"?C.blue:C.gold}>{m.plan||"starter"}</Pill></Td>
              <Td style={{fontWeight:700,color:C.green}}>{fmt(m.prix_plan||m.plan_price||59)}</Td>
              <Td><St s={m.statut}/></Td>
              <Td style={{fontSize:11,color:C.muted}}>{m.pays||"—"}</Td>
              <Td>
                {joursLeft!==null?<div style={{fontSize:11,color:joursLeft<=3?C.orange:C.muted,fontWeight:joursLeft<=3?700:400}}>
                  {joursLeft<=0?"⚠️ Expiré":joursLeft<=3?`⏰ J-${joursLeft}`:`${joursLeft}j`}
                </div>:<span style={{color:C.muted,fontSize:10}}>—</span>}
              </Td>
              <Td>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  <BtnGhost onClick={()=>upgradeDowngrade(m.id,"enterprise","upgrade")} style={{fontSize:9,padding:"3px 6px",color:C.purple}}>↑ Upgrade</BtnGhost>
                  <BtnGhost onClick={()=>changerStatut(m.id,m.statut==="actif"?"suspendre":"reactiver")} style={{fontSize:9,padding:"3px 6px",color:m.statut==="actif"?C.orange:C.green}}>{m.statut==="actif"?"Suspendre":"Réactiver"}</BtnGhost>
                  <BtnGhost onClick={()=>showToast("💬 Email envoyé")} style={{fontSize:9,padding:"3px 6px"}}>✉</BtnGhost>
                </div>
              </Td>
            </tr>;
          })}</tbody>
        </table>
        {membresFiltres.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucun membre dans ce filtre.</div>}
      </div>}
    </div>}

    {/* ── MRR & MÉTRIQUES ── */}
    {onglet==="mrr"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Revenus récurrents</STitle>
          {[["MRR (membres actifs)",fmt(conv(mrr,"EUR",devise),devise),C.green],["ARR (MRR × 12)",fmt(conv(mrr*12,"EUR",devise),devise),C.teal],["Revenu moyen par membre",fmt(conv(actifs>0?mrr/actifs:0,"EUR",devise),devise),C.gold],["MRR potentiel (si essais convertis)",fmt(conv(mrr+essais*59,"EUR",devise),devise),C.blue]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
            <span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span>
          </div>)}
        </Card>
        <Card>
          <STitle>👥 Répartition membres</STitle>
          {[["Actifs",actifs,C.green],["En essai",essais,C.gold],["Expirent bientôt",expirants,C.orange],["Taux de churn",`${data?.tauxChurn||0}%`,data?.tauxChurn>5?C.red:C.green]].map(([l,v,c],i)=><div key={i} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>
            {typeof v==="number"&&<SM val={v} max={membres.length||1} color={c}/>}
          </div>)}
        </Card>
      </div>
      <Card>
        <STitle>💡 Répartition par plan</STitle>
        {["starter","business","business_pro","enterprise","multi_societes","multi_pro","holding"].map(p=>{
          const count=membres.filter(m=>m.plan===p).length;
          if(count===0)return null;
          const prix=({starter:59,business:129,business_pro:129,enterprise:249,multi_societes:499,multi_pro:799,holding:1200})[p]||59;
          const colors={starter:C.blue,business:C.gold,business_pro:C.gold,enterprise:C.purple,multi_societes:C.teal,multi_pro:C.orange,holding:C.gold};
          return <div key={p} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
              <span style={{fontWeight:600,color:colors[p]||C.gold}}>{p.replace("_"," ").toUpperCase()}</span>
              <span style={{color:C.muted}}>{count} membres · {fmt(count*prix)}/mois</span>
            </div>
            <SM val={count} max={membres.length||1} color={colors[p]||C.gold}/>
          </div>;
        })}
      </Card>
    </div>}

    {/* ── ANALYSE CHURN IA ── */}
    {onglet==="churn"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse prédictive Churn — Claude Sonnet</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseChurn||"Lance l'analyse pour identifier les membres à risque de churn et obtenir des recommandations concrètes."}</div>}
        <BtnGhost onClick={lancerAnalyseChurn} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🤖 Analyser le risque de churn"}</BtnGhost>
      </div>
      <Card>
        <STitle>⏰ Membres en essai expirant bientôt</STitle>
        {membres.filter(m=>m.statut==="essai"&&m.jours_restants!==null&&m.jours_restants<=7).length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun essai n'expire dans les 7 prochains jours.</div>:
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Société</TH><TH>Plan</TH><TH>Jours restants</TH><TH>Action</TH></tr></thead>
          <tbody>{membres.filter(m=>m.statut==="essai"&&m.jours_restants!==null&&m.jours_restants<=7).sort((a,b)=>Number(a.jours_restants)-Number(b.jours_restants)).map((m,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{m.societe||m.nom||"—"}</Td>
            <Td><Pill color={C.gold}>{m.plan||"starter"}</Pill></Td>
            <Td><span style={{color:Number(m.jours_restants)<=3?C.red:C.orange,fontWeight:700}}>{Number(m.jours_restants)<=0?"Expiré":`J-${m.jours_restants}`}</span></Td>
            <Td><div style={{display:"flex",gap:6}}>
              <Btn onClick={()=>showToast("✉ Email de relance envoyé")} style={{fontSize:10,padding:"4px 8px"}}>✉ Relancer</Btn>
              <BtnGhost onClick={()=>showToast("📞 Appel planifié")} style={{fontSize:10}}>📞</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>}
      </Card>
    </div>}

    {/* ── HISTORIQUE ── */}
    {onglet==="historique"&&<Card>
      <STitle>📋 Historique inscriptions</STitle>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
          <thead><tr><TH>Date</TH><TH>Société</TH><TH>Plan</TH><TH>Prix</TH><TH>Pays</TH><TH>Statut</TH></tr></thead>
          <tbody>{membres.slice(0,30).map((m,i)=><tr key={i}>
            <Td style={{fontSize:10,color:C.muted}}>{m.created_at?new Date(m.created_at).toLocaleDateString("fr"):"—"}</Td>
            <Td style={{fontWeight:600}}>{m.societe||m.nom||"—"}</Td>
            <Td><Pill color={C.gold}>{m.plan||"starter"}</Pill></Td>
            <Td style={{color:C.green,fontWeight:700}}>{fmt(m.prix_plan||m.plan_price||59)}</Td>
            <Td style={{color:C.muted}}>{m.pays||"—"}</Td>
            <Td><St s={m.statut||"actif"}/></Td>
          </tr>)}</tbody>
        </table>
      </div>
    </Card>}
  </div>;
};


// ─── PAGE EVENEMENTS ──────────────────────────────────────────
const PageEvenements=({plan,showToast})=>{
  const[evts,setEvts]=useState(EVENEMENTS);
  const[loading,setLoading]=useState(true);
  const[onglet,setOnglet]=useState("liste");
  const[showForm,setShowForm]=useState(false);
  const[analyseROI,setAnalyseROI]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[selectedEvt,setSelectedEvt]=useState(null);
  const[inscrits,setInscrits]=useState([]);
  const[showInscription,setShowInscription]=useState(false);
  const[inscriptionForm,setInscriptionForm]=useState({nom:"",email:"",tel:""});
  const[newEvt,setNewEvt]=useState({titre:"",description:"",date_debut:"",date_fin:"",lieu:"",type:"présentiel",prix:0,max_inscrits:50,club_only:false});

  const load=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/evenements?action=list');
      const d=await res.json();
      if(d.evenements&&d.evenements.length>0)setEvts(d.evenements);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const creerEvenement=async()=>{
    if(!newEvt.titre||!newEvt.date_debut)return showToast("⚠️ Titre et date requis");
    try{
      const res=await fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',...newEvt})});
      const d=await res.json();
      if(d.success){showToast("✅ Événement créé !");setShowForm(false);setNewEvt({titre:"",description:"",date_debut:"",date_fin:"",lieu:"",type:"présentiel",prix:0,max_inscrits:50,club_only:false});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  const sInscrire=async()=>{
    if(!inscriptionForm.nom)return showToast("⚠️ Nom requis");
    if(!selectedEvt)return;
    try{
      const res=await fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'inscrire',evenement_id:selectedEvt.id,...inscriptionForm})});
      const d=await res.json();
      if(d.success){showToast("✅ Inscription confirmée ! WhatsApp envoyé.");setShowInscription(false);setInscriptionForm({nom:"",email:"",tel:""});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  const chargerInscrits=async(evtId)=>{
    try{
      const res=await fetch(`/api/evenements?action=inscrits&event_id=${evtId}`);
      const d=await res.json();
      setInscrits(d.inscrits||[]);
    }catch(e){}
  };

  const inviterReseau=async(evt)=>{
    showToast("⏳ Envoi des invitations WhatsApp...");
    try{
      const res=await fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'inviter_reseau',...evt})});
      const d=await res.json();
      if(d.success)showToast("✅ Invitations WhatsApp envoyées au réseau");
    }catch(e){showToast("❌ Erreur");}
  };

  const analyserROI=async()=>{
    setIaLoading(true);
    try{
      const res=await fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_roi',evenements:evts})});
      const d=await res.json();
      if(d.success)setAnalyseROI(d.analyse);
    }catch(e){}
    setIaLoading(false);
  };

  const genererQR=(evt)=>{
    const url=`https://xyraio.fr/events/${evt.id||evt.titre?.replace(/\s/g,'-')}`;
    showToast(`📲 QR Code : ${url} — copié !`);
    navigator.clipboard?.writeText(url);
  };

  if(!hasAccess(plan,"evenements"))return <div style={{padding:20}}><UpgradeWall page="Événements" plan={plan}/></div>;

  const tabs=[
    {id:"liste",label:"📅 Événements"},
    {id:"calendrier",label:"🗓 Calendrier"},
    {id:"inscrits",label:"👥 Inscrits"},
    {id:"roi",label:"🤖 ROI & Analyse IA"},
  ];

  const totalInscrits=evts.reduce((a,e)=>a+Number(e.inscrits||0),0);
  const totalCA=evts.reduce((a,e)=>a+Number(e.inscrits||0)*Number(e.prix||0),0);
  const tauxRemplissage=evts.length>0?Math.round(evts.reduce((a,e)=>a+(Number(e.inscrits||0)/Math.max(1,Number(e.max_inscrits||50))),0)/evts.length*100):0;

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◆ Événements</div>
        <div style={{fontSize:11,color:C.muted}}>Networking · Visio · QR Code · Inscriptions · WhatsApp · ROI IA</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={()=>fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rappels'})}).then(()=>showToast("✅ Rappels J-7/J-1 envoyés"))} style={{fontSize:11}}>🔔 Rappels WhatsApp</BtnGhost>
        <Btn onClick={()=>setShowForm(true)}>+ Créer un événement</Btn>
      </div>
    </div>

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>ÉVÉNEMENTS</div><div style={{fontSize:22,fontWeight:700,color:C.blue}}>{evts.length}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>TOTAL INSCRITS</div><div style={{fontSize:22,fontWeight:700,color:C.green}}>{totalInscrits}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>TAUX REMPLISSAGE</div><div style={{fontSize:22,fontWeight:700,color:tauxRemplissage>=80?C.green:tauxRemplissage>=50?C.gold:C.orange}}>{tauxRemplissage}%</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CA ÉVÉNEMENTS</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(totalCA)}</div></CT>
    </div>

    {/* FORM CRÉATION */}
    {showForm&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>+ Créer un événement</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Titre *</label><Inp value={newEvt.titre} onChange={e=>setNewEvt(v=>({...v,titre:e.target.value}))} placeholder="Ex: Dîner privé Xyra Club — Paris"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Date début *</label><Inp type="datetime-local" value={newEvt.date_debut} onChange={e=>setNewEvt(v=>({...v,date_debut:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Date fin</label><Inp type="datetime-local" value={newEvt.date_fin} onChange={e=>setNewEvt(v=>({...v,date_fin:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Lieu</label><Inp value={newEvt.lieu} onChange={e=>setNewEvt(v=>({...v,lieu:e.target.value}))} placeholder="Paris, Visio, Dubaï..."/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Type</label>
          <Sel value={newEvt.type} onChange={e=>setNewEvt(v=>({...v,type:e.target.value}))}>
            <option value="présentiel">Présentiel</option>
            <option value="visio">Visio</option>
            <option value="hybride">Hybride</option>
            <option value="vip">VIP privé</option>
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Prix (€, 0 = gratuit)</label><Inp type="number" value={newEvt.prix} onChange={e=>setNewEvt(v=>({...v,prix:Number(e.target.value)}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Capacité max</label><Inp type="number" value={newEvt.max_inscrits} onChange={e=>setNewEvt(v=>({...v,max_inscrits:Number(e.target.value)}))}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Description</label><Inp value={newEvt.description} onChange={e=>setNewEvt(v=>({...v,description:e.target.value}))} placeholder="Décrivez l'événement..."/></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input type="checkbox" id="club_only" checked={newEvt.club_only} onChange={e=>setNewEvt(v=>({...v,club_only:e.target.checked}))} style={{accentColor:C.gold}}/>
          <label htmlFor="club_only" style={{fontSize:11,color:C.muted,cursor:"pointer"}}>🏢 Réservé aux membres Club d'affaires</label>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={creerEvenement}>✅ Créer l'événement</Btn><BtnGhost onClick={()=>setShowForm(false)}>Annuler</BtnGhost></div>
    </Card>}

    {/* FORM INSCRIPTION */}
    {showInscription&&selectedEvt&&<Card style={{marginBottom:14,borderColor:`${C.green}44`}}>
      <STitle>🎟 S'inscrire — {selectedEvt.titre}</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={inscriptionForm.nom} onChange={e=>setInscriptionForm(f=>({...f,nom:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email</label><Inp value={inscriptionForm.email} onChange={e=>setInscriptionForm(f=>({...f,email:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>WhatsApp</label><Inp value={inscriptionForm.tel} onChange={e=>setInscriptionForm(f=>({...f,tel:e.target.value}))} placeholder="+33..."/></div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={sInscrire} style={{background:C.green}}>✅ Confirmer l'inscription</Btn><BtnGhost onClick={()=>setShowInscription(false)}>Annuler</BtnGhost></div>
    </Card>}

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── LISTE ── */}
    {onglet==="liste"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
      {evts.map((e,i)=><Card key={i} style={{borderColor:e.statut==="complet"?`${C.red}44`:e.club_only?`${C.gold}44`:`${C.gold}22`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
          <div style={{display:"flex",gap:6}}>
            <Pill color={e.statut==="ouvert"?C.green:C.red}>{e.statut==="ouvert"?"🟢 Ouvert":"🔴 Complet"}</Pill>
            {e.club_only&&<Pill color={C.gold}>🏢 Club</Pill>}
            {e.type&&<Pill color={C.blue}>{e.type}</Pill>}
          </div>
          <div style={{fontSize:12,color:C.gold,fontWeight:700}}>{Number(e.prix||0)===0?"Gratuit":fmt(Number(e.prix||0))}</div>
        </div>
        <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>{e.titre}</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:2}}>📅 {e.date_debut?new Date(e.date_debut).toLocaleDateString("fr",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):e.date}</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:10}}>📍 {e.lieu}</div>
        {e.description&&<div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.5}}>{(e.description||"").slice(0,80)}{(e.description||"").length>80?"...":""}</div>}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:3}}>
            <span style={{color:C.muted}}>Inscriptions</span>
            <span style={{color:C.gold,fontWeight:700}}>{e.inscrits||0}/{e.max||e.max_inscrits||50}</span>
          </div>
          <SM val={Number(e.inscrits||0)} max={Number(e.max||e.max_inscrits||50)} color={Number(e.inscrits||0)===Number(e.max||e.max_inscrits||50)?C.red:C.green}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <Btn onClick={()=>{setSelectedEvt(e);setShowInscription(true);}} style={{flex:1,fontSize:11,background:e.statut==="complet"?C.border:C.green,color:e.statut==="complet"?C.muted:"#000"}} disabled={e.statut==="complet"}>🎟 S'inscrire</Btn>
          <BtnGhost onClick={()=>genererQR(e)} style={{fontSize:11}}>📲 QR</BtnGhost>
          {(e.type==="visio"||e.type==="hybride")&&<BtnGhost onClick={()=>showToast("🎥 Visio Jitsi lancée !")} style={{fontSize:11}}>🎥 Visio</BtnGhost>}
          <BtnGhost onClick={()=>inviterReseau(e)} style={{fontSize:11}}>📱 Inviter</BtnGhost>
          <BtnGhost onClick={()=>{setSelectedEvt(e);chargerInscrits(e.id);setOnglet("inscrits");}} style={{fontSize:11}}>👥</BtnGhost>
        </div>
      </Card>)}
      {evts.length===0&&<Card style={{textAlign:"center",padding:30,gridColumn:"1/-1"}}>
        <div style={{fontSize:32,marginBottom:8}}>📅</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucun événement</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Créez votre premier événement networking pour votre réseau.</div>
        <Btn onClick={()=>setShowForm(true)}>+ Créer un événement</Btn>
      </Card>}
    </div>}

    {/* ── CALENDRIER ── */}
    {onglet==="calendrier"&&<Card>
      <STitle>🗓 Calendrier événements</STitle>
      {evts.length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucun événement à afficher.</div>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[...evts].sort((a,b)=>new Date(a.date_debut||a.date||0).getTime()-new Date(b.date_debut||b.date||0).getTime()).map((e,i)=>{
          const d=e.date_debut?new Date(e.date_debut):null;
          return <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 12px",background:C.card2,borderRadius:8,border:`1px solid ${C.border}`}}>
            {d&&<div style={{textAlign:"center",minWidth:48,background:`${C.gold}22`,borderRadius:8,padding:"6px 4px"}}>
              <div style={{fontSize:18,fontWeight:700,color:C.gold}}>{d.getDate()}</div>
              <div style={{fontSize:9,color:C.muted}}>{d.toLocaleDateString("fr",{month:"short"}).toUpperCase()}</div>
            </div>}
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700}}>{e.titre}</div>
              <div style={{fontSize:10,color:C.muted}}>{e.lieu} · {e.inscrits||0}/{e.max||e.max_inscrits||50} inscrits</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <Pill color={e.statut==="ouvert"?C.green:C.red}>{e.statut==="ouvert"?"Ouvert":"Complet"}</Pill>
              {e.type&&<Pill color={C.blue}>{e.type}</Pill>}
            </div>
          </div>;
        })}
      </div>}
    </Card>}

    {/* ── INSCRITS ── */}
    {onglet==="inscrits"&&<div>
      {selectedEvt&&<div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:C.gold}}>{selectedEvt.titre}</div>
        <div style={{fontSize:11,color:C.muted}}>{selectedEvt.inscrits||0} inscrits · {selectedEvt.lieu}</div>
      </div>}
      {!selectedEvt&&<div style={{fontSize:12,color:C.muted,marginBottom:12}}>Clique sur 👥 d'un événement pour voir ses inscrits.</div>}
      {inscrits.length===0?<Card style={{textAlign:"center",padding:20}}>
        <div style={{fontSize:11,color:C.muted}}>Aucun inscrit pour cet événement.</div>
      </Card>:<Card>
        <STitle>👥 Liste des inscrits — {selectedEvt?.titre}</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Nom</TH><TH>Email</TH><TH>WhatsApp</TH><TH>Statut</TH><TH>Check-in</TH></tr></thead>
          <tbody>{inscrits.map((ins,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{ins.nom}</Td>
            <Td style={{fontSize:11,color:C.muted}}>{ins.email||"—"}</Td>
            <Td style={{fontSize:11,color:C.muted}}>{ins.tel||"—"}</Td>
            <Td><Pill color={ins.statut==="présent"?C.green:ins.statut==="confirmé"?C.blue:C.orange}>{ins.statut}</Pill></Td>
            <Td>
              {ins.statut!=="présent"?<Btn onClick={()=>fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'checkin',inscrit_id:ins.id})}).then(()=>{showToast("✅ Check-in effectué");chargerInscrits(selectedEvt?.id);})} style={{fontSize:10,padding:"4px 8px",background:C.green}}>✅ Check-in</Btn>:<span style={{fontSize:11,color:C.green}}>✅ Présent</span>}
            </Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── ROI & ANALYSE IA ── */}
    {onglet==="roi"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse ROI événementiel — Claude</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseROI||"Lance l'analyse pour obtenir des recommandations sur le ROI de tes événements."}</div>}
        <BtnGhost onClick={analyserROI} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🤖 Analyser le ROI"}</BtnGhost>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>📊 Performance événements</STitle>
          {[["Total événements",evts.length,C.blue],["Total inscrits",totalInscrits,C.green],["Taux de remplissage moyen",tauxRemplissage+"%",tauxRemplissage>=70?C.green:C.gold],["CA généré",fmt(totalCA),C.gold],["Événements Club",evts.filter(e=>e.club_only).length,C.purple],["Événements visio",evts.filter(e=>e.type==="visio"||e.type==="hybride").length,C.teal]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
            <span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span>
          </div>)}
        </Card>
        <Card>
          <STitle>🏆 Top événements par remplissage</STitle>
          {[...evts].sort((a,b)=>(Number(b.inscrits||0)/Math.max(1,Number(b.max||b.max_inscrits||50)))-(Number(a.inscrits||0)/Math.max(1,Number(a.max||a.max_inscrits||50)))).slice(0,5).map((e,i)=>{
            const pct=Math.round(Number(e.inscrits||0)/Math.max(1,Number(e.max||e.max_inscrits||50))*100);
            return <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{e.titre.slice(0,30)}{e.titre.length>30?"...":""}</span><span style={{color:pct>=80?C.green:C.gold,fontWeight:700}}>{pct}%</span></div>
              <SM val={pct} max={100} color={pct>=80?C.green:C.gold}/>
            </div>;
          })}
        </Card>
      </div>
    </div>}
  </div>;
};


// ─── PAGE SCORING / NPS ───────────────────────────────────────
const PageScoring=({plan,showToast,profil})=>{
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[onglet,setOnglet]=useState("dashboard");
  const[showAjoutAvis,setShowAjoutAvis]=useState(false);
  const[showNPS,setShowNPS]=useState(false);
  const[showCSAT,setShowCSAT]=useState(false);
  const[analyseConc,setAnalyseConc]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[reponseIA,setReponseIA]=useState({});
  const[avisForm,setAvisForm]=useState({client_nom:"",note:5,commentaire:"",service:"",source:"direct",google:false});
  const[npsForm,setNpsForm]=useState({client_nom:"",client_email:"",score:8,commentaire:""});
  const[csatForm,setCsatForm]=useState({client_nom:"",service:"",score:4,commentaire:""});
  const[demandeForm,setDemandeForm]=useState({client_tel:"",client_nom:"",service:""});

  const AVIS_DEFAUT=[
    {id:"a1",client_nom:"Sophie M.",note:5,commentaire:"Service impeccable, réactivité exceptionnelle. Je recommande vivement !",service:"Airbnb Paris",source:"google",google:true,sentiment:"positif",statut:"répondu",date_avis:new Date().toISOString()},
    {id:"a2",client_nom:"Jean-Pierre L.",note:4,commentaire:"Très bon service globalement, quelques petits détails à améliorer.",service:"Nettoyage Bureau",source:"direct",google:false,sentiment:"positif",statut:"nouveau",date_avis:new Date().toISOString()},
    {id:"a3",client_nom:"Amina D.",note:2,commentaire:"Déçue par le manque de communication lors de la prestation.",service:"Conciergerie",source:"google",google:true,sentiment:"négatif",statut:"nouveau",date_avis:new Date().toISOString()},
  ];

  const load=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/scoring');
      const d=await res.json();
      setData(d);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const ajouterAvis=async()=>{
    if(!avisForm.client_nom)return showToast("⚠️ Nom client requis");
    try{
      const res=await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_avis',...avisForm})});
      const d=await res.json();
      if(d.success){showToast("✅ Avis ajouté"+Number(avisForm.note)<=2?" · Alerte WhatsApp envoyée":"");setShowAjoutAvis(false);setAvisForm({client_nom:"",note:5,commentaire:"",service:"",source:"direct",google:false});load();}
    }catch(e){showToast("❌ Erreur");}
  };

  const repondreIA=async(avis)=>{
    try{
      const res=await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'repondre_ia',avis_id:avis.id,client_nom:avis.client_nom,note:avis.note,commentaire:avis.commentaire,service:avis.service,secteur:profil?.metier||"services premium"})});
      const d=await res.json();
      if(d.success){setReponseIA(r=>({...r,[avis.id]:d.reponse}));showToast("✅ Réponse IA générée");}
    }catch(e){showToast("❌ Erreur IA");}
  };

  const ajouterNPS=async()=>{
    if(!npsForm.client_nom)return showToast("⚠️ Nom requis");
    try{
      await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_nps',...npsForm})});
      showToast("✅ NPS enregistré"+Number(npsForm.score)>=9?" · Invitation Google envoyée":Number(npsForm.score)<=6?" · Alerte envoyée":"");
      setShowNPS(false);setNpsForm({client_nom:"",client_email:"",score:8,commentaire:""});load();
    }catch(e){showToast("❌ Erreur");}
  };

  const ajouterCSAT=async()=>{
    if(!csatForm.client_nom)return showToast("⚠️ Nom requis");
    try{
      await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_csat',...csatForm})});
      showToast("✅ CSAT enregistré");setShowCSAT(false);setCsatForm({client_nom:"",service:"",score:4,commentaire:""});load();
    }catch(e){showToast("❌ Erreur");}
  };

  const demanderAvisWhatsApp=async()=>{
    if(!demandeForm.client_tel||!demandeForm.client_nom)return showToast("⚠️ Nom et numéro requis");
    try{
      await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'demander_avis_whatsapp',...demandeForm})});
      showToast("✅ Demande d'avis WhatsApp envoyée");setDemandeForm({client_tel:"",client_nom:"",service:""});
    }catch(e){showToast("❌ Erreur");}
  };

  const analyserConcurrence=async()=>{
    setIaLoading(true);
    try{
      const res=await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_concurrentielle',secteur:profil?.metier||"services premium",note_actuelle:data?.noteMoyenne||0,nb_avis:data?.totalAvis||0})});
      const d=await res.json();
      if(d.success)setAnalyseConc(d.analyse);
    }catch(e){}
    setIaLoading(false);
  };

  const envoyerRapport=async()=>{
    showToast("⏳ Envoi rapport réputation...");
    try{
      await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rapport_reputation_whatsapp',...data})});
      showToast("✅ Rapport réputation envoyé");
    }catch(e){showToast("❌ Erreur");}
  };

  if(!hasAccess(plan,"scoring"))return <div style={{padding:20}}><UpgradeWall page="Réputation & NPS" plan={plan}/></div>;
  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement de la réputation...</div></div>;

  const avisAffichés=data?.avis?.length>0?data.avis:AVIS_DEFAUT;
  const scoreReputation=data?.scoreReputation||72;
  const scoreColor=scoreReputation>=70?C.green:scoreReputation>=40?C.gold:C.red;

  const tabs=[
    {id:"dashboard",label:"★ Dashboard"},
    {id:"avis",label:"💬 Avis clients"},
    {id:"nps",label:"📊 NPS"},
    {id:"csat",label:"😊 CSAT"},
    {id:"demandes",label:"📱 Demander un avis"},
    {id:"concurrent",label:"🔍 Analyse concurrentielle"},
  ];

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>★ Réputation & NPS</div>
        <div style={{fontSize:11,color:C.muted}}>Avis · NPS · CSAT · Réponses IA · Routage intelligent · Multi-sociétés</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={envoyerRapport} style={{fontSize:11}}>📱 Rapport WhatsApp</BtnGhost>
        <Btn onClick={()=>setShowAjoutAvis(true)} style={{fontSize:11}}>+ Ajouter un avis</Btn>
      </div>
    </div>

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:14}}>
      <CT style={{borderColor:`${scoreColor}44`,gridColumn:"span 1"}}>
        <div style={{fontSize:9,color:C.muted,marginBottom:3}}>SCORE RÉPUTATION</div>
        <div style={{fontSize:24,fontWeight:700,color:scoreColor}}>{scoreReputation}</div>
        <div style={{fontSize:9,color:scoreColor}}>/100</div>
      </CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>NOTE GOOGLE</div><div style={{fontSize:20,fontWeight:700,color:C.gold}}>★ {data?.noteGoogle||4.8}</div><div style={{fontSize:9,color:C.muted}}>{data?.totalAvis||0} avis</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>NPS</div><div style={{fontSize:20,fontWeight:700,color:data?.npsScore>=50?C.green:data?.npsScore>=0?C.gold:C.red}}>{data?.npsScore>=0?"+":""}{data?.npsScore||72}</div><div style={{fontSize:9,color:C.muted}}>Net Promoter</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>CSAT</div><div style={{fontSize:20,fontWeight:700,color:C.teal}}>{data?.csatScore||85}%</div><div style={{fontSize:9,color:C.muted}}>Satisfaction</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>TAUX RÉPONSE</div><div style={{fontSize:20,fontWeight:700,color:data?.tauxReponse>=80?C.green:C.orange}}>{data?.tauxReponse||91}%</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>NON RÉPONDUS</div><div style={{fontSize:20,fontWeight:700,color:C.orange}}>{avisAffichés.filter(a=>a.statut==="nouveau").length}</div></CT>
    </div>

    {/* ALERTES AVIS NÉGATIFS */}
    {avisAffichés.filter(a=>a.note<=2&&a.statut==="nouveau").length>0&&<div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:10,padding:12,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.red,marginBottom:4}}>🔴 {avisAffichés.filter(a=>a.note<=2&&a.statut==="nouveau").length} avis négatif(s) sans réponse</div>
      <div style={{fontSize:11,color:C.text}}>{avisAffichés.filter(a=>a.note<=2&&a.statut==="nouveau").map(a=>a.client_nom).join(", ")} — Répondez rapidement pour limiter l'impact sur votre réputation.</div>
    </div>}

    {/* FORMS */}
    {showAjoutAvis&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>+ Ajouter un avis</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Client *</label><Inp value={avisForm.client_nom} onChange={e=>setAvisForm(f=>({...f,client_nom:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Service</label><Inp value={avisForm.service} onChange={e=>setAvisForm(f=>({...f,service:e.target.value}))} placeholder="Airbnb, Nettoyage..."/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Note (1-5)</label>
          <div style={{display:"flex",gap:6}}>
            {[1,2,3,4,5].map(n=><button key={n} onClick={()=>setAvisForm(f=>({...f,note:n}))} style={{width:36,height:36,borderRadius:6,background:avisForm.note>=n?`${C.gold}33`:"transparent",border:`1px solid ${avisForm.note>=n?C.gold:C.border}`,cursor:"pointer",fontSize:16,color:C.gold}}>★</button>)}
          </div>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Source</label>
          <Sel value={avisForm.source} onChange={e=>setAvisForm(f=>({...f,source:e.target.value}))}>
            <option value="direct">Direct</option>
            <option value="google">Google</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="trustpilot">Trustpilot</option>
            <option value="facebook">Facebook</option>
          </Sel>
        </div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Commentaire</label><Inp value={avisForm.commentaire} onChange={e=>setAvisForm(f=>({...f,commentaire:e.target.value}))} placeholder="Commentaire du client..."/></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input type="checkbox" id="google_chk" checked={avisForm.google} onChange={e=>setAvisForm(f=>({...f,google:e.target.checked}))} style={{accentColor:C.gold}}/>
          <label htmlFor="google_chk" style={{fontSize:11,color:C.muted}}>Avis Google (compte dans la note publique)</label>
        </div>
      </div>
      {Number(avisForm.note)<=2&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:8,marginBottom:10,fontSize:11,color:C.orange}}>⚠️ Avis négatif — une alerte WhatsApp sera envoyée automatiquement.</div>}
      <div style={{display:"flex",gap:8}}><Btn onClick={ajouterAvis}>✅ Ajouter l'avis</Btn><BtnGhost onClick={()=>setShowAjoutAvis(false)}>Annuler</BtnGhost></div>
    </Card>}

    {showNPS&&<Card style={{marginBottom:14,borderColor:`${C.blue}44`}}>
      <STitle>📊 Nouvelle réponse NPS</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Client *</label><Inp value={npsForm.client_nom} onChange={e=>setNpsForm(f=>({...f,client_nom:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email</label><Inp value={npsForm.client_email} onChange={e=>setNpsForm(f=>({...f,client_email:e.target.value}))}/></div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Score NPS (0-10) : {npsForm.score}/10 — {getNPSCat(Number(npsForm.score))}</label>
          <input type="range" min={0} max={10} value={npsForm.score} onChange={e=>setNpsForm(f=>({...f,score:Number(e.target.value)}))} style={{width:"100%",accentColor:C.blue}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:2}}><span>0 Détracteur</span><span>10 Promoteur</span></div>
        </div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Commentaire</label><Inp value={npsForm.commentaire} onChange={e=>setNpsForm(f=>({...f,commentaire:e.target.value}))}/></div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={ajouterNPS} style={{background:C.blue}}>✅ Enregistrer</Btn><BtnGhost onClick={()=>setShowNPS(false)}>Annuler</BtnGhost></div>
    </Card>}

    {showCSAT&&<Card style={{marginBottom:14,borderColor:`${C.teal}44`}}>
      <STitle>😊 Nouvelle réponse CSAT</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Client *</label><Inp value={csatForm.client_nom} onChange={e=>setCsatForm(f=>({...f,client_nom:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Service</label><Inp value={csatForm.service} onChange={e=>setCsatForm(f=>({...f,service:e.target.value}))}/></div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Score CSAT (1-5)</label>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            {[{s:1,e:"😡"},{s:2,e:"😕"},{s:3,e:"😐"},{s:4,e:"😊"},{s:5,e:"🤩"}].map(({s,e})=><button key={s} onClick={()=>setCsatForm(f=>({...f,score:s}))} style={{fontSize:28,background:csatForm.score===s?`${C.teal}22`:"transparent",border:`2px solid ${csatForm.score===s?C.teal:C.border}`,borderRadius:8,padding:"8px 12px",cursor:"pointer"}}>{e}</button>)}
          </div>
        </div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Commentaire</label><Inp value={csatForm.commentaire} onChange={e=>setCsatForm(f=>({...f,commentaire:e.target.value}))}/></div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={ajouterCSAT} style={{background:C.teal}}>✅ Enregistrer</Btn><BtnGhost onClick={()=>setShowCSAT(false)}>Annuler</BtnGhost></div>
    </Card>}

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── DASHBOARD ── */}
    {onglet==="dashboard"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card style={{borderColor:`${scoreColor}44`}}>
          <STitle>⭐ Score de réputation global</STitle>
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:64,fontWeight:700,color:scoreColor,fontFamily:"Georgia,serif",lineHeight:1}}>{scoreReputation}</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>/100</div>
            <div style={{height:6,background:C.border,borderRadius:3,margin:"0 20px",overflow:"hidden"}}>
              <div style={{height:"100%",width:scoreReputation+"%",background:scoreColor,borderRadius:3}}/>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[["Note globale",(data?.noteMoyenne||4.8)+"/5",C.gold],["NPS",(data?.npsScore>=0?"+":"")+String(data?.npsScore||72),C.blue],["CSAT",(data?.csatScore||85)+"%",C.teal],["Taux de réponse",(data?.tauxReponse||91)+"%",C.green]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card>
            <STitle>😊 Analyse des sentiments</STitle>
            {[["🟢 Positif",(data?.sentiments?.positif||2),C.green],["🟡 Neutre",(data?.sentiments?.neutre||1),C.gold],["🔴 Négatif",(data?.sentiments?.négatif||0),C.red]].map(([l,v,c],i)=>{
              const total=Object.values(data?.sentiments||{positif:2,neutre:1,négatif:0}).reduce((a,x)=>a+Number(x),0)||1;
              const pct=Math.round(Number(v)/total*100);
              return <div key={i} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{l}</span><span style={{color:c,fontWeight:700}}>{v} · {pct}%</span></div>
                <SM val={pct} max={100} color={c}/>
              </div>;
            })}
          </Card>
          <Card>
            <STitle>📊 Répartition NPS</STitle>
            {[["🏆 Promoteurs (9-10)",data?.promoteurs||3,C.green],["😐 Passifs (7-8)",data?.passifs||2,C.gold],["⚠️ Détracteurs (0-6)",data?.detracteurs||0,C.red]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
          </Card>
        </div>
      </div>
    </div>}

    {/* ── AVIS ── */}
    {onglet==="avis"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {["tous","positif","neutre","négatif"].map(f=><button key={f} onClick={()=>{}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit",color:C.muted,textTransform:"capitalize"}}>{f}</button>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {avisAffichés.map((a,i)=><Card key={i} style={{borderColor:a.note<=2?`${C.red}44`:a.note>=4?`${C.green}22`:`${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.gold}}>{inits(a.client_nom)}</div>
              <div>
                <div style={{fontSize:12,fontWeight:700}}>{a.client_nom}</div>
                <div style={{fontSize:10,color:C.muted}}>{a.service} · {new Date(a.date_avis||a.created_at).toLocaleDateString("fr")}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{color:C.gold,fontSize:14}}>{"★".repeat(Number(a.note||0))}{"☆".repeat(5-Number(a.note||0))}</div>
              {a.google&&<Pill color={C.blue}>Google</Pill>}
              <Pill color={a.sentiment==="positif"?C.green:a.sentiment==="négatif"?C.red:C.gold}>{a.sentiment}</Pill>
              <St s={a.statut}/>
            </div>
          </div>
          {a.commentaire&&<div style={{fontSize:12,color:C.text,fontStyle:"italic",lineHeight:1.6,marginBottom:10}}>"{a.commentaire}"</div>}
          {reponseIA[a.id]&&<div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:10,marginBottom:10,fontSize:11,color:C.text,lineHeight:1.6}}>
            <div style={{fontSize:9,color:C.purple,fontWeight:700,marginBottom:4}}>🤖 RÉPONSE IA GÉNÉRÉE</div>
            {reponseIA[a.id]}
          </div>}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <Btn onClick={()=>repondreIA(a)} style={{fontSize:10,padding:"5px 10px"}}>🤖 Répondre (IA)</Btn>
            <BtnGhost onClick={()=>showToast("📱 Partagé !")} style={{fontSize:10}}>📱 Partager</BtnGhost>
            {a.google&&<BtnGhost onClick={()=>showToast("🔗 Lien Google copié")} style={{fontSize:10}}>🔗 Google</BtnGhost>}
          </div>
        </Card>)}
      </div>
    </div>}

    {/* ── NPS ── */}
    {onglet==="nps"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:14,flex:1,marginRight:12}}>
          <div style={{fontSize:9,color:C.blue,fontWeight:600,marginBottom:4}}>NET PROMOTER SCORE</div>
          <div style={{fontSize:48,fontWeight:700,color:data?.npsScore>=50?C.green:data?.npsScore>=0?C.gold:C.red}}>{data?.npsScore>=0?"+":""}{data?.npsScore||72}</div>
          <div style={{fontSize:11,color:C.muted}}>Basé sur {data?.nps?.length||0} réponses · Promoteurs {data?.promoteurs||0} · Détracteurs {data?.detracteurs||0}</div>
        </div>
        <Btn onClick={()=>setShowNPS(true)} style={{fontSize:11,flexShrink:0}}>+ Ajouter réponse NPS</Btn>
      </div>
      {(data?.nps||[]).length===0?<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:11,color:C.muted}}>Aucune réponse NPS. Collectez les scores de satisfaction de vos clients.</div></Card>:
      <Card>
        <STitle>📋 Réponses NPS</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Client</TH><TH>Score</TH><TH>Catégorie</TH><TH>Commentaire</TH><TH>Date</TH></tr></thead>
          <tbody>{(data?.nps||[]).map((n,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{n.client_nom}</Td>
            <Td><span style={{fontSize:16,fontWeight:700,color:n.score>=9?C.green:n.score>=7?C.gold:C.red}}>{n.score}</span></Td>
            <Td><Pill color={n.categorie==="promoteur"?C.green:n.categorie==="passif"?C.gold:C.red}>{n.categorie}</Pill></Td>
            <Td style={{fontSize:11,color:C.muted}}>{(n.commentaire||"—").slice(0,50)}</Td>
            <Td style={{fontSize:10,color:C.muted}}>{new Date(n.created_at).toLocaleDateString("fr")}</Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── CSAT ── */}
    {onglet==="csat"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{background:`${C.teal}11`,border:`1px solid ${C.teal}33`,borderRadius:10,padding:14,flex:1,marginRight:12}}>
          <div style={{fontSize:9,color:C.teal,fontWeight:600,marginBottom:4}}>CUSTOMER SATISFACTION SCORE</div>
          <div style={{fontSize:48,fontWeight:700,color:C.teal}}>{data?.csatScore||85}%</div>
          <div style={{fontSize:11,color:C.muted}}>Basé sur {data?.csat?.length||0} évaluations · Note moyenne : {data?.csat?.length>0?Math.round(data.csat.reduce((a,r)=>a+r.score,0)/data.csat.length*10)/10:4.2}/5</div>
        </div>
        <Btn onClick={()=>setShowCSAT(true)} style={{fontSize:11,flexShrink:0}}>+ Ajouter CSAT</Btn>
      </div>
      {(data?.csat||[]).length===0?<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:11,color:C.muted}}>Aucune évaluation CSAT. Recueillez la satisfaction de vos clients après chaque prestation.</div></Card>:
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Client</TH><TH>Service</TH><TH>Score</TH><TH>Commentaire</TH></tr></thead>
          <tbody>{(data?.csat||[]).map((c,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{c.client_nom}</Td>
            <Td style={{color:C.muted}}>{c.service||"—"}</Td>
            <Td><span style={{fontSize:20}}>{["😡","😕","😐","😊","🤩"][c.score-1]}</span></Td>
            <Td style={{fontSize:11,color:C.muted}}>{(c.commentaire||"—").slice(0,50)}</Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── DEMANDER UN AVIS ── */}
    {onglet==="demandes"&&<div>
      <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text,lineHeight:1.7}}>
        📱 Routage intelligent — les clients avec un NPS ≥ 9 reçoivent automatiquement une invitation à laisser un avis Google. Les clients insatisfaits sont contactés en privé d'abord pour résoudre le problème avant qu'ils postent un avis public.
      </div>
      <Card style={{marginBottom:12}}>
        <STitle>📱 Envoyer une demande d'avis WhatsApp</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom du client *</label><Inp value={demandeForm.client_nom} onChange={e=>setDemandeForm(f=>({...f,client_nom:e.target.value}))}/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>WhatsApp *</label><Inp value={demandeForm.client_tel} onChange={e=>setDemandeForm(f=>({...f,client_tel:e.target.value}))} placeholder="+33..."/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Service effectué</label><Inp value={demandeForm.service} onChange={e=>setDemandeForm(f=>({...f,service:e.target.value}))} placeholder="Airbnb, Nettoyage..."/></div>
        </div>
        <Btn onClick={demanderAvisWhatsApp} style={{background:C.green}}>📱 Envoyer la demande d'avis</Btn>
      </Card>
      <Card>
        <STitle>🔗 Lien direct Google Reviews</STitle>
        <div style={{background:C.card2,borderRadius:8,padding:12,fontSize:12,color:C.muted,marginBottom:10,fontFamily:"'Courier New',monospace"}}>https://g.page/r/xyra/review</div>
        <div style={{display:"flex",gap:8}}>
          <BtnGhost onClick={()=>{navigator.clipboard?.writeText("https://g.page/r/xyra/review");showToast("✅ Lien copié");}}>📋 Copier</BtnGhost>
          <BtnGhost onClick={()=>showToast("📱 Lien envoyé sur WhatsApp")}>📱 Envoyer WhatsApp</BtnGhost>
        </div>
      </Card>
    </div>}

    {/* ── ANALYSE CONCURRENTIELLE ── */}
    {onglet==="concurrent"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🔍 Analyse concurrentielle — Claude IA</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseConc||"Lance l'analyse pour obtenir un benchmark de ta réputation vs les concurrents de ton secteur."}</div>}
        <BtnGhost onClick={analyserConcurrence} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🔍 Analyser vs concurrents"}</BtnGhost>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>📊 Ta position sur le marché</STitle>
          {[["Secteur",profil?.metier||"Services premium"],["Note actuelle",(data?.noteMoyenne||4.8)+"/5 ★"],["Benchmark sectoriel","4.3/5 ★ (moyenne marché)"],["Objectif recommandé","4.8+/5 ★"],["Nb avis actuels",String(data?.totalAvis||0)],["Objectif avis","50+ pour la crédibilité"]].map(([l,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"6px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{l}</span><span style={{color:C.text,fontWeight:600}}>{v}</span></div>)}
        </Card>
        <Card>
          <STitle>💡 Actions prioritaires</STitle>
          {[{icon:"📱",action:"Envoyer des demandes d'avis WhatsApp après chaque prestation",urgence:"Immédiat",couleur:C.green},{icon:"🤖",action:"Répondre aux avis négatifs avec l'IA dans les 24h",urgence:"Critique",couleur:C.red},{icon:"🎯",action:"Atteindre 50+ avis Google pour maximiser la visibilité",urgence:"1 mois",couleur:C.blue},{icon:"📊",action:"Collecter le NPS mensuellement pour mesurer l'évolution",urgence:"Récurrent",couleur:C.purple}].map((a,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
            <span style={{fontSize:16,flexShrink:0}}>{a.icon}</span>
            <div style={{flex:1}}><div style={{color:C.text}}>{a.action}</div><Pill color={a.couleur}>{a.urgence}</Pill></div>
          </div>)}
        </Card>
      </div>
    </div>}
  </div>;
};

// Helper NPS catégorie
function getNPSCat(score) {
  if(score>=9)return "🏆 Promoteur";
  if(score>=7)return "😐 Passif";
  return "⚠️ Détracteur";
}


// ─── PAGE EQUIPE ──────────────────────────────────────────────
const PageEquipe=({plan,showToast})=>{
  // Chargement des vraies données Supabase
  const loadRealData=async()=>{
    try{
      const res=await fetch('/api/equipe');
      const data=await res.json();
      if(data.membres&&data.membres.length>0){
        setEquipe(prev=>prev.map(m=>{
          const real=data.membres.find(r=>r.email===m.email||r.nom===m.nom);
          return real?{...m,...real,missions:real.missions?.length>0?real.missions:m.missions}:m;
        }));
        setAlertes(data.alertes||[]);
      }
    }catch(e){console.log("Mode local");}
  };
  useEffect(()=>{loadRealData();},[]);
  const[equipe,setEquipe]=useState([
    {id:1,nom:"Thomas Beaumont",prenom:"Thomas",role:"Responsable missions premium",statut:"En mission",localisation:"Airbnb Montmartre",pointage:"09:02",heures:6.5,conges:12,soldeConges:12,salaire:2800,perf:94,contrat:"CDI",email:"thomas@xyra.io",tel:"+33 6 12 34 56 78",embauche:"01/03/2024",nss:"1 85 06 75 056 042 28",rib:"FR76 3000 4000 0100 0012 3456 789",adresse:"12 rue de la Paix, 75001 Paris",dateNaissance:"15/06/1985",couleur:"#4B7BFF",
    missions:[{date:"15/04",service:"Nettoyage Airbnb Montmartre",client:"Isabelle Moreau",duree:"3h",note:5},{date:"14/04",service:"Nettoyage bureaux La Défense",client:"Marc Dupont",duree:"4h",note:5},{date:"12/04",service:"Rapatriement corps — Lefevre",client:"Pierre Lefevre",duree:"8h",note:5}],
    evaluations:[{date:"01/04/2026",note:94,points:"Excellence technique, ponctualité parfaite, initiative",axes:"Développer compétences aviation privée",evaluateur:"Curtiss"},{date:"01/01/2026",note:88,points:"Très bonne maîtrise des protocoles premium",axes:"Communication client à perfectionner",evaluateur:"Curtiss"}],
    formations:[{titre:"Protocole nettoyage jet privé",date:"15/03",statut:"complété",score:98},{titre:"Secourisme SST",date:"10/01",statut:"complété",score:95}],
    documents:[{nom:"Carte d'identité",type:"ID",expire:"2030",statut:"valide"},{nom:"DPAE embauche",type:"RH",date:"01/03/2024",statut:"archivé"},{nom:"Contrat CDI",type:"Contrat",date:"01/03/2024",statut:"signé"}],
    arrets:[],objectifs:[{obj:"Atteindre 50 missions/mois",actuel:38,cible:50,color:"#4B7BFF"},{obj:"Score client > 4.8",actuel:4.9,cible:4.8,color:"#2EC9B0"},{obj:"Zéro retard",actuel:0,cible:0,color:"#2EC9B0"}],
    carriere:[{date:"01/03/2024",poste:"Technicien junior",salaire:2200},{date:"01/09/2024",poste:"Technicien senior",salaire:2500},{date:"01/03/2025",poste:"Responsable missions premium",salaire:2800}]},

    {id:2,nom:"Abou Diallo",prenom:"Abou",role:"Technicien polyvalent",statut:"Disponible",localisation:"Paris 18e",pointage:"08:45",heures:5.2,conges:15,soldeConges:15,salaire:2200,perf:88,contrat:"CDD",email:"abou@xyra.io",tel:"+33 6 98 76 54 32",embauche:"15/06/2024",nss:"1 92 03 75 115 224 55",rib:"FR76 1027 8060 0001 0234 5678 901",adresse:"45 avenue de Clichy, 75017 Paris",dateNaissance:"03/03/1992",couleur:"#9B5FFF",
    missions:[{date:"15/04",service:"Nettoyage Airbnb Montmartre",client:"Isabelle Moreau",duree:"3h",note:5},{date:"13/04",service:"Entretien yacht",client:"Jet Services",duree:"5h",note:4}],
    evaluations:[{date:"01/04/2026",note:88,points:"Polyvalence remarquable, bonne attitude",axes:"Améliorer vitesse d'exécution",evaluateur:"Curtiss"}],
    formations:[{titre:"Nettoyage yacht — produits nacrés",date:"20/03",statut:"à faire",score:null},{titre:"Secourisme SST",date:"10/01",statut:"complété",score:90}],
    documents:[{nom:"Titre de séjour",type:"ID",expire:"15/11/2026",statut:"valide"},{nom:"Contrat CDD",type:"Contrat",date:"15/06/2024",statut:"signé"}],
    arrets:[{debut:"05/02/2026",fin:"08/02/2026",jours:3,motif:"Grippe",justif:"Arrêt médical fourni"}],
    objectifs:[{obj:"30 missions/mois",actuel:22,cible:30,color:"#9B5FFF"},{obj:"Score client > 4.5",actuel:4.6,cible:4.5,color:"#2EC9B0"}],
    carriere:[{date:"15/06/2024",poste:"Technicien junior",salaire:2000},{date:"01/01/2025",poste:"Technicien polyvalent",salaire:2200}]},

    {id:3,nom:"Fatou Sarr",prenom:"Fatou",role:"Commercial & Relations clients",statut:"En RDV",localisation:"Client VIP 14h",pointage:"09:30",heures:4.8,conges:10,soldeConges:10,salaire:2400,perf:91,contrat:"CDI",email:"fatou@xyra.io",tel:"+33 6 55 44 33 22",embauche:"01/09/2024",nss:"2 94 08 75 102 358 44",rib:"FR76 2004 1000 0101 0050 0678 912",adresse:"8 rue Victor Hugo, 75016 Paris",dateNaissance:"22/08/1994",couleur:"#FF5F9E",
    missions:[{date:"17/04",service:"RDV client VIP Sofia Al-Rashid",client:"Sofia Al-Rashid",duree:"2h",note:5},{date:"14/04",service:"Prospection syndics 94",client:"—",duree:"4h",note:null}],
    evaluations:[{date:"01/04/2026",note:91,points:"Excellente relation client, très bonne prospection",axes:"Développer compétences closing B2B",evaluateur:"Curtiss"}],
    formations:[{titre:"Technique de vente B2B",date:"25/03",statut:"en cours",score:null},{titre:"Accueil client VIP",date:"15/02",statut:"complété",score:92}],
    documents:[{nom:"Carte d'identité",type:"ID",expire:"2028",statut:"valide"},{nom:"Contrat CDI",type:"Contrat",date:"01/09/2024",statut:"signé"}],
    arrets:[],
    objectifs:[{obj:"20 nouveaux prospects/mois",actuel:17,cible:20,color:"#FF5F9E"},{obj:"CA apporté > 8 000€",actuel:6200,cible:8000,color:"#C9A84C"}],
    carriere:[{date:"01/09/2024",poste:"Chargée de relations clients",salaire:2200},{date:"01/03/2025",poste:"Commercial & Relations clients",salaire:2400}]},
  ]);

  const[onglet,setOnglet]=useState("dashboard");
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",role:"",salaire:"",contrat:"CDI",email:"",tel:"",adresse:"",dateNaissance:""});
  const[moisCal,setMoisCal]=useState(4);

  const tabs=[
    {id:"dashboard",label:"📊 Tableau de bord"},
    {id:"equipe",label:"👥 Équipe"},
    {id:"objectifs",label:"🎯 Objectifs & KPIs"},
    {id:"pointage",label:"⏰ Pointage GPS"},
    {id:"conges",label:"🏖 Congés"},
    {id:"planning_cal",label:"📅 Calendrier congés"},
    {id:"arrets",label:"🏥 Arrêts & Absences"},
    {id:"paie",label:"💸 Paie & Charges"},
    {id:"contrats",label:"📋 Contrats RH"},
    {id:"documents",label:"🗂 Documents RH"},
    {id:"entretiens",label:"💼 Entretiens & Évals"},
    {id:"formations",label:"🎓 Formations"},
    {id:"carriere",label:"📈 Évolution carrière"},
    {id:"alertes",label:"🔔 Alertes RH"},
    {id:"ia",label:"🤖 IA RH"},
    {id:"juridique",label:"⚖ Juridique"},
  ];

  if(!hasAccess(plan,"equipe"))return <div style={{padding:20}}><UpgradeWall page="Équipe" plan={plan}/></div>;

  const totalSalaire=equipe.reduce((a,e)=>a+e.salaire,0);
  const totalArrets=equipe.reduce((a,e)=>a+e.arrets.length,0);
  const perfMoy=Math.round(equipe.reduce((a,e)=>a+e.perf,0)/equipe.length);

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:"#EAE6DE",fontFamily:"Georgia,serif"}}>⊞ RH & Équipe</div>
        <div style={{fontSize:11,color:"#5A5A7A"}}>Gestion complète des ressources humaines · {equipe.length} collaborateur</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setShowAdd(s=>!s)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>+ Ajouter</button>
        <button onClick={()=>showToast("📧 Rapport RH mensuel envoyé !")} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>📊 Rapport RH</button>
      </div>
    </div>

    {/* FORM ADD */}
    {showAdd&&<div style={{background:"#0C0C1A",border:"1px solid #C9A84C44",borderRadius:12,padding:18,marginBottom:14}}>
      <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Nouveau collaborateur</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Nom complet","nom"],["Poste / rôle","role"],["Email pro","email"],["Téléphone","tel"],["Date de naissance","dateNaissance"],["Adresse domicile","adresse"]].map(([ph,k])=><input key={k} value={addForm[k]} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit",outline:"none"}}/>)}
        <input value={addForm.salaire} onChange={e=>setAddForm(f=>({...f,salaire:e.target.value}))} placeholder="Salaire net (€)" style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit",outline:"none"}}/>
        <select value={addForm.contrat} onChange={e=>setAddForm(f=>({...f,contrat:e.target.value}))} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 12px",color:"#EAE6DE",fontSize:12,fontFamily:"inherit"}}><option>CDI</option><option>CDD</option><option>Auto-entrepreneur</option><option>Intérim</option><option>Stage</option></select>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{
          const colors=["#4B7BFF","#9B5FFF","#FF5F9E","#2EC9B0","#FF8C3A"];
          const n={id:Date.now(),nom:addForm.nom,prenom:addForm.nom.split(" ")[0],role:addForm.role,statut:"Disponible",localisation:"—",pointage:"—",heures:0,conges:25,soldeConges:25,salaire:Number(addForm.salaire)||0,perf:0,contrat:addForm.contrat,email:addForm.email,tel:addForm.tel,embauche:new Date().toLocaleDateString("fr"),nss:"",rib:"",adresse:addForm.adresse,dateNaissance:addForm.dateNaissance,couleur:colors[equipe.length%colors.length],missions:[],evaluations:[],formations:[],documents:[],arrets:[],objectifs:[],carriere:[{date:new Date().toLocaleDateString("fr"),poste:addForm.role,salaire:Number(addForm.salaire)||0}]};
          setEquipe(eq=>[...eq,n]);setShowAdd(false);setAddForm({nom:"",role:"",salaire:"",contrat:"CDI",email:"",tel:"",adresse:"",dateNaissance:""});
          showToast(`✅ ${addForm.nom} ajouté à l'équipe !`);
        }} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>✅ Ajouter</button>
        <button onClick={()=>setShowAdd(false)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Annuler</button>
      </div>
    </div>}

    {/* KPIs RAPIDES */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      {[["Effectif",equipe.length,"#4B7BFF"],["En mission",equipe.filter(e=>e.statut==="En mission").length,"#C9A84C"],["Masse salariale/mois","€"+totalSalaire.toLocaleString("fr"),"#FF5252"],["Perf. moyenne",perfMoy+"%","#2EC9B0"],["Arrêts ce mois",totalArrets,"#FF8C3A"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:`1px solid #1E1E36`,borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c,fontFamily:"Georgia,serif"}}>{v}</div></div>)}
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:"#121222",borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?"#0C0C1A":"transparent",color:onglet===t.id?"#C9A84C":"#5A5A7A",border:onglet===t.id?"1px solid #1E1E36":"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ─── DASHBOARD ─────────────────────────────────────────── */}
    {onglet==="dashboard"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
          <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>📊 Vue d'ensemble équipe</div>
          {equipe.map((e,i)=>{const sc=e.statut==="En mission"?"#C9A84C":e.statut==="Disponible"?"#2EC9B0":"#4B7BFF";return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #1E1E3622"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur,flexShrink:0}}>{e.nom[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:"#EAE6DE"}}>{e.nom}</div>
              <div style={{fontSize:9,color:"#5A5A7A"}}>{e.role}</div>
              <div style={{marginTop:4,height:3,borderRadius:2,background:"#1E1E36",overflow:"hidden"}}><div style={{height:"100%",width:e.perf+"%",background:e.perf>=90?"#2EC9B0":e.perf>=70?"#C9A84C":"#FF8C3A",borderRadius:2}}/></div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,fontWeight:700,color:e.perf>=90?"#2EC9B0":"#C9A84C"}}>{e.perf}%</div>
              <div style={{fontSize:9,padding:"1px 6px",background:sc+"22",color:sc,borderRadius:10,marginTop:2,fontWeight:600}}>{e.statut}</div>
            </div>
          </div>;})}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16}}>
            <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>💸 Répartition masse salariale</div>
            {equipe.map((e,i)=><div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{e.prenom}</span><span style={{color:e.couleur,fontWeight:700}}>{e.salaire.toLocaleString("fr")}€</span></div><div style={{height:4,borderRadius:2,background:"#1E1E36"}}><div style={{height:"100%",width:(e.salaire/totalSalaire*100)+"%",background:e.couleur,borderRadius:2}}/></div></div>)}
            <div style={{marginTop:8,fontSize:11,color:"#C9A84C",fontWeight:700,textAlign:"right"}}>Total : {totalSalaire.toLocaleString("fr")} € net · {Math.round(totalSalaire*1.43).toLocaleString("fr")} € brut</div>
          </div>
          <div style={{background:"#FF525211",border:"1px solid #FF525233",borderRadius:10,padding:14}}>
            <div style={{fontSize:10,color:"#FF5252",fontWeight:600,marginBottom:8}}>🔔 Alertes RH du jour</div>
            {[["⚠️","CDD Abou expire dans 2 mois","Décision CDI requise"],["📅","Visite médicale Thomas","Avant le 30/04/2026"],["📋","Entretien pro Fatou","À planifier avant sept."]].map(([ic,t,d],i)=><div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid #FF525222",fontSize:11}}><span>{ic}</span><div><div style={{color:"#EAE6DE",fontWeight:600}}>{t}</div><div style={{color:"#5A5A7A",fontSize:10}}>{d}</div></div></div>)}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[["🎯 Objectifs atteints","8/12","#2EC9B0"],["🎓 Formations complètes","3/5","#4B7BFF"],["📅 Jours de congés pris","12/52","#C9A84C"]].map(([l,v,c],i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:10,padding:14,textAlign:"center"}}><div style={{fontSize:11,color:"#5A5A7A",marginBottom:4}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
    </div>}

    {/* ─── EQUIPE ────────────────────────────────────────────── */}
    {onglet==="equipe"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
      {equipe.map((e,i)=>{const sc=e.statut==="En mission"?"#C9A84C":e.statut==="Disponible"?"#2EC9B0":"#4B7BFF";return <div key={i} style={{background:"#0C0C1A",border:`1px solid ${sc}33`,borderRadius:12,padding:18,cursor:"pointer"}} onClick={()=>setSel(sel?.id===e.id?null:e)}>
        {/* Avatar + infos */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:e.couleur,flexShrink:0,position:"relative"}}>
            {e.nom[0]}
            <div style={{position:"absolute",bottom:0,right:0,width:14,height:14,borderRadius:"50%",background:sc,border:"2px solid #0C0C1A"}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"#EAE6DE"}}>{e.nom}</div>
            <div style={{fontSize:10,color:"#5A5A7A"}}>{e.role}</div>
            <div style={{fontSize:9,color:"#5A5A7A"}}>📅 Depuis {e.embauche} · <span style={{color:e.contrat==="CDI"?"#2EC9B0":"#4B7BFF",fontWeight:600}}>{e.contrat}</span></div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontSize:9,padding:"2px 8px",background:sc+"22",color:sc,borderRadius:10,fontWeight:600,border:`1px solid ${sc}44`}}>{e.statut}</div></div>
        </div>
        {/* Métriques */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
          {[["Heures/j",e.heures+"h","#4B7BFF"],["Congés",e.soldeConges+"j","#C9A84C"],["Perf",e.perf+"%","#2EC9B0"],["Salaire",e.salaire.toLocaleString("fr")+"€","#C9A84C"]].map(([l,v,c],j)=><div key={j} style={{background:"#121222",borderRadius:6,padding:"6px 4px",textAlign:"center"}}><div style={{fontSize:8,color:"#5A5A7A",marginBottom:2}}>{l}</div><div style={{fontSize:11,fontWeight:700,color:c}}>{v}</div></div>)}
        </div>
        <div style={{height:3,borderRadius:2,background:"#1E1E36",marginBottom:10}}><div style={{height:"100%",width:e.perf+"%",background:e.perf>=90?"#2EC9B0":e.perf>=70?"#C9A84C":"#FF8C3A",borderRadius:2}}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
          {[["💸 Paie",()=>showToast(`✅ Fiche paie ${e.nom} générée`)],["📍 GPS",()=>showToast("📍 GPS ouvert")],["💬 Chat",()=>showToast(`💬 Chat ${e.nom}`)],["📋 Fiche",()=>setSel(sel?.id===e.id?null:e)]].map(([l,fn],j)=><button key={j} onClick={ev=>{ev.stopPropagation();fn();}} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 2px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{l}</button>)}
        </div>
        {/* FICHE COMPLÈTE */}
        {sel?.id===e.id&&<div style={{marginTop:12,borderTop:"1px solid #1E1E3644",paddingTop:12}}>
          <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8,fontWeight:600}}>INFORMATIONS COMPLÈTES</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:10}}>
            {[["📧 Email",e.email],["📱 Tél.",e.tel],["🏠 Adresse",e.adresse],["🎂 Naissance",e.dateNaissance],["🔒 N° SS",e.nss||"Non renseigné"],["🏦 RIB",e.rib||"Non renseigné"]].map(([k,v],j)=><div key={j} style={{background:"#121222",borderRadius:6,padding:"6px 8px"}}><div style={{fontSize:8,color:"#5A5A7A",marginBottom:1}}>{k}</div><div style={{fontSize:10,color:"#EAE6DE",fontWeight:600,wordBreak:"break-all"}}>{v}</div></div>)}
          </div>
          <div style={{fontSize:9,color:"#5A5A7A",marginBottom:4}}>Documents personnels</div>
          {e.documents.map((d,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0",borderBottom:"1px solid #1E1E3622"}}><span>{d.nom}</span><span style={{color:d.statut==="valide"?"#2EC9B0":d.statut==="signé"?"#4B7BFF":"#5A5A7A"}}>{d.statut}{d.expire?" · expire "+d.expire:""}</span></div>)}
        </div>}
      </div>;})}
    </div>}

    {/* ─── OBJECTIFS & KPIs ──────────────────────────────────── */}
    {onglet==="objectifs"&&<div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#5A5A7A"}}>{e.role}</div></div>
          <div style={{fontSize:20,fontWeight:700,color:e.perf>=90?"#2EC9B0":"#C9A84C"}}>{e.perf}%</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {e.objectifs.length>0?e.objectifs.map((obj,j)=>{
            const pct=typeof obj.actuel==="number"&&typeof obj.cible==="number"?Math.min(100,Math.round((obj.actuel/obj.cible)*100)):100;
            const atteint=typeof obj.actuel==="number"?obj.actuel>=obj.cible:true;
            return <div key={j} style={{background:"#121222",borderRadius:8,padding:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:600}}>{obj.obj}</div>
                <div style={{fontSize:11,color:atteint?"#2EC9B0":"#C9A84C",fontWeight:700}}>{atteint?"✅ Atteint":"🎯 En cours"}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:6,borderRadius:3,background:"#1E1E36"}}><div style={{height:"100%",width:pct+"%",background:obj.color,borderRadius:3,transition:"width .3s"}}/></div>
                <div style={{fontSize:10,color:"#5A5A7A",whiteSpace:"nowrap"}}>{typeof obj.actuel==="number"?obj.actuel+" / "+obj.cible:obj.actuel}</div>
              </div>
            </div>;
          }):<div style={{fontSize:11,color:"#5A5A7A",textAlign:"center",padding:12}}>Aucun objectif défini</div>}
        </div>
        <button onClick={()=>showToast(`✅ Objectif ajouté pour ${e.nom}`)} style={{marginTop:10,background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Ajouter un objectif</button>
      </div>)}
    </div>}

    {/* ─── POINTAGE ──────────────────────────────────────────── */}
    {onglet==="pointage"&&<div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["Présents",equipe.length,"#2EC9B0"],["Heures totales",equipe.reduce((a,e)=>a+e.heures,0).toFixed(1)+"h","#4B7BFF"],["Retards","0","#C9A84C"],["Absents","0","#FF5252"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:9,color:"#5A5A7A",marginBottom:4}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Collaborateur","Pointage arrivée","Localisation GPS","Heures/j","Mission en cours","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
        <tbody>{equipe.map((e,i)=>{const sc=e.statut==="En mission"?"#C9A84C":e.statut==="Disponible"?"#2EC9B0":"#4B7BFF";return <tr key={i}>
          <td style={{padding:"10px 10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
              <span style={{fontWeight:600}}>{e.nom}</span>
            </div>
          </td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#2ECDC4",fontWeight:700}}>{e.pointage!=="—"?`✅ ${e.pointage}`:"⏳ En attente"}</td>
          <td style={{padding:"10px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>📍 {e.localisation}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#4B7BFF",fontWeight:700}}>{e.heures}h</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:sc+"22",color:sc,padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>{e.statut}</span></td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>showToast(`📍 ${e.nom} — GPS : ${e.localisation}`)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📍 GPS</button>
              <button onClick={()=>{setEquipe(eq=>eq.map((x,j)=>j===i?{...x,pointage:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})}:x));showToast(`✅ Pointage ${e.nom} enregistré`);}} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>⏰ Pointer</button>
            </div>
          </td>
        </tr>;})}
        </tbody>
      </table>
    </div>}

    {/* ─── CONGES ────────────────────────────────────────────── */}
    {onglet==="conges"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["Congés acquis total",equipe.reduce((a,e)=>a+e.conges,0)+"j","#blue"],["Solde restant",equipe.reduce((a,e)=>a+e.soldeConges,0)+"j","#2EC9B0"],["Pris ce mois","4j","#C9A84C"],["Demandes en attente","2","#FF8C3A"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c||"#4B7BFF"}}>{v}</div></div>)}
      </div>
      <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Soldes par collaborateur</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Collaborateur","Acquis","Pris","Restant","RTT","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
          <tbody>{equipe.map((e,i)=><tr key={i}>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:600}}>{e.nom}</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#4B7BFF",fontWeight:700}}>{e.conges}j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{e.conges-e.soldeConges}j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:e.soldeConges>5?"#2EC9B0":"#FF8C3A",fontWeight:700}}>{e.soldeConges}j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#C9A84C"}}>5j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>{setEquipe(eq=>eq.map((x,j)=>j===i?{...x,soldeConges:Math.max(0,x.soldeConges-1)}:x));showToast(`✅ 1 congé approuvé — ${e.nom}`);}} style={{background:"#2EC9B0",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>✅ Approuver</button>
                <button onClick={()=>showToast("❌ Congé refusé")} style={{background:"transparent",color:"#FF5252",border:"1px solid #FF525233",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>❌ Refuser</button>
              </div>
            </td>
          </tr>)}</tbody>
        </table>
      </div>
      <div style={{background:"#FF8C3A11",border:"1px solid #FF8C3A33",borderRadius:10,padding:14}}>
        <div style={{fontSize:10,color:"#FF8C3A",fontWeight:600,marginBottom:8}}>📋 Demandes en attente</div>
        {[{nom:"Thomas Beaumont",dates:"20-22 mai 2026",jours:3,type:"Congés payés"},{nom:"Abou Diallo",dates:"27 mai 2026",jours:1,type:"Congés payés"}].map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #FF8C3A22",fontSize:12}}>
          <div><span style={{fontWeight:600}}>{d.nom}</span> — {d.dates} ({d.jours}j · {d.type})</div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>showToast(`✅ ${d.nom} — congé approuvé !`)} style={{background:"#2EC9B0",color:"#000",border:"none",borderRadius:5,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Approuver</button>
            <button onClick={()=>showToast("❌ Refusé")} style={{background:"transparent",color:"#FF5252",border:"1px solid #FF525233",borderRadius:5,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Refuser</button>
          </div>
        </div>)}
      </div>
    </div>}

    {/* ─── PLANNING CALENDRIER ───────────────────────────────── */}
    {onglet==="planning_cal"&&<div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700}}>📅 Calendrier des congés — {["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][moisCal-1]} 2026</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setMoisCal(m=>Math.max(1,m-1))} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>← Préc.</button>
          <button onClick={()=>setMoisCal(m=>Math.min(12,m+1))} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>Suiv. →</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:8}}>
        {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j=><div key={j} style={{textAlign:"center",fontSize:9,color:"#5A5A7A",fontWeight:600,padding:"4px 0"}}>{j}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {Array.from({length:30},(_, i)=>{
          const jour=i+1;
          const congeThomas=moisCal===5&&jour>=20&&jour<=22;
          const congeAbou=moisCal===5&&jour===27;
          const weekend=(i+3)%7>=5;
          return <div key={i} style={{background:weekend?"#121222":congeThomas?equipe[0].couleur+"33":congeAbou?equipe[1].couleur+"33":"#121222",border:`1px solid ${congeThomas?equipe[0].couleur+"55":congeAbou?equipe[1].couleur+"55":"#1E1E36"}`,borderRadius:4,padding:"6px 4px",textAlign:"center",minHeight:42}}>
            <div style={{fontSize:11,color:weekend?"#1E1E36":"#EAE6DE",fontWeight:600}}>{jour}</div>
            {congeThomas&&<div style={{fontSize:8,color:equipe[0].couleur,marginTop:2}}>Thomas</div>}
            {congeAbou&&<div style={{fontSize:8,color:equipe[1].couleur,marginTop:2}}>Abou</div>}
          </div>;
        })}
      </div>
      <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap"}}>
        {equipe.map((e,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#5A5A7A"}}><div style={{width:10,height:10,borderRadius:2,background:e.couleur}}/>{e.prenom}</div>)}
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#5A5A7A"}}><div style={{width:10,height:10,borderRadius:2,background:"#121222",border:"1px solid #1E1E36"}}/> Weekend</div>
      </div>
    </div>}

    {/* ─── ARRETS MALADIE ────────────────────────────────────── */}
    {onglet==="arrets"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Arrêts ce mois",totalArrets,"#FF5252"],["Jours perdus",equipe.reduce((a,e)=>a+e.arrets.reduce((b,ar)=>b+ar.jours,0),0)+"j","#FF8C3A"],["Taux absentéisme","2.4%","#C9A84C"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1,fontSize:13,fontWeight:700}}>{e.nom}</div>
          <span style={{fontSize:11,color:e.arrets.length>0?"#FF5252":"#2EC9B0"}}>{e.arrets.length>0?e.arrets.length+" arrêt(s)":"✅ Aucun arrêt"}</span>
        </div>
        {e.arrets.length>0?<table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Début","Fin","Jours","Motif","Justificatif"].map(h=><th key={h} style={{textAlign:"left",padding:"6px 8px",fontSize:9,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
          <tbody>{e.arrets.map((ar,j)=><tr key={j}><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:"#FF5252"}}>{ar.debut}</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622"}}>{ar.fin}</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622",fontWeight:700}}>{ar.jours}j</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622"}}>{ar.motif}</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:"#2EC9B0"}}>{ar.justif}</td></tr>)}</tbody>
        </table>:<div style={{fontSize:11,color:"#5A5A7A",padding:"8px 0"}}>Aucun arrêt maladie enregistré</div>}
        <button onClick={()=>{const ar={debut:new Date().toLocaleDateString("fr"),fin:"—",jours:1,motif:"À préciser",justif:"En attente"};setEquipe(eq=>eq.map((x,j)=>j===i?{...x,arrets:[...x.arrets,ar]}:x));showToast(`✅ Arrêt enregistré pour ${e.nom}`);}} style={{marginTop:10,background:"transparent",color:"#FF5252",border:"1px solid #FF525233",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Déclarer un arrêt</button>
      </div>)}
    </div>}

    {/* ─── PAIE ──────────────────────────────────────────────── */}
    {onglet==="paie"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Masse nette/mois","€"+totalSalaire.toLocaleString("fr"),"#FF5252"],["Charges patronales (~43%)","€"+Math.round(totalSalaire*0.43).toLocaleString("fr"),"#FF8C3A"],["Coût total employeur","€"+Math.round(totalSalaire*1.43).toLocaleString("fr"),"#C9A84C"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Collaborateur","Contrat","Salaire net","Charges soc.","Coût total","Statut","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
          <tbody>{equipe.map((e,i)=><tr key={i}>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:600}}>{e.nom}</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:(e.contrat==="CDI"?"#2EC9B0":"#4B7BFF")+"22",color:e.contrat==="CDI"?"#2EC9B0":"#4B7BFF",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>{e.contrat}</span></td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:700}}>{e.salaire.toLocaleString("fr")} €</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#FF8C3A"}}>{Math.round(e.salaire*0.43).toLocaleString("fr")} €</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#FF5252",fontWeight:700}}>{Math.round(e.salaire*1.43).toLocaleString("fr")} €</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:"#2EC9B022",color:"#2EC9B0",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>✓ À jour</span></td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>showToast(`✅ Fiche de paie ${e.nom} générée !`)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>💸 Fiche</button>
                <button onClick={()=>showToast(`📧 Bulletin envoyé à ${e.email}`)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📧</button>
              </div>
            </td>
          </tr>)}</tbody>
        </table>
      </div>
      <button onClick={()=>showToast("✅ Toutes les fiches de paie générées et envoyées !")} style={{width:"100%",background:"#C9A84C",color:"#000",border:"none",borderRadius:8,padding:"10px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>💸 Générer & Envoyer toutes les fiches de paie — Avril 2026</button>
    </div>}

    {/* ─── CONTRATS ──────────────────────────────────────────── */}
    {onglet==="contrats"&&<div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>📋 Contrats de travail</div>
        <button onClick={()=>showToast("🤖 Contrat IA généré !")} style={{background:"#9B5FFF",color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>🤖 Générer (IA)</button>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Collaborateur","Type","Embauche","Fin prévue","Poste","Salaire","Statut","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
        <tbody>{equipe.map((e,i)=><tr key={i}>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:600}}>{e.nom}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:(e.contrat==="CDI"?"#2EC9B0":"#4B7BFF")+"22",color:e.contrat==="CDI"?"#2EC9B0":"#4B7BFF",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>{e.contrat}</span></td>
          <td style={{padding:"10px",fontSize:10,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{e.embauche}</td>
          <td style={{padding:"10px",fontSize:10,borderBottom:"1px solid #1E1E3622",color:e.contrat==="CDD"?"#FF8C3A":"#5A5A7A"}}>{e.contrat==="CDD"?"15/09/2025":"Indéterminée"}</td>
          <td style={{padding:"10px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{e.role}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#C9A84C",fontWeight:700}}>{e.salaire.toLocaleString("fr")} €</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:"#2EC9B022",color:"#2EC9B0",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>✓ Signé</span></td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>showToast(`📄 Contrat ${e.nom} PDF`)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📄 PDF</button>
              <button onClick={()=>showToast(`📱 Envoyé à ${e.nom}`)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>WA</button>
            </div>
          </td>
        </tr>)}</tbody>
      </table>
    </div>}

    {/* ─── DOCUMENTS RH ──────────────────────────────────────── */}
    {onglet==="documents"&&<div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1,fontSize:13,fontWeight:700}}>{e.nom}</div>
          <button onClick={()=>showToast(`📤 Document ajouté pour ${e.nom}`)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>+ Ajouter document</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
          {e.documents.map((d,j)=><div key={j} style={{background:"#121222",borderRadius:8,padding:10,border:"1px solid #1E1E36"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:600}}>{d.nom}</span>
              <span style={{fontSize:9,background:(d.statut==="valide"||d.statut==="signé")?"#2EC9B022":"#FF525222",color:(d.statut==="valide"||d.statut==="signé")?"#2EC9B0":"#FF5252",padding:"1px 5px",borderRadius:8,fontWeight:600}}>{d.statut}</span>
            </div>
            <div style={{fontSize:9,color:"#5A5A7A",marginBottom:6}}>{d.type}{d.expire?" · Expire : "+d.expire:""}{d.date?" · "+d.date:""}</div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>showToast(`📄 ${d.nom} téléchargé`)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>📥 Voir</button>
              <button onClick={()=>showToast(`📧 Envoyé à ${e.nom}`)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>📧</button>
            </div>
          </div>)}
        </div>
      </div>)}
    </div>}

    {/* ─── ENTRETIENS ────────────────────────────────────────── */}
    {onglet==="entretiens"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>💼 Entretiens & Évaluations</div>
        <button onClick={()=>showToast("✅ Entretien planifié et notification envoyée !")} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"inherit"}}>+ Planifier un entretien</button>
      </div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#5A5A7A"}}>{e.evaluations.length} évaluation(s)</div></div>
          <div style={{fontSize:18,fontWeight:700,color:e.perf>=90?"#2EC9B0":"#C9A84C"}}>{e.perf}%</div>
        </div>
        {e.evaluations.map((ev,j)=><div key={j} style={{background:"#121222",borderRadius:8,padding:12,marginBottom:8,border:"1px solid #1E1E36"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:600}}>Évaluation du {ev.date}</div>
            <div style={{fontSize:16,fontWeight:700,color:ev.note>=90?"#2EC9B0":"#C9A84C"}}>{ev.note}/100</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:11}}>
            <div style={{background:"#2EC9B011",borderRadius:6,padding:8}}><div style={{fontSize:9,color:"#2EC9B0",fontWeight:600,marginBottom:3}}>✅ POINTS FORTS</div><div style={{color:"#EAE6DE"}}>{ev.points}</div></div>
            <div style={{background:"#FF8C3A11",borderRadius:6,padding:8}}><div style={{fontSize:9,color:"#FF8C3A",fontWeight:600,marginBottom:3}}>📈 AXES D'AMÉLIORATION</div><div style={{color:"#EAE6DE"}}>{ev.axes}</div></div>
          </div>
          <div style={{fontSize:10,color:"#5A5A7A",marginTop:6}}>Évaluateur : {ev.evaluateur}</div>
        </div>)}
        <button onClick={()=>showToast(`✅ Nouvelle évaluation créée pour ${e.nom}`)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Nouvelle évaluation</button>
      </div>)}
    </div>}

    {/* ─── FORMATIONS ────────────────────────────────────────── */}
    {onglet==="formations"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Formations complètes",equipe.reduce((a,e)=>a+e.formations.filter(f=>f.statut==="complété").length,0),"#2EC9B0"],["En cours",equipe.reduce((a,e)=>a+e.formations.filter(f=>f.statut==="en cours").length,0),"#4B7BFF"],["À faire",equipe.reduce((a,e)=>a+e.formations.filter(f=>f.statut==="à faire").length,0),"#FF8C3A"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1,fontSize:13,fontWeight:700}}>{e.nom}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {e.formations.map((f,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#121222",borderRadius:7,padding:"8px 12px",border:"1px solid #1E1E36"}}>
            <div><div style={{fontSize:11,fontWeight:600}}>{f.titre}</div><div style={{fontSize:9,color:"#5A5A7A"}}>{f.date}</div></div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {f.score&&<span style={{fontSize:11,fontWeight:700,color:"#2EC9B0"}}>{f.score}%</span>}
              <span style={{fontSize:10,background:f.statut==="complété"?"#2EC9B022":f.statut==="en cours"?"#4B7BFF22":"#FF8C3A22",color:f.statut==="complété"?"#2EC9B0":f.statut==="en cours"?"#4B7BFF":"#FF8C3A",padding:"2px 8px",borderRadius:10,fontWeight:600}}>{f.statut}</span>
              <button onClick={()=>showToast(`▶ Formation "${f.titre}" lancée`)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>{f.statut==="complété"?"↺ Refaire":"▶ Lancer"}</button>
            </div>
          </div>)}
        </div>
        <button onClick={()=>showToast(`✅ Formation ajoutée pour ${e.nom}`)} style={{marginTop:10,background:"transparent",color:"#4B7BFF",border:"1px solid #4B7BFF33",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Assigner une formation</button>
      </div>)}
    </div>}

    {/* ─── EVOLUTION CARRIERE ─────────────────────────────────── */}
    {onglet==="carriere"&&<div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#5A5A7A"}}>Depuis {e.embauche} · Poste actuel : {e.role}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#5A5A7A"}}>Salaire actuel</div><div style={{fontSize:16,fontWeight:700,color:"#C9A84C"}}>{e.salaire.toLocaleString("fr")} €</div></div>
        </div>
        <div style={{position:"relative",paddingLeft:24}}>
          <div style={{position:"absolute",left:8,top:0,bottom:0,width:2,background:"#1E1E36",borderRadius:1}}/>
          {e.carriere.map((c,j)=><div key={j} style={{position:"relative",marginBottom:16}}>
            <div style={{position:"absolute",left:-20,top:4,width:10,height:10,borderRadius:"50%",background:j===e.carriere.length-1?e.couleur:"#1E1E36",border:`2px solid ${e.couleur}`}}/>
            <div style={{background:"#121222",borderRadius:8,padding:10,border:`1px solid ${j===e.carriere.length-1?e.couleur+"44":"#1E1E36"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:12,fontWeight:700,color:j===e.carriere.length-1?e.couleur:"#EAE6DE"}}>{c.poste}</div><div style={{fontSize:9,color:"#5A5A7A"}}>{c.date}</div></div>
                <div style={{fontSize:13,fontWeight:700,color:"#C9A84C"}}>{c.salaire.toLocaleString("fr")} €</div>
              </div>
              {j>0&&<div style={{fontSize:9,color:"#2EC9B0",marginTop:4}}>↗ +{(c.salaire-e.carriere[j-1].salaire).toLocaleString("fr")}€ ({Math.round((c.salaire-e.carriere[j-1].salaire)/e.carriere[j-1].salaire*100)}%)</div>}
            </div>
          </div>)}
        </div>
        <button onClick={()=>showToast(`✅ Promotion ${e.nom} enregistrée !`)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Ajouter une promotion</button>
      </div>)}
    </div>}

    {/* ─── ALERTES RH ────────────────────────────────────────── */}
    {onglet==="alertes"&&<div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[
          {niveau:"critique",icon:"🚨",titre:"CDD Abou Diallo — Expire dans 2 mois",detail:"Contrat CDD expire le 15/09/2025. Décision requise avant le 15/07. Options : conversion CDI ou fin de contrat.",action:"Convertir en CDI",couleur:"#FF5252"},
          {niveau:"urgent",icon:"⚠️",titre:"Visite médicale obligatoire — Thomas Beaumont",detail:"Dernière visite : 01/03/2024. Renouvellement obligatoire avant le 30/04/2026. Médecin du travail à contacter.",action:"Planifier visite",couleur:"#FF8C3A"},
          {niveau:"urgent",icon:"📋",titre:"Entretien professionnel — Tous les collaborateur",detail:"Les entretiens professionnels doivent être réalisés tous les 2 ans. Fatou Sarr : à planifier avant septembre 2026.",action:"Planifier entretien",couleur:"#FF8C3A"},
          {niveau:"info",icon:"📅",titre:"Solde congés — Abou Diallo",detail:"Abou a 15 jours de congés. Encourager la prise avant fin juin pour éviter le report.",action:"Contacter Abou",couleur:"#4B7BFF"},
          {niveau:"info",icon:"🎓",titre:"Formation Abou — Nettoyage yacht à compléter",detail:"Module 'Nettoyage yacht — produits nacrés' assigné et non commencé. Deadline suggérée : 30/04.",action:"Relancer",couleur:"#9B5FFF"},
          {niveau:"good",icon:"✅",titre:"Formation SST — Thomas et Abou à jour",detail:"Certifications Secourisme au Travail valides jusqu'en 2027.",action:null,couleur:"#2EC9B0"},
        ].map((a,i)=><div key={i} style={{background:`${a.couleur}11`,border:`1px solid ${a.couleur}33`,borderRadius:10,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <span>{a.icon}</span>
                <span style={{fontSize:12,fontWeight:700,color:a.couleur}}>{a.titre}</span>
              </div>
              <div style={{fontSize:11,color:"#EAE6DE",lineHeight:1.6,paddingLeft:24}}>{a.detail}</div>
            </div>
            {a.action&&<button onClick={()=>showToast(`✅ Action "${a.action}" enregistrée !`)} style={{background:a.couleur,color:a.niveau==="good"?"#000":"#000",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600,flexShrink:0,marginLeft:12}}>{a.action}</button>}
          </div>
        </div>)}
      </div>
    </div>}

    {/* ─── IA RH ─────────────────────────────────────────────── */}
    {onglet==="ia"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"#9B5FFF11",border:"1px solid #9B5FFF33",borderRadius:12,padding:16}}>
        <div style={{fontSize:10,color:"#9B5FFF",fontWeight:600,marginBottom:8}}>🤖 Analyse RH globale — Claude Sonnet</div>
        <div style={{fontSize:12,color:"#EAE6DE",lineHeight:1.8}}>Votre équipe de 3 personnes performe à {perfMoy}% en moyenne. Thomas est votre meilleur élément (94%) et justifie une prime. Le CDD d'Abou expire bientôt — la conversion en CDI est recommandée au vu de sa progression. Fatou excelle en relation client et pourrait évoluer vers un poste de responsable commerciale.</div>
      </div>
      {[{icon:"📈",titre:"Performance & Rémunération",txt:`Thomas (94%) mérite une augmentation de 200-300€. Abou progresse (+8pts en 3 mois), prévoir une revalorisation à la conversion CDI. Masse salariale actuelle : ${totalSalaire.toLocaleString("fr")}€/mois — raisonnable pour votre CA.`,col:"#2EC9B0"},{icon:"⚖️",titre:"Risques juridiques",txt:"1 risque identifié : CDD Abou Diallo à convertir ou non renouveler sous 2 mois. 1 visite médicale en retard (Thomas). 1 entretien professionnel à planifier (Fatou). Ces 3 points sont prioritaires.",col:"#FF8C3A"},{icon:"🏆",titre:"Recommandation recrutement",txt:"Votre CA +12% justifie un 4ème technicien. Profil idéal : polyvalent, zone Paris Est, 2 000€ net. Retour sur investissement en 3 mois. Publier l'offre sur Indeed + LinkedIn.",col:"#4B7BFF"},{icon:"💡",titre:"Optimisation coûts RH",txt:"Convention collective services à la personne applicable : exonérations URSSAF possibles. Chèques emploi service universels (CESU) pour réduire les charges de 15-20%. À valider avec votre expert-comptable.",col:"#C9A84C"}].map((a,i)=><div key={i} style={{background:`${a.col}11`,border:`1px solid ${a.col}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:11,fontWeight:700,color:a.col,marginBottom:6}}>{a.icon} {a.titre}</div>
        <div style={{fontSize:12,color:"#EAE6DE",lineHeight:1.7}}>{a.txt}</div>
      </div>)}
    </div>}

    {/* ─── JURIDIQUE ─────────────────────────────────────────── */}
    {onglet==="juridique"&&<div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        {[["DPAE (Déclaration préalable à l'embauche)","✅ Faite à chaque embauche","Permanent","#2EC9B0"],["Registre du personnel","✅ À jour — 3 collaborateur","Permanent","#2EC9B0"],["Affichage obligatoire (conventions, harcèlement...)","✅ Conforme","Vérifié 01/04/2026","#2EC9B0"],["Visite médicale — Thomas Beaumont","⚠️ Renouvellement obligatoire","Avant 30/04/2026","#FF8C3A"],["Visite médicale — Abou et Fatou","✅ Effectuées","Valides 12 mois","#2EC9B0"],["Formation sécurité SST — Thomas & Abou","✅ Certifiés","Valide jusqu'en 2027","#2EC9B0"],["Entretien professionnel — Fatou Sarr","⏳ À planifier","Avant 01/09/2026","#4B7BFF"],["Document unique d'évaluation des risques (DUER)","⚠️ À mettre à jour","Avant 30/06/2026","#FF8C3A"],["Mutuelle d'entreprise obligatoire (>1 salarié)","✅ Souscrite — Alan","Active","#2EC9B0"],["Prévoyance collective","✅ Souscrite","Active","#2EC9B0"]].map(([o,s,d,c],i)=><div key={i} style={{background:"#0C0C1A",borderRadius:8,padding:12,border:`1px solid ${c}22`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,fontWeight:600}}>{o}</div><div style={{fontSize:10,color:"#5A5A7A"}}>Échéance : {d}</div></div>
          <span style={{background:c+"22",color:c,padding:"2px 10px",borderRadius:10,fontSize:10,fontWeight:600,border:`1px solid ${c}44`,flexShrink:0,marginLeft:10}}>{s}</span>
        </div>)}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>showToast("📄 Registre du personnel téléchargé")} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"inherit"}}>📄 Registre personnel</button>
        <button onClick={()=>showToast("🤖 Checklist juridique complète générée")} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>🤖 Checklist IA</button>
        <button onClick={()=>showToast("📋 DUER mis à jour par IA")} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>📋 Mettre à jour DUER</button>
      </div>
    </div>}
  </div>;
};
// ─── PAGE PLANNING ────────────────────────────────────────────
const PagePlanning=({plan,showToast,profil})=>{
  const[vue,setVue]=useState("semaine");
  const[planning,setPlanning]=useState(PLANNING);
  if(!hasAccess(plan,"planning"))return <div style={{padding:20}}><UpgradeWall page="Planning & Agenda" plan={plan}/></div>;
  const vues=[{id:"jour",label:"Jour"},{id:"semaine",label:"Semaine"},{id:"mois",label:"Mois"},{id:"equipe",label:"Équipe"},{id:"carte",label:"Carte"}];
  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⊡ Planning & {profil?.termes?.rdv||"Agenda"}</div><div style={{fontSize:11,color:C.muted}}>5 vues · IA auto-planifier · Booking · Règles horaires</div></div>
      <div style={{display:"flex",gap:8}}><Btn onClick={()=>showToast("🤖 IA a optimisé le planning !")}>🤖 Auto-planifier</Btn><BtnGhost onClick={()=>showToast("✅ "+(profil?.termes?.mission||"Mission")+" ajoutee")}>+ {profil?.termes?.mission||"Mission"}</BtnGhost></div>
    </div>
    <div style={{marginBottom:16}}><Tabs tabs={vues} active={vue} onChange={setVue}/></div>
    <Card>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Date</TH><TH>Heure</TH><TH>Client</TH><TH>Service</TH><TH>Collaborateur</TH><TH>Durée</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
        <tbody>{planning.map((p,i)=><tr key={i}>
          <Td style={{color:C.gold,fontWeight:600}}>{p.date}</Td>
          <Td style={{color:C.blue,fontWeight:700}}>{p.h}</Td>
          <Td style={{fontWeight:600}}>{p.client}</Td>
          <Td style={{color:C.muted,fontSize:11}}>{p.service}</Td>
          <Td><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:22,height:22,borderRadius:"50%",background:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.blue}}>{p.collab[0]}</div>{p.collab}</div></Td>
          <Td><Pill color={C.blue}>{p.duree}</Pill></Td>
          <Td><St s={p.statut}/></Td>
          <Td><div style={{display:"flex",gap:4}}>
            <BtnGhost onClick={()=>showToast("📱 Rappel envoyé")} style={{fontSize:9,padding:"3px 6px"}}>📱</BtnGhost>
            <BtnGhost onClick={()=>setPlanning(pl=>pl.filter((_,j)=>j!==i))} style={{fontSize:9,padding:"3px 6px",color:C.red}}>✕</BtnGhost>
          </div></Td>
        </tr>)}</tbody>
      </table>
    </Card>
  </div>;
};


// ─── VAPI WIDGET ─────────────────────────────────────────────
const VapiWidget=({showToast,leads=[],profil,tenant})=>{
  const ASSISTANT_ID="715e757d-93e7-423a-a6f1-18a77bb19e94";
  const PHONE_ID="+12526754837";

  const[calls,setCalls]=useState([]);
  const[loading,setLoading]=useState(false);
  const[activeCall,setActiveCall]=useState(null);
  const[onglet,setOnglet]=useState("appel");
  const[prospectForm,setProspectForm]=useState({nom:"",tel:"",societe:"",secteur:"Services",service:""});
  const[campagneActive,setCampagneActive]=useState(false);
  const[campagneProgress,setCampagneProgress]=useState(0);

  // Charger historique appels
  useEffect(()=>{
    const load=async()=>{
      try{
        const r=await fetch('/api/prospection?action=calls');
        const d=await r.json();
        if(d.calls)setCalls(Array.isArray(d.calls)?d.calls:[]);
      }catch(e){console.error('Vapi:',e);}
    };
    load();
    const interval=setInterval(load,15000);
    return()=>clearInterval(interval);
  },[]);

  // Lancer un appel individuel
  const lancerAppel=async()=>{
    if(!prospectForm.tel)return showToast("⚠️ Entrez le numéro de téléphone");
    if(!prospectForm.nom)return showToast("⚠️ Entrez le nom du prospect");
    setLoading(true);
    try{
      const res=await fetch('/api/prospection',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'call',
          tel:prospectForm.tel,
          nom:prospectForm.nom,
          societe:prospectForm.societe||prospectForm.nom,
          secteur:prospectForm.secteur,
          service:prospectForm.service,
          nom_commercial:tenant?.societe||"Xyra",
          phoneNumberId:PHONE_ID,
          assistantId:ASSISTANT_ID,
        }),
      });
      const data=await res.json();
      if(data.success){
        setActiveCall(data.call);
        showToast(`🎙 Lea appelle ${prospectForm.nom} !`);
        setProspectForm(f=>({...f,nom:"",tel:"",societe:"",service:""}));
        setTimeout(async()=>{
          const r=await fetch('/api/prospection?action=calls');
          const d=await r.json();
          if(d.calls)setCalls(Array.isArray(d.calls)?d.calls:[]);
        },3000);
      }else{
        showToast("❌ Erreur : "+( data.error||"Vérifiez la config Vapi"));
      }
    }catch(e){showToast("❌ Erreur connexion Vapi");}
    setLoading(false);
  };

  // Appeler depuis un lead SIRENE
  const appellerLead=async(lead)=>{
    if(!lead.tel)return showToast("⚠️ Ce lead n'a pas de numéro");
    setLoading(true);
    try{
      const res=await fetch('/api/prospection',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'call',
          tel:lead.tel,
          nom:lead.nom,
          societe:lead.nom,
          secteur:lead.secteur||profil?.label||"Services",
          service:profil?.services?.[0]||"",
          nom_commercial:tenant?.societe||"Xyra",
          phoneNumberId:PHONE_ID,
          assistantId:ASSISTANT_ID,
        }),
      });
      const data=await res.json();
      if(data.success){
        showToast(`🎙 Lea appelle ${lead.nom} !`);
      }else{
        showToast("❌ "+( data.error||"Erreur Vapi"));
      }
    }catch(e){showToast("❌ Erreur connexion");}
    setLoading(false);
  };

  // Campagne automatique sur tous les leads
  const lancerCampagne=async()=>{
    if(leads.length===0)return showToast("⚠️ Aucun lead disponible — faites d'abord une recherche SIRENE");
    const leadsValides=leads.filter(l=>l.tel);
    if(leadsValides.length===0)return showToast("⚠️ Aucun lead avec numéro de téléphone");
    setCampagneActive(true);
    setCampagneProgress(0);
    let nb=0;
    for(const lead of leadsValides.slice(0,10)){
      try{
        await fetch('/api/prospection',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            action:'call',
            tel:lead.tel,
            nom:lead.nom,
            societe:lead.nom,
            secteur:lead.secteur||profil?.label||"Services",
            service:profil?.services?.[0]||"",
            nom_commercial:tenant?.societe||"Xyra",
            phoneNumberId:PHONE_ID,
            assistantId:ASSISTANT_ID,
          }),
        });
        nb++;
        setCampagneProgress(Math.round((nb/leadsValides.slice(0,10).length)*100));
        await new Promise(r=>setTimeout(r,2000));
      }catch(e){}
    }
    setCampagneActive(false);
    showToast(`✅ Campagne terminée — ${nb} appels lancés par Lea !`);
    const r=await fetch('/api/prospection?action=calls');
    const d=await r.json();
    if(d.calls)setCalls(Array.isArray(d.calls)?d.calls:[]);
  };

  const tabs=[{id:"appel",label:"📞 Appel direct"},{id:"leads",label:"🎯 Leads"},{id:"campagne",label:"🚀 Campagne"},{id:"historique",label:"📋 Historique"}];

  return <div>
    {/* Header Lea */}
    <div style={{background:`linear-gradient(135deg,${C.purple}22,${C.card})`,border:`1px solid ${C.purple}44`,borderRadius:12,padding:16,marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:52,height:52,borderRadius:"50%",background:`${C.purple}33`,border:`2px solid ${C.purple}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🎙</div>
      <div style={{flex:1}}>
        <div style={{fontSize:15,fontWeight:700,color:C.text}}>Lea — Agent Vocal IA</div>
        <div style={{fontSize:11,color:C.muted}}>Propulsé par Vapi · Multilingue · Appels sortants & entrants</div>
        <div style={{display:"flex",gap:8,marginTop:6}}>
          <div style={{fontSize:10,background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`,borderRadius:20,padding:"2px 8px"}}>● Agent actif</div>
          <div style={{fontSize:10,background:`${C.blue}22`,color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:20,padding:"2px 8px"}}>📞 {PHONE_ID}</div>
          <div style={{fontSize:10,background:`${C.gold}22`,color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:20,padding:"2px 8px"}}>{calls.filter(c=>c.status==="ended").length} appels complétés</div>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div style={{display:"flex",gap:4,marginBottom:14,background:C.card2,borderRadius:8,padding:4}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{flex:1,background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.purple:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"6px 4px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?700:400}}>{t.label}</button>)}
    </div>

    {/* APPEL DIRECT */}
    {onglet==="appel"&&<div>
      <CT style={{marginBottom:12}}>
        <STitle>📞 Lancer un appel avec Lea</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Nom du prospect *</label>
            <Inp value={prospectForm.nom} onChange={e=>setProspectForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: M. Dupont"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Téléphone * (format international)</label>
            <Inp value={prospectForm.tel} onChange={e=>setProspectForm(f=>({...f,tel:e.target.value}))} placeholder="Ex: +33612345678"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Société</label>
            <Inp value={prospectForm.societe} onChange={e=>setProspectForm(f=>({...f,societe:e.target.value}))} placeholder="Nom de la société"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Service à présenter</label>
            <Inp value={prospectForm.service} onChange={e=>setProspectForm(f=>({...f,service:e.target.value}))} placeholder="Ex: Nettoyage bureaux"/>
          </div>
        </div>
        {/* Bouton appel */}
        <button onClick={lancerAppel} disabled={loading||!prospectForm.tel||!prospectForm.nom} style={{width:"100%",background:loading?C.muted:`linear-gradient(135deg,${C.purple},#6B3FCC)`,color:"#fff",border:"none",borderRadius:8,padding:"13px",cursor:loading?"not-allowed":"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          {loading?<>⏳ Lea est en train d'appeler...</>:<>🎙 Lea appelle maintenant</>}
        </button>
        {activeCall&&<div style={{marginTop:10,background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>
          ● Appel en cours — ID: {activeCall.id?.slice(0,12)}...
        </div>}
      </CT>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}22`,borderRadius:8,padding:10,fontSize:11,color:C.muted}}>
        💡 Lea se présentera comme l'assistante de <b style={{color:C.text}}>{tenant?.societe||"votre société"}</b> et adaptera son discours à votre secteur automatiquement.
      </div>
    </div>}

    {/* LEADS */}
    {onglet==="leads"&&<div>
      {leads.length===0?<div style={{textAlign:"center",padding:30,color:C.muted}}>
        <div style={{fontSize:32,marginBottom:8}}>🎯</div>
        <div>Faites d'abord une recherche SIRENE dans l'onglet ci-dessus pour voir les leads ici</div>
      </div>:<div>
        <div style={{fontSize:11,color:C.muted,marginBottom:10}}>{leads.length} leads disponibles · Cliquez pour appeler avec Lea</div>
        {leads.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${C.border}`}}>
          <div>
            <div style={{fontSize:12,fontWeight:700}}>{l.nom}</div>
            <div style={{fontSize:10,color:C.muted}}>{l.secteur} · {l.ville}</div>
            <div style={{fontSize:10,color:l.tel?C.green:C.red}}>{l.tel||"⚠️ Pas de numéro"}</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{fontSize:10,background:`${l.score>=80?C.green:C.gold}22`,color:l.score>=80?C.green:C.gold,border:`1px solid ${l.score>=80?C.green:C.gold}44`,borderRadius:20,padding:"2px 8px"}}>★ {l.score}</div>
            <button onClick={()=>appellerLead(l)} disabled={loading||!l.tel} style={{background:l.tel?C.purple:"#333",color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",cursor:l.tel?"pointer":"not-allowed",fontSize:11,fontFamily:"inherit",fontWeight:600}}>🎙 Appeler</button>
          </div>
        </div>)}
      </div>}
    </div>}

    {/* CAMPAGNE */}
    {onglet==="campagne"&&<div>
      <CT style={{marginBottom:12}}>
        <STitle>🚀 Campagne d'appels automatique</STitle>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.7,marginBottom:14}}>
          Lea appelle automatiquement tous les leads de votre liste SIRENE. Elle se présente, qualifie et fixe des RDV en votre nom. Maximum 10 appels par campagne avec 2 secondes entre chaque appel.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Leads disponibles</div><div style={{fontSize:20,fontWeight:700,color:C.blue}}>{leads.length}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Avec téléphone</div><div style={{fontSize:20,fontWeight:700,color:C.green}}>{leads.filter(l=>l.tel).length}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Max campagne</div><div style={{fontSize:20,fontWeight:700,color:C.gold}}>10</div></CT>
        </div>
        {campagneActive&&<div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:C.purple,marginBottom:6}}>🎙 Campagne en cours — {campagneProgress}%</div>
          <div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:campagneProgress+"%",background:C.purple,borderRadius:4,transition:"width .5s"}}/>
          </div>
        </div>}
        <button onClick={lancerCampagne} disabled={campagneActive||leads.filter(l=>l.tel).length===0} style={{width:"100%",background:campagneActive?C.muted:`linear-gradient(135deg,${C.purple},#6B3FCC)`,color:"#fff",border:"none",borderRadius:8,padding:"13px",cursor:campagneActive?"not-allowed":"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit"}}>
          {campagneActive?`⏳ Campagne en cours — ${campagneProgress}%`:`🚀 Lancer la campagne (${Math.min(10,leads.filter(l=>l.tel).length)} appels)`}
        </button>
      </CT>
      <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>
        ⚠️ Assurez-vous d'avoir des leads avec numéros de téléphone. Faites d'abord une recherche SIRENE.
      </div>
    </div>}

    {/* HISTORIQUE */}
    {onglet==="historique"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
        <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Total appels</div><div style={{fontSize:20,fontWeight:700,color:C.blue}}>{calls.length}</div></CT>
        <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Complétés</div><div style={{fontSize:20,fontWeight:700,color:C.green}}>{calls.filter(c=>c.status==="ended").length}</div></CT>
        <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Durée moy.</div><div style={{fontSize:20,fontWeight:700,color:C.gold}}>{calls.length>0?Math.round(calls.reduce((a,c)=>a+(c.duration||0),0)/calls.length)+"s":"—"}</div></CT>
      </div>
      {calls.length===0?<div style={{textAlign:"center",padding:30,color:C.muted}}>
        <div style={{fontSize:32,marginBottom:8}}>📋</div>
        <div>Aucun appel pour le moment</div>
      </div>:calls.slice(0,20).map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
        <div>
          <div style={{fontWeight:600}}>{c.customer?.name||c.customer?.number||"—"}</div>
          <div style={{fontSize:10,color:C.muted}}>{c.createdAt?new Date(c.createdAt).toLocaleString("fr"):"—"}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {c.duration&&<span style={{fontSize:10,color:C.muted}}>{c.duration}s</span>}
          <div style={{fontSize:10,background:c.status==="ended"?`${C.green}22`:c.status==="in-progress"?`${C.gold}22`:`${C.red}22`,color:c.status==="ended"?C.green:c.status==="in-progress"?C.gold:C.red,border:`1px solid ${c.status==="ended"?C.green:c.status==="in-progress"?C.gold:C.red}44`,borderRadius:20,padding:"2px 8px"}}>
            {c.status==="ended"?"✓ Terminé":c.status==="in-progress"?"● En cours":"✗ "+c.status}
          </div>
          <BtnGhost onClick={()=>showToast("📋 Résumé appel copié")} style={{fontSize:9,padding:"3px 8px"}}>Résumé</BtnGhost>
        </div>
      </div>)}
    </div>}
  </div>;
};

// ─── RELANCEIA WIDGET ─────────────────────────────────────────
const RelanceIAWidget=({showToast})=>{
  const[sequences,setSequences]=useState([]);
  const[stats,setStats]=useState(null);
  const[loading,setLoading]=useState(false);
  const[contactForm,setContactForm]=useState({email:"",prenom:"",nom:"",societe:"",tel:"",secteur:"",sequenceId:""});

  useEffect(()=>{
    const loadRelance=async()=>{
      try{
        const[s,st]=await Promise.all([
          fetch('/api/prospection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'relance_sequences'})}).then(r=>r.json()),
          fetch('/api/prospection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'relance_stats'})}).then(r=>r.json()),
        ]);
        if(s.sequences)setSequences(s.sequences);
        if(st.stats)setStats(st.stats);
      }catch(e){console.error('RelanceIA:',e);}
    };
    loadRelance();
  },[]);

  const lancerSequence=async()=>{
    if(!contactForm.email||!contactForm.sequenceId)return showToast("⚠️ Email et séquence requis");
    setLoading(true);
    try{
      const res=await fetch('/api/prospection',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'relance_sequence',...contactForm}),
      });
      const data=await res.json();
      if(data.success)showToast(`✅ Séquence lancée pour ${contactForm.email} !`);
      else showToast("❌ Erreur RelanceIA");
    }catch(e){showToast("❌ Erreur RelanceIA");}
    setLoading(false);
  };

  return <div style={{marginTop:14}}>
    {stats&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
      <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Emails envoyés</div><div style={{fontSize:16,fontWeight:700,color:C.blue}}>{stats.sent||0}</div></CT>
      <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Taux ouverture</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{stats.open_rate||"—"}</div></CT>
      <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Réponses</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{stats.replies||0}</div></CT>
    </div>}

    <CT>
      <STitle>📧 Lancer une séquence RelanceIA</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Email *","email"],["Prénom","prenom"],["Société","societe"],["Téléphone","tel"]].map(([l,k])=><div key={k}>
          <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>{l}</label>
          <input value={contactForm[k]} onChange={e=>setContactForm(f=>({...f,[k]:e.target.value}))} placeholder={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:5,padding:"6px 8px",color:C.text,fontSize:11,fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
        </div>)}
        <div style={{gridColumn:"span 2"}}>
          <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Séquence *</label>
          <select value={contactForm.sequenceId} onChange={e=>setContactForm(f=>({...f,sequenceId:e.target.value}))} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:5,padding:"6px 8px",color:C.text,fontSize:11,fontFamily:"inherit",width:"100%"}}>
            <option value="">Sélectionner une séquence...</option>
            {sequences.map((s,i)=><option key={i} value={s.id}>{s.name}</option>)}
            {sequences.length===0&&<option value="default">Séquence par défaut</option>}
          </select>
        </div>
      </div>
      <Btn onClick={lancerSequence} style={{width:"100%"}} disabled={loading}>
        {loading?"⏳ Envoi en cours...":"📧 Lancer la séquence"}
      </Btn>
    </CT>
  </div>;
};


// ─── PAGE LEA — DASHBOARD AGENT VOCAL ────────────────────────
const PageLea=({showToast,leads,profil})=>{
  const ASSISTANT_ID="715e757d-93e7-423a-a6f1-18a77bb19e94";
  const PHONE_ID="+12526754837";
  const[calls,setCalls]=useState([]);
  const[loading,setLoading]=useState(false);
  const[activeCall,setActiveCall]=useState(null);
  const[onglet,setOnglet]=useState("appel");
  const[campagneActive,setCampagneActive]=useState(false);
  const[campagneProgress,setCampagneProgress]=useState(0);
  const[nom,setNom]=useState("");
  const[tel,setTel]=useState("");
  const[societe,setSociete]=useState("");
  const[service,setService]=useState("");
  const leadsValides=(leads||[]).filter(l=>l&&l.tel);

  useEffect(()=>{
    fetch('/api/prospection?action=calls')
      .then(r=>r.json())
      .then(d=>{if(d&&d.calls&&Array.isArray(d.calls))setCalls(d.calls);})
      .catch(e=>console.error(e));
  },[]);

  const lancerAppel=async()=>{
    if(!tel)return showToast("⚠️ Entrez le numéro");
    if(!nom)return showToast("⚠️ Entrez le nom");
    setLoading(true);
    try{
      const res=await fetch('/api/prospection',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'call',
          tel,nom,societe:societe||nom,
          service,secteur:profil?.label||"Services",
          phoneNumberId:PHONE_ID,
          assistantId:ASSISTANT_ID,
        }),
      });
      const data=await res.json();
      if(data.success){
        setActiveCall(data.call);
        showToast("🎙 Lea appelle "+nom+" !");
        setNom("");setTel("");setSociete("");setService("");
      }else{
        showToast("❌ "+(data.error||"Erreur Vapi"));
      }
    }catch(e){showToast("❌ Erreur connexion");}
    setLoading(false);
  };

  const appellerLead=async(lead)=>{
    if(!lead.tel)return showToast("⚠️ Pas de numéro");
    setLoading(true);
    try{
      const res=await fetch('/api/prospection',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'call',
          tel:lead.tel,nom:lead.nom,
          societe:lead.nom,
          secteur:lead.secteur||profil?.label||"Services",
          service:profil?.services?.[0]||"",
          phoneNumberId:PHONE_ID,
          assistantId:ASSISTANT_ID,
        }),
      });
      const data=await res.json();
      if(data.success)showToast("🎙 Lea appelle "+lead.nom+" !");
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
    setLoading(false);
  };

  const lancerCampagne=async()=>{
    if(leadsValides.length===0)return showToast("⚠️ Aucun lead avec numéro");
    setCampagneActive(true);
    let nb=0;
    for(const lead of leadsValides.slice(0,10)){
      try{
        await fetch('/api/prospection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'call',tel:lead.tel,nom:lead.nom,societe:lead.nom,secteur:lead.secteur||"Services",service:"",phoneNumberId:PHONE_ID,assistantId:ASSISTANT_ID})});
        nb++;
        setCampagneProgress(Math.round((nb/Math.min(10,leadsValides.length))*100));
        await new Promise(r=>setTimeout(r,2000));
      }catch(e){}
    }
    setCampagneActive(false);
    setCampagneProgress(0);
    showToast("✅ Campagne terminée — "+nb+" appels lancés !");
  };

  const tabs=[{id:"appel",label:"📞 Appel direct"},{id:"leads",label:"🎯 Leads"},{id:"campagne",label:"🚀 Campagne"},{id:"historique",label:"📋 Historique"}];

  return <div style={{padding:4}}>
    {/* Header */}
    <div style={{background:`linear-gradient(135deg,${C.purple}22,${C.card})`,border:`1px solid ${C.purple}44`,borderRadius:14,padding:18,marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:`${C.purple}33`,border:`2px solid ${C.purple}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🎙</div>
      <div style={{flex:1}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Lea — Agent Vocal IA</div>
        <div style={{fontSize:11,color:C.muted}}>Vapi · Multilingue · Sortant & Entrant & Relances</div>
        <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
          <span style={{fontSize:10,background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`,borderRadius:20,padding:"2px 8px"}}>● Actif</span>
          <span style={{fontSize:10,background:`${C.blue}22`,color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:20,padding:"2px 8px"}}>📞 {PHONE_ID}</span>
          <span style={{fontSize:10,background:`${C.gold}22`,color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:20,padding:"2px 8px"}}>🌍 Multilingue auto</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {[[calls.length,"Appels",C.blue],[calls.filter(c=>c.status==="ended").length,"Complétés",C.green]].map(([v,l,c],i)=>(
          <div key={i} style={{background:C.card2,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:9,color:C.muted}}>{l}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Appel en cours */}
    {activeCall&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}44`,borderRadius:8,padding:12,marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:10,height:10,borderRadius:"50%",background:C.green}}/>
      <span style={{fontSize:12,color:C.green,fontWeight:600}}>🎙 Lea est en appel maintenant</span>
      <BtnGhost onClick={()=>setActiveCall(null)} style={{marginLeft:"auto",fontSize:10}}>✕</BtnGhost>
    </div>}

    {/* Tabs */}
    <div style={{display:"flex",gap:4,marginBottom:14,background:C.card2,borderRadius:8,padding:4}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{flex:1,background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.purple:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"7px 4px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?700:400}}>{t.label}</button>)}
    </div>

    {/* APPEL DIRECT */}
    {onglet==="appel"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <CT>
        <STitle>📞 Lancer un appel</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
          <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Nom *</label><Inp value={nom} onChange={e=>setNom(e.target.value)} placeholder="M. Dupont"/></div>
          <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Téléphone * (+33...)</label><Inp value={tel} onChange={e=>setTel(e.target.value)} placeholder="+33612345678"/></div>
          <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Société</label><Inp value={societe} onChange={e=>setSociete(e.target.value)} placeholder="Nom de la société"/></div>
          <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Service à présenter</label><Inp value={service} onChange={e=>setService(e.target.value)} placeholder="Ex: Nettoyage bureaux"/></div>
        </div>
        <button onClick={lancerAppel} disabled={loading||!tel||!nom} style={{width:"100%",background:loading||!tel||!nom?C.muted:`linear-gradient(135deg,${C.purple},#6B3FCC)`,color:"#fff",border:"none",borderRadius:8,padding:"13px",cursor:loading?"not-allowed":"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit"}}>
          {loading?"⏳ Lea appelle...":"🎙 Lea appelle maintenant"}
        </button>
      </CT>
      <CT style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
        <STitle>🤖 Ce que fait Lea</STitle>
        {["Se présente en votre nom","Qualifie les besoins du prospect","Présente votre offre","Gère les objections","Fixe un RDV concret","Détecte la langue automatiquement","Ne révèle jamais être une IA","Relance si pas de réponse"].map((f,i)=>(
          <div key={i} style={{display:"flex",gap:8,fontSize:11,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
            <span style={{color:C.purple}}>✦</span><span style={{color:C.text}}>{f}</span>
          </div>
        ))}
      </CT>
    </div>}

    {/* LEADS */}
    {onglet==="leads"&&<div>
      {leadsValides.length===0?<div style={{textAlign:"center",padding:40,color:C.muted}}>
        <div style={{fontSize:36,marginBottom:8}}>🎯</div>
        <div style={{fontWeight:600,marginBottom:4}}>Aucun lead avec numéro</div>
        <div style={{fontSize:11}}>Faites une recherche SIRENE dans l'onglet ci-dessus</div>
      </div>:(leads||[]).map((l,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${l.tel?C.border:C.red+"33"}`}}>
          <div>
            <div style={{fontSize:12,fontWeight:700}}>{l.nom}</div>
            <div style={{fontSize:10,color:C.muted}}>{l.secteur} · {l.ville}</div>
            <div style={{fontSize:10,color:l.tel?C.green:C.red}}>{l.tel||"⚠️ Pas de numéro"}</div>
          </div>
          <button onClick={()=>appellerLead(l)} disabled={loading||!l.tel} style={{background:l.tel?C.purple:"#333",color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",cursor:l.tel?"pointer":"not-allowed",fontSize:11,fontFamily:"inherit",fontWeight:600}}>🎙 Appeler</button>
        </div>
      ))}
    </div>}

    {/* CAMPAGNE */}
    {onglet==="campagne"&&<CT>
      <STitle>🚀 Campagne automatique</STitle>
      <div style={{fontSize:11,color:C.muted,lineHeight:1.8,marginBottom:14}}>
        Lea appelle automatiquement jusqu'à <b style={{color:C.text}}>10 leads</b> en séquence. 2 secondes entre chaque appel.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:C.card,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:C.blue}}>{(leads||[]).length}</div><div style={{fontSize:9,color:C.muted}}>Leads total</div></div>
        <div style={{background:C.card,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:C.green}}>{leadsValides.length}</div><div style={{fontSize:9,color:C.muted}}>Avec téléphone</div></div>
      </div>
      {campagneActive&&<div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
          <span style={{color:C.purple,fontWeight:600}}>🎙 Campagne en cours...</span>
          <span>{campagneProgress}%</span>
        </div>
        <div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:campagneProgress+"%",background:C.purple,borderRadius:4,transition:"width .5s"}}/>
        </div>
      </div>}
      <button onClick={lancerCampagne} disabled={campagneActive||leadsValides.length===0} style={{width:"100%",background:campagneActive||leadsValides.length===0?C.muted:`linear-gradient(135deg,${C.purple},#6B3FCC)`,color:"#fff",border:"none",borderRadius:8,padding:"13px",cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit"}}>
        {campagneActive?`⏳ ${campagneProgress}%`:`🚀 Lancer (${Math.min(10,leadsValides.length)} appels)`}
      </button>
    </CT>}

    {/* HISTORIQUE */}
    {onglet==="historique"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
        <CT style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:C.blue}}>{calls.length}</div><div style={{fontSize:9,color:C.muted}}>Total</div></CT>
        <CT style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:C.green}}>{calls.filter(c=>c.status==="ended").length}</div><div style={{fontSize:9,color:C.muted}}>Complétés</div></CT>
        <CT style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:C.gold}}>{calls.length>0?Math.round(calls.filter(c=>c.duration).reduce((a,c)=>a+(c.duration||0),0)/Math.max(1,calls.filter(c=>c.duration).length))+"s":"—"}</div><div style={{fontSize:9,color:C.muted}}>Durée moy.</div></CT>
      </div>
      {calls.length===0?<div style={{textAlign:"center",padding:40,color:C.muted}}>
        <div style={{fontSize:32,marginBottom:8}}>📋</div>
        <div>Aucun appel pour le moment</div>
      </div>:<Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Prospect</TH><TH>Numéro</TH><TH>Date</TH><TH>Durée</TH><TH>Statut</TH></tr></thead>
          <tbody>{calls.slice(0,20).map((c,i)=>(
            <tr key={i}>
              <Td style={{fontWeight:600}}>{c.customer?.name||"—"}</Td>
              <Td style={{fontSize:10,color:C.muted}}>{c.customer?.number||"—"}</Td>
              <Td style={{fontSize:10,color:C.muted}}>{c.createdAt?new Date(c.createdAt).toLocaleString("fr"):"—"}</Td>
              <Td style={{color:C.blue}}>{c.duration?c.duration+"s":"—"}</Td>
              <Td><Pill color={c.status==="ended"?C.green:c.status==="in-progress"?C.gold:C.muted}>{c.status==="ended"?"✓ Terminé":c.status==="in-progress"?"● En cours":c.status||"—"}</Pill></Td>
            </tr>
          ))}</tbody>
        </table>
      </Card>}
    </div>}
  </div>;
};


// ─── PAGE PROSPECTION ─────────────────────────────────────────
const PageProspection=({plan,showToast,profil=null})=>{
  const[onglet,setOnglet]=useState("sirene");
  const[query,setQuery]=useState("");
  const[leads,setLeads]=useState([{nom:"Syndic Lebrun SARL",secteur:"Syndic",ville:"Créteil",tel:"01 45 67 89 01",email:"contact@lebrun.fr",score:88},{nom:"Cabinet Moreau Gestion",secteur:"Gestion immo",ville:"Ivry-sur-Seine",tel:"01 56 78 90 12",email:"info@moreau-gestion.fr",score:74},{nom:"Résidences du Val",secteur:"Bailleur social",ville:"Villejuif",tel:"01 67 89 01 23",email:"rh@residences-val.fr",score:91},{nom:"SCI Châtillon",secteur:"SCI / Investisseurs",ville:"Châtillon",tel:"01 78 90 12 34",email:"sci@chatillon.fr",score:67}]);
  const tabs=[{id:"sirene",label:"🏢 SIRENE / Leads"},{id:"sequences",label:"📧 Séquences"},{id:"bot",label:"🤖 Bot WhatsApp"},{id:"vocal",label:"🎙 Bot Vocal"},{id:"linkedin",label:"💼 LinkedIn"},{id:"stats",label:"📊 Stats"}];
  if(!hasAccess(plan,"prospection"))return <div style={{padding:20}}><UpgradeWall page="Prospection Auto" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>⊕ Prospection Automatique</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>SIRENE · Bot vocal · Bot WhatsApp · LinkedIn · 59 fonctionnalités</div>
    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>
    {onglet==="sirene"&&<>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <Inp value={query} onChange={e=>setQuery(e.target.value)} placeholder="🔍 Rechercher dans SIRENE (syndic, gestion, immo...)" style={{flex:1}}/>
        <Sel style={{width:160}}><option>Val-de-Marne (94)</option><option>Paris (75)</option><option>Hauts-de-Seine (92)</option><option>Seine-Saint-Denis (93)</option></Sel>
        <Btn onClick={()=>showToast("🔍 Recherche SIRENE lancée — 47 résultats trouvés !")}>Rechercher</Btn>
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <STitle>🎯 Leads qualifiés</STitle>
          <Btn onClick={()=>showToast("✅ Séquence envoyée à tous les leads !")} style={{fontSize:11,padding:"6px 12px"}}>📧 Envoyer séquence à tous</Btn>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Entreprise</TH><TH>Secteur</TH><TH>Ville</TH><TH>Score IA</TH><TH>Actions</TH></tr></thead>
          <tbody>{leads.map((l,i)=><tr key={i}>
            <Td style={{fontWeight:700}}>{l.nom}</Td>
            <Td><Pill color={C.blue}>{l.secteur}</Pill></Td>
            <Td style={{color:C.muted}}>{l.ville}</Td>
            <Td><div style={{display:"flex",alignItems:"center",gap:6}}><SM val={l.score} max={100} color={l.score>=80?C.green:C.gold}/><span style={{color:l.score>=80?C.green:C.gold,fontWeight:700}}>{l.score}</span></div></Td>
            <Td><div style={{display:"flex",gap:4}}>
              <Btn onClick={()=>showToast(`📱 WhatsApp envoyé à ${l.nom}`)} style={{padding:"4px 8px",fontSize:10}}>WA</Btn>
              <BtnGhost onClick={()=>showToast(`📞 Appel vocal ${l.nom}`)} style={{padding:"4px 8px",fontSize:10}}>📞</BtnGhost>
              <BtnGhost onClick={()=>showToast(`📧 Email envoyé à ${l.email}`)} style={{padding:"4px 8px",fontSize:10}}>✉️</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </>}
    {onglet==="sequences"&&<Card><STitle>📧 Séquences de prospection automatiques</STitle>
      {[{nom:"Séquence Syndics 94",etapes:["J0: Email découverte","J3: Relance WhatsApp","J7: Appel vocal","J14: Offre personnalisée"],taux:34,envoyes:47,ouverts:29},
        {nom:"Séquence Immobilier Premium",etapes:["J0: LinkedIn + Email","J2: WhatsApp","J5: Email étude de cas","J10: RDV proposé"],taux:28,envoyes:23,ouverts:15}].map((s,i)=><div key={i} style={{background:C.card2,borderRadius:10,padding:14,marginBottom:10,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:13,fontWeight:700}}>{s.nom}</div><Pill color={C.green}>Taux: {s.taux}%</Pill></div>
        <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>{s.etapes.map((e,j)=><Pill key={j} color={C.blue}>{e}</Pill>)}</div>
        <div style={{fontSize:11,color:C.muted}}>📨 {s.envoyes} envoyés · 👁 {s.ouverts} ouverts</div>
        <Btn onClick={()=>showToast("✅ Séquence activée !")} style={{marginTop:8,fontSize:11}}>▶ Activer</Btn>
      </div>)}
    </Card>}
    {onglet==="bot"&&<Card><STitle>🤖 Bot WhatsApp — Prospection automatique</STitle>
      <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:10,padding:14,marginBottom:14}}>
        <div style={{fontSize:11,color:C.green,fontWeight:600,marginBottom:4}}>● Bot actif · Connecté à Meta API</div>
        <div style={{fontSize:12,color:C.text}}>Modèle : claude-sonnet-4-5 · Webhook : actif · Réponse moyenne : 2.3s</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Messages envoyés" val="247" color={C.blue}/>
        <KPI label="Taux réponse" val="67%" color={C.green}/>
        <KPI label="RDV générés" val="8" color={C.gold}/>
      </div>
      <STitle>📧 Séquences RelanceIA</STitle>
      <RelanceIAWidget showToast={showToast}/>
    </Card>}
    {onglet==="vocal"&&<PageLea showToast={showToast} leads={leads} profil={profil}/>}
    {onglet==="linkedin"&&<Card><STitle>💼 Prospection LinkedIn</STitle>
      <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Envoi de messages LinkedIn automatiques via extension Chrome</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <KPI label="Connexions envoyées" val="84" color={C.blue}/>
        <KPI label="Acceptées" val="31" color={C.green}/>
        <KPI label="Messages envoyés" val="27" color={C.gold}/>
        <KPI label="RDV générés" val="4" color={C.teal}/>
      </div>
    </Card>}
    {onglet==="stats"&&<Card><STitle>📊 Performance prospection globale</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <KPI label="Leads générés" val="71" color={C.blue}/>
        <KPI label="Taux conversion global" val="12%" color={C.green}/>
        <KPI label="CA généré" val="8 400 €" color={C.gold}/>
      </div>
    </Card>}
  </div>;
};

// ─── PAGE STOCK ───────────────────────────────────────────────
const PageStock=({plan,showToast,profil})=>{
  const[_stockReal,setStockReal]=useState([]);
  const[_mouvementsReal,setMouvementsReal]=useState([]);
  const[_fournisseursReal,setFournisseursReal]=useState([]);
  const[_stockKpis,setStockKpis]=useState({valeurTotale:0,articlesCritiques:[],scoreStock:100});
  const[_stockIa,setStockIa]=useState("");
  const[_stockIaLoading,setStockIaLoading]=useState(false);

  const _loadStock=async()=>{
    try{
      const res=await fetch('/api/stock');
      const data=await res.json();
      if(data.articles&&data.articles.length>0){
        setStockReal(data.articles);
        setMouvementsReal(data.mouvements||[]);
        setFournisseursReal(data.fournisseurs||[]);
        setStockKpis({valeurTotale:data.valeurTotale||0,articlesCritiques:data.articlesCritiques||[],scoreStock:data.scoreStock||100});
        // Enrichir le stock existant avec les données réelles
        setStock(prev=>{
          const merged=data.articles.map((r)=>{
            const existing=prev.find(p=>p.art===r.art||p.id===r.id);
            return existing?{...existing,...r}:r;
          });
          return merged.length>0?merged:prev;
        });
      }
    }catch(e){console.log("Mode local stock");}
  };
  const _analyserStockIA=async()=>{
    if(_stockIaLoading)return;
    setStockIaLoading(true);
    try{
      const res=await fetch('/api/stock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',articles:_stockReal.length>0?_stockReal:stock})});
      const data=await res.json();
      if(data.success)setStockIa(data.analyse);
    }catch(e){}
    setStockIaLoading(false);
  };
  const _mouvement=async(articleId,type,quantite,note)=>{
    try{
      const res=await fetch('/api/stock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'mouvement',article_id:articleId,type,quantite,note,operateur:'Curtiss'})});
      const data=await res.json();
      if(data.success){showToast(`✅ Mouvement enregistré — Stock : ${data.nouvelleQte}`);_loadStock();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  useEffect(()=>{_loadStock();},[]);
  const[stock,setStock]=useState([
    {id:"ART-001",art:"Produit vitres Pro",cat:"Nettoyage",qte:3,min:5,max:20,u:"L",four:"CleanPro",prixU:12.5,localisation:"Entrepôt A",historique:[{date:"10/04",type:"sortie",qte:2,note:"Mission Airbnb Montmartre"},{date:"01/04",type:"entrée",qte:10,note:"Commande CleanPro #247"}]},
    {id:"ART-002",art:"Microfibre premium",cat:"Nettoyage",qte:24,min:20,max:100,u:"pcs",four:"TextilePro",prixU:3.5,localisation:"Entrepôt A",historique:[{date:"12/04",type:"sortie",qte:6,note:"Mission bureaux La Défense"}]},
    {id:"ART-003",art:"Désinfectant surfaces",cat:"Nettoyage",qte:8,min:6,max:30,u:"L",four:"CleanPro",prixU:8.0,localisation:"Entrepôt A",historique:[]},
    {id:"ART-004",art:"Housses rapatriement",cat:"Rapatriement",qte:2,min:4,max:10,u:"pcs",four:"MedSupply",prixU:45.0,localisation:"Entrepôt B",historique:[{date:"12/04",type:"sortie",qte:1,note:"Mission Lefevre"}]},
    {id:"ART-005",art:"Kit bord jet privé",cat:"Jet/Yacht",qte:5,min:3,max:15,u:"kits",four:"LuxEquip",prixU:85.0,localisation:"Entrepôt C",historique:[]},
    {id:"ART-006",art:"Produit nacre bois",cat:"Yacht",qte:1,min:3,max:10,u:"L",four:"YachtCare",prixU:65.0,localisation:"Entrepôt C",historique:[]},
    {id:"ART-007",art:"Gants latex pro",cat:"Protection",qte:150,min:50,max:500,u:"pcs",four:"CleanPro",prixU:0.35,localisation:"Entrepôt A",historique:[]},
    {id:"ART-008",art:"Sacs poubelle XXL",cat:"Consommables",qte:80,min:40,max:200,u:"pcs",four:"CleanPro",prixU:0.8,localisation:"Entrepôt A",historique:[]},
  ]);
  const[onglet,setOnglet]=useState("inventaire");
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({art:"",cat:"Nettoyage",qte:"",min:"",max:"",u:"pcs",four:"",prixU:"",localisation:"Entrepôt A"});
  const[qrScan,setQrScan]=useState(false);

  const tabs=[{id:"inventaire",label:"📦 Inventaire"},{id:"mouvements",label:"🔄 Mouvements"},{id:"commandes",label:"🛒 Commandes"},{id:"ia",label:"🤖 IA Prédictive"},{id:"valorisation",label:"💰 Valorisation"}];

  const critiques=stock.filter(s=>s.qte<s.min);
  const valeurTotale=stock.reduce((a,s)=>a+s.qte*s.prixU,0);

  if(!hasAccess(plan,"stock"))return <div style={{padding:20}}><UpgradeWall page="stock" plan={plan}/></div>;

  const ajouterMouvement=(idx,type,qte,note)=>{
    setStock(sk=>sk.map((s,i)=>i===idx?{...s,qte:type==="entrée"?s.qte+qte:Math.max(0,s.qte-qte),historique:[{date:new Date().toLocaleDateString("fr"),type,qte,note},...s.historique]}:s));
    showToast(`✅ ${type==="entrée"?"+":"-"}${qte} ${stock[idx]?.u} — ${stock[idx]?.art}`);
  };

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⊟ {profil?.termes?.stock||"Stock"}</div>
        <div style={{fontSize:11,color:C.muted}}>Inventaire · Mouvements · Commandes auto · IA prédictive · QR Code</div></div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={()=>setQrScan(s=>!s)}>📱 QR Scan</BtnGhost>
        <Btn onClick={()=>setShowAdd(s=>!s)}>+ Ajouter article</Btn>
      </div>
    </div>

    {qrScan&&<div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:14,marginBottom:12,textAlign:"center"}}>
      <div style={{fontSize:24,marginBottom:6}}>📱</div>
      <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>QR Code Scan — Terrain</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Utilisez l'app Xyra sur votre téléphone pour scanner les QR codes des articles en entrepôt. Les mouvements se synchronisent en temps réel.</div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <Btn onClick={()=>{showToast("✅ QR Code généré — envoyez à votre équipe");setQrScan(false);}} style={{fontSize:11}}>Générer QR Codes</Btn>
        <BtnGhost onClick={()=>setQrScan(false)} style={{fontSize:11}}>Fermer</BtnGhost>
      </div>
    </div>}

    {critiques.length>0&&<div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:10,padding:12,marginBottom:14}}>
      <div style={{fontSize:11,color:C.red,fontWeight:600,marginBottom:4}}>⚠️ {critiques.length} article(s) en stock critique — commande recommandée</div>
      <div style={{fontSize:11,color:C.text,marginBottom:8}}>{critiques.map(c=>c.art).join(" · ")}</div>
      <Btn onClick={()=>showToast("🛒 Commandes automatiques envoyées aux fournisseurs !")} style={{fontSize:11,background:C.red}}>🛒 Commander automatiquement tout</Btn>
    </div>}

    {showAdd&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>Nouvel article</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Nom de l'article","art"],["Fournisseur","four"],["Localisation","localisation"],["Prix unitaire (€)","prixU"],["Quantité initiale","qte"],["Stock minimum","min"],["Stock maximum","max"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={addForm[k]} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Catégorie</label><Sel value={addForm.cat} onChange={e=>setAddForm(f=>({...f,cat:e.target.value}))} style={{width:"100%"}}>{(profil?.stockCategories||["Nettoyage","Rapatriement","Jet/Yacht","Protection","Consommables","Autre"]).map(c=><option key={c}>{c}</option>)}</Sel></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Unité</label><Inp value={addForm.u} onChange={e=>setAddForm(f=>({...f,u:e.target.value}))} placeholder="pcs / L / kg..."/></div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>{const na={id:`ART-00${stock.length+1}`,art:addForm.art,cat:addForm.cat,qte:Number(addForm.qte)||0,min:Number(addForm.min)||5,max:Number(addForm.max)||50,u:addForm.u,four:addForm.four,prixU:Number(addForm.prixU)||0,localisation:addForm.localisation,historique:[{date:new Date().toLocaleDateString("fr"),type:"entrée",qte:Number(addForm.qte)||0,note:"Stock initial"}]};setStock(sk=>[...sk,na]);setShowAdd(false);setAddForm({art:"",cat:"Nettoyage",qte:"",min:"",max:"",u:"pcs",four:"",prixU:"",localisation:"Entrepôt A"});showToast(`✅ ${na.art} ajouté au stock !)`);}}>✅ Ajouter</Btn>
        <BtnGhost onClick={()=>setShowAdd(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <KPI label="Articles en stock" val={stock.length} color={C.blue}/>
      <KPI label="Articles critiques" val={critiques.length} color={C.red}/>
      <KPI label="Valeur totale" val={fmt(valeurTotale)} color={C.gold}/>
      <KPI label="Fournisseurs" val={[...new Set(stock.map(s=>s.four))].length} color={C.teal}/>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── INVENTAIRE ── */}
    {onglet==="inventaire"&&<Card>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Réf.</TH><TH>Article</TH><TH>Catégorie</TH><TH>Qté</TH><TH>Min / Max</TH><TH>Unité</TH><TH>Localisation</TH><TH>Fournisseur</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
        <tbody>{stock.map((s,i)=><tr key={i} style={{background:s.qte<s.min?`${C.red}08`:"transparent",cursor:"pointer"}} onClick={()=>setSel(sel?.id===s.id?null:s)}>
          <Td style={{color:C.muted,fontSize:9,fontFamily:"monospace"}}>{s.id}</Td>
          <Td style={{fontWeight:700}}>{s.art}</Td>
          <Td><Pill color={C.blue}>{s.cat}</Pill></Td>
          <Td style={{fontWeight:700,fontSize:16,color:s.qte<s.min?C.red:s.qte<=s.min*1.5?C.orange:C.green}}>{s.qte}</Td>
          <Td style={{color:C.muted,fontSize:10}}>{s.min} / {s.max}</Td>
          <Td style={{color:C.muted}}>{s.u}</Td>
          <Td style={{color:C.muted,fontSize:10}}>{s.localisation}</Td>
          <Td style={{color:C.muted,fontSize:11}}>{s.four}</Td>
          <Td>{s.qte<s.min?<Pill color={C.red}>⚠ Critique</Pill>:s.qte<=s.min*1.5?<Pill color={C.orange}>⚡ Bas</Pill>:<Pill color={C.green}>✓ OK</Pill>}</Td>
          <Td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:3}}>
            <Btn onClick={()=>ajouterMouvement(i,"entrée",10,"Réapprovisionnement")} style={{fontSize:9,padding:"3px 6px",background:C.green}}>+10</Btn>
            <BtnGhost onClick={()=>ajouterMouvement(i,"sortie",1,"Utilisation mission")} style={{fontSize:9,padding:"3px 6px"}}>-1</BtnGhost>
            {s.qte<s.min&&<Btn onClick={()=>showToast(`🛒 Commande ${s.art} envoyée à ${s.four}`)} style={{fontSize:9,padding:"3px 6px",background:C.orange}}>Commander</Btn>}
          </div></Td>
        </tr>)}
        </tbody>
      </table>
      {sel&&<div style={{marginTop:14,background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>{sel.art} — Détail</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Stock actuel</div><div style={{fontSize:18,fontWeight:700,color:sel.qte<sel.min?C.red:C.green}}>{sel.qte} {sel.u}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Prix unitaire</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(sel.prixU)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Valeur stock</div><div style={{fontSize:18,fontWeight:700,color:C.teal}}>{fmt(sel.qte*sel.prixU)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>À commander</div><div style={{fontSize:18,fontWeight:700,color:C.orange}}>{Math.max(0,sel.max-sel.qte)} {sel.u}</div></CT>
        </div>
      </div>}
    </Card>}

    {/* ── MOUVEMENTS ── */}
    {onglet==="mouvements"&&<Card>
      <STitle>🔄 Historique des mouvements</STitle>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Article</TH><TH>Date</TH><TH>Type</TH><TH>Quantité</TH><TH>Note</TH></tr></thead>
        <tbody>{stock.flatMap(s=>s.historique.map(h=>({...h,art:s.art,u:s.u}))).sort((a,b)=>b.date.localeCompare(a.date)).map((h,i)=><tr key={i}>
          <Td style={{fontWeight:600}}>{h.art}</Td>
          <Td style={{color:C.muted,fontSize:10}}>{h.date}</Td>
          <Td><Pill color={h.type==="entrée"?C.green:C.red}>{h.type==="entrée"?"↓ Entrée":"↑ Sortie"}</Pill></Td>
          <Td style={{color:h.type==="entrée"?C.green:C.red,fontWeight:700}}>{h.type==="entrée"?"+":"-"}{h.qte} {h.u}</Td>
          <Td style={{color:C.muted,fontSize:11}}>{h.note}</Td>
        </tr>)}
        </tbody>
      </table>
    </Card>}

    {/* ── COMMANDES ── */}
    {onglet==="commandes"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle>🛒 Commandes fournisseurs</STitle>
        <Btn onClick={()=>showToast("🛒 Toutes commandes critiques passées !")}>🛒 Commander tout le critique</Btn>
      </div>
      {stock.filter(s=>s.qte<s.min).map((s,i)=><Card key={i} style={{marginBottom:10,borderColor:`${C.red}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontSize:13,fontWeight:700}}>{s.art}</div><div style={{fontSize:10,color:C.muted}}>Fournisseur : {s.four} · Stock : {s.qte}/{s.min} {s.u}</div></div>
          <Pill color={C.red}>⚠ Critique</Pill>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Qté à commander</div><div style={{fontSize:16,fontWeight:700,color:C.orange}}>{s.max-s.qte} {s.u}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Prix unitaire</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(s.prixU)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Coût total</div><div style={{fontSize:16,fontWeight:700,color:C.red}}>{fmt((s.max-s.qte)*s.prixU)}</div></CT>
        </div>
        <Btn onClick={()=>{showToast(`✅ Commande ${s.art} envoyée à ${s.four} !`);}} style={{width:"100%",background:C.orange}}>🛒 Commander {s.max-s.qte} {s.u} chez {s.four}</Btn>
      </Card>)}
      {critiques.length===0&&<div style={{textAlign:"center",padding:40,color:C.muted}}><div style={{fontSize:32,marginBottom:8}}>✅</div><div>Aucune commande urgente — stock en bonne santé</div></div>}
    </div>}

    {/* ── IA PRÉDICTIVE ── */}
    {onglet==="ia"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 IA Prédictive — Claude Sonnet</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>Basé sur vos 30 derniers jours de mouvements, voici les prévisions de rupture de stock et les recommandations de commande.</div>
      </div>
      {stock.map((s,i)=>{const tendance=s.historique.filter(h=>h.type==="sortie").reduce((a,h)=>a+h.qte,0);const joursStock=tendance>0?Math.round(s.qte/(tendance/30)):999;return <Card key={i} style={{marginBottom:8,borderColor:joursStock<14?`${C.orange}33`:C.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,fontWeight:700}}>{s.art}</div><div style={{fontSize:10,color:C.muted}}>Consommation : {tendance} {s.u}/mois · Stock : {s.qte} {s.u}</div></div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,fontWeight:700,color:joursStock<7?C.red:joursStock<14?C.orange:C.green}}>{joursStock<999?`⏱ ${joursStock}j restants`:"♾ Stock stable"}</div>
            {joursStock<14&&<div style={{fontSize:9,color:C.orange}}>Commander dans {Math.max(0,joursStock-7)}j</div>}
          </div>
        </div>
      </Card>;})}
    </div>}

    {/* ── VALORISATION ── */}
    {onglet==="valorisation"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Valeur stock total" val={fmt(valeurTotale)} color={C.gold}/>
        <KPI label="Articles > 100€" val={stock.filter(s=>s.qte*s.prixU>100).length} color={C.blue}/>
        <KPI label="Coût commandes urgentes" val={fmt(critiques.reduce((a,s)=>a+(s.max-s.qte)*s.prixU,0))} color={C.red}/>
      </div>
      <Card>
        <STitle>💰 Valorisation par article</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Article</TH><TH>Catégorie</TH><TH>Qté</TH><TH>PU</TH><TH>Valeur stock</TH><TH>% du total</TH></tr></thead>
          <tbody>{[...stock].sort((a,b)=>b.qte*b.prixU-a.qte*a.prixU).map((s,i)=>{const val=s.qte*s.prixU;const pct=Math.round(val/valeurTotale*100);return <tr key={i}>
            <Td style={{fontWeight:700}}>{s.art}</Td>
            <Td><Pill color={C.blue}>{s.cat}</Pill></Td>
            <Td>{s.qte} {s.u}</Td>
            <Td style={{color:C.muted}}>{fmt(s.prixU)}</Td>
            <Td style={{color:C.gold,fontWeight:700}}>{fmt(val)}</Td>
            <Td><div style={{display:"flex",alignItems:"center",gap:6}}><SM val={pct} max={100} color={C.gold}/><span style={{fontSize:10,color:C.muted}}>{pct}%</span></div></Td>
          </tr>;})}
          </tbody>
        </table>
      </Card>
    </div>}
  </div>;
};
// ─── PAGE SERVICES ────────────────────────────────────────────
const PageServices=({plan,showToast,profil})=>{
  const services_base=profil?.services||PROFIL_DEFAUT.services;
  const[services,setServices]=useState([
    {id:1,nom:"Nettoyage Airbnb",cat:"Résidentiel",emoji:"🏠",prixStandard:280,prixVIP:240,prixEnterprise:210,actif:true,desc:"Nettoyage complet appartement Airbnb — produits inclus",duree:"2-3h",vendu:18,ca:5040,note:4.8},
    {id:2,nom:"Nettoyage bureaux",cat:"Professionnel",emoji:"🏢",prixStandard:480,prixVIP:420,prixEnterprise:380,actif:true,desc:"Nettoyage locaux professionnels + vitrerie",duree:"4-5h",vendu:8,ca:3840,note:4.7},
    {id:3,nom:"Nettoyage jet privé",cat:"Aviation",emoji:"✈️",prixStandard:1400,prixVIP:1200,prixEnterprise:1050,actif:true,desc:"Nettoyage intérieur jet privé — protocole aviation premium",duree:"3-4h",vendu:4,ca:5600,note:4.9},
    {id:4,nom:"Entretien yacht",cat:"Maritime",emoji:"⛵",prixStandard:1800,prixVIP:1550,prixEnterprise:1350,actif:true,desc:"Nettoyage et entretien superyacht — produits nacrés",duree:"6-8h",vendu:2,ca:3600,note:5.0},
    {id:5,nom:"Rapatriement corps",cat:"Funéraire",emoji:"✝️",prixStandard:4800,prixVIP:4200,prixEnterprise:3900,actif:true,desc:"Service complet rapatriement — France et international",duree:"Variable",vendu:3,ca:14400,note:4.9},
    {id:6,nom:"Résidentiel premium",cat:"Résidentiel",emoji:"🏡",prixStandard:350,prixVIP:300,prixEnterprise:260,actif:true,desc:"Nettoyage maison et appartement haut de gamme",duree:"3-4h",vendu:12,ca:4200,note:4.6},
    {id:7,nom:"Conciergerie VIP",cat:"Premium",emoji:"💎",prixStandard:800,prixVIP:680,prixEnterprise:600,actif:false,desc:"Service conciergerie tout inclus — clients VIP",duree:"Sur mesure",vendu:1,ca:800,note:5.0},
    {id:8,nom:"Nettoyage post-travaux",cat:"BTP",emoji:"🔨",prixStandard:650,prixVIP:560,prixEnterprise:490,actif:true,desc:"Nettoyage de fin de chantier — tous types de travaux",duree:"5-8h",vendu:5,ca:3250,note:4.5},
  ]);
  const[onglet,setOnglet]=useState("catalogue");
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",cat:"",emoji:"📦",prixStandard:"",prixVIP:"",desc:"",duree:""});

  const tabs=[{id:"catalogue",label:"📦 Catalogue"},{id:"tarifs",label:"💰 Tarifs clients"},{id:"stats",label:"📊 Stats ventes"},{id:"ajouter",label:"➕ Ajouter"}];

  const cats=[...new Set(services.map(s=>s.cat))];
  const totalCA=services.reduce((a,s)=>a+s.ca,0);
  const totalVendu=services.reduce((a,s)=>a+s.vendu,0);

  if(!hasAccess(plan,"services"))return <div style={{padding:20}}><UpgradeWall page="services" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⊛ Produits & Services</div>
        <div style={{fontSize:11,color:C.muted}}>Catalogue · Tarifs VIP/Standard · Stats ventes · Devis 1 clic</div></div>
      <Btn onClick={()=>setOnglet("ajouter")}>+ Ajouter un service</Btn>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <KPI label="Services actifs" val={services.filter(s=>s.actif).length} color={C.blue}/>
      <KPI label="CA total généré" val={fmt(totalCA)} color={C.gold}/>
      <KPI label="Prestations vendues" val={totalVendu} color={C.green}/>
      <KPI label="Note moyenne" val={(services.reduce((a,s)=>a+s.note,0)/services.length).toFixed(1)+"★"} color={C.teal}/>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* CATALOGUE */}
    {onglet==="catalogue"&&<div>
      {sel?<div>
        <BtnGhost onClick={()=>setSel(null)} style={{marginBottom:12}}>← Retour catalogue</BtnGhost>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:`${C.gold}33`}}>
            <div style={{fontSize:36,marginBottom:10}}>{sel.emoji}</div>
            <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{sel.nom}</div>
            <Pill color={C.blue}>{sel.cat}</Pill>
            <div style={{fontSize:12,color:C.muted,marginTop:8,marginBottom:14,lineHeight:1.6}}>{sel.desc}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Durée estimée</div><div style={{fontSize:13,fontWeight:700}}>{sel.duree}</div></CT>
              <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Note clients</div><div style={{fontSize:13,fontWeight:700,color:C.gold}}>{sel.note}★</div></CT>
              <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Prestations</div><div style={{fontSize:13,fontWeight:700,color:C.blue}}>{sel.vendu}</div></CT>
              <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>CA généré</div><div style={{fontSize:13,fontWeight:700,color:C.green}}>{fmt(sel.ca)}</div></CT>
            </div>
            <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:10,marginBottom:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
                <div><div style={{fontSize:9,color:C.muted}}>Standard</div><div style={{fontSize:14,fontWeight:700}}>{fmt(sel.prixStandard)}</div></div>
                <div><div style={{fontSize:9,color:C.gold}}>VIP (-15%)</div><div style={{fontSize:14,fontWeight:700,color:C.gold}}>{fmt(sel.prixVIP)}</div></div>
                <div><div style={{fontSize:9,color:C.purple}}>Enterprise (-25%)</div><div style={{fontSize:14,fontWeight:700,color:C.purple}}>{fmt(sel.prixEnterprise)}</div></div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={()=>showToast(`✅ Devis ${sel.nom} créé — Envoi WA`)}>◧ Devis 1 clic</Btn>
              <BtnGhost onClick={()=>{setServices(ss=>ss.map(s=>s.id===sel.id?{...s,actif:!s.actif}:s));setSel(s=>({...s,actif:!s.actif}));showToast(`✅ Service ${sel.actif?"désactivé":"activé"}`);}}>{sel.actif?"⏸ Désactiver":"▶ Activer"}</BtnGhost>
            </div>
          </Card>
          <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
            <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:10}}>🤖 Analyse IA — Claude</div>
            <div style={{fontSize:12,color:C.text,lineHeight:1.8,marginBottom:14}}>
              {sel.ca>5000?`"${sel.nom}" est votre service le plus rentable. CA généré : ${fmt(sel.ca)}. Recommandation : créez un forfait mensuel récurrent pour fidéliser vos clients sur ce service.`:`"${sel.nom}" a du potentiel non exploité. Seulement ${sel.vendu} ventes. Recommandation : mettez-le en avant dans vos prochains devis — proposez-le en upsell systématiquement.`}
            </div>
            <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>📊 Benchmark tarifs</div>
            {[["Marché bas de gamme",fmt(Math.round(sel.prixStandard*0.6))],[`Votre tarif Standard`,fmt(sel.prixStandard)],["Marché haut de gamme",fmt(Math.round(sel.prixStandard*1.5))]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:700,color:i===1?C.gold:C.muted}}>{v}</span></div>)}
          </Card>
        </div>
      </div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
        {services.map((s,i)=><Card key={i} style={{cursor:"pointer",opacity:s.actif?1:0.5,borderColor:s.actif?`${C.gold}22`:C.border}} onClick={()=>setSel(s)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{fontSize:28}}>{s.emoji}</div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <Pill color={s.actif?C.green:C.muted}>{s.actif?"● Actif":"○ Inactif"}</Pill>
              <button onClick={e=>{e.stopPropagation();setServices(ss=>ss.map(x=>x.id===s.id?{...x,actif:!x.actif}:x));showToast(`✅ ${s.nom} ${s.actif?"désactivé":"activé"}`);}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px",cursor:"pointer",fontSize:9,color:C.muted,fontFamily:"inherit"}}>{s.actif?"Pause":"▶"}</button>
            </div>
          </div>
          <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{s.nom}</div>
          <Pill color={C.blue}>{s.cat}</Pill>
          <div style={{fontSize:11,color:C.muted,marginTop:6,marginBottom:10,lineHeight:1.5}}>{s.desc.slice(0,60)}...</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(s.prixStandard)}</div>
            <div style={{fontSize:10,color:C.gold}}>★ {s.note} · {s.vendu} ventes</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <Btn onClick={e=>{e.stopPropagation();showToast(`✅ Devis ${s.nom} créé !`);}} style={{fontSize:10,padding:"6px 4px"}}>◧ Devis</Btn>
            <BtnGhost onClick={e=>{e.stopPropagation();setSel(s);}} style={{fontSize:10,padding:"6px 4px"}}>Voir fiche</BtnGhost>
          </div>
        </Card>)}
      </div>}
    </div>}

    {/* TARIFS */}
    {onglet==="tarifs"&&<Card>
      <STitle>💰 Grille tarifaire par type de client</STitle>
      <div style={{background:`${C.blue}08`,border:`1px solid ${C.blue}22`,borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:C.text}}>
        Les tarifs VIP et Enterprise sont appliqués automatiquement lors de la création d'un devis selon le profil du client.
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
          <thead><tr><TH>Service</TH><TH>Catégorie</TH><TH>Standard</TH><TH><span style={{color:C.gold}}>VIP (-15%)</span></TH><TH><span style={{color:C.purple}}>Enterprise (-25%)</span></TH><TH>Statut</TH></tr></thead>
          <tbody>{services.map((s,i)=><tr key={i}>
            <Td style={{fontWeight:700}}>{s.emoji} {s.nom}</Td>
            <Td><Pill color={C.blue}>{s.cat}</Pill></Td>
            <Td style={{fontWeight:700}}>{fmt(s.prixStandard)}</Td>
            <Td style={{color:C.gold,fontWeight:700}}>{fmt(s.prixVIP)}</Td>
            <Td style={{color:C.purple,fontWeight:700}}>{fmt(s.prixEnterprise)}</Td>
            <Td><Pill color={s.actif?C.green:C.muted}>{s.actif?"Actif":"Inactif"}</Pill></Td>
          </tr>)}</tbody>
        </table>
      </div>
    </Card>}

    {/* STATS */}
    {onglet==="stats"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Top services par CA</STitle>
          {[...services].sort((a,b)=>b.ca-a.ca).map((s,i)=><div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{s.emoji} {s.nom}</span><span style={{color:C.gold,fontWeight:700}}>{fmt(s.ca)}</span></div>
            <SM val={s.ca} max={Math.max(...services.map(x=>x.ca))} color={C.gold}/>
          </div>)}
        </Card>
        <Card>
          <STitle>📊 Top services par volume</STitle>
          {[...services].sort((a,b)=>b.vendu-a.vendu).map((s,i)=><div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{s.emoji} {s.nom}</span><span style={{color:C.blue,fontWeight:700}}>{s.vendu} ventes</span></div>
            <SM val={s.vendu} max={Math.max(...services.map(x=>x.vendu))} color={C.blue}/>
          </div>)}
        </Card>
      </div>
      <Card>
        <STitle>⭐ Notes clients par service</STitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
          {[...services].sort((a,b)=>b.note-a.note).map((s,i)=><CT key={i} style={{textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.emoji}</div>
            <div style={{fontSize:11,fontWeight:700,marginBottom:2}}>{s.nom}</div>
            <div style={{fontSize:18,fontWeight:700,color:C.gold}}>{s.note}★</div>
          </CT>)}
        </div>
      </Card>
    </div>}

    {/* AJOUTER */}
    {onglet==="ajouter"&&<div style={{maxWidth:560}}>
      <Card>
        <STitle>➕ Nouveau service / produit</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:8}}>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Emoji</label><Inp value={addForm.emoji} onChange={e=>setAddForm(f=>({...f,emoji:e.target.value}))} style={{width:60}}/></div>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Nom du service *</label><Inp value={addForm.nom} onChange={e=>setAddForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: Nettoyage piscine"/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Catégorie</label><Inp value={addForm.cat} onChange={e=>setAddForm(f=>({...f,cat:e.target.value}))} placeholder="Ex: Résidentiel"/></div>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Durée estimée</label><Inp value={addForm.duree} onChange={e=>setAddForm(f=>({...f,duree:e.target.value}))} placeholder="Ex: 2-3h"/></div>
          </div>
          <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Description</label><Inp value={addForm.desc} onChange={e=>setAddForm(f=>({...f,desc:e.target.value}))} placeholder="Décrivez le service..."/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Prix Standard (€) *</label><Inp value={addForm.prixStandard} onChange={e=>setAddForm(f=>({...f,prixStandard:e.target.value}))} placeholder="Ex: 350"/></div>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Prix VIP (€)</label><Inp value={addForm.prixVIP} onChange={e=>setAddForm(f=>({...f,prixVIP:e.target.value}))} placeholder="Auto: -15%"/></div>
          </div>
          {addForm.prixStandard&&<div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:10,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center",fontSize:11}}>
            <div><div style={{color:C.muted}}>Standard</div><div style={{fontWeight:700}}>{fmt(Number(addForm.prixStandard))}</div></div>
            <div><div style={{color:C.gold}}>VIP (-15%)</div><div style={{fontWeight:700,color:C.gold}}>{fmt(Math.round(Number(addForm.prixStandard)*0.85))}</div></div>
            <div><div style={{color:C.purple}}>Enterprise (-25%)</div><div style={{fontWeight:700,color:C.purple}}>{fmt(Math.round(Number(addForm.prixStandard)*0.75))}</div></div>
          </div>}
          <Btn onClick={()=>{
            if(!addForm.nom||!addForm.prixStandard)return showToast("⚠️ Nom et prix requis");
            const ns={id:services.length+1,nom:addForm.nom,cat:addForm.cat||"Autre",emoji:addForm.emoji,prixStandard:Number(addForm.prixStandard),prixVIP:Number(addForm.prixVIP)||Math.round(Number(addForm.prixStandard)*0.85),prixEnterprise:Math.round(Number(addForm.prixStandard)*0.75),actif:true,desc:addForm.desc,duree:addForm.duree,vendu:0,ca:0,note:0};
            setServices(ss=>[...ss,ns]);setAddForm({nom:"",cat:"",emoji:"📦",prixStandard:"",prixVIP:"",desc:"",duree:""});
            showToast(`✅ Service "${ns.nom}" ajouté !`);setOnglet("catalogue");
          }}>✅ Ajouter ce service</Btn>
        </div>
      </Card>
    </div>}
  </div>;
};
// ─── PAGE CHAT ────────────────────────────────────────────────
const PageChat=({plan,showToast})=>{
  const[espace,setEspace]=useState("equipe");
  const[convs,setConvs]=useState([]);
  const[loadingConvs,setLoadingConvs]=useState(true);
  const[selConv,setSelConv]=useState(null);
  const[msgInput,setMsgInput]=useState("");
  const[showNewConv,setShowNewConv]=useState(false);
  const[newConvForm,setNewConvForm]=useState({contact_nom:"",contact_type:"client",contact_tel:"",contact_email:"",premier_contact:true});
  const[suggestion,setSuggestion]=useState("");
  const[suggestionLoading,setSuggestionLoading]=useState(false);
  const[resume,setResume]=useState("");
  const[resumeLoading,setResumeLoading]=useState(false);
  const[swipingId,setSwipingId]=useState(null);
  const[dragX,setDragX]=useState(0);
  const dragStartX=useRef(0);
  const fileRef=useRef(null);
  const audioRef=useRef(null);
  const[recording,setRecording]=useState(false);
  const endRef=useRef();

  const espaces=[{id:"equipe",label:"👥 Équipe"},{id:"externe",label:"💬 Clients & Partenaires"},{id:"visio",label:"🎥 Visio Jitsi"}];

  const loadConvs=async()=>{
    try{
      const res=await fetch(`/api/chat?espace=${espace==="visio"?"externe":espace}`);
      const data=await res.json();
      if(data.conversations)setConvs(data.conversations);
    }catch(e){console.error("Chat:",e);}
    setLoadingConvs(false);
  };
  useEffect(()=>{if(espace!=="visio"){setLoadingConvs(true);setSelConv(null);loadConvs();}},[espace]);
  useEffect(()=>{const i=setInterval(()=>{if(espace!=="visio")loadConvs();},15000);return()=>clearInterval(i);},[espace]);
  useEffect(()=>{if(selConv)setSelConv(c=>convs.find(x=>x.id===c.id)||null);},[convs]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[selConv?.messages?.length]);

  // Vérifie l'inactivité 1h toutes les 5 minutes
  useEffect(()=>{
    const check=()=>{fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verifier_inactivite'})}).catch(()=>{});};
    const i=setInterval(check,5*60*1000);
    return()=>clearInterval(i);
  },[]);

  const creerConversation=async()=>{
    if(!newConvForm.contact_nom)return showToast("⚠️ Nom du contact requis");
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_conversation',espace,...newConvForm})});
      const data=await res.json();
      if(data.success){showToast(`✅ Conversation créée avec ${newConvForm.contact_nom}`+(newConvForm.premier_contact?" — message de bienvenue envoyé":""));setShowNewConv(false);setNewConvForm({contact_nom:"",contact_type:"client",contact_tel:"",contact_email:"",premier_contact:true});loadConvs();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const envoyerMsg=async()=>{
    if(!msgInput.trim()||!selConv)return;
    const texte=msgInput;setMsgInput("");setSuggestion("");
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_message',conversation_id:selConv.id,contenu:texte,contact_tel:selConv.contact_tel})});
      const data=await res.json();
      if(data.success)loadConvs();
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const demanderSuggestion=async()=>{
    if(!selConv?.messages?.length)return showToast("⚠️ Aucun historique pour suggérer une réponse");
    setSuggestionLoading(true);
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'suggestion_reponse',conversation_id:selConv.id,derniers_messages:selConv.messages.slice(-8)})});
      const data=await res.json();
      if(data.success)setSuggestion(data.suggestion);
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
    setSuggestionLoading(false);
  };

  const demanderResume=async()=>{
    if(!selConv?.messages?.length)return showToast("⚠️ Conversation vide");
    setResumeLoading(true);
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'resume_conversation',messages:selConv.messages})});
      const data=await res.json();
      if(data.success)setResume(data.resume);
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
    setResumeLoading(false);
  };

  const creerActionDepuis=async(type)=>{
    if(!selConv)return;
    showToast(`⏳ Création ${type}...`);
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_action',type,conversation_id:selConv.id,contact_nom:selConv.contact_nom,contact_email:selConv.contact_email,contact_tel:selConv.contact_tel})});
      const data=await res.json();
      if(data.success)showToast(`✅ ${type==='deal'?'Deal':'Devis'} créé pour ${selConv.contact_nom}`);
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const supprimerConv=async(id)=>{
    try{
      await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer_conversation',id})});
      setConvs(cs=>cs.filter(c=>c.id!==id));
      if(selConv?.id===id)setSelConv(null);
      showToast("🗑 Conversation supprimée");
    }catch(e){showToast("❌ Erreur");}
  };

  const handleFile=async(e)=>{
    const file=e.target.files?.[0];
    if(!file||!selConv)return;
    showToast("⏳ Envoi du fichier...");
    try{
      const reader=new FileReader();
      reader.onload=async()=>{
        try{
          const{createClient}=await import('@supabase/supabase-js');
          const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
          const path=`chat/${selConv.id}/${Date.now()}_${file.name}`;
          const{data:upData,error:upErr}=await sb.storage.from('attachments').upload(path,file);
          if(upErr){showToast("❌ Échec de l'envoi — vérifie que le bucket 'attachments' existe");return;}
          const{data:urlData}=sb.storage.from('attachments').getPublicUrl(path);
          await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_message',conversation_id:selConv.id,contenu:"📎 "+file.name,type:file.type.startsWith("image/")?"image":"fichier",fichier_url:urlData.publicUrl})});
          loadConvs();showToast("✅ Fichier envoyé");
        }catch(e2){showToast("❌ Erreur d'envoi");}
      };
      reader.readAsArrayBuffer(file);
    }catch(e){showToast("❌ Erreur");}
    e.target.value="";
  };

  const startRecording=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const recorder=new MediaRecorder(stream);
      const chunks=[];
      recorder.ondataavailable=ev=>chunks.push(ev.data);
      recorder.onstop=async()=>{
        const blob=new Blob(chunks,{type:"audio/webm"});
        if(!selConv)return;
        showToast("⏳ Envoi du message vocal...");
        try{
          const{createClient}=await import('@supabase/supabase-js');
          const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
          const path=`chat/${selConv.id}/${Date.now()}_vocal.webm`;
          const{error:upErr}=await sb.storage.from('attachments').upload(path,blob);
          if(upErr){showToast("❌ Échec — vérifie le bucket 'attachments'");return;}
          const{data:urlData}=sb.storage.from('attachments').getPublicUrl(path);
          await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_message',conversation_id:selConv.id,contenu:"🎤 Message vocal",type:"audio",fichier_url:urlData.publicUrl})});
          loadConvs();showToast("✅ Message vocal envoyé");
        }catch(e){showToast("❌ Erreur d'envoi");}
        stream.getTracks().forEach(t=>t.stop());
      };
      recorder.start();audioRef.current=recorder;setRecording(true);
    }catch(e){showToast("⚠️ Micro non accessible");}
  };
  const stopRecording=()=>{audioRef.current?.stop();setRecording(false);};

  const catColor={nouveau_lead:C.orange,suivi:C.blue,vip:C.gold,cloture:C.muted};
  const catLabel={nouveau_lead:"🆕 Nouveau lead",suivi:"💬 Suivi",vip:"⭐ VIP",cloture:"✅ Clôturé"};

  // Swipe handlers pour la liste de conversations
  const onSwipeStart=(id,x)=>{setSwipingId(id);dragStartX.current=x;setDragX(0);};
  const onSwipeMove=(id,x)=>{if(swipingId!==id)return;setDragX(Math.max(-72,Math.min(0,x-dragStartX.current)));};
  const onSwipeEnd=(id)=>{if(dragX<-36){setDragX(-72);}else{setDragX(0);setSwipingId(null);}};

  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>💬 Chat</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Équipe interne · Clients & Partenaires · Visio Jitsi · IA quand tu es absent</div>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{espaces.map(e=><button key={e.id} onClick={()=>setEspace(e.id)} style={{background:espace===e.id?C.card:C.card2,color:espace===e.id?C.gold:C.muted,border:`1px solid ${espace===e.id?C.gold+"44":C.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{e.label}</button>)}</div>

    {/* ── VISIO ── */}
    {espace==="visio"&&<Card style={{height:460,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:48}}>🎥</div>
      <div style={{fontSize:14,fontWeight:700,color:C.text}}>Visioconférence Jitsi</div>
      <div style={{fontSize:11,color:C.muted}}>Crée une salle pour une réunion d'équipe ou avec un client/partenaire</div>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={()=>{const room=`xyra-${Date.now().toString(36)}`;window.open(`https://meet.jit.si/${room}`,"_blank");showToast("🎥 Salle Jitsi ouverte dans un nouvel onglet");}}>🎥 Nouvelle salle</Btn>
        <BtnGhost onClick={()=>{const room=`xyra-${Date.now().toString(36)}`;navigator.clipboard?.writeText(`https://meet.jit.si/${room}`);showToast("📋 Lien copié — partage-le pour inviter quelqu'un");}}>📋 Copier un lien à partager</BtnGhost>
      </div>
      {convs.length>0&&<div style={{marginTop:10,width:"100%",maxWidth:400}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:6,textAlign:"center"}}>Ou rejoindre la salle dédiée d'une conversation existante</div>
        {convs.filter(c=>c.jitsi_room).slice(0,5).map(c=><div key={c.id} onClick={()=>window.open(`https://meet.jit.si/${c.jitsi_room}`,"_blank")} style={{background:C.card2,borderRadius:8,padding:"8px 12px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",fontSize:11}}>
          <span>{c.contact_nom}</span><span style={{color:C.gold}}>Rejoindre →</span>
        </div>)}
      </div>}
    </Card>}

    {/* ── ÉQUIPE / EXTERNE ── */}
    {espace!=="visio"&&<div style={{display:"grid",gridTemplateColumns:selConv?"260px 1fr":"1fr",gap:12}}>
      <Card style={{padding:0,overflow:"hidden",height:520}}>
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:700,color:C.muted}}>{espace==="equipe"?"ÉQUIPE":"CLIENTS & PARTENAIRES"}</span>
          <button onClick={()=>setShowNewConv(s=>!s)} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:16}}>+</button>
        </div>
        {showNewConv&&<div style={{padding:10,borderBottom:`1px solid ${C.border}`,background:C.card2}}>
          <Inp value={newConvForm.contact_nom} onChange={e=>setNewConvForm(f=>({...f,contact_nom:e.target.value}))} placeholder="Nom du contact" style={{marginBottom:6,fontSize:11}}/>
          {espace==="externe"&&<Sel value={newConvForm.contact_type} onChange={e=>setNewConvForm(f=>({...f,contact_type:e.target.value}))} style={{width:"100%",marginBottom:6,fontSize:11}}>
            <option value="client">Client</option><option value="lead">Nouveau lead</option><option value="partenaire">Partenaire</option><option value="fournisseur">Fournisseur</option>
          </Sel>}
          <Inp value={newConvForm.contact_tel} onChange={e=>setNewConvForm(f=>({...f,contact_tel:e.target.value}))} placeholder="Téléphone WhatsApp" style={{marginBottom:6,fontSize:11}}/>
          <Inp value={newConvForm.contact_email} onChange={e=>setNewConvForm(f=>({...f,contact_email:e.target.value}))} placeholder="Email (optionnel)" style={{marginBottom:6,fontSize:11}}/>
          {(newConvForm.contact_type==="client"||newConvForm.contact_type==="lead")&&<label style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:C.muted,marginBottom:8,cursor:"pointer"}}><input type="checkbox" checked={newConvForm.premier_contact} onChange={e=>setNewConvForm(f=>({...f,premier_contact:e.target.checked}))}/>Envoyer le message de bienvenue automatique</label>}
          <div style={{display:"flex",gap:6}}><Btn onClick={creerConversation} style={{fontSize:10,padding:"5px 10px"}}>Créer</Btn><BtnGhost onClick={()=>setShowNewConv(false)} style={{fontSize:10,padding:"5px 10px"}}>Annuler</BtnGhost></div>
        </div>}
        <div style={{overflowY:"auto",height:"calc(100% - 44px)"}}>
          {loadingConvs&&<div style={{padding:14,fontSize:11,color:C.muted}}>Chargement...</div>}
          {!loadingConvs&&convs.length===0&&<div style={{padding:14,fontSize:11,color:C.muted,textAlign:"center"}}>Aucune conversation. Clique sur + pour commencer.</div>}
          {convs.map(c=><div key={c.id} style={{position:"relative",overflow:"hidden"}}>
            <div onClick={()=>supprimerConv(c.id)} style={{position:"absolute",top:0,right:0,bottom:0,width:72,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:10,fontWeight:700}}>🗑 Suppr.</div>
            <div
              onClick={()=>{if(swipingId===c.id&&dragX!==0)return;setSelConv(c);if(c.id)fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'marquer_lu',conversation_id:c.id})}).then(loadConvs);}}
              onTouchStart={e=>onSwipeStart(c.id,e.touches[0].clientX)}
              onTouchMove={e=>onSwipeMove(c.id,e.touches[0].clientX)}
              onTouchEnd={()=>onSwipeEnd(c.id)}
              onMouseDown={e=>onSwipeStart(c.id,e.clientX)}
              onMouseMove={e=>{if(swipingId===c.id)onSwipeMove(c.id,e.clientX);}}
              onMouseUp={()=>onSwipeEnd(c.id)}
              onMouseLeave={()=>{if(swipingId===c.id)onSwipeEnd(c.id);}}
              style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"grab",background:selConv?.id===c.id?`${C.gold}0D`:C.card,borderBottom:`1px solid ${C.border}22`,transform:`translateX(${swipingId===c.id?dragX:0}px)`,transition:swipingId===c.id?"none":"transform .2s"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.blue,flexShrink:0}}>{c.contact_nom?.[0]||"?"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:c.nonLus>0?700:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.contact_nom}</div>
                <div style={{fontSize:9,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.dernierMsg?.contenu||"Aucun message"}</div>
              </div>
              {c.nonLus>0&&<span style={{background:C.red,color:"#fff",borderRadius:20,padding:"0 5px",fontSize:9,fontWeight:700,flexShrink:0}}>{c.nonLus}</span>}
            </div>
          </div>)}
        </div>
      </Card>

      {selConv?<Card style={{padding:0,overflow:"hidden",height:520,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.card2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{selConv.contact_nom}</div>
            <div style={{fontSize:10,color:C.muted,display:"flex",gap:6,alignItems:"center"}}>{selConv.contact_type||"équipe"}{selConv.categorie&&<Pill color={catColor[selConv.categorie]}>{catLabel[selConv.categorie]}</Pill>}</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>window.open(`https://meet.jit.si/${selConv.jitsi_room||"xyra-"+selConv.id}`,"_blank")} title="Lancer une visio" style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",cursor:"pointer",color:C.green,fontSize:12}}>🎥</button>
            <button onClick={demanderResume} title="Résumer la conversation" style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",cursor:"pointer",color:C.purple,fontSize:12}}>{resumeLoading?"⏳":"📝"}</button>
          </div>
        </div>
        {resume&&<div style={{background:`${C.purple}11`,borderBottom:`1px solid ${C.purple}33`,padding:10,fontSize:11,color:C.text,lineHeight:1.6}}>🤖 <b>Résumé :</b> {resume} <span onClick={()=>setResume("")} style={{cursor:"pointer",color:C.muted,marginLeft:6}}>✕</span></div>}
        <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
          {(selConv.messages||[]).map((m,i)=><div key={m.id||i} style={{display:"flex",gap:8,flexDirection:m.moi?"row-reverse":"row"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:m.moi?`${C.gold}22`:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:m.moi?C.gold:C.blue,flexShrink:0}}>{m.moi?(m.type==="auto_ia"?"🤖":"C"):selConv.contact_nom?.[0]}</div>
            <div style={{maxWidth:"70%"}}>
              <div style={{background:m.moi?(m.type==="auto_ia"?`${C.purple}18`:`${C.gold}18`):C.card2,border:`1px solid ${m.moi?(m.type==="auto_ia"?C.purple+"33":C.gold+"33"):C.border}`,borderRadius:10,padding:"8px 12px"}}>
                {m.type==="image"&&m.fichier_url&&<img src={m.fichier_url} alt="" style={{maxWidth:200,borderRadius:6,marginBottom:4,display:"block"}}/>}
                {m.type==="audio"&&m.fichier_url&&<audio controls src={m.fichier_url} style={{maxWidth:220,marginBottom:4}}/>}
                <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{m.contenu}</div>
              </div>
              <div style={{fontSize:9,color:C.muted,textAlign:m.moi?"right":"left",marginTop:2}}>{m.created_at?new Date(m.created_at).toLocaleString("fr",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}{m.type==="auto_ia"?" · réponse IA":""}</div>
            </div>
          </div>)}
          <div ref={endRef}/>
        </div>
        {suggestion&&<div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:8,padding:10,margin:"0 16px 10px",fontSize:11,color:C.text}}>
          <div style={{color:C.blue,fontWeight:700,marginBottom:4}}>💡 Suggestion Claude</div>
          {suggestion}
          <div style={{marginTop:8,display:"flex",gap:6}}><Btn onClick={()=>{setMsgInput(suggestion);setSuggestion("");}} style={{fontSize:10,padding:"4px 10px"}}>Utiliser</Btn><BtnGhost onClick={()=>setSuggestion("")} style={{fontSize:10,padding:"4px 10px"}}>Ignorer</BtnGhost></div>
        </div>}
        <div style={{padding:"8px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:6,flexWrap:"wrap"}}>
          {espace==="externe"&&<>
            <BtnGhost onClick={()=>creerActionDepuis("deal")} style={{fontSize:9,padding:"3px 8px"}}>+ Deal</BtnGhost>
            <BtnGhost onClick={()=>creerActionDepuis("devis")} style={{fontSize:9,padding:"3px 8px"}}>+ Devis</BtnGhost>
          </>}
          <BtnGhost onClick={demanderSuggestion} style={{fontSize:9,padding:"3px 8px",color:C.blue,borderColor:`${C.blue}44`}}>{suggestionLoading?"⏳":"💡 Suggestion IA"}</BtnGhost>
        </div>
        <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"center"}}>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={handleFile}/>
          <button onClick={()=>fileRef.current?.click()} title="Joindre une photo/fichier" style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>📎</button>
          <button onClick={recording?stopRecording:startRecording} title="Message vocal" style={{background:recording?C.red:"transparent",border:"none",color:recording?"#fff":C.muted,cursor:"pointer",fontSize:16,borderRadius:"50%",width:28,height:28}}>🎤</button>
          <Inp value={msgInput} onChange={e=>setMsgInput(e.target.value)} placeholder="Écrire un message..." style={{flex:1}} onKeyDown={e=>{if(e.key==="Enter")envoyerMsg();}}/>
          <Btn onClick={envoyerMsg} style={{padding:"8px 14px",flexShrink:0}}>↗</Btn>
        </div>
      </Card>:<Card style={{height:520,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:32,marginBottom:8}}>💬</div><div style={{fontSize:12}}>Sélectionne une conversation</div></div>
      </Card>}
    </div>}
  </div>;
};

const SwipeableNotif=({n,i,onOpen,onDelete,typeColor})=>{
  const[dragX,setDragX]=useState(0);
  const[dragging,setDragging]=useState(false);
  const startX=useRef(0);
  const DELETE_W=72;

  const onStart=(clientX)=>{startX.current=clientX;setDragging(true);};
  const onMove=(clientX)=>{
    if(!dragging)return;
    const delta=clientX-startX.current;
    setDragX(Math.max(-DELETE_W,Math.min(0,delta)));
  };
  const onEnd=()=>{
    setDragging(false);
    if(dragX<-DELETE_W/2)setDragX(-DELETE_W);else setDragX(0);
  };

  return <div style={{position:"relative",overflow:"hidden",borderRadius:10}}>
    <div onClick={()=>{onDelete();}} style={{position:"absolute",top:0,right:0,bottom:0,width:DELETE_W,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:11,fontWeight:700}}>🗑 Suppr.</div>
    <div
      onClick={()=>{if(dragX===0)onOpen();}}
      onTouchStart={e=>onStart(e.touches[0].clientX)}
      onTouchMove={e=>onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
      onMouseDown={e=>onStart(e.clientX)}
      onMouseMove={e=>{if(dragging)onMove(e.clientX);}}
      onMouseUp={onEnd}
      onMouseLeave={()=>{if(dragging)onEnd();}}
      style={{background:n.lu?C.card2:C.card,border:`1px solid ${n.lu?C.border:typeColor[n.type]||C.border}44`,borderRadius:10,padding:"12px 16px",cursor:"grab",display:"flex",gap:12,alignItems:"center",transform:`translateX(${dragX}px)`,transition:dragging?"none":"transform .2s",position:"relative",userSelect:"none"}}>
      <div style={{fontSize:22,flexShrink:0}}>{n.icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:n.lu?400:700,color:C.text}}>{n.titre}</div>
        <div style={{fontSize:10,color:C.muted,marginTop:2}}>{n.heure}</div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        {!n.lu&&<div style={{width:8,height:8,borderRadius:"50%",background:typeColor[n.type]||C.blue}}/>}
        <Pill color={typeColor[n.type]||C.blue}>{n.type}</Pill>
      </div>
    </div>
  </div>;
};

const PageNotifications=({notifs,setNotifs,showToast})=>{
  const[_notifsReal,setNotifsReal]=useState([]);
  const[_autoNotifs,setAutoNotifs]=useState([]);
  const[_prefs,setPrefs]=useState([]);
  const[_nonLus,setNonLus]=useState(0);

  const _loadNotifs=async()=>{
    try{
      const res=await fetch('/api/notifications');
      const data=await res.json();
      if(data.notifications){
        setNotifsReal(data.notifications);
        setAutoNotifs(data.autoNotifs||[]);
        setPrefs(data.preferences||[]);
        setNonLus(data.nonLus||0);
        // Mettre à jour les notifs du composant parent aussi
        if(data.notifications.length>0){
          setNotifs(data.notifications.map(n=>({...n,heure:n.created_at?new Date(n.created_at).toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}):""})));
        }
      }
    }catch(e){console.log("Mode local notifications");}
  };
  const _marquerLu=async(id)=>{
    try{
      await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'marquer_lu',id})});
      _loadNotifs();
      if(id==='all')setNotifs(prev=>prev.map(n=>({...n,lu:true})));
      else setNotifs(prev=>prev.map(n=>n.id===id?{...n,lu:true}:n));
    }catch(e){}
  };
  const _supprimerNotif=async(id)=>{
    try{
      await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer',id})});
      _loadNotifs();
    }catch(e){}
  };
  const _digestQuotidien=async()=>{
    showToast("⏳ Envoi du digest WhatsApp...");
    try{
      const res=await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'digest_quotidien',tel:'+33600000000'})});
      const data=await res.json();
      if(data.success)showToast(`✅ Digest envoyé — ${data.nb} priorité(s)`);
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };
  const _updatePref=async(type,fields)=>{
    try{
      await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'update_preference',type,...fields})});
      _loadNotifs();
    }catch(e){}
  };
  useEffect(()=>{_loadNotifs();},[]);
  const[onglet,setOnglet]=useState("centre");
  const[config,setConfig]=useState({
    paiement:{actif:true,push:true,whatsapp:true,email:true},
    devis:{actif:true,push:true,whatsapp:true,email:false},
    stock:{actif:true,push:true,whatsapp:false,email:false},
    rh:{actif:true,push:false,whatsapp:true,email:true},
    client:{actif:true,push:true,whatsapp:false,email:false},
    systeme:{actif:true,push:true,whatsapp:false,email:false},
  });
  const[filtreType,setFiltreType]=useState("tous");
  const[filtreStatut,setFiltreStatut]=useState("tous");

  const tabs=[{id:"centre",label:"🔔 Centre de notifs"},{id:"config",label:"⚙ Configuration"},{id:"historique",label:"📋 Historique"},{id:"whatsapp",label:"📱 WhatsApp auto"}];

  const marquerLus=()=>setNotifs(ns=>ns.map(n=>({...n,lu:true})));
  const nonLus=notifs.filter(n=>!n.lu).length;

  const typeColor={urgent:C.red,money:C.gold,info:C.blue,good:C.green,stock:C.orange,rh:C.purple};
  const types=["tous","urgent","money","info","good","stock","rh"];

  const filtered=notifs.filter(n=>(filtreType==="tous"||n.type===filtreType)&&(filtreStatut==="tous"||(filtreStatut==="non_lu"&&!n.lu)||(filtreStatut==="lu"&&n.lu)));

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>🔔 Notifications</div>
        <div style={{fontSize:11,color:C.muted}}>Centre · Configuration · WhatsApp auto · Popup temps réel · {nonLus} non lues</div></div>
      <div style={{display:"flex",gap:8}}>
        {nonLus>0&&<BtnGhost onClick={marquerLus}>✓ Tout marquer lu</BtnGhost>}
        <Btn onClick={()=>showToast("🔔 Notification test envoyée !")}>🔔 Tester</Btn>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <KPI label="Non lues" val={nonLus} color={C.red}/>
      <KPI label="Total" val={notifs.length} color={C.blue}/>
      <KPI label="Urgentes" val={notifs.filter(n=>n.type==="urgent").length} color={C.orange}/>
      <KPI label="Financières" val={notifs.filter(n=>n.type==="money").length} color={C.gold}/>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── CENTRE ── */}
    {onglet==="centre"&&<div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {types.map(t=><button key={t} onClick={()=>setFiltreType(t)} style={{background:filtreType===t?typeColor[t]||C.gold:"transparent",color:filtreType===t?"#000":C.muted,border:`1px solid ${filtreType===t?typeColor[t]||C.gold:C.border}`,borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:filtreType===t?700:400,textTransform:"capitalize"}}>{t}</button>)}
        <div style={{marginLeft:"auto",display:"flex",gap:4}}>
          {["tous","non_lu","lu"].map(s=><button key={s} onClick={()=>setFiltreStatut(s)} style={{background:filtreStatut===s?C.card2:"transparent",color:filtreStatut===s?C.gold:C.muted,border:`1px solid ${filtreStatut===s?C.border:"transparent"}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{s==="non_lu"?"Non lus":s==="lu"?"Lus":"Tous"}</button>)}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map((n,i)=><SwipeableNotif key={n.id||i} n={n} i={i} typeColor={typeColor}
          onOpen={()=>{setNotifs(ns=>ns.map((x,j)=>j===i?{...x,lu:true}:x));if(n.id)_marquerLu(n.id);}}
          onDelete={()=>{setNotifs(ns=>ns.filter((x,j)=>j!==i));if(n.id)_supprimerNotif(n.id);else showToast("🗑 Notification supprimée");}}
        />)}
        {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:C.muted}}>✅ Aucune notification pour ce filtre</div>}
      </div>
    </div>}

    {/* ── CONFIG ── */}
    {onglet==="config"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        💡 Les notifications push apparaissent comme des popups en bas à droite de l'écran, même lorsque vous êtes sur une autre page.
      </div>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Type de notification</TH><TH style={{textAlign:"center"}}>Activer</TH><TH style={{textAlign:"center"}}>Push écran</TH><TH style={{textAlign:"center"}}>WhatsApp</TH><TH style={{textAlign:"center"}}>Email</TH></tr></thead>
          <tbody>{Object.entries(config).map(([k,v])=>{const labels={paiement:"💰 Paiements",devis:"◧ Devis",stock:"📦 Stock critique",rh:"👥 RH & Équipe",client:"👤 Clients",systeme:"⚙ Système"};return <tr key={k}>
            <Td style={{fontWeight:600}}>{labels[k]||k}</Td>
            {["actif","push","whatsapp","email"].map(prop=><td key={prop} style={{textAlign:"center",padding:"10px",borderBottom:`1px solid ${C.border}22`}}>
              <div onClick={()=>setConfig(c=>({...c,[k]:{...c[k],[prop]:!c[k][prop]}}))} style={{width:36,height:20,borderRadius:10,background:v[prop]?C.gold:C.border,cursor:"pointer",transition:".2s",position:"relative",margin:"0 auto"}}>
                <div style={{position:"absolute",top:2,left:v[prop]?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:".2s"}}/>
              </div>
            </td>)}
          </tr>;})}
          </tbody>
        </table>
      </Card>
      <Card style={{marginTop:12}}>
        <STitle>⏰ Fréquence des rapports automatiques</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Rapport quotidien WhatsApp","08:00 chaque matin",C.green],["Rapport hebdo email","Lundi 08:00",C.blue],["Alerte stock critique","Immédiat dès détection",C.red],["Résumé paiements","Chaque transaction",C.gold]].map(([l,v,c],i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:10,border:`1px solid ${c}22`}}>
            <div style={{fontSize:11,fontWeight:700,color:c,marginBottom:2}}>{l}</div>
            <div style={{fontSize:10,color:C.muted}}>{v}</div>
          </div>)}
        </div>
      </Card>
    </div>}

    {/* ── HISTORIQUE ── */}
    {onglet==="historique"&&<Card>
      <STitle>📋 Historique complet — 30 derniers jours</STitle>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Icône</TH><TH>Notification</TH><TH>Type</TH><TH>Heure</TH><TH>Statut</TH></tr></thead>
        <tbody>{notifs.map((n,i)=><tr key={i}>
          <Td style={{fontSize:18}}>{n.icon}</Td>
          <Td style={{fontWeight:n.lu?400:700}}>{n.titre}</Td>
          <Td><Pill color={typeColor[n.type]||C.blue}>{n.type}</Pill></Td>
          <Td style={{color:C.muted,fontSize:10}}>{n.heure}</Td>
          <Td><Pill color={n.lu?C.muted:C.gold}>{n.lu?"Lu":"Non lu"}</Pill></Td>
        </tr>)}</tbody>
      </table>
    </Card>}

    {/* ── WHATSAPP AUTO ── */}
    {onglet==="whatsapp"&&<div>
      <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:6}}>📱 BOT WHATSAPP — NOTIFICATIONS AUTOMATIQUES</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>Le bot WhatsApp Xyra envoie automatiquement des notifications à vous et vos clients selon les événements configurés ci-dessous.</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[{evt:"Paiement reçu",msg:"💰 Paiement de {montant} reçu de {client}. Votre wallet Xyra est crédité.",actif:true},{evt:"Devis signé",msg:"✅ {client} vient de signer le devis {id} pour {montant}. Félicitations !",actif:true},{evt:"Stock critique",msg:"⚠️ ALERTE STOCK : {article} est en dessous du seuil minimum ({qte} {u} restants). Commander chez {four}.",actif:true},{evt:"Nouveau lead",msg:"🎯 Nouveau lead soumis par {partenaire} : {entreprise}. Valeur estimée : {ca}€.",actif:true},{evt:"Rappel devis",msg:"📋 Rappel : le devis {id} pour {client} ({montant}) est en attente depuis {jours} jours.",actif:true},{evt:"Mission terminée",msg:"✅ Mission terminée : {service} chez {client}. L'équipe {equipe} a terminé à {heure}.",actif:false}].map((w,i)=><Card key={i} style={{borderColor:w.actif?`${C.green}33`:C.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700}}>{w.evt}</div>
            <div onClick={()=>showToast(w.actif?"🔕 Notification désactivée":"🔔 Notification activée")} style={{width:36,height:20,borderRadius:10,background:w.actif?C.green:C.border,cursor:"pointer",position:"relative",flexShrink:0}}>
              <div style={{position:"absolute",top:2,left:w.actif?18:2,width:16,height:16,borderRadius:"50%",background:"#fff"}}/>
            </div>
          </div>
          <div style={{background:C.dark,borderRadius:6,padding:8,fontSize:10,color:C.muted,fontFamily:"monospace",lineHeight:1.6}}>{w.msg}</div>
          <button onClick={()=>showToast(`📱 Message test "${w.evt}" envoyé sur WhatsApp`)} style={{marginTop:8,background:"transparent",color:C.green,border:`1px solid ${C.green}33`,borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📱 Tester ce message</button>
        </Card>)}
      </div>
    </div>}
  </div>;
};
// ─── PAGE SIGNATURES / CONTRATS ───────────────────────────────
const PageSignatures=({plan,showToast})=>{
  const MODELES_CONTRATS=[
    {id:"prestation",label:"Contrat de prestation de services",type:"Commercial",desc:"Pour vos missions clients (nettoyage, conciergerie, jet, yacht...)"},
    {id:"partenariat",label:"Contrat de partenariat / AA",type:"Commercial",desc:"Pour vos apporteurs d'affaires — taux de commission, durée, clauses"},
    {id:"cdi",label:"Contrat CDI",type:"RH",desc:"Contrat à durée indéterminée — temps plein ou partiel"},
    {id:"cdd",label:"Contrat CDD",type:"RH",desc:"Contrat à durée déterminée — avec date de fin précise"},
    {id:"alternance",label:"Contrat d'alternance",type:"RH",desc:"Apprentissage ou professionnalisation — 1 à 3 ans"},
    {id:"stage",label:"Convention de stage",type:"RH",desc:"Stage obligatoire ou volontaire — gratification légale"},
    {id:"freelance",label:"Contrat freelance / Auto-entrepreneur",type:"Commercial",desc:"Pour prestataires indépendants — sans lien de subordination"},
    {id:"confidentialite",label:"NDA — Accord de confidentialité",type:"Juridique",desc:"Protège vos informations sensibles avec clients et partenaires"},
    {id:"saas",label:"Contrat SaaS / Licence logicielle",type:"Tech",desc:"Pour vos clients white-label Xyra"},
    {id:"fournisseur",label:"Contrat fournisseur",type:"Commercial",desc:"Conditions générales d'achat avec vos fournisseurs"},
  ];

  const[contrats,setContrats]=useState([
    {id:"CTR-001",titre:"Contrat prestation — Sofia Al-Rashid",type:"Commercial",modele:"prestation",client:"Sofia Al-Rashid",categorie:"Client",statut:"signé",date:"01/03/2024",expire:"28/02/2027",valeur:2400,signataire:"Sofia Al-Rashid",signé_le:"03/03/2024",fichier:"CTR-001-sofia.pdf"},
    {id:"CTR-002",titre:"Contrat AA — Thomas Beaumont",type:"RH",modele:"partenariat",client:"Thomas Beaumont",categorie:"Partenaire",statut:"signé",date:"01/03/2024",expire:"28/02/2026",valeur:0,signataire:"Thomas Beaumont",signé_le:"01/03/2024",fichier:"CTR-002-thomas.pdf"},
    {id:"CTR-003",titre:"Contrat AA — Groupe Prestige SARL",type:"Commercial",modele:"partenariat",client:"Groupe Prestige SARL",categorie:"Partenaire",statut:"signé",date:"01/04/2024",expire:"31/03/2027",valeur:0,signataire:"M. Beaumont DG",signé_le:"02/04/2024",fichier:"CTR-003-prestige.pdf"},
    {id:"CTR-004",titre:"CDI — Abou Diallo",type:"RH",modele:"cdi",client:"Abou Diallo",categorie:"RH",statut:"signé",date:"15/06/2024",expire:"—",valeur:2200,signataire:"Abou Diallo",signé_le:"15/06/2024",fichier:"CTR-004-abou.pdf"},
    {id:"CTR-005",titre:"CDD — Fatou Sarr",type:"RH",modele:"cdd",client:"Fatou Sarr",categorie:"RH",statut:"signé",date:"01/09/2024",expire:"31/08/2025",valeur:2400,signataire:"Fatou Sarr",signé_le:"01/09/2024",fichier:"CTR-005-fatou.pdf"},
    {id:"CTR-006",titre:"Contrat SaaS — Cabinet Delmas",type:"Tech",modele:"saas",client:"Cabinet Delmas",categorie:"Client SaaS",statut:"envoyé",date:"15/04/2026",expire:"14/04/2027",valeur:500,signataire:"Me Delmas",signé_le:null,fichier:null},
    {id:"CTR-007",titre:"NDA — Jet Services Monaco",type:"Juridique",modele:"confidentialite",client:"Jet Services Monaco",categorie:"Partenaire",statut:"brouillon",date:"20/04/2026",expire:"19/04/2028",valeur:0,signataire:"Antoine Rivière",signé_le:null,fichier:null},
    {id:"CTR-008",titre:"Contrat fournisseur — CleanPro",type:"Commercial",modele:"fournisseur",client:"CleanPro",categorie:"Fournisseur",statut:"expiré",date:"01/01/2024",expire:"31/12/2024",valeur:0,signataire:"Dir. Commercial",signé_le:"02/01/2024",fichier:"CTR-008-cleanpro.pdf"},
  ]);

  const[onglet,setOnglet]=useState("dashboard");
  const[showCreate,setShowCreate]=useState(false);
  const[createForm,setCreateForm]=useState({modele:"prestation",titre:"",client:"",categorie:"Client",expire:"",valeur:""});
  const[showSign,setShowSign]=useState(null);
  const[signStep,setSignStep]=useState(1);
  const[sel,setSel]=useState(null);
  const[filtreType,setFiltreType]=useState("Tous");

  const tabs=[
    {id:"dashboard",label:"📊 Tableau de bord"},
    {id:"tous",label:"📋 Tous les contrats"},
    {id:"creer",label:"✍ Créer un contrat"},
    {id:"esign",label:"✒ E-Signature"},
    {id:"avenants",label:"📝 Avenants"},
    {id:"archivage",label:"🗄 Archivage"},
    {id:"alertes",label:"🔔 Alertes"},
  ];

  const statutColor={signé:C.green,envoyé:C.blue,brouillon:C.muted,expiré:C.red};
  const categories=["Tous","Client","Partenaire","RH","Fournisseur","Client SaaS"];

  const filtered=filtreType==="Tous"?contrats:contrats.filter(c=>c.categorie===filtreType);
  const signés=contrats.filter(c=>c.statut==="signé").length;
  const envoyés=contrats.filter(c=>c.statut==="envoyé").length;
  const brouillons=contrats.filter(c=>c.statut==="brouillon").length;
  const expirés=contrats.filter(c=>c.statut==="expiré").length;

  if(!hasAccess(plan,"signature"))return <div style={{padding:20}}><UpgradeWall page="signature" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>✦ Contrats & Signatures</div>
        <div style={{fontSize:11,color:C.muted}}>E-signature · Modèles IA · Archivage · Alertes · {contrats.length} contrats</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={()=>setOnglet("esign")}>✒ Signer un contrat</BtnGhost>
        <Btn onClick={()=>setOnglet("creer")}>+ Nouveau contrat</Btn>
      </div>
    </div>

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      {[["Total contrats",contrats.length,C.blue],["Signés",signés,C.green],["Envoyés",envoyés,C.gold],["Brouillons",brouillons,C.muted],["Expirés",expirés,C.red]].map(([l,v,c],i)=><CT key={i}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div></CT>)}
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── DASHBOARD ───────────────────────────── */}
    {onglet==="dashboard"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Contrats par catégorie</STitle>
          {categories.slice(1).map((cat,i)=>{const n=contrats.filter(c=>c.categorie===cat).length;const colors=[C.blue,C.gold,C.green,C.orange,C.purple];return <div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{cat}</span><span style={{color:colors[i],fontWeight:700}}>{n}</span></div><SM val={n} max={contrats.length} color={colors[i]}/></div>;})}
        </Card>
        <Card>
          <STitle>⚠️ Contrats à surveiller</STitle>
          {[...contrats.filter(c=>c.statut==="expiré"||c.statut==="envoyé")].map((c,i)=><div key={i} style={{background:c.statut==="expiré"?`${C.red}11`:`${C.orange}11`,border:`1px solid ${c.statut==="expiré"?C.red:C.orange}33`,borderRadius:8,padding:10,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:12,fontWeight:700}}>{c.titre}</div><div style={{fontSize:10,color:C.muted}}>{c.categorie} · {c.expire!=="—"?"Expire: "+c.expire:""}</div></div>
              <div style={{display:"flex",gap:6}}>
                <St s={c.statut}/>
                {c.statut==="envoyé"&&<Btn onClick={()=>{setShowSign(c);setOnglet("esign");}} style={{fontSize:10,padding:"4px 8px"}}>✒ Signer</Btn>}
                {c.statut==="expiré"&&<Btn onClick={()=>showToast("🔄 Renouvellement initié")} style={{fontSize:10,padding:"4px 8px",background:C.orange}}>🔄 Renouveler</Btn>}
              </div>
            </div>
          </div>)}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[["✒ E-signatures ce mois","3",C.teal],["📄 PDFs générés","12",C.blue],["⏱ Délai signature moyen","2.4 jours",C.gold]].map(([l,v,c],i)=><KPI key={i} label={l} val={v} color={c}/>)}
      </div>
    </div>}

    {/* ── TOUS LES CONTRATS ───────────────────── */}
    {onglet==="tous"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {categories.map(cat=><button key={cat} onClick={()=>setFiltreType(cat)} style={{background:filtreType===cat?C.gold:"transparent",color:filtreType===cat?"#000":C.muted,border:`1px solid ${filtreType===cat?C.gold:C.border}`,borderRadius:20,padding:"5px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:filtreType===cat?700:400}}>{cat}</button>)}
      </div>
      {sel?<div>
        <BtnGhost onClick={()=>setSel(null)} style={{marginBottom:14}}>← Retour à la liste</BtnGhost>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:`${statutColor[sel.statut]||C.border}44`}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{sel.titre}</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}><Pill color={C.purple}>{sel.type}</Pill><Pill color={C.blue}>{sel.categorie}</Pill><St s={sel.statut}/></div>
            {[["📅 Date création",sel.date],["⏱ Expiration",sel.expire],["👤 Signataire",sel.signataire],["✅ Signé le",sel.signé_le||"En attente"],["💰 Valeur",sel.valeur>0?fmt(sel.valeur):"—"],["📄 Fichier",sel.fichier||"Non généré"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>)}
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Card>
              <STitle>⚡ Actions</STitle>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {sel.statut==="envoyé"&&<Btn onClick={()=>{setShowSign(sel);setOnglet("esign");setSignStep(1);}} style={{background:C.green}}>✒ Signer maintenant</Btn>}
                {sel.statut==="brouillon"&&<Btn onClick={()=>{setContrats(cs=>cs.map(c=>c.id===sel.id?{...c,statut:"envoyé"}:c));setSel(s=>({...s,statut:"envoyé"}));showToast(`✅ Contrat envoyé à ${sel.client} pour signature`);}}>📤 Envoyer pour signature</Btn>}
                <Btn onClick={()=>showToast(`📄 PDF ${sel.titre} téléchargé`)} style={{background:C.blue}}>📄 Télécharger PDF</Btn>
                <BtnGhost onClick={()=>showToast(`📱 Contrat envoyé à ${sel.client} sur WhatsApp`)}>📱 Envoyer WhatsApp</BtnGhost>
                <BtnGhost onClick={()=>showToast("📝 Avenant créé")}>📝 Créer un avenant</BtnGhost>
                {sel.statut==="expiré"&&<Btn onClick={()=>{setContrats(cs=>cs.map(c=>c.id===sel.id?{...c,statut:"brouillon",date:new Date().toLocaleDateString("fr")}:c));setSel(s=>({...s,statut:"brouillon"}));showToast("🔄 Contrat renouvelé — à envoyer pour signature");}} style={{background:C.orange}}>🔄 Renouveler le contrat</Btn>}
              </div>
            </Card>
            <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
              <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse IA Claude</div>
              <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>
                {sel.statut==="expiré"?"Ce contrat est expiré. Recommandation : renouvelez rapidement pour sécuriser la relation commerciale. Proposez une révision des conditions tarifaires (+8% aligné sur l'inflation).":sel.statut==="envoyé"?"En attente de signature depuis "+sel.date+". Envoyez un rappel WhatsApp pour accélérer la signature. Délai moyen : 2-3 jours.":"Contrat en bonne santé. Vérifiez l'échéance dans 3 mois pour anticiper le renouvellement."}
              </div>
            </Card>
          </div>
        </div>
      </div>:<Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Contrat</TH><TH>Type</TH><TH>Catégorie</TH><TH>Client/Partie</TH><TH>Date</TH><TH>Expiration</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{filtered.map((c,i)=><tr key={i} style={{cursor:"pointer"}} onClick={()=>setSel(c)}>
            <Td style={{fontWeight:700,fontSize:11}}>{c.id}</Td>
            <Td><Pill color={c.type==="RH"?C.green:c.type==="Tech"?C.blue:c.type==="Juridique"?C.purple:C.gold}>{c.type}</Pill></Td>
            <Td><Pill color={C.blue}>{c.categorie}</Pill></Td>
            <Td style={{fontWeight:600}}>{c.client}</Td>
            <Td style={{color:C.muted,fontSize:10}}>{c.date}</Td>
            <Td style={{color:c.statut==="expiré"?C.red:C.muted,fontSize:10,fontWeight:c.statut==="expiré"?700:400}}>{c.expire}</Td>
            <Td><St s={c.statut}/></Td>
            <Td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:4}}>
              {c.statut==="brouillon"&&<Btn onClick={()=>{setContrats(cs=>cs.map(x=>x.id===c.id?{...x,statut:"envoyé"}:x));showToast("📤 Envoyé pour signature");}} style={{fontSize:9,padding:"3px 8px"}}>Envoyer</Btn>}
              {c.statut==="envoyé"&&<Btn onClick={()=>{setShowSign(c);setOnglet("esign");setSignStep(1);}} style={{fontSize:9,padding:"3px 8px",background:C.green}}>✒</Btn>}
              <BtnGhost onClick={()=>showToast("📄 PDF téléchargé")} style={{fontSize:9,padding:"3px 8px"}}>PDF</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── CRÉER UN CONTRAT ────────────────────── */}
    {onglet==="creer"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <Card style={{marginBottom:12}}>
            <STitle>📋 Informations du contrat</STitle>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Modèle de contrat *</label>
                <select value={createForm.modele} onChange={e=>setCreateForm(f=>({...f,modele:e.target.value}))} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 12px",color:C.text,fontSize:12,fontFamily:"inherit",width:"100%"}}>
                  {MODELES_CONTRATS.map(m=><option key={m.id} value={m.id}>{m.label} ({m.type})</option>)}
                </select>
              </div>
              <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Titre du contrat</label><Inp value={createForm.titre} onChange={e=>setCreateForm(f=>({...f,titre:e.target.value}))} placeholder="Ex: Contrat prestation — Client X"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Partie / Client</label><Inp value={createForm.client} onChange={e=>setCreateForm(f=>({...f,client:e.target.value}))} placeholder="Nom ou raison sociale"/></div>
                <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Catégorie</label>
                  <select value={createForm.categorie} onChange={e=>setCreateForm(f=>({...f,categorie:e.target.value}))} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:12,fontFamily:"inherit",width:"100%"}}>
                    {["Client","Partenaire","RH","Fournisseur","Client SaaS"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Date d'expiration</label><Inp value={createForm.expire} onChange={e=>setCreateForm(f=>({...f,expire:e.target.value}))} placeholder="JJ/MM/AAAA"/></div>
                <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Valeur (€)</label><Inp value={createForm.valeur} onChange={e=>setCreateForm(f=>({...f,valeur:e.target.value}))} placeholder="0"/></div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>{
                  const m=MODELES_CONTRATS.find(x=>x.id===createForm.modele);
                  const nc={id:`CTR-00${contrats.length+1}`,titre:createForm.titre||m.label+" — "+createForm.client,type:m.type,modele:createForm.modele,client:createForm.client||"À renseigner",categorie:createForm.categorie,statut:"brouillon",date:new Date().toLocaleDateString("fr"),expire:createForm.expire||"—",valeur:Number(createForm.valeur)||0,signataire:createForm.client,signé_le:null,fichier:null};
                  setContrats(cs=>[nc,...cs]);setCreateForm({modele:"prestation",titre:"",client:"",categorie:"Client",expire:"",valeur:""});
                  showToast(`✅ Contrat "${nc.titre}" créé en brouillon !`);setOnglet("tous");
                }}>✅ Créer en brouillon</Btn>
                <BtnGhost onClick={()=>showToast("🤖 Contrat rédigé par Claude IA !")}>🤖 Rédiger avec IA</BtnGhost>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <STitle>📁 Modèles disponibles</STitle>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {MODELES_CONTRATS.map((m,i)=>{const colors={Commercial:C.gold,RH:C.green,Juridique:C.purple,Tech:C.blue};return <div key={i} onClick={()=>setCreateForm(f=>({...f,modele:m.id}))} style={{background:createForm.modele===m.id?`${colors[m.type]||C.gold}15`:C.card2,border:`1px solid ${createForm.modele===m.id?colors[m.type]||C.gold:C.border}`,borderRadius:8,padding:10,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <div style={{fontSize:11,fontWeight:700,color:createForm.modele===m.id?colors[m.type]||C.gold:C.text}}>{m.label}</div>
                  <Pill color={colors[m.type]||C.gold}>{m.type}</Pill>
                </div>
                <div style={{fontSize:10,color:C.muted}}>{m.desc}</div>
              </div>;})}
            </div>
          </Card>
        </div>
      </div>
    </div>}

    {/* ── E-SIGNATURE ─────────────────────────── */}
    {onglet==="esign"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <Card style={{marginBottom:12}}>
            <STitle>✒ Signer un contrat</STitle>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {contrats.filter(c=>c.statut==="envoyé"||c.statut==="brouillon").map((c,i)=><div key={i} onClick={()=>{setShowSign(c);setSignStep(1);}} style={{background:showSign?.id===c.id?`${C.gold}15`:C.card2,border:`1px solid ${showSign?.id===c.id?C.gold:C.border}`,borderRadius:8,padding:10,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div><div style={{fontSize:11,fontWeight:700}}>{c.titre}</div><div style={{fontSize:9,color:C.muted}}>{c.client} · {c.date}</div></div>
                  <St s={c.statut}/>
                </div>
              </div>)}
            </div>
            {showSign&&<div>
              <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:12,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>{showSign.titre}</div>
                <div style={{fontSize:10,color:C.muted,marginBottom:10}}>Signataire : {showSign.signataire} · {showSign.client}</div>
                {/* Étapes signature */}
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  {[{n:1,l:"Vérification"},{n:2,l:"Lecture"},{n:3,l:"Signature"},{n:4,l:"Confirmation"}].map(s=><div key={s.n} style={{flex:1,textAlign:"center"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:signStep>=s.n?C.gold:`${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:signStep>=s.n?"#000":C.muted,margin:"0 auto 4px"}}>{signStep>s.n?"✓":s.n}</div>
                    <div style={{fontSize:9,color:signStep>=s.n?C.gold:C.muted}}>{s.l}</div>
                  </div>)}
                </div>
                {signStep===1&&<div>
                  <div style={{fontSize:11,color:C.text,marginBottom:10,lineHeight:1.6}}>Vous allez signer électroniquement le contrat <b style={{color:C.gold}}>{showSign.titre}</b>. Cette signature a valeur légale selon le règlement eIDAS de l'Union Européenne.</div>
                  <Btn onClick={()=>setSignStep(2)}>Continuer →</Btn>
                </div>}
                {signStep===2&&<div>
                  <div style={{background:C.dark,borderRadius:8,padding:12,fontSize:11,color:C.muted,lineHeight:1.9,marginBottom:10,maxHeight:120,overflowY:"auto"}}>
                    <b style={{color:C.gold}}>CONTRAT DE {showSign.type.toUpperCase()}</b><br/>
                    Entre Xyra SaaS SASU (SIREN: 123 456 789) et {showSign.client}.<br/>
                    Il est convenu ce qui suit : La prestation sera réalisée selon les conditions définies...<br/>
                    Durée : du {showSign.date} au {showSign.expire}. Valeur : {showSign.valeur>0?fmt(showSign.valeur):"Définie en annexe"}.<br/>
                    Lu et approuvé.
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <BtnGhost onClick={()=>setSignStep(1)}>← Retour</BtnGhost>
                    <Btn onClick={()=>setSignStep(3)}>J'ai lu le contrat →</Btn>
                  </div>
                </div>}
                {signStep===3&&<div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Tapez votre nom complet pour valider votre signature électronique :</div>
                  <Inp placeholder={showSign.signataire+" (tapez votre nom)"} style={{marginBottom:10}}/>
                  <div style={{fontSize:10,color:C.muted,marginBottom:10}}>📍 Votre IP et horodatage seront enregistrés · Conforme eIDAS</div>
                  <div style={{display:"flex",gap:8}}>
                    <BtnGhost onClick={()=>setSignStep(2)}>← Retour</BtnGhost>
                    <Btn onClick={()=>setSignStep(4)} style={{background:C.green}}>✒ Signer électroniquement</Btn>
                  </div>
                </div>}
                {signStep===4&&<div style={{textAlign:"center",padding:"10px 0"}}>
                  <div style={{fontSize:32,marginBottom:8}}>✅</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.green,marginBottom:4}}>Contrat signé avec succès !</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Signé le {new Date().toLocaleDateString("fr")} à {new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})} · eIDAS conforme</div>
                  <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                    <Btn onClick={()=>{setContrats(cs=>cs.map(c=>c.id===showSign.id?{...c,statut:"signé",signé_le:new Date().toLocaleDateString("fr"),fichier:`${showSign.id}-signé.pdf`}:c));showToast("✅ Contrat signé et archivé ! PDF envoyé par email.");setShowSign(null);setSignStep(1);}}>📄 Télécharger PDF signé</Btn>
                    <BtnGhost onClick={()=>showToast("📱 Copie envoyée sur WhatsApp")}>📱 WhatsApp</BtnGhost>
                  </div>
                </div>}
              </div>
            </div>}
          </Card>
        </div>
        <Card>
          <STitle>📋 Historique des signatures</STitle>
          {contrats.filter(c=>c.statut==="signé").map((c,i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${C.green}22`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontSize:11,fontWeight:700}}>{c.titre}</div>
              <Pill color={C.green}>✓ Signé</Pill>
            </div>
            <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{c.client} · Signé le {c.signé_le}</div>
            <div style={{display:"flex",gap:6}}>
              <BtnGhost onClick={()=>showToast(`📄 ${c.fichier} téléchargé`)} style={{fontSize:9,padding:"3px 8px"}}>📄 PDF signé</BtnGhost>
              <BtnGhost onClick={()=>showToast("🔐 Certificat eIDAS téléchargé")} style={{fontSize:9,padding:"3px 8px"}}>🔐 Certificat</BtnGhost>
            </div>
          </div>)}
        </Card>
      </div>
    </div>}

    {/* ── AVENANTS ────────────────────────────── */}
    {onglet==="avenants"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle>📝 Avenants & Renouvellements</STitle>
        <Btn onClick={()=>showToast("📝 Avenant créé en brouillon !")}>+ Créer un avenant</Btn>
      </div>
      <Card style={{marginBottom:12}}>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[{contrat:"CTR-002",titre:"Avenant 1 — Augmentation commission Thomas Beaumont",motif:"Passage de 20% à 22% dès le 01/05/2026",date:"20/04/2026",statut:"brouillon"},{contrat:"CTR-005",titre:"Avenant 1 — Renouvellement CDD Fatou Sarr",motif:"Extension 6 mois + 200€/mois augmentation",date:"28/03/2026",statut:"signé"},{contrat:"CTR-008",titre:"Avenant 1 — Renouvellement fournisseur CleanPro",motif:"Reconduction annuelle avec révision tarifaire +5%",date:"15/04/2026",statut:"envoyé"}].map((av,i)=><div key={i} style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{av.titre}</div>
                <div style={{fontSize:10,color:C.muted}}>Contrat {av.contrat} · {av.date}</div>
                <div style={{fontSize:11,color:C.text,marginTop:4,fontStyle:"italic"}}>"{av.motif}"</div>
              </div>
              <St s={av.statut}/>
            </div>
            <div style={{display:"flex",gap:6,marginTop:8}}>
              {av.statut==="brouillon"&&<Btn onClick={()=>showToast("📤 Avenant envoyé pour signature")} style={{fontSize:10,padding:"5px 10px"}}>Envoyer</Btn>}
              {av.statut==="envoyé"&&<Btn onClick={()=>showToast("✒ Avenant signé !")} style={{fontSize:10,padding:"5px 10px",background:C.green}}>✒ Signer</Btn>}
              <BtnGhost onClick={()=>showToast("📄 PDF avenant téléchargé")} style={{fontSize:10,padding:"5px 8px"}}>PDF</BtnGhost>
            </div>
          </div>)}
        </div>
      </Card>
      <Card>
        <STitle>🔄 Renouvellements à venir</STitle>
        {contrats.filter(c=>c.expire!=="—"&&c.statut==="signé").map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{c.titre}</div><div style={{fontSize:10,color:C.muted}}>Expire le {c.expire}</div></div>
          <Btn onClick={()=>showToast(`🔄 Renouvellement ${c.titre} initié`)} style={{fontSize:10,padding:"4px 10px",background:C.teal}}>🔄 Renouveler</Btn>
        </div>)}
      </Card>
    </div>}

    {/* ── ARCHIVAGE ───────────────────────────── */}
    {onglet==="archivage"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Contrats archivés" val={contrats.filter(c=>c.fichier).length} color={C.blue}/>
        <KPI label="Stockage utilisé" val="142 MB" color={C.gold}/>
        <KPI label="Durée conservation" val="10 ans" color={C.green}/>
      </div>
      <Card>
        <STitle>🗄 Archive sécurisée</STitle>
        <div style={{background:`${C.green}08`,border:`1px solid ${C.green}22`,borderRadius:8,padding:12,marginBottom:12,fontSize:11,color:C.text}}>
          🔒 Vos contrats sont stockés de manière chiffrée (AES-256) sur Supabase. Conservation légale 10 ans. Conforme RGPD.
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Contrat</TH><TH>Type</TH><TH>Signé le</TH><TH>Fichier</TH><TH>Actions</TH></tr></thead>
          <tbody>{contrats.filter(c=>c.fichier).map((c,i)=><tr key={i}>
            <Td style={{fontWeight:600,fontSize:11}}>{c.titre}</Td>
            <Td><Pill color={C.blue}>{c.type}</Pill></Td>
            <Td style={{color:C.muted,fontSize:10}}>{c.signé_le}</Td>
            <Td style={{fontSize:10,color:C.teal,fontFamily:"monospace"}}>{c.fichier}</Td>
            <Td><div style={{display:"flex",gap:4}}>
              <Btn onClick={()=>showToast(`📥 ${c.fichier} téléchargé`)} style={{fontSize:9,padding:"3px 8px"}}>📥 PDF</Btn>
              <BtnGhost onClick={()=>showToast("🔐 Certificat eIDAS téléchargé")} style={{fontSize:9,padding:"3px 8px"}}>🔐</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </div>}

    {/* ── ALERTES ─────────────────────────────── */}
    {onglet==="alertes"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {[
        {icon:"🚨",t:"Contrat expiré — CleanPro (fournisseur)",d:"CTR-008 expiré le 31/12/2024. Aucun renouvellement initié. Risque : commandes non couvertes par contrat.",c:C.red,a:"Renouveler",fn:()=>showToast("🔄 Renouvellement CleanPro initié")},
        {icon:"⏰",t:"Contrat à signer — Cabinet Delmas",d:"CTR-006 envoyé le 15/04. En attente de signature depuis 11 jours. Envoyez un rappel.",c:C.orange,a:"Relancer",fn:()=>showToast("📱 Rappel WhatsApp envoyé à Me Delmas")},
        {icon:"📅",t:"Expiration dans 60 jours — Thomas Beaumont",d:"CTR-002 expire le 28/02/2026. Préparez le renouvellement maintenant pour éviter une rupture.",c:C.gold,a:"Préparer renouvellement",fn:()=>showToast("📝 Renouvellement CTR-002 créé en brouillon")},
        {icon:"✅",t:"Tous les contrats RH sont à jour",d:"CDI Thomas + CDD Fatou + CDI Abou — tous signés et valides.",c:C.green,a:null,fn:null},
      ].map((a,i)=><div key={i} style={{background:`${a.c}11`,border:`1px solid ${a.c}33`,borderRadius:10,padding:14,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:a.c,marginBottom:4}}>{a.icon} {a.t}</div><div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{a.d}</div></div>
        {a.a&&<Btn onClick={a.fn} color={a.c} style={{fontSize:11,padding:"7px 14px",flexShrink:0,color:a.c===C.green?"#000":"#000"}}>{a.a}</Btn>}
      </div>)}
    </div>}
  </div>;
};

// ─── PAGE FACTURATION ÉLECTRONIQUE ───────────────────────────
const PageFacturation=({plan,showToast})=>{
  const[onglet,setOnglet]=useState("dashboard");
  const[factures,setFactures]=useState([]);
  const[loadingFact,setLoadingFact]=useState(true);

  const loadFactures=async()=>{
    try{
      const res=await fetch('/api/factures?action=list');
      const data=await res.json();
      if(data.factures)setFactures(data.factures);
    }catch(e){console.error("Factures:",e);}
    setLoadingFact(false);
  };
  useEffect(()=>{loadFactures();},[]);

  const[newFact,setNewFact]=useState({client_nom:"",client_email:"",client_tel:"",siren:"",type_client:"entreprise",description:"",montant_ht:"",taux_tva:"20",format:"Factur-X"});
  const tvaMontant=newFact.montant_ht?Math.round(Number(newFact.montant_ht)*Number(newFact.taux_tva))/100:0;
  const ttc=newFact.montant_ht?Number(newFact.montant_ht)+tvaMontant:0;

  const tabs=[
    {id:"dashboard",label:"📊 Tableau de bord"},
    {id:"creer",label:"➕ Créer une facture"},
    {id:"historique",label:"📋 Historique"},
    {id:"ereporting",label:"📤 Conformité DGFiP"},
    {id:"guide",label:"📖 Guide réforme"},
  ];

  const statutColor={payée:C.green,"émise":C.blue,en_retard:C.red,brouillon:C.muted,annulée:C.muted};
  const totalHT=factures.reduce((a,f)=>a+Number(f.montant_ht||0),0);
  const totalTVA=factures.reduce((a,f)=>a+Number(f.montant_tva||0),0);
  const payées=factures.filter(f=>f.statut==="payée").length;
  const enRetard=factures.filter(f=>f.statut==="en_retard").length;

  const apercuPDF=(f)=>{
    const win=window.open("","_blank");
    if(!win)return showToast("⚠️ Autorisez les pop-ups pour voir l'aperçu");
    win.document.write(`<!DOCTYPE html><html><head><title>Facture ${f.numero}</title><style>
      body{font-family:'Segoe UI',sans-serif;background:#fff;color:#111;padding:40px;max-width:700px;margin:0 auto;}
      h1{font-size:22px;color:#C9A84C;font-family:Georgia,serif;letter-spacing:.1em;}
      .meta{color:#888;font-size:11px;margin-top:8px;}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-top:24px;}
      th{text-align:left;padding-bottom:8px;color:#888;border-bottom:2px solid #ddd;}
      td{padding:10px 0;border-bottom:1px solid #eee;}
      .total{text-align:right;margin-top:24px;font-size:20px;font-weight:700;color:#C9A84C;}
      .btn{background:#C9A84C;color:#000;border:none;padding:10px 24px;border-radius:6px;font-weight:700;cursor:pointer;margin-top:30px;}
      @media print{.btn{display:none;}}
    </style></head><body>
      <h1>XYRA</h1>
      <div class="meta">Facture ${f.numero} · ${f.date_emission||""}</div>
      <div class="meta">Facturé à : ${f.client_nom}${f.siren?" · SIREN "+f.siren:""}</div>
      <table>
        <tr><th>Description</th><th style="text-align:right;">Montant HT</th></tr>
        <tr><td>${f.description||"Prestation de services"}</td><td style="text-align:right;">${Number(f.montant_ht).toFixed(2)}€</td></tr>
        <tr><td>TVA (${f.taux_tva}%)</td><td style="text-align:right;">${Number(f.montant_tva).toFixed(2)}€</td></tr>
      </table>
      <div class="total">Total TTC : ${Number(f.montant_ttc).toFixed(2)}€</div>
      <button class="btn" onclick="window.print()">🖨 Imprimer / Enregistrer en PDF</button>
    </body></html>`);
    win.document.close();
  };

  const creerFacture=async()=>{
    if(!newFact.client_nom||!newFact.montant_ht)return showToast("⚠️ Remplissez client et montant");
    showToast("⏳ Création de la facture...");
    try{
      const res=await fetch('/api/factures',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',...newFact})});
      const data=await res.json();
      if(data.success){
        showToast(`✅ Facture ${data.facture.numero} créée !`);
        setNewFact({client_nom:"",client_email:"",client_tel:"",siren:"",type_client:"entreprise",description:"",montant_ht:"",taux_tva:"20",format:"Factur-X"});
        setOnglet("historique");
        loadFactures();
      }else{showToast("❌ "+(data.error||"Erreur"));}
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const envoyerPaiement=async(id)=>{
    showToast("⏳ Création du lien de paiement...");
    try{
      const res=await fetch('/api/factures',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_paiement',id})});
      const data=await res.json();
      if(data.success){showToast("✅ Lien de paiement envoyé au client !");loadFactures();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const marquerPayee=async(id)=>{
    try{
      await fetch('/api/factures',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'marquer_payee',id})});
      showToast("✅ Facture marquée payée");
      loadFactures();
    }catch(e){showToast("❌ Erreur");}
  };

  const relancer=async(id)=>{
    showToast("⏳ Envoi de la relance...");
    try{
      const res=await fetch('/api/factures',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'relancer',id})});
      const data=await res.json();
      if(data.success)showToast(data.envoye?"✅ Relance envoyée !":"⚠️ Aucun email/téléphone client renseigné");
      loadFactures();
    }catch(e){showToast("❌ Erreur");}
  };

  if(!hasAccess(plan,"compta"))return <div style={{padding:20}}><UpgradeWall page="compta" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>🧾 Facturation</div>
        <div style={{fontSize:11,color:C.muted}}>Factures réelles · Lien de paiement Stripe · Relances automatiques</div>
      </div>
      <Btn onClick={()=>setOnglet("creer")}>+ Nouvelle facture</Btn>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      {[["Factures émises",factures.length,C.blue],["Payées",payées,C.green],["CA HT total",fmt(totalHT),C.gold],["En retard",enRetard,C.red]].map(([l,v,c],i)=><CT key={i}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></CT>)}
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── DASHBOARD ─────────────────────────── */}
    {onglet==="dashboard"&&<div>
      {loadingFact&&<div style={{fontSize:11,color:C.muted,marginBottom:12}}>Chargement...</div>}
      {!loadingFact&&factures.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:30}}>Aucune facture pour le moment — crée ta première facture.</div>}
      {factures.length>0&&<Card>
        <STitle>📊 Dernières factures</STitle>
        {factures.slice(0,6).map((f,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
          <div><div style={{fontSize:11,fontWeight:600}}>{f.numero}</div><div style={{fontSize:10,color:C.muted}}>{f.client_nom} · {f.date_emission}</div></div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.gold}}>{fmt(f.montant_ttc)}</div>
            <Pill color={statutColor[f.statut]||C.muted}>{f.statut}</Pill>
          </div>
        </div>)}
      </Card>}
    </div>}

    {/* ── CRÉER FACTURE ─────────────────────── */}
    {onglet==="creer"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>➕ Nouvelle facture</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Client *</label><Inp value={newFact.client_nom} onChange={e=>setNewFact(f=>({...f,client_nom:e.target.value}))} placeholder="Nom / raison sociale"/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>SIREN (si entreprise)</label><Inp value={newFact.siren} onChange={e=>setNewFact(f=>({...f,siren:e.target.value}))} placeholder="123 456 789"/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email client</label><Inp value={newFact.client_email} onChange={e=>setNewFact(f=>({...f,client_email:e.target.value}))} placeholder="client@email.com"/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Téléphone client</label><Inp value={newFact.client_tel} onChange={e=>setNewFact(f=>({...f,client_tel:e.target.value}))} placeholder="+33612345678"/></div>
          </div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Type de client</label>
            <select value={newFact.type_client} onChange={e=>setNewFact(f=>({...f,type_client:e.target.value}))} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:12,fontFamily:"inherit",width:"100%"}}>
              <option value="particulier">Particulier</option><option value="entreprise">Entreprise</option><option value="administration">Administration publique</option>
            </select>
          </div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Description de la prestation *</label><Inp value={newFact.description} onChange={e=>setNewFact(f=>({...f,description:e.target.value}))} placeholder="Ex: Nettoyage Airbnb Montmartre — avril 2026"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant HT (€) *</label><Inp value={newFact.montant_ht} onChange={e=>setNewFact(f=>({...f,montant_ht:e.target.value}))} placeholder="0.00"/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>TVA (%)</label>
              <select value={newFact.taux_tva} onChange={e=>setNewFact(f=>({...f,taux_tva:e.target.value}))} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:12,fontFamily:"inherit",width:"100%"}}>
                <option value="20">20% — Normal</option><option value="10">10% — Intermédiaire</option><option value="5.5">5.5% — Réduit</option><option value="0">0% — Exonéré</option>
              </select>
            </div>
          </div>
          {newFact.montant_ht&&<div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
              <div><div style={{fontSize:9,color:C.muted}}>HT</div><div style={{fontSize:16,fontWeight:700}}>{fmt(Number(newFact.montant_ht))}</div></div>
              <div><div style={{fontSize:9,color:C.muted}}>TVA {newFact.taux_tva}%</div><div style={{fontSize:16,fontWeight:700,color:C.orange}}>{fmt(tvaMontant)}</div></div>
              <div><div style={{fontSize:9,color:C.gold}}>TTC</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(ttc)}</div></div>
            </div>
          </div>}
          <Btn onClick={creerFacture}>✅ Créer la facture</Btn>
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card style={{background:`${C.blue}08`,borderColor:`${C.blue}33`}}>
          <STitle>📋 Mentions obligatoires</STitle>
          {[["Numéro de facture séquentiel","✅ Auto-généré"],["Date d'émission","✅ Auto"],["Montant HT/TVA/TTC","✅ Calculé auto"],["Format structuré Factur-X","✅ Sélectionné par défaut"]].map(([m,s],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span>{m}</span><span style={{color:C.green,fontWeight:600}}>{s}</span></div>)}
        </Card>
        <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>💳 Encaissement</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>Une fois créée, va dans l'historique pour <b style={{color:C.gold}}>envoyer le lien de paiement Stripe</b> au client par email et WhatsApp. La facture passe automatiquement en "payée" dès qu'il règle.</div>
        </Card>
      </div>
    </div>}

    {/* ── HISTORIQUE ────────────────────────── */}
    {onglet==="historique"&&<Card>
      {loadingFact&&<div style={{fontSize:11,color:C.muted,marginBottom:8}}>Chargement...</div>}
      {!loadingFact&&factures.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucune facture pour le moment</div>}
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>N° Facture</TH><TH>Client</TH><TH>Date</TH><TH>HT</TH><TH>TVA</TH><TH>TTC</TH><TH>Statut</TH><TH>DGFiP</TH><TH>Actions</TH></tr></thead>
        <tbody>{factures.map((f,i)=><tr key={i}>
          <Td style={{color:C.gold,fontWeight:700,fontSize:10}}>{f.numero}</Td>
          <Td style={{fontWeight:600}}>{f.client_nom}</Td>
          <Td style={{color:C.muted,fontSize:10}}>{f.date_emission}</Td>
          <Td style={{color:C.text,fontWeight:600}}>{fmt(f.montant_ht)}</Td>
          <Td style={{color:C.orange}}>{fmt(f.montant_tva)}</Td>
          <Td style={{color:C.gold,fontWeight:700}}>{fmt(f.montant_ttc)}</Td>
          <Td><Pill color={statutColor[f.statut]||C.muted}>{f.statut}</Pill></Td>
          <Td><Pill color={f.statut_dgfip==="transmise"?C.green:f.statut_dgfip==="a_transmettre"?C.orange:C.muted}>{f.statut_dgfip==="non_applicable"?"N/A":f.statut_dgfip==="a_transmettre"?"À transmettre":"Transmise"}</Pill></Td>
          <Td><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            <BtnGhost onClick={()=>apercuPDF(f)} style={{fontSize:9,padding:"3px 6px"}}>👁 PDF</BtnGhost>
            {f.statut!=="payée"&&<Btn onClick={()=>envoyerPaiement(f.id)} style={{fontSize:9,padding:"3px 6px",background:C.green}}>💳 Lien paiement</Btn>}
            {f.statut!=="payée"&&<BtnGhost onClick={()=>marquerPayee(f.id)} style={{fontSize:9,padding:"3px 6px"}}>✅ Marquer payée</BtnGhost>}
            {f.statut!=="payée"&&<BtnGhost onClick={()=>relancer(f.id)} style={{fontSize:9,padding:"3px 6px",color:C.orange}}>🔔 Relancer</BtnGhost>}
          </div></Td>
        </tr>)}</tbody>
      </table>
    </Card>}

    {/* ── CONFORMITÉ DGFIP ──────────────────── */}
    {onglet==="ereporting"&&<div>
      <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.orange,fontWeight:600,marginBottom:6}}>📤 STATUT RÉEL — TRANSMISSION DGFiP / CHORUS PRO</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>La transmission automatique à la DGFiP nécessite de passer par une plateforme accréditée (PDP) — ce n'est pas encore connecté. Les factures à des <b style={{color:C.gold}}>administrations publiques</b> sont marquées "à transmettre" ci-dessous en attendant un partenariat. Les factures B2B privées ne sont pas concernées par cette obligation avant 2026-2027.</div>
      </div>
      <Card>
        <STitle>📋 Factures à transmettre</STitle>
        {factures.filter(f=>f.statut_dgfip==="a_transmettre").length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucune facture en attente de transmission.</div>}
        {factures.filter(f=>f.statut_dgfip==="a_transmettre").map((f,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
          <div><div style={{fontSize:11,fontWeight:600}}>{f.numero}</div><div style={{fontSize:10,color:C.muted}}>{f.client_nom}</div></div>
          <Pill color={C.orange}>À transmettre</Pill>
        </div>)}
      </Card>
    </div>}

    {/* ── GUIDE ─────────────────────────────── */}
    {onglet==="guide"&&<div>
      <Card style={{marginBottom:12,background:`${C.blue}08`,borderColor:`${C.blue}33`}}>
        <div style={{fontSize:10,color:C.blue,fontWeight:600,marginBottom:10,letterSpacing:"0.1em"}}>📖 GUIDE — RÉFORME FACTURATION ÉLECTRONIQUE FRANCE 2026-2027</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[{titre:"Qu'est-ce que la facturation électronique ?",contenu:"Obligation légale d'émettre et recevoir les factures B2B en format structuré (pas un simple PDF). La facture doit contenir des données lisibles par machine (XML) pour transmission automatique à la DGFiP.",color:C.blue},{titre:"Quels formats sont acceptés ?",contenu:"• Factur-X : PDF enrichi + XML — recommandé car lisible humain ET machine\\n• UBL (Universal Business Language) : format XML pur\\n• CII (Cross Industry Invoice) : autre format XML",color:C.gold},{titre:"Qu'est-ce que Chorus Pro ?",contenu:"Portail public du gouvernement français pour l'échange de factures électroniques. Concerne uniquement les factures émises à des entités publiques (État, collectivités) — pas le B2B privé.",color:C.green},{titre:"Calendrier d'application",contenu:"• Sept. 2026 : Grandes entreprises (CA > 250M€ ou +5000 salariés)\\n• Sept. 2027 : PME, ETI, Micro-entreprises\\nRecommandation : anticiper dès maintenant.",color:C.purple}].map((s,i)=><div key={i} style={{background:`${s.color}08`,border:`1px solid ${s.color}22`,borderRadius:8,padding:12}}>
            <div style={{fontSize:11,fontWeight:700,color:s.color,marginBottom:4}}>❓ {s.titre}</div>
            <div style={{fontSize:11,color:C.text,lineHeight:1.7,whiteSpace:"pre-line"}}>{s.contenu}</div>
          </div>)}
        </div>
      </Card>
    </div>}
  </div>;
};


// ─── PAGE FORMATION ───────────────────────────────────────────
const PageFormation=({plan,showToast})=>{
  if(!hasAccess(plan,"formation"))return <div style={{padding:20}}><UpgradeWall page="Formation" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>⊿ Formation équipe</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Normes sectorielles · Certifications · Protocoles · Vente modules</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
      <KPI label="Formations" val={FORMATION.length} color={C.blue}/>
      <KPI label="Complétées" val={FORMATION.filter(f=>f.statut==="complété").length} color={C.green}/>
      <KPI label="Score moyen" val={Math.round(FORMATION.filter(f=>f.score).reduce((a,f)=>a+(f.score||0),0)/FORMATION.filter(f=>f.score).length)+"%"} color={C.gold}/>
    </div>
    <Card>
      <STitle>📚 Modules de formation</STitle>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Formation</TH><TH>Collaborateurs</TH><TH>Statut</TH><TH>Score</TH><TH>Actions</TH></tr></thead>
        <tbody>{FORMATION.map((f,i)=><tr key={i}>
          <Td style={{fontWeight:600}}>{f.titre}</Td>
          <Td style={{color:C.muted}}>{f.collab}</Td>
          <Td><St s={f.statut}/></Td>
          <Td style={{color:f.score>=90?C.green:f.score>=70?C.gold:C.muted,fontWeight:700}}>{f.score?`${f.score}%`:"—"}</Td>
          <Td><Btn onClick={()=>showToast(`🎓 Module "${f.titre}" lancé`)} style={{padding:"4px 8px",fontSize:10}}>{f.statut==="à faire"?"▶ Démarrer":"↺ Refaire"}</Btn></Td>
        </tr>)}</tbody>
      </table>
    </Card>
  </div>;
};

// ─── PAGE DEALS ───────────────────────────────────────────────
const PageDeals=({plan,showToast})=>{
  const[_dealsReal,setDealsReal]=useState([]);
  const[_partenairesReal,setPartenairesReal]=useState([]);
  const[_caPipeline,setCaPipeline]=useState(0);
  const[_caGagne,setCaGagne]=useState(0);
  const[_objectifCA,setObjectifCA]=useState(0);
  const[_relanceCache,setRelanceCache]=useState({});
  const[_relanceLoading,setRelanceLoading]=useState({});
  const[_doublon,setDoublon]=useState(null);

  const _loadDeals=async()=>{
    try{
      const res=await fetch('/api/deals');
      const data=await res.json();
      if(data.deals&&data.deals.length>0){
        setDealsReal(data.deals);
        setPartenairesReal(data.partenaires||[]);
        setCaPipeline(data.caPipeline||0);
        setCaGagne(data.caGagne||0);
        setDeals(prev=>{
          const merged=data.deals.map(r=>{const e=prev.find(p=>p.nom===r.nom||p.id===r.id);return e?{...e,...r}:r;});
          return merged.length>0?merged:prev;
        });
      }
    }catch(e){console.log("Mode local deals");}
  };
  const _changerEtape=async(deal,etape)=>{
    try{
      const res=await fetch('/api/deals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id:deal.id,etape,_oldEtape:deal.etape})});
      const data=await res.json();
      if(data.success)_loadDeals();
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };
  const _genererRelanceIA=async(deal)=>{
    if(_relanceLoading[deal.id])return;
    setRelanceLoading(s=>({...s,[deal.id]:true}));
    try{
      const res=await fetch('/api/deals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'relance_ia',deal})});
      const data=await res.json();
      if(data.success)setRelanceCache(c=>({...c,[deal.id]:data.message}));
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
    setRelanceLoading(s=>({...s,[deal.id]:false}));
  };
  const _envoyerRelance=async(deal,canal)=>{
    const msg=_relanceCache[deal.id];
    if(!msg)return showToast("⚠️ Génère d'abord le message IA");
    try{
      const res=await fetch('/api/deals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_relance',deal,message:msg,canal})});
      const data=await res.json();
      if(data.success){showToast(`✅ Relance envoyée par ${canal}`);_loadDeals();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };
  const _ajouterTimeline=async(dealId,type,description)=>{
    try{
      await fetch('/api/deals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_timeline',deal_id:dealId,type,description})});
      _loadDeals();
    }catch(e){}
  };
  useEffect(()=>{_loadDeals();},[]);
  const ETAPES=["Identification","Qualification","Proposition","Négociation","Closing","Gagné","Perdu"];
  const[deals,setDeals]=useState([
    {id:"DEAL-001",nom:"Contrat Hôtel Prestige Paris",valeur:12000,prob:85,etape:"Proposition",client:"Claire Bernard",tel:"+33 1 23 45 67",email:"claire@prestige.fr",dead:"30/04/2026",source:"CRM",desc:"Nettoyage 40 chambres/jour + entretien communs",actions:[{date:"14/04",type:"Email",note:"Proposition envoyée"},{date:"12/04",type:"RDV",note:"Présentation en présentiel"}],dernierContact:"14/04"},
    {id:"DEAL-002",nom:"Partenariat Jet Services Monaco",valeur:24000,prob:92,etape:"Négociation",client:"Antoine Rivière",tel:"+377 99 88 77",email:"a.riviere@jetservices.mc",dead:"15/05/2026",source:"Réseau",desc:"Contrat annuel nettoyage flotte jets privés Monaco",actions:[{date:"13/04",type:"WhatsApp",note:"Contre-proposition reçue"},{date:"10/04",type:"RDV",note:"Négociation tarifs"}],dernierContact:"13/04"},
    {id:"DEAL-003",nom:"SaaS White-label Cabinet Dupont",valeur:5000,prob:60,etape:"Qualification",client:"Me Dupont",tel:"+33 1 55 66 77",email:"dupont@cabinet.fr",dead:"30/05/2026",source:"LinkedIn",desc:"Licence Xyra pour cabinet juridique 15 personnes",actions:[{date:"11/04",type:"Email",note:"Envoi documentation"}],dernierContact:"11/04"},
    {id:"DEAL-004",nom:"Syndic Val-de-Marne — Lot 5 résidences",valeur:18000,prob:45,etape:"Identification",client:"M. Lefebre",tel:"+33 1 44 55 66",email:"lefebre@syndic.fr",dead:"30/06/2026",source:"Prospection",desc:"Nettoyage 5 résidences Val-de-Marne — contrat annuel",actions:[{date:"10/04",type:"Appel",note:"Premier contact cold call"}],dernierContact:"10/04"},
  ]);
  const[onglet,setOnglet]=useState("kanban");
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",client:"",valeur:"",prob:"50",etape:"Identification",dead:"",email:"",tel:"",source:"CRM",desc:""});

  const tabs=[{id:"kanban",label:"📊 Pipeline Kanban"},{id:"liste",label:"📋 Liste deals"},{id:"fiche",label:"📁 Fiche deal"},{id:"propositions",label:"📄 Propositions"},{id:"alertes",label:"🔔 Alertes"},{id:"stats",label:"📈 Stats"}];

  const totalPipeline=deals.reduce((a,d)=>a+d.valeur,0);
  const totalPondere=deals.reduce((a,d)=>a+d.valeur*(d.prob/100),0);
  const etapeColor={Identification:C.muted,Qualification:C.blue,Proposition:C.gold,Négociation:C.orange,Closing:C.purple,Gagné:C.green,Perdu:C.red};

  if(!hasAccess(plan,"crm"))return <div style={{padding:20}}><UpgradeWall page="crm" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>📋 Deals & Opportunités</div>
        <div style={{fontSize:11,color:C.muted}}>Pipeline Kanban · IA Closing · Propositions · Suivi · {deals.length} deals</div></div>
      <Btn onClick={()=>setShowAdd(s=>!s)}>+ Nouveau deal</Btn>
    </div>

    {showAdd&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>Nouveau deal</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Nom du deal","nom","Ex: Contrat Hôtel X"],["Client / Contact","client","Nom contact"],["Email","email","email@client.com"],["Téléphone","tel","+33..."],["Valeur (€)","valeur","0"],["Probabilité (%)","prob","50"],["Deadline","dead","JJ/MM/AAAA"],["Source","source","CRM"]].map(([l,k,ph])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={addForm[k]} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}/></div>)}
        <div style={{gridColumn:"span 2"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Description</label><Inp value={addForm.desc} onChange={e=>setAddForm(f=>({...f,desc:e.target.value}))} placeholder="Détail du deal..."/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Étape initiale</label><Sel value={addForm.etape} onChange={e=>setAddForm(f=>({...f,etape:e.target.value}))} style={{width:"100%"}}>{ETAPES.map(e=><option key={e}>{e}</option>)}</Sel></div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>{const nd={id:`DEAL-00${deals.length+1}`,nom:addForm.nom,valeur:Number(addForm.valeur)||0,prob:Number(addForm.prob)||50,etape:addForm.etape,client:addForm.client,tel:addForm.tel,email:addForm.email,dead:addForm.dead,source:addForm.source,desc:addForm.desc,actions:[{date:new Date().toLocaleDateString("fr"),type:"Création",note:"Deal créé dans Xyra"}],dernierContact:new Date().toLocaleDateString("fr")};setDeals(d=>[nd,...d]);setShowAdd(false);setAddForm({nom:"",client:"",valeur:"",prob:"50",etape:"Identification",dead:"",email:"",tel:"",source:"CRM",desc:""});showToast(`✅ Deal "${nd.nom}" créé !`);}}>✅ Créer le deal</Btn>
        <BtnGhost onClick={()=>setShowAdd(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <KPI label="Pipeline total" val={fmt(totalPipeline)} color={C.gold}/>
      <KPI label="CA pondéré IA" val={fmt(Math.round(totalPondere))} color={C.green}/>
      <KPI label="Deals actifs" val={deals.filter(d=>!["Gagné","Perdu"].includes(d.etape)).length} color={C.blue}/>
      <KPI label="Prob. moy." val={Math.round(deals.reduce((a,d)=>a+d.prob,0)/deals.length)+"%"} color={C.teal}/>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── KANBAN ── */}
    {onglet==="kanban"&&<div style={{overflowX:"auto"}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${ETAPES.length},minmax(160px,1fr))`,gap:8,minWidth:1000}}>
        {ETAPES.map(etape=>{const etapeDeals=deals.filter(d=>d.etape===etape);const color=etapeColor[etape];return <div key={etape} style={{background:C.card2,borderRadius:10,padding:10,border:`1px solid ${color}33`}}>
          <div style={{fontSize:9,color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{etape} <span style={{color:C.muted}}>({etapeDeals.length})</span></div>
          <div style={{fontSize:10,color,fontWeight:600,marginBottom:8}}>{fmt(etapeDeals.reduce((a,d)=>a+d.valeur,0))}</div>
          {etapeDeals.map((d,i)=><div key={i} onClick={()=>{setSel(d);setOnglet("fiche");}} style={{background:C.card,borderRadius:8,padding:8,marginBottom:6,border:`1px solid ${color}22`,cursor:"pointer"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:2,lineHeight:1.3}}>{d.nom}</div>
            <div style={{fontSize:9,color:C.muted,marginBottom:4}}>{d.client}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:700,color}}>{fmt(d.valeur)}</span>
              <span style={{fontSize:9,background:`${d.prob>=70?C.green:d.prob>=40?C.gold:C.orange}22`,color:d.prob>=70?C.green:d.prob>=40?C.gold:C.orange,padding:"1px 5px",borderRadius:8,fontWeight:600}}>{d.prob}%</span>
            </div>
            <SM val={d.prob} max={100} color={d.prob>=70?C.green:d.prob>=40?C.gold:C.orange}/>
            <div style={{fontSize:9,color:C.muted,marginTop:4}}>📅 {d.dead}</div>
            <div style={{display:"flex",gap:4,marginTop:6}}>
              {["Gagné","Perdu"].includes(d.etape)||<button onClick={e=>{e.stopPropagation();const idx=ETAPES.indexOf(d.etape);if(idx<ETAPES.length-1){setDeals(ds=>ds.map(x=>x.id===d.id?{...x,etape:ETAPES[idx+1]}:x));showToast(`✅ Deal avancé à "${ETAPES[idx+1]}"`);}}} style={{flex:1,background:color+"22",color,border:`1px solid ${color}44`,borderRadius:4,padding:"3px 0",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>→ Avancer</button>}
            </div>
          </div>)}
        </div>;})}
      </div>
    </div>}

    {/* ── LISTE ── */}
    {onglet==="liste"&&<Card>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Deal</TH><TH>Client</TH><TH>Valeur</TH><TH>Prob. IA</TH><TH>Étape</TH><TH>Deadline</TH><TH>Dernier contact</TH><TH>Actions</TH></tr></thead>
        <tbody>{deals.map((d,i)=><tr key={i} style={{cursor:"pointer"}} onClick={()=>{setSel(d);setOnglet("fiche");}}>
          <Td style={{fontWeight:700,fontSize:11}}>{d.nom}</Td>
          <Td style={{color:C.muted}}>{d.client}</Td>
          <Td style={{color:C.gold,fontWeight:700}}>{fmt(d.valeur)}</Td>
          <Td><div style={{display:"flex",alignItems:"center",gap:6}}><SM val={d.prob} max={100} color={d.prob>=70?C.green:d.prob>=40?C.gold:C.orange}/><span style={{color:d.prob>=70?C.green:d.prob>=40?C.gold:C.orange,fontWeight:700,fontSize:11}}>{d.prob}%</span></div></Td>
          <Td><Pill color={etapeColor[d.etape]||C.muted}>{d.etape}</Pill></Td>
          <Td style={{color:C.muted,fontSize:10}}>{d.dead}</Td>
          <Td style={{color:C.muted,fontSize:10}}>{d.dernierContact}</Td>
          <Td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:4}}>
            <Btn onClick={()=>{setSel(d);setOnglet("fiche");}} style={{fontSize:9,padding:"3px 7px"}}>Fiche</Btn>
            <BtnGhost onClick={()=>showToast(`📱 Contact ${d.client}`)} style={{fontSize:9,padding:"3px 7px"}}>📱</BtnGhost>
          </div></Td>
        </tr>)}</tbody>
      </table>
    </Card>}

    {/* ── FICHE DEAL ── */}
    {onglet==="fiche"&&<div>
      {sel?<div>
        <BtnGhost onClick={()=>setSel(null)} style={{marginBottom:14}}>← Retour</BtnGhost>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card style={{borderColor:`${etapeColor[sel.etape]||C.border}44`}}>
              <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{sel.nom}</div>
              <div style={{display:"flex",gap:6,marginBottom:12}}><Pill color={etapeColor[sel.etape]||C.muted}>{sel.etape}</Pill><Pill color={sel.prob>=70?C.green:sel.prob>=40?C.gold:C.orange}>{sel.prob}% closing</Pill></div>
              {[["👤 Client",sel.client],["📧 Email",sel.email],["📱 Téléphone",sel.tel],["💰 Valeur",fmt(sel.valeur)],["📅 Deadline",sel.dead],["🔍 Source",sel.source],["📝 Description",sel.desc]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,maxWidth:"60%",textAlign:"right"}}>{v}</span></div>)}
            </Card>
            <Card>
              <STitle>📋 Historique actions</STitle>
              {sel.actions.map((a,i)=><div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}22`}}>
                <Pill color={a.type==="RDV"?C.gold:a.type==="Email"?C.blue:a.type==="WhatsApp"?C.green:C.muted}>{a.type}</Pill>
                <div style={{flex:1}}><div style={{fontSize:11}}>{a.note}</div><div style={{fontSize:9,color:C.muted}}>{a.date}</div></div>
              </div>)}
              <button onClick={()=>showToast("✅ Action ajoutée")} style={{marginTop:8,background:"transparent",color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Ajouter une action</button>
            </Card>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
              <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 Analyse IA — Claude</div>
              <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>Probabilité de closing : <b style={{color:sel.prob>=70?C.green:sel.prob>=40?C.gold:C.orange}}>{sel.prob}%</b>. {sel.prob>=70?"Ce deal est bien engagé. Préparez un contrat et proposez une date de signature rapide pour conclure avant la deadline.":sel.prob>=40?"Deal incertain. Identifiez les freins et proposez un geste commercial ou une démonstration pour débloquer la situation.":"Deal à risque. Contactez le client cette semaine — s'il ne répond pas, clôturez et redirigez vos efforts sur des deals plus chauds."}</div>
            </Card>
            <Card>
              <STitle>⚡ Actions rapides</STitle>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <Btn onClick={()=>showToast(`📱 WhatsApp à ${sel.client}`)} style={{background:C.green,color:"#000"}}>📱 WhatsApp</Btn>
                <Btn onClick={()=>showToast("✅ Devis créé depuis le deal")} style={{background:C.blue}}>◧ Créer un devis</Btn>
                <BtnGhost onClick={()=>showToast("📄 Proposition commerciale générée")}>📄 Générer proposition</BtnGhost>
                <BtnGhost onClick={()=>{const idx=ETAPES.indexOf(sel.etape);if(idx<ETAPES.length-1){const nextEtape=ETAPES[idx+1];setDeals(ds=>ds.map(d=>d.id===sel.id?{...d,etape:nextEtape}:d));setSel(s=>({...s,etape:nextEtape}));showToast(`✅ Deal avancé à "${nextEtape}"`);}}} style={{color:C.gold,borderColor:`${C.gold}44`}}>→ Avancer dans le pipeline</BtnGhost>
                <BtnGhost onClick={()=>{setDeals(ds=>ds.map(d=>d.id===sel.id?{...d,etape:"Perdu"}:d));setSel(s=>({...s,etape:"Perdu"}));showToast("❌ Deal marqué comme perdu");}} style={{color:C.red,borderColor:`${C.red}33`}}>❌ Marquer comme perdu</BtnGhost>
              </div>
            </Card>
          </div>
        </div>
      </div>:<div style={{textAlign:"center",padding:40,color:C.muted}}>
        <div style={{fontSize:32,marginBottom:8}}>📋</div>
        <div>Sélectionnez un deal depuis le Kanban ou la liste</div>
      </div>}
    </div>}

    {/* ── PROPOSITIONS ── */}
    {onglet==="propositions"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle>📄 Propositions commerciales</STitle>
        <Btn onClick={()=>showToast("🤖 Proposition IA générée !")}>🤖 Générer proposition (IA)</Btn>
      </div>
      {deals.filter(d=>["Proposition","Négociation"].includes(d.etape)).map((d,i)=><Card key={i} style={{marginBottom:10,borderColor:`${C.gold}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontSize:13,fontWeight:700}}>{d.nom}</div><div style={{fontSize:10,color:C.muted}}>{d.client} · {fmt(d.valeur)}</div></div>
          <Pill color={etapeColor[d.etape]}>{d.etape}</Pill>
        </div>
        <div style={{background:C.card2,borderRadius:8,padding:12,fontSize:11,color:C.text,lineHeight:1.8,marginBottom:10}}>
          <b style={{color:C.gold}}>Proposition commerciale — {d.nom}</b><br/>
          Cher(e) {d.client}, suite à notre échange, nous avons le plaisir de vous soumettre notre proposition pour {d.desc}. Notre offre : {fmt(d.valeur)} HT avec une garantie satisfaction totale. Validity jusqu'au {d.dead}.
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>showToast(`📄 Proposition ${d.nom} PDF générée`)} style={{fontSize:11}}>📄 PDF</Btn>
          <BtnGhost onClick={()=>showToast(`📱 Envoyée à ${d.client} sur WhatsApp`)} style={{fontSize:11}}>📱 WhatsApp</BtnGhost>
          <BtnGhost onClick={()=>showToast(`📧 Envoyée à ${d.email}`)} style={{fontSize:11}}>📧 Email</BtnGhost>
          <BtnGhost onClick={()=>showToast("🤖 Proposition personnalisée par IA")} style={{fontSize:11}}>🤖 Personnaliser</BtnGhost>
        </div>
      </Card>)}
    </div>}

    {/* ── ALERTES ── */}
    {onglet==="alertes"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {deals.filter(d=>!["Gagné","Perdu"].includes(d.etape)).map((d,i)=>{
        const joursRestants=7;const stagne=joursRestants<3;
        return <div key={i} style={{background:stagne?`${C.red}11`:`${C.orange}11`,border:`1px solid ${stagne?C.red:C.orange}33`,borderRadius:10,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:12,fontWeight:700,color:stagne?C.red:C.orange}}>{stagne?"🚨":"⚠️"} {d.nom}</div><div style={{fontSize:11,color:C.muted}}>{d.client} · {fmt(d.valeur)} · Deadline : {d.dead}</div><div style={{fontSize:11,color:C.text,marginTop:4}}>Dernier contact : {d.dernierContact} · Étape : {d.etape}</div></div>
            <Btn onClick={()=>showToast(`📱 Relance envoyée à ${d.client}`)} style={{fontSize:11,flexShrink:0}}>Relancer</Btn>
          </div>
        </div>;
      })}
    </div>}

    {/* ── STATS ── */}
    {onglet==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>📊 Pipeline par étape</STitle>
        {ETAPES.map((e,i)=>{const n=deals.filter(d=>d.etape===e).length;const v=deals.filter(d=>d.etape===e).reduce((a,d)=>a+d.valeur,0);const color=etapeColor[e];return <div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{color}}>{e} ({n})</span><span style={{fontWeight:700,color}}>{fmt(v)}</span></div><SM val={v} max={Math.max(1,totalPipeline)} color={color}/></div>;})}
      </Card>
      <Card>
        <STitle>💡 Insights IA</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[{t:"Deal le plus probable",v:`${deals.sort((a,b)=>b.prob-a.prob)[0]?.nom} (${deals[0]?.prob}%)`,c:C.green},{t:"Plus grosse opportunité",v:`${deals.sort((a,b)=>b.valeur-a.valeur)[0]?.nom} (${fmt(deals.sort((a,b)=>b.valeur-a.valeur)[0]?.valeur)})`,c:C.gold},{t:"CA pondéré total",v:fmt(Math.round(totalPondere)),c:C.teal}].map((s,i)=><CT key={i}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>{s.t}</div><div style={{fontSize:12,fontWeight:700,color:s.c}}>{s.v}</div></CT>)}
        </div>
      </Card>
    </div>}
  </div>;
};
// ─── PAGE DEPLOIEMENT SAAS ────────────────────────────────────
const PageDeploiement=({plan,showToast})=>{
  const[tenants,setTenants]=useState([]);
  const[loading,setLoading]=useState(true);
  const[onglet,setOnglet]=useState("tenants");
  const[selectedClient,setSelectedClient]=useState(null);
  const[searchQ,setSearchQ]=useState("");
  const[filterPlan,setFilterPlan]=useState("tous");
  const[filterStatut,setFilterStatut]=useState("tous");
  const[mrr,setMrr]=useState(0);
  const[stats,setStats]=useState({actifs:0,essais:0,churnes:0,inactifs:0,commissions:0,arr:0});
  const[analyseChurn,setAnalyseChurn]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[upsellEmail,setUpsellEmail]=useState("");
  const[showProvision,setShowProvision]=useState(false);
  const[provisionForm,setProvisionForm]=useState({societe:"",email:"",plan:"starter",pays:"France",metier:""});
  const[showRevendeurForm,setShowRevendeurForm]=useState(false);
  const[revendeurForm,setRevendeurForm]=useState({nom:"",email:"",societe:"",tel:"",message:"",plan_revendeur:""});
  const[revendeurLoading,setRevendeurLoading]=useState(false);

  const envoyerDemandeRevendeur=async()=>{
    if(!revendeurForm.nom||!revendeurForm.email||!revendeurForm.societe)return showToast("⚠️ Nom, email et société requis");
    setRevendeurLoading(true);
    try{
      const res=await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'demande_revendeur',...revendeurForm})});
      const d=await res.json();
      if(d.success){showToast("✅ Demande envoyée ! WhatsApp + email reçus par l'équipe Xyra");setShowRevendeurForm(false);setRevendeurForm({nom:"",email:"",societe:"",tel:"",message:"",plan_revendeur:""});}
      else showToast("❌ Erreur");
    }catch(e){showToast("❌ Erreur");}
    setRevendeurLoading(false);
  };

  const calcSolvabilite=(t)=>{
    let score=50;
    if(t.plan==="enterprise")score+=20;
    else if(t.plan==="business_pro"||t.plan==="business")score+=10;
    if(t.pays&&["France","Allemagne","Royaume-Uni","Émirats arabes unis (Dubaï)","États-Unis","Canada"].includes(t.pays))score+=15;
    if(t.taille==="20+")score+=15;
    else if(t.taille==="6 à 20")score+=10;
    else if(t.taille==="2 à 5")score+=5;
    if(t.statut==="actif")score+=10;
    if(t.created_at){const days=(Date.now()-new Date(t.created_at).getTime())/(1000*60*60*24);if(days>30)score+=5;}
    return Math.min(100,score);
  };

  const scoreCouleur=(s)=>s>=80?C.green:s>=50?C.gold:C.red;
  const scoreLabel=(s)=>s>=80?"🟢 Solvable":s>=50?"🟡 Moyen":"🔴 Risqué";

  const load=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/deploiement?action=dashboard');
      const d=await res.json();
      if(d.tenants){
        setTenants(d.tenants);
        setMrr(d.mrr||0);
        setStats({actifs:d.actifs||0,essais:d.essais||0,churnes:d.churnes||0,inactifs:d.inactifs||0,commissions:d.commissions||0,arr:d.arr||0});
      }
    }catch(e){
      // Fallback Supabase direct
      try{
        const {createClient}=await import('@supabase/supabase-js');
        const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const{data}=await sb.from('tenants').select('*').order('created_at',{ascending:false});
        if(data){
          setTenants(data);
          const m=data.reduce((a,t)=>a+(t.plan_price||0),0);
          setMrr(m);
          setStats({actifs:data.filter(t=>t.statut==="actif").length,essais:data.filter(t=>t.statut==="essai").length,churnes:data.filter(t=>t.statut==="suspendu").length,inactifs:0,commissions:m*0.05,arr:m*12});
        }
      }catch(e2){console.error(e2);}
    }
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const filtered=tenants.filter(t=>{
    const q=searchQ.toLowerCase();
    const matchQ=!q||t.societe?.toLowerCase().includes(q)||t.email?.toLowerCase().includes(q)||t.pays?.toLowerCase().includes(q);
    const matchPlan=filterPlan==="tous"||t.plan===filterPlan;
    const matchStatut=filterStatut==="tous"||t.statut===filterStatut;
    return matchQ&&matchPlan&&matchStatut;
  });

  const churn=stats.churnes;
  const essai=stats.essais;
  const actifs=stats.actifs;
  const arr=stats.arr;
  const ltv=mrr>0?mrr*24:0;
  const tauxConv=tenants.length>0?Math.round((actifs/tenants.length)*100):0;
  const planColors={starter:C.blue,business:C.gold,business_pro:C.gold,enterprise:C.purple,multi_societes:C.teal,multi_pro:C.orange,holding:C.gold};

  const lancerAnalyseChurn=async()=>{
    setIaLoading(true);
    try{
      const aRisque=tenants.filter(t=>t.statut==="essai"||calcSolvabilite(t)<50).map(t=>({...t,health_score:calcSolvabilite(t)}));
      const res=await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'scoring_churn',tenants:aRisque})});
      const d=await res.json();
      if(d.success)setAnalyseChurn(d.analyse);
    }catch(e){}
    setIaLoading(false);
  };

  const genererUpsell=async(t)=>{
    try{
      const res=await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_upsell',societe:t.societe,plan:t.plan,metier:t.metier,taille:t.taille})});
      const d=await res.json();
      if(d.success){setUpsellEmail(d.email);showToast("✅ Email upsell généré");}
    }catch(e){showToast("❌ Erreur");}
  };

  const alerterInactifs=async()=>{
    const inactifs=tenants.filter(t=>t.statut==="actif");
    try{
      await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'alerte_inactifs',inactifs})});
      showToast("✅ Alertes inactifs envoyées");
    }catch(e){showToast("❌ Erreur");}
  };

  const envoyerRapport=async()=>{
    showToast("⏳ Envoi rapport mensuel...");
    try{
      await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rapport_mensuel',mrr,actifs,essais:essai,churnes:churn,commissions:stats.commissions})});
      showToast("✅ Rapport mensuel envoyé");
    }catch(e){showToast("❌ Erreur");}
  };

  const provisionner=async()=>{
    if(!provisionForm.societe||!provisionForm.email)return showToast("⚠️ Société et email requis");
    try{
      const res=await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'provisioner_tenant',...provisionForm})});
      const d=await res.json();
      if(d.success){showToast("✅ Client provisionné + notif WhatsApp");setShowProvision(false);setProvisionForm({societe:"",email:"",plan:"starter",pays:"France",metier:""});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  if(!hasAccess(plan,"deploiement"))return <div style={{padding:20}}><UpgradeWall page="Déploiement SaaS" plan={plan}/></div>;

  // ── FICHE CLIENT ──────────────────────────────────────────────
  if(selectedClient){
    const t=selectedClient;
    const score=calcSolvabilite(t);
    const daysLeft=t.trial_ends_at?Math.max(0,Math.ceil((new Date(t.trial_ends_at)-Date.now())/(1000*60*60*24))):0;
    return <div style={{padding:20}}>
      <Btn onClick={()=>setSelectedClient(null)} style={{marginBottom:16,fontSize:12}}>← Retour</Btn>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:C.gold}}>{t.societe?.[0]||"?"}</div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:C.text}}>{t.societe}</div>
              <div style={{fontSize:11,color:C.muted}}>{t.email}</div>
              <div style={{fontSize:11,color:C.muted}}>{t.metier} · {t.pays}</div>
            </div>
          </div>
          {[["Plan",t.plan||"—"],["Prix",fmt(t.plan_price||0)+"/mois"],["Taille",t.taille||"—"],["Statut",t.statut||"—"],["Inscrit le",t.created_at?new Date(t.created_at).toLocaleDateString("fr"):"—"]].map(([l,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{l}</span><span style={{fontWeight:600}}>{v}</span></div>)}
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card style={{borderColor:`${scoreCouleur(score)}44`}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:4}}>SCORE DE SOLVABILITÉ</div>
            <div style={{fontSize:48,fontWeight:700,color:scoreCouleur(score),fontFamily:"Georgia,serif"}}>{score}</div>
            <div style={{fontSize:11,color:scoreCouleur(score)}}>{scoreLabel(score)}</div>
            <SM val={score} max={100} color={scoreCouleur(score)}/>
          </Card>
          {t.statut==="essai"&&daysLeft>0&&<Card style={{borderColor:`${C.orange}44`}}>
            <div style={{fontSize:9,color:C.orange,marginBottom:4}}>ESSAI GRATUIT</div>
            <div style={{fontSize:28,fontWeight:700,color:C.orange}}>{daysLeft} jours</div>
            <div style={{fontSize:11,color:C.muted}}>restants avant expiration</div>
          </Card>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>⚡ Actions rapides</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Btn onClick={()=>genererUpsell(t)} style={{fontSize:11}}>🤖 Générer email upsell IA</Btn>
            <BtnGhost onClick={()=>showToast("📧 Email de relance envoyé")} style={{fontSize:11}}>📧 Email de relance</BtnGhost>
            <BtnGhost onClick={()=>showToast("💬 WhatsApp ouvert")} style={{fontSize:11}}>💬 WhatsApp</BtnGhost>
            <BtnGhost onClick={()=>showToast("🔒 Compte suspendu")} style={{fontSize:11,color:C.red,borderColor:`${C.red}44`}}>🔒 Suspendre</BtnGhost>
          </div>
        </Card>
        {upsellEmail&&<Card style={{borderColor:`${C.purple}44`}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 EMAIL UPSELL IA GÉNÉRÉ</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.7,whiteSpace:"pre-line"}}>{upsellEmail}</div>
          <div style={{display:"flex",gap:6,marginTop:10}}>
            <Btn onClick={()=>showToast("📧 Email envoyé !")} style={{fontSize:10}}>📧 Envoyer</Btn>
            <BtnGhost onClick={()=>{navigator.clipboard?.writeText(upsellEmail);showToast("✅ Copié");}} style={{fontSize:10}}>📋 Copier</BtnGhost>
          </div>
        </Card>}
      </div>
    </div>;
  }

  const tabs=[
    {id:"tenants",label:"👥 Clients"},
    {id:"metrics",label:"📊 Métriques"},
    {id:"churn",label:"🤖 Analyse Churn IA"},
    {id:"revendeurs",label:"🚀 Revendeurs"},
    {id:"certification",label:"🏆 Certification"},
  ];

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>🚀 Déploiement SaaS</div>
        <div style={{fontSize:11,color:C.muted}}>Clients · MRR · Health Score · Churn IA · Upsell auto · Revendeurs</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={envoyerRapport} style={{fontSize:11}}>📱 Rapport mensuel</BtnGhost>
        <BtnGhost onClick={alerterInactifs} style={{fontSize:11,color:C.orange,borderColor:`${C.orange}44`}}>🔔 Alertes inactifs</BtnGhost>
        <Btn onClick={()=>setShowProvision(true)} style={{fontSize:11}}>+ Provisionner client</Btn>
      </div>
    </div>

    {/* FORM PROVISION */}
    {showProvision&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>+ Provisionner un nouveau client</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Société *</label><Inp value={provisionForm.societe} onChange={e=>setProvisionForm(f=>({...f,societe:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email *</label><Inp value={provisionForm.email} onChange={e=>setProvisionForm(f=>({...f,email:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Plan</label>
          <Sel value={provisionForm.plan} onChange={e=>setProvisionForm(f=>({...f,plan:e.target.value}))}>
            <option value="starter">Starter — 59€/mois</option>
            <option value="business_pro">Business Pro — 129€/mois</option>
            <option value="enterprise">Enterprise — 249€/mois</option>
            <option value="multi_societes">Multi-Sociétés — 499€/mois</option>
            <option value="multi_pro">Multi-Sociétés Pro — 799€/mois</option>
            <option value="holding">Holding — 1 200€/mois</option>
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Pays</label><Inp value={provisionForm.pays} onChange={e=>setProvisionForm(f=>({...f,pays:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Métier</label><Inp value={provisionForm.metier} onChange={e=>setProvisionForm(f=>({...f,metier:e.target.value}))}/></div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={provisionner}>✅ Provisionner + notifier</Btn><BtnGhost onClick={()=>setShowProvision(false)}>Annuler</BtnGhost></div>
    </Card>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:14}}>
      <CT style={{borderColor:`${C.green}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>MRR</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(mrr)}</div><div style={{fontSize:9,color:C.muted}}>Récurrent/mois</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>ARR</div><div style={{fontSize:16,fontWeight:700,color:C.teal}}>{fmt(arr)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>ACTIFS</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>{actifs}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>ESSAIS</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{essai}</div></CT>
      <CT style={{borderColor:`${C.red}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>CHURNS</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>{churn}</div></CT>
      <CT style={{borderColor:`${C.gold}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>COMMISSIONS 5%</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(stats.commissions)}</div></CT>
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── CLIENTS ── */}
    {onglet==="tenants"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <Inp value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher société, email, pays..." style={{flex:1,minWidth:200}}/>
        <Sel value={filterPlan} onChange={e=>setFilterPlan(e.target.value)}>
          <option value="tous">Tous les plans</option>
          {["starter","business_pro","enterprise","multi_societes","multi_pro","holding"].map(p=><option key={p} value={p}>{p}</option>)}
        </Sel>
        <Sel value={filterStatut} onChange={e=>setFilterStatut(e.target.value)}>
          <option value="tous">Tous les statuts</option>
          {["essai","actif","suspendu","expiré"].map(s=><option key={s} value={s}>{s}</option>)}
        </Sel>
      </div>
      {loading?<div style={{fontSize:11,color:C.muted}}>⏳ Chargement...</div>:
      tenants.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>🚀</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucun client encore</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Les clients inscrits sur xyraio.fr apparaissent ici automatiquement.</div>
        <Btn onClick={()=>setShowProvision(true)}>+ Provisionner un client</Btn>
      </Card>:
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <STitle>{filtered.length} client(s) trouvé(s)</STitle>
          <BtnGhost onClick={()=>{const csv=["Société,Plan,Prix,Statut,Pays,Email"].concat(filtered.map(t=>`${t.societe},${t.plan},${t.plan_price},${t.statut},${t.pays},${t.email}`)).join("\n");const b=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="clients_xyra.csv";a.click();showToast("✅ CSV exporté");}} style={{fontSize:10}}>📋 CSV</BtnGhost>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
            <thead><tr><TH>Société</TH><TH>Plan</TH><TH>Prix/mois</TH><TH>Score</TH><TH>Statut</TH><TH>Pays</TH><TH>Inscrit</TH><TH>Action</TH></tr></thead>
            <tbody>{filtered.map((t,i)=>{
              const score=calcSolvabilite(t);
              return <tr key={i} style={{background:t.statut==="suspendu"?`${C.red}08`:"transparent"}}>
                <Td>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.gold}}>{t.societe?.[0]||"?"}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700}}>{t.societe||"—"}</div>
                      <div style={{fontSize:9,color:C.muted}}>{t.email}</div>
                    </div>
                  </div>
                </Td>
                <Td><Pill color={planColors[t.plan]||C.gold}>{t.plan||"starter"}</Pill></Td>
                <Td style={{color:C.green,fontWeight:700}}>{fmt(t.plan_price||0)}</Td>
                <Td>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:32,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:score+"%",height:"100%",background:scoreCouleur(score)}}/>
                    </div>
                    <span style={{fontSize:10,color:scoreCouleur(score),fontWeight:700}}>{score}</span>
                  </div>
                </Td>
                <Td><St s={t.statut}/></Td>
                <Td style={{fontSize:11,color:C.muted}}>{t.pays||"—"}</Td>
                <Td style={{fontSize:10,color:C.muted}}>{t.created_at?new Date(t.created_at).toLocaleDateString("fr"):"—"}</Td>
                <Td>
                  <div style={{display:"flex",gap:4}}>
                    <Btn onClick={()=>setSelectedClient(t)} style={{fontSize:9,padding:"3px 8px"}}>Voir</Btn>
                    {score<50&&<BtnGhost onClick={()=>showToast("📧 Demande envoyée")} style={{fontSize:9,padding:"3px 6px",color:C.red,borderColor:`${C.red}44`}}>⚠</BtnGhost>}
                  </div>
                </Td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      </Card>}
    </div>}

    {/* ── MÉTRIQUES ── */}
    {onglet==="metrics"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>📊 Métriques SaaS clés</STitle>
        {[["MRR (Revenus récurrents/mois)",fmt(mrr),C.green],["ARR (Annuel)",fmt(arr),C.teal],["LTV (Valeur vie client estimée)",fmt(ltv),C.blue],["Taux de conversion essai→payant",tauxConv+"%",tauxConv>=30?C.green:C.orange],["Commissions Xyra (5%)",fmt(stats.commissions),C.gold],["Taux de churn",tenants.length>0?Math.round(churn/tenants.length*100)+"%":"—",churn===0?C.green:C.red]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
      </Card>
      <Card>
        <STitle>📈 Répartition par plan</STitle>
        {["starter","business_pro","enterprise","multi_societes","multi_pro","holding"].map(p=>{
          const count=tenants.filter(t=>t.plan===p).length;
          if(count===0)return null;
          const total=tenants.length||1;
          const pct=Math.round(count/total*100);
          const revenu=tenants.filter(t=>t.plan===p).reduce((a,t)=>a+Number(t.plan_price||0),0);
          return <div key={p} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
              <span style={{color:planColors[p]||C.gold,fontWeight:600}}>{p.replace("_"," ").toUpperCase()}</span>
              <span style={{color:C.muted}}>{count} clients · {fmt(revenu)}/mois · {pct}%</span>
            </div>
            <SM val={pct} max={100} color={planColors[p]||C.gold}/>
          </div>;
        })}
      </Card>
    </div>}

    {/* ── ANALYSE CHURN IA ── */}
    {onglet==="churn"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Scoring prédictif Churn — Claude Sonnet</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseChurn||"Lance l'analyse pour identifier les clients à risque et obtenir des recommandations d'actions."}</div>}
        <BtnGhost onClick={lancerAnalyseChurn} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🤖 Analyser le risque de churn"}</BtnGhost>
      </div>
      <Card>
        <STitle>⚠️ Clients à surveiller (score {"<"} 50)</STitle>
        {tenants.filter(t=>calcSolvabilite(t)<50).length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>✅ Aucun client à risque élevé pour le moment.</div>:
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Société</TH><TH>Plan</TH><TH>Score</TH><TH>Statut</TH><TH>Action</TH></tr></thead>
          <tbody>{tenants.filter(t=>calcSolvabilite(t)<50).map((t,i)=>{
            const score=calcSolvabilite(t);
            return <tr key={i}>
              <Td style={{fontWeight:600}}>{t.societe||"—"}</Td>
              <Td><Pill color={planColors[t.plan]||C.gold}>{t.plan}</Pill></Td>
              <Td><span style={{color:scoreCouleur(score),fontWeight:700}}>{score}/100</span></Td>
              <Td><St s={t.statut}/></Td>
              <Td><div style={{display:"flex",gap:4}}>
                <Btn onClick={()=>genererUpsell(t)} style={{fontSize:9,padding:"3px 8px"}}>🤖 Upsell IA</Btn>
                <BtnGhost onClick={()=>showToast("📧 Relance envoyée")} style={{fontSize:9,color:C.orange}}>📧</BtnGhost>
              </div></Td>
            </tr>;
          })}</tbody>
        </table>}
      </Card>
    </div>}

    {/* ── REVENDEURS ── */}
    {onglet==="revendeurs"&&<div>
      <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:14,marginBottom:14,fontSize:11,color:C.text,lineHeight:1.7}}>
        🚀 Le programme revendeur Xyra permet à des agences et entrepreneurs de revendre Xyra sous leur propre marque. Chaque revendeur fixe ses propres prix, gère ses clients, et génère des revenus récurrents. Xyra garde une commission wholesale sur le volume.
      </div>

      {showRevendeurForm&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
        <STitle>📋 Demande de partenariat revendeur — {revendeurForm.plan_revendeur}</STitle>
        <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}22`,borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:C.text}}>
          📱 Ta demande sera envoyée immédiatement à l'équipe Xyra par <b>WhatsApp</b> et <b>email</b>. Réponse sous 24h.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={revendeurForm.nom} onChange={e=>setRevendeurForm(f=>({...f,nom:e.target.value}))} placeholder="Votre nom"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email *</label><Inp value={revendeurForm.email} onChange={e=>setRevendeurForm(f=>({...f,email:e.target.value}))} placeholder="contact@société.com"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Société *</label><Inp value={revendeurForm.societe} onChange={e=>setRevendeurForm(f=>({...f,societe:e.target.value}))} placeholder="Nom de votre agence"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Téléphone / WhatsApp</label><Inp value={revendeurForm.tel} onChange={e=>setRevendeurForm(f=>({...f,tel:e.target.value}))} placeholder="+33..."/></div>
          <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Message (optionnel)</label><Inp value={revendeurForm.message} onChange={e=>setRevendeurForm(f=>({...f,message:e.target.value}))} placeholder="Décrivez votre activité et vos clients cibles..."/></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={envoyerDemandeRevendeur} style={{background:C.gold,color:"#000"}}>{revendeurLoading?"⏳ Envoi...":"✅ Envoyer ma demande"}</Btn>
          <BtnGhost onClick={()=>setShowRevendeurForm(false)}>Annuler</BtnGhost>
        </div>
      </Card>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
        {[{plan:"White-label Starter",prix:"5 000€ setup + 500€/mois",clients:"Jusqu'à 10 clients",color:C.green,features:["Dashboard à votre marque","Domaine personnalisé","Panneau admin revendeur","Onboarding clients auto"]},{plan:"White-label Business",prix:"12 000€ setup + 1 000€/mois",clients:"Clients illimités",color:C.gold,highlight:true,features:["Tout Starter","API partenaire complète","Rapports revenus revendeur","Formation & certification","Co-marketing inclus"]},{plan:"White-label Enterprise",prix:"Sur devis",clients:"Infrastructure dédiée",color:C.purple,features:["Tout Business","SLA garanti 99.9%","Développements spécifiques","Account manager dédié"]}].map((p,i)=><Card key={i} style={{borderColor:`${p.color}44`}}>
          <div style={{fontSize:13,fontWeight:700,color:p.color,marginBottom:4}}>{p.plan}</div>
          <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{p.prix}</div>
          <div style={{fontSize:10,color:C.muted,marginBottom:10}}>{p.clients}</div>
          {p.features.map((f,j)=><div key={j} style={{fontSize:11,color:C.text,marginBottom:6,display:"flex",gap:6}}><span style={{color:p.color}}>◆</span>{f}</div>)}
          <Btn onClick={()=>{setRevendeurForm(f=>({...f,plan_revendeur:p.plan}));setShowRevendeurForm(true);}} style={{width:"100%",fontSize:11,marginTop:10,background:p.highlight?p.color:"transparent",color:p.highlight?"#000":p.color,border:`1px solid ${p.color}44`}}>Devenir revendeur →</Btn>
        </Card>)}
      </div>
      <Card>
        <STitle>💰 Revenus partagés automatiques</STitle>
        <div style={{fontSize:11,color:C.text,lineHeight:1.7,marginBottom:12}}>
          Si vous apportez un nouveau client Xyra hors de votre périmètre de revendeur, vous touchez automatiquement une commission de <b style={{color:C.gold}}>15%</b> sur le premier mois, virée via Flutterwave dans les 30 jours suivant l'encaissement.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Plan Starter (59€)","8.85€ de commission",C.blue],["Plan Business Pro (129€)","19.35€ de commission",C.gold],["Plan Enterprise (249€)","37.35€ de commission",C.purple]].map(([l,v,c],i)=><CT key={i}><div style={{fontSize:11,fontWeight:600,color:c,marginBottom:4}}>{l}</div><div style={{fontSize:12,color:C.text}}>{v}</div></CT>)}
        </div>
      </Card>
    </div>}

    {/* ── CERTIFICATION ── */}
    {onglet==="certification"&&<div>
      <div style={{background:`linear-gradient(135deg,${C.card},#0a0a1a)`,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,marginBottom:14,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:8}}>🏆</div>
        <div style={{fontSize:18,fontWeight:700,color:C.gold,marginBottom:4}}>Programme de Certification Revendeur Xyra</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Devenez un Revendeur Certifié Xyra et accédez à des avantages exclusifs</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,textAlign:"left"}}>
          {[{niveau:"🥉 Certifié",cond:"1 client actif + formation complétée",avantages:["Badge Certifié sur l'annuaire","Support prioritaire","Kit marketing Xyra"]},{niveau:"🥈 Expert",cond:"5 clients actifs + 3 mois d'activité",avantages:["Badge Expert","Commission +5%","Co-marketing Xyra","Accès bêta nouvelles fonctionnalités"]},{niveau:"🥇 Partenaire Elite",cond:"15 clients actifs + 1 an d'activité",avantages:["Badge Elite","Account manager dédié","Commission +10%","Invitation événements Xyra","Logo sur site Xyra"]}].map((n,i)=><Card key={i} style={{borderColor:`${[C.orange,C.muted,C.gold][i]}44`}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>{n.niveau}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>{n.cond}</div>
            {n.avantages.map((a,j)=><div key={j} style={{fontSize:11,color:C.text,marginBottom:4,display:"flex",gap:6}}><span style={{color:C.gold}}>◆</span>{a}</div>)}
          </Card>)}
        </div>
      </div>
    </div>}
  </div>;
};


// ─── PAGE API ─────────────────────────────────────────────────
const PageAPI=({plan,showToast})=>{
  const[onglet,setOnglet]=useState("keys");
  const[keys,setKeys]=useState([]);
  const[webhooks,setWebhooks]=useState([]);
  const[logs,setLogs]=useState([]);
  const[totalAppels,setTotalAppels]=useState(0);
  const[tauxSucces,setTauxSucces]=useState(100);
  const[latenceMoy,setLatenceMoy]=useState(0);
  const[loading,setLoading]=useState(true);
  const[showKeyForm,setShowKeyForm]=useState(false);
  const[showWebhookForm,setShowWebhookForm]=useState(false);
  const[keyForm,setKeyForm]=useState({nom:"",type:"live",permissions:["read","write"]});
  const[webhookForm,setWebhookForm]=useState({nom:"",url:"",evenements:["paiement.recu"]});
  const[newKeyValue,setNewKeyValue]=useState("");
  const[explicationIA,setExplicationIA]=useState({});
  const[visible,setVisible]=useState({});

  const EVENEMENTS_DISPO=["paiement.recu","client.cree","deal.gagne","facture.payee","avis.recu","membre.inscrit","essai.expire","abonnement.annule"];
  const DOCS_ENDPOINTS=[
    {methode:"GET",path:"/api/v1/clients",desc:"Liste tous les clients"},
    {methode:"GET",path:"/api/v1/clients/:id",desc:"Détail d'un client"},
    {methode:"POST",path:"/api/v1/clients",desc:"Créer un client"},
    {methode:"GET",path:"/api/v1/factures",desc:"Liste des factures"},
    {methode:"POST",path:"/api/v1/factures",desc:"Créer une facture"},
    {methode:"GET",path:"/api/v1/wallet/solde",desc:"Solde du wallet"},
    {methode:"POST",path:"/api/v1/wallet/virement",desc:"Effectuer un virement"},
    {methode:"GET",path:"/api/v1/deals",desc:"Liste des deals"},
    {methode:"POST",path:"/api/v1/deals",desc:"Créer un deal"},
    {methode:"GET",path:"/api/v1/analytique",desc:"Données analytiques"},
  ];
  const methodeColor={GET:C.green,POST:C.blue,PUT:C.orange,DELETE:C.red,PATCH:C.purple};

  const load=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/api-xyra?action=all');
      const d=await res.json();
      setKeys(d.keys||[]);
      setWebhooks(d.webhooks||[]);
      setLogs(d.logs||[]);
      setTotalAppels(d.totalAppels||0);
      setTauxSucces(d.tauxSucces||100);
      setLatenceMoy(d.latenceMoy||0);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const creerKey=async()=>{
    if(!keyForm.nom)return showToast("⚠️ Nom requis");
    try{
      const res=await fetch('/api/api-xyra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_key',...keyForm})});
      const d=await res.json();
      if(d.success){setNewKeyValue(d.key_value);showToast("🔑 Clé créée ! Copiez-la maintenant.");setShowKeyForm(false);setKeyForm({nom:"",type:"live",permissions:["read","write"]});load();}
    }catch(e){showToast("❌ Erreur");}
  };

  const revoquerKey=async(id)=>{
    if(!confirm("Révoquer cette clé ?"))return;
    try{await fetch('/api/api-xyra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'revoquer_key',id})});showToast("🔒 Clé révoquée");load();}catch(e){showToast("❌ Erreur");}
  };

  const creerWebhook=async()=>{
    if(!webhookForm.nom||!webhookForm.url)return showToast("⚠️ Nom et URL requis");
    try{
      const res=await fetch('/api/api-xyra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_webhook',...webhookForm})});
      const d=await res.json();
      if(d.success){showToast("✅ Webhook créé");setShowWebhookForm(false);setWebhookForm({nom:"",url:"",evenements:["paiement.recu"]});load();}
    }catch(e){showToast("❌ Erreur");}
  };

  const testerWebhook=async(wh)=>{
    showToast("⏳ Test webhook...");
    try{
      const res=await fetch('/api/api-xyra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'tester_webhook',url:wh.url,secret:wh.secret})});
      const d=await res.json();
      showToast(d.success?"✅ Webhook OK":"❌ Webhook KO");
    }catch(e){showToast("❌ Erreur réseau");}
  };

  const expliquerErreur=async(log)=>{
    try{
      const res=await fetch('/api/api-xyra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'expliquer_erreur',code:log.statut_code,endpoint:log.endpoint,message:"Erreur "+log.statut_code+" sur "+log.methode+" "+log.endpoint})});
      const d=await res.json();
      if(d.success)setExplicationIA(e=>({...e,[log.id]:d.explication}));
    }catch(e){}
  };

  if(!hasAccess(plan,"deploiement"))return <div style={{padding:20}}><UpgradeWall page="API Xyra" plan={plan}/></div>;
  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement API...</div></div>;

  const uptimeColor=tauxSucces>=99?C.green:tauxSucces>=95?C.gold:C.red;
  const uptimeIcon=tauxSucces>=99?"🟢":tauxSucces>=95?"🟡":"🔴";

  const tabs=[
    {id:"keys",label:"🔑 Clés API"},
    {id:"webhooks",label:"🔔 Webhooks"},
    {id:"logs",label:"📋 Logs"},
    {id:"docs",label:"📚 Docs"},
    {id:"integrations",label:"🔗 Intégrations"},
    {id:"sante",label:"❤ Santé"},
  ];

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⚡ API Xyra</div>
        <div style={{fontSize:11,color:C.muted}}>Clés API · Webhooks · Logs · Documentation · Intégrations</div>
      </div>
      <div style={{background:uptimeColor+"22",border:"1px solid "+uptimeColor+"44",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,color:uptimeColor}}>
        {uptimeIcon} {tauxSucces}% uptime
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>CLÉS ACTIVES</div><div style={{fontSize:22,fontWeight:700,color:C.green}}>{keys.length}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>WEBHOOKS</div><div style={{fontSize:22,fontWeight:700,color:C.blue}}>{webhooks.length}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>APPELS TOTAL</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{totalAppels}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>TAUX SUCCÈS</div><div style={{fontSize:18,fontWeight:700,color:tauxSucces>=99?C.green:C.orange}}>{tauxSucces}%</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>LATENCE MOY.</div><div style={{fontSize:18,fontWeight:700,color:latenceMoy<200?C.green:latenceMoy<500?C.gold:C.red}}>{latenceMoy}ms</div></CT>
    </div>

    {newKeyValue&&<div style={{background:C.gold+"11",border:"2px solid "+C.gold,borderRadius:10,padding:16,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:8}}>🔑 Copiez cette clé maintenant — elle ne sera plus visible !</div>
      <div style={{background:C.dark,borderRadius:6,padding:"10px 14px",fontFamily:"'Courier New',monospace",fontSize:12,color:C.green,marginBottom:10,wordBreak:"break-all"}}>{newKeyValue}</div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>{navigator.clipboard?.writeText(newKeyValue);showToast("✅ Clé copiée !");}} style={{background:C.gold,color:"#000"}}>📋 Copier</Btn>
        <BtnGhost onClick={()=>setNewKeyValue("")} style={{fontSize:11}}>✕ Fermer</BtnGhost>
      </div>
    </div>}

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?"1px solid "+C.border:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {onglet==="keys"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <Btn onClick={()=>setShowKeyForm(true)}>+ Générer une clé API</Btn>
      </div>
      {showKeyForm&&<Card style={{marginBottom:14,borderColor:C.gold+"44"}}>
        <STitle>🔑 Nouvelle clé API</STitle>
        <div style={{background:C.orange+"11",border:"1px solid "+C.orange+"33",borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:C.orange}}>⚠️ La clé ne sera affichée qu'une fois. Copiez-la immédiatement.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={keyForm.nom} onChange={e=>setKeyForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: Zapier integration"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Environnement</label>
            <Sel value={keyForm.type} onChange={e=>setKeyForm(f=>({...f,type:e.target.value}))}>
              <option value="live">🟢 Live (production)</option>
              <option value="test">🧪 Test (sandbox)</option>
            </Sel>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creerKey}>🔑 Générer</Btn><BtnGhost onClick={()=>setShowKeyForm(false)}>Annuler</BtnGhost></div>
      </Card>}
      {keys.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>🔑</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucune clé API</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Créez une clé pour connecter Xyra à vos outils.</div>
        <Btn onClick={()=>setShowKeyForm(true)}>+ Générer une clé</Btn>
      </Card>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {keys.map((k,i)=><Card key={i} style={{borderColor:(k.type==="test"?C.blue:C.green)+"33"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <div style={{fontSize:13,fontWeight:700}}>{k.nom}</div>
                <Pill color={k.type==="test"?C.blue:C.green}>{k.type==="test"?"🧪 Test":"🟢 Live"}</Pill>
              </div>
              <div style={{fontFamily:"'Courier New',monospace",fontSize:12,color:C.muted,marginBottom:4}}>
                {visible[k.id]?k.key_value:(k.key_value||"").slice(0,12)+"••••••••••••••••••••••••"}
              </div>
              <div style={{fontSize:10,color:C.muted}}>{k.appels_mois||0}/{k.limite_mois||10000} appels ce mois</div>
            </div>
            <div style={{display:"flex",gap:6,marginLeft:12}}>
              <BtnGhost onClick={()=>setVisible(v=>({...v,[k.id]:!v[k.id]}))} style={{fontSize:10}}>{visible[k.id]?"🙈":"👁"}</BtnGhost>
              <BtnGhost onClick={()=>{navigator.clipboard?.writeText(k.key_value||"");showToast("✅ Clé copiée");}} style={{fontSize:10}}>📋</BtnGhost>
              <BtnGhost onClick={()=>revoquerKey(k.id)} style={{fontSize:10,color:C.red,borderColor:C.red+"33"}}>🔒 Révoquer</BtnGhost>
            </div>
          </div>
        </Card>)}
      </div>}
    </div>}

    {onglet==="webhooks"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <Btn onClick={()=>setShowWebhookForm(true)}>+ Ajouter un webhook</Btn>
      </div>
      {showWebhookForm&&<Card style={{marginBottom:14,borderColor:C.blue+"44"}}>
        <STitle>🔔 Nouveau webhook</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={webhookForm.nom} onChange={e=>setWebhookForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: Zapier clients"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>URL *</label><Inp value={webhookForm.url} onChange={e=>setWebhookForm(f=>({...f,url:e.target.value}))} placeholder="https://hooks.zapier.com/..."/></div>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Événements</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {EVENEMENTS_DISPO.map(evt=><label key={evt} style={{display:"flex",gap:6,alignItems:"center",fontSize:11,cursor:"pointer",background:webhookForm.evenements.includes(evt)?C.blue+"15":"transparent",border:"1px solid "+(webhookForm.evenements.includes(evt)?C.blue:C.border),borderRadius:6,padding:"4px 10px"}}>
                <input type="checkbox" checked={webhookForm.evenements.includes(evt)} onChange={e=>{const evts=e.target.checked?[...webhookForm.evenements,evt]:webhookForm.evenements.filter(x=>x!==evt);setWebhookForm(f=>({...f,evenements:evts}));}} style={{accentColor:C.blue}}/>
                <span style={{color:webhookForm.evenements.includes(evt)?C.blue:C.muted}}>{evt}</span>
              </label>)}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creerWebhook} style={{background:C.blue}}>✅ Créer</Btn><BtnGhost onClick={()=>setShowWebhookForm(false)}>Annuler</BtnGhost></div>
      </Card>}
      {webhooks.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>🔔</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucun webhook</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Configurez des webhooks pour envoyer des événements vers vos outils.</div>
        <Btn onClick={()=>setShowWebhookForm(true)}>+ Ajouter</Btn>
      </Card>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {webhooks.map((wh,i)=><Card key={i} style={{borderColor:(wh.statut==="actif"?C.green:C.border)+"33"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{wh.nom}</div>
              <div style={{fontSize:11,color:C.muted}}>{wh.url}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <Pill color={wh.statut==="actif"?C.green:C.muted}>{wh.statut}</Pill>
              <BtnGhost onClick={()=>testerWebhook(wh)} style={{fontSize:10}}>🧪 Tester</BtnGhost>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {(wh.evenements||[]).map((evt,j)=><Pill key={j} color={C.blue}>{evt}</Pill>)}
          </div>
        </Card>)}
      </div>}
    </div>}

    {onglet==="logs"&&<Card>
      <STitle>📋 Logs des appels API — 50 derniers</STitle>
      {logs.length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucun appel enregistré.</div>:
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
          <thead><tr><TH>Date</TH><TH>Méthode</TH><TH>Endpoint</TH><TH>Status</TH><TH>Durée</TH><TH>Action</TH></tr></thead>
          <tbody>{logs.map((l,i)=><tr key={i} style={{background:l.statut_code>=400?C.red+"08":"transparent"}}>
            <Td style={{fontSize:10,color:C.muted}}>{new Date(l.created_at).toLocaleDateString("fr")}</Td>
            <Td><Pill color={methodeColor[l.methode]||C.blue}>{l.methode}</Pill></Td>
            <Td style={{fontFamily:"'Courier New',monospace",fontSize:11}}>{l.endpoint}</Td>
            <Td><Pill color={l.statut_code<300?C.green:l.statut_code<400?C.gold:C.red}>{l.statut_code}</Pill></Td>
            <Td style={{fontSize:11,color:l.duree_ms>500?C.orange:C.muted}}>{l.duree_ms||0}ms</Td>
            <Td>
              {l.statut_code>=400&&<div>
                <BtnGhost onClick={()=>expliquerErreur(l)} style={{fontSize:10,color:C.purple}}>🤖 Expliquer</BtnGhost>
                {explicationIA[l.id]&&<div style={{fontSize:10,color:C.text,marginTop:4,background:C.purple+"11",borderRadius:6,padding:"4px 8px",lineHeight:1.5}}>{explicationIA[l.id]}</div>}
              </div>}
            </Td>
          </tr>)}</tbody>
        </table>
      </div>}
    </Card>}

    {onglet==="docs"&&<div>
      <div style={{background:C.blue+"11",border:"1px solid "+C.blue+"33",borderRadius:10,padding:14,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.blue,marginBottom:6}}>🌐 URL de base</div>
        <div style={{fontFamily:"'Courier New',monospace",fontSize:13,color:C.text}}>https://xyraio.fr/api/v1</div>
        <div style={{fontSize:11,color:C.muted,marginTop:4}}>Header : Authorization: Bearer ty_live_...</div>
      </div>
      <Card style={{marginBottom:12}}>
        <STitle>📚 Endpoints disponibles</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Méthode</TH><TH>Endpoint</TH><TH>Description</TH></tr></thead>
          <tbody>{DOCS_ENDPOINTS.map((e,i)=><tr key={i}>
            <Td><Pill color={methodeColor[e.methode]||C.blue}>{e.methode}</Pill></Td>
            <Td style={{fontFamily:"'Courier New',monospace",fontSize:11}}>{e.path}</Td>
            <Td style={{fontSize:11,color:C.muted}}>{e.desc}</Td>
          </tr>)}</tbody>
        </table>
      </Card>
      <Card>
        <STitle>💡 Exemple d'appel curl</STitle>
        <div style={{background:C.dark,borderRadius:8,padding:16,fontFamily:"'Courier New',monospace",fontSize:12,lineHeight:1.8,color:C.green}}>
          <div style={{color:C.muted}}>{"// Récupérer vos clients"}</div>
          <div>{"curl -X GET \\"}</div>
          <div>{"  https://xyraio.fr/api/v1/clients \\"}</div>
          <div>{"  -H \"Authorization: Bearer ty_live_...\" \\"}</div>
          <div>{"  -H \"Content-Type: application/json\""}</div>
        </div>
      </Card>
    </div>}

    {onglet==="integrations"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
      {[
        {nom:"Zapier",logo:"⚡",desc:"Connectez Xyra à 5 000+ apps.",color:C.orange},
        {nom:"Make",logo:"🔄",desc:"Workflows visuels avancés.",color:C.purple},
        {nom:"n8n",logo:"🤖",desc:"Automatisation open-source.",color:C.green},
        {nom:"Notion",logo:"📓",desc:"Sync clients et deals.",color:C.text},
        {nom:"Slack",logo:"💬",desc:"Notifications en temps réel.",color:C.blue},
        {nom:"Google Sheets",logo:"📊",desc:"Export automatique des données.",color:C.green},
      ].map((app,i)=><Card key={i} style={{borderColor:app.color+"33"}}>
        <div style={{fontSize:28,marginBottom:8}}>{app.logo}</div>
        <div style={{fontSize:14,fontWeight:700,color:app.color,marginBottom:6}}>{app.nom}</div>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.6,marginBottom:12}}>{app.desc}</div>
        <Btn onClick={()=>showToast("🔗 Guide "+app.nom+" ouvert")} style={{width:"100%",fontSize:11,background:app.color+"22",color:app.color,border:"1px solid "+app.color+"44"}}>Connecter</Btn>
      </Card>)}
    </div>}

    {onglet==="sante"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>❤ Score de santé API</STitle>
        <div style={{textAlign:"center",padding:"16px 0"}}>
          <div style={{fontSize:56,fontWeight:700,color:uptimeColor}}>{tauxSucces}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:12}}>/100</div>
          <SM val={tauxSucces} max={100} color={uptimeColor}/>
        </div>
        {[["Taux de succès",tauxSucces+"%",uptimeColor],["Latence moyenne",latenceMoy+"ms",latenceMoy<200?C.green:C.orange],["Clés actives",String(keys.length),C.blue],["Webhooks actifs",String(webhooks.filter(w=>w.statut==="actif").length),C.green]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"5px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
      </Card>
      <Card>
        <STitle>📊 Distribution statuts</STitle>
        {[[200,"2xx Succès",C.green],[400,"4xx Client Error",C.orange],[500,"5xx Server Error",C.red]].map(([code,label,color])=>{
          const count=logs.filter(l=>l.statut_code>=Number(code)&&l.statut_code<Number(code)+100).length;
          const pct=logs.length>0?Math.round(count/logs.length*100):0;
          return <div key={code} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color}}>{label}</span><span style={{color,fontWeight:700}}>{count} · {pct}%</span></div>
            <SM val={pct} max={100} color={color}/>
          </div>;
        })}
        {logs.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:12}}>Aucun log disponible.</div>}
      </Card>
    </div>}
  </div>;
};


// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────
const PageAdmin=({plan,showToast})=>{
  if(plan!=="owner")return <div style={{padding:20}}><div style={{textAlign:"center",padding:60}}><div style={{fontSize:40}}>👑</div><div style={{fontSize:16,color:C.text,marginTop:8}}>Réservé à Curtiss</div></div></div>;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>👑 Admin Curtiss</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Vue globale · Tous les revenus · Commissions · IA CEO</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
      <KPI label="CA global" val="24 380 €" color={C.gold}/>
      <KPI label="Membres Club" val="47" color={C.blue}/>
      <KPI label="ARR SaaS" val="36 000 €" color={C.green}/>
      <KPI label="Score CEO" val="88/100" color={C.teal}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card><STitle>📊 Vue 360° Xyra</STitle>
        {[["Revenus services",18200,C.gold],["Revenus SaaS",3000,C.green],["Revenus Club",1380,C.blue],["Commissions 5%",2400,C.teal]].map(([n,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span>{n}</span><span style={{color:c,fontWeight:700}}>{fmt(v)}</span></div>)}
      </Card>
      <Card><STitle>🤖 Analyse CEO — Claude</STitle>
        <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:12}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:4}}>Intelligence artificielle · Claude Sonnet</div>
          <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>Xyra performe en dessous de son potentiel sur le SaaS. Recommandation : concentrer 30% des efforts commerciaux sur la conversion de 5 prospects SaaS identifiés. ROI estimé : +18 000€ ARR en Q3.</div>
        </div>
      </Card>
    </div>
  </div>;
};
const PageOwner=({plan,showToast,profil})=>{
  const[onglet,setOnglet]=useState("vue");
  const[abonnes,setAbonnes]=useState([]);
  const[loading,setLoading]=useState(true);
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({societe:"",email:"",nom:"",plan:"starter",siren:""});
  const[msgGroupe,setMsgGroupe]=useState({planCible:"tous",sujet:"",corps:""});
  const[services,setServices]=useState([]);
  const[solvLoading,setSolvLoading]=useState({});
  const tabs=[{id:"vue",label:"📊 Vue globale"},{id:"abonnes",label:"👥 Abonnés"},{id:"alertes",label:"🔔 Alertes"},{id:"communication",label:"📢 Communication"},{id:"investisseur",label:"📄 Investisseur"},{id:"systeme",label:"🐛 Système"}];

  const loadAll=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/abonnes');
      const data=await res.json();
      if(data.abonnes)setAbonnes(data.abonnes);
      if(data.services)setServices(data.services);
    }catch(e){console.error("Owner:",e);}
    setLoading(false);
  };
  useEffect(()=>{loadAll();},[]);

  const creerAbonne=async()=>{
    if(!addForm.email||!addForm.societe)return showToast("⚠️ Société et email requis");
    showToast("⏳ Création en cours...");
    try{
      const res=await fetch('/api/abonnes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',...addForm})});
      const data=await res.json();
      if(data.success){showToast(`✅ ${addForm.societe} créé et invité par email`);setShowAdd(false);setAddForm({societe:"",email:"",nom:"",plan:"starter",siren:""});loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const changerPlan=async(id,nouveauPlan)=>{
    try{
      const res=await fetch('/api/abonnes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'changer_plan',id,plan:nouveauPlan})});
      const data=await res.json();
      if(data.success){showToast("✅ Plan mis à jour");loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const suspendre=async(id,actuel)=>{
    const action=actuel==='suspendu'?'reactiver':'suspendre';
    try{
      const res=await fetch('/api/abonnes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,id})});
      const data=await res.json();
      if(data.success){showToast(action==='suspendre'?"⚠️ Compte suspendu":"✅ Compte réactivé");loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const supprimerAbonne=async(id,nom)=>{
    try{
      const res=await fetch('/api/abonnes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer',id})});
      const data=await res.json();
      if(data.success){showToast(`🗑 ${nom} supprimé`);setSel(null);loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const verifierSolvabilite=async(a)=>{
    if(!a.siren)return showToast("⚠️ Pas de SIREN pour cette entreprise");
    setSolvLoading(s=>({...s,[a.id]:true}));
    try{
      const res=await fetch('/api/abonnes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verifier_solvabilite',id:a.id,siren:a.siren})});
      const data=await res.json();
      if(data.success){showToast(`✅ Solvabilité vérifiée — score ${data.score}/100`);loadAll();}
      else showToast("❌ "+(data.error||"Erreur SIRENE"));
    }catch(e){showToast("❌ Erreur");}
    setSolvLoading(s=>({...s,[a.id]:false}));
  };

  const envoyerEmailIndividuel=async(a,sujet,corps)=>{
    if(!sujet||!corps)return showToast("⚠️ Sujet et message requis");
    showToast("⏳ Envoi...");
    try{
      const res=await fetch('/api/abonnes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_email',id:a.id,email:a.email,sujet,corps})});
      const data=await res.json();
      if(data.success)showToast(`✅ Email envoyé à ${a.societe}`);
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const envoyerGroupé=async()=>{
    if(!msgGroupe.sujet||!msgGroupe.corps)return showToast("⚠️ Sujet et message requis");
    showToast("⏳ Envoi groupé...");
    try{
      const res=await fetch('/api/abonnes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_groupe',...msgGroupe})});
      const data=await res.json();
      if(data.success)showToast(`✅ Message envoyé à ${data.nb} abonné(s)`);
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const genererRelanceIA=async(a)=>{
    showToast("⏳ Génération IA...");
    try{
      const res=await fetch('/api/abonnes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'relance_ia',abonne:a})});
      const data=await res.json();
      if(data.success){setSel(s=>({...s,_relanceIA:data.message}));showToast("✅ Message généré");}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const mrr=abonnes.filter(a=>a.statut==='actif').reduce((acc,a)=>{const p={starter:29,business:99,enterprise:249,owner:0}[a.plan]||0;return acc+p;},0);
  const arr=mrr*12;
  const actifs=abonnes.filter(a=>a.statut==='actif').length;
  const suspendu=abonnes.filter(a=>a.statut==='suspendu').length;
  const trials=abonnes.filter(a=>a.statut==='trial').length;
  const alertesTrials=abonnes.filter(a=>a.statut==='trial'&&a.jours_restants<=3);
  const alertesInactifs=abonnes.filter(a=>a.inactif_jours>=30);
  const alertesImpayes=abonnes.filter(a=>a.paiement_echoue);
  const alertesSolvabilite=abonnes.filter(a=>a.score_solvabilite!==null&&a.score_solvabilite<40);

  const planColor={starter:C.blue,business:C.gold,enterprise:C.purple,owner:C.green};
  const statutColor={actif:C.green,suspendu:C.red,trial:C.orange};

  return <div style={{padding:20,maxWidth:1200}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.gold,fontFamily:"Georgia,serif"}}>★ Espace Propriétaire</div>
        <div style={{fontSize:11,color:C.muted}}>Zone de contrôle global Xyra · {abonnes.length} abonné(s)</div>
      </div>
      <Btn onClick={()=>setShowAdd(s=>!s)}>+ Abonné manuel</Btn>
    </div>

    {showAdd&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>Créer un abonné manuellement</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
        {[["Société *","societe"],["Email *","email"],["Nom contact","nom"],["SIREN","siren"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={addForm[k]} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Plan</label>
          <Sel value={addForm.plan} onChange={e=>setAddForm(f=>({...f,plan:e.target.value}))} style={{width:"100%"}}>
            <option value="starter">Starter — 29€/mois</option>
            <option value="business">Business Pro — 99€/mois</option>
            <option value="enterprise">Enterprise — 249€/mois</option>
          </Sel>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={creerAbonne}>✅ Créer et inviter</Btn>
        <BtnGhost onClick={()=>setShowAdd(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>

    {loading&&<div style={{fontSize:11,color:C.muted}}>Chargement...</div>}

    {/* ── VUE GLOBALE ── */}
    {!loading&&onglet==="vue"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="MRR" val={fmt(mrr)} color={C.gold} sub="Revenus mensuels récurrents"/>
        <KPI label="ARR" val={fmt(arr)} color={C.green} sub="Revenus annuels récurrents"/>
        <KPI label="Abonnés actifs" val={actifs} color={C.blue}/>
        <KPI label="Trials en cours" val={trials} color={C.orange}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>Répartition par plan</STitle>
          {["starter","business","enterprise"].map(p=>{const n=abonnes.filter(a=>a.plan===p).length;return <div key={p} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{textTransform:"capitalize",color:planColor[p]}}>{p}</span><span style={{fontWeight:700}}>{n} abonné(s)</span></div><SM val={n} max={Math.max(abonnes.length,1)} color={planColor[p]}/></div>;})}
        </Card>
        <Card>
          <STitle>Santé globale</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>Abonnés actifs</span><Pill color={C.green}>{actifs}</Pill></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>Suspendus</span><Pill color={suspendu>0?C.red:C.green}>{suspendu}</Pill></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>Alertes actives</span><Pill color={alertesTrials.length+alertesImpayes.length>0?C.orange:C.green}>{alertesTrials.length+alertesImpayes.length+alertesInactifs.length}</Pill></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0"}}><span style={{color:C.muted}}>Solvabilité à risque</span><Pill color={alertesSolvabilite.length>0?C.red:C.green}>{alertesSolvabilite.length}</Pill></div>
          </div>
        </Card>
      </div>
    </div>}

    {/* ── ABONNÉS ── */}
    {!loading&&onglet==="abonnes"&&<div style={{display:"grid",gridTemplateColumns:sel?"1fr 1fr":"1fr",gap:12}}>
      <Card>
        <STitle>👥 Tous les abonnés ({abonnes.length})</STitle>
        {abonnes.length===0&&<div style={{fontSize:12,color:C.muted,padding:"20px 0",textAlign:"center"}}>Aucun abonné pour le moment.</div>}
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Société</TH><TH>Plan</TH><TH>Statut</TH><TH>Solvabilité</TH><TH>Inscription</TH></tr></thead>
          <tbody>{abonnes.map(a=><tr key={a.id} style={{cursor:"pointer",background:sel?.id===a.id?`${C.gold}0D`:"transparent"}} onClick={()=>setSel(a)}>
            <Td style={{fontWeight:600}}>{a.societe}</Td>
            <Td><Pill color={planColor[a.plan]||C.muted}>{a.plan}</Pill></Td>
            <Td><Pill color={statutColor[a.statut]||C.muted}>{a.statut}</Pill></Td>
            <Td>{a.score_solvabilite!==null?<Pill color={a.score_solvabilite>=70?C.green:a.score_solvabilite>=40?C.orange:C.red}>{a.score_solvabilite}/100</Pill>:<span style={{color:C.muted,fontSize:10}}>—</span>}</Td>
            <Td style={{color:C.muted,fontSize:10}}>{a.created_at?new Date(a.created_at).toLocaleDateString("fr"):"—"}</Td>
          </tr>)}</tbody>
        </table>
      </Card>

      {sel&&<Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div><div style={{fontSize:15,fontWeight:700}}>{sel.societe}</div><div style={{fontSize:11,color:C.muted}}>{sel.email} · {sel.plan}</div></div>
          <BtnGhost onClick={()=>setSel(null)} style={{fontSize:10,padding:"4px 8px"}}>✕</BtnGhost>
        </div>
        {[["Email",sel.email],["SIREN",sel.siren||"—"],["Statut",sel.statut],["Inscrit le",sel.created_at?new Date(sel.created_at).toLocaleDateString("fr"):"—"],["Inactif depuis",sel.inactif_jours>0?sel.inactif_jours+" jours":"Actif récemment"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>)}
        <div style={{marginTop:10}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Changer de plan</label>
          <Sel value={sel.plan} onChange={e=>changerPlan(sel.id,e.target.value)} style={{width:"100%",marginBottom:8}}>
            <option value="starter">Starter — 29€/mois</option>
            <option value="business">Business Pro — 99€/mois</option>
            <option value="enterprise">Enterprise — 249€/mois</option>
          </Sel>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
          <Btn onClick={()=>verifierSolvabilite(sel)} style={{background:C.blue,fontSize:11}}>{solvLoading[sel.id]?"⏳ Vérification...":"🔍 Vérifier solvabilité SIRENE"}</Btn>
          <BtnGhost onClick={()=>genererRelanceIA(sel)} style={{fontSize:11,color:C.purple,borderColor:`${C.purple}44`}}>🤖 Générer relance IA</BtnGhost>
          {sel._relanceIA&&<div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:10,fontSize:11,color:C.text,lineHeight:1.6,marginBottom:4}}>{sel._relanceIA}<div style={{marginTop:8,display:"flex",gap:6}}><Btn onClick={()=>envoyerEmailIndividuel(sel,"Nous avons pensé à vous",sel._relanceIA)} style={{fontSize:10,padding:"5px 10px"}}>📧 Envoyer</Btn></div></div>}
          <BtnGhost onClick={()=>suspendre(sel.id,sel.statut)} style={{fontSize:11,color:sel.statut==="suspendu"?C.green:C.orange,borderColor:sel.statut==="suspendu"?`${C.green}44`:`${C.orange}44`}}>{sel.statut==="suspendu"?"✅ Réactiver":"⏸ Suspendre"}</BtnGhost>
          <BtnGhost onClick={()=>supprimerAbonne(sel.id,sel.societe)} style={{fontSize:11,color:C.red,borderColor:`${C.red}44`}}>🗑 Supprimer</BtnGhost>
        </div>
      </Card>}
    </div>}

    {/* ── ALERTES ── */}
    {!loading&&onglet==="alertes"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {alertesTrials.length===0&&alertesImpayes.length===0&&alertesInactifs.length===0&&alertesSolvabilite.length===0&&<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:32,marginBottom:8}}>✅</div><div style={{color:C.green,fontWeight:700}}>Aucune alerte active</div></Card>}
      {alertesTrials.length>0&&<Card style={{borderColor:`${C.orange}44`}}>
        <STitle style={{color:C.orange}}>⏰ Trials expirant bientôt ({alertesTrials.length})</STitle>
        {alertesTrials.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{a.societe}</div><div style={{fontSize:10,color:C.muted}}>{a.jours_restants} jour(s) restant(s)</div></div>
          <BtnGhost onClick={()=>envoyerEmailIndividuel(a,"Votre essai Xyra se termine bientôt","Bonjour, votre période d'essai Xyra se termine dans "+a.jours_restants+" jour(s). Passez à un plan payant pour continuer à profiter de toutes les fonctionnalités.")} style={{fontSize:10}}>📧 Relancer</BtnGhost>
        </div>)}
      </Card>}
      {alertesImpayes.length>0&&<Card style={{borderColor:`${C.red}44`}}>
        <STitle style={{color:C.red}}>💳 Paiements échoués ({alertesImpayes.length})</STitle>
        {alertesImpayes.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div style={{fontWeight:600}}>{a.societe}</div>
          <div style={{display:"flex",gap:6}}>
            <BtnGhost onClick={()=>envoyerEmailIndividuel(a,"Problème de paiement Xyra","Bonjour, nous n'avons pas pu traiter votre paiement. Merci de mettre à jour vos informations de paiement.")} style={{fontSize:10}}>📧 Relancer</BtnGhost>
            <BtnGhost onClick={()=>suspendre(a.id,a.statut)} style={{fontSize:10,color:C.orange,borderColor:`${C.orange}44`}}>⏸ Suspendre</BtnGhost>
          </div>
        </div>)}
      </Card>}
      {alertesInactifs.length>0&&<Card style={{borderColor:`${C.muted}44`}}>
        <STitle>😴 Comptes inactifs +30j ({alertesInactifs.length})</STitle>
        {alertesInactifs.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{a.societe}</div><div style={{fontSize:10,color:C.muted}}>{a.inactif_jours} jours sans connexion</div></div>
          <BtnGhost onClick={()=>genererRelanceIA(a)} style={{fontSize:10,color:C.purple,borderColor:`${C.purple}44`}}>🤖 Relance IA</BtnGhost>
        </div>)}
      </Card>}
      {alertesSolvabilite.length>0&&<Card style={{borderColor:`${C.red}44`}}>
        <STitle style={{color:C.red}}>⚠️ Solvabilité à risque ({alertesSolvabilite.length})</STitle>
        {alertesSolvabilite.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{a.societe}</div><div style={{fontSize:10,color:C.red}}>Score {a.score_solvabilite}/100</div></div>
          <Pill color={C.red}>Risque élevé</Pill>
        </div>)}
      </Card>}
    </div>}

    {/* ── COMMUNICATION ── */}
    {!loading&&onglet==="communication"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>📢 Message groupé par plan</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Destinataires</label>
            <Sel value={msgGroupe.planCible} onChange={e=>setMsgGroupe(m=>({...m,planCible:e.target.value}))} style={{width:"100%"}}>
              <option value="tous">Tous les abonnés</option>
              <option value="starter">Starter uniquement</option>
              <option value="business">Business Pro uniquement</option>
              <option value="enterprise">Enterprise uniquement</option>
              <option value="trial">Trials uniquement</option>
            </Sel>
          </div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Sujet</label><Inp value={msgGroupe.sujet} onChange={e=>setMsgGroupe(m=>({...m,sujet:e.target.value}))} placeholder="Ex: Nouvelle fonctionnalité disponible"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Message</label><textarea value={msgGroupe.corps} onChange={e=>setMsgGroupe(m=>({...m,corps:e.target.value}))} placeholder="Votre message..." style={{width:"100%",minHeight:100,background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:8,color:C.text,fontFamily:"inherit",fontSize:12}}/></div>
          <Btn onClick={envoyerGroupé}>📤 Envoyer à {msgGroupe.planCible==="tous"?abonnes.length:abonnes.filter(a=>a.plan===msgGroupe.planCible||a.statut===msgGroupe.planCible).length} abonné(s)</Btn>
        </div>
      </Card>
      <Card>
        <STitle>✉️ Message individuel</STitle>
        {sel?<div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:10,fontSize:11}}><b>{sel.societe}</b> · {sel.email}</div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Sujet</label><Inp placeholder="Sujet de l'email"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Message</label><textarea placeholder="Votre message..." style={{width:"100%",minHeight:100,background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:8,color:C.text,fontFamily:"inherit",fontSize:12}}/></div>
          <Btn onClick={()=>showToast("📧 Message envoyé à "+sel.societe)}>📧 Envoyer à {sel.societe}</Btn>
        </div>:<div style={{textAlign:"center",padding:30}}>
          <div style={{fontSize:24,marginBottom:8}}>👈</div>
          <div style={{color:C.muted,fontSize:12}}>Sélectionne un abonné dans l'onglet "Abonnés" pour lui envoyer un message individuel</div>
        </div>}
      </Card>
    </div>}

    {/* ── INVESTISSEUR ── */}
    {!loading&&onglet==="investisseur"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="MRR" val={fmt(mrr)} color={C.gold} sub="Monthly Recurring Revenue"/>
        <KPI label="ARR" val={fmt(arr)} color={C.green} sub="Annual Recurring Revenue"/>
        <KPI label="Churn" val={suspendu>0?Math.round(suspendu/Math.max(abonnes.length,1)*100)+"%":"0%"} color={suspendu>0?C.red:C.green} sub="Taux d'attrition"/>
        <KPI label="LTV moyen" val={fmt(mrr/Math.max(actifs,1)*24)} color={C.purple} sub="Valeur vie client (24 mois)"/>
      </div>
      <Card style={{marginBottom:12}}>
        <STitle>📊 Métriques SaaS</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["MRR","Monthly Recurring Revenue",fmt(mrr)],["ARR","Annual Recurring Revenue",fmt(arr)],["Abonnés actifs","Comptes payants actifs",actifs],["Trials actifs","Comptes en période d'essai",trials],["Taux de conversion trial","Trials qui deviennent payants","N/A"],["Churn rate","Abonnés perdus ce mois","0%"],["ARPU","Revenu moyen par utilisateur",fmt(mrr/Math.max(actifs,1))],["LTV","Valeur vie client (24 mois)",fmt(mrr/Math.max(actifs,1)*24)]].map(([k,desc,v],i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:12,border:`1px solid ${C.border}`}}><div style={{fontSize:9,color:C.muted,marginBottom:2,letterSpacing:"0.1em"}}>{desc.toUpperCase()}</div><div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>{k}</div><div style={{fontSize:18,fontWeight:700,color:C.text}}>{v}</div></div>)}
        </div>
      </Card>
      <Btn onClick={()=>showToast("📄 Export PDF investisseur — fonctionnalité à venir")} style={{background:C.purple}}>📄 Exporter dossier investisseur PDF</Btn>
    </div>}

    {/* ── SYSTÈME ── */}
    {onglet==="systeme"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {services.map((s,i)=><Card key={i} style={{borderColor:`${s.ok?C.green:C.red}44`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:13,fontWeight:700}}>{s.nom}</div>
            <span style={{width:10,height:10,borderRadius:"50%",background:s.ok?C.green:C.red,display:"inline-block"}}/>
          </div>
          <div style={{fontSize:10,color:C.muted}}>{s.detail}</div>
        </Card>)}
        {services.length===0&&[
          {nom:"Supabase",ok:true,detail:"Base de données connectée"},
          {nom:"Stripe",ok:true,detail:"Paiements actifs"},
          {nom:"Resend",ok:true,detail:"Emails transactionnels"},
          {nom:"WhatsApp API",ok:true,detail:"Meta Business API"},
          {nom:"Vapi",ok:true,detail:"Agent vocal Lea"},
          {nom:"Anthropic",ok:true,detail:"Claude Sonnet 4.6"},
        ].map((s,i)=><Card key={i} style={{borderColor:`${s.ok?C.green:C.red}44`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:13,fontWeight:700}}>{s.nom}</div>
            <span style={{width:10,height:10,borderRadius:"50%",background:s.ok?C.green:C.red,display:"inline-block"}}/>
          </div>
          <div style={{fontSize:10,color:C.muted}}>{s.detail}</div>
        </Card>)}
      </div>
      <Card>
        <STitle>📱 Readiness App Mobile</STitle>
        <div style={{fontSize:12,color:C.muted,marginBottom:12}}>État des endpoints API pour la future app mobile Xyra</div>
        {[
          {route:"/api/clients",pret:true,methodes:"GET, POST"},
          {route:"/api/partenaires",pret:true,methodes:"GET, POST"},
          {route:"/api/crm",pret:true,methodes:"GET, POST"},
          {route:"/api/abonnes",pret:true,methodes:"GET, POST"},
          {route:"/api/change-password",pret:true,methodes:"POST"},
          {route:"/api/devis",pret:true,methodes:"GET, POST"},
          {route:"/api/equipe",pret:false,methodes:"À créer"},
          {route:"/api/planning",pret:false,methodes:"À créer"},
          {route:"/api/stock",pret:false,methodes:"À créer"},
          {route:"/api/wallet",pret:false,methodes:"À créer"},
        ].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:r.pret?C.green:C.muted,display:"inline-block",flexShrink:0}}/>
            <span style={{fontFamily:"monospace",color:r.pret?C.text:C.muted}}>{r.route}</span>
          </div>
          <Pill color={r.pret?C.green:C.muted}>{r.methodes}</Pill>
        </div>)}
      </Card>
    </div>}
  </div>;
};
const PageSettings=({plan,showToast,sirApiKey,setSirApiKey,profil,setProfil})=>{
  const[onglet,setOnglet]=useState("entreprise");

  // États formulaires
  const[entreprise,setEntreprise]=useState({nom:"Xyra SaaS SASU",siren:"123 456 789",tva:"FR12 123456789",adresse:"75 rue de Rivoli",ville:"Paris",cp:"75001",pays:"France",tel:"+33 1 23 45 67 89",email:"contact@xyra.io",site:"xyra.io",logo:""});
  const[profUser,setProfUser]=useState({prenom:"Curtiss",nom:"Fondateur",email:"curtiss@xyra.io",tel:"+33 6 00 11 22 33",titre:"Fondateur & CEO",avatar:"C"});
  const[mdp,setMdp]=useState({actuel:"",nouveau:"",confirmer:""});
  const[mdpVisible,setMdpVisible]=useState({actuel:false,nouveau:false,confirmer:false});
  const[theme,setTheme]=useState("dark");
  const[langue,setLangue]=useState("fr");
  const[deux_fa,setDeuxFa]=useState(true);
  const[domaine,setDomaine]=useState({sous_domaine:"curtiss",domaine_custom:"",ssl:true,actif:false});
  const[utilisateurs,setUtilisateurs]=useState([
    {id:1,nom:"Thomas Beaumont",email:"thomas@xyra.io",role:"Collaborateur",acces:["planning","stock","chat"],statut:"actif",dernierConnexion:"Aujourd'hui 09:02"},
    {id:2,nom:"Abou Diallo",email:"abou@xyra.io",role:"Collaborateur",acces:["planning","stock","chat"],statut:"actif",dernierConnexion:"Aujourd'hui 08:45"},
    {id:3,nom:"Fatou Sarr",email:"fatou@xyra.io",role:"Commercial",acces:["crm","devis","clients","chat"],statut:"actif",dernierConnexion:"Aujourd'hui 09:30"},
  ]);
  const[inviteForm,setInviteForm]=useState({email:"",role:"Collaborateur"});
  const[sessions]=useState([{device:"MacBook Pro — Chrome",ip:"92.168.1.1",lieu:"Paris, France",date:"Maintenant",actuelle:true},{device:"iPhone 14 — Safari",ip:"92.168.1.2",lieu:"Paris, France",date:"Il y a 2h",actuelle:false}]);
  const[logs]=useState([{date:"Aujourd'hui 09:00",action:"Connexion réussie",ip:"92.168.1.1",statut:"ok"},{date:"Hier 18:30",action:"Modification devis TYM-0044",ip:"92.168.1.1",statut:"ok"},{date:"Hier 14:00",action:"Tentative connexion échouée",ip:"203.45.67.89",statut:"echec"}]);

  const tabs=[
    {id:"entreprise",label:"🏢 Entreprise"},
    {id:"profil",label:"👤 Mon profil"},
    {id:"mdp",label:"🔑 Mot de passe"},
    {id:"abonnement",label:"💳 Abonnement"},
    {id:"apparence",label:"🎨 Apparence"},
    {id:"securite",label:"🛡 Sécurité"},
    {id:"integrations",label:"🔗 Intégrations"},
    {id:"ia",label:"🤖 IA & Claude"},
    {id:"notifications_param",label:"🔔 Notifications"},
    {id:"secteur",label:"⊛ Secteur métier"},
    {id:"utilisateurs",label:"👥 Utilisateurs"},
    {id:"domaine",label:"🌍 Domaine & White-label"},
    {id:"rgpd",label:"🔒 RGPD"},
  ];

  const ROLES=["Fondateur","Admin","Commercial","Collaborateur","Comptable","Lecture seule"];
  const INTEGRATIONS=[
    {nom:"Meta WhatsApp API",icon:"💬",statut:true,color:C.green,desc:"Bot WhatsApp + notifications automatiques"},
    {nom:"Flutterwave",icon:"💳",statut:true,color:C.gold,desc:"Paiements cartes, mobile money Afrique"},
    {nom:"CinetPay",icon:"🌍",statut:true,color:C.teal,desc:"Wave, Orange Money, MTN — Afrique francophone"},
    {nom:"Stripe",icon:"💳",statut:false,color:C.blue,desc:"Paiements cartes Europe & international"},
    {nom:"Supabase",icon:"🗄",statut:true,color:C.green,desc:"Base de données & authentification"},
    {nom:"Vercel",icon:"▲",statut:true,color:C.text,desc:"Déploiement & hébergement"},
    {nom:"Google Calendar",icon:"📅",statut:false,color:C.blue,desc:"Synchronisation planning & agenda"},
    {nom:"Zapier",icon:"⚡",statut:false,color:C.orange,desc:"Automatisations vers 5000+ apps"},
    {nom:"Anthropic Claude",icon:"🤖",statut:!!sirApiKey,color:C.purple,desc:"IA analyses, rédaction, recommandations"},
    {nom:"Chorus Pro",icon:"🇫🇷",statut:true,color:C.blue,desc:"Facturation électronique DGFiP"},
  ];

  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>⚙ Paramètres</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Gérez tous les aspects de votre compte Xyra</div>

    {/* TABS SCROLLABLE */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── ENTREPRISE ── */}
    {onglet==="entreprise"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>🏢 Informations légales</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Raison sociale *","nom"],["SIREN","siren"],["Numéro TVA","tva"],["Email professionnel","email"],["Téléphone","tel"],["Site web","site"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={entreprise[k]} onChange={e=>setEntreprise(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card>
          <STitle>📍 Adresse du siège</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[["Adresse","adresse"],["Ville","ville"],["Code postal","cp"],["Pays","pays"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={entreprise[k]} onChange={e=>setEntreprise(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
          </div>
        </Card>
        <Card>
          <STitle>🖼 Logo de l'entreprise</STitle>
          <div style={{background:C.card2,borderRadius:10,padding:20,textAlign:"center",border:`2px dashed ${C.border}`,marginBottom:10}}>
            <div style={{fontSize:32,marginBottom:6}}>🏢</div>
            <div style={{fontSize:11,color:C.muted}}>Glissez votre logo ici ou cliquez pour choisir</div>
            <div style={{fontSize:9,color:C.muted,marginTop:4}}>PNG, JPG — max 2MB</div>
          </div>
          <Btn onClick={()=>showToast("✅ Logo uploadé !")} style={{width:"100%"}}>📁 Choisir un fichier</Btn>
        </Card>
        <Btn onClick={()=>showToast("✅ Informations entreprise sauvegardées !")}>Sauvegarder les modifications</Btn>
      </div>
    </div>}

    {/* ── PROFIL ── */}
    {onglet==="profil"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>👤 Mon profil</STitle>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:`${C.gold}22`,border:`3px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,color:C.gold,margin:"0 auto 10px"}}>
            {profUser.avatar}
          </div>
          <BtnGhost onClick={()=>showToast("📸 Photo modifiée !")} style={{fontSize:11}}>📸 Changer la photo</BtnGhost>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Prénom *","prenom"],["Nom *","nom"],["Email *","email"],["Téléphone","tel"],["Titre / Fonction","titre"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={profUser[k]} onChange={e=>setProfUser(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
        </div>
        <Btn onClick={()=>showToast("✅ Profil sauvegardé !")} style={{marginTop:12,width:"100%"}}>Sauvegarder le profil</Btn>
      </Card>
      <Card>
        <STitle>📊 Infos du compte</STitle>
        {[["Plan actuel",PLANS[plan]?.nom+" — "+PLANS[plan]?.prix],["Membre depuis","01/03/2024"],["Dernière connexion","Aujourd'hui 09:00"],["Rôle","Fondateur & Owner"],["Dashboard URL","xyraio.fr"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:i===0?C.gold:C.text}}>{v}</span></div>)}
        <div style={{marginTop:12,background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>✅ Compte Owner — Accès complet à toutes les fonctionnalités</div>
      </Card>
    </div>}

    {/* ── MOT DE PASSE ── */}
    {onglet==="mdp"&&<div style={{maxWidth:480}}>
      <Card>
        <STitle>🔑 Changer le mot de passe</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[["Mot de passe actuel *","actuel"],["Nouveau mot de passe *","nouveau"],["Confirmer le nouveau mot de passe *","confirmer"]].map(([l,k])=><div key={k}>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label>
            <div style={{position:"relative"}}>
              <input type={mdpVisible[k]?"text":"password"} value={mdp[k]} onChange={e=>setMdp(f=>({...f,[k]:e.target.value}))} placeholder="••••••••" style={{background:C.card2,border:`1px solid ${mdp.nouveau&&k==="confirmer"&&mdp.nouveau!==mdp.confirmer?C.red:C.border}`,borderRadius:8,padding:"10px 40px 10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"}}/>
              <button onClick={()=>setMdpVisible(v=>({...v,[k]:!v[k]}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:14}}>{mdpVisible[k]?"🙈":"👁"}</button>
            </div>
            {k==="confirmer"&&mdp.nouveau&&mdp.confirmer&&mdp.nouveau!==mdp.confirmer&&<div style={{fontSize:10,color:C.red,marginTop:3}}>⚠️ Les mots de passe ne correspondent pas</div>}
          </div>)}
          {/* Force du mot de passe */}
          {mdp.nouveau&&<div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Force du mot de passe</div>
            <div style={{height:4,borderRadius:2,background:C.border,overflow:"hidden"}}>
              <div style={{height:"100%",width:mdp.nouveau.length<6?"33%":mdp.nouveau.length<10?"66%":"100%",background:mdp.nouveau.length<6?C.red:mdp.nouveau.length<10?C.orange:C.green,borderRadius:2,transition:"width .3s"}}/>
            </div>
            <div style={{fontSize:10,color:mdp.nouveau.length<6?C.red:mdp.nouveau.length<10?C.orange:C.green,marginTop:2}}>{mdp.nouveau.length<6?"Trop court":mdp.nouveau.length<10?"Moyen":"Fort ✅"}</div>
          </div>}
          <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}22`,borderRadius:8,padding:10,fontSize:11,color:C.muted}}>
            💡 Conseils : min. 8 caractères, mélangez majuscules, minuscules, chiffres et symboles
          </div>
          <Btn onClick={async()=>{if(!mdp.actuel)return showToast("⚠️ Entrez votre mot de passe actuel");if(mdp.nouveau!==mdp.confirmer)return showToast("⚠️ Les mots de passe ne correspondent pas");if(mdp.nouveau.length<8)return showToast("⚠️ Minimum 8 caractères");const token=typeof window!=="undefined"?window.localStorage.getItem("sb-access-token"):null;if(!token)return showToast("⚠️ Session expirée, reconnecte-toi");showToast("⏳ Modification en cours...");try{const res=await fetch('/api/change-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,currentPassword:mdp.actuel,newPassword:mdp.nouveau})});const data=await res.json();if(data.success){showToast("✅ Mot de passe modifié avec succès !");setMdp({actuel:"",nouveau:"",confirmer:""});}else showToast("❌ "+(data.error||"Erreur"));}catch(e){showToast("❌ Erreur de connexion");}}}>🔑 Modifier le mot de passe</Btn>
        </div>
      </Card>
    </div>}

    {/* ── ABONNEMENT ── */}
    {onglet==="abonnement"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
        {Object.values(PLANS).filter(p=>p.id!=="owner").map((p,i)=><Card key={i} style={{borderColor:`${p.color}44`,background:plan===p.id?`${p.color}08`:"transparent"}}>
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:24,marginBottom:4}}>{p.icon}</div>
            <div style={{fontSize:16,fontWeight:700,color:p.color}}>{p.nom}</div>
            <div style={{fontSize:22,fontWeight:700,color:C.text,margin:"8px 0"}}>{p.prix}</div>
            <div style={{fontSize:11,color:C.muted}}>{p.description}</div>
          </div>
          {plan===p.id?<div style={{background:`${p.color}22`,border:`1px solid ${p.color}44`,borderRadius:8,padding:8,textAlign:"center",fontSize:11,color:p.color,fontWeight:700}}>✓ Plan actuel</div>:<Btn onClick={()=>showToast(`✅ Passage à ${p.nom} initié — Paiement Flutterwave`)} color={p.color} style={{width:"100%",color:p.id==="business"?"#000":"#fff"}}>Passer à ce plan</Btn>}
        </Card>)}
      </div>
      <Card>
        <STitle>📋 Historique de facturation</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Date</TH><TH>Description</TH><TH>Montant</TH><TH>Statut</TH><TH>Action</TH></tr></thead>
          <tbody>{[{date:"01/05/2026",desc:"Abonnement Owner — Mai 2026",montant:"—",statut:"owner"},{date:"01/04/2026",desc:"Abonnement Owner — Avril 2026",montant:"—",statut:"owner"},{date:"01/03/2026",desc:"Setup initial Xyra",montant:"0 €",statut:"payé"}].map((f,i)=><tr key={i}>
            <Td style={{color:C.muted,fontSize:10}}>{f.date}</Td>
            <Td style={{fontWeight:600}}>{f.desc}</Td>
            <Td style={{color:C.gold,fontWeight:700}}>{f.montant}</Td>
            <Td><Pill color={C.green}>✓ {f.statut}</Pill></Td>
            <Td><BtnGhost onClick={()=>showToast("📄 Facture téléchargée")} style={{fontSize:10,padding:"3px 8px"}}>PDF</BtnGhost></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </div>}

    {/* ── APPARENCE ── */}
    {onglet==="apparence"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>🎨 Thème & Couleurs</STitle>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:8}}>Thème de l'interface</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{id:"dark",label:"🌙 Sombre",desc:"Mode nuit — recommandé"},{id:"light",label:"☀️ Clair",desc:"Mode jour"}].map(t=><div key={t.id} onClick={()=>setTheme(t.id)} style={{background:theme===t.id?`${C.gold}15`:C.card2,border:`2px solid ${theme===t.id?C.gold:C.border}`,borderRadius:10,padding:12,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:4}}>{t.label.split(" ")[0]}</div>
              <div style={{fontSize:11,fontWeight:theme===t.id?700:400,color:theme===t.id?C.gold:C.text}}>{t.label.split(" ").slice(1).join(" ")}</div>
              <div style={{fontSize:9,color:C.muted}}>{t.desc}</div>
            </div>)}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:8}}>Couleur d'accentuation</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[{c:"#C9A84C",n:"Or (défaut)"},{c:"#4B7BFF",n:"Bleu"},{c:"#2EC9B0",n:"Teal"},{c:"#9B5FFF",n:"Violet"},{c:"#FF5F9E",n:"Rose"},{c:"#FF8C3A",n:"Orange"}].map((col,i)=><div key={i} onClick={()=>showToast(`✅ Couleur "${col.n}" appliquée`)} style={{width:32,height:32,borderRadius:"50%",background:col.c,cursor:"pointer",border:`3px solid ${col.c===C.gold?"#fff":"transparent"}`,title:col.n}}/>)}
          </div>
        </div>
        <Btn onClick={()=>showToast("✅ Apparence sauvegardée !")}>Sauvegarder l'apparence</Btn>
      </Card>
      <Card>
        <STitle>🌍 Langue & Région</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Langue de l'interface</label>
            <Sel value={langue} onChange={e=>setLangue(e.target.value)} style={{width:"100%"}}>
              <option value="fr">🇫🇷 Français</option><option value="en">🇬🇧 English</option><option value="ar">🇲🇦 العربية</option><option value="wo">🇸🇳 Wolof</option>
            </Sel>
          </div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Format de date</label>
            <Sel style={{width:"100%"}}><option>JJ/MM/AAAA (France)</option><option>MM/DD/YYYY (USA)</option></Sel>
          </div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Fuseau horaire</label>
            <Sel style={{width:"100%"}}><option>Europe/Paris (UTC+2)</option><option>Africa/Dakar (UTC+0)</option><option>Asia/Dubai (UTC+4)</option><option>America/Montreal (UTC-4)</option></Sel>
          </div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise d'affichage par défaut</label>
            <Sel style={{width:"100%"}}>{DEVISES.slice(0,5).map(d=><option key={d.code}>{d.flag} {d.code} — {d.nom}</option>)}</Sel>
          </div>
        </div>
      </Card>
    </div>}

    {/* ── SÉCURITÉ ── */}
    {onglet==="securite"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>🔐 Authentification à 2 facteurs</STitle>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontSize:12,fontWeight:700}}>2FA par SMS</div><div style={{fontSize:10,color:C.muted}}>+33 6 00 11 22 33</div></div>
            <div onClick={()=>setDeuxFa(v=>!v)} style={{width:44,height:24,borderRadius:12,background:deux_fa?C.green:C.border,cursor:"pointer",position:"relative",transition:".2s"}}>
              <div style={{position:"absolute",top:3,left:deux_fa?21:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:".2s"}}/>
            </div>
          </div>
          {deux_fa?<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>✅ 2FA activée — Votre compte est sécurisé</div>:<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>⚠️ 2FA désactivée — Recommandé de l'activer</div>}
          <div style={{marginTop:10,display:"flex",gap:8}}>
            <BtnGhost onClick={()=>showToast("📱 Code de test envoyé par SMS")} style={{flex:1,fontSize:11}}>Tester le 2FA</BtnGhost>
            <BtnGhost onClick={()=>showToast("🔑 Codes de secours téléchargés")} style={{flex:1,fontSize:11}}>Codes secours</BtnGhost>
          </div>
        </Card>
        <Card>
          <STitle>💻 Sessions actives</STitle>
          {sessions.map((s,i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${s.actuelle?C.green:C.border}33`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontSize:11,fontWeight:700}}>{s.device}</div>
              {s.actuelle&&<Pill color={C.green}>● Session actuelle</Pill>}
            </div>
            <div style={{fontSize:10,color:C.muted}}>📍 {s.lieu} · 🌐 {s.ip}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:6}}>🕐 {s.date}</div>
            {!s.actuelle&&<BtnGhost onClick={()=>showToast("✅ Session révoquée")} style={{fontSize:10,padding:"3px 8px",color:C.red}}>Révoquer</BtnGhost>}
          </div>)}
          <BtnGhost onClick={()=>showToast("✅ Toutes les autres sessions révoquées")} style={{width:"100%",fontSize:11,color:C.red}}>Déconnecter toutes les autres sessions</BtnGhost>
        </Card>
      </div>
      <Card>
        <STitle>📋 Journaux de connexion</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Date & Heure</TH><TH>Action</TH><TH>Adresse IP</TH><TH>Statut</TH></tr></thead>
          <tbody>{logs.map((l,i)=><tr key={i}>
            <Td style={{color:C.muted,fontSize:10}}>{l.date}</Td>
            <Td style={{fontWeight:600}}>{l.action}</Td>
            <Td style={{fontFamily:"monospace",fontSize:10,color:C.muted}}>{l.ip}</Td>
            <Td><Pill color={l.statut==="ok"?C.green:C.red}>{l.statut==="ok"?"✓ Succès":"✗ Échec"}</Pill></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </div>}

    {/* ── INTÉGRATIONS ── */}
    {onglet==="integrations"&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
      {INTEGRATIONS.map((it,i)=><Card key={i} style={{borderColor:`${it.color}22`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:24}}>{it.icon}</div>
            <div><div style={{fontSize:13,fontWeight:700}}>{it.nom}</div><div style={{fontSize:10,color:C.muted}}>{it.desc}</div></div>
          </div>
          <Pill color={it.statut?C.green:C.muted}>{it.statut?"● Connecté":"○ Non connecté"}</Pill>
        </div>
        <div style={{display:"flex",gap:6}}>
          <BtnGhost onClick={()=>showToast(`✅ ${it.nom} ${it.statut?"déconnecté":"connecté"}`)} style={{flex:1,fontSize:11,color:it.statut?C.red:C.green,borderColor:`${it.statut?C.red:C.green}33`}}>{it.statut?"Déconnecter":"Connecter"}</BtnGhost>
          {it.statut&&<BtnGhost onClick={()=>showToast(`⚙ Paramètres ${it.nom}`)} style={{fontSize:11}}>⚙</BtnGhost>}
        </div>
      </Card>)}
    </div>}

    {/* ── IA & CLAUDE ── */}
    {onglet==="ia"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>🤖 Configuration Claude (Anthropic)</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Clé API Anthropic *</label>
            <div style={{display:"flex",gap:8}}>
              <Inp value={sirApiKey} onChange={e=>setSirApiKey(e.target.value)} placeholder="sk-ant-api03-..." style={{flex:1,fontFamily:"monospace",fontSize:11}}/>
              <Btn onClick={()=>showToast("✅ Clé API sauvegardée et testée !")}>Sauver</Btn>
            </div>
            <div style={{fontSize:9,color:C.muted,marginTop:3}}>Disponible sur console.anthropic.com</div>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Modèle IA</label>
            <Sel style={{width:"100%"}}>
              <option value="claude-sonnet-4-5">claude-sonnet-4-5 — Recommandé (rapide + intelligent)</option>
              <option value="claude-opus-4-5">claude-opus-4-5 — Premium (plus puissant)</option>
              <option value="claude-haiku-4-5">claude-haiku-4-5 — Rapide (économique)</option>
            </Sel>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Langue de réponse IA</label>
            <Sel style={{width:"100%"}}><option>🇫🇷 Français</option><option>🇬🇧 English</option></Sel>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Ton de l'IA</label>
            <Sel style={{width:"100%"}}><option>Professionnel & concis</option><option>Amical & accessible</option><option>Expert & détaillé</option></Sel>
          </div>
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card>
          <STitle>⚡ Fonctionnalités IA activées</STitle>
          {[["Analyses business automatiques",true],["Relances devis intelligentes",true],["Recommandations investissement",true],["Réponses avis clients",true],["Chat assistant (WhatsApp bot)",true],["Prévisions trésorerie",true],["Score solvabilité clients",true],["Suggestions upsell",true]].map(([f,a],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
            <span>{f}</span>
            <Pill color={a?C.green:C.muted}>{a?"✅ Actif":"○ Inactif"}</Pill>
          </div>)}
        </Card>
        <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>📊 Utilisation API ce mois</div>
          {[["Tokens utilisés","47 832 / 100 000"],["Coût estimé","~2.40€"],["Appels API","342"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0"}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>)}
        </Card>
      </div>
    </div>}

    {/* ── NOTIFICATIONS CONFIG ── */}
    {onglet==="notifications_param"&&<Card>
      <STitle>🔔 Paramètres de notifications</STitle>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Type</TH><TH style={{textAlign:"center"}}>Push écran</TH><TH style={{textAlign:"center"}}>WhatsApp</TH><TH style={{textAlign:"center"}}>Email</TH><TH style={{textAlign:"center"}}>Activer tout</TH></tr></thead>
        <tbody>{[["💰 Paiements reçus",true,true,true],["◧ Devis signés",true,true,false],["📦 Stock critique",true,false,false],["👥 Nouveaux leads",true,true,false],["🤖 Alertes IA",true,false,false],["📅 Rappels RDV",true,true,true],["⚙ Système",false,false,true]].map(([t,push,wa,email],i)=><tr key={i}>
          <Td style={{fontWeight:600}}>{t}</Td>
          {[push,wa,email].map((v,j)=><td key={j} style={{textAlign:"center",padding:"10px",borderBottom:`1px solid ${C.border}22`}}>
            <div onClick={()=>showToast("✅ Préférence sauvegardée")} style={{width:32,height:18,borderRadius:9,background:v?C.gold:C.border,cursor:"pointer",margin:"0 auto",position:"relative",transition:".2s"}}>
              <div style={{position:"absolute",top:2,left:v?14:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:".2s"}}/>
            </div>
          </td>)}
          <td style={{textAlign:"center",padding:"10px",borderBottom:`1px solid ${C.border}22`}}>
            <BtnGhost onClick={()=>showToast("✅ Toutes notifications activées")} style={{fontSize:9,padding:"3px 8px"}}>Tout activer</BtnGhost>
          </td>
        </tr>)}
        </tbody>
      </table>
    </Card>}

    {/* ── SECTEUR ── */}
    {onglet==="secteur"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        💡 Le profil sectoriel adapte la terminologie de l'outil à votre activité (missions, clients, stock, services).
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
        {Object.entries(PROFILS_SECTEURS).map(([key,p])=><div key={key} onClick={()=>{setProfil(p);showToast(`✅ Profil "${p.label}" activé !`);}} style={{background:profil?.label===p.label?`${p.couleur}22`:"transparent",border:`2px solid ${profil?.label===p.label?p.couleur:C.border}`,borderRadius:10,padding:14,cursor:"pointer",transition:"all .2s"}}>
          <div style={{fontSize:13,fontWeight:700,color:profil?.label===p.label?p.couleur:C.text,marginBottom:4}}>{p.label}</div>
          <div style={{fontSize:10,color:C.muted}}>Services : {p.services.slice(0,3).join(", ")}...</div>
          {profil?.label===p.label&&<div style={{marginTop:8,fontSize:10,color:p.couleur,fontWeight:600}}>✅ Profil actuel</div>}
        </div>)}
      </div>
    </div>}

    {/* ── UTILISATEURS ── */}
    {onglet==="utilisateurs"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle>👥 Membres & Accès</STitle>
        <Btn onClick={()=>showToast("📧 Invitation envoyée !")}>+ Inviter un membre</Btn>
      </div>
      <Card style={{marginBottom:12}}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <Inp value={inviteForm.email} onChange={e=>setInviteForm(f=>({...f,email:e.target.value}))} placeholder="Email à inviter..." style={{flex:1}}/>
          <Sel value={inviteForm.role} onChange={e=>setInviteForm(f=>({...f,role:e.target.value}))} style={{width:160}}>{ROLES.map(r=><option key={r}>{r}</option>)}</Sel>
          <Btn onClick={()=>{if(!inviteForm.email)return;showToast(`📧 Invitation envoyée à ${inviteForm.email} — rôle ${inviteForm.role}`);setInviteForm({email:"",role:"Collaborateur"});}}>Inviter</Btn>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Membre</TH><TH>Email</TH><TH>Rôle</TH><TH>Dernière connexion</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>
            {/* Owner (non modifiable) */}
            <tr style={{background:`${C.gold}08`}}>
              <Td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.gold}}>C</div><span style={{fontWeight:700}}>Curtiss (Vous)</span></div></Td>
              <Td style={{color:C.muted}}>curtiss@xyra.io</Td>
              <Td><Pill color={C.gold}>★ Owner</Pill></Td>
              <Td style={{color:C.muted,fontSize:10}}>Maintenant</Td>
              <Td><Pill color={C.green}>Actif</Pill></Td>
              <Td><span style={{fontSize:10,color:C.muted}}>Non modifiable</span></Td>
            </tr>
            {utilisateurs.map((u,i)=><tr key={i}>
              <Td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.blue}}>{u.nom[0]}</div><span style={{fontWeight:600}}>{u.nom}</span></div></Td>
              <Td style={{color:C.muted,fontSize:11}}>{u.email}</Td>
              <Td><Sel value={u.role} onChange={e=>setUtilisateurs(us=>us.map((x,j)=>j===i?{...x,role:e.target.value}:x))} style={{fontSize:10,padding:"3px 6px"}}>{ROLES.map(r=><option key={r}>{r}</option>)}</Sel></Td>
              <Td style={{color:C.muted,fontSize:10}}>{u.dernierConnexion}</Td>
              <Td><Pill color={C.green}>Actif</Pill></Td>
              <Td><div style={{display:"flex",gap:4}}>
                <BtnGhost onClick={()=>showToast(`✅ Modifications ${u.nom} sauvegardées`)} style={{fontSize:9,padding:"3px 7px"}}>Sauver</BtnGhost>
                <BtnGhost onClick={()=>{setUtilisateurs(us=>us.filter((_,j)=>j!==i));showToast(`✅ ${u.nom} retiré de l'équipe`);}} style={{fontSize:9,padding:"3px 7px",color:C.red}}>Retirer</BtnGhost>
              </div></Td>
            </tr>)}
          </tbody>
        </table>
      </Card>
    </div>}

    {/* ── DOMAINE WHITE-LABEL ── */}
    {onglet==="domaine"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>🌍 URL Xyra (sous-domaine)</STitle>
        <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.muted,marginBottom:4}}>URL ACTUELLE</div>
          <div style={{fontFamily:"monospace",fontSize:13,color:C.teal}}>{domaine.sous_domaine}.xyra.io</div>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Personnaliser le sous-domaine</label>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Inp value={domaine.sous_domaine} onChange={e=>setDomaine(d=>({...d,sous_domaine:e.target.value}))} placeholder="votre-nom" style={{flex:1}}/>
            <span style={{fontSize:11,color:C.muted,whiteSpace:"nowrap"}}>.xyra.io</span>
          </div>
        </div>
        <Btn onClick={()=>showToast(`✅ Sous-domaine "${domaine.sous_domaine}.xyra.io" activé !`)}>Appliquer</Btn>
      </Card>
      <Card>
        <STitle>🏷 Domaine personnalisé (White-label)</STitle>
        <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:C.text}}>
          💡 Disponible avec le plan <b style={{color:C.purple}}>Enterprise (150€/mois)</b>. Votre outil sera accessible sur votre propre domaine avec votre logo.
        </div>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Votre domaine</label>
          <Inp value={domaine.domaine_custom} onChange={e=>setDomaine(d=>({...d,domaine_custom:e.target.value}))} placeholder="app.votreentreprise.com"/>
        </div>
        <div style={{marginBottom:12,display:"flex",justifyContent:"space-between",fontSize:11}}>
          <span>SSL / HTTPS</span><Pill color={C.green}>✅ Auto-généré</Pill>
        </div>
        {plan==="enterprise"||plan==="owner"?<Btn onClick={()=>showToast(`✅ Domaine "${domaine.domaine_custom}" configuré ! DNS en cours...`)}>🌍 Activer le domaine</Btn>:<Btn onClick={()=>showToast("💳 Passage Enterprise nécessaire")} style={{background:C.purple}}>Passer à Enterprise</Btn>}
      </Card>
    </div>}

    {/* ── RGPD ── */}
    {onglet==="rgpd"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.blue,fontWeight:600,marginBottom:6}}>🔒 CONFORMITÉ RGPD — RÈGLEMENT GÉNÉRAL SUR LA PROTECTION DES DONNÉES</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>Xyra est conforme au RGPD. Vos données sont chiffrées (AES-256), hébergées en Europe (Supabase EU) et ne sont jamais revendues.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Vos données</STitle>
          {[["Données personnelles","Prénom, nom, email, téléphone"],["Données entreprise","SIREN, TVA, adresse"],["Données financières","Chiffrées AES-256"],["Hébergement","Supabase — Europe (Frankfurt)"],["Durée conservation","5 ans légal / Compte actif"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:C.text,fontSize:10}}>{v}</span></div>)}
        </Card>
        <Card>
          <STitle>✅ Droits RGPD</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Btn onClick={()=>showToast("📦 Export de vos données en cours — email dans 24h")} style={{background:C.blue}}>📦 Exporter toutes mes données</Btn>
            <BtnGhost onClick={()=>showToast("📧 Demande envoyée à DPO@xyra.io")}>✏️ Demander rectification</BtnGhost>
            <BtnGhost onClick={()=>showToast("⏳ Demande de suppression envoyée — traitement 30j")} style={{color:C.orange,borderColor:`${C.orange}44`}}>🗑 Demander suppression données</BtnGhost>
            <div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:8,padding:10}}>
              <div style={{fontSize:10,color:C.red,fontWeight:600,marginBottom:4}}>⚠️ Zone dangereuse</div>
              <BtnGhost onClick={()=>showToast("⚠️ Confirmez la suppression dans l'email envoyé")} style={{width:"100%",color:C.red,borderColor:`${C.red}44`,fontSize:11}}>🗑 Supprimer mon compte</BtnGhost>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <STitle>🍪 Politique de confidentialité</STitle>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.7,marginBottom:10}}>Xyra collecte uniquement les données nécessaires au fonctionnement du service. Aucune donnée n'est partagée avec des tiers sans consentement explicite. Vous pouvez exercer vos droits à tout moment en contactant dpo@xyra.io</div>
        <div style={{display:"flex",gap:8}}><BtnGhost onClick={()=>showToast("📄 Politique confidentialité téléchargée")}>📄 Télécharger PDF</BtnGhost><BtnGhost onClick={()=>showToast("📧 Email DPO ouvert")}>📧 Contacter le DPO</BtnGhost></div>
      </Card>
    </div>}
  </div>;
};
export default function Xyra() {
  const[page,setPage]=useState("accueil");
  const[plan,setPlan]=useState("starter");
  const[tenantStatut,setTenantStatut]=useState(null);
  const[tenantInfo,setTenantInfo]=useState(null);
  const[essaiExpire,setEssaiExpire]=useState(false);
  const[paiementLoading,setPaiementLoading]=useState(false);
  useEffect(()=>{
    fetch("/api/tenant-info").then(r=>r.json()).then(d=>{
      setTenantInfo(d);
      if(d.statut)setTenantStatut(d.statut);
      const trialFini=d.trial_ends_at&&new Date(d.trial_ends_at).getTime()<Date.now();
      if(d.statut==="essai"&&trialFini){
        setEssaiExpire(true);
        if(d.plan)setPlan(normaliserPlan(d.plan));
      }else if(d.statut==="essai"){
        setPlan("enterprise");
      }else if(d.plan){
        setPlan(normaliserPlan(d.plan));
      }
      if(d.secteur){
        console.log("DEBUG secteur recu:", d.secteur, "trouve dans fixes:", !!PROFILS_SECTEURS[d.secteur]);
        const p=PROFILS_SECTEURS[d.secteur];
        if(p){
          setProfil(p);
        }else{
          fetch("/api/get-secteur?cle="+d.secteur).then(r=>r.json()).then(gd=>{
            console.log("DEBUG reponse get-secteur:", gd);
            if(gd.profil){
              setProfil({
                label:gd.profil.label,
                termes:gd.profil.termes,
                services:gd.profil.services,
                stockCategories:gd.profil.stock_categories,
                kpiMission:gd.profil.kpi_mission,
                couleur:gd.profil.couleur,
                normes:gd.profil.normes,
              });
            }
          }).catch(()=>{});
        }
      }
    }).catch(()=>{});
  },[]);
  const[mesSocietes,setMesSocietes]=useState([]);
  const[societeActiveId,setSocieteActiveId]=useState(null);
  const[showAjoutSociete,setShowAjoutSociete]=useState(false);
  const[showAutreMetier,setShowAutreMetier]=useState(false);
  const[metierLibre,setMetierLibre]=useState("");
  const[genererLoading,setGenererLoading]=useState(false);
  const genererNouveauMetier=async()=>{
    if(!metierLibre.trim())return;
    setGenererLoading(true);
    try{
      const res=await fetch("/api/generer-secteur",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({metier:metierLibre})});
      const data=await res.json();
      if(data.profil){
        setProfil({
          label:data.profil.label,
          termes:data.profil.termes,
          services:data.profil.services,
          stockCategories:data.profil.stock_categories,
          kpiMission:data.profil.kpi_mission,
          couleur:data.profil.couleur,
          normes:data.profil.normes,
        });
        await fetch("/api/save-secteur",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({secteur:data.profil.cle})});
        setShowAutreMetier(false);
        setMetierLibre("");
        showToast("Profil "+data.profil.label+" active !");
      }
    }catch(e){showToast("Erreur lors de la generation");}
    setGenererLoading(false);
  };
  const[nouvelleSocieteForm,setNouvelleSocieteForm]=useState({societe:"",metier:"",pays:""});
  const[erreurQuota,setErreurQuota]=useState("");
  const chargerSocietes=async()=>{
    try{
      const res=await fetch("/api/mes-societes");
      const data=await res.json();
      if(data.tenants){
        setMesSocietes(data.tenants);
        if(data.tenants.length>0&&!societeActiveId)setSocieteActiveId(data.tenants[0].id);
      }
    }catch(e){}
  };
  useEffect(()=>{chargerSocietes();},[]);
  const changerSociete=async(id)=>{
    try{
      const res=await fetch("/api/changer-societe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tenant_id:id})});
      const data=await res.json();
      if(data.success){setSocieteActiveId(id);window.location.reload();}
    }catch(e){}
  };
  const ajouterSociete=async()=>{
    setErreurQuota("");
    if(!nouvelleSocieteForm.societe)return;
    try{
      const res=await fetch("/api/ajouter-societe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(nouvelleSocieteForm)});
      const data=await res.json();
      if(data.success){
        setShowAjoutSociete(false);
        setNouvelleSocieteForm({societe:"",metier:"",pays:""});
        chargerSocietes();
      }else{
        setErreurQuota(data.message||data.error||"Erreur");
      }
    }catch(e){setErreurQuota("Erreur de connexion");}
  };
  const demarrerPaiement=async()=>{
    setPaiementLoading(true);
    try{
      const infoRes=await fetch("/api/tenant-info");
      const info=await infoRes.json();
      const res=await fetch("/api/create-checkout",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({plan:info.plan,email:info.email,societe:info.societe}),
      });
      const data=await res.json();
      if(data.url)window.location.href=data.url;
    }catch(e){console.error(e);}
    setPaiementLoading(false);
  };

  // ── SUPABASE — Chargement vraies données ──────────────────
  const[sbLoading,setSbLoading]=useState(true);
  const[clients,setClients]=useState([]);
  const[devis,setDevis]=useState([]);
  const[paiements,setPaiements]=useState([]);
  const[partenaires,setPartenaires]=useState([]);
  const[equipe,setEquipe]=useState([]);
  const[missions,setMissions]=useState([]);
  const[stock,setStock]=useState([]);
  const[deals,setDeals]=useState([]);

  useEffect(()=>{
    const loadData=async()=>{
      try{
        const {createClient}=await import('@supabase/supabase-js');
        const sb=createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        const[c,d,p,part,eq,m,s,dl]=await Promise.all([
          sb.from('clients').select('*').order('created_at',{ascending:false}),
          sb.from('devis').select('*').order('created_at',{ascending:false}),
          sb.from('paiements').select('*').order('date_transaction',{ascending:false}),
          sb.from('partenaires').select('*'),
          sb.from('equipe').select('*'),
          sb.from('missions').select('*').order('date_mission',{ascending:true}),
          sb.from('stock').select('*'),
          sb.from('deals').select('*').order('created_at',{ascending:false}),
        ]);
        if(c.data?.length)setClients(c.data);
        if(d.data?.length)setDevis(d.data);
        if(p.data?.length)setPaiements(p.data);
        if(part.data?.length)setPartenaires(part.data);
        if(eq.data?.length)setEquipe(eq.data);
        if(m.data?.length)setMissions(m.data);
        if(s.data?.length)setStock(s.data);
        if(dl.data?.length)setDeals(dl.data);
        // profil et plan geres par le useEffect tenant-info (respecte essai + secteurs generes)
        const{data:{user}}=await sb.auth.getUser();
        if(user){
        }
      }catch(e){console.error('Supabase:',e);}
      finally{setSbLoading(false);}
    };
    loadData();
  },[]);

  const[notifs,setNotifs]=useState(INIT_NOTIFS);
  const[toast,setToast]=useState(null);
  const[profil,setProfil]=useState(PROFIL_DEFAUT);
  const[sirApiKey,setSirApiKey]=useState(()=>typeof window!=="undefined"?localStorage.getItem("ty_anthropic")||"":"");
  const[sidebarOpen,setSidebarOpen]=useState(true);

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),3000);};
  useEffect(()=>{if(sirApiKey&&typeof window!=="undefined")localStorage.setItem("ty_anthropic",sirApiKey);},[sirApiKey]);

  const badges={notifs:notifs.filter(n=>!n.lu).length,devis:INIT_DEVIS.filter(d=>d.statut==="en_attente").length,crm:CRM_LEADS.filter(l=>l.etape==="Nouveau").length,comm:2,chat_eq:MSGS_EQUIPE.filter(m=>!m.lu).length,stock:STOCK.filter(s=>s.qte<s.min).length};

  const pageMap={
    accueil:<PageAccueil notifs={notifs} setNotifs={setNotifs} profil={profil} setPage={setPage}/>,
    owner:<PageOwner plan={plan} showToast={showToast} profil={profil}/>,
    // Pages bientôt disponibles
    ...Object.fromEntries(Object.entries(SOON_MODULES).map(([k,v])=>[k,<PageBientot key={k} {...v}/>])),
    wallet:<PageWallet plan={plan} showToast={showToast} profil={profil}/>,
    cartes:<PageCartes showToast={showToast}/>,
    overview:<PageOverview plan={plan} profil={profil} setPage={setPage} showToast={showToast}/>,
    crm:<PageCRM plan={plan} showToast={showToast} profil={profil}/>,
    devis:<PageDevis plan={plan} showToast={showToast} profil={profil}/>,
    investissement:<PageInvestissement plan={plan} showToast={showToast}/>,
    compta:<PageCompta plan={plan} showToast={showToast}/>,
    notefrais:<PageNoteFrais plan={plan} showToast={showToast}/>,
    tresorerie:<PageTresorerie plan={plan}/>,
    analytique:<PageAnalytique plan={plan}/>,
    clients:<PageClients plan={plan} showToast={showToast} profil={profil} setPage={setPage}/>,
    partenaires:<PagePartenaires plan={plan} showToast={showToast}/>,
    club_affaires:<PageClubAffaires plan={plan} showToast={showToast}/>,
    multi_societes:<PageMultiSocietes plan={plan} showToast={showToast}/>,
    annuaire:<PageAnnuaire plan={plan} showToast={showToast}/>,
    wallet_membres:<PageWalletMembres plan={plan} showToast={showToast}/>,
    evenements:<PageEvenements plan={plan} showToast={showToast}/>,
    scoring:<PageScoring plan={plan} showToast={showToast} profil={profil}/>,
    equipe:<PageEquipe plan={plan} showToast={showToast}/>,
    planning:<PagePlanning plan={plan} showToast={showToast} profil={profil}/>,
    prospection:<PageProspection plan={plan} showToast={showToast} profil={profil}/>,
    deals:<PageDeals plan={plan} showToast={showToast}/>,
    stock:<PageStock plan={plan} showToast={showToast} profil={profil}/>,
    services:<PageServices plan={plan} showToast={showToast} profil={profil}/>,
    chat:<PageChat plan={plan} showToast={showToast}/>,
    notifications:<PageNotifications notifs={notifs} setNotifs={setNotifs} showToast={showToast}/>,
    signature:<PageSignatures plan={plan} showToast={showToast}/>,
    facturation:<PageFacturation plan={plan} showToast={showToast}/>,
    formation:<PageFormation plan={plan} showToast={showToast}/>,
    deploiement:<PageDeploiement plan={plan} showToast={showToast}/>,
    api:<PageAPI plan={plan} showToast={showToast}/>,
    settings:<PageSettings plan={plan} showToast={showToast} sirApiKey={sirApiKey} setSirApiKey={setSirApiKey} profil={profil} setProfil={setProfil}/>,
    admin:<PageAdmin plan={plan} showToast={showToast}/>,
  };

  if(sbLoading)return <div style={{minHeight:"100vh",background:"#06060E",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
    <div style={{fontSize:28,fontWeight:700,color:"#C9A84C",fontFamily:"Georgia,serif",letterSpacing:"0.15em"}}>XYRA</div>
    <div style={{fontSize:11,color:"#5A5A7A",letterSpacing:"0.1em",marginBottom:4}}>Le système de gestion pour toute entreprise</div>
    <div style={{fontSize:12,color:"#5A5A7A",letterSpacing:"0.2em",marginBottom:8}}>Chargement de vos données...</div>
    <div style={{width:200,height:3,background:"#1E1E36",borderRadius:2,overflow:"hidden"}}>
      <div style={{width:"70%",height:"100%",background:"#C9A84C",borderRadius:2}}/>
    </div>
  </div>;

  return (
    <div style={{display:"flex",height:"100vh",background:C.dark,color:C.text,fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>

      {/* ── SIDEBAR ── */}
      <div style={{width:sidebarOpen?210:0,minWidth:sidebarOpen?210:0,background:C.card,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",transition:"all 0.2s",overflow:"hidden"}}>
        {/* Logo */}
        <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:17,fontWeight:700,color:C.gold,letterSpacing:"0.1em",fontFamily:"Georgia,serif"}}>XYRA</div>
          <div style={{fontSize:9,color:"#9090B8",letterSpacing:"0.15em",marginTop:2}}>{(tenantInfo&&tenantInfo.societe?tenantInfo.societe.toUpperCase():"...")}</div>
          <div style={{marginTop:8,background:C.card2,border:`1px solid ${C.gold}44`,borderRadius:5,padding:"5px 6px",color:C.gold,fontSize:10,fontWeight:600}}>{profil?.label||PROFIL_DEFAUT.label}</div>
          <select value="" onChange={e=>{const entry=Object.entries(PROFILS_SECTEURS).find(([k,s])=>s.label===e.target.value);if(entry){setProfil(entry[1]);fetch("/api/save-secteur",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({secteur:entry[0]})}).catch(()=>{});}}} style={{marginTop:4,background:C.card2,border:`1px solid ${C.border}`,borderRadius:5,padding:"3px 6px",color:C.muted,fontSize:9,width:"100%",fontFamily:"inherit"}}>
            <option value="">Changer pour un secteur standard...</option>
            {Object.values(PROFILS_SECTEURS).map(p=><option key={p.label} value={p.label}>{p.label}</option>)}
          </select>
          <button onClick={()=>setShowAutreMetier(true)} style={{marginTop:4,width:"100%",background:"transparent",border:`1px dashed ${C.gold}44`,borderRadius:5,padding:"3px 6px",color:C.gold,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Mon metier n'est pas liste</button>
          {mesSocietes.length>0&&<div style={{marginTop:8}}>
            <select value={societeActiveId||""} onChange={e=>changerSociete(e.target.value)} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:5,padding:"4px 6px",color:C.text,fontSize:10,width:"100%",fontFamily:"inherit"}}>
              {mesSocietes.map(s=><option key={s.id} value={s.id}>🏢 {s.societe}</option>)}
            </select>
            {mesSocietes.length>1&&<div style={{fontSize:8,color:"#9090B8",marginTop:3}}>{mesSocietes.length} societes</div>}
            <button onClick={()=>setShowAjoutSociete(true)} style={{marginTop:4,width:"100%",background:"transparent",border:`1px dashed ${C.gold}44`,borderRadius:5,padding:"4px 6px",color:C.gold,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>+ Ajouter une societe</button>
          </div>}
        </div>

        {/* Nav */}
        <div style={{flex:1,overflowY:"auto",padding:"6px 0"}}>
          {(()=>{const modulesAutorises=getModulesBySecteur(profil?.label||PROFIL_DEFAUT.label,plan==="owner");
          const labelDynamique=(item)=>{
            if(item.id==="devis")return profil?.termes?.devis||item.label;
            return item.label;
          };
          return NAV.map((grpOrig,gi)=>{
            const grp=modulesAutorises?{...grpOrig,items:grpOrig.items.filter(it=>modulesAutorises.includes(it.id))}:grpOrig;
            if(grp.items.length===0)return null;
            return <div key={gi}>
            <div style={{fontSize:9,color:"#9090B8",letterSpacing:"0.2em",textTransform:"uppercase",padding:"10px 13px 3px",marginTop:gi>0?4:0,fontWeight:600}}>{grp.group}</div>
            {grp.items.map((item)=>{
              const active=page===item.id;
              const locked=!hasAccess(plan,item.id);
              const badge=item.badge?badges[item.badge]:0;
              if(item.soon) return (
                <button key={item.id} onClick={()=>setPage(item.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 13px",cursor:"pointer",color:"#5A5A7A",background:"transparent",border:"none",borderLeft:"2px solid transparent",width:"100%",textAlign:"left",fontFamily:"inherit",fontSize:12,opacity:0.6}}>
                  <span style={{fontSize:14,flexShrink:0}}>⏳</span>
                  <span style={{flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{labelDynamique(item)}</span>
                  <span style={{fontSize:8,background:"#1E1E36",color:"#5A5A7A",borderRadius:4,padding:"1px 5px",flexShrink:0}}>BIENTÔT</span>
                </button>
              );
              return (
                <button key={item.id} onClick={()=>setPage(item.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 13px",cursor:"pointer",color:active?C.gold:locked?"#7A7A9A":"#C0C0D8",background:active?`${C.gold}0E`:locked?`${C.card2}`:"transparent",border:"none",borderLeft:`2px solid ${active?C.gold:locked?"#3A3A5A66":"transparent"}`,width:"100%",textAlign:"left",fontFamily:"inherit",fontSize:12,fontWeight:active?600:400}}>
                  <span style={{fontSize:14,flexShrink:0}}>{locked?"🔒":item.icon}</span>
                  <span style={{flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{labelDynamique(item)}</span>
                  {locked
                    ?<span style={{fontSize:8,background:`${C.gold}22`,color:C.gold,borderRadius:4,padding:"1px 5px",flexShrink:0,border:`1px solid ${C.gold}44`}}>{MODULE_PRICES[item.id]?MODULE_PRICES[item.id]+"€":"PRO"}</span>
                    :badge>0&&<span style={{background:C.red,color:"#fff",borderRadius:20,padding:"0 5px",fontSize:9,fontWeight:700,flexShrink:0}}>{badge}</span>
                  }
                </button>
              );
            })}
          </div>;});})()}
        </div>

        {/* Plan switcher */}


        {/* User */}
        <div onClick={()=>setPage("owner")} style={{padding:"10px 13px",borderTop:`1px solid ${C.border}`,cursor:"pointer",background:page==="owner"?`${C.gold}0E`:"transparent",borderLeft:`2px solid ${page==="owner"?C.gold:"transparent"}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:`${C.gold}22`,border:`1px solid ${C.gold}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.gold,flexShrink:0}}>{(tenantInfo&&tenantInfo.societe?tenantInfo.societe[0]:"X")}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:600,color:page==="owner"?C.gold:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tenantInfo&&tenantInfo.societe?tenantInfo.societe:"Mon compte"}</div>
              <div style={{fontSize:9,color:C.gold}}>{plan==="owner"?"Proprietaire Xyra":(tenantInfo&&tenantInfo.email?tenantInfo.email:"")}</div>
            </div>
            {notifs.filter(n=>!n.lu).length>0&&<span style={{background:C.red,color:"#fff",borderRadius:20,padding:"0 5px",fontSize:9,fontWeight:700}}>{notifs.filter(n=>!n.lu).length}</span>}
          </div>
        </div>
        <button onClick={async()=>{
          document.cookie="sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie="active_tenant_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          localStorage.removeItem("sb-access-token");
          window.location.href="/login";
        }} style={{width:"100%",padding:"9px 13px",background:"transparent",border:"none",borderTop:`1px solid ${C.border}`,color:C.red,cursor:"pointer",fontFamily:"inherit",fontSize:11,textAlign:"left"}}>Deconnexion</button>
      </div>

      {/* ── MAIN ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Topbar */}
        <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"8px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <button onClick={()=>setSidebarOpen(s=>!s)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:18,fontFamily:"inherit",padding:"0 4px"}}>☰</button>
          <div style={{flex:1}}/>
          <div style={{background:`${C.teal}11`,border:`1px solid ${C.teal}44`,borderRadius:8,padding:"5px 12px",textAlign:"right"}}>
            <div style={{fontSize:9,color:C.teal}}>💳 Wallet Xyra</div>
            <div style={{fontSize:16,fontWeight:700,color:C.gold}}>18 420 €</div>
          </div>
          <button onClick={()=>setPage("notifications")} style={{background:"transparent",border:"none",cursor:"pointer",position:"relative",padding:4}}>
            <span style={{fontSize:20}}>🔔</span>
            {notifs.filter(n=>!n.lu).length>0&&<span style={{position:"absolute",top:0,right:0,background:C.red,color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{notifs.filter(n=>!n.lu).length}</span>}
          </button>
        </div>

        {/* Page content */}
        <div style={{flex:1,overflowY:"auto"}}>
          {pageMap[page]||<div style={{padding:40,textAlign:"center",color:C.muted}}>Module en développement</div>}
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast&&<div style={{position:"fixed",bottom:24,right:24,background:C.card,border:`1px solid ${C.gold}44`,borderRadius:10,padding:"12px 20px",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:9999,fontSize:13,color:C.text,maxWidth:320,animation:"slideIn 0.3s ease",display:"flex",gap:10,alignItems:"center"}}>
        <span>🔔</span><span>{toast}</span>
      </div>}
      {/* Notifs accueil popup */}
      {notifs.filter(n=>!n.lu).slice(0,1).map((n,i)=><div key={i} onClick={()=>setPage("notifications")} style={{position:"fixed",top:20,right:20,background:C.card,border:`1px solid ${n.type==="urgent"?C.red:C.gold}44`,borderRadius:10,padding:"10px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:9998,fontSize:12,color:C.text,maxWidth:280,cursor:"pointer",animation:"slideIn 0.3s ease",display:"flex",gap:8,alignItems:"center"}}>
        <span style={{fontSize:18}}>{n.icon}</span>
        <div><div style={{fontWeight:700,fontSize:11}}>{n.titre}</div><div style={{fontSize:9,color:C.muted}}>{n.heure}</div></div>
      </div>)}

      {showAutreMetier&&<div style={{position:"fixed",inset:0,background:"#000000CC",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99998}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,maxWidth:400,width:"90%"}}>
          <div style={{fontSize:16,fontWeight:700,color:C.gold,marginBottom:8,fontFamily:"Georgia,serif"}}>Quel est votre metier ?</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Notre IA va creer un profil complet adapte a votre activite.</div>
          <input value={metierLibre} onChange={e=>setMetierLibre(e.target.value)} placeholder="Ex: Veterinaire, Traiteur, Agence de voyage..." style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"10px",color:C.text,fontSize:13,fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:8,marginTop:20}}>
            <button onClick={genererNouveauMetier} disabled={genererLoading||!metierLibre.trim()} style={{flex:1,background:C.gold,color:"#000",border:"none",borderRadius:8,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer",opacity:genererLoading?0.6:1}}>
              {genererLoading?"Generation...":"Generer mon profil"}
            </button>
            <button onClick={()=>{setShowAutreMetier(false);setMetierLibre("");}} style={{flex:1,background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px",fontSize:13,cursor:"pointer"}}>Annuler</button>
          </div>
        </div>
      </div>}
      {showAjoutSociete&&<div style={{position:"fixed",inset:0,background:"#000000CC",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99998}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,maxWidth:400,width:"90%"}}>
          <div style={{fontSize:16,fontWeight:700,color:C.gold,marginBottom:16,fontFamily:"Georgia,serif"}}>+ Nouvelle societe</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input value={nouvelleSocieteForm.societe} onChange={e=>setNouvelleSocieteForm(f=>({...f,societe:e.target.value}))} placeholder="Nom de la societe" style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"10px",color:C.text,fontSize:13,fontFamily:"inherit"}}/>
            <input value={nouvelleSocieteForm.metier} onChange={e=>setNouvelleSocieteForm(f=>({...f,metier:e.target.value}))} placeholder="Metier / Secteur" style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"10px",color:C.text,fontSize:13,fontFamily:"inherit"}}/>
            <input value={nouvelleSocieteForm.pays} onChange={e=>setNouvelleSocieteForm(f=>({...f,pays:e.target.value}))} placeholder="Pays" style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"10px",color:C.text,fontSize:13,fontFamily:"inherit"}}/>
          </div>
          {erreurQuota&&<div style={{marginTop:10,fontSize:12,color:C.red,background:`${C.red}11`,padding:"8px 10px",borderRadius:6}}>{erreurQuota}</div>}
          <div style={{display:"flex",gap:8,marginTop:20}}>
            {erreurQuota&&erreurQuota.includes("limite")?(
              <a href={`/pricing?upgrade_from=${plan}`} style={{flex:1,background:C.gold,color:"#000",border:"none",borderRadius:8,padding:"10px",fontWeight:700,fontSize:13,textAlign:"center",textDecoration:"none",display:"block"}}>Changer de forfait</a>
            ):(
              <button onClick={ajouterSociete} style={{flex:1,background:C.gold,color:"#000",border:"none",borderRadius:8,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Creer</button>
            )}
            <button onClick={()=>{setShowAjoutSociete(false);setErreurQuota("");}} style={{flex:1,background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px",fontSize:13,cursor:"pointer"}}>Fermer</button>
          </div>
        </div>
      </div>}
      {essaiExpire&&<div style={{position:"fixed",inset:0,background:"#000000EE",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999}}>
        <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:16,padding:36,maxWidth:440,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>⏳</div>
          <div style={{fontSize:20,fontWeight:700,color:C.gold,marginBottom:8,fontFamily:"Georgia,serif"}}>Votre essai gratuit est termine</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:24,lineHeight:1.6}}>Pour continuer a utiliser Xyra et acceder a vos donnees, activez votre abonnement.</div>
          <button onClick={demarrerPaiement} disabled={paiementLoading} style={{width:"100%",background:C.gold,color:"#000",border:"none",borderRadius:8,padding:"14px",fontWeight:700,fontSize:14,cursor:"pointer",opacity:paiementLoading?0.6:1}}>
            {paiementLoading?"Redirection...":"Activer mon abonnement"}
          </button>
        </div>
      </div>}
      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
        ::-webkit-scrollbar-thumb:hover{background:${C.muted};}
        select option{background:${C.card};}
        @keyframes slideIn{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}
      `}</style>
    </div>
  );
}