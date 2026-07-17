"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp, Sel, St, inits } from "../lib/ui";
import { EVENEMENTS } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageClubAffaires=({plan,showToast,UpgradeWall})=>{
  const[onglet,setOnglet]=useState("accueil");
  const[membres,setMembres]=useState([]);
  const[tenants,setTenants]=useState([]);
  const[coinvestissements,setCoinvestissements]=useState([]);
  const[contenu,setContenu]=useState([]);
  const[candidatures,setCandidatures]=useState([]);
  const[meetings,setMeetings]=useState([]);
  const[loading,setLoading]=useState(true);
  const[iaMatches,setIaMatches]=useState([]);
  const[iaLoading,setIaLoading]=useState(false);
  const[selectedMembre,setSelectedMembre]=useState(null);
  const[showCandidature,setShowCandidature]=useState(false);
  const[showCoinvest,setShowCoinvest]=useState(false);
  const[candidatureForm,setCandidatureForm]=useState({nom:"",email:"",metier:"",message:"",coopte_par:""});
  const[coinvestForm,setCoinvestForm]=useState({titre:"",description:"",montant_total:"",montant_min_ticket:"1000",secteur:"",rendement_estime:"",date_cloture:""});
  const[dealForm,setDealForm]=useState({service:"",valeur:"",detail:""});
  const[deals,setDeals]=useState([
    {id:"DA-001",offrant:"Marc Dupont",recevant:"Sofia Al-Rashid",service:"Mise en relation Airbnb Dubai",valeur:2400,statut:"en cours",date:"12/04"},
    {id:"DA-002",offrant:"Groupe Prestige SARL",recevant:"Fatoumata Diop",service:"Distribution services Dakar",valeur:8000,statut:"validé",date:"10/04"},
    {id:"DA-003",offrant:"Leila Mansouri",recevant:"Jean-Marc Olivier",service:"Référencement syndic Paris",valeur:1200,statut:"proposé",date:"15/04"},
  ]);

  const MEMBRES_DEFAUT=[
    {id:1,nom:"Isabelle Moreau",metier:"Gestion Airbnb",ville:"Paris",pays:"🇫🇷",plan:"Starter",score_reputation:72,couleur:"#4B7BFF",bio:"Gestionnaire de 8 appartements Airbnb sur Paris.",services:["Gestion locative","Conciergerie","Ménage"],ca_genere:9600,nb_deals:2,email:"i.moreau@mail.fr",tel:"+33 6 12 34 56 78"},
    {id:2,nom:"Marc Dupont",metier:"Immobilier",ville:"Lyon",pays:"🇫🇷",plan:"Business Pro",score_reputation:88,couleur:"#9B5FFF",bio:"Investisseur immobilier, portefeuille de 15 biens résidentiels.",services:["Vente","Location","Investissement"],ca_genere:38400,nb_deals:5,email:"m.dupont@corp.fr",tel:"+33 6 98 76 54 32"},
    {id:3,nom:"Sofia Al-Rashid",metier:"Aviation d'affaires",ville:"Dubaï",pays:"🇦🇪",plan:"Enterprise",score_reputation:98,couleur:"#C9A84C",bio:"Directrice d'une flotte de jets privés desservant l'Europe et le Moyen-Orient.",services:["Location jet privé","Conciergerie VIP","Transferts"],ca_genere:110400,nb_deals:8,email:"sofia@vip.ae",tel:"+971 50 123 45 67"},
    {id:4,nom:"Groupe Prestige SARL",metier:"Syndic & Gestion",ville:"Paris",pays:"🇫🇷",plan:"Enterprise",score_reputation:94,couleur:"#2EC9B0",bio:"Syndic professionnel gérant plus de 200 résidences en Île-de-France.",services:["Syndic","Gestion immeuble","Maintenance"],ca_genere:264000,nb_deals:14,email:"contact@prestige.fr",tel:"+33 1 44 55 66 77"},
    {id:5,nom:"Fatoumata Diop",metier:"Finance Afrique",ville:"Dakar",pays:"🇸🇳",plan:"Business Pro",score_reputation:89,couleur:"#FF5F9E",bio:"Consultante en finance d'entreprise couvrant l'Afrique de l'Ouest.",services:["Conseil financier","Investissement","Formation"],ca_genere:81600,nb_deals:4,email:"fatou.d@dakar.sn",tel:"+221 77 123 45 67"},
  ];

  const load=async()=>{
    setLoading(true);
    try{
      const [membresRes,coinvestRes,contenuRes,candidaturesRes,meetingsRes]=await Promise.all([
        fetch('/api/club?action=membres').then(r=>r.json()).catch(()=>({})),
        fetch('/api/club?action=coinvestissements').then(r=>r.json()).catch(()=>({})),
        fetch('/api/club?action=contenu').then(r=>r.json()).catch(()=>({})),
        fetch('/api/club?action=candidatures').then(r=>r.json()).catch(()=>({})),
        fetch('/api/club?action=speed_meetings').then(r=>r.json()).catch(()=>({})),
      ]);
      const membresReels=membresRes.membres||[];
      setMembres(membresReels.length>0?membresReels:MEMBRES_DEFAUT);
      setTenants(membresRes.tenants||[]);
      setCoinvestissements(coinvestRes.coinvestissements||[]);
      setContenu(contenuRes.contenu||[]);
      setCandidatures(candidaturesRes.candidatures||[]);
      setMeetings(meetingsRes.meetings||[]);
    }catch(e){setMembres(MEMBRES_DEFAUT);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const lancerIaMatch=async()=>{
    setIaLoading(true);
    try{
      const res=await fetch('/api/club',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ia_match',membres,profil:{metier:'Conciergerie premium',pays:'France'}})});
      const d=await res.json();
      if(d.success)setIaMatches(d.matches||[]);
    }catch(e){}
    setIaLoading(false);
  };

  const soumettreCandidat=async()=>{
    if(!candidatureForm.nom||!candidatureForm.email)return showToast("⚠️ Nom et email requis");
    try{
      await fetch('/api/club',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'candidature',...candidatureForm})});
      showToast("✅ Candidature soumise — nous vous répondrons sous 48h");
      setShowCandidature(false);setCandidatureForm({nom:"",email:"",metier:"",message:"",coopte_par:""});
    }catch(e){showToast("❌ Erreur");}
  };

  const creerCoinvest=async()=>{
    if(!coinvestForm.titre||!coinvestForm.montant_total)return showToast("⚠️ Titre et montant requis");
    try{
      await fetch('/api/club',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_coinvestissement',...coinvestForm})});
      showToast("✅ Opportunité publiée dans le Club");
      setShowCoinvest(false);setCoinvestForm({titre:"",description:"",montant_total:"",montant_min_ticket:"1000",secteur:"",rendement_estime:"",date_cloture:""});
      load();
    }catch(e){showToast("❌ Erreur");}
  };

  const tabs=[
    {id:"accueil",label:"🏠 Club"},
    {id:"membres",label:"👥 Membres"},
    {id:"coinvestissement",label:"💼 Co-investissement"},
    {id:"deals",label:"🤝 Deals"},
    {id:"meetings",label:"⚡ Speed Meetings"},
    {id:"contenu",label:"📚 Contenu exclusif"},
    {id:"candidatures",label:"📋 Candidatures"},
    {id:"avantages",label:"💎 Avantages"},
    {id:"stats",label:"📊 Stats"},
  ];

  const totalCA=membres.reduce((a,m)=>a+Number(m.ca_genere||0),0);
  const totalDeals=membres.reduce((a,m)=>a+Number(m.nb_deals||0),0);

  if(!hasAccess(plan,"club_affaires"))return <div style={{padding:20}}><UpgradeWall page="club_affaires" plan={plan}/></div>;

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{background:`linear-gradient(135deg,${C.card},#0A0A1A)`,border:`1px solid ${C.gold}44`,borderRadius:16,padding:20,marginBottom:14}}>
      <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",marginBottom:4}}>CLUB XYRA · RÉSEAU AFFAIRES PRIVÉ</div>
      <div style={{fontSize:22,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◈ Club d'affaires Xyra</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Réseau privé · Cooptation · IA Match · Co-investissement · Speed Meetings · VIP</div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <div style={{borderLeft:`2px solid ${C.gold}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Membres actifs</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{membres.length}</div></div>
        <div style={{borderLeft:`2px solid ${C.green}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Deals conclus</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{totalDeals}</div></div>
        <div style={{borderLeft:`2px solid ${C.blue}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>CA généré réseau</div><div style={{fontSize:16,fontWeight:700,color:C.blue}}>{fmt(totalCA)}</div></div>
        <div style={{borderLeft:`2px solid ${C.purple}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Pays représentés</div><div style={{fontSize:16,fontWeight:700,color:C.purple}}>{new Set(membres.map(m=>m.pays)).size}</div></div>
        <div style={{borderLeft:`2px solid ${C.teal}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>Co-investissements</div><div style={{fontSize:16,fontWeight:700,color:C.teal}}>{coinvestissements.length}</div></div>
      </div>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── ACCUEIL ── */}
    {onglet==="accueil"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>🏆 Top membres actifs</STitle>
        {[...membres].sort((a,b)=>Number(b.score_reputation||0)-Number(a.score_reputation||0)).slice(0,5).map((m,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.border}22`,cursor:"pointer"}} onClick={()=>{setSelectedMembre(m);setOnglet("membres");}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.gold}}>{i+1}</div>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600}}>{m.nom}</div><div style={{fontSize:9,color:C.muted}}>{m.metier} · {m.pays}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:11,color:C.gold,fontWeight:700}}>★ {m.score_reputation||50}</div><div style={{fontSize:9,color:C.muted}}>{m.nb_deals||0} deals</div></div>
        </div>)}
      </Card>

      <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 IA Match du jour — Claude</div>
        {iaMatches.length===0?<div>
          <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Lance l'analyse IA pour identifier les meilleures synergies entre membres.</div>
          <Btn onClick={lancerIaMatch} style={{fontSize:11}}>{iaLoading?"⏳ Analyse...":"🤖 Lancer l'IA Match"}</Btn>
        </div>:<div>
          {iaMatches.slice(0,2).map((m,i)=><div key={i} style={{marginBottom:10,padding:"8px 10px",background:`${C.purple}11`,borderRadius:8}}>
            <div style={{fontSize:12,color:C.text,lineHeight:1.7,marginBottom:4}}><b style={{color:C.gold}}>{m.membre}</b> — {m.raison}</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:10,color:C.green}}>CA estimé : {fmt(m.ca_estime||0)}</span>
              <Pill color={C.purple}>Score {m.score}%</Pill>
            </div>
          </div>)}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn onClick={()=>showToast("✅ Mise en relation effectuée !")} style={{fontSize:10}}>🤝 Mettre en relation</Btn>
            <BtnGhost onClick={()=>{setIaMatches([]);lancerIaMatch();}} style={{fontSize:10}}>🔄 Relancer</BtnGhost>
          </div>
        </div>}
      </Card>

      {/* Prochains événements */}
      <Card>
        <STitle>📅 Prochains événements</STitle>
        {EVENEMENTS.map((e,i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{e.titre}</div>
          <div style={{fontSize:10,color:C.muted,marginBottom:6}}>📅 {e.date} · 📍 {e.lieu}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Pill color={C.green}>{e.inscrits}/{e.max}</Pill><Btn onClick={()=>showToast(`✅ Inscrit à ${e.titre}`)} style={{fontSize:10,padding:"4px 10px"}}>S'inscrire</Btn></div>
        </div>)}
      </Card>

      {/* Co-investissements récents */}
      <Card style={{borderColor:`${C.gold}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <STitle>💼 Co-investissements ouverts</STitle>
          <BtnGhost onClick={()=>setOnglet("coinvestissement")} style={{fontSize:10}}>Voir tout →</BtnGhost>
        </div>
        {coinvestissements.length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun co-investissement ouvert pour le moment.<br/><button onClick={()=>{setShowCoinvest(true);setOnglet("coinvestissement");}} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontFamily:"inherit",fontSize:12,marginTop:8}}>+ Proposer une opportunité</button></div>:
        coinvestissements.slice(0,2).map((c,i)=><div key={i} style={{background:`${C.gold}08`,border:`1px solid ${C.gold}22`,borderRadius:8,padding:10,marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:2}}>{c.titre}</div>
          <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{c.secteur} · Ticket min : {fmt(c.montant_min_ticket||1000)}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:C.green}}>Rendement estimé : {c.rendement_estime||"—"}</span>
            <Btn onClick={()=>showToast("✅ Participation enregistrée")} style={{fontSize:10,padding:"4px 8px"}}>Participer</Btn>
          </div>
        </div>)}
      </Card>
    </div>}

    {/* ── MEMBRES ── */}
    {onglet==="membres"&&<div>
      {selectedMembre?<div>
        <BtnGhost onClick={()=>setSelectedMembre(null)} style={{marginBottom:14}}>← Retour aux membres</BtnGhost>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:`${selectedMembre.couleur||C.gold}44`}}>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:`${selectedMembre.couleur||C.gold}22`,border:`3px solid ${selectedMembre.couleur||C.gold}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:selectedMembre.couleur||C.gold}}>{inits(selectedMembre.nom)}</div>
              <div>
                <div style={{fontSize:18,fontWeight:700,color:C.text}}>{selectedMembre.nom}</div>
                <div style={{fontSize:12,color:C.muted}}>{selectedMembre.metier}</div>
                <div style={{fontSize:11,color:C.muted}}>{selectedMembre.pays} {selectedMembre.ville}</div>
                <Pill color={C.gold}>★ {selectedMembre.score_reputation||50}/100</Pill>
              </div>
            </div>
            <div style={{background:`${selectedMembre.couleur||C.gold}11`,borderRadius:10,padding:14,marginBottom:16,fontSize:12,color:C.text,lineHeight:1.7,fontStyle:"italic"}}>"{selectedMembre.bio}"</div>
            {(selectedMembre.services||[]).length>0&&<div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>SERVICES PROPOSÉS</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(selectedMembre.services||[]).map((s,i)=><Pill key={i} color={selectedMembre.couleur||C.gold}>{s}</Pill>)}</div>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {selectedMembre.email&&<div style={{display:"flex",gap:10,fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}><span>📧</span><span style={{color:C.muted}}>{selectedMembre.email}</span></div>}
              {selectedMembre.tel&&<div style={{display:"flex",gap:10,fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}><span>📱</span><span style={{color:C.muted}}>{selectedMembre.tel}</span></div>}
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <CT><div style={{fontSize:9,color:C.muted}}>CA généré</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(selectedMembre.ca_genere||0)}</div></CT>
              <CT><div style={{fontSize:9,color:C.muted}}>Score</div><div style={{fontSize:16,fontWeight:700,color:selectedMembre.couleur||C.gold}}>{selectedMembre.score_reputation||50}/100</div></CT>
              <CT><div style={{fontSize:9,color:C.muted}}>Deals</div><div style={{fontSize:16,fontWeight:700,color:C.blue}}>{selectedMembre.nb_deals||0}</div></CT>
              <CT><div style={{fontSize:9,color:C.muted}}>Plan</div><div style={{fontSize:12,fontWeight:700,color:C.purple}}>{selectedMembre.plan||"—"}</div></CT>
            </div>
            <Card>
              <STitle>⚡ Actions</STitle>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <Btn onClick={()=>showToast("💬 WhatsApp ouvert")} style={{background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`}}>💬 WhatsApp</Btn>
                <Btn onClick={()=>showToast("🤝 Deal proposé")} style={{background:`${C.gold}22`,color:C.gold,border:`1px solid ${C.gold}44`}}>🤝 Proposer un deal</Btn>
                <BtnGhost onClick={()=>{setOnglet("meetings");showToast("📅 Planifiez votre speed meeting ci-dessous");}}>⚡ Speed Meeting</BtnGhost>
                <BtnGhost onClick={()=>showToast("⭐ Recommandation envoyée")}>⭐ Recommander</BtnGhost>
              </div>
            </Card>
            <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
              <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 IA Match — Synergies</div>
              <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>Synergies avec {selectedMembre.nom?.split(" ")[0]} : collaboration sur {(selectedMembre.services||["vos services"])[0]}. CA potentiel : {fmt(Math.round(Number(selectedMembre.ca_genere||0)*0.15))}. Score : {Math.min(99,Number(selectedMembre.score_reputation||50)+3)}%.</div>
            </Card>
          </div>
        </div>
      </div>:<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700}}>👥 {membres.length} membres actifs</div>
          <Btn onClick={()=>setShowCandidature(true)} style={{fontSize:11}}>+ Proposer un membre</Btn>
        </div>
        {showCandidature&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
          <STitle>📋 Coopter un nouveau membre</STitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={candidatureForm.nom} onChange={e=>setCandidatureForm(f=>({...f,nom:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email *</label><Inp value={candidatureForm.email} onChange={e=>setCandidatureForm(f=>({...f,email:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Métier</label><Inp value={candidatureForm.metier} onChange={e=>setCandidatureForm(f=>({...f,metier:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Coopté par</label><Inp value={candidatureForm.coopte_par} onChange={e=>setCandidatureForm(f=>({...f,coopte_par:e.target.value}))} placeholder="Votre nom"/></div>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Message / Recommandation</label><Inp value={candidatureForm.message} onChange={e=>setCandidatureForm(f=>({...f,message:e.target.value}))} placeholder="Pourquoi recommandez-vous cette personne ?"/></div>
          </div>
          <div style={{display:"flex",gap:8}}><Btn onClick={soumettreCandidat}>✅ Soumettre la candidature</Btn><BtnGhost onClick={()=>setShowCandidature(false)}>Annuler</BtnGhost></div>
        </Card>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
          {membres.map((m,i)=><Card key={i} style={{cursor:"pointer",borderColor:`${m.couleur||C.gold}33`}} onClick={()=>setSelectedMembre(m)}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:`${m.couleur||C.gold}22`,border:`2px solid ${m.couleur||C.gold}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:m.couleur||C.gold,flexShrink:0}}>{inits(m.nom)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.nom}</div>
                <div style={{fontSize:10,color:C.muted}}>{m.pays} {m.ville}</div>
                <Pill color={m.plan==="Enterprise"?C.purple:m.plan==="Business Pro"?C.gold:C.blue}>{m.plan||"Starter"}</Pill>
              </div>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.5}}>{(m.bio||"").slice(0,80)}{(m.bio||"").length>80?"...":""}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{(m.services||[]).slice(0,3).map((s,j)=><span key={j} style={{fontSize:9,background:`${m.couleur||C.gold}15`,color:m.couleur||C.gold,border:`1px solid ${m.couleur||C.gold}33`,borderRadius:4,padding:"2px 6px"}}>{s}</span>)}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:11,fontWeight:700,color:C.gold}}>{fmt(m.ca_genere||0)}</span>
              <span style={{fontSize:11,color:m.couleur||C.gold,fontWeight:600}}>★ {m.score_reputation||50}/100</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              <Btn onClick={e=>{e.stopPropagation();showToast(`💬 WhatsApp ${m.nom}`);}} style={{fontSize:10,padding:"6px 4px",background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`}}>💬 Contact</Btn>
              <BtnGhost onClick={e=>{e.stopPropagation();setSelectedMembre(m);}} style={{fontSize:10,padding:"6px 4px"}}>Profil →</BtnGhost>
            </div>
          </Card>)}
        </div>
      </div>}
    </div>}

    {/* ── CO-INVESTISSEMENT ── */}
    {onglet==="coinvestissement"&&<div>
      <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text,lineHeight:1.7}}>
        💼 Le co-investissement Club Xyra permet aux membres de s'associer sur des projets communs — immobilier, commerce, tech, services. Chaque membre fixe librement son ticket de participation. Toutes les opportunités sont présentées de manière transparente avec le rendement estimé et la date de clôture.
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <Btn onClick={()=>setShowCoinvest(!showCoinvest)} style={{fontSize:11}}>+ Proposer une opportunité</Btn>
      </div>
      {showCoinvest&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
        <STitle>💼 Nouvelle opportunité de co-investissement</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Titre *</label><Inp value={coinvestForm.titre} onChange={e=>setCoinvestForm(f=>({...f,titre:e.target.value}))} placeholder="Ex: Villa Côte d'Azur"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Secteur</label><Inp value={coinvestForm.secteur} onChange={e=>setCoinvestForm(f=>({...f,secteur:e.target.value}))} placeholder="Immobilier, Tech, Commerce..."/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant total (€) *</label><Inp type="number" value={coinvestForm.montant_total} onChange={e=>setCoinvestForm(f=>({...f,montant_total:e.target.value}))}/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Ticket minimum (€)</label><Inp type="number" value={coinvestForm.montant_min_ticket} onChange={e=>setCoinvestForm(f=>({...f,montant_min_ticket:e.target.value}))}/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Rendement estimé</label><Inp value={coinvestForm.rendement_estime} onChange={e=>setCoinvestForm(f=>({...f,rendement_estime:e.target.value}))} placeholder="Ex: 8-12% / an"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Date de clôture</label><Inp type="date" value={coinvestForm.date_cloture} onChange={e=>setCoinvestForm(f=>({...f,date_cloture:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Description</label><Inp value={coinvestForm.description} onChange={e=>setCoinvestForm(f=>({...f,description:e.target.value}))} placeholder="Décrivez l'opportunité..."/></div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creerCoinvest}>✅ Publier l'opportunité</Btn><BtnGhost onClick={()=>setShowCoinvest(false)}>Annuler</BtnGhost></div>
      </Card>}
      {coinvestissements.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>💼</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucun co-investissement ouvert</div>
        <div style={{fontSize:11,color:C.muted}}>Soyez le premier à proposer une opportunité au réseau.</div>
      </Card>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {coinvestissements.map((c,i)=><Card key={i} style={{borderColor:`${C.gold}33`}}>
          <div style={{fontSize:14,fontWeight:700,color:C.gold,marginBottom:4}}>{c.titre}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10}}>{c.secteur} · Porteur : {c.porteur||"Membre Club"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <CT><div style={{fontSize:9,color:C.muted}}>Montant total</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{fmt(c.montant_total||0)}</div></CT>
            <CT><div style={{fontSize:9,color:C.muted}}>Ticket min</div><div style={{fontSize:14,fontWeight:700,color:C.blue}}>{fmt(c.montant_min_ticket||1000)}</div></CT>
          </div>
          {c.rendement_estime&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}22`,borderRadius:6,padding:"6px 10px",fontSize:11,color:C.green,marginBottom:10}}>📈 Rendement estimé : {c.rendement_estime}</div>}
          {c.description&&<div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.6}}>{c.description}</div>}
          {c.date_cloture&&<div style={{fontSize:10,color:C.orange,marginBottom:10}}>⏰ Clôture : {c.date_cloture}</div>}
          <Btn onClick={()=>showToast("✅ Participation enregistrée — notre équipe vous contacte")} style={{width:"100%",fontSize:11}}>💼 Participer à ce projet</Btn>
        </Card>)}
      </div>}
    </div>}

    {/* ── DEALS ── */}
    {onglet==="deals"&&<Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <STitle>🤝 Deals entre membres</STitle>
        <Btn onClick={()=>showToast("✅ Deal proposé au réseau !")} style={{fontSize:11}}>+ Proposer un deal</Btn>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Proposant</TH><TH>Bénéficiaire</TH><TH>Service</TH><TH>Valeur</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
        <tbody>{deals.map((d,i)=><tr key={i}>
          <Td style={{fontWeight:600}}>{d.offrant}</Td>
          <Td style={{fontWeight:600}}>{d.recevant}</Td>
          <Td style={{fontSize:11,color:C.muted}}>{d.service}</Td>
          <Td style={{color:C.green,fontWeight:700}}>{fmt(d.valeur)}</Td>
          <Td><St s={d.statut}/></Td>
          <Td><div style={{display:"flex",gap:4}}>
            {d.statut==="proposé"&&<Btn onClick={()=>{setDeals(ds=>ds.map((x,j)=>j===i?{...x,statut:"en cours"}:x));showToast("✅ Deal accepté !");}} style={{fontSize:10,padding:"4px 8px",background:C.green}}>✅</Btn>}
            <BtnGhost onClick={()=>showToast("💬 Chat ouvert")} style={{fontSize:10,padding:"4px 8px"}}>💬</BtnGhost>
          </div></Td>
        </tr>)}</tbody>
      </table>
    </Card>}

    {/* ── SPEED MEETINGS ── */}
    {onglet==="meetings"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        ⚡ Le Speed Meeting Club Xyra — 20 minutes chrono avec un membre, format BNI mais en digital. Planifiez directement depuis ce module, un lien visio est généré automatiquement.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <Card>
          <STitle>📅 Planifier un Speed Meeting</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Membre à rencontrer</label>
              <Sel><option value="">Choisir un membre...</option>{membres.map(m=><option key={m.id} value={m.id}>{m.nom} — {m.metier}</option>)}</Sel>
            </div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Date et heure</label><Inp type="datetime-local"/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Durée</label>
              <Sel><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option></Sel>
            </div>
            <Btn onClick={()=>showToast("✅ Speed Meeting planifié — lien visio envoyé par email")}>⚡ Confirmer le meeting</Btn>
          </div>
        </Card>
        <Card>
          <STitle>🎥 Salle Visio Club VIP</STitle>
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <div style={{fontSize:36,marginBottom:10}}>🎥</div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Salon Visio Club Xyra</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Salle privée réservée aux membres Club</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <Btn onClick={()=>showToast("🎥 Salon : meet.xyra.io/club")}>🎥 Rejoindre</Btn>
              <BtnGhost onClick={()=>showToast("📅 Visio planifiée !")}>📅 Planifier</BtnGhost>
            </div>
          </div>
        </Card>
      </div>
      {meetings.length>0&&<Card>
        <STitle>📋 Meetings planifiés</STitle>
        {meetings.map((m,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{new Date(m.date_heure).toLocaleDateString("fr")} à {new Date(m.date_heure).toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})}</div><div style={{fontSize:10,color:C.muted}}>{m.duree_minutes} min</div></div>
          <div style={{display:"flex",gap:8}}><Pill color={C.blue}>{m.statut}</Pill><BtnGhost onClick={()=>showToast("🎥 Lien copié")} style={{fontSize:10}}>🔗 Lien</BtnGhost></div>
        </div>)}
      </Card>}
    </div>}

    {/* ── CONTENU EXCLUSIF ── */}
    {onglet==="contenu"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        📚 Contenu exclusif réservé aux membres Club — analyses de marché, masterclass, rapports sectoriels, accès direct aux experts du réseau.
      </div>
      {contenu.length===0?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {[{icon:"📊",titre:"Analyse marché immobilier luxe Q2 2026",type:"Rapport",auteur:"Équipe Xyra",desc:"Tendances et opportunités sur les marchés France, Dubaï et Afrique du Nord."},
          {icon:"🎥",titre:"Masterclass : Développer son réseau en Afrique",type:"Masterclass",auteur:"Fatoumata Diop",desc:"Stratégies concrètes pour s'implanter sur les marchés africains francophones."},
          {icon:"📝",titre:"Guide : Structurer une holding multi-sociétés",type:"Guide",auteur:"Équipe Xyra",desc:"Comment optimiser la gestion de plusieurs entités juridiques depuis Xyra."},
          {icon:"🤖",titre:"IA & Business : comment automatiser ses opérations",type:"Article",auteur:"Curtiss — Fondateur Xyra",desc:"Retour d'expérience sur l'intégration de l'IA Claude dans les processus business."}
        ].map((c,i)=><Card key={i} style={{cursor:"pointer"}} onClick={()=>showToast("📖 Contenu ouvert")}>
          <div style={{fontSize:24,marginBottom:8}}>{c.icon}</div>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{c.titre}</div>
          <div style={{display:"flex",gap:6,marginBottom:8}}><Pill color={C.purple}>{c.type}</Pill><span style={{fontSize:10,color:C.muted}}>par {c.auteur}</span></div>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{c.desc}</div>
        </Card>)}
      </div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {contenu.map((c,i)=><Card key={i} style={{cursor:"pointer"}} onClick={()=>showToast("📖 Contenu ouvert")}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{c.titre}</div>
          <div style={{display:"flex",gap:6,marginBottom:8}}><Pill color={C.purple}>{c.type}</Pill><span style={{fontSize:10,color:C.muted}}>par {c.auteur}</span></div>
          {c.contenu&&<div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{c.contenu.slice(0,100)}...</div>}
        </Card>)}
      </div>}
    </div>}

    {/* ── CANDIDATURES ── */}
    {onglet==="candidatures"&&<div>
      <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>📋 Candidatures en attente ({candidatures.filter(c=>c.statut==="en_attente").length})</div>
      {candidatures.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:11,color:C.muted}}>Aucune candidature pour le moment.</div>
      </Card>:<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {candidatures.map((c,i)=><Card key={i}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:700}}>{c.nom}</div>
              <div style={{fontSize:11,color:C.muted}}>{c.email} · {c.metier}</div>
              {c.coopte_par&&<div style={{fontSize:10,color:C.gold}}>Coopté par : {c.coopte_par}</div>}
              {c.message&&<div style={{fontSize:11,color:C.muted,marginTop:4,fontStyle:"italic"}}>"{c.message.slice(0,80)}..."</div>}
            </div>
            <div style={{display:"flex",gap:6}}>
              <Pill color={c.statut==="en_attente"?C.orange:c.statut==="accepté"?C.green:C.red}>{c.statut}</Pill>
              {c.statut==="en_attente"&&<>
                <Btn onClick={()=>showToast("✅ Candidature acceptée")} style={{fontSize:10,padding:"4px 8px",background:C.green}}>✅ Accepter</Btn>
                <BtnGhost onClick={()=>showToast("❌ Candidature refusée")} style={{fontSize:10,color:C.red,borderColor:`${C.red}44`}}>✕ Refuser</BtnGhost>
              </>}
            </div>
          </div>
        </Card>)}
      </div>}
    </div>}

    {/* ── AVANTAGES ── */}
    {onglet==="avantages"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
      {[
        {icon:"🤖",titre:"IA Match Business",desc:"Claude identifie automatiquement les meilleures synergies chaque semaine",color:C.purple},
        {icon:"💼",titre:"Co-investissement",desc:"Investissez aux côtés des membres Club sur des projets sélectionnés",color:C.gold},
        {icon:"⚡",titre:"Speed Meetings",desc:"20 minutes chrono avec n'importe quel membre, lien visio automatique",color:C.blue},
        {icon:"🌍",titre:"Annuaire privé mondial",desc:"Accès à l'annuaire complet 18+ pays avec coordonnées directes",color:C.teal},
        {icon:"📅",titre:"Événements VIP",desc:"Dîners privés, tables rondes, soirées networking exclusives",color:C.orange},
        {icon:"📚",titre:"Contenu exclusif",desc:"Analyses, masterclass, rapports sectoriels réservés aux membres",color:C.green},
        {icon:"🤝",titre:"Deals réseau",desc:"Proposez et concluez des deals directement avec les membres",color:C.pink},
        {icon:"⭐",titre:"Score de réputation",desc:"Score basé sur vos interactions — les meilleurs membres sont mis en avant",color:C.gold},
      ].map((a,i)=><Card key={i} style={{borderColor:`${a.color}33`,textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:8}}>{a.icon}</div>
        <div style={{fontSize:13,fontWeight:700,color:a.color,marginBottom:6}}>{a.titre}</div>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{a.desc}</div>
      </Card>)}
    </div>}

    {/* ── STATS ── */}
    {onglet==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>📊 Activité du club</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <CT><div style={{fontSize:9,color:C.muted}}>Membres actifs</div><div style={{fontSize:22,fontWeight:700,color:C.blue}}>{membres.length}</div></CT>
          <CT><div style={{fontSize:9,color:C.muted}}>Deals conclus</div><div style={{fontSize:22,fontWeight:700,color:C.green}}>{deals.filter(d=>d.statut==="validé").length}</div></CT>
          <CT><div style={{fontSize:9,color:C.muted}}>CA réseau total</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(totalCA)}</div></CT>
          <CT><div style={{fontSize:9,color:C.muted}}>Taux engagement</div><div style={{fontSize:22,fontWeight:700,color:C.teal}}>84%</div></CT>
        </div>
      </Card>
      <Card>
        <STitle>💰 Revenus Club Xyra</STitle>
        {[["Abonnements annuels (2 000€/an)",fmt(membres.length*2000),C.gold],["Commissions deals (5%)",fmt(deals.filter(d=>d.statut==="validé").reduce((a,d)=>a+d.valeur*0.05,0)),C.green],["Co-investissements",fmt(coinvestissements.reduce((a,c)=>a+Number(c.montant_total||0)*0.02,0)),C.blue],["Total annuel estimé",fmt(membres.length*2000+deals.filter(d=>d.statut==="validé").reduce((a,d)=>a+d.valeur*0.05,0)),C.teal]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
      </Card>
    </div>}
  </div>;
};

export default PageClubAffaires;
