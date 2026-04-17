"use client";

import dynamic from "next/dynamic";
import { Download } from "lucide-react";
import type { MonthlyReport, Student, DailyEntry } from "@/lib/supabase/types";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
);
import ReportPDF from "./ReportPDF";

interface Props {
  report: MonthlyReport;
  student: Student;
  entries: DailyEntry[];
}

export default function PDFDownloadButton({ report, student, entries }: Props) {
  if (!report || !student) return null;

  const fileName = `MSA_Report_${student.nickname || student.full_name.replace(/\s/g, "_")}_${report.period_label.replace(/\s/g, "_")}.pdf`;

  return (
    <PDFDownloadLink
      document={<ReportPDF report={report} student={student} entries={entries} />}
      fileName={fileName}
      style={{ textDecoration: "none" }}
    >
      {({ loading: pdfLoading }: { loading: boolean; error: Error | null }) => (
        <button
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all ${pdfLoading ? "opacity-70" : ""}`}
          disabled={pdfLoading}
        >
          {pdfLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {pdfLoading ? "Membuat PDF..." : "Download PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
