import * as api from '../../services/api';
import { userStore } from '../../stores/user';
import { ErrorCodes } from '../../utils/error-codes';

Page({
  data: {
    isLoggedIn: false,
    userInfo: null as UserInfo | null,
    showDebug: true,
    healthResult: '',
  },

  onLoad() {
    this.updateUserState();
    
    userStore.subscribe((state) => {
      this.setData({
        isLoggedIn: state.isLoggedIn,
        userInfo: state.userInfo,
      });
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar()!.setData({ currentTab: 'pages/mine/index' });
    }
    this.updateUserState();
  },

  updateUserState() {
    const state = userStore.getState();
    this.setData({
      isLoggedIn: state.isLoggedIn,
      userInfo: state.userInfo,
    });
  },

  async onLogin() {
    const success = await userStore.login();
    if (success) {
      wx.showToast({ title: '登录成功', icon: 'success' });
    }
  },

  onChooseAvatar(e: WechatMiniprogram.ChooseAvatar) {
    const { avatarUrl } = e.detail;
    const userInfo: UserInfo = {
      _id: 'local_' + Date.now(),
      openId: 'local_' + Date.now(),
      nickname: '车机用户',
      avatar: avatarUrl,
      phone: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    wx.setStorageSync('userInfo', userInfo);
    this.setData({
      isLoggedIn: true,
      userInfo,
    });
    wx.showToast({ title: '登录成功', icon: 'success' });
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          userStore.logout();
          wx.showToast({ title: '已退出', icon: 'success' });
        }
      },
    });
  },

  async checkHealth() {
    this.setData({ healthResult: '检查中...' });
    
    try {
      const res = await api.checkHealth();
      
      if (res.code === ErrorCodes.SUCCESS) {
        this.setData({
          healthResult: `✅ 服务正常\n状态: ${res.data.status}\n时间: ${new Date(res.data.timestamp).toLocaleString()}`,
        });
      } else {
        this.setData({
          healthResult: `❌ 服务异常: ${res.message}`,
        });
      }
    } catch (e: any) {
      this.setData({
        healthResult: `❌ 请求失败: ${e.message || '未知错误'}`,
      });
    }
  },

  goToFavorites() {
    wx.navigateTo({ url: '/pages/mine/favorites/index' });
  },

  goToDownloads() {
    wx.navigateTo({ url: '/pages/mine/downloads/index' });
  },

  goToHistory() {
    wx.showToast({ title: '浏览历史 - 开发中', icon: 'none' });
  },

  goToFeedback() {
    wx.showToast({ title: '意见反馈 - 开发中', icon: 'none' });
  },

  goToAbout() {
    wx.showModal({
      title: '关于我们',
      content: '车机美化库 v1.0.0\n电车专属美化库，打造专属移动座舱',
      showCancel: false,
    });
  },

  goToPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私保护，详细隐私政策请访问官网查看。',
      showCancel: false,
    });
  },
});
