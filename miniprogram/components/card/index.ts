Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    title: {
      type: String,
      value: '',
    },
    extra: {
      type: String,
      value: '',
    },
    customClass: {
      type: String,
      value: '',
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap');
    },
    onExtraTap() {
      this.triggerEvent('extratap');
    },
  },
});
