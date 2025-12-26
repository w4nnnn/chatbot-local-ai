import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ColorThemeProvider, BrandingProvider } from "@/components/setting";
import { getColorTheme, getSidebarBranding } from "@/actions/settings";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Local AI Chatbot",
  description: "Chatbot AI Lokal yang Cerdas dan Elegan",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = await getColorTheme();
  const initialBranding = await getSidebarBranding();

  return (
    <html lang="id" className={`theme-${initialTheme}`}>
      <body className={`${inter.className} antialiased selection:bg-primary/30`}>
        <ColorThemeProvider initialTheme={initialTheme}>
          <BrandingProvider initialBranding={initialBranding}>
            {children}
          </BrandingProvider>
        </ColorThemeProvider>
      </body>
    </html>
  );
}

