// 简单的测试脚本来验证 Electron 应用
const { spawn } = require('child_process');
const electronPath = require('electron');
const path = require('path');

console.log('启动 Electron 应用进行测试...');

const appPath = path.join(__dirname, 'src/main/index.js');
const testMessage = '这是一个测试提交消息';

const electronProcess = spawn(electronPath, [appPath, testMessage], {
  stdio: 'pipe'
});

electronProcess.stdout.on('data', (data) => {
  console.log('Electron 输出:', data.toString());
});

electronProcess.stderr.on('data', (data) => {
  console.error('Electron 错误:', data.toString());
});

electronProcess.on('close', (code) => {
  console.log(`Electron 进程退出，代码: ${code}`);
});

// 10秒后自动关闭测试
setTimeout(() => {
  electronProcess.kill();
  console.log('测试完成');
}, 30000);
