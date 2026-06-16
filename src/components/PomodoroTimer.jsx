import { useState, useEffect, useRef } from "react";
import { formatTime } from "../utils/helpers";
import { useStorage } from "../hooks/useStorage";

const MODES = [
  { key: "work",  label: "تركيز",      mins: 25, color: "#6C63FF" },
  { key: "short", label: "راحة قصيرة", mins: 5,  color: "#10B981" },
  { key: "long",  label: "راحة طويلة", mins: 15, color: "#F59E0B" },
];

export default function PomodoroTimer({ tasks, onComplete, session }) {
  const [modeIdx, setModeIdx]     = useState(0);
  const [secs, setSecs]           = useState(MODES[0].mins * 60);
  const [running, setRunning]     = useState(false);
  const [cycles, setCycles]       = useState(0);
  const [selected, setSelected]   = useState("");
  const [log, setLog]             = useStorage("cs_pomo_log", [], session);
  const timerRef                  = useRef(null);
  const mode                      = MODES[modeIdx];

  useEffect(() => {
    setSecs(mode.mins * 60);
    setRunning(false);
  }, [modeIdx]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSecs((s) => {
          if (s <= 1) { clearInterval(timerRef.current); setRunning(false); finish(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  function finish() {
    if (mode.key !== "work") { setModeIdx(0); return; }
    const next = cycles + 1;
    setCycles(next);
    onComplete?.();
    setLog((prev) => [
      { task: selected || "بدون مهمة", time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString("ar-EG") },
      ...prev,
    ].slice(0, 30));
    setModeIdx(next % 4 === 0 ? 2 : 1);
  }

  function reset() { setRunning(false); setSecs(mode.mins * 60); }

  const total = mode.mins * 60;
  const pct   = ((total - secs) / total) * 100;
  const R     = 84;
  const circ  = 2 * Math.PI * R;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }} className="pomodoro-grid">

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: 36,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
        boxShadow: "var(--shadow-md)",
      }}>

        <div style={{
          display: "flex", gap: 4, background: "var(--bg)", padding: 4,
          borderRadius: 24, border: "1px solid var(--border)",
        }}>
          {MODES.map((m, i) => (
            <button key={m.key} onClick={() => setModeIdx(i)}
              style={{
                padding: "7px 18px", borderRadius: 20, border: "none", fontSize: 13,
                background: modeIdx === i ? m.color : "transparent",
                color: modeIdx === i ? "#fff" : "var(--text-2)",
                fontWeight: modeIdx === i ? 600 : 400,
              }}>
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", width: 210, height: 210 }}>
          <svg width="210" height="210" style={{ transform: "rotate(-90deg)" }}>
            <defs>
              <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={mode.color} stopOpacity="1" />
                <stop offset="100%" stopColor={mode.color} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <circle cx="105" cy="105" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle cx="105" cy="105" r={R} fill="none" stroke="url(#ring-grad)" strokeWidth="10"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round" style={{
                transition: "stroke-dashoffset .6s ease",
                filter: `drop-shadow(0 0 8px ${mode.color}66)`,
              }} />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            <span style={{
              fontSize: 48, fontWeight: 300, letterSpacing: 2,
              fontVariantNumeric: "tabular-nums", color: "var(--text)",
            }}>{formatTime(secs)}</span>
            <span style={{ fontSize: 12, color: mode.color, fontWeight: 600 }}>{mode.label}</span>
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: 340 }}>
          <label style={{
            fontSize: 12, color: "var(--text-2)",
            display: "block", marginBottom: 6,
          }}>المهمة الحالية</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px",
              border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
              background: "var(--bg)", color: "var(--text)", fontSize: 13,
            }}>
            <option value="">اختار مهمة...</option>
            {tasks.map((t, i) => <option key={i} value={t.text}>{t.text}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setRunning((r) => !r)}
            style={{
              padding: "12px 40px", borderRadius: 24, border: "none",
              background: running ? "var(--border-2)" : mode.color,
              color: running ? "var(--text-2)" : "#fff",
              fontSize: 15, fontWeight: 600,
              boxShadow: running ? "none" : `0 4px 16px ${mode.color}55`,
            }}>
            {running ? "⏸ إيقاف" : "▶ ابدأ"}
          </button>
          <button onClick={reset}
            style={{
              padding: "12px 20px", borderRadius: 24,
              border: "1px solid var(--border)",
              background: "var(--bg)", color: "var(--text-2)", fontSize: 14,
            }}>
            ↺
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-2)" }}>جلسات اليوم:</span>
          {Array.from({ length: Math.max(4, cycles) }).map((_, i) => (
            <div key={i} style={{
              width: 11, height: 11, borderRadius: "50%",
              background: i < cycles ? mode.color : "transparent",
              border: `2px solid ${mode.color}`,
              transition: "background .3s",
            }} />
          ))}
          <span style={{ fontSize: 13, fontWeight: 600, color: mode.color }}>{cycles}</span>
        </div>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: 18, boxShadow: "var(--shadow)",
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>
          📋 سجل الجلسات
        </h3>
        {log.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--text-2)", textAlign: "center", padding: "24px 0" }}>
            ابدأ أول بومودورو! 🍅
          </p>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", gap: 7,
            maxHeight: 440, overflowY: "auto",
          }}>
            {log.map((e, i) => (
              <div key={i} style={{
                padding: "9px 10px", background: "var(--bg)",
                borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
                borderInlineStart: "3px solid var(--purple)",
              }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{e.task}</div>
                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>
                  {e.date} · {e.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 880px) {
          .pomodoro-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
