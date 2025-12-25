"use client";

import * as React from "react";
import { Sidebar, type MenuType } from "./sidebar";

interface MainLayoutProps {
    children: React.ReactNode;
    activeMenu: MenuType;
    onMenuChange: (menu: MenuType) => void;
}

export function MainLayout({ children, activeMenu, onMenuChange }: MainLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
            <Sidebar
                activeMenu={activeMenu}
                onMenuChange={onMenuChange}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Main Content */}
            <main className="md:ml-64 min-h-screen">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
