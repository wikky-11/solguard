import Image from "next/image";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { BetaNotice } from "@/components/beta-notice";
import { Disclaimer } from "@/components/disclaimer";
import { ReportActions } from "@/components/report-actions";
import { RiskMeter } from "@/components/risk-meter";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { compactNumber, currency, percent, shortAddress } from "@/lib/utils";
import type { ScanResult } from "@/types/scan";

function authorityBadge(revoked: boolean, highRisk = true) {
  if (revoked) {
    return <Badge variant="good">Revoked = Good</Badge>;
  }

  return <Badge variant={highRisk ? "danger" : "warning"}>Active</Badge>;
}

function riskBadgeVariant(scoreLabel: ScanResult["risk"]["label"]) {
  if (scoreLabel === "Low Risk") {
    return "good" as const;
  }

  if (scoreLabel === "Medium Risk") {
    return "warning" as const;
  }

  return "danger" as const;
}

function availabilityBadge(available: boolean) {
  return (
    <Badge variant={available ? "good" : "neutral"}>
      {available ? "Available" : "Unavailable"}
    </Badge>
  );
}

export function ReportView({ report }: { report: ScanResult }) {
  const tokenTitle = report.token.name ?? "Unknown Token";
  const symbol = report.token.symbol ?? "N/A";
  const logoSrc = report.token.logo?.startsWith("http") ? report.token.logo : null;
  const knownStablecoin = report.risk.badges.includes(
    "Known Stablecoin / Centralized Issuer",
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <Badge variant={riskBadgeVariant(report.risk.label)}>
            {report.risk.label}
          </Badge>
          <div className="mt-4 flex items-start gap-4">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={`${tokenTitle} logo`}
                width={56}
                height={56}
                className="rounded-lg border border-white/10 bg-white/10"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-lg border border-white/10 bg-white/8">
                <ShieldAlert className="h-7 w-7 text-amber-200" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-black tracking-tight text-white sm:text-5xl">
                {tokenTitle}
              </h1>
              <p className="mt-2 text-lg font-semibold text-slate-300">{symbol}</p>
              <p className="mt-3 break-all font-mono text-sm text-slate-500">
                {report.mint}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-start lg:justify-end">
          <ReportActions report={report} />
        </div>
      </div>

      <BetaNotice className="mb-5" />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <RiskMeter score={report.risk.score} label={report.risk.label} />
          <div className="mt-6 flex flex-wrap gap-2">
            {report.risk.badges.length > 0 ? (
              report.risk.badges.map((badge) => (
                <Badge
                  key={badge}
                  variant={
                    badge === "Known Stablecoin / Centralized Issuer"
                      ? "good"
                      : badge === "Holder Data Unavailable"
                        ? "neutral"
                        : "warning"
                  }
                >
                  {badge}
                </Badge>
              ))
            ) : (
              <Badge variant="good">No major risk badges</Badge>
            )}
          </div>
          {knownStablecoin ? (
            <div className="mt-5 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50">
              This appears to be a known stablecoin or centralized issuer token.
              Active mint or freeze authority can be expected for some regulated
              assets, but the score still shows those controls transparently.
            </div>
          ) : null}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-white">Why this score?</h2>
          <div className="mt-5 space-y-3">
            {report.risk.reasons.length > 0 ? (
              report.risk.reasons.map((reason) => (
                <div
                  key={`${reason.label}-${reason.points}`}
                  className="rounded-lg border border-white/10 bg-slate-950/55 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{reason.label}</p>
                      <p className="mt-1 text-sm text-slate-400">{reason.detail}</p>
                    </div>
                    <Badge
                      variant={
                        reason.severity === "high"
                          ? "danger"
                          : reason.severity === "medium"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      +{reason.points}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                No configured risk factors added points for this scan.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-5 p-6">
        <h2 className="text-lg font-bold text-white">Data Confidence</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-500">On-chain mint data</p>
            <div className="mt-3">{availabilityBadge(report.dataConfidence.onChainMint)}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-500">Holder data</p>
            <div className="mt-3">{availabilityBadge(report.dataConfidence.holders)}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-500">Market data</p>
            <div className="mt-3">{availabilityBadge(report.dataConfidence.market)}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-500">Metadata</p>
            <div className="mt-3">{availabilityBadge(report.dataConfidence.metadata)}</div>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-white">Token Supply</h2>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-sm text-slate-500">Total supply</dt>
              <dd className="mt-1 break-words text-2xl font-bold text-white">
                {report.token.supplyFormatted}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Decimals</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-200">
                {report.token.decimals}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Network</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-200">
                {report.network}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-white">Authority Check</h2>
          <dl className="mt-5 space-y-5">
            <div>
              <dt className="flex items-center justify-between gap-3 text-sm text-slate-500">
                Mint authority {authorityBadge(report.authorities.mintAuthorityRevoked)}
              </dt>
              <dd className="mt-2 break-all font-mono text-sm text-slate-300">
                {report.authorities.mintAuthority ?? "None"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center justify-between gap-3 text-sm text-slate-500">
                Freeze authority{" "}
                {authorityBadge(report.authorities.freezeAuthorityRevoked, false)}
              </dt>
              <dd className="mt-2 break-all font-mono text-sm text-slate-300">
                {report.authorities.freezeAuthority ?? "None"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-white">Market Data</h2>
          <dl className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-slate-500">Price USD</dt>
              <dd className="mt-1 font-semibold text-white">
                {report.market.priceUsd
                  ? currency(Number(report.market.priceUsd))
                  : "Unavailable"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Liquidity</dt>
              <dd className="mt-1 font-semibold text-white">
                {currency(report.market.liquidityUsd)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">FDV</dt>
              <dd className="mt-1 font-semibold text-white">
                {currency(report.market.fdv)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Market cap</dt>
              <dd className="mt-1 font-semibold text-white">
                {currency(report.market.marketCap)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">24h volume</dt>
              <dd className="mt-1 font-semibold text-white">
                {currency(report.market.volume24h)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">24h change</dt>
              <dd className="mt-1 font-semibold text-white">
                {percent(report.market.priceChange24h)}
              </dd>
            </div>
          </dl>
          {report.market.pairUrl ? (
            <a
              href={report.market.pairUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
            >
              View DEX pair
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-bold text-white">Top Holder Concentration</h2>
          {report.holders.unavailable ? (
            <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="font-semibold text-amber-100">
                Holder concentration unavailable
              </p>
              <p className="mt-1 text-sm text-amber-50/80">
                The RPC provider did not return holder concentration data for
                this token.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-500">Top 1 holder</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {percent(report.holders.top1Percent)}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-500">Top 5 holders</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {percent(report.holders.top5Percent)}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-500">Top 10 holders</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {percent(report.holders.top10Percent)}
                </p>
              </div>
            </div>
          )}
        </div>
        {report.holders.unavailable ? null : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-white/10 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Rank</th>
                <th className="px-6 py-3 font-medium">Token account</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Supply share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-300">
              {report.holders.list.map((holder, index) => (
                <tr key={holder.address}>
                  <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                  <td className="px-6 py-4 font-mono">
                    <span title={holder.address}>{shortAddress(holder.address, 8, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {holder.amountFormatted || compactNumber(Number(holder.uiAmount))}
                  </td>
                  <td className="px-6 py-4">{percent(holder.percentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>

      <div className="mt-5">
        <Disclaimer />
      </div>
    </div>
  );
}
