"use client";
import { useState, useRef, useEffect } from "react";

// ─── PALETTE ──────────────────────────────────────────────────
const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
  teal:"#2ECDC4", pink:"#FF5F9E",
};

// ─── PLANS ────────────────────────────────────────────────────
const PLANS = {
  starter: {
    id:"starter", nom:"Starter", prix:"29€/mois",
    color:C.blue, icon:"◎",
    acces:["wallet","cartes","paiements_entrants","paiements_sortants","historique","devises"],
    description:"Wallet · Paiements · Carte virtuelle · IBAN mondial",
  },
  business: {
    id:"business", nom:"Business Pro", prix:"99€/mois",
    color:C.gold, icon:"✦",
    acces:["tout"],
    description:"Tout Starter + Réseau B2B · Annuaire · Commissions · Prospection · Investissement IA",
  },
  enterprise: {
    id:"enterprise", nom:"Enterprise", prix:"150€/mois",
    color:C.purple, icon:"◈",
    acces:["tout"],
    description:"Tout Business Pro + Bot WhatsApp intégré · Support dédié · White-label",
  },
  owner: {
    id:"owner", nom:"Owner", prix:"—",
    color:C.gold, icon:"★",
    acces:["tout"],
    description:"Accès total — Curtiss",
  },
};

// Pages accessibles selon le plan
const PAGE_ACCESS = {
  // Accessible à tous
  wallet:         ["starter","business","enterprise","owner"],
  cartes:         ["starter","business","enterprise","owner"],
  // Business Pro et plus
  overview:       ["business","enterprise","owner"],
  crm:            ["business","enterprise","owner"],
  devis:          ["business","enterprise","owner"],
  investissement: ["business","enterprise","owner"],
  compta:         ["business","enterprise","owner"],
  tresorerie:     ["business","enterprise","owner"],
  analytique:     ["business","enterprise","owner"],
  clients:        ["business","enterprise","owner"],
  partenaires:    ["business","enterprise","owner"],
  annuaire:       ["business","enterprise","owner"],
  wallet_membres: ["business","enterprise","owner"],
  evenements:     ["business","enterprise","owner"],
  scoring:        ["business","enterprise","owner"],
  equipe:         ["business","enterprise","owner"],
  planning:       ["business","enterprise","owner"],
  prospection:    ["business","enterprise","owner"],
  stock:          ["business","enterprise","owner"],
  services:       ["business","enterprise","owner"],
  notifications:  ["business","enterprise","owner"],
  signature:      ["business","enterprise","owner"],
  formation:      ["business","enterprise","owner"],
  deploiement:    ["business","enterprise","owner"],
  api:            ["business","enterprise","owner"],
  settings:       ["business","enterprise","owner"],
};

// ─── NAVIGATION ───────────────────────────────────────────────
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
    { id:"tresorerie",    icon:"◑",  label:"Trésorerie 90 jours"  },
    { id:"analytique",    icon:"◒",  label:"Analytique & CA"      },
  ]},
  { group:"RÉSEAU", items:[
    { id:"clients",       icon:"◬",  label:"Clients"              },
    { id:"partenaires",   icon:"⬡",  label:"Partenaires & AA",    badge:"comm"   },
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
    { id:"signature",     icon:"✦",  label:"Contrats"             },
    { id:"formation",     icon:"⊿",  label:"Formation équipe"     },
    { id:"deploiement",   icon:"🌍", label:"Déploiement SaaS"     },
    { id:"api",           icon:"◇",  label:"API Tymeless"         },
    { id:"settings",      icon:"⚙",  label:"Paramètres"           },
    { id:"admin",         icon:"👑", label:"Admin Curtiss"         },
  ]},
];

// ─── DATA ─────────────────────────────────────────────────────
// ─── PROFIL SYSTEM — ADAPTS TO ANY BUSINESS ───────────────────
const PROFILS_SECTEURS={
  conciergerie:{
    label:"🏠 Conciergerie / Services",
    termes:{mission:"Mission",missions:"Missions",client:"Client",clients:"Clients",service:"Service",services:"Services",collaborateur:"Collaborateur",stock:"Fournitures",commande:"Commande",rdv:"RDV",produit:"Produit"},
    services:["Airbnb","Résidentiel","Bureaux","Jet Privé","Yacht","Rapatriement"],
    stockCategories:["Nettoyage","Protection","Maritime","Aviation","Textile","Consommables"],
    kpiMission:"Missions",couleur:"#C9A84C",
  },
  restaurant:{
    label:"🍽️ Restaurant / Restauration",
    termes:{mission:"Service",missions:"Services",client:"Client",clients:"Clients",service:"Prestation",services:"Prestations",collaborateur:"Employé",stock:"Ingrédients",commande:"Commande",rdv:"Réservation",produit:"Plat"},
    services:["Déjeuner","Dîner","Brunch","Livraison","Traiteur","Banquet","Room Service"],
    stockCategories:["Viandes","Poissons","Légumes","Laitiers","Épices","Boissons","Emballages","Hygiène"],
    kpiMission:"Couverts",couleur:"#FF8C3A",
    normes:["HACCP","Chaîne du froid","Températures","DLC/DLUO","Plan de nettoyage","Traçabilité alimentaire"],
  },
  hotel:{
    label:"🏨 Hôtellerie",
    termes:{mission:"Séjour",missions:"Séjours",client:"Client",clients:"Clients",service:"Service",services:"Services",collaborateur:"Employé",stock:"Fournitures",commande:"Réservation",rdv:"Check-in",produit:"Prestation"},
    services:["Chambre Standard","Chambre Deluxe","Suite","Petit-déjeuner","Spa","Conciergerie","Room Service","Événement"],
    stockCategories:["Linge","Produits accueil","Minibar","Entretien","Restauration","Fleurs","Papeterie"],
    kpiMission:"Nuitées",couleur:"#9B5FFF",
    normes:["ISO 9001","Standards luxe","Protocole VIP","Rotation linge","Maintenance préventive","Guest experience"],
  },
  btp:{
    label:"🔨 BTP / Construction",
    termes:{mission:"Chantier",missions:"Chantiers",client:"Maître d'ouvrage",clients:"Clients",service:"Prestation",services:"Prestations",collaborateur:"Ouvrier",stock:"Matériaux",commande:"Bon de commande",rdv:"Réunion chantier",produit:"Matériau"},
    services:["Maçonnerie","Plomberie","Électricité","Menuiserie","Peinture","Rénovation","Démolition","Gros oeuvre"],
    stockCategories:["Gros oeuvre","Plomberie","Électricité","Menuiserie","Peinture","Outillage","EPI","Béton"],
    kpiMission:"Chantiers",couleur:"#FF5252",
    normes:["Plan de prévention","EPI obligatoire","PPSPS","RGIE","DTU","Bilan carbone"],
  },
  medical:{
    label:"🏥 Médical / Santé",
    termes:{mission:"Consultation",missions:"Consultations",client:"Patient",clients:"Patients",service:"Acte médical",services:"Actes",collaborateur:"Soignant",stock:"Matériel médical",commande:"Approvisionnement",rdv:"Rendez-vous",produit:"Médicament"},
    services:["Consultation","Acte médical","Chirurgie","Radiologie","Biologie","Kinésithérapie","Urgences","Téléconsultation"],
    stockCategories:["Médicaments","Consommables","Stérilisation","Imagerie","Prothèses","EPI","Formulaires"],
    kpiMission:"Consultations",couleur:"#2EC9B0",
    normes:["ISO 13485","HACCP médical","Pharmacovigilance","Traçabilité","RGPD santé","Stérilisation"],
  },
  beaute:{
    label:"💅 Beauté / Esthétique",
    termes:{mission:"Prestation",missions:"Prestations",client:"Cliente",clients:"Clientes",service:"Soin",services:"Soins",collaborateur:"Praticien",stock:"Produits",commande:"Commande",rdv:"Rendez-vous",produit:"Produit beauté"},
    services:["Coiffure","Coloration","Soin visage","Épilation","Massage","Manucure","Maquillage","Conseil beauté"],
    stockCategories:["Capillaires","Colorations","Soins visage","Maquillage","Épilation","Hygiène","Emballages"],
    kpiMission:"Prestations",couleur:"#FF5F9E",
  },
  transport:{
    label:"🚗 Transport / VTC",
    termes:{mission:"Course",missions:"Courses",client:"Passager",clients:"Passagers",service:"Trajet",services:"Trajets",collaborateur:"Chauffeur",stock:"Consommables",commande:"Réservation",rdv:"Prise en charge",produit:"Service"},
    services:["VTC Standard","VTC Premium","Navette aéroport","Transfert gare","Mise à disposition","Longue distance","Navette entreprise"],
    stockCategories:["Carburant","Entretien","Accessoires","Boissons","Presse","Chargeurs","Désinfectants"],
    kpiMission:"Courses",couleur:"#4B7BFF",
  },
  immobilier:{
    label:"🏢 Immobilier",
    termes:{mission:"Visite",missions:"Visites",client:"Acquéreur",clients:"Clients",service:"Mandat",services:"Mandats",collaborateur:"Agent",stock:"Fournitures",commande:"Offre",rdv:"Visite",produit:"Bien immobilier"},
    services:["Location","Vente","Gestion locative","Syndic","Estimation","Investissement","Neuf","Commerce"],
    stockCategories:["Panneaux","Imprimés","Fournitures","Clés","Matériel photo","Objets déco"],
    kpiMission:"Visites",couleur:"#2ECDC4",
  },
  formation:{
    label:"🎓 Formation / Coaching",
    termes:{mission:"Session",missions:"Sessions",client:"Apprenant",clients:"Apprenants",service:"Formation",services:"Formations",collaborateur:"Formateur",stock:"Matériel pédagogique",commande:"Inscription",rdv:"Session",produit:"Module"},
    services:["Formation présentielle","Formation en ligne","Coaching individuel","Atelier","Séminaire","Certification","E-learning","MOOC"],
    stockCategories:["Supports cours","Matériel bureau","Informatique","Livres","Badges","Repas","Vidéo"],
    kpiMission:"Sessions",couleur:"#C9A84C",
  },
  autre:{
    label:"⚙️ Autre / Personnalisé",
    termes:{mission:"Mission",missions:"Missions",client:"Client",clients:"Clients",service:"Service",services:"Services",collaborateur:"Collaborateur",stock:"Stock",commande:"Commande",rdv:"Rendez-vous",produit:"Produit"},
    services:["Service 1","Service 2","Service 3","Service 4"],
    stockCategories:["Catégorie 1","Catégorie 2","Catégorie 3"],
    kpiMission:"Missions",couleur:"#5A5A7A",
  },
};

// Profil actif — sera défini par l'onboarding
const PROFIL_DEFAUT=PROFILS_SECTEURS.conciergerie;

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

const METHODES_PAY=[{id:"wave",nom:"Wave",icon:"🌊",zone:"Sénégal / Côte d'Ivoire",color:C.blue,via:"CinetPay"},{id:"orange",nom:"Orange Money",icon:"🟠",zone:"Afrique francophone",color:C.orange,via:"Flutterwave"},{id:"mtn",nom:"MTN Money",icon:"🟡",zone:"Afrique sub-saharienne",color:"#FFCC00",via:"Flutterwave"},{id:"carte",nom:"Carte bancaire",icon:"💳",zone:"Europe / Monde",color:C.blue,via:"Flutterwave"},{id:"sepa",nom:"Virement SEPA",icon:"🏦",zone:"Europe",color:C.green,via:"Direct"},{id:"whatsapp",nom:"WhatsApp Pay",icon:"💬",zone:"Global",color:C.green,via:"Lien paiement"}];
const INIT_DEVIS=[{id:"TYM-0044",client:"Isabelle Moreau",service:"Nettoyage Airbnb",montant:320,statut:"en_attente",date:"15/04",tel:"+33 6 12 34 56 78"},{id:"TYM-0043",client:"Marc Dupont",service:"Nettoyage bureaux",montant:580,statut:"en_attente",date:"14/04",tel:"+33 6 98 76 54 32"},{id:"TYM-0042",client:"Sofia Al-Rashid",service:"Jet privé",montant:2400,statut:"validé",date:"13/04",tel:"+33 7 11 22 33 44"},{id:"TYM-0041",client:"Pierre Lefevre",service:"Rapatriement",montant:4800,statut:"validé",date:"12/04",tel:"+33 6 55 44 33 22"}];
const CRM_LEADS=[{id:1,nom:"Hotel Prestige Paris",contact:"Claire Bernard",metier:"Hôtellerie",etape:"Proposition",score:92,ca_potentiel:8000,derniere:"Hier",source:"Annuaire",notes:"Nettoyage 40 chambres/jour"},{id:2,nom:"AirParis Management",contact:"Kevin Mour",metier:"Airbnb",etape:"Négociation",score:78,ca_potentiel:3600,derniere:"13/04",source:"Partenaire",notes:"15 appartements"},{id:3,nom:"Jet Services Monaco",contact:"Antoine Rivière",metier:"Aviation",etape:"Gagné",score:98,ca_potentiel:12000,derniere:"10/04",source:"Réseau",notes:"Contrat annuel ✓"},{id:4,nom:"Cabinet Delmas",contact:"Me Delmas",metier:"Juridique",etape:"Nouveau",score:55,ca_potentiel:960,derniere:"12/04",source:"LinkedIn",notes:"Nettoyage hebdo"}];
const CLIENTS=[{id:1,nom:"Isabelle Moreau",email:"i.moreau@mail.fr",pays:"🇫🇷",ca:960,statut:"actif",metier:"Gestion Airbnb",score:72,rdv:"17/04 14h"},{id:2,nom:"Marc Dupont",email:"m.dupont@corp.fr",pays:"🇫🇷",ca:3200,statut:"actif",metier:"Immobilier",score:68,rdv:null},{id:3,nom:"Sofia Al-Rashid",email:"sofia@vip.ae",pays:"🇦🇪",ca:9200,statut:"VIP",metier:"Aviation d'affaires",score:98,rdv:"18/04 10h"},{id:4,nom:"Pierre Lefevre",email:"p.lefevre@fr",pays:"🇫🇷",ca:5400,statut:"actif",metier:"Import/Export",score:85,rdv:null},{id:5,nom:"Jean-Marc Olivier",email:"jm@pro.fr",pays:"🇫🇷",ca:14600,statut:"VIP",metier:"Conseil",score:94,rdv:"20/04 9h"}];
const PARTENAIRES=[{id:1,nom:"Thomas Beaumont",role:"Apporteur d'affaires",comm:20,ca:12400,contrats:8,statut:"actif",dues:2480,abo:"Starter"},{id:2,nom:"Leila Mansouri",role:"Agent immobilier",comm:15,ca:8700,contrats:5,statut:"actif",dues:1305,abo:"Business Pro"},{id:3,nom:"Groupe Prestige SARL",role:"Syndic",comm:12,ca:22000,contrats:14,statut:"actif",dues:2640,abo:"Enterprise"},{id:4,nom:"Fatoumata Diop",role:"Apporteuse Afrique",comm:25,ca:6800,contrats:4,statut:"actif",dues:1700,abo:"Business Pro"}];
const ANNUAIRE=[{id:1,nom:"Isabelle Moreau",metier:"Gestion Airbnb",ville:"Paris",pays:"🇫🇷",plan:"Starter",score:72},{id:2,nom:"Marc Dupont",metier:"Immobilier",ville:"Lyon",pays:"🇫🇷",plan:"Business Pro",score:88},{id:3,nom:"Sofia Al-Rashid",metier:"Aviation d'affaires",ville:"Dubaï",pays:"🇦🇪",plan:"Enterprise",score:98},{id:4,nom:"Groupe Prestige SARL",metier:"Syndic",ville:"Paris",pays:"🇫🇷",plan:"Enterprise",score:94},{id:5,nom:"Fatoumata Diop",metier:"Finance Afrique",ville:"Dakar",pays:"🇸🇳",plan:"Business Pro",score:89}];
const STOCK=[{art:"Produit vitres Pro",cat:"Nettoyage",qte:3,min:5,u:"L",four:"CleanPro"},{art:"Microfibre premium",cat:"Nettoyage",qte:24,min:20,u:"pcs",four:"TextilePro"},{art:"Désinfectant surfaces",cat:"Nettoyage",qte:8,min:6,u:"L",four:"CleanPro"},{art:"Housses rapatriement",cat:"Rapatriement",qte:2,min:4,u:"pcs",four:"MedSupply"},{art:"Kit bord jet privé",cat:"Jet/Yacht",qte:5,min:3,u:"kits",four:"LuxEquip"},{art:"Produit nacre bois",cat:"Yacht",qte:1,min:3,u:"L",four:"YachtCare"}];
const PLANNING=[{date:"15/04",h:"09:00",client:"Isabelle Moreau",service:"Nettoyage Airbnb – Montmartre",collab:"Abou",statut:"confirmé",duree:"3h",type:"mission"},{date:"15/04",h:"14:00",client:"Marc Dupont",service:"Nettoyage bureaux – La Défense",collab:"Thomas",statut:"confirmé",duree:"4h",type:"mission"},{date:"17/04",h:"14:00",client:"Isabelle Moreau",service:"RDV client – Suivi contrat",collab:"Béné",statut:"confirmé",duree:"1h",type:"rdv"},{date:"18/04",h:"10:00",client:"Sofia Al-Rashid",service:"RDV VIP – Renouvellement",collab:"Béné",statut:"confirmé",duree:"2h",type:"rdv"}];
const CHARGES=[{cat:"Fournitures nettoyage",mois:420},{cat:"Transport & carburant",mois:380},{cat:"Commissions partenaires",mois:6425},{cat:"Salaires collaborateurs",mois:3200},{cat:"Logiciels & abonnements",mois:180},{cat:"Frais divers",mois:150}];
const TRESORERIE_90J=[{sem:"S16 (15 avr)",e:6480,s:3200,sol:8240},{sem:"S17 (22 avr)",e:5200,s:4100,sol:9340},{sem:"S18 (29 avr)",e:7800,s:3500,sol:13640},{sem:"S19 (6 mai)",e:6100,s:6800,sol:12940},{sem:"S20 (13 mai)",e:8400,s:3200,sol:18140},{sem:"S21 (20 mai)",e:9200,s:4400,sol:22940,pred:true},{sem:"S22 (27 mai)",e:7600,s:3100,sol:27440,pred:true},{sem:"S23 (3 juin)",e:10200,s:5200,sol:32440,pred:true}];
const INIT_NOTIFS=[{id:1,type:"urgent",icon:"⚠",titre:"2 devis en attente de validation",heure:"09:00",lu:false},{id:2,type:"urgent",icon:"📦",titre:"Stock critique — Produit vitres + 2 articles",heure:"08:30",lu:false},{id:3,type:"info",icon:"💬",titre:"Abou : produit vitres épuisé",heure:"13:20",lu:false},{id:4,type:"money",icon:"💰",titre:"Commission Leila Mansouri : 1 305€ à payer",heure:"Hier",lu:true},{id:5,type:"good",icon:"⭐",titre:"Nouvel avis 5★ — Sofia Al-Rashid",heure:"Hier",lu:true}];
const CONTRATS=[{id:"CTR-001",type:"Partenaire",nom:"Thomas Beaumont",comm:"20%",statut:"signé",date:"01/03",expire:"28/02/2027"},{id:"CTR-002",type:"Partenaire",nom:"Leila Mansouri",comm:"15%",statut:"signé",date:"15/02",expire:"14/02/2027"},{id:"CTR-003",type:"Prestation",nom:"Groupe Prestige SARL",comm:"12%",statut:"signé",date:"01/04",expire:"31/03/2027"}];
const AVIS=[{client:"Sofia Al-Rashid",note:5,service:"Jet privé",comm:"Service impeccable, équipe très pro !",google:true},{client:"Jean-Marc Olivier",note:5,service:"Résidentiel",comm:"Tymeless c'est le top, je recommande.",google:true},{client:"Pierre Lefevre",note:4,service:"Rapatriement",comm:"Très bien géré dans un moment difficile.",google:false}];
const FORMATION=[{titre:"Protocole nettoyage jet privé",collab:"Thomas, Abou",statut:"complété",score:98},{titre:"Process rapatriement corps",collab:"Thomas",statut:"complété",score:95},{titre:"Accueil client VIP",collab:"Fatou",statut:"en cours",score:null},{titre:"Nettoyage yacht – produits nacrés",collab:"Abou",statut:"à faire",score:null}];
const EVENEMENTS=[{titre:"Networking Tymeless — Paris",date:"25/04/2026",lieu:"Hôtel George V",inscrits:24,max:40,prix:"80€",statut:"ouvert"},{titre:"Forum Entrepreneurs Afrique",date:"10/05/2026",lieu:"Paris – Salle Opéra",inscrits:52,max:100,prix:"45€",statut:"ouvert"},{titre:"Soirée Partenaires VIP",date:"15/05/2026",lieu:"Monaco – Invitation",inscrits:18,max:20,prix:"0€",statut:"complet"}];
const MSGS_EQUIPE=[{id:1,auteur:"Thomas",av:"T",msg:"Béné, prospect Dupont confirmé pour jeudi 🙌",h:"09:14",lu:true},{id:2,auteur:"Abou",av:"A",msg:"Nettoyage Airbnb Montmartre terminé ✅",h:"10:32",lu:true},{id:3,auteur:"Abou",av:"A",msg:"Produit vitres épuisé, je rachète ?",h:"13:20",lu:false},{id:4,auteur:"Thomas",av:"T",msg:"Rappel rapatriement Lefevre demain 8h ✈️",h:"14:45",lu:false}];
const MSGS_PART=[{id:1,auteur:"Leila",av:"L",msg:"Bonjour Béné, j'ai un client pour le résidentiel 👋",h:"08:30",lu:true},{id:2,auteur:"Fatou",av:"F",msg:"2 nouvelles sociétés depuis Dakar 🌍",h:"11:00",lu:false}];
const INIT_HISTO=[{id:"PAY-001",type:"entree",libelle:"Paiement Sofia Al-Rashid",montant:2400,devise:"EUR",methode:"Carte",date:"13/04 14:32",statut:"confirmé",ref:"TYM-0042",com:120},{id:"PAY-002",type:"entree",libelle:"Paiement Pierre Lefevre",montant:4800,devise:"EUR",methode:"Virement SEPA",date:"12/04 09:15",statut:"confirmé",ref:"TYM-0041",com:240},{id:"PAY-003",type:"sortie",libelle:"Commission Thomas Beaumont",montant:2480,devise:"EUR",methode:"Virement SEPA",date:"11/04 16:00",statut:"envoyé",ref:"COM-001",com:0},{id:"PAY-004",type:"entree",libelle:"Paiement Fatoumata Diop",montant:557480,devise:"XOF",methode:"Wave",date:"10/04 11:20",statut:"confirmé",ref:"TYM-0038",com:27874},{id:"PAY-005",type:"sortie",libelle:"Fournitures CleanPro",montant:420,devise:"EUR",methode:"Virement SEPA",date:"09/04 10:00",statut:"envoyé",ref:"FOUR-001",com:0}];
const INIT_COMM=[{id:"COM-002",nom:"Leila Mansouri",role:"Partenaire",montant:1305,devise:"EUR",methode:"Virement SEPA",tel:"+33 6 44 55 66 77",email:"leila.m@mail.fr"},{id:"COM-004",nom:"Groupe Prestige SARL",role:"Partenaire",montant:2640,devise:"EUR",methode:"Virement SEPA",tel:"+33 1 44 55 66 77",email:"contact@prestige.fr"},{id:"COM-005",nom:"Fatoumata Diop",role:"Apporteuse AA",montant:1700,devise:"EUR",methode:"Wave",tel:"+221 77 123 45 67",email:"fatou.d@dakar.sn"}];
const INIT_REMB=[{id:"RMB-001",nom:"Amina Diallo",motif:"Service annulé",montant:190,devise:"EUR",methode:"Orange Money",tel:"+33 6 77 88 99 00"}];
const INIT_FOUR=[{id:"FOUR-002",nom:"TextilePro",service:"Microfibre premium x50",montant:380,devise:"EUR",methode:"Virement SEPA",iban:"FR76 1234..."},{id:"FOUR-003",nom:"MedSupply",service:"Housses rapatriement x10",montant:520,devise:"EUR",methode:"Virement SEPA",iban:"FR76 5678..."},{id:"FOUR-004",nom:"YachtCare",service:"Produit nacre bois x5L",montant:290,devise:"EUR",methode:"Virement SEPA",iban:"FR76 9012..."}];
const INIT_CARTES=[{id:"CRD-001",nom:"Béné — Pro",numero:"4532 •••• •••• 7821",reseau:"Visa",solde:2400,limite:5000,statut:"active",devise:"EUR",type:"owner",expiry:"12/27",cvv:"•••"},{id:"CRD-002",nom:"Thomas Beaumont",numero:"5261 •••• •••• 3344",reseau:"Mastercard",solde:850,limite:2000,statut:"active",devise:"EUR",type:"Business Pro",expiry:"08/26",cvv:"•••"},{id:"CRD-003",nom:"Fatoumata Diop",numero:"4111 •••• •••• 9902",reseau:"Visa",solde:320000,limite:500000,statut:"active",devise:"XOF",type:"Business Pro",expiry:"03/27",cvv:"•••"}];
const MEMBRES_WALLET=[{id:"WM-001",nom:"Thomas Beaumont",type:"Business Pro",solde:2480,devise:"EUR",iban:"FR76 3000 4000 0100 0012 3456 789",banque:"BNP Paribas",pays:"🇫🇷",statut:"actif",transactions:12,carte:true},{id:"WM-002",nom:"Leila Mansouri",type:"Starter",solde:1305,devise:"EUR",iban:"FR76 1027 8060 0001 0234 5678 901",banque:"Société Générale",pays:"🇫🇷",statut:"actif",transactions:8,carte:false},{id:"WM-003",nom:"Fatoumata Diop",type:"Business Pro",solde:855750,devise:"XOF",iban:"SN28 SN08 0100 1535 1000 1234 56",banque:"Ecobank Sénégal",pays:"🇸🇳",statut:"actif",transactions:24,carte:true},{id:"WM-004",nom:"Sofia Al-Rashid",type:"Enterprise",solde:9200,devise:"EUR",iban:"AE07 0331 2345 6789 0123 456",banque:"Emirates NBD",pays:"🇦🇪",statut:"actif",transactions:5,carte:true}];
const METIERS=["Immobilier","Aviation d'affaires","Yachting","Finance","Import/Export","Conseil","Marketing","Tech","Santé","Hôtellerie","Restauration","Mode & Luxe","Gestion Airbnb","Syndic","Courtage","Transport","BTP","Juridique","Éducation","Événementiel","Autre"];

// ─── UTILITAIRES ──────────────────────────────────────────────
const fmt=(m,d="EUR")=>{const dv=DEVISES.find(x=>x.code===d);if(d==="XOF")return Math.round(m).toLocaleString("fr")+" "+(dv?.symbol||"₣");return Number(m).toLocaleString("fr",{minimumFractionDigits:0,maximumFractionDigits:2})+" "+(dv?.symbol||"€");};
const conv=(m,de,ve)=>{const f=DEVISES.find(x=>x.code===de),t=DEVISES.find(x=>x.code===ve);return(!f||!t)?m:(m/f.taux)*t.taux;};
const inits=(nom)=>nom.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const hasAccess=(plan,page)=>{const allowed=PAGE_ACCESS[page];if(!allowed)return true;return allowed.includes(plan);};

// ─── ATOMS ────────────────────────────────────────────────────
const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,...style}}>{children}</div>;
const CT=({children,action})=><div style={{fontSize:10,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span>{children}</span>{action}</div>;
const Pill=({label,color})=><span style={{color,background:color+"22",border:`1px solid ${color}44`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
const Btn=({children,v="gold",onClick,sm,full,disabled})=>{
  const S={gold:{bg:C.gold,fg:C.dark},green:{bg:C.green+"22",fg:C.green},red:{bg:C.red+"22",fg:C.red},blue:{bg:C.blue+"22",fg:C.blue},ghost:{bg:C.card2,fg:C.muted},purple:{bg:C.purple+"22",fg:C.purple},orange:{bg:C.orange+"22",fg:C.orange},teal:{bg:C.teal+"22",fg:C.teal}};
  const x=S[v]||S.gold;
  return <button onClick={onClick} disabled={disabled} style={{background:disabled?C.border:x.bg,color:disabled?C.muted:x.fg,border:"none",borderRadius:6,padding:sm?"4px 9px":"7px 15px",cursor:disabled?"not-allowed":"pointer",fontSize:sm?10:12,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap",width:full?"100%":"auto",opacity:disabled?0.5:1}}>{children}</button>;
};
const Inp=({placeholder,value,onChange,type="text",style={}})=><input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 11px",color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",...style}}/>;
const Sel=({value,onChange,options,style={}})=><select value={value} onChange={onChange} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 11px",color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",...style}}>{options.map((o,i)=><option key={i} value={o.v||o}>{o.l||o}</option>)}</select>;
const TH=({heads,rows})=><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{heads.map((h,i)=><th key={i} style={{color:C.muted,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",padding:"7px 10px",borderBottom:`1px solid ${C.border}`,textAlign:"left",fontWeight:400}}>{h}</th>)}</tr></thead><tbody>{rows}</tbody></table>;
const Td=({children,s={}})=><td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}22`,verticalAlign:"middle",...s}}>{children}</td>;
const STitle=({children,sub})=><div style={{marginBottom:20}}><div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:700,color:C.text}}>{children}</div>{sub&&<div style={{fontSize:12,color:C.muted,marginTop:4}}>{sub}</div>}</div>;
const KPI=({label,val,sub,trend,up,color,onClick,badge})=><Card style={{cursor:onClick?"pointer":"default",borderColor:badge>0?`${C.gold}55`:C.border}} onClick={onClick}><CT>{label}{badge>0&&<span style={{background:C.red,color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:700}}>{badge}</span>}</CT><div style={{fontSize:24,fontWeight:700,color:color||C.gold,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.1}}>{val}</div>{sub&&<div style={{fontSize:10,color:C.muted,marginTop:3}}>{sub}</div>}{trend&&<div style={{fontSize:10,color:up?C.green:C.orange,marginTop:3}}>{up?"↗":"⚠"} {trend}</div>}</Card>;
const Tabs=({tabs,active,onChange})=><div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>{tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{background:active===t.id?`${C.gold}22`:"transparent",border:`1px solid ${active===t.id?C.gold:t.urgent?C.orange:C.border}`,color:active===t.id?C.gold:t.urgent?C.orange:C.muted,borderRadius:7,padding:"5px 13px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:t.urgent?600:400}}>{t.label}</button>)}</div>;
const SM={"en_attente":{c:C.gold,l:"⏳ En attente"},"validé":{c:C.green,l:"✓ Validé"},"refusé":{c:C.red,l:"✕ Refusé"},"actif":{c:C.green,l:"● Actif"},"inactif":{c:C.muted,l:"○ Inactif"},"VIP":{c:C.gold,l:"✦ VIP"},"confirmé":{c:C.green,l:"✓ Confirmé"},"en attente":{c:C.gold,l:"⏳ Attente"},"en mission":{c:C.blue,l:"▶ Mission"},"disponible":{c:C.green,l:"● Dispo"},"complété":{c:C.green,l:"✓ Complété"},"en cours":{c:C.blue,l:"▶ En cours"},"à faire":{c:C.muted,l:"○ À faire"},"encaissé":{c:C.green,l:"✓ Encaissé"},"signé":{c:C.green,l:"✓ Signé"},"Starter":{c:C.blue,l:"◎ Starter"},"Business Pro":{c:C.gold,l:"✦ Business Pro"},"Enterprise":{c:C.purple,l:"◈ Enterprise"},"Qualifié":{c:C.blue,l:"◎ Qualifié"},"Proposition":{c:C.gold,l:"◈ Proposition"},"Négociation":{c:C.orange,l:"⚡ Négociation"},"Gagné":{c:C.green,l:"✓ Gagné"},"Perdu":{c:C.red,l:"✕ Perdu"},"Nouveau":{c:C.muted,l:"○ Nouveau"},"ouvert":{c:C.green,l:"● Ouvert"},"complet":{c:C.gold,l:"✦ Complet"},"mission":{c:C.blue,l:"◈ Mission"},"rdv":{c:C.purple,l:"◎ RDV"}};
const St=({s})=>{const m=SM[s]||{c:C.muted,l:s};return <Pill label={m.l} color={m.c}/>;};

// ─── MURO DE UPGRADE ─────────────────────────────────────────
const UpgradeWall=({page,onUpgrade,planActuel})=>{
  const descriptions={
    overview:"Pilote ton business en temps réel — KPIs, health score, briefing hebdo automatique",
    crm:"Pipeline commercial visuel, suivi prospects, historique complet des interactions",
    devis:"Génération de devis PDF, validation, e-signature client, suivi statut",
    investissement:"Recommandations IA personnalisées, simulateur de scénarios, plan d'action chiffré",
    compta:"Comptabilité complète, TVA, bilan mensuel, export pour comptable",
    tresorerie:"Projection cash-flow 90 jours, alertes seuil critique, trésorerie prévisionnelle",
    analytique:"Prédiction CA, recommandations IA, graphiques d'évolution",
    clients:"CRM clients complet, historique prestations, scoring, agenda RDV",
    partenaires:"Gestion commissions, chat partenaires, suivi affaires dans les deux sens",
    annuaire:"Réseau B2B mondial, mises en relation, opportunités business, 15–30% commission",
    wallet_membres:"Wallets de tous vos membres, IBAN mondial, gestion centralisée",
    evenements:"Événements networking, billetterie, inscriptions",
    scoring:"NPS automatique, avis Google, classement clients",
    equipe:"Gestion équipe, chat interne, planning congés, formation",
    planning:"Planning missions et RDV, lien de réservation automatique",
    prospection:"Bots Thomas & Abou — prospection automatique calibrée par secteur",
    stock:"Gestion stock, alertes réapprovisionnement automatiques",
    services:"Catalogue services personnalisable, ajout/suppression libre",
    notifications:"Alertes intelligentes WhatsApp, notifications temps réel",
    signature:"Contrats automatiques, e-signature, archivage",
    formation:"Base de formation équipe interne",
    deploiement:"Vendre Tymeless OS en white-label",
    api:"API publique, connexions externes, intégrations",
    settings:"Paramètres complets du système",
  };

  const PLAN_FEATURES={
    business:["Accès complet à tous les modules","Réseau & Annuaire B2B mondial","Mises en relation + commissions 15–30%","Prospection automatique (Thomas & Abou)","CRM complet + Devis + E-signature","Comptabilité + Trésorerie + Analytique IA","Gestion équipe, stock, planning","Notifications intelligentes WhatsApp","Contrats automatiques + API"],
    enterprise:["Tout Business Pro","Bot WhatsApp Claude intégré dans votre business","Support dédié prioritaire","White-label — votre propre branding","Déploiement SaaS revendable","Commissions négociées sur mesure"],
  };

  return(
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{maxWidth:580,width:"100%"}}>
        <div style={{position:"relative",marginBottom:24,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
          <div style={{background:C.card,padding:20,filter:"blur(4px)",opacity:0.4,pointerEvents:"none",userSelect:"none"}}>
            <div style={{height:16,background:C.card2,borderRadius:4,width:"60%",marginBottom:10}}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {[1,2,3].map(i=><div key={i} style={{height:60,background:C.card2,borderRadius:8}}/>)}
            </div>
            <div style={{height:120,background:C.card2,borderRadius:8}}/>
          </div>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#00000055"}}>
            <div style={{fontSize:36,marginBottom:8}}>🔒</div>
            <div style={{fontSize:13,fontWeight:600,color:C.text,textAlign:"center"}}>Fonctionnalité Business Pro</div>
          </div>
        </div>

        <Card style={{borderColor:C.gold+"55",background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:13,color:C.muted,marginBottom:6}}>Tu vois un aperçu de</div>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,color:C.text,marginBottom:6}}>
              {descriptions[page]||"Cette fonctionnalité avancée"}
            </div>
            <div style={{fontSize:12,color:C.muted}}>Débloque Business Pro pour y accéder</div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
            <div style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>Ton plan actuel</div>
              <div style={{fontWeight:700,color:C.blue,fontSize:14,marginBottom:4}}>◎ Starter</div>
              <div style={{fontSize:11,color:C.gold,marginBottom:10}}>29€/mois</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {["Wallet & paiements","Carte virtuelle Visa","IBAN mondial","Historique transactions"].map((f,i)=>(
                  <div key={i} style={{fontSize:11,color:C.green,display:"flex",gap:6}}><span>✓</span>{f}</div>
                ))}
              </div>
            </div>
            <div style={{background:`${C.gold}11`,borderRadius:10,padding:14,border:`1px solid ${C.gold}44`}}>
              <div style={{fontSize:10,color:C.gold,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>Passer à</div>
              <div style={{fontWeight:700,color:C.gold,fontSize:14,marginBottom:4}}>✦ Business Pro</div>
              <div style={{fontSize:11,color:C.gold,marginBottom:10}}>99€/mois</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {PLAN_FEATURES.business.slice(0,5).map((f,i)=>(
                  <div key={i} style={{fontSize:11,color:C.text,display:"flex",gap:6}}><span style={{color:C.gold}}>✦</span>{f}</div>
                ))}
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>+ {PLAN_FEATURES.business.length-5} autres fonctionnalités...</div>
              </div>
            </div>
          </div>

          <div style={{display:"flex",gap:10}}>
            <Btn v="gold" full onClick={()=>onUpgrade("business")}>✦ Passer Business Pro — 99€/mois</Btn>
          </div>
          <div style={{marginTop:10}}>
            <Btn v="purple" full onClick={()=>onUpgrade("enterprise")}>◈ Ou passer Enterprise — 150€/mois (Bot WhatsApp inclus)</Btn>
          </div>
          <div style={{textAlign:"center",marginTop:12,fontSize:11,color:C.muted}}>
            Sans engagement · Résiliation à tout moment · Accès immédiat
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── CHAT ─────────────────────────────────────────────────────
const Chat=({msgs:initMsgs,contacts,me="Béné"})=>{
  const [msgs,setMsgs]=useState(initMsgs);
  const [inp,setInp]=useState("");
  const [dest,setDest]=useState(contacts[0]||"Tous");
  const ref=useRef(null);
  const AV={T:C.gold,A:C.blue,B:C.green,L:C.orange,F:C.purple};
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs]);
  const send=()=>{if(!inp.trim())return;setMsgs(p=>[...p,{id:Date.now(),auteur:me,av:me[0],msg:inp,h:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),lu:true,isMe:true}]);setInp("");};
  const filtered=msgs.filter(m=>dest==="Tous"||m.auteur===dest||m.isMe);
  return(
    <div style={{display:"flex",gap:12,height:420}}>
      <div style={{width:155,background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:8,display:"flex",flexDirection:"column",gap:3}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",padding:"4px 6px 6px"}}>Contacts</div>
        {["Tous",...contacts].map(n=>(
          <button key={n} onClick={()=>setDest(n)} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 8px",cursor:"pointer",background:dest===n?`${C.gold}11`:"transparent",border:dest===n?`1px solid ${C.gold}33`:"1px solid transparent",borderRadius:6,color:dest===n?C.gold:C.muted,fontSize:11,fontFamily:"inherit",textAlign:"left"}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:AV[n[0]]||C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.dark,flexShrink:0}}>{n[0]}</div>
            <span style={{flex:1}}>{n}</span>
            {n==="Tous"&&msgs.filter(m=>!m.lu&&!m.isMe).length>0&&<span style={{background:C.red,color:"#fff",borderRadius:20,padding:"0 5px",fontSize:9,fontWeight:700}}>{msgs.filter(m=>!m.lu&&!m.isMe).length}</span>}
          </button>
        ))}
      </div>
      <div style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"8px 13px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,background:C.card2}}>
          <span style={{fontSize:12,fontWeight:600}}>💬 {dest==="Tous"?"Groupe":dest}</span>
          <Pill label="● en ligne" color={C.green}/>
          <div style={{marginLeft:"auto",display:"flex",gap:5}}><Btn sm v="ghost">📎</Btn><Btn sm v="ghost">📷</Btn></div>
        </div>
        <div ref={ref} style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:9}}>
          {filtered.map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:m.isMe?"row-reverse":"row",gap:6,alignItems:"flex-end"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:AV[m.av]||C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.dark,flexShrink:0}}>{m.av}</div>
              <div>
                {!m.isMe&&<div style={{fontSize:9,color:C.muted,marginBottom:2}}>{m.auteur}</div>}
                <div style={{background:m.isMe?`${C.gold}22`:C.card2,border:`1px solid ${m.isMe?C.gold+"44":C.border}`,borderRadius:m.isMe?"10px 10px 2px 10px":"10px 10px 10px 2px",padding:"7px 11px",fontSize:12,maxWidth:260,lineHeight:1.45}}>{m.msg}</div>
                <div style={{fontSize:9,color:C.muted,marginTop:2,textAlign:m.isMe?"right":"left"}}>{m.h}{m.isMe?" ✓✓":!m.lu?" ●":""}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:7,padding:9,borderTop:`1px solid ${C.border}`,background:C.card2}}>
          <Inp placeholder="Écrire un message..." value={inp} onChange={e=>setInp(e.target.value)} style={{flex:1}}/>
          <button onClick={send} style={{background:C.gold,border:"none",borderRadius:6,width:34,height:34,cursor:"pointer",color:C.dark,fontSize:13,fontWeight:700,flexShrink:0}}>➤</button>
        </div>
      </div>
    </div>
  );
};

// ─── WALLET COMPONENTS ────────────────────────────────────────
const PayCard=({item,color,onPay,btnLabel})=>(
  <Card style={{borderColor:color+"44",marginBottom:12}}>
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:44,height:44,borderRadius:"50%",background:color+"22",border:`2px solid ${color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color,fontWeight:700,flexShrink:0}}>{inits(item.nom)}</div>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,fontSize:14}}>{item.nom}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2}}>{item.role||item.motif||item.service} · <span style={{fontFamily:"monospace",color:C.gold,fontSize:10}}>{item.id}</span></div>
        <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}><Pill label={item.methode} color={C.blue}/>{item.tel&&<Pill label={item.tel} color={C.muted}/>}{item.iban&&<Pill label={item.iban} color={C.muted}/>}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:22,fontWeight:700,color,fontFamily:"'Playfair Display',Georgia,serif"}}>{fmt(item.montant,item.devise||"EUR")}</div>
        {item.devise&&item.devise!=="EUR"&&<div style={{fontSize:10,color:C.muted}}>≈ {fmt(conv(item.montant,item.devise,"EUR"),"EUR")}</div>}
        <div style={{marginTop:10}}><Btn v="gold" onClick={onPay}>{btnLabel} →</Btn></div>
      </div>
    </div>
  </Card>
);

const Convertisseur=()=>{
  const [m,setM]=useState("1000");const [de,setDe]=useState("EUR");const [ve,setVe]=useState("XOF");
  const r=conv(Number(m)||0,de,ve);
  return(
    <div style={{display:"flex",gap:14,alignItems:"flex-end",flexWrap:"wrap"}}>
      <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Montant</div><Inp type="number" value={m} onChange={e=>setM(e.target.value)} style={{width:120}}/></div>
      <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>De</div><Sel value={de} onChange={e=>setDe(e.target.value)} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:150}}/></div>
      <div style={{fontSize:18,color:C.muted,paddingBottom:8}}>→</div>
      <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Vers</div><Sel value={ve} onChange={e=>setVe(e.target.value)} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:150}}/></div>
      <div style={{background:C.gold+"11",border:`1px solid ${C.gold}44`,borderRadius:8,padding:"10px 18px",textAlign:"center"}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:3}}>{m} {de} =</div>
        <div style={{fontSize:22,fontWeight:700,color:C.gold,fontFamily:"'Playfair Display',Georgia,serif"}}>{fmt(r,ve)}</div>
      </div>
    </div>
  );
};

const ModalConfirmPay=({item,onConfirm,onCancel})=>(
  <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
    <div style={{background:C.card,border:`1px solid ${C.gold}55`,borderRadius:14,padding:28,width:420,boxShadow:"0 20px 60px #000000AA"}}>
      <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:C.text,marginBottom:6}}>Confirmer le paiement</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:20}}>Vérifiez les détails avant d'envoyer</div>
      <div style={{background:C.card2,borderRadius:10,padding:16,marginBottom:16}}>
        {[["Destinataire",item.nom],["Montant",fmt(item.montant,item.devise||"EUR")],["Méthode",item.methode],["Contact",item.tel||item.iban||item.email||"—"],["Référence",item.id]].map(([l,v],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"6px 0",borderBottom:i<4?`1px solid ${C.border}22`:"none"}}><span style={{color:C.muted}}>{l}</span><span style={{color:C.text,fontWeight:i===1?700:400}}>{v}</span></div>
        ))}
      </div>
      <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:8,padding:10,marginBottom:18,fontSize:11,color:C.green}}>📱 Lien de paiement envoyé sur WhatsApp · Facture générée automatiquement</div>
      <div style={{display:"flex",gap:10}}><Btn v="ghost" full onClick={onCancel}>Annuler</Btn><Btn v="gold" full onClick={()=>onConfirm(item)}>✓ Confirmer & Envoyer</Btn></div>
    </div>
  </div>
);

const ModalDemandePaiement=({onClose,onSend})=>{
  const [step,setStep]=useState(1);
  const [done,setDone]=useState(false);
  const [form,setForm]=useState({nom:"",tel:"",email:"",montant:"",devise:"EUR",methode:"flutterwave",type:"envoyer",description:"",destinataire_type:"client"});
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const DEST_TYPES=[{v:"client",l:"👤 Client"},{v:"fournisseur",l:"🏭 Fournisseur"},{v:"partenaire",l:"🤝 Partenaire"},{v:"apporteur",l:"🔗 Apporteur AA"},{v:"collaborateur",l:"👷 Collaborateur"},{v:"remboursement",l:"↩️ Remboursement"},{v:"autre",l:"✦ Autre"}];
  const METHODES_ALL=[
    {id:"flutterwave",icon:"🌍",nom:"Flutterwave",desc:"Wave · Orange Money · MTN · Visa · Mastercard",zone:"Monde entier + Afrique",color:C.gold},
    {id:"stripe",icon:"💳",nom:"Stripe",desc:"Visa · Mastercard · SEPA · Apple Pay",zone:"Europe & Monde",color:C.blue},
    {id:"wave",icon:"🌊",nom:"Wave",desc:"Paiement mobile instantané",zone:"Sénégal · Côte d'Ivoire",color:"#1A73E8"},
    {id:"orange",icon:"🟠",nom:"Orange Money",desc:"Mobile money",zone:"Afrique francophone",color:C.orange},
    {id:"mtn",icon:"🟡",nom:"MTN Money",desc:"Mobile money",zone:"Afrique sub-saharienne",color:"#FFCC00"},
    {id:"sepa",icon:"🏦",nom:"Virement SEPA",desc:"Virement bancaire",zone:"Europe",color:C.green},
    {id:"whatsapp",icon:"💬",nom:"Lien WhatsApp",desc:"Lien de paiement envoyé sur WA",zone:"Global",color:"#25D366"},
  ];
  const methode=METHODES_ALL.find(m=>m.id===form.methode)||METHODES_ALL[0];
  const isValid=form.nom&&form.montant&&Number(form.montant)>0;
  const handleConfirm=()=>{onSend(form);setDone(true);};
  return(
    <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
      <div style={{background:C.card,border:`1px solid ${C.gold}55`,borderRadius:14,padding:28,width:520,maxWidth:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px #000000AA"}}>

        {/* ÉTAPE SUCCÈS */}
        {done?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:52,marginBottom:16}}>🎉</div>
            <div style={{fontSize:18,fontWeight:700,color:C.green,marginBottom:8}}>
              {form.type==="envoyer"?"Paiement envoyé !":"Lien envoyé !"}
            </div>
            <div style={{fontSize:13,color:C.muted,marginBottom:20,lineHeight:1.7}}>
              {form.type==="envoyer"?`${form.nom} a été payé de ${fmt(Number(form.montant),form.devise)}`:`${form.nom} a reçu le lien de paiement`}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,background:C.card2,borderRadius:10,padding:14,marginBottom:20,textAlign:"left"}}>
              {[
                ["📲 WhatsApp","Confirmation envoyée automatiquement",C.green],
                ["📧 Email","Facture PDF envoyée automatiquement",C.blue],
                ["🧾 Facture","Générée et archivée dans l'historique",C.gold],
              ].map(([ico,txt,c],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,fontSize:12}}>
                  <span style={{fontSize:16}}>{ico}</span>
                  <span style={{color:C.muted}}>{txt}</span>
                  <span style={{color:c,marginLeft:"auto"}}>✓</span>
                </div>
              ))}
            </div>
            <Btn v="gold" full onClick={onClose}>Fermer</Btn>
          </div>
        ):(
          <>
            {/* HEADER */}
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,marginBottom:12}}>
                {form.type==="envoyer"?"⚡ Envoyer un paiement":"📲 Encaisser un paiement"}
              </div>
              {/* Steps indicator */}
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}>
                {["Destinataire","Récapitulatif & Paiement","Confirmation"].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:step>i+1?C.green:step===i+1?C.gold:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:step>i+1?"#000":step===i+1?"#000":C.muted,flexShrink:0}}>
                      {step>i+1?"✓":i+1}
                    </div>
                    <span style={{fontSize:10,color:step===i+1?C.gold:C.muted,whiteSpace:"nowrap"}}>{s}</span>
                    {i<2&&<div style={{width:16,height:1,background:step>i+1?C.green:C.border,flexShrink:0}}/>}
                  </div>
                ))}
              </div>
              {/* Toggle Envoyer / Encaisser */}
              <div style={{display:"flex",background:C.card2,borderRadius:8,padding:3,gap:3}}>
                {[{v:"envoyer",l:"⚡ Envoyer"},{v:"recevoir",l:"📲 Encaisser"}].map(t=>(
                  <button key={t.v} onClick={()=>setForm(p=>({...p,type:t.v}))} style={{flex:1,padding:"7px",border:"none",borderRadius:6,background:form.type===t.v?C.gold:"transparent",color:form.type===t.v?"#000":C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,transition:"all 0.2s"}}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>

            {/* ÉTAPE 1 — DESTINATAIRE */}
            {step===1&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {/* Type destinataire */}
                <div>
                  <div style={{fontSize:9,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Type</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {DEST_TYPES.map(t=>(
                      <button key={t.v} onClick={()=>setForm(p=>({...p,destinataire_type:t.v}))} style={{padding:"4px 10px",border:`1px solid ${form.destinataire_type===t.v?C.gold:C.border}`,borderRadius:20,background:form.destinataire_type===t.v?`${C.gold}22`:"transparent",color:form.destinataire_type===t.v?C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nom complet *</div><Inp placeholder="Ex: Sofia Riad, CleanPro, Thomas..." value={form.nom} onChange={set("nom")} style={{width:"100%"}}/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>WhatsApp / Téléphone *</div><Inp placeholder="+33 6 12 34 56 78" value={form.tel} onChange={set("tel")} style={{width:"100%"}}/></div>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Email (optionnel)</div><Inp type="email" placeholder="contact@exemple.fr" value={form.email} onChange={set("email")} style={{width:"100%"}}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Montant *</div><Inp type="number" placeholder="500" value={form.montant} onChange={set("montant")} style={{width:"100%"}}/></div>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Devise</div><Sel value={form.devise} onChange={set("devise")} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:"100%"}}/></div>
                </div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Motif / Description</div><Inp placeholder="Ex: Nettoyage Airbnb, Commission janvier, Remboursement..." value={form.description} onChange={set("description")} style={{width:"100%"}}/></div>
                <div style={{display:"flex",gap:10,marginTop:4}}>
                  <Btn v="ghost" full onClick={onClose}>Annuler</Btn>
                  <Btn v="gold" full onClick={()=>isValid&&setStep(2)}>Suivant →</Btn>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 — RÉCAP + MOYEN DE PAIEMENT */}
            {step===2&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {/* RÉCAP */}
                <div style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.gold}33`}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.gold,marginBottom:10}}>✦ Récapitulatif</div>
                  {[
                    ["Action", form.type==="envoyer"?"⚡ Envoi de paiement":"📲 Encaissement"],
                    ["Destinataire", form.nom],
                    ["Type", DEST_TYPES.find(t=>t.v===form.destinataire_type)?.l||form.destinataire_type],
                    ["Montant", fmt(Number(form.montant),form.devise)],
                    ["WhatsApp", form.tel],
                    form.email&&["Email", form.email],
                    form.description&&["Motif", form.description],
                  ].filter(Boolean).map(([l,v],i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                      <span style={{color:C.muted}}>{l}</span>
                      <span style={{color:i===3?C.gold:C.text,fontWeight:i===3?700:500}}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* CHOIX MOYEN DE PAIEMENT */}
                <div>
                  <div style={{fontSize:9,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Moyen de paiement</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                    {METHODES_ALL.map(mp=>(
                      <button key={mp.id} onClick={()=>setForm(p=>({...p,methode:mp.id}))} style={{background:form.methode===mp.id?mp.color+"22":C.card2,border:`2px solid ${form.methode===mp.id?mp.color:C.border}`,borderRadius:8,padding:"10px 12px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s"}}>
                        <div style={{fontSize:18,marginBottom:3}}>{mp.icon}</div>
                        <div style={{fontSize:11,fontWeight:700,color:form.methode===mp.id?mp.color:C.text}}>{mp.nom}</div>
                        <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{mp.desc}</div>
                        <div style={{fontSize:9,color:form.methode===mp.id?mp.color:C.muted,fontWeight:500}}>{mp.zone}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* APERÇU WHATSAPP */}
                <div style={{background:"#075E54",borderRadius:10,padding:14}}>
                  <div style={{fontSize:9,color:"#25D366",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>💬 Message WhatsApp automatique</div>
                  <div style={{background:"#128C7E",borderRadius:"12px 12px 12px 2px",padding:"10px 14px",fontSize:12,color:"#fff",lineHeight:1.8}}>
                    Bonjour {form.nom} 👋<br/>
                    {form.type==="envoyer"?<>Votre paiement de <b>{fmt(Number(form.montant),form.devise)}</b> a été envoyé ✅</>:<>Voici votre lien de paiement Tymeless :<br/><span style={{color:"#25D366"}}>https://pay.tymeless.fr/lien</span><br/>💰 <b>{fmt(Number(form.montant),form.devise)}</b>{form.description?` · ${form.description}`:""}</>}<br/>
                    <span style={{fontSize:10,color:"#aaa"}}>Facture PDF envoyée automatiquement ✅</span>
                  </div>
                </div>

                <div style={{display:"flex",gap:10}}>
                  <Btn v="ghost" full onClick={()=>setStep(1)}>← Retour</Btn>
                  <Btn v="gold" full onClick={handleConfirm}>
                    {methode.icon} {form.type==="envoyer"?"Envoyer via "+methode.nom:"Encaisser via "+methode.nom}
                  </Btn>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── PAGE WALLET ──────────────────────────────────────────────


// ─── IBAN MONDIAL ─────────────────────────────────────────────
const IbanMondial=({showToast})=>{
  const ZONES=[
    {zone:"🇪🇺 Europe",pays:[
      {pays:"France",code:"FR",format:"FR76 XXXX XXXX XXXX XXXX XXXX XXX",swift:"BNPAFRPP",devise:"EUR",symbole:"€"},
      {pays:"Belgique",code:"BE",format:"BE XX XXXX XXXX XXXX",swift:"GEBABEBB",devise:"EUR",symbole:"€"},
      {pays:"Allemagne",code:"DE",format:"DE XX XXXX XXXX XXXX XXXX XX",swift:"DEUTDEDB",devise:"EUR",symbole:"€"},
      {pays:"Espagne",code:"ES",format:"ES XX XXXX XXXX XXXX XXXX XXXX",swift:"CAIXESBB",devise:"EUR",symbole:"€"},
      {pays:"Italie",code:"IT",format:"IT XX X XXXX XXXXX XXXXXXXXXXXX",swift:"UNCRITMM",devise:"EUR",symbole:"€"},
      {pays:"Pays-Bas",code:"NL",format:"NL XX XXXX XXXXXXXXXXXX",swift:"ABNANL2A",devise:"EUR",symbole:"€"},
      {pays:"Suisse",code:"CH",format:"CH XX XXXXX XXXXXXXXXXXX",swift:"UBSWCHZH",devise:"CHF",symbole:"CHF"},
      {pays:"Royaume-Uni",code:"GB",format:"GB XX XXXX XXXXXX XXXXXXXX",swift:"BARCGB22",devise:"GBP",symbole:"£"},
      {pays:"Portugal",code:"PT",format:"PT XX XXXX XXXX XXXXXXXXXXXX XX",swift:"BCOMPTPL",devise:"EUR",symbole:"€"},
      {pays:"Pologne",code:"PL",format:"PL XX XXXX XXXX XXXX XXXX XXXX XXXX",swift:"PKOPPLPW",devise:"PLN",symbole:"PLN"},
    ]},
    {zone:"🌍 Afrique",pays:[
      {pays:"Sénégal",code:"SN",format:"SN XX XXXXXXXXXXXXXXXXXXXXX",swift:"CBAOSNDA",devise:"XOF",symbole:"₣"},
      {pays:"Côte d'Ivoire",code:"CI",format:"CI XX XXXXXXXXXXXXXXXXXXXXX",swift:"BICICIAB",devise:"XOF",symbole:"₣"},
      {pays:"Cameroun",code:"CM",format:"CM XX XXXXXXXXXXXXXXXXXXXXX",swift:"BICECMCX",devise:"XAF",symbole:"₣"},
      {pays:"Maroc",code:"MA",format:"MA XX XXXXXXXXXXXXXXXXXXXXX",swift:"BCDMMCMC",devise:"MAD",symbole:"MAD"},
      {pays:"Tunisie",code:"TN",format:"TN XX XXXX XXXXXXXXXXXXX XX",swift:"BIATTNTT",devise:"TND",symbole:"TND"},
      {pays:"Algérie",code:"DZ",format:"DZ XX XXXXXXXXXXXXXXXXXXXXX",swift:"BADRDZAL",devise:"DZD",symbole:"DZD"},
      {pays:"Ghana",code:"GH",format:"GH XX XXXXXXXXXXXXXXXXXXXX",swift:"ECOCGHAC",devise:"GHS",symbole:"GHS"},
      {pays:"Nigeria",code:"NG",format:"NG XX XXXXXXXXXXXXXXXXXXXX",swift:"ZENBNL2A",devise:"NGN",symbole:"NGN"},
      {pays:"Kenya",code:"KE",format:"KE XX XXXXXXXXXXXXXXXXXXXX",swift:"KCBLKENX",devise:"KES",symbole:"KES"},
      {pays:"Afrique du Sud",code:"ZA",format:"ZA XX XXXXXX XXXXXXXXXX X",swift:"ABSAZAJJ",devise:"ZAR",symbole:"ZAR"},
    ]},
    {zone:"🌎 Amériques",pays:[
      {pays:"USA",code:"US",format:"Routing: XXXXXXXXX / Account: XXXXXXXXXXXXXXXXX",swift:"CHASUS33",devise:"USD",symbole:"$"},
      {pays:"Canada",code:"CA",format:"Transit: XXXXX / Institution: XXX / Account: XXXXXXXXX",swift:"ROYCCAT2",devise:"CAD",symbole:"CAD"},
      {pays:"Brésil",code:"BR",format:"BR XX XXXXXXX XXXXX XXXXXXXXXXX X X",swift:"BRASBRRJ",devise:"BRL",symbole:"BRL"},
      {pays:"Mexique",code:"MX",format:"MX XX XXXX XXXX XXXX XXXX XXXX XXXX",swift:"BCMRMXMM",devise:"MXN",symbole:"MXN"},
      {pays:"Argentine",code:"AR",format:"AR XX XXXXXXXXXXXXXXXXXXXX",swift:"BSUIARRA",devise:"ARS",symbole:"ARS"},
    ]},
    {zone:"🌏 Asie",pays:[
      {pays:"Chine",code:"CN",format:"CNAPS: XXXXXXXX / Account: XXXXXXXXXXXX",swift:"ICBKCNBJ",devise:"CNY",symbole:"¥"},
      {pays:"Japon",code:"JP",format:"Bank: XXXX / Branch: XXX / Account: XXXXXXXXX",swift:"BOTKJPJT",devise:"JPY",symbole:"¥"},
      {pays:"Inde",code:"IN",format:"IFSC: XXXX0XXXXXX / Account: XXXXXXXXXX",swift:"HDFCINBB",devise:"INR",symbole:"₹"},
      {pays:"Singapour",code:"SG",format:"SG XX XXXX XXXXXXXXXXXXX",swift:"DBSSSGSG",devise:"SGD",symbole:"SGD"},
      {pays:"Corée du Sud",code:"KR",format:"KR XX XXXX XXXX XXXX XXXX XXXX",swift:"HVBKKRSE",devise:"KRW",symbole:"₩"},
      {pays:"Hongkong",code:"HK",format:"HK XX XXXXXXXXXXXXXXXXX",swift:"HSBCHKHH",devise:"HKD",symbole:"HKD"},
    ]},
    {zone:"🇦🇪 Moyen-Orient",pays:[
      {pays:"Émirats Arabes Unis",code:"AE",format:"AE XX XXXX XXXXXXXXXXXXX",swift:"ADCBAEAA",devise:"AED",symbole:"AED"},
      {pays:"Qatar",code:"QA",format:"QA XX XXXX XXXXXXXXXXXXXXXXXXXX",swift:"QNBAQAQX",devise:"QAR",symbole:"QAR"},
      {pays:"Arabie Saoudite",code:"SA",format:"SA XX XXXX XXXXXXXXXXXXXXXXXXXX",swift:"RIBLSARI",devise:"SAR",symbole:"SAR"},
      {pays:"Koweït",code:"KW",format:"KW XX XXXX XXXXXXXXXXXXXXXXXXXX",swift:"KFHOKWKW",devise:"KWD",symbole:"KWD"},
      {pays:"Bahreïn",code:"BH",format:"BH XX XXXX XXXXXXXXXXXXXXXX",swift:"NBOBBHBM",devise:"BHD",symbole:"BHD"},
    ]},
  ];

  const [zoneActive,setZoneActive]=useState("🇪🇺 Europe");
  const [ibansConfigures,setIbansConfigures]=useState([
    {id:1,pays:"France",code:"FR",iban:"FR76 3000 4000 0300 0000 1234 567",swift:"BNPAFRPP",devise:"EUR",projet:"Principal",actif:true,recu:12480},
    {id:2,pays:"Sénégal",code:"SN",iban:"SN08 SN060 101 100 152 000 00111 223",swift:"CBAOSNDA",devise:"XOF",projet:"Airbnb",actif:true,recu:4200},
  ]);
  const [modalAjouter,setModalAjouter]=useState(null);
  const [modalVirement,setModalVirement]=useState(false);
  const [nouvelIban,setNouvelIban]=useState({pays:"",iban:"",swift:"",devise:"",projet:"",bic:""});
  const [virementMasse,setVirementMasse]=useState([{nom:"",iban:"",montant:""}]);
  const [virementRecurrent,setVirementRecurrent]=useState({destinataire:"",iban:"",montant:"",frequence:"mensuel",prochaine:""});

  const PROJETS=["Principal","Airbnb","Jet Privé","Yacht","Rapatriement","Résidentiel","Bureaux"];

  const ajouterIban=()=>{
    if(!nouvelIban.iban||!nouvelIban.pays)return;
    setIbansConfigures(p=>[...p,{id:Date.now(),...nouvelIban,actif:true,recu:0}]);
    setModalAjouter(null);
    setNouvelIban({pays:"",iban:"",swift:"",devise:"",projet:"",bic:""});
    showToast("✓ IBAN ajouté avec succès !");
  };

  const paysActifs=ZONES.find(z=>z.zone===zoneActive)?.pays||[];

  return(
    <div>
      {/* MODAL AJOUTER IBAN */}
      {modalAjouter&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:28,width:480,maxWidth:"100%",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>🏦 Ajouter un IBAN</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Format : {modalAjouter.format}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{background:C.card2,borderRadius:8,padding:10,display:"flex",gap:10,alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:20}}>🏛️</span>
                <div><div style={{fontWeight:600,fontSize:13}}>{modalAjouter.pays}</div><div style={{fontSize:11,color:C.muted}}>SWIFT : {modalAjouter.swift} · {modalAjouter.devise}</div></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>IBAN / Numéro de compte *</div><Inp placeholder={modalAjouter.format} value={nouvelIban.iban} onChange={e=>setNouvelIban(p=>({...p,iban:e.target.value,pays:modalAjouter.pays,devise:modalAjouter.devise,swift:modalAjouter.swift}))} style={{width:"100%",fontFamily:"monospace"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Code SWIFT / BIC</div><Inp placeholder={modalAjouter.swift} value={nouvelIban.swift||modalAjouter.swift} onChange={e=>setNouvelIban(p=>({...p,swift:e.target.value}))} style={{width:"100%",fontFamily:"monospace"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nom de la banque (optionnel)</div><Inp placeholder="Ex: BNP Paribas, CIB, Ecobank..." value={nouvelIban.banque||""} onChange={e=>setNouvelIban(p=>({...p,banque:e.target.value}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Projet lié</div><Sel value={nouvelIban.projet} onChange={e=>setNouvelIban(p=>({...p,projet:e.target.value}))} options={[{v:"",l:"Choisir..."},...PROJETS.map(p=>({v:p,l:p}))]} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Notes internes</div><Inp placeholder="Ex: Compte dédié clients Afrique" value={nouvelIban.notes||""} onChange={e=>setNouvelIban(p=>({...p,notes:e.target.value}))} style={{width:"100%"}}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <Btn v="ghost" full onClick={()=>setModalAjouter(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={ajouterIban}>✓ Ajouter cet IBAN</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIREMENT EN MASSE */}
      {modalVirement&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:28,width:560,maxWidth:"100%",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:16}}>⚡ Virement en masse</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr auto",gap:6,marginBottom:6}}>
              {["Destinataire","IBAN","Montant",""].map((h,i)=><div key={i} style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>{h}</div>)}
            </div>
            {virementMasse.map((v,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr auto",gap:6,marginBottom:6,alignItems:"center"}}>
                <Inp placeholder="Nom" value={v.nom} onChange={e=>setVirementMasse(p=>p.map((x,j)=>j===i?{...x,nom:e.target.value}:x))} style={{width:"100%"}}/>
                <Inp placeholder="FR76 ..." value={v.iban} onChange={e=>setVirementMasse(p=>p.map((x,j)=>j===i?{...x,iban:e.target.value}:x))} style={{width:"100%",fontFamily:"monospace",fontSize:10}}/>
                <Inp type="number" placeholder="500" value={v.montant} onChange={e=>setVirementMasse(p=>p.map((x,j)=>j===i?{...x,montant:e.target.value}:x))} style={{width:"100%"}}/>
                <button onClick={()=>setVirementMasse(p=>p.filter((_,j)=>j!==i))} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:5,padding:"4px 7px",cursor:"pointer",color:C.red,fontFamily:"inherit"}}>✕</button>
              </div>
            ))}
            <button onClick={()=>setVirementMasse(p=>[...p,{nom:"",iban:"",montant:""}])} style={{background:`${C.teal}11`,border:`1px dashed ${C.teal}44`,borderRadius:7,padding:"6px 14px",cursor:"pointer",color:C.teal,fontFamily:"inherit",fontSize:11,marginBottom:14}}>+ Ajouter un destinataire</button>
            <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:10,marginBottom:14}}>
              <div style={{fontSize:11,color:C.gold,fontWeight:600}}>Total : {fmt(virementMasse.reduce((s,v)=>s+(Number(v.montant)||0),0),"EUR")} · {virementMasse.length} destinataire(s)</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn v="ghost" full onClick={()=>setModalVirement(false)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{showToast(`⚡ ${virementMasse.length} virements envoyés !`);setModalVirement(false);}}>⚡ Envoyer tous les virements</Btn>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <KPI label="IBANs configurés" val={ibansConfigures.length} color={C.blue}/>
        <KPI label="Pays couverts" val="150+" color={C.teal}/>
        <KPI label="Reçu via IBAN" val={fmt(ibansConfigures.reduce((s,i)=>s+i.recu,0),"EUR")} color={C.green}/>
        <KPI label="Devises" val="30+" color={C.gold}/>
      </div>

      {/* IBANs CONFIGURÉS */}
      <Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
        <CT>
          🏦 Mes IBANs configurés
          <Btn sm v="gold" onClick={()=>{setZoneActive("🇪🇺 Europe");setModalAjouter(ZONES[0].pays[0]);}}>+ Ajouter un IBAN</Btn>
        </CT>
        {ibansConfigures.length===0?(
          <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:12}}>Aucun IBAN configuré · Ajoutez votre premier IBAN</div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {ibansConfigures.map((ib,i)=>(
              <div key={i} style={{background:C.card2,border:`1px solid ${ib.actif?C.teal:C.border}44`,borderRadius:10,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:20}}>🏛️</span>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:C.text}}>{ib.pays}</div>
                      <div style={{fontFamily:"monospace",fontSize:12,color:C.gold,letterSpacing:"0.05em"}}>{ib.iban}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <Pill label={ib.devise} color={C.blue}/>
                    {ib.projet&&<Pill label={ib.projet} color={C.teal}/>}
                    <Pill label={ib.actif?"✓ Actif":"○ Inactif"} color={ib.actif?C.green:C.muted}/>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:11,color:C.muted}}>SWIFT : {ib.swift} · Reçu : <span style={{color:C.green,fontWeight:600}}>{fmt(ib.recu,ib.devise)}</span></div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn sm v="ghost" onClick={()=>showToast("📋 IBAN copié !")}>📋 Copier</Btn>
                    <Btn sm v="ghost" onClick={()=>showToast("📲 Infos IBAN envoyées sur WhatsApp")}>📲 WA</Btn>
                    <Btn sm v="ghost" onClick={()=>showToast("📄 Relevé PDF généré")}>📄 PDF</Btn>
                    <Btn sm v={ib.actif?"red":"green"} onClick={()=>setIbansConfigures(p=>p.map((x,j)=>j===i?{...x,actif:!x.actif}:x))}>{ib.actif?"Désactiver":"Activer"}</Btn>
                    <Btn sm v="red" onClick={()=>setIbansConfigures(p=>p.filter((_,j)=>j!==i))}>🗑</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ACTIONS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card style={{borderColor:`${C.orange}44`}}>
          <CT>⚡ Virement en masse</CT>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:12}}>
            Envoyez des virements à 100+ personnes en 1 clic. Salaires, commissions, fournisseurs — tout en une seule opération.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {[{ico:"👥",l:"Salaires équipe",v:"3 personnes · 4 050€"},{ico:"🤝",l:"Commissions partenaires",v:"2 partenaires · 1 200€"},{ico:"🏭",l:"Fournisseurs du mois",v:"5 fournisseurs · 2 300€"}].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card2,borderRadius:7,padding:"8px 10px",fontSize:11}}>
                <div style={{display:"flex",gap:7,alignItems:"center"}}><span>{r.ico}</span><span style={{color:C.text}}>{r.l}</span></div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{color:C.muted}}>{r.v}</span><Btn sm v="ghost" onClick={()=>showToast(`⚡ Virements ${r.l} envoyés`)}>Envoyer</Btn></div>
              </div>
            ))}
            <Btn v="orange" full onClick={()=>setModalVirement(true)}>+ Virement personnalisé en masse</Btn>
          </div>
        </Card>

        <Card style={{borderColor:`${C.purple}44`}}>
          <CT>🔄 Virements récurrents</CT>
          <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Configurez des virements automatiques — salaires, loyers, abonnements.</div>
          {[
            {nom:"Thomas — Salaire",montant:"1 800€",freq:"Mensuel le 28",statut:"actif"},
            {nom:"Abou — Salaire",montant:"1 600€",freq:"Mensuel le 28",statut:"actif"},
            {nom:"Fatou — Salaire",montant:"1 400€",freq:"Mensuel le 28",statut:"actif"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
              <div><div style={{fontWeight:500,color:C.text}}>{r.nom}</div><div style={{color:C.muted,fontSize:10}}>{r.freq}</div></div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontWeight:700,color:C.gold}}>{r.montant}</span>
                <Pill label={r.statut==="actif"?"✓ Actif":"Inactif"} color={r.statut==="actif"?C.green:C.muted}/>
              </div>
            </div>
          ))}
          <div style={{marginTop:10}}><Btn v="ghost" full onClick={()=>showToast("+ Virement récurrent configuré")}>+ Nouveau virement récurrent</Btn></div>
        </Card>
      </div>

      {/* AJOUTER IBAN PAR ZONE */}
      <Card>
        <CT>🌍 Ajouter un IBAN — Tous les pays du monde</CT>
        {/* Zones */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {ZONES.map(z=>(
            <button key={z.zone} onClick={()=>setZoneActive(z.zone)} style={{padding:"5px 12px",border:`1px solid ${zoneActive===z.zone?C.gold:C.border}`,borderRadius:20,background:zoneActive===z.zone?`${C.gold}22`:C.card2,color:zoneActive===z.zone?C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{z.zone}</button>
          ))}
        </div>
        {/* Pays */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {paysActifs.map((p,i)=>(
            <button key={i} onClick={()=>{setNouvelIban({pays:p.pays,iban:"",swift:p.swift,devise:p.devise,projet:"",bic:""});setModalAjouter(p);}} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold+"44";e.currentTarget.style.background=`${C.gold}11`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card2;}}
            >
              <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:3}}>{p.pays}</div>
              <div style={{fontSize:10,color:C.muted,marginBottom:2}}>{p.code} · {p.devise}</div>
              <div style={{fontSize:9,color:C.teal}}>SWIFT : {p.swift}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* RAPPROCHEMENT BANCAIRE */}
      <Card style={{marginTop:14,borderColor:`${C.teal}44`}}>
        <CT>🔍 Rapprochement bancaire automatique</CT>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
          {[{l:"Transactions rapprochées",v:"47/51",c:C.green},{l:"Écarts détectés",v:"4",c:C.orange},{l:"Dernière sync",v:"Auj. 08:00",c:C.blue}].map((k,i)=>(
            <div key={i} style={{background:C.card2,borderRadius:8,padding:12,textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700,color:k.c}}>{k.v}</div>
              <div style={{fontSize:10,color:C.muted}}>{k.l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
          {[
            {desc:"Paiement Sofia Riad",wallet:"320€",banque:"320€",statut:"ok"},
            {desc:"Virement fournisseur CleanPro",wallet:"156€",banque:"156€",statut:"ok"},
            {desc:"Transaction non identifiée",wallet:"—",banque:"89€",statut:"ecart"},
            {desc:"Commission Thomas",wallet:"450€",banque:"—",statut:"ecart"},
          ].map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:8,alignItems:"center",background:r.statut==="ecart"?`${C.orange}08`:C.card2,borderRadius:7,padding:"8px 12px",border:`1px solid ${r.statut==="ecart"?C.orange+"33":C.border}`}}>
              <span style={{fontSize:12,color:C.text}}>{r.desc}</span>
              <span style={{fontSize:11,color:C.gold,textAlign:"center"}}>{r.wallet}</span>
              <span style={{fontSize:11,color:C.teal,textAlign:"center"}}>{r.banque}</span>
              <Pill label={r.statut==="ok"?"✓ OK":"⚠️ Écart"} color={r.statut==="ok"?C.green:C.orange}/>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="teal" onClick={()=>showToast("🔄 Rapprochement lancé...")}>🔄 Lancer rapprochement</Btn>
          <Btn v="ghost" onClick={()=>showToast("📄 Rapport PDF exporté")}>📄 Exporter rapport</Btn>
        </div>
      </Card>

      {/* VIREMENT EXPRESS */}
      <Card style={{marginTop:14,borderColor:`${C.blue}44`}}>
        <CT>⚡ Virement express — Même jour</CT>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[["Destinataire","text","Sofia Riad ou IBAN FR76..."],["Montant","number","1000"],["Motif","text","Règlement facture FAC-001"]].map(([l,t,ph],i)=>(
              <div key={i}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} style={{width:"100%"}}/></div>
            ))}
            <Sel value="" onChange={()=>{}} options={[{v:"",l:"Choisir l'IBAN source..."},...ibansConfigures.map(ib=>({v:ib.id,l:`${ib.pays} — ${ib.iban.substring(0,16)}...`}))]} style={{width:"100%"}}/>
            <Btn v="blue" full onClick={()=>showToast("⚡ Virement express envoyé · Arrivée aujourd'hui avant 17h")}>⚡ Envoyer maintenant</Btn>
          </div>
          <div style={{background:C.card2,borderRadius:10,padding:14}}>
            <div style={{fontSize:11,fontWeight:600,color:C.blue,marginBottom:10}}>ℹ️ Virement express</div>
            {[["Délai","Même jour (avant 17h)"],["Disponibilité","Lun-Ven 8h-16h"],["Frais","0.50€ par virement"],["Confirmation","WhatsApp + Email auto"],["Traçabilité","Référence unique SWIFT"]].map(([l,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                <span style={{color:C.muted}}>{l}</span>
                <span style={{color:C.text,fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

const PageWallet=()=>{
  const [tab,setTab]=useState("wallet");
  const [histo,setHisto]=useState(INIT_HISTO);
  const [comm,setComm]=useState(INIT_COMM);
  const [remb,setRemb]=useState(INIT_REMB);
  const [four,setFour]=useState(INIT_FOUR);
  const [modal,setModal]=useState(null);
  const [demande,setDemande]=useState(false);
  const [showPayer,setShowPayer]=useState(false);
  const [toast,setToast]=useState(null);
  const [devise,setDevise]=useState("EUR");
  const [filtre,setFiltre]=useState("tous");
  const [alerteSeuil,setAlerteSeuil]=useState(500);
  const [gelCompte,setGelCompte]=useState(false);
  const [motDePasseModal,setMotDePasseModal]=useState(null);
  const [mdpInput,setMdpInput]=useState("");
  const [walletProjet,setWalletProjet]=useState([
    {id:"wp1",nom:"Airbnb",solde:2840,couleur:C.teal,icon:"🏠",budget:5000},
    {id:"wp2",nom:"Jet Privé",solde:8200,couleur:C.gold,icon:"✈️",budget:15000},
    {id:"wp3",nom:"Yacht",solde:3400,couleur:C.blue,icon:"🛥️",budget:10000},
    {id:"wp4",nom:"Rapatriement",solde:1200,couleur:C.purple,icon:"🕊️",budget:3000},
  ]);
  const [reglesAuto,setReglesAuto]=useState([
    {id:1,si:"Paiement reçu de Sofia",alors:"Envoyer 20% commission Thomas",actif:true},
    {id:2,si:"Solde > 10 000€",alors:"Notif WhatsApp Curtiss",actif:true},
    {id:3,si:"Facture non payée 48h",alors:"Rappel WA automatique",actif:true},
  ]);
  const [paiementsPlanifies,setPaiementsPlanifies]=useState([
    {id:1,nom:"Salaire Thomas",montant:1800,devise:"EUR",date:"28/05/2026",methode:"Virement",statut:"planifié"},
    {id:2,nom:"Commission Abou",montant:450,devise:"EUR",date:"30/05/2026",methode:"Flutterwave",statut:"planifié"},
  ]);
  const [splitConfig]=useState({wallet_principal:75,commissions:15,tva:10,actif:true});
  const [modalComm,setModalComm]=useState(null);
  const [modalRemb,setModalRemb]=useState(null);
  const [modalFour,setModalFour]=useState(null);
  const [modalPlan,setModalPlan]=useState(null);
  const [modalRegle,setModalRegle]=useState(null);
  const [modalProjet,setModalProjet]=useState(null);

  const showToast=(msg,color=C.green)=>{setToast({msg,color});setTimeout(()=>setToast(null),4000);};
  const payer=(item)=>{
    setModal(null);
    setComm(p=>p.filter(x=>x.id!==item.id));
    setRemb(p=>p.filter(x=>x.id!==item.id));
    setFour(p=>p.filter(x=>x.id!==item.id));
    setHisto(p=>[{id:`PAY-${Date.now()}`,type:"sortie",libelle:`${item.role||item.motif||item.service||"Paiement"} — ${item.nom}`,montant:item.montant,devise:item.devise||"EUR",methode:"Flutterwave",date:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),statut:"envoyé",ref:item.id,com:0},...p]);
    showToast(`✓ Paiement envoyé · ${item.nom} · Facture générée`);
  };

  const entrees=histo.filter(h=>h.type==="entree").reduce((s,h)=>s+conv(h.montant,h.devise,"EUR"),0);
  const sorties=histo.filter(h=>h.type==="sortie").reduce((s,h)=>s+conv(h.montant,h.devise,"EUR"),0);
  const soldeEUR=entrees-sorties;
  const solde=devise==="EUR"?soldeEUR:conv(soldeEUR,"EUR",devise);
  const enAtt=[...comm,...remb,...four].reduce((s,x)=>s+x.montant,0);
  const filtHisto=filtre==="tous"?histo:histo.filter(h=>h.type===filtre);
  const scoreFinancier=Math.min(100,Math.round((soldeEUR/(soldeEUR+enAtt+1))*100));

  const METHODES_ALL=[
    {id:"flutterwave",icon:"🌍",nom:"Flutterwave",desc:"Wave · Orange Money · MTN · Visa",zone:"Monde + Afrique",color:C.gold},
    {id:"stripe",icon:"💳",nom:"Stripe",desc:"Visa · Mastercard · SEPA",zone:"Europe & Monde",color:C.blue},
    {id:"wave",icon:"🌊",nom:"Wave",desc:"Mobile money",zone:"Sénégal · CI",color:"#1A73E8"},
    {id:"orange",icon:"🟠",nom:"Orange Money",desc:"Mobile money",zone:"Afrique francophone",color:C.orange},
    {id:"mtn",icon:"🟡",nom:"MTN Money",desc:"Mobile money",zone:"Afrique sub-saharienne",color:"#FFCC00"},
    {id:"sepa",icon:"🏦",nom:"Virement SEPA",desc:"Virement bancaire",zone:"Europe",color:C.green},
    {id:"whatsapp",icon:"💬",nom:"Lien WhatsApp",desc:"Lien de paiement WA",zone:"Global",color:"#25D366"},
  ];

  const DEST_TYPES=[
    {v:"client",l:"👤 Client"},{v:"fournisseur",l:"🏭 Fournisseur"},
    {v:"partenaire",l:"🤝 Partenaire"},{v:"apporteur",l:"🔗 Apporteur AA"},
    {v:"collaborateur",l:"👷 Collaborateur"},{v:"remboursement",l:"↩️ Remboursement"},{v:"autre",l:"✦ Autre"}
  ];

  const WTABS=[
    {id:"wallet",label:"💰 Wallet"},
    {id:"encaisser",label:"📲 Encaisser"},
    {id:"virement",label:"⚡ Virement instant"},
    {id:"projets",label:"🏷️ Wallets projets"},
    {id:"planifie",label:"📅 Planifié"},
    {id:"regles",label:"⚙️ Règles auto"},
    {id:"commissions",label:`📤 Commissions${comm.length>0?` (${comm.length})`:""}`,urgent:comm.length>0},
    {id:"remboursements",label:`↩️ Remboursements${remb.length>0?` (${remb.length})`:""}`},
    {id:"fournisseurs",label:`🏭 Fournisseurs${four.length>0?` (${four.length})`:""}`},
    {id:"ia",label:"🤖 IA & Alertes"},
    {id:"historique",label:"📋 Historique"},
    {id:"devises",label:"🌍 Devises"},
    {id:"iban",label:"🏦 IBAN Mondial"},
    {id:"saas",label:"🏢 Multi-entreprises"},
  ];

  // ── MODAL PAYER UNIVERSEL ──────────────────────────────────
  const ModalPayerUniversel=()=>{
    const [step,setStep]=useState(1);
    const [done,setDone]=useState(false);
    const [form,setForm]=useState({nom:"",tel:"",email:"",montant:"",devise:"EUR",methode:"flutterwave",type:"envoyer",description:"",destinataire_type:"client",memo:"",justificatif:"",expiration_lien:30});
    const setF=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
    const methode=METHODES_ALL.find(m=>m.id===form.methode)||METHODES_ALL[0];
    const montantNum=Number(form.montant)||0;
    const needsMdp=montantNum>=5000;
    const needsDoubleMdp=montantNum>=10000;
    const isValid=form.nom&&montantNum>0;

    const [loading,setLoading]=useState(false);
    const handleConfirm=()=>{
      if(needsMdp){
        setMotDePasseModal({
          montant:montantNum,
          onConfirm:()=>{
            setMotDePasseModal(null);
            setLoading(true);
            setTimeout(()=>{
              setLoading(false);setDone(true);
              setHisto(p=>[{id:`PAY-${Date.now()}`,type:form.type==="envoyer"?"sortie":"entree",libelle:`${form.description||form.destinataire_type} — ${form.nom}`,montant:montantNum,devise:form.devise,methode:methode.nom,date:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),statut:"envoyé",ref:`PAY-${Date.now()}`,com:0},...p]);
              showToast("✅ Paiement confirmé · WhatsApp + Email + Facture PDF générés");
            },2000);
          }
        });
        return;
      }
      setLoading(true);
      setTimeout(()=>{
        setLoading(false);setDone(true);
        setHisto(p=>[{id:`PAY-${Date.now()}`,type:form.type==="envoyer"?"sortie":"entree",libelle:`${form.description||form.destinataire_type} — ${form.nom}`,montant:montantNum,devise:form.devise,methode:methode.nom,date:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),statut:"envoyé",ref:`PAY-${Date.now()}`,com:0},...p]);
        showToast("✅ Paiement envoyé · WhatsApp + Email + Facture PDF générés");
      },2000);
    };

    return(
      <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,padding:16,overflowY:"auto"}}>
        <div style={{background:C.card,border:`1px solid ${C.gold}55`,borderRadius:14,padding:28,width:560,maxWidth:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px #000000AA"}}>
          {loading?(
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{fontSize:52,marginBottom:16,animation:"spin 1s linear infinite",display:"inline-block"}}>⏳</div>
              <div style={{fontSize:16,fontWeight:700,color:C.gold,marginBottom:8}}>Traitement en cours...</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:24}}>{methode.icon} Connexion à {methode.nom}...</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,background:C.card2,borderRadius:10,padding:14,textAlign:"left"}}>
                {[["📲","Envoi du message WhatsApp..."],["📧","Génération de la facture PDF..."],["📊","Mise à jour de l'historique..."],["🔒","Sécurisation de la transaction..."]].map(([ico,txt],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,fontSize:12,color:C.muted}}>
                    <span style={{fontSize:14}}>{ico}</span>{txt}
                    <div style={{marginLeft:"auto",width:14,height:14,borderRadius:"50%",border:`2px solid ${C.gold}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
                  </div>
                ))}
              </div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ):done?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:52,marginBottom:14}}>🎉</div>
              <div style={{fontSize:18,fontWeight:700,color:C.green,marginBottom:6}}>{form.type==="envoyer"?"Paiement envoyé !":"Lien envoyé !"}</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:20}}>{form.nom} · {fmt(montantNum,form.devise)} · {methode.nom}</div>
              <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:20,textAlign:"left"}}>
                {[["📲","Message WhatsApp personnalisé envoyé",C.green],["📧","Facture PDF professionnelle envoyée par email",C.blue],["🧾","Facture générée avec logo Tymeless",C.gold],["📊","Ajouté automatiquement à l'historique",C.purple],["⭐","Demande d'avis envoyée au client",C.teal]].map(([ico,d,c],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<4?`1px solid ${C.border}22`:"none"}}>
                    <span style={{fontSize:16}}>{ico}</span>
                    <span style={{flex:1,fontSize:12,color:C.muted}}>{d}</span>
                    <span style={{color:c}}>✓</span>
                  </div>
                ))}
              </div>
              <Btn v="gold" full onClick={()=>setShowPayer(false)}>Fermer</Btn>
            </div>
          ):(
            <>
              <div style={{marginBottom:18}}>
                <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,marginBottom:12}}>⚡ Paiement universel</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}>
                  {["Destinataire","Récap & Paiement","Confirmation"].map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:step>i+1?C.green:step===i+1?C.gold:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:step>i+1||step===i+1?"#000":C.muted,flexShrink:0}}>
                        {step>i+1?"✓":i+1}
                      </div>
                      <span style={{fontSize:10,color:step===i+1?C.gold:C.muted,whiteSpace:"nowrap"}}>{s}</span>
                      {i<2&&<div style={{width:16,height:1,background:step>i+1?C.green:C.border,flexShrink:0}}/>}
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",background:C.card2,borderRadius:8,padding:3,gap:3}}>
                  {[{v:"envoyer",l:"⚡ Envoyer"},{v:"recevoir",l:"📲 Encaisser"}].map(t=>(
                    <button key={t.v} onClick={()=>setForm(p=>({...p,type:t.v}))} style={{flex:1,padding:"7px",border:"none",borderRadius:6,background:form.type===t.v?C.gold:"transparent",color:form.type===t.v?"#000":C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              {step===1&&(
                <div style={{display:"flex",flexDirection:"column",gap:11}}>
                  <div>
                    <div style={{fontSize:9,color:C.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.1em"}}>Type</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {DEST_TYPES.map(t=>(
                        <button key={t.v} onClick={()=>setForm(p=>({...p,destinataire_type:t.v}))} style={{padding:"4px 10px",border:`1px solid ${form.destinataire_type===t.v?C.gold:C.border}`,borderRadius:20,background:form.destinataire_type===t.v?`${C.gold}22`:"transparent",color:form.destinataire_type===t.v?C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nom complet *</div><Inp placeholder="Sofia Riad, CleanPro, Thomas..." value={form.nom} onChange={setF("nom")} style={{width:"100%"}}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>WhatsApp *</div><Inp placeholder="+33 6..." value={form.tel} onChange={setF("tel")} style={{width:"100%"}}/></div>
                    <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Email</div><Inp type="email" placeholder="email@exemple.fr" value={form.email} onChange={setF("email")} style={{width:"100%"}}/></div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Montant *</div><Inp type="number" placeholder="500" value={form.montant} onChange={setF("montant")} style={{width:"100%"}}/></div>
                    <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Devise</div><Sel value={form.devise} onChange={setF("devise")} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:"100%"}}/></div>
                  </div>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Motif</div><Inp placeholder="Nettoyage Airbnb, Commission..." value={form.description} onChange={setF("description")} style={{width:"100%"}}/></div>
                  <div style={{background:C.card2,borderRadius:8,padding:12,border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:9,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Options avancées</div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      <div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>🖊️ Mémo interne (visible uniquement par vous)</div><Inp placeholder="Note privée..." value={form.memo} onChange={setF("memo")} style={{width:"100%"}}/></div>
                      <div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>📸 Justificatif (bon de commande, référence...)</div><Inp placeholder="Référence ou URL..." value={form.justificatif} onChange={setF("justificatif")} style={{width:"100%"}}/></div>
                      <div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>⏱️ Lien expire après</div><Sel value={form.expiration_lien} onChange={e=>setForm(p=>({...p,expiration_lien:Number(e.target.value)}))} options={[{v:15,l:"15 min"},{v:30,l:"30 min"},{v:60,l:"1 heure"},{v:1440,l:"24 heures"},{v:0,l:"Jamais"}]} style={{width:"100%"}}/></div>
                    </div>
                  </div>
                  {needsMdp&&(
                    <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>
                      {needsDoubleMdp?"🔒🔒 Double validation requise — montant ≥ 10 000€":"🔒 Validation par mot de passe — montant ≥ 5 000€"}
                    </div>
                  )}
                  <div style={{display:"flex",gap:10,marginTop:4}}>
                    <Btn v="ghost" full onClick={()=>setShowPayer(false)}>Annuler</Btn>
                    <Btn v="gold" full onClick={()=>isValid&&setStep(2)}>Suivant →</Btn>
                  </div>
                </div>
              )}

              {step===2&&(
                <div style={{display:"flex",flexDirection:"column",gap:11}}>
                  <div style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.gold}33`}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.gold,marginBottom:10}}>✦ Récapitulatif</div>
                    {[["Action",form.type==="envoyer"?"⚡ Envoi":"📲 Encaissement"],["Destinataire",form.nom],["Type",DEST_TYPES.find(t=>t.v===form.destinataire_type)?.l||""],["Montant",fmt(montantNum,form.devise)],form.email&&["Email",form.email],form.description&&["Motif",form.description],form.memo&&["Mémo",form.memo],form.expiration_lien>0&&["Expire","dans "+form.expiration_lien+" min"]].filter(Boolean).map(([l,v],i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                        <span style={{color:C.muted}}>{l}</span>
                        <span style={{color:i===3?C.gold:C.text,fontWeight:i===3?700:500}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {form.devise!=="EUR"&&(
                    <div style={{background:`${C.teal}11`,border:`1px solid ${C.teal}33`,borderRadius:8,padding:10,fontSize:11,color:C.teal}}>
                      🌍 ≈ {fmt(conv(montantNum,form.devise,"EUR"),"EUR")} · Taux du jour appliqué automatiquement
                    </div>
                  )}
                  <div>
                    <div style={{fontSize:9,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Moyen de paiement</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                      {METHODES_ALL.map(mp=>(
                        <button key={mp.id} onClick={()=>setForm(p=>({...p,methode:mp.id}))} style={{background:form.methode===mp.id?mp.color+"22":C.card2,border:`2px solid ${form.methode===mp.id?mp.color:C.border}`,borderRadius:8,padding:"10px 12px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s"}}>
                          <div style={{fontSize:18,marginBottom:3}}>{mp.icon}</div>
                          <div style={{fontSize:11,fontWeight:700,color:form.methode===mp.id?mp.color:C.text}}>{mp.nom}</div>
                          <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{mp.desc}</div>
                          <div style={{fontSize:9,color:form.methode===mp.id?mp.color:C.muted}}>{mp.zone}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{background:"#075E54",borderRadius:10,padding:12}}>
                    <div style={{fontSize:9,color:"#25D366",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.1em"}}>💬 Aperçu message WhatsApp</div>
                    <div style={{background:"#128C7E",borderRadius:"12px 12px 12px 2px",padding:"10px 14px",fontSize:12,color:"#fff",lineHeight:1.8}}>
                      Bonjour {form.nom} 👋<br/>
                      {form.type==="envoyer"?<>✅ Paiement de <b>{fmt(montantNum,form.devise)}</b> envoyé.{form.description&&<><br/>{form.description}</>}</>:<>🔗 Lien de paiement :<br/><span style={{color:"#25D366"}}>pay.tymeless.fr/lien</span><br/>💰 <b>{fmt(montantNum,form.devise)}</b>{form.description&&` · ${form.description}`}</>}
                      <br/><span style={{fontSize:10,color:"#aaa"}}>📄 Facture PDF envoyée ✅</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <Btn v="ghost" full onClick={()=>setStep(1)}>← Retour</Btn>
                    <Btn v="gold" full onClick={handleConfirm}>{methode.icon} {form.type==="envoyer"?"Envoyer via "+methode.nom:"Encaisser via "+methode.nom}</Btn>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // ── MODAL MOT DE PASSE ────────────────────────────────────
  const ModalMdp=()=>(
    <div style={{position:"fixed",inset:0,background:"#00000099",display:"flex",alignItems:"center",justifyContent:"center",zIndex:4000}}>
      <div style={{background:C.card,border:`1px solid ${C.orange}55`,borderRadius:12,padding:24,width:360}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:32,marginBottom:8}}>{motDePasseModal?.montant>=10000?"🔒🔒":"🔒"}</div>
          <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:4}}>Validation requise</div>
          <div style={{fontSize:12,color:C.muted}}>Montant {motDePasseModal?.montant>=10000?"≥ 10 000€ — Double validation":"≥ 5 000€ — Mot de passe requis"}</div>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Mot de passe Tymeless</div>
          <input type="password" value={mdpInput} onChange={e=>setMdpInput(e.target.value)} placeholder="••••••••" style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 12px",color:C.text,fontFamily:"inherit",fontSize:14}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" full onClick={()=>{setMotDePasseModal(null);setMdpInput("");}}>Annuler</Btn>
          <Btn v="gold" full onClick={()=>{if(mdpInput.length>=4){motDePasseModal.onConfirm();setMdpInput("");}else showToast("Mot de passe incorrect","#EF4444");}}>Confirmer</Btn>
        </div>
      </div>
    </div>
  );

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.color,color:C.dark,borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px #00000066",maxWidth:420}}>{toast.msg}</div>}
      {modal&&<ModalConfirmPay item={modal} onConfirm={payer} onCancel={()=>setModal(null)}/>}
      {demande&&<ModalDemandePaiement onClose={()=>setDemande(false)} onSend={f=>showToast(`📲 Lien envoyé à ${f.nom}`)}/>}
      {showPayer&&<ModalPayerUniversel/>}
      {motDePasseModal&&<ModalMdp/>}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <STitle sub="Wallet · Flutterwave · Stripe · Multi-devises · Encaisser · Commissions · IA">💳 Wallet & Paiements</STitle>
        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          <Sel value={devise} onChange={e=>setDevise(e.target.value)} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:120}}/>
          {gelCompte&&<Pill label="🔒 Compte gelé" color={C.red}/>}
          <Btn v="gold" onClick={()=>setShowPayer(true)}>⚡ Payer</Btn>
          <Btn v="teal" onClick={()=>setDemande(true)}>📲 Encaisser</Btn>
        </div>
      </div>

      {/* HERO SOLDE */}
      <div style={{background:`linear-gradient(135deg,${C.card},#0A1A14)`,border:`1px solid ${gelCompte?C.red:C.teal}44`,borderRadius:16,padding:28,marginBottom:14,position:"relative",overflow:"hidden",opacity:gelCompte?0.8:1}}>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:C.teal+"08"}}/>
        <div style={{position:"relative"}}>
          {gelCompte&&<div style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"8px 14px",fontSize:12,color:C.red,marginBottom:12,fontWeight:600}}>🔒 Compte gelé — Aucune transaction possible</div>}
          <div style={{fontSize:10,color:C.teal,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>Solde Wallet Tymeless · Flutterwave + Stripe</div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:44,fontWeight:700,color:C.text,lineHeight:1,marginBottom:4}}>{fmt(solde,devise)}</div>
          {devise!=="EUR"&&<div style={{fontSize:12,color:C.muted,marginBottom:8}}>≈ {fmt(soldeEUR,"EUR")}</div>}
          {soldeEUR<alerteSeuil&&<div style={{background:`${C.orange}22`,border:`1px solid ${C.orange}44`,borderRadius:7,padding:"7px 12px",fontSize:11,color:C.orange,marginBottom:8}}>⚠️ Solde sous le seuil d'alerte ({fmt(alerteSeuil,"EUR")})</div>}
          <div style={{display:"flex",gap:20,marginTop:14,flexWrap:"wrap"}}>
            {[{l:"Encaissé",val:fmt(devise==="EUR"?entrees:conv(entrees,"EUR",devise),devise),c:C.green},{l:"Décaissé",val:fmt(devise==="EUR"?sorties:conv(sorties,"EUR",devise),devise),c:C.red},{l:"En attente",val:fmt(enAtt,"EUR"),c:C.orange},{l:"Score santé",val:`${scoreFinancier}/100`,c:scoreFinancier>70?C.green:scoreFinancier>40?C.gold:C.red}].map((k,i)=>(
              <div key={i} style={{borderLeft:`2px solid ${k.c}`,paddingLeft:12}}>
                <div style={{fontSize:9,color:C.muted,marginBottom:3}}>{k.l}</div>
                <div style={{fontSize:17,fontWeight:700,color:k.c}}>{k.val}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginTop:16}}>
            <Btn sm v="teal" onClick={()=>setDemande(true)}>📲 Encaisser</Btn>
            <Btn sm v="gold" onClick={()=>setShowPayer(true)}>⚡ Payer</Btn>
            <Btn sm v="ghost">📄 Relevé PDF</Btn>
            <Btn sm v="ghost">📊 QR Code</Btn>
            <Btn sm v={gelCompte?"green":"red"} onClick={()=>{setGelCompte(!gelCompte);showToast(gelCompte?"🔓 Compte dégelé":"🔒 Compte gelé",gelCompte?C.green:C.red);}}>
              {gelCompte?"🔓 Dégeler":"🔒 Geler"}
            </Btn>
          </div>
        </div>
      </div>

      {/* ALERTES RAPIDES */}
      {(comm.length>0||remb.length>0||four.length>0)&&(
        <div style={{display:"grid",gridTemplateColumns:`repeat(${[comm,remb,four].filter(x=>x.length>0).length},1fr)`,gap:10,marginBottom:14}}>
          {comm.length>0&&<div onClick={()=>setTab("commissions")} style={{background:C.orange+"11",border:`1px solid ${C.orange}44`,borderRadius:10,padding:12,display:"flex",gap:10,alignItems:"center",cursor:"pointer"}}>
            <span style={{fontSize:20}}>📤</span><div><div style={{fontWeight:600,color:C.orange,fontSize:12}}>{comm.length} commission(s) à payer</div><div style={{fontSize:11,color:C.muted}}>{fmt(comm.reduce((s,c)=>s+c.montant,0),"EUR")} dû</div></div>
          </div>}
          {remb.length>0&&<div onClick={()=>setTab("remboursements")} style={{background:C.blue+"11",border:`1px solid ${C.blue}44`,borderRadius:10,padding:12,display:"flex",gap:10,alignItems:"center",cursor:"pointer"}}>
            <span style={{fontSize:20}}>↩️</span><div><div style={{fontWeight:600,color:C.blue,fontSize:12}}>{remb.length} remboursement(s)</div><div style={{fontSize:11,color:C.muted}}>{fmt(remb.reduce((s,r)=>s+r.montant,0),"EUR")}</div></div>
          </div>}
          {four.length>0&&<div onClick={()=>setTab("fournisseurs")} style={{background:C.purple+"11",border:`1px solid ${C.purple}44`,borderRadius:10,padding:12,display:"flex",gap:10,alignItems:"center",cursor:"pointer"}}>
            <span style={{fontSize:20}}>🏭</span><div><div style={{fontWeight:600,color:C.purple,fontSize:12}}>{four.length} facture(s) fournisseur</div><div style={{fontSize:11,color:C.muted}}>{fmt(four.reduce((s,f)=>s+f.montant,0),"EUR")}</div></div>
          </div>}
        </div>
      )}

      <Tabs tabs={WTABS} active={tab} onChange={setTab}/>

      {tab==="wallet"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            <KPI label="Transactions ce mois" val={histo.length} color={C.blue}/>
            <KPI label="Seuil alerte" val={fmt(alerteSeuil,"EUR")} color={C.orange}/>
            <KPI label="Wallets projets" val={walletProjet.length} color={C.teal}/>
            <KPI label="Règles auto" val={reglesAuto.filter(r=>r.actif).length} color={C.purple}/>
          </div>
          <Card style={{marginBottom:14,borderColor:C.gold+"44"}}>
            <CT>💳 Moyens de paiement — Flutterwave + Stripe</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[{ico:"🌊",nom:"Wave",zone:"Sénégal, CI"},{ico:"📱",nom:"Orange Money",zone:"Afrique"},{ico:"📲",nom:"MTN Mobile",zone:"Afrique"},{ico:"💳",nom:"Visa/Mastercard",zone:"Mondial"},{ico:"🏦",nom:"Virement SEPA",zone:"Europe"},{ico:"💳",nom:"Stripe",zone:"Europe & Monde"},{ico:"💵",nom:"USD Transfer",zone:"USA"},{ico:"💰",nom:"PayPal",zone:"Mondial"}].map((m,i)=>(
                <div key={i} style={{background:C.card2,borderRadius:7,padding:"8px 10px",textAlign:"center",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:18,marginBottom:4}}>{m.ico}</div>
                  <div style={{fontSize:11,fontWeight:500,color:C.text}}>{m.nom}</div>
                  <div style={{fontSize:9,color:C.muted}}>{m.zone}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CT>Dernières transactions <Btn sm v="ghost" onClick={()=>setTab("historique")}>Voir tout →</Btn></CT>
            {histo.length===0?<div style={{textAlign:"center",padding:"20px 0",color:C.muted}}>Aucune transaction · Utilisez <b style={{color:C.gold}}>⚡ Payer</b> pour commencer</div>:(
              <TH heads={["Date","Libellé","Montant","Méthode","Statut"]} rows={histo.slice(0,6).map((h,i)=>(
                <tr key={i}>
                  <Td><span style={{fontSize:10,color:C.muted}}>{h.date}</span></Td>
                  <Td><span style={{fontWeight:600}}>{h.libelle}</span></Td>
                  <Td><span style={{fontWeight:700,color:h.type==="entree"?C.green:h.type==="sortie"?C.red:C.orange,fontSize:13}}>{h.type==="entree"?"+":"–"}{fmt(h.montant,h.devise)}</span></Td>
                  <Td><Pill label={h.methode||"Flutterwave"} color={C.blue}/></Td>
                  <Td><span style={{color:h.statut==="confirmé"||h.statut==="envoyé"?C.green:C.orange,fontWeight:600,fontSize:11}}>{h.statut==="confirmé"?"✓ Confirmé":h.statut==="envoyé"?"✓ Envoyé":"⏳ En attente"}</span></Td>
                </tr>
              ))}/>
            )}
          </Card>
        </div>
      )}

      {tab==="encaisser"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card style={{borderColor:C.teal+"44"}}><CT>📲 Lien WhatsApp</CT><div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:12}}>Lien de paiement Flutterwave envoyé sur WhatsApp. Le client paie en 30 secondes.</div><Btn v="teal" full onClick={()=>setDemande(true)}>📲 Créer le lien</Btn></Card>
            <Card><CT>📧 Facture par email</CT>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[["Nom client","text","Sofia Riad"],["Email","email","sofia@example.com"],["Montant","number","500"],["Service","text","Nettoyage Airbnb"]].map(([l,t,ph],i)=>(
                  <div key={i}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} style={{width:"100%"}}/></div>
                ))}
                <Btn v="blue" full onClick={()=>showToast("📧 Facture envoyée + rappel auto 48h")}>📧 Envoyer</Btn>
              </div>
            </Card>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card><CT>📱 QR Code de paiement</CT>
              <div style={{display:"flex",justifyContent:"center",padding:"16px 0"}}><div style={{width:120,height:120,background:C.card2,border:`2px solid ${C.gold}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:4}}><div style={{fontSize:32}}>⬛</div><div style={{fontSize:9,color:C.muted}}>QR Tymeless</div></div></div>
              <Btn v="gold" full onClick={()=>showToast("📥 QR Code téléchargé")}>📥 Télécharger</Btn>
            </Card>
            <Card style={{borderColor:C.gold+"44"}}><CT>✨ Page paiement Tymeless</CT>
              <div style={{background:`linear-gradient(135deg,#0A0A1A,#101025)`,borderRadius:10,padding:16,marginBottom:10}}>
                <div style={{fontSize:11,color:C.gold,letterSpacing:"0.15em",marginBottom:4}}>TYMELESS</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",marginBottom:8}}>Paiement sécurisé</div>
                <div style={{fontSize:22,fontWeight:700,color:"#fff",marginBottom:8}}>500,00 €</div>
                <div style={{background:C.gold,borderRadius:6,padding:"8px 0",textAlign:"center",fontSize:11,fontWeight:700,color:C.dark}}>Payer maintenant →</div>
              </div>
              <Btn v="gold" full>✏️ Personnaliser</Btn>
            </Card>
          </div>
        </div>
      )}

      {tab==="virement"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:C.teal+"44"}}><CT>⚡ Virement instantané</CT>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Destinataire rapide</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                  {["Thomas","Abou","Fatou","Partenaire","Client"].map((t,i)=>(
                    <button key={i} style={{padding:"5px 10px",border:`1px solid ${C.border}`,borderRadius:20,background:C.card2,color:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{t}</button>
                  ))}
                </div>
                <Inp placeholder="Ou saisir un nom..." style={{width:"100%"}}/>
              </div>
              {[["Montant","number","1000"],["Motif","text","Commission janvier"]].map(([l,t,ph],i)=>(
                <div key={i}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} style={{width:"100%"}}/></div>
              ))}
              <Sel value="" onChange={()=>{}} options={[{v:"flutterwave",l:"🌍 Flutterwave"},{v:"stripe",l:"💳 Stripe"},{v:"wave",l:"🌊 Wave"},{v:"virement",l:"🏦 SEPA"}]} style={{width:"100%"}}/>
              <Btn v="gold" full onClick={()=>showToast("⚡ Virement envoyé ! Facture générée · Notif WhatsApp envoyée")}>⚡ Virer maintenant</Btn>
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card><CT>💳 Recharge wallet</CT><Inp placeholder="Montant à recharger (EUR)" style={{width:"100%",marginBottom:8}}/><Btn v="gold" full onClick={()=>showToast("💳 Recharge en cours...")}>💳 Recharger</Btn></Card>
            <Card><CT>🕊️ Séquestre grands projets</CT><div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginBottom:10}}>Pour les projets {">"} 5 000€ · Déblocage à la livraison.</div><Btn v="ghost" full onClick={()=>showToast("+ Séquestre créé")}>+ Nouveau séquestre</Btn></Card>
          </div>
        </div>
      )}

      {tab==="projets"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>setModalProjet({nom:"",solde:0,budget:5000,icon:"🏠",couleur:C.teal})}>+ Nouveau wallet projet</Btn>
          </div>
          {modalProjet&&(
            <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
              <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:380}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>+ Nouveau wallet projet</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[["Nom du projet","nom","text","Résidentiel Paris"],["Budget max (EUR)","budget","number","5000"],["Icône","icon","text","🏠"],["Solde initial","solde","number","0"]].map(([l,k,t,ph])=>(
                    <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={modalProjet[k]} onChange={e=>setModalProjet(p=>({...p,[k]:t==="number"?Number(e.target.value):e.target.value}))} style={{width:"100%"}}/></div>
                  ))}
                </div>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <Btn v="ghost" full onClick={()=>setModalProjet(null)}>Annuler</Btn>
                  <Btn v="gold" full onClick={()=>{setWalletProjet(p=>[...p,{id:`wp${Date.now()}`,nom:modalProjet.nom,solde:modalProjet.solde,budget:modalProjet.budget,icon:modalProjet.icon||"🏠",couleur:C.teal}]);setModalProjet(null);showToast("✓ Wallet projet créé !");}}>Créer</Btn>
                </div>
              </div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
            {walletProjet.map((wp,i)=>{
              const pct=Math.min((wp.solde/wp.budget)*100,100);
              return(
                <Card key={i} style={{borderColor:`${wp.couleur}44`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:24}}>{wp.icon}</span>
                      <div><div style={{fontWeight:600,fontSize:14,color:wp.couleur}}>{wp.nom}</div><div style={{fontSize:10,color:C.muted}}>Wallet dédié</div></div>
                    </div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:700,color:C.text}}>{fmt(wp.solde,"EUR")}</div><div style={{fontSize:10,color:C.muted}}>/ {fmt(wp.budget,"EUR")}</div></div>
                  </div>
                  <div style={{height:4,borderRadius:2,background:C.border,marginBottom:10}}><div style={{height:"100%",width:`${pct}%`,background:wp.couleur,borderRadius:2}}/></div>
                  <div style={{display:"flex",gap:7}}>
                    <Btn sm v="ghost" full onClick={()=>showToast("📤 Virement depuis ce wallet")}>📤 Virer</Btn>
                    <Btn sm v="ghost" full onClick={()=>showToast("📥 Recharge en cours")}>📥 Recharger</Btn>
                    <Btn sm v="red" onClick={()=>setWalletProjet(p=>p.filter((_,j)=>j!==i))}>🗑</Btn>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {tab==="planifie"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>setModalPlan({nom:"",montant:"",devise:"EUR",date:"",methode:"flutterwave",statut:"planifié"})}>+ Planifier un paiement</Btn>
          </div>
          {modalPlan&&(
            <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
              <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:400}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>📅 Planifier un paiement</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[["Destinataire","nom","text","Thomas"],["Montant","montant","number","1800"],["Date","date","date",""]].map(([l,k,t,ph])=>(
                    <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={modalPlan[k]} onChange={e=>setModalPlan(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
                  ))}
                  <Sel value={modalPlan.methode} onChange={e=>setModalPlan(p=>({...p,methode:e.target.value}))} options={[{v:"flutterwave",l:"🌍 Flutterwave"},{v:"stripe",l:"💳 Stripe"},{v:"wave",l:"🌊 Wave"},{v:"virement",l:"🏦 Virement"}]} style={{width:"100%"}}/>
                </div>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <Btn v="ghost" full onClick={()=>setModalPlan(null)}>Annuler</Btn>
                  <Btn v="gold" full onClick={()=>{setPaiementsPlanifies(p=>[...p,{id:Date.now(),...modalPlan,montant:Number(modalPlan.montant)}]);setModalPlan(null);showToast("📅 Paiement planifié !");}}>Planifier</Btn>
                </div>
              </div>
            </div>
          )}
          <Card>
            <CT>📅 Paiements planifiés</CT>
            {paiementsPlanifies.length===0?<div style={{textAlign:"center",padding:"20px 0",color:C.muted}}>Aucun paiement planifié</div>:(
              <TH heads={["Destinataire","Montant","Date","Méthode","Statut","Action"]} rows={paiementsPlanifies.map((p,i)=>(
                <tr key={i}>
                  <Td><span style={{fontWeight:600}}>{p.nom}</span></Td>
                  <Td><span style={{fontWeight:700,color:C.gold}}>{fmt(p.montant,p.devise)}</span></Td>
                  <Td><span style={{fontSize:11,color:C.blue}}>{p.date}</span></Td>
                  <Td><Pill label={p.methode} color={C.teal}/></Td>
                  <Td><Pill label={p.statut} color={C.orange}/></Td>
                  <Td><div style={{display:"flex",gap:5}}><Btn sm v="green" onClick={()=>showToast(`⚡ Envoyé à ${p.nom}`)}>⚡</Btn><Btn sm v="red" onClick={()=>setPaiementsPlanifies(prev=>prev.filter((_,j)=>j!==i))}>🗑</Btn></div></Td>
                </tr>
              ))}/>
            )}
          </Card>
        </div>
      )}

      {tab==="regles"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>setModalRegle({si:"",alors:"",actif:true})}>+ Ajouter une règle</Btn>
          </div>
          {modalRegle&&(
            <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
              <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:420}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>⚙️ Nouvelle règle automatique</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Si (condition)</div><Inp placeholder="Ex: Paiement reçu de Sofia" value={modalRegle.si} onChange={e=>setModalRegle(p=>({...p,si:e.target.value}))} style={{width:"100%"}}/></div>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Alors (action)</div><Inp placeholder="Ex: Envoyer 20% commission Thomas" value={modalRegle.alors} onChange={e=>setModalRegle(p=>({...p,alors:e.target.value}))} style={{width:"100%"}}/></div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <Btn v="ghost" full onClick={()=>setModalRegle(null)}>Annuler</Btn>
                  <Btn v="gold" full onClick={()=>{setReglesAuto(p=>[...p,{id:Date.now(),...modalRegle}]);setModalRegle(null);showToast("✓ Règle ajoutée !");}}>Ajouter</Btn>
                </div>
              </div>
            </div>
          )}
          <Card style={{marginBottom:14,borderColor:C.purple+"44"}}>
            <CT>⚙️ Règles automatiques</CT>
            {reglesAuto.length===0?<div style={{textAlign:"center",padding:"20px 0",color:C.muted}}>Aucune règle · Créez votre première règle</div>:reglesAuto.map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:r.actif?`${C.purple}08`:C.card2,borderRadius:8,padding:"10px 14px",marginBottom:8,border:`1px solid ${r.actif?C.purple+"33":C.border}`}}>
                <div><div style={{fontSize:12,fontWeight:500,color:C.text,marginBottom:2}}><span style={{color:C.muted}}>Si : </span>{r.si}</div><div style={{fontSize:12,color:C.text}}><span style={{color:C.muted}}>Alors : </span>{r.alors}</div></div>
                <div style={{display:"flex",gap:7,flexShrink:0}}>
                  <div onClick={()=>setReglesAuto(p=>p.map((x,j)=>j===i?{...x,actif:!x.actif}:x))} style={{cursor:"pointer"}}><Pill label={r.actif?"● Actif":"○ Inactif"} color={r.actif?C.green:C.muted}/></div>
                  <Btn sm v="red" onClick={()=>setReglesAuto(p=>p.filter((_,j)=>j!==i))}>🗑</Btn>
                </div>
              </div>
            ))}
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>✂️ Split automatique</CT>
              <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Répartition automatique à chaque paiement reçu :</div>
              {[["Wallet principal",splitConfig.wallet_principal,C.green],["Commissions partenaires",splitConfig.commissions,C.orange],["Provision TVA",splitConfig.tva,C.blue]].map(([l,v,c],i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:C.muted}}>{l}</span><span style={{fontWeight:700,color:c}}>{v}%</span></div>
                  <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${v}%`,background:c,borderRadius:2}}/></div>
                </div>
              ))}
              <Btn v="ghost" full onClick={()=>showToast("Répartition modifiée")}>Modifier</Btn>
            </Card>
            <Card>
              <CT>🔔 Seuil d'alerte</CT>
              <div style={{marginBottom:8}}>
                <div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Seuil minimum de solde</div>
                <Inp type="number" value={alerteSeuil} onChange={e=>setAlerteSeuil(Number(e.target.value))} style={{width:"100%"}}/>
                <div style={{fontSize:10,color:C.muted,marginTop:4}}>Si solde {"<"} {fmt(alerteSeuil,"EUR")} → notif WhatsApp immédiate</div>
              </div>
              <Btn v="gold" full onClick={()=>showToast("✓ Seuil sauvegardé")}>Sauvegarder</Btn>
            </Card>
          </div>
        </div>
      )}

      {tab==="commissions"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:12,color:C.orange}}>Paiement manuel — Curtiss décide quand payer</span>
            <Btn v="gold" onClick={()=>setModalComm({nom:"",role:"",montant:"",devise:"EUR",periode:""})}>+ Ajouter</Btn>
          </div>
          {modalComm&&(
            <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
              <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:400}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>📤 Nouvelle commission</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[["Partenaire / Nom","nom","text","Thomas"],["Rôle","role","text","Apporteur d'affaires"],["Montant","montant","number","500"],["Période","periode","text","Mai 2026"]].map(([l,k,t,ph])=>(
                    <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={modalComm[k]} onChange={e=>setModalComm(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
                  ))}
                  <Sel value={modalComm.devise||"EUR"} onChange={e=>setModalComm(p=>({...p,devise:e.target.value}))} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:"100%"}}/>
                </div>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <Btn v="ghost" full onClick={()=>setModalComm(null)}>Annuler</Btn>
                  <Btn v="gold" full onClick={()=>{setComm(p=>[...p,{id:`COM-${Date.now()}`,...modalComm,montant:Number(modalComm.montant)}]);setModalComm(null);showToast("✓ Commission ajoutée !");}}>Ajouter</Btn>
                </div>
              </div>
            </div>
          )}
          {comm.length===0?<Card><div style={{textAlign:"center",padding:40,color:C.muted}}>✅ Aucune commission en attente · <span style={{color:C.gold,cursor:"pointer"}} onClick={()=>setModalComm({nom:"",role:"",montant:"",devise:"EUR",periode:""})}>+ Ajouter</span></div></Card>:comm.map((c,i)=><PayCard key={i} item={c} color={C.orange} onPay={()=>setModal(c)} btnLabel="Payer maintenant"/>)}
        </div>
      )}

      {tab==="remboursements"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>setModalRemb({nom:"",motif:"",montant:"",devise:"EUR"})}>+ Ajouter remboursement</Btn>
          </div>
          {modalRemb&&(
            <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
              <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:380}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>↩️ Nouveau remboursement</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[["Client","nom","text","Sofia Riad"],["Motif","motif","text","Prestation annulée"],["Montant","montant","number","300"]].map(([l,k,t,ph])=>(
                    <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={modalRemb[k]} onChange={e=>setModalRemb(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
                  ))}
                  <Sel value={modalRemb.devise||"EUR"} onChange={e=>setModalRemb(p=>({...p,devise:e.target.value}))} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:"100%"}}/>
                </div>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <Btn v="ghost" full onClick={()=>setModalRemb(null)}>Annuler</Btn>
                  <Btn v="gold" full onClick={()=>{setRemb(p=>[...p,{id:`RMB-${Date.now()}`,...modalRemb,montant:Number(modalRemb.montant)}]);setModalRemb(null);showToast("✓ Remboursement ajouté !");}}>Ajouter</Btn>
                </div>
              </div>
            </div>
          )}
          {remb.length===0?<Card><div style={{textAlign:"center",padding:40,color:C.muted}}>✅ Aucun remboursement en attente · <span style={{color:C.gold,cursor:"pointer"}} onClick={()=>setModalRemb({nom:"",motif:"",montant:"",devise:"EUR"})}>+ Ajouter</span></div></Card>:remb.map((r,i)=><PayCard key={i} item={r} color={C.blue} onPay={()=>setModal(r)} btnLabel="↩️ Rembourser"/>)}
        </div>
      )}

      {tab==="fournisseurs"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>setModalFour({nom:"",service:"",montant:"",devise:"EUR",echeance:""})}>+ Ajouter fournisseur</Btn>
          </div>
          {modalFour&&(
            <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
              <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:400}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>🏭 Nouveau fournisseur</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[["Fournisseur","nom","text","CleanPro"],["Service / Produit","service","text","Produits nettoyage"],["Montant","montant","number","320"],["Échéance","echeance","date",""]].map(([l,k,t,ph])=>(
                    <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={modalFour[k]} onChange={e=>setModalFour(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
                  ))}
                  <Sel value={modalFour.devise||"EUR"} onChange={e=>setModalFour(p=>({...p,devise:e.target.value}))} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:"100%"}}/>
                </div>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <Btn v="ghost" full onClick={()=>setModalFour(null)}>Annuler</Btn>
                  <Btn v="gold" full onClick={()=>{setFour(p=>[...p,{id:`FRN-${Date.now()}`,...modalFour,montant:Number(modalFour.montant)}]);setModalFour(null);showToast("✓ Fournisseur ajouté !");}}>Ajouter</Btn>
                </div>
              </div>
            </div>
          )}
          {four.length===0?<Card><div style={{textAlign:"center",padding:40,color:C.muted}}>✅ Toutes les factures réglées · <span style={{color:C.gold,cursor:"pointer"}} onClick={()=>setModalFour({nom:"",service:"",montant:"",devise:"EUR",echeance:""})}>+ Ajouter</span></div></Card>:four.map((f,i)=><PayCard key={i} item={f} color={C.purple} onPay={()=>setModal(f)} btnLabel="Payer fournisseur"/>)}
        </div>
      )}

      {tab==="ia"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            <KPI label="Score santé" val={`${scoreFinancier}/100`} color={scoreFinancier>70?C.green:scoreFinancier>40?C.gold:C.red}/>
            <KPI label="Transactions" val={histo.length} color={C.blue}/>
            <KPI label="Prévision 30j" val={fmt(soldeEUR*1.15,"EUR")} color={C.teal}/>
            <KPI label="Anomalies" val="0" color={C.green}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{borderColor:C.purple+"44"}}>
              <CT>🤖 Analyse IA</CT>
              <div style={{background:C.card2,borderRadius:8,padding:12,fontSize:12,color:C.text,lineHeight:1.8,marginBottom:10}}>
                <div style={{color:C.gold,fontWeight:600,marginBottom:6}}>Rapport IA — {new Date().toLocaleDateString("fr",{month:"long",year:"numeric"})}</div>
                <div>💰 Solde : <b>{fmt(soldeEUR,"EUR")}</b></div>
                <div>📈 Tendance : <b style={{color:C.green}}>+12% vs mois dernier</b></div>
                <div style={{marginTop:8,color:C.purple}}>💡 Recommandation : Optimiser les abonnements pourrait libérer ~180€/mois.</div>
              </div>
              <Btn v="purple" full>📄 Rapport PDF</Btn>
            </Card>
            <Card>
              <CT>🔮 Prévision 90 jours</CT>
              {[{label:"Dans 30 jours",val:fmt(soldeEUR*1.1,"EUR"),trend:"+10%",c:C.green},{label:"Dans 60 jours",val:fmt(soldeEUR*1.18,"EUR"),trend:"+18%",c:C.green},{label:"Dans 90 jours",val:fmt(soldeEUR*1.22,"EUR"),trend:"+22%",c:C.teal}].map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <span style={{fontSize:12,color:C.muted}}>{p.label}</span>
                  <div style={{textAlign:"right"}}><div style={{fontWeight:700,color:p.c,fontSize:13}}>{p.val}</div><div style={{fontSize:10,color:p.c}}>{p.trend}</div></div>
                </div>
              ))}
              <div style={{marginTop:10,fontSize:10,color:C.muted}}>Basé sur les tendances · Claude IA</div>
            </Card>
          </div>
        </div>
      )}

      {tab==="historique"&&(
        <div>
          <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            {["tous","entree","sortie"].map(f=>(
              <button key={f} onClick={()=>setFiltre(f)} style={{background:filtre===f?C.gold+"22":"transparent",border:`1px solid ${filtre===f?C.gold:C.border}`,color:filtre===f?C.gold:C.muted,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>
                {f==="tous"?"Tout":f==="entree"?"Entrées":"Sorties"}
              </button>
            ))}
            <div style={{marginLeft:"auto",display:"flex",gap:7}}>
              <Btn sm v="ghost" onClick={()=>showToast("📥 Export Excel téléchargé")}>📥 Excel</Btn>
              <Btn sm v="ghost" onClick={()=>showToast("📄 Relevé PDF généré")}>📄 PDF</Btn>
            </div>
          </div>
          {histo.length===0?(
            <Card><div style={{textAlign:"center",padding:"30px 0",color:C.muted}}>Aucune transaction · Utilisez <b style={{color:C.gold}}>⚡ Payer</b> pour commencer</div></Card>
          ):(
            <Card>
              <TH heads={["Date","Libellé","Montant","Méthode","Réf.","Statut","Action"]} rows={filtHisto.map((h,i)=>(
                <tr key={i}>
                  <Td><span style={{fontSize:10,color:C.muted}}>{h.date}</span></Td>
                  <Td><span style={{fontWeight:600}}>{h.libelle}</span></Td>
                  <Td><span style={{fontWeight:700,color:h.type==="entree"?C.green:h.type==="sortie"?C.red:C.orange,fontSize:13}}>{h.type==="entree"?"+":"–"}{fmt(h.montant,h.devise)}</span></Td>
                  <Td><Pill label={h.methode||"Flutterwave"} color={C.blue}/></Td>
                  <Td><span style={{fontFamily:"monospace",fontSize:10,color:C.gold}}>{h.ref}</span></Td>
                  <Td><span style={{color:h.statut==="confirmé"||h.statut==="envoyé"?C.green:C.orange,fontWeight:600,fontSize:11}}>{h.statut==="envoyé"?"✓ Envoyé":"⏳ Attente"}</span></Td>
                  <Td><Btn sm v="red" onClick={()=>setHisto(p=>p.filter((_,j)=>j!==i))}>🗑</Btn></Td>
                </tr>
              ))}/>
            </Card>
          )}
        </div>
      )}

      {tab==="devises"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
            {DEVISES.map((d,i)=>(
              <Card key={i} style={{borderColor:d.code===devise?C.gold+"55":C.border}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:22}}>{d.flag}</span>
                  <div><div style={{fontWeight:700,fontSize:13,color:d.code===devise?C.gold:C.text}}>{d.nom}</div><div style={{fontSize:10,color:C.muted}}>{d.code} · {d.symbol}</div></div>
                </div>
                <div style={{background:C.card2,borderRadius:5,padding:"7px 10px",fontSize:11,marginBottom:10}}>
                  <span style={{color:C.muted}}>1 EUR = </span><span style={{color:C.gold,fontWeight:700}}>{d.taux} {d.symbol}</span>
                </div>
                <Btn sm v={d.code===devise?"ghost":"gold"} full onClick={()=>setDevise(d.code)}>{d.code===devise?"✓ Active":"Sélectionner"}</Btn>
              </Card>
            ))}
          </div>
          <Card style={{borderColor:C.teal+"44"}}><CT>Convertisseur temps réel</CT><Convertisseur/></Card>
        </div>
      )}

      {tab==="iban"&&(
        <IbanMondial showToast={showToast}/>
      )}

      {tab==="saas"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:C.gold+"44",background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
            <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:32}}>🏢</span>
              <div><div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:4}}>Tymeless OS — Paiements multi-entreprises</div><div style={{fontSize:12,color:C.muted}}>Chaque société connecte son propre Flutterwave. L'argent va directement chez eux.</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[{ico:"💳",v:"247",l:"Transactions"},{ico:"🏢",v:"3",l:"Entreprises"},{ico:"💰",v:"48 200 €",l:"Volume total"}].map((k,i)=>(
                <div key={i} style={{background:C.card2,borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>{k.ico}</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{k.v}</div><div style={{fontSize:9,color:C.muted}}>{k.l}</div></div>
              ))}
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{borderColor:C.teal+"44"}}>
              <CT>⚙️ Configuration par entreprise</CT>
              {[["Nom de l'entreprise","text","Ma Conciergerie"],["Clé publique Flutterwave","password","FLWPUBK-..."],["Clé secrète Flutterwave","password","FLWSECK-..."]].map(([l,t,ph],i)=>(
                <div key={i} style={{marginBottom:8}}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} style={{width:"100%"}}/></div>
              ))}
              <Btn v="teal" full onClick={()=>showToast("💾 Configuration sauvegardée !")}>💾 Sauvegarder</Btn>
            </Card>
            <Card>
              <CT>🏢 Entreprises actives</CT>
              {[{nom:"Tymeless (vous)",plan:"Owner",vol:"24 380 €"},{nom:"Conciergerie Élite",plan:"Business Pro",vol:"8 200 €"},{nom:"LuxeService Paris",plan:"Enterprise",vol:"15 600 €"}].map((e,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <div><div style={{fontWeight:500}}>{e.nom}</div><Pill label={e.plan} color={e.plan==="Owner"?C.gold:C.blue}/></div>
                  <span style={{fontWeight:700,color:C.green}}>{e.vol}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PAGE CARTES ──────────────────────────────────────────────

// ─── PAGE CARTES ──────────────────────────────────────────────

const PageCartes=()=>{
  const [cartes,setCartes]=useState(INIT_CARTES);
  const [tab,setTab]=useState("mes_cartes");
  const [reveal,setReveal]=useState({});
  const [modal,setModal]=useState(null); // null | "creer" | "modifier" | "depense" | "releve"
  const [selected,setSelected]=useState(null);
  const [toast,setToast]=useState(null);
  const [notifDemo,setNotifDemo]=useState(null);
  const [depenses,setDepenses]=useState([
    {id:1,carte:"CRD-001",titulaire:"Thomas",desc:"Amazon Pro — Fournitures",montant:89.90,cat:"Fournitures",date:"Auj. 10:23",statut:"validé"},
    {id:2,carte:"CRD-001",titulaire:"Thomas",desc:"Uber — Transport",montant:24.50,cat:"Transport",date:"Auj. 09:15",statut:"validé"},
    {id:3,carte:"CRD-002",titulaire:"Abou",desc:"CleanPro — Produits",montant:156.00,cat:"Fournitures",date:"Hier 14:30",statut:"validé"},
    {id:4,carte:"CRD-003",titulaire:"Fatou",desc:"Dépense inhabituelle",montant:890.00,cat:"Autre",date:"Hier 23:45",statut:"alerte"},
    {id:5,carte:"CRD-001",titulaire:"Thomas",desc:"Carrefour Market",montant:43.20,cat:"Divers",date:"Il y a 2j",statut:"validé"},
  ]);
  const [filtreDepense,setFiltreDepense]=useState("toutes");
  const [newCard,setNewCard]=useState({nom:"",devise:"EUR",limite:"",limitejour:"",typeCarte:"permanente",titulaire:"Curtiss",service:"",categoriesAutorisees:["Tout"],validationWhatsapp:false});
  const [newDepense,setNewDepense]=useState({carte:"",desc:"",montant:"",cat:"Fournitures",date:""});

  const TITULAIRES=["Curtiss","Thomas","Abou","Fatou","Partenaire","Client VIP"];
  const TITULAIRE_COLORS={"Curtiss":C.gold,"Thomas":C.blue,"Abou":C.teal,"Fatou":C.purple,"Partenaire":C.orange,"Client VIP":C.green};
  const TYPES_CARTE=[
    {v:"permanente",l:"♾️ Permanente",desc:"Réutilisable indéfiniment"},
    {v:"usage_unique",l:"⚡ Usage unique",desc:"1 seul paiement puis détruite"},
    {v:"temporaire",l:"📅 Temporaire",desc:"Valable X jours"},
    {v:"par_service",l:"🏷️ Par service",desc:"Dédiée à un service"},
    {v:"collaborateur",l:"👤 Collaborateur",desc:"Budget équipe limité"},
  ];
  const CATEGORIES=["Tout","Fournitures","Transport","Fournisseurs","Logiciels","Restauration","Divers","Autre"];
  const SERVICES=["Airbnb","Jet privé","Yacht","Résidentiel","Bureaux","Rapatriement"];

  const TABS=[
    {id:"mes_cartes",label:"💳 Mes cartes"},
    {id:"depenses",label:"📊 Dépenses"},
    {id:"controles",label:"🔐 Contrôles"},
    {id:"ia",label:"🤖 IA & Alertes"},
  ];

  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};

  const bloquer=id=>{
    setCartes(p=>p.map(c=>c.id===id?{...c,statut:c.statut==="active"?"bloquée":"active"}:c));
    const c=cartes.find(x=>x.id===id);
    showToast(c?.statut==="active"?`🔒 Carte ${c?.nom} bloquée`:`🔓 Carte ${c?.nom} débloquée`,c?.statut==="active"?C.red:C.green);
  };

  const creer=()=>{
    if(!newCard.nom||!newCard.limite)return;
    const id=`CRD-${String(cartes.length+1).padStart(3,"0")}`;
    const tc=TITULAIRE_COLORS[newCard.titulaire]||C.blue;
    setCartes(p=>[...p,{
      id,nom:newCard.nom,
      numero:`4${Math.floor(100+Math.random()*900)} •••• •••• ${Math.floor(1000+Math.random()*9000)}`,
      reseau:"Visa",solde:0,limite:Number(newCard.limite),limitejour:Number(newCard.limitejour)||0,
      statut:"active",devise:newCard.devise,typeCarte:newCard.typeCarte,
      titulaire:newCard.titulaire,service:newCard.service,
      validationWhatsapp:newCard.validationWhatsapp,
      expiry:"12/27",cvv:"•••",couleur:tc,
      categoriesAutorisees:newCard.categoriesAutorisees,
      risque:"Faible",
    }]);
    setModal(null);
    setNewCard({nom:"",devise:"EUR",limite:"",limitejour:"",typeCarte:"permanente",titulaire:"Curtiss",service:"",categoriesAutorisees:["Tout"],validationWhatsapp:false});
    showToast("✓ Carte virtuelle créée !");
    // Notif démo
    setNotifDemo({msg:`💳 Nouvelle carte créée pour ${newCard.titulaire}`,c:C.green});
    setTimeout(()=>setNotifDemo(null),3000);
  };

  const modifier=()=>{
    setCartes(p=>p.map(c=>c.id===selected.id?{...selected}:c));
    setModal(null);showToast("✓ Carte modifiée !");
  };

  const supprimer=id=>{
    setCartes(p=>p.filter(c=>c.id!==id));
    showToast("Carte supprimée","#EF4444");
  };

  const ajouterDepense=()=>{
    if(!newDepense.carte||!newDepense.desc||!newDepense.montant)return;
    const carte=cartes.find(c=>c.id===newDepense.carte);
    setDepenses(p=>[{id:Date.now(),...newDepense,montant:Number(newDepense.montant),titulaire:carte?.titulaire||"",date:"Maintenant",statut:"validé"},...p]);
    setCartes(p=>p.map(c=>c.id===newDepense.carte?{...c,solde:c.solde+Number(newDepense.montant)}:c));
    // Notif démo
    setNotifDemo({msg:`💳 ${carte?.nom} — ${newDepense.desc} — ${newDepense.montant}€`,c:C.orange});
    setTimeout(()=>setNotifDemo(null),4000);
    setModal(null);
    setNewDepense({carte:"",desc:"",montant:"",cat:"Fournitures",date:""});
    showToast(`🔔 Dépense ajoutée — ${carte?.titulaire} vient d'utiliser sa carte`);
  };

  const totalDepenses=depenses.reduce((s,d)=>s+d.montant,0);
  const depensesFiltrees=filtreDepense==="toutes"?depenses:depenses.filter(d=>d.carte===filtreDepense);
  const scoreRisque=(c)=>c.solde>c.limite*0.8?"Élevé":c.solde>c.limite*0.5?"Moyen":"Faible";
  const risqueColor=(r)=>r==="Élevé"?C.red:r==="Moyen"?C.orange:C.green;

  const catStats=CATEGORIES.filter(c=>c!=="Tout").map(cat=>({
    cat,total:depenses.filter(d=>d.cat===cat).reduce((s,d)=>s+d.montant,0)
  })).filter(c=>c.total>0);

  return(
    <div>
      {/* TOASTS */}
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px #00000066"}}>{toast.msg}</div>}

      {/* NOTIF DÉMO — style notification mobile */}
      {notifDemo&&(
        <div style={{position:"fixed",top:70,right:20,background:C.dark2,border:`1px solid ${notifDemo.c}44`,borderRadius:12,padding:"12px 16px",fontSize:12,zIndex:9998,boxShadow:"0 8px 32px #00000088",maxWidth:320,display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:20}}>🔔</span>
          <div><div style={{fontWeight:600,color:notifDemo.c,marginBottom:2}}>Tymeless OS</div><div style={{color:C.muted}}>{notifDemo.msg}</div></div>
        </div>
      )}

      {/* MODAL CRÉER CARTE */}
      {modal==="creer"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}55`,borderRadius:14,padding:28,width:500,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:20}}>+ Créer une carte virtuelle</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Type */}
              <div><div style={{fontSize:9,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Type de carte</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {TYPES_CARTE.map(t=>(
                    <button key={t.v} onClick={()=>setNewCard(p=>({...p,typeCarte:t.v}))} style={{padding:"8px 10px",border:`1px solid ${newCard.typeCarte===t.v?C.gold:C.border}`,borderRadius:8,background:newCard.typeCarte===t.v?`${C.gold}22`:C.card2,color:newCard.typeCarte===t.v?C.gold:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit",textAlign:"left"}}>
                      <div style={{fontWeight:600,marginBottom:2}}>{t.l}</div>
                      <div style={{fontSize:9,opacity:0.7}}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Titulaire */}
              <div><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Titulaire</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {TITULAIRES.map(t=>{const tc=TITULAIRE_COLORS[t]||C.blue;return(
                    <button key={t} onClick={()=>setNewCard(p=>({...p,titulaire:t,nom:t}))} style={{padding:"5px 12px",border:`1px solid ${newCard.titulaire===t?tc:C.border}`,borderRadius:20,background:newCard.titulaire===t?`${tc}22`:C.card2,color:newCard.titulaire===t?tc:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{t}</button>
                  );})}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nom sur la carte</div><Inp placeholder="Ex: Thomas Tymeless" value={newCard.nom} onChange={e=>setNewCard(p=>({...p,nom:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Devise</div><Sel value={newCard.devise} onChange={e=>setNewCard(p=>({...p,devise:e.target.value}))} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Limite mensuelle *</div><Inp type="number" placeholder="1000" value={newCard.limite} onChange={e=>setNewCard(p=>({...p,limite:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Limite journalière</div><Inp type="number" placeholder="200" value={newCard.limitejour} onChange={e=>setNewCard(p=>({...p,limitejour:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Service lié (optionnel)</div><Sel value={newCard.service} onChange={e=>setNewCard(p=>({...p,service:e.target.value}))} options={[{v:"",l:"Aucun"},...SERVICES.map(s=>({v:s,l:s}))]} style={{width:"100%"}}/></div>
              {/* Catégories */}
              <div><div style={{fontSize:9,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Catégories autorisées</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {CATEGORIES.map(cat=>{const sel=newCard.categoriesAutorisees.includes(cat);return(
                    <button key={cat} onClick={()=>setNewCard(p=>({...p,categoriesAutorisees:sel?p.categoriesAutorisees.filter(c=>c!==cat):[...p.categoriesAutorisees,cat]}))} style={{padding:"4px 10px",border:`1px solid ${sel?C.teal:C.border}`,borderRadius:20,background:sel?`${C.teal}22`:C.card2,color:sel?C.teal:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{cat}</button>
                  );})}
                </div>
              </div>
              {/* Validation WA */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:C.card2,borderRadius:8,padding:"10px 12px"}}>
                <div><div style={{fontSize:12,fontWeight:500}}>Validation WhatsApp pour dépenses importantes</div><div style={{fontSize:10,color:C.muted}}>Curtiss valide par WhatsApp avant chaque paiement {">"} 200€</div></div>
                <div onClick={()=>setNewCard(p=>({...p,validationWhatsapp:!p.validationWhatsapp}))} style={{width:36,height:20,borderRadius:10,background:newCard.validationWhatsapp?C.green:C.border,cursor:"pointer",position:"relative",flexShrink:0}}>
                  <div style={{position:"absolute",top:2,left:newCard.validationWhatsapp?18:2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
                <Btn v="gold" full onClick={creer}>✓ Créer la carte</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER CARTE */}
      {modal==="modifier"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}55`,borderRadius:14,padding:28,width:420}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:16}}>✏️ Modifier la carte</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nom sur la carte</div><Inp value={selected.nom} onChange={e=>setSelected(p=>({...p,nom:e.target.value}))} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Limite mensuelle</div><Inp type="number" value={selected.limite} onChange={e=>setSelected(p=>({...p,limite:Number(e.target.value)}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Limite journalière</div><Inp type="number" value={selected.limitejour||""} onChange={e=>setSelected(p=>({...p,limitejour:Number(e.target.value)}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Service lié</div><Sel value={selected.service||""} onChange={e=>setSelected(p=>({...p,service:e.target.value}))} options={[{v:"",l:"Aucun"},...SERVICES.map(s=>({v:s,l:s}))]} style={{width:"100%"}}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={modifier}>✓ Enregistrer</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUTER DÉPENSE */}
      {modal==="depense"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}55`,borderRadius:14,padding:28,width:400}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:16}}>+ Ajouter une dépense</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Carte *</div>
                <Sel value={newDepense.carte} onChange={e=>setNewDepense(p=>({...p,carte:e.target.value}))} options={[{v:"",l:"Choisir une carte..."},...cartes.filter(c=>c.statut==="active").map(c=>({v:c.id,l:`${c.id} — ${c.nom}`}))]} style={{width:"100%"}}/>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Description *</div><Inp placeholder="Ex: Amazon — Fournitures bureau" value={newDepense.desc} onChange={e=>setNewDepense(p=>({...p,desc:e.target.value}))} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Montant *</div><Inp type="number" placeholder="89.90" value={newDepense.montant} onChange={e=>setNewDepense(p=>({...p,montant:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Catégorie</div><Sel value={newDepense.cat} onChange={e=>setNewDepense(p=>({...p,cat:e.target.value}))} options={CATEGORIES.filter(c=>c!=="Tout").map(c=>({v:c,l:c}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>
                🔔 Une notification sera envoyée au titulaire de la carte
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={ajouterDepense}>✓ Ajouter la dépense</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <STitle sub="Cartes Visa virtuelles · Flutterwave · Contrôle total · IA">◈ Cartes Virtuelles</STitle>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={()=>setModal("depense")}>+ Dépense</Btn>
          <Btn v="gold" onClick={()=>setModal("creer")}>+ Nouvelle carte</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Cartes actives" val={cartes.filter(c=>c.statut==="active").length} color={C.green}/>
        <KPI label="Cartes bloquées" val={cartes.filter(c=>c.statut==="bloquée").length} color={C.red}/>
        <KPI label="Dépenses ce mois" val={fmt(totalDepenses,"EUR")} color={C.orange}/>
        <KPI label="Alertes IA" val={depenses.filter(d=>d.statut==="alerte").length} color={C.purple}/>
        <KPI label="Budget total" val={fmt(cartes.reduce((s,c)=>s+c.limite,0),"EUR")} color={C.gold}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── MES CARTES ── */}
      {tab==="mes_cartes"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
            {cartes.map((c,i)=>{
              const pct=Math.min((c.solde/c.limite)*100,100);
              const tc=TITULAIRE_COLORS[c.titulaire]||C.blue;
              const risque=scoreRisque(c);
              return(
                <div key={i} style={{borderRadius:14,overflow:"hidden",border:`1px solid ${c.statut==="active"?tc+"44":C.red+"44"}`,opacity:c.statut==="bloquée"?0.75:1,transition:"all 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
                >
                  {/* CARTE VISUELLE */}
                  <div style={{background:`linear-gradient(135deg,#0A0A1A,#101025,${tc}22)`,padding:"20px 22px",position:"relative",minHeight:160}}>
                    {/* Hologramme */}
                    <div style={{position:"absolute",top:16,right:60,width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${tc}44,transparent,${tc}22)`,border:`1px solid ${tc}33`}}/>
                    <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:tc+"08"}}/>

                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,position:"relative"}}>
                      <div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:2}}>TYMELESS OS · {c.typeCarte?.toUpperCase()}</div>
                        <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{c.nom}</div>
                        {c.service&&<div style={{fontSize:10,color:tc,marginTop:2}}>{c.service}</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                        <span style={{fontSize:12,fontWeight:700,color:tc}}>VISA</span>
                        {c.statut==="bloquée"&&<Pill label="🔒 Bloquée" color={C.red}/>}
                        {c.validationWhatsapp&&<Pill label="✓ WA" color={C.green}/>}
                        <Pill label={risque} color={risqueColor(risque)}/>
                      </div>
                    </div>

                    {/* Puce dorée */}
                    <div style={{width:32,height:22,background:`linear-gradient(135deg,${C.gold},#8B6520)`,borderRadius:4,marginBottom:10,position:"relative",boxShadow:`0 2px 6px ${C.gold}44`}}>
                      <div style={{position:"absolute",top:"30%",left:"20%",right:"20%",height:1,background:"rgba(0,0,0,0.3)"}}/>
                      <div style={{position:"absolute",top:"60%",left:"20%",right:"20%",height:1,background:"rgba(0,0,0,0.3)"}}/>
                    </div>

                    <div style={{fontFamily:"monospace",fontSize:14,color:"rgba(255,255,255,0.85)",letterSpacing:"0.15em",marginBottom:10}}>
                      {reveal[c.id]?c.numero.replace(/•/g,"0"):c.numero}
                    </div>

                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                      <div><div style={{fontSize:8,color:"rgba(255,255,255,0.4)"}}>EXPIRY</div><div style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>{c.expiry}</div></div>
                      <div><div style={{fontSize:8,color:"rgba(255,255,255,0.4)"}}>CVV</div><div style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>{reveal[c.id]?"123":c.cvv}</div></div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:8,color:"rgba(255,255,255,0.4)"}}>SOLDE UTILISÉ</div><div style={{fontSize:15,fontWeight:700,color:tc}}>{fmt(c.solde,c.devise)}</div></div>
                    </div>
                  </div>

                  {/* INFOS SOUS LA CARTE */}
                  <div style={{background:C.card,padding:"12px 22px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:4}}>
                      <span>Utilisation mensuelle</span>
                      <span style={{color:pct>80?C.red:pct>50?C.gold:C.green}}>{fmt(c.solde,c.devise)} / {fmt(c.limite,c.devise)}</span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:C.border,marginBottom:6}}>
                      <div style={{height:"100%",width:`${pct}%`,background:pct>80?C.red:pct>50?C.gold:C.green,borderRadius:3,transition:"width 0.5s"}}/>
                    </div>
                    {c.limitejour>0&&<div style={{fontSize:10,color:C.muted,marginBottom:8}}>Limite journalière : {fmt(c.limitejour,c.devise)}</div>}
                    {c.categoriesAutorisees&&c.categoriesAutorisees[0]!=="Tout"&&<div style={{fontSize:10,color:C.muted,marginBottom:8}}>Catégories : {c.categoriesAutorisees.join(", ")}</div>}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      <Btn sm v="ghost" onClick={()=>setReveal(p=>({...p,[c.id]:!p[c.id]}))}>👁 {reveal[c.id]?"Masquer":"Voir"}</Btn>
                      <Btn sm v="blue" onClick={()=>{setSelected({...c});setModal("modifier");}}>✏️</Btn>
                      <Btn sm v="ghost" onClick={()=>{showToast(`📲 Infos carte envoyées à ${c.nom} sur WhatsApp`);}}>📲</Btn>
                      <Btn sm v="ghost" onClick={()=>{showToast(`📄 Relevé PDF de ${c.nom} téléchargé`);}}>📄</Btn>
                      <Btn sm v={c.statut==="active"?"red":"green"} onClick={()=>bloquer(c.id)}>{c.statut==="active"?"🔒":"🔓"}</Btn>
                      <Btn sm v="red" onClick={()=>supprimer(c.id)}>🗑</Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAR TITULAIRE */}
          <Card style={{marginTop:16}}>
            <CT>Cartes par titulaire</CT>
            {TITULAIRES.map((t,i)=>{
              const nb=cartes.filter(c=>c.titulaire===t).length;
              const tc=TITULAIRE_COLORS[t]||C.blue;
              if(nb===0&&t!=="Curtiss"&&t!=="Thomas"&&t!=="Abou"&&t!=="Fatou") return null;
              return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:`${tc}22`,border:`1px solid ${tc}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:tc}}>{t[0]}</div>
                    <span style={{fontWeight:500}}>{t}</span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:11,color:C.muted}}>{nb} carte{nb>1?"s":""}</span>
                    <Btn sm v="ghost" onClick={()=>{setNewCard(p=>({...p,titulaire:t,nom:t}));setModal("creer");}}>+ Ajouter</Btn>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* ── DÉPENSES ── */}
      {tab==="depenses"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            <KPI label="Total dépenses" val={fmt(totalDepenses,"EUR")} color={C.orange}/>
            <KPI label="Dépenses aujourd'hui" val={fmt(depenses.filter(d=>d.date.includes("Auj")).reduce((s,d)=>s+d.montant,0),"EUR")} color={C.blue}/>
            <KPI label="Alertes actives" val={depenses.filter(d=>d.statut==="alerte").length} color={C.red}/>
          </div>

          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <button onClick={()=>setFiltreDepense("toutes")} style={{padding:"4px 12px",border:`1px solid ${filtreDepense==="toutes"?C.gold:C.border}`,borderRadius:6,background:filtreDepense==="toutes"?`${C.gold}22`:"transparent",color:filtreDepense==="toutes"?C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Toutes</button>
            {cartes.map(c=>(
              <button key={c.id} onClick={()=>setFiltreDepense(c.id)} style={{padding:"4px 12px",border:`1px solid ${filtreDepense===c.id?C.blue:C.border}`,borderRadius:6,background:filtreDepense===c.id?`${C.blue}22`:"transparent",color:filtreDepense===c.id?C.blue:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{c.id}</button>
            ))}
            <div style={{marginLeft:"auto"}}>
              <Btn sm v="gold" onClick={()=>setModal("depense")}>+ Ajouter</Btn>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
            <Card>
              <CT>Transactions</CT>
              <TH heads={["Carte","Description","Catégorie","Montant","Date","Statut","Action"]} rows={depensesFiltrees.map((d,i)=>(
                <tr key={i}>
                  <Td><span style={{fontFamily:"monospace",fontSize:10,color:C.gold}}>{d.carte}</span></Td>
                  <Td><span style={{fontWeight:500,fontSize:12}}>{d.desc}</span></Td>
                  <Td><Pill label={d.cat} color={C.blue}/></Td>
                  <Td><span style={{fontWeight:700,color:d.statut==="alerte"?C.red:C.text}}>{d.montant.toFixed(2)} €</span></Td>
                  <Td><span style={{fontSize:10,color:C.muted}}>{d.date}</span></Td>
                  <Td><Pill label={d.statut==="alerte"?"⚠️ Alerte":"✓ Validé"} color={d.statut==="alerte"?C.red:C.green}/></Td>
                  <Td><Btn sm v="red" onClick={()=>setDepenses(p=>p.filter((_,j)=>j!==i))}>🗑</Btn></Td>
                </tr>
              ))}/>
            </Card>

            {/* GRAPHIQUE CAMEMBERT SIMPLE */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Card>
                <CT>Par catégorie</CT>
                {catStats.map((c,i)=>(
                  <div key={i} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{color:C.muted}}>{c.cat}</span>
                      <span style={{fontWeight:600,color:C.text}}>{fmt(c.total,"EUR")}</span>
                    </div>
                    <div style={{height:4,borderRadius:2,background:C.border}}>
                      <div style={{height:"100%",width:`${Math.min((c.total/totalDepenses)*100,100)}%`,background:[C.gold,C.blue,C.teal,C.orange,C.purple,C.green][i%6],borderRadius:2}}/>
                    </div>
                  </div>
                ))}
              </Card>
              <Card>
                <CT>Par titulaire</CT>
                {TITULAIRES.slice(0,4).map((t,i)=>{
                  const total=depenses.filter(d=>{const c=cartes.find(x=>x.id===d.carte);return c?.titulaire===t;}).reduce((s,d)=>s+d.montant,0);
                  const tc=TITULAIRE_COLORS[t]||C.blue;
                  return(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:8,height:8,borderRadius:"50%",background:tc}}/><span style={{color:C.muted}}>{t}</span></div>
                      <span style={{fontWeight:600,color:tc}}>{fmt(total,"EUR")}</span>
                    </div>
                  );
                })}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTRÔLES ── */}
      {tab==="controles"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{borderColor:C.purple+"44"}}>
              <CT>🔐 Validation WhatsApp</CT>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:12}}>Curtiss reçoit une notification pour chaque dépense importante et valide par OUI avant que le paiement soit autorisé.</div>
              {[["Seuil de validation","200 €"],["Délai de réponse","5 minutes"],["Si pas de réponse","Paiement refusé"]].map(([l,v],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{l}</span>
                  <span style={{fontWeight:600,color:i===2?C.red:C.purple}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:12}}><Btn v="purple" full onClick={()=>showToast("✓ Seuils mis à jour")}>Configurer les seuils</Btn></div>
            </Card>
            <Card style={{borderColor:C.red+"44"}}>
              <CT>⚡ Actions rapides</CT>
              {cartes.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:C.card2,borderRadius:8,border:`1px solid ${C.border}`,marginBottom:7}}>
                  <div><div style={{fontSize:12,fontWeight:500}}>{c.nom}</div><div style={{fontSize:10,color:C.muted}}>{c.typeCarte} · Limite : {fmt(c.limite,c.devise)}</div></div>
                  <Btn sm v={c.statut==="active"?"red":"green"} onClick={()=>bloquer(c.id)}>{c.statut==="active"?"🔒":"🔓"}</Btn>
                </div>
              ))}
            </Card>
            <Card>
              <CT>📊 Limites configurées</CT>
              {cartes.map((c,i)=>{
                const pct=Math.min((c.solde/c.limite)*100,100);
                const tc=TITULAIRE_COLORS[c.titulaire]||C.blue;
                return(
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{color:C.muted}}>{c.nom}</span>
                      <span style={{color:pct>80?C.red:C.green}}>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${pct}%`,background:pct>80?C.red:tc,borderRadius:2}}/></div>
                  </div>
                );
              })}
            </Card>
            <Card>
              <CT>📋 Journal d'audit</CT>
              {[{a:"Carte CRD-001 rechargée",u:"Curtiss",d:"Auj. 09:00"},{a:"Carte CRD-003 bloquée",u:"Curtiss",d:"Hier 23:46"},{a:"Nouvelle carte créée",u:"Curtiss",d:"Il y a 3j"},{a:"Limite CRD-002 → 800€",u:"Curtiss",d:"Il y a 5j"}].map((a,i)=>(
                <div key={i} style={{padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                  <div style={{color:C.text,marginBottom:2}}>{a.a}</div>
                  <div style={{display:"flex",justifyContent:"space-between",color:C.muted,fontSize:10}}><span>{a.u}</span><span>{a.d}</span></div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── IA & ALERTES ── */}
      {tab==="ia"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:C.purple+"44",background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 Intelligence IA — Cartes Virtuelles</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[{ico:"🧠",t:"Score santé",v:"92/100",s:"Utilisation saine",c:C.green},{ico:"⚠️",t:"Alertes actives",v:String(depenses.filter(d=>d.statut==="alerte").length),s:"Dépenses anormales",c:C.red},{ico:"📊",t:"Catégorisation",v:"98%",s:"Précision IA",c:C.purple}].map((k,i)=>(
                <div key={i} style={{background:C.card2,borderRadius:8,padding:12,textAlign:"center",border:`1px solid ${k.c}33`}}>
                  <div style={{fontSize:20,marginBottom:4}}>{k.ico}</div>
                  <div style={{fontSize:18,fontWeight:700,color:k.c}}>{k.v}</div>
                  <div style={{fontSize:10,fontWeight:500,color:C.text,marginBottom:2}}>{k.t}</div>
                  <div style={{fontSize:9,color:C.muted}}>{k.s}</div>
                </div>
              ))}
            </div>
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{borderColor:C.red+"44"}}>
              <CT>🚨 Alertes actives</CT>
              {depenses.filter(d=>d.statut==="alerte").length===0?
                <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:12}}>✅ Aucune alerte active</div>:
                depenses.filter(d=>d.statut==="alerte").map((d,i)=>(
                  <div key={i} style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:8,padding:12,marginBottom:8}}>
                    <div style={{fontWeight:600,color:C.red,fontSize:12,marginBottom:4}}>Dépense anormale détectée</div>
                    <div style={{fontSize:11,color:C.text,marginBottom:4}}>{d.carte} · {d.montant}€ · {d.date}</div>
                    <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{d.desc}</div>
                    <div style={{display:"flex",gap:7}}>
                      <Btn sm v="red" onClick={()=>{const c=cartes.find(x=>x.id===d.carte);if(c)bloquer(c.id);}}>🔒 Bloquer</Btn>
                      <Btn sm v="ghost" onClick={()=>setDepenses(p=>p.map(x=>x.id===d.id?{...x,statut:"validé"}:x))}>✓ Valider</Btn>
                    </div>
                  </div>
                ))
              }
            </Card>
            <Card>
              <CT>⚙️ Alertes configurées</CT>
              {[{l:"Dépense anormale (> 3x moyenne)",a:true},{l:"Budget dépassé à 80%",a:true},{l:"Catégorie non autorisée",a:true},{l:"Dépense hors horaires (23h-6h)",a:false},{l:"Notif WhatsApp temps réel",a:true},{l:"Rapport hebdo automatique",a:true}].map((a,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                  <span style={{color:C.muted}}>{a.l}</span>
                  <Pill label={a.a?"✓ Actif":"○ Inactif"} color={a.a?C.green:C.muted}/>
                </div>
              ))}
              <div style={{marginTop:10}}><Btn v="ghost" full onClick={()=>showToast("✓ Alertes configurées")}>Modifier les alertes</Btn></div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PAGE ACCUEIL ─────────────────────────────────────────────
const PageAccueil=({devis,setPage,notifs})=>{
  const now=new Date();
  const heure=now.getHours();
  const jours=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const mois=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const dateStr=`${jours[now.getDay()]} ${now.getDate()} ${mois[now.getMonth()]} ${now.getFullYear()}`;
  const heureStr=now.toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"});
  const salut=heure<12?"Bonjour":heure<18?"Bon après-midi":"Bonsoir";

  const pending=devis.filter(d=>d.statut==="en_attente").length;
  const ca=24380;

  // MESSAGES UNIFIÉS
  const [messages,setMessages]=useState([
    {id:1,from:"Sofia Riad",canal:"whatsapp",avatar:"S",couleur:C.gold,preview:"Bonjour, quand est-ce que votre équipe peut venir pour le nettoyage ?",temps:"09:23",lu:false,type:"client",page:"crm"},
    {id:2,from:"Thomas",canal:"whatsapp",avatar:"T",couleur:C.blue,preview:"Chef, j'ai fini la mission Airbnb Montmartre. Tout est OK !",temps:"09:15",lu:false,type:"collaborateur",page:"equipe"},
    {id:3,from:"Marc Dupont",canal:"email",avatar:"M",couleur:C.purple,preview:"Votre devis TYM-0043 — pouvez-vous faire un geste sur le prix ?",temps:"08:45",lu:true,type:"client",page:"devis"},
    {id:4,from:"Partenaire Luxe Paris",canal:"whatsapp",avatar:"P",couleur:C.teal,preview:"J'ai un client qui cherche service jet privé pour 3 personnes",temps:"08:30",lu:true,type:"partenaire",page:"partenaires"},
    {id:5,from:"Abou",canal:"sms",avatar:"A",couleur:C.orange,preview:"Je serai en retard de 20 min pour la mission de ce matin",temps:"07:55",lu:false,type:"collaborateur",page:"equipe"},
    {id:6,from:"Isabelle Moreau",canal:"email",avatar:"I",couleur:C.green,preview:"Merci pour le nettoyage ! Très satisfaite du service 5 étoiles",temps:"Hier",lu:true,type:"client",page:"crm"},
  ]);

  const [msgOuvert,setMsgOuvert]=useState(null);
  const [reponse,setReponse]=useState("");
  const nonLus=messages.filter(m=>!m.lu).length;

  const ouvrirMsg=(msg)=>{
    setMessages(p=>p.map(m=>m.id===msg.id?{...m,lu:true}:m));
    setMsgOuvert(msg);
  };

  const envoyerReponse=()=>{
    if(!reponse)return;
    setReponse("");
    setMsgOuvert(null);
    setPage(msgOuvert.page);
  };

  // PRIORITÉS IA
  const priorites=[
    {ico:"🔴",txt:`${pending} devis en attente de validation`,action:"Valider maintenant",page:"devis",urgent:true},
    {ico:"🟠",txt:"Sofia Riad attend une réponse depuis 2h",action:"Répondre",page:"crm",urgent:true},
    {ico:"🟡",txt:"Stock produits vitres critique — commander",action:"Voir stock",page:"stock",urgent:false},
    {ico:"🟢",txt:"Thomas disponible cet après-midi — planifier mission",action:"Planifier",page:"planning",urgent:false},
  ];

  // ÉQUIPE EN DIRECT
  const equipe=[
    {nom:"Thomas",role:"Polyvalent",statut:"En mission",mission:"Airbnb Montmartre",couleur:C.blue,avatar:"T"},
    {nom:"Abou",role:"Nettoyage",statut:"Disponible",mission:"",couleur:C.teal,avatar:"A"},
    {nom:"Fatou",role:"Hôtesse",statut:"En RDV",mission:"Client VIP — 14h",couleur:C.purple,avatar:"F"},
  ];

  // TIMELINE DU JOUR
  const [timeline,setTimeline]=useState([
    {h:"09:00",type:"mission",titre:"Nettoyage Airbnb Montmartre",collab:"Thomas",statut:"terminé"},
    {h:"11:00",type:"rdv",titre:"RDV Client Isabelle Moreau",collab:"Fatou",statut:"en cours"},
    {h:"14:00",type:"mission",titre:"Jet Privé — Préparation",collab:"Thomas,Abou",statut:"à venir"},
    {h:"17:00",type:"rdv",titre:"Appel partenaire Luxe Paris",collab:"Curtiss",statut:"à venir"},
  ]);

  const canalIcon=(c)=>c==="whatsapp"?"💬":c==="email"?"📧":"📱";
  const canalColor=(c)=>c==="whatsapp"?"#25D366":c==="email"?C.blue:C.orange;

  return(
    <div>
      {/* MODAL MESSAGE */}
      {msgOuvert&&(
        <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${msgOuvert.couleur}44`,borderRadius:14,padding:24,width:480,maxWidth:"100%"}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:`${msgOuvert.couleur}22`,border:`1px solid ${msgOuvert.couleur}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:msgOuvert.couleur}}>{msgOuvert.avatar}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:C.text}}>{msgOuvert.from}</div>
                <div style={{fontSize:11,color:C.muted}}>{canalIcon(msgOuvert.canal)} {msgOuvert.canal} · {msgOuvert.temps}</div>
              </div>
              <Pill label={msgOuvert.type} color={msgOuvert.couleur}/>
            </div>
            {/* Message */}
            <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:16,fontSize:13,color:C.text,lineHeight:1.7}}>{msgOuvert.preview}</div>
            {/* Réponse rapide */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Réponse rapide</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                {["Je reviens vers vous rapidement","Merci pour votre message","C'est noté, je m'en occupe","Bien reçu ✓"].map((r,i)=>(
                  <button key={i} onClick={()=>setReponse(r)} style={{padding:"4px 10px",border:`1px solid ${C.border}`,borderRadius:20,background:reponse===r?`${C.gold}22`:C.card2,color:reponse===r?C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{r}</button>
                ))}
              </div>
              <Inp placeholder="Ou écrire une réponse personnalisée..." value={reponse} onChange={e=>setReponse(e.target.value)} style={{width:"100%"}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn v="ghost" full onClick={()=>setMsgOuvert(null)}>Fermer</Btn>
              <Btn v="gold" onClick={envoyerReponse}>📲 Envoyer & Aller à la conversation →</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={{background:`linear-gradient(135deg,${C.card},#0A1A14)`,border:`1px solid ${C.gold}33`,borderRadius:16,padding:24,marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:C.gold+"06"}}/>
        <div style={{position:"absolute",bottom:-30,left:-30,width:150,height:150,borderRadius:"50%",background:C.teal+"06"}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:26,fontWeight:700,color:C.text,marginBottom:4}}>{salut}, Curtiss ✦</div>
              <div style={{fontSize:12,color:C.muted}}>{dateStr} · {heureStr} · Paris</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:C.teal,marginBottom:2}}>💳 Solde Wallet</div>
              <div style={{fontSize:22,fontWeight:700,color:C.gold}}>{fmt(ca,"EUR")}</div>
            </div>
          </div>

          {/* Message IA matinal */}
          <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:12,marginBottom:14}}>
            <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:4}}>🤖 Analyse IA du matin — Claude</div>
            <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>
              {pending>0?`Vous avez ${pending} devis en attente — c'est votre priorité du jour. `:"Tous vos devis sont traités ✓ "}
              CA hebdo en hausse de +12%. Thomas est en mission, Abou disponible. {nonLus>0?`${nonLus} message${nonLus>1?"s":""} non lu${nonLus>1?"s":""}  en attente.`:"Aucun message urgent."}
            </div>
          </div>

          {/* Score santé */}
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {[{l:"Score business",v:"74/100",c:C.gold,ico:"🏆"},{l:"CA ce mois",v:fmt(ca,"EUR"),c:C.green,ico:"📈"},{l:"Marge nette",v:"61%",c:C.teal,ico:"💎"},{l:"Messages non lus",v:String(nonLus),c:nonLus>0?C.orange:C.green,ico:"💬"}].map((k,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:C.card2,borderRadius:8,padding:"8px 12px",border:`1px solid ${k.c}22`}}>
                <span style={{fontSize:16}}>{k.ico}</span>
                <div><div style={{fontSize:11,fontWeight:700,color:k.c}}>{k.v}</div><div style={{fontSize:9,color:C.muted}}>{k.l}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>

        {/* MESSAGES UNIFIÉS */}
        <Card style={{borderColor:nonLus>0?C.orange+"44":C.border}}>
          <CT>
            💬 Messages
            {nonLus>0&&<span style={{background:C.orange,color:"#000",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,marginLeft:6}}>{nonLus} non lus</span>}
          </CT>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {messages.map((m,i)=>(
              <div key={i} onClick={()=>ouvrirMsg(m)} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 10px",background:m.lu?C.card2:`${m.couleur}0D`,borderRadius:8,border:`1px solid ${m.lu?C.border:m.couleur+"33"}`,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${m.couleur}18`}
                onMouseLeave={e=>e.currentTarget.style.background=m.lu?C.card2:`${m.couleur}0D`}
              >
                <div style={{width:34,height:34,borderRadius:"50%",background:`${m.couleur}22`,border:`1px solid ${m.couleur}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:m.couleur,flexShrink:0}}>{m.avatar}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                    <span style={{fontSize:12,fontWeight:m.lu?500:700,color:C.text}}>{m.from}</span>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <span style={{fontSize:9,color:canalColor(m.canal)}}>{canalIcon(m.canal)}</span>
                      <span style={{fontSize:10,color:C.muted}}>{m.temps}</span>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.preview}</div>
                </div>
                {!m.lu&&<div style={{width:8,height:8,borderRadius:"50%",background:m.couleur,flexShrink:0}}/>}
              </div>
            ))}
          </div>
        </Card>

        {/* PRIORITÉS IA + ÉQUIPE */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card style={{borderColor:C.purple+"44"}}>
            <CT>🔥 Priorités IA du jour</CT>
            {priorites.map((p,i)=>(
              <div key={i} onClick={()=>setPage(p.page)} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 10px",background:p.urgent?`${C.red}08`:C.card2,borderRadius:7,marginBottom:6,cursor:"pointer",border:`1px solid ${p.urgent?C.red+"22":C.border}`,transition:"all 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${p.urgent?C.red:C.gold}15`}
                onMouseLeave={e=>e.currentTarget.style.background=p.urgent?`${C.red}08`:C.card2}
              >
                <span style={{fontSize:14,flexShrink:0}}>{p.ico}</span>
                <span style={{flex:1,fontSize:11,color:C.text}}>{p.txt}</span>
                <span style={{fontSize:10,color:C.gold,whiteSpace:"nowrap",fontWeight:600}}>{p.action} →</span>
              </div>
            ))}
          </Card>

          <Card>
            <CT>👥 Équipe en direct</CT>
            {equipe.map((e,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<2?`1px solid ${C.border}22`:"none"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:`${e.couleur}22`,border:`1px solid ${e.couleur}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:e.couleur,flexShrink:0}}>{e.avatar}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{e.nom}</div>
                  <div style={{fontSize:10,color:C.muted}}>{e.mission||e.statut}</div>
                </div>
                <Pill label={e.statut} color={e.statut==="En mission"?C.blue:e.statut==="Disponible"?C.green:C.orange}/>
              </div>
            ))}
            <div style={{marginTop:8}}><Btn v="ghost" sm full onClick={()=>setPage("equipe")}>Voir l'équipe complète →</Btn></div>
          </Card>
        </div>
      </div>

      {/* TIMELINE + ACTIONS RAPIDES */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <CT>📅 Timeline du jour</CT>
          {timeline.map((t,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"8px 0",borderBottom:i<timeline.length-1?`1px solid ${C.border}22`:"none"}}>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:11,fontWeight:700,color:t.statut==="terminé"?C.muted:C.gold}}>{t.h}</div>
                <div style={{width:2,height:24,background:t.statut==="terminé"?C.border:C.gold+"44",margin:"4px auto"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:t.statut==="terminé"?C.muted:C.text,textDecoration:t.statut==="terminé"?"line-through":"none"}}>{t.titre}</div>
                <div style={{fontSize:10,color:C.muted}}>{t.collab}</div>
              </div>
              <Pill label={t.statut==="terminé"?"✓ Terminé":t.statut==="en cours"?"● En cours":"À venir"} color={t.statut==="terminé"?C.muted:t.statut==="en cours"?C.green:C.blue}/>
            </div>
          ))}
          <div style={{marginTop:8}}>
            <Btn v="ghost" sm full onClick={()=>setPage("planning")}>Planning complet →</Btn>
          </div>
        </Card>

        <Card>
          <CT>⚡ Actions rapides</CT>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {ico:"💳",l:"Payer / Encaisser",page:"wallet",c:C.gold},
              {ico:"📋",l:"Nouveau devis",page:"devis",c:C.blue},
              {ico:"👥",l:"Nouveau client",page:"crm",c:C.teal},
              {ico:"📅",l:"Planifier mission",page:"planning",c:C.purple},
              {ico:"⊕",l:"Prospecter",page:"prospection",c:C.orange},
              {ico:"📊",l:"Vue d'ensemble",page:"overview",c:C.green},
            ].map((a,i)=>(
              <button key={i} onClick={()=>setPage(a.page)} style={{background:`${a.c}11`,border:`1px solid ${a.c}33`,borderRadius:8,padding:"12px 8px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"all 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${a.c}22`}
                onMouseLeave={e=>e.currentTarget.style.background=`${a.c}11`}
              >
                <div style={{fontSize:22,marginBottom:5}}>{a.ico}</div>
                <div style={{fontSize:11,fontWeight:600,color:a.c}}>{a.l}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* GRAPHIQUE CA + NOTIFICATIONS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <CT>📈 CA — 7 derniers jours vs semaine précédente</CT>
          <div style={{display:"flex",gap:4,alignItems:"flex-end",height:100,marginBottom:8}}>
            {[{j:"Lun",v1:2800,v2:2400},{j:"Mar",v1:3200,v2:2900},{j:"Mer",v1:2600,v2:3100},{j:"Jeu",v1:4100,v2:3400},{j:"Ven",v1:3800,v2:3200},{j:"Sam",v1:1200,v2:900},{j:"Auj",v1:2100,v2:0}].map((d,i)=>{
              const max=4100;
              return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{width:"100%",display:"flex",gap:1,alignItems:"flex-end",height:80}}>
                    <div style={{flex:1,background:`${C.gold}88`,borderRadius:"2px 2px 0 0",height:`${(d.v1/max)*80}px`}}/>
                    <div style={{flex:1,background:`${C.border}`,borderRadius:"2px 2px 0 0",height:`${(d.v2/max)*80}px`}}/>
                  </div>
                  <div style={{fontSize:8,color:C.muted}}>{d.j}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:14,fontSize:10}}>
            <div style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:10,height:4,background:C.gold+"88",borderRadius:2}}/><span style={{color:C.muted}}>Cette semaine</span></div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:10,height:4,background:C.border,borderRadius:2}}/><span style={{color:C.muted}}>Semaine précédente</span></div>
            <div style={{marginLeft:"auto",color:C.green,fontWeight:600}}>+12% ↗</div>
          </div>
        </Card>

        <Card>
          <CT>🔔 Notifications urgentes</CT>
          {(notifs||[]).slice(0,5).map((n,i)=>(
            <div key={i} onClick={()=>setPage(n.page||"overview")} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,cursor:"pointer"}}>
              <span style={{fontSize:18}}>{n.icon||"🔔"}</span>
              <div style={{flex:1}}><div style={{fontSize:12,color:C.text}}>{n.msg}</div><div style={{fontSize:10,color:C.muted}}>{n.time}</div></div>
              {n.urgent&&<div style={{width:8,height:8,borderRadius:"50%",background:C.red,flexShrink:0}}/>}
            </div>
          ))}
          {(!notifs||notifs.length===0)&&(
            <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:12}}>✅ Aucune notification urgente</div>
          )}
          <div style={{marginTop:8}}><Btn v="ghost" sm full onClick={()=>setPage("notifications")}>Voir toutes les notifications →</Btn></div>
        </Card>
      </div>
    </div>
  );
};

// ─── PAGES BUSINESS PRO ───────────────────────────────────────
const PageOverview=({devis,setPage,notifs})=>{
  const pending=devis.filter(d=>d.statut==="en_attente").length;
  const ca=24380,ch=CHARGES.reduce((s,c)=>s+c.mois,0);
  const now=new Date();
  const jours=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const mois=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const dateStr=`${jours[now.getDay()]} ${now.getDate()} ${mois[now.getMonth()]} ${now.getFullYear()}`;
  const [missions,setMissions]=useState(PLANNING);
  const [modalMission,setModalMission]=useState(false);
  const [newMission,setNewMission]=useState({h:"",service:"",client:"",collab:"Thomas",duree:"1h",type:"mission"});
  const [solde,setSolde]=useState(24380);
  const [editSolde,setEditSolde]=useState(false);
  const [soldeInput,setSoldeInput]=useState(String(solde));
  const alertes=[
    pending>0&&{ico:"📋",msg:`${pending} devis en attente de validation`,c:C.orange,page:"devis"},
    STOCK.filter(s=>s.qte<s.min).length>0&&{ico:"📦",msg:`${STOCK.filter(s=>s.qte<s.min).length} produit(s) en rupture de stock`,c:C.red,page:"stock"},
    {ico:"💰",msg:"Commissions partenaires à payer ce mois",c:C.purple,page:"wallet"},
  ].filter(Boolean);

  return(
    <div>
      {/* MODAL CRÉER MISSION */}
      {modalMission&&(
        <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:400}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>+ Nouvelle mission</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[["Heure","h","text","09:00"],["Service","service","text","Nettoyage Airbnb"],["Client","client","text","Sofia Riad"],["Durée","duree","text","2h"]].map(([l,k,t,ph])=>(
                <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div>
                <Inp type={t} placeholder={ph} value={newMission[k]} onChange={e=>setNewMission(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
              ))}
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Collaborateur</div>
              <Sel value={newMission.collab} onChange={e=>setNewMission(p=>({...p,collab:e.target.value}))} options={["Thomas","Abou","Fatou"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Type</div>
              <Sel value={newMission.type} onChange={e=>setNewMission(p=>({...p,type:e.target.value}))} options={[{v:"mission",l:"Mission"},{v:"rdv",l:"RDV"}]} style={{width:"100%"}}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <Btn v="ghost" full onClick={()=>setModalMission(false)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(newMission.h&&newMission.service&&newMission.client){
                  setMissions(p=>[...p,{...newMission,id:`M${Date.now()}`}]);
                  setModalMission(false);
                  setNewMission({h:"",service:"",client:"",collab:"Thomas",duree:"1h",type:"mission"});
                }
              }}>✓ Créer</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:24,fontWeight:700,color:C.text}}>Bonjour Curtiss ✦</div>
          <div style={{fontSize:12,color:C.muted,marginTop:3}}>{dateStr} · Tymeless OS · Espace Owner</div>
        </div>
        {/* SOLDE WALLET */}
        <div style={{background:`linear-gradient(135deg,${C.card},#0A1A14)`,border:`1px solid ${C.teal}44`,borderRadius:10,padding:"10px 16px",textAlign:"right",cursor:"pointer"}} onClick={()=>setEditSolde(true)}>
          <div style={{fontSize:10,color:C.teal,marginBottom:2}}>💳 Solde Wallet</div>
          {editSolde?(
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Inp type="number" value={soldeInput} onChange={e=>setSoldeInput(e.target.value)} style={{width:100,fontSize:13,fontWeight:700}} autoFocus/>
              <Btn sm v="gold" onClick={e=>{e.stopPropagation();setSolde(Number(soldeInput));setEditSolde(false);}}>✓</Btn>
            </div>
          ):(
            <div style={{fontSize:20,fontWeight:700,color:C.gold}}>{fmt(solde,"EUR")}</div>
          )}
        </div>
      </div>

      {/* ALERTES */}
      {alertes.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
          {alertes.map((a,i)=>(
            <div key={i} onClick={()=>setPage(a.page)} style={{background:`${a.c}11`,border:`1px solid ${a.c}33`,borderRadius:8,padding:"9px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
              <span style={{fontSize:16}}>{a.ico}</span>
              <span style={{fontSize:12,color:a.c,fontWeight:500}}>{a.msg}</span>
              <span style={{marginLeft:"auto",fontSize:11,color:a.c}}>Voir →</span>
            </div>
          ))}
        </div>
      )}

      {/* BRIEFING */}
      <Card style={{marginBottom:16,borderColor:`${C.gold}44`,background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
        <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          <span style={{fontSize:28}}>📊</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:C.gold,marginBottom:5,fontSize:14}}>Briefing · {dateStr}</div>
            <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>
              CA hebdo : <b style={{color:C.gold}}>6 480 €</b> · {pending} devis en attente · {STOCK.filter(s=>s.qte<s.min).length} alertes stock · NPS : <b style={{color:C.green}}>4.9/5 ✦</b>
            </div>
          </div>
          <Btn sm v="ghost" onClick={()=>setPage("notifications")}>Notifs →</Btn>
        </div>
      </Card>

      {/* ACTIONS RAPIDES */}
      <Card style={{marginBottom:16}}>
        <CT>⚡ Actions rapides</CT>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {[
            {ico:"📋",l:"Nouveau devis",page:"devis",c:C.gold},
            {ico:"👥",l:"Nouveau client",page:"crm",c:C.blue},
            {ico:"💳",l:"Encaisser",page:"wallet",c:C.green},
            {ico:"📅",l:"Planifier mission",action:()=>setModalMission(true),c:C.purple},
            {ico:"⊕",l:"Prospecter",page:"prospection",c:C.teal},
          ].map((a,i)=>(
            <button key={i} onClick={a.action||(() => setPage(a.page))} style={{background:`${a.c}11`,border:`1px solid ${a.c}33`,borderRadius:8,padding:"10px 8px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${a.c}22`}
              onMouseLeave={e=>e.currentTarget.style.background=`${a.c}11`}
            >
              <div style={{fontSize:20,marginBottom:5}}>{a.ico}</div>
              <div style={{fontSize:10,fontWeight:600,color:a.c}}>{a.l}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:18}}>
        <KPI label="CA ce mois" val={`${ca.toLocaleString("fr")} €`} sub={`${mois[now.getMonth()]} ${now.getFullYear()}`} trend="+12% vs mois dernier" up={true}/>
        <KPI label="Devis en attente" val={pending} sub="Validation requise" trend="Action requise" up={false} onClick={()=>setPage("devis")} badge={pending}/>
        <KPI label="Marge nette" val={`${Math.round(((ca-ch)/ca)*100)}%`} sub="Tous services" trend="+4pts vs T1" up={true} color={C.green}/>
        <KPI label="Commissions" val="3 412 €" sub="Auto prélevées" trend="Ce mois" up={true} color={C.purple}/>
        <KPI label="Prospects CRM" val={CRM_LEADS.length} sub="dont 2 en négociation" trend="+3 ce mois" up={true} color={C.blue} onClick={()=>setPage("crm")}/>
        <KPI label="Réseau membres" val={ANNUAIRE.length} sub="annuaire actif" trend="+2 ce mois" up={true} color={C.teal}/>
        <KPI label="Stock alertes" val={STOCK.filter(s=>s.qte<s.min).length} sub="Réappro. urgent" trend="Urgent" up={false} onClick={()=>setPage("stock")} badge={STOCK.filter(s=>s.qte<s.min).length}/>
        <KPI label="Score global" val="74/100" sub="Business Health" trend="🟡 Bon" up={true} color={C.gold}/>
      </div>

      {/* GRAPHIQUES */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <Card>
          <CT>CA par service</CT>
          <div style={{display:"flex",gap:6,alignItems:"flex-end",height:90}}>
            {[{l:"Airbnb",v:42,c:C.gold},{l:"Résid.",v:18,c:C.green},{l:"Bureaux",v:12,c:C.blue},{l:"Jet",v:15,c:C.orange},{l:"Yacht",v:8,c:C.purple},{l:"Rapatr.",v:5,c:C.red}].map((s,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{fontSize:9,color:s.c,fontWeight:600}}>{s.v}%</div>
                <div style={{width:"100%",height:s.v*1.7,background:`${s.c}22`,border:`1px solid ${s.c}44`,borderRadius:"3px 3px 0 0"}}/>
                <div style={{fontSize:8,color:C.muted,textAlign:"center"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CT>Business Health Score</CT>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
            <div style={{position:"relative",flexShrink:0}}>
              <svg width="70" height="70" style={{transform:"rotate(-90deg)"}}><circle cx="35" cy="35" r="28" stroke={C.border} strokeWidth="5" fill="none"/><circle cx="35" cy="35" r="28" stroke={C.gold} strokeWidth="5" fill="none" strokeDasharray={2*Math.PI*28} strokeDashoffset={2*Math.PI*28*0.26} style={{strokeLinecap:"round"}}/></svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:C.gold}}>74</div>
            </div>
            <div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>74/100</div><div style={{fontSize:10,color:C.muted}}>🟡 Bon · À optimiser</div></div>
          </div>
          {[{l:"Conversion devis",v:78,c:C.green},{l:"Satisfaction",v:91,c:C.gold},{l:"Rentabilité",v:61,c:C.blue},{l:"Réseau",v:55,c:C.teal}].map((m,i)=>(
            <div key={i} style={{marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}><span style={{color:C.muted}}>{m.l}</span><span style={{color:m.c}}>{m.v}%</span></div>
              <div style={{height:3,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${m.v}%`,background:m.c,borderRadius:2}}/></div>
            </div>
          ))}
        </Card>
      </div>

      {/* MISSIONS DU JOUR */}
      <Card>
        <CT>Missions & RDV du jour
          <div style={{display:"flex",gap:7}}>
            <Btn sm v="gold" onClick={()=>setModalMission(true)}>+ Créer mission</Btn>
            <Btn sm v="ghost" onClick={()=>setPage("planning")}>Planning complet →</Btn>
          </div>
        </CT>
        {missions.length===0?(
          <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:12}}>Aucune mission aujourd'hui · <span style={{color:C.gold,cursor:"pointer"}} onClick={()=>setModalMission(true)}>+ Créer une mission</span></div>
        ):(
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {missions.filter((_,i)=>i<4).map((p,i)=>(
              <div key={i} style={{flex:1,minWidth:160,background:C.card2,border:`1px solid ${p.type==="rdv"?C.purple+"44":C.border}`,borderRadius:8,padding:10,position:"relative"}}>
                <button onClick={()=>setMissions(prev=>prev.filter((_,j)=>j!==i))} style={{position:"absolute",top:6,right:6,background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>✕</button>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:p.type==="rdv"?C.purple:C.gold}}>{p.h}</span><St s={p.type}/></div>
                <div style={{fontWeight:600,fontSize:11,marginBottom:2}}>{p.service}</div>
                <div style={{fontSize:10,color:C.muted}}>{p.client}</div>
                <div style={{fontSize:10,color:C.blue,marginTop:3}}>👤 {p.collab} · {p.duree}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── SCORE SOLVABILITÉ TYMELESS ───────────────────────────────
const SolvabiliteWidget=({nom,siret,contexte="client"})=>{
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [aiAnalyse,setAiAnalyse]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [open,setOpen]=useState(false);

  const getScoreColor=(s)=>s>=81?C.green:s>=61?"#22C55E":s>=31?C.orange:C.red;
  const getVerdict=(s)=>{
    if(s>=81)return{label:"✅ TRÈS SOLVABLE",color:C.green,bg:`${C.green}11`,border:`${C.green}33`,conseil:"Profil financier excellent. Paiement garanti. Conditions normales applicables."};
    if(s>=61)return{label:"✅ SOLVABLE",color:"#22C55E",bg:"#22C55E11",border:"#22C55E33",conseil:"Profil acceptable. Paiement à 30 jours envisageable. Acompte optionnel."};
    if(s>=31)return{label:"⚠️ SOLVABILITÉ INCERTAINE",color:C.orange,bg:`${C.orange}11`,border:`${C.orange}33`,conseil:"Procéder avec prudence. Demander un acompte de 50% minimum."};
    return{label:"❌ NON SOLVABLE",color:C.red,bg:`${C.red}11`,border:`${C.red}33`,conseil:"Risque élevé de défaut. Déconseillé sans garantie ou paiement intégral à l'avance."};
  };

  const analyser=async()=>{
    if(!nom&&!siret){return;}
    setLoading(true);
    setOpen(true);
    // Simulation Phase 1 — APIs publiques (SIRENE, Open Corporates, BODACC)
    await new Promise(r=>setTimeout(r,1800));

    // Calcul Score Tymeless Phase 1
    const nomLength=nom?.length||0;
    const hasSiret=siret&&siret.length>=9;
    const baseScore=Math.floor(45+Math.random()*40);
    const bonusSiret=hasSiret?10:0;
    const bonusNom=nomLength>5?5:0;
    const score=Math.min(100,baseScore+bonusSiret+bonusNom);

    const anciennete=Math.floor(1+Math.random()*15)+" ans";
    const capital=Math.floor(1000+Math.random()*99000)+"€";
    const effectif=Math.floor(1+Math.random()*50)+" employés";
    const procedures=score<35?["Redressement judiciaire 2023"]:[]; 

    setResult({
      score,
      nom:nom||"Entreprise inconnue",
      siret:siret||"Non fourni",
      anciennete,
      capital,
      effectif,
      procedures,
      sources:["INSEE SIRENE","Open Corporates","BODACC"],
      date:new Date().toLocaleDateString("fr"),
      phase:"Phase 1 — Sources publiques",
    });
    setLoading(false);

    // Analyse Claude IA automatique
    setAiLoading(true);
    try{
      const v=getVerdict(score);
      const prompt=`Tu es expert en analyse de solvabilité d'entreprise. Analyse ce profil et donne une recommandation concrète en 2-3 phrases max.

Entreprise : ${nom||"Non renseigné"}
SIRET : ${siret||"Non renseigné"}
Score Tymeless : ${score}/100
Verdict : ${v.label}
Ancienneté : ${anciennete}
Capital : ${capital}
Effectif : ${effectif}
Procédures judiciaires : ${procedures.length>0?procedures.join(", "):"Aucune"}
Contexte : ${contexte==="client"?"Client potentiel":contexte==="devis"?"Validation d'un devis":"Partenaire commercial"}

Donne : 1) Ton analyse en 1 phrase 2) La recommandation concrète pour Curtiss (faut-il signer ? quel acompte demander ? quelles précautions ?)`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiAnalyse(data.content?.[0]?.text||"Analyse non disponible");
    }catch(e){setAiAnalyse("Connectez-vous pour obtenir l'analyse IA");}
    setAiLoading(false);
  };

  const verdict=result?getVerdict(result.score):null;

  return(
    <div style={{marginTop:10}}>
      {!open?(
        <button onClick={analyser} style={{display:"flex",alignItems:"center",gap:8,background:`${C.teal}11`,border:`1px solid ${C.teal}44`,borderRadius:8,padding:"8px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:12,color:C.teal,fontWeight:600,transition:"all 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.background=`${C.teal}22`}
          onMouseLeave={e=>e.currentTarget.style.background=`${C.teal}11`}
        >
          🔍 Vérifier la solvabilité — Score Tymeless
        </button>
      ):(
        <div style={{background:C.card2,border:`1px solid ${C.teal}44`,borderRadius:10,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:600,color:C.teal}}>🔍 Score Tymeless de Solvabilité</div>
            <button onClick={()=>{setOpen(false);setResult(null);setAiAnalyse(null);}} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>✕</button>
          </div>

          {loading?(
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontSize:24,marginBottom:8}}>🔍</div>
              <div style={{fontSize:12,color:C.teal,fontWeight:600,marginBottom:4}}>Analyse en cours...</div>
              <div style={{fontSize:10,color:C.muted}}>Interrogation INSEE SIRENE · Open Corporates · BODACC</div>
            </div>
          ):result&&(
            <div>
              {/* SCORE PRINCIPAL */}
              <div style={{background:verdict?.bg,border:`1px solid ${verdict?.border}`,borderRadius:10,padding:16,marginBottom:12,textAlign:"center"}}>
                {/* Jauge */}
                <div style={{position:"relative",width:80,height:80,margin:"0 auto 10px"}}>
                  <svg viewBox="0 0 80 80" style={{transform:"rotate(-90deg)"}}>
                    <circle cx="40" cy="40" r="32" stroke={C.border} strokeWidth="6" fill="none"/>
                    <circle cx="40" cy="40" r="32" stroke={getScoreColor(result.score)} strokeWidth="6" fill="none"
                      strokeDasharray={2*Math.PI*32} strokeDashoffset={2*Math.PI*32*(1-result.score/100)}
                      style={{strokeLinecap:"round",transition:"stroke-dashoffset 1s"}}/>
                  </svg>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:getScoreColor(result.score)}}>{result.score}</div>
                </div>
                <div style={{fontSize:16,fontWeight:700,color:verdict?.color,marginBottom:4}}>{verdict?.label}</div>
                <div style={{fontSize:10,color:C.muted,marginBottom:8}}>Score Tymeless · sur 100 · {result.date}</div>
                <div style={{fontSize:11,color:C.text,lineHeight:1.6,background:`${C.dark}44`,borderRadius:6,padding:"8px 10px"}}>{verdict?.conseil}</div>
              </div>

              {/* DONNÉES ENTREPRISE */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                {[["🏢 Entreprise",result.nom],["🔢 SIRET",result.siret||"—"],["📅 Ancienneté",result.anciennete],["💰 Capital",result.capital],["👥 Effectif",result.effectif],["⚖️ Procédures",result.procedures.length===0?"Aucune ✓":result.procedures.join(", ")]].map(([l,v],i)=>(
                  <div key={i} style={{background:C.card,borderRadius:6,padding:"7px 10px",border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                    <div style={{fontSize:11,fontWeight:500,color:i===5&&result.procedures.length>0?C.red:C.text}}>{v}</div>
                  </div>
                ))}
              </div>

              {/* ANALYSE IA CLAUDE */}
              <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:10,marginBottom:10}}>
                <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:4}}>🤖 Analyse Claude IA</div>
                {aiLoading?(
                  <div style={{fontSize:11,color:C.muted}}>Analyse IA en cours...</div>
                ):(
                  <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{aiAnalyse}</div>
                )}
              </div>

              {/* PHASE + SOURCES */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:9,color:C.muted}}>
                <span>📡 {result.phase}</span>
                <span>Sources : {result.sources.join(" · ")}</span>
              </div>

              {/* PHASES 2 ET 3 */}
              <div style={{marginTop:10,background:C.card,borderRadius:8,padding:10,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:600,color:C.gold,marginBottom:6}}>🔒 Améliorer la précision</div>
                <div style={{display:"flex",gap:6}}>
                  <div style={{flex:1,background:`${C.gold}11`,border:`1px solid ${C.gold}22`,borderRadius:6,padding:"6px 8px",fontSize:9,color:C.muted,textAlign:"center"}}>
                    <div style={{color:C.gold,fontWeight:600,marginBottom:2}}>Phase 2</div>
                    API Creditsafe · 160 pays · Score certifié
                  </div>
                  <div style={{flex:1,background:`${C.purple}11`,border:`1px solid ${C.purple}22`,borderRadius:6,padding:"6px 8px",fontSize:9,color:C.muted,textAlign:"center"}}>
                    <div style={{color:C.purple,fontWeight:600,marginBottom:2}}>Phase 3</div>
                    Base Tymeless · Données réelles · Afrique + Europe
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PageCRM=()=>{
  const [tab,setTab]=useState("clients");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};

  // ── DONNÉES ───────────────────────────────────────────────
  const [clients,setClients]=useState([
    {id:"CLT-001",nom:"Sofia Riad",societe:"Riad Properties",email:"sofia@riad.fr",tel:"+33 6 12 34 56 78",pays:"France",langue:"fr",service:"Airbnb",statut:"VIP",ca_total:8400,ca_potentiel:12000,derniere_interaction:"Auj. 09:23",score_ia:94,nps:5,panier_moyen:840,frequence:"Mensuel",ltv:28000,risque:"Faible",tags:["VIP","Régulier","Airbnb"],notes:"Cliente fidèle depuis 2023. Toujours satisfaite.",historique:[{type:"whatsapp",msg:"Bonjour, quand pouvez-vous venir ?",date:"Auj. 09:23",sens:"recu"},{type:"email",msg:"Devis TYM-0044 envoyé",date:"Hier 14:00",sens:"envoye"},{type:"rdv",msg:"Visite appartement Montmartre",date:"Il y a 3j",sens:""}]},
    {id:"CLT-002",nom:"Marc Dupont",societe:"Dupont Immobilier",email:"marc@dupont.fr",tel:"+33 6 98 76 54 32",pays:"France",langue:"fr",service:"Bureaux",statut:"Premium",ca_total:3480,ca_potentiel:8000,derniere_interaction:"Hier 14:30",score_ia:72,nps:4,panier_moyen:580,frequence:"Trimestriel",ltv:12000,risque:"Moyen",tags:["Premium","Bureaux"],notes:"Négociation en cours sur le devis TYM-0043.",historique:[{type:"email",msg:"Votre devis — pouvez-vous faire un geste ?",date:"Hier",sens:"recu"},{type:"whatsapp",msg:"Je reviens vers vous rapidement",date:"Il y a 2j",sens:"envoye"}]},
    {id:"CLT-003",nom:"Isabelle Moreau",societe:"",email:"isabelle@moreau.fr",tel:"+33 7 11 22 33 44",pays:"France",langue:"fr",service:"Résidentiel",statut:"Actif",ca_total:1920,ca_potentiel:4000,derniere_interaction:"Il y a 3j",score_ia:65,nps:5,panier_moyen:320,frequence:"Mensuel",ltv:6500,risque:"Faible",tags:["Résidentiel"],notes:"Très satisfaite — potentiel NPS excellent.",historique:[{type:"email",msg:"Merci pour le nettoyage ! 5 étoiles",date:"Il y a 3j",sens:"recu"}]},
    {id:"CLT-004",nom:"Ahmed Al-Rashid",societe:"Al-Rashid Group",email:"ahmed@alrashid.ae",tel:"+971 50 123 4567",pays:"Émirats Arabes Unis",langue:"en",service:"Jet Privé",statut:"VIP",ca_total:24000,ca_potentiel:50000,derniere_interaction:"Il y a 5j",score_ia:96,nps:5,panier_moyen:4800,frequence:"Mensuel",ltv:85000,risque:"Faible",tags:["VIP","Jet Privé","International"],notes:"Client premium. Paiements toujours à temps.",historique:[{type:"whatsapp",msg:"Réservation jet prévu le 25",date:"Il y a 5j",sens:"recu"}]},
    {id:"CLT-005",nom:"Pierre Lefevre",societe:"Lefevre & Associés",email:"pierre@lefevre.fr",tel:"+33 6 55 44 33 22",pays:"France",langue:"fr",service:"Rapatriement",statut:"Inactif",ca_total:4800,ca_potentiel:0,derniere_interaction:"Il y a 45j",score_ia:28,nps:3,panier_moyen:4800,frequence:"Ponctuel",ltv:4800,risque:"Élevé",tags:["Rapatriement","Inactif"],notes:"Dernier contact il y a 45 jours. Relance recommandée.",historique:[{type:"email",msg:"Merci pour le service",date:"Il y a 45j",sens:"recu"}]},
  ]);

  const [leads,setLeads]=useState(CRM_LEADS);
  const [ficheOuverte,setFicheOuverte]=useState(null);
  const [modal,setModal]=useState(null);
  const [aiLoading,setAiLoading]=useState({});
  const [aiResults,setAiResults]=useState({});
  const [filtreStatut,setFiltreStatut]=useState("tous");
  const [filtreService,setFiltreService]=useState("tous");
  const [recherche,setRecherche]=useState("");
  const [newClient,setNewClient]=useState({nom:"",societe:"",email:"",tel:"",pays:"France",langue:"fr",service:"",statut:"Actif",notes:"",tags:[],ca_potentiel:0});
  const [newMsg,setNewMsg]=useState("");

  const STATUTS=["VIP","Premium","Actif","Prospect","Inactif"];
  const STATUT_COLORS={"VIP":C.gold,"Premium":C.purple,"Actif":C.green,"Prospect":C.blue,"Inactif":C.muted};
  const SERVICES=["Airbnb","Résidentiel","Bureaux","Jet Privé","Yacht","Rapatriement"];
  const ETAPES=["Nouveau","Qualifié","Proposition","Négociation","Gagné","Perdu"];
  const ETAPE_COLORS={"Nouveau":C.muted,"Qualifié":C.blue,"Proposition":C.gold,"Négociation":C.orange,"Gagné":C.green,"Perdu":C.red};

  const clientsFiltres=clients.filter(c=>{
    if(filtreStatut!=="tous"&&c.statut!==filtreStatut)return false;
    if(filtreService!=="tous"&&c.service!==filtreService)return false;
    if(recherche&&!c.nom.toLowerCase().includes(recherche.toLowerCase())&&!c.societe?.toLowerCase().includes(recherche.toLowerCase()))return false;
    return true;
  });

  // ── ANALYSE IA CLAUDE ────────────────────────────────────
  const analyserIA=async(client,type)=>{
    const key=`${client.id}_${type}`;
    setAiLoading(p=>({...p,[key]:true}));
    try{
      const prompts={
        resume:`Génère un résumé professionnel de 2-3 phrases pour ce client CRM. Client: ${client.nom}, Société: ${client.societe||"particulier"}, Service: ${client.service}, CA total: ${client.ca_total}€, Fréquence: ${client.frequence}, NPS: ${client.nps}/5, Dernière interaction: ${client.derniere_interaction}. Notes: ${client.notes}. Sois concis et actionnable.`,
        sentiment:`Analyse le sentiment de ce client basé sur ses interactions. Historique: ${client.historique.map(h=>h.msg).join(" | ")}. NPS: ${client.nps}/5. Notes: ${client.notes}. Réponds en 1 phrase: sentiment (Très positif/Positif/Neutre/Négatif/Très négatif) et explication courte.`,
        prediction:`Prédit la probabilité de conversion/fidélisation de ce client en %. Données: Score IA: ${client.score_ia}, CA potentiel: ${client.ca_potentiel}€, Statut: ${client.statut}, Risque: ${client.risque}, NPS: ${client.nps}/5, Fréquence: ${client.frequence}. Donne un % et une recommandation en 1 phrase.`,
        action:`Quelle est la prochaine action recommandée pour ce client ? Client: ${client.nom}, Dernière interaction: ${client.derniere_interaction}, Statut: ${client.statut}, Risque: ${client.risque}, Notes: ${client.notes}. Sois très concret et actionnable en 1-2 phrases.`,
      };
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:prompts[type]}]})});
      const data=await res.json();
      const txt=data.content?.[0]?.text||"Analyse non disponible";
      setAiResults(p=>({...p,[key]:txt}));
    }catch(e){setAiResults(p=>({...p,[key]:"Erreur — Vérifiez la connexion"}));}
    setAiLoading(p=>({...p,[key]:false}));
  };

  const creerClient=()=>{
    if(!newClient.nom)return;
    const id=`CLT-${String(clients.length+1).padStart(3,"0")}`;
    setClients(p=>[{id,...newClient,ca_total:0,derniere_interaction:"Maintenant",score_ia:50,nps:0,panier_moyen:0,frequence:"Nouveau",ltv:0,risque:"Inconnu",historique:[]},...p]);
    setModal(null);
    setNewClient({nom:"",societe:"",email:"",tel:"",pays:"France",langue:"fr",service:"",statut:"Actif",notes:"",tags:[],ca_potentiel:0});
    showToast("✓ Client créé !");
  };

  const supprimerClient=id=>{setClients(p=>p.filter(c=>c.id!==id));setFicheOuverte(null);showToast("Client supprimé","#EF4444");};

  const envoyerMsg=()=>{
    if(!newMsg||!ficheOuverte)return;
    setClients(p=>p.map(c=>c.id===ficheOuverte.id?{...c,historique:[{type:"whatsapp",msg:newMsg,date:"Maintenant",sens:"envoye"},...c.historique],derniere_interaction:"Maintenant"}:c));
    setFicheOuverte(p=>({...p,historique:[{type:"whatsapp",msg:newMsg,date:"Maintenant",sens:"envoye"},...p.historique]}));
    setNewMsg("");
    showToast("📲 Message envoyé sur WhatsApp !");
  };

  const TABS=[
    {id:"clients",label:"👥 Clients"},
    {id:"pipeline",label:"📊 Pipeline"},
    {id:"analytics",label:"📈 Analytics"},
    {id:"automatisations",label:"⚡ Automatisations"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px #00000066"}}>{toast.msg}</div>}

      {/* ── MODAL CRÉER CLIENT ── */}
      {modal==="creer"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:28,width:520,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:20}}>+ Nouveau client</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nom complet *</div><Inp placeholder="Sofia Riad" value={newClient.nom} onChange={e=>setNewClient(p=>({...p,nom:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Société</div><Inp placeholder="Riad Properties" value={newClient.societe} onChange={e=>setNewClient(p=>({...p,societe:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Email</div><Inp type="email" placeholder="sofia@email.fr" value={newClient.email} onChange={e=>setNewClient(p=>({...p,email:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>WhatsApp</div><Inp placeholder="+33 6..." value={newClient.tel} onChange={e=>setNewClient(p=>({...p,tel:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Pays</div><Inp placeholder="France" value={newClient.pays} onChange={e=>setNewClient(p=>({...p,pays:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Service</div><Sel value={newClient.service} onChange={e=>setNewClient(p=>({...p,service:e.target.value}))} options={[{v:"",l:"Choisir..."},...SERVICES.map(s=>({v:s,l:s}))]} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Statut</div><Sel value={newClient.statut} onChange={e=>setNewClient(p=>({...p,statut:e.target.value}))} options={STATUTS.map(s=>({v:s,l:s}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>CA potentiel (€)</div><Inp type="number" placeholder="5000" value={newClient.ca_potentiel} onChange={e=>setNewClient(p=>({...p,ca_potentiel:Number(e.target.value)}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Notes internes</div><textarea value={newClient.notes} onChange={e=>setNewClient(p=>({...p,notes:e.target.value}))} placeholder="Informations importantes sur ce client..." style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontFamily:"inherit",fontSize:12,minHeight:60,resize:"vertical"}}/></div>
              <div>
                <div style={{fontSize:9,color:C.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.1em"}}>Tags</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {["VIP","Régulier","International","Airbnb","Jet Privé","Yacht","B2B","B2C"].map(tag=>(
                    <button key={tag} onClick={()=>setNewClient(p=>({...p,tags:p.tags.includes(tag)?p.tags.filter(t=>t!==tag):[...p.tags,tag]}))} style={{padding:"4px 10px",border:`1px solid ${newClient.tags.includes(tag)?C.gold:C.border}`,borderRadius:20,background:newClient.tags.includes(tag)?`${C.gold}22`:C.card2,color:newClient.tags.includes(tag)?C.gold:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{tag}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={creerClient}>✓ Créer le client</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── FICHE CLIENT ── */}
      {ficheOuverte&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${STATUT_COLORS[ficheOuverte.statut]||C.gold}44`,borderRadius:14,padding:0,width:680,maxWidth:"100%",marginTop:20}}>
            {/* Header fiche */}
            <div style={{background:`linear-gradient(135deg,${C.card},#0A1020)`,borderRadius:"14px 14px 0 0",padding:"20px 24px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                  <div style={{width:48,height:48,borderRadius:"50%",background:`${STATUT_COLORS[ficheOuverte.statut]||C.gold}22`,border:`2px solid ${STATUT_COLORS[ficheOuverte.statut]||C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:STATUT_COLORS[ficheOuverte.statut]||C.gold}}>
                    {ficheOuverte.nom[0]}
                  </div>
                  <div>
                    <div style={{fontSize:18,fontWeight:700,color:C.text}}>{ficheOuverte.nom}</div>
                    {ficheOuverte.societe&&<div style={{fontSize:12,color:C.muted}}>{ficheOuverte.societe}</div>}
                    <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                      <Pill label={ficheOuverte.statut} color={STATUT_COLORS[ficheOuverte.statut]||C.gold}/>
                      {ficheOuverte.service&&<Pill label={ficheOuverte.service} color={C.blue}/>}
                      {ficheOuverte.tags?.map((t,i)=><Pill key={i} label={t} color={C.teal}/>)}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:7,flexShrink:0}}>
                  <Btn sm v="ghost" onClick={()=>showToast("📲 WhatsApp ouvert")}>💬 WA</Btn>
                  <Btn sm v="blue" onClick={()=>showToast("📋 Devis créé")}>+ Devis</Btn>
                  <Btn sm v="red" onClick={()=>supprimerClient(ficheOuverte.id)}>🗑</Btn>
                  <Btn sm v="ghost" onClick={()=>setFicheOuverte(null)}>✕</Btn>
                </div>
              </div>
            </div>

            <div style={{padding:24}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                {/* INFOS */}
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <Card style={{padding:14}}>
                    <div style={{fontSize:10,fontWeight:600,color:C.gold,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Informations</div>
                    {[["📧",ficheOuverte.email],["📱",ficheOuverte.tel],["🌍",ficheOuverte.pays],["🗣️",ficheOuverte.langue==="fr"?"Français":ficheOuverte.langue==="en"?"Anglais":"Arabe"],["🕐","Dernière interaction : "+ficheOuverte.derniere_interaction]].filter(([,v])=>v).map(([ico,v],i)=>(
                      <div key={i} style={{display:"flex",gap:8,fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}>
                        <span>{ico}</span><span style={{color:C.muted}}>{v}</span>
                      </div>
                    ))}
                  </Card>
                  <Card style={{padding:14}}>
                    <div style={{fontSize:10,fontWeight:600,color:C.gold,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Finances</div>
                    {[["CA total",fmt(ficheOuverte.ca_total,"EUR"),C.green],["CA potentiel",fmt(ficheOuverte.ca_potentiel,"EUR"),C.gold],["Panier moyen",fmt(ficheOuverte.panier_moyen,"EUR"),C.blue],["LTV estimée",fmt(ficheOuverte.ltv,"EUR"),C.purple],["Fréquence",ficheOuverte.frequence,C.teal]].map(([l,v,c],i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                        <span style={{color:C.muted}}>{l}</span>
                        <span style={{fontWeight:600,color:c}}>{v}</span>
                      </div>
                    ))}
                  </Card>
                </div>

                {/* IA + SCORES */}
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <Card style={{padding:14,borderColor:`${C.purple}44`}}>
                    <div style={{fontSize:10,fontWeight:600,color:C.purple,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>🤖 Intelligence IA</div>
                    {[
                      {type:"resume",label:"Résumé auto",ico:"📄"},
                      {type:"sentiment",label:"Analyse sentiment",ico:"💭"},
                      {type:"prediction",label:"Prédiction conversion",ico:"🎯"},
                      {type:"action",label:"Prochaine action",ico:"⚡"},
                    ].map(({type,label,ico})=>{
                      const key=`${ficheOuverte.id}_${type}`;
                      return(
                        <div key={type} style={{marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                            <span style={{fontSize:11,color:C.muted}}>{ico} {label}</span>
                            <Btn sm v="ghost" onClick={()=>analyserIA(ficheOuverte,type)}>{aiLoading[key]?"...":"Analyser"}</Btn>
                          </div>
                          {aiResults[key]&&(
                            <div style={{background:C.card2,borderRadius:6,padding:"7px 10px",fontSize:11,color:C.text,lineHeight:1.6,border:`1px solid ${C.purple}22`}}>
                              {aiLoading[key]?<div style={{color:C.muted}}>Analyse en cours...</div>:aiResults[key]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </Card>

                  <Card style={{padding:14}}>
                    <div style={{fontSize:10,fontWeight:600,color:C.gold,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Scores & Risques</div>
                    {[{l:"Score IA",v:ficheOuverte.score_ia,max:100,c:ficheOuverte.score_ia>70?C.green:ficheOuverte.score_ia>40?C.gold:C.red},{l:"NPS",v:ficheOuverte.nps*20,max:100,c:ficheOuverte.nps>=4?C.green:ficheOuverte.nps>=3?C.gold:C.red}].map((s,i)=>(
                      <div key={i} style={{marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                          <span style={{color:C.muted}}>{s.l}</span>
                          <span style={{color:s.c,fontWeight:600}}>{s.l==="NPS"?`${ficheOuverte.nps}/5`:`${s.v}/100`}</span>
                        </div>
                        <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${s.v}%`,background:s.c,borderRadius:2}}/></div>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0"}}>
                      <span style={{color:C.muted}}>Risque de départ</span>
                      <Pill label={ficheOuverte.risque} color={ficheOuverte.risque==="Faible"?C.green:ficheOuverte.risque==="Moyen"?C.orange:C.red}/>
                    </div>
                  </Card>
                </div>
              </div>

              {/* NOTES */}
              {ficheOuverte.notes&&(
                <Card style={{marginBottom:14,padding:14}}>
                  <div style={{fontSize:10,fontWeight:600,color:C.gold,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>📝 Notes internes</div>
                  <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>{ficheOuverte.notes}</div>
                </Card>
              )}

              {/* SCORE SOLVABILITÉ */}
              <Card style={{marginBottom:14,padding:14,borderColor:`${C.teal}44`}}>
                <div style={{fontSize:10,fontWeight:600,color:C.teal,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>🔍 Solvabilité — Score Tymeless</div>
                <SolvabiliteWidget nom={ficheOuverte.nom} siret={ficheOuverte.siret} contexte="client"/>
              </Card>

              {/* HISTORIQUE + MESSAGE */}
              <Card style={{padding:14}}>
                <div style={{fontSize:10,fontWeight:600,color:C.gold,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.1em"}}>💬 Historique & Communication</div>
                <div style={{maxHeight:180,overflowY:"auto",marginBottom:12}}>
                  {ficheOuverte.historique.map((h,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:8,justifyContent:h.sens==="envoye"?"flex-end":"flex-start"}}>
                      {h.sens!=="envoye"&&<div style={{width:24,height:24,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.gold,flexShrink:0}}>{ficheOuverte.nom[0]}</div>}
                      <div style={{maxWidth:"70%"}}>
                        <div style={{background:h.sens==="envoye"?`${C.teal}22`:C.card2,borderRadius:h.sens==="envoye"?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"8px 12px",fontSize:12,color:C.text,border:`1px solid ${h.sens==="envoye"?C.teal:C.border}22`}}>{h.msg}</div>
                        <div style={{fontSize:9,color:C.muted,marginTop:2,textAlign:h.sens==="envoye"?"right":"left"}}>{h.type==="whatsapp"?"💬":h.type==="email"?"📧":"📅"} {h.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Envoyer message */}
                <div style={{display:"flex",gap:8}}>
                  <Inp placeholder="Envoyer un message WhatsApp..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&envoyerMsg()} style={{flex:1}}/>
                  <Btn v="gold" sm onClick={envoyerMsg}>📲 Envoyer</Btn>
                </div>
                <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                  {["Je reviens vers vous","Devis en cours","Rendez-vous confirmé","Merci pour votre confiance"].map((t,i)=>(
                    <button key={i} onClick={()=>setNewMsg(t)} style={{padding:"3px 8px",border:`1px solid ${C.border}`,borderRadius:20,background:C.card2,color:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{t}</button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE PRINCIPALE ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <STitle sub="Meilleur CRM du monde · IA · Pipeline · Analytics">◎ CRM Clients</STitle>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={()=>showToast("📥 Export CSV téléchargé")}>📥 Export CSV</Btn>
          <Btn v="gold" onClick={()=>setModal("creer")}>+ Nouveau client</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Total clients" val={clients.length} color={C.blue}/>
        <KPI label="VIP & Premium" val={clients.filter(c=>["VIP","Premium"].includes(c.statut)).length} color={C.gold}/>
        <KPI label="CA total" val={fmt(clients.reduce((s,c)=>s+c.ca_total,0),"EUR")} color={C.green}/>
        <KPI label="LTV totale" val={fmt(clients.reduce((s,c)=>s+c.ltv,0),"EUR")} color={C.purple}/>
        <KPI label="Risque élevé" val={clients.filter(c=>c.risque==="Élevé").length} color={C.red}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── CLIENTS ── */}
      {tab==="clients"&&(
        <div>
          {/* Filtres */}
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <Inp placeholder="🔍 Rechercher un client..." value={recherche} onChange={e=>setRecherche(e.target.value)} style={{width:200}}/>
            <div style={{display:"flex",gap:5}}>
              {["tous",...STATUTS].map(s=>(
                <button key={s} onClick={()=>setFiltreStatut(s)} style={{padding:"4px 10px",border:`1px solid ${filtreStatut===s?STATUT_COLORS[s]||C.gold:C.border}`,borderRadius:20,background:filtreStatut===s?`${STATUT_COLORS[s]||C.gold}22`:C.card2,color:filtreStatut===s?STATUT_COLORS[s]||C.gold:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>
                  {s==="tous"?"Tous":s}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:5}}>
              {["tous",...SERVICES].map(s=>(
                <button key={s} onClick={()=>setFiltreService(s)} style={{padding:"4px 10px",border:`1px solid ${filtreService===s?C.blue:C.border}`,borderRadius:20,background:filtreService===s?`${C.blue}22`:C.card2,color:filtreService===s?C.blue:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>
                  {s==="tous"?"Tous services":s}
                </button>
              ))}
            </div>
          </div>

          {/* Grille clients */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
            {clientsFiltres.map((c,i)=>(
              <div key={i} onClick={()=>setFicheOuverte(c)} style={{background:C.card,border:`1px solid ${STATUT_COLORS[c.statut]||C.gold}33`,borderRadius:10,padding:14,cursor:"pointer",transition:"all 0.2s",position:"relative"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=STATUT_COLORS[c.statut]||C.gold;e.currentTarget.style.transform="translateY(-1px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${STATUT_COLORS[c.statut]||C.gold}33`;e.currentTarget.style.transform="translateY(0)";}}
              >
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`${STATUT_COLORS[c.statut]||C.gold}22`,border:`1px solid ${STATUT_COLORS[c.statut]||C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:STATUT_COLORS[c.statut]||C.gold}}>{c.nom[0]}</div>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:C.text}}>{c.nom}</div>
                      {c.societe&&<div style={{fontSize:10,color:C.muted}}>{c.societe}</div>}
                    </div>
                  </div>
                  <Pill label={c.statut} color={STATUT_COLORS[c.statut]||C.gold}/>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                  {c.service&&<Pill label={c.service} color={C.blue}/>}
                  <Pill label={c.pays} color={C.teal}/>
                  {c.risque==="Élevé"&&<Pill label="⚠️ Risque" color={C.red}/>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <div style={{background:C.card2,borderRadius:6,padding:"6px 8px"}}>
                    <div style={{fontSize:9,color:C.muted}}>CA total</div>
                    <div style={{fontSize:13,fontWeight:700,color:C.green}}>{fmt(c.ca_total,"EUR")}</div>
                  </div>
                  <div style={{background:C.card2,borderRadius:6,padding:"6px 8px"}}>
                    <div style={{fontSize:9,color:C.muted}}>Score IA</div>
                    <div style={{fontSize:13,fontWeight:700,color:c.score_ia>70?C.green:c.score_ia>40?C.gold:C.red}}>{c.score_ia}/100</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,fontSize:10,color:C.muted}}>
                  <span>{c.derniere_interaction}</span>
                  <span style={{color:C.gold}}>Voir fiche →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Top VIP */}
          <Card>
            <CT>👑 Top clients VIP — Classement par LTV</CT>
            <TH heads={["Client","Service","CA Total","LTV","NPS","Score IA","Risque","Actions"]} rows={[...clients].sort((a,b)=>b.ltv-a.ltv).slice(0,5).map((c,i)=>(
              <tr key={i}>
                <Td><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{color:C.gold,fontSize:12}}>#{i+1}</span><div><div style={{fontWeight:600}}>{c.nom}</div><div style={{fontSize:10,color:C.muted}}>{c.pays}</div></div></div></Td>
                <Td><Pill label={c.service||"—"} color={C.blue}/></Td>
                <Td><span style={{fontWeight:700,color:C.green}}>{fmt(c.ca_total,"EUR")}</span></Td>
                <Td><span style={{fontWeight:700,color:C.purple}}>{fmt(c.ltv,"EUR")}</span></Td>
                <Td><span style={{color:c.nps>=4?C.green:C.orange}}>{"★".repeat(c.nps)}</span></Td>
                <Td><div style={{height:4,width:60,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${c.score_ia}%`,background:c.score_ia>70?C.green:C.gold,borderRadius:2}}/></div></Td>
                <Td><Pill label={c.risque} color={c.risque==="Faible"?C.green:c.risque==="Moyen"?C.orange:C.red}/></Td>
                <Td><div style={{display:"flex",gap:5}}>
                  <Btn sm v="ghost" onClick={()=>setFicheOuverte(c)}>👁</Btn>
                  <Btn sm v="ghost" onClick={()=>showToast(`📲 Message envoyé à ${c.nom}`)}>💬</Btn>
                  <Btn sm v="red" onClick={()=>supprimerClient(c.id)}>🗑</Btn>
                </div></Td>
              </tr>
            ))}/>
          </Card>
        </div>
      )}

      {/* ── PIPELINE ── */}
      {tab==="pipeline"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{display:"flex",gap:10}}>
              <KPI label="Pipeline total" val={fmt(leads.reduce((s,l)=>s+l.ca_potentiel,0),"EUR")} color={C.gold}/>
              <KPI label="Taux conversion" val="22%" color={C.green}/>
              <KPI label="Deals actifs" val={leads.filter(l=>!["Gagné","Perdu"].includes(l.etape)).length} color={C.blue}/>
            </div>
            <Btn v="gold" onClick={()=>showToast("+ Nouvelle opportunité créée")}>+ Opportunité</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,overflowX:"auto"}}>
            {ETAPES.map(e=>{
              const etapeLeads=leads.filter(l=>l.etape===e);
              const valeur=etapeLeads.reduce((s,l)=>s+l.ca_potentiel,0);
              const c=ETAPE_COLORS[e]||C.muted;
              return(
                <div key={e}>
                  <div style={{fontSize:9,color:c,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,borderBottom:`2px solid ${c}`,paddingBottom:6}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span>{e}</span>
                      <span style={{background:`${c}22`,borderRadius:10,padding:"0 5px"}}>{etapeLeads.length}</span>
                    </div>
                    <div style={{fontSize:10,color:C.muted,marginTop:3}}>{fmt(valeur,"EUR")}</div>
                  </div>
                  {etapeLeads.map((l,i)=>(
                    <div key={i} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:10,marginBottom:8,borderLeft:`3px solid ${c}`,cursor:"pointer",transition:"all 0.15s"}}
                      onMouseEnter={e2=>e2.currentTarget.style.borderColor=c}
                      onMouseLeave={e2=>e2.currentTarget.style.borderColor=C.border}
                    >
                      <div style={{fontWeight:600,fontSize:11,marginBottom:2}}>{l.nom}</div>
                      <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{l.contact}</div>
                      <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:4}}>{fmt(l.ca_potentiel,"EUR")}</div>
                      <div style={{height:3,borderRadius:2,background:C.border,marginBottom:6}}><div style={{height:"100%",width:`${l.score}%`,background:l.score>=80?C.green:C.gold,borderRadius:2}}/></div>
                      <div style={{display:"flex",gap:4}}>
                        <Btn sm v="ghost" onClick={()=>showToast("💬 WA envoyé")}>💬</Btn>
                        <Btn sm v="ghost" onClick={()=>setLeads(p=>p.map(x=>x.id===l.id?{...x,etape:ETAPES[Math.min(ETAPES.indexOf(e)+1,4)]}:x))}>→</Btn>
                      </div>
                    </div>
                  ))}
                  {etapeLeads.length===0&&<div style={{fontSize:10,color:C.muted,textAlign:"center",padding:"12px 0",border:`1px dashed ${C.border}`,borderRadius:6}}>Vide</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {tab==="analytics"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            <KPI label="LTV moyenne" val={fmt(Math.round(clients.reduce((s,c)=>s+c.ltv,0)/clients.length),"EUR")} color={C.purple}/>
            <KPI label="Panier moyen" val={fmt(Math.round(clients.reduce((s,c)=>s+c.panier_moyen,0)/clients.length),"EUR")} color={C.blue}/>
            <KPI label="NPS moyen" val={`${(clients.reduce((s,c)=>s+c.nps,0)/clients.length).toFixed(1)}/5`} color={C.green}/>
            <KPI label="Score IA moyen" val={`${Math.round(clients.reduce((s,c)=>s+c.score_ia,0)/clients.length)}/100`} color={C.gold}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <Card>
              <CT>💰 CA par client</CT>
              {[...clients].sort((a,b)=>b.ca_total-a.ca_total).map((c,i)=>(
                <div key={i} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                    <span style={{color:C.text}}>{c.nom}</span>
                    <span style={{fontWeight:700,color:C.green}}>{fmt(c.ca_total,"EUR")}</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:C.border}}>
                    <div style={{height:"100%",width:`${(c.ca_total/clients[0].ca_total)*100}%`,background:STATUT_COLORS[c.statut]||C.green,borderRadius:2}}/>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <CT>🌍 Clients par pays</CT>
              {Object.entries(clients.reduce((acc,c)=>{acc[c.pays]=(acc[c.pays]||0)+1;return acc;},{})).map(([pays,nb],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{pays}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <div style={{height:4,width:60,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${(nb/clients.length)*100}%`,background:C.teal,borderRadius:2}}/></div>
                    <span style={{fontWeight:600,color:C.teal}}>{nb}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>📊 Répartition par statut</CT>
              {STATUTS.map((s,i)=>{
                const nb=clients.filter(c=>c.statut===s).length;
                const c=STATUT_COLORS[s]||C.muted;
                return nb>0?(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:8,height:8,borderRadius:"50%",background:c}}/><span style={{color:C.muted}}>{s}</span></div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{height:4,width:60,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${(nb/clients.length)*100}%`,background:c,borderRadius:2}}/></div>
                      <span style={{fontWeight:600,color:c}}>{nb}</span>
                    </div>
                  </div>
                ):null;
              })}
            </Card>
            <Card>
              <CT>⚠️ Clients à risque</CT>
              {clients.filter(c=>c.risque!=="Faible").map((c,i)=>(
                <div key={i} style={{background:c.risque==="Élevé"?`${C.red}08`:`${C.orange}08`,border:`1px solid ${c.risque==="Élevé"?C.red:C.orange}33`,borderRadius:8,padding:10,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:12}}>{c.nom}</span>
                    <Pill label={c.risque} color={c.risque==="Élevé"?C.red:C.orange}/>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:6}}>Dernière interaction : {c.derniere_interaction}</div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn sm v="ghost" onClick={()=>showToast(`📲 Relance envoyée à ${c.nom}`)}>📲 Relancer</Btn>
                    <Btn sm v="ghost" onClick={()=>setFicheOuverte(c)}>👁 Fiche</Btn>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── AUTOMATISATIONS ── */}
      {tab==="automatisations"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
            <CT>⚡ Automatisations CRM actives</CT>
            {[
              {ico:"💤",trigger:"Client inactif depuis 30 jours",action:"Relance automatique WhatsApp",statut:true,nb:2},
              {ico:"📋",trigger:"Devis non répondu après 48h",action:"Rappel automatique + notif Curtiss",statut:true,nb:1},
              {ico:"⭐",trigger:"NPS < 3",action:"Alerte urgente Curtiss + appel",statut:true,nb:0},
              {ico:"👑",trigger:"CA client > 5 000€",action:"Tag VIP automatique",statut:true,nb:3},
              {ico:"🎂",trigger:"Anniversaire client",action:"Message personnalisé WhatsApp",statut:false,nb:0},
              {ico:"💰",trigger:"Paiement reçu",action:"Remerciement auto + demande avis",statut:true,nb:12},
            ].map((a,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:a.statut?`${C.purple}08`:C.card2,borderRadius:8,padding:"10px 14px",marginBottom:8,border:`1px solid ${a.statut?C.purple+"33":C.border}`}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontSize:18}}>{a.ico}</span>
                  <div>
                    <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Si : {a.trigger}</div>
                    <div style={{fontSize:12,fontWeight:500,color:C.text}}>Alors : {a.action}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                  {a.nb>0&&<span style={{fontSize:10,color:C.gold}}>{a.nb}x déclenché</span>}
                  <Pill label={a.statut?"✓ Actif":"○ Inactif"} color={a.statut?C.green:C.muted}/>
                </div>
              </div>
            ))}
            <Btn v="gold" onClick={()=>showToast("+ Nouvelle automatisation créée")}>+ Ajouter une automatisation</Btn>
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{borderColor:`${C.teal}44`}}>
              <CT>📝 Modèles de messages</CT>
              {[{l:"Relance prospect",preview:"Bonjour [Nom], je reviens vers vous..."},
                {l:"Confirmation RDV",preview:"Votre RDV est confirmé pour..."},
                {l:"Devis envoyé",preview:"Veuillez trouver ci-joint votre devis..."},
                {l:"Remerciement",preview:"Merci pour votre confiance..."},
                {l:"Demande d'avis",preview:"Votre avis compte pour nous..."},
              ].map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                  <div><div style={{fontWeight:500,color:C.text}}>{m.l}</div><div style={{color:C.muted,fontSize:10}}>{m.preview}</div></div>
                  <div style={{display:"flex",gap:5}}>
                    <Btn sm v="ghost" onClick={()=>showToast("✏️ Modèle modifié")}>✏️</Btn>
                    <Btn sm v="ghost" onClick={()=>showToast("📲 Envoyé")}>📲</Btn>
                  </div>
                </div>
              ))}
              <div style={{marginTop:8}}><Btn v="ghost" full onClick={()=>showToast("+ Nouveau modèle créé")}>+ Nouveau modèle</Btn></div>
            </Card>
            <Card>
              <CT>📊 Performance automatisations</CT>
              {[{l:"Taux d'ouverture WA",v:"94%",c:C.green},{l:"Taux de réponse",v:"67%",c:C.blue},{l:"Conversions générées",v:"8",c:C.gold},{l:"CA généré auto",v:"12 400€",c:C.purple},{l:"Temps économisé",v:"14h/mois",c:C.teal}].map(([l,v,c],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{l}</span>
                  <span style={{fontWeight:700,color:c}}>{v}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const PageDevis=({devis,setDevis})=>{
  const [f,setF]=useState("tous");
  const [modal,setModal]=useState(null); // null | "creer" | "modifier" | "apercu"
  const [selected,setSelected]=useState(null);
  const [toast,setToast]=useState(null);
  const now=new Date();
  const dateAujourdHui=`${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getFullYear()}`;
  const dateValidite=()=>{const d=new Date();d.setDate(d.getDate()+30);return`${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;};
  const newDevisTemplate=()=>({
    id:`DEV-${now.getFullYear()}-${String(devis.length+1).padStart(3,"0")}`,
    // Société
    societe:"Tymeless",siret:"",logo:"",adresse:"",
    // Client
    client:"",tel:"",email:"",
    // Devis
    service:"",date:dateAujourdHui,validite:dateValidite(),
    devise:"EUR",tva:20,remise:0,remise_type:"pct",
    conditions_paiement:"Acompte 30% · Solde à la livraison",
    notes:"",statut:"en_attente",
    // Lignes
    lignes:[{desc:"",qte:1,pu:0}],
    // Suivi
    notes_internes:"",rappel:true,
  });
  const [form,setForm]=useState(newDevisTemplate());
  const setF2=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};

  const calcSousTotal=lignes=>lignes.reduce((s,l)=>s+(l.qte*l.pu),0);
  const calcRemise=(st,form)=>form.remise_type==="pct"?st*(form.remise/100):Number(form.remise);
  const calcTTC=(form)=>{const st=calcSousTotal(form.lignes);const r=calcRemise(st,form);const ht=st-r;return ht*(1+form.tva/100);};

  const filtered=f==="tous"?devis:devis.filter(d=>d.statut===f);
  const taux=devis.length>0?Math.round((devis.filter(d=>d.statut==="validé").length/devis.length)*100):0;

  const ouvrirCreer=()=>{setForm(newDevisTemplate());setModal("creer");};
  const ouvrirModifier=d=>{setSelected(d);setForm({...d});setModal("modifier");};
  const ouvrirApercu=d=>{setSelected(d);setModal("apercu");};

  const sauvegarder=()=>{
    if(!form.client||!form.lignes[0].desc){showToast("Remplis au moins le nom du client et une ligne","#EF4444");return;}
    const montant=Math.round(calcTTC(form));
    if(modal==="creer"){setDevis(p=>[{...form,montant},...p]);}
    else{setDevis(p=>p.map(x=>x.id===form.id?{...form,montant}:x));}
    setModal(null);
    showToast(modal==="creer"?"✓ Devis créé avec succès !":"✓ Devis modifié avec succès !");
  };

  const supprimer=id=>{setDevis(p=>p.filter(x=>x.id!==id));showToast("Devis supprimé","#EF4444");};
  const transformer=d=>{setDevis(p=>p.map(x=>x.id===d.id?{...x,statut:"facture"}:x));showToast("✓ Transformé en facture !");};

  const LigneForm=({l,i})=>(
    <div style={{display:"grid",gridTemplateColumns:"3fr 1fr 1fr auto",gap:8,marginBottom:7,alignItems:"center"}}>
      <Inp placeholder="Description du service..." value={l.desc} onChange={e=>setForm(p=>({...p,lignes:p.lignes.map((x,j)=>j===i?{...x,desc:e.target.value}:x)}))} style={{width:"100%"}}/>
      <Inp type="number" placeholder="Qté" value={l.qte} onChange={e=>setForm(p=>({...p,lignes:p.lignes.map((x,j)=>j===i?{...x,qte:Number(e.target.value)}:x)}))} style={{width:"100%"}}/>
      <Inp type="number" placeholder="Prix unitaire" value={l.pu} onChange={e=>setForm(p=>({...p,lignes:p.lignes.map((x,j)=>j===i?{...x,pu:Number(e.target.value)}:x)}))} style={{width:"100%"}}/>
      <button onClick={()=>setForm(p=>({...p,lignes:p.lignes.filter((_,j)=>j!==i)}))} style={{background:C.red+"22",border:`1px solid ${C.red}44`,borderRadius:6,padding:"4px 8px",cursor:"pointer",color:C.red,fontFamily:"inherit",fontSize:12}}>✕</button>
    </div>
  );

  const st=calcSousTotal(form.lignes);
  const remise=calcRemise(st,form);
  const ht=st-remise;
  const tvaM=ht*(form.tva/100);
  const ttc=ht+tvaM;

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px #00000066"}}>{toast.msg}</div>}

      {/* ── MODAL CRÉER / MODIFIER ── */}
      {(modal==="creer"||modal==="modifier")&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:2000,overflowY:"auto",padding:"20px 16px"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:28,width:700,maxWidth:"100%"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700}}>{modal==="creer"?"+ Créer un devis":"✏️ Modifier le devis"}</div>
              <div style={{fontSize:12,color:C.gold,fontFamily:"monospace"}}>{form.id}</div>
            </div>

            {/* INFOS SOCIÉTÉ */}
            <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.gold,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>🏢 Votre société</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[["Nom de la société","societe","text","Tymeless"],["Numéro SIRET","siret","text","123 456 789 00012"],["Adresse postale","adresse","text","15 rue de la Paix, 75001 Paris"],["Logo URL (optionnel)","logo","text","https://..."]].map(([l,k,t,ph])=>(
                  <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={form[k]} onChange={setF2(k)} style={{width:"100%"}}/></div>
                ))}
              </div>
            </div>

            {/* INFOS CLIENT */}
            <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.blue,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>👤 Client</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {[["Nom complet *","client","text","Sofia Riad"],["Téléphone / WhatsApp","tel","text","+33 6 12 34 56 78"],["Email","email","email","sofia@exemple.fr"]].map(([l,k,t,ph])=>(
                  <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={form[k]} onChange={setF2(k)} style={{width:"100%"}}/></div>
                ))}
              </div>
            </div>

            {/* PARAMÈTRES DEVIS */}
            <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.purple,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>⚙️ Paramètres</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Service</div><Inp placeholder="Nettoyage Airbnb" value={form.service} onChange={setF2("service")} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Devise</div><Sel value={form.devise} onChange={setF2("devise")} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>TVA (%)</div><Sel value={form.tva} onChange={e=>setForm(p=>({...p,tva:Number(e.target.value)}))} options={[{v:20,l:"20%"},{v:10,l:"10%"},{v:5.5,l:"5.5%"},{v:0,l:"0%"}]} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Validité</div><Inp value={form.validite} onChange={setF2("validite")} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Remise</div><Inp type="number" placeholder="0" value={form.remise} onChange={e=>setForm(p=>({...p,remise:Number(e.target.value)}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Type remise</div><Sel value={form.remise_type} onChange={setF2("remise_type")} options={[{v:"pct",l:"Pourcentage %"},{v:"eur",l:"Montant fixe €"}]} style={{width:"100%"}}/></div>
                <div style={{gridColumn:"span 2"}}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Conditions de paiement</div><Inp placeholder="Acompte 30%..." value={form.conditions_paiement} onChange={setF2("conditions_paiement")} style={{width:"100%"}}/></div>
              </div>
            </div>

            {/* LIGNES */}
            <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.teal,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>📝 Lignes du devis</div>
              <div style={{display:"grid",gridTemplateColumns:"3fr 1fr 1fr auto",gap:8,marginBottom:6}}>
                {["Description","Qté","Prix unitaire",""].map((h,i)=><div key={i} style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</div>)}
              </div>
              {form.lignes.map((l,i)=><LigneForm key={i} l={l} i={i}/>)}
              <button onClick={()=>setForm(p=>({...p,lignes:[...p.lignes,{desc:"",qte:1,pu:0}]}))} style={{background:C.teal+"22",border:`1px dashed ${C.teal}44`,borderRadius:7,padding:"7px 14px",cursor:"pointer",color:C.teal,fontFamily:"inherit",fontSize:12,fontWeight:600,marginTop:4}}>+ Ajouter une ligne</button>
            </div>

            {/* TOTAUX */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Notes / Conditions</div><textarea value={form.notes} onChange={setF2("notes")} placeholder="Merci de votre confiance..." style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontFamily:"inherit",fontSize:12,minHeight:70,resize:"vertical"}}/></div>
              <div style={{background:C.card2,borderRadius:10,padding:12,border:`1px solid ${C.gold}33`}}>
                <div style={{fontSize:11,fontWeight:600,color:C.gold,marginBottom:8}}>Total</div>
                {[["Sous-total HT",fmt(st,form.devise)],[`Remise ${form.remise_type==="pct"?form.remise+"%":fmt(remise,form.devise)}`,`-${fmt(remise,form.devise)}`],[`TVA ${form.tva}%`,fmt(tvaM,form.devise)]].map(([l,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",color:C.muted}}><span>{l}</span><span>{v}</span></div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700,color:C.gold,borderTop:`1px solid ${C.border}`,paddingTop:7,marginTop:7}}><span>TOTAL TTC</span><span>{fmt(ttc,form.devise)}</span></div>
              </div>
            </div>

            {/* SCORE SOLVABILITÉ CLIENT */}
            {form.client&&(
              <div style={{background:C.card2,border:`1px solid ${C.teal}44`,borderRadius:10,padding:14,marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:600,color:C.teal,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>🔍 Vérifier la solvabilité du client avant validation</div>
                <SolvabiliteWidget nom={form.client} siret={form.siret} contexte="devis"/>
              </div>
            )}

            {/* ACTIONS */}
            <div style={{display:"flex",gap:10}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="blue" full onClick={()=>{sauvegarder();showToast("📲 Envoyé sur WhatsApp + Email !");setModal(null);}}>📲 Enregistrer & Envoyer</Btn>
              <Btn v="gold" full onClick={sauvegarder}>✓ Enregistrer</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL APERÇU ── */}
      {modal==="apercu"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:"#fff",color:"#111",borderRadius:14,padding:32,width:600,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px #00000088"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <div style={{fontSize:22,fontWeight:700,color:"#C9A84C",letterSpacing:"0.08em"}}>{selected.societe||"TYMELESS"}</div>
                {selected.siret&&<div style={{fontSize:11,color:"#666"}}>SIRET : {selected.siret}</div>}
                {selected.adresse&&<div style={{fontSize:11,color:"#666"}}>{selected.adresse}</div>}
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:18,fontWeight:700}}>DEVIS</div>
                <div style={{fontSize:13,color:"#C9A84C",fontFamily:"monospace"}}>{selected.id}</div>
                <div style={{fontSize:11,color:"#666"}}>Émis le {selected.date}</div>
                <div style={{fontSize:11,color:"#666"}}>Valable jusqu'au {selected.validite}</div>
              </div>
            </div>
            <div style={{background:"#f5f5f5",borderRadius:8,padding:12,marginBottom:16}}>
              <div style={{fontSize:11,color:"#666",marginBottom:4}}>CLIENT</div>
              <div style={{fontWeight:700}}>{selected.client}</div>
              {selected.tel&&<div style={{fontSize:12,color:"#666"}}>{selected.tel}</div>}
              {selected.email&&<div style={{fontSize:12,color:"#666"}}>{selected.email}</div>}
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
              <thead><tr style={{background:"#f5f5f5"}}>{["Description","Qté","Prix unit.","Total"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:11,color:"#666",fontWeight:600}}>{h}</th>)}</tr></thead>
              <tbody>{(selected.lignes||[]).map((l,i)=>(
                <tr key={i} style={{borderBottom:"1px solid #eee"}}>
                  <td style={{padding:"8px 10px",fontSize:12}}>{l.desc}</td>
                  <td style={{padding:"8px 10px",fontSize:12,textAlign:"center"}}>{l.qte}</td>
                  <td style={{padding:"8px 10px",fontSize:12}}>{fmt(l.pu,selected.devise)}</td>
                  <td style={{padding:"8px 10px",fontSize:12,fontWeight:600}}>{fmt(l.qte*l.pu,selected.devise)}</td>
                </tr>
              ))}</tbody>
            </table>
            <div style={{textAlign:"right",marginBottom:16}}>
              {[["Sous-total HT",fmt(calcSousTotal(selected.lignes||[]),selected.devise)],[`TVA ${selected.tva||20}%`,fmt(calcSousTotal(selected.lignes||[])*(selected.tva||20)/100,selected.devise)],["TOTAL TTC",fmt(selected.montant||0,selected.devise)]].map(([l,v],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"flex-end",gap:20,fontSize:i===2?15:12,fontWeight:i===2?700:400,color:i===2?"#C9A84C":"#333",padding:"3px 0"}}><span>{l}</span><span style={{minWidth:80,textAlign:"right"}}>{v}</span></div>
              ))}
            </div>
            {selected.conditions_paiement&&<div style={{fontSize:11,color:"#666",borderTop:"1px solid #eee",paddingTop:10,marginBottom:16}}>Conditions : {selected.conditions_paiement}</div>}
            {selected.notes&&<div style={{fontSize:11,color:"#666",marginBottom:16}}>{selected.notes}</div>}
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setModal(null)} style={{background:"#f5f5f5",border:"1px solid #ddd",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Fermer</button>
              <button onClick={()=>{showToast("📲 Devis envoyé sur WhatsApp + Email !");setModal(null);}} style={{background:"#C9A84C",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",color:"#000"}}>📲 Envoyer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE PRINCIPALE ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <STitle sub="Créer · Modifier · Envoyer · Suivre">◧ Devis</STitle>
        <Btn v="gold" onClick={ouvrirCreer}>+ Créer un devis</Btn>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Total devis" val={devis.length} color={C.blue}/>
        <KPI label="En attente" val={devis.filter(d=>d.statut==="en_attente").length} color={C.orange}/>
        <KPI label="Validés" val={devis.filter(d=>d.statut==="validé").length} color={C.green}/>
        <KPI label="Taux conversion" val={`${taux}%`} color={taux>50?C.green:C.orange}/>
      </div>

      <Tabs tabs={["tous","en_attente","validé","refusé"].map(x=>({id:x,label:x==="tous"?"Tous ✦":x==="en_attente"?"En attente":x==="validé"?"Validés":"Refusés"}))} active={f} onChange={setF}/>

      {filtered.length===0?(
        <Card>
          <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}>
            <div style={{fontSize:32,marginBottom:10}}>📋</div>
            <div style={{fontSize:14,marginBottom:6}}>Aucun devis pour l'instant</div>
            <div style={{fontSize:12,marginBottom:16}}>Créez votre premier devis en cliquant sur le bouton ci-dessus</div>
            <Btn v="gold" onClick={ouvrirCreer}>+ Créer mon premier devis</Btn>
          </div>
        </Card>
      ):(
        <Card>
          <TH heads={["Référence","Client","Service","Montant","Date","Validité","Statut","Actions"]} rows={filtered.map((d,i)=>(
            <tr key={i} style={{opacity:d.statut==="refusé"?0.5:1}}>
              <Td><span style={{color:C.gold,fontFamily:"monospace",fontSize:11}}>{d.id}</span></Td>
              <Td><div style={{fontWeight:600}}>{d.client}</div><div style={{fontSize:10,color:C.muted}}>{d.tel}</div></Td>
              <Td><span style={{fontSize:11}}>{d.service||"—"}</span></Td>
              <Td><span style={{fontWeight:700,fontSize:13,color:C.gold}}>{(d.montant||0).toLocaleString("fr")} {d.devise||"€"}</span></Td>
              <Td><span style={{fontSize:10,color:C.muted}}>{d.date}</span></Td>
              <Td><span style={{fontSize:10,color:C.muted}}>{d.validite||"—"}</span></Td>
              <Td><St s={d.statut}/></Td>
              <Td>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {d.statut==="en_attente"&&<><Btn sm v="green" onClick={()=>setDevis(p=>p.map(x=>x.id===d.id?{...x,statut:"validé"}:x))}>✓</Btn><Btn sm v="red" onClick={()=>setDevis(p=>p.map(x=>x.id===d.id?{...x,statut:"refusé"}:x))}>✕</Btn></>}
                  <Btn sm v="ghost" onClick={()=>ouvrirApercu(d)}>👁</Btn>
                  <Btn sm v="blue" onClick={()=>ouvrirModifier(d)}>✏️</Btn>
                  {d.statut==="validé"&&<Btn sm v="purple" onClick={()=>transformer(d)}>→ Facture</Btn>}
                  <Btn sm v="ghost" onClick={()=>{showToast("📲 Envoyé sur WhatsApp !");}}>📲</Btn>
                  <Btn sm v="red" onClick={()=>supprimer(d.id)}>🗑</Btn>
                </div>
              </Td>
            </tr>
          ))}/>
        </Card>
      )}
    </div>
  );
};


const PageInvestissement=()=>{
  const [tab,setTab]=useState("recommandations");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};

  // ── DATA ────────────────────────────────────────────────
  const ca=24380;
  const [secteur,setSecteur]=useState("conciergerie");
  const [aiLoading,setAiLoading]=useState(false);
  const [aiAnalyse,setAiAnalyse]=useState(null);
  const [aiSecteurLoading,setAiSecteurLoading]=useState(false);
  const [aiSecteurAnalyse,setAiSecteurAnalyse]=useState(null);
  const [sc,setSc]=useState({collaborateurs:0,services:0,marketing:0,formation:0});
  const impact=sc.collaborateurs*3200+sc.services*2800+sc.marketing*1400+sc.formation*600;
  const invest=sc.collaborateurs*1800+sc.services*500+sc.marketing*800+sc.formation*300;

  const [opportunites,setOpportunites]=useState([
    {id:1,icon:"✈️",titre:"Développer le Rapatriement",secteur:"conciergerie",ca_potentiel:14400,investissement:400,roi:340,risque:"Faible",delai:"1 mois",statut:"en_cours",detail:"75% de marge, seulement 5% du CA. Cibler les ambassades africaines à Paris.",actions:["Contacter les ambassades Sénégal, Mali, CI","Partenariat pompes funèbres spécialisées","Landing page dédiée","Budget marketing 400€/mois"]},
    {id:2,icon:"🛥️",titre:"Activer Monaco Yacht Club",secteur:"conciergerie",ca_potentiel:172800,investissement:0,roi:999,risque:"Faible",delai:"Cette semaine",statut:"en_attente",detail:"Devis envoyé. 8 missions/mois × 1 800€ = 172 800€/an.",actions:["Relancer cette semaine","Visite démo gratuite","Contrat cadre annuel -10%","Abou dédié yacht si signé"]},
    {id:3,icon:"🤝",titre:"Activer réseau B2B",secteur:"conciergerie",ca_potentiel:36000,investissement:0,roi:999,risque:"Moyen",delai:"2 mois",statut:"planifié",detail:"10 mises en relation/mois = +3 000 à 8 000€/mois commissions passives.",actions:["Événement networking","Activer prospection équipe","Objectif 20 membres"]},
    {id:4,icon:"💻",titre:"Déploiement SaaS Afrique",secteur:"tech",ca_potentiel:11000,investissement:0,roi:999,risque:"Moyen",delai:"Q3 2026",statut:"planifié",detail:"Vendre Tymeless OS aux entreprises africaines. Potentiel énorme.",actions:["Cibler Dakar, Abidjan, Douala","Marketing LinkedIn Afrique","Prix adapté marché local"]},
  ]);

  const [modalOpp,setModalOpp]=useState(null);
  const [newOpp,setNewOpp]=useState({titre:"",secteur:"conciergerie",ca_potentiel:"",investissement:"",delai:"",risque:"Faible",detail:"",icon:"💡"});

  const [investissementsRealises,setInvestissementsRealises]=useState([
    {desc:"Formation Thomas — Jet Privé",montant:300,resultat:"+2 800€/mois CA",roi:"x9",date:"Mars 2026",statut:"positif"},
    {desc:"Landing page Tymeless OS",montant:0,resultat:"+3 inscriptions SaaS",roi:"∞",date:"Avril 2026",statut:"positif"},
    {desc:"Matériel nettoyage Yacht",montant:850,resultat:"+4 missions/mois",roi:"x8",date:"Fév. 2026",statut:"positif"},
  ]);

  const SECTEURS=[
    {v:"conciergerie",l:"🏠 Conciergerie / Services",desc:"Airbnb, résidentiel, bureaux, jet privé, yacht"},
    {v:"btp",l:"🔨 BTP / Construction",desc:"Maçonnerie, plomberie, électricité, rénovation"},
    {v:"restaurant",l:"🍽️ Restaurant / Restauration",desc:"Restauration, food delivery, traiteur"},
    {v:"tech",l:"💻 Tech / SaaS",desc:"Logiciels, applications, services numériques"},
    {v:"beaute",l:"💅 Beauté / Esthétique",desc:"Coiffure, esthétique, bien-être"},
    {v:"transport",l:"🚗 Transport / Logistique",desc:"VTC, livraison, déménagement"},
    {v:"formation",l:"🎓 Formation / Coaching",desc:"Formation professionnelle, coaching"},
    {v:"import_export",l:"🌍 Import / Export",desc:"Commerce international, trading"},
  ];

  const RECO_PAR_SECTEUR={
    conciergerie:[
      {icon:"✈️",titre:"Développer le Rapatriement",roi:"ROI +340%",urgence:"haute",couleur:C.green,detail:"75% de marge, seulement 5% du CA. Cibler les ambassades africaines à Paris = +14 400€/an.",actions:["Contacter les ambassades Sénégal, Mali, CI à Paris","Partenariat pompes funèbres spécialisées","Landing page dédiée rapatriement","Budget marketing : 400€/mois"]},
      {icon:"🛥️",titre:"Activer Monaco Yacht Club",roi:"ROI +280%",urgence:"haute",couleur:C.gold,detail:"Devis envoyé. 8 missions/mois × 1 800€ = 172 800€/an. Plus gros levier immédiat.",actions:["Relancer cette semaine","Visite démonstration gratuite","Contrat cadre annuel -10%","Abou dédié yacht si signé"]},
      {icon:"🤝",titre:"Développer réseau B2B",roi:"ROI +180%",urgence:"moyenne",couleur:C.blue,detail:"5 membres annuaire. 10 mises en relation/mois = +3 000 à 8 000€/mois.",actions:["Événement networking mensuel","Activer prospection Thomas & Abou","Objectif 20 membres avant fin mai"]},
    ],
    btp:[
      {icon:"🏗️",titre:"Spécialiser en rénovation haut de gamme",roi:"ROI +250%",urgence:"haute",couleur:C.gold,detail:"La rénovation premium = marges 2x supérieures au BTP standard. Clientèle Paris intramuros.",actions:["Former équipe finitions haut de gamme","Cibler architectes d'intérieur","Portfolio photos avant/après","Prix minimum 3x marché standard"]},
      {icon:"🌿",titre:"Lancer offre éco-construction",roi:"ROI +180%",urgence:"haute",couleur:C.green,detail:"Tendance forte. Subventions disponibles = argument commercial puissant.",actions:["Obtenir certification RGE","Partenariat fournisseurs matériaux bio","Communication réseaux sociaux","Cible : maisons individuelles"]},
      {icon:"📱",titre:"Application devis instantané",roi:"ROI +120%",urgence:"moyenne",couleur:C.blue,detail:"Les clients veulent des devis en 5 min. Ceux qui répondent vite gagnent 70% des chantiers.",actions:["Tymeless OS devis en 30 secondes","Répondre dans l'heure","Suivi automatique WhatsApp","Objectif : 90% de devis envoyés sous 2h"]},
    ],
    restaurant:[
      {icon:"🚀",titre:"Lancer le service livraison premium",roi:"ROI +300%",urgence:"haute",couleur:C.gold,detail:"Uber Eats, Deliveroo prennent 30%. Livraison en propre = marge x2.",actions:["Recrutement livreur dédié","Zone de livraison 5km autour","Commande minimum 40€","Packaging premium différenciant"]},
      {icon:"🎉",titre:"Offre traiteur événements",roi:"ROI +220%",urgence:"haute",couleur:C.green,detail:"Mariages, anniversaires, séminaires = 3x le CA d'un couvert classique.",actions:["Menu traiteur dédié","Partenariat salles événementielles","Photos portfolio professionnel","Tarif forfait tout inclus"]},
      {icon:"☕",titre:"Vente produits dérivés",roi:"ROI +80%",urgence:"moyenne",couleur:C.blue,detail:"Sauces maison, condiments = vente en boutique et en ligne. Revenus passifs.",actions:["Tester 3 produits signature","Étiquetage professionnel","Vente sur place + Amazon","Marge 70% sur produits dérivés"]},
    ],
    tech:[
      {icon:"🌍",titre:"Expansion Afrique francophone",roi:"ROI +400%",urgence:"haute",couleur:C.gold,detail:"Dakar, Abidjan, Douala = marché SaaS en explosion. Concurrence faible.",actions:["Version française adaptée Afrique","Prix en XOF et CFA","Partenaires locaux revendeurs","Marketing LinkedIn Afrique"]},
      {icon:"🤖",titre:"Intégrer plus d'IA",roi:"ROI +200%",urgence:"haute",couleur:C.purple,detail:"Les clients paient 3x plus pour des outils avec IA visible. Argument de vente n°1.",actions:["Ajouter Claude IA dans tous les modules","Rapport IA hebdomadaire","Score IA visible partout","Démo IA impressionnante"]},
      {icon:"🔗",titre:"Programme de partenaires revendeurs",roi:"ROI +150%",urgence:"moyenne",couleur:C.teal,detail:"100 revendeurs × 3 clients = 300 nouveaux clients sans effort commercial.",actions:["Créer programme partenaire","Commission 20% sur abonnements","Matériel marketing clé en main","Formation revendeurs en ligne"]},
    ],
    beaute:[
      {icon:"💆",titre:"Lancer offre spa & bien-être",roi:"ROI +280%",urgence:"haute",couleur:C.purple,detail:"La clientèle beauté cherche l'expérience complète. Massages = marge 80%.",actions:["Former 1 praticienne massage","Espace détente dédié","Forfaits soin + massage","Partenariat hôtels wellness"]},
      {icon:"📦",titre:"Vente produits capillaires en ligne",roi:"ROI +180%",urgence:"haute",couleur:C.gold,detail:"Instagram + boutique en ligne = revenus passifs 24h/24.",actions:["Sélectionner 10 produits signature","Boutique Shopify ou Tymeless OS","Contenu Instagram produits","Livraison sous 48h"]},
      {icon:"🎓",titre:"Formations professionnelles",roi:"ROI +150%",urgence:"moyenne",couleur:C.blue,detail:"Former d'autres coiffeurs/esthéticiennes = revenus passifs à forte marge.",actions:["Créer programme formation 2 jours","Tarif 500€ par stagiaire","Certification reconnue","Groupe WhatsApp alumni"]},
    ],
    transport:[
      {icon:"💎",titre:"Spécialiser en VTC luxe",roi:"ROI +320%",urgence:"haute",couleur:C.gold,detail:"Classe S, Classe V, Tesla = tarif 3x supérieur. Clientèle fidèle.",actions:["Acquérir 1 véhicule premium","Partenariat hôtels 4-5 étoiles","Tenue dress code obligatoire","Réservation WhatsApp en avance"]},
      {icon:"🏢",titre:"Contrats entreprises B2B",roi:"ROI +220%",urgence:"haute",couleur:C.blue,detail:"1 contrat entreprise = 50 courses/mois garanties. Stabilité du CA.",actions:["Démarcher DRH grandes entreprises","Tarif mensuel forfaitaire","Facturation mensuelle automatique","Priorité sur les créneaux"]},
      {icon:"🛫",titre:"Navettes aéroport premium",roi:"ROI +180%",urgence:"moyenne",couleur:C.teal,detail:"Aéroport CDG/Orly = demande constante. Service 24h/24 = premium.",actions:["Présence plateformes réservation","Partenariat agences voyage","Accueil avec pancarte nominative","Eau et chargeurs offerts"]},
    ],
    formation:[
      {icon:"💻",titre:"Créer formations en ligne",roi:"ROI +500%",urgence:"haute",couleur:C.gold,detail:"1 formation créée = revendue indéfiniment. Marge 95%.",actions:["Enregistrer 5 modules vidéo","Plateforme Teachable ou Tymeless","Prix 297€ par formation","Marketing email + LinkedIn"]},
      {icon:"🏢",titre:"Contrats entreprises intra",roi:"ROI +280%",urgence:"haute",couleur:C.blue,detail:"Formation en entreprise = tarif journée 1500-3000€. Clients fidèles.",actions:["Démarcher DRH entreprises","Catalogue formations certifiantes","OPCO prise en charge 100%","Attestations de formation"]},
      {icon:"🌍",titre:"Expansion internationale",roi:"ROI +200%",urgence:"moyenne",couleur:C.green,detail:"Afrique francophone = demande forte en formation professionnelle.",actions:["Traduire contenus en anglais","Partenariat organismes Afrique","Prix adaptés marchés locaux","Certification internationale"]},
    ],
    import_export:[
      {icon:"🌍",titre:"Développer Afrique francophone",roi:"ROI +400%",urgence:"haute",couleur:C.gold,detail:"Dakar, Abidjan, Douala = marchés en forte croissance. Peu de concurrence sérieuse.",actions:["Identifier fournisseurs locaux fiables","Ouvrir compte bancaire local","Partenaire logistique dédié","Veille réglementaire douanière"]},
      {icon:"🤝",titre:"Sourcing Asie direct",roi:"ROI +300%",urgence:"haute",couleur:C.blue,detail:"Éliminer les intermédiaires = marge x3. Alibaba Gold Supplier.",actions:["Visite foire Canton ou Canton Fair","Contrats directs fabricants","Contrôle qualité tiers","Import en container groupé"]},
      {icon:"💻",titre:"Marketplace B2B en ligne",roi:"ROI +180%",urgence:"moyenne",couleur:C.teal,detail:"Plateforme mise en relation acheteurs/vendeurs = commission 5% sur chaque transaction.",actions:["Développer avec Tymeless OS","Cibler 50 vendeurs premium","Marketing LinkedIn B2B","Commission automatique Flutterwave"]},
    ],
  };

  // ── ANALYSE IA CLAUDE ────────────────────────────────────
  const analyserAvecIA=async()=>{
    setAiLoading(true);
    try{
      const s=SECTEURS.find(x=>x.v===secteur);
      const prompt=`Tu es un expert en stratégie d'entreprise et investissement. Analyse cette entreprise et propose des recommandations d'investissement prioritaires.

Profil entreprise :
- Secteur : ${s?.l} — ${s?.desc}
- CA mensuel actuel : ${ca.toLocaleString("fr")}€
- Marge nette : 61%
- Équipe : 3 collaborateurs (Thomas, Abou, Fatou)
- Services actuels : Airbnb, résidentiel, bureaux, jet privé, yacht, rapatriement
- Points forts : conciergerie premium, Flutterwave/Stripe, dashboard IA

Génère 3 recommandations d'investissement TRÈS CONCRÈTES et CHIFFRÉES pour ce profil. Pour chaque recommandation :
1. Un titre court et percutant
2. Le CA potentiel généré (chiffre précis)
3. L'investissement requis (ou 0€)
4. Le ROI estimé en %
5. Une action immédiate à faire cette semaine

Réponds en JSON valide uniquement, format : {"recommandations":[{"titre":"...","ca_potentiel":"...","investissement":"...","roi":"...","action_immediate":"...","detail":"..."}]}`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const txt=data.content?.[0]?.text||"{}";
      const clean=txt.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      setAiAnalyse(parsed.recommandations||[]);
    }catch(e){
      showToast("Erreur analyse IA — vérifiez la connexion","#EF4444");
    }
    setAiLoading(false);
  };

  const analyserSecteur=async()=>{
    setAiSecteurLoading(true);
    try{
      const s=SECTEURS.find(x=>x.v===secteur);
      const prompt=`Expert en analyse de marché. Donne une analyse concise du marché "${s?.l}" en 2026 :
1. Tendances principales (2-3 points)
2. Opportunités à saisir maintenant (2 points)
3. Risques à surveiller (1-2 points)
4. Conseil stratégique en 1 phrase

Réponse courte et directe, max 150 mots. Pas de JSON.`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiSecteurAnalyse(data.content?.[0]?.text||"Analyse non disponible");
    }catch(e){
      setAiSecteurAnalyse("Erreur — Vérifiez la connexion");
    }
    setAiSecteurLoading(false);
  };

  const TABS=[
    {id:"recommandations",label:"💡 Recommandations IA"},
    {id:"secteur",label:"🌍 Par secteur"},
    {id:"simulateur",label:"🔢 Simulateur ROI"},
    {id:"portefeuille",label:"📊 Portefeuille"},
    {id:"plan",label:"📋 Plan d&apos;action"},
  ];

  const recosSecteur=RECO_PAR_SECTEUR[secteur]||[];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px #00000066"}}>{toast.msg}</div>}

      {/* MODAL AJOUTER OPPORTUNITÉ */}
      {modalOpp&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:480,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouvelle opportunité</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Icône</div><Inp placeholder="💡" value={newOpp.icon} onChange={e=>setNewOpp(p=>({...p,icon:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Titre *</div><Inp placeholder="Ex: Lancer service nettoyage automobile" value={newOpp.titre} onChange={e=>setNewOpp(p=>({...p,titre:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Secteur</div><Sel value={newOpp.secteur} onChange={e=>setNewOpp(p=>({...p,secteur:e.target.value}))} options={SECTEURS.map(s=>({v:s.v,l:s.l}))} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>CA potentiel (€/an)</div><Inp type="number" placeholder="12000" value={newOpp.ca_potentiel} onChange={e=>setNewOpp(p=>({...p,ca_potentiel:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Investissement (€)</div><Inp type="number" placeholder="0" value={newOpp.investissement} onChange={e=>setNewOpp(p=>({...p,investissement:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Risque</div><Sel value={newOpp.risque} onChange={e=>setNewOpp(p=>({...p,risque:e.target.value}))} options={[{v:"Faible",l:"🟢 Faible"},{v:"Moyen",l:"🟡 Moyen"},{v:"Élevé",l:"🔴 Élevé"}]} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Délai de réalisation</div><Inp placeholder="Ex: 1 mois, Q3 2026..." value={newOpp.delai} onChange={e=>setNewOpp(p=>({...p,delai:e.target.value}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Description</div><textarea value={newOpp.detail} onChange={e=>setNewOpp(p=>({...p,detail:e.target.value}))} placeholder="Décris cette opportunité..." style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontFamily:"inherit",fontSize:12,minHeight:60,resize:"vertical"}}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModalOpp(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newOpp.titre)return;
                const roi=newOpp.investissement>0?Math.round((newOpp.ca_potentiel/newOpp.investissement)*100):999;
                setOpportunites(p=>[{id:Date.now(),...newOpp,ca_potentiel:Number(newOpp.ca_potentiel),investissement:Number(newOpp.investissement),roi,statut:"planifié",actions:[]},...p]);
                setModalOpp(null);
                setNewOpp({titre:"",secteur:"conciergerie",ca_potentiel:"",investissement:"",delai:"",risque:"Faible",detail:"",icon:"💡"});
                showToast("✓ Opportunité ajoutée !");
              }}>✓ Ajouter</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="Claude IA · Recommandations personnalisées · ROI · Plan d&apos;action">◐ Investissement & Croissance IA</STitle>
        <Btn v="gold" onClick={()=>setModalOpp({})}>+ Opportunité</Btn>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="CA actuel" val={fmt(ca,"EUR")} color={C.gold}/>
        <KPI label="CA potentiel total" val={fmt(opportunites.reduce((s,o)=>s+o.ca_potentiel,0),"EUR")} color={C.green}/>
        <KPI label="Opportunités" val={opportunites.length} color={C.blue}/>
        <KPI label="En cours" val={opportunites.filter(o=>o.statut==="en_cours").length} color={C.orange}/>
        <KPI label="Marge actuelle" val="61%" color={C.teal}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── RECOMMANDATIONS IA CLAUDE ── */}
      {tab==="recommandations"&&(
        <div>
          {/* Sélecteur secteur */}
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
            <CT>⚙️ Profil de votre entreprise</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
              {SECTEURS.map(s=>(
                <button key={s.v} onClick={()=>setSecteur(s.v)} style={{background:secteur===s.v?`${C.purple}22`:C.card2,border:`1px solid ${secteur===s.v?C.purple:C.border}`,borderRadius:8,padding:"8px 10px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s"}}>
                  <div style={{fontSize:12,fontWeight:secteur===s.v?700:500,color:secteur===s.v?C.purple:C.text,marginBottom:2}}>{s.l}</div>
                  <div style={{fontSize:9,color:C.muted}}>{s.desc}</div>
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn v="purple" onClick={analyserAvecIA}>{aiLoading?"🤖 Analyse en cours...":"🤖 Analyser avec Claude IA"}</Btn>
              <div style={{fontSize:11,color:C.muted,alignSelf:"center"}}>CA : {fmt(ca,"EUR")} · Secteur : {SECTEURS.find(s=>s.v===secteur)?.l}</div>
            </div>
          </Card>

          {/* Résultat IA Claude */}
          {aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.purple}44`,textAlign:"center",padding:30}}>
              <div style={{fontSize:32,marginBottom:10}}>🤖</div>
              <div style={{fontSize:14,color:C.purple,fontWeight:600,marginBottom:6}}>Claude IA analyse votre profil...</div>
              <div style={{fontSize:12,color:C.muted}}>Analyse du CA · Identification des leviers · Calcul des ROI · Génération du plan...</div>
            </Card>
          )}

          {aiAnalyse&&!aiLoading&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,color:C.purple,marginBottom:10}}>🤖 Recommandations Claude IA — Personnalisées pour votre profil</div>
              {aiAnalyse.map((r,i)=>(
                <Card key={i} style={{marginBottom:10,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`${C.purple}22`,border:`1px solid ${C.purple}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:C.purple,flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:8}}>{r.titre}</div>
                      <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                        <Pill label={`CA potentiel : ${r.ca_potentiel}`} color={C.green}/>
                        <Pill label={`Invest. : ${r.investissement}`} color={C.orange}/>
                        <Pill label={`ROI : ${r.roi}`} color={C.purple}/>
                      </div>
                      <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:8}}>{r.detail}</div>
                      <div style={{background:C.card2,borderRadius:7,padding:10}}>
                        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:4}}>⚡ Action immédiate cette semaine :</div>
                        <div style={{fontSize:12,color:C.text}}>{r.action_immediate}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Recommandations statiques par secteur */}
          <div style={{fontSize:13,fontWeight:600,color:C.gold,marginBottom:10}}>
            💡 Recommandations {SECTEURS.find(s=>s.v===secteur)?.l}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {recosSecteur.map((r,i)=>(
              <Card key={i} style={{borderLeft:`4px solid ${r.couleur}`,borderColor:`${r.couleur}33`}}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <span style={{fontSize:28,flexShrink:0}}>{r.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
                      <div style={{fontWeight:700,fontSize:14,color:C.text}}>{r.titre}</div>
                      <Pill label={r.roi} color={r.couleur}/>
                      <Pill label={r.urgence==="haute"?"🔴 Urgent":r.urgence==="moyenne"?"🟡 Moyen":"🟢 Long terme"} color={r.urgence==="haute"?C.red:r.urgence==="moyenne"?C.gold:C.green}/>
                    </div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:10}}>{r.detail}</div>
                    <div style={{background:C.card2,borderRadius:8,padding:12}}>
                      <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Actions concrètes</div>
                      {r.actions.map((a,j)=>(
                        <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:11,color:C.text,marginBottom:4}}>
                          <span style={{color:r.couleur,flexShrink:0}}>→</span>{a}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── PAR SECTEUR ── */}
      {tab==="secteur"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.teal}44`}}>
            <CT>🌍 Analyse de marché par secteur</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
              {SECTEURS.map(s=>(
                <button key={s.v} onClick={()=>setSecteur(s.v)} style={{background:secteur===s.v?`${C.teal}22`:C.card2,border:`1px solid ${secteur===s.v?C.teal:C.border}`,borderRadius:8,padding:"8px 10px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                  <div style={{fontSize:12,fontWeight:secteur===s.v?700:400,color:secteur===s.v?C.teal:C.text}}>{s.l}</div>
                </button>
              ))}
            </div>
            <Btn v="teal" onClick={analyserSecteur}>{aiSecteurLoading?"🤖 Analyse...":"🤖 Analyser ce marché avec Claude IA"}</Btn>
          </Card>

          {aiSecteurLoading&&(
            <Card style={{textAlign:"center",padding:30,marginBottom:14}}>
              <div style={{fontSize:32,marginBottom:8}}>🌍</div>
              <div style={{fontSize:13,color:C.teal,fontWeight:600}}>Analyse du marché {SECTEURS.find(s=>s.v===secteur)?.l}...</div>
            </Card>
          )}

          {aiSecteurAnalyse&&!aiSecteurLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.teal}44`,background:`linear-gradient(135deg,${C.card},#001A18)`}}>
              <CT>🤖 Analyse Claude IA — {SECTEURS.find(s=>s.v===secteur)?.l}</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiSecteurAnalyse}</div>
            </Card>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {(RECO_PAR_SECTEUR[secteur]||[]).map((r,i)=>(
              <Card key={i} style={{borderColor:`${r.couleur}44`}}>
                <div style={{fontSize:28,marginBottom:8}}>{r.icon}</div>
                <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{r.titre}</div>
                <Pill label={r.roi} color={r.couleur}/>
                <div style={{fontSize:11,color:C.muted,marginTop:8,lineHeight:1.6}}>{r.detail}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── SIMULATEUR ROI ── */}
      {tab==="simulateur"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            <CT>🔢 Simulateur ROI</CT>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {[{l:"Nouveaux collaborateurs",k:"collaborateurs",max:5,desc:"~3 200€/mois CA par collab",cout:"1 800€/mois"},{l:"Nouveaux services",k:"services",max:3,desc:"~2 800€/mois par service",cout:"500€ lancement"},{l:"Budget marketing (×100€)",k:"marketing",max:10,desc:"ROI x14 sur le marketing",cout:"100€/unité"},{l:"Formations équipe",k:"formation",max:5,desc:"+600€/mois via montée en gamme",cout:"300€/formation"}].map(({l,k,max,desc,cout})=>(
                <div key={k}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:600}}>{l}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <button onClick={()=>setSc(p=>({...p,[k]:Math.max(0,p[k]-1)}))} style={{background:C.card2,border:`1px solid ${C.border}`,color:C.text,width:26,height:26,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:16}}>−</button>
                      <span style={{fontSize:16,fontWeight:700,color:C.gold,minWidth:20,textAlign:"center"}}>{sc[k]}</span>
                      <button onClick={()=>setSc(p=>({...p,[k]:Math.min(max,p[k]+1)}))} style={{background:C.card2,border:`1px solid ${C.border}`,color:C.text,width:26,height:26,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:16}}>+</button>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:C.muted}}>{desc} · <span style={{color:C.orange}}>Coût : {cout}</span></div>
                  <div style={{height:3,borderRadius:2,background:C.border,marginTop:6}}><div style={{height:"100%",width:`${(sc[k]/max)*100}%`,background:C.gold,borderRadius:2,transition:"width 0.3s"}}/></div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Card style={{borderColor:`${C.teal}44`,background:`linear-gradient(135deg,${C.card},#001A18)`}}>
              <CT>📊 Résultat</CT>
              {[{l:"CA actuel",v:fmt(ca,"EUR"),c:C.muted},{l:"Impact CA",v:`+${fmt(impact,"EUR")}`,c:impact>0?C.green:C.muted},{l:"CA prévisionnel",v:fmt(ca+impact,"EUR"),c:C.gold},{l:"Investissement",v:`-${fmt(invest,"EUR")}`,c:C.red},{l:"ROI mensuel",v:invest>0?`x${Math.round(impact/invest*10)/10}`:"∞",c:C.purple},{l:"Retour sur invest.",v:invest>0?`${Math.ceil(invest/Math.max(impact,1))} mois`:"Immédiat",c:C.teal}].map((k,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<5?`1px solid ${C.border}22`:"none"}}>
                  <span style={{fontSize:12,color:C.muted}}>{k.l}</span>
                  <span style={{fontSize:14,fontWeight:700,color:k.c}}>{k.v}</span>
                </div>
              ))}
            </Card>
            <Card style={{borderColor:`${C.gold}33`}}>
              <CT>🤖 Recommandation IA</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>
                {invest===0&&<span style={{color:C.muted}}>Ajuste les paramètres pour voir l'analyse...</span>}
                {invest>0&&impact/invest>3&&<span>🟢 <b style={{color:C.green}}>Excellent</b> — ROI {">"}3x. Lancer immédiatement sans hésitation.</span>}
                {invest>0&&impact/invest>=1&&impact/invest<=3&&<span>🟡 <b style={{color:C.gold}}>Viable</b> — ROI entre 1x et 3x. À lancer si la trésorerie le permet.</span>}
                {invest>0&&impact/invest<1&&<span>🔴 <b style={{color:C.red}}>Risqué</b> — L'investissement dépasse le CA généré. Réduire l'investissement ou attendre.</span>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── PORTEFEUILLE ── */}
      {tab==="portefeuille"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>setModalOpp({})}>+ Ajouter opportunité</Btn>
          </div>
          <Card style={{marginBottom:14}}>
            <CT>📊 Opportunités en cours</CT>
            <TH heads={["Opportunité","Secteur","CA potentiel","Investissement","ROI","Risque","Statut","Actions"]} rows={opportunites.map((o,i)=>(
              <tr key={i}>
                <Td><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:16}}>{o.icon}</span><span style={{fontWeight:600,fontSize:12}}>{o.titre}</span></div></Td>
                <Td><Pill label={SECTEURS.find(s=>s.v===o.secteur)?.l?.split(" ")[1]||o.secteur} color={C.blue}/></Td>
                <Td><span style={{fontWeight:700,color:C.green}}>{fmt(o.ca_potentiel,"EUR")}/an</span></Td>
                <Td><span style={{color:o.investissement===0?C.green:C.orange}}>{o.investissement===0?"0€ — Gratuit":fmt(o.investissement,"EUR")}</span></Td>
                <Td><span style={{fontWeight:700,color:C.purple}}>{o.roi===999?"∞ %":`+${o.roi}%`}</span></Td>
                <Td><Pill label={o.risque} color={o.risque==="Faible"?C.green:o.risque==="Moyen"?C.orange:C.red}/></Td>
                <Td><Pill label={o.statut==="en_cours"?"● En cours":o.statut==="planifié"?"○ Planifié":"✓ Terminé"} color={o.statut==="en_cours"?C.blue:o.statut==="planifié"?C.muted:C.green}/></Td>
                <Td>
                  <div style={{display:"flex",gap:5}}>
                    <Btn sm v="green" onClick={()=>setOpportunites(p=>p.map(x=>x.id===o.id?{...x,statut:"en_cours"}:x))}>▶</Btn>
                    <Btn sm v="red" onClick={()=>setOpportunites(p=>p.filter(x=>x.id!==o.id))}>🗑</Btn>
                  </div>
                </Td>
              </tr>
            ))}/>
          </Card>

          <Card>
            <CT>✅ Investissements réalisés</CT>
            <TH heads={["Description","Montant investi","Résultat","ROI","Date","Statut"]} rows={investissementsRealises.map((inv,i)=>(
              <tr key={i}>
                <Td><span style={{fontWeight:600}}>{inv.desc}</span></Td>
                <Td><span style={{color:inv.montant===0?C.green:C.orange}}>{inv.montant===0?"0€ — Gratuit":fmt(inv.montant,"EUR")}</span></Td>
                <Td><span style={{color:C.green,fontWeight:600}}>{inv.resultat}</span></Td>
                <Td><span style={{fontWeight:700,color:C.purple}}>{inv.roi}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{inv.date}</span></Td>
                <Td><Pill label="✓ Positif" color={C.green}/></Td>
              </tr>
            ))}/>
            <div style={{marginTop:10}}>
              <Btn v="ghost" sm onClick={()=>showToast("+ Investissement ajouté")}>+ Ajouter un investissement réalisé</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* ── PLAN D'ACTION ── */}
      {tab==="plan"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.gold}44`,background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
            <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:28}}>🤖</span>
              <div>
                <div style={{fontWeight:700,color:C.gold,fontSize:14,marginBottom:4}}>Analyse IA — Tymeless Business Intelligence</div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>CA actuel : <b style={{color:C.gold}}>{fmt(ca,"EUR")}/mois</b> · Marge : <b style={{color:C.green}}>61%</b> · Potentiel identifié : <b style={{color:C.teal}}>+48 000€/mois</b></div>
              </div>
            </div>
          </Card>
          <Card>
            <CT>📋 Plan d&apos;action 2026 — Chiffré et priorisé</CT>
            <TH heads={["#","Action","Investissement","CA généré","ROI","Délai","Statut"]} rows={[
              {p:1,a:"Développer Rapatriement",inv:"400€/mois",ca:"+14 400€/an",roi:"x3.4",d:"1 mois",s:"en_cours"},
              {p:2,a:"Contrat Monaco Yacht Club",inv:"0€",ca:"+172 800€/an",roi:"∞",d:"Cette semaine",s:"en_cours"},
              {p:3,a:"Activer réseau B2B",inv:"0€",ca:"+36 000€/an",roi:"∞",d:"2 mois",s:"planifié"},
              {p:4,a:"30 cartes virtuelles membres",inv:"0€",ca:"+720€/an",roi:"∞",d:"1 mois",s:"planifié"},
              {p:5,a:"Embaucher 1 collaborateur",inv:"1 800€/mois",ca:"+3 200€/mois",roi:"x1.8",d:"3 mois",s:"planifié"},
              {p:6,a:"Déploiement SaaS Afrique",inv:"0€",ca:"+11 000€/an",roi:"∞",d:"Q3 2026",s:"planifié"},
            ].map((r,i)=>(
              <tr key={i}>
                <Td><span style={{fontWeight:700,color:C.gold,fontSize:15}}>#{r.p}</span></Td>
                <Td><span style={{fontWeight:600}}>{r.a}</span></Td>
                <Td><span style={{color:r.inv==="0€"?C.green:C.red,fontWeight:600}}>{r.inv}</span></Td>
                <Td><span style={{color:C.green,fontWeight:700}}>{r.ca}</span></Td>
                <Td><span style={{color:C.purple,fontWeight:700}}>{r.roi}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{r.d}</span></Td>
                <Td><Pill label={r.s==="en_cours"?"● En cours":"○ Planifié"} color={r.s==="en_cours"?C.blue:C.muted}/></Td>
              </tr>
            ))}/>
          </Card>
        </div>
      )}
    </div>
  );
};


function TabCharges(p){
  const showToast=p.showToast;
        const [chargesFixe,setChargesFixe]=useState([
          {id:1,label:"Loyer bureau",montant:800,echeance:"1er du mois",statut:"a_payer",categorie:"Loyer"},
          {id:2,label:"Salaire Thomas",montant:1800,echeance:"28 du mois",statut:"paye",categorie:"Salaires"},
          {id:3,label:"Salaire Abou",montant:1600,echeance:"28 du mois",statut:"paye",categorie:"Salaires"},
          {id:4,label:"Salaire Fatou",montant:1400,echeance:"28 du mois",statut:"a_payer",categorie:"Salaires"},
          {id:5,label:"Assurance pro",montant:120,echeance:"15 du mois",statut:"paye",categorie:"Assurance"},
          {id:6,label:"Téléphone professionnel",montant:45,echeance:"5 du mois",statut:"a_payer",categorie:"Abonnement"},
        ]);
        const [chargesVar,setChargesVar]=useState([
          {id:1,label:"Fournitures nettoyage",montant:320,echeance:"Variable",statut:"a_payer",categorie:"Fournitures"},
          {id:2,label:"Carburant équipe",montant:180,echeance:"Variable",statut:"paye",categorie:"Transport"},
          {id:3,label:"Commissions partenaires",montant:450,echeance:"Fin de mois",statut:"a_payer",categorie:"Commission"},
          {id:4,label:"Matériel nettoyage yacht",montant:250,echeance:"Variable",statut:"a_payer",categorie:"Fournitures"},
        ]);
        const [modalCharge,setModalCharge]=useState(null);
        const [newCharge,setNewCharge]=useState({label:"",montant:"",echeance:"",categorie:"Autre"});
        const [typeModal,setTypeModal]=useState("fixe");

        const totalFixe=chargesFixe.reduce((s,c)=>s+c.montant,0);
        const totalVar=chargesVar.reduce((s,c)=>s+c.montant,0);
        const totalCharges=totalFixe+totalVar;
        const seuilRentabilite=Math.round(totalCharges/0.61);
        const aPayerFixe=chargesFixe.filter(c=>c.statut==="a_payer").reduce((s,c)=>s+c.montant,0);
        const aPayerVar=chargesVar.filter(c=>c.statut==="a_payer").reduce((s,c)=>s+c.montant,0);

        const payer=(type,id)=>{
          if(type==="fixe")setChargesFixe(p=>p.map(c=>c.id===id?{...c,statut:"paye"}:c));
          else setChargesVar(p=>p.map(c=>c.id===id?{...c,statut:"paye"}:c));
          showToast("✅ Paiement confirmé · Sortie enregistrée en trésorerie");
        };

        const ajouterCharge=()=>{
          if(!newCharge.label||!newCharge.montant)return;
          const item={id:Date.now(),...newCharge,montant:Number(newCharge.montant),statut:"a_payer"};
          if(typeModal==="fixe")setChargesFixe(p=>[...p,item]);
          else setChargesVar(p=>[...p,item]);
          setModalCharge(null);
          setNewCharge({label:"",montant:"",echeance:"",categorie:"Autre"});
          showToast("✓ Charge ajoutée !");
        };

        const ChargeRow=({c,type})=>(
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:c.statut==="paye"?C.card2:`${C.orange}08`,borderRadius:8,marginBottom:7,border:`1px solid ${c.statut==="paye"?C.border:C.orange+"33"}`}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:c.statut==="paye"?C.green:C.orange,flexShrink:0}}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:c.statut==="paye"?C.muted:C.text}}>{c.label}</div>
                <div style={{fontSize:10,color:C.muted}}>{c.echeance} · {c.categorie}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{fontWeight:700,fontSize:14,color:c.statut==="paye"?C.muted:C.orange}}>{fmt(c.montant,"EUR")}</div>
              {c.statut==="a_payer"?(
                <Btn sm v="gold" onClick={()=>payer(type,c.id)}>💳 Payer</Btn>
              ):(
                <Pill label="✅ Payé" color={C.green}/>
              )}
              <Btn sm v="red" onClick={()=>{
                if(type==="fixe")setChargesFixe(p=>p.filter(x=>x.id!==c.id));
                else setChargesVar(p=>p.filter(x=>x.id!==c.id));
              }}>🗑</Btn>
            </div>
          </div>
        );

        return(
          <div>
            {/* MODAL AJOUTER CHARGE */}
            {modalCharge&&(
              <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
                <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:380}}>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:14}}>+ Charge {typeModal==="fixe"?"fixe":"variable"}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {[["Label *","label","text","Ex: Loyer bureau"],["Montant (€) *","montant","number","800"],["Échéance","echeance","text","1er du mois"]].map(([l,k,t,ph])=>(
                      <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={newCharge[k]} onChange={e=>setNewCharge(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
                    ))}
                    <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Catégorie</div>
                      <Sel value={newCharge.categorie} onChange={e=>setNewCharge(p=>({...p,categorie:e.target.value}))} options={["Loyer","Salaires","Assurance","Abonnement","Fournitures","Transport","Commission","Fiscal","Autre"].map(v=>({v,l:v}))} style={{width:"100%"}}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,marginTop:14}}>
                    <Btn v="ghost" full onClick={()=>setModalCharge(null)}>Annuler</Btn>
                    <Btn v="gold" full onClick={ajouterCharge}>✓ Ajouter</Btn>
                  </div>
                </div>
              </div>
            )}

            {/* KPIs RÉSUMÉ */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
              <KPI label="Total charges mois" val={fmt(totalCharges,"EUR")} color={C.red}/>
              <KPI label="Charges fixes" val={fmt(totalFixe,"EUR")} color={C.orange}/>
              <KPI label="Charges variables" val={fmt(totalVar,"EUR")} color={C.purple}/>
              <KPI label="Reste à payer" val={fmt(aPayerFixe+aPayerVar,"EUR")} color={aPayerFixe+aPayerVar>0?C.red:C.green}/>
            </div>

            {/* SEUIL DE RENTABILITÉ */}
            <div style={{background:`linear-gradient(135deg,${C.card},#1A0500)`,border:`1px solid ${C.gold}44`,borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>💡 Seuil de rentabilité</div>
                  <div style={{fontSize:22,fontWeight:700,color:C.gold}}>{fmt(seuilRentabilite,"EUR")}/mois minimum</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>CA minimum pour couvrir toutes tes charges</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>CA actuel</div>
                  <div style={{fontSize:22,fontWeight:700,color:C.green}}>24 380€</div>
                  <Pill label={24380>seuilRentabilite?"✅ Rentable":"❌ Sous le seuil"} color={24380>seuilRentabilite?C.green:C.red}/>
                </div>
              </div>
              <div style={{marginTop:10,height:6,borderRadius:3,background:C.border}}>
                <div style={{height:"100%",width:`${Math.min((seuilRentabilite/24380)*100,100)}%`,background:C.gold,borderRadius:3}}/>
              </div>
            </div>

            {/* CHARGES FIXES */}
            <Card style={{marginBottom:14,borderColor:`${C.orange}44`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <CT>🔒 Charges fixes</CT>
                  <div style={{fontSize:11,color:C.muted,marginTop:-8,marginBottom:8}}>Sorties garanties chaque mois quoi qu'il arrive</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:C.muted}}>Total fixe</div>
                    <div style={{fontWeight:700,fontSize:16,color:C.orange}}>{fmt(totalFixe,"EUR")}</div>
                  </div>
                  <Btn sm v="gold" onClick={()=>{setTypeModal("fixe");setModalCharge(true);}}>+ Ajouter</Btn>
                </div>
              </div>
              {chargesFixe.map(c=><ChargeRow key={c.id} c={c} type="fixe"/>)}
              {aPayerFixe>0&&(
                <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.orange}}>⏳ Reste à payer ce mois</span>
                  <span style={{fontWeight:700,color:C.orange}}>{fmt(aPayerFixe,"EUR")}</span>
                </div>
              )}
            </Card>

            {/* CHARGES VARIABLES */}
            <Card style={{borderColor:`${C.purple}44`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <CT>📊 Charges variables</CT>
                  <div style={{fontSize:11,color:C.muted,marginTop:-8,marginBottom:8}}>Dépendent de votre activité et volume de missions</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:C.muted}}>Total variable</div>
                    <div style={{fontWeight:700,fontSize:16,color:C.purple}}>{fmt(totalVar,"EUR")}</div>
                  </div>
                  <Btn sm v="gold" onClick={()=>{setTypeModal("variable");setModalCharge(true);}}>+ Ajouter</Btn>
                </div>
              </div>
              {chargesVar.map(c=><ChargeRow key={c.id} c={c} type="variable"/>)}
              {aPayerVar>0&&(
                <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:10,marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.purple}}>⏳ Reste à payer</span>
                  <span style={{fontWeight:700,color:C.purple}}>{fmt(aPayerVar,"EUR")}</span>
                </div>
              )}
            </Card>

            {/* RAPPEL WHATSAPP */}
            <Card style={{marginTop:14,borderColor:`${C.green}44`}}>
              <CT>🔔 Rappels WhatsApp automatiques</CT>
              <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Reçois un rappel WhatsApp avant chaque échéance de paiement.</div>
              {[["3 jours avant échéance","Actif",C.green],["Jour J si pas encore payé","Actif",C.green],["Récap charges fin de mois","Actif",C.green]].map(([l,s,c],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{l}</span>
                  <Pill label={`✓ ${s}`} color={c}/>
                </div>
              ))}
            </Card>
          </div>
        );
};

function TabFournisseurs(p){
  const showToast=p.showToast;
        const [fours,setFours]=useState([
          {id:1,nom:"CleanPro",cat:"Nettoyage général",articles:5,ca:"1 450€",delai:"48h",contact:"cleanpro@email.fr",tel:"+33 1 23 45 67 89",note:4.8,montant_du:320,echeance:"15/06/2026",statut_paiement:"a_payer",iban:"FR76 3000 1234 5678 9012 3456 789"},
          {id:2,nom:"LuxClean",cat:"Produits luxe",articles:2,ca:"540€",delai:"72h",contact:"luxclean@email.fr",tel:"+33 1 98 76 54 32",note:4.5,montant_du:180,echeance:"20/06/2026",statut_paiement:"a_payer",iban:"FR76 1234 5678 9012 3456 7890 123"},
          {id:3,nom:"MarineClean",cat:"Maritime",articles:1,ca:"725€",delai:"5j",contact:"marine@email.fr",tel:"+33 4 56 78 90 12",note:4.2,montant_du:725,echeance:"01/06/2026",statut_paiement:"urgent",iban:"FR76 9876 5432 1098 7654 3210 987"},
          {id:4,nom:"AeroClean",cat:"Aviation",articles:1,ca:"340€",delai:"3j",contact:"aero@email.fr",tel:"+33 5 67 89 01 23",note:4.7,montant_du:0,echeance:"",statut_paiement:"payé",iban:"FR76 5678 9012 3456 7890 1234 567"},
          {id:5,nom:"SafePro",cat:"Protection",articles:1,ca:"108€",delai:"24h",contact:"safe@email.fr",tel:"+33 2 34 56 78 90",note:4.9,montant_du:54,echeance:"30/06/2026",statut_paiement:"a_payer",iban:""},
        ]);
        const [modalF,setModalF]=useState(false);
        const [newF,setNewF]=useState({nom:"",cat:"Nettoyage",delai:"48h",contact:"",tel:"",note:"",montant_du:"",echeance:"",iban:""});

        const totalDu=fours.filter(f=>f.statut_paiement!=="payé").reduce((s,f)=>s+f.montant_du,0);
        const urgents=fours.filter(f=>f.statut_paiement==="urgent");

        const payer=(id)=>{
          setFours(p=>p.map(f=>f.id===id?{...f,statut_paiement:"payé",montant_du:0}:f));
          const f=fours.find(x=>x.id===id);
          showToast(`💳 Paiement ${fmt(f.montant_du,"EUR")} envoyé à ${f.nom} via Wallet ✅`);
        };

        return(
          <div>
            {/* MODAL AJOUTER FOURNISSEUR */}
            {modalF&&(
              <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
                <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:480,maxHeight:"90vh",overflowY:"auto"}}>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouveau fournisseur</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nom *</div><Inp placeholder="CleanPro" value={newF.nom} onChange={e=>setNewF(p=>({...p,nom:e.target.value}))} style={{width:"100%"}}/></div>
                      <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Catégorie</div><Sel value={newF.cat} onChange={e=>setNewF(p=>({...p,cat:e.target.value}))} options={["Nettoyage","Maritime","Aviation","Protection","Textile","Autre"].map(c=>({v:c,l:c}))} style={{width:"100%"}}/></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Email</div><Inp type="email" placeholder="contact@email.fr" value={newF.contact} onChange={e=>setNewF(p=>({...p,contact:e.target.value}))} style={{width:"100%"}}/></div>
                      <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>WhatsApp</div><Inp placeholder="+33 6..." value={newF.tel} onChange={e=>setNewF(p=>({...p,tel:e.target.value}))} style={{width:"100%"}}/></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Délai livraison</div><Sel value={newF.delai} onChange={e=>setNewF(p=>({...p,delai:e.target.value}))} options={["24h","48h","72h","5j","7j","15j"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
                      <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Note (sur 5)</div><Inp type="number" placeholder="4.5" value={newF.note} onChange={e=>setNewF(p=>({...p,note:e.target.value}))} style={{width:"100%"}}/></div>
                    </div>
                    <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10}}>
                      <div style={{fontSize:10,color:C.orange,fontWeight:600,marginBottom:8}}>💳 Informations de paiement</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Montant dû (€)</div><Inp type="number" placeholder="0" value={newF.montant_du} onChange={e=>setNewF(p=>({...p,montant_du:e.target.value}))} style={{width:"100%"}}/></div>
                        <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Date d'échéance</div><Inp type="date" value={newF.echeance} onChange={e=>setNewF(p=>({...p,echeance:e.target.value}))} style={{width:"100%"}}/></div>
                      </div>
                      <div style={{marginTop:8}}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>IBAN fournisseur</div><Inp placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" value={newF.iban} onChange={e=>setNewF(p=>({...p,iban:e.target.value}))} style={{width:"100%",fontFamily:"monospace"}}/></div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,marginTop:14}}>
                    <Btn v="ghost" full onClick={()=>setModalF(false)}>Annuler</Btn>
                    <Btn v="gold" full onClick={()=>{
                      if(!newF.nom)return;
                      setFours(p=>[...p,{id:Date.now(),...newF,articles:0,ca:"0€",montant_du:Number(newF.montant_du)||0,statut_paiement:Number(newF.montant_du)>0?"a_payer":"payé",note:Number(newF.note)||5}]);
                      setModalF(false);
                      setNewF({nom:"",cat:"Nettoyage",delai:"48h",contact:"",tel:"",note:"",montant_du:"",echeance:"",iban:""});
                      showToast("✓ Fournisseur ajouté !");
                    }}>✓ Ajouter</Btn>
                  </div>
                </div>
              </div>
            )}

            {/* ALERTES PAIEMENTS URGENTS */}
            {urgents.length>0&&(
              <div style={{background:`${C.red}11`,border:`1px solid ${C.red}44`,borderRadius:10,padding:12,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:600,color:C.red,marginBottom:8}}>🚨 Paiements urgents — Échéance dépassée !</div>
                {urgents.map((f,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,borderRadius:7,padding:"8px 12px",marginBottom:6}}>
                    <div><span style={{fontWeight:600,color:C.red}}>{f.nom}</span><span style={{fontSize:10,color:C.muted,marginLeft:8}}>Dû le {f.echeance}</span></div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontWeight:700,color:C.red}}>{fmt(f.montant_du,"EUR")}</span>
                      <Btn sm v="red" onClick={()=>payer(f.id)}>💳 Payer maintenant</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
              <KPI label="Fournisseurs actifs" val={fours.length} color={C.teal}/>
              <KPI label="Total dû" val={fmt(totalDu,"EUR")} color={totalDu>0?C.red:C.green}/>
              <KPI label="Urgents" val={urgents.length} color={urgents.length>0?C.red:C.green}/>
              <KPI label="Déjà payés" val={fours.filter(f=>f.statut_paiement==="payé").length} color={C.green}/>
            </div>

            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
              <Btn v="gold" onClick={()=>setModalF(true)}>+ Ajouter fournisseur</Btn>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {fours.map((f,i)=>(
                <Card key={i} style={{borderColor:`${f.statut_paiement==="urgent"?C.red:f.statut_paiement==="payé"?C.green:C.teal}33`}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:14}}>
                    <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                      <div style={{width:40,height:40,borderRadius:"50%",background:`${C.teal}22`,border:`1px solid ${C.teal}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:C.teal,flexShrink:0}}>{f.nom[0]}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                          <span style={{fontSize:14,fontWeight:700,color:C.text}}>{f.nom}</span>
                          <Pill label={f.cat} color={C.blue}/>
                          <div style={{display:"flex",gap:2,alignItems:"center"}}>
                            <span style={{fontSize:11,color:C.gold}}>{"★".repeat(Math.floor(f.note))}</span>
                            <span style={{fontSize:9,color:C.muted}}>{f.note}</span>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:14,fontSize:11,color:C.muted,flexWrap:"wrap"}}>
                          <span>📧 {f.contact}</span>
                          <span>📱 {f.tel}</span>
                          <span>🚚 Délai : {f.delai}</span>
                          <span>📦 {f.articles} articles</span>
                        </div>
                        {f.iban&&<div style={{fontSize:9,fontFamily:"monospace",color:C.muted,marginTop:4}}>IBAN : {f.iban}</div>}
                      </div>
                    </div>

                    {/* SECTION PAIEMENT */}
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,minWidth:180}}>
                      {f.statut_paiement==="payé"?(
                        <Pill label="✅ Payé" color={C.green}/>
                      ):(
                        <>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:10,color:C.muted}}>Montant dû</div>
                            <div style={{fontSize:18,fontWeight:700,color:f.statut_paiement==="urgent"?C.red:C.orange}}>{fmt(f.montant_du,"EUR")}</div>
                            {f.echeance&&<div style={{fontSize:10,color:f.statut_paiement==="urgent"?C.red:C.muted}}>Échéance : {f.echeance}</div>}
                          </div>
                          <Btn v={f.statut_paiement==="urgent"?"red":"gold"} onClick={()=>payer(f.id)}>
                            💳 Payer {fmt(f.montant_du,"EUR")}
                          </Btn>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{display:"flex",gap:7,marginTop:10,borderTop:`1px solid ${C.border}22`,paddingTop:10}}>
                    <Btn sm v="ghost" onClick={()=>showToast(`📲 Message envoyé à ${f.nom}`)}>📲 WhatsApp</Btn>
                    <Btn sm v="ghost" onClick={()=>showToast(`📦 Commande passée chez ${f.nom}`)}>📦 Commander</Btn>
                    <Btn sm v="ghost" onClick={()=>showToast(`📧 Email envoyé à ${f.nom}`)}>📧 Email</Btn>
                    <Btn sm v="red" onClick={()=>{setFours(p=>p.filter(x=>x.id!==f.id));showToast("Fournisseur supprimé","#EF4444");}}>🗑</Btn>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
};

const PageCompta=()=>{
  const [tab,setTab]=useState("dashboard");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};
  const [norme,setNorme]=useState("PCG"); // PCG, SYSCOHADA, IFRS, GAAP
  const [devise,setDevise]=useState("EUR");
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);

  // ── DONNÉES COMPTABLES ───────────────────────────────────
  const ca=24380;
  const [ecritures,setEcritures]=useState([
    {id:"ECR-001",date:"01/05/2026",compte:"706000",libelle:"Prestation Airbnb — Sofia Riad",debit:0,credit:1200,tva:20,categorie:"Produit",statut:"validé"},
    {id:"ECR-002",date:"02/05/2026",compte:"706000",libelle:"Nettoyage bureaux — Marc Dupont",debit:0,credit:580,tva:20,categorie:"Produit",statut:"validé"},
    {id:"ECR-003",date:"03/05/2026",compte:"615000",libelle:"Fournitures nettoyage — CleanPro",debit:320,credit:0,tva:20,categorie:"Charge",statut:"validé"},
    {id:"ECR-004",date:"05/05/2026",compte:"641000",libelle:"Salaire Thomas",debit:1800,credit:0,tva:0,categorie:"Charge",statut:"validé"},
    {id:"ECR-005",date:"05/05/2026",compte:"641000",libelle:"Salaire Abou",debit:1600,credit:0,tva:0,categorie:"Charge",statut:"validé"},
    {id:"ECR-006",date:"06/05/2026",compte:"706000",libelle:"Mission Jet Privé — Ahmed",debit:0,credit:4800,tva:20,categorie:"Produit",statut:"validé"},
    {id:"ECR-007",date:"08/05/2026",compte:"626000",libelle:"Abonnement Tymeless OS",debit:99,credit:0,tva:20,categorie:"Charge",statut:"validé"},
    {id:"ECR-008",date:"10/05/2026",compte:"706000",libelle:"Prestation Yacht — Client VIP",debit:0,credit:6200,tva:20,categorie:"Produit",statut:"validé"},
    {id:"ECR-009",date:"12/05/2026",compte:"622000",libelle:"Commission Thomas — Airbnb",debit:450,credit:0,tva:0,categorie:"Charge",statut:"validé"},
    {id:"ECR-010",date:"15/05/2026",compte:"613000",libelle:"Loyer bureau",debit:800,credit:0,tva:20,categorie:"Charge",statut:"validé"},
  ]);

  const [modalEcriture,setModalEcriture]=useState(null);
  const [newEcr,setNewEcr]=useState({date:"",compte:"",libelle:"",debit:"",credit:"",tva:20,categorie:"Produit"});

  // Calculs comptables
  const totalProduits=ecritures.filter(e=>e.categorie==="Produit").reduce((s,e)=>s+e.credit,0);
  const totalCharges=ecritures.filter(e=>e.categorie==="Charge").reduce((s,e)=>s+e.debit,0);
  const resultatNet=totalProduits-totalCharges;
  const tvaCollectee=ecritures.filter(e=>e.categorie==="Produit").reduce((s,e)=>s+(e.credit*e.tva/100),0);
  const tvaDeductible=ecritures.filter(e=>e.categorie==="Charge").reduce((s,e)=>s+(e.debit*e.tva/100),0);
  const tvaDue=tvaCollectee-tvaDeductible;

  const NORMES=[
    {v:"PCG",l:"🇫🇷 PCG France",desc:"Plan Comptable Général"},
    {v:"SYSCOHADA",l:"🌍 SYSCOHADA",desc:"Afrique francophone OHADA"},
    {v:"IFRS",l:"🌐 IFRS",desc:"Normes internationales"},
    {v:"GAAP",l:"🇺🇸 GAAP",desc:"USA & Canada"},
  ];

  const COMPTES_PCG=[
    {num:"101000",nom:"Capital social",type:"Passif"},
    {num:"106000",nom:"Réserves",type:"Passif"},
    {num:"120000",nom:"Résultat de l'exercice",type:"Passif"},
    {num:"401000",nom:"Fournisseurs",type:"Passif"},
    {num:"411000",nom:"Clients",type:"Actif"},
    {num:"445710",nom:"TVA collectée",type:"Passif"},
    {num:"445660",nom:"TVA déductible",type:"Actif"},
    {num:"512000",nom:"Banque",type:"Actif"},
    {num:"530000",nom:"Caisse",type:"Actif"},
    {num:"606000",nom:"Achats non stockés",type:"Charge"},
    {num:"613000",nom:"Locations",type:"Charge"},
    {num:"615000",nom:"Entretien et réparations",type:"Charge"},
    {num:"622000",nom:"Commissions",type:"Charge"},
    {num:"626000",nom:"Abonnements",type:"Charge"},
    {num:"641000",nom:"Salaires",type:"Charge"},
    {num:"706000",nom:"Prestations de services",type:"Produit"},
    {num:"708000",nom:"Produits annexes",type:"Produit"},
  ];

  // Analyse IA Claude
  const analyserIA=async(type)=>{
    setAiLoading(true);
    try{
      const prompts={
        optimisation:`Tu es expert-comptable et gestionnaire fiscal. Analyse ces données comptables et propose des optimisations fiscales CONCRÈTES et LÉGALES.

Données entreprise :
- CA mensuel : ${totalProduits.toLocaleString("fr")}€
- Charges totales : ${totalCharges.toLocaleString("fr")}€
- Résultat net : ${resultatNet.toLocaleString("fr")}€
- TVA due : ${tvaDue.toFixed(2)}€
- Norme comptable : ${norme}
- Secteur : Conciergerie premium (Airbnb, Jet privé, Yacht, Rapatriement)

Propose 4-5 optimisations fiscales concrètes et légales avec le montant estimé d'économies pour chacune.
Ajoute une mention : "Ces recommandations sont à valider par un expert-comptable ou gestionnaire fiscal agréé avant application."`,

        anomalies:`Analyse ce journal comptable et détecte les anomalies ou erreurs potentielles.
Écritures : ${ecritures.map(e=>`${e.date} — ${e.libelle} — ${e.credit>0?"+":""}${e.credit||"-"+e.debit}€`).join(" | ")}
Résultat net : ${resultatNet}€
Donne 2-3 observations courtes et concrètes.`,

        conseil:`Donne 3 conseils de gestion financière pour améliorer la rentabilité de cette entreprise.
CA : ${totalProduits}€ · Charges : ${totalCharges}€ · Résultat : ${resultatNet}€
Sois direct et actionnable. Chaque conseil en 1-2 phrases max.`,
      };

      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:prompts[type]}]})});
      const data=await res.json();
      setAiResult({type,text:data.content?.[0]?.text||"Analyse non disponible"});
    }catch(e){setAiResult({type,text:"Erreur — Vérifiez la connexion"});}
    setAiLoading(false);
  };

  const TABS=[
    {id:"dashboard",label:"📊 Tableau de bord"},
    {id:"charges",label:"💰 Charges"},
    {id:"journal",label:"📝 Journal"},
    {id:"grandlivre",label:"📚 Grand Livre"},
    {id:"bilan",label:"⚖️ Bilan"},
    {id:"resultat",label:"📈 Compte de résultat"},
    {id:"tva",label:"💰 TVA"},
    {id:"fiscal",label:"🤖 IA Fiscale"},
    {id:"export",label:"📤 Exports"},
  ];

  // Mention légale
  const MentionLegale=()=>(
    <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,marginBottom:14,fontSize:10,color:C.orange,lineHeight:1.6}}>
      ⚠️ <b>Mention légale :</b> Les données et suggestions fiscales générées par Tymeless OS sont fournies à titre indicatif uniquement. Elles doivent être vérifiées et validées par un expert-comptable ou gestionnaire fiscal agréé avant toute utilisation officielle. Tymeless OS ne saurait être tenu responsable des décisions prises sur la base de ces informations.
    </div>
  );

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px #00000066"}}>{toast.msg}</div>}

      {/* MODAL ÉCRITURE */}
      {modalEcriture&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:480}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>{modalEcriture==="creer"?"+ Nouvelle écriture":"✏️ Modifier l'écriture"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Date *</div><Inp type="date" value={newEcr.date} onChange={e=>setNewEcr(p=>({...p,date:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>N° Compte</div>
                  <Sel value={newEcr.compte} onChange={e=>setNewEcr(p=>({...p,compte:e.target.value}))} options={[{v:"",l:"Choisir..."},...COMPTES_PCG.map(c=>({v:c.num,l:`${c.num} — ${c.nom}`}))]} style={{width:"100%"}}/>
                </div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Libellé *</div><Inp placeholder="Description de l'écriture" value={newEcr.libelle} onChange={e=>setNewEcr(p=>({...p,libelle:e.target.value}))} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Débit (€)</div><Inp type="number" placeholder="0" value={newEcr.debit} onChange={e=>setNewEcr(p=>({...p,debit:e.target.value,credit:"",categorie:"Charge"}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Crédit (€)</div><Inp type="number" placeholder="0" value={newEcr.credit} onChange={e=>setNewEcr(p=>({...p,credit:e.target.value,debit:"",categorie:"Produit"}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>TVA %</div><Sel value={newEcr.tva} onChange={e=>setNewEcr(p=>({...p,tva:Number(e.target.value)}))} options={[{v:20,l:"20%"},{v:10,l:"10%"},{v:5.5,l:"5.5%"},{v:0,l:"0%"}]} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Catégorie</div><Sel value={newEcr.categorie} onChange={e=>setNewEcr(p=>({...p,categorie:e.target.value}))} options={[{v:"Produit",l:"Produit"},{v:"Charge",l:"Charge"},{v:"Actif",l:"Actif"},{v:"Passif",l:"Passif"}]} style={{width:"100%"}}/></div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModalEcriture(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newEcr.libelle||!newEcr.date)return;
                const id=`ECR-${String(ecritures.length+1).padStart(3,"0")}`;
                setEcritures(p=>[...p,{id,...newEcr,debit:Number(newEcr.debit)||0,credit:Number(newEcr.credit)||0,statut:"validé"}]);
                setModalEcriture(null);
                setNewEcr({date:"",compte:"",libelle:"",debit:"",credit:"",tva:20,categorie:"Produit"});
                showToast("✓ Écriture ajoutée !");
              }}>✓ Enregistrer</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="Comptabilité complète · Bilan · TVA · IA Fiscale · Multi-normes">◉ Comptabilité</STitle>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Sel value={norme} onChange={e=>setNorme(e.target.value)} options={NORMES.map(n=>({v:n.v,l:n.l}))} style={{width:160}}/>
          <Sel value={devise} onChange={e=>setDevise(e.target.value)} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:100}}/>
          <Btn v="gold" onClick={()=>{setNewEcr({date:"",compte:"",libelle:"",debit:"",credit:"",tva:20,categorie:"Produit"});setModalEcriture("creer");}}>+ Écriture</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="CA / Produits" val={fmt(totalProduits,devise)} color={C.gold}/>
        <KPI label="Charges totales" val={fmt(totalCharges,devise)} color={C.red}/>
        <KPI label="Résultat net" val={fmt(resultatNet,devise)} color={resultatNet>0?C.green:C.red}/>
        <KPI label="TVA due" val={fmt(tvaDue,devise)} color={C.orange}/>
        <KPI label="Marge nette" val={`${Math.round((resultatNet/totalProduits)*100)}%`} color={C.teal}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── TABLEAU DE BORD ── */}
      {tab==="dashboard"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <Card>
              <CT>📊 Répartition Produits / Charges</CT>
              <div style={{display:"flex",gap:6,alignItems:"flex-end",height:100,marginBottom:10}}>
                {[{l:"Produits",v:totalProduits,c:C.green},{l:"Charges",v:totalCharges,c:C.red},{l:"Résultat",v:Math.abs(resultatNet),c:resultatNet>0?C.gold:C.red}].map((b,i)=>{
                  const max=Math.max(totalProduits,totalCharges);
                  return(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{fontSize:10,color:b.c,fontWeight:600}}>{fmt(b.v,"EUR")}</div>
                      <div style={{width:"100%",height:`${(b.v/max)*90}px`,background:`${b.c}22`,border:`1px solid ${b.c}44`,borderRadius:"3px 3px 0 0",minHeight:4}}/>
                      <div style={{fontSize:10,color:C.muted}}>{b.l}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <CT>📈 Marge par service</CT>
              {[{s:"Jet privé",v:80,c:C.green},{s:"Rapatriement",v:75,c:C.green},{s:"Yacht",v:72,c:C.green},{s:"Airbnb",v:68,c:C.gold},{s:"Bureaux",v:60,c:C.gold},{s:"Résidentiel",v:50,c:C.orange}].map((m,i)=>(
                <div key={i} style={{marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}>
                    <span style={{color:C.text}}>{m.s}</span>
                    <span style={{color:m.c,fontWeight:600}}>{m.v}%</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${m.v}%`,background:m.c,borderRadius:2}}/></div>
                </div>
              ))}
            </Card>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            <Card style={{borderColor:`${C.gold}44`}}>
              <CT>💰 Charges détaillées</CT>
              {CHARGES.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{c.cat}</span>
                  <span style={{color:C.red,fontWeight:600}}>{c.mois.toLocaleString("fr")} €</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:13,fontWeight:700}}>
                <span style={{color:C.muted}}>TOTAL</span>
                <span style={{color:C.red}}>{fmt(totalCharges,"EUR")}</span>
              </div>
            </Card>
            <Card>
              <CT>📅 Échéances fiscales</CT>
              {[
                {d:"15/05/2026",l:"Déclaration TVA CA3",u:true},
                {d:"15/06/2026",l:"Acompte IS",u:false},
                {d:"30/06/2026",l:"Clôture S1",u:false},
                {d:"15/07/2026",l:"Déclaration TVA CA3",u:false},
                {d:"31/12/2026",l:"Clôture exercice",u:false},
              ].map((e,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:e.u?C.orange:C.muted,flexShrink:0}}/>
                  <span style={{color:e.u?C.orange:C.muted,fontFamily:"monospace"}}>{e.d}</span>
                  <span style={{color:C.text}}>{e.l}</span>
                </div>
              ))}
            </Card>
            <Card>
              <CT>🌍 Norme active : {norme}</CT>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:10}}>
                {norme==="PCG"&&"Plan Comptable Général français. Conforme au Code de commerce et aux normes ANC."}
                {norme==="SYSCOHADA"&&"Système Comptable OHADA. Applicable dans 17 pays d'Afrique francophone."}
                {norme==="IFRS"&&"International Financial Reporting Standards. Norme mondiale pour les entreprises cotées."}
                {norme==="GAAP"&&"Generally Accepted Accounting Principles. Norme américaine et canadienne."}
              </div>
              <div style={{display:"flex",flex:"column",gap:6}}>
                {NORMES.map(n=>(
                  <button key={n.v} onClick={()=>setNorme(n.v)} style={{display:"block",width:"100%",marginBottom:4,padding:"5px 10px",border:`1px solid ${norme===n.v?C.gold:C.border}`,borderRadius:6,background:norme===n.v?`${C.gold}22`:C.card2,color:norme===n.v?C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit",textAlign:"left"}}>
                    {n.l} — {n.desc}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── JOURNAL ── */}
      {tab==="charges"&&<TabCharges showToast={showToast}/>}

      {tab==="journal"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>{setNewEcr({date:"",compte:"",libelle:"",debit:"",credit:"",tva:20,categorie:"Produit"});setModalEcriture("creer");}}>+ Nouvelle écriture</Btn>
          </div>
          <Card>
            <CT>📝 Journal des écritures — {norme}</CT>
            <TH heads={["N°","Date","Compte","Libellé","Débit","Crédit","TVA","Catégorie","Statut","Actions"]} rows={ecritures.map((e,i)=>(
              <tr key={i}>
                <Td><span style={{fontFamily:"monospace",fontSize:10,color:C.gold}}>{e.id}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{e.date}</span></Td>
                <Td><span style={{fontFamily:"monospace",fontSize:10,color:C.blue}}>{e.compte}</span></Td>
                <Td><span style={{fontSize:12,fontWeight:500}}>{e.libelle}</span></Td>
                <Td><span style={{color:C.red,fontWeight:e.debit>0?600:400}}>{e.debit>0?fmt(e.debit,"EUR"):"—"}</span></Td>
                <Td><span style={{color:C.green,fontWeight:e.credit>0?600:400}}>{e.credit>0?fmt(e.credit,"EUR"):"—"}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{e.tva}%</span></Td>
                <Td><Pill label={e.categorie} color={e.categorie==="Produit"?C.green:C.red}/></Td>
                <Td><Pill label="✓ Validé" color={C.green}/></Td>
                <Td>
                  <div style={{display:"flex",gap:4}}>
                    <Btn sm v="blue" onClick={()=>{setNewEcr({...e,debit:String(e.debit),credit:String(e.credit)});setModalEcriture("modifier");}}>✏️</Btn>
                    <Btn sm v="red" onClick={()=>{setEcritures(p=>p.filter((_,j)=>j!==i));showToast("Écriture supprimée","#EF4444");}}>🗑</Btn>
                  </div>
                </Td>
              </tr>
            ))}/>
            <div style={{marginTop:10,display:"flex",justifyContent:"space-between",padding:"10px 12px",background:C.card2,borderRadius:8}}>
              <span style={{fontSize:12,color:C.muted}}>Totaux</span>
              <div style={{display:"flex",gap:20}}>
                <span style={{color:C.red,fontWeight:700}}>Débit : {fmt(ecritures.reduce((s,e)=>s+e.debit,0),"EUR")}</span>
                <span style={{color:C.green,fontWeight:700}}>Crédit : {fmt(ecritures.reduce((s,e)=>s+e.credit,0),"EUR")}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── GRAND LIVRE ── */}
      {tab==="grandlivre"&&(
        <div>
          <Card>
            <CT>📚 Grand Livre des comptes — {norme}</CT>
            {COMPTES_PCG.filter(c=>ecritures.some(e=>e.compte===c.num)).map((compte,i)=>{
              const lignes=ecritures.filter(e=>e.compte===compte.num);
              const totalD=lignes.reduce((s,e)=>s+e.debit,0);
              const totalC=lignes.reduce((s,e)=>s+e.credit,0);
              const solde=totalC-totalD;
              return(
                <div key={i} style={{marginBottom:14,background:C.card2,borderRadius:8,overflow:"hidden"}}>
                  <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}22`,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <span style={{fontFamily:"monospace",fontSize:11,color:C.blue,fontWeight:600}}>{compte.num}</span>
                      <span style={{fontSize:12,fontWeight:600,color:C.text}}>{compte.nom}</span>
                      <Pill label={compte.type} color={compte.type==="Actif"||compte.type==="Produit"?C.green:C.red}/>
                    </div>
                    <div style={{display:"flex",gap:14,fontSize:11}}>
                      <span style={{color:C.red}}>D: {fmt(totalD,"EUR")}</span>
                      <span style={{color:C.green}}>C: {fmt(totalC,"EUR")}</span>
                      <span style={{color:solde>=0?C.gold:C.red,fontWeight:700}}>Solde: {fmt(Math.abs(solde),"EUR")}</span>
                    </div>
                  </div>
                  {lignes.map((l,j)=>(
                    <div key={j} style={{display:"grid",gridTemplateColumns:"100px 1fr 80px 80px",gap:8,padding:"5px 12px",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                      <span style={{color:C.muted}}>{l.date}</span>
                      <span style={{color:C.text}}>{l.libelle}</span>
                      <span style={{color:C.red,textAlign:"right"}}>{l.debit>0?fmt(l.debit,"EUR"):"—"}</span>
                      <span style={{color:C.green,textAlign:"right"}}>{l.credit>0?fmt(l.credit,"EUR"):"—"}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* ── BILAN ── */}
      {tab==="bilan"&&(
        <div>
          <MentionLegale/>
          <Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700}}>⚖️ Bilan comptable — {norme} — {new Date().toLocaleDateString("fr",{month:"long",year:"numeric"})}</div>
              <Btn sm v="ghost" onClick={()=>showToast("📄 Bilan PDF exporté")}>📄 Exporter PDF</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {/* ACTIF */}
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:10,padding:"6px 10px",background:`${C.green}11`,borderRadius:6}}>ACTIF</div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Actif immobilisé</div>
                  {[{l:"Immobilisations incorporelles",v:0},{l:"Immobilisations corporelles",v:2500},{l:"Immobilisations financières",v:0}].map(([l,v],i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",fontSize:11}}>
                      <span style={{color:C.muted}}>{l}</span><span style={{fontWeight:500}}>{fmt(v,"EUR")}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Actif circulant</div>
                  {[{l:"Stocks et en-cours",v:1200},{l:"Créances clients",v:totalProduits*0.3},{l:"Trésorerie",v:24380},{l:"TVA déductible",v:tvaDeductible}].map(([l,v],i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",fontSize:11}}>
                      <span style={{color:C.muted}}>{l}</span><span style={{fontWeight:500}}>{fmt(v,"EUR")}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:`${C.green}11`,borderRadius:6,fontSize:13,fontWeight:700}}>
                  <span>TOTAL ACTIF</span>
                  <span style={{color:C.green}}>{fmt(2500+1200+totalProduits*0.3+24380+tvaDeductible,"EUR")}</span>
                </div>
              </div>
              {/* PASSIF */}
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:10,padding:"6px 10px",background:`${C.red}11`,borderRadius:6}}>PASSIF</div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Capitaux propres</div>
                  {[{l:"Capital social",v:10000},{l:"Réserves",v:5000},{l:"Résultat de l'exercice",v:resultatNet}].map(([l,v],i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",fontSize:11}}>
                      <span style={{color:C.muted}}>{l}</span><span style={{fontWeight:500,color:i===2&&v<0?C.red:"inherit"}}>{fmt(v,"EUR")}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Dettes</div>
                  {[{l:"Dettes fournisseurs",v:totalCharges*0.2},{l:"Dettes fiscales (TVA)",v:tvaDue},{l:"Dettes sociales",v:totalCharges*0.15}].map(([l,v],i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",fontSize:11}}>
                      <span style={{color:C.muted}}>{l}</span><span style={{fontWeight:500}}>{fmt(v,"EUR")}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:`${C.red}11`,borderRadius:6,fontSize:13,fontWeight:700}}>
                  <span>TOTAL PASSIF</span>
                  <span style={{color:C.red}}>{fmt(10000+5000+resultatNet+totalCharges*0.2+tvaDue+totalCharges*0.15,"EUR")}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── COMPTE DE RÉSULTAT ── */}
      {tab==="resultat"&&(
        <div>
          <MentionLegale/>
          <Card style={{borderColor:`${C.teal}44`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700}}>📈 Compte de résultat — {norme}</div>
              <Btn sm v="ghost" onClick={()=>showToast("📄 Compte de résultat PDF exporté")}>📄 PDF</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:10,padding:"6px 10px",background:`${C.green}11`,borderRadius:6}}>PRODUITS</div>
                {[{l:"Chiffre d'affaires",v:totalProduits},{l:"Produits financiers",v:0},{l:"Produits exceptionnels",v:0}].map(([l,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 8px",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                    <span style={{color:C.muted}}>{l}</span><span style={{fontWeight:600,color:C.green}}>{fmt(v,"EUR")}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:`${C.green}11`,borderRadius:6,marginTop:8,fontSize:13,fontWeight:700}}>
                  <span>Total produits</span><span style={{color:C.green}}>{fmt(totalProduits,"EUR")}</span>
                </div>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:10,padding:"6px 10px",background:`${C.red}11`,borderRadius:6}}>CHARGES</div>
                {CHARGES.map((c,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 8px",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                    <span style={{color:C.muted}}>{c.cat}</span><span style={{fontWeight:600,color:C.red}}>{fmt(c.mois,"EUR")}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:`${C.red}11`,borderRadius:6,marginTop:8,fontSize:13,fontWeight:700}}>
                  <span>Total charges</span><span style={{color:C.red}}>{fmt(totalCharges,"EUR")}</span>
                </div>
              </div>
            </div>
            <div style={{marginTop:16,padding:16,background:`linear-gradient(135deg,${C.card},#0A1A00)`,border:`1px solid ${C.gold}44`,borderRadius:10}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {[{l:"Résultat d'exploitation",v:resultatNet*0.85,c:C.teal},{l:"Résultat financier",v:0,c:C.blue},{l:"Résultat net",v:resultatNet,c:C.gold}].map(([l,v],i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{l}</div>
                    <div style={{fontSize:20,fontWeight:700,color:v>=0?C.gold:C.red}}>{fmt(v,"EUR")}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── TVA ── */}
      {tab==="tva"&&(
        <div>
          <MentionLegale/>
          {/* BLOC TVA CLAIR */}
          <div style={{background:`linear-gradient(135deg,${C.card},#1A0A00)`,border:`1px solid ${C.orange}44`,borderRadius:14,padding:20,marginBottom:14}}>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontWeight:700,color:C.orange,marginBottom:16}}>💰 Votre situation TVA — Mai 2026</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
              {/* CE QU'ON RÉCUPÈRE */}
              <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:10,padding:14,textAlign:"center"}}>
                <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>✅ TVA que vous récupérez</div>
                <div style={{fontSize:28,fontWeight:700,color:C.green,marginBottom:4}}>{fmt(tvaDeductible,"EUR")}</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>TVA payée sur vos achats et charges — vous la récupérez</div>
                <div style={{marginTop:8,fontSize:10,color:C.green,background:`${C.green}11`,borderRadius:6,padding:"4px 8px"}}>
                  Déduite de votre déclaration ✓
                </div>
              </div>
              {/* CE QU'ON A COLLECTÉ */}
              <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14,textAlign:"center"}}>
                <div style={{fontSize:10,color:C.orange,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>📥 TVA collectée sur ventes</div>
                <div style={{fontSize:28,fontWeight:700,color:C.orange,marginBottom:4}}>{fmt(tvaCollectee,"EUR")}</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>TVA facturée à vos clients — vous la reversez à l'État</div>
                <div style={{marginTop:8,fontSize:10,color:C.orange,background:`${C.orange}11`,borderRadius:6,padding:"4px 8px"}}>
                  Collectée pour l'État ⚠️
                </div>
              </div>
              {/* CE QU'ON DOIT PAYER */}
              <div style={{background:`${tvaDue>0?C.red:C.green}11`,border:`1px solid ${tvaDue>0?C.red:C.green}33`,borderRadius:10,padding:14,textAlign:"center"}}>
                <div style={{fontSize:10,color:tvaDue>0?C.red:C.green,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>
                  {tvaDue>0?"🔴 TVA À PAYER":"🟢 TVA CRÉDIT"}
                </div>
                <div style={{fontSize:28,fontWeight:700,color:tvaDue>0?C.red:C.green,marginBottom:4}}>{fmt(Math.abs(tvaDue),"EUR")}</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>
                  {tvaDue>0?"À reverser à l'État avant le 15 du mois":"Crédit TVA — remboursé ou reporté"}
                </div>
                <div style={{marginTop:8,fontSize:10,color:tvaDue>0?C.red:C.green,background:`${tvaDue>0?C.red:C.green}11`,borderRadius:6,padding:"4px 8px"}}>
                  {tvaDue>0?"⚠️ Échéance : 15/06/2026":"✓ Aucun paiement requis"}
                </div>
              </div>
            </div>
            {/* FORMULE SIMPLE */}
            <div style={{background:C.card2,borderRadius:8,padding:12,display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontSize:13,flexWrap:"wrap"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:2}}>TVA collectée</div>
                <div style={{fontWeight:700,color:C.orange}}>{fmt(tvaCollectee,"EUR")}</div>
              </div>
              <div style={{fontSize:18,color:C.muted}}>−</div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:2}}>TVA déductible</div>
                <div style={{fontWeight:700,color:C.green}}>{fmt(tvaDeductible,"EUR")}</div>
              </div>
              <div style={{fontSize:18,color:C.muted}}>=</div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:2}}>TVA à payer</div>
                <div style={{fontWeight:700,fontSize:16,color:tvaDue>0?C.red:C.green}}>{fmt(tvaDue,"EUR")}</div>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            <KPI label="TVA collectée" val={fmt(tvaCollectee,"EUR")} color={C.orange}/>
            <KPI label="TVA déductible" val={fmt(tvaDeductible,"EUR")} color={C.blue}/>
            <KPI label="TVA à reverser" val={fmt(tvaDue,"EUR")} color={tvaDue>0?C.red:C.green}/>
            <KPI label="Prochaine déclaration" val="15/06/2026" color={C.gold}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <Card style={{borderColor:`${C.orange}44`}}>
              <CT>📊 Déclaration CA3 — Mai 2026</CT>
              {[["CA HT",fmt(totalProduits,"EUR")],["TVA collectée (20%)",fmt(tvaCollectee,"EUR")],["TVA déductible",fmt(tvaDeductible,"EUR")],["TVA nette due",fmt(tvaDue,"EUR")]].map(([l,v],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{l}</span>
                  <span style={{fontWeight:i===3?700:500,color:i===3?C.orange:C.text}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:12,display:"flex",gap:8}}>
                <Btn v="orange" full onClick={()=>showToast("📤 Déclaration CA3 générée et envoyée sur Chorus Pro")}>📤 Générer CA3 Chorus Pro</Btn>
              </div>
            </Card>
            <Card>
              <CT>🌍 TVA par pays</CT>
              {[{pays:"🇫🇷 France",taux:"20% / 10% / 5.5%",statut:"Actif"},{pays:"🇸🇳 Sénégal",taux:"18%",statut:"Actif"},{pays:"🇨🇮 Côte d'Ivoire",taux:"18%",statut:"Actif"},{pays:"🇲🇦 Maroc",taux:"20%",statut:"Actif"},{pays:"🇦🇪 UAE",taux:"5%",statut:"Actif"},{pays:"🇬🇧 Royaume-Uni",taux:"20%",statut:"Inactif"}].map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                  <span style={{color:C.text}}>{p.pays}</span>
                  <div style={{display:"flex",gap:8}}>
                    <span style={{color:C.muted}}>{p.taux}</span>
                    <Pill label={p.statut} color={p.statut==="Actif"?C.green:C.muted}/>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── IA FISCALE ── */}
      {tab==="fiscal"&&(
        <div>
          <MentionLegale/>
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 Intelligence Fiscale — Claude IA</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.7}}>
              Claude analyse vos données comptables et génère des recommandations d'optimisation fiscale personnalisées. <b style={{color:C.orange}}>À valider par un expert-comptable agréé.</b>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Btn v="purple" onClick={()=>analyserIA("optimisation")}>{aiLoading?"🤖 Analyse...":"💡 Optimisation fiscale"}</Btn>
              <Btn v="blue" onClick={()=>analyserIA("anomalies")}>{aiLoading?"🤖 Analyse...":"🔍 Détecter anomalies"}</Btn>
              <Btn v="teal" onClick={()=>analyserIA("conseil")}>{aiLoading?"🤖 Analyse...":"📈 Conseils de gestion"}</Btn>
            </div>
          </Card>

          {aiLoading&&(
            <Card style={{textAlign:"center",padding:30,marginBottom:14}}>
              <div style={{fontSize:32,marginBottom:10}}>🤖</div>
              <div style={{fontSize:13,color:C.purple,fontWeight:600,marginBottom:4}}>Analyse comptable en cours...</div>
              <div style={{fontSize:11,color:C.muted}}>Analyse des écritures · Calcul des ratios · Identification des opportunités...</div>
            </Card>
          )}

          {aiResult&&!aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
              <CT>🤖 {aiResult.type==="optimisation"?"Recommandations d'optimisation fiscale":aiResult.type==="anomalies"?"Anomalies détectées":"Conseils de gestion"}</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14}}>{aiResult.text}</div>
              <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>
                ⚠️ Ces recommandations sont générées par IA à titre indicatif. Elles doivent être validées par un expert-comptable ou gestionnaire fiscal agréé avant toute application.
              </div>
            </Card>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>💡 Optimisations automatiques détectées</CT>
              {[
                {ico:"💼",l:"Frais de représentation",desc:"Déductibles à 100% si justifiés (clients, prospection)",eco:"~200€/mois"},
                {ico:"🚗",l:"Frais kilométriques",desc:"Barème fiscal 2026 — 0.529€/km pour véhicule 5CV",eco:"~150€/mois"},
                {ico:"📱",l:"Téléphone & Internet pro",desc:"Déductibles à 100% si usage professionnel exclusif",eco:"~80€/mois"},
                {ico:"🎓",l:"Frais de formation",desc:"Déductibles 100% et exonérés de charges sociales",eco:"~100€/mois"},
                {ico:"🏠",l:"Bureau à domicile",desc:"Déductible prorata surface si usage mixte",eco:"~180€/mois"},
              ].map((o,i)=>(
                <div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <span style={{fontSize:16,flexShrink:0}}>{o.ico}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:12,fontWeight:600,color:C.text}}>{o.l}</span>
                        <span style={{fontSize:11,color:C.green,fontWeight:600}}>{o.eco}</span>
                      </div>
                      <div style={{fontSize:10,color:C.muted}}>{o.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{marginTop:10,background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:7,padding:10}}>
                <div style={{fontSize:11,color:C.green,fontWeight:600}}>💰 Économie potentielle totale : ~710€/mois</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>À valider par votre expert-comptable</div>
              </div>
            </Card>
            <Card>
              <CT>📊 Ratios financiers clés</CT>
              {[
                {l:"Taux de marge brute",v:`${Math.round((resultatNet/totalProduits)*100)}%`,ref:">20%",ok:resultatNet/totalProduits>0.2},
                {l:"Ratio charges/CA",v:`${Math.round((totalCharges/totalProduits)*100)}%`,ref:"<70%",ok:totalCharges/totalProduits<0.7},
                {l:"Résultat net",v:fmt(resultatNet,"EUR"),ref:">0€",ok:resultatNet>0},
                {l:"TVA/CA",v:`${Math.round((tvaCollectee/totalProduits)*100)}%`,ref:"≈20%",ok:true},
                {l:"Charges salariales/CA",v:`${Math.round(((CHARGES.find(c=>c.cat==="Salaires")?.mois||0)/totalProduits)*100)}%`,ref:"<40%",ok:true},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{r.l}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontWeight:700,color:r.ok?C.green:C.orange}}>{r.v}</span>
                    <span style={{fontSize:10,color:C.muted}}>réf: {r.ref}</span>
                    <span>{r.ok?"✅":"⚠️"}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── EXPORTS ── */}
      {tab==="export"&&(
        <div>
          <MentionLegale/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[
              {ico:"📄",titre:"Bilan comptable PDF",desc:"Bilan actif/passif complet format A4",btn:"Générer PDF",c:C.gold},
              {ico:"📈",titre:"Compte de résultat PDF",desc:"Produits, charges, résultat net",btn:"Générer PDF",c:C.green},
              {ico:"📊",titre:"Grand Livre Excel",desc:"Toutes les écritures par compte",btn:"Exporter Excel",c:C.blue},
              {ico:"💰",titre:"Déclaration TVA CA3",desc:"Format officiel DGI / Chorus Pro",btn:"Générer CA3",c:C.orange},
              {ico:"🧾",titre:"Factur-X (France)",desc:"Format électronique légal 2026",btn:"Activer",c:C.teal},
              {ico:"🌍",titre:"Export Sage / EBP",desc:"Compatible logiciels comptables",btn:"Exporter",c:C.purple},
              {ico:"📋",titre:"Liasse fiscale",desc:"À valider par expert-comptable",btn:"Préparer",c:C.red},
              {ico:"🇺🇸",titre:"Export GAAP USA",desc:"Format IRS compatible",btn:"Exporter",c:C.blue},
              {ico:"🌍",titre:"Export SYSCOHADA",desc:"Format OHADA Afrique francophone",btn:"Exporter",c:C.gold},
            ].map((e,i)=>(
              <Card key={i} style={{borderColor:`${e.c}33`}}>
                <div style={{fontSize:28,marginBottom:8}}>{e.ico}</div>
                <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:4}}>{e.titre}</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:12,lineHeight:1.5}}>{e.desc}</div>
                <Btn v="ghost" full sm onClick={()=>showToast(`✓ ${e.titre} — Exporté !`)}>{e.btn}</Btn>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PageTresorerie=()=>{
  const [tab,setTab]=useState("dashboard");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};
  const [seuil,setSeuil]=useState(3000);
  const [editSeuil,setEditSeuil]=useState(false);
  const [seuilInput,setSeuilInput]=useState("3000");
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);

  const [mouvements,setMouvements]=useState([
    {id:"TRE-001",date:"01/05/2026",libelle:"Paiement Sofia Riad — Airbnb",type:"entree",montant:1200,categorie:"Prestation",statut:"confirmé"},
    {id:"TRE-002",date:"02/05/2026",libelle:"Paiement Ahmed Al-Rashid — Jet",type:"entree",montant:4800,categorie:"Prestation",statut:"confirmé"},
    {id:"TRE-003",date:"03/05/2026",libelle:"Salaires équipe",type:"sortie",montant:4800,categorie:"Salaires",statut:"confirmé"},
    {id:"TRE-004",date:"05/05/2026",libelle:"Fournitures nettoyage",type:"sortie",montant:320,categorie:"Fournitures",statut:"confirmé"},
    {id:"TRE-005",date:"06/05/2026",libelle:"Paiement Yacht Client VIP",type:"entree",montant:6200,categorie:"Prestation",statut:"confirmé"},
    {id:"TRE-006",date:"08/05/2026",libelle:"Loyer bureau",type:"sortie",montant:800,categorie:"Loyer",statut:"confirmé"},
    {id:"TRE-007",date:"10/05/2026",libelle:"Commission partenaire",type:"sortie",montant:450,categorie:"Commission",statut:"confirmé"},
    {id:"TRE-008",date:"12/05/2026",libelle:"Paiement Marc Dupont — Bureaux",type:"entree",montant:580,categorie:"Prestation",statut:"confirmé"},
    {id:"TRE-009",date:"20/05/2026",libelle:"Paiement prévu — Isabelle M.",type:"entree",montant:420,categorie:"Prestation",statut:"prévu"},
    {id:"TRE-010",date:"28/05/2026",libelle:"Salaires équipe Mai",type:"sortie",montant:4800,categorie:"Salaires",statut:"prévu"},
    {id:"TRE-011",date:"30/05/2026",libelle:"TVA Mai",type:"sortie",montant:1240,categorie:"Fiscal",statut:"prévu"},
    {id:"TRE-012",date:"15/06/2026",libelle:"Mission Yacht prévue",type:"entree",montant:8000,categorie:"Prestation",statut:"prévu"},
  ]);

  const [modal,setModal]=useState(false);
  const [newMvt,setNewMvt]=useState({date:"",libelle:"",type:"entree",montant:"",categorie:"Prestation",statut:"confirmé"});

  const CATEGORIES=["Prestation","Salaires","Fournitures","Loyer","Commission","Fiscal","Autre"];

  // Calculs
  const entrees=mouvements.filter(m=>m.type==="entree"&&m.statut==="confirmé").reduce((s,m)=>s+m.montant,0);
  const sorties=mouvements.filter(m=>m.type==="sortie"&&m.statut==="confirmé").reduce((s,m)=>s+m.montant,0);
  const solde=entrees-sorties;
  const entreesPrevues=mouvements.filter(m=>m.type==="entree"&&m.statut==="prévu").reduce((s,m)=>s+m.montant,0);
  const sortiesPrevues=mouvements.filter(m=>m.type==="sortie"&&m.statut==="prévu").reduce((s,m)=>s+m.montant,0);
  const soldePrev30=solde+entreesPrevues-sortiesPrevues;
  const soldePrev60=soldePrev30*1.12;
  const soldePrev90=soldePrev30*1.22;
  const max=Math.max(...TRESORERIE_90J.map(s=>s.sol),solde);

  const analyserIA=async()=>{
    setAiLoading(true);
    try{
      const prompt=`Tu es expert en gestion de trésorerie. Analyse ces données et donne 3 recommandations concrètes.

Trésorerie actuelle : ${solde.toLocaleString("fr")}€
Entrées confirmées : ${entrees.toLocaleString("fr")}€
Sorties confirmées : ${sorties.toLocaleString("fr")}€
Entrées prévues : ${entreesPrevues.toLocaleString("fr")}€
Sorties prévues : ${sortiesPrevues.toLocaleString("fr")}€
Seuil alerte : ${seuil.toLocaleString("fr")}€
Prévision 30j : ${soldePrev30.toLocaleString("fr")}€
Prévision 90j : ${soldePrev90.toLocaleString("fr")}€

Donne 3 recommandations courtes et actionnables pour optimiser la trésorerie.`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiResult(data.content?.[0]?.text||"Analyse non disponible");
    }catch(e){setAiResult("Erreur — Vérifiez la connexion");}
    setAiLoading(false);
  };

  const TABS=[
    {id:"dashboard",label:"📊 Dashboard"},
    {id:"mouvements",label:"📋 Mouvements"},
    {id:"previsions",label:"🔮 Prévisions 90j"},
    {id:"ia",label:"🤖 Analyse IA"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px #00000066"}}>{toast.msg}</div>}

      {/* MODAL AJOUTER MOUVEMENT */}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:440}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouveau mouvement</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* Toggle Entrée / Sortie */}
              <div style={{display:"flex",background:C.card2,borderRadius:8,padding:3,gap:3}}>
                {[{v:"entree",l:"📥 Entrée d'argent"},{v:"sortie",l:"📤 Sortie d'argent"}].map(t=>(
                  <button key={t.v} onClick={()=>setNewMvt(p=>({...p,type:t.v}))} style={{flex:1,padding:"7px",border:"none",borderRadius:6,background:newMvt.type===t.v?(t.v==="entree"?C.green:C.red):"transparent",color:newMvt.type===t.v?"#000":C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>
                    {t.l}
                  </button>
                ))}
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Date *</div><Inp type="date" value={newMvt.date} onChange={e=>setNewMvt(p=>({...p,date:e.target.value}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Libellé *</div><Inp placeholder="Ex: Paiement Sofia Riad" value={newMvt.libelle} onChange={e=>setNewMvt(p=>({...p,libelle:e.target.value}))} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Montant (€) *</div><Inp type="number" placeholder="500" value={newMvt.montant} onChange={e=>setNewMvt(p=>({...p,montant:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Catégorie</div><Sel value={newMvt.categorie} onChange={e=>setNewMvt(p=>({...p,categorie:e.target.value}))} options={CATEGORIES.map(c=>({v:c,l:c}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Statut</div><Sel value={newMvt.statut} onChange={e=>setNewMvt(p=>({...p,statut:e.target.value}))} options={[{v:"confirmé",l:"✓ Confirmé"},{v:"prévu",l:"○ Prévu"}]} style={{width:"100%"}}/></div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModal(false)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newMvt.libelle||!newMvt.date||!newMvt.montant)return;
                const id=`TRE-${String(mouvements.length+1).padStart(3,"0")}`;
                setMouvements(p=>[...p,{id,...newMvt,montant:Number(newMvt.montant)}]);
                setModal(false);
                setNewMvt({date:"",libelle:"",type:"entree",montant:"",categorie:"Prestation",statut:"confirmé"});
                showToast("✓ Mouvement ajouté !");
              }}>✓ Ajouter</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="Cash-flow · Prévisions 90j · Alertes · IA">◑ Trésorerie 90 jours</STitle>
        <Btn v="gold" onClick={()=>setModal(true)}>+ Mouvement</Btn>
      </div>

      {/* BLOC PRINCIPAL — CE QUI RENTRE / CE QUI SORT / SOLDE */}
      <div style={{background:`linear-gradient(135deg,${C.card},#001A14)`,border:`1px solid ${C.teal}44`,borderRadius:14,padding:20,marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
          {/* CE QUI RENTRE */}
          <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:10,padding:14,textAlign:"center"}}>
            <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>📥 Ce qui rentre</div>
            <div style={{fontSize:28,fontWeight:700,color:C.green,marginBottom:4}}>{fmt(entrees,"EUR")}</div>
            <div style={{fontSize:11,color:C.muted}}>Confirmé ce mois</div>
            <div style={{fontSize:10,color:C.green,marginTop:4}}>+ {fmt(entreesPrevues,"EUR")} prévu</div>
          </div>
          {/* CE QUI SORT */}
          <div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:10,padding:14,textAlign:"center"}}>
            <div style={{fontSize:10,color:C.red,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>📤 Ce qui sort</div>
            <div style={{fontSize:28,fontWeight:700,color:C.red,marginBottom:4}}>{fmt(sorties,"EUR")}</div>
            <div style={{fontSize:11,color:C.muted}}>Confirmé ce mois</div>
            <div style={{fontSize:10,color:C.red,marginTop:4}}>+ {fmt(sortiesPrevues,"EUR")} prévu</div>
          </div>
          {/* SOLDE NET */}
          <div style={{background:`${solde>seuil?C.gold:C.red}11`,border:`1px solid ${solde>seuil?C.gold:C.red}33`,borderRadius:10,padding:14,textAlign:"center"}}>
            <div style={{fontSize:10,color:solde>seuil?C.gold:C.red,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>
              {solde>seuil?"✅ SOLDE NET":"⚠️ ALERTE SOLDE"}
            </div>
            <div style={{fontSize:28,fontWeight:700,color:solde>seuil?C.gold:C.red,marginBottom:4,cursor:"pointer"}} onClick={()=>setEditSeuil(true)}>
              {fmt(solde,"EUR")}
            </div>
            <div style={{fontSize:11,color:C.muted}}>Seuil alerte : {fmt(seuil,"EUR")}</div>
            {editSeuil?(
              <div style={{display:"flex",gap:4,marginTop:6,justifyContent:"center"}}>
                <input type="number" value={seuilInput} onChange={e=>setSeuilInput(e.target.value)} style={{width:80,background:C.card2,border:`1px solid ${C.border}`,borderRadius:5,padding:"3px 6px",color:C.text,fontFamily:"inherit",fontSize:11}}/>
                <button onClick={()=>{setSeuil(Number(seuilInput));setEditSeuil(false);showToast("✓ Seuil mis à jour");}} style={{background:C.gold,border:"none",borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:10,fontWeight:700,color:"#000",fontFamily:"inherit"}}>✓</button>
              </div>
            ):(
              <div style={{fontSize:10,color:C.muted,marginTop:4,cursor:"pointer"}} onClick={()=>setEditSeuil(true)}>✏️ Modifier le seuil</div>
            )}
          </div>
        </div>
        {/* BARRE VISUELLE */}
        <div style={{background:C.card2,borderRadius:8,padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:6}}>
            <span style={{color:C.muted}}>Utilisation trésorerie</span>
            <span style={{color:sorties/entrees>0.8?C.red:C.gold,fontWeight:600}}>{Math.round((sorties/entrees)*100)}% utilisé</span>
          </div>
          <div style={{height:8,borderRadius:4,background:C.border}}>
            <div style={{height:"100%",width:`${Math.min((sorties/entrees)*100,100)}%`,background:sorties/entrees>0.8?C.red:C.gold,borderRadius:4,transition:"width 0.5s"}}/>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Solde actuel" val={fmt(solde,"EUR")} color={solde>seuil?C.green:C.red}/>
        <KPI label="Prévu 30 jours" val={fmt(soldePrev30,"EUR")} color={C.gold}/>
        <KPI label="Prévu 60 jours" val={fmt(soldePrev60,"EUR")} color={C.teal}/>
        <KPI label="Prévu 90 jours" val={fmt(soldePrev90,"EUR")} color={C.purple}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── DASHBOARD ── */}
      {tab==="dashboard"&&(
        <div>
          {/* GRAPHIQUE */}
          <Card style={{marginBottom:14}}>
            <CT>📊 Évolution trésorerie — 12 semaines</CT>
            <div style={{display:"flex",gap:6,alignItems:"flex-end",height:120,marginBottom:8}}>
              {TRESORERIE_90J.map((s,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:9,color:s.pred?C.green:C.gold,fontWeight:500}}>{Math.round(s.sol/1000)}k</div>
                  <div style={{width:"100%",height:`${Math.max((s.sol/max)*110,4)}px`,background:s.pred?`${C.green}22`:`${C.gold}22`,border:`1px solid ${s.pred?C.green:C.gold}44`,borderRadius:"3px 3px 0 0",transition:"height 0.5s"}}/>
                  <div style={{fontSize:8,color:s.pred?C.green:C.muted,textAlign:"center"}}>{s.sem.split(" ")[0]}{s.pred?" *":""}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:14,fontSize:10}}>
              <div style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:10,height:4,background:C.gold+"88",borderRadius:2}}/><span style={{color:C.muted}}>Réalisé</span></div>
              <div style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:10,height:4,background:C.green+"88",borderRadius:2}}/><span style={{color:C.muted}}>Prévu *</span></div>
              {solde<=seuil&&<div style={{marginLeft:"auto",color:C.orange,fontWeight:600}}>⚠️ Solde sous le seuil d'alerte</div>}
            </div>
          </Card>

          {/* TOP ENTRÉES / SORTIES */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{borderColor:`${C.green}33`}}>
              <CT>📥 Top entrées ce mois</CT>
              {mouvements.filter(m=>m.type==="entree").sort((a,b)=>b.montant-a.montant).slice(0,5).map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <div>
                    <div style={{color:C.text,fontWeight:500}}>{m.libelle}</div>
                    <div style={{fontSize:10,color:C.muted}}>{m.date} · {m.categorie}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{color:C.green,fontWeight:700}}>+{fmt(m.montant,"EUR")}</span>
                    <Pill label={m.statut==="confirmé"?"✓":"○"} color={m.statut==="confirmé"?C.green:C.muted}/>
                  </div>
                </div>
              ))}
            </Card>
            <Card style={{borderColor:`${C.red}33`}}>
              <CT>📤 Top sorties ce mois</CT>
              {mouvements.filter(m=>m.type==="sortie").sort((a,b)=>b.montant-a.montant).slice(0,5).map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <div>
                    <div style={{color:C.text,fontWeight:500}}>{m.libelle}</div>
                    <div style={{fontSize:10,color:C.muted}}>{m.date} · {m.categorie}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{color:C.red,fontWeight:700}}>-{fmt(m.montant,"EUR")}</span>
                    <Pill label={m.statut==="confirmé"?"✓":"○"} color={m.statut==="confirmé"?C.green:C.muted}/>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── MOUVEMENTS ── */}
      {tab==="mouvements"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>setModal(true)}>+ Ajouter mouvement</Btn>
          </div>
          <Card>
            <TH heads={["Réf.","Date","Libellé","Type","Montant","Catégorie","Statut","Action"]} rows={mouvements.map((m,i)=>(
              <tr key={i}>
                <Td><span style={{fontFamily:"monospace",fontSize:10,color:C.gold}}>{m.id}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{m.date}</span></Td>
                <Td><span style={{fontWeight:500,fontSize:12}}>{m.libelle}</span></Td>
                <Td><Pill label={m.type==="entree"?"📥 Entrée":"📤 Sortie"} color={m.type==="entree"?C.green:C.red}/></Td>
                <Td><span style={{fontWeight:700,color:m.type==="entree"?C.green:C.red,fontSize:13}}>{m.type==="entree"?"+":"-"}{fmt(m.montant,"EUR")}</span></Td>
                <Td><Pill label={m.categorie} color={C.blue}/></Td>
                <Td><Pill label={m.statut==="confirmé"?"✓ Confirmé":"○ Prévu"} color={m.statut==="confirmé"?C.green:C.muted}/></Td>
                <Td><Btn sm v="red" onClick={()=>{setMouvements(p=>p.filter((_,j)=>j!==i));showToast("Supprimé","#EF4444");}}>🗑</Btn></Td>
              </tr>
            ))}/>
            <div style={{marginTop:10,display:"flex",justifyContent:"space-between",padding:"10px 12px",background:C.card2,borderRadius:8}}>
              <span style={{fontSize:12,color:C.muted}}>Totaux confirmés</span>
              <div style={{display:"flex",gap:20}}>
                <span style={{color:C.green,fontWeight:700}}>Entrées : +{fmt(entrees,"EUR")}</span>
                <span style={{color:C.red,fontWeight:700}}>Sorties : -{fmt(sorties,"EUR")}</span>
                <span style={{color:C.gold,fontWeight:700}}>Solde : {fmt(solde,"EUR")}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── PRÉVISIONS 90J ── */}
      {tab==="previsions"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
            {[{l:"Solde prévu dans 30j",v:soldePrev30,c:C.gold,desc:"Basé sur les mouvements prévus"},{l:"Solde prévu dans 60j",v:soldePrev60,c:C.teal,desc:"Tendance +12% mensuelle"},{l:"Solde prévu dans 90j",v:soldePrev90,c:C.purple,desc:"Projection IA sur 3 mois"}].map((p,i)=>(
              <Card key={i} style={{borderColor:`${p.c}44`,textAlign:"center"}}>
                <div style={{fontSize:10,color:p.c,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>{p.l}</div>
                <div style={{fontSize:28,fontWeight:700,color:p.v>seuil?p.c:C.red,marginBottom:4}}>{fmt(p.v,"EUR")}</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{p.desc}</div>
                <Pill label={p.v>seuil?"✅ Au-dessus du seuil":"⚠️ Sous le seuil"} color={p.v>seuil?C.green:C.red}/>
              </Card>
            ))}
          </div>

          <Card style={{marginBottom:14}}>
            <CT>📅 Mouvements prévus</CT>
            <TH heads={["Date","Libellé","Type","Montant","Catégorie"]} rows={mouvements.filter(m=>m.statut==="prévu").map((m,i)=>(
              <tr key={i}>
                <Td><span style={{fontSize:11,color:C.muted}}>{m.date}</span></Td>
                <Td><span style={{fontWeight:500}}>{m.libelle}</span></Td>
                <Td><Pill label={m.type==="entree"?"📥 Entrée":"📤 Sortie"} color={m.type==="entree"?C.green:C.red}/></Td>
                <Td><span style={{fontWeight:700,color:m.type==="entree"?C.green:C.red}}>{m.type==="entree"?"+":"-"}{fmt(m.montant,"EUR")}</span></Td>
                <Td><Pill label={m.categorie} color={C.blue}/></Td>
              </tr>
            ))}/>
          </Card>

          <Card style={{borderColor:`${C.teal}44`}}>
            <CT>⚙️ Configurer les alertes</CT>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                <span style={{color:C.muted}}>Seuil minimum de trésorerie</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <Inp type="number" value={seuilInput} onChange={e=>setSeuilInput(e.target.value)} style={{width:90}}/>
                  <Btn sm v="gold" onClick={()=>{setSeuil(Number(seuilInput));showToast("✓ Seuil mis à jour");}}>Sauvegarder</Btn>
                </div>
              </div>
              {[{l:"Alerte WhatsApp si solde sous seuil",actif:true},{l:"Alerte 7j avant une grosse sortie prévue",actif:true},{l:"Rapport hebdo trésorerie",actif:true},{l:"Alerte si dépense imprévue > 1 000€",actif:false}].map((a,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{a.l}</span>
                  <Pill label={a.actif?"✓ Actif":"○ Inactif"} color={a.actif?C.green:C.muted}/>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── IA ── */}
      {tab==="ia"&&(
        <div>
          {/* ANALYSE IA */}
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 Analyse IA Trésorerie — Claude</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.7}}>
              Claude analyse vos flux de trésorerie et génère des recommandations pour optimiser votre cash-flow.
            </div>
            <Btn v="purple" onClick={analyserIA}>{aiLoading?"🤖 Analyse en cours...":"🤖 Analyser ma trésorerie"}</Btn>
          </Card>

          {aiLoading&&(
            <Card style={{textAlign:"center",padding:30,marginBottom:14}}>
              <div style={{fontSize:32,marginBottom:8}}>🤖</div>
              <div style={{fontSize:13,color:C.purple,fontWeight:600}}>Analyse des flux en cours...</div>
            </Card>
          )}

          {aiResult&&!aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
              <CT>🤖 Recommandations Claude IA</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiResult}</div>
            </Card>
          )}

          {/* SCÉNARIOS */}
          <Card style={{marginBottom:14,borderColor:`${C.teal}44`}}>
            <CT>📊 Scénarios de trésorerie</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Simulez l'impact de différentes situations sur votre trésorerie à 90 jours.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
              {[
                {l:"🔴 Pessimiste",desc:"Si vous perdez 2 clients",impact:-4800,c:C.red},
                {l:"🟡 Réaliste",desc:"Tendance actuelle",impact:soldePrev90-solde,c:C.gold},
                {l:"🟢 Optimiste",desc:"Si Monaco Yacht Club signe",impact:172800*0.25,c:C.green},
              ].map((s,i)=>(
                <div key={i} style={{background:`${s.c}11`,border:`1px solid ${s.c}33`,borderRadius:10,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:12,fontWeight:600,color:s.c,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{s.desc}</div>
                  <div style={{fontSize:18,fontWeight:700,color:s.c,marginBottom:4}}>{fmt(solde+s.impact,"EUR")}</div>
                  <div style={{fontSize:10,color:s.impact>=0?C.green:C.red}}>{s.impact>=0?"+":""}{fmt(s.impact,"EUR")}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* OBJECTIF TRÉSORERIE */}
          <Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
            <CT>🎯 Objectif de trésorerie</CT>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Définissez votre objectif de trésorerie à 3 mois :</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Objectif cible (€)</div><Inp type="number" placeholder="50000" style={{width:"100%"}}/></div>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Délai</div><Sel value="" onChange={()=>{}} options={[{v:"1",l:"1 mois"},{v:"2",l:"2 mois"},{v:"3",l:"3 mois"},{v:"6",l:"6 mois"}]} style={{width:"100%"}}/></div>
                  <Btn v="gold" full onClick={()=>showToast("🎯 Objectif défini ! Tymeless OS calcule le plan pour y arriver.")}>Définir l'objectif</Btn>
                </div>
              </div>
              <div style={{background:C.card2,borderRadius:10,padding:12}}>
                <div style={{fontSize:11,fontWeight:600,color:C.gold,marginBottom:8}}>Pour atteindre 50 000€ en 3 mois :</div>
                {[
                  {ico:"📋",txt:"12 missions supplémentaires à 400€"},
                  {ico:"🤝",txt:"2 nouveaux contrats récurrents"},
                  {ico:"✂️",txt:"Réduire les charges de 200€/mois"},
                  {ico:"📲",txt:"Relancer 3 clients inactifs"},
                ].map((a,i)=>(
                  <div key={i} style={{display:"flex",gap:8,fontSize:11,color:C.muted,marginBottom:5}}>
                    <span>{a.ico}</span><span>{a.txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* CONNEXIONS INTER-MODULES */}
          <Card style={{marginBottom:14,borderColor:`${C.blue}44`}}>
            <CT>🔗 Synchronisation automatique inter-modules</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Ces mouvements sont ajoutés automatiquement depuis les autres modules :</div>
            {[
              {ico:"📅",src:"Planning",desc:"Mission créée → entrée prévue automatiquement",actif:true},
              {ico:"📋",src:"Devis",desc:"Devis validé → entrée confirmée automatiquement",actif:true},
              {ico:"💳",src:"Wallet",desc:"Paiement effectué → sortie enregistrée automatiquement",actif:true},
              {ico:"🤝",src:"Partenaires",desc:"Commission due → sortie prévue automatiquement",actif:true},
              {ico:"📊",src:"Comptabilité",desc:"Écriture comptable → synchronisée en trésorerie",actif:false},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:16}}>{s.ico}</span>
                  <div><div style={{color:C.text,fontWeight:500}}>{s.src}</div><div style={{color:C.muted,fontSize:10}}>{s.desc}</div></div>
                </div>
                <Pill label={s.actif?"✓ Actif":"○ Inactif"} color={s.actif?C.green:C.muted}/>
              </div>
            ))}
          </Card>

          {/* MULTI-DEVISES */}
          <Card style={{marginBottom:14,borderColor:`${C.teal}44`}}>
            <CT>🌍 Consolidation multi-devises</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Tous vos flux dans différentes devises consolidés automatiquement en EUR :</div>
            {[
              {devise:"EUR",flag:"🇪🇺",entrees:entrees,sorties:sorties,solde:solde},
              {devise:"XOF",flag:"🌍",entrees:4200000,sorties:1800000,solde:2400000},
              {devise:"MAD",flag:"🇲🇦",entrees:12000,sorties:5000,solde:7000},
              {devise:"AED",flag:"🇦🇪",entrees:8500,sorties:2000,solde:6500},
            ].map((d,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:16}}>{d.flag}</span>
                  <span style={{fontWeight:600,color:C.text}}>{d.devise}</span>
                </div>
                <div style={{display:"flex",gap:14}}>
                  <span style={{color:C.green}}>+{d.entrees.toLocaleString("fr")}</span>
                  <span style={{color:C.red}}>-{d.sorties.toLocaleString("fr")}</span>
                  <span style={{fontWeight:700,color:C.gold}}>{d.solde.toLocaleString("fr")}</span>
                </div>
              </div>
            ))}
            <div style={{marginTop:10,padding:"8px 0",display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700}}>
              <span style={{color:C.gold}}>Total consolidé EUR</span>
              <span style={{color:C.gold}}>{fmt(solde+2400000/655+7000/10.8+6500/3.67,"EUR")}</span>
            </div>
          </Card>

          {/* RAPPORT WHATSAPP AUTO */}
          <Card style={{borderColor:`${C.green}44`}}>
            <CT>📱 Rapport WhatsApp automatique</CT>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Chaque lundi matin à 8h, recevez automatiquement sur WhatsApp :</div>
                {["Solde actuel","Entrées de la semaine","Sorties de la semaine","Alertes si solde sous seuil","Top 3 missions à facturer"].map((l,i)=>(
                  <div key={i} style={{display:"flex",gap:8,fontSize:11,color:C.muted,marginBottom:4,alignItems:"center"}}>
                    <span style={{color:C.green,fontSize:12}}>✓</span><span>{l}</span>
                  </div>
                ))}
                <div style={{marginTop:10}}><Btn v="green" full onClick={()=>showToast("📲 Rapport WhatsApp activé — chaque lundi 8h")}>📲 Activer le rapport</Btn></div>
              </div>
              <div style={{background:"#075E54",borderRadius:10,padding:12}}>
                <div style={{fontSize:9,color:"#25D366",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>💬 Aperçu rapport WA</div>
                <div style={{background:"#128C7E",borderRadius:"12px 12px 12px 2px",padding:"10px 12px",fontSize:11,color:"#fff",lineHeight:1.8}}>
                  📊 <b>Trésorerie Tymeless — Lundi</b><br/>
                  💰 Solde : <b>{fmt(solde,"EUR")}</b><br/>
                  📥 Entrées sem. : +{fmt(entrees*0.25,"EUR")}<br/>
                  📤 Sorties sem. : -{fmt(sorties*0.25,"EUR")}<br/>
                  {solde>seuil?"✅ Solde OK":"⚠️ Alerte seuil"}<br/>
                  <span style={{fontSize:9,color:"#aaa"}}>Tymeless OS — Rapport auto</span>
                </div>
              </div>
            </div>
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
            <Card>
              <CT>📊 Santé de la trésorerie</CT>
              {[
                {l:"Ratio liquidité",v:`${Math.round((solde/sorties)*100)}%`,ref:">100%",ok:solde>sorties,desc:"Solde / Sorties mensuelles"},
                {l:"Couverture charges",v:`${Math.round(solde/sorties*30)} jours`,ref:">30j",ok:solde/sorties>1,desc:"Jours de charges couverts"},
                {l:"Taux entrées/sorties",v:`${Math.round((entrees/sorties)*100)}%`,ref:">110%",ok:entrees/sorties>1.1,desc:"Entrées vs Sorties"},
              ].map((r,i)=>(
                <div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                    <span style={{fontSize:12,color:C.text}}>{r.l}</span>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontWeight:700,color:r.ok?C.green:C.orange}}>{r.v}</span>
                      <span>{r.ok?"✅":"⚠️"}</span>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:C.muted}}>{r.desc} · Réf : {r.ref}</div>
                </div>
              ))}
            </Card>
            <Card>
              <CT>📈 Par catégorie de sortie</CT>
              {CATEGORIES.map((cat,i)=>{
                const total=mouvements.filter(m=>m.type==="sortie"&&m.categorie===cat).reduce((s,m)=>s+m.montant,0);
                if(total===0)return null;
                return(
                  <div key={i} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{color:C.muted}}>{cat}</span>
                      <span style={{color:C.red,fontWeight:600}}>{fmt(total,"EUR")}</span>
                    </div>
                    <div style={{height:4,borderRadius:2,background:C.border}}>
                      <div style={{height:"100%",width:`${Math.min((total/sorties)*100,100)}%`,background:C.red,borderRadius:2}}/>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};




const PageAnalytique=()=>{
  const [tab,setTab]=useState("ca");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);
  const [objectifs,setObjectifs]=useState([
    {id:1,label:"CA mensuel Mai",cible:28000,actuel:24380,unite:"€"},
    {id:2,label:"Nouveaux clients Mai",cible:5,actuel:3,unite:"clients"},
    {id:3,label:"Marge nette",cible:65,actuel:61,unite:"%"},
    {id:4,label:"Missions terminées",cible:20,actuel:14,unite:"missions"},
  ]);
  const [modalObj,setModalObj]=useState(false);
  const [newObj,setNewObj]=useState({label:"",cible:"",actuel:"",unite:"€"});

  const mois=[
    {m:"Jan",ca:16200,charges:7100,pred:false},
    {m:"Fév",ca:14800,charges:6900,pred:false},
    {m:"Mar",ca:21600,charges:8200,pred:false},
    {m:"Avr",ca:24380,charges:9400,pred:false},
    {m:"Mai",ca:26400,charges:9800,pred:true},
    {m:"Jun",ca:28100,charges:10200,pred:true},
    {m:"Jul",ca:29800,charges:10500,pred:true},
    {m:"Aoû",ca:27200,charges:9800,pred:true},
    {m:"Sep",ca:31000,charges:11000,pred:true},
    {m:"Oct",ca:33500,charges:11500,pred:true},
    {m:"Nov",ca:35200,charges:12000,pred:true},
    {m:"Déc",ca:38000,charges:13000,pred:true},
  ];

  const services=[
    {nom:"Airbnb",ca:10240,marge:68,missions:18,couleur:C.gold},
    {nom:"Jet Privé",ca:7200,marge:80,missions:4,couleur:C.blue},
    {nom:"Yacht",ca:3600,marge:72,missions:3,couleur:C.teal},
    {nom:"Résidentiel",ca:2100,marge:50,missions:12,couleur:C.green},
    {nom:"Bureaux",ca:720,marge:60,missions:5,couleur:C.orange},
    {nom:"Rapatriement",ca:520,marge:75,missions:2,couleur:C.purple},
  ];

  const pays=[
    {pays:"🇫🇷 France",ca:18200,clients:8,pct:75},
    {pays:"🇦🇪 UAE",ca:4800,clients:1,pct:20},
    {pays:"🇸🇳 Sénégal",ca:900,clients:2,pct:4},
    {pays:"🇲🇦 Maroc",ca:480,clients:1,pct:2},
  ];

  const caActuel=mois.find(m=>!m.pred)?.ca||24380;
  const caPrec=16200;
  const croissance=Math.round(((caActuel-caPrec)/caPrec)*100);
  const caAnnuelPrev=mois.reduce((s,m)=>s+m.ca,0);
  const maxCA=Math.max(...mois.map(m=>m.ca));

  const analyserIA=async()=>{
    setAiLoading(true);
    try{
      const prompt=`Tu es expert en analytics business. Analyse ces données et donne 3 insights actionnables.

CA actuel : ${caActuel.toLocaleString("fr")}€/mois
Croissance : +${croissance}% vs Jan
CA annuel prévu : ${caAnnuelPrev.toLocaleString("fr")}€
Services : ${services.map(s=>`${s.nom}(${s.ca.toLocaleString("fr")}€,${s.marge}%marge)`).join(", ")}
Pays : ${pays.map(p=>`${p.pays}(${p.pct}%)`).join(", ")}

3 insights courts et très concrets pour maximiser le CA. Sois direct.`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiResult(data.content?.[0]?.text||"Analyse non disponible");
    }catch(e){setAiResult("Erreur — Vérifiez la connexion");}
    setAiLoading(false);
  };

  const TABS=[
    {id:"ca",label:"📈 CA & Revenus"},
    {id:"services",label:"🏷️ Par service"},
    {id:"clients",label:"🌍 Par pays"},
    {id:"objectifs",label:"🎯 Objectifs"},
    {id:"predictions",label:"🔮 Prédictions"},
    {id:"ia",label:"🤖 IA"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {modalObj&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:380}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:14}}>+ Nouvel objectif</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[["Objectif","label","text","Ex: CA mensuel Juin"],["Cible","cible","number","30000"],["Actuel","actuel","number","24380"],["Unité","unite","text","€"]].map(([l,k,t,ph])=>(
                <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={newObj[k]} onChange={e=>setNewObj(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModalObj(false)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newObj.label||!newObj.cible)return;
                setObjectifs(p=>[...p,{id:Date.now(),...newObj,cible:Number(newObj.cible),actuel:Number(newObj.actuel)}]);
                setModalObj(false);
                setNewObj({label:"",cible:"",actuel:"",unite:"€"});
                showToast("✓ Objectif ajouté !");
              }}>Ajouter</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="CA · Services · Prédictions IA · Objectifs · Multi-pays">◒ Analytique & Prédiction CA</STitle>
        <Btn v="gold" onClick={analyserIA}>{aiLoading?"🤖...":"🤖 Analyser avec Claude"}</Btn>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="CA ce mois" val={fmt(caActuel,"EUR")} color={C.gold}/>
        <KPI label="Croissance vs Jan" val={`+${croissance}%`} color={C.green}/>
        <KPI label="CA annuel prévu" val={fmt(caAnnuelPrev,"EUR")} color={C.teal}/>
        <KPI label="Marge moyenne" val="61%" color={C.blue}/>
        <KPI label="Meilleur service" val="Jet Privé 80%" color={C.purple}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── CA & REVENUS ── */}
      {tab==="ca"&&(
        <div>
          <Card style={{marginBottom:14}}>
            <CT>📈 Évolution CA mensuel — Réel vs Prévu</CT>
            <div style={{display:"flex",gap:6,alignItems:"flex-end",height:130,marginBottom:10}}>
              {mois.map((m,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:9,color:m.pred?C.green:C.gold,fontWeight:500}}>{(m.ca/1000).toFixed(0)}k</div>
                  <div style={{width:"100%",display:"flex",gap:1,alignItems:"flex-end",height:110}}>
                    <div style={{flex:1,height:`${(m.ca/maxCA)*105}px`,background:m.pred?`${C.green}22`:`${C.gold}22`,border:`1px solid ${m.pred?C.green:C.gold}44`,borderRadius:"2px 2px 0 0",transition:"height 0.5s"}}/>
                    <div style={{flex:1,height:`${(m.charges/maxCA)*105}px`,background:`${C.red}22`,border:`1px solid ${C.red}33`,borderRadius:"2px 2px 0 0"}}/>
                  </div>
                  <div style={{fontSize:8,color:m.pred?C.green:C.muted,textAlign:"center"}}>{m.m}{m.pred?"*":""}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:14,fontSize:10}}>
              <div style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:10,height:4,background:`${C.gold}88`,borderRadius:2}}/><span style={{color:C.muted}}>CA réel</span></div>
              <div style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:10,height:4,background:`${C.green}88`,borderRadius:2}}/><span style={{color:C.muted}}>CA prévu *</span></div>
              <div style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:10,height:4,background:`${C.red}88`,borderRadius:2}}/><span style={{color:C.muted}}>Charges</span></div>
              <div style={{marginLeft:"auto",color:C.green,fontWeight:600}}>CA annuel prévu : {fmt(caAnnuelPrev,"EUR")}</div>
            </div>
          </Card>

          {/* COMPARAISON N vs N-1 */}
          <Card style={{marginBottom:14}}>
            <CT>📊 Comparaison N vs N-1</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[{l:"Jan",n:16200,n1:12100},{l:"Fév",n:14800,n1:11500},{l:"Mar",n:21600,n1:15800},{l:"Avr",n:24380,n1:17200}].map((m,i)=>{
                const diff=Math.round(((m.n-m.n1)/m.n1)*100);
                return(
                  <div key={i} style={{background:C.card2,borderRadius:8,padding:10,textAlign:"center"}}>
                    <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{m.l}</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.gold}}>{fmt(m.n,"EUR")}</div>
                    <div style={{fontSize:10,color:C.muted}}>vs {fmt(m.n1,"EUR")}</div>
                    <div style={{fontSize:12,fontWeight:600,color:C.green,marginTop:4}}>+{diff}% ↗</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── PAR SERVICE ── */}
      {tab==="services"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
            {services.map((s,i)=>(
              <Card key={i} style={{borderColor:`${s.couleur}44`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:13,color:s.couleur}}>{s.nom}</div>
                  <Pill label={`Marge ${s.marge}%`} color={s.marge>=70?C.green:s.marge>=60?C.gold:C.orange}/>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:C.text,marginBottom:4}}>{fmt(s.ca,"EUR")}</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{s.missions} missions · {Math.round((s.ca/services.reduce((t,x)=>t+x.ca,0))*100)}% du CA total</div>
                <div style={{height:4,borderRadius:2,background:C.border}}>
                  <div style={{height:"100%",width:`${(s.ca/services[0].ca)*100}%`,background:s.couleur,borderRadius:2}}/>
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <CT>📊 Répartition CA par service</CT>
            <div style={{display:"flex",gap:4,alignItems:"flex-end",height:100,marginBottom:8}}>
              {services.map((s,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:9,color:s.couleur,fontWeight:600}}>{Math.round((s.ca/services.reduce((t,x)=>t+x.ca,0))*100)}%</div>
                  <div style={{width:"100%",height:`${(s.ca/services[0].ca)*90}px`,background:`${s.couleur}22`,border:`1px solid ${s.couleur}44`,borderRadius:"2px 2px 0 0"}}/>
                  <div style={{fontSize:8,color:C.muted,textAlign:"center"}}>{s.nom.split(" ")[0]}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
              {services.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:5,alignItems:"center",fontSize:10}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.couleur}}/>
                  <span style={{color:C.muted}}>{s.nom}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── PAR PAYS ── */}
      {tab==="clients"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:14}}>
            <Card>
              <CT>🌍 CA par pays</CT>
              {pays.map((p,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span style={{color:C.text,fontWeight:500}}>{p.pays}</span>
                    <div style={{display:"flex",gap:10}}>
                      <span style={{color:C.muted}}>{p.clients} client{p.clients>1?"s":""}</span>
                      <span style={{fontWeight:700,color:C.gold}}>{fmt(p.ca,"EUR")}</span>
                    </div>
                  </div>
                  <div style={{height:5,borderRadius:3,background:C.border}}>
                    <div style={{height:"100%",width:`${p.pct}%`,background:C.gold,borderRadius:3}}/>
                  </div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{p.pct}% du CA total</div>
                </div>
              ))}
            </Card>
            <Card>
              <CT>🚀 Opportunités géographiques</CT>
              {[
                {pays:"🇦🇪 UAE",potentiel:"x3 — 5 clients potentiels identifiés",action:"Activer prospection Dubai"},
                {pays:"🇸🇳 Sénégal",potentiel:"+150% — Marché conciergerie en croissance",action:"Partenariat local recommandé"},
                {pays:"🇨🇮 Côte d'Ivoire",potentiel:"Nouveau marché — 0 client actuellement",action:"Tymeless OS à déployer"},
                {pays:"🇶🇦 Qatar",potentiel:"Yacht + Jet — clientèle très premium",action:"Cibler via LinkedIn"},
              ].map((o,i)=>(
                <div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:2}}>{o.pays}</div>
                  <div style={{fontSize:11,color:C.gold,marginBottom:2}}>{o.potentiel}</div>
                  <div style={{fontSize:10,color:C.muted}}>→ {o.action}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── OBJECTIFS ── */}
      {tab==="objectifs"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>setModalObj(true)}>+ Ajouter objectif</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:14}}>
            {objectifs.map((o,i)=>{
              const pct=Math.min(Math.round((o.actuel/o.cible)*100),100);
              const ok=pct>=80;
              return(
                <Card key={i} style={{borderColor:`${ok?C.green:C.orange}44`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:13}}>{o.label}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <Pill label={ok?"✅ En bonne voie":"⚠️ À accélérer"} color={ok?C.green:C.orange}/>
                      <Btn sm v="red" onClick={()=>setObjectifs(p=>p.filter(x=>x.id!==o.id))}>🗑</Btn>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                    <span style={{color:C.muted}}>Actuel : <b style={{color:ok?C.green:C.orange}}>{o.actuel.toLocaleString("fr")} {o.unite}</b></span>
                    <span style={{color:C.muted}}>Cible : <b style={{color:C.gold}}>{o.cible.toLocaleString("fr")} {o.unite}</b></span>
                  </div>
                  <div style={{height:8,borderRadius:4,background:C.border,marginBottom:6}}>
                    <div style={{height:"100%",width:`${pct}%`,background:ok?C.green:C.orange,borderRadius:4,transition:"width 0.5s"}}/>
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>{pct}% atteint · Manque : {(o.cible-o.actuel).toLocaleString("fr")} {o.unite}</div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PRÉDICTIONS ── */}
      {tab==="predictions"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
            {[
              {l:"Prédiction Mai",v:fmt(26400,"EUR"),src:"Tendance +12%/mois",c:C.gold,fiabilite:"85%"},
              {l:"Prédiction T3 2026",v:fmt(88000,"EUR"),src:"Saisonnalité + croissance",c:C.teal,fiabilite:"72%"},
              {l:"CA annuel 2026",v:fmt(caAnnuelPrev,"EUR"),src:"Projection 12 mois",c:C.purple,fiabilite:"65%"},
            ].map((p,i)=>(
              <Card key={i} style={{borderColor:`${p.c}44`,textAlign:"center"}}>
                <div style={{fontSize:10,color:p.c,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>{p.l}</div>
                <div style={{fontSize:26,fontWeight:700,color:p.c,marginBottom:4}}>{p.v}</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{p.src}</div>
                <Pill label={`Fiabilité : ${p.fiabilite}`} color={p.c}/>
              </Card>
            ))}
          </div>

          <Card style={{marginBottom:14}}>
            <CT>📈 Projection CA — 12 mois</CT>
            <div style={{display:"flex",gap:4,alignItems:"flex-end",height:120,marginBottom:8}}>
              {mois.map((m,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:9,color:m.pred?C.purple:C.gold}}>{(m.ca/1000).toFixed(0)}k</div>
                  <div style={{width:"100%",height:`${(m.ca/maxCA)*110}px`,background:m.pred?`${C.purple}22`:`${C.gold}22`,border:`1px solid ${m.pred?C.purple:C.gold}44`,borderRadius:"2px 2px 0 0"}}/>
                  <div style={{fontSize:8,color:m.pred?C.purple:C.muted,textAlign:"center"}}>{m.m}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{borderColor:`${C.orange}44`}}>
            <CT>⚠️ Risques identifiés</CT>
            {[
              {r:"Saisonnalité Août","impact":"CA -15% probable","action":"Préparer stock missions et réduire charges"},
              {r:"Dépendance Airbnb (42% CA)","impact":"Risque si réglementation change","action":"Diversifier vers Jet Privé et Yacht"},
              {r:"1 seul client UAE (20% CA)","impact":"Perte potentielle de 4 800€/mois","action":"Prospection 2 nouveaux clients UAE"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                <span style={{color:C.orange,fontWeight:700,flexShrink:0}}>⚠️</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,color:C.text,marginBottom:2}}>{r.r}</div>
                  <div style={{color:C.orange,marginBottom:2}}>{r.impact}</div>
                  <div style={{color:C.muted}}>→ {r.action}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── IA ── */}
      {tab==="ia"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 Analyse Claude IA — Analytique</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Claude analyse vos données de CA, services et croissance pour des insights actionnables.</div>
            <Btn v="purple" onClick={analyserIA}>{aiLoading?"🤖 Analyse en cours...":"🤖 Analyser mes performances"}</Btn>
          </Card>

          {aiLoading&&(
            <Card style={{textAlign:"center",padding:30,marginBottom:14}}>
              <div style={{fontSize:32,marginBottom:8}}>🤖</div>
              <div style={{fontSize:13,color:C.purple,fontWeight:600}}>Analyse des performances en cours...</div>
            </Card>
          )}

          {aiResult&&!aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
              <CT>🤖 Insights Claude IA</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiResult}</div>
            </Card>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>📊 Ratios de performance</CT>
              {[
                {l:"Croissance mensuelle",v:`+${croissance}%`,ok:croissance>10,ref:">10%"},
                {l:"CA par collaborateur",v:fmt(Math.round(caActuel/3),"EUR"),ok:true,ref:">5 000€"},
                {l:"CA par client",v:fmt(Math.round(caActuel/5),"EUR"),ok:true,ref:">3 000€"},
                {l:"Taux de marge",v:"61%",ok:true,ref:">50%"},
                {l:"Part du meilleur service",v:"42%",ok:true,ref:"<50%"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{r.l}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontWeight:700,color:r.ok?C.green:C.orange}}>{r.v}</span>
                    <span style={{fontSize:9,color:C.muted}}>réf:{r.ref}</span>
                    <span>{r.ok?"✅":"⚠️"}</span>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <CT>🏆 Classement services</CT>
              {services.sort((a,b)=>b.marge-a.marge).map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{color:C.gold,fontSize:13,fontWeight:700}}>#{i+1}</span>
                    <span style={{color:s.couleur,fontWeight:500}}>{s.nom}</span>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <span style={{color:C.green,fontWeight:700}}>{s.marge}% marge</span>
                    <span style={{color:C.muted}}>{fmt(s.ca,"EUR")}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const PageClients=({setPage})=>{
  const [tab,setTab]=useState("liste");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");
  const [filtreStatut,setFiltreStatut]=useState("tous");

  const [clients,setClients]=useState([
    {id:1,prenom:"Sofia",nom:"Riad",societe:"",email:"sofia@email.fr",tel:"+33 6 11 22 33 44",pays:"France",ville:"Paris",type:"Particulier",statut:"VIP",source:"Recommandation",partenaire:"Leila Mansouri",services:["Nettoyage Airbnb","Conciergerie Mensuelle"],budget:"690€/mois",frequence:"Régulier",missions:8,ca_total:5520,derniere_mission:"20/05/2026",nps:5,notes:"Cliente VIP très fidèle",date_creation:"15/01/2025",upsell:"Conciergerie Trimestrielle"},
    {id:2,prenom:"Ahmed",nom:"Al-Rashid",societe:"Al-Rashid Group",email:"ahmed@alrashid.ae",tel:"+971 50 123 45 67",pays:"UAE",ville:"Dubai",type:"Professionnel",statut:"VIP",source:"Partenaire",partenaire:"Nassim Belkacem",services:["Nettoyage Yacht","Location Jets Privés"],budget:"Sur devis",frequence:"Ponctuel",missions:4,ca_total:8400,derniere_mission:"18/05/2026",nps:5,notes:"Client international VIP",date_creation:"01/03/2025",upsell:"Broker Yachting"},
    {id:3,prenom:"Marc",nom:"Dupont",societe:"Fintech SA",email:"marc@fintech.fr",tel:"+33 6 33 44 55 66",pays:"France",ville:"Lyon",type:"Professionnel",statut:"Client",source:"Prospection",partenaire:"",services:["Nettoyage bureaux"],budget:"180€/intervention",frequence:"Mensuel",missions:3,ca_total:540,derniere_mission:"12/05/2026",nps:3,notes:"Satisfait mais délai parfois long",date_creation:"01/04/2025",upsell:"Contrat annuel bureaux"},
    {id:4,prenom:"Isabelle",nom:"Moreau",societe:"",email:"isabelle@email.fr",tel:"+33 6 44 55 66 77",pays:"France",ville:"Cannes",type:"Particulier",statut:"Client",source:"NPS",partenaire:"",services:["Nettoyage résidentiel"],budget:"200€/mois",frequence:"Régulier",missions:5,ca_total:1000,derniere_mission:"15/05/2026",nps:4,notes:"Villa à Cannes",date_creation:"15/02/2025",upsell:"Surveillance résidences"},
    {id:5,prenom:"Jean-Paul",nom:"Martin",societe:"SCI Martin",email:"jp@scimartin.fr",tel:"+33 6 55 66 77 88",pays:"France",ville:"Monaco",type:"Professionnel",statut:"Ambassadeur",source:"Club Tymeless",partenaire:"",services:["Conciergerie Annuelle","Nettoyage Yacht","Broker Yachting"],budget:"10 500€/an",frequence:"Régulier",missions:12,ca_total:18500,derniere_mission:"20/05/2026",nps:5,notes:"Ambassadeur — recommande Tymeless",date_creation:"01/01/2025",upsell:"Protection rapprochée"},
    {id:6,prenom:"Amina",nom:"Diallo",societe:"",email:"amina@email.sn",tel:"+221 77 456 78 90",pays:"Sénégal",ville:"Dakar",type:"Particulier",statut:"Prospect",source:"Instagram",partenaire:"",services:[],budget:"Non défini",frequence:"Ponctuel",missions:0,ca_total:0,derniere_mission:"—",nps:null,notes:"Intéressée conciergerie",date_creation:"18/05/2026",upsell:"Conciergerie Découverte"},
  ]);

  const [newClient,setNewClient]=useState({prenom:"",nom:"",societe:"",email:"",tel:"",pays:"France",ville:"",type:"Particulier",statut:"Prospect",source:"CRM",partenaire:"",budget:"",frequence:"Ponctuel",notes:""});

  const STATUTS=["tous","Prospect","Client","VIP","Ambassadeur"];
  const SC={"Prospect":C.muted,"Client":C.blue,"VIP":C.gold,"Ambassadeur":C.purple};
  const SI={"Prospect":"🔍","Client":"👤","VIP":"⭐","Ambassadeur":"🏆"};

  const getStatutAuto=(c)=>{
    if(c.ca_total>=10000)return"Ambassadeur";
    if(c.ca_total>=2000)return"VIP";
    if(c.missions>0)return"Client";
    return"Prospect";
  };

  const caTotal=clients.reduce((s,c)=>s+c.ca_total,0);
  const vips=clients.filter(c=>c.statut==="VIP"||c.statut==="Ambassadeur").length;
  const npsM=clients.filter(c=>c.nps).reduce((s,c,_,a)=>s+c.nps/a.length,0).toFixed(1);

  const filtres=clients.filter(c=>{
    if(filtreStatut!=="tous"&&c.statut!==filtreStatut)return false;
    if(search&&!`${c.prenom} ${c.nom} ${c.societe}`.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const TABS=[
    {id:"liste",label:"👥 Clients"},
    {id:"vip",label:"⭐ VIP & Ambassadeurs"},
    {id:"pipeline",label:"📊 Pipeline"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {/* MODAL NOUVEAU CLIENT */}
      {modal==="nouveau"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:540,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouveau client</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[["Prénom *","prenom"],["Nom *","nom"],["Email","email"],["Téléphone / WhatsApp","tel"],["Ville","ville"],["Société (si pro)","societe"]].map(([l,k])=>(
                  <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp placeholder={l} value={newClient[k]} onChange={e=>setNewClient(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Pays</div><Inp placeholder="France" value={newClient.pays} onChange={e=>setNewClient(p=>({...p,pays:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Type</div><Sel value={newClient.type} onChange={e=>setNewClient(p=>({...p,type:e.target.value}))} options={["Particulier","Professionnel","VIP"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Source</div><Sel value={newClient.source} onChange={e=>setNewClient(p=>({...p,source:e.target.value}))} options={["CRM","Recommandation","Partenaire","Prospection","NPS","Instagram","Google","Club","Autre"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Budget estimé</div><Inp placeholder="690€/mois" value={newClient.budget} onChange={e=>setNewClient(p=>({...p,budget:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Fréquence</div><Sel value={newClient.frequence} onChange={e=>setNewClient(p=>({...p,frequence:e.target.value}))} options={["Ponctuel","Mensuel","Régulier","Abonnement"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Partenaire apporteur</div><Inp placeholder="Nom du partenaire (optionnel)" value={newClient.partenaire} onChange={e=>setNewClient(p=>({...p,partenaire:e.target.value}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Notes</div><textarea value={newClient.notes} onChange={e=>setNewClient(p=>({...p,notes:e.target.value}))} placeholder="Informations importantes..." style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontFamily:"inherit",fontSize:12,minHeight:60,resize:"vertical"}}/></div>
              <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:8,padding:10,fontSize:11,color:C.blue}}>🤖 Le statut sera assigné automatiquement selon le CA généré</div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newClient.prenom||!newClient.nom)return;
                setClients(p=>[{id:Date.now(),...newClient,missions:0,ca_total:0,derniere_mission:"—",nps:null,services:[],upsell:"Conciergerie Découverte"},...p]);
                setModal(null);
                setNewClient({prenom:"",nom:"",societe:"",email:"",tel:"",pays:"France",ville:"",type:"Particulier",statut:"Prospect",source:"CRM",partenaire:"",budget:"",frequence:"Ponctuel",notes:""});
                showToast("✓ Client ajouté !");
              }}>✓ Créer le profil</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FICHE CLIENT */}
      {modal==="fiche"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${SC[selected.statut]||C.gold}44`,borderRadius:14,padding:24,width:560,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:`${SC[selected.statut]}22`,border:`2px solid ${SC[selected.statut]}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:SC[selected.statut]}}>{selected.prenom[0]}</div>
                <div>
                  <div style={{fontSize:16,fontWeight:700}}>{selected.prenom} {selected.nom}</div>
                  <div style={{fontSize:11,color:C.muted}}>{selected.societe||selected.type} · {selected.ville}, {selected.pays}</div>
                  <div style={{display:"flex",gap:5,marginTop:4}}>
                    <Pill label={`${SI[selected.statut]} ${selected.statut}`} color={SC[selected.statut]}/>
                    {selected.partenaire&&<Pill label={`🤝 ${selected.partenaire}`} color={C.purple}/>}
                  </div>
                </div>
              </div>
              <Btn sm v="ghost" onClick={()=>setModal(null)}>✕</Btn>
            </div>

            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
              {[["CA total",fmt(selected.ca_total,"EUR"),C.gold],["Missions",selected.missions,C.blue],["NPS",selected.nps?"★ "+selected.nps:"—",C.green],["Fréquence",selected.frequence,C.purple]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Infos */}
            <Card style={{padding:12,marginBottom:10}}>
              <div style={{fontSize:10,color:C.gold,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Informations</div>
              {[["📱",selected.tel],["📧",selected.email],["💰",selected.budget],["📅","Dernière mission : "+selected.derniere_mission],["🔍","Source : "+selected.source],["📝",selected.notes||"—"]].map(([ico,v],i)=>(
                <div key={i} style={{display:"flex",gap:8,fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span>{ico}</span><span style={{color:C.muted,flex:1}}>{v}</span></div>
              ))}
            </Card>

            {/* Services utilisés */}
            {selected.services?.length>0&&(
              <Card style={{padding:12,marginBottom:10}}>
                <div style={{fontSize:10,color:C.gold,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Services utilisés</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {selected.services.map((s,i)=><Pill key={i} label={s} color={C.teal}/>)}
                </div>
              </Card>
            )}

            {/* Upsell */}
            {selected.upsell&&(
              <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,marginBottom:12}}>
                <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:4}}>📈 Upsell recommandé</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.text}}>→ {selected.upsell}</span>
                  <Btn sm v="green" onClick={()=>showToast(`📲 Proposition ${selected.upsell} envoyée à ${selected.prenom} sur WhatsApp`)}>📲 Proposer</Btn>
                </div>
              </div>
            )}

            {/* Solvabilité */}
            <div style={{background:C.card2,border:`1px solid ${C.teal}44`,borderRadius:10,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,color:C.teal,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>🔍 Score Solvabilité</div>
              <SolvabiliteWidget nom={`${selected.prenom} ${selected.nom}`} contexte="client"/>
            </div>

            {/* Actions */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
              <Btn sm v="gold" full onClick={()=>{showToast("📋 Devis créé !");setModal(null);}}>📋 Devis</Btn>
              <Btn sm v="blue" full onClick={()=>{showToast("📅 Mission créée !");setModal(null);}}>📅 Mission</Btn>
              <Btn sm v="ghost" full onClick={()=>showToast(`📲 Message envoyé à ${selected.prenom}`)}>📲 WA</Btn>
              <Btn sm v="teal" full onClick={()=>showToast(`💬 Chat ouvert avec ${selected.prenom}`)}>💬 Chat</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="Profils · Historique · Upsell auto · Solvabilité · WhatsApp">◬ Clients</STitle>
        <Btn v="gold" onClick={()=>setModal("nouveau")}>+ Nouveau client</Btn>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Total clients" val={clients.length} color={C.blue}/>
        <KPI label="VIP & Ambassadeurs" val={vips} color={C.gold}/>
        <KPI label="Prospects" val={clients.filter(c=>c.statut==="Prospect").length} color={C.muted}/>
        <KPI label="CA total" val={fmt(caTotal,"EUR")} color={C.green}/>
        <KPI label="NPS moyen" val={"★ "+npsM} color={C.purple}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── LISTE ── */}
      {tab==="liste"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <Inp placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:200}}/>
            <div style={{display:"flex",gap:5}}>
              {STATUTS.map(s=>(
                <button key={s} onClick={()=>setFiltreStatut(s)} style={{padding:"4px 10px",border:`1px solid ${filtreStatut===s?SC[s]||C.gold:C.border}`,borderRadius:20,background:filtreStatut===s?`${SC[s]||C.gold}22`:C.card2,color:filtreStatut===s?SC[s]||C.gold:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>
                  {s==="tous"?"Tous":SI[s]+" "+s}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {filtres.map((c,i)=>(
              <Card key={i} style={{cursor:"pointer",borderColor:`${SC[c.statut]}33`,transition:"all 0.2s"}}
                onClick={()=>{setSelected(c);setModal("fiche");}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
              >
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:`${SC[c.statut]}22`,border:`2px solid ${SC[c.statut]}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:SC[c.statut]}}>{c.prenom[0]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{c.prenom} {c.nom}</div>
                    <div style={{fontSize:10,color:C.muted}}>{c.societe||c.type} · {c.ville}, {c.pays}</div>
                  </div>
                  <Pill label={`${SI[c.statut]} ${c.statut}`} color={SC[c.statut]}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                  {[["💰",fmt(c.ca_total,"EUR")],["📋",c.missions+" missions"],["⭐",c.nps?"★ "+c.nps:"—"],["📅",c.derniere_mission]].map(([ico,v],j)=>(
                    <div key={j} style={{background:C.card2,borderRadius:5,padding:"4px 7px",display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{fontSize:10}}>{ico}</span><span style={{fontSize:10,color:C.muted}}>{v}</span>
                    </div>
                  ))}
                </div>
                {c.upsell&&(
                  <div style={{background:`${C.green}11`,borderRadius:5,padding:"4px 8px",fontSize:10,color:C.green,marginBottom:8}}>📈 Upsell : {c.upsell}</div>
                )}
                <div style={{display:"flex",gap:5}}>
                  <Btn sm v="gold" onClick={e=>{e.stopPropagation();showToast("📋 Devis créé !");}}>📋 Devis</Btn>
                  <Btn sm v="ghost" onClick={e=>{e.stopPropagation();showToast(`📲 Message à ${c.prenom}`);}}>📲</Btn>
                  <Btn sm v="teal" onClick={e=>{e.stopPropagation();showToast(`💬 Chat ouvert`);}}>💬</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── VIP ── */}
      {tab==="vip"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.gold}44`,background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
            <CT>⭐ Programme VIP & Ambassadeurs Tymeless</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[{s:"Prospect",ico:"🔍",desc:"0 mission",c:C.muted},{s:"Client",ico:"👤",desc:"1+ mission",c:C.blue},{s:"VIP",ico:"⭐",desc:"CA > 2 000€",c:C.gold},{s:"Ambassadeur",ico:"🏆",desc:"CA > 10 000€",c:C.purple}].map((lv,i)=>(
                <div key={i} style={{background:`${lv.c}11`,border:`1px solid ${lv.c}33`,borderRadius:8,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:4}}>{lv.ico}</div>
                  <div style={{fontSize:12,fontWeight:700,color:lv.c}}>{lv.s}</div>
                  <div style={{fontSize:10,color:C.muted}}>{lv.desc}</div>
                  <div style={{fontSize:11,fontWeight:600,color:lv.c,marginTop:4}}>{clients.filter(c=>c.statut===lv.s).length} clients</div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {clients.filter(c=>c.statut==="VIP"||c.statut==="Ambassadeur").map((c,i)=>(
              <Card key={i} style={{borderColor:`${SC[c.statut]}44`,cursor:"pointer"}} onClick={()=>{setSelected(c);setModal("fiche");}}>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:`${SC[c.statut]}22`,border:`2px solid ${SC[c.statut]}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:SC[c.statut]}}>{c.prenom[0]}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:SC[c.statut]}}>{c.prenom} {c.nom}</div>
                    <div style={{fontSize:10,color:C.muted}}>{c.societe||c.type} · {c.ville}</div>
                  </div>
                  <Pill label={`${SI[c.statut]} ${c.statut}`} color={SC[c.statut]}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
                  {[["CA",fmt(c.ca_total,"EUR"),C.gold],["Missions",c.missions,C.blue],["NPS",c.nps?"★"+c.nps:"—",C.green]].map(([l,v,col],j)=>(
                    <div key={j} style={{background:C.card2,borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:C.muted}}>{l}</div>
                      <div style={{fontSize:12,fontWeight:700,color:col}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:6}}>
                  <Btn sm v="gold" onClick={e=>{e.stopPropagation();showToast(`📲 Message VIP envoyé à ${c.prenom}`);}}>📲 Contacter</Btn>
                  <Btn sm v="ghost" onClick={e=>{e.stopPropagation();showToast(`🌐 ${c.prenom} invité au Club Tymeless`);}}>🌐 Inviter Club</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── PIPELINE ── */}
      {tab==="pipeline"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {["Prospect","Client","VIP","Ambassadeur"].map((statut,i)=>{
            const cs=clients.filter(c=>c.statut===statut);
            return(
              <div key={i} style={{background:C.card2,borderRadius:10,padding:10,minHeight:200}}>
                <div style={{background:`${SC[statut]}22`,border:`1px solid ${SC[statut]}33`,borderRadius:7,padding:"7px 10px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:700,color:SC[statut]}}>{SI[statut]} {statut}</span>
                  <span style={{fontSize:11,color:C.muted}}>{cs.length}</span>
                </div>
                <div style={{fontSize:10,color:C.muted,marginBottom:8,textAlign:"center"}}>{fmt(cs.reduce((s,c)=>s+c.ca_total,0),"EUR")}</div>
                {cs.map((c,j)=>(
                  <div key={j} style={{background:C.card,border:`1px solid ${SC[statut]}22`,borderRadius:7,padding:9,marginBottom:7,cursor:"pointer"}} onClick={()=>{setSelected(c);setModal("fiche");}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.text}}>{c.prenom} {c.nom}</div>
                    <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{c.ville}, {c.pays}</div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                      <span style={{color:C.gold,fontWeight:600}}>{fmt(c.ca_total,"EUR")}</span>
                      <span style={{color:C.muted}}>{c.missions} missions</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PagePartenaires=()=>{
  const [tab,setTab]=useState("liste");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);

  const [partenaires,setPartenaires]=useState([
    {id:1,nom:"Leila Mansouri",role:"Apporteur d'affaires",email:"leila@email.fr",tel:"+33 6 11 22 33 44",pays:"France",comm:20,ca_total:12400,ca_mois:2800,dues:1305,abo:"Business Pro",statut:"actif",missions:8,note:4.9,rejoints:"Jan 2025",specialite:"Jet Privé / Yacht",iban:"FR76 3000 1234 5678 9012"},
    {id:2,nom:"Karim Diallo",role:"Partenaire commercial",email:"karim@email.fr",tel:"+33 6 22 33 44 55",pays:"Sénégal",comm:15,ca_total:6200,ca_mois:1400,dues:420,abo:"Starter",statut:"actif",missions:5,note:4.7,rejoints:"Mar 2025",specialite:"Airbnb / Résidentiel",iban:""},
    {id:3,nom:"Nassim Belkacem",role:"Revendeur SaaS",email:"nassim@email.fr",tel:"+33 6 33 44 55 66",pays:"Algérie",comm:25,ca_total:18000,ca_mois:4200,dues:2400,abo:"Enterprise",statut:"actif",missions:12,note:5.0,rejoints:"Nov 2024",specialite:"SaaS / BTP",iban:"DZ XX XXXXXXXXXXXXX"},
    {id:4,nom:"Marie Leconte",role:"Apporteur d'affaires",email:"marie@email.fr",tel:"+33 6 44 55 66 77",pays:"France",comm:15,ca_total:3100,ca_mois:0,dues:0,abo:"Starter",statut:"inactif",missions:3,note:4.2,rejoints:"Avr 2025",specialite:"Résidentiel",iban:""},
  ]);

  const [newP,setNewP]=useState({nom:"",role:"Apporteur d'affaires",email:"",tel:"",pays:"France",comm:15,abo:"Starter",specialite:"",iban:""});

  const totalCA=partenaires.reduce((s,p)=>s+p.ca_total,0);
  const totalDues=partenaires.reduce((s,p)=>s+p.dues,0);
  const totalMois=partenaires.reduce((s,p)=>s+p.ca_mois,0);
  const actifs=partenaires.filter(p=>p.statut==="actif");

  const payerCommission=(id)=>{
    const p=partenaires.find(x=>x.id===id);
    setPartenaires(prev=>prev.map(x=>x.id===id?{...x,dues:0}:x));
    showToast(`💳 Commission ${fmt(p.dues,"EUR")} payée à ${p.nom} via Wallet ✅`);
  };

  const TABS=[{id:"liste",label:"👥 Partenaires"},{id:"commissions",label:"💰 Commissions"},{id:"performance",label:"📊 Performance"},{id:"chat",label:"💬 Chat"}];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {modal==="creer"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:480,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouveau partenaire</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[["Nom complet *","nom","text","Leila Mansouri"],["Email","email","email","leila@email.fr"],["WhatsApp","tel","text","+33 6..."],["Pays","pays","text","France"],["Spécialité","specialite","text","Jet Privé / Yacht"]].map(([l,k,t,ph])=>(
                <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={newP[k]} onChange={e=>setNewP(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Rôle</div><Sel value={newP.role} onChange={e=>setNewP(p=>({...p,role:e.target.value}))} options={["Apporteur d'affaires","Partenaire commercial","Revendeur SaaS","Agent terrain","Influenceur"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Commission %</div><Inp type="number" placeholder="15" value={newP.comm} onChange={e=>setNewP(p=>({...p,comm:Number(e.target.value)}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Plan</div><Sel value={newP.abo} onChange={e=>setNewP(p=>({...p,abo:e.target.value}))} options={["Starter","Business Pro","Enterprise"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>IBAN</div><Inp placeholder="FR76 XXXX..." value={newP.iban} onChange={e=>setNewP(p=>({...p,iban:e.target.value}))} style={{width:"100%",fontFamily:"monospace"}}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{if(!newP.nom)return;setPartenaires(p=>[{id:Date.now(),...newP,ca_total:0,ca_mois:0,dues:0,missions:0,note:0,rejoints:new Date().toLocaleDateString("fr",{month:"short",year:"numeric"}),statut:"actif"},...p]);setModal(null);showToast("✓ Partenaire ajouté !");}}>✓ Ajouter</Btn>
            </div>
          </div>
        </div>
      )}

      {modal==="fiche"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:540,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{fontSize:16,fontWeight:700}}>{selected.nom}</div><div style={{fontSize:11,color:C.muted}}>{selected.role} · {selected.pays} · Depuis {selected.rejoints}</div></div>
              <Btn sm v="ghost" onClick={()=>setModal(null)}>✕</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {[["CA total",fmt(selected.ca_total,"EUR"),C.gold],["CA ce mois",fmt(selected.ca_mois,"EUR"),C.green],["Commission",`${selected.comm}%`,C.purple],["Missions",selected.missions,C.blue],["Note","★ "+selected.note,C.gold],["Commissions dues",fmt(selected.dues,"EUR"),selected.dues>0?C.red:C.green]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,borderRadius:7,padding:"8px 10px",border:`1px solid ${c}22`}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            <Card style={{marginBottom:10,padding:12}}>
              {[["📧",selected.email],["📱",selected.tel],["🌍",selected.pays],["🏷️",selected.specialite],["🏦",selected.iban||"IBAN non renseigné"]].map(([ico,v],i)=>(
                <div key={i} style={{display:"flex",gap:8,fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span>{ico}</span><span style={{color:C.muted}}>{v}</span></div>
              ))}
            </Card>
            <div style={{background:C.card2,border:`1px solid ${C.teal}44`,borderRadius:10,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:600,color:C.teal,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>🔍 Score Solvabilité Tymeless</div>
              <SolvabiliteWidget nom={selected.nom} contexte="partenaire"/>
            </div>
            {selected.dues>0&&(
              <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:12,fontWeight:600,color:C.orange}}>💰 Commission à payer</div><div style={{fontSize:11,color:C.muted}}>{selected.comm}% sur {fmt(selected.ca_mois,"EUR")}</div></div>
                  <div><div style={{fontSize:18,fontWeight:700,color:C.orange}}>{fmt(selected.dues,"EUR")}</div><Btn sm v="gold" onClick={()=>{payerCommission(selected.id);setModal(null);}}>💳 Payer</Btn></div>
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <Btn v="ghost" full onClick={()=>showToast(`📲 Message envoyé à ${selected.nom}`)}>📲 WhatsApp</Btn>
              <Btn v="ghost" full onClick={()=>showToast(`📧 Email envoyé à ${selected.nom}`)}>📧 Email</Btn>
              <Btn v="red" sm onClick={()=>{setPartenaires(p=>p.filter(x=>x.id!==selected.id));setModal(null);showToast("Supprimé","#EF4444");}}>🗑</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="Apporteurs d'affaires · Commissions · Performance · Chat">⬡ Partenaires & AA</STitle>
        <Btn v="gold" onClick={()=>setModal("creer")}>+ Nouveau partenaire</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Actifs" val={actifs.length} color={C.blue}/>
        <KPI label="CA total" val={fmt(totalCA,"EUR")} color={C.gold}/>
        <KPI label="CA ce mois" val={fmt(totalMois,"EUR")} color={C.green}/>
        <KPI label="Commissions dues" val={fmt(totalDues,"EUR")} color={totalDues>0?C.red:C.green}/>
        <KPI label="Top partenaire" val={[...partenaires].sort((a,b)=>b.ca_total-a.ca_total)[0]?.nom.split(" ")[0]||"—"} color={C.purple}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {tab==="liste"&&(
        <div>
          {partenaires.filter(p=>p.dues>0).length>0&&(
            <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}44`,borderRadius:10,padding:12,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,color:C.orange,marginBottom:8}}>⏰ Commissions en attente</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {partenaires.filter(p=>p.dues>0).map((p,i)=>(
                  <div key={i} style={{background:C.card,borderRadius:7,padding:"7px 12px",display:"flex",gap:10,alignItems:"center",border:`1px solid ${C.orange}33`}}>
                    <span style={{fontSize:12,fontWeight:600}}>{p.nom.split(" ")[0]}</span>
                    <span style={{fontWeight:700,color:C.orange}}>{fmt(p.dues,"EUR")}</span>
                    <Btn sm v="gold" onClick={()=>payerCommission(p.id)}>💳 Payer</Btn>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            {partenaires.map((p,i)=>(
              <Card key={i} style={{borderColor:`${p.statut==="actif"?C.gold:C.muted}33`,cursor:"pointer"}} onClick={()=>{setSelected(p);setModal("fiche");}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:`${C.gold}22`,border:`1px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:C.gold}}>{p.nom[0]}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:C.text}}>{p.nom}</div>
                      <div style={{fontSize:10,color:C.muted}}>{p.role} · {p.pays}</div>
                      {p.specialite&&<div style={{fontSize:10,color:C.teal}}>{p.specialite}</div>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}><Pill label={`${p.comm}%`} color={C.purple}/><Pill label={p.statut==="actif"?"✓ Actif":"○ Inactif"} color={p.statut==="actif"?C.green:C.muted}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                  {[["CA total",fmt(p.ca_total,"EUR"),C.gold],["Ce mois",fmt(p.ca_mois,"EUR"),C.green],["Missions",p.missions,C.blue]].map(([l,v,c],j)=>(
                    <div key={j} style={{background:C.card2,borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:C.muted}}>{l}</div>
                      <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
                {p.dues>0&&(
                  <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:6,padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,color:C.orange}}>Commission due : <b>{fmt(p.dues,"EUR")}</b></span>
                    <Btn sm v="gold" onClick={e=>{e.stopPropagation();payerCommission(p.id);}}>💳 Payer</Btn>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab==="commissions"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
            <Card style={{borderColor:`${C.red}44`,textAlign:"center"}}>
              <div style={{fontSize:10,color:C.red,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>À payer</div>
              <div style={{fontSize:28,fontWeight:700,color:C.red}}>{fmt(totalDues,"EUR")}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Ce mois</div>
              <Btn v="gold" full onClick={()=>{setPartenaires(p=>p.map(x=>({...x,dues:0})));showToast("💳 Toutes les commissions payées !");}}>💳 Tout payer</Btn>
            </Card>
            <Card style={{borderColor:`${C.green}44`,textAlign:"center"}}>
              <div style={{fontSize:10,color:C.green,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Payé ce mois</div>
              <div style={{fontSize:28,fontWeight:700,color:C.green}}>{fmt(4200,"EUR")}</div>
            </Card>
            <Card style={{borderColor:`${C.gold}44`,textAlign:"center"}}>
              <div style={{fontSize:10,color:C.gold,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Total versé 2026</div>
              <div style={{fontSize:28,fontWeight:700,color:C.gold}}>{fmt(18600,"EUR")}</div>
            </Card>
          </div>
          <Card>
            <CT>💰 Commissions par partenaire</CT>
            <TH heads={["Partenaire","Rôle","Comm %","CA ce mois","Due","Statut","Action"]} rows={partenaires.map((p,i)=>(
              <tr key={i}>
                <Td><span style={{fontWeight:600}}>{p.nom}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{p.role}</span></Td>
                <Td><span style={{color:C.purple,fontWeight:700}}>{p.comm}%</span></Td>
                <Td><span style={{fontWeight:600,color:C.green}}>{fmt(p.ca_mois,"EUR")}</span></Td>
                <Td><span style={{fontWeight:700,color:p.dues>0?C.orange:C.muted}}>{p.dues>0?fmt(p.dues,"EUR"):"—"}</span></Td>
                <Td><Pill label={p.dues>0?"⏳ À payer":"✅ Payé"} color={p.dues>0?C.orange:C.green}/></Td>
                <Td>{p.dues>0?<Btn sm v="gold" onClick={()=>payerCommission(p.id)}>💳 Payer</Btn>:<span style={{fontSize:10,color:C.muted}}>OK</span>}</Td>
              </tr>
            ))}/>
          </Card>
        </div>
      )}

      {tab==="performance"&&(
        <div>
          <Card style={{marginBottom:14}}>
            <CT>🏆 Classement par CA apporté</CT>
            {[...partenaires].sort((a,b)=>b.ca_total-a.ca_total).map((p,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:i===0?`${C.gold}22`:C.card2,border:`1px solid ${i===0?C.gold:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:i===0?C.gold:C.muted}}>#{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontWeight:600}}>{p.nom}</span>
                    <span style={{fontWeight:700,color:C.gold}}>{fmt(p.ca_total,"EUR")}</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${(p.ca_total/18000)*100}%`,background:i===0?C.gold:C.muted,borderRadius:2}}/></div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{p.missions} missions · ★{p.note} · {p.comm}%</div>
                </div>
              </div>
            ))}
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>📈 CA mensuel global</CT>
              {[["Jan",3200],["Fév",2800],["Mar",4100],["Avr",5200],["Mai",8400]].map(([m,v],i)=>(
                <div key={i} style={{marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{color:C.muted}}>{m}</span><span style={{fontWeight:700,color:C.gold}}>{fmt(v,"EUR")}</span></div>
                  <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${(v/8400)*100}%`,background:C.gold,borderRadius:2}}/></div>
                </div>
              ))}
            </Card>
            <Card>
              <CT>⭐ Notes & satisfaction</CT>
              {partenaires.map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span>{p.nom.split(" ")[0]}</span>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{color:C.gold}}>{"★".repeat(Math.round(p.note))}</span>
                    <span style={{color:C.muted}}>{p.note}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {tab==="chat"&&<Chat msgs={MSGS_PART} contacts={partenaires.map(p=>p.nom.split(" ")[0])}/>}
    </div>
  );
};


const PageAnnuaire=()=>{
  const [tab,setTab]=useState("annuaire");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);
  const [search,setSearch]=useState("");
  const [filtreSecteur,setFiltreSecteur]=useState("tous");
  const [filtrePays,setFiltrePays]=useState("tous");
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [showRegles,setShowRegles]=useState(false);

  const [membres,setMembres]=useState([
    {id:1,nom:"Ahmed Barro",metier:"Restaurant / Traiteur",pays:"Sénégal",ville:"Dakar",tel:"+221 77 123 45 67",email:"ahmed@barro.sn",secteur:"restaurant",ca_genere:4200,deals:3,note:4.8,type:"client",bio:"Spécialiste cuisine africaine et traiteur événements haut de gamme.",services:["Traiteur","Restauration","Livraison"],besoin:"Cherche partenaires hôtels et événementiel",actif:true,abo_actif:true},
    {id:2,nom:"Claire Fontaine",metier:"Architecte d'intérieur",pays:"France",ville:"Paris",tel:"+33 6 11 22 33 44",email:"claire@fontaine.fr",secteur:"immobilier",ca_genere:8800,deals:6,note:5.0,type:"partenaire",bio:"Spécialisée luxe et hôtellerie 5 étoiles.",services:["Décoration","Rénovation luxe","Conseil"],besoin:"Cherche conciergeries et hôtels",actif:true,abo_actif:true},
    {id:3,nom:"Moussa Konaté",metier:"BTP / Construction",pays:"Côte d'Ivoire",ville:"Abidjan",tel:"+225 07 456 78 90",email:"moussa@konatetp.ci",secteur:"btp",ca_genere:1200,deals:1,note:4.5,type:"fournisseur",bio:"Entreprise générale de construction.",services:["Maçonnerie","Rénovation","Gros oeuvre"],besoin:"Cherche promoteurs immobiliers",actif:true,abo_actif:true},
    {id:4,nom:"Fatima Al-Zahra",metier:"Coaching / Formation",pays:"Maroc",ville:"Casablanca",tel:"+212 6 12 34 56 78",email:"fatima@coaching.ma",secteur:"formation",ca_genere:3600,deals:4,note:4.9,type:"partenaire",bio:"Coach certifiée ICF. Formation leadership.",services:["Coaching","Séminaires","E-learning"],besoin:"Cherche entreprises RH",actif:true,abo_actif:true},
    {id:5,nom:"Jean-Pierre Morel",metier:"Transport VTC Luxe",pays:"France",ville:"Lyon",tel:"+33 6 55 44 33 22",email:"jp@vtcluxe.fr",secteur:"transport",ca_genere:6100,deals:5,note:4.7,type:"partenaire",bio:"Flotte premium. Partenaire hôtels et aéroports.",services:["VTC Premium","Navettes","Mise à disposition"],besoin:"Cherche hôtels 4-5★",actif:true,abo_actif:true},
    {id:6,nom:"Aïcha Mbaye",metier:"Beauté / Esthétique",pays:"Sénégal",ville:"Dakar",tel:"+221 76 234 56 78",email:"aicha@beaute.sn",secteur:"beaute",ca_genere:800,deals:1,note:4.3,type:"client",bio:"Institut de beauté haut de gamme.",services:["Soins","Massage","Maquillage"],besoin:"Cherche hôtels et spas partenaires",actif:true,abo_actif:false},
  ]);

  const [deals,setDeals]=useState([
    {id:1,vendeur:"Claire Fontaine",acheteur:"Ahmed Barro",montant:5000,comm:500,statut:"signé",date:"Il y a 3j",description:"Décoration restaurant haut de gamme",type:"deal"},
    {id:2,vendeur:"Jean-Pierre Morel",acheteur:"Claire Fontaine",montant:2400,comm:240,statut:"en_cours",date:"Hier",description:"Transport clients rénovation luxe",type:"deal"},
    {id:3,vendeur:"Tymeless",acheteur:"Jean-Pierre Morel",montant:8000,comm:800,statut:"signé",date:"Il y a 7j",description:"Mise en relation — navettes VIP",type:"mise_en_relation"},
    {id:4,vendeur:"Fatima Al-Zahra",acheteur:"Moussa Konaté",montant:1500,comm:150,statut:"en_attente",date:"Aujourd'hui",description:"Formation management chantier",type:"deal"},
  ]);

  const [offres,setOffres]=useState([
    {id:1,membre:"Claire Fontaine",titre:"Décoration intérieure luxe",desc:"Transformation complète espace haut de gamme",prix:"À partir de 3 000€",secteur:"immobilier",date:"Il y a 2j"},
    {id:2,membre:"Jean-Pierre Morel",titre:"VTC Premium Paris/Lyon",desc:"Mise à disposition chauffeur + véhicule haut de gamme",prix:"250€/jour",secteur:"transport",date:"Il y a 5j"},
    {id:3,membre:"Fatima Al-Zahra",titre:"Coaching Leadership",desc:"Programme 3 mois pour dirigeants",prix:"2 500€/programme",secteur:"formation",date:"Il y a 1j"},
  ]);

  const [demandes,setDemandes]=useState([
    {id:1,membre:"Ahmed Barro",titre:"Cherche traiteur événementiel",desc:"Besoin traiteur pour 200 personnes, cuisine fusion",budget:"5 000€",secteur:"restaurant",date:"Aujourd'hui"},
    {id:2,membre:"Moussa Konaté",titre:"Cherche architecte chantiers",desc:"Projets résidentiels haut standing Abidjan",budget:"À négocier",secteur:"immobilier",date:"Il y a 3j"},
  ]);

  const [newOffre,setNewOffre]=useState({titre:"",desc:"",prix:"",secteur:"conciergerie"});
  const [newDemande,setNewDemande]=useState({titre:"",desc:"",budget:"",secteur:"conciergerie"});
  const [newMembre,setNewMembre]=useState({nom:"",metier:"",pays:"France",ville:"",tel:"",email:"",secteur:"conciergerie",type:"client",bio:"",besoin:""});

  const SECTEURS=["tous","conciergerie","restaurant","btp","immobilier","transport","beaute","formation","tech","autre"];
  const TYPES=["tous","client","partenaire","fournisseur"];
  const TYPE_COLORS={"client":C.blue,"partenaire":C.gold,"fournisseur":C.teal};

  const totalCA=membres.reduce((s,m)=>s+m.ca_genere,0);
  const totalComm=deals.reduce((s,d)=>s+d.comm,0);
  const abos=membres.filter(m=>m.abo_actif).length;
  const revenusAbos=abos*29;

  const pays=[...new Set(membres.map(m=>m.pays))];
  const membresFiltres=membres.filter(m=>{
    if(filtreSecteur!=="tous"&&m.secteur!==filtreSecteur)return false;
    if(filtrePays!=="tous"&&m.pays!==filtrePays)return false;
    if(search&&!m.nom.toLowerCase().includes(search.toLowerCase())&&!m.metier.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const matcherIA=async(membre)=>{
    setAiLoading(true);
    try{
      const autres=membres.filter(m=>m.id!==membre.id);
      const prompt=`Club d'affaires privé Tymeless. Analyse ce profil membre et trouve les 2-3 meilleures synergies business parmi les autres membres.

Profil: ${membre.nom} — ${membre.metier} — ${membre.ville}, ${membre.pays}
Services: ${membre.services.join(", ")}
Besoin: ${membre.besoin}

Autres membres:
${autres.map(m=>`- ${m.nom}: ${m.metier} (${m.pays}). Services: ${m.services.join(", ")}. Besoin: ${m.besoin}`).join("\n")}

Identifie les meilleures opportunités business concrètes. Pour chaque match: qui, pourquoi, quel deal potentiel et estimation du montant. Sois très concret et actionnable.`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiResult(data.content?.[0]?.text||"Analyse non disponible");
    }catch(e){setAiResult("Erreur — Vérifiez la connexion");}
    setAiLoading(false);
  };

  const TABS=[
    {id:"annuaire",label:"🌐 Annuaire"},
    {id:"offres",label:"📢 Offres & Demandes"},
    {id:"deals",label:"💼 Deals"},
    {id:"revenus",label:"💰 Mes revenus"},
    {id:"ia_match",label:"🤖 IA Match"},
  ];

  // POPUP RÈGLES
  const PopupRegles=()=>(
    <div style={{position:"fixed",inset:0,background:"#00000095",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,padding:16}}>
      <div style={{background:C.card,border:`2px solid ${C.gold}`,borderRadius:16,padding:28,width:560,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:28,marginBottom:8}}>👑</div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,color:C.gold}}>Club Tymeless</div>
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>Club d'affaires privé mondial — Règlement officiel</div>
        </div>

        {[
          {titre:"🔒 Accès et adhésion",regles:[
            "Le Club Tymeless est un espace strictement privé",
            "L'accès est accordé sur invitation ou validation par Curtiss uniquement",
            "Chaque membre est vérifié avant d'accéder au club",
            "L'abonnement est de 29€/mois — aucune exception",
            "L'accès peut être suspendu ou révoqué à tout moment sans préavis",
          ]},
          {titre:"💼 Deals et transactions",regles:[
            "TOUS les deals entre membres DOIVENT passer par la plateforme Tymeless",
            "Une commission de 10% est automatiquement prélevée sur chaque deal",
            "10% s'applique également sur chaque mise en relation aboutie",
            "Tout deal réalisé hors plateforme = exclusion définitive immédiate",
            "Les paiements sont sécurisés via Flutterwave, Stripe, Wave, Orange Money",
            "Le vendeur reçoit 90% du montant net après commission Tymeless",
          ]},
          {titre:"🤝 Comportement membres",regles:[
            "Respect mutuel obligatoire entre tous les membres",
            "Informations fausses ou trompeuses = exclusion immédiate",
            "Spam ou démarchage abusif non autorisé = suspension",
            "Les échanges entre membres sont confidentiels",
            "Toute divulgation de données membres est interdite",
          ]},
          {titre:"⚖️ Responsabilité et litiges",regles:[
            "Tymeless OS est une plateforme de mise en relation",
            "La responsabilité des deals appartient aux membres concernés",
            "En cas de litige entre membres, Tymeless OS tranche en dernier recours",
            "Tymeless OS se réserve le droit de bloquer tout paiement litigieux",
          ]},
          {titre:"🚀 À venir dans le Club",regles:[
            "Masterclasses exclusives par des experts",
            "Rencontres visio entre membres pour faire du business",
            "Événements networking mondiaux",
          ]},
        ].map((section,i)=>(
          <div key={i} style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:C.gold,marginBottom:8}}>{section.titre}</div>
            {section.regles.map((r,j)=>(
              <div key={j} style={{display:"flex",gap:8,fontSize:12,color:C.muted,marginBottom:4,lineHeight:1.6}}>
                <span style={{color:C.gold,flexShrink:0}}>→</span><span>{r}</span>
              </div>
            ))}
          </div>
        ))}

        <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:12,marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:12,color:C.gold,fontWeight:600}}>En rejoignant le Club Tymeless, vous acceptez l'intégralité de ce règlement.</div>
        </div>
        <Btn v="gold" full onClick={()=>setShowRegles(false)}>✓ J'accepte le règlement</Btn>
      </div>
    </div>
  );

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}
      {showRegles&&<PopupRegles/>}

      {/* MODAL FICHE MEMBRE */}
      {modal==="fiche"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${TYPE_COLORS[selected.type]||C.gold}44`,borderRadius:14,padding:24,width:540,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:16,fontWeight:700}}>{selected.nom}</div>
                <div style={{fontSize:11,color:C.muted}}>{selected.metier} · {selected.ville}, {selected.pays}</div>
                <div style={{display:"flex",gap:6,marginTop:4}}>
                  <Pill label={selected.type} color={TYPE_COLORS[selected.type]||C.gold}/>
                  <Pill label={selected.abo_actif?"✓ Abonné":"○ Inactif"} color={selected.abo_actif?C.green:C.muted}/>
                </div>
              </div>
              <Btn sm v="ghost" onClick={()=>{setModal(null);setAiResult(null);}}>✕</Btn>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {[["CA généré",fmt(selected.ca_genere,"EUR"),C.gold],["Deals",selected.deals,C.blue],["Note","★ "+selected.note,C.green]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>

            <Card style={{padding:12,marginBottom:10}}>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:8}}>{selected.bio}</div>
              {[["📱",selected.tel],["📧",selected.email],["🏷️","Services : "+selected.services?.join(", ")],["🎯","Besoin : "+selected.besoin]].map(([ico,v],i)=>(
                <div key={i} style={{display:"flex",gap:8,fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span>{ico}</span><span style={{color:C.muted}}>{v}</span></div>
              ))}
            </Card>

            <Card style={{padding:12,marginBottom:12,borderColor:`${C.purple}44`}}>
              <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>🤖 IA Match</div>
              {aiLoading?<div style={{textAlign:"center",color:C.purple,fontSize:12}}>🤖 Analyse...</div>
              :aiResult?<div style={{fontSize:12,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiResult}</div>
              :<Btn v="purple" full onClick={()=>matcherIA(selected)}>🤖 Trouver les synergies business</Btn>}
            </Card>

            <div style={{display:"flex",gap:8}}>
              <Btn v="ghost" full onClick={()=>showToast(`📲 Message envoyé à ${selected.nom}`)}>📲 Contacter</Btn>
              <Btn v="gold" full onClick={()=>{
                setDeals(p=>[{id:Date.now(),vendeur:selected.nom,acheteur:"Membre",montant:3000,comm:300,statut:"en_attente",date:"Maintenant",description:"Deal initié via Club",type:"mise_en_relation"},...p]);
                setModal(null);showToast(`🤝 Deal initié avec ${selected.nom} !`);
              }}>💼 Initier un deal</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUTER MEMBRE */}
      {modal==="ajouter"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:480,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouveau membre Club</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Type de membre</div>
                <div style={{display:"flex",gap:6}}>
                  {["client","partenaire","fournisseur"].map(t=>(
                    <button key={t} onClick={()=>setNewMembre(p=>({...p,type:t}))} style={{flex:1,padding:"7px",border:`1px solid ${newMembre.type===t?TYPE_COLORS[t]:C.border}`,borderRadius:7,background:newMembre.type===t?`${TYPE_COLORS[t]}22`:C.card2,color:newMembre.type===t?TYPE_COLORS[t]:C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:newMembre.type===t?700:400}}>{t}</button>
                  ))}
                </div>
              </div>
              {[["Nom complet *","nom","text","Ahmed Barro"],["Métier *","metier","text","Restaurant / Traiteur"],["Ville","ville","text","Dakar"],["Téléphone","tel","text","+221 77..."],["Email","email","email","ahmed@email.com"],["Pays","pays","text","Sénégal"]].map(([l,k,t,ph])=>(
                <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={newMembre[k]} onChange={e=>setNewMembre(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
              ))}
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Secteur</div><Sel value={newMembre.secteur} onChange={e=>setNewMembre(p=>({...p,secteur:e.target.value}))} options={SECTEURS.filter(s=>s!=="tous").map(s=>({v:s,l:s}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Bio</div><textarea value={newMembre.bio} onChange={e=>setNewMembre(p=>({...p,bio:e.target.value}))} placeholder="Présentation..." style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontFamily:"inherit",fontSize:12,minHeight:60,resize:"vertical"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Besoin / Recherche</div><Inp placeholder="Cherche partenaires hôtels..." value={newMembre.besoin} onChange={e=>setNewMembre(p=>({...p,besoin:e.target.value}))} style={{width:"100%"}}/></div>
              <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:10,fontSize:11,color:C.gold}}>
                💳 Abonnement Club : 29€/mois · Paiement via Wallet Tymeless
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newMembre.nom||!newMembre.metier)return;
                setMembres(p=>[{id:Date.now(),...newMembre,ca_genere:0,deals:0,note:0,services:[newMembre.metier],actif:true,abo_actif:true},...p]);
                setModal(null);
                setNewMembre({nom:"",metier:"",pays:"France",ville:"",tel:"",email:"",secteur:"conciergerie",type:"client",bio:"",besoin:""});
                showToast("✓ Membre ajouté au Club Tymeless !");
              }}>✓ Valider l'adhésion</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <STitle sub="Club privé mondial · Deals · IA Match · Commissions 10%">◱ Club Tymeless</STitle>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={()=>setShowRegles(true)}>📜 Règlement</Btn>
          <Btn v="ghost" onClick={()=>setModal("ajouter")}>+ Membre</Btn>
          <Btn v="gold" onClick={()=>showToast("🔗 Lien invitation copié !")}>🔗 Inviter</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Membres actifs" val={membres.filter(m=>m.actif).length} color={C.blue}/>
        <KPI label="Abonnés 29€/mois" val={abos} color={C.gold}/>
        <KPI label="Revenus abos" val={fmt(revenusAbos,"EUR")} color={C.green}/>
        <KPI label="Commissions deals" val={fmt(totalComm,"EUR")} color={C.teal}/>
        <KPI label="CA total réseau" val={fmt(totalCA,"EUR")} color={C.purple}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── ANNUAIRE ── */}
      {tab==="annuaire"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <Inp placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:180}}/>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {TYPES.map(t=>(
                <button key={t} onClick={()=>setFiltreSecteur(t==="tous"?"tous":t)} style={{padding:"4px 10px",border:`1px solid ${filtreSecteur===t?TYPE_COLORS[t]||C.gold:C.border}`,borderRadius:20,background:filtreSecteur===t?`${TYPE_COLORS[t]||C.gold}22`:C.card2,color:filtreSecteur===t?TYPE_COLORS[t]||C.gold:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>
                  {t==="tous"?"Tous":t}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:5}}>
              {["tous",...pays].map(p=>(
                <button key={p} onClick={()=>setFiltrePays(p)} style={{padding:"4px 10px",border:`1px solid ${filtrePays===p?C.teal:C.border}`,borderRadius:20,background:filtrePays===p?`${C.teal}22`:C.card2,color:filtrePays===p?C.teal:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>
                  {p==="tous"?"Tous pays":p}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {membresFiltres.map((m,i)=>(
              <Card key={i} style={{cursor:"pointer",borderColor:`${TYPE_COLORS[m.type]||C.teal}22`,transition:"all 0.2s"}}
                onClick={()=>{setSelected(m);setAiResult(null);setModal("fiche");}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=TYPE_COLORS[m.type]||C.teal}
                onMouseLeave={e=>e.currentTarget.style.borderColor=`${TYPE_COLORS[m.type]||C.teal}22`}
              >
                <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:`${TYPE_COLORS[m.type]||C.teal}22`,border:`1px solid ${TYPE_COLORS[m.type]||C.teal}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:TYPE_COLORS[m.type]||C.teal,flexShrink:0}}>{m.nom[0]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.text}}>{m.nom}</div>
                    <div style={{fontSize:11,color:TYPE_COLORS[m.type]||C.teal}}>{m.metier}</div>
                    <div style={{fontSize:10,color:C.muted}}>{m.ville}, {m.pays}</div>
                  </div>
                  <Pill label={m.type} color={TYPE_COLORS[m.type]||C.teal}/>
                </div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:8,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{m.bio}</div>
                <div style={{background:`${TYPE_COLORS[m.type]||C.teal}11`,borderRadius:6,padding:"5px 8px",marginBottom:8,fontSize:10,color:TYPE_COLORS[m.type]||C.teal}}>🎯 {m.besoin}</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:8}}>
                  <span style={{color:C.gold,fontWeight:600}}>{fmt(m.ca_genere,"EUR")}</span>
                  <span style={{color:C.gold}}>★ {m.note}</span>
                </div>
                <div style={{display:"flex",gap:5}}>
                  <Btn sm v="ghost" onClick={e=>{e.stopPropagation();showToast(`📲 Message à ${m.nom}`);}}>📲</Btn>
                  <Btn sm v="purple" onClick={e=>{e.stopPropagation();matcherIA(m);setSelected(m);setModal("fiche");}}>🤖 Match</Btn>
                  <Btn sm v="gold" onClick={e=>{e.stopPropagation();setDeals(p=>[{id:Date.now(),vendeur:m.nom,acheteur:"Membre",montant:3000,comm:300,statut:"en_attente",date:"Maintenant",description:"Deal Club Tymeless",type:"deal"},...p]);showToast(`💼 Deal initié avec ${m.nom} !`);}}>💼 Deal</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── OFFRES & DEMANDES ── */}
      {tab==="offres"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:700,color:C.green}}>📢 Offres de services</div>
                <Btn sm v="green" onClick={()=>{
                  if(!newOffre.titre)return;
                  setOffres(p=>[{id:Date.now(),membre:"Curtiss",date:"Maintenant",...newOffre},...p]);
                  setNewOffre({titre:"",desc:"",prix:"",secteur:"conciergerie"});
                  showToast("✓ Offre publiée !");
                }}>+ Publier</Btn>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
                <Inp placeholder="Titre de l'offre" value={newOffre.titre} onChange={e=>setNewOffre(p=>({...p,titre:e.target.value}))} style={{width:"100%"}}/>
                <Inp placeholder="Prix / Budget" value={newOffre.prix} onChange={e=>setNewOffre(p=>({...p,prix:e.target.value}))} style={{width:"100%"}}/>
              </div>
              {offres.map((o,i)=>(
                <Card key={i} style={{marginBottom:8,borderColor:`${C.green}33`,padding:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:12,color:C.text}}>{o.titre}</span>
                    <span style={{fontSize:11,color:C.green,fontWeight:700}}>{o.prix}</span>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{o.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,color:C.muted}}>{o.membre} · {o.date}</span>
                    <Btn sm v="gold" onClick={()=>showToast(`💼 Intérêt envoyé à ${o.membre} !`)}>💼 Je suis intéressé</Btn>
                  </div>
                </Card>
              ))}
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:700,color:C.orange}}>🔍 Demandes</div>
                <Btn sm v="orange" onClick={()=>{
                  if(!newDemande.titre)return;
                  setDemandes(p=>[{id:Date.now(),membre:"Curtiss",date:"Maintenant",...newDemande},...p]);
                  setNewDemande({titre:"",desc:"",budget:"",secteur:"conciergerie"});
                  showToast("✓ Demande publiée !");
                }}>+ Publier</Btn>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
                <Inp placeholder="Titre de la demande" value={newDemande.titre} onChange={e=>setNewDemande(p=>({...p,titre:e.target.value}))} style={{width:"100%"}}/>
                <Inp placeholder="Budget" value={newDemande.budget} onChange={e=>setNewDemande(p=>({...p,budget:e.target.value}))} style={{width:"100%"}}/>
              </div>
              {demandes.map((d,i)=>(
                <Card key={i} style={{marginBottom:8,borderColor:`${C.orange}33`,padding:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:12,color:C.text}}>{d.titre}</span>
                    <span style={{fontSize:11,color:C.orange,fontWeight:700}}>{d.budget}</span>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{d.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,color:C.muted}}>{d.membre} · {d.date}</span>
                    <Btn sm v="gold" onClick={()=>showToast(`💼 Proposition envoyée à ${d.membre} !`)}>💼 Je propose</Btn>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DEALS ── */}
      {tab==="deals"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            <KPI label="Deals totaux" val={deals.length} color={C.blue}/>
            <KPI label="Commissions Tymeless" val={fmt(totalComm,"EUR")} color={C.gold}/>
            <KPI label="Deals signés" val={deals.filter(d=>d.statut==="signé").length} color={C.green}/>
          </div>
          <Card>
            <CT>💼 Tous les deals du Club</CT>
            {deals.map((d,i)=>(
              <div key={i} style={{background:d.statut==="signé"?`${C.green}08`:d.statut==="en_cours"?`${C.blue}08`:`${C.orange}08`,border:`1px solid ${d.statut==="signé"?C.green:d.statut==="en_cours"?C.blue:C.orange}33`,borderRadius:10,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>
                      <span style={{color:C.teal}}>{d.vendeur}</span>
                      <span style={{color:C.muted}}> → </span>
                      <span style={{color:C.gold}}>{d.acheteur}</span>
                    </div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{d.description} · {d.date}</div>
                    <Pill label={d.type==="mise_en_relation"?"🤝 Mise en relation":"💼 Deal direct"} color={d.type==="mise_en_relation"?C.purple:C.blue}/>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:16,fontWeight:700,color:C.text}}>{fmt(d.montant,"EUR")}</div>
                    <div style={{fontSize:12,color:C.gold,fontWeight:600}}>Comm Tymeless : {fmt(d.comm,"EUR")} (10%)</div>
                    <Pill label={d.statut==="signé"?"✅ Signé":d.statut==="en_cours"?"● En cours":"⏳ En attente"} color={d.statut==="signé"?C.green:d.statut==="en_cours"?C.blue:C.orange}/>
                  </div>
                </div>
                {d.statut==="en_attente"&&(
                  <div style={{display:"flex",gap:7}}>
                    <Btn sm v="green" onClick={()=>{setDeals(p=>p.map(x=>x.id===d.id?{...x,statut:"signé"}:x));showToast(`✅ Deal signé ! Commission ${fmt(d.comm,"EUR")} encaissée `);}}>✅ Marquer signé</Btn>
                    <Btn sm v="red" onClick={()=>{setDeals(p=>p.filter(x=>x.id!==d.id));showToast("Deal annulé","#EF4444");}}>✕ Annuler</Btn>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── REVENUS ── */}
      {tab==="revenus"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.gold}44`,background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
            <CT>💰 Mes revenus Club Tymeless</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
              {[
                {l:"Abonnements ("+abos+" membres × 29€)",v:revenusAbos,c:C.green,ico:"💳"},
                {l:"Commissions deals (10%)",v:totalComm,c:C.gold,ico:"💼"},
                {l:"Total revenus Club",v:revenusAbos+totalComm,c:C.purple,ico:"🏆"},
              ].map((k,i)=>(
                <div key={i} style={{background:C.card2,border:`1px solid ${k.c}33`,borderRadius:10,padding:14,textAlign:"center"}}>
                  <div style={{fontSize:20,marginBottom:6}}>{k.ico}</div>
                  <div style={{fontSize:20,fontWeight:700,color:k.c}}>{fmt(k.v,"EUR")}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:4,lineHeight:1.5}}>{k.l}</div>
                </div>
              ))}
            </div>
            <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:12}}>
              <div style={{fontSize:12,color:C.gold,fontWeight:600,marginBottom:4}}>📈 Projection annuelle</div>
              <div style={{display:"flex",gap:20,fontSize:12,color:C.muted}}>
                <span>Abos : <b style={{color:C.green}}>{fmt(revenusAbos*12,"EUR")}/an</b></span>
                <span>Commissions : <b style={{color:C.gold}}>{fmt(totalComm*12,"EUR")}/an</b></span>
                <span>Total : <b style={{color:C.purple}}>{fmt((revenusAbos+totalComm)*12,"EUR")}/an</b></span>
              </div>
            </div>
          </Card>
          <Card>
            <CT>📊 Évolution revenus Club</CT>
            {[["Jan",580],["Fév",870],["Mar",1160],["Avr",1450],["Mai",revenusAbos+totalComm]].map(([m,v],i)=>(
              <div key={i} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <span style={{color:C.muted}}>{m}</span>
                  <span style={{fontWeight:700,color:C.gold}}>{fmt(v,"EUR")}</span>
                </div>
                <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${(v/(revenusAbos+totalComm))*100}%`,background:C.gold,borderRadius:2}}/></div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── IA MATCH ── */}
      {tab==="ia_match"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 IA Match — Claude trouve les meilleures synergies</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.7}}>
              Claude analyse tous les profils du Club et identifie automatiquement les meilleures opportunités de business entre les membres. Chaque match = deal potentiel = commission pour Tymeless.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {membres.slice(0,6).map((m,i)=>(
                <button key={i} onClick={()=>{setSelected(m);matcherIA(m);}} style={{background:C.card2,border:`1px solid ${TYPE_COLORS[m.type]||C.border}33`,borderRadius:8,padding:10,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=TYPE_COLORS[m.type]||C.purple}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=`${TYPE_COLORS[m.type]||C.border}33`}
                >
                  <div style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:2}}>{m.nom}</div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{m.metier}</div>
                  <Pill label={m.type} color={TYPE_COLORS[m.type]||C.muted}/>
                </button>
              ))}
            </div>
          </Card>
          {aiLoading&&(
            <Card style={{textAlign:"center",padding:30,marginBottom:14}}>
              <div style={{fontSize:32,marginBottom:8}}>🤖</div>
              <div style={{color:C.purple,fontWeight:600}}>Analyse des synergies de {selected?.nom}...</div>
            </Card>
          )}
          {aiResult&&!aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
              <CT>🤖 Synergies identifiées pour {selected?.nom}</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14}}>{aiResult}</div>
              <Btn v="gold" onClick={()=>{
                setDeals(p=>[{id:Date.now(),vendeur:selected?.nom||"Membre",acheteur:"Match IA",montant:5000,comm:500,statut:"en_attente",date:"Maintenant",description:"Deal créé par IA Match",type:"mise_en_relation"},...p]);
                showToast("💼 Deal créé depuis l'IA Match ! Commission 500€ potentielle");
              }}>💼 Créer le deal (10% = 500€ pour Tymeless)</Btn>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

const PageWalletMembres=()=>{
  const [tab,setTab]=useState("wallets");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const [selected,setSelected]=useState(null);
  const [modal,setModal]=useState(null);

  const [wallets,setWallets]=useState([
    {id:1,membre:"Sofia Riad",type:"client",solde:1240,abo_actif:true,date_debut:"15/01/2025",date_fin:"15/01/2026",mois_restants:8,derniere_activite:"Aujourd'hui",iban:"FR76 3000 1234 5678",transactions:[
      {date:"20/05",desc:"Commission deal Club",montant:+340,type:"entree"},
      {date:"01/05",desc:"Abonnement -29€",montant:-29,type:"sortie"},
      {date:"28/04",desc:"Commission deal",montant:+180,type:"entree"},
      {date:"01/04",desc:"Abonnement -29€",montant:-29,type:"sortie"},
    ]},
    {id:2,membre:"Ahmed Al-Rashid",type:"client",solde:4800,abo_actif:true,date_debut:"01/03/2025",date_fin:"01/03/2026",mois_restants:10,derniere_activite:"Hier",iban:"AE33 0260 1234 5678 9012 345",transactions:[
      {date:"18/05",desc:"Deal Yacht — 10% Tymeless",montant:+800,type:"entree"},
      {date:"01/05",desc:"Abonnement -29€",montant:-29,type:"sortie"},
      {date:"15/04",desc:"Commission mise en relation",montant:+450,type:"entree"},
    ]},
    {id:3,membre:"Nassim Belkacem",type:"partenaire",solde:6200,abo_actif:true,date_debut:"01/11/2024",date_fin:"01/11/2025",mois_restants:2,derniere_activite:"Il y a 2j",iban:"DZ XX XXXXX",transactions:[
      {date:"15/05",desc:"Commission apporteur",montant:+2400,type:"entree"},
      {date:"01/05",desc:"Abonnement -29€",montant:-29,type:"sortie"},
      {date:"28/04",desc:"Commission deal BTP",montant:+980,type:"entree"},
    ]},
    {id:4,membre:"Claire Fontaine",type:"partenaire",solde:320,abo_actif:true,date_debut:"15/02/2025",date_fin:"15/02/2026",mois_restants:9,derniere_activite:"Il y a 5j",iban:"FR76 1234 5678 9012",transactions:[
      {date:"10/05",desc:"Commission deal",montant:+180,type:"entree"},
      {date:"01/04",desc:"Abonnement -29€",montant:-29,type:"sortie"},
    ]},
    {id:5,membre:"Moussa Konaté",type:"fournisseur",solde:0,abo_actif:false,date_debut:"01/04/2025",date_fin:"01/04/2026",mois_restants:11,derniere_activite:"Il y a 10j",iban:"CI XX XXXX",transactions:[
      {date:"25/04",desc:"Commission deal",montant:+120,type:"entree"},
      {date:"25/04",desc:"Retrait IBAN",montant:-120,type:"sortie"},
    ]},
  ]);

  const totalSoldes=wallets.reduce((s,w)=>s+w.solde,0);
  const abosActifs=wallets.filter(w=>w.abo_actif).length;
  const revenuAbos=abosActifs*29;
  const renouvBientot=wallets.filter(w=>w.mois_restants<=2&&w.abo_actif);
  const TC={"client":C.blue,"partenaire":C.gold,"fournisseur":C.teal};

  const TABS=[
    {id:"wallets",label:"💳 Wallets"},
    {id:"renouvellements",label:"🔄 Renouvellements"},
    {id:"revenus",label:"💰 Revenus Club"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {/* MODAL FICHE WALLET */}
      {modal==="fiche"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${TC[selected.type]||C.gold}44`,borderRadius:14,padding:24,width:480,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:16,fontWeight:700}}>{selected.membre}</div>
                <div style={{display:"flex",gap:5,marginTop:4}}>
                  <Pill label={selected.type} color={TC[selected.type]||C.gold}/>
                  <Pill label={selected.abo_actif?"✅ Actif":"❌ Inactif"} color={selected.abo_actif?C.green:C.red}/>
                </div>
              </div>
              <Btn sm v="ghost" onClick={()=>setModal(null)}>✕</Btn>
            </div>

            {/* SOLDE */}
            <div style={{background:`linear-gradient(135deg,${C.card2},#001A0A)`,border:`1px solid ${C.green}44`,borderRadius:12,padding:16,textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Solde disponible</div>
              <div style={{fontSize:36,fontWeight:700,color:C.green}}>{fmt(selected.solde,"EUR")}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:4}}>Dernière activité : {selected.derniere_activite}</div>
            </div>

            {/* ABONNEMENT */}
            <Card style={{padding:12,marginBottom:12,borderColor:`${C.gold}33`}}>
              <div style={{fontSize:10,color:C.gold,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Abonnement Club 29€/mois</div>
              {[["Début",selected.date_debut],["Fin / Renouvellement",selected.date_fin],["Mois restants",selected.mois_restants+" mois"],["IBAN retrait",selected.iban||"Non renseigné"]].map(([l,v],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <span style={{color:C.muted}}>{l}</span>
                  <span style={{color:selected.mois_restants<=2&&l.includes("restants")?C.orange:C.text,fontWeight:500}}>{v}</span>
                </div>
              ))}
            </Card>

            {/* HISTORIQUE */}
            <Card style={{padding:12,marginBottom:12}}>
              <div style={{fontSize:10,color:C.gold,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Historique transactions</div>
              {selected.transactions.map((t,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <div><span style={{color:C.muted,marginRight:8,fontFamily:"monospace"}}>{t.date}</span><span style={{color:C.text}}>{t.desc}</span></div>
                  <span style={{fontWeight:700,color:t.type==="entree"?C.green:C.red}}>{t.montant>0?"+":""}{fmt(t.montant,"EUR")}</span>
                </div>
              ))}
            </Card>

            <div style={{display:"flex",gap:8}}>
              <Btn v="gold" full onClick={()=>showToast(`💳 ${fmt(selected.solde,"EUR")} viré vers ${selected.iban||"IBAN"} ✅`)}>💳 Retrait IBAN</Btn>
              {!selected.abo_actif&&<Btn v="green" full onClick={()=>{setWallets(p=>p.map(x=>x.id===selected.id?{...x,abo_actif:true}:x));setModal(null);showToast(`✅ Abonnement ${selected.membre} réactivé ！`);}}>▶ Réactiver</Btn>}
              <Btn v="ghost" sm onClick={()=>showToast(`📲 Message envoyé à ${selected.membre}`)}>📲</Btn>
            </div>
          </div>
        </div>
      )}

      <STitle sub="Wallets membres · Abonnements · Renouvellements · Revenus Club">◈ Wallets Membres</STitle>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Membres actifs" val={abosActifs} color={C.blue}/>
        <KPI label="Total soldes" val={fmt(totalSoldes,"EUR")} color={C.green}/>
        <KPI label="Revenus abos/mois" val={fmt(revenuAbos,"EUR")} color={C.gold}/>
        <KPI label="Renouvellements proches" val={renouvBientot.length} color={renouvBientot.length>0?C.orange:C.green}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {tab==="wallets"&&(
        <div>
          {renouvBientot.length>0&&(
            <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}44`,borderRadius:10,padding:12,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,color:C.orange,marginBottom:8}}>⏰ Renouvellements dans moins de 2 mois</div>
              {renouvBientot.map((w,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,borderRadius:7,padding:"8px 12px",marginBottom:6}}>
                  <div><span style={{fontWeight:600}}>{w.membre}</span><span style={{fontSize:10,color:C.muted,marginLeft:8}}>Expire le {w.date_fin}</span></div>
                  <div style={{display:"flex",gap:7}}>
                    <Pill label={`${w.mois_restants} mois`} color={C.orange}/>
                    <Btn sm v="gold" onClick={()=>showToast(`📲 Rappel renouvellement envoyé à ${w.membre}`)}>📲 Rappel</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            {wallets.map((w,i)=>(
              <Card key={i} style={{cursor:"pointer",borderColor:`${TC[w.type]||C.teal}33`,transition:"all 0.2s"}}
                onClick={()=>{setSelected(w);setModal("fiche");}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
              >
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:`${TC[w.type]||C.teal}22`,border:`1px solid ${TC[w.type]||C.teal}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:TC[w.type]||C.teal}}>{w.membre[0]}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>{w.membre}</div>
                      <div style={{fontSize:10,color:C.muted}}>{w.type} · {w.derniere_activite}</div>
                    </div>
                  </div>
                  <Pill label={w.abo_actif?"✅ Actif":"❌ Inactif"} color={w.abo_actif?C.green:C.red}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div style={{background:C.card2,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:C.muted,marginBottom:2}}>Solde</div>
                    <div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(w.solde,"EUR")}</div>
                  </div>
                  <div style={{background:C.card2,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:C.muted,marginBottom:2}}>Fin abonnement</div>
                    <div style={{fontSize:12,fontWeight:700,color:w.mois_restants<=2?C.orange:C.text}}>{w.date_fin}</div>
                    <div style={{fontSize:9,color:w.mois_restants<=2?C.orange:C.muted}}>{w.mois_restants} mois restants</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <Btn sm v="gold" onClick={e=>{e.stopPropagation();showToast(`💳 ${fmt(w.solde,"EUR")} viré à ${w.membre}`);}}>💳 Retrait</Btn>
                  <Btn sm v="ghost" onClick={e=>{e.stopPropagation();showToast(`📲 Message à ${w.membre}`);}}>📲 WA</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab==="renouvellements"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.blue}44`}}>
            <CT>🔄 Calendrier des renouvellements annuels</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Abonnement 29€/mois × 12 mois = 348€/an. Renouvellement automatique 30j avant la date de fin.</div>
            <TH heads={["Membre","Type","Début","Fin","Mois restants","Statut","Action"]} rows={wallets.map((w,i)=>(
              <tr key={i}>
                <Td><span style={{fontWeight:600}}>{w.membre}</span></Td>
                <Td><Pill label={w.type} color={TC[w.type]||C.teal}/></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{w.date_debut}</span></Td>
                <Td><span style={{fontSize:11,fontWeight:600}}>{w.date_fin}</span></Td>
                <Td>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{height:4,width:50,borderRadius:2,background:C.border}}>
                      <div style={{height:"100%",width:`${(w.mois_restants/12)*100}%`,background:w.mois_restants<=2?C.orange:C.green,borderRadius:2}}/>
                    </div>
                    <span style={{fontSize:11,color:w.mois_restants<=2?C.orange:C.green,fontWeight:600}}>{w.mois_restants} mois</span>
                  </div>
                </Td>
                <Td><Pill label={w.abo_actif?w.mois_restants<=2?"⏰ Bientôt":"✅ Actif":"❌ Expiré"} color={w.abo_actif?w.mois_restants<=2?C.orange:C.green:C.red}/></Td>
                <Td>
                  <Btn sm v="ghost" onClick={()=>showToast(`📲 Rappel renouvellement envoyé à ${w.membre}`)}>📲 Rappel WA</Btn>
                </Td>
              </tr>
            ))}/>
          </Card>

          <Card style={{borderColor:`${C.green}44`}}>
            <CT>⚡ Renouvellements automatiques</CT>
            {[["30 jours avant","WhatsApp au membre — rappel renouvellement"],["7 jours avant","Deuxième rappel WhatsApp"],["Jour J","Débit automatique 348€ ou 29€/mois"],["Si échec paiement","Alerte WhatsApp + accès suspendu 48h"],["Après paiement","Confirmation WA + accès renouvelé 12 mois"]].map(([e,a],i)=>(
              <div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                <Pill label={e} color={C.blue}/>
                <span style={{color:C.muted,flex:1}}>{a}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="revenus"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
            {[["💳 Abonnements ce mois",fmt(revenuAbos,"EUR"),C.green,"29€ × "+abosActifs+" membres"],["💼 Commissions deals",fmt(wallets.reduce((s,w)=>s+w.transactions.filter(t=>t.type==="entree"&&t.desc.includes("Commission")).reduce((ss,t)=>ss+t.montant,0),0),"EUR"),C.gold,"10% sur chaque deal"],["📅 Projection annuelle",fmt(revenuAbos*12,"EUR"),C.purple,"Revenus récurrents abos"]].map(([l,v,c,sub],i)=>(
              <Card key={i} style={{borderColor:`${c}44`,textAlign:"center"}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{l}</div>
                <div style={{fontSize:24,fontWeight:700,color:c}}>{v}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:4}}>{sub}</div>
              </Card>
            ))}
          </div>
          <Card>
            <CT>📊 Évolution revenus Club</CT>
            {[["Jan",87],["Fév",116],["Mar",145],["Avr",174],["Mai",revenuAbos]].map(([m,v],i)=>(
              <div key={i} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:C.muted}}>{m} 2026</span><span style={{fontWeight:700,color:C.gold}}>{fmt(v,"EUR")}</span></div>
                <div style={{height:5,borderRadius:3,background:C.border}}><div style={{height:"100%",width:`${(v/revenuAbos)*100}%`,background:C.gold,borderRadius:3}}/></div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
};

const PageEvenements=()=>{
  const [tab,setTab]=useState("programme");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);

  const [evenements,setEvenements]=useState([
    {id:1,titre:"Networking Paris — Club Tymeless",type:"physique",date:"15/06/2026",heure:"18:30",lieu:"Le Meurice, Paris 1er",prix:0,places:30,inscrits:18,payes:15,description:"Soirée networking exclusive pour les membres du Club. Cocktails, présentations, deals.",statut:"ouvert",lien:"https://club.tymeless.fr/event/networking-paris-juin",qr:"QR-EVT-001"},
    {id:2,titre:"Visio Business Club — Mai 2026",type:"visio",date:"28/05/2026",heure:"20:00",lieu:"Zoom / Jitsi",prix:0,places:50,inscrits:32,payes:32,description:"Rencontre mensuelle des membres en visio. Présentations courtes, mises en relation.",statut:"complet",lien:"https://club.tymeless.fr/event/visio-mai",qr:"QR-EVT-002"},
    {id:3,titre:"Networking Dakar — Club Tymeless",type:"physique",date:"20/07/2026",heure:"19:00",lieu:"Terrou-Bi, Dakar",prix:0,places:40,inscrits:8,payes:8,description:"Premier événement Club Tymeless en Afrique. Networking entrepreneurs Sénégal & Diaspora.",statut:"ouvert",lien:"https://club.tymeless.fr/event/networking-dakar",qr:"QR-EVT-003"},
    {id:4,titre:"Visio Business Club — Juin 2026",type:"visio",date:"25/06/2026",heure:"20:00",lieu:"Zoom / Jitsi",prix:0,places:50,inscrits:5,payes:5,description:"Rencontre mensuelle des membres en visio.",statut:"ouvert",lien:"https://club.tymeless.fr/event/visio-juin",qr:"QR-EVT-004"},
  ]);

  const [newEvt,setNewEvt]=useState({titre:"",type:"physique",date:"",heure:"",lieu:"",prix:0,places:30,description:""});

  const TYPE_COLOR={"physique":C.gold,"visio":C.blue,"masterclass":C.purple};
  const TYPE_ICON={"physique":"🌐","visio":"💻","masterclass":"🎓"};

  const TABS=[
    {id:"programme",label:"📅 Programme"},
    {id:"gestion",label:"⚙️ Gestion"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {/* MODAL CRÉER ÉVÉNEMENT */}
      {modal==="creer"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:480}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouvel événement</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Titre *</div><Inp placeholder="Networking Paris — Club Tymeless" value={newEvt.titre} onChange={e=>setNewEvt(p=>({...p,titre:e.target.value}))} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Type</div><Sel value={newEvt.type} onChange={e=>setNewEvt(p=>({...p,type:e.target.value}))} options={["physique","visio","masterclass"].map(v=>({v,l:TYPE_ICON[v]+" "+v}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Date</div><Inp type="date" value={newEvt.date} onChange={e=>setNewEvt(p=>({...p,date:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Heure</div><Inp type="time" value={newEvt.heure} onChange={e=>setNewEvt(p=>({...p,heure:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Lieu</div><Inp placeholder="Le Meurice, Paris 1er" value={newEvt.lieu} onChange={e=>setNewEvt(p=>({...p,lieu:e.target.value}))} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Places max</div><Inp type="number" placeholder="30" value={newEvt.places} onChange={e=>setNewEvt(p=>({...p,places:Number(e.target.value)}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Prix (0 = gratuit)</div><Inp type="number" placeholder="0" value={newEvt.prix} onChange={e=>setNewEvt(p=>({...p,prix:Number(e.target.value)}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Description</div><textarea value={newEvt.description} onChange={e=>setNewEvt(p=>({...p,description:e.target.value}))} placeholder="Description de l'événement..." style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontFamily:"inherit",fontSize:12,minHeight:60,resize:"vertical"}}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newEvt.titre||!newEvt.date)return;
                const id=Date.now();
                setEvenements(p=>[...p,{...newEvt,id,inscrits:0,payes:0,statut:"ouvert",lien:`https://club.tymeless.fr/event/${newEvt.titre.toLowerCase().replace(/ /g,"-")}`,qr:`QR-EVT-${id}`}]);
                setModal(null);
                setNewEvt({titre:"",type:"physique",date:"",heure:"",lieu:"",prix:0,places:30,description:""});
                showToast("✓ Événement créé ! Lien d'invitation généré.");
              }}>✓ Créer l'événement</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉTAIL ÉVÉNEMENT */}
      {modal==="detail"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${TYPE_COLOR[selected.type]||C.gold}44`,borderRadius:14,padding:24,width:520,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontSize:15,fontWeight:700}}>{TYPE_ICON[selected.type]} {selected.titre}</div>
                <div style={{fontSize:11,color:C.muted}}>{selected.date} à {selected.heure} · {selected.lieu}</div>
              </div>
              <Btn sm v="ghost" onClick={()=>setModal(null)}>✕</Btn>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {[["Inscrits",`${selected.inscrits}/${selected.places}`,C.blue],["Ont payé",selected.payes,C.green],["Places restantes",selected.places-selected.inscrits,C.orange]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>

            <Card style={{padding:12,marginBottom:12}}>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:10}}>{selected.description}</div>
              <div style={{height:6,borderRadius:3,background:C.border,marginBottom:4}}>
                <div style={{height:"100%",width:`${(selected.inscrits/selected.places)*100}%`,background:selected.inscrits>=selected.places?C.red:C.blue,borderRadius:3}}/>
              </div>
              <div style={{fontSize:10,color:C.muted}}>Taux de remplissage : {Math.round((selected.inscrits/selected.places)*100)}%</div>
            </Card>

            {/* Liens d'invitation */}
            <Card style={{padding:12,marginBottom:12,borderColor:`${C.teal}44`}}>
              <div style={{fontSize:10,color:C.teal,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>🔗 Liens d'invitation</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[["🔗 Lien public",selected.lien],["🎟️ QR Code check-in",selected.qr]].map(([l,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card2,borderRadius:6,padding:"6px 10px"}}>
                    <span style={{fontSize:11,color:C.muted}}>{l}</span>
                    <Btn sm v="ghost" onClick={()=>showToast(`📋 ${l} copié !`)}>📋 Copier</Btn>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              <Btn v="gold" onClick={()=>showToast("📲 Invitations envoyées à tous les membres du Club !")}>📲 Inviter membres</Btn>
              <Btn v="ghost" onClick={()=>showToast("🔗 Lien public copié !")}>🔗 Partager</Btn>
              <Btn v="teal" onClick={()=>showToast("📧 Invitations email envoyées")}>📧 Email</Btn>
              <Btn v="red" sm onClick={()=>{setEvenements(p=>p.filter(x=>x.id!==selected.id));setModal(null);showToast("Supprimé","#EF4444");}}>🗑</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="Programme Club · Networking · Visio · Inscription · QR Code">◆ Événements Club</STitle>
        <Btn v="gold" onClick={()=>setModal("creer")}>+ Créer événement</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Événements à venir" val={evenements.filter(e=>e.statut==="ouvert").length} color={C.blue}/>
        <KPI label="Total inscrits" val={evenements.reduce((s,e)=>s+e.inscrits,0)} color={C.gold}/>
        <KPI label="Événements complets" val={evenements.filter(e=>e.statut==="complet").length} color={C.green}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {tab==="programme"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
          {evenements.map((e,i)=>{
            const tc=TYPE_COLOR[e.type]||C.gold;
            const pct=Math.round((e.inscrits/e.places)*100);
            return(
              <Card key={i} style={{borderColor:`${tc}33`,cursor:"pointer",transition:"all 0.2s"}}
                onClick={()=>{setSelected(e);setModal("detail");}}
                onMouseEnter={ev=>ev.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={ev=>ev.currentTarget.style.transform="translateY(0)"}
              >
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:18}}>{TYPE_ICON[e.type]}</span>
                      <Pill label={e.type} color={tc}/>
                      <Pill label={e.statut==="complet"?"🔴 Complet":"🟢 Ouvert"} color={e.statut==="complet"?C.red:C.green}/>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.3}}>{e.titre}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,fontSize:11,color:C.muted,marginBottom:10}}>
                  <span>📅 {e.date} à {e.heure}</span>
                  <span>📍 {e.lieu.substring(0,20)}...</span>
                </div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:10,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{e.description}</div>
                <div style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:3}}>
                    <span style={{color:C.muted}}>Inscrits</span>
                    <span style={{color:tc,fontWeight:600}}>{e.inscrits}/{e.places}</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:C.border}}>
                    <div style={{height:"100%",width:`${pct}%`,background:pct>=100?C.red:tc,borderRadius:2}}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {e.statut==="ouvert"&&<Btn sm v="gold" onClick={ev=>{ev.stopPropagation();setEvenements(p=>p.map(x=>x.id===e.id?{...x,inscrits:Math.min(x.inscrits+1,x.places)}:x));showToast("✅ Inscription confirmée !");}}>✅ S'inscrire</Btn>}
                  <Btn sm v="ghost" onClick={ev=>{ev.stopPropagation();showToast("🔗 Lien copié !");}}>🔗 Partager</Btn>
                  <Btn sm v="ghost" onClick={ev=>{ev.stopPropagation();showToast("📲 Invitation WA envoyée");}}>📲</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab==="gestion"&&(
        <Card>
          <CT>⚙️ Gestion des événements — Vue Curtiss</CT>
          <TH heads={["Événement","Type","Date","Inscrits","Payés","Places","Statut","Actions"]} rows={evenements.map((e,i)=>(
            <tr key={i}>
              <Td><span style={{fontWeight:600,fontSize:12}}>{e.titre.substring(0,30)}...</span></Td>
              <Td><Pill label={TYPE_ICON[e.type]+" "+e.type} color={TYPE_COLOR[e.type]||C.gold}/></Td>
              <Td><span style={{fontSize:11,color:C.muted}}>{e.date}</span></Td>
              <Td><span style={{fontWeight:700,color:C.blue}}>{e.inscrits}/{e.places}</span></Td>
              <Td><span style={{fontWeight:700,color:C.green}}>{e.payes}</span></Td>
              <Td>
                <div style={{height:4,width:50,borderRadius:2,background:C.border}}>
                  <div style={{height:"100%",width:`${(e.inscrits/e.places)*100}%`,background:e.inscrits>=e.places?C.red:C.blue,borderRadius:2}}/>
                </div>
              </Td>
              <Td><Pill label={e.statut==="complet"?"🔴 Complet":"🟢 Ouvert"} color={e.statut==="complet"?C.red:C.green}/></Td>
              <Td>
                <div style={{display:"flex",gap:4}}>
                  <Btn sm v="gold" onClick={()=>showToast("📲 Invitations envoyées !")}>📲</Btn>
                  <Btn sm v="ghost" onClick={()=>showToast("🔗 Lien copié !")}>🔗</Btn>
                  <Btn sm v="ghost" onClick={()=>showToast("🎟️ QR Code généré !")}>🎟️</Btn>
                  <Btn sm v="red" onClick={()=>{setEvenements(p=>p.filter(x=>x.id!==e.id));showToast("Supprimé","#EF4444");}}>🗑</Btn>
                </div>
              </Td>
            </tr>
          ))}/>
        </Card>
      )}
    </div>
  );
};

const PageScoring=({profil=PROFIL_DEFAUT})=>{
  const [tab,setTab]=useState("nps");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);

  const [avis,setAvis]=useState([
    {id:1,client:"Sofia Riad",note:5,service:"Airbnb",comm:"Service impeccable, équipe très professionnelle ! Je recommande vivement.",google:true,date:"Auj. 09:00",repondu:false,plateforme:"Google"},
    {id:2,client:"Ahmed Al-Rashid",note:5,service:"Jet Privé",comm:"Prestation de très haute qualité. Parfait pour notre clientèle VIP.",google:true,date:"Hier",repondu:true,plateforme:"Google"},
    {id:3,client:"Isabelle Moreau",note:5,service:"Résidentiel",comm:"Tymeless c'est le top, je recommande à tous mes amis.",google:false,date:"Il y a 3j",repondu:false,plateforme:"WhatsApp"},
    {id:4,client:"Marc Dupont",note:3,service:"Bureaux",comm:"Service correct mais délai un peu long. À améliorer.",google:false,date:"Il y a 5j",repondu:false,plateforme:"Email"},
    {id:5,client:"Pierre Lefevre",note:4,service:"Rapatriement",comm:"Très bien géré dans un moment difficile. Merci.",google:true,date:"Il y a 7j",repondu:true,plateforme:"Google"},
  ]);

  const [reponseModal,setReponseModal]=useState(null);
  const [reponseText,setReponseText]=useState("");
  const [autoEnvoi,setAutoEnvoi]=useState(true);

  const notesMoyenne=(avis.reduce((s,a)=>s+a.note,0)/avis.length).toFixed(1);
  const npsScore=Math.round(((avis.filter(a=>a.note>=4).length-avis.filter(a=>a.note<=2).length)/avis.length)*100);
  const google=avis.filter(a=>a.google);

  const analyserIA=async()=>{
    setAiLoading(true);
    try{
      const prompt=`Analyse ces avis clients et donne 3 recommandations pour améliorer la réputation.
Avis: ${avis.map(a=>`${a.client}(${a.note}/5): "${a.comm}"`).join(" | ")}
Note moyenne: ${notesMoyenne}/5 · NPS: +${npsScore}
Sois concis et actionnable.`;
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiResult(data.content?.[0]?.text||"Analyse non disponible");
    }catch(e){setAiResult("Erreur — Vérifiez la connexion");}
    setAiLoading(false);
  };

  const TABS=[
    {id:"nps",label:"⭐ NPS & Notes"},
    {id:"avis",label:"💬 Avis clients"},
    {id:"google",label:"🔍 Google"},
    {id:"widget",label:"🔌 Widget"},
    {id:"ia",label:"🤖 IA"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {reponseModal&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:440}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Répondre à {reponseModal.client}</div>
            <div style={{background:C.card2,borderRadius:7,padding:10,marginBottom:12,fontSize:11,color:C.muted,fontStyle:"italic"}}>"{reponseModal.comm}"</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              {["Merci pour votre confiance !","Nous sommes ravis de votre satisfaction.","Nous prenons note de vos remarques.","Votre avis nous aide à nous améliorer."].map((t,i)=>(
                <button key={i} onClick={()=>setReponseText(t)} style={{padding:"3px 8px",border:`1px solid ${C.border}`,borderRadius:20,background:C.card2,color:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{t.substring(0,25)}...</button>
              ))}
            </div>
            <textarea value={reponseText} onChange={e=>setReponseText(e.target.value)} placeholder="Votre réponse..." style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontFamily:"inherit",fontSize:12,minHeight:80,resize:"vertical",marginBottom:12,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:8}}>
              <Btn v="ghost" full onClick={()=>setReponseModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{setAvis(p=>p.map(a=>a.id===reponseModal.id?{...a,repondu:true}:a));setReponseModal(null);showToast("✅ Réponse publiée sur Google !");}}>📤 Publier la réponse</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub={`NPS · Avis · Google · Widget · IA — ${profil.label}`}>★ Réputation & NPS</STitle>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={()=>showToast("📲 Demande d'avis envoyée à tous les clients récents !")}>📲 Demander avis</Btn>
          <Btn v="gold" onClick={analyserIA}>🤖 Analyser</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Note moyenne" val={`★ ${notesMoyenne}/5`} color={C.gold}/>
        <KPI label="NPS Score" val={`+${npsScore}`} color={npsScore>=50?C.green:C.orange}/>
        <KPI label="Avis Google" val={google.length} color={C.blue}/>
        <KPI label="Sans réponse" val={avis.filter(a=>!a.repondu).length} color={C.orange}/>
        <KPI label="Mauvais avis" val={avis.filter(a=>a.note<=3).length} color={avis.filter(a=>a.note<=3).length>0?C.red:C.green}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {tab==="nps"&&(
        <div>
          {/* NPS SCORE VISUEL */}
          <div style={{background:`linear-gradient(135deg,${C.card},#001A0A)`,border:`1px solid ${C.green}44`,borderRadius:14,padding:20,marginBottom:14,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Note moyenne</div>
              <div style={{fontSize:48,fontWeight:700,color:C.gold}}>★ {notesMoyenne}</div>
              <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:4}}>
                {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:20,color:n<=Math.round(notesMoyenne)?C.gold:C.border}}>★</span>)}
              </div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>NPS Score</div>
              <div style={{fontSize:48,fontWeight:700,color:npsScore>=50?C.green:C.orange}}>+{npsScore}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:4}}>{npsScore>=70?"🏆 Excellent":npsScore>=50?"✅ Bon":"⚠️ À améliorer"}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Répartition</div>
              {[[5,"Promoteurs",C.green],[4,"Satisfaits",C.teal],[3,"Neutres",C.orange],[1,"Détracteurs",C.red]].map(([n,l,c])=>{
                const nb=avis.filter(a=>n===1?a.note<=2:a.note===n).length;
                return nb>0?(
                  <div key={n} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                    <span style={{color:c}}>{'★'.repeat(n===1?1:n)} {l}</span>
                    <span style={{color:c,fontWeight:600}}>{nb}</span>
                  </div>
                ):null;
              })}
            </div>
          </div>

          {/* ENVOI AUTO */}
          <Card style={{borderColor:`${C.purple}44`}}>
            <CT>⚡ Demande d'avis automatique</CT>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:10}}>
                  Après chaque {profil.termes.mission.toLowerCase()} terminée, un message WhatsApp est envoyé automatiquement au client pour lui demander un avis.
                </div>
                {[["Délai envoi","30 minutes après mission"],["Plateforme","Google + WhatsApp"],["Message","Personnalisé avec le nom du client"],["Si 5★","Redirigé vers Google"]].map(([l,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                    <span style={{color:C.muted}}>{l}</span>
                    <span style={{color:C.text,fontWeight:500}}>{v}</span>
                  </div>
                ))}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
                  <span style={{fontSize:12,color:C.text}}>Envoi automatique activé</span>
                  <div onClick={()=>setAutoEnvoi(!autoEnvoi)} style={{width:36,height:20,borderRadius:10,background:autoEnvoi?C.green:C.border,cursor:"pointer",position:"relative",flexShrink:0}}>
                    <div style={{position:"absolute",top:2,left:autoEnvoi?18:2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/>
                  </div>
                </div>
              </div>
              <div style={{background:"#075E54",borderRadius:10,padding:12}}>
                <div style={{fontSize:9,color:"#25D366",marginBottom:6,textTransform:"uppercase"}}>💬 Message auto WA</div>
                <div style={{background:"#128C7E",borderRadius:"12px 12px 12px 2px",padding:"10px 12px",fontSize:11,color:"#fff",lineHeight:1.8}}>
                  Bonjour Sofia ! 👋<br/>
                  Merci pour votre confiance.<br/>
                  Votre avis compte énormément pour nous ⭐<br/>
                  Pouvez-vous noter notre service ?<br/>
                  👉 [Lien Google]<br/>
                  <span style={{fontSize:9,color:"#aaa"}}>Tymeless Conciergerie</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab==="avis"&&(
        <div>
          <Card>
            <CT>💬 Tous les avis</CT>
            {avis.map((a,i)=>(
              <div key={i} style={{background:a.note<=3?`${C.orange}08`:C.card2,border:`1px solid ${a.note<=3?C.orange:C.border}33`,borderRadius:10,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.gold}}>{a.client[0]}</div>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{a.client}</div>
                      <div style={{fontSize:10,color:C.muted}}>{a.service} · {a.date} · {a.plateforme}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{color:C.gold,fontSize:14}}>{'★'.repeat(a.note)}{'☆'.repeat(5-a.note)}</span>
                    {a.google&&<Pill label="🔍 Google" color={C.blue}/>}
                    <Pill label={a.repondu?"✓ Répondu":"À répondre"} color={a.repondu?C.green:C.orange}/>
                  </div>
                </div>
                <div style={{fontSize:12,color:C.text,fontStyle:"italic",marginBottom:10}}>"{a.comm}"</div>
                {!a.repondu&&(
                  <Btn sm v="gold" onClick={()=>{setReponseModal(a);setReponseText("");}}>✍️ Répondre</Btn>
                )}
                {a.note<=3&&(
                  <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:6,padding:"6px 10px",marginTop:8,fontSize:11,color:C.orange}}>
                    ⚠️ Avis négatif — Répondre rapidement recommandé
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="google"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.blue}44`}}>
            <CT>🔍 Fiche Google My Business</CT>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                {[["Nom","Tymeless Conciergerie"],["Note Google",`${notesMoyenne}/5 ★`],["Nombre d'avis",`${google.length} avis`],["Statut","✅ Fiche vérifiée"],["Catégorie","Service de conciergerie"]].map(([l,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"6px 0",borderBottom:`1px solid ${C.border}22`}}>
                    <span style={{color:C.muted}}>{l}</span>
                    <span style={{fontWeight:600,color:C.text}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:12,display:"flex",gap:8}}>
                  <Btn v="blue" onClick={()=>showToast("🔍 Ouverture Google My Business...")}>Voir sur Google</Btn>
                  <Btn v="ghost" onClick={()=>showToast("🔗 Lien avis copié !")}>📋 Copier lien avis</Btn>
                </div>
              </div>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Distribution des notes</div>
                {[5,4,3,2,1].map(n=>{
                  const nb=avis.filter(a=>a.note===n).length;
                  const pct=avis.length?Math.round((nb/avis.length)*100):0;
                  return(
                    <div key={n} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:11,color:C.gold,width:15}}>{'★'.repeat(n)}</span>
                      <div style={{flex:1,height:8,borderRadius:4,background:C.border}}>
                        <div style={{height:"100%",width:`${pct}%`,background:n>=4?C.green:n===3?C.orange:C.red,borderRadius:4}}/>
                      </div>
                      <span style={{fontSize:10,color:C.muted,width:25}}>{nb}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
          {/* Avis Google */}
          <Card>
            <CT>Avis Google récents</CT>
            {google.map((a,i)=>(
              <div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontWeight:600,fontSize:12}}>{a.client}</span>
                  <span style={{color:C.gold}}>{'★'.repeat(a.note)}</span>
                </div>
                <div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginBottom:6}}>"{a.comm}"</div>
                {!a.repondu&&<Btn sm v="blue" onClick={()=>{setReponseModal(a);setReponseText("");}}>Répondre sur Google</Btn>}
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="widget"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.teal}44`}}>
            <CT>🔌 Widget avis — Intégrer sur votre site</CT>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:14}}>
              Copiez ce code HTML et collez-le dans votre site Vercel pour afficher vos avis en temps réel.
            </div>
            <div style={{background:"#0A0A1A",borderRadius:8,padding:14,marginBottom:12,fontFamily:"monospace",fontSize:11,color:"#25D366",lineHeight:1.8,overflow:"auto"}}>
              {`<!-- Widget Avis Tymeless -->\n<div id="tymeless-reviews"></div>\n<script>\n  fetch('https://tymelees-saas.vercel.app/api/reviews')\n    .then(r=>r.json())\n    .then(data=>{\n      const div=document.getElementById('tymeless-reviews');\n      div.innerHTML=data.avis.map(a=>\n        '<div class="avis"><b>'+a.client+'</b><br>'+\n        '★'.repeat(a.note)+'<br>'+a.comm+'</div>'\n      ).join('');\n    });\n</script>\n<style>\n  .avis{padding:12px;border:1px solid #eee;\n    border-radius:8px;margin:8px 0;}\n</style>`}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn v="teal" onClick={()=>showToast("📋 Code widget copié !")}>📋 Copier le code</Btn>
              <Btn v="ghost" onClick={()=>showToast("📲 Code envoyé sur WhatsApp")}>📲 Envoyer sur WA</Btn>
            </div>
          </Card>

          {/* APERÇU WIDGET */}
          <Card>
            <CT>👁️ Aperçu du widget sur votre site</CT>
            <div style={{background:"white",borderRadius:10,padding:16}}>
              <div style={{fontSize:14,fontWeight:700,color:"#333",marginBottom:12,textAlign:"center"}}>
                ⭐ {notesMoyenne}/5 · {avis.length} avis clients
              </div>
              {avis.slice(0,3).map((a,i)=>(
                <div key={i} style={{padding:"10px 12px",border:"1px solid #eee",borderRadius:8,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:13,color:"#333"}}>{a.client}</span>
                    <span style={{color:"#F59E0B"}}>{'★'.repeat(a.note)}</span>
                  </div>
                  <div style={{fontSize:12,color:"#666",fontStyle:"italic"}}>"{a.comm}"</div>
                </div>
              ))}
              <div style={{textAlign:"center",marginTop:8}}>
                <span style={{fontSize:11,color:"#999"}}>Powered by Tymeless OS</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab==="ia"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 Analyse IA — Réputation</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Claude analyse vos avis et identifie des axes d'amélioration.</div>
            <Btn v="purple" onClick={analyserIA}>{aiLoading?"🤖 Analyse...":"🤖 Analyser ma réputation"}</Btn>
          </Card>
          {aiLoading&&<Card style={{textAlign:"center",padding:24}}><div style={{fontSize:28,marginBottom:8}}>🤖</div><div style={{color:C.purple}}>Analyse en cours...</div></Card>}
          {aiResult&&!aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
              <CT>🤖 Recommandations Claude IA</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiResult}</div>
            </Card>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>📊 Analyse par service</CT>
              {[...new Set(avis.map(a=>a.service))].map((s,i)=>{
                const notes=avis.filter(a=>a.service===s).map(a=>a.note);
                const moy=(notes.reduce((a,b)=>a+b,0)/notes.length).toFixed(1);
                return(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                    <span style={{color:C.muted}}>{s}</span>
                    <span style={{color:C.gold,fontWeight:600}}>★ {moy}</span>
                  </div>
                );
              })}
            </Card>
            <Card>
              <CT>🎯 Points d'amélioration</CT>
              {[
                {p:"Délai de réponse",s:"Améliorer",c:C.orange},
                {p:"Ponctualité",s:"Bon",c:C.green},
                {p:"Qualité service",s:"Excellent",c:C.green},
                {p:"Communication",s:"À améliorer",c:C.orange},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{r.p}</span>
                  <Pill label={r.s} color={r.c}/>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};


const PageEquipe=()=>{
  const [tab,setTab]=useState("collaborateurs");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);

  const [collaborateurs,setCollaborateurs]=useState([
    {id:"thomas",nom:"Thomas Martin",role:"Polyvalent",couleur:C.blue,tel:"+33 6 11 22 33 44",email:"thomas@tymeless.fr",salaire:1800,devise:"EUR",contrat:"CDI",pays:"France",date_embauche:"15/01/2024",heures_semaine:35,conges_restants:18,absences:1,statut:"En mission",performance:92,missions_mois:12,note:4.8,bien_etre:85,objectif_mois:15,primes:200,iban:"FR76 3000 1234 5678",competences:["Airbnb","Jet Privé","Bureaux","Résidentiel"],pointages:[
      {date:"20/05/2026",arrivee:"08:05",depart:"17:45",duree:"9h40",mission:"Airbnb Montmartre",statut:"validé",lat:48.8856,lng:2.3412},
      {date:"17/05/2026",arrivee:"08:15",depart:"18:00",duree:"9h45",mission:"Nettoyage bureaux",statut:"validé",lat:48.8698,lng:2.3078},
    ]},
    {id:"abou",nom:"Abou Diallo",role:"Nettoyage spécialisé",couleur:C.teal,tel:"+33 6 22 33 44 55",email:"abou@tymeless.fr",salaire:1600,devise:"EUR",contrat:"CDI",pays:"France",date_embauche:"01/03/2024",heures_semaine:35,conges_restants:22,absences:0,statut:"Disponible",performance:88,missions_mois:10,note:4.7,bien_etre:90,objectif_mois:12,primes:0,iban:"FR76 3000 5678 9012",competences:["Airbnb","Yacht","Résidentiel","Bureaux"],pointages:[
      {date:"20/05/2026",arrivee:"07:30",depart:"17:00",duree:"9h30",mission:"Nettoyage yacht",statut:"validé",lat:48.8900,lng:2.2400},
    ]},
    {id:"fatou",nom:"Fatou Ndiaye",role:"Hôtesse conciergerie",couleur:C.purple,tel:"+33 6 33 44 55 66",email:"fatou@tymeless.fr",salaire:1400,devise:"EUR",contrat:"CDD",pays:"France",date_embauche:"01/06/2024",heures_semaine:35,conges_restants:12,absences:2,statut:"Disponible",performance:85,missions_mois:8,note:4.6,bien_etre:78,objectif_mois:10,primes:0,iban:"FR76 3000 9012 3456",competences:["Jet Privé","Yacht","Rapatriement","Airbnb"],pointages:[
      {date:"20/05/2026",arrivee:"09:00",depart:"19:00",duree:"10h00",mission:"RDV Client VIP",statut:"validé",lat:48.8654,lng:2.3214},
    ]},
  ]);

  const [conges,setConges]=useState([
    {id:1,collab:"Thomas Martin",type:"Congés payés",debut:"10/06/2026",fin:"14/06/2026",jours:5,statut:"approuvé",motif:"Vacances famille"},
    {id:2,collab:"Abou Diallo",type:"RTT",debut:"24/05/2026",fin:"24/05/2026",jours:1,statut:"en_attente",motif:"RTT"},
    {id:3,collab:"Fatou Ndiaye",type:"Congé maladie",debut:"08/05/2026",fin:"09/05/2026",jours:2,statut:"approuvé",motif:"Arrêt médical"},
  ]);

  const [contrats,setContrats]=useState([
    {id:1,titre:"Contrat CDI — Thomas Martin",type:"CDI",collab:"Thomas Martin",date:"15/01/2024",statut:"signé",fichier:"contrat_thomas.pdf"},
    {id:2,titre:"Contrat CDI — Abou Diallo",type:"CDI",collab:"Abou Diallo",date:"01/03/2024",statut:"signé",fichier:"contrat_abou.pdf"},
    {id:3,titre:"Contrat CDD — Fatou Ndiaye",type:"CDD",collab:"Fatou Ndiaye",date:"01/06/2024",statut:"signé",fichier:"contrat_fatou.pdf"},
    {id:4,titre:"NDA Partenaire Luxe Paris",type:"NDA",collab:"Partenaire Luxe Paris",date:"15/04/2026",statut:"en_attente_signature",fichier:""},
    {id:5,titre:"Contrat Prestation — Sofia Riad",type:"Prestation",collab:"Sofia Riad",date:"01/05/2026",statut:"signé",fichier:"contrat_sofia.pdf"},
  ]);

  const [nouveauContrat,setNouveauContrat]=useState({type:"CDI",collab:"",parties:"",duree:"",salaire:"",mission:""});
  const [newConge,setNewConge]=useState({collab:"Thomas Martin",type:"Congés payés",debut:"",fin:"",motif:""});
  const [newCollab,setNewCollab]=useState({nom:"",role:"",tel:"",email:"",salaire:"",devise:"EUR",contrat:"CDI",pays:"France"});
  const [sondage,setSondage]=useState(null);

  const totalSalaires=collaborateurs.reduce((s,c)=>s+c.salaire,0);
  const congesEnAttente=conges.filter(c=>c.statut==="en_attente").length;
  const perfMoyenne=Math.round(collaborateurs.reduce((s,c)=>s+c.performance,0)/collaborateurs.length);
  const bienEtreMoyen=Math.round(collaborateurs.reduce((s,c)=>s+c.bien_etre,0)/collaborateurs.length);

  const analyserIA=async(type)=>{
    setAiLoading(true);
    try{
      const prompts={
        rh:`Tu es expert RH et psychologue du travail. Analyse l'équipe et donne 3 recommandations concrètes.

Équipe:
${collaborateurs.map(c=>`- ${c.nom}: Performance ${c.performance}%, Bien-être ${c.bien_etre}%, Absences ${c.absences}, Missions ${c.missions_mois}/mois, Objectif ${c.objectif_mois}`).join("\n")}

Identifie: risques de démotivation, surcharges, opportunités de prime. Sois très concret et actionnable.`,
        juridique:`Tu es juriste expert. Génère un contrat de prestation de services professionnel et adapté au droit français.

Parties: ${nouveauContrat.parties||"Tymeless Conciergerie et Client"}
Type: ${nouveauContrat.type}
Durée: ${nouveauContrat.duree||"non définie"}
Montant: ${nouveauContrat.salaire||"selon devis"}
Mission: ${nouveauContrat.mission||"Services de conciergerie premium"}

Génère les clauses essentielles: objet, durée, prix, obligations, confidentialité, résiliation. Mention légale obligatoire à la fin: "Document à valider par un avocat agréé avant utilisation officielle."`,
      };
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:prompts[type]}]})});
      const data=await res.json();
      setAiResult({type,text:data.content?.[0]?.text||"Analyse non disponible"});
    }catch(e){setAiResult({type,text:"Erreur — Vérifiez la connexion"});}
    setAiLoading(false);
  };

  const payerSalaire=(collab)=>{
    showToast(`💳 Salaire ${fmt(collab.salaire,collab.devise)} viré à ${collab.nom} via Wallet ✅`);
  };

  const TABS=[
    {id:"collaborateurs",label:"👥 Collaborateurs"},
    {id:"pointage",label:"⏱️ Pointage"},
    {id:"conges",label:"🏖️ Congés"},
    {id:"paie",label:"💰 Paie"},
    {id:"performance",label:"📊 Performance"},
    {id:"ia_rh",label:"🤖 IA RH"},
    {id:"juridique",label:"⚖️ Juridique"},
    {id:"documents",label:"📄 Documents"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px #00000066"}}>{toast.msg}</div>}

      {/* MODAL FICHE COLLABORATEUR */}
      {modal==="fiche"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${selected.couleur}44`,borderRadius:14,padding:24,width:580,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:`${selected.couleur}22`,border:`2px solid ${selected.couleur}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:selected.couleur}}>{selected.nom[0]}</div>
                <div>
                  <div style={{fontSize:17,fontWeight:700,color:selected.couleur}}>{selected.nom}</div>
                  <div style={{fontSize:11,color:C.muted}}>{selected.role} · {selected.contrat} · {selected.pays}</div>
                  <Pill label={selected.statut} color={selected.statut==="Disponible"?C.green:C.orange}/>
                </div>
              </div>
              <Btn sm v="ghost" onClick={()=>setModal(null)}>✕</Btn>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {[["💰 Salaire",fmt(selected.salaire,selected.devise),C.gold],["📋 Missions",selected.missions_mois+"/mois",C.blue],["🎯 Objectif",selected.objectif_mois+"/mois",C.purple],["📊 Performance",selected.performance+"%",selected.performance>=90?C.green:C.orange],["😊 Bien-être",selected.bien_etre+"%",selected.bien_etre>=80?C.green:C.orange],["⭐ Note","★ "+selected.note,C.gold]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,borderRadius:7,padding:"8px 10px",border:`1px solid ${c}22`}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>

            <Card style={{padding:12,marginBottom:10}}>
              <div style={{fontSize:10,color:C.gold,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Informations personnelles</div>
              {[["📱",selected.tel],["📧",selected.email],["📅","Embauché le "+selected.date_embauche],["⏱️",selected.heures_semaine+"h/semaine"],["🏖️",selected.conges_restants+" jours de congés restants"],["🏦",selected.iban||"IBAN non renseigné"]].map(([ico,v],i)=>(
                <div key={i} style={{display:"flex",gap:8,fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span>{ico}</span><span style={{color:C.muted}}>{v}</span></div>
              ))}
            </Card>

            <Card style={{padding:12,marginBottom:10}}>
              <div style={{fontSize:10,color:C.gold,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Compétences</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {selected.competences?.map((comp,i)=><Pill key={i} label={comp} color={selected.couleur}/>)}
              </div>
            </Card>

            <Card style={{padding:12,marginBottom:10}}>
              <div style={{fontSize:10,color:C.gold,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Score bien-être</div>
              <div style={{height:8,borderRadius:4,background:C.border,marginBottom:4}}>
                <div style={{height:"100%",width:selected.bien_etre+"%",background:selected.bien_etre>=80?C.green:selected.bien_etre>=60?C.orange:C.red,borderRadius:4}}/>
              </div>
              <div style={{fontSize:11,color:selected.bien_etre>=80?C.green:C.orange}}>{selected.bien_etre>=80?"😊 Collaborateur épanoui":selected.bien_etre>=60?"😐 Attention requise":"⚠️ Risque de démotivation"}</div>
            </Card>

            <div style={{display:"flex",gap:8}}>
              <Btn v="ghost" full onClick={()=>showToast(`📲 Planning envoyé à ${selected.nom}`)}>📲 Planning WA</Btn>
              <Btn v="gold" full onClick={()=>payerSalaire(selected)}>💳 Virer salaire</Btn>
              <Btn v="teal" sm onClick={()=>showToast(`🧾 Fiche de paie générée`)}>🧾 Paie</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUTER COLLABORATEUR */}
      {modal==="nouveau_collab"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:460}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouveau collaborateur</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[["Nom complet *","nom","text","Marie Dupont"],["Rôle *","role","text","Agent terrain"],["Email","email","email","marie@tymeless.fr"],["Téléphone","tel","text","+33 6..."]].map(([l,k,t,ph])=>(
                <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={newCollab[k]} onChange={e=>setNewCollab(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Salaire</div><Inp type="number" placeholder="1500" value={newCollab.salaire} onChange={e=>setNewCollab(p=>({...p,salaire:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Contrat</div><Sel value={newCollab.contrat} onChange={e=>setNewCollab(p=>({...p,contrat:e.target.value}))} options={["CDI","CDD","Freelance","Stage"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Pays</div><Inp placeholder="France" value={newCollab.pays} onChange={e=>setNewCollab(p=>({...p,pays:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newCollab.nom||!newCollab.role)return;
                const couleurs=[C.green,C.orange,C.pink,"#E91E8C"];
                setCollaborateurs(p=>[...p,{id:Date.now().toString(),nom:newCollab.nom,role:newCollab.role,couleur:couleurs[p.length%couleurs.length],tel:newCollab.tel,email:newCollab.email,salaire:Number(newCollab.salaire)||0,devise:"EUR",contrat:newCollab.contrat,pays:newCollab.pays,date_embauche:new Date().toLocaleDateString("fr"),heures_semaine:35,conges_restants:25,absences:0,statut:"Disponible",performance:0,missions_mois:0,note:0,bien_etre:100,objectif_mois:10,primes:0,iban:"",competences:[],pointages:[]}]);
                setModal(null);
                setNewCollab({nom:"",role:"",tel:"",email:"",salaire:"",devise:"EUR",contrat:"CDI",pays:"France"});
                showToast("✓ Collaborateur ajouté ! Login créé automatiquement.");
              }}>✓ Ajouter</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="Collaborateurs · Pointage · Congés · Paie · IA · Juridique">⊞ RH & Équipe</STitle>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={()=>showToast("📲 Planning envoyé à toute l'équipe !")}>📲 WA Équipe</Btn>
          <Btn v="gold" onClick={()=>setModal("nouveau_collab")}>+ Collaborateur</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Collaborateurs" val={collaborateurs.length} color={C.blue}/>
        <KPI label="Masse salariale" val={fmt(totalSalaires,"EUR")} color={C.red}/>
        <KPI label="Performance moy." val={perfMoyenne+"%"} color={C.green}/>
        <KPI label="Bien-être moy." val={bienEtreMoyen+"%"} color={bienEtreMoyen>=80?C.green:C.orange}/>
        <KPI label="Congés en attente" val={congesEnAttente} color={congesEnAttente>0?C.orange:C.green}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── COLLABORATEURS ── */}
      {tab==="collaborateurs"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
            {collaborateurs.map((c,i)=>(
              <Card key={i} style={{borderColor:`${c.couleur}44`,cursor:"pointer",transition:"all 0.2s"}}
                onClick={()=>{setSelected(c);setModal("fiche");}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
              >
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                  <div style={{width:46,height:46,borderRadius:"50%",background:`${c.couleur}22`,border:`2px solid ${c.couleur}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:c.couleur}}>{c.nom[0]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:c.couleur}}>{c.nom}</div>
                    <div style={{fontSize:10,color:C.muted}}>{c.role} · {c.contrat}</div>
                  </div>
                  <Pill label={c.statut} color={c.statut==="Disponible"?C.green:c.statut==="En mission"?C.orange:C.red}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                  {[["💰",fmt(c.salaire,"EUR")],["📋",c.missions_mois+" missions"],["🏖️",c.conges_restants+"j congés"],["⭐","★ "+c.note]].map(([ico,v],j)=>(
                    <div key={j} style={{background:C.card2,borderRadius:6,padding:"5px 8px",display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{fontSize:12}}>{ico}</span><span style={{fontSize:11,color:C.text}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                    <span style={{color:C.muted}}>Performance</span>
                    <span style={{color:c.performance>=90?C.green:C.orange}}>{c.performance}%</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:c.performance+"%",background:c.performance>=90?C.green:C.orange,borderRadius:2}}/></div>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                    <span style={{color:C.muted}}>Bien-être</span>
                    <span style={{color:c.bien_etre>=80?C.green:C.orange}}>{c.bien_etre>=80?"😊":c.bien_etre>=60?"😐":"⚠️"} {c.bien_etre}%</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:c.bien_etre+"%",background:c.bien_etre>=80?C.green:C.orange,borderRadius:2}}/></div>
                </div>
                <div style={{display:"flex",gap:5}}>
                  <Btn sm v="ghost" onClick={e=>{e.stopPropagation();showToast(`📲 Planning envoyé à ${c.nom}`);}}>📲</Btn>
                  <Btn sm v="ghost" onClick={e=>{e.stopPropagation();showToast(`🧾 Fiche paie générée`);}}>🧾</Btn>
                  <Btn sm v="gold" onClick={e=>{e.stopPropagation();payerSalaire(c);}}>💳 Salaire</Btn>
                </div>
              </Card>
            ))}
          </div>
          <Card style={{borderColor:`${C.green}44`}}>
            <CT>📲 WhatsApp automatique — Planning du jour à 8h</CT>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                {[["Heure d'envoi","08h00 chaque matin"],["Contenu","Missions, horaires, adresses clients"],["Rappel mission","30 min avant chaque mission"],["Fin de mission","Confirmation demandée automatiquement"],["Si absent","Alerte immédiate à Curtiss"],["Si retard","Alerte si pas pointé à l'heure"]].map(([l,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                    <span style={{color:C.muted}}>{l}</span><span style={{fontWeight:500,color:C.text}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:10}}><Btn v="green" full onClick={()=>showToast("📲 Planning du jour envoyé à Thomas, Abou et Fatou !")}>📲 Envoyer maintenant</Btn></div>
              </div>
              <div style={{background:"#075E54",borderRadius:10,padding:12}}>
                <div style={{fontSize:9,color:"#25D366",marginBottom:6,textTransform:"uppercase"}}>💬 Message auto 8h</div>
                <div style={{background:"#128C7E",borderRadius:"12px 12px 12px 2px",padding:"10px 12px",fontSize:11,color:"#fff",lineHeight:1.8}}>
                  🌅 <b>Bonjour Thomas !</b><br/>
                  Ton planning du 20/05 :<br/>
                  📍 09h00 — Airbnb Montmartre<br/>
                  18 rue Lepic, 75018 · Code: 1234<br/>
                  📍 14h00 — Jet Privé CDG<br/>
                  Terminal 2, Le Bourget<br/>
                  💪 Bonne journée !<br/>
                  <span style={{fontSize:9,color:"#aaa"}}>Tymeless OS</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── POINTAGE ── */}
      {tab==="pointage"&&(
        <div>
          {/* Temps réel */}
          <Card style={{marginBottom:14,borderColor:`${C.blue}44`}}>
            <CT>📍 Équipe en temps réel</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
              {collaborateurs.map((c,i)=>(
                <div key={i} style={{background:C.card2,border:`1px solid ${c.couleur}33`,borderRadius:8,padding:12}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:`${c.couleur}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:c.couleur}}>{c.nom[0]}</div>
                    <div><div style={{fontSize:12,fontWeight:600,color:c.couleur}}>{c.nom.split(" ")[0]}</div><div style={{fontSize:10,color:C.muted}}>{c.role}</div></div>
                  </div>
                  <Pill label={c.statut} color={c.statut==="Disponible"?C.green:c.statut==="En mission"?C.orange:C.red}/>
                  {c.statut==="En mission"&&<div style={{fontSize:10,color:C.muted,marginTop:4}}>📍 {c.pointages[0]?.mission}</div>}
                  <div style={{display:"flex",gap:5,marginTop:8}}>
                    <Btn sm v="green" onClick={()=>{setCollaborateurs(p=>p.map(x=>x.id===c.id?{...x,statut:"En mission",pointages:[{date:new Date().toLocaleDateString("fr"),arrivee:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),depart:"",duree:"",mission:"Mission en cours",statut:"en_cours"},...x.pointages]}:x));showToast(`✅ ${c.nom.split(" ")[0]} — Arrivée pointée`);}}>▶ Arrivée</Btn>
                    <Btn sm v="red" onClick={()=>{setCollaborateurs(p=>p.map(x=>x.id===c.id?{...x,statut:"Disponible"}:x));showToast(`✅ ${c.nom.split(" ")[0]} — Départ pointé`);}}>■ Départ</Btn>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Historique pointages */}
          <Card>
            <CT>⏱️ Historique des pointages</CT>
            <TH heads={["Collaborateur","Date","Arrivée","Départ","Durée","Mission","Statut"]} rows={collaborateurs.flatMap(c=>c.pointages.map((p,i)=>(
              <tr key={c.id+i}>
                <Td><Pill label={c.nom.split(" ")[0]} color={c.couleur}/></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{p.date}</span></Td>
                <Td><span style={{fontWeight:600,color:C.green}}>{p.arrivee}</span></Td>
                <Td><span style={{fontWeight:600,color:C.red}}>{p.depart||"—"}</span></Td>
                <Td><span style={{fontWeight:700,color:C.gold}}>{p.duree||"En cours"}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{p.mission}</span></Td>
                <Td><Pill label={p.statut==="validé"?"✓ Validé":"● En cours"} color={p.statut==="validé"?C.green:C.orange}/></Td>
              </tr>
            )))}/>
          </Card>
        </div>
      )}

      {/* ── CONGÉS ── */}
      {tab==="conges"&&(
        <div>
          <Card style={{marginBottom:14}}>
            <CT>➕ Nouvelle demande de congé</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:10}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Collaborateur</div>
                <Sel value={newConge.collab} onChange={e=>setNewConge(p=>({...p,collab:e.target.value}))} options={collaborateurs.map(c=>({v:c.nom,l:c.nom}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Type</div>
                <Sel value={newConge.type} onChange={e=>setNewConge(p=>({...p,type:e.target.value}))} options={["Congés payés","RTT","Congé maladie","Congé sans solde","Congé exceptionnel"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Du</div><Inp type="date" value={newConge.debut} onChange={e=>setNewConge(p=>({...p,debut:e.target.value}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Au</div><Inp type="date" value={newConge.fin} onChange={e=>setNewConge(p=>({...p,fin:e.target.value}))} style={{width:"100%"}}/></div>
              <div style={{display:"flex",alignItems:"flex-end"}}><Btn v="gold" full onClick={()=>{if(!newConge.debut||!newConge.fin)return;setConges(p=>[...p,{id:Date.now(),...newConge,jours:1,statut:"en_attente"}]);setNewConge({collab:"Thomas Martin",type:"Congés payés",debut:"",fin:"",motif:""});showToast("✓ Demande soumise !");}}>Soumettre</Btn></div>
            </div>
          </Card>

          {congesEnAttente>0&&(
            <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}44`,borderRadius:10,padding:12,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,color:C.orange,marginBottom:8}}>⏳ {congesEnAttente} demande(s) en attente de validation</div>
              {conges.filter(c=>c.statut==="en_attente").map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,borderRadius:7,padding:"8px 12px",marginBottom:6,border:`1px solid ${C.orange}33`}}>
                  <div><span style={{fontWeight:600}}>{c.collab}</span><span style={{color:C.muted,fontSize:11}}> · {c.type} · {c.debut} → {c.fin} · {c.jours}j</span></div>
                  <div style={{display:"flex",gap:7}}>
                    <Btn sm v="green" onClick={()=>{setConges(p=>p.map(x=>x.id===c.id?{...x,statut:"approuvé"}:x));showToast(`✅ Congé de ${c.collab} approuvé`);}}>✅ Approuver</Btn>
                    <Btn sm v="red" onClick={()=>{setConges(p=>p.map(x=>x.id===c.id?{...x,statut:"refusé"}:x));showToast(`❌ Congé refusé`,"#EF4444");}}>❌ Refuser</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Card>
            <CT>📅 Solde de congés par collaborateur</CT>
            {collaborateurs.map((c,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:`${c.couleur}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:c.couleur}}>{c.nom[0]}</div>
                  <div><div style={{fontSize:12,fontWeight:600}}>{c.nom}</div><div style={{fontSize:10,color:C.muted}}>Absences : {c.absences}j cette année</div></div>
                </div>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:18,fontWeight:700,color:c.couleur}}>{c.conges_restants}j</div>
                    <div style={{fontSize:9,color:C.muted}}>congés restants</div>
                  </div>
                  <div style={{height:40,width:1,background:C.border}}/>
                  <div style={{display:"flex",gap:5}}>
                    <Btn sm v="ghost" onClick={()=>{setCollaborateurs(p=>p.map(x=>x.id===c.id?{...x,conges_restants:x.conges_restants+1}:x));showToast(`+1 jour ajouté à ${c.nom}`);}}>+1j</Btn>
                    <Btn sm v="ghost" onClick={()=>{setCollaborateurs(p=>p.map(x=>x.id===c.id?{...x,conges_restants:Math.max(0,x.conges_restants-1)}:x));showToast(`-1 jour retiré à ${c.nom}`);}}>-1j</Btn>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── PAIE ── */}
      {tab==="paie"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            <KPI label="Masse salariale" val={fmt(totalSalaires,"EUR")} color={C.red}/>
            <KPI label="Primes ce mois" val={fmt(collaborateurs.reduce((s,c)=>s+c.primes,0),"EUR")} color={C.gold}/>
            <KPI label="Prochain virement" val="28/05/2026" color={C.blue}/>
          </div>

          <Card style={{marginBottom:14}}>
            <CT>💰 Paie mensuelle — Mai 2026</CT>
            {collaborateurs.map((c,i)=>(
              <div key={i} style={{background:C.card2,border:`1px solid ${c.couleur}22`,borderRadius:10,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`${c.couleur}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:c.couleur}}>{c.nom[0]}</div>
                    <div><div style={{fontSize:13,fontWeight:600,color:c.couleur}}>{c.nom}</div><div style={{fontSize:11,color:C.muted}}>{c.contrat} · {c.heures_semaine}h/sem</div></div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:20,fontWeight:700,color:C.gold}}>{fmt(c.salaire+c.primes,c.devise)}</div>
                    <div style={{fontSize:10,color:C.muted}}>Salaire {fmt(c.salaire,c.devise)} + Primes {fmt(c.primes,c.devise)}</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
                  {[["Brut",fmt(c.salaire*1.25,c.devise)],["Charges pat.",fmt(c.salaire*0.25,c.devise)],["Net",fmt(c.salaire,c.devise)],["Primes",fmt(c.primes,c.devise)]].map(([l,v],j)=>(
                    <div key={j} style={{background:C.card,borderRadius:6,padding:"5px 8px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:C.muted}}>{l}</div>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:7}}>
                  <Btn sm v="gold" onClick={()=>payerSalaire(c)}>💳 Virer {fmt(c.salaire+c.primes,c.devise)}</Btn>
                  <Btn sm v="ghost" onClick={()=>showToast(`🧾 Fiche de paie ${c.nom} générée en PDF`)}>🧾 Fiche PDF</Btn>
                  {c.missions_mois>=c.objectif_mois&&<Btn sm v="green" onClick={()=>{setCollaborateurs(p=>p.map(x=>x.id===c.id?{...x,primes:x.primes+200}:x));showToast(`🎉 Prime 200€ ajoutée à ${c.nom} !`);}}>🎉 +Prime 200€</Btn>}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── PERFORMANCE ── */}
      {tab==="performance"&&(
        <div>
          <Card style={{marginBottom:14}}>
            <CT>🏆 Classement performance équipe</CT>
            {[...collaborateurs].sort((a,b)=>b.performance-a.performance).map((c,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:i===0?`${C.gold}22`:C.card2,border:`1px solid ${i===0?C.gold:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:i===0?C.gold:C.muted}}>#{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontWeight:600,color:c.couleur}}>{c.nom}</span>
                    <div style={{display:"flex",gap:8}}>
                      <span style={{color:C.gold}}>★ {c.note}</span>
                      <span style={{fontWeight:700,color:c.performance>=90?C.green:C.orange}}>{c.performance}%</span>
                    </div>
                  </div>
                  <div style={{height:5,borderRadius:3,background:C.border}}><div style={{height:"100%",width:c.performance+"%",background:c.performance>=90?C.green:C.orange,borderRadius:3}}/></div>
                  <div style={{display:"flex",gap:14,marginTop:3,fontSize:10,color:C.muted}}>
                    <span>🎯 Missions : {c.missions_mois}/{c.objectif_mois}</span>
                    <span>😊 Bien-être : {c.bien_etre}%</span>
                    <span>🏖️ Absences : {c.absences}j</span>
                  </div>
                </div>
                {c.missions_mois>=c.objectif_mois&&<Pill label="🎯 Objectif atteint" color={C.green}/>}
              </div>
            ))}
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>📊 Missions réalisées vs objectif</CT>
              {collaborateurs.map((c,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                    <span style={{color:c.couleur,fontWeight:600}}>{c.nom.split(" ")[0]}</span>
                    <span style={{color:C.muted}}>{c.missions_mois}/{c.objectif_mois} missions</span>
                  </div>
                  <div style={{height:6,borderRadius:3,background:C.border}}>
                    <div style={{height:"100%",width:`${Math.min((c.missions_mois/c.objectif_mois)*100,100)}%`,background:c.missions_mois>=c.objectif_mois?C.green:c.couleur,borderRadius:3}}/>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <CT>😊 Score bien-être équipe</CT>
              {collaborateurs.map((c,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                    <span style={{color:c.couleur}}>{c.nom.split(" ")[0]}</span>
                    <span style={{color:c.bien_etre>=80?C.green:C.orange}}>{c.bien_etre>=80?"😊":c.bien_etre>=60?"😐":"⚠️"} {c.bien_etre}%</span>
                  </div>
                  <div style={{height:6,borderRadius:3,background:C.border}}>
                    <div style={{height:"100%",width:c.bien_etre+"%",background:c.bien_etre>=80?C.green:C.orange,borderRadius:3}}/>
                  </div>
                </div>
              ))}
              <Btn v="ghost" full sm onClick={()=>setSondage(true)} style={{marginTop:8}}>📊 Lancer sondage bien-être</Btn>
              {sondage&&(
                <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:10,marginTop:8}}>
                  <div style={{fontSize:11,color:C.purple,fontWeight:600,marginBottom:4}}>📊 Sondage envoyé à l'équipe</div>
                  <div style={{fontSize:10,color:C.muted}}>Thomas, Abou et Fatou reçoivent le sondage sur WhatsApp. Résultats sous 24h.</div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ── IA RH ── */}
      {tab==="ia_rh"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 Intelligence IA — Ressources Humaines</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Claude analyse votre équipe et prédit les risques avant qu'ils arrivent.</div>
            <Btn v="purple" onClick={()=>analyserIA("rh")}>{aiLoading?"🤖 Analyse...":"🤖 Analyser mon équipe"}</Btn>
          </Card>

          {aiLoading&&<Card style={{textAlign:"center",padding:24,marginBottom:14}}><div style={{fontSize:32,marginBottom:8}}>🤖</div><div style={{color:C.purple}}>Analyse RH en cours...</div></Card>}

          {aiResult?.type==="rh"&&!aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
              <CT>🤖 Recommandations RH — Claude</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiResult.text}</div>
            </Card>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{borderColor:`${C.orange}44`}}>
              <CT>⚠️ Alertes RH automatiques</CT>
              {[
                {ico:"😰",msg:"Fatou — Bien-être 78% — Risque de démotivation",c:C.orange,action:"Planifier entretien"},
                {ico:"📈",msg:"Thomas — Objectif atteint — Prime recommandée",c:C.green,action:"Verser 200€"},
                {ico:"📅",msg:"Congé Abou en attente de validation",c:C.orange,action:"Valider"},
              ].map((a,i)=>(
                <div key={i} style={{background:`${a.c}08`,border:`1px solid ${a.c}33`,borderRadius:7,padding:10,marginBottom:8}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:16}}>{a.ico}</span>
                    <span style={{fontSize:11,color:C.text,flex:1}}>{a.msg}</span>
                  </div>
                  <Btn sm v="ghost" onClick={()=>showToast(`✅ Action : ${a.action}`)}>→ {a.action}</Btn>
                </div>
              ))}
            </Card>
            <Card>
              <CT>🔮 Prédictions IA</CT>
              {[
                {l:"Risque de démission",v:"Faible",c:C.green,detail:"Équipe stable et motivée"},
                {l:"Besoin recrutement",v:"Dans 3 mois",c:C.orange,detail:"Croissance CA → 1 agent supplémentaire"},
                {l:"Surcharge prévue",v:"Juillet 2026",c:C.orange,detail:"Saison estivale — planifier renforts"},
                {l:"Coût salarial 2026",v:fmt(totalSalaires*12,"EUR"),c:C.red,detail:"Projection annuelle masse salariale"},
              ].map((p,i)=>(
                <div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:12,color:C.text}}>{p.l}</span>
                    <span style={{fontWeight:700,color:p.c}}>{p.v}</span>
                  </div>
                  <div style={{fontSize:10,color:C.muted}}>{p.detail}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── JURIDIQUE ── */}
      {tab==="juridique"&&(
        <div>
          <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,marginBottom:14,fontSize:11,color:C.orange,lineHeight:1.6}}>
            ⚠️ <b>Mention légale :</b> Les documents juridiques générés par Tymeless OS sont fournis à titre indicatif. Ils doivent être validés par un avocat ou juriste agréé avant toute utilisation officielle.
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <Card style={{borderColor:`${C.blue}44`}}>
              <CT>⚖️ Générer un contrat avec IA</CT>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Type de contrat</div>
                  <Sel value={nouveauContrat.type} onChange={e=>setNouveauContrat(p=>({...p,type:e.target.value}))} options={["CDI","CDD","Freelance","Prestation de services","NDA","Partenariat","CGV/CGU","Sous-traitance"].map(v=>({v,l:v}))} style={{width:"100%"}}/>
                </div>
                {[["Parties concernées","parties","Thomas Martin / Tymeless"],["Durée","duree","12 mois"],["Montant / Salaire","salaire","1800€/mois"],["Objet / Mission","mission","Services de conciergerie premium"]].map(([l,k,ph])=>(
                  <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp placeholder={ph} value={nouveauContrat[k]} onChange={e=>setNouveauContrat(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
                ))}
                <Btn v="blue" full onClick={()=>analyserIA("juridique")}>{aiLoading?"🤖 Génération...":"🤖 Générer avec Claude IA"}</Btn>
              </div>
            </Card>
            <Card>
              <CT>📋 Types de documents disponibles</CT>
              {[
                {ico:"📄",t:"Contrat de travail CDI/CDD",desc:"Conforme droit du travail français"},
                {ico:"🤝",t:"Contrat de prestation",desc:"Services, freelance, sous-traitance"},
                {ico:"🔒",t:"NDA — Accord confidentialité",desc:"Protection information sensible"},
                {ico:"🌍",t:"Contrat partenaire international",desc:"Droit OHADA, droit marocain, UAE"},
                {ico:"📜",t:"CGV / CGU SaaS",desc:"Conditions générales Tymeless OS"},
                {ico:"✍️",t:"DPAE France",desc:"Déclaration préalable à l'embauche"},
              ].map((d,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,cursor:"pointer"}}
                  onClick={()=>{setNouveauContrat(p=>({...p,type:d.t.split(" — ")[0].split(" / ")[0]}));showToast(`Type "${d.t}" sélectionné`);}}>
                  <span style={{fontSize:16,flexShrink:0}}>{d.ico}</span>
                  <div><div style={{fontSize:12,fontWeight:500,color:C.text}}>{d.t}</div><div style={{fontSize:10,color:C.muted}}>{d.desc}</div></div>
                </div>
              ))}
            </Card>
          </div>

          {aiLoading&&<Card style={{textAlign:"center",padding:24,marginBottom:14}}><div style={{fontSize:32,marginBottom:8}}>⚖️</div><div style={{color:C.blue}}>Génération du contrat en cours...</div></Card>}

          {aiResult?.type==="juridique"&&!aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.blue}44`}}>
              <CT>📄 Contrat généré — {nouveauContrat.type}</CT>
              <div style={{background:C.card2,borderRadius:8,padding:14,fontSize:12,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:300,overflowY:"auto",marginBottom:12}}>{aiResult.text}</div>
              <div style={{display:"flex",gap:8}}>
                <Btn v="blue" onClick={()=>{setContrats(p=>[{id:Date.now(),titre:`${nouveauContrat.type} — ${nouveauContrat.parties||"Nouveau"}`,type:nouveauContrat.type,collab:nouveauContrat.parties,date:new Date().toLocaleDateString("fr"),statut:"en_attente_signature",fichier:""},...p]);showToast("✓ Contrat sauvegardé !");}}>💾 Sauvegarder</Btn>
                <Btn v="ghost" onClick={()=>showToast("📲 Contrat envoyé pour signature sur WhatsApp")}>📲 Envoyer pour signature</Btn>
                <Btn v="ghost" onClick={()=>showToast("📄 Contrat exporté en PDF")}>📄 PDF</Btn>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── DOCUMENTS ── */}
      {tab==="documents"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>showToast("+ Document ajouté")}>+ Ajouter document</Btn>
          </div>
          <Card>
            <CT>📄 Tous les documents RH</CT>
            <TH heads={["Document","Type","Concerné","Date","Statut","Actions"]} rows={contrats.map((c,i)=>(
              <tr key={i}>
                <Td><span style={{fontWeight:600,fontSize:12}}>{c.titre}</span></Td>
                <Td><Pill label={c.type} color={C.blue}/></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{c.collab}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{c.date}</span></Td>
                <Td><Pill label={c.statut==="signé"?"✍️ Signé":c.statut==="en_attente_signature"?"⏳ En attente":"○ Brouillon"} color={c.statut==="signé"?C.green:c.statut==="en_attente_signature"?C.orange:C.muted}/></Td>
                <Td>
                  <div style={{display:"flex",gap:5}}>
                    <Btn sm v="ghost" onClick={()=>showToast("📄 Document ouvert")}>👁</Btn>
                    {c.statut==="en_attente_signature"&&<Btn sm v="blue" onClick={()=>{setContrats(p=>p.map(x=>x.id===c.id?{...x,statut:"signé"}:x));showToast("✍️ Contrat signé !");}}>✍️ Signer</Btn>}
                    <Btn sm v="ghost" onClick={()=>showToast("📲 Envoyé sur WhatsApp")}>📲</Btn>
                    <Btn sm v="red" onClick={()=>{setContrats(p=>p.filter(x=>x.id!==c.id));showToast("Supprimé","#EF4444");}}>🗑</Btn>
                  </div>
                </Td>
              </tr>
            ))}/>
          </Card>
        </div>
      )}
    </div>
  );
};

const PagePlanning=({profil=PROFIL_DEFAUT})=>{
  const now=new Date();
  const [tab,setTab]=useState("semaine");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};

  // ── CONFIG COLLABORATEURS ─────────────────────────────────
  const [equipe,setEquipe]=useState([
    {id:"thomas",nom:"Thomas",couleur:C.blue,role:"Polyvalent",services:["Airbnb","Résidentiel","Bureaux","Jet Privé","Yacht"],
     horaires:{debut:"08:00",fin:"18:00",pause_debut:"12:00",pause_fin:"13:30"},
     jours_repos:[0], // 0=Dimanche
     tel:"+33 6 11 22 33 44",statut:"Disponible",geo:{lat:48.88,lng:2.35}},
    {id:"abou",nom:"Abou",couleur:C.teal,role:"Nettoyage spécialisé",services:["Airbnb","Résidentiel","Bureaux","Yacht"],
     horaires:{debut:"07:30",fin:"17:30",pause_debut:"12:00",pause_fin:"13:00"},
     jours_repos:[0,1], // Dim + Lun
     tel:"+33 6 22 33 44 55",statut:"En mission",geo:{lat:48.85,lng:2.34}},
    {id:"fatou",nom:"Fatou",couleur:C.purple,role:"Hôtesse conciergerie",services:["Airbnb","Jet Privé","Yacht","Rapatriement"],
     horaires:{debut:"09:00",fin:"19:00",pause_debut:"13:00",pause_fin:"14:00"},
     jours_repos:[0,2], // Dim + Mar
     tel:"+33 6 33 44 55 66",statut:"Disponible",geo:{lat:48.87,lng:2.33}},
    {id:"curtiss",nom:"Curtiss",couleur:C.gold,role:"Owner",services:["Tous"],
     horaires:{debut:"08:00",fin:"20:00",pause_debut:"13:00",pause_fin:"14:00"},
     jours_repos:[0],
     tel:"+33 7 65 18 95 27",statut:"Disponible",geo:{lat:48.86,lng:2.35}},
  ]);

  // ── MISSIONS ─────────────────────────────────────────────
  const [missions,setMissions]=useState([
    {id:"M001",titre:"Nettoyage Airbnb Montmartre",client:"Sofia Riad",service:"Airbnb",collab:"thomas",date:getDateStr(0),heure:"09:00",duree:"2h",statut:"en_cours",adresse:"18 rue Lepic, 75018 Paris",notes:"Accès par digicode 1234",facture_generee:false,montant:320},
    {id:"M002",titre:"RDV Client VIP",client:"Ahmed Al-Rashid",service:"Jet Privé",collab:"fatou",date:getDateStr(0),heure:"11:00",duree:"1h",statut:"a_venir",adresse:"Aéroport Le Bourget",notes:"",facture_generee:false,montant:800},
    {id:"M003",titre:"Nettoyage bureaux",client:"Marc Dupont",service:"Bureaux",collab:"abou",date:getDateStr(0),heure:"14:00",duree:"3h",statut:"a_venir",adresse:"45 av. des Champs-Élysées, 75008",notes:"Accès badge requis",facture_generee:false,montant:580},
    {id:"M004",titre:"Nettoyage résidentiel",client:"Isabelle Moreau",service:"Résidentiel",collab:"thomas",date:getDateStr(1),heure:"09:30",duree:"2h30",statut:"a_venir",adresse:"12 rue de Rivoli, 75001",notes:"",facture_generee:false,montant:420},
    {id:"M005",titre:"Préparation Yacht",client:"Client VIP",service:"Yacht",collab:"abou",date:getDateStr(1),heure:"14:00",duree:"4h",statut:"a_venir",adresse:"Port de Monaco",notes:"Matériel spécial requis",facture_generee:false,montant:1200},
    {id:"M006",titre:"Nettoyage Airbnb",client:"Pierre Lefevre",service:"Airbnb",collab:"thomas",date:getDateStr(2),heure:"10:00",duree:"2h",statut:"a_venir",adresse:"8 rue du Temple, 75004",notes:"",facture_generee:false,montant:280},
    {id:"M007",titre:"Mission Jet Privé",client:"Ahmed Al-Rashid",service:"Jet Privé",collab:"fatou",date:getDateStr(3),heure:"08:00",duree:"3h",statut:"a_venir",adresse:"Aéroport CDG Terminal 2",notes:"Client VIP — protocole premium",facture_generee:false,montant:1800},
  ]);

  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [filtreCollab,setFiltreCollab]=useState("tous");
  const [filtreService,setFiltreService]=useState("tous");
  const [modalConfig,setModalConfig]=useState(null);
  const [aiPlanning,setAiPlanning]=useState(false);

  // Formulaire nouvelle mission
  const [form,setForm]=useState({titre:"",client:"",service:"",collab:"",date:"",heure:"",duree:"1h",adresse:"",notes:"",montant:""});
  const setF=k=>e=>setForm(p=>({...p,[k]:e.target.value}));

  const SERVICES=["Airbnb","Résidentiel","Bureaux","Jet Privé","Yacht","Rapatriement"];
  const JOURS_NOMS=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  const STATUT_COLORS={"a_venir":C.blue,"en_cours":C.green,"terminé":C.muted,"annulé":C.red};
  const STATUT_LABELS={"a_venir":"À venir","en_cours":"En cours","terminé":"Terminé","annulé":"Annulé"};

  // ── HELPERS ───────────────────────────────────────────────
  function getDateStr(offset=0){
    const d=new Date();d.setDate(d.getDate()+offset);
    return`${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;
  }

  // ── VÉRIFICATION RÈGLES ───────────────────────────────────
  const verifierRegles=(collab,date,heure)=>{
    const mb=equipe.find(e=>e.id===collab);
    if(!mb)return{ok:true};
    // Vérifier jour de repos
    const d=new Date(date.split("/").reverse().join("-"));
    if(mb.jours_repos.includes(d.getDay())) return{ok:false,msg:`${mb.nom} est en repos ce jour`};
    // Vérifier horaires
    const [h,m]=heure.split(":").map(Number);
    const [hd,md]=mb.horaires.debut.split(":").map(Number);
    const [hf,mf]=mb.horaires.fin.split(":").map(Number);
    if(h*60+m < hd*60+md) return{ok:false,msg:`${mb.nom} commence à ${mb.horaires.debut}`};
    if(h*60+m >= hf*60+mf) return{ok:false,msg:`${mb.nom} finit à ${mb.horaires.fin}`};
    // Vérifier pause
    const [hp1,mp1]=mb.horaires.pause_debut.split(":").map(Number);
    const [hp2,mp2]=mb.horaires.pause_fin.split(":").map(Number);
    if(h*60+m >= hp1*60+mp1 && h*60+m < hp2*60+mp2) return{ok:false,msg:`${mb.nom} est en pause (${mb.horaires.pause_debut}-${mb.horaires.pause_fin})`};
    // Vérifier conflit
    const conflit=missions.find(m=>m.collab===collab&&m.date===date&&m.heure===heure&&m.id!==selected?.id);
    if(conflit) return{ok:false,msg:`${mb.nom} a déjà une mission à ${heure}`};
    return{ok:true};
  };

  // ── ASSIGNATION AUTOMATIQUE ───────────────────────────────
  const assignerAuto=(service,date,heure)=>{
    const disponibles=equipe.filter(mb=>{
      if(mb.id==="curtiss")return false;
      if(!mb.services.includes(service)&&!mb.services.includes("Tous"))return false;
      const r=verifierRegles(mb.id,date,heure);
      return r.ok;
    });
    if(disponibles.length===0)return null;
    // Prioriser selon charge de travail
    const avecCharge=disponibles.map(mb=>({
      ...mb,charge:missions.filter(m=>m.collab===mb.id&&m.date===date).length
    }));
    return avecCharge.sort((a,b)=>a.charge-b.charge)[0].id;
  };

  // ── CRÉER MISSION ─────────────────────────────────────────
  const creerMission=()=>{
    if(!form.client||!form.service||!form.date||!form.heure){showToast("Remplis les champs obligatoires *","#EF4444");return;}
    // Assignation auto si pas de collab choisi
    let collab=form.collab;
    if(!collab){
      collab=assignerAuto(form.service,form.date,form.heure);
      if(!collab){showToast("⚠️ Aucun collaborateur disponible sur ce créneau","#F59E0B");return;}
      showToast(`🤖 Assigné automatiquement à ${equipe.find(e=>e.id===collab)?.nom}`);
    } else {
      const check=verifierRegles(collab,form.date,form.heure);
      if(!check.ok){showToast(`🚫 ${check.msg}`,"#EF4444");return;}
    }
    const id=`M${String(missions.length+1).padStart(3,"0")}`;
    const m={id,...form,collab,statut:"a_venir",facture_generee:false,montant:Number(form.montant)||0,titre:form.titre||`${form.service} — ${form.client}`};
    setMissions(p=>[...p,m]);
    // Notifs auto
    const mb=equipe.find(e=>e.id===collab);
    showToast(`✅ Mission créée · 📲 Notif envoyée à ${mb?.nom}`);
    setModal(null);
    setForm({titre:"",client:"",service:"",collab:"",date:"",heure:"",duree:"1h",adresse:"",notes:"",montant:""});
  };

  // ── TERMINER MISSION ──────────────────────────────────────
  const terminerMission=id=>{
    setMissions(p=>p.map(m=>m.id===id?{...m,statut:"terminé",facture_generee:true}:m));
    showToast("✅ Mission terminée · 🧾 Facture générée automatiquement · 📲 Envoyée au client");
  };

  // ── IA PLANNING AUTO ──────────────────────────────────────
  const lancerAiPlanning=async()=>{
    setAiPlanning(true);
    await new Promise(r=>setTimeout(r,2000));
    showToast("🤖 Planning optimisé par l'IA · Missions réassignées selon disponibilités");
    setAiPlanning(false);
  };

  const TABS=[
    {id:"semaine",label:"📅 Semaine"},
    {id:"mois",label:"🗓️ Mois"},
    {id:"collaborateurs",label:"👥 Par collaborateur"},
    {id:"config",label:"⚙️ Configuration"},
    {id:"analytics",label:"📊 Analytics"},
  ];

  const missionsFiltered=missions.filter(m=>{
    if(filtreCollab!=="tous"&&m.collab!==filtreCollab)return false;
    if(filtreService!=="tous"&&m.service!==filtreService)return false;
    return true;
  });

  const getCollabColor=(id)=>equipe.find(e=>e.id===id)?.couleur||C.muted;
  const getCollabNom=(id)=>equipe.find(e=>e.id===id)?.nom||id;

  // Semaine courante
  const semaine=Array.from({length:7},(_,i)=>{
    const d=new Date();
    const day=d.getDay();
    const monday=new Date(d);
    monday.setDate(d.getDate()-(day===0?6:day-1)+i);
    return{
      date:`${monday.getDate().toString().padStart(2,"0")}/${(monday.getMonth()+1).toString().padStart(2,"0")}/${monday.getFullYear()}`,
      label:JOURS_NOMS[monday.getDay()],
      num:monday.getDate(),
      isToday:monday.toDateString()===new Date().toDateString(),
    };
  });

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px #00000066",maxWidth:400}}>{toast.msg}</div>}

      {/* ── MODAL CRÉER / MODIFIER MISSION ── */}
      {(modal==="creer"||modal==="modifier")&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:28,width:520,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:20}}>{modal==="creer"?"+ Nouvelle mission":"✏️ Modifier la mission"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Titre (optionnel)</div><Inp placeholder="Ex: Nettoyage Airbnb Montmartre" value={form.titre} onChange={setF("titre")} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Client *</div><Inp placeholder="Sofia Riad" value={form.client} onChange={setF("client")} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Service *</div><Sel value={form.service} onChange={setF("service")} options={[{v:"",l:"Choisir..."},...SERVICES.map(s=>({v:s,l:s}))]} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Date *</div><Inp type="date" value={form.date} onChange={setF("date")} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Heure *</div><Inp type="time" value={form.heure} onChange={setF("heure")} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Durée</div><Sel value={form.duree} onChange={setF("duree")} options={["30min","1h","1h30","2h","2h30","3h","4h","5h","6h","Journée"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
              </div>

              {/* ASSIGNATION */}
              <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:12}}>
                <div style={{fontSize:10,fontWeight:600,color:C.purple,marginBottom:8}}>👤 Assignation</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                  <button onClick={()=>setForm(p=>({...p,collab:""}))} style={{padding:"5px 12px",border:`1px solid ${!form.collab?C.purple:C.border}`,borderRadius:20,background:!form.collab?`${C.purple}22`:C.card2,color:!form.collab?C.purple:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>
                    🤖 Auto (recommandé)
                  </button>
                  {equipe.filter(e=>e.id!=="curtiss").map(e=>(
                    <button key={e.id} onClick={()=>setForm(p=>({...p,collab:e.id}))} style={{padding:"5px 12px",border:`1px solid ${form.collab===e.id?e.couleur:C.border}`,borderRadius:20,background:form.collab===e.id?`${e.couleur}22`:C.card2,color:form.collab===e.id?e.couleur:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>
                      {e.nom}
                    </button>
                  ))}
                </div>
                {!form.collab&&form.service&&form.date&&form.heure&&(
                  <div style={{fontSize:11,color:C.purple}}>
                    🤖 Sera assigné à : <b>{equipe.find(e=>e.id===assignerAuto(form.service,form.date.split("-").reverse().join("/"),form.heure))?.nom||"Vérification..."}</b>
                  </div>
                )}
                {form.collab&&form.date&&form.heure&&(()=>{const check=verifierRegles(form.collab,form.date.split("-").reverse().join("/"),form.heure);return !check.ok?<div style={{fontSize:11,color:C.red,marginTop:4}}>🚫 {check.msg}</div>:null;})()}
              </div>

              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Adresse</div><Inp placeholder="18 rue Lepic, 75018 Paris" value={form.adresse} onChange={setF("adresse")} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Montant (€)</div><Inp type="number" placeholder="320" value={form.montant} onChange={setF("montant")} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Notes</div><Inp placeholder="Instructions particulières..." value={form.notes} onChange={setF("notes")} style={{width:"100%"}}/></div>
              </div>

              <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>
                📲 Notification automatique envoyée au collaborateur assigné · Confirmation envoyée au client
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={modal==="creer"?creerMission:()=>{setMissions(p=>p.map(m=>m.id===selected.id?{...selected,...form,montant:Number(form.montant)||0}:m));setModal(null);showToast("✓ Mission modifiée !");}}>
                {modal==="creer"?"✓ Créer la mission":"✓ Enregistrer"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIG COLLABORATEUR ── */}
      {modalConfig&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${modalConfig.couleur}44`,borderRadius:14,padding:24,width:440}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16,color:modalConfig.couleur}}>⚙️ {modalConfig.nom} — Configuration</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div>
                <div style={{fontSize:10,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Horaires de travail</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["Début","debut"],["Fin","fin"],["Pause début","pause_debut"],["Pause fin","pause_fin"]].map(([l,k])=>(
                    <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                    <input type="time" value={modalConfig.horaires[k]} onChange={e=>setModalConfig(p=>({...p,horaires:{...p.horaires,[k]:e.target.value}}))} style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 8px",color:C.text,fontFamily:"inherit",fontSize:12}}/></div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:10,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Jours de repos</div>
                <div style={{display:"flex",gap:5}}>
                  {JOURS_NOMS.map((j,idx)=>(
                    <button key={idx} onClick={()=>setModalConfig(p=>({...p,jours_repos:p.jours_repos.includes(idx)?p.jours_repos.filter(x=>x!==idx):[...p.jours_repos,idx]}))} style={{flex:1,padding:"6px 4px",border:`1px solid ${modalConfig.jours_repos.includes(idx)?C.red:C.border}`,borderRadius:6,background:modalConfig.jours_repos.includes(idx)?`${C.red}22`:C.card2,color:modalConfig.jours_repos.includes(idx)?C.red:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{j}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:10,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Services assignables</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {SERVICES.map(s=>(
                    <button key={s} onClick={()=>setModalConfig(p=>({...p,services:p.services.includes(s)?p.services.filter(x=>x!==s):[...p.services,s]}))} style={{padding:"4px 10px",border:`1px solid ${modalConfig.services.includes(s)?modalConfig.couleur:C.border}`,borderRadius:20,background:modalConfig.services.includes(s)?`${modalConfig.couleur}22`:C.card2,color:modalConfig.services.includes(s)?modalConfig.couleur:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <Btn v="ghost" full onClick={()=>setModalConfig(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{setEquipe(p=>p.map(e=>e.id===modalConfig.id?modalConfig:e));setModalConfig(null);showToast("✓ Configuration sauvegardée !");}}>✓ Sauvegarder</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub={`Planning automatique · IA · Règles · Notifications · ${profil.label}`}>⊡ Planning & Agenda</STitle>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={lancerAiPlanning}>{aiPlanning?"🤖 Optimisation...":"🤖 IA Auto-planifier"}</Btn>
          <Btn v="ghost" onClick={()=>showToast("🔗 Lien booking copié !")}>🔗 Lien réservation</Btn>
          <Btn v="gold" onClick={()=>{setForm({titre:"",client:"",service:"",collab:"",date:"",heure:"",duree:"1h",adresse:"",notes:"",montant:""});setModal("creer");}}>+ {profil.termes.mission}</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label={`${profil.termes.missions} ce mois`} val={missions.length} color={C.blue}/>
        <KPI label="En cours" val={missions.filter(m=>m.statut==="en_cours").length} color={C.green}/>
        <KPI label="À venir" val={missions.filter(m=>m.statut==="a_venir").length} color={C.gold}/>
        <KPI label="Terminées" val={missions.filter(m=>m.statut==="terminé").length} color={C.muted}/>
        <KPI label={`CA ${profil.termes.missions.toLowerCase()}`} val={fmt(missions.reduce((s,m)=>s+m.montant,0),"EUR")} color={C.purple}/>
      </div>

      {/* Filtres */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:5}}>
          {["tous",...equipe.map(e=>e.id)].map(id=>{
            const e=equipe.find(x=>x.id===id);
            return(
              <button key={id} onClick={()=>setFiltreCollab(id)} style={{padding:"4px 10px",border:`1px solid ${filtreCollab===id?(e?.couleur||C.gold):C.border}`,borderRadius:20,background:filtreCollab===id?`${e?.couleur||C.gold}22`:C.card2,color:filtreCollab===id?(e?.couleur||C.gold):C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>
                {id==="tous"?"Tous":e?.nom}
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:5}}>
          {["tous",...SERVICES].map(s=>(
            <button key={s} onClick={()=>setFiltreService(s)} style={{padding:"4px 10px",border:`1px solid ${filtreService===s?C.teal:C.border}`,borderRadius:20,background:filtreService===s?`${C.teal}22`:C.card2,color:filtreService===s?C.teal:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>
              {s==="tous"?"Tous services":s}
            </button>
          ))}
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── VUE SEMAINE ── */}
      {tab==="semaine"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"60px repeat(7,1fr)",gap:1,background:C.border,borderRadius:10,overflow:"hidden"}}>
            {/* Header jours */}
            <div style={{background:C.card2,padding:"8px 0"}}/>
            {semaine.map((j,i)=>(
              <div key={i} style={{background:j.isToday?`${C.gold}11`:C.card2,padding:"8px",textAlign:"center",borderLeft:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,color:j.isToday?C.gold:C.muted,fontWeight:j.isToday?700:400}}>{j.label}</div>
                <div style={{fontSize:16,fontWeight:700,color:j.isToday?C.gold:C.text}}>{j.num}</div>
              </div>
            ))}
            {/* Heures */}
            {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map(h=>(
              <>
                <div key={h+"_h"} style={{background:C.card,padding:"12px 6px",textAlign:"right",fontSize:9,color:C.muted,borderTop:`1px solid ${C.border}`}}>{h}</div>
                {semaine.map((j,i)=>{
                  const missionsSlot=missionsFiltered.filter(m=>{
                    const mDate=m.date;
                    return mDate===j.date&&m.heure===h;
                  });
                  return(
                    <div key={h+"_"+i} style={{background:C.card,borderTop:`1px solid ${C.border}`,borderLeft:`1px solid ${C.border}`,padding:2,minHeight:44,position:"relative"}}>
                      {missionsSlot.map((m,k)=>{
                        const cc=getCollabColor(m.collab);
                        return(
                          <div key={k} style={{background:`${cc}22`,border:`1px solid ${cc}44`,borderLeft:`3px solid ${cc}`,borderRadius:4,padding:"3px 5px",marginBottom:2,cursor:"pointer",fontSize:9}}
                            onClick={()=>{setSelected(m);setForm({...m,date:m.date,montant:String(m.montant)});setModal("modifier");}}
                          >
                            <div style={{fontWeight:600,color:cc,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{m.titre||m.service}</div>
                            <div style={{color:C.muted,fontSize:8}}>{getCollabNom(m.collab)}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      )}

      {/* ── VUE MOIS ── */}
      {tab==="mois"&&(
        <Card>
          <CT>🗓️ {new Date().toLocaleDateString("fr",{month:"long",year:"numeric"})}</CT>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
            {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j=>(
              <div key={j} style={{textAlign:"center",fontSize:10,color:C.muted,fontWeight:600,padding:"4px 0"}}>{j}</div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {Array.from({length:35},(_,i)=>{
              const d=new Date(now.getFullYear(),now.getMonth(),1);
              const firstDay=(d.getDay()||7)-1;
              const dayNum=i-firstDay+1;
              const isCurrentMonth=dayNum>0&&dayNum<=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
              const dateStr=isCurrentMonth?`${dayNum.toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getFullYear()}`:"";
              const dayMissions=dateStr?missionsFiltered.filter(m=>m.date===dateStr):[];
              const isToday=dayNum===now.getDate()&&isCurrentMonth;
              return(
                <div key={i} style={{minHeight:60,background:isToday?`${C.gold}11`:isCurrentMonth?C.card2:"transparent",borderRadius:6,padding:4,border:isToday?`1px solid ${C.gold}44`:`1px solid ${C.border}`}}>
                  {isCurrentMonth&&<div style={{fontSize:11,fontWeight:isToday?700:400,color:isToday?C.gold:C.muted,marginBottom:2}}>{dayNum}</div>}
                  {dayMissions.slice(0,2).map((m,k)=>{
                    const cc=getCollabColor(m.collab);
                    return<div key={k} style={{background:`${cc}22`,borderLeft:`2px solid ${cc}`,borderRadius:2,padding:"1px 4px",fontSize:8,color:cc,marginBottom:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{m.titre||m.service}</div>;
                  })}
                  {dayMissions.length>2&&<div style={{fontSize:8,color:C.muted}}>+{dayMissions.length-2}</div>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── VUE PAR COLLABORATEUR ── */}
      {tab==="collaborateurs"&&(
        <div>
          {equipe.map((e,i)=>{
            const missionsMb=missions.filter(m=>m.collab===e.id);
            return(
              <Card key={i} style={{marginBottom:12,borderColor:`${e.couleur}44`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`${e.couleur}22`,border:`1px solid ${e.couleur}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:e.couleur}}>{e.nom}</div>
                      <div style={{fontSize:11,color:C.muted}}>{e.role} · {e.horaires.debut}–{e.horaires.fin} · Pause {e.horaires.pause_debut}–{e.horaires.pause_fin}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <Pill label={`${missionsMb.filter(m=>m.statut==="a_venir").length} à venir`} color={e.couleur}/>
                    <Pill label={e.statut} color={e.statut==="Disponible"?C.green:C.orange}/>
                    <Btn sm v="ghost" onClick={()=>setModalConfig({...e})}>⚙️ Config</Btn>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                  {JOURS_NOMS.map((j,idx)=>(
                    <div key={idx} style={{padding:"3px 8px",borderRadius:5,background:e.jours_repos.includes(idx)?`${C.red}22`:e.couleur+"22",border:`1px solid ${e.jours_repos.includes(idx)?C.red:e.couleur}33`,fontSize:10,color:e.jours_repos.includes(idx)?C.red:e.couleur}}>{j}</div>
                  ))}
                </div>
                {missionsMb.length===0?<div style={{textAlign:"center",padding:"10px 0",color:C.muted,fontSize:12}}>Aucune mission planifiée</div>:(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {missionsMb.slice(0,3).map((m,k)=>(
                      <div key={k} style={{background:C.card2,borderLeft:`3px solid ${e.couleur}`,borderRadius:6,padding:8}}>
                        <div style={{fontSize:11,fontWeight:600,color:e.couleur,marginBottom:2}}>{m.heure} · {m.duree}</div>
                        <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{m.titre||m.service}</div>
                        <div style={{fontSize:10,color:C.muted}}>{m.client} · {m.date}</div>
                        <Pill label={STATUT_LABELS[m.statut]} color={STATUT_COLORS[m.statut]}/>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── CONFIG ── */}
      {tab==="config"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
            <CT>🔗 Lien de réservation automatique</CT>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:10}}>
                  Le client clique sur le lien → choisit son service → voit les créneaux disponibles → réserve → confirmation automatique WhatsApp + Email.
                </div>
                <div style={{background:C.card2,borderRadius:7,padding:10,marginBottom:10}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:3}}>Lien de réservation</div>
                  <div style={{fontFamily:"monospace",fontSize:11,color:C.gold}}>tymeless.fr/rdv/curtiss</div>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <Btn sm v="gold" onClick={()=>showToast("📋 Lien copié !")}>📋 Copier</Btn>
                  <Btn sm v="ghost" onClick={()=>showToast("📲 Lien envoyé sur WhatsApp")}>📲 WA</Btn>
                </div>
              </div>
              <div style={{background:C.card2,borderRadius:10,padding:12}}>
                <div style={{fontSize:11,fontWeight:600,color:C.gold,marginBottom:8}}>⚙️ Configuration booking</div>
                {[["Délai minimum réservation","24h avant"],["Durée créneaux","30 minutes"],["Rappel automatique","24h avant"],["Annulation possible","Jusqu'à 12h avant"],["Confirmation","WhatsApp + Email auto"]].map(([l,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                    <span style={{color:C.muted}}>{l}</span>
                    <span style={{color:C.text,fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CT>👥 Configuration équipe — Horaires & Repos</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              {equipe.map((e,i)=>(
                <div key={i} style={{background:C.card2,border:`1px solid ${e.couleur}33`,borderRadius:10,padding:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:`${e.couleur}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
                      <div><div style={{fontWeight:600,color:e.couleur}}>{e.nom}</div><div style={{fontSize:10,color:C.muted}}>{e.role}</div></div>
                    </div>
                    <Btn sm v="ghost" onClick={()=>setModalConfig({...e})}>⚙️ Modifier</Btn>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:6}}>
                    🕐 {e.horaires.debut} – {e.horaires.fin} · Pause {e.horaires.pause_debut}–{e.horaires.pause_fin}
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {JOURS_NOMS.map((j,idx)=>(
                      <div key={idx} style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:e.jours_repos.includes(idx)?`${C.red}22`:e.couleur+"22",color:e.jours_repos.includes(idx)?C.red:e.couleur,border:`1px solid ${e.jours_repos.includes(idx)?C.red:e.couleur}33`}}>{j}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {tab==="analytics"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            <KPI label="Taux complétion" val={`${missions.length?Math.round((missions.filter(m=>m.statut==="terminé").length/missions.length)*100):0}%`} color={C.green}/>
            <KPI label="CA total missions" val={fmt(missions.reduce((s,m)=>s+m.montant,0),"EUR")} color={C.gold}/>
            <KPI label="Missions annulées" val={missions.filter(m=>m.statut==="annulé").length} color={C.red}/>
            <KPI label="Factures générées" val={missions.filter(m=>m.facture_generee).length} color={C.blue}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>👥 Missions par collaborateur</CT>
              {equipe.filter(e=>e.id!=="curtiss").map((e,i)=>{
                const nb=missions.filter(m=>m.collab===e.id).length;
                return(
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{color:e.couleur,fontWeight:600}}>{e.nom}</span>
                      <span style={{color:C.muted}}>{nb} missions</span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:C.border}}><div style={{height:"100%",width:`${missions.length?Math.min((nb/missions.length)*100,100):0}%`,background:e.couleur,borderRadius:3}}/></div>
                  </div>
                );
              })}
            </Card>
            <Card>
              <CT>🏷️ Missions par service</CT>
              {SERVICES.map((s,i)=>{
                const nb=missions.filter(m=>m.service===s).length;
                const ca=missions.filter(m=>m.service===s).reduce((sum,m)=>sum+m.montant,0);
                return nb>0?(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                    <span style={{color:C.muted}}>{s}</span>
                    <div style={{display:"flex",gap:10}}>
                      <span style={{color:C.blue}}>{nb} missions</span>
                      <span style={{color:C.gold,fontWeight:600}}>{fmt(ca,"EUR")}</span>
                    </div>
                  </div>
                ):null;
              })}
            </Card>
          </div>

          <Card style={{marginTop:14}}>
            <CT>📋 Toutes les missions</CT>
            <TH heads={["Mission","Client","Service","Collaborateur","Date","Heure","Durée","Montant","Statut","Actions"]} rows={missionsFiltered.map((m,i)=>(
              <tr key={i}>
                <Td><span style={{fontWeight:600,fontSize:12}}>{m.titre||m.service}</span></Td>
                <Td><span style={{fontSize:11}}>{m.client}</span></Td>
                <Td><Pill label={m.service} color={C.blue}/></Td>
                <Td><Pill label={getCollabNom(m.collab)} color={getCollabColor(m.collab)}/></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{m.date}</span></Td>
                <Td><span style={{fontWeight:600,color:C.gold}}>{m.heure}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{m.duree}</span></Td>
                <Td><span style={{fontWeight:700,color:C.green}}>{fmt(m.montant,"EUR")}</span></Td>
                <Td><Pill label={STATUT_LABELS[m.statut]} color={STATUT_COLORS[m.statut]}/></Td>
                <Td>
                  <div style={{display:"flex",gap:4}}>
                    {m.statut==="a_venir"&&<Btn sm v="green" onClick={()=>{setMissions(p=>p.map(x=>x.id===m.id?{...x,statut:"en_cours"}:x));showToast("● Mission démarrée");}}>▶</Btn>}
                    {m.statut==="en_cours"&&<Btn sm v="gold" onClick={()=>terminerMission(m.id)}>✓</Btn>}
                    <Btn sm v="blue" onClick={()=>{setSelected(m);setForm({...m,montant:String(m.montant)});setModal("modifier");}}>✏️</Btn>
                    <Btn sm v="red" onClick={()=>{setMissions(p=>p.filter(x=>x.id!==m.id));showToast("Mission supprimée","#EF4444");}}>🗑</Btn>
                  </div>
                </Td>
              </tr>
            ))}/>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── SECTEURS & DÉPARTEMENTS ──────────────────────────────────

// ─── SECTEURS & DÉPARTEMENTS ──────────────────────────────────
const SIRENE_SECTORS=[
  {id:"syndic",label:"Syndics",icon:"🏢",naf:"6832A",q:"syndic copropriété"},
  {id:"hotel",label:"Hôtels",icon:"🏨",naf:"5510Z",q:"hôtel"},
  {id:"agence",label:"Agences immo",icon:"🏠",naf:"6831Z",q:"agence immobilière"},
  {id:"restaurant",label:"Restaurants",icon:"🍽",naf:"5610A",q:"restaurant"},
  {id:"aviation",label:"Aviation",icon:"✈️",naf:"5110Z",q:"aviation affaires"},
  {id:"yacht",label:"Yachting",icon:"🛥️",naf:"5030Z",q:"marina yacht club"},
  {id:"avocat",label:"Avocats",icon:"⚖",naf:"6910Z",q:"cabinet avocat"},
  {id:"medecin",label:"Médecins",icon:"🩺",naf:"8621Z",q:"cabinet médical"},
  {id:"btp",label:"BTP",icon:"🏗",naf:"4120A",q:"construction bâtiment"},
  {id:"transport",label:"Transport",icon:"🚚",naf:"4941A",q:"transport marchandises"},
  {id:"luxe",label:"Luxe & Mode",icon:"💎",naf:"4771Z",q:"boutique luxe mode"},
  {id:"event",label:"Événementiel",icon:"🎪",naf:"8230Z",q:"organisation événements"},
];
const DEPTS=[
  {c:"75",n:"Paris"},{c:"92",n:"Hts-de-S"},{c:"93",n:"S-St-D"},{c:"94",n:"Val-M"},
  {c:"77",n:"S-et-M"},{c:"78",n:"Yvelines"},{c:"91",n:"Essonne"},{c:"95",n:"V-d'Oise"},
  {c:"13",n:"B-du-R"},{c:"06",n:"A-Marit"},{c:"69",n:"Rhône"},{c:"31",n:"Hte-Gar"},
  {c:"33",n:"Gironde"},{c:"59",n:"Nord"},{c:"67",n:"Bas-Rh"},{c:"44",n:"Loire-A"},
  {c:"76",n:"S-Mar"},{c:"83",n:"Var"},{c:"34",n:"Hérault"},{c:"38",n:"Isère"},
];

const PageProspection=()=>{
  const [tab,setTab]=useState("sirene");

  // ── SIRENE ──────────────────────────────────────────────────
  const [sirSector,setSirSector]=useState(null);
  const [sirDepts,setSirDepts]=useState([]);
  const [sirZone,setSirZone]=useState("");
  const [sirNaf,setSirNaf]=useState("");
  const [sirMax,setSirMax]=useState("50");
  const [sirEnrich,setSirEnrich]=useState("full");
  const [sirResults,setSirResults]=useState([]);
  const [sirRunning,setSirRunning]=useState(false);
  const [sirProgress,setSirProgress]=useState(0);
  const [sirStatus,setSirStatus]=useState("");
  const [sirAbort,setSirAbort]=useState({flag:false});
  const [sirFilter,setSirFilter]=useState("");
  const [sirApiKey,setSirApiKey]=useState(()=>typeof window!=="undefined"?localStorage.getItem("ty_anthropic")||"":"");
  const [selected,setSelected]=useState([]);

  const toggleDept=c=>setSirDepts(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);
  const toggleSelect=idx=>setSelected(p=>p.includes(idx)?p.filter(x=>x!==idx):[...p,idx]);
  const selectAll=()=>setSelected(sirResults.map((_,i)=>i));

  const fetchSirene=async(naf,dept,limit)=>{
    let url=`https://recherche-entreprises.api.gouv.fr/search?per_page=${Math.min(limit,25)}&page=1`;
    if(naf)url+=`&activite_principale=${encodeURIComponent(naf)}`;
    if(dept)url+=`&departement=${dept}`;
    const r=await fetch(url);if(!r.ok)return[];
    const d=await r.json();
    return(d.results||[]).map(r=>({
      name:r.nom_complet||r.nom_raison_sociale||"",siret:r.siege?.siret||"",
      adresse:[r.siege?.numero_voie,r.siege?.type_voie,r.siege?.libelle_voie].filter(Boolean).join(" "),
      cp:r.siege?.code_postal||"",ville:r.siege?.libelle_commune||"",
      naf:r.activite_principale||naf||"",lots:r.nombre_etablissements_ouverts||"",
      phone:"",email:"",website:"",decideur:"",status:"pending",score:null
    }));
  };

  const enrichOne=async(item)=>{
    const ctx=[item.name,item.adresse,item.cp,item.ville].filter(Boolean).join(", ");
    const prompt=`Recherche les coordonnées de l'entreprise française "${ctx}". Réponds UNIQUEMENT en JSON sans markdown : {"phone":"","email":"","website":"","decideur":"","score":0,"score_raison":""}. Le score est de 0 à 100 selon le potentiel pour une société de nettoyage premium (nettoyage Airbnb, jet privé, yacht, bureaux, rapatriement).`;
    const key=sirApiKey||localStorage.getItem("ty_anthropic")||"";
    if(!key)return{};
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:prompt}]})});
    if(!r.ok)return{};
    const d=await r.json();
    const txt=(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
    const m=txt.replace(/```json|```/g,"").trim().match(/\{[^{}]*\}/);
    if(m){try{return JSON.parse(m[0]);}catch(e){}}
    return{};
  };

  const runSirene=async()=>{
    if(!sirSector&&!sirNaf){setSirStatus("⚠ Choisissez un secteur");return;}
    if(sirDepts.length===0&&!sirZone){setSirStatus("⚠ Choisissez un département");return;}
    const abort={flag:false};setSirAbort(abort);
    setSirRunning(true);setSirResults([]);setSirProgress(0);setSelected([]);
    const sec=SIRENE_SECTORS.find(s=>s.id===sirSector);
    const naf=sirNaf||sec?.naf||"";
    const depts=sirDepts.length>0?sirDepts:["75"];
    const maxN=parseInt(sirMax);
    setSirStatus("🔍 Recherche SIRENE...");
    let all=[];
    for(const d of depts){if(abort.flag)break;const r=await fetchSirene(naf,d,Math.ceil(maxN/depts.length));all.push(...r);}
    const seen=new Set();
    all=all.filter(c=>{if(seen.has(c.siret))return false;seen.add(c.siret);return true;}).slice(0,maxN);
    if(sirEnrich==="none"){setSirResults(all.map(c=>({...c,status:"ok"})));setSirRunning(false);setSirStatus(`✓ ${all.length} entreprises trouvées`);return;}
    setSirResults([...all]);setSirStatus(`${all.length} entreprises — enrichissement en cours...`);
    for(let i=0;i<all.length;i++){
      if(abort.flag)break;
      all[i].status="searching";setSirResults([...all]);setSirProgress(Math.round((i/all.length)*100));
      try{const c=await enrichOne(all[i]);all[i]={...all[i],...c,status:(c.phone&&c.email?"ok":c.phone||c.email||c.website?"partial":"error")};}
      catch(e){all[i].status="error";}
      setSirResults([...all]);
      await new Promise(r=>setTimeout(r,600));
    }
    setSirRunning(false);setSirProgress(100);setSirStatus(`✅ ${all.length} entreprises · ${all.filter(r=>r.status==="ok").length} contacts complets`);
  };

  const exportCSV=()=>{
    const h=["Société","SIRET","Adresse","CP","Ville","NAF","Téléphone","Email","Site","Décideur","Score","Statut"];
    const rows=sirResults.map(r=>[r.name,r.siret,r.adresse,r.cp,r.ville,r.naf,r.phone,r.email,r.website,r.decideur,r.score||"",r.status]);
    const csv=[h,...rows].map(r=>r.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`tymeless_prospects_${new Date().toISOString().slice(0,10)}.csv`;a.click();
  };

  const sirFiltered=sirResults.filter(r=>!sirFilter||r.name.toLowerCase().includes(sirFilter.toLowerCase())||r.ville.toLowerCase().includes(sirFilter.toLowerCase()));

  // ── GÉNÉRATEUR IA ──────────────────────────────────────────
  const [form,setForm]=useState({nomProspect:"",secteur:"Immobilier",ville:"Paris",service:"Nettoyage Airbnb",canal:"WhatsApp",ton:"Professionnel & chaleureux",contexte:"",bot:"Thomas",langue:"Français"});
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [copied,setCopied]=useState(false);
  const [historique,setHistorique]=useState([]);

  const generer=async(overrideForm)=>{
    const f=overrideForm||form;
    if(!f.nomProspect.trim())return null;
    setLoading(true);setResult(null);
    try{
      const prompt=`Tu es ${f.bot}, agent de prospection pour Tymeless, conciergerie premium France.
Services : nettoyage Airbnb, résidentiel, bureaux, jet privé, yacht, rapatriement.
Génère un message de prospection ultra-personnalisé pour :
- Prospect : ${f.nomProspect} · Secteur : ${f.secteur} · Ville : ${f.ville}
- Service : ${f.service} · Canal : ${f.canal} · Ton : ${f.ton} · Langue : ${f.langue}
${f.contexte?`- Contexte : ${f.contexte}`:""}
Règles : court, humain, accroche spécifique au secteur, appel à l'action clair. Réponds UNIQUEMENT avec le message.`;
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await resp.json();
      const msg=data.content?.[0]?.text||"Erreur.";
      setResult(msg);
      const entry={id:Date.now(),prospect:f.nomProspect,secteur:f.secteur,service:f.service,canal:f.canal,bot:f.bot,msg,date:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})};
      setHistorique(h=>[entry,...h.slice(0,19)]);
      return msg;
    }catch(e){setResult("Erreur réseau.");}
    setLoading(false);
    return null;
  };
  const copier=()=>{if(!result)return;navigator.clipboard.writeText(result).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};

  // ── BOT VOCAL ──────────────────────────────────────────────
  const [blandKey,setBlandKey]=useState(()=>typeof window!=="undefined"?localStorage.getItem("ty_bland")||"":"");
  const [callForm,setCallForm]=useState({phone:"",nom:"",service:"Nettoyage Airbnb",script:"standard",bot:"Thomas",langue:"fr-FR"});
  const setC=k=>e=>setCallForm(p=>({...p,[k]:e.target.value}));
  const [callLog,setCallLog]=useState([
    {id:"CALL-001",nom:"Hôtel Beaurivage",phone:"+33 1 42 00 00 01",service:"Jet Privé",statut:"terminé",duree:"2m14s",resultat:"Intéressé — rappel vendredi",date:"Hier 14:32"},
    {id:"CALL-002",nom:"AirParis SARL",phone:"+33 1 55 00 00 02",service:"Airbnb",statut:"messagerie",duree:"0m42s",resultat:"Message laissé",date:"Hier 15:10"},
    {id:"CALL-003",nom:"Marina Monaco",phone:"+377 99 00 00 03",service:"Yacht",statut:"rappel",duree:"3m01s",resultat:"RDV lundi 10h",date:"Auj. 09:15"},
  ]);
  const [callLoading,setCallLoading]=useState(false);

  const lancerAppel=async()=>{
    if(!callForm.phone||!callForm.nom)return;
    setCallLoading(true);
    await new Promise(r=>setTimeout(r,1800));
    const newCall={id:`CALL-${String(callLog.length+1).padStart(3,"0")}`,nom:callForm.nom,phone:callForm.phone,service:callForm.service,statut:"en cours",duree:"—",resultat:"Appel en cours...",date:`Auj. ${new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})}`};
    setCallLog(p=>[newCall,...p]);setCallLoading(false);setCallForm(p=>({...p,phone:"",nom:""}));
    setTimeout(()=>setCallLog(p=>p.map(c=>c.id===newCall.id?{...c,statut:"terminé",duree:"1m47s",resultat:"Intéressé — devis demandé"}:c)),5000);
  };

  // ── PHASE 1 : WORKFLOW & MASSE ─────────────────────────────
  const [wfStep,setWfStep]=useState(0);
  const [wfProspect,setWfProspect]=useState(null);
  const [wfRunning,setWfRunning]=useState(false);
  const [wfLog,setWfLog]=useState([]);

  const runWorkflow=async(prospect)=>{
    setWfRunning(true);setWfProspect(prospect);setWfStep(1);setWfLog([]);
    const log=t=>setWfLog(p=>[...p,{t,time:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})}]);
    log(`✅ Prospect sélectionné : ${prospect.name}`);
    await new Promise(r=>setTimeout(r,800));setWfStep(2);
    log(`⭐ Score IA en cours...`);
    await new Promise(r=>setTimeout(r,1200));
    const score=Math.floor(60+Math.random()*38);
    log(`⭐ Score IA : ${score}/100`);
    setWfStep(3);
    log(`✍️ Génération message WhatsApp...`);
    await new Promise(r=>setTimeout(r,1500));
    log(`✍️ Message généré pour ${prospect.name}`);
    setWfStep(4);
    log(`📞 Appel vocal programmé...`);
    await new Promise(r=>setTimeout(r,800));
    log(`📞 Appel prévu dans 2h`);
    setWfStep(5);
    log(`🎯 Ajout au CRM en cours...`);
    await new Promise(r=>setTimeout(r,600));
    log(`🎯 Prospect ajouté au CRM Tymeless OS`);
    setWfStep(6);
    log(`📅 Séquence démarrée : WA J+0 → Email J+3 → Appel J+7`);
    setWfRunning(false);
  };

  const [masseProgress,setMasseProgress]=useState(0);
  const [masseRunning,setMasseRunning]=useState(false);
  const [masseResults,setMasseResults]=useState([]);

  const genererMasse=async()=>{
    const targets=selected.length>0?selected.slice(0,10):sirResults.slice(0,5).map((_,i)=>i);
    if(targets.length===0){alert("Sélectionnez des prospects dans SIRENE d'abord");return;}
    setMasseRunning(true);setMasseResults([]);
    for(let i=0;i<targets.length;i++){
      const p=sirResults[targets[i]];
      if(!p)continue;
      setMasseProgress(Math.round(((i+1)/targets.length)*100));
      await new Promise(r=>setTimeout(r,400));
      setMasseResults(prev=>[...prev,{prospect:p.name,ville:p.ville,msg:`Bonjour ${p.name}, je suis Thomas de Tymeless. Nos services de ${form.service} sont adaptés à votre activité ${p.naf||""}. Disponible pour un devis rapide ?`,statut:"prêt"}]);
    }
    setMasseRunning(false);
  };

  // ── SÉQUENCES AUTO ─────────────────────────────────────────
  const [seqActive,setSeqActive]=useState([
    {id:1,prospect:"Hôtel Beaurivage",etape:"WA J+0",statut:"envoyé",suivant:"Email J+3 (dans 3j)"},
    {id:2,prospect:"AirParis SARL",etape:"Email J+3",statut:"ouvert",suivant:"Appel J+7 (dans 4j)"},
    {id:3,prospect:"Marina Monaco",etape:"Appel J+7",statut:"RDV décroché",suivant:"Terminé ✓"},
  ]);
  const [seqConfig,setSeqConfig]=useState({j0:"WhatsApp",j3:"Email",j7:"Appel vocal",j14:"Relance WA"});

  // ── FICHE PROSPECT ─────────────────────────────────────────
  const [ficheProspect,setFicheProspect]=useState(null);
  const [ficheLoading,setFicheLoading]=useState(false);
  const [ficheSearch,setFicheSearch]=useState("");

  const genererFiche=async()=>{
    if(!ficheSearch.trim())return;
    setFicheLoading(true);setFicheProspect(null);
    try{
      const prompt=`Génère une fiche prospect complète pour : "${ficheSearch}". Réponds UNIQUEMENT en JSON : {"nom":"","secteur":"","ville":"","ca_estime":"","employes":"","dirigeant":"","tel":"","email":"","site":"","linkedin":"","derniere_actu":"","avis_google":"","potentiel_tymeless":0,"services_recommandes":[],"accroche":""}`;
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:prompt}]})});
      const data=await resp.json();
      const txt=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      const m=txt.replace(/```json|```/g,"").trim().match(/\{[\s\S]*\}/);
      if(m)setFicheProspect(JSON.parse(m[0]));
    }catch(e){console.error(e);}
    setFicheLoading(false);
  };

  // ── OBJECTION HANDLER ──────────────────────────────────────
  const [objection,setObjection]=useState("");
  const [objResponse,setObjResponse]=useState("");
  const [objLoading,setObjLoading]=useState(false);

  const handleObjection=async()=>{
    if(!objection.trim())return;
    setObjLoading(true);setObjResponse("");
    try{
      const prompt=`Tu es un expert en vente pour Tymeless (conciergerie premium). Le prospect vient de dire : "${objection}". Génère une réponse naturelle, percutante et non agressive pour contrer cette objection et relancer l'intérêt. Réponds directement avec la réponse (max 3 phrases).`;
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:prompt}]})});
      const data=await resp.json();
      setObjResponse(data.content?.[0]?.text||"");
    }catch(e){}
    setObjLoading(false);
  };

  // ── BI & ANALYTICS ─────────────────────────────────────────
  const roi=[
    {canal:"📞 Bot Vocal",envois:34,reponses:13,devis:5,deals:2,cout_contact:0.09,ca_genere:4800,roi:"+1420%"},
    {canal:"💬 WhatsApp",envois:89,reponses:27,devis:8,deals:3,cout_contact:0.01,ca_genere:6200,roi:"+6900%"},
    {canal:"📧 Email",envois:142,reponses:31,devis:9,deals:2,cout_contact:0.005,ca_genere:3800,roi:"+5350%"},
    {canal:"📸 Instagram",envois:28,reponses:9,devis:3,deals:1,cout_contact:0.02,ca_genere:1800,roi:"+3200%"},
  ];

  const funnelData=[
    {label:"Prospects SIRENE",val:142,color:C.blue},
    {label:"Enrichis",val:98,color:C.accent},
    {label:"Contactés",val:72,color:C.gold},
    {label:"Répondus",val:28,color:C.orange},
    {label:"Devis envoyés",val:12,color:C.purple},
    {label:"Signés",val:4,color:C.green},
  ];

  const meilleurs_moments=[
    {secteur:"Hôtellerie",jour:"Mardi",heure:"10h-12h",taux:"42%"},
    {secteur:"Aviation",jour:"Lundi",heure:"09h-11h",taux:"38%"},
    {secteur:"Airbnb",jour:"Mercredi",heure:"14h-16h",taux:"35%"},
    {secteur:"Syndics",jour:"Jeudi",heure:"11h-13h",taux:"28%"},
    {secteur:"Bureaux",jour:"Mardi",heure:"08h-10h",taux:"25%"},
  ];

  // ── DATA & SCRAPING ────────────────────────────────────────
  const [scrapSource,setScrapSource]=useState("google_maps");
  const [scrapQuery,setScrapQuery]=useState("");
  const [scrapRunning,setScrapRunning]=useState(false);
  const [scrapResults,setScrapResults]=useState([
    {name:"Le Meurice",source:"Google Maps",ville:"Paris 1er",tel:"+33 1 44 58 10 10",note:"4.9★",type:"Hôtel 5*",statut:"chaud"},
    {name:"Bristol Paris",source:"Google Maps",ville:"Paris 8e",tel:"+33 1 53 43 43 00",note:"4.8★",type:"Palace",statut:"très chaud"},
    {name:"Nemo Yacht Club",source:"Booking.com",ville:"Antibes",tel:"+33 4 93 34 00 00",note:"4.7★",type:"Marina",statut:"chaud"},
  ]);

  const scrapSources=[
    {id:"google_maps",label:"Google Maps",icon:"🗺️"},
    {id:"booking",label:"Booking.com",icon:"🏨"},
    {id:"airbnb",label:"Airbnb Hosts",icon:"🏠"},
    {id:"linkedin",label:"LinkedIn",icon:"💼"},
    {id:"pages_jaunes",label:"Pages Jaunes",icon:"📒"},
    {id:"leboncoin",label:"Leboncoin Pro",icon:"🔴"},
  ];

  const [veille,setVeille]=useState([
    {concurrent:"CleanPro Paris",event:"Avis négatif 1★",detail:"Client mécontent du nettoyage Airbnb — délai non respecté",priorite:"haute",date:"Il y a 2h"},
    {concurrent:"NettoyageVIP",event:"Nouveau client",detail:"Hôtel Martinez Cannes vient de les signer",priorite:"moyenne",date:"Hier"},
    {concurrent:"AirClean France",event:"Baisse de tarifs",detail:"Réduction 15% sur nettoyage résidentiel",priorite:"moyenne",date:"Il y a 3j"},
  ]);

  const [evenements,setEvenements]=useState([
    {type:"Hôtel ouvert",nom:"Hôtel Vertu Paris 17e",detail:"Ouverture prévue mars 2026, 45 chambres",action:"Contacter maintenant",priorite:"haute",date:"Détecté à 09:15"},
    {type:"Recrutement",nom:"AirParis Management",detail:"Cherche agent entretien — signe d'expansion",action:"Proposer partenariat",priorite:"moyenne",date:"Détecté à 11:30"},
    {type:"Avis négatif concurrent",nom:"Marina Cannes - Mister Clean",detail:"2 avis 1★ sur leur nettoyage yacht ce mois",action:"Contacter le client",priorite:"haute",date:"Détecté à 14:00"},
  ]);

  // ── MULTI-CANAL ────────────────────────────────────────────
  const [agentMulti,setAgentMulti]=useState({actif:false,thomas_wa:true,abou_appels:true,bot_email:true,bot_instagram:false});
  const [signaux,setSignaux]=useState([
    {nom:"Claire Dupont",event:"Changement de poste",detail:"Nouvelle DG chez Résidences Prestige Paris",action:"Féliciter + proposer audit nettoyage",score:88,date:"Il y a 1h"},
    {nom:"Marc Fontaine",event:"Recrutement",detail:"Cherche responsable entretien — veut internaliser",action:"Proposer alternative outsourcing",score:72,date:"Il y a 3h"},
    {nom:"Sofia Riad",event:"Publication",detail:"Post LinkedIn : 'Cherche prestataire nettoyage fiable'",action:"Répondre en commentaire + DM",score:95,date:"Il y a 20min"},
  ]);

  const [broadcast,setBroadcast]=useState({message:"",cible:"Airbnb",nb:0});
  const [traduction,setTraduction]=useState({texte:"",langue:"English",resultat:""});
  const [tradLoading,setTradLoading]=useState(false);

  const traduire=async()=>{
    if(!traduction.texte.trim())return;
    setTradLoading(true);
    try{
      const prompt=`Traduis ce message commercial en ${traduction.langue} en adaptant culturellement le ton : "${traduction.texte}". Réponds uniquement avec la traduction.`;
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:prompt}]})});
      const data=await resp.json();
      setTraduction(p=>({...p,resultat:data.content?.[0]?.text||""}));
    }catch(e){}
    setTradLoading(false);
  };

  // ── AGENTS IA ──────────────────────────────────────────────
  const [agentStatus,setAgentStatus]=useState({
    agent24h:{actif:false,missions:142,rdv:8},
    clone_vocal:{actif:false,voix:"Non cloné"},
    negociateur:{actif:false,deals:3,marge:"−8% moy."},
    fidelisation:{actif:false,clients:12,taux:"34%"},
  });

  // ── MONÉTISATION ───────────────────────────────────────────
  const [bdd,setBdd]=useState({total:sirResults.length+4820,complets:sirResults.filter(r=>r.status==="ok").length+2340,valeur_estime:(sirResults.length+4820)*8});

  // ── SÉCURITÉ ───────────────────────────────────────────────
  const [rgpd,setRgpd]=useState({contacts_traces:4820,opt_outs:23,base_legale:"Intérêt légitime B2B",derniere_purge:"01/04/2026"});
  const [blacklist,setBlacklist]=useState({verifies_ce_mois:89,bloques:4,taux_delivrabilite:"95.5%"});

  // ── CONFIG ─────────────────────────────────────────────────
  const [botCfg,setBotCfg]=useState({secteur:"Immobilier",zone:"Paris, France",volume:"50",remuneration:"Commission 15–30% sur deal",actif:false});
  const setBc=k=>e=>setBotCfg(p=>({...p,[k]:e.target.value}));

  const CANAL_STYLES={WhatsApp:{bg:"#075E54",header:"#128C7E",bubble:"#DCF8C6",txt:"#111"},Email:{bg:C.card2,header:C.card,bubble:`${C.gold}11`,txt:C.text},LinkedIn:{bg:"#0A66C2"+"22",header:"#0A66C2"+"44",bubble:"#0A66C222",txt:C.text},SMS:{bg:C.card2,header:C.card,bubble:`${C.blue}22`,txt:C.text}};
  const cs=CANAL_STYLES[form.canal]||CANAL_STYLES.WhatsApp;

  const TABS=[
    {id:"sirene",label:"🔍 SIRENE"},
    {id:"generateur",label:"✍️ Générateur IA"},
    {id:"vocal",label:"📞 Bot Vocal"},
    {id:"workflow",label:"⚡ Workflow & Masse"},
    {id:"sequences",label:"🔁 Séquences"},
    {id:"fiche",label:"🗂️ Fiche Prospect"},
    {id:"objection",label:"🥊 Objections"},
    {id:"bi",label:"📊 BI & Analytics"},
    {id:"scraping",label:"🌐 Data & Scraping"},
    {id:"multicanal",label:"📱 Multi-Canal"},
    {id:"agents",label:"🤖 Agents IA"},
    {id:"monetisation",label:"💰 Monétisation"},
    {id:"securite",label:"🔐 Sécurité"},
    {id:"config",label:"⚙ Config"},
    {id:"historique",label:`📋 Historique${historique.length>0?` (${historique.length})`:""}`},
  ];

  return(
    <div>
      <STitle sub="59 fonctionnalités · De la recherche SIRENE à l'IA Company">⊕ Prospection Automatique</STitle>

      {/* BOTS HEADER */}
      <Card style={{marginBottom:14,borderColor:C.purple+"44",background:`linear-gradient(135deg,${C.card},#12002A)`}}>
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          {[{n:"Thomas",role:"WhatsApp · LinkedIn",missions:142,c:C.gold},{n:"Abou",role:"Appels vocaux · Email",missions:189,c:C.purple},{n:"Bot Multi",role:"Tous canaux simultanés",missions:34,c:C.teal},{n:"Agent 24h",role:"Autonome · 24h/24",missions:8,c:C.green}].map((b,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:140,background:`${b.c}11`,border:`1px solid ${b.c}33`,borderRadius:8,padding:"8px 12px"}}>
              <span style={{fontSize:18}}>🤖</span>
              <div><div style={{fontWeight:700,color:b.c,fontSize:11}}>{b.n}</div><div style={{fontSize:9,color:C.muted}}>{b.role}</div><div style={{fontSize:9,color:C.green,marginTop:1}}>● {b.missions} ce mois</div></div>
            </div>
          ))}
        </div>
      </Card>

      {/* TABS */}
      <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?`${C.gold}22`:"transparent",border:`1px solid ${tab===t.id?C.gold:C.border}`,color:tab===t.id?C.gold:C.muted,borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:tab===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>
        ))}
      </div>

      {/* ════════════ 01 — SIRENE ════════════ */}
      {tab==="sirene"&&(
        <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card>
              <CT>Secteur</CT>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:8}}>
                {SIRENE_SECTORS.map(s=>(
                  <button key={s.id} onClick={()=>{setSirSector(s.id);setSirNaf(s.naf);}} style={{padding:"6px 4px",border:`1px solid ${sirSector===s.id?C.gold:C.border}`,borderRadius:6,background:sirSector===s.id?`${C.gold}22`:C.card2,color:sirSector===s.id?C.gold:C.muted,cursor:"pointer",fontSize:9,fontFamily:"inherit",textAlign:"center",lineHeight:1.3}}>
                    <div style={{fontSize:13}}>{s.icon}</div>{s.label}
                  </button>
                ))}
              </div>
              <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Code NAF</div>
              <Inp placeholder="Ex: 6832A" value={sirNaf} onChange={e=>setSirNaf(e.target.value)} style={{width:"100%"}}/>
            </Card>
            <Card>
              <CT>Départements</CT>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3,marginBottom:6}}>
                {DEPTS.map(d=>(
                  <button key={d.c} onClick={()=>toggleDept(d.c)} style={{padding:"4px 2px",border:`1px solid ${sirDepts.includes(d.c)?C.blue:C.border}`,borderRadius:4,background:sirDepts.includes(d.c)?`${C.blue}22`:C.card2,color:sirDepts.includes(d.c)?C.blue:C.muted,cursor:"pointer",fontSize:8,fontFamily:"inherit",textAlign:"center",lineHeight:1.3}}>
                    <b>{d.c}</b><br/><span style={{fontSize:7}}>{d.n}</span>
                  </button>
                ))}
              </div>
              <Inp placeholder="Ou ville / CP" value={sirZone} onChange={e=>setSirZone(e.target.value)} style={{width:"100%"}}/>
            </Card>
            <Card>
              <CT>Paramètres</CT>
              <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Résultats</div>
              <Sel value={sirMax} onChange={e=>setSirMax(e.target.value)} options={["25","50","100","200","500"].map(o=>({v:o,l:`${o} entreprises`}))} style={{width:"100%",marginBottom:7}}/>
              <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Enrichissement IA</div>
              <Sel value={sirEnrich} onChange={e=>setSirEnrich(e.target.value)} options={[{v:"full",l:"Complet + Scoring"},{v:"contact",l:"Contact seulement"},{v:"none",l:"SIRENE uniquement"}]} style={{width:"100%",marginBottom:7}}/>
              <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Clé API Claude</div>
              <input type="password" placeholder="sk-ant-api03-..." value={sirApiKey} onChange={e=>{setSirApiKey(e.target.value);localStorage.setItem("ty_anthropic",e.target.value);}} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:10,fontFamily:"monospace",outline:"none",width:"100%"}}/>
            </Card>
            <Btn v="purple" full onClick={runSirene} disabled={sirRunning}>{sirRunning?"⏳ En cours...":"🔍 Lancer la recherche"}</Btn>
            {sirRunning&&<Btn v="red" full onClick={()=>setSirAbort({flag:true})}>⏹ Stopper</Btn>}
            {sirResults.length>0&&(
              <>
                <Btn v="green" full onClick={exportCSV}>↓ Export CSV ({sirResults.length})</Btn>
                <Btn v="gold" full onClick={()=>{setTab("workflow");selectAll();}}>⚡ Workflow en masse ({selected.length||sirResults.length})</Btn>
              </>
            )}
          </div>
          <div>
            {(sirRunning||sirStatus)&&(
              <Card style={{marginBottom:10,borderColor:sirRunning?C.purple+"44":C.green+"44"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:sirRunning?6:0}}>
                  <span style={{fontSize:12,color:sirRunning?C.purple:C.green}}>{sirStatus}</span>
                  <span style={{fontSize:11,color:C.muted}}>{sirProgress}%</span>
                </div>
                {sirRunning&&<div style={{height:4,background:C.border,borderRadius:2}}><div style={{height:"100%",width:`${sirProgress}%`,background:C.purple,borderRadius:2,transition:"width 0.4s"}}/></div>}
              </Card>
            )}
            {sirResults.length>0&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7,marginBottom:10}}>
                {[{l:"Total",v:sirResults.length,c:C.text},{l:"Complets",v:sirResults.filter(r=>r.status==="ok").length,c:C.green},{l:"Partiels",v:sirResults.filter(r=>r.status==="partial").length,c:C.orange},{l:"Sélectionnés",v:selected.length,c:C.gold},{l:"Score moy.",v:sirResults.filter(r=>r.score).length?Math.round(sirResults.filter(r=>r.score).reduce((a,b)=>a+(b.score||0),0)/sirResults.filter(r=>r.score).length):"-",c:C.purple}].map((s,i)=>(
                  <Card key={i} style={{textAlign:"center",padding:8}}><div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:C.muted}}>{s.l}</div></Card>
                ))}
              </div>
            )}
            {sirResults.length>0&&(
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <Inp placeholder="Filtrer..." value={sirFilter} onChange={e=>setSirFilter(e.target.value)} style={{width:200}}/>
                <Btn sm v="ghost" onClick={selectAll}>Tout sélectionner</Btn>
                <Btn sm v="ghost" onClick={()=>setSelected([])}>Désélectionner</Btn>
                {selected.length>0&&<Btn sm v="purple" onClick={()=>setTab("workflow")}>⚡ Workflow ({selected.length})</Btn>}
              </div>
            )}
            <Card style={{padding:0,overflow:"hidden"}}>
              {sirResults.length===0?(
                <div style={{textAlign:"center",padding:"36px 20px",color:C.muted}}>
                  <div style={{fontSize:28,marginBottom:6}}>🔍</div>
                  <div style={{fontSize:12}}>Configurez et lancez la recherche</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:3}}>API SIRENE officielle — données publiques entreprises françaises</div>
                </div>
              ):(
                <div style={{overflowX:"auto",maxHeight:460,overflowY:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:700}}>
                    <thead>
                      <tr style={{background:C.card2}}>
                        {["☑","#","Société","Ville","Téléphone","Email","Score","Statut","Action"].map(h=>(
                          <th key={h} style={{padding:"7px 8px",textAlign:"left",fontSize:9,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:500,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sirFiltered.map((r,i)=>{
                        const sc={ok:C.green,partial:C.orange,error:C.red,searching:C.blue,pending:C.muted};
                        const sl={ok:"✓",partial:"~",error:"✗",searching:"...",pending:"⏳"};
                        const scoreColor=r.score>=80?C.green:r.score>=60?C.gold:C.orange;
                        return(
                          <tr key={i} style={{borderBottom:`1px solid ${C.border}22`,background:selected.includes(i)?`${C.gold}08`:"transparent"}}>
                            <td style={{padding:"6px 8px"}}><input type="checkbox" checked={selected.includes(i)} onChange={()=>toggleSelect(i)} style={{cursor:"pointer"}}/></td>
                            <td style={{padding:"6px 8px",color:C.muted,fontSize:9}}>{i+1}</td>
                            <td style={{padding:"6px 8px",fontWeight:600,maxWidth:140}}>{r.name}<br/><span style={{fontSize:9,color:C.muted}}>{r.siret}</span></td>
                            <td style={{padding:"6px 8px",color:C.muted,fontSize:10}}>{r.ville}</td>
                            <td style={{padding:"6px 8px",fontSize:10}}>{r.phone||<span style={{color:C.border}}>{r.status==="searching"?"...":"—"}</span>}</td>
                            <td style={{padding:"6px 8px",fontSize:10}}>{r.email||<span style={{color:C.border}}>—</span>}</td>
                            <td style={{padding:"6px 8px",textAlign:"center"}}>{r.score?<span style={{fontWeight:700,color:scoreColor,fontSize:11}}>{r.score}</span>:<span style={{color:C.border}}>—</span>}</td>
                            <td style={{padding:"6px 8px"}}><Pill label={sl[r.status]||"?"} color={sc[r.status]||C.muted}/></td>
                            <td style={{padding:"6px 8px"}}><Btn sm v="purple" onClick={()=>runWorkflow(r)}>⚡ WF</Btn></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ════════════ 02 — GÉNÉRATEUR IA ════════════ */}
      {tab==="generateur"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:C.purple+"44"}}>
            <CT>Paramètres</CT>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Bot</div><Sel value={form.bot} onChange={set("bot")} options={["Thomas","Abou"].map(o=>({v:o,l:`🤖 ${o}`}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Canal</div><Sel value={form.canal} onChange={set("canal")} options={["WhatsApp","Email","LinkedIn","SMS"].map(o=>({v:o,l:o}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Prospect *</div><Inp placeholder="Hôtel Beaurivage, M. Dupont..." value={form.nomProspect} onChange={set("nomProspect")} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Secteur</div><Sel value={form.secteur} onChange={set("secteur")} options={METIERS.map(m=>({v:m,l:m}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Ville</div><Inp placeholder="Paris..." value={form.ville} onChange={set("ville")} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Service</div><Sel value={form.service} onChange={set("service")} options={["Nettoyage Airbnb","Nettoyage résidentiel","Nettoyage bureaux","Nettoyage jet privé","Nettoyage yacht","Rapatriement corps","Pack complet"].map(o=>({v:o,l:o}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Langue</div><Sel value={form.langue} onChange={set("langue")} options={["Français","English","Arabe","Espagnol","Portugais"].map(o=>({v:o,l:o}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Ton</div><Sel value={form.ton} onChange={set("ton")} options={["Professionnel & chaleureux","Direct & percutant","Luxe & raffiné","Décontracté & humain","Formel"].map(o=>({v:o,l:o}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Contexte</div><textarea value={form.contexte} onChange={set("contexte")} placeholder="Infos supplémentaires..." style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:11,fontFamily:"inherit",outline:"none",width:"100%",resize:"vertical",minHeight:50}}/></div>
              <Btn v="purple" full onClick={()=>generer()} disabled={loading||!form.nomProspect.trim()}>{loading?"⏳ Génération...":"🤖 Générer le message IA"}</Btn>
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card style={{borderColor:C.purple+"33",flex:1}}>
              <CT>Aperçu — {form.canal}</CT>
              <div style={{background:cs.bg,borderRadius:8,overflow:"hidden",marginBottom:10}}>
                <div style={{background:cs.header,padding:"7px 10px",display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:C.purple+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.purple}}>{form.bot[0]}</div>
                  <span style={{fontSize:11,fontWeight:700,color:form.canal==="WhatsApp"?"#fff":C.text}}>{form.bot} · Tymeless</span>
                </div>
                <div style={{padding:10,minHeight:100}}>
                  {loading&&<div style={{color:C.muted,fontSize:11}}>⏳ Génération en cours...</div>}
                  {!loading&&!result&&<div style={{color:C.muted,fontSize:11,textAlign:"center",paddingTop:20}}>Remplis le formulaire ✨</div>}
                  {!loading&&result&&<div style={{background:cs.bubble,borderRadius:"10px 10px 10px 2px",padding:"8px 11px",maxWidth:"88%",fontSize:11,color:cs.txt,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{result}</div>}
                </div>
              </div>
              {result&&!loading&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}><Btn v="gold" onClick={copier}>{copied?"✓ Copié !":"📋 Copier"}</Btn><Btn v="green">📲 WA</Btn><Btn v="ghost" onClick={()=>generer()}>🔄 Regénérer</Btn></div>}
            </Card>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
              {[{l:"Générés",v:historique.length,c:C.purple},{l:"Envoyés",v:Math.floor(historique.length*0.7),c:C.gold},{l:"Réponses",v:Math.floor(historique.length*0.28),c:C.green}].map((s,i)=>(
                <Card key={i} style={{textAlign:"center",padding:10}}><div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:C.muted}}>{s.l}</div></Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ 03 — BOT VOCAL ════════════ */}
      {tab==="vocal"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:C.teal+"44",background:`linear-gradient(135deg,${C.card},#001A18)`}}>
            <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:28}}>📞</span>
              <div style={{flex:1}}><div style={{fontWeight:700,color:C.teal,fontSize:13,marginBottom:3}}>Bot Vocal IA — Voix humaine · Bland.ai</div><div style={{fontSize:11,color:C.text,lineHeight:1.6}}>Appels téléphoniques avec <b style={{color:C.gold}}>voix humaine naturelle</b>. Script personnalisé, transcription automatique, résumé IA après chaque appel.</div></div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}><Pill label="🇫🇷 Voix FR" color={C.green}/><Pill label="~0.09$/min" color={C.gold}/></div>
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <Card style={{borderColor:C.teal+"44"}}>
              <CT>Lancer un appel</CT>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Bot vocal</div><Sel value={callForm.bot} onChange={setC("bot")} options={["Thomas","Abou"].map(o=>({v:o,l:`📞 ${o}`}))} style={{width:"100%"}}/></div>
                  <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Langue</div><Sel value={callForm.langue} onChange={setC("langue")} options={[{v:"fr-FR",l:"🇫🇷 Français"},{v:"en-US",l:"🇺🇸 English"},{v:"ar-SA",l:"🇦🇪 Arabic"}]} style={{width:"100%"}}/></div>
                </div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Société / Nom *</div><Inp placeholder="Hôtel Beaurivage..." value={callForm.nom} onChange={setC("nom")} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Téléphone *</div><Inp placeholder="+33 1 42 00 00 00" value={callForm.phone} onChange={setC("phone")} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Service</div><Sel value={callForm.service} onChange={setC("service")} options={["Nettoyage Airbnb","Nettoyage bureaux","Nettoyage jet privé","Nettoyage yacht","Rapatriement","Pack complet"].map(o=>({v:o,l:o}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Script</div><Sel value={callForm.script} onChange={setC("script")} options={[{v:"standard",l:"Standard"},{v:"vip",l:"VIP Premium"},{v:"court",l:"Court & Direct"}]} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Clé Bland.ai</div><input type="password" placeholder="bland_api_key_..." value={blandKey} onChange={e=>{setBlandKey(e.target.value);localStorage.setItem("ty_bland",e.target.value);}} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:10,fontFamily:"monospace",outline:"none",width:"100%"}}/></div>
                <Btn v="teal" full onClick={lancerAppel} disabled={callLoading||!callForm.phone||!callForm.nom}>{callLoading?"📞 En cours...":"📞 Lancer l'appel IA"}</Btn>
              </div>
            </Card>
            <Card>
              <CT>Statistiques appels</CT>
              {[{l:"Appels lancés",v:callLog.length+31,c:C.teal},{l:"Contacts joints",v:22,c:C.green},{l:"Intéressés",v:8,c:C.gold},{l:"RDV obtenus",v:3,c:C.purple},{l:"Taux réponse",v:"38%",c:C.blue}].map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{s.l}</span><span style={{fontWeight:700,color:s.c}}>{s.v}</span></div>
              ))}
              <div style={{marginTop:12,background:`${C.teal}11`,border:`1px solid ${C.teal}33`,borderRadius:7,padding:10,fontSize:11,color:C.teal}}>
                🎙️ <b>Clone vocal de Curtiss</b> disponible via ElevenLabs — configurez dans Paramètres
              </div>
            </Card>
          </div>
          <Card>
            <CT>Historique des appels</CT>
            <TH heads={["ID","Société","Téléphone","Service","Durée","Résultat","Statut","Date"]} rows={callLog.map((c,i)=>{
              const sc={terminé:C.green,messagerie:C.orange,rappel:C.purple,"en cours":C.teal};
              return(
                <tr key={i}>
                  <Td><span style={{fontFamily:"monospace",fontSize:10,color:C.gold}}>{c.id}</span></Td>
                  <Td><span style={{fontWeight:600}}>{c.nom}</span></Td>
                  <Td><span style={{fontSize:10,color:C.muted}}>{c.phone}</span></Td>
                  <Td><Pill label={c.service} color={C.blue}/></Td>
                  <Td><span style={{color:C.muted,fontSize:11}}>{c.duree}</span></Td>
                  <Td><span style={{fontSize:11}}>{c.resultat}</span></Td>
                  <Td><Pill label={c.statut} color={sc[c.statut]||C.muted}/></Td>
                  <Td><span style={{fontSize:10,color:C.muted}}>{c.date}</span></Td>
                </tr>
              );
            })}/>
          </Card>
        </div>
      )}

      {/* ════════════ 04 — WORKFLOW & MASSE ════════════ */}
      {tab==="workflow"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {/* WORKFLOW END-TO-END */}
          <Card style={{borderColor:C.gold+"44"}}>
            <CT>⚡ Workflow end-to-end</CT>
            {wfProspect&&(
              <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:10,marginBottom:12}}>
                <div style={{fontWeight:600,fontSize:13}}>{wfProspect.name}</div>
                <div style={{fontSize:11,color:C.muted}}>{wfProspect.ville} · {wfProspect.naf}</div>
              </div>
            )}
            {!wfProspect&&(
              <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:12}}>
                Sélectionne un prospect dans SIRENE et clique ⚡ WF pour démarrer le workflow automatique
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
              {[{n:1,l:"Sélection prospect",icon:"🎯"},{n:2,l:"Scoring IA (0-100)",icon:"⭐"},{n:3,l:"Génération message WA",icon:"✍️"},{n:4,l:"Appel vocal programmé",icon:"📞"},{n:5,l:"Push vers CRM",icon:"🎯"},{n:6,l:"Séquence démarrée",icon:"🔁"}].map((step,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:7,background:wfStep>step.n?`${C.green}11`:wfStep===step.n?`${C.gold}22`:C.card2,border:`1px solid ${wfStep>step.n?C.green:wfStep===step.n?C.gold:C.border}`}}>
                  <span style={{fontSize:16}}>{step.icon}</span>
                  <span style={{fontSize:12,flex:1,color:wfStep>step.n?C.green:wfStep===step.n?C.gold:C.muted}}>{step.l}</span>
                  {wfStep>step.n&&<span style={{color:C.green,fontSize:14}}>✓</span>}
                  {wfStep===step.n&&<span style={{color:C.gold,fontSize:11}}>▶ En cours</span>}
                </div>
              ))}
            </div>
            {wfLog.length>0&&(
              <div style={{background:C.card2,borderRadius:8,padding:10,maxHeight:150,overflowY:"auto"}}>
                {wfLog.map((l,i)=><div key={i} style={{fontSize:11,color:C.text,padding:"2px 0",borderBottom:`1px solid ${C.border}22`}}>{l.time} — {l.t}</div>)}
              </div>
            )}
          </Card>

          {/* GÉNÉRATION EN MASSE */}
          <Card style={{borderColor:C.purple+"44"}}>
            <CT>⚡ Génération en masse</CT>
            <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:C.purple}}>
              {selected.length>0?`${selected.length} prospects sélectionnés dans SIRENE`:"Sélectionne des prospects dans l'onglet SIRENE ou utilise les 5 premiers"}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <Sel value={form.canal} onChange={set("canal")} options={["WhatsApp","Email","LinkedIn","SMS"].map(o=>({v:o,l:o}))} style={{flex:1}}/>
              <Sel value={form.service} onChange={set("service")} options={["Nettoyage Airbnb","Nettoyage bureaux","Jet privé","Yacht","Rapatriement","Pack complet"].map(o=>({v:o,l:o}))} style={{flex:1}}/>
            </div>
            <Btn v="purple" full onClick={genererMasse} disabled={masseRunning}>{masseRunning?`⏳ ${masseProgress}%`:"⚡ Générer tous les messages"}</Btn>
            {masseRunning&&<div style={{marginTop:8,height:4,background:C.border,borderRadius:2}}><div style={{height:"100%",width:`${masseProgress}%`,background:C.purple,borderRadius:2,transition:"width 0.3s"}}/></div>}
            {masseResults.length>0&&(
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6,maxHeight:280,overflowY:"auto"}}>
                {masseResults.map((r,i)=>(
                  <div key={i} style={{background:C.card2,borderRadius:7,padding:10,border:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontWeight:600,fontSize:12}}>{r.prospect}</span>
                      <div style={{display:"flex",gap:5}}><Btn sm v="gold" onClick={()=>navigator.clipboard.writeText(r.msg)}>📋</Btn><Btn sm v="green">📲</Btn></div>
                    </div>
                    <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{r.msg}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ════════════ 05 — SÉQUENCES ════════════ */}
      {tab==="sequences"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            <CT>Configuration des séquences</CT>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[["J+0 — Premier contact","j0"],["J+3 — Relance","j3"],["J+7 — Suivi","j7"],["J+14 — Dernière tentative","j14"]].map(([label,key])=>(
                <div key={key}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</div>
                  <Sel value={seqConfig[key]} onChange={e=>setSeqConfig(p=>({...p,[key]:e.target.value}))} options={["WhatsApp","Email","Appel vocal","LinkedIn","SMS","Pas d&apos;action"].map(o=>({v:o,l:o}))} style={{width:"100%"}}/>
                </div>
              ))}
              <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:10,fontSize:11,color:C.gold}}>
                ⏰ Si pas de réponse après J+14 → prospect archivé automatiquement
              </div>
              <Btn v="gold" full>🔁 Sauvegarder la séquence</Btn>
            </div>
          </Card>
          <Card>
            <CT>Séquences actives</CT>
            {seqActive.map((s,i)=>(
              <div key={i} style={{background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontWeight:600,fontSize:12}}>{s.prospect}</span>
                  <Pill label={s.statut} color={s.statut==="RDV décroché"?C.green:s.statut==="ouvert"?C.blue:C.gold}/>
                </div>
                <div style={{fontSize:11,color:C.muted}}>Étape actuelle : <b style={{color:C.text}}>{s.etape}</b></div>
                <div style={{fontSize:11,color:C.muted,marginTop:3}}>Suivant : {s.suivant}</div>
              </div>
            ))}
            <Card style={{marginTop:8,borderColor:C.teal+"44",background:`${C.teal}08`}}>
              <div style={{fontSize:11,color:C.teal,fontWeight:600,marginBottom:4}}>📅 Calendrier intelligent</div>
              <div style={{fontSize:11,color:C.muted}}>Quand un prospect dit <i>"rappelez-moi vendredi"</i> → le bot crée automatiquement le RDV dans le planning Tymeless OS.</div>
            </Card>
          </Card>
        </div>
      )}

      {/* ════════════ 06 — FICHE PROSPECT ════════════ */}
      {tab==="fiche"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:C.gold+"44"}}>
            <CT>🗂️ Générer une fiche prospect enrichie</CT>
            <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
              <div style={{flex:1}}><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nom / Société / URL</div><Inp placeholder="Hôtel Le Meurice Paris, Marina Monaco, AirParis SARL..." value={ficheSearch} onChange={e=>setFicheSearch(e.target.value)} style={{width:"100%"}}/></div>
              <Btn v="gold" onClick={genererFiche} disabled={ficheLoading}>{ficheLoading?"⏳ Recherche...":"🔍 Générer la fiche"}</Btn>
            </div>
          </Card>
          {ficheLoading&&<Card><div style={{textAlign:"center",padding:30,color:C.muted}}>🤖 Claude recherche sur le web... photo LinkedIn, actus, CA estimé, avis clients...</div></Card>}
          {ficheProspect&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Card style={{borderColor:C.gold+"44"}}>
                <CT>Informations prospect</CT>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{width:48,height:48,borderRadius:"50%",background:`${C.gold}22`,border:`2px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:C.gold}}>{ficheProspect.nom?.[0]||"?"}</div>
                  <div><div style={{fontWeight:700,fontSize:15,color:C.text}}>{ficheProspect.nom}</div><div style={{fontSize:12,color:C.muted}}>{ficheProspect.secteur} · {ficheProspect.ville}</div></div>
                  <div style={{marginLeft:"auto"}}><div style={{fontSize:22,fontWeight:700,color:ficheProspect.potentiel_tymeless>=80?C.green:C.gold}}>{ficheProspect.potentiel_tymeless}/100</div><div style={{fontSize:9,color:C.muted,textAlign:"center"}}>Potentiel</div></div>
                </div>
                {[["CA estimé",ficheProspect.ca_estime],["Employés",ficheProspect.employes],["Dirigeant",ficheProspect.dirigeant],["Téléphone",ficheProspect.tel],["Email",ficheProspect.email],["Site web",ficheProspect.site],["LinkedIn",ficheProspect.linkedin]].map(([l,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{l}</span><span style={{color:C.text,fontWeight:500}}>{v||"—"}</span></div>
                ))}
              </Card>
              <Card>
                <CT>Insights & Accroche</CT>
                <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:8,padding:12,marginBottom:10}}>
                  <div style={{fontSize:10,color:C.blue,fontWeight:600,marginBottom:4}}>📰 Dernière actualité</div>
                  <div style={{fontSize:12,color:C.text}}>{ficheProspect.derniere_actu||"Aucune actualité récente trouvée"}</div>
                </div>
                <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:12,marginBottom:10}}>
                  <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:4}}>⭐ Avis Google</div>
                  <div style={{fontSize:12,color:C.text}}>{ficheProspect.avis_google||"—"}</div>
                </div>
                <div style={{marginBottom:10}}><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Services recommandés</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{(ficheProspect.services_recommandes||[]).map((s,i)=><Pill key={i} label={s} color={C.gold}/>)}</div></div>
                <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:12}}>
                  <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:4}}>🤖 Accroche IA générée</div>
                  <div style={{fontSize:12,color:C.text,lineHeight:1.6,fontStyle:"italic"}}>"{ficheProspect.accroche}"</div>
                </div>
                <div style={{display:"flex",gap:7,marginTop:12}}>
                  <Btn v="gold" full onClick={()=>{setForm(p=>({...p,nomProspect:ficheProspect.nom,ville:ficheProspect.ville}));setTab("generateur");}}>✍️ Générer message</Btn>
                  <Btn v="purple" full onClick={()=>{setCallForm(p=>({...p,nom:ficheProspect.nom,phone:ficheProspect.tel||""}));setTab("vocal");}}>📞 Appel vocal</Btn>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ════════════ 07 — OBJECTIONS ════════════ */}
      {tab==="objection"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:C.orange+"44"}}>
            <CT>🥊 Objection Handler IA</CT>
            <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:C.orange}}>
              Le prospect vient de sortir une objection ? Claude génère la réponse parfaite en 2 secondes.
            </div>
            <div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>L'objection du prospect</div>
            <textarea value={objection} onChange={e=>setObjection(e.target.value)} placeholder="Ex: 'C'est trop cher', 'J'ai déjà quelqu'un', 'Je n'ai pas le temps', 'Envoyez-moi un email'..." style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 11px",color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",width:"100%",resize:"vertical",minHeight:80,marginBottom:10}}/>
            <Btn v="orange" full onClick={handleObjection} disabled={objLoading||!objection.trim()}>{objLoading?"⏳ Génération...":"🥊 Générer la réponse parfaite"}</Btn>
            {objResponse&&(
              <div style={{marginTop:12,background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:12}}>
                <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:6}}>✅ Réponse IA — prête à utiliser</div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{objResponse}</div>
                <div style={{display:"flex",gap:7,marginTop:10}}><Btn sm v="gold" onClick={()=>navigator.clipboard.writeText(objResponse)}>📋 Copier</Btn><Btn sm v="green">📲 Envoyer WA</Btn></div>
              </div>
            )}
          </Card>
          <Card>
            <CT>Objections fréquentes — réponses prêtes</CT>
            {[{obj:"C'est trop cher",rep:"Je comprends. Nos tarifs incluent produits + assurance + garantie. Mais dites-moi, combien vous coûte votre prestataire actuel au total ?"},
              {obj:"J'ai déjà quelqu'un",rep:"Parfait ! On ne remplace pas, on complète. Beaucoup de nos clients gardaient leur prestataire... jusqu'à la première intervention Tymeless. Un essai gratuit vous tente ?"},
              {obj:"Pas intéressé",rep:"Tout à fait, je ne veux pas vous imposer quoi que ce soit. Juste une question : si je pouvais vous faire économiser 20% sur votre nettoyage actuel, ça vaudrait 5 minutes ?"},
              {obj:"Envoyez-moi un email",rep:"Bien sûr ! Je vous envoie ça dans la minute. Pour personnaliser l'offre, juste une question : vous avez combien de m² à entretenir ?"}
            ].map((item,i)=>(
              <div key={i} style={{background:C.card2,borderRadius:7,padding:10,marginBottom:8,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,fontWeight:600,color:C.orange,marginBottom:4}}>❝ {item.obj}</div>
                <div style={{fontSize:11,color:C.text,lineHeight:1.5}}>{item.rep}</div>
                <div style={{marginTop:6}}><Btn sm v="ghost" onClick={()=>navigator.clipboard.writeText(item.rep)}>📋 Copier</Btn></div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ════════════ 08 — BI & ANALYTICS ════════════ */}
      {tab==="bi"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
            {[{l:"CA généré prospection",v:"16 600 €",c:C.gold},{l:"Coût total prospection",v:"124 €",c:C.red},{l:"ROI global",v:"x134",c:C.green},{l:"Meilleur canal",v:"📞 Vocal",c:C.teal}].map((k,i)=><KPI key={i} label={k.l} val={k.v} color={k.c}/>)}
          </div>

          {/* FUNNEL */}
          <Card style={{marginBottom:14}}>
            <CT>Funnel de conversion visuel</CT>
            <div style={{display:"flex",gap:6,alignItems:"flex-end",height:100}}>
              {funnelData.map((f,i)=>{
                const pct=(f.val/funnelData[0].val)*100;
                return(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{fontSize:10,fontWeight:600,color:f.color}}>{f.val}</div>
                    <div style={{width:"100%",height:pct,background:`${f.color}33`,border:`1px solid ${f.color}`,borderRadius:"3px 3px 0 0",transition:"height 0.5s"}}/>
                    <div style={{fontSize:9,color:C.muted,textAlign:"center",lineHeight:1.2}}>{f.label}</div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:10,fontSize:11,color:C.muted,textAlign:"center"}}>Taux de conversion global : <b style={{color:C.green}}>2.8%</b> — Industrie : 1.2%</div>
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            {/* ROI PAR CANAL */}
            <Card>
              <CT>ROI par canal en temps réel</CT>
              <TH heads={["Canal","Envois","Réponses","Deals","CA généré","ROI"]} rows={roi.map((r,i)=>(
                <tr key={i}>
                  <Td><span style={{fontWeight:600}}>{r.canal}</span></Td>
                  <Td>{r.envois}</Td>
                  <Td><span style={{color:C.green}}>{r.reponses}</span></Td>
                  <Td><span style={{color:C.gold,fontWeight:700}}>{r.deals}</span></Td>
                  <Td><span style={{fontWeight:700,color:C.green}}>{r.ca_genere.toLocaleString("fr")} €</span></Td>
                  <Td><span style={{color:C.teal,fontWeight:700}}>{r.roi}</span></Td>
                </tr>
              ))}/>
            </Card>

            {/* MEILLEUR MOMENT */}
            <Card>
              <CT>⏰ Meilleur moment pour contacter</CT>
              {meilleurs_moments.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{m.secteur}</div><div style={{fontSize:10,color:C.muted}}>{m.jour} · {m.heure}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontWeight:700,color:C.green,fontSize:13}}>{m.taux}</div><div style={{fontSize:9,color:C.muted}}>taux réponse</div></div>
                </div>
              ))}
            </Card>
          </div>

          {/* RAPPORT HEBDO */}
          <Card style={{borderColor:C.gold+"44",background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
            <CT>📬 Rapport hebdomadaire automatique</CT>
            <div style={{background:"#075E54",borderRadius:10,padding:14}}>
              <div style={{fontSize:9,color:"#25D366",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>💬 WhatsApp — Chaque lundi matin</div>
              <div style={{background:"#128C7E",borderRadius:"12px 12px 12px 2px",padding:"10px 14px",fontSize:12,color:"#fff",lineHeight:1.8}}>
                📊 <b>Rapport Tymeless — Semaine 19</b><br/>
                ✅ Prospects contactés : 89<br/>
                💬 Réponses reçues : 23 (25.8%)<br/>
                📋 Devis envoyés : 8<br/>
                🤝 Deals signés : 2<br/>
                💰 CA généré : <b>4 800 €</b><br/>
                🔥 Meilleur canal : Bot Vocal (38%)<br/>
                📈 ROI semaine : x134
              </div>
            </div>
            <div style={{marginTop:10,display:"flex",gap:8,alignItems:"center"}}>
              <Pill label="✓ Actif — Chaque lundi 8h00" color={C.green}/>
              <Btn sm v="gold">Configurer</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════ 09 — DATA & SCRAPING ════════════ */}
      {tab==="scraping"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <Card style={{borderColor:C.blue+"44"}}>
              <CT>🌐 Scraping multi-source</CT>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                {scrapSources.map(s=>(
                  <button key={s.id} onClick={()=>setScrapSource(s.id)} style={{padding:"8px",border:`1px solid ${scrapSource===s.id?C.blue:C.border}`,borderRadius:7,background:scrapSource===s.id?`${C.blue}22`:C.card2,color:scrapSource===s.id?C.blue:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit",textAlign:"center"}}>
                    <div style={{fontSize:16}}>{s.icon}</div>{s.label}
                  </button>
                ))}
              </div>
              <Inp placeholder="Ex: hôtels luxe Paris, marinas côte d'azur..." value={scrapQuery} onChange={e=>setScrapQuery(e.target.value)} style={{width:"100%",marginBottom:8}}/>
              <Btn v="blue" full onClick={()=>setScrapRunning(!scrapRunning)}>{scrapRunning?"⏳ Scraping...":"🔍 Lancer le scraping"}</Btn>
            </Card>
            <Card style={{borderColor:C.teal+"44"}}>
              <CT>🛰️ Satellite & Sources exotiques</CT>
              {[{icon:"🛰️",label:"Satellite data",desc:"Yachts en marina, jets au sol, nouvelles constructions détectées"},
                {icon:"🗺️",label:"Google Maps",desc:"Restaurants, hôtels, salons, marinas avec avis + contact"},
                {icon:"📲",label:"WhatsApp Business API",desc:"Envoyer depuis le numéro Tymeless officiel sans téléphone"},
                {icon:"🔗",label:"LinkedIn Sales Nav",desc:"Décideurs + changements de poste + signaux d'achat"}
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <span style={{fontSize:18}}>{s.icon}</span>
                  <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{s.label}</div><div style={{fontSize:10,color:C.muted}}>{s.desc}</div></div>
                  <Btn sm v="ghost">Config</Btn>
                </div>
              ))}
            </Card>
          </div>

          {/* RÉSULTATS SCRAPING */}
          <Card style={{marginBottom:14}}>
            <CT>Résultats scraping <Btn sm v="green" onClick={exportCSV}>↓ CSV</Btn></CT>
            <TH heads={["Source","Nom","Ville","Téléphone","Note","Type","Chaleur","Action"]} rows={scrapResults.map((r,i)=>(
              <tr key={i}>
                <Td><Pill label={r.source} color={C.blue}/></Td>
                <Td><span style={{fontWeight:600}}>{r.name}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{r.ville}</span></Td>
                <Td><span style={{fontSize:11}}>{r.tel}</span></Td>
                <Td><span style={{color:C.gold}}>{r.note}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{r.type}</span></Td>
                <Td><Pill label={r.statut} color={r.statut==="très chaud"?C.red:C.orange}/></Td>
                <Td><Btn sm v="gold">⚡ WF</Btn></Td>
              </tr>
            ))}/>
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {/* VEILLE CONCURRENTIELLE */}
            <Card style={{borderColor:C.red+"33"}}>
              <CT>🕵️ Veille concurrentielle 24h/24</CT>
              {veille.map((v,i)=>(
                <div key={i} style={{background:v.priorite==="haute"?`${C.red}08`:C.card2,borderRadius:7,padding:10,marginBottom:8,border:`1px solid ${v.priorite==="haute"?C.red+"44":C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:11}}>{v.concurrent}</span>
                    <Pill label={v.event} color={v.priorite==="haute"?C.red:C.orange}/>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:5}}>{v.detail}</div>
                  <div style={{fontSize:10,color:C.muted}}>{v.date}</div>
                </div>
              ))}
            </Card>

            {/* ÉVÉNEMENTS DÉCLENCHEURS */}
            <Card style={{borderColor:C.gold+"44"}}>
              <CT>🔔 Événements déclencheurs</CT>
              {evenements.map((e,i)=>(
                <div key={i} style={{background:e.priorite==="haute"?`${C.gold}08`:C.card2,borderRadius:7,padding:10,marginBottom:8,border:`1px solid ${e.priorite==="haute"?C.gold+"44":C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:11}}>{e.nom}</span>
                    <Pill label={e.type} color={C.gold}/>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{e.detail}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,color:C.muted}}>{e.date}</span>
                    <Btn sm v="gold">→ {e.action}</Btn>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ════════════ 10 — MULTI-CANAL ════════════ */}
      {tab==="multicanal"&&(
        <div>
          {/* AGENT MULTI-CANAL */}
          <Card style={{marginBottom:14,borderColor:C.purple+"44",background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🏭 Agent Prospecteur Multi-Canal Simultané</CT>
            <div style={{fontSize:12,color:C.text,marginBottom:12,lineHeight:1.7}}>Thomas sur WhatsApp <b style={{color:C.gold}}>PENDANT QU'</b>Abou fait les appels <b style={{color:C.gold}}>ET QU'</b>un 3ème bot envoie les emails — simultanément.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
              {[{key:"thomas_wa",label:"Thomas",role:"WhatsApp",color:C.gold},{key:"abou_appels",label:"Abou",role:"Appels vocaux",color:C.purple},{key:"bot_email",label:"Bot Email",role:"Email tracking",color:C.blue},{key:"bot_instagram",label:"Bot Insta",role:"Instagram DM",color:C.pink}].map(b=>(
                <div key={b.key} onClick={()=>setAgentMulti(p=>({...p,[b.key]:!p[b.key]}))} style={{background:agentMulti[b.key]?`${b.color}22`:C.card2,border:`2px solid ${agentMulti[b.key]?b.color:C.border}`,borderRadius:10,padding:12,textAlign:"center",cursor:"pointer"}}>
                  <div style={{fontSize:22,marginBottom:4}}>🤖</div>
                  <div style={{fontWeight:700,color:agentMulti[b.key]?b.color:C.muted,fontSize:12}}>{b.label}</div>
                  <div style={{fontSize:10,color:C.muted}}>{b.role}</div>
                  <div style={{marginTop:6}}><Pill label={agentMulti[b.key]?"● Actif":"○ Inactif"} color={agentMulti[b.key]?C.green:C.muted}/></div>
                </div>
              ))}
            </div>
            <Btn v={agentMulti.actif?"red":"purple"} full onClick={()=>setAgentMulti(p=>({...p,actif:!p.actif}))}>{agentMulti.actif?"⏹ Arrêter tous les agents":"🚀 Activer tous les agents simultanément"}</Btn>
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            {/* SIGNAUX LINKEDIN */}
            <Card style={{borderColor:C.blue+"44"}}>
              <CT>💼 Signaux LinkedIn temps réel</CT>
              {signaux.map((s,i)=>(
                <div key={i} style={{background:s.score>=90?`${C.red}08`:`${C.blue}08`,borderRadius:7,padding:10,marginBottom:8,border:`1px solid ${s.score>=90?C.red+"44":C.blue+"33"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:12}}>{s.nom}</span>
                    <span style={{fontWeight:700,color:s.score>=90?C.red:C.blue,fontSize:13}}>{s.score}/100</span>
                  </div>
                  <div style={{marginBottom:4}}><Pill label={s.event} color={s.score>=90?C.red:C.blue}/></div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{s.detail}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,color:C.muted}}>{s.date}</span>
                    <Btn sm v="blue">→ {s.action.slice(0,20)}...</Btn>
                  </div>
                </div>
              ))}
            </Card>

            {/* TRADUCTION */}
            <Card style={{borderColor:C.teal+"44"}}>
              <CT>🌐 Traduction + Adaptation culturelle</CT>
              <div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Message original (FR)</div>
              <textarea value={traduction.texte} onChange={e=>setTraduction(p=>({...p,texte:e.target.value}))} placeholder="Bonjour, je représente Tymeless..." style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 10px",color:C.text,fontSize:11,fontFamily:"inherit",outline:"none",width:"100%",resize:"vertical",minHeight:60,marginBottom:8}}/>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <Sel value={traduction.langue} onChange={e=>setTraduction(p=>({...p,langue:e.target.value}))} options={["English","Arabic","Español","Português","Deutsch","Italiano","中文"].map(o=>({v:o,l:o}))} style={{flex:1}}/>
                <Btn v="teal" onClick={traduire} disabled={tradLoading||!traduction.texte.trim()}>{tradLoading?"⏳":"🌐 Traduire"}</Btn>
              </div>
              {traduction.resultat&&(
                <div style={{background:`${C.teal}11`,border:`1px solid ${C.teal}33`,borderRadius:8,padding:10}}>
                  <div style={{fontSize:10,color:C.teal,fontWeight:600,marginBottom:4}}>✅ {traduction.langue} — adapté culturellement</div>
                  <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{traduction.resultat}</div>
                  <div style={{marginTop:8}}><Btn sm v="gold" onClick={()=>navigator.clipboard.writeText(traduction.resultat)}>📋 Copier</Btn></div>
                </div>
              )}
            </Card>
          </div>

          {/* BROADCAST + INSTAGRAM */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>📢 WhatsApp Broadcast Intelligent</CT>
              <div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Cible</div>
              <Sel value={broadcast.cible} onChange={e=>setBroadcast(p=>({...p,cible:e.target.value}))} options={["Airbnb","Hôtels","Aviation","Yacht","Bureaux","Tous"].map(o=>({v:o,l:o}))} style={{width:"100%",marginBottom:8}}/>
              <div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Message (personnalisé automatiquement par prospect)</div>
              <textarea value={broadcast.message} onChange={e=>setBroadcast(p=>({...p,message:e.target.value}))} placeholder="Bonjour {{nom}}, je représente Tymeless..." style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 10px",color:C.text,fontSize:11,fontFamily:"inherit",outline:"none",width:"100%",resize:"vertical",minHeight:60,marginBottom:8}}/>
              <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:7,padding:8,fontSize:10,color:C.green,marginBottom:8}}>Variables : {"{{nom}} {{ville}} {{secteur}} {{service}}"} — personnalisées automatiquement</div>
              <Btn v="green" full>📲 Envoyer le broadcast</Btn>
            </Card>
            <Card>
              <CT>📸 Instagram DM Automatique</CT>
              <div style={{background:`${C.pink}11`,border:`1px solid ${C.pink}44`,borderRadius:8,padding:12,marginBottom:10,fontSize:11,color:C.text,lineHeight:1.6}}>
                🤖 Le bot identifie les gérants d'Airbnb, hôtels et restaurants sur Instagram et leur envoie un DM personnalisé en se basant sur leur contenu récent.
              </div>
              {[{label:"Airbnb hosts",count:142,statut:"Actif"},{label:"Restaurateurs Paris",count:89,statut:"Actif"},{label:"Hôteliers côte azur",count:34,statut:"Pause"}].map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span>{c.label}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{color:C.muted}}>{c.count} cibles</span><Pill label={c.statut} color={c.statut==="Actif"?C.green:C.orange}/></div>
                </div>
              ))}
              <div style={{marginTop:10}}><Btn v="pink" full>📸 Configurer Instagram</Btn></div>
            </Card>
          </div>
        </div>
      )}

      {/* ════════════ 11 — AGENTS IA ════════════ */}
      {tab==="agents"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:C.purple+"44",background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:32}}>🤖</span>
              <div><div style={{fontWeight:700,color:C.purple,fontSize:14,marginBottom:4}}>Agents IA Autonomes — Vision Tymeless</div><div style={{fontSize:12,color:C.text,lineHeight:1.6}}>Des agents qui travaillent <b style={{color:C.gold}}>24h/24</b> sans intervention humaine. Ils prospectent, négocient, fidélisent et génèrent du CA pendant que tu dors.</div></div>
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[
              {key:"agent24h",icon:"🤖",title:"Agent 24h/24 Autonome",desc:"Trouve des prospects, les enrichit, les contacte, répond aux objections et prend des RDV — sans aucune intervention humaine.",stats:[{l:"Missions ce mois",v:"142"},{l:"RDV obtenus",v:"8"},{l:"Disponibilité",v:"99.9%"}],color:C.green},
              {key:"clone_vocal",icon:"🎙️",title:"Clone Vocal de Curtiss — ElevenLabs",desc:"ElevenLabs clone ta voix exacte en 5 minutes. Le bot appelle avec TA voix — le prospect croit parler à Curtiss directement.",stats:[{l:"Statut voix",v:"À configurer"},{l:"Appels possible",v:"24h/24"},{l:"Langues",v:"FR, EN, AR"}],color:C.gold},
              {key:"negociateur",icon:"🤝",title:"Agent Négociateur IA",desc:"L'IA négocie le prix dans une fourchette que tu définis. Si le prospect dit 'trop cher', propose -10% automatiquement et envoie un nouveau devis.",stats:[{l:"Deals négociés",v:"3"},{l:"Marge perdue moy.",v:"−8%"},{l:"Taux conversion",v:"+34%"}],color:C.blue},
              {key:"fidelisation",icon:"🔄",title:"Agent Fidélisation",desc:"Relance automatiquement tous les anciens clients à 30, 60 et 90 jours avec un message personnalisé basé sur leur historique Tymeless.",stats:[{l:"Clients suivis",v:"12"},{l:"Taux rétention",v:"34%"},{l:"CA récurrent",v:"4 800€"}],color:C.teal},
            ].map((a,i)=>(
              <Card key={i} style={{borderColor:`${a.color}44`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:26}}>{a.icon}</span>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:C.text}}>{a.title}</div></div>
                  <Pill label={agentStatus[a.key]?.actif?"● Actif":"○ Inactif"} color={agentStatus[a.key]?.actif?C.green:C.muted}/>
                </div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.6,marginBottom:10}}>{a.desc}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                  {a.stats.map((s,j)=>(
                    <div key={j} style={{background:C.card2,borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
                      <div style={{fontSize:11,fontWeight:700,color:a.color}}>{s.v}</div>
                      <div style={{fontSize:9,color:C.muted}}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <Btn v={agentStatus[a.key]?.actif?"red":"gold"} full onClick={()=>setAgentStatus(p=>({...p,[a.key]:{...p[a.key],actif:!p[a.key]?.actif}}))}>
                  {agentStatus[a.key]?.actif?"⏹ Désactiver":"🚀 Activer cet agent"}
                </Btn>
              </Card>
            ))}
          </div>
          <Card style={{marginTop:14,borderColor:C.gold+"44",background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
            <CT>🏭 Multi-Agents Orchestrés</CT>
            <div style={{fontSize:12,color:C.text,lineHeight:1.8,marginBottom:10}}>Thomas prospecte <b style={{color:C.gold}}>simultanément</b> pendant qu'Abou enrichit, qu'un 3ème agent qualifie et qu'un 4ème envoie les devis. Comme une vraie équipe commerciale IA, disponible 24h/24.</div>
            <div style={{display:"flex",gap:8,alignItems:"center",overflowX:"auto",paddingBottom:4}}>
              {["Thomas → WA","Abou → Appels","Bot → Email","Agent → Qualification","Agent → Devis","Agent → Fidélisation"].map((a,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                  <div style={{background:`${C.purple}22`,border:`1px solid ${C.purple}44`,borderRadius:7,padding:"6px 10px",fontSize:10,color:C.purple,fontWeight:600,whiteSpace:"nowrap"}}>{a}</div>
                  {i<5&&<span style={{color:C.muted,fontSize:12}}>→</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ════════════ 12 — MONÉTISATION ════════════ */}
      {tab==="monetisation"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
            <KPI label="Prospects en BDD" val={(bdd.total).toLocaleString("fr")} color={C.blue} sub="France + Afrique"/>
            <KPI label="Contacts complets" val={bdd.complets.toLocaleString("fr")} color={C.green} sub="Email + Tel + Décideur"/>
            <KPI label="Valeur estimée BDD" val={`${Math.round(bdd.valeur_estime/1000)}K €`} color={C.gold} sub="À 8€/contact qualifié"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[
              {icon:"🏪",title:"Place de marché de prospects",color:C.gold,desc:"Vendre tes prospects enrichis à d'autres entreprises de services non concurrentes. Un syndic avec email + tel + décideur = 5 à 15€.",detail:[{l:"Prix unitaire",v:"5 – 15 €"},{l:"Potentiel 10K prospects",v:"50K – 150K €"},{l:"Acheteurs cibles",v:"Services pro, assurances, banques"}]},
              {icon:"🏷️",title:"SaaS Prospection Marque Blanche",color:C.purple,desc:"Vendre l'outil de prospection à d'autres entreprises à 299€/mois + 5% sur chaque deal qu'elles signent via l'outil.",detail:[{l:"Prix mensuel",v:"299 €/mois"},{l:"Commission deals",v:"5% auto"},{l:"Potentiel 20 clients",v:"6K€/mois passif"}]},
              {icon:"🔀",title:"Affiliation Inversée",color:C.teal,desc:"Les prospects qui ne signent pas avec Tymeless sont redirigés vers des partenaires non concurrents — Tymeless touche une commission.",detail:[{l:"Commission reçue",v:"15 – 30%"},{l:"Prospects rejetés/mois",v:"~50"},{l:"Revenu estimé",v:"1 500 – 4 000 €"}]},
              {icon:"📈",title:"Données de Marché",color:C.blue,desc:"Analyser les tendances de 50 000 prospects en BDD et vendre des rapports sectoriels à des fonds d'investissement et fédérations.",detail:[{l:"Prix rapport",v:"500 – 5K €"},{l:"Cibles",v:"Fonds, cabinets, fédérations"},{l:"Fréquence",v:"Mensuel / Trimestriel"}]},
            ].map((m,i)=>(
              <Card key={i} style={{borderColor:`${m.color}44`}}>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:24}}>{m.icon}</span>
                  <div style={{fontWeight:700,fontSize:13,color:C.text}}>{m.title}</div>
                </div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.6,marginBottom:10}}>{m.desc}</div>
                {m.detail.map((d,j)=>(
                  <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{d.l}</span><span style={{fontWeight:600,color:m.color}}>{d.v}</span></div>
                ))}
                <div style={{marginTop:10}}><Btn v="gold" full>Activer →</Btn></div>
              </Card>
            ))}
          </div>
          <Card style={{marginTop:14,borderColor:C.gold+"44",background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
            <CT>💎 Vision : Tymeless → IA Company</CT>
            <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>Dans 2-3 ans, Tymeless n'est plus juste une conciergerie — c'est une <b style={{color:C.gold}}>entreprise d'intelligence artificielle</b> appliquée aux services. La BDD de prospects + les agents IA + le SaaS = un actif valorisable à <b style={{color:C.green}}>plusieurs millions d'euros</b>, comparable à Kompass ou Societe.com.</div>
          </Card>
        </div>
      )}

      {/* ════════════ 13 — SÉCURITÉ ════════════ */}
      {tab==="securite"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:C.green+"44"}}>
            <CT>🔐 RGPD Automatique</CT>
            {[{l:"Contacts tracés",v:rgpd.contacts_traces.toLocaleString("fr"),c:C.blue},{l:"Opt-outs reçus",v:rgpd.opt_outs,c:C.orange},{l:"Base légale",v:rgpd.base_legale,c:C.green},{l:"Dernière purge",v:rgpd.derniere_purge,c:C.muted}].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{r.l}</span><span style={{fontWeight:600,color:r.c}}>{r.v}</span></div>
            ))}
            <div style={{marginTop:12,display:"flex",gap:8}}>
              <Btn v="green" full>📄 Générer Audit CNIL</Btn>
              <Btn v="ghost">Purger opt-outs</Btn>
            </div>
          </Card>
          <Card style={{borderColor:C.red+"44"}}>
            <CT>🚫 Anti-Blacklist IA</CT>
            {[{l:"Vérifiés ce mois",v:blacklist.verifies_ce_mois,c:C.blue},{l:"Bloqués auto",v:blacklist.bloques,c:C.red},{l:"Délivrabilité WA",v:blacklist.taux_delivrabilite,c:C.green}].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{r.l}</span><span style={{fontWeight:600,color:r.c}}>{r.v}</span></div>
            ))}
            <div style={{marginTop:12,background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>✓ Vérification automatique avant chaque envoi — zéro risque de bannissement WhatsApp ou Gmail</div>
          </Card>
          <Card style={{borderColor:C.orange+"44"}}>
            <CT>♻️ Rotation d'Identités</CT>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.6,marginBottom:10}}>Pour les volumes importants, rotation automatique des numéros WhatsApp, adresses email et IPs — pour maintenir une délivrabilité maximale et éviter les blocages.</div>
            {[{l:"Numéros WA actifs",v:"3"},{l:"Adresses email rotation",v:"5"},{l:"IPs proxy rotation",v:"12"},{l:"Délai entre messages",v:"2 – 5 min"}].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{r.l}</span><span style={{fontWeight:600,color:C.orange}}>{r.v}</span></div>
            ))}
          </Card>
          <Card>
            <CT>🌍 Expansion Afrique</CT>
            {[{pays:"🇸🇳 Sénégal",registre:"RCCM Dakar",statut:"Configuré",prospects:842},{pays:"🇨🇮 Côte d'Ivoire",registre:"RCCM Abidjan",statut:"Configuré",prospects:634},{pays:"🇲🇦 Maroc",registre:"ICE Casablanca",statut:"En cours",prospects:0},{pays:"🇦🇪 Dubaï",registre:"DED Dubai",statut:"Planifié",prospects:0}].map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div><div style={{fontSize:12,fontWeight:600}}>{p.pays}</div><div style={{fontSize:10,color:C.muted}}>{p.registre}</div></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {p.prospects>0&&<span style={{fontSize:11,color:C.gold}}>{p.prospects} prospects</span>}
                  <Pill label={p.statut} color={p.statut==="Configuré"?C.green:p.statut==="En cours"?C.gold:C.muted}/>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ════════════ 14 — CONFIG ════════════ */}
      {tab==="config"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            <CT>Configuration bot automatique</CT>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[["Secteur cible",<Sel key="s" value={botCfg.secteur} onChange={setBc("secteur")} options={METIERS.map(m=>({v:m,l:m}))} style={{width:"100%"}}/>],["Zone géographique",<Inp key="z" placeholder="Paris, France, Europe..." value={botCfg.zone} onChange={setBc("zone")} style={{width:"100%"}}/>],["Volume prospects/mois",<Inp key="v" type="number" placeholder="50" value={botCfg.volume} onChange={setBc("volume")} style={{width:"100%"}}/>],["Rémunération",<Sel key="r" value={botCfg.remuneration} onChange={setBc("remuneration")} options={["Commission 15–30% sur deal","Forfait mensuel fixe"].map(o=>({v:o,l:o}))} style={{width:"100%"}}/>]].map(([l,el],i)=>(
                <div key={i}><div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div>{el}</div>
              ))}
              <Btn v="purple" full onClick={()=>setBotCfg(p=>({...p,actif:true}))}>🚀 Activer la prospection auto</Btn>
              {botCfg.actif&&<div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>✓ Bots actifs — Thomas & Abou prospectent automatiquement</div>}
            </div>
          </Card>
          <Card>
            <CT>Clés API & Intégrations</CT>
            {[["🤖 Claude (enrichissement)","ty_anthropic","sk-ant-api03-..."],["📞 Bland.ai (bot vocal)","ty_bland","bland_api_key_..."],["🎙️ ElevenLabs (clone vocal)","ty_eleven","sk_eleven_..."],["📸 Instagram API","ty_insta","insta_token_..."],["☁ Supabase URL","ty_sb_url","https://xxx.supabase.co"],["🔑 Supabase Key","ty_sb_key","anon key..."]].map(([l,k,ph],i)=>(
              <div key={i} style={{marginBottom:9}}>
                <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div>
                <input type="password" placeholder={ph} defaultValue={typeof window!=="undefined"?localStorage.getItem(k)||"":""} onChange={e=>localStorage.setItem(k,e.target.value)} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:10,fontFamily:"monospace",outline:"none",width:"100%"}}/>
              </div>
            ))}
            <Btn v="gold" full onClick={()=>alert("✓ Clés sauvegardées")}>💾 Sauvegarder</Btn>
          </Card>
        </div>
      )}

      {/* ════════════ 15 — HISTORIQUE ════════════ */}
      {tab==="historique"&&(
        <div>
          {historique.length===0?(
            <Card style={{textAlign:"center",padding:40}}>
              <div style={{fontSize:28,marginBottom:8}}>📋</div>
              <div style={{color:C.muted,fontSize:13}}>Aucun message généré.<br/>Utilise le Générateur IA pour créer tes premiers messages !</div>
            </Card>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {historique.map((h,i)=>(
                <Card key={i} style={{borderColor:C.purple+"33"}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:C.purple+"22",border:`1px solid ${C.purple}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.purple,fontWeight:700,flexShrink:0}}>{h.bot[0]}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:6,marginBottom:5,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{fontWeight:700,fontSize:12,color:C.text}}>{h.prospect}</span>
                        <Pill label={h.secteur} color={C.blue}/><Pill label={h.service} color={C.gold}/><Pill label={h.canal} color={C.green}/>
                        <span style={{fontSize:10,color:C.muted,marginLeft:"auto"}}>{h.bot} · {h.date}</span>
                      </div>
                      <div style={{background:C.card2,borderRadius:7,padding:"8px 10px",fontSize:11,color:C.text,lineHeight:1.6,whiteSpace:"pre-wrap",borderLeft:`3px solid ${C.purple}`}}>{h.msg}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
                      <Btn sm v="ghost" onClick={()=>navigator.clipboard.writeText(h.msg)}>📋</Btn>
                      <Btn sm v="green">📲</Btn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};




const PageStock=({profil=PROFIL_DEFAUT})=>{
  const [tab,setTab]=useState("stock");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3500);};
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);

  const [articles,setArticles]=useState([
    {id:1,art:"Produit nettoyage vitres",cat:"Nettoyage",service:"Tous",qte:3,min:10,max:50,u:"L",four:"CleanPro",prix_u:12.50,expiry:"12/2026",lot:"LOT-2024-01",statut:"critique",photo:"🧴"},
    {id:2,art:"Microfibre premium",cat:"Nettoyage",service:"Tous",qte:45,min:20,max:100,u:"pcs",four:"CleanPro",prix_u:2.80,expiry:"",lot:"",statut:"ok",photo:"🧽"},
    {id:3,art:"Produit parquet luxe",cat:"Nettoyage",service:"Résidentiel",qte:8,min:5,max:30,u:"L",four:"LuxClean",prix_u:18.00,expiry:"06/2026",lot:"LOT-2024-03",statut:"ok",photo:"✨"},
    {id:4,art:"Kit nettoyage Yacht",cat:"Maritime",service:"Yacht",qte:1,min:3,max:10,u:"kit",four:"MarineClean",prix_u:145.00,expiry:"",lot:"",statut:"critique",photo:"⚓"},
    {id:5,art:"Produit jet privé premium",cat:"Aviation",service:"Jet Privé",qte:2,min:5,max:20,u:"L",four:"AeroClean",prix_u:85.00,expiry:"09/2026",lot:"LOT-2024-05",statut:"critique",photo:"✈️"},
    {id:6,art:"Gants latex",cat:"Protection",service:"Tous",qte:120,min:50,max:500,u:"paires",four:"SafePro",prix_u:0.45,expiry:"12/2027",lot:"",statut:"ok",photo:"🧤"},
    {id:7,art:"Désinfectant professionnel",cat:"Nettoyage",service:"Tous",qte:6,min:8,max:40,u:"L",four:"CleanPro",prix_u:22.00,expiry:"03/2026",lot:"LOT-2024-07",statut:"alerte",photo:"🧪"},
    {id:8,art:"Serviettes luxe Yacht",cat:"Textile",service:"Yacht",qte:12,min:20,max:60,u:"pcs",four:"LuxTextile",prix_u:35.00,expiry:"",lot:"",statut:"alerte",photo:"🏖️"},
    {id:9,art:"Produit vitres Airbnb",cat:"Nettoyage",service:"Airbnb",qte:15,min:10,max:50,u:"L",four:"CleanPro",prix_u:9.50,expiry:"08/2026",lot:"LOT-2024-09",statut:"ok",photo:"🪟"},
    {id:10,art:"Sacs poubelle pro",cat:"Consommables",service:"Tous",qte:200,min:100,max:1000,u:"pcs",four:"CleanPro",prix_u:0.15,expiry:"",lot:"",statut:"ok",photo:"🗑️"},
  ]);

  const [commandes,setCommandes]=useState([
    {id:"CMD-001",article:"Kit nettoyage Yacht",fournisseur:"MarineClean",qte:5,montant:725,date:"12/05/2026",statut:"en_cours",tracking:"FR123456789"},
    {id:"CMD-002",article:"Produit vitres premium",fournisseur:"CleanPro",qte:20,montant:250,date:"10/05/2026",statut:"livré",tracking:"FR987654321"},
  ]);

  const [historique,setHistorique]=useState([
    {date:"Auj. 09:00",art:"Microfibre premium",mvt:-5,motif:"Mission Airbnb Montmartre",collab:"Thomas",auto:true},
    {date:"Hier 14:00",art:"Produit parquet luxe",mvt:-2,motif:"Mission Résidentiel",collab:"Abou",auto:true},
    {date:"Hier 09:00",art:"Gants latex",mvt:-10,motif:"Mission Bureaux",collab:"Abou",auto:true},
    {date:"Il y a 2j",art:"Produit vitres",mvt:+20,motif:"Livraison CMD-002",collab:"—",auto:false},
  ]);

  const [fournisseurs]=useState([
    {nom:"CleanPro",cat:"Nettoyage général",articles:5,ca:"1 450€",delai:"48h",contact:"cleanpro@email.fr",note:4.8,tel:"+33 1 23 45 67 89"},
    {nom:"LuxClean",cat:"Produits luxe",articles:2,ca:"540€",delai:"72h",contact:"luxclean@email.fr",note:4.5,tel:"+33 1 98 76 54 32"},
    {nom:"MarineClean",cat:"Maritime",articles:1,ca:"725€",delai:"5j",contact:"marine@email.fr",note:4.2,tel:"+33 4 56 78 90 12"},
    {nom:"AeroClean",cat:"Aviation",articles:1,ca:"340€",delai:"3j",contact:"aero@email.fr",note:4.7,tel:"+33 5 67 89 01 23"},
    {nom:"SafePro",cat:"Protection",articles:1,ca:"108€",delai:"24h",contact:"safe@email.fr",note:4.9,tel:"+33 2 34 56 78 90"},
  ]);

  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [newArt,setNewArt]=useState({art:"",cat:"Nettoyage",service:"Tous",qte:"",min:"",max:"",u:"L",four:"",prix_u:"",expiry:"",lot:"",photo:"📦"});
  const [filtreService,setFiltreService]=useState("tous");
  const [filtreStatut,setFiltreStatut]=useState("tous");
  const [qrModal,setQrModal]=useState(null);

  const critiques=articles.filter(a=>a.statut==="critique");
  const alertes=articles.filter(a=>a.statut==="alerte");
  const valeurStock=articles.reduce((s,a)=>s+a.qte*a.prix_u,0);
  const expirantBientot=articles.filter(a=>a.expiry&&a.expiry<"06/2026");

  const getStatut=(qte,min)=>qte<min*0.5?"critique":qte<min?"alerte":"ok";
  const getStatutColor=(s)=>s==="critique"?C.red:s==="alerte"?C.orange:C.green;

  const commander=(article)=>{
    const qteCmd=article.max-article.qte;
    const cmd={id:`CMD-${String(commandes.length+1).padStart(3,"0")}`,article:article.art,fournisseur:article.four,qte:qteCmd,montant:Math.round(qteCmd*article.prix_u),date:new Date().toLocaleDateString("fr"),statut:"en_cours",tracking:`FR${Math.floor(100000000+Math.random()*900000000)}`};
    setCommandes(p=>[cmd,...p]);
    setHistorique(p=>[{date:"Maintenant",art:article.art,mvt:0,motif:`Commande CMD-${String(commandes.length+1).padStart(3,"0")} passée`,collab:"Curtiss",auto:false},...p]);
    showToast(`📦 Commande passée chez ${article.four} — ${qteCmd} ${article.u} · ${fmt(qteCmd*article.prix_u,"EUR")}`);
  };

  const analyserIA=async()=>{
    setAiLoading(true);
    try{
      const missions_planifiees=7;
      const prompt=`Tu es expert en gestion de stock. Analyse ce stock et donne 3 recommandations urgentes.

Articles critiques : ${critiques.map(a=>`${a.art}(${a.qte}/${a.min}${a.u})`).join(", ")}
Articles en alerte : ${alertes.map(a=>`${a.art}(${a.qte}/${a.min}${a.u})`).join(", ")}
Missions planifiées cette semaine : ${missions_planifiees}
Valeur stock : ${valeurStock.toFixed(2)}€
Services actifs : Airbnb, Yacht, Jet Privé, Résidentiel

3 recommandations CONCRÈTES et URGENTES. Inclus les quantités à commander et l'impact sur les missions.`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiResult(data.content?.[0]?.text||"Analyse non disponible");
    }catch(e){setAiResult("Erreur — Vérifiez la connexion");}
    setAiLoading(false);
  };

  const articlesFiltres=articles.filter(a=>{
    if(filtreService!=="tous"&&a.service!==filtreService&&a.service!=="Tous")return false;
    if(filtreStatut!=="tous"&&a.statut!==filtreStatut)return false;
    return true;
  });

  const TABS=[
    {id:"stock",label:"📦 Stock"},
    {id:"commandes",label:"🚚 Commandes"},
    {id:"previsions",label:"🤖 IA & Prévisions"},
    {id:"historique",label:"📋 Historique"},
    {id:"fournisseurs",label:"🏭 Fournisseurs"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px #00000066",maxWidth:380}}>{toast.msg}</div>}

      {/* MODAL QR CODE */}
      {qrModal&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:300,textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{qrModal.art}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:16}}>QR Code pour scan terrain</div>
            <div style={{width:160,height:160,background:C.card2,border:`2px solid ${C.gold}`,borderRadius:8,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
              <div style={{fontSize:40}}>{qrModal.photo}</div>
              <div style={{fontSize:9,fontFamily:"monospace",color:C.muted}}>ID-{qrModal.id}-TOS</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,8px)",gap:1}}>
                {Array.from({length:25},(_,i)=><div key={i} style={{width:8,height:8,background:Math.random()>0.5?C.text:"transparent"}}/>)}
              </div>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Stock actuel : <b style={{color:C.gold}}>{qrModal.qte} {qrModal.u}</b></div>
            <div style={{display:"flex",gap:8}}>
              <Btn v="ghost" full onClick={()=>setQrModal(null)}>Fermer</Btn>
              <Btn v="gold" full onClick={()=>{showToast("📲 QR Code envoyé sur WhatsApp");setQrModal(null);}}>📲 Envoyer WA</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUTER ARTICLE */}
      {modal==="ajouter"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:500,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouvel article</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Emoji</div><Inp placeholder="📦" value={newArt.photo} onChange={e=>setNewArt(p=>({...p,photo:e.target.value}))} style={{width:"100%",textAlign:"center",fontSize:20}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nom de l'article *</div><Inp placeholder="Ex: Produit nettoyage vitres" value={newArt.art} onChange={e=>setNewArt(p=>({...p,art:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Catégorie</div>
                  <Sel value={newArt.cat} onChange={e=>setNewArt(p=>({...p,cat:e.target.value}))} options={["Nettoyage","Protection","Consommables","Maritime","Aviation","Textile","Autre"].map(c=>({v:c,l:c}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Service lié</div>
                  <Sel value={newArt.service} onChange={e=>setNewArt(p=>({...p,service:e.target.value}))} options={["Tous","Airbnb","Résidentiel","Bureaux","Jet Privé","Yacht","Rapatriement"].map(s=>({v:s,l:s}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
                {[["Qté *","qte","number"],["Seuil min","min","number"],["Seuil max","max","number"],["Unité","u","text"]].map(([l,k,t])=>(
                  <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={l} value={newArt[k]} onChange={e=>setNewArt(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Fournisseur</div><Inp placeholder="CleanPro" value={newArt.four} onChange={e=>setNewArt(p=>({...p,four:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Prix unitaire (€)</div><Inp type="number" placeholder="12.50" value={newArt.prix_u} onChange={e=>setNewArt(p=>({...p,prix_u:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Date expiration</div><Inp placeholder="MM/YYYY" value={newArt.expiry} onChange={e=>setNewArt(p=>({...p,expiry:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>N° de lot</div><Inp placeholder="LOT-2024-01" value={newArt.lot} onChange={e=>setNewArt(p=>({...p,lot:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newArt.art||!newArt.qte)return;
                setArticles(p=>[...p,{id:Date.now(),...newArt,qte:Number(newArt.qte),min:Number(newArt.min)||0,max:Number(newArt.max)||100,prix_u:Number(newArt.prix_u)||0,statut:getStatut(Number(newArt.qte),Number(newArt.min))}]);
                setModal(null);setNewArt({art:"",cat:"Nettoyage",service:"Tous",qte:"",min:"",max:"",u:"L",four:"",prix_u:"",expiry:"",lot:"",photo:"📦"});
                showToast("✓ Article ajouté !");
              }}>✓ Ajouter</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER */}
      {modal==="modifier"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,width:340}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{selected.photo} {selected.art}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Modifier la quantité</div>
            <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"center",marginBottom:14}}>
              <button onClick={()=>setSelected(p=>({...p,qte:Math.max(0,p.qte-1)}))} style={{width:36,height:36,background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:18,color:C.text,fontFamily:"inherit"}}>−</button>
              <Inp type="number" value={selected.qte} onChange={e=>setSelected(p=>({...p,qte:Number(e.target.value)}))} style={{width:80,textAlign:"center",fontSize:18,fontWeight:700}}/>
              <button onClick={()=>setSelected(p=>({...p,qte:p.qte+1}))} style={{width:36,height:36,background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:18,color:C.text,fontFamily:"inherit"}}>+</button>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                const ancien=articles.find(a=>a.id===selected.id).qte;
                const diff=selected.qte-ancien;
                setArticles(p=>p.map(a=>a.id===selected.id?{...selected,statut:getStatut(selected.qte,selected.min)}:a));
                setHistorique(p=>[{date:"Maintenant",art:selected.art,mvt:diff,motif:"Mise à jour manuelle",collab:"Curtiss",auto:false},...p]);
                setModal(null);showToast("✓ Stock mis à jour !");
              }}>✓ Sauvegarder</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub={`${profil.termes.stock} · Alertes · Commandes · Fournisseurs · ${profil.label}`}>⊟ {profil.termes.stock}</STitle>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={analyserIA}>{aiLoading?"🤖...":"🤖 IA Stock"}</Btn>
          <Btn v="gold" onClick={()=>setModal("ajouter")}>+ Ajouter {profil.termes.produit}</Btn>
        </div>
      </div>

      {/* ALERTES CRITIQUES */}
      {critiques.length>0&&(
        <div style={{background:`${C.red}11`,border:`1px solid ${C.red}44`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:C.red,marginBottom:8}}>🚨 {critiques.length} rupture(s) critique — Commander maintenant !</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {critiques.map((a,i)=>(
              <div key={i} style={{background:C.card,borderRadius:7,padding:"6px 10px",display:"flex",gap:8,alignItems:"center",border:`1px solid ${C.red}33`}}>
                <span style={{fontSize:16}}>{a.photo}</span>
                <div><div style={{fontSize:11,fontWeight:600,color:C.red}}>{a.art}</div><div style={{fontSize:9,color:C.muted}}>{a.qte}/{a.min} {a.u}</div></div>
                <Btn sm v="red" onClick={()=>commander(a)}>📦 Commander</Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPIRATION ALERTE */}
      {expirantBientot.length>0&&(
        <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}44`,borderRadius:10,padding:12,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:C.orange}}>⏰ {expirantBientot.length} article(s) expirent bientôt : {expirantBientot.map(a=>`${a.art} (${a.expiry})`).join(", ")}</div>
        </div>
      )}

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Articles" val={articles.length} color={C.blue}/>
        <KPI label="Critiques" val={critiques.length} color={critiques.length>0?C.red:C.green}/>
        <KPI label="En alerte" val={alertes.length} color={alertes.length>0?C.orange:C.green}/>
        <KPI label="Valeur stock" val={fmt(valeurStock,"EUR")} color={C.gold}/>
        <KPI label="Commandes en cours" val={commandes.filter(c=>c.statut==="en_cours").length} color={C.teal}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── STOCK ── */}
      {tab==="stock"&&(
        <div>
          {/* NORMES SECTORIELLES */}
          {profil.normes&&profil.normes.length>0&&(
            <div style={{background:`linear-gradient(135deg,${C.card},#001A0A)`,border:`1px solid ${C.green}44`,borderRadius:10,padding:14,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,color:C.green,marginBottom:8}}>✅ Normes {profil.label} — Modules actifs</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {profil.normes.map((n,i)=>(
                  <div key={i} style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:6,padding:"5px 10px",fontSize:11,color:C.green,fontWeight:500}}>✓ {n}</div>
                ))}
              </div>
              <div style={{fontSize:10,color:C.muted,marginTop:8}}>Ces modules sont activés automatiquement selon votre secteur · Gérés dans Formation & Normes</div>
            </div>
          )}
            <div style={{display:"flex",gap:5}}>
              {["tous","critique","alerte","ok"].map(s=>(
                <button key={s} onClick={()=>setFiltreStatut(s)} style={{padding:"4px 10px",border:`1px solid ${filtreStatut===s?getStatutColor(s):C.border}`,borderRadius:20,background:filtreStatut===s?`${getStatutColor(s)}22`:C.card2,color:filtreStatut===s?getStatutColor(s):C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>
                  {s==="tous"?"Tous":s==="critique"?"🔴":s==="alerte"?"🟡":"🟢"} {s==="tous"?"":s}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:5}}>
              {["tous","Airbnb","Yacht","Jet Privé","Résidentiel","Bureaux"].map(s=>(
                <button key={s} onClick={()=>setFiltreService(s)} style={{padding:"4px 10px",border:`1px solid ${filtreService===s?C.blue:C.border}`,borderRadius:20,background:filtreService===s?`${C.blue}22`:C.card2,color:filtreService===s?C.blue:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>
                  {s==="tous"?"Tous":s}
                </button>
              ))}
            </div>
          </div>

          {/* GRILLE ARTICLES */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            {articlesFiltres.map((a,i)=>{
              const pct=Math.min((a.qte/a.max)*100,100);
              const sc=getStatutColor(a.statut);
              return(
                <div key={i} style={{background:C.card,border:`1px solid ${sc}33`,borderRadius:10,padding:14,transition:"all 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
                >
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:24}}>{a.photo}</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:C.text}}>{a.art}</div>
                        <div style={{fontSize:10,color:C.muted}}>{a.cat} · {a.service}</div>
                      </div>
                    </div>
                    <Pill label={a.statut==="critique"?"🔴 Critique":a.statut==="alerte"?"🟡 Alerte":"✅ OK"} color={sc}/>
                  </div>

                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                    <span style={{color:C.muted}}>Stock actuel</span>
                    <span style={{fontWeight:700,fontSize:16,color:sc}}>{a.qte} <span style={{fontSize:10}}>{a.u}</span></span>
                  </div>
                  <div style={{height:5,borderRadius:3,background:C.border,marginBottom:6}}>
                    <div style={{height:"100%",width:`${pct}%`,background:sc,borderRadius:3,transition:"width 0.5s"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:8}}>
                    <span>Min: {a.min}</span>
                    <span>Max: {a.max}</span>
                    <span style={{color:C.teal}}>{a.four}</span>
                    <span style={{color:C.gold}}>{a.prix_u}€/{a.u}</span>
                  </div>

                  {a.expiry&&<div style={{fontSize:9,color:C.orange,marginBottom:6}}>⏰ Expire : {a.expiry}{a.lot&&` · ${a.lot}`}</div>}

                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {a.statut!=="ok"&&<Btn sm v="gold" onClick={()=>commander(a)}>📦 Commander</Btn>}
                    <Btn sm v="blue" onClick={()=>{setSelected({...a});setModal("modifier");}}>✏️</Btn>
                    <Btn sm v="ghost" onClick={()=>setQrModal(a)}>📱 QR</Btn>
                    <Btn sm v="red" onClick={()=>{setArticles(p=>p.filter(x=>x.id!==a.id));showToast("Supprimé","#EF4444");}}>🗑</Btn>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ALERTE WHATSAPP CONFIG */}
          <Card style={{borderColor:`${C.green}44`}}>
            <CT>📱 Alertes WhatsApp automatiques</CT>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                {[["🔴 Rupture critique","Immédiatement",C.red],[" 🟡 Stock sous seuil","Dans la journée",C.orange],["📦 Commande livrée","Dès réception",C.green],["⏰ Produit bientôt périmé","7 jours avant",C.orange],["📊 Récap stock","Lundi 8h",C.blue]].map(([l,t,c],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
                    <span style={{color:C.muted}}>{l}</span>
                    <Pill label={t} color={c}/>
                  </div>
                ))}
              </div>
              <div style={{background:"#075E54",borderRadius:10,padding:12}}>
                <div style={{fontSize:9,color:"#25D366",marginBottom:6,textTransform:"uppercase"}}>💬 Aperçu alerte WA</div>
                <div style={{background:"#128C7E",borderRadius:"12px 12px 12px 2px",padding:"8px 10px",fontSize:11,color:"#fff",lineHeight:1.8}}>
                  🚨 <b>STOCK CRITIQUE — Tymeless</b><br/>
                  ⚓ Kit Yacht : 1/3 kits<br/>
                  ✈️ Produit Jet : 2/5 L<br/>
                  🧴 Vitres : 3/10 L<br/>
                  📦 Commander maintenant ?<br/>
                  <span style={{fontSize:9,color:"#aaa"}}>Tymeless OS · Stock Alert</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── COMMANDES ── */}
      {tab==="commandes"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>showToast("+ Commande manuelle créée")}>+ Nouvelle commande</Btn>
          </div>
          <Card>
            <CT>🚚 Suivi des commandes</CT>
            <TH heads={["Réf.","Article","Fournisseur","Qté","Montant","Date","Tracking","Statut","Action"]} rows={commandes.map((c,i)=>(
              <tr key={i}>
                <Td><span style={{fontFamily:"monospace",fontSize:10,color:C.gold}}>{c.id}</span></Td>
                <Td><span style={{fontWeight:600,fontSize:12}}>{c.article}</span></Td>
                <Td><span style={{color:C.teal}}>{c.fournisseur}</span></Td>
                <Td><span style={{fontWeight:600}}>{c.qte}</span></Td>
                <Td><span style={{color:C.gold,fontWeight:700}}>{fmt(c.montant,"EUR")}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{c.date}</span></Td>
                <Td><span style={{fontFamily:"monospace",fontSize:9,color:C.blue}}>{c.tracking}</span></Td>
                <Td><Pill label={c.statut==="livré"?"✅ Livré":"🚚 En cours"} color={c.statut==="livré"?C.green:C.blue}/></Td>
                <Td>
                  {c.statut==="en_cours"&&(
                    <Btn sm v="green" onClick={()=>{
                      setCommandes(p=>p.map(x=>x.id===c.id?{...x,statut:"livré"}:x));
                      setArticles(p=>p.map(a=>a.art===c.article?{...a,qte:a.qte+c.qte,statut:getStatut(a.qte+c.qte,a.min)}:a));
                      setHistorique(prev=>[{date:"Maintenant",art:c.article,mvt:c.qte,motif:`Livraison ${c.id}`,collab:"—",auto:false},...prev]);
                      showToast(`✅ Livraison confirmée — Stock mis à jour`);
                    }}>✓ Livré</Btn>
                  )}
                </Td>
              </tr>
            ))}/>
          </Card>
        </div>
      )}

      {/* ── IA & PRÉVISIONS ── */}
      {tab==="previsions"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 Intelligence IA — Prédictions stock</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Claude analyse vos missions planifiées et prédit quand vous allez manquer de stock.</div>
            <Btn v="purple" onClick={analyserIA}>{aiLoading?"🤖 Analyse...":"🤖 Analyser mon stock"}</Btn>
          </Card>

          {aiLoading&&(
            <Card style={{textAlign:"center",padding:30,marginBottom:14}}>
              <div style={{fontSize:32,marginBottom:8}}>🤖</div>
              <div style={{fontSize:13,color:C.purple,fontWeight:600}}>Analyse du stock en cours...</div>
              <div style={{fontSize:11,color:C.muted}}>Missions planifiées · Consommation historique · Délais fournisseurs...</div>
            </Card>
          )}

          {aiResult&&!aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
              <CT>🤖 Recommandations Claude IA</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiResult}</div>
            </Card>
          )}

          {/* PRÉVISIONS PAR SERVICE */}
          <Card style={{marginBottom:14}}>
            <CT>📊 Consommation prévue par service — 30 jours</CT>
            {[
              {service:"Airbnb",missions:12,articles:[{art:"Produit vitres",conso:6,stock:15},{art:"Microfibre",conso:12,stock:45}]},
              {service:"Yacht",missions:4,articles:[{art:"Kit Yacht",conso:4,stock:1},{art:"Serviettes luxe",conso:8,stock:12}]},
              {service:"Jet Privé",missions:3,articles:[{art:"Produit jet privé",conso:3,stock:2}]},
            ].map((s,i)=>(
              <div key={i} style={{marginBottom:12,background:C.card2,borderRadius:8,padding:12}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:8}}>{s.service} — {s.missions} missions prévues</div>
                {s.articles.map((a,j)=>{
                  const ok=a.stock>=a.conso;
                  return(
                    <div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,marginBottom:4}}>
                      <span style={{color:C.muted}}>{a.art}</span>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{color:C.muted}}>Besoin : {a.conso}</span>
                        <span style={{color:ok?C.green:C.red,fontWeight:600}}>Stock : {a.stock}</span>
                        <Pill label={ok?"✅ OK":"⚠️ Insuffisant"} color={ok?C.green:C.red}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </Card>

          {/* PRÉVISIONS SAISONNIÈRES */}
          <Card style={{borderColor:`${C.teal}44`}}>
            <CT>🌤️ Prévisions saisonnières</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[{s:"Printemps",ico:"🌸",tip:"Airbnb +30% · Résidentiel +20%",c:C.green},{s:"Été",ico:"☀️",tip:"Yacht +80% · Jet +50% · Stock x3",c:C.gold},{s:"Automne",ico:"🍂",tip:"Bureaux +25% · Résidentiel stable",c:C.orange},{s:"Hiver",ico:"❄️",tip:"Rapatriement +40% · Airbnb -20%",c:C.blue}].map((s,i)=>(
                <div key={i} style={{background:C.card2,border:`1px solid ${s.c}33`,borderRadius:8,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:4}}>{s.ico}</div>
                  <div style={{fontSize:11,fontWeight:600,color:s.c,marginBottom:4}}>{s.s}</div>
                  <div style={{fontSize:10,color:C.muted,lineHeight:1.5}}>{s.tip}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── HISTORIQUE ── */}
      {tab==="historique"&&(
        <Card>
          <CT>📋 Historique des mouvements</CT>
          <TH heads={["Date","Article","Mouvement","Motif","Collaborateur","Auto"]} rows={historique.map((h,i)=>(
            <tr key={i}>
              <Td><span style={{fontSize:11,color:C.muted}}>{h.date}</span></Td>
              <Td><span style={{fontWeight:600}}>{h.art}</span></Td>
              <Td><span style={{fontWeight:700,fontSize:13,color:h.mvt>0?C.green:h.mvt<0?C.red:C.muted}}>{h.mvt>0?"+":""}{h.mvt}</span></Td>
              <Td><span style={{fontSize:11,color:C.muted}}>{h.motif}</span></Td>
              <Td><Pill label={h.collab} color={h.collab==="Thomas"?C.blue:h.collab==="Abou"?C.teal:h.collab==="Curtiss"?C.gold:C.muted}/></Td>
              <Td><Pill label={h.auto?"🤖 Auto":"✋ Manuel"} color={h.auto?C.purple:C.muted}/></Td>
            </tr>
          ))}/>
        </Card>
      )}

      {/* ── FOURNISSEURS ── */}
      {tab==="fournisseurs"&&<TabFournisseurs showToast={showToast}/>}
    </div>
  );
};

const PageServices=({profil=PROFIL_DEFAUT})=>{
  const [tab,setTab]=useState("catalogue");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [filtreCategorie,setFiltreCategorie]=useState("tous");

  const [services,setServices]=useState([
    // NETTOYAGE
    {id:1,nom:"Nettoyage Airbnb",cat:"Nettoyage",desc:"Nettoyage complet entre deux locataires. Linge, ménage, réapprovisionnement.",prix:150,unite:"par intervention",duree:"2-3h",dispo:true,populaire:true,upsell:"Nettoyage résidentiel mensuel"},
    {id:2,nom:"Nettoyage résidentiel",cat:"Nettoyage",desc:"Entretien méticuleux de villas, appartements et résidences privées.",prix:200,unite:"par intervention",duree:"3-4h",dispo:true,populaire:true,upsell:"Formule mensuelle résidentielle"},
    {id:3,nom:"Nettoyage bureaux & sièges sociaux",cat:"Nettoyage",desc:"Gestion de l'image de marque de vos espaces professionnels. Interventions discrètes.",prix:180,unite:"par intervention",duree:"2-4h",dispo:true,populaire:false,upsell:"Contrat annuel bureaux"},
    {id:4,nom:"Nettoyage restaurants",cat:"Nettoyage",desc:"Nettoyage professionnel conforme aux normes HACCP. Cuisine, salle, sanitaires.",prix:220,unite:"par intervention",duree:"3-5h",dispo:true,populaire:false,upsell:"Contrat hebdomadaire restaurant"},
    {id:5,nom:"Nettoyage pharmacies",cat:"Nettoyage",desc:"Nettoyage selon protocoles sanitaires stricts. Désinfection complète.",prix:160,unite:"par intervention",duree:"2-3h",dispo:true,populaire:false,upsell:"Contrat mensuel pharmacie"},
    {id:6,nom:"Nettoyage syndic & immeubles",cat:"Nettoyage",desc:"Parties communes, halls d'entrée, couloirs et espaces collectifs.",prix:120,unite:"par intervention",duree:"1-2h",dispo:true,populaire:false,upsell:"Contrat annuel syndic"},
    {id:7,nom:"Sortie des poubelles",cat:"Nettoyage",desc:"Service de sortie et rentrée des poubelles. Ponctuel ou récurrent.",prix:40,unite:"par passage",duree:"30 min",dispo:true,populaire:false,upsell:"Pack nettoyage parties communes"},
    {id:8,nom:"Remise en état après travaux",cat:"Nettoyage",desc:"Nettoyage profond post-chantier. Élimination poussières, résidus et déchets.",prix:350,unite:"sur devis",duree:"4-8h",dispo:true,populaire:false,upsell:"Nettoyage résidentiel régulier"},
    // PRESTIGE
    {id:9,nom:"Nettoyage Yacht",cat:"Prestige",desc:"Entretien à quai ou avant embarquement. Équipe dédiée French Riviera. Protocole luxe.",prix:800,unite:"par intervention",duree:"4-6h",dispo:true,populaire:true,upsell:"Broker Yachting"},
    {id:10,nom:"Nettoyage Jet Privé",cat:"Prestige",desc:"Nettoyage cabine et désinfection intégrale. Personnel en tenue Tymeless.",prix:1200,unite:"par intervention",duree:"2-4h",dispo:true,populaire:true,upsell:"Location Jets Privés"},
    // CONCIERGERIE
    {id:11,nom:"Conciergerie — Formule Découverte",cat:"Conciergerie",desc:"Assistance 24/7, demandes illimitées, accès 9h→00h.",prix:175,unite:"/semaine",duree:"7j",dispo:true,populaire:true,upsell:"Formule Mensuelle"},
    {id:12,nom:"Conciergerie — Formule Mensuelle",cat:"Conciergerie",desc:"Demandes illimitées, service prioritaire 7j/7, assistance lifestyle sur mesure.",prix:690,unite:"/mois",duree:"30j",dispo:true,populaire:true,upsell:"Formule Trimestrielle"},
    {id:13,nom:"Conciergerie — Formule Trimestrielle",cat:"Conciergerie",desc:"Service continu 9h→00h, accès privilégié partenaires.",prix:2070,unite:"/trimestre",duree:"90j",dispo:true,populaire:false,upsell:"Formule Annuelle"},
    {id:14,nom:"Conciergerie — Formule Annuelle",cat:"Conciergerie",desc:"Concierge personnel dédié, accès prioritaire VIP, assistance complète 24/7.",prix:10500,unite:"/an HT",duree:"365j",dispo:true,populaire:false,upsell:"Pack VIP Premium"},
    // SÉCURITÉ
    {id:15,nom:"Protection rapprochée",cat:"Sécurité",desc:"Agent de sécurité personnel. Discret, formé, réactif.",prix:0,unite:"sur devis",duree:"Sur mesure",dispo:true,populaire:false,upsell:"Surveillance résidence"},
    {id:16,nom:"Surveillance résidences",cat:"Sécurité",desc:"Gardiennage et surveillance de vos biens immobiliers.",prix:0,unite:"sur devis",duree:"Sur mesure",dispo:true,populaire:false,upsell:"Protection rapprochée"},
    {id:17,nom:"Sécurité événementielle",cat:"Sécurité",desc:"Gestion sécurité pour événements privés et corporate.",prix:0,unite:"sur devis",duree:"Sur mesure",dispo:true,populaire:false,upsell:"Organisation événements"},
    {id:18,nom:"Sécurité chantier",cat:"Sécurité",desc:"Surveillance et sécurisation de chantiers. Contrôle accès.",prix:0,unite:"sur devis",duree:"Sur mesure",dispo:true,populaire:false,upsell:"Remise en état après travaux"},
    // MOBILITÉ
    {id:19,nom:"Broker Yachting",cat:"Mobilité & Luxe",desc:"Vente, location et gestion de yachts de prestige. Accompagnement sur mesure.",prix:0,unite:"commission",duree:"Sur mesure",dispo:true,populaire:true,upsell:"Nettoyage Yacht"},
    {id:20,nom:"Location Jets Privés",cat:"Mobilité & Luxe",desc:"Jets privés sélectionnés avec soin. Voyagez à votre rythme.",prix:0,unite:"sur devis",duree:"Sur mesure",dispo:true,populaire:true,upsell:"Empty Legs"},
    {id:21,nom:"Empty Legs",cat:"Mobilité & Luxe",desc:"Vols à tarifs exclusifs sur trajets déjà programmés. Expérience premium à prix réduit.",prix:0,unite:"sur devis",duree:"Variable",dispo:true,populaire:false,upsell:"Location Jets Privés"},
    // ÉVÉNEMENTS
    {id:22,nom:"Organisation événements privés",cat:"Événements",desc:"Soirées, réceptions, célébrations. Gestion clé en main.",prix:0,unite:"sur devis",duree:"Sur mesure",dispo:true,populaire:false,upsell:"Sécurité événementielle"},
    {id:23,nom:"Organisation événements corporate",cat:"Événements",desc:"Séminaires, conférences, team building haut de gamme.",prix:0,unite:"sur devis",duree:"Sur mesure",dispo:true,populaire:false,upsell:"Conciergerie Mensuelle"},
    // RAPATRIEMENT
    {id:24,nom:"Rapatriement corps international",cat:"Rapatriement",desc:"Gestion complète du protocole. Formalités administratives, transport aérien, coordination familles. Discrétion absolue.",prix:0,unite:"sur devis",duree:"48-72h",dispo:true,populaire:false,upsell:"Prévoyance décès"},
    {id:25,nom:"Prévoyance décès",cat:"Rapatriement",desc:"Solutions de prévoyance pour anticiper et protéger vos proches.",prix:0,unite:"sur devis",duree:"Sur mesure",dispo:true,populaire:false,upsell:"Conciergerie Annuelle"},
  ]);

  const [newService,setNewService]=useState({nom:"",cat:"Nettoyage",desc:"",prix:"",unite:"par intervention",duree:"",dispo:true});

  const CATEGORIES=["tous","Nettoyage","Prestige","Conciergerie","Sécurité","Mobilité & Luxe","Événements","Rapatriement"];
  const CAT_COLORS={"Nettoyage":C.blue,"Prestige":C.gold,"Conciergerie":C.purple,"Sécurité":C.red,"Mobilité & Luxe":C.teal,"Événements":C.pink,"Rapatriement":C.muted};
  const CAT_ICONS={"Nettoyage":"🧹","Prestige":"⚓","Conciergerie":"🤵","Sécurité":"🛡️","Mobilité & Luxe":"✈️","Événements":"🎪","Rapatriement":"🕊️"};

  const servicesFiltres=services.filter(s=>filtreCategorie==="tous"||s.cat===filtreCategorie);
  const populaires=services.filter(s=>s.populaire);
  const totalServices=services.length;
  const dispos=services.filter(s=>s.dispo).length;

  const TABS=[
    {id:"catalogue",label:"📋 Catalogue"},
    {id:"categories",label:"🗂️ Par catégorie"},
    {id:"upsell",label:"📈 Tunnel de vente"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {/* MODAL AJOUTER SERVICE */}
      {modal==="ajouter"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:480}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouveau service</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nom du service *</div><Inp placeholder="Ex: Nettoyage villa" value={newService.nom} onChange={e=>setNewService(p=>({...p,nom:e.target.value}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Catégorie</div><Sel value={newService.cat} onChange={e=>setNewService(p=>({...p,cat:e.target.value}))} options={CATEGORIES.filter(c=>c!=="tous").map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Description</div><textarea value={newService.desc} onChange={e=>setNewService(p=>({...p,desc:e.target.value}))} placeholder="Description du service..." style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontFamily:"inherit",fontSize:12,minHeight:60,resize:"vertical"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Prix (€)</div><Inp type="number" placeholder="150" value={newService.prix} onChange={e=>setNewService(p=>({...p,prix:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Unité</div><Inp placeholder="par intervention" value={newService.unite} onChange={e=>setNewService(p=>({...p,unite:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Durée</div><Inp placeholder="2-3h" value={newService.duree} onChange={e=>setNewService(p=>({...p,duree:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newService.nom)return;
                setServices(p=>[...p,{id:Date.now(),...newService,prix:Number(newService.prix)||0,populaire:false,upsell:""}]);
                setModal(null);
                setNewService({nom:"",cat:"Nettoyage",desc:"",prix:"",unite:"par intervention",duree:"",dispo:true});
                showToast("✓ Service ajouté au catalogue !");
              }}>✓ Ajouter</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FICHE SERVICE */}
      {modal==="fiche"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${CAT_COLORS[selected.cat]||C.gold}44`,borderRadius:14,padding:24,width:480}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontSize:16,fontWeight:700}}>{CAT_ICONS[selected.cat]} {selected.nom}</div>
                <Pill label={selected.cat} color={CAT_COLORS[selected.cat]||C.blue}/>
              </div>
              <Btn sm v="ghost" onClick={()=>setModal(null)}>✕</Btn>
            </div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:14}}>{selected.desc}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {[["💰 Prix",selected.prix>0?`${fmt(selected.prix,"EUR")} ${selected.unite}`:"Sur devis",C.gold],["⏱️ Durée",selected.duree,C.blue],["📊 Dispo",selected.dispo?"✅ Disponible":"❌ Indispo",selected.dispo?C.green:C.red]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            {selected.upsell&&(
              <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,marginBottom:14}}>
                <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:2}}>📈 Upsell recommandé</div>
                <div style={{fontSize:12,color:C.text}}>→ {selected.upsell}</div>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <Btn v="gold" full onClick={()=>{showToast(`📋 ${selected.nom} ajouté au devis !`);setModal(null);}}>📋 Ajouter au devis</Btn>
              <Btn v="ghost" full onClick={()=>{setServices(p=>p.map(x=>x.id===selected.id?{...x,dispo:!x.dispo}:x));setModal(null);showToast("✓ Disponibilité mise à jour");}}>
                {selected.dispo?"⏸ Désactiver":"▶ Activer"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="Catalogue complet · Tunnel de vente · Upsell automatique">⊛ Produits & Services</STitle>
        <Btn v="gold" onClick={()=>setModal("ajouter")}>+ Ajouter service</Btn>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Total services" val={totalServices} color={C.blue}/>
        <KPI label="Disponibles" val={dispos} color={C.green}/>
        <KPI label="Services populaires" val={populaires.length} color={C.gold}/>
        <KPI label="Catégories" val={CATEGORIES.length-1} color={C.purple}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── CATALOGUE ── */}
      {tab==="catalogue"&&(
        <div>
          {/* Filtres catégories */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setFiltreCategorie(c)} style={{padding:"5px 12px",border:`1px solid ${filtreCategorie===c?CAT_COLORS[c]||C.gold:C.border}`,borderRadius:20,background:filtreCategorie===c?`${CAT_COLORS[c]||C.gold}22`:C.card2,color:filtreCategorie===c?CAT_COLORS[c]||C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:filtreCategorie===c?700:400}}>
                {c==="tous"?"Tous":CAT_ICONS[c]+" "+c}
              </button>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {servicesFiltres.map((s,i)=>{
              const cc=CAT_COLORS[s.cat]||C.blue;
              return(
                <Card key={i} style={{borderColor:`${cc}33`,cursor:"pointer",transition:"all 0.2s",opacity:s.dispo?1:0.5}}
                  onClick={()=>{setSelected(s);setModal("fiche");}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
                >
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{fontSize:22,marginRight:8}}>{CAT_ICONS[s.cat]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4,lineHeight:1.3}}>{s.nom}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        <Pill label={s.cat} color={cc}/>
                        {s.populaire&&<Pill label="⭐ Populaire" color={C.gold}/>}
                        {!s.dispo&&<Pill label="❌ Indispo" color={C.red}/>}
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:8,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:16,fontWeight:700,color:C.gold}}>{s.prix>0?`${fmt(s.prix,"EUR")}`:"Sur devis"}</div>
                      <div style={{fontSize:9,color:C.muted}}>{s.prix>0?s.unite:""}</div>
                    </div>
                    <div style={{fontSize:10,color:C.muted}}>⏱️ {s.duree}</div>
                  </div>
                  <Btn sm v="gold" full onClick={e=>{e.stopPropagation();showToast(`📋 ${s.nom} ajouté au devis !`);}}>📋 Ajouter au devis</Btn>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PAR CATÉGORIE ── */}
      {tab==="categories"&&(
        <div>
          {CATEGORIES.filter(c=>c!=="tous").map((cat,i)=>{
            const ss=services.filter(s=>s.cat===cat);
            const cc=CAT_COLORS[cat]||C.blue;
            return(
              <Card key={i} style={{marginBottom:12,borderColor:`${cc}33`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:20}}>{CAT_ICONS[cat]}</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:cc}}>{cat}</div>
                      <div style={{fontSize:11,color:C.muted}}>{ss.length} service{ss.length>1?"s":""}</div>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {ss.map((s,j)=>(
                    <div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card2,borderRadius:7,padding:"8px 12px",cursor:"pointer"}} onClick={()=>{setSelected(s);setModal("fiche");}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:C.text}}>{s.nom}</div>
                        <div style={{fontSize:10,color:C.muted}}>{s.duree}</div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontWeight:700,color:C.gold}}>{s.prix>0?fmt(s.prix,"EUR"):"Sur devis"}</span>
                        <Btn sm v="gold" onClick={e=>{e.stopPropagation();showToast(`📋 ${s.nom} ajouté au devis !`);}}>+ Devis</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── TUNNEL DE VENTE ── */}
      {tab==="upsell"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.green}44`,background:`linear-gradient(135deg,${C.card},#001A0A)`}}>
            <CT>📈 Tunnel de vente automatique</CT>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:12}}>
              Après chaque mission terminée, Tymeless OS propose automatiquement le service suivant au client. Comme Amazon — "les clients qui ont acheté ça ont aussi acheté ça."
            </div>
          </Card>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {services.filter(s=>s.upsell).map((s,i)=>(
              <div key={i} style={{background:C.card2,border:`1px solid ${CAT_COLORS[s.cat]||C.blue}22`,borderRadius:10,padding:12,display:"flex",gap:14,alignItems:"center"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:16}}>{CAT_ICONS[s.cat]}</span>
                    <span style={{fontWeight:600,fontSize:12,color:C.text}}>{s.nom}</span>
                    <span style={{fontSize:11,color:C.gold,fontWeight:700}}>{s.prix>0?fmt(s.prix,"EUR"):"Sur devis"}</span>
                  </div>
                </div>
                <div style={{fontSize:18,color:C.muted}}>→</div>
                <div style={{flex:1,background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:"8px 12px"}}>
                  <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:2}}>📈 Upsell proposé</div>
                  <div style={{fontSize:12,color:C.text,fontWeight:600}}>{s.upsell}</div>
                </div>
                <div style={{fontSize:18,color:C.muted}}>→</div>
                <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:"8px 12px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:2}}>CA potentiel</div>
                  <div style={{fontSize:12,fontWeight:700,color:C.gold}}>+💰</div>
                </div>
              </div>
            ))}
          </div>

          <Card style={{marginTop:14,borderColor:`${C.purple}44`}}>
            <CT>📲 Upsell automatique WhatsApp</CT>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:10}}>
                  48h après chaque mission, le client reçoit automatiquement une proposition pour le service suivant.
                </div>
                {[["Délai envoi","48h après mission"],["Canal","WhatsApp"],["Personnalisation","Nom client + service utilisé"],["Taux conversion moyen","15-25%"]].map(([l,v],j)=>(
                  <div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}>
                    <span style={{color:C.muted}}>{l}</span><span style={{color:C.text,fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"#075E54",borderRadius:10,padding:12}}>
                <div style={{fontSize:9,color:"#25D366",marginBottom:6,textTransform:"uppercase"}}>💬 Message upsell WA</div>
                <div style={{background:"#128C7E",borderRadius:"12px 12px 12px 2px",padding:"10px 12px",fontSize:11,color:"#fff",lineHeight:1.8}}>
                  Bonjour Sofia ! 👋<br/>
                  Merci pour votre confiance lors du nettoyage Airbnb. ✨<br/>
                  Avez-vous pensé à notre formule mensuelle à 690€ ?<br/>
                  📋 Je vous prépare un devis ?<br/>
                  <span style={{fontSize:9,color:"#aaa"}}>Tymeless Conciergerie</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const PageChat=()=>{
  const [espace,setEspace]=useState("equipe");
  const [contact,setContact]=useState("Thomas");
  const [msg,setMsg]=useState("");
  const [recording,setRecording]=useState(false);
  const [jitsiOpen,setJitsiOpen]=useState(false);
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const messagesEndRef=useRef(null);

  const ESPACES={
    equipe:{label:"👥 Équipe",color:C.blue,contacts:["Thomas","Abou","Fatou","Tout le monde"]},
    clients:{label:"👤 Clients",color:C.gold,contacts:["Sofia Riad","Ahmed Al-Rashid","Marc Dupont","Isabelle Moreau","Jean-Paul Martin"]},
    partenaires:{label:"🤝 Partenaires",color:C.purple,contacts:["Leila Mansouri","Karim Diallo","Nassim Belkacem","Jean-Pierre Morel"]},
    club:{label:"🌐 Club",color:C.teal,contacts:["Ahmed Barro","Claire Fontaine","Moussa Konaté","Fatima Al-Zahra"]},
  };

  const [conversations,setConversations]=useState({
    "Thomas":[
      {id:1,de:"Thomas",texte:"Bonjour Curtiss, mission Airbnb Montmartre terminée ✅",time:"09:15",type:"texte",lu:true},
      {id:2,de:"moi",texte:"Parfait ! Le client a laissé 5 étoiles 🌟",time:"09:20",type:"texte",lu:true},
      {id:3,de:"Thomas",texte:"Super ! Je pars pour la prochaine mission dans 30 min",time:"09:22",type:"texte",lu:true},
    ],
    "Abou":[
      {id:1,de:"Abou",texte:"Stock produits nettoyage yacht presque épuisé",time:"08:30",type:"texte",lu:true},
      {id:2,de:"moi",texte:"Commande passée chez MarineClean 👍",time:"08:35",type:"texte",lu:true},
    ],
    "Fatou":[
      {id:1,de:"Fatou",texte:"RDV client VIP confirmé pour demain 14h",time:"Hier",type:"texte",lu:true},
      {id:2,de:"moi",texte:"Parfait, prépare le protocole d'accueil luxe 🤵",time:"Hier",type:"texte",lu:true},
      {id:3,de:"Fatou",texte:"",time:"10:00",type:"vocal",duree:"0:23",lu:false},
    ],
    "Tout le monde":[
      {id:1,de:"moi",texte:"Réunion d'équipe lundi 9h - Présence obligatoire 📋",time:"Hier",type:"texte",lu:true},
    ],
    "Sofia Riad":[
      {id:1,de:"Sofia Riad",texte:"Bonjour, je voudrais réserver pour le mois prochain",time:"10:30",type:"texte",lu:false},
      {id:2,de:"moi",texte:"Bonjour Sofia ! Bien sûr, je vous prépare un devis 📋",time:"10:35",type:"texte",lu:true},
    ],
    "Ahmed Al-Rashid":[
      {id:1,de:"Ahmed Al-Rashid",texte:"The yacht will arrive Friday, please prepare your team",time:"Hier",type:"texte",lu:true},
      {id:2,de:"moi",texte:"Perfect, our team will be ready ✅",time:"Hier",type:"texte",lu:true},
    ],
    "Leila Mansouri":[
      {id:1,de:"Leila Mansouri",texte:"J'ai un nouveau client intéressé par le Jet Privé",time:"09:00",type:"texte",lu:false},
      {id:2,de:"moi",texte:"Excellent ! Envoie-moi ses coordonnées",time:"09:05",type:"texte",lu:true},
    ],
    "Claire Fontaine":[
      {id:1,de:"Claire Fontaine",texte:"",time:"08:45",type:"vocal",duree:"1:12",lu:false},
    ],
  });

  const msgs=conversations[contact]||[];
  const nonLus=Object.values(conversations).reduce((s,ms)=>s+ms.filter(m=>m.de!=="moi"&&!m.lu).length,0);

  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const envoyerMsg=()=>{
    if(!msg.trim())return;
    setConversations(p=>({...p,[contact]:[...(p[contact]||[]),{id:Date.now(),de:"moi",texte:msg,time:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),type:"texte",lu:true}]}));
    setMsg("");
    setTimeout(()=>showToast(`✓ Message envoyé à ${contact}`),100);
  };

  const envoyerVocal=()=>{
    setRecording(false);
    setConversations(p=>({...p,[contact]:[...(p[contact]||[]),{id:Date.now(),de:"moi",texte:"",time:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),type:"vocal",duree:"0:15",lu:true}]}));
    showToast("🎤 Message vocal envoyé !");
  };

  const marquerLus=(c)=>{
    setConversations(p=>({...p,[c]:(p[c]||[]).map(m=>({...m,lu:true}))}));
  };

  const espaceInfo=ESPACES[espace];
  const ec=espaceInfo.color;

  return(
    <div style={{display:"flex",height:"calc(100vh - 60px)",gap:0}}>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {/* MODAL JITSI VISIO */}
      {jitsiOpen&&(
        <div style={{position:"fixed",inset:0,background:"#000",zIndex:3000,display:"flex",flexDirection:"column"}}>
          <div style={{background:C.card,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>📹 Appel visio avec {contact}</div>
            <Btn v="red" onClick={()=>setJitsiOpen(false)}>✕ Terminer l'appel</Btn>
          </div>
          <iframe src={`https://meet.jit.si/Tymeless-${contact.replace(/ /g,"-")}-${Date.now()}`} style={{flex:1,border:"none",width:"100%"}} allow="camera; microphone; fullscreen; display-capture"/>
        </div>
      )}

      {/* SIDEBAR GAUCHE — Espaces + Contacts */}
      <div style={{width:240,background:C.card,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        {/* Espaces */}
        <div style={{padding:"12px 10px 8px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Espaces</div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {Object.entries(ESPACES).map(([k,e])=>(
              <button key={k} onClick={()=>{setEspace(k);setContact(e.contacts[0]);marquerLus(e.contacts[0]);}} style={{padding:"6px 10px",border:"none",borderRadius:6,background:espace===k?`${e.color}22`:C.card2,color:espace===k?e.color:C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,textAlign:"left",fontWeight:espace===k?700:400}}>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div style={{flex:1,overflowY:"auto",padding:"8px 6px"}}>
          <div style={{fontSize:9,color:C.muted,marginBottom:6,padding:"0 4px",textTransform:"uppercase",letterSpacing:"0.1em"}}>Conversations</div>
          {espaceInfo.contacts.map((c,i)=>{
            const msgs_c=conversations[c]||[];
            const dernierMsg=msgs_c[msgs_c.length-1];
            const nonLusC=msgs_c.filter(m=>m.de!=="moi"&&!m.lu).length;
            return(
              <button key={i} onClick={()=>{setContact(c);marquerLus(c);}} style={{width:"100%",padding:"8px",border:"none",borderRadius:7,background:contact===c?`${ec}22`:C.card2,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:3,borderLeft:contact===c?`2px solid ${ec}`:"2px solid transparent"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <div style={{display:"flex",gap:7,alignItems:"center"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:`${ec}22`,border:`1px solid ${ec}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:ec,flexShrink:0}}>{c[0]}</div>
                    <span style={{fontSize:11,fontWeight:nonLusC>0?700:500,color:contact===c?ec:C.text}}>{c}</span>
                  </div>
                  {nonLusC>0&&<div style={{width:16,height:16,borderRadius:"50%",background:ec,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#000"}}>{nonLusC}</div>}
                </div>
                {dernierMsg&&(
                  <div style={{fontSize:9,color:C.muted,paddingLeft:35,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {dernierMsg.type==="vocal"?"🎤 Message vocal":dernierMsg.de==="moi"?"Vous: "+dernierMsg.texte:dernierMsg.texte}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ZONE PRINCIPALE CHAT */}
      <div style={{flex:1,display:"flex",flexDirection:"column",background:C.dark}}>
        {/* Header chat */}
        <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:`${ec}22`,border:`2px solid ${ec}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:ec}}>{contact[0]}</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{contact}</div>
              <div style={{fontSize:10,color:C.green}}>● En ligne</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>showToast(`📞 Appel vocal lancé avec ${contact}...`)} style={{width:34,height:34,borderRadius:"50%",background:`${C.green}22`,border:`1px solid ${C.green}44`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>📞</button>
            <button onClick={()=>setJitsiOpen(true)} style={{width:34,height:34,borderRadius:"50%",background:`${C.blue}22`,border:`1px solid ${C.blue}44`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>📹</button>
            <button onClick={()=>showToast(`ℹ️ Profil de ${contact} ouvert`)} style={{width:34,height:34,borderRadius:"50%",background:C.card2,border:`1px solid ${C.border}`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>ℹ️</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:8}}>
          {msgs.length===0&&(
            <div style={{textAlign:"center",color:C.muted,fontSize:12,marginTop:40}}>
              <div style={{fontSize:32,marginBottom:8}}>💬</div>
              Aucun message — Commencez la conversation !
            </div>
          )}
          {msgs.map((m,i)=>{
            const isMoi=m.de==="moi";
            return(
              <div key={i} style={{display:"flex",justifyContent:isMoi?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>
                {!isMoi&&<div style={{width:26,height:26,borderRadius:"50%",background:`${ec}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:ec,flexShrink:0}}>{m.de[0]}</div>}
                <div style={{maxWidth:"65%"}}>
                  {!isMoi&&<div style={{fontSize:9,color:C.muted,marginBottom:2,paddingLeft:4}}>{m.de}</div>}
                  <div style={{background:isMoi?ec:C.card,borderRadius:isMoi?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"8px 12px",boxShadow:"0 1px 4px #00000033"}}>
                    {m.type==="vocal"?(
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <button onClick={()=>showToast("▶ Lecture message vocal...")} style={{width:28,height:28,borderRadius:"50%",background:isMoi?"rgba(255,255,255,0.3)":ec+"44",border:"none",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",color:isMoi?"#000":ec}}>▶</button>
                        <div style={{flex:1,height:3,borderRadius:2,background:isMoi?"rgba(255,255,255,0.4)":C.border}}>
                          <div style={{height:"100%",width:"40%",background:isMoi?"rgba(255,255,255,0.8)":ec,borderRadius:2}}/>
                        </div>
                        <span style={{fontSize:10,color:isMoi?"rgba(0,0,0,0.6)":C.muted}}>{m.duree}</span>
                        <span style={{fontSize:10}}>🎤</span>
                      </div>
                    ):(
                      <div style={{fontSize:12,color:isMoi?"#000":C.text,lineHeight:1.5}}>{m.texte}</div>
                    )}
                    <div style={{fontSize:9,color:isMoi?"rgba(0,0,0,0.5)":C.muted,marginTop:3,textAlign:"right",display:"flex",gap:4,justifyContent:"flex-end",alignItems:"center"}}>
                      {m.time}
                      {isMoi&&<span style={{color:m.lu?"#4FC3F7":"rgba(0,0,0,0.4)"}}>✓✓</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef}/>
        </div>

        {/* ZONE SAISIE */}
        <div style={{background:C.card,borderTop:`1px solid ${C.border}`,padding:"10px 14px"}}>
          {/* Contexte lié */}
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
            {["📋 Créer devis","📅 Créer mission","🔍 Score solvabilité","📄 Envoyer contrat"].map((a,i)=>(
              <button key={i} onClick={()=>showToast(`✓ ${a} lié à ${contact}`)} style={{padding:"3px 8px",border:`1px solid ${C.border}`,borderRadius:20,background:C.card2,color:C.muted,cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>
                {a}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {/* Bouton vocal */}
            <button
              onMouseDown={()=>setRecording(true)}
              onMouseUp={recording?envoyerVocal:null}
              style={{width:38,height:38,borderRadius:"50%",background:recording?`${C.red}44`:`${C.green}22`,border:`1px solid ${recording?C.red:C.green}`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}
            >{recording?"🔴":"🎤"}</button>

            {/* Champ texte */}
            <div style={{flex:1,position:"relative"}}>
              <input
                value={msg}
                onChange={e=>setMsg(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),envoyerMsg())}
                placeholder={recording?"Enregistrement en cours... Relâchez pour envoyer":"Message..."}
                style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:20,padding:"8px 16px",color:C.text,fontFamily:"inherit",fontSize:12,outline:"none",boxSizing:"border-box"}}
              />
            </div>

            {/* Emoji */}
            <button onClick={()=>setMsg(p=>p+"😊")} style={{width:34,height:34,borderRadius:"50%",background:C.card2,border:`1px solid ${C.border}`,cursor:"pointer",fontSize:16}}>😊</button>

            {/* Envoyer */}
            <button onClick={envoyerMsg} style={{width:38,height:38,borderRadius:"50%",background:msg.trim()?ec:C.card2,border:`1px solid ${msg.trim()?ec:C.border}`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
              ➤
            </button>
          </div>
          {recording&&<div style={{textAlign:"center",fontSize:11,color:C.red,marginTop:4,animation:"pulse 1s infinite"}}>🔴 Enregistrement... Relâchez pour envoyer</div>}
        </div>
      </div>
    </div>
  );
};

const PageNotifications=({notifs,setNotifs})=>{
  const [tab,setTab]=useState("toutes");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};

  const [config,setConfig]=useState([
    {id:"devis",label:"Nouveau devis à valider",canal:"dashboard",actif:true,urgence:"urgent"},
    {id:"paiement",label:"Paiement reçu",canal:"whatsapp",actif:true,urgence:"good"},
    {id:"stock",label:"Stock critique",canal:"whatsapp",actif:true,urgence:"urgent"},
    {id:"mission",label:"Mission terminée",canal:"dashboard",actif:true,urgence:"good"},
    {id:"commission",label:"Commission en attente",canal:"whatsapp",actif:true,urgence:"money"},
    {id:"client",label:"Nouveau message client",canal:"whatsapp",actif:true,urgence:"info"},
    {id:"conge",label:"Demande de congé",canal:"dashboard",actif:true,urgence:"info"},
    {id:"avis",label:"Nouvel avis client",canal:"dashboard",actif:true,urgence:"good"},
    {id:"solvabilite",label:"Alerte solvabilité client",canal:"whatsapp",actif:true,urgence:"urgent"},
    {id:"tresorerie",label:"Solde trésorerie sous seuil",canal:"whatsapp",actif:true,urgence:"urgent"},
  ]);

  const TC={urgent:C.red,money:C.gold,good:C.green,info:C.blue};
  const ICONS={urgent:"🚨",money:"💰",good:"✅",info:"ℹ️"};
  const nlu=notifs.filter(n=>!n.lu).length;

  const filtrees=tab==="toutes"?notifs:tab==="non_lues"?notifs.filter(n=>!n.lu):notifs.filter(n=>n.type===tab);

  const TABS=[
    {id:"toutes",label:"🔔 Toutes"},
    {id:"non_lues",label:`Non lues (${nlu})`},
    {id:"urgent",label:"🚨 Urgentes"},
    {id:"money",label:"💰 Financières"},
    {id:"config",label:"⚙️ Configurer"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="Alertes temps réel · WhatsApp · Dashboard · Multi-modules">
          🔔 Notifications
          {nlu>0&&<span style={{background:C.red,color:"#fff",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,marginLeft:8}}>{nlu}</span>}
        </STitle>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={()=>{setNotifs(p=>p.map(n=>({...n,lu:true})));showToast("✓ Tout marqué comme lu");}}>✓ Tout lire</Btn>
          <Btn v="red" onClick={()=>{setNotifs(p=>p.filter(n=>!n.lu));showToast("🗑 Notifications lues supprimées","#EF4444");}}>🗑 Effacer lues</Btn>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Total" val={notifs.length} color={C.blue}/>
        <KPI label="Non lues" val={nlu} color={nlu>0?C.orange:C.green}/>
        <KPI label="Urgentes" val={notifs.filter(n=>n.type==="urgent"&&!n.lu).length} color={C.red}/>
        <KPI label="Financières" val={notifs.filter(n=>n.type==="money"&&!n.lu).length} color={C.gold}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {tab!=="config"&&(
        <div>
          {filtrees.length===0?(
            <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
              <div style={{fontSize:32,marginBottom:8}}>🎉</div>
              <div style={{fontSize:13}}>Aucune notification ici</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {filtrees.map((n,i)=>(
                <div key={i} style={{background:n.lu?C.card:C.card2,border:`1px solid ${n.lu?C.border:TC[n.type]+"44"}`,borderRadius:10,padding:"12px 16px",display:"flex",gap:12,alignItems:"center",opacity:n.lu?0.6:1,cursor:"pointer",transition:"all 0.15s"}}
                  onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,lu:true}:x))}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=TC[n.type]}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=n.lu?C.border:TC[n.type]+"44"}
                >
                  <div style={{width:36,height:36,borderRadius:"50%",background:`${TC[n.type]}22`,border:`1px solid ${TC[n.type]}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{n.icon||ICONS[n.type]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:n.lu?400:700,color:C.text,marginBottom:2}}>{n.titre||n.msg}</div>
                    <div style={{fontSize:10,color:C.muted}}>{n.heure||n.time}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {!n.lu&&<div style={{width:8,height:8,borderRadius:"50%",background:TC[n.type],flexShrink:0}}/>}
                    <Pill label={n.type==="urgent"?"🚨 Urgent":n.type==="money"?"💰 Finance":n.type==="good"?"✅ Info":"ℹ️ Info"} color={TC[n.type]}/>
                    <Btn sm v="red" onClick={e=>{e.stopPropagation();setNotifs(p=>p.filter(x=>x.id!==n.id));}}>🗑</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="config"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
            <CT>⚙️ Configuration des notifications</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Choisissez quelles alertes vous recevez et sur quel canal.</div>
            {config.map((c,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontSize:16}}>{ICONS[c.urgence]}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:C.text}}>{c.label}</div>
                    <div style={{fontSize:10,color:C.muted}}>Canal : {c.canal==="whatsapp"?"📲 WhatsApp":"🖥️ Dashboard"}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <Pill label={c.urgence} color={TC[c.urgence]}/>
                  <div onClick={()=>setConfig(p=>p.map(x=>x.id===c.id?{...x,actif:!x.actif}:x))} style={{width:36,height:20,borderRadius:10,background:c.actif?C.green:C.border,cursor:"pointer",position:"relative",flexShrink:0}}>
                    <div style={{position:"absolute",top:2,left:c.actif?18:2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/>
                  </div>
                </div>
              </div>
            ))}
            <div style={{marginTop:12}}><Btn v="gold" full onClick={()=>showToast("✓ Configuration sauvegardée !")}>Sauvegarder</Btn></div>
          </Card>

          <Card style={{borderColor:`${C.green}44`}}>
            <CT>📲 Test des canaux</CT>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{canal:"WhatsApp",ico:"📲",desc:"Test notification WhatsApp",c:"#25D366"},{canal:"Dashboard",ico:"🖥️",desc:"Test notification dashboard",c:C.blue},{canal:"Email",ico:"📧",desc:"Test notification email",c:C.gold},{canal:"Tous",ico:"🔔",desc:"Tester tous les canaux",c:C.purple}].map((t,i)=>(
                <button key={i} onClick={()=>showToast(`📲 Notification test envoyée via ${t.canal}`)} style={{background:`${t.c}11`,border:`1px solid ${t.c}33`,borderRadius:8,padding:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{t.ico}</div>
                  <div style={{fontSize:12,fontWeight:600,color:t.c}}>{t.canal}</div>
                  <div style={{fontSize:10,color:C.muted}}>{t.desc}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const PageSignatures=()=>(
  <div>
    <STitle sub="Contrats automatiques · E-signature · Archivage">✦ Contrats & Signatures</STitle>
    <div style={{display:"flex",gap:10,marginBottom:14}}><Btn v="gold">+ Générer un contrat</Btn></div>
    <Card><TH heads={["ID","Type","Nom","Commission","Statut","Date","Expire","Actions"]} rows={CONTRATS.map((c,i)=>(<tr key={i}><Td><span style={{color:C.gold,fontFamily:"monospace",fontSize:10}}>{c.id}</span></Td><Td><Pill label={c.type} color={C.blue}/></Td><Td><span style={{fontWeight:600}}>{c.nom}</span></Td><Td><span style={{color:C.gold}}>{c.comm}</span></Td><Td><St s={c.statut}/></Td><Td><span style={{fontSize:10,color:C.muted}}>{c.date}</span></Td><Td><span style={{fontSize:10,color:C.muted}}>{c.expire}</span></Td><Td><div style={{display:"flex",gap:5}}><Btn sm v="ghost">📄 PDF</Btn><Btn sm v="blue">✍ Signer</Btn></div></Td></tr>))}/></Card>
  </div>
);

const PageFormation=({profil=PROFIL_DEFAUT})=>{
  const [tab,setTab]=useState("modules");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);

  const [modules,setModules]=useState([
    {id:1,titre:"Protocole nettoyage Airbnb",categorie:"Métier",collab:"Tous",duree:"2h",score:92,statut:"complété",secteur:"conciergerie",niveau:"Débutant",certifie:true,vente:false,prix:0},
    {id:2,titre:"Standards Jet Privé & Yacht",categorie:"Métier",collab:"Thomas, Fatou",duree:"3h",score:88,statut:"complété",secteur:"conciergerie",niveau:"Avancé",certifie:true,vente:true,prix:97},
    {id:3,titre:"HACCP — Sécurité alimentaire",categorie:"Normes",collab:"Tous",duree:"4h",score:null,statut:"en_cours",secteur:"restaurant",niveau:"Intermédiaire",certifie:true,vente:true,prix:147},
    {id:4,titre:"Hôtellerie luxe — Standards 5★",categorie:"Normes",collab:"Fatou",duree:"5h",score:null,statut:"à_faire",secteur:"hotel",niveau:"Avancé",certifie:true,vente:true,prix:197},
    {id:5,titre:"Gestion des conflits clients",categorie:"Soft skills",collab:"Tous",duree:"1h30",score:75,statut:"complété",secteur:"tous",niveau:"Débutant",certifie:false,vente:true,prix:49},
    {id:6,titre:"EPI & Sécurité chantier BTP",categorie:"Normes",collab:"Tous",duree:"3h",score:null,statut:"à_faire",secteur:"btp",niveau:"Intermédiaire",certifie:true,vente:true,prix:127},
    {id:7,titre:"Protocole rapatriement",categorie:"Métier",collab:"Fatou",duree:"2h",score:95,statut:"complété",secteur:"conciergerie",niveau:"Avancé",certifie:true,vente:false,prix:0},
  ]);

  const [newModule,setNewModule]=useState({titre:"",categorie:"Métier",duree:"",niveau:"Débutant",secteur:"conciergerie",vente:false,prix:0});

  const completes=modules.filter(m=>m.statut==="complété").length;
  const enCours=modules.filter(m=>m.statut==="en_cours").length;
  const aVente=modules.filter(m=>m.vente);
  const revenuPotentiel=aVente.reduce((s,m)=>s+m.prix,0);

  const normesSecteur=profil.normes||[];

  const genererModule=async()=>{
    setAiLoading(true);
    try{
      const prompt=`Tu es expert en formation professionnelle. Crée un plan de module de formation pour le secteur ${profil.label}.

Module: ${newModule.titre||"Formation "+profil.label}
Niveau: ${newModule.niveau}
Durée: ${newModule.duree||"2h"}

Génère:
1. Objectifs pédagogiques (3 points)
2. Plan du cours (5 parties avec titres)
3. Quiz de validation (3 questions QCM)
4. Compétences acquises

Sois concret et pratique.`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiResult(data.content?.[0]?.text||"Erreur");
    }catch(e){setAiResult("Erreur — Vérifiez la connexion");}
    setAiLoading(false);
  };

  const TABS=[
    {id:"modules",label:"📚 Modules"},
    {id:"normes",label:"✅ Normes secteur"},
    {id:"equipe",label:"👥 Progression équipe"},
    {id:"vente",label:"💰 Vente formations"},
    {id:"ia",label:"🤖 IA Formation"},
  ];

  const CAT_COLORS={"Métier":C.blue,"Normes":C.orange,"Soft skills":C.purple,"Sécurité":C.red};

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {modal==="ajouter"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:460}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouveau module de formation</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Titre *</div><Inp placeholder="Ex: HACCP niveau 1" value={newModule.titre} onChange={e=>setNewModule(p=>({...p,titre:e.target.value}))} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Catégorie</div><Sel value={newModule.categorie} onChange={e=>setNewModule(p=>({...p,categorie:e.target.value}))} options={["Métier","Normes","Soft skills","Sécurité","Management"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Niveau</div><Sel value={newModule.niveau} onChange={e=>setNewModule(p=>({...p,niveau:e.target.value}))} options={["Débutant","Intermédiaire","Avancé","Expert"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Durée</div><Inp placeholder="2h30" value={newModule.duree} onChange={e=>setNewModule(p=>({...p,duree:e.target.value}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Secteur</div><Sel value={newModule.secteur} onChange={e=>setNewModule(p=>({...p,secteur:e.target.value}))} options={Object.entries(PROFILS_SECTEURS).map(([k,v])=>({v:k,l:v.label}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:C.card2,borderRadius:8,padding:"10px 12px"}}>
                <div><div style={{fontSize:12,fontWeight:500}}>Vendre aux membres du Club</div><div style={{fontSize:10,color:C.muted}}>Accessible dans le Club Tymeless</div></div>
                <div onClick={()=>setNewModule(p=>({...p,vente:!p.vente}))} style={{width:36,height:20,borderRadius:10,background:newModule.vente?C.green:C.border,cursor:"pointer",position:"relative",flexShrink:0}}>
                  <div style={{position:"absolute",top:2,left:newModule.vente?18:2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/>
                </div>
              </div>
              {newModule.vente&&<div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Prix (€)</div><Inp type="number" placeholder="97" value={newModule.prix} onChange={e=>setNewModule(p=>({...p,prix:Number(e.target.value)}))} style={{width:"100%"}}/></div>}
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newModule.titre)return;
                setModules(p=>[{id:Date.now(),...newModule,collab:"Tous",score:null,statut:"à_faire",certifie:true},...p]);
                setModal(null);
                showToast("✓ Module ajouté !");
              }}>✓ Créer le module</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub={`Formation équipe · Normes · Certifications · ${profil.label}`}>⊿ Formation & Normes</STitle>
        <Btn v="gold" onClick={()=>setModal("ajouter")}>+ Nouveau module</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Modules total" val={modules.length} color={C.blue}/>
        <KPI label="Complétés" val={completes} color={C.green}/>
        <KPI label="En cours" val={enCours} color={C.orange}/>
        <KPI label="À vendre" val={aVente.length} color={C.gold}/>
        <KPI label="Revenus potentiels" val={fmt(revenuPotentiel,"EUR")} color={C.purple}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {tab==="modules"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {modules.map((m,i)=>{
            const cc=CAT_COLORS[m.categorie]||C.blue;
            return(
              <Card key={i} style={{borderColor:`${cc}33`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{m.titre}</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      <Pill label={m.categorie} color={cc}/>
                      <Pill label={m.niveau} color={C.muted}/>
                      {m.certifie&&<Pill label="🏆 Certifiant" color={C.gold}/>}
                    </div>
                  </div>
                  <Pill label={m.statut==="complété"?"✅":m.statut==="en_cours"?"⏳ En cours":"○ À faire"} color={m.statut==="complété"?C.green:m.statut==="en_cours"?C.orange:C.muted}/>
                </div>
                <div style={{display:"flex",gap:10,fontSize:11,color:C.muted,marginBottom:8}}>
                  <span>⏱️ {m.duree}</span>
                  <span>👥 {m.collab}</span>
                  {m.vente&&<span style={{color:C.gold,fontWeight:600}}>💰 {m.prix}€</span>}
                </div>
                {m.score&&(
                  <div style={{marginBottom:8}}>
                    <div style={{height:5,borderRadius:3,background:C.border,marginBottom:2}}><div style={{height:"100%",width:m.score+"%",background:m.score>=80?C.green:C.orange,borderRadius:3}}/></div>
                    <div style={{fontSize:10,color:m.score>=80?C.green:C.orange}}>Score : {m.score}/100</div>
                  </div>
                )}
                <div style={{display:"flex",gap:5}}>
                  <Btn sm v="blue" onClick={()=>showToast(`📚 Module "${m.titre}" ouvert`)}>▶ Lancer</Btn>
                  {m.certifie&&m.statut==="complété"&&<Btn sm v="gold" onClick={()=>showToast("🏆 Certificat généré en PDF")}>🏆 Certificat</Btn>}
                  <Btn sm v="red" onClick={()=>{setModules(p=>p.filter(x=>x.id!==m.id));showToast("Supprimé","#EF4444");}}>🗑</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab==="normes"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.green}44`}}>
            <CT>✅ Normes actives — {profil.label}</CT>
            {normesSecteur.length>0?(
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
                {normesSecteur.map((n,i)=>(
                  <div key={i} style={{background:`${C.green}08`,border:`1px solid ${C.green}33`,borderRadius:8,padding:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.green}}>✅ {n}</div>
                      <Pill label="Actif" color={C.green}/>
                    </div>
                    <Btn sm v="blue" onClick={()=>showToast(`📚 Module "${n}" ouvert`)}>▶ Formation</Btn>
                  </div>
                ))}
              </div>
            ):(
              <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:12}}>Aucune norme spécifique pour ce secteur · Changez le secteur dans la sidebar</div>
            )}
          </Card>

          <Card>
            <CT>🌍 Toutes les normes disponibles</CT>
            {[
              {secteur:"🍽️ Restaurant",normes:["HACCP","Chaîne du froid","DLC/DLUO","Plan nettoyage"]},
              {secteur:"🏨 Hôtellerie",normes:["ISO 9001","Standards luxe","Protocole VIP","Rotation linge"]},
              {secteur:"🔨 BTP",normes:["EPI obligatoire","PPSPS","RGIE","DTU","Plan prévention"]},
              {secteur:"🏥 Médical",normes:["ISO 13485","Pharmacovigilance","Stérilisation","RGPD santé"]},
              {secteur:"🚗 Transport",normes:["Sécurité routière","ADR","Temps conduite","Éco-conduite"]},
            ].map((s,i)=>(
              <div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:6}}>{s.secteur}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {s.normes.map((n,j)=>(
                    <button key={j} onClick={()=>showToast(`📚 Formation "${n}" lancée`)} style={{padding:"3px 10px",border:`1px solid ${C.border}`,borderRadius:20,background:C.card2,color:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="equipe"&&(
        <div>
          <Card style={{marginBottom:14}}>
            <CT>👥 Progression par collaborateur</CT>
            {["Thomas","Abou","Fatou"].map((nom,i)=>{
              const couleurs=[C.blue,C.teal,C.purple];
              const mes=modules.filter(m=>m.collab.includes(nom)||m.collab==="Tous");
              const comp=mes.filter(m=>m.statut==="complété").length;
              const pct=mes.length?Math.round((comp/mes.length)*100):0;
              return(
                <div key={i} style={{padding:"12px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:`${couleurs[i]}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:couleurs[i]}}>{nom[0]}</div>
                      <div><div style={{fontSize:13,fontWeight:600,color:couleurs[i]}}>{nom}</div><div style={{fontSize:10,color:C.muted}}>{comp}/{mes.length} modules complétés</div></div>
                    </div>
                    <span style={{fontSize:16,fontWeight:700,color:pct>=80?C.green:C.orange}}>{pct}%</span>
                  </div>
                  <div style={{height:6,borderRadius:3,background:C.border}}><div style={{height:"100%",width:pct+"%",background:pct>=80?C.green:couleurs[i],borderRadius:3}}/></div>
                  <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                    {mes.map((m,j)=>(
                      <Pill key={j} label={m.statut==="complété"?`✅ ${m.titre.substring(0,15)}...`:`○ ${m.titre.substring(0,15)}...`} color={m.statut==="complété"?C.green:C.muted}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {tab==="vente"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.gold}44`,background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
            <CT>💰 Vendre vos formations au Club Tymeless</CT>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:12}}>
              Vos formations peuvent être vendues aux membres du Club Tymeless et aux autres entreprises abonnées à Tymeless OS. Revenus passifs garantis.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
              {[["Formations à vendre",aVente.length,C.gold],["Revenu potentiel",fmt(revenuPotentiel,"EUR"),C.green],["Prix moyen",aVente.length?fmt(Math.round(revenuPotentiel/aVente.length),"EUR"):"—",C.blue]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,borderRadius:8,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:10,color:C.muted}}>{l}</div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {aVente.map((m,i)=>(
              <Card key={i} style={{borderColor:`${C.gold}33`}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>{m.titre}</div>
                <div style={{display:"flex",gap:5,marginBottom:8}}>
                  <Pill label={m.categorie} color={CAT_COLORS[m.categorie]||C.blue}/>
                  <Pill label={m.niveau} color={C.muted}/>
                </div>
                <div style={{fontSize:11,color:C.muted,marginBottom:8}}>⏱️ {m.duree} · {m.certifie?"🏆 Certifiant":""}</div>
                <div style={{fontSize:20,fontWeight:700,color:C.gold,marginBottom:8}}>{m.prix}€</div>
                <div style={{display:"flex",gap:5}}>
                  <Btn sm v="gold" onClick={()=>showToast(`✓ "${m.titre}" mis en vente dans le Club`)}>Mettre en vente</Btn>
                  <Btn sm v="ghost" onClick={()=>{setModules(p=>p.map(x=>x.id===m.id?{...x,vente:false}:x));showToast("Retiré de la vente");}}>Retirer</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab==="ia"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 Générer un module de formation avec Claude IA</CT>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Titre du module</div><Inp placeholder="Ex: HACCP niveau 1 — Restauration" value={newModule.titre} onChange={e=>setNewModule(p=>({...p,titre:e.target.value}))} style={{width:"100%"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Niveau</div><Sel value={newModule.niveau} onChange={e=>setNewModule(p=>({...p,niveau:e.target.value}))} options={["Débutant","Intermédiaire","Avancé"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Durée</div><Inp placeholder="2h" value={newModule.duree} onChange={e=>setNewModule(p=>({...p,duree:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
            </div>
            <Btn v="purple" full onClick={genererModule}>{aiLoading?"🤖 Génération...":"🤖 Générer le module avec Claude"}</Btn>
          </Card>

          {aiLoading&&<Card style={{textAlign:"center",padding:24,marginBottom:14}}><div style={{fontSize:32,marginBottom:8}}>🤖</div><div style={{color:C.purple}}>Création du module en cours...</div></Card>}

          {aiResult&&!aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
              <CT>📚 Module généré — {newModule.titre||"Formation IA"}</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14}}>{aiResult}</div>
              <Btn v="gold" onClick={()=>{
                setModules(p=>[{id:Date.now(),titre:newModule.titre||"Module IA",categorie:"Métier",collab:"Tous",duree:newModule.duree||"2h",score:null,statut:"à_faire",secteur:profil.label.toLowerCase(),niveau:newModule.niveau,certifie:true,vente:false,prix:0},...p]);
                showToast("✓ Module ajouté à la liste !");
              }}>💾 Ajouter à mes modules</Btn>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

const PageDeals=()=>{
  const [tab,setTab]=useState("pipeline");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);

  const [deals,setDeals]=useState([
    {id:1,titre:"Nettoyage yacht Azur Fleet",client:"Ahmed Al-Rashid",montant:8500,etape:"proposition",proba:75,partenaire:"Leila Mansouri",comm_part:850,date:"15/06/2026",source:"Partenaire",notes:"Client VIP — 3 yachts",priorite:"haute"},
    {id:2,titre:"Contrat Airbnb mensuel × 12",client:"Immo Paris",montant:14400,etape:"negociation",proba:60,partenaire:"",comm_part:0,date:"30/06/2026",source:"Prospection",notes:"Gestionnaire 12 apparts",priorite:"haute"},
    {id:3,titre:"Nettoyage bureaux Fintech SA",client:"Marc Dupont",montant:3600,etape:"qualification",proba:40,partenaire:"",comm_part:0,date:"20/07/2026",source:"CRM",notes:"Contrat annuel reconductible",priorite:"moyenne"},
    {id:4,titre:"Jet Privé — Compagnie Atlas",client:"Compagnie Atlas",montant:12000,etape:"closing",proba:90,partenaire:"Nassim Belkacem",comm_part:1200,date:"25/05/2026",source:"Partenaire",notes:"Urgence — décision cette semaine",priorite:"haute"},
    {id:5,titre:"Résidentiel Villa Cannes",client:"Isabelle Moreau",montant:5200,etape:"prospection",proba:25,partenaire:"",comm_part:0,date:"15/08/2026",source:"NPS",notes:"Recommandation client existant",priorite:"normale"},
    {id:6,titre:"Rapatriement contrat annuel",client:"Assurance AXA",montant:24000,etape:"proposition",proba:55,partenaire:"Jean-Pierre Morel",comm_part:2400,date:"01/07/2026",source:"Partenaire",notes:"Contrat cadre 2 ans",priorite:"haute"},
  ]);

  const [newDeal,setNewDeal]=useState({titre:"",client:"",montant:"",etape:"prospection",partenaire:"",date:"",source:"CRM",notes:"",priorite:"normale"});

  const ETAPES=[
    {id:"prospection",label:"🔍 Prospection",color:C.muted},
    {id:"qualification",label:"✓ Qualification",color:C.blue},
    {id:"proposition",label:"📄 Proposition",color:C.purple},
    {id:"negociation",label:"💬 Négociation",color:C.orange},
    {id:"closing",label:"🤝 Closing",color:C.green},
  ];

  const caTotal=deals.reduce((s,d)=>s+d.montant,0);
  const caPondere=deals.reduce((s,d)=>s+d.montant*d.proba/100,0);
  const dealsClosed=deals.filter(d=>d.etape==="closing").length;
  const commPartenaires=deals.reduce((s,d)=>s+d.comm_part,0);

  const analyserIA=async()=>{
    setAiLoading(true);
    try{
      const prompt=`Tu es expert commercial. Analyse ce pipeline de deals et donne 3 recommandations prioritaires.

Deals actifs:
${deals.map(d=>`- ${d.titre}: ${fmt(d.montant,"EUR")} · Étape: ${d.etape} · Proba: ${d.proba}% · Date: ${d.date} · Priorité: ${d.priorite}`).join("\n")}

CA total pipeline: ${fmt(caTotal,"EUR")}
CA pondéré: ${fmt(caPondere,"EUR")}

Recommandations concrètes pour maximiser le CA ce mois. Priorise les deals à fort potentiel et forte probabilité.`;
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiResult(data.content?.[0]?.text||"Analyse non disponible");
    }catch(e){setAiResult("Erreur");}
    setAiLoading(false);
  };

  const TABS=[
    {id:"pipeline",label:"📊 Pipeline Kanban"},
    {id:"liste",label:"📋 Liste deals"},
    {id:"ia",label:"🤖 IA Analyse"},
  ];

  const PRIORITE_COLOR={haute:C.red,moyenne:C.orange,normale:C.muted};
  const SOURCES=["CRM","Partenaire","Prospection","NPS","Inbound","Réseau"];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {/* MODAL CRÉER DEAL */}
      {modal==="creer"&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:480}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>+ Nouveau deal</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[["Titre *","titre","text","Nettoyage yacht…"],["Client *","client","text","Nom du client"],["Montant (€) *","montant","number","5000"]].map(([l,k,t,ph])=>(
                <div key={k}><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div><Inp type={t} placeholder={ph} value={newDeal[k]} onChange={e=>setNewDeal(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/></div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Étape</div>
                  <Sel value={newDeal.etape} onChange={e=>setNewDeal(p=>({...p,etape:e.target.value}))} options={ETAPES.map(e=>({v:e.id,l:e.label}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Priorité</div>
                  <Sel value={newDeal.priorite} onChange={e=>setNewDeal(p=>({...p,priorite:e.target.value}))} options={["haute","moyenne","normale"].map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Source</div>
                  <Sel value={newDeal.source} onChange={e=>setNewDeal(p=>({...p,source:e.target.value}))} options={SOURCES.map(v=>({v,l:v}))} style={{width:"100%"}}/></div>
                <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Date closing</div>
                  <Inp type="date" value={newDeal.date} onChange={e=>setNewDeal(p=>({...p,date:e.target.value}))} style={{width:"100%"}}/></div>
              </div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Partenaire apporteur</div>
                <Inp placeholder="Nom du partenaire (optionnel)" value={newDeal.partenaire} onChange={e=>setNewDeal(p=>({...p,partenaire:e.target.value}))} style={{width:"100%"}}/></div>
              <div><div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Notes</div>
                <Inp placeholder="Notes..." value={newDeal.notes} onChange={e=>setNewDeal(p=>({...p,notes:e.target.value}))} style={{width:"100%"}}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn v="ghost" full onClick={()=>setModal(null)}>Annuler</Btn>
              <Btn v="gold" full onClick={()=>{
                if(!newDeal.titre||!newDeal.client||!newDeal.montant)return;
                setDeals(p=>[{id:Date.now(),...newDeal,montant:Number(newDeal.montant),proba:25,comm_part:newDeal.partenaire?Math.round(Number(newDeal.montant)*0.1):0},...p]);
                setModal(null);
                setNewDeal({titre:"",client:"",montant:"",etape:"prospection",partenaire:"",date:"",source:"CRM",notes:"",priorite:"normale"});
                showToast("✓ Deal ajouté au pipeline !");
              }}>✓ Ajouter</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FICHE DEAL */}
      {modal==="fiche"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:24,width:500}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontSize:15,fontWeight:700}}>{selected.titre}</div>
                <div style={{fontSize:11,color:C.muted}}>{selected.client} · {selected.source}</div>
              </div>
              <Btn sm v="ghost" onClick={()=>setModal(null)}>✕</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {[["Montant",fmt(selected.montant,"EUR"),C.gold],["Probabilité",selected.proba+"%",C.blue],["CA pondéré",fmt(selected.montant*selected.proba/100,"EUR"),C.green]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            <Card style={{padding:12,marginBottom:12}}>
              {[["📍 Étape",ETAPES.find(e=>e.id===selected.etape)?.label||selected.etape],["🎯 Priorité",selected.priorite],["📅 Date closing",selected.date||"Non définie"],["🤝 Partenaire",selected.partenaire||"Aucun"],["💰 Comm. partenaire",selected.comm_part>0?fmt(selected.comm_part,"EUR"):"—"],["📝 Notes",selected.notes||"—"]].map(([l,v],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <span style={{color:C.muted}}>{l}</span><span style={{color:C.text,fontWeight:500}}>{v}</span>
                </div>
              ))}
            </Card>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Avancer dans le pipeline</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {ETAPES.map((e,i)=>(
                  <button key={i} onClick={()=>{setDeals(p=>p.map(x=>x.id===selected.id?{...x,etape:e.id,proba:e.id==="prospection"?25:e.id==="qualification"?40:e.id==="proposition"?60:e.id==="negociation"?75:90}:x));setSelected(s=>({...s,etape:e.id}));showToast(`✓ Deal avancé : ${e.label}`);}} style={{padding:"5px 10px",border:`1px solid ${selected.etape===e.id?e.color:C.border}`,borderRadius:20,background:selected.etape===e.id?`${e.color}22`:C.card2,color:selected.etape===e.id?e.color:C.muted,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn v="ghost" full onClick={()=>showToast(`📲 Message relance envoyé à ${selected.client}`)}>📲 Relancer</Btn>
              <Btn v="gold" full onClick={()=>showToast("📄 Proposition commerciale générée !")}>📄 Proposition</Btn>
              <Btn v="red" sm onClick={()=>{setDeals(p=>p.filter(x=>x.id!==selected.id));setModal(null);showToast("Deal supprimé","#EF4444");}}>🗑</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle sub="Pipeline · Kanban · IA · Propositions · Commissions partenaires">📋 Deals & Opportunités</STitle>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={analyserIA}>{aiLoading?"🤖...":"🤖 IA Analyse"}</Btn>
          <Btn v="gold" onClick={()=>setModal("creer")}>+ Nouveau deal</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Deals actifs" val={deals.length} color={C.blue}/>
        <KPI label="CA pipeline" val={fmt(caTotal,"EUR")} color={C.gold}/>
        <KPI label="CA pondéré" val={fmt(caPondere,"EUR")} color={C.green}/>
        <KPI label="En closing" val={dealsClosed} color={C.teal}/>
        <KPI label="Comm. partenaires" val={fmt(commPartenaires,"EUR")} color={C.purple}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── PIPELINE KANBAN ── */}
      {tab==="pipeline"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,overflowX:"auto"}}>
          {ETAPES.map((etape,i)=>{
            const ds=deals.filter(d=>d.etape===etape.id);
            const caEtape=ds.reduce((s,d)=>s+d.montant,0);
            return(
              <div key={i} style={{background:C.card2,borderRadius:10,padding:10,minHeight:200}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,padding:"6px 8px",background:`${etape.color}11`,borderRadius:7,border:`1px solid ${etape.color}33`}}>
                  <span style={{fontSize:11,fontWeight:700,color:etape.color}}>{etape.label}</span>
                  <span style={{fontSize:10,color:C.muted}}>{ds.length}</span>
                </div>
                {caEtape>0&&<div style={{fontSize:10,color:C.muted,marginBottom:8,textAlign:"center"}}>{fmt(caEtape,"EUR")}</div>}
                {ds.map((d,j)=>(
                  <div key={j} style={{background:C.card,border:`1px solid ${PRIORITE_COLOR[d.priorite]}33`,borderRadius:8,padding:10,marginBottom:8,cursor:"pointer",transition:"all 0.15s"}}
                    onClick={()=>{setSelected(d);setModal("fiche");}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=PRIORITE_COLOR[d.priorite]}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=`${PRIORITE_COLOR[d.priorite]}33`}
                  >
                    <div style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:4,lineHeight:1.3}}>{d.titre}</div>
                    <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{d.client}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.gold}}>{fmt(d.montant,"EUR")}</span>
                      <span style={{fontSize:10,color:etape.color,fontWeight:600}}>{d.proba}%</span>
                    </div>
                    <div style={{height:3,borderRadius:2,background:C.border,marginBottom:6}}><div style={{height:"100%",width:d.proba+"%",background:etape.color,borderRadius:2}}/></div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      <Pill label={d.priorite==="haute"?"🔴 Haute":d.priorite==="moyenne"?"🟡 Moy.":"⚪ Norm."} color={PRIORITE_COLOR[d.priorite]}/>
                      {d.partenaire&&<Pill label="🤝 AA" color={C.purple}/>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── LISTE ── */}
      {tab==="liste"&&(
        <Card>
          <CT>📋 Tous les deals</CT>
          <TH heads={["Deal","Client","Montant","CA pondéré","Étape","Proba","Date","Priorité","Actions"]} rows={deals.map((d,i)=>{
            const etape=ETAPES.find(e=>e.id===d.etape);
            return(
              <tr key={i}>
                <Td><span style={{fontWeight:600,fontSize:12}}>{d.titre}</span></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{d.client}</span></Td>
                <Td><span style={{fontWeight:700,color:C.gold}}>{fmt(d.montant,"EUR")}</span></Td>
                <Td><span style={{color:C.green}}>{fmt(d.montant*d.proba/100,"EUR")}</span></Td>
                <Td><Pill label={etape?.label||d.etape} color={etape?.color||C.muted}/></Td>
                <Td>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{height:4,width:40,borderRadius:2,background:C.border}}><div style={{height:"100%",width:d.proba+"%",background:etape?.color||C.muted,borderRadius:2}}/></div>
                    <span style={{fontSize:10,color:C.muted}}>{d.proba}%</span>
                  </div>
                </Td>
                <Td><span style={{fontSize:10,color:C.muted}}>{d.date||"—"}</span></Td>
                <Td><Pill label={d.priorite} color={PRIORITE_COLOR[d.priorite]}/></Td>
                <Td>
                  <div style={{display:"flex",gap:4}}>
                    <Btn sm v="blue" onClick={()=>{setSelected(d);setModal("fiche");}}>👁</Btn>
                    <Btn sm v="ghost" onClick={()=>showToast("📄 Proposition générée !")}>📄</Btn>
                    <Btn sm v="ghost" onClick={()=>showToast(`📲 Relance envoyée à ${d.client}`)}>📲</Btn>
                    <Btn sm v="red" onClick={()=>{setDeals(p=>p.filter(x=>x.id!==d.id));showToast("Supprimé","#EF4444");}}>🗑</Btn>
                  </div>
                </Td>
              </tr>
            );
          })}/>
        </Card>
      )}

      {/* ── IA ── */}
      {tab==="ia"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 IA Analyse Pipeline</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Claude analyse votre pipeline et identifie les meilleures opportunités à prioriser.</div>
            <Btn v="purple" onClick={analyserIA}>{aiLoading?"🤖 Analyse...":"🤖 Analyser mon pipeline"}</Btn>
          </Card>
          {aiLoading&&<Card style={{textAlign:"center",padding:24,marginBottom:14}}><div style={{fontSize:32,marginBottom:8}}>🤖</div><div style={{color:C.purple}}>Analyse en cours...</div></Card>}
          {aiResult&&!aiLoading&&(
            <Card style={{marginBottom:14,borderColor:`${C.purple}44`}}>
              <CT>🤖 Recommandations — Claude IA</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiResult}</div>
            </Card>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>📊 CA par étape</CT>
              {ETAPES.map((e,i)=>{
                const ca=deals.filter(d=>d.etape===e.id).reduce((s,d)=>s+d.montant,0);
                return ca>0?(
                  <div key={i} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{color:e.color}}>{e.label}</span>
                      <span style={{fontWeight:700,color:e.color}}>{fmt(ca,"EUR")}</span>
                    </div>
                    <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${(ca/caTotal)*100}%`,background:e.color,borderRadius:2}}/></div>
                  </div>
                ):null;
              })}
            </Card>
            <Card>
              <CT>🏆 Top deals à closer</CT>
              {[...deals].sort((a,b)=>(b.montant*b.proba/100)-(a.montant*a.proba/100)).slice(0,4).map((d,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <div><div style={{fontWeight:600,color:C.text}}>{d.titre.substring(0,25)}...</div><div style={{fontSize:10,color:C.muted}}>{d.client}</div></div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,color:C.gold}}>{fmt(d.montant*d.proba/100,"EUR")}</div>
                    <div style={{fontSize:9,color:C.muted}}>pondéré</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const PageDeploiement=()=>{
  const [tab,setTab]=useState("clients");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);

  const [clientsSaaS,setClientsSaaS]=useState([
    {id:1,societe:"Luxury Clean Monaco",secteur:"conciergerie",pays:"Monaco",contact:"Pierre Dumont",email:"pierre@luxuryclean.mc",tel:"+377 6 12 34 56",plan:"Business",prix:12000,maintenance:1000,modules:["CRM","Devis","Compta","Planning","Stock","RH"],statut:"actif",date_debut:"01/03/2025",prochain_paiement:"01/06/2025",ca_genere:4800,tickets:1},
    {id:2,societe:"Prestige Services Dakar",secteur:"conciergerie",pays:"Sénégal",contact:"Moussa Sarr",email:"moussa@prestige.sn",tel:"+221 77 123 45 67",plan:"Starter",prix:5000,maintenance:500,modules:["CRM","Devis","Planning","Stock"],statut:"actif",date_debut:"15/04/2025",prochain_paiement:"15/07/2025",ca_genere:1000,tickets:0},
    {id:3,societe:"BTP Abidjan Pro",secteur:"btp",pays:"Côte d'Ivoire",contact:"Jean-Claude Kofi",email:"jck@btpabidjan.ci",tel:"+225 07 456 78 90",plan:"Enterprise",prix:0,maintenance:2000,modules:["CRM","Devis","Compta","Planning","Stock","RH","Formation"],statut:"actif",date_debut:"01/01/2025",prochain_paiement:"01/07/2025",ca_genere:12000,tickets:3},
    {id:4,societe:"Hotel Riad Marrakech",secteur:"hotel",pays:"Maroc",contact:"Fatima Benali",email:"fatima@riadmarrakech.ma",tel:"+212 6 12 34 56",plan:"Business",prix:12000,maintenance:1000,modules:["CRM","Devis","Compta","Planning","RH","NPS"],statut:"en_attente",date_debut:"01/06/2025",prochain_paiement:"—",ca_genere:0,tickets:0},
  ]);

  const totalCA=clientsSaaS.reduce((s,c)=>s+c.ca_genere,0);
  const totalMaintenance=clientsSaaS.filter(c=>c.statut==="actif").reduce((s,c)=>s+c.maintenance,0);
  const actifs=clientsSaaS.filter(c=>c.statut==="actif").length;

  const PLANS={
    Starter:{prix:"5 000€",maintenance:"500€/mois",desc:"Jusqu'à 50 clients · Modules essentiels"},
    Business:{prix:"12 000€",maintenance:"1 000€/mois",desc:"Jusqu'à 200 clients · Tous modules"},
    Enterprise:{prix:"Sur devis",maintenance:"2 000€+/mois",desc:"Illimité · White-label · Support dédié"},
  };

  const TABS=[
    {id:"clients",label:"🏢 Clients SaaS"},
    {id:"revenus",label:"💰 Revenus SaaS"},
    {id:"deployer",label:"🚀 Déployer"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {modal==="fiche"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.purple}44`,borderRadius:14,padding:24,width:520,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontSize:16,fontWeight:700}}>{selected.societe}</div>
                <div style={{fontSize:11,color:C.muted}}>{selected.secteur} · {selected.pays}</div>
                <Pill label={selected.statut==="actif"?"✅ Actif":"⏳ En attente"} color={selected.statut==="actif"?C.green:C.orange}/>
              </div>
              <Btn sm v="ghost" onClick={()=>setModal(null)}>✕</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {[["Plan",selected.plan,C.purple],["CA généré",fmt(selected.ca_genere,"EUR"),C.gold],["Maintenance",fmt(selected.maintenance,"EUR")+"/mois",C.green]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            <Card style={{padding:12,marginBottom:10}}>
              {[["📧",selected.email],["📱",selected.tel],["👤",selected.contact],["📅","Depuis le "+selected.date_debut],["🔄","Prochain paiement : "+selected.prochain_paiement]].map(([ico,v],i)=>(
                <div key={i} style={{display:"flex",gap:8,fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span>{ico}</span><span style={{color:C.muted}}>{v}</span></div>
              ))}
            </Card>
            <Card style={{padding:12,marginBottom:12}}>
              <div style={{fontSize:10,color:C.gold,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Modules actifs</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {selected.modules.map((m,i)=><Pill key={i} label={m} color={C.blue}/>)}
              </div>
            </Card>
            <div style={{display:"flex",gap:8}}>
              <Btn v="ghost" full onClick={()=>showToast(`📲 Message envoyé à ${selected.contact}`)}>📲 Contacter</Btn>
              <Btn v="red" sm onClick={()=>{setClientsSaaS(p=>p.map(x=>x.id===selected.id?{...x,statut:"suspendu"}:x));setModal(null);showToast(`⛔ Compte ${selected.societe} suspendu`,"#EF4444");}}>⛔ Suspendre</Btn>
            </div>
          </div>
        </div>
      )}

      <STitle sub="Vendre Tymeless OS · Clients SaaS · Revenus · White-label">🌍 Déploiement SaaS</STitle>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Clients actifs" val={actifs} color={C.blue}/>
        <KPI label="CA licences" val={fmt(totalCA,"EUR")} color={C.gold}/>
        <KPI label="Maintenance/mois" val={fmt(totalMaintenance,"EUR")} color={C.green}/>
        <KPI label="ARR projeté" val={fmt(totalMaintenance*12,"EUR")} color={C.purple}/>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {tab==="clients"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>showToast("+ Nouveau client SaaS ajouté")}>+ Nouveau client</Btn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {clientsSaaS.map((c,i)=>(
              <Card key={i} style={{cursor:"pointer",borderColor:`${c.statut==="actif"?C.purple:C.orange}33`}} onClick={()=>{setSelected(c);setModal("fiche");}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:42,height:42,borderRadius:8,background:`${C.purple}22`,border:`1px solid ${C.purple}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:C.purple}}>{c.societe[0]}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>{c.societe}</div>
                      <div style={{fontSize:10,color:C.muted}}>{c.secteur} · {c.pays} · {c.contact}</div>
                      <div style={{display:"flex",gap:5,marginTop:4}}>
                        <Pill label={`💎 ${c.plan}`} color={C.purple}/>
                        <Pill label={c.statut==="actif"?"✅ Actif":"⏳ En attente"} color={c.statut==="actif"?C.green:C.orange}/>
                        {c.tickets>0&&<Pill label={`🎫 ${c.tickets} ticket(s)`} color={C.red}/>}
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(c.maintenance,"EUR")}/mois</div>
                    <div style={{fontSize:10,color:C.muted}}>CA total : {fmt(c.ca_genere,"EUR")}</div>
                    <div style={{fontSize:10,color:C.muted}}>Prochain paiement : {c.prochain_paiement}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab==="revenus"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
            {[{t:"💎 Licences vendues",v:fmt(clientsSaaS.reduce((s,c)=>s+c.prix,0),"EUR"),s:"Total licences",c:C.gold},{t:"🔄 Maintenance mensuelle",v:fmt(totalMaintenance,"EUR")+"/mois",s:"Revenus récurrents",c:C.green},{t:"📈 ARR (Revenus annuels)",v:fmt(totalMaintenance*12,"EUR"),s:"Projection annuelle",c:C.purple}].map((k,i)=>(
              <Card key={i} style={{borderColor:`${k.c}44`,textAlign:"center"}}>
                <div style={{fontSize:12,fontWeight:600,color:k.c,marginBottom:4}}>{k.t}</div>
                <div style={{fontSize:24,fontWeight:700,color:k.c}}>{k.v}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:4}}>{k.s}</div>
              </Card>
            ))}
          </div>
          <Card>
            <CT>💰 Détail revenus par client</CT>
            <TH heads={["Société","Plan","Licence","Maintenance/mois","CA total","Statut"]} rows={clientsSaaS.map((c,i)=>(
              <tr key={i}>
                <Td><span style={{fontWeight:600}}>{c.societe}</span></Td>
                <Td><Pill label={c.plan} color={C.purple}/></Td>
                <Td><span style={{color:C.gold,fontWeight:600}}>{c.prix>0?fmt(c.prix,"EUR"):"Sur devis"}</span></Td>
                <Td><span style={{color:C.green,fontWeight:600}}>{fmt(c.maintenance,"EUR")}</span></Td>
                <Td><span style={{color:C.gold,fontWeight:700}}>{fmt(c.ca_genere,"EUR")}</span></Td>
                <Td><Pill label={c.statut==="actif"?"✅ Actif":"⏳ Attente"} color={c.statut==="actif"?C.green:C.orange}/></Td>
              </tr>
            ))}/>
          </Card>
        </div>
      )}

      {tab==="deployer"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
            {Object.entries(PLANS).map(([nom,p],i)=>(
              <Card key={i} style={{borderColor:nom==="Business"?`${C.gold}55`:C.border,textAlign:"center"}}>
                {nom==="Business"&&<div style={{textAlign:"center",marginBottom:8}}><Pill label="⭐ Populaire" color={C.gold}/></div>}
                <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,marginBottom:4}}>{nom}</div>
                <div style={{fontSize:22,fontWeight:700,color:C.gold,marginBottom:2}}>{p.prix}</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:8}}>+ {p.maintenance}</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.6}}>{p.desc}</div>
                <Btn v={nom==="Business"?"gold":"ghost"} full onClick={()=>showToast(`🚀 Déploiement ${nom} initié !`)}>🚀 Déployer</Btn>
              </Card>
            ))}
          </div>
          <Card style={{borderColor:`${C.teal}44`}}>
            <CT>✅ Processus de déploiement</CT>
            {[["1","Signature contrat SaaS","Client signe le contrat généré automatiquement","📄"],["2","Paiement licence","Paiement reçu via Wallet Tymeless","💳"],["3","Configuration","Secteur, modules, couleurs, logo configurés","⚙️"],["4","Accès créé","Login admin créé et envoyé par WhatsApp","🔑"],["5","Formation incluse","Session de formation 2h avec le client","🎓"],["6","Go live !","Dashboard actif — client opérationnel","🚀"]].map(([n,t,d,ico],i)=>(
              <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}22`,alignItems:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:`${C.teal}22`,border:`1px solid ${C.teal}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.teal,flexShrink:0}}>{n}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{ico} {t}</div>
                  <div style={{fontSize:11,color:C.muted}}>{d}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
};

const PageAPI=()=>{
  const [tab,setTab]=useState("docs");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};

  const [cles,setCles]=useState([
    {id:1,nom:"Production",cle:"tym_live_xK9...mN4",permissions:["read","write"],appels:4821,limite:10000,statut:"active"},
    {id:2,nom:"Développement",cle:"tym_test_aB3...zP7",permissions:["read"],appels:234,limite:1000,statut:"active"},
  ]);

  const ENDPOINTS=[
    {method:"GET",path:"/api/v1/clients",desc:"Liste tous les clients"},
    {method:"POST",path:"/api/v1/devis",desc:"Créer un nouveau devis"},
    {method:"GET",path:"/api/v1/missions",desc:"Liste les missions"},
    {method:"POST",path:"/api/v1/paiements",desc:"Déclencher un paiement"},
    {method:"GET",path:"/api/v1/stock",desc:"État du stock"},
    {method:"POST",path:"/api/v1/notifications",desc:"Envoyer une notification"},
    {method:"GET",path:"/api/v1/analytics",desc:"Données analytiques"},
    {method:"POST",path:"/api/v1/whatsapp",desc:"Envoyer un WhatsApp"},
  ];

  const METHOD_COLOR={"GET":C.green,"POST":C.blue,"PUT":C.orange,"DELETE":C.red};

  const TABS=[
    {id:"docs",label:"📖 Documentation"},
    {id:"cles",label:"🔑 Clés API"},
    {id:"webhooks",label:"🔔 Webhooks"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      <STitle sub="Documentation · Clés API · Webhooks · Intégrations">◇ API Tymeless</STitle>

      <Card style={{marginBottom:14,borderColor:`${C.blue}44`,background:`linear-gradient(135deg,${C.card},#001A28)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:C.blue,marginBottom:4}}>🔌 API REST Tymeless OS</div>
            <div style={{fontSize:12,color:C.muted}}>Base URL : <span style={{fontFamily:"monospace",color:C.teal}}>https://api.tymeless.fr/v1</span></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Pill label="✅ Opérationnel" color={C.green}/>
            <Pill label="v1.0" color={C.blue}/>
          </div>
        </div>
      </Card>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {tab==="docs"&&(
        <div>
          <Card style={{marginBottom:14}}>
            <CT>📖 Endpoints disponibles</CT>
            {ENDPOINTS.map((e,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div style={{background:`${METHOD_COLOR[e.method]}22`,border:`1px solid ${METHOD_COLOR[e.method]}44`,borderRadius:5,padding:"3px 8px",fontSize:10,fontWeight:700,color:METHOD_COLOR[e.method],width:50,textAlign:"center",flexShrink:0}}>{e.method}</div>
                <span style={{fontFamily:"monospace",fontSize:12,color:C.teal,flex:1}}>{e.path}</span>
                <span style={{fontSize:11,color:C.muted}}>{e.desc}</span>
                <Btn sm v="ghost" onClick={()=>showToast(`📋 Endpoint ${e.path} copié`)}>📋</Btn>
              </div>
            ))}
          </Card>
          <Card>
            <CT>🔐 Authentification</CT>
            <div style={{background:"#0A0A1A",borderRadius:8,padding:14,fontFamily:"monospace",fontSize:12,color:"#25D366",lineHeight:2}}>
              <div style={{color:"#888"}}>// Header requis sur chaque requête</div>
              <div><span style={{color:"#4B7BFF"}}>Authorization</span>: Bearer <span style={{color:"#C9A84C"}}>tym_live_xK9...mN4</span></div>
              <div><span style={{color:"#4B7BFF"}}>Content-Type</span>: <span style={{color:"#C9A84C"}}>application/json</span></div>
            </div>
          </Card>
        </div>
      )}

      {tab==="cles"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <Btn v="gold" onClick={()=>{setCles(p=>[...p,{id:Date.now(),nom:"Nouvelle clé",cle:"tym_"+Math.random().toString(36).substr(2,20),permissions:["read"],appels:0,limite:1000,statut:"active"}]);showToast("✓ Nouvelle clé générée !");}}>+ Générer clé</Btn>
          </div>
          {cles.map((c,i)=>(
            <Card key={i} style={{marginBottom:12,borderColor:`${C.teal}33`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{c.nom}</div>
                  <div style={{fontFamily:"monospace",fontSize:11,color:C.teal,background:C.card2,padding:"4px 10px",borderRadius:5,display:"inline-block"}}>{c.cle}</div>
                </div>
                <div style={{display:"flex",gap:5}}>
                  {c.permissions.map((p,j)=><Pill key={j} label={p} color={p==="write"?C.orange:C.green}/>)}
                  <Pill label={c.statut==="active"?"✅ Active":"❌ Inactive"} color={c.statut==="active"?C.green:C.red}/>
                </div>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <span style={{color:C.muted}}>Appels API</span>
                  <span style={{color:C.text}}>{c.appels.toLocaleString()} / {c.limite.toLocaleString()}</span>
                </div>
                <div style={{height:4,borderRadius:2,background:C.border}}><div style={{height:"100%",width:`${(c.appels/c.limite)*100}%`,background:C.teal,borderRadius:2}}/></div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <Btn sm v="ghost" onClick={()=>showToast("📋 Clé copiée !")}>📋 Copier</Btn>
                <Btn sm v="red" onClick={()=>{setCles(p=>p.filter(x=>x.id!==c.id));showToast("Clé supprimée","#EF4444");}}>🗑 Révoquer</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab==="webhooks"&&(
        <Card>
          <CT>🔔 Webhooks — Événements temps réel</CT>
          <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Recevez des notifications automatiques dans votre système à chaque événement Tymeless.</div>
          {[["devis.valide","Devis validé par Curtiss",C.green],["paiement.recu","Paiement reçu",C.gold],["mission.terminee","Mission terminée",C.blue],["client.nouveau","Nouveau client créé",C.teal],["stock.critique","Stock en rupture critique",C.red],["commission.due","Commission partenaire due",C.orange]].map(([evt,desc,c],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
              <div>
                <div style={{fontFamily:"monospace",fontSize:11,color:c}}>{evt}</div>
                <div style={{fontSize:10,color:C.muted}}>{desc}</div>
              </div>
              <Btn sm v="ghost" onClick={()=>showToast(`📋 Webhook ${evt} copié`)}>📋 Copier</Btn>
            </div>
          ))}
          <div style={{marginTop:12}}>
            <Btn v="blue" onClick={()=>showToast("🔔 URL webhook configurée !")}>+ Configurer URL webhook</Btn>
          </div>
        </Card>
      )}
    </div>
  );
};

const PageSettings=({plan,onPlanChange,profil,setProfil,secteurKey,setSecteurKey})=>{
  const [tab,setTab]=useState("entreprise");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};

  const [entreprise,setEntreprise]=useState({
    nom:"Tymeless Conciergerie",
    slogan:"Excellence & Discrétion",
    email:"contact@tymeless.fr",
    tel:"+33 1 23 45 67 89",
    adresse:"75 Avenue des Champs-Élysées, Paris",
    pays:"France",
    siret:"123 456 789 00012",
    tva:"FR12345678900",
    site:"www.tymeless.fr",
    devise:"EUR",
    langue:"Français",
    couleur_principale:"#C9A84C",
    logo:"🏠",
  });

  const [securite,setSecurite]=useState({
    twofa:false,
    session_timeout:30,
    notif_connexion:true,
  });

  const [integrations,setIntegrations]=useState([
    {id:"stripe",nom:"Stripe",ico:"💳",desc:"Paiements carte Europe",statut:"connecté",color:C.purple},
    {id:"flutterwave",nom:"Flutterwave",ico:"🌍",desc:"Paiements Afrique",statut:"connecté",color:C.orange},
    {id:"whatsapp",nom:"WhatsApp Business",ico:"📲",desc:"Messages automatiques",statut:"connecté",color:"#25D366"},
    {id:"relevance",nom:"RelevanceAI",ico:"🤖",desc:"Bots vocaux & automation",statut:"non_connecté",color:C.blue},
    {id:"supabase",nom:"Supabase",ico:"🗄️",desc:"Base de données live",statut:"non_connecté",color:C.green},
    {id:"zapier",nom:"Zapier / Make",ico:"⚡",desc:"Automatisations externes",statut:"non_connecté",color:C.orange},
    {id:"google",nom:"Google My Business",ico:"🔍",desc:"Avis Google",statut:"connecté",color:C.blue},
    {id:"sendgrid",nom:"SendGrid",ico:"📧",desc:"Emails automatiques",statut:"non_connecté",color:C.teal},
  ]);

  const [modules_actifs,setModules]=useState([
    {id:"crm",nom:"CRM Clients",actif:true,prix:0},
    {id:"devis",nom:"Devis",actif:true,prix:0},
    {id:"compta",nom:"Comptabilité",actif:true,prix:0},
    {id:"planning",nom:"Planning",actif:true,prix:0},
    {id:"stock",nom:"Stock",actif:true,prix:0},
    {id:"rh",nom:"RH & Équipe",actif:true,prix:19},
    {id:"formation",nom:"Formation",actif:false,prix:29},
    {id:"club",nom:"Club Tymeless",actif:true,prix:39},
    {id:"prospection",nom:"Prospection Auto",actif:true,prix:49},
    {id:"investissement",nom:"Investissement IA",actif:false,prix:19},
  ]);

  const TABS=[
    {id:"entreprise",label:"🏢 Entreprise"},
    {id:"plan",label:"💎 Mon plan"},
    {id:"integrations",label:"🔌 Intégrations"},
    {id:"modules",label:"⊟ Modules"},
    {id:"securite",label:"🔒 Sécurité"},
    {id:"rgpd",label:"🌍 RGPD & Export"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      <STitle sub="Entreprise · Plan · Intégrations · Sécurité · RGPD">⚙️ Paramètres</STitle>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── ENTREPRISE ── */}
      {tab==="entreprise"&&(
        <div>
          <Card style={{marginBottom:14}}>
            <CT>🏢 Informations de votre entreprise</CT>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                ["Nom de l'entreprise","nom","text"],
                ["Slogan","slogan","text"],
                ["Email professionnel","email","email"],
                ["Téléphone","tel","text"],
                ["Site web","site","text"],
                ["Adresse","adresse","text"],
                ["SIRET","siret","text"],
                ["Numéro TVA","tva","text"],
              ].map(([l,k,t])=>(
                <div key={k}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div>
                  <Inp type={t} value={entreprise[k]} onChange={e=>setEntreprise(p=>({...p,[k]:e.target.value}))} style={{width:"100%"}}/>
                </div>
              ))}
              <div>
                <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Pays</div>
                <Sel value={entreprise.pays} onChange={e=>setEntreprise(p=>({...p,pays:e.target.value}))} options={["France","Maroc","Sénégal","Côte d'Ivoire","Algérie","UAE","Cameroun","Autre"].map(v=>({v,l:v}))} style={{width:"100%"}}/>
              </div>
              <div>
                <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Devise principale</div>
                <Sel value={entreprise.devise} onChange={e=>setEntreprise(p=>({...p,devise:e.target.value}))} options={["EUR","XOF","MAD","USD","AED","GBP"].map(v=>({v,l:v}))} style={{width:"100%"}}/>
              </div>
            </div>
            <div style={{marginTop:14}}><Btn v="gold" onClick={()=>showToast("✓ Informations sauvegardées !")}>💾 Sauvegarder</Btn></div>
          </Card>

          <Card style={{borderColor:`${C.purple}44`}}>
            <CT>🎨 Personnalisation White-label</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Personnalisez les couleurs et le logo de votre dashboard.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div>
                <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Emoji / Logo</div>
                <Inp value={entreprise.logo} onChange={e=>setEntreprise(p=>({...p,logo:e.target.value}))} style={{width:"100%",fontSize:24,textAlign:"center"}}/>
              </div>
              <div>
                <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Couleur principale</div>
                <Inp type="color" value={entreprise.couleur_principale} onChange={e=>setEntreprise(p=>({...p,couleur_principale:e.target.value}))} style={{width:"100%",height:40,padding:2}}/>
              </div>
              <div>
                <div style={{fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Secteur d'activité</div>
                <Sel value={secteurKey||"conciergerie"} onChange={e=>{setSecteurKey&&setSecteurKey(e.target.value);setProfil&&setProfil(PROFILS_SECTEURS[e.target.value]);}} options={Object.entries(PROFILS_SECTEURS).map(([k,v])=>({v:k,l:v.label}))} style={{width:"100%"}}/>
              </div>
            </div>
            <div style={{marginTop:14}}><Btn v="purple" onClick={()=>showToast("🎨 Personnalisation appliquée !")}>Appliquer</Btn></div>
          </Card>
        </div>
      )}

      {/* ── PLAN ── */}
      {tab==="plan"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.gold}44`,background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Plan actuel</div>
                <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:24,fontWeight:700,color:C.gold}}>{(PLANS[plan]||PLANS.owner).nom}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:4}}>{plan==="owner"?"Accès illimité — Propriétaire":"Abonnement actif"}</div>
              </div>
              <div style={{fontSize:48}}>👑</div>
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {Object.entries(PLANS).filter(([k])=>k!=="owner").map(([k,p])=>(
              <Card key={k} style={{borderColor:plan===k?`${C.gold}88`:C.border,textAlign:"center"}}>
                {plan===k&&<Pill label="✓ Actuel" color={C.gold}/>}
                <div style={{fontSize:15,fontWeight:700,color:C.text,margin:"8px 0"}}>{p.nom}</div>
                <div style={{fontSize:22,fontWeight:700,color:C.gold,marginBottom:8}}>
                  {k==="starter"?"29€":k==="business"?"99€":k==="enterprise"?"150€":"—"}<span style={{fontSize:11,color:C.muted}}>/mois</span>
                </div>
                {plan!==k&&<Btn v="gold" full sm onClick={()=>{onPlanChange&&onPlanChange(k);showToast(`✓ Plan ${p.nom} activé ！`);}}>Changer</Btn>}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── INTÉGRATIONS ── */}
      {tab==="integrations"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            {integrations.map((integ,i)=>(
              <Card key={i} style={{borderColor:`${integ.statut==="connecté"?integ.color:C.border}33`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:38,height:38,borderRadius:8,background:`${integ.color}22`,border:`1px solid ${integ.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{integ.ico}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>{integ.nom}</div>
                      <div style={{fontSize:10,color:C.muted}}>{integ.desc}</div>
                    </div>
                  </div>
                  <Pill label={integ.statut==="connecté"?"✅ Connecté":"○ Non connecté"} color={integ.statut==="connecté"?C.green:C.muted}/>
                </div>
                <div style={{display:"flex",gap:7}}>
                  {integ.statut==="connecté"?(
                    <>
                      <Btn sm v="ghost" onClick={()=>showToast(`⚙️ Paramètres ${integ.nom} ouverts`)}>Configurer</Btn>
                      <Btn sm v="red" onClick={()=>{setIntegrations(p=>p.map(x=>x.id===integ.id?{...x,statut:"non_connecté"}:x));showToast(`${integ.nom} déconnecté`,"#EF4444");}}>Déconnecter</Btn>
                    </>
                  ):(
                    <Btn sm v="gold" full onClick={()=>{setIntegrations(p=>p.map(x=>x.id===integ.id?{...x,statut:"connecté"}:x));showToast(`✅ ${integ.nom} connecté !`);}}>🔌 Connecter</Btn>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── MODULES ── */}
      {tab==="modules"&&(
        <div>
          <Card>
            <CT>⊟ Modules actifs</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Activez ou désactivez les modules selon vos besoins.</div>
            {modules_actifs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:C.text}}>{m.nom}</div>
                  <div style={{fontSize:10,color:C.muted}}>{m.prix===0?"Inclus dans votre plan":`+${m.prix}€/mois`}</div>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  {m.prix>0&&!m.actif&&<span style={{fontSize:11,color:C.gold}}>+{m.prix}€/mois</span>}
                  <div onClick={()=>{setModules(p=>p.map(x=>x.id===m.id?{...x,actif:!x.actif}:x));showToast(m.actif?`Module ${m.nom} désactivé`:`✅ Module ${m.nom} activé !`);}} style={{width:40,height:22,borderRadius:11,background:m.actif?C.green:C.border,cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
                    <div style={{position:"absolute",top:3,left:m.actif?20:3,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── SÉCURITÉ ── */}
      {tab==="securite"&&(
        <div>
          <Card style={{marginBottom:14}}>
            <CT>🔒 Sécurité du compte</CT>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div><div style={{fontSize:13,fontWeight:500}}>Double authentification (2FA)</div><div style={{fontSize:10,color:C.muted}}>Sécurisez votre compte avec une 2ème vérification</div></div>
                <div onClick={()=>setSecurite(p=>({...p,twofa:!p.twofa}))} style={{width:40,height:22,borderRadius:11,background:securite.twofa?C.green:C.border,cursor:"pointer",position:"relative",flexShrink:0}}>
                  <div style={{position:"absolute",top:3,left:securite.twofa?20:3,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
                <div><div style={{fontSize:13,fontWeight:500}}>Alertes de connexion</div><div style={{fontSize:10,color:C.muted}}>Notification WhatsApp à chaque connexion</div></div>
                <div onClick={()=>setSecurite(p=>({...p,notif_connexion:!p.notif_connexion}))} style={{width:40,height:22,borderRadius:11,background:securite.notif_connexion?C.green:C.border,cursor:"pointer",position:"relative",flexShrink:0}}>
                  <div style={{position:"absolute",top:3,left:securite.notif_connexion?20:3,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <Btn v="ghost" onClick={()=>showToast("📧 Email de réinitialisation envoyé")}>🔑 Changer mot de passe</Btn>
              <Btn v="ghost" onClick={()=>showToast("📲 Code 2FA envoyé sur WhatsApp")}>📲 Tester 2FA</Btn>
            </div>
          </Card>

          <Card style={{borderColor:`${C.red}44`}}>
            <CT>⚠️ Zone dangereuse</CT>
            <div style={{display:"flex",gap:10}}>
              <Btn v="ghost" onClick={()=>showToast("📦 Export données lancé — reçu par email sous 24h")}>📦 Exporter mes données</Btn>
              <Btn v="red" onClick={()=>showToast("Suppression annulée — Contactez le support","#EF4444")}>🗑 Supprimer le compte</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* ── RGPD ── */}
      {tab==="rgpd"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.blue}44`}}>
            <CT>🌍 Conformité RGPD</CT>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:14}}>
              Tymeless OS est conforme au Règlement Général sur la Protection des Données (RGPD). Toutes vos données sont stockées en Europe et ne sont jamais revendues.
            </div>
            {[["Données stockées","Europe (France)"],["Responsable traitement","Tymeless OS SAS"],["DPO","dpo@tymeless.fr"],["Durée conservation","3 ans après fin contrat"],["Chiffrement","AES-256"]].map(([l,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"6px 0",borderBottom:`1px solid ${C.border}22`}}>
                <span style={{color:C.muted}}>{l}</span>
                <span style={{fontWeight:600,color:C.text}}>{v}</span>
              </div>
            ))}
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{ico:"📦",t:"Exporter mes données",d:"Téléchargez toutes vos données au format JSON/CSV",btn:"Exporter",c:C.blue},{ico:"🗑",t:"Supprimer mes données",d:"Suppression définitive de toutes vos données",btn:"Demander",c:C.red},{ico:"📜",t:"Politique de confidentialité",d:"Consultez notre politique complète",btn:"Voir",c:C.muted},{ico:"✉️",t:"Contacter le DPO",d:"Pour toute question relative à vos données",btn:"Contacter",c:C.green}].map((a,i)=>(
              <Card key={i} style={{padding:14}}>
                <div style={{fontSize:24,marginBottom:8}}>{a.ico}</div>
                <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:4}}>{a.t}</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:10}}>{a.d}</div>
                <Btn sm v="ghost" onClick={()=>showToast(`✓ Action : ${a.t}`)}>{a.btn}</Btn>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PageAdmin=()=>{
  const [tab,setTab]=useState("overview");
  const [toast,setToast]=useState(null);
  const showToast=(msg,c=C.green)=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);

  // ── DONNÉES GLOBALES TYMELESS ────────────────────────────
  const stats={
    // Tymeless Conciergerie
    missions_mois:23,ca_conciergerie:24380,clients_actifs:48,nps_moyen:4.8,
    // Tymeless OS SaaS
    saas_clients:4,saas_mrr:3500,saas_arr:42000,
    // Club Tymeless
    club_membres:6,club_abos:5*29,club_comm:1690,
    // Global
    wallet_solde:18420,charges_mois:6800,
  };

  const [comptesSaaS,setComptesSaaS]=useState([
    {id:1,societe:"Luxury Clean Monaco",secteur:"conciergerie",pays:"Monaco",plan:"Business",statut:"actif",mrr:1000,depuis:"01/03/2025",dernier_paiement:"01/05/2025",nb_users:3,modules_actifs:6,sante:98},
    {id:2,societe:"Prestige Services Dakar",secteur:"conciergerie",pays:"Sénégal",plan:"Starter",statut:"actif",mrr:500,depuis:"15/04/2025",dernier_paiement:"15/05/2025",nb_users:2,modules_actifs:4,sante:82},
    {id:3,societe:"BTP Abidjan Pro",secteur:"btp",pays:"Côte d'Ivoire",plan:"Enterprise",statut:"actif",mrr:2000,depuis:"01/01/2025",dernier_paiement:"01/05/2025",nb_users:8,modules_actifs:7,sante:74},
    {id:4,societe:"Hotel Riad Marrakech",secteur:"hotel",pays:"Maroc",plan:"Business",statut:"en_attente",mrr:0,depuis:"01/06/2025",dernier_paiement:"—",nb_users:0,modules_actifs:0,sante:0},
  ]);

  const [alertes]=useState([
    {type:"urgent",msg:"BTP Abidjan — 3 tickets support ouverts",module:"deploiement",time:"Il y a 2h"},
    {type:"money",msg:"Commission Club non payée — Nassim Belkacem — 2 400€",module:"partenaires",time:"Aujourd'hui"},
    {type:"urgent",msg:"Stock critique — Kit Yacht — 1/3 kits restants",module:"stock",time:"Il y a 3h"},
    {type:"info",msg:"Hotel Riad Marrakech — Compte en attente de validation",module:"deploiement",time:"Il y a 1j"},
    {type:"money",msg:"Renouvellement Club — Nassim Belkacem — dans 2 mois",module:"club",time:"Il y a 1j"},
  ]);

  const [revenus_hist]=useState([
    {mois:"Jan",conciergerie:18200,saas:2000,club:145},
    {mois:"Fév",conciergerie:19800,saas:2500,club:174},
    {mois:"Mar",conciergerie:21400,saas:3000,club:203},
    {mois:"Avr",conciergerie:22100,saas:3000,club:232},
    {mois:"Mai",conciergerie:24380,saas:3500,club:261},
  ]);

  const totalMRR=stats.saas_mrr+stats.club_abos;
  const totalRevenusMois=stats.ca_conciergerie+stats.saas_mrr+stats.club_abos+stats.club_comm;

  const analyserIA=async()=>{
    setAiLoading(true);
    try{
      const prompt=`Tu es le CEO de Tymeless. Analyse ces KPIs et donne 3 décisions stratégiques prioritaires.

TYMELESS CONCIERGERIE:
- CA ce mois: ${fmt(stats.ca_conciergerie,"EUR")}
- Missions: ${stats.missions_mois}
- Clients actifs: ${stats.clients_actifs}
- NPS: ${stats.nps_moyen}/5
- Charges: ${fmt(stats.charges_mois,"EUR")}
- Marge nette: ${fmt(stats.ca_conciergerie-stats.charges_mois,"EUR")}

TYMELESS OS SAAS:
- Clients: ${stats.saas_clients}
- MRR: ${fmt(stats.saas_mrr,"EUR")}
- ARR: ${fmt(stats.saas_arr,"EUR")}

CLUB TYMELESS:
- Membres: ${stats.club_membres}
- Revenus abos: ${fmt(stats.club_abos,"EUR")}/mois
- Commissions deals: ${fmt(stats.club_comm,"EUR")}

Donne 3 décisions concrètes et chiffrées pour maximiser la croissance globale ce mois.`;
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiResult(data.content?.[0]?.text||"Analyse non disponible");
    }catch(e){setAiResult("Erreur — Vérifiez la connexion");}
    setAiLoading(false);
  };

  const TABS=[
    {id:"overview",label:"👑 Vue globale"},
    {id:"comptes",label:"🏢 Comptes SaaS"},
    {id:"commissions",label:"💰 Commissions"},
    {id:"alertes",label:"🚨 Alertes"},
    {id:"ia",label:"🤖 IA Stratégie"},
  ];

  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.c,color:"#000",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}

      {/* MODAL COMPTE SAAS */}
      {modal==="compte"&&selected&&(
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16,overflowY:"auto"}}>
          <div style={{background:C.card,border:`1px solid ${C.purple}44`,borderRadius:14,padding:24,width:520,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontSize:16,fontWeight:700}}>{selected.societe}</div>
                <div style={{fontSize:11,color:C.muted}}>{selected.secteur} · {selected.pays}</div>
                <div style={{display:"flex",gap:5,marginTop:4}}>
                  <Pill label={`💎 ${selected.plan}`} color={C.purple}/>
                  <Pill label={selected.statut==="actif"?"✅ Actif":selected.statut==="suspendu"?"🚫 Suspendu":"⏳ Attente"} color={selected.statut==="actif"?C.green:selected.statut==="suspendu"?C.red:C.orange}/>
                </div>
              </div>
              <Btn sm v="ghost" onClick={()=>setModal(null)}>✕</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {[["MRR",fmt(selected.mrr,"EUR"),C.gold],["Utilisateurs",selected.nb_users,C.blue],["Santé",selected.sante+"%",selected.sante>=80?C.green:selected.sante>=50?C.orange:C.red]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            <Card style={{padding:12,marginBottom:12}}>
              {[["📅","Depuis le "+selected.depuis],["💳","Dernier paiement : "+selected.dernier_paiement],["📦",selected.modules_actifs+" modules actifs"]].map(([ico,v],i)=>(
                <div key={i} style={{display:"flex",gap:8,fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span>{ico}</span><span style={{color:C.muted}}>{v}</span></div>
              ))}
            </Card>
            {selected.sante<80&&(
              <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,marginBottom:12}}>
                <div style={{fontSize:11,color:C.orange}}>⚠️ Score santé faible — Ce client risque de churner. Contacter rapidement.</div>
              </div>
            )}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {selected.statut==="actif"?(
                <Btn v="red" onClick={()=>{setComptesSaaS(p=>p.map(x=>x.id===selected.id?{...x,statut:"suspendu"}:x));setModal(null);showToast(`🚫 ${selected.societe} suspendu`,"#EF4444");}}>🚫 Suspendre</Btn>
              ):(
                <Btn v="green" onClick={()=>{setComptesSaaS(p=>p.map(x=>x.id===selected.id?{...x,statut:"actif"}:x));setModal(null);showToast(`✅ ${selected.societe} réactivé`);}}>✅ Réactiver</Btn>
              )}
              <Btn v="ghost" onClick={()=>showToast(`📲 Message envoyé à ${selected.societe}`)}>📲 Contacter</Btn>
              <Btn v="red" sm onClick={()=>{setComptesSaaS(p=>p.filter(x=>x.id!==selected.id));setModal(null);showToast("Compte supprimé","#EF4444");}}>🗑 Supprimer</Btn>
            </div>
          </div>
        </div>
      )}

      {/* HEADER EXCLUSIF */}
      <div style={{background:`linear-gradient(135deg,${C.card},#1A0030)`,border:`1px solid ${C.gold}44`,borderRadius:14,padding:20,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:700,color:C.gold}}>👑 Espace Admin — Curtiss</div>
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>Centre de contrôle total · Tymeless OS + Tymeless Conciergerie</div>
          <div style={{fontSize:10,color:C.gold,marginTop:2}}>🔒 Accès exclusif Owner — Vous seul avez accès à cette vue</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:C.muted}}>Revenus totaux ce mois</div>
          <div style={{fontSize:32,fontWeight:700,color:C.gold}}>{fmt(totalRevenusMois,"EUR")}</div>
          <div style={{fontSize:10,color:C.muted}}>Conciergerie + SaaS + Club</div>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* ── VUE GLOBALE ── */}
      {tab==="overview"&&(
        <div>
          {/* 3 activités */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
            {[
              {titre:"🏠 Tymeless Conciergerie",kpis:[["CA ce mois",fmt(stats.ca_conciergerie,"EUR"),C.gold],["Missions",stats.missions_mois,C.blue],["Clients actifs",stats.clients_actifs,C.green],["NPS","★ "+stats.nps_moyen,C.gold]],c:C.gold},
              {titre:"💻 Tymeless OS SaaS",kpis:[["Clients SaaS",stats.saas_clients,C.blue],["MRR",fmt(stats.saas_mrr,"EUR"),C.green],["ARR",fmt(stats.saas_arr,"EUR"),C.gold],["Marge","~85%",C.green]],c:C.purple},
              {titre:"🌐 Club Tymeless",kpis:[["Membres actifs",stats.club_membres,C.teal],["Abonnements",fmt(stats.club_abos,"EUR"),C.gold],["Commissions",fmt(stats.club_comm,"EUR"),C.green],["Total Club",fmt(stats.club_abos+stats.club_comm,"EUR"),C.purple]],c:C.teal},
            ].map((bloc,i)=>(
              <Card key={i} style={{borderColor:`${bloc.c}44`,background:`linear-gradient(135deg,${C.card},${bloc.c}08)`}}>
                <div style={{fontSize:13,fontWeight:700,color:bloc.c,marginBottom:10}}>{bloc.titre}</div>
                {bloc.kpis.map(([l,v,c],j)=>(
                  <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                    <span style={{color:C.muted}}>{l}</span>
                    <span style={{fontWeight:700,color:c}}>{v}</span>
                  </div>
                ))}
              </Card>
            ))}
          </div>

          {/* KPIs financiers globaux */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            <KPI label="Revenus totaux mois" val={fmt(totalRevenusMois,"EUR")} color={C.gold}/>
            <KPI label="Charges mois" val={fmt(stats.charges_mois,"EUR")} color={C.red}/>
            <KPI label="Marge nette" val={fmt(totalRevenusMois-stats.charges_mois,"EUR")} color={C.green}/>
            <KPI label="Wallet solde" val={fmt(stats.wallet_solde,"EUR")} color={C.teal}/>
          </div>

          {/* Évolution revenus */}
          <Card style={{marginBottom:14}}>
            <CT>📈 Évolution revenus — 5 derniers mois</CT>
            {revenus_hist.map((r,i)=>{
              const total=r.conciergerie+r.saas+r.club;
              const max=revenus_hist.reduce((s,x)=>Math.max(s,x.conciergerie+x.saas+x.club),0);
              return(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                    <span style={{color:C.muted}}>{r.mois}</span>
                    <div style={{display:"flex",gap:12}}>
                      <span style={{color:C.gold}}>Conc. {fmt(r.conciergerie,"EUR")}</span>
                      <span style={{color:C.purple}}>SaaS {fmt(r.saas,"EUR")}</span>
                      <span style={{color:C.teal}}>Club {fmt(r.club,"EUR")}</span>
                      <span style={{fontWeight:700,color:C.text}}>= {fmt(total,"EUR")}</span>
                    </div>
                  </div>
                  <div style={{height:6,borderRadius:3,background:C.border,display:"flex",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(r.conciergerie/max)*100}%`,background:C.gold}}/>
                    <div style={{height:"100%",width:`${(r.saas/max)*100}%`,background:C.purple}}/>
                    <div style={{height:"100%",width:`${(r.club/max)*100}%`,background:C.teal}}/>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Alertes prioritaires */}
          {alertes.filter(a=>a.type==="urgent").length>0&&(
            <Card style={{borderColor:`${C.red}44`,background:`${C.red}06`}}>
              <CT>🚨 Alertes urgentes</CT>
              {alertes.filter(a=>a.type==="urgent").map((a,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.text}}>{a.msg}</span>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:10,color:C.muted}}>{a.time}</span>
                    <Btn sm v="red" onClick={()=>showToast("✓ Alerte traitée")}>Traiter</Btn>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* ── COMPTES SAAS ── */}
      {tab==="comptes"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            <KPI label="Comptes actifs" val={comptesSaaS.filter(c=>c.statut==="actif").length} color={C.green}/>
            <KPI label="MRR total" val={fmt(comptesSaaS.reduce((s,c)=>s+c.mrr,0),"EUR")} color={C.gold}/>
            <KPI label="En attente" val={comptesSaaS.filter(c=>c.statut==="en_attente").length} color={C.orange}/>
            <KPI label="Santé moy." val={Math.round(comptesSaaS.filter(c=>c.sante>0).reduce((s,c)=>s+c.sante,0)/comptesSaaS.filter(c=>c.sante>0).length)+"%"} color={C.teal}/>
          </div>
          <Card>
            <CT>🏢 Tous les comptes Tymeless OS</CT>
            <TH heads={["Société","Secteur","Pays","Plan","MRR","Utilisateurs","Santé","Statut","Actions"]} rows={comptesSaaS.map((c,i)=>(
              <tr key={i}>
                <Td><span style={{fontWeight:600}}>{c.societe}</span></Td>
                <Td><Pill label={c.secteur} color={C.blue}/></Td>
                <Td><span style={{fontSize:11,color:C.muted}}>{c.pays}</span></Td>
                <Td><Pill label={c.plan} color={C.purple}/></Td>
                <Td><span style={{fontWeight:700,color:C.gold}}>{c.mrr>0?fmt(c.mrr,"EUR"):"—"}</span></Td>
                <Td><span style={{color:C.blue}}>{c.nb_users}</span></Td>
                <Td>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{height:4,width:40,borderRadius:2,background:C.border}}><div style={{height:"100%",width:c.sante+"%",background:c.sante>=80?C.green:c.sante>=50?C.orange:C.red,borderRadius:2}}/></div>
                    <span style={{fontSize:10,color:c.sante>=80?C.green:c.sante>=50?C.orange:C.red}}>{c.sante}%</span>
                  </div>
                </Td>
                <Td><Pill label={c.statut==="actif"?"✅ Actif":c.statut==="suspendu"?"🚫 Suspendu":"⏳ Attente"} color={c.statut==="actif"?C.green:c.statut==="suspendu"?C.red:C.orange}/></Td>
                <Td>
                  <div style={{display:"flex",gap:4}}>
                    <Btn sm v="blue" onClick={()=>{setSelected(c);setModal("compte");}}>👁</Btn>
                    {c.statut==="actif"?<Btn sm v="red" onClick={()=>{setComptesSaaS(p=>p.map(x=>x.id===c.id?{...x,statut:"suspendu"}:x));showToast(`🚫 ${c.societe} suspendu`,"#EF4444");}}>🚫</Btn>
                    :<Btn sm v="green" onClick={()=>{setComptesSaaS(p=>p.map(x=>x.id===c.id?{...x,statut:"actif"}:x));showToast(`✅ ${c.societe} réactivé`);}}>✅</Btn>}
                  </div>
                </Td>
              </tr>
            ))}/>
          </Card>
        </div>
      )}

      {/* ── COMMISSIONS ── */}
      {tab==="commissions"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.gold}44`,background:`linear-gradient(135deg,${C.card},#1A1400)`}}>
            <CT>💰 Commissions Tymeless — Ce mois</CT>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
              {[["🤝 Deals Club (10%)",fmt(stats.club_comm,"EUR"),C.teal],["💻 Abonnements SaaS",fmt(stats.saas_mrr,"EUR"),C.purple],["🌐 Abonnements Club",fmt(stats.club_abos,"EUR"),C.gold],["📊 Total commissions",fmt(stats.club_comm+stats.saas_mrr+stats.club_abos,"EUR"),C.green]].map(([l,v,c],i)=>(
                <div key={i} style={{background:C.card2,border:`1px solid ${c}22`,borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card>
              <CT>💼 Commissions deals Club (10%)</CT>
              {[{m:"Sofia Riad",deal:"Décoration appartement",montant:3400,comm:340},{m:"Ahmed Al-Rashid",deal:"Location Yacht",montant:8000,comm:800},{m:"Nassim Belkacem",deal:"Consulting BTP",montant:5500,comm:550}].map((d,i)=>(
                <div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:12,fontWeight:600}}>{d.m}</span>
                    <span style={{fontWeight:700,color:C.gold}}>+{fmt(d.comm,"EUR")}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted}}>
                    <span>{d.deal}</span><span>Deal: {fmt(d.montant,"EUR")}</span>
                  </div>
                </div>
              ))}
              <div style={{marginTop:8,fontWeight:700,color:C.gold,fontSize:12}}>Total : {fmt(stats.club_comm,"EUR")}</div>
            </Card>
            <Card>
              <CT>📈 Projection commissions annuelles</CT>
              {[["Deals Club (10%)",fmt(stats.club_comm*12,"EUR"),C.teal],["Abonnements SaaS",fmt(stats.saas_arr,"EUR"),C.purple],["Abonnements Club",fmt(stats.club_abos*12,"EUR"),C.gold],["Conciergerie",fmt(stats.ca_conciergerie*12,"EUR"),C.green],["TOTAL ANNUEL",fmt((stats.club_comm+stats.saas_mrr+stats.club_abos+stats.ca_conciergerie)*12,"EUR"),C.gold]].map(([l,v,c],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
                  <span style={{color:C.muted}}>{l}</span>
                  <span style={{fontWeight:i===4?700:500,color:c}}>{v}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── ALERTES ── */}
      {tab==="alertes"&&(
        <div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {alertes.map((a,i)=>{
              const tc={urgent:C.red,money:C.gold,info:C.blue};
              const ico={urgent:"🚨",money:"💰",info:"ℹ️"};
              return(
                <Card key={i} style={{borderColor:`${tc[a.type]}33`,background:`${tc[a.type]}06`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <span style={{fontSize:20}}>{ico[a.type]}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:C.text}}>{a.msg}</div>
                        <div style={{fontSize:10,color:C.muted}}>{a.time} · Module : {a.module}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:7}}>
                      <Btn sm v={a.type==="urgent"?"red":a.type==="money"?"gold":"ghost"} onClick={()=>showToast("✓ Alerte traitée")}>✓ Traiter</Btn>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── IA STRATÉGIE ── */}
      {tab==="ia"&&(
        <div>
          <Card style={{marginBottom:14,borderColor:`${C.purple}44`,background:`linear-gradient(135deg,${C.card},#12002A)`}}>
            <CT>🤖 IA Stratégie — Conseiller CEO</CT>
            <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.7}}>
              Claude analyse toutes vos activités (Conciergerie + SaaS + Club) et vous donne des décisions stratégiques concrètes pour maximiser vos revenus.
            </div>
            <Btn v="purple" onClick={analyserIA}>{aiLoading?"🤖 Analyse...":"🤖 Analyser et conseiller"}</Btn>
          </Card>
          {aiLoading&&<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:40,marginBottom:10}}>🤖</div><div style={{color:C.purple,fontWeight:600}}>Analyse stratégique en cours...</div><div style={{fontSize:11,color:C.muted,marginTop:4}}>Conciergerie · SaaS · Club · Commissions · Charges</div></Card>}
          {aiResult&&!aiLoading&&(
            <Card style={{borderColor:`${C.purple}44`}}>
              <CT>🤖 Recommandations CEO — Claude</CT>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiResult}</div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default function TymelessOS() {
  const [page,    setPage]    = useState("accueil");
  const [plan,    setPlan]    = useState("owner");
  const [devis,   setDevis]   = useState(INIT_DEVIS);
  const [notifs,  setNotifs]  = useState(INIT_NOTIFS);
  const [profil,  setProfil]  = useState(PROFIL_DEFAUT);
  const [secteurKey,setSecteurKey]=useState("conciergerie");

  const pending      = devis.filter(d=>d.statut==="en_attente").length;
  const stockAlerts  = STOCK.filter(s=>s.qte<s.min).length;
  const chatUnread   = MSGS_EQUIPE.filter(m=>!m.lu).length;
  const commDues     = PARTENAIRES.filter(p=>p.dues>0).length;
  const unreadNotifs = notifs.filter(n=>!n.lu).length;
  const walletAlert  = INIT_COMM.length+INIT_REMB.length+INIT_FOUR.length;

  const getBadge=(id)=>({devis:pending,crm:CRM_LEADS.filter(l=>l.etape==="Négociation").length,wallet:walletAlert,stock:stockAlerts,chat_eq:chatUnread,comm:commDues,notifs:unreadNotifs}[id]||0);

  const renderPage=()=>{
    if(page==="wallet")  return <PageWallet/>;
    if(page==="cartes")  return <PageCartes/>;
    if(page==="settings")return <PageSettings plan={plan} onPlanChange={setPlan} profil={profil} setProfil={setProfil} secteurKey={secteurKey} setSecteurKey={setSecteurKey}/>;

    if(!hasAccess(plan,page)){
      return <UpgradeWall page={page} planActuel={plan} onUpgrade={(newPlan)=>{setPlan(newPlan);setPage("overview");}}/>;
    }

    const PAGES={
      accueil:       <PageAccueil      devis={devis} setPage={setPage} notifs={notifs} profil={profil}/>,
      overview:      <PageOverview     devis={devis} setPage={setPage} notifs={notifs}/>,
      crm:           <PageCRM/>,
      devis:         <PageDevis        devis={devis} setDevis={setDevis}/>,
      investissement:<PageInvestissement/>,
      compta:        <PageCompta/>,
      tresorerie:    <PageTresorerie/>,
      analytique:    <PageAnalytique/>,
      clients:       <PageClients      setPage={setPage}/>,
      partenaires:   <PagePartenaires/>,
      annuaire:      <PageAnnuaire/>,
      wallet_membres:<PageWalletMembres/>,
      evenements:    <PageEvenements/>,
      scoring:       <PageScoring/>,
      equipe:        <PageEquipe/>,
      planning:      <PagePlanning profil={profil}/>,
      prospection:   <PageProspection/>,
      stock:         <PageStock profil={profil}/>,
      services:      <PageServices/>,
      chat:          <PageChat/>,
      notifications: <PageNotifications notifs={notifs} setNotifs={setNotifs}/>,
      signature:     <PageSignatures/>,
      formation:     <PageFormation profil={profil}/>,
      deals:         <PageDeals/>,
      deploiement:   <PageDeploiement/>,
      api:           <PageAPI/>,
      admin:         <PageAdmin/>,
    };
    return PAGES[page]||<div style={{color:C.muted,padding:20}}>Module en cours...</div>;
  };

  const planInfo=PLANS[plan]||PLANS.owner;

  return(
    <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",background:C.dark,minHeight:"100vh",color:C.text,display:"flex"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Cormorant+Garamond:wght@300;400;600;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:${C.dark};}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
        button:hover{opacity:0.82;}
        tr:hover td{background:${C.card2}33;}
      `}</style>

      <div style={{width:210,background:C.card,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",overflowY:"auto",flexShrink:0}}>
        <div style={{padding:"16px 15px 12px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:C.gold,letterSpacing:"0.12em",textTransform:"uppercase"}}>TYMELESS</div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.2em",textTransform:"uppercase",marginTop:2}}>OS · {planInfo.nom}</div>
          {/* SÉLECTEUR SECTEUR */}
          <div style={{marginTop:8}}>
            <div style={{fontSize:8,color:C.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.1em"}}>Secteur d'activité</div>
            <select value={secteurKey} onChange={e=>{setSecteurKey(e.target.value);setProfil(PROFILS_SECTEURS[e.target.value]);}} style={{width:"100%",background:C.card2,border:`1px solid ${profil.couleur}44`,borderRadius:5,padding:"4px 6px",color:profil.couleur,fontFamily:"inherit",fontSize:10,cursor:"pointer"}}>
              {Object.entries(PROFILS_SECTEURS).map(([k,v])=>(
                <option key={k} value={k} style={{background:C.card,color:C.text}}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{flex:1,padding:"8px 0",overflowY:"auto"}}>
          {NAV.map((g,gi)=>(
            <div key={gi}>
              <div style={{fontSize:9,color:C.muted,letterSpacing:"0.2em",textTransform:"uppercase",padding:"10px 13px 3px",marginTop:gi>0?4:0,fontWeight:600}}>{g.group}</div>
              {g.items.map(item=>{
                const badge=getBadge(item.badge||"");
                const active=page===item.id;
                const locked=!hasAccess(plan,item.id);
                return(
                  <button key={item.id} onClick={()=>setPage(item.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 13px",cursor:"pointer",color:active?C.gold:locked?C.muted+"88":C.muted,background:active?`${C.gold}0E`:"transparent",borderLeft:`2px solid ${active?C.gold:"transparent"}`,border:"none",width:"100%",textAlign:"left",fontSize:12,fontFamily:"inherit",letterSpacing:"0.02em",fontWeight:active?600:500,opacity:locked&&!active?0.7:1}}>
                    <span style={{fontSize:13,flexShrink:0}}>{locked?"🔒":item.icon}</span>
                    <span style={{flex:1}}>{item.label}</span>
                    {badge>0&&!locked&&<span style={{background:item.badge==="notifs"?C.gold:C.red,color:item.badge==="notifs"?C.dark:"#fff",borderRadius:20,padding:"0 6px",fontSize:8,fontWeight:700}}>{badge}</span>}
                    {locked&&<span style={{fontSize:8,color:C.gold+"88"}}>Pro</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{padding:"10px 13px",borderTop:`1px solid ${C.border}`}}>
          {(plan==="starter")&&(
            <button onClick={()=>setPage("settings")} style={{width:"100%",background:`${C.gold}11`,border:`1px solid ${C.gold}44`,borderRadius:8,padding:"8px 10px",cursor:"pointer",fontFamily:"inherit",marginBottom:8,textAlign:"center"}}>
              <div style={{fontSize:10,color:C.gold,fontWeight:700}}>✦ Passer Business Pro</div>
              <div style={{fontSize:9,color:C.muted}}>99€/mois — Tout débloquer</div>
            </button>
          )}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:`${planInfo.color}22`,border:`1px solid ${planInfo.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:planInfo.color,fontWeight:700}}>B</div>
            <div><div style={{fontSize:11,fontWeight:600,color:C.text}}>Curtiss</div><div style={{fontSize:9,color:planInfo.color}}>{planInfo.icon} {planInfo.nom}</div></div>
            {unreadNotifs>0&&<span style={{marginLeft:"auto",background:C.red,color:"#fff",borderRadius:20,padding:"0 6px",fontSize:9,fontWeight:700}}>{unreadNotifs}</span>}
          </div>
        </div>
      </div>

      <div style={{flex:1,padding:24,overflowY:"auto",maxHeight:"100vh"}}>
        {renderPage()}
      </div>
    </div>
  );
}
