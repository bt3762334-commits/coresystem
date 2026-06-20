import { useState, useMemo } from "react";
import { flatTasks, today, monthKey } from "../utils/helpers";

// ─── Certificate Templates ───────────────────────────────
const TEMPLATES = [
  {
    id: "first10",
    title: "First Steps",
    subtitle: "بداية الطريق",
    description: "for successfully completing your first 10 tasks and laying the foundation of your productive journey.",
    icon: "🌟",
    required: 10,
    color: "#5E6AD2",
    color2: "#14B8A6",
  },
  {
    id: "first50",
    title: "Half-Century Achiever",
    subtitle: "إنجاز الـ 50",
    description: "for reaching 50 completed tasks — a milestone that reflects your commitment and discipline.",
    icon: "🥉",
    required: 50,
    color: "#5E6AD2",
    color2: "#14B8A6",
  },
  {
    id: "first100",
    title: "Century Master",
    subtitle: "سيد الـ 100",
    description: "for completing 100 tasks. This achievement reflects your dedication to personal growth and consistency.",
    icon: "🥈",
    required: 100,
    color: "#5E6AD2",
    color2: "#14B8A6",
  },
  {
    id: "monthly",
    title: "Monthly Excellence",
    subtitle: "تميز شهري",
    description: "for achieving 30 tasks within a single month — proving that consistency builds greatness.",
    icon: "📅",
    required: 30,
    color: "#5E6AD2",
    color2: "#14B8A6",
    monthly: true,
  },
];

function getMonthDoneCount(history, yearMonth) {
  if (!history) return 0;
  return Object.entries(history)
    .filter(([date]) => date.startsWith(yearMonth))
    .reduce((sum, [, count]) => sum + (count || 0), 0);
}

function getLifetimeDone(tasks) {
  return flatTasks(tasks).filter((t) => t.done).length;
}

function getEarnedIds(templates, tasks, streak) {
  const earned = new Set();
  const history = streak?.history || {};
  const lifetime = getLifetimeDone(tasks);

  templates.forEach((tpl) => {
    if (tpl.monthly) {
      const now = new Date();
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const nowKey = monthKey();
      const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
      if (getMonthDoneCount(history, nowKey) >= tpl.required) earned.add(tpl.id);
      else if (getMonthDoneCount(history, prevKey) >= tpl.required) earned.add(tpl.id);
    } else {
      if (lifetime >= tpl.required) earned.add(tpl.id);
    }
  });
  return earned;
}

export default function Certificates({ session, tasks, streak, certificates, onIssue }) {
  const [previewing, setPreviewing] = useState(null);
  const [issued, setIssued] = useState(new Set((certificates || []).map(c => c.templateId)));

  const lifetime = getLifetimeDone(tasks);
  const currentMonth = monthKey();
  const monthDone = getMonthDoneCount(streak?.history || {}, currentMonth);
  const earnedIds = getEarnedIds(TEMPLATES, tasks, streak);

  function handleIssue(tpl) {
    if (!earnedIds.has(tpl.id) || issued.has(tpl.id)) return;
    const cert = {
      id: "cert_" + Date.now().toString(36),
      templateId: tpl.id,
      title: tpl.title,
      subtitle: tpl.subtitle,
      description: tpl.description,
      icon: tpl.icon,
      color: tpl.color,
      color2: tpl.color2,
      userName: session.name,
      issuedAt: Date.now(),
      date: today(),
      stats: tpl.monthly
        ? { monthDone, month: currentMonth, total: tpl.required }
        : { lifetime, total: tpl.required },
    };
    onIssue(cert);
    setIssued((p) => new Set([...p, tpl.id]));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero */}
      <div className="divine-card" style={{ padding: "28px 32px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, opacity: .12,
          backgroundImage: "radial-gradient(circle at 20% 20%, #5E6AD2 0%, transparent 50%), radial-gradient(circle at 80% 80%, #14B8A6 0%, transparent 50%)",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, opacity: .85, marginBottom: 6, letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 700 }}>
            🎓 My Certificates
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, fontFamily: "Georgia, serif" }}>
            Earn your achievements
          </div>
          <p style={{ fontSize: 13, opacity: .8, maxWidth: 560, lineHeight: 1.6 }}>
            Each milestone unlocks a DarkByte-signed certificate, verified and personalized with your name.
          </p>
          <div style={{ display: "flex", gap: 28, marginTop: 18, flexWrap: "wrap" }}>
            {[
              [lifetime, "tasks done"],
              [monthDone, "this month"],
              [issued.size, "certificates earned"],
            ].map(([v, l], i) => (
              <div key={i}>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 11, opacity: .8 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Templates grid */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--text)", letterSpacing: ".04em" }}>
          🏅 AVAILABLE CERTIFICATES
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {TEMPLATES.map((tpl) => {
            const current = tpl.monthly ? monthDone : lifetime;
            const pct = Math.min(100, (current / tpl.required) * 100);
            const earned = earnedIds.has(tpl.id);
            const alreadyIssued = issued.has(tpl.id);

            return (
              <div key={tpl.id} className="slide-up" style={{
                background: "var(--surface)",
                border: `1px solid ${earned ? tpl.color + "66" : "var(--border)"}`,
                borderRadius: "var(--radius)", padding: 18,
                boxShadow: earned ? "var(--shadow-md)" : "var(--shadow)",
                position: "relative", overflow: "hidden",
              }}>
                {earned && (
                  <div style={{
                    position: "absolute", top: 12, left: 12,
                    fontSize: 10, fontWeight: 800, color: "#fff",
                    background: `linear-gradient(135deg, ${tpl.color}, ${tpl.color2})`,
                    padding: "3px 10px", borderRadius: 20, letterSpacing: ".08em",
                  }}>✓ QUALIFIED</div>
                )}
                <div style={{ fontSize: 36, marginBottom: 8, filter: earned ? "none" : "grayscale(0.4) opacity(0.7)" }}>{tpl.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2, color: "var(--text)" }}>{tpl.subtitle}</div>
                <div style={{ fontSize: 10, color: tpl.color, fontWeight: 700, marginBottom: 8, letterSpacing: ".12em", textTransform: "uppercase" }}>{tpl.title}</div>
                <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.55, margin: "0 0 14px" }}>{tpl.description}</p>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-2)" }}>{current} / {tpl.required} {tpl.monthly ? "tasks/month" : "tasks"}</span>
                    <span style={{ color: tpl.color, fontWeight: 800 }}>{Math.round(pct)}%</span>
                  </div>
                  <div style={{ height: 6, background: "var(--bg)", borderRadius: 3, overflow: "hidden", border: "1px solid var(--border)" }}>
                    <div style={{
                      height: "100%", width: pct + "%",
                      background: `linear-gradient(90deg, ${tpl.color}, ${tpl.color2})`,
                      borderRadius: 3, transition: "width .6s ease",
                      boxShadow: earned ? `0 0 12px ${tpl.color}88` : "none",
                    }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setPreviewing({ tpl, earned })} style={{
                    flex: 1, padding: "9px 12px", borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)", background: "var(--bg)",
                    color: "var(--text)", fontSize: 12, fontWeight: 600,
                  }}>👁 Preview</button>
                  <button onClick={() => handleIssue(tpl)} disabled={!earned || alreadyIssued} style={{
                    flex: 1, padding: "9px 12px", borderRadius: "var(--radius-sm)", border: "none",
                    background: !earned || alreadyIssued ? "var(--border-2)" : `linear-gradient(135deg, ${tpl.color}, ${tpl.color2})`,
                    color: !earned || alreadyIssued ? "var(--text-2)" : "#fff",
                    fontSize: 12, fontWeight: 700,
                    boxShadow: !earned || alreadyIssued ? "none" : `0 4px 14px ${tpl.color}55`,
                  }}>
                    {alreadyIssued ? "✓ Earned" : "🎁 Claim"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Earned certs wall */}
      {certificates && certificates.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--text)", letterSpacing: ".04em" }}>
            🏆 MY CERTIFICATES ({certificates.length})
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} onView={() => setPreviewing({ cert, earned: true })} />
            ))}
          </div>
        </div>
      )}

      {previewing && (
        <CertificateModal
          data={previewing.cert || { ...previewing.tpl, userName: session.name, date: today(), issuedAt: null }}
          issuedAt={previewing.cert?.issuedAt}
          onClose={() => setPreviewing(null)}
        />
      )}
    </div>
  );
}

function CertificateCard({ cert, onView }) {
  return (
    <button onClick={onView} className="slide-up" style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: 0, textAlign: "start",
      overflow: "hidden", boxShadow: "var(--shadow)", cursor: "pointer",
    }}>
      <div style={{
        height: 140,
        background: "linear-gradient(135deg, #0F1320 0%, #1A1F2E 50%, #131720 100%)",
        borderBottom: `2px solid ${cert.color || "#5E6AD2"}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: .25,
          backgroundImage: `radial-gradient(circle at 20% 30%, ${cert.color}55 0%, transparent 40%), radial-gradient(circle at 80% 70%, ${cert.color2}44 0%, transparent 40%)`,
        }} />
        <div style={{ fontSize: 56, position: "relative", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.4))" }}>{cert.icon}</div>
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{cert.subtitle || cert.title}</div>
        <div style={{ fontSize: 11, color: "var(--text-2)" }}>
          {cert.userName} · {new Date(cert.issuedAt || cert.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </div>
      </div>
    </button>
  );
}

// ─── DarkByte Stamp ──────────────────────────────────────
function DarkByteStamp({ size = 100, color = "#5E6AD2" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <path id="dbcircle2" d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" />
        <linearGradient id="dbgrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5E6AD2" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#dbgrad2)" strokeWidth="2" />
      <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />
      <text fontSize="7" fontWeight="800" fill="url(#dbgrad2)" letterSpacing="2.5" fontFamily="monospace">
        <textPath href="#dbcircle2" startOffset="2%">★ DARKBYTE ★ CERTIFIED ★</textPath>
      </text>
      <g transform="translate(50, 50)">
        <polygon points="0,-16 5,-5 16,-5 7,3 10,15 0,8 -10,15 -7,3 -16,-5 -5,-5" fill="url(#dbgrad2)" opacity="0.9" />
        <text x="0" y="3" textAnchor="middle" fontSize="7" fontWeight="900" fill="#0F1320" fontFamily="monospace" letterSpacing="0.5">DB</text>
      </g>
      <circle cx="14" cy="22" r="1.2" fill={color} opacity="0.4" />
      <circle cx="86" cy="78" r="1" fill={color} opacity="0.5" />
      <circle cx="12" cy="78" r="0.8" fill={color} opacity="0.3" />
      <circle cx="88" cy="22" r="1.1" fill={color} opacity="0.4" />
    </svg>
  );
}

// ─── Geometric corner decoration (like certificate 1) ────
function Corner({ style }) {
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" style={{ position: "absolute", opacity: 0.55, ...style }}>
      <line x1="5" y1="5" x2="60" y2="5" stroke="#8B95E8" strokeWidth="1.5" />
      <line x1="5" y1="5" x2="5" y2="60" stroke="#8B95E8" strokeWidth="1.5" />
      <line x1="5" y1="5" x2="28" y2="5" stroke="#14B8A6" strokeWidth="1" />
      <line x1="5" y1="5" x2="5" y2="28" stroke="#14B8A6" strokeWidth="1" />
      <circle cx="5" cy="5" r="3.5" fill="#5E6AD2" />
      <circle cx="28" cy="5" r="2" fill="#14B8A6" />
      <circle cx="5" cy="28" r="2" fill="#14B8A6" />
    </svg>
  );
}

// ─── Globe SVG (like certificate 1 top) ─────────────────
function Globe({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: "block" }}>
      <defs>
        <radialGradient id="gglobe" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#B4BBEF" />
          <stop offset="60%" stopColor="#5E6AD2" />
          <stop offset="100%" stopColor="#312E81" />
        </radialGradient>
        <linearGradient id="gglow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5E6AD2" stopOpacity="0" />
          <stop offset="50%" stopColor="#8B95E8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="30" fill="url(#gglobe)" />
      <ellipse cx="40" cy="40" rx="15" ry="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <ellipse cx="40" cy="40" rx="30" ry="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <line x1="10" y1="40" x2="70" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <line x1="40" y1="10" x2="40" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(200,190,255,0.4)" strokeWidth="1" />
      <rect x="0" y="35" width="80" height="10" fill="url(#gglow)" opacity="0.7" />
    </svg>
  );
}

// ─── Full Certificate Modal ───────────────────────────────
function CertificateModal({ data, issuedAt, onClose }) {
  const cert = data;
  const certColor = cert.color || "#5E6AD2";
  const certColor2 = cert.color2 || "#14B8A6";
  const issueDate = new Date(issuedAt || cert.issuedAt || cert.date || Date.now());
  const formattedDate = issueDate.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: "1rem",
        animation: "fadeIn .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 860, width: "100%",
          borderRadius: 20, overflow: "hidden",
          boxShadow: `0 30px 80px rgba(0,0,0,.7), 0 0 80px ${certColor}44`,
          position: "relative",
          /* Gradient border like cert 1 */
          background: `linear-gradient(135deg, ${certColor}, ${certColor2}, ${certColor})`,
          padding: 3,
        }}
      >
        <div style={{ borderRadius: 18, overflow: "hidden" }}>
          {/* ── Certificate body ── */}
          <div
            id="certificate-printable"
            className="cert-printable-body"
            style={{
              position: "relative",
              background: `
                radial-gradient(ellipse 90% 70% at 15% 15%, #262B45 0%, transparent 55%),
                radial-gradient(ellipse 70% 50% at 85% 85%, #0F2A27 0%, transparent 50%),
                linear-gradient(145deg, #0B0E14 0%, #0F1320 40%, #0B0E14 100%)
              `,
              color: "#F1F3F8",
              aspectRatio: "860 / 520",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Stars bg */}
            <div style={{
              position: "absolute", inset: 0, opacity: .3, pointerEvents: "none",
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'><g fill='%237C6EFF'><circle cx='20' cy='30' r='0.9'/><circle cx='170' cy='40' r='0.6'/><circle cx='260' cy='80' r='1'/><circle cx='40' cy='200' r='0.7'/><circle cx='230' cy='260' r='0.8'/><circle cx='100' cy='20' r='0.5'/><circle cx='280' cy='130' r='0.6'/></g><g fill='%2310D98A'><circle cx='60' cy='50' r='0.5'/><circle cx='210' cy='90' r='0.8'/><circle cx='30' cy='150' r='0.6'/><circle cx='240' cy='200' r='0.5'/><circle cx='130' cy='270' r='0.7'/></g></svg>")`,
              backgroundSize: "300px 300px",
            }} />

            {/* Geometric network lines (cert 1 style) */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12, pointerEvents: "none" }} viewBox="0 0 860 520" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="200" y2="150" stroke="#5E6AD2" strokeWidth="0.8" />
              <line x1="200" y1="150" x2="100" y2="300" stroke="#5E6AD2" strokeWidth="0.8" />
              <line x1="200" y1="150" x2="350" y2="80" stroke="#14B8A6" strokeWidth="0.8" />
              <line x1="860" y1="0" x2="660" y2="140" stroke="#5E6AD2" strokeWidth="0.8" />
              <line x1="660" y1="140" x2="760" y2="300" stroke="#5E6AD2" strokeWidth="0.8" />
              <line x1="660" y1="140" x2="500" y2="60" stroke="#14B8A6" strokeWidth="0.8" />
              <line x1="0" y1="520" x2="180" y2="380" stroke="#5E6AD2" strokeWidth="0.8" />
              <line x1="860" y1="520" x2="680" y2="380" stroke="#5E6AD2" strokeWidth="0.8" />
              <circle cx="200" cy="150" r="3" fill="#5E6AD2" opacity="0.6" />
              <circle cx="660" cy="140" r="3" fill="#5E6AD2" opacity="0.6" />
              <circle cx="180" cy="380" r="2.5" fill="#14B8A6" opacity="0.5" />
              <circle cx="680" cy="380" r="2.5" fill="#14B8A6" opacity="0.5" />
            </svg>

            {/* Corners */}
            <Corner style={{ top: 14, left: 14, transform: "rotate(0deg)" }} />
            <Corner style={{ top: 14, right: 14, transform: "rotate(90deg)" }} />
            <Corner style={{ bottom: 14, right: 14, transform: "rotate(180deg)" }} />
            <Corner style={{ bottom: 14, left: 14, transform: "rotate(270deg)" }} />

            {/* Top: Globe + Title */}
            <div style={{ textAlign: "center", marginBottom: 18, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <Globe size={72} />
              </div>
              <div style={{
                fontSize: 44, fontWeight: 900,
                fontFamily: "'Cinzel', Georgia, serif",
                letterSpacing: ".08em",
                background: `linear-gradient(135deg, #fff 0%, ${certColor} 50%, #fff 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: 4,
              }}>CERTIFICATE</div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 4,
              }}>
                <div style={{ height: 1, width: 60, background: `linear-gradient(90deg, transparent, ${certColor})` }} />
                <span style={{ fontSize: 12, letterSpacing: ".4em", color: "#8B92A8", fontFamily: "monospace", fontWeight: 600 }}>OF COMPLETION</span>
                <div style={{ height: 1, width: 60, background: `linear-gradient(90deg, ${certColor}, transparent)` }} />
              </div>
            </div>

            {/* Divider */}
            <div style={{
              height: 1, margin: "0 40px 22px",
              background: `linear-gradient(90deg, transparent 0%, ${certColor}AA 50%, transparent 100%)`,
            }} />

            {/* Body */}
            <div style={{ textAlign: "center", marginBottom: 24, padding: "0 20px" }}>
              <div style={{ fontSize: 11, color: "#8B92A8", letterSpacing: ".3em", fontFamily: "monospace", fontWeight: 600, marginBottom: 10 }}>
                THIS CERTIFICATE IS PROUDLY PRESENTED TO
              </div>
              <div style={{
                fontSize: 38, fontWeight: 800, color: "#fff",
                fontFamily: "Georgia, serif", letterSpacing: ".02em",
                marginBottom: 10,
                textShadow: `0 0 40px ${certColor}77`,
              }}>
                {cert.userName}
              </div>
              <p style={{
                fontSize: 13, lineHeight: 1.75, color: "#C7CCF0",
                fontFamily: "Georgia, serif", margin: "0 auto 10px",
                fontStyle: "italic", maxWidth: 540,
              }}>
                {cert.description}
              </p>

              {/* Motivational line (cert 1 style, purple/teal) */}
              <div style={{
                marginTop: 14,
                fontSize: 11, color: certColor, fontFamily: "monospace",
                fontWeight: 700, letterSpacing: ".12em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <span style={{ display: "inline-block", width: 18, height: 1, background: certColor, verticalAlign: "middle" }} />
                <span>●</span>
                <span>YOU DIDN'T JUST COMPLETE TASKS, YOU INVESTED IN YOURSELF</span>
                <span>●</span>
                <span style={{ display: "inline-block", width: 18, height: 1, background: certColor, verticalAlign: "middle" }} />
              </div>

              {cert.stats?.lifetime && (
                <div style={{
                  marginTop: 14, display: "inline-block", padding: "7px 20px",
                  background: `linear-gradient(135deg, ${certColor}22, ${certColor2}11)`,
                  border: `1px solid ${certColor}55`, borderRadius: 30,
                }}>
                  <span style={{ fontSize: 11, color: "#8B92A8", fontFamily: "monospace" }}>with </span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: certColor, fontFamily: "Georgia, serif" }}>{cert.stats.lifetime}</span>
                  <span style={{ fontSize: 11, color: "#8B92A8", fontFamily: "monospace" }}> tasks completed on Core System</span>
                </div>
              )}
              {cert.stats?.monthDone && (
                <div style={{
                  marginTop: 14, display: "inline-block", padding: "7px 20px",
                  background: `linear-gradient(135deg, ${certColor}22, ${certColor2}11)`,
                  border: `1px solid ${certColor}55`, borderRadius: 30,
                }}>
                  <span style={{ fontSize: 11, color: "#8B92A8", fontFamily: "monospace" }}>with </span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: certColor, fontFamily: "Georgia, serif" }}>{cert.stats.monthDone}</span>
                  <span style={{ fontSize: 11, color: "#8B92A8", fontFamily: "monospace" }}> tasks in {cert.stats.month}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto 1fr",
              alignItems: "flex-end", marginTop: 28, padding: "0 12px", gap: 12,
            }}>
              {/* Signature */}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 28, fontWeight: 700,
                  fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                  fontStyle: "italic", color: "#fff",
                  borderBottom: "1.5px solid rgba(255,255,255,.3)",
                  paddingBottom: 4, marginBottom: 8,
                  transform: "rotate(-2deg)",
                  textShadow: `0 0 16px ${certColor}88`,
                  display: "inline-block",
                }}>Basem Taha</div>
                <div style={{ fontSize: 9, color: "#8B92A8", letterSpacing: ".2em", fontFamily: "monospace", fontWeight: 600 }}>
                  FOUNDER · DARKBYTE
                </div>
              </div>

              {/* Stamp */}
              <DarkByteStamp size={108} color={certColor} />

              {/* Date */}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 15, color: "#fff", fontFamily: "monospace",
                  fontWeight: 700, borderBottom: "1.5px solid rgba(255,255,255,.3)",
                  paddingBottom: 4, marginBottom: 8, letterSpacing: ".1em",
                }}>{formattedDate}</div>
                <div style={{ fontSize: 9, color: "#8B92A8", letterSpacing: ".2em", fontFamily: "monospace", fontWeight: 600 }}>DATE ISSUED</div>
              </div>
            </div>

            {/* Cert ID */}
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 8, color: "#4B4870", fontFamily: "monospace", letterSpacing: ".25em" }}>
              CERT ID: {(cert.id || "preview").toUpperCase()} · VERIFIED BY DARKBYTE × CORE SYSTEM
            </div>
          </div>

          {/* Modal actions */}
          <div style={{
            padding: "14px 20px", display: "flex", gap: 8, justifyContent: "space-between",
            background: "var(--surface)", borderTop: "1px solid var(--border)",
          }}>
            <button onClick={onClose} style={{
              padding: "10px 18px", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)", background: "var(--bg)",
              color: "var(--text)", fontSize: 13, fontWeight: 600,
            }}>Close</button>
            <button onClick={() => window.print()} style={{
              padding: "10px 20px", borderRadius: "var(--radius-sm)", border: "none",
              background: `linear-gradient(135deg, ${certColor}, ${certColor2})`,
              color: "#fff", fontSize: 13, fontWeight: 700,
              boxShadow: `0 4px 16px ${certColor}66`,
            }}>🖨 Print / Save PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
