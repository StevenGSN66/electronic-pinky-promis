/**
 * 电子拉钩：亲子信任约定小程序 — 本地开发服务器
 *
 * 功能：
 * 1. 静态文件服务（托管当前目录）
 * 2. DeepSeek API 代理接口（API Key 由前端传入，不存储在服务端）
 *
 * 启动方式：
 *   node server.mjs
 *
 * 访问：
 *   http://127.0.0.1:4173/
 */

import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const PORT = 4173;

// 服务端保存的 DeepSeek API Key（不暴露给前端）
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

// MIME 类型映射
const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

/* ============================================
   工具函数
   ============================================ */

/** 读取请求体 JSON */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(new Error('请求体 JSON 解析失败'));
      }
    });
    req.on('error', reject);
  });
}

/** 返回 JSON 响应 */
function jsonRes(res, statusCode, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

/** 读取请求体原始文本（用于流式响应） */
function readBodyRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

/* ============================================
   DeepSeek API 代理接口
   ============================================ */

async function handleDeepSeekParse(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return jsonRes(res, 400, { mode: 'error', message: e.message });
  }

  const { baseURL, model, userText, initiator, receiver, currentDate } = body;

  // 使用服务端 API Key
  const apiKey = DEEPSEEK_API_KEY;
  if (!apiKey) {
    return jsonRes(res, 400, { mode: 'error', message: '服务端未配置 DEEPSEEK_API_KEY，请在环境变量中设置' });
  }
  if (!userText || !userText.trim()) {
    return jsonRes(res, 400, { mode: 'error', message: '缺少约定文本 (userText)' });
  }

  const url = `${(baseURL || 'https://api.deepseek.com/v1').replace(/\/+$/, '')}/chat/completions`;
  const today = currentDate || new Date().toISOString().slice(0, 10);
  const useModel = model || 'deepseek-chat';

  // 构建 system prompt
  const systemPrompt = `你是一个亲子约定助手。你的任务是从用户的描述中提取约定关键要素。
当前日期：${today}。发起人：${initiator || '未指定'}。接受人：${receiver || '未指定'}。

你需要提取以下约定要素：
- task: 约定事项（简洁描述）
- deadline: 截止时间（日期格式 YYYY-MM-DD，或时间段描述）
- standard: 完成标准（如何才算完成）
- reward: 奖励/鼓励方式
- reminder: 提醒建议
- clarityScore: 清晰度评分（0-100，越高表示约定越清晰完整）
- suggestion: 改进建议

输出严格的 JSON 格式：
{
  "needMoreInfo": boolean,
  "question": "如果信息不全，用温和亲子语气的追问内容；信息齐全则为空字符串",
  "parsed": {
    "task": "...",
    "deadline": "...",
    "standard": "...",
    "reward": "...",
    "reminder": "...",
    "clarityScore": 0-100,
    "suggestion": "..."
  }
}

注意：
1. 如果用户描述足够清晰完整，needMoreInfo 设为 false
2. 如果缺少关键信息（如时间、具体事项），needMoreInfo 设为 true，question 中用温柔的语气追问
3. clarityScore 根据信息的完整性和清晰度评分
4. deadline 尽量推断具体日期，如果用户说的是"周六"，请根据当前日期计算`;

  // 调用 DeepSeek API
  try {
    const apiBody = JSON.stringify({
      model: useModel,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `用户说：${userText}` }
      ]
    });

    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: apiBody
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      let errDetail = errText;
      try { errDetail = JSON.parse(errText).error?.message || errText; } catch (_) {}
      return jsonRes(res, apiRes.status, {
        mode: 'error',
        message: `DeepSeek API 错误 (${apiRes.status}): ${errDetail}`
      });
    }

    const apiData = await apiRes.json();
    const content = apiData.choices?.[0]?.message?.content || '';

    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      return jsonRes(res, 200, {
        mode: 'deepseek',
        model: useModel,
        rawText: content,
        result: {
          needMoreInfo: true,
          question: 'AI 返回的数据格式异常，请重试',
          parsed: { task: userText, deadline: '', standard: '', reward: '', reminder: '', clarityScore: 0, suggestion: '' }
        }
      });
    }

    return jsonRes(res, 200, {
      mode: 'deepseek',
      model: useModel,
      rawText: content,
      result
    });

  } catch (e) {
    return jsonRes(res, 502, {
      mode: 'error',
      message: `请求 DeepSeek API 失败: ${e.message}`
    });
  }
}

/* ============================================
   DeepSeek 流式代理接口
   ============================================ */

async function handleDeepSeekStream(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return jsonRes(res, 400, { mode: 'error', message: e.message });
  }

  const { baseURL, model, userText, initiator, receiver, currentDate } = body;

  const apiKey = DEEPSEEK_API_KEY;
  if (!apiKey) {
    return jsonRes(res, 400, { mode: 'error', message: '服务端未配置 DEEPSEEK_API_KEY' });
  }
  if (!userText || !userText.trim()) {
    return jsonRes(res, 400, { mode: 'error', message: '缺少约定文本 (userText)' });
  }

  const url = `${(baseURL || 'https://api.deepseek.com/v1').replace(/\/+$/, '')}/chat/completions`;
  const today = currentDate || new Date().toISOString().slice(0, 10);
  const useModel = model || 'deepseek-chat';

  const systemPrompt = `你是一个亲子约定助手。当前日期：${today}。发起人：${initiator || '未指定'}。接受人：${receiver || '未指定'}。
请从用户描述中提取约定要素，输出 JSON 格式：
{"needMoreInfo":boolean,"question":"","parsed":{"task":"","deadline":"","standard":"","reward":"","reminder":"","clarityScore":0,"suggestion":""}}`;

  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: useModel,
        temperature: 0.3,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `用户说：${userText}` }
        ]
      })
    });

    if (!apiRes.ok) {
      res.write(`data: ${JSON.stringify({ mode: 'error', message: `DeepSeek API 错误 (${apiRes.status})` })}\n\n`);
      res.end();
      return;
    }

    const reader = apiRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // 直接转发 SSE 数据
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          res.write(line + '\n\n');
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    if (!res.headersSent) {
      jsonRes(res, 502, { mode: 'error', message: `流式请求失败: ${e.message}` });
    } else {
      res.write(`data: ${JSON.stringify({ mode: 'error', message: e.message })}\n\n`);
      res.end();
    }
  }
}

/* ============================================
   静态文件服务
   ============================================ */

async function serveStatic(req, res) {
  let filePath = req.url.split('?')[0];
  // 默认首页
  if (filePath === '/' || filePath === '') {
    filePath = '/ai-projects.html';
  }
  // 安全检查：禁止路径遍历
  if (filePath.includes('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // 确定文件扩展名
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  try {
    const content = await readFile('.' + filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (e) {
    if (e.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 - 页面未找到</h1><p><a href="/">返回首页</a></p>');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>500 - 服务器错误</h1><p>${e.message}</p>`);
    }
  }
}

/* ============================================
   请求路由
   ============================================ */

async function handleRequest(req, res) {
  const { method, url } = req;

  // CORS 预检请求
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // API 路由
  if (url === '/api/deepseek/parse-agreement' && method === 'POST') {
    return handleDeepSeekParse(req, res);
  }

  if (url === '/api/deepseek/stream' && method === 'POST') {
    return handleDeepSeekStream(req, res);
  }

  // 静态文件
  return serveStatic(req, res);
}

/* ============================================
   启动服务器
   ============================================ */

const server = createServer(handleRequest);

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  🤝 电子拉钩 — 本地开发服务器');
  console.log(`  🌐 http://127.0.0.1:${PORT}/`);
  console.log(`  📂 当前目录: ${process.cwd()}`);
  console.log(`  🤖 DeepSeek API: POST /api/deepseek/parse-agreement`);
  console.log(`  🌊 DeepSeek 流式: POST /api/deepseek/stream`);
  console.log('');
  console.log('  按 Ctrl+C 停止服务器');
  console.log('');
});
