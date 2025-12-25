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
import { FileSpreadsheet, Trash2 } from "lucide-react";
import type { UploadedFileInfo } from "./types";
import { getFileTypeColor } from "./types";

interface FilesListProps {
    files: UploadedFileInfo[];
    onDelete: (id: number) => void;
}

export function FilesList({ files, onDelete }: FilesListProps) {
    return (
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
                {files.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
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
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
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
                                onClick={() => onDelete(file.id)}
                                className="bg-red-600 hover:bg-red-700"
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
