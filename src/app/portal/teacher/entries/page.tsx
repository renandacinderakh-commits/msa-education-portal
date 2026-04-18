"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Student } from "@/lib/supabase/types";
import { SCORE_CATEGORIES } from "@/lib/supabase/types";
import PhotoUploader from "@/components/portal/PhotoUploader";
import {
  Plus,
  Send,
  X,
  Star,
  Smile,
  Meh,
  HeartHandshake,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Languages,
  Loader2,
  CheckCircle,
  Camera,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";

// ── Auto-translate via MyMemory (free, no key) ─────────────────────────────
async function translateID2EN(text: string): Promise<string> {
  if (!text.trim()) return "";
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`
    );
    const data = await res.json();
    return data.responseData?.translatedText || text;
  } catch {
    return text;
  }
}

type MoodType = "happy" | "neutral" | "needs_support";
type FormState = "idle" | "submitting" | "success" | "error";

const MOOD_OPTIONS: { value: MoodType; label: string; icon: React.ReactNode; color: string }[] = [
  {
    value: "happy",
    label: "Senang & Bersemangat",
    icon: <Smile className="w-5 h-5" />,
    color: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    value: "neutral",
    label: "Cukup Baik",
    icon: <Meh className="w-5 h-5" />,
    color: "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    value: "needs_support",
    label: "Perlu Dukungan",
    icon: <HeartHandshake className="w-5 h-5" />,
    color: "border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
];

interface EntryFormData {
  student_id: string;
  entry_date: string;
  meeting_number: number;
  session_title: string;
  topics_taught: string;
  topics_taught_en: string;
  activities_description: string;
  activities_description_en: string;
  teacher_notes: string;
  teacher_notes_en: string;
  suggestions: string;
  suggestions_en: string;
  next_topics: string;
  next_topics_en: string;
  mood: MoodType;
  overall_stars: number;
  scores: Record<string, number>;
}

const EMPTY_FORM: EntryFormData = {
  student_id: "",
  entry_date: new Date().toISOString().split("T")[0],
  meeting_number: 1,
  session_title: "",
  topics_taught: "",
  topics_taught_en: "",
  activities_description: "",
  activities_description_en: "",
  teacher_notes: "",
  teacher_notes_en: "",
  suggestions: "",
  suggestions_en: "",
  next_topics: "",
  next_topics_en: "",
  mood: "happy",
  overall_stars: 4,
  scores: {},
};

export default function TeacherEntriesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EntryFormData>(EMPTY_FORM);
  const [formState, setFormState] = useState<FormState>("idle");
  const [formError, setFormError] = useState("");
  const [translating, setTranslating] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [filterStudent, setFilterStudent] = useState("all");
  const [teacherId, setTeacherId] = useState<string>("");
  const [pageLoading, setPageLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Load students & teacher id
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) { setPageLoading(false); return; }
      setTeacherId(user.id);

      const { data: studs } = await supabase
        .from("students")
        .select("*")
        .eq("teacher_id", user.id)
        .eq("is_active", true)
        .order("full_name");

      if (mounted && studs) {
        setStudents(studs as Student[]);
        if (studs.length > 0) {
          setForm((f) => ({ ...f, student_id: studs[0].id }));
          setFilterStudent(studs[0].id);
        }
      }
      if (mounted) setPageLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [supabase]);

  // Load entries when filter changes
  const loadEntries = useCallback(async () => {
    if (!teacherId) return;
    setLoadingEntries(true);
    let query = supabase
      .from("daily_entries")
      .select("*, students(full_name, nickname, grade_level)")
      .eq("teacher_id", teacherId)
      .order("entry_date", { ascending: false })
      .limit(100);

    if (filterStudent !== "all") {
      query = query.eq("student_id", filterStudent);
    }
    const { data } = await query;
    setEntries(data || []);
    setLoadingEntries(false);
  }, [supabase, teacherId, filterStudent]);

  useEffect(() => {
    if (teacherId) loadEntries();
  }, [teacherId, filterStudent, loadEntries]);

  // Auto-set meeting number
  useEffect(() => {
    if (!form.student_id) return;
    const studentEntries = entries.filter((e) => e.student_id === form.student_id);
    const maxMeeting = studentEntries.reduce(
      (max, e) => Math.max(max, e.meeting_number || 0),
      0
    );
    setForm((f) => ({ ...f, meeting_number: maxMeeting + 1 }));
  }, [form.student_id, entries]);

  // ── Auto translate all fields ────────────────────────────
  const handleAutoTranslate = async () => {
    setTranslating(true);
    const [
      topics_taught_en,
      activities_description_en,
      teacher_notes_en,
      suggestions_en,
      next_topics_en,
    ] = await Promise.all([
      form.topics_taught ? translateID2EN(form.topics_taught) : Promise.resolve(""),
      form.activities_description ? translateID2EN(form.activities_description) : Promise.resolve(""),
      form.teacher_notes ? translateID2EN(form.teacher_notes) : Promise.resolve(""),
      form.suggestions ? translateID2EN(form.suggestions) : Promise.resolve(""),
      form.next_topics ? translateID2EN(form.next_topics) : Promise.resolve(""),
    ]);
    setForm((f) => ({
      ...f,
      topics_taught_en,
      activities_description_en,
      teacher_notes_en,
      suggestions_en,
      next_topics_en,
    }));
    setTranslating(false);
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setFormError("");
    if (!form.student_id) { setFormError("Pilih murid terlebih dahulu"); return; }
    if (!form.activities_description.trim()) { setFormError("Deskripsi aktivitas wajib diisi"); return; }

    setFormState("submitting");
    try {
      const { error } = await supabase.from("daily_entries").insert({
        student_id: form.student_id,
        teacher_id: teacherId,
        entry_date: form.entry_date,
        meeting_number: form.meeting_number,
        session_title: form.session_title || `Sesi #${form.meeting_number}`,
        topics_taught: form.topics_taught,
        topics_taught_en: form.topics_taught_en,
        activities_description: form.activities_description,
        activities_description_en: form.activities_description_en,
        teacher_notes: form.teacher_notes,
        teacher_notes_en: form.teacher_notes_en,
        suggestions: form.suggestions,
        suggestions_en: form.suggestions_en,
        next_topics: form.next_topics,
        next_topics_en: form.next_topics_en,
        mood: form.mood,
        overall_stars: form.overall_stars,
        scores: form.scores,
        photo_urls: photos,
      });

      if (error) throw error;

      setFormState("success");
      setTimeout(() => {
        setFormState("idle");
        setShowForm(false);
        setForm({ ...EMPTY_FORM, student_id: form.student_id });
        setPhotos([]);
        loadEntries();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan. Coba lagi.");
      setFormState("error");
      setTimeout(() => setFormState("idle"), 3000);
    }
  };

  const updateForm = useCallback(
    <K extends keyof EntryFormData>(key: K, value: EntryFormData[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
    },
    []
  );

  const updateScore = useCallback((key: string, val: number) => {
    setForm((f) => ({
      ...f,
      scores: { ...f.scores, [key]: val },
    }));
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setFormError("");
    setPhotos([]);
  }, []);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            Entri Harian 📝
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Catat perkembangan sesi belajar murid
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(""); setPhotos([]); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-sky-600 hover:to-teal-600 transition-all active:scale-95 shadow-md shadow-sky-200"
        >
          <Plus className="w-4 h-4" />
          Entri Baru
        </button>
      </div>

      {/* ── No students warning ─────────────────────────────── */}
      {students.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
              Belum ada murid yang terdaftar
            </p>
            <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">
              Hubungi admin untuk menambahkan murid ke akun Anda
            </p>
          </div>
        </div>
      )}

      {/* ── Entry Form Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="min-h-full flex items-start justify-center p-4 pt-8">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                  {/* Form header */}
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                        ✍️ Entri Harian Baru
                      </h2>
                      <p className="text-sm text-slate-400 mt-0.5">
                        Isi semua field sesuai sesi belajar hari ini
                      </p>
                    </div>
                    <button
                      onClick={closeForm}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Row: Student + Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Murid *
                        </label>
                        <select
                          value={form.student_id}
                          onChange={(e) => updateForm("student_id", e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none"
                        >
                          {students.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.full_name} ({s.grade_level})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Tanggal Sesi *
                        </label>
                        <input
                          type="date"
                          value={form.entry_date}
                          onChange={(e) => updateForm("entry_date", e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none"
                        />
                      </div>
                    </div>

                    {/* Row: Meeting no + Session title */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Pertemuan ke-
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={form.meeting_number}
                          onChange={(e) => updateForm("meeting_number", parseInt(e.target.value) || 1)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Judul Sesi
                        </label>
                        <input
                          type="text"
                          placeholder="Cth: Belajar Penjumlahan Bertingkat"
                          value={form.session_title}
                          onChange={(e) => updateForm("session_title", e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none"
                        />
                      </div>
                    </div>

                    {/* Mood Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Mood Anak Hari Ini *
                      </label>
                      <div className="flex gap-2">
                        {MOOD_OPTIONS.map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => updateForm("mood", m.value)}
                            className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                              form.mood === m.value
                                ? m.color + " border-opacity-100"
                                : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            {m.icon}
                            <span className="hidden sm:inline">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Overall Stars */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Nilai Keseluruhan Sesi
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => updateForm("overall_stars", n)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                n <= form.overall_stars
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200 dark:text-slate-700 hover:text-amber-300"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-sm text-slate-500 self-center ml-1">
                          {form.overall_stars}/5
                        </span>
                      </div>
                    </div>

                    {/* Topics Taught */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        📚 Materi yang Diajarkan
                      </label>
                      <input
                        type="text"
                        placeholder="Cth: Penjumlahan 2 digit, Membaca suku kata"
                        value={form.topics_taught}
                        onChange={(e) => updateForm("topics_taught", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none"
                      />
                    </div>

                    {/* Activities Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        📝 Deskripsi Aktivitas * (Bahasa Indonesia)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Ceritakan secara detail apa yang dilakukan selama sesi belajar. Cth: Hari ini kami belajar penjumlahan dengan media gambar buah. Anak sangat antusias dan mampu menjawab 8 dari 10 soal dengan benar..."
                        value={form.activities_description}
                        onChange={(e) => updateForm("activities_description", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none resize-none"
                      />
                    </div>

                    <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 dark:border-sky-800 dark:bg-sky-900/20">
                      <div className="mb-3 flex items-start gap-2">
                        <Camera className="mt-0.5 h-4 w-4 text-sky-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Foto Activity / Evidence
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Upload foto kegiatan belajar. Foto otomatis tampil di jurnal parent dan ikut masuk PDF bulanan.
                          </p>
                        </div>
                      </div>
                      <PhotoUploader
                        photos={photos}
                        onChange={setPhotos}
                        maxPhotos={6}
                        studentId={form.student_id || "entry"}
                      />
                    </div>

                    {/* Teacher Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        💬 Catatan Guru
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Observasi, catatan perkembangan, atau hal yang perlu diperhatikan..."
                        value={form.teacher_notes}
                        onChange={(e) => updateForm("teacher_notes", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none resize-none"
                      />
                    </div>

                    {/* Suggestions */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        💡 Saran untuk Orang Tua
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Aktivitas yang bisa dilakukan di rumah, hal yang perlu di-follow up..."
                        value={form.suggestions}
                        onChange={(e) => updateForm("suggestions", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none resize-none"
                      />
                    </div>

                    {/* Next Topics */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        🎯 Rencana Pertemuan Berikutnya
                      </label>
                      <input
                        type="text"
                        placeholder="Cth: Lanjut pengurangan 2 digit, latihan membaca kalimat pendek"
                        value={form.next_topics}
                        onChange={(e) => updateForm("next_topics", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none"
                      />
                    </div>

                    {/* Score by category */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        ⭐ Penilaian Per Kategori (Opsional)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SCORE_CATEGORIES.map((cat) => (
                          <div
                            key={cat.key}
                            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                          >
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                              {cat.icon} {cat.label_id}
                            </p>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => updateScore(cat.key, n)}
                                  className="p-0.5"
                                >
                                  <Star
                                    className={`w-4 h-4 transition-colors ${
                                      n <= (form.scores[cat.key] || 0)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-200 dark:text-slate-700 hover:text-amber-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Auto-translate button ─────────────────────────── */}
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                          <Languages className="w-4 h-4" />
                          Terjemahan Bahasa Inggris (Otomatis)
                        </p>
                        <button
                          type="button"
                          onClick={handleAutoTranslate}
                          disabled={translating}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                        >
                          {translating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Languages className="w-3.5 h-3.5" />
                          )}
                          {translating ? "Menerjemahkan..." : "Auto Terjemah Semua"}
                        </button>
                      </div>
                      <p className="text-xs text-indigo-500 mb-3">
                        Terjemahan akan muncul di jurnal orang tua dalam Bahasa Inggris (natural translation, bukan mesin).
                      </p>

                      {/* Show EN fields if translated */}
                      {(form.activities_description_en || form.teacher_notes_en) && (
                        <div className="space-y-2">
                          {form.activities_description_en && (
                            <div>
                              <label className="block text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                                🇬🇧 Activities (EN)
                              </label>
                              <textarea
                                rows={2}
                                value={form.activities_description_en}
                                onChange={(e) => updateForm("activities_description_en", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
                              />
                            </div>
                          )}
                          {form.teacher_notes_en && (
                            <div>
                              <label className="block text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                                🇬🇧 Teacher Notes (EN)
                              </label>
                              <textarea
                                rows={2}
                                value={form.teacher_notes_en}
                                onChange={(e) => updateForm("teacher_notes_en", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Error message */}
                    {formError && (
                      <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {formError}
                      </div>
                    )}

                    {/* Submit button */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={closeForm}
                        className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={formState === "submitting" || formState === "success"}
                        className={`flex-[2] inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-95 ${
                          formState === "success"
                            ? "bg-emerald-500 text-white"
                            : formState === "submitting"
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-sky-500 to-teal-500 text-white hover:from-sky-600 hover:to-teal-600"
                        }`}
                      >
                        {formState === "submitting" && <Loader2 className="w-4 h-4 animate-spin" />}
                        {formState === "success" && <CheckCircle className="w-4 h-4" />}
                        {formState === "idle" || formState === "error" ? <Send className="w-4 h-4" /> : null}
                        {formState === "submitting"
                          ? "Menyimpan..."
                          : formState === "success"
                          ? "Berhasil Disimpan! ✓"
                          : "Simpan Entri"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Filter + Entries List ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <select
          value={filterStudent}
          onChange={(e) => setFilterStudent(e.target.value)}
          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-300 outline-none"
        >
          <option value="all">Semua Murid</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
        <p className="text-sm text-slate-500">
          {entries.length} entri ditemukan
          {loadingEntries && (
            <span className="inline-flex ml-2 items-center gap-1 text-sky-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Memuat...
            </span>
          )}
        </p>
      </div>

      {/* Entry cards */}
      <div className="space-y-3">
        {entries.length === 0 && !loadingEntries ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              Belum ada entri. Klik &quot;Entri Baru&quot; untuk mulai mencatat.
            </p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const isExpanded = expandedEntry === entry.id;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        #{entry.meeting_number}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">
                        {entry.students?.full_name} — {entry.session_title || "Sesi Belajar"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(entry.entry_date).toLocaleDateString("id-ID", {
                          weekday: "long", day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex gap-0.5">
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
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-5 space-y-3"
                    >
                      {entry.photo_urls?.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {entry.photo_urls.slice(0, 6).map((url: string, photoIndex: number) => (
                            <div
                              key={`${url}-${photoIndex}`}
                              className="relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-700"
                            >
                              <img
                                src={url}
                                alt={`Foto activity ${photoIndex + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {entry.topics_taught && (
                        <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
                          <p className="text-xs font-semibold text-sky-600 mb-1">📚 Materi</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{entry.topics_taught}</p>
                        </div>
                      )}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">📝 Aktivitas</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {entry.activities_description}
                        </p>
                      </div>
                      {entry.teacher_notes && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                          <p className="text-xs font-semibold text-emerald-600 mb-1">💬 Catatan Guru</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{entry.teacher_notes}</p>
                        </div>
                      )}
                      {entry.suggestions && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                          <p className="text-xs font-semibold text-amber-600 mb-1">💡 Saran Ortu</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{entry.suggestions}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
