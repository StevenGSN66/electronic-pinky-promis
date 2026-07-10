// services/promiseService.js - 约定相关接口

const request = require('../utils/request')

/**
 * 创建约定
 * @param {Object} data 约定数据
 *   { title, content, type, deadline, childId, reward, reminderTime }
 * @returns {Promise}
 */
function createPromise(data) {
  return request.post('/api/promise/create', data)
}

/**
 * 获取约定列表
 * @param {Object} params 查询参数
 *   { status, type, childId, page, pageSize }
 * @returns {Promise}
 */
function getPromiseList(params = {}) {
  return request.get('/api/promise/list', params)
}

/**
 * 获取约定详情
 * @param {string} promiseId 约定ID
 * @returns {Promise}
 */
function getPromiseDetail(promiseId) {
  return request.get('/api/promise/detail', { promiseId })
}

/**
 * 完成约定
 * @param {string} promiseId 约定ID
 * @param {Object} data 完成数据（可选）
 *   { note, images }
 * @returns {Promise}
 */
function completePromise(promiseId, data = {}) {
  return request.post('/api/promise/complete', {
    promiseId,
    ...data
  })
}

/**
 * 回顾约定
 * @param {string} promiseId 约定ID
 * @param {Object} data 回顾数据
 *   { rating, comment, isParent }
 * @returns {Promise}
 */
function reviewPromise(promiseId, data) {
  return request.post('/api/promise/review', {
    promiseId,
    ...data
  })
}

/**
 * 约定签名/电子拉钩确认
 * @param {string} promiseId 约定ID
 * @param {Object} signatureData 签名数据 { userId, type, imageData?, confirmedAt }
 * @returns {Promise}
 */
function signPromise(promiseId, signatureData) {
  return request.post('/api/promise/sign', {
    promiseId,
    ...signatureData
  })
}

module.exports = {
  createPromise,
  getPromiseList,
  getPromiseDetail,
  completePromise,
  reviewPromise,
  signPromise
}
