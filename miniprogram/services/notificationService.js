// services/notificationService.js - 订阅消息相关接口

const request = require('../utils/request')
const { SUBSCRIBE_TEMPLATES } = require('../config/constants')

/**
 * 请求订阅消息授权
 * @param {string|Array} tmplIds 模板ID（单个字符串或数组）
 * @returns {Promise} 用户授权结果
 */
function requestSubscribeMessage(tmplIds) {
  return new Promise((resolve, reject) => {
    const ids = Array.isArray(tmplIds) ? tmplIds : [tmplIds]

    wx.requestSubscribeMessage({
      tmplIds: ids,
      success: (res) => {
        console.log('订阅授权结果:', res)
        // res 格式: { errMsg: 'requestSubscribeMessage:ok', xxx: 'accept' }
        // 遍历结果，将授权状态同步到后端
        const results = {}
        ids.forEach((id) => {
          results[id] = res[id] || 'reject'
        })

        // 同步到后端
        syncSubscribeStatus(results)
        resolve(res)
      },
      fail: (err) => {
        console.error('订阅授权失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 同步订阅状态到后端
 * @param {Object} results 模板ID与授权状态的映射
 */
function syncSubscribeStatus(results) {
  request.post('/api/notification/syncSubscribe', { results })
    .then(() => {
      console.log('订阅状态同步成功')
    })
    .catch((err) => {
      console.error('订阅状态同步失败:', err)
    })
}

/**
 * 发送订阅消息（调用后端接口）
 * @param {Object} data 消息数据
 *   { templateId, openId, page, data }
 * @returns {Promise}
 */
function sendSubscribeMessage(data) {
  return request.post('/api/notification/send', data)
}

/**
 * 获取用户订阅列表
 * @returns {Promise}
 */
function getSubscribeList() {
  return request.get('/api/notification/list')
}

module.exports = {
  requestSubscribeMessage,
  syncSubscribeStatus,
  sendSubscribeMessage,
  getSubscribeList,
  SUBSCRIBE_TEMPLATES
}
