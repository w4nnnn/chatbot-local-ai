"use server";

import ollama from "ollama";

// ============================================
// TYPES
// ============================================

export type QueryIntent =
    | "superlative_query"    // ter-, paling (membutuhkan sort + limit)
    | "comparison_query"     // bandingkan A vs B
    | "aggregation_query"    // total, rata-rata, jumlah
    | "filter_query"         // cari produk dengan kondisi
    | "simple_search"        // pencarian biasa
    | "general_chat";        // chitchat tanpa data

export type SortOperator = "MIN" | "MAX";
export type AggregateOperator = "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";

export interface ExtractedQuery {
    intent: QueryIntent;
    entity?: string;              // Produk/kategori yang dicari
    attribute?: string;           // Kolom (harga, stok, terjual)
    operator?: SortOperator | AggregateOperator;
    limit?: number;
    confidence: number;           // 0-1, seberapa yakin dengan hasil
    rawQuery: string;
}

// ============================================
// KEYWORD PATTERNS
// ============================================

// Pattern untuk superlative (ter-, paling)
const SUPERLATIVE_PATTERNS: { pattern: RegExp; attribute: string; operator: SortOperator }[] = [
    // Harga
    { pattern: /\b(termurah|paling murah|harga terendah|murah banget)\b/i, attribute: "harga", operator: "MIN" },
    { pattern: /\b(termahal|paling mahal|harga tertinggi)\b/i, attribute: "harga", operator: "MAX" },
    // Stok
    { pattern: /\b(tersedikit|paling sedikit|stok terendah|stok paling sedikit)\b/i, attribute: "stok", operator: "MIN" },
    { pattern: /\b(terbanyak|paling banyak|stok tertinggi|stok paling banyak)\b/i, attribute: "stok", operator: "MAX" },
];

// Pattern untuk aggregation
const AGGREGATION_PATTERNS: { pattern: RegExp; operator: AggregateOperator }[] = [
    { pattern: /\b(total|jumlah total|seluruh)\b/i, operator: "SUM" },
    { pattern: /\b(rata-rata|rerata|average)\b/i, operator: "AVG" },
    { pattern: /\b(berapa (banyak|jumlah)|ada berapa|hitung)\b/i, operator: "COUNT" },
];

// Pattern untuk general chat (tidak relevan dengan data)
const GENERAL_CHAT_PATTERNS = [
    /\b(halo|hai|hello|hi|selamat (pagi|siang|sore|malam))\b/i,
    /\b(apa kabar|siapa (kamu|nama)|terima kasih|makasih)\b/i,
    /\b(tolong|bantu|cara|bagaimana|apa itu)\b/i,
];

// ============================================
// KEYWORD-BASED DETECTION (Fast)
// ============================================

function detectByKeyword(query: string): ExtractedQuery | null {
    // 1. Check general chat first
    for (const pattern of GENERAL_CHAT_PATTERNS) {
        if (pattern.test(query)) {
            return {
                intent: "general_chat",
                confidence: 0.9,
                rawQuery: query,
            };
        }
    }

    // 2. Check superlative patterns
    for (const { pattern, attribute, operator } of SUPERLATIVE_PATTERNS) {
        if (pattern.test(query)) {
            // Extract entity (kata sebelum/sesudah pattern superlative)
            const cleanQuery = query.replace(pattern, "").trim();
            const entity = extractEntity(cleanQuery);

            // Check for limit (angka di awal: "5 produk termurah")
            const limitMatch = query.match(/^(\d+)\s+/);
            const limit = limitMatch ? parseInt(limitMatch[1]) : 1;

            return {
                intent: "superlative_query",
                entity: entity || undefined,
                attribute,
                operator,
                limit,
                confidence: 0.85,
                rawQuery: query,
            };
        }
    }

    // 3. Check aggregation patterns
    for (const { pattern, operator } of AGGREGATION_PATTERNS) {
        if (pattern.test(query)) {
            // Extract attribute from query
            let attribute = "stok"; // default
            if (/harga/i.test(query)) attribute = "harga";
            if (/stok/i.test(query)) attribute = "stok";
            if (/produk/i.test(query)) attribute = "produk";

            return {
                intent: "aggregation_query",
                attribute,
                operator,
                confidence: 0.8,
                rawQuery: query,
            };
        }
    }

    // 4. If contains product-related keywords, it's a search
    if (/\b(produk|barang|item|cari|tampilkan|lihat|mana|apa)\b/i.test(query)) {
        return {
            intent: "simple_search",
            entity: extractEntity(query),
            confidence: 0.6, // Lower confidence, might need LLM
            rawQuery: query,
        };
    }

    // Can't determine with keywords
    return null;
}

function extractEntity(query: string): string {
    // Remove common words
    const stopWords = [
        "yang", "dengan", "dari", "untuk", "adalah", "ini", "itu",
        "produk", "barang", "item", "cari", "tampilkan", "lihat",
        "apa", "mana", "berapa", "kategori", "jenis",
    ];

    const words = query.toLowerCase().split(/\s+/);
    const filtered = words.filter(w => !stopWords.includes(w) && w.length > 2);

    return filtered.join(" ").trim();
}

// ============================================
// LLM-BASED DETECTION (Accurate)
// ============================================

const LLM_EXTRACTION_PROMPT = `Kamu adalah sistem klasifikasi intent. Ekstrak informasi dari pertanyaan user.

KATEGORI INTENT:
- superlative_query: Pertanyaan dengan "ter-" atau "paling" (termurah, termahal, terbanyak, tersedikit)
- aggregation_query: Pertanyaan perhitungan (total, rata-rata, jumlah, berapa banyak)
- comparison_query: Membandingkan 2 atau lebih item
- simple_search: Mencari produk/informasi biasa
- general_chat: Percakapan umum, salam, terima kasih

ATURAN:
1. "entity" = nama produk atau kategori yang dicari (kosong jika semua produk)
2. "attribute" = kolom data: "harga", "stok", atau lainnya
3. "operator" = MIN (termurah/tersedikit) atau MAX (termahal/terbanyak) untuk superlative
4. "limit" = jumlah yang diminta (default 1)

CONTOH:
- "mie instant termurah" → {"intent":"superlative_query","entity":"mie instant","attribute":"harga","operator":"MIN","limit":1}
- "5 laptop termahal" → {"intent":"superlative_query","entity":"laptop","attribute":"harga","operator":"MAX","limit":5}
- "berapa total stok" → {"intent":"aggregation_query","attribute":"stok","operator":"SUM"}
- "cari beras premium" → {"intent":"simple_search","entity":"beras premium"}
- "halo" → {"intent":"general_chat"}

Pertanyaan: "{query}"

Jawab HANYA dengan JSON valid, tanpa penjelasan atau markdown.`;

async function detectByLLM(query: string): Promise<ExtractedQuery> {
    try {
        const prompt = LLM_EXTRACTION_PROMPT.replace("{query}", query);

        const response = await ollama.chat({
            model: "qwen3:1.7b",
            messages: [{ role: "user", content: prompt }],
            options: {
                temperature: 0.1, // Low temperature for consistent output
            },
        });

        console.log("[LLM] Response:", response.message.content);

        // Parse JSON response
        const content = response.message.content.trim();

        // Try to extract JSON from response (handle potential markdown code blocks)
        let jsonStr = content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        const parsed = JSON.parse(jsonStr);

        return {
            intent: parsed.intent || "simple_search",
            entity: parsed.entity || undefined,
            attribute: parsed.attribute || undefined,
            operator: parsed.operator || undefined,
            limit: parsed.limit || 1,
            confidence: 0.9,
            rawQuery: query,
        };
    } catch (error) {
        console.error("[Intent LLM] Error:", error);
        // Fallback to simple search
        return {
            intent: "simple_search",
            confidence: 0.5,
            rawQuery: query,
        };
    }
}

// ============================================
// HYBRID DETECTION (Main Export)
// ============================================

/**
 * Hybrid Intent Detection
 * 1. Coba keyword-based dulu (cepat)
 * 2. Jika confidence rendah, gunakan LLM (akurat)
 */
export async function detectIntent(query: string): Promise<ExtractedQuery> {
    console.log(`[Intent] Analyzing: "${query}"`);

    // Step 1: Try keyword-based detection (fast)
    const keywordResult = detectByKeyword(query);

    if (keywordResult && keywordResult.confidence >= 0.8) {
        console.log(`[Intent] Keyword detection: ${keywordResult.intent} (confidence: ${keywordResult.confidence})`);
        return keywordResult;
    }

    // Step 2: Use LLM for uncertain cases
    console.log(`[Intent] Using LLM for better accuracy...`);
    const llmResult = await detectByLLM(query);
    console.log(`[Intent] LLM detection: ${llmResult.intent}`);

    return llmResult;
}

/**
 * Quick check if query is general chat (no RAG needed)
 */
export async function isGeneralChat(query: string): Promise<boolean> {
    return GENERAL_CHAT_PATTERNS.some(pattern => pattern.test(query));
}
