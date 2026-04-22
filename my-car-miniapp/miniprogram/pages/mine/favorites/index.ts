const mockWallpapers: Record<string, Wallpaper> = {
  'w1': { _id: 'w1', title: '特斯拉 Model S 壁纸', coverUrl: 'https://picsum.photos/400/600?random=1', originUrl: '', brandId: '1', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 100 },
  'w2': { _id: 'w2', title: '比亚迪汉 EV 壁纸', coverUrl: 'https://picsum.photos/400/600?random=2', originUrl: '', brandId: '2', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 90 },
  'w3': { _id: 'w3', title: '蔚来 ET7 壁纸', coverUrl: 'https://picsum.photos/400/600?random=3', originUrl: '', brandId: '3', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 85 },
  'w4': { _id: 'w4', title: '小鹏 P7 壁纸', coverUrl: 'https://picsum.photos/400/600?random=4', originUrl: '', brandId: '4', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 80 },
  'w5': { _id: 'w5', title: '理想 L9 壁纸', coverUrl: 'https://picsum.photos/400/600?random=5', originUrl: '', brandId: '5', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 75 },
  'w6': { _id: 'w6', title: '零跑 C11 壁纸', coverUrl: 'https://picsum.photos/400/600?random=6', originUrl: '', brandId: '6', modelId: '', tags: [], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 70 },
};

const mockSounds: Record<string, Sound> = {
  's1': { _id: 's1', title: '特斯拉锁车声', coverUrl: 'https://picsum.photos/200/200?random=20', audioUrl: '', brandId: '1', modelId: '', soundType: '锁车声', duration: 3, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 100 },
  's2': { _id: 's2', title: '比亚迪迎宾音', coverUrl: 'https://picsum.photos/200/200?random=21', audioUrl: '', brandId: '2', modelId: '', soundType: '迎宾音', duration: 5, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 95 },
  's3': { _id: 's3', title: '蔚来启动声', coverUrl: 'https://picsum.photos/200/200?random=22', audioUrl: '', brandId: '3', modelId: '', soundType: '启动声', duration: 4, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 90 },
  's4': { _id: 's4', title: '小鹏解锁声', coverUrl: 'https://picsum.photos/200/200?random=23', audioUrl: '', brandId: '4', modelId: '', soundType: '解锁声', duration: 2, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 85 },
  's5': { _id: 's5', title: '理想迎宾音', coverUrl: 'https://picsum.photos/200/200?random=24', audioUrl: '', brandId: '5', modelId: '', soundType: '迎宾音', duration: 4, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 80 },
  's6': { _id: 's6', title: '零跑充电提示', coverUrl: 'https://picsum.photos/200/200?random=25', audioUrl: '', brandId: '6', modelId: '', soundType: '提示音', duration: 3, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 75 },
};

Page({
  data: {
    currentTab: 'wallpaper',
    wallpaperList: [] as Wallpaper[],
    soundList: [] as Sound[],
  },

  onLoad() {
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
  },

  loadFavorites() {
    const wallpaperIds = wx.getStorageSync('wallpaper_favorites') || [];
    const soundIds = wx.getStorageSync('sound_favorites') || [];

    const wallpaperList = wallpaperIds
      .map((id: string) => mockWallpapers[id])
      .filter(Boolean);
    
    const soundList = soundIds
      .map((id: string) => mockSounds[id])
      .filter(Boolean);

    this.setData({ wallpaperList, soundList });
  },

  onTabChange(e: WechatMiniprogram.TouchEvent) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ currentTab: tab });
  },

  onWallpaperTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/wallpaper/detail/index?id=${id}` });
  },

  onSoundTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/sound/detail/index?id=${id}` });
  },

  onRemoveWallpaper(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏这张壁纸吗？',
      success: (res) => {
        if (res.confirm) {
          let favorites = wx.getStorageSync('wallpaper_favorites') || [];
          favorites = favorites.filter((fid: string) => fid !== id);
          wx.setStorageSync('wallpaper_favorites', favorites);
          this.loadFavorites();
          wx.showToast({ title: '已取消收藏', icon: 'none' });
        }
      },
    });
  },

  onRemoveSound(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏这个音效吗？',
      success: (res) => {
        if (res.confirm) {
          let favorites = wx.getStorageSync('sound_favorites') || [];
          favorites = favorites.filter((fid: string) => fid !== id);
          wx.setStorageSync('sound_favorites', favorites);
          this.loadFavorites();
          wx.showToast({ title: '已取消收藏', icon: 'none' });
        }
      },
    });
  },
});
