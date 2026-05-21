'use client'

import { useRef, useState } from 'react'

interface EmptyStateProps {
  onUpload: (file: File) => void
  onSample: () => void
}

export function EmptyState({ onUpload, onSample }: EmptyStateProps) {
  const [over, setOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onUpload(f)
  }

  return (
    <div className="page">
      <div className="empty">
        <div className="prompt">A blank page. Bring last month&apos;s routine.</div>

        <div
          className={`drop ${over ? 'is-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <div className="glyph">+</div>
          <div className="lbl">Drop a CSV — or tap to choose</div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onUpload(f)
            }}
          />
          <div className="or">or</div>
          <button
            className="sample"
            onClick={(e) => { e.stopPropagation(); onSample() }}
          >
            Load the sample routine
          </button>
        </div>

        <div className="colophon">Bitácora · Fito-Lift</div>
      </div>
    </div>
  )
}
