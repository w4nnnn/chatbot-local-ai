"use client";

import * as React from "react";
import { ragChat, hasEmbeddedData } from "@/actions/ollama";
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
    const [hasData, setHasData] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // RAG selalu aktif
    const useRAG = true;

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
            const response = await ragChat(input, useRAG);

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.message,
                sources: response.sources,
                isRAGUsed: response.isRAGUsed,
                intent: response.intent,
                responseTime: response.responseTime
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
        <Card className="w-full h-full flex flex-col shadow-2xl shadow-primary/10 border-primary/20 bg-white/70 backdrop-blur-xl">
            <ChatHeader hasData={hasData} />
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
