/**
 * promise-list.js
 * 我的约定列表页：按状态筛选（进行中/已完成/已逾期/已复盘）
 */

const promiseService = require('../../services/promiseService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    currentTab: 'pending',    // 当前选中标签：pending | completed | overdue | reviewed
    tabs: [
      { key: 'pending', label: '进行中' },
      { key: 'completed', label: '已完成' },
      { key: 'overdue', label: '已逾期' },
      { key: 'reviewed', label: '已复盘' }
    ],
    promiseList: [],          // 当前列表数据
    hasMore: true,            // 是否还有更多数据
    page: 1,                  // 当前页码
    pageSize: 10              // 每页数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('promise-list 页面加载');
    this.loadPromiseList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('promise-list 页面显示');
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    // 刷新列表
    this.setData({ page: 1, promiseList: [] });
    this.loadPromiseList();
  },

  /**
   * 切换筛选标签
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      page: 1,
      promiseList: [],
      hasMore: true
    });
    this.loadPromiseList();
  },

  /**
   * 加载约定列表
   */
  async loadPromiseList() {
    const { currentTab, page, pageSize, promiseList } = this.data;
    this.setData({ loading: true });
    try {
      // TODO: 调用 promiseService.getPromiseList({ status: currentTab, page, pageSize })
      console.log(`加载 ${currentTab} 列表，第 ${page} 页`);

      // 模拟数据
      const mockData = [
        { id: '1', title: '每天阅读30分钟', partnerName: '小明', deadline: '2024-12-31', status: currentTab }
      ];

      this.setData({
        promiseList: page === 1 ? mockData : [...promiseList, ...mockData],
        hasMore: mockData.length === pageSize
      });
    } catch (err) {
      console.error('加载列表失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ page: 1 });
    this.loadPromiseList().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    const { hasMore, loading } = this.data;
    if (hasMore && !loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadPromiseList();
    }
  },

  /**
   * 查看约定详情
   */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/promise-detail/promise-detail?id=${id}` });
  },

  /**
   * 创建新约定
   */
  goToCreate() {
    wx.navigateTo({ url: '/pages/promise-create/promise-create' });
  }
});
