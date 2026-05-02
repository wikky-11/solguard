import type { Metadata } from "next";
import {
  BarChart3,
  Coins,
  Droplets,
  LockKeyhole,
  PieChart,
  ShieldQuestion,
} from "lucide-react";
import { Disclaimer } from "@/components/disclaimer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
};

const sections = [
  {
    title: "What SolGuard checks",
    text: "SolGuard reads SPL mint state, largest token accounts, and available DEX Screener market data, then summarizes risk indicators in a transparent report.",
    icon: ShieldQuestion,
  },
  {
    title: "What mint authority means",
    text: "Mint authority controls whether new tokens can be minted. A revoked mint authority is generally safer because supply cannot be increased by that authority.",
    icon: Coins,
  },
  {
    title: "What freeze authority means",
    text: "Freeze authority can freeze token accounts. If it remains active, holders may face account-level restrictions from the authority.",
    icon: LockKeyhole,
  },
  {
    title: "What holder concentration means",
    text: "Holder concentration shows how much supply sits in the largest token accounts. Higher concentration can increase sell pressure and governance risk.",
    icon: PieChart,
  },
  {
    title: "Why liquidity matters",
    text: "Liquidity affects whether traders can enter or exit without heavy slippage. Low liquidity can make prices easier to move and harder to rely on.",
    icon: Droplets,
  },
  {
    title: "How scoring works",
    text: "The score adds points for active authorities, concentrated holders, missing or low liquidity, thin volume, and missing DEX pair data, then clamps the result at 100.",
    icon: BarChart3,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <Badge>About SolGuard</Badge>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Practical risk indicators for Solana tokens
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-400">
          SolGuard is a legitimate safety tool for token research. It does not
          create trading signals, manipulate markets, or promise outcomes.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Card key={section.title} className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/8">
                <Icon className="h-5 w-5 text-emerald-200" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{section.text}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 max-w-4xl">
        <Disclaimer />
      </div>
    </div>
  );
}
