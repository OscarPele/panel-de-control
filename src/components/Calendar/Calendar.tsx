import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './CalendarView.css'
import DailyActivity from '../DailyActivity/DailyActivity'
import CellActivities from './CellActivities/CellActivities'
import CellTasks from './CellTasks/CellTasks'
import { API_BASE } from '../DailyActivity/DailyActivity'

interface CalendarProps {
  initialYear?: number
  initialMonth?: number
  refreshKey?: number
  onActivityChange?: () => void
}

interface TaskRecord {
  id: number
  title: string
  date: string   // 'YYYY-MM-DD'
  completed: boolean
}

export default function Calendar({
  initialYear,
  initialMonth,
  refreshKey,
  onActivityChange,
}: CalendarProps) {
  // Estado con las tareas de todo el mes mostrado
  const [monthTasks, setMonthTasks] = useState<TaskRecord[]>([])
  // Fecha activa para el modal de DailyActivity
  const [activeDate, setActiveDate] = useState<string | null>(null)
  
  // Fecha de hoy y sus componentes
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  // Año y mes mostrados
  const [year, setYear] = useState(
    initialYear !== undefined ? initialYear : today.getFullYear()
  )
  const [month, setMonth] = useState(
    initialMonth !== undefined ? initialMonth : today.getMonth()
  )

  // Navegación de mes
  const prev = () => {
    if (month === 0) {
      setYear(y => y - 1)
      setMonth(11)
    } else {
      setMonth(m => m - 1)
    }
  }
  const next = () => {
    if (month === 11) {
      setYear(y => y + 1)
      setMonth(0)
    } else {
      setMonth(m => m + 1)
    }
  }

  // Carga tareas al montar y al cambiar año/mes/refreshKey
  useEffect(() => {
    const loadMonthTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/tasks`)
        if (!res.ok) throw new Error()
        const all: TaskRecord[] = await res.json()
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`
        setMonthTasks(all.filter(t => t.date.startsWith(prefix)))
      } catch {
        setMonthTasks([])
      }
    }
    loadMonthTasks()
  }, [year, month, refreshKey])

  // cálculo de celdas
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const blanks = Array((firstDay + 6) % 7).fill(null)
  const days = Array.from({ length: totalDays }, (_, i) => i + 1)
  const cells = [...blanks, ...days]

  const monthNames = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ]

  return (
    <>
      <div className="calendar-grid">
        {/* navegación */}
        <div className="calendar-nav">
          <button onClick={prev} className="nav-btn"><ChevronLeft/></button>
          <span className="nav-label">{monthNames[month]} {year}</span>
          <button onClick={next} className="nav-btn"><ChevronRight/></button>
        </div>

        {/* cabeceras de semana */}
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
          <div key={d} className="calendar-header">{d}</div>
        ))}

        {/* celdas */}
        {cells.map((day, i) => {
          const dateStr = day
            ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : null

          // ¿Es hoy?
          const isToday = dateStr === todayStr

          return (
            <div
              key={i}
              className={`
                calendar-cell
                ${day ? '' : 'empty'}
                ${isToday ? 'today' : ''}
              `}
              onClick={dateStr ? () => setActiveDate(dateStr) : undefined}
            >
              {day && <div className="cell-number">{day}</div>}

              {dateStr && (
                <>
                  <CellTasks tasks={monthTasks.filter(t => t.date === dateStr)}/>
                  <CellActivities date={dateStr} refreshKey={refreshKey}/>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* modal de DailyActivity */}
      {activeDate && (
        <DailyActivity
          date={activeDate}
          onClose={()=>setActiveDate(null)}
          onActivityChange={onActivityChange}
        />
      )}
    </>
  )
}
