<p align="center">
  <img src="assets/icon.png" width="120" height="120" alt="NextRep Logo" style="border-radius: 24px;" />
</p>

<h1 align="center">NextRep</h1>

<p align="center">
  <strong>AI 驱动的本地健身记录助手</strong><br/>
  开源 · 离线优先 · 隐私至上
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-brightgreen" alt="version" />
  <img src="https://img.shields.io/badge/platform-Android-blue" alt="platform" />
  <img src="https://img.shields.io/badge/Expo_SDK-55-purple" alt="expo" />
  <img src="https://img.shields.io/badge/license-MIT-orange" alt="license" />
</p>

---

## ✨ 功能亮点

### 🏠 首页 — 今日训练中心

- **力量训练** — 自定义动作预设，逐组记录重量/次数，支持组间完成状态
- **有氧训练** — 记录时长、距离、卡路里等关键指标
- **每日打卡** — 一键打卡 + 🎉 撒花动效
- **月度热力图** — Bento Box 风格的打卡贡献图
- **AI 卡路里估算** — 基于当日训练自动估算消耗

### 📊 看板 — 数据可视化

- **训练总览** — 月度日历 + 训练频次 / 组数 / 动作统计
- **体脂 & 体重** — 趋势记录与变化追踪
- **BMI 计算** — 自动根据身高体重计算
- **动作排行** — 最常练的动作分析

### 🤖 AI 教练 — 智能对话

- 接入任意 **OpenAI 兼容 API**（DeepSeek、Ollama、本地模型均可）
- 自动注入最近训练数据与体测数据作为上下文
- 一键生成 **今日训练报告**（评价 / 打分 / 建议 / 恢复计划）
- 支持多轮对话，Markdown 渲染回复

### ⚙️ 设置 — 高度自定义

- **多 AI 配置** — 添加多个 API 端点，一键切换，自动容灾
- **个人资料** — 姓名、身高、年龄、性别、健身目标
- **外观切换** — 暗色 / 亮色主题，跟随系统或手动选择
- **数据管理** — JSON 导入 / 导出，一键清空

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Expo SDK 55](https://expo.dev) + [React Native 0.83](https://reactnative.dev) |
| 路由 | [Expo Router](https://docs.expo.dev/router/introduction/) (文件系统路由) |
| 样式 | [NativeWind](https://www.nativewind.dev) (Tailwind CSS for React Native) |
| 数据库 | [Drizzle ORM](https://orm.drizzle.team) + [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| 图标 | [Lucide React Native](https://lucide.dev) |
| 语言 | TypeScript |

---

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) >= 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android 模拟器 或 [Expo Go](https://expo.dev/go)

### 安装

```bash
# 克隆仓库
git clone https://github.com/你的用户名/NextRep.git
cd NextRep

# 安装依赖
npm install

# 启动开发服务器
npx expo start
```

### 构建 APK

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 构建 Preview APK
eas build -p android --profile preview
```

---

## 📁 项目结构

```
NextRep/
├── app/                    # 页面 (Expo Router 文件系统路由)
│   ├── _layout.tsx         #   Tab 导航布局
│   ├── index.tsx           #   首页 — 训练记录
│   ├── dashboard.tsx       #   看板 — 数据总览
│   ├── ai-coach.tsx        #   AI 教练 — 智能对话
│   └── settings.tsx        #   设置 — 个人资料与配置
├── components/             # UI 组件
│   ├── home/               #   首页相关组件
│   ├── dashboard/          #   看板相关组件
│   └── settings/           #   设置相关组件
├── db/                     # 数据层
│   ├── schema.ts           #   Drizzle ORM 表定义
│   ├── client.ts           #   数据库初始化
│   └── services/           #   业务逻辑服务
├── hooks/                  # 自定义 Hooks
├── constants/              # 主题色彩等常量
└── assets/                 # 图标与启动图
```

---

## 🔑 AI 配置说明

NextRep 支持任意 **OpenAI Chat Completions 兼容的 API**：

1. 打开 **设置** → **AI 配置**
2. 添加一个或多个配置：
   - **名称**：配置标识（如 "DeepSeek"、"本地 Ollama"）
   - **Base URL**：API 端点（如 `https://api.deepseek.com`）
   - **API Key**：你的密钥
   - **模型名称**：如 `deepseek-chat`、`gpt-4o-mini`
3. 选择一个为 **活跃配置**，其余作为自动容灾备份

> 💡 所有数据存储在本地 SQLite，API 密钥不会上传任何服务器。

---

## 📄 开源协议

[MIT License](LICENSE) — 自由使用、修改和分发。

---

<p align="center">
  用 ❤️ 和 🏋️ 打造
</p>
