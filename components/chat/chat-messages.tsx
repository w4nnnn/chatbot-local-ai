"use client";

import * as React from "react";
import { Bot, User, Loader2, Sparkles, Target } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SourcesPanel } from "./sources-panel";
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
                            <Avatar className={`w-8 h-8 border ${message.role === "user"
                                ? "bg-blue-600 border-blue-500"
                                : "bg-slate-800 border-slate-700"
                                }`}>
                                <AvatarFallback className={
                                    message.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-800 text-slate-400"
                                }>
                                    {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </AvatarFallback>
                            </Avatar>

                            <div className={`flex flex-col max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"
                                }`}>
                                <div
                                    className={`relative px-4 py-2 rounded-2xl text-sm shadow-sm ${message.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-sm"
                                        : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm"
                                        }`}
                                >
                                    {message.content}
                                </div>

                                {/* RAG Badge & Sources */}
                                {message.role === "assistant" && message.isRAGUsed && (
                                    <div className="mt-1">
                                        <div className="flex flex-wrap gap-1 mb-1">
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] border-purple-500/50 text-purple-400"
                                            >
                                                <Sparkles className="h-2 w-2 mr-1" />
                                                RAG
                                            </Badge>
                                            {message.intent && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] border-blue-500/50 text-blue-400"
                                                >
                                                    <Target className="h-2 w-2 mr-1" />
                                                    {message.intent.intent.replace("_", " ")}
                                                </Badge>
                                            )}
                                            {message.intent?.attribute && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] border-green-500/50 text-green-400"
                                                >
                                                    {message.intent.operator === "MIN" ? "⬇️" : message.intent.operator === "MAX" ? "⬆️" : "📊"} {message.intent.attribute}
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
                        <div className="flex gap-3 items-center text-slate-500 text-sm pl-1">
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
