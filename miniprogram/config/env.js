// config/env.js - 环境配置文件

// 当前环境，可选值：'dev' | 'test' | 'prod'
const CURRENT_ENV = 'dev'

// 各环境的 API 基础地址
const ENV_CONFIG = {
  // 开发环境
  dev: {
    API_BASE_URL: 'http://localhost:3000',
    DEBUG: true
  },
  // 测试环境
  test: {
    API_BASE_URL: 'https://test-api.example.com',
    DEBUG: true
  },
  // 生产环境
  prod: {
    API_BASE_URL: 'https://api.example.com',
    DEBUG: false
  }
}

// 导出当前环境的配置
module.exports = {
  ...ENV_CONFIG[CURRENT_ENV],
  ENV: CURRENT_ENV
}
