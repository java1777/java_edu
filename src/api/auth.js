import { BASE_URL } from "./client";

// Auth endpointlari — public (token shart emas). client.js'dagi request()
// 401'da /login'ga redirect qiladi, shuning uchun bu yerda alohida fetch.
async function authRequest(path, body, method = "POST") {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Xatolik: ${res.status}`);
  }

  return data;
}

export const authApi = {
  login:          ({ phone, password }) => authRequest("/auth/login", { phone, password }),
  sendOtp:        ({ phone })           => authRequest("/auth/send-otp", { phone }),
  verifyOtp:      ({ phone, otp })      => authRequest("/auth/verify-otp", { phone, otp: String(otp).trim() }),
  refreshToken:   ({ token })           => authRequest("/auth/refresh-token", { token }),
  changePassword: ({ phone, password }) => authRequest("/auth/change-password", { phone, password }, "PUT"),
};
