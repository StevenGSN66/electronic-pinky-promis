/**
 * checkin.js
 * 打卡/履约记录页：记录履约情况，双方确认，上传照片/备注，完成后增加信任水滴
 */

const checkinService = require('../../services/checkinService');
const promiseService = require('../../services/promiseService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    promiseId: '',        // 关联的约定ID
    promise: null,        // 约定信息
    photos: [],           // 上传的照片列表
    remark: '',           // 备注文字
    isConfirmed: false    // 对方是否已确认
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('checkin 页面加载', options);
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
    console.log('checkin 页面显示');
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
   * 选择并上传照片
   */
  choosePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFilePaths[0];
        // TODO: 上传图片到服务器
        const photos = this.data.photos.concat(tempPath);
        this.setData({ photos });
      }
    });
  },

  /**
   * 删除照片
   */
  removePhoto(e) {
    const index = e.currentTarget.dataset.index;
    const photos = this.data.photos.filter((_, i) => i !== index);
    this.setData({ photos });
  },

  /**
   * 输入备注
   */
  onInputRemark(e) {
    this.setData({ remark: e.detail.value });
  },

  /**
   * 提交打卡记录
   */
  async submitCheckin() {
    const { promiseId, photos, remark } = this.data;
    if (photos.length === 0 && !remark.trim()) {
      wx.showToast({ title: '请上传照片或填写备注', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      // TODO: 调用 checkinService.submitCheckin({ promiseId, photos, remark })
      wx.showToast({ title: '打卡成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('打卡失败', err);
      wx.showToast({ title: '打卡失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 确认对方的打卡记录（双向确认）
   */
  async confirmCheckin() {
    const { promiseId } = this.data;
    this.setData({ loading: true });
    try {
      // TODO: 调用 checkinService.confirmCheckin(promiseId)
      wx.showToast({ title: '已确认，信任水滴+1', icon: 'success' });
      this.setData({ isConfirmed: true });
    } catch (err) {
      wx.showToast({ title: '确认失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
