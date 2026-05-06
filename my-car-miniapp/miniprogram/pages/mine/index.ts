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
    this.onWechatLogin();
  },

  async onWechatLogin() {
    try {
      const profile = await wx.getUserProfile({
        desc: '用于完善会员资料',
      });

      const success = await userStore.login();
      if (!success) {
        wx.showToast({ title: '登录失败，请稍后重试', icon: 'none' });
        return;
      }

      const updateRes = await api.updateUserInfo({
        nickname: profile.userInfo.nickName || '车机用户',
        avatar: profile.userInfo.avatarUrl || '',
      });

      if (updateRes.code === ErrorCodes.SUCCESS && updateRes.data) {
        userStore.setUser(updateRes.data);
        wx.showToast({ title: '登录成功', icon: 'success' });
        return;
      }

      wx.showToast({ title: updateRes.message || '登录成功，但资料同步失败', icon: 'none' });
    } catch (err: any) {
      if (err?.errMsg?.includes('cancel')) {
        wx.showToast({ title: '你已取消授权', icon: 'none' });
        return;
      }
      console.error('Wechat login failed:', err);
      wx.showToast({ title: '微信授权失败', icon: 'none' });
    }
  },

  onChooseAvatar(e: WechatMiniprogram.ChooseAvatar) {
    this.updateAvatar(e);
  },

  async updateAvatar(e: WechatMiniprogram.ChooseAvatar) {
    const { avatarUrl } = e.detail;
    try {
      if (!this.data.isLoggedIn) {
        const loginSuccess = await userStore.login();
        if (!loginSuccess) {
          wx.showToast({ title: '登录失败，请稍后重试', icon: 'none' });
          return;
        }
      }

      const state = userStore.getState();
      const currentUser = state.userInfo;
      const nickname = currentUser?.nickname || '车机用户';
      const updateRes = await api.updateUserInfo({ nickname, avatar: avatarUrl });

      if (updateRes.code === ErrorCodes.SUCCESS && updateRes.data) {
        userStore.setUser(updateRes.data);
        wx.showToast({ title: '头像更新成功', icon: 'success' });
        return;
      }

      wx.showToast({ title: updateRes.message || '头像更新失败', icon: 'none' });
    } catch (err) {
      console.error('Update avatar failed:', err);
      wx.showToast({ title: '头像更新失败', icon: 'none' });
    }
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
    wx.navigateTo({ url: '/pages/mine/history/index' });
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

  onShareAppMessage() {
    return {
      title: '车机美化库 - 让你的车机更有个性',
      path: '/pages/index/index',
    };
  },
});
