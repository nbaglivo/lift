'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { exKey, exportToCsv, parseCsv, parseDay, parseFile, rowKey } from '@/lib/csv'
import { clearState, loadState, saveState } from '@/lib/storage'
import { getDeviceId } from '@/lib/identity'
import { SAMPLE_CSV } from '@/data/sampleRoutine'
import {
  clearRoutine,
  getRoutine,
  replaceRoutine,
  updateRowFields,
} from '@/app/actions'
import type { DayInfo, Row } from '@/types/routine'
import { EmptyState } from './EmptyState'
import { Session } from './Session'

export function FitoLiftApp() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [day, setDay] = useState<string | null>(null)
  const [week, setWeek] = useState<string | null>(null)
  const [openEx, setOpenEx] = useState<string | null>(null)
  const deviceId = useRef<string | null>(null)

  // Load: DB is authoritative; migrate from localStorage if DB is empty
  useEffect(() => {
    const id = getDeviceId()
    deviceId.current = id

    getRoutine(id).then((dbRows) => {
      if (dbRows.length > 0) {
        // DB has data — use it as source of truth
        const stored = loadState()
        setRows(dbRows)
        setDay(stored?.day ?? dbRows[0]?.day ?? null)
        setWeek(stored?.week ?? '1')
        saveState({ rows: dbRows, day: stored?.day ?? dbRows[0]?.day ?? null, week: stored?.week ?? '1' })
        return
      }

      // DB is empty — check localStorage for existing data to migrate
      const stored = loadState()
      if (stored?.rows.length) {
        setRows(stored.rows)
        setDay(stored.day)
        setWeek(stored.week ?? '1')
        replaceRoutine(id, stored.rows).catch(console.error)
        return
      }

      // Nothing anywhere — load the sample
      const norm = parseCsv(SAMPLE_CSV)
      setRows(norm)
      setDay(norm[0]?.day ?? null)
      setWeek('1')
      replaceRoutine(id, norm).catch(console.error)
    }).catch(() => {
      // DB unreachable — fall back to localStorage
      const stored = loadState()
      if (stored?.rows.length) {
        setRows(stored.rows)
        setDay(stored.day)
        setWeek(stored.week ?? '1')
      } else {
        const norm = parseCsv(SAMPLE_CSV)
        setRows(norm)
        setDay(norm[0]?.day ?? null)
        setWeek('1')
      }
    })
  }, [])

  // Keep localStorage cache in sync
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

  // rowsRef lets updateRow fire server actions without stale-closure issues
  const rowsRef = useRef<Row[] | null>(null)
  rowsRef.current = rows

  const updateRow = useCallback((key: string, patch: Partial<Row>) => {
    setRows((prev) => prev?.map((r) => (rowKey(r) === key ? { ...r, ...patch } : r)) ?? null)
    if (deviceId.current) {
      const syncPatch = {
        ...(patch.peso !== undefined ? { peso: patch.peso } : {}),
        ...(patch.dificultad !== undefined ? { dificultad: patch.dificultad } : {}),
        ...(patch.done !== undefined ? { done: patch.done } : {}),
      } as Pick<Row, 'peso' | 'dificultad' | 'done'>
      if (Object.keys(syncPatch).length > 0) {
        updateRowFields(deviceId.current, key, syncPatch).catch(console.error)
      }
    }
  }, [])

  const handleUpload = useCallback(async (file: File) => {
    const norm = await parseFile(file)
    setRows(norm)
    setDay(norm[0]?.day ?? null)
    setWeek('1')
    if (deviceId.current) replaceRoutine(deviceId.current, norm).catch(console.error)
  }, [])

  const handleLoadSample = useCallback(() => {
    const norm = parseCsv(SAMPLE_CSV)
    setRows(norm)
    setDay(norm[0]?.day ?? null)
    setWeek('1')
    if (deviceId.current) replaceRoutine(deviceId.current, norm).catch(console.error)
  }, [])

  const handleReset = useCallback(() => {
    if (!confirm('Reset all logged data and return to the empty state?')) return
    clearState()
    setRows([])
    setDay(null)
    setWeek(null)
    if (deviceId.current) clearRoutine(deviceId.current).catch(console.error)
  }, [])

  const handleExport = useCallback(() => {
    if (!rows?.length) return
    const slug = (month || 'routine').replace(/\s+/g, '-').toLowerCase()
    exportToCsv(rows, `${slug}.csv`)
  }, [rows, month])

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
