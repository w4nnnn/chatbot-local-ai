"use client"

import * as React from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { chat, Message } from "@/actions/ollama"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ChatInterface() {
    const [messages, setMessages] = React.useState<Message[]>([
        { role: "assistant", content: "Halo! Saya adalah asisten AI lokal. Ada yang bisa saya bantu?" }
    ])
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = { role: "user", content: input }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await chat([...messages, userMessage])
            if (response.success && response.message) {
                setMessages((prev) => [...prev, response.message as Message])
            } else {
                const errorMessage: Message = { role: "assistant", content: "Maaf, terjadi kesalahan atau tidak ada respon." }
                setMessages((prev) => [...prev, errorMessage])
            }
        } catch (error) {
            console.error("Chat error:", error)
            const systemError: Message = { role: "assistant", content: "Terjadi kesalahan sistem." }
            setMessages((prev) => [...prev, systemError])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col shadow-lg border-muted/40">
            <CardHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Chatbot AI Lokal</CardTitle>
                        <p className="text-xs text-muted-foreground">Didukung oleh Ollama (qwen3:1.7b)</p>
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
                                <Avatar className={`w-8 h-8 border ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    <AvatarFallback className={message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                                        {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </AvatarFallback>
                                </Avatar>

                                <div
                                    className={`relative px-4 py-2 rounded-2xl max-w-[80%] text-sm shadow-sm ${message.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-muted/50 text-foreground border rounded-tl-sm"
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 items-center text-muted-foreground text-sm pl-1">
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                                <span>Sedang berpikir...</span>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="pt-4 border-t bg-muted/5">
                <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center">
                    <Input
                        placeholder="Ketik pesan anda..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 bg-background"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span className="sr-only">Kirim</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
