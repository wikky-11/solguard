import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="space-y-2">
          <p>Copyright 2026 SolGuard. Built for safer Solana research.</p>
          <Link
            href="/feedback"
            className="inline-flex font-semibold text-emerald-200 hover:text-emerald-100"
          >
            Feedback
          </Link>
        </div>
        <p className="max-w-2xl md:text-right">
          Not financial advice. This tool only provides risk indicators. Always
          do your own research.
        </p>
      </div>
    </footer>
  );
}
