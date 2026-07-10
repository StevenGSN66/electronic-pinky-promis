/**
 * my-planet.js
 * 我的星球页面：展示个人守约率/信任水滴/信任树等级/最近动态
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
    stats: {              // 统计数据
      completionRate: 0,  // 守约率
      trustDrops: 0,      // 信任水滴
      treeLevel: 1,       // 信任树等级
      treeExp: 0,         // 当前经验值
      nextLevelExp: 100   // 升级所需经验
    },
    recentDynamics: []    // 最近动态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('my-planet 页面加载');
    this.loadPlanetData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('my-planet 页面显示');
  },

  /**
   * 加载星球数据
   */
  async loadPlanetData() {
    this.setData({ loading: true });
    try {
      // TODO: 调用 userService.getPlanetData()
      // TODO: 调用 promiseService.getRecentDynamics()
      console.log('加载星球数据...');

      // 模拟数据
      const mockStats = {
        completionRate: 85,
        trustDrops: 1280,
        treeLevel: 5,
        treeExp: 65,
        nextLevelExp: 100
      };

      const mockDynamics = [
        { id: '1', content: '完成了「每天阅读30分钟」的约定', time: '2小时前', type: 'complete' },
        { id: '2', content: '信任树升级到了 Lv.5', time: '昨天', type: 'levelup' }
      ];

      this.setData({
        stats: mockStats,
        recentDynamics: mockDynamics
      });
    } catch (err) {
      console.error('加载星球数据失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 查看全部动态
   */
  goToDynamics() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  /**
   * 分享我的星球
   */
  onShareAppMessage() {
    return {
      title: '来看看我的信任星球吧！',
      path: '/pages/my-planet/my-planet'
    };
  }
});
