"use client";
import { useState, useEffect } from "react";
import { C, Card, Btn, BtnGhost, Pill, Inp, Sel } from "../lib/ui";

const PageChat=({plan,showToast,Chat})=>{
  const[espace,setEspace]=useState("equipe");
  const[convs,setConvs]=useState([]);
  const[loadingConvs,setLoadingConvs]=useState(true);
  const[selConv,setSelConv]=useState(null);
  const[msgInput,setMsgInput]=useState("");
  const[showNewConv,setShowNewConv]=useState(false);
  const[newConvForm,setNewConvForm]=useState({contact_nom:"",contact_type:"client",contact_tel:"",contact_email:"",premier_contact:true});
  const[suggestion,setSuggestion]=useState("");
  const[suggestionLoading,setSuggestionLoading]=useState(false);
  const[resume,setResume]=useState("");
  const[resumeLoading,setResumeLoading]=useState(false);
  const[swipingId,setSwipingId]=useState(null);
  const[dragX,setDragX]=useState(0);
  const dragStartX=useRef(0);
  const fileRef=useRef(null);
  const audioRef=useRef(null);
  const[recording,setRecording]=useState(false);
  const endRef=useRef();

  const espaces=[{id:"equipe",label:"👥 Équipe"},{id:"externe",label:"💬 Clients & Partenaires"},{id:"visio",label:"🎥 Visio Jitsi"}];

  const loadConvs=async()=>{
    try{
      const res=await fetch(`/api/chat?espace=${espace==="visio"?"externe":espace}`);
      const data=await res.json();
      if(data.conversations)setConvs(data.conversations);
    }catch(e){console.error("Chat:",e);}
    setLoadingConvs(false);
  };
  useEffect(()=>{if(espace!=="visio"){setLoadingConvs(true);setSelConv(null);loadConvs();}},[espace]);
  useEffect(()=>{const i=setInterval(()=>{if(espace!=="visio")loadConvs();},15000);return()=>clearInterval(i);},[espace]);
  useEffect(()=>{if(selConv)setSelConv(c=>convs.find(x=>x.id===c.id)||null);},[convs]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[selConv?.messages?.length]);

  // Vérifie l'inactivité 1h toutes les 5 minutes
  useEffect(()=>{
    const check=()=>{fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verifier_inactivite'})}).catch(()=>{});};
    const i=setInterval(check,5*60*1000);
    return()=>clearInterval(i);
  },[]);

  const creerConversation=async()=>{
    if(!newConvForm.contact_nom)return showToast("⚠️ Nom du contact requis");
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_conversation',espace,...newConvForm})});
      const data=await res.json();
      if(data.success){showToast(`✅ Conversation créée avec ${newConvForm.contact_nom}`+(newConvForm.premier_contact?" — message de bienvenue envoyé":""));setShowNewConv(false);setNewConvForm({contact_nom:"",contact_type:"client",contact_tel:"",contact_email:"",premier_contact:true});loadConvs();}
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const envoyerMsg=async()=>{
    if(!msgInput.trim()||!selConv)return;
    const texte=msgInput;setMsgInput("");setSuggestion("");
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_message',conversation_id:selConv.id,contenu:texte,contact_tel:selConv.contact_tel})});
      const data=await res.json();
      if(data.success)loadConvs();
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur de connexion");}
  };

  const demanderSuggestion=async()=>{
    if(!selConv?.messages?.length)return showToast("⚠️ Aucun historique pour suggérer une réponse");
    setSuggestionLoading(true);
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'suggestion_reponse',conversation_id:selConv.id,derniers_messages:selConv.messages.slice(-8)})});
      const data=await res.json();
      if(data.success)setSuggestion(data.suggestion);
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
    setSuggestionLoading(false);
  };

  const demanderResume=async()=>{
    if(!selConv?.messages?.length)return showToast("⚠️ Conversation vide");
    setResumeLoading(true);
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'resume_conversation',messages:selConv.messages})});
      const data=await res.json();
      if(data.success)setResume(data.resume);
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
    setResumeLoading(false);
  };

  const creerActionDepuis=async(type)=>{
    if(!selConv)return;
    showToast(`⏳ Création ${type}...`);
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'creer_action',type,conversation_id:selConv.id,contact_nom:selConv.contact_nom,contact_email:selConv.contact_email,contact_tel:selConv.contact_tel})});
      const data=await res.json();
      if(data.success)showToast(`✅ ${type==='deal'?'Deal':'Devis'} créé pour ${selConv.contact_nom}`);
      else showToast("❌ "+(data.error||"Erreur"));
    }catch(e){showToast("❌ Erreur");}
  };

  const supprimerConv=async(id)=>{
    try{
      await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'supprimer_conversation',id})});
      setConvs(cs=>cs.filter(c=>c.id!==id));
      if(selConv?.id===id)setSelConv(null);
      showToast("🗑 Conversation supprimée");
    }catch(e){showToast("❌ Erreur");}
  };

  const handleFile=async(e)=>{
    const file=e.target.files?.[0];
    if(!file||!selConv)return;
    showToast("⏳ Envoi du fichier...");
    try{
      const reader=new FileReader();
      reader.onload=async()=>{
        try{
          const{createClient}=await import('@supabase/supabase-js');
          const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
          const path=`chat/${selConv.id}/${Date.now()}_${file.name}`;
          const{data:upData,error:upErr}=await sb.storage.from('attachments').upload(path,file);
          if(upErr){showToast("❌ Échec de l'envoi — vérifie que le bucket 'attachments' existe");return;}
          const{data:urlData}=sb.storage.from('attachments').getPublicUrl(path);
          await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_message',conversation_id:selConv.id,contenu:"📎 "+file.name,type:file.type.startsWith("image/")?"image":"fichier",fichier_url:urlData.publicUrl})});
          loadConvs();showToast("✅ Fichier envoyé");
        }catch(e2){showToast("❌ Erreur d'envoi");}
      };
      reader.readAsArrayBuffer(file);
    }catch(e){showToast("❌ Erreur");}
    e.target.value="";
  };

  const startRecording=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const recorder=new MediaRecorder(stream);
      const chunks=[];
      recorder.ondataavailable=ev=>chunks.push(ev.data);
      recorder.onstop=async()=>{
        const blob=new Blob(chunks,{type:"audio/webm"});
        if(!selConv)return;
        showToast("⏳ Envoi du message vocal...");
        try{
          const{createClient}=await import('@supabase/supabase-js');
          const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
          const path=`chat/${selConv.id}/${Date.now()}_vocal.webm`;
          const{error:upErr}=await sb.storage.from('attachments').upload(path,blob);
          if(upErr){showToast("❌ Échec — vérifie le bucket 'attachments'");return;}
          const{data:urlData}=sb.storage.from('attachments').getPublicUrl(path);
          await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'envoyer_message',conversation_id:selConv.id,contenu:"🎤 Message vocal",type:"audio",fichier_url:urlData.publicUrl})});
          loadConvs();showToast("✅ Message vocal envoyé");
        }catch(e){showToast("❌ Erreur d'envoi");}
        stream.getTracks().forEach(t=>t.stop());
      };
      recorder.start();audioRef.current=recorder;setRecording(true);
    }catch(e){showToast("⚠️ Micro non accessible");}
  };
  const stopRecording=()=>{audioRef.current?.stop();setRecording(false);};

  const catColor={nouveau_lead:C.orange,suivi:C.blue,vip:C.gold,cloture:C.muted};
  const catLabel={nouveau_lead:"🆕 Nouveau lead",suivi:"💬 Suivi",vip:"⭐ VIP",cloture:"✅ Clôturé"};

  // Swipe handlers pour la liste de conversations
  const onSwipeStart=(id,x)=>{setSwipingId(id);dragStartX.current=x;setDragX(0);};
  const onSwipeMove=(id,x)=>{if(swipingId!==id)return;setDragX(Math.max(-72,Math.min(0,x-dragStartX.current)));};
  const onSwipeEnd=(id)=>{if(dragX<-36){setDragX(-72);}else{setDragX(0);setSwipingId(null);}};

  return <div style={{padding:20}}>
    <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:"Georgia,serif",marginBottom:4}}>💬 Chat</div>
    <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Équipe interne · Clients & Partenaires · Visio Jitsi · IA quand tu es absent</div>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{espaces.map(e=><button key={e.id} onClick={()=>setEspace(e.id)} style={{background:espace===e.id?C.card:C.card2,color:espace===e.id?C.gold:C.muted,border:`1px solid ${espace===e.id?C.gold+"44":C.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{e.label}</button>)}</div>

    {/* ── VISIO ── */}
    {espace==="visio"&&<Card style={{height:460,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:48}}>🎥</div>
      <div style={{fontSize:14,fontWeight:700,color:C.text}}>Visioconférence Jitsi</div>
      <div style={{fontSize:11,color:C.muted}}>Crée une salle pour une réunion d'équipe ou avec un client/partenaire</div>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={()=>{const room=`xyra-${Date.now().toString(36)}`;window.open(`https://meet.jit.si/${room}`,"_blank");showToast("🎥 Salle Jitsi ouverte dans un nouvel onglet");}}>🎥 Nouvelle salle</Btn>
        <BtnGhost onClick={()=>{const room=`xyra-${Date.now().toString(36)}`;navigator.clipboard?.writeText(`https://meet.jit.si/${room}`);showToast("📋 Lien copié — partage-le pour inviter quelqu'un");}}>📋 Copier un lien à partager</BtnGhost>
      </div>
      {convs.length>0&&<div style={{marginTop:10,width:"100%",maxWidth:400}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:6,textAlign:"center"}}>Ou rejoindre la salle dédiée d'une conversation existante</div>
        {convs.filter(c=>c.jitsi_room).slice(0,5).map(c=><div key={c.id} onClick={()=>window.open(`https://meet.jit.si/${c.jitsi_room}`,"_blank")} style={{background:C.card2,borderRadius:8,padding:"8px 12px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",fontSize:11}}>
          <span>{c.contact_nom}</span><span style={{color:C.gold}}>Rejoindre →</span>
        </div>)}
      </div>}
    </Card>}

    {/* ── ÉQUIPE / EXTERNE ── */}
    {espace!=="visio"&&<div style={{display:"grid",gridTemplateColumns:selConv?"260px 1fr":"1fr",gap:12}}>
      <Card style={{padding:0,overflow:"hidden",height:520}}>
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:700,color:C.muted}}>{espace==="equipe"?"ÉQUIPE":"CLIENTS & PARTENAIRES"}</span>
          <button onClick={()=>setShowNewConv(s=>!s)} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:16}}>+</button>
        </div>
        {showNewConv&&<div style={{padding:10,borderBottom:`1px solid ${C.border}`,background:C.card2}}>
          <Inp value={newConvForm.contact_nom} onChange={e=>setNewConvForm(f=>({...f,contact_nom:e.target.value}))} placeholder="Nom du contact" style={{marginBottom:6,fontSize:11}}/>
          {espace==="externe"&&<Sel value={newConvForm.contact_type} onChange={e=>setNewConvForm(f=>({...f,contact_type:e.target.value}))} style={{width:"100%",marginBottom:6,fontSize:11}}>
            <option value="client">Client</option><option value="lead">Nouveau lead</option><option value="partenaire">Partenaire</option><option value="fournisseur">Fournisseur</option>
          </Sel>}
          <Inp value={newConvForm.contact_tel} onChange={e=>setNewConvForm(f=>({...f,contact_tel:e.target.value}))} placeholder="Téléphone WhatsApp" style={{marginBottom:6,fontSize:11}}/>
          <Inp value={newConvForm.contact_email} onChange={e=>setNewConvForm(f=>({...f,contact_email:e.target.value}))} placeholder="Email (optionnel)" style={{marginBottom:6,fontSize:11}}/>
          {(newConvForm.contact_type==="client"||newConvForm.contact_type==="lead")&&<label style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:C.muted,marginBottom:8,cursor:"pointer"}}><input type="checkbox" checked={newConvForm.premier_contact} onChange={e=>setNewConvForm(f=>({...f,premier_contact:e.target.checked}))}/>Envoyer le message de bienvenue automatique</label>}
          <div style={{display:"flex",gap:6}}><Btn onClick={creerConversation} style={{fontSize:10,padding:"5px 10px"}}>Créer</Btn><BtnGhost onClick={()=>setShowNewConv(false)} style={{fontSize:10,padding:"5px 10px"}}>Annuler</BtnGhost></div>
        </div>}
        <div style={{overflowY:"auto",height:"calc(100% - 44px)"}}>
          {loadingConvs&&<div style={{padding:14,fontSize:11,color:C.muted}}>Chargement...</div>}
          {!loadingConvs&&convs.length===0&&<div style={{padding:14,fontSize:11,color:C.muted,textAlign:"center"}}>Aucune conversation. Clique sur + pour commencer.</div>}
          {convs.map(c=><div key={c.id} style={{position:"relative",overflow:"hidden"}}>
            <div onClick={()=>supprimerConv(c.id)} style={{position:"absolute",top:0,right:0,bottom:0,width:72,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:10,fontWeight:700}}>🗑 Suppr.</div>
            <div
              onClick={()=>{if(swipingId===c.id&&dragX!==0)return;setSelConv(c);if(c.id)fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'marquer_lu',conversation_id:c.id})}).then(loadConvs);}}
              onTouchStart={e=>onSwipeStart(c.id,e.touches[0].clientX)}
              onTouchMove={e=>onSwipeMove(c.id,e.touches[0].clientX)}
              onTouchEnd={()=>onSwipeEnd(c.id)}
              onMouseDown={e=>onSwipeStart(c.id,e.clientX)}
              onMouseMove={e=>{if(swipingId===c.id)onSwipeMove(c.id,e.clientX);}}
              onMouseUp={()=>onSwipeEnd(c.id)}
              onMouseLeave={()=>{if(swipingId===c.id)onSwipeEnd(c.id);}}
              style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"grab",background:selConv?.id===c.id?`${C.gold}0D`:C.card,borderBottom:`1px solid ${C.border}22`,transform:`translateX(${swipingId===c.id?dragX:0}px)`,transition:swipingId===c.id?"none":"transform .2s"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.blue,flexShrink:0}}>{c.contact_nom?.[0]||"?"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:c.nonLus>0?700:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.contact_nom}</div>
                <div style={{fontSize:9,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.dernierMsg?.contenu||"Aucun message"}</div>
              </div>
              {c.nonLus>0&&<span style={{background:C.red,color:"#fff",borderRadius:20,padding:"0 5px",fontSize:9,fontWeight:700,flexShrink:0}}>{c.nonLus}</span>}
            </div>
          </div>)}
        </div>
      </Card>

      {selConv?<Card style={{padding:0,overflow:"hidden",height:520,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.card2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{selConv.contact_nom}</div>
            <div style={{fontSize:10,color:C.muted,display:"flex",gap:6,alignItems:"center"}}>{selConv.contact_type||"équipe"}{selConv.categorie&&<Pill color={catColor[selConv.categorie]}>{catLabel[selConv.categorie]}</Pill>}</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>window.open(`https://meet.jit.si/${selConv.jitsi_room||"xyra-"+selConv.id}`,"_blank")} title="Lancer une visio" style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",cursor:"pointer",color:C.green,fontSize:12}}>🎥</button>
            <button onClick={demanderResume} title="Résumer la conversation" style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",cursor:"pointer",color:C.purple,fontSize:12}}>{resumeLoading?"⏳":"📝"}</button>
          </div>
        </div>
        {resume&&<div style={{background:`${C.purple}11`,borderBottom:`1px solid ${C.purple}33`,padding:10,fontSize:11,color:C.text,lineHeight:1.6}}>🤖 <b>Résumé :</b> {resume} <span onClick={()=>setResume("")} style={{cursor:"pointer",color:C.muted,marginLeft:6}}>✕</span></div>}
        <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
          {(selConv.messages||[]).map((m,i)=><div key={m.id||i} style={{display:"flex",gap:8,flexDirection:m.moi?"row-reverse":"row"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:m.moi?`${C.gold}22`:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:m.moi?C.gold:C.blue,flexShrink:0}}>{m.moi?(m.type==="auto_ia"?"🤖":"C"):selConv.contact_nom?.[0]}</div>
            <div style={{maxWidth:"70%"}}>
              <div style={{background:m.moi?(m.type==="auto_ia"?`${C.purple}18`:`${C.gold}18`):C.card2,border:`1px solid ${m.moi?(m.type==="auto_ia"?C.purple+"33":C.gold+"33"):C.border}`,borderRadius:10,padding:"8px 12px"}}>
                {m.type==="image"&&m.fichier_url&&<img src={m.fichier_url} alt="" style={{maxWidth:200,borderRadius:6,marginBottom:4,display:"block"}}/>}
                {m.type==="audio"&&m.fichier_url&&<audio controls src={m.fichier_url} style={{maxWidth:220,marginBottom:4}}/>}
                <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{m.contenu}</div>
              </div>
              <div style={{fontSize:9,color:C.muted,textAlign:m.moi?"right":"left",marginTop:2}}>{m.created_at?new Date(m.created_at).toLocaleString("fr",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}{m.type==="auto_ia"?" · réponse IA":""}</div>
            </div>
          </div>)}
          <div ref={endRef}/>
        </div>
        {suggestion&&<div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:8,padding:10,margin:"0 16px 10px",fontSize:11,color:C.text}}>
          <div style={{color:C.blue,fontWeight:700,marginBottom:4}}>💡 Suggestion Claude</div>
          {suggestion}
          <div style={{marginTop:8,display:"flex",gap:6}}><Btn onClick={()=>{setMsgInput(suggestion);setSuggestion("");}} style={{fontSize:10,padding:"4px 10px"}}>Utiliser</Btn><BtnGhost onClick={()=>setSuggestion("")} style={{fontSize:10,padding:"4px 10px"}}>Ignorer</BtnGhost></div>
        </div>}
        <div style={{padding:"8px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:6,flexWrap:"wrap"}}>
          {espace==="externe"&&<>
            <BtnGhost onClick={()=>creerActionDepuis("deal")} style={{fontSize:9,padding:"3px 8px"}}>+ Deal</BtnGhost>
            <BtnGhost onClick={()=>creerActionDepuis("devis")} style={{fontSize:9,padding:"3px 8px"}}>+ Devis</BtnGhost>
          </>}
          <BtnGhost onClick={demanderSuggestion} style={{fontSize:9,padding:"3px 8px",color:C.blue,borderColor:`${C.blue}44`}}>{suggestionLoading?"⏳":"💡 Suggestion IA"}</BtnGhost>
        </div>
        <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"center"}}>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={handleFile}/>
          <button onClick={()=>fileRef.current?.click()} title="Joindre une photo/fichier" style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>📎</button>
          <button onClick={recording?stopRecording:startRecording} title="Message vocal" style={{background:recording?C.red:"transparent",border:"none",color:recording?"#fff":C.muted,cursor:"pointer",fontSize:16,borderRadius:"50%",width:28,height:28}}>🎤</button>
          <Inp value={msgInput} onChange={e=>setMsgInput(e.target.value)} placeholder="Écrire un message..." style={{flex:1}} onKeyDown={e=>{if(e.key==="Enter")envoyerMsg();}}/>
          <Btn onClick={envoyerMsg} style={{padding:"8px 14px",flexShrink:0}}>↗</Btn>
        </div>
      </Card>:<Card style={{height:520,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:32,marginBottom:8}}>💬</div><div style={{fontSize:12}}>Sélectionne une conversation</div></div>
      </Card>}
    </div>}
  </div>;
};

const SwipeableNotif=({n,i,onOpen,onDelete,typeColor})=>{
  const[dragX,setDragX]=useState(0);
  const[dragging,setDragging]=useState(false);
  const startX=useRef(0);
  const DELETE_W=72;

  const onStart=(clientX)=>{startX.current=clientX;setDragging(true);};
  const onMove=(clientX)=>{
    if(!dragging)return;
    const delta=clientX-startX.current;
    setDragX(Math.max(-DELETE_W,Math.min(0,delta)));
  };
  const onEnd=()=>{
    setDragging(false);
    if(dragX<-DELETE_W/2)setDragX(-DELETE_W);else setDragX(0);
  };

  return <div style={{position:"relative",overflow:"hidden",borderRadius:10}}>
    <div onClick={()=>{onDelete();}} style={{position:"absolute",top:0,right:0,bottom:0,width:DELETE_W,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:11,fontWeight:700}}>🗑 Suppr.</div>
    <div
      onClick={()=>{if(dragX===0)onOpen();}}
      onTouchStart={e=>onStart(e.touches[0].clientX)}
      onTouchMove={e=>onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
      onMouseDown={e=>onStart(e.clientX)}
      onMouseMove={e=>{if(dragging)onMove(e.clientX);}}
      onMouseUp={onEnd}
      onMouseLeave={()=>{if(dragging)onEnd();}}
      style={{background:n.lu?C.card2:C.card,border:`1px solid ${n.lu?C.border:typeColor[n.type]||C.border}44`,borderRadius:10,padding:"12px 16px",cursor:"grab",display:"flex",gap:12,alignItems:"center",transform:`translateX(${dragX}px)`,transition:dragging?"none":"transform .2s",position:"relative",userSelect:"none"}}>
      <div style={{fontSize:22,flexShrink:0}}>{n.icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:n.lu?400:700,color:C.text}}>{n.titre}</div>
        <div style={{fontSize:10,color:C.muted,marginTop:2}}>{n.heure}</div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        {!n.lu&&<div style={{width:8,height:8,borderRadius:"50%",background:typeColor[n.type]||C.blue}}/>}
        <Pill color={typeColor[n.type]||C.blue}>{n.type}</Pill>
      </div>
    </div>
  </div>;
};


export default PageChat;
