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
import Footer            from "./components/Footer";

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
    setTasks((prev) => {
      // Prevent duplicates
      const exists = (prev[q] || []).some(t => t.text.trim().toLowerCase() === task.text.trim().toLowerCase());
      if (exists) return prev;
      return { ...prev, [q]: [...(prev[q] || []), task] };
    });
  }, []);

  const handleAddMany = useCallback((distributed) => {
    setTasks((prev) => {
      const next = { q1: [...prev.q1], q2: [...prev.q2], q3: [...prev.q3], q4: [...prev.q4] };
      Object.entries(distributed).forEach(([q, items]) => {
        if (!items || items.length === 0) return;
        items.forEach((item) => {
          // Prevent duplicates
          const exists = next[q].some(t => t.text.trim().toLowerCase() === item.text.trim().toLowerCase());
          if (!exists) {
            next[q] = [...next[q], item];
          }
        });
      });
      return next;
    });
  }, []);

  const handleDelete = useCallback((q, id) => {
    setTasks((prev) => ({ ...prev, [q]: prev[q].filter((t) => t.id !== id) }));
  }, []);

  // Edit task: supports moving to a different quadrant
  const handleEdit = useCallback((originalQ, updatedTask, newQ) => {
    setTasks((prev) => {
      const next = {
        q1: [...prev.q1],
        q2: [...prev.q2],
        q3: [...prev.q3],
        q4: [...prev.q4],
      };

      if (originalQ === newQ) {
        // Same quadrant: just update
        next[originalQ] = next[originalQ].map(t =>
          t.id === updatedTask.id ? { ...t, ...updatedTask } : t
        );
      } else {
        // Different quadrant: remove from old, add to new
        next[originalQ] = next[originalQ].filter(t => t.id !== updatedTask.id);
        next[newQ] = [...next[newQ], { ...updatedTask }];
      }

      return next;
    });
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
      <header className="app-header glass" style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,12,18,.85)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 0 rgba(255,255,255,.03), 0 12px 32px rgba(0,0,0,.35)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.25rem" }}>

          {/* Top row */}
          <div className="app-top" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: 64, gap: 12,
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "linear-gradient(145deg, var(--purple), #4F5BC4)",
                boxShadow: "0 4px 16px rgba(94,106,210,.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, color: "#fff",
              }}>⊞</div>
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>Core System</div>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: "var(--text-3)", letterSpacing: ".07em" }}>AI PRODUCTIVITY OS</div>
              </div>
            </div>

            {/* Desktop: pills + user */}
            <div className="app-pills-desktop" style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <DailyQuote compact />
              {stats.map((s, i) => (
                <span key={i} style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 20, padding: "4px 12px",
                  fontSize: 12, color: "var(--text-2)",
                }}>
                  {s.icon} <strong style={{ color: "var(--text)" }}>{s.val}</strong>
                </span>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingInlineStart: 8, borderInlineStart: "1px solid var(--border)" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(145deg, var(--purple), #4F5BC4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>{session.avatar}</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{session.name}</span>
                  <button onClick={handleLogout} style={{
                    background: "none", border: "none", padding: 0,
                    fontSize: 10, color: "var(--text-3)",
                    textAlign: "start", cursor: "pointer",
                  }}>تسجيل خروج</button>
                </div>
              </div>
            </div>

            {/* Mobile: avatar only */}
            <div className="app-mobile-right" style={{ display: "none", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(145deg, var(--purple), #4F5BC4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 12.5, fontWeight: 700, flexShrink: 0,
              }}>{session.avatar}</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{session.name}</span>
            </div>
          </div>

          {/* Desktop nav tabs */}
          <nav className="app-nav-desktop" style={{ display: "flex", gap: 2, overflowX: "auto" }}>
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setTab(n.id)} style={{
                padding: "10px 16px", border: "none",
                background: "transparent",
                fontSize: 13, fontWeight: tab === n.id ? 700 : 500,
                color: tab === n.id ? "var(--text)" : "var(--text-3)",
                borderBottom: tab === n.id ? "2px solid var(--purple)" : "2px solid transparent",
                display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer",
              }}>
                <span>{n.icon}</span> {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="app-bottom-nav" style={{ display: "none" }}>
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            flex: 1, border: "none", background: "none",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 3, padding: "6px 2px", cursor: "pointer",
            color: tab === n.id ? "var(--purple-dk)" : "var(--text-3)",
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{n.icon}</span>
            <span style={{
              fontSize: 9, fontWeight: tab === n.id ? 700 : 400,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: 50,
            }}>{n.label}</span>
            {tab === n.id && (
              <span style={{
                width: 4, height: 4, borderRadius: "50%",
                background: "var(--purple)", display: "block",
              }} />
            )}
          </button>
        ))}
      </nav>

      <main className="app-main" style={{
        position: "relative", zIndex: 1,
        maxWidth: 1200, margin: "0 auto", padding: "1.25rem 1rem",
      }}>
        <div key={tab} className="fade-in">
          {tab === "matrix"       && (
            <EisenhowerMatrix
              tasks={tasks}
              onDone={handleDone}
              onAdd={handleAdd}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
          {tab === "pomodoro"     && <PomodoroTimer tasks={allTasks.filter(t => !t.done)} onComplete={updateStreak} session={session} />}
          {tab === "coach"        && <AICoach tasks={tasks} streak={streak} completedToday={activeCT} onDistributeTasks={handleAddMany} />}
          {tab === "analytics"    && <Analytics tasks={tasks} streak={streak} completedToday={activeCT} />}
          {tab === "certificates" && (
            <Certificates
              session={session}
              tasks={tasks}
              streak={streak}
              completedToday={activeCT}
              certificates={certificates}
              onIssue={cert => setCertificates(p => [cert, ...p])}
            />
          )}
          {tab === "reflection"   && (
            <DailyReflection
              streak={streak}
              completedToday={activeCT}
              tasks={allTasks}
              reflections={reflections}
              setReflections={setReflections}
            />
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        .fade-in {
          animation: fadeInUp .25s ease both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 720px) {
          .app-pills-desktop { display: none !important; }
          .app-nav-desktop   { display: none !important; }
          .app-mobile-right  { display: flex !important; }
          .app-bottom-nav {
            display: flex !important;
            position: fixed; bottom: 0; left: 0; right: 0;
            z-index: 100;
            background: rgba(10, 12, 18, 0.94);
            backdrop-filter: blur(20px) saturate(140%);
            -webkit-backdrop-filter: blur(20px) saturate(140%);
            border-top: 1px solid var(--border);
            box-shadow: 0 -4px 24px rgba(0,0,0,.45);
            height: 60px;
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
          .app-main { padding-bottom: 72px !important; }
        }
        @media (min-width: 721px) {
          .app-mobile-right { display: none !important; }
          .app-bottom-nav   { display: none !important; }
        }
        @media (max-width: 480px) {
          .app-main { padding: .875rem .625rem 72px !important; }
        }
      `}</style>
    </div>
  );
}
