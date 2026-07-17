"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI } from "../lib/ui";
import { PLANNING, CONTRATS } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageEquipe=({plan,showToast,UpgradeWall})=>{
  // Chargement des vraies données Supabase
  const loadRealData=async()=>{
    try{
      const res=await fetch('/api/equipe');
      const data=await res.json();
      if(data.membres&&data.membres.length>0){
        setEquipe(prev=>prev.map(m=>{
          const real=data.membres.find(r=>r.email===m.email||r.nom===m.nom);
          return real?{...m,...real,missions:real.missions?.length>0?real.missions:m.missions}:m;
        }));
        setAlertes(data.alertes||[]);
      }
    }catch(e){console.log("Mode local");}
  };
  useEffect(()=>{loadRealData();},[]);
  const[equipe,setEquipe]=useState([
    {id:1,nom:"Thomas Beaumont",prenom:"Thomas",role:"Responsable missions premium",statut:"En mission",localisation:"Airbnb Montmartre",pointage:"09:02",heures:6.5,conges:12,soldeConges:12,salaire:2800,perf:94,contrat:"CDI",email:"thomas@xyra.io",tel:"+33 6 12 34 56 78",embauche:"01/03/2024",nss:"1 85 06 75 056 042 28",rib:"FR76 3000 4000 0100 0012 3456 789",adresse:"12 rue de la Paix, 75001 Paris",dateNaissance:"15/06/1985",couleur:"#4B7BFF",
    missions:[{date:"15/04",service:"Nettoyage Airbnb Montmartre",client:"Isabelle Moreau",duree:"3h",note:5},{date:"14/04",service:"Nettoyage bureaux La Défense",client:"Marc Dupont",duree:"4h",note:5},{date:"12/04",service:"Rapatriement corps — Lefevre",client:"Pierre Lefevre",duree:"8h",note:5}],
    evaluations:[{date:"01/04/2026",note:94,points:"Excellence technique, ponctualité parfaite, initiative",axes:"Développer compétences aviation privée",evaluateur:"Curtiss"},{date:"01/01/2026",note:88,points:"Très bonne maîtrise des protocoles premium",axes:"Communication client à perfectionner",evaluateur:"Curtiss"}],
    formations:[{titre:"Protocole nettoyage jet privé",date:"15/03",statut:"complété",score:98},{titre:"Secourisme SST",date:"10/01",statut:"complété",score:95}],
    documents:[{nom:"Carte d'identité",type:"ID",expire:"2030",statut:"valide"},{nom:"DPAE embauche",type:"RH",date:"01/03/2024",statut:"archivé"},{nom:"Contrat CDI",type:"Contrat",date:"01/03/2024",statut:"signé"}],
    arrets:[],objectifs:[{obj:"Atteindre 50 missions/mois",actuel:38,cible:50,color:"#4B7BFF"},{obj:"Score client > 4.8",actuel:4.9,cible:4.8,color:"#2EC9B0"},{obj:"Zéro retard",actuel:0,cible:0,color:"#2EC9B0"}],
    carriere:[{date:"01/03/2024",poste:"Technicien junior",salaire:2200},{date:"01/09/2024",poste:"Technicien senior",salaire:2500},{date:"01/03/2025",poste:"Responsable missions premium",salaire:2800}]},

    {id:2,nom:"Abou Diallo",prenom:"Abou",role:"Technicien polyvalent",statut:"Disponible",localisation:"Paris 18e",pointage:"08:45",heures:5.2,conges:15,soldeConges:15,salaire:2200,perf:88,contrat:"CDD",email:"abou@xyra.io",tel:"+33 6 98 76 54 32",embauche:"15/06/2024",nss:"1 92 03 75 115 224 55",rib:"FR76 1027 8060 0001 0234 5678 901",adresse:"45 avenue de Clichy, 75017 Paris",dateNaissance:"03/03/1992",couleur:"#9B5FFF",
    missions:[{date:"15/04",service:"Nettoyage Airbnb Montmartre",client:"Isabelle Moreau",duree:"3h",note:5},{date:"13/04",service:"Entretien yacht",client:"Jet Services",duree:"5h",note:4}],
    evaluations:[{date:"01/04/2026",note:88,points:"Polyvalence remarquable, bonne attitude",axes:"Améliorer vitesse d'exécution",evaluateur:"Curtiss"}],
    formations:[{titre:"Nettoyage yacht — produits nacrés",date:"20/03",statut:"à faire",score:null},{titre:"Secourisme SST",date:"10/01",statut:"complété",score:90}],
    documents:[{nom:"Titre de séjour",type:"ID",expire:"15/11/2026",statut:"valide"},{nom:"Contrat CDD",type:"Contrat",date:"15/06/2024",statut:"signé"}],
    arrets:[{debut:"05/02/2026",fin:"08/02/2026",jours:3,motif:"Grippe",justif:"Arrêt médical fourni"}],
    objectifs:[{obj:"30 missions/mois",actuel:22,cible:30,color:"#9B5FFF"},{obj:"Score client > 4.5",actuel:4.6,cible:4.5,color:"#2EC9B0"}],
    carriere:[{date:"15/06/2024",poste:"Technicien junior",salaire:2000},{date:"01/01/2025",poste:"Technicien polyvalent",salaire:2200}]},

    {id:3,nom:"Fatou Sarr",prenom:"Fatou",role:"Commercial & Relations clients",statut:"En RDV",localisation:"Client VIP 14h",pointage:"09:30",heures:4.8,conges:10,soldeConges:10,salaire:2400,perf:91,contrat:"CDI",email:"fatou@xyra.io",tel:"+33 6 55 44 33 22",embauche:"01/09/2024",nss:"2 94 08 75 102 358 44",rib:"FR76 2004 1000 0101 0050 0678 912",adresse:"8 rue Victor Hugo, 75016 Paris",dateNaissance:"22/08/1994",couleur:"#FF5F9E",
    missions:[{date:"17/04",service:"RDV client VIP Sofia Al-Rashid",client:"Sofia Al-Rashid",duree:"2h",note:5},{date:"14/04",service:"Prospection syndics 94",client:"—",duree:"4h",note:null}],
    evaluations:[{date:"01/04/2026",note:91,points:"Excellente relation client, très bonne prospection",axes:"Développer compétences closing B2B",evaluateur:"Curtiss"}],
    formations:[{titre:"Technique de vente B2B",date:"25/03",statut:"en cours",score:null},{titre:"Accueil client VIP",date:"15/02",statut:"complété",score:92}],
    documents:[{nom:"Carte d'identité",type:"ID",expire:"2028",statut:"valide"},{nom:"Contrat CDI",type:"Contrat",date:"01/09/2024",statut:"signé"}],
    arrets:[],
    objectifs:[{obj:"20 nouveaux prospects/mois",actuel:17,cible:20,color:"#FF5F9E"},{obj:"CA apporté > 8 000€",actuel:6200,cible:8000,color:"#C9A84C"}],
    carriere:[{date:"01/09/2024",poste:"Chargée de relations clients",salaire:2200},{date:"01/03/2025",poste:"Commercial & Relations clients",salaire:2400}]},
  ]);

  const[onglet,setOnglet]=useState("dashboard");
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",role:"",salaire:"",contrat:"CDI",email:"",tel:"",adresse:"",dateNaissance:""});
  const[moisCal,setMoisCal]=useState(4);

  const tabs=[
    {id:"dashboard",label:"📊 Tableau de bord"},
    {id:"equipe",label:"👥 Équipe"},
    {id:"objectifs",label:"🎯 Objectifs & KPIs"},
    {id:"pointage",label:"⏰ Pointage GPS"},
    {id:"conges",label:"🏖 Congés"},
    {id:"planning_cal",label:"📅 Calendrier congés"},
    {id:"arrets",label:"🏥 Arrêts & Absences"},
    {id:"paie",label:"💸 Paie & Charges"},
    {id:"contrats",label:"📋 Contrats RH"},
    {id:"documents",label:"🗂 Documents RH"},
    {id:"entretiens",label:"💼 Entretiens & Évals"},
    {id:"formations",label:"🎓 Formations"},
    {id:"carriere",label:"📈 Évolution carrière"},
    {id:"alertes",label:"🔔 Alertes RH"},
    {id:"ia",label:"🤖 IA RH"},
    {id:"juridique",label:"⚖ Juridique"},
  ];

  if(!hasAccess(plan,"equipe"))return <div style={{padding:20}}><UpgradeWall page="Équipe" plan={plan}/></div>;

  const totalSalaire=equipe.reduce((a,e)=>a+e.salaire,0);
  const totalArrets=equipe.reduce((a,e)=>a+e.arrets.length,0);
  const perfMoy=Math.round(equipe.reduce((a,e)=>a+e.perf,0)/equipe.length);

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:"#EAE6DE",fontFamily:"Georgia,serif"}}>⊞ RH & Équipe</div>
        <div style={{fontSize:11,color:"#5A5A7A"}}>Gestion complète des ressources humaines · {equipe.length} collaborateur</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setShowAdd(s=>!s)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>+ Ajouter</button>
        <button onClick={()=>showToast("📧 Rapport RH mensuel envoyé !")} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>📊 Rapport RH</button>
      </div>
    </div>

    {/* FORM ADD */}
    {showAdd&&<div style={{background:"#0C0C1A",border:"1px solid #C9A84C44",borderRadius:12,padding:18,marginBottom:14}}>
      <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Nouveau collaborateur</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Nom complet","nom"],["Poste / rôle","role"],["Email pro","email"],["Téléphone","tel"],["Date de naissance","dateNaissance"],["Adresse domicile","adresse"]].map(([ph,k])=><input key={k} value={addForm[k]} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit",outline:"none"}}/>)}
        <input value={addForm.salaire} onChange={e=>setAddForm(f=>({...f,salaire:e.target.value}))} placeholder="Salaire net (€)" style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit",outline:"none"}}/>
        <select value={addForm.contrat} onChange={e=>setAddForm(f=>({...f,contrat:e.target.value}))} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 12px",color:"#EAE6DE",fontSize:12,fontFamily:"inherit"}}><option>CDI</option><option>CDD</option><option>Auto-entrepreneur</option><option>Intérim</option><option>Stage</option></select>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{
          const colors=["#4B7BFF","#9B5FFF","#FF5F9E","#2EC9B0","#FF8C3A"];
          const n={id:Date.now(),nom:addForm.nom,prenom:addForm.nom.split(" ")[0],role:addForm.role,statut:"Disponible",localisation:"—",pointage:"—",heures:0,conges:25,soldeConges:25,salaire:Number(addForm.salaire)||0,perf:0,contrat:addForm.contrat,email:addForm.email,tel:addForm.tel,embauche:new Date().toLocaleDateString("fr"),nss:"",rib:"",adresse:addForm.adresse,dateNaissance:addForm.dateNaissance,couleur:colors[equipe.length%colors.length],missions:[],evaluations:[],formations:[],documents:[],arrets:[],objectifs:[],carriere:[{date:new Date().toLocaleDateString("fr"),poste:addForm.role,salaire:Number(addForm.salaire)||0}]};
          setEquipe(eq=>[...eq,n]);setShowAdd(false);setAddForm({nom:"",role:"",salaire:"",contrat:"CDI",email:"",tel:"",adresse:"",dateNaissance:""});
          showToast(`✅ ${addForm.nom} ajouté à l'équipe !`);
        }} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>✅ Ajouter</button>
        <button onClick={()=>setShowAdd(false)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Annuler</button>
      </div>
    </div>}

    {/* KPIs RAPIDES */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      {[["Effectif",equipe.length,"#4B7BFF"],["En mission",equipe.filter(e=>e.statut==="En mission").length,"#C9A84C"],["Masse salariale/mois","€"+totalSalaire.toLocaleString("fr"),"#FF5252"],["Perf. moyenne",perfMoy+"%","#2EC9B0"],["Arrêts ce mois",totalArrets,"#FF8C3A"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:`1px solid #1E1E36`,borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c,fontFamily:"Georgia,serif"}}>{v}</div></div>)}
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:"#121222",borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?"#0C0C1A":"transparent",color:onglet===t.id?"#C9A84C":"#5A5A7A",border:onglet===t.id?"1px solid #1E1E36":"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ─── DASHBOARD ─────────────────────────────────────────── */}
    {onglet==="dashboard"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
          <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>📊 Vue d'ensemble équipe</div>
          {equipe.map((e,i)=>{const sc=e.statut==="En mission"?"#C9A84C":e.statut==="Disponible"?"#2EC9B0":"#4B7BFF";return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #1E1E3622"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur,flexShrink:0}}>{e.nom[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:"#EAE6DE"}}>{e.nom}</div>
              <div style={{fontSize:9,color:"#5A5A7A"}}>{e.role}</div>
              <div style={{marginTop:4,height:3,borderRadius:2,background:"#1E1E36",overflow:"hidden"}}><div style={{height:"100%",width:e.perf+"%",background:e.perf>=90?"#2EC9B0":e.perf>=70?"#C9A84C":"#FF8C3A",borderRadius:2}}/></div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,fontWeight:700,color:e.perf>=90?"#2EC9B0":"#C9A84C"}}>{e.perf}%</div>
              <div style={{fontSize:9,padding:"1px 6px",background:sc+"22",color:sc,borderRadius:10,marginTop:2,fontWeight:600}}>{e.statut}</div>
            </div>
          </div>;})}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16}}>
            <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>💸 Répartition masse salariale</div>
            {equipe.map((e,i)=><div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{e.prenom}</span><span style={{color:e.couleur,fontWeight:700}}>{e.salaire.toLocaleString("fr")}€</span></div><div style={{height:4,borderRadius:2,background:"#1E1E36"}}><div style={{height:"100%",width:(e.salaire/totalSalaire*100)+"%",background:e.couleur,borderRadius:2}}/></div></div>)}
            <div style={{marginTop:8,fontSize:11,color:"#C9A84C",fontWeight:700,textAlign:"right"}}>Total : {totalSalaire.toLocaleString("fr")} € net · {Math.round(totalSalaire*1.43).toLocaleString("fr")} € brut</div>
          </div>
          <div style={{background:"#FF525211",border:"1px solid #FF525233",borderRadius:10,padding:14}}>
            <div style={{fontSize:10,color:"#FF5252",fontWeight:600,marginBottom:8}}>🔔 Alertes RH du jour</div>
            {[["⚠️","CDD Abou expire dans 2 mois","Décision CDI requise"],["📅","Visite médicale Thomas","Avant le 30/04/2026"],["📋","Entretien pro Fatou","À planifier avant sept."]].map(([ic,t,d],i)=><div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid #FF525222",fontSize:11}}><span>{ic}</span><div><div style={{color:"#EAE6DE",fontWeight:600}}>{t}</div><div style={{color:"#5A5A7A",fontSize:10}}>{d}</div></div></div>)}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[["🎯 Objectifs atteints","8/12","#2EC9B0"],["🎓 Formations complètes","3/5","#4B7BFF"],["📅 Jours de congés pris","12/52","#C9A84C"]].map(([l,v,c],i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:10,padding:14,textAlign:"center"}}><div style={{fontSize:11,color:"#5A5A7A",marginBottom:4}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
    </div>}

    {/* ─── EQUIPE ────────────────────────────────────────────── */}
    {onglet==="equipe"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
      {equipe.map((e,i)=>{const sc=e.statut==="En mission"?"#C9A84C":e.statut==="Disponible"?"#2EC9B0":"#4B7BFF";return <div key={i} style={{background:"#0C0C1A",border:`1px solid ${sc}33`,borderRadius:12,padding:18,cursor:"pointer"}} onClick={()=>setSel(sel?.id===e.id?null:e)}>
        {/* Avatar + infos */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:e.couleur,flexShrink:0,position:"relative"}}>
            {e.nom[0]}
            <div style={{position:"absolute",bottom:0,right:0,width:14,height:14,borderRadius:"50%",background:sc,border:"2px solid #0C0C1A"}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"#EAE6DE"}}>{e.nom}</div>
            <div style={{fontSize:10,color:"#5A5A7A"}}>{e.role}</div>
            <div style={{fontSize:9,color:"#5A5A7A"}}>📅 Depuis {e.embauche} · <span style={{color:e.contrat==="CDI"?"#2EC9B0":"#4B7BFF",fontWeight:600}}>{e.contrat}</span></div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontSize:9,padding:"2px 8px",background:sc+"22",color:sc,borderRadius:10,fontWeight:600,border:`1px solid ${sc}44`}}>{e.statut}</div></div>
        </div>
        {/* Métriques */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
          {[["Heures/j",e.heures+"h","#4B7BFF"],["Congés",e.soldeConges+"j","#C9A84C"],["Perf",e.perf+"%","#2EC9B0"],["Salaire",e.salaire.toLocaleString("fr")+"€","#C9A84C"]].map(([l,v,c],j)=><div key={j} style={{background:"#121222",borderRadius:6,padding:"6px 4px",textAlign:"center"}}><div style={{fontSize:8,color:"#5A5A7A",marginBottom:2}}>{l}</div><div style={{fontSize:11,fontWeight:700,color:c}}>{v}</div></div>)}
        </div>
        <div style={{height:3,borderRadius:2,background:"#1E1E36",marginBottom:10}}><div style={{height:"100%",width:e.perf+"%",background:e.perf>=90?"#2EC9B0":e.perf>=70?"#C9A84C":"#FF8C3A",borderRadius:2}}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
          {[["💸 Paie",()=>showToast(`✅ Fiche paie ${e.nom} générée`)],["📍 GPS",()=>showToast("📍 GPS ouvert")],["💬 Chat",()=>showToast(`💬 Chat ${e.nom}`)],["📋 Fiche",()=>setSel(sel?.id===e.id?null:e)]].map(([l,fn],j)=><button key={j} onClick={ev=>{ev.stopPropagation();fn();}} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 2px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{l}</button>)}
        </div>
        {/* FICHE COMPLÈTE */}
        {sel?.id===e.id&&<div style={{marginTop:12,borderTop:"1px solid #1E1E3644",paddingTop:12}}>
          <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8,fontWeight:600}}>INFORMATIONS COMPLÈTES</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:10}}>
            {[["📧 Email",e.email],["📱 Tél.",e.tel],["🏠 Adresse",e.adresse],["🎂 Naissance",e.dateNaissance],["🔒 N° SS",e.nss||"Non renseigné"],["🏦 RIB",e.rib||"Non renseigné"]].map(([k,v],j)=><div key={j} style={{background:"#121222",borderRadius:6,padding:"6px 8px"}}><div style={{fontSize:8,color:"#5A5A7A",marginBottom:1}}>{k}</div><div style={{fontSize:10,color:"#EAE6DE",fontWeight:600,wordBreak:"break-all"}}>{v}</div></div>)}
          </div>
          <div style={{fontSize:9,color:"#5A5A7A",marginBottom:4}}>Documents personnels</div>
          {e.documents.map((d,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0",borderBottom:"1px solid #1E1E3622"}}><span>{d.nom}</span><span style={{color:d.statut==="valide"?"#2EC9B0":d.statut==="signé"?"#4B7BFF":"#5A5A7A"}}>{d.statut}{d.expire?" · expire "+d.expire:""}</span></div>)}
        </div>}
      </div>;})}
    </div>}

    {/* ─── OBJECTIFS & KPIs ──────────────────────────────────── */}
    {onglet==="objectifs"&&<div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#5A5A7A"}}>{e.role}</div></div>
          <div style={{fontSize:20,fontWeight:700,color:e.perf>=90?"#2EC9B0":"#C9A84C"}}>{e.perf}%</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {e.objectifs.length>0?e.objectifs.map((obj,j)=>{
            const pct=typeof obj.actuel==="number"&&typeof obj.cible==="number"?Math.min(100,Math.round((obj.actuel/obj.cible)*100)):100;
            const atteint=typeof obj.actuel==="number"?obj.actuel>=obj.cible:true;
            return <div key={j} style={{background:"#121222",borderRadius:8,padding:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:600}}>{obj.obj}</div>
                <div style={{fontSize:11,color:atteint?"#2EC9B0":"#C9A84C",fontWeight:700}}>{atteint?"✅ Atteint":"🎯 En cours"}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:6,borderRadius:3,background:"#1E1E36"}}><div style={{height:"100%",width:pct+"%",background:obj.color,borderRadius:3,transition:"width .3s"}}/></div>
                <div style={{fontSize:10,color:"#5A5A7A",whiteSpace:"nowrap"}}>{typeof obj.actuel==="number"?obj.actuel+" / "+obj.cible:obj.actuel}</div>
              </div>
            </div>;
          }):<div style={{fontSize:11,color:"#5A5A7A",textAlign:"center",padding:12}}>Aucun objectif défini</div>}
        </div>
        <button onClick={()=>showToast(`✅ Objectif ajouté pour ${e.nom}`)} style={{marginTop:10,background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Ajouter un objectif</button>
      </div>)}
    </div>}

    {/* ─── POINTAGE ──────────────────────────────────────────── */}
    {onglet==="pointage"&&<div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["Présents",equipe.length,"#2EC9B0"],["Heures totales",equipe.reduce((a,e)=>a+e.heures,0).toFixed(1)+"h","#4B7BFF"],["Retards","0","#C9A84C"],["Absents","0","#FF5252"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:9,color:"#5A5A7A",marginBottom:4}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Collaborateur","Pointage arrivée","Localisation GPS","Heures/j","Mission en cours","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
        <tbody>{equipe.map((e,i)=>{const sc=e.statut==="En mission"?"#C9A84C":e.statut==="Disponible"?"#2EC9B0":"#4B7BFF";return <tr key={i}>
          <td style={{padding:"10px 10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
              <span style={{fontWeight:600}}>{e.nom}</span>
            </div>
          </td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#2ECDC4",fontWeight:700}}>{e.pointage!=="—"?`✅ ${e.pointage}`:"⏳ En attente"}</td>
          <td style={{padding:"10px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>📍 {e.localisation}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#4B7BFF",fontWeight:700}}>{e.heures}h</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:sc+"22",color:sc,padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>{e.statut}</span></td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>showToast(`📍 ${e.nom} — GPS : ${e.localisation}`)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📍 GPS</button>
              <button onClick={()=>{setEquipe(eq=>eq.map((x,j)=>j===i?{...x,pointage:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})}:x));showToast(`✅ Pointage ${e.nom} enregistré`);}} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>⏰ Pointer</button>
            </div>
          </td>
        </tr>;})}
        </tbody>
      </table>
    </div>}

    {/* ─── CONGES ────────────────────────────────────────────── */}
    {onglet==="conges"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["Congés acquis total",equipe.reduce((a,e)=>a+e.conges,0)+"j","#blue"],["Solde restant",equipe.reduce((a,e)=>a+e.soldeConges,0)+"j","#2EC9B0"],["Pris ce mois","4j","#C9A84C"],["Demandes en attente","2","#FF8C3A"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c||"#4B7BFF"}}>{v}</div></div>)}
      </div>
      <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Soldes par collaborateur</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Collaborateur","Acquis","Pris","Restant","RTT","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
          <tbody>{equipe.map((e,i)=><tr key={i}>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:600}}>{e.nom}</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#4B7BFF",fontWeight:700}}>{e.conges}j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{e.conges-e.soldeConges}j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:e.soldeConges>5?"#2EC9B0":"#FF8C3A",fontWeight:700}}>{e.soldeConges}j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#C9A84C"}}>5j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>{setEquipe(eq=>eq.map((x,j)=>j===i?{...x,soldeConges:Math.max(0,x.soldeConges-1)}:x));showToast(`✅ 1 congé approuvé — ${e.nom}`);}} style={{background:"#2EC9B0",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>✅ Approuver</button>
                <button onClick={()=>showToast("❌ Congé refusé")} style={{background:"transparent",color:"#FF5252",border:"1px solid #FF525233",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>❌ Refuser</button>
              </div>
            </td>
          </tr>)}</tbody>
        </table>
      </div>
      <div style={{background:"#FF8C3A11",border:"1px solid #FF8C3A33",borderRadius:10,padding:14}}>
        <div style={{fontSize:10,color:"#FF8C3A",fontWeight:600,marginBottom:8}}>📋 Demandes en attente</div>
        {[{nom:"Thomas Beaumont",dates:"20-22 mai 2026",jours:3,type:"Congés payés"},{nom:"Abou Diallo",dates:"27 mai 2026",jours:1,type:"Congés payés"}].map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #FF8C3A22",fontSize:12}}>
          <div><span style={{fontWeight:600}}>{d.nom}</span> — {d.dates} ({d.jours}j · {d.type})</div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>showToast(`✅ ${d.nom} — congé approuvé !`)} style={{background:"#2EC9B0",color:"#000",border:"none",borderRadius:5,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Approuver</button>
            <button onClick={()=>showToast("❌ Refusé")} style={{background:"transparent",color:"#FF5252",border:"1px solid #FF525233",borderRadius:5,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Refuser</button>
          </div>
        </div>)}
      </div>
    </div>}

    {/* ─── PLANNING CALENDRIER ───────────────────────────────── */}
    {onglet==="planning_cal"&&<div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700}}>📅 Calendrier des congés — {["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][moisCal-1]} 2026</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setMoisCal(m=>Math.max(1,m-1))} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>← Préc.</button>
          <button onClick={()=>setMoisCal(m=>Math.min(12,m+1))} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>Suiv. →</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:8}}>
        {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j=><div key={j} style={{textAlign:"center",fontSize:9,color:"#5A5A7A",fontWeight:600,padding:"4px 0"}}>{j}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {Array.from({length:30},(_, i)=>{
          const jour=i+1;
          const congeThomas=moisCal===5&&jour>=20&&jour<=22;
          const congeAbou=moisCal===5&&jour===27;
          const weekend=(i+3)%7>=5;
          return <div key={i} style={{background:weekend?"#121222":congeThomas?equipe[0].couleur+"33":congeAbou?equipe[1].couleur+"33":"#121222",border:`1px solid ${congeThomas?equipe[0].couleur+"55":congeAbou?equipe[1].couleur+"55":"#1E1E36"}`,borderRadius:4,padding:"6px 4px",textAlign:"center",minHeight:42}}>
            <div style={{fontSize:11,color:weekend?"#1E1E36":"#EAE6DE",fontWeight:600}}>{jour}</div>
            {congeThomas&&<div style={{fontSize:8,color:equipe[0].couleur,marginTop:2}}>Thomas</div>}
            {congeAbou&&<div style={{fontSize:8,color:equipe[1].couleur,marginTop:2}}>Abou</div>}
          </div>;
        })}
      </div>
      <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap"}}>
        {equipe.map((e,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#5A5A7A"}}><div style={{width:10,height:10,borderRadius:2,background:e.couleur}}/>{e.prenom}</div>)}
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#5A5A7A"}}><div style={{width:10,height:10,borderRadius:2,background:"#121222",border:"1px solid #1E1E36"}}/> Weekend</div>
      </div>
    </div>}

    {/* ─── ARRETS MALADIE ────────────────────────────────────── */}
    {onglet==="arrets"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Arrêts ce mois",totalArrets,"#FF5252"],["Jours perdus",equipe.reduce((a,e)=>a+e.arrets.reduce((b,ar)=>b+ar.jours,0),0)+"j","#FF8C3A"],["Taux absentéisme","2.4%","#C9A84C"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1,fontSize:13,fontWeight:700}}>{e.nom}</div>
          <span style={{fontSize:11,color:e.arrets.length>0?"#FF5252":"#2EC9B0"}}>{e.arrets.length>0?e.arrets.length+" arrêt(s)":"✅ Aucun arrêt"}</span>
        </div>
        {e.arrets.length>0?<table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Début","Fin","Jours","Motif","Justificatif"].map(h=><th key={h} style={{textAlign:"left",padding:"6px 8px",fontSize:9,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
          <tbody>{e.arrets.map((ar,j)=><tr key={j}><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:"#FF5252"}}>{ar.debut}</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622"}}>{ar.fin}</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622",fontWeight:700}}>{ar.jours}j</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622"}}>{ar.motif}</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:"#2EC9B0"}}>{ar.justif}</td></tr>)}</tbody>
        </table>:<div style={{fontSize:11,color:"#5A5A7A",padding:"8px 0"}}>Aucun arrêt maladie enregistré</div>}
        <button onClick={()=>{const ar={debut:new Date().toLocaleDateString("fr"),fin:"—",jours:1,motif:"À préciser",justif:"En attente"};setEquipe(eq=>eq.map((x,j)=>j===i?{...x,arrets:[...x.arrets,ar]}:x));showToast(`✅ Arrêt enregistré pour ${e.nom}`);}} style={{marginTop:10,background:"transparent",color:"#FF5252",border:"1px solid #FF525233",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Déclarer un arrêt</button>
      </div>)}
    </div>}

    {/* ─── PAIE ──────────────────────────────────────────────── */}
    {onglet==="paie"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Masse nette/mois","€"+totalSalaire.toLocaleString("fr"),"#FF5252"],["Charges patronales (~43%)","€"+Math.round(totalSalaire*0.43).toLocaleString("fr"),"#FF8C3A"],["Coût total employeur","€"+Math.round(totalSalaire*1.43).toLocaleString("fr"),"#C9A84C"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Collaborateur","Contrat","Salaire net","Charges soc.","Coût total","Statut","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
          <tbody>{equipe.map((e,i)=><tr key={i}>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:600}}>{e.nom}</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:(e.contrat==="CDI"?"#2EC9B0":"#4B7BFF")+"22",color:e.contrat==="CDI"?"#2EC9B0":"#4B7BFF",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>{e.contrat}</span></td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:700}}>{e.salaire.toLocaleString("fr")} €</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#FF8C3A"}}>{Math.round(e.salaire*0.43).toLocaleString("fr")} €</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#FF5252",fontWeight:700}}>{Math.round(e.salaire*1.43).toLocaleString("fr")} €</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:"#2EC9B022",color:"#2EC9B0",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>✓ À jour</span></td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>showToast(`✅ Fiche de paie ${e.nom} générée !`)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>💸 Fiche</button>
                <button onClick={()=>showToast(`📧 Bulletin envoyé à ${e.email}`)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📧</button>
              </div>
            </td>
          </tr>)}</tbody>
        </table>
      </div>
      <button onClick={()=>showToast("✅ Toutes les fiches de paie générées et envoyées !")} style={{width:"100%",background:"#C9A84C",color:"#000",border:"none",borderRadius:8,padding:"10px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>💸 Générer & Envoyer toutes les fiches de paie — Avril 2026</button>
    </div>}

    {/* ─── CONTRATS ──────────────────────────────────────────── */}
    {onglet==="contrats"&&<div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>📋 Contrats de travail</div>
        <button onClick={()=>showToast("🤖 Contrat IA généré !")} style={{background:"#9B5FFF",color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>🤖 Générer (IA)</button>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Collaborateur","Type","Embauche","Fin prévue","Poste","Salaire","Statut","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
        <tbody>{equipe.map((e,i)=><tr key={i}>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:600}}>{e.nom}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:(e.contrat==="CDI"?"#2EC9B0":"#4B7BFF")+"22",color:e.contrat==="CDI"?"#2EC9B0":"#4B7BFF",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>{e.contrat}</span></td>
          <td style={{padding:"10px",fontSize:10,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{e.embauche}</td>
          <td style={{padding:"10px",fontSize:10,borderBottom:"1px solid #1E1E3622",color:e.contrat==="CDD"?"#FF8C3A":"#5A5A7A"}}>{e.contrat==="CDD"?"15/09/2025":"Indéterminée"}</td>
          <td style={{padding:"10px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{e.role}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#C9A84C",fontWeight:700}}>{e.salaire.toLocaleString("fr")} €</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:"#2EC9B022",color:"#2EC9B0",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>✓ Signé</span></td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>showToast(`📄 Contrat ${e.nom} PDF`)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📄 PDF</button>
              <button onClick={()=>showToast(`📱 Envoyé à ${e.nom}`)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>WA</button>
            </div>
          </td>
        </tr>)}</tbody>
      </table>
    </div>}

    {/* ─── DOCUMENTS RH ──────────────────────────────────────── */}
    {onglet==="documents"&&<div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1,fontSize:13,fontWeight:700}}>{e.nom}</div>
          <button onClick={()=>showToast(`📤 Document ajouté pour ${e.nom}`)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>+ Ajouter document</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
          {e.documents.map((d,j)=><div key={j} style={{background:"#121222",borderRadius:8,padding:10,border:"1px solid #1E1E36"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:600}}>{d.nom}</span>
              <span style={{fontSize:9,background:(d.statut==="valide"||d.statut==="signé")?"#2EC9B022":"#FF525222",color:(d.statut==="valide"||d.statut==="signé")?"#2EC9B0":"#FF5252",padding:"1px 5px",borderRadius:8,fontWeight:600}}>{d.statut}</span>
            </div>
            <div style={{fontSize:9,color:"#5A5A7A",marginBottom:6}}>{d.type}{d.expire?" · Expire : "+d.expire:""}{d.date?" · "+d.date:""}</div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>showToast(`📄 ${d.nom} téléchargé`)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>📥 Voir</button>
              <button onClick={()=>showToast(`📧 Envoyé à ${e.nom}`)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>📧</button>
            </div>
          </div>)}
        </div>
      </div>)}
    </div>}

    {/* ─── ENTRETIENS ────────────────────────────────────────── */}
    {onglet==="entretiens"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>💼 Entretiens & Évaluations</div>
        <button onClick={()=>showToast("✅ Entretien planifié et notification envoyée !")} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"inherit"}}>+ Planifier un entretien</button>
      </div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#5A5A7A"}}>{e.evaluations.length} évaluation(s)</div></div>
          <div style={{fontSize:18,fontWeight:700,color:e.perf>=90?"#2EC9B0":"#C9A84C"}}>{e.perf}%</div>
        </div>
        {e.evaluations.map((ev,j)=><div key={j} style={{background:"#121222",borderRadius:8,padding:12,marginBottom:8,border:"1px solid #1E1E36"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:600}}>Évaluation du {ev.date}</div>
            <div style={{fontSize:16,fontWeight:700,color:ev.note>=90?"#2EC9B0":"#C9A84C"}}>{ev.note}/100</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:11}}>
            <div style={{background:"#2EC9B011",borderRadius:6,padding:8}}><div style={{fontSize:9,color:"#2EC9B0",fontWeight:600,marginBottom:3}}>✅ POINTS FORTS</div><div style={{color:"#EAE6DE"}}>{ev.points}</div></div>
            <div style={{background:"#FF8C3A11",borderRadius:6,padding:8}}><div style={{fontSize:9,color:"#FF8C3A",fontWeight:600,marginBottom:3}}>📈 AXES D'AMÉLIORATION</div><div style={{color:"#EAE6DE"}}>{ev.axes}</div></div>
          </div>
          <div style={{fontSize:10,color:"#5A5A7A",marginTop:6}}>Évaluateur : {ev.evaluateur}</div>
        </div>)}
        <button onClick={()=>showToast(`✅ Nouvelle évaluation créée pour ${e.nom}`)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Nouvelle évaluation</button>
      </div>)}
    </div>}

    {/* ─── FORMATIONS ────────────────────────────────────────── */}
    {onglet==="formations"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Formations complètes",equipe.reduce((a,e)=>a+e.formations.filter(f=>f.statut==="complété").length,0),"#2EC9B0"],["En cours",equipe.reduce((a,e)=>a+e.formations.filter(f=>f.statut==="en cours").length,0),"#4B7BFF"],["À faire",equipe.reduce((a,e)=>a+e.formations.filter(f=>f.statut==="à faire").length,0),"#FF8C3A"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1,fontSize:13,fontWeight:700}}>{e.nom}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {e.formations.map((f,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#121222",borderRadius:7,padding:"8px 12px",border:"1px solid #1E1E36"}}>
            <div><div style={{fontSize:11,fontWeight:600}}>{f.titre}</div><div style={{fontSize:9,color:"#5A5A7A"}}>{f.date}</div></div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {f.score&&<span style={{fontSize:11,fontWeight:700,color:"#2EC9B0"}}>{f.score}%</span>}
              <span style={{fontSize:10,background:f.statut==="complété"?"#2EC9B022":f.statut==="en cours"?"#4B7BFF22":"#FF8C3A22",color:f.statut==="complété"?"#2EC9B0":f.statut==="en cours"?"#4B7BFF":"#FF8C3A",padding:"2px 8px",borderRadius:10,fontWeight:600}}>{f.statut}</span>
              <button onClick={()=>showToast(`▶ Formation "${f.titre}" lancée`)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>{f.statut==="complété"?"↺ Refaire":"▶ Lancer"}</button>
            </div>
          </div>)}
        </div>
        <button onClick={()=>showToast(`✅ Formation ajoutée pour ${e.nom}`)} style={{marginTop:10,background:"transparent",color:"#4B7BFF",border:"1px solid #4B7BFF33",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Assigner une formation</button>
      </div>)}
    </div>}

    {/* ─── EVOLUTION CARRIERE ─────────────────────────────────── */}
    {onglet==="carriere"&&<div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#5A5A7A"}}>Depuis {e.embauche} · Poste actuel : {e.role}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#5A5A7A"}}>Salaire actuel</div><div style={{fontSize:16,fontWeight:700,color:"#C9A84C"}}>{e.salaire.toLocaleString("fr")} €</div></div>
        </div>
        <div style={{position:"relative",paddingLeft:24}}>
          <div style={{position:"absolute",left:8,top:0,bottom:0,width:2,background:"#1E1E36",borderRadius:1}}/>
          {e.carriere.map((c,j)=><div key={j} style={{position:"relative",marginBottom:16}}>
            <div style={{position:"absolute",left:-20,top:4,width:10,height:10,borderRadius:"50%",background:j===e.carriere.length-1?e.couleur:"#1E1E36",border:`2px solid ${e.couleur}`}}/>
            <div style={{background:"#121222",borderRadius:8,padding:10,border:`1px solid ${j===e.carriere.length-1?e.couleur+"44":"#1E1E36"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:12,fontWeight:700,color:j===e.carriere.length-1?e.couleur:"#EAE6DE"}}>{c.poste}</div><div style={{fontSize:9,color:"#5A5A7A"}}>{c.date}</div></div>
                <div style={{fontSize:13,fontWeight:700,color:"#C9A84C"}}>{c.salaire.toLocaleString("fr")} €</div>
              </div>
              {j>0&&<div style={{fontSize:9,color:"#2EC9B0",marginTop:4}}>↗ +{(c.salaire-e.carriere[j-1].salaire).toLocaleString("fr")}€ ({Math.round((c.salaire-e.carriere[j-1].salaire)/e.carriere[j-1].salaire*100)}%)</div>}
            </div>
          </div>)}
        </div>
        <button onClick={()=>showToast(`✅ Promotion ${e.nom} enregistrée !`)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Ajouter une promotion</button>
      </div>)}
    </div>}

    {/* ─── ALERTES RH ────────────────────────────────────────── */}
    {onglet==="alertes"&&<div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[
          {niveau:"critique",icon:"🚨",titre:"CDD Abou Diallo — Expire dans 2 mois",detail:"Contrat CDD expire le 15/09/2025. Décision requise avant le 15/07. Options : conversion CDI ou fin de contrat.",action:"Convertir en CDI",couleur:"#FF5252"},
          {niveau:"urgent",icon:"⚠️",titre:"Visite médicale obligatoire — Thomas Beaumont",detail:"Dernière visite : 01/03/2024. Renouvellement obligatoire avant le 30/04/2026. Médecin du travail à contacter.",action:"Planifier visite",couleur:"#FF8C3A"},
          {niveau:"urgent",icon:"📋",titre:"Entretien professionnel — Tous les collaborateur",detail:"Les entretiens professionnels doivent être réalisés tous les 2 ans. Fatou Sarr : à planifier avant septembre 2026.",action:"Planifier entretien",couleur:"#FF8C3A"},
          {niveau:"info",icon:"📅",titre:"Solde congés — Abou Diallo",detail:"Abou a 15 jours de congés. Encourager la prise avant fin juin pour éviter le report.",action:"Contacter Abou",couleur:"#4B7BFF"},
          {niveau:"info",icon:"🎓",titre:"Formation Abou — Nettoyage yacht à compléter",detail:"Module 'Nettoyage yacht — produits nacrés' assigné et non commencé. Deadline suggérée : 30/04.",action:"Relancer",couleur:"#9B5FFF"},
          {niveau:"good",icon:"✅",titre:"Formation SST — Thomas et Abou à jour",detail:"Certifications Secourisme au Travail valides jusqu'en 2027.",action:null,couleur:"#2EC9B0"},
        ].map((a,i)=><div key={i} style={{background:`${a.couleur}11`,border:`1px solid ${a.couleur}33`,borderRadius:10,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <span>{a.icon}</span>
                <span style={{fontSize:12,fontWeight:700,color:a.couleur}}>{a.titre}</span>
              </div>
              <div style={{fontSize:11,color:"#EAE6DE",lineHeight:1.6,paddingLeft:24}}>{a.detail}</div>
            </div>
            {a.action&&<button onClick={()=>showToast(`✅ Action "${a.action}" enregistrée !`)} style={{background:a.couleur,color:a.niveau==="good"?"#000":"#000",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600,flexShrink:0,marginLeft:12}}>{a.action}</button>}
          </div>
        </div>)}
      </div>
    </div>}

    {/* ─── IA RH ─────────────────────────────────────────────── */}
    {onglet==="ia"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"#9B5FFF11",border:"1px solid #9B5FFF33",borderRadius:12,padding:16}}>
        <div style={{fontSize:10,color:"#9B5FFF",fontWeight:600,marginBottom:8}}>🤖 Analyse RH globale — Claude Sonnet</div>
        <div style={{fontSize:12,color:"#EAE6DE",lineHeight:1.8}}>Votre équipe de 3 personnes performe à {perfMoy}% en moyenne. Thomas est votre meilleur élément (94%) et justifie une prime. Le CDD d'Abou expire bientôt — la conversion en CDI est recommandée au vu de sa progression. Fatou excelle en relation client et pourrait évoluer vers un poste de responsable commerciale.</div>
      </div>
      {[{icon:"📈",titre:"Performance & Rémunération",txt:`Thomas (94%) mérite une augmentation de 200-300€. Abou progresse (+8pts en 3 mois), prévoir une revalorisation à la conversion CDI. Masse salariale actuelle : ${totalSalaire.toLocaleString("fr")}€/mois — raisonnable pour votre CA.`,col:"#2EC9B0"},{icon:"⚖️",titre:"Risques juridiques",txt:"1 risque identifié : CDD Abou Diallo à convertir ou non renouveler sous 2 mois. 1 visite médicale en retard (Thomas). 1 entretien professionnel à planifier (Fatou). Ces 3 points sont prioritaires.",col:"#FF8C3A"},{icon:"🏆",titre:"Recommandation recrutement",txt:"Votre CA +12% justifie un 4ème technicien. Profil idéal : polyvalent, zone Paris Est, 2 000€ net. Retour sur investissement en 3 mois. Publier l'offre sur Indeed + LinkedIn.",col:"#4B7BFF"},{icon:"💡",titre:"Optimisation coûts RH",txt:"Convention collective services à la personne applicable : exonérations URSSAF possibles. Chèques emploi service universels (CESU) pour réduire les charges de 15-20%. À valider avec votre expert-comptable.",col:"#C9A84C"}].map((a,i)=><div key={i} style={{background:`${a.col}11`,border:`1px solid ${a.col}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:11,fontWeight:700,color:a.col,marginBottom:6}}>{a.icon} {a.titre}</div>
        <div style={{fontSize:12,color:"#EAE6DE",lineHeight:1.7}}>{a.txt}</div>
      </div>)}
    </div>}

    {/* ─── JURIDIQUE ─────────────────────────────────────────── */}
    {onglet==="juridique"&&<div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        {[["DPAE (Déclaration préalable à l'embauche)","✅ Faite à chaque embauche","Permanent","#2EC9B0"],["Registre du personnel","✅ À jour — 3 collaborateur","Permanent","#2EC9B0"],["Affichage obligatoire (conventions, harcèlement...)","✅ Conforme","Vérifié 01/04/2026","#2EC9B0"],["Visite médicale — Thomas Beaumont","⚠️ Renouvellement obligatoire","Avant 30/04/2026","#FF8C3A"],["Visite médicale — Abou et Fatou","✅ Effectuées","Valides 12 mois","#2EC9B0"],["Formation sécurité SST — Thomas & Abou","✅ Certifiés","Valide jusqu'en 2027","#2EC9B0"],["Entretien professionnel — Fatou Sarr","⏳ À planifier","Avant 01/09/2026","#4B7BFF"],["Document unique d'évaluation des risques (DUER)","⚠️ À mettre à jour","Avant 30/06/2026","#FF8C3A"],["Mutuelle d'entreprise obligatoire (>1 salarié)","✅ Souscrite — Alan","Active","#2EC9B0"],["Prévoyance collective","✅ Souscrite","Active","#2EC9B0"]].map(([o,s,d,c],i)=><div key={i} style={{background:"#0C0C1A",borderRadius:8,padding:12,border:`1px solid ${c}22`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,fontWeight:600}}>{o}</div><div style={{fontSize:10,color:"#5A5A7A"}}>Échéance : {d}</div></div>
          <span style={{background:c+"22",color:c,padding:"2px 10px",borderRadius:10,fontSize:10,fontWeight:600,border:`1px solid ${c}44`,flexShrink:0,marginLeft:10}}>{s}</span>
        </div>)}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>showToast("📄 Registre du personnel téléchargé")} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"inherit"}}>📄 Registre personnel</button>
        <button onClick={()=>showToast("🤖 Checklist juridique complète générée")} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>🤖 Checklist IA</button>
        <button onClick={()=>showToast("📋 DUER mis à jour par IA")} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>📋 Mettre à jour DUER</button>
      </div>
    </div>}
  </div>;
};
// ─── PAGE PLANNING ────────────────────────────────────────────

export default PageEquipe;
