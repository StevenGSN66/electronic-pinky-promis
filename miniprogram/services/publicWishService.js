// services/publicWishService.js - 公开热门愿望榜单

const request = require('../utils/request')

/**
 * 获取公开热门愿望榜单
 * @param {Object} params 查询参数
 *   { category, sortBy, page, pageSize }
 *   sortBy 可选：hot(热度) | new(最新) | likes(点赞数)
 * @returns {Promise}
 */
function getHotWishes(params = {}) {
  return request.get('/api/publicWish/hotList', params)
}

/**
 * 获取分类热门愿望
 * @param {string} category 愿望分类
 * @param {Object} params 其他参数
 * @returns {Promise}
 */
function getHotWishesByCategory(category, params = {}) {
  return request.get('/api/publicWish/hotByCategory', {
    category,
    ...params
  })
}

/**
 * 点赞公开愿望
 * @param {string} wishId 愿望ID
 * @returns {Promise}
 */
function likePublicWish(wishId) {
  return request.post('/api/publicWish/like', { wishId })
}

/**
 * 收藏公开愿望到自己的愿望列表
 * @param {string} wishId 愿望ID
 * @returns {Promise}
 */
function collectPublicWish(wishId) {
  return request.post('/api/publicWish/collect', { wishId })
}

/**
 * 获取愿望分类统计
 * @returns {Promise}
 */
function getCategoryStats() {
  return request.get('/api/publicWish/categoryStats')
}

module.exports = {
  getHotWishes,
  getHotWishesByCategory,
  likePublicWish,
  collectPublicWish,
  getCategoryStats
}
