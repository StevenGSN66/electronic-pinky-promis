"use strict";

/**
 * 订阅消息路由模块
 * 处理 /api/notification/* 路径下的请求
 */

const { requireAuth } = require('../services/authService');

/**
 * 主路由处理器
 * 分发 /api/notification/* 请求
 */
async function notificationRoutes(req, res) {
  const { pathname, method } = req;

  if (!requireAuth(req, res)) return;

  // POST /api/notification/subscribe —— 订阅消息
  if (pathname === '/subscribe' && method === 'POST') {
    // 功能说明：接收用户订阅消息的请求，保存订阅状态
    try {
      const body = await req.parseBody();
      const { templateId, page } = body;

      if (!templateId) {
        res.sendJson(400, { code: 400, message: '缺少 templateId' });
        return;
      }

      // 实际场景：调用微信 subscribeMessage 接口获取一次性订阅授权
      // 此处保存订阅记录占位
      res.sendJson(200, {
        code: 0,
        message: '订阅成功',
        data: { templateId, subscribedAt: new Date().toISOString() }
      });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // POST /api/notification/send —— 发送订阅消息（管理端或系统触发）
  if (pathname === '/send' && method === 'POST') {
    // 功能说明：向指定用户发送微信小程序订阅消息
    try {
      const body = await req.parseBody();
      const { toUserId, templateId, page, data } = body;

      if (!toUserId || !templateId) {
        res.sendJson(400, { code: 400, message: '缺少必要参数' });
        return;
      }

      // 实际场景：调用微信服务端接口发送订阅消息
      // 此处返回模拟成功占位
      res.sendJson(200, {
        code: 0,
        message: '消息已发送',
        data: { messageId: `msg_${Date.now()}`, toUserId, templateId }
      });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // GET /api/notification/templates —— 获取可用消息模板列表
  if (pathname === '/templates' && method === 'GET') {
    // 功能说明：返回系统支持的订阅消息模板列表
    try {
      const templates = [
        { id: 'PROMISE_REMINDER', name: '约定提醒', desc: '约定即将到期时提醒用户' },
        { id: 'REVIEW_NOTIFY', name: '复盘通知', desc: '约定完成后提醒复盘' },
        { id: 'TRUST_TREE_GROW', name: '信任树成长', desc: '信任树升级时通知' }
      ];
      res.sendJson(200, { code: 0, message: '查询成功', data: { list: templates } });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  res.sendJson(404, { code: 404, message: '接口不存在' });
}

module.exports = notificationRoutes;
