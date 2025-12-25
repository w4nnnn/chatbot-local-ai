"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Loader2, CheckCircle2, XCircle, Sparkles, Layers } from "lucide-react";
import type { ParsedData, SaveProgress } from "./types";
import { getFileTypeColor } from "./types";

interface DataPreviewProps {
    data: ParsedData;
    previewLimit: number;
    saveProgress: SaveProgress;
    isSaving: boolean;
    onShowMore: () => void;
    onCancel: () => void;
    onSaveAndEmbed: () => void;
}

export function DataPreview({
    data,
    previewLimit,
    saveProgress,
    isSaving,
    onShowMore,
    onCancel,
    onSaveAndEmbed,
}: DataPreviewProps) {
    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-slate-200 flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Preview Data
                        </CardTitle>
                        <CardDescription className="mt-1">
                            <span className="text-blue-400">{data.filename}</span>
                            {data.sheetName && (
                                <>
                                    {" • "}
                                    <span className="text-purple-400">Sheet: {data.sheetName}</span>
                                </>
                            )}
                            {" • "}
                            <span>{data.rowCount} baris</span>
                            {" • "}
                            <span>{data.headers.length} kolom</span>
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {data.sheetName && (
                            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                <Layers className="h-3 w-3 mr-1" />
                                {data.sheetName}
                            </Badge>
                        )}
                        <Badge variant="outline" className={getFileTypeColor(data.fileType)}>
                            {data.fileType.toUpperCase()}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Headers Info */}
                <div>
                    <p className="text-sm text-slate-400 mb-2">Kolom:</p>
                    <div className="flex flex-wrap gap-2">
                        {data.headers.map((header, idx) => (
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
                                {data.headers.map((header, idx) => (
                                    <TableHead key={idx} className="text-slate-400 whitespace-nowrap">
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.rows.slice(0, previewLimit).map((row, rowIdx) => (
                                <TableRow key={rowIdx} className="border-slate-800 hover:bg-slate-800/30">
                                    <TableCell className="text-slate-500 font-mono text-xs">
                                        {rowIdx + 1}
                                    </TableCell>
                                    {data.headers.map((header, colIdx) => (
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
                {data.rows.length > previewLimit && (
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onShowMore}
                            className="text-slate-400 hover:text-slate-200"
                        >
                            Tampilkan lebih banyak ({data.rows.length - previewLimit} tersisa)
                        </Button>
                    </div>
                )}

                {/* Progress Indicator */}
                {saveProgress.step !== 'idle' && (
                    <SaveProgressIndicator progress={saveProgress} />
                )}

                <Separator className="bg-slate-800" />

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Batal
                    </Button>
                    <Button
                        onClick={onSaveAndEmbed}
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
    );
}

// Sub-component for progress indicator
function SaveProgressIndicator({ progress }: { progress: SaveProgress }) {
    return (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="space-y-3">
                {/* Step 1: Saving */}
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${progress.step === 'saving'
                        ? 'bg-blue-500/20 border-2 border-blue-500'
                        : ['embedding', 'done'].includes(progress.step)
                            ? 'bg-green-500/20 border-2 border-green-500'
                            : progress.step === 'error'
                                ? 'bg-red-500/20 border-2 border-red-500'
                                : 'bg-slate-700 border-2 border-slate-600'
                        }`}>
                        {progress.step === 'saving' ? (
                            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                        ) : ['embedding', 'done'].includes(progress.step) ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : progress.step === 'error' ? (
                            <XCircle className="h-4 w-4 text-red-400" />
                        ) : (
                            <span className="text-slate-400 text-sm">1</span>
                        )}
                    </div>
                    <span className={`text-sm ${progress.step === 'saving' ? 'text-blue-400'
                        : ['embedding', 'done'].includes(progress.step) ? 'text-green-400'
                            : 'text-slate-400'
                        }`}>
                        Menyimpan ke Database
                    </span>
                </div>

                {/* Step 2: Embedding */}
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${progress.step === 'embedding'
                        ? 'bg-purple-500/20 border-2 border-purple-500'
                        : progress.step === 'done'
                            ? 'bg-green-500/20 border-2 border-green-500'
                            : progress.step === 'error' && progress.message.includes('embed')
                                ? 'bg-red-500/20 border-2 border-red-500'
                                : 'bg-slate-700 border-2 border-slate-600'
                        }`}>
                        {progress.step === 'embedding' ? (
                            <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                        ) : progress.step === 'done' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                            <span className="text-slate-400 text-sm">2</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <span className={`text-sm ${progress.step === 'embedding' ? 'text-purple-400'
                            : progress.step === 'done' ? 'text-green-400'
                                : 'text-slate-400'
                            }`}>
                            {progress.step === 'done' ? (
                                <>
                                    Embedding Selesai
                                    <span className="block text-xs text-slate-500 mt-0.5">
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
                    ? 'bg-green-500/10 text-green-400'
                    : progress.step === 'error'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-slate-700/50 text-slate-300'
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
