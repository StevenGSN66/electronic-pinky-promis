/**
 * my-wishes.js
 * 我家私密愿望墙：家庭成员可见，可转化为约定
 */

const wishService = require('../../services/wishService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    wishes: [],           // 私密愿望列表
    familyMembers: [],    // 家庭成员
    showCreateModal: false, // 是否显示创建弹窗
    newWishTitle: '',     // 新愿望标题
    newWishDesc: ''       // 新愿望描述
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('my-wishes 页面加载', options);
    this.loadMyWishes();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('my-wishes 页面显示');
  },

  /**
   * 加载我的愿望列表
   */
  async loadMyWishes() {
    this.setData({ loading: true });
    try {
      // TODO: 调用 wishService.getMyWishes()
      console.log('加载我的愿望');

      // 模拟数据
      const mockData = [
        { id: '1', title: '周末去公园野餐', description: '想和家人一起放风筝', status: 'pending', createdAt: '2024-01-01' },
        { id: '2', title: '买一本新书', description: '想要《哈利波特》系列', status: 'done', createdAt: '2024-01-02' }
      ];

      this.setData({ wishes: mockData });
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 显示创建弹窗
   */
  showCreate() {
    this.setData({ showCreateModal: true });
  },

  /**
   * 关闭创建弹窗
   */
  closeCreate() {
    this.setData({ showCreateModal: false, newWishTitle: '', newWishDesc: '' });
  },

  /**
   * 输入愿望标题
   */
  onTitleInput(e) {
    this.setData({ newWishTitle: e.detail.value });
  },

  /**
   * 输入愿望描述
   */
  onDescInput(e) {
    this.setData({ newWishDesc: e.detail.value });
  },

  /**
   * 创建愿望
   */
  async createWish() {
    const { newWishTitle } = this.data;
    if (!newWishTitle.trim()) {
      wx.showToast({ title: '请输入愿望内容', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      // TODO: 调用 wishService.createWish({ title: newWishTitle, description: newWishDesc })
      wx.showToast({ title: '愿望已添加', icon: 'success' });
      this.closeCreate();
      this.loadMyWishes();
    } catch (err) {
      wx.showToast({ title: '创建失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 将愿望转化为约定
   */
  convertToPromise(e) {
    const wishId = e.currentTarget.dataset.id;
    const wish = this.data.wishes.find(w => w.id === wishId);
    if (!wish) return;

    wx.showModal({
      title: '转化为约定',
      content: `将「${wish.title}」转化为正式约定吗？`,
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用 wishService.convertToPromise(wishId)
          wx.navigateTo({
            url: `/pages/promise-create/promise-create?wishId=${wishId}&title=${encodeURIComponent(wish.title)}`
          });
        }
      }
    });
  },

  /**
   * 删除愿望
   */
  async deleteWish(e) {
    const wishId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个愿望吗？',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          try {
            // TODO: 调用 wishService.deleteWish(wishId)
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadMyWishes();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          } finally {
            this.setData({ loading: false });
          }
        }
      }
    });
  }
});
