// src/CalendarView.tsx
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './CalendarView.css'

interface CalendarViewProps {
  initialYear?: number      // año inicial opcional
  initialMonth?: number     // mes inicial opcional (0–11)
}

export default function CalendarView({
  initialYear,
  initialMonth,
}: CalendarViewProps) {
  // Creamos un objeto Date con la fecha y hora actuales
  // para luego comparar y resaltar el día “hoy” en el calendario.
  const today = new Date()

  // Estado para el año a mostrar:
  // - Si se recibe `initialYear`, lo usamos.
  // - Si no, tomamos el año actual (`today.getFullYear()`).
  const [year, setYear] = useState(
    initialYear !== undefined ? initialYear : today.getFullYear()
  )

  // Estado para el mes a mostrar (0=enero … 11=diciembre):
  // - Si se recibe `initialMonth`, lo usamos.
  // - Si no, tomamos el mes actual (`today.getMonth()`).
  const [month, setMonth] = useState(
    initialMonth !== undefined ? initialMonth : today.getMonth()
  )

  // Calcula el índice del primer día del mes en la semana:
  // new Date(year, month, 1) crea la fecha del día 1 del mes,
  // .getDay() devuelve 0=domingo … 6=sábado.
  const firstDay = new Date(year, month, 1).getDay()

  // Calcula cuántos días tiene el mes actual:
  // new Date(year, month+1, 0) «retrocede» al último día del mes en curso,
  // y .getDate() devuelve ese número de día (28–31).
  const totalDays = new Date(year, month + 1, 0).getDate()

  // Creamos un array de `null` de longitud igual a los «huecos» antes
  // del primer día. El ajuste `(firstDay + 6) % 7` convierte domingo=0
  // en «seis huecos» si queremos que la semana empiece en lunes.
  const blanks = Array((firstDay + 6) % 7).fill(null)

  // Generamos un array [1, 2, 3, …, totalDays]
  const days = Array.from({ length: totalDays }, (_, i) => i + 1)

  // Combinamos los huecos y los días en un solo array de celdas:
  // - Las primeras posiciones serán `null` (celdas vacías)
  // - Luego los números de día, para iterar y renderizar toda la cuadrícula.
  const cells = [...blanks, ...days]

  // ir al mes anterior
  const prev = () => {
    if (month === 0) {
      setYear(y => y - 1)
      setMonth(11)
    } else {
      setMonth(m => m - 1)
    }
  }
  // ir al mes siguiente
  const next = () => {
    if (month === 11) {
      setYear(y => y + 1)
      setMonth(0)
    } else {
      setMonth(m => m + 1)
    }
  }

  const monthNames = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ]

  return (
    <div className="calendar-grid">
      {/* barra de navegación del calendario */}
      <div className="calendar-nav">
        {/* botón mes anterior */}
        <button onClick={prev} className="nav-btn">
          <ChevronLeft />
        </button>
        {/* muestra mes y año actuales */}
        <span className="nav-label">
          {monthNames[month]} {year}
        </span>
        {/* botón mes siguiente */}
        <button onClick={next} className="nav-btn">
          <ChevronRight />
        </button>
      </div>

      {/* cabeceras de los días de la semana */}
      {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
        <div key={d} className="calendar-header">
          {d}
        </div>
      ))}

      {/* celdas del calendario: vacías o con número de día */}
      {cells.map((day, i) => (
        <div
          key={i}
          className={`calendar-cell ${day ? '' : 'empty'}`}
        >
          {/* si hay día, muestra el número */}
          {day && <div className="cell-number">{day}</div>}
        </div>
      ))}
    </div>
  )
}
