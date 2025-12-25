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
        <CardFooter className="pt-4 border-t border-primary/10">
            <form onSubmit={onSubmit} className="flex w-full gap-3 items-center">
                <Input
                    placeholder={useRAG ? "Tanyakan tentang data Anda..." : "Ketik pesan anda..."}
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 bg-white border-primary/20 text-gray-700 placeholder:text-gray-400 focus:border-primary focus:ring-primary/20 shadow-sm"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !input.trim()}
                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all duration-200"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span className="sr-only">Kirim</span>
                </Button>
            </form>
        </CardFooter>
    );
}
