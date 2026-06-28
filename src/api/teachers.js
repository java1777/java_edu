import { request } from "./client";

export const teachersApi = {
  getAll:    ()        => request("/teachers"),
  getMyGroups: ()      => request("/teachers/my/groups"),
  getMyProfile:()      => request("/teachers/my/profile"),
  getOne:    (id)      => request(`/teachers/one/${id}`),
  getArchive:()        => request("/teachers/archive"),
  create:    (body)    => request("/teachers", { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  update:    (id, body)=> request(`/teachers/${id}`, { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body) }),
  remove:    (id)      => request(`/teachers/${id}`, { method: "DELETE" }),
};
