"use client";
import { useState, useEffect, useRef } from "react";
import { C, Card, Btn, BtnGhost, TH, Td, STitle, Pill, Inp, Sel, DEVISES } from "../lib/ui";

const PageSettings=({plan,showToast,sirApiKey,setSirApiKey,profil,setProfil})=>{
  const[onglet,setOnglet]=useState("entreprise");
  const[logoUrl,setLogoUrl]=useState("");
  const[couleursMarque,setCouleursMarque]=useState({couleur_primaire:"#C9A84C",couleur_secondaire:"#0A0A16",couleur_accent:"#2EC9B0"});
  const[uploadEnCours,setUploadEnCours]=useState(false);
  const logoInputRef=useRef(null);
  useEffect(()=>{
    fetch('/api/branding').then(r=>r.json()).then(d=>{
      if(d.branding){
        if(d.branding.logo_url)setLogoUrl(d.branding.logo_url);
        setCouleursMarque({couleur_primaire:d.branding.couleur_primaire||"#C9A84C",couleur_secondaire:d.branding.couleur_secondaire||"#0A0A16",couleur_accent:d.branding.couleur_accent||"#2EC9B0"});
      }
    }).catch(()=>{});
  },[]);
  const uploaderLogo=async(file)=>{
    if(!file)return;
    setUploadEnCours(true);
    try{
      const{createClient}=await import('@supabase/supabase-js');
      const sbc=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const path=`logos/${Date.now()}_${file.name}`;
      const{error:upErr}=await sbc.storage.from('attachments').upload(path,file);
      if(upErr){showToast("❌ Echec upload — verifie le bucket 'attachments'");setUploadEnCours(false);return;}
      const{data:urlData}=sbc.storage.from('attachments').getPublicUrl(path);
      const res=await fetch('/api/branding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'upload_logo',logo_url:urlData.publicUrl})});
      const data=await res.json();
      if(data.success){
        setLogoUrl(urlData.publicUrl);
        setCouleursMarque({couleur_primaire:data.couleur_primaire,couleur_secondaire:data.couleur_secondaire,couleur_accent:data.couleur_accent});
        showToast("✅ Logo et charte graphique mis a jour !");
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setUploadEnCours(false);
  };

  // États formulaires
  const[entreprise,setEntreprise]=useState({nom:"Xyra SaaS SASU",siren:"123 456 789",tva:"FR12 123456789",adresse:"75 rue de Rivoli",ville:"Paris",cp:"75001",pays:"France",tel:"+33 1 23 45 67 89",email:"contact@xyra.io",site:"xyra.io",logo:""});
  const[profUser,setProfUser]=useState({prenom:"Curtiss",nom:"Fondateur",email:"curtiss@xyra.io",tel:"+33 6 00 11 22 33",titre:"Fondateur & CEO",avatar:"C"});
  const[ticketForm,setTicketForm]=useState({sujet:"",message:"",priorite:"normale"});
  const[mesTickets,setMesTickets]=useState([]);
  const[loadingTickets,setLoadingTickets]=useState(true);
  const[envoiTicket,setEnvoiTicket]=useState(false);
  const[mdp,setMdp]=useState({actuel:"",nouveau:"",confirmer:""});
  const[mdpVisible,setMdpVisible]=useState({actuel:false,nouveau:false,confirmer:false});
  const[theme,setTheme]=useState("dark");
  const[langue,setLangue]=useState("fr");
  const[deux_fa,setDeuxFa]=useState(true);
  const[domaine,setDomaine]=useState({sous_domaine:"curtiss",domaine_custom:"",ssl:true,actif:false});
  const[utilisateurs,setUtilisateurs]=useState([
    {id:1,nom:"Thomas Beaumont",email:"thomas@xyra.io",role:"Collaborateur",acces:["planning","stock","chat"],statut:"actif",dernierConnexion:"Aujourd'hui 09:02"},
    {id:2,nom:"Abou Diallo",email:"abou@xyra.io",role:"Collaborateur",acces:["planning","stock","chat"],statut:"actif",dernierConnexion:"Aujourd'hui 08:45"},
    {id:3,nom:"Fatou Sarr",email:"fatou@xyra.io",role:"Commercial",acces:["crm","devis","clients","chat"],statut:"actif",dernierConnexion:"Aujourd'hui 09:30"},
  ]);
  const[inviteForm,setInviteForm]=useState({email:"",role:"Collaborateur"});
  const[sessions]=useState([{device:"MacBook Pro — Chrome",ip:"92.168.1.1",lieu:"Paris, France",date:"Maintenant",actuelle:true},{device:"iPhone 14 — Safari",ip:"92.168.1.2",lieu:"Paris, France",date:"Il y a 2h",actuelle:false}]);
  const[logs]=useState([{date:"Aujourd'hui 09:00",action:"Connexion réussie",ip:"92.168.1.1",statut:"ok"},{date:"Hier 18:30",action:"Modification devis TYM-0044",ip:"92.168.1.1",statut:"ok"},{date:"Hier 14:00",action:"Tentative connexion échouée",ip:"203.45.67.89",statut:"echec"}]);

  const tabs=[
    {id:"entreprise",label:"🏢 Entreprise"},
    {id:"profil",label:"👤 Mon profil"},
    {id:"mdp",label:"🔑 Mot de passe"},
    {id:"abonnement",label:"💳 Abonnement"},
    {id:"apparence",label:"🎨 Apparence"},
    {id:"securite",label:"🛡 Sécurité"},
    {id:"integrations",label:"🔗 Intégrations"},
    {id:"ia",label:"🤖 IA & Claude"},
    {id:"notifications_param",label:"🔔 Notifications"},
    {id:"secteur",label:"⊛ Secteur métier"},
    {id:"utilisateurs",label:"👥 Utilisateurs"},
    {id:"domaine",label:"🌍 Domaine & White-label"},
    {id:"support",label:"🎫 Support"},
    {id:"rgpd",label:"🔒 RGPD"},
  ];

  const ROLES=["Fondateur","Admin","Commercial","Collaborateur","Comptable","Lecture seule"];
  const loadTickets=async()=>{
    try{
      const res=await fetch(`/api/tickets?email=${profil?.email||profUser.email}`);
      const data=await res.json();
      if(data.tickets)setMesTickets(data.tickets);
    }catch(e){console.error("Tickets:",e);}
    setLoadingTickets(false);
  };
  useEffect(()=>{loadTickets();},[]);
  const envoyerTicket=async()=>{
    if(!ticketForm.sujet||!ticketForm.message)return showToast("⚠️ Sujet et message requis");
    setEnvoiTicket(true);
    try{
      const res=await fetch("/api/tickets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"creer",societe:entreprise.nom,email:profil?.email||profUser.email,sujet:ticketForm.sujet,message:ticketForm.message,priorite:ticketForm.priorite})});
      const data=await res.json();
      if(data.success){showToast("✅ Ticket envoyé — nous revenons vers vous rapidement");setTicketForm({sujet:"",message:"",priorite:"normale"});loadTickets();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setEnvoiTicket(false);
  };
  const INTEGRATIONS=[
    {nom:"Meta WhatsApp API",icon:"💬",statut:true,color:C.green,desc:"Bot WhatsApp + notifications automatiques"},
    {nom:"Flutterwave",icon:"💳",statut:true,color:C.gold,desc:"Paiements cartes, mobile money Afrique"},
    {nom:"CinetPay",icon:"🌍",statut:true,color:C.teal,desc:"Wave, Orange Money, MTN — Afrique francophone"},
    {nom:"Stripe",icon:"💳",statut:false,color:C.blue,desc:"Paiements cartes Europe & international"},
    {nom:"Supabase",icon:"🗄",statut:true,color:C.green,desc:"Base de données & authentification"},
    {nom:"Vercel",icon:"▲",statut:true,color:C.text,desc:"Déploiement & hébergement"},
    {nom:"Google Calendar",icon:"📅",statut:false,color:C.blue,desc:"Synchronisation planning & agenda"},
    {nom:"Zapier",icon:"⚡",statut:false,color:C.orange,desc:"Automatisations vers 5000+ apps"},
    {nom:"Anthropic Claude",icon:"🤖",statut:!!sirApiKey,color:C.purple,desc:"IA analyses, rédaction, recommandations"},
    {nom:"Chorus Pro",icon:"🇫🇷",statut:true,color:C.blue,desc:"Facturation électronique DGFiP"},
  ];

  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>⚙ Paramètres</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Gérez tous les aspects de votre compte Xyra</div>

    {/* TABS SCROLLABLE */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:C.card2,borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?C.card:"transparent",color:onglet===t.id?C.gold:C.muted,border:onglet===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ── ENTREPRISE ── */}
    {onglet==="entreprise"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>🏢 Informations légales</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Raison sociale *","nom"],["SIREN","siren"],["Numéro TVA","tva"],["Email professionnel","email"],["Téléphone","tel"],["Site web","site"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={entreprise[k]} onChange={e=>setEntreprise(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card>
          <STitle>📍 Adresse du siège</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[["Adresse","adresse"],["Ville","ville"],["Code postal","cp"],["Pays","pays"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={entreprise[k]} onChange={e=>setEntreprise(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
          </div>
        </Card>
        <Card>
          <STitle>🖼 Logo & charte graphique</STitle>
          <div style={{fontSize:10,color:C.muted,marginBottom:10}}>Ce logo et ces couleurs apparaitront sur vos devis et contrats envoyes aux clients.</div>
          <input ref={logoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploaderLogo(e.target.files?.[0])}/>
          <div onClick={()=>logoInputRef.current?.click()} style={{background:C.card2,borderRadius:10,padding:20,textAlign:"center",border:`2px dashed ${C.border}`,marginBottom:10,cursor:"pointer"}}>
            {logoUrl?<img src={logoUrl} alt="Logo" style={{maxHeight:60,marginBottom:8}}/>:<div style={{fontSize:32,marginBottom:6}}>🏢</div>}
            <div style={{fontSize:11,color:C.muted}}>{uploadEnCours?"Upload en cours...":"Cliquez pour choisir votre logo"}</div>
            <div style={{fontSize:9,color:C.muted,marginTop:4}}>PNG, JPG — la charte graphique sera extraite automatiquement</div>
          </div>
          {logoUrl&&<div style={{display:"flex",gap:8,marginBottom:10}}>
            {[["Primaire",couleursMarque.couleur_primaire],["Secondaire",couleursMarque.couleur_secondaire],["Accent",couleursMarque.couleur_accent]].map(([label,coul],i)=><div key={i} style={{textAlign:"center"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:coul,border:`1px solid ${C.border}`,margin:"0 auto 4px"}}/>
              <div style={{fontSize:8,color:C.muted}}>{label}</div>
            </div>)}
          </div>}
          <Btn onClick={()=>logoInputRef.current?.click()} disabled={uploadEnCours} style={{width:"100%"}}>📁 {logoUrl?"Changer le logo":"Choisir un fichier"}</Btn>
        </Card>
        <Btn onClick={()=>showToast("✅ Informations entreprise sauvegardées !")}>Sauvegarder les modifications</Btn>
      </div>
    </div>}

    {/* ── PROFIL ── */}
    {onglet==="profil"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>👤 Mon profil</STitle>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:`${C.gold}22`,border:`3px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,color:C.gold,margin:"0 auto 10px"}}>
            {profUser.avatar}
          </div>
          <BtnGhost onClick={()=>showToast("📸 Photo modifiée !")} style={{fontSize:11}}>📸 Changer la photo</BtnGhost>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Prénom *","prenom"],["Nom *","nom"],["Email *","email"],["Téléphone","tel"],["Titre / Fonction","titre"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={profUser[k]} onChange={e=>setProfUser(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
        </div>
        <Btn onClick={()=>showToast("✅ Profil sauvegardé !")} style={{marginTop:12,width:"100%"}}>Sauvegarder le profil</Btn>
      </Card>
      <Card>
        <STitle>📊 Infos du compte</STitle>
        {[["Plan actuel",PLANS[plan]?.nom+" — "+PLANS[plan]?.prix],["Membre depuis","01/03/2024"],["Dernière connexion","Aujourd'hui 09:00"],["Rôle","Fondateur & Owner"],["Dashboard URL","xyraio.fr"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:i===0?C.gold:C.text}}>{v}</span></div>)}
        <div style={{marginTop:12,background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>✅ Compte Owner — Accès complet à toutes les fonctionnalités</div>
      </Card>
    </div>}

    {/* ── MOT DE PASSE ── */}
    {onglet==="mdp"&&<div style={{maxWidth:480}}>
      <Card>
        <STitle>🔑 Changer le mot de passe</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[["Mot de passe actuel *","actuel"],["Nouveau mot de passe *","nouveau"],["Confirmer le nouveau mot de passe *","confirmer"]].map(([l,k])=><div key={k}>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label>
            <div style={{position:"relative"}}>
              <input type={mdpVisible[k]?"text":"password"} value={mdp[k]} onChange={e=>setMdp(f=>({...f,[k]:e.target.value}))} placeholder="••••••••" style={{background:C.card2,border:`1px solid ${mdp.nouveau&&k==="confirmer"&&mdp.nouveau!==mdp.confirmer?C.red:C.border}`,borderRadius:8,padding:"10px 40px 10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"}}/>
              <button onClick={()=>setMdpVisible(v=>({...v,[k]:!v[k]}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:14}}>{mdpVisible[k]?"🙈":"👁"}</button>
            </div>
            {k==="confirmer"&&mdp.nouveau&&mdp.confirmer&&mdp.nouveau!==mdp.confirmer&&<div style={{fontSize:10,color:C.red,marginTop:3}}>⚠️ Les mots de passe ne correspondent pas</div>}
          </div>)}
          {/* Force du mot de passe */}
          {mdp.nouveau&&<div>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Force du mot de passe</div>
            <div style={{height:4,borderRadius:2,background:C.border,overflow:"hidden"}}>
              <div style={{height:"100%",width:mdp.nouveau.length<6?"33%":mdp.nouveau.length<10?"66%":"100%",background:mdp.nouveau.length<6?C.red:mdp.nouveau.length<10?C.orange:C.green,borderRadius:2,transition:"width .3s"}}/>
            </div>
            <div style={{fontSize:10,color:mdp.nouveau.length<6?C.red:mdp.nouveau.length<10?C.orange:C.green,marginTop:2}}>{mdp.nouveau.length<6?"Trop court":mdp.nouveau.length<10?"Moyen":"Fort ✅"}</div>
          </div>}
          <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}22`,borderRadius:8,padding:10,fontSize:11,color:C.muted}}>
            💡 Conseils : min. 8 caractères, mélangez majuscules, minuscules, chiffres et symboles
          </div>
          <Btn onClick={async()=>{if(!mdp.actuel)return showToast("⚠️ Entrez votre mot de passe actuel");if(mdp.nouveau!==mdp.confirmer)return showToast("⚠️ Les mots de passe ne correspondent pas");if(mdp.nouveau.length<8)return showToast("⚠️ Minimum 8 caractères");const token=typeof window!=="undefined"?window.localStorage.getItem("sb-access-token"):null;if(!token)return showToast("⚠️ Session expirée, reconnecte-toi");showToast("⏳ Modification en cours...");try{const res=await fetch('/api/change-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,currentPassword:mdp.actuel,newPassword:mdp.nouveau})});const data=await res.json();if(data.success){showToast("✅ Mot de passe modifié avec succès !");setMdp({actuel:"",nouveau:"",confirmer:""});}else showToast("❌ "+(data.error||"Erreur"));}catch(e){showToast("❌ Erreur de connexion");}}}>🔑 Modifier le mot de passe</Btn>
        </div>
      </Card>
    </div>}

    {/* ── ABONNEMENT ── */}
    {onglet==="abonnement"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
        {Object.values(PLANS).filter(p=>p.id!=="owner").map((p,i)=><Card key={i} style={{borderColor:`${p.color}44`,background:plan===p.id?`${p.color}08`:"transparent"}}>
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:24,marginBottom:4}}>{p.icon}</div>
            <div style={{fontSize:16,fontWeight:700,color:p.color}}>{p.nom}</div>
            <div style={{fontSize:22,fontWeight:700,color:C.text,margin:"8px 0"}}>{p.prix}</div>
            <div style={{fontSize:11,color:C.muted}}>{p.description}</div>
          </div>
          {plan===p.id?<div style={{background:`${p.color}22`,border:`1px solid ${p.color}44`,borderRadius:8,padding:8,textAlign:"center",fontSize:11,color:p.color,fontWeight:700}}>✓ Plan actuel</div>:<Btn onClick={()=>showToast(`✅ Passage à ${p.nom} initié — Paiement Flutterwave`)} color={p.color} style={{width:"100%",color:p.id==="business"?"#000":"#fff"}}>Passer à ce plan</Btn>}
        </Card>)}
      </div>
      <Card>
        <STitle>📋 Historique de facturation</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Date</TH><TH>Description</TH><TH>Montant</TH><TH>Statut</TH><TH>Action</TH></tr></thead>
          <tbody>{[{date:"01/05/2026",desc:"Abonnement Owner — Mai 2026",montant:"—",statut:"owner"},{date:"01/04/2026",desc:"Abonnement Owner — Avril 2026",montant:"—",statut:"owner"},{date:"01/03/2026",desc:"Setup initial Xyra",montant:"0 €",statut:"payé"}].map((f,i)=><tr key={i}>
            <Td style={{color:C.muted,fontSize:10}}>{f.date}</Td>
            <Td style={{fontWeight:600}}>{f.desc}</Td>
            <Td style={{color:C.gold,fontWeight:700}}>{f.montant}</Td>
            <Td><Pill color={C.green}>✓ {f.statut}</Pill></Td>
            <Td><BtnGhost onClick={()=>showToast("📄 Facture téléchargée")} style={{fontSize:10,padding:"3px 8px"}}>PDF</BtnGhost></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </div>}

    {/* ── APPARENCE ── */}
    {onglet==="apparence"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>🎨 Thème & Couleurs</STitle>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:8}}>Thème de l'interface</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{id:"dark",label:"🌙 Sombre",desc:"Mode nuit — recommandé"},{id:"light",label:"☀️ Clair",desc:"Mode jour"}].map(t=><div key={t.id} onClick={()=>setTheme(t.id)} style={{background:theme===t.id?`${C.gold}15`:C.card2,border:`2px solid ${theme===t.id?C.gold:C.border}`,borderRadius:10,padding:12,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:4}}>{t.label.split(" ")[0]}</div>
              <div style={{fontSize:11,fontWeight:theme===t.id?700:400,color:theme===t.id?C.gold:C.text}}>{t.label.split(" ").slice(1).join(" ")}</div>
              <div style={{fontSize:9,color:C.muted}}>{t.desc}</div>
            </div>)}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:8}}>Couleur d'accentuation</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[{c:"#C9A84C",n:"Or (défaut)"},{c:"#4B7BFF",n:"Bleu"},{c:"#2EC9B0",n:"Teal"},{c:"#9B5FFF",n:"Violet"},{c:"#FF5F9E",n:"Rose"},{c:"#FF8C3A",n:"Orange"}].map((col,i)=><div key={i} onClick={()=>showToast(`✅ Couleur "${col.n}" appliquée`)} style={{width:32,height:32,borderRadius:"50%",background:col.c,cursor:"pointer",border:`3px solid ${col.c===C.gold?"#fff":"transparent"}`,title:col.n}}/>)}
          </div>
        </div>
        <Btn onClick={()=>showToast("✅ Apparence sauvegardée !")}>Sauvegarder l'apparence</Btn>
      </Card>
      <Card>
        <STitle>🌍 Langue & Région</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Langue de l'interface</label>
            <Sel value={langue} onChange={e=>setLangue(e.target.value)} style={{width:"100%"}}>
              <option value="fr">🇫🇷 Français</option><option value="en">🇬🇧 English</option><option value="ar">🇲🇦 العربية</option><option value="wo">🇸🇳 Wolof</option>
            </Sel>
          </div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Format de date</label>
            <Sel style={{width:"100%"}}><option>JJ/MM/AAAA (France)</option><option>MM/DD/YYYY (USA)</option></Sel>
          </div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Fuseau horaire</label>
            <Sel style={{width:"100%"}}><option>Europe/Paris (UTC+2)</option><option>Africa/Dakar (UTC+0)</option><option>Asia/Dubai (UTC+4)</option><option>America/Montreal (UTC-4)</option></Sel>
          </div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise d'affichage par défaut</label>
            <Sel style={{width:"100%"}}>{DEVISES.slice(0,5).map(d=><option key={d.code}>{d.flag} {d.code} — {d.nom}</option>)}</Sel>
          </div>
        </div>
      </Card>
    </div>}

    {/* ── SÉCURITÉ ── */}
    {onglet==="securite"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>🔐 Authentification à 2 facteurs</STitle>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontSize:12,fontWeight:700}}>2FA par SMS</div><div style={{fontSize:10,color:C.muted}}>+33 6 00 11 22 33</div></div>
            <div onClick={()=>setDeuxFa(v=>!v)} style={{width:44,height:24,borderRadius:12,background:deux_fa?C.green:C.border,cursor:"pointer",position:"relative",transition:".2s"}}>
              <div style={{position:"absolute",top:3,left:deux_fa?21:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:".2s"}}/>
            </div>
          </div>
          {deux_fa?<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>✅ 2FA activée — Votre compte est sécurisé</div>:<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>⚠️ 2FA désactivée — Recommandé de l'activer</div>}
          <div style={{marginTop:10,display:"flex",gap:8}}>
            <BtnGhost onClick={()=>showToast("📱 Code de test envoyé par SMS")} style={{flex:1,fontSize:11}}>Tester le 2FA</BtnGhost>
            <BtnGhost onClick={()=>showToast("🔑 Codes de secours téléchargés")} style={{flex:1,fontSize:11}}>Codes secours</BtnGhost>
          </div>
        </Card>
        <Card>
          <STitle>💻 Sessions actives</STitle>
          {sessions.map((s,i)=><div key={i} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${s.actuelle?C.green:C.border}33`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontSize:11,fontWeight:700}}>{s.device}</div>
              {s.actuelle&&<Pill color={C.green}>● Session actuelle</Pill>}
            </div>
            <div style={{fontSize:10,color:C.muted}}>📍 {s.lieu} · 🌐 {s.ip}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:6}}>🕐 {s.date}</div>
            {!s.actuelle&&<BtnGhost onClick={()=>showToast("✅ Session révoquée")} style={{fontSize:10,padding:"3px 8px",color:C.red}}>Révoquer</BtnGhost>}
          </div>)}
          <BtnGhost onClick={()=>showToast("✅ Toutes les autres sessions révoquées")} style={{width:"100%",fontSize:11,color:C.red}}>Déconnecter toutes les autres sessions</BtnGhost>
        </Card>
      </div>
      <Card>
        <STitle>📋 Journaux de connexion</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Date & Heure</TH><TH>Action</TH><TH>Adresse IP</TH><TH>Statut</TH></tr></thead>
          <tbody>{logs.map((l,i)=><tr key={i}>
            <Td style={{color:C.muted,fontSize:10}}>{l.date}</Td>
            <Td style={{fontWeight:600}}>{l.action}</Td>
            <Td style={{fontFamily:"monospace",fontSize:10,color:C.muted}}>{l.ip}</Td>
            <Td><Pill color={l.statut==="ok"?C.green:C.red}>{l.statut==="ok"?"✓ Succès":"✗ Échec"}</Pill></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </div>}

    {/* ── INTÉGRATIONS ── */}
    {onglet==="integrations"&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
      {INTEGRATIONS.map((it,i)=><Card key={i} style={{borderColor:`${it.color}22`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:24}}>{it.icon}</div>
            <div><div style={{fontSize:13,fontWeight:700}}>{it.nom}</div><div style={{fontSize:10,color:C.muted}}>{it.desc}</div></div>
          </div>
          <Pill color={it.statut?C.green:C.muted}>{it.statut?"● Connecté":"○ Non connecté"}</Pill>
        </div>
        <div style={{display:"flex",gap:6}}>
          <BtnGhost onClick={()=>showToast(`✅ ${it.nom} ${it.statut?"déconnecté":"connecté"}`)} style={{flex:1,fontSize:11,color:it.statut?C.red:C.green,borderColor:`${it.statut?C.red:C.green}33`}}>{it.statut?"Déconnecter":"Connecter"}</BtnGhost>
          {it.statut&&<BtnGhost onClick={()=>showToast(`⚙ Paramètres ${it.nom}`)} style={{fontSize:11}}>⚙</BtnGhost>}
        </div>
      </Card>)}
    </div>}

    {/* ── IA & CLAUDE ── */}
    {onglet==="ia"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>🤖 Configuration Claude (Anthropic)</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Clé API Anthropic *</label>
            <div style={{display:"flex",gap:8}}>
              <Inp value={sirApiKey} onChange={e=>setSirApiKey(e.target.value)} placeholder="sk-ant-api03-..." style={{flex:1,fontFamily:"monospace",fontSize:11}}/>
              <Btn onClick={()=>showToast("✅ Clé API sauvegardée et testée !")}>Sauver</Btn>
            </div>
            <div style={{fontSize:9,color:C.muted,marginTop:3}}>Disponible sur console.anthropic.com</div>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Modèle IA</label>
            <Sel style={{width:"100%"}}>
              <option value="claude-sonnet-4-5">claude-sonnet-4-5 — Recommandé (rapide + intelligent)</option>
              <option value="claude-opus-4-5">claude-opus-4-5 — Premium (plus puissant)</option>
              <option value="claude-haiku-4-5">claude-haiku-4-5 — Rapide (économique)</option>
            </Sel>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Langue de réponse IA</label>
            <Sel style={{width:"100%"}}><option>🇫🇷 Français</option><option>🇬🇧 English</option></Sel>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Ton de l'IA</label>
            <Sel style={{width:"100%"}}><option>Professionnel & concis</option><option>Amical & accessible</option><option>Expert & détaillé</option></Sel>
          </div>
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card>
          <STitle>⚡ Fonctionnalités IA activées</STitle>
          {[["Analyses business automatiques",true],["Relances devis intelligentes",true],["Recommandations investissement",true],["Réponses avis clients",true],["Chat assistant (WhatsApp bot)",true],["Prévisions trésorerie",true],["Score solvabilité clients",true],["Suggestions upsell",true]].map(([f,a],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
            <span>{f}</span>
            <Pill color={a?C.green:C.muted}>{a?"✅ Actif":"○ Inactif"}</Pill>
          </div>)}
        </Card>
        <Card style={{background:`${C.purple}11`,borderColor:`${C.purple}33`}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:6}}>📊 Utilisation API ce mois</div>
          {[["Tokens utilisés","47 832 / 100 000"],["Coût estimé","~2.40€"],["Appels API","342"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0"}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>)}
        </Card>
      </div>
    </div>}

    {/* ── NOTIFICATIONS CONFIG ── */}
    {onglet==="notifications_param"&&<Card>
      <STitle>🔔 Paramètres de notifications</STitle>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Type</TH><TH style={{textAlign:"center"}}>Push écran</TH><TH style={{textAlign:"center"}}>WhatsApp</TH><TH style={{textAlign:"center"}}>Email</TH><TH style={{textAlign:"center"}}>Activer tout</TH></tr></thead>
        <tbody>{[["💰 Paiements reçus",true,true,true],["◧ Devis signés",true,true,false],["📦 Stock critique",true,false,false],["👥 Nouveaux leads",true,true,false],["🤖 Alertes IA",true,false,false],["📅 Rappels RDV",true,true,true],["⚙ Système",false,false,true]].map(([t,push,wa,email],i)=><tr key={i}>
          <Td style={{fontWeight:600}}>{t}</Td>
          {[push,wa,email].map((v,j)=><td key={j} style={{textAlign:"center",padding:"10px",borderBottom:`1px solid ${C.border}22`}}>
            <div onClick={()=>showToast("✅ Préférence sauvegardée")} style={{width:32,height:18,borderRadius:9,background:v?C.gold:C.border,cursor:"pointer",margin:"0 auto",position:"relative",transition:".2s"}}>
              <div style={{position:"absolute",top:2,left:v?14:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:".2s"}}/>
            </div>
          </td>)}
          <td style={{textAlign:"center",padding:"10px",borderBottom:`1px solid ${C.border}22`}}>
            <BtnGhost onClick={()=>showToast("✅ Toutes notifications activées")} style={{fontSize:9,padding:"3px 8px"}}>Tout activer</BtnGhost>
          </td>
        </tr>)}
        </tbody>
      </table>
    </Card>}

    {/* ── SECTEUR ── */}
    {onglet==="secteur"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:C.text}}>
        💡 Le profil sectoriel adapte la terminologie de l'outil à votre activité (missions, clients, stock, services).
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
        {Object.entries(PROFILS_SECTEURS).map(([key,p])=><div key={key} onClick={()=>{setProfil(p);showToast(`✅ Profil "${p.label}" activé !`);}} style={{background:profil?.label===p.label?`${p.couleur}22`:"transparent",border:`2px solid ${profil?.label===p.label?p.couleur:C.border}`,borderRadius:10,padding:14,cursor:"pointer",transition:"all .2s"}}>
          <div style={{fontSize:13,fontWeight:700,color:profil?.label===p.label?p.couleur:C.text,marginBottom:4}}>{p.label}</div>
          <div style={{fontSize:10,color:C.muted}}>Services : {p.services.slice(0,3).join(", ")}...</div>
          {profil?.label===p.label&&<div style={{marginTop:8,fontSize:10,color:p.couleur,fontWeight:600}}>✅ Profil actuel</div>}
        </div>)}
      </div>
    </div>}

    {/* ── UTILISATEURS ── */}
    {onglet==="utilisateurs"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <STitle>👥 Membres & Accès</STitle>
        <Btn onClick={()=>showToast("📧 Invitation envoyée !")}>+ Inviter un membre</Btn>
      </div>
      <Card style={{marginBottom:12}}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <Inp value={inviteForm.email} onChange={e=>setInviteForm(f=>({...f,email:e.target.value}))} placeholder="Email à inviter..." style={{flex:1}}/>
          <Sel value={inviteForm.role} onChange={e=>setInviteForm(f=>({...f,role:e.target.value}))} style={{width:160}}>{ROLES.map(r=><option key={r}>{r}</option>)}</Sel>
          <Btn onClick={()=>{if(!inviteForm.email)return;showToast(`📧 Invitation envoyée à ${inviteForm.email} — rôle ${inviteForm.role}`);setInviteForm({email:"",role:"Collaborateur"});}}>Inviter</Btn>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Membre</TH><TH>Email</TH><TH>Rôle</TH><TH>Dernière connexion</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>
            {/* Owner (non modifiable) */}
            <tr style={{background:`${C.gold}08`}}>
              <Td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.gold}}>C</div><span style={{fontWeight:700}}>Curtiss (Vous)</span></div></Td>
              <Td style={{color:C.muted}}>curtiss@xyra.io</Td>
              <Td><Pill color={C.gold}>★ Owner</Pill></Td>
              <Td style={{color:C.muted,fontSize:10}}>Maintenant</Td>
              <Td><Pill color={C.green}>Actif</Pill></Td>
              <Td><span style={{fontSize:10,color:C.muted}}>Non modifiable</span></Td>
            </tr>
            {utilisateurs.map((u,i)=><tr key={i}>
              <Td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.blue}}>{u.nom[0]}</div><span style={{fontWeight:600}}>{u.nom}</span></div></Td>
              <Td style={{color:C.muted,fontSize:11}}>{u.email}</Td>
              <Td><Sel value={u.role} onChange={e=>setUtilisateurs(us=>us.map((x,j)=>j===i?{...x,role:e.target.value}:x))} style={{fontSize:10,padding:"3px 6px"}}>{ROLES.map(r=><option key={r}>{r}</option>)}</Sel></Td>
              <Td style={{color:C.muted,fontSize:10}}>{u.dernierConnexion}</Td>
              <Td><Pill color={C.green}>Actif</Pill></Td>
              <Td><div style={{display:"flex",gap:4}}>
                <BtnGhost onClick={()=>showToast(`✅ Modifications ${u.nom} sauvegardées`)} style={{fontSize:9,padding:"3px 7px"}}>Sauver</BtnGhost>
                <BtnGhost onClick={()=>{setUtilisateurs(us=>us.filter((_,j)=>j!==i));showToast(`✅ ${u.nom} retiré de l'équipe`);}} style={{fontSize:9,padding:"3px 7px",color:C.red}}>Retirer</BtnGhost>
              </div></Td>
            </tr>)}
          </tbody>
        </table>
      </Card>
    </div>}

    {/* ── DOMAINE WHITE-LABEL ── */}
    {onglet==="domaine"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>🌍 URL Xyra (sous-domaine)</STitle>
        <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.muted,marginBottom:4}}>URL ACTUELLE</div>
          <div style={{fontFamily:"monospace",fontSize:13,color:C.teal}}>{domaine.sous_domaine}.xyra.io</div>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Personnaliser le sous-domaine</label>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Inp value={domaine.sous_domaine} onChange={e=>setDomaine(d=>({...d,sous_domaine:e.target.value}))} placeholder="votre-nom" style={{flex:1}}/>
            <span style={{fontSize:11,color:C.muted,whiteSpace:"nowrap"}}>.xyra.io</span>
          </div>
        </div>
        <Btn onClick={()=>showToast(`✅ Sous-domaine "${domaine.sous_domaine}.xyra.io" activé !`)}>Appliquer</Btn>
      </Card>
      <Card>
        <STitle>🏷 Domaine personnalisé (White-label)</STitle>
        <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:C.text}}>
          💡 Disponible avec le plan <b style={{color:C.purple}}>Enterprise (150€/mois)</b>. Votre outil sera accessible sur votre propre domaine avec votre logo.
        </div>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Votre domaine</label>
          <Inp value={domaine.domaine_custom} onChange={e=>setDomaine(d=>({...d,domaine_custom:e.target.value}))} placeholder="app.votreentreprise.com"/>
        </div>
        <div style={{marginBottom:12,display:"flex",justifyContent:"space-between",fontSize:11}}>
          <span>SSL / HTTPS</span><Pill color={C.green}>✅ Auto-généré</Pill>
        </div>
        {plan==="enterprise"||plan==="owner"?<Btn onClick={()=>showToast(`✅ Domaine "${domaine.domaine_custom}" configuré ! DNS en cours...`)}>🌍 Activer le domaine</Btn>:<Btn onClick={()=>showToast("💳 Passage Enterprise nécessaire")} style={{background:C.purple}}>Passer à Enterprise</Btn>}
      </Card>
    </div>}

    {/* ── RGPD ── */}
    {onglet==="support"&&<div>
      <Card>
        <STitle>🎫 Signaler un problème</STitle>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Sujet</label>
          <Inp value={ticketForm.sujet} onChange={e=>setTicketForm({...ticketForm,sujet:e.target.value})} placeholder="Résumé du problème"/>
        </div>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Priorité</label>
          <Sel value={ticketForm.priorite} onChange={e=>setTicketForm({...ticketForm,priorite:e.target.value})}>
            <option value="basse">Basse</option>
            <option value="normale">Normale</option>
            <option value="haute">Haute — bloquant</option>
          </Sel>
        </div>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Description</label>
          <textarea value={ticketForm.message} onChange={e=>setTicketForm({...ticketForm,message:e.target.value})} placeholder="Décrivez le problème en détail" rows={5} style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:13,fontFamily:"inherit",resize:"vertical"}}/>
        </div>
        <Btn onClick={envoyerTicket} disabled={envoiTicket} style={{fontSize:12}}>{envoiTicket?"⏳ Envoi...":"📨 Envoyer le ticket"}</Btn>
      </Card>
      <Card>
        <STitle>📋 Mes tickets</STitle>
        {loadingTickets?<div style={{textAlign:"center",padding:16,color:C.muted}}>Chargement...</div>:mesTickets.length===0?<div style={{textAlign:"center",padding:16,color:C.muted,fontSize:12}}>Aucun ticket envoyé</div>:mesTickets.map(tk=><div key={tk.id} style={{padding:10,borderBottom:`1px solid ${C.border}22`}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:600,fontSize:12}}>{tk.sujet}</span><Pill color={tk.statut==="ouvert"?C.orange:C.green}>{tk.statut}</Pill></div>
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>{tk.message}</div>
          {tk.reponse&&<div style={{fontSize:11,color:C.green,marginTop:6,background:`${C.green}0D`,padding:8,borderRadius:6}}>↳ {tk.reponse}</div>}
        </div>)}
      </Card>
    </div>}
    {onglet==="rgpd"&&<div>
      <div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,color:C.blue,fontWeight:600,marginBottom:6}}>🔒 CONFORMITÉ RGPD — RÈGLEMENT GÉNÉRAL SUR LA PROTECTION DES DONNÉES</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>Xyra est conforme au RGPD. Vos données sont chiffrées (AES-256), hébergées en Europe (Supabase EU) et ne sont jamais revendues.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Vos données</STitle>
          {[["Données personnelles","Prénom, nom, email, téléphone"],["Données entreprise","SIREN, TVA, adresse"],["Données financières","Chiffrées AES-256"],["Hébergement","Supabase — Europe (Frankfurt)"],["Durée conservation","5 ans légal / Compte actif"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:C.text,fontSize:10}}>{v}</span></div>)}
        </Card>
        <Card>
          <STitle>✅ Droits RGPD</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Btn onClick={()=>showToast("📦 Export de vos données en cours — email dans 24h")} style={{background:C.blue}}>📦 Exporter toutes mes données</Btn>
            <BtnGhost onClick={()=>showToast("📧 Demande envoyée à DPO@xyra.io")}>✏️ Demander rectification</BtnGhost>
            <BtnGhost onClick={()=>showToast("⏳ Demande de suppression envoyée — traitement 30j")} style={{color:C.orange,borderColor:`${C.orange}44`}}>🗑 Demander suppression données</BtnGhost>
            <div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:8,padding:10}}>
              <div style={{fontSize:10,color:C.red,fontWeight:600,marginBottom:4}}>⚠️ Zone dangereuse</div>
              <BtnGhost onClick={()=>showToast("⚠️ Confirmez la suppression dans l'email envoyé")} style={{width:"100%",color:C.red,borderColor:`${C.red}44`,fontSize:11}}>🗑 Supprimer mon compte</BtnGhost>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <STitle>🍪 Politique de confidentialité</STitle>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.7,marginBottom:10}}>Xyra collecte uniquement les données nécessaires au fonctionnement du service. Aucune donnée n'est partagée avec des tiers sans consentement explicite. Vous pouvez exercer vos droits à tout moment en contactant dpo@xyra.io</div>
        <div style={{display:"flex",gap:8}}><BtnGhost onClick={()=>showToast("📄 Politique confidentialité téléchargée")}>📄 Télécharger PDF</BtnGhost><BtnGhost onClick={()=>showToast("📧 Email DPO ouvert")}>📧 Contacter le DPO</BtnGhost></div>
      </Card>
    </div>}
  </div>;
};

export default PageSettings;
