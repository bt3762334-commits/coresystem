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
    color: "#7C6EFF",
    color2: "#10D98A",
  },
  {
    id: "first50",
    title: "Half-Century Achiever",
    subtitle: "إنجاز الـ 50",
    description: "for reaching 50 completed tasks — a milestone that reflects your commitment and discipline.",
    icon: "🥉",
    required: 50,
    color: "#7C6EFF",
    color2: "#10D98A",
  },
  {
    id: "first100",
    title: "Century Master",
    subtitle: "سيد الـ 100",
    description: "for completing 100 tasks. This achievement reflects your dedication to personal growth and consistency.",
    icon: "🥈",
    required: 100,
    color: "#7C6EFF",
    color2: "#10D98A",
  },
  {
    id: "monthly",
    title: "Monthly Excellence",
    subtitle: "تميز شهري",
    description: "for achieving 30 tasks within a single month — proving that consistency builds greatness.",
    icon: "📅",
    required: 30,
    color: "#7C6EFF",
    color2: "#10D98A",
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
      <div className="divine-card" style={{
        padding: "28px 32px",
        color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: .12,
          backgroundImage: "radial-gradient(circle at 20% 20%, #7C6EFF 0%, transparent 50%), radial-gradient(circle at 80% 80%, #10D98A 0%, transparent 50%)",
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
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{lifetime}</div>
              <div style={{ fontSize: 11, opacity: .8 }}>tasks done</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{monthDone}</div>
              <div style={{ fontSize: 11, opacity: .8 }}>this month</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{issued.size}</div>
              <div style={{ fontSize: 11, opacity: .8 }}>certificates earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates grid */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--text)", letterSpacing: ".04em" }}>
          🏅 AVAILABLE CERTIFICATES
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 14,
        }}>
          {TEMPLATES.map((tpl) => {
            const current = tpl.monthly ? monthDone : lifetime;
            const pct = Math.min(100, (current / tpl.required) * 100);
            const earned = earnedIds.has(tpl.id);
            const alreadyIssued = issued.has(tpl.id);

            return (
              <div key={tpl.id} className="slide-up" style={{
                background: "var(--surface)",
                border: `1px solid ${earned ? tpl.color + "66" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                padding: 18,
                boxShadow: earned ? "var(--shadow-md)" : "var(--shadow)",
                position: "relative",
                overflow: "hidden",
              }}>
                {earned && (
                  <div style={{
                    position: "absolute", top: 12, left: 12,
                    fontSize: 10, fontWeight: 800, color: "#fff",
                    background: `linear-gradient(135deg, ${tpl.color}, ${tpl.color2})`,
                    padding: "3px 10px", borderRadius: 20,
                    letterSpacing: ".08em",
                  }}>✓ QUALIFIED</div>
                )}

                <div style={{ fontSize: 36, marginBottom: 8, filter: earned ? "none" : "grayscale(0.4) opacity(0.7)" }}>
                  {tpl.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2, color: "var(--text)" }}>
                  {tpl.subtitle}
                </div>
                <div style={{
                  fontSize: 10, color: tpl.color, fontWeight: 700,
                  marginBottom: 8, letterSpacing: ".12em",
                  textTransform: "uppercase",
                }}>
                  {tpl.title}
                </div>
                <p style={{
                  fontSize: 11, color: "var(--text-2)",
                  lineHeight: 1.55, margin: "0 0 14px",
                }}>
                  {tpl.description}
                </p>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-2)" }}>
                      {current} / {tpl.required} {tpl.monthly ? "tasks/month" : "tasks"}
                    </span>
                    <span style={{ color: tpl.color, fontWeight: 800 }}>{Math.round(pct)}%</span>
                  </div>
                  <div style={{
                    height: 6, background: "var(--bg)",
                    borderRadius: 3, overflow: "hidden", border: "1px solid var(--border)",
                  }}>
                    <div style={{
                      height: "100%",
                      width: pct + "%",
                      background: `linear-gradient(90deg, ${tpl.color}, ${tpl.color2})`,
                      borderRadius: 3,
                      transition: "width .6s ease",
                      boxShadow: earned ? `0 0 12px ${tpl.color}88` : "none",
                    }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setPreviewing({ tpl, earned })}
                    style={{
                      flex: 1, padding: "9px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)", fontSize: 12, fontWeight: 600,
                    }}
                  >👁 Preview</button>
                  <button
                    onClick={() => handleIssue(tpl)}
                    disabled={!earned || alreadyIssued}
                    style={{
                      flex: 1, padding: "9px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: !earned || alreadyIssued
                        ? "var(--border-2)"
                        : `linear-gradient(135deg, ${tpl.color}, ${tpl.color2})`,
                      color: !earned || alreadyIssued ? "var(--text-2)" : "#fff",
                      fontSize: 12, fontWeight: 700,
                      boxShadow: !earned || alreadyIssued ? "none" : `0 4px 14px ${tpl.color}55`,
                    }}
                  >
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
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 14,
          }}>
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
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: 0, textAlign: "start",
      overflow: "hidden", boxShadow: "var(--shadow)",
      cursor: "pointer", position: "relative",
    }}>
      <div style={{
        height: 140,
        background: `linear-gradient(135deg, #0D0B1E 0%, #1A1740 50%, #110F26 100%)`,
        borderBottom: `2px solid ${cert.color || "#7C6EFF"}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: .25,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${cert.color}55 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, ${cert.color2}44 0%, transparent 40%)
          `,
        }} />
        <div style={{
          position: "absolute", inset: 0, opacity: .15,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='20' cy='30' r='1' fill='%237C6EFF'/><circle cx='70' cy='40' r='0.8' fill='%2310D98A'/><circle cx='40' cy='80' r='1' fill='%237C6EFF'/><circle cx='85' cy='20' r='0.6' fill='%2310D98A'/><circle cx='15' cy='60' r='0.8' fill='%237C6EFF'/></svg>")`,
          backgroundSize: "200px 200px",
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

// ─── DarkByte Stamp SVG ──────────────────────────────────
function DarkByteStamp({ size = 100, color = "#7C6EFF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <path id="dbcircle" d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" />
        <linearGradient id="dbgrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C6EFF" />
          <stop offset="100%" stopColor="#10D98A" />
        </linearGradient>
      </defs>
      {/* Outer rings */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#dbgrad)" strokeWidth="2" />
      <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />
      {/* Curved text top */}
      <text fontSize="7" fontWeight="800" fill="url(#dbgrad)" letterSpacing="2.5" fontFamily="monospace">
        <textPath href="#dbcircle" startOffset="2%">
          ★ DARKBYTE ★ CERTIFIED ★
        </textPath>
      </text>
      {/* Center mark */}
      <g transform="translate(50, 50)">
        <polygon
          points="0,-16 5,-5 16,-5 7,3 10,15 0,8 -10,15 -7,3 -16,-5 -5,-5"
          fill="url(#dbgrad)" opacity="0.9"
        />
        <text x="0" y="3" textAnchor="middle" fontSize="7" fontWeight="900" fill="#0D0B1E"
          fontFamily="monospace" letterSpacing="0.5">DB</text>
      </g>
      {/* Splatter */}
      <circle cx="14" cy="22" r="1.2" fill={color} opacity="0.4" />
      <circle cx="86" cy="78" r="1" fill={color} opacity="0.5" />
      <circle cx="12" cy="78" r="0.8" fill={color} opacity="0.3" />
      <circle cx="88" cy="22" r="1.1" fill={color} opacity="0.4" />
    </svg>
  );
}

// ─── Full Certificate Modal (Dark style) ──────────────────
function CertificateModal({ data, issuedAt, onClose }) {
  const cert = data;
  const certColor = cert.color || "#7C6EFF";
  const certColor2 = cert.color2 || "#10D98A";
  const issueDate = new Date(issuedAt || cert.issuedAt || cert.date || Date.now());

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: "1.5rem 1rem",
        animation: "fadeIn .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-up"
        style={{
          maxWidth: 880, width: "100%",
          background: "linear-gradient(145deg, #0D0B1E 0%, #1A1740 50%, #0D0B1E 100%)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: `0 30px 80px rgba(0,0,0,.6), 0 0 60px ${certColor}33`,
          position: "relative",
        }}
      >
        {/* The certificate itself */}
        <div
          id="certificate-printable"
          style={{
            position: "relative",
            background: `
              radial-gradient(ellipse 80% 60% at 20% 20%, ${certColor}22 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 80%, ${certColor2}1A 0%, transparent 50%),
              linear-gradient(135deg, #0D0B1E 0%, #14112E 50%, #0D0B1E 100%)
            `,
            padding: "44px 48px",
            color: "#EAE8FF",
            minHeight: 540,
            overflow: "hidden",
          }}
        >
          {/* Stars background */}
          <div style={{
            position: "absolute", inset: 0, opacity: .25, pointerEvents: "none",
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><g fill='%237C6EFF'><circle cx='20' cy='30' r='0.8'/><circle cx='170' cy='40' r='0.6'/><circle cx='40' cy='160' r='1'/><circle cx='180' cy='170' r='0.7'/><circle cx='100' cy='20' r='0.5'/><circle cx='90' cy='180' r='0.6'/></g><g fill='%2310D98A'><circle cx='60' cy='50' r='0.5'/><circle cx='150' cy='90' r='0.8'/><circle cx='30' cy='100' r='0.6'/><circle cx='160' cy='150' r='0.5'/><circle cx='80' cy='140' r='0.7'/></g></svg>")`,
            backgroundSize: "300px 300px",
          }} />

          {/* Geometric corner decorations */}
          {[
            { top: 12, left: 12, rotate: 0 },
            { top: 12, right: 12, rotate: 90 },
            { bottom: 12, right: 12, rotate: 180 },
            { bottom: 12, left: 12, rotate: 270 },
          ].map((c, i) => (
            <svg key={i} width="60" height="60" viewBox="0 0 60 60" style={{
              position: "absolute",
              top: c.top, left: c.left, right: c.right, bottom: c.bottom,
              transform: `rotate(${c.rotate}deg)`,
              opacity: 0.6,
            }}>
              <path d="M 4 4 L 50 4 M 4 4 L 4 50 M 4 4 L 24 4 M 4 4 L 4 24"
                stroke={certColor} strokeWidth="1.5" fill="none" />
              <circle cx="4" cy="4" r="3" fill={certColor} />
              <circle cx="24" cy="4" r="1.5" fill={certColor2} />
              <circle cx="4" cy="24" r="1.5" fill={certColor2} />
            </svg>
          ))}

          {/* Top line */}
          <div style={{ textAlign: "center", marginBottom: 20, position: "relative" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 4,
            }}>
              <div style={{ width: 30, height: 1, background: `linear-gradient(90deg, transparent, ${certColor})` }} />
              <div style={{ fontSize: 9, letterSpacing: ".35em", color: certColor, fontFamily: "monospace", fontWeight: 700 }}>
                ★ OFFICIAL CERTIFICATE ★
              </div>
              <div style={{ width: 30, height: 1, background: `linear-gradient(90deg, ${certColor}, transparent)` }} />
            </div>
            <div style={{
              fontSize: 38, fontWeight: 900, color: "#fff",
              fontFamily: "'Cinzel', Georgia, serif",
              letterSpacing: ".04em",
              marginBottom: 4,
              background: `linear-gradient(135deg, #fff 0%, ${certColor} 50%, #fff 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              CERTIFICATE
            </div>
            <div style={{
              fontSize: 12, color: "#8B87C0", letterSpacing: ".4em",
              fontFamily: "monospace", fontWeight: 600,
            }}>
              OF COMPLETION
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: 1, margin: "0 40px 24px",
            background: `linear-gradient(90deg, transparent 0%, ${certColor}AA 50%, transparent 100%)`,
          }} />

          {/* Body */}
          <div style={{ textAlign: "center", marginBottom: 28, padding: "0 24px" }}>
            <div style={{
              fontSize: 11, color: "#8B87C0", letterSpacing: ".3em",
              fontFamily: "monospace", fontWeight: 600, marginBottom: 12,
            }}>
              THIS CERTIFICATE IS PROUDLY PRESENTED TO
            </div>
            <div style={{
              fontSize: 36, fontWeight: 800, color: "#fff",
              fontFamily: "Georgia, serif", letterSpacing: ".02em",
              marginBottom: 8,
              textShadow: `0 0 30px ${certColor}66`,
            }}>
              {cert.userName}
            </div>
            <div style={{
              fontSize: 11, color: certColor, letterSpacing: ".25em",
              fontFamily: "monospace", fontWeight: 600, marginBottom: 16,
            }}>
              FOR SUCCESSFULLY COMPLETING
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.75, color: "#C4C0FF",
              fontFamily: "Georgia, serif", margin: 0, fontStyle: "italic",
              maxWidth: 560, marginLeft: "auto", marginRight: "auto",
            }}>
              "{cert.description}"
            </p>
            {cert.stats?.lifetime && (
              <div style={{
                marginTop: 18, display: "inline-block", padding: "8px 20px",
                background: `linear-gradient(135deg, ${certColor}22, ${certColor2}11)`,
                border: `1px solid ${certColor}55`,
                borderRadius: 30,
              }}>
                <span style={{ fontSize: 11, color: "#8B87C0", fontFamily: "monospace" }}>
                  with{" "}
                </span>
                <span style={{
                  fontSize: 22, fontWeight: 800, color: certColor,
                  fontFamily: "Georgia, serif", fontVariantNumeric: "tabular-nums",
                }}>
                  {cert.stats.lifetime}
                </span>
                <span style={{ fontSize: 11, color: "#8B87C0", fontFamily: "monospace" }}>
                  {" "}tasks completed on Core System
                </span>
              </div>
            )}
            {cert.stats?.monthDone && (
              <div style={{
                marginTop: 18, display: "inline-block", padding: "8px 20px",
                background: `linear-gradient(135deg, ${certColor}22, ${certColor2}11)`,
                border: `1px solid ${certColor}55`,
                borderRadius: 30,
              }}>
                <span style={{ fontSize: 11, color: "#8B87C0", fontFamily: "monospace" }}>
                  with{" "}
                </span>
                <span style={{
                  fontSize: 22, fontWeight: 800, color: certColor,
                  fontFamily: "Georgia, serif", fontVariantNumeric: "tabular-nums",
                }}>
                  {cert.stats.monthDone}
                </span>
                <span style={{ fontSize: 11, color: "#8B87C0", fontFamily: "monospace" }}>
                  {" "}tasks in {cert.stats.month}
                </span>
              </div>
            )}
          </div>

          {/* Motivational line */}
          <div style={{ textAlign: "center", marginBottom: 24, padding: "0 20px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 10.5, color: certColor, fontFamily: "monospace",
              fontWeight: 700, letterSpacing: ".15em",
            }}>
              <span style={{ width: 30, height: 1, background: `linear-gradient(90deg, transparent, ${certColor}AA)` }} />
              <span>★</span>
              <span>YOU DIDN'T JUST COMPLETE TASKS, YOU INVESTED IN YOURSELF</span>
              <span>★</span>
              <span style={{ width: 30, height: 1, background: `linear-gradient(90deg, ${certColor}AA, transparent)` }} />
            </div>
          </div>

          {/* Footer: signature + stamp + date */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr auto 1fr",
            alignItems: "flex-end", marginTop: 32, padding: "0 8px",
            gap: 16,
          }}>
            {/* Signature */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 26, fontWeight: 700,
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                fontStyle: "italic", color: "#fff",
                borderBottom: "1.5px solid rgba(255,255,255,.3)",
                paddingBottom: 4, marginBottom: 8,
                transform: "rotate(-2deg)",
                textShadow: `0 0 12px ${certColor}88`,
              }}>
                Basem Taha
              </div>
              <div style={{
                fontSize: 9, color: "#8B87C0", letterSpacing: ".2em",
                fontFamily: "monospace", fontWeight: 600,
              }}>
                FOUNDER · DARKBYTE
              </div>
            </div>

            {/* Stamp */}
            <div style={{ position: "relative" }}>
              <DarkByteStamp size={110} color={certColor} />
            </div>

            {/* Date */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 14, color: "#fff", fontFamily: "monospace",
                fontWeight: 700, borderBottom: "1.5px solid rgba(255,255,255,.3)",
                paddingBottom: 4, marginBottom: 8, letterSpacing: ".12em",
              }}>
                {issueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
              </div>
              <div style={{
                fontSize: 9, color: "#8B87C0", letterSpacing: ".2em",
                fontFamily: "monospace", fontWeight: 600,
              }}>
                DATE ISSUED
              </div>
            </div>
          </div>

          {/* Cert ID */}
          <div style={{
            textAlign: "center", marginTop: 22,
            fontSize: 8, color: "#4B4870", fontFamily: "monospace",
            letterSpacing: ".25em",
          }}>
            CERT ID: {(cert.id || "preview").toUpperCase()} · VERIFIED BY DARKBYTE × CORE SYSTEM
          </div>
        </div>

        {/* Modal actions */}
        <div style={{
          padding: "16px 20px",
          display: "flex", gap: 8, justifyContent: "space-between",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
        }}>
          <button onClick={onClose} style={{
            padding: "10px 18px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)", background: "var(--bg)",
            color: "var(--text)", fontSize: 13, fontWeight: 600,
          }}>Close</button>
          <button onClick={() => window.print()} style={{
            padding: "10px 20px", borderRadius: "var(--radius-sm)",
            border: "none",
            background: `linear-gradient(135deg, ${certColor}, ${certColor2})`,
            color: "#fff", fontSize: 13, fontWeight: 700,
            boxShadow: `0 4px 16px ${certColor}66`,
          }}>🖨 Print / Save PDF</button>
        </div>
      </div>
    </div>
  );
}
