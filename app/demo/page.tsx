"use client";
import { useState, useEffect } from "react";

const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
};

const MODULES = [
  {
    id:"accueil", titre:"🏠 Tableau de bord", couleur:C.gold,
    desc:"Vue d'ensemble de toute votre activité. Score business, CA du mois, priorités IA.",
    preview: () => (
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:C.card2,borderRadius:10,padding:16,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>CA CE MOIS</div>
          <div style={{fontSize:28,fontWeight:700,color:C.green}}>24 380 €</div>
          <div style={{fontSize:10,color:C.green,marginTop:4}}>+18% vs mois dernier</div>
        </div>
        <div style={{background:C.card2,borderRadius:10,padding:16,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>SCORE BUSINESS</div>
          <div style={{fontSize:28,fontWeight:700,color:C.gold}}>74/100</div>
          <div style={{fontSize:10,color:C.gold,marginTop:4}}>Bon — En progression</div>
        </div>
        <div style={{background:C.card2,borderRadius:10,padding:16,border:`1px solid ${C.border}`,gridColumn:"span 2"}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:8}}>PRIORITÉS DU JOUR (IA)</div>
          {["🔴 2 devis en attente de validation","🟡 Sofia Al-Rashid attend depuis 2h","🟡 Stock produits vitres critique"].map((p,i)=>(
            <div key={i} style={{fontSize:12,color:C.text,padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>{p}</div>
          ))}
        </div>
      </div>
    )
  },
  {
    id:"wallet", titre:"💳 Wallet & Paiements", couleur:C.green,
    desc:"Encaissez partout — Wave, Orange Money, MTN, Visa, SEPA. Toutes vos transactions centralisées.",
    preview: () => (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:`${C.green}15`,borderRadius:10,padding:16,border:`1px solid ${C.green}33`,textAlign:"center"}}>
          <div style={{fontSize:10,color:C.muted}}>SOLDE WALLET</div>
          <div style={{fontSize:32,fontWeight:700,color:C.green}}>18 420 €</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["🌊 Wave","3 200€",C.blue],["📱 Orange Money","1 800€",C.orange],["💳 Visa","8 420€",C.purple]].map(([m,v,c],i)=>(
            <div key={i} style={{background:C.card2,borderRadius:8,padding:10,textAlign:"center",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:16}}>{m}</div>
              <div style={{fontSize:13,fontWeight:700,color:c,marginTop:4}}>{v}</div>
            </div>
          ))}
        </div>
        {[["Paiement Sofia — Jet","+2 400€","il y a 2h",C.green],["Comm. Thomas Beaumont","-480€","Hier",C.red],["Paiement Marc Dupont","+580€","Hier",C.green]].map(([l,m,t,c],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:C.card2,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div><div style={{fontSize:12,fontWeight:600}}>{l}</div><div style={{fontSize:10,color:C.muted}}>{t}</div></div>
            <div style={{fontWeight:700,color:c}}>{m}</div>
          </div>
        ))}
      </div>
    )
  },
  {
    id:"devis", titre:"◧ Devis", couleur:C.blue,
    desc:"Créez un devis en 30 secondes. Envoyez par WhatsApp, signez électroniquement, encaissez en 1 clic.",
    preview: () => (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[
          {id:"TYM-0044",client:"Sofia Al-Rashid",service:"Jet Paris → Dubai",montant:"2 400€",statut:"en_attente",sc:C.orange},
          {id:"TYM-0043",client:"Groupe Prestige",service:"Nettoyage bureaux",montant:"580€",statut:"signé",sc:C.green},
          {id:"TYM-0042",client:"Marc Dupont",service:"Nettoyage Airbnb",montant:"320€",statut:"payé",sc:C.blue},
        ].map((d,i)=>(
          <div key={i} style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${d.sc}33`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,fontWeight:700}}>{d.client}</div>
              <div style={{fontSize:10,color:C.muted}}>{d.id} · {d.service}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:16,fontWeight:700,color:C.gold}}>{d.montant}</div>
              <div style={{fontSize:10,background:`${d.sc}22`,color:d.sc,padding:"2px 8px",borderRadius:10,marginTop:4}}>{d.statut}</div>
            </div>
          </div>
        ))}
        <div style={{background:`${C.blue}11`,borderRadius:8,padding:12,fontSize:11,color:C.blue,textAlign:"center",border:`1px solid ${C.blue}33`}}>
          ✒ Signature électronique eIDAS · 📱 Envoi WhatsApp auto · 📄 PDF en 1 clic
        </div>
      </div>
    )
  },
  {
    id:"clients", titre:"◬ Clients", couleur:C.purple,
    desc:"Fiches clients complètes avec score de solvabilité, tunnel de vente et upsell automatique par l'IA.",
    preview: () => (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[
          {nom:"Sofia Al-Rashid",ville:"Dubaï 🇦🇪",ca:"9 200€",score:98,vip:true,c:C.gold},
          {nom:"Pierre Lefevre",ville:"Paris 🇫🇷",ca:"5 400€",score:85,vip:false,c:C.blue},
          {nom:"Marc Dupont",ville:"Lyon 🇫🇷",ca:"3 200€",score:68,vip:false,c:C.purple},
        ].map((cl,i)=>(
          <div key={i} style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:`${cl.c}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:cl.c,flexShrink:0}}>{cl.nom[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700}}>{cl.nom} {cl.vip&&"⭐"}</div>
              <div style={{fontSize:10,color:C.muted}}>{cl.ville}</div>
              <div style={{height:4,borderRadius:2,background:C.border,marginTop:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:cl.score+"%",background:cl.score>=80?C.green:cl.score>=60?C.gold:C.orange,borderRadius:2}}/>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:700,color:C.green}}>{cl.ca}</div>
              <div style={{fontSize:10,color:cl.score>=80?C.green:C.gold}}>Score: {cl.score}/100</div>
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    id:"crm", titre:"📋 Deals & Pipeline", couleur:C.teal||C.green,
    desc:"Pipeline Kanban visuel. L'IA calcule la probabilité de closing et recommande les meilleures actions.",
    preview: () => (
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[
          {etape:"Qualification",color:C.blue,deals:[{n:"Hôtel Prestige",v:"12 000€",p:60},{n:"Cabinet Delmas",v:"960€",p:45}]},
          {etape:"Proposition",color:C.gold,deals:[{n:"Jet Monaco",v:"24 000€",p:85}]},
          {etape:"Négociation",color:C.orange,deals:[{n:"Syndic Val-de-Marne",v:"18 000€",p:70}]},
        ].map((col,i)=>(
          <div key={i} style={{background:C.card2,borderRadius:10,padding:10,border:`1px solid ${col.color}33`}}>
            <div style={{fontSize:10,color:col.color,fontWeight:700,marginBottom:8,textTransform:"uppercase"}}>{col.etape}</div>
            {col.deals.map((d,j)=>(
              <div key={j} style={{background:C.dark||"#06060E",borderRadius:8,padding:10,marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:700}}>{d.n}</div>
                <div style={{fontSize:12,color:C.gold,marginTop:2}}>{d.v}</div>
                <div style={{height:3,borderRadius:2,background:C.border,marginTop:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:d.p+"%",background:col.color}}/>
                </div>
                <div style={{fontSize:9,color:C.muted,marginTop:2}}>{d.p}% closing</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  },
  {
    id:"planning", titre:"⊡ Planning & Équipe", couleur:C.orange,
    desc:"Planifiez vos missions, gérez votre équipe, suivez les interventions en temps réel.",
    preview: () => (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          {["Lun 28","Mar 29","Mer 30","Jeu 31"].map((j,i)=>(
            <div key={i} style={{background:i===0?`${C.gold}15`:C.card2,borderRadius:8,padding:8,textAlign:"center",border:`1px solid ${i===0?C.gold:C.border}`}}>
              <div style={{fontSize:10,color:i===0?C.gold:C.muted}}>{j}</div>
              <div style={{fontSize:18,fontWeight:700,color:i===0?C.gold:C.muted}}>{[3,2,4,1][i]}</div>
              <div style={{fontSize:9,color:C.muted}}>missions</div>
            </div>
          ))}
        </div>
        {[
          {heure:"09:00",service:"Nettoyage Airbnb Montmartre",equipe:"Thomas B.",statut:"en cours",sc:C.green},
          {heure:"11:00",service:"Jet privé Le Bourget",equipe:"Abou D.",statut:"confirmé",sc:C.blue},
          {heure:"14:00",service:"Nettoyage bureaux La Défense",equipe:"Fatou S.",statut:"confirmé",sc:C.blue},
        ].map((m,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"center",background:C.card2,borderRadius:8,padding:10,border:`1px solid ${m.sc}22`}}>
            <div style={{fontSize:11,color:C.muted,minWidth:40}}>{m.heure}</div>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{m.service}</div><div style={{fontSize:10,color:C.muted}}>👤 {m.equipe}</div></div>
            <div style={{fontSize:10,background:`${m.sc}22`,color:m.sc,padding:"3px 8px",borderRadius:10}}>{m.statut}</div>
          </div>
        ))}
      </div>
    )
  },
  {
    id:"partenaires", titre:"⬡ Partenaires & AA", couleur:C.blue,
    desc:"Gérez vos apporteurs d'affaires, leurs commissions et leurs performances avec l'IA.",
    preview: () => (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["CA apporté","43 100€",C.green],["Commissions dues","8 125€",C.orange],["Partenaires actifs","4",C.blue]].map(([l,v,c],i)=>(
            <div key={i} style={{background:C.card2,borderRadius:8,padding:12,textAlign:"center",border:`1px solid ${c}22`}}>
              <div style={{fontSize:9,color:C.muted}}>{l}</div>
              <div style={{fontSize:18,fontWeight:700,color:c,marginTop:4}}>{v}</div>
            </div>
          ))}
        </div>
        {[
          {nom:"Groupe Prestige SARL",ca:"22 000€",comm:"12%",dues:"2 640€",c:C.purple},
          {nom:"Thomas Beaumont",ca:"12 400€",comm:"20%",dues:"2 480€",c:C.blue},
          {nom:"Leila Mansouri",ca:"8 700€",comm:"15%",dues:"1 305€",c:C.gold},
        ].map((p,i)=>(
          <div key={i} style={{background:C.card2,borderRadius:8,padding:10,display:"flex",justifyContent:"space-between",alignItems:"center",border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`${p.c}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:p.c}}>{p.nom[0]}</div>
              <div><div style={{fontSize:11,fontWeight:700}}>{p.nom}</div><div style={{fontSize:9,color:C.muted}}>CA: {p.ca} · Taux: {p.comm}</div></div>
            </div>
            <div style={{fontSize:12,fontWeight:700,color:C.orange}}>{p.dues}</div>
          </div>
        ))}
      </div>
    )
  },
  {
    id:"analytique", titre:"◒ Analytique & CA", couleur:C.green,
    desc:"Prévisions IA mois par mois, analyse des tendances, objectifs et rapports automatiques.",
    preview: () => (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.green}33`}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:8}}>CA MENSUEL — 6 DERNIERS MOIS</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
            {[18,22,19,25,21,28].map((v,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:"100%",height:v*2.5+"px",background:i===5?C.green:`${C.green}44`,borderRadius:"3px 3px 0 0"}}/>
                <div style={{fontSize:8,color:C.muted}}>{["Nov","Déc","Jan","Fév","Mar","Avr"][i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:`${C.purple}11`,borderRadius:8,padding:12,border:`1px solid ${C.purple}33`}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:4}}>🤖 Prévision IA — Mai 2026</div>
          <div style={{fontSize:13,color:C.text}}>CA estimé : <strong style={{color:C.gold}}>31 200€</strong> (+11% vs avril). Recommandation : relancez les 3 devis en attente pour atteindre l'objectif mensuel.</div>
        </div>
      </div>
    )
  },
  {
    id:"prospection", titre:"⊕ Prospection IA", couleur:C.purple,
    desc:"59 fonctionnalités de prospection automatique. Base SIRENE, bot WhatsApp, séquences multi-canal.",
    preview: () => (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:`${C.purple}11`,borderRadius:10,padding:14,border:`1px solid ${C.purple}33`}}>
          <div style={{fontSize:10,color:C.purple,fontWeight:600,marginBottom:8}}>🤖 AGENT IA — EN COURS</div>
          {[
            {action:"Enrichissement SIRENE — 247 entreprises",status:"✓",time:"il y a 2 min",c:C.green},
            {action:"Messages WhatsApp personnalisés envoyés",status:"✓",time:"il y a 1 min",c:C.green},
            {action:"Bot vocal Bland.ai — 3 appels en cours",status:"⟳",time:"En cours...",c:C.gold},
            {action:"Score lead: 87/100 — CRM Push",status:"◆",time:"→ CRM",c:C.blue},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}22`,fontSize:12}}>
              <div style={{display:"flex",gap:8}}><span style={{color:item.c}}>{item.status}</span><span>{item.action}</span></div>
              <span style={{color:C.muted,fontSize:10}}>{item.time}</span>
            </div>
          ))}
          <div style={{marginTop:8,fontSize:11,color:C.purple}}>✅ 12 prospects traités · 3 RDV générés ce matin</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["Leads générés","47",C.blue],["Taux conversion","23%",C.green]].map(([l,v,c],i)=>(
            <div key={i} style={{background:C.card2,borderRadius:8,padding:12,textAlign:"center",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,color:C.muted}}>{l}</div>
              <div style={{fontSize:22,fontWeight:700,color:c,marginTop:4}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id:"notifications", titre:"🔔 Notifications", couleur:C.gold,
    desc:"Alertes temps réel, notifications WhatsApp automatiques, popups configurables.",
    preview: () => (
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[
          {icon:"💰",titre:"Paiement reçu — Sofia Al-Rashid",msg:"2 400€ encaissé via carte Visa",type:"money",c:C.green},
          {icon:"⚠️",titre:"2 devis en attente de validation",msg:"TYM-0044 et TYM-0045 depuis 48h",type:"urgent",c:C.red},
          {icon:"📦",titre:"Stock critique — Produit vitres Pro",msg:"3 unités restantes — seuil minimum: 5",type:"stock",c:C.orange},
          {icon:"⭐",titre:"Nouvel avis 5★ — Sofia Al-Rashid",msg:"Excellent service — publié sur Google",type:"good",c:C.gold},
          {icon:"🎯",titre:"Lead qualifié — Hôtel Prestige Paris",msg:"Thomas Beaumont — CA estimé: 8 000€",type:"info",c:C.blue},
        ].map((n,i)=>(
          <div key={i} style={{background:C.card2,borderRadius:8,padding:"10px 14px",border:`1px solid ${n.c}22`,display:"flex",gap:10,alignItems:"center"}}>
            <div style={{fontSize:20,flexShrink:0}}>{n.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700}}>{n.titre}</div>
              <div style={{fontSize:10,color:C.muted}}>{n.msg}</div>
            </div>
            <div style={{width:8,height:8,borderRadius:"50%",background:n.c,flexShrink:0}}/>
          </div>
        ))}
      </div>
    )
  },
];

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = MODULES[step];
  const DUREE = 6000;

  useEffect(() => {
    if (!playing || finished) return;
    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DUREE) * 100, 100);
      setProgress(pct);
      if (elapsed >= DUREE) {
        clearInterval(interval);
        if (step < MODULES.length - 1) {
          setStep(s => s + 1);
        } else {
          setFinished(true);
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [step, playing, finished]);

  const goTo = (i: number) => {
    setStep(i);
    setProgress(0);
    setFinished(false);
    setPlaying(true);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.dark, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.text, display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <a href="/" style={{ color:C.gold, textDecoration:"none", fontSize:20, fontWeight:700, letterSpacing:"0.1em", fontFamily:"Georgia,serif" }}>XYRA</a>
          <span style={{ color:C.muted, fontSize:12 }}>· Démonstration interactive</span>
        </div>
        <a href="/inscription" style={{ background:C.gold, color:"#000", padding:"9px 20px", borderRadius:6, textDecoration:"none", fontSize:13, fontWeight:700 }}>
          🚀 Commencer gratuitement — 14j
        </a>
      </div>

      {/* Barre progression globale */}
      <div style={{ height:3, background:C.border, flexShrink:0 }}>
        <div style={{ height:"100%", width:`${((step + progress/100) / MODULES.length) * 100}%`, background:`linear-gradient(90deg, ${C.gold}, #E8D5A3)`, transition:"width 0.1s linear" }} />
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Sidebar */}
        <div style={{ width:220, background:C.card, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto" }}>
          <div style={{ padding:"14px 14px 6px", fontSize:9, color:C.muted, letterSpacing:"0.15em", textTransform:"uppercase" }}>
            MODULES — {step+1}/{MODULES.length}
          </div>
          {MODULES.map((m,i) => (
            <button key={i} onClick={() => goTo(i)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px", background:i===step?`${C.gold}10`:"transparent", borderLeft:`3px solid ${i===step?C.gold:i<step?C.green:"transparent"}`, border:"none", borderBottom:`1px solid ${C.border}22`, cursor:"pointer", textAlign:"left", width:"100%", fontFamily:"inherit" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:i<step?C.green:i===step?C.gold:C.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:i<=step?"#000":C.muted, flexShrink:0 }}>
                {i<step?"✓":i+1}
              </div>
              <span style={{ fontSize:11, fontWeight:i===step?700:400, color:i===step?C.gold:i<step?C.green:"#8080A0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {m.titre}
              </span>
            </button>
          ))}
          <div style={{ padding:12, marginTop:"auto", borderTop:`1px solid ${C.border}` }}>
            <a href="/inscription" style={{ display:"block", background:C.gold, color:"#000", textAlign:"center", padding:"9px", borderRadius:6, textDecoration:"none", fontSize:12, fontWeight:700 }}>
              Essai gratuit 14j →
            </a>
          </div>
        </div>

        {/* Zone principale */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Contrôles */}
          <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexShrink:0 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:16, fontWeight:700, color:current.couleur, marginBottom:3 }}>{current.titre}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{current.desc}</div>
              <div style={{ height:3, background:C.border, borderRadius:2, marginTop:8, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progress}%`, background:current.couleur, transition:"width 0.1s linear" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              <button onClick={() => goTo(Math.max(0,step-1))} style={{ background:C.card2, color:C.text, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 12px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>← Préc.</button>
              <button onClick={() => setPlaying(p=>!p)} style={{ background:playing?`${C.gold}22`:`${C.green}22`, color:playing?C.gold:C.green, border:`1px solid ${playing?C.gold:C.green}44`, borderRadius:6, padding:"7px 12px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>
                {playing?"⏸ Pause":"▶ Play"}
              </button>
              <button onClick={() => goTo(Math.min(MODULES.length-1,step+1))} style={{ background:C.card2, color:C.text, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 12px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>Suiv. →</button>
            </div>
          </div>

          {/* Contenu module */}
          <div style={{ flex:1, overflowY:"auto", padding:20 }}>
            {!finished ? (
              <div>
                <div style={{ background:C.card, borderRadius:12, padding:20, border:`1px solid ${C.border}`, maxWidth:600, margin:"0 auto" }}>
                  {current.preview()}
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:40, textAlign:"center", minHeight:"100%" }}>
                <div style={{ fontSize:48 }}>🎉</div>
                <div style={{ fontSize:24, fontWeight:700, color:C.gold, fontFamily:"Georgia,serif" }}>Vous avez vu tout Xyra !</div>
                <div style={{ fontSize:14, color:C.muted, maxWidth:480, lineHeight:1.7 }}>
                  {MODULES.length} modules puissants pour gérer toute votre entreprise, partout dans le monde.
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginTop:8 }}>
                  <a href="/inscription" style={{ background:C.gold, color:"#000", padding:"13px 28px", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:700 }}>🚀 Commencer gratuitement — 14 jours</a>
                  <button onClick={() => goTo(0)} style={{ background:"transparent", color:C.gold, border:`1px solid ${C.gold}44`, padding:"13px 28px", borderRadius:8, cursor:"pointer", fontSize:14, fontFamily:"inherit" }}>🔄 Revoir la démo</button>
                </div>
                <div style={{ fontSize:12, color:C.muted }}>Sans carte bancaire · Sans engagement · Accès immédiat</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}