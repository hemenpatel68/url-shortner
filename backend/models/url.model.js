import { uuid, pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { usersTable } from "./user.model.js";

export const urlsTable = pgTable("urls", {
  id: uuid("id").primaryKey().defaultRandom(),

  shortCode: varchar("short_code", { length: 155 }).notNull().unique(),

  targetURL: text("target_url").notNull(),

  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
