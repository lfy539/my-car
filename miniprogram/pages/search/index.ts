import { cacheManager } from '../../utils/cache';
import * as api from '../../services/api';
import { ErrorCodes } from '../../utils/error-codes';

const USE_MOCK = false;

const mockWallpapers: Wallpaper[] = [
  { _id: 'w1', title: '特斯拉 Model S 壁纸', coverUrl: 'https://picsum.photos/400/600?random=1', originUrl: '', brandId: '1', modelId: '', tags: ['科技', '简约'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 100 },
  { _id: 'w2', title: '比亚迪汉 EV 壁纸', coverUrl: 'https://picsum.photos/400/600?random=2', originUrl: '', brandId: '2', modelId: '', tags: ['国潮', '大气'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 90 },
  { _id: 'w3', title: '蔚来 ET7 壁纸', coverUrl: 'https://picsum.photos/400/600?random=3', originUrl: '', brandId: '3', modelId: '', tags: ['未来', '科技'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 85 },
  { _id: 'w4', title: '小鹏 P7 壁纸', coverUrl: 'https://picsum.photos/400/600?random=4', originUrl: '', brandId: '4', modelId: '', tags: ['运动'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 80 },
  { _id: 'w5', title: '理想 L9 壁纸', coverUrl: 'https://picsum.photos/400/600?random=5', originUrl: '', brandId: '5', modelId: '', tags: ['家庭'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 75 },
  { _id: 'w6', title: '零跑 C11 壁纸', coverUrl: 'https://picsum.photos/400/600?random=6', originUrl: '', brandId: '6', modelId: '', tags: ['实用'], resolution: '1080x1920', status: 1, publishAt: Date.now(), hotScore: 70 },
];

const mockSounds: Sound[] = [
  { _id: 's1', title: '特斯拉锁车声', coverUrl: 'https://picsum.photos/200/200?random=20', audioUrl: '', brandId: '1', modelId: '', soundType: '锁车声', duration: 3, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 100 },
  { _id: 's2', title: '比亚迪迎宾音', coverUrl: 'https://picsum.photos/200/200?random=21', audioUrl: '', brandId: '2', modelId: '', soundType: '迎宾音', duration: 5, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 95 },
  { _id: 's3', title: '蔚来启动声', coverUrl: 'https://picsum.photos/200/200?random=22', audioUrl: '', brandId: '3', modelId: '', soundType: '启动声', duration: 4, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 90 },
  { _id: 's4', title: '小鹏解锁声', coverUrl: 'https://picsum.photos/200/200?random=23', audioUrl: '', brandId: '4', modelId: '', soundType: '解锁声', duration: 2, bitrate: 320, status: 1, publishAt: Date.now(), hotScore: 85 },
];

const defaultHotKeywords = [
  { keyword: '特斯拉', isHot: true, count: 150 },
  { keyword: '比亚迪', isHot: true, count: 120 },
  { keyword: '蔚来', isHot: false, count: 80 },
  { keyword: '小鹏', isHot: false, count: 60 },
  { keyword: '锁车声', isHot: true, count: 200 },
  { keyword: '迎宾音', isHot: false, count: 50 },
  { keyword: '科技壁纸', isHot: false, count: 40 },
  { keyword: '暗黑风格', isHot: false, count: 30 },
];

Page({
  data: {
    keyword: '',
    autoFocus: true,
    showSuggestions: false,
    suggestions: [] as string[],
    history: [] as string[],
    hotKeywords: defaultHotKeywords,
    hasSearched: false,
    loading: false,
    resultType: 'all',
    wallpaperResults: [] as Wallpaper[],
    soundResults: [] as Sound[],
    totalCount: 0,
  },

  onLoad() {
    this.loadHistory();
    this.loadHotKeywords();
  },

  async loadHotKeywords() {
    if (USE_MOCK) return;
    
    try {
      const res = await api.getHotKeywords();
      if (res.code === ErrorCodes.SUCCESS && res.data) {
        this.setData({ hotKeywords: res.data.keywords });
      }
    } catch (e) {
      console.error('loadHotKeywords error:', e);
    }
  },

  loadHistory() {
    const history = cacheManager.get<string[]>('search_history') || [];
    this.setData({ history });
  },

  saveHistory(keyword: string) {
    let history = this.data.history.filter(k => k !== keyword);
    history.unshift(keyword);
    history = history.slice(0, 10);
    cacheManager.set('search_history', history, 30 * 24 * 60 * 60 * 1000);
    this.setData({ history });
  },

  onInput(e: WechatMiniprogram.Input) {
    const keyword = e.detail.value.trim();
    this.setData({ keyword });
    
    if (keyword) {
      this.showSuggestions(keyword);
    } else {
      this.setData({ showSuggestions: false, suggestions: [] });
    }
  },

  showSuggestions(keyword: string) {
    const allKeywords = [
      ...hotKeywords.map(h => h.keyword),
      ...mockWallpapers.map(w => w.title),
      ...mockSounds.map(s => s.title),
    ];
    
    const suggestions = allKeywords
      .filter(k => k.toLowerCase().includes(keyword.toLowerCase()))
      .slice(0, 8);
    
    this.setData({ 
      showSuggestions: suggestions.length > 0,
      suggestions,
    });
  },

  onSearch() {
    const { keyword } = this.data;
    if (!keyword) return;
    
    this.doSearch(keyword);
  },

  async doSearch(keyword: string) {
    this.setData({
      keyword,
      showSuggestions: false,
      hasSearched: true,
      loading: true,
    });
    
    this.saveHistory(keyword);
    
    if (USE_MOCK) {
      setTimeout(() => {
        const lowerKeyword = keyword.toLowerCase();
        
        const wallpaperResults = mockWallpapers.filter(w => 
          w.title.toLowerCase().includes(lowerKeyword) ||
          w.tags.some(t => t.toLowerCase().includes(lowerKeyword))
        );
        
        const soundResults = mockSounds.filter(s =>
          s.title.toLowerCase().includes(lowerKeyword) ||
          s.soundType.toLowerCase().includes(lowerKeyword)
        );
        
        this.setData({
          loading: false,
          wallpaperResults,
          soundResults,
          totalCount: wallpaperResults.length + soundResults.length,
        });
      }, 500);
      return;
    }

    try {
      const res = await api.search({ keyword });
      
      if (res.code === ErrorCodes.SUCCESS && res.data) {
        this.setData({
          loading: false,
          wallpaperResults: res.data.wallpapers,
          soundResults: res.data.sounds,
          totalCount: res.data.total,
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: res.message || '搜索失败', icon: 'none' });
      }
    } catch (e) {
      console.error('search error:', e);
      this.setData({ loading: false });
      wx.showToast({ title: '搜索失败', icon: 'none' });
    }
  },

  onSuggestionTap(e: WechatMiniprogram.TouchEvent) {
    const { keyword } = e.currentTarget.dataset;
    this.doSearch(keyword);
  },

  onHistoryTap(e: WechatMiniprogram.TouchEvent) {
    const { keyword } = e.currentTarget.dataset;
    this.doSearch(keyword);
  },

  onHotTap(e: WechatMiniprogram.TouchEvent) {
    const { keyword } = e.currentTarget.dataset;
    this.doSearch(keyword);
  },

  onClear() {
    this.setData({
      keyword: '',
      showSuggestions: false,
      hasSearched: false,
    });
  },

  onClearHistory() {
    wx.showModal({
      title: '清空历史',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          cacheManager.remove('search_history');
          this.setData({ history: [] });
        }
      },
    });
  },

  onCancel() {
    wx.navigateBack();
  },

  onTabChange(e: WechatMiniprogram.TouchEvent) {
    const { type } = e.currentTarget.dataset;
    this.setData({ resultType: type });
  },

  onWallpaperTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/wallpaper/detail/index?id=${id}` });
  },

  onSoundTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/sound/detail/index?id=${id}` });
  },
});
