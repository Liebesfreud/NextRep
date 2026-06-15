<p align="center">
  <img src="assets/icon.png" width="112" height="112" alt="NextRep 应用图标" />
</p>

<h1 align="center">NextRep</h1>

<p align="center">
  本地优先的健身记录与 AI 训练建议应用
</p>

<p align="center">
  <img src="https://img.shields.io/badge/app-2.0.0-34C759" alt="应用版本 2.0.0" />
  <img src="https://img.shields.io/badge/Expo-56-000020?logo=expo" alt="Expo SDK 56" />
  <img src="https://img.shields.io/badge/React_Native-0.85.3-61DAFB?logo=react" alt="React Native 0.85.3" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
</p>

NextRep 使用设备本地 SQLite 保存训练、打卡、身体指标和个人配置。核心记录功能不依赖账号或云端服务；AI 功能由用户自行配置 OpenAI Chat Completions 兼容接口。

## 当前功能

- 记录力量训练的动作、重量、组数、次数和完成状态。
- 记录有氧训练的时长、距离、热量等数据。
- 按日期查看和编辑训练，完成每日打卡并浏览月度热力图。
- 查看训练频率、训练容量、动作历史、突破记录、体重和体脂趋势。
- 管理自定义力量动作库，并按训练分类搜索和筛选。
- 根据精力、可用时长和训练地点生成 AI 今日建议。
- 将 AI 返回的训练计划直接加入当天训练列表。
- 配置多个 OpenAI 兼容服务，测试连接并统计 token 用量。
- 在深色、浅色和跟随系统三种主题之间切换。
- 将全部本地数据导出为 JSON，或从备份文件全量恢复。

## 技术栈

| 范围 | 技术 |
| --- | --- |
| 应用框架 | Expo SDK 56、React Native 0.85.3、React 19 |
| 路由 | Expo Router |
| UI | NativeWind 4、React Native Reusables 风格组件、Lucide |
| 动画 | Reanimated 4、Moti |
| 数据 | expo-sqlite、Drizzle ORM |
| 语言 | TypeScript 5.9 |

## 快速开始

### 环境要求

- Node.js `>= 20.19.4`
- npm
- Android Studio 与 Android SDK，用于本地 Android 构建
- macOS、Xcode 与 CocoaPods，用于本地 iOS 构建

### 安装

```bash
git clone https://github.com/Liebesfreud/NextRep.git
cd NextRep
npm ci
```

### 运行

```bash
# 启动 Expo 开发服务器
npm start

# 生成并运行 Android 原生项目
npm run android

# 生成并运行 iOS 原生项目，仅限 macOS
npm run ios

# 启动 Web 开发版本
npm run web
```

`android/` 和 `ios/` 是 Expo 生成目录，不提交到仓库。首次执行原生运行命令时，Expo 会按当前配置生成对应项目。

### 基础校验

```bash
npx tsc --noEmit
```

仓库目前尚未配置自动化测试和 lint 脚本。提交功能改动前，至少应完成 TypeScript 检查和目标平台手动验证。

## AI 配置

1. 打开“设置”。
2. 在“服务端配置”中添加名称、Base URL、API Key 和模型 ID。
3. 选择激活配置并执行连接测试。
4. 打开“AI 教练”，选择当天状态并生成训练建议。

Base URL 可以填写 API 根地址，例如 `https://api.openai.com/v1`，也可以直接填写以 `/chat/completions` 结尾的完整地址。

AI 请求会把相关个人资料、近期训练、近期身体指标和动作库发送给当前激活的第三方服务。API Key 保存在本地 SQLite 中，也会包含在完整 JSON 备份里。导出的备份文件应按敏感文件管理。详情见[数据与隐私说明](docs/DATA_AND_PRIVACY.md)。

## 项目结构

```text
NextRep/
├── app/                    Expo Router 页面与根布局
├── components/
│   ├── home/               首页和训练录入
│   ├── dashboard/          数据看板与动作分析
│   ├── settings/           设置与数据管理
│   └── ui/                 通用 UI 组件
├── constants/              主题、动画和动作视觉配置
├── db/
│   ├── client.ts           SQLite 初始化和兼容迁移
│   ├── schema.ts           Drizzle 数据模型
│   └── services/           训练、看板、AI、配置和备份服务
├── hooks/                  应用级 Hooks
├── assets/                 图标和启动资源
└── docs/                   维护文档
```

## 文档

- [开发指南](docs/DEVELOPMENT.md)
- [架构说明](docs/ARCHITECTURE.md)
- [数据与隐私说明](docs/DATA_AND_PRIVACY.md)
- [贡献指南](CONTRIBUTING.md)
- [后续计划](plan.md)

## 平台状态

Android 是当前主要运行目标。Web 用于开发和兼容性验证；iOS 已包含 Expo 配置和运行脚本，但发布前仍需要在真实 iOS 环境完成验证。

## 许可证

本项目使用 [MIT License](LICENSE)。
