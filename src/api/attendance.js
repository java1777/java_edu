import { request } from "./client";

export const attendanceApi = {
  getAll:  ()      => request("/attendance/all"),
  create:  (body)  => request("/attendance", { method: "POST", body: JSON.stringify(body) }),
};
