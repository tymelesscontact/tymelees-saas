"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageCRM=({plan,showToast,profil,UpgradeWall})=>{
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

export default PageCRM;
