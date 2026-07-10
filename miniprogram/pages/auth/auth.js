/**
 * auth.js
 * 登录授权页：wx.login 获取 code，引导授权用户信息
 */

// 引入认证服务
const authService = require('../../services/authService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    canIUseGetUserProfile: false  // 是否支持 wx.getUserProfile
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('auth 页面加载');
    // 检查是否支持 getUserProfile（基础库 2.10.4+）
    if (wx.getUserProfile) {
      this.setData({ canIUseGetUserProfile: true });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('auth 页面显示');
  },

  /**
   * 执行微信登录，获取 code
   */
  async wxLogin() {
    this.setData({ loading: true });
    try {
      // 调用 wx.login 获取临时登录凭证 code
      const loginRes = await wx.login({ timeout: 10000 });
      console.log('获取到 code:', loginRes.code);

      // TODO: 将 code 发送到后端，换取 openid 和 session_key
      // const sessionRes = await authService.code2Session(loginRes.code);

      // TODO: 保存登录态到本地存储
      wx.setStorageSync('token', 'placeholder_token');

      wx.showToast({ title: '登录成功', icon: 'success' });

      // 登录成功后返回上一页或进入首页
      setTimeout(() => {
        wx.navigateBack({ delta: 1 });
      }, 1000);
    } catch (err) {
      console.error('登录失败', err);
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 获取用户资料（推荐使用 wx.getUserProfile）
   */
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户资料成功:', res.userInfo);
        // TODO: 将用户信息发送到后端保存
        this.wxLogin();
      },
      fail: (err) => {
        console.error('用户拒绝授权:', err);
        wx.showToast({ title: '需要授权才能继续使用', icon: 'none' });
      }
    });
  },

  /**
   * 处理用户授权按钮回调（旧版兼容）
   */
  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      console.log('用户授权成功:', e.detail.userInfo);
      this.wxLogin();
    } else {
      wx.showToast({ title: '需要授权才能继续使用', icon: 'none' });
    }
  },

  /**
   * 暂不登录，以游客身份浏览
   */
  skipLogin() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
