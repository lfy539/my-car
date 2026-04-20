import axios from "axios";
import type { StatsOverview, StatsTopContent, StatsTrend } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/v1";

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

export async function getStatsOverview(): Promise<StatsOverview> {
  const { data } = await client.get("/stats/overview");
  return data;
}

export async function getStatsTrend(days = 7): Promise<StatsTrend> {
  const { data } = await client.get("/stats/trend", { params: { days } });
  return data;
}

export async function getStatsTopContent(limit = 10): Promise<StatsTopContent> {
  const { data } = await client.get("/stats/top-content", { params: { limit } });
  return data;
}
