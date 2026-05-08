import { apiClient } from "./http";
export async function getStatsOverview() {
    const { data } = await apiClient.get("/stats/overview");
    return data;
}
export async function getStatsTrend(days = 7) {
    const { data } = await apiClient.get("/stats/trend", { params: { days } });
    return data;
}
export async function getStatsTopContent(limit = 10) {
    const { data } = await apiClient.get("/stats/top-content", { params: { limit } });
    return data;
}
