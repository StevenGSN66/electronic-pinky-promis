/**
 * review.js
 * 未履约AI温和复盘页：孩子和家长分别填写原因，AI生成建议，选择重新约定/补充履约/取消
 */

const aiService = require('../../services/aiService');
const promiseService = require('../../services/promiseService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    promiseId: '',        // 约定ID
    promise: null,        // 约定信息

    // 双方原因
    childReason: '',      // 孩子填写的原因
    parentReason: '',     // 家长填写的原因

    // AI建议
    aiAdvice: '',         // AI生成的温和建议
    isGenerating: false,  // 是否正在生成建议

    // 后续决策
    decision: ''          // 'restart' | 'supplement' | 'cancel'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('review 页面加载', options);
    const { promiseId } = options;
    if (promiseId) {
      this.setData({ promiseId });
      this.loadPromiseInfo(promiseId);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('review 页面显示');
  },

  /**
   * 加载约定信息
   */
  async loadPromiseInfo(id) {
    this.setData({ loading: true });
    try {
      // TODO: 调用 promiseService.getPromiseDetail(id)
      console.log('加载约定信息:', id);
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 孩子输入原因
   */
  onChildInput(e) {
    this.setData({ childReason: e.detail.value });
  },

  /**
   * 家长输入原因
   */
  onParentInput(e) {
    this.setData({ parentReason: e.detail.value });
  },

  /**
   * 调用 AI 生成温和复盘建议
   */
  async generateAIAdvice() {
    const { childReason, parentReason } = this.data;
    if (!childReason.trim() || !parentReason.trim()) {
      wx.showToast({ title: '请双方先填写原因', icon: 'none' });
      return;
    }

    this.setData({ isGenerating: true });
    try {
      // TODO: 调用 aiService.generateReviewAdvice({ childReason, parentReason })
      // 模拟AI建议
      const mockAdvice = '感谢你们的坦诚沟通。未履约并不可怕，重要的是理解背后的原因。建议下次可以将大目标拆分成小步骤，每天前进一点点。我们一起加油！';
      this.setData({ aiAdvice: mockAdvice });
    } catch (err) {
      console.error('AI建议生成失败', err);
      wx.showToast({ title: '建议生成失败', icon: 'none' });
    } finally {
      this.setData({ isGenerating: false });
    }
  },

  /**
   * 选择后续决策
   */
  selectDecision(e) {
    const decision = e.currentTarget.dataset.value;
    this.setData({ decision });
  },

  /**
   * 提交复盘结果
   */
  async submitReview() {
    const { promiseId, childReason, parentReason, decision } = this.data;
    if (!childReason.trim() || !parentReason.trim()) {
      wx.showToast({ title: '请填写双方原因', icon: 'none' });
      return;
    }
    if (!decision) {
      wx.showToast({ title: '请选择后续处理方式', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      // TODO: 调用 promiseService.submitReview({ promiseId, childReason, parentReason, decision })
      wx.showToast({ title: '复盘已保存', icon: 'success' });

      // 根据决策跳转
      if (decision === 'restart') {
        wx.redirectTo({ url: `/pages/promise-create/promise-create?restartFrom=${promiseId}` });
      } else if (decision === 'supplement') {
        wx.redirectTo({ url: `/pages/checkin/checkin?promiseId=${promiseId}&mode=supplement` });
      } else {
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (err) {
      console.error('提交复盘失败', err);
      wx.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
