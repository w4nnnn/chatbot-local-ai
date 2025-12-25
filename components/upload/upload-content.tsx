"use client";

import { useState, useEffect } from "react";
import { parseFile, saveToDatabase, getUploadedFiles, deleteFile, getExcelSheets } from "@/actions/upload";
import { embedFileData, deleteFileEmbeddings } from "@/actions/embed";
import { toast } from "sonner";

import {
    UploadDropzone,
    SheetSelector,
    DataPreview,
    FilesList,
    type ParsedData,
    type SheetInfo,
    type UploadedFileInfo,
    type SaveProgress,
} from "@/components/upload";

export function UploadContent() {
    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
    const [previewLimit, setPreviewLimit] = useState(10);
    const [isDragging, setIsDragging] = useState(false);
    const [saveProgress, setSaveProgress] = useState<SaveProgress>({ step: 'idle', message: '' });

    // State untuk sheet selection (Excel files)
    const [availableSheets, setAvailableSheets] = useState<SheetInfo[]>([]);
    const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [showSheetSelector, setShowSheetSelector] = useState(false);

    // Load uploaded files on mount
    useEffect(() => {
        let isMounted = true;

        async function fetchFiles() {
            const result = await getUploadedFiles();
            if (result.success && isMounted) {
                setUploadedFiles(result.files as UploadedFileInfo[]);
            }
        }

        fetchFiles();

        return () => {
            isMounted = false;
        };
    }, []);

    async function loadUploadedFiles() {
        const result = await getUploadedFiles();
        if (result.success) {
            setUploadedFiles(result.files as UploadedFileInfo[]);
        }
    }

    // ============================================
    // FILE HANDLING
    // ============================================

    async function handleFileSelect(file: File) {
        setIsLoading(true);
        setParsedData(null);
        setShowSheetSelector(false);
        setAvailableSheets([]);
        setSelectedSheets([]);

        const extension = file.name.split(".").pop()?.toLowerCase();

        // Check if it's an Excel file
        if (extension === "xlsx" || extension === "xls") {
            const formData = new FormData();
            formData.append("file", file);

            // Get list of sheets
            const sheetsResult = await getExcelSheets(formData);

            if (sheetsResult.success && sheetsResult.sheets.length > 1) {
                // Multiple sheets - show selector
                setAvailableSheets(sheetsResult.sheets);
                setSelectedSheets([sheetsResult.sheets[0].name]);
                setPendingFile(file);
                setShowSheetSelector(true);
                setIsLoading(false);
                toast.info(`File memiliki ${sheetsResult.sheets.length} sheet. Pilih sheet yang ingin diupload.`);
                return;
            } else if (sheetsResult.success && sheetsResult.sheets.length === 1) {
                // Single sheet - parse directly
                await parseAndPreview(file, [sheetsResult.sheets[0].name]);
                return;
            }
        }

        // CSV or fallback - parse directly
        await parseAndPreview(file);
    }

    async function parseAndPreview(file: File, sheetNames?: string[]) {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        const firstSheet = sheetNames?.[0];
        const result = await parseFile(formData, firstSheet);

        if (result.success && result.data) {
            const dataWithSheetInfo = {
                ...result.data,
                sheetName: sheetNames && sheetNames.length > 1
                    ? `${sheetNames.length} sheets (${sheetNames.join(', ')})`
                    : result.data.sheetName
            };
            setParsedData(dataWithSheetInfo);

            if (sheetNames && sheetNames.length > 1) {
                toast.success(`Preview sheet "${firstSheet}". Total ${sheetNames.length} sheet akan diupload.`);
            } else {
                toast.success(result.message);
            }
        } else {
            toast.error(result.message);
        }

        setIsLoading(false);
        setShowSheetSelector(false);
    }

    // ============================================
    // SHEET SELECTION
    // ============================================

    function handleSheetConfirm() {
        if (pendingFile && selectedSheets.length > 0) {
            parseAndPreview(pendingFile, selectedSheets);
        }
    }

    function toggleSheetSelection(sheetName: string) {
        setSelectedSheets(prev => {
            if (prev.includes(sheetName)) {
                const newSelection = prev.filter(s => s !== sheetName);
                return newSelection.length > 0 ? newSelection : prev;
            } else {
                return [...prev, sheetName];
            }
        });
    }

    function toggleSelectAll() {
        if (selectedSheets.length === availableSheets.length) {
            setSelectedSheets([availableSheets[0].name]);
        } else {
            setSelectedSheets(availableSheets.map(s => s.name));
        }
    }

    function handleSheetCancel() {
        setShowSheetSelector(false);
        setPendingFile(null);
        setAvailableSheets([]);
        setSelectedSheets([]);
    }

    // ============================================
    // DRAG & DROP
    // ============================================

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }

    // ============================================
    // SAVE & EMBED
    // ============================================

    async function handleSaveAndEmbed() {
        if (!parsedData) return;

        setIsSaving(true);

        const sheetsToSave = pendingFile && selectedSheets.length > 1
            ? selectedSheets
            : [parsedData.sheetName].filter(Boolean);

        let totalEmbedded = 0;
        let savedCount = 0;

        for (let i = 0; i < (sheetsToSave.length || 1); i++) {
            const sheetName = sheetsToSave[i];
            let dataToSave = parsedData;

            if (sheetsToSave.length > 1 && pendingFile && sheetName) {
                setSaveProgress({
                    step: 'saving',
                    message: `Memproses sheet "${sheetName}" (${i + 1}/${sheetsToSave.length})...`
                });

                const formData = new FormData();
                formData.append("file", pendingFile);
                const parseResult = await parseFile(formData, sheetName);

                if (!parseResult.success || !parseResult.data) {
                    toast.error(`Gagal memproses sheet "${sheetName}"`);
                    continue;
                }
                dataToSave = parseResult.data;
            } else {
                setSaveProgress({ step: 'saving', message: 'Menyimpan data ke database...' });
            }

            const saveResult = await saveToDatabase(dataToSave);

            if (!saveResult.success) {
                setSaveProgress({ step: 'error', message: saveResult.message });
                toast.error(saveResult.message);
                continue;
            }

            const fileId = saveResult.id;
            if (!fileId) {
                setSaveProgress({ step: 'error', message: 'Gagal mendapatkan ID file' });
                continue;
            }

            savedCount++;

            setSaveProgress({
                step: 'embedding',
                message: sheetsToSave.length > 1
                    ? `Embedding sheet "${sheetName}" (${i + 1}/${sheetsToSave.length})...`
                    : 'Menganalisis kolom dan membuat embedding...'
            });

            const embedResult = await embedFileData(fileId);

            if (embedResult.success) {
                totalEmbedded += embedResult.embeddedCount || 0;
            } else {
                toast.error(`Embedding gagal untuk sheet "${sheetName}": ${embedResult.message}`);
            }
        }

        if (savedCount > 0) {
            setSaveProgress({
                step: 'done',
                message: sheetsToSave.length > 1
                    ? `Berhasil! ${savedCount} sheet, ${totalEmbedded} total baris di-embed`
                    : `Berhasil! ${totalEmbedded} baris di-embed`,
            });

            toast.success(
                sheetsToSave.length > 1
                    ? `${savedCount} sheet berhasil disimpan!`
                    : 'Data berhasil disimpan dan di-embed!'
            );

            setTimeout(() => {
                setParsedData(null);
                setPendingFile(null);
                setSelectedSheets([]);
                setSaveProgress({ step: 'idle', message: '' });
            }, 2000);

            await loadUploadedFiles();
        } else {
            setSaveProgress({ step: 'error', message: 'Tidak ada data yang berhasil disimpan' });
        }

        setIsSaving(false);
    }

    function handleCancel() {
        setParsedData(null);
        setPendingFile(null);
        setSelectedSheets([]);
        setSaveProgress({ step: 'idle', message: '' });
    }

    // ============================================
    // DELETE
    // ============================================

    async function handleDelete(id: number) {
        try {
            const embedResult = await deleteFileEmbeddings(id);
            console.log("[Delete] Embedding result:", embedResult);

            if (!embedResult.success) {
                console.warn("[Delete] Warning saat hapus embedding:", embedResult.message);
            }

            const result = await deleteFile(id);

            if (result.success) {
                if (embedResult.success && embedResult.deletedCount && embedResult.deletedCount > 0) {
                    toast.success(`Data dan ${embedResult.deletedCount} embeddings berhasil dihapus`);
                } else {
                    toast.success(result.message);
                }
                await loadUploadedFiles();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("[Delete] Error:", error);
            toast.error("Gagal menghapus file");
        }
    }

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                    Upload Data
                </h1>
                <p className="text-slate-400">
                    Upload file Excel atau CSV untuk disimpan ke database
                </p>
            </div>

            {/* Upload Dropzone */}
            <UploadDropzone
                isLoading={isLoading}
                isDragging={isDragging}
                onFileSelect={handleFileSelect}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            />

            {/* Sheet Selector */}
            {showSheetSelector && availableSheets.length > 0 && (
                <SheetSelector
                    availableSheets={availableSheets}
                    selectedSheets={selectedSheets}
                    isLoading={isLoading}
                    onToggleSheet={toggleSheetSelection}
                    onToggleAll={toggleSelectAll}
                    onConfirm={handleSheetConfirm}
                    onCancel={handleSheetCancel}
                />
            )}

            {/* Data Preview */}
            {parsedData && (
                <DataPreview
                    data={parsedData}
                    previewLimit={previewLimit}
                    saveProgress={saveProgress}
                    isSaving={isSaving}
                    onShowMore={() => setPreviewLimit((prev) => prev + 50)}
                    onCancel={handleCancel}
                    onSaveAndEmbed={handleSaveAndEmbed}
                />
            )}

            {/* Files List */}
            <FilesList
                files={uploadedFiles}
                onDelete={handleDelete}
            />
        </div>
    );
}
