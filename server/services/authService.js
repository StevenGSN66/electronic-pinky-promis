/**
 * 认证服务模块
 * 负责 token 校验、session 管理
 */

const crypto = require('crypto');
const db = require('./dbService');

// 内存中的 session 缓存（生产环境应使用 Redis）
const sessionCache = new Map();

// Session 有效期（毫秒）
const SESSION_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000; // 7天

/**
 * 根据 openid 创建或更新用户
 * @param {string} openid - 微信 openid
 * @param {object} userInfo - 用户信息
 * @returns {object} 用户对象
 */
function createOrUpdateUser(openid, userInfo = {}) {
  let user = db.findMany('users', u => u.openid === openid)[0];
  const now = new Date().toISOString();

  if (user) {
    user = db.update('users', user.id, {
      ...userInfo,
      updatedAt: now
    });
  } else {
    user = db.insert('users', {
      openid,
      unionid: userInfo.unionid || null,
      nickname: userInfo.nickname || '',
      avatarUrl: userInfo.avatarUrl || '',
      createdAt: now,
      updatedAt: now
    });
  }

  return user;
}

/**
 * 创建 session token
 * @param {string} userId - 用户ID
 * @returns {string} token
 */
function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_EXPIRE_MS;

  sessionCache.set(token, {
    userId,
    expiresAt
  });

  return token;
}

/**
 * 校验 token 并返回用户信息
 * @param {string} token - 请求携带的 token
 * @returns {object|null} 用户对象或 null
 */
function verifyToken(token) {
  if (!token) return null;

  const session = sessionCache.get(token);
  if (!session) return null;

  // 检查是否过期
  if (Date.now() > session.expiresAt) {
    sessionCache.delete(token);
    return null;
  }

  const user = db.findById('users', session.userId);
  return user || null;
}

/**
 * 从请求头中提取 token
 * @param {object} req - http 请求对象
 * @returns {string|null}
 */
function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // 也支持从 query 参数中获取（小程序场景）
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

/**
 * 登出：销毁 session
 * @param {string} token
 */
function destroySession(token) {
  sessionCache.delete(token);
}

/**
 * 中间件：校验登录状态
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
function requireAuth(req, res, next) {
  const token = extractToken(req);
  const user = verifyToken(token);

  if (!user) {
    res.sendJson(401, { code: 401, message: '未登录或登录已过期' });
    return false;
  }

  req.user = user;
  return true;
}

module.exports = {
  createOrUpdateUser,
  createSession,
  verifyToken,
  extractToken,
  destroySession,
  requireAuth
};
