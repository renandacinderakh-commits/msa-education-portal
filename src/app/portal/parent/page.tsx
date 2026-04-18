"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Student, DailyEntry, MonthlyReport } from "@/lib/supabase/types";
import { SCORE_CATEGORIES } from "@/lib/supabase/types";
import dynamic from "next/dynamic";
import {
  BookOpen,
  Star,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  Smile,
  Meh,
  HeartHandshake,
  TrendingUp,
  FileText,
  Trophy,
  Target,
  MessageCircle,
  Sparkles,
} from "lucide-react";

// ✅ FIX: Dynamic import with proper loading fallback
const PDFDownloadButton = dynamic(
  () => import("@/components/portal/PDFDownloadButton"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
    ),
  }
);

const MoodIcon = ({ mood }: { mood: string }) => {
  if (mood === "happy")
    return (
      <span title="Senang & Bersemangat">
        <Smile className="w-5 h-5 text-emerald-500" />
      </span>
    );
  if (mood === "neutral")
    return (
      <span title="Cukup Baik">
        <Meh className="w-5 h-5 text-amber-500" />
      </span>
    );
  return (
    <span title="Perlu Dukungan">
      <HeartHandshake className="w-5 h-5 text-rose-500" />
    </span>
  );
};

const MoodLabel = ({ mood }: { mood: string }) => {
  const map: Record<string, { label: string; color: string }> = {
    happy: { label: "Senang & Bersemangat 🌟", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" },
    neutral: { label: "Cukup Baik 😊", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" },
    needs_support: { label: "Perlu Dukungan 💙", color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400" },
  };
  const m = map[mood] || map.neutral;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${m.color}`}>
      {m.label}
    </span>
  );
};

export default function ParentDashboard() {
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  // ✅ FIX: Separate state for PDF ready — was conflicting with entry expand
  const [pdfReadyId, setPdfReadyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"journal" | "reports" | "progress">("journal");

  // ✅ FIX: Memoize supabase client
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;
    const loadChildren = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", user.id)
        .eq("is_active", true)
        .order("full_name");

      if (mounted) {
        if (data && data.length > 0) {
          setChildren(data as Student[]);
          setSelectedChild(data[0].id);
        }
        setLoading(false);
      }
    };
    loadChildren();
    return () => { mounted = false; };
  }, [supabase]);

  // ✅ FIX: Proper cleanup and loading state for entries
  useEffect(() => {
    if (!selectedChild) return;
    let mounted = true;
    setEntriesLoading(true);

    const loadData = async () => {
      const [{ data: entryData }, { data: reportData }] = await Promise.all([
        supabase
          .from("daily_entries")
          .select("*")
          .eq("student_id", selectedChild)
          .order("entry_date", { ascending: false })
          .limit(200),
        supabase
          .from("monthly_reports")
          .select("*")
          .eq("student_id", selectedChild)
          .eq("is_published", true)
          .order("year", { ascending: false })
          .order("month", { ascending: false }),
      ]);

      if (mounted) {
        if (entryData) setEntries(entryData as DailyEntry[]);
        if (reportData) setReports(reportData as MonthlyReport[]);
        setEntriesLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [selectedChild, supabase]);

  const child = useMemo(
    () => children.find((c) => c.id === selectedChild),
    [children, selectedChild]
  );

  const handleChildChange = useCallback((id: string) => {
    setSelectedChild(id);
    setExpandedEntry(null);
    setPdfReadyId(null);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    if (!entries.length) return { avgStars: 0, happyCount: 0, totalEntries: entries.length };
    const avgStars =
      entries.reduce((a, e) => a + (e.overall_stars || 0), 0) / entries.length;
    const happyCount = entries.filter((e) => e.mood === "happy").length;
    return { avgStars, happyCount, totalEntries: entries.length };
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 mx-auto bg-sky-50 dark:bg-sky-900/20 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-10 h-10 text-sky-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Belum Ada Data Anak
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Hubungi admin MSA Education untuk menghubungkan akun Anda dengan data
          anak.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header + Child Selector ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            Portal Orang Tua 📚
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Pantau perkembangan belajar anak Anda secara real-time
          </p>
        </div>
        {children.length > 1 && (
          <select
            value={selectedChild}
            onChange={(e) => handleChildChange(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none"
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Child Profile Card ──────────────────────────────────── */}
      {child && (
        <motion.div
          key={child.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white/30 shrink-0 overflow-hidden relative">
              {child.photo_url ? (
                <Image
                  src={child.photo_url}
                  alt={`Foto ${child.full_name}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                child.nickname?.charAt(0) || child.full_name.charAt(0)
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{child.full_name}</h2>
              <p className="text-sky-100 text-sm">
                {child.nickname && `${child.nickname} • `}
                {child.grade_level}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-sky-100">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {stats.totalEntries} sesi belajar
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {reports.length} laporan
                </span>
                <span className="flex items-center gap-1">
                  <Smile className="w-4 h-4" />
                  {stats.happyCount} kali semangat
                </span>
              </div>
            </div>
            {/* Average score badge */}
            <div className="flex flex-col items-center bg-white/20 rounded-2xl px-5 py-3 border border-white/30">
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(stats.avgStars)
                        ? "fill-amber-300 text-amber-300"
                        : "text-white/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-sky-100">Rata-rata</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {(
          [
            { key: "journal", label: "📓 Jurnal Harian", icon: Calendar },
            { key: "reports", label: "📊 Laporan Bulanan", icon: TrendingUp },
            { key: "progress", label: "🏆 Progress", icon: Trophy },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Journal ────────────────────────────────────────── */}
      {activeTab === "journal" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              Catatan Sesi Belajar
            </h2>
            {entriesLoading && (
              <div className="w-5 h-5 border-2 border-sky-300 border-t-sky-500 rounded-full animate-spin" />
            )}
          </div>

          {entriesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada catatan sesi belajar</p>
              <p className="text-xs mt-1">Catatan akan muncul setelah guru mengisi entri harian</p>
            </div>
          ) : (
            entries.map((entry, i) => {
              const isExpanded = expandedEntry === entry.id;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  {/* Entry Header */}
                  <button
                    onClick={() =>
                      setExpandedEntry(isExpanded ? null : entry.id)
                    }
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                          #{entry.meeting_number}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-white text-sm truncate">
                          {entry.session_title || "Sesi Belajar"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(entry.entry_date).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <MoodIcon mood={entry.mood} />
                      <div className="hidden sm:flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, ii) => (
                          <Star
                            key={ii}
                            className={`w-3.5 h-3.5 ${
                              ii < entry.overall_stars
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <div className="p-4 sm:p-5 space-y-4">
                          {/* Mood badge */}
                          <MoodLabel mood={entry.mood} />

                          {/* Topics */}
                          {entry.topics_taught && (
                            <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800">
                              <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1 flex items-center gap-1">
                                <Target className="w-3.5 h-3.5" /> Materi yang Dipelajari
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {entry.topics_taught}
                              </p>
                              {entry.topics_taught_en && (
                                <p className="text-xs text-slate-400 mt-1 italic">
                                  🇬🇧 {entry.topics_taught_en}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Activities */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                                🇮🇩 Deskripsi Aktivitas
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {entry.activities_description}
                              </p>
                            </div>
                            {entry.activities_description_en && (
                              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                                  🇬🇧 Activity Description
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                  {entry.activities_description_en}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Photos */}
                          {entry.photo_urls && entry.photo_urls.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2">
                                📸 Dokumentasi
                              </p>
                              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {entry.photo_urls.map((url, pi) => (
                                  <div
                                    key={pi}
                                    className="aspect-square rounded-xl overflow-hidden relative"
                                  >
                                    <Image
                                      src={url}
                                      alt={`Foto ${pi + 1}`}
                                      fill
                                      className="object-cover"
                                      sizes="120px"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Scores */}
                          {entry.scores &&
                            Object.keys(entry.scores).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-amber-400" />
                                  Penilaian Per Kategori
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {Object.entries(entry.scores).map(
                                    ([key, val]) => {
                                      const cat = SCORE_CATEGORIES.find(
                                        (c) => c.key === key
                                      );
                                      if (!cat || !val) return null;
                                      const score = val as number;
                                      return (
                                        <div
                                          key={key}
                                          className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                                        >
                                          <div className="flex items-center gap-1.5 mb-2">
                                            <span className="text-base">
                                              {cat.icon}
                                            </span>
                                            <p className="text-xs text-slate-500 truncate">
                                              {cat.label_id}
                                            </p>
                                          </div>
                                          <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }).map(
                                              (_, si) => (
                                                <Star
                                                  key={si}
                                                  className={`w-3 h-3 ${
                                                    si < score
                                                      ? "fill-amber-400 text-amber-400"
                                                      : "text-slate-200 dark:text-slate-700"
                                                  }`}
                                                />
                                              )
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Notes & Suggestions */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {entry.teacher_notes && (
                              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                                  <MessageCircle className="w-3.5 h-3.5" /> Catatan Guru
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {entry.teacher_notes}
                                </p>
                                {entry.teacher_notes_en && (
                                  <p className="text-xs text-slate-400 mt-2 italic border-t border-emerald-100 dark:border-emerald-800 pt-2">
                                    🇬🇧 {entry.teacher_notes_en}
                                  </p>
                                )}
                              </div>
                            )}
                            {entry.suggestions && (
                              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" /> Saran untuk Orang Tua
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {entry.suggestions}
                                </p>
                                {entry.suggestions_en && (
                                  <p className="text-xs text-slate-400 mt-2 italic border-t border-amber-100 dark:border-amber-800 pt-2">
                                    🇬🇧 {entry.suggestions_en}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Next Topics */}
                          {entry.next_topics && (
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                                🎯 Rencana Pertemuan Berikutnya
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {entry.next_topics}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ── Tab: Reports ────────────────────────────────────────── */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Laporan Perkembangan Bulanan
          </h2>

          {reports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada laporan yang dipublish</p>
              <p className="text-xs mt-1">Laporan akan tersedia setelah guru membuat dan mempublish laporan bulanan</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => {
                const avg =
                  Object.values(report.consolidated_scores || {}).reduce(
                    (a: number, b: unknown) => a + ((b as number) || 0),
                    0
                  ) /
                  Math.max(
                    Object.values(report.consolidated_scores || {}).length,
                    1
                  );
                const isPdfReady = pdfReadyId === report.id;
                const reportEntries = entries.filter((e) => {
                  const d = new Date(e.entry_date);
                  return (
                    d.getMonth() + 1 === report.month &&
                    d.getFullYear() === report.year
                  );
                });

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                  >
                    {/* Report Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                            {report.period_label}
                          </h3>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {report.total_meetings} pertemuan
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-4 h-4 text-amber-500" />
                              Kehadiran {report.attendance_rate || 100}%
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(avg)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200 dark:text-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-400">
                            Rata-rata {avg.toFixed(1)}/5
                          </p>
                        </div>
                      </div>

                      {/* Summary */}
                      {report.summary && (
                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <p className="text-xs font-semibold text-slate-500 mb-1">📋 Ringkasan</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {report.summary}
                          </p>
                        </div>
                      )}

                      {/* Achievements */}
                      {report.achievements && (
                        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                            🏆 Pencapaian Bulan Ini
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {report.achievements}
                          </p>
                        </div>
                      )}

                      {/* Goals next month */}
                      {report.goals_next_month && (
                        <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                            🎯 Target Bulan Berikutnya
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {report.goals_next_month}
                          </p>
                        </div>
                      )}

                      {/* Recommendations */}
                      {report.recommendations && (
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                            💡 Rekomendasi untuk Orang Tua
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {report.recommendations}
                          </p>
                        </div>
                      )}

                      {/* ✅ FIX: PDF button with separate state — no longer conflicts with entry expand */}
                      <div className="mt-4">
                        {isPdfReady ? (
                          <PDFDownloadButton
                            report={report}
                            student={child!}
                            entries={reportEntries}
                          />
                        ) : (
                          <button
                            onClick={() => setPdfReadyId(report.id)}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-sky-600 hover:to-teal-600 transition-all active:scale-95"
                          >
                            <Download className="w-4 h-4" />
                            Download Laporan PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Progress ───────────────────────────────────────── */}
      {activeTab === "progress" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Grafik Perkembangan
          </h2>

          {entries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada data progress</p>
            </div>
          ) : (
            <>
              {/* Score trend */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <p className="font-medium text-slate-800 dark:text-white mb-4 text-sm">
                  📈 Tren Nilai per Sesi (10 Terakhir)
                </p>
                <div className="flex items-end gap-1.5 h-24">
                  {entries
                    .slice(0, 10)
                    .reverse()
                    .map((e, i) => {
                      const h = Math.max(
                        ((e.overall_stars || 0) / 5) * 100,
                        8
                      );
                      return (
                        <div
                          key={e.id}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-sky-500 to-sky-400 transition-all"
                            style={{ height: `${h}%` }}
                            title={`Sesi #${e.meeting_number}: ${e.overall_stars}/5`}
                          />
                          <span className="text-[9px] text-slate-400">
                            #{e.meeting_number}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Score by category */}
              {entries.some(
                (e) => e.scores && Object.keys(e.scores).length > 0
              ) && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <p className="font-medium text-slate-800 dark:text-white mb-4 text-sm">
                    🎯 Rata-rata Per Kategori
                  </p>
                  <div className="space-y-3">
                    {SCORE_CATEGORIES.map((cat) => {
                      const vals = entries
                        .map((e) => e.scores?.[cat.key] as number)
                        .filter(Boolean);
                      if (!vals.length) return null;
                      const avg =
                        vals.reduce((a, b) => a + b, 0) / vals.length;
                      return (
                        <div key={cat.key} className="flex items-center gap-3">
                          <span className="text-lg w-7 text-center">
                            {cat.icon}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                {cat.label_id}
                              </p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {avg.toFixed(1)}/5
                              </p>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(avg / 5) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="h-full bg-gradient-to-r from-sky-400 to-teal-400 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
