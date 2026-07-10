// services/wishService.js - 愿望相关接口

const request = require('../utils/request')

/**
 * 创建愿望
 * @param {Object} data 愿望数据
 *   { title, description, category, isPublic, images }
 * @returns {Promise}
 */
function createWish(data) {
  return request.post('/api/wish/create', data)
}

/**
 * 获取愿望列表（当前用户/家庭）
 * @param {Object} params 查询参数
 *   { childId, category, status, page, pageSize }
 * @returns {Promise}
 */
function getWishList(params = {}) {
  return request.get('/api/wish/list', params)
}

/**
 * 获取公开愿望列表（愿望岛）
 * @param {Object} params 查询参数
 *   { category, sortBy, page, pageSize }
 * @returns {Promise}
 */
function getPublicWishList(params = {}) {
  return request.get('/api/wish/publicList', params)
}

/**
 * 获取愿望详情
 * @param {string} wishId 愿望ID
 * @returns {Promise}
 */
function getWishDetail(wishId) {
  return request.get('/api/wish/detail', { wishId })
}

/**
 * 将愿望关联到约定
 * @param {string} wishId 愿望ID
 * @param {string} promiseId 约定ID
 * @returns {Promise}
 */
function linkWishToPromise(wishId, promiseId) {
  return request.post('/api/wish/linkToPromise', {
    wishId,
    promiseId
  })
}

/**
 * 更新愿望状态
 * @param {string} wishId 愿望ID
 * @param {string} status 新状态
 * @returns {Promise}
 */
function updateWishStatus(wishId, status) {
  return request.post('/api/wish/updateStatus', {
    wishId,
    status
  })
}

/**
 * 删除愿望
 * @param {string} wishId 愿望ID
 * @returns {Promise}
 */
function deleteWish(wishId) {
  return request.del('/api/wish/delete', { wishId })
}

module.exports = {
  createWish,
  getWishList,
  getPublicWishList,
  getWishDetail,
  linkWishToPromise,
  updateWishStatus,
  deleteWish
}
