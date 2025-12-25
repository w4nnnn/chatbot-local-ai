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
                theme="light"
                position="top-center"
                toastOptions={{
                    style: {
                        background: 'white',
                        border: '1px solid rgb(221 214 254)',
                        color: 'rgb(55 48 163)',
                        boxShadow: '0 10px 25px -5px rgb(139 92 246 / 0.1)',
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
