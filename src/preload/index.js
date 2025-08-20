const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 发送提交消息给主进程
  submitCommitMessage: (message) => ipcRenderer.invoke('get-commit-message', message),
  
  // 取消提交
  cancelCommit: () => ipcRenderer.invoke('cancel-commit'),
  
  // 监听原始消息
  onOriginalMessage: (callback) => ipcRenderer.on('original-message', callback),
  
  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})
