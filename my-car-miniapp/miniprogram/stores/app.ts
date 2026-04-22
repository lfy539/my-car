/**
 * 应用全局状态管理
 */

interface AppState {
  brands: Brand[];
  currentBrandId: string | null;
  currentModelId: string | null;
  playingAudioId: string | null;
  isAudioPlaying: boolean;
}

class AppStore {
  private state: AppState = {
    brands: [],
    currentBrandId: null,
    currentModelId: null,
    playingAudioId: null,
    isAudioPlaying: false,
  };

  private listeners: Set<(state: AppState) => void> = new Set();

  getState(): AppState {
    return { ...this.state };
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  private setState(partial: Partial<AppState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  setBrands(brands: Brand[]) {
    this.setState({ brands });
  }

  setCurrentBrand(brandId: string | null) {
    this.setState({ 
      currentBrandId: brandId,
      currentModelId: null,
    });
  }

  setCurrentModel(modelId: string | null) {
    this.setState({ currentModelId: modelId });
  }

  setPlayingAudio(audioId: string | null, isPlaying: boolean = false) {
    this.setState({
      playingAudioId: audioId,
      isAudioPlaying: isPlaying,
    });
  }

  stopAudio() {
    this.setState({
      playingAudioId: null,
      isAudioPlaying: false,
    });
  }
}

export const appStore = new AppStore();
