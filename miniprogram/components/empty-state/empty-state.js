// 空状态组件
Component({
  properties: {
    // 空状态图标
    icon: {
      type: String,
      value: '/assets/images/empty.png'
    },
    // 提示标题
    title: {
      type: String,
      value: '暂无内容'
    },
    // 提示描述
    description: {
      type: String,
      value: '这里还没有内容，去创建一个吧'
    },
    // 操作按钮文字
    buttonText: {
      type: String,
      value: '去创建'
    },
    // 是否显示操作按钮
    showButton: {
      type: Boolean,
      value: true
    }
  },

  data: {
    // 内部状态占位
    loaded: true
  },

  methods: {
    // 点击操作按钮
    onButtonTap() {
      this.triggerEvent('buttonTap');
    },

    // 点击图标区域
    onIconTap() {
      this.triggerEvent('iconTap');
    }
  }
});
