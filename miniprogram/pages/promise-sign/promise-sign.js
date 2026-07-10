// pages/promise-sign/promise-sign.js
// 电子拉钩确认页：双方签名或点击确认，完成约定的仪式感环节

const promiseService = require('../../services/promiseService')
const userStore = require('../../store/userStore')

Page({
  data: {
    promiseId: '',
    promise: null,
    currentRole: '', // 'promisor' 或 'receiver'
    mySignature: null, // 当前用户的签名数据
    otherSignature: null, // 对方的签名数据
    isSigned: false,
    loading: false
  },

  onLoad(options) {
    const { promiseId, role } = options
    this.setData({
      promiseId,
      currentRole: role || 'promisor'
    })
    this.loadPromiseDetail(promiseId)
  },

  // 加载约定详情
  async loadPromiseDetail(promiseId) {
    this.setData({ loading: true })
    try {
      const res = await promiseService.getPromiseDetail(promiseId)
      this.setData({
        promise: res.data,
        loading: false
      })
      // 检查是否已签名
      this.checkSignatureStatus(res.data)
    } catch (err) {
      console.error('加载约定详情失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 检查签名状态
  checkSignatureStatus(promise) {
    const userId = userStore.get('userInfo')?.id
    // 判断当前用户是发起人还是接受人
    const isPromisor = promise.promisorId === userId
    const mySig = promise.signatures?.find(s => s.userId === userId)
    const otherSig = promise.signatures?.find(s => s.userId !== userId)

    this.setData({
      currentRole: isPromisor ? 'promisor' : 'receiver',
      mySignature: mySig || null,
      otherSignature: otherSig || null,
      isSigned: !!mySig
    })
  },

  // 签名完成回调（来自 signature-pad 组件）
  onSignatureComplete(e) {
    const { signatureData } = e.detail
    this.setData({
      mySignature: signatureData,
      isSigned: true
    })
  },

  // 点击确认（简化的电子拉钩，不需要手写签名）
  async onTapConfirm() {
    if (this.data.isSigned) {
      wx.showToast({ title: '已经拉过钩啦', icon: 'none' })
      return
    }

    const userId = userStore.get('userInfo')?.id
    const signatureData = {
      userId,
      type: 'tap',
      confirmedAt: new Date().toISOString()
    }

    await this.submitSignature(signatureData)
  },

  // 手写签名完成，提交签名
  async onHandwritingComplete(e) {
    const { imageData } = e.detail
    const userId = userStore.get('userInfo')?.id
    const signatureData = {
      userId,
      type: 'canvas',
      imageData,
      confirmedAt: new Date().toISOString()
    }

    await this.submitSignature(signatureData)
  },

  // 提交签名到后端
  async submitSignature(signatureData) {
    this.setData({ loading: true })
    try {
      await promiseService.signPromise(this.data.promiseId, signatureData)
      this.setData({
        mySignature: signatureData,
        isSigned: true,
        loading: false
      })
      wx.showToast({ title: '拉钩成功！', icon: 'success' })

      // 检查双方是否都已签名
      this.checkBothSigned()
    } catch (err) {
      console.error('提交签名失败:', err)
      wx.showToast({ title: '提交失败，请重试', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 检查双方是否都已签名
  checkBothSigned() {
    const { promise, mySignature } = this.data
    if (!promise || !mySignature) return

    const hasBoth = promise.signatures?.length >= 2 ||
      (mySignature && this.data.otherSignature)

    if (hasBoth) {
      // 双方都已签名，播放拉钩动画
      this.playPullHookAnimation()
      // 延迟后跳转首页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 2000)
    }
  },

  // 播放拉钩成功动画
  playPullHookAnimation() {
    // TODO: 拉钩动画（手指勾在一起 + 信任水滴飘落）
    console.log('🤝 拉钩动画播放中...')
  },

  // 重新签名
  onResetSignature() {
    this.setData({
      mySignature: null,
      isSigned: false
    })
  },

  // 返回修改约定
  onBackToEdit() {
    wx.navigateBack()
  }
})
