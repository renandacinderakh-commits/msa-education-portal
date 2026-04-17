"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Student, DailyEntry, MonthlyReport } from "@/lib/supabase/types";
import { SCORE_CATEGORIES } from "@/lib/supabase/types";
import {
  FileText,
  ChevronDown,
  Plus,
  Calendar,
  Star,
  TrendingUp,
  Download,
  Eye,
  Check,
  Loader2,
  Wand2,
} from "lucide-react";
import dynamic from "next/dynamic";

// Lazily load PDF download button (client-only)
const PDFDownloadButton = dynamic(() => import("@/components/portal/PDFDownloadButton"), { ssr: false });

export default function TeacherReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [existingReport, setExistingReport] = useState<MonthlyReport | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savedReport, setSavedReport] = useState<MonthlyReport | null>(null);
  const [allReports, setAllReports] = useState<MonthlyReport[]>([]);
  const [summaryId, setSummaryId] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [achievementsId, setAchievementsId] = useState("");
  const [achievementsEn, setAchievementsEn] = useState("");
  const [recommendationsId, setRecommendationsId] = useState("");
  const [recommendationsEn, setRecommendationsEn] = useState("");
  const [goalsId, setGoalsId] = useState("");
  const [goalsEn, setGoalsEn] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const MONTHS = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];
  const YEARS = [2025, 2026, 2027];

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: studs } = await supabase
        .from("students").select("*").eq("teacher_id", user.id).eq("is_active", true).order("full_name");
      if (studs) { setStudents(studs as Student[]); if (studs.length > 0) setSelectedStudent(studs[0].id); }
      const { data: reps } = await supabase
        .from("monthly_reports").select("*, student:students(full_name,nickname,grade_level)")
        .eq("teacher_id", user.id).order("year", { ascending: false }).order("month", { ascending: false });
      if (reps) setAllReports(reps as unknown as MonthlyReport[]);
      setLoading(false);
    };
    load();
  }, [supabase]);

  // Load entries when student/month/year changes
  useEffect(() => {
    if (!selectedStudent) return;
    const load = async () => {
      const startOfMonth = `${selectedYear}-${String(selectedMonth).padStart(2,"0")}-01`;
      const endOfMonth = `${selectedYear}-${String(selectedMonth).padStart(2,"0")}-31`;
      const { data } = await supabase
        .from("daily_entries").select("*")
        .eq("student_id", selectedStudent)
        .gte("entry_date", startOfMonth).lte("entry_date", endOfMonth)
        .order("entry_date");
      if (data) setEntries(data as DailyEntry[]);

      const { data: rep } = await supabase
        .from("monthly_reports").select("*")
        .eq("student_id", selectedStudent).eq("month", selectedMonth).eq("year", selectedYear).maybeSingle();
      if (rep) { setExistingReport(rep as MonthlyReport); setSavedReport(rep as MonthlyReport); }
      else { setExistingReport(null); setSavedReport(null); }
    };
    load();
  }, [selectedStudent, selectedMonth, selectedYear, supabase]);

  // Calculate consolidated scores
  const consolidatedScores = SCORE_CATEGORIES.reduce((acc, cat) => {
    const vals = entries.map(e => (e.scores as any)?.[cat.key]).filter(Boolean) as number[];
    if (vals.length > 0) acc[cat.key] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    return acc;
  }, {} as Record<string, number>);

  const avgOverallStars = entries.length > 0
    ? Math.round(entries.reduce((a, e) => a + e.overall_stars, 0) / entries.length * 10) / 10
    : 0;

  const handleTranslate = async (sourceText: string, setTarget: (val: string) => void) => {
    if (!sourceText.trim()) return;
    try {
      setTarget("Translating...");
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=id|en`);
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        setTarget(data.responseData.translatedText);
      } else {
        setTarget("Translation error or limit reached.");
      }
    } catch (error) {
      setTarget("Network error during translation.");
    }
  };

  const handleGenerate = async () => {
    if (!selectedStudent || entries.length === 0) return;
    setGenerating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const student = students.find(s => s.id === selectedStudent);
    const periodLabel = `${MONTHS[selectedMonth - 1]} ${selectedYear}`;

    const payload = {
      student_id: selectedStudent,
      teacher_id: user.id,
      month: selectedMonth,
      year: selectedYear,
      period_label: periodLabel,
      consolidated_scores: consolidatedScores,
      total_meetings: entries.length,
      attendance_rate: 100,
      summary: summaryId,
      summary_en: summaryEn,
      achievements: achievementsId,
      achievements_en: achievementsEn,
      recommendations: recommendationsId,
      recommendations_en: recommendationsEn,
      goals_next_month: goalsId,
      goals_next_month_en: goalsEn,
      is_published: false,
    };

    const { data, error } = existingReport
      ? await supabase.from("monthly_reports").update(payload).eq("id", existingReport.id).select().single()
      : await supabase.from("monthly_reports").insert(payload).select().single();

    if (!error && data) { setSavedReport(data as MonthlyReport); setExistingReport(data as MonthlyReport); }
    setGenerating(false);
  };

  const handlePublish = async () => {
    if (!savedReport) return;
    setPublishing(true);
    await supabase.from("monthly_reports").update({ is_published: !savedReport.is_published }).eq("id", savedReport.id);
    setSavedReport(prev => prev ? { ...prev, is_published: !prev.is_published } : prev);
    setPublishing(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );

  const student = students.find(s => s.id === selectedStudent);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📊 Laporan Bulanan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Generate dan publish laporan perkembangan murid</p>
      </div>

      {/* Selector Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-500" />
          Pilih Periode
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Murid</label>
            <div className="relative">
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white appearance-none outline-none focus:ring-2 focus:ring-sky-400">
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bulan</label>
            <div className="relative">
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white appearance-none outline-none focus:ring-2 focus:ring-sky-400">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tahun</label>
            <div className="relative">
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white appearance-none outline-none focus:ring-2 focus:ring-sky-400">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Period Summary */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <FileText className="w-4 h-4 text-sky-500" />
            <span><strong className="text-slate-800 dark:text-white">{entries.length}</strong> pertemuan tercatat</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Rata-rata <strong className="text-slate-800 dark:text-white">{avgOverallStars || "—"}</strong> bintang</span>
          </div>
          {existingReport && (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${existingReport.is_published ? "text-emerald-600" : "text-amber-600"}`}>
              {existingReport.is_published ? <Check className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {existingReport.is_published ? "Sudah dipublish" : "Draft"}
            </div>
          )}
        </div>
      </motion.div>

      {entries.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Tidak Ada Entri</h3>
          <p className="text-sm text-slate-400">Belum ada entri harian untuk periode ini.</p>
        </div>
      ) : (
        <>
          {/* Consolidated Scores */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Rata-rata Penilaian (Auto-Generated)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {SCORE_CATEGORIES.map(cat => {
                const val = consolidatedScores[cat.key] || 0;
                return (
                  <div key={cat.key} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                    <p className="text-2xl mb-1">{cat.icon}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 leading-tight">{cat.label_id}</p>
                    <div className="flex justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.round(val) ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"}`} />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{val > 0 ? val.toFixed(1) : "—"}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Report Text Fields */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <h2 className="font-semibold text-slate-800 dark:text-white">📝 Narasi Laporan (Bilingual)</h2>

            {[
              { label: "Ringkasan Bulan Ini", labelEn: "Monthly Summary", valId: summaryId, setId: setSummaryId, valEn: summaryEn, setEn: setSummaryEn },
              { label: "Pencapaian", labelEn: "Achievements", valId: achievementsId, setId: setAchievementsId, valEn: achievementsEn, setEn: setAchievementsEn },
              { label: "Rekomendasi untuk Orang Tua", labelEn: "Recommendations for Parents", valId: recommendationsId, setId: setRecommendationsId, valEn: recommendationsEn, setEn: setRecommendationsEn },
              { label: "Target Bulan Depan", labelEn: "Goals Next Month", valId: goalsId, setId: setGoalsId, valEn: goalsEn, setEn: setGoalsEn },
            ].map(field => (
              <div key={field.label} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">🇮🇩 {field.label}</label>
                  <textarea value={field.valId} onChange={e => field.setId(e.target.value)} rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">🇬🇧 {field.labelEn}</label>
                    <button
                      type="button"
                      onClick={() => handleTranslate(field.valId, field.setEn)}
                      className="flex items-center gap-1 text-[10px] font-bold text-sky-500 hover:text-sky-600 transition-colors"
                    >
                      <Wand2 className="w-3 h-3" /> Auto-Translate
                    </button>
                  </div>
                  <textarea value={field.valEn} onChange={e => field.setEn(e.target.value)} rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none" />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 pb-8">
            <button onClick={handleGenerate} disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50">
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {existingReport ? "Update Laporan" : "Generate Laporan"}
            </button>

            {savedReport && (
              <>
                <button onClick={handlePublish} disabled={publishing}
                  className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 ${
                    savedReport.is_published
                      ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-2 border-amber-200"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}>
                  {publishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                  {savedReport.is_published ? "Sembunyikan dari Orang Tua" : "Publish ke Orang Tua"}
                </button>

                <PDFDownloadButton report={savedReport} student={student!} entries={entries} />
              </>
            )}
          </motion.div>
        </>
      )}

      {/* All Reports History */}
      {allReports.length > 0 && (
        <div className="space-y-3 pb-8">
          <h2 className="font-semibold text-slate-800 dark:text-white">📚 Riwayat Laporan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allReports.map(rep => (
              <div key={rep.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{rep.period_label}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${rep.is_published ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"}`}>
                    {rep.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{(rep.student as any)?.full_name} • {rep.total_meetings} pertemuan</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
