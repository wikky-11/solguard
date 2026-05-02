"use client";

import { AlertCircle, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { RiskMeter } from "@/components/risk-meter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { normalizeSolanaAddress } from "@/lib/address";
import {
  trackScanCompleted,
  trackScanFailed,
  trackScanStarted,
} from "@/lib/analytics";
import { currency, percent, shortAddress } from "@/lib/utils";
import type { ScanErrorResponse, ScanResult } from "@/types/scan";

function LoadingSkeleton() {
  return (
    <Card className="p-6">
      <div className="animate-pulse space-y-5">
        <div className="h-5 w-44 rounded bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-24 rounded-lg bg-white/10" />
          <div className="h-24 rounded-lg bg-white/10" />
          <div className="h-24 rounded-lg bg-white/10" />
        </div>
        <div className="h-32 rounded-lg bg-white/10" />
      </div>
    </Card>
  );
}

export function ScanConsole() {
  const [mint, setMint] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = normalizeSolanaAddress(mint);

    if (!result.ok) {
      setError(result.error);
      trackScanFailed({ reason: "invalid_address", source: "scanner" });
      return;
    }

    trackScanStarted({ source: "scanner" });
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch(
        `/api/scan?mint=${encodeURIComponent(result.address)}`,
      );
      const data = (await response.json()) as ScanResult | ScanErrorResponse;

      if (!response.ok) {
        setError("error" in data ? data.error : "API unavailable");
        trackScanFailed({
          reason: "error" in data ? data.code : "api_unavailable",
          source: "scanner",
        });
        return;
      }

      setReport(data as ScanResult);
      trackScanCompleted({ source: "scanner" });
    } catch {
      setError("Network issue. Please try again shortly.");
      trackScanFailed({ reason: "network_issue", source: "scanner" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Badge>Token Risk Scanner</Badge>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Scan a Solana token mint
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Review authorities, holder concentration, liquidity, market activity,
          and scoring factors in one report.
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              value={mint}
              onChange={(event) => setMint(event.target.value)}
              placeholder="Paste Solana token mint address"
              className="h-12 w-full rounded-lg border border-white/10 bg-slate-950/70 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-400/10"
            />
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Scanning..." : "Scan Token"}
          </Button>
        </form>
      </Card>

      {error ? (
        <div className="mt-5 flex gap-3 rounded-lg border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-100">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="mt-6">
        {loading ? <LoadingSkeleton /> : null}

        {report ? (
          <Card className="p-6">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <RiskMeter score={report.risk.score} label={report.risk.label} />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-sm text-slate-500">Mint</p>
                  <p className="mt-1 font-mono text-sm text-white">
                    {shortAddress(report.mint, 7, 7)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-sm text-slate-500">Top 10</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {report.holders.unavailable
                      ? "Unavailable"
                      : percent(report.holders.top10Percent)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-sm text-slate-500">Liquidity</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {currency(report.market.liquidityUsd)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {report.risk.badges.slice(0, 4).map((badge) => (
                  <Badge key={badge} variant="warning">
                    {badge}
                  </Badge>
                ))}
              </div>
              <Link
                href={`/scan/${report.mint}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                Open full report
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
