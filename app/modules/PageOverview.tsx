"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, BtnGhost, STitle, Pill, Sel, SM, conv } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageOverview=({plan,profil,setPage,showToast,UpgradeWall})=>{
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[briefing,setBriefing]=useState("");
  const[briefingLoading,setBriefingLoading]=useState(false);
  const[devise,setDevise]=useState("EUR");

  const load=async()=>{
    setLoading(true);
    try{
      const[walletRes,facturesRes,devisRes,clientsRes,dealsRes,chargesRes,partnersRes]=await Promise.all([
        fetch('/api/wallet?action=list').then(r=>r.json()).catch(()=>({})),
        fetch('/api/factures?action=list').then(r=>r.json()).catch(()=>({})),
        fetch('/api/devis?action=list').then(r=>r.json()).catch(()=>({})),
        fetch('/api/clients').then(r=>r.json()).catch(()=>({})),
        fetch('/api/deals').then(r=>r.json()).catch(()=>({})),
        fetch('/api/tresorerie').then(r=>r.json()).catch(()=>({})),
        fetch('/api/partenaires').then(r=>r.json()).catch(()=>({})),
      ]);

      const wallet=walletRes.transactions||walletRes.data||[];
      const factures=facturesRes.factures||facturesRes.data||[];
      const devis=devisRes.devis||devisRes.data||[];
      const clients=clientsRes.clients||clientsRes.data||[];
      const deals=dealsRes.deals||dealsRes.data||[];
      const partners=partnersRes.partenaires||partnersRes.data||[];

      const now=new Date();
      const debutMois=new Date(now.getFullYear(),now.getMonth(),1);
      const debutSemaine=new Date(now.getTime()-now.getDay()*86400000);

      // CA réel
      const caMois=factures.filter(f=>f.statut==="payée"&&new Date(f.date_emission||f.created_at)>=debutMois).reduce((a,f)=>a+Number(f.montant_ttc||0),0)+
        wallet.filter(t=>t.type==="entree"&&t.statut==="confirmé"&&new Date(t.created_at)>=debutMois).reduce((a,t)=>a+Number(t.montant||0),0);
      const caSemaine=factures.filter(f=>f.statut==="payée"&&new Date(f.date_emission||f.created_at)>=debutSemaine).reduce((a,f)=>a+Number(f.montant_ttc||0),0);
      const caTotal=factures.filter(f=>f.statut==="payée").reduce((a,f)=>a+Number(f.montant_ttc||0),0)+
        wallet.filter(t=>t.type==="entree"&&t.statut==="confirmé").reduce((a,t)=>a+Number(t.montant||0),0);

      // Solde wallet
      const solde=(walletRes.solde||walletRes.balance)||
        wallet.filter(t=>t.type==="entree"&&t.statut==="confirmé").reduce((a,t)=>a+Number(t.montant||0),0)-
        wallet.filter(t=>t.type!=="entree"&&t.statut==="viré").reduce((a,t)=>a+Number(t.montant||0),0);

      // Commissions dues
      const commissionsDues=wallet.filter(t=>t.type==="commission"&&t.statut==="à_virer").reduce((a,t)=>a+Number(t.montant||0),0);

      // Factures en attente
      const facturesEnAttente=factures.filter(f=>f.statut!=="payée"&&f.statut!=="annulée");
      const montantEnAttente=facturesEnAttente.reduce((a,f)=>a+Number(f.montant_ttc||0),0);

      // Devis en cours
      const devisEnCours=devis.filter(d=>d.statut==="envoyé"||d.statut==="en_cours");

      // Deals pipeline
      const dealsActifs=deals.filter(d=>d.statut!=="perdu"&&d.statut!=="gagné");
      const valeurPipeline=dealsActifs.reduce((a,d)=>a+Number(d.valeur||d.montant||0),0);

      // Score santé global
      let score=50;
      if(solde>10000)score+=15;else if(solde>2000)score+=5;else score-=15;
      if(caMois>5000)score+=15;else if(caMois>1000)score+=5;else score-=5;
      if(commissionsDues>solde*0.3)score-=10;
      if(facturesEnAttente.length>5)score-=5;
      if(clients.length>10)score+=10;else if(clients.length>3)score+=5;
      const scoreGlobal=Math.max(0,Math.min(100,score));

      // Activité récente
      const activiteRecente=[
        ...factures.slice(-5).map(f=>({type:"facture",label:f.client_nom||"Client",montant:Number(f.montant_ttc||0),statut:f.statut,date:f.created_at})),
        ...wallet.slice(-5).map(t=>({type:"wallet",label:t.libelle||t.type,montant:Number(t.montant||0),statut:t.statut,date:t.created_at})),
      ].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,8);

      // Météo financière
      const meteo=solde>10000&&caMois>3000?"🌞 Excellente":solde>5000&&caMois>1000?"🌤 Bonne":solde>2000?"⛅ Correcte":"🌧 Difficile";
      const meteoColor=solde>10000&&caMois>3000?C.green:solde>5000&&caMois>1000?C.teal:solde>2000?C.gold:C.red;

      setData({caMois,caSemaine,caTotal,solde,commissionsDues,montantEnAttente,facturesEnAttente,devisEnCours,dealsActifs,valeurPipeline,scoreGlobal,activiteRecente,meteo,meteoColor,clients,partners});
    }catch(e){console.error("Overview:",e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  useEffect(()=>{
    if(data&&!briefing){
      setBriefingLoading(true);
      fetch('/api/ia',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        max_tokens:400,
        prompt:`Tu es l'assistant IA de Xyra. Génère un briefing matinal professionnel (4-5 phrases, français, ton coach business) basé sur ces données réelles :
Score santé : ${data.scoreGlobal}/100 | CA ce mois : ${data.caMois}€ | Solde : ${data.solde}€
Commissions dues : ${data.commissionsDues}€ | Factures en attente : ${data.montantEnAttente}€ (${data.facturesEnAttente?.length} factures)
Devis en cours : ${data.devisEnCours?.length} | Pipeline deals : ${data.valeurPipeline}€
Clients actifs : ${data.clients?.length}

Donne : 1 constat positif, 1 point de vigilance, et 3 priorités concrètes pour aujourd'hui. Commence par "Bonjour ! Voici votre briefing du jour —"`
      })}).then(r=>r.json()).then(d=>{setBriefing(d.text||"");setBriefingLoading(false);}).catch(()=>setBriefingLoading(false));
    }
  },[data]);

  if(!hasAccess(plan,"overview"))return <div style={{padding:20}}><UpgradeWall page="overview" plan={plan}/></div>;
  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement de votre vue d'ensemble...</div></div>;

  const scoreColor=data.scoreGlobal>=70?C.green:data.scoreGlobal>=40?C.gold:C.red;
  const scoreLabel=data.scoreGlobal>=70?"🟢 Excellente":data.scoreGlobal>=40?"🟡 Correcte":"🔴 À surveiller";

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◑ Vue d'ensemble</div>
        <div style={{fontSize:11,color:C.muted}}>Tableau de bord principal · Données réelles en temps réel</div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{fontSize:22}}>{data.meteo.split(" ")[0]}</div>
        <div style={{fontSize:12,color:data.meteoColor,fontWeight:700}}>{data.meteo.split(" ").slice(1).join(" ")}</div>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
      </div>
    </div>

    {/* BRIEFING IA */}
    <div style={{background:`linear-gradient(135deg,${C.card},${C.card2})`,border:`1px solid ${C.purple}44`,borderRadius:12,padding:16,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:700,letterSpacing:"0.1em"}}>🤖 BRIEFING IA — CLAUDE · {new Date().toLocaleDateString("fr",{weekday:"long",day:"numeric",month:"long"}).toUpperCase()}</div>
        <BtnGhost onClick={()=>{setBriefing("");setBriefingLoading(true);}} style={{fontSize:9,padding:"3px 8px"}}>🔄</BtnGhost>
      </div>
      {briefingLoading?<div style={{fontSize:12,color:C.muted}}>⏳ Génération du briefing...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{briefing||"Chargement du briefing..."}</div>}
    </div>

    {/* SCORE + KPIs PRINCIPAUX */}
    <div style={{display:"grid",gridTemplateColumns:"140px 1fr",gap:12,marginBottom:16}}>
      <div style={{background:C.card,border:`2px solid ${scoreColor}44`,borderRadius:12,padding:16,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:9,color:C.muted,marginBottom:6,letterSpacing:"0.1em"}}>SCORE SANTÉ</div>
        <div style={{fontSize:48,fontWeight:700,color:scoreColor,fontFamily:"Georgia,serif",lineHeight:1}}>{data.scoreGlobal}</div>
        <div style={{fontSize:9,color:scoreColor,marginTop:4}}>{scoreLabel}</div>
        <div style={{width:"100%",height:4,background:C.border,borderRadius:2,marginTop:8,overflow:"hidden"}}>
          <div style={{height:"100%",width:data.scoreGlobal+"%",background:scoreColor,borderRadius:2,transition:"width 1s"}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {[
          {l:"CA ce mois",v:fmt(conv(data.caMois,"EUR",devise),devise),c:C.green,sub:"Réel confirmé"},
          {l:"Solde wallet",v:fmt(conv(data.solde,"EUR",devise),devise),c:data.solde>5000?C.teal:data.solde>2000?C.gold:C.red,sub:"Disponible"},
          {l:"En attente",v:fmt(conv(data.montantEnAttente,"EUR",devise),devise),c:C.orange,sub:`${data.facturesEnAttente?.length||0} factures`},
          {l:"Pipeline deals",v:fmt(conv(data.valeurPipeline,"EUR",devise),devise),c:C.blue,sub:`${data.dealsActifs?.length||0} deals actifs`},
          {l:"CA cette semaine",v:fmt(conv(data.caSemaine,"EUR",devise),devise),c:C.purple,sub:"7 derniers jours"},
          {l:"Commissions dues",v:fmt(conv(data.commissionsDues,"EUR",devise),devise),c:data.commissionsDues>0?C.red:C.green,sub:data.commissionsDues>0?"À virer":"Tout à jour"},
          {l:"Devis en cours",v:data.devisEnCours?.length||0,c:C.blue,sub:"Envoyés"},
          {l:"Clients actifs",v:data.clients?.length||0,c:C.teal,sub:"Total CRM"},
        ].map((k,i)=><CT key={i}><div style={{fontSize:9,color:C.muted,marginBottom:3,letterSpacing:"0.08em"}}>{k.l}</div><div style={{fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div><div style={{fontSize:9,color:C.muted,marginTop:2}}>{k.sub}</div></CT>)}
      </div>
    </div>

    {/* ACTIONS RAPIDES */}
    <Card style={{marginBottom:14}}>
      <STitle>⚡ Actions rapides</STitle>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[
          {label:"+ Nouveau devis",color:C.gold,page:"devis"},
          {label:"+ Enregistrer paiement",color:C.green,page:"wallet"},
          {label:"+ Ajouter client",color:C.blue,page:"crm"},
          {label:"+ Nouvelle facture",color:C.purple,page:"facturation"},
          {label:"+ Deal pipeline",color:C.orange,page:"deals"},
          {label:"Voir trésorerie",color:C.teal,page:"tresorerie"},
        ].map((a,i)=><button key={i} onClick={()=>setPage&&setPage(a.page)} style={{background:`${a.color}15`,border:`1px solid ${a.color}44`,borderRadius:8,padding:"8px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:12,color:a.color,fontWeight:600,transition:"all 0.2s"}}>{a.label}</button>)}
      </div>
    </Card>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
      {/* ACTIVITÉ RÉCENTE */}
      <Card>
        <STitle>🕐 Activité récente</STitle>
        {data.activiteRecente?.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:12}}>Aucune activité récente.</div>}
        {data.activiteRecente?.map((a,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:14}}>{a.type==="facture"?"🧾":"💳"}</span>
            <div>
              <div style={{fontWeight:600,color:C.text}}>{a.label}</div>
              <div style={{fontSize:9,color:C.muted}}>{new Date(a.date).toLocaleDateString("fr")}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontWeight:700,color:C.gold}}>{fmt(a.montant)}</div>
            <Pill color={a.statut==="payée"||a.statut==="confirmé"?C.green:a.statut==="viré"?C.teal:C.orange}>{a.statut}</Pill>
          </div>
        </div>)}
      </Card>

      {/* PIPELINE DEALS */}
      <Card>
        <STitle>🎯 Pipeline commercial</STitle>
        {data.dealsActifs?.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:12}}>Aucun deal actif. <button onClick={()=>setPage&&setPage("deals")} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>Ajouter un deal →</button></div>}
        {data.dealsActifs?.slice(0,5).map((d,i)=>{
          const prob=d.probabilite||d.probability||50;
          const colors=[C.blue,C.purple,C.teal,C.gold,C.orange];
          return <div key={i} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
              <span style={{fontWeight:600}}>{d.nom||d.titre||d.name||"Deal"}</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{color:C.gold,fontWeight:700}}>{fmt(Number(d.valeur||d.montant||0))}</span>
                <Pill color={colors[i%5]}>{prob}%</Pill>
              </div>
            </div>
            <SM val={prob} max={100} color={colors[i%5]}/>
          </div>;
        })}
        {data.valeurPipeline>0&&<div style={{marginTop:10,padding:"8px 12px",background:`${C.blue}11`,border:`1px solid ${C.blue}22`,borderRadius:8,fontSize:11,color:C.text}}>
          Pipeline total : <b style={{color:C.gold}}>{fmt(data.valeurPipeline)}</b>
        </div>}
      </Card>
    </div>

    {/* ALERTES URGENTES */}
    {(data.commissionsDues>0||data.facturesEnAttente?.length>3||data.solde<2000)&&<Card style={{borderColor:`${C.orange}44`}}>
      <STitle>🔔 Points d'attention</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {data.commissionsDues>0&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:`${C.red}11`,border:`1px solid ${C.red}22`,borderRadius:8,padding:"10px 12px",fontSize:12}}>
          <span>💸 Commissions partenaires à virer</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{color:C.red,fontWeight:700}}>{fmt(data.commissionsDues)}</span>
            <BtnGhost onClick={()=>setPage&&setPage("wallet")} style={{fontSize:10,padding:"3px 8px"}}>Gérer →</BtnGhost>
          </div>
        </div>}
        {data.facturesEnAttente?.length>3&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:`${C.orange}11`,border:`1px solid ${C.orange}22`,borderRadius:8,padding:"10px 12px",fontSize:12}}>
          <span>🧾 {data.facturesEnAttente.length} factures en attente de paiement</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{color:C.orange,fontWeight:700}}>{fmt(data.montantEnAttente)}</span>
            <BtnGhost onClick={()=>setPage&&setPage("facturation")} style={{fontSize:10,padding:"3px 8px"}}>Voir →</BtnGhost>
          </div>
        </div>}
        {data.solde<2000&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:`${C.red}11`,border:`1px solid ${C.red}22`,borderRadius:8,padding:"10px 12px",fontSize:12}}>
          <span>⚠️ Solde wallet sous le seuil critique</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{color:C.red,fontWeight:700}}>{fmt(data.solde)}</span>
            <BtnGhost onClick={()=>setPage&&setPage("tresorerie")} style={{fontSize:10,padding:"3px 8px"}}>Trésorerie →</BtnGhost>
          </div>
        </div>}
      </div>
    </Card>}
  </div>;
};



export default PageOverview;
