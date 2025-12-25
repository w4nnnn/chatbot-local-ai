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
                    className="h-7 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/5 gap-1"
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
                        className="p-3 rounded-xl bg-white border border-primary/10 text-xs shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-primary" />
                                <span className="font-medium text-gray-700">{source.fileName}</span>
                            </div>
                            <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${source.relevanceScore > 0.7
                                    ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                                    : source.relevanceScore > 0.4
                                        ? 'border-amber-200 text-amber-600 bg-amber-50'
                                        : 'border-gray-200 text-gray-500 bg-gray-50'
                                    }`}
                            >
                                {Math.round(source.relevanceScore * 100)}% relevan
                            </Badge>
                        </div>
                        <div className="text-gray-500 space-y-1">
                            {Object.entries(source.metadata)
                                .filter(([key]) => !["file_id", "file_name", "row_index"].includes(key))
                                .slice(0, 5)
                                .map(([key, value]) => (
                                    <div key={key} className="flex">
                                        <span className="text-primary/50 min-w-[80px]">{key}:</span>
                                        <span className="text-gray-600 truncate">{String(value)}</span>
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
