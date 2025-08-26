#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const resolvePkg = require('resolve-pkg');

const projectRoot = process.cwd();
const gitDir = path.join(projectRoot, '.git');

/**
 * 尝试检测当前环境是否支持启动 GUI 应用程序。
 * @returns {boolean} 如果环境很可能支持 GUI，返回 true。
 */
function canLaunchGui() {
    // 对于 CI/CD 环境，它们通常会设置 CI=true 环境变量
    if (process.env.CI === 'true' || process.env.CONTINUOUS_INTEGRATION === 'true') {
        return false;
    }

    // --- 新增：检测 VS Code 环境 ---
    // VSCODE_PID 存在通常表示进程是由 VS Code 启动的
    // TERM_PROGRAM 为 'vscode' 也是一个强指示
    // TERM 为 ' vscode' (注意前导空格) 是旧版 VS Code 的标志
    const isVsCodeEnvironment =
        !!process.env.VSCODE_PID ||
        process.env.TERM_PROGRAM === 'vscode' ||
        process.env.TERM === ' vscode';

    if (isVsCodeEnvironment) {
        // 进一步检查 VS Code 是否在非交互式模式下运行（例如 Git 操作）
        // VSCODE_GIT_COMMAND 通常在 VS Code 内部执行 Git 命令时设置
        // 如果这个变量存在，很可能是在 Source Control 面板触发的 commit
        if (process.env.VSCODE_GIT_COMMAND) {
             // console.log('VS Code environment detected, and VSCODE_GIT_COMMAND is set. Assuming non-GUI context for Git operations.');
             return false;
        }
        // 如果只是在 VS Code 终端中手动运行命令，可能还是有 GUI 的
        // 我们可以依赖下面的平台特定检查
    }
    // --- 新增结束 ---

    const platform = process.platform;

    if (platform === 'win32') {
        // 在 Windows 上，交互式桌面会话通常有一个 SESSIONNAME 环境变量，
        // 对于用户登录的会话，其值通常是 'Console'。
        // 而服务、非交互式进程等可能没有这个变量，或是其他值。
        // 如果在 VS Code 中但没有 VSCODE_GIT_COMMAND，我们仍然依赖这个检查
        return process.env.SESSIONNAME && process.env.SESSIONNAME.toLowerCase().includes('console');
    }

    if (platform === 'darwin') {
        // 在 macOS 上，一个简单的代理是检查我们是否在一个 SSH 会话中。
        // 如果不在 SSH 会话中，我们几乎可以肯定是在一个 GUI 环境里。
        // 当通过 VS Code 的 Source Control 调用时，这些 SSH 变量通常不存在。
        // process.env.TERM === 'dumb' 有时也是非交互式进程的标志。
        // 如果在 VS Code 中但没有 VSCODE_GIT_COMMAND，我们仍然依赖这个检查
        return !process.env.SSH_CLIENT && !process.env.SSH_TTY && process.env.TERM !== 'dumb';
    }

    if (platform === 'linux') {
        // 在 Linux 上，GUI 环境需要一个显示服务器。
        // X11 Server 使用 DISPLAY 环境变量。
        // Wayland 使用 WAYLAND_DISPLAY 环境变量。
        // 只要有其中一个，就认为可以启动 GUI。
        // 如果在 VS Code 中但没有 VSCODE_GIT_COMMAND，我们仍然依赖这个检查
        return !!(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);
    }

    // 对于未知或不支持的平台，保守地返回 false。
    return false;
}

if (!canLaunchGui()) {
    console.log('💡 Non-GUI environment detected (e.g., SSH, Docker, CI, VS Code non-interactive).');
    console.log('Skipping graphical commit helper and proceeding with commit.');
    process.exit(0);
}

// 1. 如果不是上述情况，排除掉 rebase 等操作
function isGitOperationInProgress(fileName) {
    return fs.existsSync(path.join(gitDir, fileName));
}

// 检查 Rebase
if (isGitOperationInProgress('rebase-merge') || isGitOperationInProgress('rebase-apply')) {
    console.log('Skipping commit-helper: Rebase operation detected.');
    process.exit(0);
}

// 检查 Merge, Revert, Cherry-pick, Squash
if (
    isGitOperationInProgress('MERGE_HEAD') ||
    isGitOperationInProgress('REVERT_HEAD') ||
    isGitOperationInProgress('CHERRY_PICK_HEAD') ||
    isGitOperationInProgress('SQUASH_MSG')
) {
    console.log('Skipping commit-helper: Merge, Revert, Cherry-pick or Squash operation detected.');
    process.exit(0);
}

// --- 检测逻辑结束 ---

console.log('🚀 开始 commit-msg 钩子 (Interactive environment)...', projectRoot);

function getExecutablePath() {
    const platform = process.platform;

    const packagePath = resolvePkg('@baker_kong/commit-helper/dist/app', { cwd: __dirname });
    console.log('🚀 当前包路径:', packagePath)

    const basePath = packagePath || path.join(projectRoot, 'dist', 'app');
    console.log('🚀 应用目录:', basePath)

    if (platform === 'win32') {
        return path.join(basePath, 'commit-helper.exe');
    }

    if (platform === 'darwin') {
        const macPaths = [
            path.join(basePath, 'mac-universal/Commit Helper.app/Contents/MacOS/Commit'),
            path.join(basePath, 'mac-arm64/Commit Helper.app/Contents/MacOS/Commit'),
            path.join(basePath, 'mac/Commit Helper.app/Contents/MacOS/Commit'),
            path.join(basePath, 'Commit Helper.app/Contents/MacOS/Commit')
        ];
        for (const appPath of macPaths) { if (fs.existsSync(appPath)) { return appPath; } }
        return path.join(basePath, 'commit-helper');
    }

    if (platform === 'linux') {
        const appImagePath = path.join(basePath, 'commit-helper.AppImage');
        if (fs.existsSync(appImagePath)) { return appImagePath; }
        return path.join(basePath, 'commit-helper');
    }

    return path.join(basePath, 'commit-helper');
}

const executablePath = getExecutablePath();
console.log('🚀 应用文件:', executablePath);


function checkConfigFile() {
    const configPath = path.join(projectRoot, 'commit-helper.json');
    console.log('🚀 配置文件:', configPath)

    if (!fs.existsSync(configPath)) {
        console.error('❌ commit-helper.json configuration file not found.');
        console.error('Please run "npx @baker_kong/commit-helper install" to create the configuration file.');
        return false;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.disabled) {
        console.log('Commit Helper 已禁用，跳过检查');
        return false;
    }

    return true;
}

function runCommitHelperApp() {
    try {
        console.log('🚀 Git提交信息临时存储文件', path.join(projectRoot, '.git/COMMIT_EDITMSG'));

        const result = spawnSync(executablePath, [], {
            encoding: 'utf8',
            env: { ...process.env, GIT_COMMIT_HELPER_DIR: projectRoot },
        });

        console.log('🚀 应用运行结果:', result.status);

        if (result.error) {
            console.error('Error running Commit Helper app:', result.error.message)
            process.exit(1);
        }
        
        if (result.status !== 888) {
            console.log(`Commit cancelled by application (exit code: ${result.status}).`);
            process.exit(1);
        }

        return 0;
    } catch (error) {
        console.error('Error running Commit Helper app:', error.message);
        console.log('Falling back to original commit message...');
        process.exit(1);
    }
}

if (!checkConfigFile()) {
    console.log('Proceeding with original commit message');
    process.exit(0);
}

runCommitHelperApp();

console.log('Commit hook 运行完成');