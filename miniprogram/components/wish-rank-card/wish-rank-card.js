// 热门愿望排名卡片组件
Component({
  properties: {
    // 排名数字
    rank: {
      type: Number,
      value: 1
    },
    // 愿望内容
    content: {
      type: String,
      value: ''
    },
    // 许愿人数
    wishCount: {
      type: Number,
      value: 0
    },
    // 趋势：up / down / flat
    trend: {
      type: String,
      value: 'flat'
    },
    // 愿望ID
    wishId: {
      type: String,
      value: ''
    }
  },

  data: {
    // 排名颜色配置
    rankColors: ['#FFD700', '#C0C0C0', '#CD7F32']
  },

  methods: {
    // 点击卡片
    onCardTap() {
      this.triggerEvent('tap', { wishId: this.properties.wishId });
    },

    // 点击加入许愿
    onJoinTap() {
      this.triggerEvent('join', { wishId: this.properties.wishId });
    }
  }
});
