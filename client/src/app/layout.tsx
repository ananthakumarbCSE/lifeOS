import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LifeOS — AI-Powered Visual Second Brain",
  description:
    "Transform unstructured goals into an interactive visual planning system. Capture thoughts, organize goals visually, detect planning conflicts, and generate AI-powered action plans.",
  keywords: [
    "productivity",
    "goal planning",
    "visual second brain",
    "AI planning",
    "knowledge graph",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body
        className="min-h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
