// electron/main.ts
import { app, BrowserWindow } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import waitOn from 'wait-on'

// Reconstruye __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

// Mismo puerto que usa tu API en dist/api/index.js
const PORT = Number(process.env.PORT ?? 3000)

// Evita múltiples instancias de la aplicación
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  let win: BrowserWindow | null = null

  // 1) Arranca el servidor Express compilado como proceso hijo
  const serverProcess = spawn(
    process.execPath,
    [ join(__dirname, '..', 'api', 'index.js') ],
    { env: { ...process.env, NODE_ENV: 'production' }, stdio: 'inherit' }
  )

  // 2) Función para crear la ventana de la UI
  function createWindow() {
    if (win) return
    win = new BrowserWindow({
      width: 1024,
      height: 768,
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        contextIsolation: true
      }
    })
    if (process.env.NODE_ENV === 'development') {
      win.loadURL('http://localhost:5173')
      win.webContents.openDevTools()
    } else {
      win.loadFile(join(__dirname, '..', 'index.html'))
    }
    win.on('closed', () => { win = null })
  }

  // 3) Sólo abre la ventana cuando el puerto esté listo
  app.whenReady().then(async () => {
    await waitOn({ resources: [`tcp:localhost:${PORT}`] })
    createWindow()
  })

  // 4) Si intentan abrir otra instancia, enfoca la ventana existente
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  // 5) En macOS, reabrir ventana al hacer click en el Dock
  app.on('activate', () => {
    if (!win) createWindow()
  })

  // 6) Cierra todo en Windows/Linux al cerrar la última ventana
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      serverProcess.kill()
      app.quit()
    }
  })

  // 7) Asegura que el servidor se mata al salir de la app
  app.on('will-quit', () => {
    serverProcess.kill()
  })
}
