import { request } from "./client";

export const studentsApi = {
  getAll:         (page = 1, limit = 50)  => request(`/students?page=${page}&limit=${limit}`),
  getOne:         (id)                    => request(`/students/one/${id}`),
  getArchive:     ()                      => request("/students/archive"),
  getMyGroups:    ()                      => request("/students/my/groups"),
  create:         (body)                  => request("/students", { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  update:         (id, body)              => request(`/students/${id}`, { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body) }),
  remove:         (id)                    => request(`/students/${id}`, { method: "DELETE" }),
  homeworkAnswer: (homeworkId, body)      => request(`/students/homeworkAnswer/${homeworkId}`, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
};
