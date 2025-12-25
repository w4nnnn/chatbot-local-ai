"use client";

import { Send, Loader2 } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
    input: string;
    isLoading: boolean;
    useRAG: boolean;
    onInputChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({ input, isLoading, useRAG, onInputChange, onSubmit }: ChatInputProps) {
    return (
        <CardFooter className="pt-4 border-t border-slate-800 bg-slate-900/50">
            <form onSubmit={onSubmit} className="flex w-full gap-2 items-center">
                <Input
                    placeholder={useRAG ? "Tanyakan tentang data Anda..." : "Ketik pesan anda..."}
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
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
    );
}
