"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM, St } from "../lib/ui";
import { hasAccess } from "../lib/plans";
const TYPES_TYMELESS=["conciergerie_abonnement","nettoyage_airbnb","nettoyage_jet","nettoyage_yacht","nettoyage_villa","nettoyage_bureaux","nettoyage_industriel","nettoyage_syndic","securite_privee","courtage_yacht","location_jet","rapatriement_funeraire"];
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
  useEffect(()=>{load();},[activeCompany]);
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
  const exporterImprimer=(c)=>{
    const w=window.open('','_blank');
    if(!w)return;
    w.document.write(`<html><head><title>${c.titre}</title><style>body{font-family:Georgia,serif;padding:40px;line-height:1.7;white-space:pre-wrap}h1{font-size:18px}</style></head><body><h1>${c.titre}</h1><p>${c.contenu_final}</p><hr/><p style="font-size:11px;color:#666">Signe electroniquement par ${c.signature_nom_tape||c.signataire_nom} le ${c.signe_a?new Date(c.signe_a).toLocaleString('fr'):''} — IP: ${c.signature_ip||'—'} — Empreinte: ${c.document_hash||'—'}</p></body></html>`);
    w.document.close();
    w.print();
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
      <STitle>📄 Generer un nouveau contrat</STitle>
      {modeles.length===0&&!loading&&<div style={{fontSize:12,color:C.muted,marginBottom:14}}>Aucun modele disponible.</div>}
      {(()=>{
        const modelesTymeless=modeles.filter(m=>TYPES_TYMELESS.includes(m.type));
        const modelesGeneriques=modeles.filter(m=>!TYPES_TYMELESS.includes(m.type));
        const CarteModele=(m)=><div key={m.id} onClick={()=>{setModeleChoisi(m);setVariables({});}} style={{background:modeleChoisi?.id===m.id?`${C.gold}18`:C.card2,border:`1px solid ${modeleChoisi?.id===m.id?C.gold:C.border}`,borderRadius:10,padding:12,cursor:"pointer"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text}}>{m.nom}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:4}}>{m.pays} · {m.type}</div>
        </div>;
        return <>
          {modelesGeneriques.length>0&&<>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Contrats generiques</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8,marginBottom:18}}>{modelesGeneriques.map(CarteModele)}</div>
          </>}
          {modelesTymeless.length>0&&<>
            <div style={{fontSize:10,fontWeight:700,color:C.gold,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Contrats Tymeless</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8,marginBottom:14}}>{modelesTymeless.map(CarteModele)}</div>
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
