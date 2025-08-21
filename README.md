# Git Commit Helper

一个基于 Electron + Vue 3 的 Git 提交消息辅助工具，帮助用户生成符合 Conventional Commits 规范的提交消息。

## 功能特性

- 🎯 图形化界面选择提交类型
- 📝 实时预览格式化后的提交消息
- 🔧 支持作用域和破坏性变更
- ⚡️ 与 Git hooks 无缝集成
- 🎨 现代化的 Vue 3 界面

## 安装

```bash
npm install commit-helper
```

安装后会自动配置 Git commit-msg hook。

## 使用方法

1. 正常使用 `git commit` 命令
2. 系统会自动弹出 Commit Helper 界面
3. 选择提交类型、填写相关信息
4. 点击提交按钮完成提交

## 提交类型

- ✨ `feat` - 新功能
- 🐛 `fix` - 修复 bug
- 📝 `docs` - 文档更新
- 💄 `style` - 代码格式
- ♻️ `refactor` - 重构
- ⚡️ `perf` - 性能优化
- ✅ `test` - 测试相关
- 🔧 `chore` - 构建/工具

## 配置

安装包时会自动在项目根目录创建 `commit-helper.json` 配置文件。您需要修改此文件来自定义界面选项。**配置文件是必需的**，如果没有配置文件，Commit Helper 将无法正常工作。

### 安装后配置

安装包后，系统会自动创建默认配置文件。您可以通过以下命令重新创建配置文件：

```bash
npx commit-helper install
```

### 配置文件示例

```json
{
  "commitTypes": [
    {
      "value": "feat",
      "label": "新功能",
      "emoji": "✨"
    },
    {
      "value": "fix",
      "label": "修复bug",
      "emoji": "🐛"
    },
    {
      "value": "docs",
      "label": "文档更新",
      "emoji": "📝"
    }
  ],
  "scopeEnabled": true,
  "breakingChangeEnabled": true,
  "defaultCommitType": "feat"
}
```

### 配置选项说明

- `commitTypes`: 提交类型数组，每个类型包含：
  - `value`: 提交类型值（必填）
  - `label`: 显示标签（必填）
  - `emoji`: 表情符号（可选）
- `scopeEnabled`: 是否启用作用域输入框（默认：true）
- `breakingChangeEnabled`: 是否启用破坏性变更选项（默认：true）
- `defaultCommitType`: 默认选中的提交类型（默认："feat"）

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 运行 Electron 应用
npm run electron:dev
```

## 技术栈

- Electron
- Vue 3
- Vite
- Node.js

## 许可证

MIT License
