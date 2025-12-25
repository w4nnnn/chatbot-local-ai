"use client";

import { Toaster } from "sonner";
import { useColorTheme } from "./theme-provider";
import type { ColorTheme } from "@/lib/db/schema";

// Style colors menggunakan oklch dari Tailwind v4 CSS variables
const toasterStyles: Record<ColorTheme, { border: string; color: string; shadow: string }> = {
    violet: {
        border: "1px solid oklch(0.894 0.057 293.283)", // violet-200
        color: "oklch(0.606 0.25 292.717)", // violet-500
        shadow: "0 10px 25px -5px oklch(0.606 0.25 292.717 / 0.15)",
    },
    blue: {
        border: "1px solid oklch(0.882 0.059 254.128)", // blue-200
        color: "oklch(0.623 0.214 259.815)", // blue-500
        shadow: "0 10px 25px -5px oklch(0.623 0.214 259.815 / 0.15)",
    },
    emerald: {
        border: "1px solid oklch(0.905 0.093 164.15)", // emerald-200
        color: "oklch(0.696 0.17 162.48)", // emerald-500
        shadow: "0 10px 25px -5px oklch(0.696 0.17 162.48 / 0.15)",
    },
    rose: {
        border: "1px solid oklch(0.892 0.058 10.001)", // rose-200
        color: "oklch(0.645 0.246 16.439)", // rose-500
        shadow: "0 10px 25px -5px oklch(0.645 0.246 16.439 / 0.15)",
    },
    amber: {
        border: "1px solid oklch(0.924 0.12 95.746)", // amber-200
        color: "oklch(0.769 0.188 70.08)", // amber-500
        shadow: "0 10px 25px -5px oklch(0.769 0.188 70.08 / 0.15)",
    },
};

export function ThemedToaster() {
    const { colorTheme } = useColorTheme();
    const style = toasterStyles[colorTheme];

    return (
        <Toaster
            theme="light"
            position="top-center"
            toastOptions={{
                style: {
                    background: "white",
                    border: style.border,
                    color: style.color,
                    boxShadow: style.shadow,
                },
            }}
        />
    );
}
