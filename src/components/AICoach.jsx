import { useState, useRef, useEffect } from "react";
import { flatTasks, askAI, classifyTaskHeuristically, uid } from "../utils/helpers";

const SUGGESTIONS = [
  "حلّلي مهامي وقولي أيها الأهم دلوقتي",
  "وزّعلي المهمة دي على المصفوفة",
  "اقترحلي خطة للأسبوع الجاي",
  "إيه اللي المفروض أعمله الأول؟",
  "وزع مهامي على المصفوفة",
];

const SYSTEM = (tasksSummary, streak, completedToday) => `أنت AI Coach متخصص في الإنتاجية وإدارة الوقت، متخصص في مصفوفة أيزنهاور.
تتكلم بالعربي المصري، ودود ومباشر ومختصر. تستخدم emoji باعتدال.

مهام المستخدم الحالية:
${tasksSummary}

إحصائيات: streak ${streak.count} يوم · أكمل ${completedToday.count} مهمة اليوم.

قدّم نصائح عملية ومحددة. لا تطوّل.

عندما يطلب المستخدم توزيع مهام على المصفوفة، أرجع JSON في نهاية ردّك بالتنسيق التالي حصرياً:
\`\`\`tasks
{"items":[{"text":"نص المهمة","quadrant":"q1"}]}
\`\`\`
حيث quadrant يكون واحد من: q1 (عاجل ومهم), q2 (مهم مش عاجل), q3 (عاجل مش مهم), q4 (مش مهم ومش عاجل).`;

export default function AICoach({ tasks, streak, completedToday, onDistributeTasks }) {
  const [msgs, setMsgs] = useState([{
    role: "assistant",
    text: "أهلاً! أنا AI Coach بتاعك 🤖\nقولّي إيه اللي شاغل بالك، أو ابعتلي مهمة وأنا أوزّعها على المصفوفة بنفسي."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  function buildSummary() {
    const labels = { q1: "عاجل ومهم", q2: "مهم مش عاجل", q3: "عاجل مش مهم", q4: "مش مهم" };
    return Object.entries(tasks)
      .map(([k, arr]) => `${labels[k]}: ${arr.map((t) => (t.done ? "✅ " : "◻ ") + t.text).join(" | ") || "فارغ"}`)
      .join("\n");
  }

  function parseTasksBlock(text) {
    const match = text.match(/```tasks\s*([\s\S]*?)```/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed && Array.isArray(parsed.items)) {
        return parsed.items
          .filter((it) => it && typeof it.text === "string" && it.text.trim())
          .map((it) => ({
            text: it.text.trim(),
            quadrant: ["q1", "q2", "q3", "q4"].includes(it.quadrant) ? it.quadrant : classifyTaskHeuristically(it.text),
          }));
      }
    } catch { /* fall through */ }
    return null;
  }

  function stripTasksBlock(text) {
    return text.replace(/```tasks\s*[\s\S]*?```/g, "").trim();
  }

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setError("");

    const next = [...msgs, { role: "user", text: msg }];
    setMsgs(next);
    setLoading(true);

    try {
      const reply = await askAI({
        system: SYSTEM(buildSummary(), streak, completedToday),
        messages: next.map((m) => ({ role: m.role, content: m.text })),
      });

      const distributed = parseTasksBlock(reply);
      const displayText = stripTasksBlock(reply);

      if (distributed && distributed.length > 0 && onDistributeTasks) {
        const items = distributed.map((d) => ({
          id: uid(),
          text: d.text,
          done: false,
          created: Date.now(),
        }));
        onDistributeTasks({
          q1: items.filter((_, i) => distributed[i].quadrant === "q1"),
          q2: items.filter((_, i) => distributed[i].quadrant === "q2"),
          q3: items.filter((_, i) => distributed[i].quadrant === "q3"),
          q4: items.filter((_, i) => distributed[i].quadrant === "q4"),
        });

        setMsgs((p) => [...p, {
          role: "assistant",
          text: (displayText || "تمام!") + `\n\n✅ وزّعت ${items.length} مهمة على المصفوفة تلقائياً.`,
        }]);
      } else {
        setMsgs((p) => [...p, { role: "assistant", text: displayText || "..." }]);
      }
    } catch (e) {
      setError(e.message || "حصل خطأ");
      setMsgs((p) => [...p, {
        role: "assistant",
        text: "❌ " + (e.message || "تعذّر الاتصال. تأكد من إعداد VITE_ANTHROPIC_KEY في Vercel."),
      }]);
    }
    setLoading(false);
  }

  function quickAddTask() {
    const text = input.trim();
    if (!text) return;
    const q = classifyTaskHeuristically(text);
    onDistributeTasks({ [q]: [{ id: uid(), text, done: false, created: Date.now() }] });
    setInput("");
    const labels = { q1: "عاجل ومهم (Q1)", q2: "مهم مش عاجل (Q2)", q3: "عاجل مش مهم (Q3)", q4: "مش مهم (Q4)" };
    setMsgs((p) => [...p, {
      role: "user", text,
    }, {
      role: "assistant",
      text: `✅ ضفت المهمة في **${labels[q]}** تلقائياً.`,
    }]);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16, alignItems: "start" }} className="ai-grid">

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", overflow: "hidden",
        display: "flex", flexDirection: "column",
        height: 580, boxShadow: "var(--shadow-md)",
      }}>
        <div style={{
          padding: "12px 16px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10,
          background: "linear-gradient(135deg, rgba(108,99,255,.05) 0%, rgba(16,185,129,.05) 100%)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--purple) 0%, #A78BFA 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#fff",
            boxShadow: "0 4px 12px rgba(108,99,255,.3)",
          }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>AI Coach</div>
            <div style={{ fontSize: 11, color: "var(--green)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--green)",
                boxShadow: "0 0 8px var(--green)",
                animation: "pulse 2s infinite",
              }} />
              متصل · يقدر يوزّع مهامك تلقائياً
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-start" : "flex-end" }}>
              <div style={{
                maxWidth: "84%", padding: "10px 14px",
                borderRadius: m.role === "user" ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                background: m.role === "user" ? "var(--bg)" : "linear-gradient(135deg, var(--purple) 0%, #7C72FF 100%)",
                color: m.role === "user" ? "var(--text)" : "#fff",
                border: m.role === "user" ? "1px solid var(--border)" : "none",
                fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
                boxShadow: m.role === "assistant" ? "0 4px 12px rgba(108,99,255,.2)" : "none",
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                padding: "12px 16px", borderRadius: "16px 16px 4px 16px",
                background: "linear-gradient(135deg, var(--purple) 0%, #7C72FF 100%)",
                display: "flex", gap: 5, alignItems: "center",
              }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "rgba(255,255,255,.85)",
                    animation: `dot 1.2s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div style={{
            padding: "8px 12px", background: "var(--rose-lt)",
            color: "var(--rose-dk)", fontSize: 11,
            borderTop: "1px solid rgba(244, 63, 94, .2)",
          }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="اسأل أي حاجة أو اكتب مهمة أوزعها..."
            disabled={loading}
            style={{
              flex: 1, padding: "10px 14px",
              border: "1px solid var(--border)", borderRadius: 24,
              background: "var(--bg)", color: "var(--text)", fontSize: 13,
            }}
          />
          <button
            onClick={quickAddTask}
            disabled={loading || !input.trim()}
            title="إضافة سريعة (بدون AI)"
            style={{
              width: 38, height: 38, borderRadius: "50%",
              border: "1px solid var(--border)", background: "var(--bg)",
              color: "var(--text-2)", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >+</button>
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              border: "none",
              background: "linear-gradient(135deg, var(--purple) 0%, #A78BFA 100%)",
              color: "#fff", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(108,99,255,.4)",
            }}
          >↑</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="ai-side">
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: 16, boxShadow: "var(--shadow)",
        }}>
          <h3 style={{
            fontSize: 12, fontWeight: 600, color: "var(--text-2)",
            marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em",
          }}>💡 اقتراحات</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                style={{
                  padding: "8px 10px", borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)", background: "var(--bg)",
                  color: "var(--text)", fontSize: 12,
                  textAlign: "right", lineHeight: 1.5,
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, var(--purple-lt) 0%, rgba(16,185,129,.15) 100%)",
          border: "1px solid rgba(108,99,255,.2)",
          borderRadius: "var(--radius)", padding: 16,
        }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: "var(--purple-dk)", marginBottom: 10 }}>
            📊 ملخص
          </h3>
          {[
            ["🔥 Streak",     streak.count + " يوم"],
            ["⚡ اليوم",      completedToday.count + " مهمة"],
            ["📋 إجمالي",     flatTasks(tasks).length + " مهمة"],
            ["🏆 منجز",       flatTasks(tasks).filter(t => t.done).length + " مهمة"],
          ].map(([l, v], i, arr) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(108,99,255,.1)" : "none",
              fontSize: 13,
            }}>
              <span style={{ color: "var(--purple-dk)" }}>{l}</span>
              <strong style={{ color: "var(--purple)" }}>{v}</strong>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes dot {
          0%, 80%, 100% { transform: scale(.6); opacity:.4 }
          40%           { transform: scale(1); opacity:1 }
        }
        @media (max-width: 880px) {
          .ai-grid { grid-template-columns: 1fr !important; }
          .ai-side { order: -1; flex-direction: row !important; flex-wrap: wrap; }
          .ai-side > div { flex: 1; min-width: 240px; }
        }
      `}</style>
    </div>
  );
}
