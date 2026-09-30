"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel, SM, Tabs, St, conv, DEVISES } from "../lib/ui";

const PageWallet=({plan,showToast,profil,activeCompany,METHODES_PAY,Convertisseur,IbanMondial})=>{
  const[onglet,setOnglet]=useState("solde");
  const[devise,setDevise]=useState("EUR");
  const[histo,setHisto]=useState<any[]>([]);
  const[showPay,setShowPay]=useState(false);
  const[showEnc,setShowEnc]=useState(false);
  const[payForm,setPayForm]=useState({nom:"",montant:"",devise:"EUR",methode:"carte",ref:""});
  const[loadingWallet,setLoadingWallet]=useState(true);
  const[soldeReel,setSoldeReel]=useState(0);
  const[payUnified,setPayUnified]=useState({type:"",contact:"",contactEmail:"",contactTel:"",contactIban:"",montant:"",motif:"",methode:"sepa"});
  const[pipeline,setPipeline]=useState({montantFactures:0,nbFactures:0,montantDevis:0,nbDevis:0});

  const loadPipeline=async()=>{
    try{
      const[fRes,dRes]=await Promise.all([
        fetch('/api/factures?action=list').then(r=>r.json()).catch(()=>({})),
        fetch('/api/devis?action=list').then(r=>r.json()).catch(()=>({})),
      ]);
      const factures=fRes.factures||[];
      const devis=dRes.devis||[];
      const facturesEnAttente=factures.filter(f=>f.statut!=="payée"&&f.statut!=="annulée");
      const idsDevisFactures=new Set(factures.map(f=>f.devis_id).filter(Boolean));
      const devisSignesNonFactures=devis.filter(d=>d.statut==="signé"&&!idsDevisFactures.has(d.id));
      setPipeline({
        montantFactures:facturesEnAttente.reduce((a,f)=>a+Number(f.montant_ttc||0),0),
        nbFactures:facturesEnAttente.length,
        montantDevis:devisSignesNonFactures.reduce((a,d)=>a+Number(d.montant||0),0),
        nbDevis:devisSignesNonFactures.length,
      });
    }catch(e){console.error("Pipeline:",e);}
  };

  const TYPES_PAYER=[
    {id:"remboursement",label:"↩ Remboursement",color:C.red,desc:"Rembourser un client"},
    {id:"commission",label:"👥 Commission",color:C.orange,desc:"Payer une commission partenaire"},
    {id:"fournisseur",label:"🏭 Facture fournisseur",color:C.purple,desc:"Payer un fournisseur"},
    {id:"sortie",label:"🏦 Virement libre",color:C.blue,desc:"Virement à un membre de l'équipe"},
  ];
  const[equipeContacts,setEquipeContacts]=useState<any[]>([]);
  const EQUIPE_CONTACTS=equipeContacts;

  const loadEquipe=async()=>{
    try{
      const res=await fetch('/api/equipe');
      const d=await res.json();
      if(d.membres)setEquipeContacts(d.membres.map(m=>({nom:[m.prenom,m.nom].filter(Boolean).join(" ")||m.nom,email:m.email,tel:m.tel})));
    }catch(e){console.error("Equipe:",e);}
  };

  const loadWallet=async()=>{
    try{
      const companyParam=activeCompany?.id?`&company_id=${activeCompany.id}`:'';
      const res=await fetch('/api/wallet?action=list'+companyParam);
      const data=await res.json();
      if(data.transactions){
        setHisto(data.transactions.map(t=>({id:t.id,type:t.type,libelle:t.libelle,montant:Number(t.montant),devise:t.devise,methode:t.methode,date:new Date(t.created_at).toLocaleString("fr"),rawDate:t.created_at,statut:t.statut,ref:t.ref,com:Number(t.commission||0)})));
        setSoldeReel(data.solde||0);
      }
    }catch(e){console.error("Wallet:",e);}
    setLoadingWallet(false);
  };

  const loadParametres=async()=>{
    try{
      const res=await fetch('/api/wallet?action=parametres');
      const data=await res.json();
      if(typeof data.seuil_alerte==="number")setAlerteSeuil(data.seuil_alerte);
    }catch(e){console.error("Wallet parametres:",e);}
  };

  useEffect(()=>{loadWallet();loadEquipe();loadPipeline();loadParametres();loadObjectifs();},[activeCompany?.id]);
  const[virementForm,setVirementForm]=useState({iban:"",bic:"",nom:"",montant:"",devise:"EUR",motif:""});

  const handleVirementSepa=async()=>{
    if(!virementForm.iban||!virementForm.nom||!virementForm.montant)return showToast("⚠️ Renseignez IBAN, nom et montant");
    showToast("⏳ Enregistrement du virement...");
    try{
      const res=await fetch('/api/wallet',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'payer',nom:virementForm.nom,montant:virementForm.montant,devise:virementForm.devise,methode:"Virement SEPA",ref:virementForm.motif,type:'sortie',destinataire_iban:virementForm.iban,destinataire_bic:virementForm.bic}),
      });
      const data=await res.json();
      if(data.success){
        setVirementForm({iban:"",bic:"",nom:"",montant:"",devise:"EUR",motif:""});
        showToast("✅ Virement SEPA enregistré — marquez \"viré\" une fois exécuté");
        loadWallet();
      }else{showToast("❌ "+(data.error||"Erreur"));}
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const[alerteSeuil,setAlerteSeuil]=useState(500);
  const[seuilEnregistre,setSeuilEnregistre]=useState(true);
  const[enregistrementSeuilEnCours,setEnregistrementSeuilEnCours]=useState(false);
  const enregistrerSeuil=async()=>{
    setEnregistrementSeuilEnCours(true);
    try{
      const res=await fetch('/api/wallet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'definir_seuil',seuil:alerteSeuil})});
      const data=await res.json();
      if(data.success){showToast("✅ Seuil d'alerte enregistré");setSeuilEnregistre(true);}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
    setEnregistrementSeuilEnCours(false);
  };
  // Epargne automatique par objectif : voir app/api/wallet-objectifs et app/lib/walletObjectifs.ts.
  const[walletProjet,setWalletProjet]=useState<any[]>([]);
  const[showObjectifForm,setShowObjectifForm]=useState(false);
  const[objectifForm,setObjectifForm]=useState({nom:"",cible:"",pourcentage_allocation:""});
  const COULEURS_OBJECTIF=["gold","teal","blue","purple","green","orange","red","pink"];

  const loadObjectifs=async()=>{
    try{
      const res=await fetch('/api/wallet-objectifs');
      const data=await res.json();
      if(data.objectifs)setWalletProjet(data.objectifs);
    }catch(e){console.error("Objectifs:",e);}
  };

  const creerObjectif=async()=>{
    if(!objectifForm.nom||!objectifForm.cible||objectifForm.pourcentage_allocation==="")return showToast("⚠️ Nom, objectif et % d'allocation requis");
    try{
      const res=await fetch('/api/wallet-objectifs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        action:'creer',nom:objectifForm.nom,cible:objectifForm.cible,pourcentage_allocation:objectifForm.pourcentage_allocation,
        couleur:COULEURS_OBJECTIF[walletProjet.length%COULEURS_OBJECTIF.length],
      })});
      const data=await res.json();
      if(data.success){
        showToast("✅ Objectif créé");
        setObjectifForm({nom:"",cible:"",pourcentage_allocation:""});
        setShowObjectifForm(false);
        loadObjectifs();
      }else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const archiverObjectif=async(id)=>{
    try{
      const res=await fetch('/api/wallet-objectifs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'archiver',id})});
      const data=await res.json();
      if(data.success){showToast("✅ Objectif archivé");loadObjectifs();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };
  const solde=soldeReel;
  const soldeConv=conv(solde,"EUR",devise);
  const dvSel=DEVISES.find(d=>d.code===devise);
  const tabs=[{id:"solde",label:"💳 Solde"},{id:"historique",label:"📋 Historique"},{id:"payer",label:"⚡ Payer"},{id:"encaisser",label:"💰 Encaisser"},{id:"commissions",label:"👥 Commissions"},{id:"remboursements",label:"↩ Remboursements"},{id:"fournisseurs",label:"🏭 Fournisseurs"},{id:"convertisseur",label:"⇄ Convertir"},{id:"iban",label:"🌍 IBAN Mondial"},{id:"wallets_projets",label:"📂 Wallets Projets"},{id:"sante",label:"❤ Santé"},{id:"alertes",label:"🔔 Alertes"},{id:"stats",label:"📊 Stats"},{id:"virements",label:"🏦 Virements"}];

  const handlePayerUnifie=async()=>{
    const{type,contact,contactEmail,contactTel,contactIban,montant,motif,methode}=payUnified;
    if(!type)return showToast("⚠️ Choisis un type de transaction");
    if(type==="sortie"){
      if(!contact)return showToast("⚠️ Choisis un contact");
    }else{
      if(!contact)return showToast("⚠️ Indique le nom du bénéficiaire");
    }
    if(!montant)return showToast("⚠️ Indique un montant");
    let nom=contact,email=contactEmail,tel=contactTel,iban=contactIban;
    if(type==="sortie"){
      const eq=EQUIPE_CONTACTS.find(c=>c.nom===contact);
      if(!eq)return showToast("⚠️ Contact introuvable");
      nom=eq.nom;email=eq.email;tel=eq.tel;
    }
    showToast("⏳ Enregistrement de la transaction...");
    try{
      const body={action:'payer',nom,montant,devise:"EUR",methode:methode||"sepa",ref:motif,type};
      if(email)body.destinataire_email=email;
      if(tel)body.destinataire_tel=tel;
      if(iban)body.destinataire_iban=iban;
      const res=await fetch('/api/wallet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data=await res.json();
      if(data.success){
        setShowPay(false);
        setPayUnified({type:"",contact:"",contactEmail:"",contactTel:"",contactIban:"",montant:"",motif:"",methode:"sepa"});
        showToast(`✅ Transaction enregistrée pour ${nom} — à virer`);
        loadWallet();
      }else{showToast("❌ "+(data.error||"Erreur"));}
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const handlePayer=async(form)=>{
    if(!form.nom||!form.montant)return showToast("⚠️ Remplissez bénéficiaire et montant");
    showToast("⏳ Enregistrement du virement...");
    try{
      const res=await fetch('/api/wallet',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'payer',nom:form.nom,montant:form.montant,devise:form.devise,methode:form.methode,ref:form.ref,type:'sortie'}),
      });
      const data=await res.json();
      if(data.success){
        setShowPay(false);
        setPayForm({nom:"",montant:"",devise:"EUR",methode:"carte",ref:""});
        showToast("✅ Virement enregistré — à exécuter manuellement, marquez-le \"viré\" une fois fait");
        loadWallet();
      }else{showToast("❌ "+(data.error||"Erreur"));}
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const handleEncaisser=async(form)=>{
    if(!form.nom||!form.montant)return showToast("⚠️ Remplissez nom et montant");
    showToast("⏳ Création du lien de paiement...");
    try{
      const res=await fetch('/api/wallet',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'encaisser',nom:form.nom,montant:form.montant,devise:form.devise,methode:form.methode,ref:form.ref,email:form.email,tel:form.tel}),
      });
      const data=await res.json();
      if(data.success){
        setShowEnc(false);
        setPayForm({nom:"",montant:"",devise:"EUR",methode:"carte",ref:""});
        if(data.paymentUrl){
          showToast("✅ Lien de paiement créé et envoyé !");
        }else{
          // La vraie raison de l'echec Stripe est maintenant renvoyee (avant : toujours le meme message vague).
          showToast("⚠️ Encaissement enregistré, mais lien Stripe impossible : "+(data.erreurStripe||"raison inconnue"));
        }
        loadWallet();
      }else{showToast("❌ "+(data.error||"Erreur"));}
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const marquerVire=async(id)=>{
    try{
      const res=await fetch('/api/wallet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'marquer_vire',id})});
      const data=await res.json();
      // On n'affiche "marque comme vire" que si le serveur l'a vraiment fait (il refuse aux non-proprietaires et aux lignes deja traitees).
      if(data.success){showToast("✅ Marqué comme viré");}
      else if(res.status===403){showToast("❌ Réservé au propriétaire du compte ou à un administrateur");}
      else{showToast("❌ "+(data.error||"Erreur"));}
      loadWallet();
    }catch(e){showToast("❌ Erreur");}
  };

  return <div style={{padding:20}}>
    {showPay&&<div style={{position:"fixed",inset:0,background:"#000000AA",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <Card style={{width:480,maxWidth:"90vw",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>⚡ Nouveau paiement</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Choisis le type, le contact et le montant</div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Type de transaction *</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {TYPES_PAYER.map(t=><button key={t.id} onClick={()=>setPayUnified(p=>({...p,type:t.id,contact:""}))} style={{background:payUnified.type===t.id?`${t.color}22`:C.card2,border:`1px solid ${payUnified.type===t.id?t.color:C.border}`,borderRadius:8,padding:"10px 8px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
              <div style={{fontSize:12,fontWeight:700,color:payUnified.type===t.id?t.color:C.text}}>{t.label}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:2}}>{t.desc}</div>
            </button>)}
          </div>
        </div>
        {payUnified.type==="sortie"&&<div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Contact *</label>
          <Sel value={payUnified.contact} onChange={e=>setPayUnified(p=>({...p,contact:e.target.value}))} style={{width:"100%"}}>
            <option value="">— Sélectionner —</option>
            {EQUIPE_CONTACTS.map((c,i)=><option key={i} value={c.nom}>{c.nom}</option>)}
          </Sel>
        </div>}
        {payUnified.type&&payUnified.type!=="sortie"&&<div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Bénéficiaire *</label>
          <Inp value={payUnified.contact} onChange={e=>setPayUnified(p=>({...p,contact:e.target.value}))} placeholder="Nom du bénéficiaire" style={{marginBottom:8}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Inp value={payUnified.contactEmail} onChange={e=>setPayUnified(p=>({...p,contactEmail:e.target.value}))} placeholder="Email (optionnel)"/>
            <Inp value={payUnified.contactTel} onChange={e=>setPayUnified(p=>({...p,contactTel:e.target.value}))} placeholder="Téléphone (optionnel)"/>
          </div>
          {payUnified.type==="fournisseur"&&<Inp value={payUnified.contactIban} onChange={e=>setPayUnified(p=>({...p,contactIban:e.target.value}))} placeholder="IBAN (optionnel)" style={{marginTop:8}}/>}
        </div>}
        {payUnified.type&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant (€) *</label><Inp value={payUnified.montant} onChange={e=>setPayUnified(p=>({...p,montant:e.target.value}))} placeholder="0.00"/></div>
            <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Méthode</label><Sel value={payUnified.methode} onChange={e=>setPayUnified(p=>({...p,methode:e.target.value}))} style={{width:"100%"}}>{METHODES_PAY.map(m=><option key={m.id} value={m.id}>{m.icon} {m.nom}</option>)}</Sel></div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Motif</label>
            <Inp value={payUnified.motif} onChange={e=>setPayUnified(p=>({...p,motif:e.target.value}))} placeholder="Ex: Remboursement service annulé"/>
          </div>
        </>}
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={handlePayerUnifie} style={{flex:1}}>✅ Créer la transaction</Btn>
          <BtnGhost onClick={()=>{setShowPay(false);setPayUnified({type:"",contact:"",montant:"",motif:"",methode:"sepa"});}}>Annuler</BtnGhost>
        </div>
      </Card>
    </div>}

    <div style={{marginBottom:16}}><Tabs tabs={tabs} active={onglet} onChange={setOnglet}/></div>
    {onglet==="solde"&&<>
      <div style={{background:`linear-gradient(135deg,${C.card},#0A1A14)`,border:`1px solid ${C.teal}44`,borderRadius:16,padding:24,marginBottom:16}}>
        <div style={{fontSize:10,color:C.teal,letterSpacing:"0.2em",marginBottom:8}}>SOLDE WALLET XYRA · FLUTTERWAVE + STRIPE</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:12,marginBottom:8}}>
          <div style={{fontSize:44,fontWeight:700,color:C.text,fontFamily:"Georgia,serif"}}>{fmt(soldeConv,devise)}</div>
          <Sel value={devise} onChange={e=>setDevise(e.target.value)} style={{marginBottom:6}}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
        </div>
        {devise!=="EUR"&&<div style={{fontSize:11,color:C.muted,marginBottom:4}}>{fmt(solde,"EUR")} · Taux de référence</div>}
        <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Solde net et disponible — la commission Xyra (5%) et les paiements déjà créés (« à virer », même pas encore exécutés à la banque) sont retirés.</div>
        <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:16}}>
          <div style={{borderLeft:`2px solid ${C.green}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Encaissé ce mois</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(conv(histo.filter(h=>h.type==="entree"&&h.statut==="confirmé"&&new Date(h.rawDate).getMonth()===new Date().getMonth()&&new Date(h.rawDate).getFullYear()===new Date().getFullYear()).reduce((a,h)=>a+h.montant,0),"EUR",devise),devise)}</div></div>
          <div style={{borderLeft:`2px solid ${C.red}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>Décaissé ce mois</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>{fmt(conv(histo.filter(h=>h.type!=="entree"&&h.statut==="viré"&&new Date(h.rawDate).getMonth()===new Date().getMonth()&&new Date(h.rawDate).getFullYear()===new Date().getFullYear()).reduce((a,h)=>a+h.montant,0),"EUR",devise),devise)}</div></div>
          <div style={{borderLeft:`2px solid ${C.orange}`,paddingLeft:12}}><div style={{fontSize:9,color:C.muted}}>En attente</div><div style={{fontSize:18,fontWeight:700,color:C.orange}}>{fmt(conv(histo.filter(h=>h.statut==="à_virer").reduce((a,h)=>a+h.montant,0),"EUR",devise),devise)}</div></div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={()=>setShowPay(true)}>⚡ Payer</Btn><Btn onClick={()=>setOnglet("encaisser")} style={{background:C.green,color:"#000"}}>📲 Encaisser</Btn></div>
      </div>
      {(pipeline.montantFactures>0||pipeline.montantDevis>0)&&<div style={{background:`${C.gold}0D`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:14,marginBottom:16,fontSize:11,color:C.text}}>
        <div style={{fontWeight:700,color:C.gold,marginBottom:4}}>🔮 Ce n'est pas encore dans ce solde, mais ça arrive</div>
        {pipeline.montantFactures>0&&<div>{fmt(pipeline.montantFactures)} de factures emises en attente de paiement ({pipeline.nbFactures})</div>}
        {pipeline.montantDevis>0&&<div>{fmt(pipeline.montantDevis)} de devis signes pas encore factures ({pipeline.nbDevis})</div>}
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <KPI label="Transactions" val={histo.length} color={C.blue}/>
        <KPI label="Commissions dues" val={fmt(histo.filter(h=>h.type==="commission"&&h.statut==="à_virer").reduce((a,h)=>a+h.montant,0))} color={C.orange}/>
        <KPI label="Remboursements" val={fmt(histo.filter(h=>h.type==="remboursement"&&h.statut==="à_virer").reduce((a,h)=>a+h.montant,0))} color={C.red}/>
        <KPI label="Fournisseurs" val={fmt(histo.filter(h=>h.type==="fournisseur"&&h.statut==="à_virer").reduce((a,h)=>a+h.montant,0))} color={C.purple}/>
      </div>
      {/* Pas d'alerte tant qu'il n'y a aucune transaction : un nouveau client ne doit pas voir une fausse alarme. */}
      {histo.length>0&&<div style={{background:solde<alerteSeuil?`${C.red}11`:`${C.green}08`,border:`1px solid ${solde<alerteSeuil?C.red:C.green}33`,borderRadius:10,padding:12,fontSize:12,color:solde<alerteSeuil?C.red:C.green}}>{solde<alerteSeuil?`⚠️ Alerte : solde < seuil (${fmt(alerteSeuil)})`:`✅ Solde en bonne santé (seuil: ${fmt(alerteSeuil)})`}</div>}
    </>}
    {onglet==="historique"&&<Card><STitle>📋 Historique des transactions</STitle>
      {loadingWallet&&<div style={{fontSize:11,color:C.muted,marginBottom:8}}>Chargement...</div>}
      {!loadingWallet&&histo.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:20}}>Aucune transaction pour le moment</div>}
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Date</TH><TH>Libellé</TH><TH>Montant</TH><TH>Méthode</TH><TH>Statut</TH><TH>Commission 5%</TH><TH>Action</TH></tr></thead>
        <tbody>{histo.map((h,i)=><tr key={i}>
          <Td style={{color:C.muted,fontSize:10}}>{h.date}</Td>
          <Td style={{fontWeight:600}}>{h.libelle}</Td>
          <Td style={{color:h.type==="entree"?C.green:C.red,fontWeight:700}}>{h.type==="entree"?"+":"-"}{fmt(h.montant,h.devise)}</Td>
          <Td><Pill color={C.blue}>{h.methode}</Pill></Td>
          <Td><St s={h.statut}/></Td>
          <Td style={{color:C.gold}}>{h.com>0?`+${fmt(h.com,h.devise)}`:"—"}</Td>
          <Td>{h.statut==="à_virer"&&<Btn onClick={()=>marquerVire(h.id)} style={{padding:"3px 8px",fontSize:10}}>✅ Marquer viré</Btn>}</Td>
        </tr>)}</tbody>
      </table>
    </Card>}
    {onglet==="payer"&&<div style={{maxWidth:500}}><Card><STitle>⚡ Effectuer un paiement</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Bénéficiaire *</label><Inp value={payForm.nom} onChange={e=>setPayForm(f=>({...f,nom:e.target.value}))} placeholder="Nom ou raison sociale"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant *</label><Inp value={payForm.montant} onChange={e=>setPayForm(f=>({...f,montant:e.target.value}))} placeholder="0.00"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise</label><Sel value={payForm.devise} onChange={e=>setPayForm(f=>({...f,devise:e.target.value}))} style={{width:"100%"}}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel></div>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Méthode</label><Sel value={payForm.methode} onChange={e=>setPayForm(f=>({...f,methode:e.target.value}))} style={{width:"100%"}}>{METHODES_PAY.map(m=><option key={m.id} value={m.id}>{m.icon} {m.nom} — {m.zone}</option>)}</Sel></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Référence</label><Inp value={payForm.ref} onChange={e=>setPayForm(f=>({...f,ref:e.target.value}))} placeholder="Ex: COM-001"/></div>
        <Btn onClick={()=>handlePayer(payForm)} style={{marginTop:4}}>⚡ Envoyer le paiement</Btn>
      </div>
    </Card></div>}
    {onglet==="encaisser"&&<div style={{maxWidth:500}}><Card><STitle>💰 Encaisser un paiement</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Payeur *</label><Inp value={payForm.nom} onChange={e=>setPayForm(f=>({...f,nom:e.target.value}))} placeholder="Nom du client"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Montant *</label><Inp value={payForm.montant} onChange={e=>setPayForm(f=>({...f,montant:e.target.value}))} placeholder="0.00"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Devise</label><Sel value={payForm.devise} onChange={e=>setPayForm(f=>({...f,devise:e.target.value}))} style={{width:"100%"}}>{DEVISES.map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel></div>
        </div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Méthode d'encaissement</label><Sel value={payForm.methode} onChange={e=>setPayForm(f=>({...f,methode:e.target.value}))} style={{width:"100%"}}>{METHODES_PAY.map(m=><option key={m.id} value={m.id}>{m.icon} {m.nom} — {m.zone}</option>)}</Sel></div>
        <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Référence devis</label><Inp value={payForm.ref} onChange={e=>setPayForm(f=>({...f,ref:e.target.value}))} placeholder="Ex: TYM-0044"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Email client</label><Inp value={payForm.email||""} onChange={e=>setPayForm(f=>({...f,email:e.target.value}))} placeholder="client@email.com"/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Téléphone client</label><Inp value={payForm.tel||""} onChange={e=>setPayForm(f=>({...f,tel:e.target.value}))} placeholder="+33612345678"/></div>
        </div>
        <div style={{fontSize:10,color:C.muted}}>Renseignez email et/ou téléphone pour envoyer le lien de paiement automatiquement</div>
        {payForm.montant&&<div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:10,fontSize:11,color:C.green}}>Commission Xyra 5% : {fmt(Number(payForm.montant)*0.05,payForm.devise)}</div>}
        <Btn onClick={()=>handleEncaisser(payForm)} style={{background:C.green,color:"#000",marginTop:4}}>💰 Encaisser</Btn>
      </div>
    </Card></div>}
    {onglet==="commissions"&&<Card><STitle>👥 Commissions à virer</STitle>
      {histo.filter(h=>h.type==="commission"&&h.statut==="à_virer").length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucune commission en attente.</div>}
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><TH>Date</TH><TH>Bénéficiaire</TH><TH>Montant</TH><TH>Méthode</TH><TH>Action</TH></tr></thead>
        <tbody>{histo.filter(h=>h.type==="commission"&&h.statut==="à_virer").map((h,i)=><tr key={h.id}>
          <Td style={{color:C.muted,fontSize:10}}>{h.date}</Td>
          <Td style={{fontWeight:600}}>{h.libelle}</Td>
          <Td style={{color:C.orange,fontWeight:700}}>{fmt(h.montant,h.devise)}</Td>
          <Td>{h.methode}</Td>
          <Td><Btn onClick={()=>marquerVire(h.id)} style={{padding:"4px 10px",fontSize:11}}>✅ Marquer viré</Btn></Td>
        </tr>)}</tbody>
      </table>
      <div style={{marginTop:12,padding:"10px 14px",background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:8,fontSize:12,color:C.orange}}>Total à virer : {fmt(histo.filter(h=>h.type==="commission"&&h.statut==="à_virer").reduce((a,h)=>a+h.montant,0))}</div>
    </Card>}
    {onglet==="remboursements"&&<Card><STitle>↩ Remboursements en attente</STitle>
      {histo.filter(h=>h.type==="remboursement"&&h.statut==="à_virer").length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun remboursement en attente.</div>}
      {histo.filter(h=>h.type==="remboursement"&&h.statut==="à_virer").map((h,i)=><div key={h.id} style={{background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:12,fontWeight:600}}>{h.libelle}</div><div style={{fontSize:10,color:C.muted}}>{h.date} · {h.methode}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:700,color:C.red}}>{fmt(h.montant,h.devise)}</div><Btn onClick={()=>marquerVire(h.id)} style={{padding:"4px 10px",fontSize:11,marginTop:6}}>✅ Marquer viré</Btn></div>
      </div>)}
    </Card>}
    {onglet==="fournisseurs"&&<Card><STitle>🏭 Paiements fournisseurs en attente</STitle>
      {histo.filter(h=>h.type==="fournisseur"&&h.statut==="à_virer").length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:16}}>Aucun paiement fournisseur en attente.</div>}
      {histo.filter(h=>h.type==="fournisseur"&&h.statut==="à_virer").map((h,i)=><div key={h.id} style={{background:C.card2,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:12,fontWeight:600}}>{h.libelle}</div><div style={{fontSize:10,color:C.muted}}>{h.date} · {h.methode}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:700,color:C.purple}}>{fmt(h.montant,h.devise)}</div><Btn onClick={()=>marquerVire(h.id)} style={{padding:"4px 10px",fontSize:11,marginTop:6,background:C.purple}}>✅ Marquer viré</Btn></div>
      </div>)}
    </Card>}
    {onglet==="convertisseur"&&<div style={{maxWidth:500}}><Convertisseur/></div>}
    {onglet==="iban"&&<div style={{maxWidth:600}}><IbanMondial showToast={showToast}/></div>}
    {onglet==="wallets_projets"&&<Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <STitle>📂 Wallets Projets</STitle>
        <Btn onClick={()=>setShowObjectifForm(s=>!s)} style={{fontSize:11,padding:"5px 12px"}}>+ Nouvel objectif</Btn>
      </div>
      <div style={{fontSize:11,color:C.muted,marginBottom:14}}>À chaque vraie entrée d'argent confirmée dans le Wallet, le % défini est automatiquement mis de côté pour l'objectif — un suivi honnête, pas un vrai transfert : le solde disponible du Wallet n'est jamais réduit par ceci.</div>
      {showObjectifForm&&<div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:14,border:`1px solid ${C.border}`}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,marginBottom:8}}>
          <Inp value={objectifForm.nom} onChange={e=>setObjectifForm(f=>({...f,nom:e.target.value}))} placeholder="Nom (ex: Fonds d'urgence)"/>
          <Inp type="number" value={objectifForm.cible} onChange={e=>setObjectifForm(f=>({...f,cible:e.target.value}))} placeholder="Objectif (€)"/>
          <Inp type="number" value={objectifForm.pourcentage_allocation} onChange={e=>setObjectifForm(f=>({...f,pourcentage_allocation:e.target.value}))} placeholder="% de chaque entrée"/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={creerObjectif}>✅ Créer</Btn>
          <BtnGhost onClick={()=>setShowObjectifForm(false)}>Annuler</BtnGhost>
        </div>
      </div>}
      {walletProjet.map((w,i)=><div key={w.id||i} style={{background:C.card2,borderRadius:10,padding:14,marginBottom:10,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{w.nom}<span style={{fontSize:10,color:C.muted,fontWeight:400}}> · {w.pourcentage_allocation}% de chaque entrée</span></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Pill color={w.couleur}>{Math.round(Math.min(100,w.solde/w.cible*100))}%</Pill>
            <BtnGhost onClick={()=>archiverObjectif(w.id)} style={{fontSize:9,padding:"2px 8px",color:C.red}}>Archiver</BtnGhost>
          </div>
        </div>
        <div style={{fontSize:20,fontWeight:700,color:w.couleur,marginBottom:6}}>{fmt(w.solde)}<span style={{fontSize:11,color:C.muted}}> / {fmt(w.cible)}</span></div>
        <SM val={w.solde} max={w.cible} color={w.couleur}/>
      </div>)}
      {walletProjet.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"24px 0"}}>Aucun objectif pour l'instant.</div>}
    </Card>}
    {onglet==="sante"&&<Card><STitle>❤ Score Santé Financière</STitle>
      {/* Les scores 76 / 85 / 72 / 68 etaient ecrits en dur, sans aucun calcul : ils sont retires tant qu'aucune formule reelle n'existe. */}
      <div style={{textAlign:"center",padding:"30px 0"}}><div style={{fontSize:14,color:C.muted}}>Le score de santé financière n'est pas encore disponible.</div></div>
    </Card>}
    {onglet==="alertes"&&<Card><STitle>🔔 Configuration Alertes</STitle>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>Seuil d'alerte solde bas</div><div style={{fontSize:10,color:C.muted}}>Affiche un avertissement dans l'onglet Solde quand le solde passe sous le seuil. Aucune notification n'est envoyée : l'alerte n'est visible que sur cette page.</div></div>
        <Inp value={alerteSeuil} onChange={e=>{setAlerteSeuil(Number(e.target.value));setSeuilEnregistre(false);}} style={{width:120}}/>
        <Btn onClick={enregistrerSeuil} disabled={enregistrementSeuilEnCours||seuilEnregistre} style={{fontSize:11,padding:"6px 12px"}}>{enregistrementSeuilEnCours?"Enregistrement...":seuilEnregistre?"✅ Enregistré":"💾 Enregistrer"}</Btn>
      </div>
      <div style={{marginTop:12,fontSize:11,color:C.muted}}>Seuil actuel : {fmt(alerteSeuil)} · Solde actuel : {fmt(solde)} · Statut : {solde>=alerteSeuil?"✅ OK":"⚠️ Alerte active"}</div>
    </Card>}
    {onglet==="stats"&&<Card><STitle>📊 Statistiques Wallet</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        <CT><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Total encaissé</div><div style={{fontSize:18,fontWeight:700,color:C.green}}>{fmt(histo.filter(h=>h.type==="entree"&&h.statut==="confirmé").reduce((a,h)=>a+h.montant,0))}</div></CT>
        <CT><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Total décaissé</div><div style={{fontSize:18,fontWeight:700,color:C.red}}>{fmt(histo.filter(h=>h.type!=="entree"&&h.statut==="viré").reduce((a,h)=>a+h.montant,0))}</div></CT>
        <CT><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Commission Xyra retenue (5%)</div><div style={{fontSize:18,fontWeight:700,color:C.gold}}>{fmt(histo.filter(h=>h.type==="entree"&&h.statut==="confirmé").reduce((a,h)=>a+h.com,0))}</div></CT>
        <CT><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Transactions</div><div style={{fontSize:18,fontWeight:700,color:C.blue}}>{histo.length}</div></CT>
      </div>
    </Card>}
    {onglet==="virements"&&<Card><STitle>🏦 Virements bancaires SEPA</STitle>
      <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Le virement est enregistré dans Xyra puis à exécuter toi-même depuis ta banque (Swan automatisera cette étape une fois validé).</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:480}}>
        <Inp value={virementForm.iban} onChange={e=>setVirementForm(f=>({...f,iban:e.target.value}))} placeholder="IBAN bénéficiaire (FR76...)"/>
        <Inp value={virementForm.bic} onChange={e=>setVirementForm(f=>({...f,bic:e.target.value}))} placeholder="BIC/SWIFT"/>
        <Inp value={virementForm.nom} onChange={e=>setVirementForm(f=>({...f,nom:e.target.value}))} placeholder="Nom du bénéficiaire"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Inp value={virementForm.montant} onChange={e=>setVirementForm(f=>({...f,montant:e.target.value}))} placeholder="Montant (€)"/>
          <Sel value={virementForm.devise} onChange={e=>setVirementForm(f=>({...f,devise:e.target.value}))} style={{width:"100%"}}>{DEVISES.filter(d=>["EUR","GBP","CHF"].includes(d.code)).map(d=><option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}</Sel>
        </div>
        <Inp value={virementForm.motif} onChange={e=>setVirementForm(f=>({...f,motif:e.target.value}))} placeholder="Motif du virement"/>
        <Btn onClick={handleVirementSepa}>🏦 Initier le virement SEPA</Btn>
      </div>
    </Card>}
  </div>;
};

// ─── PAGE CARTES ──────────────────────────────────────────────

export default PageWallet;
