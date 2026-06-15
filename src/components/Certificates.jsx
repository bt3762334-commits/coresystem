import { useState, useRef } from "react";
import { flatTasks, todayAr } from "../utils/helpers";

// ── cert types ──────────────────────────────────────────────────────────────
const CERT_TYPES = [
  {
    id: "productivity",
    label: "شهادة الإنتاجية",
    icon: "⚡",
    gradient: ["#7C6EFF", "#4338CA"],
    glow: "rgba(124,110,255,.6)",
    accent: "#A89BFF",
    tag: "PRODUCTIVITY MASTER",
    minDone: 5,
  },
  {
    id: "streak",
    label: "شهادة المثابرة",
    icon: "🔥",
    gradient: ["#F59E0B", "#DC2626"],
    glow: "rgba(245,158,11,.6)",
    accent: "#FCD34D",
    tag: "CONSISTENCY CHAMPION",
    minStreak: 3,
  },
  {
    id: "mastery",
    label: "شهادة التميز",
    icon: "🏆",
    gradient: ["#10D98A", "#065F46"],
    glow: "rgba(16,217,138,.6)",
    accent: "#5EFFC7",
    tag: "CORE SYSTEM ELITE",
    minDone: 10,
  },
];

function genCertId() {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CS-${ts}-${rnd}`;
}

function CertPreview({ name, cert, stats, certId, date }) {
  const [c1, c2] = cert.gradient;

  const quads = [
    { label: "Q1 عاجل ومهم",    done: stats.q1done, total: stats.q1total, color: "#F87171" },
    { label: "Q2 مهم مش عاجل", done: stats.q2done, total: stats.q2total, color: "#60A5FA" },
    { label: "Q3 عاجل مش مهم", done: stats.q3done, total: stats.q3total, color: "#FBBF24" },
    { label: "Q4 مش عاجل",     done: stats.q4done, total: stats.q4total, color: "#34D399" },
  ];

  return (
    <div
      id="cert-canvas"
      style={{
        width: 900, height: 636,
        background: "linear-gradient(135deg, #0D0B1E 0%, #110F26 40%, #0A1628 100%)",
        borderRadius: 24,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Cairo, sans-serif",
        direction: "rtl",
        flexShrink: 0,
      }}
    >
      {/* bg blobs */}
      <div style={{ position:"absolute", top:-100, right:-100, width:420, height:420, borderRadius:"50%", background:`radial-gradient(circle, ${cert.glow} 0%, transparent 65%)`, opacity:.3, pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-120, left:-80,  width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle, rgba(16,217,138,.28) 0%, transparent 65%)", opacity:.3, pointerEvents:"none" }} />

      {/* borders */}
      <div style={{ position:"absolute", inset:10, borderRadius:18, border:`1px solid ${cert.accent}33`, pointerEvents:"none" }} />
      <div style={{ position:"absolute", inset:15, borderRadius:15, border:`0.5px solid ${cert.accent}16`, pointerEvents:"none" }} />

      {/* corner diamonds */}
      {[{top:10,right:10},{top:10,left:10},{bottom:10,right:10},{bottom:10,left:10}].map((pos,i)=>(
        <div key={i} style={{ position:"absolute", ...pos, width:14, height:14, background:`linear-gradient(135deg, ${c1}, ${cert.accent})`, borderRadius:3, opacity:.8, transform:"rotate(45deg)" }} />
      ))}

      {/* left accent strip */}
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:6, background:`linear-gradient(180deg, ${c1}, ${c2}, ${cert.accent})` }} />

      {/* top tag */}
      <div style={{ position:"absolute", top:0, left:6, right:0, height:36, background:`linear-gradient(90deg, ${c1}20, transparent)`, display:"flex", alignItems:"center", padding:"0 22px" }}>
        <span style={{ fontSize:9, fontWeight:700, color:cert.accent, letterSpacing:".15em", opacity:.85 }}>
          CORE SYSTEM · AI PRODUCTIVITY OS · {cert.tag}
        </span>
      </div>

      {/* main content */}
      <div style={{ position:"relative", zIndex:1, padding:"46px 38px 22px 44px", height:"100%", display:"flex", flexDirection:"column" }}>

        {/* header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <div style={{ width:44, height:44, borderRadius:13, background:`linear-gradient(135deg, ${c1}, ${c2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 0 20px ${cert.glow}` }}>
                {cert.icon}
              </div>
              <div>
                <div style={{ fontSize:10, color:cert.accent, fontWeight:700, letterSpacing:".1em" }}>شـهـادة تـقـديـر رسـمـيـة</div>
                <div style={{ fontSize:22, fontWeight:900, color:"#fff" }}>{cert.label}</div>
              </div>
            </div>
            <div style={{ fontSize:10.5, color:"#3E3B70" }}>تُقدَّم تقديراً للجهد والمثابرة في إدارة الوقت والإنتاجية</div>
          </div>

          {/* DarkByte stamp */}
          <div style={{ width:86, height:86, borderRadius:"50%", border:`2.5px solid ${cert.accent}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:`${c1}18`, boxShadow:`0 0 28px ${cert.glow}, inset 0 0 18px ${c1}12`, flexShrink:0 }}>
            <div style={{ fontSize:7, fontWeight:800, color:cert.accent, letterSpacing:".08em", textAlign:"center", lineHeight:1.9 }}>◈ DARKBYTE ◈</div>
            <div style={{ fontSize:17, color:cert.accent, fontWeight:900, lineHeight:1 }}>✓</div>
            <div style={{ fontSize:6.5, color:cert.accent, letterSpacing:".1em", fontWeight:700 }}>CERTIFIED</div>
          </div>
        </div>

        {/* recipient */}
        <div style={{ padding:"12px 20px", marginBottom:16, background:`linear-gradient(90deg, ${c1}20, ${c2}10)`, border:`1px solid ${cert.accent}28`, borderRadius:13, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ fontSize:10, color:"#6B67A0", whiteSpace:"nowrap" }}>تُمنح إلى</div>
          <div style={{ width:1, height:28, background:`${cert.accent}40` }} />
          <div style={{ fontSize:26, fontWeight:900, background:`linear-gradient(90deg, #fff, ${cert.accent})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", lineHeight:1.2 }}>
            {name || "— اسم المستخدم —"}
          </div>
        </div>

        {/* quad stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:9, marginBottom:13 }}>
          {quads.map((q,i) => {
            const pct = q.total > 0 ? Math.round((q.done/q.total)*100) : 0;
            return (
              <div key={i} style={{ padding:"9px 11px", borderRadius:11, background:"rgba(255,255,255,.04)", border:`1px solid ${q.color}28` }}>
                <div style={{ fontSize:8.5, color:q.color, fontWeight:700, marginBottom:3, letterSpacing:".04em" }}>{q.label}</div>
                <div style={{ fontSize:20, fontWeight:900, color:"#fff", lineHeight:1 }}>{q.done}</div>
                <div style={{ fontSize:8.5, color:"#3E3B70" }}>من {q.total} مهمة</div>
                <div style={{ marginTop:5, height:3, borderRadius:3, background:"rgba(255,255,255,.07)" }}>
                  <div style={{ height:3, borderRadius:3, width:`${pct}%`, background:`linear-gradient(90deg, ${q.color}, ${q.color}88)` }} />
                </div>
                <div style={{ fontSize:8.5, color:q.color, marginTop:2, fontWeight:600 }}>{pct}%</div>
              </div>
            );
          })}
        </div>

        {/* summary */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9, marginBottom:16 }}>
          {[
            { label:"إجمالي المُنجز", val:`${stats.doneTotal} / ${stats.total}`, icon:"✅", color:"#A89BFF" },
            { label:"Streak الحالي",  val:`${stats.streak} يوم 🔥`,              icon:"📅", color:cert.accent },
            { label:"نسبة الإنجاز",   val:`${stats.total>0?Math.round(stats.doneTotal/stats.total*100):0}%`, icon:"📊", color:"#10D98A" },
          ].map((s,i)=>(
            <div key={i} style={{ padding:"9px 13px", borderRadius:11, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", gap:9 }}>
              <span style={{ fontSize:17 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize:8.5, color:"#3E3B70", marginBottom:1 }}>{s.label}</div>
                <div style={{ fontSize:13, fontWeight:800, color:s.color }}>{s.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ marginTop:"auto", display:"flex", alignItems:"flex-end", justifyContent:"space-between", borderTop:`1px solid ${cert.accent}18`, paddingTop:12 }}>
          <div>
            <div style={{ fontSize:9.5, color:cert.accent, fontWeight:700, marginBottom:2 }}>📅 تاريخ الإصدار</div>
            <div style={{ fontSize:11.5, color:"#EAE8FF", fontWeight:600 }}>{date}</div>
            <div style={{ fontSize:8.5, color:"#2A274C", fontFamily:"monospace", marginTop:2 }}>ID: {certId}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"Georgia, serif", fontSize:25, fontStyle:"italic", fontWeight:700, background:`linear-gradient(135deg, ${c1}, ${cert.accent})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:3, lineHeight:1 }}>DarkByte</div>
            <div style={{ width:115, height:1.5, background:`linear-gradient(90deg, transparent, ${cert.accent}, transparent)`, margin:"5px auto" }} />
            <div style={{ fontSize:8.5, color:"#3E3B70", letterSpacing:".09em" }}>التوقيع الرقمي المعتمد</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg, ${c1}, ${c2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, boxShadow:`0 4px 14px ${cert.glow}` }}>⊞</div>
            <div>
              <div style={{ fontSize:12, fontWeight:900, color:"#fff" }}>CORE SYSTEM</div>
              <div style={{ fontSize:8, color:"#3E3B70", letterSpacing:".06em" }}>AI PRODUCTIVITY OS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Certificates({ session, tasks, streak, completedToday, certificates, onIssue }) {
  const [userName, setUserName] = useState(session?.name || "");
  const [certType, setCertType] = useState("productivity");
  const [issued,   setIssued]   = useState(false);
  const [dl,       setDL]       = useState(false);
  const certIdRef = useRef(genCertId());

  const stats = {
    q1done: tasks.q1.filter(t=>t.done).length, q1total: tasks.q1.length,
    q2done: tasks.q2.filter(t=>t.done).length, q2total: tasks.q2.length,
    q3done: tasks.q3.filter(t=>t.done).length, q3total: tasks.q3.length,
    q4done: tasks.q4.filter(t=>t.done).length, q4total: tasks.q4.length,
    doneTotal: flatTasks(tasks).filter(t=>t.done).length,
    total:     flatTasks(tasks).length,
    streak:    streak.count,
    doneToday: completedToday.count,
  };

  const cert = CERT_TYPES.find(c => c.id === certType);
  const date = todayAr();

  const unlocked = certType === "streak"
    ? stats.streak    >= (cert.minStreak || 3)
    : stats.doneTotal >= (cert.minDone   || 5);

  const reqText = certType === "streak"
    ? `streak ${cert.minStreak} أيام (أنت عندك ${stats.streak})`
    : `إنجاز ${cert.minDone} مهام (أنت أنجزت ${stats.doneTotal})`;

  function handleIssue() {
    if (!userName.trim()) { alert("اكتب اسمك!"); return; }
    if (!unlocked) { alert("لازم تستوفي الشرط الأول!"); return; }
    onIssue({ id: certIdRef.current, type: certType, name: userName, stats, date, issued: Date.now() });
    setIssued(true);
    certIdRef.current = genCertId();
    setTimeout(() => setIssued(false), 3000);
  }

  async function handleDownload() {
    setDL(true);
    try {
      if (!window.html2canvas) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      const el = document.getElementById("cert-canvas");
      const canvas = await window.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null, logging: false });
      const a = document.createElement("a");
      a.download = `شهادة-${userName}-CoreSystem.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch(e) { alert("خطأ: " + e.message); }
    setDL(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* setup card */}
      <div className="card" style={{ padding:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ fontSize:30 }}>🎓</div>
          <div>
            <h2 style={{ fontSize:20, fontWeight:900, margin:0 }}>الشهادات الإلكترونية</h2>
            <p style={{ fontSize:12, color:"var(--text-2)", margin:0 }}>شهادات رسمية بختم DarkByte · قابلة للتحميل كـ PNG</p>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"var(--text-2)", display:"block", marginBottom:7 }}>✍️ اسمك في الشهادة</label>
            <input
              value={userName} onChange={e => setUserName(e.target.value)}
              placeholder="اكتب اسمك الكامل..."
              style={{ width:"100%", padding:"11px 15px", border:"1px solid var(--border)", borderRadius:12, background:"var(--bg)", color:"var(--text)", fontSize:15, fontWeight:600 }}
            />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"var(--text-2)", display:"block", marginBottom:7 }}>🏅 نوع الشهادة</label>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {CERT_TYPES.map(c => {
                const ok = c.id==="streak" ? stats.streak>=(c.minStreak||3) : stats.doneTotal>=(c.minDone||5);
                const active = certType === c.id;
                return (
                  <label key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 13px", borderRadius:11, border:`1.5px solid ${active?c.gradient[0]:"var(--border)"}`, background:active?`${c.gradient[0]}18`:"var(--bg)", cursor:ok?"pointer":"not-allowed", opacity:ok?1:.45, transition:"all .15s" }}>
                    <input type="radio" name="ct" value={c.id} checked={active} onChange={()=>ok&&setCertType(c.id)} style={{ display:"none" }} />
                    <span style={{ fontSize:18 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:active?c.gradient[0]:"var(--text)" }}>{c.label}</div>
                      <div style={{ fontSize:10, color:"var(--text-2)" }}>{ok ? "✅ مفتوحة" : `🔒 ${c.id==="streak"?`streak ${c.minStreak} أيام`:`${c.minDone} مهام منجزة`}`}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ marginTop:14, padding:"10px 14px", borderRadius:10, background:unlocked?"rgba(16,217,138,.1)":"rgba(245,158,11,.1)", border:`1px solid ${unlocked?"rgba(16,217,138,.3)":"rgba(245,158,11,.3)"}`, fontSize:12, color:unlocked?"#10D98A":"#F59E0B" }}>
          {unlocked ? `✅ مبروك! استوفيت الشرط — ${reqText}` : `🔒 شرط الفتح: ${reqText}`}
        </div>

        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <button onClick={handleIssue} disabled={!unlocked} style={{ flex:1, padding:"13px 20px", background:unlocked?`linear-gradient(135deg, ${cert.gradient[0]}, ${cert.gradient[1]})`:"var(--border)", color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:800, boxShadow:unlocked?`0 4px 24px ${cert.glow}`:"none" }}>
            {issued ? "✅ تم الإصدار!" : "🎓 إصدار الشهادة"}
          </button>
          <button onClick={handleDownload} disabled={dl||!unlocked} style={{ padding:"13px 22px", background:"var(--surface)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:12, fontSize:14, fontWeight:700 }}>
            {dl ? "⏳..." : "⬇️ تحميل PNG"}
          </button>
        </div>
      </div>

      {/* preview */}
      <div className="card" style={{ padding:24 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"var(--text-2)", marginBottom:14 }}>👁️ معاينة الشهادة — بياناتك الحقيقية</div>
        <div style={{ overflowX:"auto" }}>
          <CertPreview name={userName} cert={cert} stats={stats} certId={certIdRef.current} date={date} />
        </div>
      </div>

      {/* history */}
      {certificates.length > 0 && (
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:800, marginBottom:16 }}>📋 شهاداتي ({certificates.length})</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {certificates.map((c,i) => {
              const ct = CERT_TYPES.find(t=>t.id===c.type)||CERT_TYPES[0];
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 17px", borderRadius:13, border:`1px solid ${ct.gradient[0]}33`, background:`${ct.gradient[0]}0A` }}>
                  <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, background:`linear-gradient(135deg, ${ct.gradient[0]}, ${ct.gradient[1]})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:`0 4px 14px ${ct.glow}` }}>{ct.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:ct.gradient[0] }}>{ct.label}</div>
                    <div style={{ fontSize:12, color:"var(--text-2)" }}>{c.name} · {c.date} · {c.stats?.doneTotal??0} مهمة منجزة</div>
                  </div>
                  <div style={{ fontSize:9, color:"var(--text-2)", fontFamily:"monospace", opacity:.5 }}>{c.id}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
