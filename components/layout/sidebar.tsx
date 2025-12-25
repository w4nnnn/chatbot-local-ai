"use client";

import { MessageSquare, Upload, Bot, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
                className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/80 backdrop-blur border border-slate-800"
                onClick={onToggle}
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800 z-40 transition-transform duration-300",
                    "md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                                <Bot className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                                    Local AI Chat
                                </h1>
                                <p className="text-xs text-slate-500">Powered by Ollama</p>
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
                                            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-2 border-blue-500 text-white"
                                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                    )}
                                >
                                    <span className={cn(
                                        isActive ? "text-blue-400" : "text-slate-500"
                                    )}>
                                        {item.icon}
                                    </span>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800">
                        <p className="text-xs text-slate-600 text-center">
                            © 2024 Local AI Chatbot
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
