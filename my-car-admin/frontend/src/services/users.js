import { apiClient } from "./http";
export async function listUsers(params) {
    const { data } = await apiClient.get("/users", { params });
    return data;
}
export async function updateUserStatus(userId, status) {
    await apiClient.patch(`/users/${userId}/status`, { status });
}
