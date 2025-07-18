// src/components/CellTasks/CellTasks.tsx
import { Check } from 'lucide-react'
import './CellTasks.css'

export interface TaskRecord {
  id: number
  title: string
  date: string   // 'YYYY-MM-DD'
  completed: boolean
}

interface CellTasksProps {
  tasks: TaskRecord[]
}

export default function CellTasks({ tasks }: CellTasksProps) {
  if (tasks.length === 0) return null

  const toShow = tasks.slice(0, 4)

  return (
    <div className="cell-tasks">
      {toShow.map(task => (
        <div
          key={task.id}
          className={`task-row${task.completed ? ' completed' : ''}`}
        >
        {task.completed
            ? <Check className="task-icon" size={14} />
            : null
        }
          <span className="task-label">{task.title}</span>
        </div>
      ))}

      {tasks.length > toShow.length && (
        <div className="task-row more-row">
          +{tasks.length - toShow.length} tareas
        </div>
      )}
    </div>
  )
}
