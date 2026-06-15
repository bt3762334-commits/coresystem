import { userKey } from "./auth";

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const today = () => new Date().toDateString();

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

export const formatTime = (secs) => {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export const flatTasks = (tasks) => Object.values(tasks).flat();

export const todayAr = () =>
  new Date().toLocaleDateString("ar-EG", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

export const formatDate = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("ar-EG", { year:"numeric", month:"long", day:"numeric" });
};

export function classifyTaskHeuristically(text) {
  const t = text.toLowerCase();
  const q1w = ["عاجل","فوري","حالاً","ضروري","طارئ","bug","crash","error","خطأ","مشكلة كبيرة","urgent"];
  const q3w = ["إيميل","email","رد على","اتصال","رسالة","اجتماع قصير","تليفون","call"];
  const q4w = ["تصفح","سوشيال","يوتيوب","تيك توك","انستجرام","فيسبوك","ألعاب","game","netflix"];
  if (q1w.some(k => t.includes(k))) return "q1";
  if (q3w.some(k => t.includes(k))) return "q3";
  if (q4w.some(k => t.includes(k))) return "q4";
  return "q2";
}

// Direct Anthropic API call from browser
export async function askAI({ system, messages, signal }) {
  const key = import.meta.env.VITE_ANTHROPIC_KEY;
  if (!key) {
    throw new Error("مفيش API Key — حط VITE_ANTHROPIC_KEY في ملف .env");
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages,
    }),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `فشل الطلب: ${res.status}`);
  }
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}
