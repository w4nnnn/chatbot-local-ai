"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserPlus, MoreHorizontal, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { getUsers, deleteUser, type UserData } from "@/actions/users";
import { UserFormDialog } from "./user-form-dialog";
import { toast } from "sonner";

const roleBadgeVariants: Record<string, "default" | "secondary" | "outline"> = {
    superadmin: "default",
    admin: "secondary",
    user: "outline",
};

export function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        const result = await getUsers();
        if (result.success && result.data) {
            setUsers(result.data);
        } else {
            toast.error(result.error || "Gagal memuat data user");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchUsers = async () => {
            const result = await getUsers();
            if (mounted) {
                if (result.success && result.data) {
                    setUsers(result.data);
                } else {
                    toast.error(result.error || "Gagal memuat data user");
                }
                setIsLoading(false);
            }
        };

        fetchUsers();

        return () => {
            mounted = false;
        };
    }, []);

    const handleDelete = async () => {
        if (!deletingUser) return;

        setIsDeleting(true);
        const result = await deleteUser(deletingUser.id);

        if (result.success) {
            toast.success("User berhasil dihapus");
            loadUsers();
        } else {
            toast.error(result.error || "Gagal menghapus user");
        }

        setIsDeleting(false);
        setDeletingUser(null);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingUser(null);
        loadUsers();
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Kelola User</h1>
                        <p className="text-sm text-gray-500">Manajemen akun pengguna sistem</p>
                    </div>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Tambah User
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Belum ada user terdaftar</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead>Username</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Dibuat</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium">{u.username || "-"}</TableCell>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={roleBadgeVariants[u.role || "user"] || "outline"}>
                                            {u.role || "user"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500">{formatDate(u.createdAt)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingUser(u)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeletingUser(u)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Form Dialog */}
            <UserFormDialog
                open={isFormOpen || !!editingUser}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsFormOpen(false);
                        setEditingUser(null);
                    }
                }}
                user={editingUser}
                onSuccess={handleFormSuccess}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus user <strong>{deletingUser?.username}</strong>?
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                "Hapus"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
