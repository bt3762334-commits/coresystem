import { useState, useMemo, useCallback } from "react";
import { useStorage } from "./hooks/useStorage";
import { flatTasks, today } from "./utils/helpers";
import { getSession, logout } from "./utils/auth";
import D3Background      from "./components/D3Background";
import EisenhowerMatrix  from "./components/EisenhowerMatrix";
import PomodoroTimer     from "./components/PomodoroTimer";
import AICoach           from "./components/AICoach";
import Analytics         from "./components/Analytics";
import Certificates      from "./components/Certificates";
import DailyReflection   from "./components/DailyReflection";
import DailyQuote        from "./components/DailyQuote";
import AuthScreen        from "./components/AuthScreen";

const NAV = [
  { id: "matrix",       icon: "⊞",  label: "المصفوفة"   },
  { id: "pomodoro",     icon: "⏱",  label: "بومودورو"   },
  { id: "coach",        icon: "🤖",  label: "AI Coach"   },
  { id: "analytics",    icon: "📊",  label: "تحليلات"   },
  { id: "certificates", icon: "🎓",  label: "شهاداتي"   },
  { id: "reflection",   icon: "📝",  label: "تأمل يومي" },
];

const EMPTY_TASKS = { q1: [], q2: [], q3: [], q4: [] };

export default function App() {
  const [session, setSession] = useState(() => getSession());
  const [tab, setTab]         = useState("matrix");

  if (!session) {
    return (
      <>
        <D3Background />
        <AuthScreen onSuccess={setSession} />
      </>
    );
  }

  return <AuthenticatedApp session={session} setSession={setSession} tab={tab} setTab={setTab} />;
}

function AuthenticatedApp({ session, setSession, tab, setTab }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const [tasks,        setTasks]        = useStorage("cs_tasks",        EMPTY_TASKS,                            session);
  const [streak,       setStreak]       = useStorage("cs_streak",       { count: 0, lastDate: null, history: {} }, session);
  const [reflections,  setReflections]  = useStorage("cs_reflections",  {},                                     session);
  const [certificates, setCertificates] = useStorage("cs_certificates", [],                                     session);

  const todayStr = today();
  const [completedToday, setCompletedToday] = useStorage("cs_today", { date: todayStr, count: 0 }, session);

  const activeCT = completedToday.date === todayStr
    ? completedToday
    : { date: todayStr, count: 0 };

  const handleDone = useCallback((q, id) => {
    setTasks((prev) => {
      const updated = { ...prev };
      updated[q] = updated[q].map((t) => {
        if (t.id !== id) return t;
        const nowDone = !t.done;
        if (nowDone) {
          setCompletedToday((c) => ({ ...c, count: c.count + 1 }));
          updateStreak();
        } else {
          setCompletedToday((c) => ({ ...c, count: Math.max(0, c.count - 1) }));
        }
        return { ...t, done: nowDone };
      });
      return updated;
    });
  }, []);

  const handleAdd = useCallback((q, task) => {
    setTasks((prev) => ({ ...prev, [q]: [...prev[q], task] }));
  }, []);

  const handleAddMany = useCallback((distributed) => {
    setTasks((prev) => {
      const next = { ...prev };
      Object.entries(distributed).forEach(([q, items]) => {
        next[q] = [...(next[q] || []), ...items];
      });
      return next;
    });
  }, []);

  const handleDelete = useCallback((q, id) => {
    setTasks((prev) => ({ ...prev, [q]: prev[q].filter((t) => t.id !== id) }));
  }, []);

  function updateStreak() {
    setStreak((prev) => {
      if (prev.lastDate === todayStr) return prev;
      const yesterday = new Date(Date.now() - 86_400_000).toDateString();
      const newCount  = prev.lastDate === yesterday ? prev.count + 1 : 1;
      const history   = { ...(prev.history || {}) };
      history[todayStr] = (history[todayStr] || 0) + 1;
      return { count: newCount, lastDate: todayStr, history };
    });
  }

  function handleLogout() {
    if (!window.confirm("متأكد إنك عايز تسجّل خروج؟")) return;
    logout();
    setSession(null);
  }

  function handleNavClick(id) {
    setTab(id);
    setMenuOpen(false);
  }

  const allTasks  = useMemo(() => flatTasks(tasks), [tasks]);
  const doneCount = allTasks.filter((t) => t.done).length;
  const total     = allTasks.length;

  const stats = [
    { icon: "🔥", val: streak.count + " يوم" },
    { icon: "✅", val: doneCount + "/" + total },
    { icon: "⚡", val: activeCT.count + " اليوم" },
  ];

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <D3Background />

      {/* Header */}
      <header className="app-header" style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "linear-gradient(135deg, #6C63FF 0%, #5548E8 50%, #4338CA 100%)",
        boxShadow: "0 4px 32px rgba(108,99,255,.5)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.25rem" }}>

          {/* Top row */}
          <div className="app-top" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: 68, gap: 12,
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13,
                background: "rgba(255,255,255,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>⊞</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>Core System</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.7)" }}>AI PRODUCTIVITY OS</div>
              </div>
            </div>

            {/* Desktop: pills + user */}
            <div className="app-pills-desktop" style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <DailyQuote compact />
              {stats.map((s, i) => (
                <span key={i} style={{
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.25)",
                  borderRadius: 20, padding: "4px 12px",
                  fontSize: 12, color: "#fff",
                }}>
                  {s.icon} <strong>{s.val}</strong>
                </span>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(255,255,255,.25)",
                  border: "2px solid rgba(255,255,255,.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 15, fontWeight: 700,
                }}>{session.avatar}</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{session.name}</span>
                  <button onClick={handleLogout} style={{
                    background: "none", border: "none", padding: 0,
                    fontSize: 10, color: "rgba(255,255,255,.7)",
                    textDecoration: "underline",
                  }}>تسجيل خروج</button>
                </div>
              </div>
            </div>

            {/* Mobile: avatar + hamburger */}
            <div className="app-mobile-right" style={{ display: "none", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,.25)",
                border: "2px solid rgba(255,255,255,.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>{session.avatar}</div>
              <button
                onClick={() => setMenuOpen((p) => !p)}
                style={{
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.3)",
                  borderRadius: 10, width: 38, height: 38,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 5,
                  cursor: "pointer",
                }}
              >
                {menuOpen ? (
                  <span style={{ color: "#fff", fontSize: 20, lineHeight: 1 }}>✕</span>
                ) : (
                  <>
                    <span style={{ display: "block", width: 18, height: 2, background: "#fff", borderRadius: 2 }} />
                    <span style={{ display: "block", width: 18, height: 2, background: "#fff", borderRadius: 2 }} />
                    <span style={{ display: "block", width: 18, height: 2, background: "#fff", borderRadius: 2 }} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Desktop nav tabs */}
          <nav className="app-nav-desktop" style={{ display: "flex", gap: 2, overflowX: "auto" }}>
            {NAV.map((n) => (
              <button key={n.id} onClick={() => handleNavClick(n.id)} style={{
                padding: "10px 18px", border: "none",
                background: tab === n.id ? "rgba(255,255,255,.2)" : "transparent",
                fontSize: 13, fontWeight: tab === n.id ? 700 : 400,
                color: tab === n.id ? "#fff" : "rgba(255,255,255,.7)",
                borderRadius: tab === n.id ? "10px 10px 0 0" : 0,
                borderBottom: tab === n.id ? "2.5px solid #fff" : "2.5px solid transparent",
                display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer",
              }}>
                <span>{n.icon}</span> {n.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="app-mobile-menu" style={{
            background: "rgba(53,40,200,.97)",
            borderTop: "1px solid rgba(255,255,255,.15)",
            padding: "12px 16px 16px",
          }}>
            {/* Stats */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {stats.map((s, i) => (
                <span key={i} style={{
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 16, padding: "5px 12px",
                  fontSize: 12, color: "#fff",
                }}>{s.icon} <strong>{s.val}</strong></span>
              ))}
            </div>

            {/* Nav items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {NAV.map((n) => (
                <button key={n.id} onClick={() => handleNavClick(n.id)} style={{
                  padding: "11px 14px", borderRadius: 10, border: "none",
                  background: tab === n.id ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.06)",
                  color: "#fff", fontSize: 14, fontWeight: tab === n.id ? 700 : 400,
                  display: "flex", alignItems: "center", gap: 10,
                  textAlign: "right", cursor: "pointer",
                  borderRight: tab === n.id ? "3px solid #fff" : "3px solid transparent",
                }}>
                  <span style={{ fontSize: 18 }}>{n.icon}</span>
                  <span>{n.label}</span>
                  {tab === n.id && (
                    <span style={{ marginRight: "auto", fontSize: 11, opacity: .7 }}>● الآن</span>
                  )}
                </button>
              ))}
            </div>

            {/* Logout */}
            <button onClick={handleLogout} style={{
              marginTop: 12, width: "100%", padding: "10px 14px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,.2)",
              background: "rgba(239,68,68,.15)",
              color: "#FCA5A5", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              cursor: "pointer",
            }}>
              🚪 تسجيل خروج — {session.name}
            </button>
          </div>
        )}
      </header>

      {/* Overlay to close menu */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 49,
            background: "rgba(0,0,0,.4)",
          }}
        />
      )}

      <main style={{
        position: "relative", zIndex: 1,
        maxWidth: 1200, margin: "0 auto", padding: "1.25rem 1rem",
      }}>
        <div key={tab} className="fade-in">
          {tab === "matrix"       && <EisenhowerMatrix tasks={tasks} onDone={handleDone} onAdd={handleAdd} onDelete={handleDelete} />}
          {tab === "pomodoro"     && <PomodoroTimer tasks={allTasks.filter(t => !t.done)} onComplete={updateStreak} session={session} />}
          {tab === "coach"        && <AICoach tasks={tasks} streak={streak} completedToday={activeCT} onDistributeTasks={handleAddMany} />}
          {tab === "analytics"    && <Analytics tasks={tasks} streak={streak} completedToday={activeCT} />}
          {tab === "certificates" && <Certificates session={session} tasks={tasks} streak={streak} completedToday={activeCT} certificates={certificates} onIssue={cert => setCertificates(p => [cert, ...p])} />}
          {tab === "reflection"   && <DailyReflection streak={streak} completedToday={activeCT} tasks={allTasks} reflections={reflections} setReflections={setReflections} />}
        </div>
      </main>

      <style>{`
        @media (max-width: 720px) {
          .app-pills-desktop { display: none !important; }
          .app-nav-desktop   { display: none !important; }
          .app-mobile-right  { display: flex !important; }
        }
        @media (min-width: 721px) {
          .app-mobile-menu  { display: none !important; }
          .app-mobile-right { display: none !important; }
        }
        @media (max-width: 480px) {
          main { padding: 1rem .75rem !important; }
        }
        .matrix-grid {
          grid-template-columns: 1fr !important;
        }
        @media (max-width: 720px) {
          .matrix-grid > div { grid-column: 1 !important; grid-row: auto !important; }
          .matrix-grid > div:nth-child(3) {
            writing-mode: horizontal-tb !important;
            transform: none !important;
            border-inline-end: none !important;
            border-bottom: 2px solid var(--border);
            padding-inline-end: 0 !important;
            padding: 8px 0;
          }
        }
      `}</style>
    </div>
  );
}
