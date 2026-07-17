"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp, Sel, SM } from "../lib/ui";

const PageCartes=({plan,showToast})=>{
  const[cartes,setCartes]=useState([]);
  const[transactions,setTransactions]=useState([]);
  const[budgets,setBudgets]=useState([]);
  const[enAttente,setEnAttente]=useState([]);
  const[loading,setLoading]=useState(true);
  const[view,setView]=useState("grille");
  const[onglet,setOnglet]=useState("cartes");
  const[showForm,setShowForm]=useState(false);
  const[showBudgetForm,setShowBudgetForm]=useState(false);
  const[analyseIA,setAnalyseIA]=useState("");
  const[iaLoading,setIaLoading]=useState(false);
  const[alertes,setAlertes]=useState([]);
  const[newCarte,setNewCarte]=useState({nom:"",limite:1000,devise:"EUR",couleur:C.blue,type:"standard",collaborateur:"",projet:"",ephemere:false});
  const[newBudget,setNewBudget]=useState({projet:"",budget_total:""});

  const load=async()=>{
    setLoading(true);
    try{
      const[cartesRes,txRes,budgetsRes,enAttenteRes]=await Promise.all([
        fetch('/api/cartes?action=cartes').then(r=>r.json()).catch(()=>({})),
        fetch('/api/cartes?action=transactions_all').then(r=>r.json()).catch(()=>({})),
        fetch('/api/cartes?action=budgets').then(r=>r.json()).catch(()=>({})),
        fetch('/api/cartes?action=en_attente').then(r=>r.json()).catch(()=>({})),
      ]);
      const cartesData=cartesRes.cartes||[];
      setCartes(cartesData.length>0?cartesData:INIT_CARTES);
      setTransactions(txRes.transactions||[]);
      setBudgets(budgetsRes.budgets||[]);
      setEnAttente(enAttenteRes.transactions||[]);
      setAlertes(cartesData.filter(c=>c.statut==="active"&&(c.solde/c.limite)*100>=80));
    }catch(e){setCartes(INIT_CARTES);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const creerCarte=async()=>{
    if(!newCarte.nom)return showToast("⚠️ Nom requis");
    try{
      const res=await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',...newCarte})});
      const d=await res.json();
      if(d.success){showToast("💳 Carte créée !");setShowForm(false);setNewCarte({nom:"",limite:1000,devise:"EUR",couleur:C.blue,type:"standard",collaborateur:"",projet:"",ephemere:false});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  const toggleCarte=async(id,statut)=>{
    try{
      await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'toggle',id,statut_actuel:statut})});
      showToast("✅ Statut carte mis à jour");load();
    }catch(e){showToast("❌ Erreur");}
  };

  const supprimerCarte=async(id)=>{
    if(!confirm("Supprimer cette carte ?"))return;
    try{
      await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',id})});
      showToast("🗑 Carte supprimée");load();
    }catch(e){showToast("❌ Erreur");}
  };

  const approuverTransaction=async(tx)=>{
    try{
      await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'approuver_transaction',id:tx.id,carte_id:tx.carte_id,montant:tx.montant})});
      showToast("✅ Transaction approuvée");load();
    }catch(e){showToast("❌ Erreur");}
  };

  const analyserIA=async()=>{
    setIaLoading(true);
    try{
      const res=await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyser_ia',cartes})});
      const d=await res.json();
      if(d.success)setAnalyseIA(d.analyse);
    }catch(e){}
    setIaLoading(false);
  };

  const creerBudget=async()=>{
    if(!newBudget.projet||!newBudget.budget_total)return showToast("⚠️ Projet et budget requis");
    try{
      await fetch('/api/cartes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_budget',...newBudget})});
      showToast("✅ Budget créé");setShowBudgetForm(false);setNewBudget({projet:"",budget_total:""});load();
    }catch(e){showToast("❌ Erreur");}
  };

  const tabs=[
    {id:"cartes",label:"💳 Mes cartes"},
    {id:"transactions",label:`📋 Transactions${transactions.length>0?" ("+transactions.length+")":""}`},
    {id:"approbations",label:`⏳ Approbations${enAttente.length>0?" ("+enAttente.length+")":""}`},
    {id:"budgets",label:"📊 Budgets projets"},
    {id:"analyse",label:"🤖 Analyse IA"},
    {id:"securite",label:"🛡 Sécurité"},
  ];

  const totalUtilise=cartes.filter(c=>c.devise==="EUR").reduce((a,c)=>a+Number(c.solde||0),0);
  const totalLimite=cartes.filter(c=>c.devise==="EUR").reduce((a,c)=>a+Number(c.limite||0),0);
  const cartesActives=cartes.filter(c=>c.statut==="active"||c.statut==="éphémère").length;

  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement des cartes...</div></div>;

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◈ Cartes Virtuelles</div>
        <div style={{fontSize:11,color:C.muted}}>Visa virtuelles · Supabase · Assignation projet/collaborateur · Approbations</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        {enAttente.length>0&&<div style={{background:`${C.orange}22`,border:`1px solid ${C.orange}44`,borderRadius:8,padding:"6px 12px",fontSize:11,color:C.orange,fontWeight:700}}>⏳ {enAttente.length} en attente</div>}
        <BtnGhost onClick={()=>setView(view==="liste"?"grille":"liste")} style={{fontSize:11}}>{view==="liste"?"⊞ Grille":"☰ Liste"}</BtnGhost>
        <Btn onClick={()=>setShowForm(true)}>+ Nouvelle carte</Btn>
      </div>
    </div>

    {/* ALERTES */}
    {alertes.length>0&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.orange,marginBottom:6}}>⚠️ {alertes.length} carte(s) proche(s) du plafond</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {alertes.map((a,i)=><div key={i} style={{background:`${C.orange}22`,borderRadius:6,padding:"4px 10px",fontSize:11}}>
          <span style={{color:C.text}}>{a.nom}</span> — <span style={{color:C.orange,fontWeight:700}}>{Math.round((a.solde/a.limite)*100)}%</span> · reste {fmt(a.limite-a.solde)}
        </div>)}
      </div>
    </div>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CARTES ACTIVES</div><div style={{fontSize:22,fontWeight:700,color:C.green}}>{cartesActives}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>UTILISÉ (EUR)</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(totalUtilise)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>LIMITE TOTALE</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>{fmt(totalLimite)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>DISPONIBLE</div><div style={{fontSize:18,fontWeight:700,color:C.purple}}>{fmt(totalLimite-totalUtilise)}</div></CT>
      <CT style={{borderColor:`${C.orange}33`}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>EN ATTENTE</div><div style={{fontSize:18,fontWeight:700,color:C.orange}}>{enAttente.length}</div></CT>
    </div>

    {/* FORM NOUVELLE CARTE */}
    {showForm&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>+ Créer une carte virtuelle</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={newCarte.nom} onChange={e=>setNewCarte(c=>({...c,nom:e.target.value}))} placeholder="Ex: Abou — Missions"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Plafond</label><Inp type="number" value={newCarte.limite} onChange={e=>setNewCarte(c=>({...c,limite:Number(e.target.value)}))}/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise</label><Sel value={newCarte.devise} onChange={e=>setNewCarte(c=>({...c,devise:e.target.value}))}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Collaborateur</label><Inp value={newCarte.collaborateur} onChange={e=>setNewCarte(c=>({...c,collaborateur:e.target.value}))} placeholder="Thomas, Abou, Fatou..."/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Projet / Mission</label><Inp value={newCarte.projet} onChange={e=>setNewCarte(c=>({...c,projet:e.target.value}))} placeholder="Airbnb Paris, Jet Dubaï..."/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Type</label>
          <Sel value={newCarte.type} onChange={e=>setNewCarte(c=>({...c,type:e.target.value}))}>
            <option value="standard">Standard</option>
            <option value="ephemere">Éphémère (usage unique)</option>
            <option value="projet">Par projet</option>
            <option value="collaborateur">Par collaborateur</option>
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Couleur</label>
          <input type="color" value={newCarte.couleur} onChange={e=>setNewCarte(c=>({...c,couleur:e.target.value}))} style={{width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:6,background:"transparent",cursor:"pointer"}}/>
        </div>
      </div>
      {newCarte.type==="ephemere"&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,marginBottom:10,fontSize:11,color:C.orange}}>
        ⚡ Carte éphémère — se désactive automatiquement après le premier paiement.
      </div>}
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={creerCarte}>💳 Créer la carte</Btn>
        <BtnGhost onClick={()=>setShowForm(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── MES CARTES ── */}
    {onglet==="cartes"&&<div style={{display:"grid",gridTemplateColumns:view==="grille"?"repeat(auto-fill,minmax(280px,1fr))":"1fr",gap:12}}>
      {cartes.map((c,i)=>{
        const pct=c.limite>0?Math.round((Number(c.solde||0)/Number(c.limite||1))*100):0;
        const barColor=pct>=80?C.red:pct>=60?C.orange:C.green;
        return <div key={c.id||i} style={{background:`linear-gradient(135deg,${c.couleur||C.blue}22,${C.card})`,border:`1px solid ${c.couleur||C.blue}44`,borderRadius:14,padding:20,position:"relative"}}>
          {c.statut==="bloquée"&&<div style={{position:"absolute",top:10,right:10}}><Pill color={C.red}>🔒 Bloquée</Pill></div>}
          {c.statut==="éphémère"&&<div style={{position:"absolute",top:10,right:10}}><Pill color={C.orange}>⚡ Éphémère</Pill></div>}
          {c.statut==="expirée"&&<div style={{position:"absolute",top:10,right:10}}><Pill color={C.muted}>✕ Expirée</Pill></div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text}}>{c.nom}</div>
            <div style={{fontSize:16,color:c.couleur||C.blue,fontWeight:700}}>{c.reseau||"Visa"}</div>
          </div>
          <div style={{fontFamily:"'Courier New',monospace",fontSize:13,color:C.muted,marginBottom:10,letterSpacing:"0.1em"}}>{c.numero}</div>
          {c.collaborateur&&<div style={{fontSize:10,color:C.muted,marginBottom:3}}>👤 {c.collaborateur}</div>}
          {c.projet&&<div style={{fontSize:10,color:C.muted,marginBottom:8}}>📋 {c.projet}</div>}
          <div style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
              <span style={{color:C.muted}}>Utilisé</span>
              <span style={{color:barColor,fontWeight:700}}>{fmt(Number(c.solde||0))} / {fmt(Number(c.limite||0))} · {pct}%</span>
            </div>
            <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:Math.min(100,pct)+"%",background:barColor,borderRadius:2}}/>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:10}}>
            <span>Exp: {c.expiry||"12/28"}</span><span>CVV: {c.cvv||"•••"}</span><span>{c.devise||"EUR"}</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            <BtnGhost onClick={()=>toggleCarte(c.id,c.statut)} style={{flex:1,fontSize:10,color:c.statut==="active"?C.orange:C.green}}>
              {c.statut==="active"?"🔒 Geler":"🔓 Activer"}
            </BtnGhost>
            <BtnGhost onClick={()=>{navigator.clipboard?.writeText(c.numero?.replace(/[•]/g,"")||"");showToast("✅ Numéro copié");}} style={{fontSize:10}}>📋</BtnGhost>
            <BtnGhost onClick={()=>supprimerCarte(c.id)} style={{fontSize:10,color:C.red,borderColor:`${C.red}33`}}>✕</BtnGhost>
          </div>
        </div>;
      })}
    </div>}

    {/* ── TRANSACTIONS ── */}
    {onglet==="transactions"&&<Card>
      <STitle>📋 Historique transactions — toutes cartes</STitle>
      {transactions.length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucune transaction enregistrée.</div>:
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
          <thead><tr><TH>Date</TH><TH>Carte</TH><TH>Libellé</TH><TH>Catégorie</TH><TH>Montant</TH><TH>Statut</TH></tr></thead>
          <tbody>{transactions.slice(0,50).map((t,i)=><tr key={i}>
            <Td style={{fontSize:10,color:C.muted}}>{new Date(t.date_transaction||t.created_at).toLocaleDateString("fr")}</Td>
            <Td style={{fontSize:11}}>{t.cartes_virtuelles?.nom||"—"}</Td>
            <Td style={{fontWeight:600}}>{t.libelle}</Td>
            <Td><Pill color={C.blue}>{t.categorie||"Autres"}</Pill></Td>
            <Td style={{color:t.sens==="debit"?C.red:C.green,fontWeight:700}}>{t.sens==="debit"?"-":"+"}{fmt(Number(t.montant||0))}</Td>
            <Td><Pill color={t.statut==="approuvé"?C.green:t.statut==="en_attente"?C.orange:C.red}>{t.statut}</Pill></Td>
          </tr>)}</tbody>
        </table>
      </div>}
    </Card>}

    {/* ── APPROBATIONS ── */}
    {onglet==="approbations"&&<div>
      {enAttente.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>✅</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Aucune transaction en attente</div>
        <div style={{fontSize:11,color:C.muted}}>Toutes les transactions ont été traitées.</div>
      </Card>:<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:12,fontSize:11,color:C.text}}>
          ⏳ Ces transactions ont été soumises par vos collaborateur et attendent votre validation. Une notification WhatsApp vous a été envoyée pour chaque demande.
        </div>
        {enAttente.map((t,i)=><Card key={i} style={{borderColor:`${C.orange}44`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:700}}>{t.libelle}</div>
              <div style={{fontSize:11,color:C.muted}}>Carte : {t.cartes_virtuelles?.nom||"—"} · {new Date(t.created_at).toLocaleDateString("fr")}</div>
              <Pill color={C.blue}>{t.categorie||"Autres"}</Pill>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:20,fontWeight:700,color:C.orange,marginBottom:8}}>{fmt(Number(t.montant||0))}</div>
              <div style={{display:"flex",gap:6}}>
                <Btn onClick={()=>approuverTransaction(t)} style={{fontSize:11,padding:"6px 12px",background:C.green}}>✅ Approuver</Btn>
                <BtnGhost onClick={()=>showToast("❌ Transaction refusée")} style={{fontSize:11,color:C.red,borderColor:`${C.red}44`}}>✕ Refuser</BtnGhost>
              </div>
            </div>
          </div>
        </Card>)}
      </div>}
    </div>}

    {/* ── BUDGETS PROJETS ── */}
    {onglet==="budgets"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <Btn onClick={()=>setShowBudgetForm(true)} style={{fontSize:11}}>+ Créer un budget projet</Btn>
      </div>
      {showBudgetForm&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
        <STitle>+ Nouveau budget projet</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom du projet</label><Inp value={newBudget.projet} onChange={e=>setNewBudget(b=>({...b,projet:e.target.value}))} placeholder="Airbnb Paris, Jet Dubaï..."/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Budget total (€)</label><Inp type="number" value={newBudget.budget_total} onChange={e=>setNewBudget(b=>({...b,budget_total:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creerBudget}>✅ Créer</Btn><BtnGhost onClick={()=>setShowBudgetForm(false)}>Annuler</BtnGhost></div>
      </Card>}
      {budgets.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:11,color:C.muted}}>Aucun budget projet. Crée-en un pour suivre les dépenses par mission.</div>
      </Card>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {budgets.map((b,i)=>{
          const cartesProjet=cartes.filter(c=>c.projet===b.projet);
          const depense=cartesProjet.reduce((a,c)=>a+Number(c.solde||0),0);
          const pct=b.budget_total>0?Math.round(depense/b.budget_total*100):0;
          return <Card key={i} style={{borderColor:`${C.blue}33`}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{b.projet}</div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:6}}>
              <span style={{color:C.muted}}>Dépensé</span>
              <span style={{color:pct>=80?C.red:C.gold,fontWeight:700}}>{fmt(depense)} / {fmt(b.budget_total)} ({pct}%)</span>
            </div>
            <SM val={pct} max={100} color={pct>=80?C.red:pct>=60?C.orange:C.green}/>
            <div style={{fontSize:10,color:C.muted,marginTop:6}}>{cartesProjet.length} carte(s) rattachée(s)</div>
          </Card>;
        })}
      </div>}
    </div>}

    {/* ── ANALYSE IA ── */}
    {onglet==="analyse"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse IA des dépenses — Claude Sonnet</div>
        {iaLoading?<div style={{fontSize:11,color:C.muted}}>⏳ Analyse en cours...</div>:<div style={{fontSize:12,color:C.text,lineHeight:1.8}}>{analyseIA||"Clique sur Analyser pour obtenir une analyse IA de tes dépenses par carte."}</div>}
        <BtnGhost onClick={analyserIA} style={{marginTop:8,fontSize:10}}>{iaLoading?"⏳...":"🤖 Analyser les dépenses"}</BtnGhost>
      </div>
      <Card>
        <STitle>📊 Utilisation par carte</STitle>
        {cartes.map((c,i)=>{
          const pct=c.limite>0?Math.round((Number(c.solde||0)/Number(c.limite||1))*100):0;
          return <div key={i} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <div><span style={{fontWeight:600}}>{c.nom}</span>{c.collaborateur&&<span style={{color:C.muted,fontSize:10}}> · {c.collaborateur}</span>}</div>
              <div><span style={{color:pct>=80?C.red:pct>=60?C.orange:C.green,fontWeight:700}}>{pct}%</span><span style={{color:C.muted,fontSize:10,marginLeft:8}}>{fmt(Number(c.solde||0))} / {fmt(Number(c.limite||0))}</span></div>
            </div>
            <SM val={pct} max={100} color={pct>=80?C.red:pct>=60?C.orange:C.green}/>
          </div>;
        })}
      </Card>
    </div>}

    {/* ── SÉCURITÉ ── */}
    {onglet==="securite"&&<Card>
      <STitle>🛡 Sécurité & Contrôles globaux</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        <CT><div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Dépenses max/jour</div><Inp placeholder="500 €"/></CT>
        <CT><div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Pays autorisés</div><Inp placeholder="FR, AE, SN..."/></CT>
        <CT><div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Catégories bloquées</div><Inp placeholder="Jeux, alcool..."/></CT>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[["🔔 Alertes WhatsApp à chaque transaction",true],["✅ Approbation manager requise >500€",true],["📍 Limitation géographique activée",false],["⏰ Désactivation auto la nuit (22h-7h)",false],["🔒 Authentification 3D Secure obligatoire",true]].map(([label,actif],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:C.card2,borderRadius:8,fontSize:12}}>
          <span>{label}</span>
          <div style={{width:36,height:20,borderRadius:10,background:actif?C.green:C.border,position:"relative",cursor:"pointer"}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:actif?18:2,transition:"left 0.2s"}}/>
          </div>
        </div>)}
      </div>
    </Card>}
  </div>;
};



export default PageCartes;
