"use client";

import { Copy, Download, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { currency, percent } from "@/lib/utils";
import type { ScanResult } from "@/types/scan";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlReport(report: ScanResult) {
  const holderText = report.holders.unavailable
    ? "Holder concentration unavailable"
    : `${percent(report.holders.top1Percent)} top 1, ${percent(report.holders.top5Percent)} top 5`;
  const reasons = report.risk.reasons
    .map(
      (reason) =>
        `<li><strong>${escapeHtml(reason.label)}:</strong> +${reason.points} points. ${escapeHtml(reason.detail)}</li>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SolGuard Report - ${escapeHtml(report.mint)}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #0f172a; line-height: 1.55; padding: 32px; }
    h1, h2 { line-height: 1.15; }
    .panel { border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 16px 0; }
    .muted { color: #475569; }
  </style>
</head>
<body>
  <h1>SolGuard Token Risk Report</h1>
  <p class="muted">Not financial advice. This tool only provides risk indicators. Always do your own research.</p>
  <div class="panel">
    <h2>${escapeHtml(report.token.name ?? "Unknown Token")} (${escapeHtml(report.token.symbol ?? "N/A")})</h2>
    <p><strong>Mint:</strong> ${escapeHtml(report.mint)}</p>
    <p><strong>Network:</strong> ${escapeHtml(report.network)}</p>
    <p><strong>Supply:</strong> ${escapeHtml(report.token.supplyFormatted)} with ${report.token.decimals} decimals</p>
  </div>
  <div class="panel">
    <h2>Risk Score</h2>
    <p><strong>${report.risk.score}/100 - ${escapeHtml(report.risk.label)}</strong></p>
    <ul>${reasons || "<li>No scoring risk factors were triggered.</li>"}</ul>
  </div>
  <div class="panel">
    <h2>Indicators</h2>
    <p><strong>Mint authority:</strong> ${report.authorities.mintAuthorityRevoked ? "Revoked" : "Active"}</p>
    <p><strong>Freeze authority:</strong> ${report.authorities.freezeAuthorityRevoked ? "Revoked" : "Active"}</p>
    <p><strong>Holder concentration:</strong> ${holderText}</p>
    <p><strong>Liquidity:</strong> ${currency(report.market.liquidityUsd)}</p>
  </div>
</body>
</html>`;
}

export function ReportActions({ report }: { report: ScanResult }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadReport() {
    const blob = new Blob([htmlReport(report)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `solguard-${report.mint.slice(0, 8)}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(htmlReport(report));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button type="button" variant="secondary" onClick={copyLink}>
        <Copy className="h-4 w-4" aria-hidden="true" />
        {copied ? "Copied" : "Copy Report Link"}
      </Button>
      <Button type="button" variant="secondary" onClick={downloadReport}>
        <Download className="h-4 w-4" aria-hidden="true" />
        Download HTML Report
      </Button>
      <Button type="button" variant="secondary" onClick={printReport}>
        <Printer className="h-4 w-4" aria-hidden="true" />
        Print Report
      </Button>
    </div>
  );
}
