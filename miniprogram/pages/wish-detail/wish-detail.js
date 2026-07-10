/**
 * wish-detail.js
 * 单个热门愿望详情页：展示详情+参与用户脱敏列表+我也想许愿按钮
 */

const wishService = require('../../services/wishService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    wishId: '',           // 愿望ID
    wish: null,           // 愿望详情
    participants: [],     // 参与用户脱敏列表
    hasJoined: false      // 当前用户是否已参与
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('wish-detail 页面加载', options);
    const { id } = options;
    if (id) {
      this.setData({ wishId: id });
      this.loadWishDetail(id);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('wish-detail 页面显示');
  },

  /**
   * 加载愿望详情
   */
  async loadWishDetail(id) {
    this.setData({ loading: true });
    try {
      // TODO: 调用 wishService.getWishDetail(id)
      console.log('加载愿望详情:', id);

      // 模拟数据
      const mockWish = {
        id: id,
        title: '去海边玩',
        category: 'travel',
        description: '希望暑假能和家人一起去海边，捡贝壳、堆沙堡、看日出。',
        participants: 128,
        image: ''
      };

      const mockParticipants = [
        { nickname: '小*', avatar: '' },
        { nickname: '明*', avatar: '' },
        { nickname: '爸*', avatar: '' }
      ];

      this.setData({
        wish: mockWish,
        participants: mockParticipants
      });
    } catch (err) {
      console.error('加载失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 参与/许愿
   */
  async joinWish() {
    const { wishId } = this.data;
    this.setData({ loading: true });
    try {
      // TODO: 调用 wishService.joinWish(wishId)
      wx.showToast({ title: '已加入愿望', icon: 'success' });
      this.setData({ hasJoined: true });
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 我也想许愿（跳转到我家愿望墙）
   */
  goToMakeWish() {
    wx.navigateTo({ url: '/pages/my-wishes/my-wishes?mode=create&templateId=' + this.data.wishId });
  }
});
