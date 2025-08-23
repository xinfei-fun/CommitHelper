#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const resolvePkg = require('resolve-pkg');

console.log('🚀 开始 commit-msg 钩子...', process.argv[2]);

// 根据操作系统获取打包后的可执行文件路径
function getExecutablePath() {
    const platform = process.platform;

    // 获取当前模块的路径（npm包安装位置）
    const packagePath = resolvePkg('commit-helper/app', { cwd: __dirname });
    const basePath = packagePath || 'dist/app';
    console.log('🚀 basePath:', basePath)


    if (platform === 'win32') {
        return path.join(basePath, 'commit-helper.exe');
    } else if (platform === 'darwin') {
        // macOS - 检查不同架构的 .app 包
        const archPaths = [
            path.join(basePath, 'mac-arm64/Commit Helper.app/Contents/MacOS/Commit'), // ARM64
            path.join(basePath, 'mac/Commit Helper.app/Contents/MacOS/Commit'),        // x64
            path.join(basePath, 'Commit Helper.app/Contents/MacOS/Commit')             // 传统位置
        ];

        for (const appPath of archPaths) {
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
console.log('🚀 ~ commit-msg.js:45 ~ executablePath:', executablePath)


// 检查配置文件是否存在
function checkConfigFile() {
    const configPath = path.join(process.cwd(), 'commit-helper.json');
    if (!fs.existsSync(configPath)) {
        console.error('❌ commit-helper.json configuration file not found.');
        console.error('Please run "npx commit-helper install" to create the configuration file.');
        return false;
    }
    return true;
}

// 运行打包后的应用
function runCommitHelperApp() {
    try {
        console.log('🚀 git提交信息临时存储文件', process.argv[2]);

        // 使用 spawnSync 来运行打包后的应用并等待其完成        
        const result = spawnSync(executablePath, [process.argv[2]], {
            encoding: 'utf8'
        });

        if (result.error) {
            console.error('Error running Commit Helper app:', result.error.message)
            process.exit(1);
        }

        if (result.status !== 0) {
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

console.log('Commit message has been updated by Commit Helper');
