"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Student } from "@/lib/supabase/types";
import { Users, Plus, ChevronRight, BookOpen } from "lucide-react";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("students").select("*").eq("teacher_id", user.id).eq("is_active", true).order("full_name");
      if (data) setStudents(data as Student[]);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const GRADE_COLORS: Record<string, string> = {
    "Toddler": "from-pink-400 to-rose-500",
    "TK-A": "from-sky-400 to-blue-500",
    "TK-B": "from-teal-400 to-emerald-500",
    "SD-1": "from-amber-400 to-orange-500",
    "SD-2": "from-violet-400 to-purple-500",
    "SD-3": "from-indigo-400 to-blue-600",
    "SD-4": "from-cyan-400 to-sky-500",
    "SD-5": "from-lime-400 to-green-500",
    "SD-6": "from-red-400 to-rose-600",
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">👥 Murid Saya</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{students.length} murid aktif</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Users className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Belum Ada Murid</h3>
          <p className="text-sm text-slate-400">Hubungi admin untuk menambahkan murid ke akun Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/portal/teacher/students/${student.id}`}
                className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-sky-200 dark:hover:border-sky-700 transition-all group"
              >
                {/* Avatar */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${GRADE_COLORS[student.grade_level] || "from-sky-400 to-blue-500"} flex items-center justify-center text-white text-2xl font-bold mb-4 group-hover:scale-105 transition-transform`}>
                  {student.nickname?.charAt(0) || student.full_name.charAt(0)}
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{student.full_name}</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {student.nickname && `"${student.nickname}" • `}{student.grade_level}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-sky-500">
                    <BookOpen className="w-3.5 h-3.5" />
                    Lihat Jurnal
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-400 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
