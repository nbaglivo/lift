import type { StoredState } from '@/types/routine'

const STORAGE_KEY = 'fitolift.v1'

export function loadState(): StoredState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (p && Array.isArray(p.rows)) {
      return { rows: p.rows, day: p.day ?? null, week: p.week ?? '1' }
    }
  } catch {}
  return null
}

export function saveState(state: StoredState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function clearState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
