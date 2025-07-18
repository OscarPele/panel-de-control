// src/components/DailyActivity/DailyActivity.tsx
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { X, Trash2 } from 'lucide-react'
import './DailyActivity.css'

// “forzamos” TS a no validar import.meta.env
export const API_BASE = (import.meta as any).env.VITE_API_BASE

// Lista de categorías disponibles
export const DAILY_CATEGORIES = [
  'Estudio / Lectura de temario',
  'Actividades / Deberes del ciclo',
  'Lectura de programación (extra)',
  'Proyectos personales de programación',
  'Ocio consciente',
  'Ejercicio físico / movimiento',
  'Meditación / journaling / autocuidado',
  'Tiempo muerto / improductivo',
  'Tareas domésticas / recados',
  'Trabajo',
  'Tiempo con otras personas',
  'Gestiones / papeleo / trámites',
] as const

// Mapa de colores por categoría
export const ACTIVITY_COLOR_MAP: Record<typeof DAILY_CATEGORIES[number], string> = {
  /* Estudio */
  'Estudio / Lectura de temario':        '#58a05c88',
  'Actividades / Deberes del ciclo':    '#2c8b318d',
  'Lectura de programación (extra)':    '#0180079f',
  'Proyectos personales de programación':'#2f90348c',

  /* Ocio */
  'Ocio consciente':                   '#ba815285',
  'Ejercicio físico / movimiento':     '#5c84a386',
  'Meditación / journaling / autocuidado':'#a17f357f',
  'Tiempo muerto / improductivo':       '#e0e0e077',

  /* Obligaciones */
  'Tareas domésticas / recados':        '#8225bc84',
  'Trabajo':                             '#8d24aa6d',
  'Tiempo con otras personas':           '#ae2ec578',
  'Gestiones / papeleo / trámites':      '#ce93d871',
}


const ESTUDIO_CATEGORIES    = DAILY_CATEGORIES.slice(0, 4)
const OCIO_CATEGORIES      = DAILY_CATEGORIES.slice(4, 8)
const OBLIGACIONES_CATEGORIES = DAILY_CATEGORIES.slice(8)

// Datos de la forma antes de persistir
export interface DailyActivityData {
  fecha: string            // 'YYYY-MM-DD'
  categoria: typeof DAILY_CATEGORIES[number]
  duracion: number         // en minutos
}

// Registro con ID de la BBDD
export interface DailyActivityRecord extends DailyActivityData {
  id: number
}

interface DailyActivityProps {
  date: string               // fecha seleccionada
  onClose: () => void        // cierra el modal
  onActivityChange?: () => void  // callback tras cambios
}

export default function DailyActivity({
  date,
  onClose,
  onActivityChange,
}: DailyActivityProps) {
  // Estado para los campos del formulario
  const [formData, setFormData] = useState<DailyActivityData>({
    fecha: date,
    categoria: DAILY_CATEGORIES[0],
    duracion: 30,
  })
  // Estado con las actividades ya guardadas
  const [activities, setActivities] = useState<DailyActivityRecord[]>([])

  // Al montar (o cambiar `date`), carga las actividades de ese día
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/daily_activities?date=${date}`)
        if (!res.ok) throw new Error()
        const data: DailyActivityRecord[] = await res.json()
        setActivities(data)
      } catch {
        setActivities([])
      }
    }
    load()
  }, [date])

  // Actualiza formData al cambiar select/inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duracion' ? Number(value) : value,
    }))
  }

  // Envía nueva actividad y actualiza la lista sin recarga completa
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/daily_activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error()
      const newRec: DailyActivityRecord = await res.json()
      setActivities(prev => [...prev, newRec])
      onActivityChange?.()
      setFormData(fd => ({ ...fd, duracion: 30 }))  // reset duración
    } catch {
      // manejo de error opcional
    }
  }

  // Borra una actividad y actualiza la lista local
  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta actividad?')) return
    try {
      const res = await fetch(`${API_BASE}/daily_activities/${id}`, { method: 'DELETE' })
      if (res.status === 204) {
        setActivities(prev => prev.filter(x => x.id !== id))
        onActivityChange?.()
      }
    } catch {
      // manejo de error opcional
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Cerrar modal */}
        <button className="modal-close" onClick={onClose}>
          <X size={16} />
        </button>
        {/* Título con la fecha */}
        <h3>Registrar actividad - {date}</h3>

        {/* Formulario de nueva actividad */}
        <form className="activity-form" onSubmit={handleSubmit}>
          <label>
            Categoría
            <select name="categoria" value={formData.categoria} onChange={handleChange}>
              <optgroup label="Estudio" className="group-estudio">
                {ESTUDIO_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
              <optgroup label="Ocio" className="group-ocio">
                {OCIO_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
              <optgroup label="Obligaciones" className="group-obligaciones">
                {OBLIGACIONES_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
            </select>
          </label>

          <label>
            Duración
            <select
              name="duracion"
              value={formData.duracion}
              onChange={handleChange}
              required
            >
              {Array.from({ length: 32 }, (_, i) => (i + 1) * 30).map(minutes => (
                <option key={minutes} value={minutes}>
                  {minutes / 60}h
                </option>
              ))}
            </select>
          </label>

          <button type="submit">Guardar</button>
        </form>

        {/* Lista de actividades existentes */}
        {activities.length > 0 && (
          <div className="existing-activities">
            <h4>Actividades del día</h4>
            <ul>
              {activities.map(act => (
                <li key={act.id}>
                  <span>{act.categoria}: {(act.duracion / 60).toFixed(1)} h</span>
                  <button onClick={() => handleDelete(act.id)}>
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
