"use client";

import * as React from "react";
import { getSidebarBranding, updateSidebarBranding, type BrandingSettings, type IconType } from "@/actions/settings";

interface BrandingContextType {
    branding: BrandingSettings;
    setBranding: (branding: BrandingSettings) => Promise<{ success: boolean; message: string }>;
    isLoading: boolean;
    refreshBranding: () => Promise<void>;
}

const BrandingContext = React.createContext<BrandingContextType | undefined>(undefined);

const DEFAULT_BRANDING: BrandingSettings = {
    icon: "Bot",
    iconType: "lucide" as IconType,
    title: "Local AI Chat",
};

interface BrandingProviderProps {
    children: React.ReactNode;
    initialBranding?: BrandingSettings;
}

export function BrandingProvider({ children, initialBranding }: BrandingProviderProps) {
    const [branding, setBrandingState] = React.useState<BrandingSettings>(initialBranding || DEFAULT_BRANDING);
    const [isLoading, setIsLoading] = React.useState(!initialBranding);

    // Load branding on mount if not provided
    React.useEffect(() => {
        if (!initialBranding) {
            getSidebarBranding().then((data) => {
                setBrandingState(data);
                setIsLoading(false);
            });
        }
    }, [initialBranding]);

    const setBranding = React.useCallback(async (newBranding: BrandingSettings) => {
        // Update UI immediately (optimistic update)
        setBrandingState(newBranding);

        // Persist to database
        const result = await updateSidebarBranding(newBranding);

        if (!result.success) {
            // Revert on error
            setBrandingState(branding);
        }

        return result;
    }, [branding]);

    const refreshBranding = React.useCallback(async () => {
        const data = await getSidebarBranding();
        setBrandingState(data);
    }, []);

    return (
        <BrandingContext.Provider value={{ branding, setBranding, isLoading, refreshBranding }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    const context = React.useContext(BrandingContext);
    if (!context) {
        throw new Error("useBranding must be used within BrandingProvider");
    }
    return context;
}
