'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { exportToCsv, parseCsv, parseDay, parseFile, rowKey } from '@/lib/csv'
import { clearState, loadState, saveState } from '@/lib/storage'
import { getUserId } from '@/lib/identity'
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

  const uid = getUserId()

  // Load: DB is authoritative; migrate from localStorage if DB is empty
  useEffect(() => {
    getRoutine(uid).then((dbRows) => {
      if (dbRows.length > 0) {
        const stored = loadState()
        setRows(dbRows)
        setDay(stored?.day ?? dbRows[0]?.day ?? null)
        setWeek(stored?.week ?? '1')
        return
      }

      // DB empty — migrate from localStorage if available
      const stored = loadState()
      if (stored?.rows.length) {
        setRows(stored.rows)
        setDay(stored.day)
        setWeek(stored.week ?? '1')
        replaceRoutine(uid, stored.rows).catch(console.error)
        return
      }

      // Nothing anywhere — seed with sample
      const norm = parseCsv(SAMPLE_CSV)
      setRows(norm)
      setDay(norm[0]?.day ?? null)
      setWeek('1')
      replaceRoutine(uid, norm).catch(console.error)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep localStorage cache in sync for offline fallback
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
    const syncPatch = {
      ...(patch.peso !== undefined ? { peso: patch.peso } : {}),
      ...(patch.dificultad !== undefined ? { dificultad: patch.dificultad } : {}),
      ...(patch.done !== undefined ? { done: patch.done } : {}),
    } as Pick<Row, 'peso' | 'dificultad' | 'done'>
    if (Object.keys(syncPatch).length > 0) {
      updateRowFields(uid, key, syncPatch).catch(console.error)
    }
  }, [uid])

  const handleUpload = useCallback(async (file: File) => {
    const norm = await parseFile(file)
    setRows(norm)
    setDay(norm[0]?.day ?? null)
    setWeek('1')
    replaceRoutine(uid, norm).catch(console.error)
  }, [uid])

  const handleLoadSample = useCallback(() => {
    const norm = parseCsv(SAMPLE_CSV)
    setRows(norm)
    setDay(norm[0]?.day ?? null)
    setWeek('1')
    replaceRoutine(uid, norm).catch(console.error)
  }, [uid])

  const handleExport = useCallback(() => {
    if (!rows?.length) return
    const slug = (month || 'routine').replace(/\s+/g, '-').toLowerCase()
    exportToCsv(rows, `${slug}.csv`)
  }, [rows, month])

  const handleToggleExByExKey = useCallback(
    (ek: string) => setOpenEx((prev) => (prev === ek ? null : ek)),
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
