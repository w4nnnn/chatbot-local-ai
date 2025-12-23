"use client";

import { useState, useRef, useEffect } from "react";
import { parseFile, saveToDatabase, getUploadedFiles, deleteFile, type ParsedData } from "@/actions/upload";
import { embedFileData, deleteFileEmbeddings } from "@/actions/embed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Upload, FileSpreadsheet, Trash2, Eye, Loader2, CheckCircle2, XCircle, FileUp, Sparkles } from "lucide-react";
import { toast } from "sonner";

type UploadedFileInfo = {
    id: number;
    originalName: string;
    fileType: string;
    rowCount: number;
    headers: string[];
    createdAt: Date;
};

type SaveProgress = {
    step: 'idle' | 'saving' | 'embedding' | 'done' | 'error';
    message: string;
    textColumns?: string[];
    numberColumns?: string[];
};

export default function UploadPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
    const [previewLimit, setPreviewLimit] = useState(10);
    const [isDragging, setIsDragging] = useState(false);
    const [saveProgress, setSaveProgress] = useState<SaveProgress>({ step: 'idle', message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    async function handleFileSelect(file: File) {
        setIsLoading(true);
        setParsedData(null);

        const formData = new FormData();
        formData.append("file", file);

        const result = await parseFile(formData);

        if (result.success && result.data) {
            setParsedData(result.data);
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }

        setIsLoading(false);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }

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

    async function handleSaveAndEmbed() {
        if (!parsedData) return;

        setIsSaving(true);

        // Step 1: Simpan ke Database
        setSaveProgress({ step: 'saving', message: 'Menyimpan data ke database...' });

        const saveResult = await saveToDatabase(parsedData);

        if (!saveResult.success) {
            setSaveProgress({ step: 'error', message: saveResult.message });
            toast.error(saveResult.message);
            setIsSaving(false);
            return;
        }

        const fileId = saveResult.id;
        if (!fileId) {
            setSaveProgress({ step: 'error', message: 'Gagal mendapatkan ID file' });
            setIsSaving(false);
            return;
        }

        // Step 2: Embed ke LanceDB
        setSaveProgress({ step: 'embedding', message: 'Menganalisis kolom dan membuat embedding...' });

        const embedResult = await embedFileData(fileId);

        if (embedResult.success) {
            setSaveProgress({
                step: 'done',
                message: `Berhasil! ${embedResult.embeddedCount} baris di-embed`,
                textColumns: embedResult.textColumns,
                numberColumns: embedResult.numberColumns,
            });

            toast.success('Data berhasil disimpan dan di-embed!', {
                description: `Kolom teks: ${embedResult.textColumns?.join(', ')}`,
            });

            // Reset setelah delay untuk menampilkan status done
            setTimeout(() => {
                setParsedData(null);
                setSaveProgress({ step: 'idle', message: '' });
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }, 2000);

            await loadUploadedFiles();
        } else {
            setSaveProgress({ step: 'error', message: embedResult.message });
            toast.error('Data tersimpan tapi embedding gagal: ' + embedResult.message);
        }

        setIsSaving(false);
    }

    function handleCancel() {
        setParsedData(null);
        setSaveProgress({ step: 'idle', message: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function handleDelete(id: number) {
        // Hapus embeddings terlebih dahulu
        await deleteFileEmbeddings(id);

        // Lalu hapus file dari SQLite
        const result = await deleteFile(id);
        if (result.success) {
            toast.success(result.message);
            await loadUploadedFiles();
        } else {
            toast.error(result.message);
        }
    }

    function getFileTypeColor(type: string) {
        switch (type) {
            case "csv":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "xlsx":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "xls":
                return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Upload Data
                    </h1>
                    <p className="text-slate-400">
                        Upload file Excel atau CSV untuk disimpan ke database
                    </p>
                </div>

                {/* Upload Area */}
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-slate-200 flex items-center gap-2">
                            <FileUp className="h-5 w-5" />
                            Upload File
                        </CardTitle>
                        <CardDescription>
                            Drag & drop file atau klik untuk memilih. Format yang didukung: CSV, XLSX, XLS
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`
                relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
                ${isDragging
                                    ? "border-blue-500 bg-blue-500/10"
                                    : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                                }
                ${isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
              `}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleInputChange}
                                className="hidden"
                            />

                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                                    <p className="text-slate-400">Memproses file...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                                        <Upload className="h-10 w-10 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-lg text-slate-300">
                                            Drag & drop file di sini
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            atau klik untuk memilih file
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className={getFileTypeColor("csv")}>CSV</Badge>
                                        <Badge variant="outline" className={getFileTypeColor("xlsx")}>XLSX</Badge>
                                        <Badge variant="outline" className={getFileTypeColor("xls")}>XLS</Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Area */}
                {parsedData && (
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-slate-200 flex items-center gap-2">
                                        <Eye className="h-5 w-5" />
                                        Preview Data
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        <span className="text-blue-400">{parsedData.filename}</span>
                                        {" • "}
                                        <span>{parsedData.rowCount} baris</span>
                                        {" • "}
                                        <span>{parsedData.headers.length} kolom</span>
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className={getFileTypeColor(parsedData.fileType)}>
                                    {parsedData.fileType.toUpperCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Headers Info */}
                            <div>
                                <p className="text-sm text-slate-400 mb-2">Kolom:</p>
                                <div className="flex flex-wrap gap-2">
                                    {parsedData.headers.map((header, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-slate-800 text-slate-300">
                                            {header}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-slate-800" />

                            {/* Data Table */}
                            <ScrollArea className="h-[400px] rounded-lg border border-slate-800">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-slate-900">
                                        <TableRow className="border-slate-800 hover:bg-slate-800/50">
                                            <TableHead className="text-slate-400 w-16">#</TableHead>
                                            {parsedData.headers.map((header, idx) => (
                                                <TableHead key={idx} className="text-slate-400 whitespace-nowrap">
                                                    {header}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedData.rows.slice(0, previewLimit).map((row, rowIdx) => (
                                            <TableRow key={rowIdx} className="border-slate-800 hover:bg-slate-800/30">
                                                <TableCell className="text-slate-500 font-mono text-xs">
                                                    {rowIdx + 1}
                                                </TableCell>
                                                {parsedData.headers.map((header, colIdx) => (
                                                    <TableCell key={colIdx} className="text-slate-300 whitespace-nowrap">
                                                        {String(row[header] ?? "")}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>

                            {/* Show More */}
                            {parsedData.rows.length > previewLimit && (
                                <div className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPreviewLimit((prev) => prev + 50)}
                                        className="text-slate-400 hover:text-slate-200"
                                    >
                                        Tampilkan lebih banyak ({parsedData.rows.length - previewLimit} tersisa)
                                    </Button>
                                </div>
                            )}

                            {/* Progress Indicator */}
                            {saveProgress.step !== 'idle' && (
                                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <div className="space-y-3">
                                        {/* Step 1: Saving */}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${saveProgress.step === 'saving'
                                                ? 'bg-blue-500/20 border-2 border-blue-500'
                                                : ['embedding', 'done'].includes(saveProgress.step)
                                                    ? 'bg-green-500/20 border-2 border-green-500'
                                                    : saveProgress.step === 'error'
                                                        ? 'bg-red-500/20 border-2 border-red-500'
                                                        : 'bg-slate-700 border-2 border-slate-600'
                                                }`}>
                                                {saveProgress.step === 'saving' ? (
                                                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                                                ) : ['embedding', 'done'].includes(saveProgress.step) ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                ) : saveProgress.step === 'error' ? (
                                                    <XCircle className="h-4 w-4 text-red-400" />
                                                ) : (
                                                    <span className="text-slate-400 text-sm">1</span>
                                                )}
                                            </div>
                                            <span className={`text-sm ${saveProgress.step === 'saving' ? 'text-blue-400'
                                                : ['embedding', 'done'].includes(saveProgress.step) ? 'text-green-400'
                                                    : 'text-slate-400'
                                                }`}>
                                                Menyimpan ke Database
                                            </span>
                                        </div>

                                        {/* Step 2: Embedding */}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${saveProgress.step === 'embedding'
                                                ? 'bg-purple-500/20 border-2 border-purple-500'
                                                : saveProgress.step === 'done'
                                                    ? 'bg-green-500/20 border-2 border-green-500'
                                                    : saveProgress.step === 'error' && saveProgress.message.includes('embed')
                                                        ? 'bg-red-500/20 border-2 border-red-500'
                                                        : 'bg-slate-700 border-2 border-slate-600'
                                                }`}>
                                                {saveProgress.step === 'embedding' ? (
                                                    <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                                                ) : saveProgress.step === 'done' ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                ) : (
                                                    <span className="text-slate-400 text-sm">2</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-sm ${saveProgress.step === 'embedding' ? 'text-purple-400'
                                                    : saveProgress.step === 'done' ? 'text-green-400'
                                                        : 'text-slate-400'
                                                    }`}>
                                                    {saveProgress.step === 'done' ? (
                                                        <>
                                                            Embedding Selesai
                                                            <span className="block text-xs text-slate-500 mt-0.5">
                                                                Kolom teks: {saveProgress.textColumns?.join(', ')}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        'Menganalisis & Embedding ke LanceDB'
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Message */}
                                        <div className={`text-sm mt-2 p-2 rounded ${saveProgress.step === 'done'
                                            ? 'bg-green-500/10 text-green-400'
                                            : saveProgress.step === 'error'
                                                ? 'bg-red-500/10 text-red-400'
                                                : 'bg-slate-700/50 text-slate-300'
                                            }`}>
                                            {saveProgress.step === 'done' && <CheckCircle2 className="inline h-4 w-4 mr-2" />}
                                            {saveProgress.step === 'error' && <XCircle className="inline h-4 w-4 mr-2" />}
                                            {saveProgress.step === 'saving' && <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />}
                                            {saveProgress.step === 'embedding' && <Sparkles className="inline h-4 w-4 mr-2 animate-pulse" />}
                                            {saveProgress.message}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Separator className="bg-slate-800" />

                            {/* Actions */}
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleSaveAndEmbed}
                                    disabled={isSaving || saveProgress.step === 'done'}
                                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : saveProgress.step === 'done' ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Selesai!
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Simpan & Embed
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Uploaded Files List */}
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-slate-200 flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            File yang Tersimpan
                        </CardTitle>
                        <CardDescription>
                            Daftar file yang sudah diupload dan tersimpan di database
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {uploadedFiles.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Belum ada file yang diupload</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {uploadedFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-slate-700/50">
                                                <FileSpreadsheet className="h-6 w-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-200">{file.originalName}</p>
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    <Badge variant="outline" className={`${getFileTypeColor(file.fileType)} text-xs`}>
                                                        {file.fileType.toUpperCase()}
                                                    </Badge>
                                                    <span>{file.rowCount} baris</span>
                                                    <span>•</span>
                                                    <span>{file.headers.length} kolom</span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(file.createdAt).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Delete Button */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-slate-900 border-slate-800">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-slate-200">
                                                            Hapus File?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Apakah Anda yakin ingin menghapus <strong>{file.originalName}</strong>?
                                                            Tindakan ini tidak dapat dibatalkan.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                                            Batal
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(file.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Hapus
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
