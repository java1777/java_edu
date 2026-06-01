import { request } from "./client";

export const homeworkApi = {
  getAll:       ()                               => request("/homework/all"),
  getOwn:       (lessonId)                       => request(`/homework/own/${lessonId}`),
  getByGroup:   (groupId)                        => request(`/homework/${groupId}`),
  getResults:   (groupId, homeworkId)            => request(`/group/${groupId}/homework/${homeworkId}/results`),
  getResult:    (groupId, homeworkId, studentId) => request(`/group/${groupId}/homework/${homeworkId}/result/${studentId}`),
  create:       (body)                           => request("/homework", { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  check:        (groupId, homeworkId, body)      => request(`/group/${groupId}/homework/${homeworkId}/check`, { method: "POST", body: JSON.stringify(body) }),
};
