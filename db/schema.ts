import { boolean, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const routineRows = pgTable(
  'routine_rows',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    rowKey: text('row_key').notNull(),
    month: text('month').notNull().default(''),
    day: text('day').notNull().default(''),
    block: text('block').notNull().default(''),
    exercise: text('exercise').notNull().default(''),
    week: text('week').notNull().default(''),
    varNote: text('var_note').notNull().default(''),
    pesoRaw: text('peso_raw').notNull().default(''),
    series: text('series').notNull().default(''),
    reps: text('reps').notNull().default(''),
    peso: text('peso').notNull().default(''),
    dificultad: text('dificultad').notNull().default(''),
    done: boolean('done').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('user_row_key').on(t.userId, t.rowKey)],
)
