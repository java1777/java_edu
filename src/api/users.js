import { request } from "./client";

export const usersApi = {
  getAll: () => request("/users/admin/all"),
  create: (body) => request("/users/admin", { method: "POST", body: JSON.stringify(body) }),
};
