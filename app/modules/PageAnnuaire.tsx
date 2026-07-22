"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM, Tabs, St, inits } from "../lib/ui";
import { hasAccess } from "../lib/plans";
const PageAnnuaire=({plan,showToast,UpgradeWall,activeCompany,setPage})=>{
  const[contacts,setContacts]=useState([]);
  const[loadingContacts,setLoadingContacts]=useState(true);
  const[dealsReal,setDealsReal]=useState([]);
  const[loadingDeals,setLoadingDeals]=useState(true);
  const[showAddContact,setShowAddContact]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",type:"Partenaire",secteur:"",pays:"",ville:"",continent:"Europe",tel:"",email:"",bio:""});
  const loadContacts=async()=>{
    try{
      const res=await fetch('/api/annuaire?action=contacts');
      const data=await res.json();
      if(data.contacts)setContacts(data.contacts);
    }catch(e){console.error("Annuaire:",e);}
    setLoadingContacts(false);
  };
  const loadDeals=async()=>{
    try{
      const res=await fetch('/api/annuaire?action=deals');
      const data=await res.json();
      if(data.deals)setDealsReal(data.deals);
    }catch(e){console.error("Deals reseau:",e);}
    setLoadingDeals(false);
  };
  useEffect(()=>{loadContacts();loadDeals();},[]);
  const creerContact=async()=>{
    if(!addForm.nom)return showToast("⚠️ Nom requis");
    try{
      const res=await fetch('/api/annuaire',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_contact',...addForm})});
      const data=await res.json();
      if(data.success){showToast("✅ Contact ajoute au reseau");setShowAddContact(false);setAddForm({nom:"",type:"Partenaire",secteur:"",pays:"",ville:"",continent:"Europe",tel:"",email:"",bio:""});loadContacts();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const supprimerContact=async(id)=>{
    try{await fetch('/api/annuaire',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer_contact',id})});showToast("✅ Supprime");loadContacts();}
    catch(e){showToast("❌ Erreur");}
  };
  const contacterDirectement=async(r)=>{
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_conversation',espace:'externe',contact_nom:r.nom,contact_tel:r.tel,contact_email:r.email,contact_type:'partenaire'})});
      const data=await res.json();
      if(data.success){showToast(`✅ Conversation ouverte avec ${r.nom}`);setPage('chat');}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const demanderMiseEnRelation=async(r)=>{
    try{
      const res=await fetch('/api/annuaire',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'demander_mise_en_relation',reseau_contact_id:r.id,club_membre_nom:"Membre Club"})});
      const data=await res.json();
      if(data.success){showToast("✅ Demande envoyee - en attente de validation");loadDeals();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const validerMiseEnRelation=async(id)=>{
    try{await fetch('/api/annuaire',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'valider_mise_en_relation',id})});showToast("✅ Mise en relation validee");loadDeals();}
    catch(e){showToast("❌ Erreur");}
  };
  const [montantForm,setMontantForm]=useState({});
  const definirMontant=async(id)=>{
    const valeur=montantForm[id];
    if(!valeur)return showToast("⚠️ Indique un montant");
    try{
      const res=await fetch('/api/annuaire',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'definir_montant',id,valeur})});
      const data=await res.json();
      if(data.success){showToast(`✅ Deal conclu - commission: ${data.commission_montant}€`);loadDeals();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const marquerCommissionPayee=async(id)=>{
    try{await fetch('/api/annuaire',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'marquer_commission_payee',id})});showToast("✅ Commission marquee payee");loadDeals();}
    catch(e){showToast("❌ Erreur");}
  };
  const continents=["Tous","Europe","Afrique","Moyen-Orient","Amériques","Asie"];
  const secteurs=["Tous","Aviation de luxe","Yachting","Immobilier","Finance & Investissement","Commerce international","Tech & Innovation","Juridique & Conseil","Hôtellerie & Événements","Services aux entreprises","Conciergerie","Syndic & Gestion"];
  const types=["Tous","Partenaire","Apporteur d'affaires"];
  const[onglet,setOnglet]=useState("annuaire");
  const[search,setSearch]=useState("");
  const[filtreCont,setFiltreCont]=useState("Tous");
  const[filtreType,setFiltreType]=useState("Tous");
  const[filtreSect,setFiltreSect]=useState("Tous");
  const[sel,setSel]=useState(null);
  const tabs=[
    {id:"annuaire",label:"🌍 Annuaire mondial"},
    {id:"deals",label:"🤝 Deals réseau"},
  ];
  if(!hasAccess(plan,"annuaire"))return <div style={{padding:20}}><UpgradeWall page="Réseau & Annuaire" plan={plan}/></div>;
  const filtered=contacts.filter(r=>{
    const matchSearch=search===""||(r.nom||'').toLowerCase().includes(search.toLowerCase())||(r.secteur||'').toLowerCase().includes(search.toLowerCase())||(r.ville||'').toLowerCase().includes(search.toLowerCase());
    const matchCont=filtreCont==="Tous"||r.continent===filtreCont;
    const matchType=filtreType==="Tous"||r.type===filtreType;
    const matchSect=filtreSect==="Tous"||r.secteur===filtreSect;
    return matchSearch&&matchCont&&matchType&&matchSect;
  });
  const statsCont=continents.slice(1).map(c=>({nom:c,count:contacts.filter(r=>r.continent===c).length})).filter(c=>c.count>0);
  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{background:`linear-gradient(135deg,${C.card},#080818)`,border:`1px solid ${C.gold}33`,borderRadius:16,padding:20,marginBottom:16}}>
      <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",marginBottom:4}}>XYRA · RÉSEAU MONDIAL</div>
      <div style={{fontSize:22,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◱ Annuaire Business Mondial</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Partenaires · Apporteurs d'affaires · {contacts.length} contacts dans {statsCont.length} zones géographiques</div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        {statsCont.map((c,i)=>{const colors=[C.blue,C.gold,C.teal,C.green,C.purple];return <div key={i} style={{borderLeft:`2px solid ${colors[i%5]}`,paddingLeft:10}}><div style={{fontSize:9,color:C.muted}}>{c.nom}</div><div style={{fontSize:16,fontWeight:700,color:colors[i%5]}}>{c.count} contacts</div></div>;})}
      </div>
    </div>

    <div style={{marginBottom:14}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>

    {/* ─── ANNUAIRE ─────────────────────────────────────────── */}
    {onglet==="annuaire"&&<>
      {/* Filtres */}
      <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:8,marginBottom:16}}>
        <Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un contact, secteur, ville..."/>
        <Sel value={filtreCont} onChange={e=>setFiltreCont(e.target.value)} style={{minWidth:130}}>{continents.map(c=><option key={c}>{c}</option>)}</Sel>
        <Sel value={filtreType} onChange={e=>setFiltreType(e.target.value)} style={{minWidth:140}}>{types.map(t=><option key={t}>{t}</option>)}</Sel>
        <Sel value={filtreSect} onChange={e=>setFiltreSect(e.target.value)} style={{minWidth:160}}>{secteurs.map(s=><option key={s}>{s}</option>)}</Sel>
      </div>
      <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{filtered.length} contact(s) trouvé(s)</div>

      {sel?
        /* FICHE DÉTAILLÉE */
        <div>
          <BtnGhost onClick={()=>setSel(null)} style={{marginBottom:14}}>← Retour à l'annuaire</BtnGhost>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{borderColor:`${C.gold}33`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}>
                <div style={{width:60,height:60,borderRadius:"50%",background:`${C.gold}22`,border:`2px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:C.gold,flexShrink:0}}>{inits(sel.nom)}</div>
                <div>
                  <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:2}}>{sel.nom}</div>
                  <Pill color={sel.type==="Partenaire"?C.gold:sel.type==="Membre Club"?C.blue:C.green}>{sel.type}</Pill>
                  <div style={{fontSize:12,color:C.muted,marginTop:6}}>{sel.pays} {sel.ville} · {sel.continent}</div>
                </div>
              </div>
              <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}22`,borderRadius:8,padding:12,marginBottom:14,fontSize:12,color:C.text,lineHeight:1.7,fontStyle:"italic"}}>"{sel.bio}"</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[["📍 Localisation",`${sel.pays} ${sel.ville}`],["🏢 Secteur",sel.secteur],["📧 Email",sel.email],["📱 Téléphone",sel.tel]].filter(Boolean).map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:C.text}}>{v}</span></div>)}
              </div>
            </Card>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Card>
                <STitle>⚡ Actions rapides</STitle>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <Btn onClick={()=>demanderMiseEnRelation(sel)} style={{width:"100%"}}>🤝 Demander une mise en relation</Btn>
                  <Btn onClick={()=>contacterDirectement(sel)} style={{width:"100%",background:C.green}}>💬 Contacter directement</Btn>
                  <BtnGhost onClick={()=>showToast("📄 Fiche PDF exportée")} style={{width:"100%"}}>📄 Exporter fiche PDF</BtnGhost>
                </div>
              </Card>
              <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
                <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 Analyse IA — Potentiel business</div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{sel.secteur==="Aviation de luxe"||sel.secteur==="Yachting"?"Partenaire a tres fort potentiel. Ses clients ont un pouvoir d'achat eleve et recherchent des services premium complementaires.":"Nouveau contact a fort potentiel. Recommandation : envoyer une presentation personnalisee dans les 48h pour maximiser les chances de collaboration."}</div>
              </Card>
            </div>
          </div>
        </div>
      :
        /* GRILLE CONTACTS */
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {filtered.map((r,i)=><Card key={i} style={{cursor:"pointer",borderColor:`${C.border}`}} onClick={()=>setSel(r)}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:`${C.gold}18`,border:`1px solid ${C.gold}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:C.gold,flexShrink:0}}>{inits(r.nom)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nom}</div>
                <div style={{fontSize:10,color:C.muted}}>{r.pays} {r.ville}</div>
                <Pill color={r.type==="Partenaire"?C.gold:r.type==="Membre Club"?C.blue:C.green}>{r.type}</Pill>
              </div>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8,lineHeight:1.5}}>{r.bio.slice(0,80)}{r.bio.length>80?"...":""}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <Pill color={C.purple}>{r.secteur}</Pill>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              <Btn onClick={e=>{e.stopPropagation();demanderMiseEnRelation(r);}} style={{fontSize:10,padding:"6px 4px"}}>🤝 Demander mise en relation</Btn>
              <BtnGhost onClick={e=>{e.stopPropagation();showToast(`📱 WhatsApp ${r.nom}`);}} style={{fontSize:10,padding:"6px 4px"}}>📱 WA</BtnGhost>
            </div>
          </Card>)}
        </div>
      }
    </>}

    {/* ─── CARTE RÉSEAU ─────────────────────────────────────── */}

    {/* ─── DEALS RÉSEAU ─────────────────────────────────────── */}
    {onglet==="deals"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:16,fontWeight:700,color:C.text}}>🤝 Deals du réseau</div><div style={{fontSize:11,color:C.muted}}>Commission Xyra: 3% sur chaque deal conclu</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Demandes en attente" val={dealsReal.filter(d=>d.statut==="demande_mise_en_relation").length} color={C.orange}/>
        <KPI label="Deals conclus" val={dealsReal.filter(d=>d.statut==="conclu").length} color={C.green}/>
        <KPI label="Commissions totales" val={fmt(dealsReal.reduce((a,d)=>a+(Number(d.commission_montant)||0),0))} color={C.gold}/>
      </div>
      <Card>
        {loadingDeals?<div style={{textAlign:"center",padding:20,color:C.muted}}>Chargement...</div>:dealsReal.length===0?<div style={{textAlign:"center",padding:20,color:C.muted,fontSize:12}}>Aucun deal pour le moment.</div>:
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Contact réseau</TH><TH>Initiateur</TH><TH>Valeur</TH><TH>Commission (3%)</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{dealsReal.map((d,i)=><tr key={i}>
            <Td style={{fontWeight:600}}>{d.reseau_contacts?.nom||'—'}</Td>
            <Td style={{fontSize:11,color:C.muted}}>{d.initiateur||'—'}</Td>
            <Td style={{color:C.green,fontWeight:700}}>{d.valeur>0?fmt(d.valeur):"À définir"}</Td>
            <Td style={{color:C.gold,fontWeight:700}}>{d.commission_montant>0?fmt(d.commission_montant):"—"}</Td>
            <Td><Pill color={d.statut==="conclu"?C.green:d.statut==="valide"?C.blue:C.orange}>{d.statut}</Pill>{d.statut==="conclu"&&<Pill color={d.commission_statut==="payee"?C.green:C.red}>{d.commission_statut==="payee"?"Payée":"Non payée"}</Pill>}</Td>
            <Td><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {d.statut==="demande_mise_en_relation"&&<Btn onClick={()=>validerMiseEnRelation(d.id)} style={{fontSize:10,padding:"4px 8px",background:C.green}}>✅ Valider</Btn>}
              {d.statut==="valide"&&<><Inp value={montantForm[d.id]||''} onChange={e=>setMontantForm(f=>({...f,[d.id]:e.target.value}))} placeholder="Montant €" style={{width:90,fontSize:10}}/><Btn onClick={()=>definirMontant(d.id)} style={{fontSize:10,padding:"4px 8px"}}>Conclure</Btn></>}
              {d.statut==="conclu"&&d.commission_statut==="en_attente"&&<Btn onClick={()=>marquerCommissionPayee(d.id)} style={{fontSize:10,padding:"4px 8px",background:C.gold}}>💰 Marquer payée</Btn>}
            </div></Td>
          </tr>)}</tbody>
        </table>}
      </Card>
    </div>}
  </div>;
};
export default PageAnnuaire;
