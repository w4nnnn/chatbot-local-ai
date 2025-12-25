"use client";

import * as React from "react";
import { ragChat, hasEmbeddedData, type Message } from "@/actions/ollama";
import { Card } from "@/components/ui/card";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import type { ChatMessage } from "./types";

const INITIAL_MESSAGE: ChatMessage = {
    role: "assistant",
    content: "Halo! Saya adalah asisten AI lokal dengan kemampuan RAG. Upload data Anda di menu Upload, lalu tanyakan apa saja tentang data tersebut!"
};

export function ChatInterface() {
    const [messages, setMessages] = React.useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const [input, setInput] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [useRAG, setUseRAG] = React.useState(true);
    const [hasData, setHasData] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Check apakah ada data yang sudah di-embed
    React.useEffect(() => {
        async function checkData() {
            const result = await hasEmbeddedData();
            setHasData(result);
        }
        checkData();
    }, []);

    // Auto scroll ke bawah saat ada pesan baru
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Ambil history percakapan (tanpa sources)
            const history: Message[] = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await ragChat(input, history, useRAG);

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.message,
                sources: response.sources,
                isRAGUsed: response.isRAGUsed,
                intent: response.intent
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const systemError: ChatMessage = {
                role: "assistant",
                content: "Terjadi kesalahan sistem."
            };
            setMessages((prev) => [...prev, systemError]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full h-full flex flex-col shadow-lg border-slate-800 bg-slate-900/50 backdrop-blur">
            <ChatHeader
                useRAG={useRAG}
                onRAGChange={setUseRAG}
                hasData={hasData}
            />
            <ChatMessages
                messages={messages}
                isLoading={isLoading}
                useRAG={useRAG}
                scrollRef={scrollRef}
            />
            <ChatInput
                input={input}
                isLoading={isLoading}
                useRAG={useRAG}
                onInputChange={setInput}
                onSubmit={handleSubmit}
            />
        </Card>
    );
}
