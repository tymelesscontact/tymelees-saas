"use client";
import { useState, useEffect } from "react";
import { C, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM } from "../lib/ui";
import { hasAccess } from "../lib/plans";
import PageConversationsWhatsapp from "./PageConversationsWhatsapp";

const PageLea=({showToast,leads,profil})=>{
  const ASSISTANT_ID="715e757d-93e7-423a-a6f1-18a77bb19e94";
  const PHONE_ID="+12526754837";
  const[calls,setCalls]=useState([]);
  const[loading,setLoading]=useState(false);
  const[activeCall,setActiveCall]=useState(null);
  const[onglet,setOnglet]=useState("appel");
  const[campagneActive,setCampagneActive]=useState(false);
  const[campagneProgress,setCampagneProgress]=useState(0);
  const[nom,setNom]=useState("");
  const[tel,setTel]=useState("");
  const[societe,setSociete]=useState("");
  const[service,setService]=useState("");
  const leadsValides=(leads||[]).filter(l=>l&&l.tel);

  useEffect(()=>{
    fetch('/api/prospection?action=calls')
      .then(r=>r.json())
      .then(d=>{if(d&&d.calls&&Array.isArray(d.calls))setCalls(d.calls);})
      .catch(e=>console.error(e));
  },[]);

  const lancerAppel=async()=>{
    if(!tel)return showToast("⚠️ Entrez le numéro");
    if(!nom)return showToast("⚠️ Entrez le nom");
    setLoading(true);
    try{
      const res=await fetch('/api/prospection',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'call',
          tel,nom,societe:societe||nom,
          service,secteur:profil?.label||"Services",
          phoneNumberId:PHONE_ID,
          assistantId:ASSISTANT_ID,
        }),
      });
      const data=await res.json();
      if(data.success){
        setActiveCall(data.call);
        showToast("🎙 Lea appelle "+nom+" !");
        setNom("");setTel("");setSociete("");setService("");
      }else{
        showToast("❌ "+(data.error||"Erreur Vapi"));
      }
    }catch(e){showToast("❌ Erreur connexion");}
    setLoading(false);
  };

  const appellerLead=async(lead)=>{
    if(!lead.tel)return showToast("⚠️ Pas de numéro");
    setLoading(true);
    try{
      const res=await fetch('/api/prospection',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'call',
          tel:lead.tel,nom:lead.nom,
          societe:lead.nom,
          secteur:lead.secteur||profil?.label||"Services",
          service:profil?.services?.[0]||"",
          phoneNumberId:PHONE_ID,
          assistantId:ASSISTANT_ID,
        }),
      });
      const data=await res.json();
      if(data.success)showToast("🎙 Lea appelle "+lead.nom+" !");
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
    setLoading(false);
  };

  const lancerCampagne=async()=>{
    if(leadsValides.length===0)return showToast("⚠️ Aucun lead avec numéro");
    setCampagneActive(true);
    let nb=0;
    for(const lead of leadsValides.slice(0,10)){
      try{
        await fetch('/api/prospection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'call',tel:lead.tel,nom:lead.nom,societe:lead.nom,secteur:lead.secteur||"Services",service:"",phoneNumberId:PHONE_ID,assistantId:ASSISTANT_ID})});
        nb++;
        setCampagneProgress(Math.round((nb/Math.min(10,leadsValides.length))*100));
        await new Promise(r=>setTimeout(r,2000));
      }catch(e){}
    }
    setCampagneActive(false);
    setCampagneProgress(0);
    showToast("✅ Campagne terminée — "+nb+" appels lancés !");
  };

  const tabs=[{id:"appel",label:"📞 Appel direct"},{id:"leads",label:"🎯 Leads"},{id:"campagne",label:"🚀 Campagne"},{id:"historique",label:"📋 Historique"}];

  return <div style={{padding:4}}>
    {/* Header */}
    <div style={{background:`linear-gradient(135deg,${C.purple}22,${C.card})`,border:`1px solid ${C.purple}44`,borderRadius:14,padding:18,marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:`${C.purple}33`,border:`2px solid ${C.purple}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🎙</div>
      <div style={{flex:1}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Lea — Agent Vocal IA</div>
        <div style={{fontSize:11,color:C.muted}}>Vapi · Multilingue · Sortant & Entrant & Relances</div>
        <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
          <span style={{fontSize:10,background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`,borderRadius:20,padding:"2px 8px"}}>● Actif</span>
          <span style={{fontSize:10,background:`${C.blue}22`,color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:20,padding:"2px 8px"}}>📞 {PHONE_ID}</span>
          <span style={{fontSize:10,background:`${C.gold}22`,color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:20,padding:"2px 8px"}}>🌍 Multilingue auto</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {[[calls.length,"Appels",C.blue],[calls.filter(c=>c.status==="ended").length,"Complétés",C.green]].map(([v,l,c],i)=>(
          <div key={i} style={{background:C.card2,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:9,color:C.muted}}>{l}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Appel en cours */}
    {activeCall&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}44`,borderRadius:8,padding:12,marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:10,height:10,borderRadius:"50%",background:C.green}}/>
      <span style={{fontSize:12,color:C.green,fontWeight:600}}>🎙 Lea est en appel maintenant</span>
      <BtnGhost onClick={()=>setActiveCall(null)} style={{marginLeft:"auto",fontSize:10}}>✕</BtnGhost>
    </div>}

    {/* Tabs */}
    <div style={{display:"flex",gap:4,marginBottom:14,background:C.card2,borderRadius:8,padding:4}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{flex:1,background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.purple:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"7px 4px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?700:400}}>{t.label}</button>)}
    </div>

    {/* APPEL DIRECT */}
    {onglet==="appel"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <CT>
        <STitle>📞 Lancer un appel</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
          <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Nom *</label><Inp value={nom} onChange={e=>setNom(e.target.value)} placeholder="M. Dupont"/></div>
          <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Téléphone * (+33...)</label><Inp value={tel} onChange={e=>setTel(e.target.value)} placeholder="+33612345678"/></div>
          <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Société</label><Inp value={societe} onChange={e=>setSociete(e.target.value)} placeholder="Nom de la société"/></div>
          <div><label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Service à présenter</label><Inp value={service} onChange={e=>setService(e.target.value)} placeholder="Ex: Nettoyage bureaux"/></div>
        </div>
        <button onClick={lancerAppel} disabled={loading||!tel||!nom} style={{width:"100%",background:loading||!tel||!nom?C.muted:`linear-gradient(135deg,${C.purple},#6B3FCC)`,color:"#fff",border:"none",borderRadius:8,padding:"13px",cursor:loading?"not-allowed":"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit"}}>
          {loading?"⏳ Lea appelle...":"🎙 Lea appelle maintenant"}
        </button>
      </CT>
      <CT style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
        <STitle>🤖 Ce que fait Lea</STitle>
        {["Se présente en votre nom","Qualifie les besoins du prospect","Présente votre offre","Gère les objections","Fixe un RDV concret","Détecte la langue automatiquement","Ne révèle jamais être une IA","Relance si pas de réponse"].map((f,i)=>(
          <div key={i} style={{display:"flex",gap:8,fontSize:11,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
            <span style={{color:C.purple}}>✦</span><span style={{color:C.text}}>{f}</span>
          </div>
        ))}
      </CT>
    </div>}

    {/* LEADS */}
    {onglet==="leads"&&<div>
      {leadsValides.length===0?<div style={{textAlign:"center",padding:40,color:C.muted}}>
        <div style={{fontSize:36,marginBottom:8}}>🎯</div>
        <div style={{fontWeight:600,marginBottom:4}}>Aucun lead avec numéro</div>
        <div style={{fontSize:11}}>Faites une recherche SIRENE dans l'onglet ci-dessus</div>
      </div>:(leads||[]).map((l,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${l.tel?C.border:C.red+"33"}`}}>
          <div>
            <div style={{fontSize:12,fontWeight:700}}>{l.nom}</div>
            <div style={{fontSize:10,color:C.muted}}>{l.secteur} · {l.ville}</div>
            <div style={{fontSize:10,color:l.tel?C.green:C.red}}>{l.tel||"⚠️ Pas de numéro"}</div>
          </div>
          <button onClick={()=>appellerLead(l)} disabled={loading||!l.tel} style={{background:l.tel?C.purple:"#333",color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",cursor:l.tel?"pointer":"not-allowed",fontSize:11,fontFamily:"inherit",fontWeight:600}}>🎙 Appeler</button>
        </div>
      ))}
    </div>}

    {/* CAMPAGNE */}
    {onglet==="campagne"&&<CT>
      <STitle>🚀 Campagne automatique</STitle>
      <div style={{fontSize:11,color:C.muted,lineHeight:1.8,marginBottom:14}}>
        Lea appelle automatiquement jusqu'à <b style={{color:C.text}}>10 leads</b> en séquence. 2 secondes entre chaque appel.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:C.card,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:C.blue}}>{(leads||[]).length}</div><div style={{fontSize:9,color:C.muted}}>Leads total</div></div>
        <div style={{background:C.card,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:C.green}}>{leadsValides.length}</div><div style={{fontSize:9,color:C.muted}}>Avec téléphone</div></div>
      </div>
      {campagneActive&&<div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
          <span style={{color:C.purple,fontWeight:600}}>🎙 Campagne en cours...</span>
          <span>{campagneProgress}%</span>
        </div>
        <div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:campagneProgress+"%",background:C.purple,borderRadius:4,transition:"width .5s"}}/>
        </div>
      </div>}
      <button onClick={lancerCampagne} disabled={campagneActive||leadsValides.length===0} style={{width:"100%",background:campagneActive||leadsValides.length===0?C.muted:`linear-gradient(135deg,${C.purple},#6B3FCC)`,color:"#fff",border:"none",borderRadius:8,padding:"13px",cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit"}}>
        {campagneActive?`⏳ ${campagneProgress}%`:`🚀 Lancer (${Math.min(10,leadsValides.length)} appels)`}
      </button>
    </CT>}

    {/* HISTORIQUE */}
    {onglet==="historique"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
        <CT style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:C.blue}}>{calls.length}</div><div style={{fontSize:9,color:C.muted}}>Total</div></CT>
        <CT style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:C.green}}>{calls.filter(c=>c.status==="ended").length}</div><div style={{fontSize:9,color:C.muted}}>Complétés</div></CT>
        <CT style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:C.gold}}>{calls.length>0?Math.round(calls.filter(c=>c.duration).reduce((a,c)=>a+(c.duration||0),0)/Math.max(1,calls.filter(c=>c.duration).length))+"s":"—"}</div><div style={{fontSize:9,color:C.muted}}>Durée moy.</div></CT>
      </div>
      {calls.length===0?<div style={{textAlign:"center",padding:40,color:C.muted}}>
        <div style={{fontSize:32,marginBottom:8}}>📋</div>
        <div>Aucun appel pour le moment</div>
      </div>:<Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Prospect</TH><TH>Numéro</TH><TH>Date</TH><TH>Durée</TH><TH>Statut</TH></tr></thead>
          <tbody>{calls.slice(0,20).map((c,i)=>(
            <tr key={i}>
              <Td style={{fontWeight:600}}>{c.customer?.name||"—"}</Td>
              <Td style={{fontSize:10,color:C.muted}}>{c.customer?.number||"—"}</Td>
              <Td style={{fontSize:10,color:C.muted}}>{c.createdAt?new Date(c.createdAt).toLocaleString("fr"):"—"}</Td>
              <Td style={{color:C.blue}}>{c.duration?c.duration+"s":"—"}</Td>
              <Td><Pill color={c.status==="ended"?C.green:c.status==="in-progress"?C.gold:C.muted}>{c.status==="ended"?"✓ Terminé":c.status==="in-progress"?"● En cours":c.status||"—"}</Pill></Td>
            </tr>
          ))}</tbody>
        </table>
      </Card>}
    </div>}
  </div>;
};


const BotWhatsAppTab=()=>{
  const[stats,setStats]=useState<any>(null);
  const[loading,setLoading]=useState(true);
  const[vue,setVue]=useState("resume");

  useEffect(()=>{
    fetch("/api/prospection").then(r=>r.json()).then(d=>{
      setStats(d);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  return <div>
    <div style={{display:"flex",gap:6,marginBottom:14}}>
      <button onClick={()=>setVue("resume")} style={{flex:1,background:vue==="resume"?C.card:"transparent",color:vue==="resume"?C.purple:C.muted,border:`1px solid ${vue==="resume"?C.border:"transparent"}`,borderRadius:6,padding:"8px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:vue==="resume"?700:400}}>📊 Resume</button>
      <button onClick={()=>setVue("conversations")} style={{flex:1,background:vue==="conversations"?C.card:"transparent",color:vue==="conversations"?C.purple:C.muted,border:`1px solid ${vue==="conversations"?C.border:"transparent"}`,borderRadius:6,padding:"8px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:vue==="conversations"?700:400}}>💬 Conversations</button>
    </div>
    {vue==="resume"&&<Card><STitle>🤖 Bot WhatsApp — Lea</STitle>
      {loading?<div style={{padding:20,textAlign:"center",color:C.muted,fontSize:12}}>Chargement...</div>:(
        <>
          <div style={{background:stats?.statutConnexion?`${C.green}11`:`${C.red}11`,border:`1px solid ${stats?.statutConnexion?C.green:C.red}33`,borderRadius:10,padding:14,marginBottom:14}}>
            <div style={{fontSize:11,color:stats?.statutConnexion?C.green:C.red,fontWeight:600,marginBottom:4}}>
              {stats?.statutConnexion?"● Bot actif · Connecte a Meta API":"○ Bot non connecte"}
            </div>
            {stats?.conversationsEnAttente>0&&(
              <div style={{fontSize:12,color:C.orange,marginTop:6}}>
                ⚠ {stats.conversationsEnAttente} conversation{stats.conversationsEnAttente>1?"s":""} en attente de reponse
              </div>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            <KPI label="Conversations" val={stats?.totalConversations||0} color={C.blue}/>
            <KPI label="Taux reponse Lea" val={(stats?.tauxReponse||0)+"%"} color={C.green}/>
            <KPI label="Devis generes" val={stats?.devisGeneres||0} color={C.gold}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            <KPI label="Devis acceptes" val={stats?.devisAcceptes||0} color={C.purple}/>
            <KPI label="Montant total genere" val={(stats?.montantTotal||0)+" €"} color={C.teal}/>
          </div>
        </>
      )}
    </Card>}
    {vue==="conversations"&&<PageConversationsWhatsapp/>}
  </div>;
};

// ─── PAGE PROSPECTION ─────────────────────────────────────────
const PageProspection=({plan,showToast,profil=null,UpgradeWall})=>{
  const[onglet,setOnglet]=useState("sirene");
  const[query,setQuery]=useState("");
  const[leads,setLeads]=useState([{nom:"Syndic Lebrun SARL",secteur:"Syndic",ville:"Créteil",tel:"01 45 67 89 01",email:"contact@lebrun.fr",score:88},{nom:"Cabinet Moreau Gestion",secteur:"Gestion immo",ville:"Ivry-sur-Seine",tel:"01 56 78 90 12",email:"info@moreau-gestion.fr",score:74},{nom:"Résidences du Val",secteur:"Bailleur social",ville:"Villejuif",tel:"01 67 89 01 23",email:"rh@residences-val.fr",score:91},{nom:"SCI Châtillon",secteur:"SCI / Investisseurs",ville:"Châtillon",tel:"01 78 90 12 34",email:"sci@chatillon.fr",score:67}]);
  const tabs=[{id:"sirene",label:"🏢 SIRENE / Leads"},{id:"sequences",label:"📧 Séquences"},{id:"bot",label:"🤖 Bot WhatsApp"},{id:"vocal",label:"🎙 Lea"},{id:"linkedin",label:"💼 LinkedIn"},{id:"stats",label:"📊 Stats"}];
  if(!hasAccess(plan,"prospection"))return <div style={{padding:20}}><UpgradeWall page="Prospection Auto" plan={plan}/></div>;
  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>⊕ Prospection Automatique</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>SIRENE · Bot vocal · Bot WhatsApp · LinkedIn · 59 fonctionnalités</div>
    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>
    {onglet==="sirene"&&<>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <Inp value={query} onChange={e=>setQuery(e.target.value)} placeholder="🔍 Rechercher dans SIRENE (syndic, gestion, immo...)" style={{flex:1}}/>
        <Sel style={{width:160}}><option>Val-de-Marne (94)</option><option>Paris (75)</option><option>Hauts-de-Seine (92)</option><option>Seine-Saint-Denis (93)</option></Sel>
        <Btn onClick={()=>showToast("🔍 Recherche SIRENE lancée — 47 résultats trouvés !")}>Rechercher</Btn>
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <STitle>🎯 Leads qualifiés</STitle>
          <Btn onClick={()=>showToast("✅ Séquence envoyée à tous les leads !")} style={{fontSize:11,padding:"6px 12px"}}>📧 Envoyer séquence à tous</Btn>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Entreprise</TH><TH>Secteur</TH><TH>Ville</TH><TH>Score IA</TH><TH>Actions</TH></tr></thead>
          <tbody>{leads.map((l,i)=><tr key={i}>
            <Td style={{fontWeight:700}}>{l.nom}</Td>
            <Td><Pill color={C.blue}>{l.secteur}</Pill></Td>
            <Td style={{color:C.muted}}>{l.ville}</Td>
            <Td><div style={{display:"flex",alignItems:"center",gap:6}}><SM val={l.score} max={100} color={l.score>=80?C.green:C.gold}/><span style={{color:l.score>=80?C.green:C.gold,fontWeight:700}}>{l.score}</span></div></Td>
            <Td><div style={{display:"flex",gap:4}}>
              <Btn onClick={()=>showToast(`📱 WhatsApp envoyé à ${l.nom}`)} style={{padding:"4px 8px",fontSize:10}}>WA</Btn>
              <BtnGhost onClick={()=>showToast(`📞 Appel vocal ${l.nom}`)} style={{padding:"4px 8px",fontSize:10}}>📞</BtnGhost>
              <BtnGhost onClick={()=>showToast(`📧 Email envoyé à ${l.email}`)} style={{padding:"4px 8px",fontSize:10}}>✉️</BtnGhost>
            </div></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </>}
    {onglet==="sequences"&&<Card><STitle>📧 Séquences de prospection automatiques</STitle>
      {[{nom:"Séquence Syndics 94",etapes:["J0: Email découverte","J3: Relance WhatsApp","J7: Appel vocal","J14: Offre personnalisée"],taux:34,envoyes:47,ouverts:29},
        {nom:"Séquence Immobilier Premium",etapes:["J0: LinkedIn + Email","J2: WhatsApp","J5: Email étude de cas","J10: RDV proposé"],taux:28,envoyes:23,ouverts:15}].map((s,i)=><div key={i} style={{background:C.card2,borderRadius:10,padding:14,marginBottom:10,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:13,fontWeight:700}}>{s.nom}</div><Pill color={C.green}>Taux: {s.taux}%</Pill></div>
        <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>{s.etapes.map((e,j)=><Pill key={j} color={C.blue}>{e}</Pill>)}</div>
        <div style={{fontSize:11,color:C.muted}}>📨 {s.envoyes} envoyés · 👁 {s.ouverts} ouverts</div>
        <Btn onClick={()=>showToast("✅ Séquence activée !")} style={{marginTop:8,fontSize:11}}>▶ Activer</Btn>
      </div>)}
    </Card>}
    {onglet==="bot"&&<BotWhatsAppTab/>}
    {onglet==="vocal"&&<PageLea showToast={showToast} leads={leads} profil={profil}/>}
    {onglet==="linkedin"&&<Card><STitle>💼 Prospection LinkedIn</STitle>
      <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Envoi de messages LinkedIn automatiques via extension Chrome</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <KPI label="Connexions envoyées" val="84" color={C.blue}/>
        <KPI label="Acceptées" val="31" color={C.green}/>
        <KPI label="Messages envoyés" val="27" color={C.gold}/>
        <KPI label="RDV générés" val="4" color={C.teal}/>
      </div>
    </Card>}
    {onglet==="stats"&&<Card><STitle>📊 Performance prospection globale</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <KPI label="Leads générés" val="71" color={C.blue}/>
        <KPI label="Taux conversion global" val="12%" color={C.green}/>
        <KPI label="CA généré" val="8 400 €" color={C.gold}/>
      </div>
    </Card>}
  </div>;
};

// ─── PAGE STOCK ───────────────────────────────────────────────

export default PageProspection;
