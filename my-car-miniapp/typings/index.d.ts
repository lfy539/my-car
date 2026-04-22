/// <reference path="./wx/index.d.ts" />

declare namespace App {
  interface GlobalData {
    userInfo: UserInfo | null;
    systemInfo: WechatMiniprogram.SystemInfo | null;
    isLoggedIn: boolean;
  }
}

interface UserInfo {
  _id: string;
  openId: string;
  unionId?: string;
  nickname: string;
  avatar: string;
  phone?: string;
  status?: number;
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
}

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

interface PageData {
  list: any[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

interface Brand {
  _id: string;
  name: string;
  logo: string;
  sort: number;
}

interface CarModel {
  _id: string;
  brandId: string;
  name: string;
  sort: number;
}

interface Wallpaper {
  _id: string;
  title: string;
  coverUrl: string;
  originUrl: string;
  brandId: string;
  modelId: string;
  tags: string[];
  resolution: string;
  status: number;
  publishAt: number;
  hotScore: number;
}

interface Sound {
  _id: string;
  title: string;
  coverUrl: string;
  audioUrl: string;
  brandId: string;
  modelId: string;
  soundType: string;
  duration: number;
  bitrate: number;
  status: number;
  publishAt: number;
  hotScore: number;
}

interface UserFavorite {
  _id: string;
  userId: string;
  targetType: 'wallpaper' | 'sound';
  targetId: string;
  createdAt: number;
}

// 轮播图
interface Banner {
  _id: string;
  imageUrl: string;
  linkType: 'wallpaper' | 'sound' | 'url' | 'none';
  linkUrl?: string;
  targetId?: string;
  title?: string;
  status: number;
  sort: number;
  createdAt: number;
  updatedAt: number;
}

// 用户事件
interface UserEvent {
  _id: string;
  userId: string;
  eventType: 'view' | 'download' | 'play' | 'favorite' | 'share' | 'search';
  targetType?: 'wallpaper' | 'sound';
  targetId?: string;
  ext?: Record<string, any>;
  createdAt: number;
}

// 搜索关键词
interface SearchKeyword {
  _id: string;
  keyword: string;
  count: number;
  createdAt: number;
  updatedAt: number;
}

// 统计数据类型
interface StatsOverview {
  totalUsers: number;
  totalWallpapers: number;
  totalSounds: number;
  todayViews: number;
  todayDownloads: number;
  todayNewUsers: number;
  viewsGrowth: number;
}

interface StatsTrend {
  dates: string[];
  views: number[];
  downloads: number[];
  newUsers: number[];
}

interface StatsTopContent {
  wallpapers: Array<{
    _id: string;
    title: string;
    coverUrl: string;
    hotScore: number;
    downloadCount?: number;
    favoriteCount?: number;
  }>;
  sounds: Array<{
    _id: string;
    title: string;
    coverUrl: string;
    hotScore: number;
    playCount?: number;
    downloadCount?: number;
  }>;
}

// 搜索结果
interface SearchResult {
  wallpapers: Wallpaper[];
  sounds: Sound[];
  wallpaperTotal: number;
  soundTotal: number;
  total: number;
  page: number;
  pageSize: number;
}

// 分页响应
interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
