import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Local AI Chatbot",
  description: "Chatbot AI Lokal yang Cerdas dan Elegan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} antialiased selection:bg-indigo-500/30`}>{children}</body>
    </html>
  );
}
