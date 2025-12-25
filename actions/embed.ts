"use server";

import Fuse from "fuse.js";
import { getLanceDB, VECTOR_TABLE_NAME } from "@/lib/lancedb";
import {
    generateEmbeddings,
    classifyColumns,
    createEmbeddingText,
} from "@/lib/lancedb/embeddings";
import { db } from "@/lib/db";
import { uploadedFiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type EmbedResult = {
    success: boolean;
    message: string;
    embeddedCount?: number;
    textColumns?: string[];
    numberColumns?: string[];
    error?: string;
};

// Type untuk dokumen di LanceDB
type DocumentRecord = {
    id: string;
    file_id: number;
    row_index: number;
    text: string;
    vector: number[];
    metadata: string; // JSON string
    [key: string]: unknown; // Index signature for LanceDB compatibility
};

/**
 * Embed data dari file yang sudah diupload ke LanceDB
 */
export async function embedFileData(fileId: number): Promise<EmbedResult> {
    try {
        // 1. Ambil data file dari SQLite
        const file = await db
            .select()
            .from(uploadedFiles)
            .where(eq(uploadedFiles.id, fileId))
            .limit(1);

        if (file.length === 0) {
            return {
                success: false,
                message: "File tidak ditemukan",
                error: "FILE_NOT_FOUND",
            };
        }

        const { headers, data: rows, originalName } = file[0];

        if (!rows || rows.length === 0) {
            return {
                success: false,
                message: "File tidak memiliki data",
                error: "NO_DATA",
            };
        }

        // 2. Klasifikasi kolom (teks vs angka)
        const { textColumns, numberColumns } = classifyColumns(
            headers as string[],
            rows as Record<string, unknown>[]
        );

        if (textColumns.length === 0) {
            return {
                success: false,
                message: "Tidak ada kolom teks yang bisa di-embed",
                textColumns: [],
                numberColumns,
                error: "NO_TEXT_COLUMNS",
            };
        }

        console.log(`[Embed] File: ${originalName}`);
        console.log(`[Embed] Text columns: ${textColumns.join(", ")}`);
        console.log(`[Embed] Number columns: ${numberColumns.join(", ")}`);

        // 3. Buat teks untuk embedding
        const textsToEmbed: string[] = [];
        const rowsData = rows as Record<string, unknown>[];

        for (const row of rowsData) {
            const text = createEmbeddingText(row, textColumns);
            textsToEmbed.push(text);
        }

        // 4. Generate embeddings (batch)
        console.log(`[Embed] Generating embeddings for ${textsToEmbed.length} rows...`);
        const embeddings = await generateEmbeddings(textsToEmbed);
        console.log(`[Embed] Generated ${embeddings.length} embeddings`);

        // 5. Siapkan data untuk LanceDB
        const documents: DocumentRecord[] = rowsData.map((row, index) => {
            // Buat metadata dari kolom angka
            const metadata: Record<string, unknown> = {
                file_id: fileId,
                file_name: originalName,
            };

            // Tambahkan semua kolom ke metadata
            for (const col of headers as string[]) {
                metadata[col] = row[col];
            }

            return {
                id: `${fileId}_${index}`,
                file_id: fileId,
                row_index: index,
                text: textsToEmbed[index],
                vector: embeddings[index],
                metadata: JSON.stringify(metadata),
            };
        });

        // 6. Simpan ke LanceDB
        const lanceDb = await getLanceDB();

        // Cek apakah tabel sudah ada
        const tableNames = await lanceDb.tableNames();

        if (tableNames.includes(VECTOR_TABLE_NAME)) {
            // Hapus data lama untuk file ini dan tambah yang baru
            const table = await lanceDb.openTable(VECTOR_TABLE_NAME);

            // Hapus existing data untuk file ini
            await table.delete(`file_id = ${fileId}`);

            // Tambah data baru
            await table.add(documents);
            console.log(`[Embed] Added ${documents.length} documents to existing table`);
        } else {
            // Buat tabel baru
            await lanceDb.createTable(VECTOR_TABLE_NAME, documents);
            console.log(`[Embed] Created new table with ${documents.length} documents`);
        }

        return {
            success: true,
            message: `Berhasil embed ${documents.length} baris data`,
            embeddedCount: documents.length,
            textColumns,
            numberColumns,
        };
    } catch (error) {
        console.error("[Embed] Error:", error);
        return {
            success: false,
            message: "Gagal melakukan embedding",
            error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        };
    }
}

/**
 * Pencarian semantic di LanceDB
 */
export async function searchSimilar(
    query: string,
    limit: number = 5,
    fileId?: number
): Promise<{
    success: boolean;
    results: Array<{
        text: string;
        score: number;
        metadata: Record<string, unknown>;
    }>;
    error?: string;
}> {
    try {
        const lanceDb = await getLanceDB();
        const tableNames = await lanceDb.tableNames();

        if (!tableNames.includes(VECTOR_TABLE_NAME)) {
            return {
                success: false,
                results: [],
                error: "Belum ada data yang di-embed",
            };
        }

        // Generate embedding untuk query
        const { generateEmbedding } = await import("@/lib/lancedb/embeddings");
        const queryVector = await generateEmbedding(query);

        const table = await lanceDb.openTable(VECTOR_TABLE_NAME);

        // Buat query
        let searchQuery = table.vectorSearch(queryVector).limit(limit);

        // Filter by file_id jika ada
        if (fileId !== undefined) {
            searchQuery = searchQuery.where(`file_id = ${fileId}`);
        }

        const results = await searchQuery.toArray();

        return {
            success: true,
            results: results.map((r) => ({
                text: r.text as string,
                score: r._distance as number,
                metadata: JSON.parse(r.metadata as string),
            })),
        };
    } catch (error) {
        console.error("[Search] Error:", error);
        return {
            success: false,
            results: [],
            error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        };
    }
}

// Type untuk hasil search
export type SearchResult = {
    id: string;
    text: string;
    score: number;
    metadata: Record<string, unknown>;
    source: 'vector' | 'fuzzy' | 'hybrid';
};

/**
 * Hybrid Search - Kombinasi Vector Search + Fuzzy Search
 * Lebih toleran terhadap typo dan variasi penulisan
 */
export async function hybridSearch(
    query: string,
    limit: number = 5,
    fileId?: number
): Promise<{
    success: boolean;
    results: SearchResult[];
    error?: string;
}> {
    try {
        console.log(`[Hybrid Search] Query: "${query}"`);

        const lanceDb = await getLanceDB();
        const tableNames = await lanceDb.tableNames();

        if (!tableNames.includes(VECTOR_TABLE_NAME)) {
            return {
                success: false,
                results: [],
                error: "Belum ada data yang di-embed",
            };
        }

        const table = await lanceDb.openTable(VECTOR_TABLE_NAME);

        // 1. VECTOR SEARCH (Semantic)
        const { generateEmbedding } = await import("@/lib/lancedb/embeddings");
        const queryVector = await generateEmbedding(query);

        let vectorQuery = table.vectorSearch(queryVector).limit(limit * 2);
        if (fileId !== undefined) {
            vectorQuery = vectorQuery.where(`file_id = ${fileId}`);
        }

        const vectorResults = await vectorQuery.toArray();
        console.log(`[Hybrid Search] Vector results: ${vectorResults.length}`);

        // 2. FUZZY SEARCH (Keyword + Typo tolerance)
        // Ambil semua data untuk fuzzy search
        let allDataQuery = table.query().limit(500);
        if (fileId !== undefined) {
            allDataQuery = allDataQuery.where(`file_id = ${fileId}`);
        }
        const allData = await allDataQuery.toArray();

        // Konversi ke format yang bisa di-search
        const searchableData = allData.map((row) => {
            const metadata = JSON.parse(row.metadata as string);
            return {
                id: row.id as string,
                text: row.text as string,
                metadata,
                // Gabungkan text dari semua field untuk fuzzy search
                searchText: Object.values(metadata)
                    .filter(v => typeof v === 'string')
                    .join(' '),
            };
        });

        // Setup Fuse.js dengan konfigurasi fuzzy
        const fuse = new Fuse(searchableData, {
            keys: [
                { name: 'text', weight: 0.4 },
                { name: 'searchText', weight: 0.4 },
                { name: 'metadata.nama_produk', weight: 0.2 },
            ],
            threshold: 0.4,     // 0 = exact match, 1 = match anything
            distance: 100,      // toleransi jarak karakter
            includeScore: true,
            minMatchCharLength: 2,
        });

        const fuzzyResults = fuse.search(query).slice(0, limit * 2);
        console.log(`[Hybrid Search] Fuzzy results: ${fuzzyResults.length}`);

        // 3. COMBINE & DEDUPLICATE
        const combined = new Map<string, SearchResult & { hybridScore: number }>();

        // Vector results dengan weight 0.6
        vectorResults.forEach((r, index) => {
            const id = r.id as string;
            const distance = r._distance as number;
            const vectorScore = (1 - distance) * 0.6;
            const positionBonus = (1 - index / (limit * 2)) * 0.1;

            combined.set(id, {
                id,
                text: r.text as string,
                score: distance,
                metadata: JSON.parse(r.metadata as string),
                source: 'vector',
                hybridScore: vectorScore + positionBonus,
            });
        });

        // Fuzzy results dengan weight 0.4
        fuzzyResults.forEach((r, index) => {
            const id = r.item.id;
            const fuzzyScore = (1 - (r.score || 0)) * 0.4;
            const positionBonus = (1 - index / (limit * 2)) * 0.1;

            const existing = combined.get(id);
            if (existing) {
                // Boost score jika ditemukan di kedua search
                existing.hybridScore += fuzzyScore + positionBonus + 0.1;
                existing.source = 'hybrid';
                console.log(`[Hybrid Search] Boosted: ${id} (found in both)`);
            } else {
                combined.set(id, {
                    id,
                    text: r.item.text,
                    score: r.score || 0,
                    metadata: r.item.metadata,
                    source: 'fuzzy',
                    hybridScore: fuzzyScore + positionBonus,
                });
            }
        });

        // 4. SORT & LIMIT
        const sortedResults = Array.from(combined.values())
            .sort((a, b) => b.hybridScore - a.hybridScore)
            .slice(0, limit)
            .map(({ hybridScore, ...rest }) => ({
                ...rest,
                score: 1 - hybridScore, // Konversi kembali ke distance-like score
            }));

        console.log(`[Hybrid Search] Final results: ${sortedResults.length}`);
        sortedResults.forEach((r, i) => {
            const name = r.metadata.nama_produk || r.text.substring(0, 30);
            console.log(`  ${i + 1}. [${r.source}] ${name}`);
        });

        return {
            success: true,
            results: sortedResults,
        };
    } catch (error) {
        console.error("[Hybrid Search] Error:", error);
        return {
            success: false,
            results: [],
            error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        };
    }
}

export async function deleteFileEmbeddings(fileId: number): Promise<{
    success: boolean;
    message: string;
    deletedCount?: number;
}> {
    try {
        console.log(`[Delete Embeddings] Menghapus embeddings untuk file_id: ${fileId}`);

        const lanceDb = await getLanceDB();
        const tableNames = await lanceDb.tableNames();

        if (!tableNames.includes(VECTOR_TABLE_NAME)) {
            console.log("[Delete Embeddings] Tabel tidak ditemukan, tidak ada yang dihapus");
            return { success: true, message: "Tidak ada data embedding", deletedCount: 0 };
        }

        const table = await lanceDb.openTable(VECTOR_TABLE_NAME);

        // Hitung jumlah data sebelum delete
        const beforeCount = await table.countRows();
        console.log(`[Delete Embeddings] Total rows sebelum delete: ${beforeCount}`);

        // Hapus data dengan filter file_id
        // LanceDB menggunakan SQL-like filter syntax
        await table.delete(`file_id = ${fileId}`);

        // Hitung jumlah data setelah delete
        const afterCount = await table.countRows();
        console.log(`[Delete Embeddings] Total rows setelah delete: ${afterCount}`);

        const deletedCount = beforeCount - afterCount;
        console.log(`[Delete Embeddings] Berhasil menghapus ${deletedCount} embeddings`);

        return {
            success: true,
            message: `Berhasil menghapus ${deletedCount} embeddings`,
            deletedCount
        };
    } catch (error) {
        console.error("[Delete Embeddings] Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        };
    }
}
