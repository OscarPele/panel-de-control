import { useState } from 'react'
import { FaCalendarAlt, FaTasks, FaChartBar } from 'react-icons/fa'
import './App.css'
import Calendar from './components/Calendar/Calendar'
import Task from './components/Tasks/Tasks'

// Define las vistas posibles disponibles en la aplicación
type View = 'calendario' | 'tareas' | 'estadisticas'

export default function App() {
  // Estado que controla qué vista se muestra
  const [view, setView] = useState<View>('calendario')

  return (
    <div className="App">
      {/* Header */}
      <header className="App-header">
        <h1>Panel de control</h1>
      </header>

      {/* Body: sidebar + contenido según la vista */}
      <div className="App-body">
        <aside className="sidebar">
          <ul>
            <li
              className={view === 'calendario' ? 'active' : ''}
              onClick={() => setView('calendario')}  // Cambia a vista Calendario
            >
              <FaCalendarAlt className="icon" />
              <span className="label">Calendario</span>
            </li>
            <li
              className={view === 'tareas' ? 'active' : ''}
              onClick={() => setView('tareas')}      // Cambia a vista Tareas
            >
              <FaTasks className="icon" />
              <span className="label">Tareas</span>
            </li>
            <li
              className={view === 'estadisticas' ? 'active' : ''}
              onClick={() => setView('estadisticas')} // Cambia a vista Estadísticas
            >
              <FaChartBar className="icon" />
              <span className="label">Estadísticas</span>
            </li>
          </ul>
        </aside>

        <main className="content">
          <div className="placeholder">
            {view === 'calendario' && <Calendar/>}
            {view === 'tareas'     && <Task/>}
            {view === 'estadisticas' && <h2>Vista Estadísticas</h2>}
          </div>
        </main>
      </div>
    </div>
  )
}
