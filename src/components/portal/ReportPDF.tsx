"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type { MonthlyReport, Student, DailyEntry } from "@/lib/supabase/types";
import { SCORE_CATEGORIES, DOMAIN_CONFIG, STAR_LABELS } from "@/lib/supabase/types";

// Register local Montserrat TTF files; react-pdf needs each requested style variant.
Font.register({
  family: "Montserrat",
  fonts: [
    { src: "/fonts/Montserrat-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Montserrat-Regular.ttf", fontWeight: 400, fontStyle: "italic" },
    { src: "/fonts/Montserrat-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/Montserrat-SemiBold.ttf", fontWeight: 600, fontStyle: "italic" },
    { src: "/fonts/Montserrat-Bold.ttf", fontWeight: 700 },
    { src: "/fonts/Montserrat-Bold.ttf", fontWeight: 700, fontStyle: "italic" },
  ],
});

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  sky: "#0ea5e9",
  skyDark: "#0369a1",
  skyLight: "#e0f2fe",
  indigo: "#6366f1",
  indigoLight: "#eef2ff",
  amber: "#f59e0b",
  amberLight: "#fffbeb",
  pink: "#ec4899",
  pinkLight: "#fdf2f8",
  teal: "#14b8a6",
  tealLight: "#f0fdfa",
  green: "#10b981",
  greenLight: "#f0fdf4",
  orange: "#f97316",
  purple: "#8b5cf6",
  purpleLight: "#f5f3ff",
  rose: "#f43f5e",
  white: "#ffffff",
  dark: "#1e293b",
  mid: "#475569",
  light: "#94a3b8",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

// ─── Domain groupings — SYNCED with DOMAIN_CONFIG in types.ts ─────────────────
const DOMAINS = [
  {
    key: "language",
    label_id: "Domain 1: Bahasa, Literasi & Komunikasi",
    label_en: "Language, Literacy & Communication",
    icon: "📖", color: C.sky,
    ref: "EYFS: Literacy + C&L",
    cats: ["phonics_sounds","early_reading","writing_spelling","speaking_listening","vocabulary","english_efl"],
  },
  {
    key: "math",
    label_id: "Domain 2: Matematika & Pemikiran Logis",
    label_en: "Mathematics & Logical Thinking",
    icon: "🔢", color: C.green,
    ref: "EYFS: Mathematics",
    cats: ["number_recognition","addition_subtraction","shapes_space","logical_reasoning","patterns_sequences","time_measurement"],
  },
  {
    key: "social",
    label_id: "Domain 3: Sosial, Emosional & Karakter",
    label_en: "Personal, Social & Emotional Development",
    icon: "🤝", color: C.pink,
    ref: "EYFS: PSED + IB Learner Profile",
    cats: ["emotional_regulation","independence_initiative","self_confidence","empathy_cooperation","persistence_focus","behavior_ethics"],
  },
  {
    key: "physical",
    label_id: "Domain 4: Perkembangan Fisik & Motorik",
    label_en: "Physical & Motor Development",
    icon: "🏃", color: C.orange,
    ref: "EYFS: Physical Dev.",
    cats: ["fine_motor","hand_eye_coordination","gross_motor"],
  },
  {
    key: "creative",
    label_id: "Domain 5: Seni Kreatif, Kognitif & Eksplorasi",
    label_en: "Creative Arts, Cognitive & World Exploration",
    icon: "🎨", color: C.purple,
    ref: "EYFS: EAD + UTW | IB-PYP Inquiry",
    cats: ["creativity","curiosity_inquiry","world_understanding","problem_solving","music_rhythm","science_observation"],
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const star = (filled: boolean) => (filled ? "★" : "☆");
const stars = (val: number) =>
  Array.from({ length: 5 }, (_, i) => star(i < val)).join("");
const moodLabel = (m: string) => {
  const map: Record<string, { text: string; color: string; bg: string }> = {
    happy: { text: "😊 Senang / Happy", color: "#16a34a", bg: "#f0fdf4" },
    neutral: { text: "😐 Biasa / Neutral", color: "#d97706", bg: "#fffbeb" },
    needs_support: { text: "🤗 Perlu Dukungan / Needs Support", color: "#e11d48", bg: "#fff1f2" },
  };
  return map[m] ?? map.happy;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: { fontFamily: "Montserrat", backgroundColor: C.white, padding: 0 },

  // ── Cover
  coverPage: { backgroundColor: "#e0f2fe", flex: 1 },
  coverBand: { backgroundColor: C.sky, height: 8 },
  coverMain: { padding: 40, alignItems: "center", flex: 1 },
  coverLogoBox: {
    backgroundColor: C.sky,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    marginBottom: 18,
  },
  coverLogoText: { color: C.white, fontSize: 34, fontWeight: 700, letterSpacing: 3 },
  coverLogoSub: { color: "rgba(255,255,255,0.85)", fontSize: 8, letterSpacing: 2, marginTop: 2 },
  coverTitle: { fontSize: 24, fontWeight: 700, color: C.skyDark, textAlign: "center", marginTop: 12 },
  coverTitleId: { fontSize: 13, color: C.mid, textAlign: "center", marginTop: 3 },
  coverEmojiRow: { flexDirection: "row", gap: 10, marginTop: 18, marginBottom: 18 },
  coverEmoji: { fontSize: 28 },
  coverCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 26,
    width: "100%",
    alignItems: "center",
    borderTopWidth: 4,
    borderTopColor: C.sky,
  },
  coverAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.sky, alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  coverAvatarText: { color: C.white, fontSize: 34, fontWeight: 700 },
  coverName: { fontSize: 20, fontWeight: 700, color: C.dark },
  coverMeta: { fontSize: 11, color: C.mid, marginTop: 3 },
  coverPeriodBadge: {
    backgroundColor: C.amber, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 7,
    marginTop: 12,
  },
  coverPeriodText: { color: C.white, fontSize: 13, fontWeight: 700 },
  coverTeacher: { fontSize: 11, color: C.mid, marginTop: 10 },
  coverStatsRow: { flexDirection: "row", gap: 0, marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border, width: "100%" },
  coverStatItem: { flex: 1, alignItems: "center" },
  coverStatNum: { fontSize: 22, fontWeight: 700, color: C.sky },
  coverStatLabel: { fontSize: 8, color: C.light, marginTop: 2, textAlign: "center" },
  coverBottom: {
    backgroundColor: C.skyDark, height: 140,
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: "auto",
  },
  coverBottomIcons: { flexDirection: "row", gap: 16 },
  coverBottomIcon: { fontSize: 30 },
  coverSlogan: { fontSize: 10, color: "rgba(255,255,255,0.8)", fontStyle: "italic" },

  // ── Page Header
  pageHeader: { backgroundColor: C.sky, paddingHorizontal: 36, paddingTop: 20, paddingBottom: 14 },
  phRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  phTitle: { fontSize: 17, fontWeight: 700, color: C.white },
  phSub: { fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 3 },
  phBadge: {
    backgroundColor: "rgba(255,255,255,0.22)", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
    marginLeft: 8,
  },
  phBadgeText: { fontSize: 9, fontWeight: 600, color: C.white },

  // ── Content
  content: { paddingHorizontal: 36, paddingTop: 22, paddingBottom: 70 },

  // ── Section label
  secLabel: {
    backgroundColor: "#e0f2fe", borderRadius: 7, paddingHorizontal: 12, paddingVertical: 5,
    alignSelf: "flex-start", marginBottom: 12, borderWidth: 1, borderColor: "rgba(14,165,233,0.2)",
  },
  secLabelText: { fontSize: 10, fontWeight: 700, color: C.skyDark },

  // ── Session header
  meetBadge: {
    backgroundColor: C.amber, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: "flex-start", marginBottom: 6,
  },
  meetBadgeText: { fontSize: 9, fontWeight: 700, color: C.white },
  sessTitle: { fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 3 },
  sessMeta: { fontSize: 10, color: C.light },
  moodBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" },
  moodText: { fontSize: 9, fontWeight: 600 },

  // ── Two column
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 14 },
  col: { flex: 1 },
  flagLabel: { fontSize: 8, fontWeight: 700, color: C.light, letterSpacing: 1, marginBottom: 4 },
  langBox: { backgroundColor: C.bg, borderRadius: 9, padding: 10, borderWidth: 1, borderColor: C.border },
  langText: { fontSize: 10, color: C.dark, lineHeight: 1.65 },

  // ── Topic boxes
  topicBoxTaught: { flex: 1, backgroundColor: C.greenLight, borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.green },
  topicBoxNext: { flex: 1, backgroundColor: "#eff6ff", borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.sky },
  topicLabelTaught: { fontSize: 9, fontWeight: 700, color: C.green, marginBottom: 6 },
  topicLabelNext: { fontSize: 9, fontWeight: 700, color: C.skyDark, marginBottom: 6 },
  topicFlag: { fontSize: 8, fontWeight: 700, color: C.light, letterSpacing: 1, marginBottom: 2, marginTop: 6 },
  topicText: { fontSize: 10, color: C.dark, lineHeight: 1.6 },
  topicTextEn: { fontSize: 9.5, color: C.mid, fontStyle: "italic", lineHeight: 1.5 },
  topicDivider: { borderBottomWidth: 1, borderBottomColor: "#d1fae5", borderStyle: "dashed", marginVertical: 5 },

  // ── Photos
  photosRow: { flexDirection: "row", gap: 7, flexWrap: "wrap", marginBottom: 12 },
  photoItem: { width: 96, height: 74, borderRadius: 8, overflow: "hidden" },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },

  // ── Domain assessment
  domainHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    marginBottom: 8, borderLeftWidth: 3,
    backgroundColor: "#f8fafc",
  },
  domainIcon: { fontSize: 16 },
  domainName: { fontSize: 10, fontWeight: 700, color: C.dark },
  domainNameEn: { fontSize: 8, color: C.mid, fontStyle: "italic" },
  domainRef: { fontSize: 7, color: C.light, marginLeft: "auto" },

  skillRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  skillCard: {
    flex: 1, backgroundColor: C.bg, borderRadius: 9, paddingVertical: 10,
    paddingHorizontal: 6, alignItems: "center", borderWidth: 1, borderColor: C.border,
  },
  skillIcon: { fontSize: 17, marginBottom: 2 },
  skillName: { fontSize: 7.5, fontWeight: 700, color: C.dark, textAlign: "center", lineHeight: 1.3, marginBottom: 1 },
  skillNameEn: { fontSize: 7, color: C.mid, textAlign: "center", fontStyle: "italic", lineHeight: 1.3, marginBottom: 4 },
  skillStars: { fontSize: 10, color: C.amber },
  skillScore: { fontSize: 8, fontWeight: 700, color: C.dark, marginTop: 2 },
  skillScoreLabel: { fontSize: 7, color: C.mid },

  // ── Overall stars
  overallBox: {
    borderRadius: 12, padding: 16, alignItems: "center",
    backgroundColor: C.amberLight, borderWidth: 1, borderColor: "rgba(245,158,11,0.25)",
    marginBottom: 12,
  },
  overallStars: { fontSize: 24, color: C.amber, letterSpacing: 3 },
  overallVal: { fontSize: 13, fontWeight: 700, color: C.amber, marginTop: 3 },
  overallSub: { fontSize: 9, color: C.mid, marginTop: 2 },

  // ── Notes
  noteBoxTeacher: { flex: 1, backgroundColor: "#fefce8", borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.amber },
  noteBoxSuggest: { flex: 1, backgroundColor: "#fdf4ff", borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.indigo },
  noteLabelTeacher: { fontSize: 9, fontWeight: 700, color: "#d97706", marginBottom: 5 },
  noteLabelSuggest: { fontSize: 9, fontWeight: 700, color: C.indigo, marginBottom: 5 },
  noteText: { fontSize: 10, color: C.dark, lineHeight: 1.65 },
  noteTextEn: { fontSize: 9.5, color: C.mid, fontStyle: "italic", marginTop: 4, lineHeight: 1.55 },

  divider: { borderBottomWidth: 1, borderBottomColor: C.border, borderStyle: "dashed", marginVertical: 14 },

  // ── Summary
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 14,
    alignItems: "center", borderWidth: 1, borderColor: C.border,
  },
  statNum: { fontSize: 26, fontWeight: 700, color: C.sky },
  statLabel: { fontSize: 8, color: C.mid, textAlign: "center", marginTop: 3, lineHeight: 1.5 },

  // ── Session table
  tableHeader: { flexDirection: "row", backgroundColor: C.sky, borderRadius: 0 },
  tableHeaderText: { fontSize: 9, fontWeight: 700, color: C.white, padding: 6 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowAlt: { flexDirection: "row", backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border },
  tableCell: { fontSize: 9, color: C.dark, padding: 6, lineHeight: 1.4 },
  tableCellStar: { fontSize: 9, color: C.amber, padding: 6 },

  // ── Progress bars
  progItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  progIcon: { fontSize: 14, width: 18 },
  progInfo: { flex: 1 },
  progLabel: { fontSize: 10, fontWeight: 600, color: C.dark },
  progLabelEn: { fontSize: 8, color: C.light, fontStyle: "italic" },
  progBarWrap: { height: 8, backgroundColor: C.border, borderRadius: 999, marginTop: 3, overflow: "hidden" },
  progBar: { height: 8, borderRadius: 999 },
  progVal: { fontSize: 10, fontWeight: 700, color: C.dark, width: 28, textAlign: "right" },

  // ── Summary cards
  sumCard: {
    borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.border,
    borderLeftWidth: 4, marginBottom: 10,
  },
  sumCardTitle: { fontSize: 10, fontWeight: 700, marginBottom: 5 },
  sumCardText: { fontSize: 10, color: C.dark, lineHeight: 1.7 },
  sumCardTextEn: { fontSize: 9.5, color: C.mid, fontStyle: "italic", marginTop: 4, lineHeight: 1.6 },

  // ── Signature
  sigRow: { flexDirection: "row", gap: 20, marginTop: 14 },
  sigItem: { flex: 1, alignItems: "center" },
  sigLine: { height: 40, borderBottomWidth: 1.5, borderBottomColor: "#cbd5e1", width: "100%", marginBottom: 5, alignItems: "center", justifyContent: "flex-end" },
  sigName: { fontSize: 9, fontWeight: 700, color: C.mid, textAlign: "center" },
  sigRole: { fontSize: 8, color: C.light, textAlign: "center" },

  // ── Legend
  legendRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  legendStars: { fontSize: 13, color: C.amber, width: 80 },
  legendId: { fontSize: 10, fontWeight: 700, color: C.dark },
  legendEn: { fontSize: 9, color: C.mid, fontStyle: "italic" },
  legendDesc: { fontSize: 8.5, color: C.light, marginTop: 2 },
  domainLegendItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 9, borderRadius: 9, marginBottom: 8, borderLeftWidth: 3 },
  dlIcon: { fontSize: 18 },
  dlId: { fontSize: 10, fontWeight: 700, color: C.dark },
  dlEn: { fontSize: 8.5, color: C.mid, fontStyle: "italic" },

  // ── Brand footer box
  brandBox: {
    borderRadius: 16, padding: 20, alignItems: "center",
    backgroundColor: "#e0f2fe", borderWidth: 1, borderColor: "rgba(14,165,233,0.2)",
  },
  brandTitle: { fontSize: 26, fontWeight: 700, color: C.skyDark, letterSpacing: 3 },
  brandSub: { fontSize: 9, fontWeight: 700, color: C.sky, letterSpacing: 2, marginTop: 2 },
  brandQuote: { fontSize: 11, color: C.mid, fontStyle: "italic", marginTop: 8 },
  brandContact: { fontSize: 9, color: C.light, marginTop: 10, textAlign: "center", lineHeight: 1.6 },
  brandRef: { fontSize: 8, color: C.light, marginTop: 6 },

  // ── Footer
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 36, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.white,
  },
  footerText: { fontSize: 8, color: C.light },
});

// ─── Footer Component ──────────────────────────────────────────────────────────
function Footer({ name, period, page }: { name: string; period: string; page: number | string }) {
  return (
    <View style={S.footer}>
      <Text style={S.footerText}>MSA Education • Mindful · Supportive · Adaptive</Text>
      <Text style={S.footerText}>{name} — {period}</Text>
      <Text style={S.footerText}>Hal {page}</Text>
    </View>
  );
}

// ─── Cover Page ────────────────────────────────────────────────────────────────
function CoverPage({ student, report, entries }: { student: Student; report: MonthlyReport; entries: DailyEntry[] }) {
  const initial = (student.nickname || student.full_name).charAt(0).toUpperCase();
  const avgStars = entries.length > 0
    ? (entries.reduce((s, e) => s + e.overall_stars, 0) / entries.length).toFixed(1)
    : "—";

  return (
    <Page size="A4" style={[S.page, S.coverPage]}>
      <View style={S.coverBand} />
      <View style={S.coverMain}>
        <View style={S.coverLogoBox}>
          <Text style={S.coverLogoText}>MSA</Text>
          <Text style={S.coverLogoSub}>MINDFUL · SUPPORTIVE · ADAPTIVE</Text>
        </View>
        <Text style={S.coverTitle}>Monthly Learning Journal</Text>
        <Text style={S.coverTitleId}>Jurnal Perkembangan Belajar Bulanan</Text>
        <View style={S.coverEmojiRow}>
          {["📚", "✏️", "🌟", "🧩", "🎨", "🔬", "🎵"].map((e, i) => (
            <Text key={i} style={S.coverEmoji}>{e}</Text>
          ))}
        </View>
        <View style={S.coverCard}>
          <View style={S.coverAvatar}>
            <Text style={S.coverAvatarText}>{initial}</Text>
          </View>
          <Text style={S.coverName}>{student.full_name}</Text>
          <Text style={S.coverMeta}>
            {student.nickname ? `"${student.nickname}" • ` : ""}{student.grade_level}
            {student.date_of_birth ? ` • Lahir: ${new Date(student.date_of_birth).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : ""}
          </Text>
          <View style={S.coverPeriodBadge}>
            <Text style={S.coverPeriodText}>📅 {report.period_label}</Text>
          </View>
          <Text style={S.coverTeacher}>👩‍🏫 Tutor: {student.teacher?.full_name ?? "MSA Education Teacher"}</Text>
          <View style={S.coverStatsRow}>
            <View style={S.coverStatItem}>
              <Text style={S.coverStatNum}>{report.total_meetings}</Text>
              <Text style={S.coverStatLabel}>Total Sesi{"\n"}Sessions</Text>
            </View>
            <View style={S.coverStatItem}>
              <Text style={[S.coverStatNum, { color: C.amber, fontSize: 16 }]}>
                {stars(Math.round(parseFloat(String(avgStars)) || 0))}{"\n"}{avgStars}/5
              </Text>
              <Text style={S.coverStatLabel}>Avg Rating</Text>
            </View>
            <View style={S.coverStatItem}>
              <Text style={[S.coverStatNum, { color: C.green }]}>{report.attendance_rate ?? 100}%</Text>
              <Text style={S.coverStatLabel}>Kehadiran{"\n"}Attendance</Text>
            </View>
            <View style={S.coverStatItem}>
              <Text style={[S.coverStatNum, { color: C.purple }]}>{entries.length}</Text>
              <Text style={S.coverStatLabel}>Catatan Sesi{"\n"}Entries</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={S.coverBottom}>
        <View style={S.coverBottomIcons}>
          {["📖", "🌈", "⭐", "🎯", "💡", "🏆"].map((e, i) => (
            <Text key={i} style={S.coverBottomIcon}>{e}</Text>
          ))}
        </View>
        <Text style={S.coverSlogan}>"Every Mind Matters, Every Child Shines."</Text>
      </View>
    </Page>
  );
}

// ─── Session Entry Page ────────────────────────────────────────────────────────
function EntryPage({ entry, student, report, pageNum }: {
  entry: DailyEntry; student: Student; report: MonthlyReport; pageNum: number;
}) {
  const mood = moodLabel(entry.mood);
  const date = new Date(entry.entry_date).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  // Compute domain averages for this entry
  const domainAvg = DOMAINS.map(d => {
    const vals = d.cats.map(k => (entry.scores as Record<string, number>)?.[k] || 0).filter(v => v > 0);
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { ...d, avg };
  });

  return (
    <Page size="A4" style={S.page}>
      {/* Header */}
      <View style={[S.pageHeader, { backgroundColor: C.sky }]}>
        <View style={S.phRow}>
          <View style={{ flex: 1 }}>
            <Text style={S.phTitle}>
              {entry.session_title || `Sesi ke-${entry.meeting_number}`}
            </Text>
            <Text style={S.phSub}>
              {student.full_name} • {report.period_label} | Sesi {entry.meeting_number} dari {report.total_meetings}
            </Text>
          </View>
          <View style={S.phBadge}>
            <Text style={S.phBadgeText}>Lap. Bulanan {report.period_label}</Text>
          </View>
        </View>
      </View>

      <View style={S.content}>
        {/* Session header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <View style={S.meetBadge}>
              <Text style={S.meetBadgeText}>📌 SESI {entry.meeting_number} — {date}</Text>
            </View>
            <Text style={S.sessTitle}>{entry.session_title || `Pertemuan ke-${entry.meeting_number}`}</Text>
            <Text style={S.sessMeta}>Bag. dari {report.total_meetings} Sesi Bulan {report.period_label}</Text>
          </View>
          <View style={[S.moodBadge, { backgroundColor: mood.bg }]}>
            <Text style={[S.moodText, { color: mood.color }]}>{mood.text}</Text>
          </View>
        </View>

        {/* Activities — bilingual */}
        <View style={S.secLabel}><Text style={S.secLabelText}>📝 Deskripsi Kegiatan / Activities Description</Text></View>
        <View style={[S.twoCol, { marginBottom: 14 }]}>
          <View style={S.col}>
            <Text style={S.flagLabel}>🇮🇩 BAHASA INDONESIA</Text>
            <View style={S.langBox}>
              <Text style={S.langText}>{entry.activities_description}</Text>
            </View>
          </View>
          <View style={S.col}>
            <Text style={S.flagLabel}>🇬🇧 ENGLISH</Text>
            <View style={S.langBox}>
              <Text style={S.langText}>{entry.activities_description_en || entry.activities_description}</Text>
            </View>
          </View>
        </View>

        {/* Topics — bilingual */}
        {(entry.topics_taught || entry.next_topics) && (
          <>
            <View style={S.secLabel}><Text style={S.secLabelText}>📚 Topik Dipelajari & Rencana Selanjutnya / Topics & Next Steps</Text></View>
            <View style={[S.twoCol, { marginBottom: 14 }]}>
              {entry.topics_taught && (
                <View style={S.topicBoxTaught}>
                  <Text style={S.topicLabelTaught}>✅ Topik Diajarkan / Topics Taught</Text>
                  <Text style={S.flagLabel}>🇮🇩 INDONESIA</Text>
                  <Text style={S.topicText}>{entry.topics_taught}</Text>
                  {entry.topics_taught_en && (
                    <>
                      <View style={S.topicDivider} />
                      <Text style={S.flagLabel}>🇬🇧 ENGLISH</Text>
                      <Text style={S.topicTextEn}>{entry.topics_taught_en}</Text>
                    </>
                  )}
                </View>
              )}
              {entry.next_topics && (
                <View style={S.topicBoxNext}>
                  <Text style={S.topicLabelNext}>📌 Rencana Selanjutnya / Next Steps</Text>
                  <Text style={S.flagLabel}>🇮🇩 INDONESIA</Text>
                  <Text style={S.topicText}>{entry.next_topics}</Text>
                  {entry.next_topics_en && (
                    <>
                      <View style={S.topicDivider} />
                      <Text style={S.flagLabel}>🇬🇧 ENGLISH</Text>
                      <Text style={S.topicTextEn}>{entry.next_topics_en}</Text>
                    </>
                  )}
                </View>
              )}
            </View>
          </>
        )}

        {/* Photos */}
        {entry.photo_urls && entry.photo_urls.length > 0 && (
          <>
            <View style={S.secLabel}><Text style={S.secLabelText}>📸 Dokumentasi Kegiatan Belajar</Text></View>
            <View style={S.photosRow}>
              {entry.photo_urls.slice(0, 5).map((url, i) => (
                <View key={i} style={S.photoItem}>
                  <Image src={url} style={S.photoImg} />
                </View>
              ))}
            </View>
          </>
        )}

        <View style={S.divider} />

        {/* Assessment by domain */}
        <View style={S.secLabel}>
          <Text style={S.secLabelText}>⭐ Penilaian Perkembangan — Standar Internasional EYFS & IB-PYP</Text>
        </View>

        {domainAvg.map((domain) => {
          const cats = SCORE_CATEGORIES.filter(c => (domain.cats as readonly string[]).includes(c.key));
          const hasCats = cats.some(c => (entry.scores as Record<string, number>)?.[c.key]);
          if (!hasCats) return null;
          return (
            <View key={domain.key} style={{ marginBottom: 12 }}>
              {/* Domain header */}
              <View style={[S.domainHeader, { borderLeftColor: domain.color }]}>
                <Text style={S.domainIcon}>{domain.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={S.domainName}>{domain.label_id}</Text>
                  <Text style={S.domainNameEn}>{domain.label_en}</Text>
                </View>
                <Text style={S.domainRef}>{domain.ref}</Text>
              </View>
              {/* Skill cards */}
              <View style={S.skillRow}>
                {cats.map(cat => {
                  const val = (entry.scores as Record<string, number>)?.[cat.key] || 0;
                  if (!val) return null;
                  const label = STAR_LABELS[val as keyof typeof STAR_LABELS];
                  return (
                    <View key={cat.key} style={S.skillCard}>
                      <Text style={S.skillIcon}>{cat.icon}</Text>
                      <Text style={S.skillName}>{cat.label_id}</Text>
                      <Text style={S.skillNameEn}>{cat.label_en}</Text>
                      <Text style={S.skillStars}>{stars(val)}</Text>
                      <Text style={S.skillScore}>{val} / 5</Text>
                      {label && <Text style={S.skillScoreLabel}>{label.id}</Text>}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Overall stars */}
        {entry.overall_stars > 0 && (
          <View style={S.overallBox}>
            <Text style={S.overallStars}>{stars(entry.overall_stars)}</Text>
            <Text style={S.overallVal}>
              {STAR_LABELS[entry.overall_stars as keyof typeof STAR_LABELS]?.id} / {STAR_LABELS[entry.overall_stars as keyof typeof STAR_LABELS]?.en} ✨
            </Text>
            <Text style={S.overallSub}>Score: {entry.overall_stars}.0 / 5.0 — Overall Session Rating</Text>
          </View>
        )}

        <View style={S.divider} />

        {/* Notes & Suggestions */}
        {(entry.teacher_notes || entry.suggestions) && (
          <>
            <View style={S.secLabel}><Text style={S.secLabelText}>💬 Catatan Guru & Saran Orang Tua</Text></View>
            <View style={S.twoCol}>
              {entry.teacher_notes && (
                <View style={S.noteBoxTeacher}>
                  <Text style={S.noteLabelTeacher}>📝 Catatan Guru / Teacher Notes</Text>
                  <Text style={S.noteText}>{entry.teacher_notes}</Text>
                  {entry.teacher_notes_en && <Text style={S.noteTextEn}>{entry.teacher_notes_en}</Text>}
                </View>
              )}
              {entry.suggestions && (
                <View style={S.noteBoxSuggest}>
                  <Text style={S.noteLabelSuggest}>💡 Saran Orang Tua / Suggestions for Parents</Text>
                  <Text style={S.noteText}>{entry.suggestions}</Text>
                  {entry.suggestions_en && <Text style={S.noteTextEn}>{entry.suggestions_en}</Text>}
                </View>
              )}
            </View>
          </>
        )}
      </View>

      <Footer name={student.full_name} period={report.period_label} page={pageNum} />
    </Page>
  );
}

// ─── Monthly Summary Page ─────────────────────────────────────────────────────
function SummaryPage({ student, report, entries, pageNum }: {
  student: Student; report: MonthlyReport; entries: DailyEntry[]; pageNum: number;
}) {
  const avgStars = entries.length > 0
    ? Math.round(entries.reduce((s, e) => s + e.overall_stars, 0) / entries.length)
    : 0;

  // Compute domain averages across all entries
  const domainAverages = DOMAINS.map(d => {
    const allVals: number[] = [];
    entries.forEach(e => {
      d.cats.forEach(k => {
        const v = (e.scores as Record<string, number>)?.[k];
        if (v) allVals.push(v);
      });
    });
    const avg = allVals.length > 0 ? allVals.reduce((a, b) => a + b, 0) / allVals.length : 0;
    return { ...d, avg: Math.round(avg * 10) / 10 };
  });

  const moodLookup: Record<string, string> = { happy: "Senang 😊", neutral: "Biasa 😐", needs_support: "Perlu Dukungan 🤗" };

  return (
    <Page size="A4" style={S.page}>
      <View style={[S.pageHeader, { backgroundColor: C.indigo }]}>
        <View style={S.phRow}>
          <View style={{ flex: 1 }}>
            <Text style={S.phTitle}>📊 Ringkasan Bulanan / Monthly Summary</Text>
            <Text style={S.phSub}>{student.full_name} • {report.period_label} | {report.total_meetings} Sesi | {student.teacher?.full_name ?? "MSA Teacher"}</Text>
          </View>
          <View style={S.phBadge}><Text style={S.phBadgeText}>Laporan Akhir Bulan</Text></View>
        </View>
      </View>

      <View style={S.content}>
        {/* Stats */}
        <View style={S.statsRow}>
          <View style={S.statCard}>
            <Text style={S.statNum}>{report.total_meetings}</Text>
            <Text style={S.statLabel}>Total Sesi{"\n"}Total Sessions</Text>
          </View>
          <View style={S.statCard}>
            <Text style={[S.statNum, { fontSize: 16, color: C.amber }]}>{stars(avgStars)}{"\n"}{avgStars}/5</Text>
            <Text style={S.statLabel}>Rata-rata Rating{"\n"}Average Rating</Text>
          </View>
          <View style={S.statCard}>
            <Text style={[S.statNum, { color: C.green }]}>{report.attendance_rate ?? 100}%</Text>
            <Text style={S.statLabel}>Kehadiran{"\n"}Attendance</Text>
          </View>
          <View style={S.statCard}>
            <Text style={[S.statNum, { color: C.purple }]}>{entries.length}</Text>
            <Text style={S.statLabel}>Entri Tercatat{"\n"}Entries Logged</Text>
          </View>
        </View>

        {/* All Sessions Table */}
        <View style={S.secLabel}><Text style={S.secLabelText}>📋 Rangkuman Semua Sesi / All Sessions Summary</Text></View>
        <View style={{ marginBottom: 14, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: C.border }}>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderText, { width: 22 }]}>#</Text>
            <Text style={[S.tableHeaderText, { flex: 1.2 }]}>Tanggal</Text>
            <Text style={[S.tableHeaderText, { flex: 2 }]}>Topik / Judul Sesi</Text>
            <Text style={[S.tableHeaderText, { width: 50 }]}>Mood</Text>
            <Text style={[S.tableHeaderText, { width: 60 }]}>Rating</Text>
          </View>
          {entries.map((e, i) => (
            <View key={e.id} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
              <Text style={[S.tableCell, { width: 22, fontWeight: 700 }]}>{e.meeting_number}</Text>
              <Text style={[S.tableCell, { flex: 1.2 }]}>
                {new Date(e.entry_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" })}
              </Text>
              <Text style={[S.tableCell, { flex: 2 }]}>{e.topics_taught || e.session_title || "—"}</Text>
              <Text style={[S.tableCell, { width: 50 }]}>{moodLookup[e.mood] ?? "—"}</Text>
              <Text style={[S.tableCellStar, { width: 60 }]}>{stars(e.overall_stars)} {e.overall_stars}.0</Text>
            </View>
          ))}
        </View>

        {/* Progress bars by domain */}
        <View style={S.secLabel}><Text style={S.secLabelText}>📈 Perkembangan per Domain / Progress by Domain</Text></View>
        <View style={{ marginBottom: 14 }}>
          {domainAverages.map(d => (
            <View key={d.key} style={S.progItem}>
              <Text style={S.progIcon}>{d.icon}</Text>
              <View style={S.progInfo}>
                <Text style={S.progLabel}>{d.label_id}</Text>
                <Text style={S.progLabelEn}>{d.label_en}</Text>
                <View style={S.progBarWrap}>
                  <View style={[S.progBar, { width: `${(d.avg / 5) * 100}%`, backgroundColor: d.color }]} />
                </View>
              </View>
              <Text style={S.progVal}>{d.avg > 0 ? d.avg.toFixed(1) : "—"}</Text>
            </View>
          ))}
        </View>

        <View style={S.divider} />

        {/* Summary cards */}
        <View style={S.secLabel}><Text style={S.secLabelText}>📋 Evaluasi Bulanan Lengkap / Complete Evaluation</Text></View>
        {[
          { label: "📝 Ringkasan / Summary", textId: report.summary, textEn: report.summary_en, color: C.sky },
          { label: "🏆 Pencapaian / Achievements", textId: report.achievements, textEn: report.achievements_en, color: C.green },
          { label: "💡 Rekomendasi Orang Tua / Parent Recommendations", textId: report.recommendations, textEn: report.recommendations_en, color: C.amber },
          { label: "🎯 Target Bulan Depan / Next Month Goals", textId: report.goals_next_month, textEn: report.goals_next_month_en, color: C.indigo },
        ].map(item => {
          if (!item.textId && !item.textEn) return null;
          return (
            <View key={item.label} style={[S.sumCard, { borderLeftColor: item.color }]}>
              <Text style={[S.sumCardTitle, { color: item.color }]}>{item.label}</Text>
              {item.textId && <Text style={S.sumCardText}>{item.textId}</Text>}
              {item.textEn && <Text style={S.sumCardTextEn}>{item.textEn}</Text>}
            </View>
          );
        })}

        {/* Signature */}
        <View style={S.divider} />
        <View style={S.sigRow}>
          <View style={S.sigItem}>
            <View style={S.sigLine} />
            <Text style={S.sigName}>{student.teacher?.full_name ?? "Tutor / Guru MSA"}</Text>
            <Text style={S.sigRole}>Tutor / Guru MSA</Text>
          </View>
          <View style={S.sigItem}>
            <View style={S.sigLine} />
            <Text style={S.sigName}>Orang Tua / Wali</Text>
            <Text style={S.sigRole}>Parent / Legal Guardian</Text>
          </View>
          <View style={S.sigItem}>
            <View style={[S.sigLine, { alignItems: "center", justifyContent: "center" }]}>
              <Text style={{ fontSize: 22 }}>🏫</Text>
            </View>
            <Text style={[S.sigName, { color: C.sky }]}>MSA Education</Text>
            <Text style={S.sigRole}>Kepala Sekolah / Principal</Text>
          </View>
        </View>
      </View>

      <Footer name={student.full_name} period={report.period_label} page={pageNum} />
    </Page>
  );
}

// ─── Legend Page ───────────────────────────────────────────────────────────────
function LegendPage({ student, report, pageNum }: { student: Student; report: MonthlyReport; pageNum: number }) {
  return (
    <Page size="A4" style={S.page}>
      <View style={[S.pageHeader, { backgroundColor: C.teal }]}>
        <Text style={S.phTitle}>📖 Panduan Penilaian / Assessment Guide</Text>
        <Text style={S.phSub}>Cara membaca laporan ini — How to read this report</Text>
      </View>

      <View style={S.content}>
        {/* Star legend */}
        <View style={S.secLabel}><Text style={S.secLabelText}>⭐ Arti Bintang / Star Rating Legend</Text></View>
        {([5, 4, 3, 2, 1] as const).map(n => (
          <View key={n} style={[S.legendRow, n === 1 ? { borderBottomWidth: 0 } : {}]}>
            <Text style={S.legendStars}>{stars(n)}</Text>
            <View>
              <Text style={S.legendId}>{STAR_LABELS[n].id}</Text>
              <Text style={S.legendEn}>{STAR_LABELS[n].en} — {n}.0 / 5.0</Text>
              <Text style={S.legendDesc}>
                {n === 5 && "Sangat menguasai, jauh melampaui ekspektasi usia / Exceptional mastery"}
                {n === 4 && "Percaya diri, hanya minor errors / Demonstrates skill with confidence"}
                {n === 3 && "Perkembangan sesuai usia/level / On track for age and grade level"}
                {n === 2 && "Mulai menunjukkan kemampuan, perlu latihan / Beginning stages, needs practice"}
                {n === 1 && "Baru diperkenalkan, butuh pengulangan / Just introduced, significant scaffolding needed"}
              </Text>
            </View>
          </View>
        ))}

        <View style={S.divider} />

        {/* Domain legend */}
        <View style={S.secLabel}><Text style={S.secLabelText}>🗂️ 5 Domain Penilaian Internasional (EYFS + IB-PYP)</Text></View>
        {DOMAINS.map(d => (
          <View key={d.key} style={[S.domainLegendItem, { backgroundColor: C.bg, borderLeftColor: d.color }]}>
            <Text style={S.dlIcon}>{d.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={S.dlId}>{d.label_id}</Text>
              <Text style={S.dlEn}>{d.label_en} — {d.ref}</Text>
            </View>
          </View>
        ))}

        {/* Score categories */}
        <View style={S.divider} />
        <View style={S.secLabel}><Text style={S.secLabelText}>📊 Semua Sub-Kategori Penilaian</Text></View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {SCORE_CATEGORIES.map(cat => (
            <View key={cat.key} style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.bg, borderRadius: 8, padding: 7, borderWidth: 1, borderColor: C.border, width: "47%" }}>
              <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
              <View>
                <Text style={{ fontSize: 9, fontWeight: 700, color: C.dark }}>{cat.label_id}</Text>
                <Text style={{ fontSize: 8, color: C.mid, fontStyle: "italic" }}>{cat.label_en}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[S.divider, { marginTop: 16 }]} />

        {/* Brand */}
        <View style={S.brandBox}>
          <Text style={S.brandTitle}>MSA</Text>
          <Text style={S.brandSub}>MINDFUL · SUPPORTIVE · ADAPTIVE</Text>
          <Text style={S.brandQuote}>"Every Mind Matters, Every Child Shines."</Text>
          <Text style={S.brandContact}>
            📧 msa.education@gmail.com  |  📱 WhatsApp: +62 xxx-xxxx-xxxx{"\n"}
            🌐 msa-education.vercel.app  |  Jakarta, Indonesia
          </Text>
          <Text style={S.brandRef}>
            Mengacu pada standar: EYFS (UK Gov.) | IB Primary Years Programme | Kurikulum Merdeka Indonesia
          </Text>
        </View>
      </View>

      <Footer name={student.full_name} period={report.period_label} page={pageNum} />
    </Page>
  );
}

// ─── Main Document ─────────────────────────────────────────────────────────────
interface Props {
  report: MonthlyReport;
  student: Student;
  entries: DailyEntry[];
}

export default function ReportPDF({ report, student, entries }: Props) {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );

  return (
    <Document
      title={`MSA Learning Journal — ${student.full_name} — ${report.period_label}`}
      author="MSA Education"
      subject={`Monthly Learning Journal ${report.period_label}`}
      keywords="MSA Education, Learning Journal, Tutoring, Homeschooling"
    >
      {/* 1. Cover */}
      <CoverPage student={student} report={report} entries={sortedEntries} />

      {/* 2. Legend / Guide */}
      <LegendPage student={student} report={report} pageNum={2} />

      {/* 3–N. One page per session entry (Opsi A) */}
      {sortedEntries.map((entry, i) => (
        <EntryPage
          key={entry.id}
          entry={entry}
          student={student}
          report={report}
          pageNum={i + 3}
        />
      ))}

      {/* Last: Monthly Summary */}
      <SummaryPage
        student={student}
        report={report}
        entries={sortedEntries}
        pageNum={sortedEntries.length + 3}
      />
    </Document>
  );
}
