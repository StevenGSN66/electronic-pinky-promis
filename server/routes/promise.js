/**
 * 约定 CRUD 路由模块
 * 处理 /api/promise/* 路径下的请求
 */

const db = require('../services/dbService');
const { requireAuth } = require('../services/authService');

/**
 * 主路由处理器
 * 分发 /api/promise/* 请求
 */
async function promiseRoutes(req, res) {
  const { pathname, method } = req;

  // 所有约定接口都需要登录
  if (!requireAuth(req, res)) return;

  const userId = req.user.id;

  // GET /api/promise/list —— 获取当前用户的约定列表
  if (pathname === '/list' && method === 'GET') {
    // 功能说明：查询当前用户所属家庭的所有约定，支持按状态筛选
    try {
      const { status, familyId } = req.query;
      let promises = db.findMany('promises', p => p.familyId === familyId);

      if (status) {
        promises = promises.filter(p => p.status === status);
      }

      // 按更新时间倒序
      promises.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      res.sendJson(200, { code: 0, message: '查询成功', data: { list: promises } });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // GET /api/promise/detail —— 获取约定详情
  if (pathname === '/detail' && method === 'GET') {
    // 功能说明：根据约定ID查询详情
    try {
      const { id } = req.query;
      const promise = db.findById('promises', id);
      if (!promise) {
        res.sendJson(404, { code: 404, message: '约定不存在' });
        return;
      }
      res.sendJson(200, { code: 0, message: '查询成功', data: promise });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // POST /api/promise/create —— 创建新约定
  if (pathname === '/create' && method === 'POST') {
    // 功能说明：创建一条新的家庭约定
    try {
      const body = await req.parseBody();
      const { title, description, deadline, familyId } = body;

      if (!title || !familyId) {
        res.sendJson(400, { code: 400, message: '缺少标题或家庭ID' });
        return;
      }

      const now = new Date().toISOString();
      const promise = db.insert('promises', {
        title,
        description: description || '',
        familyId,
        creatorId: userId,
        deadline: deadline || null,
        status: 'pending',
        progress: 0,
        createdAt: now,
        updatedAt: now
      });

      res.sendJson(200, { code: 0, message: '创建成功', data: promise });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // PUT /api/promise/update —— 更新约定
  if (pathname === '/update' && method === 'PUT') {
    // 功能说明：更新约定的标题、描述、截止时间、进度、状态等字段
    try {
      const body = await req.parseBody();
      const { id, ...updates } = body;

      if (!id) {
        res.sendJson(400, { code: 400, message: '缺少约定ID' });
        return;
      }

      const existing = db.findById('promises', id);
      if (!existing) {
        res.sendJson(404, { code: 404, message: '约定不存在' });
        return;
      }

      const updated = db.update('promises', id, updates);
      res.sendJson(200, { code: 0, message: '更新成功', data: updated });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // DELETE /api/promise/delete —— 删除约定
  if (pathname === '/delete' && method === 'DELETE') {
    // 功能说明：根据ID删除约定（仅限创建者）
    try {
      const { id } = req.query;
      const existing = db.findById('promises', id);
      if (!existing) {
        res.sendJson(404, { code: 404, message: '约定不存在' });
        return;
      }
      if (existing.creatorId !== userId) {
        res.sendJson(403, { code: 403, message: '无权删除他人创建的约定' });
        return;
      }

      db.remove('promises', id);
      res.sendJson(200, { code: 0, message: '删除成功' });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  res.sendJson(404, { code: 404, message: '接口不存在' });
}

module.exports = promiseRoutes;
