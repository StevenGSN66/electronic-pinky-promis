/**
 * index.js
 * 首页/信任星球：展示信任星球全景、亲情树（已点亮）、友情树/自律树（待开放）
 * 今日待完成约定、信任水滴总数、最近守约动态
 */

const promiseService = require('../../services/promiseService');
const trustService = require('../../services/trustService');
const userStore = require('../../store/userStore');

// 树种配置
const TREE_TYPES = {
  affection: { name: '亲情树', icon: '🌳', color: '#7CD4A8', desc: '记录亲子之间的温暖约定' },
  friendship: { name: '友情树', icon: '🌲', color: '#B5D8F7', desc: '与小伙伴一起成长的约定' },
  selfDiscipline: { name: '自律树', icon: '🌴', color: '#FFDAC1', desc: '自己对自己的承诺' }
};

Page({
  data: {
    loading: false,

    // 信任星球
    planetName: '我的信任星球',
    totalDrops: 0,
    affectionDrops: 0,

    // 树种状态
    trees: [
      { type: 'affection', status: 'active', ...TREE_TYPES.affection, drops: 0, level: 1 },
      { type: 'friendship', status: 'locked', ...TREE_TYPES.friendship, drops: 0, level: 0, unlockHint: '完成10个约定后解锁' },
      { type: 'selfDiscipline', status: 'locked', ...TREE_TYPES.selfDiscipline, drops: 0, level: 0, unlockHint: '完成20个约定后解锁' }
    ],

    // 今日约定
    todayPromises: [],

    // 最近动态
    recentActivities: []
  },

  onLoad() {
    this.loadHomeData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    this.loadHomeData();
  },

  onPullDownRefresh() {
    this.loadHomeData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载首页数据
  async loadHomeData() {
    this.setData({ loading: true });
    try {
      // 并行加载
      const [trustRes, promiseRes] = await Promise.all([
        trustService.getTrustTree(),
        promiseService.getPromiseList({ status: 'pending', timeFilter: 'today' })
      ]);

      const trustData = trustRes.data || {};
      const promises = promiseRes.data?.list || [];

      // 更新星球数据
      this.setData({
        totalDrops: trustData.totalDrops || 0,
        affectionDrops: trustData.affectionDrops || 0,
        trees: this.updateTreesStatus(trustData),
        todayPromises: promises,
        recentActivities: this.mockActivities() // TODO: 替换为真实数据
      });
    } catch (err) {
      console.error('加载首页数据失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 更新树种状态（根据已完成约定数判断是否解锁）
  updateTreesStatus(trustData) {
    const completedCount = trustData.completedCount || 0;
    return this.data.trees.map(tree => {
      if (tree.type === 'affection') {
        return { ...tree, status: 'active', drops: trustData.affectionDrops || 0, level: trustData.affectionLevel || 1 };
      }
      if (tree.type === 'friendship' && completedCount >= 10) {
        return { ...tree, status: 'unlockable', unlockHint: '点击解锁友情树！' };
      }
      if (tree.type === 'selfDiscipline' && completedCount >= 20) {
        return { ...tree, status: 'unlockable', unlockHint: '点击解锁自律树！' };
      }
      return tree;
    });
  },

  // 点击树种
  onTapTree(e) {
    const { type, status } = e.currentTarget.dataset;
    if (status === 'locked') {
      const tree = this.data.trees.find(t => t.type === type);
      wx.showToast({ title: tree.unlockHint, icon: 'none' });
      return;
    }
    if (status === 'unlockable') {
      // TODO: 调用解锁接口
      wx.showModal({
        title: '解锁新树种',
        content: '恭喜你完成了足够多的约定，是否解锁这棵新树？',
        success: (res) => {
          if (res.confirm) {
            this.unlockTree(type);
          }
        }
      });
      return;
    }
    // active：进入树的详情/操作页
    wx.navigateTo({ url: `/pages/promise-list/promise-list?treeType=${type}` });
  },

  // 解锁树种
  async unlockTree(treeType) {
    try {
      await trustService.unlockTree(treeType);
      wx.showToast({ title: '解锁成功！', icon: 'success' });
      this.loadHomeData();
    } catch (err) {
      wx.showToast({ title: '解锁失败', icon: 'none' });
    }
  },

  // 点击创建约定
  goToCreatePromise() {
    wx.navigateTo({ url: '/pages/promise-create/promise-create' });
  },

  // 查看约定详情
  goToPromiseDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/promise-detail/promise-detail?id=${id}` });
  },

  // 去打卡
  goToCheckin(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/checkin/checkin?promiseId=${id}` });
  },

  // 查看全部约定
  goToPromiseList() {
    wx.navigateTo({ url: '/pages/promise-list/promise-list' });
  },

  // 模拟动态数据（TODO: 替换为真实接口）
  mockActivities() {
    return [
      { id: 1, content: '完成了"每天阅读30分钟"的约定', time: '2小时前' },
      { id: 2, content: '给亲情树浇灌了信任水滴', time: '昨天' }
    ];
  }
});
