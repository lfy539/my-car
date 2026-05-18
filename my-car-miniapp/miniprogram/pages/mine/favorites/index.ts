import * as api from '../../../services/api';
import { ErrorCodes } from '../../../utils/error-codes';

type FavoriteRecord = {
  _id: string;
  targetType: 'wallpaper' | 'sound';
  targetId: string;
};

type FavoriteWallpaper = Wallpaper & { favoriteId: string };
type FavoriteSound = Sound & { favoriteId: string };

Page({
  data: {
    currentTab: 'wallpaper',
    loading: false,
    wallpaperList: [] as FavoriteWallpaper[],
    soundList: [] as FavoriteSound[],
  },

  onShow() {
    this.loadFavorites();
  },

  async loadFavorites() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const [wallpaperRes, soundRes] = await Promise.all([
        api.getFavorites({ targetType: 'wallpaper', page: 1, pageSize: 100 }, true),
        api.getFavorites({ targetType: 'sound', page: 1, pageSize: 100 }, true),
      ]);

      const wallpaperFavs: FavoriteRecord[] =
        wallpaperRes.code === ErrorCodes.SUCCESS ? (wallpaperRes.data?.list || []) : [];
      const soundFavs: FavoriteRecord[] =
        soundRes.code === ErrorCodes.SUCCESS ? (soundRes.data?.list || []) : [];

      const [wallpaperList, soundList] = await Promise.all([
        Promise.all(
          wallpaperFavs.map(async (fav) => {
            const detailRes = await api.getWallpaperDetail(fav.targetId, true);
            if (detailRes.code === ErrorCodes.SUCCESS && detailRes.data) {
              const item = detailRes.data as Wallpaper & { id?: string };
              return {
                ...item,
                _id: item._id || item.id || fav.targetId,
                favoriteId: fav._id,
              } as FavoriteWallpaper;
            }
            return null;
          })
        ),
        Promise.all(
          soundFavs.map(async (fav) => {
            const detailRes = await api.getSoundDetail(fav.targetId, true);
            if (detailRes.code === ErrorCodes.SUCCESS && detailRes.data) {
              const item = detailRes.data as Sound & { id?: string };
              return {
                ...item,
                _id: item._id || item.id || fav.targetId,
                favoriteId: fav._id,
              } as FavoriteSound;
            }
            return null;
          })
        ),
      ]);

      this.setData({
        wallpaperList: wallpaperList.filter(Boolean) as FavoriteWallpaper[],
        soundList: soundList.filter(Boolean) as FavoriteSound[],
      });
    } catch (err) {
      console.error('Load favorites failed:', err);
      wx.showToast({ title: '加载收藏失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
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
    const { id } = e.currentTarget.dataset as { id: string };
    const item = this.data.wallpaperList.find((x) => x._id === id);
    if (!item?.favoriteId) return;
    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏这张壁纸吗？',
      success: async (res) => {
        if (res.confirm) {
          const removeRes = await api.removeFavorite(item.favoriteId);
          if (removeRes.code === ErrorCodes.SUCCESS) {
            this.setData({
              wallpaperList: this.data.wallpaperList.filter((x) => x._id !== id),
            });
            wx.showToast({ title: '已取消收藏', icon: 'none' });
          } else {
            wx.showToast({ title: removeRes.message || '操作失败', icon: 'none' });
          }
        }
      },
    });
  },

  onRemoveSound(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset as { id: string };
    const item = this.data.soundList.find((x) => x._id === id);
    if (!item?.favoriteId) return;
    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏这个音效吗？',
      success: async (res) => {
        if (res.confirm) {
          const removeRes = await api.removeFavorite(item.favoriteId);
          if (removeRes.code === ErrorCodes.SUCCESS) {
            this.setData({
              soundList: this.data.soundList.filter((x) => x._id !== id),
            });
            wx.showToast({ title: '已取消收藏', icon: 'none' });
          } else {
            wx.showToast({ title: removeRes.message || '操作失败', icon: 'none' });
          }
        }
      },
    });
  },
});
