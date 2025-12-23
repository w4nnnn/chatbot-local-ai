'use client'

import { ChatInterface } from '@/components/chat-interface'

export default function ChatPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50/50 p-4 md:p-24 dark:bg-gray-950/50">
            <div className="w-full max-w-2xl space-y-4">
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
                        Chatbot Assistant
                    </h1>
                    <p className="text-muted-foreground md:text-lg">
                        Berinteraksi dengan model AI lokal Anda dengan mudah.
                    </p>
                </div>
                <ChatInterface />
            </div>
        </main>
    )
}
