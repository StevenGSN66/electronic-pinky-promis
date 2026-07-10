// utils/request.js - 网络请求封装

const env = require('../config/env')
const userStore = require('../store/userStore')

/**
 * 发起网络请求
 * @param {Object} options 请求配置
 * @returns {Promise} 请求结果
 */
function request(options = {}) {
  return new Promise((resolve, reject) => {
    // 拼接完整 URL
    const url = options.url.startsWith('http')
      ? options.url
      : `${env.API_BASE_URL}${options.url}`

    // 从 store 获取 token
    const token = userStore.getToken()

    // 默认 header
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }

    // 如果有 token，添加到 header
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      timeout: options.timeout || 15000,
      success: (res) => {
        // HTTP 状态码判断
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 业务状态码判断（根据后端约定）
          if (res.data.code === 0 || res.data.code === 200) {
            resolve(res.data)
          } else {
            // 业务错误处理
            handleBusinessError(res.data)
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          // token 过期，清除登录态并跳转登录
          handleUnauthorized()
          reject({ code: 401, message: '登录已过期，请重新登录' })
        } else {
          // HTTP 错误
          showToast(`请求失败：${res.statusCode}`)
          reject({ code: res.statusCode, message: '请求失败' })
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        showToast('网络请求失败，请检查网络')
        reject({ code: -1, message: '网络请求失败' })
      }
    })
  })
}

/**
 * GET 请求
 */
function get(url, params = {}) {
  return request({ url, method: 'GET', data: params })
}

/**
 * POST 请求
 */
function post(url, data = {}) {
  return request({ url, method: 'POST', data })
}

/**
 * PUT 请求
 */
function put(url, data = {}) {
  return request({ url, method: 'PUT', data })
}

/**
 * DELETE 请求
 */
function del(url, data = {}) {
  return request({ url, method: 'DELETE', data })
}

/**
 * 处理业务错误
 */
function handleBusinessError(data) {
  const message = data.message || data.msg || '请求出错'
  console.error('业务错误:', message)
  showToast(message)
}

/**
 * 处理 401 未授权
 */
function handleUnauthorized() {
  userStore.clear()
  wx.showModal({
    title: '提示',
    content: '登录已过期，请重新登录',
    showCancel: false,
    success: () => {
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }
  })
}

/**
 * 显示提示
 */
function showToast(message) {
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  del
}
