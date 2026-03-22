import { http } from "./http";

export const ReviewsAPI = {
  create: ({ product_id, rating, comment }) =>
    http.post("/reviews", { product_id, rating, comment }).then(r => r.data),
};
