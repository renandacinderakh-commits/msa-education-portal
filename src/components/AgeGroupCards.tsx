"use client";

import { motion } from "framer-motion";
import { Baby, Palette, BookOpen, GraduationCap } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby,
  Palette,
  BookOpen,
  GraduationCap,
};

const colorMap: Record<string, { bg: string; text: string; accent: string; border: string }> = {
  peach: {
    bg: "bg-gradient-to-br from-peach-50 to-coral-50",
    text: "text-peach-600",
    accent: "bg-peach-100",
    border: "border-peach-200/60",
  },
  mint: {
    bg: "bg-gradient-to-br from-mint-50 to-teal-50",
    text: "text-teal-600",
    accent: "bg-teal-100",
    border: "border-teal-200/60",
  },
  sky: {
    bg: "bg-gradient-to-br from-sky-50 to-blue-50",
    text: "text-sky-600",
    accent: "bg-sky-100",
    border: "border-sky-200/60",
  },
  yellow: {
    bg: "bg-gradient-to-br from-sunflower-50 to-amber-50",
    text: "text-amber-600",
    accent: "bg-sunflower-100",
    border: "border-sunflower-200/60",
  },
};

export default function AgeGroupCards() {
  const { t, langCode } = useLanguage();

  const getSubtitle = () => {
    if (langCode === 'en') return "Age Groups";
    if (langCode === 'zh-CN') return "年龄段";
    return "Kelompok Usia";
  };

  const getTitle = () => {
    if (langCode === 'en') return "Programs for Every Stage of Development";
    if (langCode === 'zh-CN') return "每个成长阶段的计划";
    return "Program untuk Setiap Tahap Tumbuh Kembang";
  };

  const getDescription = () => {
    if (langCode === 'en') return "Each age group has a different learning approach. We tailor methods and materials to the child's developmental stage.";
    if (langCode === 'zh-CN') return "每个年龄段都有不同的学习方法。我们根据孩子的发展阶段量身定制教学方法和材料。";
    return "Setiap kelompok usia memiliki pendekatan belajar yang berbeda. Kami menyesuaikan metode dan materi sesuai tahap perkembangan anak.";
  };

  const approachLabel = langCode === 'en' ? "Approach:" : langCode === 'zh-CN' ? "教学方法:" : "Pendekatan:";

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={getSubtitle()}
          title={getTitle()}
          description={getDescription()}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.ageGroups.map((group: any, index: number) => {
            const IconComponent = iconMap[group.icon] || BookOpen;
            const colors = colorMap[group.color] || colorMap.sky;

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative p-6 rounded-[var(--radius-card)] ${colors.bg} border ${colors.border} hover:shadow-[var(--shadow-card-hover)] transition-all duration-300`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${colors.accent} ${colors.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  {group.label}
                </h3>
                <p className={`text-xs font-medium ${colors.text} mb-3`}>
                  {group.ageRange}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {group.description}
                </p>
                <div className={`p-3 rounded-xl ${colors.accent}/50`}>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    <span className={`font-semibold ${colors.text}`}>{approachLabel}</span>{" "}
                    {group.approach}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
