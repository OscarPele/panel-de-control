// Define el puerto de la API (mismo valor que usara en index.ts si quieres)
export const PORT = process.env.PORT ?? 3000

// URL base exportable
export const API_BASE = process.env.API_BASE_URL ?? `http://localhost:${PORT}`

import express, { type Request, type Response } from 'express'
import db from './db.js'
import cors from 'cors'

const app = express()

// Permite peticiones cross-origin únicamente desde el cliente en http://localhost:5173
app.use(cors({
  origin: 'http://localhost:5173'  // o `'*'` para permitir todos
}))

app.use(express.json())

//Gestion daily activities:

// GET /daily_activities?date=YYYY-MM-DD
// Si se pasa `date`, devuelve solo las actividades de ese día exacto.
app.get('/daily_activities', (req: Request, res: Response) => {
  const date = req.query.date as string | undefined
  let rows
  if (date) {
    rows = db
      .prepare('SELECT * FROM daily_activities WHERE fecha = ?')
      .all(date)
  } else {
    rows = db.prepare('SELECT * FROM daily_activities').all()
  }
  res.json(rows)
})

// POST /daily_activities
// Body: { fecha: string, categoria: string, duracion: number }
app.post('/daily_activities', (req: Request, res: Response) => {
  const { fecha, categoria, duracion } = req.body
  const info = db
    .prepare(
      'INSERT INTO daily_activities (fecha, categoria, duracion) VALUES (?, ?, ?)'
    )
    .run(fecha, categoria, duracion)

  const record = db
    .prepare('SELECT * FROM daily_activities WHERE id = ?')
    .get(info.lastInsertRowid)
  res.status(201).json(record)
})

// DELETE /daily_activities/:id
app.delete('/daily_activities/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  db.prepare('DELETE FROM daily_activities WHERE id = ?').run(id)
  res.sendStatus(204)
})


//CRUD Tasks:

// GET /tasks
// Devuelve todas las tareas (ignora cualquier query)
app.get('/tasks', (req: Request, res: Response) => {
  const rows = db
    .prepare('SELECT * FROM tasks')
    .all()
  res.json(rows)
})

// POST /tasks
// Body: { title: string, date: string }
app.post('/tasks', (req: Request, res: Response) => {
  const { title, date } = req.body
  const info = db
    .prepare(
      'INSERT INTO tasks (title, date) VALUES (?, ?)'
    )
    .run(title, date)

  const record = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(info.lastInsertRowid)
  res.status(201).json(record)
})

// PUT /tasks/:id
// Body: { completed: boolean }
app.put('/tasks/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { completed } = req.body
  db
    .prepare('UPDATE tasks SET completed = ? WHERE id = ?')
    .run(completed ? 1 : 0, id)
  res.sendStatus(204)
})

// DELETE /tasks/:id
app.delete('/tasks/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  db
    .prepare('DELETE FROM tasks WHERE id = ?')
    .run(id)
  res.sendStatus(204)
})



export default app