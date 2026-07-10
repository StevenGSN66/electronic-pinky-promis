/**
 * AI 代理路由模块
 * 处理 /api/ai/* 路径下的请求，统一调用 DeepSeek API
 */

const { callAI } = require('../ai/deepseekClient');
const { buildPromiseParsePrompt, buildReviewPrompt, buildReminderPrompt, buildTrustTreePrompt } = require('../ai/prompts');
const { requireAuth } = require('../services/authService');
const db = require('../services/dbService');

/**
 * 主路由处理器
 * 分发 /api/ai/* 请求
 */
async function aiProxyRoutes(req, res) {
  const { pathname, method } = req;

  // 所有 AI 接口需要登录
  if (!requireAuth(req, res)) return;

  // POST /api/ai/parse-promise —— AI 解析自然语言约定
  if (pathname === '/parse-promise' && method === 'POST') {
    // 功能说明：将用户自然语言输入解析为结构化的约定字段
    try {
      const body = await req.parseBody();
      const { input } = body;

      if (!input) {
        res.sendJson(400, { code: 400, message: '缺少 input 参数' });
        return;
      }

      const prompt = buildPromiseParsePrompt(input);
      const result = await callAI(prompt, { temperature: 0.3, maxTokens: 512 });

      // 尝试提取 JSON
      let parsed = null;
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // 非 JSON 则原样返回
      }

      res.sendJson(200, {
        code: 0,
        message: '解析成功',
        data: { raw: result, parsed }
      });
    } catch (err) {
      console.error('AI 解析约定失败:', err.message);
      res.sendJson(500, { code: 500, message: `AI 解析失败: ${err.message}` });
    }
    return;
  }

  // POST /api/ai/review —— AI 复盘总结
  if (pathname === '/review' && method === 'POST') {
    // 功能说明：对完成的约定生成复盘总结
    try {
      const body = await req.parseBody();
      const { promiseId, completionNotes, familyContext } = body;

      if (!promiseId) {
        res.sendJson(400, { code: 400, message: '缺少 promiseId' });
        return;
      }

      const promise = db.findById('promises', promiseId);
      if (!promise) {
        res.sendJson(404, { code: 404, message: '约定不存在' });
        return;
      }

      const prompt = buildReviewPrompt(
        promise.title,
        promise.description,
        completionNotes || '',
        familyContext || ''
      );
      const result = await callAI(prompt, { temperature: 0.7, maxTokens: 800 });

      res.sendJson(200, { code: 0, message: '复盘生成成功', data: { summary: result } });
    } catch (err) {
      console.error('AI 复盘失败:', err.message);
      res.sendJson(500, { code: 500, message: `AI 复盘失败: ${err.message}` });
    }
    return;
  }

  // POST /api/ai/reminder —— AI 生成提醒消息
  if (pathname === '/reminder' && method === 'POST') {
    // 功能说明：根据约定进度和截止时间生成温馨提醒
    try {
      const body = await req.parseBody();
      const { promiseId } = body;

      const promise = db.findById('promises', promiseId);
      if (!promise) {
        res.sendJson(404, { code: 404, message: '约定不存在' });
        return;
      }

      const prompt = buildReminderPrompt(promise.title, promise.deadline, promise.progress);
      const result = await callAI(prompt, { temperature: 0.6, maxTokens: 200 });

      res.sendJson(200, { code: 0, message: '提醒生成成功', data: { message: result.trim() } });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  // POST /api/ai/trust-tree-feedback —— AI 信任树成长反馈
  if (pathname === '/trust-tree-feedback' && method === 'POST') {
    // 功能说明：根据信任树状态生成温暖的成长反馈
    try {
      const body = await req.parseBody();
      const { familyId } = body;

      const tree = db.findMany('trustTrees', t => t.familyId === familyId)[0];
      if (!tree) {
        res.sendJson(404, { code: 404, message: '信任树不存在' });
        return;
      }

      // 模拟最近事件（实际应从约定完成记录中提取）
      const recentEvents = ['完成了一次周末约会约定', '互相送了礼物'];
      const prompt = buildTrustTreePrompt(tree.stage, tree.totalDrops, recentEvents);
      const result = await callAI(prompt, { temperature: 0.8, maxTokens: 300 });

      res.sendJson(200, { code: 0, message: '反馈生成成功', data: { feedback: result.trim() } });
    } catch (err) {
      res.sendJson(500, { code: 500, message: err.message });
    }
    return;
  }

  res.sendJson(404, { code: 404, message: '接口不存在' });
}

module.exports = aiProxyRoutes;
