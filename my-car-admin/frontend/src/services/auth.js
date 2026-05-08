import { apiClient } from "./http";
export async function login(payload) {
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
}
export async function getProfile() {
    const { data } = await apiClient.get("/auth/me");
    return data;
}
