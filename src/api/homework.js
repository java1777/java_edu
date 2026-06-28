import { request } from "./client";

export const homeworkApi = {
  getAll:       ()                                    => request("/homework/all"),
  getOwn:       (lessonId)                            => request(`/homework/own/${lessonId}`),
  getByGroup:   (groupId)                             => request(`/homework/${groupId}`),
  getResults:   (groupId, homeworkId, status)         =>
    request(`/group/${groupId}/homework/${homeworkId}/results${status ? `?status=${status}` : ""}`),
  getResult:    (groupId, homeworkId, studentId)      =>
    request(`/group/${groupId}/homework/${homeworkId}/result/${studentId}`),
  // Swagger: bitta o'quvchining topshirig'i → { data: { homework, answer, result } }
  getStudentHomework: (groupId, lessonId, homeworkId, studentId) =>
    request(`/group/${groupId}/lesson/${lessonId}/homework/${homeworkId}/student/${studentId}`),
  create:       (body)                                =>
    request("/homework", { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  check:        (groupId, homeworkId, body)           =>
    request(`/group/${groupId}/homework/${homeworkId}/check`, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
};
