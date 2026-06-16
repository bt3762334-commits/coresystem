import { useState } from "react";
import { uid } from "../utils/helpers";

const QUADRANTS = [
  { key: "q1", label: "عاجل ومهم",      color: "#EF4444", bg: "rgba(239,68,68,.1)",   border: "rgba(239,68,68,.3)",   icon: "🔴", desc: "افعلها الآن" },
  { key: "q2", label: "مهم وغير عاجل",  color: "#6C63FF", bg: "rgba(108,99,255,.1)",  border: "rgba(108,99,255,.3)",  icon: "🟣", desc: "خطط لها" },
  { key: "q3", label: "عاجل وغير مهم",  color: "#F59E0B", bg: "rgba(245,158,11,.1)",  border: "rgba(245,158,11,.3)",  icon: "🟡", desc: "فوّض إن أمكن" },
  { key: "q4", label: "غير عاجل وغير مهم", color: "#6B7280", bg: "rgba(107,114,128,.1)", border: "rgba(107,114,128,.3)", icon: "⚫", desc: "تخلص منها" },
];

export default function EisenhowerMatrix({ tasks, onDone, onAdd, onDelete }) {
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#EAE8FF", margin: 0 }}>مصفوفة أيزنهاور</h2>
        <p style={{ color: "#8B87C0", fontSize: 13, marginTop: 4 }}>رتّب مهامك حسب الأولوية</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {QUADRANTS.map((q) => (
          <Quadrant key={q.key} q={q} tasks={tasks[q.key] || []} onDone={onDone} onAdd={onAdd} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function Quadrant({ q, tasks, onDone, onAdd, onDelete }) {
  const [input, setInput] = useState("");

  function add() {
    const text = input.trim();
    if (!text) return;
    onAdd(q.key, { id: uid(), text, done: false, createdAt: Date.now() });
    setInput("");
  }

  return (
    <div style={{
      background: q.bg, border: `1px solid ${q.border}`,
      borderRadius: 16, padding: "1.2rem",
      minHeight: 200,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{q.icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: q.color }}>{q.label}</div>
          <div style={{ fontSize: 11, color: "#8B87C0" }}>{q.desc}</div>
        </div>
        <span style={{
          marginInlineStart: "auto", fontSize: 11, fontWeight: 700,
          background: `${q.color}22`, color: q.color,
          padding: "2px 8px", borderRadius: 20,
        }}>{tasks.filter(t => t.done).length}/{tasks.length}</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="أضف مهمة..."
          style={{
            flex: 1, padding: "7px 10px", borderRadius: 8,
            background: "rgba(255,255,255,.07)", border: `1px solid ${q.border}`,
            color: "#EAE8FF", fontSize: 13,
          }}
        />
        <button onClick={add} style={{
          padding: "7px 12px", borderRadius: 8, border: "none",
          background: q.color, color: "#fff", fontWeight: 700, fontSize: 14,
        }}>+</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tasks.map((t) => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,.05)", borderRadius: 8, padding: "7px 10px",
            opacity: t.done ? .5 : 1,
          }}>
            <input type="checkbox" checked={t.done} onChange={() => onDone(q.key, t.id)}
              style={{ width: 16, height: 16, accentColor: q.color, cursor: "pointer", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: "#EAE8FF", textDecoration: t.done ? "line-through" : "none", wordBreak: "break-word" }}>{t.text}</span>
            <button onClick={() => onDelete(q.key, t.id)} style={{
              background: "none", border: "none", color: "#6B7280", fontSize: 14, padding: "0 2px", flexShrink: 0,
            }}>✕</button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p style={{ fontSize: 12, color: "#4B4870", textAlign: "center", padding: "1rem 0" }}>لا توجد مهام بعد</p>
        )}
      </div>
    </div>
  );
}