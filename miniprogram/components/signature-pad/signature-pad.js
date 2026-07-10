// components/signature-pad/signature-pad.js
// 电子签名/拉钩组件：支持手写签名（Canvas）和点击确认两种模式

Component({
  properties: {
    // 签名模式：'canvas' 手写签名 / 'tap' 点击确认 / 'both' 两者都支持
    mode: {
      type: String,
      value: 'both'
    },
    // 提示文字
    tipText: {
      type: String,
      value: '请在下方区域签名或点击确认'
    },
    // 画布宽度（rpx）
    canvasWidth: {
      type: Number,
      value: 600
    },
    // 画布高度（rpx）
    canvasHeight: {
      type: Number,
      value: 300
    },
    // 画笔颜色
    penColor: {
      type: String,
      value: '#7CD4A8'
    },
    // 画笔粗细
    penSize: {
      type: Number,
      value: 4
    }
  },

  data: {
    isDrawing: false,
    hasDrawn: false,
    canvasContext: null,
    // 转换后的实际像素尺寸
    pixelWidth: 300,
    pixelHeight: 150
  },

  lifetimes: {
    attached() {
      this.initCanvas()
    }
  },

  methods: {
    // 初始化画布
    initCanvas() {
      const sysInfo = wx.getSystemInfoSync()
      const ratio = sysInfo.windowWidth / 750
      this.setData({
        pixelWidth: this.properties.canvasWidth * ratio,
        pixelHeight: this.properties.canvasHeight * ratio
      })

      const query = this.createSelectorQuery()
      query.select('#signature-canvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0]) return
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')

          // 适配高清屏
          const dpr = sysInfo.pixelRatio
          canvas.width = this.data.pixelWidth * dpr
          canvas.height = this.data.pixelHeight * dpr
          ctx.scale(dpr, dpr)

          // 设置画笔样式
          ctx.strokeStyle = this.properties.penColor
          ctx.lineWidth = this.properties.penSize
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'

          this.setData({ canvasContext: ctx })

          // 画引导线
          this.drawGuideLine(ctx)
        })
    },

    // 画虚线引导
    drawGuideLine(ctx) {
      ctx.save()
      ctx.strokeStyle = '#E0E0E0'
      ctx.lineWidth = 1
      ctx.setLineDash([8, 8])
      ctx.beginPath()
      ctx.moveTo(20, this.data.pixelHeight * 0.7)
      ctx.lineTo(this.data.pixelWidth - 20, this.data.pixelHeight * 0.7)
      ctx.stroke()
      ctx.restore()
    },

    // 触摸开始
    onTouchStart(e) {
      if (this.properties.mode === 'tap') return

      const ctx = this.data.canvasContext
      if (!ctx) return

      const touch = e.touches[0]
      const pos = this.getCanvasPosition(touch)

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)

      this.setData({ isDrawing: true })
    },

    // 触摸移动
    onTouchMove(e) {
      if (!this.data.isDrawing) return

      const ctx = this.data.canvasContext
      const touch = e.touches[0]
      const pos = this.getCanvasPosition(touch)

      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()

      this.setData({ hasDrawn: true })
    },

    // 触摸结束
    onTouchEnd() {
      this.setData({ isDrawing: false })
    },

    // 获取画布内坐标
    getCanvasPosition(touch) {
      // 简单处理：假设画布占据组件大部分宽度
      // 实际项目中可通过 createSelectorQuery 获取精确位置
      const sysInfo = wx.getSystemInfoSync()
      const ratio = sysInfo.windowWidth / 750
      const padding = 32 * ratio
      return {
        x: touch.x - padding,
        y: touch.y
      }
    },

    // 清空画布
    onClear() {
      const ctx = this.data.canvasContext
      if (!ctx) return

      ctx.clearRect(0, 0, this.data.pixelWidth, this.data.pixelHeight)
      this.drawGuideLine(ctx)
      this.setData({ hasDrawn: false })
    },

    // 完成手写签名
    onComplete() {
      if (!this.data.hasDrawn) {
        wx.showToast({ title: '请先签名', icon: 'none' })
        return
      }

      const query = this.createSelectorQuery()
      query.select('#signature-canvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0]) return
          const canvas = res[0].node

          // 导出为图片
          wx.canvasToTempFilePath({
            canvas,
            success: (fileRes) => {
              this.triggerEvent('complete', {
                type: 'canvas',
                imageData: fileRes.tempFilePath,
                timestamp: new Date().toISOString()
              })
            },
            fail: (err) => {
              console.error('导出签名失败:', err)
              wx.showToast({ title: '导出失败', icon: 'none' })
            }
          })
        })
    },

    // 点击确认（简化版电子拉钩）
    onTapConfirm() {
      this.triggerEvent('tapConfirm', {
        type: 'tap',
        timestamp: new Date().toISOString()
      })
    }
  }
})
