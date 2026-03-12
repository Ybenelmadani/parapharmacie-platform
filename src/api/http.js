import axios from "axios";

export const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://ecomerce_back-end.test/api",
  headers: { Accept: "application/json" },
});

const GUEST_TOKEN_KEY = "guest_token";

function createGuestToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function getGuestToken() {
  if (typeof window === "undefined") return null;

  let token = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token = createGuestToken();
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  }

  return token;
}

// Add Authorization: Bearer <token> automatically if user is logged in.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const guestToken = getGuestToken();
  if (guestToken) config.headers["X-Guest-Token"] = guestToken;

  return config;
});
