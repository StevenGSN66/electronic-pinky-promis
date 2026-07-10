// 信任树组件
Component({
  properties: {
    // 信任水滴总数
    totalDrops: {
      type: Number,
      value: 0
    },
    // 当前阶段（种子/树苗/绿叶/开花/果实）
    stage: {
      type: String,
      value: 'seed'
    },
    // 树的主题色
    themeColor: {
      type: String,
      value: '#4CAF50'
    }
  },

  data: {
    // 阶段映射配置
    stageMap: {
      seed: { name: '种子', icon: '/assets/tree/seed.png', min: 0 },
      sapling: { name: '树苗', icon: '/assets/tree/sapling.png', min: 10 },
      leaf: { name: '绿叶', icon: '/assets/tree/leaf.png', min: 50 },
      flower: { name: '开花', icon: '/assets/tree/flower.png', min: 100 },
      fruit: { name: '果实', icon: '/assets/tree/fruit.png', min: 200 }
    }
  },

  methods: {
    // 计算当前阶段
    calcStage(drops) {
      if (drops >= 200) return 'fruit';
      if (drops >= 100) return 'flower';
      if (drops >= 50) return 'leaf';
      if (drops >= 10) return 'sapling';
      return 'seed';
    },

    // 点击树触发事件
    onTreeTap() {
      this.triggerEvent('treeTap', {
        stage: this.properties.stage,
        drops: this.properties.totalDrops
      });
    },

    // 更新水滴数量并重新计算阶段
    updateDrops(newDrops) {
      const stage = this.calcStage(newDrops);
      this.setData({
        totalDrops: newDrops,
        stage: stage
      });
      this.triggerEvent('stageChange', { stage, drops: newDrops });
    }
  }
});
