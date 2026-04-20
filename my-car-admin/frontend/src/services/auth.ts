import axios from "axios";
import type { AdminProfile, LoginPayload, LoginResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/v1";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function getProfile(token: string): Promise<AdminProfile> {
  const { data } = await client.get<AdminProfile>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}
