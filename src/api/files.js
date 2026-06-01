import { request } from "./client";

export const filesApi = {
  getByGroup: (groupId)              => request(`/files/${groupId}`),
  upload:     (groupId, lessonId, formData) =>
    request(`/files/group/${groupId}/upload?lessonId=${lessonId}`, { method: "POST", body: formData }),
};
