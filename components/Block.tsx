import { exKey, rowKey } from '@/lib/csv'
import type { HistoryEntry, Row } from '@/types/routine'
import { ExerciseRow } from './ExerciseRow'

interface BlockProps {
  code: string
  rows: Row[]
  openEx: string | null
  onToggleEx: (key: string) => void
  updateRow: (key: string, patch: Partial<Row>) => void
  history: Map<string, HistoryEntry[]>
  currentWeek: string
}

export function Block({ code, rows, openEx, onToggleEx, updateRow, history, currentWeek }: BlockProps) {
  const allDone = rows.length > 0 && rows.every((r) => r.done)

  return (
    <section className={`block${allDone ? ' is-done' : ''}`}>
      <div className="block-hd">
        <span className="code">{code}</span>
        <span className="count">{String(rows.length).padStart(2, '0')}</span>
        <span className="mark">— hecho</span>
      </div>
      {rows.map((r) => (
        <ExerciseRow
          key={rowKey(r)}
          row={r}
          isOpen={openEx === exKey(r)}
          onToggle={() => onToggleEx(exKey(r))}
          updateRow={updateRow}
          history={history.get(exKey(r)) ?? []}
          currentWeek={currentWeek}
        />
      ))}
    </section>
  )
}
