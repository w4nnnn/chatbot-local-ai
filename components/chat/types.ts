import type { Message, SourceDocument } from "@/actions/ollama";
import type { ExtractedQuery } from "@/actions/intent";

// Extended message type dengan info tambahan untuk UI
export interface ChatMessage extends Message {
    sources?: SourceDocument[];
    isRAGUsed?: boolean;
    intent?: ExtractedQuery;
    responseTime?: number; // dalam detik
}

// Re-export types dari actions untuk kemudahan import
export type { Message, SourceDocument, ExtractedQuery };
