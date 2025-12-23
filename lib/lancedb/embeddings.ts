import ollama from "ollama";

const EMBEDDING_MODEL = "nomic-embed-text";

/**
 * Generate embedding vector untuk satu teks
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const response = await ollama.embed({
        model: EMBEDDING_MODEL,
        input: text,
    });
    return response.embeddings[0];
}

/**
 * Generate embedding vectors untuk banyak teks (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await ollama.embed({
        model: EMBEDDING_MODEL,
        input: texts,
    });
    return response.embeddings;
}

/**
 * Deteksi apakah kolom berisi angka atau teks
 */
export function detectColumnType(values: unknown[]): "number" | "text" {
    // Ambil sample (max 100 nilai pertama)
    const sample = values
        .slice(0, 100)
        .filter((v) => v !== null && v !== undefined && v !== "");

    if (sample.length === 0) return "text";

    // Hitung berapa banyak yang angka
    const numberCount = sample.filter((v) => {
        if (typeof v === "number") return true;
        if (typeof v === "string") {
            const trimmed = v.trim();
            if (trimmed === "") return false;
            const num = Number(trimmed);
            return !isNaN(num);
        }
        return false;
    }).length;

    // Jika > 80% adalah angka, anggap kolom angka
    return numberCount / sample.length > 0.8 ? "number" : "text";
}

/**
 * Klasifikasikan semua kolom berdasarkan datanya
 */
export function classifyColumns(
    headers: string[],
    rows: Record<string, unknown>[]
): { textColumns: string[]; numberColumns: string[] } {
    const textColumns: string[] = [];
    const numberColumns: string[] = [];

    for (const header of headers) {
        const values = rows.map((row) => row[header]);
        const type = detectColumnType(values);

        if (type === "text") {
            textColumns.push(header);
        } else {
            numberColumns.push(header);
        }
    }

    return { textColumns, numberColumns };
}

/**
 * Buat teks untuk embedding dari satu baris data
 * Hanya menggunakan kolom teks
 */
export function createEmbeddingText(
    row: Record<string, unknown>,
    textColumns: string[]
): string {
    const parts: string[] = [];

    for (const col of textColumns) {
        const value = row[col];
        if (value !== null && value !== undefined && value !== "") {
            parts.push(`${col}: ${value}`);
        }
    }

    return parts.join(". ");
}
