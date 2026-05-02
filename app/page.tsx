import {
  ArrowRight,
  BarChart3,
  Copy,
  LockKeyhole,
  PieChart,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { BetaNotice } from "@/components/beta-notice";
import { Disclaimer } from "@/components/disclaimer";
import { ScanMintForm } from "@/components/scan-mint-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export default function Home() {
  const features = [
    {
      title: "Authority Check",
      text: "Detect active mint and freeze authorities before they become surprises.",
      icon: LockKeyhole,
    },
    {
      title: "Holder Concentration",
      text: "See top holder percentages across the largest token accounts.",
      icon: PieChart,
    },
    {
      title: "Liquidity & Market Data",
      text: "Pull DEX pair, liquidity, price, volume, and FDV signals when available.",
      icon: BarChart3,
    },
    {
      title: "Risk Score",
      text: "Review a transparent 0-100 score with every point explained.",
      icon: ShieldCheck,
    },
    {
      title: "Shareable Report",
      text: "Copy a report link or download a basic HTML report for your notes.",
      icon: Copy,
    },
  ];

  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            <Badge variant="good">Solana Token Risk Analyzer</Badge>
            <Badge>Public Beta</Badge>
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">
            Scan Solana Tokens Before You Buy
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Check mint authority, freeze authority, top holders, liquidity, and
            rug-risk indicators in seconds.
          </p>
          <BetaNotice className="mt-6 max-w-2xl" />
          <ScanMintForm className="mt-8 max-w-2xl" />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/scan" size="lg">
              Start Free Scan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
            <LinkButton
              href="/scan/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
              size="lg"
              variant="secondary"
            >
              Try USDC sample report
            </LinkButton>
            <LinkButton href="/create-token" size="lg" variant="secondary">
              <WalletCards className="h-4 w-4" aria-hidden="true" />
              Create Devnet Token
            </LinkButton>
          </div>
          <div className="mt-6 max-w-2xl">
            <Disclaimer />
          </div>
        </div>

        <div className="relative">
          <Card className="overflow-hidden p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  Example Risk Console
                </p>
                <p className="mt-1 text-2xl font-bold text-white">42 / 100</p>
              </div>
              <Badge variant="warning">Medium Risk</Badge>
            </div>
            <div className="grid gap-4 py-5 sm:grid-cols-3">
              {[
                ["Mint", "Revoked", "text-emerald-200"],
                ["Freeze", "Active", "text-amber-100"],
                ["Top 10", "58.2%", "text-white"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                ["Liquidity depth", 74, "bg-emerald-300"],
                ["Holder spread", 45, "bg-amber-300"],
                ["Authority safety", 86, "bg-emerald-300"],
              ].map(([label, width, color]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-semibold text-slate-200">{width}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-emerald-300/15 bg-emerald-300/10 p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-200" aria-hidden="true" />
                <p className="text-sm font-semibold text-emerald-50">
                  Transparent scoring with each risk factor listed.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950/45">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge>Core Checks</Badge>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
                Security signals in one clean report
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              SolGuard combines on-chain token state, holder distribution, and
              DEX market data into a readable MVP report.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="p-5 transition hover:-translate-y-1 hover:border-emerald-300/35">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/8">
                    <Icon className="h-5 w-5 text-emerald-200" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {feature.text}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
