// 广告位组件
Component({
  properties: {
    // 广告图片地址
    imageUrl: {
      type: String,
      value: ''
    },
    // 广告跳转链接
    adUrl: {
      type: String,
      value: ''
    },
    // 是否显示关闭按钮
    closable: {
      type: Boolean,
      value: true
    },
    // 广告高度
    height: {
      type: Number,
      value: 120
    }
  },

  data: {
    // 是否已关闭
    closed: false
  },

  methods: {
    // 点击广告
    onAdTap() {
      const { adUrl } = this.properties;
      if (adUrl) {
        wx.navigateTo({ url: adUrl });
      }
      this.triggerEvent('click');
    },

    // 关闭广告
    onClose() {
      this.setData({ closed: true });
      this.triggerEvent('close');
    },

    // 广告加载失败
    onAdError(e) {
      console.error('广告加载失败', e.detail);
      this.triggerEvent('error', e.detail);
    }
  }
});
