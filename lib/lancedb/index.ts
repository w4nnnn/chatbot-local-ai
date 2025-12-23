import * as lancedb from "@lancedb/lancedb";
import { existsSync, mkdirSync } from "fs";

const LANCEDB_PATH = "./data/lancedb";

// Pastikan folder ada
if (!existsSync(LANCEDB_PATH)) {
    mkdirSync(LANCEDB_PATH, { recursive: true });
}

let dbInstance: lancedb.Connection | null = null;

export async function getLanceDB(): Promise<lancedb.Connection> {
    if (!dbInstance) {
        dbInstance = await lancedb.connect(LANCEDB_PATH);
    }
    return dbInstance;
}

export const VECTOR_TABLE_NAME = "documents";
export const VECTOR_DIMENSION = 768; // nomic-embed-text dimension
