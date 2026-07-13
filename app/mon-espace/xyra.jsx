"use client";
import { useState, useRef, useEffect } from "react";
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
import PageChatModule from "../modules/PageChat";
import PageNotificationsModule from "../modules/PageNotifications";
import PageSignaturesModule from "../modules/PageSignatures";
import PageFacturationModule from "../modules/PageFacturation";
import PageFormationModule from "../modules/PageFormation";

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

// ─── PAGE ANALYTIQUE ──────────────────────────────────────────
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
    // Pages bientôt disponibles
    ...Object.fromEntries(Object.entries(SOON_MODULES).map(([k,v])=>[k,<PageBientot key={k} {...v}/>])),
    wallet:<PageWallet plan={plan} showToast={showToast} profil={profil}/>,
    cartes:<PageCartes showToast={showToast}/>,
    overview:<PageOverview plan={plan} profil={profil} setPage={setPage} showToast={showToast}/>,
    crm:<PageCRM plan={plan} showToast={showToast} profil={profil}/>,
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
    chat:<PageChatModule plan={plan} showToast={showToast} Chat={Chat}/>,
    notifications:<PageNotificationsModule notifs={notifs} setNotifs={setNotifs} showToast={showToast}/>,
    signature:<PageSignaturesModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    facturation:<PageFacturationModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    formation:<PageFormationModule plan={plan} showToast={showToast} UpgradeWall={UpgradeWall}/>,
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
        <div style={{padding:"10px 13px",borderTop:`1px solid ${C.border}`}}>
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