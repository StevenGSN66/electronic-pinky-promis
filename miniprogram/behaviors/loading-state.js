// behaviors/loading-state.js - 加载状态 behavior
// 混入到页面或组件中，提供统一的加载状态管理

module.exports = Behavior({
  data: {
    // 页面整体加载中
    isPageLoading: false,
    // 下拉刷新中
    isPullDownRefreshing: false,
    // 上拉加载更多中
    isLoadMoreLoading: false,
    // 按钮提交中（防止重复提交）
    isSubmitting: false,
    // 骨架屏显示
    showSkeleton: false
  },

  methods: {
    /**
     * 显示页面加载状态
     */
    showPageLoading() {
      this.setData({ isPageLoading: true })
    },

    /**
     * 隐藏页面加载状态
     */
    hidePageLoading() {
      this.setData({ isPageLoading: false })
    },

    /**
     * 显示骨架屏
     */
    showSkeleton() {
      this.setData({ showSkeleton: true })
    },

    /**
     * 隐藏骨架屏
     */
    hideSkeleton() {
      this.setData({ showSkeleton: false })
    },

    /**
     * 开始下拉刷新
     */
    startPullDownRefresh() {
      this.setData({ isPullDownRefreshing: true })
      wx.showNavigationBarLoading()
    },

    /**
     * 停止下拉刷新
     */
    stopPullDownRefresh() {
      this.setData({ isPullDownRefreshing: false })
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    },

    /**
     * 开始加载更多
     */
    startLoadMore() {
      this.setData({ isLoadMoreLoading: true })
    },

    /**
     * 停止加载更多
     */
    stopLoadMore() {
      this.setData({ isLoadMoreLoading: false })
    },

    /**
     * 开始提交（防止重复提交）
     */
    startSubmit() {
      this.setData({ isSubmitting: true })
    },

    /**
     * 停止提交
     */
    stopSubmit() {
      this.setData({ isSubmitting: false })
    },

    /**
     * 执行带加载状态的数据请求
     * @param {Function} requestFn 请求函数（返回 Promise）
     * @param {Object} options 配置
     *   { showLoading: boolean, loadingText: string, errorToast: boolean }
     * @returns {Promise}
     */
    async requestWithLoading(requestFn, options = {}) {
      const { showLoading = true, loadingText = '加载中...', errorToast = true } = options

      if (showLoading) {
        wx.showLoading({ title: loadingText, mask: true })
      }

      try {
        const result = await requestFn()
        return result
      } catch (err) {
        if (errorToast && err.message) {
          wx.showToast({
            title: err.message,
            icon: 'none',
            duration: 2000
          })
        }
        throw err
      } finally {
        if (showLoading) {
          wx.hideLoading()
        }
      }
    }
  }
})
