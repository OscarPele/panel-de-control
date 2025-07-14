// src/api/db.ts
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import Database from 'better-sqlite3'

// Reconstruye __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Define ruta de datos según entorno de ejecución
const dataDir = process.env.NODE_ENV === 'production'
  // En producción, junto al ejecutable
  ? resolve(dirname(process.execPath), 'data')
  // En desarrollo, carpeta ../data respecto a este fichero
  : resolve(__dirname, '../data')

// Crea directorio si no existe\if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
// Ruta al fichero SQLite
const dbPath = resolve(dataDir, 'data.sqlite')

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
