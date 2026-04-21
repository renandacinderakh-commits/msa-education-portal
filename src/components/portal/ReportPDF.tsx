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

/* ═══════════════════════════════════════════════════════════════════════
   FONT — Montserrat WOFF2 from /public/fonts/ (ZERO italic variants)
   ═══════════════════════════════════════════════════════════════════════ */
Font.register({
  family: "Mont",
  fonts: [
    { src: "/fonts/Montserrat-Regular.woff2",   fontWeight: 400 },
    { src: "/fonts/Montserrat-SemiBold.woff2",  fontWeight: 600 },
    { src: "/fonts/Montserrat-Bold.woff2",      fontWeight: 700 },
    { src: "/fonts/Montserrat-ExtraBold.woff2", fontWeight: 800 },
  ],
});

/* ═══════════════════════════════════════════════════════════════════════
   COLORS
   ═══════════════════════════════════════════════════════════════════════ */
const C = {
  sky: "#0ea5e9",      skyDark: "#0369a1",   skyLight: "#e0f2fe",
  indigo: "#6366f1",   indigoLight: "#eef2ff",
  amber: "#f59e0b",    amberLight: "#fffbeb",
  pink: "#ec4899",     pinkLight: "#fdf2f8",
  green: "#10b981",    greenLight: "#f0fdf4",
  orange: "#f97316",   purple: "#8b5cf6",
  white: "#ffffff",    dark: "#1e293b",
  mid: "#475569",      light: "#94a3b8",
  border: "#e2e8f0",   bg: "#f8fafc",
};

/* ═══════════════════════════════════════════════════════════════════════
   5 DOMAINS — synced with types.ts
   ═══════════════════════════════════════════════════════════════════════ */
const DOMAINS = [
  { key: "language", label_id: "Domain 1: Bahasa, Literasi & Komunikasi",    label_en: "Language, Literacy & Communication",        color: C.sky,    ref: "EYFS: Literacy + C&L",           cats: ["phonics_sounds","early_reading","writing_spelling","speaking_listening","vocabulary","english_efl"] },
  { key: "math",     label_id: "Domain 2: Matematika & Pemikiran Logis",      label_en: "Mathematics & Logical Thinking",            color: C.green,  ref: "EYFS: Mathematics",               cats: ["number_recognition","addition_subtraction","shapes_space","logical_reasoning","patterns_sequences","time_measurement"] },
  { key: "social",   label_id: "Domain 3: Sosial, Emosional & Karakter",      label_en: "Personal, Social & Emotional Development",  color: C.pink,   ref: "EYFS: PSED + IB Learner Profile", cats: ["emotional_regulation","independence_initiative","self_confidence","empathy_cooperation","persistence_focus","behavior_ethics"] },
  { key: "physical", label_id: "Domain 4: Perkembangan Fisik & Motorik",      label_en: "Physical & Motor Development",              color: C.orange, ref: "EYFS: Physical Dev.",             cats: ["fine_motor","hand_eye_coordination","gross_motor"] },
  { key: "creative", label_id: "Domain 5: Seni Kreatif, Kognitif & Eksplorasi",label_en: "Creative Arts, Cognitive & World Exploration",color: C.purple,ref: "EYFS: EAD + UTW | IB-PYP",      cats: ["creativity","curiosity_inquiry","world_understanding","problem_solving","music_rhythm","science_observation"] },
] as const;

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */
const starsStr = (val: number) =>
  Array.from({ length: 5 }, (_, i) => (i < Math.round(val) ? "\u2605" : "\u2606")).join("");

const moodInfo = (m: string) => {
  const map: Record<string, { text: string; color: string; bg: string }> = {
    happy:        { text: "Senang / Happy",        color: "#16a34a", bg: "#f0fdf4" },
    neutral:      { text: "Biasa / Neutral",        color: "#d97706", bg: "#fffbeb" },
    needs_support:{ text: "Perlu Dukungan",         color: "#e11d48", bg: "#fff1f2" },
  };
  return map[m] ?? map.happy;
};

const scaleLbl = (v: number) =>
  v >= 4.5 ? "Luar Biasa!" : v >= 3.5 ? "Melebihi Harapan" : v >= 2.5 ? "Sesuai Harapan" : v >= 1.5 ? "Berkembang" : "Perlu Latihan";

const getCat = (key: string) =>
  SCORE_CATEGORIES.find((c) => c.key === key) ?? { label_id: key, label_en: key };

const domAvg = (sc: Record<string, number>, cats: readonly string[]) => {
  const vals = cats.map((k) => sc[k] ?? 0).filter((v) => v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
};

/* ═══════════════════════════════════════════════════════════════════════
   STYLES — fontFamily "Mont" everywhere, ZERO fontStyle italic
   ═══════════════════════════════════════════════════════════════════════ */
const S = StyleSheet.create({
  page: { fontFamily: "Mont", backgroundColor: C.white, padding: 0 },

  // COVER
  coverBand:    { backgroundColor: C.sky, height: 8 },
  coverMain:    { backgroundColor: "#e0f2fe", flex: 1, padding: 40, alignItems: "center" },
  coverLogoBox: { backgroundColor: C.sky, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, alignItems: "center", marginBottom: 18 },
  coverLogoTxt: { color: C.white, fontSize: 34, fontWeight: 800, letterSpacing: 4 },
  coverLogoSub: { color: "rgba(255,255,255,0.85)", fontSize: 8, fontWeight: 600, letterSpacing: 2, marginTop: 2 },
  coverTitle:   { fontSize: 24, fontWeight: 800, color: C.skyDark, textAlign: "center", marginTop: 12 },
  coverTitleId: { fontSize: 13, fontWeight: 400, color: C.mid, textAlign: "center", marginTop: 3 },
  coverCard:    { backgroundColor: C.white, borderRadius: 20, padding: 26, width: "100%", alignItems: "center", borderTopWidth: 4, borderTopColor: C.sky, marginTop: 24 },
  coverAvatar:  { width: 80, height: 80, borderRadius: 40, backgroundColor: C.sky, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  coverAvatarTxt: { color: C.white, fontSize: 34, fontWeight: 800 },
  coverName:    { fontSize: 20, fontWeight: 800, color: C.dark },
  coverMeta:    { fontSize: 11, fontWeight: 400, color: C.mid, marginTop: 3 },
  coverPeriodBadge: { backgroundColor: C.amber, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 7, marginTop: 12 },
  coverPeriodTxt:   { color: C.white, fontSize: 13, fontWeight: 700 },
  coverTeacher: { fontSize: 11, fontWeight: 400, color: C.mid, marginTop: 10 },
  coverStatsRow:{ flexDirection: "row", marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border, width: "100%" },
  coverStatItem:{ flex: 1, alignItems: "center" },
  coverStatNum: { fontSize: 22, fontWeight: 800, color: C.sky },
  coverStatLbl: { fontSize: 8, fontWeight: 400, color: C.light, marginTop: 2, textAlign: "center" },
  coverBottom:  { backgroundColor: C.skyDark, height: 130, borderTopLeftRadius: 40, borderTopRightRadius: 40, alignItems: "center", justifyContent: "center" },
  coverSlogan:  { fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.75)", letterSpacing: 1, marginTop: 6 },

  // PAGE HEADER
  pageHdrBlue:  { backgroundColor: C.sky, paddingHorizontal: 36, paddingTop: 20, paddingBottom: 14 },
  pageHdrPurple:{ backgroundColor: C.indigo, paddingHorizontal: 36, paddingTop: 20, paddingBottom: 14 },
  phRow:    { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  phTitle:  { fontSize: 16, fontWeight: 800, color: C.white },
  phSub:    { fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.8)", marginTop: 3 },
  phBadge:  { backgroundColor: "rgba(255,255,255,0.22)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  phBadgeTxt: { fontSize: 9, fontWeight: 600, color: C.white },

  // CONTENT
  content: { paddingHorizontal: 36, paddingTop: 22, paddingBottom: 70 },

  // SECTION LABEL
  secLabel:    { backgroundColor: "#e0f2fe", borderRadius: 7, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 12, borderWidth: 1, borderColor: "rgba(14,165,233,0.2)" },
  secLabelTxt: { fontSize: 10, fontWeight: 700, color: C.skyDark },

  // SESSION
  meetBadge:    { backgroundColor: C.amber, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 6 },
  meetBadgeTxt: { fontSize: 9, fontWeight: 700, color: C.white },
  sessTitle:    { fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 3 },
  sessMeta:     { fontSize: 10, fontWeight: 400, color: C.light },
  moodBadge:    { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" },
  moodTxt:      { fontSize: 9, fontWeight: 600 },

  // BILINGUAL COLUMNS
  twoCol:   { flexDirection: "row", gap: 12, marginBottom: 14 },
  col:      { flex: 1 },
  flagLbl:  { fontSize: 8, fontWeight: 700, color: C.light, letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" },
  langBox:  { backgroundColor: C.bg, borderRadius: 9, padding: 10, borderWidth: 1, borderColor: C.border },
  langTxt:  { fontSize: 10, fontWeight: 400, color: C.dark, lineHeight: 1.65 },

  // TOPICS
  topicBoxTaught: { flex: 1, backgroundColor: C.greenLight, borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.green },
  topicBoxNext:   { flex: 1, backgroundColor: "#eff6ff",    borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.sky },
  topicLblTaught: { fontSize: 9, fontWeight: 700, color: C.green,   marginBottom: 6 },
  topicLblNext:   { fontSize: 9, fontWeight: 700, color: C.skyDark, marginBottom: 6 },
  topicFlag:      { fontSize: 8, fontWeight: 700, color: C.light, letterSpacing: 1, marginBottom: 2, marginTop: 6 },
  topicTxt:       { fontSize: 10, fontWeight: 400, color: C.dark, lineHeight: 1.6 },
  topicTxtEn:     { fontSize: 9,  fontWeight: 400, color: C.mid,  lineHeight: 1.5 },
  topicDiv:       { borderBottomWidth: 1, borderBottomColor: "#d1fae5", marginVertical: 5 },

  // PHOTOS
  photosRow: { flexDirection: "row", gap: 7, flexWrap: "wrap", marginBottom: 12 },
  photoItem: { width: 96, height: 74, borderRadius: 8, overflow: "hidden" },

  // DOMAIN ASSESSMENT
  domainHdr:  { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 8, borderLeftWidth: 3, backgroundColor: "#f8fafc" },
  domainName: { fontSize: 10, fontWeight: 700, color: C.dark },
  domainEn:   { fontSize: 8,  fontWeight: 400, color: C.mid },
  domainRef:  { fontSize: 7,  fontWeight: 400, color: C.light, marginLeft: "auto" },
  skillRow:   { flexDirection: "row", gap: 7, marginBottom: 8 },
  skillCard:  { flex: 1, backgroundColor: C.bg, borderRadius: 9, paddingVertical: 8, paddingHorizontal: 6, alignItems: "center", borderWidth: 1, borderColor: C.border },
  skillName:  { fontSize: 7,   fontWeight: 700, color: C.dark, textAlign: "center", lineHeight: 1.3, marginBottom: 1 },
  skillNameEn:{ fontSize: 6.5, fontWeight: 400, color: C.mid,  textAlign: "center", lineHeight: 1.3, marginBottom: 4 },
  skillStars: { fontSize: 10, color: C.amber },
  skillScore: { fontSize: 7.5, fontWeight: 700, color: C.dark, marginTop: 2 },
  skillScLbl: { fontSize: 6.5, fontWeight: 400, color: C.mid },

  // OVERALL
  overallBox:   { borderRadius: 12, padding: 16, alignItems: "center", backgroundColor: C.amberLight, borderWidth: 1, borderColor: "rgba(245,158,11,0.25)", marginBottom: 12 },
  overallStars: { fontSize: 24, fontWeight: 400, color: C.amber, letterSpacing: 3 },
  overallVal:   { fontSize: 13, fontWeight: 700, color: C.amber, marginTop: 3 },
  overallSub:   { fontSize: 9,  fontWeight: 400, color: C.mid,   marginTop: 2 },

  // NOTES
  noteTeacher: { flex: 1, backgroundColor: "#fefce8", borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.amber },
  noteSuggest: { flex: 1, backgroundColor: "#fdf4ff", borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.indigo },
  noteLblT:    { fontSize: 9, fontWeight: 700, color: "#d97706", marginBottom: 5 },
  noteLblS:    { fontSize: 9, fontWeight: 700, color: C.indigo,  marginBottom: 5 },
  noteTxt:     { fontSize: 10, fontWeight: 400, color: C.dark, lineHeight: 1.65 },
  noteTxtEn:   { fontSize: 9,  fontWeight: 400, color: C.mid,  lineHeight: 1.55, marginTop: 4 },

  divider: { borderBottomWidth: 1, borderBottomColor: C.border, marginVertical: 14 },

  // SUMMARY STATS
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: C.border },
  statNum:  { fontSize: 26, fontWeight: 800, color: C.sky },
  statLbl:  { fontSize: 8,  fontWeight: 400, color: C.mid, textAlign: "center", marginTop: 3 },

  // SESSION TABLE
  tblHdr:     { flexDirection: "row", backgroundColor: C.sky, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  tblHdrTxt:  { fontSize: 8, fontWeight: 700, color: C.white, padding: 6 },
  tblRow:     { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tblRowAlt:  { flexDirection: "row", backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border },
  tblCell:    { fontSize: 8, fontWeight: 400, color: C.dark, padding: 6, lineHeight: 1.4 },
  tblCellStar:{ fontSize: 8, fontWeight: 400, color: C.amber, padding: 6 },

  // PROGRESS BARS
  progItem:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  progInfo:   { flex: 1 },
  progLbl:    { fontSize: 9, fontWeight: 600, color: C.dark },
  progLblEn:  { fontSize: 7, fontWeight: 400, color: C.light },
  progWrap:   { height: 8, backgroundColor: C.border, borderRadius: 999, marginTop: 3, overflow: "hidden" },
  progBar:    { height: 8, borderRadius: 999 },
  progVal:    { fontSize: 9, fontWeight: 700, color: C.dark, width: 28, textAlign: "right" },

  // SUMMARY CARDS
  sumCard:    { borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, marginBottom: 10 },
  sumTitle:   { fontSize: 10, fontWeight: 700, marginBottom: 5 },
  sumTxt:     { fontSize: 9,  fontWeight: 400, color: C.dark, lineHeight: 1.7 },
  sumTxtEn:   { fontSize: 8,  fontWeight: 400, color: C.mid,  lineHeight: 1.6, marginTop: 4 },

  // SIGNATURE
  sigRow:  { flexDirection: "row", gap: 20, marginTop: 16 },
  sigItem: { flex: 1, alignItems: "center" },
  sigLine: { height: 44, borderBottomWidth: 1.5, borderBottomColor: "#cbd5e1", marginBottom: 7, width: "100%" },
  sigName: { fontSize: 9, fontWeight: 700, color: C.mid, textAlign: "center" },
  sigRole: { fontSize: 8, fontWeight: 400, color: C.light, textAlign: "center" },

  // FOOTER
  footer:    { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, paddingVertical: 8, paddingHorizontal: 36, flexDirection: "row", justifyContent: "space-between" },
  footerTxt: { fontSize: 7, fontWeight: 400, color: C.light },
});

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
interface Props {
  report: MonthlyReport;
  student: Student;
  entries: DailyEntry[];
}

export default function ReportPDF({ report, student, entries }: Props) {
  const totalSessions = entries.length || report.total_meetings || 0;
  const avgRating = entries.length
    ? entries.reduce((s, e) => s + (e.overall_stars || 0), 0) / entries.length
    : 0;
  const attendance = report.attendance_rate ?? 100;
  const initial = student.full_name.charAt(0).toUpperCase();
  const consolidatedScores = (report.consolidated_scores || {}) as Record<string, number>;
  const teacherName = student.teacher?.full_name ?? "Guru MSA";

  return (
    <Document>
      {/* ══════════════ PAGE 1: COVER ══════════════ */}
      <Page size="A4" style={S.page}>
        <View style={S.coverBand} />
        <View style={S.coverMain}>
          {/* Logo */}
          <View style={S.coverLogoBox}>
            <Text style={S.coverLogoTxt}>MSA</Text>
            <Text style={S.coverLogoSub}>MINDFUL  ·  SUPPORTIVE  ·  ADAPTIVE</Text>
          </View>
          <Text style={S.coverTitle}>Monthly Learning Journal</Text>
          <Text style={S.coverTitleId}>Jurnal Perkembangan Belajar Bulanan</Text>

          {/* Student card */}
          <View style={S.coverCard}>
            <View style={S.coverAvatar}>
              <Text style={S.coverAvatarTxt}>{initial}</Text>
            </View>
            <Text style={S.coverName}>{student.full_name}</Text>
            <Text style={S.coverMeta}>
              {student.nickname ? `"${student.nickname}"  ·  ` : ""}Kelas {student.grade_level}
            </Text>
            <View style={S.coverPeriodBadge}>
              <Text style={S.coverPeriodTxt}>{report.period_label}</Text>
            </View>
            <Text style={S.coverTeacher}>Tutor: {teacherName}  |  MSA Education</Text>
            <View style={S.coverStatsRow}>
              <View style={S.coverStatItem}>
                <Text style={S.coverStatNum}>{totalSessions}</Text>
                <Text style={S.coverStatLbl}>Pertemuan/Sessions</Text>
              </View>
              <View style={S.coverStatItem}>
                <Text style={[S.coverStatNum, { fontSize: 16, color: C.amber }]}>{avgRating.toFixed(1)}/5</Text>
                <Text style={S.coverStatLbl}>Avg Rating</Text>
              </View>
              <View style={S.coverStatItem}>
                <Text style={[S.coverStatNum, { color: C.green }]}>{attendance}%</Text>
                <Text style={S.coverStatLbl}>Kehadiran</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={S.coverBottom}>
          <Text style={S.coverSlogan}>"Every Mind Matters, Every Child Shines."</Text>
        </View>
      </Page>

      {/* ══════════════ PAGES: SESSION DETAIL ══════════════ */}
      {entries.map((entry, idx) => {
        const mood = moodInfo(entry.mood || "happy");
        const entryScores = (entry.scores || {}) as Record<string, number>;
        const dateStr = new Date(entry.entry_date).toLocaleDateString("id-ID", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        });

        return (
          <Page key={entry.id || idx} size="A4" style={S.page} wrap>
            {/* Header */}
            <View style={S.pageHdrBlue}>
              <View style={S.phRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.phTitle}>Rincian Sesi {idx + 1} dari {totalSessions} Pertemuan</Text>
                  <Text style={S.phSub}>{student.full_name}  ·  {report.period_label}  |  {student.grade_level}  |  Tutor: {teacherName}</Text>
                </View>
                <View style={S.phBadge}>
                  <Text style={S.phBadgeTxt}>Laporan {report.period_label}</Text>
                </View>
              </View>
            </View>

            <View style={S.content}>
              {/* Session badge + meta */}
              <View style={S.meetBadge}>
                <Text style={S.meetBadgeTxt}>SESI {idx + 1} — {dateStr}</Text>
              </View>
              <View style={[S.phRow, { marginBottom: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={S.sessTitle}>{entry.session_title || `Pertemuan ke-${entry.meeting_number || idx + 1}`}</Text>
                  <Text style={S.sessMeta}>
                    {entry.session_duration ? `${entry.session_duration} menit` : ""}
                    {entry.session_location ? `  |  ${entry.session_location}` : ""}
                    {`  |  Bag. dari ${totalSessions} Sesi`}
                  </Text>
                </View>
                <View style={[S.moodBadge, { backgroundColor: mood.bg }]}>
                  <Text style={[S.moodTxt, { color: mood.color }]}>{mood.text}</Text>
                </View>
              </View>

              {/* Activities bilingual */}
              <View style={S.secLabel}><Text style={S.secLabelTxt}>Deskripsi Kegiatan / Activities Description</Text></View>
              <View style={S.twoCol}>
                <View style={S.col}>
                  <Text style={S.flagLbl}>BAHASA INDONESIA</Text>
                  <View style={S.langBox}><Text style={S.langTxt}>{entry.activities_description || "-"}</Text></View>
                </View>
                <View style={S.col}>
                  <Text style={S.flagLbl}>ENGLISH</Text>
                  <View style={S.langBox}><Text style={S.langTxt}>{entry.activities_description_en || entry.activities_description || "-"}</Text></View>
                </View>
              </View>

              {/* Topics bilingual */}
              <View style={S.secLabel}><Text style={S.secLabelTxt}>Topik Dipelajari & Rencana / Topics & Next Steps</Text></View>
              <View style={S.twoCol}>
                <View style={S.topicBoxTaught}>
                  <Text style={S.topicLblTaught}>Topik Diajarkan / Topics Taught</Text>
                  <Text style={S.topicFlag}>INDONESIA</Text>
                  <Text style={S.topicTxt}>{entry.topics_taught || "-"}</Text>
                  <View style={S.topicDiv} />
                  <Text style={S.topicFlag}>ENGLISH</Text>
                  <Text style={S.topicTxtEn}>{entry.topics_taught_en || entry.topics_taught || "-"}</Text>
                </View>
                <View style={S.topicBoxNext}>
                  <Text style={S.topicLblNext}>Rencana Selanjutnya / Next Steps</Text>
                  <Text style={S.topicFlag}>INDONESIA</Text>
                  <Text style={S.topicTxt}>{entry.next_topics || "-"}</Text>
                  <View style={[S.topicDiv, { borderBottomColor: "#bfdbfe" }]} />
                  <Text style={S.topicFlag}>ENGLISH</Text>
                  <Text style={S.topicTxtEn}>{entry.next_topics_en || entry.next_topics || "-"}</Text>
                </View>
              </View>

              {/* Photos */}
              {entry.photo_urls && entry.photo_urls.length > 0 && (
                <>
                  <View style={S.secLabel}><Text style={S.secLabelTxt}>Dokumentasi Kegiatan Belajar</Text></View>
                  <View style={S.photosRow}>
                    {entry.photo_urls.slice(0, 5).map((url, pi) => (
                      <View key={pi} style={S.photoItem}>
                        <Image src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </View>
                    ))}
                  </View>
                </>
              )}

              <View style={S.divider} />

              {/* Assessment — 5 domains */}
              <View style={S.secLabel}><Text style={S.secLabelTxt}>Penilaian Perkembangan — Standar Internasional EYFS & IB-PYP</Text></View>
              {DOMAINS.map((domain) => {
                const allCats = domain.cats as readonly string[];
                // 3 per row
                const rows: string[][] = [];
                for (let i = 0; i < allCats.length; i += 3) rows.push(allCats.slice(i, i + 3));
                return (
                  <View key={domain.key} style={{ marginBottom: 12 }} wrap={false}>
                    <View style={[S.domainHdr, { borderLeftColor: domain.color }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={S.domainName}>{domain.label_id}</Text>
                        <Text style={S.domainEn}>{domain.label_en}</Text>
                      </View>
                      <Text style={S.domainRef}>{domain.ref}</Text>
                    </View>
                    {rows.map((row, ri) => (
                      <View key={ri} style={S.skillRow}>
                        {row.map((catKey) => {
                          const cat = getCat(catKey);
                          const val = entryScores[catKey] || 0;
                          return (
                            <View key={catKey} style={S.skillCard}>
                              <Text style={S.skillName}>{cat.label_id}</Text>
                              <Text style={S.skillNameEn}>{cat.label_en}</Text>
                              <Text style={S.skillStars}>{starsStr(val)}</Text>
                              <Text style={S.skillScore}>{val > 0 ? `${val.toFixed(1)} / 5` : "-"}</Text>
                              <Text style={S.skillScLbl}>{val > 0 ? scaleLbl(val) : "Tidak dinilai"}</Text>
                            </View>
                          );
                        })}
                        {/* Fill empty cells */}
                        {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, fi) => (
                          <View key={`f${fi}`} style={{ flex: 1 }} />
                        ))}
                      </View>
                    ))}
                  </View>
                );
              })}

              {/* Overall rating */}
              <View style={S.overallBox} wrap={false}>
                <Text style={S.overallStars}>{starsStr(entry.overall_stars || 0)}</Text>
                <Text style={S.overallVal}>
                  {entry.overall_stars
                    ? `${scaleLbl(entry.overall_stars)} | Score: ${entry.overall_stars.toFixed(1)} / 5.0`
                    : "Belum dinilai"}
                </Text>
                <Text style={S.overallSub}>Overall Session Rating — Penilaian Keseluruhan Sesi ini</Text>
              </View>

              <View style={S.divider} />

              {/* Notes */}
              <View style={S.secLabel}><Text style={S.secLabelTxt}>Catatan Guru & Saran untuk Orang Tua</Text></View>
              <View style={S.twoCol}>
                <View style={S.noteTeacher}>
                  <Text style={S.noteLblT}>Catatan Guru / Teacher Notes</Text>
                  <Text style={S.noteTxt}>{entry.teacher_notes || "-"}</Text>
                  {entry.teacher_notes_en ? <Text style={S.noteTxtEn}>{entry.teacher_notes_en}</Text> : null}
                </View>
                <View style={S.noteSuggest}>
                  <Text style={S.noteLblS}>Saran Orang Tua / Parent Suggestions</Text>
                  <Text style={S.noteTxt}>{entry.suggestions || "-"}</Text>
                  {entry.suggestions_en ? <Text style={S.noteTxtEn}>{entry.suggestions_en}</Text> : null}
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={S.footer} fixed>
              <Text style={S.footerTxt}>MSA Education · Mindful · Supportive · Adaptive</Text>
              <Text style={S.footerTxt}>{student.full_name} — {report.period_label} | Sesi {idx + 1}</Text>
              <Text style={S.footerTxt}>Halaman {idx + 2}</Text>
            </View>
          </Page>
        );
      })}

      {/* ══════════════ LAST PAGE: MONTHLY SUMMARY ══════════════ */}
      <Page size="A4" style={S.page}>
        <View style={S.pageHdrPurple}>
          <View style={S.phRow}>
            <View style={{ flex: 1 }}>
              <Text style={S.phTitle}>Ringkasan Bulanan — {report.period_label} / Monthly Summary</Text>
              <Text style={S.phSub}>{student.full_name}  ·  {student.grade_level}  |  {totalSessions} Sesi  |  Tutor: {teacherName}</Text>
            </View>
            <View style={S.phBadge}><Text style={S.phBadgeTxt}>Laporan Akhir Bulan</Text></View>
          </View>
        </View>

        <View style={S.content}>
          {/* Stats */}
          <View style={S.statsRow}>
            <View style={S.statCard}>
              <Text style={S.statNum}>{totalSessions}</Text>
              <Text style={S.statLbl}>Total Sesi{"\n"}Total Sessions</Text>
            </View>
            <View style={S.statCard}>
              <Text style={[S.statNum, { fontSize: 18, color: C.amber }]}>{avgRating.toFixed(1)}/5</Text>
              <Text style={S.statLbl}>Rata-rata{"\n"}Avg Rating</Text>
            </View>
            <View style={S.statCard}>
              <Text style={[S.statNum, { color: C.green }]}>{attendance}%</Text>
              <Text style={S.statLbl}>Kehadiran{"\n"}Attendance</Text>
            </View>
          </View>

          {/* Session table */}
          <View style={S.secLabel}><Text style={S.secLabelTxt}>Rangkuman Semua Sesi / All Sessions Summary</Text></View>
          <View style={S.tblHdr}>
            <Text style={[S.tblHdrTxt, { width: 20 }]}>#</Text>
            <Text style={[S.tblHdrTxt, { width: 70 }]}>Tanggal</Text>
            <Text style={[S.tblHdrTxt, { flex: 1 }]}>Topik Utama</Text>
            <Text style={[S.tblHdrTxt, { width: 42 }]}>Durasi</Text>
            <Text style={[S.tblHdrTxt, { width: 55 }]}>Mood</Text>
            <Text style={[S.tblHdrTxt, { width: 55 }]}>Rating</Text>
          </View>
          {entries.map((e, i) => {
            const m = moodInfo(e.mood || "happy");
            const d = new Date(e.entry_date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
            return (
              <View key={e.id || i} style={i % 2 === 0 ? S.tblRow : S.tblRowAlt}>
                <Text style={[S.tblCell, { width: 20, fontWeight: 700 }]}>{i + 1}</Text>
                <Text style={[S.tblCell, { width: 70 }]}>{d}</Text>
                <Text style={[S.tblCell, { flex: 1 }]}>{(e.topics_taught || e.session_title || "-").substring(0, 45)}</Text>
                <Text style={[S.tblCell, { width: 42 }]}>{e.session_duration ? `${e.session_duration}m` : "-"}</Text>
                <Text style={[S.tblCell, { width: 55, color: m.color }]}>{m.text.split("/")[0].trim()}</Text>
                <Text style={[S.tblCellStar, { width: 55 }]}>{starsStr(e.overall_stars || 0)} {(e.overall_stars || 0).toFixed(1)}</Text>
              </View>
            );
          })}

          <View style={[S.divider, { marginTop: 16 }]} />

          {/* Domain progress bars */}
          <View style={S.secLabel}><Text style={S.secLabelTxt}>Progress per Domain / Domain Summary</Text></View>
          {DOMAINS.map((domain) => {
            const avg = domAvg(consolidatedScores, domain.cats);
            return (
              <View key={domain.key} style={S.progItem}>
                <View style={S.progInfo}>
                  <Text style={S.progLbl}>{domain.label_id}</Text>
                  <Text style={S.progLblEn}>{domain.label_en}</Text>
                  <View style={S.progWrap}>
                    <View style={[S.progBar, { width: `${(avg / 5) * 100}%`, backgroundColor: domain.color }]} />
                  </View>
                </View>
                <Text style={S.progVal}>{avg > 0 ? avg.toFixed(1) : "-"}</Text>
              </View>
            );
          })}

          <View style={S.divider} />

          {/* Summary cards */}
          {report.summary && (
            <View style={[S.sumCard, { borderLeftColor: C.sky }]}>
              <Text style={[S.sumTitle, { color: C.skyDark }]}>Ringkasan / Summary</Text>
              <Text style={S.sumTxt}>{report.summary}</Text>
              {report.summary_en && <Text style={S.sumTxtEn}>{report.summary_en}</Text>}
            </View>
          )}
          {report.achievements && (
            <View style={[S.sumCard, { borderLeftColor: C.amber }]}>
              <Text style={[S.sumTitle, { color: "#d97706" }]}>Pencapaian / Achievements</Text>
              <Text style={S.sumTxt}>{report.achievements}</Text>
              {report.achievements_en && <Text style={S.sumTxtEn}>{report.achievements_en}</Text>}
            </View>
          )}
          {report.recommendations && (
            <View style={[S.sumCard, { borderLeftColor: C.green }]}>
              <Text style={[S.sumTitle, { color: C.green }]}>Rekomendasi / Recommendations</Text>
              <Text style={S.sumTxt}>{report.recommendations}</Text>
              {report.recommendations_en && <Text style={S.sumTxtEn}>{report.recommendations_en}</Text>}
            </View>
          )}
          {report.goals_next_month && (
            <View style={[S.sumCard, { borderLeftColor: C.purple }]}>
              <Text style={[S.sumTitle, { color: C.purple }]}>Target Bulan Depan / Next Month Goals</Text>
              <Text style={S.sumTxt}>{report.goals_next_month}</Text>
              {report.goals_next_month_en && <Text style={S.sumTxtEn}>{report.goals_next_month_en}</Text>}
            </View>
          )}

          {/* Signatures */}
          <View style={S.sigRow}>
            <View style={S.sigItem}>
              <View style={S.sigLine} />
              <Text style={S.sigName}>{teacherName}</Text>
              <Text style={S.sigRole}>Guru / Teacher</Text>
            </View>
            <View style={S.sigItem}>
              <View style={S.sigLine} />
              <Text style={S.sigName}>Orang Tua / Parent</Text>
              <Text style={S.sigRole}>Tanda Tangan</Text>
            </View>
            <View style={S.sigItem}>
              <View style={S.sigLine} />
              <Text style={S.sigName}>MSA Education</Text>
              <Text style={S.sigRole}>Management</Text>
            </View>
          </View>
        </View>

        <View style={S.footer} fixed>
          <Text style={S.footerTxt}>MSA Education · Mindful · Supportive · Adaptive</Text>
          <Text style={S.footerTxt}>{student.full_name} — {report.period_label}</Text>
          <Text style={S.footerTxt}>Halaman {entries.length + 2}</Text>
        </View>
      </Page>
    </Document>
  );
}
