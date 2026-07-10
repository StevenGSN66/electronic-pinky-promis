// 约定卡片组件
Component({
  properties: {
    // 约定标题
    title: {
      type: String,
      value: ''
    },
    // 截止时间
    deadline: {
      type: String,
      value: ''
    },
    // 状态：pending / ongoing / completed / overdue
    status: {
      type: String,
      value: 'pending'
    },
    // 进度 0-100
    progress: {
      type: Number,
      value: 0
    },
    // 约定ID
    promiseId: {
      type: String,
      value: ''
    },
    // 创建者昵称
    creatorName: {
      type: String,
      value: ''
    }
  },

  data: {
    // 状态标签映射
    statusMap: {
      pending: { label: '待开始', color: '#999' },
      ongoing: { label: '进行中', color: '#1890ff' },
      completed: { label: '已完成', color: '#52c41a' },
      overdue: { label: '已逾期', color: '#ff4d4f' }
    }
  },

  methods: {
    // 点击卡片
    onCardTap() {
      this.triggerEvent('tap', { promiseId: this.properties.promiseId });
    },

    // 点击进度条
    onProgressTap() {
      this.triggerEvent('progressTap', { promiseId: this.properties.promiseId });
    },

    // 长按卡片
    onLongPress() {
      this.triggerEvent('longpress', { promiseId: this.properties.promiseId });
    }
  }
});
