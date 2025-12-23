'use client'

import { useState, useRef, useEffect } from 'react'
import { chat, Message } from '@/actions/ollama'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Call server action
    const response = await chat([...messages, userMessage])

    if (response.success && response.message) {
      setMessages((prev) => [...prev, response.message as Message])
    } else {
      setMessages((prev) => [...prev, { role: 'assistant', content: response.message?.content || 'Maaf, ada masalah teknis.' }])
    }
    setIsLoading(false)
  }

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <Card className="w-full max-w-2xl h-[80vh] flex flex-col border border-zinc-800 bg-zinc-900/60 backdrop-blur-2xl shadow-2xl relative z-10 overflow-hidden rounded-3xl">
        <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/50 px-6 py-4 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-zinc-100 tracking-tight">
                Bot Asisten
              </CardTitle>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <p className="text-xs text-zinc-400 font-medium tracking-wide">Qwen3 1.7B Model</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col relative">
          <ScrollArea className="flex-1 p-0 h-full">
            <div className="flex flex-col gap-6 p-6 min-h-full">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center m-auto space-y-6 opacity-40 py-20 select-none">
                  <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center">
                    <Bot className="w-10 h-10 text-zinc-500" />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium">Mulai percakapan baru...</p>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-4 w-full ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                >
                  <Avatar className={`w-9 h-9 border flex-shrink-0 ${m.role === 'user' ? 'border-indigo-500/20 shadow-indigo-500/10' : 'border-zinc-700/50'}`}>
                    <AvatarFallback className={m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}>
                      {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex flex-col max-w-[85%] space-y-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-5 py-3 text-[15px] leading-relaxed shadow-sm break-words ${m.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                        : 'bg-zinc-800/70 text-zinc-200 border border-zinc-700/50 rounded-tl-none'
                      }`}>
                      {m.content}
                    </div>
                    <span className="text-[10px] text-zinc-600 px-1 font-medium uppercase tracking-wider">{m.role}</span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 flex-row w-full animate-in fade-in duration-300">
                  <Avatar className="w-9 h-9 border border-zinc-700/50 flex-shrink-0">
                    <AvatarFallback className="bg-zinc-800 text-zinc-400"><Bot className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 h-[46px]">
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={scrollEndRef} className="h-1" />
            </div>
          </ScrollArea>

          <div className="p-4 bg-zinc-900/80 border-t border-zinc-800/50 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="flex gap-3 relative max-w-full">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu..."
                className="bg-zinc-950/80 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40 h-14 rounded-2xl pl-5 pr-14 shadow-inner text-base"
                disabled={isLoading}
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <div className="absolute bottom-4 text-zinc-700 text-xs text-center pointer-events-none">
        Local AI Chatbot • qwen3:1.7b
      </div>
    </div>
  )
}
