# 电子拉钩 / 信任星球 — 软件架构文档

> 文档日期：2026-07-08
> 项目定位：面向亲子家庭的 AI 约定小程序
> 版本：v0.1（工程骨架阶段）

---

## 一、项目概述

"电子拉钩"是一个面向亲子家庭的 AI 辅助约定工具。核心理念是：把父母和孩子之间的口头承诺记录下来，由 AI 自动整理成清晰的结构化约定，通过电子拉钩的方式确认，到期前提醒，完成后给信任树浇水；如果未完成，则由 AI 进行温和复盘，帮助双方重新约定。

后续升级为"信任星球"，增加"愿望岛"公开榜单和"我的星球"个人成长页。

---

## 二、项目目录总览

```
/workspace/
│
├── electronic-pinky-promise.html       # HTML Demo（比赛演示版，保留）
├── electronic-pinky-promise-backup.html
├── server.mjs                           # 原有 Node.js 服务（保留）
│
├── miniprogram/                         # 微信小程序（新建，125 文件）
│   ├── app.js / app.json / app.wxss / sitemap.json
│   ├── pages/           ← 15 个页面（60 文件）
│   ├── components/      ← 12 个组件（48 文件）
│   ├── behaviors/       ← 2 个 behavior
│   ├── services/        ← 8 个服务模块
│   ├── utils/           ← 4 个工具
│   ├── config/          ← 2 个配置
│   ├── store/           ← 1 个状态管理
│   └── assets/          ← 图片/图标资源目录
│
├── server/                              # 后端服务（新建，15 文件）
│   ├── app.js
│   ├── routes/          ← 6 个路由
│   ├── services/        ← 5 个服务
│   ├── ai/              ← 2 个 AI 模块
│   └── db/              ← 1 个数据定义
│
└── docs/
    └── architecture.md  # 本文档
```

---

## 三、整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     微信小程序前端                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  pages  │  │components│  │services │  │  utils  │        │
│  │ 15页面  │  │ 12组件  │  │  8模块  │  │  4工具  │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                         │                                   │
│                   ┌─────┴─────┐                             │
│                   │   store   │  ← 全局状态                  │
│                   │ userStore │                             │
│                   └─────┬─────┘                             │
│                         │                                   │
│                   wx.request                               │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼───────────────────────────────────┐
│                     后端服务层                               │
│                         │                                   │
│                   ┌─────┴─────┐                             │
│                   │  app.js   │  ← 入口 + 路由分发           │
│                   └─────┬─────┘                             │
│         ┌───────┬───────┼───────┬───────┐                  │
│         ▼       ▼       ▼       ▼       ▼                  │
│      auth   promise  ai-proxy  trust  notification        │
│      登录    约定      AI代理   信任树   消息推送            │
│         │       │       │       │       │                  │
│         └───────┴───────┴───────┴───────┘                  │
│                         │                                   │
│              ┌──────────┼──────────┐                       │
│              ▼          ▼          ▼                       │
│         dbService   authService  wishAggregator            │
│         数据库      身份校验      愿望聚合                   │
│                                              ┌─────────────┤
│                                              ▼             │
│                                        deepseekClient.js   │
│                                        (DeepSeek API)      │
└────────────────────────────────────────────────────────────┘
```

---

## 四、HTML Demo（现有原型）

### 4.1 定位
`electronic-pinky-promise.html` 是比赛演示版本，用于功能验证和评审展示。不删除、不修改，作为独立版本保留。

### 4.2 已实现功能
| 功能 | 状态 |
|------|------|
| 首次引导（头像选择） | 已实现 |
| 约定创建（发起人/接受人选择） | 已实现 |
| DeepSeek AI 解析 | 已实现（前端直接调用） |
| 语音输入（Web Speech API） | 已实现 |
| 电子拉钩签名 | 已实现（Canvas） |
| 约定卡片展示 | 已实现 |
| 本地存储（localStorage） | 已实现 |

### 4.3 与小程序的关系
HTML Demo 是**独立原型**，小程序是**正式工程**。小程序复用 Demo 的产品逻辑和视觉设计，但代码完全重写为微信小程序规范。

---

## 五、微信小程序架构

### 5.1 页面层（pages/）

共 15 个页面，覆盖完整业务闭环：

| 页面路径 | 功能 | 优先级 |
|---------|------|--------|
| `pages/onboarding/` | 新人引导：雁小约介绍产品理念，引导添加昵称/头像/家庭成员 | P1 |
| `pages/auth/` | 登录授权：wx.login 获取 code，换取后端 token | P1 |
| `pages/index/` | 首页/信任星球：信任树可视化、今日待完成约定、守约动态 | P1 |
| `pages/promise-create/` | 创建约定：语音/文字输入 → AI解析 → 电子拉钩签名 | P1 |
| `pages/promise-detail/` | 约定详情：展示内容、签名凭证、操作（完成/延期/复盘） | P1 |
| `pages/promise-list/` | 约定列表：按状态筛选（进行中/已完成/已逾期/已复盘） | P2 |
| `pages/checkin/` | 打卡履约：双方确认、上传照片/备注、增加信任水滴 | P1 |
| `pages/review/` | 未履约复盘：双方填原因 → AI建议 → 选择后续动作 | P2 |
| `pages/ai-chat/` | AI沟通助手：雁小约对话气泡，亲子沟通建议 | P3 |
| `pages/user/` | 我的页面：资料管理、家庭成员、勋章、守约率 | P2 |
| `pages/wish-island/` | 愿望岛：热门愿望榜单（脱敏聚合）、分类筛选、广告位 | P2 |
| `pages/wish-detail/` | 愿望详情：单个热门愿望、脱敏用户列表、我也想许愿 | P2 |
| `pages/my-wishes/` | 我家愿望墙：家庭私密愿望，可转化为约定 | P2 |
| `pages/my-planet/` | 我的星球：守约率/信任水滴/信任树等级/最近动态 | P2 |

### 5.2 组件层（components/）

| 组件 | 职责 |
|------|------|
| `mascot-guide` | 雁小约引导气泡：形象展示 + 提示文字 + 点击下一条 |
| `trust-tree` | 信任树可视化：根据水滴数展示不同阶段的树（种子→树苗→绿叶→开花→果实） |
| `water-drop` | 信任水滴动画：水滴数量变化时的动画效果 |
| `promise-card` | 约定卡片：标题、截止时间、状态标签、进度条 |
| `chat-bubble` | AI对话气泡：区分用户消息和 AI 消息，AI 消息带雁小约头像 |
| `empty-state` | 空状态占位：空图标 + 提示文字 + 操作按钮 |
| `nav-bar` | 自定义导航栏：返回按钮、标题、右侧操作 |
| `wish-card` | 愿望卡片：愿望内容、类别、点赞数、状态 |
| `wish-rank-card` | 热门排名卡片：排名数字、许愿人数、趋势箭头 |
| `wish-category-tab` | 分类标签栏：横向滚动，支持切换分类 |
| `planet-ring` | 星球环形进度：信任等级可视化（环形进度条） |
| `ad-banner` | 广告位组件：预留广告展示位，带"广告"标签 |

### 5.3 服务层（services/）

所有服务模块统一使用 `utils/request.js` 发起 HTTP 请求。

| 服务 | 职责 | 关键接口 |
|------|------|---------|
| `authService.js` | 微信登录、获取用户信息、退出登录 | `wx.login` → `/api/auth/login` |
| `promiseService.js` | 约定增删改查 | `createPromise`、`getPromiseList`、`getPromiseDetail`、`completePromise`、`reviewPromise` |
| `aiService.js` | AI 解析/复盘/提醒（只请求自己后端） | `parsePromise`、`generateReview`、`generateReminder` |
| `trustService.js` | 信任树/水滴/等级 | `getTrustTree`、`calculateWaterDrops`、`getTreeLevel` |
| `notificationService.js` | 订阅消息 | `requestSubscribeMessage`、发送订阅消息 |
| `uploadService.js` | 图片/签名上传 | 单张/多张图片、base64 签名 |
| `wishService.js` | 愿望 CRUD + 转化 | `createWish`、`getWishList`、`linkWishToPromise` |
| `publicWishService.js` | 公开愿望榜单 | `getPublicWishList`、`likePublicWish`、`getCategoryStats` |

### 5.4 工具层（utils/）

| 工具 | 职责 |
|------|------|
| `request.js` | `wx.request` 统一封装：自动拼接 baseURL、注入 token、拦截 401/错误码 |
| `formatTime.js` | 时间格式化：ISO 转可读格式、相对时间（刚刚/X分钟前）、天数差 |
| `validate.js` | 表单校验：非空、手机号、邮箱、长度、数字、身份证等规则 |
| `eventBus.js` | 全局事件通信：`on`/`emit`/`off`/`once`，用于跨页面数据刷新 |

### 5.5 配置层（config/）

| 配置 | 内容 |
|------|------|
| `env.js` | 环境配置：dev/test/prod 的 `API_BASE_URL`、`DEBUG` 开关 |
| `constants.js` | 业务常量：约定状态枚举、约定类型、信任树 8 级定义、水滴规则、愿望类别、订阅模板 ID、页面路径常量 |

### 5.6 状态管理（store/）

`userStore.js`：简单全局状态管理，基于 `get`/`set`/`clear` 操作 `userInfo`、`familyInfo`、`token`，数据持久化到 `wx.setStorageSync`。

### 5.7 Behavior（behaviors/）

| Behavior | 职责 |
|---------|------|
| `form-validation.js` | 表单校验复用：`validateForm`、`clearFieldError`、`getFieldError` |
| `loading-state.js` | 加载状态复用：页面加载、骨架屏、下拉刷新、上拉加载、提交防重 |

---

## 六、后端架构（server/）

### 6.1 技术选型
- 运行环境：Node.js
- HTTP 框架：原生 `http` 模块（无 Express/Koa 依赖，保持轻量）
- 数据库：开发阶段用内存 + JSON 文件模拟，生产迁移到 MongoDB/MySQL
- AI 服务：DeepSeek API（通过环境变量注入 Key）

### 6.2 路由层（routes/）

| 路由文件 | 路径前缀 | 职责 |
|---------|---------|------|
| `auth.js` | `/api/auth/*` | 微信登录：`/login` 接收 code，调用微信 `jscode2session` |
| `promise.js` | `/api/promise/*` | 约定 CRUD：创建、列表、详情、完成、复盘 |
| `ai-proxy.js` | `/api/ai/*` | AI 代理：解析、复盘、提醒、信任树反馈（唯一接触 DeepSeek 的地方） |
| `trust.js` | `/api/trust/*` | 信任树：水滴增减、等级计算、阶段判断 |
| `notification.js` | `/api/notification/*` | 订阅消息：模板订阅、消息推送 |
| `publicWishes.js` | `/api/public-wishes/*` | 公开愿望：热门榜单、匿名加入、分类统计 |

### 6.3 服务层（services/）

| 服务 | 职责 |
|------|------|
| `dbService.js` | 数据库操作封装：通用 CRUD，开发期用内存/JSON 模拟 |
| `authService.js` | Token 生成/校验、Session 管理、登录中间件 |
| `wishAggregator.js` | 愿望聚合算法：定时任务，将相似愿望聚合成公开榜单关键词 |
| `contentModerator.js` | 内容审核：关键词过滤 + DeepSeek AI 审核 |
| `anonymizer.js` | 脱敏工具：手机号、邮箱、姓名、身份证号匿名化 |

### 6.4 AI 层（ai/）

| 模块 | 职责 |
|------|------|
| `prompts.js` | Prompt 模板：约定解析、复盘、提醒、信任树成长反馈、愿望审核 |
| `deepseekClient.js` | DeepSeek API 调用封装：`API_KEY` 从 `process.env.DEEPSEEK_API_KEY` 读取，带重试机制 |

### 6.5 数据层（db/）

`schema.js`：定义 8 个核心数据实体的字段结构：

| 实体 | 核心字段 |
|------|---------|
| User | id, openid, unionid, nickname, avatarUrl |
| Family | id, name, creatorId, memberIds, inviteCode |
| Promise | id, title, description, familyId, creatorId, deadline, status, progress |
| Review | id, promiseId, content, aiSummary, creatorId |
| TrustTree | id, familyId, totalDrops, stage, level |
| Wish | id, userId, content, category, status, likes, isPublic |
| PublicWish | id, content, category, wishCount, rank, trend |
| WishContribution | id, publicWishId, anonymousId, contributedAt |

---

## 七、数据模型详解

### 7.1 约定状态机

```
                    ┌─────────────┐
                    │   pending   │  ← 创建后初始状态
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  ongoing   │  │  completed │  │   overdue  │
    │  进行中    │  │   已完成   │  │   已逾期   │
    └────────────┘  └──────┬─────┘  └──────┬─────┘
                           │               │
                           ▼               ▼
                    ┌────────────┐  ┌────────────┐
                    │  reviewed  │  │  rescheduled│
                    │   已复盘   │  │   已重约    │
                    └────────────┘  └────────────┘
```

### 7.2 信任树等级

| 等级 | 名称 | 水滴范围 | 图标 |
|------|------|---------|------|
| 1 | 小种子 | 0-9 | seed |
| 2 | 嫩芽 | 10-29 | sprout |
| 3 | 小树苗 | 30-59 | sapling |
| 4 | 小树 | 60-99 | small-tree |
| 5 | 大树 | 100-149 | tree |
| 6 | 参天大树 | 150-199 | big-tree |
| 7 | 智慧树 | 200-299 | wisdom-tree |
| 8 | 永恒之树 | 300+ | eternal-tree |

### 7.3 水滴获取规则

| 场景 | 水滴数 |
|------|--------|
| 完成日常约定 | +2 |
| 完成学习约定 | +3 |
| 完成行为约定 | +2 |
| 完成活动约定 | +5 |
| 首次创建约定 | +10 |
| 连续完成 bonus | +5 |
| 完成回顾 bonus | +1 |

---

## 八、核心业务流程

### 8.1 创建约定流程

```
用户输入约定描述
       │
       ▼
  ┌────────────┐
  │ AI 解析    │  ← 调用 /api/ai/parsePromise
  │ (DeepSeek) │
  └─────┬──────┘
        │
        ▼
  展示结构化约定卡
  （标题/内容/截止时间/参与者）
        │
        ▼
  用户确认/修改
        │
        ▼
  电子拉钩签名（Canvas）
        │
        ▼
  保存约定 → 状态：pending
```

### 8.2 履约打卡流程

```
约定到期提醒（订阅消息）
       │
       ▼
  进入约定详情
       │
       ▼
  点击"完成约定"
       │
       ▼
  上传照片/备注（可选）
       │
       ▼
  双方确认（或单方确认）
       │
       ▼
  增加信任水滴
       │
       ▼
  信任树成长更新
```

### 8.3 未履约复盘流程

```
约定逾期未处理
       │
       ▼
  进入复盘页面
       │
       ▼
  孩子填写未完成原因
  家长填写未完成原因
       │
       ▼
  AI 生成温和建议
  （调用 /api/ai/generateReview）
       │
       ▼
  选择后续动作：
  ├─ 重新约定 → 跳转创建页
  ├─ 补充履约 → 继续完成
  └─ 取消约定 → 状态变更
```

### 8.4 愿望岛流程

```
用户在"我家愿望墙"创建愿望
       │
       ▼
  愿望进入家庭私密空间
  （家庭成员可见）
       │
       ▼
  可选择"分享到愿望岛"
       │
       ▼
  内容审核（关键词 + AI）
       │
       ▼
  脱敏处理（去除个人标识）
       │
       ▼
  进入聚合队列
       │
       ▼
  定时任务聚合相似愿望
       │
       ▼
  更新"愿望岛"公开榜单
  （按类别展示热门愿望）
```

---

## 九、安全设计

### 9.1 API Key 安全
- DeepSeek API Key **只存在于后端**：`server/ai/deepseekClient.js` 从 `process.env.DEEPSEEK_API_KEY` 读取
- 小程序前端 **绝不直接调用** DeepSeek API
- `services/aiService.js` 只请求自己后端的 `/api/ai/*` 接口

### 9.2 用户数据安全
- 微信登录使用 `wx.login` 获取 code，后端调用 `jscode2session` 换取 openid
- Token 机制：后端生成 JWT，前端存储于 `wx.setStorageSync`
- 请求统一注入 `Authorization: Bearer <token>`

### 9.3 愿望岛脱敏
- 公开榜单中**不展示**任何真实用户信息
- 使用匿名 ID（如 `u_8f3a`）替代用户名
- 原始愿望文字经过 NLP 聚合为关键词，重写展示文案
- 内容审核过滤敏感词和不当信息

### 9.4 订阅消息合规
- 使用微信官方订阅消息模板
- 用户主动触发订阅，不强制推送
- 模板 ID 存储于 `config/constants.js`，需在小程序后台申请

---

## 十、开发状态

### 10.1 已完成

| 项目 | 状态 |
|------|------|
| 工程骨架搭建 | 已完成（140 文件） |
| 目录结构设计 | 已完成 |
| 页面/组件/服务框架 | 已完成（占位代码） |
| 数据模型定义 | 已完成 |
| 路由/API 接口定义 | 已完成 |
| HTML Demo（独立原型） | 已实现（可运行） |
| DeepSeek AI 解析（Demo 版） | 已验证（前端直连） |
| 微信登录流程设计 | 已完成 |
| 信任树等级规则 | 已完成 |
| 水滴获取规则 | 已完成 |

### 10.2 待实现

| 项目 | 优先级 |
|------|--------|
| 微信登录后端联调 | P1 |
| 约定创建 + AI 解析（小程序版） | P1 |
| 首页信任树可视化 | P1 |
| 履约打卡 + 水滴增加 | P1 |
| 约定详情 + 状态流转 | P1 |
| 复盘页面 + AI 建议 | P2 |
| 愿望岛公开榜单 | P2 |
| 我的星球页面 | P2 |
| 订阅消息接入 | P2 |
| 数据库迁移（JSON → MongoDB/MySQL） | P3 |
| 广告位接入 | P3 |

---

## 十一、环境变量

后端启动前需配置：

```bash
DEEPSEEK_API_KEY=sk-xxx       # DeepSeek API Key
WX_APPID=wx-xxx               # 微信小程序 AppID
WX_SECRET=xxx                 # 微信小程序 AppSecret
PORT=3000                     # 服务端口（可选，默认 3000）
```

启动命令：
```bash
cd /workspace/server
DEEPSEEK_API_KEY=sk-xxx WX_APPID=wx-xxx WX_SECRET=xxx node app.js
```

---

## 十二、附录

### 12.1 小程序 tabBar

| tab | 页面 | 图标 |
|-----|------|------|
| 首页 | `pages/index/index` | home.png |
| 愿望岛 | `pages/wish/public` | island.png |
| 我的 | `pages/profile/profile` | profile.png |

### 12.2 约定类型

- `daily` — 日常约定
- `study` — 学习约定
- `behavior` — 行为约定
- `activity` — 活动约定

### 12.3 愿望类别

- `toy` — 玩具
- `food` — 美食
- `travel` — 旅行
- `entertainment` — 娱乐
- `learning` — 学习
- `experience` — 体验
- `other` — 其他
