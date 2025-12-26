"use server";

import { db } from "@/lib/db";
import { settings, COLOR_THEMES, type ColorTheme } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const THEME_KEY = "color_theme";
const DEFAULT_THEME: ColorTheme = "violet";

// Branding settings keys
const BRANDING_ICON_KEY = "brand_icon";
const BRANDING_ICON_TYPE_KEY = "brand_icon_type";
const BRANDING_TITLE_KEY = "brand_title";

export type IconType = "lucide" | "image";

export interface BrandingSettings {
    icon: string;
    iconType: IconType;
    title: string;
}

const DEFAULT_BRANDING: BrandingSettings = {
    icon: "Bot",
    iconType: "lucide",
    title: "Local AI Chat",
};

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

/**
 * Get sidebar branding settings
 */
export async function getSidebarBranding(): Promise<BrandingSettings> {
    try {
        const results = await db
            .select()
            .from(settings)
            .where(eq(settings.key, BRANDING_ICON_KEY));

        const iconResult = results.find((s) => s.key === BRANDING_ICON_KEY);

        const iconTypeResults = await db
            .select()
            .from(settings)
            .where(eq(settings.key, BRANDING_ICON_TYPE_KEY));
        const iconTypeResult = iconTypeResults[0];

        const titleResults = await db
            .select()
            .from(settings)
            .where(eq(settings.key, BRANDING_TITLE_KEY));
        const titleResult = titleResults[0];

        return {
            icon: iconResult?.value || DEFAULT_BRANDING.icon,
            iconType: (iconTypeResult?.value as IconType) || DEFAULT_BRANDING.iconType,
            title: titleResult?.value || DEFAULT_BRANDING.title,
        };
    } catch (error) {
        console.error("[getSidebarBranding] Error:", error);
        return DEFAULT_BRANDING;
    }
}

/**
 * Update sidebar branding settings
 */
export async function updateSidebarBranding(
    branding: BrandingSettings
): Promise<{ success: boolean; message: string }> {
    try {
        const updates = [
            { key: BRANDING_ICON_KEY, value: branding.icon },
            { key: BRANDING_ICON_TYPE_KEY, value: branding.iconType },
            { key: BRANDING_TITLE_KEY, value: branding.title },
        ];

        for (const update of updates) {
            const existing = await db
                .select()
                .from(settings)
                .where(eq(settings.key, update.key))
                .limit(1);

            if (existing.length > 0) {
                await db
                    .update(settings)
                    .set({ value: update.value, updatedAt: new Date() })
                    .where(eq(settings.key, update.key));
            } else {
                await db.insert(settings).values({
                    key: update.key,
                    value: update.value,
                });
            }
        }

        revalidatePath("/");

        return { success: true, message: "Branding berhasil diperbarui" };
    } catch (error) {
        console.error("[updateSidebarBranding] Error:", error);
        return { success: false, message: "Gagal memperbarui branding" };
    }
}

