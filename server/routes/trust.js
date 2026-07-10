/**
 * 信任树路由模块
 * 处理 /api/trust/* 路径下的请求
 */

const db = require('../services/dbService');
const { requireAuth } = require('../services/authService');

/**
 * 计算信任树阶段
 * @param {number} drops 水滴总数
 * @returns {string} 阶段名称
 */
function calcStage(drops) {
  if (drops >= 200) return 'fruit';
  if (drops >= 100) return 'flower';
  if (drops >= 50) return 'leaf';
  if (drops >= 10) return 'sapling';
  return 'seed';
}

/**
 * 计算信任等级
 * @param {number} drops 水滴总数
 * @returns {number} 等级 1-10
 */
function calcLevel(drops) {
  return Math.min(10, Math.floor(drops / 20) + 1);
}

/**
 * 主路由处理器
 * 分发 /api/trust/* 请求
 */
async function trustRoutes(req, res) {
  const { pathname, method } = req;

  if (!requireAuth(req, res)) return;
  const userId = req.user.id;

  // GET /api/trust/info —— 获取信任树信息
  if (pathname === '/info' && method === 'GET') {
    // 功能说明：根据家庭ID查询信任树的当前状态
    try {
      const { familyId } = req.query;
      if (!familyId) {
        res.sendJson(400, { code: 400, message: '缺少 familyId' });
        return;
      }

      let tree = db.findMany('trustTrees', t => t.familyId === familyId)[0];
      if (!tree) {
        // 自动创建初始信任树
        const now = new Date().toISOString();
        tree = db.insert('trustTrees', {
          familyId,
          totalDrops: 0,
          stage: 'seed',
          level: 1,
          updatedAt: now
        });
      }

      res.sendJson(200, { code: 0, message: '查询成功', data: tree });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // POST /api/trust/add-drops —— 增加信任水滴
  if (pathname === '/add-drops' && method === 'POST') {
    // 功能说明：为家庭的信任树增加水滴，自动重新计算阶段和等级
    try {
      const body = await req.parseBody();
      const { familyId, amount, reason } = body;

      if (!familyId || !amount || amount <= 0) {
        res.sendJson(400, { code: 400, message: '参数错误' });
        return;
      }

      let tree = db.findMany('trustTrees', t => t.familyId === familyId)[0];
      const now = new Date().toISOString();

      if (!tree) {
        tree = db.insert('trustTrees', {
          familyId,
          totalDrops: 0,
          stage: 'seed',
          level: 1,
          updatedAt: now
        });
      }

      const newDrops = tree.totalDrops + amount;
      const newStage = calcStage(newDrops);
      const newLevel = calcLevel(newDrops);

      const updated = db.update('trustTrees', tree.id, {
        totalDrops: newDrops,
        stage: newStage,
        level: newLevel,
        updatedAt: now
      });

      res.sendJson(200, {
        code: 0,
        message: '水滴增加成功',
        data: {
          tree: updated,
          added: amount,
          reason: reason || ''
        }
      });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // GET /api/trust/history —— 获取水滴变动历史（占位）
  if (pathname === '/history' && method === 'GET') {
    // 功能说明：查询信任水滴的增减历史记录
    try {
      const { familyId } = req.query;
      // 当前为简化实现，返回空列表占位
      res.sendJson(200, { code: 0, message: '查询成功', data: { list: [] } });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  res.sendJson(404, { code: 404, message: '接口不存在' });
}

module.exports = trustRoutes;
