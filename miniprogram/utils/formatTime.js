// utils/formatTime.js - 时间格式化工具

/**
 * 格式化日期时间
 * @param {Date|number|string} date 日期对象、时间戳或日期字符串
 * @param {string} format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的字符串
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()
  const second = d.getSeconds()

  const pad = (n) => n < 10 ? `0${n}` : n

  const map = {
    'YYYY': year,
    'MM': pad(month),
    'DD': pad(day),
    'HH': pad(hour),
    'mm': pad(minute),
    'ss': pad(second),
    'M': month,
    'D': day,
    'H': hour,
    'm': minute,
    's': second
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss|M|D|H|m|s/g, (match) => map[match])
}

/**
 * 格式化为日期（YYYY-MM-DD）
 */
function formatDate(date) {
  return formatTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化为时间（HH:mm）
 */
function formatHourMinute(date) {
  return formatTime(date, 'HH:mm')
}

/**
 * 获取相对时间描述
 * @param {Date|number|string} date 目标时间
 * @returns {string} 如：刚刚、5分钟前、2小时前、昨天、3天前
 */
function getRelativeTime(date) {
  if (!date) return ''

  const target = new Date(date).getTime()
  const now = Date.now()
  const diff = now - target

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }

  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }

  // 小于48小时（昨天）
  if (diff < 48 * 60 * 60 * 1000) {
    return '昨天'
  }

  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }

  // 超过7天，返回日期
  return formatDate(date)
}

/**
 * 计算两个日期之间的天数差
 * @param {Date|number|string} date1
 * @param {Date|number|string} date2
 * @returns {number} 天数差
 */
function getDaysDiff(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diff = Math.abs(d1.getTime() - d2.getTime())
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}

/**
 * 获取今日开始时间戳
 */
function getTodayStart() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.getTime()
}

/**
 * 获取今日结束时间戳
 */
function getTodayEnd() {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  return now.getTime()
}

/**
 * 判断是否是今天
 */
function isToday(date) {
  const d = new Date(date)
  const today = new Date()
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate()
}

module.exports = {
  formatTime,
  formatDate,
  formatHourMinute,
  getRelativeTime,
  getDaysDiff,
  getTodayStart,
  getTodayEnd,
  isToday
}
