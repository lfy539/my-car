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

const mockSounds: Sound[] = [
  { _id: 's1', title: '特斯拉锁车声', coverUrl: 'https://picsum.photos/200/200?random=10', audioUrl: '', brandId: '1', modelId: '', soundType: '锁车声', duration: 3, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 100 },
  { _id: 's2', title: '比亚迪启动声', coverUrl: 'https://picsum.photos/200/200?random=11', audioUrl: '', brandId: '2', modelId: '', soundType: '启动声', duration: 5, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 90 },
  { _id: 's3', title: '蔚来提示音', coverUrl: 'https://picsum.photos/200/200?random=12', audioUrl: '', brandId: '3', modelId: '', soundType: '提示音', duration: 2, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 85 },
  { _id: 's4', title: '小鹏解锁声', coverUrl: 'https://picsum.photos/200/200?random=13', audioUrl: '', brandId: '4', modelId: '', soundType: '解锁声', duration: 2, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 80 },
  { _id: 's5', title: '理想迎宾音', coverUrl: 'https://picsum.photos/200/200?random=14', audioUrl: '', brandId: '5', modelId: '', soundType: '迎宾音', duration: 4, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 75 },
  { _id: 's6', title: '零跑充电提示', coverUrl: 'https://picsum.photos/200/200?random=15', audioUrl: '', brandId: '6', modelId: '', soundType: '提示音', duration: 3, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 70 },
];

const audioContext = wx.createInnerAudioContext();

Page({
  data: {
    loading: false,
    error: '',
    list: [] as Sound[],
    brands: [] as Brand[],
    currentBrandId: '',
    page: 1,
    pageSize: 10,
    hasMore: true,
    playingId: '',
    isPlaying: false,
  },

  onLoad() {
    const storeBrands = appStore.getState().brands;
    this.setData({ brands: storeBrands.length > 0 ? storeBrands : mockBrands });
    this.loadData();
    this.initAudio();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar()!.setData({ currentTab: 'pages/sound/index' });
    }
  },

  onUnload() {
    audioContext.destroy();
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

  initAudio() {
    audioContext.onPlay(() => {
      this.setData({ isPlaying: true });
      appStore.setPlayingAudio(this.data.playingId, true);
    });

    audioContext.onPause(() => {
      this.setData({ isPlaying: false });
      appStore.setPlayingAudio(this.data.playingId, false);
    });

    audioContext.onEnded(() => {
      this.setData({ isPlaying: false, playingId: '' });
      appStore.stopAudio();
    });

    audioContext.onError((err) => {
      console.error('Audio error:', err);
      this.setData({ isPlaying: false, playingId: '' });
      wx.showToast({ title: '播放失败', icon: 'none' });
    });
  },

  async loadData() {
    if (this.data.loading) return;
    
    this.setData({ loading: true, error: '' });

    if (USE_MOCK) {
      setTimeout(() => {
        let list = mockSounds;
        if (this.data.currentBrandId) {
          list = mockSounds.filter(s => s.brandId === this.data.currentBrandId);
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
      const res = await api.getSounds({
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
      console.error('Load sounds failed:', e);
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

  onPlayTap(e: WechatMiniprogram.TouchEvent) {
    const { item } = e.currentTarget.dataset as { item: Sound };
    
    if (!item.audioUrl) {
      wx.showToast({ title: '音频暂未上传', icon: 'none' });
      return;
    }
    
    if (this.data.playingId === item._id && this.data.isPlaying) {
      audioContext.pause();
    } else {
      audioContext.src = item.audioUrl;
      audioContext.play();
      this.setData({ playingId: item._id });
      
      api.reportEvent('sound_play', item._id);
    }
  },

  onItemTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/sound/detail/index?id=${id}` });
  },

  onFavoriteTap(e: WechatMiniprogram.TouchEvent) {
    const { item } = e.currentTarget.dataset as { item: Sound };
    let favorites = wx.getStorageSync('sound_favorites') || [];
    if (!favorites.includes(item._id)) {
      favorites.push(item._id);
      wx.setStorageSync('sound_favorites', favorites);
      wx.showToast({ title: '已收藏', icon: 'success' });
    } else {
      wx.showToast({ title: '已在收藏中', icon: 'none' });
    }
  },
});
