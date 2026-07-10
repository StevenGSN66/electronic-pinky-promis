// utils/validate.js - 表单校验工具

/**
 * 判断是否为空（null、undefined、空字符串、空数组、空对象）
 * @param {*} value
 * @returns {boolean}
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 校验是否为手机号
 * @param {string} phone
 * @returns {boolean}
 */
function isPhone(phone) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 校验是否为邮箱
 * @param {string} email
 * @returns {boolean}
 */
function isEmail(email) {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

/**
 * 校验是否为有效日期
 * @param {string} date
 * @returns {boolean}
 */
function isDate(date) {
  const d = new Date(date)
  return !isNaN(d.getTime())
}

/**
 * 校验字符串长度是否在范围内
 * @param {string} str
 * @param {number} min 最小长度
 * @param {number} max 最大长度
 * @returns {boolean}
 */
function isLength(str, min, max) {
  if (typeof str !== 'string') return false
  const len = str.trim().length
  return len >= min && len <= max
}

/**
 * 校验是否为数字
 * @param {*} value
 * @returns {boolean}
 */
function isNumber(value) {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 校验是否为正整数
 * @param {*} value
 * @returns {boolean}
 */
function isPositiveInt(value) {
  const reg = /^[1-9]\d*$/
  return reg.test(String(value))
}

/**
 * 校验身份证号码（简单校验18位）
 * @param {string} idCard
 * @returns {boolean}
 */
function isIdCard(idCard) {
  const reg = /^\d{17}[\dXx]$/
  return reg.test(idCard)
}

/**
 * 执行表单校验规则
 * @param {Object} data 表单数据对象
 * @param {Array} rules 校验规则数组
 *   每项格式：{ field: '字段名', label: '显示名称', required: true, type: 'phone', min: 2, max: 20 }
 * @returns {Object} { valid: boolean, message: string }
 */
function validate(data, rules) {
  for (const rule of rules) {
    const value = data[rule.field]
    const label = rule.label || rule.field

    // 必填校验
    if (rule.required && isEmpty(value)) {
      return { valid: false, message: `${label}不能为空` }
    }

    // 如果有值，继续其他校验
    if (!isEmpty(value)) {
      // 类型校验
      if (rule.type) {
        switch (rule.type) {
          case 'phone':
            if (!isPhone(value)) {
              return { valid: false, message: `${label}格式不正确` }
            }
            break
          case 'email':
            if (!isEmail(value)) {
              return { valid: false, message: `${label}格式不正确` }
            }
            break
          case 'date':
            if (!isDate(value)) {
              return { valid: false, message: `${label}格式不正确` }
            }
            break
          case 'number':
            if (!isNumber(value)) {
              return { valid: false, message: `${label}必须是数字` }
            }
            break
          case 'positiveInt':
            if (!isPositiveInt(value)) {
              return { valid: false, message: `${label}必须是正整数` }
            }
            break
          case 'idCard':
            if (!isIdCard(value)) {
              return { valid: false, message: `${label}格式不正确` }
            }
            break
        }
      }

      // 长度校验
      if (rule.min || rule.max) {
        const min = rule.min || 0
        const max = rule.max || Infinity
        if (!isLength(String(value), min, max)) {
          if (min && max === Infinity) {
            return { valid: false, message: `${label}至少${min}个字符` }
          }
          if (min === 0 && max) {
            return { valid: false, message: `${label}最多${max}个字符` }
          }
          return { valid: false, message: `${label}长度需在${min}-${max}个字符之间` }
        }
      }

      // 自定义校验函数
      if (rule.validator && typeof rule.validator === 'function') {
        const result = rule.validator(value, data)
        if (result !== true) {
          return { valid: false, message: result || `${label}校验不通过` }
        }
      }
    }
  }

  return { valid: true, message: '' }
}

module.exports = {
  isEmpty,
  isPhone,
  isEmail,
  isDate,
  isLength,
  isNumber,
  isPositiveInt,
  isIdCard,
  validate
}
