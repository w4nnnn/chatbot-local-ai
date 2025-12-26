"use server";

import { db } from "@/lib/db";
import { rolePermissions, AVAILABLE_ROLES, AVAILABLE_MENUS } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// Default permissions configuration
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
    superadmin: ["chat", "upload", "users", "permissions", "settings"],
    admin: ["chat", "upload"],
    user: ["chat"],
};

/**
 * Initialize default permissions for all roles
 * Should be called when app starts or after migration
 * Also adds any missing menu permissions for existing roles
 */
export async function initializeDefaultPermissions() {
    try {
        // Get all existing permissions
        const existing = await db.select().from(rolePermissions);

        // Create a set of existing role-menu combinations
        const existingKeys = new Set(existing.map(p => `${p.role}-${p.menuId}`));

        // Find missing permissions
        const permissionsToInsert: Array<{
            role: string;
            menuId: string;
            canAccess: boolean;
        }> = [];

        for (const role of AVAILABLE_ROLES) {
            for (const menu of AVAILABLE_MENUS) {
                const key = `${role}-${menu.id}`;
                if (!existingKeys.has(key)) {
                    const canAccess = DEFAULT_PERMISSIONS[role]?.includes(menu.id) ?? false;
                    permissionsToInsert.push({
                        role,
                        menuId: menu.id,
                        canAccess,
                    });
                }
            }
        }

        if (permissionsToInsert.length > 0) {
            await db.insert(rolePermissions).values(permissionsToInsert);
            return { success: true, message: `Added ${permissionsToInsert.length} new permissions` };
        }

        return { success: true, message: "All permissions already exist" };
    } catch (error) {
        console.error("Error initializing permissions:", error);
        return { success: false, error: "Gagal menginisialisasi permission default" };
    }
}

/**
 * Get all role permissions
 */
export async function getRolePermissions() {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        // Ensure permissions are initialized
        await initializeDefaultPermissions();

        const permissions = await db
            .select()
            .from(rolePermissions)
            .orderBy(rolePermissions.role, rolePermissions.menuId);

        // Group by role for easier consumption
        const grouped: Record<string, Record<string, boolean>> = {};
        for (const perm of permissions) {
            if (!grouped[perm.role]) {
                grouped[perm.role] = {};
            }
            grouped[perm.role][perm.menuId] = perm.canAccess;
        }

        return { success: true, data: grouped, raw: permissions };
    } catch (error) {
        console.error("Error getting permissions:", error);
        return { success: false, error: "Gagal mengambil data permission" };
    }
}

/**
 * Update a specific role-menu permission
 */
export async function updateRolePermission(
    role: string,
    menuId: string,
    canAccess: boolean
) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        // Only superadmin can modify permissions
        if (session.user.role !== "superadmin") {
            return { success: false, error: "Hanya superadmin yang bisa mengubah permission" };
        }

        // Prevent superadmin from removing their own access to permissions menu
        if (role === "superadmin" && menuId === "permissions" && !canAccess) {
            return {
                success: false,
                error: "Superadmin tidak bisa menghapus akses ke Role & Permission"
            };
        }

        // Check if permission exists
        const existing = await db
            .select()
            .from(rolePermissions)
            .where(
                and(
                    eq(rolePermissions.role, role),
                    eq(rolePermissions.menuId, menuId)
                )
            )
            .limit(1);

        if (existing.length === 0) {
            // Create new permission
            await db.insert(rolePermissions).values({
                role,
                menuId,
                canAccess,
            });
        } else {
            // Update existing permission
            await db
                .update(rolePermissions)
                .set({ canAccess, updatedAt: new Date() })
                .where(
                    and(
                        eq(rolePermissions.role, role),
                        eq(rolePermissions.menuId, menuId)
                    )
                );
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating permission:", error);
        return { success: false, error: "Gagal memperbarui permission" };
    }
}

/**
 * Get accessible menus for a specific role
 */
export async function getMenusForRole(role: string): Promise<string[]> {
    try {
        // Ensure permissions are initialized
        await initializeDefaultPermissions();

        const permissions = await db
            .select()
            .from(rolePermissions)
            .where(
                and(
                    eq(rolePermissions.role, role),
                    eq(rolePermissions.canAccess, true)
                )
            );

        return permissions.map((p) => p.menuId);
    } catch (error) {
        console.error("Error getting menus for role:", error);
        // Fallback to default permissions
        return DEFAULT_PERMISSIONS[role] || ["chat"];
    }
}
