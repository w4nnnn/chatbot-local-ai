"use client";

import * as React from "react";
import { type ColorTheme, COLOR_THEMES } from "@/lib/db/schema";
import { updateColorTheme } from "@/actions/settings";

interface ColorThemeContextType {
    colorTheme: ColorTheme;
    setColorTheme: (theme: ColorTheme) => Promise<void>;
    themes: readonly ColorTheme[];
}

const ColorThemeContext = React.createContext<ColorThemeContextType | undefined>(undefined);

interface ColorThemeProviderProps {
    children: React.ReactNode;
    initialTheme: ColorTheme;
}

export function ColorThemeProvider({ children, initialTheme }: ColorThemeProviderProps) {
    const [colorTheme, setColorThemeState] = React.useState<ColorTheme>(initialTheme);

    const setColorTheme = React.useCallback(async (theme: ColorTheme) => {
        // Update UI immediately
        setColorThemeState(theme);

        // Update in database
        await updateColorTheme(theme);
    }, []);

    // Apply theme class to html element
    React.useEffect(() => {
        const html = document.documentElement;

        // Remove all theme classes
        COLOR_THEMES.forEach((t) => {
            html.classList.remove(`theme-${t}`);
        });

        // Add current theme class
        html.classList.add(`theme-${colorTheme}`);
    }, [colorTheme]);

    return (
        <ColorThemeContext.Provider value={{ colorTheme, setColorTheme, themes: COLOR_THEMES }}>
            {children}
        </ColorThemeContext.Provider>
    );
}

export function useColorTheme() {
    const context = React.useContext(ColorThemeContext);
    if (!context) {
        throw new Error("useColorTheme must be used within ColorThemeProvider");
    }
    return context;
}
