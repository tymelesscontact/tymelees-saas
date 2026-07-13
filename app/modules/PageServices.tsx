"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageServices=({plan,showToast,profil,UpgradeWall})=>{
  const services_base=profil?.services||PROFIL_DEFAUT.services;
  const[services,setServices]=useState([
    {id:1,nom:"Nettoyage Airbnb",cat:"Résidentiel",emoji:"🏠",prixStandard:280,prixVIP:240,prixEnterprise:210,actif:true,desc:"Nettoyage complet appartement Airbnb — produits inclus",duree:"2-3h",vendu:18,ca:5040,note:4.8},
    {id:2,nom:"Nettoyage bureaux",cat:"Professionnel",emoji:"🏢",prixStandard:480,prixVIP:420,prixEnterprise:380,actif:true,desc:"Nettoyage locaux professionnels + vitrerie",duree:"4-5h",vendu:8,ca:3840,note:4.7},
    {id:3,nom:"Nettoyage jet privé",cat:"Aviation",emoji:"✈️",prixStandard:1400,prixVIP:1200,prixEnterprise:1050,actif:true,desc:"Nettoyage intérieur jet privé — protocole aviation premium",duree:"3-4h",vendu:4,ca:5600,note:4.9},
    {id:4,nom:"Entretien yacht",cat:"Maritime",emoji:"⛵",prixStandard:1800,prixVIP:1550,prixEnterprise:1350,actif:true,desc:"Nettoyage et entretien superyacht — produits nacrés",duree:"6-8h",vendu:2,ca:3600,note:5.0},
    {id:5,nom:"Rapatriement corps",cat:"Funéraire",emoji:"✝️",prixStandard:4800,prixVIP:4200,prixEnterprise:3900,actif:true,desc:"Service complet rapatriement — France et international",duree:"Variable",vendu:3,ca:14400,note:4.9},
    {id:6,nom:"Résidentiel premium",cat:"Résidentiel",emoji:"🏡",prixStandard:350,prixVIP:300,prixEnterprise:260,actif:true,desc:"Nettoyage maison et appartement haut de gamme",duree:"3-4h",vendu:12,ca:4200,note:4.6},
    {id:7,nom:"Conciergerie VIP",cat:"Premium",emoji:"💎",prixStandard:800,prixVIP:680,prixEnterprise:600,actif:false,desc:"Service conciergerie tout inclus — clients VIP",duree:"Sur mesure",vendu:1,ca:800,note:5.0},
    {id:8,nom:"Nettoyage post-travaux",cat:"BTP",emoji:"🔨",prixStandard:650,prixVIP:560,prixEnterprise:490,actif:true,desc:"Nettoyage de fin de chantier — tous types de travaux",duree:"5-8h",vendu:5,ca:3250,note:4.5},
  ]);
  const[onglet,setOnglet]=useState("catalogue");
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",cat:"",emoji:"📦",prixStandard:"",prixVIP:"",desc:"",duree:""});

  const tabs=[{id:"catalogue",label:"📦 Catalogue"},{id:"tarifs",label:"💰 Tarifs clients"},{id:"stats",label:"📊 Stats ventes"},{id:"ajouter",label:"➕ Ajouter"}];

  const cats=[...new Set(services.map(s=>s.cat))];
  const totalCA=services.reduce((a,s)=>a+s.ca,0);
  const totalVendu=services.reduce((a,s)=>a+s.vendu,0);

  if(!hasAccess(plan,"services"))return <div style={{padding:20}}><UpgradeWall page="services" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⊛ Produits & Services</div>
        <div style={{fontSize:11,color:C.muted}}>Catalogue · Tarifs VIP/Standard · Stats ventes · Devis 1 clic</div></div>
      <Btn onClick={()=>setOnglet("ajouter")}>+ Ajouter un service</Btn>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <KPI label="Services actifs" val={services.filter(s=>s.actif).length} color={C.blue}/>
      <KPI label="CA total généré" val={fmt(totalCA)} color={C.gold}/>
      <KPI label="Prestations vendues" val={totalVendu} color={C.green}/>
      <KPI label="Note moyenne" val={(services.reduce((a,s)=>a+s.note,0)/services.length).toFixed(1)+"★"} color={C.teal}/>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* CATALOGUE */}
    {onglet==="catalogue"&&<div>
      {sel?<div>
        <BtnGhost onClick={()=>setSel(null)} style={{marginBottom:12}}>← Retour catalogue</BtnGhost>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:`${C.gold}33`}}>
            <div style={{fontSize:36,marginBottom:10}}>{sel.emoji}</div>
            <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{sel.nom}</div>
            <Pill color={C.blue}>{sel.cat}</Pill>
            <div style={{fontSize:12,color:C.muted,marginTop:8,marginBottom:14,lineHeight:1.6}}>{sel.desc}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Durée estimée</div><div style={{fontSize:13,fontWeight:700}}>{sel.duree}</div></CT>
              <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Note clients</div><div style={{fontSize:13,fontWeight:700,color:C.gold}}>{sel.note}★</div></CT>
              <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Prestations</div><div style={{fontSize:13,fontWeight:700,color:C.blue}}>{sel.vendu}</div></CT>
              <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>CA généré</div><div style={{fontSize:13,fontWeight:700,color:C.green}}>{fmt(sel.ca)}</div></CT>
            </div>
            <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:10,marginBottom:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
                <div><div style={{fontSize:9,color:C.muted}}>Standard</div><div style={{fontSize:14,fontWeight:700}}>{fmt(sel.prixStandard)}</div></div>
                <div><div style={{fontSize:9,color:C.gold}}>VIP (-15%)</div><div style={{fontSize:14,fontWeight:700,color:C.gold}}>{fmt(sel.prixVIP)}</div></div>
                <div><div style={{fontSize:9,color:C.purple}}>Enterprise (-25%)</div><div style={{fontSize:14,fontWeight:700,color:C.purple}}>{fmt(sel.prixEnterprise)}</div></div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={()=>showToast(`✅ Devis ${sel.nom} créé — Envoi WA`)}>◧ Devis 1 clic</Btn>
              <BtnGhost onClick={()=>{setServices(ss=>ss.map(s=>s.id===sel.id?{...s,actif:!s.actif}:s));setSel(s=>({...s,actif:!s.actif}));showToast(`✅ Service ${sel.actif?"désactivé":"activé"}`);}}>{sel.actif?"⏸ Désactiver":"▶ Activer"}</BtnGhost>
            </div>
          </Card>
          <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
            <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:10}}>🤖 Analyse IA — Claude</div>
            <div style={{fontSize:12,color:C.text,lineHeight:1.8,marginBottom:14}}>
              {sel.ca>5000?`"${sel.nom}" est votre service le plus rentable. CA généré : ${fmt(sel.ca)}. Recommandation : créez un forfait mensuel récurrent pour fidéliser vos clients sur ce service.`:`"${sel.nom}" a du potentiel non exploité. Seulement ${sel.vendu} ventes. Recommandation : mettez-le en avant dans vos prochains devis — proposez-le en upsell systématiquement.`}
            </div>
            <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>📊 Benchmark tarifs</div>
            {[["Marché bas de gamme",fmt(Math.round(sel.prixStandard*0.6))],[`Votre tarif Standard`,fmt(sel.prixStandard)],["Marché haut de gamme",fmt(Math.round(sel.prixStandard*1.5))]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:700,color:i===1?C.gold:C.muted}}>{v}</span></div>)}
          </Card>
        </div>
      </div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
        {services.map((s,i)=><Card key={i} style={{cursor:"pointer",opacity:s.actif?1:0.5,borderColor:s.actif?`${C.gold}22`:C.border}} onClick={()=>setSel(s)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{fontSize:28}}>{s.emoji}</div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <Pill color={s.actif?C.green:C.muted}>{s.actif?"● Actif":"○ Inactif"}</Pill>
              <button onClick={e=>{e.stopPropagation();setServices(ss=>ss.map(x=>x.id===s.id?{...x,actif:!x.actif}:x));showToast(`✅ ${s.nom} ${s.actif?"désactivé":"activé"}`);}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px",cursor:"pointer",fontSize:9,color:C.muted,fontFamily:"inherit"}}>{s.actif?"Pause":"▶"}</button>
            </div>
          </div>
          <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{s.nom}</div>
          <Pill color={C.blue}>{s.cat}</Pill>
          <div style={{fontSize:11,color:C.muted,marginTop:6,marginBottom:10,lineHeight:1.5}}>{s.desc.slice(0,60)}...</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(s.prixStandard)}</div>
            <div style={{fontSize:10,color:C.gold}}>★ {s.note} · {s.vendu} ventes</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <Btn onClick={e=>{e.stopPropagation();showToast(`✅ Devis ${s.nom} créé !`);}} style={{fontSize:10,padding:"6px 4px"}}>◧ Devis</Btn>
            <BtnGhost onClick={e=>{e.stopPropagation();setSel(s);}} style={{fontSize:10,padding:"6px 4px"}}>Voir fiche</BtnGhost>
          </div>
        </Card>)}
      </div>}
    </div>}

    {/* TARIFS */}
    {onglet==="tarifs"&&<Card>
      <STitle>💰 Grille tarifaire par type de client</STitle>
      <div style={{background:`${C.blue}08`,border:`1px solid ${C.blue}22`,borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:C.text}}>
        Les tarifs VIP et Enterprise sont appliqués automatiquement lors de la création d'un devis selon le profil du client.
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
          <thead><tr><TH>Service</TH><TH>Catégorie</TH><TH>Standard</TH><TH><span style={{color:C.gold}}>VIP (-15%)</span></TH><TH><span style={{color:C.purple}}>Enterprise (-25%)</span></TH><TH>Statut</TH></tr></thead>
          <tbody>{services.map((s,i)=><tr key={i}>
            <Td style={{fontWeight:700}}>{s.emoji} {s.nom}</Td>
            <Td><Pill color={C.blue}>{s.cat}</Pill></Td>
            <Td style={{fontWeight:700}}>{fmt(s.prixStandard)}</Td>
            <Td style={{color:C.gold,fontWeight:700}}>{fmt(s.prixVIP)}</Td>
            <Td style={{color:C.purple,fontWeight:700}}>{fmt(s.prixEnterprise)}</Td>
            <Td><Pill color={s.actif?C.green:C.muted}>{s.actif?"Actif":"Inactif"}</Pill></Td>
          </tr>)}</tbody>
        </table>
      </div>
    </Card>}

    {/* STATS */}
    {onglet==="stats"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Top services par CA</STitle>
          {[...services].sort((a,b)=>b.ca-a.ca).map((s,i)=><div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{s.emoji} {s.nom}</span><span style={{color:C.gold,fontWeight:700}}>{fmt(s.ca)}</span></div>
            <SM val={s.ca} max={Math.max(...services.map(x=>x.ca))} color={C.gold}/>
          </div>)}
        </Card>
        <Card>
          <STitle>📊 Top services par volume</STitle>
          {[...services].sort((a,b)=>b.vendu-a.vendu).map((s,i)=><div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{s.emoji} {s.nom}</span><span style={{color:C.blue,fontWeight:700}}>{s.vendu} ventes</span></div>
            <SM val={s.vendu} max={Math.max(...services.map(x=>x.vendu))} color={C.blue}/>
          </div>)}
        </Card>
      </div>
      <Card>
        <STitle>⭐ Notes clients par service</STitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
          {[...services].sort((a,b)=>b.note-a.note).map((s,i)=><CT key={i} style={{textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.emoji}</div>
            <div style={{fontSize:11,fontWeight:700,marginBottom:2}}>{s.nom}</div>
            <div style={{fontSize:18,fontWeight:700,color:C.gold}}>{s.note}★</div>
          </CT>)}
        </div>
      </Card>
    </div>}

    {/* AJOUTER */}
    {onglet==="ajouter"&&<div style={{maxWidth:560}}>
      <Card>
        <STitle>➕ Nouveau service / produit</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:8}}>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Emoji</label><Inp value={addForm.emoji} onChange={e=>setAddForm(f=>({...f,emoji:e.target.value}))} style={{width:60}}/></div>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Nom du service *</label><Inp value={addForm.nom} onChange={e=>setAddForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: Nettoyage piscine"/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Catégorie</label><Inp value={addForm.cat} onChange={e=>setAddForm(f=>({...f,cat:e.target.value}))} placeholder="Ex: Résidentiel"/></div>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Durée estimée</label><Inp value={addForm.duree} onChange={e=>setAddForm(f=>({...f,duree:e.target.value}))} placeholder="Ex: 2-3h"/></div>
          </div>
          <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Description</label><Inp value={addForm.desc} onChange={e=>setAddForm(f=>({...f,desc:e.target.value}))} placeholder="Décrivez le service..."/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Prix Standard (€) *</label><Inp value={addForm.prixStandard} onChange={e=>setAddForm(f=>({...f,prixStandard:e.target.value}))} placeholder="Ex: 350"/></div>
            <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Prix VIP (€)</label><Inp value={addForm.prixVIP} onChange={e=>setAddForm(f=>({...f,prixVIP:e.target.value}))} placeholder="Auto: -15%"/></div>
          </div>
          {addForm.prixStandard&&<div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:10,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center",fontSize:11}}>
            <div><div style={{color:C.muted}}>Standard</div><div style={{fontWeight:700}}>{fmt(Number(addForm.prixStandard))}</div></div>
            <div><div style={{color:C.gold}}>VIP (-15%)</div><div style={{fontWeight:700,color:C.gold}}>{fmt(Math.round(Number(addForm.prixStandard)*0.85))}</div></div>
            <div><div style={{color:C.purple}}>Enterprise (-25%)</div><div style={{fontWeight:700,color:C.purple}}>{fmt(Math.round(Number(addForm.prixStandard)*0.75))}</div></div>
          </div>}
          <Btn onClick={()=>{
            if(!addForm.nom||!addForm.prixStandard)return showToast("⚠️ Nom et prix requis");
            const ns={id:services.length+1,nom:addForm.nom,cat:addForm.cat||"Autre",emoji:addForm.emoji,prixStandard:Number(addForm.prixStandard),prixVIP:Number(addForm.prixVIP)||Math.round(Number(addForm.prixStandard)*0.85),prixEnterprise:Math.round(Number(addForm.prixStandard)*0.75),actif:true,desc:addForm.desc,duree:addForm.duree,vendu:0,ca:0,note:0};
            setServices(ss=>[...ss,ns]);setAddForm({nom:"",cat:"",emoji:"📦",prixStandard:"",prixVIP:"",desc:"",duree:""});
            showToast(`✅ Service "${ns.nom}" ajouté !`);setOnglet("catalogue");
          }}>✅ Ajouter ce service</Btn>
        </div>
      </Card>
    </div>}
  </div>;
};
// ─── PAGE CHAT ────────────────────────────────────────────────

export default PageServices;
