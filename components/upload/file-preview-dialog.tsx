"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Loader2, FileSpreadsheet } from "lucide-react";
import { getFileById } from "@/actions/upload";
import type { UploadedFileInfo } from "./types";
import { getFileTypeColor } from "./types";

interface FilePreviewDialogProps {
    file: UploadedFileInfo;
    trigger: React.ReactNode;
}

interface FileData {
    headers: string[];
    data: Record<string, unknown>[];
    rowCount: number;
}

export function FilePreviewDialog({ file, trigger }: FilePreviewDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [previewLimit, setPreviewLimit] = useState(20);
    const [error, setError] = useState<string | null>(null);

    const loadFileData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await getFileById(file.id);

            if (result.success && result.file) {
                setFileData({
                    headers: result.file.headers as string[],
                    data: result.file.data as Record<string, unknown>[],
                    rowCount: result.file.rowCount,
                });
            } else {
                setError("Gagal memuat data file");
            }
        } catch (err) {
            console.error("Error loading file data:", err);
            setError("Terjadi kesalahan saat memuat data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen && !fileData) {
            loadFileData();
        }
        if (!newOpen) {
            // Reset state when dialog is closed
            setPreviewLimit(20);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <div onClick={() => handleOpenChange(true)}>
                {trigger}
            </div>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Preview Data
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 flex-wrap">
                        <FileSpreadsheet className="h-4 w-4 text-primary" />
                        <span className="text-primary font-medium">
                            {file.originalName}
                            {file.sheetName && (
                                <span className="text-primary/70 font-normal"> ({file.sheetName})</span>
                            )}
                        </span>
                        <span>•</span>
                        <span>{file.rowCount} baris</span>
                        <span>•</span>
                        <span>{file.headers.length} kolom</span>
                        <Badge variant="outline" className={getFileTypeColor(file.fileType)}>
                            {file.fileType.toUpperCase()}
                        </Badge>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                            <p className="text-gray-500">Memuat data...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-red-500">
                            <p>{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadFileData}
                                className="mt-4"
                            >
                                Coba Lagi
                            </Button>
                        </div>
                    ) : fileData ? (
                        <>
                            {/* Headers Info */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Kolom:</p>
                                <div className="flex flex-wrap gap-2">
                                    {fileData.headers.map((header, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-primary/5 text-primary border border-primary/20">
                                            {header}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-primary/10" />

                            {/* Data Table */}
                            <ScrollArea className="h-[350px] rounded-lg border border-primary/10">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-primary/5 backdrop-blur">
                                        <TableRow className="border-primary/10 hover:bg-primary/5">
                                            <TableHead className="text-primary w-16">#</TableHead>
                                            {fileData.headers.map((header, idx) => (
                                                <TableHead key={idx} className="text-primary whitespace-nowrap font-medium">
                                                    {header}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fileData.data.slice(0, previewLimit).map((row, rowIdx) => (
                                            <TableRow key={rowIdx} className="border-primary/10 hover:bg-primary/5">
                                                <TableCell className="text-gray-400 font-mono text-xs">
                                                    {rowIdx + 1}
                                                </TableCell>
                                                {fileData.headers.map((header, colIdx) => (
                                                    <TableCell key={colIdx} className="text-gray-700 whitespace-nowrap">
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
                            {fileData.data.length > previewLimit && (
                                <div className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPreviewLimit((prev) => prev + 50)}
                                        className="text-primary hover:text-primary/80 hover:bg-primary/5"
                                    >
                                        Tampilkan lebih banyak ({fileData.data.length - previewLimit} tersisa)
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
