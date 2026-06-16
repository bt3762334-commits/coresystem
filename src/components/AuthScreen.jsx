import { useState } from "react";
import { register, login } from "../utils/auth";

export default function AuthScreen({ onSuccess }) {
  const [mode, setMode]     = useState("login");
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");
  }

  function switchMode(next) {
    setMode(next);
    reset();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirm) {
      setError("كلمة المرور وتأكيدها مش متطابقين");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));

    const result = mode === "register"
      ? register({ name, email, password })
      : login({ email, password });

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess(result.user);
  }

  const isLogin = mode === "login";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem 1rem",
      position: "relative",
      zIndex: 1,
    }}>
      <div
        className="slide-up"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem 1.75rem",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            width: 56, height: 56, margin: "0 auto 14px",
            borderRadius: 16,
            background: "linear-gradient(135deg, var(--purple) 0%, #A78BFA 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
            boxShadow: "var(--shadow-lg)",
          }}>⊞</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            <span className="gradient-text">Core System</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-2)" }}>
            {isLogin ? "أهلاً بيك تاني، سجّل دخول" : "أنشئ حسابك وابدأ رحلتك"}
          </p>
        </div>

        <div style={{
          display: "flex",
          background: "var(--bg)",
          padding: 4,
          borderRadius: 24,
          border: "1px solid var(--border)",
          marginBottom: "1.5rem",
        }}>
          {[
            { id: "login",    label: "تسجيل دخول" },
            { id: "register", label: "حساب جديد"  },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => switchMode(t.id)}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 20,
                border: "none",
                fontSize: 13,
                fontWeight: mode === t.id ? 600 : 400,
                background: mode === t.id ? "var(--surface)" : "transparent",
                color: mode === t.id ? "var(--text)" : "var(--text-2)",
                boxShadow: mode === t.id ? "var(--shadow)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!isLogin && (
            <Field label="الاسم" icon="👤" type="text" value={name} onChange={setName} placeholder="اسمك الكامل" autoComplete="name" />
          )}
          <Field label="الإيميل" icon="✉" type="email" value={email} onChange={setEmail} placeholder="example@mail.com" autoComplete="email" />
          <Field
            label="كلمة المرور"
            icon="🔒"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={isLogin ? "••••••••" : "6 حروف على الأقل"}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          {!isLogin && (
            <Field
              label="تأكيد كلمة المرور"
              icon="🔐"
              type="password"
              value={confirm}
              onChange={setConfirm}
              placeholder="أكّد كلمة المرور"
              autoComplete="new-password"
            />
          )}

          {error && (
            <div style={{
              padding: "9px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--rose-lt)",
              color: "var(--rose-dk)",
              fontSize: 12, fontWeight: 500,
              border: "1px solid rgba(244, 63, 94, .2)",
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: "12px 16px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: loading
                ? "var(--border-2)"
                : "linear-gradient(135deg, var(--purple) 0%, #A78BFA 100%)",
              color: "#fff",
              fontSize: 14, fontWeight: 600,
              boxShadow: loading ? "none" : "var(--shadow-lg)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 14, height: 14,
                  border: "2px solid rgba(255,255,255,.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin .8s linear infinite",
                }} />
                استنى...
              </>
            ) : (
              <>{isLogin ? "دخول" : "إنشاء الحساب"} →</>
            )}
          </button>
        </form>

        <p style={{
          marginTop: "1.25rem", textAlign: "center", fontSize: 12, color: "var(--text-3)",
        }}>
          {isLogin ? "ما عندكش حساب؟" : "عندك حساب بالفعل؟"}{" "}
          <button
            type="button"
            onClick={() => switchMode(isLogin ? "register" : "login")}
            style={{
              background: "none", border: "none",
              color: "var(--purple)", fontSize: 12, fontWeight: 600, padding: 0,
            }}
          >
            {isLogin ? "أنشئ واحد" : "سجّل دخول"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, icon, type, value, onChange, placeholder, autoComplete }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{
        display: "block", fontSize: 12, fontWeight: 500,
        color: "var(--text-2)", marginBottom: 5,
      }}>{label}</span>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", right: 12, top: "50%",
          transform: "translateY(-50%)",
          fontSize: 14, opacity: 0.6, pointerEvents: "none",
        }}>{icon}</span>
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          style={{
            width: "100%",
            padding: "11px 36px 11px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg)",
            color: "var(--text)",
            fontSize: 14,
          }}
        />
      </div>
    </label>
  );
}
