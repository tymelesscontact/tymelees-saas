"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, BtnGhost, TH, Td, KPI, STitle, Pill, Tabs } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageCompta=({plan,showToast,UpgradeWall})=>{
  const[onglet,setOnglet]=useState("journal");
  const[wallet,setWallet]=useState([]);
  const[factures,setFactures]=useState([]);
  const[soldeReel,setSoldeReel]=useState(0);
  const[tvaDeductible,setTvaDeductible]=useState(0);
  const[loadingCompta,setLoadingCompta]=useState(true);

  const loadCompta=async()=>{
    try{
      const[wRes,fRes]=await Promise.all([
        fetch('/api/wallet?action=list').then(r=>r.json()).catch(()=>({})),
        fetch('/api/factures?action=list').then(r=>r.json()).catch(()=>({})),
      ]);
      if(wRes.transactions)setWallet(wRes.transactions);
      if(wRes.solde!=null)setSoldeReel(wRes.solde);
      if(fRes.factures)setFactures(fRes.factures);
      try{
        const{createClient}=await import('@supabase/supabase-js');
        const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const{data}=await sb.from('notes_frais').select('tva').eq('statut','validé');
        if(data)setTvaDeductible(data.reduce((a,n)=>a+Number(n.tva||0),0));
      }catch(e){/* module Notes de Frais optionnel */}
    }catch(e){console.error("Compta:",e);}
    setLoadingCompta(false);
  };
  useEffect(()=>{loadCompta();},[]);

  const tabs=[{id:"journal",label:"📋 Journal"},{id:"bilan",label:"📊 Bilan"},{id:"tva",label:"💶 TVA"},{id:"charges",label:"💸 Charges"},{id:"fournisseurs",label:"🏭 Fournisseurs"},{id:"ia",label:"🤖 IA Fiscale"},{id:"export",label:"📤 Export"}];
  if(!hasAccess(plan,"compta"))return <div style={{padding:20}}><UpgradeWall page="Comptabilité" plan={plan}/></div>;

  const journal=[
    ...wallet.filter(w=>w.statut==="confirmé"||w.statut==="viré").map(w=>({date:w.created_at,libelle:w.libelle,montant:Number(w.montant),type:w.type==="entree"?"recette":"depense"})),
    ...factures.filter(f=>f.statut==="payée").map(f=>({date:f.date_emission,libelle:`Facture ${f.numero} — ${f.client_nom}`,montant:Number(f.montant_ttc),type:"recette"})),
  ].sort((a,b)=>new Date(b.date)-new Date(a.date));

  const recettes=journal.filter(j=>j.type==="recette").reduce((a,j)=>a+j.montant,0);
  const depenses=journal.filter(j=>j.type==="depense").reduce((a,j)=>a+j.montant,0);
  const resultatNet=recettes-depenses;
  const marge=recettes>0?Math.round((resultatNet/recettes)*100):0;

  const creancesClients=factures.filter(f=>f.statut!=="payée"&&f.statut!=="annulée").reduce((a,f)=>a+Number(f.montant_ttc),0);
  const dettesFournisseurs=wallet.filter(w=>w.type==="fournisseur"&&w.statut==="à_virer").reduce((a,w)=>a+Number(w.montant),0);
  const commissionsDues=wallet.filter(w=>w.type==="commission"&&w.statut==="à_virer").reduce((a,w)=>a+Number(w.montant),0);

  const tvaCollectee=factures.reduce((a,f)=>a+Number(f.montant_tva||0),0);
  const tvaAReverser=Math.max(0,tvaCollectee-tvaDeductible);

  const exportFEC=()=>{
    const lignes=["JournalCode\tJournalLib\tEcritureNum\tEcritureDate\tCompteNum\tCompteLib\tCompAuxNum\tCompAuxLib\tPieceRef\tPieceDate\tEcritureLib\tDebit\tCredit\tEcritureLet\tDateLet\tValidDate\tMontantdevise\tIdevise"];
    journal.forEach((j,i)=>{
      const d=new Date(j.date);const dStr=isNaN(d)?"":`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
      const num=String(i+1).padStart(5,"0");
      if(j.type==="recette"){
        lignes.push(`VT\tVentes\t${num}\t${dStr}\t512000\tBanque\t\t\tPC${num}\t${dStr}\t${j.libelle}\t${j.montant.toFixed(2)}\t0.00\t\t\t${dStr}\t\t`);
        lignes.push(`VT\tVentes\t${num}\t${dStr}\t706000\tPrestations de services\t\t\tPC${num}\t${dStr}\t${j.libelle}\t0.00\t${j.montant.toFixed(2)}\t\t\t${dStr}\t\t`);
      }else{
        lignes.push(`AC\tAchats\t${num}\t${dStr}\t625100\tServices extérieurs\t\t\tPC${num}\t${dStr}\t${j.libelle}\t${j.montant.toFixed(2)}\t0.00\t\t\t${dStr}\t\t`);
        lignes.push(`AC\tAchats\t${num}\t${dStr}\t512000\tBanque\t\t\tPC${num}\t${dStr}\t${j.libelle}\t0.00\t${j.montant.toFixed(2)}\t\t\t${dStr}\t\t`);
      }
    });
    const blob=new Blob([lignes.join("\n")],{type:"text/plain;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`FEC_Xyra_${new Date().getFullYear()}.txt`;a.click();
    showToast("✅ FEC téléchargé");
  };

  const exportCSV=()=>{
    const lignes=["Date,Libellé,Type,Montant"];
    journal.forEach(j=>{lignes.push(`${j.date},"${j.libelle}",${j.type},${j.montant.toFixed(2)}`);});
    const blob=new Blob([lignes.join("\n")],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Journal_Xyra_${new Date().getFullYear()}.csv`;a.click();
    showToast("✅ CSV téléchargé");
  };

  const apercuBilanPDF=()=>{
    const win=window.open("","_blank");
    if(!win)return showToast("⚠️ Autorisez les pop-ups");
    win.document.write(`<!DOCTYPE html><html><head><title>Bilan</title><style>body{font-family:sans-serif;padding:40px;max-width:700px;margin:0 auto;}h1{color:#C9A84C;font-family:Georgia,serif;}table{width:100%;border-collapse:collapse;margin-top:16px;}td{padding:8px 0;border-bottom:1px solid #eee;}.btn{background:#C9A84C;color:#000;border:none;padding:10px 24px;border-radius:6px;font-weight:700;cursor:pointer;margin-top:30px;}@media print{.btn{display:none;}}</style></head><body>
      <h1>XYRA — Bilan</h1>
      <h3>ACTIF</h3>
      <table><tr><td>Trésorerie</td><td style="text-align:right;">${soldeReel.toFixed(2)}€</td></tr><tr><td>Créances clients</td><td style="text-align:right;">${creancesClients.toFixed(2)}€</td></tr><tr><td><b>TOTAL ACTIF</b></td><td style="text-align:right;"><b>${(soldeReel+creancesClients).toFixed(2)}€</b></td></tr></table>
      <h3>PASSIF</h3>
      <table><tr><td>Résultat net</td><td style="text-align:right;">${resultatNet.toFixed(2)}€</td></tr><tr><td>Dettes fournisseurs</td><td style="text-align:right;">${dettesFournisseurs.toFixed(2)}€</td></tr><tr><td>Commissions dues</td><td style="text-align:right;">${commissionsDues.toFixed(2)}€</td></tr><tr><td><b>TOTAL PASSIF</b></td><td style="text-align:right;"><b>${(resultatNet+dettesFournisseurs+commissionsDues).toFixed(2)}€</b></td></tr></table>
      <button class="btn" onclick="window.print()">🖨 Imprimer / Enregistrer en PDF</button>
    </body></html>`);
    win.document.close();
  };

  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◉ Comptabilité</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Journal · Bilan · TVA · Charges · Fournisseurs · IA Fiscale — données réelles</div>
    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>
    {loadingCompta&&<div style={{fontSize:11,color:C.muted,marginBottom:12}}>Chargement des données réelles...</div>}
    {onglet==="journal"&&<Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Recettes" val={fmt(recettes)} color={C.green}/>
        <KPI label="Dépenses" val={fmt(depenses)} color={C.red}/>
        <KPI label="Résultat net" val={fmt(resultatNet)} color={C.gold}/>
        <KPI label="Marge" val={marge+"%"} color={C.teal}/>
      </div>
      {!loadingCompta&&journal.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucune écriture pour le moment — les paiements confirmés et factures payées apparaîtront ici automatiquement.</div>}
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Date</TH><TH>Libellé</TH><TH>Débit</TH><TH>Crédit</TH><TH>Type</TH></tr></thead>
        <tbody>{journal.slice(0,15).map((h,i)=><tr key={i}>
          <Td style={{color:C.muted,fontSize:10}}>{new Date(h.date).toLocaleDateString("fr")}</Td>
          <Td style={{fontWeight:600}}>{h.libelle}</Td>
          <Td style={{color:C.red}}>{h.type==="depense"?fmt(h.montant):"—"}</Td>
          <Td style={{color:C.green}}>{h.type==="recette"?fmt(h.montant):"—"}</Td>
          <Td><Pill color={h.type==="recette"?C.green:C.red}>{h.type==="recette"?"Recette":"Dépense"}</Pill></Td>
        </tr>)}</tbody>
      </table>
    </Card>}
    {onglet==="bilan"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card><STitle>📈 ACTIF</STitle>
        {[["Trésorerie",soldeReel,C.green],["Créances clients",creancesClients,C.blue]].map(([n,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span>{n}</span><span style={{color:c,fontWeight:700}}>{fmt(v)}</span></div>)}
        <div style={{marginTop:8,display:"flex",justifyContent:"space-between",fontWeight:700}}><span style={{color:C.gold}}>TOTAL ACTIF</span><span style={{color:C.gold}}>{fmt(soldeReel+creancesClients)}</span></div>
      </Card>
      <Card><STitle>📉 PASSIF</STitle>
        {[["Résultat net",resultatNet,C.green],["Dettes fournisseurs",dettesFournisseurs,C.red],["Commissions dues",commissionsDues,C.orange]].map(([n,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span>{n}</span><span style={{color:c,fontWeight:700}}>{fmt(v)}</span></div>)}
        <div style={{marginTop:8,display:"flex",justifyContent:"space-between",fontWeight:700}}><span style={{color:C.gold}}>TOTAL PASSIF</span><span style={{color:C.gold}}>{fmt(resultatNet+dettesFournisseurs+commissionsDues)}</span></div>
      </Card>
      <div style={{gridColumn:"span 2"}}><BtnGhost onClick={apercuBilanPDF}>👁 Aperçu / Imprimer le bilan</BtnGhost></div>
    </div>}
    {onglet==="tva"&&<Card><STitle>💶 TVA collectée / déductible</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <KPI label="TVA collectée" val={fmt(tvaCollectee)} color={C.red}/>
        <KPI label="TVA déductible" val={fmt(tvaDeductible)} color={C.green}/>
        <KPI label="TVA à reverser" val={fmt(tvaAReverser)} color={C.orange}/>
      </div>
      <div style={{marginTop:12,fontSize:11,color:C.muted}}>TVA collectée calculée depuis tes vraies factures. TVA déductible calculée depuis les Notes de Frais validées.</div>
    </Card>}
    {onglet==="charges"&&<TabCharges showToast={showToast}/>}
    {onglet==="fournisseurs"&&<TabFournisseurs showToast={showToast}/>}
    {onglet==="ia"&&<Card><STitle>🤖 Conseils IA Fiscale — Claude</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[{t:"Marge actuelle",c:`Ta marge nette est de ${marge}% sur la période. ${marge<20?"C'est en dessous de la moyenne du secteur services (25-35%) — vérifie tes charges fixes.":"C'est une bonne marge pour ton secteur."}`,col:marge<20?C.orange:C.green},{t:"TVA à anticiper",c:`Tu as ${fmt(tvaAReverser)} de TVA à reverser sur la période. Mets cette somme de côté pour ta prochaine déclaration.`,col:C.gold},{t:"Créances en attente",c:creancesClients>0?`Tu as ${fmt(creancesClients)} de factures non encore payées. Pense à relancer les clients en retard depuis le module Facturation.`:"Aucune créance en attente, bien joué.",col:C.blue}].map((a,i)=><div key={i} style={{background:`${a.col}11`,border:`1px solid ${a.col}33`,borderRadius:8,padding:12}}>
          <div style={{fontSize:11,fontWeight:700,color:a.col,marginBottom:4}}>💡 {a.t}</div>
          <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{a.c}</div>
        </div>)}
      </div>
    </Card>}
    {onglet==="export"&&<Card><STitle>📤 Exports comptables réels</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <CT style={{cursor:"pointer"}} onClick={exportFEC}>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>FEC <Pill color={C.blue}>.txt</Pill></div>
          <div style={{fontSize:10,color:C.muted}}>Fichier des Écritures Comptables — format légal</div>
        </CT>
        <CT style={{cursor:"pointer"}} onClick={exportCSV}>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>Journal <Pill color={C.blue}>.csv</Pill></div>
          <div style={{fontSize:10,color:C.muted}}>Toutes les écritures, format tableur</div>
        </CT>
        <CT style={{cursor:"pointer"}} onClick={apercuBilanPDF}>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>Bilan <Pill color={C.blue}>.pdf</Pill></div>
          <div style={{fontSize:10,color:C.muted}}>Bilan comptable complet</div>
        </CT>
      </div>
      <div style={{marginTop:12,fontSize:10,color:C.muted}}>Le FEC utilise une imputation comptable simplifiée (512000/706000/625100) — communique-le à ton expert-comptable pour vérification avant déclaration officielle.</div>
    </Card>}
  </div>;
};

// ─── PAGE TRESORERIE ──────────────────────────────────────────

export default PageCompta;
