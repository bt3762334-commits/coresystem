import { useState, useCallback } from "react";
import { uid } from "../utils/helpers";

const Q = [
  { key: "q1", badge: "Q1", label: "افعلها الآن",   title: "عاجل ومهم",         icon: "🔥", c: "#EF4444", lt: "#3B0A0A", dk: "#F1A9A9", hint: "ركّز عليها فوراً" },
  { key: "q2", badge: "Q2", label: "خطّط ليها",     title: "مهم · مش عاجل",     icon: "📅", c: "#5E6AD2", lt: "var(--purple-lt)", dk: "var(--purple-dk)", hint: "جدوّلها بوقت محدد" },
  { key: "q3", badge: "Q3", label: "فوّضها",         title: "عاجل · مش مهم",     icon: "🤝", c: "#F0B429", lt: "var(--amber-lt)", dk: "var(--amber-dk)", hint: "فوّضها لحد تاني" },
  { key: "q4", badge: "Q4", label: "احذفها",         title: "مش عاجل · مش مهم",  icon: "🗑", c: "#8B92A8", lt: "var(--slate-lt)", dk: "var(--slate-dk)", hint: "استغنّ عنها" },
];

export default function EisenhowerMatrix({ tasks, onDone, onAdd, onDelete, onEdit }) {
  const [inputs, setInputs] = useState({ q1: "", q2: "", q3: "", q4: "" });
  const [editingTask, setEditingTask] = useState(null); // { id, q, text, ... }

  const allTasks = Object.values(tasks).flat();
  const done  = allTasks.filter((t) => t.done).length;
  const total = allTasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  const handleAdd = useCallback((key) => {
    const text = inputs[key].trim();
    if (!text) return;
    onAdd(key, { id: uid(), text, done: false, created: Date.now() });
    setInputs((p) => ({ ...p, [key]: "" }));
  }, [inputs, onAdd]);

  const handleEditSave = useCallback((updatedTask, newQ) => {
    if (onEdit) {
      onEdit(editingTask.q, updatedTask, newQ);
    }
    setEditingTask(null);
  }, [editingTask, onEdit]);

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
        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{done} / {total} مهمة</span>
      </div>

      {/* Empty state */}
      {total === 0 && (
        <div style={{
          background: "var(--surface)", border: "1px dashed var(--border-2)",
          borderRadius: "var(--radius)", padding: "40px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📝</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>ابدأ بإضافة أول مهمة</div>
          <p style={{ fontSize: 13, color: "var(--text-2)", maxWidth: 380, margin: "0 auto" }}>
            أضف مهامك تحت كل ربع من المصفوفة، أو روح لـ <strong>AI Coach</strong> واكتب هدفك وهو يوزّع المهام تلقائياً.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            {Q.map((q) => (
              <div key={q.key} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: q.lt, border: `1px solid ${q.c}44`,
                borderRadius: 20, padding: "6px 14px",
                fontSize: 12, color: q.dk,
              }}>
                <span>{q.icon}</span>
                <span>{q.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matrix content - always render quadrants */}
      <div>
        {/* Desktop: 2x2 grid */}
        <div className="matrix-desktop" style={{
          display: "grid",
          gridTemplateColumns: "36px 1fr 1fr",
          gridTemplateRows: "36px 1fr 1fr",
          gap: 0,
        }}>
          {/* Column headers */}
          <div style={{
            gridColumn: "2", textAlign: "center", fontSize: 11, fontWeight: 700,
            color: "var(--text-2)", paddingBottom: 8,
            borderBottom: "2px solid var(--border)",
            borderInlineStart: "1px solid var(--border)",
            letterSpacing: ".05em", display: "flex", alignItems: "center", justifyContent: "center",
          }}>⚡ عاجل</div>
          <div style={{
            gridColumn: "3", textAlign: "center", fontSize: 11, fontWeight: 700,
            color: "var(--text-2)", paddingBottom: 8,
            borderBottom: "2px solid var(--border)",
            letterSpacing: ".05em", display: "flex", alignItems: "center", justifyContent: "center",
          }}>🕒 مش عاجل</div>

          {/* Row label */}
          <div style={{
            gridColumn: "1", gridRow: "2 / 4",
            display: "flex", alignItems: "center", justifyContent: "center",
            writingMode: "vertical-rl", transform: "rotate(180deg)",
            fontSize: 11, fontWeight: 700, color: "var(--text-2)",
            borderInlineEnd: "2px solid var(--border)",
            paddingInlineEnd: 4, letterSpacing: ".05em", gap: 30,
          }}>
            <span>⭐ مهم</span>
            <span style={{ opacity: 0.5 }}>——</span>
            <span>💤 مش مهم</span>
          </div>

          {/* 2×2 grid */}
          <div style={{
            gridColumn: "2 / -1", gridRow: "2 / 4",
            display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr",
            gap: 10, padding: "10px 0 0 10px", minHeight: 480,
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
                onEdit={(task) => setEditingTask({ ...task, q: q.key })}
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
              onEdit={(task) => setEditingTask({ ...task, q: q.key })}
              mobile
            />
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          currentQ={editingTask.q}
          onSave={handleEditSave}
          onClose={() => setEditingTask(null)}
        />
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

function Quadrant({ q, tasks, input, onInput, onAdd, onDone, onDelete, onEdit, mobile }) {
  const done = tasks.filter((t) => t.done).length;

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: mobile ? "14px" : 14,
      display: "flex", flexDirection: "column", gap: 8,
      boxShadow: "var(--shadow)", position: "relative", overflow: "hidden",
      minHeight: mobile ? "auto" : 220,
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
          flexShrink: 0,
        }}>{q.badge} · {q.label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: q.dk, flex: 1 }}>{q.icon} {q.title}</span>
        <span style={{
          fontSize: 11, color: "var(--text-2)",
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "1px 8px", flexShrink: 0,
        }}>{done}/{tasks.length}</span>
      </div>

      <p style={{ fontSize: 11, color: "var(--text-2)", fontStyle: "italic", margin: 0 }}>{q.hint}</p>

      <div style={{
        flex: 1, overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 5,
        maxHeight: mobile ? 260 : 180,
      }}>
        {tasks.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-2)", fontSize: 12 }}>
            <div style={{ fontSize: 20, marginBottom: 4, opacity: 0.5 }}>{q.icon}</div>
            لا توجد مهام
          </div>
        )}
        {tasks.map((t) => (
          <TaskItem
            key={t.id}
            task={t}
            accentColor={q.c}
            onDone={() => onDone(t.id)}
            onDelete={() => onDelete(t.id)}
            onEdit={() => onEdit(t)}
          />
        ))}
      </div>

      {/* Input row */}
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
            outline: "none",
          }}
        />
        <button
          onClick={onAdd}
          disabled={!input.trim()}
          title="إضافة مهمة"
          style={{
            padding: "8px 14px", borderRadius: "var(--radius-sm)",
            border: "none",
            background: input.trim()
              ? `linear-gradient(135deg, ${q.c}, ${q.c}BB)`
              : "var(--border-2)",
            color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1,
          }}
        >+</button>
      </div>
    </div>
  );
}

function TaskItem({ task, accentColor, onDone, onDelete, onEdit }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 7,
      padding: "8px 10px", borderRadius: "var(--radius-sm)",
      background: "var(--bg)", border: "1px solid var(--border)",
      opacity: task.done ? 0.55 : 1, transition: "opacity .2s",
      position: "relative",
    }}>
      <button
        onClick={onDone}
        title={task.done ? "إلغاء الإنجاز" : "تحديد كمنجز"}
        style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 2,
          border: task.done ? "none" : `1.5px solid ${accentColor}`,
          background: task.done ? accentColor : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: "#fff", padding: 0,
        }}
      >{task.done ? "✓" : ""}</button>

      <span style={{
        flex: 1, fontSize: 13, lineHeight: 1.5,
        textDecoration: task.done ? "line-through" : "none",
        color: task.done ? "var(--text-2)" : "var(--text)",
        wordBreak: "break-word",
      }}>{task.text}</span>

      <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
        <button
          onClick={onEdit}
          title="تعديل المهمة"
          style={{
            fontSize: 13, color: "var(--text-2)", background: "none",
            border: "none", padding: "0 3px", opacity: 0.55, lineHeight: 1,
          }}
        >✏</button>
        <button
          onClick={onDelete}
          title="حذف المهمة"
          style={{
            fontSize: 17, color: "var(--text-2)", background: "none",
            border: "none", padding: "0 2px", opacity: 0.4, lineHeight: 1,
          }}
        >×</button>
      </div>
    </div>
  );
}

const Q_OPTIONS = [
  { value: "q1", label: "Q1 — عاجل ومهم 🔥" },
  { value: "q2", label: "Q2 — مهم مش عاجل 📅" },
  { value: "q3", label: "Q3 — عاجل مش مهم 🤝" },
  { value: "q4", label: "Q4 — مش عاجل مش مهم 🗑" },
];

function TaskEditModal({ task, currentQ, onSave, onClose }) {
  const [text, setText] = useState(task.text);
  const [quadrant, setQuadrant] = useState(currentQ);
  const [status, setStatus] = useState(task.done ? "done" : "todo");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSave({ ...task, text: text.trim(), done: status === "done" }, quadrant);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, padding: "1rem",
        animation: "fadeIn .15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 22px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, rgba(94,106,210,.08) 0%, transparent 100%)",
        }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>✏ تعديل المهمة</div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: "50%",
            border: "1px solid var(--border)", background: "var(--bg)",
            color: "var(--text-2)", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Task text */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
              📝 نص المهمة
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              rows={3}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                background: "var(--bg)", color: "var(--text)",
                fontSize: 14, lineHeight: 1.6, resize: "vertical",
                fontFamily: "var(--font)", outline: "none",
              }}
            />
          </div>

          {/* Quadrant selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
              📊 الربع في المصفوفة
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Q_OPTIONS.map((opt) => {
                const qInfo = Q.find(q => q.key === opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setQuadrant(opt.value)}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: `1.5px solid ${quadrant === opt.value ? qInfo.c : "var(--border)"}`,
                      background: quadrant === opt.value ? qInfo.lt : "var(--bg)",
                      color: quadrant === opt.value ? qInfo.dk : "var(--text-2)",
                      fontSize: 12, fontWeight: quadrant === opt.value ? 700 : 500,
                      textAlign: "start",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
              ✅ الحالة
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: "todo", label: "⬜ قيد التنفيذ" },
                { value: "done", label: "✅ مكتملة" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  style={{
                    flex: 1, padding: "9px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: `1.5px solid ${status === opt.value ? "var(--purple)" : "var(--border)"}`,
                    background: status === opt.value ? "var(--purple-lt)" : "var(--bg)",
                    color: status === opt.value ? "var(--purple-dk)" : "var(--text-2)",
                    fontSize: 13, fontWeight: status === opt.value ? 700 : 500,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: "11px 16px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)", background: "var(--bg)",
                color: "var(--text)", fontSize: 14, fontWeight: 600,
              }}
            >إلغاء</button>
            <button
              type="submit"
              disabled={!text.trim()}
              style={{
                flex: 2, padding: "11px 16px",
                borderRadius: "var(--radius-sm)", border: "none",
                background: "linear-gradient(135deg, var(--purple), #4F5BC4)",
                color: "#fff", fontSize: 14, fontWeight: 700,
                boxShadow: "0 4px 16px rgba(94,106,210,.4)",
              }}
            >💾 حفظ التعديلات</button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
