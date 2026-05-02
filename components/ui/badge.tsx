import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  neutral: "border-white/10 bg-white/8 text-slate-300",
  good: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-300/35 bg-amber-300/10 text-amber-100",
  danger: "border-rose-400/35 bg-rose-400/10 text-rose-100",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: keyof typeof variants;
}

export function Badge({
  children,
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
