/**
 * DeepSeek API 调用封装模块
 * 负责与 DeepSeek 大模型 API 通信
 */

const https = require('https');

// 从环境变量读取 API Key，绝不要写死在代码中
const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_HOST = 'api.deepseek.com';
const API_PATH = '/chat/completions';

/**
 * 调用 DeepSeek Chat Completion API
 * @param {string} prompt - 发送给模型的 prompt
 * @param {object} options - 可选参数
 * @returns {Promise<string>} 模型的回复文本
 */
function chatCompletion(prompt, options = {}) {
  return new Promise((resolve, reject) => {
    if (!API_KEY) {
      reject(new Error('未配置 DEEPSEEK_API_KEY 环境变量'));
      return;
    }

    const requestBody = JSON.stringify({
      model: options.model || 'deepseek-chat',
      messages: [
        { role: 'system', content: options.systemPrompt || '你是一个有帮助的助手。' },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 1024,
      stream: false
    });

    const reqOptions = {
      hostname: API_HOST,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(requestBody)
      },
      timeout: options.timeout || 30000
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
            resolve(parsed.choices[0].message.content);
          } else if (parsed.error) {
            reject(new Error(`DeepSeek API 错误: ${parsed.error.message}`));
          } else {
            reject(new Error('DeepSeek API 返回格式异常'));
          }
        } catch (err) {
          reject(new Error(`解析响应失败: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`请求失败: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * 通用 AI 调用封装，带重试机制
 */
async function callAI(prompt, options = {}) {
  const maxRetries = options.maxRetries || 2;
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await chatCompletion(prompt, options);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`AI 调用第 ${i + 1} 次失败:`, err.message);
      if (i < maxRetries) {
        // 简单退避
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }

  throw lastError;
}

module.exports = {
  chatCompletion,
  callAI
};
