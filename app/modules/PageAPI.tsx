"use client";
import { useState, useEffect } from "react";
import { C, Card, CT, Btn, BtnGhost, TH, Td } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageAPI=({plan,showToast,UpgradeWall})=>{
  const[onglet,setOnglet]=useState("keys");
  const[keys,setKeys]=useState([]);
  const[webhooks,setWebhooks]=useState([]);
  const[logs,setLogs]=useState([]);
  const[totalAppels,setTotalAppels]=useState(0);
  const[tauxSucces,setTauxSucces]=useState(100);
  const[latenceMoy,setLatenceMoy]=useState(0);
  const[loading,setLoading]=useState(true);
  const[showKeyForm,setShowKeyForm]=useState(false);
  const[showWebhookForm,setShowWebhookForm]=useState(false);
  const[keyForm,setKeyForm]=useState({nom:"",type:"live",permissions:["read","write"]});
  const[webhookForm,setWebhookForm]=useState({nom:"",url:"",evenements:["paiement.recu"]});
  const[newKeyValue,setNewKeyValue]=useState("");
  const[explicationIA,setExplicationIA]=useState({});
  const[visible,setVisible]=useState({});

  const EVENEMENTS_DISPO=["paiement.recu","client.cree","deal.gagne","facture.payee","avis.recu","membre.inscrit","essai.expire","abonnement.annule"];
  const DOCS_ENDPOINTS=[
    {methode:"GET",path:"/api/v1/clients",desc:"Liste tous les clients"},
    {methode:"GET",path:"/api/v1/clients/:id",desc:"Détail d'un client"},
    {methode:"POST",path:"/api/v1/clients",desc:"Créer un client"},
    {methode:"GET",path:"/api/v1/factures",desc:"Liste des factures"},
    {methode:"POST",path:"/api/v1/factures",desc:"Créer une facture"},
    {methode:"GET",path:"/api/v1/wallet/solde",desc:"Solde du wallet"},
    {methode:"POST",path:"/api/v1/wallet/virement",desc:"Effectuer un virement"},
    {methode:"GET",path:"/api/v1/deals",desc:"Liste des deals"},
    {methode:"POST",path:"/api/v1/deals",desc:"Créer un deal"},
    {methode:"GET",path:"/api/v1/analytique",desc:"Données analytiques"},
  ];
  const methodeColor={GET:C.green,POST:C.blue,PUT:C.orange,DELETE:C.red,PATCH:C.purple};

  const load=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/api-xyra?action=all');
      const d=await res.json();
      setKeys(d.keys||[]);
      setWebhooks(d.webhooks||[]);
      setLogs(d.logs||[]);
      setTotalAppels(d.totalAppels||0);
      setTauxSucces(d.tauxSucces||100);
      setLatenceMoy(d.latenceMoy||0);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const creerKey=async()=>{
    if(!keyForm.nom)return showToast("⚠️ Nom requis");
    try{
      const res=await fetch('/api/api-xyra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_key',...keyForm})});
      const d=await res.json();
      if(d.success){setNewKeyValue(d.key_value);showToast("🔑 Clé créée ! Copiez-la maintenant.");setShowKeyForm(false);setKeyForm({nom:"",type:"live",permissions:["read","write"]});load();}
    }catch(e){showToast("❌ Erreur");}
  };

  const revoquerKey=async(id)=>{
    if(!confirm("Révoquer cette clé ?"))return;
    try{await fetch('/api/api-xyra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'revoquer_key',id})});showToast("🔒 Clé révoquée");load();}catch(e){showToast("❌ Erreur");}
  };

  const creerWebhook=async()=>{
    if(!webhookForm.nom||!webhookForm.url)return showToast("⚠️ Nom et URL requis");
    try{
      const res=await fetch('/api/api-xyra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_webhook',...webhookForm})});
      const d=await res.json();
      if(d.success){showToast("✅ Webhook créé");setShowWebhookForm(false);setWebhookForm({nom:"",url:"",evenements:["paiement.recu"]});load();}
    }catch(e){showToast("❌ Erreur");}
  };

  const testerWebhook=async(wh)=>{
    showToast("⏳ Test webhook...");
    try{
      const res=await fetch('/api/api-xyra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'tester_webhook',url:wh.url,secret:wh.secret})});
      const d=await res.json();
      showToast(d.success?"✅ Webhook OK":"❌ Webhook KO");
    }catch(e){showToast("❌ Erreur réseau");}
  };

  const expliquerErreur=async(log)=>{
    try{
      const res=await fetch('/api/api-xyra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'expliquer_erreur',code:log.statut_code,endpoint:log.endpoint,message:"Erreur "+log.statut_code+" sur "+log.methode+" "+log.endpoint})});
      const d=await res.json();
      if(d.success)setExplicationIA(e=>({...e,[log.id]:d.explication}));
    }catch(e){}
  };

  if(!hasAccess(plan,"deploiement"))return <div style={{padding:20}}><UpgradeWall page="API Xyra" plan={plan}/></div>;
  if(loading)return <div style={{padding:20}}><div style={{fontSize:11,color:C.muted}}>⏳ Chargement API...</div></div>;

  const uptimeColor=tauxSucces>=99?C.green:tauxSucces>=95?C.gold:C.red;
  const uptimeIcon=tauxSucces>=99?"🟢":tauxSucces>=95?"🟡":"🔴";

  const tabs=[
    {id:"keys",label:"🔑 Clés API"},
    {id:"webhooks",label:"🔔 Webhooks"},
    {id:"logs",label:"📋 Logs"},
    {id:"docs",label:"📚 Docs"},
    {id:"integrations",label:"🔗 Intégrations"},
    {id:"sante",label:"❤ Santé"},
  ];

  return <div style={{padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>⚡ API Xyra</div>
        <div style={{fontSize:11,color:C.muted}}>Clés API · Webhooks · Logs · Documentation · Intégrations</div>
      </div>
      <div style={{background:uptimeColor+"22",border:"1px solid "+uptimeColor+"44",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,color:uptimeColor}}>
        {uptimeIcon} {tauxSucces}% uptime
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>CLÉS ACTIVES</div><div style={{fontSize:22,fontWeight:700,color:C.green}}>{keys.length}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>WEBHOOKS</div><div style={{fontSize:22,fontWeight:700,color:C.blue}}>{webhooks.length}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>APPELS TOTAL</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{totalAppels}</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>TAUX SUCCÈS</div><div style={{fontSize:18,fontWeight:700,color:tauxSucces>=99?C.green:C.orange}}>{tauxSucces}%</div></CT>
      <CT><div style={{fontSize:9,color:C.muted,marginBottom:3}}>LATENCE MOY.</div><div style={{fontSize:18,fontWeight:700,color:latenceMoy<200?C.green:latenceMoy<500?C.gold:C.red}}>{latenceMoy}ms</div></CT>
    </div>

    {newKeyValue&&<div style={{background:C.gold+"11",border:"2px solid "+C.gold,borderRadius:10,padding:16,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:8}}>🔑 Copiez cette clé maintenant — elle ne sera plus visible !</div>
      <div style={{background:C.dark,borderRadius:6,padding:"10px 14px",fontFamily:"'Courier New',monospace",fontSize:12,color:C.green,marginBottom:10,wordBreak:"break-all"}}>{newKeyValue}</div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>{navigator.clipboard?.writeText(newKeyValue);showToast("✅ Clé copiée !");}} style={{background:C.gold,color:"#000"}}>📋 Copier</Btn>
        <BtnGhost onClick={()=>setNewKeyValue("")} style={{fontSize:11}}>✕ Fermer</BtnGhost>
      </div>
    </div>}

    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?"1px solid "+C.border:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {onglet==="keys"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <Btn onClick={()=>setShowKeyForm(true)}>+ Générer une clé API</Btn>
      </div>
      {showKeyForm&&<Card style={{marginBottom:14,borderColor:C.gold+"44"}}>
        <STitle>🔑 Nouvelle clé API</STitle>
        <div style={{background:C.orange+"11",border:"1px solid "+C.orange+"33",borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:C.orange}}>⚠️ La clé ne sera affichée qu'une fois. Copiez-la immédiatement.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={keyForm.nom} onChange={e=>setKeyForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: Zapier integration"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Environnement</label>
            <Sel value={keyForm.type} onChange={e=>setKeyForm(f=>({...f,type:e.target.value}))}>
              <option value="live">🟢 Live (production)</option>
              <option value="test">🧪 Test (sandbox)</option>
            </Sel>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creerKey}>🔑 Générer</Btn><BtnGhost onClick={()=>setShowKeyForm(false)}>Annuler</BtnGhost></div>
      </Card>}
      {keys.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>🔑</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucune clé API</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Créez une clé pour connecter Xyra à vos outils.</div>
        <Btn onClick={()=>setShowKeyForm(true)}>+ Générer une clé</Btn>
      </Card>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {keys.map((k,i)=><Card key={i} style={{borderColor:(k.type==="test"?C.blue:C.green)+"33"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <div style={{fontSize:13,fontWeight:700}}>{k.nom}</div>
                <Pill color={k.type==="test"?C.blue:C.green}>{k.type==="test"?"🧪 Test":"🟢 Live"}</Pill>
              </div>
              <div style={{fontFamily:"'Courier New',monospace",fontSize:12,color:C.muted,marginBottom:4}}>
                {visible[k.id]?k.key_value:(k.key_value||"").slice(0,12)+"••••••••••••••••••••••••"}
              </div>
              <div style={{fontSize:10,color:C.muted}}>{k.appels_mois||0}/{k.limite_mois||10000} appels ce mois</div>
            </div>
            <div style={{display:"flex",gap:6,marginLeft:12}}>
              <BtnGhost onClick={()=>setVisible(v=>({...v,[k.id]:!v[k.id]}))} style={{fontSize:10}}>{visible[k.id]?"🙈":"👁"}</BtnGhost>
              <BtnGhost onClick={()=>{navigator.clipboard?.writeText(k.key_value||"");showToast("✅ Clé copiée");}} style={{fontSize:10}}>📋</BtnGhost>
              <BtnGhost onClick={()=>revoquerKey(k.id)} style={{fontSize:10,color:C.red,borderColor:C.red+"33"}}>🔒 Révoquer</BtnGhost>
            </div>
          </div>
        </Card>)}
      </div>}
    </div>}

    {onglet==="webhooks"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <Btn onClick={()=>setShowWebhookForm(true)}>+ Ajouter un webhook</Btn>
      </div>
      {showWebhookForm&&<Card style={{marginBottom:14,borderColor:C.blue+"44"}}>
        <STitle>🔔 Nouveau webhook</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Nom *</label><Inp value={webhookForm.nom} onChange={e=>setWebhookForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: Zapier clients"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>URL *</label><Inp value={webhookForm.url} onChange={e=>setWebhookForm(f=>({...f,url:e.target.value}))} placeholder="https://hooks.zapier.com/..."/></div>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Événements</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {EVENEMENTS_DISPO.map(evt=><label key={evt} style={{display:"flex",gap:6,alignItems:"center",fontSize:11,cursor:"pointer",background:webhookForm.evenements.includes(evt)?C.blue+"15":"transparent",border:"1px solid "+(webhookForm.evenements.includes(evt)?C.blue:C.border),borderRadius:6,padding:"4px 10px"}}>
                <input type="checkbox" checked={webhookForm.evenements.includes(evt)} onChange={e=>{const evts=e.target.checked?[...webhookForm.evenements,evt]:webhookForm.evenements.filter(x=>x!==evt);setWebhookForm(f=>({...f,evenements:evts}));}} style={{accentColor:C.blue}}/>
                <span style={{color:webhookForm.evenements.includes(evt)?C.blue:C.muted}}>{evt}</span>
              </label>)}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={creerWebhook} style={{background:C.blue}}>✅ Créer</Btn><BtnGhost onClick={()=>setShowWebhookForm(false)}>Annuler</BtnGhost></div>
      </Card>}
      {webhooks.length===0?<Card style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8}}>🔔</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Aucun webhook</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Configurez des webhooks pour envoyer des événements vers vos outils.</div>
        <Btn onClick={()=>setShowWebhookForm(true)}>+ Ajouter</Btn>
      </Card>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {webhooks.map((wh,i)=><Card key={i} style={{borderColor:(wh.statut==="actif"?C.green:C.border)+"33"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{wh.nom}</div>
              <div style={{fontSize:11,color:C.muted}}>{wh.url}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <Pill color={wh.statut==="actif"?C.green:C.muted}>{wh.statut}</Pill>
              <BtnGhost onClick={()=>testerWebhook(wh)} style={{fontSize:10}}>🧪 Tester</BtnGhost>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {(wh.evenements||[]).map((evt,j)=><Pill key={j} color={C.blue}>{evt}</Pill>)}
          </div>
        </Card>)}
      </div>}
    </div>}

    {onglet==="logs"&&<Card>
      <STitle>📋 Logs des appels API — 50 derniers</STitle>
      {logs.length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucun appel enregistré.</div>:
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
          <thead><tr><TH>Date</TH><TH>Méthode</TH><TH>Endpoint</TH><TH>Status</TH><TH>Durée</TH><TH>Action</TH></tr></thead>
          <tbody>{logs.map((l,i)=><tr key={i} style={{background:l.statut_code>=400?C.red+"08":"transparent"}}>
            <Td style={{fontSize:10,color:C.muted}}>{new Date(l.created_at).toLocaleDateString("fr")}</Td>
            <Td><Pill color={methodeColor[l.methode]||C.blue}>{l.methode}</Pill></Td>
            <Td style={{fontFamily:"'Courier New',monospace",fontSize:11}}>{l.endpoint}</Td>
            <Td><Pill color={l.statut_code<300?C.green:l.statut_code<400?C.gold:C.red}>{l.statut_code}</Pill></Td>
            <Td style={{fontSize:11,color:l.duree_ms>500?C.orange:C.muted}}>{l.duree_ms||0}ms</Td>
            <Td>
              {l.statut_code>=400&&<div>
                <BtnGhost onClick={()=>expliquerErreur(l)} style={{fontSize:10,color:C.purple}}>🤖 Expliquer</BtnGhost>
                {explicationIA[l.id]&&<div style={{fontSize:10,color:C.text,marginTop:4,background:C.purple+"11",borderRadius:6,padding:"4px 8px",lineHeight:1.5}}>{explicationIA[l.id]}</div>}
              </div>}
            </Td>
          </tr>)}</tbody>
        </table>
      </div>}
    </Card>}

    {onglet==="docs"&&<div>
      <div style={{background:C.blue+"11",border:"1px solid "+C.blue+"33",borderRadius:10,padding:14,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.blue,marginBottom:6}}>🌐 URL de base</div>
        <div style={{fontFamily:"'Courier New',monospace",fontSize:13,color:C.text}}>https://xyraio.fr/api/v1</div>
        <div style={{fontSize:11,color:C.muted,marginTop:4}}>Header : Authorization: Bearer ty_live_...</div>
      </div>
      <Card style={{marginBottom:12}}>
        <STitle>📚 Endpoints disponibles</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Méthode</TH><TH>Endpoint</TH><TH>Description</TH></tr></thead>
          <tbody>{DOCS_ENDPOINTS.map((e,i)=><tr key={i}>
            <Td><Pill color={methodeColor[e.methode]||C.blue}>{e.methode}</Pill></Td>
            <Td style={{fontFamily:"'Courier New',monospace",fontSize:11}}>{e.path}</Td>
            <Td style={{fontSize:11,color:C.muted}}>{e.desc}</Td>
          </tr>)}</tbody>
        </table>
      </Card>
      <Card>
        <STitle>💡 Exemple d'appel curl</STitle>
        <div style={{background:C.dark,borderRadius:8,padding:16,fontFamily:"'Courier New',monospace",fontSize:12,lineHeight:1.8,color:C.green}}>
          <div style={{color:C.muted}}>{"// Récupérer vos clients"}</div>
          <div>{"curl -X GET \\"}</div>
          <div>{"  https://xyraio.fr/api/v1/clients \\"}</div>
          <div>{"  -H \"Authorization: Bearer ty_live_...\" \\"}</div>
          <div>{"  -H \"Content-Type: application/json\""}</div>
        </div>
      </Card>
    </div>}

    {onglet==="integrations"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
      {[
        {nom:"Zapier",logo:"⚡",desc:"Connectez Xyra à 5 000+ apps.",color:C.orange},
        {nom:"Make",logo:"🔄",desc:"Workflows visuels avancés.",color:C.purple},
        {nom:"n8n",logo:"🤖",desc:"Automatisation open-source.",color:C.green},
        {nom:"Notion",logo:"📓",desc:"Sync clients et deals.",color:C.text},
        {nom:"Slack",logo:"💬",desc:"Notifications en temps réel.",color:C.blue},
        {nom:"Google Sheets",logo:"📊",desc:"Export automatique des données.",color:C.green},
      ].map((app,i)=><Card key={i} style={{borderColor:app.color+"33"}}>
        <div style={{fontSize:28,marginBottom:8}}>{app.logo}</div>
        <div style={{fontSize:14,fontWeight:700,color:app.color,marginBottom:6}}>{app.nom}</div>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.6,marginBottom:12}}>{app.desc}</div>
        <Btn onClick={()=>showToast("🔗 Guide "+app.nom+" ouvert")} style={{width:"100%",fontSize:11,background:app.color+"22",color:app.color,border:"1px solid "+app.color+"44"}}>Connecter</Btn>
      </Card>)}
    </div>}

    {onglet==="sante"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Card>
        <STitle>❤ Score de santé API</STitle>
        <div style={{textAlign:"center",padding:"16px 0"}}>
          <div style={{fontSize:56,fontWeight:700,color:uptimeColor}}>{tauxSucces}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:12}}>/100</div>
          <SM val={tauxSucces} max={100} color={uptimeColor}/>
        </div>
        {[["Taux de succès",tauxSucces+"%",uptimeColor],["Latence moyenne",latenceMoy+"ms",latenceMoy<200?C.green:C.orange],["Clés actives",String(keys.length),C.blue],["Webhooks actifs",String(webhooks.filter(w=>w.statut==="actif").length),C.green]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"5px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
      </Card>
      <Card>
        <STitle>📊 Distribution statuts</STitle>
        {[[200,"2xx Succès",C.green],[400,"4xx Client Error",C.orange],[500,"5xx Server Error",C.red]].map(([code,label,color])=>{
          const count=logs.filter(l=>l.statut_code>=Number(code)&&l.statut_code<Number(code)+100).length;
          const pct=logs.length>0?Math.round(count/logs.length*100):0;
          return <div key={code} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color}}>{label}</span><span style={{color,fontWeight:700}}>{count} · {pct}%</span></div>
            <SM val={pct} max={100} color={color}/>
          </div>;
        })}
        {logs.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:12}}>Aucun log disponible.</div>}
      </Card>
    </div>}
  </div>;
};


// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────

export default PageAPI;
