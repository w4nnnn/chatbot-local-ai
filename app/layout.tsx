import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ColorThemeProvider } from "@/components/theme-provider";
import { getColorTheme } from "@/actions/settings";

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

  return (
    <html lang="id" className={`theme-${initialTheme}`}>
      <body className={`${inter.className} antialiased selection:bg-primary/30`}>
        <ColorThemeProvider initialTheme={initialTheme}>
          {children}
        </ColorThemeProvider>
      </body>
    </html>
  );
}
