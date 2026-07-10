/**
 * 内容审核模块
 * 基于关键词过滤 + AI 审核的内容安全服务
 */

const { buildWishModerationPrompt } = require('../ai/prompts');
const { callAI } = require('../ai/deepseekClient');

// 敏感关键词列表（基础过滤）
const SENSITIVE_KEYWORDS = [
  '暴力', '色情', '赌博', '毒品', '枪', '诈骗',
  '反动', '分裂', '恐怖', '自杀', '杀人',
  '傻逼', '他妈的', '操', '草泥马'
];

// 正则：检测手机号、身份证号等个人信息
const PERSONAL_INFO_PATTERNS = [
  /\d{11}/,           // 手机号
  /\d{17}[\dXx]/,     // 身份证号
  /\d{4}[-.]\d{4}[-.]\d{4}/  // 银行卡号
];

/**
 * 关键词过滤
 * @param {string} content - 待检测内容
 * @returns {object} { isValid, reason }
 */
function keywordFilter(content) {
  if (!content || typeof content !== 'string') {
    return { isValid: false, reason: '内容不能为空' };
  }

  const lowerContent = content.toLowerCase();

  // 检测敏感关键词
  for (const keyword of SENSITIVE_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      return { isValid: false, reason: `包含敏感词汇: ${keyword}` };
    }
  }

  // 检测个人信息泄露
  for (const pattern of PERSONAL_INFO_PATTERNS) {
    if (pattern.test(content)) {
      return { isValid: false, reason: '请勿在内容中泄露个人敏感信息' };
    }
  }

  return { isValid: true, reason: '' };
}

/**
 * AI 内容审核
 * @param {string} content - 待检测内容
 * @returns {Promise<object>} { isValid, reason }
 */
async function aiModerate(content) {
  try {
    const prompt = buildWishModerationPrompt(content);
    const result = await callAI(prompt, { temperature: 0.1, maxTokens: 256 });

    // 尝试解析 JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isValid: parsed.isValid === true,
        reason: parsed.reason || ''
      };
    }

    // 兜底：如果 AI 明确说通过
    if (result.includes('isValid": true')) {
      return { isValid: true, reason: '' };
    }

    return { isValid: false, reason: 'AI 审核未通过' };
  } catch (err) {
    console.error('AI 审核失败:', err.message);
    // AI 审核失败时，回退到仅关键词过滤
    return { isValid: true, reason: '' };
  }
}

/**
 * 完整内容审核流程：先关键词，后 AI
 * @param {string} content
 * @returns {Promise<object>} { isValid, reason }
 */
async function moderate(content) {
  // 第一步：关键词过滤
  const keywordResult = keywordFilter(content);
  if (!keywordResult.isValid) {
    return keywordResult;
  }

  // 第二步：AI 审核（仅对较长内容启用，节省成本）
  if (content.length > 5) {
    const aiResult = await aiModerate(content);
    return aiResult;
  }

  return { isValid: true, reason: '' };
}

/**
 * 批量审核
 * @param {string[]} contents
 * @returns {Promise<object[]>}
 */
async function moderateBatch(contents) {
  const results = [];
  for (const content of contents) {
    results.push(await moderate(content));
  }
  return results;
}

module.exports = {
  keywordFilter,
  aiModerate,
  moderate,
  moderateBatch
};
