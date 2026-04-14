import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull().default(''),
  city: text('city').default(''),
  domain: text('domain').default('engineering'),
  college: text('college').default(''),
  specialization: text('specialization').default(''),
  dreamCompany: text('dream_company').default(''),
  score: integer('score').default(0),
  tasksDone: integer('tasks_done').default(0),
  streak: integer('streak').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
