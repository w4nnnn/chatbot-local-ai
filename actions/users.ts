"use server";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export type UserData = {
    id: string;
    name: string;
    email: string;
    username: string | null;
    role: string | null;
    banned: boolean | null;
    createdAt: Date;
};

/**
 * Get all users
 */
export async function getUsers() {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        // Only superadmin can view users
        if (session.user.role !== "superadmin") {
            return { success: false, error: "Hanya superadmin yang bisa melihat daftar user" };
        }

        const users = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                banned: user.banned,
                createdAt: user.createdAt,
            })
            .from(user)
            .orderBy(user.createdAt);

        return { success: true, data: users as UserData[] };
    } catch (error) {
        console.error("Error getting users:", error);
        return { success: false, error: "Gagal mengambil data user" };
    }
}

export type CreateUserInput = {
    username: string;
    email: string;
    password: string;
    name: string;
    role: string;
};

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        // Only superadmin can create users
        if (session.user.role !== "superadmin") {
            return { success: false, error: "Hanya superadmin yang bisa membuat user" };
        }

        // Validate input
        if (!input.username || input.username.length < 3) {
            return { success: false, error: "Username minimal 3 karakter" };
        }
        if (!input.password || input.password.length < 6) {
            return { success: false, error: "Password minimal 6 karakter" };
        }

        // Check if username already exists
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.username, input.username))
            .limit(1);

        if (existingUser.length > 0) {
            return { success: false, error: "Username sudah digunakan" };
        }

        // Check if email already exists
        const existingEmail = await db
            .select()
            .from(user)
            .where(eq(user.email, input.email))
            .limit(1);

        if (existingEmail.length > 0) {
            return { success: false, error: "Email sudah digunakan" };
        }

        // Create user using Better-Auth API
        const result = await auth.api.signUpEmail({
            body: {
                email: input.email,
                name: input.name,
                password: input.password,
                username: input.username,
            },
        });

        if (!result.user) {
            return { success: false, error: "Gagal membuat user" };
        }

        // Update role in database
        await db
            .update(user)
            .set({ role: input.role })
            .where(eq(user.id, result.user.id));

        revalidatePath("/");
        return { success: true, data: result.user };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: "Gagal membuat user" };
    }
}

export type UpdateUserInput = {
    name?: string;
    email?: string;
    role?: string;
    banned?: boolean;
};

/**
 * Update a user
 */
export async function updateUser(userId: string, input: UpdateUserInput) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        // Only superadmin can update users
        if (session.user.role !== "superadmin") {
            return { success: false, error: "Hanya superadmin yang bisa mengubah user" };
        }

        // Prevent superadmin from demoting themselves
        if (userId === session.user.id && input.role && input.role !== "superadmin") {
            return { success: false, error: "Anda tidak bisa menurunkan role diri sendiri" };
        }

        // Prevent superadmin from banning themselves
        if (userId === session.user.id && input.banned) {
            return { success: false, error: "Anda tidak bisa memban diri sendiri" };
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (input.name) updateData.name = input.name;
        if (input.email) updateData.email = input.email;
        if (input.role) updateData.role = input.role;
        if (input.banned !== undefined) updateData.banned = input.banned;

        await db.update(user).set(updateData).where(eq(user.id, userId));

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Gagal memperbarui user" };
    }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        // Only superadmin can delete users
        if (session.user.role !== "superadmin") {
            return { success: false, error: "Hanya superadmin yang bisa menghapus user" };
        }

        // Prevent superadmin from deleting themselves
        if (userId === session.user.id) {
            return { success: false, error: "Anda tidak bisa menghapus akun sendiri" };
        }

        await db.delete(user).where(eq(user.id, userId));

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Gagal menghapus user" };
    }
}
