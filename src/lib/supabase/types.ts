// ─── Database type definitions for MSA Education Portal ──────────────────────

export type UserRole = "admin" | "teacher" | "parent";

export type StudentGrade =
  | "Toddler" | "TK-A" | "TK-B"
  | "SD-1" | "SD-2" | "SD-3" | "SD-4" | "SD-5" | "SD-6";

export type StudentMood = "happy" | "neutral" | "needs_support";

export type DomainKey = "language" | "math" | "social" | "physical" | "creative";

// ─── 5 DOMAIN CONFIG (EYFS + IB-PYP International Standard) ─────────────────
export const DOMAIN_CONFIG = [
  {
    key: "language" as const,
    icon: "📖",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    label_id: "Domain 1: Bahasa, Literasi & Komunikasi",
    label_en: "Language, Literacy & Communication",
    ref: "EYFS: Literacy + C&L",
  },
  {
    key: "math" as const,
    icon: "🔢",
    color: "#10b981",
    bg: "#f0fdf4",
    label_id: "Domain 2: Matematika & Pemikiran Logis",
    label_en: "Mathematics & Logical Thinking",
    ref: "EYFS: Mathematics",
  },
  {
    key: "social" as const,
    icon: "🤝",
    color: "#ec4899",
    bg: "#fdf2f8",
    label_id: "Domain 3: Sosial, Emosional & Karakter",
    label_en: "Personal, Social & Emotional Development",
    ref: "EYFS: PSED + IB Learner Profile",
  },
  {
    key: "physical" as const,
    icon: "🏃",
    color: "#f97316",
    bg: "#fff7ed",
    label_id: "Domain 4: Perkembangan Fisik & Motorik",
    label_en: "Physical & Motor Development",
    ref: "EYFS: Physical Dev.",
  },
  {
    key: "creative" as const,
    icon: "🎨",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    label_id: "Domain 5: Seni Kreatif, Kognitif & Eksplorasi",
    label_en: "Creative Arts, Cognitive & World Exploration",
    ref: "EYFS: EAD + UTW | IB-PYP Inquiry",
  },
] as const;

// ─── 27 SKILL CATEGORIES (grouped by domain) ─────────────────────────────────
export const SCORE_CATEGORIES = [
  // Domain 1 — Language (6 skills)
  { key: "phonics_sounds",       domain: "language" as DomainKey, label_id: "Fonik & Bunyi Huruf",            label_en: "Phonics & Letter Sounds",    icon: "🔤" },
  { key: "early_reading",        domain: "language" as DomainKey, label_id: "Kemampuan Membaca Awal",         label_en: "Early Reading Skills",        icon: "📖" },
  { key: "writing_spelling",     domain: "language" as DomainKey, label_id: "Menulis & Ejaan",                label_en: "Writing & Spelling",          icon: "✍️" },
  { key: "speaking_listening",   domain: "language" as DomainKey, label_id: "Berbicara & Mendengar",          label_en: "Speaking & Listening",        icon: "🗣️" },
  { key: "vocabulary",           domain: "language" as DomainKey, label_id: "Kosa Kata & Bahasa",             label_en: "Vocabulary & Language",       icon: "💬" },
  { key: "english_efl",          domain: "language" as DomainKey, label_id: "Bahasa Inggris (EFL)",           label_en: "English as Foreign Lang.",    icon: "🌐" },
  // Domain 2 — Math (6 skills)
  { key: "number_recognition",   domain: "math" as DomainKey,     label_id: "Pengenalan Angka",               label_en: "Number Recognition",          icon: "🔢" },
  { key: "addition_subtraction", domain: "math" as DomainKey,     label_id: "Penjumlahan & Pengurangan",      label_en: "Addition & Subtraction",      icon: "➕" },
  { key: "shapes_space",         domain: "math" as DomainKey,     label_id: "Bentuk & Ruang",                 label_en: "Shape & Space",               icon: "📐" },
  { key: "logical_reasoning",    domain: "math" as DomainKey,     label_id: "Pemikiran Logis",                label_en: "Logical Reasoning",           icon: "🧠" },
  { key: "patterns_sequences",   domain: "math" as DomainKey,     label_id: "Pola & Urutan",                  label_en: "Patterns & Sequences",        icon: "🔷" },
  { key: "time_measurement",     domain: "math" as DomainKey,     label_id: "Konsep Waktu & Pengukuran",      label_en: "Time & Measurement",          icon: "⏱️" },
  // Domain 3 — Social/Emotional (6 skills)
  { key: "emotional_regulation", domain: "social" as DomainKey,   label_id: "Regulasi Emosi",                 label_en: "Emotional Regulation",        icon: "😊" },
  { key: "independence_initiative", domain: "social" as DomainKey, label_id: "Kemandirian & Inisiatif",       label_en: "Independence & Initiative",   icon: "⭐" },
  { key: "self_confidence",      domain: "social" as DomainKey,   label_id: "Kepercayaan Diri",               label_en: "Self-Confidence",             icon: "💪" },
  { key: "empathy_cooperation",  domain: "social" as DomainKey,   label_id: "Empati & Kerjasama",             label_en: "Empathy & Cooperation",       icon: "🤝" },
  { key: "persistence_focus",    domain: "social" as DomainKey,   label_id: "Ketekunan & Fokus",              label_en: "Persistence & Focus",         icon: "🎯" },
  { key: "behavior_ethics",      domain: "social" as DomainKey,   label_id: "Perilaku & Etika",               label_en: "Behavior & Ethics",           icon: "🌟" },
  // Domain 4 — Physical (3 skills)
  { key: "fine_motor",           domain: "physical" as DomainKey, label_id: "Motorik Halus (Menulis/Menggambar)", label_en: "Fine Motor (Writing/Drawing)", icon: "✏️" },
  { key: "hand_eye_coordination",domain: "physical" as DomainKey, label_id: "Koordinasi Tangan-Mata",         label_en: "Hand-Eye Coordination",       icon: "✂️" },
  { key: "gross_motor",          domain: "physical" as DomainKey, label_id: "Motorik Kasar & Gerak",          label_en: "Gross Motor & Movement",      icon: "🏃" },
  // Domain 5 — Creative (6 skills)
  { key: "creativity",           domain: "creative" as DomainKey, label_id: "Kreativitas & Seni",             label_en: "Creativity & Arts",           icon: "🎨" },
  { key: "curiosity_inquiry",    domain: "creative" as DomainKey, label_id: "Rasa Ingin Tahu & Eksplorasi",   label_en: "Curiosity & Inquiry",         icon: "🔍" },
  { key: "world_understanding",  domain: "creative" as DomainKey, label_id: "Pemahaman Dunia Sekitar",        label_en: "Understanding the World",     icon: "🌍" },
  { key: "problem_solving",      domain: "creative" as DomainKey, label_id: "Pemecahan Masalah",              label_en: "Problem Solving",             icon: "🧩" },
  { key: "music_rhythm",         domain: "creative" as DomainKey, label_id: "Musik & Ritme",                  label_en: "Music & Rhythm",              icon: "🎵" },
  { key: "science_observation",  domain: "creative" as DomainKey, label_id: "Sains Dasar & Observasi",        label_en: "Basic Science & Observation", icon: "🔬" },
] as const;

export type ScoreCategoryKey = typeof SCORE_CATEGORIES[number]["key"];
export type ScoreMap = Partial<Record<ScoreCategoryKey, number>>;

// ─── Star Rating Labels ───────────────────────────────────────────────────────
export const STAR_LABELS = {
  1: { id: "Perlu Latihan Lagi",  en: "Needs More Practice" },
  2: { id: "Berkembang",          en: "Developing" },
  3: { id: "Sesuai Harapan",      en: "Meeting Expectations" },
  4: { id: "Melebihi Harapan",    en: "Exceeding Expectations" },
  5: { id: "Luar Biasa!",         en: "Outstanding!" },
} as const;

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  email: string;
  whatsapp: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  nickname: string;
  date_of_birth: string | null;
  grade_level: StudentGrade;
  photo_url: string | null;
  teacher_id: string;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  // Joined
  teacher?: Profile;
  parent?: Profile;
}

export interface DailyEntry {
  id: string;
  student_id: string;
  teacher_id: string;
  entry_date: string;
  meeting_number: number;
  session_title: string;
  session_duration: number | null;        // 60 | 90 | 120 minutes
  session_location: string | null;        // "Home Visit" | "Online" | "MSA Center"
  activities_description: string;
  activities_description_en: string;
  scores: ScoreMap;
  teacher_notes: string;
  teacher_notes_en: string;
  suggestions: string;
  suggestions_en: string;
  topics_taught: string;
  topics_taught_en: string;
  next_topics: string;
  next_topics_en: string;
  mood: StudentMood;
  overall_stars: number;
  photo_urls: string[];
  created_at: string;
  // Joined
  student?: Student;
}

export interface MonthlyReport {
  id: string;
  student_id: string;
  teacher_id: string;
  month: number;
  year: number;
  period_label: string;
  consolidated_scores: ScoreMap;
  summary: string;
  summary_en: string;
  recommendations: string;
  recommendations_en: string;
  achievements: string;
  achievements_en: string;
  goals_next_month: string;
  goals_next_month_en: string;
  total_meetings: number;
  attendance_rate: number;
  is_published: boolean;
  created_at: string;
  student?: Student;
  daily_entries?: DailyEntry[];
}
