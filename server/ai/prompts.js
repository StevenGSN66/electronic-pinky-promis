/**
 * DeepSeek Prompt 模板模块
 * 提供约定解析、复盘、提醒等场景的 prompt
 */

// 约定解析 prompt：将用户自然语言转化为结构化约定
function buildPromiseParsePrompt(userInput) {
  return `你是一位家庭约定助手，请从用户的输入中提取约定的结构化信息。

用户输入："""${userInput}"""

请按以下 JSON 格式输出，不要包含其他内容：
{
  "title": "约定的简短标题",
  "description": "约定的详细描述",
  "deadline": "截止时间（ISO格式或null）",
  "participants": ["参与者角色或名称"],
  "reminderTime": "提醒时间（可选）"
}

注意事项：
- 如果用户没有提到截止时间，deadline 设为 null
- 提取所有相关参与者
- title 必须简洁明了，不超过20字`;
}

// 复盘 prompt：对完成的约定进行复盘总结
function buildReviewPrompt(promiseTitle, promiseDescription, completionNotes, familyContext = '') {
  return `你是一位家庭关系顾问，请帮助这对伴侣/家庭成员对完成的约定进行复盘。

约定标题：${promiseTitle}
约定内容：${promiseDescription}
完成情况：${completionNotes}
${familyContext ? `家庭背景：${familyContext}` : ''}

请从以下几个维度给出复盘总结：
1. 完成质量评价
2. 双方的付出与贡献
3. 可以改进的地方
4. 对增进信任的具体建议

输出格式要求：
- 使用温暖、鼓励的语气
- 分点列出，每点不超过100字
- 整体总结控制在300字以内`;
}

// 提醒 prompt：生成约定提醒消息
function buildReminderPrompt(promiseTitle, deadline, progress) {
  return `你是一位温柔的约定提醒助手，请生成一条提醒消息，语气亲切自然。

约定：${promiseTitle}
截止时间：${deadline || '未设定'}
当前进度：${progress}%

要求：
- 语气像朋友一样亲切
- 如果快到期了，适当增加紧迫感
- 如果进度落后，给予鼓励
- 消息控制在60字以内
- 直接输出消息内容，不要带引号`;
}

// 信任树成长提示 prompt
function buildTrustTreePrompt(stage, totalDrops, recentEvents) {
  return `你是一位家庭信任树园丁，请根据信任树的成长情况给用户一段温暖的反馈。

当前阶段：${stage}
水滴总数：${totalDrops}
最近事件：${recentEvents.join('；')}

要求：
- 用拟人化的方式描述信任树的成长
- 结合最近的具体事件
- 给予继续浇灌信任的建议
- 控制在100字以内`;
}

// 愿望审核 prompt：检测不当内容
function buildWishModerationPrompt(wishContent) {
  return `请判断以下愿望内容是否包含违规或不当信息（如暴力、色情、仇恨言论、个人信息泄露等）。

愿望内容："""${wishContent}"""

请仅输出以下 JSON 格式：
{
  "isValid": true/false,
  "reason": "如果不通过，说明原因；通过则为空字符串"
}`;
}

module.exports = {
  buildPromiseParsePrompt,
  buildReviewPrompt,
  buildReminderPrompt,
  buildTrustTreePrompt,
  buildWishModerationPrompt
};
