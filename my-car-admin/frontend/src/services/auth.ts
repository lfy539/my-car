import type { AdminProfile, LoginPayload, LoginResponse } from "../types";
import { apiClient } from "./http";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function getProfile(): Promise<AdminProfile> {
  const { data } = await apiClient.get<AdminProfile>("/auth/me");
  return data;
}
