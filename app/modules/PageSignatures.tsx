"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM, St } from "../lib/ui";
import { hasAccess } from "../lib/plans";
const PageSignatures=({plan,showToast,UpgradeWall,activeCompany}) => {
  const[ongletPrincipal,setOngletPrincipal]=useState("contrats");
  const[modeles,setModeles]=useState([]);
  const[contrats,setContrats]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modeleChoisi,setModeleChoisi]=useState(null);
  const[variables,setVariables]=useState({});
  const[signataireNom,setSignataireNom]=useState("");
  const[signataireEmail,setSignataireEmail]=useState("");
  const[signataireRole,setSignataireRole]=useState("");
  const[messagePerso,setMessagePerso]=useState("");
  const[emailCopie,setEmailCopie]=useState("");
  const[generation,setGeneration]=useState(false);
  const[apercu,setApercu]=useState(false);
  const[filtreStatut,setFiltreStatut]=useState("Tous");
  const[recherche,setRecherche]=useState("");
  const[contratOuvert,setContratOuvert]=useState(null);
  const[showCreerModele,setShowCreerModele]=useState(false);
  const[nouveauModele,setNouveauModele]=useState({nom:"",type:"generique",contenu:"",champs_requis:""});
  const[creationModele,setCreationModele]=useState(false);
  const load=async()=>{
    setLoading(true);
    try{
      const companyParam=activeCompany?.id?`&company_id=${activeCompany.id}`:'';
      const[mRes,cRes]=await Promise.all([
        fetch('/api/contrats?action=modeles'+companyParam).then(r=>r.json()).catch(()=>({})),
        fetch('/api/contrats?action=contrats'+companyParam).then(r=>r.json()).catch(()=>({})),
      ]);
      if(mRes.modeles)setModeles(mRes.modeles);
      if(cRes.contrats)setContrats(cRes.contrats);
    }catch(e){console.error("Signatures:",e);}
    setLoading(false);
  };
  useEffect(()=>{load();},[activeCompany?.id]);
  const resetFormulaire=()=>{
    setModeleChoisi(null);setVariables({});setSignataireNom("");setSignataireEmail("");setSignataireRole("");setMessagePerso("");setEmailCopie("");setApercu(false);
  };
  const dupliquer=(c)=>{
    const m=modeles.find(mo=>mo.id===c.modele_id);
    if(!m)return showToast("⚠️ Modele d'origine introuvable");
    setModeleChoisi(m);
    setVariables(c.variables||{});
    setSignataireNom("");setSignataireEmail("");setSignataireRole(c.signataire_role||"");
    setOngletPrincipal("contrats");
    showToast("✅ Contrat duplique — modifiez le signataire puis envoyez");
  };
  const genererContrat=async(envoiImmediat)=>{
    if(!modeleChoisi||!signataireNom||!signataireEmail)return showToast("⚠️ Nom et email du signataire requis");
    setGeneration(true);
    try{
      const res=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer',modele_id:modeleChoisi.id,titre:modeleChoisi.nom,variables,signataire_nom:signataireNom,signataire_email:signataireEmail,signataire_role:signataireRole,company_id:activeCompany?.id})});
      const data=await res.json();
      if(data.success){
        if(envoiImmediat){
          const envoiRes=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer',id:data.contrat.id,message_perso:messagePerso,email_copie:emailCopie})});
          const envoiData=await envoiRes.json();
          if(envoiData.success)showToast("📧 Envoye pour signature !");
        }else{
          showToast("✅ Contrat enregistre en brouillon");
        }
        resetFormulaire();
        load();
        setOngletPrincipal("signatures");
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setGeneration(false);
  };
  const relancer=async(id)=>{
    try{
      const res=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer',id})});
      const data=await res.json();
      if(data.success){showToast("📧 Relance envoyee !");load();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const annuler=async(id)=>{
    try{
      const res=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'annuler',id})});
      const data=await res.json();
      if(data.success){showToast("✅ Contrat annule");setContratOuvert(null);load();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const creerModele=async()=>{
    if(!nouveauModele.nom.trim())return showToast("⚠️ Nom du modele requis");
    if(!nouveauModele.contenu.trim())return showToast("⚠️ Contenu du modele requis");
    setCreationModele(true);
    try{
      const champs_requis=nouveauModele.champs_requis.split(",").map(c=>c.trim()).filter(Boolean);
      const res=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_modele',nom:nouveauModele.nom,type:nouveauModele.type,contenu:nouveauModele.contenu,champs_requis})});
      const data=await res.json();
      if(data.success){
        showToast("✅ Modele cree");
        setNouveauModele({nom:"",type:"generique",contenu:"",champs_requis:""});
        setShowCreerModele(false);
        load();
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setCreationModele(false);
  };
  const supprimerModele=async(m)=>{
    try{
      const res=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer_modele',id:m.id})});
      const data=await res.json();
      if(data.success){showToast(data.desactive?"✅ Modele desactive (deja utilise par un contrat)":"✅ Modele supprime");load();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  // Ouvre le vrai PDF genere et stocke a la signature (contenu + certificat
  // de signature electronique), plutot que de reconstruire un apercu a part.
  const exporterImprimer=(c)=>{
    window.open('/api/contrats?action=pdf&id='+c.id, '_blank');
  };
  const contratsFiltres=contrats.filter(c=>{
    const matchStatut=filtreStatut==="Tous"||c.statut===filtreStatut;
    const matchRecherche=recherche===""||(c.titre||'').toLowerCase().includes(recherche.toLowerCase())||(c.signataire_nom||'').toLowerCase().includes(recherche.toLowerCase());
    return matchStatut&&matchRecherche;
  });
  if(!hasAccess(plan,"signatures"))return <div style={{padding:20}}><UpgradeWall page="Contrats & Signatures" plan={plan}/></div>;
  const enAttente=contrats.filter(c=>c.statut==="envoye").length;
  const signes=contrats.filter(c=>c.statut==="signe").length;
  const tauxSignature=contrats.length>0?Math.round(signes/contrats.length*100):0;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>✦ Contrats & Signatures</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Signature electronique niveau avance (AES) - valeur juridique en France, UE et Afrique</div>
    <div style={{display:"flex",gap:8,marginBottom:18,borderBottom:`1px solid ${C.border}`,paddingBottom:2}}>
      {[["contrats","📄 Contrats"],["signatures","✍️ Signatures"]].map(([id,label])=><button key={id} onClick={()=>setOngletPrincipal(id)} style={{background:"transparent",border:"none",borderBottom:ongletPrincipal===id?`2px solid ${C.gold}`:"2px solid transparent",color:ongletPrincipal===id?C.gold:C.muted,padding:"8px 4px",fontSize:13,fontWeight:ongletPrincipal===id?700:400,cursor:"pointer",fontFamily:"inherit"}}>{label}</button>)}
    </div>
    {ongletPrincipal==="contrats"&&<Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <STitle>📄 Generer un nouveau contrat</STitle>
        <BtnGhost onClick={()=>setShowCreerModele(s=>!s)} style={{fontSize:11}}>{showCreerModele?"Annuler":"➕ Creer un modele"}</BtnGhost>
      </div>
      {showCreerModele&&<div style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`,marginBottom:18}}>
        <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:10}}>Nouveau modele de contrat</div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8,marginBottom:8}}>
          <Inp value={nouveauModele.nom} onChange={e=>setNouveauModele(m=>({...m,nom:e.target.value}))} placeholder="Nom du modele (ex: Contrat de prestation)"/>
          <Inp value={nouveauModele.type} onChange={e=>setNouveauModele(m=>({...m,type:e.target.value}))} placeholder="Type (ex: prestation, nda...)"/>
        </div>
        <textarea value={nouveauModele.contenu} onChange={e=>setNouveauModele(m=>({...m,contenu:e.target.value}))} placeholder={"Texte du contrat. Utilisez {{variable}} pour les champs a remplir a la generation, ex: {{nom_client}}, {{montant}}."} rows={10} style={{width:"100%",background:"#0C0C1A",border:`1px solid ${C.border}`,borderRadius:8,padding:10,color:C.text,fontSize:12,fontFamily:"inherit",marginBottom:8,boxSizing:"border-box",resize:"vertical"}}/>
        <Inp value={nouveauModele.champs_requis} onChange={e=>setNouveauModele(m=>({...m,champs_requis:e.target.value}))} placeholder="Champs a remplir, separes par des virgules (ex: nom_client, montant, date)" style={{width:"100%",marginBottom:10,boxSizing:"border-box"}}/>
        <Btn onClick={creerModele} disabled={creationModele} style={{fontSize:12}}>{creationModele?"Creation...":"✅ Creer le modele"}</Btn>
      </div>}
      {modeles.length===0&&!loading&&<div style={{fontSize:12,color:C.muted,marginBottom:14}}>Aucun modele disponible.</div>}
      {(()=>{
        const modelesXyra=modeles.filter(m=>!m.tenant_id);
        const mesModeles=modeles.filter(m=>m.tenant_id);
        const CarteModele=(m,dupliquable)=><div key={m.id} style={{position:"relative",background:modeleChoisi?.id===m.id?`${C.gold}18`:C.card2,border:`1px solid ${modeleChoisi?.id===m.id?C.gold:C.border}`,borderRadius:10,padding:12,cursor:"pointer"}}>
          <div onClick={()=>{setModeleChoisi(m);setVariables({});}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text,paddingRight:16}}>{m.nom}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>{m.pays} · {m.type}</div>
          </div>
          {dupliquable?
            <button onClick={async e=>{e.stopPropagation();const res=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'dupliquer_modele',id:m.id})});const data=await res.json();if(data.success){showToast("✅ Modele duplique dans \"Mes modeles\" — modifiable librement");load();}else showToast("❌ "+(data.error||"Erreur"));}} title="Dupliquer pour le modifier" style={{position:"absolute",top:8,right:8,background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:12}}>⧉</button>
            :<button onClick={e=>{e.stopPropagation();if(confirm(`Supprimer le modele "${m.nom}" ?`))supprimerModele(m);}} title="Supprimer" style={{position:"absolute",top:8,right:8,background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>✕</button>}
        </div>;
        return <>
          {modelesXyra.length>0&&<>
            <div style={{fontSize:10,fontWeight:700,color:C.gold,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>🌐 Bibliotheque Xyra</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:8}}>Modeles standards fournis par la plateforme — a dupliquer pour les adapter et les modifier librement. A faire valider par un professionnel avant premiere utilisation reelle.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8,marginBottom:18}}>{modelesXyra.map(m=>CarteModele(m,true))}</div>
          </>}
          {mesModeles.length>0&&<>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>📁 Mes modeles</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8,marginBottom:14}}>{mesModeles.map(m=>CarteModele(m,false))}</div>
          </>}
        </>;
      })()}
      {modeleChoisi&&<div style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:10}}>Remplir : {modeleChoisi.nom}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginBottom:12}}>
          {(modeleChoisi.champs_requis||[]).map(champ=><Inp key={champ} value={variables[champ]||""} onChange={e=>setVariables(v=>({...v,[champ]:e.target.value}))} placeholder={champ.replace(/_/g," ")}/>)}
        </div>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:8}}>Signataire</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          <Inp value={signataireNom} onChange={e=>setSignataireNom(e.target.value)} placeholder="Nom du signataire"/>
          <Inp value={signataireEmail} onChange={e=>setSignataireEmail(e.target.value)} placeholder="Email du signataire"/>
          <Inp value={signataireRole} onChange={e=>setSignataireRole(e.target.value)} placeholder="Role (stagiaire, client...)"/>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:8}}>Options d'envoi</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          <Inp value={messagePerso} onChange={e=>setMessagePerso(e.target.value)} placeholder="Message personnalise (optionnel)"/>
          <Inp value={emailCopie} onChange={e=>setEmailCopie(e.target.value)} placeholder="Copie a (email, optionnel)"/>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <BtnGhost onClick={()=>setApercu(a=>!a)}>{apercu?"Masquer l'apercu":"👁 Apercu"}</BtnGhost>
          <BtnGhost onClick={()=>genererContrat(false)} disabled={generation}>💾 Enregistrer en brouillon</BtnGhost>
          <Btn onClick={()=>genererContrat(true)} disabled={generation}>{generation?"Envoi...":"📧 Generer et envoyer pour signature"}</Btn>
        </div>
        {apercu&&<div style={{marginTop:14,background:"#0C0C1A",border:`1px solid ${C.border}`,borderRadius:8,padding:14,fontSize:12,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:300,overflowY:"auto"}}>
          {(()=>{let apercuTexte=modeleChoisi.contenu;for(const[cle,val]of Object.entries(variables)){apercuTexte=apercuTexte.split(`{{${cle}}}`).join(val||`___`);}return apercuTexte;})()}
        </div>}
      </div>}
    </Card>}
    {ongletPrincipal==="signatures"&&<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        <KPI label="En attente de signature" val={enAttente} color={C.gold}/>
        <KPI label="Contrats signes" val={signes} color={C.green}/>
        <KPI label="Taux de signature" val={tauxSignature+"%"} color={C.blue}/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <Inp value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="🔍 Rechercher par titre ou signataire..." style={{flex:1}}/>
        <Sel value={filtreStatut} onChange={e=>setFiltreStatut(e.target.value)} style={{width:160}}>
          <option>Tous</option><option value="brouillon">Brouillon</option><option value="envoye">Envoye</option><option value="signe">Signe</option><option value="annule">Annule</option>
        </Sel>
      </div>
      <Card>
        {loading?<div style={{textAlign:"center",padding:20,color:C.muted}}>Chargement...</div>:contratsFiltres.length===0?<div style={{textAlign:"center",padding:20,color:C.muted,fontSize:12}}>Aucun contrat.</div>:
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Titre</TH><TH>Signataire</TH><TH>Statut</TH><TH>Date</TH><TH>Actions</TH></tr></thead>
          <tbody>{contratsFiltres.map((c,i)=><tr key={i} onClick={()=>setContratOuvert(c)} style={{cursor:"pointer"}}>
            <Td style={{fontWeight:600}}>{c.titre}</Td>
            <Td style={{fontSize:11,color:C.muted}}>{c.signataire_nom} ({c.signataire_email})</Td>
            <Td><Pill color={c.statut==="signe"?C.green:c.statut==="envoye"?C.gold:c.statut==="annule"?C.red:C.muted}>{c.statut}</Pill></Td>
            <Td style={{fontSize:11,color:C.muted}}>{c.signe_a?new Date(c.signe_a).toLocaleDateString("fr"):c.created_at?new Date(c.created_at).toLocaleDateString("fr"):"—"}</Td>
            <Td><div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
              {c.statut==="envoye"&&<BtnGhost onClick={()=>relancer(c.id)} style={{fontSize:10,padding:"4px 8px"}}>🔄 Relancer</BtnGhost>}
              {c.statut==="brouillon"&&<BtnGhost onClick={()=>relancer(c.id)} style={{fontSize:10,padding:"4px 8px"}}>📧 Envoyer</BtnGhost>}
              {c.statut==="signe"&&<BtnGhost onClick={()=>exporterImprimer(c)} style={{fontSize:10,padding:"4px 8px"}}>🖨 Exporter</BtnGhost>}
              <BtnGhost onClick={()=>dupliquer(c)} style={{fontSize:10,padding:"4px 8px"}}>⧉ Dupliquer</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>}
      </Card>
    </>}
    {contratOuvert&&<div onClick={()=>setContratOuvert(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:24,maxWidth:560,width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:C.text}}>{contratOuvert.titre}</div>
            <div style={{fontSize:11,color:C.muted}}>{contratOuvert.signataire_nom} · {contratOuvert.signataire_email}</div>
          </div>
          <BtnGhost onClick={()=>setContratOuvert(null)} style={{padding:"4px 10px"}}>✕</BtnGhost>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:10}}>CHRONOLOGIE</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
          {[
            {label:"Genere",date:contratOuvert.created_at,fait:true},
            {label:"Envoye",date:contratOuvert.statut!=="brouillon"?contratOuvert.created_at:null,fait:contratOuvert.statut!=="brouillon"},
            {label:"Verifie par le client",date:contratOuvert.code_verifie_a,fait:!!contratOuvert.code_verifie_a},
            {label:"Signe",date:contratOuvert.signe_a,fait:!!contratOuvert.signe_a},
          ].map((etape,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:etape.fait?C.green:C.border,flexShrink:0}}/>
            <div style={{fontSize:12,color:etape.fait?C.text:C.muted,fontWeight:etape.fait?600:400}}>{etape.label}</div>
            {etape.date&&<div style={{fontSize:10,color:C.muted,marginLeft:"auto"}}>{new Date(etape.date).toLocaleString("fr")}</div>}
          </div>)}
        </div>
        {contratOuvert.statut==="signe"&&<div style={{background:`${C.green}0D`,border:`1px solid ${C.green}33`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:8}}>✅ PREUVE DE SIGNATURE</div>
          <div style={{fontSize:11,color:C.text,lineHeight:1.8}}>
            <div>Nom tape : <strong>{contratOuvert.signature_nom_tape}</strong></div>
            <div>Adresse IP : <strong>{contratOuvert.signature_ip}</strong></div>
            <div>Empreinte du document : <span style={{fontSize:9,wordBreak:"break-all"}}>{contratOuvert.document_hash}</span></div>
          </div>
        </div>}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {contratOuvert.statut==="envoye"&&<Btn onClick={()=>relancer(contratOuvert.id)} style={{fontSize:12}}>🔄 Relancer</Btn>}
          {contratOuvert.statut==="brouillon"&&<Btn onClick={()=>relancer(contratOuvert.id)} style={{fontSize:12}}>📧 Envoyer</Btn>}
          {contratOuvert.statut==="signe"&&<Btn onClick={()=>exporterImprimer(contratOuvert)} style={{fontSize:12}}>🖨 Exporter / Imprimer</Btn>}
          {contratOuvert.statut!=="signe"&&contratOuvert.statut!=="annule"&&<BtnGhost onClick={()=>annuler(contratOuvert.id)} style={{fontSize:12,color:C.red}}>🗑 Annuler</BtnGhost>}
        </div>
      </div>
    </div>}
  </div>;
};
export default PageSignatures;
