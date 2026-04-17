"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
} from "lucide-react";

const PDFDownloadButton = dynamic(() => import("@/components/portal/PDFDownloadButton"), { ssr: false });

const MoodIcon = ({ mood }: { mood: string }) => {
  if (mood === "happy") return <Smile className="w-5 h-5 text-emerald-500" />;
  if (mood === "neutral") return <Meh className="w-5 h-5 text-amber-500" />;
  return <HeartHandshake className="w-5 h-5 text-rose-500" />;
};

export default function ParentDashboard() {
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadChildren = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", user.id)
        .eq("is_active", true);

      if (data && data.length > 0) {
        setChildren(data as Student[]);
        setSelectedChild(data[0].id);
      }
      setLoading(false);
    };
    loadChildren();
  }, [supabase]);

  // Load entries when child changes
  useEffect(() => {
    if (!selectedChild) return;
    const loadEntries = async () => {
      const { data: entryData } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("student_id", selectedChild)
        .order("entry_date", { ascending: false })
        .limit(200);
      if (entryData) setEntries(entryData as DailyEntry[]);

      const { data: reportData } = await supabase
        .from("monthly_reports")
        .select("*")
        .eq("student_id", selectedChild)
        .eq("is_published", true)
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      if (reportData) setReports(reportData as MonthlyReport[]);
    };
    loadEntries();
  }, [selectedChild, supabase]);

  const child = children.find((c) => c.id === selectedChild);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Belum Ada Data Anak
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Hubungi admin MSA Education untuk menghubungkan akun Anda dengan data anak.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header + Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            Jurnal Belajar 📚
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Pantau perkembangan belajar anak Anda
          </p>
        </div>
        {children.length > 1 && (
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white"
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Child Profile Card */}
      {child && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white/30">
              {child.nickname?.charAt(0) || child.full_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{child.full_name}</h2>
              <p className="text-sky-100 text-sm">
                {child.nickname} • {child.grade_level}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-sky-100">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {entries.length} entri
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {reports.length} laporan
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entries Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-500" />
            Catatan Harian
          </h2>

          {entries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada catatan harian</p>
            </div>
          ) : (
            entries.map((entry, i) => {
              const isExpanded = expandedEntry === entry.id;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  {/* Entry Header */}
                  <button
                    onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                        <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
                          #{entry.meeting_number}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white text-sm">
                          {entry.session_title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(entry.entry_date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MoodIcon mood={entry.mood} />
                      <div className="flex items-center gap-0.5">
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
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-slate-100 dark:border-slate-800 p-5 space-y-4"
                    >
                      {/* Activities */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <p className="text-xs font-semibold text-slate-500 mb-1">🇮🇩 Aktivitas</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                            {entry.activities_description}
                          </p>
                        </div>
                        {entry.activities_description_en && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="text-xs font-semibold text-slate-500 mb-1">🇬🇧 Activities</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                              {entry.activities_description_en}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Photos */}
                      {entry.photo_urls && entry.photo_urls.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {entry.photo_urls.map((url, pi) => (
                            <div key={pi} className="aspect-square rounded-xl overflow-hidden relative">
                              <Image src={url} alt={`Photo ${pi + 1}`} fill className="object-cover" sizes="120px" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Scores */}
                      {entry.scores && Object.keys(entry.scores).length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(entry.scores).map(([key, val]) => {
                            const cat = SCORE_CATEGORIES.find((c) => c.key === key);
                            if (!cat || !val) return null;
                            return (
                              <div key={key} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center gap-2">
                                <span>{cat.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-slate-500 truncate">{cat.label_id}</p>
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, si) => (
                                      <Star
                                        key={si}
                                        className={`w-3 h-3 ${
                                          si < (val as number)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-slate-200 dark:text-slate-700"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Notes */}
                      {(entry.teacher_notes || entry.suggestions) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {entry.teacher_notes && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">📝 Catatan Guru</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{entry.teacher_notes}</p>
                            </div>
                          )}
                          {entry.suggestions && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">💡 Saran untuk Orang Tua</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{entry.suggestions}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Reports Sidebar */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Laporan Bulanan
          </h2>

          {reports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada laporan</p>
            </div>
          ) : (
            reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      {report.period_label}
                    </p>
                    <p className="text-xs text-slate-400">
                      {report.total_meetings} pertemuan
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avg = Object.values(report.consolidated_scores || {}).reduce(
                        (a: number, b: unknown) => a + (b as number || 0), 0
                      ) / Math.max(Object.values(report.consolidated_scores || {}).length, 1);
                      return (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(avg)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 dark:text-slate-700"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                
                {expandedEntry === `report-${report.id}` ? (
                  <PDFDownloadButton 
                    report={report} 
                    student={child!} 
                    entries={entries.filter(e => {
                      const d = new Date(e.entry_date);
                      return d.getMonth() + 1 === report.month && d.getFullYear() === report.year;
                    })}
                  />
                ) : (
                  <button 
                    onClick={() => setExpandedEntry(`report-${report.id}`)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-sky-600 hover:to-teal-600 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Siapkan PDF Report
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
