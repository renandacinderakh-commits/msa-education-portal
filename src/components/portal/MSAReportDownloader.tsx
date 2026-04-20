"use client";

/**
 * MSAReportDownloader.tsx
 * 
 * Self-contained PDF download component. Wraps react-pdf's PDFDownloadLink
 * with ReportPDF template v2. This entire file is loaded client-side only
 * via dynamic import from parent pages.
 */

import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { DailyEntry, MonthlyReport, Student } from "@/lib/supabase/types";
import ReportPDF from "@/components/portal/ReportPDF";

interface Props {
  report: MonthlyReport;
  student: Student;
  entries: DailyEntry[];
}

export default function MSAReportDownloader({ report, student, entries }: Props) {
  const [started, setStarted] = useState(false);

  const filename = [
    "MSA",
    student.full_name.replace(/\s+/g, "_"),
    report.period_label.replace(/\s+/g, "_"),
  ].join("_") + ".pdf";

  if (!started) {
    return (
      <button
        onClick={() => setStarted(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200/60 transition-all hover:from-sky-600 hover:to-indigo-700 active:scale-95"
      >
        <Download className="h-4 w-4" />
        Download Laporan PDF ✨
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <ReportPDF
          report={report}
          student={student}
          entries={entries}
        />
      }
      fileName={filename}
    >
      {({ blob, url, loading, error }) => {
        if (error) {
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Gagal membuat PDF: {String(error)}</span>
              </div>
              <button
                onClick={() => setStarted(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Coba Lagi
              </button>
            </div>
          );
        }

        if (loading) {
          return (
            <div className="inline-flex w-full cursor-wait items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400/80 to-indigo-400/80 px-5 py-3 text-sm font-semibold text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyiapkan PDF... ({entries.length} sesi)
            </div>
          );
        }

        return (
          <a
            href={url!}
            download={filename}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition-all hover:from-emerald-600 hover:to-teal-600 active:scale-95"
          >
            <CheckCircle className="h-4 w-4" />
            ⬇️ Download Sekarang — {filename}
          </a>
        );
      }}
    </PDFDownloadLink>
  );
}
