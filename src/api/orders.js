import { http } from "./http";

export const OrdersAPI = {
  list: () => http.get("/orders").then(r => r.data),
  checkout: (payload) => http.post("/orders/checkout", payload).then(r => r.data),
};
