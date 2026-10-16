import axios from "axios";

import { SESSION_EXPIRED_EVENT, tokenStore } from "./token";

const raw = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1/";
export const API_URL = raw.endsWith("/") ? raw : `${raw}/`;
/** Swagger: http://127.0.0.1:8000/api/v1/ → http://127.0.0.1:8000/docs */
export const DOCS_URL = new URL("../../docs", API_URL).toString();

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? "";
    // Login/registerdagi 401 — oddiy "parol noto'g'ri". Qolganlari — sessiya tugagan.
    if (error.response?.status === 401 && !url.startsWith("auth/login") && !url.startsWith("auth/register")) {
      tokenStore.clear();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);
