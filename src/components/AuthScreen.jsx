import { useState } from "react";
import { loginUser, registerUser } from "../utils/auth";

export default function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", password: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit() {
    setError("");
    if (!form.name.trim()) return setError("اكتب اسمك الأول");
    if (!form.password) return setError("اكتب الباسورد");
    if (form.password.length < 4) return setError("الباسورد لازم 4 حروف على الأقل");

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    if (mode === "register") {
      const res = registerUser(form);
      if (res.error) { setError(res.error); setLoading(false); return; }
      // auto login after register
      const login = loginUser({ name: form.name, password: form.password });
      if (login.ok) onSuccess(login.session);
    } else {
      const res = loginUser({ name: form.name, password: form.password });
      if (res.error) { setError(res.error); setLoading(false); return; }
      onSuccess(res.session);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", zIndex: 10, padding: "1rem",
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: "rgba(17,15,38,.95)",
        border: "1px solid rgba(124,110,255,.3)",
        borderRadius: 24, padding: "2.5rem 2rem",
        backdropFilter: "blur(20px)",
        boxShadow: "0 24px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(124,110,255,.1)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #6C63FF, #4338CA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 1rem",
            boxShadow: "0 8px 32px rgba(108,99,255,.4)",
          }}>⊞</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#EAE8FF", margin: 0 }}>Core System</h1>
          <p style={{ fontSize: 12, color: "#8B87C0", marginTop: 4, letterSpacing: ".06em" }}>AI PRODUCTIVITY OS</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "rgba(255,255,255,.05)", borderRadius: 12, padding: 4, marginBottom: "1.5rem" }}>
          {[["login", "تسجيل الدخول"], ["register", "حساب جديد"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "8px", border: "none", borderRadius: 10,
              background: mode === m ? "rgba(124,110,255,.3)" : "transparent",
              color: mode === m ? "#EAE8FF" : "#8B87C0",
              fontWeight: mode === m ? 700 : 400, fontSize: 13,
              transition: "all .2s",
            }}>{label}</button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="الاسم *" value={form.name} onChange={v => set("name", v)} placeholder="اسمك" />
          <Field label="الباسورد *" value={form.password} onChange={v => set("password", v)} placeholder="••••••" type="password" />
          {mode === "register" && <>
            <Field label="الإيميل (اختياري)" value={form.email} onChange={v => set("email", v)} placeholder="example@mail.com" type="email" />
            <Field label="رقم الموبايل (اختياري)" value={form.phone} onChange={v => set("phone", v)} placeholder="01xxxxxxxxx" />
          </>}
        </div>

        {error && (
          <div style={{
            marginTop: 12, padding: "10px 14px", borderRadius: 10,
            background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)",
            color: "#FCA5A5", fontSize: 13, textAlign: "center",
          }}>{error}</div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", marginTop: 20, padding: "13px",
          background: loading ? "rgba(124,110,255,.5)" : "linear-gradient(135deg, #6C63FF, #4338CA)",
          border: "none", borderRadius: 12, color: "#fff",
          fontSize: 15, fontWeight: 700,
          boxShadow: loading ? "none" : "0 4px 20px rgba(108,99,255,.4)",
        }}>
          {loading ? "⏳ جاري..." : mode === "login" ? "دخول 🚀" : "إنشاء الحساب ✨"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "#8B87C0", marginBottom: 6, fontWeight: 600 }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 10,
          background: "rgba(255,255,255,.06)", border: "1px solid rgba(124,110,255,.25)",
          color: "#EAE8FF", fontSize: 14,
        }}
      />
    </div>
  );
}