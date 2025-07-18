// src/components/CellActivities/CellActivities.tsx
import { useState, useEffect } from 'react'
import { API_BASE, type DailyActivityRecord, ACTIVITY_COLOR_MAP } from '../../DailyActivity/DailyActivity'
import { FaStar } from 'react-icons/fa'
import './CellActivities.css'

interface CellActivitiesProps {
  date: string   // 'YYYY-MM-DD'
  refreshKey?: number
}

// helpers para manejar canales alfa
function normalizeHex(rawHex: string): string {
  let hex = rawHex.replace('#', '')
  if (hex.length === 8) hex = hex.slice(0, 6)
  return `#${hex}`
}

// claridad
function lightenColor(rawHex: string, amount = 0.2): string {
  const hex = normalizeHex(rawHex)
  const num = parseInt(hex.slice(1), 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff

  r = Math.min(255, Math.floor(r + (255 - r) * amount))
  g = Math.min(255, Math.floor(g + (255 - g) * amount))
  b = Math.min(255, Math.floor(b + (255 - b) * amount))

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}`
}

// saturación: hex → rgb → hsl → aumenta S → rgb → hex
function hexToRgb(rawHex: string) {
  const hex = normalizeHex(rawHex).slice(1)
  const num = parseInt(hex, 16)
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  }
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  const d = max - min
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break
      case g: h = ((b - r) / d + 2); break
      case b: h = ((r - g) / d + 4); break
    }
    h *= 60
  }
  return [h, s, l] as const
}
function hslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r1 = 0, g1 = 0, b1 = 0
  if (h < 60)       [r1, g1, b1] = [c, x, 0]
  else if (h < 120) [r1, g1, b1] = [x, c, 0]
  else if (h < 180) [r1, g1, b1] = [0, c, x]
  else if (h < 240) [r1, g1, b1] = [0, x, c]
  else if (h < 300) [r1, g1, b1] = [x, 0, c]
  else              [r1, g1, b1] = [c, 0, x]
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ]
}
function rgbToHex(r: number, g: number, b: number) {
  const to2 = (v: number) => v.toString(16).padStart(2, '0')
  return `#${to2(r)}${to2(g)}${to2(b)}`
}

function saturateColor(rawHex: string, amount = 0.2): string {
  const { r, g, b } = hexToRgb(rawHex)
  let [h, s, l] = rgbToHsl(r, g, b)
  s = Math.min(1, s + amount)
  const [r2, g2, b2] = hslToRgb(h, s, l)
  return rgbToHex(r2, g2, b2)
}

export default function CellActivities({ date, refreshKey }: CellActivitiesProps) {
  const [activities, setActivities] = useState<DailyActivityRecord[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/daily_activities?date=${date}`)
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar actividades')
        return res.json()
      })
      .then((data: DailyActivityRecord[]) => setActivities(data))
      .catch(() => setActivities([]))
  }, [date, refreshKey])

  if (activities.length === 0) return null

  const toShow = activities.slice(0, 4)

  // constantes para ajustar manualmente
  const SATURATION_AMOUNT = 1  // e.g. +30% saturación
  const LIGHTEN_AMOUNT    = 0.3  // e.g. +20% claridad

  return (
    <div className="cell-activities">
      {toShow.map(act => {
        const bg = ACTIVITY_COLOR_MAP[act.categoria] || '#999'
        // primero saturar, luego aclarar para texto más vivo
        const vivid = saturateColor(bg, SATURATION_AMOUNT)
        const textColor = lightenColor(vivid, LIGHTEN_AMOUNT)

        return (
          <div
            key={act.id}
            className="activity-pill"
            style={{
              backgroundColor: bg,
              color: textColor,
              '--pill-bg': bg,
              '--pill-text': textColor
            } as React.CSSProperties}
          >
            <FaStar className="pill-icon" />
            <span className="pill-label">
              {act.categoria}
            </span>
          </div>
        )
      })}

      {activities.length > toShow.length && (
        <div
          className="activity-pill more-pill"
          style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: '#000',
            width: '100%',
            '--pill-bg': 'rgba(0,0,0,0.2)',
            '--pill-text': '#000'
          } as React.CSSProperties}
        >
          +{activities.length - toShow.length}
        </div>
      )}
    </div>
  )
}
