// AI对话气泡组件
Component({
  properties: {
    // 消息内容
    content: {
      type: String,
      value: ''
    },
    // 发送者：user / ai
    sender: {
      type: String,
      value: 'user'
    },
    // 发送时间
    time: {
      type: String,
      value: ''
    },
    // AI头像地址
    aiAvatar: {
      type: String,
      value: '/assets/images/mascot-avatar.png'
    },
    // 用户头像地址
    userAvatar: {
      type: String,
      value: '/assets/images/user-avatar.png'
    },
    // 是否显示加载中
    loading: {
      type: Boolean,
      value: false
    }
  },

  data: {
    // 是否展开长文本
    expanded: false,
    // 是否需要折叠
    needFold: false
  },

  methods: {
    // 点击气泡
    onBubbleTap() {
      this.triggerEvent('tap', { sender: this.properties.sender });
    },

    // 点击复制
    onCopy() {
      wx.setClipboardData({
        data: this.properties.content,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'none' });
        }
      });
    },

    // 展开/收起
    onToggleExpand() {
      this.setData({ expanded: !this.data.expanded });
    },

    // 点击头像
    onAvatarTap() {
      this.triggerEvent('avatarTap', { sender: this.properties.sender });
    }
  }
});
