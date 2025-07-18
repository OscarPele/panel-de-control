// src/components/Task/Task.tsx
import { useState, useEffect, type ChangeEvent } from 'react'
import './Tasks.css'
import { API_BASE } from '../DailyActivity/DailyActivity'

interface TaskRecord {
  id: number
  title: string
  date: string
  completed: boolean
}

export default function Task() {
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState(() => {
    return new Date().toISOString().slice(0, 10)
  })

  // Al montar, carga todas las tareas
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/tasks`)
        if (!res.ok) throw new Error('Error al cargar tareas')
        const data: TaskRecord[] = await res.json()
        setTasks(data)
      } catch {
        setTasks([])
      }
    }
    load()
  }, [])

  // Crear una nueva tarea
  const createTask = async () => {
    if (!newTitle.trim()) return
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), date: newDate })
      })
      if (!res.ok) throw new Error('Error al crear tarea')
      const newRec: TaskRecord = await res.json()
      setTasks(prev => [...prev, newRec])
      setNewTitle('')
      setNewDate(new Date().toISOString().slice(0, 10))
    } catch {
      // manejo de error opcional
    }
  }

  // Marcar/desmarcar completada
  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const newState = !task.completed
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newState })
      })
      if (!res.ok) throw new Error('Error al actualizar tarea')
      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, completed: newState } : t)
      )
    } catch {
      // manejo de error opcional
    }
  }

  // Borrar tarea
  const deleteTask = async (id: number) => {
    if (!confirm('¿Eliminar esta tarea?')) return
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' })
      if (res.status === 204) {
        setTasks(prev => prev.filter(t => t.id !== id))
      } else {
        throw new Error('Error al eliminar tarea')
      }
    } catch {
      // manejo de error opcional
    }
  }

  const pendingTasks   = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="task">
      <div className="task-header">
        <h2>Mis Tareas</h2>
        <div className="task-new">
          <input
            type="text"
            name="title"
            placeholder="Nueva tarea..."
            value={newTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
          />
          <input
            type="date"
            name="date"
            value={newDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewDate(e.target.value)}
          />
          <button onClick={createTask}>Crear</button>
        </div>
      </div>

      <div className="task-sections">
        <section className="task-section">
          <h3>Pendientes</h3>
          <ul className="task-list">
            {pendingTasks.map(task => (
              <li key={task.id}>
                <div className="task-item">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span
                    className="task-title"
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.title}
                  </span>
                  <span className="task-date">{task.date}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  ✕
                </button>
              </li>
            ))}
            {pendingTasks.length === 0 && (
              <li className="empty">No hay tareas pendientes</li>
            )}
          </ul>
        </section>

        <section className="task-section">
          <h3>Completadas</h3>
          <ul className="task-list">
            {completedTasks.map(task => (
              <li key={task.id} className="completed">
                <div className="task-item">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span
                    className="task-title"
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.title}
                  </span>
                  <span className="task-date">{task.date}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  ✕
                </button>
              </li>
            ))}
            {completedTasks.length === 0 && (
              <li className="empty">No hay tareas completadas</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}
