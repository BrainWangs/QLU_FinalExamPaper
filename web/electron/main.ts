import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { createAdminApp } from './admin-server'

let mainWindow: BrowserWindow | null = null

function createWindow(port: number) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: '齐鲁工业大学期末试卷库',
    show: false,
  })

  mainWindow.loadURL(`http://localhost:${port}`)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  const isPackaged = app.isPackaged

  const staticDir = isPackaged
    ? join(__dirname, 'dist')
    : join(__dirname, '..', 'dist')

  // Dev mode: source paths
  // __dirname = web/dist-electron/, so:
  //   seedDataDir   → web/src/data/
  //   seedAssetsDir → project-root/assets/
  // Packaged mode: electron-builder extraResources
  const seedDataDir = isPackaged
    ? join(process.resourcesPath, 'data')
    : join(__dirname, '..', 'src', 'data')

  const seedAssetsDir = isPackaged
    ? join(process.resourcesPath, 'assets')
    : join(__dirname, '..', '..', 'assets')

  const userDataPath = app.getPath('userData')

  const adminApp = createAdminApp({
    staticDir,
    seedDataDir,
    seedAssetsDir,
    userDataPath,
  })

  // Listen on random available port
  const server = adminApp.listen(0, () => {
    const addr = server.address()
    if (addr && typeof addr === 'object') {
      console.log(`Server running on http://localhost:${addr.port}`)
      createWindow(addr.port)
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    // On macOS, re-create window when dock icon clicked
    // For Windows, window-all-closed quits, so this is macOS-specific
  }
})
