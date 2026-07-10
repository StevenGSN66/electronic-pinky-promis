// behaviors/form-validation.js - 表单校验 behavior
// 混入到页面或组件中，提供统一的表单校验能力

const validateUtil = require('../utils/validate')

module.exports = Behavior({
  data: {
    // 表单错误信息
    formErrors: {}
  },

  methods: {
    /**
     * 校验表单数据
     * @param {Object} formData 表单数据对象
     * @param {Array} rules 校验规则数组
     * @returns {boolean} 是否通过校验
     */
    validateForm(formData, rules) {
      const result = validateUtil.validate(formData, rules)

      if (!result.valid) {
        // 将错误信息按字段存储
        const errors = {}
        // 找到第一个失败的规则对应的字段
        for (const rule of rules) {
          const check = validateUtil.validate(formData, [rule])
          if (!check.valid) {
            errors[rule.field] = check.message
            // 只记录第一个错误字段
            break
          }
        }
        this.setData({ formErrors: errors })
        wx.showToast({
          title: result.message,
          icon: 'none',
          duration: 2000
        })
        return false
      }

      // 校验通过，清空错误
      this.setData({ formErrors: {} })
      return true
    },

    /**
     * 清除指定字段的错误信息
     * @param {string} field 字段名
     */
    clearFieldError(field) {
      const errors = { ...this.data.formErrors }
      delete errors[field]
      this.setData({ formErrors: errors })
    },

    /**
     * 清除所有表单错误
     */
    clearAllErrors() {
      this.setData({ formErrors: {} })
    },

    /**
     * 获取指定字段的错误信息
     * @param {string} field 字段名
     * @returns {string} 错误信息
     */
    getFieldError(field) {
      return this.data.formErrors[field] || ''
    },

    /**
     * 判断指定字段是否有错误
     * @param {string} field 字段名
     * @returns {boolean}
     */
    hasFieldError(field) {
      return !!this.data.formErrors[field]
    }
  }
})
