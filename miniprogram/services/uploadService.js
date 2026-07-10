// services/uploadService.js - 上传相关接口

const env = require('../config/env')
const userStore = require('../store/userStore')

/**
 * 上传图片到服务器
 * @param {string} filePath 本地图片路径
 * @param {string} type 图片类型：avatar / promise / signature
 * @returns {Promise} 上传结果
 */
function uploadImage(filePath, type = 'image') {
  return new Promise((resolve, reject) => {
    const token = userStore.getToken()

    wx.uploadFile({
      url: `${env.API_BASE_URL}/api/upload/image`,
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      formData: {
        type: type
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0 || data.code === 200) {
              resolve(data)
            } else {
              reject(data)
            }
          } catch (e) {
            reject({ code: -1, message: '解析响应失败' })
          }
        } else {
          reject({ code: res.statusCode, message: '上传失败' })
        }
      },
      fail: (err) => {
        console.error('上传失败:', err)
        reject({ code: -1, message: '上传失败，请检查网络' })
      }
    })
  })
}

/**
 * 上传多张图片
 * @param {Array<string>} filePaths 本地图片路径数组
 * @param {string} type 图片类型
 * @returns {Promise} 上传结果数组
 */
function uploadImages(filePaths, type = 'image') {
  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return Promise.resolve([])
  }

  const uploadTasks = filePaths.map((path) => uploadImage(path, type))
  return Promise.all(uploadTasks)
}

/**
 * 上传签名图片（base64 或文件路径）
 * @param {string} signatureData 签名图片的 base64 数据或临时文件路径
 * @param {string} promiseId 关联的约定ID
 * @returns {Promise}
 */
function uploadSignature(signatureData, promiseId) {
  return new Promise((resolve, reject) => {
    const token = userStore.getToken()

    // 如果是 base64 数据，先保存为临时文件
    if (signatureData.startsWith('data:image')) {
      const fs = wx.getFileSystemManager()
      const filePath = `${wx.env.USER_DATA_PATH}/signature_${Date.now()}.png`
      const base64Data = signatureData.replace(/^data:image\/\w+;base64,/, '')

      try {
        fs.writeFileSync(filePath, base64Data, 'base64')
        doUpload(filePath)
      } catch (err) {
        reject({ code: -1, message: '签名文件处理失败' })
      }
    } else {
      // 已经是临时文件路径
      doUpload(signatureData)
    }

    function doUpload(path) {
      wx.uploadFile({
        url: `${env.API_BASE_URL}/api/upload/signature`,
        filePath: path,
        name: 'file',
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        formData: {
          promiseId: promiseId
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const data = JSON.parse(res.data)
              if (data.code === 0 || data.code === 200) {
                resolve(data)
              } else {
                reject(data)
              }
            } catch (e) {
              reject({ code: -1, message: '解析响应失败' })
            }
          } else {
            reject({ code: res.statusCode, message: '上传失败' })
          }
        },
        fail: (err) => {
          reject({ code: -1, message: '上传失败' })
        }
      })
    }
  })
}

module.exports = {
  uploadImage,
  uploadImages,
  uploadSignature
}
