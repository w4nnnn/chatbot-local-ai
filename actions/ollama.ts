"use server";

import ollama from "ollama";
import { hybridSearch, searchSimilar } from "./embed";
import { detectIntent, isGeneralChat, type ExtractedQuery } from "./intent";

// ============================================
// SYSTEM PROMPTS
// ============================================

// System prompt untuk RAG
const RAG_SYSTEM_PROMPT = `Kamu adalah asisten AI yang membantu menjawab pertanyaan berdasarkan DATA yang diberikan.

ATURAN PENTING:
1. Jawab HANYA berdasarkan data yang diberikan dalam context di bawah
2. Jika tidak ada informasi yang relevan dalam data, katakan "Maaf, saya tidak menemukan data yang relevan untuk pertanyaan ini."
3. JANGAN mengarang atau mengasumsikan informasi yang tidak ada dalam data
4. Jika diminta menghitung atau membandingkan, gunakan HANYA data yang tersedia
5. Jawab dengan bahasa Indonesia yang sopan, jelas, dan ringkas
6. Jika ada beberapa data yang relevan, sebutkan semuanya

DATA YANG TERSEDIA:
{context}

Berdasarkan data di atas, jawab pertanyaan pengguna dengan akurat.`;

// System prompt untuk superlative query
const SUPERLATIVE_SYSTEM_PROMPT = `Kamu adalah asisten AI yang membantu menjawab pertanyaan berdasarkan DATA yang diberikan.

INSTRUKSI KHUSUS:
- User bertanya tentang item dengan nilai {operator} untuk {attribute}
- Data sudah diurutkan dari yang paling sesuai
- Jawab dengan menyebutkan item pertama sebagai jawaban utama
- Sebutkan juga beberapa alternatif jika ada

DATA YANG TERSEDIA (sudah diurutkan):
{context}

Jawab pertanyaan dengan menyebutkan item yang sesuai kriteria "{operator} {attribute}".`;

// System prompt untuk chat biasa (tanpa RAG)
const NORMAL_SYSTEM_PROMPT = `Kamu adalah asisten AI yang ramah dan membantu. Jawab dengan bahasa Indonesia yang sopan dan jelas.`;

// ============================================
// TYPES
// ============================================

export interface Message {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface SourceDocument {
    fileName: string;
    rowIndex: number;
    text: string;
    relevanceScore: number;
    metadata: Record<string, unknown>;
}

export interface RAGResponse {
    success: boolean;
    message: string;
    sources: SourceDocument[];
    isRAGUsed: boolean;
    intent?: ExtractedQuery;
    error?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sort sources by attribute
 */
function sortSources(
    sources: SourceDocument[],
    attribute: string,
    operator: "MIN" | "MAX"
): SourceDocument[] {
    return [...sources].sort((a, b) => {
        const aVal = Number(a.metadata[attribute]) || 0;
        const bVal = Number(b.metadata[attribute]) || 0;
        return operator === "MIN" ? aVal - bVal : bVal - aVal;
    });
}

/**
 * Format context from sources
 */
function formatContext(sources: SourceDocument[]): string {
    return sources
        .map((r, index) => {
            const dataText = Object.entries(r.metadata)
                .filter(([key]) => !["file_id", "file_name", "row_index"].includes(key))
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");
            return `[Data ${index + 1}] ${dataText}`;
        })
        .join("\n");
}

/**
 * Build system prompt based on intent
 */
function buildSystemPrompt(intent: ExtractedQuery, context: string): string {
    if (intent.intent === "superlative_query" && intent.attribute && intent.operator) {
        return SUPERLATIVE_SYSTEM_PROMPT
            .replace("{context}", context)
            .replace(/{operator}/g, intent.operator === "MIN" ? "terendah" : "tertinggi")
            .replace(/{attribute}/g, intent.attribute);
    }

    return RAG_SYSTEM_PROMPT.replace("{context}", context);
}

// ============================================
// MAIN RAG FUNCTION
// ============================================

/**
 * RAG Chat dengan Intent Detection
 */
export async function ragChat(
    userMessage: string,
    conversationHistory: Message[] = [],
    useRAG: boolean = true
): Promise<RAGResponse> {
    try {
        let context = "";
        let sources: SourceDocument[] = [];
        let isRAGUsed = false;

        // Quick check for general chat
        if (!useRAG || await isGeneralChat(userMessage)) {
            // Skip RAG for general chat
            const messages: Message[] = [
                { role: "system", content: NORMAL_SYSTEM_PROMPT },
                ...conversationHistory.filter((m) => m.role !== "system"),
                { role: "user", content: userMessage },
            ];

            const response = await ollama.chat({
                model: "qwen3:1.7b",
                messages: messages,
            });

            return {
                success: true,
                message: response.message.content,
                sources: [],
                isRAGUsed: false,
            };
        }

        // Detect intent using hybrid method
        const intentResult = await detectIntent(userMessage);
        console.log(`[RAG] Intent detected: ${intentResult.intent}`);

        // Search for relevant documents using HYBRID SEARCH
        const searchQuery = intentResult.entity || userMessage;
        const searchLimit = intentResult.intent === "superlative_query" ? 10 : 5;

        // Gunakan hybridSearch untuk toleransi typo
        const searchResult = await hybridSearch(searchQuery, searchLimit);

        if (searchResult.success && searchResult.results.length > 0) {
            isRAGUsed = true;

            // Convert to SourceDocument format
            sources = searchResult.results.map((r) => ({
                fileName: (r.metadata.file_name as string) || "Unknown",
                rowIndex: (r.metadata.row_index as number) || 0,
                text: r.text,
                relevanceScore: 1 - r.score,
                metadata: r.metadata,
            }));

            // Sort if superlative query
            if (
                intentResult.intent === "superlative_query" &&
                intentResult.attribute &&
                intentResult.operator
            ) {
                sources = sortSources(
                    sources,
                    intentResult.attribute,
                    intentResult.operator as "MIN" | "MAX"
                );

                // Limit results
                sources = sources.slice(0, intentResult.limit || 1);
                console.log(`[RAG] Sorted by ${intentResult.attribute} ${intentResult.operator}, limit ${intentResult.limit}`);
            }

            // Build context
            context = formatContext(sources);
        }

        // Build system prompt based on intent
        const systemPrompt = isRAGUsed
            ? buildSystemPrompt(intentResult, context)
            : NORMAL_SYSTEM_PROMPT;

        // Build messages
        const messages: Message[] = [
            { role: "system", content: systemPrompt },
            ...conversationHistory.filter((m) => m.role !== "system"),
            { role: "user", content: userMessage },
        ];

        // Call Ollama
        const response = await ollama.chat({
            model: "qwen3:1.7b",
            messages: messages,
        });

        return {
            success: true,
            message: response.message.content,
            sources: sources,
            isRAGUsed: isRAGUsed,
            intent: intentResult,
        };
    } catch (error) {
        console.error("[RAG] Error:", error);

        let errorMessage = "Maaf, terjadi kesalahan saat memproses pertanyaan.";
        const err = error as { cause?: { code?: string }; message?: string };

        if (err.cause && err.cause.code === "ECONNREFUSED") {
            errorMessage =
                "Tidak dapat terhubung ke Ollama. Pastikan Ollama sedang berjalan.";
        }

        return {
            success: false,
            message: errorMessage,
            sources: [],
            isRAGUsed: false,
            error: err.message,
        };
    }
}

/**
 * Check apakah ada data yang sudah di-embed
 */
export async function hasEmbeddedData(): Promise<boolean> {
    try {
        const result = await searchSimilar("test", 1);
        return result.success && result.results.length > 0;
    } catch {
        return false;
    }
}
