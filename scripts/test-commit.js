#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// 创建临时 commit message 文件
function createTempCommitMessage() {
    const tempDir = path.join(__dirname, '../.temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFile = path.join(tempDir, 'test-commit-msg.txt');
    const testMessage = 'test: initial commit message for testing';
    
    fs.writeFileSync(tempFile, testMessage);
    return tempFile;
}

// 清理临时文件
function cleanupTempFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    const tempDir = path.dirname(filePath);
    if (fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0) {
        fs.rmdirSync(tempDir);
    }
}

// 主测试函数
function testCommitHook() {
    console.log('🚀 开始测试 commit-msg 钩子...');
    
    // 创建临时 commit message 文件
    const tempFilePath = createTempCommitMessage();
    console.log(`📝 创建临时文件: ${tempFilePath}`);
    
    try {
        // 运行 commit-msg 钩子脚本，传递临时文件路径作为参数
        const result = spawnSync('node', [
            path.join(__dirname, '../hooks/commit-msg.js'),
            tempFilePath
        ], {
            stdio: 'inherit', // 显示所有输出
            encoding: 'utf8'
        });
        
        console.log('✅ 测试完成');
        console.log(`退出码: ${result.status}`);
        
        if (result.status === 0) {
            // 读取修改后的 commit message
            const finalMessage = fs.readFileSync(tempFilePath, 'utf8').trim();
            console.log(`📋 最终的提交消息: "${finalMessage}"`);
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    } finally {
        // 清理临时文件
        cleanupTempFile(tempFilePath);
        console.log('🧹 已清理临时文件');
    }
}

// 运行测试
testCommitHook();
