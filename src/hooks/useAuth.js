const TOKEN_KEY = "token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("role");
}

export function isTokenValid() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    // not a JWT or malformed — treat as valid if present
    return true;
  }
}

const ROLE_KEY = "role";

// Turli ko'rinishdagi role qiymatini ("admin", {name:"ADMIN"}, ["TEACHER"]) → matnga keltiradi
function normalizeRole(raw) {
  if (raw == null) return null;
  let v = raw;
  if (Array.isArray(v)) v = v[0];
  if (v && typeof v === "object") v = v.name ?? v.role ?? v.title ?? v.type ?? null;
  if (v == null) return null;
  return String(v).toUpperCase();
}

// Berilgan obyekt (JWT payload yoki response body) ichidan role'ni qidiradi.
// Backendlar turli kalit nomlari ishlatadi, shuning uchun keng qamrab olamiz.
function findRole(obj) {
  if (!obj || typeof obj !== "object") return null;
  const candidates = [
    obj.role,
    obj.roles,
    obj.roleName,
    obj.role_name,
    obj.userRole,
    obj.user_role,
    obj.type,
    obj.userType,
    obj.user_type,
    obj.user?.role,
    obj.user?.roles,
    obj.user?.type,
    obj.data?.role,
    obj.data?.roles,
    obj.data?.user?.role,
    obj.data?.user?.roles,
  ];
  for (const c of candidates) {
    const r = normalizeRole(c);
    if (r) return r;
  }
  return null;
}

// JWT payload'dan role'ni topadi
function readRoleFromPayload(payload) {
  return findRole(payload);
}

// Login response body'dan role'ni topadi
export function extractRole(data) {
  return findRole(data);
}

// Joriy token (JWT) ichidan role'ni o'qiydi, bo'lmasa saqlangan role'ni qaytaradi
export function getRole() {
  const token = getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const fromJwt = readRoleFromPayload(payload);
      if (fromJwt) return fromJwt;
    } catch {
      // JWT emas — saqlangan role'ga tushamiz
    }
  }
  const stored = localStorage.getItem(ROLE_KEY);
  return stored ? stored.toUpperCase() : null;
}

export function saveRole(role) {
  if (role) localStorage.setItem(ROLE_KEY, String(role).toUpperCase());
}

export function removeRole() {
  localStorage.removeItem(ROLE_KEY);
}

// Role'ga mos bosh sahifa yo'li
export function getHomePathForRole(role) {
  switch (String(role ?? "").toUpperCase()) {
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    case "SUPERADMIN":
    case "ADMIN":
    default:
      // role aniqlanmasa ham eski xatti-harakatni saqlaymiz (admin paneli)
      return "/dashboard";
  }
}
