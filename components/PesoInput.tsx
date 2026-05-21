interface PesoInputProps {
  value: string
  isBodyweight: boolean
  onChange: (v: string) => void
}

export function PesoInput({ value, isBodyweight, onChange }: PesoInputProps) {
  return (
    <div className="peso-field">
      <span className="lbl">Peso</span>
      <div className="peso-input-wrap">
        <input
          type="text"
          inputMode="decimal"
          className="peso-input num-tab"
          value={value || ''}
          placeholder={isBodyweight ? '—' : '0'}
          onChange={(e) => {
            const v = e.target.value.replace(/[^\d.,\-/]/g, '')
            onChange(v)
          }}
        />
        <span className="peso-unit">kg</span>
      </div>
    </div>
  )
}
