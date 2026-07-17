"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM, Tabs, St } from "../lib/ui";
import { ANNUAIRE } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageAnnuaire=({plan,showToast,UpgradeWall})=>{
  // ── Données réseau mondial ─────────────────────────────────
  const RESEAU_MONDIAL=[
    // Partenaires existants
    {id:"r1",nom:"Thomas Beaumont",type:"Apporteur d'affaires",secteur:"Conciergerie",pays:"🇫🇷",ville:"Paris",continent:"Europe",tel:"+33 6 12 34 56 78",email:"thomas@xyra.io",ca:12400,deals:8,bio:"Spécialiste missions premium Airbnb & résidentiel Paris"},
    {id:"r2",nom:"Leila Mansouri",type:"Partenaire",secteur:"Immobilier",pays:"🇫🇷",ville:"Lyon",continent:"Europe",tel:"+33 6 44 55 66 77",email:"leila.m@mail.fr",ca:8700,deals:5,bio:"Agent immobilier spécialisée résidentiel haut de gamme"},
    {id:"r3",nom:"Groupe Prestige SARL",type:"Partenaire",secteur:"Syndic & Gestion",pays:"🇫🇷",ville:"Paris",continent:"Europe",tel:"+33 1 44 55 66 77",email:"contact@prestige.fr",ca:22000,deals:14,bio:"Syndic professionnel, gestionnaire de 200+ résidences Paris"},
    {id:"r4",nom:"Fatoumata Diop",type:"Apporteur d'affaires",secteur:"Finance Afrique",pays:"🇸🇳",ville:"Dakar",continent:"Afrique",tel:"+221 77 123 45 67",email:"fatou.d@dakar.sn",ca:6800,deals:4,bio:"Consultante finance d'entreprise, réseau Afrique de l'Ouest"},
    // Membres Club
    {id:"r5",nom:"Sofia Al-Rashid",type:"Membre Club",secteur:"Aviation d'affaires",pays:"🇦🇪",ville:"Dubaï",continent:"Moyen-Orient",tel:"+971 50 123 45 67",email:"sofia@vip.ae",ca:9200,deals:3,bio:"Gestionnaire de flotte jets privés, zone Golfe & Europe"},
    {id:"r6",nom:"Marc Dupont",type:"Membre Club",secteur:"Immobilier",pays:"🇫🇷",ville:"Lyon",continent:"Europe",tel:"+33 6 98 76 54 32",email:"m.dupont@corp.fr",ca:3200,deals:2,bio:"Investisseur immobilier, portefeuille 15 biens résidentiels"},
    {id:"r7",nom:"Jean-Marc Olivier",type:"Membre Club",secteur:"Conseil & Finance",pays:"🇫🇷",ville:"Paris",continent:"Europe",tel:"+33 6 77 88 99 00",email:"jm@pro.fr",ca:14600,deals:7,bio:"Directeur associé cabinet conseil, spécialiste M&A PME"},
    // Partenaires luxe & internationaux
    {id:"r8",nom:"Jet Services Monaco",type:"Partenaire",secteur:"Aviation de luxe",pays:"🇲🇨",ville:"Monaco",continent:"Europe",tel:"+377 99 88 77 66",email:"contact@jetservices.mc",ca:0,deals:1,bio:"Opérateur jets privés & hélicoptères, réseau mondial 180+ appareils"},
    {id:"r9",nom:"YachtCo Méditerranée",type:"Partenaire",secteur:"Yachting",pays:"🇫🇷",ville:"Cannes",continent:"Europe",tel:"+33 4 93 11 22 33",email:"info@yachtco.fr",ca:0,deals:0,bio:"Courtier yacht, vente & location superyachts 20-80m"},
    {id:"r10",nom:"Prestige Realty Dubai",type:"Partenaire",secteur:"Immobilier de prestige",pays:"🇦🇪",ville:"Dubaï",continent:"Moyen-Orient",tel:"+971 4 555 66 77",email:"contact@prestigerealty.ae",ca:0,deals:0,bio:"Agence immobilier luxe Dubai & Abu Dhabi, résidences >2M$"},
    {id:"r11",nom:"Cabinet Moreau & Associés",type:"Apporteur d'affaires",secteur:"Juridique & Conseil",pays:"🇨🇭",ville:"Genève",continent:"Europe",tel:"+41 22 345 67 89",email:"contact@moreau-law.ch",ca:0,deals:0,bio:"Cabinet d'avocats d'affaires franco-suisse, droit des sociétés"},
    {id:"r12",nom:"Ndoye Business Group",type:"Partenaire",secteur:"Commerce & Distribution",pays:"🇸🇳",ville:"Dakar",continent:"Afrique",tel:"+221 33 456 78 90",email:"info@ndoye-group.sn",ca:0,deals:0,bio:"Groupe commercial Afrique de l'Ouest, import/export & distribution"},
    {id:"r13",nom:"Atlas Finance Maroc",type:"Partenaire",secteur:"Finance & Investissement",pays:"🇲🇦",ville:"Casablanca",continent:"Afrique",tel:"+212 5 22 334 455",email:"contact@atlasfinance.ma",ca:0,deals:0,bio:"Fonds d'investissement PME, Maroc & Afrique du Nord"},
    {id:"r14",nom:"TechHub Montréal",type:"Membre Club",secteur:"Tech & Innovation",pays:"🇨🇦",ville:"Montréal",continent:"Amériques",tel:"+1 514 234 56 78",email:"hello@techhub.ca",ca:0,deals:0,bio:"Incubateur startups tech, réseau entrepreneurs Canada francophone"},
    {id:"r15",nom:"Shenzhen Trade Partners",type:"Partenaire",secteur:"Commerce international",pays:"🇨🇳",ville:"Shenzhen",continent:"Asie",tel:"+86 755 8765 4321",email:"trade@shenzhentrade.cn",ca:0,deals:0,bio:"Intermédiaire commercial Chine-Europe, sourcing & logistique"},
    {id:"r16",nom:"Lagos Premium Services",type:"Partenaire",secteur:"Services aux entreprises",pays:"🇳🇬",ville:"Lagos",continent:"Afrique",tel:"+234 1 234 56 78",email:"info@lagospremium.ng",ca:0,deals:0,bio:"Services haut de gamme entreprises Nigeria, conciergerie B2B"},
    {id:"r17",nom:"Riviera Hospitality Group",type:"Partenaire",secteur:"Hôtellerie & Événements",pays:"🇫🇷",ville:"Nice",continent:"Europe",tel:"+33 4 93 77 88 99",email:"contact@rivierahospitality.fr",ca:0,deals:0,bio:"Groupe hôtelier Côte d'Azur, organisation événements corporate"},
    {id:"r18",nom:"Brussels Corporate Network",type:"Membre Club",secteur:"Conseil & Lobbying",pays:"🇧🇪",ville:"Bruxelles",continent:"Europe",tel:"+32 2 234 56 78",email:"network@bcn.be",ca:0,deals:0,bio:"Réseau dirigeants entreprises, institutions européennes Bruxelles"},
  ];

  const continents=["Tous","Europe","Afrique","Moyen-Orient","Amériques","Asie"];
  const secteurs=["Tous","Aviation de luxe","Yachting","Immobilier","Finance & Investissement","Commerce international","Tech & Innovation","Juridique & Conseil","Hôtellerie & Événements","Services aux entreprises","Conciergerie","Syndic & Gestion"];
  const types=["Tous","Partenaire","Membre Club","Apporteur d'affaires"];

  const[onglet,setOnglet]=useState("annuaire");
  const[search,setSearch]=useState("");
  const[filtreCont,setFiltreCont]=useState("Tous");
  const[filtreType,setFiltreType]=useState("Tous");
  const[filtreSect,setFiltreSect]=useState("Tous");
  const[sel,setSel]=useState(null);
  const[showDeal,setShowDeal]=useState(null);
  const[dealForm,setDealForm]=useState({service:"",valeur:"",detail:""});
  const[deals,setDeals]=useState([
    {id:"D001",de:"Xyra",pour:"Sofia Al-Rashid",service:"Nettoyage jet privé Dubai",valeur:4800,statut:"en cours",date:"12/04"},
    {id:"D002",de:"Leila Mansouri",pour:"Groupe Prestige SARL",service:"Mise en relation syndic",valeur:12000,statut:"proposé",date:"10/04"},
    {id:"D003",de:"Fatoumata Diop",pour:"Ndoye Business Group",service:"Distribution Afrique Ouest",valeur:8000,statut:"validé",date:"08/04"},
  ]);
  const[msgs,setMsgs]=useState([
    {de:"Sofia Al-Rashid",msg:"Bonjour Curtiss, intéressée par vos services à Dubai 🌟",h:"09:23",lu:false},
    {de:"Fatoumata Diop",msg:"2 nouvelles sociétés depuis Dakar pour vous 🌍",h:"11:00",lu:true},
  ]);

  const tabs=[
    {id:"annuaire",label:"🌍 Annuaire mondial"},
    {id:"carte",label:"🗺 Carte réseau"},
    {id:"deals",label:"🤝 Deals réseau"},
    {id:"messagerie",label:"💬 Messagerie"},
    {id:"stats",label:"📊 Statistiques"},
  ];

  if(!hasAccess(plan,"annuaire"))return <div style={{padding:20}}><UpgradeWall page="Réseau & Annuaire" plan={plan}/></div>;

  const filtered=RESEAU_MONDIAL.filter(r=>{
    const matchSearch=search===""||r.nom.toLowerCase().includes(search.toLowerCase())||r.secteur.toLowerCase().includes(search.toLowerCase())||r.ville.toLowerCase().includes(search.toLowerCase());
    const matchCont=filtreCont==="Tous"||r.continent===filtreCont;
    const matchType=filtreType==="Tous"||r.type===filtreType;
    const matchSect=filtreSect==="Tous"||r.secteur===filtreSect;
    return matchSearch&&matchCont&&matchType&&matchSect;
  });

  const statsCont=continents.slice(1).map(c=>({nom:c,count:RESEAU_MONDIAL.filter(r=>r.continent===c).length})).filter(c=>c.count>0);

  return <div style={{padding:20}}>
    {/* HEADER */}
    <div style={{background:`linear-gradient(135deg,${C.card},#080818)`,border:`1px solid ${C.gold}33`,borderRadius:16,padding:20,marginBottom:16}}>
      <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",marginBottom:4}}>XYRA · RÉSEAU MONDIAL</div>
      <div style={{fontSize:22,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◱ Annuaire Business Mondial</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Partenaires · Membres Club · Apporteurs d'affaires · {RESEAU_MONDIAL.length} contacts dans {statsCont.length} zones géographiques</div>
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
                {[["📍 Localisation",`${sel.pays} ${sel.ville}`],["🏢 Secteur",sel.secteur],["📧 Email",sel.email],["📱 Téléphone",sel.tel],sel.ca>0?["💰 CA généré Xyra",fmt(sel.ca)]:null,sel.deals>0?["🤝 Deals conclus",sel.deals+" deals"]:null].filter(Boolean).map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:C.text}}>{v}</span></div>)}
              </div>
            </Card>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Card>
                <STitle>⚡ Actions rapides</STitle>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <Btn onClick={()=>{setShowDeal(sel);setOnglet("deals");setSel(null);}} style={{width:"100%"}}>🤝 Proposer un deal</Btn>
                  <Btn onClick={()=>showToast(`📱 WhatsApp ouvert avec ${sel.nom}`)} style={{width:"100%",background:C.green,color:"#000"}}>📱 WhatsApp</Btn>
                  <BtnGhost onClick={()=>showToast(`📧 Email envoyé à ${sel.email}`)} style={{width:"100%"}}>📧 Envoyer un email</BtnGhost>
                  <BtnGhost onClick={()=>{setOnglet("messagerie");setSel(null);}} style={{width:"100%"}}>💬 Message interne</BtnGhost>
                  <BtnGhost onClick={()=>showToast("📄 Fiche PDF exportée")} style={{width:"100%"}}>📄 Exporter fiche PDF</BtnGhost>
                </div>
              </Card>
              <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
                <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 Analyse IA — Potentiel business</div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{sel.secteur==="Aviation de luxe"||sel.secteur==="Yachting"?"Partenaire à très fort potentiel. Ses clients ont un pouvoir d'achat élevé et recherchent des services premium complémentaires. Opportunité de deal récurrent estimée à 15 000-40 000€/an.":sel.ca>5000?"Contact déjà rentable. Potentiel d'upsell estimé à "+(Math.round(sel.ca*0.3)).toLocaleString("fr")+"€ sur les 6 prochains mois avec une offre adaptée.":"Nouveau contact à fort potentiel. Recommandation : envoyer une présentation personnalisée dans les 48h pour maximiser les chances de collaboration."}</div>
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
              {r.ca>0&&<span style={{fontSize:10,color:C.green,fontWeight:700}}>{fmt(r.ca)}</span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              <Btn onClick={e=>{e.stopPropagation();setShowDeal(r);setOnglet("deals");}} style={{fontSize:10,padding:"6px 4px"}}>🤝 Deal</Btn>
              <BtnGhost onClick={e=>{e.stopPropagation();showToast(`📱 WhatsApp ${r.nom}`);}} style={{fontSize:10,padding:"6px 4px"}}>📱 WA</BtnGhost>
            </div>
          </Card>)}
        </div>
      }
    </>}

    {/* ─── CARTE RÉSEAU ─────────────────────────────────────── */}
    {onglet==="carte"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        {statsCont.map((c,i)=>{const colors=[C.blue,C.gold,C.teal,C.green,C.purple];return <CT key={i} style={{cursor:"pointer",borderColor:`${colors[i%5]}44`}} onClick={()=>{setOnglet("annuaire");setFiltreCont(c.nom);}}>
          <div style={{fontSize:9,color:colors[i%5],fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>{c.nom}</div>
          <div style={{fontSize:22,fontWeight:700,color:colors[i%5]}}>{c.count}</div>
          <div style={{fontSize:10,color:C.muted}}>contact{c.count>1?"s":""}</div>
          <SM val={c.count} max={RESEAU_MONDIAL.length} color={colors[i%5]}/>
        </CT>;})}
      </div>
      {/* Carte visuelle par continent */}
      <Card>
        <STitle>🌍 Répartition mondiale</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {[["🌍 Afrique",["🇸🇳","🇲🇦","🇳🇬"],C.gold],["🌍 Europe",["🇫🇷","🇲🇨","🇨🇭","🇧🇪"],C.blue],["🌍 Moyen-Orient",["🇦🇪"],C.teal],["🌍 Amériques",["🇨🇦"],C.green],["🌍 Asie",["🇨🇳"],C.purple]].map(([zone,flags,color],i)=>{
            const count=RESEAU_MONDIAL.filter(r=>r.pays&&flags.some(f=>r.pays.includes(f.replace(/[^a-zA-Z]/g,"").slice(0,2))||r.continent===zone.replace("🌍 ",""))).length;
            const contacts=RESEAU_MONDIAL.filter(r=>r.continent===zone.replace("🌍 ",""));
            return <div key={i} style={{background:`${color}08`,border:`1px solid ${color}22`,borderRadius:10,padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color}}>{zone} · {contacts.length} contact{contacts.length>1?"s":""}</div>
                <BtnGhost onClick={()=>{setOnglet("annuaire");setFiltreCont(zone.replace("🌍 ",""));}} style={{fontSize:10,padding:"3px 10px"}}>Voir tous →</BtnGhost>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {contacts.map((c,j)=><div key={j} onClick={()=>{setSel(c);setOnglet("annuaire");}} style={{background:`${color}15`,border:`1px solid ${color}33`,borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:`${color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color}}>{inits(c.nom)}</div>
                  <div><div style={{fontSize:10,fontWeight:600,color:C.text}}>{c.nom.split(" ")[0]}</div><div style={{fontSize:9,color:C.muted}}>{c.pays} {c.ville}</div></div>
                </div>)}
              </div>
            </div>;
          })}
        </div>
        <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:12}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:4}}>🤖 IA — Opportunités géographiques</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>Votre réseau est fort en Europe (10 contacts) et Afrique (4 contacts). Zone à développer : <b style={{color:C.gold}}>Amériques</b> — 1 seul contact au Canada. Recommandation : cibler des partenaires au Québec et aux États-Unis pour couvrir la diaspora africaine francophone.</div>
        </div>
      </Card>
    </div>}

    {/* ─── DEALS RÉSEAU ─────────────────────────────────────── */}
    {onglet==="deals"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:16,fontWeight:700,color:C.text}}>🤝 Deals du réseau</div><div style={{fontSize:11,color:C.muted}}>Proposez des collaborations directement depuis l'annuaire</div></div>
        <Btn onClick={()=>setShowDeal({nom:"",email:""})}>+ Nouveau deal</Btn>
      </div>

      {showDeal&&<Card style={{marginBottom:16,borderColor:`${C.gold}44`}}>
        <STitle>🤝 Proposer un deal — {showDeal.nom||"Contact libre"}</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {!showDeal.nom&&<Inp placeholder="Contact / entreprise" onChange={e=>setShowDeal(s=>({...s,nom:e.target.value}))}/>}
          <Inp value={dealForm.service} onChange={e=>setDealForm(f=>({...f,service:e.target.value}))} placeholder="Service proposé (ex: Nettoyage jet privé, mise en relation...)"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Inp value={dealForm.valeur} onChange={e=>setDealForm(f=>({...f,valeur:e.target.value}))} placeholder="Valeur estimée (€)"/>
            <Sel style={{width:"100%"}}><option>Collaboration ponctuelle</option><option>Partenariat récurrent</option><option>Commission sur CA</option><option>Échange de services</option></Sel>
          </div>
          <Inp value={dealForm.detail} onChange={e=>setDealForm(f=>({...f,detail:e.target.value}))} placeholder="Détail de la proposition..."/>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>{
              const nd={id:"D00"+(deals.length+1),de:"Xyra",pour:showDeal.nom,service:dealForm.service||"À préciser",valeur:Number(dealForm.valeur)||0,statut:"proposé",date:new Date().toLocaleDateString("fr")};
              setDeals(d=>[nd,...d]);setShowDeal(null);setDealForm({service:"",valeur:"",detail:""});
              showToast(`✅ Deal proposé à ${nd.pour} — Notification WhatsApp envoyée !`);
            }}>✅ Envoyer la proposition</Btn>
            <BtnGhost onClick={()=>setShowDeal(null)}>Annuler</BtnGhost>
          </div>
        </div>
      </Card>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Deals en cours" val={deals.filter(d=>d.statut==="en cours").length} color={C.blue}/>
        <KPI label="Deals validés" val={deals.filter(d=>d.statut==="validé").length} color={C.green}/>
        <KPI label="Valeur totale" val={fmt(deals.reduce((a,d)=>a+d.valeur,0))} color={C.gold}/>
      </div>

      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Référence</TH><TH>Initiateur</TH><TH>Bénéficiaire</TH><TH>Service</TH><TH>Valeur</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{deals.map((d,i)=><tr key={i}>
            <Td style={{color:C.gold,fontSize:10,fontWeight:700}}>{d.id}</Td>
            <Td style={{fontWeight:600}}>{d.de}</Td>
            <Td style={{fontWeight:600}}>{d.pour}</Td>
            <Td style={{fontSize:11,color:C.muted}}>{d.service}</Td>
            <Td style={{color:C.green,fontWeight:700}}>{d.valeur>0?fmt(d.valeur):"À négocier"}</Td>
            <Td><St s={d.statut}/></Td>
            <Td><div style={{display:"flex",gap:4}}>
              {d.statut==="proposé"&&<Btn onClick={()=>{setDeals(ds=>ds.map((x,j)=>j===i?{...x,statut:"en cours"}:x));showToast("✅ Deal accepté !");}} style={{fontSize:10,padding:"4px 8px",background:C.green}}>✅</Btn>}
              {d.statut==="en cours"&&<Btn onClick={()=>{setDeals(ds=>ds.map((x,j)=>j===i?{...x,statut:"validé"}:x));showToast("🎉 Deal finalisé !");}} style={{fontSize:10,padding:"4px 8px"}}>Finaliser</Btn>}
              <BtnGhost onClick={()=>showToast("💬 Chat deal ouvert")} style={{fontSize:10,padding:"4px 8px"}}>💬</BtnGhost>
              <BtnGhost onClick={()=>showToast("📱 WhatsApp ouvert")} style={{fontSize:10,padding:"4px 8px"}}>WA</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </div>}

    {/* ─── MESSAGERIE ───────────────────────────────────────── */}
    {onglet==="messagerie"&&<div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:12,height:500}}>
      {/* Liste contacts */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:700,color:C.muted}}>CONTACTS RÉSEAU</div>
        <div style={{overflowY:"auto",height:"calc(100% - 44px)"}}>
          {RESEAU_MONDIAL.slice(0,10).map((r,i)=>{
            const msgNonLu=msgs.filter(m=>m.de===r.nom&&!m.lu).length;
            return <div key={i} onClick={()=>{setMsgs(ms=>ms.map(m=>m.de===r.nom?{...m,lu:true}:m));setSel(r);}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer",background:sel?.id===r.id?`${C.gold}0D`:"transparent",borderBottom:`1px solid ${C.border}22`}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${C.gold}22`,border:`1px solid ${C.gold}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.gold,flexShrink:0}}>{inits(r.nom)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:msgNonLu>0?700:400,color:msgNonLu>0?C.text:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nom}</div>
                <div style={{fontSize:9,color:C.muted}}>{r.pays} · {r.secteur}</div>
              </div>
              {msgNonLu>0&&<div style={{width:16,height:16,borderRadius:"50%",background:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff",flexShrink:0}}>{msgNonLu}</div>}
            </div>;
          })}
        </div>
      </Card>
      {/* Zone de chat */}
      <Card style={{padding:0,overflow:"hidden"}}>
        {sel?<Chat
          msgs={[...msgs.filter(m=>m.de===sel.nom).map(m=>({av:inits(m.de),msg:m.msg,h:m.h,moi:false})),]}
          onSend={(msg)=>{setMsgs(ms=>[...ms,{de:"Xyra",pour:sel.nom,msg,h:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),lu:true,moi:true}]);showToast(`✅ Message envoyé à ${sel.nom}`);}}
          title={sel.nom}
          subtitle={`${sel.pays} ${sel.ville} · ${sel.secteur}`}
        />:<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:C.muted}}>
          <div style={{fontSize:36,marginBottom:10}}>💬</div>
          <div style={{fontSize:13}}>Sélectionne un contact pour envoyer un message</div>
        </div>}
      </Card>
    </div>}

    {/* ─── STATISTIQUES ─────────────────────────────────────── */}
    {onglet==="stats"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Contacts total" val={RESEAU_MONDIAL.length} color={C.blue}/>
        <KPI label="Pays représentés" val={[...new Set(RESEAU_MONDIAL.map(r=>r.pays))].length} color={C.gold}/>
        <KPI label="CA généré réseau" val={fmt(RESEAU_MONDIAL.reduce((a,r)=>a+r.ca,0))} color={C.green}/>
        <KPI label="Deals actifs" val={deals.length} color={C.teal}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>🌍 Contacts par continent</STitle>
          {statsCont.map((c,i)=>{const colors=[C.blue,C.gold,C.teal,C.green,C.purple];return <div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{c.nom}</span><span style={{color:colors[i%5],fontWeight:700}}>{c.count} contacts</span></div><SM val={c.count} max={RESEAU_MONDIAL.length} color={colors[i%5]}/></div>;})}
        </Card>
        <Card>
          <STitle>🏢 Contacts par type</STitle>
          {types.slice(1).map((t,i)=>{const count=RESEAU_MONDIAL.filter(r=>r.type===t).length;const colors=[C.gold,C.blue,C.green];return <div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{t}</span><span style={{color:colors[i],fontWeight:700}}>{count}</span></div><SM val={count} max={RESEAU_MONDIAL.length} color={colors[i]}/></div>;})}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>💰 Top CA générés</STitle>
          {RESEAU_MONDIAL.filter(r=>r.ca>0).sort((a,b)=>b.ca-a.ca).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{fontWeight:600}}>{r.nom}</span><span style={{color:C.green,fontWeight:700}}>{fmt(r.ca)}</span></div>)}
        </Card>
        <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
          <STitle>🤖 IA — Recommandations réseau</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[{txt:"Activez Shenzhen Trade Partners pour développer vos importations depuis la Chine. Potentiel : économiser 20-30% sur vos achats fournitures.",col:C.gold},{txt:"Jet Services Monaco + YachtCo Méditerranée = pack services ultra-premium. Proposez un deal croisé à vos clients VIP pour un panier moyen x3.",col:C.blue},{txt:"Votre réseau Afrique (Dakar, Lagos, Casablanca) est unique en France. C'est un avantage concurrentiel majeur. Développez-le en priorité.",col:C.green}].map((r,i)=><div key={i} style={{background:`${r.col}11`,border:`1px solid ${r.col}22`,borderRadius:7,padding:10,fontSize:11,color:C.text,lineHeight:1.6}}>{r.txt}</div>)}
          </div>
        </Card>
      </div>
    </div>}
  </div>;
};
// ─── PAGE WALLET MEMBRES ──────────────────────────────────────

export default PageAnnuaire;
