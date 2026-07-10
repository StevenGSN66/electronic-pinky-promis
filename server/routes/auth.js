/**
 * 微信登录路由模块
 * 处理 /api/auth/* 路径下的请求
 */

const https = require('https');
const querystring = require('querystring');
const { createOrUpdateUser, createSession } = require('../services/authService');

// 微信小程序配置（从环境变量读取）
const WX_APPID = process.env.WX_APPID || '';
const WX_SECRET = process.env.WX_SECRET || '';

/**
 * 调用微信 jscode2session 接口
 * @param {string} code - 小程序登录临时凭证
 * @returns {Promise<object>} { openid, session_key, unionid }
 */
function wxJsCode2Session(code) {
  return new Promise((resolve, reject) => {
    const params = querystring.stringify({
      appid: WX_APPID,
      secret: WX_SECRET,
      js_code: code,
      grant_type: 'authorization_code'
    });

    const options = {
      hostname: 'api.weixin.qq.com',
      path: `/sns/jscode2session?${params}`,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.errcode) {
            reject(new Error(`微信接口错误: ${parsed.errmsg} (${parsed.errcode})`));
          } else {
            resolve(parsed);
          }
        } catch (err) {
          reject(new Error('解析微信响应失败'));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')); });
    req.end();
  });
}

/**
 * 主路由处理器
 * 分发 /api/auth/* 请求
 */
async function authRoutes(req, res) {
  const { pathname, method } = req;

  // POST /api/auth/login —— 微信登录，接收 code 换取 session
  if (pathname === '/login' && method === 'POST') {
    // 功能说明：接收小程序 code，调用微信 jscode2session 获取 openid，创建本地用户和 session
    try {
      const body = await req.parseBody();
      const { code, userInfo } = body;

      if (!code) {
        res.sendJson(400, { code: 400, message: '缺少 code 参数' });
        return;
      }

      if (!WX_APPID || !WX_SECRET) {
        res.sendJson(500, { code: 500, message: '服务端未配置微信 AppID/Secret' });
        return;
      }

      const wxSession = await wxJsCode2Session(code);
      const { openid, unionid } = wxSession;

      // 创建或更新用户
      const user = createOrUpdateUser(openid, {
        unionid,
        nickname: userInfo?.nickname || '',
        avatarUrl: userInfo?.avatarUrl || ''
      });

      // 创建 session token
      const token = createSession(user.id);

      res.sendJson(200, {
        code: 0,
        message: '登录成功',
        data: {
          token,
          userId: user.id,
          expiresIn: 604800 // 7天，单位秒
        }
      });
    } catch (err) {
      console.error('登录失败:', err.message);
      res.sendJson(500, { code: 500, message: `登录失败: ${err.message}` });
    }
    return;
  }

  // 其他路径不支持
  res.sendJson(404, { code: 404, message: '接口不存在' });
}

module.exports = authRoutes;
