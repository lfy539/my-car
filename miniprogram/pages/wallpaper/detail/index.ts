import { recommendEngine } from '../../../utils/recommend';
import { imageCache } from '../../../utils/cache';

const mockWallpapers: Record<string, Wallpaper> = {
  'w1': { _id: 'w1', title: '特斯拉 Model S 壁纸', coverUrl: 'https://picsum.photos/1080/1920?random=1', originUrl: 'https://picsum.photos/1080/1920?random=1', brandId: '1', modelId: '', tags: ['科技', '简约'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 100 },
  'w2': { _id: 'w2', title: '比亚迪汉 EV 壁纸', coverUrl: 'https://picsum.photos/1080/1920?random=2', originUrl: 'https://picsum.photos/1080/1920?random=2', brandId: '2', modelId: '', tags: ['国潮', '大气'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 90 },
  'w3': { _id: 'w3', title: '蔚来 ET7 壁纸', coverUrl: 'https://picsum.photos/1080/1920?random=3', originUrl: 'https://picsum.photos/1080/1920?random=3', brandId: '3', modelId: '', tags: ['未来', '科技'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 85 },
  'w4': { _id: 'w4', title: '小鹏 P7 壁纸', coverUrl: 'https://picsum.photos/1080/1920?random=4', originUrl: 'https://picsum.photos/1080/1920?random=4', brandId: '4', modelId: '', tags: ['运动'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 80 },
  'w5': { _id: 'w5', title: '理想 L9 壁纸', coverUrl: 'https://picsum.photos/1080/1920?random=5', originUrl: 'https://picsum.photos/1080/1920?random=5', brandId: '5', modelId: '', tags: ['家庭', '舒适'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 75 },
  'w6': { _id: 'w6', title: '零跑 C11 壁纸', coverUrl: 'https://picsum.photos/1080/1920?random=6', originUrl: 'https://picsum.photos/1080/1920?random=6', brandId: '6', modelId: '', tags: ['实用'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 70 },
};

const allWallpapers = Object.values(mockWallpapers);

const brandNames: Record<string, string> = {
  '1': '特斯拉', '2': '比亚迪', '3': '蔚来', '4': '小鹏', '5': '理想', '6': '零跑',
};

Page({
  data: {
    loading: true,
    wallpaper: null as Wallpaper | null,
    brandName: '',
    isFavorite: false,
    similarList: [] as Wallpaper[],
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadDetail(id);
    }
  },

  loadDetail(id: string) {
    setTimeout(() => {
      const wallpaper = mockWallpapers[id];
      if (wallpaper) {
        const similarList = recommendEngine.getSimilarWallpapers(wallpaper, allWallpapers);
        
        imageCache.preloadBatch(similarList.map(w => w.coverUrl));
        
        this.setData({
          wallpaper,
          brandName: brandNames[wallpaper.brandId] || '未知',
          loading: false,
          isFavorite: this.checkFavorite(id),
          similarList,
        });
      } else {
        wx.showToast({ title: '壁纸不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    }, 300);
  },

  checkFavorite(id: string): boolean {
    const favorites = wx.getStorageSync('wallpaper_favorites') || [];
    return favorites.includes(id);
  },

  onPreview() {
    const { wallpaper } = this.data;
    if (wallpaper) {
      wx.previewImage({
        urls: [wallpaper.originUrl || wallpaper.coverUrl],
        current: wallpaper.originUrl || wallpaper.coverUrl,
      });
    }
  },

  onToggleFavorite() {
    const { wallpaper, isFavorite } = this.data;
    if (!wallpaper) return;

    let favorites = wx.getStorageSync('wallpaper_favorites') || [];
    
    if (isFavorite) {
      favorites = favorites.filter((id: string) => id !== wallpaper._id);
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      favorites.push(wallpaper._id);
      wx.showToast({ title: '已收藏', icon: 'success' });
    }
    
    wx.setStorageSync('wallpaper_favorites', favorites);
    this.setData({ isFavorite: !isFavorite });
  },

  onDownload() {
    const { wallpaper } = this.data;
    if (!wallpaper) return;

    wx.showLoading({ title: '保存中...' });
    
    wx.downloadFile({
      url: wallpaper.originUrl || wallpaper.coverUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.hideLoading();
              wx.showToast({ title: '已保存到相册', icon: 'success' });
              this.saveDownloadRecord(wallpaper);
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '保存失败，请授权相册权限', icon: 'none' });
            },
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '下载失败', icon: 'none' });
      },
    });
  },

  saveDownloadRecord(wallpaper: Wallpaper) {
    let downloads = wx.getStorageSync('download_records') || [];
    const record = {
      type: 'wallpaper',
      id: wallpaper._id,
      title: wallpaper.title,
      coverUrl: wallpaper.coverUrl,
      downloadAt: Date.now(),
    };
    downloads.unshift(record);
    downloads = downloads.slice(0, 100);
    wx.setStorageSync('download_records', downloads);
  },

  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
  },

  onShareAppMessage() {
    const { wallpaper } = this.data;
    return {
      title: wallpaper?.title || '精美壁纸分享',
      path: `/pages/wallpaper/detail/index?id=${wallpaper?._id}`,
      imageUrl: wallpaper?.coverUrl,
    };
  },

  onSimilarTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.redirectTo({ url: `/pages/wallpaper/detail/index?id=${id}` });
  },
});
