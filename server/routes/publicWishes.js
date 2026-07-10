"use strict";

/**
 * 公开愿望榜单路由模块
 * 处理 /api/public-wishes/* 路径下的请求
 */

const db = require('../services/dbService');
const { requireAuth } = require('../services/authService');
const { moderate } = require('../services/contentModerator');
const { generateAnonymousId } = require('../services/anonymizer');

/**
 * 主路由处理器
 * 分发 /api/public-wishes/* 请求
 */
async function publicWishesRoutes(req, res) {
  const { pathname, method } = req;

  // GET /api/public-wishes/list —— 获取热门愿望榜单
  if (pathname === '/list' && method === 'GET') {
    // 功能说明：查询公开愿望榜单，支持按类别筛选
    try {
      const { category, limit = 50 } = req.query;
      let list = db.findMany('publicWishes', () => true);

      if (category && category !== 'all') {
        list = list.filter(item => item.category === category);
      }

      // 按排名升序
      list.sort((a, b) => a.rank - b.rank);

      // 限制数量
      list = list.slice(0, parseInt(limit, 10));

      res.sendJson(200, { code: 0, message: '查询成功', data: { list } });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // GET /api/public-wishes/detail —— 获取公开愿望详情
  if (pathname === '/detail' && method === 'GET') {
    // 功能说明：根据ID查询某条公开愿望的详细信息
    try {
      const { id } = req.query;
      const item = db.findById('publicWishes', id);
      if (!item) {
        res.sendJson(404, { code: 404, message: '愿望不存在' });
        return;
      }
      res.sendJson(200, { code: 0, message: '查询成功', data: item });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // POST /api/public-wishes/join —— 加入公开愿望（匿名）
  if (pathname === '/join' && method === 'POST') {
    // 功能说明：用户匿名加入某条公开愿望，增加许愿人数
    try {
      // 加入需要登录以生成匿名标识
      if (!requireAuth(req, res)) return;
      const userId = req.user.id;

      const body = await req.parseBody();
      const { publicWishId } = body;

      if (!publicWishId) {
        res.sendJson(400, { code: 400, message: '缺少 publicWishId' });
        return;
      }

      const wish = db.findById('publicWishes', publicWishId);
      if (!wish) {
        res.sendJson(404, { code: 404, message: '公开愿望不存在' });
        return;
      }

      // 生成匿名标识，避免直接暴露用户ID
      const anonymousId = generateAnonymousId(userId + publicWishId);

      // 检查是否已加入
      const existing = db.findMany('wishContributions', c =>
        c.publicWishId === publicWishId && c.anonymousId === anonymousId
      );

      if (existing.length > 0) {
        res.sendJson(200, { code: 0, message: '您已加入该愿望', data: { wishCount: wish.wishCount } });
        return;
      }

      // 记录匿名贡献
      db.insert('wishContributions', {
        publicWishId,
        anonymousId,
        contributedAt: new Date().toISOString()
      });

      // 更新许愿人数
      const updated = db.update('publicWishes', publicWishId, {
        wishCount: wish.wishCount + 1
      });

      res.sendJson(200, { code: 0, message: '加入成功', data: { wishCount: updated.wishCount } });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // POST /api/public-wishes/create —— 创建个人愿望（可选择公开）
  if (pathname === '/create' && method === 'POST') {
    // 功能说明：用户创建个人愿望，审核通过后可被聚合到公开榜单
    try {
      if (!requireAuth(req, res)) return;
      const userId = req.user.id;

      const body = await req.parseBody();
      const { content, category, isPublic = false } = body;

      if (!content) {
        res.sendJson(400, { code: 400, message: '愿望内容不能为空' });
        return;
      }

      // 内容审核
      const moderation = await moderate(content);
      if (!moderation.isValid) {
        res.sendJson(400, { code: 400, message: `内容审核未通过: ${moderation.reason}` });
        return;
      }

      const now = new Date().toISOString();
      const wish = db.insert('wishes', {
        userId,
        content,
        category: category || 'other',
        status: 'pending',
        likes: 0,
        isPublic: !!isPublic,
        createdAt: now
      });

      res.sendJson(200, { code: 0, message: '创建成功', data: wish });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  res.sendJson(404, { code: 404, message: '接口不存在' });
}

module.exports = publicWishesRoutes;
