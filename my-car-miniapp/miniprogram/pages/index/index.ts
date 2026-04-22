import * as api from '../../services/api';
import { ErrorCodes } from '../../utils/error-codes';
import { appStore } from '../../stores/app';

const USE_MOCK = false;

const mockBrands: Brand[] = [
  { _id: '1', name: '特斯拉', logo: '', sort: 1 },
  { _id: '2', name: '比亚迪', logo: '', sort: 2 },
  { _id: '3', name: '蔚来', logo: '', sort: 3 },
  { _id: '4', name: '小鹏', logo: '', sort: 4 },
  { _id: '5', name: '理想', logo: '', sort: 5 },
  { _id: '6', name: '零跑', logo: '', sort: 6 },
];

const mockHotSounds: Sound[] = [
  { _id: 's1', title: '特斯拉锁车声', coverUrl: 'https://picsum.photos/100/100?random=20', audioUrl: '', brandId: '1', modelId: '', soundType: '锁车声', duration: 3, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 100 },
  { _id: 's2', title: '比亚迪迎宾音', coverUrl: 'https://picsum.photos/100/100?random=21', audioUrl: '', brandId: '2', modelId: '', soundType: '迎宾音', duration: 5, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 95 },
  { _id: 's3', title: '蔚来启动声', coverUrl: 'https://picsum.photos/100/100?random=22', audioUrl: '', brandId: '3', modelId: '', soundType: '启动声', duration: 4, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 90 },
];

Page({
  data: {
    loading: true,
    error: '',
    banners: [] as any[],
    brands: [] as Brand[],
    hotSounds: [] as Sound[],
    currentBrandId: null as string | null,
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar()!.setData({ currentTab: 'pages/index/index' });
    }
  },

  onPullDownRefresh() {
    this.loadData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadData() {
    this.setData({ loading: true, error: '' });

    if (USE_MOCK) {
      setTimeout(() => {
        this.setData({
          banners: [],
          brands: mockBrands,
          hotSounds: mockHotSounds,
          loading: false,
        });
        appStore.setBrands(mockBrands);
      }, 500);
      return;
    }

    try {
      const res = await api.getHomeData();

      if (res.code === ErrorCodes.SUCCESS) {
        const { banners = [], brands = [] } = res.data || {};
        
        this.setData({
          banners,
          brands,
          loading: false,
        });
        
        appStore.setBrands(brands);
      } else {
        this.setData({
          loading: false,
          error: res.message || '加载失败',
        });
      }
    } catch (e) {
      console.error('Load home data failed:', e);
      this.setData({
        loading: false,
        error: '网络错误，请稍后重试',
      });
    }
  },

  onBrandTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    this.setData({ currentBrandId: id });
    appStore.setCurrentBrand(id);
    wx.switchTab({ url: '/pages/wallpaper/index' });
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  goToWallpaper() {
    wx.switchTab({ url: '/pages/wallpaper/index' });
  },

  goToSound() {
    wx.switchTab({ url: '/pages/sound/index' });
  },

  goToFavorites() {
    wx.navigateTo({ url: '/pages/mine/favorites/index' });
  },

  goToAllBrands() {
    wx.switchTab({ url: '/pages/wallpaper/index' });
  },

  onSoundTap(e: WechatMiniprogram.TouchEvent) {
    const { item } = e.currentTarget.dataset;
    wx.switchTab({ url: '/pages/sound/index' });
  },
});
