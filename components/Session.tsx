'use client'

import { useMemo, useRef } from 'react'
import { exKey } from '@/lib/csv'
import type { DayInfo, HistoryEntry, Row } from '@/types/routine'
import { Block } from './Block'
import { Selectors } from './Selectors'

const BLOCK_ORDER = ['EEC', 'A', 'B', 'C', 'MOVILIDAD']

interface SessionProps {
  rows: Row[]
  month: string
  days: DayInfo[]
  weeks: string[]
  day: string | null
  week: string | null
  onDay: (day: string) => void
  onWeek: (week: string) => void
  openEx: string | null
  onToggleEx: (key: string) => void
  updateRow: (key: string, patch: Partial<Row>) => void
  onExport: () => void
  onUpload: (file: File) => void
}

export function Session({
  rows,
  month,
  days,
  weeks,
  day,
  week,
  onDay,
  onWeek,
  openEx,
  onToggleEx,
  updateRow,
  onExport,
  onUpload,
}: SessionProps) {
  const importRef = useRef<HTMLInputElement>(null)
  const grouped = useMemo(() => {
    if (!day || !week) return []
    const filt = rows.filter((r) => r.day === day && r.week === week)
    const byBlock = new Map<string, Row[]>()
    BLOCK_ORDER.forEach((b) => byBlock.set(b, []))
    filt.forEach((r) => {
      if (!byBlock.has(r.block)) byBlock.set(r.block, [])
      byBlock.get(r.block)!.push(r)
    })
    return [...byBlock.entries()]
      .filter(([, list]) => list.length > 0)
      .map(([code, list]) => ({ code, list }))
  }, [rows, day, week])

  const history = useMemo(() => {
    const m = new Map<string, HistoryEntry[]>()
    rows.forEach((r) => {
      const k = exKey(r)
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push({ week: r.week, peso: r.peso, dificultad: r.dificultad, done: r.done })
    })
    m.forEach((list) => list.sort((a: HistoryEntry, b: HistoryEntry) => parseInt(a.week) - parseInt(b.week)))
    return m
  }, [rows])

  const totalEx = grouped.reduce((n, b) => n + b.list.length, 0)
  const doneEx = grouped.reduce((n, b) => n + b.list.filter((r) => r.done).length, 0)
  const dayInfo = days.find((d) => d.id === day)

  return (
    <div className="page">
      <header className="mast">
        <div className="title">
          Bitácora <em>· {month}</em>
        </div>
        <div className="meta progress-tally">
          <b>{String(doneEx).padStart(2, '0')}</b>&thinsp;/&thinsp;{String(totalEx).padStart(2, '0')}
        </div>
      </header>

      <Selectors days={days} weeks={weeks} day={day} week={week} onDay={onDay} onWeek={onWeek} />

      {dayInfo?.suffix && (
        <div className="lbl" style={{ paddingTop: 14, color: 'var(--ink-2)' }}>
          Sesión · {dayInfo.suffix}
        </div>
      )}

      {grouped.map(({ code, list }) => (
        <Block
          key={code}
          code={code}
          rows={list}
          openEx={openEx}
          onToggleEx={onToggleEx}
          updateRow={updateRow}
          history={history}
          currentWeek={week ?? '1'}
        />
      ))}

      <footer className="footer">
        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <button className="link" onClick={onExport}>
            Export this routine
          </button>
          <button className="link" onClick={() => importRef.current?.click()}>
            Import new routine
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onUpload(f)
              e.target.value = ''
            }}
          />
        </div>
        <div className="small">edits saved automatically</div>
      </footer>
    </div>
  )
}
