import { audioManager } from '../../utils/audio-manager';

Component({
  data: {
    visible: false,
    currentSound: null as Sound | null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
  },

  lifetimes: {
    attached() {
      audioManager.subscribe((state) => {
        this.setData({
          visible: !!state.currentSound,
          currentSound: state.currentSound,
          isPlaying: state.isPlaying,
          currentTime: state.currentTime,
          duration: state.duration,
          progress: state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0,
        });
      });
    },
  },

  methods: {
    onPlayToggle() {
      if (this.data.isPlaying) {
        audioManager.pause();
      } else {
        audioManager.resume();
      }
    },

    onClose() {
      audioManager.stop();
    },

    onCoverTap() {
      const { currentSound } = this.data;
      if (currentSound) {
        wx.navigateTo({
          url: `/pages/sound/detail/index?id=${currentSound._id}`,
        });
      }
    },
  },
});
