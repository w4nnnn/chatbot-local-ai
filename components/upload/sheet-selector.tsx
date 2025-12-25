"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileSpreadsheet, Loader2, CheckCircle2, Layers } from "lucide-react";
import type { SheetInfo } from "./types";

interface SheetSelectorProps {
    availableSheets: SheetInfo[];
    selectedSheets: string[];
    isLoading: boolean;
    onToggleSheet: (sheetName: string) => void;
    onToggleAll: () => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export function SheetSelector({
    availableSheets,
    selectedSheets,
    isLoading,
    onToggleSheet,
    onToggleAll,
    onConfirm,
    onCancel,
}: SheetSelectorProps) {
    return (
        <Card className="border-purple-800/50 bg-purple-950/30 backdrop-blur">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-slate-200 flex items-center gap-2">
                            <Layers className="h-5 w-5 text-purple-400" />
                            Pilih Sheet
                        </CardTitle>
                        <CardDescription>
                            File Excel memiliki {availableSheets.length} sheet. Pilih satu atau lebih sheet untuk diupload.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                        {selectedSheets.length} / {availableSheets.length} dipilih
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Select All Button */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Sheet yang tersedia:</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleAll}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    >
                        {selectedSheets.length === availableSheets.length ? "Batalkan Semua" : "Pilih Semua"}
                    </Button>
                </div>

                {/* Sheet list with checkboxes */}
                <div className="grid gap-2">
                    {availableSheets.map((sheet) => {
                        const isSelected = selectedSheets.includes(sheet.name);
                        return (
                            <div
                                key={sheet.name}
                                onClick={() => onToggleSheet(sheet.name)}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                                    ${isSelected
                                        ? 'bg-purple-500/20 border border-purple-500/50'
                                        : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Checkbox */}
                                    <div className={`
                                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                        ${isSelected
                                            ? 'bg-purple-500 border-purple-500'
                                            : 'border-slate-500 hover:border-slate-400'}
                                    `}>
                                        {isSelected && (
                                            <CheckCircle2 className="h-3 w-3 text-white" />
                                        )}
                                    </div>
                                    <FileSpreadsheet className={`h-5 w-5 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                                    <span className={`font-medium ${isSelected ? 'text-purple-300' : 'text-slate-300'}`}>
                                        {sheet.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-slate-700/50 text-slate-400 border-slate-600">
                                        {sheet.rowCount} baris
                                    </Badge>
                                    <Badge variant="outline" className="bg-slate-700/50 text-slate-400 border-slate-600">
                                        {sheet.columnCount} kolom
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Selected sheets summary */}
                {selectedSheets.length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-sm text-slate-400 mb-2">Sheet yang akan diupload:</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedSheets.map(name => (
                                <Badge key={name} className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                                    <FileSpreadsheet className="h-3 w-3 mr-1" />
                                    {name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <Separator className="bg-slate-700" />

                <div className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="border-slate-700 hover:bg-slate-800"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={selectedSheets.length === 0 || isLoading}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {selectedSheets.length === 1
                                    ? "Gunakan Sheet Ini"
                                    : `Gunakan ${selectedSheets.length} Sheet`}
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
