"use client";
import { useState, useEffect } from "react";
import { C, Card, Btn, TH, Td, KPI, STitle } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageFormation=({plan,showToast,UpgradeWall})=>{
  if(!hasAccess(plan,"formation"))return <div style={{padding:20}}><UpgradeWall page="Formation" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>⊿ Formation équipe</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Normes sectorielles · Certifications · Protocoles · Vente modules</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
      <KPI label="Formations" val={FORMATION.length} color={C.blue}/>
      <KPI label="Complétées" val={FORMATION.filter(f=>f.statut==="complété").length} color={C.green}/>
      <KPI label="Score moyen" val={Math.round(FORMATION.filter(f=>f.score).reduce((a,f)=>a+(f.score||0),0)/FORMATION.filter(f=>f.score).length)+"%"} color={C.gold}/>
    </div>
    <Card>
      <STitle>📚 Modules de formation</STitle>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Formation</TH><TH>Collaborateurs</TH><TH>Statut</TH><TH>Score</TH><TH>Actions</TH></tr></thead>
        <tbody>{FORMATION.map((f,i)=><tr key={i}>
          <Td style={{fontWeight:600}}>{f.titre}</Td>
          <Td style={{color:C.muted}}>{f.collab}</Td>
          <Td><St s={f.statut}/></Td>
          <Td style={{color:f.score>=90?C.green:f.score>=70?C.gold:C.muted,fontWeight:700}}>{f.score?`${f.score}%`:"—"}</Td>
          <Td><Btn onClick={()=>showToast(`🎓 Module "${f.titre}" lancé`)} style={{padding:"4px 8px",fontSize:10}}>{f.statut==="à faire"?"▶ Démarrer":"↺ Refaire"}</Btn></Td>
        </tr>)}</tbody>
      </table>
    </Card>
  </div>;
};

// ─── PAGE DEALS ───────────────────────────────────────────────

export default PageFormation;
