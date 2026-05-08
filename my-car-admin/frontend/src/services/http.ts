import axios, { type AxiosError } from "axios";

function getApiBase(): string {
  const envBase = import.meta.env.VITE_API_BASE as string | undefined;
  if (envBase) return envBase;

  if (typeof window === "undefined") {
    return "http://127.0.0.1:8000/api/v1";
  }

  const prodApiBase =
    window.location.protocol === "https:"
      ? "https://api.breakcode.top/api/v1"
      : "http://api.breakcode.top/api/v1";

  if (window.location.hostname.endsWith("breakcode.top")) {
    return prodApiBase;
  }
  return "http://127.0.0.1:8000/api/v1";
}

/** 管理后台统一 Axios：附带 Bearer；除登录外接口返回 401 时清理 token 并跳转登录（过期 token、服务端轮换 JWT_SECRET 等）。 */
export const apiClient = axios.create({
  baseURL: getApiBase(),
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const path = error.config?.url ?? "";
      if (!path.includes("/auth/login")) {
        localStorage.removeItem("admin_token");
        if (typeof window !== "undefined" && !window.location.pathname.endsWith("/login")) {
          window.location.replace(`${window.location.origin}/login`);
        }
      }
    }
    return Promise.reject(error);
  }
);
