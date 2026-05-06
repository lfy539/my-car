import * as api from '../../../services/api';
import { ErrorCodes } from '../../../utils/error-codes';
import { appStore } from '../../../stores/app';

let audioContext: WechatMiniprogram.InnerAudioContext | null = null;
const API_HOST = 'https://api.breakcode.top';

Page({
  data: {
    loading: true,
    sound: null as Sound | null,
    brandName: '',
    isFavorite: false,
    favoriteId: '',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    similarList: [] as Sound[],
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadDetail(id);
    }
    this.initAudio();
  },

  onUnload() {
    if (audioContext) {
      audioContext.stop();
      audioContext.destroy();
      audioContext = null;
    }
    (this as any)._audioBound = false;
  },

  initAudio() {
    if (!audioContext) {
      audioContext = wx.createInnerAudioContext();
    }
    if ((this as any)._audioBound) return;

    audioContext.onPlay(() => {
      this.setData({ isPlaying: true });
    });

    audioContext.onPause(() => {
      this.setData({ isPlaying: false });
    });

    audioContext.onStop(() => {
      this.setData({ isPlaying: false, currentTime: 0, progress: 0 });
    });

    audioContext.onEnded(() => {
      this.setData({ isPlaying: false, currentTime: 0, progress: 0 });
    });

    audioContext.onTimeUpdate(() => {
      const { currentTime, duration } = audioContext;
      if (duration > 0) {
        this.setData({
          currentTime,
          duration,
          progress: (currentTime / duration) * 100,
        });
      }
    });

    audioContext.onError((err) => {
      console.error('Audio error:', err);
      console.error('[AudioDebug][detail] current audioUrl:', this.data.sound?.audioUrl || '');
      this.setData({ isPlaying: false });
      wx.showToast({ title: `播放失败(${err?.errCode || '未知'})`, icon: 'none' });
    });

    (this as any)._audioBound = true;
  },

  async loadDetail(id: string) {
    this.setData({ loading: true });
    try {
      await this.ensureBrandsLoaded();
      const res = await api.getSoundDetail(id);
      if (res.code !== ErrorCodes.SUCCESS || !res.data) {
        throw new Error(res.message || '音效不存在');
      }

      const sound = res.data as Sound & { id?: string };
      const contentId = sound._id || sound.id || id;
      const normalizedSound = {
        ...sound,
        coverUrl: this.normalizeMediaUrl(sound.coverUrl),
        audioUrl: this.normalizeMediaUrl(sound.audioUrl),
      };
      const favRes = await api.checkFavorite('sound', contentId);
      const isFavorite = favRes.code === ErrorCodes.SUCCESS && !!favRes.data?.isFavorite;
      const favoriteId = isFavorite ? favRes.data?.favoriteId || '' : '';
      const brandName = this.resolveBrandName(sound);

      this.setData({
        sound: { ...normalizedSound, _id: contentId },
        brandName,
        duration: normalizedSound.duration,
        loading: false,
        isFavorite,
        favoriteId,
        similarList: [],
      });
      this.saveBrowseHistory({
        type: 'sound',
        id: contentId,
        title: normalizedSound.title,
        coverUrl: normalizedSound.coverUrl,
      });
      if (normalizedSound.audioUrl) {
        if (!audioContext) this.initAudio();
        if (!audioContext) throw new Error('audio init failed');
        console.log('[AudioDebug][detail] set audioUrl:', normalizedSound.audioUrl);
        audioContext.src = encodeURI(normalizedSound.audioUrl);
      }
    } catch (e) {
      console.error('Load sound detail failed:', e);
      wx.showToast({ title: '音效不存在', icon: 'none' });
      this.setData({ loading: false });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  resolveBrandName(sound: Sound & { brandName?: string; brand?: { name?: string } }): string {
    if (sound.brandName) return sound.brandName;
    if (sound.brand?.name) return sound.brand.name;
    const brands = appStore.getState().brands || [];
    const matched = brands.find((b) => b._id === sound.brandId || b.name === sound.brandId);
    return matched?.name || '未知';
  },

  async ensureBrandsLoaded() {
    const brands = appStore.getState().brands || [];
    if (brands.length > 0) return;
    try {
      const homeRes = await api.getHomeData();
      if (homeRes.code === ErrorCodes.SUCCESS && homeRes.data?.brands?.length) {
        appStore.setBrands(homeRes.data.brands);
      }
    } catch (e) {
      console.warn('ensureBrandsLoaded failed:', e);
    }
  },

  saveBrowseHistory(record: { type: 'wallpaper' | 'sound'; id: string; title: string; coverUrl: string }) {
    const history = wx.getStorageSync('browse_history') || [];
    const filtered = history.filter((item: any) => !(item.type === record.type && item.id === record.id));
    filtered.unshift({ ...record, viewAt: Date.now() });
    wx.setStorageSync('browse_history', filtered.slice(0, 200));
  },

  normalizeMediaUrl(rawUrl?: string): string {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('https://')) return rawUrl;
    if (rawUrl.startsWith('http://')) return rawUrl.replace(/^http:\/\//, 'https://');
    if (rawUrl.startsWith('//')) return `https:${rawUrl}`;
    if (rawUrl.startsWith('/')) return `${API_HOST}${rawUrl}`;
    return `${API_HOST}/${rawUrl}`;
  },

  downloadAudio(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            resolve(res.tempFilePath);
            return;
          }
          reject(new Error(`download status ${res.statusCode}`));
        },
        fail: reject,
      });
    });
  },

  saveAudioFile(tempFilePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.saveFile({
        tempFilePath,
        success: (res) => resolve(res.savedFilePath),
        fail: reject,
      });
    });
  },

  onPlayToggle() {
    if (!audioContext) {
      this.initAudio();
    }
    if (!audioContext) {
      wx.showToast({ title: '音频初始化失败', icon: 'none' });
      return;
    }

    const { sound, isPlaying } = this.data;
    if (!sound || !sound.audioUrl) {
      wx.showToast({ title: '音频暂未上传', icon: 'none' });
      return;
    }
    if (isPlaying) {
      audioContext.pause();
    } else {
      audioContext.play();
    }
  },

  onSeek(e: WechatMiniprogram.SliderChange) {
    if (!audioContext) return;
    const { value } = e.detail;
    const { duration } = audioContext;
    if (duration > 0) {
      const seekTime = (value / 100) * duration;
      audioContext.seek(seekTime);
    }
  },

  async onToggleFavorite() {
    const { sound, isFavorite, favoriteId } = this.data;
    if (!sound) return;
    const contentId = sound._id;
    try {
      if (isFavorite && favoriteId) {
        const res = await api.removeFavorite(favoriteId);
        if (res.code === ErrorCodes.SUCCESS) {
          this.setData({ isFavorite: false, favoriteId: '' });
          wx.showToast({ title: '已取消收藏', icon: 'none' });
          return;
        }
      } else {
        const res = await api.addFavorite('sound', contentId);
        if (res.code === ErrorCodes.SUCCESS) {
          this.setData({ isFavorite: true });
          wx.showToast({ title: '已收藏', icon: 'success' });
          const favRes = await api.checkFavorite('sound', contentId);
          if (favRes.code === ErrorCodes.SUCCESS && favRes.data?.favoriteId) {
            this.setData({ favoriteId: favRes.data.favoriteId });
          }
          return;
        }
        if (res.code === ErrorCodes.NOT_LOGGED_IN || res.code === ErrorCodes.TOKEN_EXPIRED) {
          wx.showToast({ title: '请先登录后再收藏', icon: 'none' });
          return;
        }
      }
      wx.showToast({ title: '操作失败', icon: 'none' });
    } catch (e) {
      console.error('Toggle sound favorite failed:', e);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  onDownload() {
    const { sound } = this.data;
    if (!sound) return;
    if (!sound.audioUrl) {
      wx.showToast({ title: '音频地址无效', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '下载提示',
      content: '音效文件需要在车机系统中使用，确定下载吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '下载中...' });
          try {
            const primary = this.normalizeMediaUrl(sound.audioUrl);
            const urls = Array.from(
              new Set(
                [primary]
                  .filter(Boolean)
                  .flatMap((url) => (url.startsWith('http://') ? [url, url.replace(/^http:\/\//, 'https://')] : [url]))
              )
            );
            let savedFilePath = '';
            for (const url of urls) {
              try {
                const tempPath = await this.downloadAudio(url);
                savedFilePath = await this.saveAudioFile(tempPath);
                break;
              } catch (err) {
                console.warn('download sound failed with url:', url, err);
              }
            }

            wx.hideLoading();
            if (!savedFilePath) {
              wx.showToast({ title: '下载失败，请稍后重试', icon: 'none' });
              return;
            }
            wx.showToast({ title: '下载成功', icon: 'success' });
            this.saveDownloadRecord(sound, savedFilePath);
          } catch (e) {
            wx.hideLoading();
            wx.showToast({ title: '下载失败', icon: 'none' });
          }
        }
      },
    });
  },

  saveDownloadRecord(sound: Sound, localFilePath: string) {
    let downloads = wx.getStorageSync('download_records') || [];
    const record = {
      type: 'sound',
      id: sound._id,
      title: sound.title,
      coverUrl: sound.coverUrl,
      localFilePath,
      downloadAt: Date.now(),
    };
    downloads.unshift(record);
    downloads = downloads.slice(0, 100);
    wx.setStorageSync('download_records', downloads);
  },

  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage'],
    });
  },

  onShareAppMessage() {
    const { sound } = this.data;
    return {
      title: sound?.title || '个性音效分享',
      path: `/pages/sound/detail/index?id=${sound?._id}`,
      imageUrl: sound?.coverUrl,
    };
  },

  onSimilarTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    if (audioContext) audioContext.stop();
    wx.redirectTo({ url: `/pages/sound/detail/index?id=${id}` });
  },
});
