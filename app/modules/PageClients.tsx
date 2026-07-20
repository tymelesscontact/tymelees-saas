"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, KPI, STitle, Pill, Inp, Sel, SM, inits } from "../lib/ui";
import { PARTENAIRES } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageClients=({plan,showToast,profil,setPage,UpgradeWall,activeCompany})=>{
  const[clients,setClients]=useState([]);
  const[loadingClients,setLoadingClients]=useState(true);
  const[sel,setSel]=useState(null);
  const[onglet,setOnglet]=useState("liste");
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",email:"",tel:"",ville:"",metier:""});

  const loadAll=async()=>{
    try{
      const companyParam=activeCompany?.id?`?company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/clients'+companyParam);
      const data=await res.json();
      if(data.clients)setClients(data.clients);
    }catch(e){console.error("Clients:",e);}
    setLoadingClients(false);
  };
  useEffect(()=>{loadAll();},[activeCompany]);
  useEffect(()=>{if(sel)setSel(s=>clients.find(c=>c.id===s.id)||null);},[clients]);

  const enriched=clients;

  const tabs=[{id:"liste",label:"👥 Clients"},{id:"solvabilite",label:"🎯 Solvabilité"},{id:"tunnel",label:"📈 Tunnel de vente"},{id:"upsell",label:"⚡ Upsell auto"},{id:"stats",label:"📊 Stats"}];
  const scoreColor=(s)=>s>=80?C.green:s>=60?C.gold:s>=40?C.orange:C.red;
  const scoreLabel=(s)=>s>=80?"Excellent":s>=60?"Bon":s>=40?"Moyen":"Risqué";

  if(!hasAccess(plan,"clients"))return <div style={{padding:20}}><UpgradeWall page="clients" plan={plan}/></div>;

  const ajouterClient=async()=>{
    if(!addForm.nom)return showToast("⚠️ Le nom est requis");
    try{
      const res=await fetch('/api/clients',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',...addForm})});
      const data=await res.json();
      if(data.success){
        showToast(`✅ ${data.client.nom} ajouté !`);
        setAddForm({nom:"",email:"",tel:"",ville:"",metier:""});setShowAdd(false);
        loadAll();
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const toggleVip=async(c)=>{
    try{
      await fetch('/api/clients',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'toggle_vip',id:c.id,vip:!c.vip})});
      showToast(c.vip?"✅ Statut VIP retiré":"⭐ Statut VIP accordé !");
      loadAll();
    }catch(e){showToast("❌ Erreur");}
  };

  const changerTunnel=async(c,tunnel)=>{
    try{
      await fetch('/api/clients',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id:c.id,tunnel})});
      loadAll();
    }catch(e){showToast("❌ Erreur");}
  };

  const ouvrirWhatsApp=(tel)=>{
    if(!tel)return showToast("⚠️ Aucun numéro renseigné");
    window.open(`https://wa.me/${tel.replace(/\D/g,"")}`,"_blank");
  };

  const envoyerEmail=async(c,message,sujet)=>{
    if(!c.email)return showToast("⚠️ Aucun email renseigné");
    showToast("⏳ Envoi en cours...");
    try{
      const res=await fetch('/api/clients',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_email',id:c.id,email:c.email,subject:sujet,message})});
      const data=await res.json();
      if(data.success){showToast(`✅ Email envoyé à ${c.nom}`);loadAll();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const creerDevisPour=(c)=>{
    showToast(`📋 Sélectionne ${c.nom} dans le nouveau devis`);
    setPage&&setPage("devis");
  };

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◬ {profil?.termes?.clients||"Clients"}</div>
        <div style={{fontSize:11,color:C.muted}}>Fiches · Solvabilité · Upsell · Tunnel · Échanges · {clients.length} {profil?.termes?.clients||"clients"}</div></div>
      <Btn onClick={()=>setShowAdd(s=>!s)}>+ Nouveau client</Btn>
    </div>

    {showAdd&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>Nouveau client</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Nom","nom"],["Email","email"],["Téléphone","tel"],["Ville","ville"],["Métier","metier"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={addForm[k]} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={ajouterClient}>✅ Ajouter</Btn>
        <BtnGhost onClick={()=>setShowAdd(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    {loadingClients&&<div style={{fontSize:11,color:C.muted,marginBottom:12}}>Chargement...</div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <KPI label="Total clients" val={clients.length} color={C.blue}/>
      <KPI label="VIP" val={clients.filter(c=>c.vip).length} color={C.gold}/>
      <KPI label="CA total" val={fmt(enriched.reduce((a,c)=>a+c.ca,0))} color={C.green}/>
      <KPI label="Score moyen" val={clients.length?Math.round(enriched.reduce((a,c)=>a+c.score,0)/clients.length)+"/100":"—"} color={C.teal}/>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>{setOnglet(t.id);setSel(null);}} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── LISTE + FICHE ── */}
    {onglet==="liste"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>👥 Liste clients</STitle>
        {!loadingClients&&clients.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucun client pour le moment.</div>}
        {enriched.map((c,i)=><div key={c.id} onClick={()=>setSel(sel?.id===c.id?null:c)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${C.border}22`,cursor:"pointer",background:sel?.id===c.id?`${C.gold}08`:"transparent",borderRadius:4}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:C.blue+"22",border:`2px solid ${C.blue}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.blue,flexShrink:0,position:"relative"}}>
            {inits(c.nom)}
            {c.vip&&<div style={{position:"absolute",top:-3,right:-3,width:12,height:12,borderRadius:"50%",background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7}}>★</div>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700}}>{c.nom}</div>
            <div style={{fontSize:10,color:C.muted}}>{c.pays} {c.ville} · {c.metier}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <Pill color={c.vip?C.gold:C.green}>{c.vip?"VIP":"actif"}</Pill>
            <div style={{fontSize:11,color:C.green,fontWeight:700,marginTop:2}}>{fmt(c.ca)}</div>
          </div>
        </div>)}
      </Card>
      {sel?<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card style={{borderColor:`${C.blue}44`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:50,height:50,borderRadius:"50%",background:C.blue+"22",border:`2px solid ${C.blue}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:C.blue}}>{inits(sel.nom)}</div>
            <div><div style={{fontSize:16,fontWeight:700}}>{sel.nom}{sel.vip&&<span style={{color:C.gold}}> ★ VIP</span>}</div><div style={{fontSize:11,color:C.muted}}>{sel.pays} {sel.ville} · {sel.metier}</div></div>
          </div>
          {[["📧",sel.email||"—"],["📱",sel.tel||"—"],["💰 CA total",fmt(sel.ca)],["🎯 Score solv.",`${sel.score}/100 — ${scoreLabel(sel.score)}`]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>)}
        </Card>
        <Card>
          <STitle>💬 Historique échanges</STitle>
          {(!sel.echanges||sel.echanges.length===0)&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:10}}>Aucun échange enregistré encore.</div>}
          {(sel.echanges||[]).map((e,i)=><div key={e.id||i} style={{background:C.card2,borderRadius:7,padding:8,marginBottom:6,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><Pill color={e.type==="WhatsApp"?C.green:C.blue}>{e.type}</Pill><span style={{fontSize:9,color:C.muted}}>{new Date(e.created_at).toLocaleDateString("fr")} · {e.sens==="reçu"?"← Reçu":"→ Envoyé"}</span></div>
            <div style={{fontSize:11,color:C.text,fontStyle:"italic"}}>"{e.message}"</div>
          </div>)}
        </Card>
        <Card>
          <STitle>⚡ Actions rapides</STitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <Btn onClick={()=>ouvrirWhatsApp(sel.tel)} style={{fontSize:11}}>📱 WhatsApp</Btn>
            <Btn onClick={()=>creerDevisPour(sel)} style={{fontSize:11,background:C.blue}}>◧ Créer devis</Btn>
            <BtnGhost onClick={()=>envoyerEmail(sel,"Je reviens vers vous concernant votre dossier.","Suivi de votre dossier")} style={{fontSize:11}}>📧 Email</BtnGhost>
            <BtnGhost onClick={()=>toggleVip(sel)} style={{fontSize:11,color:C.gold,borderColor:`${C.gold}44`}}>{sel.vip?"Retirer VIP":"⭐ Mettre VIP"}</BtnGhost>
          </div>
        </Card>
      </div>:<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:8}}>👆</div><div style={{color:C.muted,fontSize:12}}>Clique sur un client pour voir sa fiche</div></Card>}
    </div>}

    {/* ── SOLVABILITÉ ── */}
    {onglet==="solvabilite"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.blue,fontWeight:600,marginBottom:6}}>🎯 SCORE DE SOLVABILITÉ XYRA — calculé depuis tes vraies factures</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>Basé sur l'historique réel de paiement : base 50, +8 par facture payée, −15 par facture en retard. <b style={{color:C.green}}>80-100 = Excellent</b> · <b style={{color:C.gold}}>60-79 = Bon</b> · <b style={{color:C.orange}}>40-59 = Moyen</b> · <b style={{color:C.red}}>0-39 = Risqué</b></div>
      </div>
      {enriched.length===0&&<Card style={{textAlign:"center",padding:24}}><div style={{fontSize:12,color:C.muted}}>Aucun client pour le moment.</div></Card>}
      {enriched.map((c,i)=><Card key={c.id} style={{marginBottom:10,borderColor:`${scoreColor(c.score)}33`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:C.blue+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:C.blue}}>{inits(c.nom)}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{c.nom}</div><div style={{fontSize:10,color:C.muted}}>{c.metier}</div></div>
          <div style={{textAlign:"center",background:`${scoreColor(c.score)}22`,border:`2px solid ${scoreColor(c.score)}44`,borderRadius:10,padding:"8px 16px"}}>
            <div style={{fontSize:24,fontWeight:700,color:scoreColor(c.score)}}>{c.score}</div>
            <div style={{fontSize:9,color:scoreColor(c.score),fontWeight:600}}>{scoreLabel(c.score)}</div>
          </div>
        </div>
        <SM val={c.score} max={100} color={scoreColor(c.score)}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:10}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Factures payées</div><div style={{fontSize:11,fontWeight:700,color:C.text}}>{c.factures_payees}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Incidents paiement</div><div style={{fontSize:11,fontWeight:700,color:c.factures_retard>0?C.red:C.green}}>{c.factures_retard}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>CA réalisé</div><div style={{fontSize:11,fontWeight:700,color:C.gold}}>{fmt(c.ca)}</div></CT>
        </div>
        <div style={{marginTop:8,display:"flex",gap:6}}>
          <Pill color={c.score>=60?C.green:C.red}>{c.score>=80?"✅ Travailler sans conditions":c.score>=60?"✅ Travailler avec acompte":c.score>=40?"⚠️ Acompte 50% obligatoire":"❌ Déconseillé — risque élevé"}</Pill>
        </div>
      </Card>)}
    </div>}

    {/* ── TUNNEL DE VENTE ── */}
    {onglet==="tunnel"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
        {[["🆕 Nouveau",clients.filter(c=>c.tunnel==="nouveau"||!c.tunnel).length,C.blue],["💬 Négociation",clients.filter(c=>c.tunnel==="negociation").length,C.gold],["✅ Client régulier",clients.filter(c=>c.tunnel==="client_regulier").length,C.green],["⭐ VIP fidèle",clients.filter(c=>c.tunnel==="vip_fidele").length,C.purple]].map(([l,v,c],i)=><CT key={i} style={{textAlign:"center",borderColor:`${c}33`}}><div style={{fontSize:11,fontWeight:600,color:c,marginBottom:4}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div></CT>)}
      </div>
      <Card>
        <STitle>🤖 Relances automatiques</STitle>
        {enriched.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun client pour le moment.</div>}
        {enriched.map((c,i)=><div key={c.id} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:700}}>{c.nom}</span>
            <Sel value={c.tunnel||"nouveau"} onChange={e=>changerTunnel(c,e.target.value)} style={{fontSize:10}}>
              <option value="nouveau">Nouveau</option><option value="negociation">Négociation</option><option value="client_regulier">Client régulier</option><option value="vip_fidele">VIP fidèle</option>
            </Sel>
          </div>
          <div style={{fontSize:11,color:C.muted,marginBottom:6}}>
            {c.tunnel==="negociation"?"→ Proposition geste commercial / devis ajusté":c.tunnel==="client_regulier"?"→ Offre fidélité + upsell service supérieur":c.tunnel==="vip_fidele"?"→ Invitation événement VIP + offre exclusive":"→ Envoi présentation Xyra + devis découverte"}
          </div>
          <Btn onClick={()=>c.tel?(ouvrirWhatsApp(c.tel),showToast(`📱 WhatsApp ouvert pour ${c.nom}`)):envoyerEmail(c,"Je reviens vers vous suite à notre échange précédent.","Suivi")} style={{fontSize:10,padding:"5px 10px"}}>Lancer relance</Btn>
        </div>)}
      </Card>
    </div>}

    {/* ── UPSELL ── */}
    {onglet==="upsell"&&<div>
      <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:10,color:C.gold,fontWeight:600,marginBottom:6}}>⚡ UPSELL — basé sur ton CA réel par client</div>
      </div>
      {enriched.length===0&&<Card style={{textAlign:"center",padding:24}}><div style={{fontSize:12,color:C.muted}}>Aucun client pour le moment.</div></Card>}
      {enriched.map((c,i)=>{const upsellCA=Math.round(c.ca*0.4);const texte=c.vip?`${c.nom} est VIP. Proposez un contrat annuel exclusif avec 10% de remise. Valeur estimée : ${fmt(c.ca*1.5)}/an.`:c.ca>3000?`${c.nom} a déjà généré ${fmt(c.ca)} de CA. Bon moment pour proposer un abonnement mensuel avec remise.`:`${c.nom} est un profil récent ou avec peu d'historique. Commencez par un 2ème service complémentaire.`;return <Card key={c.id} style={{marginBottom:10,borderColor:`${C.gold}22`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontSize:13,fontWeight:700}}>{c.nom}</div><div style={{fontSize:10,color:C.muted}}>{c.metier} · CA : {fmt(c.ca)}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.gold}}>Potentiel upsell</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>+{fmt(upsellCA)}</div></div>
        </div>
        <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}22`,borderRadius:8,padding:10,marginBottom:10}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:3}}>💡 Recommandation</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{texte}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>envoyerEmail(c,texte,"Une proposition pour vous")} style={{flex:1,fontSize:11}}>📧 Envoyer proposition</Btn>
          <BtnGhost onClick={()=>creerDevisPour(c)} style={{flex:1,fontSize:11}}>◧ Créer devis</BtnGhost>
        </div>
      </Card>;})}
    </div>}

    {/* ── STATS ── */}
    {onglet==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>💰 CA par client</STitle>
        {enriched.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucune donnée pour le moment.</div>}
        {[...enriched].sort((a,b)=>b.ca-a.ca).map((c,i)=><div key={c.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{c.nom}</span><span style={{color:C.green,fontWeight:700}}>{fmt(c.ca)}</span></div><SM val={c.ca} max={Math.max(...enriched.map(x=>x.ca),1)} color={C.blue}/></div>)}
      </Card>
      <Card>
        <STitle>🎯 Scores de solvabilité</STitle>
        {[...enriched].sort((a,b)=>b.score-a.score).map((c,i)=><div key={c.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{c.nom}</span><span style={{color:scoreColor(c.score),fontWeight:700}}>{c.score}/100</span></div><SM val={c.score} max={100} color={scoreColor(c.score)}/></div>)}
      </Card>
    </div>}
  </div>;
};

// ─── PAGE PARTENAIRES ─────────────────────────────────────────

export default PageClients;
