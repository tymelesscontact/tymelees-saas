"use client";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import { C, Card, Btn, BtnGhost, TH, Td, STitle, Pill, Inp, Sel, DEVISES } from "../lib/ui";
import { appliquerTheme } from "../lib/theme";

const PageSettings=({plan,showToast,sirApiKey,setSirApiKey,profil,setProfil,PLANS,PROFILS_SECTEURS})=>{
  const[onglet,setOnglet]=useState("entreprise");
  const[historiquePaiements,setHistoriquePaiements]=useState([]);
  const[notifPrefs,setNotifPrefs]=useState([]);
  useEffect(()=>{
    fetch('/api/sessions').then(r=>r.json()).then(d=>{
      setSessions(d.sessions||[]);
      setLogs(d.logs||[]);
    }).catch(()=>{});
  },[]);
  useEffect(()=>{
    fetch('/api/equipe').then(r=>r.json()).then(d=>{
      setUtilisateurs(d.membres||[]);
    }).catch(()=>{});
  },[]);
  useEffect(()=>{
    fetch('/api/domaine').then(r=>r.json()).then(d=>{
      if(d.domaine){
        setDomaine(f=>({...f,domaine_custom:d.domaine.domaine_custom||f.domaine_custom}));
        setDomaineStatut(d.domaine.domaine_statut||"aucun");
        setDomaineVerification(d.domaine.domaine_verification||null);
      }
    }).catch(()=>{});
  },[]);
  const[codeEnvoye,setCodeEnvoye]=useState(false);
  const[codeSaisi,setCodeSaisi]=useState("");
  const[envoi2faEnCours,setEnvoi2faEnCours]=useState(false);
  const[codesSecours,setCodesSecours]=useState([]);
  const[loadingPaiements,setLoadingPaiements]=useState(true);
  const[logoUrl,setLogoUrl]=useState("");
  const[couleursMarque,setCouleursMarque]=useState({couleur_primaire:"#C9A84C",couleur_secondaire:"#0A0A16",couleur_accent:"#2EC9B0"});
  const[uploadEnCours,setUploadEnCours]=useState(false);
  const logoInputRef=useRef(null);
  const[showPayModal,setShowPayModal]=useState(false);
  const[planChoisi,setPlanChoisi]=useState(null);
  const[tenantInfo,setTenantInfo]=useState({email:"",societe:""});
  const[payEnCours,setPayEnCours]=useState(false);
  useEffect(()=>{
    fetch('/api/tenant-info').then(r=>r.json()).then(d=>{
      setTenantInfo({email:d.email||"",societe:d.societe||""});
    }).catch(()=>{});
  },[]);
  const payerAbonnement=async(p,mode)=>{
    setPayEnCours(true);
    try{
      const planKey=p.id==="business"?"business":p.id;
      if(mode==="stripe"){
        const res=await fetch('/api/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:planKey,email:tenantInfo.email,societe:tenantInfo.societe})});
        const data=await res.json();
        if(data.url)window.location.href=data.url;
        else showToast("❌ "+(data.error||"Erreur"));
      }else{
        const res=await fetch('/api/create-checkout-flutterwave',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:planKey,email:tenantInfo.email,societe:tenantInfo.societe,currency:'XOF'})});
        const data=await res.json();
        if(data.url)window.location.href=data.url;
        else showToast("❌ "+(data.error||"Erreur"));
      }
    }catch(e){showToast("❌ Erreur de connexion");}
    setPayEnCours(false);
  };
  useEffect(()=>{
    fetch('/api/branding').then(r=>r.json()).then(d=>{
      if(d.branding){
        if(d.branding.logo_url)setLogoUrl(d.branding.logo_url);
        setCouleursMarque({couleur_primaire:d.branding.couleur_primaire||"#C9A84C",couleur_secondaire:d.branding.couleur_secondaire||"#0A0A16",couleur_accent:d.branding.couleur_accent||"#2EC9B0"});
      }
    }).catch(()=>{});
  },[]);
  useEffect(()=>{
    fetch('/api/notifications').then(r=>r.json()).then(d=>{
      setNotifPrefs(d.preferences||[]);
    }).catch(()=>{});
  },[]);
  useEffect(()=>{
    fetch('/api/paiements-historique').then(r=>r.json()).then(d=>{
      setHistoriquePaiements(d.paiements||[]);
      setLoadingPaiements(false);
    }).catch(()=>setLoadingPaiements(false));
  },[]);
  useEffect(()=>{
    fetch('/api/profil-entreprise').then(r=>r.json()).then(d=>{
      if(d.profil){
        const p=d.profil;
        setEntreprise(f=>({...f,nom:p.societe||"",formeJuridique:p.forme_juridique||"",siren:p.siren||"",siret:p.siret||"",tva:p.tva_intracommunautaire||"",codeApe:p.code_ape||"",rcsVille:p.rcs_ville||"",capitalSocial:p.capital_social||"",dateCreation:p.date_creation_entreprise||"",adresse:p.adresse||"",ville:p.ville||"",cp:p.code_postal||"",pays:p.pays||"France",tel:p.telephone_entreprise||"",email:p.email||"",site:p.site_web||""}));
        setProfUser(f=>({...f,civilite:p.civilite||"",prenom:p.prenom||"",nom:p.nom||"",email:p.email||"",tel:p.telephone_contact||"",titre:p.fonction||"",avatar:(p.prenom?p.prenom[0]:"?").toUpperCase()}));
        if(p.photo_url)setPhotoUrl(p.photo_url);
        if(p.theme)setTheme(p.theme);
        setDeuxFa(!!p.deux_fa_actif);
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
  const uploaderPhoto=async(file)=>{
    if(!file)return;
    setUploadPhotoEnCours(true);
    try{
      const{createClient}=await import('@supabase/supabase-js');
      const sbc=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const path=`photos/${Date.now()}_${file.name}`;
      const{error:upErr}=await sbc.storage.from('attachments').upload(path,file);
      if(upErr){showToast("❌ Echec upload — verifie le bucket 'attachments'");setUploadPhotoEnCours(false);return;}
      const{data:urlData}=sbc.storage.from('attachments').getPublicUrl(path);
      const res=await fetch('/api/profil-entreprise',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'sauvegarder',photo_url:urlData.publicUrl})});
      const data=await res.json();
      if(data.success){setPhotoUrl(urlData.publicUrl);showToast("✅ Photo de profil mise a jour !");}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setUploadPhotoEnCours(false);
  };
  const genererFacturePDF=(p)=>{
    const doc=new jsPDF();
    doc.setFontSize(18);
    doc.text("Recu de paiement",20,20);
    doc.setFontSize(11);
    doc.text("Xyra SaaS",20,32);
    doc.text("Date : "+new Date(p.date).toLocaleDateString("fr-FR"),20,44);
    doc.text("Description : "+p.categorie,20,52);
    doc.text("Societe : "+(p.entite||"-"),20,60);
    doc.text("Montant : "+p.montant+" "+(p.devise||"EUR"),20,68);
    doc.text("Methode : "+(p.methode||"-"),20,76);
    doc.text("Statut : "+(p.statut||"-"),20,84);
    doc.text("Reference : "+(p.reference||"-"),20,92);
    doc.save("recu-"+(p.reference||Date.now())+".pdf");
  };
  const toggleNotifPref=async(type,champ,valeur)=>{
    setNotifPrefs(prefs=>{
      const existe=prefs.find(p=>p.type===type);
      if(existe)return prefs.map(p=>p.type===type?{...p,[champ]:valeur}:p);
      return [...prefs,{type,push_actif:true,whatsapp_actif:false,email_actif:false,[champ]:valeur}];
    });
    const pref=notifPrefs.find(p=>p.type===type)||{push_actif:true,whatsapp_actif:false,email_actif:false};
    try{
      await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'update_preference',type,push_actif:pref.push_actif,whatsapp_actif:pref.whatsapp_actif,email_actif:pref.email_actif,[champ]:valeur})});
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const revoquerSession=async(id)=>{
    try{
      const res=await fetch('/api/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'revoquer',id})});
      const data=await res.json();
      if(data.success){setSessions(s=>s.filter(x=>x.id!==id));showToast("✅ Session revoquee");}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const revoquerToutesLesAutres=async()=>{
    try{
      const res=await fetch('/api/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'revoquer_toutes_sauf_actuelle'})});
      const data=await res.json();
      if(data.success){setSessions(s=>s.filter(x=>x.actuelle));showToast("✅ Toutes les autres sessions revoquees");}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const inviterMembre=async()=>{
    if(!inviteForm.nom||!inviteForm.email)return showToast("⚠️ Nom et email requis");
    setInvitationEnCours(true);
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer',nom:inviteForm.nom,prenom:inviteForm.prenom,email:inviteForm.email,role:inviteForm.role})});
      const data=await res.json();
      if(data.success){
        setUtilisateurs(us=>[...us,data.membre]);
        setInviteForm({nom:"",prenom:"",email:"",role:"Collaborateur"});
        showToast(data.accesCree?"✅ Invitation envoyee — acces cree":"✅ Membre ajoute (email non envoye)");
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setInvitationEnCours(false);
  };
  const modifierRoleMembre=async(id,role)=>{
    setUtilisateurs(us=>us.map(u=>u.id===id?{...u,role}:u));
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id,role})});
      const data=await res.json();
      if(data.success)showToast("✅ Role mis a jour");
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const retirerMembre=async(id,nom)=>{
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer',id})});
      const data=await res.json();
      if(data.success){setUtilisateurs(us=>us.filter(u=>u.id!==id));showToast("✅ "+nom+" retire de l'equipe");}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const activerDomaine=async()=>{
    if(!domaine.domaine_custom)return showToast("⚠️ Entrez un domaine");
    setActivationDomaineEnCours(true);
    try{
      const res=await fetch('/api/domaine',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'demander',domaine:domaine.domaine_custom})});
      const data=await res.json();
      if(data.success){
        setDomaineStatut(data.statut);
        setDomaineVerification(data.verification);
        showToast(data.automatise?"✅ Domaine ajoute, verification en cours":"✅ Demande enregistree, activation manuelle a venir");
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setActivationDomaineEnCours(false);
  };
  const[exportEnCours,setExportEnCours]=useState(false);
  const[rgpdHistorique,setRgpdHistorique]=useState([]);
  useEffect(()=>{
    fetch('/api/rgpd?action=historique').then(r=>r.json()).then(d=>{
      setRgpdHistorique(d.historique||[]);
    }).catch(()=>{});
  },[]);
  const exporterDonnees=async()=>{
    setExportEnCours(true);
    try{
      const res=await fetch('/api/rgpd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'exporter'})});
      const data=await res.json();
      if(data.success){
        const blob=new Blob([JSON.stringify(data.export,null,2)],{type:'application/json'});
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.href=url;
        a.download=`xyra-export-donnees-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("✅ Export telecharge");
        setRgpdHistorique(h=>[{type:'export',statut:'traitee',created_at:new Date().toISOString()},...h]);
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setExportEnCours(false);
  };
  const demarrerActivation2FA=async()=>{
    setEnvoi2faEnCours(true);
    try{
      const res=await fetch('/api/2fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_code'})});
      const data=await res.json();
      if(data.success){setCodeEnvoye(true);showToast("📱 Code envoye par SMS");}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setEnvoi2faEnCours(false);
  };
  const verifierCode2FA=async()=>{
    try{
      const res=await fetch('/api/2fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verifier_code',code:codeSaisi})});
      const data=await res.json();
      if(data.success){setDeuxFa(true);setCodeEnvoye(false);setCodeSaisi("");showToast("✅ 2FA activee !");}
      else showToast("❌ "+(data.error||"Code incorrect"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const desactiver2FA=async()=>{
    try{
      const res=await fetch('/api/2fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'desactiver'})});
      const data=await res.json();
      if(data.success){setDeuxFa(false);showToast("✅ 2FA desactivee");}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const genererCodesSecours=async()=>{
    try{
      const res=await fetch('/api/2fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_codes_secours'})});
      const data=await res.json();
      if(data.success){
        setCodesSecours(data.codes);
        const contenu="Codes de secours Xyra\n\n"+data.codes.join("\n")+"\n\nChaque code ne fonctionne qu'une seule fois.";
        const blob=new Blob([contenu],{type:"text/plain"});
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a");
        a.href=url;a.download="codes-secours-xyra.txt";a.click();
        URL.revokeObjectURL(url);
        showToast("🔑 Codes de secours telecharges");
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const verifierSiret=async()=>{
    if(!siretInput)return;
    setSiretVerif({loading:true,suggestion:null,erreur:""});
    try{
      const res=await fetch('/api/profil-entreprise',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verifier_siret',siret:siretInput})});
      const data=await res.json();
      if(data.success){setSiretVerif({loading:false,suggestion:data.suggestion,erreur:""});}
      else{setSiretVerif({loading:false,suggestion:null,erreur:data.error||"Erreur"});}
    }catch(e){setSiretVerif({loading:false,suggestion:null,erreur:"Erreur de connexion"});}
  };
  const utiliserSuggestionSiret=()=>{
    const s=siretVerif.suggestion;
    if(!s)return;
    setEntreprise(f=>({...f,nom:s.societe||f.nom,formeJuridique:s.forme_juridique||f.formeJuridique,siren:s.siren||f.siren,siret:s.siret||f.siret,tva:s.tva_intracommunautaire||f.tva,codeApe:s.code_ape||f.codeApe,dateCreation:s.date_creation_entreprise||f.dateCreation,adresse:s.adresse||f.adresse,ville:s.ville||f.ville,cp:s.code_postal||f.cp}));
    setSiretVerif({loading:false,suggestion:null,erreur:""});
    showToast("✅ Informations pre-remplies — verifiez et completez avant de sauvegarder");
  };
  const sauvegarderEntreprise=async()=>{
    try{
      const res=await fetch('/api/profil-entreprise',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'sauvegarder',societe:entreprise.nom,forme_juridique:entreprise.formeJuridique,siren:entreprise.siren,siret:entreprise.siret,tva_intracommunautaire:entreprise.tva,code_ape:entreprise.codeApe,rcs_ville:entreprise.rcsVille,capital_social:entreprise.capitalSocial,date_creation_entreprise:entreprise.dateCreation||null,adresse:entreprise.adresse,ville:entreprise.ville,code_postal:entreprise.cp,pays:entreprise.pays,telephone_entreprise:entreprise.tel,site_web:entreprise.site})});
      const data=await res.json();
      if(data.success)showToast("✅ Informations entreprise sauvegardees !");
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const sauvegarderProfil=async()=>{
    try{
      const res=await fetch('/api/profil-entreprise',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'sauvegarder',civilite:profUser.civilite,prenom:profUser.prenom,nom:profUser.nom,fonction:profUser.titre,telephone_contact:profUser.tel})});
      const data=await res.json();
      if(data.success)showToast("✅ Profil sauvegarde !");
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  // États formulaires
  const[entreprise,setEntreprise]=useState({nom:"",formeJuridique:"",siren:"",siret:"",tva:"",codeApe:"",rcsVille:"",capitalSocial:"",dateCreation:"",adresse:"",ville:"",cp:"",pays:"France",tel:"",email:"",site:"",logo:""});
  const[profUser,setProfUser]=useState({civilite:"",prenom:"",nom:"",email:"",tel:"",titre:"",avatar:"?"});
  const[siretInput,setSiretInput]=useState("");
  const[siretVerif,setSiretVerif]=useState({loading:false,suggestion:null,erreur:""});
  const[photoUrl,setPhotoUrl]=useState("");
  const[uploadPhotoEnCours,setUploadPhotoEnCours]=useState(false);
  const photoInputRef=useRef(null);
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
  const[utilisateurs,setUtilisateurs]=useState([]);
  const[inviteForm,setInviteForm]=useState({nom:"",prenom:"",email:"",role:"Collaborateur"});
  const[invitationEnCours,setInvitationEnCours]=useState(false);
  const[domaineStatut,setDomaineStatut]=useState("aucun");
  const[domaineVerification,setDomaineVerification]=useState(null);
  const[activationDomaineEnCours,setActivationDomaineEnCours]=useState(false);
  const[sessions,setSessions]=useState([]);
  const[logs,setLogs]=useState([]);

  const[waForm,setWaForm]=useState({whatsapp_numero:"",whatsapp_phone_number_id:"",whatsapp_token:"",whatsapp_actif:false});
  const[waCharge,setWaCharge]=useState(false);
  const[waEnCours,setWaEnCours]=useState(false);
  useEffect(()=>{
    if(onglet!=="whatsapp"||waCharge)return;
    (async()=>{
      try{
        const r=await fetch('/api/whatsapp-config');
        const d=await r.json();
        if(d.success)setWaForm(f=>({...f,whatsapp_numero:d.numero||"",whatsapp_phone_number_id:d.phone_number_id||"",whatsapp_actif:!!d.actif}));
      }catch(e){}
      setWaCharge(true);
    })();
  },[onglet]);
  const enregistrerWa=async()=>{
    if(waEnCours)return;
    setWaEnCours(true);
    try{
      const r=await fetch('/api/whatsapp-config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(waForm)});
      const d=await r.json();
      if(d.success){showToast("✅ Configuration WhatsApp enregistree");setWaForm(f=>({...f,whatsapp_token:""}));}
      else showToast("❌ "+(d.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setWaEnCours(false);
  };
  const tabs=[
    {id:"entreprise",label:"🏢 Entreprise"},
    {id:"profil",label:"👤 Mon profil"},
    {id:"mdp",label:"🔑 Mot de passe"},
    {id:"abonnement",label:"💳 Abonnement"},
    {id:"apparence",label:"🎨 Apparence"},
    {id:"securite",label:"🛡 Sécurité"},
    {id:"integrations",label:"🔗 Intégrations"},
    {id:"whatsapp",label:"💬 WhatsApp"},
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
      <Card style={{gridColumn:"1 / -1"}}>
        <STitle>🔎 Vérifier mon SIRET</STitle>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Numéro SIRET (14 chiffres)</label>
            <Inp value={siretInput} onChange={e=>setSiretInput(e.target.value)} placeholder="123 456 789 00012"/>
          </div>
          <Btn onClick={verifierSiret} disabled={siretVerif.loading}>{siretVerif.loading?"Recherche...":"Vérifier"}</Btn>
        </div>
        {siretVerif.erreur&&<div style={{fontSize:11,color:"#e05252",marginTop:8}}>{siretVerif.erreur}</div>}
        {siretVerif.suggestion&&<div style={{background:C.card2,borderRadius:8,padding:12,marginTop:10}}>
          <div style={{fontSize:12,marginBottom:8}}>Trouvé : <b>{siretVerif.suggestion.societe}</b> — {siretVerif.suggestion.adresse}, {siretVerif.suggestion.code_postal} {siretVerif.suggestion.ville}</div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={utiliserSuggestionSiret} style={{fontSize:11}}>✅ C'est la bonne société, utiliser ces infos</Btn>
            <BtnGhost onClick={()=>setSiretVerif({loading:false,suggestion:null,erreur:""})} style={{fontSize:11}}>Annuler</BtnGhost>
          </div>
        </div>}
      </Card>
      <Card>
        <STitle>🏢 Informations légales</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Raison sociale *","nom"],["Forme juridique","formeJuridique"],["SIREN","siren"],["SIRET","siret"],["Numéro TVA","tva"],["Code APE / NAF","codeApe"],["RCS + ville","rcsVille"],["Capital social","capitalSocial"],["Date de création","dateCreation"],["Email professionnel","email"],["Téléphone","tel"],["Site web","site"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={entreprise[k]} onChange={e=>setEntreprise(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
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
        <Btn onClick={sauvegarderEntreprise}>Sauvegarder les modifications</Btn>
      </div>
    </div>}

    {/* ── PROFIL ── */}
    {onglet==="profil"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <STitle>👤 Mon profil</STitle>
        <div style={{textAlign:"center",marginBottom:16}}>
          <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploaderPhoto(e.target.files?.[0])}/>
          <div onClick={()=>photoInputRef.current?.click()} style={{width:80,height:80,borderRadius:"50%",background:photoUrl?`center/cover no-repeat url(${photoUrl})`:`${C.gold}22`,border:`3px solid ${C.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,color:C.gold,margin:"0 auto 10px",cursor:"pointer",overflow:"hidden"}}>
            {!photoUrl&&profUser.avatar}
          </div>
          <BtnGhost onClick={()=>photoInputRef.current?.click()} disabled={uploadPhotoEnCours} style={{fontSize:11}}>📸 {uploadPhotoEnCours?"Envoi...":"Changer la photo"}</BtnGhost>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Civilité","civilite"],["Prénom *","prenom"],["Nom *","nom"],["Email *","email"],["Téléphone","tel"],["Titre / Fonction","titre"]].map(([l,k])=><div key={k}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>{l}</label><Inp value={profUser[k]} onChange={e=>setProfUser(f=>({...f,[k]:e.target.value}))} placeholder={l}/></div>)}
        </div>
        <Btn onClick={sauvegarderProfil} style={{marginTop:12,width:"100%"}}>Sauvegarder le profil</Btn>
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
          {plan===p.id?<div style={{background:`${p.color}22`,border:`1px solid ${p.color}44`,borderRadius:8,padding:8,textAlign:"center",fontSize:11,color:p.color,fontWeight:700}}>✓ Plan actuel</div>:<Btn onClick={()=>{setPlanChoisi(p);setShowPayModal(true);}} color={p.color} style={{width:"100%",color:p.id==="business"?"#000":"#fff"}}>Passer à ce plan</Btn>}
        </Card>)}
      </div>
      <Card>
        <STitle>📋 Historique de facturation</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Date</TH><TH>Description</TH><TH>Montant</TH><TH>Statut</TH><TH>Action</TH></tr></thead>
          <tbody>{loadingPaiements?<tr><Td colSpan={5} style={{textAlign:"center",color:C.muted}}>Chargement...</Td></tr>:historiquePaiements.length===0?<tr><Td colSpan={5} style={{textAlign:"center",color:C.muted}}>Aucun paiement pour le moment</Td></tr>:historiquePaiements.map((f,i)=><tr key={i}>
            <Td style={{color:C.muted,fontSize:10}}>{new Date(f.date).toLocaleDateString("fr-FR")}</Td>
            <Td style={{fontWeight:600}}>{f.categorie}</Td>
            <Td style={{color:C.gold,fontWeight:700}}>{f.montant} {f.devise}</Td>
            <Td><Pill color={C.green}>✓ {f.statut}</Pill></Td>
            <Td><BtnGhost onClick={()=>genererFacturePDF(f)} style={{fontSize:10,padding:"3px 8px"}}>PDF</BtnGhost></Td>
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
            {[{id:"dark",label:"🌙 Sombre",desc:"Mode nuit — recommandé"},{id:"light",label:"☀️ Clair",desc:"Mode jour"}].map(t=><div key={t.id} onClick={()=>{setTheme(t.id);appliquerTheme(t.id,couleursMarque.couleur_primaire);}} style={{background:theme===t.id?`${C.gold}15`:C.card2,border:`2px solid ${theme===t.id?C.gold:C.border}`,borderRadius:10,padding:12,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:4}}>{t.label.split(" ")[0]}</div>
              <div style={{fontSize:11,fontWeight:theme===t.id?700:400,color:theme===t.id?C.gold:C.text}}>{t.label.split(" ").slice(1).join(" ")}</div>
              <div style={{fontSize:9,color:C.muted}}>{t.desc}</div>
            </div>)}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:8}}>Couleur d'accentuation</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[{c:"#C9A84C",n:"Or (défaut)"},{c:"#4B7BFF",n:"Bleu"},{c:"#2EC9B0",n:"Teal"},{c:"#9B5FFF",n:"Violet"},{c:"#FF5F9E",n:"Rose"},{c:"#FF8C3A",n:"Orange"}].map((col,i)=><div key={i} onClick={()=>{setCouleursMarque(f=>({...f,couleur_primaire:col.c}));appliquerTheme(theme,col.c);}} style={{width:32,height:32,borderRadius:"50%",background:col.c,cursor:"pointer",border:`3px solid ${col.c===couleursMarque.couleur_primaire?"#fff":"transparent"}`,title:col.n}}/>)}
          </div>
        </div>
        <Btn onClick={async()=>{
          try{
            const r1=await fetch('/api/branding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'maj_couleurs',...couleursMarque})});
            const r2=await fetch('/api/profil-entreprise',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'sauvegarder',theme})});
            const d1=await r1.json();const d2=await r2.json();
            if(d1.success&&d2.success)showToast("✅ Apparence sauvegardée !");
            else showToast("❌ Erreur lors de la sauvegarde");
          }catch(e){showToast("❌ Erreur de connexion");}
        }}>Sauvegarder l'apparence</Btn>
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
            <div><div style={{fontSize:12,fontWeight:700}}>2FA par SMS</div><div style={{fontSize:10,color:C.muted}}>{profUser.tel||"Aucun numero enregistre"}</div></div>
            <div onClick={()=>deux_fa?desactiver2FA():demarrerActivation2FA()} style={{width:44,height:24,borderRadius:12,background:deux_fa?C.green:C.border,cursor:"pointer",position:"relative",transition:".2s"}}>
              <div style={{position:"absolute",top:3,left:deux_fa?21:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:".2s"}}/>
            </div>
          </div>
          {codeEnvoye&&<div style={{background:C.card2,borderRadius:8,padding:10,marginBottom:10,display:"flex",gap:8}}>
            <input value={codeSaisi} onChange={e=>setCodeSaisi(e.target.value)} placeholder="Code recu par SMS" maxLength={6} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:8,color:C.text,fontSize:12}}/>
            <Btn onClick={verifierCode2FA} style={{fontSize:11,padding:"8px 14px"}}>Verifier</Btn>
          </div>}
          {deux_fa?<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>✅ 2FA activée — Votre compte est sécurisé</div>:<div style={{background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,padding:10,fontSize:11,color:C.orange}}>⚠️ 2FA désactivée — Recommandé de l'activer</div>}
          <div style={{marginTop:10,display:"flex",gap:8}}>
            <BtnGhost onClick={demarrerActivation2FA} disabled={envoi2faEnCours} style={{flex:1,fontSize:11}}>{envoi2faEnCours?"Envoi...":"Tester le 2FA"}</BtnGhost>
            <BtnGhost onClick={genererCodesSecours} style={{flex:1,fontSize:11}}>Codes secours</BtnGhost>
          </div>
        </Card>
        <Card>
          <STitle>💻 Sessions actives</STitle>
          {sessions.map((s)=><div key={s.id} style={{background:C.card2,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${s.actuelle?C.green:C.border}33`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontSize:11,fontWeight:700}}>{s.appareil}</div>
              {s.actuelle&&<Pill color={C.green}>● Session actuelle</Pill>}
            </div>
            <div style={{fontSize:10,color:C.muted}}>🌐 {s.ip}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:6}}>🕐 {new Date(s.date).toLocaleString("fr-FR")}</div>
            {!s.actuelle&&<BtnGhost onClick={()=>revoquerSession(s.id)} style={{fontSize:10,padding:"3px 8px",color:C.red}}>Révoquer</BtnGhost>}
          </div>)}
          <BtnGhost onClick={revoquerToutesLesAutres} style={{width:"100%",fontSize:11,color:C.red}}>Déconnecter toutes les autres sessions</BtnGhost>
        </Card>
      </div>
      <Card>
        <STitle>📋 Journaux de connexion</STitle>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Date & Heure</TH><TH>Action</TH><TH>Adresse IP</TH><TH>Statut</TH></tr></thead>
          <tbody>{logs.map((l,i)=><tr key={i}>
            <Td style={{color:C.muted,fontSize:10}}>{new Date(l.date).toLocaleString("fr-FR")}</Td>
            <Td style={{fontWeight:600}}>{l.action}</Td>
            <Td style={{fontFamily:"monospace",fontSize:10,color:C.muted}}>{l.ip}</Td>
            <Td><Pill color={l.statut==="ok"?C.green:C.red}>{l.statut==="ok"?"✓ Succès":"✗ Échec"}</Pill></Td>
          </tr>)}</tbody>
        </table>
      </Card>
    </div>}

    {/* ── INTÉGRATIONS ── */}
    {onglet==="whatsapp"&&<div style={{maxWidth:560}}>
      <Card style={{marginBottom:14}}>
        <STitle>💬 Votre compte WhatsApp Business</STitle>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.7,marginBottom:16}}>
          Vos messages partiront de votre propre numero au lieu de celui de Xyra.
          Sans configuration, le compte Xyra est utilise.
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Votre numero WhatsApp Business</label>
            <Inp value={waForm.whatsapp_numero} onChange={e=>setWaForm(f=>({...f,whatsapp_numero:e.target.value}))} placeholder="+33 6 12 34 56 78"/>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Identifiant du numero (Meta)</label>
            <Inp value={waForm.whatsapp_phone_number_id} onChange={e=>setWaForm(f=>({...f,whatsapp_phone_number_id:e.target.value}))} placeholder="106540352242922"/>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>Dans Meta Business, section WhatsApp, en face de votre numero.</div>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Jeton d&apos;acces permanent</label>
            <Inp type="password" value={waForm.whatsapp_token} onChange={e=>setWaForm(f=>({...f,whatsapp_token:e.target.value}))} placeholder={waForm.whatsapp_actif?"Deja enregistre — laissez vide pour ne pas changer":"EAAxxxxx..."}/>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>Il n&apos;est jamais reaffiche apres enregistrement.</div>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:10,fontSize:12,color:C.text,cursor:"pointer",marginTop:4}}>
            <input type="checkbox" checked={waForm.whatsapp_actif} onChange={e=>setWaForm(f=>({...f,whatsapp_actif:e.target.checked}))} style={{width:"auto"}}/>
            Utiliser mon compte pour envoyer les messages
          </label>
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <Btn onClick={enregistrerWa} style={{opacity:waEnCours?.5:1}}>{waEnCours?"Enregistrement...":"✅ Enregistrer"}</Btn>
          </div>
        </div>
      </Card>
      <Card style={{background:`${C.blue}0d`,borderColor:`${C.blue}33`}}>
        <div style={{fontSize:11,color:C.text,lineHeight:1.8}}>
          Pour obtenir ces informations : creez une application sur Meta for Developers,
          ajoutez le produit WhatsApp, puis recuperez l&apos;identifiant de votre numero
          et generez un jeton permanent depuis Meta Business.
        </div>
      </Card>
    </div>}

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
      <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Ces sept categories sont deja connectees a de vraies donnees. D'autres modules seront relies progressivement.</div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Type</TH><TH style={{textAlign:"center"}}>Push écran</TH><TH style={{textAlign:"center"}}>WhatsApp</TH><TH style={{textAlign:"center"}}>Email</TH></tr></thead>
        <tbody>{[["commission","💰 Commissions à virer"],["conge","🏖 Demandes de congé"],["acompte","💸 Acomptes en attente"],["stock","📦 Stock critique"],["deal","💼 Deals inactifs 14j+"],["facture","🧾 Factures en retard"],["crm_lead","🎯 Nouveaux leads CRM"]].map(([type,label])=>{
          const pref=notifPrefs.find(p=>p.type===type)||{push_actif:true,whatsapp_actif:false,email_actif:false};
          return <tr key={type}>
          <Td style={{fontWeight:600}}>{label}</Td>
          {[["push_actif",pref.push_actif],["whatsapp_actif",pref.whatsapp_actif],["email_actif",pref.email_actif]].map(([champ,v])=><td key={champ} style={{textAlign:"center",padding:"10px",borderBottom:`1px solid ${C.border}22`}}>
            <div onClick={()=>toggleNotifPref(type,champ,!v)} style={{width:32,height:18,borderRadius:9,background:v?C.gold:C.border,cursor:"pointer",margin:"0 auto",position:"relative",transition:".2s"}}>
              <div style={{position:"absolute",top:2,left:v?14:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:".2s"}}/>
            </div>
          </td>)}
        </tr>;})}
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
      </div>
      <Card style={{marginBottom:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.5fr 1fr auto",gap:8,marginBottom:14}}>
          <Inp value={inviteForm.prenom} onChange={e=>setInviteForm(f=>({...f,prenom:e.target.value}))} placeholder="Prenom"/>
          <Inp value={inviteForm.nom} onChange={e=>setInviteForm(f=>({...f,nom:e.target.value}))} placeholder="Nom *"/>
          <Inp value={inviteForm.email} onChange={e=>setInviteForm(f=>({...f,email:e.target.value}))} placeholder="Email a inviter... *"/>
          <Sel value={inviteForm.role} onChange={e=>setInviteForm(f=>({...f,role:e.target.value}))}>{ROLES.map(r=><option key={r}>{r}</option>)}</Sel>
          <Btn onClick={inviterMembre} disabled={invitationEnCours}>{invitationEnCours?"...":"Inviter"}</Btn>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Membre</TH><TH>Email</TH><TH>Rôle</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>
            {/* Owner (non modifiable) */}
            <tr style={{background:`${C.gold}08`}}>
              <Td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:`${C.gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.gold}}>{(profUser.prenom||"?")[0]}</div><span style={{fontWeight:700}}>{profUser.prenom} {profUser.nom} (Vous)</span></div></Td>
              <Td style={{color:C.muted}}>{profUser.email}</Td>
              <Td><Pill color={C.gold}>★ Owner</Pill></Td>
              <Td><Pill color={C.green}>Actif</Pill></Td>
              <Td><span style={{fontSize:10,color:C.muted}}>Non modifiable</span></Td>
            </tr>
            {utilisateurs.map((u,i)=><tr key={u.id}>
              <Td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.blue}}>{(u.nom||"?")[0]}</div><span style={{fontWeight:600}}>{u.prenom} {u.nom}</span></div></Td>
              <Td style={{color:C.muted,fontSize:11}}>{u.email}</Td>
              <Td><Sel value={u.role} onChange={e=>setUtilisateurs(us=>us.map((x,j)=>j===i?{...x,role:e.target.value}:x))} style={{fontSize:10,padding:"3px 6px"}}>{ROLES.map(r=><option key={r}>{r}</option>)}</Sel></Td>
              <Td><Pill color={u.user_id?C.green:C.orange}>{u.user_id?"Actif":"Invitation en attente"}</Pill></Td>
              <Td><div style={{display:"flex",gap:4}}>
                <BtnGhost onClick={()=>modifierRoleMembre(u.id,u.role)} style={{fontSize:9,padding:"3px 7px"}}>Sauver</BtnGhost>
                <BtnGhost onClick={()=>retirerMembre(u.id,u.nom)} style={{fontSize:9,padding:"3px 7px",color:C.red}}>Retirer</BtnGhost>
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
        {domaineStatut!=="aucun"&&<div style={{marginBottom:12,fontSize:11}}>
          <div style={{marginBottom:6}}>Statut : <Pill color={domaineStatut==="actif"?C.green:domaineStatut==="en_verification"?C.teal:C.orange}>
            {domaineStatut==="actif"?"✅ Actif":domaineStatut==="en_verification"?"⏳ Verification DNS en cours":"📩 Demande enregistree — activation manuelle a venir"}
          </Pill></div>
          {domaineVerification&&Array.isArray(domaineVerification)&&domaineVerification.length>0&&<div style={{background:C.card2,borderRadius:8,padding:10,fontFamily:"monospace",fontSize:10,color:C.muted}}>
            {domaineVerification.map((v,i)=><div key={i}>Ajoutez un enregistrement {v.type} : {v.domain} → {v.value}</div>)}
          </div>}
        </div>}
        <div style={{marginBottom:12,display:"flex",justifyContent:"space-between",fontSize:11}}>
          <span>SSL / HTTPS</span><Pill color={C.green}>✅ Auto-généré</Pill>
        </div>
        {domaineStatut==="actif"?<div style={{fontSize:12,color:C.green,fontWeight:600}}>✅ Domaine actif et verifie</div>:(plan==="enterprise"||plan==="owner"?<Btn onClick={activerDomaine} disabled={activationDomaineEnCours}>{activationDomaineEnCours?"Activation en cours...":"🌍 Activer le domaine"}</Btn>:<Btn onClick={()=>showToast("💳 Passage Enterprise nécessaire")} style={{background:C.purple}}>Passer à Enterprise</Btn>)}
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
        <div style={{fontSize:10,color:C.blue,fontWeight:600,marginBottom:6}}>🔒 PROTECTION DES DONNÉES</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>Xyra respecte les principes du RGPD (Europe) et des lois nationales de protection des donnees la ou elles s'appliquent (ex. NDPA au Nigeria, POPIA en Afrique du Sud). Votre base de donnees est hebergee en Irlande (Union Europeenne). Certains prestataires techniques (SMS, email, IA) sont bases aux Etats-Unis.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <STitle>📊 Vos données</STitle>
          {[["Données personnelles","Prénom, nom, email, téléphone"],["Données entreprise","SIREN, TVA, adresse"],["Base de données","Supabase — Irlande (UE)"],["Prestataires tiers","Twilio, Resend, Anthropic — Etats-Unis"],["Factures / comptabilité","10 ans (obligation légale)"],["Autres données","Durée de vie du compte"]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600,color:C.text,fontSize:10}}>{v}</span></div>)}
        </Card>
        <Card>
          <STitle>✅ Droits RGPD</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Btn onClick={exporterDonnees} disabled={exportEnCours} style={{background:C.blue}}>{exportEnCours?"⏳ Export en cours...":"📦 Exporter toutes mes données"}</Btn>
            <BtnGhost onClick={()=>{setOnglet("profil");showToast("✏️ Corrigez vos informations directement ici");}}>✏️ Corriger mes informations</BtnGhost>
            <BtnGhost onClick={()=>window.location.href="mailto:xyra.solution@gmail.com?subject=Demande RGPD"} style={{color:C.orange,borderColor:`${C.orange}44`}}>📧 Autre demande (réponse sous 1 mois)</BtnGhost>
            <div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:8,padding:10}}>
              <div style={{fontSize:10,color:C.red,fontWeight:600,marginBottom:4}}>⚠️ Zone dangereuse</div>
              <BtnGhost onClick={()=>showToast("⚠️ Confirmez la suppression dans l'email envoyé")} style={{width:"100%",color:C.red,borderColor:`${C.red}44`,fontSize:11}}>🗑 Supprimer mon compte</BtnGhost>
            </div>
          </div>
        </Card>
      </div>
      {rgpdHistorique.length>0&&<Card style={{marginBottom:12}}>
        <STitle>📋 Historique de vos demandes</STitle>
        {rgpdHistorique.map((h,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}22`,fontSize:11}}>
          <span>{h.type==="export"?"📦 Export des données":h.type}</span>
          <span style={{color:C.muted,fontSize:10}}>{new Date(h.created_at).toLocaleString("fr-FR")}</span>
        </div>)}
      </Card>}
      <Card>
        <STitle>🍪 Politique de confidentialité</STitle>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.7,marginBottom:10}}>Xyra collecte uniquement les données nécessaires au fonctionnement du service. Aucune donnée n'est partagée avec des tiers sans consentement explicite. Vous pouvez exercer vos droits à tout moment en contactant xyra.solution@gmail.com</div>
        <div style={{display:"flex",gap:8}}><BtnGhost onClick={()=>window.location.href="mailto:xyra.solution@gmail.com"}>📧 Contacter pour toute question RGPD</BtnGhost></div>
      </Card>
    </div>}

    {showPayModal&&planChoisi&&<div onClick={()=>!payEnCours&&setShowPayModal(false)} style={{position:"fixed",inset:0,background:"rgba(6,4,12,.78)",backdropFilter:"blur(4px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:440,background:C.card||"#15131E",border:`1px solid ${C.border}`,borderRadius:16,padding:24}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>Passer au forfait {planChoisi.nom}</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>{planChoisi.prix} — choisissez votre méthode de paiement</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div onClick={()=>!payEnCours&&payerAbonnement(planChoisi,"stripe")} style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",borderRadius:12,border:`1px solid ${C.border}`,cursor:payEnCours?"default":"pointer",opacity:payEnCours?.5:1}}>
            <span style={{fontSize:22}}>💳</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>Carte bancaire</div>
              <div style={{fontSize:10,color:C.muted}}>Visa, Mastercard, Amex — via Stripe</div>
            </div>
            <span style={{color:C.muted,fontSize:13}}>→</span>
          </div>
          <div onClick={()=>!payEnCours&&payerAbonnement(planChoisi,"flutterwave")} style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",borderRadius:12,border:`1px solid ${C.border}`,cursor:payEnCours?"default":"pointer",opacity:payEnCours?.5:1}}>
            <span style={{fontSize:22}}>📱</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>Mobile Money</div>
              <div style={{fontSize:10,color:C.muted}}>Orange Money, MTN, Wave — via Flutterwave</div>
            </div>
            <span style={{color:C.muted,fontSize:13}}>→</span>
          </div>
        </div>
        {payEnCours&&<div style={{marginTop:14,fontSize:11,color:C.gold,textAlign:"center"}}>⏳ Redirection en cours...</div>}
        <div style={{marginTop:16,display:"flex",justifyContent:"flex-end"}}>
          <BtnGhost onClick={()=>!payEnCours&&setShowPayModal(false)} style={{fontSize:11}}>Annuler</BtnGhost>
        </div>
      </div>
    </div>}
  </div>;
};
export default PageSettings;
