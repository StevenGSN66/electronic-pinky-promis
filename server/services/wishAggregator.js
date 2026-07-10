/**
 * 愿望聚合算法模块
 * 负责定时将个人愿望聚合成公开榜单
 */

const db = require('./dbService');

// 相似度阈值（编辑距离比例）
const SIMILARITY_THRESHOLD = 0.7;

/**
 * 计算两个字符串的相似度（基于 Levenshtein 距离）
 * @param {string} a
 * @param {string} b
 * @returns {number} 0-1 之间的相似度
 */
function similarity(a, b) {
  const len = Math.max(a.length, b.length);
  if (len === 0) return 1;
  const distance = levenshteinDistance(a, b);
  return 1 - distance / len;
}

/**
 * Levenshtein 编辑距离
 */
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * 将个人愿望聚合成公开愿望
 * 算法：按类别分组，相似愿望合并计数
 */
function aggregateWishes() {
  const now = new Date().toISOString();

  // 获取所有公开的个人愿望
  const publicWishes = db.findMany('wishes', w => w.isPublic === true);

  // 按类别分组
  const categoryGroups = {};
  publicWishes.forEach(wish => {
    const cat = wish.category || 'other';
    if (!categoryGroups[cat]) categoryGroups[cat] = [];
    categoryGroups[cat].push(wish);
  });

  const aggregated = [];

  // 对每个类别进行聚类
  for (const [category, wishes] of Object.entries(categoryGroups)) {
    const clusters = [];

    wishes.forEach(wish => {
      let merged = false;
      for (const cluster of clusters) {
        if (similarity(cluster.content, wish.content) >= SIMILARITY_THRESHOLD) {
          cluster.count += 1;
          cluster.wishIds.push(wish.id);
          merged = true;
          break;
        }
      }
      if (!merged) {
        clusters.push({
          content: wish.content,
          count: 1,
          category,
          wishIds: [wish.id]
        });
      }
    });

    aggregated.push(...clusters);
  }

  // 按许愿人数排序
  aggregated.sort((a, b) => b.count - a.count);

  // 生成排名数据
  const ranked = aggregated.map((item, index) => {
    const prevRank = db.findMany('publicWishes', p => p.content === item.content)[0];
    let trend = 'flat';
    if (prevRank) {
      if (index < prevRank.rank - 1) trend = 'up';
      else if (index > prevRank.rank - 1) trend = 'down';
    }

    return {
      id: prevRank ? prevRank.id : db.generateId(),
      content: item.content,
      category: item.category,
      wishCount: item.count,
      rank: index + 1,
      trend,
      updatedAt: now
    };
  });

  // 更新公开愿望表
  db.clear('publicWishes');
  ranked.forEach(item => db.insert('publicWishes', item));

  console.log(`[${now}] 愿望聚合完成，共 ${ranked.length} 条公开愿望`);
  return ranked;
}

/**
 * 启动定时聚合任务
 * @param {number} intervalMinutes - 间隔分钟数，默认 30
 */
function startAggregationJob(intervalMinutes = 30) {
  const intervalMs = intervalMinutes * 60 * 1000;

  // 立即执行一次
  aggregateWishes();

  // 定时执行
  setInterval(() => {
    try {
      aggregateWishes();
    } catch (err) {
      console.error('愿望聚合任务失败:', err);
    }
  }, intervalMs);

  console.log(`愿望聚合定时任务已启动，间隔: ${intervalMinutes} 分钟`);
}

module.exports = {
  aggregateWishes,
  startAggregationJob,
  similarity
};
