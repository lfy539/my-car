Component({
  properties: {
    type: {
      type: String,
      value: 'default',
    },
    count: {
      type: Number,
      value: 3,
    },
  },

  data: {
    countArray: [] as number[],
  },

  observers: {
    'count': function(count: number) {
      this.setData({
        countArray: Array.from({ length: count }, (_, i) => i),
      });
    },
  },

  lifetimes: {
    attached() {
      this.setData({
        countArray: Array.from({ length: this.data.count }, (_, i) => i),
      });
    },
  },
});
