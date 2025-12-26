"use client";

import * as React from "react";
import { Bot, User, Loader2, Zap } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SourcesPanel } from "./sources-panel";
import { MarkdownRenderer } from "./markdown-renderer";
import type { ChatMessage } from "./types";

interface ChatMessagesProps {
    messages: ChatMessage[];
    isLoading: boolean;
    useRAG: boolean;
    scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({ messages, isLoading, useRAG, scrollRef }: ChatMessagesProps) {
    return (
        <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
                <div className="flex flex-col gap-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"
                                }`}
                        >
                            <Avatar className={`w-8 h-8 border-2 shadow-md ${message.role === "user"
                                ? "bg-primary border-primary/30"
                                : "bg-white border-primary/20"
                                }`}>
                                <AvatarFallback className={
                                    message.role === "user"
                                        ? "bg-primary text-white"
                                        : "bg-white text-primary"
                                }>
                                    {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </AvatarFallback>
                            </Avatar>

                            <div className={`flex flex-col max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"
                                }`}>
                                <div
                                    className={`relative px-4 py-3 rounded-2xl shadow-md ${message.role === "user"
                                        ? "bg-primary text-white rounded-tr-sm shadow-primary/20"
                                        : "bg-white text-gray-700 border border-primary/10 rounded-tl-sm shadow-primary/5"
                                        }`}
                                >
                                    {message.role === "assistant" ? (
                                        <MarkdownRenderer content={message.content} />
                                    ) : (
                                        <span className="text-sm">{message.content}</span>
                                    )}
                                </div>

                                {/* Response Time & Sources */}
                                {message.role === "assistant" && message.isRAGUsed && (
                                    <div className="mt-1">
                                        <div className="flex flex-wrap gap-1 mb-1">
                                            {message.responseTime !== undefined && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] border-primary/20 text-primary bg-primary/5"
                                                >
                                                    <Zap className="h-2 w-2 mr-1" />
                                                    {message.responseTime.toFixed(1)}s
                                                </Badge>
                                            )}
                                        </div>
                                        <SourcesPanel sources={message.sources || []} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 items-center text-primary text-sm pl-1">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                            <span>{useRAG ? 'Mencari data & berpikir...' : 'Sedang berpikir...'}</span>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>
        </CardContent>
    );
}
