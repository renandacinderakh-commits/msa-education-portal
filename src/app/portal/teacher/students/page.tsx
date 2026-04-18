"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { DailyEntry, MonthlyReport, Student } from "@/lib/supabase/types";
import { SCORE_CATEGORIES } from "@/lib/supabase/types";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  History,
  MessageCircle,
  Plus,
  Star,
  Target,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

type StudentRecord = Student & {
  entries: DailyEntry[];
  reports: MonthlyReport[];
};

const gradeColors: Record<string, string> = {
  Toddler: "from-pink-400 to-rose-500",
  "TK-A": "from-sky-400 to-blue-500",
  "TK-B": "from-teal-400 to-emerald-500",
  "SD-1": "from-amber-400 to-orange-500",
  "SD-2": "from-violet-400 to-purple-500",
  "SD-3": "from-indigo-400 to-blue-600",
  "SD-4": "from-cyan-400 to-sky-500",
  "SD-5": "from-lime-400 to-green-500",
  "SD-6": "from-red-400 to-rose-600",
};

const safeDate = (date?: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const avgStars = (entries: DailyEntry[]) => {
  if (!entries.length) return 0;
  return entries.reduce((sum, entry) => sum + (entry.overall_stars || 0), 0) / entries.length;
};

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [{ data: studs }, { data: ents }, { data: reps }] = await Promise.all([
        supabase
          .from("students")
          .select("*")
          .eq("teacher_id", user.id)
          .eq("is_active", true)
          .order("full_name"),
        supabase
          .from("daily_entries")
          .select("*")
          .eq("teacher_id", user.id)
          .order("entry_date", { ascending: false })
          .limit(300),
        supabase
          .from("monthly_reports")
          .select("*")
          .eq("teacher_id", user.id)
          .order("year", { ascending: false })
          .order("month", { ascending: false })
          .limit(120),
      ]);

      if (!mounted) return;
      setStudents((studs || []) as Student[]);
      setEntries((ents || []) as DailyEntry[]);
      setReports((reps || []) as MonthlyReport[]);
      if (studs?.[0]) setExpandedId(studs[0].id);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const records = useMemo<StudentRecord[]>(
    () =>
      students.map((student) => ({
        ...student,
        entries: entries.filter((entry) => entry.student_id === student.id),
        reports: reports.filter((report) => report.student_id === student.id),
      })),
    [students, entries, reports]
  );

  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const studentsWithReports = new Set(reports.map((report) => report.student_id)).size;
    return [
      { label: "Murid Aktif", value: students.length, icon: Users, color: "from-sky-500 to-cyan-500" },
      { label: "Daily Evidence", value: totalEntries, icon: BookOpen, color: "from-teal-500 to-emerald-500" },
      { label: "Report Coverage", value: `${students.length ? Math.round((studentsWithReports / students.length) * 100) : 0}%`, icon: FileText, color: "from-amber-500 to-yellow-500" },
      { label: "Avg Stars", value: `${avgStars(entries).toFixed(1)}/5`, icon: Star, color: "from-indigo-500 to-violet-500" },
    ];
  }, [students.length, entries, reports]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sky-200 border-t-sky-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            <History className="h-4 w-4" />
            Student Learning Dossier
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Murid Saya</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Lihat data pribadi, historical entry, catatan guru, dan readiness report tiap anak.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/portal/teacher/entries"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-100"
          >
            <Plus className="h-4 w-4" />
            Entry Harian
          </Link>
          <Link
            href="/portal/teacher/reports"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            <ClipboardList className="h-4 w-4" />
            Buat Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-slate-200" />
          <h3 className="mb-2 font-semibold text-slate-900">Belum Ada Murid</h3>
          <p className="text-sm text-slate-400">Hubungi admin untuk menambahkan murid ke akun Anda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((student, index) => {
            const expanded = expandedId === student.id;
            const latestEntry = student.entries[0];
            const topCategory = SCORE_CATEGORIES.map((category) => {
              const values = student.entries
                .map((entry) => entry.scores?.[category.key] as number | undefined)
                .filter((value): value is number => typeof value === "number");
              return {
                category,
                avg: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0,
              };
            }).sort((a, b) => b.avg - a.avg)[0];

            return (
              <motion.section
                key={student.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.25) }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : student.id)}
                  className="flex w-full flex-col gap-4 p-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-sky-50">
                      {student.photo_url ? (
                        <Image src={student.photo_url} alt={`Foto ${student.full_name}`} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradeColors[student.grade_level] || "from-sky-400 to-blue-500"} text-2xl font-bold text-white`}>
                          {student.nickname?.charAt(0) || student.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-slate-900">{student.full_name}</h2>
                      <p className="text-sm text-slate-500">
                        {student.nickname || "No nickname"} | {student.grade_level} | Lahir {safeDate(student.date_of_birth)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-lg bg-sky-50 px-2.5 py-1 font-semibold text-sky-700">
                          {student.entries.length} entries
                        </span>
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                          {student.reports.length} reports
                        </span>
                        <span className="rounded-lg bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                          {avgStars(student.entries).toFixed(1)}/5 avg
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Latest Evidence</p>
                      <p className="text-sm font-medium text-slate-700">
                        {latestEntry ? safeDate(latestEntry.entry_date) : "Belum ada"}
                      </p>
                    </div>
                    {expanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
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
                      <div className="grid gap-4 p-4 lg:grid-cols-[0.95fr_1.05fr] lg:p-5">
                        <div className="space-y-4">
                          <div className="rounded-xl bg-slate-50 p-4">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                              <UserRound className="h-4 w-4 text-sky-500" />
                              Data Pribadi & Kelas
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-slate-400">Nama panggilan</p>
                                <p className="font-semibold text-slate-700">{student.nickname || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400">Jenjang</p>
                                <p className="font-semibold text-slate-700">{student.grade_level}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400">Tanggal lahir</p>
                                <p className="font-semibold text-slate-700">{safeDate(student.date_of_birth)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400">Parent link</p>
                                <p className={`font-semibold ${student.parent_id ? "text-emerald-600" : "text-rose-600"}`}>
                                  {student.parent_id ? "Connected" : "Not linked"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                              <TrendingUp className="h-4 w-4 text-teal-500" />
                              Development Signal
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                                  <span>Overall growth</span>
                                  <span>{avgStars(student.entries).toFixed(1)}/5</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500"
                                    style={{ width: `${Math.min(100, (avgStars(student.entries) / 5) * 100)}%` }}
                                  />
                                </div>
                              </div>
                              <p className="text-sm leading-relaxed text-slate-500">
                                Strongest current domain:{" "}
                                <span className="font-semibold text-slate-800">
                                  {topCategory?.avg ? topCategory.category.label_id : "belum cukup data"}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-xl border border-slate-100 p-4">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                              <MessageCircle className="h-4 w-4 text-emerald-500" />
                              Catatan Pendidikan Terakhir
                            </h3>
                            {latestEntry ? (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-semibold text-slate-400">Topik</p>
                                  <p className="font-medium text-slate-900">{latestEntry.session_title}</p>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-600">{latestEntry.activities_description}</p>
                                {latestEntry.teacher_notes && (
                                  <p className="rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
                                    {latestEntry.teacher_notes}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">Belum ada catatan. Mulai dari entry harian pertama.</p>
                            )}
                          </div>

                          <div className="rounded-xl border border-slate-100 p-4">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                              <Calendar className="h-4 w-4 text-amber-500" />
                              Historical Timeline
                            </h3>
                            <div className="space-y-3">
                              {student.entries.slice(0, 4).map((entry) => (
                                <div key={entry.id} className="flex gap-3">
                                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-800">
                                      #{entry.meeting_number} {entry.session_title}
                                    </p>
                                    <p className="text-xs text-slate-400">{safeDate(entry.entry_date)}</p>
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, star) => (
                                      <Star
                                        key={star}
                                        className={`h-3 w-3 ${star < entry.overall_stars ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {student.entries.length === 0 && <p className="text-sm text-slate-400">Belum ada history.</p>}
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <Link
                              href="/portal/teacher/entries"
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-100"
                            >
                              <Target className="h-4 w-4" />
                              Tambah Evidence
                            </Link>
                            <Link
                              href="/portal/teacher/reports"
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              <FileText className="h-4 w-4" />
                              Lihat Report
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
}
