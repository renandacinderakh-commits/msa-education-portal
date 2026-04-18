"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Student, StudentGrade } from "@/lib/supabase/types";
import {
  BookOpen,
  Camera,
  CheckCircle,
  FileText,
  GraduationCap,
  Loader2,
  Shield,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type Message = { type: "ok" | "err"; text: string } | null;

const GRADES: StudentGrade[] = [
  "Toddler",
  "TK-A",
  "TK-B",
  "SD-1",
  "SD-2",
  "SD-3",
  "SD-4",
  "SD-5",
  "SD-6",
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), []);

  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [parents, setParents] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newRole, setNewRole] = useState<"teacher" | "parent">("teacher");
  const [addingUser, setAddingUser] = useState(false);
  const [addUserMessage, setAddUserMessage] = useState<Message>(null);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentNickname, setStudentNickname] = useState("");
  const [studentBirthDate, setStudentBirthDate] = useState("");
  const [studentGrade, setStudentGrade] = useState<StudentGrade>("TK-A");
  const [studentTeacherId, setStudentTeacherId] = useState("");
  const [studentParentId, setStudentParentId] = useState("");
  const [studentPhotoUrl, setStudentPhotoUrl] = useState("");
  const [studentPhotoFile, setStudentPhotoFile] = useState<File | null>(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [addStudentMessage, setAddStudentMessage] = useState<Message>(null);

  const teacherMap = useMemo(
    () => new Map(teachers.map((teacher) => [teacher.id, teacher])),
    [teachers]
  );
  const parentMap = useMemo(
    () => new Map(parents.map((parent) => [parent.id, parent])),
    [parents]
  );

  const loadData = async () => {
    const [{ data: t }, { data: p }, { data: s }, { count: ec }, { count: rc }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("role", "teacher").order("full_name"),
        supabase.from("profiles").select("*").eq("role", "parent").order("full_name"),
        supabase.from("students").select("*").eq("is_active", true).order("full_name"),
        supabase.from("daily_entries").select("*", { count: "exact", head: true }),
        supabase.from("monthly_reports").select("*", { count: "exact", head: true }),
      ]);

    setTeachers((t || []) as Profile[]);
    setParents((p || []) as Profile[]);
    setStudents((s || []) as Student[]);
    setTotalEntries(ec || 0);
    setTotalReports(rc || 0);

    if (t?.[0] && !studentTeacherId) setStudentTeacherId(t[0].id);
    if (p?.[0] && !studentParentId) setStudentParentId(p[0].id);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetStudentForm = () => {
    setStudentName("");
    setStudentNickname("");
    setStudentBirthDate("");
    setStudentGrade("TK-A");
    setStudentPhotoUrl("");
    setStudentPhotoFile(null);
    setAddStudentMessage(null);
    if (teachers[0]) setStudentTeacherId(teachers[0].id);
    if (parents[0]) setStudentParentId(parents[0].id);
  };

  const uploadStudentPhoto = async () => {
    if (!studentPhotoFile) return studentPhotoUrl.trim() || null;

    const safeName = studentPhotoFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `students/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("learning-photos")
      .upload(filePath, studentPhotoFile, { upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from("learning-photos").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAddStudent = async () => {
    if (!studentName.trim()) {
      setAddStudentMessage({ type: "err", text: "Nama anak wajib diisi" });
      return;
    }
    if (!studentTeacherId) {
      setAddStudentMessage({ type: "err", text: "Pilih guru pendamping dulu" });
      return;
    }
    if (!studentParentId) {
      setAddStudentMessage({ type: "err", text: "Pilih akun orang tua/wali dulu" });
      return;
    }

    setAddingStudent(true);
    setAddStudentMessage(null);

    try {
      const photoUrl = await uploadStudentPhoto();
      const { error } = await supabase.from("students").insert({
        full_name: studentName.trim(),
        nickname: studentNickname.trim() || null,
        date_of_birth: studentBirthDate || null,
        grade_level: studentGrade,
        photo_url: photoUrl,
        teacher_id: studentTeacherId,
        parent_id: studentParentId,
        is_active: true,
      });

      if (error) throw error;

      setAddStudentMessage({ type: "ok", text: "Murid baru berhasil ditambahkan dan tersambung ke guru + parent." });
      resetStudentForm();
      await loadData();
    } catch (error) {
      setAddStudentMessage({
        type: "err",
        text: error instanceof Error ? error.message : "Gagal menambahkan murid",
      });
    } finally {
      setAddingStudent(false);
    }
  };

  const handleAddUser = async () => {
    if (!newName || !newEmail || !newPassword) {
      setAddUserMessage({ type: "err", text: "Nama, email, dan password harus diisi" });
      return;
    }

    setAddingUser(true);
    setAddUserMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          data: { full_name: newName, role: newRole },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          role: newRole,
          full_name: newName,
          email: newEmail,
          whatsapp: newWhatsapp || null,
        });

        setAddUserMessage({ type: "ok", text: `Akun ${newRole} berhasil dibuat.` });
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewWhatsapp("");
        await loadData();
      }
    } catch (error) {
      setAddUserMessage({
        type: "err",
        text: error instanceof Error ? error.message : "Gagal membuat akun",
      });
    } finally {
      setAddingUser(false);
    }
  };

  const stats = [
    { label: "Total Guru", value: teachers.length, icon: GraduationCap, color: "from-sky-500 to-cyan-500", bg: "bg-sky-50 dark:bg-sky-900/20" },
    { label: "Total Murid", value: students.length, icon: Users, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Total Orang Tua", value: parents.length, icon: UserPlus, color: "from-indigo-500 to-sky-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "Total Entri", value: totalEntries, icon: BookOpen, color: "from-amber-500 to-yellow-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Total Laporan", value: totalReports, icon: FileText, color: "from-rose-500 to-pink-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Tingkat Aktivitas", value: totalEntries > 0 ? "Aktif" : "-", icon: TrendingUp, color: "from-teal-500 to-emerald-500", bg: "bg-teal-50 dark:bg-teal-900/20" },
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">
            <Shield className="h-7 w-7 text-sky-500" />
            Panel Admin
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Kelola akun, murid, guru pendamping, dan koneksi parent.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => setShowAddStudent(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:from-sky-600 hover:to-teal-600 dark:shadow-none"
          >
            <Users className="h-4 w-4" />
            Tambah Murid
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Akun
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${item.bg} rounded-2xl border border-slate-100 p-5 dark:border-slate-800`}
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{item.value}</p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
              <GraduationCap className="h-5 w-5 text-sky-500" />
              Daftar Guru
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-sm font-bold text-white">
                  {teacher.full_name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-white">{teacher.full_name}</p>
                  <p className="truncate text-xs text-slate-400">{teacher.email}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
              <Users className="h-5 w-5 text-emerald-500" />
              Daftar Murid
            </h2>
            <button
              onClick={() => setShowAddStudent(true)}
              className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-100"
            >
              Tambah
            </button>
          </div>
          <div className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {students.map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-4">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-sky-100">
                  {student.photo_url ? (
                    <Image src={student.photo_url} alt={`Foto ${student.full_name}`} fill className="object-cover" sizes="44px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-sky-600">
                      {student.nickname?.charAt(0) || student.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-white">{student.full_name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {student.grade_level} | Guru: {teacherMap.get(student.teacher_id)?.full_name || "-"} | Parent:{" "}
                    {student.parent_id ? parentMap.get(student.parent_id)?.full_name || "-" : "-"}
                  </p>
                </div>
              </div>
            ))}
            {students.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Belum ada murid</p>}
          </div>
        </section>
      </div>

      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddStudent(false)}>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tambah Murid Baru</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Hubungkan anak ke guru pendamping dan akun orang tua supaya portal langsung sinkron.
                </p>
              </div>
              <button onClick={() => setShowAddStudent(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {addStudentMessage && (
              <div
                className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${
                  addStudentMessage.type === "ok"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {addStudentMessage.type === "ok" ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                {addStudentMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nama Lengkap Anak *</label>
                <input value={studentName} onChange={(event) => setStudentName(event.target.value)} className={inputClass} placeholder="Contoh: Alya Cindera" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nama Panggilan</label>
                <input value={studentNickname} onChange={(event) => setStudentNickname(event.target.value)} className={inputClass} placeholder="Contoh: Alya" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tanggal Lahir</label>
                <input type="date" value={studentBirthDate} onChange={(event) => setStudentBirthDate(event.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Jenjang *</label>
                <select value={studentGrade} onChange={(event) => setStudentGrade(event.target.value as StudentGrade)} className={inputClass}>
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Guru Pendamping *</label>
                <select value={studentTeacherId} onChange={(event) => setStudentTeacherId(event.target.value)} className={inputClass}>
                  <option value="">Pilih guru</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Orang Tua / Wali *</label>
                <select value={studentParentId} onChange={(event) => setStudentParentId(event.target.value)} className={inputClass}>
                  <option value="">Pilih parent</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Upload Foto Real Anak</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-600 hover:bg-sky-100">
                  <Upload className="h-4 w-4" />
                  {studentPhotoFile ? studentPhotoFile.name : "Pilih foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setStudentPhotoFile(event.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Atau URL Foto</label>
                <input
                  value={studentPhotoUrl}
                  onChange={(event) => setStudentPhotoUrl(event.target.value)}
                  className={inputClass}
                  placeholder="https://... atau /images/..."
                />
              </div>
              <div className="sm:col-span-2 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
                <div className="mb-1 flex items-center gap-2 font-semibold text-slate-700">
                  <Camera className="h-4 w-4 text-sky-500" />
                  Catatan foto
                </div>
                Untuk foto realistis, upload foto asli/sample dari lo. Sistem akan menyimpan ke Supabase Storage lalu dipakai di dashboard parent dan PDF report.
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  resetStudentForm();
                  setShowAddStudent(false);
                }}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleAddStudent}
                disabled={addingStudent}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white hover:from-sky-600 hover:to-teal-600 disabled:opacity-60 sm:flex-[2]"
              >
                {addingStudent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                Simpan Murid Baru
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddUser(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tambah Akun Baru</h3>
              <button onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {addUserMessage && (
              <div className={`rounded-lg p-3 text-sm ${addUserMessage.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {addUserMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-2">
                {(["teacher", "parent"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition ${
                      newRole === role
                        ? "border-sky-400 bg-sky-50 text-sky-600"
                        : "border-slate-200 text-slate-400"
                    }`}
                  >
                    {role === "teacher" ? "Guru" : "Orang Tua"}
                  </button>
                ))}
              </div>
              <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nama Lengkap *" className={inputClass} />
              <input value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="Email *" type="email" className={inputClass} />
              <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Password *" type="password" className={inputClass} />
              <input value={newWhatsapp} onChange={(event) => setNewWhatsapp(event.target.value)} placeholder="Nomor WhatsApp (opsional)" className={inputClass} />
            </div>

            <button
              onClick={handleAddUser}
              disabled={addingUser}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 py-3 font-semibold text-white disabled:opacity-60"
            >
              {addingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Buat Akun {newRole === "teacher" ? "Guru" : "Orang Tua"}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
