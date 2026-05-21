'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { exKey, exportToCsv, parseCsv, parseDay, parseFile, rowKey } from '@/lib/csv'
import { clearState, loadState, saveState } from '@/lib/storage'
import { SAMPLE_CSV } from '@/data/sampleRoutine'
import type { DayInfo, Row } from '@/types/routine'
import { EmptyState } from './EmptyState'
import { Session } from './Session'

export function FitoLiftApp() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [day, setDay] = useState<string | null>(null)
  const [week, setWeek] = useState<string | null>(null)
  const [openEx, setOpenEx] = useState<string | null>(null)

  useEffect(() => {
    const stored = loadState()
    if (stored) {
      setRows(stored.rows)
      setDay(stored.day)
      setWeek(stored.week ?? '1')
      return
    }
    const norm = parseCsv(SAMPLE_CSV)
    setRows(norm)
    setDay(norm[0]?.day ?? null)
    setWeek('1')
  }, [])

  useEffect(() => {
    if (rows === null) return
    saveState({ rows, day, week })
  }, [rows, day, week])

  const days = useMemo<DayInfo[]>(() => {
    if (!rows?.length) return []
    const m = new Map<string, DayInfo>()
    rows.forEach((r) => {
      if (!m.has(r.day)) {
        const p = parseDay(r.day)
        m.set(r.day, { id: r.day, ...p })
      }
    })
    return [...m.values()].sort((a, b) => parseInt(a.num) - parseInt(b.num))
  }, [rows])

  const weeks = useMemo<string[]>(() => {
    if (!rows?.length) return []
    return [...new Set(rows.map((r) => r.week))].sort(
      (a, b) => parseInt(a) - parseInt(b),
    )
  }, [rows])

  const month = rows?.[0]?.month ?? ''

  const updateRow = useCallback((key: string, patch: Partial<Row>) => {
    setRows((prev) => prev?.map((r) => (rowKey(r) === key ? { ...r, ...patch } : r)) ?? null)
  }, [])

  const handleUpload = useCallback(async (file: File) => {
    const norm = await parseFile(file)
    setRows(norm)
    setDay(norm[0]?.day ?? null)
    setWeek('1')
  }, [])

  const handleLoadSample = useCallback(() => {
    const norm = parseCsv(SAMPLE_CSV)
    setRows(norm)
    setDay(norm[0]?.day ?? null)
    setWeek('1')
  }, [])

  const handleReset = useCallback(() => {
    if (!confirm('Reset all logged data and return to the empty state?')) return
    clearState()
    setRows([])
    setDay(null)
    setWeek(null)
  }, [])

  const handleExport = useCallback(() => {
    if (!rows?.length) return
    const slug = (month || 'routine').replace(/\s+/g, '-').toLowerCase()
    exportToCsv(rows, `${slug}.csv`)
  }, [rows, month])

  const handleToggleEx = useCallback(
    (key: string | null) => {
      setOpenEx((prev) => {
        if (key === null) return null
        return prev === key ? null : key
      })
    },
    [],
  )

  // group-aware toggle: uses exKey, not rowKey
  const handleToggleExByExKey = useCallback(
    (ek: string) => {
      setOpenEx((prev) => (prev === ek ? null : ek))
    },
    [],
  )

  if (rows === null) return <div className="page" />

  if (!rows.length) {
    return <EmptyState onUpload={handleUpload} onSample={handleLoadSample} />
  }

  return (
    <Session
      rows={rows}
      month={month}
      days={days}
      weeks={weeks}
      day={day}
      week={week}
      onDay={setDay}
      onWeek={setWeek}
      openEx={openEx}
      onToggleEx={handleToggleExByExKey}
      updateRow={updateRow}
      onExport={handleExport}
      onUpload={handleUpload}
    />
  )
}
