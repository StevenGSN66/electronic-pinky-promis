// services/trustService.js - 信任树相关接口

const request = require('../utils/request')
const { TREE_LEVELS } = require('../config/constants')

/**
 * 获取信任树数据
 * @param {string} familyId 家庭ID
 * @returns {Promise}
 */
function getTrustTree(familyId) {
  return request.get('/api/trust/tree', { familyId })
}

/**
 * 计算水滴数量
 * 根据约定完成情况计算应得的水滴
 * @param {Array} completedPromises 已完成的约定列表
 * @returns {number} 水滴总数
 */
function calculateWaterDrops(completedPromises) {
  if (!Array.isArray(completedPromises) || completedPromises.length === 0) {
    return 0
  }

  // 这里使用后端计算结果，前端只做兜底计算
  let drops = 0
  completedPromises.forEach((promise) => {
    drops += promise.waterDrops || 0
  })
  return drops
}

/**
 * 根据水滴数量获取信任树等级
 * @param {number} drops 水滴数量
 * @returns {Object} 等级信息 { level, name, icon, nextLevelDrops }
 */
function getTreeLevel(drops) {
  let currentLevel = TREE_LEVELS[0]
  let nextLevel = null

  for (let i = 0; i < TREE_LEVELS.length; i++) {
    const level = TREE_LEVELS[i]
    if (drops >= level.minDrops && drops <= level.maxDrops) {
      currentLevel = level
      nextLevel = TREE_LEVELS[i + 1] || null
      break
    }
  }

  // 如果水滴超过最高等级
  if (drops > TREE_LEVELS[TREE_LEVELS.length - 1].maxDrops) {
    currentLevel = TREE_LEVELS[TREE_LEVELS.length - 1]
    nextLevel = null
  }

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    icon: currentLevel.icon,
    minDrops: currentLevel.minDrops,
    maxDrops: currentLevel.maxDrops,
    nextLevelDrops: nextLevel ? nextLevel.minDrops : null,
    nextLevelName: nextLevel ? nextLevel.name : null,
    progress: nextLevel
      ? Math.min(100, Math.round(((drops - currentLevel.minDrops) / (nextLevel.minDrops - currentLevel.minDrops)) * 100))
      : 100
  }
}

module.exports = {
  getTrustTree,
  calculateWaterDrops,
  getTreeLevel
}
