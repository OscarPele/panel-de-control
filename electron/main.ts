// electron/main.ts
import { app, BrowserWindow } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import apiApp, { PORT } from './api/server.js'  // arrancamos la API en este mismo proceso

// Reconstruye __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

// Impide múltiples instancias de la aplicación
if (!app.requestSingleInstanceLock()) {
  console.log('Ya hay una instancia corriendo, saliendo…')
  app.quit()
} else {
  let win: BrowserWindow | null = null

  // Crea la ventana principal
  function createWindow() {
    console.log('createWindow(): iniciando creación de la ventana…')
    if (win) {
      console.log('  La ventana ya existe, no se crea otra.')
      return
    }
    win = new BrowserWindow({
      width: 1024,
      height: 768,
      minWidth: 600,
      minHeight: 400,
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        contextIsolation: true
      }
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('  Modo desarrollo: cargando http://localhost:5173')
      win.loadURL('http://localhost:5173')
      win.webContents.openDevTools()
    } else {
      console.log('  Modo producción: cargando index.html empaquetado')
      win.loadFile(join(__dirname, '..', 'index.html'))
    }

    win.on('closed', () => {
      console.log('Ventana cerrada.')
      win = null
    })
  }

  // Al arrancar Electron, iniciamos la API y luego abrimos la ventana
  app.whenReady().then(() => {
    console.log('Electron listo: arrancando la API primero…')
    try {
      apiApp.listen(PORT, () => {
        console.log(`API escuchando en puerto ${PORT}`)
        console.log('Lanzando la ventana de la aplicación…')
        createWindow()
      })
    } catch (err) {
      console.error('Error al arrancar la API:', err)
      console.log('Procediendo a mostrar la UI de todas formas…')
      createWindow()
    }
  })

  // Si abren una segunda instancia, enfocamos la ventana existente
  app.on('second-instance', () => {
    console.log('second-instance: enfocando ventana existente.')
    if (win) {
      if (win.isMinimized()) {
        console.log('  Restaurando ventana minimizada.')
        win.restore()
      }
      console.log('  Trayendo ventana al frente.')
      win.focus()
    }
  })

  // En macOS, reabre ventana al hacer click en el Dock
  app.on('activate', () => {
    console.log('activate: asegurando que haya una ventana.')
    if (!win) createWindow()
  })

  // En Windows/Linux, cierra la app al cerrar la última ventana
  app.on('window-all-closed', () => {
    console.log('window-all-closed: todas las ventanas cerradas.')
    if (process.platform !== 'darwin') {
      console.log('  Saliendo de la aplicación.')
      app.quit()
    }
  })
}
