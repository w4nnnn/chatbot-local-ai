"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { updateOwnProfile } from "@/actions/users";
import { toast } from "sonner";

interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userName: string;
    userRole: string;
}

export function ProfileDialog({ open, onOpenChange, userName, userRole }: ProfileDialogProps) {
    const [name, setName] = useState(userName);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            toast.error("Password dan konfirmasi password tidak cocok");
            return;
        }

        if (password && password.length < 6) {
            toast.error("Password minimal 6 karakter");
            return;
        }

        setIsLoading(true);
        const result = await updateOwnProfile({
            name: name !== userName ? name : undefined,
            password: password || undefined,
        });

        if (result.success) {
            toast.success("Profil berhasil diperbarui");
            setPassword("");
            setConfirmPassword("");
            onOpenChange(false);
            // Refresh page to update name in sidebar
            window.location.reload();
        } else {
            toast.error(result.error || "Gagal memperbarui profil");
        }
        setIsLoading(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset form when closing
            setName(userName);
            setPassword("");
            setConfirmPassword("");
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Edit Profil
                    </DialogTitle>
                    <DialogDescription>
                        Ubah nama atau password akun Anda
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Role Info (read-only) */}
                        <div className="px-3 py-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Role</p>
                            <p className="text-sm font-medium text-gray-700 capitalize">{userRole}</p>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama Anda"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password Baru <span className="text-gray-400 font-normal">(opsional)</span>
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Kosongkan jika tidak ingin mengubah"
                                    className="pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        {password && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Ulangi password baru"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
