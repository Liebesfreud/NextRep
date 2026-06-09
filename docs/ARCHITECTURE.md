# 架构说明

## 总览

NextRep 是一个 Expo Router 应用。页面层组合 React Native 组件和交互状态，`db/services/` 提供业务数据接口，Drizzle ORM 负责访问设备内 SQLite。

```text
页面 app/
  -> 业务组件 components/
  -> 服务 db/services/
  -> Drizzle db/client.ts + db/schema.ts
  -> expo-sqlite nextrep.db
```

AI 是唯一需要主动访问外部服务的核心功能。训练记录、看板、主题和备份均可在本地工作。

## 启动流程

1. `index.ts` 注册 Expo Router 入口。
2. `app/_layout.tsx` 挂载主题和 React Navigation 主题。
3. 根布局调用 `initDatabase()`。
4. 数据库初始化成功后显示底部 Tab。
5. 各页面在获得焦点时通过 service 层加载数据。

页面加载普遍使用递增的 sequence ref 忽略过期异步结果，避免快速切页或切换日期时旧请求覆盖新状态。

## 路由

| 路由 | 职责 |
| --- | --- |
| `app/index.tsx` | 按日期记录训练、打卡、热力图和能耗 |
| `app/dashboard.tsx` | 月度复盘、训练容量、身体指标和动作分析 |
| `app/ai-coach.tsx` | 状态选择、AI 建议、今日计划和计划应用 |
| `app/settings.tsx` | 主题、个人资料、AI 配置和数据管理 |
| `app/settings/exercises.tsx` | 动作库搜索、分类、创建、删除和历史详情 |

`settings/exercises` 不显示在底部 Tab 中，由设置或训练录入流程进入。

## 数据模型

数据库文件名为 `nextrep.db`。

| 表 | 内容 |
| --- | --- |
| `Workout` | 力量和有氧训练记录 |
| `StrengthPreset` | 用户动作库及分类 |
| `DailyCheckin` | 每日打卡与 AI 估算热量 |
| `body_metrics` | 体重、体脂等身体指标 |
| `UserProfile` | 个人资料、AI 配置和 token 统计 |

训练日期由 `Workout.createdAt` 推导，打卡使用 `YYYY-MM-DD` 字符串。修改或删除某日训练会清除该日打卡，要求用户重新确认当天完成状态。

## 服务边界

- `db/services/workout.ts`：训练、动作库和打卡。
- `db/services/dashboard.ts`：月度聚合、身体指标和动作历史分析。
- `db/services/profile.ts`：个人资料、AI 配置和 token 计数。
- `db/services/ai.ts`：连接测试、能耗估算和结构化训练建议。
- `db/services/data.ts`：完整 JSON 导出、导入校验、恢复和清空。

页面和组件不应直接拼接 SQL。已有的 AI 教练页面会直接读取少量表数据来构建上下文；后续改动应优先将这类查询收口到 service 层。

## AI 调用

激活配置包含 `baseUrl`、`apiKey` 和 `model`。如果 Base URL 不以 `/chat/completions` 结尾，服务层会自动追加该路径。

主要调用：

- 连接测试：发送最小消息，超时 15 秒。
- 每日能耗估算：发送个人概况和当天训练，失败时回退到本地估算。
- 训练建议：发送个人概况、近期训练、近期身体指标和动作库，要求返回结构化 JSON。

AI 返回的今日动作会再次按本地动作库校验，最多保留五项。应用计划时通过单个数据库事务写入，并清除当天已有打卡。

## UI 与主题

`global.css` 和 `tailwind.config.js` 定义语义 token。`hooks/useTheme.tsx` 将用户偏好保存在 AsyncStorage，并在根节点应用对应主题类。

`components/ui/` 分为两类：

- 通用基础组件：`button`、`card`、`input`、`text`、`badge` 等。
- NextRep 专用组件：品牌标记、状态徽章、日历单元格、底部导航背景等。

月历、趋势图、Bento 布局和训练录入弹窗属于业务专用组件，不要求抽象成通用 UI。

## 备份兼容

当前导出格式版本为 `2`。导入器验证顶层结构和主要字段类型，并兼容 profile 中 JSON 字符串或数组形式的 AI 配置。

导入是覆盖式事务：先清空现有表，再写入备份。任何导入格式变化都必须考虑旧备份兼容和事务失败后的行为。
