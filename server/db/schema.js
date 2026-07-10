/**
 * 数据表定义模块
 * 定义核心业务实体的字段结构（内存/JSON 模拟时使用）
 */

// 用户表
const UserSchema = {
  id: { type: 'string', required: true, description: '用户唯一ID' },
  openid: { type: 'string', required: true, description: '微信openid' },
  unionid: { type: 'string', required: false, description: '微信unionid' },
  nickname: { type: 'string', required: false, description: '昵称' },
  avatarUrl: { type: 'string', required: false, description: '头像URL' },
  createdAt: { type: 'string', required: true, description: '创建时间' },
  updatedAt: { type: 'string', required: true, description: '更新时间' }
};

// 家庭表
const FamilySchema = {
  id: { type: 'string', required: true, description: '家庭ID' },
  name: { type: 'string', required: true, description: '家庭名称' },
  creatorId: { type: 'string', required: true, description: '创建者用户ID' },
  memberIds: { type: 'array', required: true, description: '成员用户ID列表' },
  inviteCode: { type: 'string', required: true, description: '邀请码' },
  createdAt: { type: 'string', required: true, description: '创建时间' }
};

// 约定表
const PromiseSchema = {
  id: { type: 'string', required: true, description: '约定ID' },
  title: { type: 'string', required: true, description: '约定标题' },
  description: { type: 'string', required: false, description: '约定描述' },
  familyId: { type: 'string', required: true, description: '所属家庭ID' },
  creatorId: { type: 'string', required: true, description: '创建者ID' },
  deadline: { type: 'string', required: false, description: '截止时间' },
  status: { type: 'string', required: true, description: '状态: pending/ongoing/completed/overdue' },
  progress: { type: 'number', required: true, description: '进度 0-100' },
  createdAt: { type: 'string', required: true, description: '创建时间' },
  updatedAt: { type: 'string', required: true, description: '更新时间' }
};

// 复盘表
const ReviewSchema = {
  id: { type: 'string', required: true, description: '复盘ID' },
  promiseId: { type: 'string', required: true, description: '关联约定ID' },
  content: { type: 'string', required: true, description: '复盘内容' },
  aiSummary: { type: 'string', required: false, description: 'AI总结' },
  creatorId: { type: 'string', required: true, description: '创建者ID' },
  createdAt: { type: 'string', required: true, description: '创建时间' }
};

// 信任树表
const TrustTreeSchema = {
  id: { type: 'string', required: true, description: '信任树ID' },
  familyId: { type: 'string', required: true, description: '家庭ID' },
  totalDrops: { type: 'number', required: true, description: '水滴总数' },
  stage: { type: 'string', required: true, description: '阶段 seed/sapling/leaf/flower/fruit' },
  level: { type: 'number', required: true, description: '信任等级 1-10' },
  updatedAt: { type: 'string', required: true, description: '更新时间' }
};

// 愿望表（个人）
const WishSchema = {
  id: { type: 'string', required: true, description: '愿望ID' },
  userId: { type: 'string', required: true, description: '用户ID' },
  content: { type: 'string', required: true, description: '愿望内容' },
  category: { type: 'string', required: true, description: '类别' },
  status: { type: 'string', required: true, description: '状态' },
  likes: { type: 'number', required: true, description: '点赞数' },
  isPublic: { type: 'boolean', required: true, description: '是否公开' },
  createdAt: { type: 'string', required: true, description: '创建时间' }
};

// 公开愿望榜单表
const PublicWishSchema = {
  id: { type: 'string', required: true, description: '公开愿望ID' },
  content: { type: 'string', required: true, description: '愿望内容' },
  category: { type: 'string', required: true, description: '类别' },
  wishCount: { type: 'number', required: true, description: '许愿人数' },
  rank: { type: 'number', required: true, description: '排名' },
  trend: { type: 'string', required: true, description: '趋势 up/down/flat' },
  updatedAt: { type: 'string', required: true, description: '更新时间' }
};

// 愿望贡献表（匿名聚合用）
const WishContributionSchema = {
  id: { type: 'string', required: true, description: '贡献记录ID' },
  publicWishId: { type: 'string', required: true, description: '公开愿望ID' },
  anonymousId: { type: 'string', required: true, description: '匿名用户标识' },
  contributedAt: { type: 'string', required: true, description: '贡献时间' }
};

// 签名/确认记录表（电子拉钩仪式感）
const SignatureSchema = {
  id: { type: 'string', required: true, description: '签名记录ID' },
  promiseId: { type: 'string', required: true, description: '关联约定ID' },
  userId: { type: 'string', required: true, description: '签名用户ID' },
  type: { type: 'string', required: true, description: '类型: canvas手写 / tap点击确认' },
  imageData: { type: 'string', required: false, description: '手写签名图片URL或base64' },
  confirmedAt: { type: 'string', required: true, description: '确认时间' }
};

// 履约打卡记录表
const CheckinSchema = {
  id: { type: 'string', required: true, description: '打卡记录ID' },
  promiseId: { type: 'string', required: true, description: '关联约定ID' },
  operatorId: { type: 'string', required: true, description: '操作人ID' },
  note: { type: 'string', required: false, description: '备注' },
  imageUrl: { type: 'string', required: false, description: '打卡照片URL' },
  createdAt: { type: 'string', required: true, description: '打卡时间' }
};

// 信任星球表（个人星球，持有多种树）
const TrustPlanetSchema = {
  id: { type: 'string', required: true, description: '星球ID' },
  ownerId: { type: 'string', required: true, description: '拥有者用户ID' },
  name: { type: 'string', required: true, description: '星球名称' },
  activeTreeTypes: { type: 'array', required: true, description: '已激活的树类型列表' },
  lockedTreeTypes: { type: 'array', required: true, description: '锁定的树类型列表' },
  equippedDecorations: { type: 'array', required: true, description: '已装备装扮ID列表' },
  createdAt: { type: 'string', required: true, description: '创建时间' }
};

// 装扮/解锁物表
const DecorationSchema = {
  id: { type: 'string', required: true, description: '装扮ID' },
  name: { type: 'string', required: true, description: '装扮名称' },
  type: { type: 'string', required: true, description: '类型: tree_house/ground/sky/decoration' },
  unlockRule: { type: 'object', required: true, description: '解锁规则 {treeType, requiredDrops}' },
  status: { type: 'string', required: true, description: '状态: locked/unlocked/equipped' }
};

module.exports = {
  UserSchema,
  FamilySchema,
  PromiseSchema,
  ReviewSchema,
  TrustTreeSchema,
  TrustPlanetSchema,
  WishSchema,
  PublicWishSchema,
  WishContributionSchema,
  SignatureSchema,
  CheckinSchema,
  DecorationSchema
};
