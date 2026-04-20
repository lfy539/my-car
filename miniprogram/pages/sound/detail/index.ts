import { recommendEngine } from '../../../utils/recommend';
import { audioManager } from '../../../utils/audio-manager';

const mockSounds: Record<string, Sound> = {
  's1': { _id: 's1', title: '特斯拉锁车声', coverUrl: 'https://picsum.photos/400/400?random=20', audioUrl: '', brandId: '1', modelId: '', soundType: '锁车声', duration: 3, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 100 },
  's2': { _id: 's2', title: '比亚迪迎宾音', coverUrl: 'https://picsum.photos/400/400?random=21', audioUrl: '', brandId: '2', modelId: '', soundType: '迎宾音', duration: 5, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 95 },
  's3': { _id: 's3', title: '蔚来启动声', coverUrl: 'https://picsum.photos/400/400?random=22', audioUrl: '', brandId: '3', modelId: '', soundType: '启动声', duration: 4, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 90 },
  's4': { _id: 's4', title: '小鹏解锁声', coverUrl: 'https://picsum.photos/400/400?random=23', audioUrl: '', brandId: '4', modelId: '', soundType: '解锁声', duration: 2, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 85 },
  's5': { _id: 's5', title: '理想迎宾音', coverUrl: 'https://picsum.photos/400/400?random=24', audioUrl: '', brandId: '5', modelId: '', soundType: '迎宾音', duration: 4, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 80 },
  's6': { _id: 's6', title: '零跑充电提示', coverUrl: 'https://picsum.photos/400/400?random=25', audioUrl: '', brandId: '6', modelId: '', soundType: '提示音', duration: 3, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 75 },
};

const allSounds = Object.values(mockSounds);

const brandNames: Record<string, string> = {
  '1': '特斯拉', '2': '比亚迪', '3': '蔚来', '4': '小鹏', '5': '理想', '6': '零跑',
};

const audioContext = wx.createInnerAudioContext();

Page({
  data: {
    loading: true,
    sound: null as Sound | null,
    brandName: '',
    isFavorite: false,
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
    audioContext.stop();
    audioContext.destroy();
  },

  initAudio() {
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
      this.setData({ isPlaying: false });
      wx.showToast({ title: '播放失败', icon: 'none' });
    });
  },

  loadDetail(id: string) {
    setTimeout(() => {
      const sound = mockSounds[id];
      if (sound) {
        const similarList = recommendEngine.getSimilarSounds(sound, allSounds);
        
        const validUrls = similarList.filter(s => s.audioUrl).map(s => s.audioUrl);
        if (validUrls.length > 0) {
          audioManager.preload(validUrls);
        }
        
        this.setData({
          sound,
          brandName: brandNames[sound.brandId] || '未知',
          duration: sound.duration,
          loading: false,
          isFavorite: this.checkFavorite(id),
          similarList,
        });
        if (sound.audioUrl) {
          audioContext.src = sound.audioUrl;
        }
      } else {
        wx.showToast({ title: '音效不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    }, 300);
  },

  checkFavorite(id: string): boolean {
    const favorites = wx.getStorageSync('sound_favorites') || [];
    return favorites.includes(id);
  },

  onPlayToggle() {
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
    const { value } = e.detail;
    const { duration } = audioContext;
    if (duration > 0) {
      const seekTime = (value / 100) * duration;
      audioContext.seek(seekTime);
    }
  },

  onToggleFavorite() {
    const { sound, isFavorite } = this.data;
    if (!sound) return;

    let favorites = wx.getStorageSync('sound_favorites') || [];
    
    if (isFavorite) {
      favorites = favorites.filter((id: string) => id !== sound._id);
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      favorites.push(sound._id);
      wx.showToast({ title: '已收藏', icon: 'success' });
    }
    
    wx.setStorageSync('sound_favorites', favorites);
    this.setData({ isFavorite: !isFavorite });
  },

  onDownload() {
    const { sound } = this.data;
    if (!sound) return;

    wx.showModal({
      title: '下载提示',
      content: '音效文件需要在车机系统中使用，确定下载吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '下载中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '已保存到下载记录', icon: 'success' });
            this.saveDownloadRecord(sound);
          }, 1000);
        }
      },
    });
  },

  saveDownloadRecord(sound: Sound) {
    let downloads = wx.getStorageSync('download_records') || [];
    const record = {
      type: 'sound',
      id: sound._id,
      title: sound.title,
      coverUrl: sound.coverUrl,
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
    audioContext.stop();
    wx.redirectTo({ url: `/pages/sound/detail/index?id=${id}` });
  },
});
