"use client";

import { useState } from "react";
import {
    MessageSquare, Upload, Menu, X, Users, Shield, LogOut, Settings, Bot,
    Brain, Cpu, Database, Globe, Layers, Terminal, Code, FileText, Folder, Home,
    Star, Heart, Zap, Rocket, Sparkles, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { useBranding } from "@/components/setting";
import { ProfileDialog } from "@/components/users";
import Image from "next/image";

export type MenuType = "chat" | "upload" | "users" | "permissions" | "settings";

interface MenuItem {
    id: MenuType;
    label: string;
    icon: ReactNode;
}

// Map of Lucide icon names to components
const iconMap: Record<string, ReactNode> = {
    Bot: <Bot className="h-6 w-6 text-white" />,
    MessageSquare: <MessageSquare className="h-6 w-6 text-white" />,
    Sparkles: <Sparkles className="h-6 w-6 text-white" />,
    Zap: <Zap className="h-6 w-6 text-white" />,
    Brain: <Brain className="h-6 w-6 text-white" />,
    Cpu: <Cpu className="h-6 w-6 text-white" />,
    Database: <Database className="h-6 w-6 text-white" />,
    Globe: <Globe className="h-6 w-6 text-white" />,
    Layers: <Layers className="h-6 w-6 text-white" />,
    Terminal: <Terminal className="h-6 w-6 text-white" />,
    Code: <Code className="h-6 w-6 text-white" />,
    FileText: <FileText className="h-6 w-6 text-white" />,
    Folder: <Folder className="h-6 w-6 text-white" />,
    Home: <Home className="h-6 w-6 text-white" />,
    Settings: <Settings className="h-6 w-6 text-white" />,
    Star: <Star className="h-6 w-6 text-white" />,
    Heart: <Heart className="h-6 w-6 text-white" />,
    Rocket: <Rocket className="h-6 w-6 text-white" />,
    Shield: <Shield className="h-6 w-6 text-white" />,
};

// All available menu items - filtering happens based on permissions
const allMenuItems: MenuItem[] = [
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
    {
        id: "users",
        label: "Kelola User",
        icon: <Users className="h-5 w-5" />,
    },
    {
        id: "permissions",
        label: "Role & Permission",
        icon: <Shield className="h-5 w-5" />,
    },
    {
        id: "settings",
        label: "Pengaturan",
        icon: <Settings className="h-5 w-5" />,
    },
];

interface SidebarProps {
    activeMenu: MenuType;
    onMenuChange: (menu: MenuType) => void;
    isOpen: boolean;
    onToggle: () => void;
    accessibleMenus?: string[];
    userName?: string;
    userRole?: string;
}

export function Sidebar({
    activeMenu,
    onMenuChange,
    isOpen,
    onToggle,
    accessibleMenus = ["chat"],
    userName,
    userRole,
}: SidebarProps) {
    const router = useRouter();
    const { branding } = useBranding();
    const [showProfileDialog, setShowProfileDialog] = useState(false);

    // Filter menu items based on accessible menus
    const menuItems = allMenuItems.filter((item) => accessibleMenus.includes(item.id));

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
        router.refresh();
    };

    const renderBrandIcon = () => {
        if (branding.iconType === "image") {
            return (
                <Image
                    src={branding.icon}
                    alt="Logo"
                    width={24}
                    height={24}
                    className="rounded"
                />
            );
        }
        return iconMap[branding.icon] || <Bot className="h-6 w-6 text-white" />;
    };

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
                                {renderBrandIcon()}
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">
                                    {branding.title}
                                </h1>
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
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-gray-100 space-y-3">
                        {userName && (
                            <button
                                onClick={() => setShowProfileDialog(true)}
                                className="w-full px-4 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-700 truncate">{userName}</p>
                                        <p className="text-xs text-gray-400 capitalize">{userRole || "user"}</p>
                                    </div>
                                    <Pencil className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Profile Dialog */}
            {userName && (
                <ProfileDialog
                    open={showProfileDialog}
                    onOpenChange={setShowProfileDialog}
                    userName={userName}
                    userRole={userRole || "user"}
                />
            )}
        </>
    );
}
