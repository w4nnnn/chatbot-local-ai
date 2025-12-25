"use client";

import { Bot } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface ChatHeaderProps {
    hasData?: boolean;
}

export function ChatHeader({ }: ChatHeaderProps) {
    return (
        <CardHeader className="border-b border-primary/10 pb-4">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary rounded-full shadow-lg shadow-primary/30">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <CardTitle className="text-lg text-gray-800">Chatbot AI Lokal</CardTitle>
                    <p className="text-xs text-primary/60">Didukung oleh Ollama • RAG Mode</p>
                </div>
            </div>
        </CardHeader>
    );
}
