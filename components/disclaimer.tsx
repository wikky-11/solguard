import { AlertTriangle } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-200" aria-hidden="true" />
      <p>
        Not financial advice. This tool only provides risk indicators. Always do
        your own research.
      </p>
    </div>
  );
}
