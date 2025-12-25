"use client";

import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { getFileTypeColor } from "./types";

interface UploadDropzoneProps {
    isLoading: boolean;
    isDragging: boolean;
    onFileSelect: (file: File) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

export function UploadDropzone({
    isLoading,
    isDragging,
    onFileSelect,
    onDragOver,
    onDragLeave,
    onDrop,
}: UploadDropzoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    }

    return (
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
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
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
    );
}
