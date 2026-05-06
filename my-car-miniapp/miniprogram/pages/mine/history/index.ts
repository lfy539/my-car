interface BrowseRecord {
  type: 'wallpaper' | 'sound';
  id: string;
  title: string;
  coverUrl: string;
  viewAt: number;
}

Page({
  data: {
    list: [] as BrowseRecord[],
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    this.loadRecords();
  },

  loadRecords() {
    const list = wx.getStorageSync('browse_history') || [];
    this.setData({ list });
  },

  onItemTap(e: WechatMiniprogram.TouchEvent) {
    const { item } = e.currentTarget.dataset as { item: BrowseRecord };
    if (item.type === 'wallpaper') {
      wx.navigateTo({ url: `/pages/wallpaper/detail/index?id=${item.id}` });
    } else {
      wx.navigateTo({ url: `/pages/sound/detail/index?id=${item.id}` });
    }
  },

  onClearAll() {
    wx.showModal({
      title: '清空历史',
      content: '确定清空所有浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('browse_history');
          this.setData({ list: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      },
    });
  },
});
