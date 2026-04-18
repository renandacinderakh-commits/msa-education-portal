"use client";

import { useState } from "react";
import { CheckCircle, Download, FileText, Loader2 } from "lucide-react";
import type { DailyEntry, MonthlyReport, Student } from "@/lib/supabase/types";
import { SCORE_CATEGORIES, STAR_LABELS } from "@/lib/supabase/types";

interface Props {
  report: MonthlyReport;
  student: Student;
  entries: DailyEntry[];
}

type GenState = "idle" | "generating" | "done" | "error";
type RGB = readonly [number, number, number];
type JsPDFDoc = import("jspdf").jsPDF;

const PW = 210;
const PH = 297;
const ML = 14;
const MR = 14;
const CW = PW - ML - MR;

const COLORS = {
  ink: [15, 23, 42] as const,
  slate: [71, 85, 105] as const,
  muted: [148, 163, 184] as const,
  line: [226, 232, 240] as const,
  soft: [248, 250, 252] as const,
  sky: [14, 165, 233] as const,
  teal: [20, 184, 166] as const,
  emerald: [16, 185, 129] as const,
  amber: [245, 158, 11] as const,
  rose: [244, 63, 94] as const,
  indigo: [99, 102, 241] as const,
  white: [255, 255, 255] as const,
};

const FRAMEWORK_TAGS = [
  "IB PYP inquiry",
  "Montessori independence",
  "EYFS observation",
  "CASEL SEL",
];

const cleanText = (value?: string | null) =>
  (value || "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const safeDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const imageFormat = (dataUrl: string) =>
  dataUrl.toLowerCase().includes("image/png") ? "PNG" : "JPEG";

const imageToDataUrl = async (src?: string | null): Promise<string | null> => {
  if (!src || typeof window === "undefined") return null;

  try {
    const url = src.startsWith("http") ? src : new URL(src, window.location.origin).toString();
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const setFill = (pdf: JsPDFDoc, color: RGB) => pdf.setFillColor(...color);
const setStroke = (pdf: JsPDFDoc, color: RGB) => pdf.setDrawColor(...color);
const setText = (pdf: JsPDFDoc, color: RGB) => pdf.setTextColor(...color);

const text = (
  pdf: JsPDFDoc,
  value: string | string[],
  x: number,
  y: number,
  options?: Parameters<JsPDFDoc["text"]>[3]
) => {
  pdf.text(value, x, y, options);
};

const split = (pdf: JsPDFDoc, value: string, width: number) =>
  pdf.splitTextToSize(cleanText(value), width) as string[];

const drawHeader = (pdf: JsPDFDoc, title: string, student: Student, period: string) => {
  setFill(pdf, COLORS.ink);
  pdf.rect(0, 0, PW, 19, "F");
  setFill(pdf, COLORS.sky);
  pdf.rect(0, 0, 55, 19, "F");

  setText(pdf, COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  text(pdf, "MSA Education", ML, 11);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  text(pdf, cleanText(title), ML + 45, 11);
  text(pdf, `${cleanText(student.full_name)} | ${cleanText(period)}`, PW - MR, 11, {
    align: "right",
  });
};

const drawFooter = (pdf: JsPDFDoc) => {
  const total = pdf.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    pdf.setPage(page);
    setStroke(pdf, COLORS.line);
    pdf.setLineWidth(0.25);
    pdf.line(ML, PH - 13, PW - MR, PH - 13);
    setText(pdf, COLORS.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    text(pdf, "MSA Education - Mindful, Supportive, Adaptive", ML, PH - 6);
    text(pdf, `Page ${page} / ${total}`, PW - MR, PH - 6, { align: "right" });
  }
};

const drawPhoto = (
  pdf: JsPDFDoc,
  dataUrl: string | null,
  x: number,
  y: number,
  w: number,
  h: number,
  fallback: string,
  radius = 3
) => {
  setFill(pdf, [224, 242, 254]);
  pdf.roundedRect(x, y, w, h, radius, radius, "F");

  if (dataUrl) {
    try {
      pdf.addImage(dataUrl, imageFormat(dataUrl), x, y, w, h);
      setStroke(pdf, COLORS.white);
      pdf.setLineWidth(1);
      pdf.roundedRect(x, y, w, h, radius, radius, "S");
      return;
    } catch {
      // Fallback below keeps the report printable even if an image URL is blocked.
    }
  }

  setText(pdf, COLORS.sky);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(Math.min(w, h) * 0.55);
  text(pdf, fallback.slice(0, 1).toUpperCase(), x + w / 2, y + h / 2 + 5, {
    align: "center",
  });
};

const drawPill = (pdf: JsPDFDoc, label: string, x: number, y: number, color: RGB) => {
  setFill(pdf, color);
  pdf.roundedRect(x, y, pdf.getTextWidth(label) + 8, 7, 3.5, 3.5, "F");
  setText(pdf, COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  text(pdf, label, x + 4, y + 4.9);
};

const drawProgressBar = (
  pdf: JsPDFDoc,
  x: number,
  y: number,
  width: number,
  score: number,
  color: RGB
) => {
  setFill(pdf, [241, 245, 249]);
  pdf.roundedRect(x, y, width, 4, 2, 2, "F");
  setFill(pdf, color);
  pdf.roundedRect(x, y, Math.max(2, (score / 5) * width), 4, 2, 2, "F");
};

const averageScore = (report: MonthlyReport) => {
  const values = Object.values(report.consolidated_scores || {}).filter(
    (value): value is number => typeof value === "number"
  );
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const moodLabel = (mood: string) => {
  if (mood === "happy") return "Happy";
  if (mood === "neutral") return "Steady";
  return "Needs support";
};

const scoreLabel = (score: number) => {
  const rounded = Math.max(1, Math.min(5, Math.round(score))) as keyof typeof STAR_LABELS;
  return STAR_LABELS[rounded]?.en || "Progressing";
};

const drawNarrativeCard = (
  pdf: JsPDFDoc,
  y: number,
  labelID: string,
  contentID: string | null | undefined,
  labelEN: string,
  contentEN: string | null | undefined,
  color: RGB
) => {
  const gap = 6;
  const colW = (CW - gap) / 2;
  const idLines = split(pdf, contentID || "-", colW - 10);
  const enLines = split(pdf, contentEN || "-", colW - 10);
  const height = Math.max(idLines.length, enLines.length) * 4.7 + 22;

  setFill(pdf, COLORS.soft);
  pdf.roundedRect(ML, y, CW, height, 4, 4, "F");
  setStroke(pdf, COLORS.line);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(ML, y, CW, height, 4, 4, "S");

  setFill(pdf, color);
  pdf.roundedRect(ML, y, 3, height, 1.5, 1.5, "F");

  setText(pdf, color);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  text(pdf, labelID, ML + 8, y + 9);
  text(pdf, labelEN, ML + 8 + colW + gap, y + 9);

  setText(pdf, COLORS.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  text(pdf, idLines, ML + 8, y + 18);
  setText(pdf, COLORS.slate);
  text(pdf, enLines, ML + 8 + colW + gap, y + 18);

  setStroke(pdf, COLORS.line);
  pdf.line(ML + colW + 3, y + 8, ML + colW + 3, y + height - 8);

  return y + height + 7;
};

const drawCover = (
  pdf: JsPDFDoc,
  student: Student,
  report: MonthlyReport,
  studentPhoto: string | null,
  activityPhotos: (string | null)[]
) => {
  setFill(pdf, COLORS.ink);
  pdf.rect(0, 0, PW, 70, "F");
  setFill(pdf, COLORS.sky);
  pdf.triangle(0, 0, 92, 0, 0, 70, "F");
  setFill(pdf, COLORS.teal);
  pdf.triangle(PW, 0, PW - 72, 0, PW, 70, "F");

  setText(pdf, COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  text(pdf, "Monthly Learning", ML, 24);
  text(pdf, "Progress Report", ML, 35);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  text(pdf, "Laporan perkembangan belajar bulanan - bilingual", ML, 45);

  let tagX = ML;
  FRAMEWORK_TAGS.forEach((tag, index) => {
    drawPill(pdf, tag, tagX, 54, [index % 2 ? 20 : 14, index % 2 ? 184 : 165, index % 2 ? 166 : 233]);
    tagX += pdf.getTextWidth(tag) + 11;
  });

  drawPhoto(
    pdf,
    studentPhoto,
    ML,
    84,
    42,
    42,
    student.nickname || student.full_name,
    6
  );

  setText(pdf, COLORS.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  text(pdf, cleanText(student.full_name), ML + 51, 93);

  setText(pdf, COLORS.slate);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  text(pdf, `Nickname: ${cleanText(student.nickname || "-")}`, ML + 51, 101);
  text(pdf, `Level: ${cleanText(student.grade_level)}`, ML + 51, 108);
  text(pdf, `Date of birth: ${safeDate(student.date_of_birth)}`, ML + 51, 115);
  text(pdf, `Period: ${cleanText(report.period_label)}`, ML + 51, 122);

  const statsY = 84;
  const statW = 35;
  const statX = PW - MR - statW;
  [
    { label: "Meetings", value: String(report.total_meetings || entriesCount(report)), color: COLORS.sky },
    { label: "Attendance", value: `${report.attendance_rate || 100}%`, color: COLORS.emerald },
    { label: "Average", value: `${averageScore(report).toFixed(1)}/5`, color: COLORS.amber },
  ].forEach((item, index) => {
    const y = statsY + index * 17;
    setFill(pdf, item.color);
    pdf.roundedRect(statX, y, statW, 13, 3, 3, "F");
    setText(pdf, COLORS.white);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    text(pdf, item.value, statX + statW / 2, y + 6, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(5.8);
    text(pdf, item.label, statX + statW / 2, y + 10.6, { align: "center" });
  });

  let y = 143;
  setText(pdf, COLORS.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  text(pdf, "Assessment Snapshot", ML, y);
  text(pdf, "Ringkasan Penilaian", PW - MR, y, { align: "right" });
  y += 9;

  const categories = SCORE_CATEGORIES.filter((cat) => report.consolidated_scores?.[cat.key] != null);
  categories.forEach((cat, index) => {
    const colW = (CW - 6) / 2;
    const x = ML + (index % 2) * (colW + 6);
    const rowY = y + Math.floor(index / 2) * 17;
    const score = Number(report.consolidated_scores?.[cat.key] || 0);

    setText(pdf, COLORS.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.4);
    text(pdf, cleanText(cat.label_id), x, rowY);
    setText(pdf, COLORS.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.3);
    text(pdf, cleanText(cat.label_en), x, rowY + 4.2);
    drawProgressBar(pdf, x, rowY + 7, colW - 18, score, COLORS.sky);
    setText(pdf, COLORS.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    text(pdf, `${score}/5`, x + colW - 14, rowY + 10.4);
  });

  y += Math.ceil(categories.length / 2) * 17 + 7;
  setFill(pdf, [240, 249, 255]);
  pdf.roundedRect(ML, y, CW, 25, 4, 4, "F");
  setText(pdf, COLORS.sky);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  text(pdf, "What the score means", ML + 6, y + 8);
  setText(pdf, COLORS.slate);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.2);
  text(
    pdf,
    split(
      pdf,
      "Scores combine teacher observation, daily learning evidence, independence, communication, creativity, and social-emotional readiness.",
      CW - 12
    ),
    ML + 6,
    y + 15
  );

  const photos = activityPhotos.filter(Boolean).slice(0, 3);
  if (photos.length > 0) {
    y += 39;
    setText(pdf, COLORS.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    text(pdf, "Learning Evidence Photos", ML, y);
    y += 5;
    photos.forEach((photo, index) => {
      drawPhoto(pdf, photo, ML + index * 62, y, 56, 34, "A", 4);
    });
  }
};

const entriesCount = (report: MonthlyReport) => report.daily_entries?.length || 0;

const drawNarrativePage = (pdf: JsPDFDoc, student: Student, report: MonthlyReport) => {
  pdf.addPage();
  drawHeader(pdf, "Narrative Summary", student, report.period_label);
  let y = 31;

  setText(pdf, COLORS.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  text(pdf, "Bilingual Learning Narrative", ML, y);
  y += 7;
  setText(pdf, COLORS.slate);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  text(
    pdf,
    split(
      pdf,
      "Each section pairs Bahasa Indonesia and English so parents can read the same learning story clearly from both perspectives.",
      CW
    ),
    ML,
    y
  );
  y += 15;

  y = drawNarrativeCard(
    pdf,
    y,
    "Ringkasan perkembangan",
    report.summary,
    "Learning summary",
    report.summary_en,
    COLORS.sky
  );
  y = drawNarrativeCard(
    pdf,
    y,
    "Pencapaian bulan ini",
    report.achievements,
    "Monthly achievements",
    report.achievements_en,
    COLORS.emerald
  );
  y = drawNarrativeCard(
    pdf,
    y,
    "Target bulan berikutnya",
    report.goals_next_month,
    "Next-month goals",
    report.goals_next_month_en,
    COLORS.indigo
  );
  drawNarrativeCard(
    pdf,
    y,
    "Rekomendasi orang tua",
    report.recommendations,
    "Parent recommendations",
    report.recommendations_en,
    COLORS.rose
  );
};

const drawSessionPages = (
  pdf: JsPDFDoc,
  student: Student,
  report: MonthlyReport,
  entries: DailyEntry[],
  activityPhotos: (string | null)[]
) => {
  pdf.addPage();
  drawHeader(pdf, "Learning Evidence Log", student, report.period_label);

  let y = 31;
  setText(pdf, COLORS.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  text(pdf, "Daily Session Evidence", ML, y);
  y += 8;

  const orderedEntries = [...entries].sort(
    (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );

  if (!orderedEntries.length) {
    setText(pdf, COLORS.slate);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    text(pdf, "No daily entries are attached to this monthly report yet.", ML, y);
    return;
  }

  orderedEntries.forEach((entry, index) => {
    const estimatedHeight = 49;
    if (y + estimatedHeight > PH - 22) {
      pdf.addPage();
      drawHeader(pdf, "Learning Evidence Log", student, report.period_label);
      y = 31;
    }

    const photo = activityPhotos[index] || null;
    setFill(pdf, COLORS.soft);
    pdf.roundedRect(ML, y, CW, estimatedHeight - 5, 4, 4, "F");
    setStroke(pdf, COLORS.line);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(ML, y, CW, estimatedHeight - 5, 4, 4, "S");

    drawPhoto(pdf, photo, ML + 4, y + 4, 31, 31, String(entry.meeting_number), 3);

    const x = ML + 42;
    setText(pdf, COLORS.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    text(pdf, `#${entry.meeting_number} ${cleanText(entry.session_title)}`, x, y + 8);

    setText(pdf, COLORS.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    text(
      pdf,
      `${safeDate(entry.entry_date)} | Mood: ${moodLabel(entry.mood)} | Score: ${entry.overall_stars || 0}/5`,
      x,
      y + 14
    );

    setText(pdf, COLORS.slate);
    pdf.setFontSize(7.4);
    text(pdf, split(pdf, entry.activities_description || entry.teacher_notes, 124).slice(0, 3), x, y + 22);

    const score = entry.overall_stars || 0;
    drawProgressBar(pdf, x, y + 36, 82, score, COLORS.amber);
    setText(pdf, COLORS.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    text(pdf, scoreLabel(score), x + 88, y + 39.3);

    y += estimatedHeight;
  });
};

const drawClosingPage = (pdf: JsPDFDoc, student: Student, report: MonthlyReport) => {
  pdf.addPage();
  drawHeader(pdf, "Closing Page", student, report.period_label);

  let y = 42;
  setFill(pdf, [240, 249, 255]);
  pdf.roundedRect(ML, y, CW, 32, 5, 5, "F");
  setStroke(pdf, COLORS.sky);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(ML, y, CW, 32, 5, 5, "S");

  setText(pdf, COLORS.sky);
  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(10.5);
  text(pdf, "Every child learns at their own rhythm.", PW / 2, y + 12, { align: "center" });
  text(pdf, "Our role is to guide each step with patience and evidence.", PW / 2, y + 21, {
    align: "center",
  });

  y += 54;
  const sigW = (CW - 10) / 2;
  [
    { x: ML, title: "Prepared by", line1: "Learning Facilitator", line2: "MSA Education" },
    { x: ML + sigW + 10, title: "Acknowledged by", line1: "Parent / Guardian", line2: student.full_name },
  ].forEach((item) => {
    setFill(pdf, COLORS.soft);
    pdf.roundedRect(item.x, y, sigW, 45, 4, 4, "F");
    setStroke(pdf, COLORS.line);
    pdf.roundedRect(item.x, y, sigW, 45, 4, 4, "S");

    setText(pdf, COLORS.slate);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    text(pdf, item.title, item.x + sigW / 2, y + 10, { align: "center" });
    setStroke(pdf, [203, 213, 225]);
    pdf.line(item.x + 17, y + 24, item.x + sigW - 17, y + 24);
    text(pdf, item.line1, item.x + sigW / 2, y + 34, { align: "center" });
    pdf.setFontSize(7);
    text(pdf, cleanText(item.line2), item.x + sigW / 2, y + 40, { align: "center" });
  });

  y += 66;
  setText(pdf, COLORS.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.2);
  text(
    pdf,
    split(
      pdf,
      `Generated on ${safeDate(new Date().toISOString())}. This document summarizes teacher observations, daily learning evidence, monthly progress, and next-step recommendations.`,
      CW
    ),
    ML,
    y
  );
};

export default function PDFDownloadButton({ report, student, entries }: Props) {
  const [state, setState] = useState<GenState>("idle");

  const generatePDF = async () => {
    setState("generating");
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const activityUrls = entries.flatMap((entry) => entry.photo_urls || []).slice(0, 12);
      const [studentPhoto, ...activityPhotos] = await Promise.all([
        imageToDataUrl(student.photo_url),
        ...activityUrls.map((url) => imageToDataUrl(url)),
      ]);

      drawCover(pdf, student, report, studentPhoto, activityPhotos);
      drawNarrativePage(pdf, student, report);
      drawSessionPages(pdf, student, report, entries, activityPhotos);
      drawClosingPage(pdf, student, report);
      drawFooter(pdf);

      const safeName = cleanText(student.full_name).replace(/\s+/g, "_");
      const safePeriod = cleanText(report.period_label).replace(/\s+/g, "_");
      pdf.save(`MSA_Report_${safeName}_${safePeriod}.pdf`);

      setState("done");
      setTimeout(() => setState("idle"), 4000);
    } catch (err) {
      console.error("PDF generation error:", err);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const buttonClass = {
    idle: "bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white active:scale-95",
    generating: "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed",
    done: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
    error: "bg-gradient-to-r from-rose-500 to-red-500 text-white",
  };

  const buttonContent = {
    idle: (
      <>
        <Download className="h-4 w-4" />
        Download PDF Report
      </>
    ),
    generating: (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Creating premium report...
      </>
    ),
    done: (
      <>
        <CheckCircle className="h-4 w-4" />
        PDF ready
      </>
    ),
    error: (
      <>
        <FileText className="h-4 w-4" />
        Try again
      </>
    ),
  };

  return (
    <div className="space-y-2">
      <button
        onClick={generatePDF}
        disabled={state === "generating"}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${buttonClass[state]}`}
      >
        {buttonContent[state]}
      </button>
      {state === "idle" && (
        <p className="text-center text-[10px] text-slate-400">
          Bilingual layout, learning rubric, student photo, and activity evidence included.
        </p>
      )}
    </div>
  );
}
