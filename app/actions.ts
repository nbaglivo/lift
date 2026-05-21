'use server'

import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { routineRows } from '@/db/schema'
import { rowKey } from '@/lib/csv'
import type { Row } from '@/types/routine'

function toRow(r: typeof routineRows.$inferSelect): Row {
  return {
    month: r.month,
    day: r.day,
    block: r.block,
    exercise: r.exercise,
    week: r.week,
    varNote: r.varNote,
    pesoRaw: r.pesoRaw,
    peso: r.peso,
    series: r.series,
    reps: r.reps,
    dificultad: r.dificultad,
    done: r.done,
  }
}

export async function getRoutine(userId: string): Promise<Row[]> {
  const rows = await db
    .select()
    .from(routineRows)
    .where(eq(routineRows.userId, userId))
  return rows.map(toRow)
}

export async function updateRowFields(
  userId: string,
  rKey: string,
  patch: Pick<Row, 'peso' | 'dificultad' | 'done'>,
): Promise<void> {
  await db
    .update(routineRows)
    .set({
      ...(patch.peso !== undefined ? { peso: patch.peso } : {}),
      ...(patch.dificultad !== undefined ? { dificultad: patch.dificultad } : {}),
      ...(patch.done !== undefined ? { done: patch.done } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(routineRows.userId, userId), eq(routineRows.rowKey, rKey)))
}

export async function replaceRoutine(userId: string, rows: Row[]): Promise<void> {
  await db.delete(routineRows).where(eq(routineRows.userId, userId))
  if (!rows.length) return
  await db.insert(routineRows).values(
    rows.map((r) => ({
      userId,
      rowKey: rowKey(r),
      month: r.month,
      day: r.day,
      block: r.block,
      exercise: r.exercise,
      week: r.week,
      varNote: r.varNote,
      pesoRaw: r.pesoRaw,
      series: r.series,
      reps: r.reps,
      peso: r.peso,
      dificultad: r.dificultad,
      done: r.done,
    })),
  )
}

export async function clearRoutine(userId: string): Promise<void> {
  await db.delete(routineRows).where(eq(routineRows.userId, userId))
}
