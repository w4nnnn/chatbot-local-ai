"use server";

import * as XLSX from "xlsx";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { uploadedFiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ParsedData = {
    headers: string[];
    rows: Record<string, unknown>[];
    rowCount: number;
    filename: string;
    fileType: string;
};

export type UploadResult = {
    success: boolean;
    message: string;
    data?: ParsedData;
    error?: string;
};

export type SaveResult = {
    success: boolean;
    message: string;
    id?: number;
    error?: string;
};

/**
 * Parse file Excel/CSV dan kembalikan data untuk preview
 */
export async function parseFile(formData: FormData): Promise<UploadResult> {
    try {
        const file = formData.get("file") as File;

        if (!file) {
            return { success: false, message: "Tidak ada file yang dipilih", error: "NO_FILE" };
        }

        const filename = file.name;
        const extension = filename.split(".").pop()?.toLowerCase();

        if (!extension || !["csv", "xlsx", "xls"].includes(extension)) {
            return {
                success: false,
                message: "Format file tidak didukung. Gunakan CSV, XLSX, atau XLS",
                error: "INVALID_FORMAT",
            };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let headers: string[] = [];
        let rows: Record<string, unknown>[] = [];

        if (extension === "csv") {
            // Parse CSV dengan PapaParse
            const text = buffer.toString("utf-8");
            const result = Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim(),
            });

            headers = result.meta.fields || [];
            rows = result.data as Record<string, unknown>[];
        } else {
            // Parse Excel dengan xlsx
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Konversi ke JSON
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            rows = jsonData as Record<string, unknown>[];

            // Ambil headers dari row pertama
            if (rows.length > 0) {
                headers = Object.keys(rows[0]);
            }
        }

        return {
            success: true,
            message: `Berhasil memparse ${rows.length} baris data`,
            data: {
                headers,
                rows,
                rowCount: rows.length,
                filename,
                fileType: extension,
            },
        };
    } catch (error) {
        console.error("Error parsing file:", error);
        return {
            success: false,
            message: "Gagal memparse file",
            error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        };
    }
}

/**
 * Simpan data yang sudah diparsing ke database
 */
export async function saveToDatabase(data: ParsedData): Promise<SaveResult> {
    try {
        const result = await db
            .insert(uploadedFiles)
            .values({
                filename: `${Date.now()}_${data.filename}`,
                originalName: data.filename,
                fileType: data.fileType,
                headers: data.headers,
                data: data.rows,
                rowCount: data.rowCount,
            })
            .returning({ id: uploadedFiles.id });

        revalidatePath("/upload");

        return {
            success: true,
            message: `Berhasil menyimpan ${data.rowCount} baris data ke database`,
            id: result[0].id,
        };
    } catch (error) {
        console.error("Error saving to database:", error);
        return {
            success: false,
            message: "Gagal menyimpan ke database",
            error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        };
    }
}

/**
 * Ambil semua file yang sudah diupload
 */
export async function getUploadedFiles() {
    try {
        const files = await db
            .select({
                id: uploadedFiles.id,
                originalName: uploadedFiles.originalName,
                fileType: uploadedFiles.fileType,
                rowCount: uploadedFiles.rowCount,
                headers: uploadedFiles.headers,
                createdAt: uploadedFiles.createdAt,
            })
            .from(uploadedFiles)
            .orderBy(uploadedFiles.createdAt);

        return { success: true, files };
    } catch (error) {
        console.error("Error fetching files:", error);
        return { success: false, files: [], error: error instanceof Error ? error.message : "UNKNOWN_ERROR" };
    }
}

/**
 * Ambil detail file berdasarkan ID
 */
export async function getFileById(id: number) {
    try {
        const file = await db
            .select()
            .from(uploadedFiles)
            .where(eq(uploadedFiles.id, id))
            .limit(1);

        if (file.length === 0) {
            return { success: false, file: null, error: "FILE_NOT_FOUND" };
        }

        return { success: true, file: file[0] };
    } catch (error) {
        console.error("Error fetching file:", error);
        return { success: false, file: null, error: error instanceof Error ? error.message : "UNKNOWN_ERROR" };
    }
}

/**
 * Hapus file berdasarkan ID
 */
export async function deleteFile(id: number) {
    try {
        await db.delete(uploadedFiles).where(eq(uploadedFiles.id, id));
        revalidatePath("/upload");

        return { success: true, message: "File berhasil dihapus" };
    } catch (error) {
        console.error("Error deleting file:", error);
        return { success: false, message: "Gagal menghapus file", error: error instanceof Error ? error.message : "UNKNOWN_ERROR" };
    }
}
