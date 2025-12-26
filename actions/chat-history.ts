"use server";

import { db } from "@/lib/db";
import { chatHistory, type ChatHistoryEntry } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";

export interface SimplifiedSource {
    fileName: string;
    text: string;
}

export interface SaveChatInput {
    userMessage: string;
    aiResponse: string;
    isRAGUsed: boolean;
    sources?: SimplifiedSource[];
    responseTime?: number; // dalam detik
}

/**
 * Save chat message to history
 */
export async function saveChatHistory(input: SaveChatInput) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        await db.insert(chatHistory).values({
            userId: session.user.id,
            userMessage: input.userMessage,
            aiResponse: input.aiResponse,
            isRAGUsed: input.isRAGUsed,
            sources: input.sources || [],
            responseTime: input.responseTime ? Math.round(input.responseTime * 1000) : null, // Convert to ms
        });

        return { success: true };
    } catch (error) {
        console.error("Error saving chat history:", error);
        return { success: false, error: "Gagal menyimpan riwayat chat" };
    }
}

/**
 * Get chat history for current user
 */
export async function getChatHistory(limit: number = 50): Promise<{
    success: boolean;
    data?: ChatHistoryEntry[];
    error?: string;
}> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        const history = await db
            .select()
            .from(chatHistory)
            .where(eq(chatHistory.userId, session.user.id))
            .orderBy(desc(chatHistory.createdAt))
            .limit(limit);

        return { success: true, data: history };
    } catch (error) {
        console.error("Error getting chat history:", error);
        return { success: false, error: "Gagal mengambil riwayat chat" };
    }
}

/**
 * Clear chat history for current user
 */
export async function clearChatHistory() {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        await db.delete(chatHistory).where(eq(chatHistory.userId, session.user.id));

        return { success: true, message: "Riwayat chat berhasil dihapus" };
    } catch (error) {
        console.error("Error clearing chat history:", error);
        return { success: false, error: "Gagal menghapus riwayat chat" };
    }
}
