#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const resolvePkg = require('resolve-pkg');

// 获取 commit 来源。Git 会将其作为第二个参数传入。
const commitSource = process.argv[3];

// 只在常规提交时运行钩子 (git commit, git commit --amend)
// 其他情况如 merge, rebase, squash 等都会被跳过。
if (commitSource !== 'message') {
    // 如果 commitSource 不是 'message' (可能是 'merge', 'squash', 或者 undefined),
    // 则打印信息并正常退出，让 Git 继续执行。
    console.log(`Skipping commit-helper: operation is '${commitSource || 'non-standard'}', not a direct commit.`);
    process.exit(0);
}
// --- 检测逻辑结束 ---

// 项目根目录
const projectRoot = process.cwd();

console.log('🚀 开始 commit-msg 钩子...', projectRoot);

// 根据操作系统获取打包后的可执行文件路径
function getExecutablePath() {
    const platform = process.platform;

    // 获取当前模块的路径（npm包安装位置）
    const packagePath = resolvePkg('@baker_kong/commit-helper/dist/app', { cwd: __dirname });
    console.log('🚀 当前包路径:', packagePath)

    const basePath = packagePath || 'dist/app';
    console.log('🚀 应用目录:', basePath)


    if (platform === 'win32') {
        return path.join(basePath, 'commit-helper.exe');
    } else if (platform === 'darwin') {
        // macOS - 检查不同架构的 .app 包，包括 universal build
        const macPaths = [
            // Universal build 路径
            path.join(basePath, 'mac-universal/Commit Helper.app/Contents/MacOS/Commit'),
            // 单独架构路径
            path.join(basePath, 'mac-arm64/Commit Helper.app/Contents/MacOS/Commit'), // ARM64
            path.join(basePath, 'mac/Commit Helper.app/Contents/MacOS/Commit'),        // x64
            // 传统位置
            path.join(basePath, 'Commit Helper.app/Contents/MacOS/Commit')
        ];

        for (const appPath of macPaths) {
            if (fs.existsSync(appPath)) {
                return appPath;
            }
        }
        // 如果没有 .app 包，尝试直接的可执行文件
        return path.join(basePath, 'commit-helper');
    } else if (platform === 'linux') {
        // Linux - 可能是 AppImage 或直接的可执行文件
        const appImagePath = path.join(basePath, 'commit-helper.AppImage');
        if (fs.existsSync(appImagePath)) {
            return appImagePath;
        }
        return path.join(basePath, 'commit-helper');
    }

    // 默认回退
    return path.join(basePath, 'commit-helper');
}

const executablePath = getExecutablePath();
console.log('🚀 应用文件:', executablePath)


// 检查配置文件是否存在
function checkConfigFile() {
    const configPath = path.join(projectRoot, 'commit-helper.json');
    console.log('🚀 配置文件:', configPath)

    if (!fs.existsSync(configPath)) {
        console.error('❌ commit-helper.json configuration file not found.');
        console.error('Please run "npx @baker_kong/commit-helper install" to create the configuration file.');
        return false;
    }

    // 读取配置并检查 disabled 状态
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.disabled) {
        console.log('Commit Helper 已禁用，跳过检查');
        return false;
    }

    return true;
}

// 运行打包后的应用
function runCommitHelperApp() {
    try {
        console.log('🚀 Git提交信息临时存储文件', path.join(projectRoot, '.git/COMMIT_EDITMSG'));

        // 使用 spawnSync 来运行打包后的应用并等待其完成        
        const result = spawnSync(executablePath, [], {
            encoding: 'utf8',
            env: {
                ...process.env, // 保留现有环境变量
                GIT_COMMIT_HELPER_DIR: projectRoot // 添加自定义环境变量
            }
        });

        console.log('🚀 应用运行结果:', result.status)


        if (result.error) {
            console.error('Error running Commit Helper app:', result.error.message)
            process.exit(1);
        }

        if (result.status !== 888) {
            // 用户取消了提交
            console.log('Commit cancelled by user');
            process.exit(1);
        }

        return 0; // 返回成功状态
    } catch (error) {
        console.error('Error running Commit Helper app:', error.message);
        console.log('Falling back to original commit message...');
        process.exit(1);
    }
}

// 检查配置文件是否存在
if (!checkConfigFile()) {
    console.log('Proceeding with original commit message');
    process.exit(0);
}

// 运行提交助手应用
runCommitHelperApp();

console.log('Commit hook 运行完成');
