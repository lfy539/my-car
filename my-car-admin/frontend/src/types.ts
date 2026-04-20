export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type AdminProfile = {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  role: string;
  status: number;
};

export type Brand = {
  _id: string;
  name: string;
  logo: string;
  sort: number;
  status: number;
};

export type Banner = {
  _id: string;
  imageUrl: string;
  linkType: string;
  linkUrl: string;
  targetId: string;
  title: string;
  sort: number;
  status: number;
};

export type Wallpaper = {
  _id: string;
  title: string;
  coverUrl: string;
  originUrl: string;
  brandId: string;
  modelId: string;
  tags: string[];
  resolution: string;
  status: number;
};

export type Sound = {
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
};

export type PageResult<T> = {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type User = {
  _id: string;
  openId: string;
  unionId?: string;
  nickname: string;
  avatar: string;
  phone?: string;
  status: number;
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
  favoriteCount?: number;
  eventCount?: number;
};

export type StatsOverview = {
  totalUsers: number;
  totalWallpapers: number;
  totalSounds: number;
  todayViews: number;
  todayDownloads: number;
  todayNewUsers: number;
  viewsGrowth: number;
};

export type StatsTrend = {
  dates: string[];
  views: number[];
  downloads: number[];
  newUsers: number[];
};

export type StatsTopContent = {
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
};
