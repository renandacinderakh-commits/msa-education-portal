"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle, FileText } from "lucide-react";
import type { MonthlyReport, Student, DailyEntry } from "@/lib/supabase/types";
import { SCORE_CATEGORIES } from "@/lib/supabase/types";

interface Props {
  report: MonthlyReport;
  student: Student;
  entries: DailyEntry[];
}

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

type GenState = "idle" | "generating" | "done" | "error";

export default function PDFDownloadButton({ report, student, entries }: Props) {
  const [state, setState] = useState<GenState>("idle");

  const generatePDF = async () => {
    setState("generating");
    try {
      // ✅ Dynamic import — runs only on client, no SSR issues
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const PW = 210; // page width
      const PH = 297; // page height
      const ML = 14;  // margin left
      const MR = 14;  // margin right
      const CW = PW - ML - MR; // content width

      // ── Color helpers ──────────────────────────────────────────
      const setFill = (r: number, g: number, b: number) =>
        pdf.setFillColor(r, g, b);
      const setStroke = (r: number, g: number, b: number) =>
        pdf.setDrawColor(r, g, b);
      const setColor = (r: number, g: number, b: number) =>
        pdf.setTextColor(r, g, b);

      // Brand colors
      const SKY = [14, 165, 233] as const;
      const TEAL = [20, 184, 166] as const;
      const INDIGO = [99, 102, 241] as const;
      const SLATE_800 = [30, 41, 59] as const;
      const SLATE_600 = [71, 85, 105] as const;
      const SLATE_400 = [148, 163, 184] as const;
      const EMERALD = [16, 185, 129] as const;
      const AMBER = [245, 158, 11] as const;
      const ROSE = [244, 63, 94] as const;
      const WHITE = [255, 255, 255] as const;
      const SLATE_50 = [248, 250, 252] as const;
      const SLATE_100 = [241, 245, 249] as const;

      // ═══════════════════════════════════════════════════════════
      // PAGE 1 — COVER
      // ═══════════════════════════════════════════════════════════

      // --- Gradient header block ---
      setFill(...SKY);
      pdf.rect(0, 0, PW, 60, "F");

      // Diagonal accent
      setFill(...TEAL);
      pdf.triangle(PW - 60, 0, PW, 0, PW, 60, "F");

      // School logo circle
      setFill(255, 255, 255);
      pdf.circle(ML + 14, 28, 12, "F");
      setColor(...SKY);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("M", ML + 14, 32, { align: "center" });

      // School name
      setColor(...WHITE);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("MSA Education", ML + 32, 22);

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      setColor(186, 230, 253); // sky-200
      pdf.text("Mindful  •  Supportive  •  Adaptive", ML + 32, 29);
      pdf.text("Les Privat, Homeschooling & Pendampingan ABK", ML + 32, 35);
      pdf.text("Jakarta Utara  •  Jakarta Pusat  •  Jakarta Timur", ML + 32, 41);

      // Report type label
      setFill(255, 255, 255);
      pdf.roundedRect(ML, 47, 110, 9, 2, 2, "F");
      setColor(...SKY);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("LAPORAN PERKEMBANGAN BELAJAR BULANAN", ML + 55, 53, { align: "center" });

      // --- Student info card ---
      setFill(...SLATE_50);
      pdf.roundedRect(ML, 68, CW, 55, 4, 4, "F");
      setStroke(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(ML, 68, CW, 55, 4, 4, "S");

      // Avatar
      const gradient = ["from-sky-500", "to-teal-500"];
      setFill(...SKY);
      pdf.circle(ML + 18, 90, 14, "F");
      setColor(...WHITE);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      const initial = (student.nickname || student.full_name).charAt(0).toUpperCase();
      pdf.text(initial, ML + 18, 95, { align: "center" });

      // Student details
      setColor(...SLATE_800);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(student.full_name, ML + 38, 78);

      setColor(...SLATE_600);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Panggilan : ${student.nickname || "-"}`, ML + 38, 85);
      pdf.text(`Jenjang    : ${student.grade_level}`, ML + 38, 92);
      pdf.text(
        `Lahir        : ${
          student.date_of_birth
            ? new Date(student.date_of_birth).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "-"
        }`,
        ML + 38,
        99
      );

      // Period info
      setColor(...SLATE_600);
      pdf.text(`Periode      : ${report.period_label}`, ML + 38, 106);

      // Stats boxes
      const statsX = PW - MR - 60;

      setFill(...SKY);
      pdf.roundedRect(statsX, 70, 58, 22, 3, 3, "F");
      setColor(...WHITE);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(report.total_meetings || 0), statsX + 29, 83, { align: "center" });
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("Total Pertemuan", statsX + 29, 89, { align: "center" });

      setFill(...EMERALD);
      pdf.roundedRect(statsX, 95, 58, 22, 3, 3, "F");
      setColor(...WHITE);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${report.attendance_rate || 100}%`, statsX + 29, 108, { align: "center" });
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("Kehadiran", statsX + 29, 114, { align: "center" });

      // --- Score overview ---
      let yPos = 135;

      setColor(...SLATE_800);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Ringkasan Penilaian", ML, yPos);

      // Average star rating
      const allScores = Object.values(report.consolidated_scores || {});
      const avgScore =
        allScores.length > 0
          ? allScores.reduce((a: number, b: unknown) => a + ((b as number) || 0), 0) /
            allScores.length
          : 0;

      yPos += 8;
      setFill(...AMBER);
      pdf.roundedRect(ML, yPos, 60, 14, 3, 3, "F");
      setColor(...WHITE);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      const stars = "★".repeat(Math.round(avgScore)) + "☆".repeat(5 - Math.round(avgScore));
      pdf.text(`${stars}  ${avgScore.toFixed(1)}/5`, ML + 30, yPos + 9.5, { align: "center" });

      // Score bars per category
      yPos += 22;
      const cats = SCORE_CATEGORIES.filter(
        (c) => report.consolidated_scores?.[c.key] != null
      );

      if (cats.length > 0) {
        const colW = (CW - 4) / 2;
        cats.forEach((cat, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = ML + col * (colW + 4);
          const y = yPos + row * 18;

          const score = (report.consolidated_scores?.[cat.key] as number) || 0;
          const barW = colW - 35;
          const fillW = (score / 5) * barW;

          // Label
          setColor(...SLATE_600);
          pdf.setFontSize(7.5);
          pdf.setFont("helvetica", "normal");
          pdf.text(`${cat.icon} ${cat.label_id}`, x, y + 5);

          // Bar background
          setFill(...SLATE_100);
          pdf.roundedRect(x, y + 7, barW, 4, 1, 1, "F");

          // Bar fill
          setFill(...SKY);
          if (fillW > 0) {
            pdf.roundedRect(x, y + 7, fillW, 4, 1, 1, "F");
          }

          // Score value
          setColor(...SLATE_800);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.text(`${score}/5`, x + barW + 4, y + 10.5);
        });
        yPos += Math.ceil(cats.length / 2) * 18 + 8;
      }

      // ═══════════════════════════════════════════════════════════
      // PAGE 2 — NARRATIVE REPORT
      // ═══════════════════════════════════════════════════════════
      pdf.addPage();

      // Page header
      setFill(...SKY);
      pdf.rect(0, 0, PW, 18, "F");
      setColor(...WHITE);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("MSA Education — Laporan Perkembangan Belajar", ML, 11);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `${student.full_name}  |  ${report.period_label}`,
        PW - MR,
        11,
        { align: "right" }
      );

      let y2 = 28;

      // ── Summary section ─────────────────────────────────────
      const sections: {
        title: string;
        emoji: string;
        contentID: string | null | undefined;
        contentEN: string | null | undefined;
        color: readonly [number, number, number];
        bgFill: [number, number, number];
      }[] = [
        {
          title: "Ringkasan Perkembangan Belajar",
          emoji: "📋",
          contentID: report.summary,
          contentEN: report.summary_en,
          color: SKY,
          bgFill: [239, 246, 255] as [number, number, number],
        },
        {
          title: "Pencapaian & Prestasi",
          emoji: "🏆",
          contentID: report.achievements,
          contentEN: report.achievements_en,
          color: EMERALD,
          bgFill: [240, 253, 244] as [number, number, number],
        },
        {
          title: "Target & Tujuan Bulan Berikutnya",
          emoji: "🎯",
          contentID: report.goals_next_month,
          contentEN: report.goals_next_month_en,
          color: INDIGO,
          bgFill: [238, 242, 255] as [number, number, number],
        },
        {
          title: "Rekomendasi untuk Orang Tua",
          emoji: "💡",
          contentID: report.recommendations,
          contentEN: report.recommendations_en,
          color: ROSE,
          bgFill: [255, 241, 242] as [number, number, number],
        },
      ];

      for (const section of sections) {
        if (!section.contentID) continue;

        // Check space remaining, add new page if needed
        if (y2 > PH - 40) {
          pdf.addPage();
          setFill(...SKY);
          pdf.rect(0, 0, PW, 18, "F");
          setColor(...WHITE);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.text("MSA Education — Laporan Perkembangan Belajar", ML, 11);
          pdf.text(`${student.full_name}  |  ${report.period_label}`, PW - MR, 11, { align: "right" });
          y2 = 28;
        }

        // Section title
        setFill(...section.color);
        pdf.circle(ML + 3, y2 + 3.5, 3.5, "F");
        setColor(...section.color);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${section.emoji}  ${section.title}`, ML + 9, y2 + 5.5);
        y2 += 12;

        // ID content
        setFill(...section.bgFill);
        const idLines = pdf.splitTextToSize(section.contentID, CW - 10) as string[];
        const idH = idLines.length * 5.5 + 8;
        pdf.roundedRect(ML, y2, CW, idH, 2, 2, "F");
        setColor(...SLATE_800);
        pdf.setFontSize(8.5);
        pdf.setFont("helvetica", "normal");
        pdf.text(idLines, ML + 5, y2 + 6);
        y2 += idH + 4;

        // EN content if available
        if (section.contentEN) {
          setFill(...SLATE_50);
          const enLines = pdf.splitTextToSize(
            `🇬🇧  ${section.contentEN}`,
            CW - 10
          ) as string[];
          const enH = enLines.length * 5 + 8;
          pdf.roundedRect(ML, y2, CW, enH, 2, 2, "F");
          setColor(...SLATE_400);
          pdf.setFontSize(7.5);
          pdf.setFont("helvetica", "italic");
          pdf.text(enLines, ML + 5, y2 + 5.5);
          y2 += enH + 4;
        }

        y2 += 6;
      }

      // ═══════════════════════════════════════════════════════════
      // PAGE 3 — SESSION LOG
      // ═══════════════════════════════════════════════════════════
      if (entries.length > 0) {
        pdf.addPage();
        setFill(...SKY);
        pdf.rect(0, 0, PW, 18, "F");
        setColor(...WHITE);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("MSA Education — Catatan Sesi Belajar", ML, 11);
        pdf.text(`${student.full_name}  |  ${report.period_label}`, PW - MR, 11, { align: "right" });

        let y3 = 26;

        setColor(...SLATE_800);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("📓 Log Sesi Belajar Bulanan", ML, y3);
        y3 += 8;

        // Table header
        setFill(...SKY);
        pdf.rect(ML, y3, CW, 8, "F");
        setColor(...WHITE);
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "bold");
        const cols = {
          no: ML + 3,
          date: ML + 14,
          title: ML + 45,
          mood: ML + 110,
          stars: ML + 128,
        };
        pdf.text("#", cols.no, y3 + 5.5);
        pdf.text("Tanggal", cols.date, y3 + 5.5);
        pdf.text("Topik Sesi", cols.title, y3 + 5.5);
        pdf.text("Mood", cols.mood, y3 + 5.5);
        pdf.text("Nilai", cols.stars, y3 + 5.5);
        y3 += 8;

        entries.forEach((entry, i) => {
          if (y3 > PH - 25) {
            pdf.addPage();
            setFill(...SKY);
            pdf.rect(0, 0, PW, 18, "F");
            setColor(...WHITE);
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.text("MSA Education — Catatan Sesi Belajar", ML, 11);
            pdf.text(`${student.full_name}  |  ${report.period_label}`, PW - MR, 11, { align: "right" });
            y3 = 26;

            // Re-draw table header
            setFill(...SKY);
            pdf.rect(ML, y3, CW, 8, "F");
            setColor(...WHITE);
            pdf.setFontSize(7.5);
            pdf.setFont("helvetica", "bold");
            pdf.text("#", cols.no, y3 + 5.5);
            pdf.text("Tanggal", cols.date, y3 + 5.5);
            pdf.text("Topik Sesi", cols.title, y3 + 5.5);
            pdf.text("Mood", cols.mood, y3 + 5.5);
            pdf.text("Nilai", cols.stars, y3 + 5.5);
            y3 += 8;
          }

          // Alternating rows
          if (i % 2 === 0) {
            setFill(...SLATE_50);
            pdf.rect(ML, y3, CW, 7, "F");
          }

          const dateStr = new Date(entry.entry_date).toLocaleDateString(
            "id-ID",
            { day: "2-digit", month: "short", year: "2-digit" }
          );
          const moodLabel =
            entry.mood === "happy"
              ? "😊 Semangat"
              : entry.mood === "neutral"
              ? "😐 Baik"
              : "💙 Support";
          const starsStr =
            "★".repeat(entry.overall_stars || 0) +
            "☆".repeat(5 - (entry.overall_stars || 0));

          setColor(...SLATE_600);
          pdf.setFontSize(7.5);
          pdf.setFont("helvetica", "normal");
          pdf.text(String(entry.meeting_number), cols.no, y3 + 4.8);
          pdf.text(dateStr, cols.date, y3 + 4.8);
          pdf.text(
            pdf.splitTextToSize(entry.session_title || "Sesi Belajar", 60)[0] as string,
            cols.title,
            y3 + 4.8
          );
          pdf.text(moodLabel, cols.mood, y3 + 4.8);
          setColor(...AMBER);
          pdf.setFontSize(7);
          pdf.text(starsStr, cols.stars, y3 + 4.8);

          y3 += 7;
        });
      }

      // ═══════════════════════════════════════════════════════════
      // LAST PAGE — Signature & Footer
      // ═══════════════════════════════════════════════════════════
      pdf.addPage();
      setFill(...SKY);
      pdf.rect(0, 0, PW, 18, "F");
      setColor(...WHITE);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("MSA Education — Halaman Penutup", ML, 11);
      pdf.text(`${student.full_name}  |  ${report.period_label}`, PW - MR, 11, { align: "right" });

      let yLast = 34;

      // Motivational quote box
      setFill(239, 246, 255); // blue-50
      pdf.roundedRect(ML, yLast, CW, 22, 3, 3, "F");
      setStroke(...SKY);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(ML, yLast, CW, 22, 3, 3, "S");
      setColor(...SKY);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bolditalic");
      pdf.text(
        '"Setiap anak memiliki ritme belajarnya sendiri.',
        PW / 2,
        yLast + 9,
        { align: "center" }
      );
      pdf.text(
        "Tugas kita bukan memaksa mereka berlari,",
        PW / 2,
        yLast + 15,
        { align: "center" }
      );
      pdf.text('melainkan menemani mereka melangkah."', PW / 2, yLast + 21, {
        align: "center",
      });
      yLast += 30;
      setColor(...SLATE_400);
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "normal");
      pdf.text("— Miss Sita, Pendiri MSA Education", PW / 2, yLast, { align: "center" });
      yLast += 16;

      // Signature section
      const sigW = (CW - 8) / 2;

      setFill(...SLATE_50);
      pdf.roundedRect(ML, yLast, sigW, 40, 3, 3, "F");
      setStroke(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(ML, yLast, sigW, 40, 3, 3, "S");

      setColor(...SLATE_600);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("Disiapkan oleh:", ML + sigW / 2, yLast + 8, { align: "center" });
      setFill(200, 215, 230);
      pdf.rect(ML + 15, yLast + 15, sigW - 30, 0.5, "F");
      pdf.text("Guru Pendamping", ML + sigW / 2, yLast + 32, { align: "center" });
      pdf.setFontSize(7.5);
      pdf.text("MSA Education", ML + sigW / 2, yLast + 38, { align: "center" });

      const sig2X = ML + sigW + 8;
      setFill(...SLATE_50);
      pdf.roundedRect(sig2X, yLast, sigW, 40, 3, 3, "F");
      pdf.roundedRect(sig2X, yLast, sigW, 40, 3, 3, "S");

      pdf.setFontSize(8);
      pdf.text("Diketahui oleh:", sig2X + sigW / 2, yLast + 8, { align: "center" });
      setFill(200, 215, 230);
      pdf.rect(sig2X + 15, yLast + 15, sigW - 30, 0.5, "F");
      setColor(...SLATE_600);
      pdf.text("Orang Tua / Wali", sig2X + sigW / 2, yLast + 32, { align: "center" });
      pdf.setFontSize(7.5);
      pdf.text(student.full_name, sig2X + sigW / 2, yLast + 38, { align: "center" });

      yLast += 56;

      // Footer bar
      setFill(...SKY);
      pdf.rect(0, PH - 14, PW, 14, "F");
      setColor(...WHITE);
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "normal");
      pdf.text("MSA Education  •  Mindful. Supportive. Adaptive.", ML, PH - 6);
      pdf.text(
        `Digenerate pada: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
        PW - MR,
        PH - 6,
        { align: "right" }
      );

      // Add footer to all previous pages
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        setFill(...SKY);
        pdf.rect(0, PH - 12, PW, 12, "F");
        setColor(...WHITE);
        pdf.setFontSize(7);
        pdf.text("MSA Education  •  Mindful. Supportive. Adaptive.", ML, PH - 4.5);
        pdf.text(`Halaman ${p} / ${totalPages}`, PW - MR, PH - 4.5, { align: "right" });
      }

      // ── Save ────────────────────────────────────────────────
      const safeName = student.full_name.replace(/\s+/g, "_");
      const safePeriod = report.period_label.replace(/\s+/g, "_");
      pdf.save(`MSA_Laporan_${safeName}_${safePeriod}.pdf`);

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
        <Download className="w-4 h-4" />
        Download Laporan PDF
      </>
    ),
    generating: (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Membuat PDF... Harap tunggu
      </>
    ),
    done: (
      <>
        <CheckCircle className="w-4 h-4" />
        PDF Berhasil! ✓
      </>
    ),
    error: (
      <>
        <FileText className="w-4 h-4" />
        Gagal — Coba Lagi
      </>
    ),
  };

  return (
    <div className="space-y-2">
      <button
        onClick={generatePDF}
        disabled={state === "generating"}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${buttonClass[state]}`}
      >
        {buttonContent[state]}
      </button>
      {state === "idle" && (
        <p className="text-[10px] text-slate-400 text-center">
          Format PDF profesional • 4 halaman lengkap • Bisa langsung dicetak
        </p>
      )}
    </div>
  );
}
