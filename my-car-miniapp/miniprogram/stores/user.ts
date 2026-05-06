/**
 * 用户状态管理
 */

import * as api from '../services/api';
import { ErrorCodes } from '../utils/error-codes';

interface UserState {
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

class UserStore {
  private state: UserState = {
    userInfo: null,
    isLoggedIn: false,
    isLoading: false,
  };

  private listeners: Set<(state: UserState) => void> = new Set();

  constructor() {
    this.restoreState();
  }

  private restoreState() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.state = {
          userInfo,
          isLoggedIn: true,
          isLoading: false,
        };
      }
    } catch (e) {
      console.error('Restore user state failed:', e);
    }
  }

  getState(): UserState {
    return { ...this.state };
  }

  subscribe(listener: (state: UserState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  private setState(partial: Partial<UserState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  async login(): Promise<boolean> {
    this.setState({ isLoading: true });

    try {
      const res = await api.login();
      
      if (res.code === ErrorCodes.SUCCESS && res.data) {
        this.setUser(res.data);
        return true;
      }

      this.setState({ isLoading: false });
      return false;
    } catch (e) {
      console.error('Login failed:', e);
      this.setState({ isLoading: false });
      return false;
    }
  }

  setUser(userInfo: UserInfo) {
    const normalizedUser: UserInfo = {
      ...userInfo,
      openId: (userInfo as any).openId || (userInfo as any).openid || '',
      unionId: (userInfo as any).unionId || (userInfo as any).unionid || '',
    };

    this.setState({
      userInfo: normalizedUser,
      isLoggedIn: true,
      isLoading: false,
    });
    
    wx.setStorageSync('userInfo', normalizedUser);
    wx.setStorageSync('token', normalizedUser._id);
    
    try {
      const app = getApp<App.GlobalData>();
      app.globalData.userInfo = normalizedUser;
      app.globalData.isLoggedIn = true;
    } catch (e) {
      console.error('Set global data failed:', e);
    }
  }

  async getUserInfo(): Promise<UserInfo | null> {
    const res = await api.getUserInfo();
    
    if (res.code === ErrorCodes.SUCCESS && res.data) {
      this.setState({
        userInfo: res.data,
        isLoggedIn: true,
      });
      
      const app = getApp<App.GlobalData>();
      app.globalData.userInfo = res.data;
      app.globalData.isLoggedIn = true;
      
      return res.data;
    }
    
    return null;
  }

  logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    
    this.setState({
      userInfo: null,
      isLoggedIn: false,
    });
    
    try {
      const app = getApp<App.GlobalData>();
      app.globalData.userInfo = null;
      app.globalData.isLoggedIn = false;
    } catch (e) {
      console.error('Clear global data failed:', e);
    }
  }
}

export const userStore = new UserStore();
