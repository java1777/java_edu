import { request } from "./client";

export const coursesApi = {
  getAll:    ()           => request("/courses"),
  getOne:    (id)         => request(`/courses/one/${id}`),
  getArchive:()           => request("/courses/archive"),
  create:    (body)       => request("/courses", { method: "POST", body: JSON.stringify(body) }),
  update:    (id, body)   => request(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove:    (id)         => request(`/courses/${id}`, { method: "DELETE" }),
};
