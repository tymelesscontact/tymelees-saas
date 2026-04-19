"use client";import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

// ─── PALETTE ──────────────────────────────────────────────────
const C = {
  // Sidebar dark navy
  navy:"#0B1220", navy2:"#111827", navyBorder:"rgba(255,255,255,0.06)",
  // Main white
  bg:"#F8FAFC", white:"#FFFFFF", border:"#E2E8F0",
  // Text
  dark:"#0F172A", mid:"#475569", muted:"#94A3B8", light:"#CBD5E1",
  // Brand
  gold:"#C9A84C", goldLight:"#FEF3C7", goldBorder:"#FDE68A",
  // Status
  green:"#10B981", greenBg:"#D1FAE5", red:"#EF4444", redBg:"#FEE2E2",
  blue:"#2563EB", blueBg:"#DBEAFE", blueBorder:"#BFDBFE",
  orange:"#F59E0B", orangeBg:"#FEF3C7",
  purple:"#7C3AED", purpleBg:"#EDE9FE",
  teal:"#0D9488", tealBg:"#CCFBF1",
};

// ─── PLANS ────────────────────────────────────────────────────
const PLANS = {
  starter:  { id:"starter",  nom:"Starter",      prix:"29€/mois",  color:C.blue,   icon:"◎" },
  business: { id:"business", nom:"Business Pro",  prix:"99€/mois",  color:C.gold,   icon:"✦" },
  enterprise:{ id:"enterprise",nom:"Enterprise",  prix:"150€/mois", color:C.purple, icon:"◈" },
  owner:    { id:"owner",    nom:"Owner",          prix:"—",         color:C.gold,   icon:"★" },
};

const FREE_PAGES = ["wallet","cartes","iban","historique","settings","notifications","chat-equipe","pointage"];
const LOCKED_PAGES = ["investissement","annuaire","mises-en-relation","deals","opportunites","missions","propositions","chat-business"];

// ─── NAVIGATION ───────────────────────────────────────────────
const NAV = [
  { title:"Accueil", items:[{ key:"accueil", label:"🏠 Accueil" }] },
  { title:"Mon espace", items:[
    { key:"wallet",     label:"💳 Wallet & paiements" },
    { key:"cartes",     label:"💎 Cartes virtuelles" },
    { key:"iban",       label:"🏦 IBAN mondial" },
    { key:"historique", label:"📜 Historique" },
  ]},
  { title:"Business", items:[
    { key:"vue-ensemble",  label:"📊 Vue d'ensemble" },
    { key:"crm",           label:"📇 CRM" },
    { key:"devis",         label:"🧾 Devis" },
    { key:"comptabilite",  label:"💰 Comptabilité" },
    { key:"tresorerie",    label:"📈 Trésorerie 90 jours" },
    { key:"analytique",    label:"📉 Analytique & CA" },
    { key:"investissement",label:"🔒 Investissement IA", locked:true },
  ]},
  { title:"Réseau", items:[
    { key:"annuaire",          label:"🌍 Annuaire mondial",    locked:true },
    { key:"mises-en-relation", label:"🤝 Mises en relation",   locked:true },
    { key:"deals",             label:"💼 Deals",               locked:true },
    { key:"opportunites",      label:"🚀 Opportunités business",locked:true },
    { key:"missions",          label:"📌 Demandes de missions", locked:true },
    { key:"propositions",      label:"📬 Propositions",         locked:true },
    { key:"chat-business",     label:"💬 Chat business",        locked:true },
  ]},
  { title:"Opérations", items:[
    { key:"planning",     label:"📅 Planning & agenda" },
    { key:"rendez-vous",  label:"📆 Rendez-vous" },
    { key:"reservations", label:"🗓️ Pages de réservation" },
    { key:"services",     label:"🧰 Services" },
    { key:"stock",        label:"📦 Stock" },
    { key:"contrats",     label:"📄 Contrats" },
    { key:"notifications",label:"🔔 Notifications" },
    { key:"formation",    label:"🎓 Formation" },
  ]},
  { title:"Équipe", items:[
    { key:"equipe",          label:"👥 Vue équipe" },
    { key:"pointage",        label:"⏱️ Pointage" },
    { key:"collaborateurs",  label:"➕ Gestion collaborateurs" },
    { key:"chat-equipe",     label:"💬 Chat équipe" },
  ]},
  { title:"Owner", items:[
    { key:"owner",             label:"👑 Centre de contrôle" },
    { key:"kpi",               label:"📊 KPI globaux" },
    { key:"commissions-owner", label:"💸 Commissions Tymeless" },
    { key:"deploiements",      label:"🏢 Déploiements SaaS" },
    { key:"settings",          label:"⚙️ Paramètres" },
  ]},
];

// ─── DATA ─────────────────────────────────────────────────────
const DEVISES=[{code:"EUR",symbol:"€",flag:"🇪🇺",nom:"Euro",taux:1},{code:"XOF",symbol:"₣",flag:"🌍",nom:"Franc CFA",taux:655.96},{code:"USD",symbol:"$",flag:"🇺🇸",nom:"Dollar US",taux:1.08},{code:"GBP",symbol:"£",flag:"🇬🇧",nom:"Livre Sterling",taux:0.86},{code:"MAD",symbol:"د",flag:"🇲🇦",nom:"Dirham",taux:10.82}];
const METHODES=[{id:"wave",nom:"Wave",icon:"🌊",color:C.blue,zone:"Sénégal / Côte d'Ivoire"},{id:"orange",nom:"Orange Money",icon:"🟠",color:C.orange,zone:"Afrique francophone"},{id:"mtn",nom:"MTN Money",icon:"🟡",color:"#FBBF24",zone:"Afrique sub-saharienne"},{id:"carte",nom:"Carte bancaire",icon:"💳",color:C.blue,zone:"Europe / Monde"},{id:"sepa",nom:"Virement SEPA",icon:"🏦",color:C.green,zone:"Europe"},{id:"whatsapp",nom:"WhatsApp Pay",icon:"💬",color:C.green,zone:"Global"}];
const INIT_HISTO=[{id:"PAY-001",type:"entree",libelle:"Paiement Sofia Al-Rashid",montant:2400,devise:"EUR",methode:"Carte",date:"13/04 14:32",statut:"confirmé",com:120},{id:"PAY-002",type:"entree",libelle:"Paiement Pierre Lefevre",montant:4800,devise:"EUR",methode:"Virement SEPA",date:"12/04 09:15",statut:"confirmé",com:240},{id:"PAY-003",type:"sortie",libelle:"Commission Thomas Beaumont",montant:2480,devise:"EUR",methode:"Virement SEPA",date:"11/04 16:00",statut:"envoyé",com:0},{id:"PAY-004",type:"entree",libelle:"Paiement Fatoumata Diop",montant:557480,devise:"XOF",methode:"Wave",date:"10/04 11:20",statut:"confirmé",com:27874}];
const INIT_DEVIS=[{id:"TYM-0044",client:"Isabelle Moreau",service:"Nettoyage Airbnb",montant:320,statut:"en_attente",date:"15/04",tel:"+33 6 12 34 56 78"},{id:"TYM-0043",client:"Marc Dupont",service:"Nettoyage bureaux",montant:580,statut:"en_attente",date:"14/04",tel:"+33 6 98 76 54 32"},{id:"TYM-0042",client:"Sofia Al-Rashid",service:"Jet privé",montant:2400,statut:"validé",date:"13/04",tel:"+33 7 11 22 33 44"},{id:"TYM-0041",client:"Pierre Lefevre",service:"Rapatriement",montant:4800,statut:"validé",date:"12/04",tel:"+33 6 55 44 33 22"}];
const CRM_LEADS=[{nom:"Hotel Prestige Paris",contact:"Claire Bernard",etape:"Proposition",score:92,ca:8000,source:"Annuaire"},{nom:"AirParis Management",contact:"Kevin Mour",etape:"Négociation",score:78,ca:3600,source:"Partenaire"},{nom:"Jet Services Monaco",contact:"Antoine Rivière",etape:"Gagné",score:98,ca:12000,source:"Réseau"},{nom:"Cabinet Delmas",contact:"Me Delmas",etape:"Nouveau",score:55,ca:960,source:"LinkedIn"}];
const CLIENTS=[{nom:"Sofia Al-Rashid",pays:"🇦🇪",ca:9200,statut:"VIP",score:98},{nom:"Jean-Marc Olivier",pays:"🇫🇷",ca:14600,statut:"VIP",score:94},{nom:"Pierre Lefevre",pays:"🇫🇷",ca:5400,statut:"actif",score:85},{nom:"Marc Dupont",pays:"🇫🇷",ca:3200,statut:"actif",score:68}];
const CHARGES=[{cat:"Fournitures nettoyage",mois:420},{cat:"Transport & carburant",mois:380},{cat:"Commissions partenaires",mois:6425},{cat:"Salaires collaborateurs",mois:3200},{cat:"Logiciels & abonnements",mois:180}];
const STOCK=[{art:"Produit vitres Pro",cat:"Nettoyage",qte:3,min:5,u:"L",four:"CleanPro"},{art:"Microfibre premium",cat:"Nettoyage",qte:24,min:20,u:"pcs",four:"TextilePro"},{art:"Désinfectant surfaces",cat:"Nettoyage",qte:8,min:6,u:"L",four:"CleanPro"},{art:"Housses rapatriement",cat:"Rapatriement",qte:2,min:4,u:"pcs",four:"MedSupply"},{art:"Kit bord jet privé",cat:"Jet/Yacht",qte:5,min:3,u:"kits",four:"LuxEquip"},{art:"Produit nacre bois",cat:"Yacht",qte:1,min:3,u:"L",four:"YachtCare"}];
const PLANNING=[{date:"15/04",h:"09:00",client:"Isabelle Moreau",service:"Nettoyage Airbnb",collab:"Abou",statut:"confirmé",type:"mission"},{date:"15/04",h:"14:00",client:"Marc Dupont",service:"Nettoyage bureaux",collab:"Thomas",statut:"confirmé",type:"mission"},{date:"17/04",h:"14:00",client:"Isabelle Moreau",service:"RDV client",collab:"Béné",statut:"confirmé",type:"rdv"},{date:"18/04",h:"10:00",client:"Sofia Al-Rashid",service:"RDV VIP",collab:"Béné",statut:"confirmé",type:"rdv"}];
const NOTIFS=[{id:1,type:"urgent",icon:"⚠️",titre:"2 devis en attente de validation",h:"09:00",lu:false},{id:2,type:"urgent",icon:"📦",titre:"Stock critique — Produit vitres + 2 articles",h:"08:30",lu:false},{id:3,type:"money",icon:"💰",titre:"Commission Leila Mansouri : 1 305€ à payer",h:"Hier",lu:true},{id:4,type:"good",icon:"⭐",titre:"Nouvel avis 5★ — Sofia Al-Rashid",h:"Hier",lu:true}];
const MSGS_EQUIPE=[{id:1,auteur:"Thomas",msg:"Béné, prospect Dupont confirmé 🙌",h:"09:14",lu:true},{id:2,auteur:"Abou",msg:"Nettoyage Montmartre terminé ✅",h:"10:32",lu:true},{id:3,auteur:"Abou",msg:"Produit vitres épuisé, je rachète ?",h:"13:20",lu:false},{id:4,auteur:"Thomas",msg:"Rappel rapatriement demain 8h ✈️",h:"14:45",lu:false}];
const INIT_CARTES=[{id:"CRD-001",nom:"Béné — Pro",numero:"4532 •••• •••• 7821",reseau:"Visa",solde:2400,limite:5000,statut:"active",devise:"EUR",expiry:"12/27"},{id:"CRD-002",nom:"Thomas Beaumont",numero:"5261 •••• •••• 3344",reseau:"Mastercard",solde:850,limite:2000,statut:"active",devise:"EUR",expiry:"08/26"},{id:"CRD-003",nom:"Fatoumata Diop",numero:"4111 •••• •••• 9902",reseau:"Visa",solde:320000,limite:500000,statut:"active",devise:"XOF",expiry:"03/27"}];
const TRESO=[{sem:"S16",e:6480,s:3200,sol:8240},{sem:"S17",e:5200,s:4100,sol:9340},{sem:"S18",e:7800,s:3500,sol:13640},{sem:"S19",e:6100,s:6800,sol:12940},{sem:"S20",e:8400,s:3200,sol:18140},{sem:"S21",e:9200,s:4400,sol:22940,p:true},{sem:"S22",e:7600,s:3100,sol:27440,p:true},{sem:"S23",e:10200,s:5200,sol:32440,p:true}];

// ─── UTILS ────────────────────────────────────────────────────
const fmt=(m,d="EUR")=>{const dv=DEVISES.find(x=>x.code===d);if(d==="XOF")return Math.round(m).toLocaleString("fr")+" "+(dv?.symbol||"₣");return Number(m).toLocaleString("fr",{minimumFractionDigits:0,maximumFractionDigits:2})+" "+(dv?.symbol||"€");};
const conv=(m,de,ve)=>{const f=DEVISES.find(x=>x.code===de),t=DEVISES.find(x=>x.code===ve);return(!f||!t)?m:(m/f.taux)*t.taux;};
const inits=(n)=>n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

// ─── ATOMS ────────────────────────────────────────────────────
const Card=({children,style={}})=><div style={{background:C.white,borderRadius:20,padding:22,boxShadow:"0 4px 20px rgba(15,23,42,0.07)",border:`1px solid ${C.border}`,...style}}>{children}</div>;
const CardTitle=({children,action})=><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><div style={{fontSize:15,fontWeight:700,color:C.dark}}>{children}</div>{action}</div>;

const Badge=({label,color,bg})=><span style={{background:bg||color+"20",color,border:`1px solid ${color}40`,borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;

const Btn=({children,v="primary",onClick,sm,full,disabled})=>{
  const S={primary:{bg:C.dark,fg:"#fff"},gold:{bg:C.gold,fg:C.dark},ghost:{bg:C.bg,fg:C.mid,border:`1px solid ${C.border}`},green:{bg:C.greenBg,fg:C.green},red:{bg:C.redBg,fg:C.red},blue:{bg:C.blueBg,fg:C.blue}};
  const x=S[v]||S.primary;
  return <button onClick={onClick} disabled={disabled} style={{background:disabled?"#E2E8F0":x.bg,color:disabled?C.muted:x.fg,border:x.border||"none",borderRadius:12,padding:sm?"5px 12px":"9px 18px",cursor:disabled?"not-allowed":"pointer",fontSize:sm?11:13,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap",width:full?"100%":"auto",opacity:disabled?0.6:1,transition:"all 0.15s"}}>{children}</button>;
};

const Inp=({placeholder,value,onChange,type="text",style={}})=><input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:C.dark,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",...style}}/>;

const Sel=({value,onChange,options,style={}})=><select value={value} onChange={onChange} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:C.dark,fontSize:13,fontFamily:"inherit",outline:"none",...style}}>{options.map((o,i)=><option key={i} value={o.v||o}>{o.l||o}</option>)}</select>;

const TH=({heads,rows})=><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{heads.map((h,i)=><th key={i} style={{color:C.muted,fontSize:11,letterSpacing:"0.06em",textTransform:"uppercase",padding:"10px 14px",borderBottom:`2px solid ${C.border}`,textAlign:"left",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead><tbody>{rows}</tbody></table></div>;
const Td=({children,s={}})=><td style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,verticalAlign:"middle",...s}}>{children}</td>;

const KPI=({label,val,sub,trend,up,color,onClick,badge})=>(
  <Card style={{cursor:onClick?"pointer":"default"}} onClick={onClick}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <div style={{fontSize:12,color:C.muted,fontWeight:500}}>{label}</div>
      {badge>0&&<span style={{background:C.redBg,color:C.red,borderRadius:999,padding:"2px 8px",fontSize:10,fontWeight:700}}>{badge}</span>}
    </div>
    <div style={{fontSize:26,fontWeight:800,color:color||C.dark,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.1}}>{val}</div>
    {sub&&<div style={{fontSize:11,color:C.muted,marginTop:4}}>{sub}</div>}
    {trend&&<div style={{fontSize:11,color:up?C.green:C.orange,marginTop:4,fontWeight:500}}>{up?"↗":"⚠"} {trend}</div>}
  </Card>
);

const Tabs=({tabs,active,onChange})=>(
  <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap",borderBottom:`1px solid ${C.border}`,paddingBottom:0}}>
    {tabs.map(t=>(
      <button key={t.id} onClick={()=>onChange(t.id)} style={{background:"transparent",border:"none",borderBottom:`2px solid ${active===t.id?C.gold:"transparent"}`,color:active===t.id?C.dark:C.muted,padding:"8px 16px",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:active===t.id?700:500,transition:"all 0.2s"}}>{t.label}</button>
    ))}
  </div>
);

const Avatar=({nom,color=C.gold,size=36})=>(
  <div style={{width:size,height:size,borderRadius:"50%",background:color+"20",border:`2px solid ${color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,color,fontWeight:700,flexShrink:0}}>{inits(nom)}</div>
);

const SectionTitle=({children,sub,action})=>(
  <div style={{marginBottom:22,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
    <div>
      <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:24,fontWeight:700,color:C.dark}}>{children}</div>
      {sub&&<div style={{fontSize:13,color:C.muted,marginTop:3}}>{sub}</div>}
    </div>
    {action}
  </div>
);

// ─── STATUT BADGES ────────────────────────────────────────────
const STATUS={
  "en_attente":{c:C.orange,bg:C.orangeBg,l:"⏳ En attente"},
  "validé":{c:C.green,bg:C.greenBg,l:"✓ Validé"},
  "refusé":{c:C.red,bg:C.redBg,l:"✕ Refusé"},
  "confirmé":{c:C.green,bg:C.greenBg,l:"✓ Confirmé"},
  "envoyé":{c:C.blue,bg:C.blueBg,l:"✓ Envoyé"},
  "actif":{c:C.green,bg:C.greenBg,l:"● Actif"},
  "VIP":{c:C.gold,bg:C.goldLight,l:"✦ VIP"},
  "mission":{c:C.blue,bg:C.blueBg,l:"◈ Mission"},
  "rdv":{c:C.purple,bg:C.purpleBg,l:"◎ RDV"},
  "active":{c:C.green,bg:C.greenBg,l:"● Active"},
  "bloquée":{c:C.red,bg:C.redBg,l:"🔒 Bloquée"},
};
const St=({s})=>{const m=STATUS[s]||{c:C.muted,bg:C.bg,l:s};return <Badge label={m.l} color={m.c} bg={m.bg}/>;};

// ─── UPGRADE WALL ─────────────────────────────────────────────
const UpgradeWall=({page,onUpgrade})=>(
  <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{maxWidth:560,width:"100%"}}>
      <div style={{background:C.bg,borderRadius:20,overflow:"hidden",border:`1px solid ${C.border}`,marginBottom:24,filter:"blur(3px)",opacity:0.5,height:120,padding:20}}>
        <div style={{height:16,background:C.border,borderRadius:8,width:"60%",marginBottom:12}}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{[1,2,3].map(i=><div key={i} style={{height:50,background:C.border,borderRadius:12}}/>)}</div>
      </div>
      <Card style={{borderColor:`${C.gold}50`}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{fontSize:40,marginBottom:10}}>🔒</div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:700,color:C.dark,marginBottom:6}}>Fonctionnalité Business Pro</div>
          <div style={{fontSize:13,color:C.muted}}>Tu vois le module mais tu ne peux pas encore l'utiliser</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
          <div style={{background:C.bg,borderRadius:14,padding:16,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Ton plan</div>
            <div style={{fontWeight:700,color:C.blue,fontSize:15,marginBottom:4}}>◎ Starter</div>
            <div style={{fontSize:12,color:C.gold,marginBottom:12}}>29€/mois</div>
            {["Wallet & paiements","Carte virtuelle Visa","IBAN mondial","Historique"].map((f,i)=><div key={i} style={{fontSize:12,color:C.green,marginBottom:3}}>✓ {f}</div>)}
          </div>
          <div style={{background:C.goldLight,borderRadius:14,padding:16,border:`1px solid ${C.goldBorder}`}}>
            <div style={{fontSize:11,color:C.gold,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>Passer à</div>
            <div style={{fontWeight:700,color:C.gold,fontSize:15,marginBottom:4}}>✦ Business Pro</div>
            <div style={{fontSize:12,color:C.gold,marginBottom:12}}>99€/mois</div>
            {["Réseau & Annuaire B2B mondial","Mises en relation + commissions","Prospection automatique","CRM + Devis + Comptabilité","Investissement IA"].map((f,i)=><div key={i} style={{fontSize:12,color:C.dark,marginBottom:3}}>✦ {f}</div>)}
          </div>
        </div>
        <Btn v="gold" full onClick={()=>onUpgrade("business")}>✦ Passer Business Pro — 99€/mois</Btn>
        <div style={{marginTop:10}}><Btn v="ghost" full onClick={()=>onUpgrade("enterprise")}>◈ Ou passer Enterprise — 150€/mois (Bot WhatsApp inclus)</Btn></div>
        <div style={{textAlign:"center",marginTop:12,fontSize:11,color:C.muted}}>Sans engagement · Résiliation à tout moment · Accès immédiat</div>
      </Card>
    </div>
  </div>
);

// ─── MODAL PAIEMENT ───────────────────────────────────────────
const ModalPaiement=({onClose,onSend})=>{
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({nom:"",tel:"",montant:"",devise:"EUR",methode:"whatsapp",desc:""});
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
      <Card style={{width:500,maxWidth:"95vw",borderColor:`${C.teal}50`}}>
        <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,marginBottom:4}}>Demander un paiement</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Lien WhatsApp · Facture auto après paiement</div>
        {step===1&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[["Nom du client","nom","text","Isabelle Moreau"],["Numéro WhatsApp","tel","text","+33 6 12 34 56 78"],["Description","desc","text","Nettoyage Airbnb — Montmartre"]].map(([l,k,t,ph])=>(
              <div key={k}><div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:500}}>{l}</div><Inp type={t} placeholder={ph} value={form[k]} onChange={set(k)}/></div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:500}}>Montant</div><Inp type="number" placeholder="500" value={form.montant} onChange={set("montant")}/></div>
              <div><div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:500}}>Devise</div><Sel value={form.devise} onChange={set("devise")} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:4}}><Btn v="ghost" full onClick={onClose}>Annuler</Btn><Btn v="gold" full onClick={()=>setStep(2)} disabled={!form.nom||!form.tel||!form.montant}>Suivant →</Btn></div>
          </div>
        )}
        {step===2&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:500,marginBottom:4}}>Moyen de paiement</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {METHODES.map(mp=>(
                <button key={mp.id} onClick={()=>setForm(p=>({...p,methode:mp.id}))} style={{background:form.methode===mp.id?mp.color+"15":C.bg,border:`1.5px solid ${form.methode===mp.id?mp.color:C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{mp.icon}</div>
                  <div style={{fontSize:12,fontWeight:600,color:form.methode===mp.id?mp.color:C.dark}}>{mp.nom}</div>
                  <div style={{fontSize:10,color:C.muted}}>{mp.zone}</div>
                </button>
              ))}
            </div>
            <div style={{background:"#075E54",borderRadius:14,padding:14}}>
              <div style={{fontSize:10,color:"#25D366",marginBottom:6,fontWeight:600}}>💬 Aperçu WhatsApp</div>
              <div style={{background:"#128C7E",borderRadius:"12px 12px 12px 2px",padding:"10px 14px",fontSize:12,color:"#fff",lineHeight:1.7}}>
                Bonjour {form.nom||"[Nom]"} 👋<br/>Lien de paiement Tymeless :<br/><span style={{color:"#25D366"}}>https://pay.tymeless.fr/link</span><br/>💰 {form.montant?fmt(Number(form.montant),form.devise):"[montant]"} · {form.desc||"[description]"}<br/><span style={{fontSize:10,color:"#aaa"}}>Facture envoyée automatiquement ✅</span>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}><Btn v="ghost" full onClick={()=>setStep(1)}>← Retour</Btn><Btn v="gold" full onClick={()=>{onSend(form);onClose();}}>📲 Envoyer sur WhatsApp</Btn></div>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── PAGES ────────────────────────────────────────────────────

// ACCUEIL
const PageAccueil=({setPage,plan})=>{
  const pending=INIT_DEVIS.filter(d=>d.statut==="en_attente").length;
  const stockAlerts=STOCK.filter(s=>s.qte<s.min).length;
  return(
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:28,fontWeight:700,color:C.dark}}>Bonjour Béné ✦</div>
        <div style={{fontSize:13,color:C.muted,marginTop:3}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · Tymeless OS · Espace Owner · Tymeless OS · Espace Owner</div>
      </div>
      <Card style={{marginBottom:20,borderColor:`${C.gold}50`,background:`linear-gradient(135deg,#FFFBEB,${C.white})`}}>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <div style={{fontSize:32}}>📊</div>
          <div>
            <div style={{fontWeight:700,color:C.gold,marginBottom:4,fontSize:15}}>Briefing du jour — 16 avril 2026</div>
            <div style={{fontSize:13,color:C.mid,lineHeight:1.8}}>CA hebdo : <b style={{color:C.dark}}>6 480 €</b> · {pending} devis en attente · {stockAlerts} alertes stock · NPS : <b style={{color:C.green}}>4.9/5 ✦</b></div>
          </div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KPI label="CA ce mois" val="24 380 €" sub="Avril 2026" trend="+12% vs mars" up={true}/>
        <KPI label="Devis en attente" val={pending} sub="Validation requise" trend="Action requise" up={false} onClick={()=>setPage("devis")} badge={pending}/>
        <KPI label="Marge nette" val="61%" sub="Tous services" trend="+4pts vs T1" up={true} color={C.green}/>
        <KPI label="Alertes stock" val={stockAlerts} sub="Réappro. urgent" trend="Urgent" up={false} onClick={()=>setPage("stock")} badge={stockAlerts}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr",gap:14,marginBottom:20}}>
        <Card>
          <CardTitle>🚀 Actions rapides</CardTitle>
          <div style={{display:"grid",gap:8}}>
            {[["Envoyer un paiement","wallet"],["Créer un devis","devis"],["Voir le planning","planning"],["Accueil équipe","equipe"]].map(([l,p])=>(
              <button key={l} onClick={()=>setPage(p)} style={{background:C.dark,color:"#fff",border:"none",borderRadius:12,padding:"11px 14px",cursor:"pointer",textAlign:"left",fontWeight:600,fontSize:13,fontFamily:"inherit",transition:"opacity 0.15s"}}>{l}</button>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>👥 Mon équipe</CardTitle>
          {[{n:"Thomas 🤖",r:"Bot Prospection",s:"actif"},{n:"Abou 🤖",r:"Bot Nettoyage",s:"actif"},{n:"Fatou 👤",r:"Hôtesse",s:"actif"}].map((e,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<2?`1px solid ${C.border}`:undefined}}>
              <Avatar nom={e.n} size={32}/>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.dark}}>{e.n}</div><div style={{fontSize:11,color:C.muted}}>{e.r}</div></div>
              <Badge label="● Actif" color={C.green} bg={C.greenBg}/>
            </div>
          ))}
        </Card>
        <Card>
          <CardTitle>🔔 Notifications</CardTitle>
          {NOTIFS.filter(n=>!n.lu).slice(0,3).map((n,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"7px 0",borderBottom:i<1?`1px solid ${C.border}`:undefined}}>
              <span style={{fontSize:16}}>{n.icon}</span>
              <div><div style={{fontSize:12,fontWeight:600,color:C.dark}}>{n.titre}</div><div style={{fontSize:10,color:C.muted}}>{n.h}</div></div>
            </div>
          ))}
          <div style={{marginTop:10}}><Btn v="ghost" onClick={()=>setPage("notifications")} sm>Voir tout →</Btn></div>
        </Card>
      </div>
      {plan==="starter"&&(
        <Card style={{borderColor:`${C.gold}50`,background:`linear-gradient(135deg,${C.goldLight},${C.white})`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontWeight:700,color:C.gold,fontSize:15,marginBottom:4}}>✦ Passe Business Pro pour tout débloquer</div>
              <div style={{fontSize:13,color:C.mid}}>Réseau B2B mondial · Annuaire · Mises en relation · Investissement IA · Commissions automatiques</div>
            </div>
            <Btn v="gold" onClick={()=>setPage("settings")}>Passer Business Pro →</Btn>
          </div>
        </Card>
      )}
    </div>
  );
};

// WALLET
const PageWallet=()=>{
  const [tab,setTab]=useState("wallet");
  const [histo,setHisto]=useState(INIT_HISTO);
  const [demande,setDemande]=useState(false);
  const [toast,setToast]=useState(null);
  const [devise,setDevise]=useState("EUR");
  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),4000);};
  const entrees=histo.filter(h=>h.type==="entree").reduce((s,h)=>s+conv(h.montant,h.devise,"EUR"),0);
  const sorties=histo.filter(h=>h.type==="sortie").reduce((s,h)=>s+conv(h.montant,h.devise,"EUR"),0);
  const soldeEUR=entrees-sorties;
  const solde=devise==="EUR"?soldeEUR:conv(soldeEUR,"EUR",devise);
  return(
    <div>
      {toast&&<div style={{position:"fixed",top:20,right:20,background:C.green,color:"#fff",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,0.15)"}}>{toast}</div>}
      {demande&&<ModalPaiement onClose={()=>setDemande(false)} onSend={f=>showToast(`📲 Lien envoyé à ${f.nom} sur WhatsApp`)}/>}
      <SectionTitle action={<div style={{display:"flex",gap:10,alignItems:"center"}}><Sel value={devise} onChange={e=>setDevise(e.target.value)} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))} style={{width:120}}/><Btn v="gold" onClick={()=>setDemande(true)}>📲 Demander un paiement</Btn></div>}>💳 Wallet & Paiements</SectionTitle>
      
      {/* HERO SOLDE */}
      <Card style={{marginBottom:20,background:`linear-gradient(135deg,${C.navy},${C.navy2})`,border:"none"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>Solde Wallet Tymeless</div>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:42,fontWeight:700,color:"#fff",lineHeight:1}}>{fmt(solde,devise)}</div>
            {devise!=="EUR"&&<div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:4}}>≈ {fmt(soldeEUR,"EUR")}</div>}
          </div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            {[{l:"Encaissé",v:fmt(entrees,"EUR"),c:"#34D399"},{l:"Décaissé",v:fmt(sorties,"EUR"),c:"#F87171"},{l:"Commissions 5%",v:fmt(histo.reduce((s,h)=>s+(h.com||0),0),"EUR"),c:"#A78BFA"}].map((k,i)=>(
              <div key={i} style={{borderLeft:`2px solid ${k.c}`,paddingLeft:12}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:3}}>{k.l}</div>
                <div style={{fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Tabs tabs={[{id:"wallet",label:"Vue générale"},{id:"encaisser",label:"Encaisser"},{id:"historique",label:"Historique"},{id:"devises",label:"Devises"}]} active={tab} onChange={setTab}/>

      {tab==="wallet"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
            {METHODES.map((m,i)=>(
              <Card key={i}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><span style={{fontSize:22}}>{m.icon}</span><div><div style={{fontWeight:600,fontSize:13,color:C.dark}}>{m.nom}</div><div style={{fontSize:11,color:C.muted}}>{m.zone}</div></div></div>
                <Btn v="ghost" full onClick={()=>setDemande(true)} sm>Encaisser →</Btn>
              </Card>
            ))}
          </div>
          <Card>
            <CardTitle>Dernières transactions</CardTitle>
            <TH heads={["Date","Libellé","Montant","Méthode","Statut"]} rows={histo.slice(0,5).map((h,i)=>(
              <tr key={i}>
                <Td><span style={{fontSize:11,color:C.muted}}>{h.date}</span></Td>
                <Td><span style={{fontWeight:600,color:C.dark}}>{h.libelle}</span></Td>
                <Td><span style={{fontWeight:700,color:h.type==="entree"?C.green:C.red,fontSize:14}}>{h.type==="entree"?"+":"–"}{fmt(h.montant,h.devise)}</span></Td>
                <Td><span style={{fontSize:12,color:C.mid}}>{h.methode}</span></Td>
                <Td><St s={h.statut}/></Td>
              </tr>
            ))}/>
          </Card>
        </div>
      )}
      {tab==="encaisser"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <Card style={{borderColor:`${C.teal}40`}}>
            <CardTitle>Demander un paiement WhatsApp</CardTitle>
            <div style={{fontSize:13,color:C.mid,lineHeight:1.8,marginBottom:20}}>Envoyez un <b style={{color:C.teal}}>lien de paiement</b> directement sur WhatsApp. Le client paie avec son moyen préféré. La <b style={{color:C.dark}}>facture est générée automatiquement</b>.</div>
            <Btn v="gold" full onClick={()=>setDemande(true)}>📲 Créer un lien de paiement</Btn>
          </Card>
          <Card>
            <CardTitle>Comment ça marche</CardTitle>
            {[{n:1,t:"Nom, numéro WhatsApp, montant et devise"},{n:2,t:"Lien envoyé — le client clique et paie"},{n:3,t:"Wave, Orange Money, MTN, Carte bancaire…"},{n:4,t:"Wallet crédité · 5% prélevés automatiquement"},{n:5,t:"Facture générée et envoyée par WhatsApp"}].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:10}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:C.goldLight,border:`1px solid ${C.goldBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.gold,fontWeight:700,flexShrink:0}}>{s.n}</div>
                <div style={{fontSize:13,color:C.mid,lineHeight:1.5,paddingTop:3}}>{s.t}</div>
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab==="historique"&&(
        <Card>
          <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>{["Tout","Entrées","Sorties"].map(f=><Btn key={f} v="ghost" sm>{f}</Btn>)}<div style={{marginLeft:"auto",display:"flex",gap:7}}><Btn sm v="ghost">📥 Excel</Btn><Btn sm v="ghost">📄 PDF</Btn></div></div>
          <TH heads={["Date","Libellé","Montant","≈ EUR","Méthode","Com. 5%","Statut"]} rows={histo.map((h,i)=>(
            <tr key={i}>
              <Td><span style={{fontSize:11,color:C.muted}}>{h.date}</span></Td>
              <Td><span style={{fontWeight:600,color:C.dark}}>{h.libelle}</span></Td>
              <Td><span style={{fontWeight:700,color:h.type==="entree"?C.green:C.red,fontSize:14}}>{h.type==="entree"?"+":"–"}{fmt(h.montant,h.devise)}</span></Td>
              <Td>{h.devise!=="EUR"&&<span style={{fontSize:11,color:C.muted}}>{fmt(conv(h.montant,h.devise,"EUR"),"EUR")}</span>}</Td>
              <Td><span style={{fontSize:12,color:C.mid}}>{h.methode}</span></Td>
              <Td>{h.com>0?<span style={{color:C.purple,fontWeight:600,fontSize:12}}>{fmt(h.com,"EUR")}</span>:<span style={{color:C.muted}}>—</span>}</Td>
              <Td><St s={h.statut}/></Td>
            </tr>
          ))}/>
        </Card>
      )}
      {tab==="devises"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
            {DEVISES.map((d,i)=>(
              <Card key={i} style={{borderColor:d.code===devise?`${C.gold}50`:C.border}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><span style={{fontSize:24}}>{d.flag}</span><div><div style={{fontWeight:700,fontSize:13,color:d.code===devise?C.gold:C.dark}}>{d.nom}</div><div style={{fontSize:11,color:C.muted}}>{d.code} · {d.symbol}</div></div></div>
                <div style={{background:C.bg,borderRadius:8,padding:"7px 10px",fontSize:12,marginBottom:10}}><span style={{color:C.muted}}>1 EUR = </span><span style={{color:C.dark,fontWeight:700}}>{d.taux} {d.symbol}</span></div>
                <Btn sm v={d.code===devise?"ghost":"gold"} full onClick={()=>setDevise(d.code)}>{d.code===devise?"✓ Active":"Sélectionner"}</Btn>
              </Card>
            ))}
          </div>
          <Card style={{borderColor:`${C.teal}40`}}>
            <CardTitle>Convertisseur temps réel</CardTitle>
            <div style={{display:"flex",gap:14,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:100}}><div style={{fontSize:11,color:C.muted,marginBottom:5}}>Montant</div><Inp type="number" placeholder="1000"/></div>
              <div style={{flex:1,minWidth:140}}><div style={{fontSize:11,color:C.muted,marginBottom:5}}>De</div><Sel value={devise} onChange={e=>setDevise(e.target.value)} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))}/></div>
              <div style={{fontSize:20,color:C.muted,paddingBottom:8}}>→</div>
              <div style={{flex:1,minWidth:140}}><div style={{fontSize:11,color:C.muted,marginBottom:5}}>Vers</div><Sel value="XOF" onChange={()=>{}} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))}/></div>
              <div style={{background:C.goldLight,border:`1px solid ${C.goldBorder}`,borderRadius:12,padding:"10px 18px",textAlign:"center",minWidth:140}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:3}}>1000 EUR =</div>
                <div style={{fontSize:20,fontWeight:800,color:C.gold,fontFamily:"'Playfair Display',Georgia,serif"}}>655 960 ₣</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// CARTES VIRTUELLES
const PageCartes=()=>{
  const [cartes,setCartes]=useState(INIT_CARTES);
  const [reveal,setReveal]=useState({});
  const [modal,setModal]=useState(false);
  const bloquer=id=>setCartes(p=>p.map(c=>c.id===id?{...c,statut:c.statut==="active"?"bloquée":"active"}:c));
  return(
    <div>
      <SectionTitle action={<Btn v="gold" onClick={()=>setModal(true)}>+ Créer une carte virtuelle</Btn>}>💎 Cartes Virtuelles</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KPI label="Cartes actives" val={cartes.filter(c=>c.statut==="active").length} color={C.green}/>
        <KPI label="Solde total (€)" val={`${cartes.filter(c=>c.statut==="active"&&c.devise==="EUR").reduce((s,c)=>s+c.solde,0).toLocaleString("fr")} €`} color={C.gold}/>
        <KPI label="Cartes bloquées" val={cartes.filter(c=>c.statut==="bloquée").length} color={C.red}/>
        <KPI label="Membres équipés" val={cartes.length} color={C.blue}/>
      </div>
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
          <Card style={{width:420}}>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,marginBottom:20}}>Créer une carte virtuelle</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[["Nom du titulaire","text","Prénom Nom"],["Limite maximale","number","5000"]].map(([l,t,ph],i)=>(
                <div key={i}><div style={{fontSize:11,color:C.muted,marginBottom:5}}>{l}</div><Inp type={t} placeholder={ph}/></div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:5}}>Devise</div><Sel value="EUR" onChange={()=>{}} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))}/></div>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:5}}>Plan membre</div><Sel value="Starter" onChange={()=>{}} options={["Starter","Business Pro","Enterprise","Owner"].map(o=>({v:o,l:o}))}/></div>
              </div>
              <div style={{background:C.blueBg,borderRadius:10,padding:10,fontSize:12,color:C.blue}}>🌍 Carte Visa virtuelle · Utilisable partout · via Flutterwave</div>
              <div style={{display:"flex",gap:10}}><Btn v="ghost" full onClick={()=>setModal(false)}>Annuler</Btn><Btn v="gold" full onClick={()=>setModal(false)}>✓ Créer la carte</Btn></div>
            </div>
          </Card>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
        {cartes.map((c,i)=>{
          const col=c.reseau==="Visa"?C.blue:C.purple;
          const pct=Math.min((c.solde/c.limite)*100,100);
          return(
            <div key={i} style={{borderRadius:20,overflow:"hidden",border:`1px solid ${c.statut==="active"?col+"40":C.redBg}`,boxShadow:"0 4px 20px rgba(15,23,42,0.07)",opacity:c.statut==="bloquée"?0.7:1}}>
              <div style={{background:`linear-gradient(135deg,${C.navy},${col}40)`,padding:"24px 24px 20px",position:"relative",minHeight:140}}>
                <div style={{position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:"50%",background:col+"15"}}/>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                  <div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.15em"}}>{c.type}</div><div style={{fontWeight:700,fontSize:15,color:"#fff",marginTop:3}}>{c.nom}</div></div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}><span style={{fontSize:12,fontWeight:700,color:col}}>{c.reseau}</span>{c.statut==="bloquée"&&<Badge label="🔒 Bloquée" color={C.red} bg={C.redBg}/>}</div>
                </div>
                <div style={{fontFamily:"monospace",fontSize:16,color:"rgba(255,255,255,0.9)",letterSpacing:"0.1em",marginBottom:14}}>{reveal[c.id]?c.numero.replace(/•/g,"X"):c.numero}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                  <div><div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>Expiry</div><div style={{fontSize:12,color:"#fff"}}>{c.expiry}</div></div>
                  <div><div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>CVV</div><div style={{fontSize:12,color:"#fff"}}>{reveal[c.id]?"123":"•••"}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>Solde</div><div style={{fontSize:15,fontWeight:700,color:C.gold}}>{fmt(c.solde,c.devise)}</div></div>
                </div>
              </div>
              <div style={{background:C.white,padding:"14px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:6}}><span>Solde utilisé</span><span>{fmt(c.solde,c.devise)} / {fmt(c.limite,c.devise)}</span></div>
                <div style={{height:5,borderRadius:3,background:C.bg}}><div style={{height:"100%",width:`${pct}%`,background:pct>80?C.red:pct>50?C.orange:C.green,borderRadius:3,transition:"width 0.5s"}}/></div>
                <div style={{display:"flex",gap:7,marginTop:12}}>
                  <Btn sm v="ghost" onClick={()=>setReveal(p=>({...p,[c.id]:!p[c.id]}))}>👁 {reveal[c.id]?"Masquer":"Voir détails"}</Btn>
                  <Btn sm v="blue">💳 Recharger</Btn>
                  <Btn sm v={c.statut==="active"?"red":"green"} onClick={()=>bloquer(c.id)}>{c.statut==="active"?"🔒 Bloquer":"🔓 Débloquer"}</Btn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// IBAN
const PageIBAN=()=>{
  const [modal,setModal]=useState(false);
  const MEMBRES_WALLET=[{nom:"Thomas Beaumont",banque:"BNP Paribas",iban:"FR76 3000 4000 0100 0012 3456 789",devise:"EUR",pays:"🇫🇷"},{nom:"Fatoumata Diop",banque:"Ecobank Sénégal",iban:"SN28 SN08 0100 1535 1000 1234 56",devise:"XOF",pays:"🇸🇳"},{nom:"Sofia Al-Rashid",banque:"Emirates NBD",iban:"AE07 0331 2345 6789 0123 456",devise:"EUR",pays:"🇦🇪"}];
  return(
    <div>
      <SectionTitle sub="IBAN de n'importe quel pays · France, Sénégal, Maroc, Émirats, USA..." action={<Btn v="gold" onClick={()=>setModal(true)}>+ Ajouter un IBAN</Btn>}>🏦 IBAN Mondial</SectionTitle>
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
          <Card style={{width:460,borderColor:`${C.teal}50`}}>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,marginBottom:6}}>Ajouter / Modifier IBAN</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:20}}>N'importe quel IBAN mondial — compatible avec tous les pays</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[["IBAN","FR76 3000... ou SN28 SN08... ou AE07..."],["Nom de la banque","BNP Paribas / Ecobank / Emirates NBD..."]].map(([l,ph],i)=>(
                <div key={i}><div style={{fontSize:11,color:C.muted,marginBottom:5}}>{l}</div><Inp placeholder={ph}/></div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:5}}>Pays</div><Sel value="FR" onChange={()=>{}} options={["FR","SN","CI","MA","AE","GB","US","CM","GH","NG"].map(c=>({v:c,l:c}))}/></div>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:5}}>Devise</div><Sel value="EUR" onChange={()=>{}} options={DEVISES.map(d=>({v:d.code,l:`${d.flag} ${d.code}`}))}/></div>
              </div>
              <div style={{background:C.greenBg,borderRadius:10,padding:10,fontSize:12,color:C.green}}>✓ Compatible avec tous les pays · Virements via Flutterwave & SWIFT</div>
              <div style={{display:"flex",gap:10}}><Btn v="ghost" full onClick={()=>setModal(false)}>Annuler</Btn><Btn v="gold" full onClick={()=>setModal(false)}>✓ Enregistrer IBAN</Btn></div>
            </div>
          </Card>
        </div>
      )}
      <Card style={{marginBottom:20,borderColor:`${C.teal}40`,background:`linear-gradient(135deg,#F0FDFA,${C.white})`}}>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <span style={{fontSize:28}}>🌍</span>
          <div style={{fontSize:13,color:C.mid,lineHeight:1.8}}>Chaque <b style={{color:C.dark}}>membre Tymeless</b> dispose de son propre IBAN — <b style={{color:C.teal}}>n'importe quel pays</b>. Les fonds transitent via <b style={{color:C.dark}}>Flutterwave & SWIFT</b>.</div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {MEMBRES_WALLET.map((m,i)=>(
          <Card key={i}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><Avatar nom={m.nom}/><div><div style={{fontWeight:700,color:C.dark,fontSize:13}}>{m.nom}</div><div style={{fontSize:11,color:C.muted}}>{m.pays} · {m.banque}</div></div></div>
            <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:3}}>IBAN</div>
              <div style={{fontFamily:"monospace",fontSize:12,color:C.dark}}>{m.iban}</div>
            </div>
            <div style={{display:"flex",gap:6}}><Btn sm v="ghost">📋 Copier</Btn><Btn sm v="blue">✏️ Modifier</Btn></div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// VUE D'ENSEMBLE
const PageOverview=({setPage})=>{
  const pending=INIT_DEVIS.filter(d=>d.statut==="en_attente").length;
  const ca=24380,ch=CHARGES.reduce((s,c)=>s+c.mois,0);
  return(
    <div>
      <SectionTitle sub="KPIs · Health Score · Missions du jour">📊 Vue d'ensemble</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KPI label="CA Avril 2026" val="24 380 €" trend="+12% vs mars" up={true}/>
        <KPI label="Devis en attente" val={pending} trend="Action requise" up={false} onClick={()=>setPage("devis")} badge={pending}/>
        <KPI label="Marge nette" val={`${Math.round(((ca-ch)/ca)*100)}%`} trend="+4pts vs T1" up={true} color={C.green}/>
        <KPI label="Commissions 5%" val="3 412 €" sub="Auto prélevées" color={C.purple}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16}}>
        <Card>
          <CardTitle>Business Health Score</CardTitle>
          <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:16}}>
            <div style={{position:"relative",flexShrink:0}}>
              <svg width="80" height="80" style={{transform:"rotate(-90deg)"}}><circle cx="40" cy="40" r="32" stroke={C.border} strokeWidth="6" fill="none"/><circle cx="40" cy="40" r="32" stroke={C.gold} strokeWidth="6" fill="none" strokeDasharray={2*Math.PI*32} strokeDashoffset={2*Math.PI*32*0.26} style={{strokeLinecap:"round"}}/></svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:C.dark}}>74</div>
            </div>
            <div><div style={{fontSize:24,fontWeight:800,color:C.dark}}>74/100</div><div style={{fontSize:12,color:C.muted}}>🟡 Bon · À optimiser</div></div>
          </div>
          {[{l:"Conversion devis",v:78,c:C.green},{l:"Satisfaction client",v:91,c:C.gold},{l:"Rentabilité",v:61,c:C.blue},{l:"Réseau actif",v:55,c:C.purple}].map((m,i)=>(
            <div key={i} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:C.mid}}>{m.l}</span><span style={{color:m.c,fontWeight:600}}>{m.v}%</span></div>
              <div style={{height:5,borderRadius:3,background:C.bg}}><div style={{height:"100%",width:`${m.v}%`,background:m.c,borderRadius:3}}/></div>
            </div>
          ))}
        </Card>
        <Card>
          <CardTitle>CA par service</CardTitle>
          <div style={{display:"flex",gap:6,alignItems:"flex-end",height:120,marginBottom:8}}>
            {[{l:"Airbnb",v:42,c:C.gold},{l:"Résid.",v:18,c:C.green},{l:"Bureaux",v:12,c:C.blue},{l:"Jet",v:15,c:C.orange},{l:"Yacht",v:8,c:C.purple},{l:"Rapatr.",v:5,c:C.red}].map((s,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontSize:9,color:s.c,fontWeight:600}}>{s.v}%</div>
                <div style={{width:"100%",height:s.v*2.2,background:`${s.c}20`,border:`1px solid ${s.c}40`,borderRadius:"4px 4px 0 0"}}/>
                <div style={{fontSize:8,color:C.muted,textAlign:"center"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <CardTitle action={<Btn sm v="ghost" onClick={()=>setPage("planning")}>Planning →</Btn>}>Missions & RDV du jour</CardTitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {PLANNING.slice(0,4).map((p,i)=>(
            <div key={i} style={{background:C.bg,border:`1px solid ${p.type==="rdv"?C.purpleBg:C.border}`,borderRadius:12,padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,fontWeight:600,color:p.type==="rdv"?C.purple:C.gold}}>{p.h}</span><St s={p.type}/></div>
              <div style={{fontWeight:600,fontSize:12,color:C.dark,marginBottom:3}}>{p.service}</div>
              <div style={{fontSize:11,color:C.muted}}>{p.client}</div>
              <div style={{fontSize:11,color:C.blue,marginTop:5}}>👤 {p.collab}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// CRM
const PageCRM=()=>{
  const [tab,setTab]=useState("pipeline");
  const etapes=["Nouveau","Qualifié","Proposition","Négociation","Gagné","Perdu"];
  const COLORS={"Nouveau":C.muted,"Qualifié":C.blue,"Proposition":C.gold,"Négociation":C.orange,"Gagné":C.green,"Perdu":C.red};
  return(
    <div>
      <SectionTitle sub="Pipeline commercial · Suivi prospects">📇 CRM</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KPI label="Total prospects" val={CRM_LEADS.length}/>
        <KPI label="CA potentiel" val={`${CRM_LEADS.reduce((s,l)=>s+l.ca,0).toLocaleString("fr")} €`} color={C.gold}/>
        <KPI label="En négociation" val={CRM_LEADS.filter(l=>l.etape==="Négociation").length} color={C.orange}/>
        <KPI label="Taux conversion" val="22%" color={C.green}/>
      </div>
      <Tabs tabs={[{id:"pipeline",label:"Pipeline"},{id:"liste",label:"Liste"}]} active={tab} onChange={setTab}/>
      {tab==="pipeline"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
          {etapes.map(e=>{
            const leads=CRM_LEADS.filter(l=>l.etape===e);
            const col=COLORS[e]||C.muted;
            return(
              <div key={e}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
                  <span style={{fontSize:11,color:col,fontWeight:600}}>{e}</span>
                  <span style={{background:`${col}20`,color:col,borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:700}}>{leads.length}</span>
                </div>
                {leads.map((l,i)=>(
                  <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:10,marginBottom:8,borderLeft:`3px solid ${col}`,boxShadow:"0 2px 8px rgba(15,23,42,0.05)"}}>
                    <div style={{fontWeight:600,fontSize:12,color:C.dark,marginBottom:3}}>{l.nom}</div>
                    <div style={{fontSize:11,color:C.muted,marginBottom:5}}>{l.contact}</div>
                    <div style={{fontSize:12,color:C.gold,fontWeight:700}}>{l.ca.toLocaleString("fr")} €</div>
                  </div>
                ))}
                {leads.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:"14px 0",border:`1px dashed ${C.border}`,borderRadius:10}}>Vide</div>}
              </div>
            );
          })}
        </div>
      )}
      {tab==="liste"&&(
        <Card>
          <TH heads={["Société","Contact","CA Potentiel","Score","Étape","Source"]} rows={CRM_LEADS.map((l,i)=>(
            <tr key={i}>
              <Td><div style={{fontWeight:600,color:C.dark}}>{l.nom}</div></Td>
              <Td>{l.contact}</Td>
              <Td><span style={{fontWeight:700,color:C.gold}}>{l.ca.toLocaleString("fr")} €</span></Td>
              <Td>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:40,height:5,borderRadius:3,background:C.bg}}><div style={{height:"100%",width:`${l.score}%`,background:l.score>=80?C.green:C.gold,borderRadius:3}}/></div>
                  <span style={{fontSize:11,color:C.muted}}>{l.score}</span>
                </div>
              </Td>
              <Td><Badge label={l.etape} color={COLORS[l.etape]||C.muted}/></Td>
              <Td><span style={{fontSize:12,color:C.mid}}>{l.source}</span></Td>
            </tr>
          ))}/>
        </Card>
      )}
    </div>
  );
};

// DEVIS
const PageDevis=()=>{
  const [devis,setDevis]=useState([]);
useEffect(()=>{
  supabase.from("devis").select("*").order("created_at",{ascending:false}).then(({data})=>{if(data)setDevis(data);});
},[]);
  const [f,setF]=useState("tous");
  const filtered=f==="tous"?devis:devis.filter(d=>d.statut===f);
  return(
    <div>
      <SectionTitle action={<Btn v="gold">+ Nouveau devis</Btn>}>🧾 Devis</SectionTitle>
      <Tabs tabs={["tous","en_attente","validé","refusé"].map(x=>({id:x,label:x==="tous"?"Tous":x.replace("_"," ")}))} active={f} onChange={setF}/>
      <Card>
        <TH heads={["Référence","Client","Service","Montant","Date","Statut","Actions"]} rows={filtered.map((d,i)=>(
          <tr key={i} style={{opacity:d.statut==="refusé"?0.5:1}}>
            <Td><span style={{color:C.gold,fontFamily:"monospace",fontSize:12,fontWeight:600}}>{d.id}</span></Td>
            <Td><div style={{fontWeight:600,color:C.dark}}>{d.client}</div><div style={{fontSize:11,color:C.muted}}>{d.tel}</div></Td>
            <Td><span style={{fontSize:13}}>{d.service}</span></Td>
            <Td><span style={{fontWeight:700,fontSize:14,color:C.dark}}>{d.montant.toLocaleString("fr")} €</span></Td>
            <Td><span style={{fontSize:11,color:C.muted}}>{d.date}</span></Td>
            <Td><St s={d.statut}/></Td>
            <Td>
              {d.statut==="en_attente"&&<div style={{display:"flex",gap:6}}>
                <Btn sm v="green" onClick={()=>setDevis(p=>p.map(x=>x.id===d.id?{...x,statut:"validé"}:x))}>✓ Valider</Btn>
                <Btn sm v="red" onClick={()=>setDevis(p=>p.map(x=>x.id===d.id?{...x,statut:"refusé"}:x))}>✕ Refuser</Btn>
              </div>}
              {d.statut==="validé"&&<span style={{fontSize:11,color:C.green,fontWeight:600}}>✓ Envoyé client</span>}
              {d.statut==="refusé"&&<span style={{fontSize:11,color:C.muted}}>Archivé</span>}
            </Td>
          </tr>
        ))}/>
      </Card>
    </div>
  );
};

// COMPTABILITE
const PageCompta=()=>{
  const ca=24380,ch=CHARGES.reduce((s,c)=>s+c.mois,0),marge=ca-ch,tva=Math.round(ca*0.20);
  return(
    <div>
      <SectionTitle sub="Entrées · Sorties · TVA · Bilan mensuel">💰 Comptabilité</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
        {[{l:"CA Brut",v:`${ca.toLocaleString("fr")} €`,c:C.dark},{l:"Charges",v:`${ch.toLocaleString("fr")} €`,c:C.red},{l:"Marge brute",v:`${marge.toLocaleString("fr")} €`,c:C.green},{l:"TVA 20%",v:`${tva.toLocaleString("fr")} €`,c:C.orange},{l:"Résultat net",v:`${(marge-tva*0.1).toLocaleString("fr")} €`,c:C.blue}].map((k,i)=>(
          <Card key={i}><div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:500}}>{k.l}</div><div style={{fontSize:20,fontWeight:800,color:k.c,fontFamily:"'Playfair Display',Georgia,serif"}}>{k.v}</div></Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <CardTitle>Charges — Avril 2026</CardTitle>
          <TH heads={["Catégorie","Montant"]} rows={CHARGES.map((c,i)=>(<tr key={i}><Td><span style={{color:C.dark}}>{c.cat}</span></Td><Td><span style={{color:C.red,fontWeight:600}}>{c.mois.toLocaleString("fr")} €</span></Td></tr>))}/>
          <div style={{marginTop:12,padding:"10px 14px",background:C.bg,borderRadius:10,display:"flex",justifyContent:"space-between"}}><span style={{color:C.muted,fontSize:12}}>TOTAL</span><span style={{color:C.red,fontWeight:700}}>{ch.toLocaleString("fr")} €</span></div>
        </Card>
        <Card>
          <CardTitle>Marge par service</CardTitle>
          {[{s:"Jet privé",v:80,c:C.green},{s:"Rapatriement",v:75,c:C.green},{s:"Yacht",v:72,c:C.green},{s:"Airbnb",v:68,c:C.gold},{s:"Bureaux",v:60,c:C.gold},{s:"Résidentiel",v:50,c:C.orange}].map((m,i)=>(
            <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:C.dark}}>{m.s}</span><span style={{color:m.c,fontWeight:600}}>{m.v}%</span></div>
              <div style={{height:5,borderRadius:3,background:C.bg}}><div style={{height:"100%",width:`${m.v}%`,background:m.c,borderRadius:3}}/></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// TRESORERIE
const PageTresorerie=()=>{
  const max=Math.max(...TRESO.map(s=>s.sol));
  return(
    <div>
      <SectionTitle sub="Projection cash-flow sur 90 jours">📈 Trésorerie 90 jours</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
        <KPI label="Solde actuel" val="8 240 €" color={C.green}/><KPI label="Solde prévu (90j)" val="32 440 €" color={C.gold}/><KPI label="Alerte seuil" val="3 000 €" sub="Notification WhatsApp si en dessous" color={C.orange}/>
      </div>
      <Card style={{marginBottom:16}}>
        <CardTitle>Évolution solde — 8 semaines</CardTitle>
        <div style={{display:"flex",gap:8,alignItems:"flex-end",height:130,marginBottom:8}}>
          {TRESO.map((s,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{fontSize:9,color:s.p?C.green:C.gold,fontWeight:600}}>{Math.round(s.sol/1000)}k</div>
              <div style={{width:"100%",height:s.sol/max*110,background:s.p?`${C.green}20`:`${C.gold}20`,border:`1px solid ${s.p?C.green:C.gold}40`,borderRadius:"4px 4px 0 0"}}/>
              <div style={{fontSize:9,color:s.p?C.green:C.muted,textAlign:"center"}}>{s.sem}{s.p?" *":""}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <TH heads={["Semaine","Entrées","Sorties","Solde","Statut"]} rows={TRESO.map((s,i)=>(
          <tr key={i}>
            <Td><span style={{fontSize:12,color:s.p?C.green:C.dark}}>{s.sem}{s.p?" *":""}</span></Td>
            <Td><span style={{color:C.green,fontWeight:600}}>+{s.e.toLocaleString("fr")} €</span></Td>
            <Td><span style={{color:C.red,fontWeight:600}}>-{s.s.toLocaleString("fr")} €</span></Td>
            <Td><span style={{fontWeight:700,color:s.sol>=3000?C.dark:C.red,fontSize:14}}>{s.sol.toLocaleString("fr")} €</span></Td>
            <Td>{s.sol>=3000?<Badge label="✓ OK" color={C.green} bg={C.greenBg}/>:<Badge label="⚠ Alerte" color={C.red} bg={C.redBg}/>}</Td>
          </tr>
        ))}/>
      </Card>
    </div>
  );
};

// INVESTISSEMENT
const PageInvestissement=()=>{
  const [tab,setTab]=useState("recommandations");
  const [sc,setSc]=useState({collaborateurs:0,services:0,marketing:0,formation:0});
  const ca=24380;
  const impact=sc.collaborateurs*3200+sc.services*2800+sc.marketing*1400+sc.formation*600;
  const invest=sc.collaborateurs*1800+sc.services*500+sc.marketing*800+sc.formation*300;
  const RECO=[
    {icon:"✈️",titre:"Priorité 1 — Développer le Rapatriement",retour:"ROI +340%",urgence:"haute",couleur:C.green,detail:"75% de marge, seulement 5% du CA. Cibler les ambassades africaines à Paris = +14 400€/an.",actions:["Contacter les ambassades Sénégal, Mali, CI à Paris","Partenariat pompes funèbres spécialisées","Budget marketing : 400€/mois"]},
    {icon:"🛥️",titre:"Priorité 2 — Activer Monaco Yacht Club",retour:"ROI +280%",urgence:"haute",couleur:C.gold,detail:"Devis envoyé. 8 missions/mois × 1 800€ = 172 800€/an. Plus gros levier immédiat.",actions:["Relancer cette semaine","Visite démonstration gratuite","Contrat cadre annuel -10%"]},
    {icon:"🤝",titre:"Priorité 3 — Activer le réseau B2B",retour:"ROI +180%",urgence:"moyenne",couleur:C.blue,detail:"5 membres annuaire. 10 mises en relation/mois = +3 000 à 8 000€/mois commissions passives.",actions:["Événement networking 25 avril","Activer prospection Thomas & Abou","Objectif 20 membres avant fin mai"]},
  ];
  return(
    <div>
      <SectionTitle sub="Recommandations IA · Simulateur · Plan d'action chiffré">🔒 Investissement & Croissance IA</SectionTitle>
      <Tabs tabs={[{id:"recommandations",label:"💡 Recommandations IA"},{id:"simulateur",label:"🔢 Simulateur"},{id:"plan",label:"📊 Plan chiffré"}]} active={tab} onChange={setTab}/>
      {tab==="recommandations"&&(
        <div>
          <Card style={{marginBottom:20,borderColor:`${C.gold}50`,background:`linear-gradient(135deg,${C.goldLight},${C.white})`}}>
            <div style={{display:"flex",gap:14,alignItems:"center"}}>
              <span style={{fontSize:28}}>🤖</span>
              <div><div style={{fontWeight:700,color:C.gold,marginBottom:4,fontSize:15}}>Analyse IA — Tymeless Business Intelligence</div><div style={{fontSize:13,color:C.mid,lineHeight:1.7}}>CA actuel : <b style={{color:C.dark}}>24 380 €/mois</b> · Marge : <b style={{color:C.green}}>61%</b> · Potentiel identifié : <b style={{color:C.teal}}>+48 000 €/mois</b></div></div>
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {RECO.map((r,i)=>(
              <Card key={i} style={{borderLeft:`4px solid ${r.couleur}`}}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <span style={{fontSize:26,flexShrink:0}}>{r.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:C.dark,marginBottom:8}}>{r.titre}</div>
                    <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
                      <Badge label={r.retour} color={r.couleur}/>
                      <Badge label={r.urgence==="haute"?"🔴 Urgent":r.urgence==="moyenne"?"🟡 Moyen":"🟢 Long terme"} color={r.urgence==="haute"?C.red:r.urgence==="moyenne"?C.orange:C.green}/>
                    </div>
                    <div style={{fontSize:13,color:C.mid,lineHeight:1.7,marginBottom:12}}>{r.detail}</div>
                    <div style={{background:C.bg,borderRadius:10,padding:12}}>
                      <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.06em"}}>Actions concrètes</div>
                      {r.actions.map((a,j)=><div key={j} style={{display:"flex",gap:8,fontSize:12,color:C.dark,marginBottom:4}}><span style={{color:r.couleur}}>→</span>{a}</div>)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      {tab==="simulateur"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <Card>
            <CardTitle>Paramètres du scénario</CardTitle>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {[{l:"Nouveaux collaborateurs",k:"collaborateurs",max:5,desc:"~3 200€/mois CA",cout:"1 800€/mois"},{l:"Nouveaux services",k:"services",max:3,desc:"~2 800€/mois",cout:"500€ lancement"},{l:"Budget marketing (×100€)",k:"marketing",max:10,desc:"ROI x14",cout:"100€/unité"},{l:"Formations équipe",k:"formation",max:5,desc:"+600€/mois",cout:"300€/formation"}].map(({l,k,max,desc,cout})=>(
                <div key={k}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:13,fontWeight:600,color:C.dark}}>{l}</span>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <button onClick={()=>setSc(p=>({...p,[k]:Math.max(0,p[k]-1)}))} style={{background:C.bg,border:`1px solid ${C.border}`,color:C.dark,width:28,height:28,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:16}}>−</button>
                      <span style={{fontSize:16,fontWeight:800,color:C.gold,minWidth:20,textAlign:"center"}}>{sc[k]}</span>
                      <button onClick={()=>setSc(p=>({...p,[k]:Math.min(max,p[k]+1)}))} style={{background:C.bg,border:`1px solid ${C.border}`,color:C.dark,width:28,height:28,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:16}}>+</button>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>{desc} · <span style={{color:C.orange}}>Coût : {cout}</span></div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Card style={{borderColor:`${C.teal}40`}}>
              <CardTitle>Résultat</CardTitle>
              {[{l:"CA actuel",v:`${ca.toLocaleString("fr")} €`,c:C.muted},{l:"Impact CA estimé",v:`+${impact.toLocaleString("fr")} €`,c:impact>0?C.green:C.muted},{l:"CA prévisionnel",v:`${(ca+impact).toLocaleString("fr")} €`,c:C.gold},{l:"Investissement",v:`-${invest.toLocaleString("fr")} €`,c:C.red},{l:"ROI mensuel",v:invest>0?`x${Math.round(impact/invest*10)/10}`:"—",c:C.purple}].map((k,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<4?`1px solid ${C.border}`:undefined}}><span style={{fontSize:13,color:C.muted}}>{k.l}</span><span style={{fontSize:15,fontWeight:700,color:k.c}}>{k.v}</span></div>
              ))}
            </Card>
            <Card style={{borderColor:`${C.gold}40`}}>
              <CardTitle>Recommandation IA</CardTitle>
              <div style={{fontSize:13,color:C.mid,lineHeight:1.7}}>
                {invest===0&&<span style={{color:C.muted}}>Ajuste les paramètres pour voir les projections...</span>}
                {invest>0&&impact/invest>3&&<span>🟢 <b style={{color:C.green}}>Excellent</b> — ROI {">"} 3x. Lancer immédiatement.</span>}
                {invest>0&&impact/invest>=1&&impact/invest<=3&&<span>🟡 <b style={{color:C.orange}}>Viable</b> — ROI entre 1x et 3x.</span>}
                {invest>0&&impact/invest<1&&<span>🔴 <b style={{color:C.red}}>Risqué</b> — Investissement dépasse le CA généré.</span>}
              </div>
            </Card>
          </div>
        </div>
      )}
      {tab==="plan"&&(
        <Card>
          <CardTitle>Plan d'action 2026 — Chiffré et priorisé</CardTitle>
          <TH heads={["#","Action","Investissement","CA généré","ROI","Délai"]} rows={[
            {p:1,a:"Développer Rapatriement",inv:"400€/mois",ca:"+14 400€/an",roi:"x3",d:"1 mois"},
            {p:2,a:"Contrat Monaco Yacht Club",inv:"0€",ca:"+172 800€/an",roi:"∞",d:"Cette semaine"},
            {p:3,a:"Activer réseau B2B",inv:"0€",ca:"+36 000€/an",roi:"∞",d:"2 mois"},
            {p:4,a:"30 cartes virtuelles membres",inv:"0€",ca:"+720€/an",roi:"∞",d:"1 mois"},
            {p:5,a:"Embaucher 1 collaborateur",inv:"1 800€/mois",ca:"+3 200€/mois",roi:"x1.8",d:"3 mois"},
          ].map((r,i)=>(
            <tr key={i}>
              <Td><span style={{fontWeight:800,color:C.gold,fontSize:16}}>#{r.p}</span></Td>
              <Td><span style={{fontWeight:600,color:C.dark}}>{r.a}</span></Td>
              <Td><span style={{color:r.inv==="0€"?C.green:C.red,fontWeight:600}}>{r.inv}</span></Td>
              <Td><span style={{color:C.green,fontWeight:700}}>{r.ca}</span></Td>
              <Td><span style={{color:C.purple,fontWeight:700}}>{r.roi}</span></Td>
              <Td><span style={{fontSize:12,color:C.mid}}>{r.d}</span></Td>
            </tr>
          ))}/>
        </Card>
      )}
    </div>
  );
};

// PLANNING
const PagePlanning=()=>(
  <div>
    <SectionTitle sub="Missions · RDV · Lien de réservation automatique" action={<div style={{display:"flex",gap:8}}><Btn v="ghost">+ Mission</Btn><Btn v="gold">🔗 Lien RDV</Btn></div>}>📅 Planning & Agenda</SectionTitle>
    <Card style={{marginBottom:16,borderColor:`${C.blue}40`,background:C.blueBg}}>
      <div style={{fontSize:12,color:C.blue}}>🔗 Lien de réservation automatique envoyé par WhatsApp après chaque devis validé</div>
      <div style={{fontFamily:"monospace",fontSize:12,color:C.mid,background:C.white,padding:"7px 12px",borderRadius:8,marginTop:7,border:`1px solid ${C.border}`}}>https://tymeless.fr/rdv/bene</div>
    </Card>
    <Card>
      <CardTitle>Semaine du 15 au 20 avril 2026</CardTitle>
      <TH heads={["Date","Heure","Client","Service","Collaborateur","Type","Statut"]} rows={PLANNING.map((p,i)=>(
        <tr key={i}>
          <Td><span style={{color:C.gold,fontFamily:"monospace",fontSize:12,fontWeight:600}}>{p.date}</span></Td>
          <Td><span style={{fontWeight:600,color:C.dark}}>{p.h}</span></Td>
          <Td>{p.client}</Td>
          <Td><span style={{fontSize:12}}>{p.service}</span></Td>
          <Td><Badge label={p.collab} color={p.collab==="Béné"?C.gold:C.blue}/></Td>
          <Td><St s={p.type}/></Td>
          <Td><St s={p.statut}/></Td>
        </tr>
      ))}/>
    </Card>
  </div>
);

// RENDEZ-VOUS
const PageRendezVous=()=>(
  <div>
    <SectionTitle action={<Btn v="gold">+ Créer un RDV</Btn>}>📆 Rendez-vous</SectionTitle>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {[{date:"17/04 14h00",client:"Isabelle Moreau",type:"Suivi contrat",statut:"confirmé"},{date:"18/04 10h00",client:"Sofia Al-Rashid",type:"Renouvellement VIP",statut:"confirmé"},{date:"20/04 09h00",client:"Jean-Marc Olivier",type:"Nouveau client",statut:"en_attente"}].map((r,i)=>(
        <Card key={i}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:13,fontWeight:700,color:C.gold}}>{r.date}</span><St s={r.statut}/></div>
          <div style={{fontWeight:600,color:C.dark,marginBottom:4}}>{r.client}</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{r.type}</div>
          <div style={{display:"flex",gap:6}}><Btn sm v="ghost">Modifier</Btn><Btn sm v="green">✓ Confirmer</Btn></div>
        </Card>
      ))}
    </div>
  </div>
);

// STOCK
const PageStock=()=>{const [stock, setStock] = useState(STOCK);
useEffect(()=>{
  supabase.from("stock").select("*").order("article").then(({data})=>{if(data)setStock(data);});
},[]);
  const al=stock.filter(s=>s.qte<s.min);
  return(
    <div>
      <SectionTitle sub="Fournitures · Alertes réapprovisionnement" action={<Btn v="gold">+ Ajouter article</Btn>}>📦 Stock & Fournitures</SectionTitle>
      {al.length>0&&<Card style={{marginBottom:16,borderColor:`${C.red}40`,background:C.redBg}}><div style={{fontSize:13,color:C.red,fontWeight:600}}>⚠️ Articles en rupture : {al.map(a=>a.art).join(", ")}</div></Card>}
      <Card>
        <TH heads={["Article","Catégorie","Quantité","Seuil min","Unité","Fournisseur","État"]} rows={STOCK.map((s,i)=>(
          <tr key={i} style={{background:s.qte<s.min?"#FFF5F5":undefined}}>
            <Td><span style={{fontWeight:600,color:C.dark}}>{s.art}</span></Td>
            <Td><Badge label={s.cat} color={C.blue}/></Td>
            <Td><span style={{fontWeight:700,color:s.qte<s.min?C.red:C.dark,fontSize:15}}>{s.qte}</span></Td>
            <Td><span style={{fontSize:12,color:C.muted}}>{s.min}</span></Td>
            <Td><span style={{fontSize:12,color:C.muted}}>{s.u}</span></Td>
            <Td><span style={{fontSize:12,color:C.mid}}>{s.four}</span></Td>
            <Td>{s.qte<s.min?<Badge label="⚠ Réappro." color={C.red} bg={C.redBg}/>:<Badge label="✓ OK" color={C.green} bg={C.greenBg}/>}</Td>
          </tr>
        ))}/>
      </Card>
    </div>
  );
};

// EQUIPE
const PageEquipe=()=>{
  const [tab,setTab]=useState("membres");
  const [pointages,setPointages]=useState([]);
  const [missions,setMissions]=useState([]);

  useEffect(()=>{
    supabase.from("pointage").select("*").order("created_at",{ascending:false}).limit(50).then(({data})=>{if(data)setPointages(data);});
    supabase.from("planning").select("*").order("date_mission").then(({data})=>{if(data)setMissions(data);});
  },[]);

  const EQUIPE=[
    {nom:"Thomas",role:"Commercial + Prospection",statut:"actif",missions:12,note:4.9,type:"bot",color:C.gold},
    {nom:"Abou",role:"Commercial + Prospection + Planning",statut:"actif",missions:18,note:4.8,type:"bot",color:C.blue},
    {nom:"Fatou",role:"Hôtesse conciergerie",statut:"actif",missions:6,note:5.0,type:"humain",color:C.purple},
  ];

  const genererQR=(mission)=>{
    const data=`TYMELESS-MISSION-${mission.id||"001"}-${mission.client_nom||"CLIENT"}-${mission.date_mission||"2026"}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  };

  return(
    <div>
      <SectionTitle action={<Btn v="gold">+ Ajouter un collaborateur</Btn>}>👥 Équipe & Pointage</SectionTitle>
      <Tabs tabs={[{id:"membres",label:"👥 Membres"},{id:"pointage",label:"⏱️ Pointage"},{id:"qr",label:"🔳 QR Codes"},{id:"nfc",label:"📱 NFC"},{id:"planning",label:"📅 Planning équipe"}
]} active={tab} onChange={setTab}/>

      {/* MEMBRES */}
      {tab==="membres"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {EQUIPE.map((e,i)=>(
            <Card key={i}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:48,height:48,borderRadius:16,background:`${e.color}20`,border:`2px solid ${e.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:e.color}}>{e.nom[0]}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,color:C.dark}}>{e.nom} {e.type==="bot"?"🤖":"👤"}</div><div style={{fontSize:12,color:C.muted}}>{e.role}</div></div>
                <Badge label="● Actif" color={C.green} bg={C.greenBg}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                <div style={{background:C.bg,borderRadius:10,padding:"8px 12px"}}><div style={{color:C.muted,fontSize:10}}>Missions</div><div style={{color:C.dark,fontWeight:800,fontSize:18}}>{e.missions}</div></div>
                <div style={{background:C.bg,borderRadius:10,padding:"8px 12px"}}><div style={{color:C.muted,fontSize:10}}>Note</div><div style={{color:C.gold,fontWeight:800,fontSize:18}}>★ {e.note}</div></div>
              </div>
              {e.type==="bot"?<Btn sm v="ghost">🤖 Config. Relevance AI</Btn>:<Btn sm v="ghost">📋 Voir fiche</Btn>}
            </Card>
          ))}
        </div>
      )}

      {/* POINTAGE */}
      {tab==="pointage"&&(
        <div>
          <Card style={{marginBottom:16,borderColor:`${C.green}40`,background:`linear-gradient(135deg,${C.greenBg},${C.white})`}}>
            <div style={{display:"flex",gap:14,alignItems:"center"}}>
              <span style={{fontSize:28}}>🛡️</span>
              <div>
                <div style={{fontWeight:700,color:C.dark,fontSize:15,marginBottom:4}}>Système de pointage anti-fraude</div>
                <div style={{fontSize:13,color:C.mid,lineHeight:1.7}}>
                  <b>📍 Géolocalisation</b> automatique · <b>📸 Photo</b> géolocalisée + horodatage · <b>🔳 QR Code</b> unique par mission · <b>📱 NFC</b> chez le client
                </div>
              </div>
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
            {[{l:"Pointages aujourd'hui",v:pointages.filter(p=>p.type==="arrivee").length,c:C.green},{l:"En mission",v:pointages.filter(p=>p.type==="arrivee").length,c:C.blue},{l:"En pause",v:pointages.filter(p=>p.type==="pause").length,c:C.orange},{l:"Terminés",v:pointages.filter(p=>p.type==="fin").length,c:C.muted}].map((k,i)=>(
              <Card key={i}><div style={{fontSize:11,color:C.muted,marginBottom:6}}>{k.l}</div><div style={{fontSize:26,fontWeight:800,color:k.c}}>{k.v}</div></Card>
            ))}
          </div>
          <Card>
            <CardTitle>Historique des pointages</CardTitle>
            {pointages.length===0?(
              <div style={{textAlign:"center",padding:40,color:C.muted}}>
                <div style={{fontSize:32,marginBottom:10}}>⏱️</div>
                <div>Aucun pointage enregistré</div>
                <div style={{fontSize:12,marginTop:4}}>Les pointages apparaîtront ici en temps réel</div>
              </div>
            ):(
              <TH heads={["Collaborateur","Type","Heure","Localisation","Photo","Preuve"]} rows={pointages.slice(0,20).map((p,i)=>(
                <tr key={i}>
                  <Td><span style={{fontWeight:600}}>{p.collaborateur}</span></Td>
                  <Td><Badge label={p.type==="arrivee"?"✓ Arrivée":p.type==="pause"?"⏸ Pause":p.type==="reprise"?"▶ Reprise":"✓ Fin"} color={p.type==="arrivee"?C.green:p.type==="pause"?C.orange:p.type==="fin"?C.muted:C.blue}/></Td>
                  <Td><span style={{fontFamily:"monospace",fontSize:12}}>{new Date(p.created_at).toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})}</span></Td>
                  <Td>{p.latitude?<span style={{fontSize:11,color:C.green}}>📍 {Number(p.latitude).toFixed(4)}, {Number(p.longitude).toFixed(4)}</span>:<span style={{color:C.muted}}>—</span>}</Td>
                  <Td>{p.photo_url?<a href={p.photo_url} target="_blank" rel="noreferrer" style={{color:C.blue,fontSize:12}}>📸 Voir</a>:<span style={{color:C.muted}}>—</span>}</Td>
                  <Td>{p.nfc_tag?<Badge label="NFC ✓" color={C.green} bg={C.greenBg}/>:p.qr_code?<Badge label="QR ✓" color={C.blue} bg={C.blueBg}/>:<Badge label="GPS" color={C.orange} bg={C.orangeBg}/>}</Td>
                </tr>
              ))}/>
            )}
          </Card>
        </div>
      )}

      {/* QR CODES */}
      {tab==="qr"&&(
        <div>
          <Card style={{marginBottom:16,borderColor:`${C.blue}40`}}>
            <div style={{fontSize:13,color:C.mid,lineHeight:1.8}}>
              🔳 Un <b style={{color:C.dark}}>QR code unique</b> est généré automatiquement pour chaque mission. Le collaborateur le scanne sur place — ça prouve sa présence physique avec horodatage.
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {missions.slice(0,6).map((m,i)=>(
              <Card key={i}>
                <div style={{fontWeight:700,color:C.dark,marginBottom:4,fontSize:13}}>{m.service||"Mission"}</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:10}}>{m.client_nom||"Client"} · {m.date_mission||"—"}</div>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                  <img src={genererQR(m)} alt="QR Code" style={{width:140,height:140,borderRadius:8,border:`1px solid ${C.border}`}}/>
                </div>
                <Btn sm v="ghost" full>📥 Télécharger</Btn>
              </Card>
            ))}
            {missions.length===0&&(
              <Card style={{gridColumn:"1/-1"}}>
                <div style={{textAlign:"center",padding:40,color:C.muted}}>
                  <div style={{fontSize:32,marginBottom:10}}>🔳</div>
                  <div>Les QR codes apparaîtront ici quand des missions seront créées</div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* NFC */}
      {tab==="nfc"&&(
        <div>
          <Card style={{marginBottom:16,borderColor:`${C.purple}40`,background:`linear-gradient(135deg,${C.purpleBg},${C.white})`}}>
            <div style={{display:"flex",gap:14,alignItems:"center"}}>
              <span style={{fontSize:32}}>📱</span>
              <div>
                <div style={{fontWeight:700,color:C.purple,fontSize:15,marginBottom:4}}>Étiquettes NFC — Pointage instantané</div>
                <div style={{fontSize:13,color:C.mid,lineHeight:1.7}}>Colle une étiquette NFC chez chaque client. Quand Abou approche son téléphone → pointage automatique enregistré dans Supabase.</div>
              </div>
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <Card>
              <CardTitle>Comment ça marche</CardTitle>
              {[{n:1,t:"Achète des étiquettes NFC (Amazon ~10€ pour 50)"},{n:2,t:"Colle une étiquette à l'entrée chez chaque client"},{n:3,t:"On programme l'ID client sur chaque étiquette"},{n:4,t:"Le collaborateur approche son téléphone → pointage auto"},{n:5,t:"Visible en temps réel dans ton dashboard"}].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:10}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:C.purpleBg,border:`1px solid ${C.purple}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.purple,fontWeight:700,flexShrink:0}}>{s.n}</div>
                  <div style={{fontSize:13,color:C.mid,lineHeight:1.5,paddingTop:3}}>{s.t}</div>
                </div>
              ))}
            </Card>
            <Card>
              <CardTitle>Étiquettes NFC configurées</CardTitle>
              {[{client:"Isabelle Moreau",adresse:"Montmartre, Paris",tag:"TYM-NFC-001",statut:"actif"},{client:"Sofia Al-Rashid",adresse:"16ème, Paris",tag:"TYM-NFC-002",statut:"actif"},{client:"Marc Dupont",adresse:"La Défense",tag:"TYM-NFC-003",statut:"actif"}].map((n,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<2?`1px solid ${C.border}`:undefined}}>
                  <div style={{width:36,height:36,borderRadius:8,background:C.purpleBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📱</div>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:C.dark}}>{n.client}</div><div style={{fontSize:11,color:C.muted}}>{n.adresse} · <span style={{fontFamily:"monospace"}}>{n.tag}</span></div></div>
                  <Badge label="● Actif" color={C.green} bg={C.greenBg}/>
                </div>
              ))}
              <div style={{marginTop:12}}><Btn v="gold" full>+ Ajouter une étiquette NFC</Btn></div>
            </Card>
          </div>
          <Card style={{borderColor:`${C.orange}40`,background:`linear-gradient(135deg,${C.orangeBg},${C.white})`}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:22}}>🛒</span>
              <div style={{fontSize:13,color:C.mid}}>Étiquettes NFC recommandées : <b style={{color:C.dark}}>NTAG213 ou NTAG215</b> — compatibles iOS et Android. Disponibles sur Amazon, ~10€ pour 50 étiquettes.</div>
            </div>
          </Card>
        </div>
      )}
      {tab==="planning"&&(
  <div>
    <Card style={{marginBottom:16,borderColor:`${C.blue}40`}}>
      <div style={{fontSize:13,color:C.mid,lineHeight:1.8}}>
        📅 Le planning de l'équipe est géré par <b style={{color:C.dark}}>Abou</b> via Relevance AI. Les missions créées dans le dashboard sont automatiquement assignées et notifiées sur WhatsApp.
      </div>
    </Card>
    <Card>
      <CardTitle action={<Btn v="gold" sm>+ Nouvelle mission</Btn>}>Missions de la semaine</CardTitle>
      {missions.length===0?(
        <div style={{textAlign:"center",padding:40,color:C.muted}}>
          <div style={{fontSize:32,marginBottom:10}}>📅</div>
          <div>Aucune mission planifiée</div>
        </div>
      ):(
        <TH heads={["Date","Heure","Client","Service","Collaborateur","Statut"]} rows={missions.map((m,i)=>(
          <tr key={i}>
            <Td><span style={{color:C.gold,fontFamily:"monospace",fontWeight:600}}>{m.date_mission}</span></Td>
            <Td><span style={{fontWeight:600}}>{m.heure_debut}</span></Td>
            <Td>{m.client_nom}</Td>
            <Td><span style={{fontSize:12}}>{m.service}</span></Td>
            <Td><Badge label={m.collaborateur} color={C.blue}/></Td>
            <Td><Badge label={m.statut} color={m.statut==="confirmé"?C.green:C.orange}/></Td>
          </tr>
        ))}/>
      )}
    </Card>
  </div>
)}
    </div>
  );
};


// POINTAGE
const PagePointage=()=>{
  const [status,setStatus]=useState("Non pointé");
  return(
    <div>
      <SectionTitle sub="Suivi des heures · Historique journalier">⏱️ Pointage</SectionTitle>
      <Card style={{marginBottom:20,borderColor:status!=="Non pointé"?`${C.green}50`:C.border}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
          <div>
            <div style={{fontSize:13,color:C.muted,marginBottom:4}}>Statut actuel</div>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:28,fontWeight:700,color:status!=="Non pointé"?C.green:C.muted}}>{status}</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[["Arrivée","Arrivé"],["Pause","En pause"],["Reprise","Reprise"],["Fin de journée","Fin de journée"]].map(([l,v])=>(
              <Btn key={l} v={status===v?"green":"ghost"} onClick={()=>setStatus(v)}>{l}</Btn>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <CardTitle>Historique du jour</CardTitle>
        <TH heads={["Heure","Événement","Collaborateur"]} rows={[{h:"08:30",e:"Arrivée",c:"Thomas"},{h:"09:00",e:"Arrivée",c:"Abou"},{h:"12:00",e:"Pause",c:"Thomas"},{h:"13:00",e:"Reprise",c:"Thomas"},{h:"17:30",e:"Fin de journée",c:"Thomas"}].map((r,i)=>(
          <tr key={i}><Td><span style={{fontFamily:"monospace",fontWeight:600,color:C.gold}}>{r.h}</span></Td><Td>{r.e}</Td><Td><Badge label={r.c} color={C.blue}/></Td></tr>
        ))}/>
      </Card>
    </div>
  );
};

// CHAT EQUIPE
const PageChatEquipe=()=>{
  const [msgs,setMsgs]=useState(MSGS_EQUIPE);
  const [inp,setInp]=useState("");
  const [dest,setDest]=useState("Tous");
  const ref=useRef(null);
  const AV={"Thomas":C.gold,"Abou":C.blue,"Fatou":C.purple,"Béné":C.green};
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs]);
  const send=()=>{if(!inp.trim())return;setMsgs(p=>[...p,{id:Date.now(),auteur:"Béné",msg:inp,h:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),lu:true,isMe:true}]);setInp("");};
  return(
    <div>
      <SectionTitle>💬 Chat Équipe</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14,height:500}}>
        <Card style={{display:"flex",flexDirection:"column",gap:4,padding:12}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",padding:"4px 8px 8px"}}>Contacts</div>
          {["Tous","Thomas","Abou","Fatou"].map(n=>(
            <button key={n} onClick={()=>setDest(n)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",cursor:"pointer",background:dest===n?C.goldLight:"transparent",border:dest===n?`1px solid ${C.goldBorder}`:"1px solid transparent",borderRadius:10,color:dest===n?C.gold:C.mid,fontSize:13,fontFamily:"inherit",textAlign:"left",fontWeight:dest===n?600:400}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:(AV[n]||C.muted)+"20",border:`1px solid ${AV[n]||C.muted}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:AV[n]||C.muted,flexShrink:0}}>{n[0]}</div>
              {n}
            </button>
          ))}
        </Card>
        <Card style={{display:"flex",flexDirection:"column",padding:0,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.bg,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:13,fontWeight:600,color:C.dark}}>💬 {dest==="Tous"?"Groupe équipe":dest}</span>
            <Badge label="● En ligne" color={C.green} bg={C.greenBg}/>
          </div>
          <div ref={ref} style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
            {msgs.filter(m=>dest==="Tous"||m.auteur===dest||m.isMe).map((m,i)=>(
              <div key={i} style={{display:"flex",flexDirection:m.isMe?"row-reverse":"row",gap:8,alignItems:"flex-end"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:(AV[m.auteur]||C.gold)+"20",border:`1px solid ${AV[m.auteur]||C.gold}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:AV[m.auteur]||C.gold,flexShrink:0}}>{m.auteur[0]}</div>
                <div>
                  {!m.isMe&&<div style={{fontSize:10,color:C.muted,marginBottom:3}}>{m.auteur}</div>}
                  <div style={{background:m.isMe?C.navy:C.bg,color:m.isMe?"#fff":C.dark,border:`1px solid ${m.isMe?C.navy:C.border}`,borderRadius:m.isMe?"14px 14px 2px 14px":"14px 14px 14px 2px",padding:"9px 13px",fontSize:13,maxWidth:280,lineHeight:1.45}}>{m.msg}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:3,textAlign:m.isMe?"right":"left"}}>{m.h}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,padding:10,borderTop:`1px solid ${C.border}`,background:C.bg}}>
            <Inp placeholder="Écrire un message..." value={inp} onChange={e=>setInp(e.target.value)} style={{flex:1}}/>
            <button onClick={send} style={{background:C.navy,border:"none",borderRadius:10,width:38,height:38,cursor:"pointer",color:"#fff",fontSize:14,fontWeight:700,flexShrink:0}}>➤</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// NOTIFICATIONS
const PageNotifications=()=>{
  const [notifs,setNotifs]=useState(NOTIFS);
  useEffect(()=>{supabase.from("notifications").select("*").order("created_at",{ascending:false}).limit(20).then(({data})=>{if(data)setNotifs(data);});},[]);
  return(
    <div>
      <SectionTitle action={<Btn v="ghost" onClick={()=>setNotifs(p=>p.map(n=>({...n,lu:true})))}>✓ Tout marquer lu</Btn>}>🔔 Notifications</SectionTitle>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {notifs.map((n,i)=>{
          const tc={urgent:C.red,money:C.gold,good:C.green,info:C.blue};
          return(
            <div key={i} style={{background:n.lu?C.white:C.bg,border:`1px solid ${n.lu?C.border:tc[n.type]+"50"}`,borderRadius:14,padding:"14px 18px",display:"flex",gap:12,alignItems:"center",opacity:n.lu?0.65:1,boxShadow:n.lu?"none":"0 2px 12px rgba(15,23,42,0.06)"}}>
              <span style={{fontSize:22,flexShrink:0}}>{n.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:n.lu?400:600,color:C.dark}}>{n.titre}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{n.h}</div></div>
              {!n.lu&&<div style={{width:8,height:8,borderRadius:"50%",background:tc[n.type],flexShrink:0}}/>}
              <Btn sm v="ghost" onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,lu:true}:x))}>Lu</Btn>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// FORMATION
const PageFormation=()=>(
  <div>
    <SectionTitle action={<Btn v="gold">+ Ajouter une formation</Btn>}>🎓 Formation Équipe</SectionTitle>
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {[{titre:"🤖 Formation IA",items:["MAKE — automatisations & workflows","ChatGPT — prompts & business","Claude Code — développement & SaaS","Utilisation IA globale"]},{titre:"🧹 Formation métier",items:["Nettoyage Airbnb / bureaux / luxe","Conciergerie premium","Aviation / jet privé"]},{titre:"🏨 Hôtellerie & Restauration",items:["Standards hôteliers premium","Housekeeping","Accueil client VIP","Hygiène HACCP"]},{titre:"💼 Business & Équipe",items:["Prospection et vente","Réseau & partenariats","Utilisation du dashboard","Planning & organisation"]}].map((s,i)=>(
        <Card key={i}>
          <CardTitle>{s.titre}</CardTitle>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
            {s.items.map((item,j)=>(
              <div key={j} style={{display:"flex",alignItems:"center",gap:8,background:C.bg,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.dark}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.gold,flexShrink:0}}/>
                {item}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// OWNER
const PageOwner=()=>(
  <div>
    <SectionTitle sub="Vue globale · Abonnements · Revenus · Alertes">👑 Centre de Contrôle Owner</SectionTitle>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      <KPI label="CA global ce mois" val="24 380 €" color={C.dark}/>
      <KPI label="Membres actifs" val="6" sub="dont 2 Business Pro" color={C.blue}/>
      <KPI label="Revenus abonnements" val="348 €" sub="ce mois" color={C.gold}/>
      <KPI label="Commissions 5% auto" val="3 412 €" color={C.purple}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <CardTitle>Membres par plan</CardTitle>
        {[{plan:"Starter 29€",nb:3,color:C.blue},{plan:"Business Pro 99€",nb:2,color:C.gold},{plan:"Enterprise 150€",nb:1,color:C.purple}].map((m,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<2?`1px solid ${C.border}`:undefined}}>
            <Badge label={m.plan} color={m.color}/>
            <div style={{flex:1,height:6,borderRadius:3,background:C.bg}}><div style={{height:"100%",width:`${m.nb*20}%`,background:m.color,borderRadius:3}}/></div>
            <span style={{fontWeight:700,color:C.dark,fontSize:15}}>{m.nb}</span>
          </div>
        ))}
      </Card>
      <Card>
        <CardTitle>Revenus SaaS projections</CardTitle>
        {[{l:"Abonnements (6 membres)",v:"348 €/mois"},{l:"Commissions 5% transactions",v:"3 412 €/mois"},{l:"Objectif 50 membres",v:"4 950 €/mois"},{l:"Projection annuelle (50 membres)",v:"59 400 €/an"}].map((k,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<3?`1px solid ${C.border}`:undefined,fontSize:13}}>
            <span style={{color:C.muted}}>{k.l}</span>
            <span style={{fontWeight:700,color:C.dark}}>{k.v}</span>
          </div>
        ))}
      </Card>
    </div>
  </div>
);

// DEPLOIEMENTS
const PageDeploiements=()=>(
  <div>
    <SectionTitle sub="Vendre Tymeless OS · Prix fixe + Maintenance + 5% transactions">🏢 Déploiements SaaS</SectionTitle>
    <Card style={{marginBottom:20,borderColor:`${C.purple}40`,background:C.purpleBg}}>
      <div style={{display:"flex",gap:14,alignItems:"center"}}><span style={{fontSize:28}}>🌍</span><div><div style={{fontWeight:700,color:C.purple,marginBottom:4,fontSize:15}}>Vendre Tymeless OS à une société</div><div style={{fontSize:13,color:C.mid,lineHeight:1.6}}><b style={{color:C.dark}}>Prix d'achat fixe</b> + <b style={{color:C.dark}}>Maintenance 500–2 000€/mois</b> + <b style={{color:C.purple}}>5% sur chaque transaction</b></div></div></div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {[{t:"Starter",p:"5 000 €",m:"500€/mois",f:["Jusqu'à 50 clients","Paiements intégrés","Bot WhatsApp","Support email"]},{t:"Business",p:"12 000 €",m:"1 000€/mois",f:["Jusqu'à 200 clients","Tout Starter","Annuaire réseau","Support prioritaire"],rec:true},{t:"Enterprise",p:"Sur devis",m:"2 000€+/mois",f:["Illimité","Tout Business","White-label complet","Support dédié"]}].map((p,i)=>(
        <Card key={i} style={{borderColor:p.rec?`${C.gold}50`:C.border}}>
          {p.rec&&<div style={{textAlign:"center",marginBottom:8}}><Badge label="⭐ Recommandé" color={C.gold} bg={C.goldLight}/></div>}
          <div style={{textAlign:"center",marginBottom:14}}>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:C.dark}}>{p.t}</div>
            <div style={{fontSize:22,fontWeight:800,color:C.gold,margin:"6px 0"}}>{p.p}</div>
            <div style={{fontSize:12,color:C.muted}}>+ {p.m}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>{p.f.map((f,j)=><div key={j} style={{fontSize:13,color:C.mid}}>✓ {f}</div>)}</div>
          <Btn v={p.rec?"gold":"ghost"} full>Déployer</Btn>
        </Card>
      ))}
    </div>
  </div>
);

// SETTINGS
const PageSettings=({plan,onPlanChange})=>(
  <div>
    <SectionTitle>⚙️ Paramètres</SectionTitle>
    <Card style={{marginBottom:20,borderColor:`${C.gold}50`,background:C.goldLight}}>
      <CardTitle>Mode démo — Simuler un plan membre</CardTitle>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {Object.values(PLANS).map(p=>(
          <button key={p.id} onClick={()=>onPlanChange(p.id)} style={{background:plan===p.id?C.dark:C.white,color:plan===p.id?"#fff":C.mid,border:`1.5px solid ${plan===p.id?C.dark:C.border}`,borderRadius:12,padding:"10px 18px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,transition:"all 0.15s"}}>
            {p.icon} {p.nom}<br/><span style={{fontSize:11,opacity:0.7}}>{p.prix}</span>
          </button>
        ))}
      </div>
      <div style={{marginTop:12,fontSize:12,color:C.mid}}>Actuellement : <b style={{color:C.dark}}>{PLANS[plan]?.nom}</b> — Navigue pour voir les cadenas</div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {[{t:"Société",items:["Nom : Tymeless","Email : contact@tymeless.fr","Pays : France","Langues : FR · EN · AR · RU"]},{t:"Tarification",items:["Starter : 29€/mois","Business Pro : 99€/mois","Enterprise : 150€/mois","White-label : 5K–12K€"]},{t:"Commissions",items:["Partenaire → Tymeless : 15–30%","Tymeless → Partenaire : 15–30%","Transactions système : 5% auto","Deals réseau : 15–30%"]},{t:"Paiements",items:["Flutterwave : ✓ Wave, Orange Money, MTN","CinetPay : ✓ Wave Sénégal","Carte bancaire : ✓ Active","Paiement WhatsApp : ✓ Actif"]}].map((s,i)=>(
        <Card key={i}>
          <CardTitle>{s.t}</CardTitle>
          {s.items.map((item,j)=><div key={j} style={{fontSize:13,color:item.includes("✓")?C.green:C.mid,padding:"7px 0",borderBottom:j<s.items.length-1?`1px solid ${C.border}`:undefined}}>{item}</div>)}
        </Card>
      ))}
    </div>
  </div>
);

// PAGE SIMPLE GÉNÉRIQUE
const PageSimple=({title,items})=>(
  <div>
    <SectionTitle>{title}</SectionTitle>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
      {items.map((item,i)=>(
        <Card key={i}>
          <div style={{fontSize:22,marginBottom:10}}>{item.icon}</div>
          <div style={{fontWeight:600,color:C.dark,marginBottom:6,fontSize:15}}>{item.titre}</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>{item.desc}</div>
        </Card>
      ))}
    </div>
  </div>
);

// ─── APP ROOT ─────────────────────────────────────────────────
export default function TymelessOS() {
  const [page,  setPage]  = useState("accueil");
  const [plan,  setPlan]  = useState("owner");
  const [notifs,setNotifs] = useState(NOTIFS);

  const planInfo = PLANS[plan] || PLANS.owner;
  const unread   = notifs.filter(n=>!n.lu).length;

  // Rendu avec contrôle d'accès
  const renderPage = () => {
    // Pages toujours accessibles
    if (FREE_PAGES.includes(page)) {
      const freePages = {
        wallet:       <PageWallet/>,
        cartes:       <PageCartes/>,
        iban:         <PageIBAN/>,
        historique:   <PageWallet/>,
        notifications:<PageNotifications/>,
        "chat-equipe":<PageChatEquipe/>,
        pointage:     <PagePointage/>,
        settings:     <PageSettings plan={plan} onPlanChange={p=>{setPlan(p);setPage("accueil");}}/>,
      };
      return freePages[page] || <PageWallet/>;
    }

    // Pages verrouillées pour Starter
    if (LOCKED_PAGES.includes(page) && plan==="starter") {
      return <UpgradeWall page={page} onUpgrade={p=>{setPlan(p);setPage("annuaire");}}/>;
    }

    // Pages Business Pro+
    const pages = {
      accueil:           <PageAccueil setPage={setPage} plan={plan}/>,
      "vue-ensemble":    <PageOverview setPage={setPage}/>,
      crm:               <PageCRM/>,
      devis:             <PageDevis/>,
      comptabilite:      <PageCompta/>,
      tresorerie:        <PageTresorerie/>,
      analytique:        <PageTresorerie/>,
      investissement:    <PageInvestissement/>,
      annuaire:          <PageSimple title="🌍 Annuaire Mondial" items={[{icon:"🤝",titre:"Réseau B2B",desc:"Entrepreneurs du monde entier prêts à faire affaires"},{icon:"💼",titre:"Deals potentiels",desc:"Mises en relation avec commission 15–30%"},{icon:"🌍",titre:"30+ pays",desc:"France, Sénégal, Maroc, Émirats, Côte d'Ivoire..."},{icon:"💰",titre:"Revenus passifs",desc:"Tymeless prend 5% sur chaque transaction réseau"}]}/>,
      "mises-en-relation":<PageSimple title="🤝 Mises en relation" items={[{icon:"🎯",titre:"Matching automatique",desc:"L'IA identifie les meilleures synergies entre membres"},{icon:"💬",titre:"Introduction directe",desc:"Message envoyé sur WhatsApp automatiquement"},{icon:"📊",titre:"Suivi des deals",desc:"De la mise en relation jusqu'au deal signé"},{icon:"💸",titre:"Commissions auto",desc:"15–30% calculées et facturées automatiquement"}]}/>,
      deals:             <PageSimple title="💼 Deals" items={[{icon:"🤝",titre:"Deals en cours",desc:"Suivi en temps réel de tous les deals actifs"},{icon:"✅",titre:"Deals gagnés",desc:"CA généré via le réseau Tymeless"},{icon:"💰",titre:"Commissions",desc:"Tymeless perçoit sa part automatiquement"},{icon:"📄",titre:"Contrats",desc:"Générés et signés électroniquement"}]}/>,
      opportunites:      <PageSimple title="🚀 Opportunités Business" items={[{icon:"📢",titre:"Publier une opportunité",desc:"Partager un besoin ou une offre au réseau"},{icon:"👀",titre:"Voir les opportunités",desc:"Toutes les opportunités des membres Business Pro"},{icon:"🎯",titre:"Proposer ses services",desc:"Répondre aux besoins du réseau"},{icon:"🌍",titre:"Portée mondiale",desc:"Visible par tous les membres dans le monde"}]}/>,
      missions:          <PageSimple title="📌 Demandes de missions" items={[{icon:"📋",titre:"Missions disponibles",desc:"Tâches et missions postées par les membres"},{icon:"✋",titre:"Postuler",desc:"Répondre aux missions qui correspondent à ton profil"},{icon:"📊",titre:"Suivi",desc:"Statut en temps réel de tes candidatures"},{icon:"💰",titre:"Paiement sécurisé",desc:"Via wallet Tymeless avec escrow"}]}/>,
      propositions:      <PageSimple title="📬 Propositions" items={[{icon:"📨",titre:"Propositions reçues",desc:"Missions et opportunités qui t'ont été proposées"},{icon:"✅",titre:"Accepter",desc:"Valider une proposition et démarrer"},{icon:"❌",titre:"Refuser",desc:"Décliner poliment avec un message automatique"},{icon:"💬",titre:"Négocier",desc:"Chat direct avec l'initiateur de la proposition"}]}/>,
      "chat-business":   <PageSimple title="💬 Chat Business" items={[{icon:"🤝",titre:"Chat partenaires",desc:"Communication directe avec tes partenaires B2B"},{icon:"💼",titre:"Négociation deals",desc:"Espace dédié pour négocier les conditions"},{icon:"📄",titre:"Partage documents",desc:"Envoyer contrats et devis directement en chat"},{icon:"🔒",titre:"Chiffré et sécurisé",desc:"Tous les échanges sont protégés"}]}/>,
      planning:          <PagePlanning/>,
      "rendez-vous":     <PageRendezVous/>,
      reservations:      <PageSimple title="🗓️ Pages de Réservation" items={[{icon:"🔗",titre:"Lien public",desc:"https://tymeless.fr/rdv/bene — envoyé automatiquement"},{icon:"📅",titre:"Créneaux disponibles",desc:"Gestion des disponibilités en temps réel"},{icon:"✅",titre:"Confirmation auto",desc:"Email + WhatsApp envoyés automatiquement"},{icon:"📱",titre:"Compatible mobile",desc:"Réservation depuis n'importe quel appareil"}]}/>,
      services:          <PageSimple title="🧰 Catalogue Services" items={[{icon:"🏠",titre:"Nettoyage Airbnb",desc:"250€ · Marge 68%"},{icon:"✈️",titre:"Jet Privé",desc:"2 200€ · Marge 80%"},{icon:"⚰️",titre:"Rapatriement",desc:"4 500€ · Marge 75%"},{icon:"🛥️",titre:"Yacht",desc:"1 800€ · Marge 72%"}]}/>,
      stock:             <PageStock/>,
      contrats:          <PageSimple title="📄 Contrats & Signatures" items={[{icon:"✍️",titre:"E-signature",desc:"Signer en un clic depuis mobile ou desktop"},{icon:"📋",titre:"Contrats partenaires",desc:"Générés automatiquement avec les taux de commission"},{icon:"📁",titre:"Archivage",desc:"Tous les contrats stockés et accessibles"},{icon:"⏰",titre:"Alertes d'expiration",desc:"Notification 30 jours avant la date de fin"}]}/>,
      formation:         <PageFormation/>,
      equipe:            <PageEquipe/>,
      collaborateurs:    <PageSimple title="➕ Gestion Collaborateurs" items={[{icon:"➕",titre:"Ajouter",desc:"Inviter un nouveau collaborateur par WhatsApp"},{icon:"🔑",titre:"Rôles & accès",desc:"Définir les droits par profil"},{icon:"📊",titre:"Performance",desc:"Suivi missions et évaluations"},{icon:"💰",titre:"Rémunération",desc:"Paiement via wallet Tymeless"}]}/>,
      owner:             <PageOwner/>,
      kpi:               <PageSimple title="📊 KPI Globaux" items={[{icon:"💰",titre:"CA global",desc:"Tous clients et membres confondus"},{icon:"📈",titre:"Croissance",desc:"Courbe mensuelle depuis le lancement"},{icon:"🤝",titre:"Deals réseau",desc:"CA généré via les mises en relation"},{icon:"⭐",titre:"NPS global",desc:"Score de satisfaction moyen tous membres"}]}/>,
      "commissions-owner":<PageSimple title="💸 Commissions Tymeless" items={[{icon:"💰",titre:"5% automatiques",desc:"Prélevés sur chaque transaction du wallet"},{icon:"🤝",titre:"Sur les deals réseau",desc:"15–30% sur chaque deal conclu via Tymeless"},{icon:"📊",titre:"Abonnements membres",desc:"29€ / 99€ / 150€ par mois"},{icon:"🌍",titre:"SaaS white-label",desc:"5K–12K€ achat + maintenance + 5% transactions"}]}/>,
      deploiements:      <PageDeploiements/>,
    };
    return pages[page] || <PageAccueil setPage={setPage} plan={plan}/>;
  };

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"260px 1fr", fontFamily:"'DM Sans', 'Inter', ui-sans-serif, system-ui, sans-serif", background:C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        button { transition: opacity 0.15s; }
        button:hover { opacity: 0.85; }
        tr:hover td { background: #F8FAFC; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ background:`linear-gradient(180deg,${C.navy} 0%,${C.navy2} 100%)`, color:"#fff", padding:"20px 14px", minHeight:"100vh", position:"sticky", top:0, height:"100vh", overflowY:"auto", borderRight:`1px solid ${C.navyBorder}` }}>
        {/* LOGO */}
        <div style={{ marginBottom:24 }}>
          <div style={{ width:42, height:42, borderRadius:14, background:`linear-gradient(135deg,${C.gold},${C.gold}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:18, marginBottom:10, color:C.dark }}>T</div>
          <div style={{ fontSize:20, fontWeight:800 }}>Tymeless</div>
          <div style={{ color:"#64748B", fontSize:12, marginTop:2 }}>OS · {planInfo.nom}</div>
        </div>

        {/* MENU */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {NAV.map((section,gi) => (
            <div key={gi} style={{ marginBottom:18 }}>
              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color:"#64748B", fontWeight:700, marginBottom:6, paddingLeft:8 }}>{section.title}</div>
              <div style={{ display:"grid", gap:2 }}>
                {section.items.map(item => {
                  const active = page === item.key;
                  const locked = item.locked && plan === "starter";
                  return (
                    <button key={item.key+item.label} onClick={() => setPage(item.key)} style={{ textAlign:"left", border:"none", cursor:"pointer", padding:"9px 10px", borderRadius:12, fontSize:13, color:active?"#fff":"#94A3B8", background:active?`linear-gradient(135deg,rgba(201,168,76,0.35),rgba(201,168,76,0.15))`:"transparent", fontWeight:active?600:400, display:"flex", alignItems:"center", gap:7, transition:"all 0.15s", borderLeft:`2px solid ${active?C.gold:"transparent"}` }}>
                      <span style={{ flexShrink:0 }}>{locked?"🔒":item.label.split(" ")[0]}</span>
                      <span style={{ flex:1 }}>{item.label.split(" ").slice(1).join(" ")}</span>
                      {locked && <span style={{ fontSize:9, color:C.gold+"88" }}>Pro</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* UPGRADE BUTTON (si Starter) */}
        {plan === "starter" && (
          <button onClick={()=>setPage("settings")} style={{ width:"100%", background:`${C.gold}15`, border:`1px solid ${C.gold}40`, borderRadius:14, padding:"10px 12px", cursor:"pointer", fontFamily:"inherit", marginBottom:10, textAlign:"center" }}>
            <div style={{ fontSize:12, color:C.gold, fontWeight:700 }}>✦ Passer Business Pro</div>
            <div style={{ fontSize:10, color:"#64748B" }}>99€/mois — Tout débloquer</div>
          </button>
        )}

        {/* USER */}
        <div style={{ padding:"10px 8px", borderTop:`1px solid ${C.navyBorder}`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:`${C.gold}25`, border:`1px solid ${C.gold}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:C.gold, fontWeight:700 }}>B</div>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:"#E2E8F0" }}>Béné</div>
            <div style={{ fontSize:10, color:C.gold }}>{planInfo.icon} {planInfo.nom}</div>
          </div>
          {unread > 0 && <span style={{ marginLeft:"auto", background:C.red, color:"#fff", borderRadius:999, padding:"1px 7px", fontSize:9, fontWeight:700 }}>{unread}</span>}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* TOPBAR */}
        <header style={{ height:70, background:"rgba(255,255,255,0.85)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", position:"sticky", top:0, zIndex:20, boxShadow:"0 1px 10px rgba(15,23,42,0.04)" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:C.dark, fontFamily:"'Playfair Display',Georgia,serif" }}>
              {NAV.flatMap(s=>s.items).find(i=>i.key===page)?.label?.replace("🔒 ","") || "Accueil"}
            </div>
            <div style={{ fontSize:11, color:C.muted }}>Dashboard premium · Tymeless OS</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ background:plan==="starter"?C.blueBg:plan==="business"?C.goldLight:C.purpleBg, color:plan==="starter"?C.blue:plan==="business"?C.gold:C.purple, padding:"7px 14px", borderRadius:999, fontSize:12, fontWeight:700, border:`1px solid ${plan==="starter"?C.blueBorder:plan==="business"?C.goldBorder:"#DDD6FE"}` }}>
              {planInfo.icon} Plan : {planInfo.nom}
            </div>
            <button onClick={()=>setPage("notifications")} style={{ position:"relative", background:"transparent", border:`1px solid ${C.border}`, borderRadius:10, width:38, height:38, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
              🔔
              {unread > 0 && <span style={{ position:"absolute", top:-4, right:-4, background:C.red, color:"#fff", borderRadius:999, width:16, height:16, fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{unread}</span>}
            </button>
            <div style={{ width:36, height:36, borderRadius:10, background:C.goldLight, border:`1px solid ${C.goldBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:C.gold }}>B</div>
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ padding:"24px", flex:1, overflowY:"auto" }}>
          {page === "accueil" ? <PageAccueil setPage={setPage} plan={plan}/> : renderPage()}
        </main>
      </div>
    </div>
  );
}