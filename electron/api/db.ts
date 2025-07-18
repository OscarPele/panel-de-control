// src/api/db.ts
import fs from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import Database from 'better-sqlite3'

// para poder requerir 'electron' dinámicamente sin ESM static import
const requireElectron = createRequire(import.meta.url)

// Reconstruye __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Devuelve el directorio donde almacenar la base de datos:
 * - Si estamos empaquetados (production), usa app.isPackaged
 * - Si no, carpeta ../data junto a este fichero
 */
function getDataDir(): string {
  let isPackaged = false
  try {
    const { app } = requireElectron('electron')
    isPackaged = app.isPackaged
  } catch {
    // si falla, estamos en desarrollo
    isPackaged = false
  }
  return isPackaged
    ? join(dirname(process.execPath), 'data')
    : resolve(__dirname, '../data')
}

const dataDir = getDataDir()

// Crea el directorio si no existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log(`📁 Directorio de datos creado en: ${dataDir}`)
}

// Ruta al fichero SQLite
const dbPath = join(dataDir, 'data.sqlite')
console.log(`🔌 Usando base de datos en: ${dbPath}`)

// Inicializa la base de datos
const db = new Database(dbPath)
db.prepare(`
  CREATE TABLE IF NOT EXISTS daily_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    categoria TEXT NOT NULL,
    duracion INTEGER NOT NULL
  )
`).run()

export default db
