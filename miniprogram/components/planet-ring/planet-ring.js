// 星球环形进度组件
Component({
  properties: {
    // 信任等级 1-10
    level: {
      type: Number,
      value: 1
    },
    // 当前等级进度 0-100
    progress: {
      type: Number,
      value: 0
    },
    // 星球主色调
    planetColor: {
      type: String,
      value: '#4CAF50'
    },
    // 轨道颜色
    trackColor: {
      type: String,
      value: '#e0e0e0'
    },
    // 尺寸
    size: {
      type: Number,
      value: 200
    }
  },

  data: {
    // 环的描边宽度
    strokeWidth: 12,
    // 动画持续时间
    duration: 1000
  },

  methods: {
    // 点击星球
    onPlanetTap() {
      this.triggerEvent('tap', {
        level: this.properties.level,
        progress: this.properties.progress
      });
    },

    // 设置进度（带动画）
    setProgress(newProgress) {
      this.setData({ progress: newProgress });
    }
  }
});
