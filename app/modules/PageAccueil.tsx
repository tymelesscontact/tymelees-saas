"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, STitle } from "../lib/ui";

const PageAccueil=({notifs,setNotifs,profil,setPage})=>{
  const nonLus=notifs.filter(n=>!n.lu).length;
  const[loading,setLoading]=useState(true);
  const[caReel,setCaReel]=useState(0);
  const[caMoisDernier,setCaMoisDernier]=useState(0);
  const[margeNette,setMargeNette]=useState(0);
  const[commissionsAVirer,setCommissionsAVirer]=useState(0);
  const[leadsEnAttente,setLeadsEnAttente]=useState(0);
  const[prochainRdv,setProchainRdv]=useState(null);
  const[ca7j,setCa7j]=useState([]);
  const[aiMsg,setAiMsg]=useState("");
  const[aiLoading,setAiLoading]=useState(false);
  const[scoreBusiness,setScoreBusiness]=useState(0);
  const[tendance,setTendance]=useState("stable");
  const[totalCharges,setTotalCharges]=useState(0);

  useEffect(()=>{
    const load=async()=>{
      try{
        const[wRes,fRes,chRes]=await Promise.all([
          fetch('/api/wallet?action=list').then(r=>r.json()).catch(()=>({})),
          fetch('/api/factures?action=list').then(r=>r.json()).catch(()=>({})),
          fetch('/api/charges').then(r=>r.json()).catch(()=>({})),
        ]);
        const now=new Date();
        const moisActuel=now.getMonth(),anneeActuelle=now.getFullYear();
        const moisPrecedent=moisActuel===0?11:moisActuel-1;
        const anneePrecedente=moisActuel===0?anneeActuelle-1:anneeActuelle;
        const txs=wRes.transactions||[];
        let caM=0,caMp=0;
        txs.forEach(t=>{
          if(t.type!=="entree"||t.statut!=="confirmé")return;
          const d=new Date(t.created_at),m=Number(t.montant||0);
          if(d.getMonth()===moisActuel&&d.getFullYear()===anneeActuelle)caM+=m;
          if(d.getMonth()===moisPrecedent&&d.getFullYear()===anneePrecedente)caMp+=m;
        });
        (fRes.factures||[]).forEach(f=>{
          if(f.statut!=="payée")return;
          const d=new Date(f.date_emission||f.created_at),m=Number(f.montant_ttc||0);
          if(d.getMonth()===moisActuel&&d.getFullYear()===anneeActuelle)caM+=m;
          if(d.getMonth()===moisPrecedent&&d.getFullYear()===anneePrecedente)caMp+=m;
        });
        setCaReel(caM);setCaMoisDernier(caMp);
        setTendance(caM>caMp?"hausse":caM<caMp?"baisse":"stable");
        const charges=(chRes.charges||[]);
        const totalCh=charges.reduce((a,c)=>a+Number(c.montant||0),0);
        setTotalCharges(totalCh);
        const marge=caM>0?Math.round(((caM-totalCh)/caM)*100):0;
        setMargeNette(Math.max(0,Math.min(100,marge)));
        const comm=txs.filter(t=>t.type==="commission"&&t.statut==="à_virer").reduce((a,t)=>a+Number(t.montant||0),0);
        setCommissionsAVirer(comm);
        try{
          const crmRes=await fetch('/api/crm').then(r=>r.json()).catch(()=>({}));
          setLeadsEnAttente((crmRes.leads||[]).filter(l=>l.etape==="Nouveau").length);
        }catch(e){}
        try{
          const{createClient}=await import('@supabase/supabase-js');
          const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
          const{data:pl}=await sb.from('planning').select('date_mission,heure_debut,client_nom,service,collaborateur').gte('date_mission',now.toISOString().slice(0,10)).order('date_mission',{ascending:true}).limit(1);
          if(pl&&pl[0])setProchainRdv(pl[0]);
        }catch(e){}
        const derniers7j=[];
        for(let i=6;i>=0;i--){
          const d=new Date();d.setDate(d.getDate()-i);
          const label=d.toLocaleDateString("fr",{weekday:"short"});
          const ca=txs.filter(t=>{const td=new Date(t.created_at);return t.type==="entree"&&t.statut==="confirmé"&&td.toDateString()===d.toDateString();}).reduce((a,t)=>a+Number(t.montant||0),0);
          derniers7j.push({label,ca});
        }
        setCa7j(derniers7j);
        let score=50;
        if(caM>10000)score+=15;else if(caM>5000)score+=8;
        if(marge>50)score+=10;else if(marge>30)score+=5;
        if(comm===0)score+=10;
        if(caM>=caMp)score+=10;
        setScoreBusiness(Math.min(100,score));
      }catch(e){console.error("Accueil:",e);}
      setLoading(false);
    };
    load();
  },[]);

  const genererAnalyseIA=async()=>{
    setAiLoading(true);
    try{
      const res=await fetch("/api/ia",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({max_tokens:200,prompt:`Données réelles dashboard : CA ce mois ${fmt(caReel)}, CA mois dernier ${fmt(caMoisDernier)}, tendance ${tendance}, marge ${margeNette}%, commissions à virer ${fmt(commissionsAVirer)}, leads CRM ${leadsEnAttente}, charges ${fmt(totalCharges)}, score ${scoreBusiness}/100. Brief morning 2-3 phrases max, français, actionnable, priorité n°1 en premier.`})});
      const data=await res.json();
      if(data.text)setAiMsg(data.text);
      else setAiMsg("Enregistre tes premières transactions pour activer l'analyse IA.");
    }catch(e){setAiMsg("Analyse IA indisponible.");}
    setAiLoading(false);
  };
  useEffect(()=>{if(!loading)genererAnalyseIA();},[loading]);

  const priorites=[];
  if(commissionsAVirer>0)priorites.push({icon:"🟠",txt:`${fmt(commissionsAVirer)} de commissions partenaires à virer`,act:"wallet"});
  if(leadsEnAttente>0)priorites.push({icon:"🔴",txt:`${leadsEnAttente} lead(s) CRM en attente`,act:"crm"});
  if(priorites.length===0)priorites.push({icon:"🟢",txt:"Tout est à jour — bonne journée !",act:null});

  const meteo=tendance==="hausse"?{icon:"☀️",txt:`CA en hausse (+${caMoisDernier>0?Math.round(((caReel-caMoisDernier)/caMoisDernier)*100):0}%)`,color:C.green}:tendance==="baisse"?{icon:"🌧️",txt:"CA en baisse vs mois dernier",color:C.red}:{icon:"⛅",txt:"CA stable",color:C.gold};
  const maxCa=Math.max(...ca7j.map(d=>d.ca),1);

  return <div style={{padding:20}}>
    <div style={{background:`linear-gradient(135deg,${C.card},#0A1A14)`,border:`1px solid ${C.gold}33`,borderRadius:16,padding:24,marginBottom:16}}>
      <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",marginBottom:6}}>XYRA · OWNER DASHBOARD</div>
      <div style={{fontSize:26,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>Bonjour ✦</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:16,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        {new Date().toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} · Paris
        <span style={{background:`${meteo.color}22`,color:meteo.color,border:`1px solid ${meteo.color}44`,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600}}>{meteo.icon} {meteo.txt}</span>
      </div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:12,marginBottom:16,minHeight:52}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:4}}>🤖 Brief IA du matin — Claude · données réelles</div>
        {aiLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{aiMsg||"—"}</div>}
      </div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        <div style={{borderLeft:`2px solid ${C.gold}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Score business</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{loading?"—":scoreBusiness+"/100"}</div></div>
        <div style={{borderLeft:`2px solid ${C.green}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>CA ce mois</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{loading?"—":fmt(caReel)}</div></div>
        <div style={{borderLeft:`2px solid ${C.teal}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Marge nette</div><div style={{fontSize:16,fontWeight:700,color:C.teal}}>{loading?"—":margeNette+"%"}</div></div>
        <div style={{borderLeft:`2px solid ${C.orange}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Messages</div><div style={{fontSize:16,fontWeight:700,color:C.orange}}>{nonLus} non lus</div></div>
        {!loading&&commissionsAVirer>0&&<div style={{borderLeft:`2px solid ${C.red}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Commissions dues</div><div style={{fontSize:16,fontWeight:700,color:C.red}}>{fmt(commissionsAVirer)}</div></div>}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <Card>
        <STitle>🔥 Priorités du jour (calculées)</STitle>
        {priorites.map((p,i)=><div key={i} onClick={()=>p.act&&setPage(p.act)} style={{display:"flex",gap:8,padding:"7px 8px",borderRadius:6,marginBottom:5,cursor:p.act?"pointer":"default",background:C.card2,border:`1px solid ${C.border}`}}><span>{p.icon}</span><span style={{fontSize:11,flex:1}}>{p.txt}</span>{p.act&&<span style={{fontSize:10,color:C.gold,fontWeight:600}}>→</span>}</div>)}
        {prochainRdv&&<div style={{marginTop:8,background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:8,padding:"8px 10px",fontSize:11}}><div style={{color:C.blue,fontWeight:600,marginBottom:2}}>📅 Prochain RDV</div><div style={{color:C.text}}>{prochainRdv.client_nom} — {prochainRdv.service}</div><div style={{color:C.muted,fontSize:10}}>{prochainRdv.date_mission} à {prochainRdv.heure_debut} · {prochainRdv.collaborateur}</div></div>}
      </Card>
      <Card>
        <STitle>📊 Métriques clés (réelles)</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>CA Mois</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{loading?"—":fmt(caReel)}</div>{!loading&&caMoisDernier>0&&<div style={{fontSize:9,color:caReel>=caMoisDernier?C.green:C.red}}>{caReel>=caMoisDernier?"↗":"↘"} vs mois dernier</div>}</CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>Leads CRM</div><div style={{fontSize:16,fontWeight:700,color:C.orange}}>{loading?"—":leadsEnAttente}</div><div style={{fontSize:9,color:C.muted}}>Nouveaux</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>Marge</div><div style={{fontSize:16,fontWeight:700,color:C.teal}}>{loading?"—":margeNette+"%"}</div><div style={{fontSize:9,color:C.muted}}>Estimée</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>Score</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{loading?"—":scoreBusiness+"/100"}</div><div style={{fontSize:9,color:scoreBusiness>=70?C.green:scoreBusiness>=50?C.gold:C.red}}>{loading?"—":scoreBusiness>=70?"🟢 Bon":scoreBusiness>=50?"🟡 Correct":"🔴 À améliorer"}</div></CT>
        </div>
      </Card>
    </div>
    <Card style={{marginBottom:12}}>
      <STitle>📈 CA 7 derniers jours (temps réel)</STitle>
      {ca7j.every(d=>d.ca===0)?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"20px 0"}}>Aucune transaction confirmée — les paiements apparaîtront ici automatiquement.</div>
      :<div style={{display:"flex",alignItems:"flex-end",gap:6,height:100,padding:"10px 0"}}>{ca7j.map((d,i)=>{const h=Math.round((d.ca/maxCa)*80)+4;return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{fontSize:9,color:d.ca>0?C.gold:C.muted,fontWeight:600}}>{d.ca>0?fmt(d.ca).replace(" €",""):""}</div><div style={{width:"100%",height:h,background:d.ca>0?`linear-gradient(180deg,${C.gold},${C.gold}88)`:`${C.border}44`,borderRadius:"3px 3px 0 0",minHeight:4}}/><div style={{fontSize:9,color:C.muted}}>{d.label}</div></div>;})}
      </div>}
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
      {[{icon:"💳",label:"Wallet",page:"wallet",val:loading?"—":commissionsAVirer>0?`⚠ ${fmt(commissionsAVirer)} dus`:"À jour",color:commissionsAVirer>0?C.orange:C.teal},{icon:"◎",label:"CRM",page:"crm",val:loading?"—":`${leadsEnAttente} leads`,color:C.blue},{icon:"◧",label:"Devis",page:"devis",val:"Créer un devis",color:C.gold},{icon:"📊",label:"Analytique",page:"analytique",val:loading?"—":tendance==="hausse"?"CA ↗":"CA stable",color:tendance==="hausse"?C.green:C.gold}].map((c,i)=><Card key={i} style={{cursor:"pointer",borderColor:`${c.color}33`,textAlign:"center"}} onClick={()=>setPage(c.page)}><div style={{fontSize:24,marginBottom:6}}>{c.icon}</div><div style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:2}}>{c.label}</div><div style={{fontSize:11,fontWeight:700,color:c.color}}>{c.val}</div></Card>)}
    </div>
  </div>;
};


export default PageAccueil;
