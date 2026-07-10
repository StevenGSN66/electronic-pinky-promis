// 自定义导航栏组件
Component({
  properties: {
    // 标题文字
    title: {
      type: String,
      value: ''
    },
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      value: true
    },
    // 背景色
    backgroundColor: {
      type: String,
      value: '#ffffff'
    },
    // 文字颜色
    textColor: {
      type: String,
      value: '#000000'
    },
    // 右侧按钮文字
    rightText: {
      type: String,
      value: ''
    },
    // 右侧按钮图标
    rightIcon: {
      type: String,
      value: ''
    }
  },

  data: {
    // 状态栏高度
    statusBarHeight: 20,
    // 导航栏高度
    navBarHeight: 44
  },

  lifetimes: {
    attached() {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight,
        navBarHeight: (systemInfo.statusBarHeight || 0) + 44
      });
    }
  },

  methods: {
    // 点击返回
    onBack() {
      wx.navigateBack({ delta: 1 });
      this.triggerEvent('back');
    },

    // 点击标题
    onTitleTap() {
      this.triggerEvent('titleTap');
    },

    // 点击右侧按钮
    onRightTap() {
      this.triggerEvent('rightTap');
    }
  }
});
