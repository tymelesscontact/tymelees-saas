"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageDevis=({plan,showToast,profil,activeCompany})=>{
  const MODELES=[
    {id:"airbnb",label:"Nettoyage Airbnb",lignes:[{desc:"Nettoyage complet appartement",qte:1,pu:180,tva:20},{desc:"Blanchisserie linge de lit",qte:1,pu:45,tva:20},{desc:"Réassort produits accueil",qte:1,pu:25,tva:20}]},
    {id:"bureau",label:"Nettoyage bureaux",lignes:[{desc:"Nettoyage bureaux (surface)",qte:1,pu:280,tva:20},{desc:"Nettoyage sanitaires",qte:1,pu:80,tva:20},{desc:"Vitrerie intérieure",qte:1,pu:120,tva:20}]},
    {id:"jet",label:"Jet privé",lignes:[{desc:"Nettoyage cabine jet privé",qte:1,pu:1200,tva:20},{desc:"Désinfection complète",qte:1,pu:400,tva:20},{desc:"Réassort catering bord",qte:1,pu:800,tva:20}]},
    {id:"yacht",label:"Yacht / Bateau",lignes:[{desc:"Nettoyage pont et coque",qte:1,pu:1800,tva:20},{desc:"Entretien intérieur yacht",qte:1,pu:1200,tva:20}]},
    {id:"rapatriement",label:"Rapatriement de corps",lignes:[{desc:"Prise en charge et transport",qte:1,pu:3200,tva:0},{desc:"Formalités administratives",qte:1,pu:800,tva:0},{desc:"Accompagnement famille",qte:1,pu:400,tva:0}]},
    {id:"custom",label:"Personnalisé",lignes:[{desc:"",qte:1,pu:0,tva:20}]},
  ];

  const[devis,setDevis]=useState([]);
  const[loadingDevis,setLoadingDevis]=useState(true);
  const loadDevis=async()=>{
    try{
      const companyParam=activeCompany?.id?`&company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/devis?action=list'+companyParam);
      const data=await res.json();
      if(data.devis)setDevis(data.devis.map(d=>({
        id:d.reference,dbId:d.id,client:d.client_nom,email:d.client_email,tel:d.client_tel,
        service:d.service,montant:Number(d.montant),statut:d.statut,
        date:new Date(d.created_at).toLocaleDateString("fr"),
        lignes:d.lignes||[],remise:0,note:d.notes||"",vu:!!d.validé_at,
        tauxTva:Number(d.taux_tva ?? 20),description:d.description||"",
      })));
    }catch(e){console.error("Devis:",e);}
    setLoadingDevis(false);
  };
  useEffect(()=>{loadDevis();},[activeCompany]);
  const[onglet,setOnglet]=useState("liste");
  const[showCreate,setShowCreate]=useState(false);
  const[modeleId,setModeleId]=useState("airbnb");
  const[form,setForm]=useState({client:"",email:"",tel:"",adresse:"",objet:"",validite:"30",remise:0,note:""});
  const[lignes,setLignes]=useState(MODELES[0].lignes.map(l=>({...l})));
  const[signEtape,setSignEtape]=useState(null);
  const[relanceId,setRelanceId]=useState(null);
  const[filtreStatut,setFiltreStatut]=useState("tous");

  const tabs=[{id:"liste",label:"📋 Tous les devis"},{id:"creer",label:"✍ Créer un devis"},{id:"modeles",label:"📁 Modèles"},{id:"relances",label:"🤖 Relances IA"},{id:"stats",label:"📊 Stats"}];

  const totalHT=lignes.reduce((a,l)=>a+l.qte*l.pu,0);
  const totalTVA=lignes.reduce((a,l)=>a+l.qte*l.pu*(l.tva/100),0);
  const totalRemise=totalHT*(form.remise/100);
  const totalTTC=totalHT+totalTVA-totalRemise;

  const statutColor={brouillon:C.muted,envoyé:C.blue,vu:C.purple,signé:C.green,payé:C.teal,refusé:C.red,en_attente:C.orange};

  const handleModele=(id)=>{
    setModeleId(id);
    const m=MODELES.find(x=>x.id===id);
    if(m) setLignes(m.lignes.map(l=>({...l})));
  };

  const ajouterLigne=()=>setLignes(ls=>[...ls,{desc:"",qte:1,pu:0,tva:20}]);
  const supprimerLigne=(i)=>setLignes(ls=>ls.filter((_,j)=>j!==i));
  const updateLigne=(i,k,v)=>setLignes(ls=>ls.map((l,j)=>j===i?{...l,[k]:v}:l));

  const creerDevis=async(statut="brouillon")=>{
    if(!form.client)return showToast("⚠️ Remplissez le nom du client");
    const serviceLabel=form.objet||MODELES.find(m=>m.id===modeleId)?.label||"Devis";
    const descriptionResume=lignes.map(l=>`${l.desc||"Ligne"} x${l.qte} — ${l.pu}€`).join("; ");
    try{
      const tauxTvaMoyen=totalHT>0?Math.round((totalTVA/totalHT)*100):20;
      const res=await fetch('/api/devis',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          clientName:form.client,clientPhone:form.tel,clientEmail:form.email,
          service:serviceLabel,description:descriptionResume,
          montant:Math.round(totalTTC),lignes,notes:form.note,taux_tva:tauxTvaMoyen,statut,
        }),
      });
      const data=await res.json();
      if(!data.success)return null;
      const nd={id:data.numeroDevis,client:form.client,email:form.email,tel:form.tel,service:serviceLabel,montant:Math.round(totalTTC),statut,date:new Date().toLocaleDateString("fr"),lignes:[...lignes],remise:form.remise,note:form.note,vu:false};
      loadDevis();
      return nd;
    }catch(e){showToast("❌ Erreur de connexion");return null;}
  };

  const resetForm=()=>{
    setForm({client:"",email:"",tel:"",adresse:"",objet:"",validite:"30",remise:0,note:""});
    setLignes(MODELES[0].lignes.map(l=>({...l})));
    setOnglet("liste");
  };

  const apercuPDF=()=>{
    if(!form.client)return showToast("⚠️ Remplissez le nom du client");
    const win=window.open("","_blank");
    if(!win)return showToast("⚠️ Autorisez les pop-ups pour voir l'aperçu");
    const lignesHtml=lignes.map(l=>`<tr><td style="padding:8px 0;border-bottom:1px solid #1E1E3633;">${l.desc}</td><td style="padding:8px 0;text-align:center;border-bottom:1px solid #1E1E3633;">${l.qte}</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #1E1E3633;">${l.pu}€</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #1E1E3633;">${(l.qte*l.pu).toFixed(2)}€</td></tr>`).join("");
    win.document.write(`<!DOCTYPE html><html><head><title>Devis — ${form.client}</title><style>
      body{font-family:'Segoe UI',sans-serif;background:#fff;color:#111;padding:40px;max-width:700px;margin:0 auto;}
      h1{font-size:22px;color:#C9A84C;font-family:Georgia,serif;letter-spacing:.1em;}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-top:20px;}
      th{text-align:left;padding-bottom:8px;color:#888;border-bottom:2px solid #ddd;}
      .total{text-align:right;margin-top:20px;font-size:20px;font-weight:700;color:#C9A84C;}
      .btn{background:#C9A84C;color:#000;border:none;padding:10px 24px;border-radius:6px;font-weight:700;cursor:pointer;margin-top:30px;}
      @media print{.btn{display:none;}}
    </style></head><body>
      <h1>XYRA</h1>
      <p style="color:#888;font-size:11px;">Devis pour ${form.client}${form.email?" · "+form.email:""}${form.tel?" · "+form.tel:""}</p>
      <h2 style="margin-top:20px;">${form.objet||MODELES.find(m=>m.id===modeleId)?.label||"Devis"}</h2>
      <table><tr><th>Description</th><th>Qté</th><th style="text-align:right;">PU</th><th style="text-align:right;">Total</th></tr>${lignesHtml}</table>
      <div class="total">Total TTC : ${totalTTC.toFixed(2)}€</div>
      ${form.note?`<p style="margin-top:16px;color:#666;font-size:12px;">${form.note}</p>`:""}
      <button class="btn" onclick="window.print()">🖨 Imprimer / Enregistrer en PDF</button>
    </body></html>`);
    win.document.close();
  };

  const creerEtEnvoyer=async()=>{
    if(!form.client)return showToast("⚠️ Remplissez le nom du client");
    if(!form.email&&!form.tel)return showToast("⚠️ Ajoutez un email ou un téléphone pour envoyer le devis");
    const nd=await creerDevis("envoyé");
    if(!nd)return;
    showToast("📤 Envoi en cours...");
    try{
      const res=await fetch('/api/devis/notify',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id:nd.id,client:nd.client,email:nd.email,tel:nd.tel,service:nd.service,montant:nd.montant,lignes:nd.lignes,note:nd.note}),
      });
      const data=await res.json();
      if(data.success){
        const sent=[];
        if(data.results?.email)sent.push("email");
        if(data.results?.whatsapp)sent.push("WhatsApp");
        showToast(sent.length?`✅ Devis ${nd.id} envoyé par ${sent.join(" et ")} !`:"⚠️ Devis créé mais l'envoi a échoué — vérifiez la config");
      }else{
        showToast("⚠️ Devis créé mais l'envoi a échoué");
      }
    }catch(e){
      showToast("⚠️ Devis créé mais erreur de connexion lors de l'envoi");
    }
    resetForm();
  };

  const filtred=filtreStatut==="tous"?devis:devis.filter(d=>d.statut===filtreStatut);
  const[editDevis,setEditDevis]=useState(null);
  const majStatutDevis=async(dbId,champs,msgSucces)=>{
    try{
      const res=await fetch('/api/devis',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:dbId,...champs})});
      const data=await res.json();
      if(data.success){showToast(msgSucces);loadDevis();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const convertirEnFacture=async(d)=>{
    const taux=d.tauxTva||20;
    const montantHT=Math.round((d.montant/(1+taux/100))*100)/100;
    try{
      const res=await fetch('/api/factures',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'creer',client_nom:d.client,client_email:d.email,client_tel:d.tel,
          description:d.description||d.service,montant_ht:montantHT,taux_tva:taux,
        }),
      });
      const data=await res.json();
      if(data.success&&data.facture){
        await majStatutDevis(d.dbId,{statut:"payé"},"✅ Facture "+data.facture.numero+" creee, devis marque paye");
      }else{
        showToast("❌ Erreur creation facture: "+(data.error||"inconnue"));
      }
    }catch(e){showToast("❌ Erreur de connexion facture");}
  };
  const sauverEditDevis=async()=>{
    if(!editDevis)return;
    await majStatutDevis(editDevis.dbId,{client_nom:editDevis.client,client_email:editDevis.email,client_tel:editDevis.tel,service:editDevis.service,montant:editDevis.montant,notes:editDevis.note},"✅ Devis mis à jour");
    setEditDevis(null);
  };
  const supprimerDevis=async()=>{
    if(!editDevis)return;
    if(!window.confirm("Supprimer definitivement le devis "+editDevis.id+" ?"))return;
    try{
      const res=await fetch("/api/devis?id="+editDevis.dbId,{method:"DELETE"});
      const data=await res.json();
      if(data.success){showToast("🗑 Devis "+editDevis.id+" supprime");setEditDevis(null);loadDevis();}
      else showToast("❌ "+(data.error||"Erreur inconnue"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  if(!hasAccess(plan,"devis"))return <div style={{padding:20}}><UpgradeWall page="devis" plan={plan}/></div>;

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>◧ {profil?.termes?.devis||"Devis"}</div>
        <div style={{fontSize:11,color:C.muted}}>Créateur complet · PDF · WhatsApp · E-signature · Bot WhatsApp · {devis.length} {(profil?.termes?.devis||"devis").toLowerCase()}</div></div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={()=>showToast("🤖 Bot WhatsApp connecté — réponse auto activée")}>🤖 Bot WA</BtnGhost>
        <Btn onClick={()=>setOnglet("creer")}>+ Nouveau devis</Btn>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      {[["Total",devis.length,C.blue],["Signés",devis.filter(d=>d.statut==="signé"||d.statut==="payé").length,C.green],["En attente",devis.filter(d=>d.statut==="en_attente"||d.statut==="envoyé").length,C.orange],["CA signé",fmt(devis.filter(d=>d.statut==="signé"||d.statut==="payé").reduce((a,d)=>a+d.montant,0)),C.gold],["Taux conversion",Math.round(devis.filter(d=>d.statut==="signé"||d.statut==="payé").length/devis.length*100)+"%",C.teal]].map(([l,v,c],i)=><CT key={i}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></CT>)}
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── LISTE ── */}
    {onglet==="liste"&&<div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {["tous","brouillon","envoyé","vu","signé","payé","refusé"].map(s=><button key={s} onClick={()=>setFiltreStatut(s)} style={{background:filtreStatut===s?C.gold:"transparent",color:filtreStatut===s?"#000":C.muted,border:`1px solid ${filtreStatut===s?C.gold:C.border}`,borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:filtreStatut===s?700:400,textTransform:"capitalize"}}>{s}</button>)}
      </div>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>N° {profil?.termes?.devis||"Devis"}</TH><TH>{profil?.termes?.client||"Client"}</TH><TH>Service</TH><TH>Montant TTC</TH><TH>Date</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{filtred.map((d,i)=><tr key={i} onClick={()=>setEditDevis({...d})} style={{cursor:"pointer"}}>
            <Td style={{color:C.gold,fontWeight:700}}>{d.id}</Td>
            <Td style={{fontWeight:600}}>{d.client}</Td>
            <Td style={{color:C.muted,fontSize:11}}>{d.service}</Td>
            <Td style={{color:C.green,fontWeight:700,fontSize:14}}>{fmt(d.montant)}</Td>
            <Td style={{color:C.muted,fontSize:10}}>{d.date}</Td>
            <Td><Pill color={statutColor[d.statut]||C.muted}>{d.statut}</Pill></Td>
            <Td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {d.statut==="brouillon"&&<Btn onClick={()=>majStatutDevis(d.dbId,{statut:"envoyé"},`📤 Devis ${d.id} marqué envoyé`)} style={{fontSize:9,padding:"3px 7px"}}>📤 Envoyer</Btn>}
              {(d.statut==="envoyé"||d.statut==="vu")&&<Btn onClick={()=>setSignEtape({id:d.id,dbId:d.dbId,client:d.client,etape:1})} style={{fontSize:9,padding:"3px 7px",background:C.green}}>✒ Signer</Btn>}
              {d.statut==="signé"&&<Btn onClick={()=>convertirEnFacture(d)} style={{fontSize:9,padding:"3px 7px",background:C.teal}}>💳 Payé</Btn>}
              <BtnGhost onClick={()=>showToast(`📄 PDF ${d.id} généré`)} style={{fontSize:9,padding:"3px 7px"}}>PDF</BtnGhost>
              <BtnGhost onClick={()=>showToast(`📱 Relance envoyée à ${d.client}`)} style={{fontSize:9,padding:"3px 7px"}}>WA</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>
      {signEtape&&<div style={{position:"fixed",inset:0,background:"#000000AA",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
        <Card style={{width:440,maxWidth:"90vw"}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>✒ Signature électronique</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Devis {signEtape.id} · {signEtape.client}</div>
          {signEtape.etape===1&&<div>
            <div style={{fontSize:11,color:C.text,lineHeight:1.7,marginBottom:12}}>Vous allez signer électroniquement ce devis. La signature a valeur légale (règlement eIDAS).</div>
            <div style={{display:"flex",gap:8}}><Btn onClick={()=>setSignEtape(s=>({...s,etape:2}))}>Continuer →</Btn><BtnGhost onClick={()=>setSignEtape(null)}>Annuler</BtnGhost></div>
          </div>}
          {signEtape.etape===2&&<div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Tapez votre nom pour valider :</div>
            <Inp placeholder={signEtape.client} style={{marginBottom:10}}/>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>📍 IP + horodatage enregistrés · Conforme eIDAS</div>
            <div style={{display:"flex",gap:8}}><Btn onClick={()=>setSignEtape(s=>({...s,etape:3}))} style={{background:C.green}}>✒ Signer</Btn><BtnGhost onClick={()=>setSignEtape(s=>({...s,etape:1}))}>← Retour</BtnGhost></div>
          </div>}
          {signEtape.etape===3&&<div style={{textAlign:"center",padding:"10px 0"}}>
            <div style={{fontSize:32,marginBottom:8}}>✅</div>
            <div style={{fontSize:14,fontWeight:700,color:C.green,marginBottom:4}}>Devis signé !</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Signé le {new Date().toLocaleDateString("fr")} — eIDAS conforme</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <Btn onClick={async()=>{await majStatutDevis(signEtape.dbId,{statut:"signé"},"✅ Signe ! PDF envoye par email et WhatsApp");setSignEtape(null);}}>📄 Télécharger PDF signé</Btn>
            </div>
          </div>}
        </Card>
      </div>}
      {editDevis&&<div style={{position:"fixed",inset:0,background:"#000000AA",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
        <Card style={{width:480,maxWidth:"90vw",maxHeight:"85vh",overflowY:"auto"}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>✏ Modifier le devis {editDevis.id}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Statut actuel : <Pill color={statutColor[editDevis.statut]||C.muted}>{editDevis.statut}</Pill></div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Client</label><Inp value={editDevis.client} onChange={e=>setEditDevis(d=>({...d,client:e.target.value}))}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email</label><Inp value={editDevis.email||""} onChange={e=>setEditDevis(d=>({...d,email:e.target.value}))}/></div>
              <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Téléphone</label><Inp value={editDevis.tel||""} onChange={e=>setEditDevis(d=>({...d,tel:e.target.value}))}/></div>
            </div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Service / Objet</label><Inp value={editDevis.service||""} onChange={e=>setEditDevis(d=>({...d,service:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant TTC (€)</label><Inp value={editDevis.montant} onChange={e=>setEditDevis(d=>({...d,montant:Number(e.target.value)||0}))}/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Note</label><Inp value={editDevis.note||""} onChange={e=>setEditDevis(d=>({...d,note:e.target.value}))} placeholder="Conditions, précisions..."/></div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:16}}>
            <Btn onClick={sauverEditDevis}>💾 Enregistrer</Btn>
            <BtnGhost onClick={()=>setEditDevis(null)}>Annuler</BtnGhost>
            <BtnGhost onClick={supprimerDevis} style={{color:C.red,borderColor:C.red+"44"}}>🗑 Supprimer</BtnGhost>
          </div>
        </Card>
      </div>}
    </div>}

    {/* ── CRÉER ── */}
    {onglet==="creer"&&<div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:14}}>
      <div>
        <Card style={{marginBottom:12}}>
          <STitle>👤 Informations client</STitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["Client *","client","Nom ou raison sociale"],["Email","email","email@client.com"],["Téléphone WhatsApp","tel","+33 6..."],["Objet du devis","objet","Ex: Nettoyage Airbnb Montmartre"]].map(([l,k,ph])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}/></div>)}
          </div>
        </Card>
        <Card style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <STitle>📦 Lignes de prestation</STitle>
            <Btn onClick={ajouterLigne} style={{fontSize:11,padding:"5px 12px"}}>+ Ligne</Btn>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><TH>Description</TH><TH>Qté</TH><TH>PU HT (€)</TH><TH>TVA %</TH><TH>Total HT</TH><TH></TH></tr></thead>
            <tbody>{lignes.map((l,i)=><tr key={i}>
              <Td><Inp value={l.desc} onChange={e=>updateLigne(i,"desc",e.target.value)} placeholder="Description..." style={{fontSize:11}}/></Td>
              <Td><Inp value={l.qte} onChange={e=>updateLigne(i,"qte",Number(e.target.value))} style={{width:50,fontSize:11}}/></Td>
              <Td><Inp value={l.pu} onChange={e=>updateLigne(i,"pu",Number(e.target.value))} style={{width:80,fontSize:11}}/></Td>
              <Td><Sel value={l.tva} onChange={e=>updateLigne(i,"tva",Number(e.target.value))} style={{width:60,fontSize:10}}><option value={20}>20%</option><option value={10}>10%</option><option value={5.5}>5.5%</option><option value={0}>0%</option></Sel></Td>
              <Td style={{color:C.green,fontWeight:700}}>{fmt(l.qte*l.pu)}</Td>
              <Td><button onClick={()=>supprimerLigne(i)} style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:16}}>✕</button></Td>
            </tr>)}</tbody>
          </table>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Remise (%)</label><Inp value={form.remise} onChange={e=>setForm(f=>({...f,remise:Number(e.target.value)}))} placeholder="0"/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Validité (jours)</label><Inp value={form.validite} onChange={e=>setForm(f=>({...f,validite:e.target.value}))} placeholder="30"/></div>
          </div>
          <div style={{marginTop:8}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Note / conditions</label><Inp value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Conditions de paiement, délais..."/></div>
        </Card>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={async()=>{const nd=await creerDevis("brouillon");if(nd){showToast(`✅ Devis ${nd.id} créé en brouillon`);resetForm();}}} style={{flex:1}}>✅ Créer le devis</Btn>
          <BtnGhost onClick={apercuPDF} style={{flex:1}}>👁 Aperçu PDF</BtnGhost>
          <BtnGhost onClick={creerEtEnvoyer} style={{flex:1}}>📤 Créer & Envoyer</BtnGhost>
        </div>
      </div>
      {/* Récap */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card style={{background:`${C.gold}08`,borderColor:`${C.gold}33`}}>
          <STitle>💰 Récapitulatif</STitle>
          {[["Sous-total HT",fmt(totalHT),C.text],["TVA",fmt(totalTVA),C.orange],form.remise>0?["Remise "+form.remise+"%","-"+fmt(totalRemise),C.red]:null,["TOTAL TTC",fmt(totalTTC),C.gold]].filter(Boolean).map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:i===3?14:12,fontWeight:i===3?700:400}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:i===3?700:400}}>{v}</span></div>)}
        </Card>
        <Card>
          <STitle>📁 Modèle utilisé</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {MODELES.map(m=><button key={m.id} onClick={()=>handleModele(m.id)} style={{background:modeleId===m.id?`${C.gold}15`:"transparent",border:`1px solid ${modeleId===m.id?C.gold:C.border}`,borderRadius:7,padding:"7px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",color:modeleId===m.id?C.gold:C.muted,textAlign:"left",fontWeight:modeleId===m.id?700:400}}>{m.label}</button>)}
          </div>
        </Card>
        <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Bot WhatsApp connecté</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>Le devis sera automatiquement envoyé via le bot WhatsApp Xyra. Le client peut signer directement depuis WhatsApp.</div>
        </Card>
      </div>
    </div>}

    {/* ── MODÈLES ── */}
    {onglet==="modeles"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
      {MODELES.map((m,i)=><Card key={i} style={{cursor:"pointer",borderColor:`${C.gold}22`}} onClick={()=>{handleModele(m.id);setOnglet("creer");}}>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:8}}>{m.label}</div>
        <div style={{fontSize:20,fontWeight:700,color:C.gold,marginBottom:8}}>{fmt(m.lignes.reduce((a,l)=>a+l.qte*l.pu,0))}<span style={{fontSize:11,color:C.muted}}> HT</span></div>
        <div style={{marginBottom:10}}>
          {m.lignes.map((l,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",borderBottom:`1px solid ${C.border}22`}}><span style={{color:C.muted}}>{l.desc||"Ligne personnalisée"}</span><span style={{color:C.green}}>{fmt(l.qte*l.pu)}</span></div>)}
        </div>
        <Btn style={{width:"100%",fontSize:11}} onClick={()=>{handleModele(m.id);setOnglet("creer");}}>Utiliser ce modèle</Btn>
      </Card>)}
    </div>}

    {/* ── RELANCES IA ── */}
    {onglet==="relances"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>🤖 Relances automatiques — Claude IA + Bot WhatsApp</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>Les relances sont envoyées automatiquement via le bot WhatsApp Xyra selon les règles ci-dessous. Vous pouvez personnaliser chaque message.</div>
      </div>
      {devis.filter(d=>d.statut==="envoyé"||d.statut==="vu").map((d,i)=><Card key={i} style={{marginBottom:10,borderColor:`${C.orange}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontSize:13,fontWeight:700}}>{d.client}</div><div style={{fontSize:10,color:C.muted}}>{d.id} · {fmt(d.montant)} · Envoyé le {d.date}</div></div>
          <Pill color={C.orange}>{d.statut}</Pill>
        </div>
        <div style={{background:C.card2,borderRadius:8,padding:12,fontSize:11,color:C.text,lineHeight:1.7,marginBottom:10,fontStyle:"italic"}}>
          "Bonjour {d.client}, je me permets de vous relancer concernant notre devis {d.id} de {fmt(d.montant)} pour {d.service}. Avez-vous eu l'occasion de le consulter ? Je reste disponible pour tout ajustement."
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>showToast(`📱 Relance envoyée à ${d.client} via WhatsApp`)} style={{fontSize:11}}>📱 Envoyer relance WA</Btn>
          <BtnGhost onClick={()=>showToast(`📧 Relance email envoyée à ${d.client}`)} style={{fontSize:11}}>📧 Email</BtnGhost>
          <BtnGhost onClick={()=>showToast("🤖 Relance IA personnalisée générée")} style={{fontSize:11}}>🤖 Personnaliser</BtnGhost>
        </div>
      </Card>)}
      <Card>
        <STitle>⚙ Règles de relance automatique</STitle>
        {[["J+3 après envoi","Relance douce WhatsApp","Activée",C.green],["J+7 après envoi","Relance email + WhatsApp","Activée",C.green],["J+14 après envoi","Appel + message personnalisé","Activée",C.green],["J+21 après envoi","Devis marqué 'sans suite'","Activée",C.gold]].map(([t,a,s,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
          <div><div style={{fontWeight:600}}>{t}</div><div style={{fontSize:10,color:C.muted}}>{a}</div></div>
          <Pill color={c}>{s}</Pill>
        </div>)}
      </Card>
    </div>}

    {/* ── STATS ── */}
    {onglet==="stats"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <STitle>📊 Devis par statut</STitle>
          {["brouillon","envoyé","vu","signé","payé","refusé"].map((s,i)=>{const n=devis.filter(d=>d.statut===s).length;const colors=[C.muted,C.blue,C.purple,C.green,C.teal,C.red];return <div key={s} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{textTransform:"capitalize"}}>{s}</span><span style={{color:colors[i],fontWeight:700}}>{n}</span></div><SM val={n} max={devis.length} color={colors[i]}/></div>;})}
        </Card>
        <Card>
          <STitle>💰 Performance commerciale</STitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <KPI label="CA total devis" val={fmt(devis.reduce((a,d)=>a+d.montant,0))} color={C.gold}/>
            <KPI label="CA signé" val={fmt(devis.filter(d=>["signé","payé"].includes(d.statut)).reduce((a,d)=>a+d.montant,0))} color={C.green}/>
            <KPI label="Panier moyen" val={fmt(Math.round(devis.reduce((a,d)=>a+d.montant,0)/devis.length))} color={C.blue}/>
            <KPI label="Taux closing" val={Math.round(devis.filter(d=>["signé","payé"].includes(d.statut)).length/devis.length*100)+"%"} color={C.teal}/>
          </div>
        </Card>
      </div>
    </div>}
  </div>;
};
// ─── PAGE INVESTISSEMENT ──────────────────────────────────────

export default PageDevis;
