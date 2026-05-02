import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

const navItems = [
  { href: "/scan", label: "Scanner" },
  { href: "/create-token", label: "Create Token" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/feedback", label: "Feedback" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-300/25 bg-emerald-300/10">
            <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">SolGuard</span>
          <span className="hidden rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 text-xs font-semibold text-emerald-200 sm:inline-flex">
            Public Beta
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <LinkButton href="/scan" size="sm" className="hidden sm:inline-flex">
          Start Free Scan
        </LinkButton>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
