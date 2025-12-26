"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Shield, Loader2, Info } from "lucide-react";
import { getRolePermissions, updateRolePermission } from "@/actions/role-permissions";
import { AVAILABLE_ROLES, AVAILABLE_MENUS } from "@/lib/db/schema";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type PermissionMatrix = Record<string, Record<string, boolean>>;

export function RolePermission() {
    const [permissions, setPermissions] = useState<PermissionMatrix>({});
    const [isLoading, setIsLoading] = useState(true);
    const [updatingCell, setUpdatingCell] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchPermissions = async () => {
            const result = await getRolePermissions();
            if (mounted) {
                if (result.success && result.data) {
                    setPermissions(result.data);
                } else {
                    toast.error(result.error || "Gagal memuat data permission");
                }
                setIsLoading(false);
            }
        };

        fetchPermissions();

        return () => {
            mounted = false;
        };
    }, []);

    const handleToggle = async (role: string, menuId: string, currentValue: boolean) => {
        const cellKey = `${role}-${menuId}`;
        setUpdatingCell(cellKey);

        // Optimistic update
        const newValue = !currentValue;
        setPermissions((prev) => ({
            ...prev,
            [role]: {
                ...prev[role],
                [menuId]: newValue,
            },
        }));

        const result = await updateRolePermission(role, menuId, newValue);

        if (!result.success) {
            // Revert on error
            setPermissions((prev) => ({
                ...prev,
                [role]: {
                    ...prev[role],
                    [menuId]: currentValue,
                },
            }));
            toast.error(result.error || "Gagal memperbarui permission");
        } else {
            toast.success(`Permission ${newValue ? "diaktifkan" : "dinonaktifkan"}`);
        }

        setUpdatingCell(null);
    };

    const isDisabled = (role: string, menuId: string) => {
        // Superadmin cannot disable their own access to permissions
        return role === "superadmin" && menuId === "permissions";
    };

    const roleBadgeColors: Record<string, string> = {
        superadmin: "bg-violet-100 text-violet-700 border-violet-200",
        admin: "bg-blue-100 text-blue-700 border-blue-200",
        user: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Role & Permission</h1>
                        <p className="text-sm text-gray-500">Kelola akses menu untuk setiap role</p>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Tentang Role & Permission</p>
                    <p className="text-blue-600">
                        Gunakan toggle untuk mengaktifkan atau menonaktifkan akses menu untuk setiap role.
                        Perubahan akan langsung berlaku untuk user dengan role tersebut saat mereka login ulang.
                    </p>
                </div>
            </div>

            {/* Permission Matrix Table */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[200px]">Menu</TableHead>
                                {AVAILABLE_ROLES.map((role) => (
                                    <TableHead key={role} className="text-center">
                                        <Badge className={`${roleBadgeColors[role]} font-medium`}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </Badge>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {AVAILABLE_MENUS.map((menu) => (
                                <TableRow key={menu.id}>
                                    <TableCell className="font-medium">{menu.label}</TableCell>
                                    {AVAILABLE_ROLES.map((role) => {
                                        const cellKey = `${role}-${menu.id}`;
                                        const isUpdating = updatingCell === cellKey;
                                        const canAccess = permissions[role]?.[menu.id] ?? false;
                                        const disabled = isDisabled(role, menu.id);

                                        return (
                                            <TableCell key={cellKey} className="text-center">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="inline-flex items-center justify-center">
                                                                {isUpdating ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                                ) : (
                                                                    <Switch
                                                                        checked={canAccess}
                                                                        onCheckedChange={() => handleToggle(role, menu.id, canAccess)}
                                                                        disabled={disabled}
                                                                        className={disabled ? "opacity-50 cursor-not-allowed" : ""}
                                                                    />
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        {disabled && (
                                                            <TooltipContent>
                                                                <p>Superadmin harus selalu memiliki akses ke Role & Permission</p>
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-primary rounded-full"></div>
                    <span>Akses Diizinkan</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-gray-200 rounded-full"></div>
                    <span>Akses Ditolak</span>
                </div>
            </div>
        </div>
    );
}
