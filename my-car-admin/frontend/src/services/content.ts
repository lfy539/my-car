import type { Banner, Brand, PageResult, Sound, Wallpaper } from "../types";
import { apiClient } from "./http";

export async function listBrands(): Promise<PageResult<Brand>> {
  const { data } = await apiClient.get("/brands", { params: { page: 1, pageSize: 100 } });
  return data;
}

export async function createBrand(payload: Omit<Brand, "_id">): Promise<Brand> {
  const { data } = await apiClient.post("/brands", payload);
  return data;
}

export async function updateBrand(id: string, payload: Omit<Brand, "_id">): Promise<Brand> {
  const { data } = await apiClient.put(`/brands/${id}`, payload);
  return data;
}

export async function deleteBrand(id: string): Promise<void> {
  await apiClient.delete(`/brands/${id}`);
}

export async function listBanners(): Promise<PageResult<Banner>> {
  const { data } = await apiClient.get("/banners", { params: { page: 1, pageSize: 100 } });
  return data;
}

export async function createBanner(payload: Omit<Banner, "_id">): Promise<Banner> {
  const { data } = await apiClient.post("/banners", payload);
  return data;
}

export async function updateBanner(id: string, payload: Omit<Banner, "_id">): Promise<Banner> {
  const { data } = await apiClient.put(`/banners/${id}`, payload);
  return data;
}

export async function deleteBanner(id: string): Promise<void> {
  await apiClient.delete(`/banners/${id}`);
}

export async function listWallpapers(brandId?: string): Promise<PageResult<Wallpaper>> {
  const { data } = await apiClient.get("/wallpapers", {
    params: { page: 1, pageSize: 100, brandId: brandId || "" }
  });
  return data;
}

export async function createWallpaper(payload: Omit<Wallpaper, "_id">): Promise<Wallpaper> {
  const { data } = await apiClient.post("/wallpapers", payload);
  return data;
}

export async function updateWallpaper(
  id: string,
  payload: Omit<Wallpaper, "_id">
): Promise<Wallpaper> {
  const { data } = await apiClient.put(`/wallpapers/${id}`, payload);
  return data;
}

export async function deleteWallpaper(id: string): Promise<void> {
  await apiClient.delete(`/wallpapers/${id}`);
}

export async function listSounds(brandId?: string): Promise<PageResult<Sound>> {
  const { data } = await apiClient.get("/sounds", {
    params: { page: 1, pageSize: 100, brandId: brandId || "" }
  });
  return data;
}

export async function createSound(payload: Partial<Sound>): Promise<Sound> {
  const { data } = await apiClient.post("/sounds", payload);
  return data;
}

export async function updateSound(id: string, payload: Partial<Sound>): Promise<Sound> {
  const { data } = await apiClient.put(`/sounds/${id}`, payload);
  return data;
}

export async function deleteSound(id: string): Promise<void> {
  await apiClient.delete(`/sounds/${id}`);
}

async function uploadFile(url: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.url;
}

export const uploadBrandLogo = (file: File) => uploadFile("/brands/upload-logo", file);
export const uploadBannerImage = (file: File) => uploadFile("/banners/upload-image", file);
export const uploadWallpaperCover = (file: File) => uploadFile("/wallpapers/upload-cover", file);
export async function uploadWallpaperOrigin(file: File): Promise<{ url: string; resolution?: string }> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post("/wallpapers/upload-origin", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}
export const uploadSoundCover = (file: File) => uploadFile("/sounds/upload-cover", file);
export const uploadSoundAudio = (file: File) => uploadFile("/sounds/upload-audio", file);
