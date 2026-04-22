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
export async function listBrands() {
    const { data } = await client.get("/brands", { params: { page: 1, pageSize: 100 } });
    return data;
}
export async function createBrand(payload) {
    const { data } = await client.post("/brands", payload);
    return data;
}
export async function updateBrand(id, payload) {
    const { data } = await client.put(`/brands/${id}`, payload);
    return data;
}
export async function deleteBrand(id) {
    await client.delete(`/brands/${id}`);
}
export async function listBanners() {
    const { data } = await client.get("/banners", { params: { page: 1, pageSize: 100 } });
    return data;
}
export async function createBanner(payload) {
    const { data } = await client.post("/banners", payload);
    return data;
}
export async function updateBanner(id, payload) {
    const { data } = await client.put(`/banners/${id}`, payload);
    return data;
}
export async function deleteBanner(id) {
    await client.delete(`/banners/${id}`);
}
export async function listWallpapers(brandId) {
    const { data } = await client.get("/wallpapers", {
        params: { page: 1, pageSize: 100, brandId: brandId || "" }
    });
    return data;
}
export async function createWallpaper(payload) {
    const { data } = await client.post("/wallpapers", payload);
    return data;
}
export async function updateWallpaper(id, payload) {
    const { data } = await client.put(`/wallpapers/${id}`, payload);
    return data;
}
export async function deleteWallpaper(id) {
    await client.delete(`/wallpapers/${id}`);
}
export async function listSounds(brandId) {
    const { data } = await client.get("/sounds", {
        params: { page: 1, pageSize: 100, brandId: brandId || "" }
    });
    return data;
}
export async function createSound(payload) {
    const { data } = await client.post("/sounds", payload);
    return data;
}
export async function updateSound(id, payload) {
    const { data } = await client.put(`/sounds/${id}`, payload);
    return data;
}
export async function deleteSound(id) {
    await client.delete(`/sounds/${id}`);
}
async function uploadFile(url, file) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await client.post(url, form, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return data.url;
}
export const uploadBrandLogo = (file) => uploadFile("/brands/upload-logo", file);
export const uploadBannerImage = (file) => uploadFile("/banners/upload-image", file);
export const uploadWallpaperCover = (file) => uploadFile("/wallpapers/upload-cover", file);
export const uploadWallpaperOrigin = (file) => uploadFile("/wallpapers/upload-origin", file);
export const uploadSoundCover = (file) => uploadFile("/sounds/upload-cover", file);
export const uploadSoundAudio = (file) => uploadFile("/sounds/upload-audio", file);
