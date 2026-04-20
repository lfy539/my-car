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

const mockWallpapers: Wallpaper[] = [
  { _id: 'w1', title: '特斯拉 Model S 壁纸', coverUrl: 'https://picsum.photos/400/600?random=1', originUrl: '', brandId: '1', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 100 },
  { _id: 'w2', title: '比亚迪汉 EV 壁纸', coverUrl: 'https://picsum.photos/400/600?random=2', originUrl: '', brandId: '2', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 90 },
  { _id: 'w3', title: '蔚来 ET7 壁纸', coverUrl: 'https://picsum.photos/400/600?random=3', originUrl: '', brandId: '3', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 85 },
  { _id: 'w4', title: '小鹏 P7 壁纸', coverUrl: 'https://picsum.photos/400/600?random=4', originUrl: '', brandId: '4', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 80 },
  { _id: 'w5', title: '理想 L9 壁纸', coverUrl: 'https://picsum.photos/400/600?random=5', originUrl: '', brandId: '5', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 75 },
  { _id: 'w6', title: '零跑 C11 壁纸', coverUrl: 'https://picsum.photos/400/600?random=6', originUrl: '', brandId: '6', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 70 },
];

Page({
  data: {
    loading: false,
    error: '',
    list: [] as Wallpaper[],
    brands: [] as Brand[],
    currentBrandId: '',
    page: 1,
    pageSize: 10,
    hasMore: true,
  },

  onLoad(options) {
    const { brandId } = options;
    if (brandId) {
      this.setData({ currentBrandId: brandId });
    }
    
    const storeBrands = appStore.getState().brands;
    this.setData({ brands: storeBrands.length > 0 ? storeBrands : mockBrands });
    this.loadData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar()!.setData({ currentTab: 'pages/wallpaper/index' });
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, list: [] });
    this.loadData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadData();
    }
  },

  async loadData() {
    if (this.data.loading) return;
    
    this.setData({ loading: true, error: '' });

    if (USE_MOCK) {
      setTimeout(() => {
        let list = mockWallpapers;
        if (this.data.currentBrandId) {
          list = mockWallpapers.filter(w => w.brandId === this.data.currentBrandId);
        }
        this.setData({
          list,
          hasMore: false,
          loading: false,
        });
      }, 500);
      return;
    }

    try {
      const res = await api.getWallpapers({
        page: this.data.page,
        pageSize: this.data.pageSize,
        brandId: this.data.currentBrandId || undefined,
        sortBy: 'latest',
      });

      if (res.code === ErrorCodes.SUCCESS) {
        const { list = [], total = 0 } = res.data || {};
        const newList = this.data.page === 1 ? list : [...this.data.list, ...list];
        
        this.setData({
          list: newList,
          page: this.data.page + 1,
          hasMore: newList.length < total,
          loading: false,
        });
      } else {
        this.setData({
          loading: false,
          error: res.message || '加载失败',
        });
      }
    } catch (e) {
      console.error('Load wallpapers failed:', e);
      this.setData({
        loading: false,
        error: '网络错误',
      });
    }
  },

  onFilterTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    if (id === this.data.currentBrandId) return;
    
    this.setData({
      currentBrandId: id,
      page: 1,
      hasMore: true,
      list: [],
    });
    
    this.loadData();
  },

  onItemTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/wallpaper/detail/index?id=${id}` });
  },
});
