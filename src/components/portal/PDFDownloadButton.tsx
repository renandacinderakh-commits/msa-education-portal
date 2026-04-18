"use client";

import { useState } from "react";
import { CheckCircle, Download, FileText, Loader2 } from "lucide-react";
import type { DailyEntry, MonthlyReport, Student } from "@/lib/supabase/types";
import { SCORE_CATEGORIES } from "@/lib/supabase/types";

interface Props {
  report: MonthlyReport;
  student: Student;
  entries: DailyEntry[];
  reportNumber?: number;
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
  panel: [248, 250, 252] as const,
  paper: [255, 255, 255] as const,
  sky: [14, 165, 233] as const,
  teal: [20, 184, 166] as const,
  emerald: [16, 185, 129] as const,
  amber: [245, 158, 11] as const,
  rose: [244, 63, 94] as const,
  indigo: [99, 102, 241] as const,
};

let activeLogoData: string | null = null;

const FRAMEWORKS = [
  "IB PYP: inquiry + ATL skills",
  "Montessori: independence + practical life",
  "EYFS: observation-based progress",
  "CASEL: social-emotional learning",
  "Cambridge-style: skill progression",
];

const DOMAIN_DETAILS: Record<
  string,
  { focus: string; subskills: string[]; evidence: string; nextStep: string }
> = {
  literacy: {
    focus: "Fonik, kosakata, pemahaman cerita, dan pre-writing",
    subskills: ["Letter-sound awareness", "Vocabulary recall", "Story retell", "Early writing"],
    evidence: "Observed through picture-book talk, phonics cards, oral response, and guided writing.",
    nextStep: "Add short daily read-aloud, ask prediction questions, and practice two target sounds.",
  },
  numeracy: {
    focus: "Number sense, pola, kuantitas, logika awal",
    subskills: ["Counting accuracy", "One-to-one match", "Patterning", "Math language"],
    evidence: "Observed through manipulatives, object counting, sequence games, and number comparison.",
    nextStep: "Use household objects for count-sort-compare games in short 5-10 minute routines.",
  },
  fine_motor: {
    focus: "Koordinasi tangan, grip, kontrol garis, manipulatif",
    subskills: ["Pencil grip", "Cut/paste control", "Hand strength", "Bilateral coordination"],
    evidence: "Observed through collage, tracing, card sorting, and tool-based creative tasks.",
    nextStep: "Practice tearing, squeezing, tracing, and small-object transfer to build hand control.",
  },
  cognitive: {
    focus: "Problem solving, memori kerja, klasifikasi, fokus",
    subskills: ["Working memory", "Sorting/classifying", "Planning", "Flexible thinking"],
    evidence: "Observed through puzzles, matching, step-by-step tasks, and reflection prompts.",
    nextStep: "Give two-step instructions and ask the child to explain the plan before starting.",
  },
  social_emotional: {
    focus: "Regulasi emosi, percaya diri, empati, resiliensi",
    subskills: ["Self-regulation", "Confidence", "Turn-taking", "Persistence"],
    evidence: "Observed through transitions, group-style routines, emotional labeling, and teacher feedback.",
    nextStep: "Use feeling words and specific praise to reinforce effort, patience, and recovery after mistakes.",
  },
  communication: {
    focus: "Bahasa reseptif-ekspresif, instruksi, dialog",
    subskills: ["Listening", "Expressive language", "Question response", "Conversation turn"],
    evidence: "Observed through story talk, guided questions, instructions, and mini-presentation moments.",
    nextStep: "Ask open-ended questions and wait 5 seconds before prompting to build expressive confidence.",
  },
  creativity: {
    focus: "Imajinasi, seni, pilihan ide, ekspresi diri",
    subskills: ["Idea generation", "Color/shape choice", "Creative risk", "Reflection"],
    evidence: "Observed through art output, design choices, storytelling, and explanation of work.",
    nextStep: "Offer two creative choices and invite the child to explain the reason behind the choice.",
  },
  physical: {
    focus: "Koordinasi tubuh, postur belajar, stamina, movement",
    subskills: ["Posture", "Body coordination", "Learning stamina", "Movement control"],
    evidence: "Observed through table posture, movement breaks, gross-motor cues, and activity endurance.",
    nextStep: "Use short movement breaks before focused work and maintain consistent seating routines.",
  },
  independence: {
    focus: "Self-help, pilihan mandiri, merapikan, mulai tugas",
    subskills: ["Task initiation", "Material care", "Choice-making", "Clean-up routine"],
    evidence: "Observed through start-finish routines, material handling, and clean-up behavior.",
    nextStep: "Use a simple visual checklist: prepare, do, check, tidy, share.",
  },
  curiosity: {
    focus: "Inquiry, eksplorasi, bertanya, koneksi ide",
    subskills: ["Questioning", "Exploration", "Connection-making", "Reflection"],
    evidence: "Observed through why/how questions, object exploration, and linking new ideas to experience.",
    nextStep: "Ask one wonder question per day and let the child test or draw the answer.",
  },
};

const cleanText = (value?: string | null) =>
  (value || "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toTitle = (value: string) =>
  cleanText(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const safeDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const setFill = (pdf: JsPDFDoc, color: RGB) => pdf.setFillColor(...color);
const setStroke = (pdf: JsPDFDoc, color: RGB) => pdf.setDrawColor(...color);
const setText = (pdf: JsPDFDoc, color: RGB) => pdf.setTextColor(...color);
const split = (pdf: JsPDFDoc, value: string | null | undefined, width: number) =>
  pdf.splitTextToSize(cleanText(value), width) as string[];

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

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return window.btoa(binary);
};

const registerMontserrat = async (pdf: JsPDFDoc) => {
  if (typeof window === "undefined") return;

  try {
    const fonts = [
      { file: "Montserrat-Regular.ttf", style: "normal" },
      { file: "Montserrat-SemiBold.ttf", style: "semibold" },
      { file: "Montserrat-Bold.ttf", style: "bold" },
    ];

    await Promise.all(
      fonts.map(async (font) => {
        const response = await fetch(`/fonts/${font.file}`);
        if (!response.ok) throw new Error(`Font not found: ${font.file}`);
        const base64 = arrayBufferToBase64(await response.arrayBuffer());
        pdf.addFileToVFS(font.file, base64);
        pdf.addFont(font.file, "Montserrat", font.style);
      })
    );

    pdf.setFont("Montserrat", "normal");
  } catch {
    pdf.setFont("helvetica", "normal");
  }
};

const averageScore5 = (report: MonthlyReport) => {
  const scores = Object.values(report.consolidated_scores || {}).filter(
    (score): score is number => typeof score === "number"
  );
  if (!scores.length) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

const score10 = (score5: number) => Math.max(1, Math.min(10, Math.round(score5 * 2)));

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const reportCode = (student: Student, report: MonthlyReport, reportNumber?: number) => {
  const studentCode = cleanText(student.nickname || student.full_name)
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");
  const sequence = String(reportNumber || (hashString(report.id) % 89) + 10).padStart(2, "0");
  return `MSA/${String(report.month).padStart(2, "0")}-${sequence}/JKT/${studentCode}`;
};

const drawHeader = (
  pdf: JsPDFDoc,
  title: string,
  code: string,
  student: Student,
  report: MonthlyReport
) => {
  setFill(pdf, COLORS.paper);
  pdf.rect(0, 0, PW, PH, "F");

  setFill(pdf, COLORS.ink);
  pdf.rect(0, 0, PW, 20, "F");
  setFill(pdf, COLORS.sky);
  pdf.rect(0, 0, 62, 20, "F");

  setFill(pdf, COLORS.paper);
  pdf.roundedRect(ML - 1, 4.3, 37, 11.5, 2, 2, "F");
  if (activeLogoData) {
    try {
      pdf.addImage(activeLogoData, imageFormat(activeLogoData), ML + 1, 6.2, 32, 7.5);
    } catch {
      setText(pdf, COLORS.sky);
      pdf.setFont("Montserrat", "bold");
      pdf.setFontSize(7);
      pdf.text("MSA Education", ML + 2, 11.5);
    }
  } else {
    setText(pdf, COLORS.sky);
    pdf.setFont("Montserrat", "bold");
    pdf.setFontSize(7);
    pdf.text("MSA Education", ML + 2, 11.5);
  }

  setText(pdf, COLORS.paper);
  pdf.setFont("Montserrat", "normal");
  pdf.setFontSize(7.2);
  pdf.text(cleanText(title), ML + 52, 12);
  pdf.text(`${code} | ${cleanText(student.full_name)} | ${cleanText(report.period_label)}`, PW - MR, 12, {
    align: "right",
  });
};

const drawFooter = (pdf: JsPDFDoc, code: string) => {
  const total = pdf.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    pdf.setPage(page);
    setStroke(pdf, COLORS.line);
    pdf.setLineWidth(0.25);
    pdf.line(ML, PH - 14, PW - MR, PH - 14);
    setText(pdf, COLORS.muted);
    pdf.setFont("Montserrat", "normal");
    pdf.setFontSize(6.8);
    pdf.text("MSA Education - Student Learning Portfolio Report - Print ready A4", ML, PH - 7);
    pdf.text(`${code} - Page ${page}/${total}`, PW - MR, PH - 7, { align: "right" });
  }
};

const drawPhoto = (
  pdf: JsPDFDoc,
  dataUrl: string | null,
  x: number,
  y: number,
  w: number,
  h: number,
  fallback: string
) => {
  setFill(pdf, [240, 249, 255]);
  pdf.roundedRect(x, y, w, h, 3, 3, "F");
  if (dataUrl) {
    try {
      pdf.addImage(dataUrl, imageFormat(dataUrl), x, y, w, h);
    } catch {
      // Keep the fallback printable if browser blocks an image.
    }
  }
  setStroke(pdf, COLORS.line);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(x, y, w, h, 3, 3, "S");

  if (!dataUrl) {
    setText(pdf, COLORS.sky);
    pdf.setFont("Montserrat", "bold");
    pdf.setFontSize(20);
    pdf.text(cleanText(fallback).slice(0, 1).toUpperCase(), x + w / 2, y + h / 2 + 5, {
      align: "center",
    });
  }
};

const drawVectorStar = (
  pdf: JsPDFDoc,
  cx: number,
  cy: number,
  outer: number,
  filled: boolean
) => {
  const inner = outer * 0.48;
  const points: [number, number][] = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outer : inner;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  const deltas = points.slice(1).map((point, index) => [
    point[0] - points[index][0],
    point[1] - points[index][1],
  ]);
  setStroke(pdf, filled ? COLORS.amber : COLORS.line);
  setFill(pdf, filled ? COLORS.amber : COLORS.paper);
  pdf.lines(deltas, points[0][0], points[0][1], [1, 1], filled ? "F" : "S", true);
};

const drawTenStars = (pdf: JsPDFDoc, x: number, y: number, score: number, size = 1.85) => {
  for (let i = 0; i < 10; i += 1) {
    drawVectorStar(pdf, x + i * (size * 2.35), y, size, i < score);
  }
};

const drawMetricBox = (
  pdf: JsPDFDoc,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  color: RGB
) => {
  setFill(pdf, color);
  pdf.roundedRect(x, y, w, 18, 3, 3, "F");
  setText(pdf, COLORS.paper);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(13);
  pdf.text(value, x + w / 2, y + 8, { align: "center" });
  pdf.setFont("Montserrat", "normal");
  pdf.setFontSize(6);
  pdf.text(label, x + w / 2, y + 14, { align: "center" });
};

const drawCover = (
  pdf: JsPDFDoc,
  student: Student,
  report: MonthlyReport,
  code: string,
  studentPhoto: string | null
) => {
  drawHeader(pdf, "Monthly Student Learning Report", code, student, report);

  setFill(pdf, [240, 249, 255]);
  pdf.roundedRect(ML, 33, CW, 39, 5, 5, "F");
  setFill(pdf, COLORS.ink);
  pdf.roundedRect(ML, 33, 4, 39, 2, 2, "F");

  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(19);
  pdf.text("Comprehensive Learning Progress Report", ML + 10, 48);
  pdf.setFontSize(9);
  setText(pdf, COLORS.slate);
  pdf.setFont("Montserrat", "normal");
  pdf.text("Bilingual portfolio, 10-star rubric, daily evidence, and next-step learning plan.", ML + 10, 58);
  setText(pdf, COLORS.sky);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(8);
  pdf.text(code, PW - MR - 1, 47, { align: "right" });
  setText(pdf, COLORS.muted);
  pdf.setFont("Montserrat", "normal");
  pdf.setFontSize(7);
  pdf.text(`Generated: ${safeDate(new Date().toISOString())}`, PW - MR - 1, 56, { align: "right" });

  drawPhoto(pdf, studentPhoto, ML, 84, 50, 50, student.nickname || student.full_name);

  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(18);
  pdf.text(cleanText(student.full_name), ML + 60, 94);
  setText(pdf, COLORS.slate);
  pdf.setFont("Montserrat", "normal");
  pdf.setFontSize(8.2);
  pdf.text(`Nickname: ${cleanText(student.nickname || "-")}`, ML + 60, 103);
  pdf.text(`Level: ${cleanText(student.grade_level)}`, ML + 60, 110);
  pdf.text(`Date of birth: ${safeDate(student.date_of_birth)}`, ML + 60, 117);
  pdf.text(`Period: ${cleanText(report.period_label)}`, ML + 60, 124);

  const avg10 = score10(averageScore5(report));
  drawMetricBox(pdf, PW - MR - 37, 84, 37, "Meetings", String(report.total_meetings || 0), COLORS.sky);
  drawMetricBox(pdf, PW - MR - 37, 106, 37, "Attendance", `${report.attendance_rate || 100}%`, COLORS.emerald);
  drawMetricBox(pdf, PW - MR - 37, 128, 37, "Avg Score", `${avg10}/10`, COLORS.amber);

  let y = 154;
  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(10.5);
  pdf.text("Overall 10-Star Growth Rating", ML, y);
  drawTenStars(pdf, ML, y + 12, avg10, 2.4);
  setText(pdf, COLORS.ink);
  pdf.setFontSize(16);
  pdf.text(`${avg10}/10`, ML + 75, y + 14);

  y += 31;
  setFill(pdf, COLORS.panel);
  pdf.roundedRect(ML, y, CW, 34, 4, 4, "F");
  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(9);
  pdf.text("Assessment Scale", ML + 6, y + 9);
  setText(pdf, COLORS.slate);
  pdf.setFont("Montserrat", "normal");
  pdf.setFontSize(7.2);
  const scale = [
    "1-2 Emerging: needs consistent guidance",
    "3-4 Developing: building early control",
    "5-6 Secure: meets expected routines",
    "7-8 Strong: works with confidence",
    "9-10 Exceptional: independent and transferable",
  ];
  scale.forEach((item, index) => pdf.text(item, ML + 6 + (index % 2) * 89, y + 17 + Math.floor(index / 2) * 7));

  y += 49;
  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(9.5);
  pdf.text("Framework References Used", ML, y);
  y += 8;
  FRAMEWORKS.forEach((item, index) => {
    const x = ML + (index % 2) * 91;
    const rowY = y + Math.floor(index / 2) * 13;
    setFill(pdf, index % 2 ? [236, 253, 245] : [239, 246, 255]);
    pdf.roundedRect(x, rowY, 84, 9, 3, 3, "F");
    setText(pdf, index % 2 ? COLORS.teal : COLORS.sky);
    pdf.setFont("Montserrat", "bold");
    pdf.setFontSize(6.4);
    pdf.text(cleanText(item), x + 4, rowY + 5.8);
  });
};

const narrativeBlock = (
  pdf: JsPDFDoc,
  y: number,
  titleID: string,
  textID: string | null | undefined,
  titleEN: string,
  textEN: string | null | undefined,
  color: RGB
) => {
  const gap = 7;
  const colW = (CW - gap) / 2;
  const left = split(pdf, textID, colW - 10);
  const right = split(pdf, textEN, colW - 10);
  const height = Math.max(left.length, right.length) * 4.7 + 21;

  setFill(pdf, COLORS.panel);
  pdf.roundedRect(ML, y, CW, height, 4, 4, "F");
  setFill(pdf, color);
  pdf.roundedRect(ML, y, 3, height, 1.5, 1.5, "F");
  setStroke(pdf, COLORS.line);
  pdf.roundedRect(ML, y, CW, height, 4, 4, "S");
  pdf.line(ML + colW + gap / 2, y + 7, ML + colW + gap / 2, y + height - 7);

  setText(pdf, color);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(8.3);
  pdf.text(titleID, ML + 8, y + 8.5);
  pdf.text(titleEN, ML + 8 + colW + gap, y + 8.5);

  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "normal");
  pdf.setFontSize(7.6);
  pdf.text(left, ML + 8, y + 17);
  setText(pdf, COLORS.slate);
  pdf.text(right, ML + 8 + colW + gap, y + 17);
  return y + height + 7;
};

const drawNarrative = (pdf: JsPDFDoc, student: Student, report: MonthlyReport, code: string) => {
  pdf.addPage();
  drawHeader(pdf, "Executive Learning Summary", code, student, report);

  let y = 33;
  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(14);
  pdf.text("Executive Summary / Ringkasan Utama", ML, y);
  y += 9;
  setText(pdf, COLORS.slate);
  pdf.setFont("Montserrat", "normal");
  pdf.setFontSize(7.5);
  pdf.text(
    split(
      pdf,
      "This page turns daily teacher observations into a parent-friendly bilingual learning story with strengths, priorities, and clear home support.",
      CW
    ),
    ML,
    y
  );
  y += 15;

  y = narrativeBlock(pdf, y, "Ringkasan perkembangan", report.summary, "Learning summary", report.summary_en, COLORS.sky);
  y = narrativeBlock(pdf, y, "Pencapaian utama", report.achievements, "Key achievements", report.achievements_en, COLORS.emerald);
  y = narrativeBlock(pdf, y, "Target bulan berikutnya", report.goals_next_month, "Next-month goals", report.goals_next_month_en, COLORS.indigo);
  narrativeBlock(pdf, y, "Rekomendasi orang tua", report.recommendations, "Parent recommendations", report.recommendations_en, COLORS.rose);
};

const domainScore = (report: MonthlyReport, key: string) =>
  score10(Number(report.consolidated_scores?.[key as keyof typeof report.consolidated_scores] || 0));

const drawDomainCard = (
  pdf: JsPDFDoc,
  x: number,
  y: number,
  w: number,
  category: (typeof SCORE_CATEGORIES)[number],
  report: MonthlyReport
) => {
  const details = DOMAIN_DETAILS[category.key];
  const score = domainScore(report, category.key);
  const h = 43;

  setFill(pdf, COLORS.paper);
  pdf.roundedRect(x, y, w, h, 4, 4, "F");
  setStroke(pdf, COLORS.line);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, w, h, 4, 4, "S");
  setFill(pdf, [239, 246, 255]);
  pdf.roundedRect(x, y, w, 10, 4, 4, "F");

  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(8);
  pdf.text(cleanText(category.label_id), x + 5, y + 6.5);
  setText(pdf, COLORS.sky);
  pdf.setFontSize(7);
  pdf.text(`${score}/10`, x + w - 6, y + 6.5, { align: "right" });
  drawTenStars(pdf, x + 5, y + 15.5, score, 1.35);

  setText(pdf, COLORS.slate);
  pdf.setFont("Montserrat", "normal");
  pdf.setFontSize(6.3);
  pdf.text(split(pdf, details.focus, w - 10).slice(0, 1), x + 5, y + 23);

  const subskillText = details.subskills.join(" | ");
  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(5.9);
  pdf.text(split(pdf, subskillText, w - 10).slice(0, 2), x + 5, y + 29);

  setText(pdf, COLORS.muted);
  pdf.setFont("Montserrat", "normal");
  pdf.setFontSize(5.7);
  pdf.text(split(pdf, `Evidence: ${details.evidence}`, w - 10).slice(0, 2), x + 5, y + 35.5);
};

const drawAssessmentPages = (pdf: JsPDFDoc, student: Student, report: MonthlyReport, code: string) => {
  const categories = SCORE_CATEGORIES.filter((category) => report.consolidated_scores?.[category.key] != null);
  const chunks = [categories.slice(0, 5), categories.slice(5, 10)];

  chunks.forEach((chunk, pageIndex) => {
    pdf.addPage();
    drawHeader(pdf, pageIndex === 0 ? "Domain Assessment Matrix" : "Domain Assessment Matrix Continued", code, student, report);

    let y = 33;
    setText(pdf, COLORS.ink);
    pdf.setFont("Montserrat", "bold");
    pdf.setFontSize(13);
    pdf.text(pageIndex === 0 ? "10-Star Development Rubric" : "Detailed Development Rubric", ML, y);
    setText(pdf, COLORS.slate);
    pdf.setFont("Montserrat", "normal");
    pdf.setFontSize(7.2);
    pdf.text("Each domain combines teacher observation, activity evidence, learning behavior, and monthly consistency.", ML, y + 8);
    y += 20;

    chunk.forEach((category) => {
      drawDomainCard(pdf, ML, y, CW, category, report);
      y += 48;
    });

    setFill(pdf, [255, 251, 235]);
    pdf.roundedRect(ML, PH - 39, CW, 18, 3, 3, "F");
    setText(pdf, COLORS.amber);
    pdf.setFont("Montserrat", "bold");
    pdf.setFontSize(7.5);
    pdf.text("Interpretation note", ML + 5, PH - 31);
    setText(pdf, COLORS.slate);
    pdf.setFont("Montserrat", "normal");
    pdf.setFontSize(6.5);
    pdf.text(
      split(
        pdf,
        "A 10-star score is not only accuracy. It includes independence, transfer to new tasks, emotional readiness, and consistency across sessions.",
        CW - 10
      ),
      ML + 5,
      PH - 25
    );
  });
};

const drawEvidence = (
  pdf: JsPDFDoc,
  student: Student,
  report: MonthlyReport,
  code: string,
  entries: DailyEntry[],
  activityPhotos: (string | null)[]
) => {
  pdf.addPage();
  drawHeader(pdf, "Daily Learning Evidence", code, student, report);

  let y = 32;
  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(13);
  pdf.text("Daily Evidence Portfolio", ML, y);
  y += 8;
  setText(pdf, COLORS.slate);
  pdf.setFont("Montserrat", "normal");
  pdf.setFontSize(7.2);
  pdf.text("Selected session evidence with activity photos, teacher observation, mood, and next learning cue.", ML, y);
  y += 12;

  const ordered = [...entries].sort(
    (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );

  if (!ordered.length) {
    setText(pdf, COLORS.slate);
    pdf.text("No daily entries are attached to this report yet.", ML, y);
    return;
  }

  ordered.slice(0, 6).forEach((entry, index) => {
    const photo = activityPhotos[index] || null;
    const cardH = 47;
    if (y + cardH > PH - 24) {
      pdf.addPage();
      drawHeader(pdf, "Daily Learning Evidence Continued", code, student, report);
      y = 32;
    }

    setFill(pdf, COLORS.panel);
    pdf.roundedRect(ML, y, CW, cardH, 4, 4, "F");
    setStroke(pdf, COLORS.line);
    pdf.roundedRect(ML, y, CW, cardH, 4, 4, "S");
    drawPhoto(pdf, photo, ML + 5, y + 6, 42, 29, String(entry.meeting_number));

    const x = ML + 53;
    setText(pdf, COLORS.ink);
    pdf.setFont("Montserrat", "bold");
    pdf.setFontSize(8.6);
    pdf.text(`#${entry.meeting_number} ${cleanText(entry.session_title)}`, x, y + 9);

    setText(pdf, COLORS.muted);
    pdf.setFont("Montserrat", "normal");
    pdf.setFontSize(6.5);
    pdf.text(`${safeDate(entry.entry_date)} | Mood: ${toTitle(entry.mood.replace("_", " "))} | Score: ${score10(entry.overall_stars || 0)}/10`, x, y + 16);

    setText(pdf, COLORS.slate);
    pdf.setFontSize(6.7);
    pdf.text(split(pdf, entry.activities_description || entry.teacher_notes, 123).slice(0, 3), x, y + 24);
    drawTenStars(pdf, x, y + 40, score10(entry.overall_stars || 0), 1.25);
    y += cardH + 6;
  });
};

const drawHomePlan = (pdf: JsPDFDoc, student: Student, report: MonthlyReport, code: string) => {
  pdf.addPage();
  drawHeader(pdf, "Home Support Plan and Sign-off", code, student, report);

  let y = 35;
  setText(pdf, COLORS.ink);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(13);
  pdf.text("30-Day Parent Support Plan", ML, y);
  y += 12;

  const plans = [
    {
      title: "Daily 10-minute learning ritual",
      body: "Read a picture book, ask one open-ended question, and let the child retell with drawings or objects.",
      color: COLORS.sky,
    },
    {
      title: "Weekly numeracy play",
      body: "Sort, count, compare, and make patterns using toys, cutlery, snacks, or household items.",
      color: COLORS.emerald,
    },
    {
      title: "Independence checklist",
      body: "Use prepare-do-check-tidy-share. Praise the process, not only the correct answer.",
      color: COLORS.indigo,
    },
    {
      title: "SEL reflection",
      body: "Ask: What felt easy? What felt tricky? What strategy helped you keep trying?",
      color: COLORS.rose,
    },
  ];

  plans.forEach((plan) => {
    setFill(pdf, COLORS.panel);
    pdf.roundedRect(ML, y, CW, 24, 4, 4, "F");
    setFill(pdf, plan.color);
    pdf.roundedRect(ML, y, 3, 24, 1.5, 1.5, "F");
    setText(pdf, plan.color);
    pdf.setFont("Montserrat", "bold");
    pdf.setFontSize(8.4);
    pdf.text(plan.title, ML + 8, y + 8);
    setText(pdf, COLORS.slate);
    pdf.setFont("Montserrat", "normal");
    pdf.setFontSize(7);
    pdf.text(split(pdf, plan.body, CW - 16), ML + 8, y + 16);
    y += 31;
  });

  y += 8;
  setFill(pdf, [240, 249, 255]);
  pdf.roundedRect(ML, y, CW, 28, 4, 4, "F");
  setText(pdf, COLORS.sky);
  pdf.setFont("Montserrat", "bold");
  pdf.setFontSize(10);
  pdf.text("Every child learns at their own rhythm.", PW / 2, y + 11, { align: "center" });
  pdf.text("A strong report should guide the next step, not just record the past.", PW / 2, y + 20, {
    align: "center",
  });

  y += 45;
  const sigW = (CW - 10) / 2;
  [
    { x: ML, title: "Prepared by", role: "Learning Facilitator", name: "MSA Education" },
    { x: ML + sigW + 10, title: "Acknowledged by", role: "Parent / Guardian", name: student.full_name },
  ].forEach((item) => {
    setFill(pdf, COLORS.paper);
    pdf.roundedRect(item.x, y, sigW, 45, 4, 4, "F");
    setStroke(pdf, COLORS.line);
    pdf.roundedRect(item.x, y, sigW, 45, 4, 4, "S");
    setText(pdf, COLORS.slate);
    pdf.setFont("Montserrat", "normal");
    pdf.setFontSize(7.5);
    pdf.text(item.title, item.x + sigW / 2, y + 10, { align: "center" });
    setStroke(pdf, [203, 213, 225]);
    pdf.line(item.x + 16, y + 25, item.x + sigW - 16, y + 25);
    pdf.text(item.role, item.x + sigW / 2, y + 35, { align: "center" });
    pdf.setFont("Montserrat", "bold");
    pdf.text(cleanText(item.name), item.x + sigW / 2, y + 41, { align: "center" });
  });
};

export default function PDFDownloadButton({ report, student, entries, reportNumber }: Props) {
  const [state, setState] = useState<GenState>("idle");

  const generatePDF = async () => {
    setState("generating");
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      await registerMontserrat(pdf);
      const code = reportCode(student, report, reportNumber);
      const activityUrls = entries.flatMap((entry) => entry.photo_urls || []).slice(0, 12);
      const [logoData, studentPhoto, ...activityPhotos] = await Promise.all([
        imageToDataUrl("/images/logo-full.png"),
        imageToDataUrl(student.photo_url),
        ...activityUrls.map((url) => imageToDataUrl(url)),
      ]);
      activeLogoData = logoData;

      drawCover(pdf, student, report, code, studentPhoto);
      drawNarrative(pdf, student, report, code);
      drawAssessmentPages(pdf, student, report, code);
      drawEvidence(pdf, student, report, code, entries, activityPhotos);
      drawHomePlan(pdf, student, report, code);
      drawFooter(pdf, code);

      const safeName = cleanText(student.full_name).replace(/\s+/g, "_");
      const safePeriod = cleanText(report.period_label).replace(/\s+/g, "_");
      pdf.save(`MSA_Report_${safeName}_${safePeriod}_${code.replace(/\//g, "-")}.pdf`);

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
        Download Premium PDF Report
      </>
    ),
    generating: (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Creating A4 portfolio...
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
          A4 print-ready, 10-star rubric, report code, bilingual summary, evidence photos.
        </p>
      )}
    </div>
  );
}
