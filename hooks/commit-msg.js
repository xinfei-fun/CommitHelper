const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取打包后的可执行文件路径
const executablePath = path.join(__dirname, '../dist/commit-helper.exe');

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

// 运行打包后的应用并获取用户输入的提交消息
function runCommitHelperApp() {
    try {
        // 读取原始的 commit message
        const originalMessage = fs.readFileSync(process.argv[2], 'utf8').trim();

        // 使用 spawnSync 来运行打包后的应用并等待其完成
        const result = spawnSync(executablePath, [originalMessage], {
            stdio: 'pipe',
            encoding: 'utf8',
            timeout: 30000 // 30秒超时
        });

        if (result.error) {
            console.error('Error running Commit Helper app:', result.error.message);
            return -1000;
        }

        if (result.status !== 0) {
            // 用户取消了提交
            console.log('Commit cancelled by user');
            process.exit(1);
        }

        // 从 stdout 获取提交消息
        const output = result.stdout.trim();
        return output;
    } catch (error) {
        console.error('Error running Commit Helper app:', error.message);
        console.log('Falling back to original commit message...');
        return -1000;
    }
}

// 检查配置文件是否存在
if (!checkConfigFile()) {
    console.log('Proceeding with original commit message');
    process.exit(0);
}

// 获取用户输入的提交消息
const userMessage = runCommitHelperApp();

if (userMessage === -1000) {
    // 程序出错，但允许继续使用原始 message
    console.log('Proceeding with original commit message');
    process.exit(0);
}

// 检查用户是否提供了消息
if (!userMessage) {
    console.error('No commit message provided. Commit aborted.');
    process.exit(1);
}

// 将消息写入 commit message 文件
fs.writeFileSync(process.argv[2], userMessage);
