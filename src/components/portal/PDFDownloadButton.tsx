"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle } from "lucide-react";
import type { DailyEntry, MonthlyReport, Student } from "@/lib/supabase/types";
import dynamic from "next/dynamic";

// Dynamically import react-pdf components (client-only, no SSR)
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

// Synchronous import of ReportPDF (avoids SSR issues)
import ReportPDF from "@/components/portal/ReportPDF";

interface Props {
  report: MonthlyReport;
  student: Student;
  entries: DailyEntry[];
  reportNumber?: number;
}

export default function PDFDownloadButton({ report, student, entries }: Props) {
  const [ready, setReady] = useState(false);

  const filename = `MSA_Report_${student.full_name.replace(/\s+/g, "_")}_${report.period_label.replace(/\s+/g, "_")}.pdf`;

  const doc = (
    <ReportPDF report={report} student={student} entries={entries} />
  );

  if (!ready) {
    return (
      <button
        onClick={() => setReady(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-all hover:from-sky-600 hover:to-indigo-600 active:scale-95"
      >
        <Download className="h-4 w-4" />
        Siapkan PDF Baru ✨
      </button>
    );
  }

  return (
    <PDFDownloadLink document={doc} fileName={filename}>
      {({ loading, error }) => {
        if (error) {
          return (
            <button
              onClick={() => setReady(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-100 px-5 py-3 text-sm font-semibold text-rose-700"
            >
              ⚠️ Error — Coba Lagi
            </button>
          );
        }

        if (loading) {
          return (
            <button
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-400 px-5 py-3 text-sm font-semibold text-white opacity-80"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Membuat PDF... Sabar ya 😊
            </button>
          );
        }

        return (
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:from-emerald-600 hover:to-teal-600 active:scale-95">
            <CheckCircle className="h-4 w-4" />
            ⬇️ Download Laporan PDF (Klik di sini)
          </button>
        );
      }}
    </PDFDownloadLink>
  );
}
