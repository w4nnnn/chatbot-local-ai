"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { FileSpreadsheet, Trash2, Eye } from "lucide-react";
import type { UploadedFileInfo } from "./types";
import { getFileTypeColor } from "./types";
import { FilePreviewDialog } from "./file-preview-dialog";

interface FilesListProps {
    files: UploadedFileInfo[];
    onDelete: (id: number) => void;
}

export function FilesList({ files, onDelete }: FilesListProps) {
    return (
        <Card className="border-primary/20 bg-white/70 backdrop-blur-xl shadow-xl shadow-primary/5">
            <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    File yang Tersimpan
                </CardTitle>
                <CardDescription className="text-gray-500">
                    Daftar file yang sudah diupload dan tersimpan di database
                </CardDescription>
            </CardHeader>
            <CardContent>
                {files.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada file yang diupload</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {files.map((file) => (
                            <FileItem key={file.id} file={file} onDelete={onDelete} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Sub-component for each file item
function FileItem({ file, onDelete }: { file: UploadedFileInfo; onDelete: (id: number) => void }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white border border-primary/10 shadow-sm">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <p className="font-medium text-gray-800">
                        {file.originalName}
                        {file.sheetName && (
                            <span className="text-primary/70 font-normal"> ({file.sheetName})</span>
                        )}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
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
                {/* Preview Button */}
                <FilePreviewDialog
                    file={file}
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    }
                />

                {/* Delete Button */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-primary/10">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-800">
                                Hapus File?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-500">
                                Apakah Anda yakin ingin menghapus <strong className="text-gray-700">{file.originalName}</strong>?
                                Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-200 text-gray-600 hover:bg-gray-50">
                                Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => onDelete(file.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

