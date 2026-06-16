import { flatTasks, todayAr } from "../utils/helpers";

export default function Analytics({ tasks, streak, completedToday }) {
  const all    = flatTasks(tasks);
  const done   = all.filter(t => t.done).length;
  const total  = all.length;
  const pct    = total ? Math.round((done / total) * 100) : 0;

  const byQ = ["q1","q2","q3","q4"].map(q => ({
    q, count: tasks[q]?.length || 0, done: tasks[q]?.filter(t=>t.done).length || 0,
  }));

  const qLabels = { q1: "عاجل ومهم 🔴", q2: "مهم 🟣", q3: "عاجل 🟡", q4: "منخفض ⚫" };
  const qColors = { q1: "#EF4444", q2: "#6C63FF", q3: "#F59E0B", q4: "#6B7280" };

  const historyEntries = Object.entries(streak.history || {}).slice(-7);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#EAE8FF", margin: 0 }}>التحليلات 📊</h2>
        <p style={{ color: "#8B87C0", fontSize: 13, marginTop: 4 }}>{todayAr()}</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "سلسلة الأيام", val: streak.count + " 🔥", color: "#F59E0B" },
          { label: "أنجزت اليوم",  val: completedToday.count + " ⚡", color: "#10D98A" },
          { label: "المهام المكتملة", val: `${done}/${total}`, color: "#6C63FF" },
          { label: "نسبة الإنجاز", val: pct + "%", color: pct >= 70 ? "#10D98A" : pct >= 40 ? "#F59E0B" : "#EF4444" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "rgba(17,15,38,.8)", border: "1px solid rgba(124,110,255,.2)",
            borderRadius: 14, padding: "1.2rem", textAlign: "center",
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "#8B87C0", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: "rgba(17,15,38,.8)", border: "1px solid rgba(124,110,255,.2)", borderRadius: 14, padding: "1.2rem", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#EAE8FF", fontWeight: 600 }}>تقدم المهام الكلي</span>
          <span style={{ fontSize: 13, color: "#6C63FF", fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 10, background: "rgba(255,255,255,.07)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg, #6C63FF, #10D98A)", borderRadius: 10, transition: "width .5s" }} />
        </div>
      </div>

      {/* By quadrant */}
      <div style={{ background: "rgba(17,15,38,.8)", border: "1px solid rgba(124,110,255,.2)", borderRadius: 14, padding: "1.2rem", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#EAE8FF", marginBottom: 12 }}>توزيع المهام</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {byQ.map(({ q, count, done }) => (
            <div key={q}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: qColors[q] }}>{qLabels[q]}</span>
                <span style={{ fontSize: 12, color: "#8B87C0" }}>{done}/{count}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,.07)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: count ? (done/count*100)+"%" : "0%", background: qColors[q], borderRadius: 6, transition: "width .5s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {historyEntries.length > 0 && (
        <div style={{ background: "rgba(17,15,38,.8)", border: "1px solid rgba(124,110,255,.2)", borderRadius: 14, padding: "1.2rem" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#EAE8FF", marginBottom: 12 }}>سجل الأيام السابقة 📅</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {historyEntries.map(([date, count]) => (
              <div key={date} style={{
                background: "rgba(108,99,255,.15)", border: "1px solid rgba(108,99,255,.25)",
                borderRadius: 10, padding: "8px 12px", textAlign: "center",
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#A89BFF" }}>{count}</div>
                <div style={{ fontSize: 10, color: "#8B87C0", marginTop: 2 }}>{date.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}