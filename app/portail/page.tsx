"use client";
import { useState } from "react";

// ─── PALETTE ──────────────────────────────────────────────────
const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
};

// ─── COMPTES DE DEMO ──────────────────────────────────────────
const COMPTES = [
  { email:"sofia@vip.ae",       password:"xyra123", type:"client",    nom:"Sofia Al-Rashid",    avatar:"S", couleur:C.gold   },
  { email:"marc@dupont.fr",     password:"xyra123", type:"client",    nom:"Marc Dupont",         avatar:"M", couleur:C.blue   },
  { email:"thomas@partner.fr",  password:"xyra123", type:"apporteur", nom:"Thomas Beaumont",     avatar:"T", couleur:C.green  },
  { email:"fatou@dakar.sn",     password:"xyra123", type:"apporteur", nom:"Fatoumata Diop",      avatar:"F", couleur:C.purple },
  { email:"leila@partner.fr",   password:"xyra123", type:"apporteur", nom:"Leila Mansouri",      avatar:"L", couleur:C.orange },
];

// ─── ATOMS ────────────────────────────────────────────────────
const Btn=({children,onClick,color=C.gold,style={}})=><button onClick={onClick} style={{background:color,color:color===C.gold||color===C.green?"#000":"#fff",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",width:"100%",...style}}>{children}</button>;
const BtnGhost=({children,onClick,style={}})=><button onClick={onClick} style={{background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 18px",cursor:"pointer",fontSize:12,fontFamily:"inherit",...style}}>{children}</button>;
const Card=({children,style={}})=><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,...style}}>{children}</div>;
const CT=({children,style={}})=><div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:14,...style}}>{children}</div>;
const Pill=({children,color=C.gold})=><span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{children}</span>;
const SM=({val,max,color=C.green})=><div style={{height:5,borderRadius:3,background:C.border,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(val/max)*100)}%`,background:color,borderRadius:3}}/></div>;
const fmt=(m)=>Number(m).toLocaleString("fr",{minimumFractionDigits:0,maximumFractionDigits:0})+" €";

const Tab=({tabs,active,onChange})=><div style={{display:"flex",gap:4,background:C.card2,borderRadius:10,padding:4,flexWrap:"wrap",marginBottom:20}}>
  {tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{background:active===t.id?C.card:"transparent",color:active===t.id?C.gold:C.muted,border:active===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:active===t.id?700:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
</div>;

// ─── ÉCRAN DE CONNEXION ───────────────────────────────────────
const Login=({onLogin})=>{
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[error,setError]=useState("");
  const[loading,setLoading]=useState(false);

  const handleLogin=()=>{
    setLoading(true);
    setTimeout(()=>{
      const compte=COMPTES.find(c=>c.email===email.toLowerCase()&&c.password===password);
      if(compte){ onLogin(compte); }
      else{ setError("Email ou mot de passe incorrect."); setLoading(false); }
    },800);
  };

  return <div style={{minHeight:"100vh",background:C.dark,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
    <div style={{width:"100%",maxWidth:420,padding:24}}>
      {/* Logo */}
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:28,fontWeight:700,color:C.gold,letterSpacing:"0.15em",fontFamily:"Georgia,serif"}}>XYRA</div>
        <div style={{fontSize:11,color:C.muted,letterSpacing:"0.2em",marginTop:4}}>PORTAIL · ESPACE PERSONNEL</div>
      </div>

      <Card style={{padding:32}}>
        <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:4,fontFamily:"Georgia,serif"}}>Connexion</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:24}}>Accédez à votre espace personnel Xyra</div>

        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Adresse email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.com" type="email"
            style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Mot de passe</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password"
            style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
        </div>

        {error&&<div style={{background:`${C.red}15`,border:`1px solid ${C.red}33`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.red,marginBottom:16}}>⚠️ {error}</div>}

        <Btn onClick={handleLogin} style={{marginBottom:16}}>{loading?"Connexion en cours...":"Se connecter"}</Btn>

        <div style={{fontSize:11,color:C.muted,textAlign:"center"}}>Vous n'avez pas encore accès ? Contactez Xyra sur <span style={{color:C.gold}}>contact@xyra.io</span></div>
      </Card>

      {/* Comptes démo */}
      <div style={{marginTop:20,background:`${C.gold}08`,border:`1px solid ${C.gold}22`,borderRadius:12,padding:16}}>
        <div style={{fontSize:10,color:C.gold,fontWeight:700,letterSpacing:"0.1em",marginBottom:10}}>COMPTES DÉMO</div>
        {COMPTES.map((c,i)=><div key={i} onClick={()=>{setEmail(c.email);setPassword(c.password);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",cursor:"pointer",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
          <span style={{color:C.text}}>{c.email}</span>
          <Pill color={c.type==="client"?C.blue:C.green}>{c.type==="client"?"Client":"Apporteur"}</Pill>
        </div>)}
        <div style={{fontSize:10,color:C.muted,marginTop:8}}>Mot de passe : <span style={{color:C.gold,fontFamily:"monospace"}}>xyra123</span></div>
      </div>
    </div>
  </div>;
};

// ─── PORTAIL CLIENT ───────────────────────────────────────────
const PortailClient=({user,onLogout,showToast})=>{
  const[page,setPage]=useState("accueil");

  const devis=[
    {id:"TYM-0042",service:"Jet privé Paris → Dubai",montant:2400,date:"13/04/2026",statut:"validé",facture:true},
    {id:"TYM-0038",service:"Nettoyage résidentiel mensuel",montant:480,date:"01/04/2026",statut:"validé",facture:true},
    {id:"TYM-0044",service:"Nettoyage Airbnb — Montmartre",montant:320,date:"15/04/2026",statut:"en_attente",facture:false},
  ];
  const missions=[
    {id:"M-001",service:"Nettoyage Airbnb Montmartre",date:"15/04/2026",heure:"09:00",equipe:"Thomas Beaumont",statut:"en cours",progression:65,adresse:"12 rue Lepic, 75018 Paris"},
    {id:"M-002",service:"Jet privé Paris → Dubai",date:"18/04/2026",heure:"06:30",equipe:"—",statut:"confirmé",progression:0,adresse:"Le Bourget"},
    {id:"M-003",service:"Nettoyage résidentiel",date:"01/04/2026",heure:"10:00",equipe:"Abou Diallo",statut:"terminé",progression:100,adresse:"75016 Paris"},
  ];
  const histo=[
    {date:"13/04/2026",libelle:"Jet privé Paris → Dubai",montant:2400,statut:"payé"},
    {date:"01/04/2026",libelle:"Nettoyage résidentiel mars",montant:480,statut:"payé"},
    {date:"01/03/2026",libelle:"Nettoyage résidentiel fév.",montant:480,statut:"payé"},
  ];

  const nav=[
    {id:"accueil",icon:"🏠",label:"Accueil"},
    {id:"devis",icon:"◧",label:"Devis & Factures"},
    {id:"missions",icon:"📍",label:"Mes missions"},
    {id:"paiement",icon:"💳",label:"Payer en ligne"},
    {id:"historique",icon:"📋",label:"Historique"},
    {id:"contact",icon:"💬",label:"Contacter Xyra"},
    {id:"avis",icon:"⭐",label:"Donner un avis"},
  ];

  return <div style={{display:"flex",minHeight:"100vh",background:C.dark,fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.text}}>
    {/* Sidebar */}
    <div style={{width:220,background:C.card,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"18px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:14,fontWeight:700,color:C.gold,letterSpacing:"0.1em",fontFamily:"Georgia,serif"}}>XYRA</div>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.2em",marginTop:2}}>ESPACE CLIENT</div>
      </div>
      <div style={{padding:"12px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:user.couleur+"22",border:`2px solid ${user.couleur}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:user.couleur}}>{user.avatar}</div>
        <div><div style={{fontSize:12,fontWeight:700,color:C.text}}>{user.nom}</div><div style={{fontSize:9,color:C.green}}>● Client Xyra</div></div>
      </div>
      <div style={{flex:1,padding:"8px 0"}}>
        {nav.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",cursor:"pointer",color:page===n.id?C.gold:"#C0C0D8",background:page===n.id?`${C.gold}0E`:"transparent",border:"none",borderLeft:`2px solid ${page===n.id?C.gold:"transparent"}`,width:"100%",textAlign:"left",fontFamily:"inherit",fontSize:12,fontWeight:page===n.id?700:400}}>
          <span>{n.icon}</span>{n.label}
        </button>)}
      </div>
      <div style={{padding:14,borderTop:`1px solid ${C.border}`}}>
        <BtnGhost onClick={onLogout} style={{width:"100%",fontSize:11}}>← Déconnexion</BtnGhost>
      </div>
    </div>

    {/* Contenu */}
    <div style={{flex:1,overflowY:"auto"}}>
      {/* Accueil */}
      {page==="accueil"&&<div style={{padding:24}}>
        <div style={{background:`linear-gradient(135deg,${C.card},#0A1A14)`,border:`1px solid ${C.gold}33`,borderRadius:16,padding:24,marginBottom:20}}>
          <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",marginBottom:6}}>XYRA · ESPACE PERSONNEL</div>
          <div style={{fontSize:24,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>Bonjour {user.nom.split(" ")[0]} 👋</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Bienvenue dans votre espace client Xyra</div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            <div style={{borderLeft:`2px solid ${C.gold}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Total facturé</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(histo.reduce((a,h)=>a+h.montant,0))}</div></div>
            <div style={{borderLeft:`2px solid ${C.green}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Missions</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{missions.length}</div></div>
            <div style={{borderLeft:`2px solid ${C.blue}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Devis en attente</div><div style={{fontSize:16,fontWeight:700,color:C.blue}}>{devis.filter(d=>d.statut==="en_attente").length}</div></div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>📍 Mission en cours</div>
            {missions.filter(m=>m.statut==="en cours").map((m,i)=><div key={i} style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{m.service}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>📅 {m.date} à {m.heure} · 👤 {m.equipe}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:10}}>📍 {m.adresse}</div>
              <div style={{marginBottom:4,display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:C.muted}}>Progression</span><span style={{color:C.green,fontWeight:700}}>{m.progression}%</span></div>
              <SM val={m.progression} max={100} color={C.green}/>
            </div>)}
          </Card>
          <Card>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>◧ Devis en attente</div>
            {devis.filter(d=>d.statut==="en_attente").map((d,i)=><div key={i} style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:14}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{d.service}</div>
              <div style={{fontSize:18,fontWeight:700,color:C.gold,marginBottom:10}}>{fmt(d.montant)}</div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>showToast("✅ Devis signé — Xyra vous contacte !")} style={{flex:1,padding:"8px 10px",fontSize:11}}>✅ Signer</Btn>
                <BtnGhost onClick={()=>setPage("contact")} style={{flex:1,fontSize:11}}>💬 Question</BtnGhost>
              </div>
            </div>)}
          </Card>
        </div>
      </div>}

      {/* Devis & Factures */}
      {page==="devis"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>◧ Devis & Factures</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Retrouvez tous vos documents Xyra</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {devis.map((d,i)=><Card key={i} style={{borderColor:d.statut==="en_attente"?`${C.orange}44`:C.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{d.service}</div>
                <div style={{fontSize:11,color:C.muted}}>Réf. {d.id} · {d.date}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:22,fontWeight:700,color:C.gold}}>{fmt(d.montant)}</div>
                <Pill color={d.statut==="validé"?C.green:C.orange}>{d.statut==="validé"?"✓ Validé":"⏳ En attente"}</Pill>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              {d.statut==="en_attente"&&<Btn onClick={()=>showToast("✅ Devis signé électroniquement !")} style={{flex:1,fontSize:12}}>✅ Signer le devis</Btn>}
              {d.facture&&<BtnGhost onClick={()=>showToast("📄 Facture PDF téléchargée")} style={{flex:1,fontSize:12}}>📄 Télécharger facture PDF</BtnGhost>}
              <BtnGhost onClick={()=>showToast("📱 Envoyé sur WhatsApp")} style={{flex:1,fontSize:12}}>📱 Recevoir sur WhatsApp</BtnGhost>
            </div>
          </Card>)}
        </div>
      </div>}

      {/* Missions */}
      {page==="missions"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>📍 Mes missions</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Suivi en temps réel de toutes vos missions Xyra</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {missions.map((m,i)=>{
            const sc=m.statut==="terminé"?C.green:m.statut==="en cours"?C.gold:C.blue;
            return <Card key={i} style={{borderColor:`${sc}33`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{m.service}</div>
                  <div style={{fontSize:11,color:C.muted}}>📅 {m.date} à {m.heure}</div>
                  <div style={{fontSize:11,color:C.muted}}>📍 {m.adresse}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>👤 Responsable : <b style={{color:C.text}}>{m.equipe}</b></div>
                </div>
                <Pill color={sc}>{m.statut==="terminé"?"✓ Terminée":m.statut==="en cours"?"⚡ En cours":"📅 Confirmée"}</Pill>
              </div>
              {m.statut==="en cours"&&<>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:6}}><span style={{color:C.muted}}>Progression de la mission</span><span style={{color:C.green,fontWeight:700}}>{m.progression}%</span></div>
                <SM val={m.progression} max={100} color={C.green}/>
              </>}
              {m.statut==="terminé"&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,marginTop:4,fontSize:12,color:C.green}}>✅ Mission terminée avec succès · <span style={{color:C.text,cursor:"pointer"}} onClick={()=>setPage("avis")}>Donnez votre avis →</span></div>}
            </Card>;
          })}
        </div>
      </div>}

      {/* Paiement en ligne */}
      {page==="paiement"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>💳 Payer en ligne</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Règlement sécurisé via Flutterwave · Wave · Carte bancaire</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div>
            {devis.filter(d=>d.statut==="en_attente"||d.statut==="validé").map((d,i)=><Card key={i} style={{marginBottom:10,cursor:"pointer",borderColor:`${C.gold}33`}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{d.service}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Réf. {d.id}</div>
              <div style={{fontSize:22,fontWeight:700,color:C.gold,marginBottom:10}}>{fmt(d.montant)}</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[{m:"💳 Carte bancaire",c:C.blue},{m:"🌊 Wave",c:C.teal},{m:"🟠 Orange Money",c:C.orange},{m:"🏦 Virement SEPA",c:C.green}].map((p,j)=><button key={j} onClick={()=>showToast(`✅ Paiement de ${fmt(d.montant)} via ${p.m} initié !`)} style={{background:`${p.c}15`,color:p.c,border:`1px solid ${p.c}33`,borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,textAlign:"left"}}>{p.m}</button>)}
              </div>
            </Card>)}
          </div>
          <Card style={{background:`${C.green}08`,borderColor:`${C.green}33`}}>
            <div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:"0.1em",marginBottom:12}}>🔒 PAIEMENT SÉCURISÉ</div>
            {[["Chiffrement","SSL 256 bits · Flutterwave"],["Devises acceptées","EUR · XOF · USD · AED · GBP"],["Méthodes","Carte · Wave · Orange Money · SEPA"],["Reçu","Automatique par email + WhatsApp"],["Remboursement","Sous 5 jours ouvrés si annulation"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{k}</span><span style={{color:C.text,fontWeight:600}}>{v}</span></div>)}
          </Card>
        </div>
      </div>}

      {/* Historique */}
      {page==="historique"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>📋 Historique complet</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Toutes vos transactions et missions avec Xyra</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>Total dépensé</div><div style={{fontSize:20,fontWeight:700,color:C.gold}}>{fmt(histo.reduce((a,h)=>a+h.montant,0))}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>Missions réalisées</div><div style={{fontSize:20,fontWeight:700,color:C.green}}>{missions.filter(m=>m.statut==="terminé").length}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>Années client</div><div style={{fontSize:20,fontWeight:700,color:C.blue}}>2</div></CT>
        </div>
        <Card>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Date","Prestation","Montant","Statut","Action"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
            <tbody>{histo.map((h,i)=><tr key={i}>
              <td style={{padding:"10px",fontSize:11,borderBottom:`1px solid ${C.border}22`,color:C.muted}}>{h.date}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:`1px solid ${C.border}22`,fontWeight:600}}>{h.libelle}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:`1px solid ${C.border}22`,color:C.green,fontWeight:700}}>{fmt(h.montant)}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:`1px solid ${C.border}22`}}><Pill color={C.green}>{h.statut}</Pill></td>
              <td style={{padding:"10px",fontSize:12,borderBottom:`1px solid ${C.border}22`}}><BtnGhost onClick={()=>showToast("📄 Facture PDF téléchargée")} style={{fontSize:10,padding:"4px 10px"}}>📄 Facture</BtnGhost></td>
            </tr>)}</tbody>
          </table>
        </Card>
      </div>}

      {/* Contact */}
      {page==="contact"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>💬 Contacter Xyra</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Notre équipe répond en moins de 2h</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14,fontWeight:600}}>Envoyer un message</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Sujet</label>
                <select style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:12,fontFamily:"inherit",width:"100%"}}>
                  <option>Question sur un devis</option><option>Modification d'une mission</option><option>Problème / Réclamation</option><option>Demande de nouveau service</option><option>Autre</option>
                </select>
              </div>
              <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Message</label>
                <textarea placeholder="Votre message..." rows={5} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:12,fontFamily:"inherit",width:"100%",resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <Btn onClick={()=>showToast("✅ Message envoyé ! Réponse sous 2h.")}>📤 Envoyer</Btn>
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[{icon:"📱",titre:"WhatsApp",detail:"+33 1 23 45 67 89",action:"Ouvrir WhatsApp",color:C.green},{icon:"📧",titre:"Email",detail:"contact@xyra.io",action:"Envoyer un email",color:C.blue},{icon:"🕐",titre:"Horaires",detail:"Lun–Ven 8h–19h\nSam 9h–17h",action:null,color:C.gold}].map((c,i)=><Card key={i} style={{borderColor:`${c.color}33`}}>
              <div style={{fontSize:20,marginBottom:6}}>{c.icon}</div>
              <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{c.titre}</div>
              <div style={{fontSize:11,color:C.muted,whiteSpace:"pre-line",marginBottom:c.action?10:0}}>{c.detail}</div>
              {c.action&&<BtnGhost onClick={()=>showToast(`✅ ${c.action}`)} style={{width:"100%",fontSize:11,borderColor:`${c.color}44`,color:c.color}}>{c.action}</BtnGhost>}
            </Card>)}
          </div>
        </div>
      </div>}

      {/* Avis */}
      {page==="avis"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>⭐ Donner un avis</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Votre avis nous aide à nous améliorer et aide d'autres clients</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {missions.filter(m=>m.statut==="terminé").map((m,i)=>{
            const[note,setNote]=useState(0);
            const[hover,setHover]=useState(0);
            const[comm,setComm]=useState("");
            const[envoye,setEnvoye]=useState(false);
            return <Card key={i} style={{borderColor:envoye?`${C.green}44`:C.border}}>
              {envoye?<div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:32,marginBottom:8}}>✅</div>
                <div style={{fontSize:14,fontWeight:700,color:C.green}}>Merci pour votre avis !</div>
                <div style={{fontSize:11,color:C.muted,marginTop:4}}>Il sera publié sur Google dans les 24h</div>
              </div>:<>
                <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{m.service}</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Mission du {m.date}</div>
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  {[1,2,3,4,5].map(n=><button key={n} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)} onClick={()=>setNote(n)} style={{fontSize:28,cursor:"pointer",background:"none",border:"none",color:(hover||note)>=n?C.gold:C.border,transition:"color .15s"}}>★</button>)}
                  {note>0&&<span style={{alignSelf:"center",fontSize:12,color:C.gold,fontWeight:700}}>{["","Mauvais","Passable","Bien","Très bien","Excellent !"][note]}</span>}
                </div>
                <textarea value={comm} onChange={e=>setComm(e.target.value)} placeholder="Partagez votre expérience..." rows={3} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:12,fontFamily:"inherit",width:"100%",resize:"none",boxSizing:"border-box",marginBottom:12}}/>
                <div style={{display:"flex",gap:8}}>
                  <Btn onClick={()=>{if(note===0)return;setEnvoye(true);}} style={{flex:1,opacity:note===0?0.4:1}}>⭐ Publier mon avis</Btn>
                  <BtnGhost onClick={()=>showToast("📱 Lien Google avis envoyé sur WhatsApp")} style={{flex:1,fontSize:11}}>📱 Via WhatsApp</BtnGhost>
                </div>
              </>}
            </Card>;
          })}
        </div>
      </div>}
    </div>
  </div>;
};

// ─── PORTAIL APPORTEUR D'AFFAIRES ─────────────────────────────
const PortailApporteur=({user,onLogout,showToast})=>{
  const[page,setPage]=useState("accueil");

  const leads=[
    {id:"L-001",nom:"Hotel Prestige Paris",contact:"Claire Bernard",secteur:"Hôtellerie",date:"12/04",statut:"proposition",ca:8000,comm:1600,note:"Nettoyage 40 chambres/jour"},
    {id:"L-002",nom:"Cabinet Delmas",contact:"Me Delmas",secteur:"Juridique",date:"10/04",statut:"qualifié",ca:960,comm:192,note:"Nettoyage hebdo bureaux"},
    {id:"L-003",nom:"SCI Châtillon",contact:"M. Dupont",secteur:"Immobilier",date:"08/04",statut:"gagné",ca:2400,comm:480,note:"Contrat signé ✓"},
    {id:"L-004",nom:"Résidences du Val",contact:"Mme Leroy",secteur:"Bailleur social",date:"05/04",statut:"perdu",ca:0,comm:0,note:"Budget insuffisant"},
  ];
  const[newLead,setNewLead]=useState({nom:"",contact:"",secteur:"",tel:"",email:"",note:""});
  const[showForm,setShowForm]=useState(false);
  const[mesLeads,setMesLeads]=useState(leads);

  const caTotal=mesLeads.filter(l=>l.statut==="gagné").reduce((a,l)=>a+l.ca,0);
  const commDues=mesLeads.filter(l=>l.statut==="gagné").reduce((a,l)=>a+l.comm,0);
  const tauxConv=Math.round(mesLeads.filter(l=>l.statut==="gagné").length/mesLeads.length*100);

  const contrat={taux:20,type:"CDI",debut:"01/03/2024",expire:"—",signé:true};
  const[msgs,setMsgs]=useState([
    {av:"T",msg:"Bonjour, merci pour le lead Hotel Prestige ! On part en proposition demain 🚀",h:"09:14",moi:false},
    {av:"T",msg:"Votre commission de 480€ pour SCI Châtillon est en cours de traitement.",h:"14:32",moi:false},
  ]);
  const[msgInput,setMsgInput]=useState("");

  const nav=[
    {id:"accueil",icon:"🏠",label:"Accueil"},
    {id:"leads",icon:"🎯",label:"Mes leads"},
    {id:"soumettre",icon:"➕",label:"Soumettre un lead"},
    {id:"commissions",icon:"💰",label:"Mes commissions"},
    {id:"contrat",icon:"📋",label:"Mon contrat"},
    {id:"messagerie",icon:"💬",label:"Messagerie"},
    {id:"stats",icon:"📊",label:"Mes statistiques"},
  ];

  const statutColor={proposition:C.blue,qualifié:C.gold,gagné:C.green,perdu:C.muted};

  return <div style={{display:"flex",minHeight:"100vh",background:C.dark,fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.text}}>
    {/* Sidebar */}
    <div style={{width:220,background:C.card,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"18px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:14,fontWeight:700,color:C.gold,letterSpacing:"0.1em",fontFamily:"Georgia,serif"}}>XYRA</div>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.2em",marginTop:2}}>ESPACE PARTENAIRE</div>
      </div>
      <div style={{padding:"12px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:user.couleur+"22",border:`2px solid ${user.couleur}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:user.couleur}}>{user.avatar}</div>
        <div><div style={{fontSize:12,fontWeight:700,color:C.text}}>{user.nom}</div><div style={{fontSize:9,color:C.gold}}>★ Apporteur d'affaires</div></div>
      </div>
      <div style={{flex:1,padding:"8px 0"}}>
        {nav.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",cursor:"pointer",color:page===n.id?C.gold:"#C0C0D8",background:page===n.id?`${C.gold}0E`:"transparent",border:"none",borderLeft:`2px solid ${page===n.id?C.gold:"transparent"}`,width:"100%",textAlign:"left",fontFamily:"inherit",fontSize:12,fontWeight:page===n.id?700:400}}>
          <span>{n.icon}</span>{n.label}
        </button>)}
      </div>
      <div style={{padding:14,borderTop:`1px solid ${C.border}`}}>
        <BtnGhost onClick={onLogout} style={{width:"100%",fontSize:11}}>← Déconnexion</BtnGhost>
      </div>
    </div>

    {/* Contenu */}
    <div style={{flex:1,overflowY:"auto"}}>
      {/* Accueil */}
      {page==="accueil"&&<div style={{padding:24}}>
        <div style={{background:`linear-gradient(135deg,${C.card},#0A1A0A)`,border:`1px solid ${C.green}33`,borderRadius:16,padding:24,marginBottom:20}}>
          <div style={{fontSize:9,color:C.green,letterSpacing:"0.2em",marginBottom:6}}>XYRA · ESPACE PARTENAIRE</div>
          <div style={{fontSize:24,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>Bonjour {user.nom.split(" ")[0]} 👋</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Votre tableau de bord apporteur d'affaires</div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            <div style={{borderLeft:`2px solid ${C.green}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>CA apporté (signé)</div><div style={{fontSize:16,fontWeight:700,color:C.green}}>{fmt(caTotal)}</div></div>
            <div style={{borderLeft:`2px solid ${C.gold}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Commissions dues</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(commDues)}</div></div>
            <div style={{borderLeft:`2px solid ${C.blue}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Leads soumis</div><div style={{fontSize:16,fontWeight:700,color:C.blue}}>{mesLeads.length}</div></div>
            <div style={{borderLeft:`2px solid ${C.teal}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Taux de conversion</div><div style={{fontSize:16,fontWeight:700,color:C.teal}}>{tauxConv}%</div></div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>🎯 Derniers leads</div>
            {mesLeads.slice(0,3).map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
              <div><div style={{fontSize:12,fontWeight:600}}>{l.nom}</div><div style={{fontSize:10,color:C.muted}}>{l.date}</div></div>
              <Pill color={statutColor[l.statut]}>{l.statut}</Pill>
            </div>)}
            <button onClick={()=>setPage("leads")} style={{marginTop:10,background:"transparent",color:C.gold,border:"none",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Voir tous mes leads →</button>
          </Card>
          <Card style={{background:`${C.gold}08`,borderColor:`${C.gold}33`}}>
            <div style={{fontSize:9,color:C.gold,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>💰 Commission à venir</div>
            {mesLeads.filter(l=>l.statut==="gagné").map((l,i)=><div key={i} style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700}}>{l.nom}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{contrat.taux}% de {fmt(l.ca)}</div>
              <div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(l.comm)}</div>
            </div>)}
            <Btn onClick={()=>showToast("📱 Rappel de commission envoyé à Xyra !")} style={{marginTop:8,fontSize:11}}>💰 Demander le paiement</Btn>
          </Card>
        </div>
      </div>}

      {/* Leads */}
      {page==="leads"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>🎯 Mes leads soumis</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Statut en temps réel de tous vos apports</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {mesLeads.map((l,i)=><Card key={i} style={{borderColor:`${statutColor[l.statut]||C.border}33`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{l.nom}</div>
                <div style={{fontSize:11,color:C.muted}}>{l.contact} · {l.secteur} · Soumis le {l.date}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2,fontStyle:"italic"}}>"{l.note}"</div>
              </div>
              <div style={{textAlign:"right"}}>
                <Pill color={statutColor[l.statut]||C.muted}>{l.statut}</Pill>
                {l.ca>0&&<div style={{fontSize:14,fontWeight:700,color:C.green,marginTop:6}}>{fmt(l.ca)}</div>}
              </div>
            </div>
            {l.statut==="gagné"&&<div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:10,color:C.muted}}>Votre commission ({contrat.taux}%)</div><div style={{fontSize:16,fontWeight:700,color:C.gold}}>{fmt(l.comm)}</div></div>
              <Btn onClick={()=>showToast(`✅ Demande de paiement ${fmt(l.comm)} envoyée !`)} style={{fontSize:11,padding:"7px 14px"}}>Demander paiement</Btn>
            </div>}
          </Card>)}
        </div>
      </div>}

      {/* Soumettre lead */}
      {page==="soumettre"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>➕ Soumettre un nouveau lead</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Votre commission : <b style={{color:C.gold}}>{contrat.taux}%</b> du CA signé</div>
        <Card style={{maxWidth:560}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[["Nom de l'entreprise","nom","text"],["Nom du contact","contact","text"],["Secteur d'activité","secteur","text"],["Téléphone","tel","tel"],["Email","email","email"]].map(([ph,k,t])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{ph}</label><input type={t} value={newLead[k]} onChange={e=>setNewLead(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"}}/></div>)}
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Notes / Contexte</label><textarea value={newLead.note} onChange={e=>setNewLead(f=>({...f,note:e.target.value}))} placeholder="Besoin identifié, budget estimé, contexte..." rows={4} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",resize:"vertical",boxSizing:"border-box"}}/></div>
            <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:12,fontSize:11,color:C.text}}>
              💡 Rappel : votre commission est de <b style={{color:C.gold}}>{contrat.taux}%</b> du CA signé. Xyra vous notifie dès que le lead est qualifié et quand le contrat est signé.
            </div>
            <Btn onClick={()=>{
              if(!newLead.nom)return showToast("⚠️ Remplissez au moins le nom de l'entreprise");
              const nl={id:`L-00${mesLeads.length+1}`,nom:newLead.nom,contact:newLead.contact,secteur:newLead.secteur,date:new Date().toLocaleDateString("fr"),statut:"qualifié",ca:0,comm:0,note:newLead.note};
              setMesLeads(l=>[nl,...l]);setNewLead({nom:"",contact:"",secteur:"",tel:"",email:"",note:""});
              showToast("✅ Lead soumis ! Xyra vous répond sous 24h.");setPage("leads");
            }}>✅ Soumettre ce lead</Btn>
          </div>
        </Card>
      </div>}

      {/* Commissions */}
      {page==="commissions"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>💰 Mes commissions</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Taux contractuel : <b style={{color:C.gold}}>{contrat.taux}%</b> du CA signé</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>Dues (à recevoir)</div><div style={{fontSize:20,fontWeight:700,color:C.gold}}>{fmt(commDues)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>Payées (historique)</div><div style={{fontSize:20,fontWeight:700,color:C.green}}>{fmt(2480)}</div></CT>
          <CT style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>Total cumulé</div><div style={{fontSize:20,fontWeight:700,color:C.teal}}>{fmt(commDues+2480)}</div></CT>
        </div>
        <Card>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Lead","CA signé","Commission","Statut","Action"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
            <tbody>{mesLeads.filter(l=>l.comm>0||l.statut==="gagné").map((l,i)=><tr key={i}>
              <td style={{padding:"10px",fontSize:12,borderBottom:`1px solid ${C.border}22`,fontWeight:600}}>{l.nom}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:`1px solid ${C.border}22`,color:C.green,fontWeight:700}}>{l.ca>0?fmt(l.ca):"—"}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:`1px solid ${C.border}22`,color:C.gold,fontWeight:700}}>{l.comm>0?fmt(l.comm):"—"}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:`1px solid ${C.border}22`}}><Pill color={l.statut==="gagné"?C.orange:C.green}>{l.statut==="gagné"?"À recevoir":"Payée"}</Pill></td>
              <td style={{padding:"10px",fontSize:12,borderBottom:`1px solid ${C.border}22`}}>{l.statut==="gagné"&&<Btn onClick={()=>showToast(`✅ Demande ${fmt(l.comm)} envoyée !`)} style={{fontSize:10,padding:"5px 10px"}}>Demander</Btn>}</td>
            </tr>)}</tbody>
          </table>
        </Card>
      </div>}

      {/* Contrat */}
      {page==="contrat"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>📋 Mon contrat</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Conditions de votre partenariat Xyra</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card style={{borderColor:`${C.gold}33`}}>
            <div style={{fontSize:9,color:C.gold,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14,fontWeight:600}}>Détails du contrat</div>
            {[["Type de contrat","Apporteur d'affaires"],["Taux de commission",`${contrat.taux}%`],["Base de calcul","CA HT signé"],["Date de début",contrat.debut],["Durée","Indéterminée — résiliation 30j"],["Paiement","Virement SEPA sous 30j après encaissement"],["Statut","✅ Signé et actif"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:k==="Taux de commission"?C.gold:k==="Statut"?C.green:C.text}}>{v}</span></div>)}
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card style={{background:`${C.green}08`,borderColor:`${C.green}33`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:8}}>✅ Vos droits</div>
              {["Commission sur tout CA signé","Accès portail partenaire 24h/24","Notification immédiate à chaque étape","Support dédié Xyra","Historique complet des paiements"].map((d,i)=><div key={i} style={{fontSize:11,color:C.text,padding:"3px 0"}}>• {d}</div>)}
            </Card>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Btn onClick={()=>showToast("📄 Contrat PDF téléchargé")}>📄 Télécharger le contrat PDF</Btn>
              <BtnGhost onClick={()=>showToast("📱 Contrat envoyé sur WhatsApp")} style={{width:"100%"}}>📱 Recevoir sur WhatsApp</BtnGhost>
            </div>
          </div>
        </div>
      </div>}

      {/* Messagerie */}
      {page==="messagerie"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:16}}>💬 Messagerie Xyra</div>
        <Card style={{height:460,padding:0,overflow:"hidden"}}>
          <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.card2,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.gold}}>T</div>
              <div><div style={{fontSize:13,fontWeight:700}}>Xyra — Équipe</div><div style={{fontSize:10,color:C.green}}>● En ligne</div></div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
              {msgs.map((m,i)=><div key={i} style={{display:"flex",gap:8,flexDirection:m.moi?"row-reverse":"row"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:m.moi?`${user.couleur}22`:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:m.moi?user.couleur:C.gold,flexShrink:0}}>{m.moi?user.avatar:"T"}</div>
                <div style={{maxWidth:"70%"}}>
                  <div style={{background:m.moi?`${user.couleur}18`:C.card2,border:`1px solid ${m.moi?user.couleur+"33":C.border}`,borderRadius:10,padding:"8px 12px",marginBottom:2}}>
                    <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{m.msg}</div>
                  </div>
                  <div style={{fontSize:9,color:C.muted,textAlign:m.moi?"right":"left"}}>{m.h}</div>
                </div>
              </div>)}
            </div>
            <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
              <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} placeholder="Écrire un message..." onKeyDown={e=>{if(e.key==="Enter"&&msgInput.trim()){setMsgs(ms=>[...ms,{av:user.avatar,msg:msgInput,h:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),moi:true}]);setMsgInput("");}}} style={{flex:1,background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:12,fontFamily:"inherit",outline:"none"}}/>
              <Btn onClick={()=>{if(msgInput.trim()){setMsgs(ms=>[...ms,{av:user.avatar,msg:msgInput,h:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),moi:true}]);setMsgInput("");}}} style={{width:"auto",padding:"8px 16px"}}>↗</Btn>
            </div>
          </div>
        </Card>
      </div>}

      {/* Stats */}
      {page==="stats"&&<div style={{padding:24}}>
        <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>📊 Mes statistiques</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Performance de votre activité d'apporteur</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
          {[["Leads soumis",mesLeads.length,C.blue],["Leads gagnés",mesLeads.filter(l=>l.statut==="gagné").length,C.green],["Taux conversion",tauxConv+"%",C.teal],["CA total apporté",fmt(caTotal),C.gold]].map(([l,v,c],i)=><CT key={i} style={{textAlign:"center"}}><div style={{fontSize:9,color:C.muted,marginBottom:4}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></CT>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Card>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>Leads par statut</div>
            {Object.entries({qualifié:C.gold,proposition:C.blue,gagné:C.green,perdu:C.muted}).map(([s,c])=>{const n=mesLeads.filter(l=>l.statut===s).length;return <div key={s} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{textTransform:"capitalize"}}>{s}</span><span style={{color:c,fontWeight:700}}>{n}</span></div><SM val={n} max={mesLeads.length} color={c}/></div>;})}
          </Card>
          <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
            <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 Analyse Xyra</div>
            <div style={{fontSize:12,color:C.text,lineHeight:1.8}}>Votre taux de conversion de <b style={{color:C.gold}}>{tauxConv}%</b> est excellent — la moyenne du réseau est 18%. Vos leads dans le secteur <b style={{color:C.teal}}>Immobilier</b> convertissent le mieux. Continuez à sourcer dans ce secteur pour maximiser vos commissions.</div>
          </Card>
        </div>
      </div>}
    </div>
  </div>;
};

// ─── APP PRINCIPALE ───────────────────────────────────────────
export default function Page() {
  const[user,setUser]=useState(null);
  const[toast,setToast]=useState(null);
  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),3000);};

  return <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
    {!user&&<Login onLogin={setUser}/>}
    {user?.type==="client"&&<PortailClient user={user} onLogout={()=>setUser(null)} showToast={showToast}/>}
    {user?.type==="apporteur"&&<PortailApporteur user={user} onLogout={()=>setUser(null)} showToast={showToast}/>}
    {toast&&<div style={{position:"fixed",bottom:24,right:24,background:"#0C0C1A",border:"1px solid #C9A84C44",borderRadius:10,padding:"12px 20px",zIndex:9999,fontSize:13,color:"#EAE6DE",maxWidth:320}}>{toast}</div>}
  </div>;
}