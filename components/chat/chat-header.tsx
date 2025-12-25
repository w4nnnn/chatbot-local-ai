"use client";

import { Bot, Sparkles, MessageSquare } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ChatHeaderProps {
    useRAG: boolean;
    onRAGChange: (value: boolean) => void;
    hasData: boolean;
}

export function ChatHeader({ useRAG, onRAGChange, hasData }: ChatHeaderProps) {
    return (
        <CardHeader className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full">
                        <Bot className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-slate-200">Chatbot AI Lokal</CardTitle>
                        <p className="text-xs text-slate-500">Didukung oleh Ollama (qwen3:1.7b)</p>
                    </div>
                </div>

                {/* RAG Toggle */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="rag-mode"
                            checked={useRAG}
                            onCheckedChange={onRAGChange}
                            className="data-[state=checked]:bg-purple-600"
                        />
                        <Label
                            htmlFor="rag-mode"
                            className={`text-xs flex items-center gap-1 cursor-pointer ${useRAG ? 'text-purple-400' : 'text-slate-500'
                                }`}
                        >
                            {useRAG ? <Sparkles className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                            {useRAG ? 'RAG' : 'Chat'}
                        </Label>
                    </div>
                    {useRAG && (
                        <Badge
                            variant="outline"
                            className={`text-[10px] ${hasData
                                ? 'border-green-500/50 text-green-400'
                                : 'border-orange-500/50 text-orange-400'
                                }`}
                        >
                            {hasData ? 'Data Ready' : 'No Data'}
                        </Badge>
                    )}
                </div>
            </div>
        </CardHeader>
    );
}
