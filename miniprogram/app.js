// app.js - 小程序入口文件
App({
  // 全局数据
  globalData: {
    userInfo: null,    // 用户信息
    familyInfo: null,  // 家庭信息
    systemInfo: null   // 系统信息
  },

  /**
   * 小程序启动时执行
   */
  onLaunch() {
    console.log('小程序启动')

    // 获取系统信息
    this.getSystemInfo()

    // 调用微信登录，获取 code
    this.wxLogin()
  },

  /**
   * 微信登录，获取 code
   * 将 code 发送到后端换取 openid 和 token
   */
  wxLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('获取到登录 code:', res.code)
          // 将 code 存储到全局，后续发送到后端
          this.globalData.loginCode = res.code
        } else {
          console.error('登录失败:', res.errMsg)
        }
      },
      fail: (err) => {
        console.error('wx.login 调用失败:', err)
      }
    })
  },

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res
        console.log('系统信息:', res)
      },
      fail: (err) => {
        console.error('获取系统信息失败:', err)
      }
    })
  },

  /**
   * 设置全局用户信息
   * @param {Object} userInfo 用户信息
   */
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
  },

  /**
   * 设置全局家庭信息
   * @param {Object} familyInfo 家庭信息
   */
  setFamilyInfo(familyInfo) {
    this.globalData.familyInfo = familyInfo
  }
})
