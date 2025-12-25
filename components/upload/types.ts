import type { ParsedData, SheetInfo } from "@/actions/upload";

// Types untuk Upload Page
export type UploadedFileInfo = {
    id: number;
    originalName: string;
    fileType: string;
    rowCount: number;
    headers: string[];
    createdAt: Date;
};

export type SaveProgress = {
    step: 'idle' | 'saving' | 'embedding' | 'done' | 'error';
    message: string;
    textColumns?: string[];
    numberColumns?: string[];
};

// Re-export types from actions
export type { ParsedData, SheetInfo };

// Helper function untuk warna file type
export function getFileTypeColor(type: string): string {
    switch (type.toLowerCase()) {
        case "csv":
            return "border-green-500/50 text-green-400 bg-green-500/10";
        case "xlsx":
            return "border-blue-500/50 text-blue-400 bg-blue-500/10";
        case "xls":
            return "border-orange-500/50 text-orange-400 bg-orange-500/10";
        default:
            return "border-slate-500/50 text-slate-400 bg-slate-500/10";
    }
}
