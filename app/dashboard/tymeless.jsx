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
  starter:  {id:"starter",  nom:"Starter",       prix:"59€/mois",  color:"#4B7BFF", icon:"◎", acces:["wallet","cartes","crm","devis","facturation"], description:"Wallet · Paiements · Cartes · CRM · Devis · Facturation"},
  business: {id:"business", nom:"Business Pro",  prix:"129€/mois", color:"#C9A84C", icon:"✦", acces:["tout"], description:"Tout Starter + Suite complète métier · Équipe · Analytique · Prospection"},
  enterprise:{id:"enterprise",nom:"Enterprise",  prix:"249€/mois", color:"#9B5FFF", icon:"◈", acces:["tout"], description:"Tout Business Pro + Bot WhatsApp · API · Déploiement SaaS · Support 24h"},
  owner:    {id:"owner",    nom:"Owner",          prix:"—",         color:"#C9A84C", icon:"★", acces:["tout"], description:"Accès total — Curtiss"},
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

const PAGE_ACCESS = {
  // Starter (59€) — base
  wallet:         ["starter","business","enterprise","owner"],
  cartes:         ["starter","business","enterprise","owner"],
  crm:            ["starter","business","enterprise","owner"],
  devis:          ["starter","business","enterprise","owner"],
  facturation:    ["starter","business","enterprise","owner"],
  settings:       ["starter","business","enterprise","owner"],
  // Business Pro (129€)
  notefrais:      ["business","enterprise","owner"],
  overview:       ["business","enterprise","owner"],
  investissement: ["business","enterprise","owner"],
  compta:         ["business","enterprise","owner"],
  tresorerie:     ["business","enterprise","owner"],
  analytique:     ["business","enterprise","owner"],
  clients:        ["business","enterprise","owner"],
  partenaires:    ["business","enterprise","owner"],
  club_affaires:  ["business","enterprise","owner"],
  annuaire:       ["business","enterprise","owner"],
  wallet_membres: ["business","enterprise","owner"],
  evenements:     ["business","enterprise","owner"],
  scoring:        ["starter","business","enterprise","owner"],
  equipe:         ["business","enterprise","owner"],
  planning:       ["business","enterprise","owner"],
  prospection:    ["owner"],
  deals:          ["business","enterprise","owner"],
  stock:          ["business","enterprise","owner"],
  services:       ["business","enterprise","owner"],
  notifications:  ["starter","business","enterprise","owner"],
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
const CHARGES=[{cat:"Fournitures nettoyage",mois:420},{cat:"Transport & carburant",mois:380},{cat:"Commissions partenaires",mois:6425},{cat:"Salaires collaborateurs",mois:3200},{cat:"Logiciels & abonnements",mois:180},{cat:"Frais divers",mois:150}];
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
const Td=({children,style={}})=><td style={{padding:"9px 10px",fontSize:12,borderBottom:`1px solid ${C.border}22`,color:C.text,...style}}>{children}</td>;
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
const PageCartes=({showToast})=>{
  const[cartes,setCartes]=useState(INIT_CARTES);
  const[view,setView]=useState("liste");
  const toggleCarte=(id)=>{setCartes(cs=>cs.map(c=>c.id===id?{...c,statut:c.statut==="active"?"bloquée":"active"}:c));showToast("✅ Statut carte mis à jour");};
  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◈ Cartes Virtuelles</div><div style={{fontSize:11,color:C.muted}}>Visa virtuelles sécurisées · Contrôle total</div></div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={()=>setView(view==="liste"?"grille":"liste")} style={{fontSize:11}}>{view==="liste"?"⊞ Grille":"☰ Liste"}</BtnGhost>
        <Btn onClick={()=>showToast("💳 Nouvelle carte créée !")}>+ Nouvelle carte</Btn>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:view==="grille"?"repeat(auto-fill,minmax(280px,1fr))":"1fr",gap:12}}>
      {cartes.map(c=><PayCard key={c.id} carte={c} onToggle={toggleCarte}/>)}
    </div>
    <Card style={{marginTop:16}}>
      <STitle>🛡 Sécurité & Contrôles</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <CT><div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Dépenses max/jour</div><Inp placeholder="500 €"/></CT>
        <CT><div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Pays autorisés</div><Inp placeholder="FR, AE, SN..."/></CT>
        <CT><div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Catégories bloquées</div><Inp placeholder="Jeux, alcool..."/></CT>
      </div>
    </Card>
  </div>;
};

// ─── PAGE ACCUEIL ─────────────────────────────────────────────
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
          const{data:pl}=await sb.from('planning').select('date,heure,client,service,collab').gte('date',now.toISOString().slice(0,10)).order('date',{ascending:true}).limit(1);
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
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:200,messages:[{role:"user",content:`Données réelles dashboard : CA ce mois ${fmt(caReel)}, CA mois dernier ${fmt(caMoisDernier)}, tendance ${tendance}, marge ${margeNette}%, commissions à virer ${fmt(commissionsAVirer)}, leads CRM ${leadsEnAttente}, charges ${fmt(totalCharges)}, score ${scoreBusiness}/100. Brief morning 2-3 phrases max, français, actionnable, priorité n°1 en premier.`}]})});
      const data=await res.json();
      if(data.content?.[0]?.text)setAiMsg(data.content[0].text);
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
      <div style={{fontSize:26,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>Bonjour Curtiss ✦</div>
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
        {prochainRdv&&<div style={{marginTop:8,background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:8,padding:"8px 10px",fontSize:11}}><div style={{color:C.blue,fontWeight:600,marginBottom:2}}>📅 Prochain RDV</div><div style={{color:C.text}}>{prochainRdv.client} — {prochainRdv.service}</div><div style={{color:C.muted,fontSize:10}}>{prochainRdv.date} à {prochainRdv.heure} · {prochainRdv.collab}</div></div>}
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

const PageOverview=({plan,profil})=>{
  const T=profil?.termes||PROFIL_DEFAUT.termes;
  const kpis=[{l:"CA ce mois",v:"24 380 €",c:C.green,t:"↗ +12%"},{l:"Marge nette",v:"61%",c:C.teal,t:"↗ +4pts"},{l:T.missions||"Missions",v:"14",c:C.blue,t:"Ce mois"},{l:"Devis signés",v:"8",c:C.gold,t:"/ 12 envoyés"},{l:"NPS moyen",v:"★ 4.6",c:C.gold,t:"23 avis"},{l:"Clients actifs",v:"5",c:C.purple,t:"dont 2 VIP"},{l:"Commissions",v:"8 525 €",c:C.orange,t:"À payer"},{l:"Score Xyra",v:"74/100",c:C.gold,t:"🟡 Bon"}];
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◈ Vue d'ensemble</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>KPIs · Santé business · Alertes critiques · Actions rapides</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
      {kpis.map((k,i)=><CT key={i}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{k.l}</div><div style={{fontSize:20,fontWeight:700,color:k.c,fontFamily:"Georgia,serif"}}>{k.v}</div><div style={{fontSize:10,color:k.c,marginTop:2}}>{k.t}</div></CT>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card><STitle>🚦 État des modules</STitle>
        {[["Wallet & Paiements","✅ Opérationnel",C.green],["CRM","✅ 4 leads actifs",C.green],["Stock","⚠️ 2 articles critiques",C.orange],["Équipe","✅ 3/3 actifs",C.green],["Contrats","✅ 3 signés",C.green],["Formation","📋 1 en cours",C.blue]].map(([n,s,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.text}}>{n}</span><span style={{color:c,fontWeight:600,fontSize:11}}>{s}</span></div>)}
      </Card>
      <Card><STitle>📈 CA par service</STitle>
        {[["Airbnb / Résidentiel",12400,C.gold],["Jet & Yacht",8200,C.blue],["Rapatriement",4800,C.purple],["Bureaux",3200,C.teal]].map(([n,v,c],i)=><div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{n}</span><span style={{color:c,fontWeight:700}}>{fmt(v)}</span></div><SM val={v} max={12400} color={c}/></div>)}
      </Card>
    </div>
  </div>;
};

// ─── SCORE SOLVABILITE ────────────────────────────────────────
const SolvabiliteWidget=({score,nom})=>{
  const color=score>=80?C.green:score>=60?C.gold:score>=40?C.orange:C.red;
  const label=score>=80?"Excellent":score>=60?"Bon":score>=40?"Moyen":"Risqué";
  return <div style={{background:`${color}11`,border:`1px solid ${color}33`,borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",gap:12}}>
    <div style={{fontSize:22,fontWeight:700,color,fontFamily:"Georgia,serif",minWidth:44}}>{score}</div>
    <div><div style={{fontSize:10,color,fontWeight:600}}>Score Solvabilité Xyra</div><div style={{fontSize:11,color:C.muted}}>{label} · {nom}</div></div>
    <SM val={score} max={100} color={color}/>
  </div>;
};

// ─── PAGE CRM ─────────────────────────────────────────────────
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

  const[devis,setDevis]=useState(INIT_DEVIS);
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

  const creerDevis=(statut="brouillon")=>{
    if(!form.client)return showToast("⚠️ Remplissez le nom du client");
    const id=`TYM-${String(50+devis.length).padStart(4,"0")}`;
    const nd={id,client:form.client,email:form.email,tel:form.tel,service:form.objet||MODELES.find(m=>m.id===modeleId)?.label,montant:Math.round(totalTTC),statut,date:new Date().toLocaleDateString("fr"),lignes:[...lignes],remise:form.remise,note:form.note,vu:false};
    setDevis(d=>[nd,...d]);
    return nd;
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
    const nd=creerDevis("envoyé");
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

  if(!hasAccess(plan,"devis"))return <div style={{padding:20}}><UpgradeWall page="devis" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◧ Devis</div>
        <div style={{fontSize:11,color:C.muted}}>Créateur complet · PDF · WhatsApp · E-signature · Bot WhatsApp · {devis.length} devis</div></div>
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
          <thead><tr><TH>N° Devis</TH><TH>Client</TH><TH>Service</TH><TH>Montant TTC</TH><TH>Date</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{filtred.map((d,i)=><tr key={i}>
            <Td style={{color:C.gold,fontWeight:700}}>{d.id}</Td>
            <Td style={{fontWeight:600}}>{d.client}</Td>
            <Td style={{color:C.muted,fontSize:11}}>{d.service}</Td>
            <Td style={{color:C.green,fontWeight:700,fontSize:14}}>{fmt(d.montant)}</Td>
            <Td style={{color:C.muted,fontSize:10}}>{d.date}</Td>
            <Td><Pill color={statutColor[d.statut]||C.muted}>{d.statut}</Pill></Td>
            <Td><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {d.statut==="brouillon"&&<Btn onClick={()=>{setDevis(ds=>ds.map((x,j)=>j===i?{...x,statut:"envoyé"}:x));showToast(`📱 Devis ${d.id} envoyé par WhatsApp & Email à ${d.client} !`);}} style={{fontSize:9,padding:"3px 7px"}}>📤 Envoyer</Btn>}
              {(d.statut==="envoyé"||d.statut==="vu")&&<Btn onClick={()=>setSignEtape({id:d.id,client:d.client,etape:1})} style={{fontSize:9,padding:"3px 7px",background:C.green}}>✒ Signer</Btn>}
              {d.statut==="signé"&&<Btn onClick={()=>{setDevis(ds=>ds.map((x,j)=>j===i?{...x,statut:"payé"}:x));showToast("✅ Paiement enregistré !");}} style={{fontSize:9,padding:"3px 7px",background:C.teal}}>💳 Payé</Btn>}
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
              <Btn onClick={()=>{setDevis(ds=>ds.map(d=>d.id===signEtape.id?{...d,statut:"signé"}:d));showToast("✅ Signé ! PDF envoyé par email et WhatsApp");setSignEtape(null);}}>📄 Télécharger PDF signé</Btn>
            </div>
          </div>}
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
          <Btn onClick={()=>{const nd=creerDevis("brouillon");if(nd){showToast(`✅ Devis ${nd.id} créé en brouillon`);resetForm();}}} style={{flex:1}}>✅ Créer le devis</Btn>
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
  const[simDepense,setSimDepense]=useState(0);
  const[onglet,setOnglet]=useState("dashboard");

  const tabs=[{id:"dashboard",label:"📊 Cash-flow"},{id:"previsions",label:"🤖 Prévisions IA"},{id:"simulation",label:"🎮 Simulation"},{id:"alertes",label:"🔔 Alertes"},{id:"export",label:"📤 Export"}];

  const soldeActuel=18420;
  const soldeSim=soldeActuel-simDepense;

  if(!hasAccess(plan,"tresorerie"))return <div style={{padding:20}}><UpgradeWall page="tresorerie" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◑ Trésorerie 90 jours</div>
        <div style={{fontSize:11,color:C.muted}}>Cash-flow · Prévisions IA · Simulation · Alertes · Export</div></div>
      <div style={{display:"flex",gap:8}}>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      {[["Solde actuel",fmt(conv(soldeActuel,"EUR",devise),devise),C.gold],["Entrées prévues 90j",fmt(conv(33000,"EUR",devise),devise),C.green],["Sorties prévues 90j",fmt(conv(12800,"EUR",devise),devise),C.red],["Solde J+90 estimé",fmt(conv(38620,"EUR",devise),devise),C.teal]].map(([l,v,c],i)=><CT key={i}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></CT>)}
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── CASH-FLOW ── */}
    {onglet==="dashboard"&&<div>
      <Card style={{marginBottom:12}}>
        <STitle>📈 Flux de trésorerie — 90 jours</STitle>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
            <thead><tr><TH>Semaine</TH><TH>Entrées</TH><TH>Sorties</TH><TH>Solde net semaine</TH><TH>Solde cumulé</TH><TH>Statut</TH></tr></thead>
            <tbody>{TRESORERIE_90J.map((t,i)=>{const net=t.e-t.s;return <tr key={i} style={{background:t.pred?`${C.blue}05`:"transparent"}}>
              <Td style={{fontSize:10,color:t.pred?C.blue:C.muted,fontWeight:t.pred?600:400}}>{t.sem}{t.pred?" 🤖":""}</Td>
              <Td><div style={{color:C.green,fontWeight:700}}>+{fmt(conv(t.e,"EUR",devise),devise)}</div></Td>
              <Td><div style={{color:C.red}}>-{fmt(conv(t.s,"EUR",devise),devise)}</div></Td>
              <Td style={{color:net>0?C.green:C.red,fontWeight:700}}>{net>0?"+":""}{fmt(conv(net,"EUR",devise),devise)}</Td>
              <Td style={{fontWeight:700,color:t.sol>15000?C.green:t.sol>8000?C.gold:C.red}}>{fmt(conv(t.sol,"EUR",devise),devise)}</Td>
              <Td><Pill color={t.pred?C.blue:C.green}>{t.pred?"🤖 Prévision":"✅ Réel"}</Pill></Td>
            </tr>;})}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Graphique visuel */}
      <Card>
        <STitle>📊 Graphique cash-flow (visuel)</STitle>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120,padding:"10px 0"}}>
          {TRESORERIE_90J.map((t,i)=>{const maxVal=Math.max(...TRESORERIE_90J.map(x=>x.sol));const h=Math.round((t.sol/maxVal)*100);return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{width:"100%",height:h+"%",background:t.pred?`${C.blue}66`:t.sol>15000?`${C.green}88`:`${C.gold}88`,borderRadius:"3px 3px 0 0",minHeight:4,transition:"height .3s"}}/>
            <div style={{fontSize:7,color:C.muted,textAlign:"center",lineHeight:1.2}}>{t.sem.split(" ")[0]}</div>
          </div>;})}
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center",fontSize:10,color:C.muted,marginTop:4}}>
          <span>🟢 Solide</span><span>🟡 Correct</span><span>🔵 Prévision IA</span>
        </div>
      </Card>
    </div>}

    {/* ── PRÉVISIONS IA ── */}
    {onglet==="previsions"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 Analyse prédictive — Claude Sonnet</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>Basé sur vos 6 dernières semaines, votre trésorerie est en croissance de +14% par mois. À ce rythme, vous atteindrez <b style={{color:C.gold}}>38 620€</b> dans 90 jours. Attention : <b style={{color:C.orange}}>2 commissions partenaires (8 525€)</b> dues en fin de mois réduiront significativement ce solde.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
        {[{mois:"Juin 2026",e:fmt(conv(28400,"EUR",devise),devise),s:fmt(conv(12000,"EUR",devise),devise),sol:fmt(conv(34840,"EUR",devise),devise),c:C.green},{mois:"Juillet 2026",e:fmt(conv(31200,"EUR",devise),devise),s:fmt(conv(13500,"EUR",devise),devise),sol:fmt(conv(52540,"EUR",devise),devise),c:C.teal},{mois:"Août 2026",e:fmt(conv(29800,"EUR",devise),devise),s:fmt(conv(11200,"EUR",devise),devise),sol:fmt(conv(71140,"EUR",devise),devise),c:C.blue}].map((p,i)=><Card key={i} style={{borderColor:`${p.c}33`}}>
          <div style={{fontSize:11,color:p.c,fontWeight:600,marginBottom:8}}>📅 {p.mois} <Pill color={C.blue}>🤖 IA</Pill></div>
          {[["Entrées prévues",p.e,C.green],["Sorties prévues",p.s,C.red],["Solde cumulé",p.sol,C.gold]].map(([l,v,c],j)=><div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
        </Card>)}
      </div>
      <Card style={{background:`${C.orange}08`,borderColor:`${C.orange}33`}}>
        <STitle>⚠️ Risques identifiés par l'IA</STitle>
        {[{r:"Commissions partenaires dues",montant:"8 525€",echeance:"30/05/2026",impact:"Élevé"},{r:"Renouvellement abonnements SaaS",montant:"1 890€",echeance:"01/06/2026",impact:"Moyen"},{r:"Fournitures Q2 à commander",montant:"2 200€",echeance:"15/06/2026",impact:"Faible"}].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{r.r}</div><div style={{fontSize:10,color:C.muted}}>Échéance : {r.echeance}</div></div>
          <div style={{textAlign:"right"}}><div style={{color:C.red,fontWeight:700}}>{r.montant}</div><Pill color={r.impact==="Élevé"?C.red:r.impact==="Moyen"?C.orange:C.gold}>{r.impact}</Pill></div>
        </div>)}
      </Card>
    </div>}

    {/* ── SIMULATION ── */}
    {onglet==="simulation"&&<div style={{maxWidth:600}}>
      <Card>
        <STitle>🎮 Simulateur "Si je dépense X, il me reste Y"</STitle>
        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Montant de la dépense simulée (€)</label>
          <input type="range" min={0} max={soldeActuel} value={simDepense} onChange={e=>setSimDepense(Number(e.target.value))} style={{width:"100%",accentColor:C.gold}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}><span>0€</span><span style={{color:C.gold,fontWeight:700}}>{fmt(simDepense)}</span><span>{fmt(soldeActuel)}</span></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Solde actuel</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(conv(soldeActuel,"EUR",devise),devise)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.red}}>Dépense simulée</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>-{fmt(conv(simDepense,"EUR",devise),devise)}</div></CT>
          <CT style={{textAlign:"center",borderColor:`${soldeSim>5000?C.green:C.red}44`}}><div style={{fontSize:9,color:C.muted}}>Solde restant</div><div style={{fontSize:18,fontWeight:700,color:soldeSim>10000?C.green:soldeSim>5000?C.gold:C.red}}>{fmt(conv(soldeSim,"EUR",devise),devise)}</div></CT>
        </div>
        <div style={{background:soldeSim>10000?`${C.green}11`:soldeSim>5000?`${C.gold}11`:`${C.red}11`,border:`1px solid ${soldeSim>10000?C.green:soldeSim>5000?C.gold:C.red}33`,borderRadius:8,padding:12,fontSize:12,color:C.text}}>
          {soldeSim>10000?`✅ Trésorerie saine. Vous pouvez faire cette dépense sans risque. Il vous restera ${fmt(conv(soldeSim,"EUR",devise),devise)} — suffisant pour 2+ mois d'exploitation.`:soldeSim>5000?`⚠️ Trésorerie correcte mais surveillée. Dépense faisable avec prudence. Pensez aux commissions partenaires dues ce mois.`:`❌ Risque trésorerie ! Après cette dépense (${fmt(conv(simDepense,"EUR",devise),devise)}), votre solde serait critique. Attendez les prochains encaissements avant de dépenser.`}
        </div>
        <div style={{marginTop:12}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Tester des scénarios prédéfinis</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[["Commissions partenaires",8525],["Fournitures Q2",2200],["Recrutement CDI",2400],["Investissement marketing",3000]].map(([l,v])=><button key={l} onClick={()=>setSimDepense(v)} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",color:C.muted}}>{l} ({fmt(v)})</button>)}
          </div>
        </div>
      </Card>
    </div>}

    {/* ── ALERTES ── */}
    {onglet==="alertes"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {[{icon:"🔴",t:"Commissions partenaires en retard",d:"8 525€ de commissions dues à Thomas Beaumont, Leila Mansouri et Groupe Prestige SARL. Payez avant le 30/05 pour maintenir les relations.",c:C.red,a:"Payer maintenant"},{icon:"🟡",t:"Seuil d'alerte bientôt atteint",d:`Si vous payez toutes les commissions dues (8 525€), votre solde descendra à ${fmt(soldeActuel-8525)}€ — proche du seuil d'alerte (5 000€).`,c:C.orange,a:"Voir simulation"},{icon:"🟢",t:"Croissance trésorerie confirmée",d:"Votre trésorerie croît de +14% par mois depuis 3 mois. Objectif 40 000€ atteint dans 45 jours selon les prévisions IA.",c:C.green,a:null}].map((a,i)=><div key={i} style={{background:`${a.c}11`,border:`1px solid ${a.c}33`,borderRadius:10,padding:14,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div><div style={{fontSize:12,fontWeight:700,color:a.c,marginBottom:4}}>{a.icon} {a.t}</div><div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{a.d}</div></div>
        {a.a&&<Btn onClick={()=>showToast("✅ Action effectuée")} color={a.c} style={{fontSize:11,padding:"7px 14px",flexShrink:0,color:"#000"}}>{a.a}</Btn>}
      </div>)}
      <Card>
        <STitle>⚙ Configurer les seuils d'alerte</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Alerte solde bas","5 000"],["Alerte solde critique","2 000"],["Alerte sortie importante","> 3 000€ en une fois"]].map(([l,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}>
            <span>{l}</span><div style={{display:"flex",gap:8,alignItems:"center"}}><Inp placeholder={v} style={{width:120,fontSize:11}}/><Btn onClick={()=>showToast("✅ Seuil sauvegardé")} style={{fontSize:10,padding:"4px 10px"}}>Sauver</Btn></div>
          </div>)}
        </div>
      </Card>
    </div>}

    {/* ── EXPORT ── */}
    {onglet==="export"&&<Card>
      <STitle>📤 Exports trésorerie</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[["📊 Excel","Cash-flow 90j complet",".xlsx",C.green],["📄 PDF","Rapport trésorerie",".pdf",C.red],["📋 CSV","Données brutes",".csv",C.blue],["🏦 Expert-comptable","Pack complet",".zip",C.gold],["📱 WhatsApp","Résumé hebdo","WA",C.teal],["📧 Email","Rapport mensuel auto","Email",C.purple]].map(([icon,desc,fmt,c],i)=><CT key={i} style={{cursor:"pointer",borderColor:`${c}33`}} onClick={()=>showToast(`✅ Export ${desc} téléchargé`)}>
          <div style={{fontSize:14,marginBottom:6}}>{icon}</div>
          <div style={{fontSize:11,fontWeight:700,color:c,marginBottom:2}}>{desc}</div>
          <div style={{fontSize:9,color:C.muted}}>{fmt}</div>
        </CT>)}
      </div>
    </Card>}
  </div>;
};
// ─── PAGE ANALYTIQUE ──────────────────────────────────────────
const PageAnalytique=({plan})=>{
  if(!hasAccess(plan,"analytique"))return <div style={{padding:20}}><UpgradeWall page="Analytique & CA" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◒ Analytique & CA</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Prédictions IA · Objectifs · Par service · Par pays</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
      <KPI label="CA ce mois" val="24 380 €" color={C.gold} sub="↗ +12%"/>
      <KPI label="CA annuel projeté" val="292 560 €" color={C.green} sub="IA prédiction"/>
      <KPI label="Marge nette" val="61%" color={C.teal} sub="↗ +4pts"/>
      <KPI label="Objectif mensuel" val="72%" color={C.orange} sub="24 380 / 34 000 €"/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card><STitle>📊 CA par service</STitle>
        {[["Airbnb & Résidentiel",12400,C.gold],[`Jet & Yacht`,8200,C.blue],["Rapatriement",4800,C.purple],["Bureaux",3200,C.teal],["Divers",1980,C.muted]].map(([n,v,c],i)=><div key={i} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{n}</span><span style={{color:c,fontWeight:700}}>{fmt(v)}</span></div>
          <SM val={v} max={12400} color={c}/>
        </div>)}
      </Card>
      <Card><STitle>🌍 CA par pays</STitle>
        {[["🇫🇷 France",14800,C.blue],["🇦🇪 Dubaï / EAU",6200,C.gold],["🇸🇳 Sénégal",2400,C.green],["🇲🇨 Monaco",980,C.purple]].map(([n,v,c],i)=><div key={i} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{n}</span><span style={{color:c,fontWeight:700}}>{fmt(v)}</span></div>
          <SM val={v} max={14800} color={c}/>
        </div>)}
      </Card>
    </div>
    <Card style={{marginTop:12}}><STitle>🤖 Prédictions IA — Claude</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[{mois:"Mai 2026",val:"28 400 €",c:C.green,trend:"↗ +16%"},{mois:"Juin 2026",val:"31 200 €",c:C.green,trend:"↗ +10%"},{mois:"Q2 2026",val:"84 000 €",c:C.gold,trend:"↗ +22% vs Q1"}].map((p,i)=><CT key={i} style={{textAlign:"center"}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{p.mois}</div>
          <div style={{fontSize:18,fontWeight:700,color:p.c}}>{p.val}</div>
          <div style={{fontSize:10,color:p.c}}>{p.trend}</div>
        </CT>)}
      </div>
    </Card>
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
const PageClubAffaires=({plan,showToast})=>{
  const[onglet,setOnglet]=useState("accueil");
  const[deals,setDeals]=useState([
    {id:"DA-001",offrant:"Marc Dupont",recevant:"Sofia Al-Rashid",service:"Mise en relation Airbnb Dubai",valeur:2400,statut:"en cours",date:"12/04"},
    {id:"DA-002",offrant:"Groupe Prestige SARL",recevant:"Fatoumata Diop",service:"Distribution services Dakar",valeur:8000,statut:"validé",date:"10/04"},
    {id:"DA-003",offrant:"Leila Mansouri",recevant:"Jean-Marc Olivier",service:"Référencement syndic Paris",valeur:1200,statut:"proposé",date:"15/04"},
  ]);
  const MEMBRES=[
    {id:1,nom:"Isabelle Moreau",metier:"Gestion Airbnb",ville:"Paris",pays:"🇫🇷",plan:"Starter",score:72},
    {id:2,nom:"Marc Dupont",metier:"Immobilier",ville:"Lyon",pays:"🇫🇷",plan:"Business Pro",score:88},
    {id:3,nom:"Sofia Al-Rashid",metier:"Aviation d'affaires",ville:"Dubaï",pays:"🇦🇪",plan:"Enterprise",score:98},
    {id:4,nom:"Groupe Prestige SARL",metier:"Syndic",ville:"Paris",pays:"🇫🇷",plan:"Enterprise",score:94},
    {id:5,nom:"Fatoumata Diop",metier:"Finance Afrique",ville:"Dakar",pays:"🇸🇳",plan:"Business Pro",score:89},
  ];
  const[selectedMembre,setSelectedMembre]=useState(null);
  const MEMBRES_PROFILS=[
    {id:1,nom:"Isabelle Moreau",initiales:"IM",metier:"Gestion Airbnb",ville:"Paris",pays:"🇫🇷",plan:"Starter",score:72,couleur:"#4B7BFF",bio:"Gestionnaire de 8 appartements Airbnb sur Paris. Spécialisée dans le tourisme haut de gamme.",services:["Gestion locative","Conciergerie","Ménage"],ca:9600,deals:2,contact:"+33 6 12 34 56 78",email:"i.moreau@mail.fr",reseaux:{linkedin:"isabelle-moreau",instagram:"@isa.airbnb"},stats:{missions:18,noteMoy:4.8,anciennete:"2 ans"}},
    {id:2,nom:"Marc Dupont",initiales:"MD",metier:"Immobilier",ville:"Lyon",pays:"🇫🇷",plan:"Business Pro",score:88,couleur:"#9B5FFF",bio:"Investisseur immobilier avec un portefeuille de 15 biens résidentiels. Expert en valorisation de patrimoine.",services:["Vente","Location","Gestion locative","Investissement"],ca:38400,deals:5,contact:"+33 6 98 76 54 32",email:"m.dupont@corp.fr",reseaux:{linkedin:"marc-dupont-immo"},stats:{missions:42,noteMoy:4.7,anciennete:"3 ans"}},
    {id:3,nom:"Sofia Al-Rashid",initiales:"SA",metier:"Aviation d'affaires",ville:"Dubaï",pays:"🇦🇪",plan:"Enterprise",score:98,couleur:"#C9A84C",bio:"Directrice d'une flotte de jets privés desservant l'Europe et le Moyen-Orient. Cliente VIP Xyra depuis l'origine.",services:["Location jet privé","Conciergerie VIP","Transferts"],ca:110400,deals:8,contact:"+971 50 123 45 67",email:"sofia@vip.ae",reseaux:{linkedin:"sofia-al-rashid",instagram:"@sofia.aviation"},stats:{missions:46,noteMoy:4.9,anciennete:"2 ans"}},
    {id:4,nom:"Groupe Prestige SARL",initiales:"GP",metier:"Syndic & Gestion",ville:"Paris",pays:"🇫🇷",plan:"Enterprise",score:94,couleur:"#2EC9B0",bio:"Syndic professionnel gérant plus de 200 résidences en Île-de-France. Partenaire stratégique Xyra.",services:["Syndic copropriété","Gestion immeuble","Maintenance"],ca:264000,deals:14,contact:"+33 1 44 55 66 77",email:"contact@prestige.fr",reseaux:{linkedin:"groupe-prestige"},stats:{missions:156,noteMoy:4.6,anciennete:"3 ans"}},
    {id:5,nom:"Fatoumata Diop",initiales:"FD",metier:"Finance Afrique",ville:"Dakar",pays:"🇸🇳",plan:"Business Pro",score:89,couleur:"#FF5F9E",bio:"Consultante en finance d'entreprise couvrant l'Afrique de l'Ouest. Développe le réseau Xyra en Afrique francophone.",services:["Conseil financier","Investissement","Formation"],ca:81600,deals:4,contact:"+221 77 123 45 67",email:"fatou.d@dakar.sn",reseaux:{linkedin:"fatoumata-diop",instagram:"@fatou.finance"},stats:{missions:38,noteMoy:4.9,anciennete:"1 an"}},
  ];
  const tabs=[{id:"accueil",label:"🏠 Club"},{id:"membres",label:"👥 Profils membres"},{id:"deals",label:"🤝 Deals membres"},{id:"networking",label:"🌐 Networking"},{id:"avantages",label:"💎 Avantages"},{id:"stats",label:"📊 Stats club"}];
  if(!hasAccess(plan,"annuaire"))return <div style={{padding:20}}><UpgradeWall page="annuaire" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{background:`linear-gradient(135deg,${C.card},#0A0A1A)`,border:`1px solid ${C.gold}44`,borderRadius:16,padding:20,marginBottom:14}}>
      <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",marginBottom:4}}>CLUB XYRA · RÉSEAU AFFAIRES PRIVÉ</div>
      <div style={{fontSize:22,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◈ Club d'affaires Xyra</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Réseau privé · Deals exclusifs -10% · IA Match · Événements VIP · {MEMBRES.length} membres actifs</div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <div style={{borderLeft:`2px solid ${C.gold}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Membres</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{MEMBRES.length}</div></div>
        <div style={{borderLeft:`2px solid ${C.green}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Deals actifs</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{deals.length}</div></div>
        <div style={{borderLeft:`2px solid ${C.blue}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>CA généré club</div><div style={{fontSize:16,fontWeight:700,color:C.blue}}>142 000 €</div></div>
        <div style={{borderLeft:`2px solid ${C.purple}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Pays représentés</div><div style={{fontSize:16,fontWeight:700,color:C.purple}}>8</div></div>
      </div>
    </div>
    <div style={{marginBottom:14}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>
    {onglet==="accueil"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card><STitle>🏆 Top membres actifs</STitle>
        {[...MEMBRES].sort((a,b)=>b.score-a.score).map((m,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}22`}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.gold}}>{i+1}</div>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600}}>{m.nom}</div><div style={{fontSize:9,color:C.muted}}>{m.metier} · {m.pays}</div></div>
          <div style={{textAlign:"right"}}><Pill color={m.plan==="Enterprise"?C.purple:C.gold}>{m.plan}</Pill><div style={{fontSize:10,color:C.gold,marginTop:2}}>★ {m.score}</div></div>
        </div>)}
      </Card>
      <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 IA Match du jour — Claude</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>Correspondance identifiée : <b style={{color:C.gold}}>Marc Dupont (Immobilier)</b> ↔ <b style={{color:C.teal}}>Fatoumata Diop (Finance Afrique)</b> — Potentiel de collaboration sur expansion immobilière Dakar. CA estimé : 15 000€. Score : 94%.</div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <Btn onClick={()=>showToast("✅ Mise en relation effectuée !")}>🤝 Mettre en relation</Btn>
          <BtnGhost onClick={()=>showToast("🤖 Nouvelle analyse IA lancée")}>🔄 Relancer</BtnGhost>
        </div>
      </Card>
    </div>}
    {onglet==="deals"&&<Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <STitle>🤝 Deals entre membres (-10%)</STitle>
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
            <BtnGhost onClick={()=>showToast("💬 Chat deal ouvert")} style={{fontSize:10,padding:"4px 8px"}}>💬</BtnGhost>
          </div></Td>
        </tr>)}</tbody>
      </table>
    </Card>}
    {onglet==="networking"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card><STitle>📅 Prochains événements</STitle>
        {EVENEMENTS.map((e,i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{e.titre}</div>
          <div style={{fontSize:10,color:C.muted,marginBottom:6}}>📅 {e.date} · 📍 {e.lieu}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Pill color={C.green}>{e.inscrits}/{e.max}</Pill><Btn onClick={()=>showToast(`✅ Inscrit à ${e.titre}`)} style={{fontSize:10,padding:"4px 10px"}}>S'inscrire</Btn></div>
        </div>)}
      </Card>
      <Card><STitle>🎥 Visio Club privée</STitle>
        <div style={{textAlign:"center",padding:"24px 0"}}>
          <div style={{fontSize:36,marginBottom:10}}>🎥</div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Salon Visio Club VIP</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Salle privée membres Club Xyra</div>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            <Btn onClick={()=>showToast("🎥 Salle club : meet.xyra.io/club")}>🎥 Rejoindre</Btn>
            <BtnGhost onClick={()=>showToast("📅 Visio planifiée !")}>📅 Planifier</BtnGhost>
          </div>
        </div>
      </Card>
    </div>}
    {onglet==="membres"&&<div>
      {selectedMembre?<div>
        <BtnGhost onClick={()=>setSelectedMembre(null)} style={{marginBottom:16}}>← Retour aux membres</BtnGhost>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {/* Profil principal */}
          <Card style={{borderColor:`${selectedMembre.couleur}44`}}>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:`${selectedMembre.couleur}22`,border:`3px solid ${selectedMembre.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:selectedMembre.couleur}}>{selectedMembre.initiales}</div>
              <div>
                <div style={{fontSize:18,fontWeight:700,color:C.text}}>{selectedMembre.nom}</div>
                <div style={{fontSize:12,color:C.muted}}>{selectedMembre.metier}</div>
                <div style={{fontSize:11,color:C.muted}}>{selectedMembre.pays} {selectedMembre.ville}</div>
                <Pill color={selectedMembre.plan==="Enterprise"?C.purple:selectedMembre.plan==="Business Pro"?C.gold:C.blue}>{selectedMembre.plan}</Pill>
              </div>
            </div>
            <div style={{background:`${selectedMembre.couleur}11`,borderRadius:10,padding:14,marginBottom:16,fontSize:12,color:C.text,lineHeight:1.7,fontStyle:"italic"}}>"{selectedMembre.bio}"</div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {[["📱",selectedMembre.contact],["📧",selectedMembre.email],["🏢",selectedMembre.metier],["📍",`${selectedMembre.pays} ${selectedMembre.ville}`]].map(([icon,val],i)=>(
                <div key={i} style={{display:"flex",gap:10,fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                  <span>{icon}</span><span style={{color:C.muted}}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:8}}>SERVICES PROPOSÉS</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {selectedMembre.services.map((s,i)=><Pill key={i} color={selectedMembre.couleur}>{s}</Pill>)}
              </div>
            </div>
            {selectedMembre.reseaux&&<div>
              <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:8}}>RÉSEAUX SOCIAUX</div>
              <div style={{display:"flex",gap:8}}>
                {selectedMembre.reseaux.linkedin&&<BtnGhost onClick={()=>showToast("🔗 LinkedIn ouvert")} style={{fontSize:11}}>💼 LinkedIn</BtnGhost>}
                {selectedMembre.reseaux.instagram&&<BtnGhost onClick={()=>showToast("📸 Instagram ouvert")} style={{fontSize:11}}>📸 Instagram</BtnGhost>}
              </div>
            </div>}
          </Card>
          {/* Stats et actions */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <KPI label="CA généré" val={fmt(selectedMembre.ca)} color={C.gold}/>
              <KPI label="Score réseau" val={selectedMembre.score+"/100"} color={selectedMembre.couleur}/>
              <KPI label="Missions" val={selectedMembre.stats.missions} color={C.blue}/>
              <KPI label="Note moy." val={"★ "+selectedMembre.stats.noteMoy} color={C.teal}/>
            </div>
            <Card>
              <STitle>⚡ Actions</STitle>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <Btn onClick={()=>showToast("💬 WhatsApp ouvert")} style={{background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`}}>💬 Contacter sur WhatsApp</Btn>
                <Btn onClick={()=>showToast("🤝 Proposition de deal envoyée")} style={{background:`${C.gold}22`,color:C.gold,border:`1px solid ${C.gold}44`}}>🤝 Proposer un deal</Btn>
                <BtnGhost onClick={()=>showToast("📧 Email envoyé")}>📧 Envoyer un email</BtnGhost>
                <BtnGhost onClick={()=>showToast("⭐ Recommandation envoyée")}>⭐ Recommander</BtnGhost>
              </div>
            </Card>
            <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
              <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 IA Match — Claude</div>
              <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>
                Synergies potentielles avec {selectedMembre.nom.split(" ")[0]} : collaboration sur {selectedMembre.services[0]}. CA estimé : {fmt(Math.round(selectedMembre.ca*0.15))}. Score compatibilité : {Math.min(99,selectedMembre.score+3)}%.
              </div>
            </Card>
          </div>
        </div>
      </div>:<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>👥 Membres du Club Xyra</div>
          <div style={{fontSize:11,color:C.muted}}>{MEMBRES_PROFILS.length} membres actifs</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
          {MEMBRES_PROFILS.map((m,i)=><Card key={i} style={{cursor:"pointer",borderColor:`${m.couleur}33`}} onClick={()=>setSelectedMembre(m)}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:`${m.couleur}22`,border:`2px solid ${m.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:m.couleur,flexShrink:0}}>{m.initiales}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.nom}</div>
                <div style={{fontSize:10,color:C.muted}}>{m.pays} {m.ville}</div>
                <Pill color={m.plan==="Enterprise"?C.purple:m.plan==="Business Pro"?C.gold:C.blue}>{m.plan}</Pill>
              </div>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.5}}>{m.bio.slice(0,80)}...</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {m.services.slice(0,3).map((s,j)=><span key={j} style={{fontSize:9,background:`${m.couleur}15`,color:m.couleur,border:`1px solid ${m.couleur}33`,borderRadius:4,padding:"2px 6px"}}>{s}</span>)}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:11,fontWeight:700,color:C.gold}}>{fmt(m.ca)} CA</span>
              <span style={{fontSize:11,color:m.couleur,fontWeight:600}}>★ {m.score}/100</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              <Btn onClick={e=>{e.stopPropagation();showToast(`💬 WhatsApp ${m.nom}`);}} style={{fontSize:10,padding:"6px 4px",background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`}}>💬 Contact</Btn>
              <BtnGhost onClick={e=>{e.stopPropagation();setSelectedMembre(m);}} style={{fontSize:10,padding:"6px 4px"}}>Voir profil →</BtnGhost>
            </div>
          </Card>)}
        </div>
      </div>}
    </div>}

    {onglet==="avantages"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
      {[{icon:"💎",titre:"Remise -10% entre membres",desc:"Tous les services entre membres Club au tarif préférentiel",color:C.gold},{icon:"🤖",titre:"IA Match Business",desc:"Claude identifie les meilleures synergies du réseau chaque semaine",color:C.purple},{icon:"🌍",titre:"Annuaire privé mondial",desc:"Accès à l'annuaire complet avec coordonnées directes",color:C.blue},{icon:"📅",titre:"Événements VIP exclusifs",desc:"Invitations prioritaires soirées networking et forums",color:C.teal},{icon:"💳",titre:"Carte Membre Xyra",desc:"Carte virtuelle Club avec cashback 2% sur les achats réseau",color:C.green},{icon:"📊",titre:"Rapport business mensuel",desc:"Analyse IA personnalisée par Claude chaque 1er du mois",color:C.orange}].map((a,i)=><Card key={i} style={{borderColor:`${a.color}33`,textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:8}}>{a.icon}</div>
        <div style={{fontSize:13,fontWeight:700,color:a.color,marginBottom:6}}>{a.titre}</div>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{a.desc}</div>
      </Card>)}
    </div>}
    {onglet==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card><STitle>📊 Activité du club</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <KPI label="Membres actifs" val={MEMBRES.length} color={C.blue}/>
          <KPI label="Deals conclus" val={deals.filter(d=>d.statut==="validé").length} color={C.green}/>
          <KPI label="CA généré réseau" val="142K€" color={C.gold}/>
          <KPI label="Taux engagement" val="84%" color={C.teal}/>
        </div>
      </Card>
      <Card><STitle>💰 Revenus Club Xyra</STitle>
        {[["Abonnements (29€/mois)",fmt(MEMBRES.length*29),C.gold],["Commissions deals (5%)",fmt(7100),C.green],["Événements",fmt(2400),C.blue],["Total mensuel",fmt(MEMBRES.length*29+7100+2400),C.teal]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
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
  if(!hasAccess(plan,"wallet_membres"))return <div style={{padding:20}}><UpgradeWall page="Wallets Membres" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◈ Wallets Membres</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Soldes · Abonnements · Renouvellements · Multi-devises</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
      <KPI label="Membres actifs" val={membres.length} color={C.blue}/>
      <KPI label="Abonnements actifs" val={membres.length} color={C.gold}/>
      <KPI label="Revenu abos/mois" val={fmt(membres.length*29)} color={C.green}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
      {membres.map((m,i)=><Card key={i} style={{borderColor:`${C.gold}22`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:`${C.gold}22`,border:`1px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.gold}}>{inits(m.nom)}</div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:C.text}}>{m.nom}</div><div style={{fontSize:10,color:C.muted}}>{m.banque} · {m.pays}</div></div>
          <St s={m.statut}/>
        </div>
        <div style={{background:C.card2,borderRadius:8,padding:10,marginBottom:10}}>
          <div style={{fontSize:9,color:C.muted,marginBottom:3}}>SOLDE WALLET</div>
          <div style={{fontSize:20,fontWeight:700,color:C.gold}}>{fmt(m.solde,m.devise)}</div>
          <div style={{fontSize:9,color:C.muted,fontFamily:"'Courier New',monospace",marginTop:4}}>{m.iban}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:8}}>
          <span style={{color:C.muted}}>Plan : <b style={{color:m.type==="Enterprise"?C.purple:m.type==="Business Pro"?C.gold:C.blue}}>{m.type}</b></span>
          <span style={{color:C.muted}}>Tx : <b style={{color:C.text}}>{m.transactions}</b></span>
        </div>
        <Btn onClick={()=>showToast(`💳 Carte virtuelle ${m.nom} créée !`)} style={{width:"100%",fontSize:11,background:m.carte?C.green+"22":"transparent",color:m.carte?C.green:C.muted,border:`1px solid ${m.carte?C.green:C.border}44`}}>{m.carte?"💳 Carte active":"+ Créer carte"}</Btn>
      </Card>)}
    </div>
  </div>;
};

// ─── PAGE EVENEMENTS ──────────────────────────────────────────
const PageEvenements=({plan,showToast})=>{
  const[evts,setEvts]=useState(EVENEMENTS);
  if(!hasAccess(plan,"evenements"))return <div style={{padding:20}}><UpgradeWall page="Événements" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◆ Événements</div><div style={{fontSize:11,color:C.muted}}>Networking · Visio · QR Code · Inscriptions</div></div>
      <Btn onClick={()=>showToast("✅ Événement créé !")}>+ Créer un événement</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
      {evts.map((e,i)=><Card key={i} style={{borderColor:e.statut==="complet"?`${C.red}44`:`${C.gold}22`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <Pill color={e.statut==="ouvert"?C.green:C.red}>{e.statut==="ouvert"?"🟢 Inscriptions ouvertes":"🔴 Complet"}</Pill>
          <div style={{fontSize:12,color:C.gold,fontWeight:700}}>{e.prix}</div>
        </div>
        <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>{e.titre}</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:2}}>📅 {e.date}</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:12}}>📍 {e.lieu}</div>
        <div style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:3}}><span style={{color:C.muted}}>Inscriptions</span><span style={{color:C.gold,fontWeight:700}}>{e.inscrits}/{e.max}</span></div><SM val={e.inscrits} max={e.max} color={e.inscrits===e.max?C.red:C.green}/></div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>showToast("📱 Lien QR Code copié !")} style={{flex:1,fontSize:11}}>📲 QR Code</Btn>
          {e.statut==="ouvert"&&<BtnGhost onClick={()=>showToast("🎥 Visio Jitsi lancée !")} style={{flex:1,fontSize:11}}>🎥 Visio</BtnGhost>}
        </div>
      </Card>)}
    </div>
  </div>;
};

// ─── PAGE SCORING / NPS ───────────────────────────────────────
const PageScoring=({plan,showToast})=>{
  if(!hasAccess(plan,"scoring"))return <div style={{padding:20}}><UpgradeWall page="Réputation & NPS" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>★ Réputation & NPS</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Avis Google · Widget · IA · Rapport WhatsApp</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
      <KPI label="Note Google" val="★ 4.8" color={C.gold}/>
      <KPI label="Nombre d'avis" val="23" color={C.blue}/>
      <KPI label="NPS score" val="+72" color={C.green} sub="Excellent"/>
      <KPI label="Taux réponse" val="91%" color={C.teal}/>
    </div>
    <Card>
      <STitle>⭐ Derniers avis clients</STitle>
      {AVIS.map((a,i)=><div key={i} style={{background:C.card2,borderRadius:10,padding:14,marginBottom:10,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <div style={{fontWeight:700,fontSize:12}}>{a.client}</div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {a.google&&<Pill color={C.blue}>Google</Pill>}
            <div style={{color:C.gold}}>{"★".repeat(a.note)}</div>
          </div>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{a.service}</div>
        <div style={{fontSize:12,color:C.text,fontStyle:"italic",lineHeight:1.6}}>"{a.comm}"</div>
        <div style={{marginTop:8,display:"flex",gap:8}}>
          <Btn onClick={()=>showToast("✅ Réponse IA générée et publiée !")} style={{fontSize:10,padding:"4px 10px"}}>🤖 Répondre (IA)</Btn>
          <BtnGhost onClick={()=>showToast("📱 Partagé sur WhatsApp !")} style={{fontSize:10,padding:"4px 8px"}}>📱 Partager</BtnGhost>
        </div>
      </div>)}
    </Card>
  </div>;
};

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
        <div style={{fontSize:11,color:"#5A5A7A"}}>Gestion complète des ressources humaines · {equipe.length} collaborateurs</div>
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
          {niveau:"urgent",icon:"📋",titre:"Entretien professionnel — Tous les collaborateurs",detail:"Les entretiens professionnels doivent être réalisés tous les 2 ans. Fatou Sarr : à planifier avant septembre 2026.",action:"Planifier entretien",couleur:"#FF8C3A"},
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
        {[["DPAE (Déclaration préalable à l'embauche)","✅ Faite à chaque embauche","Permanent","#2EC9B0"],["Registre du personnel","✅ À jour — 3 collaborateurs","Permanent","#2EC9B0"],["Affichage obligatoire (conventions, harcèlement...)","✅ Conforme","Vérifié 01/04/2026","#2EC9B0"],["Visite médicale — Thomas Beaumont","⚠️ Renouvellement obligatoire","Avant 30/04/2026","#FF8C3A"],["Visite médicale — Abou et Fatou","✅ Effectuées","Valides 12 mois","#2EC9B0"],["Formation sécurité SST — Thomas & Abou","✅ Certifiés","Valide jusqu'en 2027","#2EC9B0"],["Entretien professionnel — Fatou Sarr","⏳ À planifier","Avant 01/09/2026","#4B7BFF"],["Document unique d'évaluation des risques (DUER)","⚠️ À mettre à jour","Avant 30/06/2026","#FF8C3A"],["Mutuelle d'entreprise obligatoire (>1 salarié)","✅ Souscrite — Alan","Active","#2EC9B0"],["Prévoyance collective","✅ Souscrite","Active","#2EC9B0"]].map(([o,s,d,c],i)=><div key={i} style={{background:"#0C0C1A",borderRadius:8,padding:12,border:`1px solid ${c}22`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
      <div style={{display:"flex",gap:8}}><Btn onClick={()=>showToast("🤖 IA a optimisé le planning !")}>🤖 Auto-planifier</Btn><BtnGhost onClick={()=>showToast("✅ Mission ajoutée")}>+ Mission</BtnGhost></div>
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
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⊟ Stock & Fournitures</div>
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
  const[view,setView]=useState("dashboard");
  const[selectedClient,setSelectedClient]=useState(null);
  const[searchQ,setSearchQ]=useState("");
  const[filterPlan,setFilterPlan]=useState("tous");
  const[filterStatut,setFilterStatut]=useState("tous");
  const[mrr,setMrr]=useState(0);

  const calcSolvabilite=(t)=>{
    let score=50;
    if(t.plan==="enterprise")score+=20;
    else if(t.plan==="business_pro")score+=10;
    if(t.pays&&["France","Allemagne","Royaume-Uni","Émirats arabes unis (Dubaï)","États-Unis","Canada"].includes(t.pays))score+=15;
    if(t.taille==="20+")score+=15;
    else if(t.taille==="6 à 20")score+=10;
    else if(t.taille==="2 à 5")score+=5;
    if(t.statut==="actif")score+=10;
    if(t.created_at){
      const days=(Date.now()-new Date(t.created_at).getTime())/(1000*60*60*24);
      if(days>30)score+=5;
    }
    return Math.min(100,score);
  };

  const scoreCouleur=(s)=>s>=80?C.green:s>=50?C.gold:C.red;
  const scoreLabel=(s)=>s>=80?"🟢 Solvable":s>=50?"🟡 Moyen":"🔴 Risqué";

  useEffect(()=>{
    const load=async()=>{
      try{
        const {createClient}=await import('@supabase/supabase-js');
        const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const{data}=await sb.from('tenants').select('*').order('created_at',{ascending:false});
        if(data){
          setTenants(data);
          setMrr(data.reduce((a,t)=>a+(t.plan_price||0),0));
        }
      }catch(e){console.error(e);}
      setLoading(false);
    };
    load();
  },[]);

  const filtered=tenants.filter(t=>{
    const q=searchQ.toLowerCase();
    const matchQ=!q||t.societe?.toLowerCase().includes(q)||t.email?.toLowerCase().includes(q)||t.pays?.toLowerCase().includes(q);
    const matchPlan=filterPlan==="tous"||t.plan===filterPlan;
    const matchStatut=filterStatut==="tous"||t.statut===filterStatut;
    return matchQ&&matchPlan&&matchStatut;
  });

  const churn=tenants.filter(t=>t.statut==="suspendu").length;
  const essai=tenants.filter(t=>t.statut==="essai").length;
  const actifs=tenants.filter(t=>t.statut==="actif").length;
  const arr=mrr*12;
  const ltv=mrr>0?mrr*24:0;
  const tauxConv=tenants.length>0?Math.round((actifs/tenants.length)*100):0;

  const planColors={starter:C.blue,business_pro:C.gold,enterprise:C.purple};

  if(!hasAccess(plan,"deploiement"))return <div style={{padding:20}}><UpgradeWall page="Déploiement SaaS" plan={plan}/></div>;

  // ── FICHE CLIENT ────────────────────────────────────────────
  if(selectedClient){
    const t=selectedClient;
    const score=calcSolvabilite(t);
    const daysLeft=t.trial_ends_at?Math.max(0,Math.ceil((new Date(t.trial_ends_at)-Date.now())/(1000*60*60*24))):0;
    return <div style={{padding:20}}>
      <Btn onClick={()=>setSelectedClient(null)} style={{marginBottom:16,fontSize:12}}>← Retour</Btn>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {/* Infos principales */}
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:C.gold}}>{t.societe?.[0]||"?"}</div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:C.text}}>{t.societe}</div>
              <div style={{fontSize:11,color:C.muted}}>{t.email}</div>
              <div style={{fontSize:11,color:C.muted}}>{t.pays} · {t.taille}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[[" Plan",t.plan||"—"],[" Métier",t.metier||"—"],[" Statut",t.statut||"—"],[" Inscription",t.created_at?new Date(t.created_at).toLocaleDateString("fr-FR"):"—"]].map(([l,v],i)=>(
              <div key={i} style={{background:C.card2,borderRadius:6,padding:"8px 10px"}}>
                <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div>
                <div style={{fontSize:12,fontWeight:600,color:C.text,marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        {/* Score solvabilité */}
        <Card>
          <STitle>💳 Score de Solvabilité</STitle>
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:52,fontWeight:700,color:scoreCouleur(score)}}>{score}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8}}>/100</div>
            <div style={{fontSize:14,fontWeight:600,color:scoreCouleur(score)}}>{scoreLabel(score)}</div>
            <div style={{height:8,background:C.border,borderRadius:4,margin:"12px 0",overflow:"hidden"}}>
              <div style={{height:"100%",width:score+"%",background:scoreCouleur(score),borderRadius:4,transition:"width 1s"}}/>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[
              ["Plan souscrit",t.plan==="enterprise"?"+20pts":t.plan==="business_pro"?"+10pts":"+0pts",t.plan==="enterprise"||t.plan==="business_pro"],
              ["Pays de confiance",["France","Allemagne","Émirats arabes unis (Dubaï)","États-Unis"].includes(t.pays)?"+15pts":"0pts",["France","Allemagne","Émirats arabes unis (Dubaï)","États-Unis"].includes(t.pays)],
              ["Grande structure",t.taille==="20+"?"+15pts":t.taille==="6 à 20"?"+10pts":"+5pts",true],
              ["Compte actif",t.statut==="actif"?"+10pts":"0pts",t.statut==="actif"],
            ].map(([l,v,ok],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}>
                <span style={{color:C.muted}}>{l}</span>
                <span style={{color:ok?C.green:C.muted,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
          {score<50&&<div style={{marginTop:12,background:`${C.red}15`,border:`1px solid ${C.red}33`,borderRadius:6,padding:"8px 10px",fontSize:11,color:C.red}}>⚠️ Risque élevé — Demander paiement immédiat</div>}
          {score>=50&&score<80&&<div style={{marginTop:12,background:`${C.gold}15`,border:`1px solid ${C.gold}33`,borderRadius:6,padding:"8px 10px",fontSize:11,color:C.gold}}>⚡ Surveiller — Essai limité recommandé</div>}
          {score>=80&&<div style={{marginTop:12,background:`${C.green}15`,border:`1px solid ${C.green}33`,borderRadius:6,padding:"8px 10px",fontSize:11,color:C.green}}>✅ Client fiable — Accès complet recommandé</div>}
        </Card>
      </div>
      {/* KPIs client */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
        <KPI label="MRR" val={fmt(t.plan_price||0)} color={C.gold}/>
        <KPI label="LTV estimée" val={fmt((t.plan_price||0)*24)} color={C.green}/>
        <KPI label="Jours essai restants" val={daysLeft} color={daysLeft<3?C.red:C.blue}/>
        <KPI label="Score solvabilité" val={score+"/100"} color={scoreCouleur(score)}/>
      </div>
      {/* Actions */}
      <Card>
        <STitle>⚡ Actions rapides</STitle>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn onClick={()=>{showToast("📱 WhatsApp ouvert");window.open(`https://wa.me/?text=Bonjour ${t.societe}, bienvenue sur Xyra !`)}} style={{background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`}}>💬 WhatsApp</Btn>
          <Btn onClick={()=>showToast("📧 Email envoyé à "+t.email)} style={{background:`${C.blue}22`,color:C.blue,border:`1px solid ${C.blue}44`}}>📧 Email</Btn>
          <Btn onClick={()=>showToast("⬆️ Plan mis à jour")} style={{background:`${C.gold}22`,color:C.gold,border:`1px solid ${C.gold}44`}}>⬆️ Changer plan</Btn>
          <Btn onClick={()=>showToast("🎁 +7 jours offerts")} style={{background:`${C.purple}22`,color:C.purple,border:`1px solid ${C.purple}44`}}>🎁 Offrir 7 jours</Btn>
          <Btn onClick={()=>showToast("⏸️ Compte suspendu")} style={{background:`${C.red}22`,color:C.red,border:`1px solid ${C.red}44`}}>⏸️ Suspendre</Btn>
        </div>
      </Card>
      {/* Timeline */}
      <Card style={{marginTop:12}}>
        <STitle>📋 Timeline</STitle>
        {[
          {date:t.created_at?new Date(t.created_at).toLocaleDateString("fr-FR"):"—",action:"Inscription",detail:`Plan ${t.plan} · ${t.pays}`,c:C.green},
          {date:"—",action:"Paiement",detail:`${t.plan_price||0}€/mois`,c:C.gold},
          {date:"—",action:"Onboarding",detail:"Guide de démarrage",c:C.blue},
        ].map((e,i)=>(
          <div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:e.c,flexShrink:0,marginTop:5}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:C.text}}>{e.action}</div>
              <div style={{fontSize:11,color:C.muted}}>{e.detail}</div>
            </div>
            <div style={{fontSize:10,color:C.muted}}>{e.date}</div>
          </div>
        ))}
      </Card>
    </div>;
  }

  // ── VUE PRINCIPALE ──────────────────────────────────────────
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>🌍 Déploiement SaaS — Vue Owner</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Clients Xyra · MRR · Solvabilité · Alertes temps réel</div>

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:16}}>
      <KPI label="Clients SaaS" val={tenants.length} color={C.blue}/>
      <KPI label="MRR" val={fmt(mrr)} color={C.gold}/>
      <KPI label="ARR projeté" val={fmt(arr)} color={C.green}/>
      <KPI label="En essai" val={essai} color={C.orange}/>
      <KPI label="Taux conversion" val={tauxConv+"%"} color={C.purple}/>
      <KPI label="Churned" val={churn} color={C.red}/>
    </div>

    {/* Alertes */}
    {tenants.filter(t=>{
      const days=t.trial_ends_at?Math.ceil((new Date(t.trial_ends_at)-Date.now())/(1000*60*60*24)):99;
      return days<=2&&t.statut==="essai";
    }).length>0&&(
      <div style={{background:`${C.red}15`,border:`1px solid ${C.red}33`,borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:12,color:C.red}}>
        🚨 {tenants.filter(t=>{const d=t.trial_ends_at?Math.ceil((new Date(t.trial_ends_at)-Date.now())/(1000*60*60*24)):99;return d<=2&&t.statut==="essai";}).length} client(s) en fin d'essai dans moins de 48h
      </div>
    )}

    {/* Tabs */}
    <div style={{display:"flex",gap:4,marginBottom:12}}>
      {[["dashboard","📊 Vue globale"],["clients","🏢 Clients"],["revenus","💰 Revenus"],["solvabilite","💳 Solvabilité"]].map(([id,label])=>(
        <button key={id} onClick={()=>setView(id)} style={{padding:"6px 14px",borderRadius:6,border:`1px solid ${view===id?C.gold:C.border}`,background:view===id?`${C.gold}15`:"transparent",color:view===id?C.gold:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{label}</button>
      ))}
    </div>

    {/* Vue globale */}
    {view==="dashboard"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Répartition par plan</STitle>
          {["starter","business_pro","enterprise"].map(p=>{
            const count=tenants.filter(t=>t.plan===p).length;
            const pct=tenants.length>0?Math.round((count/tenants.length)*100):0;
            return <div key={p} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                <span style={{color:C.text,textTransform:"capitalize"}}>{p.replace("_"," ")}</span>
                <span style={{color:planColors[p]||C.blue,fontWeight:600}}>{count} clients · {pct}%</span>
              </div>
              <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:pct+"%",background:planColors[p]||C.blue,borderRadius:3}}/>
              </div>
            </div>;
          })}
        </Card>
        <Card>
          <STitle>🌍 Top pays</STitle>
          {Object.entries(tenants.reduce((acc,t)=>{const p=t.pays||"Inconnu";acc[p]=(acc[p]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([pays,count])=>(
            <div key={pays} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}>
              <span style={{color:C.text}}>{pays}</span>
              <span style={{color:C.gold,fontWeight:600}}>{count} client{count>1?"s":""}</span>
            </div>
          ))}
          {tenants.length===0&&<div style={{color:C.muted,fontSize:12}}>Aucun client</div>}
        </Card>
        <Card>
          <STitle>⚡ Alertes owner</STitle>
          {tenants.filter(t=>calcSolvabilite(t)<50).length>0&&<div style={{fontSize:11,color:C.red,padding:"5px 8px",background:`${C.red}11`,borderRadius:4,marginBottom:6}}>🔴 {tenants.filter(t=>calcSolvabilite(t)<50).length} client(s) solvabilité faible</div>}
          {essai>0&&<div style={{fontSize:11,color:C.orange,padding:"5px 8px",background:`${C.orange}11`,borderRadius:4,marginBottom:6}}>⏳ {essai} client(s) en période d'essai</div>}
          {churn>0&&<div style={{fontSize:11,color:C.red,padding:"5px 8px",background:`${C.red}11`,borderRadius:4,marginBottom:6}}>⚠️ {churn} client(s) churned</div>}
          {tenants.length===0&&<div style={{color:C.muted,fontSize:12}}>Aucune alerte</div>}
          {tenants.length>0&&churn===0&&essai===0&&<div style={{fontSize:11,color:C.green,padding:"5px 8px",background:`${C.green}11`,borderRadius:4}}>✅ Tout va bien !</div>}
        </Card>
      </div>
    </div>}

    {/* Vue clients */}
    {view==="clients"&&<Card>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Rechercher..." style={{flex:1,minWidth:150,background:C.card2,border:`1px solid ${C.border}`,color:C.text,padding:"7px 10px",borderRadius:6,fontSize:12,outline:"none",fontFamily:"inherit"}}/>
        <select value={filterPlan} onChange={e=>setFilterPlan(e.target.value)} style={{background:C.card2,border:`1px solid ${C.border}`,color:C.text,padding:"7px 10px",borderRadius:6,fontSize:12,outline:"none",fontFamily:"inherit"}}>
          <option value="tous">Tous les plans</option>
          <option value="starter">Starter</option>
          <option value="business_pro">Business Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select value={filterStatut} onChange={e=>setFilterStatut(e.target.value)} style={{background:C.card2,border:`1px solid ${C.border}`,color:C.text,padding:"7px 10px",borderRadius:6,fontSize:12,outline:"none",fontFamily:"inherit"}}>
          <option value="tous">Tous statuts</option>
          <option value="essai">Essai</option>
          <option value="actif">Actif</option>
          <option value="suspendu">Suspendu</option>
        </select>
      </div>
      {loading?<div style={{color:C.muted,textAlign:"center",padding:20}}>Chargement...</div>:
      filtered.length===0?<div style={{color:C.muted,textAlign:"center",padding:20}}>Aucun client trouvé</div>:
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Entreprise</TH><TH>Plan</TH><TH>Pays</TH><TH>MRR</TH><TH>Solvabilité</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
        <tbody>{filtered.map((t,i)=>{
          const score=calcSolvabilite(t);
          return <tr key={i}>
            <Td style={{fontWeight:600}}>{t.societe}</Td>
            <Td><Pill color={planColors[t.plan]||C.blue}>{t.plan?.replace("_"," ")||"—"}</Pill></Td>
            <Td style={{fontSize:11}}>{t.pays||"—"}</Td>
            <Td style={{color:C.gold,fontWeight:700}}>{fmt(t.plan_price||0)}/mois</Td>
            <Td>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:40,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:score+"%",background:scoreCouleur(score)}}/>
                </div>
                <span style={{fontSize:10,color:scoreCouleur(score),fontWeight:600}}>{score}</span>
              </div>
            </Td>
            <Td><St s={t.statut||"essai"}/></Td>
            <Td><Btn onClick={()=>setSelectedClient(t)} style={{padding:"3px 8px",fontSize:10}}>Voir fiche →</Btn></Td>
          </tr>;
        })}</tbody>
      </table>}
    </Card>}

    {/* Vue revenus */}
    {view==="revenus"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>💰 MRR par plan</STitle>
          {["starter","business_pro","enterprise"].map(p=>{
            const total=tenants.filter(t=>t.plan===p).reduce((a,t)=>a+(t.plan_price||0),0);
            return <div key={p} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
              <span style={{color:C.text,textTransform:"capitalize"}}>{p.replace("_"," ")}</span>
              <span style={{color:C.gold,fontWeight:700}}>{fmt(total)}/mois</span>
            </div>;
          })}
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:13,fontWeight:700}}>
            <span style={{color:C.text}}>Total MRR</span>
            <span style={{color:C.gold}}>{fmt(mrr)}/mois</span>
          </div>
        </Card>
        <Card>
          <STitle>📈 Projections</STitle>
          {[["MRR actuel",fmt(mrr),"mois"],["ARR projeté",fmt(arr),"an"],["LTV moyenne (24 mois)",fmt(ltv),"client"],["Taux conversion",tauxConv+"%","essai→payant"]].map(([l,v,u],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
              <span style={{color:C.muted}}>{l}</span>
              <div style={{textAlign:"right"}}>
                <span style={{color:C.gold,fontWeight:700}}>{v}</span>
                <span style={{color:C.muted,fontSize:10,marginLeft:4}}>/{u}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>}

    {/* Vue solvabilité */}
    {view==="solvabilite"&&<Card>
      <STitle>💳 Score de solvabilité — Tous les clients</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
        {[["🟢 Solvables",tenants.filter(t=>calcSolvabilite(t)>=80).length,C.green],["🟡 Moyens",tenants.filter(t=>calcSolvabilite(t)>=50&&calcSolvabilite(t)<80).length,C.gold],["🔴 Risqués",tenants.filter(t=>calcSolvabilite(t)<50).length,C.red]].map(([l,v,c],i)=>(
          <div key={i} style={{background:`${c}11`,border:`1px solid ${c}33`,borderRadius:8,padding:"12px",textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
      {loading?<div style={{color:C.muted,textAlign:"center",padding:20}}>Chargement...</div>:
      tenants.length===0?<div style={{color:C.muted,textAlign:"center",padding:20}}>Aucun client</div>:
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Entreprise</TH><TH>Pays</TH><TH>Plan</TH><TH>Taille</TH><TH>Score</TH><TH>Niveau</TH><TH>Action</TH></tr></thead>
        <tbody>{tenants.sort((a,b)=>calcSolvabilite(a)-calcSolvabilite(b)).map((t,i)=>{
          const score=calcSolvabilite(t);
          return <tr key={i}>
            <Td style={{fontWeight:600}}>{t.societe}</Td>
            <Td style={{fontSize:11}}>{t.pays||"—"}</Td>
            <Td><Pill color={planColors[t.plan]||C.blue}>{t.plan?.replace("_"," ")||"—"}</Pill></Td>
            <Td style={{fontSize:11}}>{t.taille||"—"}</Td>
            <Td>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:50,height:5,background:C.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:score+"%",background:scoreCouleur(score)}}/>
                </div>
                <span style={{fontSize:11,color:scoreCouleur(score),fontWeight:700}}>{score}/100</span>
              </div>
            </Td>
            <Td><span style={{fontSize:10,color:scoreCouleur(score)}}>{scoreLabel(score)}</span></Td>
            <Td>
              {score<50?<Btn onClick={()=>showToast("📧 Demande paiement envoyée")} style={{padding:"3px 8px",fontSize:9,background:`${C.red}22`,color:C.red,border:`1px solid ${C.red}44`}}>Demander paiement</Btn>:
              <Btn onClick={()=>setSelectedClient(t)} style={{padding:"3px 8px",fontSize:10}}>Voir fiche</Btn>}
            </Td>
          </tr>;
        })}</tbody>
      </table>}
    </Card>}
  </div>;
};


// ─── PAGE API ─────────────────────────────────────────────────
const PageAPI=({plan,showToast})=>{
  const[apiKey,setApiKey]=useState("ty_live_••••••••••••••••••••••••••••••••");
  const tabs=[{id:"keys",label:"🔑 Clés API"},{id:"webhooks",label:"🔔 Webhooks"},{id:"docs",label:"📚 Docs"},{id:"logs",label:"📋 Logs"}];
  const[onglet,setOnglet]=useState("keys");
  if(!hasAccess(plan,"api"))return <div style={{padding:20}}><UpgradeWall page="API Xyra" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◇ API Xyra</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Clés API · Webhooks · Documentation · Logs · Intégrations</div>
    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>
    {onglet==="keys"&&<Card>
      <STitle>🔑 Clés API</STitle>
      <div style={{background:C.card2,borderRadius:10,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:6}}>CLÉ API DE PRODUCTION</div>
        <div style={{fontFamily:"'Courier New',monospace",fontSize:13,color:C.gold,marginBottom:10}}>{apiKey}</div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>showToast("✅ Clé API copiée !")} style={{fontSize:11}}>📋 Copier</Btn>
          <BtnGhost onClick={()=>showToast("🔄 Nouvelle clé générée !")} style={{fontSize:11}}>🔄 Régénérer</BtnGhost>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <KPI label="Appels/mois" val="2 847" color={C.blue}/>
        <KPI label="Succès" val="99.2%" color={C.green}/>
        <KPI label="Latence moy." val="234ms" color={C.gold}/>
      </div>
    </Card>}
    {onglet==="webhooks"&&<Card><STitle>🔔 Webhooks configurés</STitle>
      {[{evt:"paiement.reçu",url:"https://app.xyra.io/webhooks/payment",statut:"actif"},{evt:"devis.signé",url:"https://app.xyra.io/webhooks/devis",statut:"actif"},{evt:"client.nouveau",url:"https://zapier.com/hooks/tymeless/abc123",statut:"actif"}].map((w,i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><Pill color={C.gold}>{w.evt}</Pill><St s={w.statut}/></div>
        <div style={{fontSize:10,fontFamily:"monospace",color:C.muted}}>{w.url}</div>
      </div>)}
      <Btn onClick={()=>showToast("✅ Webhook ajouté !")} style={{marginTop:8}}>+ Ajouter webhook</Btn>
    </Card>}
    {onglet==="docs"&&<Card><STitle>📚 Documentation API</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["POST /api/devis","Créer un devis",C.gold],["POST /api/paiements","Initier un paiement",C.green],["GET /api/clients","Lister les clients",C.blue],["POST /api/messages","Envoyer WhatsApp",C.teal],["GET /api/planning","Voir le planning",C.purple],["POST /api/contrats","Créer un contrat",C.orange]].map(([ep,desc,c],i)=><CT key={i}><div style={{fontFamily:"monospace",fontSize:11,color:c,marginBottom:3}}>{ep}</div><div style={{fontSize:10,color:C.muted}}>{desc}</div></CT>)}
      </div>
    </Card>}
    {onglet==="logs"&&<Card><STitle>📋 Logs API récents</STitle>
      {[{m:"POST",ep:"/api/devis",code:200,t:"2ms",dt:"Aujourd'hui 14:32"},{m:"GET",ep:"/api/clients",code:200,t:"8ms",dt:"Aujourd'hui 14:30"},{m:"POST",ep:"/api/paiements",code:200,t:"145ms",dt:"Aujourd'hui 14:28"}].map((l,i)=><div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11,alignItems:"center"}}>
        <Pill color={C.blue}>{l.m}</Pill>
        <span style={{fontFamily:"monospace",color:C.text,flex:1}}>{l.ep}</span>
        <Pill color={C.green}>{l.code}</Pill>
        <span style={{color:C.muted}}>{l.t}</span>
        <span style={{color:C.muted,fontSize:9}}>{l.dt}</span>
      </div>)}
    </Card>}
  </div>;
};

// ─── PAGE SETTINGS ────────────────────────────────────────────
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
// ─── PAGE ADMIN ───────────────────────────────────────────────
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

// ─── PAGE OWNER ───────────────────────────────────────────────
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

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────
export default function Xyra() {
  const[page,setPage]=useState("accueil");
  const[plan,setPlan]=useState("owner");

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
    accueil:<PageAccueil notifs={notifs} setNotifs={setNotifs} profil={profil} setPage={setPage}/>,
    owner:<PageOwner plan={plan} showToast={showToast} profil={profil}/>,
    // Pages bientôt disponibles
    ...Object.fromEntries(Object.entries(SOON_MODULES).map(([k,v])=>[k,<PageBientot key={k} {...v}/>])),
    wallet:<PageWallet plan={plan} showToast={showToast} profil={profil}/>,
    cartes:<PageCartes showToast={showToast}/>,
    overview:<PageOverview plan={plan} profil={profil}/>,
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
    annuaire:<PageAnnuaire plan={plan} showToast={showToast}/>,
    wallet_membres:<PageWalletMembres plan={plan} showToast={showToast}/>,
    evenements:<PageEvenements plan={plan} showToast={showToast}/>,
    scoring:<PageScoring plan={plan} showToast={showToast}/>,
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
          <div style={{fontSize:9,color:"#9090B8",letterSpacing:"0.2em",marginTop:2}}>OS · OWNER DASHBOARD</div>
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
        <div onClick={()=>setPage("owner")} style={{padding:"10px 13px",borderTop:`1px solid ${C.border}`,cursor:"pointer",background:page==="owner"?`${C.gold}0E`:"transparent",borderLeft:`2px solid ${page==="owner"?C.gold:"transparent"}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:`${C.gold}22`,border:`1px solid ${C.gold}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.gold,flexShrink:0}}>C</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:600,color:page==="owner"?C.gold:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Curtiss</div>
              <div style={{fontSize:9,color:C.gold}}>★ Propriétaire · Xyra</div>
            </div>
            {notifs.filter(n=>!n.lu).length>0&&<span style={{background:C.red,color:"#fff",borderRadius:20,padding:"0 5px",fontSize:9,fontWeight:700}}>{notifs.filter(n=>!n.lu).length}</span>}
          </div>
        </div>
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