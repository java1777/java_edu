import { request } from "./client";

export const examsApi = {
  getByGroup:       (groupId)                            => request(`/exams/${groupId}`),
  getOne:           (examId)                             => request(`/exams/one/${examId}`),
  getStudentReview: (groupId, examId, studentId, status) =>
    request(`/group/${groupId}/exam/${examId}/student/${studentId}/review?status=${status}`),
  create:           (body)                               =>
    request("/exams", { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
};
