/**
 * user.js
 * 我的页面：管理头像/昵称/家庭成员，查看勋章/守约率/历史记录
 */

const userService = require('../../services/userService');
const promiseService = require('../../services/promiseService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    userInfo: null,       // 用户信息
    familyMembers: [],    // 家庭成员列表
    stats: {              // 统计数据
      completionRate: 0,  // 守约率
      totalPromises: 0,   // 总约定数
      completedPromises: 0, // 已完成数
      badges: []          // 勋章列表
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('user 页面加载');
    this.loadUserData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('user 页面显示');
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.loadUserData();
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    this.setData({ loading: true });
    try {
      // TODO: 调用 userService.getUserInfo() 获取用户信息
      // TODO: 调用 userService.getFamilyMembers() 获取家庭成员
      // TODO: 调用 promiseService.getUserStats() 获取统计数据
      console.log('加载用户数据...');
    } catch (err) {
      console.error('加载用户数据失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 编辑个人信息
   */
  editProfile() {
    wx.navigateTo({ url: '/pages/onboarding/onboarding?mode=edit' });
  },

  /**
   * 管理家庭成员
   */
  manageFamily() {
    // TODO: 跳转到家庭成员管理页
    wx.showToast({ title: '家庭成员管理功能开发中', icon: 'none' });
  },

  /**
   * 查看历史记录
   */
  goToHistory() {
    wx.switchTab({ url: '/pages/promise-list/promise-list' });
  },

  /**
   * 查看勋章详情
   */
  viewBadge(e) {
    const badgeId = e.currentTarget.dataset.id;
    // TODO: 展示勋章详情弹窗
    console.log('查看勋章:', badgeId);
  },

  /**
   * 进入愿望岛
   */
  goToWishIsland() {
    wx.switchTab({ url: '/pages/wish-island/wish-island' });
  },

  /**
   * 进入我的星球
   */
  goToMyPlanet() {
    wx.navigateTo({ url: '/pages/my-planet/my-planet' });
  },

  /**
   * 联系客服
   */
  contactSupport() {
    // TODO: 调用客服消息接口
    wx.showToast({ title: '客服功能开发中', icon: 'none' });
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录',
      success: (res) => {
        if (res.confirm) {
          // TODO: 清除本地登录态
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/auth/auth' });
        }
      }
    });
  }
});
