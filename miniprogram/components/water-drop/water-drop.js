// 信任水滴组件
Component({
  properties: {
    // 当前水滴数量
    count: {
      type: Number,
      value: 0
    },
    // 变化量（正数为增加，负数为减少）
    delta: {
      type: Number,
      value: 0
    },
    // 水滴大小
    size: {
      type: String,
      value: 'normal' // small / normal / large
    },
    // 是否播放动画
    animate: {
      type: Boolean,
      value: false
    }
  },

  data: {
    // 动画中显示的变化数字
    displayDelta: 0,
    // 是否正在播放动画
    isAnimating: false
  },

  observers: {
    'delta': function(delta) {
      if (delta !== 0) {
        this.playAnimation(delta);
      }
    }
  },

  methods: {
    // 播放水滴动画
    playAnimation(delta) {
      this.setData({
        displayDelta: delta > 0 ? `+${delta}` : `${delta}`,
        isAnimating: true
      });
      setTimeout(() => {
        this.setData({ isAnimating: false });
      }, 1000);
    },

    // 点击水滴
    onDropTap() {
      this.triggerEvent('dropTap', { count: this.properties.count });
    }
  }
});
