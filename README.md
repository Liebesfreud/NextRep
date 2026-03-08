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

- **力量训练** — 逐组记录重量与次数，支持完成状态标记与 RPE 记录
- **有氧训练** — 记录时长、距离、卡路里等关键指标
- **每日打卡** — 一键完成打卡，伴随 🎉 撒花互动动效
- **训练日历** — Bento Box 风格的小格子日历，直观展示月度贡献度
- **AI 动态估算** — 基于当日训练强度自动估算卡路里消耗

### 📊 看板 — 数据可视化

- **Bento Box 身体统计** — 非对称布局直观展示体重、体格记录
- **动态趋势** — 自动对比最近数据，呈现代数与比例的变化趋势
- **AI 身体评估** — 根据当前指标生成个性化状态分析与运动建议
- **多维分析** — 统计分析最常训练的动作，洞察训练偏好

### 🤖 AI 教练 — 智能对话

- 接入任意 **OpenAI 兼容 API**（如 DeepSeek、Claude、本地模型等）
- 自动上下文注入 — 包含最近训练数据与体测数据
- **今日训练报告** — 评价动作质量、打分激励并提供恢复建议
- 支持多轮对话与 Markdown 格式渲染展示

### ⚙️ 设置 — 精致且灵活

- **全新的沉浸式 UI** — 优化的视觉层次，操作更直观顺畅
- **自定义动作库** — 独立的管理页面，支持快速创建、搜索与筛选
- **多模型配置** — 灵活管理 API 端点，支持一键切换与自动容灾
- **数据管家** — JSON 导入/导出与一键清理，数据完全本地化

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Expo SDK 55](https://expo.dev) + [React Native 0.83](https://reactnative.dev) |
| 路由 | [Expo Router](https://docs.expo.dev/router/introduction/) (文件系统路由) |
| 样式 | [NativeWind v4](https://www.nativewind.dev) (Tailwind CSS for React Native) |
| 动画 | [Moti](https://moti.fyi) + [Reanimated 4](https://docs.swmansion.com/react-native-reanimated/) |
| 数据库 | [Drizzle ORM](https://orm.drizzle.team) + [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| 图标 | [Lucide React Native](https://lucide.dev) |
| 语言 | TypeScript |

---

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) >= 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS (Simulator) 或 Android (Emulator / 真机 Expo Go)

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/YourUsername/NextRep.git
cd NextRep

# 安装依赖
npm install

# 启动开发服务器
npx expo start
```

### 构建与编译

```bash
# 运行本地构建 (Android)
npm run android

# 构建 Preview APK (需 EAS 环境)
eas build -p android --profile preview
```

---

## 📁 项目结构

```
NextRep/
├── app/                    # 路由目录 (Expo Router)
│   ├── _layout.tsx         #   顶层布局与状态提供者
│   ├── index.tsx           #   训练记录首页
│   ├── dashboard.tsx       #   数据指标看板
│   ├── ai-coach.tsx        #   AI 教练对话
│   ├── settings.tsx        #   设置菜单主页
│   └── settings/           #   二级设置页面
│       └── exercises.tsx   #     自定义动作库管理
├── components/             # 组件层
│   ├── home/               #   首页特有组件
│   ├── dashboard/          #   看板特有组件
│   ├── settings/           #   设置模块组件
│   └── ui/                 #   全局通用原子组件
├── db/                     # 数据访问层
│   ├── schema.ts           #   数据库模型
│   └── services/           #   业务逻辑服务 (CRUD)
├── hooks/                  # 数据获取与交互 Hooks
├── constants/              # 设计 Token 与全局常量
└── assets/                 # 核心静态资源
```

---

## 🔑 AI 配置说明

NextRep 支持任意 **OpenAI Chat Completions 兼容的 API**：

1. 进入 **设置** → **AI 配置**
2. 添加配置：
   - **名称**：标识当前 API 环境（如 "DeepSeek"）
   - **Base URL**：API 服务器地址（如 `https://api.deepseek.com`）
   - **API Key**：您的个人密钥
   - **模型名称**：指定调用的模型 ID（如 `deepseek-chat` 、`gpt-4o-mini`）
3. 将该配置设为 **活跃**。

> 💡 **隐私提示**：所有健身数据、API 密钥与对话记录均存储在设备本地 SQLite 数据库中，绝不上传第三方服务器（AI 服务端除外）。

---

## 📄 开源协议

[MIT License](LICENSE) — 自由使用、修改及再分发。

---

<p align="center">
  Crafted with ❤️ for Fitness Enthusiasts
</p>
