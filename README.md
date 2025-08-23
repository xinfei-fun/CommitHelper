# CommitHelper

一个优雅的 Git 提交消息格式化工具，基于 Electron + Vue 3 开发。帮助开发者轻松创建符合 Conventional Commits 规范的 Git 提交消息。

## ✨ 特性

- 🎯 图形化界面，告别手动输入
- 📝 符合 Conventional Commits 规范
- 🔧 可自定义提交类型和配置
- ⚡️ 与 Git 工作流无缝集成
- 🎨 现代化的用户界面
- 🌈 支持表情符号
- 🔍 实时预览提交消息
- 🛠 支持作用域和破坏性变更标记

## 🚀 快速开始

### 从源码安装（推荐）

```bash
# 克隆仓库
git clone https://github.com/xinfei-fun/CommitHelper.git
cd CommitHelper

# 安装依赖
npm install

# 构建应用
npm run build

# 启动开发
npm start
```

### 从 npm 安装

```bash
npm install -D @baker_kong/commit-helper
```

## 📖 使用方法

1. 在任意 Git 仓库中执行 `git commit -m 'test'` 命令
2. CommitHelper 窗口会自动弹出
3. 按提示选择或填写提交信息
4. 点击确认按钮完成提交

## ⚙️ 配置

安装后会在项目根目录自动创建 `commit-helper.json` 配置文件：

### 配置项说明

- `preCommitTypes`: 提交信息前置选项
  - `id`: 选项唯一标识
  - `type`: 输入类型（select/checkbox）
  - `title`: 选项标题
  - `prefix`: 前缀（可选）
  - `suffix`: 后缀（可选）
  - `options`: 选项列表（select 类型必需）
    - `value`: 选项值
    - `label`: 显示文本
- `appendCommitTypes`: 提交信息追加选项
  - `id`: 选项唯一标识
  - `type`: 输入类型
  - `title`: 选项标题
  - `true-value`: 选中值（checkbox 类型）
  - `false-value`: 未选中值（checkbox 类型）

## 🛠 开发指南

```bash
# 安装依赖
npm install

# 开发模式
npm run start

# 构建应用
npm run build

# 特定平台构建
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:all    # 全平台
```

## 📁 项目结构

```
commit-helper/
├── src/
│   ├── main/           # Electron 主进程
│   ├── preload/        # 预加载脚本
│   └── renderer/       # Vue 3 渲染进程
├── hooks/              # Git hooks
├── scripts/            # 安装脚本
└── [其他配置文件]
```

## 🔧 故障排除

### Electron 应用无法启动
- 确保 Node.js 版本 >= 18.0.0
- 检查依赖是否完整安装
- 在开发模式下查看控制台错误

### Git Hook 未生效
- 确认当前目录是 Git 仓库
- 检查 `.git/hooks/commit-msg` 权限
- 重新执行 `npx @baker_kong/commit-helper install`

### 配置问题
- 确保 `commit-helper.json` 存在
- 验证配置文件格式正确
- 尝试重新生成默认配置

## 📄 许可证

MIT License
