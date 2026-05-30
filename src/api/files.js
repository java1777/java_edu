import { request } from "./client";

export const filesApi = {
  getByGroup: (groupId)          => request(`/files/${groupId}`),
  upload:     (grupId, formData) => request(`/files/group/${grupId}/upload`, { method: "POST", body: formData }),
};
