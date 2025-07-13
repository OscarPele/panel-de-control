// src/api/db.ts
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import Database from 'better-sqlite3'

// Reconstruye __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 1. Ruta al directorio de datos
const dataDir = resolve(__dirname, '../data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

// 2. Abre/crea la BBDD SQLite
const dbPath = resolve(dataDir, 'data.sqlite')
const db = new Database(dbPath)

// 3. Inicializa la tabla si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS daily_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    categoria TEXT NOT NULL,
    duracion INTEGER NOT NULL
  )
`).run()

export default db
