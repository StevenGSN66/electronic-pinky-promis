/**
 * 数据库操作封装模块
 * 当前使用内存 + JSON 文件模拟，后续可替换为真实数据库
 */

const fs = require('fs');
const path = require('path');

// 数据文件路径
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// 内存中的数据存储
let memoryDB = {
  users: [],
  families: [],
  promises: [],
  reviews: [],
  trustTrees: [],
  wishes: [],
  publicWishes: [],
  wishContributions: []
};

// 确保数据目录存在
function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// 从 JSON 文件加载数据
function loadFromFile() {
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDB = JSON.parse(data);
      console.log('数据已从文件加载');
    } catch (err) {
      console.error('加载数据文件失败，使用空数据:', err.message);
    }
  }
}

// 保存数据到 JSON 文件
function saveToFile() {
  ensureDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDB, null, 2), 'utf-8');
  } catch (err) {
    console.error('保存数据文件失败:', err.message);
  }
}

// 生成简单唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

// ========== 通用 CRUD 操作 ==========

/**
 * 查询单条记录
 * @param {string} table - 表名
 * @param {string} id - 记录ID
 */
function findById(table, id) {
  if (!memoryDB[table]) return null;
  return memoryDB[table].find(item => item.id === id) || null;
}

/**
 * 条件查询
 * @param {string} table - 表名
 * @param {function} predicate - 过滤函数
 */
function findMany(table, predicate) {
  if (!memoryDB[table]) return [];
  return memoryDB[table].filter(predicate);
}

/**
 * 插入记录
 * @param {string} table - 表名
 * @param {object} data - 数据对象
 */
function insert(table, data) {
  if (!memoryDB[table]) memoryDB[table] = [];
  const record = { ...data, id: data.id || generateId() };
  memoryDB[table].push(record);
  saveToFile();
  return record;
}

/**
 * 更新记录
 * @param {string} table - 表名
 * @param {string} id - 记录ID
 * @param {object} updates - 更新字段
 */
function update(table, id, updates) {
  if (!memoryDB[table]) return null;
  const index = memoryDB[table].findIndex(item => item.id === id);
  if (index === -1) return null;
  memoryDB[table][index] = { ...memoryDB[table][index], ...updates, updatedAt: new Date().toISOString() };
  saveToFile();
  return memoryDB[table][index];
}

/**
 * 删除记录
 * @param {string} table - 表名
 * @param {string} id - 记录ID
 */
function remove(table, id) {
  if (!memoryDB[table]) return false;
  const index = memoryDB[table].findIndex(item => item.id === id);
  if (index === -1) return false;
  memoryDB[table].splice(index, 1);
  saveToFile();
  return true;
}

/**
 * 清空整张表
 * @param {string} table - 表名
 */
function clear(table) {
  if (memoryDB[table]) {
    memoryDB[table] = [];
    saveToFile();
  }
}

// 初始化时加载数据
loadFromFile();

module.exports = {
  memoryDB,
  loadFromFile,
  saveToFile,
  generateId,
  findById,
  findMany,
  insert,
  update,
  remove,
  clear
};
