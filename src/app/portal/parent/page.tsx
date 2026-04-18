"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { DailyEntry, MonthlyReport, Student } from "@/lib/supabase/types";
import { SCORE_CATEGORIES } from "@/lib/supabase/types";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  HeartHandshake,
  Meh,
  MessageCircle,
  Smile,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

const PDFDownloadButton = dynamic(() => import("@/components/portal/PDFDownloadButton"), {
  ssr: false,
  loading: () => <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />,
});

type TabKey = "overview" | "journal" | "reports" | "progress";

const tabFromPath = (pathname: string): TabKey => {
  if (pathname.endsWith("/journal")) return "journal";
  if (pathname.endsWith("/reports")) return "reports";
  return "overview";
};

const safeDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const MoodIcon = ({ mood }: { mood: string }) => {
  if (mood === "happy") return <Smile className="h-5 w-5 text-emerald-500" />;
  if (mood === "neutral") return <Meh className="h-5 w-5 text-amber-500" />;
  return <HeartHandshake className="h-5 w-5 text-rose-500" />;
};

const scoreAverage = (entries: DailyEntry[]) => {
  if (!entries.length) return 0;
  return entries.reduce((sum, entry) => sum + (entry.overall_stars || 0), 0) / entries.length;
};

const getEntryScorePoints = (entries: DailyEntry[]) =>
  entries
    .slice(0, 10)
    .reverse()
    .map((entry, index) => ({
      x: 18 + index * (154 / Math.max(entries.slice(0, 10).length - 1, 1)),
      y: 82 - ((entry.overall_stars || 0) / 5) * 60,
      entry,
    }));

export default function ParentDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [pdfReadyId, setPdfReadyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(tabFromPath(pathname));
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);

  useEffect(() => {
    setActiveTab(tabFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    const loadChildren = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", user.id)
        .eq("is_active", true)
        .order("full_name");

      if (!mounted) return;
      const list = (data || []) as Student[];
      setChildren(list);
      if (list[0]) setSelectedChild(list[0].id);
      setLoading(false);
    };

    loadChildren();
    return () => {
      mounted = false;
    };
  }, [supabase]);

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

      if (!mounted) return;
      setEntries((entryData || []) as DailyEntry[]);
      setReports((reportData || []) as MonthlyReport[]);
      setEntriesLoading(false);
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [selectedChild, supabase]);

  const child = useMemo(() => children.find((item) => item.id === selectedChild), [children, selectedChild]);

  const handleChildChange = useCallback((id: string) => {
    setSelectedChild(id);
    setExpandedEntry(null);
    setPdfReadyId(null);
  }, []);

  const stats = useMemo(() => {
    const avgStars = scoreAverage(entries);
    const happyCount = entries.filter((entry) => entry.mood === "happy").length;
    return { avgStars, happyCount, totalEntries: entries.length };
  }, [entries]);

  const progressPoints = useMemo(() => getEntryScorePoints(entries), [entries]);
  const progressPath = progressPoints.map((point) => `${point.x},${point.y}`).join(" ");

  const categoryAverages = useMemo(
    () =>
      SCORE_CATEGORIES.map((category) => {
        const values = entries
          .map((entry) => entry.scores?.[category.key] as number | undefined)
          .filter((value): value is number => typeof value === "number");
        return {
          category,
          avg: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0,
        };
      }).filter((item) => item.avg > 0),
    [entries]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sky-200 border-t-sky-500" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sky-50">
          <BookOpen className="h-10 w-10 text-sky-300" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-800">Belum Ada Data Anak</h2>
        <p className="text-slate-500">Hubungi admin MSA Education untuk menghubungkan akun Anda dengan data anak.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Portal Orang Tua</h1>
          <p className="mt-1 text-slate-500">Pantau learning story, report, dan progress anak secara real-time.</p>
        </div>
        {children.length > 1 && (
          <select
            value={selectedChild}
            onChange={(event) => handleChildChange(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-sky-300"
          >
            {children.map((item) => (
              <option key={item.id} value={item.id}>
                {item.full_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {child && (
        <motion.div
          key={child.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 p-5 text-white shadow-xl"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 bg-white/20">
              {child.photo_url ? (
                <Image src={child.photo_url} alt={`Foto ${child.full_name}`} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold">
                  {child.full_name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold">{child.full_name}</h2>
              <p className="text-sm text-sky-100">
                {child.nickname || child.full_name} | {child.grade_level}
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-sky-50">
                <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" />{stats.totalEntries} sesi belajar</span>
                <span className="inline-flex items-center gap-1"><FileText className="h-4 w-4" />{reports.length} laporan</span>
                <span className="inline-flex items-center gap-1"><Smile className="h-4 w-4" />{stats.happyCount} mood positif</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/20 px-5 py-3 text-center">
              <div className="mb-1 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${index < Math.round(stats.avgStars) ? "fill-amber-300 text-amber-300" : "text-white/30"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-sky-100">Rata-rata</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 md:grid-cols-4">
        {[
          { key: "overview" as const, label: "Dashboard", icon: BarChart3 },
          { key: "journal" as const, label: "Jurnal Anak", icon: Calendar },
          { key: "reports" as const, label: "Laporan", icon: FileText },
          { key: "progress" as const, label: "Progress", icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && child && (
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <BarChart3 className="h-5 w-5 text-sky-500" />
              Ringkasan Anak
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Sesi belajar", value: stats.totalEntries, color: "bg-sky-50 text-sky-700" },
                { label: "Report publish", value: reports.length, color: "bg-emerald-50 text-emerald-700" },
                { label: "Mood positif", value: stats.happyCount, color: "bg-amber-50 text-amber-700" },
                { label: "Avg score", value: `${stats.avgStars.toFixed(1)}/5`, color: "bg-indigo-50 text-indigo-700" },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next parent action</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Review jurnal terbaru, ulangi satu aktivitas pendek di rumah, lalu beri apresiasi spesifik pada proses belajar anak.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              Latest Learning Story
            </h2>
            {entries[0] ? (
              <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
                <div className="relative h-40 overflow-hidden rounded-xl bg-slate-100">
                  {entries[0].photo_urls?.[0] ? (
                    <Image src={entries[0].photo_urls[0]} alt="Foto aktivitas belajar" fill className="object-cover" sizes="150px" />
                  ) : child.photo_url ? (
                    <Image src={child.photo_url} alt={`Foto ${child.full_name}`} fill className="object-cover" sizes="150px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-sky-500">
                      {child.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">{safeDate(entries[0].entry_date)}</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{entries[0].session_title}</h3>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600">{entries[0].activities_description}</p>
                  <button
                    onClick={() => setActiveTab("journal")}
                    className="mt-4 rounded-lg bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
                  >
                    Buka Jurnal
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Belum ada jurnal terbaru dari guru.</p>
            )}
          </section>
        </div>
      )}

      {activeTab === "journal" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Calendar className="h-5 w-5 text-sky-500" />
              Catatan Sesi Belajar
            </h2>
            {entriesLoading && <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-300 border-t-sky-500" />}
          </div>

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">
              <BookOpen className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Belum ada catatan sesi belajar</p>
            </div>
          ) : (
            entries.map((entry, index) => {
              const expanded = expandedEntry === entry.id;
              return (
                <motion.section
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.25) }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    onClick={() => setExpandedEntry(expanded ? null : entry.id)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-bold text-sky-600">
                        #{entry.meeting_number}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{entry.session_title}</p>
                        <p className="text-xs text-slate-400">{safeDate(entry.entry_date)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <MoodIcon mood={entry.mood} />
                      <div className="hidden gap-0.5 sm:flex">
                        {Array.from({ length: 5 }).map((_, star) => (
                          <Star key={star} className={`h-3.5 w-3.5 ${star < entry.overall_stars ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                      {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100"
                      >
                        <div className="space-y-4 p-4 sm:p-5">
                          {entry.photo_urls?.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {entry.photo_urls.slice(0, 4).map((url, photoIndex) => (
                                <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                                  <Image src={url} alt={`Foto aktivitas ${photoIndex + 1}`} fill className="object-cover" sizes="160px" />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="grid gap-3 lg:grid-cols-2">
                            <div className="rounded-xl bg-slate-50 p-4">
                              <p className="mb-2 flex items-center gap-1 text-xs font-bold text-slate-500">
                                <BookOpen className="h-3.5 w-3.5" /> Aktivitas
                              </p>
                              <p className="text-sm leading-relaxed text-slate-700">{entry.activities_description}</p>
                            </div>
                            <div className="rounded-xl bg-sky-50 p-4">
                              <p className="mb-2 flex items-center gap-1 text-xs font-bold text-sky-600">
                                <Target className="h-3.5 w-3.5" /> Materi & next topic
                              </p>
                              <p className="text-sm leading-relaxed text-slate-700">{entry.topics_taught || "-"}</p>
                              {entry.next_topics && <p className="mt-2 text-xs font-medium text-sky-700">Next: {entry.next_topics}</p>}
                            </div>
                          </div>

                          <div className="grid gap-3 lg:grid-cols-2">
                            {entry.teacher_notes && (
                              <div className="rounded-xl bg-emerald-50 p-4">
                                <p className="mb-2 flex items-center gap-1 text-xs font-bold text-emerald-700">
                                  <MessageCircle className="h-3.5 w-3.5" /> Catatan Guru
                                </p>
                                <p className="text-sm leading-relaxed text-slate-700">{entry.teacher_notes}</p>
                              </div>
                            )}
                            {entry.suggestions && (
                              <div className="rounded-xl bg-amber-50 p-4">
                                <p className="mb-2 flex items-center gap-1 text-xs font-bold text-amber-700">
                                  <Sparkles className="h-3.5 w-3.5" /> Saran Orang Tua
                                </p>
                                <p className="text-sm leading-relaxed text-slate-700">{entry.suggestions}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.section>
              );
            })
          )}
        </div>
      )}

      {activeTab === "reports" && child && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <FileText className="h-5 w-5 text-emerald-500" />
            Laporan Perkembangan Bulanan
          </h2>

          {reports.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">
              <FileText className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Belum ada laporan yang dipublish</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report, index) => {
                const avg =
                  Object.values(report.consolidated_scores || {}).reduce((sum: number, value: unknown) => sum + ((value as number) || 0), 0) /
                  Math.max(Object.values(report.consolidated_scores || {}).length, 1);
                const reportEntries = entries.filter((entry) => {
                  const date = new Date(entry.entry_date);
                  return date.getMonth() + 1 === report.month && date.getFullYear() === report.year;
                });

                return (
                  <section key={report.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{report.period_label}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {report.total_meetings} pertemuan | Kehadiran {report.attendance_rate || 100}%
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, star) => (
                          <Star key={star} className={`h-4 w-4 ${star < Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {report.summary && (
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="mb-1 text-xs font-bold text-slate-500">Ringkasan</p>
                          <p className="text-sm leading-relaxed text-slate-700">{report.summary}</p>
                        </div>
                      )}
                      {report.achievements && (
                        <div className="rounded-xl bg-emerald-50 p-4">
                          <p className="mb-1 text-xs font-bold text-emerald-700">Pencapaian</p>
                          <p className="text-sm leading-relaxed text-slate-700">{report.achievements}</p>
                        </div>
                      )}
                      {report.goals_next_month && (
                        <div className="rounded-xl bg-indigo-50 p-4">
                          <p className="mb-1 text-xs font-bold text-indigo-700">Target Bulan Berikutnya</p>
                          <p className="text-sm leading-relaxed text-slate-700">{report.goals_next_month}</p>
                        </div>
                      )}
                      {report.recommendations && (
                        <div className="rounded-xl bg-amber-50 p-4">
                          <p className="mb-1 text-xs font-bold text-amber-700">Rekomendasi Parent</p>
                          <p className="text-sm leading-relaxed text-slate-700">{report.recommendations}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      {pdfReadyId === report.id ? (
                        <PDFDownloadButton report={report} student={child} entries={reportEntries} reportNumber={reports.length - index} />
                      ) : (
                        <button
                          onClick={() => setPdfReadyId(report.id)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-sky-600 hover:to-teal-600"
                        >
                          <Download className="h-4 w-4" />
                          Download Laporan PDF
                        </button>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "progress" && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Trophy className="h-5 w-5 text-amber-500" />
            Grafik Perkembangan
          </h2>

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">
              <TrendingUp className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Belum ada data progress</p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm font-bold text-slate-900">Tren Nilai per Sesi (10 terakhir)</p>
                <div className="rounded-xl bg-slate-50 p-4">
                  <svg viewBox="0 0 190 100" className="h-56 w-full overflow-visible" role="img" aria-label="Grafik perkembangan nilai">
                    {[1, 2, 3, 4, 5].map((tick) => (
                      <g key={tick}>
                        <line x1="18" x2="176" y1={82 - (tick / 5) * 60} y2={82 - (tick / 5) * 60} stroke="#e2e8f0" strokeWidth="0.8" />
                        <text x="4" y={85 - (tick / 5) * 60} fontSize="5" fill="#64748b">
                          {tick}
                        </text>
                      </g>
                    ))}
                    <polyline points={progressPath} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {progressPoints.map((point) => (
                      <g key={point.entry.id}>
                        <circle cx={point.x} cy={point.y} r="4" fill="#14b8a6" stroke="white" strokeWidth="2" />
                        <text x={point.x} y="95" textAnchor="middle" fontSize="5.5" fill="#64748b">
                          #{point.entry.meeting_number}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm font-bold text-slate-900">Rata-rata Per Domain</p>
                <div className="space-y-3">
                  {categoryAverages.map(({ category, avg }) => (
                    <div key={category.key}>
                      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                        <span>{category.label_id}</span>
                        <span>{avg.toFixed(1)}/5</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(avg / 5) * 100}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500"
                        />
                      </div>
                    </div>
                  ))}
                  {categoryAverages.length === 0 && (
                    <p className="text-sm text-slate-400">Belum ada penilaian per kategori dari guru.</p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
