import { http } from "./http";

export const AdvisorAPI = {
  chat: ({ messages, language }) =>
    http.post("/ai/advisor", { messages, language }).then((response) => response.data),
};
