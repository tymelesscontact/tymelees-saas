"use client";
import { useState, useEffect, useRef } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM } from "../lib/ui";
import { hasAccess } from "../lib/plans";
const PageServices=({plan,showToast,profil,UpgradeWall,activeCompany})=>{
  const[services,setServices]=useState([]);
  const[packages,setPackages]=useState([]);
  const[devisStats,setDevisStats]=useState([]);
  const[loading,setLoading]=useState(true);
  const[onglet,setOnglet]=useState("catalogue");
  const[ongletPrincipal,setOngletPrincipal]=useState("services");
  const[produits,setProduits]=useState([]);
  const[showAddProduit,setShowAddProduit]=useState(false);
  const[produitForm,setProduitForm]=useState({nom:"",marque:"",code_barre:"",categorie:"",description:"",photo_url:"",prix_vente:"",cout_achat:"",quantite_stock:"",seuil_alerte:"5",vente_active:false});
  const[scanCode,setScanCode]=useState("");
  const[recherchant,setRecherchant]=useState(false);
  const[selProduit,setSelProduit]=useState(null);
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({nom:"",categorie:"",description:"",photo_url:"",prix_standard:"",prix_vip:"",prix_enterprise:"",cout_reel:"",duree:""});
  const[uploadEnCours,setUploadEnCours]=useState(false);
  const photoInputRef=useRef(null);
  const load=async()=>{
    setLoading(true);
    try{
      const cp=activeCompany?.id?`&company_id=${activeCompany.id}`:'';
      const[sRes,pRes,statRes]=await Promise.all([
        fetch('/api/services-catalogue?action=catalogue'+cp).then(r=>r.json()).catch(()=>({})),
        fetch('/api/services-catalogue?action=packages'+cp).then(r=>r.json()).catch(()=>({})),
        fetch('/api/services-catalogue?action=stats'+cp).then(r=>r.json()).catch(()=>({})),
      ]);
      if(sRes.services)setServices(sRes.services);
      if(pRes.packages)setPackages(pRes.packages);
      if(statRes.devis)setDevisStats(statRes.devis);
    }catch(e){console.error("Services:",e);}
    setLoading(false);
  };
  useEffect(()=>{load();},[activeCompany?.id]);
  const loadProduits=async()=>{
    try{
      const cp=activeCompany?.id?`&company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/produits-catalogue?action=liste'+cp);
      const data=await res.json();
      if(data.produits)setProduits(data.produits);
    }catch(e){console.error("Produits:",e);}
  };
  useEffect(()=>{loadProduits();},[activeCompany?.id]);
  const rechercherCodeBarre=async()=>{
    if(!scanCode)return showToast("⚠️ Entrez ou scannez un code-barres");
    setRecherchant(true);
    try{
      const res=await fetch(`/api/produits-catalogue?action=lookup_barcode&code=${scanCode}`);
      const data=await res.json();
      if(data.found){
        setProduitForm(f=>({...f,nom:data.nom||f.nom,marque:data.marque||f.marque,categorie:data.categorie||f.categorie,photo_url:data.photo_url||f.photo_url,code_barre:scanCode}));
        showToast("✅ Produit trouve, verifiez les infos");
      }else{
        setProduitForm(f=>({...f,code_barre:scanCode}));
        showToast("⚠️ Produit non reconnu, remplissez a la main");
      }
    }catch(e){showToast("❌ Erreur de recherche");}
    setRecherchant(false);
  };
  const ajouterProduit=async()=>{
    if(!produitForm.nom)return showToast("⚠️ Nom requis");
    try{
      const res=await fetch('/api/produits-catalogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',...produitForm,company_id:activeCompany?.id})});
      const data=await res.json();
      if(data.success){showToast("✅ Produit ajoute");setProduitForm({nom:"",marque:"",code_barre:"",categorie:"",description:"",photo_url:"",prix_vente:"",cout_achat:"",quantite_stock:"",seuil_alerte:"5",vente_active:false});setScanCode("");setShowAddProduit(false);loadProduits();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const supprimerProduit=async(id)=>{
    try{await fetch('/api/produits-catalogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer',id})});showToast("✅ Supprime");setSelProduit(null);loadProduits();}
    catch(e){showToast("❌ Erreur");}
  };
  const margeProduit=(p)=>p.prix_vente>0?Math.round((p.prix_vente-(p.cout_achat||0))/p.prix_vente*100):0;
  const uploaderPhoto=async(file)=>{
    if(!file)return;
    setUploadEnCours(true);
    try{
      const{createClient}=await import('@supabase/supabase-js');
      const sbc=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const path=`services/${Date.now()}_${file.name}`;
      const{error:upErr}=await sbc.storage.from('attachments').upload(path,file);
      if(upErr){showToast("❌ Echec upload photo");setUploadEnCours(false);return;}
      const{data:urlData}=sbc.storage.from('attachments').getPublicUrl(path);
      setAddForm(f=>({...f,photo_url:urlData.publicUrl}));
      showToast("✅ Photo ajoutee");
    }catch(e){showToast("❌ Erreur de connexion");}
    setUploadEnCours(false);
  };
  const ajouterService=async()=>{
    if(!addForm.nom)return showToast("⚠️ Nom requis");
    try{
      const res=await fetch('/api/services-catalogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_service',...addForm,company_id:activeCompany?.id})});
      const data=await res.json();
      if(data.success){showToast("✅ Service ajoute");setAddForm({nom:"",categorie:"",description:"",photo_url:"",prix_standard:"",prix_vip:"",prix_enterprise:"",cout_reel:"",duree:""});setShowAdd(false);load();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const supprimerService=async(id)=>{
    try{await fetch('/api/services-catalogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer_service',id})});showToast("✅ Supprime");setSel(null);load();}
    catch(e){showToast("❌ Erreur");}
  };
  const marge=(s)=>s.prix_standard>0?Math.round((s.prix_standard-(s.cout_reel||0))/s.prix_standard*100):0;
  const statsParService=(id)=>{
    const ventes=devisStats.filter(d=>d.service_id===id);
    return {nb:ventes.length,ca:ventes.reduce((a,d)=>a+(Number(d.montant)||0),0)};
  };
  if(!hasAccess(plan,"services"))return <div style={{padding:20}}><UpgradeWall page="services" plan={plan}/></div>;
  const totalCA=devisStats.reduce((a,d)=>a+(Number(d.montant)||0),0);
  const margeMoyenne=services.length>0?Math.round(services.reduce((a,s)=>a+marge(s),0)/services.length):0;
  return <div style={{padding:20}}>
    <div style={{display:"flex",gap:8,marginBottom:16,borderBottom:"1px solid #1E1E36",paddingBottom:2}}>
      {[["services","⚙️ Services"],["produits","📦 Produits"]].map(([id,label])=><button key={id} onClick={()=>setOngletPrincipal(id)} style={{background:"transparent",border:"none",borderBottom:ongletPrincipal===id?"2px solid #C9A84C":"2px solid transparent",color:ongletPrincipal===id?"#C9A84C":"#5A5A7A",padding:"8px 4px",fontSize:13,fontWeight:ongletPrincipal===id?700:400,cursor:"pointer",fontFamily:"inherit"}}>{label}</button>)}
    </div>
    {ongletPrincipal==="services"&&<>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⊛ Produits & Services</div>
        <div style={{fontSize:11,color:C.muted}}>Ton catalogue — {services.length} service(s)</div>
      </div>
      <Btn onClick={()=>setShowAdd(s=>!s)}>+ Ajouter un service</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
      <KPI label="Services actifs" val={services.filter(s=>s.actif).length} color={C.blue}/>
      <KPI label="CA genere (devis lies)" val={fmt(totalCA)} color={C.green}/>
      <KPI label="Marge moyenne" val={margeMoyenne+"%"} color={C.gold}/>
    </div>
    {showAdd&&<Card style={{marginBottom:16}}>
      <STitle>+ Nouveau service</STitle>
      <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploaderPhoto(e.target.files?.[0])}/>
      <div onClick={()=>photoInputRef.current?.click()} style={{background:C.card2,borderRadius:10,padding:16,textAlign:"center",border:`2px dashed ${C.border}`,marginBottom:10,cursor:"pointer"}}>
        {addForm.photo_url?<img src={addForm.photo_url} alt="" style={{maxHeight:80,marginBottom:6}}/>:<div style={{fontSize:24}}>📷</div>}
        <div style={{fontSize:10,color:C.muted}}>{uploadEnCours?"Upload...":"Ajouter une photo"}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Inp value={addForm.nom} onChange={e=>setAddForm(f=>({...f,nom:e.target.value}))} placeholder="Nom du service"/>
        <Inp value={addForm.categorie} onChange={e=>setAddForm(f=>({...f,categorie:e.target.value}))} placeholder="Categorie"/>
      </div>
      <Inp value={addForm.description} onChange={e=>setAddForm(f=>({...f,description:e.target.value}))} placeholder="Description" style={{width:"100%",marginBottom:8}}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
        <Inp value={addForm.prix_standard} onChange={e=>setAddForm(f=>({...f,prix_standard:e.target.value}))} placeholder="Prix Standard €"/>
        <Inp value={addForm.prix_vip} onChange={e=>setAddForm(f=>({...f,prix_vip:e.target.value}))} placeholder="Prix VIP €"/>
        <Inp value={addForm.prix_enterprise} onChange={e=>setAddForm(f=>({...f,prix_enterprise:e.target.value}))} placeholder="Prix Enterprise €"/>
        <Inp value={addForm.cout_reel} onChange={e=>setAddForm(f=>({...f,cout_reel:e.target.value}))} placeholder="Cout reel €"/>
      </div>
      <Inp value={addForm.duree} onChange={e=>setAddForm(f=>({...f,duree:e.target.value}))} placeholder="Duree (ex: 2-3h)" style={{width:"100%",marginBottom:10}}/>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={ajouterService}>✅ Ajouter</Btn>
        <BtnGhost onClick={()=>setShowAdd(false)}>Annuler</BtnGhost>
      </div>
    </Card>}
    {loading?<div style={{textAlign:"center",padding:20,color:C.muted}}>Chargement...</div>:services.length===0?<div style={{textAlign:"center",padding:20,color:C.muted,fontSize:12}}>Aucun service dans le catalogue.</div>:
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
      {services.map(s=>{const st=statsParService(s.id);return <Card key={s.id} onClick={()=>setSel(s)} style={{cursor:"pointer",padding:0,overflow:"hidden"}}>
        {s.photo_url?<img src={s.photo_url} alt="" style={{width:"100%",height:120,objectFit:"cover"}}/>:<div style={{width:"100%",height:120,background:C.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>📦</div>}
        <div style={{padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{s.nom}</div>
            {!s.actif&&<Pill color={C.muted}>Inactif</Pill>}
          </div>
          <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{s.categorie}</div>
          <div style={{fontSize:16,fontWeight:700,color:C.gold,marginBottom:4}}>{s.prix_standard>0?fmt(s.prix_standard):"Sur devis"}</div>
          {s.cout_reel>0&&<div style={{fontSize:10,color:marge(s)>=30?C.green:C.orange}}>Marge : {marge(s)}%</div>}
          <div style={{fontSize:10,color:C.muted,marginTop:6}}>{st.nb} vente(s) · {fmt(st.ca)}</div>
        </div>
      </Card>;})}
    </div>}
    {sel&&<div onClick={()=>setSel(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:24,maxWidth:480,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700,color:C.text}}>{sel.nom}</div>
          <BtnGhost onClick={()=>setSel(null)} style={{padding:"4px 10px"}}>✕</BtnGhost>
        </div>
        {sel.photo_url&&<img src={sel.photo_url} alt="" style={{width:"100%",borderRadius:8,marginBottom:12}}/>}
        <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{sel.description}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
          <div><div style={{fontSize:9,color:C.muted}}>Standard</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{fmt(sel.prix_standard)}</div></div>
          <div><div style={{fontSize:9,color:C.muted}}>VIP</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{fmt(sel.prix_vip)}</div></div>
          <div><div style={{fontSize:9,color:C.muted}}>Enterprise</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{fmt(sel.prix_enterprise)}</div></div>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Duree : {sel.duree} · Marge : {marge(sel)}% · Cout reel : {fmt(sel.cout_reel)}</div>
        <BtnGhost onClick={()=>supprimerService(sel.id)} style={{color:C.red}}>🗑 Supprimer</BtnGhost>
      </div>
    </div>}
  </>}
  {ongletPrincipal==="produits"&&<>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>📦 Produits a vendre</div>
        <div style={{fontSize:11,color:C.muted}}>{produits.length} produit(s) au catalogue</div>
      </div>
      <Btn onClick={()=>setShowAddProduit(s=>!s)}>+ Ajouter un produit</Btn>
    </div>
    {showAddProduit&&<Card style={{marginBottom:16}}>
      <STitle>📷 Scanner ou saisir un code-barres</STitle>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <Inp value={scanCode} onChange={e=>setScanCode(e.target.value)} placeholder="Code-barres (EAN/UPC)" style={{flex:1}}/>
        <Btn onClick={rechercherCodeBarre} disabled={recherchant}>{recherchant?"Recherche...":"🔍 Rechercher"}</Btn>
      </div>
      <STitle>+ Nouveau produit</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Inp value={produitForm.nom} onChange={e=>setProduitForm(f=>({...f,nom:e.target.value}))} placeholder="Nom du produit"/>
        <Inp value={produitForm.marque} onChange={e=>setProduitForm(f=>({...f,marque:e.target.value}))} placeholder="Marque"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Inp value={produitForm.categorie} onChange={e=>setProduitForm(f=>({...f,categorie:e.target.value}))} placeholder="Categorie"/>
        <Inp value={produitForm.description} onChange={e=>setProduitForm(f=>({...f,description:e.target.value}))} placeholder="Description"/>
      </div>
      {produitForm.photo_url&&<img src={produitForm.photo_url} alt="" style={{maxHeight:80,marginBottom:8}}/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
        <Inp value={produitForm.prix_vente} onChange={e=>setProduitForm(f=>({...f,prix_vente:e.target.value}))} placeholder="Prix de vente €"/>
        <Inp value={produitForm.cout_achat} onChange={e=>setProduitForm(f=>({...f,cout_achat:e.target.value}))} placeholder="Cout d'achat €"/>
        <Inp value={produitForm.quantite_stock} onChange={e=>setProduitForm(f=>({...f,quantite_stock:e.target.value}))} placeholder="Quantite en stock"/>
        <Inp value={produitForm.seuil_alerte} onChange={e=>setProduitForm(f=>({...f,seuil_alerte:e.target.value}))} placeholder="Seuil d'alerte"/>
      </div>
      <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.muted,marginBottom:10,cursor:"pointer"}}>
        <input type="checkbox" checked={produitForm.vente_active} onChange={e=>setProduitForm(f=>({...f,vente_active:e.target.checked}))}/>
        Rendre ce produit achetable directement (boutique en ligne)
      </label>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={ajouterProduit}>✅ Ajouter</Btn>
        <BtnGhost onClick={()=>setShowAddProduit(false)}>Annuler</BtnGhost>
      </div>
    </Card>}
  </>}
  </div>;
};
export default PageServices;
