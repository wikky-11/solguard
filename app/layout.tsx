import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://solguard-nine.vercel.app";
const description =
  "Scan Solana tokens for mint authority, freeze authority, holder concentration, liquidity, market data, and transparent risk indicators.";
const ogDescription =
  "Check Solana token risk indicators before you buy. Mint authority, freeze authority, liquidity, holder data, and transparent scoring.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SolGuard - Solana Token Risk Analyzer",
    template: "%s | SolGuard",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SolGuard - Solana Token Risk Analyzer",
    description: ogDescription,
    url: "/",
    siteName: "SolGuard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SolGuard - Solana Token Risk Analyzer",
    description: ogDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
