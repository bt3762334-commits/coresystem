import { useState } from "react";
import { uid } from "../utils/helpers";

const Q = [
  { key: "q1", badge: "Q1", label: "افعلها الآن",   title: "عاجل ومهم",         icon: "🔥", c: "#EF4444", lt: "#3B0A0A", dk: "#F1A9A9", hint: "ركّز عليها فوراً" },
  { key: "q2", badge: "Q2", label: "خطّط ليها",     title: "مهم · مش عاجل",     icon: "📅", c: "#5E6AD2", lt: "var(--purple-lt)", dk: "var(--purple-dk)", hint: "جدوّلها بوقت محدد" },
  { key: "q3", badge: "Q3", label: "فوّضها",         title: "عاجل · مش مهم",     icon: "🤝", c: "#F0B429", lt: "var(--amber-lt)", dk: "var(--amber-dk)", hint: "فوّضها لحد تاني" },
  { key: "q4", badge: "Q4", label: "احذفها",         title: "مش عاجل · مش مهم",  icon: "🗑", c: "#8B92A8", lt: "var(--slate-lt)", dk: "var(--slate-dk)", hint: "استغنّ عنها" },
];

export default function EisenhowerMatrix({ tasks, onDone, onAdd, onDelete }) {
  const [inputs, setInputs] = useState({ q1: "", q2: "", q3: "", q4: "" });

  const allTasks = Object.values(tasks).flat();
  const done  = allTasks.filter((t) => t.done).length;
  const total = allTasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  function handleAdd(key) {
    const text = inputs[key].trim();
    if (!text) return;
    onAdd(key, { id: uid(), text, done: false, created: Date.now() });
    setInputs((p) => ({ ...p, [key]: "" }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Progress bar */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 14, boxShadow: "var(--shadow)",
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 13, color: "var(--text-2)", whiteSpace: "nowrap" }}>إنجاز اليوم</span>
        <div style={{ flex: 1, minWidth: 100, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: pct + "%",
            background: "linear-gradient(90deg, #EF4444 0%, #5E6AD2 50%, #14B8A6 100%)",
            borderRadius: 3, transition: "width .5s ease",
          }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green)", minWidth: 36 }}>{pct}%</span>
        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{done} / {total}</span>
      </div>

      {/* Empty state */}
      {total === 0 && (
        <div style={{
          background: "var(--surface)", border: "1px dashed var(--border-2)",
          borderRadius: "var(--radius)", padding: "32px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>ابدأ بإضافة أول مهمة</div>
          <p style={{ fontSize: 12, color: "var(--text-2)", maxWidth: 360, margin: "0 auto" }}>
            أضف مهامك تحت كل ربع، أو روح لـ <strong>AI Coach</strong> واكتب المهمة وهو يوزّعها على المصفوفة تلقائياً.
          </p>
        </div>
      )}

      {/* Desktop: classic 2×2 matrix */}
      {total > 0 && (
        <>
          <div className="matrix-desktop" style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 1fr",
            gridTemplateRows: "32px 1fr 1fr",
            gap: 0,
          }}>
            <div style={{
              gridColumn: "2", textAlign: "center", fontSize: 11, fontWeight: 600,
              color: "var(--text-2)", paddingBottom: 8,
              borderBottom: "2px solid var(--border)", borderInlineStart: "1px solid var(--border)",
              letterSpacing: ".04em", display: "flex", alignItems: "center", justifyContent: "center",
            }}>⚡ عاجل</div>
            <div style={{
              gridColumn: "3", textAlign: "center", fontSize: 11, fontWeight: 600,
              color: "var(--text-2)", paddingBottom: 8,
              borderBottom: "2px solid var(--border)",
              letterSpacing: ".04em", display: "flex", alignItems: "center", justifyContent: "center",
            }}>🕒 مش عاجل</div>

            <div style={{
              gridColumn: "1", gridRow: "2 / 4",
              display: "flex", alignItems: "center", justifyContent: "center",
              writingMode: "vertical-rl", transform: "rotate(180deg)",
              fontSize: 11, fontWeight: 600, color: "var(--text-2)",
              borderInlineEnd: "2px solid var(--border)",
              paddingInlineEnd: 4, letterSpacing: ".04em",
            }}>⭐ مهم &nbsp;&nbsp;&nbsp; 💤 مش مهم</div>

            <div style={{
              gridColumn: "2 / -1", gridRow: "2 / 4",
              display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr",
              gap: 10, padding: "10px 0 0 10px", minHeight: 460,
            }}>
              {Q.map((q) => (
                <Quadrant
                  key={q.key} q={q}
                  tasks={tasks[q.key] || []}
                  input={inputs[q.key]}
                  onInput={(v) => setInputs((p) => ({ ...p, [q.key]: v }))}
                  onAdd={() => handleAdd(q.key)}
                  onDone={(id) => onDone(q.key, id)}
                  onDelete={(id) => onDelete(q.key, id)}
                />
              ))}
            </div>
          </div>

          {/* Mobile: stacked cards */}
          <div className="matrix-mobile" style={{ display: "none", flexDirection: "column", gap: 12 }}>
            {Q.map((q) => (
              <Quadrant
                key={q.key} q={q}
                tasks={tasks[q.key] || []}
                input={inputs[q.key]}
                onInput={(v) => setInputs((p) => ({ ...p, [q.key]: v }))}
                onAdd={() => handleAdd(q.key)}
                onDone={(id) => onDone(q.key, id)}
                onDelete={(id) => onDelete(q.key, id)}
                mobile
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 640px) {
          .matrix-desktop { display: none !important; }
          .matrix-mobile  { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function Quadrant({ q, tasks, input, onInput, onAdd, onDone, onDelete, mobile }) {
  const done = tasks.filter((t) => t.done).length;

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: mobile ? "14px 14px" : 14,
      display: "flex", flexDirection: "column", gap: 8,
      boxShadow: "var(--shadow)", position: "relative", overflow: "hidden",
    }}>
      {/* Top color bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${q.c}, ${q.c}88)`,
        borderRadius: "var(--radius) var(--radius) 0 0",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 4 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 9px",
          borderRadius: 20, background: q.lt, color: q.dk, letterSpacing: ".04em",
          border: `1px solid ${q.c}44`,
        }}>{q.badge} · {q.label}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: q.dk, flex: 1 }}>{q.icon} {q.title}</span>
        <span style={{
          fontSize: 11, color: "var(--text-2)",
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "1px 8px",
        }}>{done}/{tasks.length}</span>
      </div>

      <p style={{ fontSize: 11, color: "var(--text-2)", fontStyle: "italic", margin: 0 }}>{q.hint}</p>

      <div style={{
        flex: 1, overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 5,
        maxHeight: mobile ? 240 : 170,
      }}>
        {tasks.length === 0 && (
          <div style={{ textAlign: "center", padding: "18px 0", color: "var(--text-2)", fontSize: 12 }}>
            لا توجد مهام
          </div>
        )}
        {tasks.map((t) => (
          <div key={t.id} style={{
            display: "flex", alignItems: "flex-start", gap: 7,
            padding: "8px 10px", borderRadius: "var(--radius-sm)",
            background: "var(--bg)", border: "1px solid var(--border)",
            opacity: t.done ? 0.5 : 1, transition: "opacity .2s",
          }}>
            <button
              onClick={() => onDone(t.id)}
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                border: t.done ? "none" : `1.5px solid ${q.c}`,
                background: t.done ? q.c : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#fff", padding: 0,
              }}
            >{t.done ? "✓" : ""}</button>
            <span style={{
              flex: 1, fontSize: 13, lineHeight: 1.5,
              textDecoration: t.done ? "line-through" : "none",
              color: t.done ? "var(--text-2)" : "var(--text)",
            }}>{t.text}</span>
            <button onClick={() => onDelete(t.id)} style={{
              fontSize: 17, color: "var(--text-2)", background: "none",
              border: "none", padding: "0 2px", opacity: 0.4, lineHeight: 1, flexShrink: 0,
            }}>×</button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder="مهمة جديدة..."
          style={{
            flex: 1, padding: "8px 12px",
            border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
            background: "var(--bg)", fontSize: 13, color: "var(--text)",
          }}
        />
        <button
          onClick={onAdd}
          style={{
            padding: "8px 14px", borderRadius: "var(--radius-sm)",
            border: "none",
            background: `linear-gradient(135deg, ${q.c}, ${q.c}BB)`,
            color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1,
          }}
        >+</button>
      </div>
    </div>
  );
}
