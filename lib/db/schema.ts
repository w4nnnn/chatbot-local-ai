import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Re-export auth schema tables
export * from "../../auth-schema";

export const uploadedFiles = sqliteTable("uploaded_files", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    fileType: text("file_type").notNull(), // csv, xlsx, xls
    sheetName: text("sheet_name"), // nama sheet untuk file Excel (nullable untuk CSV)
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

// Settings table untuk konfigurasi aplikasi
export const settings = sqliteTable("settings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    key: text("key").notNull().unique(),
    value: text("value").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

// Color theme options
export const COLOR_THEMES = ["violet", "blue", "emerald", "rose", "amber"] as const;
export type ColorTheme = typeof COLOR_THEMES[number];

