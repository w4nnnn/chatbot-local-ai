'use client'

import { useState } from 'react'
import { MainLayout, type MenuType } from '@/components/layout'
import { ChatInterface } from '@/components/chat'
import { UploadContent } from '@/components/upload'
import { Toaster } from 'sonner'

export default function HomePage() {
    const [activeMenu, setActiveMenu] = useState<MenuType>("chat");

    return (
        <>
            <Toaster
                theme="dark"
                position="top-center"
                toastOptions={{
                    style: {
                        background: 'rgb(30 41 59)',
                        border: '1px solid rgb(51 65 85)',
                        color: 'rgb(226 232 240)',
                    },
                }}
            />
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
