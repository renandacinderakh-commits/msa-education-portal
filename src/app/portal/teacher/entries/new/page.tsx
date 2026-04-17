"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { SCORE_CATEGORIES, type ScoreMap, type Student, type StudentMood } from "@/lib/supabase/types";
import StarRating from "@/components/portal/StarRating";
import PhotoUploader from "@/components/portal/PhotoUploader";
import {
  Save,
  ArrowLeft,
  Calendar,
  Hash,
  Smile,
  Meh,
  HeartHandshake,
  Star,
  BookOpen,
  ChevronDown,
  Wand2,
} from "lucide-react";

export default function NewEntryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedStudent, setSelectedStudent] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [meetingNumber, setMeetingNumber] = useState(1);
  const [sessionTitle, setSessionTitle] = useState("");
  const [activitiesId, setActivitiesId] = useState("");
  const [activitiesEn, setActivitiesEn] = useState("");
  const [scores, setScores] = useState<ScoreMap>({});
  const [teacherNotesId, setTeacherNotesId] = useState("");
  const [teacherNotesEn, setTeacherNotesEn] = useState("");
  const [suggestionsId, setSuggestionsId] = useState("");
  const [suggestionsEn, setSuggestionsEn] = useState("");
  const [topicsTaughtId, setTopicsTaughtId] = useState("");
  const [topicsTaughtEn, setTopicsTaughtEn] = useState("");
  const [nextTopicsId, setNextTopicsId] = useState("");
  const [nextTopicsEn, setNextTopicsEn] = useState("");
  const [mood, setMood] = useState<StudentMood>("happy");
  const [overallStars, setOverallStars] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("teacher_id", user.id)
        .eq("is_active", true)
        .order("full_name");

      if (data) setStudents(data as Student[]);
      setLoading(false);
    };
    loadStudents();
  }, [supabase]);

  // Auto-calculate meeting number
  useEffect(() => {
    if (!selectedStudent || !entryDate) return;
    const calcMeeting = async () => {
      const month = new Date(entryDate).getMonth() + 1;
      const year = new Date(entryDate).getFullYear();
      const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
      const endOfMonth = `${year}-${String(month).padStart(2, "0")}-31`;

      const { count } = await supabase
        .from("daily_entries")
        .select("*", { count: "exact", head: true })
        .eq("student_id", selectedStudent)
        .gte("entry_date", startOfMonth)
        .lte("entry_date", endOfMonth);

      setMeetingNumber((count || 0) + 1);
    };
    calcMeeting();
  }, [selectedStudent, entryDate, supabase]);

  // Auto-generate session title
  useEffect(() => {
    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
    const ordinal = ordinals[meetingNumber - 1] || `${meetingNumber}th`;
    const dateObj = new Date(entryDate);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const formatted = dateObj.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
    setSessionTitle(`${ordinal} Meeting — ${dayName} (${formatted})`);
  }, [meetingNumber, entryDate]);

  const handleTranslate = async (sourceText: string, setTarget: (val: string) => void) => {
    if (!sourceText.trim()) return;
    try {
      setTarget("Translating...");
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=id|en`);
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        setTarget(data.responseData.translatedText);
      } else {
        setTarget("Translation error or limit reached.");
      }
    } catch (error) {
      setTarget("Network error during translation.");
    }
  };

  const handleSave = async () => {
    if (!selectedStudent) {
      alert("Pilih murid terlebih dahulu");
      return;
    }
    if (!activitiesId) {
      alert("Deskripsi aktivitas harus diisi");
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("daily_entries").insert({
      student_id: selectedStudent,
      teacher_id: user.id,
      entry_date: entryDate,
      meeting_number: meetingNumber,
      session_title: sessionTitle,
      activities_description: activitiesId,
      activities_description_en: activitiesEn,
      scores,
      teacher_notes: teacherNotesId,
      teacher_notes_en: teacherNotesEn,
      suggestions: suggestionsId,
      suggestions_en: suggestionsEn,
      topics_taught: topicsTaughtId,
      topics_taught_en: topicsTaughtEn,
      next_topics: nextTopicsId,
      next_topics_en: nextTopicsEn,
      mood,
      overall_stars: overallStars,
      photo_urls: photos,
    });

    if (error) {
      alert("Gagal menyimpan: " + error.message);
      setSaving(false);
      return;
    }

    router.push("/portal/teacher");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            📝 Entri Harian Baru
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Catat aktivitas dan perkembangan murid hari ini
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
        >
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-500" />
            Informasi Sesi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Murid *
              </label>
              <div className="relative">
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white appearance-none focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none"
                >
                  <option value="">Pilih Murid...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.grade_level})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Auto-generated Session Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Hash className="w-4 h-4 inline mr-1" />
              Judul Pertemuan (otomatis)
            </label>
            <input
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full px-4 py-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700/50 rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none"
            />
          </div>
        </motion.div>

        {/* Section 2: Activities (Bilingual) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
        >
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            Deskripsi Aktivitas & Penilaian
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                🇮🇩 Bahasa Indonesia *
              </label>
              <textarea
                value={activitiesId}
                onChange={(e) => setActivitiesId(e.target.value)}
                rows={6}
                placeholder="Deskripsi kegiatan belajar hari ini..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  🇬🇧 English
                </label>
                <button
                  type="button"
                  onClick={() => handleTranslate(activitiesId, setActivitiesEn)}
                  className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-600 transition-colors"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Translate
                </button>
              </div>
              <textarea
                value={activitiesEn}
                onChange={(e) => setActivitiesEn(e.target.value)}
                rows={6}
                placeholder="Learning activities description for today..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Section 3: Photos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
        >
          <PhotoUploader
            photos={photos}
            onChange={setPhotos}
            maxPhotos={5}
            studentId={selectedStudent}
          />
        </motion.div>

        {/* Section 4: Score Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
        >
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Penilaian Perkembangan
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Berikan bintang 1–5 untuk setiap kategori yang relevan di sesi ini
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCORE_CATEGORIES.map((cat) => (
              <div
                key={cat.key}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
              >
                <StarRating
                  value={scores[cat.key] || 0}
                  onChange={(val) =>
                    setScores((prev) => ({ ...prev, [cat.key]: val }))
                  }
                  label={cat.label_id}
                  labelEn={cat.label_en}
                  icon={cat.icon}
                />
              </div>
            ))}
          </div>

          {/* Overall Rating */}
          <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30">
            <StarRating
              value={overallStars}
              onChange={setOverallStars}
              label="⭐ Penilaian Keseluruhan Sesi"
              labelEn="Overall Session Rating"
              size="lg"
            />
          </div>
        </motion.div>

        {/* Section 5: Mood */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
        >
          <h2 className="font-semibold text-slate-800 dark:text-white">
            Suasana Hati Anak
          </h2>
          <div className="flex gap-3">
            {[
              { value: "happy" as const, icon: <Smile className="w-8 h-8" />, label: "Senang", color: "emerald" },
              { value: "neutral" as const, icon: <Meh className="w-8 h-8" />, label: "Biasa", color: "amber" },
              { value: "needs_support" as const, icon: <HeartHandshake className="w-8 h-8" />, label: "Perlu Dukungan", color: "rose" },
            ].map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  mood === m.value
                    ? m.color === "emerald"
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                      : m.color === "amber"
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                      : "border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-600"
                    : "border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300"
                }`}
              >
                {m.icon}
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Section 6: Notes (Bilingual) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
        >
          <h2 className="font-semibold text-slate-800 dark:text-white">
            📋 Catatan & Topik
          </h2>

          {/* Topics Taught */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Topik yang Diajarkan 🇮🇩
              </label>
              <textarea
                value={topicsTaughtId}
                onChange={(e) => setTopicsTaughtId(e.target.value)}
                rows={3}
                placeholder="Phonics huruf J dan K, angka 1-6, matching..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Topics Taught 🇬🇧
                </label>
                <button
                  type="button"
                  onClick={() => handleTranslate(topicsTaughtId, setTopicsTaughtEn)}
                  className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-600 transition-colors"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Translate
                </button>
              </div>
              <textarea
                value={topicsTaughtEn}
                onChange={(e) => setTopicsTaughtEn(e.target.value)}
                rows={3}
                placeholder="Phonics letters J and K, numbers 1-6, matching..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
              />
            </div>
          </div>

          {/* Next Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Rencana Selanjutnya 🇮🇩
              </label>
              <textarea
                value={nextTopicsId}
                onChange={(e) => setNextTopicsId(e.target.value)}
                rows={3}
                placeholder="Lanjutkan phonics L dan M, angka 7..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Next Topics 🇬🇧
                </label>
                <button
                  type="button"
                  onClick={() => handleTranslate(nextTopicsId, setNextTopicsEn)}
                  className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-600 transition-colors"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Translate
                </button>
              </div>
              <textarea
                value={nextTopicsEn}
                onChange={(e) => setNextTopicsEn(e.target.value)}
                rows={3}
                placeholder="Continue phonics L and M, number 7..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
              />
            </div>
          </div>

          {/* Teacher Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Catatan Guru 🇮🇩
              </label>
              <textarea
                value={teacherNotesId}
                onChange={(e) => setTeacherNotesId(e.target.value)}
                rows={3}
                placeholder="Catatan tentang perkembangan anak..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teacher Notes 🇬🇧
                </label>
                <button
                  type="button"
                  onClick={() => handleTranslate(teacherNotesId, setTeacherNotesEn)}
                  className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-600 transition-colors"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Translate
                </button>
              </div>
              <textarea
                value={teacherNotesEn}
                onChange={(e) => setTeacherNotesEn(e.target.value)}
                rows={3}
                placeholder="Notes about child's development..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
              />
            </div>
          </div>

          {/* Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Saran untuk Orang Tua 🇮🇩
              </label>
              <textarea
                value={suggestionsId}
                onChange={(e) => setSuggestionsId(e.target.value)}
                rows={3}
                placeholder="Saran latihan di rumah..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Suggestions for Parents 🇬🇧
                </label>
                <button
                  type="button"
                  onClick={() => handleTranslate(suggestionsId, setSuggestionsEn)}
                  className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-600 transition-colors"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Translate
                </button>
              </div>
              <textarea
                value={suggestionsEn}
                onChange={(e) => setSuggestionsEn(e.target.value)}
                rows={3}
                placeholder="Practice suggestions at home..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-end gap-4 pb-8"
        >
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedStudent || !activitiesId}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? "Menyimpan..." : "Simpan Entri"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
