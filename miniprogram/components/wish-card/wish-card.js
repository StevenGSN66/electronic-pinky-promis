// 愿望卡片组件
Component({
  properties: {
    // 愿望内容
    content: {
      type: String,
      value: ''
    },
    // 愿望类别
    category: {
      type: String,
      value: 'other'
    },
    // 点赞数
    likes: {
      type: Number,
      value: 0
    },
    // 状态：pending / fulfilled / expired
    status: {
      type: String,
      value: 'pending'
    },
    // 愿望ID
    wishId: {
      type: String,
      value: ''
    },
    // 是否已点赞
    hasLiked: {
      type: Boolean,
      value: false
    }
  },

  data: {
    // 类别标签映射
    categoryMap: {
      travel: '旅行',
      food: '美食',
      study: '学习',
      health: '健康',
      career: '事业',
      family: '家庭',
      other: '其他'
    }
  },

  methods: {
    // 点击卡片
    onCardTap() {
      this.triggerEvent('tap', { wishId: this.properties.wishId });
    },

    // 点击点赞
    onLikeTap() {
      const newHasLiked = !this.properties.hasLiked;
      const newLikes = newHasLiked ? this.properties.likes + 1 : this.properties.likes - 1;
      this.triggerEvent('like', {
        wishId: this.properties.wishId,
        hasLiked: newHasLiked,
        likes: newLikes
      });
    },

    // 点击分享
    onShareTap() {
      this.triggerEvent('share', { wishId: this.properties.wishId });
    }
  }
});
