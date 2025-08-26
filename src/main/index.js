const { app, BrowserWindow, ipcMain, Menu } = require('electron/main')
const path = require('path')
const fs = require('fs')
const log = require('electron-log/main');

// Initialize the logger to be available in renderer process
log.initialize();

// 文件记录所有级别
log.transports.file.level = 'info';

// 控制台只显示错误和警告
log.transports.console.level = 'debug';

log.info('Log from the main process');

Menu.setApplicationMenu(null) // 隐藏默认菜单栏

const basePath = process.env.GIT_COMMIT_HELPER_DIR

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
    show: true,
    resizable: false,
    titleBarStyle: 'default',
    frame: true, // 显示标题栏和菜单栏
    title: 'Git Commit Helper' // 设置窗口标题
  })

  // 加载 Vue 应用
  if (process.env.NODE_ENV === 'development') {
    log.info('Development mode: loading from dev server')
    const devUrl = `http://${process.env.VITE_DEV_SERVER_HOST || 'localhost'}:${process.env.VITE_DEV_SERVER_PORT || '3000'}`
    mainWindow.loadURL(devUrl)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist/web/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {

    // 从 COMMIT_EDITMSG 文件读取原始消息
    let originalMessage = ''
    try {

      const commitMsgFilePath = path.join(basePath, '.git/COMMIT_EDITMSG')
      log.info('Git提交文件:', commitMsgFilePath)

      if (commitMsgFilePath && fs.existsSync(commitMsgFilePath)) {
        originalMessage = fs.readFileSync(commitMsgFilePath, 'utf8').trim()
      } else {
        log.error('Git提交文件不存在或路径无效')
      }
    } catch (error) {
      log.error('读取提交消息文件失败:', error.message)
      originalMessage = error.message
    }

    log.info('原始提交消息:', originalMessage)
    mainWindow.webContents.send('original-message', originalMessage)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

}

// 处理来自渲染进程的消息
ipcMain.handle('get-commit-message', async (event, message) => {
  // 直接写入提交消息到 .git/COMMIT_EDITMSG 文件并退出
  try {
    const commitMsgFilePath = path.join(basePath, '.git/COMMIT_EDITMSG')
    log.info('回写Git提交文件:', commitMsgFilePath)

    fs.writeFileSync(commitMsgFilePath, message)
    app.exit(888)
  } catch (error) {
    log.error('写入Git提交文件失败:', error.message)
    app.exit(2)
  }

  return message
})

ipcMain.handle('cancel-commit', () => {
  app.exit(1)
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 加载配置
function loadConfig() {
  try {
    // 从项目根目录加载配置文件
    const configPath = path.join(basePath, 'commit-helper.json')
    if (!fs.existsSync(configPath)) {
      throw new Error('配置文件 commit-helper.json 不存在')
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    log.info('使用配置文件:', configPath)
    return config
  } catch (error) {
    log.error('加载配置失败:', error.message)
    // 配置加载失败时退出应用
    log.error('请确保已运行 "npx commit-helper install" 创建配置文件')
    app.exit(3)
  }
}

// 处理获取配置的请求
ipcMain.handle('get-config', async () => {
  return loadConfig()
})
