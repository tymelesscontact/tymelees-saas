"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, SM, St } from "../lib/ui";
import { hasAccess } from "../lib/plans";
const PageSignatures=({plan,showToast,UpgradeWall,activeCompany})=>{
  const[modeles,setModeles]=useState([]);
  const[contrats,setContrats]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modeleChoisi,setModeleChoisi]=useState(null);
  const[variables,setVariables]=useState({});
  const[signataireNom,setSignataireNom]=useState("");
  const[signataireEmail,setSignataireEmail]=useState("");
  const[signataireRole,setSignataireRole]=useState("");
  const[generation,setGeneration]=useState(false);
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
  const genererContrat=async()=>{
    if(!modeleChoisi||!signataireNom||!signataireEmail)return showToast("⚠️ Nom et email du signataire requis");
    setGeneration(true);
    try{
      const res=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer',modele_id:modeleChoisi.id,titre:modeleChoisi.nom,variables,signataire_nom:signataireNom,signataire_email:signataireEmail,signataire_role:signataireRole,company_id:activeCompany?.id})});
      const data=await res.json();
      if(data.success){
        showToast("✅ Contrat genere");
        const envoiRes=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer',id:data.contrat.id})});
        const envoiData=await envoiRes.json();
        if(envoiData.success)showToast("📧 Envoye pour signature !");
        setModeleChoisi(null);setVariables({});setSignataireNom("");setSignataireEmail("");setSignataireRole("");
        load();
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setGeneration(false);
  };
  if(!hasAccess(plan,"signatures"))return <div style={{padding:20}}><UpgradeWall page="Contrats & Signatures" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>✦ Contrats & Signatures</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Signature electronique niveau avance (AES) - valeur juridique en France, UE et Afrique</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
      <KPI label="Modeles disponibles" val={modeles.length} color={C.blue}/>
      <KPI label="Contrats envoyes" val={contrats.filter(c=>c.statut==="envoye").length} color={C.gold}/>
      <KPI label="Contrats signes" val={contrats.filter(c=>c.statut==="signe").length} color={C.green}/>
    </div>
    <Card style={{marginBottom:16}}>
      <STitle>📄 Generer un nouveau contrat</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8,marginBottom:14}}>
        {modeles.map(m=><div key={m.id} onClick={()=>{setModeleChoisi(m);setVariables({});}} style={{background:modeleChoisi?.id===m.id?`${C.gold}18`:C.card2,border:`1px solid ${modeleChoisi?.id===m.id?C.gold:C.border}`,borderRadius:10,padding:12,cursor:"pointer"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text}}>{m.nom}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:4}}>{m.pays} · {m.type}</div>
        </div>)}
        {modeles.length===0&&!loading&&<div style={{fontSize:12,color:C.muted}}>Aucun modele disponible.</div>}
      </div>
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
        <Btn onClick={genererContrat} disabled={generation}>{generation?"Envoi...":"📧 Generer et envoyer pour signature"}</Btn>
      </div>}
    </Card>
    <Card>
      <STitle>📋 Contrats</STitle>
      {loading?<div style={{textAlign:"center",padding:20,color:C.muted}}>Chargement...</div>:contrats.length===0?<div style={{textAlign:"center",padding:20,color:C.muted,fontSize:12}}>Aucun contrat pour le moment.</div>:
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Titre</TH><TH>Signataire</TH><TH>Statut</TH><TH>Date</TH></tr></thead>
        <tbody>{contrats.map((c,i)=><tr key={i}>
          <Td style={{fontWeight:600}}>{c.titre}</Td>
          <Td style={{fontSize:11,color:C.muted}}>{c.signataire_nom} ({c.signataire_email})</Td>
          <Td><Pill color={c.statut==="signe"?C.green:c.statut==="envoye"?C.gold:C.muted}>{c.statut}</Pill></Td>
          <Td style={{fontSize:11,color:C.muted}}>{c.signe_a?new Date(c.signe_a).toLocaleDateString("fr"):c.created_at?new Date(c.created_at).toLocaleDateString("fr"):"—"}</Td>
        </tr>)}</tbody>
      </table>}
    </Card>
  </div>;
};
export default PageSignatures;
