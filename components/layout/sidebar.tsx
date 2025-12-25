"use client";

import { MessageSquare, Upload, Bot, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/theme-selector";
import { cn } from "@/lib/utils";

export type MenuType = "chat" | "upload";

interface MenuItem {
    id: MenuType;
    label: string;
    icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
    {
        id: "chat",
        label: "Chatbot",
        icon: <MessageSquare className="h-5 w-5" />,
    },
    {
        id: "upload",
        label: "Upload Data",
        icon: <Upload className="h-5 w-5" />,
    },
];

interface SidebarProps {
    activeMenu: MenuType;
    onMenuChange: (menu: MenuType) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export function Sidebar({ activeMenu, onMenuChange, isOpen, onToggle }: SidebarProps) {
    return (
        <>
            {/* Mobile Hamburger Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg hover:bg-gray-50 text-gray-700"
                onClick={onToggle}
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 z-40 transition-transform duration-300 shadow-xl",
                    "md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary rounded-xl shadow-lg">
                                <Bot className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">
                                    Local AI Chat
                                </h1>
                                <p className="text-xs text-gray-400">Powered by Ollama</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = activeMenu === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onMenuChange(item.id);
                                        if (window.innerWidth < 768) {
                                            onToggle();
                                        }
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-white shadow-lg"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                    )}
                                >
                                    <span className={cn(
                                        isActive ? "text-white" : "text-gray-400"
                                    )}>
                                        {item.icon}
                                    </span>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}

                        {/* Separator */}
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400 px-4 mb-2">Pengaturan</p>
                            <ThemeSelector />
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100">
                        <p className="text-xs text-gray-300 text-center">
                            © 2024 Local AI Chatbot
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
