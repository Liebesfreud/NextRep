# 开发指南

## 环境

NextRep 当前依赖 React Native `0.83.6`，其 Node.js 要求为 `>= 20.19.4`。推荐使用 npm 和仓库中的 `package-lock.json`。

原生平台额外要求：

- Android：Android Studio、Android SDK、可用的模拟器或真机。
- iOS：macOS、Xcode、CocoaPods 和可用的模拟器或真机。
- Web：现代 Chromium、Firefox 或 Safari。

## 初始化

```bash
git clone https://github.com/Liebesfreud/NextRep.git
cd NextRep
npm ci
```

不要提交 `node_modules/`、`.expo/`、`android/` 或 `ios/`。原生目录由 Expo 按 `app.json` 和插件配置生成。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm start` | 启动 Expo 开发服务器 |
| `npm run android` | 生成并运行 Android 原生项目 |
| `npm run ios` | 生成并运行 iOS 原生项目 |
| `npm run web` | 启动 Web 开发版本 |
| `npx tsc --noEmit` | 执行严格 TypeScript 检查 |

仓库尚未定义 `test`、`lint` 或 `format` 脚本。不要在文档或 CI 中假设这些命令已经存在。

## EAS 构建

`eas.json` 定义了三个构建配置：

- `development`：包含 development client 的内部构建。
- `preview`：Android APK。
- `production`：商店发布构建的基础配置。

示例：

```bash
npx eas-cli build --platform android --profile preview
```

执行远程构建需要 Expo 账号及对应 EAS 项目权限。

## 数据库开发

应用启动时由 `db/client.ts` 创建 SQLite 表并补齐早期版本缺失的列。新增或修改字段时必须同步处理：

1. `db/schema.ts` 中的 Drizzle schema。
2. `db/client.ts` 中的新安装建表 SQL。
3. `db/client.ts` 中旧安装升级逻辑。
4. `db/services/data.ts` 中的导出、校验和导入逻辑。
5. `docs/ARCHITECTURE.md` 与 `docs/DATA_AND_PRIVACY.md`。

本项目当前没有使用 Drizzle migration 文件作为运行时迁移源，不要只生成 migration 后就认为应用升级已经完成。

## UI 开发

- 使用 `components/ui/` 中的基础组件。
- 使用 `bg-background`、`bg-card`、`text-foreground`、`text-muted-foreground`、`border-border` 等语义类名。
- 主题状态由 `hooks/useTheme.tsx` 管理，支持 `light`、`dark` 和 `system`。
- 复杂月历、图表和训练录入可以保留专用布局，但普通按钮、文本和卡片应复用现有组件。
- 新组件需要同时验证深色和浅色主题。

## 手动验证

功能改动至少验证受影响流程。发布前应覆盖：

1. 首次启动和已有数据库升级。
2. 力量、有氧训练的新增、编辑、删除。
3. 历史日期切换、打卡和热力图。
4. 看板聚合、身体指标录入和动作详情。
5. AI 连接测试、建议生成和计划应用。
6. JSON 导出、覆盖导入和清空数据。
7. 深色、浅色、跟随系统主题。
8. Android 返回键、键盘和底部弹窗。
9. Web 主要页面与 SQLite 读写。

## 故障排查

清理 Expo 缓存：

```bash
npx expo start --clear
```

重新生成原生目录时，先确认目录中没有需要保留的本地修改。`android/` 和 `ios/` 默认被 Git 忽略。

Web SQLite 依赖 Metro 配置和 Expo SQLite 的 Web 运行环境。若 Web 页面卡在启动阶段，优先检查浏览器控制台、WASM 资源加载和 `metro.config.js`，不要直接绕过数据库初始化。
