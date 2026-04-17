// Database type definitions for MSA Education Portal

export type UserRole = "admin" | "teacher" | "parent";

export type StudentGrade = "Toddler" | "TK-A" | "TK-B" | "SD-1" | "SD-2" | "SD-3" | "SD-4" | "SD-5" | "SD-6";

export type StudentMood = "happy" | "neutral" | "needs_support";

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
  // Joined fields
  teacher?: Profile;
  parent?: Profile;
}

// Scoring categories for assessments
export const SCORE_CATEGORIES = [
  { key: "literacy", label_id: "Literasi & Fonik", label_en: "Literacy & Phonics", icon: "📖" },
  { key: "numeracy", label_id: "Numerasi & Matematika", label_en: "Numeracy & Math", icon: "🔢" },
  { key: "fine_motor", label_id: "Motorik Halus", label_en: "Fine Motor Skills", icon: "✏️" },
  { key: "cognitive", label_id: "Perkembangan Kognitif", label_en: "Cognitive Development", icon: "🧩" },
  { key: "social_emotional", label_id: "Sosial & Emosional", label_en: "Social & Emotional", icon: "🤝" },
  { key: "communication", label_id: "Komunikasi & Bahasa", label_en: "Communication & Language", icon: "🗣️" },
  { key: "creativity", label_id: "Kreativitas & Seni", label_en: "Creativity & Arts", icon: "🎨" },
  { key: "physical", label_id: "Perkembangan Fisik", label_en: "Physical Development", icon: "🏃" },
  { key: "independence", label_id: "Kemandirian", label_en: "Independence & Self-Help", icon: "⭐" },
  { key: "curiosity", label_id: "Rasa Ingin Tahu", label_en: "Curiosity & Exploration", icon: "🔍" },
] as const;

export type ScoreCategoryKey = typeof SCORE_CATEGORIES[number]["key"];

export type ScoreMap = Partial<Record<ScoreCategoryKey, number>>; // 1-5 stars

export interface DailyEntry {
  id: string;
  student_id: string;
  teacher_id: string;
  entry_date: string;
  meeting_number: number;
  session_title: string;
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

export interface WeeklyReport {
  id: string;
  student_id: string;
  teacher_id: string;
  week_number: number;
  year: number;
  week_start: string;
  week_end: string;
  consolidated_scores: ScoreMap;
  summary: string;
  summary_en: string;
  highlights: string;
  highlights_en: string;
  areas_to_improve: string;
  areas_to_improve_en: string;
  is_published: boolean;
  created_at: string;
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

// Star rating labels
export const STAR_LABELS = {
  1: { id: "Perlu Latihan Lagi", en: "Needs More Practice" },
  2: { id: "Berkembang", en: "Developing" },
  3: { id: "Sesuai Harapan", en: "Meeting Expectations" },
  4: { id: "Melebihi Harapan", en: "Exceeding Expectations" },
  5: { id: "Luar Biasa", en: "Outstanding" },
} as const;
