# 安装和使用指南

## 安装依赖

请手动执行以下命令：

```bash
npm install vue@3.4.27
npm install --save-dev @vitejs/plugin-vue@5.0.4 vite@6.0.1 electron-builder@25.1.8
```

## 项目结构

```
commit-helper/
├── src/
│   ├── main/           # Electron 主进程
│   │   └── index.js
│   ├── preload/        # Electron 预加载脚本
│   │   └── index.js
│   └── renderer/       # Vue 3 渲染进程
│       ├── App.vue
│       └── main.js
├── hooks/              # Git hooks
│   └── commit-msg.js
├── scripts/            # 安装脚本
│   └── install-hooks.js
├── index.html          # Vue 入口文件
├── vite.config.js      # Vite 配置
└── package.json
```

## 开发命令

```bash
# 开发模式（启动 Vite 开发服务器）
npm run dev

# 构建 Vue 应用
npm run build

# 运行 Electron 应用（需要先构建）
npm run electron:dev

# 直接运行 Electron（使用源码）
npm run electron
```

## 发布到 npm

1. 确保所有测试通过
2. 更新版本号：`npm version patch`
3. 发布：`npm publish`

## 安装后行为

当用户安装这个包时：
1. `postinstall` 脚本会自动运行
2. 会自动在当前 Git 仓库中安装 commit-msg hook
3. 下次执行 `git commit` 时会自动弹出 Commit Helper 界面

## 故障排除

如果 Electron 应用无法启动：
- 确保所有依赖已正确安装
- 检查 Node.js 版本 >= 18.0.0
- 确认 Electron 已正确安装

如果 Git hook 不工作：
- 检查当前目录是否是 Git 仓库
- 确认 `.git/hooks/commit-msg` 文件存在且有执行权限
