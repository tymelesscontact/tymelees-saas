"use client";
import { useState, useEffect } from "react";
import { C, Card, CT, Btn, BtnGhost, TH, Td } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PagePlanning=({plan,showToast,profil,UpgradeWall})=>{
  const[vue,setVue]=useState("semaine");
  const[planning,setPlanning]=useState(PLANNING);
  if(!hasAccess(plan,"planning"))return <div style={{padding:20}}><UpgradeWall page="Planning & Agenda" plan={plan}/></div>;
  const vues=[{id:"jour",label:"Jour"},{id:"semaine",label:"Semaine"},{id:"mois",label:"Mois"},{id:"equipe",label:"Équipe"},{id:"carte",label:"Carte"}];
  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⊡ Planning & {profil?.termes?.rdv||"Agenda"}</div><div style={{fontSize:11,color:C.muted}}>5 vues · IA auto-planifier · Booking · Règles horaires</div></div>
      <div style={{display:"flex",gap:8}}><Btn onClick={()=>showToast("🤖 IA a optimisé le planning !")}>🤖 Auto-planifier</Btn><BtnGhost onClick={()=>showToast("✅ "+(profil?.termes?.mission||"Mission")+" ajoutee")}>+ {profil?.termes?.mission||"Mission"}</BtnGhost></div>
    </div>
    <div style={{marginBottom:16}}><Tabs tabs={vues} active={vue} onChange={setVue}/></div>
    <Card>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Date</TH><TH>Heure</TH><TH>Client</TH><TH>Service</TH><TH>Collaborateur</TH><TH>Durée</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
        <tbody>{planning.map((p,i)=><tr key={i}>
          <Td style={{color:C.gold,fontWeight:600}}>{p.date}</Td>
          <Td style={{color:C.blue,fontWeight:700}}>{p.h}</Td>
          <Td style={{fontWeight:600}}>{p.client}</Td>
          <Td style={{color:C.muted,fontSize:11}}>{p.service}</Td>
          <Td><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:22,height:22,borderRadius:"50%",background:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.blue}}>{p.collab[0]}</div>{p.collab}</div></Td>
          <Td><Pill color={C.blue}>{p.duree}</Pill></Td>
          <Td><St s={p.statut}/></Td>
          <Td><div style={{display:"flex",gap:4}}>
            <BtnGhost onClick={()=>showToast("📱 Rappel envoyé")} style={{fontSize:9,padding:"3px 6px"}}>📱</BtnGhost>
            <BtnGhost onClick={()=>setPlanning(pl=>pl.filter((_,j)=>j!==i))} style={{fontSize:9,padding:"3px 6px",color:C.red}}>✕</BtnGhost>
          </div></Td>
        </tr>)}</tbody>
      </table>
    </Card>
  </div>;
};


// ─── VAPI WIDGET ─────────────────────────────────────────────
const VapiWidget=({showToast,leads=[],profil,tenant})=>{
  const ASSISTANT_ID="715e757d-93e7-423a-a6f1-18a77bb19e94";
  const PHONE_ID="+12526754837";

  const[calls,setCalls]=useState([]);
  const[loading,setLoading]=useState(false);
  const[activeCall,setActiveCall]=useState(null);
  const[onglet,setOnglet]=useState("appel");
  const[prospectForm,setProspectForm]=useState({nom:"",tel:"",societe:"",secteur:"Services",service:""});
  const[campagneActive,setCampagneActive]=useState(false);
  const[campagneProgress,setCampagneProgress]=useState(0);

  // Charger historique appels
  useEffect(()=>{
    const load=async()=>{
      try{
        const r=await fetch('/api/prospection?action=calls');
        const d=await r.json();
        if(d.calls)setCalls(Array.isArray(d.calls)?d.calls:[]);
      }catch(e){console.error('Vapi:',e);}
    };
    load();
    const interval=setInterval(load,15000);
    return()=>clearInterval(interval);
  },[]);

  // Lancer un appel individuel
  const lancerAppel=async()=>{
    if(!prospectForm.tel)return showToast("⚠️ Entrez le numéro de téléphone");
    if(!prospectForm.nom)return showToast("⚠️ Entrez le nom du prospect");
    setLoading(true);
    try{
      const res=await fetch('/api/prospection',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'call',
          tel:prospectForm.tel,
          nom:prospectForm.nom,
          societe:prospectForm.societe||prospectForm.nom,
          secteur:prospectForm.secteur,
          service:prospectForm.service,
          nom_commercial:tenant?.societe||"Xyra",
          phoneNumberId:PHONE_ID,
          assistantId:ASSISTANT_ID,
        }),
      });
      const data=await res.json();
      if(data.success){
        setActiveCall(data.call);
        showToast(`🎙 Lea appelle ${prospectForm.nom} !`);
        setProspectForm(f=>({...f,nom:"",tel:"",societe:"",service:""}));
        setTimeout(async()=>{
          const r=await fetch('/api/prospection?action=calls');
          const d=await r.json();
          if(d.calls)setCalls(Array.isArray(d.calls)?d.calls:[]);
        },3000);
      }else{
        showToast("❌ Erreur : "+( data.error||"Vérifiez la config Vapi"));
      }
    }catch(e){showToast("❌ Erreur connexion Vapi");}
    setLoading(false);
  };

  // Appeler depuis un lead SIRENE
  const appellerLead=async(lead)=>{
    if(!lead.tel)return showToast("⚠️ Ce lead n'a pas de numéro");
    setLoading(true);
    try{
      const res=await fetch('/api/prospection',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'call',
          tel:lead.tel,
          nom:lead.nom,
          societe:lead.nom,
          secteur:lead.secteur||profil?.label||"Services",
          service:profil?.services?.[0]||"",
          nom_commercial:tenant?.societe||"Xyra",
          phoneNumberId:PHONE_ID,
          assistantId:ASSISTANT_ID,
        }),
      });
      const data=await res.json();
      if(data.success){
        showToast(`🎙 Lea appelle ${lead.nom} !`);
      }else{
        showToast("❌ "+( data.error||"Erreur Vapi"));
      }
    }catch(e){showToast("❌ Erreur connexion");}
    setLoading(false);
  };

  // Campagne automatique sur tous les leads
  const lancerCampagne=async()=>{
    if(leads.length===0)return showToast("⚠️ Aucun lead disponible — faites d'abord une recherche SIRENE");
    const leadsValides=leads.filter(l=>l.tel);
    if(leadsValides.length===0)return showToast("⚠️ Aucun lead avec numéro de téléphone");
    setCampagneActive(true);
    setCampagneProgress(0);
    let nb=0;
    for(const lead of leadsValides.slice(0,10)){
      try{
        await fetch('/api/prospection',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            action:'call',
            tel:lead.tel,
            nom:lead.nom,
            societe:lead.nom,
            secteur:lead.secteur||profil?.label||"Services",
            service:profil?.services?.[0]||"",
            nom_commercial:tenant?.societe||"Xyra",
            phoneNumberId:PHONE_ID,
            assistantId:ASSISTANT_ID,
          }),
        });
        nb++;
        setCampagneProgress(Math.round((nb/leadsValides.slice(0,10).length)*100));
        await new Promise(r=>setTimeout(r,2000));
      }catch(e){}
    }
    setCampagneActive(false);
    showToast(`✅ Campagne terminée — ${nb} appels lancés par Lea !`);
    const r=await fetch('/api/prospection?action=calls');
    const d=await r.json();
    if(d.calls)setCalls(Array.isArray(d.calls)?d.calls:[]);
  };

  const tabs=[{id:"appel",label:"📞 Appel direct"},{id:"leads",label:"🎯 Leads"},{id:"campagne",label:"🚀 Campagne"},{id:"historique",label:"📋 Historique"}];

  return <div>
    {/* Header Lea */}
    <div style={{background:`linear-gradient(135deg,${C.purple}22,${C.card})`,border:`1px solid ${C.purple}44`,borderRadius:12,padding:16,marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:52,height:52,borderRadius:"50%",background:`${C.purple}33`,border:`2px solid ${C.purple}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🎙</div>
      <div style={{flex:1}}>
        <div style={{fontSize:15,fontWeight:700,color:C.text}}>Lea — Agent Vocal IA</div>
        <div style={{fontSize:11,color:C.muted}}>Propulsé par Vapi · Multilingue · Appels sortants & entrants</div>
        <div style={{display:"flex",gap:8,marginTop:6}}>
          <div style={{fontSize:10,background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`,borderRadius:20,padding:"2px 8px"}}>● Agent actif</div>
          <div style={{fontSize:10,background:`${C.blue}22`,color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:20,padding:"2px 8px"}}>📞 {PHONE_ID}</div>
          <div style={{fontSize:10,background:`${C.gold}22`,color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:20,padding:"2px 8px"}}>{calls.filter(c=>c.status==="ended").length} appels complétés</div>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div style={{display:"flex",gap:4,marginBottom:14,background:C.card2,borderRadius:8,padding:4}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{flex:1,background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.purple:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"6px 4px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?700:400}}>{t.label}</button>)}
    </div>

    {/* APPEL DIRECT */}
    {onglet==="appel"&&<div>
      <CT style={{marginBottom:12}}>
        <STitle>📞 Lancer un appel avec Lea</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Nom du prospect *</label>
            <Inp value={prospectForm.nom} onChange={e=>setProspectForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: M. Dupont"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Téléphone * (format international)</label>
            <Inp value={prospectForm.tel} onChange={e=>setProspectForm(f=>({...f,tel:e.target.value}))} placeholder="Ex: +33612345678"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Société</label>
            <Inp value={prospectForm.societe} onChange={e=>setProspectForm(f=>({...f,societe:e.target.value}))} placeholder="Nom de la société"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Service à présenter</label>
            <Inp value={prospectForm.service} onChange={e=>setProspectForm(f=>({...f,service:e.target.value}))} placeholder="Ex: Nettoyage bureaux"/>
          </div>
        </div>
        {/* Bouton appel */}
        <button onClick={lancerAppel} disabled={loading||!prospectForm.tel||!prospectForm.nom} style={{width:"100%",background:loading?C.muted:`linear-gradient(135deg,${C.purple},#6B3FCC)`,color:"#fff",border:"none",borderRadius:8,padding:"13px",cursor:loading?"not-allowed":"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          {loading?<>⏳ Lea est en train d'appeler...</>:<>🎙 Lea appelle maintenant</>}
        </button>
        {activeCall&&<div style={{marginTop:10,background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>
          ● Appel en cours — ID: {activeCall.id?.slice(0,12)}...
        </div>}
      </CT>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}22`,borderRadius:8,padding:10,fontSize:11,color:C.muted}}>
        💡 Lea se présentera comme l'assistante de <b style={{color:C.text}}>{tenant?.societe||"votre société"}</b> et adaptera son discours à votre secteur automatiquement.
      </div>
    </div>}

    {/* LEADS */}
    {onglet==="leads"&&<div>
      {leads.length===0?<div style={{textAlign:"center",padding:30,color:C.muted}}>
        <div style={{fontSize:32,marginBottom:8}}>🎯</div>
        <div>Faites d'abord une recherche SIRENE dans l'onglet ci-dessus pour voir les leads ici</div>
      </div>:<div>
        <div style={{fontSize:11,color:C.muted,marginBottom:10}}>{leads.length} leads disponibles · Cliquez pour appeler avec Lea</div>
        {leads.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${C.border}`}}>
          <div>
            <div style={{fontSize:12,fontWeight:700}}>{l.nom}</div>
            <div style={{fontSize:10,color:C.muted}}>{l.secteur} · {l.ville}</div>
            <div style={{fontSize:10,color:l.tel?C.green:C.red}}>{l.tel||"⚠️ Pas de numéro"}</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{fontSize:10,background:`${l.score>=80?C.green:C.gold}22`,color:l.score>=80?C.green:C.gold,border:`1px solid ${l.score>=80?C.green:C.gold}44`,borderRadius:20,padding:"2px 8px"}}>★ {l.score}</div>
            <button onClick={()=>appellerLead(l)} disabled={loading||!l.tel} style={{background:l.tel?C.purple:"#333",color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",cursor:l.tel?"pointer":"not-allowed",fontSize:11,fontFamily:"inherit",fontWeight:600}}>🎙 Appeler</button>
          </div>
        </div>)}
      </div>}
    </div>}

    {/* CAMPAGNE */}
    {onglet==="campagne"&&<div>
      <CT style={{marginBottom:12}}>
        <STitle>🚀 Campagne d'appels automatique</STitle>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.7,marginBottom:14}}>
          Lea appelle automatiquement tous les leads de votre liste SIRENE. Elle se présente, qualifie et fixe des RDV en votre nom. Maximum 10 appels par campagne avec 2 secondes entre chaque appel.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Leads disponibles</div><div style={{fontSize:20,fontWeight:700,color:C.blue}}>{leads.length}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Avec téléphone</div><div style={{fontSize:20,fontWeight:700,color:C.green}}>{leads.filter(l=>l.tel).length}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Max campagne</div><div style={{fontSize:20,fontWeight:700,color:C.gold}}>10</div></CT>
        </div>
        {campagneActive&&<div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:C.purple,marginBottom:6}}>🎙 Campagne en cours — {campagneProgress}%</div>
          <div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:campagneProgress+"%",background:C.purple,borderRadius:4,transition:"width .5s"}}/>
          </div>
        </div>}
        <button onClick={lancerCampagne} disabled={campagneActive||leads.filter(l=>l.tel).length===0} style={{width:"100%",background:campagneActive?C.muted:`linear-gradient(135deg,${C.purple},#6B3FCC)`,color:"#fff",border:"none",borderRadius:8,padding:"13px",cursor:campagneActive?"not-allowed":"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit"}}>
          {campagneActive?`⏳ Campagne en cours — ${campagneProgress}%`:`🚀 Lancer la campagne (${Math.min(10,leads.filter(l=>l.tel).length)} appels)`}
        </button>
      </CT>
      <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>
        ⚠️ Assurez-vous d'avoir des leads avec numéros de téléphone. Faites d'abord une recherche SIRENE.
      </div>
    </div>}

    {/* HISTORIQUE */}
    {onglet==="historique"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
        <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Total appels</div><div style={{fontSize:20,fontWeight:700,color:C.blue}}>{calls.length}</div></CT>
        <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Complétés</div><div style={{fontSize:20,fontWeight:700,color:C.green}}>{calls.filter(c=>c.status==="ended").length}</div></CT>
        <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Durée moy.</div><div style={{fontSize:20,fontWeight:700,color:C.gold}}>{calls.length>0?Math.round(calls.reduce((a,c)=>a+(c.duration||0),0)/calls.length)+"s":"—"}</div></CT>
      </div>
      {calls.length===0?<div style={{textAlign:"center",padding:30,color:C.muted}}>
        <div style={{fontSize:32,marginBottom:8}}>📋</div>
        <div>Aucun appel pour le moment</div>
      </div>:calls.slice(0,20).map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
        <div>
          <div style={{fontWeight:600}}>{c.customer?.name||c.customer?.number||"—"}</div>
          <div style={{fontSize:10,color:C.muted}}>{c.createdAt?new Date(c.createdAt).toLocaleString("fr"):"—"}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {c.duration&&<span style={{fontSize:10,color:C.muted}}>{c.duration}s</span>}
          <div style={{fontSize:10,background:c.status==="ended"?`${C.green}22`:c.status==="in-progress"?`${C.gold}22`:`${C.red}22`,color:c.status==="ended"?C.green:c.status==="in-progress"?C.gold:C.red,border:`1px solid ${c.status==="ended"?C.green:c.status==="in-progress"?C.gold:C.red}44`,borderRadius:20,padding:"2px 8px"}}>
            {c.status==="ended"?"✓ Terminé":c.status==="in-progress"?"● En cours":"✗ "+c.status}
          </div>
          <BtnGhost onClick={()=>showToast("📋 Résumé appel copié")} style={{fontSize:9,padding:"3px 8px"}}>Résumé</BtnGhost>
        </div>
      </div>)}
    </div>}
  </div>;
};

// ─── RELANCEIA WIDGET ─────────────────────────────────────────
const RelanceIAWidget=({showToast})=>{
  const[sequences,setSequences]=useState([]);
  const[stats,setStats]=useState(null);
  const[loading,setLoading]=useState(false);
  const[contactForm,setContactForm]=useState({email:"",prenom:"",nom:"",societe:"",tel:"",secteur:"",sequenceId:""});

  useEffect(()=>{
    const loadRelance=async()=>{
      try{
        const[s,st]=await Promise.all([
          fetch('/api/prospection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'relance_sequences'})}).then(r=>r.json()),
          fetch('/api/prospection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'relance_stats'})}).then(r=>r.json()),
        ]);
        if(s.sequences)setSequences(s.sequences);
        if(st.stats)setStats(st.stats);
      }catch(e){console.error('RelanceIA:',e);}
    };
    loadRelance();
  },[]);

  const lancerSequence=async()=>{
    if(!contactForm.email||!contactForm.sequenceId)return showToast("⚠️ Email et séquence requis");
    setLoading(true);
    try{
      const res=await fetch('/api/prospection',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'relance_sequence',...contactForm}),
      });
      const data=await res.json();
      if(data.success)showToast(`✅ Séquence lancée pour ${contactForm.email} !`);
      else showToast("❌ Erreur RelanceIA");
    }catch(e){showToast("❌ Erreur RelanceIA");}
    setLoading(false);
  };

  return <div style={{marginTop:14}}>
    {stats&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
      <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Emails envoyés</div><div style={{fontSize:16,fontWeight:700,color:C.blue}}>{stats.sent||0}</div></CT>
      <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Taux ouverture</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{stats.open_rate||"—"}</div></CT>
      <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Réponses</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{stats.replies||0}</div></CT>
    </div>}

    <CT>
      <STitle>📧 Lancer une séquence RelanceIA</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Email *","email"],["Prénom","prenom"],["Société","societe"],["Téléphone","tel"]].map(([l,k])=><div key={k}>
          <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>{l}</label>
          <input value={contactForm[k]} onChange={e=>setContactForm(f=>({...f,[k]:e.target.value}))} placeholder={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:5,padding:"6px 8px",color:C.text,fontSize:11,fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
        </div>)}
        <div style={{gridColumn:"span 2"}}>
          <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Séquence *</label>
          <select value={contactForm.sequenceId} onChange={e=>setContactForm(f=>({...f,sequenceId:e.target.value}))} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:5,padding:"6px 8px",color:C.text,fontSize:11,fontFamily:"inherit",width:"100%"}}>
            <option value="">Sélectionner une séquence...</option>
            {sequences.map((s,i)=><option key={i} value={s.id}>{s.name}</option>)}
            {sequences.length===0&&<option value="default">Séquence par défaut</option>}
          </select>
        </div>
      </div>
      <Btn onClick={lancerSequence} style={{width:"100%"}} disabled={loading}>
        {loading?"⏳ Envoi en cours...":"📧 Lancer la séquence"}
      </Btn>
    </CT>
  </div>;
};


// ─── PAGE LEA — DASHBOARD AGENT VOCAL ────────────────────────

export default PagePlanning;
