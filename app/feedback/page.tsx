import type { Metadata } from "next";
import { FeedbackForm } from "@/components/feedback-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Feedback",
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Badge variant="good">Public Beta</Badge>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Help shape SolGuard
        </h1>
        <p className="mt-3 text-slate-400">
          Share scanner results, rough edges, or missing signals. No wallet
          connection or sensitive data is required.
        </p>
      </div>
      <FeedbackForm />
    </div>
  );
}
