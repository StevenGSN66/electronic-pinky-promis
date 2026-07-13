/**
 * 信任星球 - AI 代理服务器
 * 提供前端 AI 能力，API Key 仅存于服务端环境变量
 *
 * 启动: DEEPSEEK_API_KEY=sk-xxx node server.js
 * 默认端口: 3000
 */

const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

// ============================================================
// AI 提示词与规则
// ============================================================

const SYSTEM_PROMPT = `你是"信任星球"应用的 AI 助手"雁小约"，专门帮助 6-12 岁儿童和家长整理口头约定。

## 核心原则
1. 语气温暖、简洁、儿童可理解
2. 不使用"失败、惩罚、信用差"等负面词汇
3. 不判断谁对谁错，保持中立
4. 约定要具体、可验证、双方都能理解

## 你的任务
从用户输入的自然语言中提取结构化约定信息。

## 输出要求
必须输出严格的 JSON 格式，不要输出任何其他内容：
{
  "task": "约定事项（一句话描述，不超过50字）",
  "deadline": "截止日期（YYYY-MM-DD格式，无法确定则留空字符串）",
  "standard": "完成标准（怎样算完成？具体可验证的标准，不超过30字）",
  "reward": "鼓励方式（完成后的正向激励，不超过20字，没有则留空字符串）",
  "reminder": "提醒建议（何时提醒？一句话，不超过20字）",
  "clarityScore": 80,
  "suggestion": "给小朋友的温馨建议（一句话，不超过30字）"
}

## 字段说明
- task: 提炼核心约定事项。如果是条件式约定（"如果...就..."），将条件和奖励都写进 task
- deadline: 从文本推断截止日期。如果提到"期末考试"等无明确日期的事件，推算一个合理日期。如果完全无法确定，返回空字符串
- standard: 推断或建议一个可验证的完成标准。如果文本中有明确的数值标准就用它，否则根据约定内容建议一个合理的
- reward: 提取或推断鼓励方式。没有提到则返回空字符串
- clarityScore: 0-100，评估约定清晰度。有明确时间+标准=80+，缺少时间或标准=60-79，含糊不清=40-59
- suggestion: 根据约定内容给出一条温馨建议，鼓励孩子

## 日期推断规则
- "今天" → 当天日期
- "明天"/"后天" → 对应日期
- "本周X"/"下周X" → 计算对应星期日期
- "X天后" → 今天+X天
- "X月X日" → 对应日期
- "暑假"/"寒假" → 推算到最近的假期起止
- "期末" → 推算到期末考试时间（通常6月底或1月底）
- 没有时间信息 → 空字符串

## 示例

输入: "爸爸答应周六下午两点带年糕买一个冰激凌"
输出: {"task":"爸爸带年糕买一个冰激凌","deadline":"2026-07-18","standard":"在周六下午两点前一起出门","reward":"买一个冰激凌","reminder":"周六上午提醒","clarityScore":85,"suggestion":"可以提前想好想要什么口味的冰激凌哦~"}

输入: "如果年年的期末考试三个科目超过295，爸爸带我去环球"
输出: {"task":"年年末三科总分超过295分，爸爸带年年去环球影城","deadline":"2026-07-31","standard":"提供期末考试成绩单，三科总分≥295分","reward":"去环球影城游玩一天","reminder":"出成绩当天提醒","clarityScore":75,"suggestion":"把目标拆成每科的目标分数，一步步来更有信心~"}

输入: "我每天要练钢琴30分钟"
输出: {"task":"每天练钢琴30分钟","deadline":"","standard":"连续坚持，每次不少于30分钟","reward":"","reminder":"每天固定时间提醒","clarityScore":70,"suggestion":"选择一个固定的时间练习，更容易养成习惯~"}`;

// ============================================================
// 复盘提示词
// ============================================================

const REVIEW_SYSTEM_PROMPT = `你是"信任星球"应用的 AI 助手"雁小约"，正在帮助一个家庭温和地复盘一个未完成的约定。

## 核心原则
1. 语气温暖、中立，不判断谁对谁错
2. 不使用"失败、惩罚、信用差、没守信"等负面词汇
3. 帮助双方找到共同点，而不是追究责任
4. 建议要具体、可操作

## 输出要求
严格 JSON 格式：
{
  "commonPoints": "双方共同的认识（1-2句话）",
  "suggestions": ["建议1", "建议2"],
  "encouragement": "一句鼓励的话"
}`;

// ============================================================
// 工具函数
// ============================================================

function parseJSON(text) {
  // 尝试直接解析
  try { return JSON.parse(text); } catch(e) {}
  
  // 尝试提取 JSON 块
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    try { return JSON.parse(match[1]); } catch(e) {}
  }
  
  // 尝试找到第一个 { 和最后一个 }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.substring(start, end + 1)); } catch(e) {}
  }
  
  return null;
}

function deepseekRequest(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const url = new URL(`${DEEPSEEK_BASE_URL}/v1/chat/completions`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`DeepSeek API 返回 ${res.statusCode}: ${data.substring(0, 200)}`));
          return;
        }
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch(e) {
          reject(new Error('解析 DeepSeek 响应失败'));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('请求超时')); });
    req.write(body);
    req.end();
  });
}

// ============================================================
// 路由处理
// ============================================================

async function handleParseAgreement(reqBody) {
  const { text } = reqBody;
  
  if (!text || typeof text !== 'string' || text.trim().length < 2) {
    return { error: '请输入约定内容（至少2个字）' };
  }
  
  if (!DEEPSEEK_API_KEY) {
    return { error: '服务端未配置 DEEPSEEK_API_KEY', fallback: true };
  }
  
  try {
    const content = await deepseekRequest([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text.trim() },
    ]);
    
    const result = parseJSON(content);
    if (!result) {
      return { error: 'AI 返回格式异常，请重试或手动填写', fallback: true };
    }
    
    // 白名单 + 类型检查
    const allowed = ['task', 'deadline', 'standard', 'reward', 'reminder', 'clarityScore', 'suggestion'];
    const cleaned = {};
    for (const key of allowed) {
      if (result[key] !== undefined && result[key] !== null) {
        cleaned[key] = String(result[key]);
      }
    }
    
    // task 必须有
    if (!cleaned.task) {
      cleaned.task = text.trim();
    }
    
    // deadline 格式校验
    if (cleaned.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(cleaned.deadline)) {
      cleaned.deadline = '';
    }
    
    // clarityScore 范围校验
    const score = parseInt(cleaned.clarityScore);
    cleaned.clarityScore = String(isNaN(score) ? 70 : Math.max(0, Math.min(100, score)));
    
    return cleaned;
  } catch(e) {
    console.error('[parse-agreement] AI 请求失败:', e.message);
    return { error: 'AI 服务暂时不可用', fallback: true };
  }
}

async function handleReviewAgreement(reqBody) {
  const { task, childReason, parentObservation, initiator, receiver } = reqBody;
  
  if (!DEEPSEEK_API_KEY) {
    return { fallback: true };
  }
  
  const userMsg = `约定事项：${task || '未提供'}
发起方（${initiator || '小朋友'}）的原因：${childReason || '未填写'}
接受方（${receiver || '家长'}）的观察：${parentObservation || '未填写'}

请给出温和的复盘总结和建议。`;
  
  try {
    const content = await deepseekRequest([
      { role: 'system', content: REVIEW_SYSTEM_PROMPT },
      { role: 'user', content: userMsg },
    ]);
    
    const result = parseJSON(content);
    if (!result) return { fallback: true };
    
    return {
      commonPoints: String(result.commonPoints || '双方都在认真思考这次约定。'),
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.map(String).slice(0, 2) : ['可以试着把约定拆成更小的步骤'],
      encouragement: String(result.encouragement || '认真的反思本身就是一种成长。'),
    };
  } catch(e) {
    console.error('[review] AI 请求失败:', e.message);
    return { fallback: true };
  }
}

// ============================================================
// HTTP 服务器
// ============================================================

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // 健康检查
  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      ai: !!DEEPSEEK_API_KEY,
      timestamp: new Date().toISOString(),
    }));
    return;
  }
  
  // 解析约定
  if (url.pathname === '/api/deepseek/parse-agreement' && req.method === 'POST') {
    const body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve({}); }
      });
    });
    
    const result = await handleParseAgreement(body);
    const statusCode = result.error && !result.fallback ? 400 : 200;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }
  
  // AI 复盘
  if (url.pathname === '/api/deepseek/review' && req.method === 'POST') {
    const body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve({}); }
      });
    });
    
    const result = await handleReviewAgreement(body);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }
  
  // 静态文件服务（开发用）
  if (req.method === 'GET') {
    let filePath = url.pathname === '/' ? '/electronic-pinky-promise.html' : url.pathname;
    const fs = require('fs');
    const path = require('path');
    
    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath);
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.mp4': 'video/mp4',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
    };
    
    try {
      const content = fs.readFileSync(fullPath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
      return;
    } catch(e) {
      // 404 交给下面的处理
    }
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(``);
  console.log(`  🌍 信任星球 AI 代理服务器已启动`);
  console.log(`  📍 地址: http://localhost:${PORT}`);
  console.log(`  🤖 AI: ${DEEPSEEK_API_KEY ? '已配置 DeepSeek API Key' : '⚠️  未配置 DEEPSEEK_API_KEY，将回退本地解析'}`);
  console.log(`  🔧 API 端点:`);
  console.log(`     POST /api/deepseek/parse-agreement  解析约定`);
  console.log(`     POST /api/deepseek/review           AI复盘`);
  console.log(`     GET  /api/health                     健康检查`);
  console.log(``);
});