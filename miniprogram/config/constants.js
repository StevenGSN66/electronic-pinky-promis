// config/constants.js - 全局常量定义

/**
 * 约定状态枚举
 */
const PROMISE_STATUS = {
  PENDING: 'pending',     // 待完成
  COMPLETED: 'completed', // 已完成
  REVIEWED: 'reviewed',   // 已回顾
  EXPIRED: 'expired'      // 已过期
}

/**
 * 约定类型
 */
const PROMISE_TYPE = {
  DAILY: 'daily',         // 日常约定
  STUDY: 'study',         // 学习约定
  BEHAVIOR: 'behavior',   // 行为约定
  ACTIVITY: 'activity'    // 活动约定
}

/**
 * 信任树等级定义
 * 根据水滴数量划分等级
 */
const TREE_LEVELS = [
  { level: 1, name: '小种子', minDrops: 0, maxDrops: 9, icon: 'seed' },
  { level: 2, name: '嫩芽', minDrops: 10, maxDrops: 29, icon: 'sprout' },
  { level: 3, name: '小树苗', minDrops: 30, maxDrops: 59, icon: 'sapling' },
  { level: 4, name: '小树', minDrops: 60, maxDrops: 99, icon: 'small-tree' },
  { level: 5, name: '大树', minDrops: 100, maxDrops: 149, icon: 'tree' },
  { level: 6, name: '参天大树', minDrops: 150, maxDrops: 199, icon: 'big-tree' },
  { level: 7, name: '智慧树', minDrops: 200, maxDrops: 299, icon: 'wisdom-tree' },
  { level: 8, name: '永恒之树', minDrops: 300, maxDrops: Infinity, icon: 'eternal-tree' }
]

/**
 * 水滴规则
 * 完成约定获得水滴数量
 */
const WATER_DROP_RULES = {
  DAILY_COMPLETE: 2,      // 完成日常约定
  STUDY_COMPLETE: 3,      // 完成学习约定
  BEHAVIOR_COMPLETE: 2,   // 完成行为约定
  ACTIVITY_COMPLETE: 5,   // 完成活动约定
  FIRST_PROMISE: 10,      // 首次创建约定
  STREAK_BONUS: 5,        // 连续完成 bonus
  REVIEW_BONUS: 1         // 完成回顾 bonus
}

/**
 * 愿望类别
 */
const WISH_CATEGORY = {
  TOY: 'toy',             // 玩具
  FOOD: 'food',           // 美食
  TRAVEL: 'travel',       // 旅行
  ENTERTAINMENT: 'entertainment', // 娱乐
  LEARNING: 'learning',   // 学习
  EXPERIENCE: 'experience', // 体验
  OTHER: 'other'          // 其他
}

/**
 * 订阅消息模板 ID（需要在微信小程序后台申请）
 */
const SUBSCRIBE_TEMPLATES = {
  // 约定提醒模板
  PROMISE_REMINDER: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // 约定到期提醒
  PROMISE_EXPIRE: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // 约定完成通知
  PROMISE_COMPLETE: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // 信任树升级通知
  TREE_LEVEL_UP: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
}

/**
 * 页面路径常量
 */
const PAGES = {
  INDEX: '/pages/index/index',
  LOGIN: '/pages/login/login',
  PROMISE_CREATE: '/pages/promise/create',
  PROMISE_DETAIL: '/pages/promise/detail',
  PROMISE_LIST: '/pages/promise/list',
  PROMISE_REVIEW: '/pages/promise/review',
  TRUST_TREE: '/pages/trust/tree',
  TRUST_LEVEL: '/pages/trust/level',
  WISH_CREATE: '/pages/wish/create',
  WISH_LIST: '/pages/wish/list',
  WISH_PUBLIC: '/pages/wish/public',
  WISH_DETAIL: '/pages/wish/detail',
  PROFILE: '/pages/profile/profile',
  SETTINGS: '/pages/profile/settings',
  NOTIFICATION: '/pages/notification/notification'
}

// 导出所有常量
module.exports = {
  PROMISE_STATUS,
  PROMISE_TYPE,
  TREE_LEVELS,
  WATER_DROP_RULES,
  WISH_CATEGORY,
  SUBSCRIBE_TEMPLATES,
  PAGES
}
