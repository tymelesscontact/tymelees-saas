"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp } from "../lib/ui";
import { FORMATION } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageFacturation=({plan,showToast,UpgradeWall,activeCompany})=>{
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
  useEffect(()=>{loadFactures();},[activeCompany]);

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

export default PageFacturation;
