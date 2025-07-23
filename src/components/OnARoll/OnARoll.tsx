import { useState, useEffect } from 'react'
import './OnARoll.css'
import { API_BASE } from '../DailyActivity/DailyActivity'  // asegúrate de importar como named export

// Categorías que cuentan como “estudio”
const STUDY_CATEGORIES = [
  'Estudio / Lectura de temario',
  'Actividades / Deberes del ciclo',
  'Lectura de programación (extra)',
  'Proyectos personales de programación',
] as const

interface DailyActivityRecord {
  id: number
  fecha: string        // 'YYYY-MM-DD'
  categoria: string
  duracion: number
}

interface OnARollProps {
  refreshKey?: number
}

export default function OnARoll({ refreshKey }: OnARollProps) {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE}/daily_activities`)
      if (!res.ok) {
        setStreak(0)
        return
      }

      const all: DailyActivityRecord[] = await res.json()

      // extraer las fechas con estudio
      const studyDates = new Set(
        all
          .filter(a => STUDY_CATEGORIES.includes(a.categoria as any))
          .map(a => a.fecha)
      )

      // agrupar por semana (lunes)
      const weekMap = new Map<string, Set<string>>()
      studyDates.forEach(dateStr => {
        const d = new Date(dateStr)
        const offset = (d.getDay() + 6) % 7
        const monday = new Date(d)
        monday.setDate(d.getDate() - offset)
        const weekKey = monday.toISOString().slice(0, 10)
        if (!weekMap.has(weekKey)) weekMap.set(weekKey, new Set())
        weekMap.get(weekKey)!.add(dateStr)
      })

      // contar semanas completas consecutivas, sin incluir la semana en curso
      let count = 0

      // 1) hallamos el lunes de la semana actual
      const today = new Date()
      const offset = (today.getDay() + 6) % 7
      const mondayOfThisWeek = new Date(today)
      mondayOfThisWeek.setDate(today.getDate() - offset)

      // 2) empezamos desde el lunes de la semana pasada
      const current = new Date(mondayOfThisWeek)
      current.setDate(current.getDate() - 7)

      // 3) iteramos hacia atrás hasta que una semana no cumpla con ≥3 días
      while (true) {
        const key = current.toISOString().slice(0, 10)
        const daysInWeek = weekMap.get(key)?.size ?? 0
        if (daysInWeek >= 3) {
          count++
          current.setDate(current.getDate() - 7)
        } else {
          break
        }
      }

      setStreak(count)
    }

    load().catch(() => {
      setStreak(0)
    })
  }, [refreshKey])

  return (
    <div className="on-a-roll">
      <img
        src={new URL('./llamita.svg', import.meta.url).href}
        className="on-a-roll-icon"
        alt="llamita"
      />
      <span className="on-a-roll-count">{streak}</span>
    </div>
  )
}
