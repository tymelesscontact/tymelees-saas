"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, SM, Tabs } from "../lib/ui";
import { CHARGES } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageInvestissement=({plan,showToast,UpgradeWall})=>{
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
export const TabCharges=({showToast})=>{
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
export const TabFournisseurs=({showToast})=>{
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

export default PageInvestissement;
