"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, SM, Tabs } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const RISQUE_COULEUR={Faible:"green",Moyen:"orange",Élevé:"red"};

const PageInvestissement=({plan, modulesActifs,showToast,UpgradeWall,activeCompany})=>{
  const[onglet,setOnglet]=useState("reco");
  const[recommandations,setRecommandations]=useState([]);
  const[portefeuille,setPortefeuille]=useState({investiTotal:0,roiMoyen:0,nbActifs:0});
  const[finances,setFinances]=useState(null);
  const[loading,setLoading]=useState(true);
  const[generation,setGeneration]=useState(false);
  const tabs=[{id:"reco",label:"🤖 Recommandations IA"},{id:"portefeuille",label:"💼 Portefeuille"},{id:"plan",label:"Plan d'action"},{id:"scenarios",label:"📊 Scénarios"}];

  const charger=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/investissement');
      const data=await res.json();
      setRecommandations(data.recommandations||[]);
      setPortefeuille(data.portefeuille||{investiTotal:0,roiMoyen:0,nbActifs:0});
      setFinances(data.finances||null);
    }catch{showToast("❌ Erreur de chargement");}
    setLoading(false);
  };
  useEffect(()=>{charger();},[]);

  if(!hasAccess(plan,"investissement",modulesActifs))return <div style={{padding:20}}><UpgradeWall page="investissement" plan={plan}/></div>;

  const generer=async()=>{
    setGeneration(true);
    try{
      const res=await fetch('/api/investissement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer'})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur génération"}`);}
      else{showToast("✅ Recommandations générées");await charger();}
    }catch{showToast("❌ Erreur génération");}
    setGeneration(false);
  };
  const statuer=async(id,action)=>{
    try{
      const res=await fetch('/api/investissement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,id})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast(action==='valider'?"✅ Investissement validé":"↩ Recommandation rejetée");
      await charger();
    }catch{showToast("❌ Erreur");}
  };

  const proposees=recommandations.filter(r=>r.statut==="proposee");
  const validees=recommandations.filter(r=>r.statut==="validee");
  const derniereValidee=validees[0];

  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◐ Investissement IA</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Recommandations Claude · ROI · Plan d'action · Portefeuille</div>
    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>
    {onglet==="reco"&&<div>
      {finances&&<div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:14,marginBottom:16}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Situation réelle analysée</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>CA cumulé (factures payées) : <b>{fmt(finances.caTotal)}</b> · Charges mensuelles : <b>{fmt(finances.chargesMensuelles)}</b> · Marge estimée : <b>{finances.marge}%</b></div>
      </div>}
      <div style={{marginBottom:16}}>
        <Btn onClick={generer} disabled={generation}>{generation?"⏳ Analyse en cours...":"🤖 Générer mes recommandations"}</Btn>
      </div>
      {loading?<div style={{fontSize:12,color:C.muted}}>Chargement...</div>:
       proposees.length===0?<div style={{fontSize:12,color:C.muted}}>Aucune recommandation pour l'instant — clique sur "Générer mes recommandations" pour que l'IA analyse ta situation réelle.</div>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {proposees.map((r)=><Card key={r.id} style={{borderColor:r.priorite==="haute"?`${C.gold}44`:C.border}}>
          {r.priorite==="haute"&&<div style={{marginBottom:8}}><Pill color={C.gold}>★ Priorité haute</Pill></div>}
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{r.titre}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.6}}>{r.description}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>ROI estimé</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>+{r.roi_estime_pct}%</div></CT>
            <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Investissement</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(r.budget_estime)}</div></CT>
          </div>
          {r.notes&&<div style={{fontSize:11,color:C.muted,marginBottom:10}}>{r.notes}</div>}
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>statuer(r.id,'valider')} style={{flex:1}}>Valider</Btn>
            <BtnGhost onClick={()=>statuer(r.id,'rejeter')} style={{flex:1}}>Rejeter</BtnGhost>
          </div>
        </Card>)}
      </div>}
    </div>}
    {onglet==="portefeuille"&&<Card><STitle>💼 Portefeuille d'investissements</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:validees.length>0?16:0}}>
        <KPI label="Investi total" val={fmt(portefeuille.investiTotal)} color={C.gold}/>
        <KPI label="ROI moyen" val={`+${portefeuille.roiMoyen}%`} color={C.green}/>
        <KPI label="Actif" val={`${portefeuille.nbActifs} projet${portefeuille.nbActifs>1?"s":""}`} color={C.blue}/>
      </div>
      {validees.map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.border}22`}}>
        <div style={{fontSize:12,color:C.text,fontWeight:600}}>{r.titre}</div>
        <div style={{fontSize:12,color:C.gold,fontWeight:700}}>{fmt(r.budget_estime)}</div>
      </div>)}
    </Card>}
    {onglet==="plan"&&<Card><STitle>Plan d'action{derniereValidee?` — ${derniereValidee.titre}`:""}</STitle>
      {derniereValidee?<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{derniereValidee.description}{derniereValidee.notes&&<div style={{marginTop:10,fontSize:11,color:C.muted}}>{derniereValidee.notes}</div>}</div>:
      <div style={{fontSize:12,color:C.muted}}>Valide une recommandation dans l'onglet "Recommandations IA" pour voir son plan d'action ici.</div>}
    </Card>}
    {onglet==="scenarios"&&<Card><STitle>📊 Scénarios de croissance</STitle>
      {finances&&finances.caTotal>0?[["Conservateur",15,C.blue],["Modéré",35,C.gold],["Agressif",60,C.green]].map(([n,pct,c])=>{
        const projection=Math.round(finances.caTotal*(1+Number(pct)/100));
        return <div key={n} style={{background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${c}33`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontSize:12,fontWeight:700,color:c}}>{n}</div><div style={{fontSize:14,fontWeight:700,color:c}}>{fmt(projection)}</div></div>
          <div style={{fontSize:11,color:C.muted}}>CA +{pct}% par rapport au cumul actuel ({fmt(finances.caTotal)})</div>
        </div>;
      }):<div style={{fontSize:12,color:C.muted}}>Pas encore de facture payée enregistrée — les scénarios apparaîtront une fois du chiffre d'affaires réel disponible.</div>}
    </Card>}
  </div>;
};

// ─── TAB CHARGES ──────────────────────────────────────────────
export const TabCharges=({showToast,activeCompany})=>{
  const[charges,setCharges]=useState([]);
  const[loading,setLoading]=useState(true);
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({categorie:"",libelle:"",montant:"",frequence:"mensuelle"});
  const[editId,setEditId]=useState(null);

  const load=async()=>{
    try{
      const companyParam=activeCompany?.id?`?company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/charges'+companyParam);
      const data=await res.json();
      if(data.charges)setCharges(data.charges);
    }catch(e){console.error("Charges:",e);}
    setLoading(false);
  };
  useEffect(()=>{load();},[activeCompany?.id]);

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
export const TabFournisseurs=({showToast,activeCompany})=>{
  const[fours,setFours]=useState([]);
  const[loading,setLoading]=useState(true);
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({nom:"",categorie:"",contact:"",iban:"",delai_livraison:""});
  const[showCmd,setShowCmd]=useState(null);
  const[montantCmd,setMontantCmd]=useState("");

  const load=async()=>{
    try{
      const companyParam2=activeCompany?.id?`?company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/fournisseurs'+companyParam2);
      const data=await res.json();
      if(data.fournisseurs)setFours(data.fournisseurs);
    }catch(e){console.error("Fournisseurs:",e);}
    setLoading(false);
  };
  useEffect(()=>{load();},[activeCompany?.id]);

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
