import { rowKey } from '@/lib/csv'
import type { HistoryEntry, Row } from '@/types/routine'
import { DificultadSelector } from './DificultadSelector'
import { PesoInput } from './PesoInput'

interface ExerciseRowProps {
  row: Row
  isOpen: boolean
  onToggle: () => void
  updateRow: (key: string, patch: Partial<Row>) => void
  history: HistoryEntry[]
  currentWeek: string
}

export function ExerciseRow({ row, isOpen, onToggle, updateRow, history, currentWeek }: ExerciseRowProps) {
  const k = rowKey(row)
  const isBodyweight = !row.peso && !row.pesoRaw

  return (
    <div className={`ex${row.done ? ' is-done' : ''}${isOpen ? ' is-open' : ''}`}>
      <div className="ex-hd">
        <button
          type="button"
          className="ex-check"
          aria-label={row.done ? 'Marcar como no hecho' : 'Marcar como hecho'}
          onClick={(e) => { e.stopPropagation(); updateRow(k, { done: !row.done }) }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8.5L6.5 12L13 4.5" />
          </svg>
        </button>

        <div className="ex-name-wrap" onClick={onToggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onToggle()}>
          <span className="ex-name">{row.exercise}</span>
          {row.varNote && (
            <span className="ex-var">— {row.varNote === 'i' ? 'nuevo' : row.varNote}</span>
          )}
          <div className="ex-sub">
            <span className="num-tab">{row.series} × {row.reps}</span>
            {row.pesoRaw && row.pesoRaw !== row.peso && (
              <>
                <span className="dot">·</span>
                <span className="num-tab" title="Prescribed">plan {row.pesoRaw}</span>
              </>
            )}
          </div>
        </div>

        <div className="ex-expand" onClick={onToggle} aria-hidden="true">
          {isOpen ? '—' : '+'}
        </div>
      </div>

      {isOpen && history.length > 0 && (
        <div className="wstrip">
          {history.map((h) => (
            <span key={h.week} className={`w${h.week === currentWeek ? ' is-current' : ''}`}>
              <span className="k">W{h.week}</span>
              <span className={`v${!h.peso ? ' empty' : ''}`}>{h.peso || '—'}</span>
              {h.dificultad && (
                <span className="k" style={{ opacity: 0.7 }}>·{h.dificultad}</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="ex-body">
        <PesoInput
          value={row.peso}
          isBodyweight={isBodyweight}
          onChange={(v) => updateRow(k, { peso: v })}
        />
        <DificultadSelector
          value={row.dificultad}
          onChange={(v) => updateRow(k, { dificultad: v })}
        />
      </div>
    </div>
  )
}
