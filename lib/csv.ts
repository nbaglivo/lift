import Papa from 'papaparse'
import type { RawRow, Row } from '@/types/routine'

function parsePeso(s: string | null | undefined): string {
  if (s == null) return ''
  const str = String(s).trim()
  if (!str) return ''
  let part = str.split('/')[0].trim()
  // preserve negatives like "-30", skip ranges like "15-20"
  const range = part.match(/^(-?\d+[.,]?\d*)\s*-\s*(\d+[.,]?\d*)$/)
  if (range) part = range[1] ?? part
  return part.trim()
}

export function normalizeRow(r: RawRow): Row {
  return {
    month: r.month || '',
    day: r.day || '',
    block: r.block || '',
    exercise: r.exercise || '',
    week: String(r.week || ''),
    varNote: r['var'] || '',
    pesoRaw: r.peso || '',
    peso: parsePeso(r.peso),
    series: r.series || '',
    reps: r.reps || '',
    dificultad: String(r.dificultad || ''),
    done: false,
  }
}

export const rowKey = (r: Row) => `${r.day}|${r.block}|${r.exercise}|${r.week}`
export const exKey = (r: Row) => `${r.day}|${r.block}|${r.exercise}`

export function parseDay(d: string): { num: string; suffix: string; label: string } {
  const m = d.match(/^D[íIÍ]A\s+(\d+)(?:\s+(.*))?$/i)
  if (!m) return { num: d, suffix: '', label: d }
  return { num: m[1] ?? d, suffix: (m[2] || '').trim(), label: `DÍA ${m[1]}` }
}

export function parseCsv(text: string): Row[] {
  const result = Papa.parse<RawRow>(text, { header: true, skipEmptyLines: true })
  return result.data.map(normalizeRow)
}

export function parseFile(file: File): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data.map(normalizeRow)),
      error: reject,
    })
  })
}

export function exportToCsv(rows: Row[], filename: string): void {
  const out = rows.map((r) => ({
    month: r.month,
    day: r.day,
    block: r.block,
    exercise: r.exercise,
    week: r.week,
    var: r.varNote,
    peso: r.peso,
    series: r.series,
    reps: r.reps,
    dificultad: r.dificultad,
  }))
  const csv = Papa.unparse(out)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
