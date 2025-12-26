"use client";

import * as React from "react";
import { ragChat, hasEmbeddedData } from "@/actions/ollama";
import { saveChatHistory, getChatHistory } from "@/actions/chat-history";
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
    const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // RAG selalu aktif
    const useRAG = true;

    // Load chat history from database on mount
    React.useEffect(() => {
        async function loadHistory() {
            try {
                const result = await getChatHistory(50);
                if (result.success && result.data && result.data.length > 0) {
                    // Convert history to ChatMessage format (oldest first)
                    const historyMessages: ChatMessage[] = [];

                    // Reverse to get chronological order (oldest first)
                    const sortedHistory = [...result.data].reverse();

                    for (const entry of sortedHistory) {
                        // User message
                        historyMessages.push({
                            role: "user",
                            content: entry.userMessage
                        });
                        // AI response
                        historyMessages.push({
                            role: "assistant",
                            content: entry.aiResponse,
                            isRAGUsed: entry.isRAGUsed,
                            responseTime: entry.responseTime ? entry.responseTime / 1000 : undefined
                        });
                    }

                    if (historyMessages.length > 0) {
                        setMessages([INITIAL_MESSAGE, ...historyMessages]);
                    }
                }
            } catch (error) {
                console.error("Failed to load chat history:", error);
            } finally {
                setIsLoadingHistory(false);
            }
        }
        loadHistory();
    }, []);

    // Check apakah ada data yang sudah di-embed
    React.useEffect(() => {
        async function checkData() {
            const result = await hasEmbeddedData();
            setHasData(result);
        }
        checkData();
    }, []);

    // Auto scroll ke bawah saat ada pesan baru atau history loaded
    React.useEffect(() => {
        if (scrollRef.current && !isLoadingHistory) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoadingHistory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessageText = input;
        const userMessage: ChatMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await ragChat(userMessageText, useRAG);

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.message,
                sources: response.sources,
                isRAGUsed: response.isRAGUsed,
                intent: response.intent,
                responseTime: response.responseTime
            };

            setMessages((prev) => [...prev, assistantMessage]);

            // Save to chat history (fire and forget)
            saveChatHistory({
                userMessage: userMessageText,
                aiResponse: response.message,
                isRAGUsed: response.isRAGUsed,
                sources: response.sources?.map(s => ({
                    fileName: s.fileName,
                    text: s.text
                })),
                responseTime: response.responseTime
            }).catch(err => console.error("Failed to save chat history:", err));

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

    const handleClearHistory = async () => {
        const { clearChatHistory } = await import("@/actions/chat-history");
        const result = await clearChatHistory();
        if (result.success) {
            setMessages([INITIAL_MESSAGE]);
        }
    };

    // Check if there are user messages (not just initial message)
    const hasUserMessages = messages.length > 1;

    return (
        <Card className="w-full h-full flex flex-col shadow-2xl shadow-primary/10 border-primary/20 bg-white/70 backdrop-blur-xl">
            <ChatHeader
                hasData={hasData}
                onClearHistory={handleClearHistory}
                hasMessages={hasUserMessages}
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
