"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Sel, SM, St, conv, DEVISES } from "../lib/ui";
import { EVENEMENTS, MEMBRES_WALLET } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageWalletMembres=({plan,showToast,UpgradeWall})=>{
  const[membres,setMembres]=useState(MEMBRES_WALLET);
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[onglet,setOnglet]=useState("membres");
  const[analyseChurn,setAnalyseChurn]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[devise,setDevise]=useState("EUR");
  const[selectedMembre,setSelectedMembre]=useState(null);
  const[filtre,setFiltre]=useState("tous");

  const load=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/wallet-membres?action=membres');
      const d=await res.json();
      if(d.membres&&d.membres.length>0){
        setMembres(d.membres);
        setData(d);
      }
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const upgradeDowngrade=async(tenant_id,nouveau_plan,type)=>{
    try{
      await fetch('/api/wallet-membres',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:type,tenant_id,nouveau_plan})});
      showToast(`✅ Plan mis à jour : ${nouveau_plan}`);load();
    }catch(e){showToast("❌ Erreur");}
  };

  const changerStatut=async(tenant_id,action)=>{
    try{
      await fetch('/api/wallet-membres',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,tenant_id})});
      showToast(`✅ Statut mis à jour`);load();
    }catch(e){showToast("❌ Erreur");}
  };

  const lancerAnalyseChurn=async()=>{
    setIaLoading(true);
    try{
      const res=await fetch('/api/wallet-membres',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_churn',membres})});
      const d=await res.json();
      if(d.success)setAnalyseChurn(d.analyse);
    }catch(e){}
    setIaLoading(false);
  };

  const envoyerRapportMRR=async()=>{
    showToast("⏳ Envoi rapport MRR WhatsApp...");
    try{
      const res=await fetch('/api/wallet-membres',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rapport_mrr',mrr:data?.mrr||0,membres_actifs:membres.filter(m=>m.statut==="actif").length,essais:data?.essais||0,expirant:data?.expirant||0,taux_churn:data?.tauxChurn||0})});
      const d=await res.json();
      if(d.success)showToast("✅ Rapport MRR envoyé");
    }catch(e){showToast("❌ Erreur");}
  };

  const envoyerAlertes=async()=>{
    try{
      const res=await fetch('/api/wallet-membres',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'alertes_expiration',membres})});
      const d=await res.json();
      showToast(`✅ ${d.alertes_envoyees} alerte(s) envoyée(s)`);
    }catch(e){showToast("❌ Erreur");}
  };

  const exportCSV=()=>{
    const lignes=["Société,Plan,Prix,Statut,Pays,Email,Jours restants"];
    membres.forEach(m=>lignes.push(`${m.societe||m.nom||"—"},${m.plan||"—"},${m.plan_price||m.prix_plan||59},${m.statut||"—"},${m.pays||"—"},${m.email||"—"},${m.jours_restants||"—"}`));
    const blob=new Blob([lignes.join("\n")],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="wallets_membres_xyra.csv";a.click();
    showToast("✅ CSV téléchargé");
  };

  if(!hasAccess(plan,"wallet_membres"))return <div style={{padding:20}}><UpgradeWall page="Wallets Membres" plan={plan}/></div>;

  const membresFiltres=membres.filter(m=>{
    if(filtre==="actifs")return m.statut==="actif";
    if(filtre==="essais")return m.statut==="essai";
    if(filtre==="expirants")return m.statut==="essai"&&m.jours_restants!==null&&m.jours_restants<=3&&m.jours_restants>=0;
    if(filtre==="suspendus")return m.statut==="suspendu"||m.statut==="expiré"||m.statut==="annulé";
    return true;
  });

  const mrr=data?.mrr||membres.filter(m=>m.statut==="actif").reduce((a,m)=>a+Number(m.prix_plan||m.plan_price||59),0);
  const actifs=membres.filter(m=>m.statut==="actif").length;
  const essais=membres.filter(m=>m.statut==="essai").length;
  const expirants=membres.filter(m=>m.statut==="essai"&&m.jours_restants!==null&&m.jours_restants<=3&&m.jours_restants>=0).length;

  const tabs=[
    {id:"membres",label:"👥 Membres"},
    {id:"mrr",label:"📊 MRR & Métriques"},
    {id:"churn",label:"🤖 Analyse Churn IA"},
    {id:"historique",label:"📋 Historique"},
  ];

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◈ Wallets Membres</div>
        <div style={{fontSize:11,color:C.muted}}>Soldes · Abonnements · MRR · Churn · Upgrade/Downgrade · Alertes expiration</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={envoyerRapportMRR} style={{fontSize:11}}>📱 Rapport MRR</BtnGhost>
        <BtnGhost onClick={envoyerAlertes} style={{fontSize:11,color:C.orange,borderColor:`${C.orange}44`}}>🔔 Alertes expiration</BtnGhost>
        <BtnGhost onClick={exportCSV} style={{fontSize:11}}>📋 CSV</BtnGhost>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
      </div>
    </div>

    {/* ALERTES EXPIRATION */}
    {expirants>0&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.orange,marginBottom:4}}>⏰ {expirants} essai(s) expire(nt) dans moins de 3 jours</div>
      <div style={{fontSize:11,color:C.text}}>{membres.filter(m=>m.statut==="essai"&&m.jours_restants!==null&&m.jours_restants<=3&&m.jours_restants>=0).map(m=>m.societe||m.nom).join(", ")} — contactez-les maintenant pour convertir.</div>
    </div>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      <CT style={{borderColor:`${C.green}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>MRR</div><div style={{fontSize:20,fontWeight:700,color:C.green}}>{fmt(conv(mrr,"EUR",devise),devise)}</div><div style={{fontSize:9,color:C.muted}}>Revenus récurrents</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>MEMBRES ACTIFS</div><div style={{fontSize:20,fontWeight:700,color:C.blue}}>{actifs}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>EN ESSAI</div><div style={{fontSize:20,fontWeight:700,color:C.gold}}>{essais}</div></CT>
      <CT style={{borderColor:`${C.orange}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>EXPIRENT BIENTÔT</div><div style={{fontSize:20,fontWeight:700,color:expirants>0?C.orange:C.green}}>{expirants}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>TAUX CHURN</div><div style={{fontSize:20,fontWeight:700,color:(data?.tauxChurn||0)>5?C.red:C.green}}>{data?.tauxChurn||0}%</div></CT>
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── MEMBRES ── */}
    {onglet==="membres"&&<div>
      {/* Filtres */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {[["tous","Tous",""],["actifs","Actifs",C.green],["essais","En essai",C.gold],["expirants","Expirent bientôt",C.orange],["suspendus","Suspendus",C.red]].map(([f,l,c])=><button key={f} onClick={()=>setFiltre(f)} style={{background:filtre===f?`${c||C.blue}22`:"transparent",border:`1px solid ${filtre===f?c||C.blue:C.border}`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit",color:filtre===f?c||C.blue:C.muted}}>{l}</button>)}
      </div>

      {/* Membres existants (MEMBRES_WALLET) en grille */}
      {membres.length===0||!data?<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12,marginBottom:14}}>
          {MEMBRES_WALLET.map((m,i)=><Card key={i} style={{borderColor:`${C.gold}22`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`${C.gold}22`,border:`1px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.gold}}>{inits(m.nom)}</div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:C.text}}>{m.nom}</div><div style={{fontSize:10,color:C.muted}}>{m.banque} · {m.pays}</div></div>
              <St s={m.statut}/>
            </div>
            <div style={{background:C.card2,borderRadius:8,padding:10,marginBottom:10}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:3}}>SOLDE WALLET</div>
              <div style={{fontSize:20,fontWeight:700,color:C.gold}}>{fmt(conv(m.solde,"EUR",devise),devise)}</div>
              <div style={{fontSize:9,color:C.muted,fontFamily:"'Courier New',monospace",marginTop:4}}>{m.iban}</div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:8}}>
              <span style={{color:C.muted}}>Plan : <b style={{color:m.type==="Enterprise"?C.purple:m.type==="Business Pro"?C.gold:C.blue}}>{m.type}</b></span>
              <span style={{color:C.muted}}>Tx : <b style={{color:C.text}}>{m.transactions}</b></span>
            </div>
            <Btn onClick={()=>showToast(`💳 Carte virtuelle ${m.nom} créée !`)} style={{width:"100%",fontSize:11,background:m.carte?C.green+"22":"transparent",color:m.carte?C.green:C.muted,border:`1px solid ${m.carte?C.green:C.border}44`}}>{m.carte?"💳 Carte active":"+ Créer carte"}</Btn>
          </Card>)}
        </div>
      </div>:null}

      {/* Membres Supabase réels */}
      {data&&membresFiltres.length>0&&<div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
          <thead><tr><TH>Société</TH><TH>Plan</TH><TH>Prix/mois</TH><TH>Statut</TH><TH>Pays</TH><TH>Essai</TH><TH>Actions</TH></tr></thead>
          <tbody>{membresFiltres.map((m,i)=>{
            const joursLeft=m.jours_restants;
            return <tr key={i} style={{background:joursLeft!==null&&joursLeft<=3&&joursLeft>=0?`${C.orange}08`:"transparent"}}>
              <Td>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.gold}}>{inits(m.societe||m.nom||"?")}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700}}>{m.societe||m.nom||"—"}</div>
                    <div style={{fontSize:10,color:C.muted}}>{m.email||"—"}</div>
                  </div>
                </div>
              </Td>
              <Td><Pill color={m.plan==="enterprise"?C.purple:m.plan?.includes("multi")||m.plan==="holding"?C.blue:C.gold}>{m.plan||"starter"}</Pill></Td>
              <Td style={{fontWeight:700,color:C.green}}>{fmt(m.prix_plan||m.plan_price||59)}</Td>
              <Td><St s={m.statut}/></Td>
              <Td style={{fontSize:11,color:C.muted}}>{m.pays||"—"}</Td>
              <Td>
                {joursLeft!==null?<div style={{fontSize:11,color:joursLeft<=3?C.orange:C.muted,fontWeight:joursLeft<=3?700:400}}>
                  {joursLeft<=0?"⚠️ Expiré":joursLeft<=3?`⏰ J-${joursLeft}`:`${joursLeft}j`}
                </div>:<span style={{color:C.muted,fontSize:10}}>—</span>}
              </Td>
              <Td>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  <BtnGhost onClick={()=>upgradeDowngrade(m.id,"enterprise","upgrade")} style={{fontSize:9,padding:"3px 6px",color:C.purple}}>↑ Upgrade</BtnGhost>
                  <BtnGhost onClick={()=>changerStatut(m.id,m.statut==="actif"?"suspendre":"reactiver")} style={{fontSize:9,padding:"3px 6px",color:m.statut==="actif"?C.orange:C.green}}>{m.statut==="actif"?"Suspendre":"Réactiver"}</BtnGhost>
                  <BtnGhost onClick={()=>showToast("💬 Email envoyé")} style={{fontSize:9,padding:"3px 6px"}}>✉</BtnGhost>
                </div>
              </Td>
            </tr>;
          })}</tbody>
        </table>
        {membresFiltres.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucun membre dans ce filtre.</div>}
      </div>}
    </div>}

    {/* ── MRR & MÉTRIQUES ── */}
    {onglet==="mrr"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Revenus récurrents</STitle>
          {[["MRR (membres actifs)",fmt(conv(mrr,"EUR",devise),devise),C.green],["ARR (MRR × 12)",fmt(conv(mrr*12,"EUR",devise),devise),C.teal],["Revenu moyen par membre",fmt(conv(actifs>0?mrr/actifs:0,"EUR",devise),devise),C.gold],["MRR potentiel (si essais convertis)",fmt(conv(mrr+essais*59,"EUR",devise),devise),C.blue]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
            <span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span>
          </div>)}
        </Card>
        <Card>
          <STitle>👥 Répartition membres</STitle>
          {[["Actifs",actifs,C.green],["En essai",essais,C.gold],["Expirent bientôt",expirants,C.orange],["Taux de churn",`${data?.tauxChurn||0}%`,data?.tauxChurn>5?C.red:C.green]].map(([l,v,c],i)=><div key={i} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>
            {typeof v==="number"&&<SM val={v} max={membres.length||1} color={c}/>}
          </div>)}
        </Card>
      </div>
      <Card>
        <STitle>💡 Répartition par plan</STitle>
        {["starter","business","business_pro","enterprise","multi_societes","multi_pro","holding"].map(p=>{
          const count=membres.filter(m=>m.plan===p).length;
          if(count===0)return null;
          const prix=({starter:59,business:129,business_pro:129,enterprise:249,multi_societes:499,multi_pro:799,holding:1200})[p]||59;
          const colors={starter:C.blue,business:C.gold,business_pro:C.gold,enterprise:C.purple,multi_societes:C.teal,multi_pro:C.orange,holding:C.gold};
          return <div key={p} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
              <span style={{fontWeight:600,color:colors[p]||C.gold}}>{p.replace("_"," ").toUpperCase()}</span>
              <span style={{color:C.muted}}>{count} membres · {fmt(count*prix)}/mois</span>
            </div>
            <SM val={count} max={membres.length||1} color={colors[p]||C.gold}/>
          </div>;
        })}
      </Card>
    </div>}

    {/* ── ANALYSE CHURN IA ── */}
    {onglet==="churn"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse prédictive Churn — Claude Sonnet</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseChurn||"Lance l'analyse pour identifier les membres à risque de churn et obtenir des recommandations concrètes."}</div>}
        <BtnGhost onClick={lancerAnalyseChurn} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🤖 Analyser le risque de churn"}</BtnGhost>
      </div>
      <Card>
        <STitle>⏰ Membres en essai expirant bientôt</STitle>
        {membres.filter(m=>m.statut==="essai"&&m.jours_restants!==null&&m.jours_restants<=7).length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun essai n'expire dans les 7 prochains jours.</div>:
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Société</TH><TH>Plan</TH><TH>Jours restants</TH><TH>Action</TH></tr></thead>
          <tbody>{membres.filter(m=>m.statut==="essai"&&m.jours_restants!==null&&m.jours_restants<=7).sort((a,b)=>Number(a.jours_restants)-Number(b.jours_restants)).map((m,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{m.societe||m.nom||"—"}</Td>
            <Td><Pill color={C.gold}>{m.plan||"starter"}</Pill></Td>
            <Td><span style={{color:Number(m.jours_restants)<=3?C.red:C.orange,fontWeight:700}}>{Number(m.jours_restants)<=0?"Expiré":`J-${m.jours_restants}`}</span></Td>
            <Td><div style={{display:"flex",gap:6}}>
              <Btn onClick={()=>showToast("✉ Email de relance envoyé")} style={{fontSize:10,padding:"4px 8px"}}>✉ Relancer</Btn>
              <BtnGhost onClick={()=>showToast("📞 Appel planifié")} style={{fontSize:10}}>📞</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>}
      </Card>
    </div>}

    {/* ── HISTORIQUE ── */}
    {onglet==="historique"&&<Card>
      <STitle>📋 Historique inscriptions</STitle>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
          <thead><tr><TH>Date</TH><TH>Société</TH><TH>Plan</TH><TH>Prix</TH><TH>Pays</TH><TH>Statut</TH></tr></thead>
          <tbody>{membres.slice(0,30).map((m,i)=><tr key={i}>
            <Td style={{fontSize:10,color:C.muted}}>{m.created_at?new Date(m.created_at).toLocaleDateString("fr"):"—"}</Td>
            <Td style={{fontWeight:600}}>{m.societe||m.nom||"—"}</Td>
            <Td><Pill color={C.gold}>{m.plan||"starter"}</Pill></Td>
            <Td style={{color:C.green,fontWeight:700}}>{fmt(m.prix_plan||m.plan_price||59)}</Td>
            <Td style={{color:C.muted}}>{m.pays||"—"}</Td>
            <Td><St s={m.statut||"actif"}/></Td>
          </tr>)}</tbody>
        </table>
      </div>
    </Card>}
  </div>;
};


// ─── PAGE EVENEMENTS ──────────────────────────────────────────

export default PageWalletMembres;
