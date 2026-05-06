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

let audioContext: WechatMiniprogram.InnerAudioContext | null = null;
const API_HOST = 'https://api.breakcode.top';

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
    if (audioContext) {
      audioContext.stop();
      audioContext.destroy();
      audioContext = null;
    }
    (this as any)._audioBound = false;
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
    if (!audioContext) {
      audioContext = wx.createInnerAudioContext();
      (this as any)._audioSrcSet = false;
      (this as any)._currentAudioUrl = '';
    }
    if ((this as any)._audioBound) return;

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
      console.error('[AudioDebug] last audioUrl:', (this as any)._currentAudioUrl || '');
      this.setData({ isPlaying: false, playingId: '' });
      if (String(err?.errMsg || '').includes('audioInstance')) {
        try {
          audioContext?.destroy();
        } catch (e) {
          console.warn('destroy audio context failed:', e);
        }
        audioContext = null;
        (this as any)._audioBound = false;
        (this as any)._audioSrcSet = false;
        (this as any)._currentAudioUrl = '';
      }
      wx.showToast({ title: `播放失败(${err?.errCode || '未知'})`, icon: 'none' });
    });

    (this as any)._audioBound = true;
  },

  normalizeMediaUrl(rawUrl?: string): string {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('https://')) return rawUrl;
    if (rawUrl.startsWith('http://')) return rawUrl.replace(/^http:\/\//, 'https://');
    if (rawUrl.startsWith('//')) return `https:${rawUrl}`;
    if (rawUrl.startsWith('/')) return `${API_HOST}${rawUrl}`;
    return `${API_HOST}/${rawUrl}`;
  },

  getAudioUrl(item: Sound & { audio?: string; fileUrl?: string; url?: string }): string {
    const raw = item.audioUrl || item.audio || item.fileUrl || item.url || '';
    return this.normalizeMediaUrl(raw);
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
        const normalizedList = (list as Array<Sound & { id?: string; audio?: string; fileUrl?: string; url?: string }>).map((item) => ({
          ...item,
          _id: item._id || item.id || '',
          coverUrl: this.normalizeMediaUrl(item.coverUrl),
          audioUrl: this.getAudioUrl(item),
        }));
        const newList = this.data.page === 1 ? normalizedList : [...this.data.list, ...normalizedList];
        
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
    if (!audioContext) {
      this.initAudio();
    }
    if (!audioContext) {
      wx.showToast({ title: '音频初始化失败', icon: 'none' });
      return;
    }

    const { id } = e.currentTarget.dataset as { id: string };
    const item = this.data.list.find((s) => s._id === id) as (Sound & { audio?: string; fileUrl?: string; url?: string }) | undefined;
    if (!item) {
      wx.showToast({ title: '音频数据不存在', icon: 'none' });
      return;
    }

    const audioUrl = this.getAudioUrl(item);
    console.log('[AudioDebug] play tap raw item:', {
      id: item._id,
      title: item.title,
      audioUrl: item.audioUrl,
      audio: (item as any).audio,
      fileUrl: (item as any).fileUrl,
      url: (item as any).url,
    });
    console.log('[AudioDebug] play tap final audioUrl:', audioUrl);

    if (!audioUrl) {
      wx.showToast({ title: '音频暂未上传', icon: 'none' });
      return;
    }
    
    const targetUrl = encodeURI(audioUrl);
    console.log('[AudioDebug] encoded audioUrl:', targetUrl);
    const currentUrl = (this as any)._currentAudioUrl || '';
    const isSameAudio = currentUrl === targetUrl && this.data.playingId === item._id;

    if (isSameAudio && this.data.isPlaying) {
      if ((this as any)._audioSrcSet) {
        audioContext.pause();
      }
      return;
    }

    if (!isSameAudio) {
      try {
        if ((this as any)._audioSrcSet) {
          audioContext.stop();
        }
      } catch (e) {
        console.warn('stop audio failed, continue to reset src:', e);
      }
      audioContext.autoplay = true;
      audioContext.src = targetUrl;
      (this as any)._currentAudioUrl = targetUrl;
      (this as any)._audioSrcSet = true;
      this.setData({ playingId: item._id });
      api.reportEvent('play', 'sound', item._id);
      return;
    }

    audioContext.play();
    this.setData({ playingId: item._id });
    api.reportEvent('play', 'sound', item._id);
  },

  onItemTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/sound/detail/index?id=${id}` });
  },

  onFavoriteTap(e: WechatMiniprogram.TouchEvent) {
    this.toggleFavorite(e);
  },

  async toggleFavorite(e: WechatMiniprogram.TouchEvent) {
    const { item } = e.currentTarget.dataset as { item: Sound & { id?: string } };
    const contentId = item._id || item.id;
    if (!contentId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }

    try {
      const checkRes = await api.checkFavorite('sound', contentId);
      if (checkRes.code === ErrorCodes.SUCCESS && checkRes.data?.isFavorite && checkRes.data.favoriteId) {
        const removeRes = await api.removeFavorite(checkRes.data.favoriteId);
        if (removeRes.code === ErrorCodes.SUCCESS) {
          wx.showToast({ title: '已取消收藏', icon: 'none' });
          return;
        }
      }

      const addRes = await api.addFavorite('sound', contentId);
      if (addRes.code === ErrorCodes.SUCCESS) {
        wx.showToast({ title: '已收藏', icon: 'success' });
      } else if (addRes.code === ErrorCodes.NOT_LOGGED_IN || addRes.code === ErrorCodes.TOKEN_EXPIRED) {
        wx.showToast({ title: '请先登录后再收藏', icon: 'none' });
      } else {
        wx.showToast({ title: addRes.message || '收藏失败', icon: 'none' });
      }
    } catch (err) {
      console.error('Toggle sound favorite failed:', err);
      wx.showToast({ title: '收藏失败', icon: 'none' });
    }
  },

  onShareAppMessage() {
    return {
      title: '精选车机音效，快来试听',
      path: '/pages/sound/index',
    };
  },
});
