import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeInitializer from "@/components/Misc/ThemeInitializer";
import Header from "@/components/Header/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whatsapp Chat Analyzer",
  description: "Analyze WhatsApp chat exports to get message, emoji and word insights with visualizations.",
  keywords: [
    "whatsapp",
    "chat analyzer",
    "chat analysis",
    "message analytics",
    "wordcloud",
    "emoji analysis",
  ],
  authors: [
    {
      name: "Vault",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeInitializer/>
        <Header/>
        {children}
      </body>
    </html>
  );
}
