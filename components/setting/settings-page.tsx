"use client";

import { Settings } from "lucide-react";
import { ThemeSettings } from "./theme-settings";
import { BrandingSettings } from "./branding-settings";

export function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
                    <p className="text-sm text-gray-500">Kelola tampilan dan konfigurasi aplikasi</p>
                </div>
            </div>

            {/* Theme Settings */}
            <ThemeSettings />

            {/* Branding Settings */}
            <BrandingSettings />
        </div>
    );
}
