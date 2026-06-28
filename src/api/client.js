import { getToken, removeToken } from "../hooks/useAuth";

// API manzili: lokal dev uchun .env.development.local ichidagi VITE_API_URL
// ishlatiladi, bo'lmasa standart (remote) manzil.
export const BASE_URL =
  import.meta.env.VITE_API_URL || "https://najot-edu.softwareengineer.uz/api/v1";

export async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // FormData bo'lsa Content-Type qo'ymaymiz — browser o'zi qo'yadi
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    removeToken();
    window.location.replace("/login");
    return;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Xatolik: ${res.status}`);
  }

  return data;
}
