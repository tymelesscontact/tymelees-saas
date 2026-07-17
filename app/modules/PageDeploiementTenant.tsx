"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp, Sel, SM, St } from "../lib/ui";
import { CLIENTS } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageDeploiementTenant=({plan,showToast,UpgradeWall})=>{
  const[tenants,setTenants]=useState([]);
  const[loading,setLoading]=useState(true);
  const[onglet,setOnglet]=useState("tenants");
  const[selectedClient,setSelectedClient]=useState(null);
  const[searchQ,setSearchQ]=useState("");
  const[filterPlan,setFilterPlan]=useState("tous");
  const[filterStatut,setFilterStatut]=useState("tous");
  const[mrr,setMrr]=useState(0);
  const[stats,setStats]=useState({actifs:0,essais:0,churnes:0,inactifs:0,commissions:0,arr:0});
  const[analyseChurn,setAnalyseChurn]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[upsellEmail,setUpsellEmail]=useState("");
  const[showProvision,setShowProvision]=useState(false);
  const[provisionForm,setProvisionForm]=useState({societe:"",email:"",plan:"starter",pays:"France",metier:""});
  const[showRevendeurForm,setShowRevendeurForm]=useState(false);
  const[revendeurForm,setRevendeurForm]=useState({nom:"",email:"",societe:"",tel:"",message:"",plan_revendeur:""});
  const[revendeurLoading,setRevendeurLoading]=useState(false);

  const envoyerDemandeRevendeur=async()=>{
    if(!revendeurForm.nom||!revendeurForm.email||!revendeurForm.societe)return showToast("⚠️ Nom, email et société requis");
    setRevendeurLoading(true);
    try{
      const res=await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'demande_revendeur',...revendeurForm})});
      const d=await res.json();
      if(d.success){showToast("✅ Demande envoyée ! WhatsApp + email reçus par l'équipe Xyra");setShowRevendeurForm(false);setRevendeurForm({nom:"",email:"",societe:"",tel:"",message:"",plan_revendeur:""});}
      else showToast("❌ Erreur");
    }catch(e){showToast("❌ Erreur");}
    setRevendeurLoading(false);
  };

  const calcSolvabilite=(t)=>{
    let score=50;
    if(t.plan==="enterprise")score+=20;
    else if(t.plan==="business_pro"||t.plan==="business")score+=10;
    if(t.pays&&["France","Allemagne","Royaume-Uni","Émirats arabes unis (Dubaï)","États-Unis","Canada"].includes(t.pays))score+=15;
    if(t.taille==="20+")score+=15;
    else if(t.taille==="6 à 20")score+=10;
    else if(t.taille==="2 à 5")score+=5;
    if(t.statut==="actif")score+=10;
    if(t.created_at){const days=(Date.now()-new Date(t.created_at).getTime())/(1000*60*60*24);if(days>30)score+=5;}
    return Math.min(100,score);
  };

  const scoreCouleur=(s)=>s>=80?C.green:s>=50?C.gold:C.red;
  const scoreLabel=(s)=>s>=80?"🟢 Solvable":s>=50?"🟡 Moyen":"🔴 Risqué";

  const load=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/deploiement?action=dashboard');
      const d=await res.json();
      if(d.tenants){
        setTenants(d.tenants);
        setMrr(d.mrr||0);
        setStats({actifs:d.actifs||0,essais:d.essais||0,churnes:d.churnes||0,inactifs:d.inactifs||0,commissions:d.commissions||0,arr:d.arr||0});
      }
    }catch(e){
      // Fallback Supabase direct
      try{
        const {createClient}=await import('@supabase/supabase-js');
        const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const{data}=await sb.from('tenants').select('*').order('created_at',{ascending:false});
        if(data){
          setTenants(data);
          const m=data.reduce((a,t)=>a+(t.plan_price||0),0);
          setMrr(m);
          setStats({actifs:data.filter(t=>t.statut==="actif").length,essais:data.filter(t=>t.statut==="essai").length,churnes:data.filter(t=>t.statut==="suspendu").length,inactifs:0,commissions:m*0.05,arr:m*12});
        }
      }catch(e2){console.error(e2);}
    }
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const filtered=tenants.filter(t=>{
    const q=searchQ.toLowerCase();
    const matchQ=!q||t.societe?.toLowerCase().includes(q)||t.email?.toLowerCase().includes(q)||t.pays?.toLowerCase().includes(q);
    const matchPlan=filterPlan==="tous"||t.plan===filterPlan;
    const matchStatut=filterStatut==="tous"||t.statut===filterStatut;
    return matchQ&&matchPlan&&matchStatut;
  });

  const churn=stats.churnes;
  const essai=stats.essais;
  const actifs=stats.actifs;
  const arr=stats.arr;
  const ltv=mrr>0?mrr*24:0;
  const tauxConv=tenants.length>0?Math.round((actifs/tenants.length)*100):0;
  const planColors={starter:C.blue,business:C.gold,business_pro:C.gold,enterprise:C.purple,multi_societes:C.teal,multi_pro:C.orange,holding:C.gold};

  const lancerAnalyseChurn=async()=>{
    setIaLoading(true);
    try{
      const aRisque=tenants.filter(t=>t.statut==="essai"||calcSolvabilite(t)<50).map(t=>({...t,health_score:calcSolvabilite(t)}));
      const res=await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'scoring_churn',tenants:aRisque})});
      const d=await res.json();
      if(d.success)setAnalyseChurn(d.analyse);
    }catch(e){}
    setIaLoading(false);
  };

  const genererUpsell=async(t)=>{
    try{
      const res=await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_upsell',societe:t.societe,plan:t.plan,metier:t.metier,taille:t.taille})});
      const d=await res.json();
      if(d.success){setUpsellEmail(d.email);showToast("✅ Email upsell généré");}
    }catch(e){showToast("❌ Erreur");}
  };

  const alerterInactifs=async()=>{
    const inactifs=tenants.filter(t=>t.statut==="actif");
    try{
      await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'alerte_inactifs',inactifs})});
      showToast("✅ Alertes inactifs envoyées");
    }catch(e){showToast("❌ Erreur");}
  };

  const envoyerRapport=async()=>{
    showToast("⏳ Envoi rapport mensuel...");
    try{
      await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rapport_mensuel',mrr,actifs,essais:essai,churnes:churn,commissions:stats.commissions})});
      showToast("✅ Rapport mensuel envoyé");
    }catch(e){showToast("❌ Erreur");}
  };

  const provisionner=async()=>{
    if(!provisionForm.societe||!provisionForm.email)return showToast("⚠️ Société et email requis");
    try{
      const res=await fetch('/api/deploiement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'provisioner_tenant',...provisionForm})});
      const d=await res.json();
      if(d.success){showToast("✅ Client provisionné + notif WhatsApp");setShowProvision(false);setProvisionForm({societe:"",email:"",plan:"starter",pays:"France",metier:""});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  if(!hasAccess(plan,"deploiement"))return <div style={{padding:20}}><UpgradeWall page="Déploiement SaaS" plan={plan}/></div>;

  // ── FICHE CLIENT ──────────────────────────────────────────────
  if(selectedClient){
    const t=selectedClient;
    const score=calcSolvabilite(t);
    const daysLeft=t.trial_ends_at?Math.max(0,Math.ceil((new Date(t.trial_ends_at)-Date.now())/(1000*60*60*24))):0;
    return <div style={{padding:20}}>
      <Btn onClick={()=>setSelectedClient(null)} style={{marginBottom:16,fontSize:12}}>← Retour</Btn>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:C.gold}}>{t.societe?.[0]||"?"}</div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:C.text}}>{t.societe}</div>
              <div style={{fontSize:11,color:C.muted}}>{t.email}</div>
              <div style={{fontSize:11,color:C.muted}}>{t.metier} · {t.pays}</div>
            </div>
          </div>
          {[["Plan",t.plan||"—"],["Prix",fmt(t.plan_price||0)+"/mois"],["Taille",t.taille||"—"],["Statut",t.statut||"—"],["Inscrit le",t.created_at?new Date(t.created_at).toLocaleDateString("fr"):"—"]].map(([l,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{l}</span><span style={{fontWeight:600}}>{v}</span></div>)}
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card style={{borderColor:`${scoreCouleur(score)}44`}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:4}}>SCORE DE SOLVABILITÉ</div>
            <div style={{fontSize:48,fontWeight:700,color:scoreCouleur(score),fontFamily:"Georgia,serif"}}>{score}</div>
            <div style={{fontSize:11,color:scoreCouleur(score)}}>{scoreLabel(score)}</div>
            <SM val={score} max={100} color={scoreCouleur(score)}/>
          </Card>
          {t.statut==="essai"&&daysLeft>0&&<Card style={{borderColor:`${C.orange}44`}}>
            <div style={{fontSize:9,color:C.orange,marginBottom:4}}>ESSAI GRATUIT</div>
            <div style={{fontSize:28,fontWeight:700,color:C.orange}}>{daysLeft} jours</div>
            <div style={{fontSize:11,color:C.muted}}>restants avant expiration</div>
          </Card>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>⚡ Actions rapides</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Btn onClick={()=>genererUpsell(t)} style={{fontSize:11}}>🤖 Générer email upsell IA</Btn>
            <BtnGhost onClick={()=>showToast("📧 Email de relance envoyé")} style={{fontSize:11}}>📧 Email de relance</BtnGhost>
            <BtnGhost onClick={()=>showToast("💬 WhatsApp ouvert")} style={{fontSize:11}}>💬 WhatsApp</BtnGhost>
            <BtnGhost onClick={()=>showToast("🔒 Compte suspendu")} style={{fontSize:11,color:C.red,borderColor:`${C.red}44`}}>🔒 Suspendre</BtnGhost>
          </div>
        </Card>
        {upsellEmail&&<Card style={{borderColor:`${C.purple}44`}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 EMAIL UPSELL IA GÉNÉRÉ</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.7,whiteSpace:"pre-line"}}>{upsellEmail}</div>
          <div style={{display:"flex",gap:6,marginTop:10}}>
            <Btn onClick={()=>showToast("📧 Email envoyé !")} style={{fontSize:10}}>📧 Envoyer</Btn>
            <BtnGhost onClick={()=>{navigator.clipboard?.writeText(upsellEmail);showToast("✅ Copié");}} style={{fontSize:10}}>📋 Copier</BtnGhost>
          </div>
        </Card>}
      </div>
    </div>;
  }

  const tabs=[
    {id:"tenants",label:"👥 Clients"},
    {id:"metrics",label:"📊 Métriques"},
    {id:"churn",label:"🤖 Analyse Churn IA"},
    {id:"revendeurs",label:"🚀 Revendeurs"},
    {id:"certification",label:"🏆 Certification"},
  ];

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>🚀 Déploiement SaaS</div>
        <div style={{fontSize:11,color:C.muted}}>Clients · MRR · Health Score · Churn IA · Upsell auto · Revendeurs</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={envoyerRapport} style={{fontSize:11}}>📱 Rapport mensuel</BtnGhost>
        <BtnGhost onClick={alerterInactifs} style={{fontSize:11,color:C.orange,borderColor:`${C.orange}44`}}>🔔 Alertes inactifs</BtnGhost>
        <Btn onClick={()=>setShowProvision(true)} style={{fontSize:11}}>+ Provisionner client</Btn>
      </div>
    </div>

    {/* FORM PROVISION */}
    {showProvision&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>+ Provisionner un nouveau client</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Société *</label><Inp value={provisionForm.societe} onChange={e=>setProvisionForm(f=>({...f,societe:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email *</label><Inp value={provisionForm.email} onChange={e=>setProvisionForm(f=>({...f,email:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Plan</label>
          <Sel value={provisionForm.plan} onChange={e=>setProvisionForm(f=>({...f,plan:e.target.value}))}>
            <option value="starter">Starter — 59€/mois</option>
            <option value="business_pro">Business Pro — 129€/mois</option>
            <option value="enterprise">Enterprise — 249€/mois</option>
            <option value="multi_societes">Multi-Sociétés — 499€/mois</option>
            <option value="multi_pro">Multi-Sociétés Pro — 799€/mois</option>
            <option value="holding">Holding — 1 200€/mois</option>
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Pays</label><Inp value={provisionForm.pays} onChange={e=>setProvisionForm(f=>({...f,pays:e.target.value}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Métier</label><Inp value={provisionForm.metier} onChange={e=>setProvisionForm(f=>({...f,metier:e.target.value}))}/></div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={provisionner}>✅ Provisionner + notifier</Btn><BtnGhost onClick={()=>setShowProvision(false)}>Annuler</BtnGhost></div>
    </Card>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:14}}>
      <CT style={{borderColor:`${C.green}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>MRR</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(mrr)}</div><div style={{fontSize:9,color:C.muted}}>Récurrent/mois</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>ARR</div><div style={{fontSize:16,fontWeight:700,color:C.teal}}>{fmt(arr)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>ACTIFS</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>{actifs}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>ESSAIS</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{essai}</div></CT>
      <CT style={{borderColor:`${C.red}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>CHURNS</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>{churn}</div></CT>
      <CT style={{borderColor:`${C.gold}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>COMMISSIONS 5%</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(stats.commissions)}</div></CT>
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── CLIENTS ── */}
    {onglet==="tenants"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <Inp value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher société, email, pays..." style={{flex:1,minWidth:200}}/>
        <Sel value={filterPlan} onChange={e=>setFilterPlan(e.target.value)}>
          <option value="tous">Tous les plans</option>
          {["starter","business_pro","enterprise","multi_societes","multi_pro","holding"].map(p=><option key={p} value={p}>{p}</option>)}
        </Sel>
        <Sel value={filterStatut} onChange={e=>setFilterStatut(e.target.value)}>
          <option value="tous">Tous les statuts</option>
          {["essai","actif","suspendu","expiré"].map(s=><option key={s} value={s}>{s}</option>)}
        </Sel>
      </div>
      {loading?<div style={{fontSize:11,color:C.muted}}>⏳ Chargement...</div>:
      tenants.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>🚀</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucun client encore</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Les clients inscrits sur xyraio.fr apparaissent ici automatiquement.</div>
        <Btn onClick={()=>setShowProvision(true)}>+ Provisionner un client</Btn>
      </Card>:
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <STitle>{filtered.length} client(s) trouvé(s)</STitle>
          <BtnGhost onClick={()=>{const csv=["Société,Plan,Prix,Statut,Pays,Email"].concat(filtered.map(t=>`${t.societe},${t.plan},${t.plan_price},${t.statut},${t.pays},${t.email}`)).join("\n");const b=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="clients_xyra.csv";a.click();showToast("✅ CSV exporté");}} style={{fontSize:10}}>📋 CSV</BtnGhost>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
            <thead><tr><TH>Société</TH><TH>Plan</TH><TH>Prix/mois</TH><TH>Score</TH><TH>Statut</TH><TH>Pays</TH><TH>Inscrit</TH><TH>Action</TH></tr></thead>
            <tbody>{filtered.map((t,i)=>{
              const score=calcSolvabilite(t);
              return <tr key={i} style={{background:t.statut==="suspendu"?`${C.red}08`:"transparent"}}>
                <Td>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.gold}}>{t.societe?.[0]||"?"}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700}}>{t.societe||"—"}</div>
                      <div style={{fontSize:9,color:C.muted}}>{t.email}</div>
                    </div>
                  </div>
                </Td>
                <Td><Pill color={planColors[t.plan]||C.gold}>{t.plan||"starter"}</Pill></Td>
                <Td style={{color:C.green,fontWeight:700}}>{fmt(t.plan_price||0)}</Td>
                <Td>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:32,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:score+"%",height:"100%",background:scoreCouleur(score)}}/>
                    </div>
                    <span style={{fontSize:10,color:scoreCouleur(score),fontWeight:700}}>{score}</span>
                  </div>
                </Td>
                <Td><St s={t.statut}/></Td>
                <Td style={{fontSize:11,color:C.muted}}>{t.pays||"—"}</Td>
                <Td style={{fontSize:10,color:C.muted}}>{t.created_at?new Date(t.created_at).toLocaleDateString("fr"):"—"}</Td>
                <Td>
                  <div style={{display:"flex",gap:4}}>
                    <Btn onClick={()=>setSelectedClient(t)} style={{fontSize:9,padding:"3px 8px"}}>Voir</Btn>
                    {score<50&&<BtnGhost onClick={()=>showToast("📧 Demande envoyée")} style={{fontSize:9,padding:"3px 6px",color:C.red,borderColor:`${C.red}44`}}>⚠</BtnGhost>}
                  </div>
                </Td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      </Card>}
    </div>}

    {/* ── MÉTRIQUES ── */}
    {onglet==="metrics"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>📊 Métriques SaaS clés</STitle>
        {[["MRR (Revenus récurrents/mois)",fmt(mrr),C.green],["ARR (Annuel)",fmt(arr),C.teal],["LTV (Valeur vie client estimée)",fmt(ltv),C.blue],["Taux de conversion essai→payant",tauxConv+"%",tauxConv>=30?C.green:C.orange],["Commissions Xyra (5%)",fmt(stats.commissions),C.gold],["Taux de churn",tenants.length>0?Math.round(churn/tenants.length*100)+"%":"—",churn===0?C.green:C.red]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
      </Card>
      <Card>
        <STitle>📈 Répartition par plan</STitle>
        {["starter","business_pro","enterprise","multi_societes","multi_pro","holding"].map(p=>{
          const count=tenants.filter(t=>t.plan===p).length;
          if(count===0)return null;
          const total=tenants.length||1;
          const pct=Math.round(count/total*100);
          const revenu=tenants.filter(t=>t.plan===p).reduce((a,t)=>a+Number(t.plan_price||0),0);
          return <div key={p} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
              <span style={{color:planColors[p]||C.gold,fontWeight:600}}>{p.replace("_"," ").toUpperCase()}</span>
              <span style={{color:C.muted}}>{count} clients · {fmt(revenu)}/mois · {pct}%</span>
            </div>
            <SM val={pct} max={100} color={planColors[p]||C.gold}/>
          </div>;
        })}
      </Card>
    </div>}

    {/* ── ANALYSE CHURN IA ── */}
    {onglet==="churn"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Scoring prédictif Churn — Claude Sonnet</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseChurn||"Lance l'analyse pour identifier les clients à risque et obtenir des recommandations d'actions."}</div>}
        <BtnGhost onClick={lancerAnalyseChurn} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🤖 Analyser le risque de churn"}</BtnGhost>
      </div>
      <Card>
        <STitle>⚠️ Clients à surveiller (score {"<"} 50)</STitle>
        {tenants.filter(t=>calcSolvabilite(t)<50).length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>✅ Aucun client à risque élevé pour le moment.</div>:
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Société</TH><TH>Plan</TH><TH>Score</TH><TH>Statut</TH><TH>Action</TH></tr></thead>
          <tbody>{tenants.filter(t=>calcSolvabilite(t)<50).map((t,i)=>{
            const score=calcSolvabilite(t);
            return <tr key={i}>
              <Td style={{fontWeight:600}}>{t.societe||"—"}</Td>
              <Td><Pill color={planColors[t.plan]||C.gold}>{t.plan}</Pill></Td>
              <Td><span style={{color:scoreCouleur(score),fontWeight:700}}>{score}/100</span></Td>
              <Td><St s={t.statut}/></Td>
              <Td><div style={{display:"flex",gap:4}}>
                <Btn onClick={()=>genererUpsell(t)} style={{fontSize:9,padding:"3px 8px"}}>🤖 Upsell IA</Btn>
                <BtnGhost onClick={()=>showToast("📧 Relance envoyée")} style={{fontSize:9,color:C.orange}}>📧</BtnGhost>
              </div></Td>
            </tr>;
          })}</tbody>
        </table>}
      </Card>
    </div>}

    {/* ── REVENDEURS ── */}
    {onglet==="revendeurs"&&<div>
      <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:14,marginBottom:14,fontSize:11,color:C.text,lineHeight:1.7}}>
        🚀 Le programme revendeur Xyra permet à des agences et entrepreneurs de revendre Xyra sous leur propre marque. Chaque revendeur fixe ses propres prix, gère ses clients, et génère des revenus récurrents. Xyra garde une commission wholesale sur le volume.
      </div>

      {showRevendeurForm&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
        <STitle>📋 Demande de partenariat revendeur — {revendeurForm.plan_revendeur}</STitle>
        <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}22`,borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:C.text}}>
          📱 Ta demande sera envoyée immédiatement à l'équipe Xyra par <b>WhatsApp</b> et <b>email</b>. Réponse sous 24h.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={revendeurForm.nom} onChange={e=>setRevendeurForm(f=>({...f,nom:e.target.value}))} placeholder="Votre nom"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email *</label><Inp value={revendeurForm.email} onChange={e=>setRevendeurForm(f=>({...f,email:e.target.value}))} placeholder="contact@société.com"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Société *</label><Inp value={revendeurForm.societe} onChange={e=>setRevendeurForm(f=>({...f,societe:e.target.value}))} placeholder="Nom de votre agence"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Téléphone / WhatsApp</label><Inp value={revendeurForm.tel} onChange={e=>setRevendeurForm(f=>({...f,tel:e.target.value}))} placeholder="+33..."/></div>
          <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Message (optionnel)</label><Inp value={revendeurForm.message} onChange={e=>setRevendeurForm(f=>({...f,message:e.target.value}))} placeholder="Décrivez votre activité et vos clients cibles..."/></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={envoyerDemandeRevendeur} style={{background:C.gold,color:"#000"}}>{revendeurLoading?"⏳ Envoi...":"✅ Envoyer ma demande"}</Btn>
          <BtnGhost onClick={()=>setShowRevendeurForm(false)}>Annuler</BtnGhost>
        </div>
      </Card>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
        {[{plan:"White-label Starter",prix:"5 000€ setup + 500€/mois",clients:"Jusqu'à 10 clients",color:C.green,features:["Dashboard à votre marque","Domaine personnalisé","Panneau admin revendeur","Onboarding clients auto"]},{plan:"White-label Business",prix:"12 000€ setup + 1 000€/mois",clients:"Clients illimités",color:C.gold,highlight:true,features:["Tout Starter","API partenaire complète","Rapports revenus revendeur","Formation & certification","Co-marketing inclus"]},{plan:"White-label Enterprise",prix:"Sur devis",clients:"Infrastructure dédiée",color:C.purple,features:["Tout Business","SLA garanti 99.9%","Développements spécifiques","Account manager dédié"]}].map((p,i)=><Card key={i} style={{borderColor:`${p.color}44`}}>
          <div style={{fontSize:13,fontWeight:700,color:p.color,marginBottom:4}}>{p.plan}</div>
          <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{p.prix}</div>
          <div style={{fontSize:10,color:C.muted,marginBottom:10}}>{p.clients}</div>
          {p.features.map((f,j)=><div key={j} style={{fontSize:11,color:C.text,marginBottom:6,display:"flex",gap:6}}><span style={{color:p.color}}>◆</span>{f}</div>)}
          <Btn onClick={()=>{setRevendeurForm(f=>({...f,plan_revendeur:p.plan}));setShowRevendeurForm(true);}} style={{width:"100%",fontSize:11,marginTop:10,background:p.highlight?p.color:"transparent",color:p.highlight?"#000":p.color,border:`1px solid ${p.color}44`}}>Devenir revendeur →</Btn>
        </Card>)}
      </div>
      <Card>
        <STitle>💰 Revenus partagés automatiques</STitle>
        <div style={{fontSize:11,color:C.text,lineHeight:1.7,marginBottom:12}}>
          Si vous apportez un nouveau client Xyra hors de votre périmètre de revendeur, vous touchez automatiquement une commission de <b style={{color:C.gold}}>15%</b> sur le premier mois, virée via Flutterwave dans les 30 jours suivant l'encaissement.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Plan Starter (59€)","8.85€ de commission",C.blue],["Plan Business Pro (129€)","19.35€ de commission",C.gold],["Plan Enterprise (249€)","37.35€ de commission",C.purple]].map(([l,v,c],i)=><CT key={i}><div style={{fontSize:11,fontWeight:600,color:c,marginBottom:4}}>{l}</div><div style={{fontSize:12,color:C.text}}>{v}</div></CT>)}
        </div>
      </Card>
    </div>}

    {/* ── CERTIFICATION ── */}
    {onglet==="certification"&&<div>
      <div style={{background:`linear-gradient(135deg,${C.card},#0a0a1a)`,border:`1px solid ${C.gold}44`,borderRadius:12,padding:24,marginBottom:14,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:8}}>🏆</div>
        <div style={{fontSize:18,fontWeight:700,color:C.gold,marginBottom:4}}>Programme de Certification Revendeur Xyra</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Devenez un Revendeur Certifié Xyra et accédez à des avantages exclusifs</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,textAlign:"left"}}>
          {[{niveau:"🥉 Certifié",cond:"1 client actif + formation complétée",avantages:["Badge Certifié sur l'annuaire","Support prioritaire","Kit marketing Xyra"]},{niveau:"🥈 Expert",cond:"5 clients actifs + 3 mois d'activité",avantages:["Badge Expert","Commission +5%","Co-marketing Xyra","Accès bêta nouvelles fonctionnalités"]},{niveau:"🥇 Partenaire Elite",cond:"15 clients actifs + 1 an d'activité",avantages:["Badge Elite","Account manager dédié","Commission +10%","Invitation événements Xyra","Logo sur site Xyra"]}].map((n,i)=><Card key={i} style={{borderColor:`${[C.orange,C.muted,C.gold][i]}44`}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>{n.niveau}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>{n.cond}</div>
            {n.avantages.map((a,j)=><div key={j} style={{fontSize:11,color:C.text,marginBottom:4,display:"flex",gap:6}}><span style={{color:C.gold}}>◆</span>{a}</div>)}
          </Card>)}
        </div>
      </div>
    </div>}
  </div>;
};


// ─── PAGE API ─────────────────────────────────────────────────

export default PageDeploiementTenant;
