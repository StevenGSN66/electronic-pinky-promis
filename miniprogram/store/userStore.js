// store/userStore.js - 简单全局状态管理

// 本地存储的 key
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  FAMILY_INFO: 'familyInfo',
  TOKEN: 'token'
}

/**
 * 用户状态管理器
 * 提供 get/set/clear 方法，数据持久化到本地存储
 */
const userStore = {
  // 内存缓存
  _cache: {
    userInfo: null,
    familyInfo: null,
    token: null
  },

  /**
   * 设置用户信息
   * @param {Object} userInfo 用户信息
   */
  setUserInfo(userInfo) {
    this._cache.userInfo = userInfo
    wx.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo)
  },

  /**
   * 获取用户信息
   * @returns {Object|null}
   */
  getUserInfo() {
    if (this._cache.userInfo) {
      return this._cache.userInfo
    }
    const userInfo = wx.getStorageSync(STORAGE_KEYS.USER_INFO)
    this._cache.userInfo = userInfo || null
    return this._cache.userInfo
  },

  /**
   * 设置家庭信息
   * @param {Object} familyInfo 家庭信息
   */
  setFamilyInfo(familyInfo) {
    this._cache.familyInfo = familyInfo
    wx.setStorageSync(STORAGE_KEYS.FAMILY_INFO, familyInfo)
  },

  /**
   * 获取家庭信息
   * @returns {Object|null}
   */
  getFamilyInfo() {
    if (this._cache.familyInfo) {
      return this._cache.familyInfo
    }
    const familyInfo = wx.getStorageSync(STORAGE_KEYS.FAMILY_INFO)
    this._cache.familyInfo = familyInfo || null
    return this._cache.familyInfo
  },

  /**
   * 设置 token
   * @param {string} token 登录令牌
   */
  setToken(token) {
    this._cache.token = token
    wx.setStorageSync(STORAGE_KEYS.TOKEN, token)
  },

  /**
   * 获取 token
   * @returns {string|null}
   */
  getToken() {
    if (this._cache.token) {
      return this._cache.token
    }
    const token = wx.getStorageSync(STORAGE_KEYS.TOKEN)
    this._cache.token = token || null
    return this._cache.token
  },

  /**
   * 判断是否已登录
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!this.getToken()
  },

  /**
   * 清除所有用户数据（退出登录）
   */
  clear() {
    this._cache = {
      userInfo: null,
      familyInfo: null,
      token: null
    }
    wx.removeStorageSync(STORAGE_KEYS.USER_INFO)
    wx.removeStorageSync(STORAGE_KEYS.FAMILY_INFO)
    wx.removeStorageSync(STORAGE_KEYS.TOKEN)
  },

  /**
   * 更新用户信息的某个字段
   * @param {string} key 字段名
   * @param {*} value 字段值
   */
  updateUserField(key, value) {
    const userInfo = this.getUserInfo() || {}
    userInfo[key] = value
    this.setUserInfo(userInfo)
  }
}

module.exports = userStore
