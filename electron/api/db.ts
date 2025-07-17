import fs from 'fs'
import { app } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import Database from 'better-sqlite3'

// Reconstruye __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Define ruta de datos según si la app está empaquetada o en dev
const dataDir = app.isPackaged
  // En producción, junto al ejecutable (ayuda a mantenerlo fuera del ASAR)
  ? join(dirname(process.execPath), 'data')
  // En desarrollo, al lado de src/api/db.ts → ../data
  : resolve(__dirname, '../data')

// Crea el directorio si no existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Ruta al fichero SQLite
const dbPath = join(dataDir, 'data.sqlite')

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
