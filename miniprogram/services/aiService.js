// services/aiService.js - AI 相关接口
// 注意：所有 AI 请求都发送到自己的后端，不直接请求大模型 API

const request = require('../utils/request')

/**
 * 解析约定内容
 * 将自然语言描述解析为结构化约定数据
 * @param {string} text 用户输入的约定描述
 * @returns {Promise} 解析结果
 *   { title, type, deadline, reward, content }
 */
function parsePromise(text) {
  return request.post('/api/ai/parsePromise', { text })
}

/**
 * 生成约定回顾评语
 * @param {string} promiseId 约定ID
 * @param {Object} data 回顾相关数据
 *   { childName, promiseTitle, completionNote, parentComment }
 * @returns {Promise} 评语内容
 */
function generateReview(promiseId, data = {}) {
  return request.post('/api/ai/generateReview', {
    promiseId,
    ...data
  })
}

/**
 * 生成提醒文案
 * @param {string} promiseId 约定ID
 * @param {Object} data 提醒相关数据
 *   { childName, promiseTitle, deadline }
 * @returns {Promise} 提醒文案
 */
function generateReminder(promiseId, data = {}) {
  return request.post('/api/ai/generateReminder', {
    promiseId,
    ...data
  })
}

module.exports = {
  parsePromise,
  generateReview,
  generateReminder
}
