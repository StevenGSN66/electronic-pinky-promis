/**
 * wish-island.js
 * 愿望岛主页面：分类标签栏（全部/旅游/玩具/美食/影视/演出/其他），热门愿望榜单，预留广告位
 */

const wishService = require('../../services/wishService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    currentTab: 'all',      // 当前分类
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'travel', label: '旅游' },
      { key: 'toy', label: '玩具' },
      { key: 'food', label: '美食' },
      { key: 'movie', label: '影视' },
      { key: 'show', label: '演出' },
      { key: 'other', label: '其他' }
    ],
    hotWishes: [],          // 热门愿望榜单
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('wish-island 页面加载');
    this.loadHotWishes();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('wish-island 页面显示');
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  /**
   * 切换分类标签
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      page: 1,
      hotWishes: [],
      hasMore: true
    });
    this.loadHotWishes();
  },

  /**
   * 加载热门愿望
   */
  async loadHotWishes() {
    const { currentTab, page, pageSize } = this.data;
    this.setData({ loading: true });
    try {
      // TODO: 调用 wishService.getHotWishes({ category: currentTab, page, pageSize })
      console.log(`加载 ${currentTab} 分类的热门愿望`);

      // 模拟数据
      const mockData = [
        { id: '1', title: '去海边玩', category: 'travel', participants: 128, image: '' },
        { id: '2', title: '买一个乐高积木', category: 'toy', participants: 86, image: '' }
      ];

      this.setData({
        hotWishes: page === 1 ? mockData : [...this.data.hotWishes, ...mockData],
        hasMore: mockData.length === pageSize
      });
    } catch (err) {
      console.error('加载愿望失败', err);
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
    this.loadHotWishes().then(() => {
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
      this.loadHotWishes();
    }
  },

  /**
   * 查看愿望详情
   */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/wish-detail/wish-detail?id=${id}` });
  },

  /**
   * 去我家愿望墙
   */
  goToMyWishes() {
    wx.navigateTo({ url: '/pages/my-wishes/my-wishes' });
  },

  /**
   * 我也想许愿
   */
  makeWish() {
    wx.navigateTo({ url: '/pages/my-wishes/my-wishes?mode=create' });
  }
});
