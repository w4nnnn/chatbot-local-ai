import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username, admin } from "better-auth/plugins";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import * as schema from "../auth-schema";

// Setup database path dari environment variable
const dbPath = process.env.DATABASE_URL || "./data/local.db";
const dir = dirname(dbPath);
if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
}

// Create separate database instance for auth
const sqlite = new Database(dbPath);
const authDb = drizzle(sqlite, { schema });

export const auth = betterAuth({
    database: drizzleAdapter(authDb, {
        provider: "sqlite",
        schema: schema,
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
    },
    plugins: [
        username(),
        admin({
            defaultRole: "user",
        }),
    ],
    user: {
        additionalFields: {
            // Custom role field untuk support superadmin
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
            },
        },
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session["user"];
