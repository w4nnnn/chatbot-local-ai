"use client";

import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileUp, Loader2 } from "lucide-react";

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
            // Reset input value agar bisa upload file yang sama lagi
            e.target.value = '';
        }
    }

    return (
        <Card className="border-primary/20 bg-white/70 backdrop-blur-xl shadow-xl shadow-primary/5">
            <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-primary" />
                    Upload File
                </CardTitle>
                <CardDescription className="text-gray-500">
                    Drag & drop file atau klik untuk memilih. Format yang didukung: CSV, XLSX, XLS
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className={`
                        relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
                        ${isDragging
                            ? "border-primary bg-primary/5"
                            : "border-primary/30 hover:border-primary hover:bg-primary/5"
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
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="text-gray-500">Memproses file...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-primary shadow-lg shadow-primary/30">
                                <Upload className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <p className="text-lg text-gray-700 font-medium">
                                    Drag & drop file di sini
                                </p>
                                <p className="text-sm text-gray-400">
                                    atau klik untuk memilih file
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">CSV</Badge>
                                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">XLSX</Badge>
                                <Badge variant="outline" className="border-primary/20 text-primary/80 bg-primary/5">XLS</Badge>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
