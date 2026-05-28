import { request } from "./client";

export const groupsApi = {
  getAll:       ()           => request("/groups/all"),
  getOne:       (id)         => request(`/groups/one/${id}`),
  getStudents:  (groupId)    => request(`/groups/one/students/${groupId}`),
  getArchive:   ()           => request("/groups/archive"),
  getSchedules: (groupId)    => request(`/groups/${groupId}/schedules`),
  getLesson:    (groupId)    => request(`/groups/${groupId}/lesson`),
  create:       (body)       => request("/groups", { method: "POST", body: JSON.stringify(body) }),
  createLesson: (groupId, body) => request(`/groups/${groupId}/lesson`, { method: "POST", body: JSON.stringify(body) }),
  update:       (id, body)   => request(`/groups/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove:       (id)         => request(`/groups/${id}`, { method: "DELETE" }),
};
