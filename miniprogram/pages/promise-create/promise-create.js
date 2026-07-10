/**
 * promise-create.js
 * 创建约定页：选择发起人和接受人，输入或语音输入约定，调用AI解析，展示约定卡，电子拉钩签名确认
 */

const promiseService = require('../../services/promiseService');
const aiService = require('../../services/aiService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    // 参与人
    initiator: null,      // 发起人
    acceptor: null,       // 接受人
    familyMembers: [],    // 可选家庭成员列表

    // 约定内容
    inputMode: 'text',    // text | voice
    content: '',          // 约定文字内容
    voiceUrl: '',         // 语音文件路径

    // AI解析结果
    parsedPromise: null,  // AI解析后的约定对象
    isParsing: false,     // 是否正在解析

    // 签名确认
    signature: '',        // 签名图片路径
    showConfirm: false    // 是否展示确认面板
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('promise-create 页面加载');
    // TODO: 加载家庭成员列表
    this.loadFamilyMembers();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('promise-create 页面显示');
  },

  /**
   * 加载家庭成员列表
   */
  async loadFamilyMembers() {
    this.setData({ loading: true });
    try {
      // TODO: 调用 userService.getFamilyMembers 获取家庭成员
      console.log('加载家庭成员...');
    } catch (err) {
      console.error('加载家庭成员失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 选择参与人
   */
  selectPerson(e) {
    const { role, member } = e.currentTarget.dataset;
    if (role === 'initiator') {
      this.setData({ initiator: member });
    } else {
      this.setData({ acceptor: member });
    }
  },

  /**
   * 切换输入模式（文字/语音）
   */
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ inputMode: mode });
  },

  /**
   * 输入约定内容
   */
  onInputContent(e) {
    this.setData({ content: e.detail.value });
  },

  /**
   * 开始语音输入
   */
  startVoiceInput() {
    // TODO: 调用微信录音接口
    wx.showToast({ title: '语音输入功能开发中', icon: 'none' });
  },

  /**
   * 调用 AI 解析约定内容
   */
  async parseWithAI() {
    const { content } = this.data;
    if (!content.trim()) {
      wx.showToast({ title: '请先输入约定内容', icon: 'none' });
      return;
    }

    this.setData({ isParsing: true });
    try {
      // TODO: 调用 aiService.parsePromise 解析约定
      // const result = await aiService.parsePromise(content);
      // 模拟解析结果
      const mockResult = {
        title: '每天阅读30分钟',
        content: content,
        deadline: '2024-12-31',
        standard: '完成阅读并简单复述内容',
        initiator: this.data.initiator,
        acceptor: this.data.acceptor
      };
      this.setData({ parsedPromise: mockResult, showConfirm: true });
    } catch (err) {
      console.error('AI解析失败', err);
      wx.showToast({ title: '解析失败，请手动完善', icon: 'none' });
    } finally {
      this.setData({ isParsing: false });
    }
  },

  /**
   * 编辑解析结果
   */
  editParsedField(e) {
    const { field } = e.currentTarget.dataset;
    // TODO: 弹出输入框让用户编辑字段
    console.log('编辑字段:', field);
  },

  /**
   * 电子拉钩签名
   */
  onSignatureDraw(e) {
    // TODO: 接收签名组件返回的签名图片
    this.setData({ signature: e.detail.signaturePath });
  },

  /**
   * 确认创建约定
   */
  async confirmCreate() {
    const { initiator, acceptor, parsedPromise, signature } = this.data;
    if (!initiator || !acceptor) {
      wx.showToast({ title: '请选择发起人和接受人', icon: 'none' });
      return;
    }
    if (!parsedPromise) {
      wx.showToast({ title: '请先填写约定内容', icon: 'none' });
      return;
    }
    if (!signature) {
      wx.showToast({ title: '请完成电子拉钩签名', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      // TODO: 调用 promiseService.createPromise 创建约定
      wx.showToast({ title: '约定创建成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('创建约定失败', err);
      wx.showToast({ title: '创建失败，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 返回修改
   */
  goBackEdit() {
    this.setData({ showConfirm: false });
  }
});
