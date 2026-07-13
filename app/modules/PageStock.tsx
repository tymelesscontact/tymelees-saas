"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageStock=({plan,showToast,profil,UpgradeWall})=>{
  const[_stockReal,setStockReal]=useState([]);
  const[_mouvementsReal,setMouvementsReal]=useState([]);
  const[_fournisseursReal,setFournisseursReal]=useState([]);
  const[_stockKpis,setStockKpis]=useState({valeurTotale:0,articlesCritiques:[],scoreStock:100});
  const[_stockIa,setStockIa]=useState("");
  const[_stockIaLoading,setStockIaLoading]=useState(false);

  const _loadStock=async()=>{
    try{
      const res=await fetch('/api/stock');
      const data=await res.json();
      if(data.articles&&data.articles.length>0){
        setStockReal(data.articles);
        setMouvementsReal(data.mouvements||[]);
        setFournisseursReal(data.fournisseurs||[]);
        setStockKpis({valeurTotale:data.valeurTotale||0,articlesCritiques:data.articlesCritiques||[],scoreStock:data.scoreStock||100});
        // Enrichir le stock existant avec les données réelles
        setStock(prev=>{
          const merged=data.articles.map((r)=>{
            const existing=prev.find(p=>p.art===r.art||p.id===r.id);
            return existing?{...existing,...r}:r;
          });
          return merged.length>0?merged:prev;
        });
      }
    }catch(e){console.log("Mode local stock");}
  };
  const _analyserStockIA=async()=>{
    if(_stockIaLoading)return;
    setStockIaLoading(true);
    try{
      const res=await fetch('/api/stock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'analyse_ia',articles:_stockReal.length>0?_stockReal:stock})});
      const data=await res.json();
      if(data.success)setStockIa(data.analyse);
    }catch(e){}
    setStockIaLoading(false);
  };
  const _mouvement=async(articleId,type,quantite,note)=>{
    try{
      const res=await fetch('/api/stock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'mouvement',article_id:articleId,type,quantite,note,operateur:'Curtiss'})});
      const data=await res.json();
      if(data.success){showToast(`✅ Mouvement enregistré — Stock : ${data.nouvelleQte}`);_loadStock();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  useEffect(()=>{_loadStock();},[]);
  const[stock,setStock]=useState([
    {id:"ART-001",art:"Produit vitres Pro",cat:"Nettoyage",qte:3,min:5,max:20,u:"L",four:"CleanPro",prixU:12.5,localisation:"Entrepôt A",historique:[{date:"10/04",type:"sortie",qte:2,note:"Mission Airbnb Montmartre"},{date:"01/04",type:"entrée",qte:10,note:"Commande CleanPro #247"}]},
    {id:"ART-002",art:"Microfibre premium",cat:"Nettoyage",qte:24,min:20,max:100,u:"pcs",four:"TextilePro",prixU:3.5,localisation:"Entrepôt A",historique:[{date:"12/04",type:"sortie",qte:6,note:"Mission bureaux La Défense"}]},
    {id:"ART-003",art:"Désinfectant surfaces",cat:"Nettoyage",qte:8,min:6,max:30,u:"L",four:"CleanPro",prixU:8.0,localisation:"Entrepôt A",historique:[]},
    {id:"ART-004",art:"Housses rapatriement",cat:"Rapatriement",qte:2,min:4,max:10,u:"pcs",four:"MedSupply",prixU:45.0,localisation:"Entrepôt B",historique:[{date:"12/04",type:"sortie",qte:1,note:"Mission Lefevre"}]},
    {id:"ART-005",art:"Kit bord jet privé",cat:"Jet/Yacht",qte:5,min:3,max:15,u:"kits",four:"LuxEquip",prixU:85.0,localisation:"Entrepôt C",historique:[]},
    {id:"ART-006",art:"Produit nacre bois",cat:"Yacht",qte:1,min:3,max:10,u:"L",four:"YachtCare",prixU:65.0,localisation:"Entrepôt C",historique:[]},
    {id:"ART-007",art:"Gants latex pro",cat:"Protection",qte:150,min:50,max:500,u:"pcs",four:"CleanPro",prixU:0.35,localisation:"Entrepôt A",historique:[]},
    {id:"ART-008",art:"Sacs poubelle XXL",cat:"Consommables",qte:80,min:40,max:200,u:"pcs",four:"CleanPro",prixU:0.8,localisation:"Entrepôt A",historique:[]},
  ]);
  const[onglet,setOnglet]=useState("inventaire");
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[addForm,setAddForm]=useState({art:"",cat:"Nettoyage",qte:"",min:"",max:"",u:"pcs",four:"",prixU:"",localisation:"Entrepôt A"});
  const[qrScan,setQrScan]=useState(false);

  const tabs=[{id:"inventaire",label:"📦 Inventaire"},{id:"mouvements",label:"🔄 Mouvements"},{id:"commandes",label:"🛒 Commandes"},{id:"ia",label:"🤖 IA Prédictive"},{id:"valorisation",label:"💰 Valorisation"}];

  const critiques=stock.filter(s=>s.qte<s.min);
  const valeurTotale=stock.reduce((a,s)=>a+s.qte*s.prixU,0);

  if(!hasAccess(plan,"stock"))return <div style={{padding:20}}><UpgradeWall page="stock" plan={plan}/></div>;

  const ajouterMouvement=(idx,type,qte,note)=>{
    setStock(sk=>sk.map((s,i)=>i===idx?{...s,qte:type==="entrée"?s.qte+qte:Math.max(0,s.qte-qte),historique:[{date:new Date().toLocaleDateString("fr"),type,qte,note},...s.historique]}:s));
    showToast(`✅ ${type==="entrée"?"+":"-"}${qte} ${stock[idx]?.u} — ${stock[idx]?.art}`);
  };

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div><div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⊟ {profil?.termes?.stock||"Stock"}</div>
        <div style={{fontSize:11,color:C.muted}}>Inventaire · Mouvements · Commandes auto · IA prédictive · QR Code</div></div>
      <div style={{display:"flex",gap:8}}>
        <BtnGhost onClick={()=>setQrScan(s=>!s)}>📱 QR Scan</BtnGhost>
        <Btn onClick={()=>setShowAdd(s=>!s)}>+ Ajouter article</Btn>
      </div>
    </div>

    {qrScan&&<div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:14,marginBottom:12,textAlign:"center"}}>
      <div style={{fontSize:24,marginBottom:6}}>📱</div>
      <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>QR Code Scan — Terrain</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Utilisez l'app Xyra sur votre téléphone pour scanner les QR codes des articles en entrepôt. Les mouvements se synchronisent en temps réel.</div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <Btn onClick={()=>{showToast("✅ QR Code généré — envoyez à votre équipe");setQrScan(false);}} style={{fontSize:11}}>Générer QR Codes</Btn>
        <BtnGhost onClick={()=>setQrScan(false)} style={{fontSize:11}}>Fermer</BtnGhost>
      </div>
    </div>}

    {critiques.length>0&&<div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:10,padding:12,marginBottom:14}}>
      <div style={{fontSize:11,color:C.red,fontWeight:600,marginBottom:4}}>⚠️ {critiques.length} article(s) en stock critique — commande recommandée</div>
      <div style={{fontSize:11,color:C.text,marginBottom:8}}>{critiques.map(c=>c.art).join(" · ")}</div>
      <Btn onClick={()=>showToast("🛒 Commandes automatiques envoyées aux fournisseurs !")} style={{fontSize:11,background:C.red}}>🛒 Commander automatiquement tout</Btn>
    </div>}

    {showAdd&&<Card style={{marginBottom:14,borderColor:`${C.gold}44`}}>
      <STitle>Nouvel article</STitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Nom de l'article","art"],["Fournisseur","four"],["Localisation","localisation"],["Prix unitaire (€)","prixU"],["Quantité initiale","qte"],["Stock minimum","min"],["Stock maximum","max"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={addForm[k]} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Catégorie</label><Sel value={addForm.cat} onChange={e=>setAddForm(f=>({...f,cat:e.target.value}))} style={{width:"100%"}}>{(profil?.stockCategories||["Nettoyage","Rapatriement","Jet/Yacht","Protection","Consommables","Autre"]).map(c=><option key={c}>{c}</option>)}</Sel></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Unité</label><Inp value={addForm.u} onChange={e=>setAddForm(f=>({...f,u:e.target.value}))} placeholder="pcs / L / kg..."/></div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>{const na={id:`ART-00${stock.length+1}`,art:addForm.art,cat:addForm.cat,qte:Number(addForm.qte)||0,min:Number(addForm.min)||5,max:Number(addForm.max)||50,u:addForm.u,four:addForm.four,prixU:Number(addForm.prixU)||0,localisation:addForm.localisation,historique:[{date:new Date().toLocaleDateString("fr"),type:"entrée",qte:Number(addForm.qte)||0,note:"Stock initial"}]};setStock(sk=>[...sk,na]);setShowAdd(false);setAddForm({art:"",cat:"Nettoyage",qte:"",min:"",max:"",u:"pcs",four:"",prixU:"",localisation:"Entrepôt A"});showToast(`✅ ${na.art} ajouté au stock !)`);}}>✅ Ajouter</Btn>
        <BtnGhost onClick={()=>setShowAdd(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
      <KPI label="Articles en stock" val={stock.length} color={C.blue}/>
      <KPI label="Articles critiques" val={critiques.length} color={C.red}/>
      <KPI label="Valeur totale" val={fmt(valeurTotale)} color={C.gold}/>
      <KPI label="Fournisseurs" val={[...new Set(stock.map(s=>s.four))].length} color={C.teal}/>
    </div>

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── INVENTAIRE ── */}
    {onglet==="inventaire"&&<Card>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Réf.</TH><TH>Article</TH><TH>Catégorie</TH><TH>Qté</TH><TH>Min / Max</TH><TH>Unité</TH><TH>Localisation</TH><TH>Fournisseur</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
        <tbody>{stock.map((s,i)=><tr key={i} style={{background:s.qte<s.min?`${C.red}08`:"transparent",cursor:"pointer"}} onClick={()=>setSel(sel?.id===s.id?null:s)}>
          <Td style={{color:C.muted,fontSize:9,fontFamily:"monospace"}}>{s.id}</Td>
          <Td style={{fontWeight:700}}>{s.art}</Td>
          <Td><Pill color={C.blue}>{s.cat}</Pill></Td>
          <Td style={{fontWeight:700,fontSize:16,color:s.qte<s.min?C.red:s.qte<=s.min*1.5?C.orange:C.green}}>{s.qte}</Td>
          <Td style={{color:C.muted,fontSize:10}}>{s.min} / {s.max}</Td>
          <Td style={{color:C.muted}}>{s.u}</Td>
          <Td style={{color:C.muted,fontSize:10}}>{s.localisation}</Td>
          <Td style={{color:C.muted,fontSize:11}}>{s.four}</Td>
          <Td>{s.qte<s.min?<Pill color={C.red}>⚠ Critique</Pill>:s.qte<=s.min*1.5?<Pill color={C.orange}>⚡ Bas</Pill>:<Pill color={C.green}>✓ OK</Pill>}</Td>
          <Td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:3}}>
            <Btn onClick={()=>ajouterMouvement(i,"entrée",10,"Réapprovisionnement")} style={{fontSize:9,padding:"3px 6px",background:C.green}}>+10</Btn>
            <BtnGhost onClick={()=>ajouterMouvement(i,"sortie",1,"Utilisation mission")} style={{fontSize:9,padding:"3px 6px"}}>-1</BtnGhost>
            {s.qte<s.min&&<Btn onClick={()=>showToast(`🛒 Commande ${s.art} envoyée à ${s.four}`)} style={{fontSize:9,padding:"3px 6px",background:C.orange}}>Commander</Btn>}
          </div></Td>
        </tr>)}
        </tbody>
      </table>
      {sel&&<div style={{marginTop:14,background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>{sel.art} — Détail</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Stock actuel</div><div style={{fontSize:18,fontWeight:700,color:sel.qte<sel.min?C.red:C.green}}>{sel.qte} {sel.u}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Prix unitaire</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(sel.prixU)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Valeur stock</div><div style={{fontSize:18,fontWeight:700,color:C.teal}}>{fmt(sel.qte*sel.prixU)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>À commander</div><div style={{fontSize:18,fontWeight:700,color:C.orange}}>{Math.max(0,sel.max-sel.qte)} {sel.u}</div></CT>
        </div>
      </div>}
    </Card>}

    {/* ── MOUVEMENTS ── */}
    {onglet==="mouvements"&&<Card>
      <STitle>🔄 Historique des mouvements</STitle>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Article</TH><TH>Date</TH><TH>Type</TH><TH>Quantité</TH><TH>Note</TH></tr></thead>
        <tbody>{stock.flatMap(s=>s.historique.map(h=>({...h,art:s.art,u:s.u}))).sort((a,b)=>b.date.localeCompare(a.date)).map((h,i)=><tr key={i}>
          <Td style={{fontWeight:600}}>{h.art}</Td>
          <Td style={{color:C.muted,fontSize:10}}>{h.date}</Td>
          <Td><Pill color={h.type==="entrée"?C.green:C.red}>{h.type==="entrée"?"↓ Entrée":"↑ Sortie"}</Pill></Td>
          <Td style={{color:h.type==="entrée"?C.green:C.red,fontWeight:700}}>{h.type==="entrée"?"+":"-"}{h.qte} {h.u}</Td>
          <Td style={{color:C.muted,fontSize:11}}>{h.note}</Td>
        </tr>)}
        </tbody>
      </table>
    </Card>}

    {/* ── COMMANDES ── */}
    {onglet==="commandes"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle>🛒 Commandes fournisseurs</STitle>
        <Btn onClick={()=>showToast("🛒 Toutes commandes critiques passées !")}>🛒 Commander tout le critique</Btn>
      </div>
      {stock.filter(s=>s.qte<s.min).map((s,i)=><Card key={i} style={{marginBottom:10,borderColor:`${C.red}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontSize:13,fontWeight:700}}>{s.art}</div><div style={{fontSize:10,color:C.muted}}>Fournisseur : {s.four} · Stock : {s.qte}/{s.min} {s.u}</div></div>
          <Pill color={C.red}>⚠ Critique</Pill>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Qté à commander</div><div style={{fontSize:16,fontWeight:700,color:C.orange}}>{s.max-s.qte} {s.u}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Prix unitaire</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(s.prixU)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>Coût total</div><div style={{fontSize:16,fontWeight:700,color:C.red}}>{fmt((s.max-s.qte)*s.prixU)}</div></CT>
        </div>
        <Btn onClick={()=>{showToast(`✅ Commande ${s.art} envoyée à ${s.four} !`);}} style={{width:"100%",background:C.orange}}>🛒 Commander {s.max-s.qte} {s.u} chez {s.four}</Btn>
      </Card>)}
      {critiques.length===0&&<div style={{textAlign:"center",padding:40,color:C.muted}}><div style={{fontSize:32,marginBottom:8}}>✅</div><div>Aucune commande urgente — stock en bonne santé</div></div>}
    </div>}

    {/* ── IA PRÉDICTIVE ── */}
    {onglet==="ia"&&<div>
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 IA Prédictive — Claude Sonnet</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>Basé sur vos 30 derniers jours de mouvements, voici les prévisions de rupture de stock et les recommandations de commande.</div>
      </div>
      {stock.map((s,i)=>{const tendance=s.historique.filter(h=>h.type==="sortie").reduce((a,h)=>a+h.qte,0);const joursStock=tendance>0?Math.round(s.qte/(tendance/30)):999;return <Card key={i} style={{marginBottom:8,borderColor:joursStock<14?`${C.orange}33`:C.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,fontWeight:700}}>{s.art}</div><div style={{fontSize:10,color:C.muted}}>Consommation : {tendance} {s.u}/mois · Stock : {s.qte} {s.u}</div></div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,fontWeight:700,color:joursStock<7?C.red:joursStock<14?C.orange:C.green}}>{joursStock<999?`⏱ ${joursStock}j restants`:"♾ Stock stable"}</div>
            {joursStock<14&&<div style={{fontSize:9,color:C.orange}}>Commander dans {Math.max(0,joursStock-7)}j</div>}
          </div>
        </div>
      </Card>;})}
    </div>}

    {/* ── VALORISATION ── */}
    {onglet==="valorisation"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Valeur stock total" val={fmt(valeurTotale)} color={C.gold}/>
        <KPI label="Articles > 100€" val={stock.filter(s=>s.qte*s.prixU>100).length} color={C.blue}/>
        <KPI label="Coût commandes urgentes" val={fmt(critiques.reduce((a,s)=>a+(s.max-s.qte)*s.prixU,0))} color={C.red}/>
      </div>
      <Card>
        <STitle>💰 Valorisation par article</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Article</TH><TH>Catégorie</TH><TH>Qté</TH><TH>PU</TH><TH>Valeur stock</TH><TH>% du total</TH></tr></thead>
          <tbody>{[...stock].sort((a,b)=>b.qte*b.prixU-a.qte*a.prixU).map((s,i)=>{const val=s.qte*s.prixU;const pct=Math.round(val/valeurTotale*100);return <tr key={i}>
            <Td style={{fontWeight:700}}>{s.art}</Td>
            <Td><Pill color={C.blue}>{s.cat}</Pill></Td>
            <Td>{s.qte} {s.u}</Td>
            <Td style={{color:C.muted}}>{fmt(s.prixU)}</Td>
            <Td style={{color:C.gold,fontWeight:700}}>{fmt(val)}</Td>
            <Td><div style={{display:"flex",alignItems:"center",gap:6}}><SM val={pct} max={100} color={C.gold}/><span style={{fontSize:10,color:C.muted}}>{pct}%</span></div></Td>
          </tr>;})}
          </tbody>
        </table>
      </Card>
    </div>}
  </div>;
};
// ─── PAGE SERVICES ────────────────────────────────────────────

export default PageStock;
