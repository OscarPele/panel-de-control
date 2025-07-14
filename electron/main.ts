// electron/main.ts
import { app, BrowserWindow } from 'electron'
import { join, dirname } from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

// Reconstruye __filename y __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)


let serverProcess = spawn(
  process.execPath, // en lugar de 'node'
  [ join(__dirname, '..', 'dist', 'api', 'index.js') ],
  { env: { ...process.env, NODE_ENV: 'production' }, stdio: 'inherit' }
)


async function createWindow() {
  const win = new BrowserWindow({
    width: 1024, height: 768,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  })
  // si estás en dev:
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(__dirname, '..', 'dist', 'index.html'))
    win.webContents.openDevTools()
  }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('will-quit', () => {
  serverProcess.kill()  // cierra Express al salir
})
