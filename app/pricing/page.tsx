import type { Metadata } from "next";
import { Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    detail: "5 scans/day",
    features: ["Authority checks", "Holder concentration", "Basic risk score"],
    action: "Start Free Scan",
    href: "/scan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    detail: "per month",
    features: ["Unlimited scans", "PDF reports", "Saved report history"],
    action: "Coming Soon",
    highlighted: true,
  },
  {
    name: "Trader",
    price: "$19",
    detail: "per month",
    features: ["Unlimited scans", "Watchlist alerts coming soon", "Priority reports"],
    action: "Coming Soon",
    highlighted: false,
  },
  {
    name: "API",
    price: "$49",
    detail: "per month",
    features: ["API access coming soon", "Higher rate limits", "Team workflows"],
    action: "Coming Soon",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <Badge>Pricing</Badge>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Start with free token scans
        </h1>
        <p className="mt-4 text-slate-400">
          Payments are not integrated yet. Paid plans show planned MVP packaging
          for reports, alerts, and API access.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.highlighted
                ? "border-emerald-300/35 p-6 shadow-emerald-950/20"
                : "p-6"
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{plan.detail}</p>
              </div>
              {plan.highlighted ? <Badge variant="good">Popular</Badge> : null}
            </div>
            <div className="mt-6 flex items-end gap-1">
              <span className="text-4xl font-black text-white">{plan.price}</span>
              {plan.name !== "Free" ? (
                <span className="pb-1 text-sm text-slate-500">/mo</span>
              ) : null}
            </div>
            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex gap-3 text-sm text-slate-300">
                  {feature.toLowerCase().includes("coming soon") ? (
                    <Clock className="mt-0.5 h-4 w-4 flex-none text-amber-200" aria-hidden="true" />
                  ) : (
                    <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-200" aria-hidden="true" />
                  )}
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              {plan.href ? (
                <LinkButton href={plan.href} className="w-full">
                  {plan.action}
                </LinkButton>
              ) : (
                <Button type="button" variant="secondary" className="w-full" disabled>
                  {plan.action}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
