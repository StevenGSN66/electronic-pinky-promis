/**
 * 服务端入口文件
 * 使用 Node.js 原生 http 模块，无外部框架依赖
 */

const http = require('http');
const url = require('url');

// 导入各路由模块
const authRoutes = require('./routes/auth');
const promiseRoutes = require('./routes/promise');
const aiProxyRoutes = require('./routes/ai-proxy');
const trustRoutes = require('./routes/trust');
const notificationRoutes = require('./routes/notification');
const publicWishesRoutes = require('./routes/publicWishes');

const PORT = process.env.PORT || 3000;

// CORS 响应头配置
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// 解析请求体的辅助函数
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
          resolve(body ? JSON.parse(body) : {});
        } else {
          resolve(body);
        }
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// 统一响应辅助函数
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

// 路由注册表：前缀 -> 路由处理器
const routeRegistry = {
  '/api/auth': authRoutes,
  '/api/promise': promiseRoutes,
  '/api/ai': aiProxyRoutes,
  '/api/trust': trustRoutes,
  '/api/notification': notificationRoutes,
  '/api/public-wishes': publicWishesRoutes
};

// 请求处理器
async function handleRequest(req, res) {
  setCorsHeaders(res);

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 挂载辅助函数到 req/res
  req.query = parsedUrl.query;
  req.parseBody = () => parseBody(req);
  res.sendJson = (statusCode, data) => sendJson(res, statusCode, data);

  try {
    // 查找匹配的路由前缀
    let matchedHandler = null;
    let matchedPrefix = '';

    for (const prefix of Object.keys(routeRegistry)) {
      if (pathname.startsWith(prefix)) {
        matchedPrefix = prefix;
        matchedHandler = routeRegistry[prefix];
        break;
      }
    }

    if (matchedHandler) {
      // 将子路径传给路由处理器
      const subPath = pathname.slice(matchedPrefix.length) || '/';
      req.pathname = subPath;
      await matchedHandler(req, res);
    } else {
      // 根路径健康检查
      if (pathname === '/' || pathname === '/health') {
        res.sendJson(200, { code: 0, message: '服务正常运行', data: { time: new Date().toISOString() } });
        return;
      }
      res.sendJson(404, { code: 404, message: '接口不存在' });
    }
  } catch (err) {
    console.error('请求处理异常:', err);
    res.sendJson(500, { code: 500, message: '服务器内部错误' });
  }
}

// 创建并启动服务器
const server = http.createServer((req, res) => {
  handleRequest(req, res).catch(err => {
    console.error('未捕获异常:', err);
    try {
      res.sendJson(500, { code: 500, message: '服务器内部错误' });
    } catch (e) {
      res.end();
    }
  });
});

server.listen(PORT, () => {
  console.log(`服务器已启动，监听端口: ${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = server;
