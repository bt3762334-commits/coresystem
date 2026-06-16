// ─── Auth System ──────────────────────────────────────────
const USERS_KEY = "cs_users";
const SESSION_KEY = "cs_session";

function hashPassword(password, salt = "coresystem_v1") {
  const input = salt + password + salt;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  let h2 = hash;
  for (let i = 0; i < input.length; i += 2) {
    h2 ^= input.charCodeAt(i) << 4;
    h2 = (h2 * 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register({ name, email, password }) {
  if (!name || !email || !password) {
    return { ok: false, error: "كل الحقول مطلوبة" };
  }
  if (password.length < 6) {
    return { ok: false, error: "كلمة المرور لازم 6 حروف على الأقل" };
  }

  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users[normalizedEmail]) {
    return { ok: false, error: "الإيميل ده مسجّل قبل كده" };
  }

  const user = {
    id: "u_" + Date.now().toString(36),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
    avatar: name.trim().charAt(0).toUpperCase(),
  };

  users[normalizedEmail] = user;
  saveUsers(users);

  const session = { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { ok: true, user: session };
}

export function login({ email, password }) {
  if (!email || !password) {
    return { ok: false, error: "الإيميل وكلمة المرور مطلوبين" };
  }

  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users[normalizedEmail];

  if (!user) {
    return { ok: false, error: "الإيميل مش موجود" };
  }

  if (user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: "كلمة المرور غلط" };
  }

  const session = { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { ok: true, user: session };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function userKey(baseKey, session) {
  if (!session) return baseKey;
  return `cs_${session.id}_${baseKey.replace(/^cs_/, "")}`;
}
