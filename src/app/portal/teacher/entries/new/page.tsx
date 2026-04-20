"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  SCORE_CATEGORIES, DOMAIN_CONFIG, STAR_LABELS,
  type ScoreMap, type Student, type StudentMood,
} from "@/lib/supabase/types";
import PhotoUploader from "@/components/portal/PhotoUploader";
import {
  Save, ArrowLeft, Calendar, Hash, Smile, Meh,
  HeartHandshake, Star, BookOpen, ChevronDown, Wand2, Clock, MapPin,
} from "lucide-react";

// ─── Star Rating inline component ────────────────────────────────────────────
function SkillStarRating({
  value, onChange, label, labelEn, icon,
}: {
  value: number; onChange: (v: number) => void;
  label: string; labelEn: string; icon: string;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  const starLabel = display > 0 ? STAR_LABELS[display as keyof typeof STAR_LABELS] : null;

  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <span className="text-2xl">{icon}</span>
      <p className="text-[11px] font-bold text-slate-700 text-center leading-tight">{label}</p>
      <p className="text-[10px] text-slate-400 text-center leading-tight italic">{labelEn}</p>
      <div className="flex gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n === value ? 0 : n)}
            className="transition-transform hover:scale-125"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                n <= display ? "fill-amber-400 text-amber-400" : "text-slate-200"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="h-4">
        {starLabel && (
          <p className="text-[10px] font-semibold text-amber-600 text-center">
            {value}.0 — {starLabel.id}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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
  const [sessionDuration, setSessionDuration] = useState<number>(90);
  const [sessionLocation, setSessionLocation] = useState("Home Visit");
  const [activitiesId, setActivitiesId] = useState("");
  const [activitiesEn, setActivitiesEn] = useState("");
  const [scores, setScores] = useState<ScoreMap>({});
  const [overallStars, setOverallStars] = useState(0);
  const [overallHovered, setOverallHovered] = useState(0);
  const [teacherNotesId, setTeacherNotesId] = useState("");
  const [teacherNotesEn, setTeacherNotesEn] = useState("");
  const [suggestionsId, setSuggestionsId] = useState("");
  const [suggestionsEn, setSuggestionsEn] = useState("");
  const [topicsTaughtId, setTopicsTaughtId] = useState("");
  const [topicsTaughtEn, setTopicsTaughtEn] = useState("");
  const [nextTopicsId, setNextTopicsId] = useState("");
  const [nextTopicsEn, setNextTopicsEn] = useState("");
  const [mood, setMood] = useState<StudentMood>("happy");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("students").select("*")
        .eq("teacher_id", user.id).eq("is_active", true).order("full_name");
      if (data) setStudents(data as Student[]);
      setLoading(false);
    };
    loadStudents();
  }, [supabase]);

  // Auto-calculate meeting number
  useEffect(() => {
    if (!selectedStudent || !entryDate) return;
    const calc = async () => {
      const d = new Date(entryDate);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const { count } = await supabase
        .from("daily_entries").select("*", { count: "exact", head: true })
        .eq("student_id", selectedStudent)
        .gte("entry_date", `${y}-${String(m).padStart(2, "0")}-01`)
        .lte("entry_date", `${y}-${String(m).padStart(2, "0")}-31`);
      setMeetingNumber((count || 0) + 1);
    };
    calc();
  }, [selectedStudent, entryDate, supabase]);

  // Auto session title
  useEffect(() => {
    const ord = ["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th"];
    const o = ord[meetingNumber - 1] || `${meetingNumber}th`;
    const d = new Date(entryDate);
    const day = d.toLocaleDateString("en-US", { weekday: "long" });
    const fmt = d.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
    setSessionTitle(`${o} Meeting — ${day} (${fmt})`);
  }, [meetingNumber, entryDate]);

  const translate = async (src: string, setFn: (v: string) => void) => {
    if (!src.trim()) return;
    setFn("Translating...");
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(src)}&langpair=id|en`);
      const data = await res.json();
      setFn(data?.responseData?.translatedText || "Translation error.");
    } catch {
      setFn("Network error.");
    }
  };

  const handleSave = async () => {
    if (!selectedStudent) { alert("Pilih murid terlebih dahulu"); return; }
    if (!activitiesId) { alert("Deskripsi aktivitas harus diisi"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("daily_entries").insert({
      student_id: selectedStudent,
      teacher_id: user.id,
      entry_date: entryDate,
      meeting_number: meetingNumber,
      session_title: sessionTitle,
      session_duration: sessionDuration,
      session_location: sessionLocation,
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

  const card = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5";
  const textarea = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-400 outline-none resize-none text-sm";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">📝 Entri Harian Baru</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Catat aktivitas dan perkembangan murid hari ini</p>
        </div>
      </div>

      {/* ── Section 1: Basic Info ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={card}>
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-500" /> Informasi Sesi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Murid *</label>
            <div className="relative">
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white appearance-none focus:ring-2 focus:ring-sky-400 outline-none text-sm">
                <option value="">Pilih Murid...</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.grade_level})</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tanggal</label>
            <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none text-sm" />
          </div>
        </div>

        {/* Session title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Hash className="w-4 h-4 inline mr-1" />Judul Pertemuan (otomatis)
          </label>
          <input value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)}
            className="w-full px-4 py-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700/50 rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-sky-400 outline-none text-sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1" />Durasi Sesi
            </label>
            <div className="flex gap-2">
              {[60, 90, 120].map((d) => (
                <button key={d} type="button" onClick={() => setSessionDuration(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    sessionDuration === d ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/30" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-sky-300"
                  }`}>
                  {d} mnt
                </button>
              ))}
            </div>
          </div>
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <MapPin className="w-4 h-4 inline mr-1" />Lokasi Sesi
            </label>
            <div className="relative">
              <select value={sessionLocation} onChange={(e) => setSessionLocation(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white appearance-none focus:ring-2 focus:ring-sky-400 outline-none text-sm">
                <option>Home Visit</option>
                <option>Online</option>
                <option>MSA Center</option>
                <option>Library / Perpustakaan</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: Activities Bilingual ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={card}>
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" /> Deskripsi Aktivitas Sesi Hari Ini
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">🇮🇩 Bahasa Indonesia *</label>
            <textarea value={activitiesId} onChange={(e) => setActivitiesId(e.target.value)} rows={5}
              placeholder="Deskripsikan kegiatan belajar hari ini secara detail..." className={textarea} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">🇬🇧 English</label>
              <button type="button" onClick={() => translate(activitiesId, setActivitiesEn)}
                className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-600">
                <Wand2 className="w-3 h-3" /> Auto-Translate
              </button>
            </div>
            <textarea value={activitiesEn} onChange={(e) => setActivitiesEn(e.target.value)} rows={5}
              placeholder="Describe today's learning activities in detail..." className={textarea} />
          </div>
        </div>
      </motion.div>

      {/* ── Section 3: Photos ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`${card} !p-6`}>
        <PhotoUploader photos={photos} onChange={setPhotos} maxPhotos={5} studentId={selectedStudent} />
      </motion.div>

      {/* ── Section 4: Mood ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className={card}>
        <h2 className="font-semibold text-slate-800 dark:text-white">😊 Suasana Hati Anak Hari Ini</h2>
        <div className="flex gap-3">
          {[
            { value: "happy" as const, icon: <Smile className="w-7 h-7" />, label: "Senang 😊", color: "emerald" },
            { value: "neutral" as const, icon: <Meh className="w-7 h-7" />, label: "Biasa 😐", color: "amber" },
            { value: "needs_support" as const, icon: <HeartHandshake className="w-7 h-7" />, label: "Perlu Dukungan 🤗", color: "rose" },
          ].map((m) => {
            const active = mood === m.value;
            const cls = active
              ? m.color === "emerald" ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700"
                : m.color === "amber" ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700"
                : "border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700"
              : "border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300";
            return (
              <button key={m.value} type="button" onClick={() => setMood(m.value)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${cls}`}>
                {m.icon}
                <span className="text-xs font-semibold">{m.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Section 5: Assessment — 5 Domains ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={card}>
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Penilaian Perkembangan — 5 Domain Internasional
          </h2>
          <p className="text-xs text-slate-400 mt-1">Berikan bintang 1–5 untuk setiap sub-skill yang relevan di sesi ini. Boleh kosong jika tidak dilatih.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[10px] bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 px-2 py-1 rounded-full font-semibold">EYFS UK</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-1 rounded-full font-semibold">IB-PYP</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-1 rounded-full font-semibold">Kurikulum Merdeka</span>
          </div>
        </div>

        <div className="space-y-6">
          {DOMAIN_CONFIG.map((domain) => {
            const cats = SCORE_CATEGORIES.filter((c) => c.domain === domain.key);
            return (
              <div key={domain.key} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Domain header */}
                <div className="px-5 py-3 flex items-center gap-3" style={{ backgroundColor: domain.bg, borderLeft: `4px solid ${domain.color}` }}>
                  <span className="text-xl">{domain.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{domain.label_id}</p>
                    <p className="text-xs text-slate-500">{domain.label_en}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-white/60 px-2 py-1 rounded-full hidden sm:block">
                    {domain.ref}
                  </span>
                </div>
                {/* Skill grid */}
                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {cats.map((cat) => (
                    <SkillStarRating
                      key={cat.key}
                      value={scores[cat.key as keyof ScoreMap] || 0}
                      onChange={(val) => setScores((prev) => ({ ...prev, [cat.key]: val }))}
                      label={cat.label_id}
                      labelEn={cat.label_en}
                      icon={cat.icon}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall session rating */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30">
          <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-3 text-center">⭐ Penilaian Keseluruhan Sesi / Overall Session Rating</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const d = overallHovered || overallStars;
              return (
                <button key={n} type="button"
                  onMouseEnter={() => setOverallHovered(n)}
                  onMouseLeave={() => setOverallHovered(0)}
                  onClick={() => setOverallStars(n === overallStars ? 0 : n)}
                  className="transition-transform hover:scale-125">
                  <Star className={`w-10 h-10 transition-colors ${n <= d ? "fill-amber-400 text-amber-400" : "text-amber-200"}`} />
                </button>
              );
            })}
          </div>
          {overallStars > 0 && (
            <p className="text-center text-sm font-bold text-amber-700 mt-2">
              {overallStars}.0 / 5.0 — {STAR_LABELS[overallStars as keyof typeof STAR_LABELS]?.id} / {STAR_LABELS[overallStars as keyof typeof STAR_LABELS]?.en}
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Section 6: Topics + Notes Bilingual ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={card}>
        <h2 className="font-semibold text-slate-800 dark:text-white">📚 Topik & Catatan</h2>

        {/* Topics taught */}
        <div>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">✅ Topik yang Diajarkan Hari Ini / Topics Taught</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">🇮🇩 Indonesia</label>
              <textarea value={topicsTaughtId} onChange={(e) => setTopicsTaughtId(e.target.value)} rows={3}
                placeholder="Phonics huruf A-Z, angka 1-10, matching warna..." className={textarea} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-500">🇬🇧 English</label>
                <button type="button" onClick={() => translate(topicsTaughtId, setTopicsTaughtEn)} className="text-xs text-sky-500 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" /> Translate
                </button>
              </div>
              <textarea value={topicsTaughtEn} onChange={(e) => setTopicsTaughtEn(e.target.value)} rows={3}
                placeholder="Phonics letters A-Z, numbers 1-10, color matching..." className={textarea} />
            </div>
          </div>
        </div>

        {/* Next topics */}
        <div>
          <p className="text-xs font-bold text-sky-600 uppercase tracking-wide mb-2">📌 Rencana Sesi Berikutnya / Next Steps</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">🇮🇩 Indonesia</label>
              <textarea value={nextTopicsId} onChange={(e) => setNextTopicsId(e.target.value)} rows={3}
                placeholder="Lanjutkan phonics konsonan, angka 11-20..." className={textarea} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-500">🇬🇧 English</label>
                <button type="button" onClick={() => translate(nextTopicsId, setNextTopicsEn)} className="text-xs text-sky-500 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" /> Translate
                </button>
              </div>
              <textarea value={nextTopicsEn} onChange={(e) => setNextTopicsEn(e.target.value)} rows={3}
                placeholder="Continue consonant phonics, numbers 11-20..." className={textarea} />
            </div>
          </div>
        </div>

        {/* Teacher notes */}
        <div>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">📝 Catatan Guru / Teacher Notes</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">🇮🇩 Indonesia</label>
              <textarea value={teacherNotesId} onChange={(e) => setTeacherNotesId(e.target.value)} rows={3}
                placeholder="Observasi tentang perkembangan anak hari ini..." className={textarea} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-500">🇬🇧 English</label>
                <button type="button" onClick={() => translate(teacherNotesId, setTeacherNotesEn)} className="text-xs text-sky-500 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" /> Translate
                </button>
              </div>
              <textarea value={teacherNotesEn} onChange={(e) => setTeacherNotesEn(e.target.value)} rows={3}
                placeholder="Observations about the child's development today..." className={textarea} />
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">💡 Saran untuk Orang Tua / Suggestions for Parents</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">🇮🇩 Indonesia</label>
              <textarea value={suggestionsId} onChange={(e) => setSuggestionsId(e.target.value)} rows={3}
                placeholder="Latihan di rumah yang bisa dilakukan orang tua..." className={textarea} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-500">🇬🇧 English</label>
                <button type="button" onClick={() => translate(suggestionsId, setSuggestionsEn)} className="text-xs text-sky-500 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" /> Translate
                </button>
              </div>
              <textarea value={suggestionsEn} onChange={(e) => setSuggestionsEn(e.target.value)} rows={3}
                placeholder="Home practice activities the parents can do..." className={textarea} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save buttons */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="flex items-center justify-end gap-4 pb-8">
        <button onClick={() => router.back()} className="px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
          Batal
        </button>
        <button onClick={handleSave} disabled={saving || !selectedStudent || !activitiesId}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Menyimpan..." : "Simpan Entri Sesi"}
        </button>
      </motion.div>
    </div>
  );
}
