import type { PageResult, User } from "../types";
import { apiClient } from "./http";

export async function listUsers(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}): Promise<PageResult<User>> {
  const { data } = await apiClient.get("/users", { params });
  return data;
}

export async function updateUserStatus(userId: string, status: number): Promise<void> {
  await apiClient.patch(`/users/${userId}/status`, { status });
}
