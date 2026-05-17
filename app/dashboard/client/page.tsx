"use client";
import { useState, useEffect } from "react";

// ─── TYPES ────────────────────────────────────────────────────
type Plan = "starter" | "business_pro" | "enterprise";
type PageId = string;

interface Module {
  id: string;
  icon: string;
  nom: string;
  prix: number;
  groupe: string;
  desc: string;
}

interface ClientProfile {
  societe: string;
  gerant: string;
  email: string;
  secteur: string;
  plan: Plan;
  logo?: string;
  couleur?: string;
}

// ─── COULEURS ─────────────────────────────────────────────────
const C = {
  dark: "#080810", dark2: "#0D0D1A", dark3: "#121224",
  card: "#14142A", border: "#ffffff0D",
  text: "#F0EEE8", muted: "#8888AA",
  gold: "#C9A84C", green: "#2EC99A",
  blue: "#3B82F6", purple: "#7B4FD4",
  red: "#EF4444", orange: "#F59E0B",
  teal: "#2EC9B0",
};

// ─── MODULES ──────────────────────────────────────────────────
const MODULES: Module[] = [
  { id:"overview",     icon:"📊", nom:"Vue d'ensemble",     prix:0,  groupe:"Principal",  desc:"Tableau de bord, KPIs, alertes, score santé" },
  { id:"wallet",       icon:"💳", nom:"Wallet & Paiements", prix:29, groupe:"Principal",  desc:"Encaisser, virements, Flutterwave, relevés PDF" },
  { id:"cartes",       icon:"💎", nom:"Cartes Virtuelles",  prix:19, groupe:"Principal",  desc:"Cartes Visa équipe, budgets, contrôles IA" },
  { id:"devis",        icon:"📋", nom:"Devis & Facturation",prix:19, groupe:"Gestion",    desc:"Devis PDF, validation WhatsApp, factures auto" },
  { id:"crm",          icon:"👥", nom:"CRM Clients",        prix:19, groupe:"Gestion",    desc:"Fiches clients, VIP, historique, relances" },
  { id:"planning",     icon:"📅", nom:"Planning & Équipe",  prix:15, groupe:"Gestion",    desc:"Missions, agenda partagé, notifications" },
  { id:"stock",        icon:"📦", nom:"Stock & Fournitures",prix:15, groupe:"Gestion",    desc:"Inventaire, alertes réapprovisionnement" },
  { id:"compta",       icon:"📊", nom:"Comptabilité",       prix:25, groupe:"Finance",    desc:"Charges, marges, TVA, export comptable" },
  { id:"tresorerie",   icon:"💰", nom:"Trésorerie",         prix:25, groupe:"Finance",    desc:"Flux trésorerie, prévisions 90 jours" },
  { id:"analytique",   icon:"🤖", nom:"IA & Analytique",    prix:35, groupe:"Finance",    desc:"Prévisions CA, score santé, Claude AI" },
  { id:"partenaires",  icon:"🤝", nom:"Partenaires & AA",   prix:25, groupe:"Croissance", desc:"Réseau apporteurs, commissions auto" },
  { id:"prospection",  icon:"⊕",  nom:"Prospection IA",    prix:49, groupe:"Croissance", desc:"SIRENE, bot WA, séquences, 59 fonctionnalités" },
  { id:"nps",          icon:"⭐", nom:"NPS & Avis Google",  prix:15, groupe:"Croissance", desc:"Satisfaction client, Google reviews auto" },
  { id:"formation",    icon:"🎓", nom:"Formation Équipe",   prix:15, groupe:"Équipe",     desc:"Formations, quiz, progression membres" },
  { id:"chat",         icon:"💬", nom:"Chat Équipe",        prix:15, groupe:"Équipe",     desc:"Messagerie interne style WhatsApp" },
  { id:"contrats",     icon:"📄", nom:"Contrats",           prix:19, groupe:"Équipe",     desc:"Modèles, signatures électroniques" },
  { id:"notifications",icon:"🔔", nom:"Notifications",      prix:0,  groupe:"Système",    desc:"Alertes temps réel, push WhatsApp" },
  { id:"parametres",   icon:"⚙️", nom:"Paramètres",         prix:0,  groupe:"Système",    desc:"Profil, personnalisation, intégrations" },
];

// ─── FEATURES PAR MODULE ──────────────────────────────────────
const FEATURES: Record<string, string[]> = {
  wallet:       ["Encaisser via WhatsApp & QR Code","Virements instantanés Flutterwave","Wave · Orange Money · MTN · Visa · SEPA","Relevé PDF mensuel automatique","Alertes seuil minimum de solde","Wallet séparé par projet"],
  cartes:       ["Cartes Visa virtuelles pour l'équipe","Budget limité configurable par carte","Notif WhatsApp à chaque dépense","Blocage en 1 clic depuis dashboard","Rapport mensuel IA + détection anomalies"],
  devis:        ["Devis PDF généré en 30 secondes","Envoi WhatsApp ou email instantané","Validation client OUI/NON","Facture auto après paiement","Relance automatique si non payé 48h"],
  crm:          ["Fiches clients complètes","Tags VIP + historique complet","Relances automatiques configurables","Segmentation intelligente","Score client IA + pays et langue"],
  planning:     ["Planning hebdo de l'équipe","Missions assignées par collaborateur","Notifications push automatiques","Vue calendrier mensuelle complète","Suivi des présences en temps réel"],
  stock:        ["Inventaire en temps réel","Alertes réapprovisionnement auto","Coût par fourniture calculé","Commandes fournisseurs intégrées","Historique consommation + graphiques"],
  compta:       ["Charges, marges, TVA calculés auto","Rapport mensuel PDF automatique","Export comptable Excel en 1 clic","Catégorisation IA des dépenses","Prévisions budgétaires intelligentes"],
  tresorerie:   ["Flux de trésorerie en direct","Prévisions 30/60/90 jours IA","Alertes solde critique WhatsApp","Graphiques d'évolution clairs","Score santé financière en temps réel"],
  analytique:   ["Prévisions CA 90 jours Claude AI","Score santé business personnalisé","Recommandations IA actionnables","Comparaison vs objectifs fixés","Rapport hebdo automatique WhatsApp"],
  partenaires:  ["Réseau apporteurs d'affaires","Commissions calculées automatiquement","Paiement en 1 clic · notif auto","CA par partenaire en temps réel","Classement top apporteurs du mois"],
  prospection:  ["SIRENE + enrichissement IA auto","Bot WhatsApp + Email + Appels","Séquences automatiques multi-canaux","Score prospect IA + scoring prédictif","59 fonctionnalités IA complètes"],
  nps:          ["Collecte avis automatique post-prestation","Boost note Google automatisé","Score NPS en temps réel","Analyse verbatim IA des avis","Alertes avis négatif immédiates"],
  formation:    ["Modules de formation personnalisés","Quiz et évaluations interactifs","Suivi progression par membre","Certificats générés automatiquement","Vidéos et supports intégrés"],
  chat:         ["Messagerie interne style WhatsApp","Groupes par projet ou équipe","Partage de fichiers intégré","Notifications push temps réel","Historique complet consultable"],
  contrats:     ["Modèles de contrats personnalisables","Signature électronique légale","Suivi des signatures en temps réel","Archivage automatique sécurisé","Rappels d'échéance automatiques"],
};

// ─── MODULES PAR SECTEUR ──────────────────────────────────────
const SECTEUR_MODULES: Record<string, { starter: string[]; pro: string[] }> = {
  services:    { starter:["wallet","devis","planning","crm","nps"],          pro:["compta","cartes","partenaires","stock","analytique"] },
  btp:         { starter:["devis","planning","crm","wallet","stock"],         pro:["compta","partenaires","nps","cartes","analytique"] },
  restaurant:  { starter:["wallet","crm","stock","devis","planning"],         pro:["compta","nps","analytique","cartes","partenaires"] },
  freelance:   { starter:["devis","crm","wallet","contrats","compta"],        pro:["planning","nps","analytique","partenaires","cartes"] },
  hotel:       { starter:["wallet","devis","crm","planning","nps"],           pro:["compta","cartes","partenaires","analytique","stock"] },
  liberal:     { starter:["crm","devis","contrats","wallet","planning"],      pro:["compta","nps","analytique","cartes","formation"] },
  beaute:      { starter:["crm","wallet","planning","devis","nps"],           pro:["compta","stock","cartes","formation","analytique"] },
  transport:   { starter:["wallet","planning","crm","devis","partenaires"],   pro:["compta","cartes","nps","analytique","contrats"] },
  import:      { starter:["wallet","crm","devis","partenaires","compta"],     pro:["planning","analytique","cartes","nps","stock"] },
  formation_s: { starter:["crm","devis","wallet","formation","contrats"],     pro:["planning","nps","analytique","compta","cartes"] },
};

// ─── CONFIG PLANS ─────────────────────────────────────────────
const PLAN_INFO: Record<Plan, { nom: string; prix: string; couleur: string; emoji: string; upgrade?: string }> = {
  starter:      { nom:"Starter",      prix:"49€/mois",  couleur:C.blue,   emoji:"🌱", upgrade:"Business Pro — 99€/mois" },
  business_pro: { nom:"Business Pro", prix:"99€/mois",  couleur:C.gold,   emoji:"🚀", upgrade:"Enterprise — 150€/mois" },
  enterprise:   { nom:"Enterprise",   prix:"150€/mois", couleur:C.purple, emoji:"💎" },
};

// ─── UNLOCK LOGIC ─────────────────────────────────────────────
function getUnlockedIds(plan: Plan, secteur: string): string[] {
  const base = ["overview","notifications","parametres"];
  if (plan === "enterprise") return MODULES.map(m => m.id);
  const s = SECTEUR_MODULES[secteur] || SECTEUR_MODULES["services"];
  if (plan === "starter") return [...base, ...s.starter];
  return [...base, ...s.starter, ...s.pro];
}

// ─── COMPOSANTS UI ────────────────────────────────────────────
const Btn = ({ children, onClick, v = "gold", full = false, sm = false, style: s = {} }: any) => {
  const styles: Record<string, React.CSSProperties> = {
    gold:   { background: C.gold,   color: "#000", border: "none" },
    purple: { background: C.purple, color: "#fff", border: "none" },
    green:  { background: C.green,  color: "#000", border: "none" },
    blue:   { background: C.blue,   color: "#fff", border: "none" },
    red:    { background: C.red,    color: "#fff", border: "none" },
    ghost:  { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    outline:{ background: "transparent", color: C.gold,  border: `1px solid ${C.gold}44` },
  };
  return (
    <button onClick={onClick} style={{
      ...styles[v], borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
      fontSize: sm ? 11 : 13, fontWeight: 600,
      padding: sm ? "5px 10px" : "9px 18px",
      width: full ? "100%" : "auto",
      transition: "opacity 0.2s", ...s
    }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >{children}</button>
  );
};

// ─── MODAL DÉBLOQUER ──────────────────────────────────────────
const ModalDebloquer = ({ mod, plan, onClose }: { mod: Module; plan: Plan; onClose: () => void }) => {
  const info = PLAN_INFO[plan];
  const nextPlan = plan === "starter" ? "Business Pro — 99€/mois" : "Enterprise — 150€/mois";
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000 }}>
      <div style={{ background:C.card,border:`1px solid ${C.gold}44`,borderRadius:14,padding:28,width:440,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ textAlign:"center",marginBottom:20 }}>
          <div style={{ fontSize:42,marginBottom:10 }}>{mod.icon}</div>
          <div style={{ fontSize:18,fontWeight:700,color:C.text,marginBottom:6 }}>{mod.nom}</div>
          <div style={{ fontSize:13,color:C.muted }}>{mod.desc}</div>
        </div>
        <div style={{ background:C.dark3,borderRadius:10,padding:14,marginBottom:16 }}>
          <div style={{ fontSize:11,color:C.muted,marginBottom:8 }}>Ce module comprend :</div>
          {(FEATURES[mod.id] || [mod.desc]).map((f, i) => (
            <div key={i} style={{ fontSize:12,color:C.text,padding:"5px 0",borderBottom:i<(FEATURES[mod.id]||[]).length-1?`1px solid ${C.border}`:"none",display:"flex",gap:8 }}>
              <span style={{ color:C.gold }}>✦</span>{f}
            </div>
          ))}
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:16,textAlign:"center" }}>
            <div style={{ fontSize:11,color:C.muted,marginBottom:4 }}>Débloquer ce module seul</div>
            <div style={{ fontSize:28,fontWeight:700,color:C.gold,marginBottom:10 }}>{mod.prix}€<span style={{ fontSize:13,color:C.muted }}>/mois</span></div>
            <Btn v="gold" full onClick={() => alert(`Redirection paiement Flutterwave — ${mod.nom} — ${mod.prix}€/mois`)}>
              💳 Débloquer maintenant — {mod.prix}€/mois
            </Btn>
          </div>
          <div style={{ background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:14,textAlign:"center" }}>
            <div style={{ fontSize:11,color:C.muted,marginBottom:4 }}>Ou passez au plan supérieur</div>
            <div style={{ fontSize:13,fontWeight:600,color:C.purple,marginBottom:8 }}>{nextPlan}</div>
            <Btn v="purple" full onClick={onClose}>🚀 Upgrader mon plan</Btn>
          </div>
          <Btn v="ghost" full onClick={onClose}>Fermer</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── VUE D'ENSEMBLE ───────────────────────────────────────────
const VueEnsemble = ({ profile, plan, unlockedIds, onUpgrade }: any) => {
  const info = PLAN_INFO[plan];
  const activeModules = MODULES.filter(m => unlockedIds.includes(m.id) && m.prix > 0);
  const [objectifs] = useState([
    { l:"CA mensuel", v:"0 / 5 000 €", p:0 },
    { l:"Nouveaux clients", v:"0 / 10", p:0 },
    { l:"Devis envoyés", v:"0 / 20", p:0 },
  ]);

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22,fontWeight:700,color:C.text,marginBottom:4 }}>Bonjour, {profile.societe} 👋</div>
        <div style={{ fontSize:13,color:C.muted }}>
          Plan <span style={{ color:info.couleur,fontWeight:600 }}>{info.emoji} {info.nom}</span> · {info.prix} · {profile.secteur}
        </div>
      </div>

      {/* ONBOARDING */}
      {plan === "starter" && (
        <div style={{ background:"linear-gradient(135deg,#1A2A1A,#14142A)",border:`1px solid ${C.green}33`,borderRadius:10,padding:16,marginBottom:14 }}>
          <div style={{ fontSize:12,fontWeight:600,color:C.green,marginBottom:8 }}>🎯 Bienvenue ! Configurez votre espace en 3 étapes</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {["✅ Compte créé","⬜ Logo ajouté","⬜ 1er devis envoyé"].map((s,i) => (
              <div key={i} style={{ fontSize:11,color:i===0?C.green:C.muted,background:C.card,borderRadius:6,padding:"5px 10px",border:`1px solid ${C.border}` }}>{s}</div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14 }}>
        {[
          { l:"Modules actifs", v:`${activeModules.length}/${MODULES.filter(m=>m.prix>0).length}`, c:info.couleur },
          { l:"CA ce mois", v:"0 €", c:C.green },
          { l:"Clients actifs", v:"0", c:C.blue },
          { l:"Score santé IA", v:"--", c:C.orange },
        ].map((k,i) => (
          <div key={i} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:14 }}>
            <div style={{ fontSize:22,fontWeight:700,color:k.c,marginBottom:2 }}>{k.v}</div>
            <div style={{ fontSize:10,color:C.muted }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* MODULES ACTIFS */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:14 }}>
        <div style={{ fontSize:12,fontWeight:600,color:C.text,marginBottom:12 }}>Vos modules actifs</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
          {activeModules.map((m,i) => (
            <div key={i} style={{ background:C.dark3,border:`1px solid ${info.couleur}22`,borderRadius:7,padding:"9px 12px",display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:16 }}>{m.icon}</span>
              <span style={{ fontSize:11,fontWeight:500,color:C.text }}>{m.nom}</span>
              <span style={{ fontSize:10,color:C.green,marginLeft:"auto" }}>✓</span>
            </div>
          ))}
        </div>
      </div>

      {/* RAPPORT HEBDO */}
      <div style={{ background:C.card,border:`1px solid ${C.gold}22`,borderRadius:10,padding:16,marginBottom:14 }}>
        <div style={{ fontSize:12,fontWeight:600,color:C.text,marginBottom:6 }}>📊 Rapport hebdo — Chaque lundi 8h00</div>
        <div style={{ fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:12 }}>
          Recevez chaque lundi sur WhatsApp : CA de la semaine, missions planifiées, alertes importantes, objectifs.
        </div>
        <Btn v="outline" sm onClick={() => alert("Rapport WhatsApp activé !")}>📲 Activer le rapport WhatsApp</Btn>
      </div>

      {/* OBJECTIFS */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:14 }}>
        <div style={{ fontSize:12,fontWeight:600,color:C.text,marginBottom:12 }}>🎯 Mes objectifs du mois</div>
        {objectifs.map((o,i) => (
          <div key={i} style={{ marginBottom:12 }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4 }}>
              <span style={{ color:C.muted }}>{o.l}</span>
              <span style={{ color:C.gold }}>{o.v}</span>
            </div>
            <div style={{ height:4,background:C.border,borderRadius:2 }}>
              <div style={{ height:"100%",width:`${o.p}%`,background:C.gold,borderRadius:2 }} />
            </div>
          </div>
        ))}
        <Btn v="ghost" sm onClick={() => alert("Modifier objectifs")}>✏️ Modifier mes objectifs</Btn>
      </div>

      {/* PARRAINAGE */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:14 }}>
        <div style={{ fontSize:12,fontWeight:600,color:C.text,marginBottom:6 }}>🤝 Programme de parrainage</div>
        <div style={{ fontSize:12,color:C.muted,marginBottom:10 }}>
          Parrainez une entreprise → recevez <strong style={{ color:C.gold }}>10% de réduction</strong> sur votre prochain mois.
        </div>
        <div style={{ background:C.dark3,borderRadius:7,padding:10,marginBottom:10 }}>
          <div style={{ fontSize:10,color:C.muted,marginBottom:3 }}>Votre lien de parrainage</div>
          <div style={{ fontFamily:"monospace",fontSize:12,color:C.gold }}>tymeless-os.com/ref/{profile.societe.toUpperCase().replace(/\s/g,"").slice(0,8)}2026</div>
        </div>
        <Btn v="outline" sm onClick={() => alert("Lien copié !")}>📋 Copier mon lien</Btn>
      </div>

      {/* UPGRADE BANNER */}
      {plan !== "enterprise" && (
        <div style={{ background:"linear-gradient(135deg,#1A1400,#14142A)",border:`1px solid ${C.gold}33`,borderRadius:10,padding:16,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13,fontWeight:600,color:C.gold,marginBottom:3 }}>
              {plan==="starter"?"🚀 Passez au Business Pro":"💎 Passez au Enterprise"}
            </div>
            <div style={{ fontSize:11,color:C.muted }}>
              {plan==="starter"?"10 modules pour 99€/mois":"Tous les modules + domaine pour 150€/mois"}
            </div>
          </div>
          <Btn v="gold" sm onClick={onUpgrade}>Upgrader →</Btn>
        </div>
      )}
    </div>
  );
};

// ─── MODULE VERROUILLÉ ────────────────────────────────────────
const ModuleVerrouille = ({ mod, plan, onDebloquer }: { mod: Module; plan: Plan; onDebloquer: () => void }) => (
  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:400,padding:30 }}>
    <div style={{ textAlign:"center",maxWidth:440 }}>
      <div style={{ fontSize:52,marginBottom:14,filter:"blur(0px)" }}>{mod.icon}</div>
      <div style={{ fontSize:20,fontWeight:700,color:C.text,marginBottom:8 }}>{mod.nom}</div>
      <div style={{ fontSize:13,color:C.muted,marginBottom:20,lineHeight:1.7 }}>{mod.desc}</div>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:20,filter:"blur(3px)",opacity:0.4,pointerEvents:"none" }}>
        {(FEATURES[mod.id]||[]).slice(0,3).map((f,i) => (
          <div key={i} style={{ fontSize:12,color:C.text,padding:"6px 0",borderBottom:i<2?`1px solid ${C.border}`:"none",display:"flex",gap:8 }}>
            <span style={{ color:C.gold }}>✦</span>{f}
          </div>
        ))}
      </div>
      <div style={{ fontSize:30,marginBottom:8 }}>🔒</div>
      <div style={{ fontSize:13,color:C.muted,marginBottom:20 }}>Ce module n'est pas inclus dans votre plan actuel</div>
      <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
        <Btn v="gold" onClick={onDebloquer}>✦ Débloquer — {mod.prix}€/mois</Btn>
        <Btn v="outline" onClick={onDebloquer}>🚀 Upgrader mon plan</Btn>
      </div>
    </div>
  </div>
);

// ─── PARAMÈTRES ───────────────────────────────────────────────
const PageParametres = ({ profile, plan }: { profile: ClientProfile; plan: Plan }) => {
  const info = PLAN_INFO[plan];
  return (
    <div>
      <div style={{ fontSize:18,fontWeight:700,color:C.text,marginBottom:4 }}>⚙️ Paramètres</div>
      <div style={{ fontSize:12,color:C.muted,marginBottom:20 }}>Personnalisez votre espace Tymeless OS</div>

      {/* AFFICHAGE NOM */}
      <div style={{ background:`linear-gradient(135deg,${C.card},#1A1400)`,border:`1px solid ${C.gold}44`,borderRadius:10,padding:16,marginBottom:16,textAlign:"center" }}>
        <div style={{ fontSize:11,color:C.muted,marginBottom:4 }}>Votre espace s'affiche comme :</div>
        <div style={{ fontSize:20,fontWeight:700,color:C.gold }}>TYMELESS OS — {profile.societe}</div>
        <div style={{ fontSize:10,color:C.muted,marginTop:4 }}>Ce nom apparaît sur toutes vos factures et documents</div>
      </div>

      {/* BASE - TOUS LES PLANS */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:14 }}>
        <div style={{ fontSize:12,fontWeight:600,color:C.text,marginBottom:12 }}>
          Informations de base
          <span style={{ fontSize:10,padding:"2px 8px",borderRadius:20,background:`${C.green}22`,color:C.green,fontWeight:500,marginLeft:8 }}>Tous les plans</span>
        </div>
        {[
          ["Nom de la société", profile.societe],
          ["Nom du gérant", profile.gerant],
          ["Email", profile.email],
          ["Secteur", profile.secteur],
        ].map(([l,v],i) => (
          <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12 }}>
            <span style={{ color:C.muted }}>{l}</span>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ color:C.text,fontWeight:500 }}>{v}</span>
              <button style={{ background:C.dark3,border:`1px solid ${C.border}`,borderRadius:5,padding:"3px 8px",fontSize:10,color:C.muted,cursor:"pointer",fontFamily:"inherit" }}>Modifier</button>
            </div>
          </div>
        ))}
      </div>

      {/* BUSINESS PRO */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:14,opacity:plan==="starter"?0.6:1 }}>
        <div style={{ fontSize:12,fontWeight:600,color:C.text,marginBottom:12 }}>
          🎨 Personnalisation visuelle
          <span style={{ fontSize:10,padding:"2px 8px",borderRadius:20,background:`${C.gold}22`,color:C.gold,fontWeight:500,marginLeft:8 }}>Business Pro+</span>
          {plan==="starter" && <span style={{ fontSize:10,color:C.muted,marginLeft:8 }}>🔒 Passez au Pro</span>}
        </div>
        {[
          ["Logo personnalisé", plan!=="starter"],
          ["Couleur primaire", plan!=="starter"],
          ["Couleur secondaire", plan!=="starter"],
        ].map(([l,active],i) => (
          <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12,opacity:active?1:0.5 }}>
            <span style={{ color:C.muted }}>{l as string}</span>
            {active
              ? <button style={{ background:C.gold,border:"none",borderRadius:5,padding:"4px 10px",fontSize:10,fontWeight:700,color:"#000",cursor:"pointer",fontFamily:"inherit" }}>Configurer</button>
              : <span style={{ fontSize:11,color:C.muted }}>🔒</span>
            }
          </div>
        ))}
      </div>

      {/* ENTERPRISE */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:14,opacity:plan!=="enterprise"?0.6:1 }}>
        <div style={{ fontSize:12,fontWeight:600,color:C.text,marginBottom:12 }}>
          🌐 Options Enterprise
          <span style={{ fontSize:10,padding:"2px 8px",borderRadius:20,background:`${C.purple}22`,color:C.purple,fontWeight:500,marginLeft:8 }}>Enterprise</span>
          {plan!=="enterprise" && <span style={{ fontSize:10,color:C.muted,marginLeft:8 }}>🔒 Passez au Enterprise</span>}
        </div>
        {[
          ["Domaine personnalisé", "dashboard.votrenom.com"],
          ["Multi-sites", "Non activé"],
          ["Accès API complet", "Non activé"],
          ["Support dédié 7j/7", "Non activé"],
        ].map(([l,v],i) => (
          <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12,opacity:plan==="enterprise"?1:0.5 }}>
            <span style={{ color:C.muted }}>{l}</span>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ color:C.text }}>{v}</span>
              {plan==="enterprise"
                ? <button style={{ background:C.purple,border:"none",borderRadius:5,padding:"4px 10px",fontSize:10,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit" }}>Configurer</button>
                : <span style={{ fontSize:11,color:C.muted }}>🔒</span>
              }
            </div>
          </div>
        ))}
      </div>

      {/* PARRAINAGE */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16 }}>
        <div style={{ fontSize:12,fontWeight:600,color:C.text,marginBottom:6 }}>🤝 Programme de parrainage</div>
        <div style={{ fontSize:12,color:C.muted,marginBottom:10 }}>
          Parrainez une entreprise → recevez <strong style={{ color:C.gold }}>10% de réduction</strong> sur votre prochain mois.
        </div>
        <div style={{ background:C.dark3,borderRadius:7,padding:10,marginBottom:10 }}>
          <div style={{ fontSize:10,color:C.muted,marginBottom:3 }}>Votre lien unique</div>
          <div style={{ fontFamily:"monospace",fontSize:12,color:C.gold }}>tymeless-os.com/ref/{profile.societe.toUpperCase().replace(/\s/g,"").slice(0,8)}2026</div>
        </div>
        <Btn v="outline" sm onClick={() => alert("Lien copié !")}>📋 Copier mon lien</Btn>
      </div>
    </div>
  );
};

// ─── CENTRE D'AIDE ────────────────────────────────────────────
const CentreAide = () => (
  <div>
    <div style={{ fontSize:18,fontWeight:700,color:C.text,marginBottom:4 }}>📚 Centre d'aide</div>
    <div style={{ fontSize:12,color:C.muted,marginBottom:20 }}>Guides et tutoriels pour maîtriser Tymeless OS</div>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10 }}>
      {[
        { ico:"🚀",t:"Démarrer avec Tymeless OS",d:"Guide complet pour configurer votre espace en 10 minutes" },
        { ico:"💳",t:"Encaisser votre 1er paiement",d:"Comment créer un lien de paiement et l'envoyer sur WhatsApp" },
        { ico:"📋",t:"Créer et envoyer un devis",d:"Générer un devis PDF et le valider avec votre client" },
        { ico:"👥",t:"Gérer vos clients",d:"Créer des fiches clients et suivre vos relations commerciales" },
        { ico:"📅",t:"Planifier les missions",d:"Organiser le planning de votre équipe efficacement" },
        { ico:"🤖",t:"Utiliser l'IA Tymeless",d:"Tirer le meilleur parti des recommandations Claude AI" },
      ].map((g,i) => (
        <div key={i} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,cursor:"pointer",transition:"border-color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = `${C.gold}44`)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
        >
          <div style={{ fontSize:24,marginBottom:8 }}>{g.ico}</div>
          <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:4 }}>{g.t}</div>
          <div style={{ fontSize:11,color:C.muted,lineHeight:1.5 }}>{g.d}</div>
          <div style={{ fontSize:11,color:C.gold,marginTop:8 }}>Voir le guide →</div>
        </div>
      ))}
    </div>
    <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginTop:14 }}>
      <div style={{ fontSize:12,fontWeight:600,color:C.text,marginBottom:8 }}>💬 Support WhatsApp</div>
      <div style={{ fontSize:12,color:C.muted,marginBottom:12 }}>Notre équipe répond en moins de 2h · 7j/7</div>
      <Btn v="green" sm onClick={() => window.open("https://wa.me/33765189527","_blank")}>
        💬 Contacter le support
      </Btn>
    </div>
  </div>
);

// ─── PAGE PRINCIPALE ──────────────────────────────────────────
export default function ClientDashboard() {
  const searchParams = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : ""
);
const [plan, setPlan] = useState<Plan>(
  (searchParams.get("plan") as Plan) || "starter"
);
const [profile] = useState<ClientProfile>({
  societe: searchParams.get("societe") || "Votre Société",
  gerant: searchParams.get("gerant") || "",
  email: searchParams.get("email") || "",
  secteur: searchParams.get("secteur") || "",
  plan: (searchParams.get("plan") as Plan) || "starter",
});
  const [secteur] = useState("services");
  const [page, setPage] = useState<PageId>("overview");
  const [modalMod, setModalMod] = useState<Module | null>(null);

  const unlockedIds = getUnlockedIds(plan, secteur);
  const info = PLAN_INFO[plan];

  // Grouper les modules
  const groupes: Record<string, Module[]> = {};
  MODULES.forEach(m => {
    if (!groupes[m.groupe]) groupes[m.groupe] = [];
    groupes[m.groupe].push(m);
  });

  const activeCount = unlockedIds.filter(id => MODULES.find(m => m.id===id && m.prix>0)).length;
  const totalCount = MODULES.filter(m => m.prix > 0).length;

  const renderPage = () => {
    const mod = MODULES.find(m => m.id === page);
    if (!mod) return null;

    if (page === "overview") return <VueEnsemble profile={profile} plan={plan} unlockedIds={unlockedIds} onUpgrade={() => setPlan(plan==="starter"?"business_pro":"enterprise")} />;
    if (page === "parametres") return <PageParametres profile={profile} plan={plan} />;
    if (page === "aide") return <CentreAide />;

    if (!unlockedIds.includes(page)) {
      return <ModuleVerrouille mod={mod} plan={plan} onDebloquer={() => setModalMod(mod)} />;
    }

    return (
      <div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:20,fontWeight:700,color:C.text,marginBottom:4 }}>{mod.icon} {mod.nom}</div>
          <div style={{ fontSize:12,color:C.muted }}>{mod.desc}</div>
        </div>
        <div style={{ background:C.card,border:`1px solid ${info.couleur}33`,borderRadius:10,padding:40,textAlign:"center" }}>
          <div style={{ fontSize:48,marginBottom:14 }}>{mod.icon}</div>
          <div style={{ fontSize:16,fontWeight:600,marginBottom:8 }}>Module {mod.nom} actif ✅</div>
          <div style={{ background:C.dark3,borderRadius:10,padding:14,textAlign:"left",maxWidth:400,margin:"16px auto" }}>
            {(FEATURES[mod.id]||[]).map((f,i) => (
              <div key={i} style={{ fontSize:12,color:C.text,padding:"6px 0",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8 }}>
                <span style={{ color:info.couleur }}>✦</span>{f}
              </div>
            ))}
          </div>
          <div style={{ fontSize:12,color:C.muted }}>Contenu complet disponible dans le dashboard final</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background:C.dark,minHeight:"100vh",color:C.text,fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:13,display:"flex",flexDirection:"column" }}>

      {/* MODAL */}
      {modalMod && <ModalDebloquer mod={modalMod} plan={plan} onClose={() => setModalMod(null)} />}

      {/* TOPBAR */}
      <div style={{ background:C.dark2,borderBottom:`1px solid ${C.border}`,padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ fontSize:14,fontWeight:700,color:info.couleur,letterSpacing:"0.1em" }}>
          TYMELESS OS — {profile.societe}
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <div style={{ fontSize:11,color:C.muted }}>Bonjour, {profile.gerant}</div>
          <div style={{ fontSize:10,padding:"3px 10px",borderRadius:20,fontWeight:600,background:`${info.couleur}22`,color:info.couleur,border:`1px solid ${info.couleur}44` }}>
            {info.emoji} {info.nom} · {info.prix}
          </div>
          <div style={{ width:28,height:28,borderRadius:"50%",background:`${info.couleur}22`,border:`1px solid ${info.couleur}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12 }}>👤</div>
        </div>
      </div>

      <div style={{ display:"flex",flex:1,overflow:"hidden" }}>

        {/* SIDEBAR */}
        <div style={{ width:210,background:C.dark2,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0 }}>
          <div style={{ flex:1,overflowY:"auto",padding:"8px 0" }}>
            {Object.entries(groupes).map(([grp, mods]) => (
              <div key={grp}>
                <div style={{ fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",padding:"10px 14px 4px",fontWeight:600 }}>{grp}</div>
                {mods.map(m => {
                  const locked = !unlockedIds.includes(m.id);
                  const active = page === m.id;
                  const nextPlan = plan==="starter"?"Business Pro (99€)":"Enterprise (150€)";
                  return (
                    <div key={m.id}
                      onClick={() => locked ? setModalMod(m) : setPage(m.id)}
                      style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 14px",cursor:"pointer",position:"relative",
                        fontSize:12,fontWeight:500,transition:"all 0.15s",
                        borderLeft:`2px solid ${active?info.couleur:"transparent"}`,
                        background:active?`${info.couleur}0E`:"transparent",
                        color:active?info.couleur:locked?C.muted:C.text,
                        opacity:locked?0.65:1,
                      }}
                      onMouseEnter={e => { if(!active) e.currentTarget.style.background="#ffffff08"; }}
                      onMouseLeave={e => { if(!active) e.currentTarget.style.background=active?`${info.couleur}0E`:"transparent"; }}
                    >
                      <span>{m.icon}</span>
                      <span style={{ flex:1 }}>{m.nom}</span>
                      {locked
                        ? <span style={{ fontSize:10 }}>🔒</span>
                        : <span style={{ fontSize:9,color:C.green }}>✓</span>
                      }

                      {/* TOOLTIP */}
                      {locked && (
                        <div style={{ position:"absolute",left:215,top:0,background:"#1A1A32",border:`1px solid ${C.gold}55`,
                          borderRadius:12,padding:14,width:230,zIndex:999,display:"none",boxShadow:"0 8px 32px #00000099",
                          pointerEvents:"none"
                        }}
                          className="sidebar-tooltip"
                        >
                          <div style={{ fontSize:12,fontWeight:700,color:C.gold,marginBottom:8 }}>{m.icon} {m.nom}</div>
                          {(FEATURES[m.id]||[m.desc]).slice(0,4).map((f,i) => (
                            <div key={i} style={{ fontSize:10,color:C.muted,marginBottom:4,display:"flex",gap:5 }}>
                              <span style={{ color:C.gold }}>✦</span>{f}
                            </div>
                          ))}
                          <div style={{ fontSize:14,fontWeight:700,color:C.gold,margin:"8px 0 6px" }}>{m.prix}€<span style={{ fontSize:11,color:C.muted }}>/mois</span></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* AIDE */}
            <div style={{ fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",padding:"10px 14px 4px",fontWeight:600 }}>Support</div>
            <div onClick={() => setPage("aide")} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 14px",cursor:"pointer",
              fontSize:12,fontWeight:500,
              borderLeft:`2px solid ${page==="aide"?info.couleur:"transparent"}`,
              background:page==="aide"?`${info.couleur}0E`:"transparent",
              color:page==="aide"?info.couleur:C.text,
            }}>
              <span>📚</span><span>Centre d'aide</span>
            </div>
          </div>

          {/* UPGRADE BANNER */}
          {plan !== "enterprise" && (
            <div style={{ margin:8,background:"linear-gradient(135deg,#1A1400,#14142A)",border:`1px solid ${C.gold}33`,borderRadius:8,padding:"10px 12px" }}>
              <div style={{ fontSize:11,fontWeight:600,color:C.gold,marginBottom:3 }}>
                {plan==="starter"?"🚀 Passer au Business Pro":"💎 Passer au Enterprise"}
              </div>
              <div style={{ fontSize:10,color:C.muted,marginBottom:8,lineHeight:1.5 }}>
                {plan==="starter"?"10 modules pour 99€/mois":"Tous les modules pour 150€/mois"}
              </div>
              <button onClick={() => setPlan(plan==="starter"?"business_pro":"enterprise")}
                style={{ width:"100%",background:C.gold,color:"#000",border:"none",borderRadius:6,padding:7,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
                Upgrader →
              </button>
            </div>
          )}

          {/* PROGRESS BAR */}
          <div style={{ padding:"10px 14px",borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:5 }}>
              <span>Modules actifs</span>
              <span style={{ color:info.couleur }}>{activeCount}/{totalCount}</span>
            </div>
            <div style={{ height:4,background:C.border,borderRadius:2 }}>
              <div style={{ height:"100%",width:`${(activeCount/totalCount)*100}%`,background:info.couleur,borderRadius:2,transition:"width 0.5s" }} />
            </div>
          </div>
        </div>

        {/* CONTENU */}
        <div style={{ flex:1,padding:20,overflowY:"auto",background:C.dark }}>
          {renderPage()}
        </div>
      </div>

      {/* CSS TOOLTIP HOVER */}
      <style>{`
        div:hover > .sidebar-tooltip { display: block !important; }
      `}</style>
    </div>
  );
}