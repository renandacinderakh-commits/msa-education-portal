"use client";

/**
 * PDFDownloadButton.tsx
 *
 * Thin wrapper — dynamically loads MSAReportDownloader (which contains
 * all react-pdf code) client-side only to prevent SSR crashes.
 */

import dynamic from "next/dynamic";
import type { DailyEntry, MonthlyReport, Student } from "@/lib/supabase/types";

const MSAReportDownloader = dynamic(
  () => import("@/components/portal/MSAReportDownloader"),
  {
    ssr: false,
    loading: () => (
      <div className="h-12 w-full animate-pulse rounded-xl bg-gradient-to-r from-sky-100 to-indigo-100" />
    ),
  }
);

interface Props {
  report: MonthlyReport;
  student: Student;
  entries: DailyEntry[];
  reportNumber?: number;
}

export default function PDFDownloadButton({ report, student, entries }: Props) {
  return (
    <MSAReportDownloader
      report={report}
      student={student}
      entries={entries}
    />
  );
}
