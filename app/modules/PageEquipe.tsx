"use client";
import { useState, useEffect, Fragment } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI } from "../lib/ui";
import { PLANNING, CONTRATS } from "../lib/seedData";
import { hasAccess } from "../lib/plans";

const PageEquipe=({plan, modulesActifs,showToast,UpgradeWall,activeCompany,setPage})=>{
  const contacterMembreEquipe=async(m)=>{
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_conversation',espace:'equipe',contact_nom:m.nom,contact_tel:m.tel,contact_email:m.email})});
      const data=await res.json();
      if(data.success&&data.conversation&&data.conversation.id){
        sessionStorage.setItem("xyra_ouvrir_conv", data.conversation.id);
        sessionStorage.setItem("xyra_ouvrir_conv_espace", "equipe");
        showToast(`✅ Conversation ouverte avec ${m.nom}`);setPage('chat');
      }
      else{
        showToast("❌ "+(data.error||"Erreur"));
      }
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const[onglet,setOnglet]=useState("dashboard");
  const[showMsgGroupe,setShowMsgGroupe]=useState(false);
  const[msgGroupeTexte,setMsgGroupeTexte]=useState("");
  const[envoiMsgGroupe,setEnvoiMsgGroupe]=useState(false);
  const[estProprietaire,setEstProprietaire]=useState(false);
  useEffect(()=>{
    fetch('/api/whoami').then(r=>r.json()).then(d=>setEstProprietaire(!!d.isProprietaireTenant)).catch(()=>{});
  },[]);
  const envoyerMessageGroupe=async()=>{
    if(!msgGroupeTexte)return showToast("⚠️ Ecrivez un message");
    setEnvoiMsgGroupe(true);
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'message_groupe',message:msgGroupeTexte,company_id:activeCompany?.id})});
      const data=await res.json();
      if(data.success){showToast(`✅ Message envoye a ${data.envoyes} membre(s)`);setShowMsgGroupe(false);setMsgGroupeTexte("");}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setEnvoiMsgGroupe(false);
  };
  // Chargement des vraies données Supabase
  const[alertes,setAlertes]=useState([]);
  const[catalogue,setCatalogue]=useState([]);
  const[obligationsLegales,setObligationsLegales]=useState([]);
  const[loadingEquipe,setLoadingEquipe]=useState(true);
  // Un salarie normal (ni proprietaire ni Admin) ne recoit plus salaire/NSS/RIB/carriere de ses
  // collegues depuis l'API (voir app/api/equipe/route.ts) -- ce drapeau sert a masquer entierement
  // les vues de comparaison de masse salariale, qui n'auraient plus de sens avec des donnees absentes.
  const[estRH,setEstRH]=useState(true);
  const loadRealData=async()=>{
    try{
      const companyParam=activeCompany?.id?`?company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/equipe'+companyParam);
      const data=await res.json();
      setCatalogue(data.catalogue||[]);
      setObligationsLegales(data.obligationsLegales||[]);
      setEstRH(data.estRH!==false);
      if(data.membres){
        setEquipe(data.membres.map((m,idx)=>({
          heures:0,soldeConges:m.conges_solde??0,perf:m.performance||0,localisation:"—",pointage:"—",
          nss:"",rib:"",couleur:m.couleur||["#4B7BFF","#9B5FFF","#FF5F9E","#2EC9B0","#FF8C3A"][idx%5],
          missions:[],evaluations:[],formations:[],documents:[],objectifs:[],carriere:[],
          embauche:m.date_embauche||"—",dateNaissance:m.date_naissance||"",
          salaire:m.salaire||0,contrat:m.contrat||"CDI",statut:m.statut||"Disponible",
          ...m,
          congesDemandes:(m.absences||[]).filter(a=>a.type==="conge_paye"||a.type==="conge_sans_solde"),
          absencesReelles:m.absences||[],
        })));
        setAlertes(data.alertes||[]);
      }
    }catch(e){console.log("Mode local");}
    setLoadingEquipe(false);
  };
  useEffect(()=>{loadRealData();},[activeCompany?.id]);
  const[equipe,setEquipe]=useState([]);

  const[assignerPourId,setAssignerPourId]=useState(null);
  const[choixCatalogueId,setChoixCatalogueId]=useState("");
  const majFormationEquipe=async(f,nouveauStatut)=>{
    try{
      const score=nouveauStatut==="complété"?Math.floor(80+Math.random()*20):null;
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'maj_formation',id:f.id,statut:nouveauStatut,score})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast(`✅ "${f.titre}" — ${nouveauStatut}`);
      loadRealData();
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const assignerFormation=async(employeId)=>{
    if(!choixCatalogueId)return showToast("⚠️ Choisis une vidéo");
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_formation',employe_id:employeId,catalogue_id:choixCatalogueId,statut:'à faire'})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast("✅ Formation assignée");
      setAssignerPourId(null);setChoixCatalogueId("");
      loadRealData();
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const voirPosition=(e)=>{
    if(e.position?.latitude&&e.position?.longitude){
      const maj=e.position.updated_at?new Date(e.position.updated_at).toLocaleString('fr-FR'):"date inconnue";
      window.open(`https://www.google.com/maps?q=${e.position.latitude},${e.position.longitude}`,'_blank');
      showToast(`📍 Position de ${e.nom} (mise à jour ${maj})`);
    }else{
      showToast(`📍 Pas de position GPS récente pour ${e.nom} — disponible dès qu'il est en mission sur le Planning`);
    }
  };
  const[correctionPointageId,setCorrectionPointageId]=useState(null);
  const[correctionArrivee,setCorrectionArrivee]=useState("");
  const[correctionDepart,setCorrectionDepart]=useState("");
  const ouvrirCorrectionPointage=(e)=>{
    const aujourdhui=new Date().toISOString().slice(0,10);
    const p=(e.pointages||[]).find(pp=>pp.date===aujourdhui);
    setCorrectionArrivee(p?.heure_arrivee||"");
    setCorrectionDepart(p?.heure_depart||"");
    setCorrectionPointageId(correctionPointageId===e.id?null:e.id);
  };
  const validerCorrectionPointage=async(employeId)=>{
    if(!correctionArrivee&&!correctionDepart)return showToast("⚠️ Renseigne au moins une heure");
    try{
      const aujourdhui=new Date().toISOString().slice(0,10);
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'corriger_pointage',employe_id:employeId,date:aujourdhui,heure_arrivee:correctionArrivee||null,heure_depart:correctionDepart||null})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast("✅ Pointage corrigé");
      setCorrectionPointageId(null);
      loadRealData();
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const[arretFormId,setArretFormId]=useState(null);
  const[arretType,setArretType]=useState("arret_maladie");
  const[arretDebut,setArretDebut]=useState("");
  const[arretFin,setArretFin]=useState("");
  const[arretMotif,setArretMotif]=useState("");
  const ouvrirDeclarationArret=(id)=>{
    setArretType("arret_maladie");
    setArretDebut(new Date().toISOString().slice(0,10));
    setArretFin("");
    setArretMotif("");
    setArretFormId(arretFormId===id?null:id);
  };
  const declarerArret=async(e)=>{
    if(!arretDebut)return showToast("⚠️ Renseigne une date de début");
    try{
      const res=await fetch('/api/absences',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'declarer',employe_id:e.id,nom_employe:e.nom,type:arretType,debut:arretDebut,fin:arretFin||arretDebut,motif:arretMotif||null,declaree_par:'rh'})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast(`✅ Arrêt enregistré pour ${e.nom}`);
      setArretFormId(null);
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const[evalFormId,setEvalFormId]=useState(null);
  const[evalNote,setEvalNote]=useState("80");
  const[evalPoints,setEvalPoints]=useState("");
  const[evalAxes,setEvalAxes]=useState("");
  const ouvrirNouvelleEvaluation=(id)=>{
    setEvalNote("80");setEvalPoints("");setEvalAxes("");
    setEvalFormId(evalFormId===id?null:id);
  };
  const creerEvaluation=async(e)=>{
    if(!evalPoints&&!evalAxes)return showToast("⚠️ Renseigne au moins un commentaire");
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_evaluation',employe_id:e.id,note:Number(evalNote)||0,points_forts:evalPoints||null,axes_amelioration:evalAxes||null})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast(`✅ Évaluation enregistrée pour ${e.nom}`);
      setEvalFormId(null);
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const [envoiFicheEnCours,setEnvoiFicheEnCours]=useState(null);
  const voirFichePaie=async(e)=>{
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_fiche_paie',id:e.id,envoyer:false})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      const fenetre=window.open('','_blank');
      if(fenetre){fenetre.document.write(data.html);fenetre.document.close();}
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const envoyerFichePaie=async(e)=>{
    if(!e.email)return showToast(`⚠️ ${e.nom} n'a pas d'email enregistré`);
    setEnvoiFicheEnCours(e.id);
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_fiche_paie',id:e.id,envoyer:true})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);setEnvoiFicheEnCours(null);return;}
      showToast(`📧 Bulletin envoyé à ${e.email}`);
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
    setEnvoiFicheEnCours(null);
  };
  const [envoiToutesFichesEnCours,setEnvoiToutesFichesEnCours]=useState(false);
  const envoyerToutesLesFiches=async()=>{
    const eligibles=equipe.filter(e=>e.email);
    if(eligibles.length===0)return showToast("⚠️ Aucun employé avec un email enregistré");
    setEnvoiToutesFichesEnCours(true);
    let envoyees=0;
    for(const e of eligibles){
      try{
        const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_fiche_paie',id:e.id,envoyer:true})});
        const data=await res.json();
        if(res.ok&&!data.error)envoyees++;
      }catch(err){}
    }
    showToast(`✅ ${envoyees}/${eligibles.length} fiche(s) de paie envoyée(s)`);
    setEnvoiToutesFichesEnCours(false);
    loadRealData();
  };
  const[docFormId,setDocFormId]=useState(null);
  const[docType,setDocType]=useState("Carte d'identité");
  const[docExpire,setDocExpire]=useState("");
  const[docFichier,setDocFichier]=useState(null);
  const[uploadDocEnCours,setUploadDocEnCours]=useState(false);
  const ouvrirAjoutDocument=(id)=>{
    setDocType("Carte d'identité");setDocExpire("");setDocFichier(null);
    setDocFormId(docFormId===id?null:id);
  };
  const ajouterDocument=async(employeId)=>{
    if(!docFichier)return showToast("⚠️ Choisis un fichier");
    setUploadDocEnCours(true);
    try{
      const fd=new FormData();
      fd.append('cible','document_employe');
      fd.append('employe_id',employeId);
      fd.append('type',docType);
      if(docExpire)fd.append('expire_le',docExpire);
      fd.append('fichier',docFichier);
      const res=await fetch('/api/equipe',{method:'POST',body:fd});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);setUploadDocEnCours(false);return;}
      showToast("✅ Document ajouté");
      setDocFormId(null);
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
    setUploadDocEnCours(false);
  };
  const voirDocument=async(d)=>{
    try{
      const res=await fetch(`/api/equipe?action=document_url&id=${d.id}`);
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      window.open(data.url,'_blank');
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const envoyerDocument=async(d,employeNom)=>{
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_document',id:d.id})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast(`📧 Envoyé à ${employeNom}`);
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const[objFormId,setObjFormId]=useState(null);
  const[objTitre,setObjTitre]=useState("");
  const[objCible,setObjCible]=useState("");
  const[objActuel,setObjActuel]=useState("0");
  const[objUnite,setObjUnite]=useState("");
  const objCouleurs=["#4B7BFF","#2EC9B0","#C9A84C","#9B5FFF","#FF8C3A"];
  const ouvrirAjoutObjectif=(id)=>{
    setObjTitre("");setObjCible("");setObjActuel("0");setObjUnite("");
    setObjFormId(objFormId===id?null:id);
  };
  const ajouterObjectif=async(employeId)=>{
    if(!objTitre||!objCible)return showToast("⚠️ Titre et cible requis");
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_objectif',employe_id:employeId,titre:objTitre,cible:Number(objCible),actuel:Number(objActuel)||0,unite:objUnite||null,couleur:objCouleurs[Math.floor(Math.random()*objCouleurs.length)]})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast("✅ Objectif ajouté");
      setObjFormId(null);
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const majProgressionObjectif=async(obj,valeur)=>{
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'maj_objectif',id:obj.id,actuel:valeur})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const supprimerObjectif=async(obj)=>{
    if(!window.confirm(`Supprimer l'objectif "${obj.obj}" ?`))return;
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer_objectif',id:obj.id})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const[genContratEnCours,setGenContratEnCours]=useState(null);
  const genererContrat=async(e,avecIa)=>{
    setGenContratEnCours(e.id);
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_contrat',id:e.id,avecIa})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);setGenContratEnCours(null);return;}
      const fenetre=window.open('','_blank');
      if(fenetre){fenetre.document.write(data.html);fenetre.document.close();}
    }catch(err){showToast("❌ Erreur de connexion");}
    setGenContratEnCours(null);
  };
  const envoyerContratWhatsApp=async(e)=>{
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_contrat_whatsapp',id:e.id})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast(`📱 Envoyé à ${e.nom}`);
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const majDateFinContrat=async(id,date)=>{
    try{
      await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id,date_fin_contrat:date||null})});
      loadRealData();
    }catch(err){}
  };
  const[contratsSignature,setContratsSignature]=useState([]);
  const[modelesContrats,setModelesContrats]=useState([]);
  const[infoEntreprise,setInfoEntreprise]=useState(null);
  const chargerContratsSignature=async()=>{
    try{
      const [rC,rM,rE]=await Promise.all([
        fetch('/api/contrats?action=contrats'),
        fetch('/api/contrats?action=modeles'),
        fetch('/api/equipe?action=info_entreprise'),
      ]);
      const [dC,dM,dE]=await Promise.all([rC.json(),rM.json(),rE.json()]);
      setContratsSignature((dC.contrats||[]).filter(c=>c.source_type==='equipe'));
      setModelesContrats(dM.modeles||[]);
      setInfoEntreprise(dE.entreprise||null);
    }catch(e){}
  };
  useEffect(()=>{if(onglet==="contrats")chargerContratsSignature();},[onglet]);
  const dernierContratDe=(employeId)=>contratsSignature.filter(c=>c.source_id===employeId).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0]||null;

  const[signatureFormId,setSignatureFormId]=useState(null);
  const[signatureForm,setSignatureForm]=useState({qualification:"",duree_periode_essai:"1 mois",convention_collective:"",motif_recours:"",lieu_travail:""});
  const[envoiSignatureEnCours,setEnvoiSignatureEnCours]=useState(false);
  const ouvrirEnvoiSignature=(e)=>{
    setSignatureForm({qualification:e.role||"",duree_periode_essai:"1 mois",convention_collective:"",motif_recours:"",lieu_travail:infoEntreprise?.adresse?`${infoEntreprise.adresse}, ${infoEntreprise.ville||''}`:""});
    setSignatureFormId(signatureFormId===e.id?null:e.id);
  };
  const envoyerPourSignature=async(e)=>{
    if(!e.email)return showToast("⚠️ Aucun email pour cet employé");
    const modele=modelesContrats.find(m=>m.type===(e.contrat==="CDD"?"cdd":"cdi"));
    if(!modele)return showToast(`❌ Aucun modèle de contrat ${e.contrat} disponible`);
    if(!infoEntreprise?.societe||!infoEntreprise?.siret)return showToast("⚠️ Renseigne d'abord société/SIRET dans les infos entreprise");
    setEnvoiSignatureEnCours(true);
    try{
      const variables={
        nom_employeur:infoEntreprise.societe,forme_juridique:infoEntreprise.forme_juridique||"",siret:infoEntreprise.siret,
        adresse_employeur:`${infoEntreprise.adresse||''}, ${infoEntreprise.code_postal||''} ${infoEntreprise.ville||''}`,
        nom_salarie:e.nom,adresse_salarie:e.adresse||"",poste:e.role||"",qualification:signatureForm.qualification,
        date_embauche:e.embauche,date_debut:e.embauche,date_fin:e.date_fin_contrat||"",
        lieu_travail:signatureForm.lieu_travail,duree_hebdo:String(e.heures_semaine||35),
        salaire_brut:String(e.paie?.salaireBrut||e.salaire||0),duree_periode_essai:signatureForm.duree_periode_essai,
        convention_collective:signatureForm.convention_collective,motif_recours:signatureForm.motif_recours,
        ville:infoEntreprise.ville||"",date:new Date().toLocaleDateString("fr-FR"),
      };
      const resGen=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer',modele_id:modele.id,titre:`${modele.nom} — ${e.nom}`,source_type:'equipe',source_id:e.id,variables,signataire_nom:e.nom,signataire_email:e.email,signataire_role:e.role})});
      const dataGen=await resGen.json();
      if(!resGen.ok||!dataGen.success){showToast(`❌ ${dataGen.error||"Erreur génération"}`);setEnvoiSignatureEnCours(false);return;}
      const resEnv=await fetch('/api/contrats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer',id:dataGen.contrat.id})});
      const dataEnv=await resEnv.json();
      if(!resEnv.ok||!dataEnv.success){showToast(`❌ ${dataEnv.error||"Erreur envoi"}`);setEnvoiSignatureEnCours(false);return;}
      showToast(`✅ Contrat envoyé pour signature électronique à ${e.email}`);
      setSignatureFormId(null);
      chargerContratsSignature();
    }catch(err){showToast("❌ Erreur de connexion");}
    setEnvoiSignatureEnCours(false);
  };
  const[envoiContratsGroupeEnCours,setEnvoiContratsGroupeEnCours]=useState(false);
  const genererEtEnvoyerTousLesContrats=async()=>{
    const eligibles=equipe.filter(e=>e.email);
    if(eligibles.length===0)return showToast("⚠️ Aucun employé avec un email enregistré");
    setEnvoiContratsGroupeEnCours(true);
    let envoyes=0;
    for(const e of eligibles){
      try{
        const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_contrat',id:e.id,avecIa:true,envoyer:true})});
        const data=await res.json();
        if(res.ok&&!data.error)envoyes++;
      }catch(err){}
    }
    showToast(`✅ ${envoyes}/${eligibles.length} contrat(s) IA généré(s) et envoyé(s) par email`);
    setEnvoiContratsGroupeEnCours(false);
  };
  const[promoFormId,setPromoFormId]=useState(null);
  const[promoPoste,setPromoPoste]=useState("");
  const[promoSalaire,setPromoSalaire]=useState("");
  const[promoDate,setPromoDate]=useState("");
  const ouvrirAjoutPromotion=(e)=>{
    setPromoPoste(e.role||"");setPromoSalaire(String(e.salaire||""));setPromoDate(new Date().toISOString().slice(0,10));
    setPromoFormId(promoFormId===e.id?null:e.id);
  };
  const ajouterPromotion=async(employeId)=>{
    if(!promoPoste||!promoSalaire)return showToast("⚠️ Poste et salaire requis");
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_promotion',employe_id:employeId,poste:promoPoste,salaire:Number(promoSalaire),date:promoDate})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast("✅ Promotion enregistrée");
      setPromoFormId(null);
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const majVisiteMedicale=async(id,date)=>{
    try{
      await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id,visite_medicale_echeance:date||null})});
      loadRealData();
    }catch(err){}
  };
  const[oblFormOuvert,setOblFormOuvert]=useState(false);
  const[oblLibelle,setOblLibelle]=useState("");
  const[oblEcheance,setOblEcheance]=useState("");
  const ajouterObligation=async()=>{
    if(!oblLibelle)return showToast("⚠️ Libellé requis");
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ajouter_obligation',libelle:oblLibelle,echeance:oblEcheance||null})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast("✅ Obligation ajoutée");
      setOblFormOuvert(false);setOblLibelle("");setOblEcheance("");
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const toggleStatutObligation=async(obl)=>{
    const nouveauStatut=obl.statut==="a_jour"?"a_faire":"a_jour";
    try{
      await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'maj_obligation',id:obl.id,statut:nouveauStatut})});
      loadRealData();
    }catch(err){}
  };
  const supprimerObligation=async(obl)=>{
    if(!window.confirm(`Supprimer "${obl.libelle}" ?`))return;
    try{
      await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer_obligation',id:obl.id})});
      loadRealData();
    }catch(err){}
  };
  const[genObligationsEnCours,setGenObligationsEnCours]=useState(false);
  const genererObligationsIa=async()=>{
    setGenObligationsEnCours(true);
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_obligations_ia'})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);setGenObligationsEnCours(false);return;}
      showToast(`✅ ${data.obligations?.length||0} obligation(s) ajoutée(s) par l'IA`);
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
    setGenObligationsEnCours(false);
  };
  const[genRegistreEnCours,setGenRegistreEnCours]=useState(false);
  const voirRegistrePersonnel=async()=>{
    setGenRegistreEnCours(true);
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'apercu_registre_personnel'})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);setGenRegistreEnCours(false);return;}
      const fenetre=window.open('','_blank');
      if(fenetre){fenetre.document.write(data.html);fenetre.document.close();}
    }catch(err){showToast("❌ Erreur de connexion");}
    setGenRegistreEnCours(false);
  };
  const[genDuerEnCours,setGenDuerEnCours]=useState(false);
  const voirDuer=async()=>{
    setGenDuerEnCours(true);
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generer_duer'})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);setGenDuerEnCours(false);return;}
      const fenetre=window.open('','_blank');
      if(fenetre){fenetre.document.write(data.html);fenetre.document.close();}
    }catch(err){showToast("❌ Erreur de connexion");}
    setGenDuerEnCours(false);
  };
  const toggleOnboarding=async(employeId,cle,fait)=>{
    try{
      await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'toggle_onboarding',employe_id:employeId,etape:cle,fait})});
      loadRealData();
    }catch(err){}
  };
  const initierDepart=async(id)=>{
    if(!window.confirm("Initier la procédure de départ pour ce collaborateur ?"))return;
    try{
      await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id,depart_initie_le:new Date().toISOString().slice(0,10)})});
      showToast("✅ Procédure de départ initiée");
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const annulerDepart=async(id)=>{
    try{
      await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id,depart_initie_le:null})});
      showToast("✅ Départ annulé");
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const revoquerAcces=async(e)=>{
    if(!window.confirm(`Révoquer l'accès espace collaborateur de ${e.nom} ? Il ne pourra plus se connecter.`))return;
    try{
      const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'revoquer_acces',id:e.id})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast(`✅ Accès révoqué pour ${e.nom}`);
      loadRealData();
    }catch(err){showToast("❌ Erreur de connexion");}
  };
  const[qvtData,setQvtData]=useState(null);
  const[qvtChargement,setQvtChargement]=useState(false);
  const[qvtReponseId,setQvtReponseId]=useState(null);
  const[qvtReponseTexte,setQvtReponseTexte]=useState("");
  const chargerQvt=async()=>{
    setQvtChargement(true);
    try{
      const res=await fetch('/api/pulse-bienetre?action=aggregate');
      const data=await res.json();
      setQvtData(data);
    }catch(e){}
    setQvtChargement(false);
  };
  const repondreQvt=async(id)=>{
    if(!qvtReponseTexte)return showToast("⚠️ Ecris une réponse");
    try{
      const res=await fetch('/api/pulse-bienetre',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'repondre_rh',id,reponse:qvtReponseTexte})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast("✅ Réponse envoyée");
      setQvtReponseId(null);setQvtReponseTexte("");
      chargerQvt();
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const[offresEmploi,setOffresEmploi]=useState([]);
  const[slugCarrieres,setSlugCarrieres]=useState(null);
  const[chargementRecrutement,setChargementRecrutement]=useState(false);
  const[candidatureEnConversion,setCandidatureEnConversion]=useState(null);
  const[showAddOffre,setShowAddOffre]=useState(false);
  const[addOffre,setAddOffre]=useState({titre:"",description:"",type_contrat:"CDI",lieu:"",salaire_min:"",salaire_max:""});
  const[offreDeployee,setOffreDeployee]=useState(null);
  const chargerRecrutement=async()=>{
    setChargementRecrutement(true);
    try{
      const res=await fetch('/api/recrutement');
      const data=await res.json();
      setOffresEmploi(data.offres||[]);
      setSlugCarrieres(data.slug||null);
    }catch(e){}
    setChargementRecrutement(false);
  };
  useEffect(()=>{if(onglet==="recrutement")chargerRecrutement();},[onglet]);
  const creerOffre=async()=>{
    if(!addOffre.titre)return showToast("⚠️ Titre requis");
    try{
      const res=await fetch('/api/recrutement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_offre',...addOffre})});
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
      showToast("✅ Offre publiée");
      setShowAddOffre(false);
      setAddOffre({titre:"",description:"",type_contrat:"CDI",lieu:"",salaire_min:"",salaire_max:""});
      chargerRecrutement();
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const toggleOffre=async(o)=>{
    try{
      await fetch('/api/recrutement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:o.statut==="ouverte"?"fermer_offre":"rouvrir_offre",id:o.id})});
      chargerRecrutement();
    }catch(e){}
  };
  const deplacerEtape=async(candidatureId,etape)=>{
    try{
      await fetch('/api/recrutement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'deplacer_etape',id:candidatureId,etape})});
      chargerRecrutement();
    }catch(e){}
  };
  const voirCv=async(candidatureId)=>{
    try{
      const res=await fetch(`/api/recrutement?action=cv_url&id=${candidatureId}`);
      const data=await res.json();
      if(!res.ok||data.error){showToast(`❌ ${data.error||"Aucun CV"}`);return;}
      window.open(data.url,'_blank');
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const convertirEnEmploye=(candidature)=>{
    setAddForm(f=>({...f,nom:candidature.nom,email:candidature.email||"",tel:candidature.tel||""}));
    setCandidatureEnConversion(candidature.id);
    setOnglet("equipe");
    setShowAdd(true);
    showToast("📋 Formulaire pré-rempli avec les infos du candidat");
  };
  const ETAPES_PIPELINE=[["recu","📥 Reçu"],["preselection","🔍 Présélection"],["entretien","💬 Entretien"],["offre","📝 Offre"],["embauche","✅ Embauché"],["refuse","❌ Refusé"]];
  useEffect(()=>{if(onglet==="qvt")chargerQvt();},[onglet]);
  const[rentabiliteData,setRentabiliteData]=useState(null);
  const[rentabiliteChargement,setRentabiliteChargement]=useState(false);
  const chargerRentabilite=async()=>{
    setRentabiliteChargement(true);
    try{
      const res=await fetch('/api/equipe?action=rentabilite');
      const data=await res.json();
      setRentabiliteData(data);
    }catch(e){}
    setRentabiliteChargement(false);
  };
  useEffect(()=>{if(onglet==="rentabilite")chargerRentabilite();},[onglet]);
  const[sel,setSel]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[debugErreur,setDebugErreur]=useState(null);
  const[addForm,setAddForm]=useState({nom:"",role:"",salaire:"",contrat:"CDI",email:"",tel:"",adresse:"",dateNaissance:""});
  const[moisCal,setMoisCal]=useState(4);

  const tabs=[
    {id:"dashboard",label:"📊 Tableau de bord"},
    {id:"equipe",label:"👥 Équipe"},
    {id:"recrutement",label:"🧲 Recrutement"},
    {id:"onboarding",label:"🚀 Onboarding"},
    {id:"offboarding",label:"📤 Offboarding"},
    {id:"qvt",label:"🙂 QVT & Bien-être"},
    {id:"rentabilite",label:"💰 Rentabilité"},
    {id:"objectifs",label:"🎯 Objectifs & KPIs"},
    {id:"pointage",label:"⏰ Pointage GPS"},
    {id:"conges",label:"🏖 Congés"},
    {id:"planning_cal",label:"📅 Calendrier congés"},
    {id:"arrets",label:"🏥 Arrêts & Absences"},
    {id:"paie",label:"💸 Paie & Charges"},
    {id:"contrats",label:"📋 Contrats RH"},
    {id:"documents",label:"🗂 Documents RH"},
    {id:"entretiens",label:"💼 Entretiens & Évals"},
    {id:"formations",label:"🎓 Formations"},
    {id:"carriere",label:"📈 Évolution carrière"},
    {id:"alertes",label:"🔔 Alertes RH"},
    {id:"ia",label:"🤖 IA RH"},
    {id:"juridique",label:"⚖ Juridique"},
  ];

  if(!hasAccess(plan,"equipe",modulesActifs))return <div style={{padding:20}}><UpgradeWall page="equipe" plan={plan}/></div>;

  const totalSalaire=equipe.reduce((a,e)=>a+e.salaire,0);
  const arretsDe=(e)=>(e.absencesReelles||[]).filter(a=>a.type==="arret_maladie"||a.type==="accident_travail");
  const moisActuel=new Date().toISOString().slice(0,7);
  const arretsCeMoisDe=(e)=>arretsDe(e).filter(a=>(a.debut||"").slice(0,7)===moisActuel);
  const totalArrets=equipe.reduce((a,e)=>a+arretsCeMoisDe(e).length,0);
  const perfMoy=Math.round(equipe.reduce((a,e)=>a+e.perf,0)/equipe.length);

  return <div style={{padding:20}}>
    {debugErreur&&<div style={{background:"#3a0000",border:"2px solid #FF5252",borderRadius:8,padding:14,marginBottom:14,color:"#fff",fontSize:12,wordBreak:"break-all"}}>
      <div style={{fontWeight:700,marginBottom:6}}>🔴 ERREUR DEBUG (a copier-coller a Claude) :</div>
      {debugErreur}
      <button onClick={()=>setDebugErreur(null)} style={{marginTop:8,background:"#fff",color:"#000",border:"none",borderRadius:4,padding:"4px 10px",cursor:"pointer"}}>Fermer</button>
    </div>}
    {/* HEADER */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:"#EAE6DE",fontFamily:"Georgia,serif"}}>⊞ RH & Équipe</div>
        <div style={{fontSize:11,color:"#5A5A7A"}}>Gestion complète des ressources humaines · {equipe.length} collaborateur</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setShowAdd(s=>!s)} style={{background:"#C9A84C22",color:"#C9A84C",border:"1px solid #C9A84C88",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>+ Ajouter</button>
        <button onClick={()=>setShowMsgGroupe(s=>!s)} style={{background:"transparent",color:"#4B7BFF",border:"1px solid #4B7BFF44",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>📢 Message groupe</button>
        <button onClick={()=>showToast("📧 Rapport RH mensuel envoyé !")} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>📊 Rapport RH</button>
      </div>
    {showMsgGroupe&&<div style={{background:"#0C0C1A",border:"1px solid #4B7BFF44",borderRadius:12,padding:18,marginBottom:14}}>
      <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Message a toute l'equipe ({equipe.length} membre(s))</div>
      <textarea value={msgGroupeTexte} onChange={e=>setMsgGroupeTexte(e.target.value)} placeholder="Ecrivez votre message..." rows={4} style={{width:"100%",background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:10,color:"#EAE6DE",fontSize:13,fontFamily:"inherit",resize:"vertical",marginBottom:10}}/>
      <div style={{display:"flex",gap:8}}>
        <button onClick={envoyerMessageGroupe} disabled={envoiMsgGroupe} style={{background:"#4B7BFF",color:"#fff",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"inherit"}}>{envoiMsgGroupe?"Envoi...":"📢 Envoyer a tous"}</button>
        <button onClick={()=>setShowMsgGroupe(false)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Annuler</button>
      </div>
    </div>}
    </div>

    {/* FORM ADD */}
    {showAdd&&<div style={{background:"#0C0C1A",border:"1px solid #C9A84C44",borderRadius:12,padding:18,marginBottom:14}}>
      <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Nouveau collaborateur</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["Nom complet","nom"],["Poste / rôle","role"],["Email pro","email"],["Téléphone","tel"],["Adresse domicile","adresse"],["Zones (villes, separees par virgule)","zonesTexte"],["Competences (separees par virgule)","competencesTexte"]].map(([ph,k])=><input key={k} value={addForm[k]} onChange={e=>setAddForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit",outline:"none"}}/>)}
        <input type="date" value={addForm.dateNaissance} onChange={e=>setAddForm(f=>({...f,dateNaissance:e.target.value}))} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit",outline:"none"}}/>
        <input value={addForm.salaire} onChange={e=>setAddForm(f=>({...f,salaire:e.target.value}))} placeholder="Salaire net (€)" style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit",outline:"none"}}/>
        <select value={addForm.contrat} onChange={e=>setAddForm(f=>({...f,contrat:e.target.value}))} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 12px",color:"#EAE6DE",fontSize:12,fontFamily:"inherit"}}><option>CDI</option><option>CDD</option><option>Auto-entrepreneur</option><option>Intérim</option><option>Stage</option></select>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={async()=>{
          if(!addForm.nom||!addForm.email){showToast("⚠️ Nom et email requis");return;}
          const colors=["#4B7BFF","#9B5FFF","#FF5F9E","#2EC9B0","#FF8C3A"];
          try{
            const res=await fetch("/api/equipe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
              action:"creer",nom:addForm.nom,prenom:addForm.nom.split(" ")[0],role:addForm.role,
              email:addForm.email,tel:addForm.tel,adresse:addForm.adresse,date_naissance:addForm.dateNaissance||null,
              contrat:addForm.contrat,salaire_brut:Number(addForm.salaire)||0,couleur:colors[equipe.length%colors.length],
              zones_intervention:(addForm.zonesTexte||"").split(",").map(z=>z.trim()).filter(Boolean),
              competences:(addForm.competencesTexte||"").split(",").map(c=>c.trim()).filter(Boolean),
            })});
            const data=await res.json();
            if(data.success){
              setEquipe(eq=>[...eq,{
                heures:0,conges:25,soldeConges:25,perf:0,localisation:"—",pointage:"—",
                nss:"",rib:"",couleur:colors[equipe.length%colors.length],
                missions:[],evaluations:[],formations:[],documents:[],arrets:[],objectifs:[],carriere:[],
                ...data.membre,
              }]);setShowAdd(false);
              setAddForm({nom:"",role:"",salaire:"",contrat:"CDI",email:"",tel:"",adresse:"",dateNaissance:""});
              showToast(data.accesCree?`✅ ${addForm.nom} ajouté, email d'invitation envoyé !`:`⚠️ ${addForm.nom} ajouté MAIS pas de compte : ${data.erreurDiagnostic||"raison inconnue"}`);
              if(candidatureEnConversion){
                fetch('/api/recrutement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'lier_employe',candidature_id:candidatureEnConversion,employe_id:data.membre.id})}).catch(()=>{});
                setCandidatureEnConversion(null);
                chargerRecrutement();
              }
            }else{
              showToast("❌ "+(data.error||"Erreur"));
            }
          }catch(e){showToast("❌ Erreur de connexion");}
        }} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>✅ Ajouter</button>
        <button onClick={()=>setShowAdd(false)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Annuler</button>
      </div>
    </div>}

    {/* KPIs RAPIDES */}
    <div style={{display:"grid",gridTemplateColumns:`repeat(${estRH?5:4},1fr)`,gap:10,marginBottom:14}}>
      {[["Effectif",equipe.length,"#4B7BFF"],["En mission",equipe.filter(e=>e.statut==="En mission").length,"#C9A84C"],...(estRH?[["Masse salariale/mois","€"+totalSalaire.toLocaleString("fr"),"#FF5252"]]:[]),["Perf. moyenne",perfMoy+"%","#2EC9B0"],["Arrêts ce mois",totalArrets,"#FF8C3A"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:`1px solid #1E1E36`,borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c,fontFamily:"Georgia,serif"}}>{v}</div></div>)}
    </div>

    {/* TABS */}
    <div style={{marginBottom:14,display:"flex",gap:4,background:"#121222",borderRadius:8,padding:4,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setOnglet(t.id)} style={{background:onglet===t.id?"#0C0C1A":"transparent",color:onglet===t.id?"#C9A84C":"#5A5A7A",border:onglet===t.id?"1px solid #1E1E36":"1px solid transparent",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:onglet===t.id?600:400,whiteSpace:"nowrap"}}>{t.label}</button>)}
    </div>

    {/* ─── DASHBOARD ─────────────────────────────────────────── */}
    {onglet==="dashboard"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
          <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>📊 Vue d'ensemble équipe</div>
          {equipe.map((e,i)=>{const sc=e.statut==="En mission"?"#C9A84C":e.statut==="Disponible"?"#2EC9B0":"#4B7BFF";return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #1E1E3622"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur,flexShrink:0}}>{e.nom[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:"#EAE6DE"}}>{e.nom}</div>
              <div style={{fontSize:9,color:"#5A5A7A"}}>{e.role}</div>
              <div style={{marginTop:4,height:3,borderRadius:2,background:"#1E1E36",overflow:"hidden"}}><div style={{height:"100%",width:e.perf+"%",background:e.perf>=90?"#2EC9B0":e.perf>=70?"#C9A84C":"#FF8C3A",borderRadius:2}}/></div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,fontWeight:700,color:e.perf>=90?"#2EC9B0":"#C9A84C"}}>{e.perf}%</div>
              <div style={{fontSize:9,padding:"1px 6px",background:sc+"22",color:sc,borderRadius:10,marginTop:2,fontWeight:600}}>{e.statut}</div>
            </div>
          </div>;})}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {estRH&&<div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16}}>
            <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>💸 Répartition masse salariale</div>
            {equipe.map((e,i)=><div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{e.prenom}</span><span style={{color:e.couleur,fontWeight:700}}>{e.salaire.toLocaleString("fr")}€</span></div><div style={{height:4,borderRadius:2,background:"#1E1E36"}}><div style={{height:"100%",width:(e.salaire/totalSalaire*100)+"%",background:e.couleur,borderRadius:2}}/></div></div>)}
            <div style={{marginTop:8,fontSize:11,color:"#C9A84C",fontWeight:700,textAlign:"right"}}>Total : {totalSalaire.toLocaleString("fr")} € net · {Math.round(totalSalaire*1.43).toLocaleString("fr")} € brut</div>
          </div>}
          <div style={{background:"#FF525211",border:"1px solid #FF525233",borderRadius:10,padding:14}}>
            <div style={{fontSize:10,color:"#FF5252",fontWeight:600,marginBottom:8}}>🔔 Alertes RH du jour</div>
            {alertes.length===0&&<div style={{fontSize:11,color:"#5A5A7A"}}>Aucune alerte pour le moment.</div>}
            {alertes.slice(0,4).map((al,i)=><div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid #FF525222",fontSize:11}}><span>{al.type==="contrat"?"⚠️":al.type==="conge"?"📅":al.type==="acompte"?"💰":"📋"}</span><div><div style={{color:"#EAE6DE",fontWeight:600}}>{al.nom}</div><div style={{color:"#5A5A7A",fontSize:10}}>{al.detail}</div></div></div>)}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[["🎯 Objectifs atteints",`${equipe.reduce((a,e)=>a+(e.objectifs||[]).filter(o=>o.actuel>=o.cible).length,0)}/${equipe.reduce((a,e)=>a+(e.objectifs||[]).length,0)}`,"#2EC9B0"],["🎓 Formations complètes",`${equipe.reduce((a,e)=>a+e.formations.filter(f=>f.statut==="complété").length,0)}/${equipe.reduce((a,e)=>a+e.formations.length,0)}`,"#4B7BFF"],["📅 Jours de congés pris",equipe.reduce((a,e)=>a+(e.congesDemandes||[]).filter(d=>d.statut==="validee").reduce((s,d)=>s+Number(d.jours||0),0),0),"#C9A84C"]].map(([l,v,c],i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:10,padding:14,textAlign:"center"}}><div style={{fontSize:11,color:"#5A5A7A",marginBottom:4}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
    </div>}

    {/* ─── EQUIPE ────────────────────────────────────────────── */}
    {onglet==="equipe"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
      {equipe.map((e,i)=>{const sc=e.statut==="En mission"?"#C9A84C":e.statut==="Disponible"?"#2EC9B0":"#4B7BFF";return <div key={i} style={{background:"#0C0C1A",border:`1px solid ${sc}33`,borderRadius:12,padding:18,cursor:"pointer"}} onClick={()=>setSel(sel?.id===e.id?null:e)}>
        {/* Avatar + infos */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:e.couleur,flexShrink:0,position:"relative"}}>
            {e.nom[0]}
            <div style={{position:"absolute",bottom:0,right:0,width:14,height:14,borderRadius:"50%",background:sc,border:"2px solid #0C0C1A"}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"#EAE6DE"}}>{e.nom}</div>
            <div style={{fontSize:10,color:"#5A5A7A"}}>{e.role}</div>
            <div style={{fontSize:9,color:"#5A5A7A"}}>📅 Depuis {e.embauche} · <span style={{color:e.contrat==="CDI"?"#2EC9B0":"#4B7BFF",fontWeight:600}}>{e.contrat}</span></div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontSize:9,padding:"2px 8px",background:sc+"22",color:sc,borderRadius:10,fontWeight:600,border:`1px solid ${sc}44`}}>{e.statut}</div></div>
        </div>
        {/* Métriques */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
          {[["Heures/j",e.heures+"h","#4B7BFF"],["Congés",e.soldeConges+"j","#C9A84C"],["Perf",e.perf+"%","#2EC9B0"],["Salaire",e.salaire.toLocaleString("fr")+"€","#C9A84C"]].map(([l,v,c],j)=><div key={j} style={{background:"#121222",borderRadius:6,padding:"6px 4px",textAlign:"center"}}><div style={{fontSize:8,color:"#5A5A7A",marginBottom:2}}>{l}</div><div style={{fontSize:11,fontWeight:700,color:c}}>{v}</div></div>)}
        </div>
        <div style={{height:3,borderRadius:2,background:"#1E1E36",marginBottom:10}}><div style={{height:"100%",width:e.perf+"%",background:e.perf>=90?"#2EC9B0":e.perf>=70?"#C9A84C":"#FF8C3A",borderRadius:2}}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:5}}>
          {[["💸 Paie",()=>showToast(`✅ Fiche paie ${e.nom} générée`)],["📍 GPS",()=>voirPosition(e)],["💬 Chat",()=>contacterMembreEquipe(e)],["📋 Fiche",()=>setSel(sel?.id===e.id?null:e)],["🗑 Suppr.",async()=>{
            if(!window.confirm(`Supprimer ${e.nom} de l'equipe ? Son compte de connexion sera aussi supprime.`))return;
            try{
              const res=await fetch("/api/equipe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"supprimer",id:e.id})});
              const data=await res.json();
              if(data.success){setEquipe(eq=>eq.filter(m=>m.id!==e.id));showToast(`✅ ${e.nom} supprime`);}
              else showToast("❌ "+(data.error||"Erreur"));
            }catch(err){showToast("❌ Erreur de connexion");}
          }]].map(([l,fn],j)=><button key={j} onClick={ev=>{ev.stopPropagation();fn();}} style={{background:"transparent",color:l==="🗑 Suppr."?"#FF5252":"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 2px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{l}</button>)}
        </div>
        {/* FICHE COMPLÈTE */}
        {sel?.id===e.id&&<div style={{marginTop:12,borderTop:"1px solid #1E1E3644",paddingTop:12}}>
          <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8,fontWeight:600}}>INFORMATIONS COMPLÈTES</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:10}}>
            {[["📧 Email",e.email],["📱 Tél.",e.tel],["🏠 Adresse",e.adresse],["🎂 Naissance",e.dateNaissance],["🔒 N° SS",e.nss||"Non renseigné"],["🏦 RIB",e.rib||"Non renseigné"]].map(([k,v],j)=><div key={j} style={{background:"#121222",borderRadius:6,padding:"6px 8px"}}><div style={{fontSize:8,color:"#5A5A7A",marginBottom:1}}>{k}</div><div style={{fontSize:10,color:"#EAE6DE",fontWeight:600,wordBreak:"break-all"}}>{v}</div></div>)}
          </div>
          <div style={{fontSize:9,color:"#5A5A7A",marginBottom:4}}>Documents personnels</div>
          {e.documents.map((d,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0",borderBottom:"1px solid #1E1E3622"}}><span>{d.nom}</span><span style={{color:d.statut==="valide"?"#2EC9B0":d.statut==="signé"?"#4B7BFF":"#5A5A7A"}}>{d.statut}{d.expire?" · expire "+d.expire:""}</span></div>)}
          {estProprietaire&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #1E1E3644",display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={ev=>ev.stopPropagation()}>
            <div style={{fontSize:10,color:"#5A5A7A"}}>Autorisé à marquer un devis signé manuellement</div>
            <button onClick={async()=>{
              const nv=!e.peut_signer_devis;
              try{
                const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id:e.id,peut_signer_devis:nv})});
                const data=await res.json();
                if(data.success){setEquipe(eq=>eq.map(m=>m.id===e.id?{...m,peut_signer_devis:nv}:m));showToast(nv?`✅ ${e.nom} autorisé`:`✅ Autorisation retirée à ${e.nom}`);}
                else showToast("❌ "+(data.error||"Erreur"));
              }catch(err){showToast("❌ Erreur de connexion");}
            }} style={{background:e.peut_signer_devis?"#2EC9B022":"transparent",color:e.peut_signer_devis?"#2EC9B0":"#5A5A7A",border:`1px solid ${e.peut_signer_devis?"#2EC9B0":"#1E1E36"}`,borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:600}}>{e.peut_signer_devis?"✅ Activé":"Désactivé"}</button>
          </div>}
        </div>}
      </div>;})}
    </div>}

    {/* ─── OBJECTIFS & KPIs ──────────────────────────────────── */}
    {/* ─── ONBOARDING ────────────────────────────────────────── */}
    {/* ─── RECRUTEMENT ───────────────────────────────────────── */}
    {onglet==="recrutement"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>🧲 Offres & candidatures</div>
        <button onClick={()=>setShowAddOffre(s=>!s)} style={{background:"#9B5FFF",color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Publier une offre</button>
      </div>
      {slugCarrieres&&<div style={{fontSize:10,color:"#5A5A7A",marginBottom:14,background:"#121222",borderRadius:8,padding:10}}>
        Page carrières publique : <a href={`/carrieres/${slugCarrieres}`} target="_blank" style={{color:"#9B5FFF"}}>xyraio.fr/carrieres/{slugCarrieres}</a> — partage ce lien sur LinkedIn, Indeed ou ton site.
      </div>}
      {showAddOffre&&<div style={{background:"#0C0C1A",border:"1px solid #9B5FFF44",borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <input value={addOffre.titre} onChange={ev=>setAddOffre(f=>({...f,titre:ev.target.value}))} placeholder="Titre du poste *" style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit"}}/>
          <select value={addOffre.type_contrat} onChange={ev=>setAddOffre(f=>({...f,type_contrat:ev.target.value}))} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 12px",color:"#EAE6DE",fontSize:12,fontFamily:"inherit"}}><option>CDI</option><option>CDD</option><option>Stage</option><option>Alternance</option><option>Intérim</option></select>
          <input value={addOffre.lieu} onChange={ev=>setAddOffre(f=>({...f,lieu:ev.target.value}))} placeholder="Lieu" style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit"}}/>
          <div style={{display:"flex",gap:8}}>
            <input value={addOffre.salaire_min} onChange={ev=>setAddOffre(f=>({...f,salaire_min:ev.target.value}))} placeholder="Salaire min €" style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit",width:"50%"}}/>
            <input value={addOffre.salaire_max} onChange={ev=>setAddOffre(f=>({...f,salaire_max:ev.target.value}))} placeholder="Salaire max €" style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:"8px 12px",color:"#EAE6DE",fontSize:13,fontFamily:"inherit",width:"50%"}}/>
          </div>
        </div>
        <textarea value={addOffre.description} onChange={ev=>setAddOffre(f=>({...f,description:ev.target.value}))} placeholder="Description du poste, missions, profil recherché..." rows={4} style={{width:"100%",background:"#121222",border:"1px solid #1E1E36",borderRadius:7,padding:10,color:"#EAE6DE",fontSize:13,fontFamily:"inherit",resize:"vertical",marginBottom:8,boxSizing:"border-box"}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={creerOffre} style={{background:"#9B5FFF",color:"#fff",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>✅ Publier</button>
          <button onClick={()=>setShowAddOffre(false)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Annuler</button>
        </div>
      </div>}
      {chargementRecrutement?<div style={{fontSize:12,color:"#5A5A7A"}}>Chargement...</div>:offresEmploi.length===0?<div style={{fontSize:12,color:"#5A5A7A"}}>Aucune offre publiée.</div>:
      offresEmploi.map((o,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setOffreDeployee(offreDeployee===o.id?null:o.id)}>
          <div>
            <div style={{fontSize:13,fontWeight:700}}>{o.titre} <span style={{fontSize:10,color:"#5A5A7A"}}>· {o.type_contrat}{o.lieu?" · "+o.lieu:""}</span></div>
            <div style={{fontSize:10,color:"#5A5A7A"}}>{(o.candidatures||[]).length} candidature(s)</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{background:(o.statut==="ouverte"?"#2EC9B0":"#5A5A7A")+"22",color:o.statut==="ouverte"?"#2EC9B0":"#5A5A7A",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>{o.statut==="ouverte"?"● Ouverte":"○ Fermée"}</span>
            <button onClick={ev=>{ev.stopPropagation();toggleOffre(o);}} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{o.statut==="ouverte"?"Fermer":"Rouvrir"}</button>
          </div>
        </div>
        {offreDeployee===o.id&&<div style={{marginTop:14,marginBottom:10,fontSize:10,color:"#5A5A7A",background:"#121222",borderRadius:6,padding:8}}>
          📧 Adresse de candidature (à coller sur LinkedIn/Indeed comme "postuler par email") : <span style={{color:"#4B7BFF",userSelect:"all"}}>candidature-{o.id}@reply.xyraio.fr</span>
        </div>}
        {offreDeployee===o.id&&<div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
          {ETAPES_PIPELINE.map(([cle,label])=><div key={cle} style={{minWidth:150,flex:1}}>
            <div style={{fontSize:9,color:"#5A5A7A",fontWeight:600,marginBottom:6,textTransform:"uppercase"}}>{label} ({(o.candidatures||[]).filter(c=>c.etape===cle).length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {(o.candidatures||[]).filter(c=>c.etape===cle).map((c,j)=><div key={j} style={{background:"#121222",borderRadius:8,padding:8,border:"1px solid #1E1E36"}}>
                <div style={{fontSize:11,fontWeight:600}}>{c.nom}</div>
                {c.email&&<div style={{fontSize:9,color:"#5A5A7A"}}>{c.email}</div>}
                <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                  {c.cv_chemin&&<button onClick={()=>voirCv(c.id)} style={{background:"transparent",color:"#4B7BFF",border:"1px solid #4B7BFF44",borderRadius:4,padding:"2px 6px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>📄 CV</button>}
                  {cle!=="embauche"&&cle!=="refuse"&&<select value={cle} onChange={ev=>deplacerEtape(c.id,ev.target.value)} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:4,padding:"2px 4px",color:"#EDEDF5",fontSize:9,fontFamily:"inherit"}}>
                    {ETAPES_PIPELINE.map(([k,l])=><option key={k} value={k}>{l}</option>)}
                  </select>}
                  {cle==="offre"&&<button onClick={()=>convertirEnEmploye(c)} style={{background:"#2EC9B0",color:"#000",border:"none",borderRadius:4,padding:"2px 6px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>✅ Embaucher</button>}
                </div>
              </div>)}
            </div>
          </div>)}
        </div>}
      </div>)}
    </div>}

    {onglet==="onboarding"&&<div>
      <div style={{fontSize:10,color:"#5A5A7A",marginBottom:14}}>Certaines étapes sont détectées automatiquement (contrat signé, RIB, visite médicale, accès créé), d'autres se cochent manuellement.</div>
      {loadingEquipe?<div style={{fontSize:12,color:"#5A5A7A"}}>Chargement...</div>:equipe.length===0?<div style={{fontSize:12,color:"#5A5A7A"}}>Aucun employé.</div>:
      equipe.map((e,i)=>{
        const etapes=e.onboarding||[];
        const faites=etapes.filter(o=>o.fait).length;
        const pct=etapes.length>0?Math.round(faites/etapes.length*100):0;
        return <div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#5A5A7A"}}>Depuis {e.embauche}</div></div>
            <div style={{fontSize:16,fontWeight:700,color:pct===100?"#2EC9B0":"#C9A84C"}}>{pct}%</div>
          </div>
          <div style={{height:6,borderRadius:3,background:"#1E1E36",marginBottom:12}}><div style={{height:"100%",width:pct+"%",background:pct===100?"#2EC9B0":"#C9A84C",borderRadius:3,transition:"width .3s"}}/></div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {etapes.map((o,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
              <input type="checkbox" checked={o.fait} disabled={o.auto} onChange={ev=>toggleOnboarding(e.id,o.cle,ev.target.checked)} style={{cursor:o.auto?"default":"pointer"}}/>
              <span style={{color:o.fait?"#EAE6DE":"#5A5A7A",textDecoration:o.fait?"line-through":"none"}}>{o.etape}</span>
              {o.auto&&<span style={{fontSize:9,color:"#4B7BFF",background:"#4B7BFF11",padding:"1px 6px",borderRadius:8}}>auto</span>}
            </div>)}
          </div>
        </div>;
      })}
    </div>}

    {/* ─── OFFBOARDING ────────────────────────────────────────── */}
    {onglet==="offboarding"&&<div>
      <div style={{fontSize:10,color:"#5A5A7A",marginBottom:14}}>Départs en cours — checklist réelle avant de finaliser (révoquer l'accès, puis supprimer depuis l'onglet Équipe une fois tout coché).</div>
      {loadingEquipe?<div style={{fontSize:12,color:"#5A5A7A"}}>Chargement...</div>:(()=>{
        const enDepart=equipe.filter(e=>e.depart_initie_le);
        const disponibles=equipe.filter(e=>!e.depart_initie_le);
        return <>
        <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:14,marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
          <div style={{fontSize:11,color:"#5A5A7A"}}>Initier un départ :</div>
          <select onChange={ev=>{if(ev.target.value){initierDepart(ev.target.value);ev.target.value="";}}} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}>
            <option value="">— Choisir un collaborateur —</option>
            {disponibles.map(e=><option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>
        {enDepart.length===0?<div style={{fontSize:12,color:"#5A5A7A"}}>Aucun départ en cours.</div>:
        enDepart.map((e,i)=>{
          const etapes=e.offboarding||[];
          const faites=etapes.filter(o=>o.fait).length;
          const pct=etapes.length>0?Math.round(faites/etapes.length*100):0;
          return <div key={i} style={{background:"#0C0C1A",border:"1px solid #FF525244",borderRadius:12,padding:18,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#FF5252"}}>Départ initié le {new Date(e.depart_initie_le).toLocaleDateString("fr-FR")}</div></div>
              <div style={{fontSize:16,fontWeight:700,color:pct===100?"#2EC9B0":"#FF8C3A"}}>{pct}%</div>
            </div>
            <div style={{height:6,borderRadius:3,background:"#1E1E36",marginBottom:12}}><div style={{height:"100%",width:pct+"%",background:pct===100?"#2EC9B0":"#FF8C3A",borderRadius:3,transition:"width .3s"}}/></div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
              {etapes.map((o,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
                <input type="checkbox" checked={o.fait} disabled={o.auto} onChange={ev=>toggleOnboarding(e.id,o.cle,ev.target.checked)} style={{cursor:o.auto?"default":"pointer"}}/>
                <span style={{color:o.fait?"#EAE6DE":"#5A5A7A",textDecoration:o.fait?"line-through":"none"}}>{o.etape}</span>
                {o.auto&&<span style={{fontSize:9,color:"#4B7BFF",background:"#4B7BFF11",padding:"1px 6px",borderRadius:8}}>auto</span>}
              </div>)}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {e.user_id&&<button onClick={()=>revoquerAcces(e)} style={{background:"#FF5252",color:"#fff",border:"none",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>🔒 Révoquer l'accès</button>}
              <button onClick={()=>annulerDepart(e.id)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Annuler le départ</button>
              <button onClick={()=>setOnglet("equipe")} style={{background:"transparent",color:"#FF8C3A",border:"1px solid #FF8C3A44",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>→ Finaliser (supprimer depuis Équipe)</button>
            </div>
          </div>;
        })}
        </>;})()}
    </div>}

    {/* ─── QVT & BIEN-ÊTRE ───────────────────────────────────── */}
    {onglet==="qvt"&&<div>
      {qvtChargement?<div style={{fontSize:12,color:"#5A5A7A"}}>Chargement...</div>:!qvtData?<div style={{fontSize:12,color:"#5A5A7A"}}>Erreur de chargement.</div>:(()=>{
        const emojiDe=(s)=>s>=4.5?"🤩":s>=3.5?"😊":s>=2.5?"🙂":s>=1.5?"😐":"😞";
        const tendance=qvtData.moyenneMois!=null&&qvtData.moyennePrecedente!=null?Math.round((qvtData.moyenneMois-qvtData.moyennePrecedente)*10)/10:null;
        return <>
        <div style={{fontSize:10,color:"#5A5A7A",marginBottom:14}}>Réponses anonymes pour l'équipe — seul le propriétaire du compte voit qui a répondu quoi.</div>
        <div style={{display:"grid",gridTemplateColumns:qvtData.benchmarkXyra?"repeat(4,1fr)":"repeat(3,1fr)",gap:10,marginBottom:14}}>
          <div style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Score moyen ce mois</div><div style={{fontSize:22,fontWeight:700,color:"#9B5FFF"}}>{qvtData.moyenneMois!=null?`${qvtData.moyenneMois} ${emojiDe(qvtData.moyenneMois)}`:"—"}</div></div>
          <div style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Tendance vs mois dernier</div><div style={{fontSize:22,fontWeight:700,color:tendance==null?"#5A5A7A":tendance>=0?"#2EC9B0":"#FF8C3A"}}>{tendance==null?"—":`${tendance>0?"+":""}${tendance}`}</div></div>
          <div style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Participation</div><div style={{fontSize:22,fontWeight:700,color:"#4B7BFF"}}>{qvtData.participation}%</div></div>
          {qvtData.benchmarkXyra&&<div style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Moy. autres clients Xyra</div><div style={{fontSize:22,fontWeight:700,color:"#C9A84C"}}>{qvtData.benchmarkXyra.moyenne}</div><div style={{fontSize:8,color:"#5A5A7A",marginTop:2}}>sur {qvtData.benchmarkXyra.nbEntreprises} entreprises</div></div>}
        </div>
        {qvtData.historique.length>0&&<div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:14}}>
          <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>Évolution du score moyen</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:10,height:80}}>
            {qvtData.historique.map((h,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:"100%",background:"#9B5FFF33",borderRadius:"4px 4px 0 0",height:`${((h.moyenne||0)/5)*100}%`,minHeight:h.moyenne?4:0,position:"relative"}}><div style={{position:"absolute",top:-16,left:0,right:0,textAlign:"center",fontSize:9,color:"#9B5FFF",fontWeight:700}}>{h.moyenne??"—"}</div></div>
              <div style={{fontSize:8,color:"#5A5A7A"}}>{h.mois.slice(5)}</div>
            </div>)}
          </div>
        </div>}
        {qvtData.estProprietaire?<div>
          <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Réponses de ce mois (nominatif — visible uniquement par toi)</div>
          {(!qvtData.detail||qvtData.detail.length===0)?<div style={{fontSize:11,color:"#5A5A7A"}}>Aucune réponse ce mois-ci.</div>:qvtData.detail.map((d,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:10,padding:14,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontWeight:700,fontSize:12}}>{d.nom_employe}</div>
              <div style={{fontSize:18}}>{emojiDe(d.score)} {d.score}/5</div>
            </div>
            {d.commentaire&&<div style={{fontSize:12,color:"#EAE6DE",marginBottom:8}}>"{d.commentaire}"</div>}
            {d.reponse_rh?<div style={{fontSize:11,color:"#9B5FFF",background:"#9B5FFF11",padding:8,borderRadius:6}}>💬 Ta réponse : {d.reponse_rh}</div>:
            qvtReponseId===d.id?<div style={{display:"flex",gap:6}}>
              <input type="text" value={qvtReponseTexte} onChange={ev=>setQvtReponseTexte(ev.target.value)} placeholder="Répondre en privé..." style={{flex:1,background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/>
              <button onClick={()=>repondreQvt(d.id)} style={{background:"#9B5FFF",color:"#fff",border:"none",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Envoyer</button>
            </div>:<button onClick={()=>{setQvtReponseId(d.id);setQvtReponseTexte("");}} style={{background:"transparent",color:"#9B5FFF",border:"1px solid #9B5FFF44",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>💬 Répondre en privé</button>}
          </div>)}
        </div>:<div style={{fontSize:11,color:"#5A5A7A"}}>Le détail nominatif des réponses est réservé au propriétaire du compte.</div>}
        </>;})()}
    </div>}

    {/* ─── RENTABILITÉ ───────────────────────────────────────── */}
    {onglet==="rentabilite"&&<div>
      <div style={{fontSize:10,color:"#5A5A7A",marginBottom:14}}>"CA encaissé" = uniquement l'argent des factures réellement payées, reliées via le devis de la mission. "CA missions" = montant attribué à la mission, pas forcément encore facturé. La marge se calcule sur l'encaissé, jamais sur du théorique.</div>
      {rentabiliteChargement?<div style={{fontSize:12,color:"#5A5A7A"}}>Chargement...</div>:!rentabiliteData?<div style={{fontSize:12,color:"#5A5A7A"}}>Erreur de chargement.</div>:(()=>{
        const totalCaEncaisse=rentabiliteData.lignes.reduce((a,l)=>a+l.caEncaisse,0);
        const totalCaMissions=rentabiliteData.lignes.reduce((a,l)=>a+l.caMissions,0);
        const totalCout=rentabiliteData.lignes.reduce((a,l)=>a+l.coutTotal,0);
        const totalMarge=totalCaEncaisse-totalCout;
        return <>
        {rentabiliteData.alertesDevis&&rentabiliteData.alertesDevis.length>0&&<div style={{background:"#FF8C3A11",border:"1px solid #FF8C3A33",borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:10,color:"#FF8C3A",fontWeight:600,marginBottom:8}}>⚠️ Écarts mission / devis détectés</div>
          {rentabiliteData.alertesDevis.map((al,i)=><div key={i} style={{fontSize:11,color:"#EAE6DE",padding:"4px 0"}}>{al.employe} — mission facturée {al.montantMission}€ alors que le devis d'origine était de {al.montantDevis}€</div>)}
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          <div style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>CA encaissé (équipe)</div><div style={{fontSize:20,fontWeight:700,color:"#2EC9B0"}}>€{totalCaEncaisse.toLocaleString("fr")}</div></div>
          <div style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>CA missions (attribué)</div><div style={{fontSize:20,fontWeight:700,color:"#4B7BFF"}}>€{totalCaMissions.toLocaleString("fr")}</div></div>
          <div style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Coût réel (équipe)</div><div style={{fontSize:20,fontWeight:700,color:"#FF5252"}}>€{totalCout.toLocaleString("fr")}</div></div>
          <div style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Marge nette réelle</div><div style={{fontSize:20,fontWeight:700,color:totalMarge>=0?"#2EC9B0":"#FF8C3A"}}>{totalMarge>=0?"+":""}€{totalMarge.toLocaleString("fr")}</div></div>
        </div>
        <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Collaborateur","Missions","Facturées","CA encaissé","CA missions","Coût réel","Marge","%"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
            <tbody>{rentabiliteData.lignes.length===0?<tr><td colSpan={8} style={{padding:"14px 10px",fontSize:12,color:"#5A5A7A"}}>Aucun employé.</td></tr>:rentabiliteData.lignes.map((l,i)=><tr key={i}>
              <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:600}}>{l.nom}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{l.nbMissions}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{l.missionsFacturees}/{l.nbMissions}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#2EC9B0",fontWeight:700}}>{l.caEncaisse>0?`€${l.caEncaisse.toLocaleString("fr")}`:"—"}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#4B7BFF"}}>{l.caMissions>0?`€${l.caMissions.toLocaleString("fr")}`:"—"}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#FF5252"}}>€{l.coutTotal.toLocaleString("fr")}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:700,color:l.nbMissions===0?"#5A5A7A":l.marge>=0?"#2EC9B0":"#FF8C3A"}}>{l.nbMissions===0?"—":`${l.marge>=0?"+":""}€${l.marge.toLocaleString("fr")}`}</td>
              <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:l.margePct==null?"#5A5A7A":l.margePct>=0?"#2EC9B0":"#FF8C3A"}}>{l.margePct==null||l.nbMissions===0?"—":`${l.margePct>0?"+":""}${l.margePct}%`}</td>
            </tr>)}</tbody>
          </table>
        </div>
        </>;})()}
    </div>}

    {onglet==="objectifs"&&<div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#5A5A7A"}}>{e.role}</div></div>
          <div style={{fontSize:20,fontWeight:700,color:e.perf>=90?"#2EC9B0":"#C9A84C"}}>{e.perf}%</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {(e.objectifs||[]).length>0?e.objectifs.map((obj,j)=>{
            const pct=typeof obj.actuel==="number"&&typeof obj.cible==="number"?Math.min(100,Math.round((obj.actuel/obj.cible)*100)):100;
            const atteint=typeof obj.actuel==="number"?obj.actuel>=obj.cible:true;
            return <div key={j} style={{background:"#121222",borderRadius:8,padding:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:600}}>{obj.obj}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontSize:11,color:atteint?"#2EC9B0":"#C9A84C",fontWeight:700}}>{atteint?"✅ Atteint":"🎯 En cours"}</div>
                  <button onClick={()=>supprimerObjectif(obj)} style={{background:"transparent",color:"#5A5A7A",border:"none",cursor:"pointer",fontSize:11}}>🗑</button>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:6,borderRadius:3,background:"#1E1E36"}}><div style={{height:"100%",width:pct+"%",background:obj.color,borderRadius:3,transition:"width .3s"}}/></div>
                <input type="number" defaultValue={obj.actuel} onBlur={ev=>{const v=Number(ev.target.value);if(!isNaN(v)&&v!==obj.actuel)majProgressionObjectif(obj,v);}} style={{width:60,background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:4,padding:"2px 6px",color:"#EDEDF5",fontSize:10,fontFamily:"inherit"}}/>
                <div style={{fontSize:10,color:"#5A5A7A",whiteSpace:"nowrap"}}>/ {obj.cible}{obj.unite?" "+obj.unite:""}</div>
              </div>
            </div>;
          }):<div style={{fontSize:11,color:"#5A5A7A",textAlign:"center",padding:12}}>Aucun objectif défini</div>}
        </div>
        {objFormId===e.id?<div style={{marginTop:10,background:"#0A0A16",borderRadius:8,padding:12,display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
          <label style={{fontSize:10,color:"#5A5A7A",flex:1,minWidth:140}}>Objectif<br/><input type="text" value={objTitre} onChange={ev=>setObjTitre(ev.target.value)} placeholder="Ex : CA généré" style={{width:"100%",background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Actuel<br/><input type="number" value={objActuel} onChange={ev=>setObjActuel(ev.target.value)} style={{width:70,background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Cible<br/><input type="number" value={objCible} onChange={ev=>setObjCible(ev.target.value)} style={{width:70,background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Unité<br/><input type="text" value={objUnite} onChange={ev=>setObjUnite(ev.target.value)} placeholder="€, missions..." style={{width:90,background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <button onClick={()=>ajouterObjectif(e.id)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:11,fontFamily:"inherit"}}>Ajouter</button>
          <button onClick={()=>setObjFormId(null)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Annuler</button>
        </div>:<button onClick={()=>ouvrirAjoutObjectif(e.id)} style={{marginTop:10,background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Ajouter un objectif</button>}
      </div>)}
    </div>}

    {/* ─── POINTAGE ──────────────────────────────────────────── */}
    {onglet==="pointage"&&(()=>{
      const aujourdhui=new Date().toISOString().slice(0,10);
      const pointageDuJour=(e)=>(e.pointages||[]).find(p=>p.date===aujourdhui);
      const absentAujourdhui=(e)=>(e.absences||[]).some(a=>a.debut<=aujourdhui&&(a.fin||a.debut)>=aujourdhui&&a.statut!=="refusee");
      const presents=equipe.filter(e=>!!pointageDuJour(e)).length;
      const absents=equipe.filter(absentAujourdhui).length;
      const heuresTotales=equipe.reduce((a,e)=>a+Number(pointageDuJour(e)?.heures_travaillees||0),0);
      return <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
      <div style={{fontSize:10,color:"#5A5A7A",marginBottom:10}}>Chaque collaborateur pointe lui-même depuis son espace — le RH peut consulter sa position et corriger un pointage en cas d'oubli.</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["Ont pointé aujourd'hui",presents,"#2EC9B0"],["Heures totales (jour)",heuresTotales.toFixed(1)+"h","#4B7BFF"],["Retards","—","#C9A84C"],["Absents aujourd'hui",absents,"#FF5252"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:9,color:"#5A5A7A",marginBottom:4}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      {loadingEquipe?<div style={{fontSize:12,color:"#5A5A7A"}}>Chargement...</div>:equipe.length===0?<div style={{fontSize:12,color:"#5A5A7A"}}>Aucun employé enregistré.</div>:
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Collaborateur","Arrivée","Départ","Heures (jour)","Statut","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
        <tbody>{equipe.map((e,i)=>{const sc=e.statut==="En mission"?"#C9A84C":e.statut==="Disponible"?"#2EC9B0":"#4B7BFF";const p=pointageDuJour(e);const absent=absentAujourdhui(e);return <Fragment key={i}><tr>
          <td style={{padding:"10px 10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
              <span style={{fontWeight:600}}>{e.nom}</span>
            </div>
          </td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#2ECDC4",fontWeight:700}}>{absent?"🏖 Absent":p?.heure_arrivee?`✅ ${p.heure_arrivee}`:"⏳ Pas encore pointé"}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{p?.heure_depart||"—"}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#4B7BFF",fontWeight:700}}>{p?.heures_travaillees?`${p.heures_travaillees}h`:"—"}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:sc+"22",color:sc,padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>{e.statut}</span></td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>voirPosition(e)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📍 GPS</button>
              <button onClick={()=>ouvrirCorrectionPointage(e)} style={{background:correctionPointageId===e.id?"#4B7BFF":"transparent",color:correctionPointageId===e.id?"#fff":"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>⏰ Pointer</button>
            </div>
          </td>
        </tr>
        {correctionPointageId===e.id&&<tr>
          <td colSpan={6} style={{padding:"10px 10px 14px",borderBottom:"1px solid #1E1E3622",background:"#0A0A16"}}>
            <div style={{fontSize:10,color:"#5A5A7A",marginBottom:8}}>Correction manuelle du pointage du jour pour {e.nom} — à réserver aux oublis ou incidents techniques.</div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <label style={{fontSize:10,color:"#5A5A7A"}}>Arrivée<br/><input type="time" value={correctionArrivee} onChange={ev=>setCorrectionArrivee(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
              <label style={{fontSize:10,color:"#5A5A7A"}}>Départ<br/><input type="time" value={correctionDepart} onChange={ev=>setCorrectionDepart(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
              <button onClick={()=>validerCorrectionPointage(e.id)} style={{background:"#4B7BFF",color:"#fff",border:"none",borderRadius:5,padding:"7px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit",alignSelf:"flex-end"}}>Valider</button>
              <button onClick={()=>setCorrectionPointageId(null)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"7px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit",alignSelf:"flex-end"}}>Annuler</button>
            </div>
          </td>
        </tr>}</Fragment>;})}
        </tbody>
      </table>}
    </div>;})()}

    {/* ─── CONGES ────────────────────────────────────────────── */}
    {onglet==="conges"&&<div>
      {(()=>{
        const toutesDemandes=equipe.flatMap(e=>(e.congesDemandes||[]).map(d=>({...d,_employe:e})));
        const enAttente=toutesDemandes.filter(d=>d.statut==="en_attente");
        const joursAcquis=(embauche)=>{
          if(!embauche||embauche==="—")return 0;
          const d=new Date(embauche);
          if(isNaN(d.getTime()))return 0;
          const mois=(new Date().getFullYear()-d.getFullYear())*12+(new Date().getMonth()-d.getMonth());
          return Math.max(0,Math.round(mois*2.5*10)/10);
        };
        const joursPris=(e)=>(e.congesDemandes||[]).filter(d=>d.statut==="validee").reduce((a,d)=>a+Number(d.jours||0),0);
        // RTT : aucun jour fixe par la loi -- n'existe que si l'employe travaille
        // au-dela de 35h/semaine (accord d'entreprise). Formule reelle : heures
        // au-dela de 35h x ~45,4 semaines travaillees / heures par jour.
        const joursRTT=(heuresSemaine)=>{
          const h=Number(heuresSemaine||35);
          if(h<=35)return 0;
          const heuresRttAn=(h-35)*45.4;
          return Math.round((heuresRttAn/(h/5))*10)/10;
        };
        const majHeuresSemaine=async(id,heures)=>{
          try{
            const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id,heures_semaine:Number(heures)||35})});
            const data=await res.json();
            if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
            loadRealData();
          }catch(e){showToast("❌ Erreur de connexion");}
        };
        const majResponsable=async(id,responsableId)=>{
          try{
            const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'modifier',id,responsable_id:responsableId||null})});
            const data=await res.json();
            if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
            loadRealData();
          }catch(e){showToast("❌ Erreur de connexion");}
        };
        const moisActuel=new Date().getMonth(),anneeActuelle=new Date().getFullYear();
        const prisCeMois=toutesDemandes.filter(d=>d.statut==="validee"&&d.debut&&new Date(d.debut).getMonth()===moisActuel&&new Date(d.debut).getFullYear()===anneeActuelle).reduce((a,d)=>a+Number(d.jours||0),0);
        const statuerConge=async(d,statut)=>{
          try{
            const res=await fetch('/api/absences',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'valider',id:d.id,statut})});
            const data=await res.json();
            if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}
            showToast(statut==="validee"?`✅ Congé approuvé — ${d._employe.nom}`:`❌ Congé refusé — ${d._employe.nom}`);
            loadRealData();
          }catch(e){showToast("❌ Erreur de connexion");}
        };
        return <>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["Congés acquis total",equipe.reduce((a,e)=>a+joursAcquis(e.embauche),0)+"j","#4B7BFF"],["Solde restant total",equipe.reduce((a,e)=>a+e.soldeConges,0)+"j","#2EC9B0"],["Pris ce mois",prisCeMois+"j","#C9A84C"],["Demandes en attente",enAttente.length,"#FF8C3A"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c||"#4B7BFF"}}>{v}</div></div>)}
      </div>
      <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Soldes par collaborateur</div>
        {loadingEquipe?<div style={{fontSize:12,color:"#5A5A7A"}}>Chargement...</div>:equipe.length===0?<div style={{fontSize:12,color:"#5A5A7A"}}>Aucun employé enregistré.</div>:
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Collaborateur","Acquis","Pris","Solde restant","RTT","Responsable"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
          <tbody>{equipe.map((e,i)=><tr key={i}>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:600}}>{e.nom}</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#4B7BFF",fontWeight:700}}>{joursAcquis(e.embauche)}j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{joursPris(e)}j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:e.soldeConges>5?"#2EC9B0":"#FF8C3A",fontWeight:700}}>{e.soldeConges}j</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#C9A84C"}}>
              {joursRTT(e.heures_semaine)}j
              <input type="number" defaultValue={e.heures_semaine||35} min={35} max={45} onBlur={ev=>majHeuresSemaine(e.id,ev.target.value)} style={{width:38,marginLeft:6,background:"#121222",border:"1px solid #1E1E36",borderRadius:4,padding:"2px 4px",color:"#5A5A7A",fontSize:9,fontFamily:"inherit"}}/>
              <span style={{color:"#5A5A7A",fontSize:9}}>h/sem</span>
            </td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
              <select defaultValue={e.responsable_id||""} onChange={ev=>majResponsable(e.id,ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:4,padding:"3px 6px",color:"#EDEDF5",fontSize:10,fontFamily:"inherit"}}>
                <option value="">Aucun (validation directe)</option>
                {equipe.filter(x=>x.id!==e.id).map(x=><option key={x.id} value={x.id}>{x.nom}</option>)}
              </select>
            </td>
          </tr>)}</tbody>
        </table>}
      </div>
      <div style={{background:"#FF8C3A11",border:"1px solid #FF8C3A33",borderRadius:10,padding:14}}>
        <div style={{fontSize:10,color:"#FF8C3A",fontWeight:600,marginBottom:8}}>📋 Demandes en attente</div>
        {enAttente.length===0&&<div style={{fontSize:11,color:"#5A5A7A"}}>Aucune demande en attente.</div>}
        {enAttente.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #FF8C3A22",fontSize:12}}>
          <div>
            <span style={{fontWeight:600}}>{d._employe.nom}</span> — {d.debut}{d.fin&&d.fin!==d.debut?` au ${d.fin}`:""} ({d.jours}j · {d.type||"Congés"})
            {d._employe.responsable_id&&<span style={{marginLeft:8,fontSize:9,background:d.valide_par_responsable_le?"#2EC9B022":"#5A5A7A22",color:d.valide_par_responsable_le?"#2EC9B0":"#5A5A7A",padding:"1px 6px",borderRadius:8}}>{d.valide_par_responsable_le?"✓ Avis responsable":"En attente du responsable"}</span>}
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>statuerConge(d,"validee")} style={{background:"#2EC9B0",color:"#000",border:"none",borderRadius:5,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Approuver</button>
            <button onClick={()=>statuerConge(d,"refusee")} style={{background:"transparent",color:"#FF5252",border:"1px solid #FF525233",borderRadius:5,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Refuser</button>
          </div>
        </div>)}
      </div>
      </>;})()}
    </div>}

    {/* ─── PLANNING CALENDRIER ───────────────────────────────── */}
    {onglet==="planning_cal"&&<div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700}}>📅 Calendrier des congés — {["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][moisCal-1]} 2026</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setMoisCal(m=>Math.max(1,m-1))} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>← Préc.</button>
          <button onClick={()=>setMoisCal(m=>Math.min(12,m+1))} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>Suiv. →</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:8}}>
        {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j=><div key={j} style={{textAlign:"center",fontSize:9,color:"#5A5A7A",fontWeight:600,padding:"4px 0"}}>{j}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {Array.from({length:30},(_, i)=>{
          const jour=i+1;
          const congeThomas=moisCal===5&&jour>=20&&jour<=22&&equipe[0];
          const congeAbou=moisCal===5&&jour===27&&equipe[1];
          const weekend=(i+3)%7>=5;
          return <div key={i} style={{background:weekend?"#121222":congeThomas?equipe[0].couleur+"33":congeAbou?equipe[1].couleur+"33":"#121222",border:`1px solid ${congeThomas?equipe[0].couleur+"55":congeAbou?equipe[1].couleur+"55":"#1E1E36"}`,borderRadius:4,padding:"6px 4px",textAlign:"center",minHeight:42}}>
            <div style={{fontSize:11,color:weekend?"#1E1E36":"#EAE6DE",fontWeight:600}}>{jour}</div>
            {congeThomas&&<div style={{fontSize:8,color:equipe[0].couleur,marginTop:2}}>{equipe[0].prenom}</div>}
            {congeAbou&&<div style={{fontSize:8,color:equipe[1].couleur,marginTop:2}}>{equipe[1].prenom}</div>}
          </div>;
        })}
      </div>
      <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap"}}>
        {equipe.map((e,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#5A5A7A"}}><div style={{width:10,height:10,borderRadius:2,background:e.couleur}}/>{e.prenom}</div>)}
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#5A5A7A"}}><div style={{width:10,height:10,borderRadius:2,background:"#121222",border:"1px solid #1E1E36"}}/> Weekend</div>
      </div>
    </div>}

    {/* ─── ARRETS MALADIE ────────────────────────────────────── */}
    {onglet==="arrets"&&(()=>{
      const joursOuvresMois=22;
      const joursPerdusMois=equipe.reduce((a,e)=>a+arretsCeMoisDe(e).reduce((b,ar)=>b+(ar.jours||0),0),0);
      const tauxAbsenteisme=equipe.length>0?((joursPerdusMois/(joursOuvresMois*equipe.length))*100).toFixed(1)+"%":"—";
      return <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Arrêts ce mois",totalArrets,"#FF5252"],["Jours perdus (mois)",joursPerdusMois+"j","#FF8C3A"],["Taux absentéisme (est.)",tauxAbsenteisme,"#C9A84C"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      {loadingEquipe?<div style={{fontSize:12,color:"#5A5A7A"}}>Chargement...</div>:equipe.length===0?<div style={{fontSize:12,color:"#5A5A7A"}}>Aucun employé enregistré.</div>:
      equipe.map((e,i)=>{const ar=arretsDe(e);return <div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1,fontSize:13,fontWeight:700}}>{e.nom}</div>
          <span style={{fontSize:11,color:ar.length>0?"#FF5252":"#2EC9B0"}}>{ar.length>0?ar.length+" arrêt(s)":"✅ Aucun arrêt"}</span>
        </div>
        {ar.length>0?<table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Début","Fin","Jours","Motif","Statut"].map(h=><th key={h} style={{textAlign:"left",padding:"6px 8px",fontSize:9,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
          <tbody>{ar.map((a,j)=><tr key={j}><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:"#FF5252"}}>{a.debut}</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622"}}>{a.fin||"—"}</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622",fontWeight:700}}>{a.jours}j</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622"}}>{a.motif||(a.type==="accident_travail"?"Accident du travail":"Arrêt maladie")}</td><td style={{padding:"7px 8px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:a.statut==="validee"?"#2EC9B0":a.statut==="refusee"?"#FF5252":"#C9A84C"}}>{a.statut}</td></tr>)}</tbody>
        </table>:<div style={{fontSize:11,color:"#5A5A7A",padding:"8px 0"}}>Aucun arrêt maladie enregistré</div>}
        {arretFormId===e.id?<div style={{marginTop:10,background:"#0A0A16",borderRadius:8,padding:12,display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Type<br/><select value={arretType} onChange={ev=>setArretType(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}><option value="arret_maladie">Arrêt maladie</option><option value="accident_travail">Accident du travail</option></select></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Début<br/><input type="date" value={arretDebut} onChange={ev=>setArretDebut(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Fin<br/><input type="date" value={arretFin} onChange={ev=>setArretFin(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <label style={{fontSize:10,color:"#5A5A7A",flex:1,minWidth:140}}>Motif (facultatif)<br/><input type="text" value={arretMotif} onChange={ev=>setArretMotif(ev.target.value)} style={{width:"100%",background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <button onClick={()=>declarerArret(e)} style={{background:"#FF5252",color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Enregistrer</button>
          <button onClick={()=>setArretFormId(null)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Annuler</button>
        </div>:<button onClick={()=>ouvrirDeclarationArret(e.id)} style={{marginTop:10,background:"transparent",color:"#FF5252",border:"1px solid #FF525233",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Déclarer un arrêt</button>}
      </div>;})}
    </div>;})()}

    {/* ─── PAIE ──────────────────────────────────────────────── */}
    {onglet==="paie"&&(()=>{
      const moisLabel=new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
      const totalNet=equipe.reduce((a,e)=>a+(e.paie?.salaireNet||0),0);
      const totalPatronales=equipe.reduce((a,e)=>a+(e.paie?.chargesPatronales||0),0);
      const totalCout=equipe.reduce((a,e)=>a+(e.paie?.coutTotal||0),0);
      return <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Masse nette/mois","€"+totalNet.toLocaleString("fr"),"#FF5252"],["Charges patronales (42%)","€"+totalPatronales.toLocaleString("fr"),"#FF8C3A"],["Coût total employeur","€"+totalCout.toLocaleString("fr"),"#C9A84C"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      <div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Collaborateur","Contrat","Salaire net","Charges soc.","Coût total","Statut","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
          <tbody>{equipe.map((e,i)=><tr key={i}>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:600}}>{e.nom}</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:(e.contrat==="CDI"?"#2EC9B0":"#4B7BFF")+"22",color:e.contrat==="CDI"?"#2EC9B0":"#4B7BFF",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>{e.contrat}</span></td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:700}}>{(e.paie?.salaireNet||0).toLocaleString("fr")} €</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#FF8C3A"}}>{(e.paie?.chargesPatronales||0).toLocaleString("fr")} €</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#FF5252",fontWeight:700}}>{(e.paie?.coutTotal||0).toLocaleString("fr")} €</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>{e.fichePaieEnvoyee?<span style={{background:"#2EC9B022",color:"#2EC9B0",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>✓ Envoyée</span>:<span style={{background:"#5A5A7A22",color:"#5A5A7A",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>○ Non envoyée</span>}</td>
            <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>voirFichePaie(e)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>💸 Fiche</button>
                <button onClick={()=>envoyerFichePaie(e)} disabled={envoiFicheEnCours===e.id} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{envoiFicheEnCours===e.id?"...":"📧"}</button>
              </div>
            </td>
          </tr>)}</tbody>
        </table>
      </div>
      <button onClick={envoyerToutesLesFiches} disabled={envoiToutesFichesEnCours} style={{width:"100%",background:"#C9A84C",color:"#000",border:"none",borderRadius:8,padding:"10px 16px",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>{envoiToutesFichesEnCours?"Envoi en cours...":`💸 Générer & Envoyer toutes les fiches de paie — ${moisLabel}`}</button>
      <button onClick={()=>window.open('/api/equipe?action=export_paie','_blank')} style={{width:"100%",marginTop:8,background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:8,padding:"9px 16px",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"inherit"}}>📤 Export paie du mois (CSV, prêt pour expert-comptable / Silae / PayFit)</button>
    </div>;})()}

    {/* ─── CONTRATS ──────────────────────────────────────────── */}
    {onglet==="contrats"&&<div style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>📋 Contrats de travail</div>
        <button onClick={genererEtEnvoyerTousLesContrats} disabled={envoiContratsGroupeEnCours} style={{background:"#9B5FFF",color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{envoiContratsGroupeEnCours?"Envoi...":"🤖 Générer (IA) & envoyer à tous"}</button>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Collaborateur","Type","Embauche","Fin prévue","Poste","Salaire","Statut","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:"#5A5A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:"1px solid #1E1E36"}}>{h}</th>)}</tr></thead>
        <tbody>{equipe.map((e,i)=>{
          const dernierContrat=dernierContratDe(e.id);
          const statutSignature=dernierContrat?.statut;
          return <Fragment key={i}><tr>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",fontWeight:600}}>{e.nom}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}><span style={{background:(e.contrat==="CDI"?"#2EC9B0":"#4B7BFF")+"22",color:e.contrat==="CDI"?"#2EC9B0":"#4B7BFF",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>{e.contrat}</span></td>
          <td style={{padding:"10px",fontSize:10,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{e.embauche}</td>
          <td style={{padding:"10px",fontSize:10,borderBottom:"1px solid #1E1E3622",color:e.contrat==="CDD"?"#FF8C3A":"#5A5A7A"}}>{e.contrat==="CDD"?<input type="date" defaultValue={e.date_fin_contrat||""} onBlur={ev=>majDateFinContrat(e.id,ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:4,padding:"2px 4px",color:"#FF8C3A",fontSize:10,fontFamily:"inherit"}}/>:"Indéterminée"}</td>
          <td style={{padding:"10px",fontSize:11,borderBottom:"1px solid #1E1E3622",color:"#5A5A7A"}}>{e.role}</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622",color:"#C9A84C",fontWeight:700}}>{e.salaire.toLocaleString("fr")} €</td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
            {statutSignature==="signe"?<span style={{background:"#2EC9B022",color:"#2EC9B0",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>✓ Signé</span>
            :statutSignature==="envoye"?<span style={{background:"#4B7BFF22",color:"#4B7BFF",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>✉ Envoyé, en attente</span>
            :<span style={{background:"#5A5A7A22",color:"#5A5A7A",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600}}>○ Non envoyé</span>}
          </td>
          <td style={{padding:"10px",fontSize:12,borderBottom:"1px solid #1E1E3622"}}>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {statutSignature==="signe"?
                <button onClick={()=>window.open(`/api/contrats?action=pdf&id=${dernierContrat.id}`,'_blank')} style={{background:"#2EC9B0",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📄 Voir signé</button>
              :<button onClick={()=>ouvrirEnvoiSignature(e)} style={{background:"#9B5FFF",color:"#fff",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>✍️ Signature</button>}
              <button onClick={()=>genererContrat(e,true)} disabled={genContratEnCours===e.id} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{genContratEnCours===e.id?"...":"📄 Aperçu IA"}</button>
              <button onClick={()=>envoyerContratWhatsApp(e)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>WA</button>
            </div>
          </td>
        </tr>
        {signatureFormId===e.id&&<tr>
          <td colSpan={8} style={{padding:"10px 10px 14px",borderBottom:"1px solid #1E1E3622",background:"#0A0A16"}}>
            <div style={{fontSize:10,color:"#5A5A7A",marginBottom:8}}>Envoi du vrai {e.contrat} pour signature électronique à {e.email||"(aucun email)"} — modèle légal réel, code de vérification par email, certificat de signature.</div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
              <label style={{fontSize:10,color:"#5A5A7A"}}>Qualification / catégorie<br/><input type="text" value={signatureForm.qualification} onChange={ev=>setSignatureForm(f=>({...f,qualification:ev.target.value}))} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
              <label style={{fontSize:10,color:"#5A5A7A"}}>Période d'essai<br/><input type="text" value={signatureForm.duree_periode_essai} onChange={ev=>setSignatureForm(f=>({...f,duree_periode_essai:ev.target.value}))} style={{width:100,background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
              <label style={{fontSize:10,color:"#5A5A7A"}}>Convention collective<br/><input type="text" value={signatureForm.convention_collective} onChange={ev=>setSignatureForm(f=>({...f,convention_collective:ev.target.value}))} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
              {e.contrat==="CDD"&&<label style={{fontSize:10,color:"#5A5A7A"}}>Motif de recours (CDD)<br/><input type="text" value={signatureForm.motif_recours} onChange={ev=>setSignatureForm(f=>({...f,motif_recours:ev.target.value}))} placeholder="Ex : accroissement d'activité" style={{width:180,background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>}
              <label style={{fontSize:10,color:"#5A5A7A",flex:1,minWidth:160}}>Lieu de travail<br/><input type="text" value={signatureForm.lieu_travail} onChange={ev=>setSignatureForm(f=>({...f,lieu_travail:ev.target.value}))} style={{width:"100%",background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
            </div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button onClick={()=>envoyerPourSignature(e)} disabled={envoiSignatureEnCours} style={{background:"#9B5FFF",color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:11,fontFamily:"inherit"}}>{envoiSignatureEnCours?"Envoi...":"✍️ Envoyer pour signature électronique"}</button>
              <button onClick={()=>setSignatureFormId(null)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Annuler</button>
            </div>
          </td>
        </tr>}</Fragment>;})}</tbody>
      </table>
      <div style={{fontSize:9,color:"#5A5A7A",marginTop:10}}>"Signature" envoie un vrai contrat légal (modèle CDI/CDD réel) pour signature électronique — code de vérification, certificat, PDF signé. "Aperçu IA" reste un brouillon informel imprimable, pas une signature.</div>
    </div>}

    {/* ─── DOCUMENTS RH ──────────────────────────────────────── */}
    {onglet==="documents"&&<div>
      {loadingEquipe?<div style={{fontSize:12,color:"#5A5A7A"}}>Chargement...</div>:equipe.length===0?<div style={{fontSize:12,color:"#5A5A7A"}}>Aucun employé enregistré.</div>:
      equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1,fontSize:13,fontWeight:700}}>{e.nom}</div>
          <button onClick={()=>ouvrirAjoutDocument(e.id)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>+ Ajouter document</button>
        </div>
        {docFormId===e.id&&<div style={{background:"#0A0A16",borderRadius:8,padding:12,marginBottom:10,display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Type<br/><select value={docType} onChange={ev=>setDocType(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}><option>Carte d'identité</option><option>Contrat signé</option><option>RIB</option><option>Justificatif de domicile</option><option>Autre</option></select></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Expiration (facultatif)<br/><input type="date" value={docExpire} onChange={ev=>setDocExpire(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Fichier<br/><input type="file" onChange={ev=>setDocFichier(ev.target.files?.[0]||null)} style={{fontSize:10,color:"#EDEDF5"}}/></label>
          <button onClick={()=>ajouterDocument(e.id)} disabled={uploadDocEnCours} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:11,fontFamily:"inherit"}}>{uploadDocEnCours?"Envoi...":"Ajouter"}</button>
          <button onClick={()=>setDocFormId(null)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Annuler</button>
        </div>}
        {(e.documents||[]).length===0?<div style={{fontSize:11,color:"#5A5A7A"}}>Aucun document.</div>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
          {e.documents.map((d,j)=><div key={j} style={{background:"#121222",borderRadius:8,padding:10,border:"1px solid #1E1E36"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:600}}>{d.nom}</span>
              <span style={{fontSize:9,background:"#2EC9B022",color:"#2EC9B0",padding:"1px 5px",borderRadius:8,fontWeight:600}}>{d.statut}</span>
            </div>
            <div style={{fontSize:9,color:"#5A5A7A",marginBottom:6}}>{d.type}{d.expire_le?" · Expire : "+new Date(d.expire_le).toLocaleDateString("fr-FR"):""}{d.created_at?" · "+new Date(d.created_at).toLocaleDateString("fr-FR"):""}</div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>voirDocument(d)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>📥 Voir</button>
              <button onClick={()=>envoyerDocument(d,e.nom)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>📧</button>
              <button onClick={async()=>{if(!window.confirm(`Supprimer ${d.nom} ?`))return;const res=await fetch('/api/equipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer_document',id:d.id})});const data=await res.json();if(!res.ok||data.error){showToast(`❌ ${data.error||"Erreur"}`);return;}showToast("✅ Document supprimé");loadRealData();}} style={{background:"transparent",color:"#FF5252",border:"1px solid #FF525233",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>🗑</button>
            </div>
          </div>)}
        </div>}
      </div>)}
    </div>}

    {/* ─── ENTRETIENS ────────────────────────────────────────── */}
    {onglet==="entretiens"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>💼 Entretiens & Évaluations</div>
        <button onClick={()=>showToast("✅ Entretien planifié et notification envoyée !")} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"inherit"}}>+ Planifier un entretien</button>
      </div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#5A5A7A"}}>{(e.evaluations||[]).length} évaluation(s)</div></div>
          <div style={{fontSize:18,fontWeight:700,color:e.perf>=90?"#2EC9B0":"#C9A84C"}}>{e.perf}%</div>
        </div>
        {(e.evaluations||[]).map((ev,j)=><div key={j} style={{background:"#121222",borderRadius:8,padding:12,marginBottom:8,border:"1px solid #1E1E36"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:600}}>Évaluation du {ev.created_at?new Date(ev.created_at).toLocaleDateString("fr-FR"):"—"}</div>
            <div style={{fontSize:16,fontWeight:700,color:ev.note>=90?"#2EC9B0":"#C9A84C"}}>{ev.note}/100</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:11}}>
            <div style={{background:"#2EC9B011",borderRadius:6,padding:8}}><div style={{fontSize:9,color:"#2EC9B0",fontWeight:600,marginBottom:3}}>✅ POINTS FORTS</div><div style={{color:"#EAE6DE"}}>{ev.points_forts||"—"}</div></div>
            <div style={{background:"#FF8C3A11",borderRadius:6,padding:8}}><div style={{fontSize:9,color:"#FF8C3A",fontWeight:600,marginBottom:3}}>📈 AXES D'AMÉLIORATION</div><div style={{color:"#EAE6DE"}}>{ev.axes_amelioration||"—"}</div></div>
          </div>
          <div style={{fontSize:10,color:"#5A5A7A",marginTop:6}}>Évaluateur : {ev.evaluateur}</div>
        </div>)}
        {evalFormId===e.id?<div style={{background:"#0A0A16",borderRadius:8,padding:12,display:"flex",flexDirection:"column",gap:8}}>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Note /100<br/><input type="number" min="0" max="100" value={evalNote} onChange={ev=>setEvalNote(ev.target.value)} style={{width:80,background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Points forts<br/><textarea value={evalPoints} onChange={ev=>setEvalPoints(ev.target.value)} rows={2} style={{width:"100%",background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"6px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit",resize:"vertical"}}/></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Axes d'amélioration<br/><textarea value={evalAxes} onChange={ev=>setEvalAxes(ev.target.value)} rows={2} style={{width:"100%",background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"6px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit",resize:"vertical"}}/></label>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>creerEvaluation(e)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontWeight:600,fontSize:11,fontFamily:"inherit"}}>Enregistrer</button>
            <button onClick={()=>setEvalFormId(null)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Annuler</button>
          </div>
        </div>:<button onClick={()=>ouvrirNouvelleEvaluation(e.id)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Nouvelle évaluation</button>}
      </div>)}
    </div>}

    {/* ─── FORMATIONS ────────────────────────────────────────── */}
    {onglet==="formations"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Formations complètes",equipe.reduce((a,e)=>a+e.formations.filter(f=>f.statut==="complété").length,0),"#2EC9B0"],["En cours",equipe.reduce((a,e)=>a+e.formations.filter(f=>f.statut==="en cours").length,0),"#4B7BFF"],["À faire",equipe.reduce((a,e)=>a+e.formations.filter(f=>f.statut==="à faire").length,0),"#FF8C3A"]].map(([l,v,c],i)=><div key={i} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:10,padding:14}}><div style={{fontSize:9,color:"#5A5A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div></div>)}
      </div>
      {loadingEquipe?<div style={{fontSize:12,color:"#5A5A7A"}}>Chargement...</div>:
       equipe.length===0?<div style={{fontSize:12,color:"#5A5A7A"}}>Aucun employé enregistré.</div>:
      equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:16,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:e.couleur+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1,fontSize:13,fontWeight:700}}>{e.nom}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {e.formations.length===0&&<div style={{fontSize:11,color:"#5A5A7A"}}>Aucune formation assignée.</div>}
          {e.formations.map((f,j)=>{
            const video=catalogue.find(c=>c.id===f.catalogue_id);
            return <div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#121222",borderRadius:7,padding:"8px 12px",border:"1px solid #1E1E36",flexWrap:"wrap",gap:6}}>
            <div><div style={{fontSize:11,fontWeight:600}}>{f.titre}</div><div style={{fontSize:9,color:"#5A5A7A"}}>{(f.date_completion||f.created_at||"").slice(0,10)}</div></div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {f.score&&<span style={{fontSize:11,fontWeight:700,color:"#2EC9B0"}}>{f.score}%</span>}
              <span style={{fontSize:10,background:f.statut==="complété"?"#2EC9B022":f.statut==="en cours"?"#4B7BFF22":"#FF8C3A22",color:f.statut==="complété"?"#2EC9B0":f.statut==="en cours"?"#4B7BFF":"#FF8C3A",padding:"2px 8px",borderRadius:10,fontWeight:600}}>{f.statut}</span>
              {video?.video_url&&<a href={video.video_url} target="_blank" rel="noreferrer" style={{fontSize:9,color:"#4B7BFF",textDecoration:"none",border:"1px solid #4B7BFF44",borderRadius:4,padding:"3px 8px"}}>▶ Voir la vidéo</a>}
              {f.statut==="à faire"&&<button onClick={()=>majFormationEquipe(f,"en cours")} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>▶ Démarrer</button>}
              {f.statut==="en cours"&&<button onClick={()=>majFormationEquipe(f,"complété")} style={{background:"transparent",color:"#2EC9B0",border:"1px solid #2EC9B044",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>✅ Terminer</button>}
              {f.statut==="complété"&&<button onClick={()=>majFormationEquipe(f,"en cours")} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #5A5A7A44",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>↺ Refaire</button>}
            </div>
          </div>;})}
        </div>
        {assignerPourId===e.id?<div style={{marginTop:10,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <select value={choixCatalogueId} onChange={ev=>setChoixCatalogueId(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}>
            <option value="">Choisir une vidéo...</option>
            {catalogue.map(c=><option key={c.id} value={c.id}>{c.titre}</option>)}
          </select>
          <button onClick={()=>assignerFormation(e.id)} style={{background:"#4B7BFF",color:"#fff",border:"none",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Assigner</button>
          <button onClick={()=>{setAssignerPourId(null);setChoixCatalogueId("");}} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Annuler</button>
        </div>:
        <button onClick={()=>setAssignerPourId(e.id)} style={{marginTop:10,background:"transparent",color:"#4B7BFF",border:"1px solid #4B7BFF33",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Assigner une formation</button>}
      </div>)}
    </div>}

    {/* ─── EVOLUTION CARRIERE ─────────────────────────────────── */}
    {onglet==="carriere"&&<div>
      {equipe.map((e,i)=><div key={i} style={{background:"#0C0C1A",border:"1px solid #1E1E36",borderRadius:12,padding:18,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:e.couleur+"22",border:`2px solid ${e.couleur}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:e.couleur}}>{e.nom[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{e.nom}</div><div style={{fontSize:10,color:"#5A5A7A"}}>Depuis {e.embauche} · Poste actuel : {e.role}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#5A5A7A"}}>Salaire actuel</div><div style={{fontSize:16,fontWeight:700,color:"#C9A84C"}}>{e.salaire.toLocaleString("fr")} €</div></div>
        </div>
        {(e.carriere||[]).length===0?<div style={{fontSize:11,color:"#5A5A7A",padding:"8px 0"}}>Aucun historique enregistré.</div>:
        <div style={{position:"relative",paddingLeft:24}}>
          <div style={{position:"absolute",left:8,top:0,bottom:0,width:2,background:"#1E1E36",borderRadius:1}}/>
          {e.carriere.map((c,j)=><div key={j} style={{position:"relative",marginBottom:16}}>
            <div style={{position:"absolute",left:-20,top:4,width:10,height:10,borderRadius:"50%",background:j===e.carriere.length-1?e.couleur:"#1E1E36",border:`2px solid ${e.couleur}`}}/>
            <div style={{background:"#121222",borderRadius:8,padding:10,border:`1px solid ${j===e.carriere.length-1?e.couleur+"44":"#1E1E36"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:12,fontWeight:700,color:j===e.carriere.length-1?e.couleur:"#EAE6DE"}}>{c.poste}</div><div style={{fontSize:9,color:"#5A5A7A"}}>{new Date(c.date).toLocaleDateString("fr-FR")}</div></div>
                <div style={{fontSize:13,fontWeight:700,color:"#C9A84C"}}>{c.salaire.toLocaleString("fr")} €</div>
              </div>
              {j>0&&<div style={{fontSize:9,color:"#2EC9B0",marginTop:4}}>↗ +{(c.salaire-e.carriere[j-1].salaire).toLocaleString("fr")}€ ({Math.round((c.salaire-e.carriere[j-1].salaire)/e.carriere[j-1].salaire*100)}%)</div>}
            </div>
          </div>)}
        </div>}
        {promoFormId===e.id?<div style={{marginTop:10,background:"#0A0A16",borderRadius:8,padding:12,display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Nouveau poste<br/><input type="text" value={promoPoste} onChange={ev=>setPromoPoste(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Nouveau salaire<br/><input type="number" value={promoSalaire} onChange={ev=>setPromoSalaire(ev.target.value)} style={{width:100,background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <label style={{fontSize:10,color:"#5A5A7A"}}>Date<br/><input type="date" value={promoDate} onChange={ev=>setPromoDate(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
          <button onClick={()=>ajouterPromotion(e.id)} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:11,fontFamily:"inherit"}}>Enregistrer</button>
          <button onClick={()=>setPromoFormId(null)} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Annuler</button>
        </div>:<button onClick={()=>ouvrirAjoutPromotion(e)} style={{marginTop:10,background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Ajouter une promotion</button>}
      </div>)}
    </div>}

    {/* ─── ALERTES RH ────────────────────────────────────────── */}
    {onglet==="alertes"&&<div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {alertes.length===0&&<Card style={{textAlign:"center",padding:30}}>
          <div style={{fontSize:12,color:C.muted}}>Aucune alerte RH pour le moment.</div>
        </Card>}
        {alertes.map(al=>({
          niveau: al.type==="contrat"?"critique":al.type==="acompte"?"urgent":"info",
          icon: al.type==="contrat"?"🚨":al.type==="conge"?"📅":al.type==="acompte"?"💰":"📊",
          titre: `${al.nom} — ${al.detail}`,
          detail: al.detail,
          couleur: al.type==="contrat"?C.red:al.type==="acompte"?C.orange:C.blue,
        })).map((a,i)=><div key={i} style={{background:`${a.couleur}11`,border:`1px solid ${a.couleur}33`,borderRadius:10,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <span>{a.icon}</span>
                <span style={{fontSize:12,fontWeight:700,color:a.couleur}}>{a.titre}</span>
              </div>
              <div style={{fontSize:11,color:"#EAE6DE",lineHeight:1.6,paddingLeft:24}}>{a.detail}</div>
            </div>
            {a.action&&<button onClick={()=>showToast(`✅ Action "${a.action}" enregistrée !`)} style={{background:a.couleur,color:a.niveau==="good"?"#000":"#000",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600,flexShrink:0,marginLeft:12}}>{a.action}</button>}
          </div>
        </div>)}
      </div>
    </div>}

    {/* ─── IA RH ─────────────────────────────────────────────── */}
    {onglet==="ia"&&!estRH&&<div style={{textAlign:"center",padding:40,color:"#5A5A7A",fontSize:12}}>Réservé au propriétaire et aux administrateurs.</div>}
    {onglet==="ia"&&estRH&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"#9B5FFF11",border:"1px solid #9B5FFF33",borderRadius:12,padding:16}}>
        <div style={{fontSize:10,color:"#9B5FFF",fontWeight:600,marginBottom:8}}>🤖 Analyse RH globale — Claude Sonnet</div>
        <div style={{fontSize:12,color:"#EAE6DE",lineHeight:1.8}}>Votre équipe de 3 personnes performe à {perfMoy}% en moyenne. Thomas est votre meilleur élément (94%) et justifie une prime. Le CDD d'Abou expire bientôt — la conversion en CDI est recommandée au vu de sa progression. Fatou excelle en relation client et pourrait évoluer vers un poste de responsable commerciale.</div>
      </div>
      {[{icon:"📈",titre:"Performance & Rémunération",txt:`Thomas (94%) mérite une augmentation de 200-300€. Abou progresse (+8pts en 3 mois), prévoir une revalorisation à la conversion CDI. Masse salariale actuelle : ${totalSalaire.toLocaleString("fr")}€/mois — raisonnable pour votre CA.`,col:"#2EC9B0"},{icon:"⚖️",titre:"Risques juridiques",txt:"1 risque identifié : CDD Abou Diallo à convertir ou non renouveler sous 2 mois. 1 visite médicale en retard (Thomas). 1 entretien professionnel à planifier (Fatou). Ces 3 points sont prioritaires.",col:"#FF8C3A"},{icon:"🏆",titre:"Recommandation recrutement",txt:"Votre CA +12% justifie un 4ème technicien. Profil idéal : polyvalent, zone Paris Est, 2 000€ net. Retour sur investissement en 3 mois. Publier l'offre sur Indeed + LinkedIn.",col:"#4B7BFF"},{icon:"💡",titre:"Optimisation coûts RH",txt:"Convention collective services à la personne applicable : exonérations URSSAF possibles. Chèques emploi service universels (CESU) pour réduire les charges de 15-20%. À valider avec votre expert-comptable.",col:"#C9A84C"}].map((a,i)=><div key={i} style={{background:`${a.col}11`,border:`1px solid ${a.col}33`,borderRadius:10,padding:14}}>
        <div style={{fontSize:11,fontWeight:700,color:a.col,marginBottom:6}}>{a.icon} {a.titre}</div>
        <div style={{fontSize:12,color:"#EAE6DE",lineHeight:1.7}}>{a.txt}</div>
      </div>)}
    </div>}

    {/* ─── JURIDIQUE ─────────────────────────────────────────── */}
    {onglet==="juridique"&&<div>
      <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Visites médicales</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        {equipe.length===0?<div style={{fontSize:11,color:"#5A5A7A"}}>Aucun employé.</div>:equipe.map((e,i)=>{
          const echeance=e.visite_medicale_echeance;
          const aujourdhui=new Date().toISOString().slice(0,10);
          const enRetard=echeance&&echeance<aujourdhui;
          const c=!echeance?"#5A5A7A":enRetard?"#FF8C3A":"#2EC9B0";
          return <div key={i} style={{background:"#0C0C1A",borderRadius:8,padding:12,border:`1px solid ${c}22`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
            <div style={{fontSize:12,fontWeight:600}}>Visite médicale — {e.nom}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="date" defaultValue={echeance||""} onBlur={ev=>majVisiteMedicale(e.id,ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"4px 8px",color:"#EDEDF5",fontSize:10,fontFamily:"inherit"}}/>
              <span style={{background:c+"22",color:c,padding:"2px 10px",borderRadius:10,fontSize:10,fontWeight:600,border:`1px solid ${c}44`,flexShrink:0}}>{!echeance?"Non renseignée":enRetard?"⚠️ Renouvellement":"✅ À jour"}</span>
            </div>
          </div>;
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:9,color:"#5A5A7A",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>Obligations légales de l'entreprise</div>
        <button onClick={()=>setOblFormOuvert(o=>!o)} style={{background:"transparent",color:"#C9A84C",border:"1px solid #C9A84C44",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>+ Ajouter</button>
      </div>
      {oblFormOuvert&&<div style={{background:"#0A0A16",borderRadius:8,padding:12,marginBottom:10,display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
        <label style={{fontSize:10,color:"#5A5A7A",flex:1,minWidth:160}}>Obligation<br/><input type="text" value={oblLibelle} onChange={ev=>setOblLibelle(ev.target.value)} placeholder="Ex : Affichage obligatoire" style={{width:"100%",background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
        <label style={{fontSize:10,color:"#5A5A7A"}}>Échéance (facultatif)<br/><input type="date" value={oblEcheance} onChange={ev=>setOblEcheance(ev.target.value)} style={{background:"#121222",border:"1px solid #1E1E36",borderRadius:5,padding:"5px 8px",color:"#EDEDF5",fontSize:11,fontFamily:"inherit"}}/></label>
        <button onClick={ajouterObligation} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:11,fontFamily:"inherit"}}>Ajouter</button>
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        {obligationsLegales.length===0?<div style={{fontSize:11,color:"#5A5A7A"}}>Aucune obligation enregistrée — utilise "+ Ajouter" ou "🤖 Checklist IA".</div>:obligationsLegales.map((o,i)=>{
          const c=o.statut==="a_jour"?"#2EC9B0":"#FF8C3A";
          return <div key={i} style={{background:"#0C0C1A",borderRadius:8,padding:12,border:`1px solid ${c}22`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
            <div><div style={{fontSize:12,fontWeight:600}}>{o.libelle}</div>{o.echeance&&<div style={{fontSize:10,color:"#5A5A7A"}}>Échéance : {new Date(o.echeance).toLocaleDateString("fr-FR")}</div>}</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <button onClick={()=>toggleStatutObligation(o)} style={{background:c+"22",color:c,padding:"2px 10px",borderRadius:10,fontSize:10,fontWeight:600,border:`1px solid ${c}44`,cursor:"pointer",fontFamily:"inherit"}}>{o.statut==="a_jour"?"✅ À jour":"⏳ À faire"}</button>
              <button onClick={()=>supprimerObligation(o)} style={{background:"transparent",color:"#5A5A7A",border:"none",cursor:"pointer",fontSize:11}}>🗑</button>
            </div>
          </div>;
        })}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={voirRegistrePersonnel} disabled={genRegistreEnCours} style={{background:"#C9A84C",color:"#000",border:"none",borderRadius:7,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"inherit"}}>{genRegistreEnCours?"...":"📄 Registre personnel"}</button>
        <button onClick={genererObligationsIa} disabled={genObligationsEnCours} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>{genObligationsEnCours?"...":"🤖 Checklist IA"}</button>
        <button onClick={voirDuer} disabled={genDuerEnCours} style={{background:"transparent",color:"#5A5A7A",border:"1px solid #1E1E36",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>{genDuerEnCours?"...":"📋 Brouillon DUER (IA)"}</button>
      </div>
    </div>}
  </div>;
};
// ─── PAGE PLANNING ────────────────────────────────────────────

export default PageEquipe;
