import { useState } from 'react'
import { FaCalendarAlt, FaTasks } from 'react-icons/fa'
import './App.css'
import Calendar from './components/Calendar/Calendar'
import Task from './components/Tasks/Tasks'
import OnARoll from './components/OnARoll/OnARoll'

// Define las vistas posibles disponibles en la aplicación
type View = 'calendario' | 'tareas'

export default function App() {
  // Estado que controla qué vista se muestra
  const [view, setView] = useState<View>('calendario')
  // Trigger para refrescar racha y celdas de actividad
  const [refreshKey, setRefreshKey] = useState(0)

  // bump() lo pasarás a Calendar para que lo llame cuando cambie DailyActivity
  const bump = () => setRefreshKey(k => k + 1)

  return (
    <div className="App">
      {/* Header */}
      <header className="App-header">
        <h1>Panel de control</h1>
        {/* OnARoll */}
        <OnARoll refreshKey={refreshKey} />
      </header>

      {/* Body: sidebar + contenido según la vista */}
      <div className="App-body">
        <aside className="sidebar">
          <ul>
            <li
              className={view === 'calendario' ? 'active' : ''}
              onClick={() => setView('calendario')}
            >
              <FaCalendarAlt className="icon" />
              <span className="label">Calendario</span>
            </li>
            <li
              className={view === 'tareas' ? 'active' : ''}
              onClick={() => setView('tareas')}
            >
              <FaTasks className="icon" />
              <span className="label">Tareas</span>
            </li>
          </ul>
        </aside>

        <main className="content">
          <div className="placeholder">
            {view === 'calendario' && (
              <Calendar 
                refreshKey={refreshKey}
                onActivityChange={bump}
              />
            )}
            {view === 'tareas'     && <Task />}
          </div>
        </main>
      </div>
    </div>
  )
}
