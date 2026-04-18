"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { DailyEntry, MonthlyReport, Profile, Student } from "@/lib/supabase/types";
import {
  Activity,
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Shield,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

type TeacherLoad = {
  teacher: Profile;
  studentCount: number;
  entryCount: number;
  reportCount: number;
  avgStars: number;
};

const monthLabel = new Date().toLocaleDateString("id-ID", {
  month: "long",
  year: "numeric",
});

const statCardColors = [
  { gradient: "from-sky-500 to-cyan-500", bg: "bg-sky-50" },
  { gradient: "from-teal-500 to-emerald-500", bg: "bg-emerald-50" },
  { gradient: "from-amber-500 to-yellow-500", bg: "bg-amber-50" },
  { gradient: "from-rose-500 to-pink-500", bg: "bg-rose-50" },
  { gradient: "from-indigo-500 to-violet-500", bg: "bg-indigo-50" },
  { gradient: "from-slate-700 to-slate-900", bg: "bg-slate-100" },
];

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [parents, setParents] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [{ data: t }, { data: p }, { data: s }, { data: e }, { data: r }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("role", "teacher").order("full_name"),
          supabase.from("profiles").select("*").eq("role", "parent").order("full_name"),
          supabase.from("students").select("*").eq("is_active", true).order("full_name"),
          supabase.from("daily_entries").select("*").order("entry_date", { ascending: false }).limit(400),
          supabase.from("monthly_reports").select("*").order("created_at", { ascending: false }).limit(200),
        ]);

      if (!mounted) return;
      setTeachers((t || []) as Profile[]);
      setParents((p || []) as Profile[]);
      setStudents((s || []) as Student[]);
      setEntries((e || []) as DailyEntry[]);
      setReports((r || []) as MonthlyReport[]);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const thisMonthEntries = useMemo(() => {
    const now = new Date();
    return entries.filter((entry) => {
      const date = new Date(entry.entry_date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, [entries]);

  const thisMonthReports = useMemo(() => {
    const now = new Date();
    return reports.filter((report) => report.month === now.getMonth() + 1 && report.year === now.getFullYear());
  }, [reports]);

  const teacherLoad = useMemo<TeacherLoad[]>(() => {
    return teachers.map((teacher) => {
      const teacherStudents = students.filter((student) => student.teacher_id === teacher.id);
      const teacherEntries = entries.filter((entry) => entry.teacher_id === teacher.id);
      const teacherReports = reports.filter((report) => report.teacher_id === teacher.id);
      const avgStars = teacherEntries.length
        ? teacherEntries.reduce((sum, entry) => sum + (entry.overall_stars || 0), 0) / teacherEntries.length
        : 0;
      return {
        teacher,
        studentCount: teacherStudents.length,
        entryCount: teacherEntries.length,
        reportCount: teacherReports.length,
        avgStars,
      };
    });
  }, [teachers, students, entries, reports]);

  const parentCoverage = students.length
    ? Math.round((students.filter((student) => student.parent_id).length / students.length) * 100)
    : 0;

  const reportReadiness = students.length
    ? Math.round((new Set(thisMonthReports.map((report) => report.student_id)).size / students.length) * 100)
    : 0;

  const avgSessions = students.length ? (thisMonthEntries.length / students.length).toFixed(1) : "0";
  const avgStars = entries.length
    ? (entries.reduce((sum, entry) => sum + (entry.overall_stars || 0), 0) / entries.length).toFixed(1)
    : "0";

  const stats = [
    { label: "Murid Aktif", value: students.length, helper: `${parentCoverage}% terhubung parent`, icon: Users },
    { label: "Guru & Parent", value: `${teachers.length}/${parents.length}`, helper: "teacher / parent accounts", icon: GraduationCap },
    { label: "Sesi Bulan Ini", value: thisMonthEntries.length, helper: `${avgSessions} sesi / murid`, icon: BookOpen },
    { label: "Report Ready", value: `${reportReadiness}%`, helper: `${thisMonthReports.length} report ${monthLabel}`, icon: FileText },
    { label: "Avg Rating", value: `${avgStars}/5`, helper: "akumulasi semua evidence", icon: TrendingUp },
    { label: "Portal Health", value: entries.length > 0 ? "Active" : "Needs Data", helper: "journal + report sync", icon: Activity },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sky-200 border-t-sky-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            <Shield className="h-4 w-4" />
            School Command Center
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Dashboard Kepala Sekolah
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">
            Pantau operasional tutoring, evidence belajar, readiness report, dan coverage parent dalam satu layar.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/portal/admin/accounts"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-100"
          >
            <UserPlus className="h-4 w-4" />
            Kelola Akun & Murid
          </Link>
          <Link
            href="/portal/teacher/reports"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ClipboardList className="h-4 w-4" />
            Review Laporan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const color = statCardColors[index];
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`rounded-2xl border border-slate-100 ${color.bg} p-5 shadow-sm`}
            >
              <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color.gradient} text-white shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
                </div>
                <p className="max-w-[120px] text-right text-xs leading-relaxed text-slate-500">{stat.helper}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <BarChart3 className="h-5 w-5 text-sky-500" />
                Teacher Load & Quality Signal
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Ideal buat tutoring: load murid, jumlah evidence, dan report output harus kebaca cepat.
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {teacherLoad.map((item) => {
              const loadPercent = students.length ? Math.min(100, (item.studentCount / Math.max(students.length, 1)) * 100) : 0;
              const entryPercent = entries.length ? Math.min(100, (item.entryCount / Math.max(entries.length, 1)) * 100) : 0;
              return (
                <div key={item.teacher.id} className="grid gap-4 p-5 md:grid-cols-[1fr_1.2fr] md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-sm font-bold text-white">
                      {item.teacher.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.teacher.full_name}</p>
                      <p className="truncate text-xs text-slate-400">{item.teacher.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>{item.studentCount} murid</span>
                      <span>{item.entryCount} entries</span>
                      <span>{item.reportCount} reports</span>
                      <span>{item.avgStars.toFixed(1)}/5</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-sky-500" style={{ width: `${loadPercent}%` }} />
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-teal-500" style={{ width: `${entryPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {teacherLoad.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">Belum ada guru aktif.</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Operational Priorities
          </h2>
          <div className="mt-4 space-y-3">
            {[
              {
                title: "Parent connection",
                value: `${parentCoverage}%`,
                ok: parentCoverage >= 90,
                body: "Pastikan setiap murid punya parent account agar report dan jurnal bisa sampai.",
              },
              {
                title: "Monthly report readiness",
                value: `${reportReadiness}%`,
                ok: reportReadiness >= 80,
                body: "Target tutoring internasional: laporan bulanan siap sebelum akhir periode.",
              },
              {
                title: "Evidence density",
                value: `${thisMonthEntries.length}`,
                ok: thisMonthEntries.length >= students.length * 2,
                body: "Daily evidence adalah bahan utama untuk summary mingguan/bulanan.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${item.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {item.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {item.value}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-bold text-slate-900">Student Coverage Snapshot</h2>
          <p className="mt-1 text-xs text-slate-500">
            Quick scan murid aktif, foto, parent link, dan activity evidence terakhir.
          </p>
        </div>
        <div className="grid gap-0 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          {students.slice(0, 8).map((student) => {
            const studentEntries = entries.filter((entry) => entry.student_id === student.id);
            const lastEntry = studentEntries[0];
            return (
              <div key={student.id} className="flex items-center gap-4 p-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sky-50">
                  {student.photo_url ? (
                    <Image src={student.photo_url} alt={`Foto ${student.full_name}`} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-sky-600">
                      {student.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{student.full_name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {student.grade_level} | {studentEntries.length} entries | last:{" "}
                    {lastEntry ? new Date(lastEntry.entry_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "none"}
                  </p>
                </div>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${student.parent_id ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {student.parent_id ? "linked" : "no parent"}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
