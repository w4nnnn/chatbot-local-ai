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

// System prompt untuk budget query
const BUDGET_SYSTEM_PROMPT = `Kamu adalah asisten AI yang membantu menjawab pertanyaan berdasarkan DATA yang diberikan.

INSTRUKSI KHUSUS:
- User mencari produk dengan batasan harga {operator} {value}
- Data yang diberikan sudah difilter sesuai budget
- Tampilkan semua opsi yang tersedia dalam budget
- Sebutkan nama produk dan harganya
- Jika ada beberapa opsi, urutkan dari yang paling relevan

DATA YANG TERSEDIA (sudah difilter sesuai budget):
{context}

Jawab dengan menyebutkan produk yang sesuai budget user.`;

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
    responseTime?: number; // dalam detik
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
 * Filter sources by budget constraint
 */
function filterByBudget(
    sources: SourceDocument[],
    attribute: string,
    operator: "LTE" | "GTE" | "LT" | "GT" | "EQ",
    value: number
): SourceDocument[] {
    return sources.filter(source => {
        const sourceVal = Number(source.metadata[attribute]) || 0;
        switch (operator) {
            case "LTE": return sourceVal <= value;
            case "GTE": return sourceVal >= value;
            case "LT": return sourceVal < value;
            case "GT": return sourceVal > value;
            case "EQ": return sourceVal === value;
            default: return true;
        }
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
 * Format budget value for display (e.g., 7000000 -> "7 juta")
 */
function formatBudgetValue(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(0)} juta`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)} ribu`;
    }
    return value.toString();
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

    if (intent.intent === "budget_query" && intent.value) {
        const opText = intent.operator === "LTE" ? "maksimal" : "minimal";
        return BUDGET_SYSTEM_PROMPT
            .replace("{context}", context)
            .replace(/{operator}/g, opText)
            .replace(/{value}/g, formatBudgetValue(intent.value));
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
    useRAG: boolean = true
): Promise<RAGResponse> {
    const startTime = performance.now();

    try {
        let context = "";
        let sources: SourceDocument[] = [];
        let isRAGUsed = false;

        // Quick check for general chat
        if (!useRAG || await isGeneralChat(userMessage)) {
            // Skip RAG for general chat
            const messages: Message[] = [
                { role: "system", content: NORMAL_SYSTEM_PROMPT },
                { role: "user", content: userMessage },
            ];

            const response = await ollama.chat({
                model: "qwen3:1.7b",
                messages: messages,
            });

            const responseTime = (performance.now() - startTime) / 1000;

            return {
                success: true,
                message: response.message.content,
                sources: [],
                isRAGUsed: false,
                responseTime,
            };
        }

        // Detect intent using hybrid method
        const intentResult = await detectIntent(userMessage);
        console.log(`[RAG] Intent detected: ${intentResult.intent}`);
        if (intentResult.value) {
            console.log(`[RAG] Budget value: ${intentResult.value}`);
        }

        // Search for relevant documents using HYBRID SEARCH
        const searchQuery = intentResult.entity || userMessage;
        console.log(`[RAG] Search query: "${searchQuery}" (entity: "${intentResult.entity || 'none'}")`);

        // For budget query, search more to filter later
        const searchLimit = intentResult.intent === "budget_query" ? 20
            : intentResult.intent === "superlative_query" ? 10
                : 5;

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

            // Handle superlative query (sort)
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

            // Handle budget query (filter)
            if (
                intentResult.intent === "budget_query" &&
                intentResult.attribute &&
                intentResult.operator &&
                intentResult.value
            ) {
                const beforeFilter = sources.length;

                // Filter by budget constraint
                sources = filterByBudget(
                    sources,
                    intentResult.attribute,
                    intentResult.operator as "LTE" | "GTE" | "LT" | "GT" | "EQ",
                    intentResult.value
                );

                // Keep sorted by relevance (original order from search)
                // Sources are already sorted by relevance score from hybrid search

                // Limit results
                sources = sources.slice(0, intentResult.limit || 5);
                console.log(`[RAG] Filtered by budget: ${beforeFilter} -> ${sources.length} results (sorted by relevance)`);
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
            { role: "user", content: userMessage },
        ];

        // Call Ollama
        const response = await ollama.chat({
            model: "qwen3:1.7b",
            messages: messages,
        });

        const responseTime = (performance.now() - startTime) / 1000;

        return {
            success: true,
            message: response.message.content,
            sources: sources,
            isRAGUsed: isRAGUsed,
            intent: intentResult,
            responseTime,
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
