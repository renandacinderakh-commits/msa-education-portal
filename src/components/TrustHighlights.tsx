"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { trustHighlights } from "@/lib/content";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type IconName = keyof typeof LucideIcons;

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart: LucideIcons.Heart,
  Sparkles: LucideIcons.Sparkles,
  Sun: LucideIcons.Sun,
  MessageCircleHeart: LucideIcons.MessageCircleHeart,
  ShieldCheck: LucideIcons.ShieldCheck,
  Users: LucideIcons.Users,
  HeartHandshake: LucideIcons.HeartHandshake,
  GraduationCap: LucideIcons.GraduationCap,
  Puzzle: LucideIcons.Puzzle,
};

const cardColors = [
  "from-teal-50 to-emerald-50 border-teal-100 dark:from-slate-800 dark:to-slate-800 dark:border-slate-700",
  "from-sunflower-50 to-peach-50 border-sunflower-100 dark:from-slate-800 dark:to-slate-800 dark:border-slate-700",
  "from-sky-50 to-blue-50 border-sky-100 dark:from-slate-800 dark:to-slate-800 dark:border-slate-700",
  "from-purple-50 to-fuchsia-50 border-purple-100 dark:from-slate-800 dark:to-slate-800 dark:border-slate-700",
];

const iconColors = [
  "text-teal-500 bg-teal-100 dark:bg-teal-900/40",
  "text-sunflower-500 bg-sunflower-100 dark:bg-yellow-900/40",
  "text-sky-500 bg-sky-100 dark:bg-sky-900/40",
  "text-purple-500 bg-purple-100 dark:bg-purple-900/40",
];

export default function TrustHighlights() {
  const { t, langCode } = useLanguage();

  const getSubtitle = () => {
    if (langCode === 'en') return "Why Choose MSA Education";
    if (langCode === 'zh-CN') return "为何选择 MSA Education";
    return "Mengapa MSA Education";
  };

  const getTitle = () => {
    if (langCode === 'en') return "A Distinct Learning Assistance";
    if (langCode === 'zh-CN') return "卓越的学习辅导体验";
    return "Pendampingan Belajar yang Berbeda";
  };

  const getDescription = () => {
    if (langCode === 'en') return "We believe every child is unique. With a warm and personalized approach, we ensure each child gets the best learning experience.";
    if (langCode === 'zh-CN') return "我们相信每个孩子都是独一无二的。通过温暖和个性化的方式，我们确保每个孩子都能获得最佳的学习体验。";
    return "Kami percaya bahwa setiap anak unik. Dengan pendekatan yang personal dan hangat, kami memastikan setiap anak mendapatkan pengalaman belajar terbaik.";
  };

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={getSubtitle()}
          title={getTitle()}
          description={getDescription()}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.trustHighlights.map((item: any, index: number) => {
            const IconComponent = iconMap[item.icon] || LucideIcons.Star;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative p-6 rounded-[var(--radius-card)] bg-gradient-to-br ${cardColors[index]} border hover:shadow-[var(--shadow-card-hover)] transition-all duration-300`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${iconColors[index]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
