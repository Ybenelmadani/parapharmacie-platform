import { http, shouldUseLocalApiFallback } from "./http";
import { createMockReview } from "../data/mockCatalog";

export const ReviewsAPI = {
  create: ({ product_id, rating, comment }) =>
    shouldUseLocalApiFallback()
      ? Promise.resolve(createMockReview({ product_id, rating, comment }))
      : http
          .post("/reviews", { product_id, rating, comment })
          .then((r) => r.data)
          .catch(() => createMockReview({ product_id, rating, comment })),
};
