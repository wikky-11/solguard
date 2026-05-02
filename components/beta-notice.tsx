import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BetaNoticeProps {
  className?: string;
}

export function BetaNotice({ className }: BetaNoticeProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50",
        className,
      )}
    >
      <div className="mb-2">
        <Badge variant="good">Public Beta</Badge>
      </div>
      SolGuard is in public beta. Reports may be incomplete if RPC, holder,
      metadata, or market data is unavailable.
    </div>
  );
}
