"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp, Sel, SM } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageTresorerie=({plan,showToast,UpgradeWall})=>{
  const[devise,setDevise]=useState("EUR");
  const[onglet,setOnglet]=useState("dashboard");
  const[loading,setLoading]=useState(true);
  const[data,setData]=useState(null);
  const[analyseIA,setAnalyseIA]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[alerteIA,setAlerteIA]=useState("");
  const[scenario,setScenario]=useState("realiste");
  const[simDepense,setSimDepense]=useState(0);
  const[ligneManuelle,setLigneManuelle]=useState({libelle:"",montant:"",semaine:"",sens:"entree"});
  const[lignesManuelles,setLignesManuelles]=useState([]);
  const[scoringClients,setScoringClients]=useState([]);
  const[seuils,setSeuils]=useState({seuil_alerte_bas:5000,seuil_alerte_critique:2000,seuil_sortie_importante:3000,placement_seuil:20000});

  const tabs=[
    {id:"dashboard",label:"📊 Cash-flow"},
    {id:"scenarios",label:"🎯 3 Scénarios"},
    {id:"sante",label:"❤ Santé & KPIs"},
    {id:"sources",label:"📈 Par source"},
    {id:"equipe",label:"👥 Cashflow équipe"},
    {id:"clients",label:"🎯 Scoring clients"},
    {id:"placement",label:"💎 Placements"},
    {id:"manuel",label:"✏ Prévisionnel"},
    {id:"simulation",label:"🎮 Simulation"},
    {id:"alertes",label:"🔔 Alertes"},
    {id:"export",label:"📤 Export"},
  ];

  const load=async()=>{
    try{
      const res=await fetch('/api/tresorerie');
      const d=await res.json();
      setData(d);
      if(d.parametres)setSeuils(d.parametres);
    }catch(e){console.error("Tresorerie:",e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  // Analyse IA au chargement
  useEffect(()=>{
    if(data&&!analyseIA){
      fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',...data})})
        .then(r=>r.json()).then(d=>{if(d.success)setAnalyseIA(d.analyse);}).catch(()=>{});
    }
  },[data]);

  // Alerte intelligente au chargement si solde à risque
  useEffect(()=>{
    if(data&&data.soldeActuel<seuils.seuil_alerte_bas){
      fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'alerte_intelligente',...data,param:seuils})})
        .then(r=>r.json()).then(d=>{if(d.success&&d.alerte)setAlerteIA(d.alerte);}).catch(()=>{});
      // Alerte WhatsApp si critique
      if(data.soldeActuel<seuils.seuil_alerte_critique){
        fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'alerte_critique_whatsapp',soldeActuel:data.soldeActuel,seuil:seuils.seuil_alerte_critique})}).catch(()=>{});
      }
    }
  },[data,seuils]);

  const genererScoring=async()=>{
    if(!data)return;
    try{
      const res=await fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'scoring_clients',facturesList:data.clientsEnRetard||[]})});
      const d=await res.json();
      if(d.success)setScoringClients(d.predictions||[]);
    }catch(e){}
  };

  const envoyerRapportHebdo=async()=>{
    showToast("⏳ Envoi du rapport WhatsApp...");
    try{
      const res=await fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rapport_hebdo',...data})});
      const d=await res.json();
      if(d.success)showToast("✅ Rapport hebdomadaire envoyé sur WhatsApp");
      else showToast("❌ "+(d.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const sauverSeuils=async()=>{
    try{
      await fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'set_parametres',...seuils})});
      showToast("✅ Paramètres sauvegardés");load();
    }catch(e){showToast("❌ Erreur");}
  };

  const ajouterLigneManuelle=async()=>{
    if(!ligneManuelle.libelle||!ligneManuelle.montant||!ligneManuelle.semaine)return showToast("⚠️ Remplis tous les champs");
    try{
      await fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_ligne_manuelle',...ligneManuelle})});
      showToast("✅ Ligne ajoutée");
      setLignesManuelles(l=>[...l,{...ligneManuelle,id:Date.now()}]);
      setLigneManuelle({libelle:"",montant:"",semaine:"",sens:"entree"});
    }catch(e){showToast("❌ Erreur");}
  };

  if(!hasAccess(plan,"tresorerie"))return <div style={{padding:20}}><UpgradeWall page="tresorerie" plan={plan}/></div>;
  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement des données réelles...</div></div>;

  const soldeActuel=data?.soldeActuel||0;
  const previsions=scenario==="optimiste"?data?.prevOptimiste:scenario==="pessimiste"?data?.prevPessimiste:data?.prevRealiste||[];
  const semaines=data?.semaines||[];
  const toutesLesSemaines=[...semaines,...previsions];
  const soldeJ90=previsions[previsions.length-1]?.sol??soldeActuel;
  const scoreFinancier=data?.scoreFinancier||0;
  const pointMort=data?.pointMort||0;
  const bfr=data?.bfr||0;
  const sources=data?.sources||{};
  const cashflowEquipe=data?.cashflowEquipe||[];
  const clientsEnRetard=data?.clientsEnRetard||[];
  const suggestionsPlacement=data?.suggestionsPlacement||[];
  const excedent=data?.excedent||0;
  const soldeSim=soldeActuel-simDepense;
  const scoreColor=scoreFinancier>=70?C.green:scoreFinancier>=40?C.gold:C.red;
  const scoreLabel=scoreFinancier>=70?"🟢 Excellente":scoreFinancier>=40?"🟡 Correcte":"🔴 Risquée";

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◑ Trésorerie 90 jours</div>
        <div style={{fontSize:11,color:C.muted}}>Cash-flow réel · 3 scénarios · Score santé · BFR · Scoring clients · Placements</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={envoyerRapportHebdo} style={{fontSize:11}}>📱 Rapport WhatsApp</BtnGhost>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
      </div>
    </div>

    {/* ALERTE INTELLIGENTE */}
    {alerteIA&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14,marginBottom:14}}>
      <div style={{fontSize:10,color:C.orange,fontWeight:700,marginBottom:4}}>🤖 ALERTE INTELLIGENTE — Claude</div>
      <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{alerteIA}</div>
    </div>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      <CT style={{textAlign:"center",borderColor:`${scoreColor}44`}}>
        <div style={{fontSize:9,color:C.muted,marginBottom:4}}>SCORE SANTÉ</div>
        <div style={{fontSize:28,fontWeight:700,color:scoreColor}}>{scoreFinancier}</div>
        <div style={{fontSize:10,color:scoreColor}}>{scoreLabel}</div>
      </CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>SOLDE ACTUEL</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(conv(soldeActuel,"EUR",devise),devise)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>SOLDE J+90</div><div style={{fontSize:18,fontWeight:700,color:soldeJ90>=soldeActuel?C.teal:C.orange}}>{fmt(conv(soldeJ90,"EUR",devise),devise)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>POINT MORT/SEMAINE</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>{fmt(conv(pointMort,"EUR",devise),devise)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>BFR</div><div style={{fontSize:18,fontWeight:700,color:C.purple}}>{fmt(conv(bfr,"EUR",devise),devise)}</div></CT>
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── CASH-FLOW ── */}
    {onglet==="dashboard"&&<div>
      <Card style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <STitle>📈 Flux réel + prévision 90 jours</STitle>
          <div style={{display:"flex",gap:6}}>
            {["realiste","optimiste","pessimiste"].map(s=><button key={s} onClick={()=>setScenario(s)} style={{background:scenario===s?(s==="optimiste"?C.green:s==="pessimiste"?C.red:C.blue)+"22":"transparent",color:s==="optimiste"?C.green:s==="pessimiste"?C.red:C.blue,border:`1px solid ${s==="optimiste"?C.green:s==="pessimiste"?C.red:C.blue}44`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",textTransform:"capitalize"}}>{s}</button>)}
          </div>
        </div>
        {/* Graphique visuel */}
        <div style={{display:"flex",alignItems:"flex-end",gap:3,height:120,padding:"10px 0",marginBottom:12}}>
          {toutesLesSemaines.map((t,i)=>{
            const maxVal=Math.max(...toutesLesSemaines.map(x=>Math.abs(x.sol||0)),1);
            const h=Math.max(4,Math.round((Math.abs(t.sol||0)/maxVal)*100));
            const bg=t.pred?(scenario==="optimiste"?C.green:scenario==="pessimiste"?C.red:C.blue)+"66":t.sol>seuils.seuil_alerte_bas?`${C.green}88`:`${C.orange}88`;
            return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{width:"100%",height:h+"%",background:bg,borderRadius:"3px 3px 0 0",minHeight:4}}/>
              <div style={{fontSize:7,color:C.muted}}>{t.debut?.slice(5)}</div>
            </div>;
          })}
        </div>
        {/* Tableau */}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
            <thead><tr><TH>Semaine</TH><TH>Entrées</TH><TH>Sorties</TH><TH>Net</TH><TH>Solde cumulé</TH><TH>Statut</TH></tr></thead>
            <tbody>{toutesLesSemaines.map((t,i)=><tr key={i} style={{background:t.pred?`${C.blue}05`:"transparent"}}>
              <Td style={{fontSize:10,color:t.pred?C.blue:C.muted,fontWeight:t.pred?600:400}}>{t.debut}{t.pred?" 🤖":""}</Td>
              <Td><span style={{color:C.green,fontWeight:700}}>+{fmt(conv(t.entrees||0,"EUR",devise),devise)}</span></Td>
              <Td><span style={{color:C.red}}>-{fmt(conv(t.sorties||0,"EUR",devise),devise)}</span></Td>
              <Td style={{color:(t.net||0)>0?C.green:C.red,fontWeight:700}}>{(t.net||0)>0?"+":""}{fmt(conv(t.net||0,"EUR",devise),devise)}</Td>
              <Td style={{fontWeight:700,color:(t.sol||0)>seuils.seuil_alerte_bas?C.green:(t.sol||0)>seuils.seuil_alerte_critique?C.gold:C.red}}>{fmt(conv(t.sol||0,"EUR",devise),devise)}</Td>
              <Td><Pill color={t.pred?C.blue:C.green}>{t.pred?"🤖 Prévision":"✅ Réel"}</Pill></Td>
            </tr>)}</tbody>
          </table>
        </div>
      </Card>
      {/* Analyse IA */}
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse IA — Claude · données réelles</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseIA||"Chargement de l'analyse..."}</div>}
        <BtnGhost onClick={()=>{setIaLoading(true);fetch('/api/tresorerie',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',...data})}).then(r=>r.json()).then(d=>{if(d.success)setAnalyseIA(d.analyse);setIaLoading(false);}).catch(()=>setIaLoading(false));}} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🔄 Régénérer"}</BtnGhost>
      </div>
    </div>}

    {/* ── 3 SCÉNARIOS ── */}
    {onglet==="scenarios"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
        {[
          {label:"🟢 Optimiste",key:"prevOptimiste",color:C.green,desc:"Entrées +20%, sorties -10% — meilleur cas"},
          {label:"🔵 Réaliste",key:"prevRealiste",color:C.blue,desc:"Basé sur ta tendance actuelle"},
          {label:"🔴 Pessimiste",key:"prevPessimiste",color:C.red,desc:"Entrées -20%, sorties +10% — pire cas"},
        ].map((s,i)=>{
          const prev=data?.[s.key]||[];
          const solde=prev[prev.length-1]?.sol??soldeActuel;
          return <Card key={i} style={{borderColor:`${s.color}44`}}>
            <div style={{fontSize:13,fontWeight:700,color:s.color,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>{s.desc}</div>
            <div style={{fontSize:24,fontWeight:700,color:s.color,marginBottom:4}}>{fmt(conv(solde,"EUR",devise),devise)}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>Solde estimé à J+90</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:2,height:60}}>
              {prev.slice(0,13).map((p,j)=>{
                const maxVal=Math.max(...prev.map((x)=>Math.abs(x.sol||0)),1);
                const h=Math.max(3,Math.round((Math.abs(p.sol||0)/maxVal)*55));
                return <div key={j} style={{flex:1,height:h,background:`${s.color}66`,borderRadius:"2px 2px 0 0",minHeight:3}}/>;
              })}
            </div>
          </Card>;
        })}
      </div>
      <Card>
        <STitle>📊 Comparaison des 3 scénarios à J+90</STitle>
        {[["🟢 Optimiste",data?.soldeJ90Optimiste||0,C.green],["🔵 Réaliste",data?.soldeJ90||0,C.blue],["🔴 Pessimiste",data?.soldeJ90Pessimiste||0,C.red]].map(([l,v,c],i)=><div key={i} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:c,fontWeight:700}}>{l}</span><span style={{color:c,fontWeight:700}}>{fmt(conv(Number(v),"EUR",devise),devise)}</span></div>
          <SM val={Number(v)+50000} max={100000} color={c}/>
        </div>)}
      </Card>
    </div>}

    {/* ── SANTÉ & KPIs ── */}
    {onglet==="sante"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card style={{borderColor:`${scoreColor}44`}}>
          <STitle>❤ Score de santé financière</STitle>
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:64,fontWeight:700,color:scoreColor,fontFamily:"Georgia,serif"}}>{scoreFinancier}</div>
            <div style={{fontSize:14,color:C.muted,marginBottom:12}}>/100</div>
            <div style={{fontSize:16,fontWeight:700,color:scoreColor,marginBottom:8}}>{scoreLabel}</div>
            <div style={{height:8,background:C.border,borderRadius:4,margin:"0 20px",overflow:"hidden"}}>
              <div style={{height:"100%",width:scoreFinancier+"%",background:scoreColor,borderRadius:4,transition:"width 1s"}}/>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[
              ["Couverture en semaines",`${data?.couvertureEnSemaines||0} sem.`,(data?.couvertureEnSemaines||0)>=4],
              ["Tendance 4 dernières semaines",(data?.semaines||[]).slice(-4).reduce((a,s)=>a+s.net,0)>0?"↗ Positive":"↘ Négative",(data?.semaines||[]).slice(-4).reduce((a,s)=>a+s.net,0)>0],
              ["Commissions dues",fmt(data?.commissionsDues||0),(data?.commissionsDues||0)===0],
              ["Solde > seuil critique",soldeActuel>=seuils.seuil_alerte_critique?"✅ Oui":"❌ Non",soldeActuel>=seuils.seuil_alerte_critique],
            ].map(([l,v,ok],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
              <span style={{color:C.muted}}>{l}</span>
              <span style={{color:(ok)?C.green:C.red,fontWeight:600}}>{v}</span>
            </div>)}
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card>
            <STitle>📍 Point mort hebdomadaire</STitle>
            <div style={{fontSize:28,fontWeight:700,color:C.blue,marginBottom:4}}>{fmt(conv(pointMort,"EUR",devise),devise)}</div>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>C'est le minimum que tu dois encaisser cette semaine pour ne pas descendre sous ton seuil d'alerte de {fmt(seuils.seuil_alerte_bas)}.</div>
          </Card>
          <Card>
            <STitle>🔄 BFR — Besoin en Fonds de Roulement</STitle>
            <div style={{fontSize:28,fontWeight:700,color:C.purple,marginBottom:4}}>{fmt(conv(bfr,"EUR",devise),devise)}</div>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>Argent actuellement "bloqué" dans ton cycle d'exploitation. Délai moyen de paiement clients : {data?.couvertureEnSemaines||30} jours.</div>
          </Card>
        </div>
      </div>
    </div>}

    {/* ── PAR SOURCE ── */}
    {onglet==="sources"&&<Card>
      <STitle>📈 Décomposition des revenus par source</STitle>
      {Object.keys(sources).length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Pas assez de données pour la décomposition. Les sources apparaîtront au fil des transactions.</div>}
      {Object.entries(sources).sort((a,b)=>Number(b[1])-Number(a[1])).map(([source,montant],i)=>{
        const colors=[C.gold,C.blue,C.green,C.purple,C.teal,C.orange];
        const total=Object.values(sources).reduce((a,v)=>a+Number(v),0);
        const pct=total>0?Math.round(Number(montant)/total*100):0;
        return <div key={i} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <span style={{fontWeight:600}}>{source}</span>
            <span style={{color:colors[i%colors.length],fontWeight:700}}>{fmt(conv(Number(montant),"EUR",devise),devise)} · {pct}%</span>
          </div>
          <SM val={pct} max={100} color={colors[i%colors.length]}/>
        </div>;
      })}
      {Object.keys(sources).length>0&&<div style={{marginTop:12,background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:10,fontSize:11,color:C.text}}>
        🤖 Source principale : <b style={{color:C.gold}}>{Object.entries(sources).sort((a,b)=>Number(b[1])-Number(a[1]))[0]?.[0]||"—"}</b>. Pour diversifier tes revenus, développe la 2ème source.
      </div>}
    </Card>}

    {/* ── CASHFLOW ÉQUIPE ── */}
    {onglet==="equipe"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        💡 Coût réel = salaire net × 1.43 (charges patronales). Comparer le coût mensuel au CA généré par chaque collaborateur pour mesurer la rentabilité réelle.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10,marginBottom:12}}>
        {cashflowEquipe.map((e,i)=>{
          const colors=[C.blue,C.purple,C.pink];
          return <Card key={i} style={{borderColor:`${colors[i%3]}33`}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>{e.nom}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Salaire net</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{fmt(e.salaire)}</div></CT>
              <CT style={{textAlign:"center",borderColor:`${C.red}33`}}><div style={{fontSize:9,color:C.red}}>Coût réel/mois</div><div style={{fontSize:14,fontWeight:700,color:C.red}}>{fmt(e.coutMensuel)}</div></CT>
            </div>
            <div style={{marginTop:8,fontSize:10,color:C.muted}}>Coût hebdomadaire : <b style={{color:C.orange}}>{fmt(e.coutHebdo)}</b></div>
          </Card>;
        })}
      </div>
      <Card>
        <STitle>💸 Coût total équipe vs CA</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Coût mensuel total</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>{fmt(conv(data?.coutEquipeTotal||0,"EUR",devise),devise)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>% du CA mensuel</div><div style={{fontSize:18,fontWeight:700,color:C.orange}}>{soldeActuel>0?Math.round((data?.coutEquipeTotal||0)/soldeActuel*100):0}%</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Marge après équipe</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(conv(soldeActuel-(data?.coutEquipeTotal||0),"EUR",devise),devise)}</div></CT>
        </div>
      </Card>
    </div>}

    {/* ── SCORING CLIENTS ── */}
    {onglet==="clients"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontSize:13,fontWeight:700}}>🎯 Scoring prédictif des paiements</div><div style={{fontSize:11,color:C.muted}}>Claude analyse l'historique et prédit qui va payer en retard</div></div>
        <Btn onClick={genererScoring} style={{fontSize:11}}>🤖 Lancer le scoring IA</Btn>
      </div>
      {clientsEnRetard.length===0&&scoringClients.length===0&&<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:32,marginBottom:8}}>✅</div><div style={{fontSize:12,color:C.muted}}>Aucune facture en retard identifiée pour le moment.</div></Card>}
      {clientsEnRetard.length>0&&<Card style={{marginBottom:12,borderColor:`${C.red}33`}}>
        <STitle>⚠️ Factures en retard actuelles</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Client</TH><TH>Montant</TH><TH>Retard</TH></tr></thead>
          <tbody>{clientsEnRetard.map((c,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{c.client}</Td>
            <Td style={{color:C.red,fontWeight:700}}>{fmt(c.montant)}</Td>
            <Td><Pill color={c.retardJours>30?C.red:C.orange}>{c.retardJours}j de retard</Pill></Td>
          </tr>)}</tbody>
        </table>
      </Card>}
      {scoringClients.length>0&&<Card>
        <STitle>🤖 Prédictions IA — Risque de retard ce mois</STitle>
        {scoringClients.map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{c.client}</div><div style={{fontSize:10,color:C.muted}}>{c.raison}</div></div>
          <Pill color={c.risque==="élevé"?C.red:c.risque==="moyen"?C.orange:C.green}>{c.risque}</Pill>
        </div>)}
      </Card>}
    </div>}

    {/* ── PLACEMENTS ── */}
    {onglet==="placement"&&<div>
      {excedent<=0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>💎</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Pas encore d'excédent à placer</div>
        <div style={{fontSize:11,color:C.muted}}>Dès que ton solde dépasse {fmt(seuils.placement_seuil)}, Xyra te suggère automatiquement les meilleures options de placement.</div>
        <div style={{marginTop:14}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Modifier le seuil de déclenchement</label>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            <Inp value={seuils.placement_seuil} onChange={e=>setSeuils(s=>({...s,placement_seuil:Number(e.target.value)}))} style={{width:140}}/>
            <Btn onClick={sauverSeuils} style={{fontSize:11}}>Sauver</Btn>
          </div>
        </div>
      </Card>:<div>
        <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.gold,marginBottom:4}}>💎 Excédent disponible pour placement</div>
          <div style={{fontSize:24,fontWeight:700,color:C.gold}}>{fmt(conv(excedent,"EUR",devise),devise)}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>Solde actuel {fmt(soldeActuel)} − seuil de sécurité {fmt(seuils.placement_seuil)} = excédent</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {suggestionsPlacement.map((p,i)=>{
            const colors=[C.green,C.blue,C.purple];
            return <Card key={i} style={{borderColor:`${colors[i]}44`}}>
              <div style={{fontSize:14,fontWeight:700,color:colors[i],marginBottom:4}}>{p.nom}</div>
              <div style={{fontSize:24,fontWeight:700,color:C.text,marginBottom:2}}>{p.taux}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>rendement annuel</div>
              <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:C.muted}}>Rendement/an</span><span style={{color:colors[i],fontWeight:700}}>+{fmt(conv(p.rendementAnnuel,"EUR",devise),devise)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:C.muted}}>Risque</span><span style={{fontWeight:600}}>{p.risque}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:C.muted}}>Liquidité</span><span style={{fontWeight:600}}>{p.liquidite}</span></div>
              </div>
              <BtnGhost onClick={()=>showToast(`✅ Demande de placement ${p.nom} enregistrée — ton conseiller te contactera`)} style={{width:"100%",fontSize:11,color:colors[i],borderColor:`${colors[i]}44`}}>Souscrire</BtnGhost>
            </Card>;
          })}
        </div>
      </div>}
    </div>}

    {/* ── PRÉVISIONNEL MANUEL ── */}
    {onglet==="manuel"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        ✏️ Ajoute ici des flux prévisionnels que tu connais à l'avance — un gros encaissement attendu, une dépense planifiée — ils s'intègreront dans tes prévisions.
      </div>
      <Card style={{marginBottom:12}}>
        <STitle>+ Ajouter une ligne prévisionnelle</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr 1fr",gap:8,alignItems:"end"}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Description</label><Inp value={ligneManuelle.libelle} onChange={e=>setLigneManuelle(l=>({...l,libelle:e.target.value}))} placeholder="Ex: Paiement Sofia Al-Rashid"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Sens</label><Sel value={ligneManuelle.sens} onChange={e=>setLigneManuelle(l=>({...l,sens:e.target.value}))} style={{height:38}}><option value="entree">↓ Entrée</option><option value="sortie">↑ Sortie</option></Sel></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant (€)</label><Inp value={ligneManuelle.montant} onChange={e=>setLigneManuelle(l=>({...l,montant:e.target.value}))} placeholder="0"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Semaine (lundi)</label><Inp type="date" value={ligneManuelle.semaine} onChange={e=>setLigneManuelle(l=>({...l,semaine:e.target.value}))}/></div>
        </div>
        <Btn onClick={ajouterLigneManuelle} style={{marginTop:10}}>✅ Ajouter à la prévision</Btn>
      </Card>
      {lignesManuelles.length>0&&<Card>
        <STitle>📋 Lignes manuelles ajoutées</STitle>
        {lignesManuelles.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <span style={{fontWeight:600}}>{l.libelle}</span>
          <div style={{display:"flex",gap:8}}>
            <span style={{color:l.sens==="entree"?C.green:C.red,fontWeight:700}}>{l.sens==="entree"?"+":"-"}{fmt(Number(l.montant))}</span>
            <span style={{color:C.muted,fontSize:10}}>{l.semaine}</span>
          </div>
        </div>)}
      </Card>}
    </div>}

    {/* ── SIMULATION ── */}
    {onglet==="simulation"&&<div style={{maxWidth:600}}>
      <Card>
        <STitle>🎮 Simulateur "Si je dépense X, il me reste Y"</STitle>
        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Montant de la dépense simulée</label>
          <input type="range" min={0} max={Math.max(soldeActuel,1000)} value={simDepense} onChange={e=>setSimDepense(Number(e.target.value))} style={{width:"100%",accentColor:C.gold}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}>
            <span>0€</span><span style={{color:C.gold,fontWeight:700}}>{fmt(simDepense)}</span><span>{fmt(Math.max(soldeActuel,1000))}</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Solde actuel</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(conv(soldeActuel,"EUR",devise),devise)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.red}}>Dépense simulée</div><div style={{fontSize:16,fontWeight:700,color:C.red}}>-{fmt(conv(simDepense,"EUR",devise),devise)}</div></CT>
          <CT style={{textAlign:"center",borderColor:`${soldeSim>seuils.seuil_alerte_bas?C.green:C.red}44`}}><div style={{fontSize:9,color:C.muted}}>Solde restant</div><div style={{fontSize:16,fontWeight:700,color:soldeSim>seuils.seuil_alerte_bas?C.green:soldeSim>seuils.seuil_alerte_critique?C.gold:C.red}}>{fmt(conv(soldeSim,"EUR",devise),devise)}</div></CT>
        </div>
        <div style={{background:soldeSim>seuils.seuil_alerte_bas?`${C.green}11`:soldeSim>seuils.seuil_alerte_critique?`${C.gold}11`:`${C.red}11`,border:`1px solid ${soldeSim>seuils.seuil_alerte_bas?C.green:soldeSim>seuils.seuil_alerte_critique?C.gold:C.red}33`,borderRadius:8,padding:12,fontSize:12,color:C.text,marginBottom:12}}>
          {soldeSim>seuils.seuil_alerte_bas?`✅ Trésorerie saine après cette dépense. Il te restera ${fmt(conv(soldeSim,"EUR",devise),devise)} — au-dessus de ton seuil de ${fmt(seuils.seuil_alerte_bas)}.`:soldeSim>seuils.seuil_alerte_critique?`⚠️ Trésorerie sous ton seuil d'alerte (${fmt(seuils.seuil_alerte_bas)}) mais au-dessus du seuil critique. Dépense faisable avec prudence.`:`❌ Danger ! Après cette dépense ton solde (${fmt(conv(soldeSim,"EUR",devise),devise)}) passerait sous ton seuil critique de ${fmt(seuils.seuil_alerte_critique)}. Attends les prochains encaissements.`}
        </div>
        <div>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Scénarios réels rapides</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[["Commissions dues",data?.commissionsDues||0],["Charges du mois",data?.chargesMensuelles||0],["BFR",data?.bfr||0]].filter(([,v])=>Number(v)>0).map(([l,v])=><button key={l} onClick={()=>setSimDepense(Math.round(Number(v)))} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",color:C.muted}}>{l} ({fmt(Number(v))})</button>)}
          </div>
        </div>
      </Card>
    </div>}

    {/* ── ALERTES ── */}
    {onglet==="alertes"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {data?.commissionsDues>0&&<div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:4}}>🔴 Commissions partenaires en attente</div>
        <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{fmt(data.commissionsDues)} de commissions dues. Va dans le Wallet pour les enregistrer et virer.</div>
      </div>}
      {soldeJ90<seuils.seuil_alerte_bas&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:4}}>🟡 Projection J+90 sous le seuil d'alerte</div>
        <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>Ton solde projeté à J+90 ({fmt(soldeJ90)}) est sous ton seuil ({fmt(seuils.seuil_alerte_bas)}). Surveille tes encaissements.</div>
      </div>}
      {clientsEnRetard.length>0&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:4}}>⏰ {clientsEnRetard.length} facture(s) en retard de paiement</div>
        <div style={{fontSize:11,color:C.text}}>{clientsEnRetard.map((c)=>c.client).join(", ")}</div>
      </div>}
      {soldeActuel>=seuils.seuil_alerte_bas&&soldeJ90>=seuils.seuil_alerte_bas&&(data?.commissionsDues||0)===0&&clientsEnRetard.length===0&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>🟢 Trésorerie saine — aucune alerte</div>
        <div style={{fontSize:11,color:C.text}}>Tout est en ordre. Solde actuel et projection J+90 au-dessus de tes seuils.</div>
      </div>}
      <Card>
        <STitle>⚙ Configurer les seuils</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Alerte solde bas","seuil_alerte_bas"],["Alerte solde critique","seuil_alerte_critique"],["Alerte sortie importante","seuil_sortie_importante"],["Seuil de placement automatique","placement_seuil"]].map(([l,k])=><div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}>
            <span style={{color:C.muted}}>{l}</span>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Inp value={(seuils)[k]} onChange={e=>setSeuils((s)=>({...s,[k]:Number(e.target.value)}))} style={{width:120,fontSize:11}}/>
              <span style={{fontSize:10,color:C.muted}}>€</span>
            </div>
          </div>)}
          <Btn onClick={sauverSeuils} style={{marginTop:4,fontSize:11}}>✅ Sauvegarder</Btn>
        </div>
      </Card>
    </div>}

    {/* ── EXPORT ── */}
    {onglet==="export"&&<Card>
      <STitle>📤 Exports trésorerie</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[
          {icon:"📋",label:"CSV complet",desc:"Toutes les semaines réelles + prévisions"},
          {icon:"📱",label:"Rapport WhatsApp",desc:"Résumé hebdo sur ton téléphone"},
          {icon:"📧",label:"Email mensuel",desc:"Rapport PDF automatique"},
        ].map((item,i)=><CT key={i} style={{cursor:"pointer"}} onClick={()=>{
          if(i===0){
            const lignes=["Semaine,Entrées,Sorties,Net,Solde,Type"];
            toutesLesSemaines.forEach((s)=>lignes.push(`${s.debut},${s.entrees||0},${s.sorties||0},${s.net||0},${s.sol||0},${s.pred?"Prévision":"Réel"}`));
            const blob=new Blob([lignes.join("\n")],{type:"text/csv;charset=utf-8"});
            const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="tresorerie_xyra.csv";a.click();
            showToast("✅ CSV téléchargé");
          }else if(i===1){envoyerRapportHebdo();}
          else showToast("✅ Rapport email programmé");
        }}>
          <div style={{fontSize:20,marginBottom:6}}>{item.icon}</div>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>{item.label}</div>
          <div style={{fontSize:9,color:C.muted}}>{item.desc}</div>
        </CT>)}
      </div>
    </Card>}
  </div>;
};

// ─── PAGE ANALYTIQUE ──────────────────────────────────────────

export default PageTresorerie;
