"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { normalizeSolanaAddress } from "@/lib/address";
import { trackScanFailed, trackScanStarted } from "@/lib/analytics";

interface ScanMintFormProps {
  buttonLabel?: string;
  className?: string;
}

export function ScanMintForm({
  buttonLabel = "Scan Token",
  className,
}: ScanMintFormProps) {
  const router = useRouter();
  const [mint, setMint] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = normalizeSolanaAddress(mint);

    if (!result.ok) {
      setError(result.error);
      trackScanFailed({ reason: "invalid_address" });
      return;
    }

    setError(null);
    trackScanStarted({ source: "homepage" });
    router.push(`/scan/${encodeURIComponent(result.address)}`);
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-slate-950/80 p-2 shadow-2xl shadow-black/30 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            value={mint}
            onChange={(event) => setMint(event.target.value)}
            placeholder="Paste Solana token mint address"
            className="h-12 w-full rounded-md border border-transparent bg-transparent pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/50"
          />
        </div>
        <Button type="submit" size="lg" className="sm:w-40">
          {buttonLabel}
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-200">{error}</p> : null}
    </form>
  );
}
