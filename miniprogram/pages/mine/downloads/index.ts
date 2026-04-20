interface DownloadRecord {
  type: 'wallpaper' | 'sound';
  id: string;
  title: string;
  coverUrl: string;
  downloadAt: number;
}

Page({
  data: {
    list: [] as DownloadRecord[],
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    this.loadRecords();
  },

  loadRecords() {
    const list = wx.getStorageSync('download_records') || [];
    this.setData({ list });
  },

  onItemTap(e: WechatMiniprogram.TouchEvent) {
    const { item } = e.currentTarget.dataset as { item: DownloadRecord };
    if (item.type === 'wallpaper') {
      wx.navigateTo({ url: `/pages/wallpaper/detail/index?id=${item.id}` });
    } else {
      wx.navigateTo({ url: `/pages/sound/detail/index?id=${item.id}` });
    }
  },

  onClearAll() {
    wx.showModal({
      title: '清空记录',
      content: '确定清空所有下载记录吗？（不会删除已下载的文件）',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('download_records');
          this.setData({ list: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      },
    });
  },
});
