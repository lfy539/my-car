import { userStore } from './stores/user';

App<App.GlobalData>({
  globalData: {
    userInfo: null,
    systemInfo: null,
    isLoggedIn: false,
  },

  onLaunch() {
    this.initCloud();
    this.getSystemInfo();
    this.checkLoginStatus();
  },

  async initCloud() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    wx.cloud.init({
      env: 'cloud1-d7g1hn482ab54c7e4',
      traceUser: true,
    });

    console.log('云开发环境初始化成功');
  },

  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
    } catch (e) {
      console.error('获取系统信息失败', e);
    }
  },

  async checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token');
      if (token) {
        await userStore.getUserInfo();
        this.globalData.isLoggedIn = true;
      }
    } catch (e) {
      console.log('未登录或登录已过期');
    }
  },
});
