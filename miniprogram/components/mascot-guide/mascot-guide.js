// components/mascot-guide/mascot-guide.js
// 雁小约引导组件：支持根据 mood 自动切换对应表情素材

// mood 到素材图片的映射（统一使用鸿雁信使造型）
const MOOD_IMAGES = {
  welcome: '/assets/images/mascot/yan-xiaoyue-main.png',      // 新人欢迎/通用
  front: '/assets/images/mascot/yan-xiaoyue-main.png',          // 通用站立
  success: '/assets/images/mascot/yan-xiaoyue-main.png',        // 守约成功
  reminder: '/assets/images/mascot/yan-xiaoyue-main.png',       // 到期提醒
  thinking: '/assets/images/mascot/yan-xiaoyue-main.png',       // AI复盘/思考
  main: '/assets/images/mascot/yan-xiaoyue-main.png'            // 首页主视觉
};

Component({
  properties: {
    // 提示文本（单条字符串或字符串数组）
    text: {
      type: String,
      value: ''
    },
    // 提示文本列表（多步骤引导时使用）
    tips: {
      type: Array,
      value: []
    },
    // 当前显示第几条
    currentIndex: {
      type: Number,
      value: 0
    },
    // mascot 表情/场景：welcome/front/success/reminder/thinking/main
    // 或直接传图片路径
    mood: {
      type: String,
      value: 'front'
    },
    // 是否显示关闭按钮
    showClose: {
      type: Boolean,
      value: true
    },
    // 是否显示为弹窗遮罩模式（false 则为嵌入式）
    modal: {
      type: Boolean,
      value: false
    },
    // 是否显示步骤指示器
    showSteps: {
      type: Boolean,
      value: true
    }
  },

  data: {
    visible: true,
    animating: false,
    mascotSrc: ''
  },

  lifetimes: {
    attached() {
      this.updateMascotSrc();
    }
  },

  observers: {
    'mood': function() {
      this.updateMascotSrc();
    }
  },

  methods: {
    // 更新 mascot 图片源
    updateMascotSrc() {
      const { mood } = this.properties;
      const src = MOOD_IMAGES[mood] || mood || MOOD_IMAGES.front;
      this.setData({ mascotSrc: src });
    },

    // 获取当前显示的提示文字
    getCurrentText() {
      const { text, tips, currentIndex } = this.properties;
      if (text) return text;
      if (tips && tips.length > 0) return tips[currentIndex] || '';
      return '';
    },

    // 点击下一条提示
    onNext() {
      const { currentIndex, tips } = this.properties;
      if (currentIndex < tips.length - 1) {
        this.setData({ animating: true });
        setTimeout(() => {
          this.setData({ animating: false });
          this.triggerEvent('change', { index: currentIndex + 1 });
        }, 200);
      } else {
        this.onClose();
      }
    },

    // 关闭引导
    onClose() {
      this.setData({ visible: false });
      this.triggerEvent('close');
    },

    // 点击 mascot 形象
    onMascotTap() {
      this.triggerEvent('mascotTap');
    }
  }
});
