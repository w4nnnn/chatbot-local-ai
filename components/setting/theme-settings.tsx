"use client";

import { Check, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useColorTheme } from "./theme-provider";
import { cn } from "@/lib/utils";
import type { ColorTheme } from "@/lib/db/schema";

const themeColors: Record<ColorTheme, { name: string; gradient: string }> = {
    violet: { name: "Violet", gradient: "from-violet-500 to-indigo-600" },
    blue: { name: "Blue", gradient: "from-blue-500 to-cyan-600" },
    emerald: { name: "Emerald", gradient: "from-emerald-500 to-teal-600" },
    rose: { name: "Rose", gradient: "from-rose-500 to-pink-600" },
    amber: { name: "Amber", gradient: "from-amber-500 to-orange-600" },
};

export function ThemeSettings() {
    const { colorTheme, setColorTheme, themes } = useColorTheme();

    return (
        <Card className="bg-white/80 backdrop-blur-lg border-gray-200 shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Tema Warna</CardTitle>
                </div>
                <CardDescription>Pilih tema warna untuk aplikasi</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {themes.map((theme) => {
                        const isActive = colorTheme === theme;
                        const config = themeColors[theme];
                        return (
                            <button
                                key={theme}
                                onClick={() => setColorTheme(theme)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                    isActive
                                        ? "border-primary bg-primary/5"
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br shadow-md", config.gradient)} />
                                <span className={cn("text-sm", isActive ? "font-medium text-primary" : "text-gray-600")}>
                                    {config.name}
                                </span>
                                {isActive && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
