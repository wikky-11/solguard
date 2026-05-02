import type { Metadata } from "next";
import { ScanConsole } from "@/components/scan-console";

export const metadata: Metadata = {
  title: "Scanner",
};

export default function ScanPage() {
  return <ScanConsole />;
}
