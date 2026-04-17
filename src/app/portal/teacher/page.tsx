"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Student, DailyEntry, Profile } from "@/lib/supabase/types";
import {
  Users,
  BookOpen,
  Star,
  TrendingUp,
  Plus,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) setProfile(prof as Profile);

      // Get students
      const { data: studs } = await supabase
        .from("students")
        .select("*")
        .eq("teacher_id", user.id)
        .eq("is_active", true)
        .order("full_name");
      if (studs) setStudents(studs as Student[]);

      // Get recent entries
      const { data: entries } = await supabase
        .from("daily_entries")
        .select("*, student:students(full_name, nickname, photo_url)")
        .eq("teacher_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(5);
      if (entries) setRecentEntries(entries as unknown as DailyEntry[]);

      setLoading(false);
    };
    loadData();
  }, [supabase]);

  const stats = [
    {
      label: "Total Murid",
      value: students.length,
      icon: <Users className="w-5 h-5" />,
      color: "from-sky-500 to-blue-600",
      bg: "bg-sky-50 dark:bg-sky-900/20",
    },
    {
      label: "Entri Bulan Ini",
      value: recentEntries.filter((e) => {
        const now = new Date();
        const entryDate = new Date(e.entry_date);
        return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
      }).length,
      icon: <BookOpen className="w-5 h-5" />,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Rata-rata Bintang",
      value: recentEntries.length > 0
        ? (recentEntries.reduce((acc, e) => acc + e.overall_stars, 0) / recentEntries.length).toFixed(1)
        : "—",
      icon: <Star className="w-5 h-5" />,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Pertemuan Minggu Ini",
      value: recentEntries.filter((e) => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return new Date(e.entry_date) >= weekAgo;
      }).length,
      icon: <Calendar className="w-5 h-5" />,
      color: "from-purple-500 to-indigo-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            Selamat Datang, {profile?.full_name?.split(" ")[0] || "Guru"} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola pembelajaran dan perkembangan murid Anda
          </p>
        </div>
        <Link
          href="/portal/teacher/entries/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Entri Baru
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.bg} rounded-2xl p-5 border border-slate-100 dark:border-slate-800`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" />
              Murid Saya
            </h2>
            <Link href="/portal/teacher/students" className="text-xs text-sky-500 hover:text-sky-600">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Belum ada murid terdaftar</p>
              </div>
            ) : (
              students.slice(0, 5).map((student) => (
                <Link
                  key={student.id}
                  href={`/portal/teacher/students/${student.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {student.nickname?.charAt(0) || student.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {student.full_name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {student.grade_level} • {student.nickname}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Entri Terakhir
            </h2>
            <Link href="/portal/teacher/entries" className="text-xs text-sky-500 hover:text-sky-600">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentEntries.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Belum ada entri pembelajaran</p>
                <Link
                  href="/portal/teacher/entries/new"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-sky-500 hover:text-sky-600"
                >
                  <Plus className="w-4 h-4" />
                  Buat Entri Pertama
                </Link>
              </div>
            ) : (
              recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {(entry.student as any)?.full_name || "Murid"}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < entry.overall_stars
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 dark:text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {entry.session_title} • {new Date(entry.entry_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                    {entry.activities_description}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Link
          href="/portal/teacher/entries/new"
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl border border-sky-100 dark:border-sky-800/30 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">Entri Harian</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Catat aktivitas hari ini</p>
          </div>
        </Link>
        <Link
          href="/portal/teacher/reports"
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">Buat Laporan</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generate laporan bulanan</p>
          </div>
        </Link>
        <Link
          href="/portal/teacher/students"
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/30 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">Lihat Progres</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pantau perkembangan murid</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
