import { request } from "./client";

export const studentGroupApi = {
  getAll:  ()      => request("/student-group/all"),
  create:  (body)  => request("/student-group", { method: "POST", body: JSON.stringify(body) }),
};
