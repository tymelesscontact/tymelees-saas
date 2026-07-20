"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, BtnGhost, STitle, Sel, SM, DEVISES } from "../lib/ui";
import { CLIENTS } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageAnalytique=({plan,showToast,UpgradeWall,activeCompany})=>{
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[devise,setDevise]=useState("EUR");
  const[onglet,setOnglet]=useState("overview");
  const[analyseIA,setAnalyseIA]=useState("");
  const[iaLoading,setIaLoading]=useState(false);

  const tabs=[
    {id:"overview",label:"📊 Vue globale"},
    {id:"evolution",label:"📈 Évolution CA"},
    {id:"sources",label:"🎯 Par source"},
    {id:"clients",label:"👤 Par client"},
    {id:"rentabilite",label:"💰 Rentabilité"},
    {id:"previsions",label:"🤖 Prévisions"},
    {id:"export",label:"📤 Export"},
  ];

  const load=async()=>{
    setLoading(true);
    try{
      const companyParam=activeCompany?.id?`&company_id=${activeCompany.id}`:'';
      const res=await fetch(`/api/analytique?devise=${devise}`+companyParam);
      const d=await res.json();
      setData(d);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[devise,activeCompany]);

  useEffect(()=>{
    if(data&&!analyseIA){
      fetch('/api/analytique',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',...data})})
        .then(r=>r.json()).then(d=>{if(d.success)setAnalyseIA(d.analyse);}).catch(()=>{});
    }
  },[data]);

  const envoyerRapport=async()=>{
    showToast("⏳ Envoi du rapport WhatsApp...");
    try{
      const res=await fetch('/api/analytique',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rapport_mensuel_whatsapp',...data})});
      const d=await res.json();
      if(d.success)showToast("✅ Rapport mensuel envoyé");
      else showToast("❌ "+(d.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const exportCSV=()=>{
    if(!data)return;
    const lignes=["Mois,CA"];
    Object.entries(data.caParMois||{}).forEach(([m,v])=>lignes.push(`${m},${v}`));
    const blob=new Blob([lignes.join("\n")],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="analytique_ca_xyra.csv";a.click();
    showToast("✅ CSV téléchargé");
  };

  if(!hasAccess(plan,"analytique"))return <div style={{padding:20}}><UpgradeWall page="analytique" plan={plan}/></div>;
  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement des données réelles...</div></div>;

  const caParMoisEntries=Object.entries(data?.caParMois||{});
  const maxCA=Math.max(...caParMoisEntries.map(([,v])=>Number(v)),1);
  const sourceEntries=Object.entries(data?.caParSource||{}).sort((a,b)=>Number(b[1])-Number(a[1]));
  const totalSources=sourceEntries.reduce((a,[,v])=>a+Number(v),0);
  const COLORS=[C.gold,C.blue,C.green,C.purple,C.orange,C.teal,C.pink];

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>📊 Analytique & CA</div>
        <div style={{fontSize:11,color:C.muted}}>CA réel · Évolution · Sources · Clients · Rentabilité · Prévisions IA</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={envoyerRapport} style={{fontSize:11}}>📱 Rapport WhatsApp</BtnGhost>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
      </div>
    </div>

    {/* ALERTE DÉPENDANCE */}
    {(data?.alerteDependance||[]).length>0&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,marginBottom:14}}>
      <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:4}}>⚠️ Alerte dépendance client</div>
      <div style={{fontSize:11,color:C.text}}>{data.alerteDependance.map((c)=>c.nom).join(", ")} représente plus de 30% de ton CA. Diversifie ta base clients pour réduire ce risque.</div>
    </div>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CA TOTAL</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(data?.caTotal||0)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CA CE MOIS</div>
        <div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(data?.caMoisActuel||0)}</div>
        <div style={{fontSize:10,color:(data?.evolutionMois||0)>=0?C.green:C.red}}>{(data?.evolutionMois||0)>=0?"↗":""}{data?.evolutionMois||0}% vs mois préc.</div>
      </CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>VS N-1</div>
        <div style={{fontSize:18,fontWeight:700,color:(data?.evolutionNMoins1||0)>=0?C.teal:C.orange}}>{(data?.evolutionNMoins1||0)>=0?"↗":""}{data?.evolutionNMoins1||0}%</div>
      </CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>MARGE NETTE</div>
        <div style={{fontSize:18,fontWeight:700,color:(data?.tauxMarge||0)>=20?C.green:(data?.tauxMarge||0)>=10?C.gold:C.red}}>{data?.tauxMarge||0}%</div>
      </CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>TRANSACTIONS</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>{data?.nbTransactions||0}</div></CT>
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── VUE GLOBALE ── */}
    {onglet==="overview"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse IA — Claude · données réelles</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseIA||"Chargement de l'analyse..."}</div>}
        <BtnGhost onClick={()=>{setIaLoading(true);fetch('/api/analytique',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',...data})}).then(r=>r.json()).then(d=>{if(d.success)setAnalyseIA(d.analyse);setIaLoading(false);}).catch(()=>setIaLoading(false));}} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🔄 Régénérer"}</BtnGhost>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>💰 Résultat financier</STitle>
          {[["CA total",data?.caTotal||0,C.green],["Charges fixes",data?.chargesTotales||0,C.red],["Coût équipe",data?.coutEquipe||0,C.orange],["Marge nette",data?.margeNette||0,data?.margeNette>=0?C.teal:C.red]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
            <span style={{color:C.muted}}>{l}</span>
            <span style={{color:c,fontWeight:700}}>{fmt(Number(v))}</span>
          </div>)}
        </Card>
        <Card>
          <STitle>📊 Comparaisons</STitle>
          {[["Mois actuel",data?.caMoisActuel||0,C.blue],["Mois précédent",data?.caMoisPrecedent||0,C.muted],["Même mois N-1",data?.caNMoins1||0,C.purple]].map(([l,v,c],i)=><div key={i} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{fmt(Number(v))}</span></div>
            <SM val={Number(v)} max={Math.max(data?.caMoisActuel||0,data?.caMoisPrecedent||0,data?.caNMoins1||0,1)} color={c}/>
          </div>)}
        </Card>
      </div>
    </div>}

    {/* ── ÉVOLUTION CA ── */}
    {onglet==="evolution"&&<Card>
      <STitle>📈 Évolution CA — 12 derniers mois</STitle>
      {caParMoisEntries.every(([,v])=>Number(v)===0)&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Pas encore assez de transactions pour afficher l'évolution.</div>}
      <div style={{display:"flex",alignItems:"flex-end",gap:6,height:160,padding:"10px 0",marginBottom:12}}>
        {caParMoisEntries.map(([mois,ca],i)=>{
          const h=Math.max(4,Math.round((Number(ca)/maxCA)*140));
          const isCurrent=mois===`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
          return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            {Number(ca)>0&&<div style={{fontSize:8,color:C.muted}}>{fmt(Number(ca))}</div>}
            <div style={{width:"100%",height:h,background:isCurrent?C.gold:`${C.blue}88`,borderRadius:"4px 4px 0 0",minHeight:4}}/>
            <div style={{fontSize:8,color:isCurrent?C.gold:C.muted,fontWeight:isCurrent?700:400}}>{mois.slice(5)}/{mois.slice(2,4)}</div>
          </div>;
        })}
      </div>
      <div style={{display:"flex",gap:16,justifyContent:"center",fontSize:10,color:C.muted}}>
        <span>🟡 Mois actuel</span><span style={{background:`${C.blue}33`,padding:"2px 8px",borderRadius:4}}>🔵 Historique</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:16}}>
        {[["Meilleur mois",Math.max(...caParMoisEntries.map(([,v])=>Number(v)))],["Moyenne mensuelle",Math.round(caParMoisEntries.reduce((a,[,v])=>a+Number(v),0)/Math.max(1,caParMoisEntries.filter(([,v])=>Number(v)>0).length))],["Total 12 mois",caParMoisEntries.reduce((a,[,v])=>a+Number(v),0)]].map(([l,v],i)=><CT key={i}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>{l}</div><div style={{fontSize:14,fontWeight:700,color:C.gold}}>{fmt(Number(v))}</div></CT>)}
      </div>
    </Card>}

    {/* ── PAR SOURCE ── */}
    {onglet==="sources"&&<div>
      <Card style={{marginBottom:12}}>
        <STitle>🎯 CA par source de revenus</STitle>
        {sourceEntries.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Pas encore de données par source. Les sources apparaîtront au fil des transactions.</div>}
        {sourceEntries.map(([source,montant],i)=>{
          const pct=totalSources>0?Math.round(Number(montant)/totalSources*100):0;
          return <div key={i} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <span style={{fontWeight:600}}>{source}</span>
              <span style={{color:COLORS[i%COLORS.length],fontWeight:700}}>{fmt(Number(montant))} · {pct}%</span>
            </div>
            <SM val={pct} max={100} color={COLORS[i%COLORS.length]}/>
          </div>;
        })}
      </Card>
      {sourceEntries.length>0&&<div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:12,fontSize:12,color:C.text,lineHeight:1.7}}>
        🤖 Source principale : <b style={{color:C.gold}}>{sourceEntries[0]?.[0]||"—"}</b> ({Math.round(Number(sourceEntries[0]?.[1]||0)/totalSources*100)}% du CA). {sourceEntries.length<3?"Diversifie tes sources de revenus pour réduire les risques.":"Bonne diversification des sources de revenus."}
      </div>}
    </div>}

    {/* ── PAR CLIENT ── */}
    {onglet==="clients"&&<div>
      {(data?.alerteDependance||[]).length>0&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,marginBottom:12,fontSize:11,color:C.text}}>
        ⚠️ <b>{data.alerteDependance.map((c)=>c.nom).join(", ")}</b> représente plus de 30% de ton CA. Risque élevé si ce client part. Développe d'autres comptes.
      </div>}
      <Card>
        <STitle>👤 Top clients par CA généré</STitle>
        {(data?.topClients||[]).length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucune donnée client disponible pour le moment.</div>}
        {(data?.topClients||[]).map((c,i)=><div key={i} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,alignItems:"center"}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:COLORS[i%COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#000"}}>{i+1}</div>
              <span style={{fontWeight:600}}>{c.nom}</span>
            </div>
            <div style={{textAlign:"right"}}>
              <span style={{color:c.pct>=30?C.orange:C.gold,fontWeight:700}}>{fmt(c.ca)}</span>
              <span style={{fontSize:10,color:c.pct>=30?C.orange:C.muted,marginLeft:8}}>{c.pct}%{c.pct>=30?" ⚠️":""}</span>
            </div>
          </div>
          <SM val={c.pct} max={100} color={c.pct>=30?C.orange:COLORS[i%COLORS.length]}/>
        </div>)}
      </Card>
    </div>}

    {/* ── RENTABILITÉ ── */}
    {onglet==="rentabilite"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>💰 Compte de résultat simplifié</STitle>
          {[["Chiffre d'affaires",data?.caTotal||0,C.green,false],["Charges fixes",-(data?.chargesTotales||0),C.red,false],["Coût équipe (charges incluses)",-(data?.coutEquipe||0),C.orange,false],["Marge nette",data?.margeNette||0,(data?.margeNette||0)>=0?C.teal:C.red,true]].map(([l,v,c,bold],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12,fontWeight:bold?"700":"400"}}>
            <span style={{color:bold?C.text:C.muted}}>{l}</span>
            <span style={{color:c}}>{Number(v)>=0?"+":""}{fmt(Math.abs(Number(v)))}</span>
          </div>)}
          <div style={{marginTop:12}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Taux de marge</div>
            <SM val={Math.max(0,data?.tauxMarge||0)} max={100} color={(data?.tauxMarge||0)>=20?C.green:(data?.tauxMarge||0)>=10?C.gold:C.red}/>
            <div style={{fontSize:11,color:(data?.tauxMarge||0)>=20?C.green:(data?.tauxMarge||0)>=10?C.gold:C.red,marginTop:4,fontWeight:700}}>{data?.tauxMarge||0}% de marge nette</div>
          </div>
        </Card>
        <Card>
          <STitle>📊 Analyse de rentabilité</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[{label:"Taux de marge",val:(data?.tauxMarge||0)+"%",ok:(data?.tauxMarge||0)>=20,msg:(data?.tauxMarge||0)>=20?"✅ Excellente marge":(data?.tauxMarge||0)>=10?"⚠️ Marge correcte":"❌ Marge insuffisante"},
              {label:"Part équipe / CA",val:data?.caTotal>0?Math.round((data?.coutEquipe||0)/data.caTotal*100)+"%":"—",ok:data?.caTotal>0&&(data?.coutEquipe||0)/data.caTotal<0.4,msg:data?.caTotal>0&&(data?.coutEquipe||0)/data.caTotal<0.4?"✅ Équipe rentable":"⚠️ Coût équipe élevé"},
              {label:"Part charges / CA",val:data?.caTotal>0?Math.round((data?.chargesTotales||0)/data.caTotal*100)+"%":"—",ok:data?.caTotal>0&&(data?.chargesTotales||0)/data.caTotal<0.3,msg:data?.caTotal>0&&(data?.chargesTotales||0)/data.caTotal<0.3?"✅ Charges maîtrisées":"⚠️ Charges à optimiser"},
            ].map((item,i)=><div key={i} style={{background:item.ok?`${C.green}08`:`${C.orange}08`,border:`1px solid ${item.ok?C.green:C.orange}22`,borderRadius:8,padding:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:C.muted}}>{item.label}</span><span style={{fontWeight:700,color:item.ok?C.green:C.orange}}>{item.val}</span></div>
              <div style={{fontSize:11,color:item.ok?C.green:C.orange}}>{item.msg}</div>
            </div>)}
          </div>
        </Card>
      </div>
    </div>}

    {/* ── PRÉVISIONS ── */}
    {onglet==="previsions"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
        {[["🟢 Optimiste",data?.prevision?.optimiste||0,C.green,"Tendance haute +20%"],["🔵 Réaliste",data?.prevision?.realiste||0,C.blue,"Basé sur ta tendance actuelle"],["🔴 Pessimiste",data?.prevision?.pessimiste||0,C.red,"Tendance basse -20%"]].map(([l,v,c,desc],i)=><Card key={i} style={{borderColor:`${c}44`,textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:700,color:c,marginBottom:4}}>{l}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{desc}</div>
          <div style={{fontSize:28,fontWeight:700,color:c,marginBottom:4}}>{fmt(Number(v))}</div>
          <div style={{fontSize:11,color:C.muted}}>CA estimé à 90 jours</div>
        </Card>)}
      </div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:14,fontSize:12,color:C.text,lineHeight:1.7}}>
        🤖 Prévisions basées sur ta tendance réelle des 3 derniers mois. Pour améliorer la précision, assure-toi que toutes tes factures payées sont bien enregistrées dans Xyra.
      </div>
    </div>}

    {/* ── EXPORT ── */}
    {onglet==="export"&&<Card>
      <STitle>📤 Exports analytique</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[{icon:"📋",label:"CSV CA mensuel",desc:"Évolution sur 12 mois",action:exportCSV},{icon:"📱",label:"Rapport WhatsApp",desc:"Résumé mensuel automatique",action:envoyerRapport},{icon:"🔄",label:"Actualiser",desc:"Recharger les données",action:load}].map((item,i)=><CT key={i} style={{cursor:"pointer"}} onClick={item.action}>
          <div style={{fontSize:20,marginBottom:6}}>{item.icon}</div>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>{item.label}</div>
          <div style={{fontSize:9,color:C.muted}}>{item.desc}</div>
        </CT>)}
      </div>
    </Card>}
  </div>;
};


// ─── PAGE CLIENTS ─────────────────────────────────────────────

export default PageAnalytique;
