// 愿望分类标签栏组件
Component({
  properties: {
    // 分类列表
    categories: {
      type: Array,
      value: [
        { id: 'all', name: '全部' },
        { id: 'travel', name: '旅行' },
        { id: 'food', name: '美食' },
        { id: 'study', name: '学习' },
        { id: 'health', name: '健康' },
        { id: 'career', name: '事业' },
        { id: 'family', name: '家庭' }
      ]
    },
    // 当前选中分类ID
    activeId: {
      type: String,
      value: 'all'
    },
    // 主题色
    activeColor: {
      type: String,
      value: '#1890ff'
    }
  },

  data: {
    // 滚动位置
    scrollLeft: 0
  },

  methods: {
    // 点击分类标签
    onCategoryTap(e) {
      const id = e.currentTarget.dataset.id;
      const index = e.currentTarget.dataset.index;
      this.setData({ activeId: id });
      this.triggerEvent('change', { id, index });
    },

    // 更新滚动位置（使选中项居中）
    updateScrollPosition(index) {
      this.setData({ scrollLeft: index * 80 });
    }
  }
});
