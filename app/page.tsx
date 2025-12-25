'use client'

import { useState } from 'react'
import { MainLayout, type MenuType } from '@/components/layout'
import { ChatInterface } from '@/components/chat'
import { UploadContent } from '@/components/upload'
import { ThemedToaster } from '@/components/themed-toaster'

export default function HomePage() {
    const [activeMenu, setActiveMenu] = useState<MenuType>("chat");

    return (
        <>
            <ThemedToaster />
            <MainLayout activeMenu={activeMenu} onMenuChange={setActiveMenu}>
                {activeMenu === "chat" ? (
                    <div className="max-w-3xl mx-auto h-[calc(100vh-6rem)]">
                        <ChatInterface />
                    </div>
                ) : (
                    <UploadContent />
                )}
            </MainLayout>
        </>
    )
}
