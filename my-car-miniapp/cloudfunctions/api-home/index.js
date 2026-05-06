const axios = require('axios');

const API_BASE = process.env.ADMIN_API_BASE_URL || 'https://api.breakcode.top/api/v1';
const PUBLIC_TOKEN = process.env.ADMIN_PUBLIC_TOKEN || '';
const MEDIA_HOST = 'https://api.breakcode.top';

function headers() {
  const h = {};
  if (PUBLIC_TOKEN) {
    h.Authorization = `Bearer ${PUBLIC_TOKEN}`;
  }
  return h;
}

function toHttpsMediaUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  if (rawUrl.startsWith('https://')) return rawUrl;
  if (rawUrl.startsWith('http://')) return rawUrl.replace(/^http:\/\//, 'https://');
  if (rawUrl.startsWith('//')) return `https:${rawUrl}`;
  if (rawUrl.startsWith('/')) return `${MEDIA_HOST}${rawUrl}`;
  return `${MEDIA_HOST}/${rawUrl}`;
}

function normalizeWallpaper(item) {
  if (!item || typeof item !== 'object') return item;
  return {
    ...item,
    coverUrl: toHttpsMediaUrl(item.coverUrl),
    originUrl: toHttpsMediaUrl(item.originUrl),
  };
}

function normalizeSound(item) {
  if (!item || typeof item !== 'object') return item;
  return {
    ...item,
    coverUrl: toHttpsMediaUrl(item.coverUrl),
    audioUrl: toHttpsMediaUrl(item.audioUrl),
  };
}

exports.main = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/public/home`, {
      headers: headers(),
      timeout: 10000,
    });
    const normalized = {
      ...data,
      banners: Array.isArray(data?.banners)
        ? data.banners.map((item) => ({ ...item, imageUrl: toHttpsMediaUrl(item?.imageUrl) }))
        : [],
      hotWallpapers: Array.isArray(data?.hotWallpapers) ? data.hotWallpapers.map(normalizeWallpaper) : [],
      hotSounds: Array.isArray(data?.hotSounds) ? data.hotSounds.map(normalizeSound) : [],
    };

    return {
      code: 0,
      message: 'success',
      data: normalized,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('api-home proxy error:', err?.message || err);
    return {
      code: 5001,
      message: '获取首页数据失败',
      data: null,
      timestamp: Date.now(),
    };
  }
};
