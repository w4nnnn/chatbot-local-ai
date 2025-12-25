"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Loader2, CheckCircle2, XCircle, Sparkles, FileSpreadsheet } from "lucide-react";
import type { ParsedData, SaveProgress } from "./types";
import { getFileTypeColor } from "./types";
import { cn } from "@/lib/utils";

interface DataPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: ParsedData;
    previewLimit: number;
    saveProgress: SaveProgress;
    isSaving: boolean;
    isLoading?: boolean;
    onShowMore: () => void;
    onSaveAndEmbed: () => void;
    // Sheet tabs props
    selectedSheets?: string[];
    activeSheet?: string;
    onChangeSheet?: (sheetName: string) => void;
}

export function DataPreviewDialog({
    open,
    onOpenChange,
    data,
    previewLimit,
    saveProgress,
    isSaving,
    isLoading,
    onShowMore,
    onSaveAndEmbed,
    selectedSheets = [],
    activeSheet,
    onChangeSheet,
}: DataPreviewDialogProps) {
    const hasMultipleSheets = selectedSheets.length > 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Preview Data
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 flex-wrap">
                        <span className="text-primary font-medium">{data.filename}</span>
                        <span>•</span>
                        <span>{data.rowCount} baris</span>
                        <span>•</span>
                        <span>{data.headers.length} kolom</span>
                        <Badge variant="outline" className={getFileTypeColor(data.fileType)}>
                            {data.fileType.toUpperCase()}
                        </Badge>
                        {hasMultipleSheets && (
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                                {selectedSheets.length} sheets dipilih
                            </Badge>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden space-y-4">
                    {/* Sheet Tabs */}
                    {hasMultipleSheets && (
                        <div className="flex flex-wrap gap-2">
                            {selectedSheets.map((sheet) => (
                                <Button
                                    key={sheet}
                                    variant={activeSheet === sheet ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onChangeSheet?.(sheet)}
                                    disabled={isLoading}
                                    className={cn(
                                        "gap-2",
                                        activeSheet === sheet
                                            ? "bg-primary text-white"
                                            : "border-primary/30 text-primary hover:bg-primary/10"
                                    )}
                                >
                                    <FileSpreadsheet className="h-3 w-3" />
                                    {sheet}
                                    {isLoading && activeSheet === sheet && (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Headers Info */}
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Kolom:</p>
                        <div className="flex flex-wrap gap-2">
                            {data.headers.map((header, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-primary/5 text-primary border border-primary/20">
                                    {header}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Separator className="bg-primary/10" />

                    {/* Data Table */}
                    <ScrollArea className="h-[300px] rounded-lg border border-primary/10">
                        <Table>
                            <TableHeader className="sticky top-0 bg-primary/5 backdrop-blur">
                                <TableRow className="border-primary/10 hover:bg-primary/5">
                                    <TableHead className="text-primary w-16">#</TableHead>
                                    {data.headers.map((header, idx) => (
                                        <TableHead key={idx} className="text-primary whitespace-nowrap font-medium">
                                            {header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.rows.slice(0, previewLimit).map((row, rowIdx) => (
                                    <TableRow key={rowIdx} className="border-primary/10 hover:bg-primary/5">
                                        <TableCell className="text-gray-400 font-mono text-xs">
                                            {rowIdx + 1}
                                        </TableCell>
                                        {data.headers.map((header, colIdx) => (
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
                    {data.rows.length > previewLimit && (
                        <div className="text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onShowMore}
                                className="text-primary hover:text-primary/80 hover:bg-primary/5"
                            >
                                Tampilkan lebih banyak ({data.rows.length - previewLimit} tersisa)
                            </Button>
                        </div>
                    )}

                    {/* Progress Indicator */}
                    {saveProgress.step !== 'idle' && (
                        <SaveProgressIndicator progress={saveProgress} />
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Batal
                    </Button>
                    <Button
                        onClick={onSaveAndEmbed}
                        disabled={isSaving || saveProgress.step === 'done'}
                        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
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
                                Simpan
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Sub-component for progress indicator
function SaveProgressIndicator({ progress }: { progress: SaveProgress }) {
    return (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="space-y-3">
                {/* Step 1: Saving */}
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${progress.step === 'saving'
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : ['embedding', 'done'].includes(progress.step)
                            ? 'bg-emerald-100 border-2 border-emerald-500'
                            : progress.step === 'error'
                                ? 'bg-red-100 border-2 border-red-500'
                                : 'bg-gray-100 border-2 border-gray-300'
                        }`}>
                        {progress.step === 'saving' ? (
                            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                        ) : ['embedding', 'done'].includes(progress.step) ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : progress.step === 'error' ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                            <span className="text-gray-500 text-sm">1</span>
                        )}
                    </div>
                    <span className={`text-sm ${progress.step === 'saving' ? 'text-blue-600 font-medium'
                        : ['embedding', 'done'].includes(progress.step) ? 'text-emerald-600'
                            : 'text-gray-500'
                        }`}>
                        Menyimpan ke Database
                    </span>
                </div>

                {/* Step 2: Embedding */}
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${progress.step === 'embedding'
                        ? 'bg-primary/20 border-2 border-primary'
                        : progress.step === 'done'
                            ? 'bg-emerald-100 border-2 border-emerald-500'
                            : progress.step === 'error' && progress.message.includes('embed')
                                ? 'bg-red-100 border-2 border-red-500'
                                : 'bg-gray-100 border-2 border-gray-300'
                        }`}>
                        {progress.step === 'embedding' ? (
                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        ) : progress.step === 'done' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                            <span className="text-gray-500 text-sm">2</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <span className={`text-sm ${progress.step === 'embedding' ? 'text-primary font-medium'
                            : progress.step === 'done' ? 'text-emerald-600'
                                : 'text-gray-500'
                            }`}>
                            {progress.step === 'done' ? (
                                <>
                                    Embedding Selesai
                                    <span className="block text-xs text-gray-400 mt-0.5">
                                        Kolom teks: {progress.textColumns?.join(', ')}
                                    </span>
                                </>
                            ) : (
                                'Menganalisis & Embedding ke LanceDB'
                            )}
                        </span>
                    </div>
                </div>

                {/* Progress Message */}
                <div className={`text-sm mt-2 p-2 rounded ${progress.step === 'done'
                    ? 'bg-emerald-100 text-emerald-700'
                    : progress.step === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-white text-gray-600 border border-gray-100'
                    }`}>
                    {progress.step === 'done' && <CheckCircle2 className="inline h-4 w-4 mr-2" />}
                    {progress.step === 'error' && <XCircle className="inline h-4 w-4 mr-2" />}
                    {progress.step === 'saving' && <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />}
                    {progress.step === 'embedding' && <Sparkles className="inline h-4 w-4 mr-2 animate-pulse" />}
                    {progress.message}
                </div>
            </div>
        </div>
    );
}
