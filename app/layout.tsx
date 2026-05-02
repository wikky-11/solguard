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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://solguard.app"),
  title: {
    default: "SolGuard - Solana Token Risk Analyzer",
    template: "%s | SolGuard",
  },
  description:
    "Scan Solana tokens for mint authority, freeze authority, holder concentration, liquidity, and risk indicators.",
  openGraph: {
    title: "SolGuard - Solana Token Risk Analyzer",
    description:
      "Scan Solana tokens for mint authority, freeze authority, holder concentration, liquidity, and risk indicators.",
    url: "/",
    siteName: "SolGuard",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SolGuard - Solana Token Risk Analyzer",
    description:
      "Scan Solana tokens for mint authority, freeze authority, holder concentration, liquidity, and risk indicators.",
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
