import { request } from "./client";

export const groupsApi = {
  getAll:       ()           => request("/groups/all"),
  getOne:       (id)         => request(`/groups/one/${id}`),
  getById:      (id)         => request(`/groups/${id}`),
  getStudents:  (groupId)    => request(`/groups/one/students/${groupId}`),
  getArchive:   ()           => request("/groups/archive"),
  getSchedules: (groupId)    => request(`/groups/${groupId}/schedules`),
  getLesson:    (groupId)    => request(`/groups/${groupId}/lesson`),
  // Student: guruh darslari (uy vazifa statusi bilan)
  getStudentLessonsAll: (groupId) => request(`/groups/${groupId}/lessons/all`),
  getStudentLessons:    (groupId) => request(`/groups/${groupId}/lessons`),
  // Student: bitta dars — videolar va uy vazifalari
  getLessonVideos:      (groupId, lessonId) => request(`/groups/${groupId}/lessons/${lessonId}/videos`),
  getLessonHomeworks:   (groupId, lessonId) => request(`/groups/${groupId}/lessons/${lessonId}/homeworks`),
  create:       (body)       => request("/groups", { method: "POST", body: JSON.stringify(body) }),
  createLesson: (groupId, body) => request(`/groups/${groupId}/lesson`, { method: "POST", body: JSON.stringify(body) }),
  update:       (id, body)   => request(`/groups/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove:       (id)         => request(`/groups/${id}`, { method: "DELETE" }),
};
