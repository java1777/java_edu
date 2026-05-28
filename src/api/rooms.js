import { request } from "./client";

export const roomsApi = {
  getAll:    ()           => request("/rooms"),
  getOne:    (id)         => request(`/rooms/one/${id}`),
  getArchive:()           => request("/rooms/arxive"),
  create:    (body)       => request("/rooms", { method: "POST", body: JSON.stringify(body) }),
  update:    (id, body)   => request(`/rooms/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove:    (id)         => request(`/rooms/${id}`, { method: "DELETE" }),
};
