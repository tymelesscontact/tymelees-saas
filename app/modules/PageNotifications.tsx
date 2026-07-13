"use client";
import { useState, useEffect } from "react";
import { C, Card, Btn, BtnGhost, TH, Td, KPI } from "../lib/ui";

const PageNotifications=({notifs,setNotifs,showToast})=>{
  const[_notifsReal,setNotifsReal]=useState([]);
  const[_autoNotifs,setAutoNotifs]=useState([]);
  const[_prefs,setPrefs]=useState([]);
  const[_nonLus,setNonLus]=useState(0);

  const _loadNotifs=async()=>{
    try{
      const res=await fetch('/api/notifications');
      const data=await res.json();
      if(data.notifications){
        setNotifsReal(data.notifications);
        setAutoNotifs(data.autoNotifs||[]);
        setPrefs(data.preferences||[]);
        setNonLus(data.nonLus||0);
        // Mettre à jour les notifs du composant parent aussi
        if(data.notifications.length>0){
          setNotifs(data.notifications.map(n=>({...n,heure:n.created_at?new Date(n.created_at).toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}):""})));
        }
      }
    }catch(e){console.log("Mode local notifications");}
  };
  const _marquerLu=async(id)=>{
    try{
      await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'marquer_lu',id})});
      _loadNotifs();
      if(id==='all')setNotifs(prev=>prev.map(n=>({...n,lu:true})));
      else setNotifs(prev=>prev.map(n=>n.id===id?{...n,lu:true}:n));
    }catch(e){}
  };
  const _supprimerNotif=async(id)=>{
    try{
      await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer',id})});
      _loadNotifs();
    }catch(e){}
  };
  const _digestQuotidien=async()=>{
    showToast("⏳ Envoi du digest WhatsApp...");
    try{
      const res=await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'digest_quotidien',tel:'+33600000000'})});
      const data=await res.json();
      if(data.success)showToast(`✅ Digest envoyé — ${data.nb} priorité(s)`);
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };
  const _updatePref=async(type,fields)=>{
    try{
      await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'update_preference',type,...fields})});
      _loadNotifs();
    }catch(e){}
  };
  useEffect(()=>{_loadNotifs();},[]);
  const[onglet,setOnglet]=useState("centre");
  const[config,setConfig]=useState({
    paiement:{actif:true,push:true,whatsapp:true,email:true},
    devis:{actif:true,push:true,whatsapp:true,email:false},
    stock:{actif:true,push:true,whatsapp:false,email:false},
    rh:{actif:true,push:false,whatsapp:true,email:true},
    client:{actif:true,push:true,whatsapp:false,email:false},
    systeme:{actif:true,push:true,whatsapp:false,email:false},
  });
  const[filtreType,setFiltreType]=useState("tous");
  const[filtreStatut,setFiltreStatut]=useState("tous");

  const tabs=[{id:"centre",label:"🔔 Centre de notifs"},{id:"config",label:"⚙ Configuration"},{id:"historique",label:"📋 Historique"},{id:"whatsapp",label:"📱 WhatsApp auto"}];

  const marquerLus=()=>setNotifs(ns=>ns.map(n=>({...n,lu:true})));
  const nonLus=notifs.filter(n=>!n.lu).length;

  const typeColor={urgent:C.red,money:C.gold,info:C.blue,good:C.green,stock:C.orange,rh:C.purple};
  const types=["tous","urgent","money","info","good","stock","rh"];

  const filtered=notifs.filter(n=>(filtreType==="tous"||n.type===filtreType)&&(filtreStatut==="tous"||(filtreStatut==="non_lu"&&!n.lu)||(filtreStatut==="lu"&&n.lu)));

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>🔔 Notifications</div>
        <div style={{fontSize:11,color:C.muted}}>Centre · Configuration · WhatsApp auto · Popup temps réel · {nonLus} non lues</div></div>
      <div style={{display:"flex",gap:8}}>
        {nonLus>0&&<BtnGhost onClick={marquerLus}>✓ Tout marquer lu</BtnGhost>}
        <Btn onClick={()=>showToast("🔔 Notification test envoyée !")}>🔔 Tester</Btn>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <KPI label="Non lues" val={nonLus} color={C.red}/>
      <KPI label="Total" val={notifs.length} color={C.blue}/>
      <KPI label="Urgentes" val={notifs.filter(n=>n.type==="urgent").length} color={C.orange}/>
      <KPI label="Financières" val={notifs.filter(n=>n.type==="money").length} color={C.gold}/>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── CENTRE ── */}
    {onglet==="centre"&&<div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {types.map(t=><button key={t} onClick={()=>setFiltreType(t)} style={{background:filtreType===t?typeColor[t]||C.gold:"transparent",color:filtreType===t?"#000":C.muted,border:`1px solid ${filtreType===t?typeColor[t]||C.gold:C.border}`,borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:filtreType===t?700:400,textTransform:"capitalize"}}>{t}</button>)}
        <div style={{marginLeft:"auto",display:"flex",gap:4}}>
          {["tous","non_lu","lu"].map(s=><button key={s} onClick={()=>setFiltreStatut(s)} style={{background:filtreStatut===s?C.card2:"transparent",color:filtreStatut===s?C.gold:C.muted,border:`1px solid ${filtreStatut===s?C.border:"transparent"}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{s==="non_lu"?"Non lus":s==="lu"?"Lus":"Tous"}</button>)}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map((n,i)=><SwipeableNotif key={n.id||i} n={n} i={i} typeColor={typeColor}
          onOpen={()=>{setNotifs(ns=>ns.map((x,j)=>j===i?{...x,lu:true}:x));if(n.id)_marquerLu(n.id);}}
          onDelete={()=>{setNotifs(ns=>ns.filter((x,j)=>j!==i));if(n.id)_supprimerNotif(n.id);else showToast("🗑 Notification supprimée");}}
        />)}
        {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:C.muted}}>✅ Aucune notification pour ce filtre</div>}
      </div>
    </div>}

    {/* ── CONFIG ── */}
    {onglet==="config"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        💡 Les notifications push apparaissent comme des popups en bas à droite de l'écran, même lorsque vous êtes sur une autre page.
      </div>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Type de notification</TH><TH style={{textAlign:"center"}}>Activer</TH><TH style={{textAlign:"center"}}>Push écran</TH><TH style={{textAlign:"center"}}>WhatsApp</TH><TH style={{textAlign:"center"}}>Email</TH></tr></thead>
          <tbody>{Object.entries(config).map(([k,v])=>{const labels={paiement:"💰 Paiements",devis:"◧ Devis",stock:"📦 Stock critique",rh:"👥 RH & Équipe",client:"👤 Clients",systeme:"⚙ Système"};return <tr key={k}>
            <Td style={{fontWeight:600}}>{labels[k]||k}</Td>
            {["actif","push","whatsapp","email"].map(prop=><td key={prop} style={{textAlign:"center",padding:"10px",borderBottom:`1px solid ${C.border}22`}}>
              <div onClick={()=>setConfig(c=>({...c,[k]:{...c[k],[prop]:!c[k][prop]}}))} style={{width:36,height:20,borderRadius:10,background:v[prop]?C.gold:C.border,cursor:"pointer",transition:".2s",position:"relative",margin:"0 auto"}}>
                <div style={{position:"absolute",top:2,left:v[prop]?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:".2s"}}/>
              </div>
            </td>)}
          </tr>;})}
          </tbody>
        </table>
      </Card>
      <Card style={{marginTop:12}}>
        <STitle>⏰ Fréquence des rapports automatiques</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Rapport quotidien WhatsApp","08:00 chaque matin",C.green],["Rapport hebdo email","Lundi 08:00",C.blue],["Alerte stock critique","Immédiat dès détection",C.red],["Résumé paiements","Chaque transaction",C.gold]].map(([l,v,c],i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:10,border:`1px solid ${c}22`}}>
            <div style={{fontSize:11,fontWeight:700,color:c,marginBottom:2}}>{l}</div>
            <div style={{fontSize:10,color:C.muted}}>{v}</div>
          </div>)}
        </div>
      </Card>
    </div>}

    {/* ── HISTORIQUE ── */}
    {onglet==="historique"&&<Card>
      <STitle>📋 Historique complet — 30 derniers jours</STitle>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Icône</TH><TH>Notification</TH><TH>Type</TH><TH>Heure</TH><TH>Statut</TH></tr></thead>
        <tbody>{notifs.map((n,i)=><tr key={i}>
          <Td style={{fontSize:18}}>{n.icon}</Td>
          <Td style={{fontWeight:n.lu?400:700}}>{n.titre}</Td>
          <Td><Pill color={typeColor[n.type]||C.blue}>{n.type}</Pill></Td>
          <Td style={{color:C.muted,fontSize:10}}>{n.heure}</Td>
          <Td><Pill color={n.lu?C.muted:C.gold}>{n.lu?"Lu":"Non lu"}</Pill></Td>
        </tr>)}</tbody>
      </table>
    </Card>}

    {/* ── WHATSAPP AUTO ── */}
    {onglet==="whatsapp"&&<div>
      <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:6}}>📱 BOT WHATSAPP — NOTIFICATIONS AUTOMATIQUES</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>Le bot WhatsApp Xyra envoie automatiquement des notifications à vous et vos clients selon les événements configurés ci-dessous.</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[{evt:"Paiement reçu",msg:"💰 Paiement de {montant} reçu de {client}. Votre wallet Xyra est crédité.",actif:true},{evt:"Devis signé",msg:"✅ {client} vient de signer le devis {id} pour {montant}. Félicitations !",actif:true},{evt:"Stock critique",msg:"⚠️ ALERTE STOCK : {article} est en dessous du seuil minimum ({qte} {u} restants). Commander chez {four}.",actif:true},{evt:"Nouveau lead",msg:"🎯 Nouveau lead soumis par {partenaire} : {entreprise}. Valeur estimée : {ca}€.",actif:true},{evt:"Rappel devis",msg:"📋 Rappel : le devis {id} pour {client} ({montant}) est en attente depuis {jours} jours.",actif:true},{evt:"Mission terminée",msg:"✅ Mission terminée : {service} chez {client}. L'équipe {equipe} a terminé à {heure}.",actif:false}].map((w,i)=><Card key={i} style={{borderColor:w.actif?`${C.green}33`:C.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700}}>{w.evt}</div>
            <div onClick={()=>showToast(w.actif?"🔕 Notification désactivée":"🔔 Notification activée")} style={{width:36,height:20,borderRadius:10,background:w.actif?C.green:C.border,cursor:"pointer",position:"relative",flexShrink:0}}>
              <div style={{position:"absolute",top:2,left:w.actif?18:2,width:16,height:16,borderRadius:"50%",background:"#fff"}}/>
            </div>
          </div>
          <div style={{background:C.dark,borderRadius:6,padding:8,fontSize:10,color:C.muted,fontFamily:"monospace",lineHeight:1.6}}>{w.msg}</div>
          <button onClick={()=>showToast(`📱 Message test "${w.evt}" envoyé sur WhatsApp`)} style={{marginTop:8,background:"transparent",color:C.green,border:`1px solid ${C.green}33`,borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📱 Tester ce message</button>
        </Card>)}
      </div>
    </div>}
  </div>;
};
// ─── PAGE SIGNATURES / CONTRATS ───────────────────────────────

export default PageNotifications;
