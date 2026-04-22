import axios from "axios";
const PROD_API_BASE = "https://api.breakcode.top/api/v1";
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== "undefined" && window.location.hostname.endsWith("breakcode.top")
    ? PROD_API_BASE
    : "http://127.0.0.1:8000/api/v1");
const client = axios.create({
    baseURL: API_BASE,
    timeout: 15000
});
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export async function listUsers(params) {
    const { data } = await client.get("/users", { params });
    return data;
}
export async function updateUserStatus(userId, status) {
    await client.patch(`/users/${userId}/status`, { status });
}
