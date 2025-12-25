"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2, CheckCircle2, Layers } from "lucide-react";
import type { SheetInfo } from "./types";

interface SheetSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableSheets: SheetInfo[];
    selectedSheets: string[];
    isLoading: boolean;
    onToggleSheet: (sheetName: string) => void;
    onToggleAll: () => void;
    onConfirm: () => void;
}

export function SheetSelectorDialog({
    open,
    onOpenChange,
    availableSheets,
    selectedSheets,
    isLoading,
    onToggleSheet,
    onToggleAll,
    onConfirm,
}: SheetSelectorDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        Pilih Sheet
                    </DialogTitle>
                    <DialogDescription>
                        File Excel memiliki {availableSheets.length} sheet. Pilih satu atau lebih sheet untuk diupload.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Select All Button */}
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                            {selectedSheets.length} / {availableSheets.length} dipilih
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleAll}
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                            {selectedSheets.length === availableSheets.length ? "Batalkan Semua" : "Pilih Semua"}
                        </Button>
                    </div>

                    {/* Sheet list with checkboxes */}
                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                        {availableSheets.map((sheet) => {
                            const isSelected = selectedSheets.includes(sheet.name);
                            return (
                                <div
                                    key={sheet.name}
                                    onClick={() => onToggleSheet(sheet.name)}
                                    className={`
                                        flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                                        ${isSelected
                                            ? 'bg-primary/10 border border-primary/30'
                                            : 'bg-white border border-gray-200 hover:border-primary/20'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Checkbox */}
                                        <div className={`
                                            w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                            ${isSelected
                                                ? 'bg-primary border-primary'
                                                : 'border-gray-300 hover:border-primary/50'}`}>
                                            {isSelected && (
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            )}
                                        </div>
                                        <FileSpreadsheet className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                                        <span className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                                            {sheet.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-white text-gray-500 border-gray-200 text-xs">
                                            {sheet.rowCount} baris
                                        </Badge>
                                        <Badge variant="outline" className="bg-white text-gray-500 border-gray-200 text-xs">
                                            {sheet.columnCount} kolom
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Selected sheets summary */}
                    {selectedSheets.length > 0 && (
                        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                            <p className="text-sm text-gray-500 mb-2">Sheet yang akan diupload:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedSheets.map(name => (
                                    <Badge key={name} className="bg-primary/10 text-primary border-primary/20">
                                        <FileSpreadsheet className="h-3 w-3 mr-1" />
                                        {name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={selectedSheets.length === 0 || isLoading}
                        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
