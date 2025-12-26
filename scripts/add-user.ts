/**
 * Script untuk menambah user baru menggunakan Better-Auth API
 * Jalankan dengan: npx tsx scripts/add-user.ts {username} {password} {role}
 * 
 * Contoh:
 *   npx tsx scripts/add-user.ts admin admin123 superadmin
 *   npx tsx scripts/add-user.ts johndoe password123 user
 * 
 * Roles yang tersedia: superadmin, admin, user
 */

import { auth } from "../lib/auth";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { user } from "../auth-schema";
import { eq } from "drizzle-orm";

const VALID_ROLES = ["superadmin", "admin", "user"] as const;
type Role = typeof VALID_ROLES[number];

function printUsage() {
    console.log(`
📝 Script Tambah User
====================

Penggunaan:
  npx tsx scripts/add-user.ts <username> <password> <role>

Argumen:
  username    Username untuk user baru (3-20 karakter)
  password    Password untuk user baru (minimal 6 karakter)
  role        Role user: superadmin, admin, atau user

Contoh:
  npx tsx scripts/add-user.ts admin admin123 superadmin
  npx tsx scripts/add-user.ts johndoe password123 user
`);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 3) {
        console.error("❌ Error: Argumen tidak lengkap");
        printUsage();
        process.exit(1);
    }

    const [username, password, roleInput] = args;

    // Validasi username
    if (username.length < 3 || username.length > 20) {
        console.error("❌ Error: Username harus 3-20 karakter");
        process.exit(1);
    }

    // Validasi password
    if (password.length < 6) {
        console.error("❌ Error: Password minimal 6 karakter");
        process.exit(1);
    }

    // Validasi role
    const role = roleInput.toLowerCase() as Role;
    if (!VALID_ROLES.includes(role)) {
        console.error(`❌ Error: Role tidak valid. Pilihan: ${VALID_ROLES.join(", ")}`);
        process.exit(1);
    }

    // Setup database untuk cek existing user
    const dbPath = process.env.DATABASE_URL || "./data/local.db";
    const sqlite = new Database(dbPath);
    const db = drizzle(sqlite);

    try {
        // Cek apakah username sudah ada
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.username, username))
            .limit(1);

        if (existingUser.length > 0) {
            console.error(`❌ Error: Username "${username}" sudah digunakan`);
            sqlite.close();
            process.exit(1);
        }

        // Generate email dummy
        const email = `${username}@local.app`;

        // Gunakan Better-Auth API untuk signup (ini akan hash password dengan benar)
        const result = await auth.api.signUpEmail({
            body: {
                email: email,
                name: username,
                password: password,
                username: username,
            },
        });

        if (!result.user) {
            console.error("❌ Error: Gagal membuat user");
            sqlite.close();
            process.exit(1);
        }

        // Update role di database (karena signUp default ke "user")
        await db
            .update(user)
            .set({ role: role })
            .where(eq(user.id, result.user.id));

        console.log(`
✅ User berhasil dibuat!
========================
Username  : ${username}
Email     : ${email}
Role      : ${role}
ID        : ${result.user.id}
`);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        sqlite.close();
    }
}

main();
