"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { DailyEntry } from "@/lib/supabase/types";
import {
  Plus,
  Star,
  Calendar,
  Smile,
  Meh,
  HeartHandshake,
  Search,
  Filter,
} from "lucide-react";

export default function TeacherEntriesPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("daily_entries")
        .select("*, student:students(full_name, nickname, grade_level, photo_url)")
        .eq("teacher_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(50);

      if (data) setEntries(data as unknown as DailyEntry[]);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const MoodIcon = ({ mood }: { mood: string }) => {
    if (mood === "happy") return <Smile className="w-4 h-4 text-emerald-500" />;
    if (mood === "neutral") return <Meh className="w-4 h-4 text-amber-500" />;
    return <HeartHandshake className="w-4 h-4 text-rose-500" />;
  };

  const filtered = entries.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const studentName = (e.student as any)?.full_name?.toLowerCase() || "";
    return (
      studentName.includes(q) ||
      e.session_title?.toLowerCase().includes(q) ||
      e.activities_description?.toLowerCase().includes(q)
    );
  });

  // Group entries by month
  const grouped = filtered.reduce((acc, entry) => {
    const d = new Date(entry.entry_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = { label, entries: [] };
    acc[key].entries.push(entry);
    return acc;
  }, {} as Record<string, { label: string; entries: DailyEntry[] }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            📝 Entri Harian
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {entries.length} entri tercatat
          </p>
        </div>
        <Link
          href="/portal/teacher/entries/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Entri
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan nama murid, judul, atau aktivitas..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none"
        />
      </div>

      {/* Entries grouped by month */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Belum Ada Entri</h3>
          <p className="text-sm text-slate-400 mb-4">Mulai catat aktivitas belajar murid Anda</p>
          <Link
            href="/portal/teacher/entries/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Buat Entri Pertama
          </Link>
        </div>
      ) : (
        Object.entries(grouped).map(([key, group]) => (
          <div key={key} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {group.label}
              <span className="text-xs font-normal text-slate-400">({group.entries.length} entri)</span>
            </h3>
            <div className="space-y-2">
              {group.entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                        #{entry.meeting_number}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                          {(entry.student as any)?.full_name || "—"}
                        </p>
                        <MoodIcon mood={entry.mood} />
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {entry.session_title} •{" "}
                        {new Date(entry.entry_date).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {entry.activities_description}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className={`w-3.5 h-3.5 ${
                            si < entry.overall_stars
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 dark:text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    {entry.photo_urls && entry.photo_urls.length > 0 && (
                      <span className="text-xs text-slate-400 shrink-0">
                        📷 {entry.photo_urls.length}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
