"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Student } from "@/lib/supabase/types";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  UserPlus,
  TrendingUp,
  Shield,
  X,
} from "lucide-react";

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [parents, setParents] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);

  // Add User Modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newRole, setNewRole] = useState<"teacher" | "parent">("teacher");
  const [addingUser, setAddingUser] = useState(false);
  const [addMessage, setAddMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: t } = await supabase.from("profiles").select("*").eq("role", "teacher");
    const { data: p } = await supabase.from("profiles").select("*").eq("role", "parent");
    const { data: s } = await supabase.from("students").select("*").eq("is_active", true);
    const { count: ec } = await supabase.from("daily_entries").select("*", { count: "exact", head: true });
    const { count: rc } = await supabase.from("monthly_reports").select("*", { count: "exact", head: true });

    if (t) setTeachers(t as Profile[]);
    if (p) setParents(p as Profile[]);
    if (s) setStudents(s as Student[]);
    setTotalEntries(ec || 0);
    setTotalReports(rc || 0);
    setLoading(false);
  };

  const handleAddUser = async () => {
    if (!newName || !newEmail || !newPassword) {
      setAddMessage({ type: "err", text: "Nama, email, dan password harus diisi" });
      return;
    }
    setAddingUser(true);
    setAddMessage(null);

    try {
      // Use Supabase admin API to create users (via edge function or directly)
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          data: { full_name: newName, role: newRole },
        },
      });

      if (error) {
        setAddMessage({ type: "err", text: error.message });
        setAddingUser(false);
        return;
      }

      if (data.user) {
        // Upsert profile
        await supabase.from("profiles").upsert({
          id: data.user.id,
          role: newRole,
          full_name: newName,
          email: newEmail,
          whatsapp: newWhatsapp || null,
        });

        setAddMessage({ type: "ok", text: `Akun ${newRole} berhasil dibuat!` });
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewWhatsapp("");
        loadData();
      }
    } catch {
      setAddMessage({ type: "err", text: "Gagal membuat akun" });
    }
    setAddingUser(false);
  };

  const stats = [
    { label: "Total Guru", value: teachers.length, icon: <GraduationCap className="w-5 h-5" />, color: "from-sky-500 to-blue-600", bg: "bg-sky-50 dark:bg-sky-900/20" },
    { label: "Total Murid", value: students.length, icon: <Users className="w-5 h-5" />, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Total Orang Tua", value: parents.length, icon: <UserPlus className="w-5 h-5" />, color: "from-purple-500 to-indigo-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "Total Entri", value: totalEntries, icon: <BookOpen className="w-5 h-5" />, color: "from-amber-500 to-orange-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Total Laporan", value: totalReports, icon: <FileText className="w-5 h-5" />, color: "from-rose-500 to-pink-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Tingkat Aktivitas", value: totalEntries > 0 ? "Aktif" : "—", icon: <TrendingUp className="w-5 h-5" />, color: "from-teal-500 to-cyan-600", bg: "bg-teal-50 dark:bg-teal-900/20" },
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-500" />
            Panel Admin
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola guru, murid, dan orang tua
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Akun
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${s.bg} rounded-2xl p-5 border border-slate-100 dark:border-slate-800`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teachers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-sky-500" /> Daftar Guru
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {teachers.map((t) => (
              <div key={t.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{t.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{t.email}</p>
                </div>
              </div>
            ))}
            {teachers.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-400">Belum ada guru</p>
            )}
          </div>
        </div>

        {/* Students */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> Daftar Murid
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((s) => (
              <div key={s.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {s.nickname?.charAt(0) || s.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{s.full_name}</p>
                  <p className="text-xs text-slate-400">{s.grade_level} • {s.nickname}</p>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-400">Belum ada murid</p>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAddUser(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                Tambah Akun Baru
              </h3>
              <button onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addMessage && (
              <div className={`p-3 rounded-xl text-sm ${addMessage.type === "ok" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300"}`}>
                {addMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-2">
                {(["teacher", "parent"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setNewRole(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      newRole === r
                        ? r === "teacher"
                          ? "border-sky-400 bg-sky-50 dark:bg-sky-900/20 text-sky-600"
                          : "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    {r === "teacher" ? "👩‍🏫 Guru" : "👨‍👩‍👧 Orang Tua"}
                  </button>
                ))}
              </div>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama Lengkap *" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400" />
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email *" type="email" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400" />
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password *" type="password" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400" />
              <input value={newWhatsapp} onChange={(e) => setNewWhatsapp(e.target.value)} placeholder="Nomor WhatsApp (opsional)" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400" />
            </div>

            <button
              onClick={handleAddUser}
              disabled={addingUser}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addingUser ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Buat Akun {newRole === "teacher" ? "Guru" : "Orang Tua"}
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
