/**
 * 全局音频管理器
 * 支持后台播放、状态同步、预加载
 */

interface AudioState {
  currentSound: Sound | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
}

type AudioListener = (state: AudioState) => void;

class AudioManager {
  private audio: WechatMiniprogram.InnerAudioContext;
  private state: AudioState = {
    currentSound: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
  };
  private listeners: Set<AudioListener> = new Set();
  private preloadQueue: string[] = [];

  constructor() {
    this.audio = wx.createInnerAudioContext();
    this.setupAudioEvents();
    this.setupBackgroundAudio();
  }

  private setupAudioEvents() {
    this.audio.onPlay(() => {
      this.setState({ isPlaying: true, isLoading: false });
    });

    this.audio.onPause(() => {
      this.setState({ isPlaying: false });
    });

    this.audio.onStop(() => {
      this.setState({ isPlaying: false, currentTime: 0 });
    });

    this.audio.onEnded(() => {
      this.setState({ isPlaying: false, currentTime: 0 });
    });

    this.audio.onTimeUpdate(() => {
      this.setState({
        currentTime: this.audio.currentTime,
        duration: this.audio.duration,
      });
    });

    this.audio.onWaiting(() => {
      this.setState({ isLoading: true });
    });

    this.audio.onCanplay(() => {
      this.setState({ isLoading: false, duration: this.audio.duration });
    });

    this.audio.onError((err) => {
      console.error('Audio error:', err);
      this.setState({ isPlaying: false, isLoading: false });
      wx.showToast({ title: '播放失败', icon: 'none' });
    });
  }

  private setupBackgroundAudio() {
    wx.setInnerAudioOption({
      obeyMuteSwitch: false,
      mixWithOther: false,
    });
  }

  private setState(partial: Partial<AudioState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private notify() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  getState(): AudioState {
    return { ...this.state };
  }

  play(sound: Sound) {
    if (this.state.currentSound?._id === sound._id && this.state.isPlaying) {
      return;
    }

    this.setState({
      currentSound: sound,
      isLoading: true,
      currentTime: 0,
      duration: sound.duration || 0,
    });

    this.audio.src = sound.audioUrl;
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  resume() {
    this.audio.play();
  }

  stop() {
    this.audio.stop();
    this.setState({
      currentSound: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
  }

  seek(time: number) {
    this.audio.seek(time);
  }

  preload(urls: string[]) {
    urls.forEach(url => {
      if (url && !this.preloadQueue.includes(url)) {
        this.preloadQueue.push(url);
      }
    });

    this.processPreloadQueue();
  }

  private processPreloadQueue() {
    if (this.preloadQueue.length === 0) return;

    const url = this.preloadQueue.shift();
    if (url) {
      wx.downloadFile({
        url,
        success: () => {},
        complete: () => {
          setTimeout(() => this.processPreloadQueue(), 500);
        },
      });
    }
  }

  destroy() {
    this.audio.destroy();
    this.listeners.clear();
  }
}

export const audioManager = new AudioManager();
