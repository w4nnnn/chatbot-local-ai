"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
    Image, Type, Loader2, Bot, MessageSquare, Sparkles, Zap, Brain,
    Cpu, Database, Globe, Layers, Terminal, Code, FileText, Folder,
    Home, Settings, Star, Heart, Rocket, Shield, LaptopMinimal
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type IconType, type BrandingSettings } from "@/actions/settings";
import { useBranding } from "./branding-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Icon map for rendering
const iconComponents: Record<string, ReactNode> = {
    Bot: <Bot className="h-5 w-5" />,
    MessageSquare: <MessageSquare className="h-5 w-5" />,
    Sparkles: <Sparkles className="h-5 w-5" />,
    Zap: <Zap className="h-5 w-5" />,
    Brain: <Brain className="h-5 w-5" />,
    Cpu: <Cpu className="h-5 w-5" />,
    Database: <Database className="h-5 w-5" />,
    Globe: <Globe className="h-5 w-5" />,
    Layers: <Layers className="h-5 w-5" />,
    Terminal: <Terminal className="h-5 w-5" />,
    Code: <Code className="h-5 w-5" />,
    FileText: <FileText className="h-5 w-5" />,
    Folder: <Folder className="h-5 w-5" />,
    Home: <Home className="h-5 w-5" />,
    Settings: <Settings className="h-5 w-5" />,
    Star: <Star className="h-5 w-5" />,
    Heart: <Heart className="h-5 w-5" />,
    Rocket: <Rocket className="h-5 w-5" />,
    Shield: <Shield className="h-5 w-5" />,
    LaptopMinimal: <LaptopMinimal className="h-5 w-5" />,
};

// Popular Lucide icons for branding
const POPULAR_ICONS = Object.keys(iconComponents);

export function BrandingSettings() {
    const { branding, setBranding, isLoading } = useBranding();
    const [localBranding, setLocalBranding] = useState<BrandingSettings>(branding);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync local state with context only on initial load
    useEffect(() => {
        if (!hasChanges) {
            setLocalBranding(branding);
        }
    }, [branding, hasChanges]);

    const handleLocalChange = (newBranding: BrandingSettings) => {
        setLocalBranding(newBranding);
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await setBranding(localBranding);
        if (result.success) {
            toast.success(result.message);
            setHasChanges(false);
        } else {
            toast.error(result.message);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <Card className="bg-white/80 backdrop-blur-lg border-gray-200 shadow-lg">
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white/80 backdrop-blur-lg border-gray-200 shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Branding Sidebar</CardTitle>
                </div>
                <CardDescription>Sesuaikan icon dan judul yang ditampilkan di sidebar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Icon Type Selection */}
                <div className="space-y-2">
                    <Label>Tipe Icon</Label>
                    <Select
                        value={localBranding.iconType}
                        onValueChange={(value: IconType) => handleLocalChange({ ...localBranding, iconType: value })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lucide">Lucide Icon</SelectItem>
                            <SelectItem value="image">Upload Gambar</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Icon Selection */}
                {localBranding.iconType === "lucide" ? (
                    <div className="space-y-2">
                        <Label>Pilih Icon</Label>
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                            {POPULAR_ICONS.map((iconName) => {
                                const isSelected = localBranding.icon === iconName;
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => handleLocalChange({ ...localBranding, icon: iconName })}
                                        className={cn(
                                            "p-3 rounded-lg border-2 transition-all flex items-center justify-center",
                                            isSelected
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-gray-200 hover:border-gray-300 text-gray-600"
                                        )}
                                        title={iconName}
                                    >
                                        {iconComponents[iconName]}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500">
                            Icon terpilih: <Badge variant="secondary">{localBranding.icon}</Badge>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Label>Upload Gambar</Label>

                        {/* Preview */}
                        {localBranding.icon && localBranding.icon.startsWith("data:") && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <img
                                    src={localBranding.icon}
                                    alt="Preview"
                                    className="w-10 h-10 rounded object-contain"
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Gambar terpilih</p>
                                    <p className="text-xs text-gray-400">Klik tombol di bawah untuk mengganti</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleLocalChange({ ...localBranding, icon: "", iconType: "lucide" })}
                                >
                                    Hapus
                                </Button>
                            </div>
                        )}

                        {/* Upload Input */}
                        <div className="flex items-center gap-2">
                            <Input
                                id="imageUpload"
                                type="file"
                                accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // Validate file size (max 100KB for base64 storage)
                                        if (file.size > 100 * 1024) {
                                            toast.error("Ukuran file maksimal 100KB");
                                            return;
                                        }

                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const base64 = event.target?.result as string;
                                            handleLocalChange({ ...localBranding, icon: base64 });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Format: PNG, JPG, GIF, WebP, SVG. Ukuran maks: 100KB. Disarankan 32x32 atau 64x64 pixel.
                        </p>
                    </div>
                )}

                {/* Title Input */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Judul Sidebar
                    </Label>
                    <Input
                        id="title"
                        value={localBranding.title}
                        onChange={(e) => handleLocalChange({ ...localBranding, title: e.target.value })}
                        placeholder="Local AI Chat"
                    />
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        "Simpan Perubahan"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
