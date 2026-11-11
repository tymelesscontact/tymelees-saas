"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp } from "../lib/ui";
import { FORMATION } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageFacturation=({plan, modulesActifs,showToast,UpgradeWall,activeCompany})=>{
  const[onglet,setOnglet]=useState("dashboard");
  const[factures,setFactures]=useState([]);
  const[loadingFact,setLoadingFact]=useState(true);

  const loadFactures=async()=>{
    try{
      const companyParam=activeCompany?.id?`&company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/factures?action=list'+companyParam);
      const data=await res.json();
      if(data.factures)setFactures(data.factures);
    }catch(e){console.error("Factures:",e);}
    setLoadingFact(false);
  };
  useEffect(()=>{loadFactures();},[activeCompany?.id]);

  const[newFact,setNewFact]=useState({client_nom:"",client_email:"",client_tel:"",client_adresse:"",siren:"",type_client:"entreprise",description:"",montant_ht:"",taux_tva:"20",format:"Factur-X"});
  const tvaMontant=newFact.montant_ht?Math.round(Number(newFact.montant_ht)*Number(newFact.taux_tva))/100:0;
  const ttc=newFact.montant_ht?Number(newFact.montant_ht)+tvaMontant:0;

  const[categoriesCatalogue,setCategoriesCatalogue]=useState([]);
  const[margesCibles,setMargesCibles]=useState([]);
  const[rentabiliteClientsAssist,setRentabiliteClientsAssist]=useState([]);
  const[categorieAssist,setCategorieAssist]=useState("");
  const[coutAssist,setCoutAssist]=useState("");
  const[margeCatEnEdition,setMargeCatEnEdition]=useState(null);
  const[margeCatValeur,setMargeCatValeur]=useState("30");
  useEffect(()=>{
    fetch('/api/services-catalogue').then(r=>r.json()).then(d=>{
      const cats=[...new Set((d.services||[]).map(s=>s.categorie).filter(Boolean))];
      setCategoriesCatalogue(cats);
    }).catch(()=>{});
    fetch('/api/marges-cibles').then(r=>r.json()).then(d=>setMargesCibles(d.marges||[])).catch(()=>{});
    fetch('/api/clients?vue=rentabilite').then(r=>r.json()).then(d=>setRentabiliteClientsAssist(d.lignes||[])).catch(()=>{});
  },[]);
  const clientTrouve=newFact.client_nom?rentabiliteClientsAssist.find(l=>l.nom.toLowerCase().trim()===newFact.client_nom.toLowerCase().trim()):null;
  const margeCibleActuelle=categorieAssist?(margesCibles.find(m=>m.categorie===categorieAssist)?.marge_cible_pct??30):30;
  const montantSuggere=coutAssist?Math.round(Number(coutAssist)*(1+margeCibleActuelle/100)):null;
  const definirMargeCategorie=async(categorie,valeur)=>{
    try{
      await fetch('/api/marges-cibles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'definir',categorie,marge_cible_pct:Number(valeur)})});
      const d=await(await fetch('/api/marges-cibles')).json();
      setMargesCibles(d.marges||[]);
      setMargeCatEnEdition(null);
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const tabs=[
    {id:"dashboard",label:"📊 Tableau de bord"},
    {id:"creer",label:"➕ Créer une facture"},
    {id:"historique",label:"📋 Historique"},
    {id:"ereporting",label:"📤 Conformité DGFiP"},
    {id:"guide",label:"📖 Guide réforme"},
  ];

  const statutColor={payée:C.green,"émise":C.blue,en_retard:C.red,brouillon:C.muted,annulée:C.muted};
  const facturesEmises=factures.filter(f=>["émise","en_retard","payée"].includes(f.statut));
  const caEncaisseHT=factures.filter(f=>f.statut==="payée").reduce((a,f)=>a+Number(f.montant_ht||0),0);
  const aEncaisserHT=factures.filter(f=>["émise","en_retard"].includes(f.statut)).reduce((a,f)=>a+Number(f.montant_ht||0),0);
  const payées=factures.filter(f=>f.statut==="payée").length;

  // Apercu = le vrai PDF envoye au client (mentions legales comprises)
  const apercuPDF=(f)=>{
    const win=window.open(`/api/factures?action=pdf&id=${f.id}`,"_blank");
    if(!win)showToast("⚠️ Autorisez les pop-ups pour voir le PDF");
  };

  const creerAvoir=async(f)=>{
    const motif=window.prompt(`Créer un avoir qui annule la facture ${f.numero} (${Number(f.montant_ttc).toFixed(2)} € TTC) ?\nMotif (facultatif) :`,"");
    if(motif===null)return;
    try{
      const res=await fetch('/api/factures',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'avoir',id:f.id,motif})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok||data.error){showToast("❌ "+(data.error==="reserve_au_proprietaire_ou_admin"?"Réservé au propriétaire ou à un Admin":(data.error||"Erreur")));return;}
      showToast(`✅ Avoir ${data.avoir?.numero||""} créé — facture ${f.numero} annulée`);
      loadFactures();
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const creerFacture=async()=>{
    if(!newFact.client_nom||!newFact.montant_ht)return showToast("⚠️ Remplissez client et montant");
    showToast("⏳ Création de la facture...");
    try{
      const res=await fetch('/api/factures',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',...newFact,company_id:activeCompany?.id||null})});
      const data=await res.json();
      if(data.success){
        showToast(`✅ Facture ${data.facture.numero} créée !`);
        setNewFact({client_nom:"",client_email:"",client_tel:"",client_adresse:"",siren:"",type_client:"entreprise",description:"",montant_ht:"",taux_tva:"20",format:"Factur-X"});
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
      if(data.success)showToast(data.envoye?"✅ Relance envoyée !":"⚠️ Relance non envoyée — "+(data.raison||"envoi impossible"));else showToast("❌ "+(data.error||"Erreur"));
      loadFactures();
    }catch(e){showToast("❌ Erreur");}
  };

  if(!hasAccess(plan,"facturation",modulesActifs))return <div style={{padding:20}}><UpgradeWall page="facturation" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>🧾 Facturation</div>
        <div style={{fontSize:11,color:C.muted}}>Factures réelles · Lien de paiement Stripe · Relances automatiques</div>
      </div>
      <Btn onClick={()=>setOnglet("creer")}>+ Nouvelle facture</Btn>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      {[["Factures émises",facturesEmises.length,C.blue],["Payées",payées,C.green],["CA encaissé HT",fmt(caEncaisseHT),C.gold],["À encaisser HT",fmt(aEncaisserHT),C.red]].map(([l,v,c],i)=><CT key={i}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></CT>)}
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
            <div style={{gridColumn:"1 / -1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Adresse du client (mention obligatoire)</label><Inp value={newFact.client_adresse} onChange={e=>setNewFact(f=>({...f,client_adresse:e.target.value}))} placeholder="12 rue de la Paix, 75002 Paris"/></div>
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
        <Card style={{background:`${C.purple}08`,borderColor:`${C.purple}33`}}>
          <STitle>🤖 Assistant de facturation</STitle>
          {clientTrouve?<div style={{fontSize:11,color:C.text,marginBottom:10,padding:8,background:`${C.purple}11`,borderRadius:6}}>
            <b>{clientTrouve.nom}</b> ce mois-ci : {clientTrouve.nbMissions} mission(s), €{clientTrouve.caEncaisse.toLocaleString("fr")} déjà encaissés, €{clientTrouve.coutEngage.toLocaleString("fr")} de coût réel engagé — marge actuelle {clientTrouve.margePct==null?"—":`${clientTrouve.margePct}%`}.
          </div>:newFact.client_nom?<div style={{fontSize:11,color:C.muted,marginBottom:10}}>Aucun historique ce mois-ci pour "{newFact.client_nom}" — première facture, pas de suggestion possible.</div>:<div style={{fontSize:11,color:C.muted,marginBottom:10}}>Renseigne le nom du client pour voir son historique réel.</div>}

          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Catégorie de la prestation</div>
          <select value={categorieAssist} onChange={e=>setCategorieAssist(e.target.value)} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 10px",color:C.text,fontSize:12,fontFamily:"inherit",width:"100%",marginBottom:8}}>
            <option value="">— Choisir —</option>
            {categoriesCatalogue.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          {categorieAssist&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,fontSize:10,color:C.muted}}>
            Marge cible pour "{categorieAssist}" :
            {margeCatEnEdition===categorieAssist?<>
              <input type="number" value={margeCatValeur} onChange={e=>setMargeCatValeur(e.target.value)} style={{width:50,background:C.card2,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 4px",color:C.text,fontSize:10}}/>%
              <button onClick={()=>definirMargeCategorie(categorieAssist,margeCatValeur)} style={{background:C.purple,color:"#fff",border:"none",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>OK</button>
            </>:<>
              <b style={{color:C.purple}}>{margeCibleActuelle}%</b>
              <button onClick={()=>{setMargeCatEnEdition(categorieAssist);setMargeCatValeur(String(margeCibleActuelle));}} style={{background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>modifier</button>
            </>}
          </div>}

          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Coût réel engagé pour cette prestation (€)</div>
          <Inp value={coutAssist} onChange={e=>setCoutAssist(e.target.value)} placeholder={clientTrouve?String(clientTrouve.coutEngage):"0.00"}/>

          {montantSuggere!=null&&<div style={{marginTop:10,padding:10,background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8}}>
            <div style={{fontSize:10,color:C.muted}}>Coût {coutAssist}€ × (1 + {margeCibleActuelle}% de marge) =</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
              <div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(montantSuggere)}</div>
              <button onClick={()=>{setNewFact(f=>({...f,montant_ht:String(montantSuggere)}));showToast("✅ Montant appliqué au formulaire — modifiable avant envoi");}} style={{background:C.gold,color:"#000",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontWeight:600,fontSize:11,fontFamily:"inherit"}}>Utiliser ce montant</button>
            </div>
          </div>}
        </Card>
        <Card style={{background:`${C.blue}08`,borderColor:`${C.blue}33`}}>
          <STitle>📋 Mentions obligatoires</STitle>
          {[["Numéro de facture séquentiel","✅ Auto-généré",C.green],["Date d'émission","✅ Auto",C.green],["Montant HT/TVA/TTC","✅ Calculé auto",C.green],["Format du document","PDF simple — Factur-X prévu Phase 6",C.orange]].map(([m,s,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span>{m}</span><span style={{color:c,fontWeight:600}}>{s}</span></div>)}
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
          <Td><Pill color={f.statut_dgfip==="transmise"?C.green:f.statut_dgfip==="a_transmettre"?C.orange:C.muted}>{f.statut_dgfip==="non_applicable"?"N/A":f.statut_dgfip==="a_transmettre"?"À transmettre":f.statut_dgfip==="transmise"?"Transmise":"—"}</Pill></Td>
          <Td><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            <BtnGhost onClick={()=>apercuPDF(f)} style={{fontSize:9,padding:"3px 6px"}}>👁 PDF</BtnGhost>
            {f.type_document==="avoir"&&<Pill color={C.purple||C.blue}>Avoir</Pill>}
            {f.type_document!=="avoir"&&f.statut!=="payée"&&f.statut!=="annulée"&&<Btn onClick={()=>envoyerPaiement(f.id)} style={{fontSize:9,padding:"3px 6px",background:C.green}}>💳 Lien paiement</Btn>}
            {f.type_document!=="avoir"&&f.statut!=="payée"&&f.statut!=="annulée"&&<BtnGhost onClick={()=>marquerPayee(f.id)} style={{fontSize:9,padding:"3px 6px"}}>✅ Marquer payée</BtnGhost>}
            {f.type_document!=="avoir"&&f.statut!=="payée"&&f.statut!=="annulée"&&<BtnGhost onClick={()=>relancer(f.id)} style={{fontSize:9,padding:"3px 6px",color:C.orange}}>🔔 Relancer</BtnGhost>}
            {f.type_document!=="avoir"&&f.statut!=="annulée"&&<BtnGhost onClick={()=>creerAvoir(f)} style={{fontSize:9,padding:"3px 6px",color:C.red}}>↩️ Avoir</BtnGhost>}
          </div></Td>
        </tr>)}</tbody>
      </table>
    </Card>}

    {/* ── CONFORMITÉ DGFIP ──────────────────── */}
    {onglet==="ereporting"&&<div>
      <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.orange,fontWeight:600,marginBottom:6}}>📤 STATUT RÉEL — TRANSMISSION DGFiP / CHORUS PRO</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>La transmission automatique à la DGFiP nécessite de passer par une plateforme accréditée (PDP) — ce n'est pas encore connecté. Les factures à des <b style={{color:C.gold}}>administrations publiques</b> sont marquées "à transmettre" ci-dessous en attendant un partenariat. Depuis le 1er septembre 2026, toutes les entreprises doivent pouvoir recevoir des factures électroniques via une plateforme agréée ; l'émission devient obligatoire pour les PME et micro-entreprises le 1er septembre 2027. Xyra prépare ce raccordement.</div>
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
          {[{titre:"Qu'est-ce que la facturation électronique ?",contenu:"Obligation légale d'émettre et recevoir les factures B2B en format structuré (pas un simple PDF). La facture doit contenir des données lisibles par machine (XML) pour transmission automatique à la DGFiP.",color:C.blue},{titre:"Quels formats sont acceptés ?",contenu:"• Factur-X : PDF enrichi + XML — recommandé car lisible humain ET machine\n• UBL (Universal Business Language) : format XML pur\n• CII (Cross Industry Invoice) : autre format XML",color:C.gold},{titre:"Qu'est-ce que Chorus Pro ?",contenu:"Portail public du gouvernement français pour l'échange de factures électroniques. Concerne uniquement les factures émises à des entités publiques (État, collectivités) — pas le B2B privé.",color:C.green},{titre:"Calendrier d'application",contenu:"• 1er sept. 2026 : toutes les entreprises doivent pouvoir RECEVOIR des factures électroniques ; les grandes entreprises et les ETI doivent aussi les ÉMETTRE\n• 1er sept. 2027 : les PME et micro-entreprises doivent les ÉMETTRE\nLa transmission passe par une plateforme agréée (PA) — Xyra prépare ce raccordement.",color:C.purple}].map((s,i)=><div key={i} style={{background:`${s.color}08`,border:`1px solid ${s.color}22`,borderRadius:8,padding:12}}>
            <div style={{fontSize:11,fontWeight:700,color:s.color,marginBottom:4}}>❓ {s.titre}</div>
            <div style={{fontSize:11,color:C.text,lineHeight:1.7,whiteSpace:"pre-line"}}>{s.contenu}</div>
          </div>)}
        </div>
      </Card>
    </div>}
  </div>;
};


// ─── PAGE FORMATION ───────────────────────────────────────────

export default PageFacturation;
