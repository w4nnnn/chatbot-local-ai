"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
    Loader2, LogIn, AlertCircle, Bot, MessageSquare, Sparkles, Zap, Brain,
    Cpu, Database, Globe, Layers, Terminal, Code, FileText, Folder,
    Home, Settings, Star, Heart, Rocket, Shield, LaptopMinimal
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getSidebarBranding, type BrandingSettings } from "@/actions/settings";
import type { ReactNode } from "react";

// Map of Lucide icon names to components
const iconMap: Record<string, ReactNode> = {
    Bot: <Bot className="w-8 h-8 text-primary" />,
    MessageSquare: <MessageSquare className="w-8 h-8 text-primary" />,
    Sparkles: <Sparkles className="w-8 h-8 text-primary" />,
    Zap: <Zap className="w-8 h-8 text-primary" />,
    Brain: <Brain className="w-8 h-8 text-primary" />,
    Cpu: <Cpu className="w-8 h-8 text-primary" />,
    Database: <Database className="w-8 h-8 text-primary" />,
    Globe: <Globe className="w-8 h-8 text-primary" />,
    Layers: <Layers className="w-8 h-8 text-primary" />,
    Terminal: <Terminal className="w-8 h-8 text-primary" />,
    Code: <Code className="w-8 h-8 text-primary" />,
    FileText: <FileText className="w-8 h-8 text-primary" />,
    Folder: <Folder className="w-8 h-8 text-primary" />,
    Home: <Home className="w-8 h-8 text-primary" />,
    Settings: <Settings className="w-8 h-8 text-primary" />,
    Star: <Star className="w-8 h-8 text-primary" />,
    Heart: <Heart className="w-8 h-8 text-primary" />,
    Rocket: <Rocket className="w-8 h-8 text-primary" />,
    Shield: <Shield className="w-8 h-8 text-primary" />,
    LaptopMinimal: <LaptopMinimal className="w-8 h-8 text-primary" />,
};

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [branding, setBranding] = useState<BrandingSettings>({
        icon: "Bot",
        iconType: "lucide",
        title: "Local AI Chat"
    });

    // Load branding on mount
    useEffect(() => {
        getSidebarBranding().then(setBranding);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await authClient.signIn.username({
                username,
                password,
            });

            if (result.error) {
                setError(result.error.message || "Login gagal. Periksa username dan password Anda.");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderBrandIcon = () => {
        if (branding.iconType === "image" && branding.icon) {
            // Support both URL and base64
            return (
                <img
                    src={branding.icon}
                    alt="Logo"
                    className="w-full h-full rounded-2xl object-cover"
                />
            );
        }
        return iconMap[branding.icon] || <Bot className="w-8 h-8 text-primary" />;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                        {renderBrandIcon()}
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{branding.title}</h1>
                </div>

                {/* Login Card */}
                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Login</CardTitle>
                        <Separator />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Masukkan username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !username || !password}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Masuk
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
