"use client";
import { useState, useRef, useEffect } from "react";
import { useMultiSocietes } from "../lib/useMultiSocietes";
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
import PageFournisseursModule from "../modules/PageFournisseurs";
import PageRevendeurModule from "../modules/PageRevendeur";
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
import PageDealsModule from "../modules/PageDeals";
import PageDeploiementTenantModule from "../modules/PageDeploiementTenant";
import PageAPIModule from "../modules/PageAPI";
import PageSettingsModule from "../modules/PageSettings";
import UpgradeWall from "../modules/UpgradeWall";
import { MODULE_PRICES } from "../lib/plans";

import { C, DEVISES, fmt, conv, inits, Card, CT, Btn, BtnGhost, Inp, Sel, TH, Td, STitle, KPI, Pill, Tabs, SM, St } from "../lib/ui";
import { PLANS, PAGE_ACCESS, NAV, MAPPING_PLANS, normaliserPlan, PROFILS_SECTEURS, PROFIL_DEFAUT, MODULES_PAR_SECTEUR, getModulesBySecteur, hasAccess } from "../lib/dashboardConfig";
import { PageBientot, SOON_MODULES, Chat, PayCard, Convertisseur } from "../modules/DashboardShared";
import { METHODES_PAY, INIT_DEVIS, CRM_LEADS, CLIENTS, PARTENAIRES, ANNUAIRE, STOCK, PLANNING, CHARGES, TRESORERIE_90J, INIT_NOTIFS, CONTRATS, AVIS, FORMATION, EVENEMENTS, MSGS_EQUIPE, MSGS_PART, INIT_HISTO, INIT_COMM, INIT_REMB, INIT_FOUR, INIT_CARTES, MEMBRES_WALLET, METIERS } from "../lib/seedData";
// MODULE_PRICES importe depuis ../lib/plans (partage client/serveur).

const IbanMondial=({showToast})=>{
  const[ibans,setIbans]=useState([]);
  const[loadingIbans,setLoadingIbans]=useState(true);
  const[cid,setCid]=useState(null);
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({pays:"",iban:"",banque:"",bic:"",pour:""});

  // Passe par l'API (app/api/wallet-ibans) au lieu de parler directement a Supabase depuis le
  // navigateur : le meme composant, present aussi dans mon-espace/xyra.jsx, avait deja ete corrige
  // la-bas -- cette copie-ci avait ete oubliee (ajouter/supprimer echouaient en silence depuis le
  // verrou pose sur wallet_ibans, et la lecture ne passait pas par le controle d'acces de l'API).
  useEffect(()=>{
    fetch("/api/wallet-ibans").then(r=>r.json()).then(d=>{
      if(d.ibans)setIbans(d.ibans);
    }).catch(e=>console.error('IBAN load:',e)).finally(()=>setLoadingIbans(false));
  },[]);

  const handleAdd=async()=>{
    if(!form.pays||!form.iban)return;
    try{
      const res=await fetch("/api/wallet-ibans",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"ajouter",...form})});
      const data=await res.json();
      if(!data.success)throw new Error(data.error||"Erreur");
      setIbans(ib=>[...ib,data.iban]);
      setForm({pays:"",iban:"",banque:"",bic:"",pour:""});
      setShowForm(false);
      showToast&&showToast("✅ IBAN ajouté et sauvegardé !");
    }catch(e){showToast&&showToast("❌ "+(e.message&&e.message!=="Erreur"?e.message:"Erreur lors de l'ajout de l'IBAN"));}
  };

  const handleDelete=async(id)=>{
    try{
      const res=await fetch("/api/wallet-ibans",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"supprimer",id})});
      const data=await res.json();
      if(!data.success)throw new Error(data.error||"Erreur");
      setIbans(ib=>ib.filter(x=>x.id!==id));
      showToast&&showToast("✅ IBAN supprimé");
    }catch(e){showToast&&showToast("❌ "+(e.message&&e.message!=="Erreur"?e.message:"Erreur lors de la suppression"));}
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
export default function Xyra() {
  const[page,setPage]=useState("accueil");
  const[plan,setPlan]=useState("owner");
  const[tenantInfo,setTenantInfo]=useState(null);
  const[modulesActifs,setModulesActifs]=useState([]);
  useEffect(()=>{
    fetch("/api/tenant-info").then(r=>r.json()).then(d=>{
      setTenantInfo(d);
      if(Array.isArray(d.modules_actifs))setModulesActifs(d.modules_actifs);
    }).catch(()=>{});
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

  const[notifs,setNotifs]=useState([]);
  useEffect(()=>{
    fetch('/api/notifications').then(r=>r.json()).then(d=>{
      if(d.notifications){
        setNotifs(d.notifications.map(n=>({...n,heure:n.created_at?new Date(n.created_at).toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}):""})));
      }
    }).catch(()=>{});
  },[]);
  const[toast,setToast]=useState(null);
  const[profil,setProfil]=useState(PROFIL_DEFAUT);
  const{companies,setCompanies,activeCompany,setActiveCompany,vueGlobale,setVueGlobale}=useMultiSocietes();
  // Solde reel du Wallet, affiche dans l'en-tete : il vient de l'API (plus de montant ecrit en dur).
  const[soldeWallet,setSoldeWallet]=useState(null);
  useEffect(()=>{
    const cid=activeCompany?.id?`&company_id=${activeCompany.id}`:"";
    fetch(`/api/wallet?action=list${cid}`).then(r=>r.json()).then(d=>{setSoldeWallet(typeof d.solde==="number"?d.solde:null);}).catch(()=>{});
  },[activeCompany?.id,page]);
  const[sirApiKey,setSirApiKey]=useState(()=>typeof window!=="undefined"?localStorage.getItem("ty_anthropic")||"":"");
  const[sidebarOpen,setSidebarOpen]=useState(true);

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),3000);};
  useEffect(()=>{if(sirApiKey&&typeof window!=="undefined")localStorage.setItem("ty_anthropic",sirApiKey);},[sirApiKey]);
  useEffect(()=>{
    fetch("/api/tenant-info").then(r=>r.json()).then(d=>{
      if(d.secteur){
        const p=PROFILS_SECTEURS[d.secteur];
        if(p){
          const overrides=d.secteur_overrides||{};
          setProfil({...p,termes:{...p.termes,...overrides}});
        }
      }
    }).catch(()=>{});
  },[]);

  const badges={notifs:notifs.filter(n=>!n.lu).length,devis:INIT_DEVIS.filter(d=>d.statut==="en_attente").length,crm:CRM_LEADS.filter(l=>l.etape==="Nouveau").length,comm:2,chat_eq:MSGS_EQUIPE.filter(m=>!m.lu).length,stock:STOCK.filter(s=>s.qte<s.min).length};

  const pageMap={
    accueil:<PageAccueilModule notifs={notifs} setNotifs={setNotifs} profil={profil} setPage={setPage} activeCompany={activeCompany} vueGlobale={vueGlobale}/>,
    // Pages bientôt disponibles
    ...Object.fromEntries(Object.entries(SOON_MODULES).map(([k,v])=>[k,<PageBientot key={k} {...v}/>])),
    wallet:<PageWalletModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} profil={profil} activeCompany={activeCompany} METHODES_PAY={METHODES_PAY} Convertisseur={Convertisseur} IbanMondial={IbanMondial}/>,
    cartes:<PageCartesModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} activeCompany={activeCompany} UpgradeWall={UpgradeWall}/>,
    overview:<PageOverviewModule plan={plan} profil={profil} setPage={setPage} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    crm:<PageCRMModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} setPage={setPage} profil={profil} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    devis:<PageDevis plan={plan} modulesActifs={modulesActifs} showToast={showToast} profil={profil} activeCompany={activeCompany} UpgradeWall={UpgradeWall}/>,
    investissement:<PageInvestissementModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    compta:<PageComptaModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    notefrais:<PageNoteFraisModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} activeCompany={activeCompany} UpgradeWall={UpgradeWall}/>,
    tresorerie:<PageTresorerieModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    analytique:<PageAnalytiqueModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    clients:<PageClientsModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} profil={profil} setPage={setPage} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    fournisseurs:<PageFournisseursModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} setPage={setPage} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    revendeur:<PageRevendeurModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    partenaires:<PagePartenairesModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} setPage={setPage} UpgradeWall={UpgradeWall} activeCompany={activeCompany} Chat={Chat}/>,
    club_affaires:<PageClubAffairesModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} setPage={setPage}/>,
    multi_societes:<PageMultiSocietesModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    annuaire:<PageAnnuaireModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany} setPage={setPage}/>,
    evenements:<PageEvenementsModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    scoring:<PageScoringModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    equipe:<PageEquipeModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany} setPage={setPage}/>,
    planning:<PagePlanningModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall}/>,
    prospection:<PageProspectionModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    deals:<PageDealsModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} setPage={setPage} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    stock:<PageStockModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    services:<PageServicesModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} profil={profil} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    chat:<PageChatModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} Chat={Chat} activeCompany={activeCompany}/>,
    conversations_whatsapp:<PageConversationsWhatsapp/>,
    notifications:<PageNotificationsModule notifs={notifs} setNotifs={setNotifs} showToast={showToast} activeCompany={activeCompany}/>,
    signature:<PageSignaturesModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    facturation:<PageFacturationModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    formation:<PageFormationModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall}/>,
    api:<PageAPIModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} UpgradeWall={UpgradeWall} activeCompany={activeCompany}/>,
    settings:<PageSettingsModule plan={plan} modulesActifs={modulesActifs} showToast={showToast} sirApiKey={sirApiKey} setSirApiKey={setSirApiKey} profil={profil} setProfil={setProfil} PLANS={PLANS} PROFILS_SECTEURS={PROFILS_SECTEURS}/>,
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
          <select value={profil?.label||PROFIL_DEFAUT.label} onChange={e=>{const entry=Object.entries(PROFILS_SECTEURS).find(([k,s])=>s.label===e.target.value);if(entry){setProfil(entry[1]);fetch("/api/save-secteur",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({secteur:entry[0]})}).then(r=>r.json()).then(rd=>{if(!rd.success)showToast&&showToast("❌ "+(rd.error||"Erreur"));}).catch(()=>{});}}} style={{marginTop:8,background:C.card2,border:`1px solid ${C.gold}44`,borderRadius:5,padding:"4px 6px",color:C.gold,fontSize:10,width:"100%",fontFamily:"inherit"}}>
            {Object.values(PROFILS_SECTEURS).map(p=><option key={p.label} value={p.label}>{p.label}</option>)}
          </select>
          {companies.length>0&&<div style={{marginTop:8}}>
            <select value={vueGlobale?"global":activeCompany?.id||""} onChange={e=>{if(e.target.value==="global"){setVueGlobale(true);}else{setVueGlobale(false);const c=companies.find(x=>x.id===e.target.value);if(c)setActiveCompany(c);}}} style={{background:C.card2,border:`1px solid ${C.purple}44`,borderRadius:5,padding:"4px 6px",color:C.purple,fontSize:10,width:"100%",fontFamily:"inherit"}}>
              <option value="global">🌐 Vue Globale (toutes)</option>
              {companies.map(c=><option key={c.id} value={c.id}>🏢 {c.nom}</option>)}
            </select>
          </div>}
        </div>

        {/* Nav */}
        <div style={{flex:1,overflowY:"auto",padding:"6px 0"}}>
          {NAV.map((grp,gi)=><div key={gi}>
            <div style={{fontSize:9,color:"#9090B8",letterSpacing:"0.2em",textTransform:"uppercase",padding:"10px 13px 3px",marginTop:gi>0?4:0,fontWeight:600}}>{grp.group}</div>
            {grp.items.map((item)=>{
              const active=page===item.id;
              const locked=!hasAccess(plan,item.id)&&!modulesActifs.includes(item.id);
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
            <div style={{fontSize:16,fontWeight:700,color:C.gold}}>{soldeWallet===null?"—":fmt(soldeWallet)}</div>
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
