import { useState } from "react";
import { todayKey, todayAr, flatTasks } from "../utils/helpers";

const QUESTIONS = [
  { key: "achieved",   label: "ماذا أنجزت اليوم؟ 🎯",              placeholder: "اكتب أهم 3 أشياء أنجزتها..." },
  { key: "grateful",  label: "ما الذي تشكر الله عليه اليوم؟ 🤲",   placeholder: "نعمة، موقف، شخص..." },
  { key: "improve",   label: "ما الذي تريد تحسينه غداً؟ 📈",        placeholder: "شيء واحد تغيره..." },
  { key: "feeling",   label: "كيف تشعر الآن؟ 💭",                   placeholder: "صف مشاعرك بكلمات..." },
];

export default function DailyReflection({ streak, completedToday, tasks, reflections, setReflections }) {
  const key   = todayKey();
  const today = reflections[key] || {};
  const [form, setForm] = useState(today);
  const [saved, setSaved] = useState(false);

  const allTasks = flatTasks(tasks);
  const done     = allTasks.filter(t => t.done).length;

  function save() {
    const entry = { ...form, savedAt: Date.now() };
    setReflections((p) => ({ ...p, [key]: entry }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const pastEntries = Object.entries(reflections)
    .filter(([k]) => k !== key)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 3);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#EAE8FF", margin: 0 }}>التأمل اليومي 📝</h2>
        <p style={{ color: "#8B87C0", fontSize: 13, marginTop: 4 }}>{todayAr()}</p>
      </div>

      {/* Day summary */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20,
      }}>
        {[
          { label: "مهام مكتملة", val: done + "✅" },
          { label: "سلسلة الأيام", val: streak.count + "🔥" },
          { label: "جلسات اليوم",  val: completedToday.count + "⚡" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "rgba(17,15,38,.8)", border: "1px solid rgba(124,110,255,.2)",
            borderRadius: 12, padding: "1rem", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#EAE8FF" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#8B87C0", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{
        background: "rgba(17,15,38,.8)", border: "1px solid rgba(124,110,255,.2)",
        borderRadius: 16, padding: "1.5rem", marginBottom: 16,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {QUESTIONS.map(q => (
            <div key={q.key}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#A89BFF", marginBottom: 8 }}>{q.label}</label>
              <textarea
                value={form[q.key] || ""}
                onChange={e => setForm(p => ({ ...p, [q.key]: e.target.value }))}
                placeholder={q.placeholder}
                rows={3}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10, resize: "vertical",
                  background: "rgba(255,255,255,.05)", border: "1px solid rgba(124,110,255,.2)",
                  color: "#EAE8FF", fontSize: 13, lineHeight: 1.7,
                }}
              />
            </div>
          ))}
        </div>

        <button onClick={save} style={{
          marginTop: 16, width: "100%", padding: "12px",
          background: saved ? "rgba(16,217,138,.2)" : "linear-gradient(135deg, #6C63FF, #4338CA)",
          border: saved ? "1px solid rgba(16,217,138,.4)" : "none",
          borderRadius: 12, color: saved ? "#10D98A" : "#fff",
          fontSize: 15, fontWeight: 700,
          transition: "all .3s",
        }}>
          {saved ? "✅ تم الحفظ!" : "💾 حفظ التأمل"}
        </button>
      </div>

      {/* Past reflections */}
      {pastEntries.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#8B87C0", marginBottom: 10 }}>تأملات سابقة</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pastEntries.map(([date, entry]) => (
              <div key={date} style={{
                background: "rgba(17,15,38,.6)", border: "1px solid rgba(124,110,255,.15)",
                borderRadius: 12, padding: "1rem",
              }}>
                <p style={{ fontSize: 11, color: "#6C63FF", fontWeight: 700, marginBottom: 8 }}>{date}</p>
                {entry.achieved && <p style={{ fontSize: 13, color: "#C4C0FF", marginBottom: 4 }}>🎯 {entry.achieved}</p>}
                {entry.grateful && <p style={{ fontSize: 13, color: "#C4E8D8" }}>🤲 {entry.grateful}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
