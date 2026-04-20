Component({
  properties: {
    image: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '加载失败',
    },
    description: {
      type: String,
      value: '请检查网络后重试',
    },
    retryText: {
      type: String,
      value: '点击重试',
    },
  },

  methods: {
    onRetry() {
      this.triggerEvent('retry');
    },
  },
});
