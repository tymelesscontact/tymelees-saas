"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM, St } from "../lib/ui";
import { PARTENAIRES, ANNUAIRE, CONTRATS } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PagePartenaires=({plan,showToast,UpgradeWall})=>{
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

export default PagePartenaires;
