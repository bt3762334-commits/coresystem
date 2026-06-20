import { useMemo } from "react";
import { flatTasks, monthKey } from "../utils/helpers";

const Q_META = [
  { key: "q1", label: "عاجل ومهم",        color: "#EF4444" },
  { key: "q2", label: "مهم مش عاجل",      color: "#5E6AD2" },
  { key: "q3", label: "عاجل مش مهم",      color: "#F0B429" },
  { key: "q4", label: "مش مهم ومش عاجل",  color: "#8B92A8" },
];

const DAYS_AR = ["سبت", "أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];

export default function Analytics({ tasks, streak, completedToday }) {
  const all   = useMemo(() => flatTasks(tasks), [tasks]);
  const done  = all.filter((t) => t.done).length;
  const total = all.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  const counts = Q_META.map((q) => ({
    ...q,
    total: tasks[q.key]?.length || 0,
    done:  tasks[q.key]?.filter((t) => t.done).length || 0,
  }));

  const R     = 48;
  const circ  = 2 * Math.PI * R;
  let offset  = 0;
  const segments = counts.map((c) => {
    const frac  = total ? c.total / total : 0;
    const dash  = frac * circ;
    const seg   = { dash, offset, color: c.color, frac };
    offset += dash;
    return seg;
  });

  const weekData = useMemo(() => {
    const history = streak?.history || {};
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000);
      const k = d.toDateString();
      const dayIdx = d.getDay();
      days.push({
        day: DAYS_AR[dayIdx],
        val: history[k] || 0,
        isToday: i === 0,
      });
    }
    return days;
  }, [streak]);

  const maxVal = Math.max(...weekData.map((d) => d.val), 1);
  const monthTotal = weekData.reduce((s, d) => s + d.val, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="analytics-grid">

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="kpi-grid">
        {[
          { icon: "📋", label: "إجمالي المهام",   value: total,                  color: "var(--purple)" },
          { icon: "✅", label: "مكتملة",            value: done,                   color: "var(--green)"  },
          { icon: "📈", label: "نسبة الإنجاز",    value: pct + "%",              color: "var(--amber)"  },
          { icon: "🔥", label: "Streak الحالي",    value: streak.count + " يوم", color: "#EF4444"       },
        ].map((k, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: "18px 20px",
            boxShadow: "var(--shadow)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, insetInlineStart: 0, width: 3, height: "100%",
              background: k.color,
            }} />
            <div style={{ fontSize: 24, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 300, color: k.color, fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="chart-grid">

        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: 20, boxShadow: "var(--shadow)",
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>توزيع المهام على المصفوفة</h3>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
              {total === 0 ? (
                <circle cx="60" cy="60" r={R} fill="none" stroke="var(--border)" strokeWidth="18" />
              ) : segments.map((s, i) => (
                <circle key={i} cx="60" cy="60" r={R} fill="none"
                  stroke={s.color} strokeWidth="18"
                  strokeDasharray={`${s.dash} ${circ - s.dash}`}
                  strokeDashoffset={-s.offset}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
                />
              ))}
              <text x="60" y="58" textAnchor="middle" style={{
                fontSize: 20, fontWeight: 600, fill: "var(--text)", fontFamily: "var(--font)",
              }}>{pct}%</text>
              <text x="60" y="74" textAnchor="middle" style={{
                fontSize: 9, fill: "var(--text-2)", fontFamily: "var(--font)",
              }}>إنجاز</text>
            </svg>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {counts.map((c, i) => {
                const qPct = c.total ? Math.round((c.done / c.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                      <span style={{ color: c.color, fontWeight: 600 }}>Q{i + 1}</span>
                      <span style={{ color: "var(--text-2)" }}>{c.done}/{c.total}</span>
                    </div>
                    <div style={{
                      height: 6, background: "var(--bg)", borderRadius: 3,
                      overflow: "hidden", border: "1px solid var(--border)",
                    }}>
                      <div style={{
                        height: "100%", width: qPct + "%", background: c.color,
                        borderRadius: 3, transition: "width .6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 16 }}>
            {counts.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                <span style={{ color: "var(--text-2)" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: 20, boxShadow: "var(--shadow)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>المهام المكتملة — الأسبوع</h3>
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 12,
              background: "var(--purple-lt)", color: "var(--purple-dk)", fontWeight: 600,
            }}>
              {monthTotal} هذا الأسبوع
            </span>
          </div>

          <div style={{
            display: "flex", alignItems: "flex-end", gap: 6,
            height: 160, paddingBottom: 24, position: "relative",
          }}>
            {weekData.map((d, i) => {
              const h = Math.max((d.val / maxVal) * 120, 4);
              return (
                <div key={i} style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", height: "100%",
                  justifyContent: "flex-end", gap: 4,
                }}>
                  <span style={{
                    fontSize: 10, color: d.isToday ? "var(--purple)" : "var(--text-2)",
                    fontWeight: d.isToday ? 700 : 400,
                  }}>{d.val}</span>
                  <div style={{
                    width: "100%", height: h,
                    background: d.isToday
                      ? "linear-gradient(180deg, var(--purple) 0%, #8B95E8 100%)"
                      : d.val > 0
                        ? "linear-gradient(180deg, var(--green) 0%, #34D399 100%)"
                        : "var(--border)",
                    borderRadius: "6px 6px 0 0",
                    transition: "height .5s ease",
                    position: "relative", overflow: "hidden",
                  }}>
                    {d.isToday && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(180deg, rgba(255,255,255,.25), transparent)",
                      }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 9, color: d.isToday ? "var(--purple)" : "var(--text-2)",
                    position: "absolute", bottom: 0,
                    fontWeight: d.isToday ? 600 : 400,
                  }}>{d.day}</span>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: 10, padding: "10px 12px",
            background: "linear-gradient(135deg, var(--purple-lt) 0%, rgba(16,185,129,.1) 100%)",
            borderRadius: "var(--radius-sm)", fontSize: 12,
            color: "var(--purple-dk)", lineHeight: 1.6,
            border: "1px solid rgba(108,99,255,.15)",
          }}>
            💡 <strong>نصيحة:</strong> ركّز على Q2 (مهم مش عاجل) — هي اللي بتبني المستقبل وبتتأجّل دايماً.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .chart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
