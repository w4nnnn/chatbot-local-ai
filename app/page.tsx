'use client'

import { useState, useEffect, useRef } from 'react'
import { MainLayout, type MenuType } from '@/components/layout'
import { ChatInterface } from '@/components/chat'
import { UploadContent } from '@/components/upload'
import { UserManagement } from '@/components/users'
import { RolePermission } from '@/components/role-permission'
import { ThemedToaster, SettingsPage } from '@/components/setting'
import { useSession } from '@/lib/auth-client'
import { getMenusForRole } from '@/actions/role-permissions'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
    const { data: session, isPending } = useSession();
    const [activeMenu, setActiveMenu] = useState<MenuType>("chat");
    const [accessibleMenus, setAccessibleMenus] = useState<string[]>(["chat"]);
    const [isLoadingMenus, setIsLoadingMenus] = useState(true);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (isPending || hasLoadedRef.current) return;

        const role = session?.user?.role;
        hasLoadedRef.current = true;
        let mounted = true;

        if (!role) {
            // Use Promise.resolve to defer setState
            Promise.resolve().then(() => {
                if (mounted) setIsLoadingMenus(false);
            });
            return () => { mounted = false; };
        }

        getMenusForRole(role).then((menus) => {
            if (!mounted) return;
            setAccessibleMenus(menus);
            setActiveMenu((prevMenu) => {
                if (!menus.includes(prevMenu)) {
                    return (menus[0] as MenuType) || "chat";
                }
                return prevMenu;
            });
            setIsLoadingMenus(false);
        });

        return () => {
            mounted = false;
        };
    }, [isPending, session?.user?.role]);

    // Show loading while session is being fetched
    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-500">Memuat...</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (isLoadingMenus) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        switch (activeMenu) {
            case "chat":
                return (
                    <div className="max-w-3xl mx-auto h-[calc(100vh-6rem)]">
                        <ChatInterface />
                    </div>
                );
            case "upload":
                return <UploadContent />;
            case "users":
                return <UserManagement />;
            case "permissions":
                return <RolePermission />;
            case "settings":
                return <SettingsPage />;
            default:
                return (
                    <div className="max-w-3xl mx-auto h-[calc(100vh-6rem)]">
                        <ChatInterface />
                    </div>
                );
        }
    };

    return (
        <>
            <ThemedToaster />
            <MainLayout
                activeMenu={activeMenu}
                onMenuChange={setActiveMenu}
                accessibleMenus={accessibleMenus}
                userName={session?.user?.name}
                userRole={session?.user?.role || "user"}
            >
                {renderContent()}
            </MainLayout>
        </>
    )
}
