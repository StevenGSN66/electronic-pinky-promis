// services/authService.js - 微信登录、获取用户信息

const request = require('../utils/request')
const userStore = require('../store/userStore')

/**
 * 微信登录
 * 调用 wx.login 获取 code，发送到后端换取 token
 * @returns {Promise} 登录结果
 */
function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 将 code 发送到后端
          request.post('/api/auth/login', { code: res.code })
            .then((result) => {
              // 存储 token 和用户信息
              if (result.data && result.data.token) {
                userStore.setToken(result.data.token)
                userStore.setUserInfo(result.data.userInfo || null)
                if (result.data.familyInfo) {
                  userStore.setFamilyInfo(result.data.familyInfo)
                }
              }
              resolve(result)
            })
            .catch((err) => {
              reject(err)
            })
        } else {
          reject({ code: -1, message: res.errMsg || '登录失败' })
        }
      },
      fail: (err) => {
        reject({ code: -1, message: 'wx.login 调用失败' })
      }
    })
  })
}

/**
 * 获取微信用户信息（需用户授权）
 * @returns {Promise}
 */
function getUserProfile() {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo
        // 更新本地存储
        userStore.updateUserField('nickName', userInfo.nickName)
        userStore.updateUserField('avatarUrl', userInfo.avatarUrl)

        // 同步到后端
        request.post('/api/auth/updateUserInfo', {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }).then(() => {
          resolve(userInfo)
        }).catch(() => {
          // 后端同步失败不影响本地使用
          resolve(userInfo)
        })
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 退出登录
 */
function logout() {
  userStore.clear()
  wx.reLaunch({
    url: '/pages/login/login'
  })
}

module.exports = {
  wxLogin,
  getUserProfile,
  logout
}
