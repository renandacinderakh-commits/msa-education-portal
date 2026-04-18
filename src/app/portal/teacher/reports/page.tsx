"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Student, DailyEntry } from "@/lib/supabase/types";
import { SCORE_CATEGORIES } from "@/lib/supabase/types";
import {
  FileText,
  Plus,
  X,
  Send,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  Languages,
  BookOpen,
  TrendingUp,
  Star,
  Globe,
} from "lucide-react";

async function translateID2EN(text: string): Promise<string> {
  if (!text.trim()) return "";
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`
    );
    const data = await res.json();
    return data.responseData?.translatedText || text;
  } catch {
    return text;
  }
}

const MONTHS_ID = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

interface ReportForm {
  student_id: string;
  month: number;
  year: number;
  period_label: string;
  summary: string;
  summary_en: string;
  highlights: string;
  highlights_en: string;
  achievements: string;
  achievements_en: string;
  areas_to_improve: string;
  areas_to_improve_en: string;
  goals_next_month: string;
  goals_next_month_en: string;
  recommendations: string;
  recommendations_en: string;
  is_published: boolean;
}

const now = new Date();
const EMPTY_REPORT: ReportForm = {
  student_id: "",
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  period_label: `${MONTHS_ID[now.getMonth()]} ${now.getFullYear()}`,
  summary: "",
  summary_en: "",
  highlights: "",
  highlights_en: "",
  achievements: "",
  achievements_en: "",
  areas_to_improve: "",
  areas_to_improve_en: "",
  goals_next_month: "",
  goals_next_month_en: "",
  recommendations: "",
  recommendations_en: "",
  is_published: false,
};

export default function TeacherReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ReportForm>(EMPTY_REPORT);
  const [formState, setFormState] = useState<"idle"|"submitting"|"success"|"error">("idle");
  const [formError, setFormError] = useState("");
  const [translating, setTranslating] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [filterStudent, setFilterStudent] = useState("all");

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) { setPageLoading(false); return; }
      setTeacherId(user.id);

      const [{ data: studs }, { data: ents }] = await Promise.all([
        supabase.from("students").select("*").eq("teacher_id", user.id).eq("is_active", true).order("full_name"),
        supabase.from("daily_entries").select("*").eq("teacher_id", user.id).order("entry_date", { ascending: false }),
      ]);

      if (mounted) {
        setStudents(studs as Student[] || []);
        setEntries(ents as DailyEntry[] || []);
        if (studs && studs.length > 0) {
          setForm(f => ({ ...f, student_id: studs[0].id }));
        }
        setPageLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [supabase]);

  const loadReports = useCallback(async () => {
    if (!teacherId) return;
    let q = supabase
      .from("monthly_reports")
      .select("*, students(full_name, grade_level)")
      .eq("teacher_id", teacherId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (filterStudent !== "all") q = q.eq("student_id", filterStudent);
    const { data } = await q;
    setReports(data || []);
  }, [supabase, teacherId, filterStudent]);

  useEffect(() => {
    if (teacherId) loadReports();
  }, [teacherId, filterStudent, loadReports]);

  // Auto-calculate consolidated scores from entries
  const getConsolidatedScores = useCallback(() => {
    const monthEntries = entries.filter(e => {
      const d = new Date(e.entry_date);
      return e.student_id === form.student_id &&
        d.getMonth() + 1 === form.month &&
        d.getFullYear() === form.year;
    });

    if (!monthEntries.length) return {};
    const totals: Record<string, { sum: number; count: number }> = {};
    monthEntries.forEach(e => {
      Object.entries(e.scores || {}).forEach(([key, val]) => {
        if (!totals[key]) totals[key] = { sum: 0, count: 0 };
        totals[key].sum += (val as number) || 0;
        totals[key].count += 1;
      });
    });
    const avg: Record<string, number> = {};
    Object.entries(totals).forEach(([k, v]) => {
      avg[k] = Math.round((v.sum / v.count) * 10) / 10;
    });
    return avg;
  }, [entries, form.student_id, form.month, form.year]);

  const monthEntries = useMemo(() => entries.filter(e => {
    const d = new Date(e.entry_date);
    return e.student_id === form.student_id &&
      d.getMonth() + 1 === form.month &&
      d.getFullYear() === form.year;
  }), [entries, form.student_id, form.month, form.year]);

  const updateForm = <K extends keyof ReportForm>(key: K, value: ReportForm[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleMonthYearChange = (month: number, year: number) => {
    setForm(f => ({
      ...f, month, year,
      period_label: `${MONTHS_ID[month - 1]} ${year}`,
    }));
  };

  const handleAutoTranslate = async () => {
    setTranslating(true);
    const [summary_en, highlights_en, achievements_en, areas_to_improve_en, goals_next_month_en, recommendations_en] =
      await Promise.all([
        form.summary ? translateID2EN(form.summary) : Promise.resolve(""),
        form.highlights ? translateID2EN(form.highlights) : Promise.resolve(""),
        form.achievements ? translateID2EN(form.achievements) : Promise.resolve(""),
        form.areas_to_improve ? translateID2EN(form.areas_to_improve) : Promise.resolve(""),
        form.goals_next_month ? translateID2EN(form.goals_next_month) : Promise.resolve(""),
        form.recommendations ? translateID2EN(form.recommendations) : Promise.resolve(""),
      ]);
    setForm(f => ({ ...f, summary_en, highlights_en, achievements_en, areas_to_improve_en, goals_next_month_en, recommendations_en }));
    setTranslating(false);
  };

  const handleGenerateSummary = () => {
    if (!form.student_id) {
      setFormError("Pilih murid terlebih dahulu");
      return;
    }

    const student = students.find((item) => item.id === form.student_id);
    const topics = Array.from(
      new Set(
        monthEntries
          .map((entry) => entry.topics_taught || entry.session_title)
          .filter(Boolean)
      )
    ).slice(0, 5);
    const avgStars = monthEntries.length
      ? monthEntries.reduce((sum, entry) => sum + (entry.overall_stars || 0), 0) / monthEntries.length
      : 0;
    const scoreSummary = Object.entries(getConsolidatedScores())
      .map(([key, value]) => {
        const category = SCORE_CATEGORIES.find((item) => item.key === key);
        return `${category?.label_id ?? key}: ${value}/5`;
      })
      .slice(0, 6)
      .join(", ");

    const name = student?.full_name ?? "Murid";
    const topicText = topics.length ? topics.join(", ") : "materi inti bulan ini";
    const scoreText = scoreSummary || "nilai perkembangan akan semakin lengkap setelah entri harian ditambahkan";

    setForm((current) => ({
      ...current,
      summary: `${name} mengikuti ${monthEntries.length} sesi pada ${current.period_label}. Fokus belajar mencakup ${topicText}. Secara umum progress terlihat stabil dengan rata-rata ${avgStars.toFixed(1)}/5, terutama saat kegiatan dimulai dari contoh konkret, latihan terpandu, lalu refleksi singkat.`,
      summary_en: `${name} attended ${monthEntries.length} sessions in ${current.period_label}. Learning focus included ${topicText}. Overall progress is steady with an average of ${avgStars.toFixed(1)}/5, especially when activities start with concrete examples, guided practice, and short reflection.`,
      achievements: `Indikator kuat bulan ini: ${scoreText}. ${name} menunjukkan partisipasi yang baik dan mulai lebih konsisten mengikuti alur belajar.`,
      achievements_en: `Strong indicators this month: ${scoreText}. ${name} showed positive participation and is becoming more consistent in following the learning flow.`,
      areas_to_improve: `Area yang perlu dijaga: konsistensi latihan, transisi antar aktivitas, dan penguatan konsep yang masih baru. Jika terlihat lelah, gunakan jeda pendek sebelum lanjut ke tugas berikutnya.`,
      areas_to_improve_en: `Areas to maintain: practice consistency, transitions between activities, and reinforcement of newer concepts. When fatigue appears, use a short pause before moving to the next task.`,
      goals_next_month: `Target bulan berikutnya adalah memperkuat pemahaman lewat latihan singkat berulang, menambah keberanian menjelaskan proses berpikir, dan menjaga kemandirian saat menyelesaikan tugas.`,
      goals_next_month_en: `Next month goals are to strengthen understanding through short repeated practice, build confidence in explaining thinking, and maintain independence when completing tasks.`,
      recommendations: `Di rumah, lakukan review 10 menit dengan format ringan: tanya apa yang dipelajari, minta anak memberi contoh, lalu tutup dengan pujian spesifik. Keep it simple tapi konsisten.`,
      recommendations_en: `At home, do a light 10-minute review: ask what was learned, invite the child to give an example, then close with specific praise. Keep it simple but consistent.`,
    }));
    setFormError("");
  };

  const handleSubmit = async (publish: boolean) => {
    setFormError("");
    if (!form.student_id) { setFormError("Pilih murid terlebih dahulu"); return; }
    if (!form.summary.trim()) { setFormError("Ringkasan wajib diisi"); return; }

    setFormState("submitting");
    try {
      const consolidated_scores = getConsolidatedScores();
      const recommendations = [form.recommendations, form.areas_to_improve && `Area support: ${form.areas_to_improve}`]
        .filter(Boolean)
        .join("\n\n");
      const recommendations_en = [form.recommendations_en, form.areas_to_improve_en && `Support area: ${form.areas_to_improve_en}`]
        .filter(Boolean)
        .join("\n\n");

      const { error } = await supabase.from("monthly_reports").insert({
        student_id: form.student_id,
        teacher_id: teacherId,
        month: form.month,
        year: form.year,
        period_label: form.period_label,
        consolidated_scores,
        summary: form.summary,
        summary_en: form.summary_en,
        achievements: form.achievements,
        achievements_en: form.achievements_en,
        goals_next_month: form.goals_next_month,
        goals_next_month_en: form.goals_next_month_en,
        recommendations,
        recommendations_en,
        total_meetings: monthEntries.length,
        attendance_rate: 100,
        is_published: publish,
      });

      if (error) throw error;
      setFormState("success");
      setTimeout(() => {
        setFormState("idle");
        setShowForm(false);
        setForm({ ...EMPTY_REPORT, student_id: form.student_id });
        loadReports();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan");
      setFormState("error");
      setTimeout(() => setFormState("idle"), 3000);
    }
  };

  const handlePublish = async (reportId: string, currentlyPublished: boolean) => {
    await supabase.from("monthly_reports").update({ is_published: !currentlyPublished }).eq("id", reportId);
    loadReports();
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const textAreaClass = "w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none resize-none";
  const enAreaClass = "w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-300 outline-none resize-none mt-1";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            Laporan Bulanan 📊
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Buat dan kelola laporan perkembangan belajar
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(""); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-sky-600 hover:to-teal-600 transition-all active:scale-95 shadow-md shadow-sky-200"
        >
          <Plus className="w-4 h-4" />
          Buat Laporan
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="min-h-full flex items-start justify-center p-4 pt-8">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                        📊 Buat Laporan Bulanan Baru
                      </h2>
                      <p className="text-sm text-slate-400 mt-0.5">
                        Laporan ini akan bisa diakses dan diunduh oleh orang tua
                      </p>
                    </div>
                    <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Student + Period */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Murid *</label>
                        <select value={form.student_id} onChange={e => updateForm("student_id", e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none">
                          {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Bulan *</label>
                        <select value={form.month} onChange={e => handleMonthYearChange(parseInt(e.target.value), form.year)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none">
                          {MONTHS_ID.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Tahun *</label>
                        <input type="number" value={form.year} onChange={e => handleMonthYearChange(form.month, parseInt(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none" />
                      </div>
                    </div>

                    {/* Session stats */}
                    {monthEntries.length > 0 && (
                      <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-2xl border border-sky-100 dark:border-sky-800">
                        <p className="text-sm font-semibold text-sky-700 dark:text-sky-300 mb-1">
                          📈 Data Sesi Bulan Ini Terdeteksi
                        </p>
                        <p className="text-xs text-sky-600 dark:text-sky-400">
                          {monthEntries.length} sesi belajar · Nilai rata-rata akan dihitung otomatis
                        </p>
                      </div>
                    )}

                    {/* Narrative fields */}
                    {[
                      { key: "summary", label: "📋 Ringkasan Perkembangan Belajar *", placeholder: "Deskripsikan secara umum perkembangan belajar murid selama bulan ini...", rows: 4 },
                      { key: "achievements", label: "🏆 Pencapaian & Prestasi", placeholder: "Pencapaian luar biasa, progress yang signifikan, hal yang membanggakan...", rows: 3 },
                      { key: "areas_to_improve", label: "💪 Area yang Perlu Dikembangkan", placeholder: "Topik atau skill yang masih perlu latihan lebih lanjut...", rows: 3 },
                      { key: "goals_next_month", label: "🎯 Target Bulan Berikutnya", placeholder: "Target dan tujuan belajar untuk bulan depan...", rows: 3 },
                      { key: "recommendations", label: "💡 Rekomendasi untuk Orang Tua", placeholder: "Aktivitas di rumah, hal yang perlu diperhatikan, cara mendukung belajar anak...", rows: 3 },
                    ].map(({ key, label, placeholder, rows }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          {label}
                        </label>
                        <textarea rows={rows} placeholder={placeholder}
                          value={(form as any)[key]}
                          onChange={e => updateForm(key as keyof ReportForm, e.target.value)}
                          className={textAreaClass}
                        />
                        {(form as any)[key + "_en"] !== undefined && (form as any)[key + "_en"] && (
                          <textarea rows={2}
                            value={(form as any)[key + "_en"]}
                            onChange={e => updateForm((key + "_en") as keyof ReportForm, e.target.value)}
                            placeholder="🇬🇧 English translation..."
                            className={enAreaClass}
                          />
                        )}
                      </div>
                    ))}

                    {/* Auto generate + translate */}
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                          <Globe className="w-4 h-4" /> Generate summary & terjemahan
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={handleGenerateSummary}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Generate dari entri
                          </button>
                          <button type="button" onClick={handleAutoTranslate} disabled={translating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                            {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                            {translating ? "Menerjemahkan..." : "Terjemah Semua"}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-indigo-500 mt-1">
                        Summary otomatis mengambil topik, jumlah sesi, dan rata-rata score dari daily entries periode ini.
                      </p>
                    </div>

                    {/* Error */}
                    {formError && (
                      <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setShowForm(false)}
                        className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Batal
                      </button>
                      <button type="button" onClick={() => handleSubmit(false)}
                        disabled={formState === "submitting" || formState === "success"}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
                        <Eye className="w-4 h-4" /> Simpan Draft
                      </button>
                      <button type="button" onClick={() => handleSubmit(true)}
                        disabled={formState === "submitting" || formState === "success"}
                        className={`flex-[2] inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-95 ${
                          formState === "success" ? "bg-emerald-500 text-white"
                          : formState === "submitting" ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-sky-500 to-teal-500 text-white hover:from-sky-600 hover:to-teal-600"
                        }`}>
                        {formState === "submitting" && <Loader2 className="w-4 h-4 animate-spin" />}
                        {formState === "success" && <CheckCircle className="w-4 h-4" />}
                        {(formState === "idle" || formState === "error") && <Send className="w-4 h-4" />}
                        {formState === "submitting" ? "Menyimpan..." : formState === "success" ? "Berhasil! ✓" : "Simpan & Publish"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div className="flex gap-3 items-center">
        <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)}
          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none">
          <option value="all">Semua Murid</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
        <p className="text-sm text-slate-500">{reports.length} laporan</p>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-slate-500">Belum ada laporan. Klik "Buat Laporan" untuk mulai.</p>
          </div>
        ) : (
          reports.map((report, i) => {
            const allScores = Object.values(report.consolidated_scores || {});
            const avg = allScores.length
              ? allScores.reduce((a: number, b: unknown) => a + ((b as number) || 0), 0) / allScores.length
              : 0;

            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 dark:text-white">{report.period_label}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        report.is_published
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {report.is_published ? "✓ Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {report.students?.full_name} · {report.total_meetings} pertemuan
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={`w-3.5 h-3.5 ${si < Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"}`} />
                      ))}
                    </div>
                    <button
                      onClick={() => handlePublish(report.id, report.is_published)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        report.is_published
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                      }`}
                    >
                      {report.is_published ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                </div>
                {report.summary && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">{report.summary}</p>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
