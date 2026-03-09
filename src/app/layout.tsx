import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Oura Arena",
  description: "チームウェルネスバトルダッシュボード — Oura Ring APIで健康データを可視化・対戦",
  metadataBase: new URL("https://oura-arena.vercel.app"),
  openGraph: {
    title: "Oura Arena",
    description: "チームウェルネスバトルダッシュボード — 睡眠・回復・活動を可視化して対戦",
    url: "https://oura-arena.vercel.app",
    siteName: "Oura Arena",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Oura Arena Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oura Arena",
    description: "チームウェルネスバトルダッシュボード",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${mono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
