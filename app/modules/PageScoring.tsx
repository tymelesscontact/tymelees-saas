"use client";
import { useState, useEffect } from "react";
import { C, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp, Sel, SM, St, inits } from "../lib/ui";
import { AVIS } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageScoring=({plan,showToast,profil,UpgradeWall,activeCompany})=>{
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[onglet,setOnglet]=useState("dashboard");
  const[showAjoutAvis,setShowAjoutAvis]=useState(false);
  const[showNPS,setShowNPS]=useState(false);
  const[showCSAT,setShowCSAT]=useState(false);
  const[analyseConc,setAnalyseConc]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[reponseIA,setReponseIA]=useState({});
  const[avisForm,setAvisForm]=useState({client_nom:"",note:5,commentaire:"",service:"",source:"direct",google:false});
  const[npsForm,setNpsForm]=useState({client_nom:"",client_email:"",score:8,commentaire:""});
  const[csatForm,setCsatForm]=useState({client_nom:"",service:"",score:4,commentaire:""});
  const[demandeForm,setDemandeForm]=useState({client_tel:"",client_nom:"",service:""});

  const AVIS_DEFAUT=[
    {id:"a1",client_nom:"Sophie M.",note:5,commentaire:"Service impeccable, réactivité exceptionnelle. Je recommande vivement !",service:"Airbnb Paris",source:"google",google:true,sentiment:"positif",statut:"répondu",date_avis:new Date().toISOString()},
    {id:"a2",client_nom:"Jean-Pierre L.",note:4,commentaire:"Très bon service globalement, quelques petits détails à améliorer.",service:"Nettoyage Bureau",source:"direct",google:false,sentiment:"positif",statut:"nouveau",date_avis:new Date().toISOString()},
    {id:"a3",client_nom:"Amina D.",note:2,commentaire:"Déçue par le manque de communication lors de la prestation.",service:"Conciergerie",source:"google",google:true,sentiment:"négatif",statut:"nouveau",date_avis:new Date().toISOString()},
  ];

  const load=async()=>{
    setLoading(true);
    try{
      const companyParam=activeCompany?.id?`?company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/scoring'+companyParam);
      const d=await res.json();
      setData(d);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[activeCompany]);

  const ajouterAvis=async()=>{
    if(!avisForm.client_nom)return showToast("⚠️ Nom client requis");
    try{
      const res=await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_avis',...avisForm})});
      const d=await res.json();
      if(d.success){showToast("✅ Avis ajouté"+Number(avisForm.note)<=2?" · Alerte WhatsApp envoyée":"");setShowAjoutAvis(false);setAvisForm({client_nom:"",note:5,commentaire:"",service:"",source:"direct",google:false});load();}
    }catch(e){showToast("❌ Erreur");}
  };

  const repondreIA=async(avis)=>{
    try{
      const res=await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'repondre_ia',avis_id:avis.id,client_nom:avis.client_nom,note:avis.note,commentaire:avis.commentaire,service:avis.service,secteur:profil?.metier||"services premium"})});
      const d=await res.json();
      if(d.success){setReponseIA(r=>({...r,[avis.id]:d.reponse}));showToast("✅ Réponse IA générée");}
    }catch(e){showToast("❌ Erreur IA");}
  };

  const ajouterNPS=async()=>{
    if(!npsForm.client_nom)return showToast("⚠️ Nom requis");
    try{
      await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_nps',...npsForm})});
      showToast("✅ NPS enregistré"+Number(npsForm.score)>=9?" · Invitation Google envoyée":Number(npsForm.score)<=6?" · Alerte envoyée":"");
      setShowNPS(false);setNpsForm({client_nom:"",client_email:"",score:8,commentaire:""});load();
    }catch(e){showToast("❌ Erreur");}
  };

  const ajouterCSAT=async()=>{
    if(!csatForm.client_nom)return showToast("⚠️ Nom requis");
    try{
      await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_csat',...csatForm})});
      showToast("✅ CSAT enregistré");setShowCSAT(false);setCsatForm({client_nom:"",service:"",score:4,commentaire:""});load();
    }catch(e){showToast("❌ Erreur");}
  };

  const demanderAvisWhatsApp=async()=>{
    if(!demandeForm.client_tel||!demandeForm.client_nom)return showToast("⚠️ Nom et numéro requis");
    try{
      await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'demander_avis_whatsapp',...demandeForm})});
      showToast("✅ Demande d'avis WhatsApp envoyée");setDemandeForm({client_tel:"",client_nom:"",service:""});
    }catch(e){showToast("❌ Erreur");}
  };

  const analyserConcurrence=async()=>{
    setIaLoading(true);
    try{
      const res=await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_concurrentielle',secteur:profil?.metier||"services premium",note_actuelle:data?.noteMoyenne||0,nb_avis:data?.totalAvis||0})});
      const d=await res.json();
      if(d.success)setAnalyseConc(d.analyse);
    }catch(e){}
    setIaLoading(false);
  };

  const envoyerRapport=async()=>{
    showToast("⏳ Envoi rapport réputation...");
    try{
      await fetch('/api/scoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rapport_reputation_whatsapp',...data})});
      showToast("✅ Rapport réputation envoyé");
    }catch(e){showToast("❌ Erreur");}
  };

  if(!hasAccess(plan,"scoring"))return <div style={{padding:20}}><UpgradeWall page="Réputation & NPS" plan={plan}/></div>;
  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement de la réputation...</div></div>;

  const avisAffichés=data?.avis?.length>0?data.avis:AVIS_DEFAUT;
  const scoreReputation=data?.scoreReputation||72;
  const scoreColor=scoreReputation>=70?C.green:scoreReputation>=40?C.gold:C.red;

  const tabs=[
    {id:"dashboard",label:"★ Dashboard"},
    {id:"avis",label:"💬 Avis clients"},
    {id:"nps",label:"📊 NPS"},
    {id:"csat",label:"😊 CSAT"},
    {id:"demandes",label:"📱 Demander un avis"},
    {id:"concurrent",label:"🔍 Analyse concurrentielle"},
  ];

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>★ Réputation & NPS</div>
        <div style={{fontSize:11,color:C.muted}}>Avis · NPS · CSAT · Réponses IA · Routage intelligent · Multi-sociétés</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={envoyerRapport} style={{fontSize:11}}>📱 Rapport WhatsApp</BtnGhost>
        <Btn onClick={()=>setShowAjoutAvis(true)} style={{fontSize:11}}>+ Ajouter un avis</Btn>
      </div>
    </div>

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:14}}>
      <CT style={{borderColor:`${scoreColor}44`,gridColumn:"span 1"}}>
        <div style={{fontSize:9,color:C.muted,marginBottom:3}}>SCORE RÉPUTATION</div>
        <div style={{fontSize:24,fontWeight:700,color:scoreColor}}>{scoreReputation}</div>
        <div style={{fontSize:9,color:scoreColor}}>/100</div>
      </CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>NOTE GOOGLE</div><div style={{fontSize:20,fontWeight:700,color:C.gold}}>★ {data?.noteGoogle||4.8}</div><div style={{fontSize:9,color:C.muted}}>{data?.totalAvis||0} avis</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>NPS</div><div style={{fontSize:20,fontWeight:700,color:data?.npsScore>=50?C.green:data?.npsScore>=0?C.gold:C.red}}>{data?.npsScore>=0?"+":""}{data?.npsScore||72}</div><div style={{fontSize:9,color:C.muted}}>Net Promoter</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>CSAT</div><div style={{fontSize:20,fontWeight:700,color:C.teal}}>{data?.csatScore||85}%</div><div style={{fontSize:9,color:C.muted}}>Satisfaction</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>TAUX RÉPONSE</div><div style={{fontSize:20,fontWeight:700,color:data?.tauxReponse>=80?C.green:C.orange}}>{data?.tauxReponse||91}%</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>NON RÉPONDUS</div><div style={{fontSize:20,fontWeight:700,color:C.orange}}>{avisAffichés.filter(a=>a.statut==="nouveau").length}</div></CT>
    </div>

    {/* ALERTES AVIS NÉGATIFS */}
    {avisAffichés.filter(a=>a.note<=2&&a.statut==="nouveau").length>0&&<div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:10,padding:12,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.red,marginBottom:4}}>🔴 {avisAffichés.filter(a=>a.note<=2&&a.statut==="nouveau").length} avis négatif(s) sans réponse</div>
      <div style={{fontSize:11,color:C.text}}>{avisAffichés.filter(a=>a.note<=2&&a.statut==="nouveau").map(a=>a.client_nom).join(", ")} — Répondez rapidement pour limiter l'impact sur votre réputation.</div>
    </div>}

    {/* FORMS */}
    {showAjoutAvis&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>+ Ajouter un avis</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Client *</label><Inp value={avisForm.client_nom} onChange={e=>setAvisForm(f=>({...f,client_nom:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Service</label><Inp value={avisForm.service} onChange={e=>setAvisForm(f=>({...f,service:e.target.value}))} placeholder="Airbnb, Nettoyage..."/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Note (1-5)</label>
          <div style={{display:"flex",gap:6}}>
            {[1,2,3,4,5].map(n=><button key={n} onClick={()=>setAvisForm(f=>({...f,note:n}))} style={{width:36,height:36,borderRadius:6,background:avisForm.note>=n?`${C.gold}33`:"transparent",border:`1px solid ${avisForm.note>=n?C.gold:C.border}`,cursor:"pointer",fontSize:16,color:C.gold}}>★</button>)}
          </div>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Source</label>
          <Sel value={avisForm.source} onChange={e=>setAvisForm(f=>({...f,source:e.target.value}))}>
            <option value="direct">Direct</option>
            <option value="google">Google</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="trustpilot">Trustpilot</option>
            <option value="facebook">Facebook</option>
          </Sel>
        </div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Commentaire</label><Inp value={avisForm.commentaire} onChange={e=>setAvisForm(f=>({...f,commentaire:e.target.value}))} placeholder="Commentaire du client..."/></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input type="checkbox" id="google_chk" checked={avisForm.google} onChange={e=>setAvisForm(f=>({...f,google:e.target.checked}))} style={{accentColor:C.gold}}/>
          <label htmlFor="google_chk" style={{fontSize:11,color:C.muted}}>Avis Google (compte dans la note publique)</label>
        </div>
      </div>
      {Number(avisForm.note)<=2&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:8,marginBottom:10,fontSize:11,color:C.orange}}>⚠️ Avis négatif — une alerte WhatsApp sera envoyée automatiquement.</div>}
      <div style={{display:"flex",gap:8}}><Btn onClick={ajouterAvis}>✅ Ajouter l'avis</Btn><BtnGhost onClick={()=>setShowAjoutAvis(false)}>Annuler</BtnGhost></div>
    </Card>}

    {showNPS&&<Card style={{marginBottom:14,borderColor:`${C.blue}44`}}>
      <STitle>📊 Nouvelle réponse NPS</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Client *</label><Inp value={npsForm.client_nom} onChange={e=>setNpsForm(f=>({...f,client_nom:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email</label><Inp value={npsForm.client_email} onChange={e=>setNpsForm(f=>({...f,client_email:e.target.value}))}/></div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Score NPS (0-10) : {npsForm.score}/10 — {getNPSCat(Number(npsForm.score))}</label>
          <input type="range" min={0} max={10} value={npsForm.score} onChange={e=>setNpsForm(f=>({...f,score:Number(e.target.value)}))} style={{width:"100%",accentColor:C.blue}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:2}}><span>0 Détracteur</span><span>10 Promoteur</span></div>
        </div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Commentaire</label><Inp value={npsForm.commentaire} onChange={e=>setNpsForm(f=>({...f,commentaire:e.target.value}))}/></div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={ajouterNPS} style={{background:C.blue}}>✅ Enregistrer</Btn><BtnGhost onClick={()=>setShowNPS(false)}>Annuler</BtnGhost></div>
    </Card>}

    {showCSAT&&<Card style={{marginBottom:14,borderColor:`${C.teal}44`}}>
      <STitle>😊 Nouvelle réponse CSAT</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Client *</label><Inp value={csatForm.client_nom} onChange={e=>setCsatForm(f=>({...f,client_nom:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Service</label><Inp value={csatForm.service} onChange={e=>setCsatForm(f=>({...f,service:e.target.value}))}/></div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Score CSAT (1-5)</label>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            {[{s:1,e:"😡"},{s:2,e:"😕"},{s:3,e:"😐"},{s:4,e:"😊"},{s:5,e:"🤩"}].map(({s,e})=><button key={s} onClick={()=>setCsatForm(f=>({...f,score:s}))} style={{fontSize:28,background:csatForm.score===s?`${C.teal}22`:"transparent",border:`2px solid ${csatForm.score===s?C.teal:C.border}`,borderRadius:8,padding:"8px 12px",cursor:"pointer"}}>{e}</button>)}
          </div>
        </div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Commentaire</label><Inp value={csatForm.commentaire} onChange={e=>setCsatForm(f=>({...f,commentaire:e.target.value}))}/></div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={ajouterCSAT} style={{background:C.teal}}>✅ Enregistrer</Btn><BtnGhost onClick={()=>setShowCSAT(false)}>Annuler</BtnGhost></div>
    </Card>}

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── DASHBOARD ── */}
    {onglet==="dashboard"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card style={{borderColor:`${scoreColor}44`}}>
          <STitle>⭐ Score de réputation global</STitle>
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:64,fontWeight:700,color:scoreColor,fontFamily:"Georgia,serif",lineHeight:1}}>{scoreReputation}</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>/100</div>
            <div style={{height:6,background:C.border,borderRadius:3,margin:"0 20px",overflow:"hidden"}}>
              <div style={{height:"100%",width:scoreReputation+"%",background:scoreColor,borderRadius:3}}/>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[["Note globale",(data?.noteMoyenne||4.8)+"/5",C.gold],["NPS",(data?.npsScore>=0?"+":"")+String(data?.npsScore||72),C.blue],["CSAT",(data?.csatScore||85)+"%",C.teal],["Taux de réponse",(data?.tauxReponse||91)+"%",C.green]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card>
            <STitle>😊 Analyse des sentiments</STitle>
            {[["🟢 Positif",(data?.sentiments?.positif||2),C.green],["🟡 Neutre",(data?.sentiments?.neutre||1),C.gold],["🔴 Négatif",(data?.sentiments?.négatif||0),C.red]].map(([l,v,c],i)=>{
              const total=Object.values(data?.sentiments||{positif:2,neutre:1,négatif:0}).reduce((a,x)=>a+Number(x),0)||1;
              const pct=Math.round(Number(v)/total*100);
              return <div key={i} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{l}</span><span style={{color:c,fontWeight:700}}>{v} · {pct}%</span></div>
                <SM val={pct} max={100} color={c}/>
              </div>;
            })}
          </Card>
          <Card>
            <STitle>📊 Répartition NPS</STitle>
            {[["🏆 Promoteurs (9-10)",data?.promoteurs||3,C.green],["😐 Passifs (7-8)",data?.passifs||2,C.gold],["⚠️ Détracteurs (0-6)",data?.detracteurs||0,C.red]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
          </Card>
        </div>
      </div>
    </div>}

    {/* ── AVIS ── */}
    {onglet==="avis"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {["tous","positif","neutre","négatif"].map(f=><button key={f} onClick={()=>{}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit",color:C.muted,textTransform:"capitalize"}}>{f}</button>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {avisAffichés.map((a,i)=><Card key={i} style={{borderColor:a.note<=2?`${C.red}44`:a.note>=4?`${C.green}22`:`${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.gold}}>{inits(a.client_nom)}</div>
              <div>
                <div style={{fontSize:12,fontWeight:700}}>{a.client_nom}</div>
                <div style={{fontSize:10,color:C.muted}}>{a.service} · {new Date(a.date_avis||a.created_at).toLocaleDateString("fr")}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{color:C.gold,fontSize:14}}>{"★".repeat(Number(a.note||0))}{"☆".repeat(5-Number(a.note||0))}</div>
              {a.google&&<Pill color={C.blue}>Google</Pill>}
              <Pill color={a.sentiment==="positif"?C.green:a.sentiment==="négatif"?C.red:C.gold}>{a.sentiment}</Pill>
              <St s={a.statut}/>
            </div>
          </div>
          {a.commentaire&&<div style={{fontSize:12,color:C.text,fontStyle:"italic",lineHeight:1.6,marginBottom:10}}>"{a.commentaire}"</div>}
          {reponseIA[a.id]&&<div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:10,marginBottom:10,fontSize:11,color:C.text,lineHeight:1.6}}>
            <div style={{fontSize:9,color:C.purple,fontWeight:700,marginBottom:4}}>🤖 RÉPONSE IA GÉNÉRÉE</div>
            {reponseIA[a.id]}
          </div>}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <Btn onClick={()=>repondreIA(a)} style={{fontSize:10,padding:"5px 10px"}}>🤖 Répondre (IA)</Btn>
            <BtnGhost onClick={()=>showToast("📱 Partagé !")} style={{fontSize:10}}>📱 Partager</BtnGhost>
            {a.google&&<BtnGhost onClick={()=>showToast("🔗 Lien Google copié")} style={{fontSize:10}}>🔗 Google</BtnGhost>}
          </div>
        </Card>)}
      </div>
    </div>}

    {/* ── NPS ── */}
    {onglet==="nps"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:14,flex:1,marginRight:12}}>
          <div style={{fontSize:9,color:C.blue,fontWeight:600,marginBottom:4}}>NET PROMOTER SCORE</div>
          <div style={{fontSize:48,fontWeight:700,color:data?.npsScore>=50?C.green:data?.npsScore>=0?C.gold:C.red}}>{data?.npsScore>=0?"+":""}{data?.npsScore||72}</div>
          <div style={{fontSize:11,color:C.muted}}>Basé sur {data?.nps?.length||0} réponses · Promoteurs {data?.promoteurs||0} · Détracteurs {data?.detracteurs||0}</div>
        </div>
        <Btn onClick={()=>setShowNPS(true)} style={{fontSize:11,flexShrink:0}}>+ Ajouter réponse NPS</Btn>
      </div>
      {(data?.nps||[]).length===0?<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:11,color:C.muted}}>Aucune réponse NPS. Collectez les scores de satisfaction de vos clients.</div></Card>:
      <Card>
        <STitle>📋 Réponses NPS</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Client</TH><TH>Score</TH><TH>Catégorie</TH><TH>Commentaire</TH><TH>Date</TH></tr></thead>
          <tbody>{(data?.nps||[]).map((n,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{n.client_nom}</Td>
            <Td><span style={{fontSize:16,fontWeight:700,color:n.score>=9?C.green:n.score>=7?C.gold:C.red}}>{n.score}</span></Td>
            <Td><Pill color={n.categorie==="promoteur"?C.green:n.categorie==="passif"?C.gold:C.red}>{n.categorie}</Pill></Td>
            <Td style={{fontSize:11,color:C.muted}}>{(n.commentaire||"—").slice(0,50)}</Td>
            <Td style={{fontSize:10,color:C.muted}}>{new Date(n.created_at).toLocaleDateString("fr")}</Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── CSAT ── */}
    {onglet==="csat"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{background:`${C.teal}11`,border:`1px solid ${C.teal}33`,borderRadius:10,padding:14,flex:1,marginRight:12}}>
          <div style={{fontSize:9,color:C.teal,fontWeight:600,marginBottom:4}}>CUSTOMER SATISFACTION SCORE</div>
          <div style={{fontSize:48,fontWeight:700,color:C.teal}}>{data?.csatScore||85}%</div>
          <div style={{fontSize:11,color:C.muted}}>Basé sur {data?.csat?.length||0} évaluations · Note moyenne : {data?.csat?.length>0?Math.round(data.csat.reduce((a,r)=>a+r.score,0)/data.csat.length*10)/10:4.2}/5</div>
        </div>
        <Btn onClick={()=>setShowCSAT(true)} style={{fontSize:11,flexShrink:0}}>+ Ajouter CSAT</Btn>
      </div>
      {(data?.csat||[]).length===0?<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:11,color:C.muted}}>Aucune évaluation CSAT. Recueillez la satisfaction de vos clients après chaque prestation.</div></Card>:
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Client</TH><TH>Service</TH><TH>Score</TH><TH>Commentaire</TH></tr></thead>
          <tbody>{(data?.csat||[]).map((c,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{c.client_nom}</Td>
            <Td style={{color:C.muted}}>{c.service||"—"}</Td>
            <Td><span style={{fontSize:20}}>{["😡","😕","😐","😊","🤩"][c.score-1]}</span></Td>
            <Td style={{fontSize:11,color:C.muted}}>{(c.commentaire||"—").slice(0,50)}</Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── DEMANDER UN AVIS ── */}
    {onglet==="demandes"&&<div>
      <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text,lineHeight:1.7}}>
        📱 Routage intelligent — les clients avec un NPS ≥ 9 reçoivent automatiquement une invitation à laisser un avis Google. Les clients insatisfaits sont contactés en privé d'abord pour résoudre le problème avant qu'ils postent un avis public.
      </div>
      <Card style={{marginBottom:12}}>
        <STitle>📱 Envoyer une demande d'avis WhatsApp</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom du client *</label><Inp value={demandeForm.client_nom} onChange={e=>setDemandeForm(f=>({...f,client_nom:e.target.value}))}/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>WhatsApp *</label><Inp value={demandeForm.client_tel} onChange={e=>setDemandeForm(f=>({...f,client_tel:e.target.value}))} placeholder="+33..."/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Service effectué</label><Inp value={demandeForm.service} onChange={e=>setDemandeForm(f=>({...f,service:e.target.value}))} placeholder="Airbnb, Nettoyage..."/></div>
        </div>
        <Btn onClick={demanderAvisWhatsApp} style={{background:C.green}}>📱 Envoyer la demande d'avis</Btn>
      </Card>
      <Card>
        <STitle>🔗 Lien direct Google Reviews</STitle>
        <div style={{background:C.card2,borderRadius:8,padding:12,fontSize:12,color:C.muted,marginBottom:10,fontFamily:"'Courier New',monospace"}}>https://g.page/r/xyra/review</div>
        <div style={{display:"flex",gap:8}}>
          <BtnGhost onClick={()=>{navigator.clipboard?.writeText("https://g.page/r/xyra/review");showToast("✅ Lien copié");}}>📋 Copier</BtnGhost>
          <BtnGhost onClick={()=>showToast("📱 Lien envoyé sur WhatsApp")}>📱 Envoyer WhatsApp</BtnGhost>
        </div>
      </Card>
    </div>}

    {/* ── ANALYSE CONCURRENTIELLE ── */}
    {onglet==="concurrent"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🔍 Analyse concurrentielle — Claude IA</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseConc||"Lance l'analyse pour obtenir un benchmark de ta réputation vs les concurrents de ton secteur."}</div>}
        <BtnGhost onClick={analyserConcurrence} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🔍 Analyser vs concurrents"}</BtnGhost>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>📊 Ta position sur le marché</STitle>
          {[["Secteur",profil?.metier||"Services premium"],["Note actuelle",(data?.noteMoyenne||4.8)+"/5 ★"],["Benchmark sectoriel","4.3/5 ★ (moyenne marché)"],["Objectif recommandé","4.8+/5 ★"],["Nb avis actuels",String(data?.totalAvis||0)],["Objectif avis","50+ pour la crédibilité"]].map(([l,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"6px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{l}</span><span style={{color:C.text,fontWeight:600}}>{v}</span></div>)}
        </Card>
        <Card>
          <STitle>💡 Actions prioritaires</STitle>
          {[{icon:"📱",action:"Envoyer des demandes d'avis WhatsApp après chaque prestation",urgence:"Immédiat",couleur:C.green},{icon:"🤖",action:"Répondre aux avis négatifs avec l'IA dans les 24h",urgence:"Critique",couleur:C.red},{icon:"🎯",action:"Atteindre 50+ avis Google pour maximiser la visibilité",urgence:"1 mois",couleur:C.blue},{icon:"📊",action:"Collecter le NPS mensuellement pour mesurer l'évolution",urgence:"Récurrent",couleur:C.purple}].map((a,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
            <span style={{fontSize:16,flexShrink:0}}>{a.icon}</span>
            <div style={{flex:1}}><div style={{color:C.text}}>{a.action}</div><Pill color={a.couleur}>{a.urgence}</Pill></div>
          </div>)}
        </Card>
      </div>
    </div>}
  </div>;
};

// Helper NPS catégorie
function getNPSCat(score) {
  if(score>=9)return "🏆 Promoteur";
  if(score>=7)return "😐 Passif";
  return "⚠️ Détracteur";
}


// ─── PAGE EQUIPE ──────────────────────────────────────────────

export default PageScoring;
