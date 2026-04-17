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
import { SCORE_CATEGORIES, STAR_LABELS } from "@/lib/supabase/types";

// Register fonts
Font.register({
  family: "Poppins",
  fonts: [
    { src: "https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJbecmNE.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2", fontWeight: 700 },
  ],
});

// Color palette
const COLORS = {
  primary: "#0ea5e9",
  primaryDark: "#0369a1",
  secondary: "#6366f1",
  accent: "#f59e0b",
  pink: "#ec4899",
  teal: "#14b8a6",
  bg: "#f0f9ff",
  bgPink: "#fdf2f8",
  bgAmber: "#fffbeb",
  white: "#ffffff",
  dark: "#1e293b",
  mid: "#475569",
  light: "#94a3b8",
  veryLight: "#f1f5f9",
  border: "#e2e8f0",
  green: "#10b981",
  orange: "#f97316",
  rose: "#f43f5e",
};

const star = (filled: boolean) => filled ? "★" : "☆";

const styles = StyleSheet.create({
  page: { fontFamily: "Poppins", backgroundColor: COLORS.white, padding: 0 },

  // Cover
  coverPage: { backgroundColor: COLORS.bg, padding: 0, position: "relative" },
  coverTopBand: { backgroundColor: COLORS.primary, height: 8 },
  coverContent: { padding: 40, alignItems: "center" },
  coverLogoBox: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 12, marginBottom: 16 },
  coverLogoText: { color: COLORS.white, fontSize: 28, fontWeight: 700, letterSpacing: 1 },
  coverBrandSub: { color: COLORS.white, fontSize: 9, fontWeight: 400, marginTop: 2, letterSpacing: 2 },
  coverTitle: { fontSize: 22, fontWeight: 700, color: COLORS.primaryDark, textAlign: "center", marginTop: 20 },
  coverTitleEn: { fontSize: 14, fontWeight: 400, color: COLORS.primary, textAlign: "center", marginTop: 4 },
  coverDeco: { flexDirection: "row", gap: 16, marginVertical: 20 },
  coverDecoItem: { fontSize: 28 },
  coverStudentBox: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 24, marginTop: 8,
    width: "100%", alignItems: "center",
    shadowColor: COLORS.primary, shadowOpacity: 0.1, shadowRadius: 10,
    borderLeftWidth: 4, borderLeftColor: COLORS.primary,
  },
  coverStudentAvatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  coverStudentAvatarText: { color: COLORS.white, fontSize: 28, fontWeight: 700 },
  coverStudentName: { fontSize: 20, fontWeight: 700, color: COLORS.dark },
  coverStudentMeta: { fontSize: 11, color: COLORS.mid, marginTop: 2 },
  coverPeriodBadge: {
    backgroundColor: COLORS.accent, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
    marginTop: 12,
  },
  coverPeriodText: { color: COLORS.white, fontSize: 13, fontWeight: 700 },
  coverTeacherBox: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 6 },
  coverTeacherText: { fontSize: 11, color: COLORS.mid },

  coverDecoBg: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 140,
    backgroundColor: COLORS.primaryDark, borderTopLeftRadius: 40, borderTopRightRadius: 40,
  },
  coverBottomIcons: {
    position: "absolute", bottom: 24, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 40,
  },
  coverBottomIcon: { fontSize: 32, color: COLORS.white },
  coverSlogan: { fontSize: 10, color: COLORS.white, textAlign: "center", fontStyle: "italic" },

  // Section page header
  pageHeader: {
    backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingTop: 24, paddingBottom: 16,
  },
  pageHeaderTitle: { fontSize: 16, fontWeight: 700, color: COLORS.white },
  pageHeaderSub: { fontSize: 10, color: "#bae6fd", marginTop: 2 },
  pageHeaderDate: { fontSize: 11, color: "#bae6fd", marginTop: 4 },

  // Content area
  contentPad: { padding: 32 },

  // Entry page
  entryMeetingBadge: {
    backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: "flex-start", marginBottom: 8,
  },
  entryMeetingText: { color: COLORS.white, fontSize: 9, fontWeight: 700 },

  // Two column
  twoCol: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },

  // Language labels
  langLabel: { fontSize: 8, fontWeight: 700, color: COLORS.light, marginBottom: 4, letterSpacing: 1 },
  langBox: { backgroundColor: COLORS.veryLight, borderRadius: 8, padding: 10, marginBottom: 8 },
  langText: { fontSize: 9.5, color: COLORS.dark, lineHeight: 1.5 },

  // Photos row
  photosRow: { flexDirection: "row", gap: 6, marginTop: 12, flexWrap: "wrap" },
  photoItem: { width: 90, height: 70, borderRadius: 6, overflow: "hidden" },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },

  // Stars row
  starsRow: { flexDirection: "row", gap: 2, alignItems: "center" },
  starText: { fontSize: 12 },
  starLabel: { fontSize: 8, color: COLORS.mid, marginLeft: 4 },

  // Score grid
  scoreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  scoreCard: {
    width: "30%", backgroundColor: COLORS.veryLight, borderRadius: 8,
    padding: 8, alignItems: "center",
  },
  scoreIcon: { fontSize: 16, marginBottom: 2 },
  scoreLabel: { fontSize: 7, color: COLORS.mid, textAlign: "center", marginBottom: 3 },
  scoreStars: { fontSize: 9 },
  scoreNum: { fontSize: 8, fontWeight: 700, color: COLORS.dark, marginTop: 1 },

  // Notes box
  noteBox: { borderRadius: 8, padding: 10, marginBottom: 6 },
  noteLabel: { fontSize: 8, fontWeight: 700, marginBottom: 4 },
  noteText: { fontSize: 9.5, lineHeight: 1.5, color: COLORS.dark },

  // Summary page
  summaryHeader: {
    backgroundColor: COLORS.secondary, paddingHorizontal: 32, paddingTop: 24, paddingBottom: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  summaryCardTitle: { fontSize: 10, fontWeight: 700, color: COLORS.primaryDark, marginBottom: 6 },
  summaryText: { fontSize: 9.5, color: COLORS.dark, lineHeight: 1.5 },

  // Stats summary row
  statBox: {
    flex: 1, backgroundColor: COLORS.veryLight, borderRadius: 10, padding: 10, alignItems: "center",
  },
  statNum: { fontSize: 20, fontWeight: 700, color: COLORS.primary },
  statLabel: { fontSize: 8, color: COLORS.mid, textAlign: "center", marginTop: 2 },

  // Legend page
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  legendStars: { fontSize: 11, width: 60 },
  legendText: { fontSize: 9.5, color: COLORS.dark },
  legendTextEn: { fontSize: 9, color: COLORS.mid, fontStyle: "italic" },

  // Footer
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 32, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  footerText: { fontSize: 8, color: COLORS.light },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: COLORS.border, marginVertical: 12 },

  // Overall stars big display
  bigStars: { fontSize: 18, color: COLORS.accent },
  bigStarsLabel: { fontSize: 9, color: COLORS.mid, marginTop: 2 },

  // Mood badge
  moodBadge: {
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start",
  },
  moodText: { fontSize: 8, fontWeight: 600 },
});

function Footer({ student, report, pageNum }: { student: Student; report: MonthlyReport; pageNum: number }) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>MSA Education • Mindful · Supportive · Adaptive</Text>
      <Text style={styles.footerText}>{student.full_name} — {report.period_label}</Text>
      <Text style={styles.footerText}>Halaman {pageNum}</Text>
    </View>
  );
}

function CoverPage({ student, report, teacherName }: { student: Student; report: MonthlyReport; teacherName?: string }) {
  const initials = (student.nickname || student.full_name).charAt(0).toUpperCase();
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.coverTopBand} />
      <View style={styles.coverContent}>
        {/* Logo */}
        <View style={styles.coverLogoBox}>
          <Text style={styles.coverLogoText}>MSA</Text>
          <Text style={styles.coverBrandSub}>MINDFUL · SUPPORTIVE · ADAPTIVE</Text>
        </View>

        <Text style={styles.coverTitle}>Learning Journal</Text>
        <Text style={styles.coverTitleEn}>Jurnal Perkembangan Belajar</Text>

        {/* Decorations */}
        <View style={styles.coverDeco}>
          {["📚", "✏️", "🌟", "🧩", "🎨"].map((e, i) => (
            <Text key={i} style={styles.coverDecoItem}>{e}</Text>
          ))}
        </View>

        {/* Student Card */}
        <View style={styles.coverStudentBox}>
          <View style={styles.coverStudentAvatar}>
            <Text style={styles.coverStudentAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.coverStudentName}>{student.full_name}</Text>
          <Text style={styles.coverStudentMeta}>
            {student.nickname && `"${student.nickname}" • `}{student.grade_level}
          </Text>

          <View style={styles.coverPeriodBadge}>
            <Text style={styles.coverPeriodText}>Period {report.period_label}</Text>
          </View>

          {teacherName && (
            <View style={styles.coverTeacherBox}>
              <Text style={styles.coverTeacherText}>👩‍🏫 By {teacherName}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bottom decoration */}
      <View style={styles.coverDecoBg} />
      <View style={styles.coverBottomIcons}>
        {["📖", "🌈", "⭐", "🎯", "💡"].map((e, i) => (
          <Text key={i} style={styles.coverBottomIcon}>{e}</Text>
        ))}
      </View>
    </Page>
  );
}

function EntryPage({ entry, student, report, pageNum }: {
  entry: DailyEntry; student: Student; report: MonthlyReport; pageNum: number;
}) {
  const moodColors = {
    happy: { bg: "#f0fdf4", color: "#16a34a", text: "😊 Senang / Happy" },
    neutral: { bg: "#fffbeb", color: "#d97706", text: "😐 Biasa / Neutral" },
    needs_support: { bg: "#fff1f2", color: "#e11d48", text: "🤗 Perlu Dukungan / Needs Support" },
  };
  const mood = moodColors[entry.mood] || moodColors.happy;

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View>
            <Text style={styles.pageHeaderTitle}>
              {entry.session_title || `Pertemuan ke-${entry.meeting_number}`}
            </Text>
            <Text style={styles.pageHeaderDate}>
              {new Date(entry.entry_date).toLocaleDateString("id-ID", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </Text>
          </View>
          {/* Mood */}
          <View style={[styles.moodBadge, { backgroundColor: mood.bg }]}>
            <Text style={[styles.moodText, { color: mood.color }]}>{mood.text}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.contentPad, { paddingBottom: 60 }]}>
        {/* Assessment & Activities */}
        <Text style={{ fontSize: 10, fontWeight: 700, color: COLORS.dark, marginBottom: 8 }}>
          📋 Assessment & Activities — Aktivitas & Penilaian
        </Text>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.langLabel}>🇬🇧 ENGLISH</Text>
            <View style={styles.langBox}>
              <Text style={styles.langText}>{entry.activities_description_en || entry.activities_description}</Text>
            </View>
          </View>
          <View style={styles.col}>
            <Text style={styles.langLabel}>🇮🇩 BAHASA INDONESIA</Text>
            <View style={styles.langBox}>
              <Text style={styles.langText}>{entry.activities_description}</Text>
            </View>
          </View>
        </View>

        {/* Topics */}
        {(entry.topics_taught || entry.next_topics) && (
          <>
            <View style={styles.divider} />
            <View style={styles.twoCol}>
              {entry.topics_taught && (
                <View style={styles.col}>
                  <View style={[styles.noteBox, { backgroundColor: "#f0fdf4" }]}>
                    <Text style={[styles.noteLabel, { color: COLORS.green }]}>✅ Topik Diajarkan / Topics Taught</Text>
                    <Text style={styles.langText}>{entry.topics_taught}</Text>
                    {entry.topics_taught_en && <Text style={[styles.langText, { color: COLORS.mid, marginTop: 4, fontStyle: "italic" }]}>{entry.topics_taught_en}</Text>}
                  </View>
                </View>
              )}
              {entry.next_topics && (
                <View style={styles.col}>
                  <View style={[styles.noteBox, { backgroundColor: "#eff6ff" }]}>
                    <Text style={[styles.noteLabel, { color: COLORS.primary }]}>📌 Rencana Selanjutnya / Next Topics</Text>
                    <Text style={styles.langText}>{entry.next_topics}</Text>
                    {entry.next_topics_en && <Text style={[styles.langText, { color: COLORS.mid, marginTop: 4, fontStyle: "italic" }]}>{entry.next_topics_en}</Text>}
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        {/* Score Cards */}
        {entry.scores && Object.keys(entry.scores).length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={{ fontSize: 9, fontWeight: 700, color: COLORS.dark, marginBottom: 8 }}>
              ⭐ Penilaian Perkembangan / Development Assessment
            </Text>
            <View style={styles.scoreGrid}>
              {SCORE_CATEGORIES.map(cat => {
                const val = (entry.scores as any)?.[cat.key] || 0;
                if (!val) return null;
                return (
                  <View key={cat.key} style={styles.scoreCard}>
                    <Text style={styles.scoreIcon}>{cat.icon}</Text>
                    <Text style={styles.scoreLabel}>{cat.label_id}</Text>
                    <Text style={styles.scoreStars}>
                      {Array.from({ length: 5 }).map((_, i) => star(i < val)).join("")}
                    </Text>
                    <Text style={styles.scoreNum}>{STAR_LABELS[val as keyof typeof STAR_LABELS]?.id}</Text>
                  </View>
                );
              })}
            </View>

            {/* Overall Stars */}
            {entry.overall_stars > 0 && (
              <View style={{ marginTop: 12, alignItems: "center" }}>
                <Text style={styles.bigStars}>
                  {Array.from({ length: 5 }).map((_, i) => star(i < entry.overall_stars)).join(" ")}
                </Text>
                <Text style={styles.bigStarsLabel}>
                  Overall: {STAR_LABELS[entry.overall_stars as keyof typeof STAR_LABELS]?.id} / {STAR_LABELS[entry.overall_stars as keyof typeof STAR_LABELS]?.en}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Photos */}
        {entry.photo_urls && entry.photo_urls.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={{ fontSize: 9, fontWeight: 700, color: COLORS.dark, marginBottom: 8 }}>📸 Dokumentasi Kegiatan</Text>
            <View style={styles.photosRow}>
              {entry.photo_urls.slice(0, 5).map((url, i) => (
                <View key={i} style={styles.photoItem}>
                  <Image src={url} style={styles.photoImg} />
                </View>
              ))}
            </View>
          </>
        )}

        {/* Notes & Suggestions */}
        {(entry.teacher_notes || entry.suggestions) && (
          <>
            <View style={styles.divider} />
            <View style={styles.twoCol}>
              {entry.teacher_notes && (
                <View style={styles.col}>
                  <View style={[styles.noteBox, { backgroundColor: "#fefce8" }]}>
                    <Text style={[styles.noteLabel, { color: COLORS.accent }]}>📝 Catatan Guru / Teacher Notes</Text>
                    <Text style={styles.noteText}>{entry.teacher_notes}</Text>
                    {entry.teacher_notes_en && <Text style={[styles.noteText, { color: COLORS.mid, marginTop: 4, fontStyle: "italic" }]}>{entry.teacher_notes_en}</Text>}
                  </View>
                </View>
              )}
              {entry.suggestions && (
                <View style={styles.col}>
                  <View style={[styles.noteBox, { backgroundColor: "#fdf4ff" }]}>
                    <Text style={[styles.noteLabel, { color: COLORS.secondary }]}>💡 Saran untuk Orang Tua / Suggestions</Text>
                    <Text style={styles.noteText}>{entry.suggestions}</Text>
                    {entry.suggestions_en && <Text style={[styles.noteText, { color: COLORS.mid, marginTop: 4, fontStyle: "italic" }]}>{entry.suggestions_en}</Text>}
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      <Footer student={student} report={report} pageNum={pageNum} />
    </Page>
  );
}

function SummaryPage({ student, report, entries, pageNum }: {
  student: Student; report: MonthlyReport; entries: DailyEntry[]; pageNum: number;
}) {
  const avgStars = entries.length > 0
    ? Math.round(entries.reduce((a, e) => a + e.overall_stars, 0) / entries.length)
    : 0;

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.summaryHeader}>
        <Text style={styles.pageHeaderTitle}>📊 Ringkasan Bulan Ini / Monthly Summary</Text>
        <Text style={styles.pageHeaderSub}>{student.full_name} • {report.period_label}</Text>
      </View>

      <View style={[styles.contentPad, { paddingBottom: 60 }]}>
        {/* Stats Row */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{report.total_meetings}</Text>
            <Text style={styles.statLabel}>Pertemuan{"\n"}Meetings</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>
              {Array.from({ length: 5 }).map((_, i) => star(i < avgStars)).join("")}
            </Text>
            <Text style={styles.statLabel}>Rata-rata Bintang{"\n"}Average Stars</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: COLORS.green }]}>{report.attendance_rate || 100}%</Text>
            <Text style={styles.statLabel}>Kehadiran{"\n"}Attendance</Text>
          </View>
        </View>

        {/* Consolidated Scores */}
        {report.consolidated_scores && Object.keys(report.consolidated_scores).length > 0 && (
          <>
            <Text style={{ fontSize: 10, fontWeight: 700, color: COLORS.dark, marginBottom: 8 }}>
              ⭐ Rata-rata Penilaian Bulanan / Monthly Average Scores
            </Text>
            <View style={styles.scoreGrid}>
              {SCORE_CATEGORIES.map(cat => {
                const val = (report.consolidated_scores as any)?.[cat.key];
                if (!val) return null;
                const rounded = Math.round(val);
                return (
                  <View key={cat.key} style={styles.scoreCard}>
                    <Text style={styles.scoreIcon}>{cat.icon}</Text>
                    <Text style={styles.scoreLabel}>{cat.label_id}{"\n"}{cat.label_en}</Text>
                    <Text style={styles.scoreStars}>
                      {Array.from({ length: 5 }).map((_, i) => star(i < rounded)).join("")}
                    </Text>
                    <Text style={styles.scoreNum}>{val.toFixed(1)} / 5</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Summary Cards */}
        {[
          { label: "📝 Ringkasan / Summary", textId: report.summary, textEn: report.summary_en, border: COLORS.primary },
          { label: "🏆 Pencapaian / Achievements", textId: report.achievements, textEn: report.achievements_en, border: COLORS.green },
          { label: "💡 Rekomendasi / Recommendations", textId: report.recommendations, textEn: report.recommendations_en, border: COLORS.accent },
          { label: "🎯 Target Bulan Depan / Next Month Goals", textId: report.goals_next_month, textEn: report.goals_next_month_en, border: COLORS.secondary },
        ].map(item => {
          if (!item.textId && !item.textEn) return null;
          return (
            <View key={item.label} style={[styles.summaryCard, { borderLeftColor: item.border }]}>
              <Text style={[styles.summaryCardTitle, { color: item.border }]}>{item.label}</Text>
              {item.textId && <Text style={styles.summaryText}>{item.textId}</Text>}
              {item.textEn && <Text style={[styles.summaryText, { color: COLORS.mid, fontStyle: "italic", marginTop: 4 }]}>{item.textEn}</Text>}
            </View>
          );
        })}
      </View>

      <Footer student={student} report={report} pageNum={pageNum} />
    </Page>
  );
}

function LegendPage({ student, report, pageNum }: { student: Student; report: MonthlyReport; pageNum: number }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={[styles.pageHeader, { backgroundColor: COLORS.teal }]}>
        <Text style={styles.pageHeaderTitle}>📖 Panduan Penilaian / Assessment Guide</Text>
        <Text style={styles.pageHeaderSub}>Panduan membaca laporan ini</Text>
      </View>

      <View style={[styles.contentPad, { paddingBottom: 60 }]}>
        <Text style={{ fontSize: 11, fontWeight: 700, color: COLORS.dark, marginBottom: 16 }}>
          Arti Bintang / Star Rating Guide
        </Text>
        {[5, 4, 3, 2, 1].map(n => (
          <View key={n} style={styles.legendRow}>
            <Text style={styles.legendStars}>{Array.from({ length: n }, () => "★").join("")}{Array.from({ length: 5 - n }, () => "☆").join("")}</Text>
            <View>
              <Text style={styles.legendText}>{STAR_LABELS[n as keyof typeof STAR_LABELS]?.id}</Text>
              <Text style={styles.legendTextEn}>{STAR_LABELS[n as keyof typeof STAR_LABELS]?.en}</Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />
        <Text style={{ fontSize: 11, fontWeight: 700, color: COLORS.dark, marginBottom: 16 }}>
          Kategori Penilaian / Assessment Categories
        </Text>
        {SCORE_CATEGORIES.map(cat => (
          <View key={cat.key} style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
            <View>
              <Text style={{ fontSize: 10, fontWeight: 700, color: COLORS.dark }}>{cat.label_id}</Text>
              <Text style={{ fontSize: 9, color: COLORS.mid, fontStyle: "italic" }}>{cat.label_en}</Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />
        <View style={{ backgroundColor: COLORS.bg, borderRadius: 12, padding: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 12, fontWeight: 700, color: COLORS.primaryDark, marginBottom: 4 }}>MSA Education</Text>
          <Text style={{ fontSize: 9, color: COLORS.mid, textAlign: "center" }}>Mindful · Supportive · Adaptive</Text>
          <Text style={{ fontSize: 10, color: COLORS.primary, textAlign: "center", marginTop: 4, fontStyle: "italic" }}>
            "Every Mind Matters, Every Child Shines."
          </Text>
        </View>
      </View>

      <Footer student={student} report={report} pageNum={pageNum} />
    </Page>
  );
}

interface Props {
  report: MonthlyReport;
  student: Student;
  entries: DailyEntry[];
}

export default function ReportPDF({ report, student, entries }: Props) {
  return (
    <Document
      title={`MSA Learning Journal — ${student.full_name} — ${report.period_label}`}
      author="MSA Education"
      subject={`Learning Journal ${report.period_label}`}
    >
      {/* Cover */}
      <CoverPage student={student} report={report} teacherName="MSA Education Teacher" />

      {/* Legend */}
      <LegendPage student={student} report={report} pageNum={2} />

      {/* Daily Entries */}
      {entries.map((entry, i) => (
        <EntryPage
          key={entry.id}
          entry={entry}
          student={student}
          report={report}
          pageNum={i + 3}
        />
      ))}

      {/* Monthly Summary */}
      <SummaryPage
        student={student}
        report={report}
        entries={entries}
        pageNum={entries.length + 3}
      />
    </Document>
  );
}
