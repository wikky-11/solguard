import { Card } from "@/components/ui/card";

export default function ReportLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-5">
        <div className="h-8 w-56 rounded bg-white/10" />
        <div className="h-12 w-full max-w-2xl rounded bg-white/10" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="h-56" />
          <Card className="h-56" />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="h-48" />
          <Card className="h-48" />
          <Card className="h-48" />
        </div>
      </div>
    </div>
  );
}
