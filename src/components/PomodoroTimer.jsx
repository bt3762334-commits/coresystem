import { useState, useEffect, useRef } from "react";
import { formatTime } from "../utils/helpers";

const MODES = [
  { key: "work",       label: "تركيز",        mins: 25, color: "#6C63FF" },
  { key: "short",      label: "استراحة قصيرة", mins: 5,  color: "#10D98A" },
  { key: "long",       label: "استراحة طويلة", mins: 15, color: "#F59E0B" },
];

export default function PomodoroTimer({ tasks, onComplete, session }) {
  const [modeIdx, setModeIdx] = useState(0);
  const [secs, setSecs]       = useState(MODES[0].mins * 60);
  const [running, setRunning] = useState(false);
  const [rounds, setRounds]   = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const intervalRef = useRef(null);

  const mode = MODES[modeIdx];

  useEffect(() => {
    setSecs(mode.mins * 60);
    setRunning(false);
  }, [modeIdx]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecs((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (MODES[modeIdx].key === "work") {
              setRounds((r) => r + 1);
              onComplete?.();
            }
            try { new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play(); } catch {}
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, modeIdx]);

  const pct = secs / (mode.mins * 60);
  const r = 80, circ = 2 * Math.PI * r;

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#EAE8FF", margin: 0 }}>مؤقت بومودورو</h2>
        <p style={{ color: "#8B87C0", fontSize: 13, marginTop: 4 }}>🍅 {rounds} جلسة مكتملة اليوم</p>
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {MODES.map((m, i) => (
          <button key={m.key} onClick={() => setModeIdx(i)} style={{
            flex: 1, padding: "8px", borderRadius: 10, border: "none",
            background: modeIdx === i ? m.color : "rgba(255,255,255,.07)",
            color: modeIdx === i ? "#fff" : "#8B87C0",
            fontWeight: modeIdx === i ? 700 : 400, fontSize: 13,
          }}>{m.label}</button>
        ))}
      </div>

      {/* Circle timer */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <div style={{ position: "relative", width: 200, height: 200 }}>
          <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="10" />
            <circle cx="100" cy="100" r={r} fill="none" stroke={mode.color}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
              style={{ transition: "stroke-dashoffset .5s ease" }} />
          </svg>
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: "#EAE8FF", letterSpacing: "-1px" }}>{formatTime(secs)}</span>
            <span style={{ fontSize: 12, color: mode.color, fontWeight: 600 }}>{mode.label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
        <button onClick={() => setRunning((r) => !r)} style={{
          padding: "12px 32px", borderRadius: 12, border: "none",
          background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`,
          color: "#fff", fontSize: 16, fontWeight: 700,
          boxShadow: `0 4px 20px ${mode.color}44`,
        }}>{running ? "⏸ إيقاف" : "▶ ابدأ"}</button>
        <button onClick={() => { setRunning(false); setSecs(mode.mins * 60); }} style={{
          padding: "12px 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,.15)",
          background: "rgba(255,255,255,.07)", color: "#8B87C0", fontSize: 14,
        }}>↺ إعادة</button>
      </div>

      {/* Task selector */}
      {tasks.length > 0 && (
        <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: "1rem" }}>
          <p style={{ fontSize: 12, color: "#8B87C0", marginBottom: 8, fontWeight: 600 }}>🎯 المهمة الحالية</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tasks.slice(0, 5).map((t) => (
              <button key={t.id} onClick={() => setSelectedTask(t.id)} style={{
                padding: "8px 12px", borderRadius: 8, border: "none", textAlign: "right",
                background: selectedTask === t.id ? "rgba(108,99,255,.25)" : "rgba(255,255,255,.05)",
                color: selectedTask === t.id ? "#EAE8FF" : "#8B87C0",
                fontSize: 13, fontWeight: selectedTask === t.id ? 600 : 400,
              }}>{t.text}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}