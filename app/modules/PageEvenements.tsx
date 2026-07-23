"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp, Sel, SM } from "../lib/ui";
import { EVENEMENTS } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageEvenements=({plan,showToast,UpgradeWall,activeCompany})=>{
  const[evts,setEvts]=useState(EVENEMENTS);
  const[loading,setLoading]=useState(true);
  const[onglet,setOnglet]=useState("liste");
  const[showForm,setShowForm]=useState(false);
  const[analyseROI,setAnalyseROI]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[selectedEvt,setSelectedEvt]=useState(null);
  const[inscrits,setInscrits]=useState([]);
  const[showInscription,setShowInscription]=useState(false);
  const[inscriptionForm,setInscriptionForm]=useState({nom:"",email:"",tel:""});
  const[newEvt,setNewEvt]=useState({titre:"",description:"",date_debut:"",date_fin:"",lieu:"",type:"présentiel",prix:0,max_inscrits:50,club_only:false});

  const load=async()=>{
    setLoading(true);
    try{
      const companyParam=activeCompany?.id?`&company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/evenements?action=list'+companyParam);
      const d=await res.json();
      if(d.evenements&&d.evenements.length>0)setEvts(d.evenements);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[activeCompany]);

  const creerEvenement=async()=>{
    if(!newEvt.titre||!newEvt.date_debut)return showToast("⚠️ Titre et date requis");
    try{
      const res=await fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',...newEvt})});
      const d=await res.json();
      if(d.success){showToast("✅ Événement créé !");setShowForm(false);setNewEvt({titre:"",description:"",date_debut:"",date_fin:"",lieu:"",type:"présentiel",prix:0,max_inscrits:50,club_only:false});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  const sInscrire=async()=>{
    if(!inscriptionForm.nom)return showToast("⚠️ Nom requis");
    if(!selectedEvt)return;
    try{
      const res=await fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'inscrire',evenement_id:selectedEvt.id,...inscriptionForm})});
      const d=await res.json();
      if(d.success){showToast("✅ Inscription confirmée ! WhatsApp envoyé.");setShowInscription(false);setInscriptionForm({nom:"",email:"",tel:""});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  const chargerInscrits=async(evtId)=>{
    try{
      const res=await fetch(`/api/evenements?action=inscrits&event_id=${evtId}`);
      const d=await res.json();
      setInscrits(d.inscrits||[]);
    }catch(e){}
  };

  const inviterReseau=async(evt)=>{
    showToast("⏳ Envoi des invitations WhatsApp...");
    try{
      const res=await fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'inviter_reseau',...evt})});
      const d=await res.json();
      if(d.success)showToast("✅ Invitations WhatsApp envoyées au réseau");
    }catch(e){showToast("❌ Erreur");}
  };

  const analyserROI=async()=>{
    setIaLoading(true);
    try{
      const res=await fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_roi',evenements:evts})});
      const d=await res.json();
      if(d.success)setAnalyseROI(d.analyse);
    }catch(e){}
    setIaLoading(false);
  };

  const genererQR=(evt)=>{
    const url=`https://xyraio.fr/events/${evt.id||evt.titre?.replace(/\s/g,'-')}`;
    showToast(`📲 QR Code : ${url} — copié !`);
    navigator.clipboard?.writeText(url);
  };

  if(!hasAccess(plan,"evenements"))return <div style={{padding:20}}><UpgradeWall page="Événements" plan={plan}/></div>;

  const tabs=[
    {id:"liste",label:"📅 Événements"},
    {id:"calendrier",label:"🗓 Calendrier"},
    {id:"inscrits",label:"👥 Inscrits"},
    {id:"roi",label:"🤖 ROI & Analyse IA"},
  ];

  const totalInscrits=evts.reduce((a,e)=>a+Number(e.inscrits||0),0);
  const totalCA=evts.reduce((a,e)=>a+Number(e.inscrits||0)*Number(e.prix||0),0);
  const tauxRemplissage=evts.length>0?Math.round(evts.reduce((a,e)=>a+(Number(e.inscrits||0)/Math.max(1,Number(e.max_inscrits||50))),0)/evts.length*100):0;

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◆ Événements</div>
        <div style={{fontSize:11,color:C.muted}}>Networking · Visio · QR Code · Inscriptions · WhatsApp · ROI IA</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={()=>fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rappels'})}).then(()=>showToast("✅ Rappels J-7/J-1 envoyés"))} style={{fontSize:11}}>🔔 Rappels WhatsApp</BtnGhost>
        <Btn onClick={()=>setShowForm(true)}>+ Créer un événement</Btn>
      </div>
    </div>

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>ÉVÉNEMENTS</div><div style={{fontSize:22,fontWeight:700,color:C.blue}}>{evts.length}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>TOTAL INSCRITS</div><div style={{fontSize:22,fontWeight:700,color:C.green}}>{totalInscrits}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>TAUX REMPLISSAGE</div><div style={{fontSize:22,fontWeight:700,color:tauxRemplissage>=80?C.green:tauxRemplissage>=50?C.gold:C.orange}}>{tauxRemplissage}%</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CA ÉVÉNEMENTS</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(totalCA)}</div></CT>
    </div>

    {/* FORM CRÉATION */}
    {showForm&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>+ Créer un événement</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Titre *</label><Inp value={newEvt.titre} onChange={e=>setNewEvt(v=>({...v,titre:e.target.value}))} placeholder="Ex: Dîner privé Xyra Club — Paris"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Date début *</label><Inp type="datetime-local" value={newEvt.date_debut} onChange={e=>setNewEvt(v=>({...v,date_debut:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Date fin</label><Inp type="datetime-local" value={newEvt.date_fin} onChange={e=>setNewEvt(v=>({...v,date_fin:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Lieu</label><Inp value={newEvt.lieu} onChange={e=>setNewEvt(v=>({...v,lieu:e.target.value}))} placeholder="Paris, Visio, Dubaï..."/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Type</label>
          <Sel value={newEvt.type} onChange={e=>setNewEvt(v=>({...v,type:e.target.value}))}>
            <option value="présentiel">Présentiel</option>
            <option value="visio">Visio</option>
            <option value="hybride">Hybride</option>
            <option value="vip">VIP privé</option>
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Prix (€, 0 = gratuit)</label><Inp type="number" value={newEvt.prix} onChange={e=>setNewEvt(v=>({...v,prix:Number(e.target.value)}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Capacité max</label><Inp type="number" value={newEvt.max_inscrits} onChange={e=>setNewEvt(v=>({...v,max_inscrits:Number(e.target.value)}))}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Description</label><Inp value={newEvt.description} onChange={e=>setNewEvt(v=>({...v,description:e.target.value}))} placeholder="Décrivez l'événement..."/></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input type="checkbox" id="club_only" checked={newEvt.club_only} onChange={e=>setNewEvt(v=>({...v,club_only:e.target.checked}))} style={{accentColor:C.gold}}/>
          <label htmlFor="club_only" style={{fontSize:11,color:C.muted,cursor:"pointer"}}>🏢 Réservé aux membres Club d'affaires</label>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={creerEvenement}>✅ Créer l'événement</Btn><BtnGhost onClick={()=>setShowForm(false)}>Annuler</BtnGhost></div>
    </Card>}

    {/* FORM INSCRIPTION */}
    {showInscription&&selectedEvt&&<Card style={{marginBottom:14,borderColor:`${C.green}44`}}>
      <STitle>🎟 S'inscrire — {selectedEvt.titre}</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={inscriptionForm.nom} onChange={e=>setInscriptionForm(f=>({...f,nom:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email</label><Inp value={inscriptionForm.email} onChange={e=>setInscriptionForm(f=>({...f,email:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>WhatsApp</label><Inp value={inscriptionForm.tel} onChange={e=>setInscriptionForm(f=>({...f,tel:e.target.value}))} placeholder="+33..."/></div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={sInscrire} style={{background:C.green}}>✅ Confirmer l'inscription</Btn><BtnGhost onClick={()=>setShowInscription(false)}>Annuler</BtnGhost></div>
    </Card>}

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── LISTE ── */}
    {onglet==="liste"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
      {evts.map((e,i)=><Card key={i} style={{borderColor:e.statut==="complet"?`${C.red}44`:e.club_only?`${C.gold}44`:`${C.gold}22`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
          <div style={{display:"flex",gap:6}}>
            <Pill color={e.statut==="ouvert"?C.green:C.red}>{e.statut==="ouvert"?"🟢 Ouvert":"🔴 Complet"}</Pill>
            {e.club_only&&<Pill color={C.gold}>🏢 Club</Pill>}
            {e.type&&<Pill color={C.blue}>{e.type}</Pill>}
          </div>
          <div style={{fontSize:12,color:C.gold,fontWeight:700}}>{Number(e.prix||0)===0?"Gratuit":fmt(Number(e.prix||0))}</div>
        </div>
        <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>{e.titre}</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:2}}>📅 {e.date_debut?new Date(e.date_debut).toLocaleDateString("fr",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):e.date}</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:10}}>📍 {e.lieu}</div>
        {e.description&&<div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.5}}>{(e.description||"").slice(0,80)}{(e.description||"").length>80?"...":""}</div>}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:3}}>
            <span style={{color:C.muted}}>Inscriptions</span>
            <span style={{color:C.gold,fontWeight:700}}>{e.inscrits||0}/{e.max||e.max_inscrits||50}</span>
          </div>
          <SM val={Number(e.inscrits||0)} max={Number(e.max||e.max_inscrits||50)} color={Number(e.inscrits||0)===Number(e.max||e.max_inscrits||50)?C.red:C.green}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <Btn onClick={()=>{setSelectedEvt(e);setShowInscription(true);}} style={{flex:1,fontSize:11,background:e.statut==="complet"?C.border:C.green,color:e.statut==="complet"?C.muted:"#000"}} disabled={e.statut==="complet"}>🎟 S'inscrire</Btn>
          <BtnGhost onClick={()=>genererQR(e)} style={{fontSize:11}}>📲 QR</BtnGhost>
          {(e.type==="visio"||e.type==="hybride")&&<BtnGhost onClick={()=>showToast("🎥 Visio Jitsi lancée !")} style={{fontSize:11}}>🎥 Visio</BtnGhost>}
          <BtnGhost onClick={()=>inviterReseau(e)} style={{fontSize:11}}>📱 Inviter</BtnGhost>
          <BtnGhost onClick={()=>{setSelectedEvt(e);chargerInscrits(e.id);setOnglet("inscrits");}} style={{fontSize:11}}>👥</BtnGhost>
        </div>
      </Card>)}
      {evts.length===0&&<Card style={{textAlign:"center",padding:30,gridColumn:"1/-1"}}>
        <div style={{fontSize:32,marginBottom:8}}>📅</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucun événement</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Créez votre premier événement networking pour votre réseau.</div>
        <Btn onClick={()=>setShowForm(true)}>+ Créer un événement</Btn>
      </Card>}
    </div>}

    {/* ── CALENDRIER ── */}
    {onglet==="calendrier"&&<Card>
      <STitle>🗓 Calendrier événements</STitle>
      {evts.length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucun événement à afficher.</div>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[...evts].sort((a,b)=>new Date(a.date_debut||a.date||0).getTime()-new Date(b.date_debut||b.date||0).getTime()).map((e,i)=>{
          const d=e.date_debut?new Date(e.date_debut):null;
          return <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 12px",background:C.card2,borderRadius:8,border:`1px solid ${C.border}`}}>
            {d&&<div style={{textAlign:"center",minWidth:48,background:`${C.gold}22`,borderRadius:8,padding:"6px 4px"}}>
              <div style={{fontSize:18,fontWeight:700,color:C.gold}}>{d.getDate()}</div>
              <div style={{fontSize:9,color:C.muted}}>{d.toLocaleDateString("fr",{month:"short"}).toUpperCase()}</div>
            </div>}
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700}}>{e.titre}</div>
              <div style={{fontSize:10,color:C.muted}}>{e.lieu} · {e.inscrits||0}/{e.max||e.max_inscrits||50} inscrits</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <Pill color={e.statut==="ouvert"?C.green:C.red}>{e.statut==="ouvert"?"Ouvert":"Complet"}</Pill>
              {e.type&&<Pill color={C.blue}>{e.type}</Pill>}
            </div>
          </div>;
        })}
      </div>}
    </Card>}

    {/* ── INSCRITS ── */}
    {onglet==="inscrits"&&<div>
      {selectedEvt&&<div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:C.gold}}>{selectedEvt.titre}</div>
        <div style={{fontSize:11,color:C.muted}}>{selectedEvt.inscrits||0} inscrits · {selectedEvt.lieu}</div>
      </div>}
      {!selectedEvt&&<div style={{fontSize:12,color:C.muted,marginBottom:12}}>Clique sur 👥 d'un événement pour voir ses inscrits.</div>}
      {inscrits.length===0?<Card style={{textAlign:"center",padding:20}}>
        <div style={{fontSize:11,color:C.muted}}>Aucun inscrit pour cet événement.</div>
      </Card>:<Card>
        <STitle>👥 Liste des inscrits — {selectedEvt?.titre}</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Nom</TH><TH>Email</TH><TH>WhatsApp</TH><TH>Statut</TH><TH>Check-in</TH></tr></thead>
          <tbody>{inscrits.map((ins,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{ins.nom}</Td>
            <Td style={{fontSize:11,color:C.muted}}>{ins.email||"—"}</Td>
            <Td style={{fontSize:11,color:C.muted}}>{ins.tel||"—"}</Td>
            <Td><Pill color={ins.statut==="présent"?C.green:ins.statut==="confirmé"?C.blue:C.orange}>{ins.statut}</Pill></Td>
            <Td>
              {ins.statut!=="présent"?<Btn onClick={()=>fetch('/api/evenements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'checkin',inscrit_id:ins.id})}).then(()=>{showToast("✅ Check-in effectué");chargerInscrits(selectedEvt?.id);})} style={{fontSize:10,padding:"4px 8px",background:C.green}}>✅ Check-in</Btn>:<span style={{fontSize:11,color:C.green}}>✅ Présent</span>}
            </Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── ROI & ANALYSE IA ── */}
    {onglet==="roi"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse ROI événementiel — Claude</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseROI||"Lance l'analyse pour obtenir des recommandations sur le ROI de tes événements."}</div>}
        <BtnGhost onClick={analyserROI} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🤖 Analyser le ROI"}</BtnGhost>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>📊 Performance événements</STitle>
          {[["Total événements",evts.length,C.blue],["Total inscrits",totalInscrits,C.green],["Taux de remplissage moyen",tauxRemplissage+"%",tauxRemplissage>=70?C.green:C.gold],["CA généré",fmt(totalCA),C.gold],["Événements Club",evts.filter(e=>e.club_only).length,C.purple],["Événements visio",evts.filter(e=>e.type==="visio"||e.type==="hybride").length,C.teal]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
            <span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span>
          </div>)}
        </Card>
        <Card>
          <STitle>🏆 Top événements par remplissage</STitle>
          {[...evts].sort((a,b)=>(Number(b.inscrits||0)/Math.max(1,Number(b.max||b.max_inscrits||50)))-(Number(a.inscrits||0)/Math.max(1,Number(a.max||a.max_inscrits||50)))).slice(0,5).map((e,i)=>{
            const pct=Math.round(Number(e.inscrits||0)/Math.max(1,Number(e.max||e.max_inscrits||50))*100);
            return <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{e.titre.slice(0,30)}{e.titre.length>30?"...":""}</span><span style={{color:pct>=80?C.green:C.gold,fontWeight:700}}>{pct}%</span></div>
              <SM val={pct} max={100} color={pct>=80?C.green:C.gold}/>
            </div>;
          })}
        </Card>
      </div>
    </div>}
  </div>;
};


// ─── PAGE SCORING / NPS ───────────────────────────────────────

export default PageEvenements;
