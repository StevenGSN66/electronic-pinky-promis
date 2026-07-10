// utils/eventBus.js - 全局事件通信（发布订阅模式）

/**
 * 简单的事件总线，用于跨页面/组件通信
 * 使用示例：
 *   eventBus.on('userInfoUpdated', (data) => { console.log(data) })
 *   eventBus.emit('userInfoUpdated', { name: '小明' })
 *   eventBus.off('userInfoUpdated')
 */
class EventBus {
  constructor() {
    // 存储所有事件和对应的回调函数列表
    this.events = {}
  }

  /**
   * 监听事件
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(callback)
  }

  /**
   * 触发事件
   * @param {string} eventName 事件名称
   * @param {*} data 传递的数据
   */
  emit(eventName, data) {
    const callbacks = this.events[eventName]
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (err) {
          console.error(`事件 ${eventName} 回调执行出错:`, err)
        }
      })
    }
  }

  /**
   * 取消监听事件
   * @param {string} eventName 事件名称
   * @param {Function} callback 要取消的回调（不传则取消该事件所有回调）
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return

    if (callback) {
      // 取消指定的回调
      this.events[eventName] = this.events[eventName].filter(
        (cb) => cb !== callback
      )
    } else {
      // 取消该事件的所有回调
      delete this.events[eventName]
    }
  }

  /**
   * 只监听一次事件，触发后自动取消
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   */
  once(eventName, callback) {
    const wrapper = (data) => {
      callback(data)
      this.off(eventName, wrapper)
    }
    this.on(eventName, wrapper)
  }

  /**
   * 清除所有事件
   */
  clear() {
    this.events = {}
  }
}

// 导出单例实例
module.exports = new EventBus()
