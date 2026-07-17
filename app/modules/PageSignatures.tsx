"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, SM } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageSignatures=({plan,showToast,UpgradeWall})=>{
  const MODELES_CONTRATS=[
    {id:"prestation",label:"Contrat de prestation de services",type:"Commercial",desc:"Pour vos missions clients (nettoyage, conciergerie, jet, yacht...)"},
    {id:"partenariat",label:"Contrat de partenariat / AA",type:"Commercial",desc:"Pour vos apporteurs d'affaires — taux de commission, durée, clauses"},
    {id:"cdi",label:"Contrat CDI",type:"RH",desc:"Contrat à durée indéterminée — temps plein ou partiel"},
    {id:"cdd",label:"Contrat CDD",type:"RH",desc:"Contrat à durée déterminée — avec date de fin précise"},
    {id:"alternance",label:"Contrat d'alternance",type:"RH",desc:"Apprentissage ou professionnalisation — 1 à 3 ans"},
    {id:"stage",label:"Convention de stage",type:"RH",desc:"Stage obligatoire ou volontaire — gratification légale"},
    {id:"freelance",label:"Contrat freelance / Auto-entrepreneur",type:"Commercial",desc:"Pour prestataires indépendants — sans lien de subordination"},
    {id:"confidentialite",label:"NDA — Accord de confidentialité",type:"Juridique",desc:"Protège vos informations sensibles avec clients et partenaires"},
    {id:"saas",label:"Contrat SaaS / Licence logicielle",type:"Tech",desc:"Pour vos clients white-label Xyra"},
    {id:"fournisseur",label:"Contrat fournisseur",type:"Commercial",desc:"Conditions générales d'achat avec vos fournisseurs"},
  ];

  const[contrats,setContrats]=useState([
    {id:"CTR-001",titre:"Contrat prestation — Sofia Al-Rashid",type:"Commercial",modele:"prestation",client:"Sofia Al-Rashid",categorie:"Client",statut:"signé",date:"01/03/2024",expire:"28/02/2027",valeur:2400,signataire:"Sofia Al-Rashid",signé_le:"03/03/2024",fichier:"CTR-001-sofia.pdf"},
    {id:"CTR-002",titre:"Contrat AA — Thomas Beaumont",type:"RH",modele:"partenariat",client:"Thomas Beaumont",categorie:"Partenaire",statut:"signé",date:"01/03/2024",expire:"28/02/2026",valeur:0,signataire:"Thomas Beaumont",signé_le:"01/03/2024",fichier:"CTR-002-thomas.pdf"},
    {id:"CTR-003",titre:"Contrat AA — Groupe Prestige SARL",type:"Commercial",modele:"partenariat",client:"Groupe Prestige SARL",categorie:"Partenaire",statut:"signé",date:"01/04/2024",expire:"31/03/2027",valeur:0,signataire:"M. Beaumont DG",signé_le:"02/04/2024",fichier:"CTR-003-prestige.pdf"},
    {id:"CTR-004",titre:"CDI — Abou Diallo",type:"RH",modele:"cdi",client:"Abou Diallo",categorie:"RH",statut:"signé",date:"15/06/2024",expire:"—",valeur:2200,signataire:"Abou Diallo",signé_le:"15/06/2024",fichier:"CTR-004-abou.pdf"},
    {id:"CTR-005",titre:"CDD — Fatou Sarr",type:"RH",modele:"cdd",client:"Fatou Sarr",categorie:"RH",statut:"signé",date:"01/09/2024",expire:"31/08/2025",valeur:2400,signataire:"Fatou Sarr",signé_le:"01/09/2024",fichier:"CTR-005-fatou.pdf"},
    {id:"CTR-006",titre:"Contrat SaaS — Cabinet Delmas",type:"Tech",modele:"saas",client:"Cabinet Delmas",categorie:"Client SaaS",statut:"envoyé",date:"15/04/2026",expire:"14/04/2027",valeur:500,signataire:"Me Delmas",signé_le:null,fichier:null},
    {id:"CTR-007",titre:"NDA — Jet Services Monaco",type:"Juridique",modele:"confidentialite",client:"Jet Services Monaco",categorie:"Partenaire",statut:"brouillon",date:"20/04/2026",expire:"19/04/2028",valeur:0,signataire:"Antoine Rivière",signé_le:null,fichier:null},
    {id:"CTR-008",titre:"Contrat fournisseur — CleanPro",type:"Commercial",modele:"fournisseur",client:"CleanPro",categorie:"Fournisseur",statut:"expiré",date:"01/01/2024",expire:"31/12/2024",valeur:0,signataire:"Dir. Commercial",signé_le:"02/01/2024",fichier:"CTR-008-cleanpro.pdf"},
  ]);

  const[onglet,setOnglet]=useState("dashboard");
  const[showCreate,setShowCreate]=useState(false);
  const[createForm,setCreateForm]=useState({modele:"prestation",titre:"",client:"",categorie:"Client",expire:"",valeur:""});
  const[showSign,setShowSign]=useState(null);
  const[signStep,setSignStep]=useState(1);
  const[sel,setSel]=useState(null);
  const[filtreType,setFiltreType]=useState("Tous");

  const tabs=[
    {id:"dashboard",label:"📊 Tableau de bord"},
    {id:"tous",label:"📋 Tous les contrats"},
    {id:"creer",label:"✍ Créer un contrat"},
    {id:"esign",label:"✒ E-Signature"},
    {id:"avenants",label:"📝 Avenants"},
    {id:"archivage",label:"🗄 Archivage"},
    {id:"alertes",label:"🔔 Alertes"},
  ];

  const statutColor={signé:C.green,envoyé:C.blue,brouillon:C.muted,expiré:C.red};
  const categories=["Tous","Client","Partenaire","RH","Fournisseur","Client SaaS"];

  const filtered=filtreType==="Tous"?contrats:contrats.filter(c=>c.categorie===filtreType);
  const signés=contrats.filter(c=>c.statut==="signé").length;
  const envoyés=contrats.filter(c=>c.statut==="envoyé").length;
  const brouillons=contrats.filter(c=>c.statut==="brouillon").length;
  const expirés=contrats.filter(c=>c.statut==="expiré").length;

  if(!hasAccess(plan,"signature"))return <div style={{padding:20}}><UpgradeWall page="signature" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>✦ Contrats & Signatures</div>
        <div style={{fontSize:11,color:C.muted}}>E-signature · Modèles IA · Archivage · Alertes · {contrats.length} contrats</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={()=>setOnglet("esign")}>✒ Signer un contrat</BtnGhost>
        <Btn onClick={()=>setOnglet("creer")}>+ Nouveau contrat</Btn>
      </div>
    </div>

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      {[["Total contrats",contrats.length,C.blue],["Signés",signés,C.green],["Envoyés",envoyés,C.gold],["Brouillons",brouillons,C.muted],["Expirés",expirés,C.red]].map(([l,v,c],i)=><CT key={i}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div></CT>)}
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── DASHBOARD ───────────────────────────── */}
    {onglet==="dashboard"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Contrats par catégorie</STitle>
          {categories.slice(1).map((cat,i)=>{const n=contrats.filter(c=>c.categorie===cat).length;const colors=[C.blue,C.gold,C.green,C.orange,C.purple];return <div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{cat}</span><span style={{color:colors[i],fontWeight:700}}>{n}</span></div><SM val={n} max={contrats.length} color={colors[i]}/></div>;})}
        </Card>
        <Card>
          <STitle>⚠️ Contrats à surveiller</STitle>
          {[...contrats.filter(c=>c.statut==="expiré"||c.statut==="envoyé")].map((c,i)=><div key={i} style={{background:c.statut==="expiré"?`${C.red}11`:`${C.orange}11`,border:`1px solid ${c.statut==="expiré"?C.red:C.orange}33`,borderRadius:8,padding:10,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:12,fontWeight:700}}>{c.titre}</div><div style={{fontSize:10,color:C.muted}}>{c.categorie} · {c.expire!=="—"?"Expire: "+c.expire:""}</div></div>
              <div style={{display:"flex",gap:6}}>
                <St s={c.statut}/>
                {c.statut==="envoyé"&&<Btn onClick={()=>{setShowSign(c);setOnglet("esign");}} style={{fontSize:10,padding:"4px 8px"}}>✒ Signer</Btn>}
                {c.statut==="expiré"&&<Btn onClick={()=>showToast("🔄 Renouvellement initié")} style={{fontSize:10,padding:"4px 8px",background:C.orange}}>🔄 Renouveler</Btn>}
              </div>
            </div>
          </div>)}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[["✒ E-signatures ce mois","3",C.teal],["📄 PDFs générés","12",C.blue],["⏱ Délai signature moyen","2.4 jours",C.gold]].map(([l,v,c],i)=><KPI key={i} label={l} val={v} color={c}/>)}
      </div>
    </div>}

    {/* ── TOUS LES CONTRATS ───────────────────── */}
    {onglet==="tous"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {categories.map(cat=><button key={cat} onClick={()=>setFiltreType(cat)} style={{background:filtreType===cat?C.gold:"transparent",color:filtreType===cat?"#000":C.muted,border:`1px solid ${filtreType===cat?C.gold:C.border}`,borderRadius:20,padding:"5px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:filtreType===cat?700:400}}>{cat}</button>)}
      </div>
      {sel?<div>
        <BtnGhost onClick={()=>setSel(null)} style={{marginBottom:14}}>← Retour à la liste</BtnGhost>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:`${statutColor[sel.statut]||C.border}44`}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{sel.titre}</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}><Pill color={C.purple}>{sel.type}</Pill><Pill color={C.blue}>{sel.categorie}</Pill><St s={sel.statut}/></div>
            {[["📅 Date création",sel.date],["⏱ Expiration",sel.expire],["👤 Signataire",sel.signataire],["✅ Signé le",sel.signé_le||"En attente"],["💰 Valeur",sel.valeur>0?fmt(sel.valeur):"—"],["📄 Fichier",sel.fichier||"Non généré"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>)}
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Card>
              <STitle>⚡ Actions</STitle>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {sel.statut==="envoyé"&&<Btn onClick={()=>{setShowSign(sel);setOnglet("esign");setSignStep(1);}} style={{background:C.green}}>✒ Signer maintenant</Btn>}
                {sel.statut==="brouillon"&&<Btn onClick={()=>{setContrats(cs=>cs.map(c=>c.id===sel.id?{...c,statut:"envoyé"}:c));setSel(s=>({...s,statut:"envoyé"}));showToast(`✅ Contrat envoyé à ${sel.client} pour signature`);}}>📤 Envoyer pour signature</Btn>}
                <Btn onClick={()=>showToast(`📄 PDF ${sel.titre} téléchargé`)} style={{background:C.blue}}>📄 Télécharger PDF</Btn>
                <BtnGhost onClick={()=>showToast(`📱 Contrat envoyé à ${sel.client} sur WhatsApp`)}>📱 Envoyer WhatsApp</BtnGhost>
                <BtnGhost onClick={()=>showToast("📝 Avenant créé")}>📝 Créer un avenant</BtnGhost>
                {sel.statut==="expiré"&&<Btn onClick={()=>{setContrats(cs=>cs.map(c=>c.id===sel.id?{...c,statut:"brouillon",date:new Date().toLocaleDateString("fr")}:c));setSel(s=>({...s,statut:"brouillon"}));showToast("🔄 Contrat renouvelé — à envoyer pour signature");}} style={{background:C.orange}}>🔄 Renouveler le contrat</Btn>}
              </div>
            </Card>
            <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
              <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Analyse IA Claude</div>
              <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>
                {sel.statut==="expiré"?"Ce contrat est expiré. Recommandation : renouvelez rapidement pour sécuriser la relation commerciale. Proposez une révision des conditions tarifaires (+8% aligné sur l'inflation).":sel.statut==="envoyé"?"En attente de signature depuis "+sel.date+". Envoyez un rappel WhatsApp pour accélérer la signature. Délai moyen : 2-3 jours.":"Contrat en bonne santé. Vérifiez l'échéance dans 3 mois pour anticiper le renouvellement."}
              </div>
            </Card>
          </div>
        </div>
      </div>:<Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Contrat</TH><TH>Type</TH><TH>Catégorie</TH><TH>Client/Partie</TH><TH>Date</TH><TH>Expiration</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{filtered.map((c,i)=><tr key={i} style={{cursor:"pointer"}} onClick={()=>setSel(c)}>
            <Td style={{fontWeight:700,fontSize:11}}>{c.id}</Td>
            <Td><Pill color={c.type==="RH"?C.green:c.type==="Tech"?C.blue:c.type==="Juridique"?C.purple:C.gold}>{c.type}</Pill></Td>
            <Td><Pill color={C.blue}>{c.categorie}</Pill></Td>
            <Td style={{fontWeight:600}}>{c.client}</Td>
            <Td style={{color:C.muted,fontSize:10}}>{c.date}</Td>
            <Td style={{color:c.statut==="expiré"?C.red:C.muted,fontSize:10,fontWeight:c.statut==="expiré"?700:400}}>{c.expire}</Td>
            <Td><St s={c.statut}/></Td>
            <Td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:4}}>
              {c.statut==="brouillon"&&<Btn onClick={()=>{setContrats(cs=>cs.map(x=>x.id===c.id?{...x,statut:"envoyé"}:x));showToast("📤 Envoyé pour signature");}} style={{fontSize:9,padding:"3px 8px"}}>Envoyer</Btn>}
              {c.statut==="envoyé"&&<Btn onClick={()=>{setShowSign(c);setOnglet("esign");setSignStep(1);}} style={{fontSize:9,padding:"3px 8px",background:C.green}}>✒</Btn>}
              <BtnGhost onClick={()=>showToast("📄 PDF téléchargé")} style={{fontSize:9,padding:"3px 8px"}}>PDF</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ── CRÉER UN CONTRAT ────────────────────── */}
    {onglet==="creer"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <Card style={{marginBottom:12}}>
            <STitle>📋 Informations du contrat</STitle>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Modèle de contrat *</label>
                <select value={createForm.modele} onChange={e=>setCreateForm(f=>({...f,modele:e.target.value}))} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 12px",color:C.text,fontSize:12,fontFamily:"inherit",width:"100%"}}>
                  {MODELES_CONTRATS.map(m=><option key={m.id} value={m.id}>{m.label} ({m.type})</option>)}
                </select>
              </div>
              <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Titre du contrat</label><Inp value={createForm.titre} onChange={e=>setCreateForm(f=>({...f,titre:e.target.value}))} placeholder="Ex: Contrat prestation — Client X"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Partie / Client</label><Inp value={createForm.client} onChange={e=>setCreateForm(f=>({...f,client:e.target.value}))} placeholder="Nom ou raison sociale"/></div>
                <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Catégorie</label>
                  <select value={createForm.categorie} onChange={e=>setCreateForm(f=>({...f,categorie:e.target.value}))} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:12,fontFamily:"inherit",width:"100%"}}>
                    {["Client","Partenaire","RH","Fournisseur","Client SaaS"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Date d'expiration</label><Inp value={createForm.expire} onChange={e=>setCreateForm(f=>({...f,expire:e.target.value}))} placeholder="JJ/MM/AAAA"/></div>
                <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Valeur (€)</label><Inp value={createForm.valeur} onChange={e=>setCreateForm(f=>({...f,valeur:e.target.value}))} placeholder="0"/></div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>{
                  const m=MODELES_CONTRATS.find(x=>x.id===createForm.modele);
                  const nc={id:`CTR-00${contrats.length+1}`,titre:createForm.titre||m.label+" — "+createForm.client,type:m.type,modele:createForm.modele,client:createForm.client||"À renseigner",categorie:createForm.categorie,statut:"brouillon",date:new Date().toLocaleDateString("fr"),expire:createForm.expire||"—",valeur:Number(createForm.valeur)||0,signataire:createForm.client,signé_le:null,fichier:null};
                  setContrats(cs=>[nc,...cs]);setCreateForm({modele:"prestation",titre:"",client:"",categorie:"Client",expire:"",valeur:""});
                  showToast(`✅ Contrat "${nc.titre}" créé en brouillon !`);setOnglet("tous");
                }}>✅ Créer en brouillon</Btn>
                <BtnGhost onClick={()=>showToast("🤖 Contrat rédigé par Claude IA !")}>🤖 Rédiger avec IA</BtnGhost>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <STitle>📁 Modèles disponibles</STitle>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {MODELES_CONTRATS.map((m,i)=>{const colors={Commercial:C.gold,RH:C.green,Juridique:C.purple,Tech:C.blue};return <div key={i} onClick={()=>setCreateForm(f=>({...f,modele:m.id}))} style={{background:createForm.modele===m.id?`${colors[m.type]||C.gold}15`:C.card2,border:`1px solid ${createForm.modele===m.id?colors[m.type]||C.gold:C.border}`,borderRadius:8,padding:10,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <div style={{fontSize:11,fontWeight:700,color:createForm.modele===m.id?colors[m.type]||C.gold:C.text}}>{m.label}</div>
                  <Pill color={colors[m.type]||C.gold}>{m.type}</Pill>
                </div>
                <div style={{fontSize:10,color:C.muted}}>{m.desc}</div>
              </div>;})}
            </div>
          </Card>
        </div>
      </div>
    </div>}

    {/* ── E-SIGNATURE ─────────────────────────── */}
    {onglet==="esign"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <Card style={{marginBottom:12}}>
            <STitle>✒ Signer un contrat</STitle>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {contrats.filter(c=>c.statut==="envoyé"||c.statut==="brouillon").map((c,i)=><div key={i} onClick={()=>{setShowSign(c);setSignStep(1);}} style={{background:showSign?.id===c.id?`${C.gold}15`:C.card2,border:`1px solid ${showSign?.id===c.id?C.gold:C.border}`,borderRadius:8,padding:10,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div><div style={{fontSize:11,fontWeight:700}}>{c.titre}</div><div style={{fontSize:9,color:C.muted}}>{c.client} · {c.date}</div></div>
                  <St s={c.statut}/>
                </div>
              </div>)}
            </div>
            {showSign&&<div>
              <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:12,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>{showSign.titre}</div>
                <div style={{fontSize:10,color:C.muted,marginBottom:10}}>Signataire : {showSign.signataire} · {showSign.client}</div>
                {/* Étapes signature */}
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  {[{n:1,l:"Vérification"},{n:2,l:"Lecture"},{n:3,l:"Signature"},{n:4,l:"Confirmation"}].map(s=><div key={s.n} style={{flex:1,textAlign:"center"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:signStep>=s.n?C.gold:`${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:signStep>=s.n?"#000":C.muted,margin:"0 auto 4px"}}>{signStep>s.n?"✓":s.n}</div>
                    <div style={{fontSize:9,color:signStep>=s.n?C.gold:C.muted}}>{s.l}</div>
                  </div>)}
                </div>
                {signStep===1&&<div>
                  <div style={{fontSize:11,color:C.text,marginBottom:10,lineHeight:1.6}}>Vous allez signer électroniquement le contrat <b style={{color:C.gold}}>{showSign.titre}</b>. Cette signature a valeur légale selon le règlement eIDAS de l'Union Européenne.</div>
                  <Btn onClick={()=>setSignStep(2)}>Continuer →</Btn>
                </div>}
                {signStep===2&&<div>
                  <div style={{background:C.dark,borderRadius:8,padding:12,fontSize:11,color:C.muted,lineHeight:1.9,marginBottom:10,maxHeight:120,overflowY:"auto"}}>
                    <b style={{color:C.gold}}>CONTRAT DE {showSign.type.toUpperCase()}</b><br/>
                    Entre Xyra SaaS SASU (SIREN: 123 456 789) et {showSign.client}.<br/>
                    Il est convenu ce qui suit : La prestation sera réalisée selon les conditions définies...<br/>
                    Durée : du {showSign.date} au {showSign.expire}. Valeur : {showSign.valeur>0?fmt(showSign.valeur):"Définie en annexe"}.<br/>
                    Lu et approuvé.
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <BtnGhost onClick={()=>setSignStep(1)}>← Retour</BtnGhost>
                    <Btn onClick={()=>setSignStep(3)}>J'ai lu le contrat →</Btn>
                  </div>
                </div>}
                {signStep===3&&<div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Tapez votre nom complet pour valider votre signature électronique :</div>
                  <Inp placeholder={showSign.signataire+" (tapez votre nom)"} style={{marginBottom:10}}/>
                  <div style={{fontSize:10,color:C.muted,marginBottom:10}}>📍 Votre IP et horodatage seront enregistrés · Conforme eIDAS</div>
                  <div style={{display:"flex",gap:8}}>
                    <BtnGhost onClick={()=>setSignStep(2)}>← Retour</BtnGhost>
                    <Btn onClick={()=>setSignStep(4)} style={{background:C.green}}>✒ Signer électroniquement</Btn>
                  </div>
                </div>}
                {signStep===4&&<div style={{textAlign:"center",padding:"10px 0"}}>
                  <div style={{fontSize:32,marginBottom:8}}>✅</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.green,marginBottom:4}}>Contrat signé avec succès !</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Signé le {new Date().toLocaleDateString("fr")} à {new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})} · eIDAS conforme</div>
                  <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                    <Btn onClick={()=>{setContrats(cs=>cs.map(c=>c.id===showSign.id?{...c,statut:"signé",signé_le:new Date().toLocaleDateString("fr"),fichier:`${showSign.id}-signé.pdf`}:c));showToast("✅ Contrat signé et archivé ! PDF envoyé par email.");setShowSign(null);setSignStep(1);}}>📄 Télécharger PDF signé</Btn>
                    <BtnGhost onClick={()=>showToast("📱 Copie envoyée sur WhatsApp")}>📱 WhatsApp</BtnGhost>
                  </div>
                </div>}
              </div>
            </div>}
          </Card>
        </div>
        <Card>
          <STitle>📋 Historique des signatures</STitle>
          {contrats.filter(c=>c.statut==="signé").map((c,i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${C.green}22`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontSize:11,fontWeight:700}}>{c.titre}</div>
              <Pill color={C.green}>✓ Signé</Pill>
            </div>
            <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{c.client} · Signé le {c.signé_le}</div>
            <div style={{display:"flex",gap:6}}>
              <BtnGhost onClick={()=>showToast(`📄 ${c.fichier} téléchargé`)} style={{fontSize:9,padding:"3px 8px"}}>📄 PDF signé</BtnGhost>
              <BtnGhost onClick={()=>showToast("🔐 Certificat eIDAS téléchargé")} style={{fontSize:9,padding:"3px 8px"}}>🔐 Certificat</BtnGhost>
            </div>
          </div>)}
        </Card>
      </div>
    </div>}

    {/* ── AVENANTS ────────────────────────────── */}
    {onglet==="avenants"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle>📝 Avenants & Renouvellements</STitle>
        <Btn onClick={()=>showToast("📝 Avenant créé en brouillon !")}>+ Créer un avenant</Btn>
      </div>
      <Card style={{marginBottom:12}}>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[{contrat:"CTR-002",titre:"Avenant 1 — Augmentation commission Thomas Beaumont",motif:"Passage de 20% à 22% dès le 01/05/2026",date:"20/04/2026",statut:"brouillon"},{contrat:"CTR-005",titre:"Avenant 1 — Renouvellement CDD Fatou Sarr",motif:"Extension 6 mois + 200€/mois augmentation",date:"28/03/2026",statut:"signé"},{contrat:"CTR-008",titre:"Avenant 1 — Renouvellement fournisseur CleanPro",motif:"Reconduction annuelle avec révision tarifaire +5%",date:"15/04/2026",statut:"envoyé"}].map((av,i)=><div key={i} style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{av.titre}</div>
                <div style={{fontSize:10,color:C.muted}}>Contrat {av.contrat} · {av.date}</div>
                <div style={{fontSize:11,color:C.text,marginTop:4,fontStyle:"italic"}}>"{av.motif}"</div>
              </div>
              <St s={av.statut}/>
            </div>
            <div style={{display:"flex",gap:6,marginTop:8}}>
              {av.statut==="brouillon"&&<Btn onClick={()=>showToast("📤 Avenant envoyé pour signature")} style={{fontSize:10,padding:"5px 10px"}}>Envoyer</Btn>}
              {av.statut==="envoyé"&&<Btn onClick={()=>showToast("✒ Avenant signé !")} style={{fontSize:10,padding:"5px 10px",background:C.green}}>✒ Signer</Btn>}
              <BtnGhost onClick={()=>showToast("📄 PDF avenant téléchargé")} style={{fontSize:10,padding:"5px 8px"}}>PDF</BtnGhost>
            </div>
          </div>)}
        </div>
      </Card>
      <Card>
        <STitle>🔄 Renouvellements à venir</STitle>
        {contrats.filter(c=>c.expire!=="—"&&c.statut==="signé").map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{c.titre}</div><div style={{fontSize:10,color:C.muted}}>Expire le {c.expire}</div></div>
          <Btn onClick={()=>showToast(`🔄 Renouvellement ${c.titre} initié`)} style={{fontSize:10,padding:"4px 10px",background:C.teal}}>🔄 Renouveler</Btn>
        </div>)}
      </Card>
    </div>}

    {/* ── ARCHIVAGE ───────────────────────────── */}
    {onglet==="archivage"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Contrats archivés" val={contrats.filter(c=>c.fichier).length} color={C.blue}/>
        <KPI label="Stockage utilisé" val="142 MB" color={C.gold}/>
        <KPI label="Durée conservation" val="10 ans" color={C.green}/>
      </div>
      <Card>
        <STitle>🗄 Archive sécurisée</STitle>
        <div style={{background:`${C.green}08`,border:`1px solid ${C.green}22`,borderRadius:8,padding:12,marginBottom:12,fontSize:11,color:C.text}}>
          🔒 Vos contrats sont stockés de manière chiffrée (AES-256) sur Supabase. Conservation légale 10 ans. Conforme RGPD.
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Contrat</TH><TH>Type</TH><TH>Signé le</TH><TH>Fichier</TH><TH>Actions</TH></tr></thead>
          <tbody>{contrats.filter(c=>c.fichier).map((c,i)=><tr key={i}>
            <Td style={{fontWeight:600,fontSize:11}}>{c.titre}</Td>
            <Td><Pill color={C.blue}>{c.type}</Pill></Td>
            <Td style={{color:C.muted,fontSize:10}}>{c.signé_le}</Td>
            <Td style={{fontSize:10,color:C.teal,fontFamily:"monospace"}}>{c.fichier}</Td>
            <Td><div style={{display:"flex",gap:4}}>
              <Btn onClick={()=>showToast(`📥 ${c.fichier} téléchargé`)} style={{fontSize:9,padding:"3px 8px"}}>📥 PDF</Btn>
              <BtnGhost onClick={()=>showToast("🔐 Certificat eIDAS téléchargé")} style={{fontSize:9,padding:"3px 8px"}}>🔐</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </div>}

    {/* ── ALERTES ─────────────────────────────── */}
    {onglet==="alertes"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {[
        {icon:"🚨",t:"Contrat expiré — CleanPro (fournisseur)",d:"CTR-008 expiré le 31/12/2024. Aucun renouvellement initié. Risque : commandes non couvertes par contrat.",c:C.red,a:"Renouveler",fn:()=>showToast("🔄 Renouvellement CleanPro initié")},
        {icon:"⏰",t:"Contrat à signer — Cabinet Delmas",d:"CTR-006 envoyé le 15/04. En attente de signature depuis 11 jours. Envoyez un rappel.",c:C.orange,a:"Relancer",fn:()=>showToast("📱 Rappel WhatsApp envoyé à Me Delmas")},
        {icon:"📅",t:"Expiration dans 60 jours — Thomas Beaumont",d:"CTR-002 expire le 28/02/2026. Préparez le renouvellement maintenant pour éviter une rupture.",c:C.gold,a:"Préparer renouvellement",fn:()=>showToast("📝 Renouvellement CTR-002 créé en brouillon")},
        {icon:"✅",t:"Tous les contrats RH sont à jour",d:"CDI Thomas + CDD Fatou + CDI Abou — tous signés et valides.",c:C.green,a:null,fn:null},
      ].map((a,i)=><div key={i} style={{background:`${a.c}11`,border:`1px solid ${a.c}33`,borderRadius:10,padding:14,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:a.c,marginBottom:4}}>{a.icon} {a.t}</div><div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{a.d}</div></div>
        {a.a&&<Btn onClick={a.fn} color={a.c} style={{fontSize:11,padding:"7px 14px",flexShrink:0,color:a.c===C.green?"#000":"#000"}}>{a.a}</Btn>}
      </div>)}
    </div>}
  </div>;
};

// ─── PAGE FACTURATION ÉLECTRONIQUE ───────────────────────────

export default PageSignatures;
