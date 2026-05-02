export type AnalyticsEvent =
  | "scan_started"
  | "scan_completed"
  | "scan_failed"
  | "report_copied"
  | "report_downloaded"
  | "feedback_submitted";

type AnalyticsProperties = Record<string, boolean | number | string | null>;

export function trackEvent(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {},
) {
  void event;
  void properties;
}

export function trackScanStarted(properties?: AnalyticsProperties) {
  trackEvent("scan_started", properties);
}

export function trackScanCompleted(properties?: AnalyticsProperties) {
  trackEvent("scan_completed", properties);
}

export function trackScanFailed(properties?: AnalyticsProperties) {
  trackEvent("scan_failed", properties);
}

export function trackReportCopied(properties?: AnalyticsProperties) {
  trackEvent("report_copied", properties);
}

export function trackReportDownloaded(properties?: AnalyticsProperties) {
  trackEvent("report_downloaded", properties);
}

export function trackFeedbackSubmitted(properties?: AnalyticsProperties) {
  trackEvent("feedback_submitted", properties);
}
