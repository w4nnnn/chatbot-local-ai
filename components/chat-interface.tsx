"use client"

import * as React from "react"
import { Send, Bot, User, Loader2, FileText, ChevronDown, ChevronUp, Sparkles, MessageSquare, Target } from "lucide-react"
import { ragChat, hasEmbeddedData, type Message, type SourceDocument } from "@/actions/ollama"
import { type ExtractedQuery } from "@/actions/intent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface ChatMessage extends Message {
    sources?: SourceDocument[];
    isRAGUsed?: boolean;
    intent?: ExtractedQuery;
}

// Komponen untuk menampilkan sumber referensi
function SourcesPanel({ sources }: { sources: SourceDocument[] }) {
    const [isOpen, setIsOpen] = React.useState(false);

    if (!sources || sources.length === 0) return null;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                    <FileText className="h-3 w-3" />
                    <span>{sources.length} sumber data</span>
                    {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
                {sources.map((source, index) => (
                    <div
                        key={index}
                        className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-blue-400" />
                                <span className="font-medium text-slate-300">{source.fileName}</span>
                            </div>
                            <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${source.relevanceScore > 0.7
                                    ? 'border-green-500/50 text-green-400'
                                    : source.relevanceScore > 0.4
                                        ? 'border-yellow-500/50 text-yellow-400'
                                        : 'border-slate-500/50 text-slate-400'
                                    }`}
                            >
                                {Math.round(source.relevanceScore * 100)}% relevan
                            </Badge>
                        </div>
                        <div className="text-slate-400 space-y-1">
                            {Object.entries(source.metadata)
                                .filter(([key]) => !["file_id", "file_name", "row_index"].includes(key))
                                .slice(0, 5)
                                .map(([key, value]) => (
                                    <div key={key} className="flex">
                                        <span className="text-slate-500 min-w-[80px]">{key}:</span>
                                        <span className="text-slate-300 truncate">{String(value)}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}

export function ChatInterface() {
    const [messages, setMessages] = React.useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "Halo! Saya adalah asisten AI lokal dengan kemampuan RAG. Upload data Anda di halaman Upload, lalu tanyakan apa saja tentang data tersebut!"
        }
    ])
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [useRAG, setUseRAG] = React.useState(true)
    const [hasData, setHasData] = React.useState(false)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // Check apakah ada data yang sudah di-embed
    React.useEffect(() => {
        async function checkData() {
            const result = await hasEmbeddedData();
            setHasData(result);
        }
        checkData();
    }, []);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: ChatMessage = { role: "user", content: input }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

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
            console.error("Chat error:", error)
            const systemError: ChatMessage = {
                role: "assistant",
                content: "Terjadi kesalahan sistem."
            }
            setMessages((prev) => [...prev, systemError])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col shadow-lg border-slate-800 bg-slate-900/50 backdrop-blur">
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
                                onCheckedChange={setUseRAG}
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

            <CardFooter className="pt-4 border-t border-slate-800 bg-slate-900/50">
                <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center">
                    <Input
                        placeholder={useRAG ? "Tanyakan tentang data Anda..." : "Ketik pesan anda..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span className="sr-only">Kirim</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
