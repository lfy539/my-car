Component({
  properties: {
    currentTab: {
      type: String,
      value: 'pages/index/index',
    },
  },

  data: {
    tabs: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        icon: '🏠',
      },
      {
        pagePath: 'pages/wallpaper/index',
        text: '壁纸',
        icon: '🖼',
      },
      {
        pagePath: 'pages/sound/index',
        text: '音效',
        icon: '🎵',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        icon: '👤',
      },
    ],
  },

  methods: {
    onTabTap(e: WechatMiniprogram.TouchEvent) {
      const { path } = e.currentTarget.dataset;
      if (path === this.data.currentTab) return;

      wx.switchTab({
        url: `/${path}`,
      });
    },
  },
});
