"use client";
import { useState, useRef, useEffect } from "react";
import PageConversationsWhatsapp from "../modules/PageConversationsWhatsapp";
import PageWalletModule from "../modules/PageWallet";
import PageCartesModule from "../modules/PageCartes";
import PageAccueilModule from "../modules/PageAccueil";
import PageOverviewModule from "../modules/PageOverview";
import PageCRMModule from "../modules/PageCRM";
import PageDevis from "../modules/PageDevis";
import PageInvestissementModule from "../modules/PageInvestissement";
import PageNoteFraisModule from "../modules/PageNoteFrais";
import PageComptaModule from "../modules/PageCompta";
import PageTresorerieModule from "../modules/PageTresorerie";
import PageAnalytiqueModule from "../modules/PageAnalytique";
import PageClientsModule from "../modules/PageClients";
import PagePartenairesModule from "../modules/PagePartenaires";
import PageMultiSocietesModule from "../modules/PageMultiSocietes";
import PageClubAffairesModule from "../modules/PageClubAffaires";
import PageAnnuaireModule from "../modules/PageAnnuaire";
import PageWalletMembresModule from "../modules/PageWalletMembres";
import PageEvenementsModule from "../modules/PageEvenements";
import PageScoringModule from "../modules/PageScoring";
import PageEquipeModule from "../modules/PageEquipe";
import PagePlanningModule from "../modules/PagePlanning";
import PageProspectionModule from "../modules/PageProspection";
import PageStockModule from "../modules/PageStock";
import PageServicesModule from "../modules/PageServices";

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
  multi_societes: ["multi_societes","multi_pro","holding","owner"],
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
    { id:"conversations_whatsapp", icon:"💬", label:"WhatsApp — Lea" },
    { id:"notifications", icon:"🔔", label:"Notifications",       badge:"notifs" },
    { id:"signature",     icon:"✦",  label:"Contrats & Signatures" },
    { id:"facturation",   icon:"🧾", label:"Facturation Électronique"},
    { id:"formation",     icon:"⊿",  label:"Formation équipe"     },
    { id:"deploiement",   icon:"🌍", label:"Déploiement SaaS"     },
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

const PROFILS_SECTEURS={
  conciergerie:{label:"🏠 Conciergerie / Services",termes:{mission:"Mission",missions:"Missions",client:"Client",clients:"Clients",service:"Service",services:"Services",collaborateur:"Collaborateur",stock:"Fournitures",commande:"Commande",rdv:"RDV",produit:"Produit"},services:["Airbnb","Résidentiel","Bureaux","Jet Privé","Yacht","Rapatriement"],stockCategories:["Nettoyage","Protection","Maritime","Aviation","Textile","Consommables"],kpiMission:"Missions",couleur:"#C9A84C"},
  restaurant:{label:"🍽️ Restaurant / Restauration",termes:{mission:"Service",missions:"Services",client:"Client",clients:"Clients",service:"Prestation",services:"Prestations",collaborateur:"Employé",stock:"Ingrédients",commande:"Commande",rdv:"Réservation",produit:"Plat"},services:["Déjeuner","Dîner","Brunch","Livraison","Traiteur","Banquet","Room Service"],stockCategories:["Viandes","Poissons","Légumes","Laitiers","Épices","Boissons","Emballages","Hygiène"],kpiMission:"Couverts",couleur:"#FF8C3A",normes:["HACCP","Chaîne du froid","Températures","DLC/DLUO","Plan de nettoyage","Traçabilité alimentaire"]},
  hotel:{label:"🏨 Hôtellerie",termes:{mission:"Séjour",missions:"Séjours",client:"Client",clients:"Clients",service:"Service",services:"Services",collaborateur:"Employé",stock:"Fournitures",commande:"Réservation",rdv:"Check-in",produit:"Prestation"},services:["Chambre Standard","Chambre Deluxe","Suite","Petit-déjeuner","Spa","Conciergerie","Room Service","Événement"],stockCategories:["Linge","Produits accueil","Minibar","Entretien","Restauration","Fleurs","Papeterie"],kpiMission:"Nuitées",couleur:"#9B5FFF",normes:["ISO 9001","Standards luxe","Protocole VIP","Rotation linge","Maintenance préventive","Guest experience"]},
  btp:{label:"🔨 BTP / Construction",termes:{mission:"Chantier",missions:"Chantiers",client:"Maître d'ouvrage",clients:"Clients",service:"Prestation",services:"Prestations",collaborateur:"Ouvrier",stock:"Matériaux",commande:"Bon de commande",rdv:"Réunion chantier",produit:"Matériau"},services:["Maçonnerie","Plomberie","Électricité","Menuiserie","Peinture","Rénovation","Démolition","Gros oeuvre"],stockCategories:["Gros oeuvre","Plomberie","Électricité","Menuiserie","Peinture","Outillage","EPI","Béton"],kpiMission:"Chantiers",couleur:"#FF5252",normes:["Plan de prévention","EPI obligatoire","PPSPS","RGIE","DTU","Bilan carbone"]},
  medical:{label:"🏥 Médical / Santé",termes:{mission:"Consultation",missions:"Consultations",client:"Patient",clients:"Patients",service:"Acte médical",services:"Actes",collaborateur:"Soignant",stock:"Matériel médical",commande:"Approvisionnement",rdv:"Rendez-vous",produit:"Médicament"},services:["Consultation","Acte médical","Chirurgie","Radiologie","Biologie","Kinésithérapie","Urgences","Téléconsultation"],stockCategories:["Médicaments","Consommables","Stérilisation","Imagerie","Prothèses","EPI","Formulaires"],kpiMission:"Consultations",couleur:"#2EC9B0",normes:["ISO 13485","HACCP médical","Pharmacovigilance","Traçabilité","RGPD santé","Stérilisation"]},
  beaute:{label:"💅 Beauté / Esthétique",termes:{mission:"Prestation",missions:"Prestations",client:"Cliente",clients:"Clientes",service:"Soin",services:"Soins",collaborateur:"Praticien",stock:"Produits",commande:"Commande",rdv:"Rendez-vous",produit:"Produit beauté"},services:["Coiffure","Coloration","Soin visage","Épilation","Massage","Manucure","Maquillage","Conseil beauté"],stockCategories:["Capillaires","Colorations","Soins visage","Maquillage","Épilation","Hygiène","Emballages"],kpiMission:"Prestations",couleur:"#FF5F9E"},
  transport:{label:"🚗 Transport / VTC",termes:{mission:"Course",missions:"Courses",client:"Passager",clients:"Passagers",service:"Trajet",services:"Trajets",collaborateur:"Chauffeur",stock:"Consommables",commande:"Réservation",rdv:"Prise en charge",produit:"Service"},services:["VTC Standard","VTC Premium","Navette aéroport","Transfert gare","Mise à disposition","Longue distance","Navette entreprise"],stockCategories:["Carburant","Entretien","Accessoires","Boissons","Presse","Chargeurs","Désinfectants"],kpiMission:"Courses",couleur:"#4B7BFF"},
  immobilier:{label:"🏢 Immobilier",termes:{mission:"Visite",missions:"Visites",client:"Acquéreur",clients:"Clients",service:"Mandat",services:"Mandats",collaborateur:"Agent",stock:"Fournitures",commande:"Offre",rdv:"Visite",produit:"Bien immobilier"},services:["Location","Vente","Gestion locative","Syndic","Estimation","Investissement","Neuf","Commerce"],stockCategories:["Panneaux","Imprimés","Fournitures","Clés","Matériel photo","Objets déco"],kpiMission:"Visites",couleur:"#2ECDC4"},
  formation:{label:"🎓 Formation / Coaching",termes:{mission:"Session",missions:"Sessions",client:"Apprenant",clients:"Apprenants",service:"Formation",services:"Formations",collaborateur:"Formateur",stock:"Matériel pédagogique",commande:"Inscription",rdv:"Session",produit:"Module"},services:["Formation présentielle","Formation en ligne","Coaching individuel","Atelier","Séminaire","Certification","E-learning","MOOC"],stockCategories:["Supports cours","Matériel bureau","Informatique","Livres","Badges","Repas","Vidéo"],kpiMission:"Sessions",couleur:"#C9A84C"},
  autre:{label:"⚙️ Autre / Personnalisé",termes:{mission:"Mission",missions:"Missions",client:"Client",clients:"Clients",service:"Service",services:"Services",collaborateur:"Collaborateur",stock:"Stock",commande:"Commande",rdv:"Rendez-vous",produit:"Produit"},services:["Service 1","Service 2","Service 3","Service 4"],stockCategories:["Catégorie 1","Catégorie 2","Catégorie 3"],kpiMission:"Missions",couleur:"#5A5A7A"},
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

const UpgradeWall=({page,plan,onUpgrade})=>{
  const preview=MODULE_PREVIEWS[page]||{icon:"📦",desc:page,features:["Fonctionnalités avancées","Analyses IA","Automatisations","Rapports détaillés"]};
  const plans=[
    {id:"business",nom:"Business Pro",prix:"99€",prixMois:"/mois",color:C.gold,icon:"✦",desc:"Accès complet à tous les modules",features:["CRM & Pipeline","Devis & Signatures","Trésorerie 90j","Équipe & RH","Prospection Auto","Analytique & CA"]},
    {id:"enterprise",nom:"Enterprise",prix:"150€",prixMois:"/mois",color:C.purple,icon:"◈",desc:"Business Pro + Bot WhatsApp + Support dédié",features:["Tout Business Pro","Bot WhatsApp IA","White-label SaaS","Support 24h dédié","API complète","Déploiement SaaS"]},
  ];
  const modulePrice=MODULE_PRICES[page];
  return <div style={{padding:24,maxWidth:900,margin:"0 auto"}}>
    {/* Header */}
    <div style={{textAlign:"center",marginBottom:24}}>
      <div style={{fontSize:48,marginBottom:8}}>{preview.icon||"🔒"}</div>
      <div style={{fontSize:22,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>{preview.desc}</div>
      {modulePrice&&<div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${C.gold}15`,border:`1px solid ${C.gold}44`,borderRadius:20,padding:"6px 16px",marginBottom:8}}>
        <span style={{fontSize:11,color:C.muted}}>Module à la carte :</span>
        <span style={{fontSize:16,fontWeight:700,color:C.gold}}>{modulePrice}€/mois</span>
      </div>}
      <div style={{fontSize:12,color:C.muted}}>Votre plan actuel : <b style={{color:PLANS[plan]?.color}}>{PLANS[plan]?.icon} {PLANS[plan]?.nom} — {PLANS[plan]?.prix}</b></div>
    </div>

    {/* Features du module */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20,marginBottom:20}}>
      <div style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Ce que vous débloquez</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
        {preview.features.map((f,i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.text,display:"flex",alignItems:"center",gap:8,border:`1px solid ${C.border}`}}>
          <span style={{color:C.gold,fontSize:14}}>✦</span>{f}
        </div>)}
      </div>
    </div>

    {/* Options de déblocage */}
    <div style={{display:"grid",gridTemplateColumns:`${modulePrice?"1fr ":""}1fr 1fr`,gap:12,marginBottom:16}}>
      {/* Option 1 : Module seul */}
      {modulePrice&&<div style={{background:C.card,border:`2px solid ${C.gold}66`,borderRadius:16,padding:20,textAlign:"center"}}>
        <div style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>MODULE SEUL</div>
        <div style={{fontSize:32,fontWeight:700,color:C.gold,marginBottom:2}}>{modulePrice}€</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:16}}>/mois · Sans engagement</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Ajoutez uniquement ce module à votre plan actuel</div>
        <button onClick={()=>onUpgrade&&onUpgrade("module_"+page)} style={{background:`linear-gradient(135deg,${C.gold},#a07c45)`,color:"#000",border:"none",borderRadius:8,padding:"10px 0",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",width:"100%"}}>+ Ajouter ce module</button>
      </div>}
      {/* Option 2 : Business Pro */}
      <div style={{background:C.card,border:`2px solid ${C.gold}44`,borderRadius:16,padding:20,textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:C.gold,color:"#000",borderRadius:20,padding:"3px 12px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>⭐ RECOMMANDÉ</div>
        <div style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>BUSINESS PRO</div>
        <div style={{fontSize:32,fontWeight:700,color:C.gold,marginBottom:2}}>129€</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:16}}>/mois · Tous les modules inclus</div>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12,textAlign:"left"}}>
          {["CRM · Devis · Facturation","Équipe & RH · Planning","Analytique · Trésorerie","Prospection · Clients","Stock · Services · Deals"].map((f,i)=><div key={i} style={{fontSize:11,color:C.muted}}><span style={{color:C.gold}}>✓</span> {f}</div>)}
        </div>
        <button onClick={()=>onUpgrade&&onUpgrade("business")} style={{background:`linear-gradient(135deg,${C.gold},#a07c45)`,color:"#000",border:"none",borderRadius:8,padding:"10px 0",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",width:"100%"}}>⚡ Passer à Business Pro</button>
      </div>
      {/* Option 3 : Enterprise */}
      <div style={{background:C.card,border:`2px solid ${C.purple}44`,borderRadius:16,padding:20,textAlign:"center"}}>
        <div style={{fontSize:11,color:C.purple,fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>ENTERPRISE</div>
        <div style={{fontSize:32,fontWeight:700,color:C.purple,marginBottom:2}}>249€</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:16}}>/mois · Tout inclus</div>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12,textAlign:"left"}}>
          {["Tout Business Pro","Bot WhatsApp IA","API complète","Déploiement SaaS","Support 24h dédié"].map((f,i)=><div key={i} style={{fontSize:11,color:C.muted}}><span style={{color:C.purple}}>✓</span> {f}</div>)}
        </div>
        <button onClick={()=>onUpgrade&&onUpgrade("enterprise")} style={{background:`linear-gradient(135deg,${C.purple},#6B3FCC)`,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",width:"100%"}}>◈ Passer à Enterprise</button>
      </div>
    </div>

    <div style={{textAlign:"center",fontSize:12,color:C.muted}}>
      💬 Des questions ? <span style={{color:C.gold,cursor:"pointer"}} onClick={()=>window.open("https://wa.me/33765189527")}>Contactez-nous sur WhatsApp →</span>
    </div>
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
  const[plan,setPlan]=useState("owner");
  const[tenantInfo,setTenantInfo]=useState(null);
  useEffect(()=>{
    fetch("/api/tenant-info").then(r=>r.json()).then(d=>{setTenantInfo(d);}).catch(()=>{});
  },[]);

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
        // Charger le profil métier depuis le tenant
        const{data:{user}}=await sb.auth.getUser();
        if(user){
          const{data:tenant}=await sb.from('tenants').select('metier,plan').eq('user_id',user.id).single();
          if(tenant?.metier){
            const metierKey=Object.keys(PROFILS_SECTEURS).find(k=>{
              const p=PROFILS_SECTEURS[k];
              return p.label.toLowerCase().includes(tenant.metier.toLowerCase())||
                     tenant.metier.toLowerCase().includes(p.label.toLowerCase().replace(/[^a-z]/g,''));
            });
            if(metierKey)setProfil(PROFILS_SECTEURS[metierKey]);
          }
          if(tenant?.plan){
            const planNorm=tenant.plan.replace('business_pro','business').replace('_pro','');
            setPlan(planNorm);
          }
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
    accueil:<PageAccueilModule notifs={notifs} setNotifs={setNotifs} profil={profil} setPage={setPage}/>,
    // Pages bientôt disponibles
    ...Object.fromEntries(Object.entries(SOON_MODULES).map(([k,v])=>[k,<PageBientot key={k} {...v}/>])),
    wallet:<PageWalletModule plan={plan} showToast={showToast} profil={profil}/>,
    cartes:<PageCartesModule showToast={showToast}/>,
    overview:<PageOverviewModule plan={plan} profil={profil} setPage={setPage} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    crm:<PageCRMModule plan={plan} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall}/>,
    devis:<PageDevis plan={plan} showToast={showToast} profil={profil}/>,
    investissement:<PageInvestissementModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    compta:<PageComptaModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    notefrais:<PageNoteFraisModule plan={plan} showToast={showToast}/>,
    tresorerie:<PageTresorerieModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    analytique:<PageAnalytiqueModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    clients:<PageClientsModule plan={plan} showToast={showToast} profil={profil} setPage={setPage} UpgradeWall={UpgradeWall}/>,
    partenaires:<PagePartenairesModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    club_affaires:<PageClubAffairesModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    multi_societes:<PageMultiSocietesModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    annuaire:<PageAnnuaireModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    wallet_membres:<PageWalletMembresModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    evenements:<PageEvenementsModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    scoring:<PageScoringModule plan={plan} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall}/>,
    equipe:<PageEquipeModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    planning:<PagePlanningModule plan={plan} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall}/>,
    prospection:<PageProspectionModule plan={plan} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall}/>,
    deals:<PageDeals plan={plan} showToast={showToast}/>,
    stock:<PageStockModule plan={plan} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall}/>,
    services:<PageServicesModule plan={plan} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall}/>,
    chat:<PageChat plan={plan} showToast={showToast}/>,
    conversations_whatsapp:<PageConversationsWhatsapp/>,
    notifications:<PageNotifications notifs={notifs} setNotifs={setNotifs} showToast={showToast}/>,
    signature:<PageSignatures plan={plan} showToast={showToast}/>,
    facturation:<PageFacturation plan={plan} showToast={showToast}/>,
    formation:<PageFormation plan={plan} showToast={showToast}/>,
    deploiement:<PageDeploiement plan={plan} showToast={showToast}/>,
    api:<PageAPI plan={plan} showToast={showToast}/>,
    settings:<PageSettings plan={plan} showToast={showToast} sirApiKey={sirApiKey} setSirApiKey={setSirApiKey} profil={profil} setProfil={setProfil}/>,
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
          <div style={{fontSize:9,color:"#9090B8",letterSpacing:"0.2em",marginTop:2}}>{(tenantInfo&&tenantInfo.societe?tenantInfo.societe.toUpperCase():"...")}</div>
          <select value={profil?.label||PROFIL_DEFAUT.label} onChange={e=>{const p=Object.values(PROFILS_SECTEURS).find(s=>s.label===e.target.value);if(p)setProfil(p);}} style={{marginTop:8,background:C.card2,border:`1px solid ${C.gold}44`,borderRadius:5,padding:"4px 6px",color:C.gold,fontSize:10,width:"100%",fontFamily:"inherit"}}>
            {Object.values(PROFILS_SECTEURS).map(p=><option key={p.label} value={p.label}>{p.label}</option>)}
          </select>
        </div>

        {/* Nav */}
        <div style={{flex:1,overflowY:"auto",padding:"6px 0"}}>
          {NAV.map((grp,gi)=><div key={gi}>
            <div style={{fontSize:9,color:"#9090B8",letterSpacing:"0.2em",textTransform:"uppercase",padding:"10px 13px 3px",marginTop:gi>0?4:0,fontWeight:600}}>{grp.group}</div>
            {grp.items.map((item)=>{
              const active=page===item.id;
              const locked=!hasAccess(plan,item.id);
              const badge=item.badge?badges[item.badge]:0;
              if(item.soon) return (
                <button key={item.id} onClick={()=>setPage(item.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 13px",cursor:"pointer",color:"#5A5A7A",background:"transparent",border:"none",borderLeft:"2px solid transparent",width:"100%",textAlign:"left",fontFamily:"inherit",fontSize:12,opacity:0.6}}>
                  <span style={{fontSize:14,flexShrink:0}}>⏳</span>
                  <span style={{flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</span>
                  <span style={{fontSize:8,background:"#1E1E36",color:"#5A5A7A",borderRadius:4,padding:"1px 5px",flexShrink:0}}>BIENTÔT</span>
                </button>
              );
              return (
                <button key={item.id} onClick={()=>setPage(item.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 13px",cursor:"pointer",color:active?C.gold:locked?"#7A7A9A":"#C0C0D8",background:active?`${C.gold}0E`:locked?`${C.card2}`:"transparent",border:"none",borderLeft:`2px solid ${active?C.gold:locked?"#3A3A5A66":"transparent"}`,width:"100%",textAlign:"left",fontFamily:"inherit",fontSize:12,fontWeight:active?600:400}}>
                  <span style={{fontSize:14,flexShrink:0}}>{locked?"🔒":item.icon}</span>
                  <span style={{flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</span>
                  {locked
                    ?<span style={{fontSize:8,background:`${C.gold}22`,color:C.gold,borderRadius:4,padding:"1px 5px",flexShrink:0,border:`1px solid ${C.gold}44`}}>{MODULE_PRICES[item.id]?MODULE_PRICES[item.id]+"€":"PRO"}</span>
                    :badge>0&&<span style={{background:C.red,color:"#fff",borderRadius:20,padding:"0 5px",fontSize:9,fontWeight:700,flexShrink:0}}>{badge}</span>
                  }
                </button>
              );
            })}
          </div>)}
        </div>

        {/* Plan switcher */}
        <div style={{padding:"8px 12px",borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.muted,marginBottom:4,letterSpacing:"0.1em"}}>SIMULER UN FORFAIT</div>
          <select value={plan} onChange={e=>setPlan(e.target.value)} style={{background:C.card2,border:`1px solid ${C.gold}44`,borderRadius:6,padding:"5px 8px",color:C.gold,fontSize:11,width:"100%",fontFamily:"inherit"}}>
            {Object.values(PLANS).map(p=><option key={p.id} value={p.id}>{p.icon} {p.nom} {p.prix!=="—"?"— "+p.prix:""}</option>)}
          </select>
        </div>

        {/* User */}
        <a href="/admin" style={{display:"block",textDecoration:"none",padding:"10px 13px",borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:`${C.gold}22`,border:`1px solid ${C.gold}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.gold,flexShrink:0}}>C</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Curtiss</div>
              <div style={{fontSize:9,color:C.gold}}>★ Xyra Operating Center →</div>
            </div>
            {notifs.filter(n=>!n.lu).length>0&&<span style={{background:C.red,color:"#fff",borderRadius:20,padding:"0 5px",fontSize:9,fontWeight:700}}>{notifs.filter(n=>!n.lu).length}</span>}
          </div>
        </a>
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
