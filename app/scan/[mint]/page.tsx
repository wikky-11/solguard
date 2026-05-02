import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { ReportView } from "@/components/report-view";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { scanToken, ScanError } from "@/lib/solana";

interface ReportPageProps {
  params: Promise<{
    mint: string;
  }>;
}

async function loadReport(mint: string) {
  try {
    return {
      report: await scanToken(decodeURIComponent(mint)),
      message: null,
    };
  } catch (error) {
    return {
      report: null,
      message:
        error instanceof ScanError ? error.message : "API unavailable. Please try again.",
    };
  }
}

export async function generateMetadata({
  params,
}: ReportPageProps): Promise<Metadata> {
  const { mint } = await params;

  return {
    title: `Report ${mint.slice(0, 6)}...${mint.slice(-4)}`,
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { mint } = await params;
  const { report, message } = await loadReport(mint);

  if (report) {
    return <ReportView report={report} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <Card className="p-6">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 flex-none place-items-center rounded-lg border border-rose-400/25 bg-rose-400/10">
            <AlertCircle className="h-5 w-5 text-rose-200" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Scan failed</h1>
            <p className="mt-2 text-slate-400">{message}</p>
            <div className="mt-5">
              <LinkButton href="/scan" variant="secondary">
                Back to scanner
              </LinkButton>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
