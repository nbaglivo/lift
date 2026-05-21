interface DificultadSelectorProps {
  value: string
  onChange: (v: string) => void
}

export function DificultadSelector({ value, onChange }: DificultadSelectorProps) {
  return (
    <div className="dif-field">
      <span className="lbl">
        Dificultad <span style={{ opacity: 0.5, marginLeft: 6 }}>· RPE</span>
      </span>
      <div className="dif-row">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const sel = String(value) === String(n)
          const target = n === 7 || n === 8
          return (
            <button
              key={n}
              type="button"
              className={`dif-btn${sel ? ' is-selected' : ''}${target ? ' is-target' : ''}`}
              onClick={() => onChange(sel ? '' : String(n))}
              aria-label={`RPE ${n}`}
              aria-pressed={sel}
            >
              <span className="n">{n}</span>
            </button>
          )
        })}
      </div>
      <div className="dif-scale">
        <span>suave</span>
        <span>al límite</span>
      </div>
    </div>
  )
}
