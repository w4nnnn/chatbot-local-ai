"use client";

import * as React from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SourceDocument } from "./types";

interface SourcesPanelProps {
    sources: SourceDocument[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    if (!sources || sources.length === 0) return null;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                    <FileText className="h-3 w-3" />
                    <span>{sources.length} sumber data</span>
                    {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
                {sources.map((source, index) => (
                    <div
                        key={index}
                        className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-blue-400" />
                                <span className="font-medium text-slate-300">{source.fileName}</span>
                            </div>
                            <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${source.relevanceScore > 0.7
                                    ? 'border-green-500/50 text-green-400'
                                    : source.relevanceScore > 0.4
                                        ? 'border-yellow-500/50 text-yellow-400'
                                        : 'border-slate-500/50 text-slate-400'
                                    }`}
                            >
                                {Math.round(source.relevanceScore * 100)}% relevan
                            </Badge>
                        </div>
                        <div className="text-slate-400 space-y-1">
                            {Object.entries(source.metadata)
                                .filter(([key]) => !["file_id", "file_name", "row_index"].includes(key))
                                .slice(0, 5)
                                .map(([key, value]) => (
                                    <div key={key} className="flex">
                                        <span className="text-slate-500 min-w-[80px]">{key}:</span>
                                        <span className="text-slate-300 truncate">{String(value)}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}
