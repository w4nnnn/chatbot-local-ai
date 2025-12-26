"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createUser, updateUser, type UserData, type CreateUserInput, type UpdateUserInput } from "@/actions/users";
import { AVAILABLE_ROLES } from "@/lib/db/schema";
import { toast } from "sonner";

interface UserFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserData | null;
    onSuccess: () => void;
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        password: "",
        role: "user",
    });

    const isEditMode = !!user;

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                name: user.name,
                password: "",
                role: user.role || "user",
            });
        } else {
            setFormData({
                username: "",
                name: "",
                password: "",
                role: "user",
            });
        }
    }, [user, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isEditMode && user) {
                const updateData: UpdateUserInput = {
                    name: formData.name,
                    role: formData.role,
                };

                const result = await updateUser(user.id, updateData);

                if (result.success) {
                    toast.success("User berhasil diperbarui");
                    onSuccess();
                } else {
                    toast.error(result.error || "Gagal memperbarui user");
                }
            } else {
                const createData: CreateUserInput = {
                    username: formData.username,
                    name: formData.name || formData.username,
                    email: `${formData.username}@local.app`,
                    password: formData.password,
                    role: formData.role,
                };

                const result = await createUser(createData);

                if (result.success) {
                    toast.success("User berhasil dibuat");
                    onSuccess();
                } else {
                    toast.error(result.error || "Gagal membuat user");
                }
            }
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit User" : "Tambah User Baru"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Perbarui informasi user di bawah ini."
                            : "Isi form di bawah untuk membuat user baru."
                        }
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Masukkan username"
                                disabled={isEditMode}
                                required={!isEditMode}
                            />
                            {isEditMode && (
                                <p className="text-xs text-gray-500">Username tidak dapat diubah</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>
                        {!isEditMode && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Minimal 6 karakter"
                                    required
                                    minLength={6}
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_ROLES.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isEditMode ? "Menyimpan..." : "Membuat..."}
                                </>
                            ) : (
                                isEditMode ? "Simpan Perubahan" : "Buat User"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
