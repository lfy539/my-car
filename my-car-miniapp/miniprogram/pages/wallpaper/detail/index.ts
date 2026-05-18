import * as api from '../../../services/api';
import { ErrorCodes } from '../../../utils/error-codes';
import {
  buildMediaDownloadUrls,
  downloadImageToTempPath,
  ensureAlbumPermission,
  formatImageSaveError,
  normalizeMediaUrl,
  saveImageToAlbum,
} from '../../../utils/media';
import { appStore } from '../../../stores/app';

Page({
  data: {
    loading: true,
    wallpaper: null as Wallpaper | null,
    brandName: '',
    isFavorite: false,
    favoriteId: '',
    similarList: [] as Wallpaper[],
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadDetail(id);
    }
  },

  async loadDetail(id: string) {
    this.setData({ loading: true });
    try {
      await this.ensureBrandsLoaded();
      const res = await api.getWallpaperDetail(id);
      if (res.code !== ErrorCodes.SUCCESS || !res.data) {
        throw new Error(res.message || '壁纸不存在');
      }

      const wallpaper = res.data as Wallpaper & { id?: string };
      const contentId = wallpaper._id || wallpaper.id || id;
      const normalizedWallpaper = {
        ...wallpaper,
        coverUrl: normalizeMediaUrl(wallpaper.coverUrl),
        originUrl: normalizeMediaUrl(wallpaper.originUrl || wallpaper.coverUrl),
      };
      const favRes = await api.checkFavorite('wallpaper', contentId);
      const isFavorite = favRes.code === ErrorCodes.SUCCESS && !!favRes.data?.isFavorite;
      const favoriteId = isFavorite ? favRes.data?.favoriteId || '' : '';
      const brandName = this.resolveBrandName(wallpaper);

      this.setData({
        wallpaper: { ...normalizedWallpaper, _id: contentId },
        brandName,
        loading: false,
        isFavorite,
        favoriteId,
        similarList: [],
      });
      this.saveBrowseHistory({
        type: 'wallpaper',
        id: contentId,
        title: normalizedWallpaper.title,
        coverUrl: normalizedWallpaper.coverUrl,
      });
    } catch (e) {
      console.error('Load wallpaper detail failed:', e);
      wx.showToast({ title: '壁纸不存在', icon: 'none' });
      this.setData({ loading: false });
      setTimeout(() => wx.navigateBack(), 1500);
    }
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

  resolveBrandName(wallpaper: Wallpaper & { brandName?: string; brand?: { name?: string } }): string {
    if (wallpaper.brandName) return wallpaper.brandName;
    if (wallpaper.brand?.name) return wallpaper.brand.name;
    const brands = appStore.getState().brands || [];
    const matched = brands.find((b) => b._id === wallpaper.brandId || b.name === wallpaper.brandId);
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

  async onToggleFavorite() {
    const { wallpaper, isFavorite, favoriteId } = this.data;
    if (!wallpaper) return;
    const contentId = wallpaper._id;
    try {
      if (isFavorite && favoriteId) {
        const res = await api.removeFavorite(favoriteId);
        if (res.code === ErrorCodes.SUCCESS) {
          this.setData({ isFavorite: false, favoriteId: '' });
          wx.showToast({ title: '已取消收藏', icon: 'none' });
          return;
        }
      } else {
        const res = await api.addFavorite('wallpaper', contentId);
        if (res.code === ErrorCodes.SUCCESS) {
          this.setData({ isFavorite: true });
          wx.showToast({ title: '已收藏', icon: 'success' });
          const favRes = await api.checkFavorite('wallpaper', contentId);
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
      console.error('Toggle wallpaper favorite failed:', e);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  async onDownload() {
    const { wallpaper } = this.data;
    if (!wallpaper) return;
    const hasPermission = await this.ensureAlbumPermission();
    if (!hasPermission) {
      wx.showToast({ title: '请先开启相册权限', icon: 'none' });
      return;
    }

    const urls = buildMediaDownloadUrls(wallpaper.originUrl || wallpaper.coverUrl, wallpaper.coverUrl);
    if (urls.length === 0) {
      wx.showToast({ title: '图片地址无效', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    let lastError: unknown = null;
    try {
      let saved = false;
      for (const url of urls) {
        try {
          const tempPath = await downloadImageToTempPath(url);
          await saveImageToAlbum(tempPath);
          saved = true;
          break;
        } catch (err) {
          lastError = err;
          console.warn('save wallpaper failed with url:', url, err);
        }
      }
      wx.hideLoading();
      if (saved) {
        wx.showToast({ title: '已保存到相册', icon: 'success' });
        this.saveDownloadRecord(wallpaper);
      } else {
        wx.showToast({ title: formatImageSaveError(lastError), icon: 'none' });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: formatImageSaveError(e), icon: 'none' });
    }
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
