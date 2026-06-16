export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const today = () => new Date().toDateString();

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const monthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const formatTime = (secs) => {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export const flatTasks = (tasks) => Object.values(tasks).flat();

export const todayAr = () =>
  new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatDate = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ─── AI Task Classification ───────────────────────────────
export function classifyTaskHeuristically(text) {
  const t = text.toLowerCase();
  const urgentImportant = ["عاجل", "فوري", "حالاً", "ضروري", "طارئ", "bug", "crash", "error", "خطأ", "حريق", "مشكلة كبيرة"];
  const urgentNotImportant = ["إيميل", "رد على", "اتصال", "رسالة", "اجتماع قصير", "تليفون"];
  const neither = ["تصفح", "سوشيال", "يوتيوب", "تيك توك", "انستجرام", "فيسبوك", "ألعاب", "game"];

  if (urgentImportant.some((k) => t.includes(k))) return "q1";
  if (urgentNotImportant.some((k) => t.includes(k))) return "q3";
  if (neither.some((k) => t.includes(k))) return "q4";
  return "q2";
}

// ─── API call to Anthropic Claude (direct browser call) ───
// Uses VITE_ANTHROPIC_KEY environment variable (set in Vercel).
// This relies on Anthropic's CORS support for browser requests
// (anthropic-dangerous-direct-browser-access: true).
export async function askAI({ system, messages, signal }) {
  const key = import.meta.env.VITE_ANTHROPIC_KEY;
  if (!key) {
    throw new Error("مفيش API Key — حط VITE_ANTHROPIC_KEY في Vercel Environment Variables");
  }

  const body = {
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || m.text || "").slice(0, 8000),
    })),
  };
  if (system) body.system = String(system).slice(0, 4000);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}
