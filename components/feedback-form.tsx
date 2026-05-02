"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { trackFeedbackSubmitted } from "@/lib/analytics";

export function FeedbackForm() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!feedback.trim()) {
      setError("Feedback text is required.");
      setSubmitted(false);
      return;
    }

    // TODO: Send feedback to a database or email workflow when beta intake is wired.
    trackFeedbackSubmitted({ hasFeedback: true });
    setError(null);
    setSubmitted(true);
    setFeedback("");
    event.currentTarget.reset();
  }

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="feedback-name" label="Name optional" name="name" />
          <TextField
            id="feedback-email"
            label="Email optional"
            name="email"
            type="email"
          />
          <TextField
            id="feedback-token"
            label="Token address scanned optional"
            name="token"
            className="sm:col-span-2"
          />
          <TextField
            id="feedback-rating"
            label="Rating 1-5 optional"
            name="rating"
            type="number"
            min={1}
            max={5}
            step={1}
          />
        </div>

        <label className="block space-y-2" htmlFor="feedback-text">
          <span className="text-sm font-medium text-slate-200">
            Feedback text
          </span>
          <textarea
            id="feedback-text"
            name="feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            rows={6}
            required
            placeholder="Tell us what worked, what felt unclear, or what you want before launch."
            className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70 focus:ring-4 focus:ring-emerald-400/10"
          />
        </label>

        {error ? (
          <div className="rounded-lg border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {submitted ? (
          <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50">
            Thanks. Your feedback has been recorded for this beta session.
          </div>
        ) : null}

        <Button type="submit" size="lg">
          Submit Feedback
        </Button>
      </form>
    </Card>
  );
}
