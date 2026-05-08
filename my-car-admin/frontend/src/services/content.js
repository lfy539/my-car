import { apiClient } from "./http";
export async function listBrands() {
    const { data } = await apiClient.get("/brands", { params: { page: 1, pageSize: 100 } });
    return data;
}
export async function createBrand(payload) {
    const { data } = await apiClient.post("/brands", payload);
    return data;
}
export async function updateBrand(id, payload) {
    const { data } = await apiClient.put(`/brands/${id}`, payload);
    return data;
}
export async function deleteBrand(id) {
    await apiClient.delete(`/brands/${id}`);
}
export async function listBanners() {
    const { data } = await apiClient.get("/banners", { params: { page: 1, pageSize: 100 } });
    return data;
}
export async function createBanner(payload) {
    const { data } = await apiClient.post("/banners", payload);
    return data;
}
export async function updateBanner(id, payload) {
    const { data } = await apiClient.put(`/banners/${id}`, payload);
    return data;
}
export async function deleteBanner(id) {
    await apiClient.delete(`/banners/${id}`);
}
export async function listWallpapers(brandId) {
    const { data } = await apiClient.get("/wallpapers", {
        params: { page: 1, pageSize: 100, brandId: brandId || "" }
    });
    return data;
}
export async function createWallpaper(payload) {
    const { data } = await apiClient.post("/wallpapers", payload);
    return data;
}
export async function updateWallpaper(id, payload) {
    const { data } = await apiClient.put(`/wallpapers/${id}`, payload);
    return data;
}
export async function deleteWallpaper(id) {
    await apiClient.delete(`/wallpapers/${id}`);
}
export async function listSounds(brandId) {
    const { data } = await apiClient.get("/sounds", {
        params: { page: 1, pageSize: 100, brandId: brandId || "" }
    });
    return data;
}
export async function createSound(payload) {
    const { data } = await apiClient.post("/sounds", payload);
    return data;
}
export async function updateSound(id, payload) {
    const { data } = await apiClient.put(`/sounds/${id}`, payload);
    return data;
}
export async function deleteSound(id) {
    await apiClient.delete(`/sounds/${id}`);
}
async function uploadFile(url, file) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post(url, form, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return data.url;
}
export const uploadBrandLogo = (file) => uploadFile("/brands/upload-logo", file);
export const uploadBannerImage = (file) => uploadFile("/banners/upload-image", file);
export const uploadWallpaperCover = (file) => uploadFile("/wallpapers/upload-cover", file);
export async function uploadWallpaperOrigin(file) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post("/wallpapers/upload-origin", form, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
}
export const uploadSoundCover = (file) => uploadFile("/sounds/upload-cover", file);
export const uploadSoundAudio = (file) => uploadFile("/sounds/upload-audio", file);
