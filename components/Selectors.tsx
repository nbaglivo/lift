'use client'

import { useEffect, useState } from 'react'
import type { DayInfo } from '@/types/routine'

interface SelectorsProps {
  days: DayInfo[]
  weeks: string[]
  day: string | null
  week: string | null
  onDay: (day: string) => void
  onWeek: (week: string) => void
}

export function Selectors({ days, weeks, day, week, onDay, onWeek }: SelectorsProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeDaySuffix = days.find((d) => d.id === day)?.suffix

  return (
    <div className={`selectors${scrolled ? ' scrolled' : ''}`}>
      <div className="sel-row">
        <div className="sel-key">Día</div>
        <div className="sel-vals">
          {days.map((d) => (
            <button
              key={d.id}
              className={`sel-btn${d.id === day ? ' is-active' : ''}`}
              onClick={() => onDay(d.id)}
            >
              {d.num}
            </button>
          ))}
          {activeDaySuffix && <span className="sel-suffix">{activeDaySuffix}</span>}
        </div>
      </div>
      <div className="sel-row">
        <div className="sel-key">Semana</div>
        <div className="sel-vals">
          {weeks.map((w) => (
            <button
              key={w}
              className={`sel-btn${w === week ? ' is-active' : ''}`}
              onClick={() => onWeek(w)}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
