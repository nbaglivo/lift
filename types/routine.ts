export interface RawRow {
  month: string
  day: string
  block: string
  exercise: string
  week: string
  var?: string
  peso?: string
  series: string
  reps: string
  dificultad?: string
}

export interface Row {
  month: string
  day: string
  block: string
  exercise: string
  week: string
  varNote: string
  pesoRaw: string
  peso: string
  series: string
  reps: string
  dificultad: string
  done: boolean
}

export interface DayInfo {
  id: string
  num: string
  suffix: string
  label: string
}

export interface HistoryEntry {
  week: string
  peso: string
  dificultad: string
  done: boolean
}

export interface StoredState {
  rows: Row[]
  day: string | null
  week: string | null
}
