"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Headings
                    h1: ({ children }) => (
                        <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-base font-bold mt-3 mb-2 first:mt-0">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-sm font-bold mt-2 mb-1 first:mt-0">{children}</h3>
                    ),
                    // Paragraphs
                    p: ({ children }) => (
                        <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                    ),
                    // Lists
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                    ),
                    // Code
                    code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code
                                    className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-xs"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code
                                className={cn("block p-3 rounded-lg bg-gray-800 text-gray-100 font-mono text-xs overflow-x-auto", className)}
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="mb-2 overflow-hidden rounded-lg">{children}</pre>
                    ),
                    // Links
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            {children}
                        </a>
                    ),
                    // Blockquote
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 italic text-gray-600 my-2">
                            {children}
                        </blockquote>
                    ),
                    // Tables
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-2">
                            <table className="min-w-full border-collapse text-xs">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-primary/10">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="border border-primary/20 px-2 py-1 text-left font-semibold">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-primary/20 px-2 py-1">{children}</td>
                    ),
                    // Horizontal rule
                    hr: () => <hr className="border-primary/20 my-3" />,
                    // Strong and emphasis
                    strong: ({ children }) => (
                        <strong className="font-bold">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
