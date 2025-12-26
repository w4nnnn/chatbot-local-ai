"use client";

import { useState } from "react";
import { Bot, Trash2, Loader2 } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
    hasData?: boolean;
    onClearHistory?: () => Promise<void>;
    hasMessages?: boolean;
}

export function ChatHeader({ onClearHistory, hasMessages }: ChatHeaderProps) {
    const [isClearing, setIsClearing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleClear = async () => {
        if (!onClearHistory) return;

        setIsClearing(true);
        await onClearHistory();
        setIsClearing(false);
        setIsDialogOpen(false);
    };

    return (
        <CardHeader className="border-b border-primary/10 pb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary rounded-full shadow-lg shadow-primary/30">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-gray-800">Chatbot</CardTitle>
                        <p className="text-xs text-primary/60">Menggunakan Local AI</p>
                    </div>
                </div>

                {/* Clear History Button */}
                {onClearHistory && hasMessages && (
                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Hapus Riwayat Chat</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Riwayat Chat?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Semua riwayat percakapan akan dihapus secara permanen.
                                    Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isClearing}>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleClear}
                                    disabled={isClearing}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {isClearing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Menghapus...
                                        </>
                                    ) : (
                                        "Hapus"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </CardHeader>
    );
}
