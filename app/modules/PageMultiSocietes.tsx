"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td } from "../lib/ui";

const PageMultiSocietes=({plan,showToast,UpgradeWall})=>{
  const[onglet,setOnglet]=useState("consolidee");
  const[companies,setCompanies]=useState([]);
  const[consolidee,setConsolidee]=useState([]);
  const[totaux,setTotaux]=useState(null);
  const[transfers,setTransfers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[devise,setDevise]=useState("EUR");
  const[showAddForm,setShowAddForm]=useState(false);
  const[showTransferForm,setShowTransferForm]=useState(false);
  const[newCompany,setNewCompany]=useState({nom:"",pays:"France",metier:"",devise:"EUR",couleur:"#C9A84C"});
  const[newTransfer,setNewTransfer]=useState({from_company_id:"",to_company_id:"",montant:"",devise:"EUR",libelle:""});
  const[selectedCompany,setSelectedCompany]=useState(null);

  const MULTI_PLANS=["multi_societes","multi_pro","multi_societes_pro","holding","enterprise","owner"];
  if(!MULTI_PLANS.includes(plan))return <div style={{padding:20}}><UpgradeWall page="Multi-Sociétés" plan={plan}/></div>;

  const load=async()=>{
    setLoading(true);
    try{
      const [listRes,consolRes,transfersRes]=await Promise.all([
        fetch('/api/multi-societes?action=list'),
        fetch(`/api/multi-societes?action=consolidee&devise=${devise}`),
        fetch('/api/multi-societes?action=transfers'),
      ]);
      const [list,consol,trans]=await Promise.all([listRes.json(),consolRes.json(),transfersRes.json()]);
      setCompanies(list.companies||[]);
      setConsolidee(consol.consolidee||[]);
      setTotaux(consol.totaux||null);
      setTransfers(trans.transfers||[]);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[devise]);

  const ajouterSociete=async()=>{
    if(!newCompany.nom)return showToast("⚠️ Nom requis");
    try{
      const res=await fetch('/api/multi-societes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_company',...newCompany})});
      const d=await res.json();
      if(d.success){showToast("✅ Société ajoutée");setShowAddForm(false);setNewCompany({nom:"",pays:"France",metier:"",devise:"EUR",couleur:"#C9A84C"});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  const supprimerSociete=async(id)=>{
    if(!confirm("Supprimer cette société ?"))return;
    try{
      await fetch('/api/multi-societes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete_company',id})});
      showToast("✅ Société supprimée");load();
    }catch(e){showToast("❌ Erreur");}
  };

  const effectuerTransfert=async()=>{
    if(!newTransfer.from_company_id||!newTransfer.to_company_id||!newTransfer.montant)return showToast("⚠️ Remplis tous les champs");
    if(newTransfer.from_company_id===newTransfer.to_company_id)return showToast("⚠️ Même société source et destination");
    try{
      const res=await fetch('/api/multi-societes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'intercompany_transfer',...newTransfer})});
      const d=await res.json();
      if(d.success){showToast("✅ Transfert effectué");setShowTransferForm(false);setNewTransfer({from_company_id:"",to_company_id:"",montant:"",devise:"EUR",libelle:""});load();}
      else showToast("❌ "+d.error);
    }catch(e){showToast("❌ Erreur");}
  };

  const tabs=[
    {id:"consolidee",label:"📊 Vue consolidée"},
    {id:"societes",label:"🏢 Mes sociétés"},
    {id:"intercompany",label:"🔄 Transferts inter-sociétés"},
    {id:"alertes",label:"🔔 Alertes croisées"},
  ];

  const scoreColor=(solde)=>solde>10000?C.green:solde>2000?C.gold:C.red;

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>🏢 Multi-Sociétés</div>
        <div style={{fontSize:11,color:C.muted}}>Vue consolidée · Gestion multi-entités · Transferts · Alertes croisées</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Sel value={devise} onChange={e=>setDevise(e.target.value)}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
        <Btn onClick={()=>setShowAddForm(true)} style={{fontSize:11}}>+ Ajouter une société</Btn>
      </div>
    </div>

    {/* FORM AJOUT SOCIÉTÉ */}
    {showAddForm&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>+ Nouvelle société</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={newCompany.nom} onChange={e=>setNewCompany(c=>({...c,nom:e.target.value}))} placeholder="Ex: Tymeless CI"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Pays</label><Inp value={newCompany.pays} onChange={e=>setNewCompany(c=>({...c,pays:e.target.value}))} placeholder="France"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Métier</label><Inp value={newCompany.metier} onChange={e=>setNewCompany(c=>({...c,metier:e.target.value}))} placeholder="Nettoyage"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise</label>
          <Sel value={newCompany.devise} onChange={e=>setNewCompany(c=>({...c,devise:e.target.value}))}>
            {DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Couleur</label><input type="color" value={newCompany.couleur} onChange={e=>setNewCompany(c=>({...c,couleur:e.target.value}))} style={{width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:6,background:"transparent",cursor:"pointer"}}/></div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={ajouterSociete}>✅ Créer la société</Btn>
        <BtnGhost onClick={()=>setShowAddForm(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    {/* FORM TRANSFERT */}
    {showTransferForm&&<Card style={{marginBottom:14,borderColor:`${C.blue}44`}}>
      <STitle>🔄 Nouveau transfert inter-sociétés</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Société source *</label>
          <Sel value={newTransfer.from_company_id} onChange={e=>setNewTransfer(t=>({...t,from_company_id:e.target.value}))}>
            <option value="">Sélectionner...</option>
            {companies.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Société destination *</label>
          <Sel value={newTransfer.to_company_id} onChange={e=>setNewTransfer(t=>({...t,to_company_id:e.target.value}))}>
            <option value="">Sélectionner...</option>
            {companies.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
          </Sel>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant *</label><Inp type="number" value={newTransfer.montant} onChange={e=>setNewTransfer(t=>({...t,montant:e.target.value}))} placeholder="0"/></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise</label>
          <Sel value={newTransfer.devise} onChange={e=>setNewTransfer(t=>({...t,devise:e.target.value}))}>
            {DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}
          </Sel>
        </div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Libellé</label><Inp value={newTransfer.libelle} onChange={e=>setNewTransfer(t=>({...t,libelle:e.target.value}))} placeholder="Ex: Avance de trésorerie"/></div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={effectuerTransfert} style={{background:C.blue}}>✅ Effectuer le transfert</Btn>
        <BtnGhost onClick={()=>setShowTransferForm(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    {/* KPIs CONSOLIDÉS */}
    {totaux&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>SOCIÉTÉS</div><div style={{fontSize:24,fontWeight:700,color:C.gold}}>{companies.length}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CA TOTAL CONSOLIDÉ</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(conv(totaux.ca,"EUR",devise),devise)}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:4}}>CHARGES TOTALES</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>{fmt(conv(totaux.charges,"EUR",devise),devise)}</div></CT>
      <CT style={{borderColor:`${totaux.solde>0?C.green:C.red}44`}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>SOLDE CONSOLIDÉ</div><div style={{fontSize:18,fontWeight:700,color:totaux.solde>0?C.green:C.red}}>{fmt(conv(totaux.solde,"EUR",devise),devise)}</div></CT>
    </div>}

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {loading&&<div style={{fontSize:11,color:C.muted}}>⏳ Chargement...</div>}

    {/* ── VUE CONSOLIDÉE ── */}
    {!loading&&onglet==="consolidee"&&<div>
      {consolidee.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>🏢</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucune société encore</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Ajoutez votre première société pour voir la vue consolidée.</div>
        <Btn onClick={()=>setShowAddForm(true)}>+ Ajouter une société</Btn>
      </Card>:<div>
        {/* Graphique comparatif */}
        <Card style={{marginBottom:12}}>
          <STitle>📊 Comparaison CA par société</STitle>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120,padding:"10px 0"}}>
            {consolidee.map((c,i)=>{
              const maxCA=Math.max(...consolidee.map(x=>x.ca),1);
              const h=Math.max(8,Math.round((c.ca/maxCA)*100));
              return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontSize:9,color:C.muted}}>{fmt(c.ca)}</div>
                <div style={{width:"100%",height:h+"%",background:c.couleur||C.gold,borderRadius:"4px 4px 0 0",minHeight:8,opacity:0.8}}/>
                <div style={{fontSize:9,color:C.muted,textAlign:"center",lineHeight:1.2}}>{c.nom}</div>
              </div>;
            })}
          </div>
        </Card>
        {/* Cards par société */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {consolidee.map((c,i)=><Card key={i} style={{borderColor:`${c.couleur||C.gold}44`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:c.couleur||C.gold}}>{c.nom}</div>
                <div style={{fontSize:11,color:C.muted}}>{c.metier} · {c.pays} · {c.devise}</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <BtnGhost onClick={()=>setSelectedCompany(c)} style={{fontSize:10,padding:"4px 8px"}}>Détails</BtnGhost>
                <BtnGhost onClick={()=>supprimerSociete(c.id)} style={{fontSize:10,padding:"4px 8px",color:C.red,borderColor:`${C.red}44`}}>✕</BtnGhost>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              <CT style={{textAlign:"center",padding:"8px 4px"}}><div style={{fontSize:8,color:C.muted}}>CA</div><div style={{fontSize:13,fontWeight:700,color:C.green}}>{fmt(conv(c.ca,"EUR",devise),devise)}</div></CT>
              <CT style={{textAlign:"center",padding:"8px 4px"}}><div style={{fontSize:8,color:C.muted}}>CHARGES</div><div style={{fontSize:13,fontWeight:700,color:C.red}}>{fmt(conv(c.charges,"EUR",devise),devise)}</div></CT>
              <CT style={{textAlign:"center",padding:"8px 4px",borderColor:`${scoreColor(c.solde)}44`}}><div style={{fontSize:8,color:C.muted}}>SOLDE</div><div style={{fontSize:13,fontWeight:700,color:scoreColor(c.solde)}}>{fmt(conv(c.solde,"EUR",devise),devise)}</div></CT>
            </div>
          </Card>)}
        </div>
      </div>}
    </div>}

    {/* ── MES SOCIÉTÉS ── */}
    {!loading&&onglet==="societes"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <Btn onClick={()=>setShowAddForm(true)} style={{fontSize:11}}>+ Ajouter une société</Btn>
      </div>
      {companies.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:11,color:C.muted}}>Aucune société. Ajoutez-en une pour commencer.</div>
      </Card>:<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {companies.map((c,i)=><Card key={i} style={{borderColor:`${c.couleur||C.gold}22`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:40,height:40,borderRadius:8,background:c.couleur||C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#000"}}>
                {c.nom?.[0]?.toUpperCase()||"?"}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{c.nom}</div>
                <div style={{fontSize:11,color:C.muted}}>{c.metier||"—"} · {c.pays} · {c.devise}</div>
                <div style={{fontSize:10,color:C.muted}}>Créée le {new Date(c.created_at).toLocaleDateString("fr")}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <Pill color={c.couleur||C.gold}>{c.statut}</Pill>
              <BtnGhost onClick={()=>supprimerSociete(c.id)} style={{fontSize:10,color:C.red,borderColor:`${C.red}44`}}>Supprimer</BtnGhost>
            </div>
          </div>
        </Card>)}
      </div>}
    </div>}

    {/* ── TRANSFERTS INTER-SOCIÉTÉS ── */}
    {!loading&&onglet==="intercompany"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        🔄 Les transferts inter-sociétés permettent de déplacer de la trésorerie d'une entité à une autre. Chaque transfert est tracé et horodaté.
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <Btn onClick={()=>setShowTransferForm(true)} style={{background:C.blue,fontSize:11}}>+ Nouveau transfert</Btn>
      </div>
      {transfers.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:11,color:C.muted}}>Aucun transfert inter-sociétés pour le moment.</div>
      </Card>:<Card>
        <STitle>📋 Historique des transferts</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Date</TH><TH>De</TH><TH>Vers</TH><TH>Montant</TH><TH>Libellé</TH><TH>Statut</TH></tr></thead>
          <tbody>{transfers.map((t,i)=>{
            const from=companies.find(c=>c.id===t.from_company_id);
            const to=companies.find(c=>c.id===t.to_company_id);
            return <tr key={i}>
              <Td style={{fontSize:10,color:C.muted}}>{new Date(t.created_at).toLocaleDateString("fr")}</Td>
              <Td style={{color:C.red,fontWeight:600}}>{from?.nom||"—"}</Td>
              <Td style={{color:C.green,fontWeight:600}}>{to?.nom||"—"}</Td>
              <Td style={{fontWeight:700}}>{fmt(t.montant)} {t.devise}</Td>
              <Td style={{color:C.muted,fontSize:11}}>{t.libelle||"—"}</Td>
              <Td><Pill color={C.green}>{t.statut}</Pill></Td>
            </tr>;
          })}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── ALERTES CROISÉES ── */}
    {!loading&&onglet==="alertes"&&<div>
      <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Alertes générées automatiquement sur toutes vos sociétés.</div>
      {consolidee.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:11,color:C.muted}}>Ajoutez des sociétés pour voir les alertes croisées.</div>
      </Card>:<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {consolidee.filter(c=>c.solde<2000).map((c,i)=><div key={i} style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:10,padding:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:4}}>🔴 Trésorerie critique — {c.nom}</div>
          <div style={{fontSize:11,color:C.text}}>Solde de {fmt(conv(c.solde,"EUR",devise),devise)} sous le seuil critique. Envisagez un transfert inter-sociétés pour renflouer cette entité.</div>
        </div>)}
        {consolidee.filter(c=>c.solde>=2000&&c.solde<5000).map((c,i)=><div key={i} style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:4}}>🟡 Trésorerie à surveiller — {c.nom}</div>
          <div style={{fontSize:11,color:C.text}}>Solde de {fmt(conv(c.solde,"EUR",devise),devise)} en zone d'alerte.</div>
        </div>)}
        {consolidee.filter(c=>c.solde>=5000).length===consolidee.length&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:10,padding:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>🟢 Toutes vos sociétés sont en bonne santé</div>
          <div style={{fontSize:11,color:C.text}}>Aucune alerte active sur vos {consolidee.length} sociétés.</div>
        </div>}
      </div>}
    </div>}
  </div>;
};


export default PageMultiSocietes;
