"use server";

import { db } from "@/lib/db";
import { settings, COLOR_THEMES, type ColorTheme } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const THEME_KEY = "color_theme";
const DEFAULT_THEME: ColorTheme = "violet";

/**
 * Get current color theme from database
 */
export async function getColorTheme(): Promise<ColorTheme> {
    try {
        const result = await db
            .select()
            .from(settings)
            .where(eq(settings.key, THEME_KEY))
            .limit(1);

        if (result.length > 0) {
            const value = result[0].value as ColorTheme;
            if (COLOR_THEMES.includes(value)) {
                return value;
            }
        }

        return DEFAULT_THEME;
    } catch (error) {
        console.error("[getColorTheme] Error:", error);
        return DEFAULT_THEME;
    }
}

/**
 * Update color theme in database
 */
export async function updateColorTheme(theme: ColorTheme): Promise<{ success: boolean; message: string }> {
    try {
        if (!COLOR_THEMES.includes(theme)) {
            return { success: false, message: "Tema tidak valid" };
        }

        // Check if setting exists
        const existing = await db
            .select()
            .from(settings)
            .where(eq(settings.key, THEME_KEY))
            .limit(1);

        if (existing.length > 0) {
            // Update existing
            await db
                .update(settings)
                .set({ value: theme, updatedAt: new Date() })
                .where(eq(settings.key, THEME_KEY));
        } else {
            // Insert new
            await db.insert(settings).values({
                key: THEME_KEY,
                value: theme,
            });
        }

        // Revalidate to ensure fresh data on next request
        revalidatePath("/");

        return { success: true, message: `Tema berhasil diubah ke ${theme}` };
    } catch (error) {
        console.error("[updateColorTheme] Error:", error);
        return { success: false, message: "Gagal mengubah tema" };
    }
}

