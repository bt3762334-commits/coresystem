const SESSION_KEY = "cs_session";

export function userKey(session) {
  return session?.name ? session.name.toLowerCase().replace(/\s+/g, "_") : "guest";
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// Simple hash (not for real security — just local auth)
function hashPassword(pw) {
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    hash = (hash << 5) - hash + pw.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export function registerUser({ name, password, email, phone }) {
  const key = "cs_users";
  const users = JSON.parse(localStorage.getItem(key) || "{}");
  const id = name.toLowerCase().replace(/\s+/g, "_");
  if (users[id]) return { error: "الاسم ده موجود بالفعل، جرب اسم تاني" };
  users[id] = {
    name,
    email: email || "",
    phone: phone || "",
    passwordHash: hashPassword(password),
    avatar: name.charAt(0).toUpperCase(),
    createdAt: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(users));
  return { ok: true };
}

export function loginUser({ name, password }) {
  const key = "cs_users";
  const users = JSON.parse(localStorage.getItem(key) || "{}");
  const id = name.toLowerCase().replace(/\s+/g, "_");
  const user = users[id];
  if (!user) return { error: "الاسم ده مش موجود" };
  if (user.passwordHash !== hashPassword(password)) return { error: "الباسورد غلط" };
  const session = { name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, id };
  saveSession(session);
  return { ok: true, session };
}