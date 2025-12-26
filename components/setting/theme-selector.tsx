"use client";

import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useColorTheme } from "./theme-provider";
import { cn } from "@/lib/utils";
import type { ColorTheme } from "@/lib/db/schema";

const themeColors: Record<ColorTheme, { name: string; color: string; gradient: string }> = {
    violet: {
        name: "Violet",
        color: "bg-violet-500",
        gradient: "from-violet-500 to-indigo-600",
    },
    blue: {
        name: "Blue",
        color: "bg-blue-500",
        gradient: "from-blue-500 to-cyan-600",
    },
    emerald: {
        name: "Emerald",
        color: "bg-emerald-500",
        gradient: "from-emerald-500 to-teal-600",
    },
    rose: {
        name: "Rose",
        color: "bg-rose-500",
        gradient: "from-rose-500 to-pink-600",
    },
    amber: {
        name: "Amber",
        color: "bg-amber-500",
        gradient: "from-amber-500 to-orange-600",
    },
};

export function ThemeSelector() {
    const { colorTheme, setColorTheme, themes } = useColorTheme();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                    <div className={cn("w-4 h-4 rounded-full bg-gradient-to-br", themeColors[colorTheme].gradient)} />
                    <Palette className="h-4 w-4" />
                    <span className="text-xs">Tema Warna</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start" side="top">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 px-2 pb-1">Pilih Tema</p>
                    {themes.map((theme) => {
                        const isActive = colorTheme === theme;
                        const config = themeColors[theme];
                        return (
                            <button
                                key={theme}
                                onClick={() => setColorTheme(theme)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors",
                                    isActive ? "bg-gray-100" : "hover:bg-gray-50"
                                )}
                            >
                                <div className={cn("w-5 h-5 rounded-full bg-gradient-to-br shadow-sm", config.gradient)} />
                                <span className={cn("text-sm flex-1 text-left", isActive ? "font-medium text-gray-800" : "text-gray-600")}>
                                    {config.name}
                                </span>
                                {isActive && <Check className="h-4 w-4 text-gray-600" />}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
