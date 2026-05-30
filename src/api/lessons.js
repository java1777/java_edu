import { request } from "./client";

export const lessonsApi = {
  getAll:       ()          => request("/lessons"),
  getByGroup:   (groupId)   => request(`/lessons/my/group/${groupId}`),
  create:       (body)      => request("/lessons", { method: "POST", body: JSON.stringify(body) }),
};
