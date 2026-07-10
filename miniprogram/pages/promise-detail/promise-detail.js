/**
 * promise-detail.js
 * 约定详情页：展示约定内容、承诺人、截止时间、完成标准、签名凭证，支持完成/延期/复盘
 */

const promiseService = require('../../services/promiseService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    promiseId: '',        // 约定ID
    promise: null,        // 约定详情对象
    statusMap: {
      'pending': '进行中',
      'completed': '已完成',
      'overdue': '已逾期',
      'reviewed': '已复盘'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('promise-detail 页面加载', options);
    const { id } = options;
    if (id) {
      this.setData({ promiseId: id });
      this.loadPromiseDetail(id);
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('promise-detail 页面显示');
  },

  /**
   * 加载约定详情
   */
  async loadPromiseDetail(id) {
    this.setData({ loading: true });
    try {
      // TODO: 调用 promiseService.getPromiseDetail(id) 获取详情
      // 模拟数据
      const mockPromise = {
        id: id,
        title: '每天阅读30分钟',
        content: '每天晚上8点到8点半，专注阅读课外书30分钟',
        initiator: { name: '爸爸', avatar: '' },
        acceptor: { name: '小明', avatar: '' },
        deadline: '2024-12-31',
        standard: '完成阅读并能复述主要内容',
        status: 'pending',
        signatureUrl: '',
        createdAt: '2024-01-01'
      };
      this.setData({ promise: mockPromise });
    } catch (err) {
      console.error('加载约定详情失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 标记约定为已完成
   */
  async markAsCompleted() {
    const { promiseId } = this.data;
    wx.showModal({
      title: '确认完成',
      content: '确定要将此约定标记为已完成吗？',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          try {
            // TODO: 调用 promiseService.completePromise(promiseId)
            wx.showToast({ title: '操作成功', icon: 'success' });
            this.loadPromiseDetail(promiseId);
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          } finally {
            this.setData({ loading: false });
          }
        }
      }
    });
  },

  /**
   * 申请延期
   */
  requestPostpone() {
    // TODO: 弹出延期申请弹窗，选择新截止日期并填写原因
    wx.showToast({ title: '延期功能开发中', icon: 'none' });
  },

  /**
   * 发起复盘（未履约时）
   */
  goToReview() {
    const { promiseId } = this.data;
    wx.navigateTo({ url: `/pages/review/review?promiseId=${promiseId}` });
  },

  /**
   * 查看签名大图
   */
  previewSignature() {
    const { promise } = this.data;
    if (promise && promise.signatureUrl) {
      wx.previewImage({ urls: [promise.signatureUrl] });
    }
  },

  /**
   * 分享约定
   */
  onShareAppMessage() {
    const { promise } = this.data;
    return {
      title: `约定：${promise ? promise.title : '一起守约吧'}`,
      path: `/pages/promise-detail/promise-detail?id=${this.data.promiseId}`
    };
  }
});
