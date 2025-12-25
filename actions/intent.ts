"use server";

import ollama from "ollama";

// ============================================
// TYPES
// ============================================

export type QueryIntent =
    | "superlative_query"    // ter-, paling (membutuhkan sort + limit)
    | "comparison_query"     // bandingkan A vs B
    | "aggregation_query"    // total, rata-rata, jumlah
    | "budget_query"         // cari dengan batasan harga/budget
    | "filter_query"         // cari produk dengan kondisi
    | "simple_search"        // pencarian biasa
    | "general_chat";        // chitchat tanpa data

export type SortOperator = "MIN" | "MAX";
export type ComparisonOperator = "LTE" | "GTE" | "LT" | "GT" | "EQ";
export type AggregateOperator = "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";

export interface ExtractedQuery {
    intent: QueryIntent;
    entity?: string;
    attribute?: string;
    operator?: SortOperator | ComparisonOperator | AggregateOperator;
    value?: number;
    limit?: number;
    confidence: number;
    rawQuery: string;
}

// ============================================
// LLM PROMPT
// ============================================

const LLM_EXTRACTION_PROMPT = `Kamu adalah sistem klasifikasi intent untuk chatbot toko. Ekstrak informasi dari pertanyaan user.

KATEGORI INTENT:
- superlative_query: Pertanyaan dengan "ter-" atau "paling" (termurah, termahal, terbanyak, tersedikit)
- budget_query: Pertanyaan dengan batasan harga/budget (bajet 5juta, maksimal 10jt, kurang dari 3juta, di bawah 7juta, di atas 1juta)
- aggregation_query: Pertanyaan perhitungan (total, rata-rata, jumlah, berapa banyak)
- comparison_query: Membandingkan 2 atau lebih item
- simple_search: Mencari produk/informasi biasa
- general_chat: Percakapan umum, salam, terima kasih

ATURAN PENTING:
1. "entity" = HANYA nama produk atau kategori yang dicari (BUKAN kalimat lengkap!)
   - Ekstrak HANYA kata benda produk, bukan kata tanya atau kata kerja
   - Contoh: "apakah ada laptop?" → entity: "laptop" (bukan "apakah ada laptop")
   - Contoh: "ada HP murah?" → entity: "HP" (bukan "ada HP murah")
2. "attribute" = kolom data: "harga", "stok", atau lainnya
3. "operator":
   - Untuk superlative: MIN (termurah/tersedikit) atau MAX (termahal/terbanyak)
   - Untuk budget_query: LTE (di bawah/kurang dari/maksimal) atau GTE (di atas/lebih dari/minimal)
4. "value" = nilai budget dalam angka penuh (misal: 7000000 untuk 7juta, 500000 untuk 500ribu)
5. "limit" = jumlah yang diminta (default 5 untuk budget_query, 1 untuk superlative)

CONTOH:
- "mie instant termurah" → {"intent":"superlative_query","entity":"mie instant","attribute":"harga","operator":"MIN","limit":1}
- "5 laptop termahal" → {"intent":"superlative_query","entity":"laptop","attribute":"harga","operator":"MAX","limit":5}
- "laptop dengan bajet 7juta" → {"intent":"budget_query","entity":"laptop","attribute":"harga","operator":"LTE","value":7000000,"limit":5}
- "apakah ada laptop di bawah 7juta?" → {"intent":"budget_query","entity":"laptop","attribute":"harga","operator":"LTE","value":7000000,"limit":5}
- "HP di atas 5juta" → {"intent":"budget_query","entity":"HP","attribute":"harga","operator":"GTE","value":5000000,"limit":5}
- "berapa total stok" → {"intent":"aggregation_query","attribute":"stok","operator":"SUM"}
- "cari beras premium" → {"intent":"simple_search","entity":"beras premium"}
- "ada laptop?" → {"intent":"simple_search","entity":"laptop"}
- "halo" → {"intent":"general_chat"}

Pertanyaan: "{query}"

Jawab HANYA dengan JSON valid, tanpa penjelasan atau markdown.`;

// ============================================
// LLM DETECTION
// ============================================

async function detectByLLM(query: string): Promise<ExtractedQuery> {
    try {
        const prompt = LLM_EXTRACTION_PROMPT.replace("{query}", query);

        const response = await ollama.chat({
            model: "qwen2.5:3b",
            messages: [{ role: "user", content: prompt }],
            options: {
                temperature: 0.1,
            },
        });

        console.log("[LLM] Response:", response.message.content);

        // Parse JSON response
        const content = response.message.content.trim();

        // Extract JSON from response (handle potential markdown code blocks)
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
            value: parsed.value || undefined,
            limit: parsed.limit || (parsed.intent === "budget_query" ? 5 : 1),
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
// MAIN EXPORT
// ============================================

/**
 * Intent Detection menggunakan LLM
 * Menganalisis query user dan mengekstrak intent, entity, dan parameter lainnya
 */
export async function detectIntent(query: string): Promise<ExtractedQuery> {
    console.log(`[Intent] Analyzing: "${query}"`);

    const result = await detectByLLM(query);
    console.log(`[Intent] Result: ${result.intent}, entity: "${result.entity || 'none'}"`);

    return result;
}

/**
 * Quick check if query is general chat (no RAG needed)
 * Menggunakan pattern sederhana untuk cek cepat
 */
export async function isGeneralChat(query: string): Promise<boolean> {
    const patterns = [
        /^(halo|hai|hello|hi|hey)[\s!.,?]*$/i,
        /^selamat (pagi|siang|sore|malam)[\s!.,?]*$/i,
        /^(apa kabar|terima kasih|makasih|thanks)[\s!.,?]*$/i,
    ];
    return patterns.some(pattern => pattern.test(query.trim()));
}
