/**
 * ai-chat.js
 * AI辅助沟通/建议页：雁小约作为AI助手，对话气泡展示
 */

const aiService = require('../../services/aiService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    messages: [],         // 对话消息列表
    inputText: '',        // 当前输入文字
    isTyping: false       // AI是否正在输入
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('ai-chat 页面加载');
    // 添加欢迎语
    this.setData({
      messages: [
        {
          id: 'welcome',
          role: 'ai',
          content: '你好！我是雁小约，你的家庭约定AI助手。我可以帮你：\n1. 整理和优化约定内容\n2. 提供履约建议\n3. 协助沟通家庭成员间的分歧\n有什么我可以帮你的吗？',
          time: new Date().toLocaleTimeString()
        }
      ]
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('ai-chat 页面显示');
  },

  /**
   * 输入文字
   */
  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  /**
   * 发送消息
   */
  async sendMessage() {
    const { inputText, messages } = this.data;
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      time: new Date().toLocaleTimeString()
    };

    this.setData({
      messages: [...messages, userMsg],
      inputText: '',
      isTyping: true
    });

    try {
      // TODO: 调用 aiService.chat(userMsg.content) 获取AI回复
      // 模拟AI回复
      setTimeout(() => {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: '收到你的问题啦！这是一个很好的话题。建议你们可以坐下来一起聊聊，把各自的想法都说出来，然后我们一起找一个双方都能接受的方案。需要我帮你起草一个新的约定吗？',
          time: new Date().toLocaleTimeString()
        };
        this.setData({
          messages: [...this.data.messages, aiMsg],
          isTyping: false
        });
        this.scrollToBottom();
      }, 1500);
    } catch (err) {
      console.error('AI回复失败', err);
      this.setData({ isTyping: false });
      wx.showToast({ title: '发送失败', icon: 'none' });
    }
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    // TODO: 控制scroll-view滚动到底部
  },

  /**
   * 快捷提问
   */
  quickAsk(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ inputText: question });
    this.sendMessage();
  },

  /**
   * 语音输入（可选）
   */
  startVoiceInput() {
    // TODO: 实现语音输入转文字
    wx.showToast({ title: '语音输入功能开发中', icon: 'none' });
  }
});
