import { request } from "./client";

export const examsApi = {
  getByGroup: (groupId) => request(`/exams/${groupId}`),
  create:     (body)    => request("/exams", { method: "POST", body: JSON.stringify(body) }),
};
