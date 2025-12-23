import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const uploadedFiles = sqliteTable("uploaded_files", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    fileType: text("file_type").notNull(), // csv, xlsx, xls
    headers: text("headers", { mode: "json" }).$type<string[]>().notNull(),
    data: text("data", { mode: "json" }).$type<Record<string, unknown>[]>().notNull(),
    rowCount: integer("row_count").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
});

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type NewUploadedFile = typeof uploadedFiles.$inferInsert;
