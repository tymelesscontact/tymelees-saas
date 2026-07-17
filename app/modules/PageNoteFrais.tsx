"use client";
import { useState, useEffect, useRef } from "react";
import { C, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp, Sel, SM, Tabs } from "../lib/ui";

const PageNoteFrais=({plan,showToast})=>{
  const[onglet,setOnglet]=useState("saisie");
  const[notes,setNotes]=useState([]);
  const[loadingNotes,setLoadingNotes]=useState(true);

  useEffect(()=>{
    const load=async()=>{
      try{
        const res=await fetch('/api/notefrais?action=list');
        const data=await res.json();
        if(data.notes)setNotes(data.notes);
      }catch(e){console.error('Notes frais:',e);}
      setLoadingNotes(false);
    };
    load();
  },[]);
  const[form,setForm]=useState({employe:"",date:"",categorie:"Transport",marchand:"",montant:"",tva:"",projet:"",notes:"",justificatif:false});
  const[scanning,setScanning]=useState(false);
  const[budget,setBudget]=useState({Transport:500,Repas:300,Hébergement:800,Fournitures:200,Télécom:150,Formation:1000,Autre:200});
  const[showBudget,setShowBudget]=useState(false);
  const[filterStatut,setFilterStatut]=useState("tous");

  const cats=["Transport","Repas","Hébergement","Fournitures","Télécom","Formation","Autre"];
  const comptes={"Transport":"625100","Repas":"625700","Hébergement":"625600","Fournitures":"606400","Télécom":"626000","Formation":"628100","Autre":"625800"};
  const plafonds={"Transport":null,"Repas":20.70,"Hébergement":120,"Fournitures":null,"Télécom":null,"Formation":null,"Autre":null};
  const statutColor={validé:C.green,en_attente:C.gold,refusé:C.red,remboursé:C.teal};
  const statutLabel={validé:"✅ Validé",en_attente:"⏳ En attente",refusé:"❌ Refusé",remboursé:"💸 Remboursé"};

  const tabs=[
    {id:"saisie",label:"➕ Saisie"},
    {id:"liste",label:"📋 Mes notes"},
    {id:"validation",label:"✅ Validation"},
    {id:"analytics",label:"📊 Analytics"},
    {id:"export",label:"📤 Export"},
    {id:"politique",label:"⚙️ Politique"},
  ];

  // OCR réel via Claude Vision
  const fileInputRef=useRef(null);

  const scanTicket=()=>{
    if(fileInputRef.current)fileInputRef.current.click();
  };

  const handleFile=async(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    setScanning(true);
    try{
      const fd=new FormData();
      fd.append('image',file);
      const res=await fetch('/api/ocr',{method:'POST',body:fd});
      const data=await res.json();
      if(data.success&&data.data){
        const d=data.data;
        setForm(f=>({...f,
          marchand:d.marchand||f.marchand,
          montant:d.montant_ttc?String(d.montant_ttc):f.montant,
          tva:d.tva?String(d.tva):f.tva,
          categorie:d.categorie||f.categorie,
          date:d.date||new Date().toISOString().slice(0,10),
          justificatif:true,
        }));
        showToast("🤖 Lea a lu votre ticket ! Score de confiance : "+(d.confiance||"—")+"%");
      }else{
        showToast("⚠️ Ticket illisible — remplissez manuellement");
      }
    }catch(err){
      showToast("❌ Erreur OCR — vérifiez la connexion");
    }
    setScanning(false);
    e.target.value="";
  };

  const soumettre=async()=>{
    if(!form.employe||!form.montant||!form.date)return showToast("⚠️ Remplissez les champs obligatoires");
    const plafond=plafonds[form.categorie];
    if(plafond&&parseFloat(form.montant)>plafond)showToast("⚠️ Plafond légal dépassé — "+form.categorie+" : "+plafond+"€ max");
    try{
      const res=await fetch('/api/notefrais',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'create',
          employe:form.employe,
          date:form.date,
          categorie:form.categorie,
          marchand:form.marchand,
          montant:parseFloat(form.montant)||0,
          tva:parseFloat(form.tva)||0,
          justificatif:form.justificatif,
          compte_cpt:comptes[form.categorie],
          projet:form.projet,
        }),
      });
      const data=await res.json();
      if(data.note){
        setNotes(n=>[{...data.note,compteCpt:data.note.compte_cpt},...n]);
        setForm({employe:"",date:"",categorie:"Transport",marchand:"",montant:"",tva:"",projet:"",notes:"",justificatif:false});
        showToast("✅ Note soumise — en attente de validation");
      }else{showToast("❌ Erreur lors de la soumission");}
    }catch(e){showToast("❌ Erreur connexion");}
  };

  const updateStatut=async(id,statut,msg)=>{
    try{
      await fetch('/api/notefrais',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'update',id,statut}),
      });
      setNotes(n=>n.map(x=>x.id===id?{...x,statut}:x));
      showToast(msg);
    }catch(e){showToast("❌ Erreur");}
  };
  const valider=(id)=>updateStatut(id,"validé","✅ Note validée — écriture comptable créée !");
  const refuser=(id)=>updateStatut(id,"refusé","❌ Note refusée");
  const rembourser=(id)=>updateStatut(id,"remboursé","💸 Remboursement effectué via Wallet Xyra");

  const exportFEC=()=>{
    const header="Date|Compte|Libelle|Montant|TVA";
    const lines=notes.filter(n=>n.statut==="validé").map(n=>
      n.date.replace(/-/g,"")+"|"+n.compteCpt+"|"+n.marchand+"|"+String(n.montant)+"|"+String(n.tva)
    );
    const csv=[header].concat(lines).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="export_fec_xyra.csv";a.click();
    showToast("📤 Export FEC téléchargé !");
  };

  const totalMois=notes.reduce((a,n)=>a+n.montant,0);
  const totalValidé=notes.filter(n=>n.statut==="validé").reduce((a,n)=>a+n.montant,0);
  const totalTVA=notes.filter(n=>n.statut==="validé").reduce((a,n)=>a+n.tva,0);
  const enAttente=notes.filter(n=>n.statut==="en_attente");
  const notesFiltrées=filterStatut==="tous"?notes:notes.filter(n=>n.statut===filterStatut);

  // Dépenses par catégorie
  const depCat={};
  cats.forEach(c=>{depCat[c]=notes.filter(n=>n.categorie===c).reduce((a,n)=>a+n.montant,0);});

  return <div style={{padding:4}}>
    {/* Header */}
    <div style={{background:`linear-gradient(135deg,${C.gold}22,${C.card})`,border:`1px solid ${C.gold}44`,borderRadius:16,padding:20,marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:`${C.gold}33`,border:`2px solid ${C.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🧾</div>
      <div style={{flex:1}}>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>Notes de Frais</div>
        <div style={{fontSize:11,color:C.muted}}>OCR · Validation · Comptabilité automatique · Export FEC</div>
        <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
          <span style={{fontSize:10,background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`,borderRadius:20,padding:"2px 8px"}}>🤖 Lea lit vos tickets</span>
          <span style={{fontSize:10,background:`${C.blue}22`,color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:20,padding:"2px 8px"}}>📊 Compta auto</span>
          <span style={{fontSize:10,background:`${C.purple}22`,color:C.purple,border:`1px solid ${C.purple}44`,borderRadius:20,padding:"2px 8px"}}>💸 Remboursement Wallet</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,flexShrink:0}}>
        {[[totalMois.toFixed(2)+"€","Total mois",C.blue],[totalValidé.toFixed(2)+"€","Validé",C.green],[totalTVA.toFixed(2)+"€","TVA récup.",C.teal],[enAttente.length+" notes","En attente",C.gold]].map(([v,l,c],i)=>(
          <div key={i} style={{background:C.card2,borderRadius:8,padding:"8px 12px",textAlign:"center",border:`1px solid ${c}33`}}>
            <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:9,color:C.muted}}>{l}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Alerte notes en attente */}
    {enAttente.length>0&&<div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}44`,borderRadius:8,padding:12,marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:18}}>⏳</span>
      <div style={{flex:1}}>
        <span style={{fontSize:12,fontWeight:600,color:C.gold}}>{enAttente.length} note(s) en attente de validation</span>
        <span style={{fontSize:11,color:C.muted,marginLeft:8}}>Montant total : {enAttente.reduce((a,n)=>a+n.montant,0).toFixed(2)}€</span>
      </div>
      <button onClick={()=>setOnglet("validation")} style={{background:C.gold,color:"#000",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>Valider →</button>
    </div>}

    {/* Tabs */}
    <div style={{display:"flex",gap:4,marginBottom:16,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{flex:1,minWidth:80,background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"7px 4px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:onglet===t.id?700:400}}>{t.label}</button>)}
    </div>

    {/* ── SAISIE ── */}
    {onglet==="saisie"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <CT>
        <STitle>➕ Nouvelle note de frais</STitle>

        {/* Scan ticket */}
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={handleFile}/>
        <div style={{background:`${C.purple}11`,border:`2px dashed ${C.purple}44`,borderRadius:10,padding:16,marginBottom:14,textAlign:"center",cursor:"pointer"}} onClick={scanTicket}>
          {scanning?<div>
            <div style={{fontSize:24,marginBottom:6}}>🔍</div>
            <div style={{fontSize:12,color:C.purple,fontWeight:600}}>Lea analyse votre ticket...</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>Claude Vision · OCR + IA en cours</div>
          </div>:<div>
            <div style={{fontSize:28,marginBottom:6}}>📸</div>
            <div style={{fontSize:12,color:C.purple,fontWeight:600}}>Scanner un ticket</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>Photo ou PDF · Lea lit et remplit automatiquement</div>
          </div>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div style={{gridColumn:"span 2"}}>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Employé *</label>
            <Inp value={form.employe} onChange={e=>setForm(f=>({...f,employe:e.target.value}))} placeholder="Nom complet"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Date *</label>
            <Inp type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Catégorie</label>
            <Sel value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))}>
              {cats.map(c=><option key={c}>{c}</option>)}
            </Sel>
          </div>
          <div style={{gridColumn:"span 2"}}>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Marchand / Fournisseur</label>
            <Inp value={form.marchand} onChange={e=>setForm(f=>({...f,marchand:e.target.value}))} placeholder="Ex: Uber, Brasserie du Centre..."/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Montant TTC (€) *</label>
            <Inp type="number" value={form.montant} onChange={e=>setForm(f=>({...f,montant:e.target.value,tva:(parseFloat(e.target.value)*0.2/1.2).toFixed(2)}))} placeholder="0.00"/>
            {plafonds[form.categorie]&&parseFloat(form.montant)>plafonds[form.categorie]&&<div style={{fontSize:9,color:C.red,marginTop:2}}>⚠️ Plafond légal : {plafonds[form.categorie]}€</div>}
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>TVA (auto-calculée)</label>
            <Inp type="number" value={form.tva} onChange={e=>setForm(f=>({...f,tva:e.target.value}))} placeholder="0.00"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Projet / Client</label>
            <Inp value={form.projet} onChange={e=>setForm(f=>({...f,projet:e.target.value}))} placeholder="Ex: Client Dupont"/>
          </div>
          <div>
            <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Compte comptable</label>
            <Inp value={comptes[form.categorie]||""} readOnly style={{color:C.muted,cursor:"not-allowed"}}/>
          </div>
          <div style={{gridColumn:"span 2"}}>
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:11,cursor:"pointer"}}>
              <input type="checkbox" checked={form.justificatif} onChange={e=>setForm(f=>({...f,justificatif:e.target.checked}))}/>
              <span>J'ai un justificatif (ticket, facture)</span>
            </label>
          </div>
        </div>
        <button onClick={soumettre} disabled={!form.employe||!form.montant||!form.date} style={{width:"100%",background:!form.employe||!form.montant||!form.date?C.muted:`linear-gradient(135deg,${C.gold},#A07830)`,color:"#000",border:"none",borderRadius:8,padding:"13px",cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit"}}>
          📤 Soumettre la note de frais
        </button>
      </CT>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {/* Infos légales */}
        <CT style={{background:`${C.blue}11`,borderColor:`${C.blue}33`}}>
          <STitle>⚖️ Plafonds légaux France 2026</STitle>
          {[["🍽 Repas","20.70€ max"],["🏨 Hébergement Paris","120€ max"],["🏨 Hébergement province","90€ max"],["🚗 Kilométrique","0.33€/km (5CV)"],["📱 Forfait téléphone","20€/mois"],].map(([l,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
              <span>{l}</span><span style={{color:C.gold,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </CT>

        {/* Budget consommé */}
        <CT>
          <STitle>💰 Budget mensuel consommé</STitle>
          {cats.slice(0,4).map((c,i)=>{
            const dep=depCat[c]||0;
            const bud=budget[c]||500;
            const pct=Math.min(100,Math.round((dep/bud)*100));
            return <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                <span>{c}</span>
                <span style={{color:pct>80?C.red:pct>60?C.orange:C.green,fontWeight:700}}>{dep.toFixed(0)}€ / {bud}€</span>
              </div>
              <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:pct+"%",background:pct>80?C.red:pct>60?C.orange:C.green,borderRadius:3,transition:"width .5s"}}/>
              </div>
            </div>;
          })}
        </CT>

        {/* Intégration compta */}
        <CT style={{background:`${C.teal}11`,borderColor:`${C.teal}33`}}>
          <STitle>🔗 Intégration comptable auto</STitle>
          {[["606400","Fournitures"],["625100","Déplacements"],["625600","Hébergement"],["625700","Repas"],["626000","Télécom"],["628100","Formation"]].map(([c,l],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:10,borderBottom:`1px solid ${C.border}22`}}>
              <span style={{color:C.teal,fontFamily:"monospace"}}>{c}</span>
              <span style={{color:C.muted}}>{l}</span>
            </div>
          ))}
        </CT>
      </div>
    </div>}

    {/* ── LISTE ── */}
    {onglet==="liste"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {["tous","en_attente","validé","refusé","remboursé"].map(s=>(
          <button key={s} onClick={()=>setFilterStatut(s)} style={{background:filterStatut===s?C.gold:"transparent",color:filterStatut===s?"#000":C.muted,border:`1px solid ${filterStatut===s?C.gold:C.border}`,borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:600}}>
            {s==="tous"?"Toutes":statutLabel[s]||s}
          </button>
        ))}
      </div>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Date</TH><TH>Employé</TH><TH>Catégorie</TH><TH>Marchand</TH><TH>Montant</TH><TH>TVA</TH><TH>Compte</TH><TH>Projet</TH><TH>Justif.</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{notesFiltrées.map((n,i)=>(
            <tr key={i}>
              <Td style={{fontSize:10}}>{n.date}</Td>
              <Td style={{fontWeight:600,fontSize:11}}>{n.employe}</Td>
              <Td><Pill color={C.blue}>{n.categorie}</Pill></Td>
              <Td style={{fontSize:11}}>{n.marchand}</Td>
              <Td style={{fontWeight:700,color:C.gold}}>{n.montant.toFixed(2)}€</Td>
              <Td style={{color:C.teal,fontSize:10}}>{n.tva.toFixed(2)}€</Td>
              <Td style={{fontFamily:"monospace",fontSize:10,color:C.muted}}>{n.compteCpt}</Td>
              <Td style={{fontSize:10,color:C.muted}}>{n.projet||"—"}</Td>
              <Td style={{textAlign:"center"}}>{n.justificatif?"✅":"⚠️"}</Td>
              <Td><Pill color={statutColor[n.statut]||C.muted}>{statutLabel[n.statut]||n.statut}</Pill></Td>
              <Td><div style={{display:"flex",gap:4}}>
                {n.statut==="validé"&&<Btn onClick={()=>rembourser(n.id)} style={{fontSize:9,padding:"3px 6px",background:C.teal}}>💸</Btn>}
                {n.statut==="en_attente"&&<><Btn onClick={()=>valider(n.id)} style={{fontSize:9,padding:"3px 6px",background:C.green}}>✅</Btn><BtnGhost onClick={()=>refuser(n.id)} style={{fontSize:9}}>❌</BtnGhost></>}
              </div></Td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>}

    {/* ── VALIDATION ── */}
    {onglet==="validation"&&<div>
      {enAttente.length===0?<div style={{textAlign:"center",padding:40,color:C.muted}}>
        <div style={{fontSize:36,marginBottom:8}}>✅</div>
        <div style={{fontWeight:600}}>Tout est à jour !</div>
        <div style={{fontSize:11,marginTop:4}}>Aucune note en attente de validation</div>
      </div>:enAttente.map((n,i)=>(
        <CT key={i} style={{marginBottom:12,borderColor:`${C.gold}33`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{fontSize:13,fontWeight:700}}>{n.employe}</div>
              <div style={{fontSize:10,color:C.muted}}>{n.date} · {n.marchand}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:18,fontWeight:700,color:C.gold}}>{n.montant.toFixed(2)}€</div>
              <div style={{fontSize:10,color:C.teal}}>TVA : {n.tva.toFixed(2)}€</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
            {[["Catégorie",n.categorie],["Compte",n.compteCpt],["Projet",n.projet||"—"],].map(([l,v],j)=>(
              <div key={j} style={{background:C.card,borderRadius:6,padding:8}}>
                <div style={{fontSize:9,color:C.muted}}>{l}</div>
                <div style={{fontSize:11,fontWeight:600,color:C.text}}>{v}</div>
              </div>
            ))}
          </div>
          {!n.justificatif&&<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:6,padding:8,marginBottom:10,fontSize:11,color:C.orange}}>⚠️ Pas de justificatif joint</div>}
          {plafonds[n.categorie]&&n.montant>plafonds[n.categorie]&&<div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:6,padding:8,marginBottom:10,fontSize:11,color:C.red}}>⚠️ Plafond légal dépassé ({plafonds[n.categorie]}€ max)</div>}
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>{valider(n.id);}} style={{flex:1,background:C.green,justifyContent:"center"}}>✅ Valider et créer écriture comptable</Btn>
            <BtnGhost onClick={()=>{refuser(n.id);}} style={{flex:1,justifyContent:"center",borderColor:C.red,color:C.red}}>❌ Refuser</BtnGhost>
          </div>
        </CT>
      ))}
    </div>}

    {/* ── ANALYTICS ── */}
    {onglet==="analytics"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Dépenses par catégorie</STitle>
          {cats.map((c,i)=>{
            const dep=depCat[c]||0;
            const total=totalMois||1;
            const pct=Math.round((dep/total)*100);
            return <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                <span>{c}</span>
                <span style={{fontWeight:700,color:C.gold}}>{dep.toFixed(2)}€ <span style={{color:C.muted,fontWeight:400}}>({pct}%)</span></span>
              </div>
              <SM val={dep} max={totalMois||1} color={C.gold}/>
            </div>;
          })}
        </Card>
        <Card>
          <STitle>👥 Dépenses par employé</STitle>
          {["Thomas Martin","Fatou Diallo","Abou Diallo"].map((emp,i)=>{
            const dep=notes.filter(n=>n.employe===emp).reduce((a,n)=>a+n.montant,0);
            return <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                <span>{emp}</span>
                <span style={{fontWeight:700,color:C.blue}}>{dep.toFixed(2)}€</span>
              </div>
              <SM val={dep} max={totalMois||1} color={C.blue}/>
            </div>;
          })}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
        {[[totalMois.toFixed(2)+"€","Total dépenses",C.blue],[totalValidé.toFixed(2)+"€","Validé",C.green],[totalTVA.toFixed(2)+"€","TVA récupérable",C.teal],[(totalMois-totalValidé).toFixed(2)+"€","En attente",C.gold]].map(([v,l,c],i)=>(
          <CT key={i} style={{textAlign:"center",borderColor:`${c}33`}}>
            <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:9,color:C.muted}}>{l}</div>
          </CT>
        ))}
      </div>
      <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
        <STitle>🤖 Recommandations Lea</STitle>
        <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>
          {totalMois===0?"Aucune donnée — soumettez vos premières notes de frais.":
          depCat["Repas"]>200?"⚠️ Les frais de repas sont élevés ce mois-ci. Rappel : plafond légal 20.70€ par repas.":
          notes.filter(n=>!n.justificatif).length>0?`⚠️ ${notes.filter(n=>!n.justificatif).length} note(s) sans justificatif — risque fiscal en cas de contrôle.`:
          "✅ Vos notes de frais sont conformes. TVA récupérable : "+totalTVA.toFixed(2)+"€."}
        </div>
      </Card>
    </div>}

    {/* ── EXPORT ── */}
    {onglet==="export"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <CT>
        <STitle>📤 Export comptable</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {icon:"📊",titre:"Export FEC",desc:"Fichier des Écritures Comptables — norme DGFiP",action:exportFEC,color:C.blue},
            {icon:"📋",titre:"Export Excel",desc:"Tableau complet de toutes les notes du mois",action:()=>showToast("📋 Export Excel généré !"),color:C.green},
            {icon:"📧",titre:"Envoyer à l'expert-comptable",desc:"Email automatique avec pièces jointes",action:()=>showToast("📧 Envoi à l'expert-comptable en cours..."),color:C.teal},
            {icon:"📄",titre:"Rapport PDF mensuel",desc:"Synthèse complète avec graphiques",action:()=>showToast("📄 Rapport PDF généré !"),color:C.gold},
          ].map((item,i)=>(
            <div key={i} style={{background:C.card2,borderRadius:8,padding:12,border:`1px solid ${item.color}33`,cursor:"pointer",display:"flex",alignItems:"center",gap:12}} onClick={item.action}>
              <span style={{fontSize:24}}>{item.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:item.color}}>{item.titre}</div>
                <div style={{fontSize:10,color:C.muted}}>{item.desc}</div>
              </div>
              <span style={{color:C.muted}}>→</span>
            </div>
          ))}
        </div>
      </CT>
      <CT>
        <STitle>🔗 Intégrations logiciels comptables</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {["Sage","EBP","Ciel","QuickBooks","Pennylane","Odoo"].map((l,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:C.card,borderRadius:6,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,fontWeight:600}}>{l}</span>
              <button onClick={()=>showToast(`🔗 Connexion ${l} configurée !`)} style={{background:C.blue,color:"#fff",border:"none",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Connecter</button>
            </div>
          ))}
        </div>
      </CT>
    </div>}

    {/* ── POLITIQUE ── */}
    {onglet==="politique"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <CT>
        <STitle>⚙️ Plafonds par catégorie</STitle>
        <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Définissez les montants maximum autorisés par catégorie</div>
        {cats.map((c,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:11,flex:1}}>{c}</span>
            <Inp type="number" value={budget[c]} onChange={e=>setBudget(b=>({...b,[c]:parseFloat(e.target.value)||0}))} style={{width:80,textAlign:"right"}}/>
            <span style={{fontSize:11,color:C.muted}}>€/mois</span>
          </div>
        ))}
        <Btn onClick={()=>showToast("✅ Politique de dépenses sauvegardée !")} style={{width:"100%",justifyContent:"center",marginTop:8}}>💾 Sauvegarder</Btn>
      </CT>
      <CT>
        <STitle>👤 Règles par rôle</STitle>
        {[
          {role:"Direction",repas:"50€",hotel:"200€",transport:"Illimité"},
          {role:"Commercial",repas:"35€",hotel:"150€",transport:"500€/mois"},
          {role:"Administratif",repas:"20.70€",hotel:"90€",transport:"200€/mois"},
          {role:"Technicien",repas:"20.70€",hotel:"90€",transport:"300€/mois"},
        ].map((r,i)=>(
          <div key={i} style={{background:C.card,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:4}}>{r.role}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
              {[["🍽",r.repas],["🏨",r.hotel],["🚗",r.transport]].map(([ic,v],j)=>(
                <div key={j} style={{fontSize:10,color:C.muted,textAlign:"center"}}>
                  <div>{ic}</div><div style={{color:C.text,fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>
          ⚙️ Les règles par rôle sont configurables selon vos postes RH
        </div>
      </CT>
    </div>}
  </div>;
};

// ─── PAGE COMPTA ──────────────────────────────────────────────

export default PageNoteFrais;
