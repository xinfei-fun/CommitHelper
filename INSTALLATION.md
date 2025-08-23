# CommitHelper 安装指南

本文档提供了详细的安装和开发指南。

## 系统要求

- Node.js >= 18.0.0
- Git
- npm

## 安装方式

### 1. 从源码安装（推荐）

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

### 2. 从 npm 安装

```bash
npm install -D @baker_kong/commit-helper
```

## 依赖说明

核心依赖：
```json
{
  "vue": "^3.4.27",
  "electron": "^28.0.0"
}
```

开发依赖：
```json
{
  "@vitejs/plugin-vue": "^5.0.4",
  "vite": "^6.0.1",
  "electron-builder": "^25.1.8"
}
```

## 开发命令

```bash
# 开发模式（同时启动 Vite 开发服务器和 Electron）
npm run start

# 仅启动 Vite 开发服务器
npm run web:dev

# 仅构建前端
npm run web:build

# Electron 开发模式
npm run electron:dev

# 完整构建
npm run build

# 特定平台构建
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:all    # 全平台
```

## 项目结构说明

```
commit-helper/
├── src/                # 源代码目录
│   ├── main/          # Electron 主进程
│   │   └── index.js   # 主进程入口
│   ├── preload/       # 预加载脚本
│   │   └── index.js   # 预加载入口
│   └── renderer/      # Vue 3 渲染进程
│       ├── App.vue    # 主组件
│       └── main.js    # 渲染进程入口
├── hooks/             # Git hooks
│   └── commit-msg.js  # commit-msg hook
├── scripts/           # 工具脚本
│   └── install-hooks.js # hook 安装脚本
├── index.html         # HTML 入口
└── vite.config.js     # Vite 配置
```

## 安装后配置

1. 安装完成后会自动：
   - 创建 `commit-helper.json` 配置文件
   - 安装 Git commit-msg hook
   - 配置必要的环境变量

2. 如需重新配置：
   ```bash
   npx @baker_kong/commit-helper install
   ```

## 开发模式说明

1. 前端开发
   - 使用 Vite 开发服务器
   - 支持热更新
   - 默认端口：3000

2. Electron 开发
   - 开发模式下自动打开开发者工具
   - 支持主进程日志查看
   - 配置文件热重载

## 构建说明

1. 构建流程：
   - 先构建 Vue 应用
   - 然后打包 Electron 应用
   - 最后生成可执行文件

2. 输出目录：
   - `dist/web`: Vue 构建文件
   - `dist/app`: Electron 打包文件

## 故障排除

### 1. 安装问题

如果安装失败：
- 清除 npm 缓存：`npm cache clean --force`
- 删除 node_modules：`rm -rf node_modules`
- 重新安装：`npm install`

### 2. 开发环境问题

如果开发服务器启动失败：
- 检查端口占用：`lsof -i :3000`
- 确认 Node.js 版本
- 检查 Vite 配置文件

### 3. 构建问题

如果构建失败：
- 确保所有依赖已正确安装
- 检查构建脚本权限
- 查看构建日志

### 4. Git Hook 问题

如果 hook 不工作：
- 确认 `.git/hooks/commit-msg` 存在
- 检查文件权限：`chmod +x .git/hooks/commit-msg`
- 验证 Node.js 路径正确


## 更新说明

更新已安装的包：
```bash
npm update -D @baker_kong/commit-helper
```

## 卸载说明

从项目中卸载：
```bash
npm uninstall @baker_kong/commit-helper
