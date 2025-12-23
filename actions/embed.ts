"use server";

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

/**
 * Hapus embeddings untuk file tertentu
 */
export async function deleteFileEmbeddings(fileId: number): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        const lanceDb = await getLanceDB();
        const tableNames = await lanceDb.tableNames();

        if (!tableNames.includes(VECTOR_TABLE_NAME)) {
            return { success: true, message: "Tidak ada data embedding" };
        }

        const table = await lanceDb.openTable(VECTOR_TABLE_NAME);
        await table.delete(`file_id = ${fileId}`);

        return { success: true, message: "Embeddings berhasil dihapus" };
    } catch (error) {
        console.error("[Delete Embeddings] Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        };
    }
}
