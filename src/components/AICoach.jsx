import { useState, useRef } from "react";
import { askAI, uid, classifyTaskHeuristically } from "../utils/helpers";

export default function AICoach({ tasks, streak, completedToday, onDistributeTasks }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "أهلاً! أنا مدربك الذكي 🤖\nأقدر أساعدك تحلل مهامك، تحدد أولوياتك، أو توزع مهام جديدة على المصفوفة. جرب تقول لي: \"وزع مهامي\" أو اسألني أي سؤال!" }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const flatAll = Object.entries(tasks).flatMap(([q, arr]) => arr.map(t => ({ ...t, q })));

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", text };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    if (/وزع|أضف مهام|distribute|add tasks/i.test(text)) {
      await distributeTasks(text);
      setLoading(false);
      return;
    }

    const tasksSummary = flatAll.length
      ? flatAll.map(t => `[${t.q.toUpperCase()}] ${t.text} — ${t.done ? "✅ منتهية" : "⏳ معلقة"}`).join("\n")
      : "لا توجد مهام حالياً";

    const system = `أنت مدرب إنتاجية ذكي باللغة العربية. بتساعد المستخدم على تنظيم وقته وتحقيق أهدافه.
المستخدم لديه:
- سلسلة ${streak.count} يوم
- أنجز ${completedToday.count} مهمة اليوم
- مهامه:
${tasksSummary}

رد بشكل ودود ومحفز ومختصر. استخدم emojis بشكل معقول.`;

    try {
      const reply = await askAI({
        system,
        messages: [...messages, userMsg].map(m => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.text,
        })),
      });
      setMessages((p) => [...p, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages((p) => [...p, { role: "assistant", text: "❌ حصل خطأ: " + e.message }]);
    }

    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function distributeTasks(userText) {
    const system = `أنت مساعد ذكي. المستخدم يريد إضافة مهام وتوزيعها على مصفوفة أيزنهاور.
الربعات: q1 (عاجل ومهم), q2 (مهم وغير عاجل), q3 (عاجل وغير مهم), q4 (غير عاجل وغير مهم).
استخرج المهام من رسالة المستخدم ووزعها. إذا لم تجد مهام محددة، اقترح 3 مهام عامة مفيدة.
رد بـ JSON فقط بهذا الشكل بدون أي نص إضافي:
{"tasks": [{"text": "نص المهمة", "q": "q1"}]}`;

    try {
      const reply = await askAI({
        system,
        messages: [{ role: "user", content: userText }],
      });
      const clean = reply.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (parsed.tasks?.length) {
        const distributed = { q1: [], q2: [], q3: [], q4: [] };
        parsed.tasks.forEach(t => {
          const q = distributed[t.q] ? t.q : classifyTaskHeuristically(t.text);
          distributed[q].push({ id: uid(), text: t.text, done: false, createdAt: Date.now() });
        });
        onDistributeTasks(distributed);
        setMessages((p) => [...p, { role: "assistant", text: `✅ تم توزيع ${parsed.tasks.length} مهام على المصفوفة! روح تاب المصفوفة تشوفها 🎯` }]);
      }
    } catch (e) {
      setMessages((p) => [...p, { role: "assistant", text: "❌ مقدرتش أوزع المهام: " + e.message }]);
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#EAE8FF", margin: 0 }}>AI Coach 🤖</h2>
        <p style={{ color: "#8B87C0", fontSize: 13, marginTop: 4 }}>مدربك الذكي الشخصي</p>
      </div>

      <div style={{
        background: "rgba(17,15,38,.8)", border: "1px solid rgba(124,110,255,.2)",
        borderRadius: 16, padding: "1rem", height: 400, overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 12, marginBottom: 12,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-start" : "flex-end" }}>
            <div style={{
              maxWidth: "80%", padding: "10px 14px", borderRadius: 14,
              background: m.role === "user" ? "rgba(108,99,255,.25)" : "rgba(16,217,138,.12)",
              border: m.role === "user" ? "1px solid rgba(108,99,255,.3)" : "1px solid rgba(16,217,138,.2)",
              color: "#EAE8FF", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ padding: "10px 14px", borderRadius: 14, background: "rgba(16,217,138,.12)", border: "1px solid rgba(16,217,138,.2)", color: "#10D98A", fontSize: 13 }}>
              ✨ جاري التفكير...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {["حلل مهامي", "وزع مهامي على المصفوفة", "نصيحة لزيادة الإنتاجية", "ما هي أولوياتي اليوم؟"].map(s => (
          <button key={s} onClick={() => setInput(s)} style={{
            padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(124,110,255,.3)",
            background: "rgba(124,110,255,.1)", color: "#A89BFF", fontSize: 12,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="اكتب سؤالك أو مهامك هنا..."
          style={{
            flex: 1, padding: "11px 14px", borderRadius: 12,
            background: "rgba(255,255,255,.06)", border: "1px solid rgba(124,110,255,.25)",
            color: "#EAE8FF", fontSize: 14,
          }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          padding: "11px 18px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg, #6C63FF, #4338CA)",
          color: "#fff", fontSize: 16, fontWeight: 700,
          opacity: loading || !input.trim() ? .5 : 1,
        }}>➤</button>
      </div>
    </div>
  );
}