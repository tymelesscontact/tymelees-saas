"use client";
import { ouvrirChat } from "../lib/ouvrirChat";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageDeals=({plan, modulesActifs,showToast,UpgradeWall,activeCompany,setPage})=>{
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
      const companyParam=activeCompany?.id?`?company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/deals'+companyParam);
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
  useEffect(()=>{_loadDeals();},[activeCompany?.id]);
  const ETAPES=["Identification","Qualification","Proposition","Négociation","Closing","Gagné","Perdu"];
  const[deals,setDeals]=useState([
    {id:"DEAL-001",exemple:true,nom:"Contrat Hôtel Prestige Paris",valeur:12000,prob:85,etape:"Proposition",client:"Claire Bernard",tel:"+33 1 23 45 67",email:"claire@prestige.fr",dead:"30/04/2026",source:"CRM",desc:"Nettoyage 40 chambres/jour + entretien communs",actions:[{date:"14/04",type:"Email",note:"Proposition envoyée"},{date:"12/04",type:"RDV",note:"Présentation en présentiel"}],dernierContact:"14/04"},
    {id:"DEAL-002",exemple:true,nom:"Partenariat Jet Services Monaco",valeur:24000,prob:92,etape:"Négociation",client:"Antoine Rivière",tel:"+377 99 88 77",email:"a.riviere@jetservices.mc",dead:"15/05/2026",source:"Réseau",desc:"Contrat annuel nettoyage flotte jets privés Monaco",actions:[{date:"13/04",type:"WhatsApp",note:"Contre-proposition reçue"},{date:"10/04",type:"RDV",note:"Négociation tarifs"}],dernierContact:"13/04"},
    {id:"DEAL-003",exemple:true,nom:"SaaS White-label Cabinet Dupont",valeur:5000,prob:60,etape:"Qualification",client:"Me Dupont",tel:"+33 1 55 66 77",email:"dupont@cabinet.fr",dead:"30/05/2026",source:"LinkedIn",desc:"Licence Xyra pour cabinet juridique 15 personnes",actions:[{date:"11/04",type:"Email",note:"Envoi documentation"}],dernierContact:"11/04"},
    {id:"DEAL-004",exemple:true,nom:"Syndic Val-de-Marne — Lot 5 résidences",valeur:18000,prob:45,etape:"Identification",client:"M. Lefebre",tel:"+33 1 44 55 66",email:"lefebre@syndic.fr",dead:"30/06/2026",source:"Prospection",desc:"Nettoyage 5 résidences Val-de-Marne — contrat annuel",actions:[{date:"10/04",type:"Appel",note:"Premier contact cold call"}],dernierContact:"10/04"},
  ]);
  const[onglet,setOnglet]=useState("kanban");
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",client:"",valeur:"",prob:"50",etape:"Identification",dead:"",email:"",tel:"",source:"CRM",desc:""});

  const tabs=[{id:"kanban",label:"📊 Pipeline Kanban"},{id:"liste",label:"📋 Liste deals"},{id:"fiche",label:"📁 Fiche deal"},{id:"propositions",label:"📄 Propositions"},{id:"alertes",label:"🔔 Alertes"},{id:"stats",label:"📈 Stats"}];

  // Les deals d'exemple (affiches tant que l'entreprise n'en a aucun) ne comptent pas dans les compteurs.
  const dealsReels=deals.filter(d=>!d.exemple);
  const totalPipeline=dealsReels.reduce((a,d)=>a+d.valeur,0);
  const totalPondere=dealsReels.reduce((a,d)=>a+d.valeur*(d.prob/100),0);
  const etapeColor={Identification:C.muted,Qualification:C.blue,Proposition:C.gold,Négociation:C.orange,Closing:C.purple,Gagné:C.green,Perdu:C.red};

  // Actions de la fiche branchees sur les vraies routes ; un deal d'exemple reste local.
  const contacterDeal=(d)=>{
    if(d.exemple)return showToast(`📱 Contact ${d.client} (exemple)`);
    ouvrirChat({nom:d.client||d.nom,email:d.email,tel:d.tel,type:"client"},setPage,showToast);
  };
  const ajouterActionDeal=async(d)=>{
    if(d.exemple)return showToast("✅ Action ajoutée (exemple)");
    const note=window.prompt("Action à ajouter (appel, RDV, note…)");
    if(!note)return;
    await _ajouterTimeline(d.id,"Note",note);
    setSel(s=>s&&s.id===d.id?{...s,timeline:[{type:"Note",description:note,created_at:new Date().toISOString()},...(s.timeline||[])]}:s);
    showToast("✅ Action ajoutée");
  };
  const creerDevisDepuisDeal=async(d)=>{
    if(d.exemple)return showToast("✅ Devis créé depuis le deal (exemple)");
    try{
      const res=await fetch('/api/devis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        clientName:d.client||d.nom,clientEmail:d.email||"",clientPhone:d.tel||"",
        service:d.nom,description:d.desc||d.nom,montant:Number(d.valeur)||0,
        lignes:[{desc:d.nom,qte:1,pu:Number(d.valeur)||0}],statut:"brouillon",
      })});
      const data=await res.json();
      if(!data.success)return showToast("❌ "+(data.error||"Erreur lors de la création du devis"));
      showToast(`✅ Devis brouillon ${data.numeroDevis||""} créé`);
      if(setPage)setPage("devis");
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const bientot=()=>showToast("🚧 Bientôt disponible : génération de propositions commerciales");

  if(!hasAccess(plan,"deals",modulesActifs))return <div style={{padding:20}}><UpgradeWall page="deals" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>📋 Deals & Opportunités</div>
        <div style={{fontSize:11,color:C.muted}}>Pipeline Kanban · IA Closing · Propositions · Suivi · {dealsReels.length} deals</div></div>
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
        <Btn onClick={async()=>{
          if(!addForm.nom)return showToast("⚠️ Nom du deal requis");
          try{
            const res=await fetch('/api/deals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',nom:addForm.nom,client:addForm.client,valeur:Number(addForm.valeur)||0,prob:Number(addForm.prob)||50,etape:addForm.etape,dead:addForm.dead,email:addForm.email,tel:addForm.tel,source:addForm.source,desc:addForm.desc})});
            const data=await res.json();
            if(data.doublon){setDoublon(data);return showToast("⚠️ "+data.message);}
            if(!data.success)return showToast("❌ "+(data.error||"Erreur"));
            setShowAdd(false);setAddForm({nom:"",client:"",valeur:"",prob:"50",etape:"Identification",dead:"",email:"",tel:"",source:"CRM",desc:""});
            showToast(`✅ Deal "${data.deal?.nom||addForm.nom}" créé !`);_loadDeals();
          }catch(e){showToast("❌ Erreur");}
        }}>✅ Créer le deal</Btn>
        <BtnGhost onClick={()=>setShowAdd(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <KPI label="Pipeline total" val={fmt(totalPipeline)} color={C.gold}/>
      <KPI label="CA pondéré IA" val={fmt(Math.round(totalPondere))} color={C.green}/>
      <KPI label="Deals actifs" val={dealsReels.filter(d=>!["Gagné","Perdu"].includes(d.etape)).length} color={C.blue}/>
      <KPI label="Prob. moy." val={dealsReels.length?Math.round(dealsReels.reduce((a,d)=>a+d.prob,0)/dealsReels.length)+"%":"—"} color={C.teal}/>
    </div>
    {deals.length>0&&dealsReels.length===0&&<div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:11,color:C.gold}}>💡 Exemples — ces deals servent à montrer l&apos;outil et ne comptent pas. Créez votre premier deal avec « + Nouveau deal » : ils disparaîtront.</div>}

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
            <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:2,lineHeight:1.3}}>{d.nom}{d.exemple&&<span style={{fontSize:8,background:`${C.muted}22`,color:C.muted,padding:"1px 5px",borderRadius:6,marginLeft:4,fontWeight:600}}>Exemple</span>}</div>
            <div style={{fontSize:9,color:C.muted,marginBottom:4}}>{d.client}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:700,color}}>{fmt(d.valeur)}</span>
              <span style={{fontSize:9,background:`${d.prob>=70?C.green:d.prob>=40?C.gold:C.orange}22`,color:d.prob>=70?C.green:d.prob>=40?C.gold:C.orange,padding:"1px 5px",borderRadius:8,fontWeight:600}}>{d.prob}%</span>
            </div>
            <SM val={d.prob} max={100} color={d.prob>=70?C.green:d.prob>=40?C.gold:C.orange}/>
            <div style={{fontSize:9,color:C.muted,marginTop:4}}>📅 {d.dead}</div>
            <div style={{display:"flex",gap:4,marginTop:6}}>
              {["Gagné","Perdu"].includes(d.etape)||<button onClick={e=>{e.stopPropagation();const idx=ETAPES.indexOf(d.etape);if(idx<ETAPES.length-1){setDeals(ds=>ds.map(x=>x.id===d.id?{...x,etape:ETAPES[idx+1]}:x));if(d.exemple)showToast(`✅ Deal avancé à "${ETAPES[idx+1]}" (exemple)`);else{showToast(`✅ Deal avancé à "${ETAPES[idx+1]}"`);_changerEtape(d,ETAPES[idx+1]);}}}} style={{flex:1,background:color+"22",color,border:`1px solid ${color}44`,borderRadius:4,padding:"3px 0",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>→ Avancer</button>}
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
          <Td style={{fontWeight:700,fontSize:11}}>{d.nom}{d.exemple&&<span style={{fontSize:8,background:`${C.muted}22`,color:C.muted,padding:"1px 5px",borderRadius:6,marginLeft:4,fontWeight:600}}>Exemple</span>}</Td>
          <Td style={{color:C.muted}}>{d.client}</Td>
          <Td style={{color:C.gold,fontWeight:700}}>{fmt(d.valeur)}</Td>
          <Td><div style={{display:"flex",alignItems:"center",gap:6}}><SM val={d.prob} max={100} color={d.prob>=70?C.green:d.prob>=40?C.gold:C.orange}/><span style={{color:d.prob>=70?C.green:d.prob>=40?C.gold:C.orange,fontWeight:700,fontSize:11}}>{d.prob}%</span></div></Td>
          <Td><Pill color={etapeColor[d.etape]||C.muted}>{d.etape}</Pill></Td>
          <Td style={{color:C.muted,fontSize:10}}>{d.dead}</Td>
          <Td style={{color:C.muted,fontSize:10}}>{d.dernierContact}</Td>
          <Td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:4}}>
            <Btn onClick={()=>{setSel(d);setOnglet("fiche");}} style={{fontSize:9,padding:"3px 7px"}}>Fiche</Btn>
            <BtnGhost onClick={()=>contacterDeal(d)} style={{fontSize:9,padding:"3px 7px"}} title="Contacter (Chat)">💬</BtnGhost>
          </div></Td>
        </tr>)}</tbody>
      </table>
    </Card>}

    {/* ── FICHE DEAL ── */}
    {onglet==="fiche"&&<div>
      {sel?<div>
        <BtnGhost onClick={()=>setSel(null)} style={{marginBottom:14}}>← Retour</BtnGhost>
        {(sel.email||sel.tel)&&<Btn onClick={()=>contacterDeal(sel)} style={{marginBottom:14,marginLeft:8,background:C.green}}>💬 Discuter</Btn>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card style={{borderColor:`${etapeColor[sel.etape]||C.border}44`}}>
              <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{sel.nom}</div>
              <div style={{display:"flex",gap:6,marginBottom:12}}><Pill color={etapeColor[sel.etape]||C.muted}>{sel.etape}</Pill><Pill color={sel.prob>=70?C.green:sel.prob>=40?C.gold:C.orange}>{sel.prob}% closing</Pill></div>
              {[["👤 Client",sel.client],["📧 Email",sel.email],["📱 Téléphone",sel.tel],["💰 Valeur",fmt(sel.valeur)],["📅 Deadline",sel.dead],["🔍 Source",sel.source],["📝 Description",sel.desc]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,maxWidth:"60%",textAlign:"right"}}>{v}</span></div>)}
            </Card>
            <Card>
              <STitle>📋 Historique actions</STitle>
              {(sel.actions||(sel.timeline||[]).map(t=>({type:t.type,note:t.description,date:t.created_at?new Date(t.created_at).toLocaleDateString("fr"):""}))).map((a,i)=><div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}22`}}>
                <Pill color={a.type==="RDV"?C.gold:a.type==="Email"?C.blue:a.type==="WhatsApp"?C.green:C.muted}>{a.type}</Pill>
                <div style={{flex:1}}><div style={{fontSize:11}}>{a.note}</div><div style={{fontSize:9,color:C.muted}}>{a.date}</div></div>
              </div>)}
              <button onClick={()=>ajouterActionDeal(sel)} style={{marginTop:8,background:"transparent",color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Ajouter une action</button>
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
                <Btn onClick={()=>contacterDeal(sel)} style={{background:C.green,color:"#000"}}>💬 Contacter (Chat)</Btn>
                <Btn onClick={()=>creerDevisDepuisDeal(sel)} style={{background:C.blue}}>◧ Créer un devis</Btn>
                <BtnGhost onClick={bientot}>📄 Générer proposition</BtnGhost>
                <BtnGhost onClick={()=>{const idx=ETAPES.indexOf(sel.etape);if(idx<ETAPES.length-1){const nextEtape=ETAPES[idx+1];setDeals(ds=>ds.map(d=>d.id===sel.id?{...d,etape:nextEtape}:d));setSel(s=>({...s,etape:nextEtape}));if(sel.exemple)showToast(`✅ Deal avancé à "${nextEtape}" (exemple)`);else{showToast(`✅ Deal avancé à "${nextEtape}"`);_changerEtape(sel,nextEtape);}}}} style={{color:C.gold,borderColor:`${C.gold}44`}}>→ Avancer dans le pipeline</BtnGhost>
                <BtnGhost onClick={()=>{setDeals(ds=>ds.map(d=>d.id===sel.id?{...d,etape:"Perdu"}:d));setSel(s=>({...s,etape:"Perdu"}));showToast("❌ Deal marqué comme perdu"+(sel.exemple?" (exemple)":""));if(!sel.exemple)_changerEtape(sel,"Perdu");}} style={{color:C.red,borderColor:`${C.red}33`}}>❌ Marquer comme perdu</BtnGhost>
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
        <Btn onClick={bientot}>🤖 Générer proposition (IA)</Btn>
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
          <Btn onClick={bientot} style={{fontSize:11}}>📄 PDF</Btn>
          <BtnGhost onClick={bientot} style={{fontSize:11}}>📱 WhatsApp</BtnGhost>
          <BtnGhost onClick={bientot} style={{fontSize:11}}>📧 Email</BtnGhost>
          <BtnGhost onClick={bientot} style={{fontSize:11}}>🤖 Personnaliser</BtnGhost>
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
            <Btn onClick={()=>d.exemple?showToast(`📱 Relance envoyée à ${d.client} (exemple)`):_genererRelanceIA(d)} style={{fontSize:11,flexShrink:0}}>{_relanceLoading[d.id]?"⏳ IA…":"Relancer"}</Btn>
          </div>
          {!d.exemple&&_relanceCache[d.id]&&<div style={{marginTop:10,background:C.card,borderRadius:8,padding:10}}>
            <div style={{fontSize:11,color:C.text,whiteSpace:"pre-line",marginBottom:8}}>{_relanceCache[d.id]}</div>
            <div style={{display:"flex",gap:6}}>
              {d.tel&&<Btn onClick={()=>_envoyerRelance(d,"whatsapp")} style={{fontSize:10,background:C.green,color:"#000"}}>📱 Envoyer WhatsApp</Btn>}
              {d.email&&<BtnGhost onClick={()=>_envoyerRelance(d,"email")} style={{fontSize:10}}>📧 Envoyer email</BtnGhost>}
            </div>
          </div>}
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

export default PageDeals;
