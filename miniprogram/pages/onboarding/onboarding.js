/**
 * onboarding.js
 * 新人引导页：介绍雁小约App，说明"共同守信"理念，引导添加昵称/头像/常用约定人
 */

// 引入用户服务（后续用于保存用户信息）
const userService = require('../../services/userService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    currentStep: 0,      // 当前引导步骤：0=介绍页, 1=设置资料, 2=添加约定人
    nickname: '',        // 用户昵称
    avatarUrl: '',       // 用户头像
    familyMembers: []    // 常用约定人列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('onboarding 页面加载');
    // TODO: 检查是否为新用户，老用户直接跳转首页
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('onboarding 页面显示');
  },

  /**
   * 切换引导步骤
   */
  goToStep(e) {
    const step = e.currentTarget.dataset.step;
    this.setData({ currentStep: step });
  },

  /**
   * 选择头像
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({ avatarUrl });
  },

  /**
   * 输入昵称
   */
  onInputNickname(e) {
    this.setData({ nickname: e.detail.value });
  },

  /**
   * 添加常用约定人
   */
  addFamilyMember() {
    // TODO: 跳转到添加家庭成员页面或弹出输入框
    wx.showToast({ title: '添加约定人功能开发中', icon: 'none' });
  },

  /**
   * 完成引导，进入首页
   */
  finishOnboarding() {
    this.setData({ loading: true });
    // TODO: 调用 userService.saveUserInfo 保存用户资料
    // TODO: 将 isNewUser 标记为 false，存入本地存储
    wx.switchTab({ url: '/pages/index/index' });
  }
});
