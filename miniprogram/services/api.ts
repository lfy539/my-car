/**
 * API 服务层
 * 封装所有云函数调用
 */

import request, { silentRequest, backgroundRequest } from '../utils/request';

// ============================================
// 健康检查
// ============================================

export async function checkHealth() {
  return request<{ status: string; timestamp: number }>('api-health', {});
}

// ============================================
// 用户相关
// ============================================

export async function login() {
  return request<UserInfo>('api-user', { action: 'login' });
}

export async function getUserInfo() {
  return silentRequest<UserInfo>('api-user', { action: 'getUserInfo' });
}

export async function updateUserInfo(data: Partial<UserInfo>) {
  return request<UserInfo>('api-user', { action: 'updateUserInfo', data });
}

// ============================================
// 首页
// ============================================

export async function getHomeData() {
  return request<{
    banners: any[];
    brands: Brand[];
    hotWallpapers: Wallpaper[];
    hotSounds: Sound[];
  }>('api-home', {});
}

// ============================================
// 壁纸相关
// ============================================

export async function getWallpapers(params: {
  page?: number;
  pageSize?: number;
  brandId?: string;
  modelId?: string;
  tags?: string[];
  sortBy?: 'latest' | 'hot';
}) {
  return request<{
    list: Wallpaper[];
    total: number;
    page: number;
    pageSize: number;
  }>('api-wallpapers', { action: 'list', ...params });
}

export async function getWallpaperDetail(id: string) {
  return request<Wallpaper>('api-wallpapers', { action: 'detail', id });
}

// ============================================
// 音效相关
// ============================================

export async function getSounds(params: {
  page?: number;
  pageSize?: number;
  brandId?: string;
  modelId?: string;
  soundType?: string;
  sortBy?: 'latest' | 'hot';
}) {
  return request<{
    list: Sound[];
    total: number;
    page: number;
    pageSize: number;
  }>('api-sounds', { action: 'list', ...params });
}

export async function getSoundDetail(id: string) {
  return request<Sound>('api-sounds', { action: 'detail', id });
}

// ============================================
// 收藏相关
// ============================================

export async function addFavorite(targetType: 'wallpaper' | 'sound', targetId: string) {
  return request<UserFavorite>('api-favorites', { action: 'add', targetType, targetId });
}

export async function removeFavorite(id: string) {
  return request<null>('api-favorites', { action: 'remove', id });
}

export async function getFavorites(params: {
  page?: number;
  pageSize?: number;
  targetType?: 'wallpaper' | 'sound';
}) {
  return request<{
    list: UserFavorite[];
    total: number;
    page: number;
    pageSize: number;
  }>('api-favorites', { action: 'list', ...params });
}

export async function checkFavorite(targetType: 'wallpaper' | 'sound', targetId: string) {
  return silentRequest<{ isFavorite: boolean; favoriteId?: string }>('api-favorites', {
    action: 'check',
    targetType,
    targetId,
  });
}

// ============================================
// 埋点上报
// ============================================

export async function reportEvent(
  eventType: UserEvent['eventType'],
  targetType?: 'wallpaper' | 'sound',
  targetId?: string,
  ext?: Record<string, any>
) {
  return backgroundRequest<null>('api-events', {
    action: 'report',
    eventType,
    targetType,
    targetId,
    ext,
  });
}

export async function batchReportEvents(events: Array<{
  eventType: UserEvent['eventType'];
  targetType?: 'wallpaper' | 'sound';
  targetId?: string;
  ext?: Record<string, any>;
  timestamp?: number;
}>) {
  return backgroundRequest<{ count: number }>('api-events', {
    action: 'batch',
    events,
  });
}

// ============================================
// 搜索
// ============================================

export async function getSearchSuggestions(keyword: string) {
  return silentRequest<{ suggestions: string[] }>('api-search', {
    action: 'suggest',
    keyword,
  });
}

export async function search(params: {
  keyword: string;
  type?: 'all' | 'wallpaper' | 'sound';
  page?: number;
  pageSize?: number;
}) {
  return request<SearchResult>('api-search', {
    action: 'search',
    ...params,
  });
}

export async function getHotKeywords() {
  return silentRequest<{
    keywords: Array<{ keyword: string; count: number; isHot: boolean }>;
  }>('api-search', { action: 'hot' });
}

// ============================================
// 数据统计（后台管理用）
// ============================================

export async function getStatsOverview() {
  return request<StatsOverview>('api-stats', { action: 'overview' });
}

export async function getStatsTrend(days: number = 7) {
  return request<StatsTrend>('api-stats', { action: 'trend', days });
}

export async function getStatsTopContent(limit: number = 10) {
  return request<StatsTopContent>('api-stats', { action: 'topContent', limit });
}

export async function getUserStats(params: { page?: number; pageSize?: number }) {
  return request<PageResponse<UserInfo & { favoritesCount: number; eventsCount: number }>>('api-stats', {
    action: 'userStats',
    ...params,
  });
}
