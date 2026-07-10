/**
 * 脱敏工具模块
 * 用于对用户数据进行脱敏处理，保护隐私
 */

const crypto = require('crypto');

// 匿名化盐值（应从环境变量读取，增强安全性）
const ANON_SALT = process.env.ANON_SALT || 'yanyue-default-salt';

/**
 * 生成匿名标识
 * 对原始用户标识进行不可逆哈希
 * @param {string} rawId - 原始ID（如 openid）
 * @returns {string} 匿名ID
 */
function generateAnonymousId(rawId) {
  return crypto
    .createHmac('sha256', ANON_SALT)
    .update(rawId)
    .digest('hex')
    .slice(0, 16);
}

/**
 * 对手机号脱敏
 * @param {string} phone
 * @returns {string}
 */
function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(7);
}

/**
 * 对邮箱脱敏
 * @param {string} email
 * @returns {string}
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  const maskedName = name.length > 2 ? name[0] + '***' + name.slice(-1) : '***';
  return `${maskedName}@${domain}`;
}

/**
 * 对姓名脱敏
 * @param {string} name
 * @returns {string}
 */
function maskName(name) {
  if (!name || name.length === 0) return '*';
  if (name.length === 1) return '*';
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name.slice(-1);
}

/**
 * 对身份证号脱敏
 * @param {string} idCard
 * @returns {string}
 */
function maskIdCard(idCard) {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 4) + '**********' + idCard.slice(-4);
}

/**
 * 对通用文本进行部分脱敏
 * 保留首尾字符，中间替换为 *
 * @param {string} text
 * @param {number} keepHead 保留头部字符数
 * @param {number} keepTail 保留尾部字符数
 * @returns {string}
 */
function maskText(text, keepHead = 1, keepTail = 1) {
  if (!text || text.length <= keepHead + keepTail) {
    return '*'.repeat(text ? text.length : 1);
  }
  const head = text.slice(0, keepHead);
  const tail = text.slice(-keepTail);
  const stars = '*'.repeat(Math.min(text.length - keepHead - keepTail, 8));
  return head + stars + tail;
}

/**
 * 对对象中的敏感字段批量脱敏
 * @param {object} data
 * @param {string[]} fields 需要脱敏的字段名
 * @returns {object}
 */
function anonymizeObject(data, fields = []) {
  if (!data || typeof data !== 'object') return data;

  const result = { ...data };
  const maskMap = {
    phone: maskPhone,
    mobile: maskPhone,
    email: maskEmail,
    name: maskName,
    realName: maskName,
    idCard: maskIdCard,
    idNumber: maskIdCard,
    openid: generateAnonymousId
  };

  for (const field of fields) {
    if (result[field] !== undefined) {
      const maskFn = maskMap[field] || maskText;
      result[field] = maskFn(result[field]);
    }
  }

  return result;
}

module.exports = {
  generateAnonymousId,
  maskPhone,
  maskEmail,
  maskName,
  maskIdCard,
  maskText,
  anonymizeObject
};
