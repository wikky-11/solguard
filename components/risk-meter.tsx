import { cn } from "@/lib/utils";
import type { RiskLabel } from "@/types/scan";

function riskColor(label: RiskLabel) {
  if (label === "Low Risk") {
    return "#34d399";
  }

  if (label === "Medium Risk") {
    return "#fbbf24";
  }

  return "#fb7185";
}

export function RiskMeter({
  score,
  label,
  className,
}: {
  score: number;
  label: RiskLabel;
  className?: string;
}) {
  const color = riskColor(label);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className="grid h-28 w-28 flex-none place-items-center rounded-full p-2"
        style={{
          background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
        }}
        aria-label={`Risk score ${score} out of 100`}
      >
        <div className="grid h-full w-full place-items-center rounded-full bg-slate-950">
          <div className="text-center">
            <div className="text-3xl font-black text-white">{score}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              / 100
            </div>
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">Final risk score</p>
        <p className="mt-1 text-2xl font-bold text-white">{label}</p>
        <p className="mt-2 max-w-sm text-sm text-slate-400">
          0-30 Low Risk, 31-65 Medium Risk, 66-100 High Risk.
        </p>
      </div>
    </div>
  );
}
