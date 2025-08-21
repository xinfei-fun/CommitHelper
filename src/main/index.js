const { app, BrowserWindow, ipcMain, Menu } = require('electron/main')
const path = require('path')

Menu.setApplicationMenu(null) // 隐藏默认菜单栏

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    },
    show: false, // 先不显示窗口，等准备好再显示
    resizable: false,
    titleBarStyle: 'default',
    frame: true, // 显示标题栏和菜单栏
    title: 'Git Commit Helper' // 设置窗口标题
  })

  // 加载 Vue 应用
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: loading from dev server')
    const devUrl = `http://${process.env.VITE_DEV_SERVER_HOST || 'localhost'}:${process.env.VITE_DEV_SERVER_PORT || '3000'}`
    mainWindow.loadURL(devUrl)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 处理来自渲染进程的消息
ipcMain.handle('get-commit-message', async (event, message) => {
  // 输出提交消息到 stdout 并退出
  console.log(message)
  app.quit()
  return message
})

ipcMain.handle('cancel-commit', () => {
  app.quit()
  process.exit(1) // 退出并返回错误码，让 git 知道提交被取消
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 处理命令行参数（原始提交消息）
const originalMessage = process.argv[2] || ''
if (originalMessage) {
  // 将原始消息传递给渲染进程
  app.whenReady().then(() => {
    if (mainWindow) {
      mainWindow.webContents.send('original-message', originalMessage)
    }
  })
}
